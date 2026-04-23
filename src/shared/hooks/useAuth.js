// src/shared/hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
          setUserData(userDoc.data());
          } else {
          setUserData(null);
          }
        } catch (e) {
          console.error('Error fetching user data:', e);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async ({ name, mobile, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const data = {
      name,
      mobile,
      email,
      role: 'customer',
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, 'users', cred.user.uid), data);
    setUserData(data);
    return cred;
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userData, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
