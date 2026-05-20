import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver 
} from 'firebase/auth';
import { doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with optimized settings for container/proxy environments
const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
console.log(`[Firebase] Initializing Firestore with Database ID: ${dbId}`);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, dbId);

// Use initializeAuth with explicit persistence and resolver for better stability
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
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

    console.error("Firestore connectivity error:", error.message || error);
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('Backend didn\'t respond'))) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}

// Delay test to ensure environment is ready in non-production
if (import.meta.env.DEV) {
  setTimeout(testConnection, 5000);
}
