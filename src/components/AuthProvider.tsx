import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  DocumentSnapshot, 
  serverTimestamp,
  increment,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  totalScholars: number;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: (useRedirect?: boolean) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  totalScholars: 0,
  accessToken: null,
  loading: true,
  error: null,
  signInWithGoogle: async (_useRedirect?: boolean) => {},
  signUpWithEmail: async (_email: string, _password: string, _displayName: string) => {},
  signInWithEmail: async (_email: string, _password: string) => {},
  resetPassword: async (_email: string) => {},
  logout: async () => {},
  clearError: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [totalScholars, setTotalScholars] = useState(0);
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
  const unsubscribeStatsRef = useRef<(() => void) | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    // Listen to global stats
    const statsRef = doc(db, 'stats', 'globals');
    unsubscribeStatsRef.current = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setTotalScholars(docSnap.data().totalScholars || 0);
      }
    }, (err) => {
      console.error("Stats snapshot error:", err);
      // We don't want to block the app if stats fail, but we should know why
    });

    // Handle redirect result
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            setAccessToken(credential.accessToken);
            try {
              localStorage.setItem('google_access_token', credential.accessToken);
            } catch (e) {
              // Ignore error
            }
          }
        }
      } catch (err: any) {
        console.error('Error from redirect sign-in:', err);
        // Common in iframes/previews with third-party cookie restrictions or unwhitelisted domains
        if (err.code === 'auth/internal-error' || err.code === 'auth/network-request-failed') {
           console.warn('Silently ignoring redirect initialization error:', err.code);
        } else {
           // We do not set the error state globally on boot, as it blocks the user from email sign up
           console.warn('Unhandled redirect error:', err.message);
        }
      }
    };

    checkRedirect();

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
              
              // Increment global scholar count
              const statsRef = doc(db, 'stats', 'globals');
              const statsSnap = await getDoc(statsRef);
              if (statsSnap.exists()) {
                await updateDoc(statsRef, {
                  totalScholars: increment(1),
                  lastUpdated: serverTimestamp()
                });
              } else {
                await setDoc(statsRef, {
                  totalScholars: 1,
                  lastUpdated: serverTimestamp()
                });
              }
              
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
      if (unsubscribeStatsRef.current) unsubscribeStatsRef.current();
    };
  }, []);

  const signInWithGoogle = async (useRedirect = false) => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.appdata');
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.setCustomParameters({ prompt: 'select_account' });
    
    setLoading(true);
    setError(null);
    try {
      if (useRedirect) {
        await signInWithRedirect(auth, provider);
        return; // Redirecting...
      }

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
      console.group("Sign-in Failure Diagnostics");
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Current Hostname:", window.location.hostname);
      console.groupEnd();

      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in cancelled by user.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site or use the Redirect method.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`CRITICAL: Domain "${window.location.hostname}" is NOT authorized in Firebase Console. Please go to Authentication > Settings > Authorized domains and add "${window.location.hostname}".`);
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error: This can be caused by ad-blockers, browser privacy settings, or missing Authorized Domains in Firebase. Please try the 'Redirect Method' to bypass common popup restrictions.");
      } else if (err.code === 'auth/internal-error') {
        setError(`CRITICAL: 'auth/internal-error' usually means the domain "${window.location.hostname}" is NOT authorized. Please go to Firebase Console > Authentication > Settings > Authorized domains and add "${window.location.hostname}". Alternatively, your browser might be blocking third-party cookies or popups.`);
      } else {
        setError(`Authentication Error: ${err.message || "An unexpected error occurred"}. (Code: ${err.code})`);
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

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update display name on the auth user
      await updateProfile(userCredential.user, { displayName });
      
      // Create/set the user doc to make sure displayName is populated immediately
      const userRef = doc(db, 'users', userCredential.user.uid);
      const initialData: any = {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        onboarded: false,
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, initialData);

      // Increment global scholar count
      const statsRef = doc(db, 'stats', 'globals');
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        await updateDoc(statsRef, {
          totalScholars: increment(1),
          lastUpdated: serverTimestamp()
        });
      } else {
        await setDoc(statsRef, {
          totalScholars: 1,
          lastUpdated: serverTimestamp()
        });
      }
      
      setUserData(initialData);
    } catch (err: any) {
      setLoading(false);
      console.group("Sign-up Failure Diagnostics");
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.groupEnd();

      if (err.code === 'auth/email-already-in-use') {
        setError("This email address is already registered.");
      } else if (err.code === 'auth/weak-password') {
        setError("Your password should contain at least 6 characters.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/internal-error') {
        setError(`CRITICAL: 'auth/internal-error' may indicate that the domain "${window.location.hostname}" is NOT authorized. Please go to Firebase Console > Authentication > Settings > Authorized domains and add "${window.location.hostname}".`);
      } else {
        setError(err.message || "An unexpected error occurred during registration.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoading(false);
      console.group("Sign-in Failure Diagnostics");
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.groupEnd();

      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Incorrect email or password. Please try again.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/internal-error') {
        setError(`CRITICAL: 'auth/internal-error' may indicate that the domain "${window.location.hostname}" is NOT authorized. Please go to Firebase Console > Authentication > Settings > Authorized domains and add "${window.location.hostname}".`);
      } else {
        setError(err.message || "An unexpected error occurred during sign-in.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setLoading(false);
      console.error("Password reset error:", err);
      if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else {
        setError(err.message || "Failed to send reset email.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, totalScholars, accessToken, loading, error, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
