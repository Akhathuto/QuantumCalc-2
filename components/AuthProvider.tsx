import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, DocumentSnapshot, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  accessToken: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  accessToken: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('google_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Subscribe to user profile in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        
        unsubscribeUserDoc = onSnapshot(userRef, async (docSnap: DocumentSnapshot) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            // Initial profile creation
            const initialData: any = {
              uid: currentUser.uid,
              email: currentUser.email,
              onboarded: false,
              createdAt: serverTimestamp()
            };
            if (currentUser.displayName) initialData.displayName = currentUser.displayName;
            if (currentUser.photoURL) initialData.photoURL = currentUser.photoURL;
            try {
              await setDoc(userRef, initialData);
              setUserData(initialData);
            } catch (error) {
              console.error("Error creating user profile:", error);
            }
          }
          setLoading(false);
        }, (error: Error) => {
          console.error("Error listening to user profile:", error);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setAccessToken(null);
        localStorage.removeItem('google_access_token');
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        localStorage.setItem('google_access_token', credential.accessToken);
      }
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in cancelled by user.");
      } else {
        console.error("Error signing in with Google", error);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAccessToken(null);
      localStorage.removeItem('google_access_token');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, accessToken, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
