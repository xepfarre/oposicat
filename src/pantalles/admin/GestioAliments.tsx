import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../../lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { 
  Apple, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  RefreshCw, 
  UtensilsCrossed, 
  Check, 
  Info,
  Database,
  Search
} from "lucide-react";

// Comentari planer per a no-programadors:
// Definim l'estructura de dades d'un Aliment al nostre banc de dades.
// Cada aliment té un nom, les seves calories (kcal) i els macronutrients (proteïnes, hidrats de carboni i greixos).
// Ara també inclou de forma estructurada la quantitat de referència (ex: 100) i la unitat (ex: "g" o "ml").
interface Aliment {
  id: string;
  nom: string;
  kcal: number;
  carbs: number;
  protes: number;
  greixos: number;
  moments: string[];
  quantitatReferencia?: number;
  unitatReferencia?: string;
  creatEl?: any;
}

interface GestioAlimentsProps {
  darkMode: boolean;
}

// Llista inicial d'aliments per si el banc de dades està buit i l'administrador vol carregar les dades de mostra d'OposiCAT
const ALIMENTS_PREDEFINITS = [
  { nom: "Pit de gall dindi (100g)", kcal: 105, carbs: 0.0, protes: 24.0, greixos: 1.0, moments: ["dinar", "sopar"] },
  { nom: "Pit de pollastre (100g)", kcal: 165, carbs: 0.0, protes: 31.0, greixos: 3.6, moments: ["dinar", "sopar"] },
  { nom: "Filet de vedella (100g)", kcal: 135, carbs: 0.0, protes: 22.0, greixos: 5.0, moments: ["dinar", "sopar"] },
  { nom: "Tonyina al natural llauna (100g)", kcal: 101, carbs: 0.0, protes: 23.0, greixos: 1.0, moments: ["esmorzar", "dinar", "berenar", "sopar", "extres"] },
  { nom: "Llobarro a la planxa (100g)", kcal: 104, carbs: 0.0, protes: 19.0, greixos: 3.0, moments: ["dinar", "sopar"] },
  { nom: "Salmó fresc (100g)", kcal: 208, carbs: 0.0, protes: 20.0, greixos: 13.0, moments: ["dinar", "sopar"] },
  { nom: "Clar d'ou (100g)", kcal: 52, carbs: 0.7, protes: 11.0, greixos: 0.2, moments: ["esmorzar", "dinar", "berenar", "sopar"] },
  { nom: "Ou sencer cru (100g)", kcal: 155, carbs: 1.1, protes: 13.0, greixos: 11.0, moments: ["esmorzar", "dinar", "berenar", "sopar"] },
  { nom: "Formatge fresc batut 0% (100g)", kcal: 46, carbs: 3.5, protes: 8.0, greixos: 0.1, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Formatge tipus Cottage (100g)", kcal: 98, carbs: 3.4, protes: 11.0, greixos: 4.3, moments: ["esmorzar", "berenar", "sopar", "extres"] },
  { nom: "Arròs integral cru (100g)", kcal: 360, carbs: 76.0, protes: 8.0, greixos: 2.5, moments: ["dinar", "sopar"] },
  { nom: "Arròs blanc cru (100g)", kcal: 350, carbs: 79.0, protes: 7.0, greixos: 0.6, moments: ["dinar", "sopar"] },
  { nom: "Arròs blanc bullit (100g)", kcal: 130, carbs: 28.0, protes: 2.7, greixos: 0.3, moments: ["dinar", "sopar"] },
  { nom: "Civada crua (100g)", kcal: 389, carbs: 66.3, protes: 16.9, greixos: 6.9, moments: ["esmorzar", "berenar"] },
  { nom: "Pasta integral crua (100g)", kcal: 340, carbs: 65.0, protes: 13.0, greixos: 2.5, moments: ["dinar", "sopar"] },
  { nom: "Pasta blanca crua (100g)", kcal: 360, carbs: 75.0, protes: 12.0, greixos: 1.5, moments: ["dinar", "sopar"] },
  { nom: "Patata bullida (100g)", kcal: 86, carbs: 20.0, protes: 2.0, greixos: 0.1, moments: ["dinar", "sopar"] },
  { nom: "Moniato al forn (100g)", kcal: 100, carbs: 24.0, protes: 1.6, greixos: 0.2, moments: ["dinar", "berenar", "sopar"] },
  { nom: "Quinoa crua (100g)", kcal: 368, carbs: 64.0, protes: 14.0, greixos: 6.0, moments: ["dinar", "sopar"] },
  { nom: "Pa integral (100g)", kcal: 250, carbs: 45.0, protes: 9.0, greixos: 2.0, moments: ["esmorzar", "dinar", "berenar", "sopar"] },
  { nom: "Pa blanc (100g)", kcal: 265, carbs: 54.0, protes: 8.0, greixos: 1.0, moments: ["esmorzar", "dinar", "berenar", "sopar"] },
  // Comentari per a no-programadors: Modificat de (100g) a (100ml) per coherència en aliments líquids
  { nom: "Oli d'oliva verge extra (100ml)", kcal: 884, carbs: 0.0, protes: 0.0, greixos: 100.0, moments: ["esmorzar", "dinar", "sopar"] },
  { nom: "Alvocat (100g)", kcal: 160, carbs: 8.5, protes: 2.0, greixos: 15.0, moments: ["esmorzar", "dinar", "berenar", "sopar"] },
  { nom: "Ametlles crues (100g)", kcal: 579, carbs: 22.0, protes: 21.0, greixos: 50.0, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Nous pelades (100g)", kcal: 654, carbs: 14.0, protes: 15.0, greixos: 65.0, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Crema de cacauet 100% (100g)", kcal: 588, carbs: 20.0, protes: 25.0, greixos: 50.0, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Bròquil bullit (100g)", kcal: 35, carbs: 7.0, protes: 2.4, greixos: 0.4, moments: ["dinar", "sopar"] },
  { nom: "Espinacs crus (100g)", kcal: 23, carbs: 3.6, protes: 2.9, greixos: 0.4, moments: ["dinar", "sopar"] },
  { nom: "Enciam variat (100g)", kcal: 15, carbs: 2.9, protes: 1.4, greixos: 0.2, moments: ["dinar", "sopar"] },
  { nom: "Tomàquet fresc (100g)", kcal: 18, carbs: 3.9, protes: 0.9, greixos: 0.2, moments: ["esmorzar", "dinar", "berenar", "sopar"] },
  { nom: "Espàrrecs de marge (100g)", kcal: 20, carbs: 3.9, protes: 2.2, greixos: 0.1, moments: ["dinar", "sopar"] },
  { nom: "Llentilles cuites (100g)", kcal: 116, carbs: 20.0, protes: 9.0, greixos: 0.4, moments: ["dinar", "sopar"] },
  { nom: "Garbanzos cuits (100g)", kcal: 139, carbs: 23.0, protes: 7.0, greixos: 2.5, moments: ["dinar", "sopar"] },
  { nom: "Poma amb pell (100g)", kcal: 52, carbs: 14.0, protes: 0.3, greixos: 0.2, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Plàtan (100g)", kcal: 89, carbs: 23.0, protes: 1.1, greixos: 0.3, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Maduixes (100g)", kcal: 32, carbs: 7.7, protes: 0.7, greixos: 0.3, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Taronja (100g)", kcal: 47, carbs: 11.8, protes: 0.9, greixos: 0.1, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Nabius (100g)", kcal: 57, carbs: 14.5, protes: 0.7, greixos: 0.3, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Iogurt grec natural sencer (100g)", kcal: 115, carbs: 3.2, protes: 3.2, greixos: 10.0, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Formatge de burgos (100g)", kcal: 174, carbs: 2.5, protes: 15.0, greixos: 11.6, moments: ["esmorzar", "berenar", "sopar", "extres"] },
  { nom: "Porc filet (100g)", kcal: 143, carbs: 0.0, protes: 25.0, greixos: 4.8, moments: ["dinar", "sopar"] },
  // Comentari per a no-programadors: Modificat de (100g) a (100ml) per coherència en aliments líquids
  { nom: "Llet desnatada (100ml)", kcal: 34, carbs: 4.8, protes: 3.4, greixos: 0.1, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Llet sencera (100ml)", kcal: 61, carbs: 4.7, protes: 3.2, greixos: 3.3, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Gall dindi picat (100g)", kcal: 140, carbs: 0.0, protes: 22.0, greixos: 5.5, moments: ["dinar", "sopar"] },
  { nom: "Llom de porc a la planxa (100g)", kcal: 154, carbs: 0.0, protes: 23.0, greixos: 6.3, moments: ["dinar", "sopar"] },
  { nom: "Lluc a la planxa (100g)", kcal: 89, carbs: 0.0, protes: 18.0, greixos: 1.5, moments: ["dinar", "sopar"] },
  { nom: "Bacallà fresc (100g)", kcal: 82, carbs: 0.0, protes: 17.8, greixos: 0.7, moments: ["dinar", "sopar"] },
  { nom: "Gamba vermella o Llagostí (100g)", kcal: 94, carbs: 0.0, protes: 20.1, greixos: 1.4, moments: ["dinar", "sopar"] },
  { nom: "Pop bullit (100g)", kcal: 86, carbs: 0.0, protes: 18.2, greixos: 1.0, moments: ["dinar", "sopar"] },
  { nom: "Sardina a la planxa (100g)", kcal: 210, carbs: 0.0, protes: 23.0, greixos: 12.5, moments: ["dinar", "sopar"] },
  { nom: "Musclos al vapor (100g)", kcal: 115, carbs: 4.2, protes: 14.5, greixos: 3.5, moments: ["dinar", "sopar"] },
  { nom: "Formatge Quark 0% (100g)", kcal: 65, carbs: 4.0, protes: 11.5, greixos: 0.2, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Tofu ferm (100g)", kcal: 144, carbs: 2.5, protes: 14.0, greixos: 8.5, moments: ["dinar", "sopar"] },
  { nom: "Seitán cru (100g)", kcal: 370, carbs: 14.0, protes: 75.0, greixos: 1.9, moments: ["dinar", "sopar"] },
  { nom: "Mongetes blanques cuites (100g)", kcal: 142, carbs: 21.5, protes: 9.3, greixos: 0.5, moments: ["dinar", "sopar"] },
  { nom: "Fesols negres cuits (100g)", kcal: 132, carbs: 23.5, protes: 8.9, greixos: 0.5, moments: ["dinar", "sopar"] },
  { nom: "Pèsols bullits (100g)", kcal: 81, carbs: 14.5, protes: 5.4, greixos: 0.4, moments: ["dinar", "sopar"] },
  { nom: "Cuscús cru (100g)", kcal: 356, carbs: 72.4, protes: 12.8, greixos: 0.6, moments: ["dinar", "sopar"] },
  { nom: "Farina de dacsa o Polenta (100g)", kcal: 345, carbs: 75.0, protes: 8.2, greixos: 1.2, moments: ["dinar", "sopar"] },
  { nom: "Blat picat o Bulgur cru (100g)", kcal: 342, carbs: 76.0, protes: 12.3, greixos: 1.3, moments: ["dinar", "sopar"] },
  { nom: "Truita de riu a la planxa (100g)", kcal: 141, carbs: 0.0, protes: 21.5, greixos: 5.5, moments: ["dinar", "sopar"] },
  { nom: "Tortitas d'arròs (100g)", kcal: 387, carbs: 82.5, protes: 8.0, greixos: 2.8, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Pipas de gira-sol pelades (100g)", kcal: 584, carbs: 20.0, protes: 20.8, greixos: 51.5, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Nous de macadàmia (100g)", kcal: 718, carbs: 13.8, protes: 7.9, greixos: 75.8, moments: ["berenar", "extres"] },
  { nom: "Llavors de xia (100g)", kcal: 486, carbs: 42.1, protes: 16.5, greixos: 30.7, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Llavors de lli (100g)", kcal: 534, carbs: 28.9, protes: 18.3, greixos: 42.2, moments: ["esmorzar", "berenar", "extres"] },
  // Comentari per a no-programadors: Modificat de (100g) a (100ml) per coherència en aliments líquids
  { nom: "Oli de coco (100ml)", kcal: 892, carbs: 0.0, protes: 0.0, greixos: 99.1, moments: ["esmorzar", "extres"] },
  { nom: "Carbassa bullida (100g)", kcal: 26, carbs: 6.5, protes: 1.0, greixos: 0.1, moments: ["dinar", "sopar"] },
  { nom: "Carbassó fresc (100g)", kcal: 17, carbs: 3.1, protes: 1.2, greixos: 0.3, moments: ["dinar", "sopar"] },
  { nom: "Albergínia (100g)", kcal: 25, carbs: 6.0, protes: 1.0, greixos: 0.2, moments: ["dinar", "sopar"] },
  { nom: "Pastanaga crua (100g)", kcal: 41, carbs: 9.6, protes: 0.9, greixos: 0.2, moments: ["dinar", "berenar", "sopar"] },
  { nom: "Coliflor bullida (100g)", kcal: 25, carbs: 5.0, protes: 1.9, greixos: 0.3, moments: ["dinar", "sopar"] },
  { nom: "Ceba fresca (100g)", kcal: 40, carbs: 9.3, protes: 1.1, greixos: 0.1, moments: ["dinar", "sopar"] },
  { nom: "Xampinyons (100g)", kcal: 22, carbs: 3.3, protes: 3.1, greixos: 0.3, moments: ["dinar", "sopar"] },
  { nom: "Pebrot vermell (100g)", kcal: 31, carbs: 6.0, protes: 1.0, greixos: 0.3, moments: ["dinar", "sopar"] },
  { nom: "Pebrot verd (100g)", kcal: 20, carbs: 4.6, protes: 0.9, greixos: 0.2, moments: ["dinar", "sopar"] },
  { nom: "Kiwi (100g)", kcal: 61, carbs: 14.7, protes: 1.1, greixos: 0.5, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Piña fresca (100g)", kcal: 50, carbs: 13.1, protes: 0.5, greixos: 0.1, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Síndria (100g)", kcal: 30, carbs: 7.6, protes: 0.6, greixos: 0.2, moments: ["dinar", "berenar", "extres"] },
  { nom: "Meló (100g)", kcal: 34, carbs: 8.2, protes: 0.8, greixos: 0.2, moments: ["dinar", "berenar", "extres"] },
  { nom: "Melmelada light (100g)", kcal: 120, carbs: 29.0, protes: 0.4, greixos: 0.1, moments: ["esmorzar", "berenar"] },
  // Comentari per a no-programadors: Modificat de (100g) a (100ml) per coherència en aliments líquids
  { nom: "Kèfir natural sencer (100ml)", kcal: 64, carbs: 4.8, protes: 3.3, greixos: 3.5, moments: ["esmorzar", "berenar", "extres"] },
  { nom: "Formatge proteic baix en greix (100g)", kcal: 172, carbs: 1.0, protes: 30.0, greixos: 5.0, moments: ["esmorzar", "dinar", "berenar", "sopar", "extres"] },
  { nom: "Formatge fresc tipus Burgos (100g)", kcal: 174, carbs: 2.5, protes: 15.0, greixos: 11.6, moments: ["esmorzar", "berenar", "sopar", "extres"] }
];

export default function GestioAliments({ darkMode }: GestioAlimentsProps) {
  const [aliments, setAliments] = useState<Aliment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estat per al formulari de creació o edició
  const [formAliment, setFormAliment] = useState({
    nom: "",
    kcal: 0,
    carbs: 0,
    protes: 0,
    greixos: 0,
    moments: [] as string[],
    quantitatReferencia: 100,
    unitatReferencia: "g"
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [alimentAEsborrar, setAlimentAEsborrar] = useState<{ id: string; nom: string } | null>(null);

  // Comentari planer per a no-programadors:
  // Aquest estat guarda la paraula o text que l'administrador està escrivint al cercador.
  // Si la casella de text està buida, es mostraran tots els aliments del banc de nutrients.
  const [cerca, setCerca] = useState("");

  // Comentari planer per a no-programadors:
  // Filtrem els aliments en temps real utilitzant "useMemo". Això vol dir que només es torna a calcular
  // la llista filtrada si l'usuari escriu alguna cosa nova o si canvia la base de dades general.
  // Convertim tant els noms dels aliments com el text buscat a minúscules i els traiem els accents
  // (normalització de text) perquè si busques "truita" o "TRUITA", trobi també "Truita de riu".
  const alimentsFiltrats = useMemo(() => {
    if (!cerca.trim()) return aliments;
    const textBuscatNormalitzat = cerca
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Aquesta línia "màgica" elimina els accents/diacrítics del text

    return aliments.filter((aliment) => {
      const nomAlimentNormalitzat = (aliment.nom || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return nomAlimentNormalitzat.includes(textBuscatNormalitzat);
    });
  }, [aliments, cerca]);

  // Comentari planer per a no-programadors:
  // Carrega la llista completa d'aliments des de Firestore de forma asíncrona un cop es munta la pantalla.
  const carregarAliments = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, "aliments"));
      const llista: Aliment[] = [];
      
      // Comentari planer per a no-programadors:
      // Si algun aliment es va donar d'alta amb el format antic erròni "(100g)" per als líquids,
      // el corregim automàticament a la base de dades canviant-lo per "(100ml)" per mantenir coherència.
      const canvisLiquids: { [key: string]: string } = {
        "Oli d'oliva verge extra (100g)": "Oli d'oliva verge extra (100ml)",
        "Llet desnatada (100g)": "Llet desnatada (100ml)",
        "Llet sencera (100g)": "Llet sencera (100ml)",
        "Oli de coco (100g)": "Oli de coco (100ml)",
        "Kèfir natural sencer (100g)": "Kèfir natural sencer (100ml)"
      };

      for (const docSnap of querySnapshot.docs) {
        const dades = docSnap.data();
        let nomAliment = dades.nom || "";

        if (canvisLiquids[nomAliment]) {
          const nouNom = canvisLiquids[nomAliment];
          try {
            await updateDoc(doc(db, "aliments", docSnap.id), { nom: nouNom });
            console.log(`[CORRECCIÓ AUTOMÀTICA] S'ha actualitzat l'aliment ${docSnap.id} a la BBDD: "${nomAliment}" -> "${nouNom}"`);
            nomAliment = nouNom;
          } catch (errorUpd) {
            console.error(`Error corregint aliment líquid ${docSnap.id}:`, errorUpd);
          }
        }

        let momentsArray: string[] = [];
        if (Array.isArray(dades.moments)) {
          momentsArray = dades.moments;
        } else if (typeof dades.moments === "string") {
          momentsArray = dades.moments.split(",").map((s: string) => s.trim()).filter(Boolean);
        } else if (dades.apat) {
          momentsArray = [dades.apat];
        }
        let quantitatReferencia = dades.quantitatReferencia !== undefined ? Number(dades.quantitatReferencia) : 100;
        let unitatReferencia = dades.unitatReferencia || "g";

        // Comentari planer per a no-programadors:
        // Si l'aliment és dels antics i no té els nous camps de referència a la base de dades,
        // intentem extreure'ls automàticament de dins del seu títol (ex: de "Mongetes (100g)" traiem "100" i "g").
        if (dades.quantitatReferencia === undefined) {
          const matchGramatge = nomAliment.match(/\((\d+)(g|ml)\)/i);
          if (matchGramatge) {
            quantitatReferencia = Number(matchGramatge[1]);
            unitatReferencia = matchGramatge[2].toLowerCase();
          }
        }

        llista.push({
          id: docSnap.id,
          nom: nomAliment,
          kcal: Number(dades.kcal) || 0,
          carbs: Number(dades.carbs) || 0,
          protes: Number(dades.protes) || 0,
          greixos: Number(dades.greixos) || 0,
          moments: momentsArray,
          quantitatReferencia,
          unitatReferencia,
          creatEl: dades.creatEl
        });
      }
      // Endrecem els aliments alfabèticament pel seu nom per a més comoditat visual
      llista.sort((a, b) => a.nom.localeCompare(b.nom));
      setAliments(llista);
    } catch (err: any) {
      console.error("Error carregant aliments de Firestore:", err);
      setError("No s'han pogut carregar els aliments de la base de dades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAliments();
  }, []);

  // Comentari planer per a no-programadors:
  // Permet afegir un aliment nou o desar els canvis d'un aliment que estem editant actualment.
  const handleDesarAliment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formAliment.nom.trim()) {
      setError("El nom de l'aliment és obligatori.");
      return;
    }

    if (formAliment.moments.length === 0) {
      setError("Has de triar com a mínim un àpat o moment on oferir aquest aliment.");
      return;
    }

    try {
      setLoading(true);
      
      const nomNet = formAliment.nom.trim();
      const quantitatRef = Number(formAliment.quantitatReferencia || 100);
      const unitatRef = formAliment.unitatReferencia || "g";
      
      // Comentari planer per a no-programadors:
      // Per mantenir una compatibilitat del 100% amb les versions anteriors i altres pantalles,
      // construïm el nom final afegint la referència al final entre parèntesi, com per exemple "Pit de pollastre (100g)".
      // A més, guardem la quantitat de referència i la unitat en camps separats estructurats per poder-los usar després!
      const dadesAliment = {
        nom: `${nomNet} (${quantitatRef}${unitatRef})`,
        kcal: Number(formAliment.kcal),
        carbs: Number(formAliment.carbs),
        protes: Number(formAliment.protes),
        greixos: Number(formAliment.greixos),
        moments: formAliment.moments,
        quantitatReferencia: quantitatRef,
        unitatReferencia: unitatRef,
        creatEl: serverTimestamp()
      };

      if (editingId) {
        // Estem editant un aliment existent
        const alimentRef = doc(db, "aliments", editingId);
        await updateDoc(alimentRef, dadesAliment);
        setSuccessMsg(`S'ha actualitzat l'aliment "${nomNet}" correctament.`);
        setEditingId(null);
      } else {
        // Estem creant un aliment nou de trinca
        await addDoc(collection(db, "aliments"), dadesAliment);
        setSuccessMsg(`S'ha afegit l'aliment "${nomNet}" al banc d'aliments.`);
      }

      // Reiniciem el formulari
      setFormAliment({
        nom: "",
        kcal: 0,
        carbs: 0,
        protes: 0,
        greixos: 0,
        moments: [],
        quantitatReferencia: 100,
        unitatReferencia: "g"
      });

      // Recarreguem la llista actualitzada de Firestore
      await carregarAliments();
    } catch (err: any) {
      console.error("Error desant aliment a Firestore:", err);
      setError("Error en desar l'aliment a la base de dades. Comprova els teus permisos d'administrador.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Mostra un diàleg modal de confirmació personalitzat en lloc d'usar "window.confirm",
  // ja que els navegadors solen bloquejar els diàlegs nadius dins de marcs (iframes) de previsualització.
  const demanarConfirmacioEsborrar = (id: string, nom: string) => {
    setAlimentAEsborrar({ id, nom });
  };

  // Comentari planer per a no-programadors:
  // Executa l'esborrat definitiu d'un aliment de Firestore un cop l'usuari fa clic a acceptar.
  const confirmarEsborrat = async () => {
    if (!alimentAEsborrar) return;
    const { id, nom } = alimentAEsborrar;
    setError(null);
    setSuccessMsg(null);
    try {
      setLoading(true);
      await deleteDoc(doc(db, "aliments", id));
      setSuccessMsg(`S'ha eliminat l'aliment "${nom}" de la base de dades.`);
      await carregarAliments();
    } catch (err: any) {
      console.error("Error eliminant aliment de Firestore:", err);
      setError("No s'ha pogut eliminar l'aliment de la base de dades.");
    } finally {
      setLoading(false);
      setAlimentAEsborrar(null);
    }
  };

  // Comentari planer per a no-programadors:
  // Selecciona un aliment de la llista per carregar-ne les dades al formulari de dalt i poder editar-lo.
  const iniciarEdicio = (aliment: Aliment) => {
    setEditingId(aliment.id);

    // Comentari planer per a no-programadors:
    // Si el nom antic de l'aliment conté el gramatge de referència entre parèntesi (ex: "Arròs (100g)"),
    // el netegem per a que a la casella de text del nom només hi surti "Arròs" i no es dupliqui.
    let nomNet = aliment.nom || "";
    const matchGramatge = nomNet.match(/\s*\(\d+(?:g|ml)\)/i);
    if (matchGramatge) {
      nomNet = nomNet.replace(/\s*\(\d+(?:g|ml)\)/i, "").trim();
    }

    setFormAliment({
      nom: nomNet,
      kcal: aliment.kcal,
      carbs: aliment.carbs,
      protes: aliment.protes,
      greixos: aliment.greixos,
      moments: aliment.moments || [],
      quantitatReferencia: aliment.quantitatReferencia !== undefined ? aliment.quantitatReferencia : 100,
      unitatReferencia: aliment.unitatReferencia || "g"
    });
    // Ens desplacem cap a dalt de tot de la pantalla perquè es vegi el formulari
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Comentari planer per a no-programadors:
  // Cancela el mode d'edició actual de forma neta.
  const cancel·larEdicio = () => {
    setEditingId(null);
    setFormAliment({
      nom: "",
      kcal: 0,
      carbs: 0,
      protes: 0,
      greixos: 0,
      moments: [],
      quantitatReferencia: 100,
      unitatReferencia: "g"
    });
  };

  // Comentari planer per a no-programadors:
  // Aquesta funció permet als administradors omplir ràpidament el banc d'aliments de l'aplicació si està buit.
  // En lloc d'enviar els 84 aliments d'un en un de forma síncrona (que seria molt lent i podria fallar),
  // fem servir un "writeBatch" (lot d'escriptura) de Firestore. Això ens permet empaquetar totes les escriptures
  // i enviar-les a la base de dades en un sol segon, estalviant connexions i garantint que no es perdi informació.
  const carregarAlimentsExemple = async () => {
    if (aliments.length > 0) {
      if (!window.confirm("Ja hi ha aliments al banc de dades. Vols afegir els predefinits igualment? (Es podrien duplicar).")) {
        return;
      }
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const batch = writeBatch(db);
      let fets = 0;
      
      for (const alim of ALIMENTS_PREDEFINITS) {
        // Generem una nova referència de document amb ID automàtic dins de la col·lecció "aliments"
        const nouDocRef = doc(collection(db, "aliments"));
        batch.set(nouDocRef, {
          ...alim,
          creatEl: serverTimestamp()
        });
        fets++;
      }
      
      // Enviem totes les escriptures d'un sol cop
      await batch.commit();
      
      setSuccessMsg(`S'han donat d'alta correctament ${fets} aliments de mostra a la base de dades!`);
      await carregarAliments();
    } catch (err: any) {
      console.error("Error carregant aliments de mostra:", err);
      setError("S'ha produït un error en carregar els aliments predefinits de mostra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 max-w-6xl mx-auto space-y-8 ${darkMode ? "text-slate-100" : "text-slate-800"}`} id="gestio-aliments-wrapper">
      {/* CAPÇALERA DE SECCIÓ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 border-slate-700/30">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <Apple size={22} />
            <span className="text-xs font-black uppercase tracking-wider">Mòdul d'Alimentació OposiCAT</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
            Banc d'Aliments i Nutrició
          </h1>
          <p className="text-xs text-slate-400 mt-1 italic">
            Administra els nutrients dels aliments que estaran disponibles per a les calculadores i dietes dels opositors.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={carregarAliments}
            disabled={loading}
            className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${
              darkMode 
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refrescar
          </button>

          <button
            onClick={carregarAlimentsExemple}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/10"
          >
            <Database size={14} />
            Carregar Predefinits
          </button>
        </div>
      </div>

      {/* NOTIFICACIONS DE STATUS */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold">
          <X size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-bold">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* REQUADRE FORMULARI - ALTA O EDICIÓ */}
      <div className={`p-6 rounded-2xl border transition-all ${
        darkMode ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200 shadow-md"
      }`} id="formulari-aliment">
        <h2 className="text-lg font-black italic uppercase tracking-tight text-emerald-500 mb-4 flex items-center gap-2">
          {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
          {editingId ? `Editant Aliment: ${formAliment.nom}` : "Donar d'alta nou aliment al banc"}
        </h2>

        <form onSubmit={handleDesarAliment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Camp Nom */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nom de l'aliment (ex: Tonyina al natural, Arròs bullit, Pit de pollastre)</label>
              <input
                type="text"
                required
                value={formAliment.nom}
                onChange={(e) => setFormAliment({ ...formAliment, nom: e.target.value })}
                placeholder="Ex: Pa integral"
                className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                  darkMode 
                    ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-emerald-500" 
                    : "bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500"
                }`}
              />
            </div>

            {/* Camp Quantitat de Referència */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quantitat de Referència (per als nutrients de sota)</label>
              <input
                type="number"
                min="1"
                required
                value={formAliment.quantitatReferencia}
                onChange={(e) => setFormAliment({ ...formAliment, quantitatReferencia: Number(e.target.value) })}
                placeholder="Ex: 100"
                className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                  darkMode 
                    ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-emerald-500" 
                    : "bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500"
                }`}
              />
            </div>

            {/* Camp Unitat de Referència */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Unitat de Referència (g o ml)</label>
              <select
                value={formAliment.unitatReferencia}
                onChange={(e) => setFormAliment({ ...formAliment, unitatReferencia: e.target.value })}
                className={`w-full p-3 rounded-xl border text-sm transition-all outline-none cursor-pointer ${
                  darkMode 
                    ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-emerald-500" 
                    : "bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500"
                }`}
              >
                <option value="g">Grams (g)</option>
                <option value="ml">Mil·lilitres (ml)</option>
              </select>
            </div>

            {/* Camp Calories */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Energia (Kcal)</label>
              <input
                type="number"
                min="0"
                required
                value={formAliment.kcal}
                onChange={(e) => setFormAliment({ ...formAliment, kcal: Number(e.target.value) })}
                placeholder="Kcal"
                className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                  darkMode 
                    ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-emerald-500" 
                    : "bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500"
                }`}
              />
            </div>

            {/* Camp Proteïna */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Proteïnes (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={formAliment.protes}
                onChange={(e) => setFormAliment({ ...formAliment, protes: Number(e.target.value) })}
                placeholder="Grams"
                className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                  darkMode 
                    ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-emerald-500" 
                    : "bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500"
                }`}
              />
            </div>

            {/* Camp Carbohidrats */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Carbohidrats (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={formAliment.carbs}
                onChange={(e) => setFormAliment({ ...formAliment, carbs: Number(e.target.value) })}
                placeholder="Grams"
                className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                  darkMode 
                    ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-emerald-500" 
                    : "bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500"
                }`}
              />
            </div>

            {/* Camp Greixos */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Greixos (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={formAliment.greixos}
                onChange={(e) => setFormAliment({ ...formAliment, greixos: Number(e.target.value) })}
                placeholder="Grams"
                className={`w-full p-3 rounded-xl border text-sm transition-all outline-none ${
                  darkMode 
                    ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-emerald-500" 
                    : "bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500"
                }`}
              />
            </div>

            {/* Àpats / Moments de consum */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Àpats / Moments de consum disponibles (Moments)</label>
              <div className="flex flex-wrap gap-4 p-3 rounded-xl border bg-slate-900/10 border-slate-700/30">
                {[
                  { value: "esmorzar", label: "Esmorzar" },
                  { value: "dinar", label: "Dinar" },
                  { value: "berenar", label: "Berenar" },
                  { value: "sopar", label: "Sopar" },
                  { value: "extres", label: "Extres" }
                ].map((item) => {
                  const isChecked = formAliment.moments.includes(item.value);
                  return (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer text-xs select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const newMoments = isChecked
                            ? formAliment.moments.filter(m => m !== item.value)
                            : [...formAliment.moments, item.value];
                          setFormAliment({ ...formAliment, moments: newMoments });
                        }}
                        className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className={darkMode ? "text-slate-300" : "text-slate-700"}>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={cancel·larEdicio}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                  darkMode 
                    ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" 
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <X size={14} />
                Cancel·lar
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
            >
              <Save size={14} />
              {editingId ? "Actualitzar Aliment" : "Afegir al Banc"}
            </button>
          </div>
        </form>
      </div>

      {/* VISUALITZADOR DE BBDD EN TEMPS REAL */}
      <div className={`rounded-2xl border overflow-hidden ${
        darkMode ? "bg-slate-800/30 border-slate-700/50" : "bg-white border-slate-200 shadow-md"
      }`} id="visualitzador-bbdd-aliments">
        <div className="px-6 py-4 border-b border-slate-700/30 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900/10">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={16} className="text-emerald-500" />
            <h3 className="text-sm font-black italic uppercase tracking-wider">
              {cerca.trim() ? (
                <span>Resultat de la cerca: {alimentsFiltrats.length} de {aliments.length} Aliments</span>
              ) : (
                <span>BBDD Real de Nutrients ({aliments.length} Aliments)</span>
              )}
            </h3>
          </div>

          {/* Cercador d'Aliments ràpid */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={cerca}
              onChange={(e) => setCerca(e.target.value)}
              placeholder="Cerca aliments per nom... (ex: pit, salmó, ou)"
              className={`w-full pl-9 pr-9 py-2 rounded-xl text-xs font-semibold outline-none border transition-all ${
                darkMode
                  ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  : "bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              }`}
            />
            {cerca && (
              <button
                onClick={() => setCerca("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                title="Netejar cerca"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {loading && aliments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs italic flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin text-emerald-500" size={24} />
            <span>Consultant Firestore en temps real...</span>
          </div>
        ) : aliments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs italic space-y-4">
            <p>No hi ha cap aliment registrar al Banc d'Aliments.</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Prem el botó de dalt "Carregar Predefinits" per començar ràpidament amb aliments generals de qualitat.</p>
          </div>
        ) : alimentsFiltrats.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs italic space-y-2">
            <Search size={24} className="mx-auto text-amber-500 animate-pulse mb-2" />
            <p>No s'ha trobat cap aliment que coincideixi amb la cerca <strong className="text-emerald-500">"{cerca}"</strong>.</p>
            <button
              onClick={() => setCerca("")}
              className="text-[10px] uppercase font-bold text-emerald-500 hover:underline"
            >
              Netejar la cerca i tornar a mostrar-ho tot
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b border-slate-700/30 uppercase text-[9px] font-black tracking-widest ${
                  darkMode ? "bg-slate-900/40 text-slate-400" : "bg-slate-50 text-slate-500"
                }`}>
                  <th className="p-4">Aliment / Descripció</th>
                  <th className="p-4 text-center">Kcal</th>
                  <th className="p-4 text-center">Proteïnes (g)</th>
                  <th className="p-4 text-center">Carbohidrats (g)</th>
                  <th className="p-4 text-center">Greixos (g)</th>
                  <th className="p-4 text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/10">
                {alimentsFiltrats.map((alim) => (
                  <tr 
                    key={alim.id} 
                    className={`transition-colors ${
                      editingId === alim.id 
                        ? (darkMode ? "bg-emerald-500/10" : "bg-emerald-50") 
                        : (darkMode ? "hover:bg-slate-800/30" : "hover:bg-slate-50/50")
                    }`}
                  >
                    <td className="p-4">
                      <div className={`font-bold text-sm ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{alim.nom}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(alim.moments || []).map((m) => (
                          <span 
                            key={m} 
                            className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-black tracking-wider ${
                              m === "esmorzar" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              m === "dinar" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" :
                              m === "berenar" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                              m === "sopar" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                              "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center font-black italic text-emerald-500 text-sm">
                      {alim.kcal}
                    </td>
                    <td className="p-4 text-center text-blue-400 font-bold">
                      {alim.protes}g
                    </td>
                    <td className="p-4 text-center text-yellow-500 font-bold">
                      {alim.carbs}g
                    </td>
                    <td className="p-4 text-center text-orange-400 font-bold">
                      {alim.greixos}g
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => iniciarEdicio(alim)}
                          title="Editar aliment"
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? "bg-slate-800 hover:bg-slate-700 text-blue-400" 
                              : "bg-slate-100 hover:bg-slate-200 text-blue-600"
                          }`}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => demanarConfirmacioEsborrar(alim.id, alim.nom)}
                          title="Eliminar aliment"
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? "bg-slate-800 hover:bg-slate-700 text-red-400" 
                              : "bg-slate-100 hover:bg-slate-200 text-red-600"
                          }`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INFORMACIÓ PEDAGÒGICA ADHESIVA */}
      <div className={`p-5 rounded-2xl border flex gap-4 ${
        darkMode ? "bg-slate-800/20 border-slate-700/30 text-slate-400" : "bg-blue-50/50 border-blue-200 text-slate-600"
      }`}>
        <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-slate-300">Com funciona l'enllaç de dades amb les dietes dels alumnes?</p>
          <p>
            Quan un alumne obre el seu qüestionari d'estudi de dietes o calcula les seves necessitats calòriques per a les proves físiques d'OposiMossos (com ara la Navette o el press de banca), l'aplicació s'alimenta automàticament de les dades de Firestore d'aquest banc.
          </p>
          <p>
            Qualsevol aliment que creis o editit en aquesta interfície es reflectirà de forma immediata i dinàmica per a tots els estudiants del curs.
          </p>
        </div>
      </div>

      {/* Comentari planer per a no-programadors:
          Aquest és el diàleg modal de confirmació d'esborrat personalitzat. S'activa quan es demana esborrar un aliment,
          evitant l'ús de window.confirm (que molts navegadors bloquegen per seguretat dins d'un iframe). */}
      {alimentAEsborrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
            darkMode 
              ? "bg-slate-900 border-slate-700 text-slate-100 animate-fade-in" 
              : "bg-white border-slate-200 text-slate-800 animate-fade-in"
          }`}>
            <h3 className="text-base font-black italic uppercase tracking-wider text-red-500 mb-2">
              Confirmar esborrat d'aliment 🗑️
            </h3>
            <p className="text-xs mb-6 leading-relaxed opacity-90">
              Estàs segur que vols eliminar l'aliment <strong className="text-emerald-500">"{alimentAEsborrar.nom}"</strong> definitivament del banc de dades? Aquesta acció és irreversible i deixarà d'estar disponible per a les noves dietes.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAlimentAEsborrar(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  darkMode 
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" 
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Cancel·lar
              </button>
              <button
                type="button"
                onClick={confirmarEsborrat}
                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-500/15"
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
