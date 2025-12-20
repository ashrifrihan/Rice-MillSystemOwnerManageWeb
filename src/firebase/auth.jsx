// Firebase Authentication
// This is a stub for Firebase authentication
// In a real app, you would import and initialize Firebase here
export const signIn = async (email, password) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // For demo purposes, accept any valid-looking email and password
  if (email && password && password.length >= 6) {
    return {
      user: {
        uid: '123456',
        email,
        displayName: 'Rice Mill Owner'
      }
    };
  }
  throw new Error('Invalid email or password');
};
export const signInWithGoogle = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Return mock user
  return {
    user: {
      uid: '123456',
      email: 'owner@ricemill.com',
      displayName: 'Rice Mill Owner',
      photoURL: 'https://via.placeholder.com/150'
    }
  };
};
export const signOut = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};
export const onAuthStateChanged = callback => {
  // Simulate checking auth state
  setTimeout(() => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    callback(user);
  }, 1000);
  // Return unsubscribe function
  return () => {};
};
export const createUser = async (email, password) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (email && password && password.length >= 6) {
    return {
      user: {
        uid: '123456',
        email,
        displayName: null
      }
    };
  }
  throw new Error('Invalid email or password');
};
export const updateProfile = async (user, data) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    ...user,
    ...data
  };
};