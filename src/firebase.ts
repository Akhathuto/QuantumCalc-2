import { initializeApp } from 'firebase/app';
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver 
} from 'firebase/auth';
import { doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with long polling for better reliability in container environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Use initializeAuth with explicit persistence and resolver for better stability
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied' || (error instanceof Error && error.message.includes('Missing or insufficient permissions'))) {
      return;
    }
    console.error("Firestore connectivity error:", error);
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('Backend didn\'t respond'))) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}

// Delay test to ensure environment is ready in non-production
if (import.meta.env.DEV) {
  setTimeout(testConnection, 2000);
}
