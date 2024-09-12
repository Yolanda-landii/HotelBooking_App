import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDET32Uq1jHS4Lf9JEV5GKb08NG17y5iPE",
  authDomain: "hotel-booking-app-932bd.firebaseapp.com",
  projectId: "hotel-booking-app-932bd",
  storageBucket: "hotel-booking-app-932bd.appspot.com",
  messagingSenderId: "520041531578",
  appId: "1:520041531578:web:148050e4b9925205b99a83",
  measurementId: "G-R0B9GF543T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);  


export { auth, db, storage, functions}; 
