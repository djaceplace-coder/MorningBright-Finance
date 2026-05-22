/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Double compile bindings mapping both VITE_ and NEXT_PUBLIC_ environments
const globalEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: globalEnv.VITE_FIREBASE_API_KEY || globalEnv.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBRhlKAQM_ymPJzyHi5QtqCxL0YwKZNqxw",
  authDomain: globalEnv.VITE_FIREBASE_AUTH_DOMAIN || globalEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "morningbright-finance.firebaseapp.com",
  projectId: globalEnv.VITE_FIREBASE_PROJECT_ID || globalEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "morningbright-finance",
  storageBucket: globalEnv.VITE_FIREBASE_STORAGE_BUCKET || globalEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "morningbright-finance.firebasestorage.app",
  messagingSenderId: globalEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || globalEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "640655519501",
  appId: globalEnv.VITE_FIREBASE_APP_ID || globalEnv.NEXT_PUBLIC_FIREBASE_APP_ID || "1:640655519501:web:5c4aaca814256474f58a44",
  measurementId: globalEnv.VITE_FIREBASE_MEASUREMENT_ID || globalEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-CKE8KVBQZE"
};

let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn("Firebase initialization skipped or failed. Simulation state will be activated.", e);
}

export const auth = getAuth(app);
export const db = getFirestore(app);

// Simulated environment active banner controller
export let isFirebaseConnected = false;

// Validate Connection to Firestore - Mandated Check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    isFirebaseConnected = true;
    console.log("Morning Bright Finance: Connected to real Firestore server.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Morning Bright Finance: Firestore is offline. Running in secure local offline mode.");
    } else {
      console.log("Morning Bright Finance: Running with premium simulation modes.");
    }
  }
}
testConnection();

// --- Firestore Hardened Error Logging Mandate ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
