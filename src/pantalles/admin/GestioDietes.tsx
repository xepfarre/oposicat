import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Apple, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  RefreshCw, 
  Check, 
  Info,
  Layers,
  Utensils,
  Calculator,
  ChevronRight,
  Sparkles,
  Pencil,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Comentari planer per a no-programadors:
// Definim l'estructura d'un aliment base (del banc d'aliments)
interface AlimentBase {
  id: string;
  nom: string;
  kcal: number;
  carbs: number;
  protes: number;
  greixos: number;
  moments: string[];
}

// Comentari planer per a no-programadors:
// Definim l'estructura d'un àpat individual que formarà part d'una dieta.
interface ApatDieta {
  id: string;
  alimentId: string;
  nomAliment: string;
  quantitat: number; // en grams o ml. Si es deixa a 0, s'importarà com a 0 sense sumar kcal directament.
  unitat: 'gr' | 'ml';
  apat: 'esmorzar' | 'dinar' | 'berenar' | 'sopar' | 'extres';
  kcal: number;
  carbs: number;
  protes: number;
  greixos: number;
}

// Comentari planer per a no-programadors:
// Definim l'estructura d'una dieta guardada a la base de dades.
interface Dieta {
  id: string;
  nom: string;
  descripcio: string;
  tipus: 'tematica' | 'kcal'; // Dietes basades en aliments (temàtiques) o dietes basades en kcal
  apats: ApatDieta[];
  creatEl?: any;
}

interface GestioDietesProps {
  darkMode: boolean;
}

