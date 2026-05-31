import { initializeApp } from 'firebase/app';
import { 
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with optimized settings for container/proxy environments
const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
console.log(`[Firebase] Initializing Firestore with Database ID: ${dbId}`);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, dbId);

// Initialize Firebase Auth with explicit persistences in order of preference.
// By omitting the default popup redirect resolver from the global initialization configuration,
// we prevent Firebase from eagerly loading cross-origin redirect iframes that crash
// with 'auth/internal-error' inside sandboxed iframe previews.
// The popup redirect resolver is passed dynamically during signInWithPopup/Redirect calls instead.
// Safe fallback for Firebase Persistence to prevent strict browser frame blocking
const supportedPersistence: any[] = [inMemoryPersistence];

try {
  if (typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined') {
    supportedPersistence.unshift(indexedDBLocalPersistence);
  }
} catch (e) {
  console.warn("IndexedDB access restricted. Downgrading persistence logic.");
}

try {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    // Test write to ensure it's not simply throwing SecurityError
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    supportedPersistence.unshift(browserSessionPersistence);
    supportedPersistence.unshift(browserLocalPersistence);
  }
} catch (e) {
  console.warn("LocalStorage access restricted by browser. Operating in secure volatile mode.", e);
}

export const auth = initializeAuth(app, {
  persistence: supportedPersistence
});

async function testConnection() {
  try {
    console.log("[Firebase] Testing connection to Firestore...");
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("[Firebase] Firestore connectivity verified successfully.");
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied' || (error instanceof Error && error.message.includes('Missing or insufficient permissions'))) {
      console.log("[Firebase] Permission check passed (access restricted but backend reachable).");
      return;
    }
    
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      console.error(`[Firebase] CRITICAL: Firestore Database "${dbId}" was not found. Please verify it exists in the Firebase Console.`);
    }

    const errorStr = error instanceof Error ? error.message : String(error);
    const isOffline = errorStr.includes('client is offline') || errorStr.includes('Backend didn\'t respond');
    
    if (isOffline) {
      console.log("[Firebase] Notice: Client is currently operating in offline cache mode.");
    } else {
      console.error("Firestore connectivity error:", errorStr);
    }
  }
}

// Delay test to ensure environment is ready in non-production
if (import.meta.env.DEV) {
  setTimeout(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('offline_mode') === 'true') {
        console.log("[Firebase] Explicit Sandbox Offline Mode is enabled. Skipping Firestore connectivity test.");
        return;
      }
    } catch {
       // Ignore localStorage errors
    }
    testConnection();
  }, 5000);
}
