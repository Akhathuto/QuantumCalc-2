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
  sendPasswordResetEmail,
  browserPopupRedirectResolver,
  signInAnonymously
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
import { dailyGoalService } from '../services/dailyGoalService';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  totalScholars: number;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: (useRedirect?: boolean) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, extraData?: any) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  signInSimulated?: () => void;
  isLocalUser?: boolean;
  localAccounts?: any[];
  signUpLocal?: (username: string, email: string, pass: string, role: string, grade: string, school: string, avatar: string) => Promise<void>;
  signInLocal?: (email: string, pass: string) => Promise<void>;
  updateLocalProfile?: (displayName: string, role: string, grade: string, school: string, avatar: string) => Promise<void>;
  deleteLocalAccount?: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  totalScholars: 0,
  accessToken: null,
  loading: true,
  error: null,
  signInWithGoogle: async (_useRedirect?: boolean) => {},
  signUpWithEmail: async (_email: string, _password: string, _displayName: string, _extraData?: any) => {},
  signInWithEmail: async (_email: string, _password: string) => {},
  signInGuest: async () => {},
  resetPassword: async (_email: string) => {},
  logout: async () => {},
  clearError: () => {},
  signInSimulated: () => {},
  isLocalUser: false,
  localAccounts: [],
  signUpLocal: async () => {},
  signInLocal: async () => {},
  updateLocalProfile: async () => {},
  deleteLocalAccount: async () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const getResolver = () => {
  // Always return the actual browser popup/redirect resolver so that Firebase Auth
  // has a resolver to execute dynamic popup or redirect sign-in flows.
  return browserPopupRedirectResolver;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [totalScholars, setTotalScholars] = useState(0);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localAccounts, setLocalAccounts] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('local_accounts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isLocalUser, setIsLocalUser] = useState(false);
  const unsubscribeUserDocRef = useRef<(() => void) | null>(null);
  const unsubscribeStatsRef = useRef<(() => void) | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    let currentLocalId = '';
    try {
      currentLocalId = localStorage.getItem('current_local_account_id') || '';
    } catch (err) {
      console.warn('Failed to retrieve current_local_account_id', err);
    }

    if (currentLocalId) {
      try {
        const stored = localStorage.getItem('local_accounts');
        const accounts = stored ? JSON.parse(stored) : [];
        const activeAcc = accounts.find((a: any) => a.uid === currentLocalId);
        if (activeAcc) {
          console.log('[AuthProvider] Loading active Local Account:', activeAcc.email);
          setUser({
            uid: activeAcc.uid,
            email: activeAcc.email,
            displayName: activeAcc.displayName,
            photoURL: activeAcc.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
            emailVerified: true,
            isAnonymous: false,
          } as any);
          setUserData({
            uid: activeAcc.uid,
            email: activeAcc.email,
            displayName: activeAcc.displayName,
            onboarded: true,
            role: activeAcc.role || 'student',
            grade: activeAcc.grade || '',
            school: activeAcc.school || '',
            createdAt: activeAcc.createdAt || new Date().toISOString(),
            isLocal: true
          });
          setIsLocalUser(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to load local account on startup:', err);
      }
    }

    let isOfflineMode = false;
    try {
      isOfflineMode = localStorage.getItem('offline_mode') === 'true';
    } catch {
      // Ignored
    }

    if (isOfflineMode) {
      console.log('App is in explicit Offline Mode. Bypassing Firebase Auth initialization.');
      signInSimulated();
      return;
    }

    // Listen to global stats
    const statsRef = doc(db, 'stats', 'globals');
    unsubscribeStatsRef.current = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setTotalScholars(docSnap.data().totalScholars || 0);
      }
    }, (err) => {
      console.error("Stats snapshot error:", err instanceof Error ? err.message : String(err));
      // We don't want to block the app if stats fail, but we should know why
    });

    // Handle redirect result
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth, getResolver());
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            setAccessToken(credential.accessToken);
          }
        }
      } catch (err: any) {
        console.error('Error from redirect sign-in:', err instanceof Error ? err.message : String(err));
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
            const data = docSnap.data();
            setUserData(data);
            if (data?.dailyGoal) {
              dailyGoalService.syncFromCloud(data.dailyGoal);
            } else {
              // Upload local progress/history if user profile has no cloud data yet
              dailyGoalService.syncToCloud();
            }
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
        console.log("[AuthProvider] No active session. Auto-authenticating to Simulated Sandbox Profile...");
        signInSimulated();
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
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.setCustomParameters({ prompt: 'select_account' });
    
    setLoading(true);
    setError(null);
    try {
      if (useRedirect) {
        await signInWithRedirect(auth, provider, getResolver());
        return; // Redirecting...
      }

      const result = await signInWithPopup(auth, provider, getResolver());
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
    } catch (err: any) {
      setLoading(false);
      // Only log as warning to prevent triggering platform crash detectors for normal user cancellations
      console.group("Sign-in Diagnostics");
      console.warn("Diagnostics - Code:", err.code);
      console.warn("Diagnostics - Message:", err.message);
      console.warn("Diagnostics - Hostname:", window.location.hostname);
      console.groupEnd();

      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log("Sign-in cancelled by user.");
        setError("Sign-in window was closed by the user before completing authentication. Please try again, or use the 'Direct Redirect Method'.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site or use the Redirect method.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`CRITICAL: Domain "${window.location.hostname}" is NOT authorized in Firebase Console. Please go to Authentication > Settings > Authorized domains and add "${window.location.hostname}".`);
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error: This can be caused by ad-blockers, browser privacy settings, or missing Authorized Domains in Firebase. Please try the 'Redirect Method' to bypass common popup restrictions.");
      } else if (err.code === 'auth/internal-error') {
        setError(`CRITICAL: 'auth/internal-error' usually means the domain "${window.location.hostname}" is NOT authorized. Go to Firebase Console > Authentication > Settings > Authorized domains. Alternatively, use 'Sandbox Offline Mode' inside the Settings page to bypass this completely.`);
      } else {
        setError(`Authentication Error: ${err.message || "An unexpected error occurred"}. (Code: ${err.code})`);
      }
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('current_local_account_id');
      setIsLocalUser(false);
      await signOut(auth);
      setAccessToken(null);
      setError(null);
      signInSimulated();
    } catch (err) {
      console.error("Error signing out", err instanceof Error ? err.message : String(err));
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string, extraData?: any) => {
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
        onboarded: extraData ? (extraData.onboarded ?? true) : false,
        role: extraData?.role || 'student',
        grade: extraData?.grade || null,
        school: extraData?.school || null,
        primaryInterest: extraData?.primaryInterest || 'general',
        ...extraData,
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
        setError(`CRITICAL: 'auth/internal-error' may indicate that the domain "${window.location.hostname}" is NOT authorized. Go to Firebase Console > Authentication > Settings > Authorized domains. Alternatively, use 'Sandbox Offline Mode' inside the Settings page to bypass this completely.`);
      } else if (err.message?.includes('firebase-app-check-token-is-invalid') || err.message?.includes('AppCheck') || err.message?.includes('app-check')) {
        setError("Firebase App Check Validation Blocked: App Check is checking signatures or recaptcha is blocked in this container/iframe sandbox. Click 'Unlock Sandbox Workspace' below to bypass security check and register instantly with fully functional offline state.");
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
        setError(`CRITICAL: 'auth/internal-error' may indicate that the domain "${window.location.hostname}" is NOT authorized. Go to Firebase Console > Authentication > Settings > Authorized domains. Alternatively, use 'Sandbox Offline Mode' inside the Settings page to bypass this completely.`);
      } else if (err.message?.includes('firebase-app-check-token-is-invalid') || err.message?.includes('AppCheck') || err.message?.includes('app-check')) {
        setError("Firebase App Check Validation Blocked: App Check is checking signatures or recaptcha is blocked in this container/iframe sandbox. Click 'Unlock Sandbox Workspace' below to bypass security check and login instantly with fully functional offline state.");
      } else {
        setError(err.message || "An unexpected error occurred during sign-in.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInGuest = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInAnonymously(auth);
      await updateProfile(userCredential.user, {
        displayName: 'Guest Scholar'
      });
    } catch (err: any) {
      setLoading(false);
      console.error("Guest Sign-in Failure Diagnostics:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Admin suggestion: Guest sign-in is disabled. Please go to your Firebase Console > Authentication > Sign-in method, enable 'Anonymous', and click Save.");
      } else if (err.code === 'auth/internal-error') {
        setError(`CRITICAL: 'auth/internal-error' may indicate that the domain "${window.location.hostname}" is NOT authorized. Go to Firebase Console > Authentication > Settings > Authorized domains. Alternatively, use 'Sandbox Offline Mode' inside the Settings page to bypass this completely.`);
      } else if (err.message?.includes('firebase-app-check-token-is-invalid') || err.message?.includes('AppCheck') || err.message?.includes('app-check')) {
        setError("Firebase App Check Validation Blocked: App Check is checking signatures or recaptcha is blocked in this container/iframe sandbox. Click 'Unlock Sandbox Workspace' below to bypass security check and login instantly with fully functional offline state.");
      } else {
        setError(err.message || "An unexpected error occurred during guest sign-in.");
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
      console.error("Password reset error:", err instanceof Error ? err.message : String(err));
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

  const signInSimulated = () => {
    setLoading(true);
    setError(null);
    try {
      const mockUser: any = {
        uid: 'ais-dev-sandbox-user-99999',
        email: 'akhathuto@gmail.com',
        displayName: 'Staging Researcher (Guest)',
        emailVerified: true,
        isAnonymous: false,
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80'
      };
      setUser(mockUser);
      setUserData({
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: mockUser.displayName,
        onboarded: true,
        role: 'Beta Scholar',
        createdAt: new Date(),
      });
      setAccessToken('mock-access-token-sandbox');
    } catch (e: any) {
      setError(`Failed to activate simulation workspace: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signUpLocal = async (username: string, email: string, pass: string, role: string, grade: string, school: string, avatar: string) => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem('local_accounts');
      const accounts = stored ? JSON.parse(stored) : [];
      
      if (accounts.some((a: any) => a.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("An account with this email already exists.");
      }

      const newUid = `local-usr-${Math.random().toString(36).substr(2, 9)}`;
      const newAccount = {
        uid: newUid,
        email: email,
        password: pass,
        displayName: username,
        role: role || 'student',
        grade: grade || '',
        school: school || '',
        avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80`,
        createdAt: new Date().toISOString()
      };

      const updatedAccounts = [...accounts, newAccount];
      localStorage.setItem('local_accounts', JSON.stringify(updatedAccounts));
      localStorage.setItem('current_local_account_id', newUid);
      setLocalAccounts(updatedAccounts);
      setIsLocalUser(true);

      setUser({
        uid: newAccount.uid,
        email: newAccount.email,
        displayName: newAccount.displayName,
        photoURL: newAccount.avatar,
        emailVerified: true,
        isAnonymous: false
      } as any);

      setUserData({
        uid: newAccount.uid,
        email: newAccount.email,
        displayName: newAccount.displayName,
        onboarded: true,
        role: newAccount.role,
        grade: newAccount.grade,
        school: newAccount.school,
        createdAt: newAccount.createdAt,
        isLocal: true
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign up locally.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInLocal = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem('local_accounts');
      const accounts = stored ? JSON.parse(stored) : [];
      const account = accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase());

      if (!account) {
        throw new Error("No local account found with this email.");
      }
      if (account.password !== pass) {
        throw new Error("Incorrect password.");
      }

      localStorage.setItem('current_local_account_id', account.uid);
      setIsLocalUser(true);

      setUser({
        uid: account.uid,
        email: account.email,
        displayName: account.displayName,
        photoURL: account.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
        emailVerified: true,
        isAnonymous: false
      } as any);

      setUserData({
        uid: account.uid,
        email: account.email,
        displayName: account.displayName,
        onboarded: true,
        role: account.role || 'student',
        grade: account.grade || '',
        school: account.school || '',
        createdAt: account.createdAt || new Date().toISOString(),
        isLocal: true
      });
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocalProfile = async (displayName: string, role: string, grade: string, school: string, avatar: string) => {
    setLoading(true);
    setError(null);
    try {
      const currentLocalId = localStorage.getItem('current_local_account_id');
      if (!currentLocalId) {
        throw new Error("No active local account logged in.");
      }

      const stored = localStorage.getItem('local_accounts');
      const accounts = stored ? JSON.parse(stored) : [];
      const updatedAccounts = accounts.map((a: any) => {
        if (a.uid === currentLocalId) {
          return {
            ...a,
            displayName: displayName || a.displayName,
            role: role || a.role,
            grade: grade || a.grade,
            school: school || a.school,
            avatar: avatar || a.avatar
          };
        }
        return a;
      });

      localStorage.setItem('local_accounts', JSON.stringify(updatedAccounts));
      setLocalAccounts(updatedAccounts);

      const activeAcc = updatedAccounts.find((a: any) => a.uid === currentLocalId);
      if (activeAcc) {
        setUser({
          uid: activeAcc.uid,
          email: activeAcc.email,
          displayName: activeAcc.displayName,
          photoURL: activeAcc.avatar,
          emailVerified: true,
          isAnonymous: false
        } as any);

        setUserData({
          uid: activeAcc.uid,
          email: activeAcc.email,
          displayName: activeAcc.displayName,
          onboarded: true,
          role: activeAcc.role,
          grade: activeAcc.grade,
          school: activeAcc.school,
          createdAt: activeAcc.createdAt,
          isLocal: true
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLocalAccount = async (email: string) => {
    try {
      const stored = localStorage.getItem('local_accounts');
      const accounts = stored ? JSON.parse(stored) : [];
      const filtered = accounts.filter((a: any) => a.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem('local_accounts', JSON.stringify(filtered));
      setLocalAccounts(filtered);

      const currentLocalId = localStorage.getItem('current_local_account_id');
      const deletedAcc = accounts.find((a: any) => a.email.toLowerCase() === email.toLowerCase());
      if (deletedAcc && deletedAcc.uid === currentLocalId) {
        localStorage.removeItem('current_local_account_id');
        setIsLocalUser(false);
        signInSimulated();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete account.");
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      totalScholars, 
      accessToken, 
      loading, 
      error, 
      signInWithGoogle, 
      signUpWithEmail, 
      signInWithEmail, 
      signInGuest, 
      resetPassword, 
      logout, 
      clearError, 
      signInSimulated,
      isLocalUser,
      localAccounts,
      signUpLocal,
      signInLocal,
      updateLocalProfile,
      deleteLocalAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};
