import { getDoc, setDoc, doc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../config/firebase'; // Ensure you export `storage` from your Firebase config

// Function to get user profile data
export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() : null;
}

// Function to update user profile data
export async function updateProfile(uid, profileData) {
  await setDoc(doc(db, 'users', uid), profileData, { merge: true });
}

// Function to check admin status
export async function checkAdminStatus(user) {
  if (!user) return false;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data();

  return userData?.role === 'admin';
}

// Function to upload a profile picture and get the download URL
export async function uploadProfilePicture(uid, file) {
  const storageRef = ref(storage, `profilePictures/${uid}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}
