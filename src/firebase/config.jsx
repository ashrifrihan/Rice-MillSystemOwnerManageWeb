// src/firebase/config.jsx
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Firebase configuration loaded from environment variables
// These should be defined in .env or .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

// Validate required environment variables at startup
const requiredVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID'];
const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ CRITICAL: Missing Firebase environment variables:', missingVars.join(', '));
  console.error('   Please ensure .env.local contains these variables.');
}

// Initialize Firebase - check if already initialized (prevents duplicate app error during hot reload)
let app;
const existingApps = getApps();
if (existingApps.length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized');
} else {
  app = existingApps[0];
  console.log('✅ Firebase already initialized');
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

export default app;