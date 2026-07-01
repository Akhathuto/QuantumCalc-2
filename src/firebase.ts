import { initializeApp } from 'firebase/app';
import { 
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { doc, getDocFromServer, initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with optimized settings for container/proxy environments and persistent offline cache
const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
console.log(`[Firebase] Initializing Firestore with Database ID: ${dbId}`);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, dbId);

// Explicitly enable IndexedDB Persistence as requested
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn("[Firebase] Could not enable IndexedDB persistence:", err.code, err.message);
  });
}

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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('firestore-status', { detail: { status: 'online' } }));
    }
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied' || (error instanceof Error && error.message.includes('Missing or insufficient permissions'))) {
      console.log("[Firebase] Permission check passed (access restricted but backend reachable).");
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('firestore-status', { detail: { status: 'online' } }));
      }
      return;
    }
    
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      console.error(`[Firebase] CRITICAL: Firestore Database "${dbId}" was not found. Please verify it exists in the Firebase Console.`);
    }

    const errorStr = error instanceof Error ? error.message : String(error);
    const isAppCheckError = errorStr.includes('AppCheck') || errorStr.includes('appCheck') || errorStr.includes('app-check') || errorStr.includes('App Check') || errorStr.includes('fetch-status-error');

    if (isAppCheckError) {
      console.warn("[Firebase] App Check validation failed with 403/signature issue. Auto-disabling App Check to recover connection.");
      try {
        localStorage.setItem('enable_app_check', 'false');
      } catch (e) {
        console.warn('LocalStorage error while disabling App Check:', e);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('firestore-status', { 
          detail: { 
            status: 'app-check-error', 
            error: "Firebase App Check Validation failed (HTTP 403). We have automatically disabled it for you. Click the warning badge in the header or reload the page to restore connectivity." 
          } 
        }));
      }
      return;
    }

    const isOffline = errorStr.includes('client is offline') || errorStr.includes('Backend didn\'t respond') || errorStr.includes('Could not reach Cloud Firestore backend');
    
    if (isOffline) {
      console.log("[Firebase] Notice: Client is currently operating in offline cache mode.");
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('firestore-status', { detail: { status: 'offline' } }));
      }
    } else {
      console.error("Firestore connectivity error:", errorStr);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('firestore-status', { detail: { status: 'error', error: errorStr } }));
      }
    }
  }
}

// Delay test to ensure environment is ready
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      if (localStorage.getItem('offline_mode') === 'true') {
        console.log("[Firebase] Explicit Sandbox Offline Mode is enabled. Skipping Firestore connectivity test.");
        window.dispatchEvent(new CustomEvent('firestore-status', { detail: { status: 'sandbox-offline' } }));
        return;
      }
    } catch {
       // Ignore localStorage errors
    }
    testConnection();
  }, 3500);
}
