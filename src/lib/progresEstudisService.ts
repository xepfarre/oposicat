import { db, auth } from './firebase';
import { 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';

// Explicació per a no-programadors:
// Definim els tipus d'operacions i formats d'error exigits pel mòdul de diagnòstic de seguretat de Google.
// Això permet indicar amb precisió absoluta on s'ha programat un bloqueig o què ha fallat.
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  
  console.error('[Firestore Error Detallat]: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// SERVEI DE SEGUIMENT DE PROGRESSOS I ESTUDIS DE L'OPOSITOR SOTA FIRESTORE
// ============================================================================
// Explicació per a no-programadors:
// Aquest fitxer centralitza tota la comunicació amb el núvol de Google (Firebase).
// Serveix per a saber exactament quines parts del temari ha llegit un opositor, 
// quins textos s'han subratllat en grog i quines notes de resum té escrites.
// Així podran iniciar sessió a la Web o a l'APP de mòbil i tenir el seu progrés
// totalment sincronitzat i segur sense perdre res de la seva feina d'estudi.
// ============================================================================

/**
 * Desa a Firestore que l'estudiant ha llegit o desmarcat un tema concret.
 * @param userId Identificador únic de l'usuari (UID de Firebase Auth).
 * @param tipus 'oficial' si és l'oficial, o 'oposimossos' si és el resum optimitzat.
 * @param ambit 'A', 'B' o 'C' segons la secció del programa.
 * @param temaIndex L'índex del tema (0-indexat).
 * @param subIndex L'índex del subtema o punt concret (0-indexat).
 * @param completat Cert (true) si està llegit, fals (false) si no.
 */
export async function desarProgresLectura(
  userId: string,
  tipus: 'oficial' | 'oposimossos',
  ambit: 'A' | 'B' | 'C',
  temaIndex: number,
  subIndex: number,
  completat: boolean
) {
  // Generem una clau única i constant per a aquest punt del temari, evitant duplicats.
  // Exemple d'ID de document: oficial_A_0_4
  const docId = `${tipus}_${ambit}_${temaIndex}_${subIndex}`;
  const docRef = doc(db, 'usuaris', userId, 'progres_lectura', docId);

  try {
    await setDoc(docRef, {
      userId,
      tipus,
      ambit,
      tema: temaIndex,
      subtema: subIndex,
      completat,
      actualitzatEl: serverTimestamp() // Utilitzem sempre el temps del servidor, no la hora del mòbil
    }, { merge: true });
    
    console.log(`[Firestore lectura] S'ha desat amb èxit el punt ${docId} com a completat = ${completat}`);
  } catch (err) {
    console.error(`[Firestore error] No s'ha pogut desar el progrés de lectura del punt ${docId}:`, err);
  }
}

/**
 * Desa a Firestore l'estat d'un tema sencer de format general (Marcar el tema com a llegit al dashboard list).
 */
export async function desarProgresTemaSencer(
  userId: string,
  tipus: 'oficial' | 'oposimossos',
  ambit: 'A' | 'B' | 'C',
  temaIndex: number,
  completat: boolean
) {
  const docId = `tema_${tipus}_${ambit}_${temaIndex}`;
  const docRef = doc(db, 'usuaris', userId, 'progres_lectura', docId);

  try {
    await setDoc(docRef, {
      userId,
      tipus,
      ambit,
      tema: temaIndex,
      isTemaSencer: true,
      completat,
      actualitzatEl: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error(`[Firestore error] No s'ha pogut desar el progrés del tema sencer ${docId}:`, err);
  }
}

/**
 * Desa a Firestore el contingut HTML amb els subratllats que ha realitzat un estudiant.
 * @param userId Identificador de l'estudiant.
 * @param ambit Àmbit del temari.
 * @param temaIndex L'índex del tema actual.
 * @param subIndex El subtema corresponent.
 * @param html Contingut HTML que inclou les etiquetes amb classe "highlighter-span".
 */
export async function desarSubratllat(
  userId: string,
  ambit: string,
  temaIndex: number,
  subIndex: number,
  html: string
) {
  // Clau constant per cercar de manera eficient
  const docId = `${ambit}_${temaIndex}_${subIndex}`;
  const docRef = doc(db, 'usuaris', userId, 'subratllats', docId);

  try {
    await setDoc(docRef, {
      userId,
      ambit,
      tema: temaIndex,
      subtema: subIndex,
      html,
      actualitzatEl: serverTimestamp()
    }, { merge: true });
    
    console.log(`[Firestore subratllat] Guardats correctament els subratllats del punt: ${docId}`);
  } catch (err) {
    console.error(`[Firestore error] No s'han pogut desar els subratllats de: ${docId}:`, err);
  }
}

/**
 * Desa a Firestore les anotacions o resums redactats de pròpia mà pel candidat.
 * @param userId Identificador de l'estudiant.
 * @param ambit Àmbit del temari.
 * @param temaIndex L'índex del tema.
 * @param subIndex L'índex del punt concret de lectura.
 * @param notes Les notes en text lliure introduïdes pel mateix candidat.
 */
export async function desarNotesEstudiant(
  userId: string,
  ambit: string,
  temaIndex: number,
  subIndex: number,
  notes: string
) {
  const docId = `${ambit}_${temaIndex}_${subIndex}`;
  const docRef = doc(db, 'usuaris', userId, 'resums_estudiant', docId);

  try {
    await setDoc(docRef, {
      userId,
      ambit,
      tema: temaIndex,
      subtema: subIndex,
      notes,
      actualitzatEl: serverTimestamp()
    }, { merge: true });

    console.log(`[Firestore notes] Guardat el resum propi sobre: ${docId}`);
  } catch (err) {
    console.error(`[Firestore error] No s'han pogut desar les notes d'estudiant de: ${docId}`, err);
  }
}

/**
 * Carrega de manera integral tot el progrés de l'estudiant de Firestore durant el login.
 * Retorna una estructura idèntica a l'estat local de React perquè d'aquesta manera
 * puguem actualitzar l'estat mòbil de forma fluida i transparent.
 */
export async function carregarProgresEstudis(userId: string) {
  // Preparació d'una fitxa de dades en blanc igual que d'inici
  const r: any = {
    A: Array(7).fill(false),
    B: Array(8).fill(false),
    C: Array(5).fill(false),
    detall: {
      A: { 0: Array(9).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(4).fill(false), 4: Array(6).fill(false), 5: Array(5).fill(false), 6: Array(5).fill(false) },
      B: { 0: Array(5).fill(false), 1: Array(5).fill(false), 2: Array(6).fill(false), 3: Array(8).fill(false), 4: Array(4).fill(false), 5: Array(4).fill(false), 6: Array(7).fill(false), 7: Array(3).fill(false) },
      C: { 0: Array(2).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(3).fill(false), 4: Array(3).fill(false) }
    },
    contingutPersonalitzat: {} as Record<string, string>,
    notesEstudiant: {} as Record<string, string>, // Espai on afegir notes de resums propis de l'estudiant
    oposimossos: {
      A: Array(7).fill(false),
      B: Array(8).fill(false),
      C: Array(5).fill(false),
      detall: {
        A: { 0: Array(9).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(4).fill(false), 4: Array(6).fill(false), 5: Array(5).fill(false), 6: Array(5).fill(false) },
        B: { 0: Array(5).fill(false), 1: Array(5).fill(false), 2: Array(6).fill(false), 3: Array(8).fill(false), 4: Array(4).fill(false), 5: Array(4).fill(false), 6: Array(7).fill(false), 7: Array(3).fill(false) },
        C: { 0: Array(2).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(3).fill(false), 4: Array(3).fill(false) }
      }
    }
  };

  try {
    console.log(`[Firestore càrrega] Començant de manera segura lectura global dels progressos de l'estudiant: ${userId}`);

    // Partió 1: Llegim progres de lectura des de Firestore amb gestió d'errors granular.
    let snapLectura;
    try {
      snapLectura = await getDocs(collection(db, 'usuaris', userId, 'progres_lectura'));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, `usuaris/${userId}/progres_lectura`);
      throw e;
    }

    snapLectura.forEach((docSnap) => {
      const d = docSnap.data();
      const id = docSnap.id;
      
      if (id.startsWith('tema_')) {
        // Marcador superior del tema global
        const t = d.tipus; // 'oficial' | 'oposimossos'
        const amb = d.ambit as 'A' | 'B' | 'C';
        const idx = d.tema;
        if (t === 'oficial') {
          r[amb][idx] = d.completat ?? false;
        } else {
          r.oposimossos[amb][idx] = d.completat ?? false;
        }
      } else {
        // Detall de subtema
        const t = d.tipus; // 'oficial' | 'oposimossos'
        const amb = d.ambit as 'A' | 'B' | 'C';
        const idx = d.tema;
        const sub = d.subtema;
        
        if (t === 'oficial') {
          if (r.detall[amb] && r.detall[amb][idx]) {
            r.detall[amb][idx][sub] = d.completat ?? false;
          }
        } else {
          if (r.oposimossos.detall[amb] && r.oposimossos.detall[amb][idx]) {
            r.oposimossos.detall[amb][idx][sub] = d.completat ?? false;
          }
        }
      }
    });

    // Partió 2: Llegim subratllats (highlights) des de Firestore de forma adaptativa.
    let snapSubratllats;
    try {
      snapSubratllats = await getDocs(collection(db, 'usuaris', userId, 'subratllats'));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, `usuaris/${userId}/subratllats`);
      throw e;
    }

    snapSubratllats.forEach((docSnap) => {
      const d = docSnap.data();
      const id = docSnap.id; // Formato: A_0_4
      // El mapegem de tornada al format de clau usat en memòria: A-0-4
      const clauMemoria = id.replace(/_/g, '-');
      r.contingutPersonalitzat[clauMemoria] = d.html || "";
    });

    // Partió 3: Llegim notes i resums personals redactats des de Firestore.
    let snapNotes;
    try {
      snapNotes = await getDocs(collection(db, 'usuaris', userId, 'resums_estudiant'));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, `usuaris/${userId}/resums_estudiant`);
      throw e;
    }

    snapNotes.forEach((docSnap) => {
      const d = docSnap.data();
      const id = docSnap.id; // Formato: A_0_4
      const clauMemoria = id.replace(/_/g, '-');
      r.notesEstudiant[clauMemoria] = d.notes || "";
    });

    console.log(`[Firestore càrrega] S'ha carregat i reconstruït el progrés unificat per a l'usuari ${userId} de forma impecable.`);
  } catch (err) {
    console.error(`[Firestore error] Error durant la recuperació integral del progrés d'estudis:`, err);
    throw err;
  }

  return r;
}
