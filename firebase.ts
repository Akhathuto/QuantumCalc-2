import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with experimental settings to improve connectivity in restricted environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful");
  } catch (error) {
    console.error("Firestore connectivity error:", error);
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('Backend didn\'t respond'))) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}

// Delay test to ensure environment is ready
setTimeout(testConnection, 2000);
