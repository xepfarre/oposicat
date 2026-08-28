import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, Plus, X, Utensils, Coffee, Sun, Moon, Apple, Calculator, Check, Loader2, Search, Home, MessageSquare, Bell, ShoppingBag, ExternalLink, Sparkles, RotateCcw, AlertTriangle, Edit2, History, Save, Trash2 } from "lucide-react";
import { db, auth } from "../../../lib/firebase";
import { collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, serverTimestamp, query, where, limit, startAfter } from "firebase/firestore";

// Comentari planer per a no-programadors:
// Aquesta funció s'encarrega d'agafar el nom d'un aliment i extreure'n qualsevol text que fassi referència
// a una quantitat o pes (com ara "(100g)", "(150ml)", "(S/Q)" o similiar) que s'hagi pogut desar a la base de dades.
// D'aquesta manera ens quedem només amb el nom net del producte (ex: "Albergínia" o "Pit de gall dindi").
export const netejarNomAliment = (nom: string): string => {
  if (!nom) return "";
  return nom
    .replace(/\s*\([^)]*\)\s*$/g, "")             // Elimina qualsevol parèntesi al final del text (com (100g), (150ml), (Lliure / S/Q), etc.)
    .replace(/\s*\(\s*\d+\s*(?:g|ml)\s*\)/gi, "") // Elimina coses com (100g), (150ml), etc.
    .replace(/\s*\(\s*s\/q\s*\)/gi, "")          // Elimina (S/Q) o (s/q)
    .replace(/\s*\(\s*s\s*\/\s*q\s*\)/gi, "")    // Elimina (S / Q)
    .replace(/\s*\(\s*\d+\s*unitats?\s*\)/gi, "") // Elimina (2 unitats) o similars
    .replace(/\s*\(\d+g\)/gi, "")
    .replace(/\s*\(\d+ml\)/gi, "")
    .trim();
};

// Comentari planer per a no-programadors:
// Aquesta funció genera les paraules clau (tokens) d'un aliment en minúscules per poder fer cerques ultra precises
// a la base de dades sense importar l'ordre o si estan en majúscules o minúscules.
export const generarTokensDeCerca = (nom: string): string[] => {
  if (!nom) return [];
  const nomNet = netejarNomAliment(nom).toLowerCase();
  
  // Treiem accents per fer la cerca resistent a faltes d'ortografia comuns
  const accentMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'è': 'e', 'é': 'e', 'í': 'i', 'ò': 'o', 'ó': 'o', 'ú': 'u', 'ï': 'i', 'ü': 'u', 'ç': 'c'
  };
  const normalitzat = nomNet.split('').map(char => accentMap[char] || char).join('');
  
  // Dividim per paraules netes de caràcters especials
  const paraules = normalitzat.split(/[\s,\.\(\)\-\+\/]+/).filter(Boolean);
  
  const tokensSet = new Set<string>();
  
  // Afegim cada paraula individual com a paraula clau
  paraules.forEach(paraula => {
    if (paraula.length >= 2) {
      tokensSet.add(paraula);
      // També afegim prefixos de cada paraula de 3 a 10 lletres per a cerca parcial (ex: "poll" per a "pollastre")
      for (let i = 3; i <= Math.min(paraula.length, 10); i++) {
        tokensSet.add(paraula.substring(0, i));
      }
    }
  });

  return Array.from(tokensSet);
};

