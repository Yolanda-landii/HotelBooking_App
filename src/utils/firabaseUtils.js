// src/utils/firebaseUtils.js
import { getDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Function to get user profile data
export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.data();
}

// Function to update user profile data
export async function updateProfile(uid, profileData) {
  await setDoc(doc(db, 'users', uid), profileData, { merge: true });
}

// Existing function
export async function checkAdminStatus(user) {
  if (!user) return false;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data();
  
  return userData?.role === 'admin';
}
