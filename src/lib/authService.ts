import { db, auth } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithCredential,
  sendEmailVerification, 
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { PerfilUsuari, DadesSensiblesUsuari } from '../types';

/**
 * SERVEI D'ACCÈS I AUTENTICACIÓ (LÒGICA DE SERVIDOR / BACKEND)
 * 
 * Aquest fitxer s'encarrega d'unir l'aplicació amb el nostre sistema de seguretat de Firebase.
 * S'explicarà cada bloc per a no-programadors perquè tothom entengui com protegim els nostres opositors.
 */

/**
 * FUNCIO CRÍTICA D'INICIALIZACIÓ DE DADES PRIVADES (BLINDATGE):
 * S'encarrega de preparar el calaix tancat sota clau de les dades de facturació i personals de l'opositor.
 */
export async function inicialitzarDadesSensiblesSilenciós(uid: string): Promise<DadesSensiblesUsuari> {
  const referencaPrivada = doc(db, 'usuaris', uid, 'dades_privades', 'perfil_sensible');
  
  try {
    const instantDoc = await getDoc(referencaPrivada);
    if (instantDoc.exists()) {
      return instantDoc.data() as DadesSensiblesUsuari;
    } else {
      const novesDades: DadesSensiblesUsuari = {
        uid: uid,
        facturaSol·licitada: false,
        actualitzatEl: serverTimestamp()
      };
      await setDoc(referencaPrivada, novesDades);
      return novesDades;
    }
  } catch (error) {
    console.error("No s'ha pogut inicialitzar el calaix privat de dades sensibles d'estudiant:", error);
    return {
      uid: uid,
      facturaSol·licitada: false,
      actualitzatEl: new Date()
    };
  }
}

/**
 * Funció de conveniència per assignar el rang d'accés (rol) en funció del correu d'entrada.
 * Comentari planer per a no-programadors:
 * Aquesta eina analitza l'estudiant que vol entrar i l'equip d'estudi:
 * - xepfarre@gmail.com serà Admin Master (el rol amb més permisos).
 * - xepfarre7@gmail.com, o qualsevol amb el correu que comenci o contingui sergi o eudald seran Administradors normals.
 * - Qualsevol altre entra per defecte com a "usuari_free_trial" (compte de 3 dies de prova).
 */
export function determinarRolSegonsEmail(email: string | null | undefined, rolActual?: string): string {
  if (!email) return rolActual || 'usuari_free_trial';
  const emailLower = email.toLowerCase();
  
  if (emailLower === 'xepfarre@gmail.com') {
    return 'admin_master';
  }
  
  if (
    emailLower === 'xepfarre7@gmail.com' ||
    emailLower === 'sergivinu@gmail.com'
  ) {
    return 'admin';
  }
  
  return rolActual || 'usuari_free_trial';
}

/**
 * FUNCIO CRÍTICA (BLINDATGE CONTRA DESSINCRONITZACIÓ DE BASE DE DADES):
 * Comprova si l'estudiant té un document a Firestore i, si per un error de connexió o de xarxa
 * no el tenia, el crea silenciósament a l'instant amb paràmetres temporals/segurs.
 * Addicionalment, s'assegura que el document de dades sensibles i facturació també existeixi al seu propi node limitat de seguretat.
 */
