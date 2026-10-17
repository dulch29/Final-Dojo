import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDVi0rTsibUsSnmDncEGk8Vs3UcvWg7KsE",
  authDomain: "paysplit-catix.firebaseapp.com",
  projectId: "paysplit-catix",
  storageBucket: "paysplit-catix.firebasestorage.app",
  messagingSenderId: "663484062487",
  appId: "1:663484062487:web:248ed66b8018522195f552"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
