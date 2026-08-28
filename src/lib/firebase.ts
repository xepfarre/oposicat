import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Comentari planer per a no-programadors:
// Inicialitzem la connexió amb la base de dades Firestore de Firebase.
// Afegim la configuració 'experimentalForceLongPolling: true' per forçar l'ús d'un canal de connexió continu (long-polling)
// en lloc dels streams de gRPC estàndard. Això prevé els talls de connexió (errors de tipus ECONNRESET o Code 14 UNAVAILABLE)
// que ocorren quan el canal de comunicació passa per tallafocs, balancejadors de càrrega o servidors intermediaris.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth();
auth.languageCode = 'ca'; // Estableix el català com a idioma per defecte per als correus de Firebase

// Explicació per a no-programadors: Definim un sistema centralitzat de registre d'errors per a Firestore
// que és el requerit per Google de cara a diagnosticar possibles talls en els rols o permisos dels usuaris de forma automàtica.
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
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

// Explicació per a no-programadors: Proporcionem un inicialitzador segur de missatgeria mòbil per evitar penjar la web en navegadors que no tinguin suport de notificacions (com Apple Safari vell o finestres privades).
export const obtenirMissatgeria = async () => {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const compatible = await isSupported();
      if (compatible) {
        return getMessaging(app);
      }
    } catch (e) {
      console.warn("Seguretat: El navegador no disposa d'entorn per a alertes PUSH en segon pla.", e);
    }
  }
  return null;
};