export async function garantirFitxaPerfilFirestore(firebaseUser: FirebaseUser, nomDefault?: string): Promise<PerfilUsuari> {
  const referencaDocument = doc(db, 'usuaris', firebaseUser.uid);
  
  try {
    // Comprovem primer la fitxa pública d'usuari
    const instantDoc = await getDoc(referencaDocument);
    let perfil: PerfilUsuari;
    
    if (instantDoc.exists()) {
      // Si el document ja existeix, el retornem exactament com està
      perfil = instantDoc.data() as PerfilUsuari;
      
      // Auto-actualització del rol si escau (ex: si és un admin master o admin nou de la llista)
      const rolCorrecte = determinarRolSegonsEmail(firebaseUser.email, perfil.rol);
      if (perfil.rol !== rolCorrecte) {
        perfil.rol = rolCorrecte;
        await updateDoc(referencaDocument, { rol: rolCorrecte });
      }
    } else {
      // SI NO EXISTEIX: El creem a l'instant! Evitem que l'opositor tingui un perfil incomplet ("dessincronització")
      console.warn(`L'estudiant ${firebaseUser.uid} no tenia fitxa de perfil. L'estem autocreant silenciósament.`);
      
      const rolInicial = determinarRolSegonsEmail(firebaseUser.email, 'usuari_free_trial');
      
      const nouPerfil: PerfilUsuari = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: nomDefault || firebaseUser.displayName || 'Nou Opositor',
        photoURL: firebaseUser.photoURL || '',
        rol: rolInicial, // Per defecte tothom qui entra comença amb aquest rol decidit
        haPagat: false,  // Per seguretat, comença sempre com a pendent fins que comprovem el pagament
        estatSubscripcio: 'pendent_de_pagament',
        creatEl: serverTimestamp(),
        ultimAccesEl: serverTimestamp(),
        correuVerificat: firebaseUser.emailVerified
      };
      
      // Guardem aquesta fitxa de seguretat a Firestore de forma transparent a l'usuari
      await setDoc(referencaDocument, nouPerfil);
      perfil = nouPerfil;
    }

    // BLINDATGE DES DE JA: Inicialitzem també el calaix tancat de dades de facturació (si no existia)
    await inicialitzarDadesSensiblesSilenciós(firebaseUser.uid);
    
    return perfil;
  } catch (error) {
    // Si falla Firestore, retornem un perfil manual per poder continuar i no bloquejar l'usuari
    console.error("No s'ha pogut realitzar la comprovació de Firestore, es crea un perfil temporal de memòria:", error);
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: nomDefault || firebaseUser.displayName || 'Estudiant en mode desconectat',
      rol: 'usuari_free_trial', // Per defecte és Free Trial
      haPagat: false,
      estatSubscripcio: 'pendent_de_pagament',
      creatEl: new Date(),
      correuVerificat: firebaseUser.emailVerified
    };
  }
}

/**
 * 1. REGISTRE TRADICIONAL (Correu i contrasenya)
 * Permet a un nou estudiant donar-se d'alta a OposiCAT d'una manera neta i segura.
 */
export async function crearCompteAmbCorreu(email: string, contrasenya: string, nomEstudiant: string): Promise<PerfilUsuari> {
  // Pas 1: Firebase Auth valida la contrasenya (mínim 6 caràcters) i crea la identitat de seguretat
  const credencial = await createUserWithEmailAndPassword(auth, email, contrasenya);
  const firebaseUser = credencial.user;
  
  // Pas extra: Actualitzem el seu nom de visualització al servei d'identitat central
  await updateProfile(firebaseUser, { displayName: nomEstudiant });
  
  // Pas 2: Creació de la fitxa de perfil a Firestore de forma neta
  const referencaDocument = doc(db, 'usuaris', firebaseUser.uid);
  const perfilInicial: PerfilUsuari = {
    uid: firebaseUser.uid,
    email: email,
    displayName: nomEstudiant,
    rol: 'usuari_free_trial', // Per defecte a OposiCAT el registre atorga un compte de Prova gratuït (Free Trial admès de 3 dies)
    haPagat: false, // Per defecte és gratuït (no té el pagament registrat)
    estatSubscripcio: 'pendent_de_pagament',
    creatEl: serverTimestamp(),
    ultimAccesEl: serverTimestamp(),
    correuVerificat: false // S'ha de canviar a true quan verifiqui el correu
  };
  
  // Escrivim les dades d'estudiant a Firestore (el tracking que veurà el Backoffice)
  await setDoc(referencaDocument, perfilInicial);
  
  // BLINDATGE DES DE JA: Creem immediatament el document buit de dades sensibles i de facturació
  await inicialitzarDadesSensiblesSilenciós(firebaseUser.uid);
  
  // Sol·licitem l'enviament automàtic del correu de confirmació
  try {
    await sendEmailVerification(firebaseUser);
  } catch (err) {
    console.error("No s'ha pogut enviar el mail de confirmació de forma asíncrona:", err);
  }
  
  return perfilInicial;
}

/**
 * OBTENIR LES DADES SENSIBLES (Només per a l'estudiant amo del compte o Backoffice autoritzat)
 * Retorna la informació tancada de facturació.
 */
export async function obtenirDadesSensiblesUsuari(uid: string): Promise<DadesSensiblesUsuari | null> {
  const referencaPrivada = doc(db, 'usuaris', uid, 'dades_privades', 'perfil_sensible');
  try {
    const instantDoc = await getDoc(referencaPrivada);
    if (instantDoc.exists()) {
      return instantDoc.data() as DadesSensiblesUsuari;
    }
    return null;
  } catch (error) {
    console.error("No s'ha pogut recuperar les dades de facturació per restriccions de permisos o connexió:", error);
    throw error;
  }
}

