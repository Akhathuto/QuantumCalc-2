import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, DocumentSnapshot, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  accessToken: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('google_access_token');
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeUserDocRef = useRef<(() => void) | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Clear existing subscription
      if (unsubscribeUserDocRef.current) {
        unsubscribeUserDocRef.current();
        unsubscribeUserDocRef.current = null;
      }

      setUser(currentUser);
      
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        
        unsubscribeUserDocRef.current = onSnapshot(userRef, async (docSnap: DocumentSnapshot) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setLoading(false);
          } else {
            const initialData: any = {
              uid: currentUser.uid,
              email: currentUser.email || 'no-email@example.com',
              onboarded: false,
              createdAt: serverTimestamp()
            };
            if (currentUser.displayName) initialData.displayName = currentUser.displayName;
            if (currentUser.photoURL) initialData.photoURL = currentUser.photoURL;
            
            try {
              await setDoc(userRef, initialData);
              setUserData(initialData);
              setLoading(false);
            } catch (err: any) {
              setLoading(false);
              setError(`Database initialization failed: ${err.message}`);
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
            }
          }
        }, (err: any) => {
          setLoading(false);
          setError(`Database connection failed: ${err.message}`);
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        });
      } else {
        setUserData(null);
        setAccessToken(null);
        try {
          localStorage.removeItem('google_access_token');
        } catch (e) {
          // Ignore error
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDocRef.current) unsubscribeUserDocRef.current();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.appdata');
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        try {
          localStorage.setItem('google_access_token', credential.accessToken);
        } catch (e) {
          // Ignore error
        }
      }
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in cancelled by user.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized for Google Sign-in. Please contact support.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error: Please check your internet connection and ensure third-party cookies/data are allowed for this site. Some ad-blockers or tracking protection settings can also interfere with Google sign-in.");
      } else {
        setError(err.message || "An unexpected error occurred during sign-in.");
        console.error("Error signing in with Google", err);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAccessToken(null);
      setError(null);
      try {
        localStorage.removeItem('google_access_token');
      } catch (e) {
        // Ignore error
      }
    } catch (err) {
      console.error("Error signing out", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, accessToken, loading, error, signInWithGoogle, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
