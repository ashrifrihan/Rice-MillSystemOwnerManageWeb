// src/firebase/auth.jsx
import { 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';
import { auth, rtdb } from './config';

export async function signIn(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { user: cred.user, raw: cred };
  } catch (error) {
    throw error;
  }
}

export async function signOut() {   
  try {
    await fbSignOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
}

export function onAuthStateChanged(cb) {
  return fbOnAuthStateChanged(auth, cb);
}

export { createUserWithEmailAndPassword };