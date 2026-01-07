// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { ref, get, set, update } from "firebase/database";
import { auth, rtdb as db } from "../firebase/config.jsx";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [ownerMill, setOwnerMill] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allOwners, setAllOwners] = useState([]);

  // Fetch all owner users
  const fetchAllOwners = useCallback(async () => {
    try {
      console.log("Fetching owners from database...");
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        const ownersArray = [];
        
        Object.entries(users).forEach(([id, data]) => {
          if (data && (data.role === 'owner' || data.role === 'mill_owner')) {
            ownersArray.push({
              id,
              ...data
            });
          }
        });
        
        console.log(`Loaded ${ownersArray.length} owners`);
        setAllOwners(ownersArray);
        return ownersArray;
      }
      setAllOwners([]);
      return [];
    } catch (error) {
      // Handle permission denied and other errors gracefully
      if (error.code === 'PERMISSION_DENIED') {
        console.warn("Permission denied accessing users data. This is expected if Firebase rules restrict user data access.", error);
      } else {
        console.error("Error fetching owners:", error);
      }
      // Don't throw error, just return empty array
      setAllOwners([]);
      return [];
    }
  }, []);

  // Find owner by email
  const findOwnerByEmail = useCallback(async (email) => {
    try {
      const searchEmail = email.toLowerCase().trim();
      console.log(`Searching for owner: ${searchEmail}`);
      
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        
        for (const [userId, userData] of Object.entries(users)) {
          if (userData && userData.email && userData.email.toLowerCase() === searchEmail) {
            // Check if user is an owner
            if (userData.role === 'owner' || userData.role === 'mill_owner') {
              console.log(`Found owner: ${userData.name} (${userId})`);
              return { 
                userId, 
                userData 
              };
            } else {
              console.log(`User found but not an owner. Role: ${userData.role}`);
              return null;
            }
          }
        }
      }
      
      console.log(`Owner ${searchEmail} not found`);
      return null;
    } catch (error) {
      console.error("Error finding owner:", error);
      return null;
    }
  }, []);

  // Get owner's rice mill
  const getOwnerMill = useCallback(async (ownerId) => {
    try {
      console.log(`Fetching mill for owner: ${ownerId}`);
      
      // Check in rice_mills collection
      const millsRef = ref(db, 'rice_mills');
      const millsSnapshot = await get(millsRef);
      
      if (millsSnapshot.exists()) {
        const mills = millsSnapshot.val();
        
        for (const [millId, millData] of Object.entries(mills)) {
          if (millData && (millData.owner_id === ownerId || 
              millData.owner_uid === ownerId || 
              millData.owner_email)) {
            
            // Get full owner details
            const ownerRef = ref(db, `users/${ownerId}`);
            const ownerSnapshot = await get(ownerRef);
            
            const millWithOwner = {
              id: millId,
              ...millData,
              owner: ownerSnapshot.exists() ? ownerSnapshot.val() : null
            };
            
            console.log(`Found mill: ${millData.mill_name || millData.business_name}`);
            return millWithOwner;
          }
        }
      }
      
      console.log("No mill found for owner");
      return null;
    } catch (error) {
      console.error("Error fetching owner mill:", error);
      return null;
    }
  }, []);

  // Create Firebase Auth account for owner
  const createOwnerAuthAccount = useCallback(async (email, password, ownerInfo) => {
    try {
      console.log(`Creating Firebase Auth account for owner: ${email}`);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update owner record with Firebase UID
      const ownerRef = ref(db, `users/${ownerInfo.userId}`);
      await update(ownerRef, {
        firebaseUid: userCredential.user.uid,
        updatedAt: new Date().toISOString(),
        is_active: true
      });
      
      console.log(`Owner auth account created: ${userCredential.user.uid}`);
      return { success: true, userCredential };
    } catch (error) {
      console.error("Error creating owner auth account:", error);
      return { success: false, error };
    }
  }, []);

  // Owner login function - FIXED: Changed variable name to avoid conflict
  const loginOwner = async (email, password) => {
    try {
      console.log(`Owner login attempt: ${email}`);
      
      if (!email || !password) {
        return { success: false, message: "Email and password are required" };
      }

      const cleanedEmail = email.toLowerCase().trim();
      const cleanedPassword = password.trim();

      // Try Firebase Auth first (this allows login even if database entry missing)
      let userCredential;
      let ownerInfo = await findOwnerByEmail(cleanedEmail);
      
      // If no database entry, try auth login anyway
      if (!ownerInfo) {
        console.log(`Owner ${cleanedEmail} not found in database, trying auth login...`);
        
        try {
          userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, cleanedPassword);
          console.log("Auth login successful! Creating database entry...");
          
          // Create database entry for existing auth account
          const ownerId = `owner_${Date.now()}`;
          const newOwnerData = {
            email: cleanedEmail,
            name: cleanedEmail.split('@')[0],
            role: 'owner',
            firebaseUid: userCredential.user.uid,
            phone: "",
            business_name: `${cleanedEmail.split('@')[0]}'s Rice Mill`,
            address: "",
            is_active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          try {
            await set(ref(db, `users/${ownerId}`), newOwnerData);
            console.log(`✅ Database entry created: ${ownerId}`);
            
            // Create mill entry
            const millId = `mill_${Date.now()}`;
            const millData = {
              owner_id: ownerId,
              owner_uid: userCredential.user.uid,
              owner_email: cleanedEmail,
              owner_name: newOwnerData.name,
              mill_name: newOwnerData.business_name,
              business_name: newOwnerData.business_name,
              address: "",
              phone: "",
              email: cleanedEmail,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            await set(ref(db, `rice_mills/${millId}`), millData);
            await update(ref(db, `users/${ownerId}`), { mill_id: millId });
            
            ownerInfo = {
              userId: ownerId,
              userData: { ...newOwnerData, mill_id: millId }
            };
          } catch (dbError) {
            console.warn("Could not create database entry (permission denied), continuing with auth...", dbError);
            // Continue anyway - user can still access the app
            ownerInfo = {
              userId: `temp_${userCredential.user.uid}`,
              userData: newOwnerData
            };
          }
          
        } catch (authError) {
          console.log(`Auth login failed: ${authError.code}`);
          return { 
            success: false, 
            message: "Account not found. Please register or contact administrator." 
          };
        }
      }

      const { userId, userData } = ownerInfo;
      console.log(`Found owner: ${userData.name}`);

      // If we don't have userCredential yet, login now
      if (!userCredential) {
        try {
          userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, cleanedPassword);
          console.log("Owner Firebase Auth login successful");
          
        } catch (firebaseError) {
          console.log(`Firebase Auth error: ${firebaseError.code}`);
          
          // Auto-create auth account if missing
          if (firebaseError.code === 'auth/user-not-found' || 
              firebaseError.code === 'auth/invalid-credential') {
            
            console.log("Auto-creating Firebase Auth account for owner...");
            const createResult = await createOwnerAuthAccount(cleanedEmail, cleanedPassword, ownerInfo);
            
            if (!createResult.success) {
              return { 
                success: false, 
                message: "Failed to create authentication account. Please try again." 
              };
            }
            
            // Try login again after creating account
            userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, cleanedPassword);
          } else if (firebaseError.code === 'auth/wrong-password') {
            return { success: false, message: "Incorrect password. Try 'password123'" };
          } else {
            return { success: false, message: `Authentication error: ${firebaseError.message}` };
          }
        }
      }

      const firebaseUser = userCredential.user;

      // Get owner's mill
      const millData = await getOwnerMill(userId);

      const ownerProfile = {
        id: userId,
        uid: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: userData.name || firebaseUser.email.split('@')[0],
        role: 'owner',
        phone: userData.phone || "",
        business_name: userData.business_name || `${userData.name}'s Rice Mill`,
        address: userData.address || "",
        is_active: userData.is_active !== false,
        mill_id: millData?.id || null,
        mill_name: millData?.mill_name || millData?.business_name || `${userData.name}'s Rice Mill`,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log(`Owner login successful: ${ownerProfile.name}`);

      // Update state
      setUser(firebaseUser);
      setUserProfile(ownerProfile);
      setOwnerMill(millData);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem("owner", JSON.stringify(ownerProfile));
      localStorage.setItem("accessToken", firebaseUser.accessToken || "");
      localStorage.setItem("userRole", 'owner');
      if (millData) {
        localStorage.setItem("currentMill", JSON.stringify(millData));
      }

      return { 
        success: true, 
        user: ownerProfile,
        mill: millData,
        role: 'owner'
      };

    } catch (error) {
      console.error("Owner login error:", error);
      
      let message = "Login failed. Please try again.";
      if (error.code === "auth/wrong-password") {
        message = "Incorrect password. Try 'password123'";
      } else if (error.code === "auth/user-not-found") {
        message = "Owner account not found in authentication system.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      }
      
      return { success: false, message };
    }
  };

  // Create new owner account with mill
  const registerOwner = async (email, password, ownerData, millData) => {
    try {
      const cleanedEmail = email.toLowerCase().trim();
      
      // Check if owner already exists
      const existingOwner = await findOwnerByEmail(cleanedEmail);
      if (existingOwner) {
        return { success: false, message: "Owner already exists with this email" };
      }

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, cleanedEmail, password);
      const firebaseUser = userCredential.user;

      // Create owner in database
      const ownerId = `owner_${Date.now()}`;
      const ownerProfile = {
        email: cleanedEmail,
        name: ownerData.name || cleanedEmail.split('@')[0],
        role: 'owner',
        firebaseUid: firebaseUser.uid,
        phone: ownerData.phone || "",
        business_name: millData.business_name || ownerData.business_name || `${ownerData.name || cleanedEmail.split('@')[0]}'s Rice Mill`,
        address: ownerData.address || "",
        is_active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...ownerData
      };

      await set(ref(db, `users/${ownerId}`), ownerProfile);

      // Create rice mill entry
      const millId = `mill_${Date.now()}`;
      const fullMillData = {
        owner_id: ownerId,
        owner_uid: firebaseUser.uid,
        owner_email: cleanedEmail,
        owner_name: ownerData.name || cleanedEmail.split('@')[0],
        mill_name: millData.mill_name || `${ownerData.name || cleanedEmail.split('@')[0]}'s Rice Mill`,
        business_name: millData.business_name || `${ownerData.name || cleanedEmail.split('@')[0]}'s Rice Mill`,
        address: millData.address || "",
        phone: millData.phone || ownerData.phone || "",
        email: millData.email || cleanedEmail,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...millData
      };

      await set(ref(db, `rice_mills/${millId}`), fullMillData);

      // Update owner with mill_id
      await update(ref(db, `users/${ownerId}`), {
        mill_id: millId
      });

      ownerProfile.mill_id = millId;

      // Update state
      setUser(firebaseUser);
      setUserProfile(ownerProfile);
      setOwnerMill(fullMillData);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem("owner", JSON.stringify(ownerProfile));
      localStorage.setItem("accessToken", firebaseUser.accessToken || "");
      localStorage.setItem("userRole", 'owner');
      localStorage.setItem("currentMill", JSON.stringify(fullMillData));

      // Refresh owners list
      await fetchAllOwners();

      return {
        success: true,
        user: { ...ownerProfile, id: ownerId, uid: firebaseUser.uid },
        mill: fullMillData
      };
    } catch (error) {
      console.error("Owner registration error:", error);
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setOwnerMill(null);
      setIsAuthenticated(false);
      localStorage.removeItem("owner");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("currentMill");
      console.log("Owner logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = fbOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const ownerInfo = await findOwnerByEmail(firebaseUser.email);
          
          if (ownerInfo) {
            const { userData } = ownerInfo;
            const millData = await getOwnerMill(ownerInfo.userId);
            
            const ownerProfile = {
              id: ownerInfo.userId,
              uid: firebaseUser.uid,
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.email.split('@')[0],
              role: 'owner',
              phone: userData.phone || "",
              business_name: userData.business_name || `${userData.name || firebaseUser.email.split('@')[0]}'s Rice Mill`,
              address: userData.address || "",
              is_active: userData.is_active !== false,
              mill_id: millData?.id || null,
              mill_name: millData?.mill_name || millData?.business_name
            };
            
            setUser(firebaseUser);
            setUserProfile(ownerProfile);
            setOwnerMill(millData);
            setIsAuthenticated(true);
            
            localStorage.setItem("owner", JSON.stringify(ownerProfile));
            localStorage.setItem("accessToken", firebaseUser.accessToken || "");
            localStorage.setItem("userRole", 'owner');
            if (millData) {
              localStorage.setItem("currentMill", JSON.stringify(millData));
            }
          } else {
            // Not an owner, log out
            console.log("Not an owner account, logging out...");
            await logout();
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          await logout();
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setOwnerMill(null);
        setIsAuthenticated(false);
        localStorage.removeItem("owner");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("currentMill");
      }
      setIsLoading(false);
    });

    // Load owners on mount (disabled to avoid permission denied noise)
    // Enable with env flag VITE_ENABLE_OWNER_LIST = 'true'
    try {
      const enableOwnerList = import.meta.env && import.meta.env.VITE_ENABLE_OWNER_LIST === 'true';
      if (enableOwnerList) {
        fetchAllOwners();
      }
    } catch {}

    return unsubscribe;
  }, [fetchAllOwners, findOwnerByEmail, getOwnerMill]);

  const value = {
    user,
    userProfile,
    ownerMill,
    isAuthenticated,
    isLoading,
    allOwners,
    loginOwner,
    registerOwner,
    logout,
    findOwnerByEmail,
    getOwnerMill,
    fetchAllOwners
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};