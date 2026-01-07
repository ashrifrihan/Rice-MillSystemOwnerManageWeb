import React, { useState, useEffect } from 'react';
import { rtdb as db } from '../firebase/config';
import { ref, onValue, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  UserCircleIcon, 
  MailIcon, 
  PhoneIcon, 
  MapPinIcon, 
  BuildingIcon, 
  EditIcon,
  CalendarIcon,
  FileTextIcon,
  AwardIcon,
  ShieldIcon,
  BadgeCheckIcon,
  XIcon,
  SaveIcon,
  UploadIcon,
  CameraIcon
} from 'lucide-react';

export function Profile() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // State for profile data
  const [profileData, setProfileData] = useState({
    personal: {
      fullName: '',
      email: '',
      phone: '',
      dob: ''
    },
    business: {
      businessName: '',
      gstNumber: '',
      businessAddress: '',
      established: '',
      businessType: ''
    },
    additional: {
      primaryBusiness: '',
      annualTurnover: '',
      employees: '',
      certifications: ''
    }
  });
  
  const [stats, setStats] = useState({
    memberSince: '',
    totalOrders: 0,
    activePlan: 'Free'
  });
  
  // Load profile data from Firebase
  useEffect(() => {
    if (!user?.uid) return;
    
    setLoading(true);
    const userRef = ref(db, `users/${user.uid}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        setProfileData({
          personal: {
            fullName: data?.name || data?.fullName || '',
            email: data?.email || user?.email || '',
            phone: data?.phone || data?.contact || '',
            dob: data?.dob || data?.dateOfBirth || ''
          },
          business: {
            businessName: data?.businessName || data?.millName || '',
            gstNumber: data?.gstNumber || '',
            businessAddress: data?.businessAddress || data?.address || '',
            established: data?.established || data?.establishedYear || '',
            businessType: data?.businessType || 'Private Limited'
          },
          additional: {
            primaryBusiness: data?.primaryBusiness || 'Rice Milling & Distribution',
            annualTurnover: data?.annualTurnover || '',
            employees: data?.employees || data?.employeeCount || '',
            certifications: data?.certifications || ''
          }
        });
        
        setStats({
          memberSince: data?.createdAt ? new Date(data.createdAt).getFullYear() : new Date().getFullYear(),
          totalOrders: data?.totalOrders || 0,
          activePlan: data?.plan || 'Premium'
        });
        
        if (data?.profileImage) {
          setProfileImage(data.profileImage);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      toast.error('Failed to load profile data');
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  // State for edit modals
  const [editPersonal, setEditPersonal] = useState(false);
  const [editBusiness, setEditBusiness] = useState(false);
  const [editAdditional, setEditAdditional] = useState(false);
  const [editProfileImage, setEditProfileImage] = useState(false);

  // State for form data
  const [personalForm, setPersonalForm] = useState({});
  const [businessForm, setBusinessForm] = useState({});
  const [additionalForm, setAdditionalForm] = useState({});
  const [profileImage, setProfileImage] = useState(null);

  // Sync form states with profileData when it updates from Firebase
  useEffect(() => {
    setPersonalForm(profileData.personal);
    setBusinessForm(profileData.business);
    setAdditionalForm(profileData.additional);
  }, [profileData]);

  // Handle personal info form changes
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle business info form changes
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle additional info form changes
  const handleAdditionalChange = (e) => {
    const { name, value } = e.target;
    setAdditionalForm(prev => ({ ...prev, [name]: value }));
  };

  // Save personal info
  const savePersonalInfo = async () => {
    if (!user?.uid) return;
    
    try {
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        name: personalForm.fullName,
        fullName: personalForm.fullName,
        email: personalForm.email,
        phone: personalForm.phone,
        contact: personalForm.phone,
        dob: personalForm.dob,
        dateOfBirth: personalForm.dob,
        updatedAt: new Date().toISOString()
      });
      
      setProfileData(prev => ({ ...prev, personal: personalForm }));
      setEditPersonal(false);
      toast.success('Personal information updated successfully!');
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast.error('Failed to update personal information');
    }
  };

  // Save business info
  const saveBusinessInfo = async () => {
    if (!user?.uid) return;
    
    try {
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        businessName: businessForm.businessName,
        millName: businessForm.businessName,
        gstNumber: businessForm.gstNumber,
        businessAddress: businessForm.businessAddress,
        address: businessForm.businessAddress,
        established: businessForm.established,
        establishedYear: businessForm.established,
        businessType: businessForm.businessType,
        updatedAt: new Date().toISOString()
      });
      
      setProfileData(prev => ({ ...prev, business: businessForm }));
      setEditBusiness(false);
      toast.success('Business information updated successfully!');
    } catch (error) {
      console.error('Error updating business info:', error);
      toast.error('Failed to update business information');
    }
  };

  // Save additional info
  const saveAdditionalInfo = async () => {
    if (!user?.uid) return;
    
    try {
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        primaryBusiness: additionalForm.primaryBusiness,
        annualTurnover: additionalForm.annualTurnover,
        employees: additionalForm.employees,
        employeeCount: additionalForm.employees,
        certifications: additionalForm.certifications,
        updatedAt: new Date().toISOString()
      });
      
      setProfileData(prev => ({ ...prev, additional: additionalForm }));
      setEditAdditional(false);
      toast.success('Additional information updated successfully!');
    } catch (error) {
      console.error('Error updating additional info:', error);
      toast.error('Failed to update additional information');
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      toast.loading('Uploading profile image...');
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64String = event.target.result.split(',')[1];
          
          // Call Firebase Cloud Function to handle upload
          const response = await fetch('https://us-central1-ricemill-lk.cloudfunctions.net/uploadProfileImage', {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await user.getIdToken()}`
            },
            body: JSON.stringify({
              uid: user.uid,
              fileName: file.name,
              fileType: file.type,
              base64Data: base64String,
              timestamp: Date.now()
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
          }
          
          const data = await response.json();
          const downloadURL = data.downloadURL;
          
          // Update user profile in database
          const userRef = ref(db, `users/${user.uid}`);
          await update(userRef, {
            profileImage: downloadURL,
            updatedAt: new Date().toISOString()
          });
          
          setProfileImage(downloadURL);
          setEditProfileImage(false);
          toast.dismiss();
          toast.success('Profile image updated successfully!');
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.dismiss();
          toast.error(error.message || 'Failed to upload profile image');
        }
      };
      
      reader.onerror = () => {
        toast.dismiss();
        toast.error('Failed to read file');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.dismiss();
      toast.error('Failed to process profile image');
    }
  };

  // Reset forms when modals are closed
  const resetForms = () => {
    setPersonalForm(profileData.personal);
    setBusinessForm(profileData.business);
    setAdditionalForm(profileData.additional);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal and business information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 sm:mb-0 sm:mr-6">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    'RO'
                  )}
                </div>
                <button 
                  className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  onClick={() => setEditProfileImage(true)}
                >
                  <CameraIcon className="h-4 w-4 text-blue-600" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start">
                  <h2 className="text-2xl font-bold">{profileData.personal.fullName}</h2>
                  <BadgeCheckIcon className="h-5 w-5 ml-2 text-blue-200" />
                </div>
                <p className="text-blue-100">Rice Mill Owner & CEO</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 gap-4">
                  <p className="flex items-center text-blue-100">
                    <MailIcon className="h-4 w-4 mr-2" />
                    {profileData.personal.email}
                  </p>
                  <p className="flex items-center text-blue-100">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {profileData.personal.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Personal Information */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Personal Information
                </h3>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  onClick={() => {
                    setPersonalForm(profileData.personal);
                    setEditPersonal(true);
                  }}
                >
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                  <p className="text-gray-900 font-medium">{profileData.personal.fullName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                  <p className="text-gray-900 font-medium">{profileData.personal.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                  <p className="text-gray-900 font-medium">{profileData.personal.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <CalendarIcon className="h-3 w-3 inline mr-1" />
                    Date of Birth
                  </p>
                  <p className="text-gray-900 font-medium">{profileData.personal.dob}</p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BuildingIcon className="h-5 w-5 mr-2 text-green-500" />
                  Business Information
                </h3>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  onClick={() => {
                    setBusinessForm(profileData.business);
                    setEditBusiness(true);
                  }}
                >
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business Name</p>
                  <p className="text-gray-900 font-medium">{profileData.business.businessName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <FileTextIcon className="h-3 w-3 inline mr-1" />
                    GST Number
                  </p>
                  <p className="text-gray-900 font-medium">{profileData.business.gstNumber}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <MapPinIcon className="h-3 w-3 inline mr-1" />
                    Business Address
                  </p>
                  <p className="text-gray-900 font-medium">
                    {profileData.business.businessAddress}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <AwardIcon className="h-3 w-3 inline mr-1" />
                    Established
                  </p>
                  <p className="text-gray-900 font-medium">{profileData.business.established}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <ShieldIcon className="h-3 w-3 inline mr-1" />
                    Business Type
                  </p>
                  <p className="text-gray-900 font-medium">{profileData.business.businessType}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AwardIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Additional Details
                </h3>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  onClick={() => {
                    setAdditionalForm(profileData.additional);
                    setEditAdditional(true);
                  }}
                >
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Business</p>
                  <p className="text-gray-900 font-medium">{profileData.additional.primaryBusiness}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Annual Turnover</p>
                  <p className="text-gray-900 font-medium">{profileData.additional.annualTurnover}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employees</p>
                  <p className="text-gray-900 font-medium">{profileData.additional.employees}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Certifications</p>
                  <p className="text-gray-900 font-medium">{profileData.additional.certifications}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                <p className="text-lg font-semibold text-gray-900">{stats.memberSince || 'N/A'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <FileTextIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                <p className="text-lg font-semibold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                <AwardIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Plans</h3>
                <p className="text-lg font-semibold text-gray-900">{stats.activePlan}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Personal Information Modal */}
      {editPersonal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Personal Information</h3>
              <button onClick={() => { setEditPersonal(false); resetForms(); }}>
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={personalForm.fullName || ''}
                  onChange={handlePersonalChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={personalForm.email || ''}
                  onChange={handlePersonalChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={personalForm.phone || ''}
                  onChange={handlePersonalChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="text"
                  name="dob"
                  value={personalForm.dob || ''}
                  onChange={handlePersonalChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => { setEditPersonal(false); resetForms(); }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                onClick={savePersonalInfo}
              >
                <SaveIcon className="h-4 w-4 mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Business Information Modal */}
      {editBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Business Information</h3>
              <button onClick={() => { setEditBusiness(false); resetForms(); }}>
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={businessForm.businessName || ''}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={businessForm.gstNumber || ''}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <textarea
                  name="businessAddress"
                  value={businessForm.businessAddress || ''}
                  onChange={handleBusinessChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                <input
                  type="text"
                  name="established"
                  value={businessForm.established || ''}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <select
                  name="businessType"
                  value={businessForm.businessType || 'Private Limited'}
                  onChange={handleBusinessChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Private Limited">Private Limited</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="LLP">Limited Liability Partnership</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => { setEditBusiness(false); resetForms(); }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                onClick={saveBusinessInfo}
              >
                <SaveIcon className="h-4 w-4 mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Additional Information Modal */}
      {editAdditional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Additional Information</h3>
              <button onClick={() => { setEditAdditional(false); resetForms(); }}>
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Business</label>
                <input
                  type="text"
                  name="primaryBusiness"
                  value={additionalForm.primaryBusiness || ''}
                  onChange={handleAdditionalChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Turnover</label>
                <input
                  type="text"
                  name="annualTurnover"
                  value={additionalForm.annualTurnover || ''}
                  onChange={handleAdditionalChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
                <input
                  type="text"
                  name="employees"
                  value={additionalForm.employees || ''}
                  onChange={handleAdditionalChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                <input
                  type="text"
                  name="certifications"
                  value={additionalForm.certifications || ''}
                  onChange={handleAdditionalChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => { setEditAdditional(false); resetForms(); }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
                onClick={saveAdditionalInfo}
              >
                <SaveIcon className="h-4 w-4 mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Image Modal */}
      {editProfileImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Update Profile Picture</h3>
              <button onClick={() => setEditProfileImage(false)}>
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  'RO'
                )}
              </div>
              <label className="cursor-pointer">
                <div className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center">
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload New Photo
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
              <p className="text-sm text-gray-500">Recommended: Square JPG, PNG, at least 200x200 pixels</p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => setEditProfileImage(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={() => setEditProfileImage(false)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}