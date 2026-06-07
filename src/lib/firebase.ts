import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// CRITICAL: The app will break without this line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();
auth.languageCode = 'ca'; // Estableix el català com a idioma per defecte per als correus de Firebase

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