/**
 * ACTUALITZAR LES DADES SENSIBLES (Només l'estudiant des del seu propi dispositiu)
 * Permet desar canvis en el DNI, Adreça de facturació, etc.
 */
export async function desarDadesSensiblesUsuari(uid: string, dades: Partial<DadesSensiblesUsuari>): Promise<void> {
  const referencaPrivada = doc(db, 'usuaris', uid, 'dades_privades', 'perfil_sensible');
  try {
    await setDoc(referencaPrivada, {
      ...dades,
      uid, // Forcem a mantenir sempre el vincle
      actualitzatEl: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error en desar les dades de facturació privades segures:", error);
    throw error;
  }
}

/**
 * 2. ENTRADA STANDARD / LOG IN (Correu i contrasenya)
 * Permet entrar a l'estudiant que ja té un compte creat un cop ja s'ha guardat originalment.
 */
export async function iniciarSessioAmbCorreu(email: string, contrasenya: string): Promise<{ user: FirebaseUser, perfil: PerfilUsuari }> {
  // Intentem iniciar la sessió (comprova si existeix i la contrasenya és correcta)
  const credencial = await signInWithEmailAndPassword(auth, email, contrasenya);
  const firebaseUser = credencial.user;
  
  // BLINDATGE ASÍNCRON: Comprovem que no hi hagi hagut errors de dessincronització previs i que l'usuari té la seva fitxa
  const perfil = await garantirFitxaPerfilFirestore(firebaseUser);
  
  return { user: firebaseUser, perfil };
}

/**
 * 3. ENTRADA AMB GOOGLE (Inici de sessió ràpid d'un sol clic)
 * Solució de gran comoditat per a l'estudiant. S'encarrega d'enllaçar o iniciar sessió
 * sense risc de demanar pagar dos cops si el correu és idèntic.
 * 
 * Explicació planer per a no-programadors:
 * - Afegeix un paràmetre opcional 'capacitorIdToken'. Si l'aplicació s'està executant com a APK a Android o tauleta
 * i fem servir el sistema natiu (Capacitor), li passem el tiquet de seguretat de Google natiu. 
 * - Si no es passa aquest tiquet, l'App entén que som a la web i obre la pestanya clàssica emergent (popup).
 */
export async function iniciarSessioAmbGoogle(capacitorIdToken?: string): Promise<{ user: FirebaseUser, perfil: PerfilUsuari }> {
  let firebaseUser: FirebaseUser;

  if (capacitorIdToken) {
    // Explicació per a no-programadors: Iniciem la sessió nactiva combinant el tiquet de seguretat de Google obtingut pel mòbil
    const credencial = GoogleAuthProvider.credential(capacitorIdToken);
    const resultat = await signInWithCredential(auth, credencial);
    firebaseUser = resultat.user;
  } else {
    // Explicació per a no-programadors: Flux web estàndard usant la finestra emergent
    const proveidor = new GoogleAuthProvider();
    proveidor.setCustomParameters({
      prompt: 'select_account'
    });
    const resultat = await signInWithPopup(auth, proveidor);
    firebaseUser = resultat.user;
  }
  
  // BLINDATGE ASÍNCRON: El mateix que amb correu tradicional, garantim que se li crea el perfil si no existia
  const perfil = await garantirFitxaPerfilFirestore(firebaseUser);
  
  return { user: firebaseUser, perfil };
}

/**
 * 4. ENVIAR CORREU DE VERIFICACIÓ DIRECTAMENT
 * Permet sol·licitar un nou enllaç des de l'aplicació si l'estudiant l'ha perdut o sol·licita reenviament.
 */
export async function dolsEnviaCorreuVerificacio(): Promise<void> {
  const usuariActual = auth.currentUser;
  if (usuariActual) {
    await sendEmailVerification(usuariActual);
  } else {
    throw new Error("No hi ha cap usuari connectat per poder enviar-li un email.");
  }
}

/**
 * 5. TANCAMENT DE SESSIÓ / LOG OUT
 * Surt de forma neta de l'esperat sistema de seguretat de Firebase.
 */
export async function tancarSessio(): Promise<void> {
  await signOut(auth);
}

/**
 * 6. RECUPERACIÓ DE CONTRASENYA / PASSWORD RESET
 * Comentari planer per a no-programadors:
 * Aquesta funció permet que un opositor rebi un missatge de correu electrònic automàtic oficial
 * de seguretat per poder canviar o restablir de manera segura la seva contrasenya si l'ha oblidat.
 */
export async function recuperarContrasenyaPerCorreu(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