// Comentari planer per a no-programadors:
// Aquesta funció s'encarrega de calcular el percentatge de similitud entre dues cadenes de text (noms d'aliments).
// Utilitza una combinació de la Distància de Levenshtein (errors d'escriptura o typos) i de l'Índex de Jaccard (paraules
// desordenades o trossos equivalents) un cop hem descartat les paraules funcionals buides ("stopwords").
// Retorna un número entre 0 (cap similitud) i 1 (coincidència total).
export const calcularSimilitudText = (s1: string, s2: string): number => {
  const STOPWORDS = new Set(["de", "d", "del", "i", "amb", "a", "la", "les", "el", "els", "un", "una", "uns", "unes", "per", "para", "tipus", "en", "al"]);
  
  const n1 = s1.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").trim();
  const n2 = s2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").trim();
  
  if (n1 === n2) return 1.0;
  if (!n1 || !n2) return 0.0;
  
  // 1. Jaccard Token Similarity (paraules individuals sense stopwords)
  const tokens1 = n1.split(/\s+/).filter(w => w && !STOPWORDS.has(w));
  const tokens2 = n2.split(/\s+/).filter(w => w && !STOPWORDS.has(w));
  
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  
  let jaccard = 0;
  if (set1.size > 0 && set2.size > 0) {
    const interseccio = new Set([...set1].filter(x => set2.has(x)));
    const unio = new Set([...set1, ...set2]);
    jaccard = interseccio.size / unio.size;
  }
  
  // 2. Distància de Levenshtein (sobre els strings nets)
  const track = Array(n2.length + 1).fill(null).map(() => Array(n1.length + 1).fill(null));
  for (let i = 0; i <= n1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= n2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= n2.length; j += 1) {
    for (let i = 1; i <= n1.length; i += 1) {
      const indicator = n1[i - 1] === n2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  const distancia = track[n2.length][n1.length];
  const levenshteinSim = (Math.max(n1.length, n2.length) - distancia) / Math.max(n1.length, n2.length);
  
  // 3. Comprovació de subcadena (per a noms parcials)
  const deBaixAAlt = Math.min(n1.length, n2.length) / Math.max(n1.length, n2.length);
  const substringMatch = (n1.includes(n2) || n2.includes(n1)) && deBaixAAlt >= 0.75 ? deBaixAAlt : 0;

  return Math.max(levenshteinSim, jaccard, substringMatch);
};

// Explicació per a no-programadors: Carreguem la nova imatge de fons de les dietes per a format aplicació (Dieta_APP.png) per unificar l'aspecte de tota la secció de nutrició
// @ts-ignore
import fonsDieta from "../../../assets/images/Dieta_APP.png";

/**
 * COMPONENT: Calculadora de Nutrients
 * Visualitza les kcal i macros restants i permet afegir aliments.
 * Versió ESTÀTICA (sense animacions).
 */

interface Aliment {
  id: string;
  nom: string;
  kcal: number;
  carbs: number;
  protes: number;
  greixos: number;
  apat: 'esmorzar' | 'dinar' | 'berenar' | 'sopar' | 'extres';
  pendent?: boolean;
}

export default function CalculadoraDieta({ 
  onTornar,
  onAnarSeccio,
  onResetQuiz
}: { 
  onTornar: () => void;
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void;
  onResetQuiz?: () => void;
}) {
  const [subSeccio, setSubSeccio] = useState<'calculadora' | 'dietes'>('calculadora');
  const [dietesKcalObertes, setDietesKcalObertes] = useState(false);
  const [dietesAlimentsObertes, setDietesAlimentsObertes] = useState(false);
  
  // Comentari planer per a no-programadors:
  // Estats per controlar el botó de les accions ràpides de la calculadora i la visualització de l'Àrea personal de dietes.
  const [accionsRapidesObertes, setAccionsRapidesObertes] = useState(false);
  const [dietesPersonalObertes, setDietesPersonalObertes] = useState(false);
  const [showSaveDietModal, setShowSaveDietModal] = useState(false);
  const [saveDietName, setSaveDietName] = useState("");
  const [userSavedDiets, setUserSavedDiets] = useState<any[]>([]);
  const [dietesPersonalCarregades, setDietesPersonalCarregades] = useState(false);
  const [dietaADelete, setDietaADelete] = useState<any | null>(null);
  const [areaPersonalActiva, setAreaPersonalActiva] = useState(false);

  const [avatarEstil, setAvatarEstil] = useState<string>("👮‍♂️");
  const [showCompraModal, setShowCompraModal] = useState(false); // Explicació planer: Controla si la finestra "Fer la compra" està oberta
  const [copiatCodi, setCopiatCodi] = useState(false); // Explicació planer: Controla si hem copiat correctament el cupó de descompte
  const [veureLlistaAlimentsCompra, setVeureLlistaAlimentsCompra] = useState(false); // Explicació planer: Controla si es desplega la llista de la compra dinàmica
  const [showResetModal, setShowResetModal] = useState(false); // Explicació planer: Controla si la finestra amb opcions de reinici (dia o qüestionari) està oberta
  const [showConfirmQuizReset, setShowConfirmQuizReset] = useState(false); // Explicació planer: Controla si es mostra la confirmació i advertència abans de reiniciar el qüestionari sencer
  const [showAltaAlimentModal, setShowAltaAlimentModal] = useState(false); // Explicació planer: Controla si es mostra el formulari de registre d'aliment nou
  const [showAltaAlimentSuccess, setShowAltaAlimentSuccess] = useState(false); // Explicació planer: Controla si es mostra el diàleg d'agraïment després de donar d'alta un aliment
  const [alimentsCreadosUsuari, setAlimentsCreadosUsuari] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("aliments_creats_usuari");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }); // Explicació planer: Llista d'aliments customitzats creats de forma local pel propi opositor, recuperats de localStorage
  
  const [lastVisible, setLastVisible] = useState<any>(null); // Explicació planer: Guarda la referència de l'últim aliment carregat de Firestore per fer paginació asíncrona
  const [hiHaMesAliments, setHiHaMesAliments] = useState(true); // Explicació planer: Controla si queden més aliments per seguir carregant de la base de dades
  
  const [altaNom, setAltaNom] = useState(""); // Explicació planer: Camp del nom de l'aliment a donar d'alta
  const [altaDescripcio, setAltaDescripcio] = useState(""); // Explicació planer: Descripció curta de l'aliment a donar d'alta
  const [altaKcal, setAltaKcal] = useState(""); // Explicació planer: Valor de quilocalories (kcal) de l'aliment a donar d'alta
  const [altaGrasses, setAltaGrasses] = useState(""); // Explicació planer: Valor de greixos (grams) de l'aliment a donar d'alta
  const [altaProteines, setAltaProteines] = useState(""); // Explicació planer: Valor de proteïnes (grams) de l'aliment a donar d'alta
  const [altaCarbohidrats, setAltaCarbohidrats] = useState(""); // Explicació planer: Valor de carbohidrats (grams) de l'aliment a donar d'alta

  // Comentari planer per a no-programadors:
  // Aquest estat serveix per emmagatzemar els aliments de la base de dades que s'assemblen més d'un 90%
  // al que l'usuari està intentant registrar. D'aquesta manera, podrem mostrar-los en un panell de confirmació.
  const [alimentsSimilarsTrobats, setAlimentsSimilarsTrobats] = useState<any[]>([]);

  // Comentari planer per a no-programadors:
  // Aquest estat serveix per guardar l'aliment que s'està intentant afegir, si és que encara no està
  // acceptat oficialment pels nutricionistes d'OposiCAT. Així mostrarem l'advertència abans de procedir.
  const [alimentPendentAConfirmar, setAlimentPendentAConfirmar] = useState<any | null>(null);

  // Explicació per a no-programadors: Definim els objectius de calories i macronutrients diaris de l'estudiant amb valors per defecte equilibrats.
  const [targets, setTargets] = useState({
    kcal: 2200,
    carbs: 250,
    protes: 150,
    greixos: 70
  });

  // Explicació per a no-programadors: Estirem en temps real les calories i macros desades de l'estudiant per pintar-li un panell completament personalitzat segons les fórmules d'alt rendiment físic d'OposiCAT.
  useEffect(() => {
    const carregarPerfilNutricional = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "usuaris", user.uid, "dades_dietes", "dades");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const dades = docSnap.data();
            if (dades.calculs) {
              setTargets({
                kcal: Math.round(dades.calculs.kcal) || 2200,
                carbs: Math.round(dades.calculs.carbs) || 250,
                protes: Math.round(dades.calculs.protes) || 150,
                greixos: Math.round(dades.calculs.greixos) || 70
              });
            }
          }
        } catch (err) {
          console.error("Error carregant el perfil nutricional de l'usuari de Firestore:", err);
        }
      }
    };
    carregarPerfilNutricional();
  }, []);

  const [aliments, setAliments] = useState<Aliment[]>([]);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [cercaText, setCercaText] = useState("");
  const [alimentsSuggerits, setAlimentsSuggerits] = useState<any[]>([]);
  const [loadingAliments, setLoadingAliments] = useState(false);
  const [dietesBBDD, setDietesBBDD] = useState<any[]>([]);
  const [loadingDietes, setLoadingDietes] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [dietaAConfirmarImportar, setDietaAConfirmarImportar] = useState<any | null>(null); // Explicació planer: Guarda la dieta de tipus temàtica escollida per demanar confirmació pedagògica abans d'importar-la.
  const [alimentAConfigurar, setAlimentAConfigurar] = useState<any | null>(null); // Explicació planer: Guarda l'aliment triat per l'estudiant abans de fixar-ne la quantitat
  const [quantitatIntroduida, setQuantitatIntroduida] = useState<number>(100); // Explicació planer: Quantitat (grams o mil·lilitres) de l'aliment a afegir, 100 per defecte
  const [momentSeleccionat, setMomentSeleccionat] = useState<string | null>(null); // Explicació planer: Guarda a quin àpat pertany l'aliment a configurar (esmorzar, dinar, berenar...)
  const [alimentIdAEditar, setAlimentIdAEditar] = useState<string | null>(null); // Explicació planer: Guarda l'ID de l'aliment que l'opositor ha seleccionat per editar-ne la quantitat
  const [mostrarEdicioDetalls, setMostrarEdicioDetalls] = useState<boolean>(false); // Explicació planer: Controla si es mostra el panell per modificar nom i nutrients base de l'aliment
  // Comentari planer per a no-programadors:
  // Estirem en temps real les dietes oficials creades per l'administrador des de la base de dades Firestore.
  useEffect(() => {
    const obtenirDietesBBDD = async () => {
      setLoadingDietes(true);
      try {
        const querySnapshot = await getDocs(collection(db, "dietes"));
        const aux: any[] = [];
        querySnapshot.forEach((docSnap) => {
          const dades = docSnap.data();
          aux.push({
            id: docSnap.id,
            nom: dades.nom,
            descripcio: dades.descripcio,
            tipus: dades.tipus || "tematica",
            apats: dades.apats || []
          });
        });
        setDietesBBDD(aux);
      } catch (err) {
        console.error("Error obtenint dietes de la BBDD:", err);
      } finally {
        setLoadingDietes(false);
      }
    };

    obtenirDietesBBDD();
  }, [subSeccio]);

  // Comentari planer per a no-programadors:
  // Aquesta funció s'encarrega de carregar de Firestore totes les dietes personals que l'usuari ha guardat
  // o importat com a recents, per poder-les mostrar de manera unificada en l'Àrea personal.
  const carregarDietesPersonals = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      const colRef = collection(db, "usuaris", user.uid, "dades_dietes");
      const querySnapshot = await getDocs(colRef);
      const aux: any[] = [];
      querySnapshot.forEach((docSnap) => {
        if (docSnap.id === "dades") return; // Ignorem les preferències nutricionals generals
        
        const dades = docSnap.data();
        if (dades.apats && dades.nom) {
          aux.push({
            id: docSnap.id,
            nom: dades.nom,
            descripcio: dades.descripcio || "",
            tipusGuardat: dades.tipusGuardat || "personal",
            apats: dades.apats || [],
            creatEl: dades.creatEl ? dades.creatEl.toDate() : new Date()
          });
        }
      });
      
      // Ordenem de més recents a més antigues
      aux.sort((a, b) => b.creatEl.getTime() - a.creatEl.getTime());
      
      setUserSavedDiets(aux);
      setDietesPersonalCarregades(true);
    } catch (err) {
      console.error("Error carregant les dietes personals de Firestore:", err);
    }
  };

  // Comentari planer per a no-programadors:
  // Aquesta funció registra a la base de dades privada de l'opositor que s'ha importat una dieta de l'acadèmia.
  // Si la dieta ja havia estat importada, simplement actualitza la seva data de modificació per situar-la a dalt de tot.
  const registrarDietaImportada = async (dieta: any) => {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      const apatsNets = (dieta.apats || []).map((a: any) => ({
        nomAliment: a.nomAliment || "",
        quantitat: Number(a.quantitat) || 0,
        unitat: a.unitat || "g",
        kcal: Number(a.kcal) || 0,
        carbs: Number(a.carbs) || 0,
        protes: Number(a.protes) || 0,
        greixos: Number(a.greixos) || 0,
        apat: a.apat || "extres"
      }));

      const existent = userSavedDiets.find(d => d.nom.toLowerCase() === dieta.nom.toLowerCase());
      
      if (existent) {
        const docRef = doc(db, "usuaris", user.uid, "dades_dietes", existent.id);
        await setDoc(docRef, {
          nom: dieta.nom,
          descripcio: dieta.descripcio || "Dieta importada de l'acadèmia",
          tipusGuardat: existent.tipusGuardat,
          apats: apatsNets,
          creatEl: serverTimestamp()
        }, { merge: true });
      } else {
        const docId = `dieta_${Math.random().toString(36).substring(2, 11)}`;
        const docRef = doc(db, "usuaris", user.uid, "dades_dietes", docId);
        await setDoc(docRef, {
          nom: dieta.nom,
          descripcio: dieta.descripcio || "Dieta importada de l'acadèmia",
          tipusGuardat: "importada",
          apats: apatsNets,
          creatEl: serverTimestamp()
        });
      }
      
      await carregarDietesPersonals();
    } catch (err) {
      console.error("Error desant el registre de dieta importada recent:", err);
    }
  };

  // Comentari planer per a no-programadors:
  // Aquesta funció permet a l'opositor desar l'estat actual de la calculadora de dietes amb un nom personalitzat
  // a la seva col·lecció privada de dades_dietes. S'actualitza l'Àrea personal instantàniament.
  const handleGuardarDietaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveDietName.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Sessió no trobada. Inicia sessió per guardar les teves dietes.");
      return;
    }

    try {
      const apats = aliments.map(a => {
        const match = a.nom.match(/\((\d+)(?:g|ml)\)/i);
        const quantitat = match ? Number(match[1]) : 0;
        const unitat = a.nom.toLowerCase().includes("ml)") ? "ml" : "g";
        return {
          nomAliment: netejarNomAliment(a.nom),
          quantitat,
          unitat,
          kcal: a.kcal,
          carbs: a.carbs,
          protes: a.protes,
          greixos: a.greixos,
          apat: a.apat
        };
      });

      const docId = `dieta_${Math.random().toString(36).substring(2, 11)}`;
      const docRef = doc(db, "usuaris", user.uid, "dades_dietes", docId);
      
      await setDoc(docRef, {
        nom: saveDietName.trim(),
        descripcio: "La meva dieta personalitzada",
        tipusGuardat: "personal",
        apats,
        creatEl: serverTimestamp()
      });

      setShowSaveDietModal(false);
      setSaveDietName("");
      setAccionsRapidesObertes(false);

      await carregarDietesPersonals();

      setImportSuccessMsg(`La teva dieta "${saveDietName.trim()}" s'ha desat correctament!`);
      setTimeout(() => setImportSuccessMsg(null), 5000);
    } catch (err) {
      console.error("Error guardant la dieta personal:", err);
      alert("S'ha produït un error en desar la dieta.");
    }
  };

  // Comentari planer per a no-programadors:
  // Permet esborrar una dieta desada a l'Àrea personal (un cop l'estudiant confirma l'acció a la finestra modal).
  const handleEliminarDietaPersonal = async () => {
    if (!dietaADelete) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "usuaris", user.uid, "dades_dietes", dietaADelete.id);
      await deleteDoc(docRef);
      
      setDietaADelete(null);
      await carregarDietesPersonals();
      
      setImportSuccessMsg("Dieta eliminada correctament.");
      setTimeout(() => setImportSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error eliminant la dieta personal de Firestore:", err);
      alert("No s'ha pogut eliminar la dieta. Intenta-ho de nou.");
    }
  };

  useEffect(() => {
    carregarDietesPersonals();
  }, [subSeccio]);

  const importarDieta = async (dieta: any) => {
    // Comentari planer per a no-programadors:
    // Convertim els aliments de la dieta guardada al format que requereix la calculadora i els importem de cop.
    // Netegem el nom original per evitar repeticions del pes i mostrem "Lliure / S/Q" si són de lliure elecció per a l'alumne.
    // A més, si algun d'aquests aliments té quantitat 0 o lliure (per tant, nutrients a zero), descarreguem de forma asíncrona
    // els seus valors de referència de 100g des de Firestore. Així, si l'estudiant decideix modificar-ne el pes en qualsevol moment,
    // el sistema podrà calcular correctament les calories i macronutrients en base als valors oficials.
    const nousAlimentsBase: any[] = [];

    const alimentsAImportarPromises = (dieta.apats || []).map(async (apt: any) => {
      const nomNet = netejarNomAliment(apt.nomAliment || "");
      const textQuantitat = apt.quantitat === 0 || Number(apt.kcal) === 0
        ? "Lliure / S/Q"
        : `${apt.quantitat}${apt.unitat || 'g'}`;

      let kcalBase = Number(apt.kcal) || 0;
      let carbsBase = Number(apt.carbs) || 0;
      let protesBase = Number(apt.protes) || 0;
      let greixosBase = Number(apt.greixos) || 0;

      // Si l'aliment és de quantitat 0 o de lliure elecció, anem a Firestore a buscar la seva equivalència
      if (kcalBase === 0) {
        try {
          const nomCerca = nomNet.trim();
          const q = query(collection(db, "aliments"), where("nom", "==", nomCerca), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const docData = snap.docs[0].data();
            const alimentRef = {
              nom: docData.nom || nomCerca,
              kcal: Math.round(Number(docData.kcal) || 0),
              carbs: Math.round(Number(docData.carbs) || 0),
              protes: Math.round(Number(docData.protes) || 0),
              greixos: Math.round(Number(docData.greixos) || 0),
              moments: docData.moments || ["esmorzar", "dinar", "berenar", "sopar", "extres"]
            };
            nousAlimentsBase.push(alimentRef);
          } else {
            // Cerca alternativa ràpida per si de cas a través de tokens
            const accentMap: { [key: string]: string } = {
              'à': 'a', 'á': 'a', 'è': 'e', 'é': 'e', 'í': 'i', 'ò': 'o', 'ó': 'o', 'ú': 'u', 'ï': 'i', 'ü': 'u', 'ç': 'c'
            };
            const paraulaCerca = nomCerca.toLowerCase().split(' ')[0].split('').map(char => accentMap[char] || char).join('');
            if (paraulaCerca.length >= 2) {
              const qToken = query(collection(db, "aliments"), where("tokens", "array-contains", paraulaCerca), limit(1));
              const snapToken = await getDocs(qToken);
              if (!snapToken.empty) {
                const docData = snapToken.docs[0].data();
                const alimentRef = {
                  nom: docData.nom || nomCerca,
                  kcal: Math.round(Number(docData.kcal) || 0),
                  carbs: Math.round(Number(docData.carbs) || 0),
                  protes: Math.round(Number(docData.protes) || 0),
                  greixos: Math.round(Number(docData.greixos) || 0),
                  moments: docData.moments || ["esmorzar", "dinar", "berenar", "sopar", "extres"]
                };
                nousAlimentsBase.push(alimentRef);
              }
            }
          }
        } catch (err) {
          console.error("Error obtenint dades de referència d'aliment per a:", nomNet, err);
        }
      }

      return {
        id: Math.random().toString(36).substring(2, 9),
        nom: `${nomNet} (${textQuantitat})`,
        kcal: kcalBase,
        carbs: carbsBase,
        protes: protesBase,
        greixos: greixosBase,
        apat: apt.apat
      };
    });

    const alimentsAImportar = await Promise.all(alimentsAImportarPromises);

    // Si hem obtingut dades reals dels aliments de referència de Firestore, els registrem localment
    if (nousAlimentsBase.length > 0) {
      setAlimentsCreadosUsuari(prev => {
        const existents = new Set(prev.map(p => p.nom.toLowerCase()));
        const filtrats = nousAlimentsBase.filter(n => !existents.has(n.nom.toLowerCase()));
        return [...prev, ...filtrats];
      });
    }
    
    // Comentari planer per a no-programadors:
    // Quan l'alumne importa la dieta, la desem automàticament a la seva llista d'Àrea personal ("recent")
    // perquè hi tingui un accés ultra ràpid per a futures consultes.
    await registrarDietaImportada(dieta);
    
    setAliments(alimentsAImportar);
    setImportSuccessMsg(`Dieta "${dieta.nom}" importada! S'han carregat tots els seus aliments.`);
    setSubSeccio('calculadora');
    setTimeout(() => setImportSuccessMsg(null), 5000);
  };

  // Explicació per a no-programadors: Estirem l'estil d'avatar preferit de l'opositor des de LocalStorage per coherència
  useEffect(() => {
    try {
      const deLocalStorage = localStorage.getItem("avatar_estil");
      if (deLocalStorage) {
        setAvatarEstil(deLocalStorage);
      }
    } catch {
      setAvatarEstil("👮‍♂️");
    }
  }, []);

  // Comentari planer per a no-programadors:
  // Guardem els aliments de l'usuari a localStorage sempre que n'afegeixi un de nou.
  useEffect(() => {
    try {
      localStorage.setItem("aliments_creats_usuari", JSON.stringify(alimentsCreadosUsuari));
    } catch (err) {
      console.error("Error desant aliments creats de l'usuari a localStorage:", err);
    }
  }, [alimentsCreadosUsuari]);

  // Comentari planer per a no-programadors:
  // Aquesta funció sincronitza en segon pla l'estat dels aliments que l'estudiant ha creat de manera local.
  // Es connecta a 'notificacions_dietes' i comprova si els nutricionistes d'OposiCAT ja han acceptat ("resolt")
  // o rebutjat la sol·licitud. Si s'ha acceptat, s'elimina del local de l'estudiant perquè l'aliment passarà a carregar-se
  // de forma oficial des de la BBDD global; si s'ha denegat, s'elimina per netejar la llista de pendents de l'aplicació.
  useEffect(() => {
    const sincronitzarAlimentsUsuari = async () => {
      if (alimentsCreadosUsuari.length === 0) return;
      
      const pendentsAmbId = alimentsCreadosUsuari.filter(a => a.id_notificacio);
      if (pendentsAmbId.length === 0) return;

      const updatedAliments = [...alimentsCreadosUsuari];
      let alertatsCanvis = false;

      for (const alim of pendentsAmbId) {
        try {
          const docRef = doc(db, "notificacions_dietes", alim.id_notificacio);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            const idx = updatedAliments.findIndex(a => a.id_notificacio === alim.id_notificacio);
            if (idx !== -1) {
              updatedAliments.splice(idx, 1);
              alertatsCanvis = true;
            }
          } else {
            const dades = docSnap.data();
            if (dades.estat === "resolt" || dades.estat === "tramitat") {
              const idx = updatedAliments.findIndex(a => a.id_notificacio === alim.id_notificacio);
              if (idx !== -1) {
                updatedAliments.splice(idx, 1);
                alertatsCanvis = true;
              }
            } else if (dades.estat === "rebutjat" || dades.estat === "denegat") {
              const idx = updatedAliments.findIndex(a => a.id_notificacio === alim.id_notificacio);
              if (idx !== -1) {
                updatedAliments.splice(idx, 1);
                alertatsCanvis = true;
              }
            }
          }
        } catch (err) {
          console.error("Error sincronitzant l'aliment pendent:", alim.nom, err);
        }
      }

      if (alertatsCanvis) {
        setAlimentsCreadosUsuari(updatedAliments);
      }
    };

    sincronitzarAlimentsUsuari();
  }, []);

  // Comentari planer per a no-programadors:
  // Funció estrella per carregar de 20 en 20 els aliments des de la BBDD de Firestore de manera dinàmica.
  // Si hi ha cerca activa, realitza consultes intel·ligents i ultra precises en paral·lel utilitzant tant prefixes del nom
  // com l'array de tokens desglossats (perquè si algú busca "pollastre" o "arros" trobi de seguida coses com "Pit de pollastre" o "Arròs blanc").
  const carregarAlimentsBBDD = async (isFirstPage = false, textCerca = cercaText) => {
    setLoadingAliments(true);
    try {
      const limitQty = 20;
      const momentActual = showAddModal || "extres";

      if (textCerca.trim() !== "") {
        const queryText = textCerca.trim();
        const queryTextLower = queryText.toLowerCase();
        const queryTextCapitalized = queryText.charAt(0).toUpperCase() + queryText.slice(1);
        
        // Normalitzem els accents per a la cerca ultra precisa per paraules clau
        const accentMap: { [key: string]: string } = {
          'à': 'a', 'á': 'a', 'è': 'e', 'é': 'e', 'í': 'i', 'ò': 'o', 'ó': 'o', 'ú': 'u', 'ï': 'i', 'ü': 'u', 'ç': 'c'
        };
        const queryTextNormalized = queryTextLower.split('').map(char => accentMap[char] || char).join('');

        const queries = [];

        if (isFirstPage) {
          // Consulta 1: Prefix amb majúscula (ex: "Pollastre")
          queries.push(getDocs(query(
            collection(db, "aliments"),
            where("nom", ">=", queryTextCapitalized),
            where("nom", "<=", queryTextCapitalized + "\uf8ff"),
            limit(limitQty)
          )));

          // Consulta 2: Prefix amb minúscula (ex: "pollastre")
          queries.push(getDocs(query(
            collection(db, "aliments"),
            where("nom", ">=", queryTextLower),
            where("nom", "<=", queryTextLower + "\uf8ff"),
            limit(limitQty)
          )));

          // Consulta 3: Cerca ultra precisa per paraules clau dins de l'array de tokens de Firestore
          queries.push(getDocs(query(
            collection(db, "aliments"),
            where("tokens", "array-contains", queryTextNormalized),
            limit(limitQty)
          )));
        } else {
          // Paginació sobre la cerca de tokens i prefixes. Per simplificar i no fer esperar l'estudiant,
          // quan hi ha més d'una pàgina de cerca, paginem utilitzant la query de tokens que és la més precisa.
          if (lastVisible) {
            queries.push(getDocs(query(
              collection(db, "aliments"),
              where("tokens", "array-contains", queryTextNormalized),
              startAfter(lastVisible),
              limit(limitQty)
            )));
          }
        }

        const snapshots = await Promise.all(queries);

        // Ajuntem els resultats evitant duplicats basats en el nom del document o l'ID
        const mapAliments = new Map<string, any>();
        let darrerDocVisible: any = null;

        snapshots.forEach(snapshot => {
          if (snapshot.docs.length > 0) {
            darrerDocVisible = snapshot.docs[snapshot.docs.length - 1];
          }
          snapshot.forEach(docSnap => {
            const dades: any = docSnap.data();
            let momentsArray: string[] = [];
            if (Array.isArray(dades.moments)) {
              momentsArray = dades.moments;
            } else if (typeof dades.moments === "string") {
              momentsArray = dades.moments.split(",").map((s: string) => s.trim()).filter(Boolean);
            } else if (dades.apat) {
              momentsArray = [dades.apat];
            }

            mapAliments.set(docSnap.id, {
              id: docSnap.id,
              nom: dades.nom,
              kcal: Math.round(Number(dades.kcal) || 0),
              carbs: Math.round(Number(dades.carbs) || 0),
              protes: Math.round(Number(dades.protes) || 0),
              greixos: Math.round(Number(dades.greixos) || 0),
              moments: momentsArray,
              pendent: dades.pendent || false
            });
          });
        });

        const nousAliments = Array.from(mapAliments.values());
        setLastVisible(darrerDocVisible || null);
        setHiHaMesAliments(nousAliments.length >= limitQty);

        if (isFirstPage) {
          setAlimentsSuggerits(nousAliments);
        } else {
          setAlimentsSuggerits(prev => {
            const existents = new Set(prev.map(p => p.nom));
            const filtratsNoves = nousAliments.filter(n => !existents.has(n.nom));
            return [...prev, ...filtratsNoves];
          });
        }
      } else {
        // Cerca normal de tots els aliments del moment actual de l'àpat
        let q;
        if (isFirstPage) {
          q = query(
            collection(db, "aliments"),
            where("moments", "array-contains", momentActual),
            limit(limitQty)
          );
        } else {
          if (!lastVisible) return;
          q = query(
            collection(db, "aliments"),
            where("moments", "array-contains", momentActual),
            startAfter(lastVisible),
            limit(limitQty)
          );
        }

        const querySnapshot = await getDocs(q);
        const nousAliments: any[] = [];
        querySnapshot.forEach((docSnap) => {
          const dades: any = docSnap.data();
          let momentsArray: string[] = [];
          if (Array.isArray(dades.moments)) {
            momentsArray = dades.moments;
          } else if (typeof dades.moments === "string") {
            momentsArray = dades.moments.split(",").map((s: string) => s.trim()).filter(Boolean);
          } else if (dades.apat) {
            momentsArray = [dades.apat];
          }

          nousAliments.push({
            id: docSnap.id,
            nom: dades.nom,
            kcal: Math.round(Number(dades.kcal) || 0),
            carbs: Math.round(Number(dades.carbs) || 0),
            protes: Math.round(Number(dades.protes) || 0),
            greixos: Math.round(Number(dades.greixos) || 0),
            moments: momentsArray,
            pendent: dades.pendent || false
          });
        });

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastDoc || null);
        setHiHaMesAliments(nousAliments.length >= limitQty);

        if (isFirstPage) {
          setAlimentsSuggerits(nousAliments);
        } else {
          setAlimentsSuggerits(prev => {
            const existents = new Set(prev.map(p => p.nom));
            const filtratsNoves = nousAliments.filter(n => !existents.has(n.nom));
            return [...prev, ...filtratsNoves];
          });
        }
      }
    } catch (err) {
      console.error("Error carregant aliments paginats:", err);
    } finally {
      setLoadingAliments(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Activem la càrrega inicial i els canvis de cerca amb un petit temps d'espera (debouncing de 300ms)
  // per millorar la velocitat i no realitzar milers de peticions si l'estudiant escriu molt ràpid.
  useEffect(() => {
    if (!showAddModal) return;

    setLastVisible(null);
    setHiHaMesAliments(true);

    const delayDebounceFn = setTimeout(() => {
      carregarAlimentsBBDD(true, cercaText);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [showAddModal, cercaText]);

  // Càlculs de totals actuals
  // Comentari planer per a no-programadors:
  // Calculem la suma dels nutrients dels aliments de la dieta i els arrodonim per evitar decimals estranys com 23.000000000003
  const totals = useMemo(() => {
    const raw = aliments.reduce((acc, curr) => ({
      kcal: acc.kcal + (Number(curr.kcal) || 0),
      carbs: acc.carbs + (Number(curr.carbs) || 0),
      protes: acc.protes + (Number(curr.protes) || 0),
      greixos: acc.greixos + (Number(curr.greixos) || 0)
    }), { kcal: 0, carbs: 0, protes: 0, greixos: 0 });

    return {
      kcal: Math.round(raw.kcal),
      carbs: Math.round(raw.carbs),
      protes: Math.round(raw.protes),
      greixos: Math.round(raw.greixos)
    };
  }, [aliments]);

  const restants = {
    kcal: Math.round(targets.kcal - totals.kcal),
    carbs: Math.round(targets.carbs - totals.carbs),
    protes: Math.round(targets.protes - totals.protes),
    greixos: Math.round(targets.greixos - totals.greixos)
  };

  // Explicació per a no-programadors:
  // Calculem de forma proporcional els valors nutricionals de l'aliment que s'està configurant usant una simple regla de tres sobre la base de 100gr o 100ml.
  const recalculs = useMemo(() => {
    if (!alimentAConfigurar) return { kcal: 0, carbs: 0, protes: 0, greixos: 0 };
    const q = Number(quantitatIntroduida) || 0;
    const factor = q / 100;
    return {
      kcal: Math.round((Number(alimentAConfigurar.kcal) || 0) * factor),
      carbs: Math.round((Number(alimentAConfigurar.carbs) || 0) * factor * 10) / 10,
      protes: Math.round((Number(alimentAConfigurar.protes) || 0) * factor * 10) / 10,
      greixos: Math.round((Number(alimentAConfigurar.greixos) || 0) * factor * 10) / 10
    };
  }, [alimentAConfigurar, quantitatIntroduida]);

  // Comentari planer per a no-programadors:
  // Filtra els suggeriments d'aliments segons el moment de l'àpat triat (ex: només cereals i llet a l'esmorzar)
  // i també el text que s'ha escrit al cercador per trobar-lo molt més ràpidament. S'inclouen tant els aliments generals com els registrats localment per l'usuari.
  const alimentsFiltrats = useMemo(() => {
    if (!showAddModal) return [];

    // Explicació planer: Filtrem els aliments locals creats per l'usuari segons el filtre de text escrit, si és que n'hi ha.
    let localsFiltrats = alimentsCreadosUsuari.filter(alim => {
      if (!alim.moments || alim.moments.length === 0) return true;
      return alim.moments.includes(showAddModal);
    });

    if (cercaText.trim() !== "") {
      const queryStr = cercaText.toLowerCase();
      localsFiltrats = localsFiltrats.filter(alim => 
        (alim.nom || "").toLowerCase().includes(queryStr)
      );
    }

    // Unim els suggerits de la BBDD (ja paginats i cercats directament) amb els locals de l'usuari.
    // Ens assegurem de no duplicar noms de referència per evitar duplicats visuals a la llista.
    const nomsSuggerits = new Set(alimentsSuggerits.map(s => s.nom.toLowerCase()));
    const localsNoDuplicats = localsFiltrats.filter(l => !nomsSuggerits.has(l.nom.toLowerCase()));

    return [...localsNoDuplicats, ...alimentsSuggerits];
  }, [alimentsSuggerits, alimentsCreadosUsuari, showAddModal, cercaText]);

  // Comentari planer per a no-programadors:
  // Reinicia el text del cercador cada vegada que s'obre o es tanca la finestra d'afegir aliment.
  useEffect(() => {
    setCercaText("");
  }, [showAddModal]);

  // Comentari planer per a no-programadors:
  // Donat un aliment afegit amb quantitat de la calculadora, busca'n els valors originals de referència (de 100gr o 100ml)
  // per poder recalcular el pes quan l'alumne decideixi editar la quantitat d'aquell aliment de la seva llista.
  const trobarBaseAliment = (nomOriginal: string, itemNutricional: any) => {
    const nomNet = netejarNomAliment(nomOriginal).toLowerCase();
    const trobat = [...alimentsSuggerits, ...alimentsCreadosUsuari].find(
      a => netejarNomAliment(a.nom || "").toLowerCase() === nomNet
    );
    if (trobat) {
      return {
        nom: trobat.nom,
        kcal: Number(trobat.kcal) || 0,
        carbs: Number(trobat.carbs) || 0,
        protes: Number(trobat.protes) || 0,
        greixos: Number(trobat.greixos) || 0,
      };
    }
    
    // Si no el troba a la llista de suggeriments (per exemple si és importat d'una dieta predefinida d'aliments),
    // calculem cap enrere els nutrients per 100g basant-nos en els grams que té indicats al seu nom.
    let quantitat = 100;
    const match = nomOriginal.match(/\((\d+)(?:g|ml)\)/i);
    if (match) {
      quantitat = Number(match[1]) || 100;
    }
    const factor = quantitat > 0 ? (quantitat / 100) : 1;
    return {
      nom: netejarNomAliment(nomOriginal),
      kcal: Math.round((itemNutricional.kcal || 0) / factor),
      carbs: Math.round(((itemNutricional.carbs || 0) / factor) * 10) / 10,
      protes: Math.round(((itemNutricional.protes || 0) / factor) * 10) / 10,
      greixos: Math.round(((itemNutricional.greixos || 0) / factor) * 10) / 10,
    };
  };

  // Comentari planer per a no-programadors:
  // S'encarrega d'obrir el diàleg "Quina quantitat?" per modificar un aliment existent.
  // Carrega la seva base de 100g i la quantitat actual que l'alumne tenia afegida per a que la pugui editar còmodament.
  const iniciarModificacioAliment = (alim: Aliment) => {
    const base = trobarBaseAliment(alim.nom, alim);
    let quantitatActual = 100;
    const match = alim.nom.match(/\((\d+)(?:g|ml)\)/i);
    if (match) {
      quantitatActual = Number(match[1]) || 100;
    }
    
    setAlimentAConfigurar(base);
    setQuantitatIntroduida(quantitatActual);
    setMomentSeleccionat(alim.apat);
    setAlimentIdAEditar(alim.id);
  };

  const addAliment = (base: any, apat: any, quantitat: number) => {
    const factor = quantitat / 100;
    
    // Explicació per a no-programadors: Netegem el nom original de l'aliment de qualsevol anotació prèvia de pes (ex: (150g)) per evitar duplicats estranys
    const nomNet = netejarNomAliment(base.nom || "");

    // Explicació per a no-programadors: Detectem si és un aliment líquid o sòlid per definir si usem grams (g) o mil·lilitres (ml)
    const unitatMesura = nomNet.toLowerCase().includes("ml") || 
                         nomNet.toLowerCase().includes("llet") || 
                         nomNet.toLowerCase().includes("beguda") ||
                         nomNet.toLowerCase().includes("suc") || 
                         nomNet.toLowerCase().includes("oli") ||
                         nomNet.toLowerCase().includes("brou")
                         ? "ml" : "g";

    if (alimentIdAEditar) {
      // Mode Edició: Actualitzem l'aliment existent
      setAliments(aliments.map(a => {
        if (a.id === alimentIdAEditar) {
          return {
            ...a,
            nom: `${nomNet} (${quantitat}${unitatMesura})`,
            kcal: Math.round((Number(base.kcal) || 0) * factor),
            carbs: Math.round((Number(base.carbs) || 0) * factor * 10) / 10,
            protes: Math.round((Number(base.protes) || 0) * factor * 10) / 10,
            greixos: Math.round((Number(base.greixos) || 0) * factor * 10) / 10,
            pendent: base.pendent || a.pendent,
          };
        }
        return a;
      }));
      setAlimentIdAEditar(null);
    } else {
      // Mode Creació: Afegim un de nou normal
      const nou = {
        ...base,
        id: Math.random().toString(36).substring(2, 9),
        nom: `${nomNet} (${quantitat}${unitatMesura})`,
        kcal: Math.round((Number(base.kcal) || 0) * factor),
        carbs: Math.round((Number(base.carbs) || 0) * factor * 10) / 10,
        protes: Math.round((Number(base.protes) || 0) * factor * 10) / 10,
        greixos: Math.round((Number(base.greixos) || 0) * factor * 10) / 10,
        apat,
        pendent: base.pendent
      };
      setAliments([...aliments, nou]);
    }
    setShowAddModal(null);
  };

  const removeAliment = (id: string) => {
    setAliments(aliments.filter(a => a.id !== id));
  };

  // Comentari planer per a no-programadors:
  // Aquesta funció s'encarrega d'analitzar si el nou aliment que l'opositor vol introduir ja existeix.
  // Es calcula la similitud de text (fins a un 90%) contra tots els aliments ja existents.
  // Si hi ha alguna coincidència evident, atura el registre per demanar confirmació; si no, el desa directament.
  const handleAltaAlimentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!altaNom.trim()) return;

    const nomNouNetejat = netejarNomAliment(altaNom.trim());
    // Combinem els aliments suggerits (del banc de dades general) amb els creats localment per comparar
    const totsElsAliments = [...alimentsSuggerits, ...alimentsCreadosUsuari];
    
    const similars: any[] = [];
    totsElsAliments.forEach((alim) => {
      const nomExistentNetejat = netejarNomAliment(alim.nom || "");
      const sim = calcularSimilitudText(nomNouNetejat, nomExistentNetejat);
      
      // Marquem el 90% (0.90) de similitud o proper (0.88) com a llindar de coincidència potencialment duplicada
      if (sim >= 0.88) {
        similars.push({
          ...alim,
          similitudPercent: Math.round(sim * 100)
        });
      }
    });

    if (similars.length > 0) {
      // S'han trobat aliments massa similars! Els guardem a l'estat per a que la pantalla mostri les alternatives
      setAlimentsSimilarsTrobats(similars);
    } else {
      // No hi ha duplicats, procedim directament a desar
      executarAltaAliment();
    }
  };

  // Comentari planer per a no-programadors:
  // Desa un aliment nou de forma local i immediata per a l'estudiant actual, neteja els camps del formulari
  // i crea una notificació d'alta a la col·lecció 'notificacions_dietes' perquè l'admin la pugui acceptar, editar o rebutjar.
  // També li afegim els "tokens" de cerca per garantir que l'aliment sigui cercable de forma ultra precisa immediatament.
  const executarAltaAliment = async () => {
    const nomSencer = altaNom.trim();
    const tokensCerca = generarTokensDeCerca(nomSencer);

    const nouAliment: any = {
      nom: nomSencer,
      descripcio: altaDescripcio.trim(),
      kcal: Math.round(Number(altaKcal) || 0),
      carbs: Math.round(Number(altaCarbohidrats) || 0),
      protes: Math.round(Number(altaProteines) || 0),
      greixos: Math.round(Number(altaGrasses) || 0),
      moments: ["esmorzar", "dinar", "berenar", "sopar", "extres"], // Disponible per a tots els moments perquè es pugui cercar lliurement
      tokens: tokensCerca,
      pendent: true
    };

    let idNotificacio = "";

    try {
      const user = auth.currentUser;
      const usuariId = user?.uid || "anonim";
      const usuariNom = user?.displayName || user?.email?.split('@')[0] || "Opositor Autònom";
      const usuariEmail = user?.email || "estudiant@oposicat.cat";

      // Afegim el document de sol·licitud d'alta d'aliment a 'notificacions_dietes'
      const docRef = await addDoc(collection(db, "notificacions_dietes"), {
        usuariId,
        usuariNom,
        usuariEmail,
        tipus: "alta_aliment",
        alimentNom: nomSencer,
        missatge: altaDescripcio.trim() || `Proposta d'aliment amb macros: Kcal: ${nouAliment.kcal}, C: ${nouAliment.carbs}g, P: ${nouAliment.protes}g, G: ${nouAliment.greixos}g`,
        llegit: false,
        estat: "pendent",
        kcal: nouAliment.kcal,
        carbs: nouAliment.carbs,
        protes: nouAliment.protes,
        greixos: nouAliment.greixos,
        tokens: tokensCerca, // Els deixem preparats també a la proposta
        creatEl: serverTimestamp()
      });

      idNotificacio = docRef.id;
    } catch (err) {
      console.error("Error enviant proposta de nou aliment a 'notificacions_dietes':", err);
    }

    // Assignem l'ID de la notificació de base de dades si s'ha generat correctament
    if (idNotificacio) {
      nouAliment.id_notificacio = idNotificacio;
    }

    setAlimentsCreadosUsuari([...alimentsCreadosUsuari, nouAliment]);

    // Reset de camps del formulari i llista de similars
    setAltaNom("");
    setAltaDescripcio("");
    setAltaKcal("");
    setAltaGrasses("");
    setAltaProteines("");
    setAltaCarbohidrats("");
    setAlimentsSimilarsTrobats([]);

    // Canvi de vistes dels diàlegs pop-up
    setShowAltaAlimentModal(false);
    setShowAltaAlimentSuccess(true);
  };

  const percentKcal = Math.min((totals.kcal / targets.kcal) * 100, 100);

  return (
    /* Explicació planer per a no-programadors:
       Hem canviat el farcit inferior (padding bottom) de pb-36 a pb-12.
       Així la pantalla s'atura correctament just en acabar els elements visibles (com els botons o els àpats)
       sense deixar un gran espai buit i innecessari per fer scroll a sota. */
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-12">
      
      {/* Explicació per a no-programadors: Es col·loca de fons de pantalla la imatge de fons de les dietes fixada al fons (fixed inset-0) per evitar que es mogui en fer scroll, augmentant-ne la visibilitat per sobre del color de fons */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={fonsDieta} 
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-75 transition-all duration-700"
        />
        {/* Un degradat suau que s'integra perfectament amb el disseny, deixant veure clarament la foto de fons de les dietes de fons */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-[#00274d]/50 to-[#00274d]/95" />
      </div>

      {/* Contenidor del contingut per sobre del fons de pantalla amb z-10 */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* CAPÇALERA ESTIL PETICIÓ RECOSTAT I CENTRAT */}
      <header className="pt-8 w-full max-w-md flex flex-col gap-4 pb-5 border-b border-white/10 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              // Comentari planer per a no-programadors:
              // Si estem a la pestanya de "dietes", quan l'opositor prem enrere no el volem fer fora del tot,
              // sinó que el portem enrere primer a la "calculadora". Si ja som a la "calculadora", el retornem a les proves físiques.
              if (subSeccio === 'dietes') {
                setSubSeccio('calculadora');
              } else {
                onTornar();
              }
            }} 
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 border border-white/10 shrink-0 active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white leading-none">
              Dieta i nutrició
            </h1>
            <span className="text-[10px] font-black uppercase text-emerald-400/80 tracking-widest mt-1">
              Preparació física de Mossos 👮‍♂️
            </span>
          </div>
        </div>

        {/* SELECTOR DE SUB-SECCIONS (Calculadora o Dietes) */}
        <div className="grid grid-cols-2 p-1 bg-black/35 border border-white/10 rounded-2xl w-full">
          <button
            onClick={() => setSubSeccio('calculadora')}
            className={`py-2.5 px-4 text-xs font-black italic uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${
              subSeccio === 'calculadora'
                ? "bg-emerald-500 text-[#00274d] shadow-lg shadow-emerald-500/10 font-black"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Calculadora
          </button>
          <button
            onClick={() => setSubSeccio('dietes')}
            className={`py-2.5 px-4 text-xs font-black italic uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${
              subSeccio === 'dietes'
                ? "bg-emerald-500 text-[#00274d] shadow-lg shadow-emerald-500/10 font-black"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Dietes
          </button>
        </div>
      </header>

      {subSeccio === 'dietes' ? (
        /* Comentari planer per a no-programadors:
           Afegim un espai de farcit inferior (pb-28) al contenidor de les dietes per a que, quan fem lliscar la pantalla fins a sota de tot,
           la barra de navegació inferior de l'aplicació no tapi cap lletra ni botó de l'última targeta, podent visualitzar tota la informació perfectament. */
        <main className="w-full max-w-md flex flex-col gap-6 font-sans pb-28">
          
          {/* Targeta de presentació superior */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-emerald-900/10 to-slate-900 border border-emerald-500/20 rounded-3xl p-5 text-center shadow-xl">
            <h2 className="text-lg font-black italic uppercase tracking-tight text-emerald-400">
              Mostrar diferents dietes
            </h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1 font-bold">
              Opcions nutricionals OposiCAT 🥗
            </p>
          </div>

          {/* Text d'advertència / orientació sota disseny professional d'OposiCAT */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-left">
            <p className="text-xs text-amber-200/90 leading-relaxed font-sans font-medium">
              ⚠️ <strong>Avís:</strong> Les dietes són merament orientatives. Si voleu una dieta 100% adaptada a les vostre necessitats, contacteu amb un nutricionista professional.
            </p>
          </div>

          {/* BLOC 3: Àrea personal (Estil unificat, mateix estil de targeta) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 text-left shadow-lg">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-emerald-400" />
                <h3 className="text-sm font-black italic uppercase tracking-wider text-white">
                  Àrea personal
                </h3>
              </div>
              <p className="text-[10px] text-white/40 font-semibold mt-0.5 leading-relaxed">
                Les dietes que recentment he importat i les meves dietes personals.
              </p>
            </div>

            <button
              onClick={() => setDietesPersonalObertes(!dietesPersonalObertes)}
              className={`w-full active:scale-95 py-3.5 px-4 rounded-xl font-black italic uppercase tracking-widest text-[11px] text-center transition-all cursor-pointer shadow-md ${
                dietesPersonalObertes 
                  ? "bg-orange-500 hover:bg-orange-400 text-[#00274d] shadow-orange-500/15" 
                  : "bg-emerald-500 hover:bg-emerald-400 text-[#00274d] shadow-emerald-500/10"
              }`}
            >
              {dietesPersonalObertes ? "◀ Amagar àrea personal" : "Mostrar àrea personal ▶"}
            </button>

            {/* EXPANDIBLE: Àrea personal */}
            {dietesPersonalObertes && (
              <div className="flex flex-col gap-3.5 pt-2 animate-fade-in">
                {!dietesPersonalCarregades ? (
                  <div className="text-center py-4 text-xs text-white/40 italic flex items-center justify-center gap-2">
                    <Loader2 size={12} className="animate-spin text-emerald-400" /> Carregant el teu espai personal...
                  </div>
                ) : userSavedDiets.length === 0 ? (
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 text-center text-xs text-white/50 italic font-semibold leading-relaxed">
                    Encara no has guardat ni importat cap dieta. Guarda la teva dieta actual o importa'n una de l'acadèmia per veure-la aquí!
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {userSavedDiets.map((dieta) => {
                      // Comentari planer per a no-programadors:
                      // Calculem la suma dels nutrients de tots els àpats de la dieta desada i els arrodonim directament a nombres sans fent servir la funció Math.round.
                      // Així l'alumne no veurà decimals llargs o imprecisos a la targeta del seu resum personal.
                      const totalKcal = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.kcal || 0), 0));
                      const totalCarbs = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.carbs || 0), 0));
                      const totalProtes = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.protes || 0), 0));
                      const totalGreixos = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.greixos || 0), 0));
                      
                      return (
                        <div key={dieta.id} className="bg-[#00213d] border border-emerald-500/25 rounded-2xl p-4 flex flex-col gap-3 text-left">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <div className="flex flex-col">
                              <span className="text-white font-black italic text-sm">{dieta.nom}</span>
                              <span className="text-[8px] text-emerald-400/80 font-black uppercase mt-0.5">
                                {dieta.tipusGuardat === 'importada' ? "📥 Importada recentment" : "⭐ Dieta personal"}
                              </span>
                            </div>
                            <span className="text-emerald-400 font-black italic text-sm shrink-0">{totalKcal} kcal</span>
                          </div>
                          <p className="text-[11px] text-white/70 leading-relaxed font-sans">
                            {dieta.descripcio || (dieta.tipusGuardat === 'importada' ? "Còpia recent de la dieta acadèmica." : "La meva dieta personalitzada.")}
                          </p>
                          
                          <div className="bg-white/10 rounded-lg p-2.5 flex flex-col gap-1.5 text-[10px] font-sans">
                            <span className="text-white/40 uppercase font-black text-[8px] tracking-wider">Desglossament d'àpats inclosos:</span>
                            {['esmorzar', 'dinar', 'berenar', 'sopar', 'extres'].map(mom => {
                              const apSlot = (dieta.apats || []).filter((a: any) => a.apat === mom);
                              if (apSlot.length === 0) return null;
                              return (
                                <div key={mom} className="flex gap-1.5 leading-normal">
                                  <span className="font-bold text-emerald-400 uppercase text-[9px] shrink-0 w-14">{mom}:</span>
                                  <span className="text-white/70 truncate">{apSlot.map((a: any) => `${a.nomAliment} (${a.quantitat === 0 ? "S/Q" : `${a.quantitat}${a.unitat}`})`).join(', ')}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-white/10 rounded-lg p-2 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-white/40 uppercase">Nutrients totals</span>
                            <span className="text-emerald-300 font-bold">C: {totalCarbs}g | P: {totalProtes}g | G: {totalGreixos}g</span>
                          </div>

                          <div className="grid grid-cols-6 gap-2 mt-1">
                            <button
                              onClick={() => {
                                setDietaAConfirmarImportar(dieta);
                              }}
                              className="col-span-5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-[#00274d] py-2 px-4 rounded-xl font-black italic uppercase tracking-wider text-[10px] text-center transition-all cursor-pointer shadow-md"
                            >
                              📥 Importar a la calculadora
                            </button>
                            <button
                              onClick={() => setDietaADelete(dieta)}
                              className="col-span-1 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 active:scale-95 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                              title="Esborrar dieta"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BLOC 1: Dietes basades en KCAL */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 text-left shadow-lg">
            <div>
              <h3 className="text-sm font-black italic uppercase tracking-wider text-white">
                Mostra'm dietes basades en KCAL
              </h3>
              <p className="text-[10px] text-white/40 font-semibold mt-0.5">
                Plans estructurats segons l'objectiu de pes o la teva taxa metabòlica.
              </p>
            </div>

            {/* Comentari planer per a no-programadors:
                Aquest botó canvia dinàmicament d'aspecte segons si les dietes estan mostrades o no:
                - Si estan amagades: Es mostra de color verd amb el triangle apuntant a la dreta (Mostrar dietes ▶).
                - Si estan desplegades: Canvia a color taronja i el triangle passa a l'esquerra apuntant a l'esquerra (◀ Amagar dietes). */}
            <button
              onClick={() => setDietesKcalObertes(!dietesKcalObertes)}
              className={`w-full active:scale-95 py-3.5 px-4 rounded-xl font-black italic uppercase tracking-widest text-[11px] text-center transition-all cursor-pointer shadow-md ${
                dietesKcalObertes 
                  ? "bg-orange-500 hover:bg-orange-400 text-[#00274d] shadow-orange-500/15" 
                  : "bg-emerald-500 hover:bg-emerald-400 text-[#00274d] shadow-emerald-500/10"
              }`}
            >
              {dietesKcalObertes ? "◀ Amagar dietes" : "Mostrar dietes ▶"}
            </button>

            {/* EXPANDIBLE: Dietes basades en KCAL */}
            {dietesKcalObertes && (
              <div className="flex flex-col gap-3.5 pt-2 animate-fade-in">
                {/* Comentari planer per a no-programadors:
                   Ara només carreguem les dietes directament des de la base de dades (Firestore). 
                   Si s'està carregant es mostra una rodeta, i si acaba i no hi ha cap dieta creada per l'administrador amb tipus 'kcal',
                   mostrem el missatge que s'afegiran noves dietes en breus. */}
                {loadingDietes ? (
                  <div className="text-center py-4 text-xs text-white/40 italic flex items-center justify-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> Carregant dietes acadèmiques...
                  </div>
                ) : dietesBBDD.filter(d => d.tipus === 'kcal').length === 0 ? (
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 text-center text-xs text-white/50 italic font-semibold">
                    S'afegiran dietes noves en breus...
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-1.5 px-1">
                      <Sparkles size={12} className="text-emerald-400" />
                      <span className="text-[9px] font-black uppercase text-emerald-400/95 tracking-wider">Dietes de l'acadèmia OposiCAT (KCAL):</span>
                    </div>
                    {dietesBBDD.filter(d => d.tipus === 'kcal').map((dieta) => {
                      // Comentari planer per a no-programadors:
                      // Sumem de nou tots els nutrients de cada àpat de les dietes de KCAL i els arrodonim amb Math.round
                      // perquè quedi un disseny impecable i sense decimals llargs a la part inferior de cada dieta kcal.
                      const totalKcal = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.kcal || 0), 0));
                      const totalCarbs = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.carbs || 0), 0));
                      const totalProtes = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.protes || 0), 0));
                      const totalGreixos = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.greixos || 0), 0));
                      
                      return (
                        <div key={dieta.id} className="bg-emerald-950/45 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3 text-left">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-emerald-400 font-black italic text-sm">{totalKcal} kcal</span>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase truncate max-w-[150px]">{dieta.nom}</span>
                          </div>
                          <p className="text-[11px] text-white/80 leading-relaxed font-sans">{dieta.descripcio || "Sense descripció redactada."}</p>
                          
                          <div className="bg-white/10 rounded-lg p-2.5 flex flex-col gap-1.5 text-[10px] font-sans">
                            <span className="text-white/40 uppercase font-black text-[8px] tracking-wider">Desglossament d'àpats inclosos:</span>
                            {['esmorzar', 'dinar', 'berenar', 'sopar', 'extres'].map(mom => {
                              const apSlot = (dieta.apats || []).filter((a: any) => a.apat === mom);
                              if (apSlot.length === 0) return null;
                              return (
                                <div key={mom} className="flex gap-1.5 leading-normal">
                                  <span className="font-bold text-emerald-400 uppercase text-[9px] shrink-0 w-14">{mom}:</span>
                                  <span className="text-white/70 truncate">{apSlot.map((a: any) => `${a.nomAliment} (${a.quantitat === 0 ? "S/Q" : `${a.quantitat}${a.unitat}`})`).join(', ')}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-white/10 rounded-lg p-2 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-white/40 uppercase">Nutrients totals</span>
                            <span className="text-emerald-300 font-bold">C: {totalCarbs}g | P: {totalProtes}g | G: {totalGreixos}g</span>
                          </div>

                          <button
                            onClick={() => importarDieta(dieta)}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-[#00274d] py-2.5 px-4 rounded-xl font-black italic uppercase tracking-wider text-[10px] text-center transition-all cursor-pointer shadow-md"
                          >
                            📥 Importar dieta a la calculadora
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BLOC 2: Dietes basades en aliments */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 text-left shadow-lg">
            <div>
              <h3 className="text-sm font-black italic uppercase tracking-wider text-white">
                Mostrar dietes basades en aliments
              </h3>
              <p className="text-[10px] text-white/40 font-semibold mt-0.5">
                Plans adaptats segons les teves preferències o intoleràncies alimentàries.
              </p>
            </div>

            {/* Comentari planer per a no-programadors:
                Aquest botó canvia dinàmicament d'aspecte segons si les dietes de temàtica estan mostrades o no:
                - Si estan amagades: Es mostra de color verd amb el triangle apuntant a la dreta (Mostrar dietes ▶).
                - Si estan desplegades: Canvia a color taronja i el triangle passa a l'esquerra apuntant a l'esquerra (◀ Amagar dietes). */}
            <button
              onClick={() => setDietesAlimentsObertes(!dietesAlimentsObertes)}
              className={`w-full active:scale-95 py-3.5 px-4 rounded-xl font-black italic uppercase tracking-widest text-[11px] text-center transition-all cursor-pointer shadow-md ${
                dietesAlimentsObertes 
                  ? "bg-orange-500 hover:bg-orange-400 text-[#00274d] shadow-orange-500/15" 
                  : "bg-emerald-500 hover:bg-emerald-400 text-[#00274d] shadow-emerald-500/10"
              }`}
            >
              {dietesAlimentsObertes ? "◀ Amagar dietes" : "Mostrar dietes ▶"}
            </button>

            {/* EXPANDIBLE: Dietes basades en aliments */}
            {dietesAlimentsObertes && (
              <div className="flex flex-col gap-3.5 pt-2 animate-fade-in">
                {/* Comentari planer per a no-programadors:
                   Només carreguem les dietes directament des de la base de dades (Firestore) de tipus 'tematica' (aliments).
                   Si s'està carregant es mostra una rodeta, i si acaba i no hi ha cap dieta creada per l'administrador amb aquest tipus,
                   mostrem el missatge que s'afegiran noves dietes en breus. */}
                {loadingDietes ? (
                  <div className="text-center py-4 text-xs text-white/40 italic flex items-center justify-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> Carregant dietes acadèmiques...
                  </div>
                ) : dietesBBDD.filter(d => d.tipus === 'tematica').length === 0 ? (
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 text-center text-xs text-white/50 italic font-semibold">
                    S'afegiran dietes noves en breus...
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-1.5 px-1">
                      <Sparkles size={12} className="text-emerald-400" />
                      <span className="text-[9px] font-black uppercase text-emerald-400/95 tracking-wider">Dietes de l'acadèmia OposiCAT (Aliments/Temàtiques):</span>
                    </div>
                    {dietesBBDD.filter(d => d.tipus === 'tematica').map((dieta) => {
                      // Comentari planer per a no-programadors:
                      // Calculem la suma dels nutrients de tots els àpats i els arrodonim directament fent servir Math.round per garantir la visualització perfecta sense decimals.
                      const totalKcal = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.kcal || 0), 0));
                      const totalCarbs = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.carbs || 0), 0));
                      const totalProtes = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.protes || 0), 0));
                      const totalGreixos = Math.round((dieta.apats || []).reduce((acc: number, curr: any) => acc + (curr.greixos || 0), 0));
                      
                      return (
                        <div key={dieta.id} className="bg-emerald-950/45 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3 text-left">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-emerald-400 font-black italic text-sm">{dieta.nom}</span>
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase">Acadèmia</span>
                          </div>
                          <p className="text-[11px] text-white/80 leading-relaxed font-sans">{dieta.descripcio || "Sense descripció redactada."}</p>
                          
                          <div className="bg-white/10 rounded-lg p-2.5 flex flex-col gap-1.5 text-[10px] font-sans">
                            <span className="text-white/40 uppercase font-black text-[8px] tracking-wider">Desglossament d'àpats inclosos:</span>
                            {['esmorzar', 'dinar', 'berenar', 'sopar', 'extres'].map(mom => {
                              const apSlot = (dieta.apats || []).filter((a: any) => a.apat === mom);
                              if (apSlot.length === 0) return null;
                              return (
                                <div key={mom} className="flex gap-1.5 leading-normal">
                                  <span className="font-bold text-emerald-400 uppercase text-[9px] shrink-0 w-14">{mom}:</span>
                                  <span className="text-white/70 truncate">{apSlot.map((a: any) => `${a.nomAliment} (${a.quantitat === 0 ? "S/Q" : `${a.quantitat}${a.unitat}`})`).join(', ')}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-white/10 rounded-lg p-2 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-white/40 uppercase">Nutrients totals</span>
                            <span className="text-emerald-300 font-bold">C: {totalCarbs}g | P: {totalProtes}g | G: {totalGreixos}g ({totalKcal} kcal)</span>
                          </div>

                          <button
                            onClick={() => setDietaAConfirmarImportar(dieta)}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-[#00274d] py-2.5 px-4 rounded-xl font-black italic uppercase tracking-wider text-[10px] text-center transition-all cursor-pointer shadow-md"
                          >
                            📥 Importar dieta a la calculadora
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </main>
      ) : (
        <main className="w-full max-w-md flex flex-col gap-8 relative">
          
          {/* Explicació per a no-programadors: Aquest botó és el símbol de tornar a començar de la part superior dreta.
              Està situat de forma absoluta respecte al contenidor per encaixar de forma exacta amb el disseny mostrat a la imatge. */}
          <button 
            onClick={() => setShowResetModal(true)}
            className="absolute -top-3 right-1 w-10 h-10 rounded-xl bg-[#001f3d]/80 hover:bg-[#00274d] text-white/70 hover:text-emerald-400 border border-white/15 flex items-center justify-center active:scale-95 transition-all z-30 cursor-pointer shadow-md shadow-black/20"
            title="Tornar a començar"
            id="btn_tornar_a_comencar"
          >
            <RotateCcw size={18} />
          </button>

          {/* Explicació per a no-programadors: Primera finestra emergent (Pop-up). S'obre en prémer el botó de reiniciar i ofereix dues opcions clares de reset. */}
          {showResetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
              <div className="w-full max-w-sm bg-gradient-to-b from-[#001f3d] to-[#001122] border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in relative text-center">
                <button 
                  onClick={() => setShowResetModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 flex items-center justify-center border border-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>

                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <RotateCcw size={22} className="animate-[spin_2s_linear_infinite_reverse]" />
                </div>

                <h3 className="text-base font-black italic uppercase tracking-wider text-white">Tornar a començar</h3>
                <p className="text-[11px] text-white/50 mt-1 uppercase tracking-widest font-bold">OposiCAT Nutrició 🥗</p>

                <p className="text-xs text-white/70 leading-relaxed font-sans mt-4">
                  Selecciona quina acció de reinici d'alt rendiment desitges realitzar en el teu perfil:
                </p>

                <div className="flex flex-col gap-3 mt-6">
                  <button
                    onClick={() => {
                      setAliments([]);
                      setShowResetModal(false);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 text-white py-3.5 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer text-center"
                  >
                    🔄 Resetejar el dia (Kcal a 0)
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmQuizReset(true);
                      setShowResetModal(false);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#00274d] py-3.5 px-4 rounded-xl font-black italic uppercase text-[10px] tracking-wider transition-all active:scale-95 cursor-pointer text-center"
                  >
                    📝 Tornar a fer el qüestionari
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Explicació per a no-programadors: Segona finestra emergent de confirmació. S'obre quan l'estudiant clica per tornar a fer el qüestionari i serveix de tallafoc per advertir-lo de la pèrdua temporal de dades fins que finalitzi. */}
          {showConfirmQuizReset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-sm bg-gradient-to-b from-[#001f3d] to-[#001122] border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in relative text-center">
                
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={22} className="animate-bounce" />
                </div>

                <h3 className="text-base font-black italic uppercase tracking-wider text-amber-400">TORNAR A COMENÇAR?</h3>
                <p className="text-[11px] text-white/50 mt-1 uppercase tracking-widest font-bold">Edició del perfil nutricional</p>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 my-4 text-left">
                  <p className="text-xs text-amber-200/90 leading-relaxed font-sans font-medium">
                    ⚠️ Nota: Si continues, es reiniciarà el qüestionari i s'esborraran els valors introduïts per poder calcular de nou els teus macros des de zero.
                  </p>
                </div>

                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  Vols reiniciar les preguntes ara mateix?
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => setShowConfirmQuizReset(false)}
                    className="w-full bg-white/5 hover:bg-white/10 text-white/80 py-3 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer text-center"
                  >
                    CANCEL·LAR
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmQuizReset(false);
                      if (onResetQuiz) {
                        onResetQuiz();
                      }
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 px-4 rounded-xl font-black italic uppercase text-[10px] tracking-wider transition-all active:scale-95 cursor-pointer text-center"
                  >
                    SÍ, REINICIAR
                  </button>
                </div>
              </div>
            </div>
          )}

          {importSuccessMsg && (
            <div className="mx-1 bg-emerald-500/20 border border-emerald-500/45 text-emerald-300 p-4 rounded-2xl text-xs font-black uppercase tracking-wider text-center animate-pulse">
              🎉 {importSuccessMsg}
            </div>
          )}
          
          {/* CERCLE DE PROGRESSIÓ CENTRAL AMB FONS DETALLAT */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              {/* 1. GLOW DE FONS (RADIAL GRADIENT) */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-3xl" />
              <div className="absolute w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl" />
              
              {/* 2. DECORACIÓ "INTELLIGENCE" (LINIES RADAR SUBTILS) */}
              <div className="absolute inset-0 border border-white/10 rounded-full scale-[0.85]" />
              <div className="absolute inset-0 border border-white/10 rounded-full scale-[1.15] opacity-60" />
              
              {/* 3. MARQUES DE DADES (CROSSHAIRS) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-white/[0.03] scale-x-110" />
                <div className="h-full w-px bg-white/[0.03] scale-y-110" />
              </div>

              {/* SVG Arc de fons i progressió */}
              <svg className="w-full h-full -rotate-90 relative z-10">
                  <circle cx="128" cy="128" r="110" fill="transparent" stroke="rgba(255,255,255,0.18)" strokeWidth="11" />
                  <circle 
                      cx="128" cy="128" r="110" fill="transparent" 
                      stroke="url(#emeraldGradient)" strokeWidth="14" 
                      strokeDasharray="691"
                      strokeDashoffset={691 - (691 * percentKcal) / 100}
                      strokeLinecap="round"
                      className="shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  />
                  <defs>
                      <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#34d399" />
                           <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                  </defs>
              </svg>

              {/* CONTINGUT CENTRAL */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                  <span className="text-6xl font-black italic tracking-tighter text-white drop-shadow-lg">
                      {restants.kcal < 0 ? 0 : restants.kcal}
                  </span>
                  <div className="flex flex-col items-center mt-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/75 leading-none">Kcal restants</span>
                    <div className="h-px w-10 bg-white/25 my-3" />
                    <div className="flex items-center gap-1.5 bg-[#001f3d]/80 py-1.5 px-3 rounded-full border border-white/20 shadow-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black text-white italic uppercase tracking-wider">{totals.kcal} consumides</span>
                    </div>
                  </div>
              </div>
          </div>

          {/* BARS DE MACROS */}
          {/* Explicació per a no-programadors: Contenidor dels indicadors de macronutrients amb un fons fosc d'alta opacitat del 80% (bg-[#001f3d]/80) i efecte vidre per donar-li el màxim contrast i llegibilitat desitjat */}
          <div className="grid grid-cols-3 gap-4 bg-[#001f3d]/80 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl">
              {/* CARBS */}
              <div className="flex flex-col gap-2 text-left">
                  <div className="flex justify-between items-baseline">
                      <span className="text-[9px] font-black uppercase text-white/85 tracking-wider">Carbs</span>
                      <span className="text-[10px] font-black text-blue-400 italic">{totals.carbs}g<span className="text-white/40">/{targets.carbs}g</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
                      <div 
                          style={{ width: `${Math.min((totals.carbs / targets.carbs) * 100, 100)}%` }}
                          className="h-full bg-blue-400 rounded-full"
                      />
                  </div>
              </div>
              {/* PROTES */}
              <div className="flex flex-col gap-2 text-left">
                  <div className="flex justify-between items-baseline">
                      <span className="text-[9px] font-black uppercase text-white/85 tracking-wider">Protes</span>
                      <span className="text-[10px] font-black text-emerald-400 italic">{totals.protes}g<span className="text-white/40">/{targets.protes}g</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
                      <div 
                          style={{ width: `${Math.min((totals.protes / targets.protes) * 100, 100)}%` }}
                          className="h-full bg-emerald-400 rounded-full"
                      />
                  </div>
              </div>
              {/* GREIXOS */}
              <div className="flex flex-col gap-2 text-left">
                  <div className="flex justify-between items-baseline">
                      <span className="text-[9px] font-black uppercase text-white/85 tracking-wider">Greixos</span>
                      <span className="text-[10px] font-black text-yellow-400 italic">{totals.greixos}g<span className="text-white/40">/{targets.greixos}g</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
                      <div 
                          style={{ width: `${Math.min((totals.greixos / targets.greixos) * 100, 100)}%` }}
                          className="h-full bg-yellow-400 rounded-full"
                      />
                  </div>
              </div>
          </div>

          {/* LLISTA D'ÀPATS */}
          {/* Comentari planer per a no-programadors:
              Utilitzem mt-5 (marge de 20px) i gap-5 (espai de 20px) per aconseguir una simetria perfecta de separació entre el panell de macros, el botó d'accions ràpides i el primer àpat. */}
          <div className="flex flex-col gap-5 mt-5 mb-12">
            {/* BOTÓ D'ACCIONS RÀPIDES (Verd amb lletres blaves, meitat d'alçada) */}
            {/* Comentari planer per a no-programadors:
                Aquest botó d'accions ràpides és de color verd amb lletres blaves, ara té la meitat de l'alçada per ocupar menys espai a la pantalla i permet fer accions ràpides.
                S'ha eliminat el marge mb-1 per tal que la distància de separació es regeixi íntegrament pel gap-5, garantint una harmonia visual simètrica. */}
            <div className="bg-emerald-500 text-[#00274d] rounded-2xl overflow-hidden border border-emerald-400/40 shadow-lg min-h-[38px] flex items-center transition-all duration-300">
              {!accionsRapidesObertes ? (
                <button
                  onClick={() => setAccionsRapidesObertes(true)}
                  className="w-full h-full py-2 px-6 flex items-center justify-center gap-2.5 font-black italic uppercase tracking-wider text-[11px] cursor-pointer hover:bg-emerald-400 transition-colors"
                  id="btn_accions_rapides"
                >
                  <Sparkles size={14} className="text-[#00274d] shrink-0" />
                  Accions ràpides
                </button>
              ) : (
                <div className="w-full h-full grid grid-cols-2 divide-x divide-[#00274d]/20 self-stretch">
                  <button
                    onClick={() => {
                      setSubSeccio('dietes');
                      setDietesPersonalObertes(true);
                      setAccionsRapidesObertes(false);
                    }}
                    className="h-full py-2 px-3 flex items-center justify-center gap-2 font-black italic uppercase tracking-wider text-[10px] text-center hover:bg-emerald-400 transition-colors cursor-pointer"
                    id="btn_dietes_recents"
                  >
                    <History size={12} className="text-[#00274d] shrink-0" />
                    Dietes recents
                  </button>
                  <button
                    onClick={() => {
                      if (aliments.length === 0) {
                        alert("No pots desar una dieta buida. Afegeix algun aliment primer!");
                        return;
                      }
                      setSaveDietName("");
                      setShowSaveDietModal(true);
                    }}
                    className="h-full py-2 px-3 flex items-center justify-center gap-2 font-black italic uppercase tracking-wider text-[10px] text-center hover:bg-emerald-400 transition-colors cursor-pointer"
                    id="btn_guardar_dieta_actual"
                  >
                    <Save size={12} className="text-[#00274d] shrink-0" />
                    Guardar
                  </button>
                </div>
              )}
            </div>

            {[
                  { key: 'esmorzar', label: 'Esmorzar', icon: Coffee, color: 'text-yellow-400', bg: 'bg-yellow-400/15' },
                  { key: 'dinar', label: 'Dinar', icon: Sun, color: 'text-orange-400', bg: 'bg-orange-400/15' },
                  { key: 'berenar', label: 'Berenar', icon: Apple, color: 'text-emerald-400', bg: 'bg-emerald-400/15' },
                  { key: 'sopar', label: 'Sopar', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/15' },
                  { key: 'extres', label: 'Extres', icon: Utensils, color: 'text-purple-400', bg: 'bg-purple-400/15' }
              ].map((apat) => {
                  const apatAliments = aliments.filter(a => a.apat === apat.key);
                  const apatKcal = apatAliments.reduce((sum, a) => sum + a.kcal, 0);

                  return (
                      /* Explicació per a no-programadors: Botons/Targetes de cada àpat amb un fons del 80% d'opacitat (bg-[#001f3d]/80) i efecte vidre (backdrop-blur-md) per a un disseny unificat i un màxim contrast de l'aplicació davant de la imatge de fons */
                      <div key={apat.key} className="bg-[#001f3d]/80 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden text-left shadow-lg">
                          <div className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg ${apat.bg} flex items-center justify-center ${apat.color}`}>
                                      <apat.icon size={16} />
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-sm font-black italic uppercase tracking-tight text-white">{apat.label}</span>
                                      {apatAliments.length > 0 && (
                                          <span className="text-[10px] text-white/70 font-bold italic">
                                              {apatAliments.map(a => a.nom).join(', ')}
                                          </span>
                                      )}
                                  </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  <span className="text-xs font-black text-white italic">{apatKcal} cal</span>
                                  <button 
                                      onClick={() => setShowAddModal(apat.key)}
                                      className="w-8 h-8 rounded-lg bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/40 flex items-center justify-center border border-emerald-500/20"
                                  >
                                      <Plus size={16} />
                                  </button>
                              </div>
                          </div>
                          
                          {/* Llistat d'aliments inserits a l'àpat (Sense AnimatePresence) */}
                          {apatAliments.map(alim => (
                              <div 
                                  key={alim.id} 
                                  className="px-4 pb-3 flex items-center justify-between group border-t border-white/5 pt-2"
                              >
                                  <div className="flex items-center gap-1.5 pl-11">
                                      {alim.pendent && (
                                          <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                                      )}
                                      <span className="text-xs text-white/85 italic">
                                          {alim.nom}
                                      </span>
                                  </div>
                                  <div className="flex items-center gap-2.5 pr-2">
                                      {/* Comentari planer per a no-programadors:
                                          Aquest botó permet editar ràpidament el pes de l'aliment de l'àpat de l'estudiant de forma immediata, 
                                          obrint la finestra modal de "Quina quantitat?" amb el valor que tenia desat. */}
                                      <button 
                                          onClick={() => iniciarModificacioAliment(alim)} 
                                          title="Modificar quantitat"
                                          className="text-emerald-400/60 hover:text-emerald-400 transition-colors p-1"
                                      >
                                          <Edit2 size={13} />
                                      </button>
                                      <button 
                                          onClick={() => removeAliment(alim.id)} 
                                          title="Eliminar aliment"
                                          className="text-red-400/50 hover:text-red-400 transition-colors p-1"
                                      >
                                          <X size={14} />
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  );
              })}
          </div>

          {/* Comentari per a no-programadors:
              Botó "Fer la compra" idèntic al de la pestanya de dietes, col·locat al final del llistat d'àpats de la calculadora. */}
          <div className="px-1 mb-12">
            <button
              onClick={() => {
                setVeureLlistaAlimentsCompra(false); // Reiniciem la vista de la llista en obrir la modal
                setShowCompraModal(true);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-[#00274d] py-4 px-6 rounded-2xl font-black italic uppercase tracking-wider text-xs text-center transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Fer la compra 🛒
            </button>
          </div>

        </main>
      )}

      {/* Comentari planer per a no-programadors: 
          Barra inferior redissenyada clàssica dels 4 botons oficials d'OposiCAT per a màxima coherència de l'aplicació */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#13355c]/95 backdrop-blur-md border-t border-white/20 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-300"
        style={{ paddingBottom: "calc(5px + env(safe-area-inset-bottom, 6px))" }}
      >
        <div className="w-full max-w-md grid grid-cols-4 gap-1">
          
          {/* Botó 1: Casa (Inici) */}
          <button 
            onClick={() => {
              if (onAnarSeccio) {
                onAnarSeccio('home');
              } else {
                onTornar();
              }
            }}
            className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
          >
            <Home className="w-6 h-6 text-slate-300 group-hover:text-white transition-all group-hover:scale-115" />
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Inici
            </span>
          </button>

          {/* Botó 2: Fòrum */}
          <button 
            onClick={() => {
              if (onAnarSeccio) {
                onAnarSeccio('forum');
              }
            }}
            className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 text-pink-400/60 group-hover:text-pink-400 transition-all group-hover:scale-115" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75 font-bold"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
            </div>
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Fòrum 💬
            </span>
          </button>

          {/* Botó 3: Notícies */}
          <button 
            onClick={() => {
              if (onAnarSeccio) {
                onAnarSeccio('noticies');
              }
            }}
            className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
          >
            <div className="relative">
              <Bell className="w-6 h-6 text-white/60 group-hover:text-white transition-all group-hover:scale-115" />
            </div>
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Notícies
            </span>
          </button>

          {/* Botó 4: Perfil */}
          <button 
            onClick={() => {
              if (onAnarSeccio) {
                onAnarSeccio('perfil');
              }
            }}
            className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
          >
            <div className="relative">
              <span className="text-[20px] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
                {avatarEstil}
              </span>
              <span className="absolute -top-1 -right-1 text-[8px] animate-pulse">⭐</span>
            </div>
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Perfil 👮‍♂️
            </span>
          </button>

        </div>
      </div>

      </div> {/* Explicació per a no-programadors: tanquem el div relative de z-10 que conté tot el disseny principal de la pantalla */}

      {/* MODAL D'AFEGIR (Simulat) */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
              <div 
                  className="w-full max-w-md bg-[#00274d] border border-white/10 rounded-t-3xl p-6 pb-12 flex flex-col gap-6 shadow-2xl"
              >
                  <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black italic uppercase text-emerald-400">Afegir a {showAddModal}</h3>
                      <button onClick={() => setShowAddModal(null)} className="text-white/20 hover:text-white"><X /></button>
                  </div>

                  {/* Comentari planer per a no-programadors:
                      Afegim un cercador interactiu a dalt de tot de costat amb un botó de color grog de la mateixa alçada per donar d'alta nous aliments. */}
                  <div className="flex gap-2 items-center w-full" id="buscador-aliments-modal-container">
                      <div className="relative flex-1 h-[46px]" id="buscador-aliments-modal">
                          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/60" />
                          <input 
                              type="text"
                              value={cercaText}
                              onChange={(e) => setCercaText(e.target.value)}
                              placeholder="Cerca un aliment pel seu nom... (ex: pit de pollastre)"
                              className="w-full h-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-3 pl-11 pr-10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all"
                          />
                          {cercaText && (
                              <button 
                                  onClick={() => setCercaText("")}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                              >
                                  <X size={14} />
                              </button>
                          )}
                      </div>
                      <button
                          onClick={() => setShowAltaAlimentModal(true)}
                          className="w-[46px] h-[46px] bg-amber-500 hover:bg-amber-400 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer shadow-lg shadow-amber-500/10"
                          title="Donar d'alta un aliment"
                      >
                          <Plus size={22} className="stroke-[3]" />
                      </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-1">
                      {loadingAliments ? (
                          <div className="flex flex-col items-center justify-center p-8 gap-2 text-white/40 text-xs italic">
                              <Loader2 size={24} className="animate-spin text-emerald-400" />
                              <span>Carregant banc d'aliments d'OposiCAT...</span>
                          </div>
                      ) : alimentsFiltrats.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-8 text-white/40 text-xs italic text-center">
                              {cercaText.trim() !== "" ? (
                                  <span>No s'ha trobat cap aliment que contingui "{cercaText}". Intenta fer una altra cerca.</span>
                              ) : (
                                  <span>No hi ha cap aliment al banc d'aliments recomanat per al moment "{showAddModal}". Pots donar-lo d'alta des del Backoffice de l'aplicació.</span>
                              )}
                          </div>
                      ) : (
                          alimentsFiltrats.map(alim => {
                              const nomNet = netejarNomAliment(alim.nom);
                              return (
                                  <div 
                                      key={alim.nom}
                                      className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-between gap-4 group transition-all text-left"
                                  >
                                      <button 
                                          onClick={() => {
                                              if (alim.pendent) {
                                                  setAlimentPendentAConfirmar(alim);
                                              } else {
                                                  setAlimentAConfigurar(alim);
                                                  setMomentSeleccionat(showAddModal);
                                                  setQuantitatIntroduida(100);
                                              }
                                          }}
                                          className="flex-1 flex flex-col text-left cursor-pointer focus:outline-none"
                                      >
                                          <div className="flex items-center gap-1.5">
                                              {alim.pendent && (
                                                  <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                                              )}
                                              <span className="text-sm font-bold text-white/80">{nomNet}</span>
                                          </div>
                                          <span className="text-[10px] text-white/30 uppercase tracking-widest">{alim.kcal} kcal | C:{alim.carbs}g P:{alim.protes}g G:{alim.greixos}g</span>
                                      </button>
                                      
                                      <div className="flex items-center gap-2 shrink-0">
                                          <button 
                                              onClick={() => {
                                                  if (alim.pendent) {
                                                      setAlimentPendentAConfirmar(alim);
                                                  } else {
                                                      setAlimentAConfigurar(alim);
                                                      setMomentSeleccionat(showAddModal);
                                                      setQuantitatIntroduida(100);
                                                  }
                                              }}
                                              className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/10 cursor-pointer"
                                              title="Afegir aliment"
                                          >
                                              <Plus size={16} />
                                          </button>
                                      </div>
                                  </div>
                              );
                          })
                      )}
                      
                      {hiHaMesAliments && !loadingAliments && alimentsFiltrats.length >= 20 && (
                          <button
                              onClick={() => carregarAlimentsBBDD(false, cercaText)}
                              className="w-full py-2.5 mt-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                              Carregar més aliments 🔄
                          </button>
                      )}
                      
                      {hiHaMesAliments && loadingAliments && alimentsFiltrats.length > 0 && (
                          <div className="flex items-center justify-center py-2.5 gap-2 text-white/40 text-xs italic">
                              <Loader2 size={16} className="animate-spin text-emerald-400" />
                              <span>Carregant més...</span>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Explicació planer per a no-programadors:
          Aquesta és la finestra emergent (Pop-up) interactiva de fixació de ració/quantitat de l'aliment.
          Permet indicar exactament els grams o mil·lilitres desitjats, recalculant a temps real tots els macros mitjançant regla de tres. */}
      {alimentAConfigurar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#001f3d] to-[#001122] border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in relative text-center flex flex-col">
            
            <h3 className="text-xl font-black italic uppercase tracking-wider text-emerald-400">
              Quina quantitat ?
            </h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-extrabold leading-normal">
              {netejarNomAliment(alimentAConfigurar.nom)} 🥗
            </p>

            {/* Explicació per a no-programadors: Botó per desplegar un subformulari que permet editar tant el nom com els nutrients de l'aliment a l'instant */}
            <button
              onClick={() => setMostrarEdicioDetalls(!mostrarEdicioDetalls)}
              className="mt-2 text-[10px] font-black text-emerald-400 hover:text-emerald-300 underline uppercase tracking-wider cursor-pointer transition-colors"
            >
              {mostrarEdicioDetalls ? "▲ Amagar edició de l'aliment" : "✏️ Modificar nom o nutrients de l'aliment"}
            </button>

            {mostrarEdicioDetalls && (
              <div className="flex flex-col gap-3 mt-4 text-left border border-white/10 bg-black/40 p-4 rounded-2xl max-h-[30vh] overflow-y-auto pr-1 animate-fade-in">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-white/45 tracking-wider">Nom de l'aliment:</span>
                  <input
                    type="text"
                    value={alimentAConfigurar.nom || ""}
                    onChange={(e) => setAlimentAConfigurar({ ...alimentAConfigurar, nom: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase text-white/45 tracking-wider">Kcal base (100g):</span>
                    <input
                      type="number"
                      value={alimentAConfigurar.kcal ?? ""}
                      onChange={(e) => setAlimentAConfigurar({ ...alimentAConfigurar, kcal: Number(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase text-white/45 tracking-wider">Proteïna (100g):</span>
                    <input
                      type="number"
                      value={alimentAConfigurar.protes ?? ""}
                      onChange={(e) => setAlimentAConfigurar({ ...alimentAConfigurar, protes: Number(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase text-white/45 tracking-wider">Grasses (100g):</span>
                    <input
                      type="number"
                      value={alimentAConfigurar.greixos ?? ""}
                      onChange={(e) => setAlimentAConfigurar({ ...alimentAConfigurar, greixos: Number(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black uppercase text-white/45 tracking-wider">Carbohidrats (100g):</span>
                    <input
                      type="number"
                      value={alimentAConfigurar.carbs ?? ""}
                      onChange={(e) => setAlimentAConfigurar({ ...alimentAConfigurar, carbs: Number(e.target.value) || 0 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quadrant dividit en creu en 4 parts per mostrar els valors recalculats proporcionalment */}
            <div className="relative grid grid-cols-2 gap-y-4 gap-x-2 p-5 border border-white/10 rounded-2xl bg-black/25 my-5 text-left overflow-hidden">
              {/* Línia vertical de la creu */}
              <div className="absolute top-4 bottom-4 left-1/2 w-[1px] bg-white/10 -translate-x-1/2 pointer-events-none" />
              {/* Línia horitzontal de la creu */}
              <div className="absolute left-4 right-4 top-1/2 h-[1px] bg-white/10 -translate-y-1/2 pointer-events-none" />

              <div className="flex flex-col pl-2 py-1">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">KCAL:</span>
                <span className="text-base font-black text-white italic mt-0.5">{recalculs.kcal}</span>
              </div>
              
              <div className="flex flex-col pl-4 py-1">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Proteïna:</span>
                <span className="text-base font-black text-emerald-400 italic mt-0.5">{recalculs.protes}g</span>
              </div>

              <div className="flex flex-col pl-2 py-1">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Grasses:</span>
                <span className="text-base font-black text-amber-400 italic mt-0.5">{recalculs.greixos}g</span>
              </div>

              <div className="flex flex-col pl-4 py-1">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Carbohidrats:</span>
                <span className="text-base font-black text-sky-400 italic mt-0.5">{recalculs.carbs}g</span>
              </div>
            </div>

            {/* Input per "Introduir quantitat" amb les unitats corresponents */}
            <div className="flex flex-col gap-1.5 text-left mb-6">
              <label className="text-[10px] font-black uppercase text-emerald-400/80 tracking-wider">
                Introduir quantitat:
              </label>
              <div className="relative">
                <input 
                  type="number"
                  value={quantitatIntroduida === 0 ? "" : quantitatIntroduida}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                    setQuantitatIntroduida(val >= 0 ? val : 0);
                  }}
                  min="0"
                  max="5000"
                  placeholder="Ex: 100"
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-3 pl-4 pr-16 text-sm text-white focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all font-bold animate-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black italic uppercase text-emerald-400/70 select-none">
                  {(alimentAConfigurar.nom || "").toLowerCase().includes("ml") || 
                   (alimentAConfigurar.nom || "").toLowerCase().includes("llet") || 
                   (alimentAConfigurar.nom || "").toLowerCase().includes("beguda") ||
                   (alimentAConfigurar.nom || "").toLowerCase().includes("suc") || 
                   (alimentAConfigurar.nom || "").toLowerCase().includes("oli") ||
                   (alimentAConfigurar.nom || "").toLowerCase().includes("brou")
                   ? "ml" : "gr"}
                </span>
              </div>
              <p className="text-[9px] text-white/30 italic">
                * Introduït per defecte sobre una base de referència de 100gr / 100ml.
              </p>
            </div>

            {/* Botons "Acceptar" i "Enrere" disposats segons el dibuix de Paint */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  addAliment(alimentAConfigurar, momentSeleccionat, quantitatIntroduida);
                  setAlimentAConfigurar(null);
                  setMostrarEdicioDetalls(false);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#00274d] py-3.5 px-4 rounded-xl font-black italic uppercase text-[11px] tracking-wider transition-all active:scale-95 cursor-pointer text-center shadow-md shadow-emerald-500/10"
              >
                Acceptar
              </button>
              <button
                onClick={() => {
                  setAlimentAConfigurar(null);
                  setAlimentIdAEditar(null);
                  setMostrarEdicioDetalls(false);
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-3.5 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer text-center"
              >
                Enrere
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Pop-up d'advertència per a aliments no acceptats oficialment pels nostres nutricionistes */}
      {alimentPendentAConfirmar && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/75 backdrop-blur-md text-left">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#001f3d] to-[#001122] border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in text-center flex flex-col gap-4">
            
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle className="text-amber-500" size={24} />
            </div>

            <div>
              <h3 className="text-lg font-black italic uppercase tracking-wider text-amber-400">
                Atenció: Aliment pendent de validació
              </h3>
              <p className="text-xs text-white/80 mt-2 leading-relaxed font-sans font-medium">
                Aquest aliment pot tenir errors ja que vostè l'ha donat d'alta i encara no està acceptat des de l'APP pels nostres nutricionistes.
              </p>
            </div>

            {/* Botons d'acció "Afegir" i "Cancel·lar" */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => {
                  setAlimentAConfigurar(alimentPendentAConfirmar);
                  setMomentSeleccionat(showAddModal || "extres");
                  setQuantitatIntroduida(100);
                  setAlimentPendentAConfirmar(null);
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 px-4 rounded-xl font-black italic uppercase text-[10px] tracking-wider transition-all active:scale-95 cursor-pointer text-center"
              >
                Afegir
              </button>
              <button
                onClick={() => {
                  setAlimentPendentAConfirmar(null);
                }}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-3.5 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer text-center"
              >
                Cancel·lar
              </button>
            </div>

          </div>
        </div>
      )}



      {/* Explicació planer per a no-programadors:
          Aquest és el pop-up per "Donar d'alta aliment". S'obre quan l'usuari clica el botó groc "+"
          i conté un breu formulari amb el nom de l'aliment, descripció i els seus valors de macros (KCal, protes, grasses, carbs).
          A més, ara integra un sistema intel·ligent que detecta si s'està intentant afegir un duplicat (similitud superior al 90%),
          permetent a l'usuari seleccionar l'existent directament o continuar amb el registre. */}
      {showAltaAlimentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#001f3d] to-[#001122] border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in text-left flex flex-col gap-4">
            
            {alimentsSimilarsTrobats.length > 0 ? (
              // VISTA DE DETECCIÓ DE SIMILITUD (Més del 90% coincident)
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="text-amber-500 animate-pulse" size={24} />
                  </div>
                  <h3 className="text-base font-black italic uppercase tracking-wider text-amber-400">
                    Aliment molt similar trobat!
                  </h3>
                  <p className="text-[11px] text-white/70 mt-2 leading-relaxed font-sans font-medium">
                    Hem detectat que l'aliment que vols registrar s'assembla molt a un que ja és oficial:
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
                  {alimentsSimilarsTrobats.map((sim, idx) => {
                    const nomNetejat = netejarNomAliment(sim.nom);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          // Si l'usuari tria l'existent, configurem la seva quantitat i tanquem la finestra de creació
                          setAlimentAConfigurar(sim);
                          setMomentSeleccionat(showAddModal || "extres");
                          setQuantitatIntroduida(100);
                          setShowAltaAlimentModal(false);
                          setAlimentsSimilarsTrobats([]);
                        }}
                        className="w-full p-3 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between group transition-all text-left"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {nomNetejat}
                          </span>
                          <span className="text-[9px] text-white/40">
                            {sim.kcal} kcal | C:{sim.carbs}g P:{sim.protes}g G:{sim.greixos}g
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/10 uppercase tracking-wider">
                            {sim.similitudPercent}%
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 group-hover:underline">
                            Seleccionar
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-white/10 my-1" />

                <div className="flex flex-col gap-2">
                  <button
                    onClick={executarAltaAliment}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-[#00274d] py-3.5 px-4 rounded-xl font-black italic uppercase text-[10px] tracking-wider transition-all active:scale-95 cursor-pointer text-center"
                  >
                    No, és diferent. Crear igualment
                  </button>
                  <button
                    onClick={() => {
                      setAlimentsSimilarsTrobats([]);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer text-center"
                  >
                    Torna enrere / Editar
                  </button>
                </div>
              </div>
            ) : (
              // FORMULARI NORMAL DE REGISTRE
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-wider text-amber-400 text-center">
                    Donar d'alta aliment
                  </h3>
                  <p className="text-[11px] text-white/60 mt-2 leading-relaxed font-sans font-medium text-center">
                    No trobes un aliment? Dona'l d'alta de forma ràpida per a tu mateix i ajuda'ns a millorar la nostra base de dades (pot tardar uns dies a sortir per a la resta d'usuaris).
                  </p>
                </div>

                <form onSubmit={handleAltaAlimentSubmit} className="flex flex-col gap-3">
                  {/* Nom de l'aliment */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-emerald-400/80 tracking-wider">Nom de l'aliment</label>
                    <input 
                      type="text"
                      required
                      value={altaNom}
                      onChange={(e) => setAltaNom(e.target.value)}
                      placeholder="Ex: Formatge Cottage"
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all font-sans font-medium"
                    />
                  </div>

                  {/* Breu descripció */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase text-emerald-400/80 tracking-wider">Breu descripció</label>
                    <input 
                      type="text"
                      value={altaDescripcio}
                      onChange={(e) => setAltaDescripcio(e.target.value)}
                      placeholder="És un tipus de formatge. Especialment baix en grassa."
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all font-sans font-medium"
                    />
                  </div>

                  {/* Grid de macros */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* KCal */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-emerald-400/80 tracking-wider">KCal (per 100g)</label>
                      <input 
                        type="number"
                        required
                        value={altaKcal}
                        onChange={(e) => setAltaKcal(e.target.value)}
                        placeholder="Ex: 200"
                        min="0"
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all font-sans font-medium"
                      />
                    </div>

                    {/* Proteïna */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-emerald-400/80 tracking-wider">Proteïna (g)</label>
                      <input 
                        type="number"
                        required
                        value={altaProteines}
                        onChange={(e) => setAltaProteines(e.target.value)}
                        placeholder="Ex: 12"
                        min="0"
                        step="0.1"
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all font-sans font-medium"
                      />
                    </div>

                    {/* Grasses */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-emerald-400/80 tracking-wider">Grasses (g)</label>
                      <input 
                        type="number"
                        required
                        value={altaGrasses}
                        onChange={(e) => setAltaGrasses(e.target.value)}
                        placeholder="Ex: 4"
                        min="0"
                        step="0.1"
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all font-sans font-medium"
                      />
                    </div>

                    {/* Carbohidrats */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black uppercase text-emerald-400/80 tracking-wider">Carbohidrats (g)</label>
                      <input 
                        type="number"
                        required
                        value={altaCarbohidrats}
                        onChange={(e) => setAltaCarbohidrats(e.target.value)}
                        placeholder="Ex: 3"
                        min="0"
                        step="0.1"
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all font-sans font-medium"
                      />
                    </div>
                  </div>

                  {/* Botons d'acció */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 px-4 rounded-xl font-black italic uppercase text-[10px] tracking-wider transition-all active:scale-95 cursor-pointer text-center"
                    >
                      Afegir aliment
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAltaAlimentModal(false)}
                      className="w-full bg-white/5 hover:bg-white/10 text-white py-3.5 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer text-center"
                    >
                      Enrere
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Explicació planer per a no-programadors:
          Aquest és el pop-up d'agraïment i d'èxit que confirma que l'aliment s'ha registrat localment per a ell
          i serà revisat per a que estigui disponible per a tota la comunitat d'opositors. */}
      {showAltaAlimentSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#00274d] to-[#001122] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl animate-fade-in text-center flex flex-col items-center">
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Check size={22} className="stroke-[3]" />
            </div>

            <h4 className="text-base font-black italic uppercase text-emerald-400 mb-2">
              ALIMENT DONAT D'ALTA!
            </h4>

            <p className="text-xs text-white/90 leading-relaxed font-sans font-medium mb-6">
              L'aliment ja el tens de forma disponible únicament per a tu. Per a que sigui visible i aprovat per als demés, un expert es revisarà l'aliment i l'aprovarà o denegarà.
              <br /><br />
              Moltes gràcies per ajudar-nos a fer OposiCAT millor!
            </p>

            <button
              onClick={() => setShowAltaAlimentSuccess(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#00274d] py-3.5 px-4 rounded-xl font-black italic uppercase text-[11px] tracking-wider transition-all active:scale-95 cursor-pointer text-center"
            >
              De rés!
            </button>

          </div>
        </div>
      )}

      {/* Comentari per a no-programadors:
          Aquesta és la finestra emergent (modal) de "Fer la compra". 
          S'activa quan l'usuari prem el botó corresponent i ofereix dues opcions molt potents:
          1. Plusfresc (Supermercats oficials amb els ingredients frescos)
          2. Prozis (Nutrició esportiva per a optimitzar el rendiment dels opositors) */}
      {showCompraModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#00274d] border border-white/10 rounded-t-3xl p-6 pb-12 flex flex-col gap-5 shadow-2xl overflow-y-auto max-h-[85vh] text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-emerald-400" size={20} />
                <h3 className="text-lg font-black italic uppercase text-white tracking-wide">Fer la compra 🛒</h3>
              </div>
              <button 
                onClick={() => {
                  setShowCompraModal(false);
                  setCopiatCodi(false);
                }} 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed font-sans">
              Tria el teu establiment preferit per adquirir els aliments de la teva dieta o suplements esportius i optimitzar els teus entrenaments per a Mossos.
            </p>

            <div className="flex flex-col gap-4">
              
              {/* OPCIÓ 1: PLUSFRESC */}
              <div className="bg-gradient-to-br from-emerald-950/20 to-slate-900/60 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Supermercat</span>
                      <span className="text-[9px] bg-white/10 text-white/80 font-bold px-2 py-0.5 rounded-md uppercase">Oficial</span>
                    </div>
                    <h4 className="text-base font-black italic text-white mt-1.5 uppercase tracking-wide">Plusfresc</h4>
                  </div>
                  <span className="text-xl">🍏</span>
                </div>
                
                <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                  Supermercat de proximitat a Catalunya especialitzat en productes frescos, peix, verdures i carns magres ideals per a la preparació de les oposicions de Mossos.
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <a 
                    href="https://www.plusfresc.es" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-[#00274d] py-3 px-4 rounded-xl font-black italic uppercase tracking-wider text-[10px] text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/5 cursor-pointer"
                  >
                    Anar a Plusfresc Supermercats
                    <ExternalLink size={12} />
                  </a>

                  {/* Llista de la compra dinàmica basada en els aliments actuals del cistell de la calculadora */}
                  <button
                    onClick={() => setVeureLlistaAlimentsCompra(!veureLlistaAlimentsCompra)}
                    className="w-full bg-white/5 hover:bg-white/10 text-white/80 py-2.5 px-4 rounded-xl font-bold text-[10px] text-center transition-all flex items-center justify-center gap-1.5 border border-white/5 cursor-pointer"
                  >
                    {veureLlistaAlimentsCompra ? "Amagar llista d'aliments" : "Veure llista de la meva dieta per anar-hi 📝"}
                  </button>

                  {veureLlistaAlimentsCompra && (
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2 mt-1 animate-fade-in text-left">
                      <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Llista de la compra OposiCAT:</span>
                      {aliments.length === 0 ? (
                        <p className="text-[10px] text-white/40 italic leading-normal">
                          La teva calculadora de dieta està buida. Afegeix algun aliment (com pit de pollastre, arròs o ous) per poder generar la llista d'ingredients!
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {Array.from(new Set(aliments.map(a => a.nom))).map((nom, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] text-white/80 font-sans">
                              <span className="text-emerald-400 font-bold select-none">✔</span>
                              <span>{nom}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* OPCIÓ 2: PROZIS */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Suplements</span>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-md uppercase">10% dte</span>
                    </div>
                    <h4 className="text-base font-black italic text-white mt-1.5 uppercase tracking-wide">Prozis</h4>
                  </div>
                  <span className="text-xl">⚡</span>
                </div>
                
                <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                  Líder europeu en nutrició esportiva, clares d'ou líquides, civada fina en pols, greixos sans i suplements de proteïna per potenciar el press de banca.
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <a 
                    href="https://www.prozis.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-[#00274d] py-3 px-4 rounded-xl font-black italic uppercase tracking-wider text-[10px] text-center transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/5 cursor-pointer"
                  >
                    Anar a la botiga Prozis
                    <ExternalLink size={12} />
                  </a>

                  {/* Acció de copiar cupó promocional exclusiu */}
                  <button
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText("OPOSICAT10");
                      } catch (err) {
                        console.warn("No es pot copiar automàticament:", err);
                      }
                      setCopiatCodi(true);
                      setTimeout(() => setCopiatCodi(false), 2500);
                    }}
                    className="w-full bg-[#13355c] hover:bg-[#184273] text-emerald-400 py-2.5 px-4 rounded-xl font-bold text-[10px] text-center transition-all flex items-center justify-center gap-1.5 border border-emerald-500/20 cursor-pointer"
                  >
                    {copiatCodi ? "✓ CODI COPIAT!" : "Codi descompte: OPOSICAT10 (Clica per copiar)"}
                  </button>
                </div>
              </div>

            </div>

            <div className="text-center pt-2 border-t border-white/10 mt-2">
              <span className="text-[9px] text-white/30 uppercase tracking-widest font-black leading-none font-sans">
                OposiCAT • Compra de forma intel·ligent
              </span>
            </div>

          </div>
        </div>
      )}

    {/* Comentari planer per a no-programadors:
          Aquesta és la finestra de confirmació pedagògica per a la importació de dietes models (templates).
          S'activa quan s'intenta importar una dieta model d'aliments des del Bloc 2 de la secció de dietes,
          recordant que té una funció orientativa/didàctica i que és l'alumne qui ha de reajustar-ne els valors. */}
      {dietaAConfirmarImportar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-5">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#001f3d] to-[#001122] border border-white/15 rounded-3xl p-6 shadow-2xl animate-fade-in text-left flex flex-col gap-4">
            
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle size={20} className="shrink-0" />
              <h3 className="text-base font-black italic uppercase tracking-wider">
                Importar Dieta Model 📢
              </h3>
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-sans font-medium opacity-90">
              Estàs a punt d'importar una dieta model. Aquesta plantilla ofereix una proposta estructural dels aliments recomanats per a cada àpat, de manera que és l'alumne qui ha d'ajustar les quantitats en funció de les seves necessitats i objectius personals. Aquests menús tenen un caràcter merament orientatiu i educatiu.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => setDietaAConfirmarImportar(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  importarDieta(dietaAConfirmarImportar);
                  setDietaAConfirmarImportar(null);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#00274d] py-3 px-4 rounded-xl font-black italic uppercase text-[11px] tracking-wider transition-all active:scale-95 cursor-pointer text-center shadow-lg shadow-emerald-500/10"
              >
                Importar dieta
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Comentari planer per a no-programadors:
          Aquesta modal s'obre per preguntar a l'alumne quin nom li vol donar a la seva dieta que vol desar.
          Requereix un mínim de 1 caràcter, està dissenyada amb estètica d'esferes i colors de la marca OposiCAT. */}
      {showSaveDietModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-5">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#001f3d] to-[#001122] border border-white/15 rounded-3xl p-6 shadow-2xl animate-fade-in text-left flex flex-col gap-4">
            
            <div className="flex items-center gap-2 text-emerald-400">
              <Save size={20} className="shrink-0" />
              <h3 className="text-base font-black italic uppercase tracking-wider">
                Guardar dieta actual ⭐
              </h3>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-sans">
              Dóna un nom descriptiu a la teva combinació actual d'aliments per desar-la a l'Àrea personal:
            </p>

            <form onSubmit={handleGuardarDietaSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase text-emerald-400/80 tracking-wider">Nom de la dieta</label>
                <input 
                  type="text"
                  required
                  value={saveDietName}
                  onChange={(e) => setSaveDietName(e.target.value)}
                  placeholder="Ex: La meva dieta de volum"
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 rounded-xl py-3 px-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all font-sans font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowSaveDietModal(false)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#00274d] py-3 px-4 rounded-xl font-black italic uppercase text-[10px] tracking-wider transition-all active:scale-95 cursor-pointer text-center shadow-lg shadow-emerald-500/10"
                >
                  Guardar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Comentari planer per a no-programadors:
          Aquesta modal es mostra quan l'usuari clica per esborrar una dieta desada o importada recent de l'Àrea personal.
          Demana confirmació per prevenir errors accidentals que facin perdre la feina d'estudi o de dieta a l'opositor. */}
      {dietaADelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-5">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#001f3d] to-[#001122] border border-white/15 rounded-3xl p-6 shadow-2xl animate-fade-in text-left flex flex-col gap-4">
            
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={20} className="shrink-0" />
              <h3 className="text-base font-black italic uppercase tracking-wider">
                Esborrar dieta ⚠️
              </h3>
            </div>

            <p className="text-xs text-white/90 leading-relaxed font-sans">
              Estàs completament segur que vols eliminar permanentment la teva dieta desada <strong>"{dietaADelete.nom}"</strong> de la teva Àrea personal? Aquesta acció no es pot desfer.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => setDietaADelete(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border border-white/10 active:scale-95 cursor-pointer text-center"
              >
                No, mantenir
              </button>
              <button
                type="button"
                onClick={handleEliminarDietaPersonal}
                className="w-full bg-red-500 hover:bg-red-400 text-white py-3 px-4 rounded-xl font-black italic uppercase text-[10px] tracking-wider transition-all active:scale-95 cursor-pointer text-center shadow-lg shadow-red-500/10"
              >
                Sí, esborrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
