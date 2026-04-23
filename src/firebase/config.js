// src/firebase/config.js
// Replace these values with your actual Firebase project configuration
// Get them from: Firebase Console > Project Settings > General > Your Apps

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDvYBzh7UaeqDCu4k_pKKxi8_P8KmFVbx4",
  authDomain: "pbm-app-78923.firebaseapp.com",
  projectId: "pbm-app-78923",
  storageBucket: "pbm-app-78923.firebasestorage.app",
  messagingSenderId: "63809071050",
  appId: "1:63809071050:web:9ebe605a7a83a809bf5133"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;