export default function GestioDietes({ darkMode }: GestioDietesProps) {
  // Subpestanyes: 'tematica' (Dietes temàtiques) o 'kcal' (Dietes per KCAL)
  const [subTab, setSubTab] = useState<'tematica' | 'kcal'>('tematica');
  
  const [dietes, setDietes] = useState<Dieta[]>([]);
  const [alimentsBanc, setAlimentsBanc] = useState<AlimentBase[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingAliments, setLoadingAliments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estat del formulari de la Dieta
  const [nomDieta, setNomDieta] = useState("");
  const [descripcioDieta, setDescripcioDieta] = useState("");
  const [apatsTemporals, setApatsTemporals] = useState<ApatDieta[]>([]);

  // Estat de l'àpat temporal que s'està afegint actualment
  const [selectedAlimentId, setSelectedAlimentId] = useState("");
  const [quantitatApat, setQuantitatApat] = useState<number>(100);
  const [unitatApat, setUnitatApat] = useState<'gr' | 'ml'>('gr');
  const [apatSlot, setApatSlot] = useState<'esmorzar' | 'dinar' | 'berenar' | 'sopar' | 'extres'>('esmorzar');

  // Comentari planer per a no-programadors:
  // Estats per controlar si tenim una dieta a punt d'esborrar i mostrar el diàleg de confirmació personalitzat (Pop-up).
  const [dietaAEliminar, setDietaAEliminar] = useState<Dieta | null>(null);

  // Comentari planer per a no-programadors:
  // Estats per controlar si estem modificant una dieta i poder desar-ne els nous canvis a la base de dades Firestore.
  const [dietaAEditar, setDietaAEditar] = useState<Dieta | null>(null);

  // Comentari planer per a no-programadors:
  // Estats temporals per a la sub-secció d'afegir un aliment directament dins del formulari de modificació de dieta.
  const [editAlimentId, setEditAlimentId] = useState("");
  const [editQuantitat, setEditQuantitat] = useState<number>(100);
  const [editUnitat, setEditUnitat] = useState<'gr' | 'ml'>('gr');
  const [editSlot, setEditSlot] = useState<'esmorzar' | 'dinar' | 'berenar' | 'sopar' | 'extres'>('esmorzar');

  // Comentari planer per a no-programadors:
  // Estats per guardar el text de cerca de l'aliment de manera que l'administrador pugui escriure un nom per filtrar.
  const [cercaAlimentCreacio, setCercaAlimentCreacio] = useState("");
  const [cercaAlimentEdicio, setCercaAlimentEdicio] = useState("");

  // Comentari planer per a no-programadors:
  // Estats per controlar si els desplegables de cerca d'aliments (ComboBox) estan oberts o tancats.
  const [desplegableObertCreacio, setDesplegableObertCreacio] = useState(false);
  const [desplegableObertEdicio, setDesplegableObertEdicio] = useState(false);

  // Comentari planer per a no-programadors:
  // Aquesta funció serveix per netejar el text (treure accents i dièresis, i passar-ho a minúscules)
  // per poder fer cerques on "arròs" i "arros" donin els mateixos resultats, facilitant molt la feina de cerca de l'administrador.
  const normalitzarText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Comentari planer per a no-programadors:
  // Filtrem dinàmicament la llista d'aliments del banc segons el que escrigui l'usuari a la barra de cerca,
  // sense tenir en compte si hi ha majúscules, minúscules, accents o dièresis.
  const alimentsFiltratsCreacio = alimentsBanc.filter(a => 
    normalitzarText(a.nom).includes(normalitzarText(cercaAlimentCreacio))
  );

  const alimentsFiltratsEdicio = alimentsBanc.filter(a => 
    normalitzarText(a.nom).includes(normalitzarText(cercaAlimentEdicio))
  );

  // Comentari planer per a no-programadors:
  // Si filtrem els aliments del banc de dades durant la creació de la dieta i l'aliment que estava seleccionat 
  // desapareix del filtre, seleccionem automàticament el primer que surti per a que no quedi "buit" ni invisible.
  useEffect(() => {
    if (alimentsFiltratsCreacio.length > 0) {
      const existeix = alimentsFiltratsCreacio.some(a => a.id === selectedAlimentId);
      if (!existeix) {
        setSelectedAlimentId(alimentsFiltratsCreacio[0].id);
      }
    } else {
      setSelectedAlimentId("");
    }
  }, [cercaAlimentCreacio, alimentsBanc]);

  // Comentari planer per a no-programadors:
  // El mateix funcionament d'autoselecció però per a quan estem modificant una dieta ja existent.
  useEffect(() => {
    if (alimentsFiltratsEdicio.length > 0) {
      const existeix = alimentsFiltratsEdicio.some(a => a.id === editAlimentId);
      if (!existeix) {
        setEditAlimentId(alimentsFiltratsEdicio[0].id);
      }
    } else {
      setEditAlimentId("");
    }
  }, [cercaAlimentEdicio, alimentsBanc]);

  // Carrega dades al muntar el component
  useEffect(() => {
    carregarAlimentsIBanco();
    carregarDietes();
  }, []);

  // Comentari planer per a no-programadors:
  // Aquest efecte s'encarrega de tancar els desplegables de cerca automàticament si l'administrador fa clic a fora de la capsa de selecció.
  useEffect(() => {
    const tancarDesplegablesClicFora = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".custom-select-container-creacio") && !target.closest(".custom-select-container-edicio")) {
        setDesplegableObertCreacio(false);
        setDesplegableObertEdicio(false);
      }
    };
    document.addEventListener("click", tancarDesplegablesClicFora);
    return () => {
      document.removeEventListener("click", tancarDesplegablesClicFora);
    };
  }, []);

  // Comentari planer per a no-programadors:
  // Carrega la llista completa d'aliments de la col·lecció "aliments" de Firestore per poder-los triar en donar d'alta un àpat.
  const carregarAlimentsIBanco = async () => {
    setLoadingAliments(true);
    try {
      const snap = await getDocs(collection(db, "aliments"));
      const aux: AlimentBase[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        aux.push({
          id: docSnap.id,
          nom: d.nom || "",
          kcal: Number(d.kcal) || 0,
          carbs: Number(d.carbs) || 0,
          protes: Number(d.protes) || 0,
          greixos: Number(d.greixos) || 0,
          moments: Array.isArray(d.moments) ? d.moments : []
        });
      });
      // Endrecem de forma alfabètica
      aux.sort((a, b) => a.nom.localeCompare(b.nom));
      setAlimentsBanc(aux);
      if (aux.length > 0) {
        setSelectedAlimentId(aux[0].id);
      }
    } catch (err) {
      console.error("Error carregant aliments per al formulari de dietes:", err);
      setError("No s'han pogut carregar els aliments de referència des de la base de dades.");
    } finally {
      setLoadingAliments(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Carrega totes les dietes registrades a la base de dades Firestore.
  const carregarDietes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "dietes"));
      const aux: Dieta[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        aux.push({
          id: docSnap.id,
          nom: d.nom || "",
          descripcio: d.descripcio || "",
          tipus: d.tipus || 'tematica',
          apats: Array.isArray(d.apats) ? d.apats : [],
          creatEl: d.creatEl
        });
      });
      setDietes(aux);
    } catch (err) {
      console.error("Error carregant dietes des de Firestore:", err);
      setError("No s'han pogut carregar les dietes creades anteriorment.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Aquesta funció agafa l'aliment seleccionat actualment, calcula els nutrients segons la quantitat entrada
  // i l'afegeix com a un àpat més a la llista temporal de la dieta abans de desar-la definitivament.
  const afegirApatTemporal = () => {
    setError(null);
    const alimentRef = alimentsBanc.find(a => a.id === selectedAlimentId);
    if (!alimentRef) {
      setError("Si us plau, selecciona un aliment vàlid del banc d'aliments.");
      return;
    }

    // Calcular nutrients proporcionals a la quantitat (per defecte són per 100g/ml)
    // Si és 0, no sumem cap nutrient
    let kcal = 0;
    let carbs = 0;
    let protes = 0;
    let greixos = 0;

    if (quantitatApat > 0) {
      const factor = quantitatApat / 100;
      kcal = Math.round(alimentRef.kcal * factor);
      carbs = Math.round(alimentRef.carbs * factor * 10) / 10;
      protes = Math.round(alimentRef.protes * factor * 10) / 10;
      greixos = Math.round(alimentRef.greixos * factor * 10) / 10;
    }

    const nouApat: ApatDieta = {
      id: Math.random().toString(36).substring(2, 9),
      alimentId: alimentRef.id,
      nomAliment: alimentRef.nom,
      quantitat: quantitatApat,
      unitat: unitatApat,
      apat: apatSlot,
      kcal,
      carbs,
      protes,
      greixos
    };

    setApatsTemporals([...apatsTemporals, nouApat]);
    setSuccessMsg(`S'ha afegit "${alimentRef.nom}" a l'àpat de "${apatSlot}" temporalment.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Comentari planer per a no-programadors:
  // Elimina un àpat afegit per error de la llista temporal que s'està creant ara mateix.
  const eliminarApatTemporal = (id: string) => {
    setApatsTemporals(apatsTemporals.filter(a => a.id !== id));
  };

  // Comentari planer per a no-programadors:
  // Puja i desa tota la informació de la dieta (nom, descripció, tipus i la llista d'àpats d'aliments) a Firestore.
  const desarNovaDieta = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!nomDieta.trim()) {
      setError("Si us plau, introdueix un nom per a la dieta.");
      return;
    }

    if (apatsTemporals.length === 0) {
      setError("Si us plau, afegeix com a mínim un àpat amb algun aliment abans de desar.");
      return;
    }

    setLoading(true);
    try {
      const dadesDieta = {
        nom: nomDieta,
        descripcio: descripcioDieta,
        tipus: subTab,
        apats: apatsTemporals,
        creatEl: serverTimestamp()
      };

      await addDoc(collection(db, "dietes"), dadesDieta);
      
      setSuccessMsg(`S'ha desat correctament la nova dieta "${nomDieta}"!`);
      
      // Resetejem formulari
      setNomDieta("");
      setDescripcioDieta("");
      setApatsTemporals([]);
      
      // Tornem a carregar la llista de dietes
      await carregarDietes();
    } catch (err) {
      console.error("Error desant la dieta a Firestore:", err);
      setError("S'ha produït un error al desar la dieta a la base de dades de Firestore.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Aquesta funció fa l'esborrat real de la dieta seleccionada de la base de dades de Firestore quan es prem "Sí, esborrar" al Pop-up.
  const confirmarEliminarDieta = async () => {
    if (!dietaAEliminar) return;
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, "dietes", dietaAEliminar.id));
      setSuccessMsg(`S'ha eliminat la dieta "${dietaAEliminar.nom}" correctament.`);
      setDietaAEliminar(null);
      await carregarDietes();
    } catch (err) {
      console.error("Error eliminant la dieta de Firestore:", err);
      setError("No s'ha pogut eliminar la dieta.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Aquesta funció s'encarrega d'obrir el diàleg per modificar una dieta existent.
  // En fa una còpia sencera de les dades per poder-les editar tranquil·lament abans de desar-les.
  const iniciarEdicioDieta = (dieta: Dieta) => {
    setDietaAEditar(JSON.parse(JSON.stringify(dieta)));
    setError(null);
    setSuccessMsg(null);
    setCercaAlimentEdicio("");
    if (alimentsBanc.length > 0) {
      setEditAlimentId(alimentsBanc[0].id);
    }
    setEditQuantitat(100);
    setEditUnitat('gr');
    setEditSlot('esmorzar');
  };

  // Comentari planer per a no-programadors:
  // Modifica el nom de la dieta que s'està editant.
  const canviarNomEdit = (nom: string) => {
    if (!dietaAEditar) return;
    setDietaAEditar({ ...dietaAEditar, nom });
  };

  // Comentari planer per a no-programadors:
  // Modifica la descripció o els consells de la dieta que s'està editant.
  const canviarDescripcioEdit = (descripcio: string) => {
    if (!dietaAEditar) return;
    setDietaAEditar({ ...dietaAEditar, descripcio });
  };

  // Comentari planer per a no-programadors:
  // Recalcula de manera automàtica tots els nutrients (calories, carbohidrats, proteïnes i greixos) 
  // d'un aliment quan canviem els grams o mil·lilitres en la dieta que s'està editant.
  const canviarQuantitatApatEdit = (apatId: string, novaQuantitat: number) => {
    if (!dietaAEditar) return;
    
    const apatsActualitzats = dietaAEditar.apats.map((apt) => {
      if (apt.id !== apatId) return apt;
      
      const alimentBase = alimentsBanc.find(a => a.id === apt.alimentId);
      
      let kcal = 0;
      let carbs = 0;
      let protes = 0;
      let greixos = 0;
      
      if (novaQuantitat > 0 && alimentBase) {
        const factor = novaQuantitat / 100;
        kcal = Math.round(alimentBase.kcal * factor);
        carbs = Math.round(alimentBase.carbs * factor * 10) / 10;
        protes = Math.round(alimentBase.protes * factor * 10) / 10;
        greixos = Math.round(alimentBase.greixos * factor * 10) / 10;
      }
      
      return {
        ...apt,
        quantitat: novaQuantitat,
        kcal,
        carbs,
        protes,
        greixos
      };
    });
    
    setDietaAEditar({ ...dietaAEditar, apats: apatsActualitzats });
  };

  // Comentari planer per a no-programadors:
  // Canvia l'àpat o moment (esmorzar, dinar, etc.) assignat a un aliment en concret de la dieta en edició.
  const canviarMomentApatEdit = (apatId: string, nouSlot: any) => {
    if (!dietaAEditar) return;
    const apatsActualitzats = dietaAEditar.apats.map((apt) => {
      if (apt.id !== apatId) return apt;
      return { ...apt, apat: nouSlot };
    });
    setDietaAEditar({ ...dietaAEditar, apats: apatsActualitzats });
  };

  // Comentari planer per a no-programadors:
  // Elimina definitivament un dels aliments de la dieta que s'està editant.
  const eliminarApatEdit = (apatId: string) => {
    if (!dietaAEditar) return;
    setDietaAEditar({
      ...dietaAEditar,
      apats: dietaAEditar.apats.filter(apt => apt.id !== apatId)
    });
  };

  // Comentari planer per a no-programadors:
  // Afegeix un aliment del banc de dades directament a la llista de la dieta que s'està modificant.
  const afegirApatAEditar = () => {
    if (!dietaAEditar) return;
    setError(null);
    
    const alimentRef = alimentsBanc.find(a => a.id === editAlimentId);
    if (!alimentRef) {
      setError("Si us plau, selecciona un aliment vàlid per afegir.");
      return;
    }
    
    let kcal = 0;
    let carbs = 0;
    let protes = 0;
    let greixos = 0;
    
    if (editQuantitat > 0) {
      const factor = editQuantitat / 100;
      kcal = Math.round(alimentRef.kcal * factor);
      carbs = Math.round(alimentRef.carbs * factor * 10) / 10;
      protes = Math.round(alimentRef.protes * factor * 10) / 10;
      greixos = Math.round(alimentRef.greixos * factor * 10) / 10;
    }
    
    const nouApat: ApatDieta = {
      id: Math.random().toString(36).substring(2, 9),
      alimentId: alimentRef.id,
      nomAliment: alimentRef.nom,
      quantitat: editQuantitat,
      unitat: editUnitat,
      apat: editSlot,
      kcal,
      carbs,
      protes,
      greixos
    };
    
    setDietaAEditar({
      ...dietaAEditar,
      apats: [...dietaAEditar.apats, nouApat]
    });
    
    setSuccessMsg(`S'ha afegit "${alimentRef.nom}" a la dieta en modificació.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Comentari planer per a no-programadors:
  // Desa tots els canvis efectuats a la dieta en edició dins de la col·lecció "dietes" de Firestore.
  const desarDietaEditada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dietaAEditar) return;
    setError(null);
    setSuccessMsg(null);
    
    if (!dietaAEditar.nom.trim()) {
      setError("Si us plau, introdueix un nom vàlid per a la dieta.");
      return;
    }
    
    if (dietaAEditar.apats.length === 0) {
      setError("La dieta ha de contenir com a mínim un aliment.");
      return;
    }
    
    setLoading(true);
    try {
      const ref = doc(db, "dietes", dietaAEditar.id);
      await updateDoc(ref, {
        nom: dietaAEditar.nom,
        descripcio: dietaAEditar.descripcio,
        tipus: dietaAEditar.tipus,
        apats: dietaAEditar.apats,
        creatEl: dietaAEditar.creatEl || serverTimestamp()
      });
      
      setSuccessMsg(`S'ha desat correctament la dieta "${dietaAEditar.nom}"!`);
      setDietaAEditar(null);
      await carregarDietes();
    } catch (err) {
      console.error("Error actualitzant la dieta a Firestore:", err);
      setError("No s'ha pogut desar la modificació de la dieta.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Calculem les sumes de calories i macronutrients estimats d'una dieta per mostrar-la a la graella.
  const calcularTotalsDieta = (apats: ApatDieta[]) => {
    return apats.reduce((acc, curr) => ({
      kcal: acc.kcal + curr.kcal,
      carbs: acc.carbs + curr.carbs,
      protes: acc.protes + curr.protes,
      greixos: acc.greixos + curr.greixos
    }), { kcal: 0, carbs: 0, protes: 0, greixos: 0 });
  };

  // Filtrem les dietes segons la subpestanya en la que estem (Dietes temàtiques o dietes per kcal)
  const dietesFiltrades = dietes.filter(d => d.tipus === subTab);

  return (
    <div className={`p-6 max-w-6xl mx-auto space-y-8 ${darkMode ? "text-slate-100" : "text-slate-800"}`} id="gestio-dietes-wrapper">
      
      {/* TÍTOL DE LA PANTALLA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-emerald-500 w-6 h-6" />
            <h1 className="text-2xl font-black tracking-tight uppercase italic">
              Gestió de Dietes
            </h1>
          </div>
          <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Crea, configura i publica dietes temàtiques o basades en calories directament a l'aplicació per als opositors.
          </p>
        </div>
        
        {/* BOTÓ DE REFRESC */}
        <button 
          onClick={() => { carregarDietes(); carregarAlimentsIBanco(); }}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            darkMode 
              ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300" 
              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
          }`}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualitzar dades
        </button>
      </div>

      {/* MISSATGES D'ERROR I ÈXIT */}
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Info size={16} />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check size={16} />
          {successMsg}
        </div>
      )}

      {/* SUBPESTAYNES: DIETES TEMÀTIQUES vs DIETES PER KCAL */}
      <div className="flex p-1 bg-slate-900/40 border border-slate-800 rounded-2xl w-full max-w-md">
        <button
          onClick={() => { setSubTab('tematica'); setApatsTemporals([]); }}
          className={`flex-1 py-3 px-4 text-xs font-black italic uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${
            subTab === 'tematica'
              ? "bg-emerald-500 text-slate-950 shadow-md font-black"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Dietes Temàtiques / Aliments
        </button>
        <button
          onClick={() => { setSubTab('kcal'); setApatsTemporals([]); }}
          className={`flex-1 py-3 px-4 text-xs font-black italic uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${
            subTab === 'kcal'
              ? "bg-emerald-500 text-slate-950 shadow-md font-black"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Dietes per KCAL
        </button>
      </div>

      {/* FORMULARI SUPERIOR PER DONAR D'ALTA DIETA */}
      <div className={`p-6 rounded-3xl border shadow-xl ${
        darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="text-emerald-500 w-5 h-5" />
          <h2 className="text-md font-black uppercase italic tracking-tight text-emerald-500">
            Nova Dieta ({subTab === 'tematica' ? "Temàtica / Aliments" : "Basada en KCAL"})
          </h2>
        </div>

        <form onSubmit={desarNovaDieta} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Esquerra: Camps generals */}
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Nom de la dieta
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Dieta Mediterrània Clàssica o 2200 kcal Manteniment"
                  value={nomDieta}
                  onChange={(e) => setNomDieta(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    darkMode 
                      ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500" 
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Descripció (Caixa de text)
                </label>
                <textarea 
                  rows={4}
                  placeholder="Explica el propòsit de la dieta, intoleràncies o consells nutricionals..."
                  value={descripcioDieta}
                  onChange={(e) => setDescripcioDieta(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none ${
                    darkMode 
                      ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500" 
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            {/* Dreta: "Donar d'alta àpat" */}
            <div className={`p-5 rounded-2xl border ${
              darkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-4 pb-2 border-b ${
                darkMode ? "text-slate-200 border-slate-800" : "text-slate-700 border-slate-200"
              }`}>
                Donar d'alta àpat
              </h3>

              <div className="space-y-4">
                {/* 1. Selecció d'aliment des del banc de dades */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Aliment del banc de dades
                  </label>
                  {loadingAliments ? (
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <RefreshCw size={12} className="animate-spin" /> Carregant banc...
                    </span>
                  ) : alimentsBanc.length === 0 ? (
                    <span className="text-xs text-red-400 font-bold">
                      ⚠️ No hi ha aliments al banc de dades. Dona'ls d'alta primer a "Gestió d'aliments".
                    </span>
                  ) : (
                    <div className="relative custom-select-container-creacio">
                      {/* Botó Disparador del Desplegable */}
                      <button
                        type="button"
                        onClick={() => setDesplegableObertCreacio(!desplegableObertCreacio)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                          darkMode 
                            ? "bg-slate-800 border-slate-700 text-white" 
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <span className="truncate">
                          {alimentsBanc.find(a => a.id === selectedAlimentId)?.nom || "Selecciona un aliment..."} 
                          {selectedAlimentId && ` (${alimentsBanc.find(a => a.id === selectedAlimentId)?.kcal} kcal/100g)`}
                        </span>
                        {desplegableObertCreacio ? <ChevronUp size={16} className="text-slate-400 shrink-0 ml-1" /> : <ChevronDown size={16} className="text-slate-400 shrink-0 ml-1" />}
                      </button>

                      {/* Menú Desplegable Flotant */}
                      {desplegableObertCreacio && (
                        <div className={`absolute z-50 left-0 right-0 mt-1.5 p-2 rounded-2xl border shadow-2xl flex flex-col gap-2 ${
                          darkMode 
                            ? "bg-slate-900 border-slate-800 text-white" 
                            : "bg-white border-slate-200 text-slate-900"
                        }`}>
                          {/* Input de cerca integrat a la part superior */}
                          <input 
                            type="text"
                            placeholder="🔍 Escriu per cercar..."
                            value={cercaAlimentCreacio}
                            onChange={(e) => setCercaAlimentCreacio(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                              darkMode 
                                ? "bg-slate-950/80 border-slate-700 text-white placeholder-slate-500" 
                                : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                            }`}
                          />

                          {/* Llista d'opcions filtrades */}
                          <div className="max-h-48 overflow-y-auto pr-1 space-y-0.5">
                            {alimentsFiltratsCreacio.length === 0 ? (
                              <div className="p-3 text-center text-xs text-slate-500 font-semibold italic">
                                Cap aliment coincideix
                              </div>
                            ) : (
                              alimentsFiltratsCreacio.map(a => (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedAlimentId(a.id);
                                    setDesplegableObertCreacio(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                                    selectedAlimentId === a.id
                                      ? "bg-emerald-500/10 text-emerald-400 font-bold"
                                      : darkMode 
                                        ? "hover:bg-slate-800 text-slate-300" 
                                        : "hover:bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  <span className="truncate pr-2">{a.nom} <span className="opacity-60 text-[10px]">({a.kcal} kcal/100g)</span></span>
                                  {selectedAlimentId === a.id && <Check size={12} className="text-emerald-400 shrink-0" />}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Quantitat i unitat */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Quantitat (0 = decideix alumne)
                    </label>
                    <input 
                      type="number"
                      min="0"
                      value={quantitatApat}
                      onChange={(e) => setQuantitatApat(Math.max(0, Number(e.target.value) || 0))}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        darkMode 
                          ? "bg-slate-800 border-slate-700 text-white" 
                          : "bg-white border-slate-200 text-slate-800"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      Unitat
                    </label>
                    <select
                      value={unitatApat}
                      onChange={(e) => setUnitatApat(e.target.value as 'gr' | 'ml')}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        darkMode 
                          ? "bg-slate-800 border-slate-700 text-white" 
                          : "bg-white border-slate-200 text-slate-800"
                      }`}
                    >
                      <option value="gr">Grams (gr)</option>
                      <option value="ml">Mil·lilitres (ml)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Slot de l'àpat */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Moments / Àpat on va
                  </label>
                  <select
                    value={apatSlot}
                    onChange={(e) => setApatSlot(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-lg border text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                      darkMode 
                        ? "bg-slate-800 border-slate-700 text-white" 
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  >
                    <option value="esmorzar">☕ Esmorzar</option>
                    <option value="dinar">☀️ Dinar</option>
                    <option value="berenar">🍎 Berenar</option>
                    <option value="sopar">🌙 Sopar</option>
                    <option value="extres">🍴 Extres / Altres</option>
                  </select>
                </div>

                {/* 4. Botó per afegir àpat temporal */}
                <button
                  type="button"
                  onClick={afegirApatTemporal}
                  className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black italic uppercase tracking-wider text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <Plus size={16} />
                  Afegir aliment a la dieta
                </button>
              </div>
            </div>

          </div>

          {/* Llista d'àpats temporals que s'han afegit de moment a la dieta */}
          <div className="space-y-3">
            <h3 className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
              Aliments afegits a la dieta en creació ({apatsTemporals.length})
            </h3>
            {apatsTemporals.length === 0 ? (
              <div className={`p-5 rounded-2xl border border-dashed text-center text-xs font-medium italic ${
                darkMode ? "border-slate-800 text-slate-500" : "border-slate-300 text-slate-400"
              }`}>
                Encara no has afegit cap aliment a la dieta. Utilitza la caixa "Donar d'alta àpat" de la dreta.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {apatsTemporals.map((apt) => (
                  <div key={apt.id} className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-left shadow-sm ${
                    darkMode ? "bg-slate-950/80 border-slate-800/80" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-black text-emerald-400 truncate max-w-[150px]">{apt.nomAliment}</span>
                        <span className="text-[8px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold uppercase italic shrink-0">
                          {apt.apat}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-[10px] text-slate-400 font-bold">
                        {apt.quantitat === 0 ? "Sense quantitat predefinida" : `${apt.quantitat} ${apt.unitat}`}
                      </div>

                      {apt.quantitat > 0 && (
                        <div className="flex gap-2 mt-2 text-[9px] font-mono text-slate-400">
                          <span className="text-emerald-500/90 font-bold">{apt.kcal} kcal</span>
                          <span>C: {apt.carbs}g</span>
                          <span>P: {apt.protes}g</span>
                          <span>G: {apt.greixos}g</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarApatTemporal(apt.id)}
                      className="text-red-400 hover:text-red-300 transition-colors self-end p-1 hover:bg-red-500/10 rounded-lg"
                      title="Eliminar aquest aliment de la dieta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Càlcul de Nutrients totals acumulats de la dieta en creació */}
          {apatsTemporals.length > 0 && (
            <div className={`p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4 border text-xs ${
              darkMode ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-300" : "bg-emerald-50 border-emerald-100 text-emerald-800"
            }`}>
              <div className="font-bold flex items-center gap-2">
                <Calculator size={16} />
                Nutrients acumulats de la dieta actual:
              </div>
              <div className="flex flex-wrap gap-4 font-black italic uppercase">
                <span>🔥 {calcularTotalsDieta(apatsTemporals).kcal} KCAL</span>
                <span>🍞 C: {calcularTotalsDieta(apatsTemporals).carbs}g</span>
                <span>🍗 P: {calcularTotalsDieta(apatsTemporals).protes}g</span>
                <span>🥑 G: {calcularTotalsDieta(apatsTemporals).greixos}g</span>
              </div>
            </div>
          )}

          {/* Botó per desar Dieta completada */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || apatsTemporals.length === 0}
              className={`py-3 px-8 rounded-xl font-black italic uppercase tracking-wider text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                loading || apatsTemporals.length === 0
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95"
              }`}
            >
              <Save size={16} />
              Publicar Dieta Oficialment
            </button>
          </div>
        </form>
      </div>

      {/* LLISTAT A SOTA DE DIETES ACTUALS */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Layers className="text-emerald-500 w-5 h-5" />
          <h2 className="text-md font-black uppercase italic tracking-tight">
            Dietes Publicades ({subTab === 'tematica' ? "Temàtiques" : "per KCAL"})
          </h2>
        </div>

        {loading && dietes.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="animate-spin" /> Carregant dietes...
          </div>
        ) : dietesFiltrades.length === 0 ? (
          <div className={`p-8 rounded-3xl border border-dashed text-center text-xs font-medium italic ${
            darkMode ? "border-slate-800 text-slate-500" : "border-slate-300 text-slate-400"
          }`}>
            No s'han trobat dietes publicades d'aquest tipus a la base de dades. Comença redactant-ne una!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dietesFiltrades.map((dieta) => {
              const totalsDieta = calcularTotalsDieta(dieta.apats);
              return (
                <div key={dieta.id} className={`p-6 rounded-3xl border shadow-lg flex flex-col justify-between gap-6 text-left ${
                  darkMode ? "bg-slate-900/40 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
                } transition-all`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-black uppercase tracking-widest text-[9px] italic">
                          {dieta.tipus === 'tematica' ? "Aliments" : "KCAL"}
                        </span>
                        <h3 className="text-lg font-black italic uppercase tracking-tight text-white mt-1.5">{dieta.nom}</h3>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Botó de modificar dieta */}
                        <button
                          onClick={() => iniciarEdicioDieta(dieta)}
                          className="text-amber-400 hover:text-amber-300 transition-colors p-2 hover:bg-amber-500/10 rounded-xl"
                          title="Modificar dieta"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* Botó d'esborrar dieta (obre confirmació) */}
                        <button
                          onClick={() => setDietaAEliminar(dieta)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-xl"
                          title="Eliminar dieta definitivament"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {dieta.descripcio || "Sense descripció redactada."}
                    </p>

                    {/* Desglossament simplificat d'àpats inclosos */}
                    <div className="pt-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Desglossament d'àpats:</h4>
                      <div className="flex flex-col gap-1.5">
                        {['esmorzar', 'dinar', 'berenar', 'sopar', 'extres'].map(mom => {
                          const apatsSlot = dieta.apats.filter(a => a.apat === mom);
                          if (apatsSlot.length === 0) return null;
                          return (
                            <div key={mom} className="text-[11px] flex gap-2">
                              <span className="font-black uppercase text-emerald-400/90 shrink-0 italic w-16">{mom}:</span>
                              <span className="text-slate-300 truncate">
                                {apatsSlot.map(a => `${a.nomAliment} (${a.quantitat === 0 ? "S/Q" : `${a.quantitat}${a.unitat}`})`).join(', ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Nutrients Totals Estimats de la Dieta */}
                  <div className={`p-4 rounded-2xl flex justify-between items-center text-[11px] font-mono ${
                    darkMode ? "bg-slate-950/80" : "bg-slate-50"
                  }`}>
                    <span className="text-slate-400 uppercase font-black tracking-wider text-[8px]">Totals estimats</span>
                    <div className="font-bold flex gap-3 text-emerald-300">
                      <span>🔥 {totalsDieta.kcal} kcal</span>
                      <span>C: {totalsDieta.carbs}g</span>
                      <span>P: {totalsDieta.protes}g</span>
                      <span>G: {totalsDieta.greixos}g</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comentari planer per a no-programadors:
          Aquest és el Pop-up de confirmació per esborrar una dieta de forma definitiva.
          Mostra de manera ben clara el nom de la dieta que es vol eliminar de la base de dades i demana confirmació a l'usuari. */}
      {dietaAEliminar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl text-center flex flex-col items-center ${
            darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-lg font-black uppercase italic tracking-tight mb-2">
              Confirmar eliminació
            </h3>
            
            <p className={`text-xs mb-6 leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Estàs segur que vols borrar la dieta <strong className="text-red-400">"{dietaAEliminar.nom}"</strong> de la base de dades? Aquesta acció és irreversible.
            </p>
            
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDietaAEliminar(null)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black italic uppercase tracking-wider transition-all active:scale-95 ${
                  darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Cancel·lar
              </button>
              <button
                onClick={confirmarEliminarDieta}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black italic uppercase tracking-wider transition-all active:scale-95"
              >
                Esborrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comentari planer per a no-programadors:
          Aquest és el gran formulari o modal per poder modificar qualsevol dieta ja existent.
          Des d'aquí es poden modificar el nom, la descripció, canviar les quantitats de cada aliment,
          esborrar aliments del menú o canviar-los d'àpat (esmorzar, dinar, etc.), i també afegir-ne de nous. */}
      {dietaAEditar && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-4xl rounded-3xl border p-6 shadow-2xl my-8 flex flex-col gap-6 text-left max-h-[90vh] overflow-y-auto ${
            darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            
            {/* Capçalera del modal */}
            <div className="flex justify-between items-center border-b pb-4 border-slate-700/50">
              <div className="flex items-center gap-2">
                <Pencil className="text-amber-500 w-5 h-5" />
                <h3 className="text-lg font-black uppercase italic tracking-tight text-amber-500">
                  Modificar Dieta
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setDietaAEditar(null)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  darkMode ? "hover:bg-slate-800 border-slate-700" : "hover:bg-slate-100 border-slate-200"
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={desarDietaEditada} className="space-y-6">
              
              {/* Informació general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Nom de la dieta
                  </label>
                  <input 
                    type="text"
                    value={dietaAEditar.nom}
                    onChange={(e) => canviarNomEdit(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-bold transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                      darkMode ? "bg-slate-800/80 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Descripció / Indicacions
                  </label>
                  <textarea 
                    rows={2}
                    value={dietaAEditar.descripcio}
                    onChange={(e) => canviarDescripcioEdit(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border text-xs font-medium transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none ${
                      darkMode ? "bg-slate-800/80 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Formulari per afegir un aliment nou directament des de la pantalla de modificació */}
              <div className={`p-4 rounded-2xl border ${
                darkMode ? "bg-slate-950/50 border-slate-800/80" : "bg-slate-50 border-slate-200"
              }`}>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-500 mb-3">
                  + Afegir nou aliment a aquesta dieta
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                  {/* Seleccionar aliment base amb filtre de cerca */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Aliment del banc
                    </label>
                    
                    <div className="relative custom-select-container-edicio">
                      {/* Botó Disparador del Desplegable en edició */}
                      <button
                        type="button"
                        onClick={() => setDesplegableObertEdicio(!desplegableObertEdicio)}
                        className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                          darkMode 
                            ? "bg-slate-800 border-slate-700 text-white" 
                            : "bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <span className="truncate">
                          {alimentsBanc.find(a => a.id === editAlimentId)?.nom || "Selecciona..."} 
                          {editAlimentId && ` (${alimentsBanc.find(a => a.id === editAlimentId)?.kcal} kcal)`}
                        </span>
                        {desplegableObertEdicio ? <ChevronUp size={14} className="text-slate-400 shrink-0 ml-1" /> : <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />}
                      </button>

                      {/* Menú Desplegable Flotant d'Edició */}
                      {desplegableObertEdicio && (
                        <div className={`absolute z-50 left-0 right-0 mt-1 p-2 rounded-xl border shadow-2xl flex flex-col gap-1.5 ${
                          darkMode 
                            ? "bg-slate-900 border-slate-800 text-white" 
                            : "bg-white border-slate-200 text-slate-900"
                        }`}>
                          {/* Input de cerca integrat */}
                          <input 
                            type="text"
                            placeholder="🔍 Escriu per cercar..."
                            value={cercaAlimentEdicio}
                            onChange={(e) => setCercaAlimentEdicio(e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 ${
                              darkMode 
                                ? "bg-slate-950/80 border-slate-700 text-white placeholder-slate-500" 
                                : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                            }`}
                          />

                          {/* Llista d'opcions filtrades */}
                          <div className="max-h-40 overflow-y-auto pr-1 space-y-0.5">
                            {alimentsFiltratsEdicio.length === 0 ? (
                              <div className="p-2 text-center text-[11px] text-slate-500 font-semibold italic">
                                Cap aliment coincideix
                              </div>
                            ) : (
                              alimentsFiltratsEdicio.map(a => (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => {
                                    setEditAlimentId(a.id);
                                    setDesplegableObertEdicio(false);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center justify-between transition-colors ${
                                    editAlimentId === a.id
                                      ? "bg-amber-500/10 text-amber-400 font-bold"
                                      : darkMode 
                                        ? "hover:bg-slate-800 text-slate-300" 
                                        : "hover:bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  <span className="truncate pr-2">{a.nom} <span className="opacity-60 text-[9px]">({a.kcal} kcal)</span></span>
                                  {editAlimentId === a.id && <Check size={10} className="text-amber-400 shrink-0" />}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantitat del nou aliment */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Quantitat (grams/ml)
                    </label>
                    <input 
                      type="number"
                      min="0"
                      value={editQuantitat}
                      onChange={(e) => setEditQuantitat(Math.max(0, Number(e.target.value) || 0))}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold focus:ring-2 focus:ring-amber-500/20 ${
                        darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                      }`}
                    />
                  </div>

                  {/* Àpat o moment */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Àpat / Slot
                    </label>
                    <select
                      value={editSlot}
                      onChange={(e) => setEditSlot(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold focus:ring-2 focus:ring-amber-500/20 ${
                        darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                      }`}
                    >
                      <option value="esmorzar">☕ Esmorzar</option>
                      <option value="dinar">☀️ Dinar</option>
                      <option value="berenar">🍎 Berenar</option>
                      <option value="sopar">🌙 Sopar</option>
                      <option value="extres">🍴 Extres / Altres</option>
                    </select>
                  </div>

                  {/* Botó afegir aliment */}
                  <button
                    type="button"
                    onClick={afegirApatAEditar}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 py-2 px-4 rounded-lg font-black italic uppercase tracking-wider text-[10px] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    Afegir
                  </button>
                </div>
              </div>

              {/* Llistat d'aliments de la dieta en edició per poder editar-los o eliminar-los */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Aliments d'aquesta dieta ({dietaAEditar.apats.length})
                </h4>
                
                {dietaAEditar.apats.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-700 rounded-xl text-center text-xs font-semibold text-slate-500 italic">
                    La dieta no té cap aliment assignat. Si us plau, afegeix-ne algun amb el formulari de sobre.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {dietaAEditar.apats.map((apt) => (
                      <div key={apt.id} className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                        darkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}>
                        
                        {/* Informació del nom i calories estimades de l'àpat */}
                        <div className="flex-1 min-w-[180px]">
                          <span className="font-bold text-amber-400 block">{apt.nomAliment}</span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            Macros actuals: {apt.kcal} kcal | C:{apt.carbs}g | P:{apt.protes}g | G:{apt.greixos}g
                          </span>
                        </div>

                        {/* Modificació de quantitat i d'àpat */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quantitat:</span>
                            <input 
                              type="number"
                              min="0"
                              value={apt.quantitat}
                              onChange={(e) => canviarQuantitatApatEdit(apt.id, Math.max(0, Number(e.target.value) || 0))}
                              className={`w-16 px-2 py-1 rounded border text-xs font-bold focus:ring-1 focus:ring-amber-500 ${
                                darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                              }`}
                            />
                            <span className="text-[10px] text-slate-400 font-bold font-mono">{apt.unitat}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Àpat:</span>
                            <select
                              value={apt.apat}
                              onChange={(e) => canviarMomentApatEdit(apt.id, e.target.value as any)}
                              className={`px-2 py-1 rounded border text-[11px] font-semibold focus:ring-1 focus:ring-amber-500 ${
                                darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                              }`}
                            >
                              <option value="esmorzar">☕ Esmorzar</option>
                              <option value="dinar">☀️ Dinar</option>
                              <option value="berenar">🍎 Berenar</option>
                              <option value="sopar">🌙 Sopar</option>
                              <option value="extres">🍴 Extres</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => eliminarApatEdit(apt.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors ml-2 shrink-0"
                            title="Eliminar aliment de la dieta"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nutrients estimats totals de la dieta modificada */}
              {dietaAEditar.apats.length > 0 && (
                <div className={`p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4 border text-xs ${
                  darkMode ? "bg-amber-950/10 border-amber-900/30 text-amber-300" : "bg-amber-50 border-amber-100 text-amber-800"
                }`}>
                  <div className="font-bold flex items-center gap-2">
                    <Calculator size={16} />
                    Nutrients modificats totals de la dieta:
                  </div>
                  <div className="flex flex-wrap gap-4 font-black italic uppercase">
                    <span>🔥 {calcularTotalsDieta(dietaAEditar.apats).kcal} KCAL</span>
                    <span>🍞 C: {calcularTotalsDieta(dietaAEditar.apats).carbs}g</span>
                    <span>🍗 P: {calcularTotalsDieta(dietaAEditar.apats).protes}g</span>
                    <span>🥑 G: {calcularTotalsDieta(dietaAEditar.apats).greixos}g</span>
                  </div>
                </div>
              )}

              {/* Botons d'acció de tancar o desar */}
              <div className="flex justify-end gap-3 border-t pt-4 border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setDietaAEditar(null)}
                  className={`py-2.5 px-6 rounded-xl font-black italic uppercase tracking-wider text-xs transition-all active:scale-95 cursor-pointer ${
                    darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Enrere
                </button>
                <button
                  type="submit"
                  disabled={loading || dietaAEditar.apats.length === 0}
                  className={`py-2.5 px-6 rounded-xl font-black italic uppercase tracking-wider text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                    loading || dietaAEditar.apats.length === 0
                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95"
                  }`}
                >
                  <Save size={14} />
                  Desar Canvis de la Dieta
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
