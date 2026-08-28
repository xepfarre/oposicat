import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  X, 
  RefreshCw, 
  Database, 
  Info,
  Apple,
  User,
  AlertTriangle,
  Mail,
  Send,
  Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { netejarNomAliment } from "../oposimossos/prova_practica/calculadora_dieta";

// Comentari planer per a no-programadors:
// Aquesta funció genera les paraules clau (tokens) d'un aliment en minúscules per poder fer cerques ultra precises
// a la base de dades sense importar l'ordre o si estan en majúscules o minúscules.
const generarTokensDeCerca = (nom: string): string[] => {
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
// Definim l'estructura que té una "Notificació de Feedback de Dieta".
// Cada feedback conté les dades de l'estudiant, l'aliment afectat, el missatge, el seu estat (si està pendent, resolt o tramitat),
// i els valors dels nutrients (Kcal, carbohidrats, proteïnes i greixos) si és una sol·licitud d'alta d'aliment.
interface DietaFeedback {
  id: string;
  usuariId: string;
  usuariNom: string;
  usuariEmail: string;
  tipus: "suggeriment" | "aliment_erroni" | "aliment_duplicat" | "dubte_general" | "alta_aliment";
  alimentNom: string;
  missatge: string;
  llegit: boolean;
  estat: "pendent" | "resolt" | "tramitat";
  respostaAdmin?: string;
  creatEl?: any;
  kcal?: number;
  carbs?: number;
  protes?: number;
  greixos?: number;
  resolucio?: "acceptat" | "rebutjat";
}

interface FeedbackUsuarisDietaProps {
  darkMode: boolean;
}

export default function FeedbackUsuarisDieta({ darkMode }: FeedbackUsuarisDietaProps) {
  // Comentari planer per a no-programadors:
  // Definim els "estats" o variables de memòria per emmagatzemar la llista de feedback,
  // controlar la càrrega del servidor, desar errors i gestionar el formulari de resposta de l'admin.
  const [feedbacks, setFeedbacks] = useState<DietaFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [respostaText, setRespostaText] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<DietaFeedback | null>(null);

  // Comentari planer per a no-programadors:
  // Estats dedicats per quan l'administrador decideixi modificar els valors d'un aliment proposat per l'estudiant.
  // Ara inclouen àpats (moments), quantitat de referència i la seva unitat per habilitar la configuració sencer de la plantilla.
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [editNom, setEditNom] = useState("");
  const [editMissatge, setEditMissatge] = useState("");
  const [editKcal, setEditKcal] = useState<number | "">("");
  const [editCarbs, setEditCarbs] = useState<number | "">("");
  const [editProtes, setEditProtes] = useState<number | "">("");
  const [editGreixos, setEditGreixos] = useState<number | "">("");
  const [editMoments, setEditMoments] = useState<string[]>(["esmorzar", "dinar", "berenar", "sopar", "extres"]);
  const [editQuantitatReferencia, setEditQuantitatReferencia] = useState<number>(100);
  const [editUnitatReferencia, setEditUnitatReferencia] = useState<string>("g");

  // Comentari planer per a no-programadors:
  // Reiniciem i sincronitzem els valors del formulari de modificació cada cop que l'usuari selecciona una altra notificació.
  useEffect(() => {
    if (selectedFeedback) {
      setEditNom(selectedFeedback.alimentNom || "");
      setEditMissatge(selectedFeedback.missatge || "");
      setEditKcal(selectedFeedback.kcal !== undefined ? selectedFeedback.kcal : "");
      setEditCarbs(selectedFeedback.carbs !== undefined ? selectedFeedback.carbs : "");
      setEditProtes(selectedFeedback.protes !== undefined ? selectedFeedback.protes : "");
      setEditGreixos(selectedFeedback.greixos !== undefined ? selectedFeedback.greixos : "");
      
      // Auto-detectem moments sugerits
      setEditMoments(["esmorzar", "dinar", "berenar", "sopar", "extres"]);
      
      // Auto-detectem si és líquid o sòlid per definir si és "g" o "ml" pel nom de l'aliment proposat
      const nomL = (selectedFeedback.alimentNom || "").toLowerCase();
      const esLiquid = nomL.includes("ml") || nomL.includes("llet") || nomL.includes("beguda") || nomL.includes("suc") || nomL.includes("oli") || nomL.includes("brou");
      setEditUnitatReferencia(esLiquid ? "ml" : "g");
      setEditQuantitatReferencia(100);

      setIsEditingProposal(false);
      setRespostaText("");
    }
  }, [selectedFeedback]);

  // Comentari planer per a no-programadors:
  // Aquest "useEffect" és un vigilant actiu. Es connecta a la col·lecció "dieta_feedback"
  // de la base de dades Firestore en temps real. Cada cop que algun usuari de l'aplicació
  // enviï un dubte sobre la dieta, la llista d'aquesta pantalla s'actualitzarà automàticament instantàniament!
  useEffect(() => {
    setLoading(true);
    const feedbackRef = collection(db, "notificacions_dietes");
    // Demanem el feedback ordenat pel moment de creació, de més recent a més antic
    const q = query(feedbackRef, orderBy("creatEl", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dades: DietaFeedback[] = [];
      snapshot.forEach((doc) => {
        dades.push({
          id: doc.id,
          ...doc.data()
        } as DietaFeedback);
      });
      setFeedbacks(dades);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error escoltant el feedback de la dieta:", err);
      setError("No s'ha pogut establir la connexió en temps real amb les notificacions de dieta.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Comentari planer per a no-programadors:
  // Aquesta funció permet a l'administrador escriure una resposta oficial al dubte o suggeriment de l'opositor.
  // Es canvia l'estat del feedback a "resolt" i es desa la data i el missatge de l'admin a Firestore.
  const handleResoldreFeedback = async (id: string) => {
    if (!respostaText.trim()) return;
    setLoading(true);
    try {
      const docRef = doc(db, "notificacions_dietes", id);
      await updateDoc(docRef, {
        estat: "resolt",
        respostaAdmin: respostaText,
        llegit: true,
        resoltEl: serverTimestamp()
      });
      setSuccessMsg("S'ha enviat la resposta correctament i s'ha marcat com a resolta.");
      setRespostaText("");
      setSelectedFeedback(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Error en respondre el feedback:", err);
      setError("No s'ha pogut guardar la resposta al servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Aquesta funció permet acceptar l'aliment proposat per l'estudiant.
  // Passa a formar part de la col·lecció oficial 'aliments' de la base de dades amb tots els valors establerts a la plantilla (àpats, pes de ref, etc.), i la notificació queda en estat 'tramitat'.
  const handleAcceptarAliment = async (fb: DietaFeedback) => {
    setLoading(true);
    try {
      const nomFinal = editNom.trim() || fb.alimentNom;
      const kcalFinal = editKcal !== "" ? Number(editKcal) : (fb.kcal || 0);
      const carbsFinal = editCarbs !== "" ? Number(editCarbs) : (fb.carbs || 0);
      const protesFinal = editProtes !== "" ? Number(editProtes) : (fb.protes || 0);
      const greixosFinal = editGreixos !== "" ? Number(editGreixos) : (fb.greixos || 0);
      const momentsFinal = editMoments.length > 0 ? editMoments : ["esmorzar", "dinar", "berenar", "sopar", "extres"];
      const quantitatRefFinal = Number(editQuantitatReferencia) || 100;
      const unitatRefFinal = editUnitatReferencia || "g";

      // 1. Inserim el nou aliment directament al catàleg d'aliments d'OposiCAT incloent-hi els tokens de cerca i dades de la plantilla
      await addDoc(collection(db, "aliments"), {
        nom: nomFinal,
        kcal: kcalFinal,
        carbs: carbsFinal,
        protes: protesFinal,
        greixos: greixosFinal,
        moments: momentsFinal,
        quantitatReferencia: quantitatRefFinal,
        unitatReferencia: unitatRefFinal,
        tokens: generarTokensDeCerca(nomFinal),
        creatEl: serverTimestamp()
      });

      // 2. Marquem l'estat de la notificació de proposta d'aliment com a 'tramitat' i guardem la resolució com a 'acceptat'
      const docRef = doc(db, "notificacions_dietes", fb.id);
      await updateDoc(docRef, {
        estat: "tramitat",
        resolucio: "acceptat", // Comentari planer: Guardem que l'administrador ha acceptat l'aliment per poder mostrar l'etiqueta corresponent
        respostaAdmin: `Aliment acceptat i donat d'alta correctament al Banc Oficial de dades de l'Acadèmia. Valors per ${quantitatRefFinal}${unitatRefFinal}: ${kcalFinal} Kcal, ${carbsFinal}g Carbs, ${protesFinal}g Prot, ${greixosFinal}g Greixos. Moments autoritzats: ${momentsFinal.join(", ")}.`,
        llegit: true,
        resoltEl: serverTimestamp()
      });

      setSuccessMsg(`L'aliment "${nomFinal}" s'ha acceptat i registrat amb èxit al Banc Oficial.`);
      setSelectedFeedback(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Error acceptant l'aliment de la notificació:", err);
      setError("No s'ha pogut acceptar l'aliment ni guardar el canvi.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Desa les modificacions que l'administrador hagi fet sobre els valors de l'aliment proposat.
  // Els canvis es guarden a la mateixa notificació de Firestore i l'estat de la sol·licitud es queda com a 'pendent'.
  const handleGuardarModificacio = async (id: string) => {
    if (!editNom.trim()) {
      setError("El nom de l'aliment no pot estar buit.");
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, "notificacions_dietes", id);
      await updateDoc(docRef, {
        alimentNom: editNom.trim(),
        missatge: editMissatge.trim(),
        kcal: Number(editKcal) || 0,
        carbs: Number(editCarbs) || 0,
        protes: Number(editProtes) || 0,
        greixos: Number(editGreixos) || 0,
        estat: "pendent" // "Si es modifica pero no s'accaba cceptan queda com a pendent."
      });

      setSuccessMsg("S'han guardat els canvis a la sol·licitud de l'aliment. El seu estat continua pendent d'aprovació final.");
      
      // Actualitzem les dades locals de la notificació activa
      setSelectedFeedback(prev => prev ? {
        ...prev,
        alimentNom: editNom.trim(),
        missatge: editMissatge.trim(),
        kcal: Number(editKcal) || 0,
        carbs: Number(editCarbs) || 0,
        protes: Number(editProtes) || 0,
        greixos: Number(editGreixos) || 0,
      } : null);

      setIsEditingProposal(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Error desant les modificacions de l'aliment proposat:", err);
      setError("No s'ha pogut desar la modificació de l'aliment.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Permet rebutjar la proposta d'aliment d'un alumne de forma immediata.
  // L'estat de la sol·licitud passa a ser 'tramitat' i es guarda la resolució com a 'rebutjat' sense afegir l'aliment a la BBDD.
  const handleRebutjarAliment = async (id: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "notificacions_dietes", id);
      await updateDoc(docRef, {
        estat: "tramitat",
        resolucio: "rebutjat", // Comentari planer: Guardem que l'administrador ha rebutjat l'aliment per poder mostrar l'etiqueta corresponent
        respostaAdmin: "Proposta rebutjada pel departament de nutrició d'OposiCAT per no ajustar-se als barems establerts.",
        llegit: true,
        resoltEl: serverTimestamp()
      });

      setSuccessMsg("Proposta rebutjada i marcada com a tramitada de forma satisfactòria.");
      setSelectedFeedback(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Error rebutjant la sol·licitud d'aliment:", err);
      setError("No s'ha pogut marcar com a rebutjada.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Aquesta funció elimina permanentment una notificació de feedback de la base de dades.
  const handleEliminarFeedback = async (id: string) => {
    if (!window.confirm("Estàs segur que vols eliminar aquesta notificació de la base de dades?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "notificacions_dietes", id));
      setSuccessMsg("Notificació eliminada correctament.");
      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
      }
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error("Error eliminant el feedback:", err);
      setError("No s'ha pogut eliminar el registre.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Per facilitar la prova d'aquest nou mòdul (ja que encara no hem connectat la part de l'usuari),
  // aquesta funció permet generar dades falses d'alta qualitat però de manera real directament a Firestore.
  // Això fa que es pugui provar el comptador de notificacions en calent!
  const handleGenerarFeedbackProva = async () => {
    setLoading(true);
    const exemples = [
      {
        usuariId: "user_test_101",
        usuariNom: "Enric Mosso 2026",
        usuariEmail: "enric_mosso@gmail.com",
        tipus: "aliment_erroni",
        alimentNom: "Salmó fresc (100g)",
        missatge: "Hola! El salmó fresc té un recompte de proteïnes de 20g, però he vist en algunes taules de nutrició oficials de la Generalitat que cuinat sol ser de 22.8g. Podríeu revisar-ho?",
        llegit: false,
        estat: "pendent"
      },
      {
        usuariId: "user_test_202",
        usuariNom: "Laia Rodríguez Sànchez",
        usuariEmail: "laia.rodriguez@gmail.com",
        tipus: "suggeriment",
        alimentNom: "Beguda de Civada sense sucre (100ml)",
        missatge: "M'agradaria molt que afegíssiu la beguda de civada de la marca Alpro, ja que és la que prenem gairebé tots els opositors per esmorzar i no surt a la llista de triar aliments.",
        llegit: false,
        estat: "pendent"
      },
      {
        usuariId: "user_test_303",
        usuariNom: "Marc Bombeta 112",
        usuariEmail: "marc.bombeta@hotmail.com",
        tipus: "aliment_duplicat",
        alimentNom: "Formatge fresc tipus Burgos (100g)",
        missatge: "Hi ha dos aliments idèntics anomenats 'Formatge fresc tipus Burgos (100g)' i 'Formatge de burgos (100g)' amb valors calòrics una mica diferents. Crec que estan duplicats.",
        llegit: false,
        estat: "pendent"
      },
      {
        usuariId: "user_test_404",
        usuariNom: "Jordi Giménez Fusté",
        usuariEmail: "jordi.nutri.95@gmail.com",
        tipus: "alta_aliment",
        alimentNom: "Formatge Quark 0% lliure",
        missatge: "Formatge molt cremós alt en caseïna i perfecte per abans d'anar a dormir.",
        llegit: false,
        estat: "pendent",
        kcal: 48,
        carbs: 4.1,
        protes: 8.5,
        greixos: 0.1
      },
      {
        usuariId: "user_test_505",
        usuariNom: "Maria Mercader Clot",
        usuariEmail: "maria.mer@gmail.com",
        tipus: "alta_aliment",
        alimentNom: "Seitan ecològic (100g)",
        missatge: "Demano afegir seitan ecològic per a alternatives proteiques vegetals de qualitat.",
        llegit: true,
        estat: "tramitat",
        resolucio: "acceptat",
        respostaAdmin: "Aliment acceptat i donat d'alta correctament al Banc Oficial de dades de l'Acadèmia. Valors: 120 Kcal, 4g Carbs, 24g Prot, 1g Greixos.",
        kcal: 120,
        carbs: 4,
        protes: 24,
        greixos: 1
      },
      {
        usuariId: "user_test_606",
        usuariNom: "Carles Puig Puig",
        usuariEmail: "carles.puig@gmail.com",
        tipus: "alta_aliment",
        alimentNom: "Xocolata amb xips i cookies industrials (100g)",
        missatge: "Afegir galetes de xocolata ultra-processades per als caps de setmana.",
        llegit: true,
        estat: "tramitat",
        resolucio: "rebutjat",
        respostaAdmin: "Proposta rebutjada pel departament de nutrició d'OposiCAT per no ajustar-se als barems d'alimentació saludable i d'alt rendiment per a mossos d'esquadra.",
        kcal: 540,
        carbs: 62,
        protes: 5,
        greixos: 29
      }
    ];

    try {
      // Triem un dels exemples a l'atzar
      const triat = exemples[Math.floor(Math.random() * exemples.length)];
      await addDoc(collection(db, "notificacions_dietes"), {
        ...triat,
        creatEl: serverTimestamp()
      });
      setSuccessMsg("S'ha inserit una notificació de prova real a la col·lecció 'notificacions_dietes' de Firestore!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Error creant feedback de prova:", err);
      setError("No s'ha pogut connectar directament per afegir dades de prova.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Funció per buidar totes les notificacions i deixar el banc de dades net per a la demo.
  const handleBuidarFeedback = async () => {
    if (!window.confirm("Vols eliminar completament TOTS els feedbacks i notificacions de la dieta?")) return;
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "notificacions_dietes"));
      const promises = snap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(promises);
      setSuccessMsg("S'ha netejat tot el banc de dades de feedback.");
      setSelectedFeedback(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error("Error purgant la col·lecció:", err);
      setError("No s'ha pogut buidar completament la col·lecció de Firestore.");
    } finally {
      setLoading(false);
    }
  };

  // Mapeig visual d'etiquetes en Català planer
  const tipusLabels = {
    suggeriment: "Suggeriment d'aliment",
    aliment_erroni: "Aliment amb valors erronis",
    aliment_duplicat: "Aliment duplicat",
    dubte_general: "Dubte de dieta",
    alta_aliment: "Alta d'aliment 🍏"
  };

  const tipusColors = {
    suggeriment: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    aliment_erroni: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    aliment_duplicat: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dubte_general: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    alta_aliment: "bg-yellow-550/15 text-yellow-500 dark:text-yellow-400 border border-yellow-500/20"
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* CAPÇALERA DE SECCIÓ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-yellow-500 font-black uppercase tracking-widest italic flex items-center gap-1">
            <Apple size={14} /> GESTIÓ DIETÈTICA DE L'ALUMNAT
          </span>
          <h1 className={`text-3xl font-black uppercase italic tracking-tighter mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Gestió / Feedback Usuaris
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-2xl mt-1 leading-relaxed">
            Portal per rebre i solucionar dubtes o discrepàncies nutricionals dels alumnes de Mossos respecte els aliments del creador de dieta d'OposiCAT.
          </p>
        </div>

        {/* ACCIONS RAPIDES */}
        <div className="flex gap-2">
          <button
            onClick={handleGenerarFeedbackProva}
            disabled={loading}
            className="flex items-center gap-2 py-3 px-5 rounded-2xl text-xs font-black uppercase tracking-wider bg-yellow-400 text-slate-900 hover:bg-yellow-500 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
            Generar Prova Real
          </button>
          
          {feedbacks.length > 0 && (
            <button
              onClick={handleBuidarFeedback}
              disabled={loading}
              className={`flex items-center gap-2 py-3 px-5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 ${
                darkMode ? 'bg-red-950/40 text-red-400 hover:bg-red-950/70 border border-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
              }`}
            >
              <Trash2 size={14} />
              Buidar Banc
            </button>
          )}
        </div>
      </div>

      {/* MISSATGES DE NOTIFICACIÓ INTERNS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold"
          >
            {successMsg}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold flex items-center gap-2"
          >
            <AlertTriangle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPTADORS DE NOTIFICACIONS I RESUM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`p-6 rounded-3xl border text-left ${darkMode ? 'bg-slate-800/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">TOTAL SOL·LICITUDS</span>
          <h3 className="text-3xl font-black italic text-yellow-500">{feedbacks.length}</h3>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Incidències totals registrades</p>
        </div>
        <div className={`p-6 rounded-3xl border text-left ${darkMode ? 'bg-slate-800/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">PENDENTS D'ATENDRE</span>
          <h3 className="text-3xl font-black italic text-rose-500">
            {feedbacks.filter(f => f.estat === "pendent").length}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Requereixen resposta de l'admin</p>
        </div>
        <div className={`p-6 rounded-3xl border text-left ${darkMode ? 'bg-slate-800/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">DISCREPÀNCIES RESOLTES</span>
          <h3 className="text-3xl font-black italic text-emerald-500">
            {feedbacks.filter(f => f.estat === "resolt").length}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Marcades com a corregides / contestades</p>
        </div>
      </div>

      {/* LLISTAT DE NOTIFICACIONS (TAULA BANC DE DADES) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COL-1: LLISTAT */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <Database size={16} className="text-yellow-500" /> Banc de dades de notificacions
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {feedbacks.length} elements
            </span>
          </div>

          {loading && feedbacks.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Consultant la BBDD a Firestore...</span>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className={`py-16 px-10 border-2 border-dashed rounded-[2.5rem] text-center flex flex-col items-center justify-center ${
              darkMode ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200 bg-slate-50'
            }`}>
              <MessageSquare size={44} className="text-slate-300 dark:text-slate-700 mb-4" />
              <h5 className={`text-base font-black uppercase italic tracking-tighter ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Banc de dades buit
              </h5>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-450 max-w-sm leading-relaxed mt-1">
                Actualment no hi ha cap dubte o notificació de dieta rebuda. Prem el botó "Generar Prova Real" per afegir-ne una a Firestore i veure-ho en funcionament instantàniament.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {feedbacks.map((f) => {
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFeedback(f)}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedFeedback?.id === f.id
                        ? (darkMode ? 'bg-slate-800/80 border-yellow-500/60 shadow-lg' : 'bg-slate-100 border-yellow-500/60 shadow-md')
                        : (f.estat === "pendent"
                            ? (darkMode ? 'bg-slate-800/20 border-rose-500/20 hover:bg-slate-800/40' : 'bg-red-50/20 border-rose-200 hover:bg-red-50/40')
                            : f.estat === "tramitat"
                              ? (darkMode ? 'bg-blue-950/20 border-blue-500/20 hover:bg-blue-950/45' : 'bg-blue-50/20 border-blue-200 hover:bg-blue-50/40')
                              : (darkMode ? 'bg-slate-950/20 border-white/5 hover:bg-slate-950/40' : 'bg-white border-slate-200 hover:bg-slate-50'))
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* TIPUS I ALIMENT */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${tipusColors[f.tipus] || ''}`}>
                            {tipusLabels[f.tipus] || f.tipus}
                          </span>
                          
                          {f.estat === "pendent" ? (
                            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse"></span>
                              Pendent
                            </span>
                          ) : f.estat === "tramitat" ? (
                            /* Comentari planer per a no-programadors:
                               Quan una sol·licitud ha estat tramitada, es mostren dues etiquetes: una general de "Tramitat" i una segona
                               de "Acceptat" (en verd) o "Rebutjat" (en vermell) segons la decisió final de l'administrador. */
                            <>
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                                <Check size={8} />
                                Tramitat
                              </span>
                              {(f.resolucio === "acceptat" || (f.tipus === "alta_aliment" && f.respostaAdmin?.toLowerCase().includes("acceptat"))) ? (
                                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                  Acceptat
                                </span>
                              ) : (f.resolucio === "rebutjat" || (f.tipus === "alta_aliment" && f.respostaAdmin?.toLowerCase().includes("rebutja"))) ? (
                                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-450 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                                  Rebutjat
                                </span>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <Check size={8} />
                              Resolt
                            </span>
                          )}
                        </div>

                        <h5 className={`text-xs font-black uppercase tracking-tight truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          Aliment: <span className="text-yellow-500 italic">{f.alimentNom}</span>
                        </h5>
                      </div>

                      {/* DATA/HORA */}
                      <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1 whitespace-nowrap">
                        <Clock size={10} />
                        {f.creatEl ? new Date(f.creatEl.seconds * 1000).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : "Recent"}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed mt-2 line-clamp-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      "{f.missatge}"
                    </p>

                    {/* DADES DE L'USUARI */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/10 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1">
                        <User size={10} /> {f.usuariNom}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={10} /> {f.usuariEmail}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COL-2: DETALLS I ACCIÓ DE RESPOSTA */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedFeedback ? (
              <motion.div
                key={selectedFeedback.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 rounded-3xl border text-left relative ${
                  darkMode ? 'bg-slate-800/50 border-white/10 text-white' : 'bg-white border-slate-200 shadow-sm text-slate-850'
                }`}
              >
                {/* Línia decorativa superior de marca d'incidència */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl ${selectedFeedback.estat === "pendent" ? 'bg-rose-500' : selectedFeedback.estat === "tramitat" ? 'bg-blue-500' : 'bg-emerald-500'}`} />

                {/* Titol i tancar */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">DETALL DELS CANVIS SOL·LICITATS</span>
                    <h4 className="text-sm font-black uppercase italic tracking-tight text-yellow-500">
                      {isEditingProposal ? "Modificar Proposta d'Aliment" : "Atenció de Dieta"}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFeedback(null);
                      setIsEditingProposal(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {isEditingProposal ? (
                  /* FORMULARI D'EDICIÓ DE L'ALIMENT PROPOSAT (PLANTILLA COMPLETA) */
                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Nom de l'aliment:</label>
                      <input
                        type="text"
                        value={editNom}
                        onChange={(e) => setEditNom(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border font-bold outline-none ${
                          darkMode ? 'bg-slate-900 border-white/5 text-white focus:ring-1 focus:ring-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-yellow-500'
                        }`}
                      />
                    </div>

                    {/* QUADRÍCULA DE MACRONUTRIENTS PER A L'EDICIÓ */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Kcal (Calories):</label>
                        <input
                          type="number"
                          value={editKcal}
                          onChange={(e) => setEditKcal(e.target.value === "" ? "" : Number(e.target.value))}
                          className={`w-full p-2.5 rounded-xl border font-bold outline-none ${
                            darkMode ? 'bg-slate-900 border-white/5 text-white focus:ring-1 focus:ring-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-yellow-500'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Carbohidrats (g):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editCarbs}
                          onChange={(e) => setEditCarbs(e.target.value === "" ? "" : Number(e.target.value))}
                          className={`w-full p-2.5 rounded-xl border font-bold outline-none ${
                            darkMode ? 'bg-slate-900 border-white/5 text-white focus:ring-1 focus:ring-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-yellow-500'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Proteïnes (g):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editProtes}
                          onChange={(e) => setEditProtes(e.target.value === "" ? "" : Number(e.target.value))}
                          className={`w-full p-2.5 rounded-xl border font-bold outline-none ${
                            darkMode ? 'bg-slate-900 border-white/5 text-white focus:ring-1 focus:ring-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-yellow-500'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Greixos (g):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editGreixos}
                          onChange={(e) => setEditGreixos(e.target.value === "" ? "" : Number(e.target.value))}
                          className={`w-full p-2.5 rounded-xl border font-bold outline-none ${
                            darkMode ? 'bg-slate-900 border-white/5 text-white focus:ring-1 focus:ring-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-yellow-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* QUANTITAT I UNITAT DE REFERÈNCIA */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Quantitat de Referència:</label>
                        <input
                          type="number"
                          value={editQuantitatReferencia}
                          onChange={(e) => setEditQuantitatReferencia(Number(e.target.value) || 100)}
                          className={`w-full p-2.5 rounded-xl border font-bold outline-none ${
                            darkMode ? 'bg-slate-900 border-white/5 text-white focus:ring-1 focus:ring-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-yellow-500'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 block">Unitat de Referència:</label>
                        <select
                          value={editUnitatReferencia}
                          onChange={(e) => setEditUnitatReferencia(e.target.value)}
                          className={`w-full p-2.5 rounded-xl border font-bold outline-none ${
                            darkMode ? 'bg-slate-900 border-white/5 text-white focus:ring-1 focus:ring-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-yellow-500'
                          }`}
                        >
                          <option value="g">g (Grams)</option>
                          <option value="ml">ml (Mil·lilitres)</option>
                          <option value="unitat">unitat (Unitats)</option>
                        </select>
                      </div>
                    </div>

                    {/* CHECKBOXES DE MOMENTS / ÀPATS */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Àpats / Moments de consum de la plantilla:
                      </label>
                      <div className={`flex flex-wrap gap-3 p-3 rounded-xl border ${darkMode ? 'bg-slate-900/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        {[
                          { value: "esmorzar", label: "Esmorzar" },
                          { value: "dinar", label: "Dinar" },
                          { value: "berenar", label: "Berenar" },
                          { value: "sopar", label: "Sopar" },
                          { value: "extres", label: "Extres" }
                        ].map((item) => {
                          const isChecked = editMoments.includes(item.value);
                          return (
                            <label key={item.value} className="flex items-center gap-1.5 cursor-pointer text-[11px] select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const newMoments = isChecked
                                    ? editMoments.filter(m => m !== item.value)
                                    : [...editMoments, item.value];
                                  setEditMoments(newMoments);
                                }}
                                className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                              />
                              <span className={darkMode ? "text-slate-300 font-medium" : "text-slate-700 font-medium"}>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Missatge o descripció interna:</label>
                      <textarea
                        rows={2}
                        value={editMissatge}
                        onChange={(e) => setEditMissatge(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border font-bold outline-none ${
                          darkMode ? 'bg-slate-900 border-white/5 text-white focus:ring-1 focus:ring-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-1 focus:ring-yellow-500'
                        }`}
                      />
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => handleAcceptarAliment(selectedFeedback)}
                        disabled={loading}
                        className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-emerald-500 text-white hover:bg-emerald-600 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
                      >
                        <Check size={14} /> Acceptar i Afegir al Banc Oficial
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGuardarModificacio(selectedFeedback.id)}
                          disabled={loading}
                          className="flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-900 hover:bg-yellow-500 transition-all active:scale-95 cursor-pointer disabled:opacity-55"
                        >
                          Guardar a la proposta (Pendent)
                        </button>
                        <button
                          onClick={() => setIsEditingProposal(false)}
                          className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Enrere
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* VISTA DE DETALL DE LA NOTIFICACIÓ SELECCIONADA */
                  <div>
                    {/* Contingut del missatge original */}
                    <div className={`p-4 rounded-2xl mb-4 text-xs space-y-3 ${darkMode ? 'bg-slate-900/40 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Estudiant actiu</span>
                        <span className="font-mono">{selectedFeedback.id}</span>
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Estudiant:</span>
                        <span className="font-bold text-slate-300">{selectedFeedback.usuariNom} ({selectedFeedback.usuariEmail})</span>
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Aliment implicat:</span>
                        <span className="font-bold text-yellow-500">{selectedFeedback.alimentNom}</span>
                      </div>

                      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/10">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Missatge rebut de l'APP:</span>
                        <p className="italic leading-relaxed">
                          "{selectedFeedback.missatge}"
                        </p>
                      </div>
                    </div>

                    {/* SI ÉS ALTA D'ALIMENT, RENDEREJEM LA QUADRÍCULA DE VALORS NUTRICIONALS PROPOSATS */}
                    {selectedFeedback.tipus === "alta_aliment" && (
                      <div className={`p-4 rounded-2xl mb-4 border text-xs space-y-2 ${darkMode ? 'bg-yellow-500/5 border-yellow-500/10 text-white' : 'bg-yellow-50 border-yellow-200 text-slate-900'}`}>
                        <span className="text-[9px] font-black uppercase text-yellow-600 block">Valors nutricionals de la proposta (per 100g)</span>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-slate-200'}`}>
                            <div className="text-[8px] font-black text-slate-400">KCAL</div>
                            <div className="text-sm font-black text-yellow-500">{selectedFeedback.kcal ?? 0}</div>
                          </div>
                          <div className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-slate-200'}`}>
                            <div className="text-[8px] font-black text-slate-400">CARBS</div>
                            <div className="text-sm font-black text-emerald-500">{selectedFeedback.carbs ?? 0}g</div>
                          </div>
                          <div className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-slate-200'}`}>
                            <div className="text-[8px] font-black text-slate-400">PROT</div>
                            <div className="text-sm font-black text-blue-500">{selectedFeedback.protes ?? 0}g</div>
                          </div>
                          <div className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-white/5' : 'bg-white border-slate-200'}`}>
                            <div className="text-[8px] font-black text-slate-400">GREIX</div>
                            <div className="text-sm font-black text-pink-500">{selectedFeedback.greixos ?? 0}g</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ACCIÓ DE RESPONDRE / ESTAT DE LA RESOLUCIÓ */}
                    {selectedFeedback.estat === "pendent" ? (
                      selectedFeedback.tipus === "alta_aliment" ? (
                        /* ACCIONS CONCRETES DE FLUX PER A L'ALTA DE L'ALIMENT */
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Accions de Gestió de Proposta
                          </label>
                          
                          <button
                            onClick={() => handleAcceptarAliment(selectedFeedback)}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                          >
                            <Check size={14} /> Acceptar i Afegir al Banc
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsEditingProposal(true)}
                              disabled={loading}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-yellow-450 hover:bg-yellow-500 bg-yellow-400 text-slate-900 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                            >
                              <Edit3 size={14} /> Modificar dades
                            </button>
                            <button
                              onClick={() => handleRebutjarAliment(selectedFeedback.id)}
                              disabled={loading}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                            >
                              <X size={14} /> Rebutjar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* GESTIÓ NORMAL PER A DUBTES DE DIETES GENERALS / ALIMENTS ERRONIS */
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Escriure resposta a l'alumne
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Redacta la resposta o resolució oficial... (Ex: 'Hem modificat els grams de greix a la fitxa oficial de l'aliment de la dieta. Gràcies per l'avís!')"
                            value={respostaText}
                            onChange={(e) => setRespostaText(e.target.value)}
                            className={`w-full p-3 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-yellow-500 border outline-none ${
                              darkMode ? 'bg-slate-900 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResoldreFeedback(selectedFeedback.id)}
                              disabled={loading || !respostaText.trim()}
                              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                            >
                              <Send size={14} /> Enviar i Resoldre
                            </button>
                            
                            <button
                              onClick={() => handleEliminarFeedback(selectedFeedback.id)}
                              disabled={loading}
                              className={`p-3 rounded-2xl transition-colors cursor-pointer ${
                                darkMode ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-500'
                              }`}
                              title="Eliminar notificació"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )
                    ) : selectedFeedback.estat === "tramitat" ? (
                      /* RENDEREIX L'ESTAT "TRAMITAT" AMB LA RESOLUCIÓ CORRESPONENT */
                      <div className={`p-4 rounded-2xl text-xs space-y-3 border ${
                        darkMode ? 'bg-blue-950/10 border-blue-500/20 text-blue-300' : 'bg-blue-50/20 border-blue-200 text-blue-850'
                      }`}>
                        {/* Comentari planer per a no-programadors:
                            Mostra la resolució de la tramitació, pintant de color verd si l'aliment s'ha "Acceptat" o de color vermell si s'ha "Rebutjat" de forma visual. */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400">
                            <Check size={14} /> Sol·licitud tramitada
                          </span>
                          {(selectedFeedback.resolucio === "acceptat" || (selectedFeedback.tipus === "alta_aliment" && selectedFeedback.respostaAdmin?.toLowerCase().includes("acceptat"))) ? (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              Acceptada
                            </span>
                          ) : (selectedFeedback.resolucio === "rebutjat" || (selectedFeedback.tipus === "alta_aliment" && selectedFeedback.respostaAdmin?.toLowerCase().includes("rebutja"))) ? (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-450 dark:text-rose-400 border border-rose-500/20">
                              Rebutjada
                            </span>
                          ) : null}
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] font-black opacity-60 uppercase block">Resolució de la proposta:</span>
                          <p className="italic font-medium">
                            "{selectedFeedback.respostaAdmin}"
                          </p>
                        </div>

                        <button
                          onClick={() => handleEliminarFeedback(selectedFeedback.id)}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer mt-2"
                        >
                          <Trash2 size={12} /> Eliminar Registre Històric
                        </button>
                      </div>
                    ) : (
                      /* RENDEREIX L'ESTAT "RESOLT" AMB LA RESPOSTA CORRESPONENT */
                      <div className={`p-4 rounded-2xl text-xs space-y-3 border ${
                        darkMode ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50/20 border-emerald-200 text-emerald-800'
                      }`}>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                          <Check size={14} /> Sol·licitud resolta amb èxit
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] font-black opacity-60 uppercase block">Resposta de l'administrador:</span>
                          <p className="italic font-medium">
                            "{selectedFeedback.respostaAdmin}"
                          </p>
                        </div>

                        <button
                          onClick={() => handleEliminarFeedback(selectedFeedback.id)}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer mt-2"
                        >
                          <Trash2 size={12} /> Eliminar Registre Històric
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className={`p-10 border-2 border-dashed rounded-[3rem] text-center flex flex-col items-center justify-center h-full py-20 ${
                darkMode ? 'border-slate-800 bg-slate-950/10' : 'border-slate-200 bg-slate-50'
              }`}>
                <Info size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
                <h5 className={`text-xs font-black uppercase italic tracking-tighter ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Cap element seleccionat
                </h5>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-450 max-w-xs mt-1">
                  Fes clic sobre qualsevol de les notificacions de la llista esquerra per inspeccionar-la, escriure una resposta i marcar-la com a resolta.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
