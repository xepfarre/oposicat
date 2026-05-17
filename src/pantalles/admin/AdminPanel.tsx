import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  serverTimestamp, 
  query, 
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  collectionGroup
} from "firebase/firestore";
import { 
  Plus, 
  Trash2, 
  LayoutDashboard, 
  BookOpen, 
  Newspaper, 
  LogOut,
  Save,
  CheckCircle2,
  Users,
  Settings,
  Search,
  Filter,
  BarChart3,
  ChevronRight,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Edit3,
  Check,
  RefreshCw,
  X,
  Dumbbell,
  Calendar,
  CreditCard,
  UserCheck,
  UserX,
  Clock,
  Info,
  FileText,
  User,
  Database,
  Coffee,
  CheckSquare,
  FilePlus2,
  Activity,
  MapPin,
  Brain,
  MessageSquare,
  Users2,
  ClipboardList,
  Briefcase,
  ArrowLeft,
  Video,
  Image as ImageIcon,
  ExternalLink,
  Type
} from "lucide-react";
import { TEMARI_DETALL } from "../../constants/temari";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

/**
 * PANTALLA: AdminPanel (Web de Gestió)
 * Portal professional per a la gestió de continguts d'OposiCAT.
 */
export default function AdminPanel({ onExit }: { onExit: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [appType, setAppType] = useState<'Mossos' | 'Bombers' | 'Rurals' | 'Protecció Civil' | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    proves: false,
    pagaments: false,
    usuaris: false,
    analisis: false
  });
  const [animationState, setAnimationState] = useState<'base' | 'color1' | 'color2'>('base');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("adminDarkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("adminDarkMode", darkMode.toString());
  }, [darkMode]);

  // Lògica d'animació de colors (Sirenes)
  useEffect(() => {
    // Funció per executar la seqüència
    const runSequence = () => {
      setAnimationState('color1');
      setTimeout(() => setAnimationState('color2'), 1000);
      setTimeout(() => setAnimationState('base'), 2000);
    };

    // Primera execució als 5 segons
    const initialTimeout = setTimeout(runSequence, 5000);

    // Interval cada minut (60000ms)
    const interval = setInterval(runSequence, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      setAnimationState('base'); // Reset quan canviem d'app
    };
  }, [appType]); // Es reinicia el cicle si canviem d'aplicació

  // Colors segons el cos
  const getAnimationColors = () => {
    if (!appType) return { c1: "#fbbf24", c2: "#fbbf24" };
    switch(appType) {
      case 'Mossos': return { c1: "#3b82f6", c2: "#ef4444" }; // Blau i Vermell
      case 'Bombers': return { c1: "#ef4444", c2: "#eab308" }; // Vermell i Groc
      case 'Rurals': return { c1: "#22c55e", c2: "#ffffff" }; // Verd i Blanc
      case 'Protecció Civil': return { c1: "#f97316", c2: "#ffffff" }; // Taronja i Blanc
      default: return { c1: "#fbbf24", c2: "#fbbf24" };
    }
  };

  const colors = getAnimationColors();

  // Comprovació de si el color és "clar" per al contrast
  const isColorLight = (color: string) => {
    return color.toLowerCase() === "#ffffff";
  };

  const currentHeaderColor = animationState === 'color1' ? colors.c1 : 
                            animationState === 'color2' ? colors.c2 : 
                            (darkMode ? "#1e293b" : "#ffffff");
  
  const useContrastText = animationState !== 'base' && isColorLight(currentHeaderColor);

  // Estats per a Preguntes i Actualitat
  const [preguntes, setPreguntes] = useState<any[]>([]);
  const [actualitats, setActualitats] = useState<any[]>([]);
  const [actualitatPreguntes, setActualitatPreguntes] = useState<any[]>([]);
  const [psicotecnicsTipus, setPsicotecnicsTipus] = useState<any[]>([]);
  const [psicotecnicsPreguntes, setPsicotecnicsPreguntes] = useState<any[]>([]);
  const [gimnasos, setGimnasos] = useState<any[]>([]);
  const [reserves, setReserves] = useState<any[]>([]);
  const [subscripcions, setSubscripcions] = useState<any[]>([]);
  
  // Determinació de la secció activa segons URL
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  const [novaPregunta, setNovaPregunta] = useState({
    pregunta: "",
    opcions: ["", "", "", ""],
    correcta: 0,
    ambit: "A",
    tema: 0,
    capitol: 0,
    explicacio: "",
    status: "activa" // status: 'activa' | 'suspesa'
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const [novaActualitat, setNovaActualitat] = useState({
    titol: "",
    descripcio: "",
    data: new Date().toISOString().split('T')[0],
    categoria: "Mossos",
    ambit: "Catalunya",
    url: ""
  });

  const [novaActualitatPregunta, setNovaActualitatPregunta] = useState({
    titol: "",
    descripcio: "",
    data: new Date().toISOString().split('T')[0],
    categoria: "Mossos",
    ambit: "Catalunya",
    pregunta: "",
    opcions: ["", "", "", ""],
    correcta: 0,
    explicacio: ""
  });

  const [nouPsicotecnicTipus, setNouPsicotecnicTipus] = useState({
    titol: "",
    descripcio: "", // Campo para la explicación de la tipología
    fotoExemple: "",
    videoUrl: "",
    actiu: true
  });

  const [novaPsicotecnicPregunta, setNovaPsicotecnicPregunta] = useState({
    tipusId: "",
    fotoPregunta: "",
    opcions: ["", "", "", ""],
    correcta: 0,
    explicacio: ""
  });

  useEffect(() => {
    // Verificació de seguretat (TEMPORALMENT DESACTIVADA segons petició)
    /*
    const adminEmails = ["xepfarre@gmail.com", "sergivinu@gmail.com"];
    if (auth.currentUser && !adminEmails.includes(auth.currentUser.email || "")) {
      navigate("/");
    }
    */
    fetchData();
  }, [activeTab, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    
    // Timer de seguretat més llarg (30s) per donar temps a la primera connexió
    const timeout = setTimeout(() => {
      if (loading) {
        setFetchError("La base de dades no respon. Possible falta d'índexs o mala connexió.");
        setLoading(false);
      }
    }, 30000);

    try {
      // Executem totes les consultes EN PARAL·LEL per anar molt més ràpid
      const [snapNew, snapOld, snapAct, snapGim, snapRes, snapSub, snapPsiTip, snapPsiPreg] = await Promise.all([
        getDocs(query(collectionGroup(db, "preguntes_codificades"))),
        getDocs(query(collection(db, "examens/mossos/preguntes"))),
        getDocs(query(collection(db, "actualitat"))),
        getDocs(query(collection(db, "gimnasos"))),
        getDocs(query(collection(db, "reserves_psicologia"))),
        getDocs(query(collection(db, "subscripcions"))),
        getDocs(query(collection(db, "psicotecnics_tipus"), orderBy("titol"))),
        getDocs(query(collection(db, "psicotecnics_preguntes"), orderBy("createdAt", "desc")))
      ]);
      
      // Processar preguntes noves
      const listPregNew = snapNew.docs.map(doc => ({ 
        id: doc.id, 
        fullPath: doc.ref.path,
        isLegacy: false,
        ...doc.data() 
      }));

      // Processar preguntes antigues
      const listPregOld = snapOld.docs.map(doc => ({ 
        id: doc.id, 
        fullPath: `examens/mossos/preguntes/${doc.id}`,
        isLegacy: true,
        ...doc.data() 
      }));
      
      // Combinar i ordenar en memòria (molt més ràpid que demanar-ho ordenat a Firebase sense índexs)
      let listPreg = [...listPregNew, ...listPregOld];
      listPreg.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return timeB - timeA;
      });
      setPreguntes(listPreg);

      // Processar actualitat
      let listAct = snapAct.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      listAct.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setActualitats(listAct);

      // Processar preguntes d'actualitat
      const snapActPreg = await getDocs(query(collection(db, "actualitat_preguntes"), orderBy("createdAt", "desc")));
      setActualitatPreguntes(snapActPreg.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Processar psicotecnics
      setPsicotecnicsTipus(snapPsiTip.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPsicotecnicsPreguntes(snapPsiPreg.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Processar gimnasos
      setGimnasos(snapGim.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Processar reserves
      setReserves(snapRes.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Processar subscripcions
      setSubscripcions(snapSub.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFetchError(null);

    } catch (err: any) {
      console.error("Error detallat de càrrega:", err);
      setFetchError(err.message || "Error al connectar amb Firestore.");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const loadMockQuestions = () => {
    const mocks = [
      { id: "mock1", pregunta: "Exemple Local A: Quina és la capital de Catalunya?", opcions: ["Girona", "Barcelona", "Tarragona", "Lleida"], correcta: 1, ambit: "A", tema: 0, capitol: 0, explicacio: "Barcelona és la capital de Catalunya.", status: "activa", isLegacy: false },
      { id: "mock2", pregunta: "Exemple Local B: Qui va escriure el Quixot?", opcions: ["Shakespeare", "Cervantes", "Dante", "Goethe"], correcta: 1, ambit: "B", tema: 0, capitol: 0, explicacio: "Miguel de Cervantes va escriure El Quixot.", status: "activa", isLegacy: false },
      { id: "mock3", pregunta: "Exemple Local C: Quants minuts té una hora?", opcions: ["30", "45", "60", "90"], correcta: 2, ambit: "C", tema: 0, capitol: 0, explicacio: "Una hora té seixanta minuts.", status: "activa", isLegacy: false }
    ];
    setPreguntes(mocks);
    setFetchError(null);
  };

  const loadMockNews = () => {
    const mocks = [
      { id: "mock-n1", titol: "Actualització convocatòria Mossos 2024", categoria: "Mossos", ambit: "Catalunya", descripcio: "S'han publicat les llistes definitives al DOGC. Reviseu l'apartat de tràmits per confirmar la vostra admissió.", data: "2024-05-15", createdAt: new Date() },
      { id: "mock-n2", titol: "Nova regulació econòmica a Europa", categoria: "Economia", ambit: "Europa", descripcio: "S'ha aprovat el nou marc financer plurianual amb impacte directe en la seguretat.", data: "2024-05-16", createdAt: new Date() },
      { id: "mock-n3", titol: "Inici campanya de Salut preventiva", categoria: "Salut", ambit: "Catalunya", descripcio: "Es posa en marxa la campanya de vacunació i prevenció per al personal d'emergències.", data: "2024-05-17", createdAt: new Date() }
    ];
    setActualitats(mocks);
    setFetchError(null);
  };

  const loadMockPsicotecnics = () => {
    const mocks = [
      { 
        id: "mock-p1", 
        tipusId: psicotecnicsTipus[0]?.id || "mock-tipus", 
        fotoPregunta: "https://images.unsplash.com/photo-1614850715649-1d0106293bd1?w=400&q=80", 
        opcions: ["Opció A", "Opció B", "Opció C", "Opció D"], 
        correcta: 0, 
        explicacio: "Explicació detallada de la pregunta de prova.",
        createdAt: new Date()
      },
      { 
        id: "mock-p2", 
        tipusId: psicotecnicsTipus[0]?.id || "mock-tipus", 
        fotoPregunta: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80", 
        opcions: ["A", "B", "C", "D"], 
        correcta: 2, 
        explicacio: "Aquesta és una altra explicació d'exemple.",
        createdAt: new Date()
      }
    ];
    setPsicotecnicsPreguntes(mocks);
    setFetchError(null);
  };

  /**
   * Genera la ruta de la "taula" (col·lecció) segons el temari
   */
  const getPreguntaPath = (ambit: string, tema: number, capitol: number) => {
    return `temari/mossos/blocs/${ambit}/temes/${tema}/capitols/${capitol}/preguntes_codificades`;
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const localId = editingId || `local-${Date.now()}`;
    const newLocalPreg = {
      ...novaPregunta,
      id: localId,
      fullPath: editingId ? (preguntes.find(p => p.id === editingId)?.fullPath || "") : "",
      createdAt: editingId ? undefined : new Date(),
      isLegacy: false
    };

    try {
      const path = getPreguntaPath(novaPregunta.ambit, novaPregunta.tema, novaPregunta.capitol);
      const baseRef = doc(db, "temari", "mossos");
      await setDoc(baseRef, { nom: "Temari Mossos", actiu: true }, { merge: true });
      const ambitRef = doc(db, `temari/mossos/blocs/${novaPregunta.ambit}`);
      await setDoc(ambitRef, { ambit: novaPregunta.ambit }, { merge: true });

      if (editingId) {
        const preguntaAEditar = preguntes.find(p => p.id === editingId);
        if (preguntaAEditar?.fullPath) {
          await updateDoc(doc(db, preguntaAEditar.fullPath), {
            ...novaPregunta,
            updatedAt: serverTimestamp()
          });
        }
        setEditingId(null);
      } else {
        await addDoc(collection(db, path), {
          ...novaPregunta,
          createdAt: serverTimestamp()
        });
      }
      setSuccess(true);
      setNovaPregunta({ pregunta: "", opcions: ["", "", "", ""], correcta: 0, ambit: "A", tema: 0, capitol: 0, explicacio: "", status: "activa" });
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.warn("BBDD desactivada o amb errors. Guardant en local per a TEST:", error);
      if (editingId) {
        setPreguntes(prev => prev.map(p => p.id === editingId ? newLocalPreg : p));
        setEditingId(null);
      } else {
        setPreguntes(prev => [newLocalPreg, ...prev]);
      }
      setSuccess(true);
      setNovaPregunta({ pregunta: "", opcions: ["", "", "", ""], correcta: 0, ambit: "A", tema: 0, capitol: 0, explicacio: "", status: "activa" });
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'activa' ? 'suspesa' : 'activa';
    try {
      const pregunta = preguntes.find(p => p.id === id);
      if (pregunta?.fullPath) {
        await updateDoc(doc(db, pregunta.fullPath), {
          status: newStatus
        });
        fetchData();
      } else {
        // Si no té path, és local
        setPreguntes(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      console.warn("Error en BBDD, aplicant canvi en local:", err);
      setPreguntes(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  const startEditing = (p: any) => {
    setEditingId(p.id);
    setNovaPregunta({
      pregunta: p.pregunta,
      opcions: p.opcions,
      correcta: p.correcta,
      ambit: p.ambit || "A",
      tema: p.tema || 0,
      capitol: p.capitol || 0,
      explicacio: p.explicacio || "",
      status: p.status || "activa"
    });
    // Scroll al formulari
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddActualitat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "actualitat"), {
        ...novaActualitat,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setNovaActualitat({ titol: "", descripcio: "", data: new Date().toISOString().split('T')[0], categoria: "Mossos", ambit: "Catalunya", url: "" });
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
       console.error("Error afegint actualitat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActualitatPregunta = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "actualitat_preguntes"), {
        ...novaActualitatPregunta,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setNovaActualitatPregunta({ 
        titol: "", descripcio: "", data: new Date().toISOString().split('T')[0], 
        categoria: "Mossos", ambit: "Catalunya", 
        pregunta: "", opcions: ["", "", "", ""], correcta: 0, explicacio: "" 
      });
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
       console.error("Error afegint pregunta d'actualitat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPsicotecnicTipus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "psicotecnics_tipus"), {
        ...nouPsicotecnicTipus,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setNouPsicotecnicTipus({ titol: "", descripcio: "", fotoExemple: "", videoUrl: "", actiu: true });
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error afegint tipus de psicotècnic:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPsicotecnicPregunta = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "psicotecnics_preguntes"), {
        ...novaPsicotecnicPregunta,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setNovaPsicotecnicPregunta({ tipusId: novaPsicotecnicPregunta.tipusId, fotoPregunta: "", opcions: ["", "", "", ""], correcta: 0, explicacio: "" });
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error afegint pregunta de psicotècnic:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fullPath: string) => {
    try {
      if (fullPath) {
        await deleteDoc(doc(db, fullPath));
        fetchData();
      } else {
        // Local delete? We don't have fullPath for local. 
        // Need to find by ID maybe. But fullPath is passed.
      }
    } catch (err) {
      console.error("Error eliminant de BBDD:", err);
    }
  };

  const handleLocalDelete = (id: string) => {
    setPreguntes(prev => prev.filter(p => p.id !== id));
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={`fixed inset-0 flex overflow-hidden z-[100] transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* SIDEBAR D'ESCRIPTORI */}
      <aside className={`w-72 flex flex-col shrink-0 border-r shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-[#000d1a] border-white/5' : 'bg-[#001a33] border-white/5'} text-white`}>
        <div className="p-8">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Settings className="text-[#001a33]" size={20} />
             </div>
             <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">Back<span className="text-yellow-400">office</span></h2>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">OposiCAT Management v2.0</p>
        </div>

        {/* SELECTOR D'APP - Més compacte com els botons del menú */}
        <div className="px-6 mb-6">
           <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <label className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20 block mb-2 px-1">Gestió de Projecte</label>
              
              {/* Botó del selector collapsible */}
              <button 
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all border ${
                  isSelectorOpen ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col items-start overflow-hidden">
                   <span className="text-[11px] font-bold uppercase tracking-tight truncate w-full text-left">
                      {appType || "Elegir APP"}
                   </span>
                   {appType && <span className="text-[7px] text-white/30 uppercase font-black tracking-widest mt-0.5">Sistema Actiu</span>}
                </div>
                <ChevronRight size={14} className={`text-white/30 transition-transform duration-300 ${isSelectorOpen ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {isSelectorOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3 flex flex-col gap-2"
                  >
                    {(['Mossos', 'Bombers', 'Rurals', 'Protecció Civil'] as const).map((type) => (
                        <button 
                          key={type}
                          onClick={() => {
                            setAppType(type);
                            setIsSelectorOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${appType === type ? 'bg-yellow-400 text-[#001a33]' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${appType === type ? 'bg-[#001a33]' : 'bg-white/10'}`}></div>
                        </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto custom-scrollbar">
          {appType === 'Mossos' ? (
            <>
              {/* SECCIÓ 1: PROVES */}
              <div className="space-y-1">
                <CollapsibleSection 
                  title="Proves d'Accés" 
                  isOpen={openSections.proves} 
                  onToggle={() => toggleSection('proves')}
                  icon={<BookOpen size={14} />}
                >
                  <SidebarItem 
                    to="/admin/prova-teorica" 
                    active={activeTab === 'prova-teorica'} 
                    icon={<FileText size={18} />} 
                    label="Prova Teòrica" 
                  />
                  <SidebarItem 
                    to="/admin/prova-fisica" 
                    active={activeTab === 'prova-fisica'} 
                    icon={<Dumbbell size={18} />} 
                    label="Prova Física" 
                  />
                  <SidebarItem 
                    to="/admin/prova-psicotecnica" 
                    active={activeTab === 'prova-psicotecnica'} 
                    icon={<Brain size={18} />} 
                    label="Prova Psicotècnica" 
                  />
                </CollapsibleSection>
              </div>

              {/* LÍNIA DIVISÒRIA */}
              <div className="h-px bg-white/10 mx-2" />

              {/* SECCIÓ 2: PAGAMENTS */}
              <div className="space-y-1">
                <CollapsibleSection 
                  title="Gestió de Pagaments" 
                  isOpen={openSections.pagaments} 
                  onToggle={() => toggleSection('pagaments')}
                  icon={<CreditCard size={14} />}
                >
                  <SidebarItem 
                    to="/admin/pagaments" 
                    active={activeTab === 'pagaments'} 
                    icon={<CreditCard size={18} />} 
                    label="Subscripcions" 
                  />
                </CollapsibleSection>
              </div>

              {/* LÍNIA DIVISÒRIA */}
              <div className="h-px bg-white/10 mx-2" />

              {/* SECCIÓ 3: USUARIS */}
              <div className="space-y-1">
                <CollapsibleSection 
                  title="Gestió d'Usuaris" 
                  isOpen={openSections.usuaris} 
                  onToggle={() => toggleSection('usuaris')}
                  icon={<Users size={14} />}
                >
                  <SidebarItem 
                    to="/admin/usuaris" 
                    active={activeTab === 'usuaris'} 
                    icon={<Users size={18} />} 
                    label="Llista d'Usuaris" 
                    badge="Pròximament"
                  />
                </CollapsibleSection>
              </div>

              {/* LÍNIA DIVISÒRIA */}
              <div className="h-px bg-white/10 mx-2" />

              {/* SECCIÓ 4: ANÀLISI */}
              <div className="space-y-1">
                <CollapsibleSection 
                  title="Gestió i Anàlisi" 
                  isOpen={openSections.analisis} 
                  onToggle={() => toggleSection('analisis')}
                  icon={<BarChart3 size={14} />}
                >
                  <SidebarItem 
                    to="/admin" 
                    active={activeTab === 'admin'} 
                    icon={<LayoutDashboard size={18} />} 
                    label="Dashboard" 
                  />
                  <SidebarItem 
                    to="/admin/estadistiques" 
                    active={activeTab === 'estadistiques'} 
                    icon={<BarChart3 size={18} />} 
                    label="Anàlisi i Dades" 
                    badge="Alpha" 
                  />
                </CollapsibleSection>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
               <Database className="text-white/10 mb-4" size={40} />
               <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] leading-relaxed">
                  Sistema en<br/>desenvolupament
               </p>
               <div className="mt-4 w-12 h-0.5 bg-white/5 rounded-full" />
            </div>
          )}
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
             <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">XP</div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold leading-none">{auth.currentUser?.email?.split('@')[0]}</span>
                   <span className="text-[9px] text-white/30 uppercase tracking-widest font-black">Admin Senior</span>
                </div>
             </div>
          </div>
          <button 
            onClick={onExit}
            className="w-full flex items-center justify-between p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span className="font-bold text-xs uppercase tracking-widest">Surt al Portal</span>
            </div>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR / HEADER AMB IL·LUMINACIÓ DE SIRENES */}
        <motion.header 
          animate={{
            backgroundColor: currentHeaderColor,
            boxShadow: animationState !== 'base' ? `0 10px 40px ${animationState === 'color1' ? colors.c1 : colors.c2}44` : "none",
          }}
          transition={{ duration: 0.4 }}
          className={`h-20 border-b flex items-center justify-between px-10 shrink-0 relative z-50 ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
           <div className={`flex items-center gap-4 px-4 py-2 rounded-xl w-96 transition-colors ${
             animationState !== 'base' ? 'bg-white/10' : (darkMode ? 'bg-slate-700' : 'bg-slate-100')
           }`}>
              <Search className={animationState !== 'base' ? (useContrastText ? 'text-slate-900/60' : 'text-white/60') : 'text-slate-400'} size={18} />
              <input 
                type="text" 
                placeholder="Cerca global..." 
                className={`bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-500 ${
                  animationState !== 'base' ? (useContrastText ? 'text-slate-900' : 'text-white') : (darkMode ? 'text-white' : 'text-slate-900')
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
 
           {/* TITOL CENTRAL */}
           <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className={`text-[8px] font-black uppercase tracking-[0.3em] mb-0.5 ${
                animationState !== 'base' ? (useContrastText ? 'text-slate-900/40' : 'text-white/60') : 'text-slate-400'
              }`}>
                Gestió activa:
              </span>
              <motion.h2 
                animate={{
                  scale: animationState !== 'base' ? 1.05 : 1,
                  color: animationState !== 'base' ? (useContrastText ? "#1e293b" : "#ffffff") : (darkMode ? "#ffffff" : "#1e293b")
                }}
                className="text-lg font-black italic tracking-tighter uppercase transition-colors"
              >
                {!appType ? "Elegir APP" : 
                 appType === 'Mossos' ? "Mossos d'Esquadra" : 
                 appType === 'Bombers' ? "Bombers de la Generalitat" :
                 appType === 'Rurals' ? "Agents Rurals" : "Protecció Civil"}
              </motion.h2>
           </div>
 
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg border transition-all ${
                  animationState !== 'base' 
                    ? `bg-white/10 border-white/20 ${useContrastText ? 'text-slate-900' : 'text-white'}` 
                    : (darkMode ? 'bg-slate-700 border-slate-600 text-yellow-400 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50')
                }`}
                title={darkMode ? "Pasar a mode clar" : "Pasar a mode fosc"}
              >
                 {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="flex gap-2 mr-4">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${animationState !== 'base' ? (useContrastText ? 'bg-slate-900' : 'bg-white') : 'bg-emerald-500'}`}></div>
                  <span className={`text-[10px] font-black uppercase ${
                    animationState !== 'base' ? (useContrastText ? 'text-slate-900' : 'text-white/80') : 'text-slate-400'
                  }`}>
                    Sistema Online
                  </span>
              </div>
              <button className={`p-2 border rounded-lg transition-all ${
                animationState !== 'base'
                  ? `bg-white/10 border-white/20 ${useContrastText ? 'text-slate-900' : 'text-white'}`
                  : (darkMode ? 'text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white' : 'text-slate-400 border-slate-200 hover:text-slate-900 hover:bg-slate-50')
              }`}>
                 <Filter size={18} />
              </button>
           </div>
        </motion.header>

        {/* CONTENT AREA */}
        <div className={`flex-1 overflow-y-auto p-10 transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-[#f8fafc]'}`}>
          {!appType ? (
            /* PANTALLA DE BENVINGUDA QUAN NO HI HA APP SELECCIONADA */
            <WelcomeView darkMode={darkMode} />
          ) : (
            <Routes>
              <Route path="/" element={<WelcomeView darkMode={darkMode} />} />
              <Route path="prova-teorica" element={<ProvaTeoricaView darkMode={darkMode} />} />
              <Route path="prova-fisica" element={<ProvaFisicaView darkMode={darkMode} />} />
              <Route path="prova-psicotecnica" element={<ProvaPsicotecnicaView darkMode={darkMode} />} />
              <Route path="preguntes" element={
                <PreguntesView 
                preguntes={preguntes} 
                novaPregunta={novaPregunta} 
                setNovaPregunta={setNovaPregunta} 
                onSubmit={handleAddQuestion}
                onDelete={(path: string, id: string) => {
                  if (path) handleDelete(path);
                  else handleLocalDelete(id);
                }}
                onToggleStatus={handleToggleStatus}
                onEdit={startEditing}
                editingId={editingId}
                setConfirmModal={setConfirmModal}
                cancelEdit={() => {
                  setEditingId(null);
                  setNovaPregunta({ pregunta: "", opcions: ["", "", "", ""], correcta: 0, ambit: "A", tema: 0, capitol: 0, explicacio: "", status: "activa" });
                }}
                loading={loading}
                error={fetchError}
                success={success}
                darkMode={darkMode}
                onRetry={fetchData}
                onLoadMock={loadMockQuestions}
              />
            } />
            <Route path="actualitat" element={
              <ActualitatView 
                actualitats={actualitats} 
                novaActualitat={novaActualitat} 
                setNovaActualitat={setNovaActualitat} 
                onSubmit={handleAddActualitat}
                onDelete={(path: string, id: string) => {
                  if (path) handleDelete(path);
                  else {
                    setActualitats(prev => prev.filter(a => a.id !== id));
                  }
                }}
                loading={loading}
                success={success}
                darkMode={darkMode}
                onLoadMock={loadMockNews}
              />
            } />
            <Route path="actualitat-preguntes" element={
              <ActualitatPreguntesView 
                actualitats={actualitatPreguntes} 
                novaActualitat={novaActualitatPregunta} 
                setNovaActualitat={setNovaActualitatPregunta} 
                onSubmit={handleAddActualitatPregunta}
                onDelete={(path: string, id: string) => {
                  if (path) handleDelete(path);
                  else {
                    setActualitatPreguntes(prev => prev.filter(a => a.id !== id));
                  }
                }}
                loading={loading}
                success={success}
                darkMode={darkMode}
              />
            } />
            <Route path="psicotecnica-tipus" element={
              <PsicotecnicsTipusView 
                tipus={psicotecnicsTipus}
                nouTipus={nouPsicotecnicTipus}
                setNouTipus={setNouPsicotecnicTipus}
                onSubmit={handleAddPsicotecnicTipus}
                onDelete={handleDelete}
                loading={loading}
                success={success}
                darkMode={darkMode}
              />
            } />
            <Route path="psicotecnica-preguntes" element={
              <PsicotecnicsPreguntesView 
                preguntes={psicotecnicsPreguntes}
                tipus={psicotecnicsTipus}
                novaPregunta={novaPsicotecnicPregunta}
                setNovaPregunta={setNovaPsicotecnicPregunta}
                onSubmit={handleAddPsicotecnicPregunta}
                onDelete={handleDelete}
                onLoadMock={loadMockPsicotecnics}
                loading={loading}
                success={success}
                darkMode={darkMode}
              />
            } />
            <Route path="gimnasos" element={
              <GimnasosView 
                gimnasos={gimnasos}
                onDelete={handleDelete}
                onAdd={async (g: any) => {
                  setLoading(true);
                  try {
                    await addDoc(collection(db, "gimnasos"), { ...g, createdAt: serverTimestamp() });
                    fetchData();
                  } finally { setLoading(false); }
                }}
                darkMode={darkMode}
              />
            } />
            <Route path="psicologia" element={
              <PsicologiaView 
                reserves={reserves}
                onUpdateStatus={async (id: string, estat: string) => {
                  setLoading(true);
                  try {
                    await updateDoc(doc(db, "reserves_psicologia", id), { estat });
                    fetchData();
                  } finally { setLoading(false); }
                }}
                onSeedData={async () => {
                  setLoading(true);
                  try {
                    // Generar una hora vàlida dins dels torns
                    const isMorning = Math.random() > 0.5;
                    const date = new Date(Date.now() + 86400000 * 2);
                    date.setHours(isMorning ? 10 : 18, 30, 0, 0);

                    await addDoc(collection(db, "reserves_psicologia"), {
                      usuariNom: "Roger de Flor (Prova)",
                      usuariEmail: "roger.prova@example.com",
                      dataSessio: date.toISOString(),
                      estat: "pendent",
                      notes: "Preparació intensiva per a l'entrevista oficial. Té dubtes sobre la part de competències socials.",
                      telefon: "654 321 000",
                      edat: "24",
                      anysOpositant: "2",
                      psicoleg: "Aleix Romero Pociello",
                      biodataFet: true,
                      competencies: {
                        "Orientació al servei": 8.5,
                        "Autocontrol": 7.2,
                        "Comunicació": 9.0,
                        "Treball en equip": 8.8,
                        "Resolució de problemes": 6.5,
                        "Presa de decisions": 7.0,
                        "Planificació": 8.0,
                        "Responsabilitat": 9.5,
                        "Adaptabilitat": 7.5,
                        "Ètica professional": 9.8
                      },
                      biodataInforme: "Perfil altament vocacional amb excel·lents capacitats comunicatives. Es recomana treballar la rapidesa en la presa de decisions sota pressió extrema.",
                      createdAt: serverTimestamp()
                    });
                    fetchData();
                  } finally { setLoading(false); }
                }}
                darkMode={darkMode}
                loading={loading}
              />
            } />
            <Route path="pagaments" element={
              <SubscripcionsView 
                subscripcions={subscripcions}
                onUpdateStatus={async (id: string, data: any) => {
                  setLoading(true);
                  try {
                    await updateDoc(doc(db, "subscripcions", id), data);
                    fetchData();
                  } finally { setLoading(false); }
                }}
                darkMode={darkMode}
              />
            } />
            <Route path="*" element={<div className={`p-10 text-center font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Aquesta secció encara no està desplegada.</div>} />
          </Routes>
        )}
      </div>
    </main>
  </div>
  );
}

/**
 * COMPONENT: CollapsibleSection
 * Secció desplegable al sidebar amb arquitectura de Lego.
 */
function CollapsibleSection({ 
  title, 
  isOpen, 
  onToggle, 
  children,
  icon
}: { 
  title: string, 
  isOpen: boolean, 
  onToggle: () => void, 
  children: React.ReactNode,
  icon?: React.ReactNode
}) {
  return (
    <div className="mb-2">
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left group border ${
          isOpen 
            ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-black/20' 
            : 'bg-white/5 border-white/5 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/10'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className={`${isOpen ? 'text-yellow-400' : 'text-white/30 group-hover:text-white/50'} transition-colors`}>{icon}</span>}
          <span className="text-[11px] font-black uppercase tracking-[0.12em] truncate whitespace-nowrap">{title}</span>
        </div>
        <ChevronRight size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''} ${isOpen ? 'text-white' : 'text-white/20'}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden flex flex-col gap-1 mt-1.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 
 * COMPONENT: SidebarItem
 */
function SidebarItem({ to, active, icon, label, badge }: { to: string, active: boolean, icon: any, label: string, badge?: string }) {
  return (
    <Link 
      to={to}
      className={`group w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-white/50 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`${active ? 'text-white' : 'text-white/30 group-hover:text-white/60'} transition-colors`}>{icon}</span>
        <span className="font-bold text-[13px] tracking-tight">{label}</span>
      </div>
      {badge && <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-yellow-400 text-[#001a33] rounded leading-none">{badge}</span>}
    </Link>
  );
}

/**
 * COMPONENT: BackButton
 * Botó de tornada enrere per a les seccions del Backoffice.
 */
function BackButton({ darkMode }: { darkMode: boolean }) {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)}
      className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all group active:scale-95 shrink-0 ${
        darkMode 
          ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 shadow-2xl shadow-black/40' 
          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-2xl'
      }`}
      title="Torna enrere"
    >
      <ArrowLeft size={28} className="group-hover:-translate-x-1.5 transition-transform" />
    </button>
  );
}

/**
 * VIEW: Welcome
 */
function WelcomeView({ darkMode, trabajadorName = "treballador/a X" }: { darkMode: boolean, trabajadorName?: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-between text-center py-10 animate-in fade-in zoom-in duration-1000">
       {/* Espaiador superior */}
       <div className="flex-1 flex flex-col items-center justify-center space-y-16">
          
          {/* TITOL PRINCIPAL */}
          <div className="space-y-6">
            <h1 className={`text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-[0.9] ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Benvingut/a <br/>
              <span className="text-blue-600">{trabajadorName}</span>
            </h1>
            <div className="h-2 w-48 bg-blue-600 mx-auto rounded-full" />
          </div>

          {/* FRASES DE BENVINGUDA */}
          <div className={`space-y-4 text-xl md:text-2xl font-semibold tracking-tight leading-relaxed max-w-3xl ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <p>Des d'OposiCAT et desitgem que passis</p>
            <p>el millor dia possible! Gràcies per fer-nos grans.</p>
          </div>

          {/* ICONA DE CAFÈ EN UN CONTENIDOR PERSONALITZAT */}
          <div className={`p-10 md:p-16 rounded-[4rem] border transition-all transform hover:scale-110 duration-500 ${
            darkMode 
              ? 'bg-slate-800/40 border-slate-700 shadow-[0_0_80px_rgba(59,130,246,0.15)]' 
              : 'bg-white border-slate-200 shadow-[0_0_80px_rgba(0,0,0,0.05)]'
          }`}>
            <Coffee size={140} strokeWidth={0.75} className="text-blue-500 animate-pulse" />
          </div>
       </div>

       {/* INDICACIÓ INFERIOR */}
       <div className="mt-10">
          <p className={`text-[11px] font-black uppercase tracking-[0.6em] transition-opacity duration-300 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            Selecciona un sistema al menú de l'esquerra per començar
          </p>
       </div>
    </div>
  );
}

/**
 * VIEW: Prova Teorica (Menú de 3 columnes)
 */
function ProvaTeoricaView({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="relative flex items-center justify-center mb-16">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton darkMode={darkMode} />
        </div>
        <div className="text-center flex flex-col items-center">
          <h1 className={`text-6xl md:text-7xl font-black tracking-tighter italic uppercase mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Prova <span className="text-blue-600">teòrica</span>
          </h1>
          <div className="h-1.5 w-32 bg-blue-600 rounded-full mb-4" />
          <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Què vols gestionar?
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative border-y border-slate-200 dark:border-slate-800 py-10">
        {/* COLUMNA 1: TEORIA */}
        <div className="flex flex-col px-8 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Teoria</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="/admin/preguntes" label="Banc de preguntes d'exàmens" icon={<CheckSquare size={18} />} darkMode={darkMode} />
            <MenuActionLink to="#" label="Afegir resums" icon={<FilePlus2 size={18} />} darkMode={darkMode} />
          </div>
        </div>

        {/* LÍNIA DIVISÒRIA */}
        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 absolute left-1/3 top-0 bottom-0" />

        {/* COLUMNA 2: ACTUALITAT */}
        <div className="flex flex-col px-8 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Actualitat</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="/admin/actualitat" label="Banc de preguntes d'actualitat" icon={<Newspaper size={18} />} darkMode={darkMode} />
            <MenuActionLink to="/admin/actualitat-preguntes" label="Afegir notícia d'actualitat" icon={<Plus size={18} />} darkMode={darkMode} />
          </div>
        </div>

        {/* LÍNIA DIVISÒRIA */}
        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 absolute left-2/3 top-0 bottom-0" />

        {/* COLUMNA 3: PSICOTÈCNICS */}
        <div className="flex flex-col px-8 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Psicotècnics</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="/admin/psicotecnica-preguntes" label="Banc de preguntes de psicotècnics" icon={<LayoutDashboard size={18} />} darkMode={darkMode} />
            <MenuActionLink to="/admin/psicotecnica-tipus" label="Afegir exercici teòric" icon={<BookOpen size={18} />} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * VIEW: Prova Fisica (Menú de 2 columnes)
 */
function ProvaFisicaView({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="relative flex items-center justify-center mb-16">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton darkMode={darkMode} />
        </div>
        <div className="text-center flex flex-col items-center">
          <h1 className={`text-6xl md:text-7xl font-black tracking-tighter italic uppercase mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Prova <span className="text-emerald-500">física</span>
          </h1>
          <div className="h-1.5 w-32 bg-emerald-500 rounded-full mb-4" />
          <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Què vols gestionar?
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 relative border-y border-slate-200 dark:border-slate-800 py-10">
        {/* COLUMNA 1: GESTIÓ PROVES */}
        <div className="flex flex-col px-12 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gestió de les proves físiques</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="#" label="Gestió d'exercici" icon={<Activity size={18} />} darkMode={darkMode} color="emerald" />
            <MenuActionLink to="#" label="Gestió de pla d'entrenament" icon={<Calendar size={18} />} darkMode={darkMode} color="emerald" />
          </div>
        </div>

        {/* LÍNIA DIVISÒRIA CENTRAL */}
        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 absolute left-1/2 top-0 bottom-0" />

        {/* COLUMNA 2: GIMNASOS */}
        <div className="flex flex-col px-12 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gestió de gimnasos</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="/admin/gimnasos" label="Donar d'alta gimnàs nou" icon={<Plus size={18} />} darkMode={darkMode} color="emerald" />
            <MenuActionLink to="/admin/gimnasos" label="Gestió de gimnàs existent" icon={<MapPin size={18} />} darkMode={darkMode} color="emerald" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * VIEW: Prova Psicotècnica (Menú de 3 columnes)
 */
function ProvaPsicotecnicaView({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="relative flex items-center justify-center mb-16">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton darkMode={darkMode} />
        </div>
        <div className="text-center flex flex-col items-center">
          <h1 className={`text-6xl md:text-7xl font-black tracking-tighter italic uppercase mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Prova <span className="text-purple-500">psicotècnica</span>
          </h1>
          <div className="h-1.5 w-32 bg-purple-500 rounded-full mb-4" />
          <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Què vols gestionar?
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative border-y border-slate-200 dark:border-slate-800 py-10">
        {/* COLUMNA 1: BIODATA */}
        <div className="flex flex-col px-8 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Biodata</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="#" label="Gestió preguntes personals" icon={<ClipboardList size={18} />} darkMode={darkMode} color="purple" />
            <MenuActionLink to="#" label="Gestió preguntes laborals" icon={<Briefcase size={18} />} darkMode={darkMode} color="purple" />
            <MenuActionLink to="#" label="Gestió preguntes PGME" icon={<FileText size={18} />} darkMode={darkMode} color="purple" />
          </div>
        </div>

        {/* LÍNIA DIVISÒRIA */}
        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 absolute left-1/3 top-0 bottom-0" />

        {/* COLUMNA 2: ENTREVISTA */}
        <div className="flex flex-col px-8 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Entrevista</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="#" label="Gestió de preguntes d'entrevista" icon={<MessageSquare size={18} />} darkMode={darkMode} color="purple" />
          </div>
        </div>

        {/* LÍNIA DIVISÒRIA */}
        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 absolute left-2/3 top-0 bottom-0" />

        {/* COLUMNA 3: GESTIÓ CLIENTS */}
        <div className="flex flex-col px-8 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gestió Clients</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="/admin/psicologia" label="Gestió de cites d'usuari" icon={<Calendar size={18} />} darkMode={darkMode} color="purple" />
            <MenuActionLink to="#" label="Gestió de psicòlegs en cites d'usuari" icon={<Users2 size={18} />} darkMode={darkMode} color="purple" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuActionLink({ to, label, icon, darkMode, color = "blue" }: { to: string, label: string, icon: any, darkMode: boolean, color?: "blue" | "emerald" | "purple" }) {
  const isBlue = color === "blue";
  const isEmerald = color === "emerald";
  const isPurple = color === "purple";
  
  return (
    <Link 
      to={to}
      className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] border transition-all transform hover:-translate-y-1 hover:shadow-xl group ${
        darkMode 
          ? `bg-slate-800 border-slate-700 ${
              isBlue ? 'hover:border-blue-500/50 shadow-blue-500/5' : 
              isEmerald ? 'hover:border-emerald-500/50 shadow-emerald-500/5' : 
              'hover:border-purple-500/50 shadow-purple-500/5'
            } hover:bg-slate-800/80 text-white` 
          : `bg-white border-slate-200 ${
              isBlue ? 'hover:border-blue-300 shadow-slate-200/50' : 
              isEmerald ? 'hover:border-emerald-300 shadow-emerald-200/50' : 
              'hover:border-purple-300 shadow-purple-200/50'
            } hover:bg-slate-50 text-slate-800`
      }`}
    >
      <span className="text-xs font-black uppercase tracking-tight leading-tight">{label}</span>
      <div className={`p-2.5 rounded-xl transition-colors ${
        darkMode 
          ? `bg-slate-900 ${
              isBlue ? 'text-blue-400 group-hover:bg-blue-600' : 
              isEmerald ? 'text-emerald-400 group-hover:bg-emerald-600' : 
              'text-purple-400 group-hover:bg-purple-600'
            } group-hover:text-white` 
          : `${
              isBlue ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600' : 
              isEmerald ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600' : 
              'bg-purple-50 text-purple-600 group-hover:bg-purple-600'
            } group-hover:text-white`
      }`}>
        {icon}
      </div>
    </Link>
  );
}
function DashboardView({ preguntes, actualitats, darkMode }: { preguntes: any[], actualitats: any[], darkMode: boolean }) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex items-center gap-10">
        <BackButton darkMode={darkMode} />
        <div>
          <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice Overview</span>
          <h1 className={`text-4xl font-black tracking-tight mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Taulell de <span className="text-blue-600">Control</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Preguntes" val={preguntes.length} color="blue" icon={<BookOpen />} trend="+12% vs últim mes" darkMode={darkMode} />
        <StatCard title="Actualitat Mossos" val={actualitats.length} color="blue" icon={<Newspaper />} trend="5 pendents de revisió" darkMode={darkMode} />
        <StatCard title="Ús de l'App" val="84%" color="amber" icon={<BarChart3 />} trend="+4.3% activitat" darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="font-black uppercase text-sm text-slate-400 mb-6 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
               Recents al Banc de Preguntes
            </h3>
            <div className="space-y-4">
               {preguntes.slice(0, 4).map(p => (
                 <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${darkMode ? 'bg-slate-900 border-slate-700 hover:border-blue-500' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}>
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-black uppercase text-blue-500">Bloc {p.ambit}</span>
                       <p className={`text-sm font-bold line-clamp-1 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{p.pregunta}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 translate-x-0 group-hover:translate-x-1 transition-all" />
                 </div>
               ))}
               <Link to="/admin/preguntes" className={`block text-center text-xs font-black uppercase tracking-widest pt-4 transition-colors ${darkMode ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`}>Veure totes les preguntes</Link>
            </div>
         </div>

         <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="font-black uppercase text-sm text-slate-400 mb-6 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
               Últimes Notícies Publicades
            </h3>
            <div className="space-y-4">
               {actualitats.slice(0, 4).map(n => (
                 <div key={n.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent ${darkMode ? 'hover:bg-slate-900 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-100'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-blue-950/30' : 'bg-blue-50'}`}>
                       <Newspaper className="text-blue-500" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{n.titol}</p>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{n.data}</span>
                    </div>
                 </div>
               ))}
               <Link to="/admin/actualitat" className={`block text-center text-xs font-black uppercase tracking-widest pt-4 transition-colors ${darkMode ? 'text-slate-500 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'}`}>Gestionar actualitat</Link>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, val, color, icon, trend, darkMode }: any) {
  const colorMap: any = {
    blue: 'bg-blue-600 text-white',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white'
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border shadow-sm flex flex-col gap-6 group hover:translate-y-[-4px] transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
       <div className={`w-14 h-14 ${colorMap[color]} rounded-2xl flex items-center justify-center shadow-lg`}>
          {icon}
       </div>
       <div>
          <h3 className="text-slate-400 font-bold uppercase text-[11px] tracking-widest mb-1">{title}</h3>
          <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{val}</p>
          <span className="text-[10px] font-bold text-emerald-500 mt-2 block">{trend}</span>
       </div>
    </div>
  );
}

/**
 * MODAL DE CONFIRMACIÓ
 */
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, darkMode }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`relative w-full max-w-sm rounded-[2.5rem] border p-8 shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
           <BarChart3 className="text-blue-500" size={24} />
        </div>
        <h3 className={`text-xl font-black uppercase italic tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
        <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{message}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onClose}
            className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            Cancel·lar
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * VIEW: Preguntes
 */
function PreguntesView({ preguntes, novaPregunta, setNovaPregunta, onSubmit, onDelete, onToggleStatus, onEdit, editingId, cancelEdit, loading, error, success, darkMode, setConfirmModal, onRetry, onLoadMock }: any) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterAmbit, setFilterAmbit] = useState("");
  const [filterTema, setFilterTema] = useState("");
  const [filterCapitol, setFilterCapitol] = useState("");

  // Obrir el formulari automàticament si estem editant
  useEffect(() => {
    if (editingId) setIsFormOpen(true);
  }, [editingId]);

  // Obtenir dades del temari per al formulari de creació
  const formTemesAmbit = TEMARI_DETALL[novaPregunta.ambit as 'A' | 'B' | 'C'] || [];
  const formTemaSeleccionat = formTemesAmbit[novaPregunta.tema] || { titol: "", subtemes: [] };
  const formCapitolsTema = formTemaSeleccionat.subtemes || [];

  // Obtenir dades del temari per als FILTRES
  const filterTemesAmbit = filterAmbit ? TEMARI_DETALL[filterAmbit as 'A' | 'B' | 'C'] : [];
  const filterTemaObj = (filterAmbit && filterTema !== "") ? filterTemesAmbit[parseInt(filterTema)] : null;
  const filterCapitolsList = filterTemaObj ? filterTemaObj.subtemes : [];

  // Filtratge de la llista de preguntes
  const preguntesFiltrades = preguntes.filter((p: any) => {
    if (filterAmbit && p.ambit !== filterAmbit) return false;
    if (filterTema !== "" && p.tema !== parseInt(filterTema)) return false;
    if (filterCapitol !== "" && p.capitol !== parseInt(filterCapitol)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
           <BackButton darkMode={darkMode} />
           <div>
              <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">Teoria / Mossos d'Esquadra</span>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mt-1 uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Banc de <span className="text-blue-600">Preguntes</span>
              </h1>
           </div>
           
           <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex flex-col">
                 <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Estat servidors</span>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className={`text-[10px] font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Connexió a la BBDD en breus</span>
                 </div>
              </div>
              <button 
                onClick={onLoadMock}
                className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                Test ( NO BBDD )
              </button>
           </div>
        </div>
        <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${darkMode ? 'bg-blue-950/20 border-blue-900' : 'bg-blue-50 border-blue-100'}`}>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase text-blue-600 leading-none mb-1">Mostrant</span>
            <span className={`text-xl font-black leading-none ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{preguntesFiltrades.length}</span>
          </div>
          <div className="w-px h-8 bg-blue-500/20 mx-1"></div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Total BBDD</span>
            <span className={`text-sm font-bold leading-none ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>{preguntes.length}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* COLUMNA ESQUERRA: FORMULARI AFÈGUIR (Tipus Acordió) */}
         <div className="lg:col-span-4 space-y-6">
            <div className={`rounded-[2.5rem] border shadow-2xl overflow-hidden transition-all duration-500 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            } ${isFormOpen ? 'max-h-[1500px]' : 'max-h-24'}`}>
               
               {/* CAPÇALERA DEL BOTÓ DESPLEGABLE */}
               <button 
                 onClick={() => {
                   if (editingId) cancelEdit();
                   setIsFormOpen(!isFormOpen);
                 }}
                 className={`w-full p-8 flex items-center justify-between group transition-colors ${
                   isFormOpen 
                    ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white') 
                    : (darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50')
                 }`}
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                       isFormOpen ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                     }`}>
                        {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                     </div>
                     <div className="text-left">
                        <h3 className={`text-lg font-black uppercase italic tracking-tighter ${!isFormOpen && darkMode ? 'text-white' : ''}`}>
                          {editingId ? 'Modificar Pregunta' : 'Afegir Pregunta'}
                        </h3>
                        {isFormOpen && <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Emplena tots els camps</p>}
                     </div>
                  </div>
                  <ChevronRight size={20} className={`transition-transform duration-300 ${isFormOpen ? 'rotate-90' : ''}`} />
               </button>

               {/* COS DEL FORMULARI */}
               <div className={`p-8 space-y-6 ${isFormOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <form onSubmit={e => { onSubmit(e); if (!editingId) setIsFormOpen(false); }} className="space-y-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Enunciat de la pregunta</label>
                       <textarea 
                         required
                         value={novaPregunta.pregunta}
                         onChange={e => setNovaPregunta({...novaPregunta, pregunta: e.target.value})}
                         className={`w-full p-5 rounded-2xl border-2 outline-none text-sm font-bold min-h-[120px] transition-all resize-none shadow-inner ${
                           darkMode ? 'bg-slate-900 border-slate-700 focus:border-blue-500 text-white' : 'bg-slate-50 border-slate-100 focus:border-blue-500 text-slate-900'
                         }`}
                         placeholder="Ex: Segons la llei 10/1994, quines són les funcions de la policia?"
                       />
                    </div>
                    
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Opcions de resposta</label>
                       <div className="grid gap-2.5">
                          {novaPregunta.opcions.map((op: string, idx: number) => (
                            <div key={idx} className="relative group">
                              <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                novaPregunta.correcta === idx ? 'bg-emerald-500 text-white' : (darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500')
                              }`}>
                                {String.fromCharCode(65+idx)}
                              </div>
                              <input 
                                required
                                value={op}
                                onChange={e => {
                                  const newOps = [...novaPregunta.opcions];
                                  newOps[idx] = e.target.value;
                                  setNovaPregunta({...novaPregunta, opcions: newOps});
                                }}
                                className={`w-full pl-12 pr-4 py-4 rounded-xl border text-xs font-bold outline-none transition-all ${
                                  darkMode ? 'bg-slate-900 border-slate-700 focus:bg-blue-900/10 text-white' : 'bg-white border-slate-100 focus:bg-blue-50 text-slate-900'
                                }`}
                                placeholder={`Escriu l'opció ${String.fromCharCode(65+idx)}...`}
                              />
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5 col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Resposta Correcta</label>
                          <div className="grid grid-cols-4 gap-2">
                             {[0,1,2,3].map(idx => (
                               <button
                                 key={idx}
                                 type="button"
                                 onClick={() => setNovaPregunta({...novaPregunta, correcta: idx})}
                                 className={`py-3 rounded-xl border-2 font-black transition-all ${
                                   novaPregunta.correcta === idx 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                    : (darkMode ? 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200')
                                 }`}
                               >
                                 {String.fromCharCode(65+idx)}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">1. Àmbit / Bloc</label>
                          <select 
                            value={novaPregunta.ambit}
                            onChange={e => setNovaPregunta({...novaPregunta, ambit: e.target.value, tema: 0, capitol: 0})}
                            className={`w-full p-4 rounded-xl text-xs font-black outline-none transition-colors appearance-none cursor-pointer ${
                              darkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-slate-50 text-slate-900 border border-slate-100'
                            }`}
                          >
                            <option value="A">BLOC A — Coneixements de l'entorn</option>
                            <option value="B">BLOC B — Institucional</option>
                            <option value="C">BLOC C — Seguretat i Policia</option>
                          </select>
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">2. Tema del bloc</label>
                          <select 
                            value={novaPregunta.tema}
                            onChange={e => setNovaPregunta({...novaPregunta, tema: parseInt(e.target.value), capitol: 0})}
                            className={`w-full p-4 rounded-xl text-xs font-black outline-none transition-colors appearance-none cursor-pointer ${
                              darkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-slate-50 text-slate-900 border border-slate-100'
                            }`}
                          >
                            {formTemesAmbit.map((t: any, idx: number) => (
                              <option key={idx} value={idx}>T.{idx + 1} — {t.titol}</option>
                            ))}
                          </select>
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">3. Capítol d'especialització</label>
                          <select 
                            value={novaPregunta.capitol}
                            onChange={e => setNovaPregunta({...novaPregunta, capitol: parseInt(e.target.value)})}
                            className={`w-full p-4 rounded-xl text-xs font-black outline-none transition-colors appearance-none cursor-pointer ${
                              darkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-slate-50 text-slate-900 border border-slate-100'
                            }`}
                          >
                            {formCapitolsTema.map((cap: string, idx: number) => (
                              <option key={idx} value={idx}>{idx + 1}. {cap.length > 60 ? cap.substring(0, 60) + '...' : cap}</option>
                            ))}
                          </select>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Feedback de resolució</label>
                       <textarea 
                         value={novaPregunta.explicacio}
                         onChange={e => setNovaPregunta({...novaPregunta, explicacio: e.target.value})}
                         className={`w-full p-5 rounded-2xl border-2 outline-none text-xs min-h-[100px] transition-all resize-none ${
                           darkMode ? 'bg-slate-900 border-slate-800 focus:border-blue-500 text-slate-400' : 'bg-white border-slate-50 focus:border-blue-500 text-slate-500 font-medium'
                         }`}
                         placeholder="Explica per què aquesta resposta és la correcta..."
                       />
                    </div>

                    <div className="flex gap-3">
                       {editingId && (
                         <button 
                           type="button" 
                           onClick={cancelEdit}
                           className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                             darkMode ? 'bg-slate-700 text-slate-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                           }`}
                         >
                           Cancel·lar
                         </button>
                       )}
                       <button 
                         disabled={loading}
                         type="submit"
                         className={`flex-[2] py-4 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs hover:translate-y-[-2px] hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                           editingId ? 'bg-amber-500 shadow-amber-500/30' : 'bg-blue-600 shadow-blue-600/30'
                         }`}
                       >
                         {loading ? "Guardant..." : <>{editingId ? <Save size={18} /> : <FilePlus2 size={18} />} {editingId ? 'Guardar Canvis' : 'Afegir a BBDD'}</>}
                       </button>
                    </div>
                  </form>
               </div>
            </div>
         </div>

         {/* COLUMNA DRETA: FILTRES I LLISTA */}
         <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* BLOC DE FILTRES SEQUENCIALS */}
            <div className={`p-8 rounded-[2.5rem] border shadow-sm flex flex-col gap-6 transition-colors ${
              darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'
            }`}>
               <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-3 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                    <Filter size={14} className="text-blue-500" /> Filtres de cerca
                  </h3>
                  {(filterAmbit || filterTema !== "" || filterCapitol !== "") && (
                    <button 
                      onClick={() => { setFilterAmbit(""); setFilterTema(""); setFilterCapitol(""); }}
                      className="text-[10px] font-black uppercase text-blue-500 hover:underline"
                    >
                      Netejar tots els filtres
                    </button>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* FILTRE 1: BLOC (Always unlocked) */}
                  <div className="flex flex-col gap-2">
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">1. Àmbit / Bloc</span>
                     <select 
                       value={filterAmbit}
                       onChange={e => { setFilterAmbit(e.target.value); setFilterTema(""); setFilterCapitol(""); }}
                       className={`w-full p-4 rounded-xl border text-xs font-black outline-none transition-all ${
                         darkMode 
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' 
                          : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-blue-500'
                       }`}
                     >
                       <option value="">Tots els blocs</option>
                       <option value="A">Bloc A</option>
                       <option value="B">Bloc B</option>
                       <option value="C">Bloc C</option>
                     </select>
                  </div>

                  {/* FILTRE 2: TEMA (Unlocks when Ambit is selected) */}
                  <div className={`flex flex-col gap-2 transition-opacity ${!filterAmbit ? 'opacity-30' : 'opacity-100'}`}>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">2. Tema seleccionat</span>
                     <select 
                       disabled={!filterAmbit}
                       value={filterTema}
                       onChange={e => { setFilterTema(e.target.value); setFilterCapitol(""); }}
                       className={`w-full p-4 rounded-xl border text-xs font-black outline-none transition-all ${
                         darkMode 
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' 
                          : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-blue-500'
                       } ${!filterAmbit ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                     >
                       <option value="">Tots els temes</option>
                       {filterTemesAmbit.map((t: any, idx: number) => (
                         <option key={idx} value={idx}>{idx + 1}. {t.titol}</option>
                       ))}
                     </select>
                  </div>

                  {/* FILTRE 3: CAPÍTOL (Unlocks when Tema is selected) */}
                  <div className={`flex flex-col gap-2 transition-opacity ${filterTema === "" ? 'opacity-30' : 'opacity-100'}`}>
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">3. Capítol d'especificació</span>
                     <select 
                       disabled={filterTema === ""}
                       value={filterCapitol}
                       onChange={e => setFilterCapitol(e.target.value)}
                       className={`w-full p-4 rounded-xl border text-xs font-black outline-none transition-all ${
                         darkMode 
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' 
                          : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-blue-500'
                       } ${filterTema === "" ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                     >
                       <option value="">Tots els capítols</option>
                       {filterCapitolsList.map((cap: string, idx: number) => (
                         <option key={idx} value={idx}>{idx + 1}. {cap.length > 40 ? cap.substring(0, 40) + '...' : cap}</option>
                       ))}
                     </select>
                  </div>
               </div>
            </div>

            {/* LLISTA DE PREGUNTES RESULTANTS */}
            <div className={`rounded-[2.5rem] border shadow-2xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className={`border-b transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                          <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contingut / Enunciat</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Ubicació (A.T.C)</th>
                          <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Accions</th>
                       </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                       {loading && preguntes.length === 0 ? (
                          <tr>
                             <td colSpan={3} className="p-32 text-center">
                                <div className="flex flex-col items-center gap-6">
                                   <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                   <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sincronitzant amb el núvol...</span>
                                </div>
                             </td>
                          </tr>
                       ) : error ? (
                          <tr>
                             <td colSpan={3} className="p-10 text-center">
                                <div className="flex flex-col items-center gap-4 bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-lg mx-auto">
                                   <X className="text-red-500" size={32} />
                                   <h4 className="text-red-500 font-black uppercase text-xs tracking-widest">Error de Càrrega</h4>
                                   <button 
                                     onClick={onRetry}
                                     className="mt-2 px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all flex items-center gap-2"
                                   >
                                      <RefreshCw size={14} /> Reintentar
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ) : preguntesFiltrades.length === 0 ? (
                          <tr>
                             <td colSpan={3} className="p-32 text-center">
                                <div className="flex flex-col items-center gap-6 opacity-40">
                                   <Search size={60} className="text-slate-300" />
                                   <div className="flex flex-col gap-2">
                                      <span className="text-sm font-black uppercase tracking-widest text-slate-400">Cap resultat coincideix amb els filtres</span>
                                      <p className="text-[10px] font-medium text-slate-400 italic">Prova a netejar els filtres superiors o selecciona un altre bloc.</p>
                                   </div>
                                </div>
                             </td>
                          </tr>
                       ) : (
                         preguntesFiltrades.map(p => (
                          <tr key={p.id} className={`transition-all group ${darkMode ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/50'} ${p.status === 'suspesa' ? 'opacity-40 grayscale-[0.8]' : ''}`}>
                             <td className="p-8">
                                <div className="flex flex-col gap-3">
                                   <div className="flex items-center gap-2">
                                      <span className={`text-[8px] px-2 py-1 rounded font-black uppercase tracking-widest ${
                                        p.status === 'suspesa' ? 'bg-slate-500 text-white' : 'bg-emerald-500 text-white'
                                      }`}>
                                        {p.status === 'suspesa' ? 'En Suspensió' : 'Llista Activa'}
                                      </span>
                                      {p.isLegacy && <span className="text-[8px] px-2 py-1 bg-amber-500 text-white rounded font-black uppercase tracking-widest">Legacy</span>}
                                   </div>
                                   <p className={`font-black text-base leading-snug tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{p.pregunta}</p>
                                   <div className="flex items-center gap-3">
                                      <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                         <Info size={12} />
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-bold italic line-clamp-1">{p.explicacio || "Sense explicació addicional."}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8 text-center min-w-[150px]">
                                <div className="flex flex-col items-center gap-1.5">
                                   <div className={`flex items-center gap-1 px-4 py-2 rounded-2xl text-[11px] font-black ${
                                     darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                   }`}>
                                      <span>{p.ambit}</span>
                                      <span className="opacity-20">/</span>
                                      <span>T.{p.tema + 1}</span>
                                      <span className="opacity-20">/</span>
                                      <span>C.{p.capitol + 1}</span>
                                   </div>
                                   <span className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400">Ubicació Temari</span>
                                </div>
                             </td>
                             <td className="p-8">
                                <div className="flex items-center justify-end gap-2">
                                   {/* ACTIVAR / SUSPENDRE */}
                                   <button 
                                     onClick={() => onToggleStatus(p.id, p.status || 'activa')}
                                     className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                       p.status === 'suspesa' 
                                        ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white shadow-lg shadow-blue-500/20' 
                                        : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white shadow-lg shadow-amber-500/20'
                                     }`}
                                     title={p.status === 'suspesa' ? "Activar" : "Suspendre"}
                                   >
                                      {p.status === 'suspesa' ? <Eye size={18} /> : <EyeOff size={18} />}
                                   </button>
                                   
                                   {/* MODIFICAR */}
                                   <button 
                                     onClick={() => onEdit(p)}
                                     className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center"
                                     title="Modificar"
                                   >
                                      <Edit3 size={18} />
                                   </button>
  
                                   {/* BORRAR */}
                                   <button 
                                     onClick={() => {
                                       const targetPath = p.fullPath;
                                       const targetId = p.id;
                                       setConfirmModal({
                                         isOpen: true,
                                         title: "Eliminar Pregunta",
                                         message: targetPath 
                                           ? "Aquesta pregunta s'esborrarà definitivament de la base de dades Firestore. Aquesta acció és irreversible."
                                           : "Vols eliminar aquesta pregunta del llistat temporal?",
                                         onConfirm: () => { onDelete(targetPath, targetId); }
                                       });
                                     }}
                                     className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                       darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-400 hover:bg-red-500 hover:text-white'
                                     }`}
                                     title="Borrar"
                                   >
                                      <Trash2 size={18} />
                                   </button>
                                </div>
                             </td>
                          </tr>
                         ))
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

/**
 * VIEW: Actualitat
 */
function ActualitatView({ actualitats, novaActualitat, setNovaActualitat, onSubmit, onDelete, loading, success, darkMode, onLoadMock }: any) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterAmbit, setFilterAmbit] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Filtratge local de notícies
  const actualitatsFiltrades = actualitats.filter((n: any) => {
    const matchesTitle = n.titol.toLowerCase().includes(filterTitle.toLowerCase());
    const matchesCategoria = filterCategoria === "" || n.categoria === filterCategoria;
    const matchesAmbit = filterAmbit === "" || n.ambit === filterAmbit;
    
    const nDate = new Date(n.data);
    const matchesMonth = filterMonth === "" || (nDate.getMonth() + 1).toString() === filterMonth;
    const matchesYear = filterYear === "" || nDate.getFullYear().toString() === filterYear;

    return matchesTitle && matchesCategoria && matchesAmbit && matchesMonth && matchesYear;
  });

  const categories = ["Politica", "Economia", "Mossos", "Salut", "Altres"];
  const ambits = ["Catalunya", "Espanya", "Europa", "Resta del món"];
  const months = [
    { v: "1", n: "Gener" }, { v: "2", n: "Febrer" }, { v: "3", n: "Març" },
    { v: "4", n: "Abril" }, { v: "5", n: "Maig" }, { v: "6", n: "Juny" },
    { v: "7", n: "Juliol" }, { v: "8", n: "Agost" }, { v: "9", n: "Setembre" },
    { v: "10", n: "Octubre" }, { v: "11", n: "Novembre" }, { v: "12", n: "Desembre" }
  ];
  const years = ["2023", "2024", "2025", "2026"];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
           <BackButton darkMode={darkMode} />
           <div className="flex items-center gap-6">
              <div>
                 <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">Actualitat / Banc</span>
                 <h1 className={`text-4xl font-black tracking-tight mt-1 uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                   Banc de <span className="text-blue-600">Dades i Notícies</span>
                 </h1>
              </div>

              <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Estat servidors</span>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                       <span className={`text-[10px] font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Connexió a la BBDD en breus</span>
                    </div>
                 </div>
                 <button 
                   onClick={onLoadMock}
                   className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                 >
                   Test ( NO BBDD )
                 </button>
              </div>
           </div>
        </div>
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${darkMode ? 'bg-blue-950/20 border-blue-900' : 'bg-blue-50 border-blue-100'}`}>
           <span className="text-[10px] font-black uppercase text-blue-600">Publicades</span>
           <span className={`text-sm font-black ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{actualitats.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* COLUMNA ESQUERRA: ACCIONS */}
          <div className="md:col-span-4 space-y-6">
            {/* BOTÓ AFEGIR (ACCORDIÓ) */}
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className={`w-full p-6 rounded-[2rem] border-2 flex items-center justify-between group transition-all duration-500 overflow-hidden relative ${
                isFormOpen 
                  ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-600/40 text-white' 
                  : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500' : 'bg-white border-slate-50 text-slate-600 hover:border-blue-500 shadow-xl shadow-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isFormOpen ? 'bg-white text-blue-600 rotate-45' : 'bg-blue-600 text-white group-hover:scale-110'}`}>
                  <Plus size={24} />
                </div>
                <span className="font-black uppercase tracking-widest text-[12px]">Afegir Notícia</span>
              </div>
              <ChevronRight size={20} className={`transition-all duration-500 ${isFormOpen ? 'rotate-90 opacity-0' : 'group-hover:translate-x-1'}`} />
            </button>

            {/* FORMULARI EXPANDIBLE */}
            <AnimatePresence>
              {isFormOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className={`p-8 rounded-[2.5rem] border-2 mt-4 shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-50 text-slate-800'}`}>
                    <form onSubmit={(e) => {
                       onSubmit(e);
                       if (success) setIsFormOpen(false);
                    }} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Títol de la notícia</label>
                        <input 
                          required
                          value={novaActualitat.titol}
                          onChange={e => setNovaActualitat({...novaActualitat, titol: e.target.value})}
                          className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-[13px] ${darkMode ? 'bg-slate-900 border-slate-800 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 focus:ring-2 focus:ring-blue-500'}`}
                          placeholder="Nom noticia..."
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Categoria</label>
                          <select 
                            required
                            value={novaActualitat.categoria}
                            onChange={e => setNovaActualitat({...novaActualitat, categoria: e.target.value})}
                            className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-[13px] appearance-none cursor-pointer ${darkMode ? 'bg-slate-900 text-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500'}`}
                          >
                            {categories.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Àmbit / Abast</label>
                          <select 
                            required
                            value={novaActualitat.ambit}
                            onChange={e => setNovaActualitat({...novaActualitat, ambit: e.target.value})}
                            className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-[13px] appearance-none cursor-pointer ${darkMode ? 'bg-slate-900 text-white focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500'}`}
                          >
                            {ambits.map(a => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Data de la Notícia</label>
                          <input 
                            type="date"
                            required
                            value={novaActualitat.data || new Date().toISOString().split('T')[0]}
                            onChange={e => setNovaActualitat({...novaActualitat, data: e.target.value})}
                            className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-[13px] ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 focus:ring-2 focus:ring-blue-500'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Cos de la descripció</label>
                        <textarea 
                          required
                          rows={4}
                          value={novaActualitat.descripcio}
                          onChange={e => setNovaActualitat({...novaActualitat, descripcio: e.target.value})}
                          className={`w-full p-4 rounded-2xl border-none outline-none text-[13px] resize-none ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 focus:ring-2 focus:ring-blue-500'}`}
                          placeholder="Contingut descriptiu..."
                        />
                      </div>

                      <button 
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        {loading ? "Processant..." : "Confirmar i Publicar"}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* COLUMNA DRETA: FILTRES I FEED RECENT */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* FILTRES D'ACTUALITAT */}
            <div className={`p-8 rounded-[2.5rem] border transition-colors ${darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-4">
                    <Filter size={14} className="text-blue-500" /> Filtres d'Actualitat
                 </h3>
                 {(filterTitle || filterCategoria || filterAmbit || filterMonth || filterYear) && (
                   <button 
                     onClick={() => { setFilterTitle(""); setFilterCategoria(""); setFilterAmbit(""); setFilterMonth(""); setFilterYear(""); }}
                     className="text-[9px] font-black uppercase text-blue-500 hover:underline"
                   >
                     Netejar Filtres
                   </button>
                 )}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Cerca per títol</span>
                       <div className={`w-full p-3 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                          <Search size={14} className="text-slate-400" />
                          <input 
                            className="bg-transparent border-none outline-none text-xs font-bold w-full" 
                            placeholder="Nom de la notícia..." 
                            value={filterTitle}
                            onChange={e => setFilterTitle(e.target.value)}
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Mes</span>
                          <select 
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                            className={`w-full p-3 rounded-xl text-[10px] font-black outline-none appearance-none cursor-pointer ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}
                          >
                            <option value="">Tots</option>
                            {months.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Any</span>
                          <select 
                            value={filterYear}
                            onChange={e => setFilterYear(e.target.value)}
                            className={`w-full p-3 rounded-xl text-[10px] font-black outline-none appearance-none cursor-pointer ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}
                          >
                            <option value="">Tots</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                       </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Categoria</span>
                        <select 
                          value={filterCategoria}
                          onChange={e => setFilterCategoria(e.target.value)}
                          className={`w-full p-3 rounded-xl text-[10px] font-black outline-none appearance-none cursor-pointer ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}
                        >
                          <option value="">Totes</option>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tighter">Àmbit</span>
                        <select 
                          value={filterAmbit}
                          onChange={e => setFilterAmbit(e.target.value)}
                          className={`w-full p-3 rounded-xl text-[10px] font-black outline-none appearance-none cursor-pointer ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}
                        >
                          <option value="">Tots</option>
                          {ambits.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                     </div>
                  </div>
               </div>
            </div>

            <h3 className="font-black uppercase text-[10px] tracking-widest text-slate-400 ml-4">Portal d'Actualitat (Recent)</h3>
            <div className={`p-1 rounded-[2.5rem] border transition-all ${darkMode ? 'bg-slate-800/20 border-slate-700/50' : 'bg-slate-100/50 border-slate-200'}`}>
               <div className="flex flex-col p-4 gap-4">
               {actualitatsFiltrades.length === 0 ? (
                 <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-20 h-20 rounded-full bg-slate-400/20 flex items-center justify-center mb-6">
                       <Newspaper size={40} className="text-slate-400" />
                    </div>
                    <p className="font-black uppercase tracking-widest text-xs italic">No hi ha notícies encara</p>
                 </div>
               ) : (
                 actualitatsFiltrades.map((n: any, idx: number) => (
                    <motion.div 
                      key={n.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-6 rounded-[2rem] border transition-all group flex items-center justify-between ${
                        darkMode ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500' : 'bg-white border-white hover:border-blue-500 shadow-sm'
                      }`}
                    >
                       <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 transition-transform group-hover:scale-110 ${darkMode ? 'bg-blue-950/40' : 'bg-blue-50 border border-blue-100'}`}>
                              <Newspaper size={24} />
                           </div>
                           <div className="min-w-0">
                               <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                  <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest ${darkMode ? 'bg-blue-900/60 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>{n.categoria}</span>
                                  <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>{n.ambit || "N/A"}</span>
                                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                  <span className="text-[10px] text-slate-400 font-bold tracking-tighter italic uppercase">{n.data}</span>
                               </div>
                               <h4 className={`font-black text-lg leading-tight uppercase italic tracking-tighter truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{n.titol}</h4>
                               <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-medium tracking-tight italic">{n.descripcio}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button 
                            onClick={() => onDelete(`actualitat/${n.id}`, n.id)} 
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                              darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-400 hover:bg-red-500 hover:text-white border border-red-100'
                            }`}
                            title="Eliminar"
                          >
                             <Trash2 size={20} />
                          </button>
                       </div>
                    </motion.div>
                  ))
                )}
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}

/**
 * VISTA: Banc de Preguntes d'Actualitat
 * Aquesta pantalla permet als administradors donar d'alta una notícia i, alhora, 
 * preparar una pregunta d'examen (tipus test) basada en aquesta notícia.
 * És la peça clau per a l'examen d'actualitat de les oposicions.
 */
function ActualitatPreguntesView({ actualitats, novaActualitat, setNovaActualitat, onSubmit, onDelete, loading, success, darkMode }: any) {
  // Estat per controlar si el formulari de creació està obert o tancat
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Estats per als filtres de cerca a la llista
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterAmbit, setFilterAmbit] = useState("");

  // Funció que filtra les preguntes segons el que l'usuari escrigui o seleccioni
  const actualitatsFiltrades = actualitats.filter((n: any) => {
    const matchesTitle = n.titol.toLowerCase().includes(filterTitle.toLowerCase());
    const matchesCategoria = filterCategoria === "" || n.categoria === filterCategoria;
    const matchesAmbit = filterAmbit === "" || n.ambit === filterAmbit;
    return matchesTitle && matchesCategoria && matchesAmbit;
  });

  // Categories i Àmbits predefinits per a les notícies
  const categories = ["Politica", "Economia", "Mossos", "Salut", "Altres"];
  const ambits = ["Catalunya", "Espanya", "Europa", "Resta del món"];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
           <BackButton darkMode={darkMode} />
           <div>
              <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">Examen / Afegir Notícia</span>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mt-1 uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Afegir <span className="text-blue-600">Notícia d'Examen</span>
              </h1>
           </div>
        </div>
        <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${darkMode ? 'bg-blue-950/20 border-blue-900' : 'bg-blue-50 border-blue-100'}`}>
           <span className="text-[10px] font-black uppercase text-blue-600">Total Preguntes</span>
           <span className={`text-xl font-black ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{actualitats.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* COLUMNA ESQUERRA: FORMULARI PER CREAR NOTÍCIA + PREGUNTA */}
          <div className="lg:col-span-12 space-y-6">
            <div className={`rounded-[2.5rem] border shadow-2xl overflow-hidden transition-all duration-500 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
            }`}>
               
               {/* Botó que desplega el formulari */}
               <button 
                 onClick={() => setIsFormOpen(!isFormOpen)}
                 className={`w-full p-8 flex items-center justify-between group transition-colors ${
                   isFormOpen ? 'bg-blue-600 text-white' : (darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50')
                 }`}
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isFormOpen ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                        <FilePlus2 size={24} />
                     </div>
                     <div className="text-left">
                        <h3 className={`text-xl font-black uppercase italic tracking-tighter ${!isFormOpen && darkMode ? 'text-white' : ''}`}>
                          Afegir Nova Pregunta d'Actualitat
                        </h3>
                        {isFormOpen && <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Defineix la notícia i la seva pregunta corresponent</p>}
                     </div>
                  </div>
                  <ChevronRight size={24} className={`transition-transform duration-300 ${isFormOpen ? 'rotate-90' : ''}`} />
               </button>

               {/* Formulari quan està obert */}
               <AnimatePresence>
                 {isFormOpen && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "auto", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                   >
                     <form onSubmit={(e) => { onSubmit(e); setIsFormOpen(false); }} className="p-10 space-y-10">
                        {/* SECCIÓ 1: LA NOTÍCIA */}
                        <div className="space-y-6">
                           <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-500 border-b border-blue-500/20 pb-2">Part 1: La Notícia</h4>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2 md:col-span-2">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Títol de l'Actualitat</label>
                                 <input 
                                   required
                                   value={novaActualitat.titol}
                                   onChange={e => setNovaActualitat({...novaActualitat, titol: e.target.value})}
                                   className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 focus:ring-2 focus:ring-blue-500'}`}
                                   placeholder="Ex: Nova llei de seguretat al Parlament"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Data de Referència</label>
                                 <input 
                                   type="date"
                                   required
                                   value={novaActualitat.data}
                                   onChange={e => setNovaActualitat({...novaActualitat, data: e.target.value})}
                                   className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 focus:ring-2 focus:ring-blue-500'}`}
                                 />
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Categoria</label>
                                  <select 
                                    value={novaActualitat.categoria}
                                    onChange={e => setNovaActualitat({...novaActualitat, categoria: e.target.value})}
                                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none cursor-pointer ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}
                                  >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Àmbit</label>
                                  <select 
                                    value={novaActualitat.ambit}
                                    onChange={e => setNovaActualitat({...novaActualitat, ambit: e.target.value})}
                                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none cursor-pointer ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}
                                  >
                                    {ambits.map(a => <option key={a} value={a}>{a}</option>)}
                                  </select>
                                </div>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Descripció o Detalls de la Notícia</label>
                              <textarea 
                                required
                                rows={3}
                                value={novaActualitat.descripcio}
                                onChange={e => setNovaActualitat({...novaActualitat, descripcio: e.target.value})}
                                className={`w-full p-4 rounded-2xl border-none outline-none text-sm resize-none ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-blue-500' : 'bg-slate-50 focus:ring-2 focus:ring-blue-500'}`}
                                placeholder="Escriu aquí un resum de la notícia que serveixi de context..."
                              />
                           </div>
                        </div>

                        {/* SECCIÓ 2: LA PREGUNTA */}
                        <div className="space-y-6">
                           <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-emerald-500 border-b border-emerald-500/20 pb-2">Part 2: Pregunta d'Examen</h4>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Enunciat de la Pregunta</label>
                              <textarea 
                                required
                                value={novaActualitat.pregunta}
                                onChange={e => setNovaActualitat({...novaActualitat, pregunta: e.target.value})}
                                className={`w-full p-5 rounded-2xl border-2 outline-none font-bold text-sm min-h-[100px] ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-emerald-500' : 'bg-slate-50 border-slate-100 focus:border-emerald-500'}`}
                                placeholder="Formula la pregunta que es farà a l'examen..."
                              />
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {novaActualitat.opcions.map((op: string, idx: number) => (
                                <div key={idx} className="relative group">
                                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                    novaActualitat.correcta === idx ? 'bg-emerald-500 text-white' : (darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500')
                                  }`}>
                                    {String.fromCharCode(65+idx)}
                                  </div>
                                  <input 
                                    required
                                    value={op}
                                    onChange={e => {
                                      const newOps = [...novaActualitat.opcions];
                                      newOps[idx] = e.target.value;
                                      setNovaActualitat({...novaActualitat, opcions: newOps});
                                    }}
                                    className={`w-full pl-12 pr-4 py-4 rounded-xl border text-xs font-bold outline-none transition-all ${
                                      darkMode ? 'bg-slate-900 border-slate-700 focus:bg-emerald-900/10 text-white' : 'bg-white border-slate-100 focus:bg-emerald-50 text-slate-900'
                                    }`}
                                    placeholder={`Opció ${String.fromCharCode(65+idx)}...`}
                                  />
                                </div>
                              ))}
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Resposta Correcta</label>
                                 <div className="grid grid-cols-4 gap-2">
                                    {[0,1,2,3].map(idx => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setNovaActualitat({...novaActualitat, correcta: idx})}
                                        className={`py-3 rounded-xl border-2 font-black transition-all ${
                                          novaActualitat.correcta === idx 
                                           ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                           : (darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400')
                                        }`}
                                      >
                                        {String.fromCharCode(65+idx)}
                                      </button>
                                    ))}
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Explicació (Feedback)</label>
                                 <input 
                                   value={novaActualitat.explicacio}
                                   onChange={e => setNovaActualitat({...novaActualitat, explicacio: e.target.value})}
                                   className={`w-full p-4 rounded-xl border outline-none text-xs font-medium ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
                                   placeholder="Per què és aquesta la bona?"
                                 />
                              </div>
                           </div>
                        </div>

                        <button 
                          disabled={loading}
                          type="submit"
                          className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-blue-600/40 transition-all active:scale-95 flex items-center justify-center gap-4"
                        >
                          {loading ? "Creant Banc de Dades..." : <><Database size={20} /> Guardar al Banc d'Actualitat</>}
                        </button>
                     </form>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* LLISTAT DE PREGUNTES D'ACTUALITAT JA EXISTENTS */}
          <div className="lg:col-span-12 space-y-6">
             <div className="flex items-center justify-between px-4">
                <h3 className="font-black uppercase text-[12px] tracking-widest text-slate-400">Preguntes d'Actualitat Publicades</h3>
                <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-xl flex items-center gap-3 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                      <Search size={14} className="text-slate-400" />
                      <input 
                        className="bg-transparent border-none outline-none text-[10px] font-bold w-48"
                        placeholder="Cerca per títol..."
                        value={filterTitle}
                        onChange={e => setFilterTitle(e.target.value)}
                      />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {actualitatsFiltrades.map((n: any, idx: number) => (
                  <motion.div 
                    key={n.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-2xl flex flex-col gap-6 ${
                      darkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-slate-100 hover:border-blue-500 shadow-sm shadow-slate-200/40'
                    }`}
                  >
                     <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                              <span className={`text-[8px] px-2 py-1 rounded font-black uppercase tracking-widest ${darkMode ? 'bg-blue-900/60 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>{n.categoria}</span>
                              <span className={`text-[8px] px-2 py-1 rounded font-black uppercase tracking-widest ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>{n.ambit}</span>
                           </div>
                           <h4 className={`text-xl font-black italic tracking-tighter uppercase leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{n.titol}</h4>
                        </div>
                        <button 
                          onClick={() => onDelete(`actualitat_preguntes/${n.id}`, n.id)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                           <Trash2 size={20} />
                        </button>
                     </div>

                     <div className={`p-6 rounded-2xl border-l-4 border-emerald-500 ${darkMode ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
                        <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest block mb-2 underline decoration-emerald-500/20">La Pregunta vinculada</span>
                        <p className={`text-xs font-bold leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{n.pregunta}</p>
                        <div className="grid grid-cols-2 gap-2">
                           {n.opcions?.map((op: string, i: number) => (
                             <div key={i} className={`p-2 rounded-lg text-[9px] font-bold border ${n.correcta === i ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-white/5 border-transparent text-slate-400'}`}>
                                {String.fromCharCode(65+i)}) {op}
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold italic">{n.data}</span>
                        <div className="flex items-center gap-2">
                           <CheckCircle2 size={14} className="text-emerald-500" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60">Llista per a l'Examen</span>
                        </div>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>
      </div>
    </div>
  );
}

/**
 * VISTA: Gestió de Tipus de Psicotècnics (Teoria)
 */
function PsicotecnicsTipusView({ tipus, nouTipus, setNouTipus, onSubmit, onDelete, loading, success, darkMode }: any) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
           <BackButton darkMode={darkMode} />
           <div>
              <span className="text-purple-600 font-bold uppercase tracking-[0.2em] text-[10px]">Psicotècnics / Tipologies</span>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mt-1 uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Tipus d' <span className="text-purple-600">Exercicis Psicotècnics</span>
              </h1>
           </div>
        </div>
        <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${darkMode ? 'bg-purple-950/20 border-purple-900' : 'bg-purple-50 border-purple-100'}`}>
           <span className="text-[10px] font-black uppercase text-purple-600">Tipologies</span>
           <span className={`text-xl font-black ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>{tipus.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
          {/* FORMULARI DE CREACIÓ */}
          <div className={`rounded-[2.5rem] border shadow-2xl overflow-hidden transition-all duration-500 ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
          }`}>
             <button 
               onClick={() => setIsFormOpen(!isFormOpen)}
               className={`w-full p-8 flex items-center justify-between group transition-colors ${
                 isFormOpen ? 'bg-purple-600 text-white' : (darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50')
               }`}
             >
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isFormOpen ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'}`}>
                      <FilePlus2 size={24} />
                   </div>
                   <div className="text-left">
                      <h3 className={`text-xl font-black uppercase italic tracking-tighter ${!isFormOpen && darkMode ? 'text-white' : ''}`}>
                        Afegir Nova Tipologia d'Exercici
                      </h3>
                      {isFormOpen && <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Defineix el títol, imatge d'exemple i vídeo explicatiu</p>}
                   </div>
                </div>
                <ChevronRight size={24} className={`transition-transform duration-300 ${isFormOpen ? 'rotate-90' : ''}`} />
             </button>

             <AnimatePresence>
               {isFormOpen && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden"
                 >
                   <form onSubmit={(e) => { onSubmit(e); setIsFormOpen(false); }} className="p-10 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Títol de l'exercici</label>
                            <input 
                              required
                              value={nouTipus.titol}
                              onChange={e => setNouTipus({...nouTipus, titol: e.target.value})}
                              className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-purple-500' : 'bg-slate-50 focus:ring-2 focus:ring-purple-500'}`}
                              placeholder="Ex: Fitxes de Dominó, Successions numèriques..."
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL Vídeo Youtube (Explicatiu)</label>
                            <div className="relative">
                               <Video size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                               <input 
                                 value={nouTipus.videoUrl}
                                 onChange={e => setNouTipus({...nouTipus, videoUrl: e.target.value})}
                                 className={`w-full p-4 pl-12 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-purple-500' : 'bg-slate-50 focus:ring-2 focus:ring-purple-500'}`}
                                 placeholder="https://www.youtube.com/watch?v=..."
                               />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Explicació de la Tipologia (Teoria)</label>
                         <textarea 
                           required
                           rows={4}
                           value={nouTipus.descripcio}
                           onChange={e => setNouTipus({...nouTipus, descripcio: e.target.value})}
                           className={`w-full p-4 rounded-2xl border-none outline-none font-medium text-sm resize-none ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-purple-500' : 'bg-slate-50 focus:ring-2 focus:ring-purple-500'}`}
                           placeholder="Explica en què consisteix aquest tipus d'exercici i com resoldre'l..."
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL Imatge d'Exemple (Referència Visual)</label>
                         <div className="relative">
                            <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              value={nouTipus.fotoExemple}
                              onChange={e => setNouTipus({...nouTipus, fotoExemple: e.target.value})}
                              className={`w-full p-4 pl-12 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-purple-500' : 'bg-slate-50 focus:ring-2 focus:ring-purple-500'}`}
                              placeholder="URL de la imatge d'exemple..."
                            />
                         </div>
                         <p className="text-[10px] text-slate-400 italic mt-1 ml-2">Aquesta imatge sortirà a la part superior com a guia de l'exercici.</p>
                      </div>

                      <button 
                        disabled={loading}
                        type="submit"
                        className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-purple-600/40 transition-all active:scale-95 flex items-center justify-center gap-4"
                      >
                        {loading ? "Creant Tipologia..." : <><Save size={20} /> Guardar Tipologia</>}
                      </button>
                   </form>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* LLISTAT DE TIPOLOGIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {tipus.map((t: any) => (
               <motion.div 
                 key={t.id}
                 className={`p-8 rounded-[2.5rem] border group hover:border-purple-500 transition-all ${
                   darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
                 }`}
               >
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-600">
                        <Type size={24} />
                     </div>
                     <button 
                       onClick={() => onDelete(`psicotecnics_tipus/${t.id}`, t.id)}
                       className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                     >
                        <Trash2 size={20} />
                     </button>
                  </div>
                  <h4 className={`text-xl font-black uppercase italic tracking-tighter mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{t.titol}</h4>
                  
                  {t.descripcio && (
                    <p className="text-[10px] text-slate-400 mb-4 line-clamp-3 italic">{t.descripcio}</p>
                  )}

                  <div className="flex flex-col gap-3">
                     {t.videoUrl && (
                       <a href={t.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 hover:underline">
                          <Video size={14} /> Veure Vídeo Youtube <ExternalLink size={10} />
                       </a>
                     )}
                     {t.fotoExemple && (
                       <div className="mt-2">
                          <span className="text-[9px] font-black uppercase text-slate-400 block mb-2 underline decoration-purple-500/20">Imatge d'Exemple</span>
                          <img src={t.fotoExemple} alt={t.titol} className="w-full h-32 object-contain rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800" />
                       </div>
                     )}
                  </div>
               </motion.div>
             ))}
          </div>
      </div>
    </div>
  );
}

/**
 * VISTA: Banc de Preguntes de Psicotècnics
 */
function PsicotecnicsPreguntesView({ preguntes, tipus, novaPregunta, setNovaPregunta, onSubmit, onDelete, onLoadMock, loading, success, darkMode }: any) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterTipus, setFilterTipus] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

  const preguntesFiltrades = preguntes.filter((p: any) => {
    const tipusObj = tipus.find((t: any) => t.id === p.tipusId);
    const matchesTipus = filterTipus === "" || p.tipusId === filterTipus;
    const matchesQuery = filterQuery === "" || (tipusObj?.titol.toLowerCase().includes(filterQuery.toLowerCase()));
    return matchesTipus && matchesQuery;
  });

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
           <BackButton darkMode={darkMode} />
           <div>
              <span className="text-purple-600 font-bold uppercase tracking-[0.2em] text-[10px]">Psicotècnics / Banc</span>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tighter mt-1 uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Banc de <span className="text-purple-600">Preguntes Psicotècniques</span>
              </h1>
           </div>
        </div>

        <div className="flex items-center gap-6">
           {/* BOTO TEST MOCK */}
           <div className={`p-4 rounded-2xl border flex items-center gap-8 ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex flex-col">
                 <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Estat servidors</span>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] font-bold text-emerald-500">Connexió a la BBDD activa</span>
                 </div>
              </div>
              <button 
                onClick={onLoadMock}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                Test ( Mock Data )
              </button>
           </div>

           <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${darkMode ? 'bg-purple-950/20 border-purple-900' : 'bg-purple-50 border-purple-100'}`}>
              <span className="text-[10px] font-black uppercase text-purple-600">Publicades</span>
              <span className={`text-xl font-black ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>{preguntes.length}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUMNA ESQUERRA: ACCIONS I FORMULARI */}
          <div className="lg:col-span-3 flex flex-col gap-6 sticky top-0">
             {!isFormOpen ? (
               <button 
                 onClick={() => setIsFormOpen(true)}
                 className={`group p-8 rounded-[2.5rem] border flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 ${
                   darkMode ? 'bg-slate-800 border-white/5 hover:border-purple-500 hover:bg-purple-600/10' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50 hover:border-purple-200'
                 }`}
               >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                       <Plus size={24} strokeWidth={3} />
                    </div>
                    <span className={`text-sm font-black uppercase tracking-tight italic ${darkMode ? 'text-white' : 'text-slate-700'}`}>Afegir Exercici</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
               </button>
             ) : (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className={`rounded-[2.5rem] border shadow-2xl overflow-hidden ${
                   darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
                 }`}
               >
                  <div className="p-6 bg-purple-600 text-white flex items-center justify-between">
                     <h3 className="text-sm font-black uppercase italic tracking-tighter">Nou Exercici</h3>
                     <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={18} />
                     </button>
                  </div>
                  
                  <form onSubmit={(e) => { onSubmit(e); setIsFormOpen(false); }} className="p-8 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tipologia</label>
                        <select 
                          required
                          value={novaPregunta.tipusId}
                          onChange={e => setNovaPregunta({...novaPregunta, tipusId: e.target.value})}
                          className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-xs appearance-none cursor-pointer ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                        >
                          <option value="">Selecciona tipus...</option>
                          {tipus.map((t: any) => <option key={t.id} value={t.id}>{t.titol}</option>)}
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL Imatge</label>
                        <input 
                          required
                          value={novaPregunta.fotoPregunta}
                          onChange={e => setNovaPregunta({...novaPregunta, fotoPregunta: e.target.value})}
                          className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-xs ${darkMode ? 'bg-slate-900 focus:ring-2 focus:ring-purple-500' : 'bg-slate-50 focus:ring-2 focus:ring-purple-500'}`}
                          placeholder="https://..."
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        {novaPregunta.opcions.map((op: string, idx: number) => (
                           <input 
                             key={idx}
                             required
                             value={op}
                             onChange={e => {
                               const newOps = [...novaPregunta.opcions];
                               newOps[idx] = e.target.value;
                               setNovaPregunta({...novaPregunta, opcions: newOps});
                             }}
                             className={`w-full p-3 rounded-xl border text-[10px] font-bold outline-none ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}
                             placeholder={`Opció ${String.fromCharCode(65+idx)}`}
                           />
                        ))}
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Correcta</label>
                        <div className="grid grid-cols-4 gap-2">
                           {[0,1,2,3].map(idx => (
                             <button
                               key={idx}
                               type="button"
                               onClick={() => setNovaPregunta({...novaPregunta, correcta: idx})}
                               className={`py-2 rounded-xl border font-black text-xs transition-all ${
                                 novaPregunta.correcta === idx 
                                  ? 'bg-purple-600 border-purple-600 text-white' 
                                  : (darkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-100 text-slate-400')
                               }`}
                             >
                               {String.fromCharCode(65+idx)}
                             </button>
                           ))}
                        </div>
                     </div>

                     <button 
                       disabled={loading}
                       type="submit"
                       className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-purple-600/30 transition-all active:scale-95"
                     >
                       {loading ? "Processant..." : "Guardar Exercici"}
                     </button>
                  </form>
               </motion.div>
             )}

             <div className={`p-6 rounded-[2.5rem] border text-center ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                <p className="text-[9px] font-medium text-slate-400 italic">
                  Recorda que la constància en els psicotècnics és la clau per baixar el temps de resposta en el dia de l'examen oficial.
                </p>
             </div>
          </div>

          {/* COLUMNA DRETA: FILTRES I LLISTAT */}
          <div className="lg:col-span-9 space-y-8">
             {/* FILTRES STYLE NEWS */}
             <div className={`p-10 rounded-[2.5rem] border transition-colors ${darkMode ? 'bg-slate-800/40 border-white/5' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/40'}`}>
                <div className="flex items-center gap-3 mb-8">
                   <Filter size={16} className="text-purple-500" />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Filtres del Banc Psicotècnic</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Cerca per títol</span>
                      <div className={`w-full p-4 rounded-2xl flex items-center gap-4 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                         <Search size={16} className="text-slate-500" />
                         <input 
                           className="bg-transparent border-none outline-none text-xs font-bold w-full" 
                           placeholder="Nom de la tipologia..." 
                           value={filterQuery}
                           onChange={e => setFilterQuery(e.target.value)}
                         />
                      </div>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Tipologia</span>
                      <div className={`relative w-full p-4 rounded-2xl flex items-center gap-4 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        <LayoutDashboard size={16} className="text-slate-500" />
                        <select 
                          value={filterTipus}
                          onChange={e => setFilterTipus(e.target.value)}
                          className={`bg-transparent border-none outline-none text-xs font-bold w-full appearance-none cursor-pointer ${darkMode ? 'text-purple-400' : 'text-slate-600'}`}
                        >
                           <option value="">Totes</option>
                           {tipus.map((t: any) => <option key={t.id} value={t.id}>{t.titol}</option>)}
                        </select>
                      </div>
                   </div>
                </div>
             </div>

             {/* LLISTAT */}
             <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                   <h3 className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400">Portal de Psicotècnics (Recent)</h3>
                   {preguntesFiltrades.length > 0 && (
                     <div className="text-[9px] font-bold text-slate-400 uppercase italic">Mostrant {preguntesFiltrades.length} exercicis</div>
                   )}
                </div>

                {preguntesFiltrades.length === 0 ? (
                  <div className={`rounded-[3rem] p-32 flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed ${darkMode ? 'border-white/5' : 'border-slate-100'}`}>
                     <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <Brain size={48} className="text-slate-400" />
                     </div>
                     <p className="font-black uppercase tracking-[0.2em] text-sm italic">No hi ha exercicis que coincideixin</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {preguntesFiltrades.map((p: any, idx: number) => {
                      const tipusObj = tipus.find((t: any) => t.id === p.tipusId);
                      return (
                        <motion.div 
                          key={p.id || idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`group rounded-[2.5rem] border p-6 flex flex-col gap-5 transition-all hover:shadow-2xl ${
                            darkMode ? 'bg-slate-800 border-white/5 hover:border-purple-500' : 'bg-white border-slate-100 hover:border-purple-500 shadow-sm shadow-slate-200/30'
                          }`}
                        >
                           <header className="flex justify-between items-start">
                              <div className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase text-purple-600 tracking-widest leading-none mb-1">{tipusObj?.titol || "PSICOTÈCNIC"}</span>
                                 <span className="text-[8px] text-slate-400 uppercase font-bold italic tracking-tighter">{p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : "RECENT"}</span>
                              </div>
                              <button 
                                onClick={() => onDelete(`psicotecnics_preguntes/${p.id}`, p.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </header>

                           <div className={`group-hover:scale-[1.02] transition-transform duration-500 h-48 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/5 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                              <img src={p.fotoPregunta} alt="Exercici" className="w-full h-full object-contain p-4" />
                           </div>

                           <div className="grid grid-cols-4 gap-2">
                              {p.opcions?.map((op: string, i: number) => (
                                 <div key={i} className={`py-2 rounded-xl text-xs font-black text-center border shadow-sm ${p.correcta === i ? 'bg-emerald-500 border-emerald-500 text-white' : (darkMode ? 'bg-slate-900 border-white/5 text-slate-400' : 'bg-white border-slate-100 text-slate-400')}`}>
                                    {String.fromCharCode(65+i)}
                                 </div>
                              ))}
                           </div>

                           {p.explicacio && (
                             <div className={`mt-auto p-4 rounded-2xl border-l-4 border-purple-500 transition-colors ${darkMode ? 'bg-purple-950/20' : 'bg-purple-50'}`}>
                                <span className="text-[8px] font-black uppercase text-purple-600 block mb-1">Guia de resolució</span>
                                <p className="text-[11px] font-medium text-slate-500 italic line-clamp-3 leading-relaxed">{p.explicacio}</p>
                             </div>
                           )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
}

/**
 * VIEW: Gimnasos
 */
function GimnasosView({ gimnasos, onDelete, onAdd, darkMode }: any) {
  const [nouGimnas, setNouGimnas] = useState({ nom: "", poblacio: "", direccio: "", telefon: "", estat: "activa" });

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex items-center gap-10">
        <BackButton darkMode={darkMode} />
        <div>
          <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">Gym management</span>
          <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gestió de <span className="text-blue-600">Gimnasos</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className={`p-8 rounded-[2.5rem] border shadow-xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className="text-xl font-black mb-6 uppercase italic">Nou Gimnàs</h3>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAdd(nouGimnas); setNouGimnas({ nom: "", poblacio: "", direccio: "", telefon: "", estat: "activa" }); }}>
            <input placeholder="Nom del Gimnàs" required value={nouGimnas.nom} onChange={e => setNouGimnas({...nouGimnas, nom: e.target.value})} className={`w-full p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`} />
            <input placeholder="Població" required value={nouGimnas.poblacio} onChange={e => setNouGimnas({...nouGimnas, poblacio: e.target.value})} className={`w-full p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`} />
            <input placeholder="Direcció" value={nouGimnas.direccio} onChange={e => setNouGimnas({...nouGimnas, direccio: e.target.value})} className={`w-full p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`} />
            <input placeholder="Telèfon" value={nouGimnas.telefon} onChange={e => setNouGimnas({...nouGimnas, telefon: e.target.value})} className={`w-full p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`} />
            <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-600/20">Registrar Gimnàs</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {gimnasos.map((g: any) => (
            <div key={g.id} className={`p-6 rounded-[2rem] border flex items-center justify-between group transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <Dumbbell size={24} />
                </div>
                <div>
                  <h4 className="font-bold">{g.nom}</h4>
                  <p className="text-xs text-slate-400 font-medium">{g.poblacio} • {g.telefon}</p>
                </div>
              </div>
              <button onClick={() => onDelete(`gimnasos/${g.id}`)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {gimnasos.length === 0 && <p className="text-center p-10 text-slate-400 uppercase font-black text-xs tracking-widest">No hi ha gimnasos registrats</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * VIEW: Psicologia / Reserves
 */
function PsicologiaView({ reserves, onUpdateStatus, onSeedData, loading, darkMode }: any) {
  const [userInfoModal, setUserInfoModal] = useState<any>(null);
  const [biodataModal, setBiodataModal] = useState<any>(null);

  // Funció per determinar el torn
  const getTorn = (dateStr: string) => {
    const date = new Date(dateStr);
    const hour = date.getHours();
    return hour < 14 ? "Matí" : "Tarda";
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <BackButton darkMode={darkMode} />
          <div>
            <span className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px]">Psychology & bookings</span>
            <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gestió de <span className="text-emerald-600">Reserves</span></h1>
          </div>
        </div>
        <button 
          onClick={onSeedData}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
          Generar Reserva de Prova
        </button>
      </header>

      {/* MODAL: INFO USUARI */}
      <AnimatePresence>
        {userInfoModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setUserInfoModal(null)} />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`relative w-full max-w-md rounded-[2.5rem] border p-8 shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Fitxa de l'Usuari</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informació Personal</p>
                  </div>
                </div>
                <button onClick={() => setUserInfoModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nom Real</span>
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{userInfoModal.usuariNom}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Edat</span>
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{userInfoModal.edat || "24"} anys</span>
                  </div>
                </div>
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Correu Electrònic</span>
                  <span className="text-sm font-bold text-blue-500">{userInfoModal.usuariEmail}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Telèfon de Contacte</span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{userInfoModal.telefon || "634 12 88 45"}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Motiu de la Cita</span>
                  <p className={`text-xs italic leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {userInfoModal.notes || "Preparació per a l'entrevista oficial de Mossos d'Esquadra."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RESUM BIODATA */}
      <AnimatePresence>
        {biodataModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setBiodataModal(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-4xl rounded-[2.5rem] border p-10 shadow-2xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Informe de Competències Mossos</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultats basats en Biodata AI - Alumne: {biodataModal.usuariNom}</p>
                  </div>
                </div>
                <button onClick={() => setBiodataModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500 mb-4">Competències Clau</h4>
                   {Object.entries(biodataModal.competencies || {}).map(([name, val]: any) => (
                      <div key={name} className="space-y-1">
                         <div className="flex justify-between items-end">
                            <span className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{name}</span>
                            <span className="text-xs font-black text-violet-500">{val}/10</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(val as number) * 10}%` }}
                               transition={{ duration: 1, ease: "easeOut" }}
                               className="h-full bg-violet-500 rounded-full"
                            />
                         </div>
                      </div>
                   ))}
                </div>

                <div className="flex flex-col gap-6">
                   <div className={`p-8 rounded-2xl border flex-1 leading-relaxed text-sm ${darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                      <div className="flex items-center gap-2 mb-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest underline decoration-emerald-500/40">Conclusions del Sistema</span>
                      </div>
                      <p className="italic">
                        {biodataModal.biodataInforme || "Perfil equilibrat amb bones perspectives per l'entrevista."}
                      </p>
                   </div>
                   <button className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-600/20 active:scale-95 text-center">
                      Descarregar Informe Complet (PDF)
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={`rounded-[2.5rem] border overflow-hidden transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <table className="w-full text-left">
          <thead>
            <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
              <th className="p-6">Usuari</th>
              <th className="p-6">Visita (Torn/Hora)</th>
              <th className="p-6">Psicòleg</th>
              <th className="p-6">Estat</th>
              <th className="p-6">Biodata</th>
              <th className="p-6 text-right">Accions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {reserves.map((r: any) => (
              <tr key={r.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-bold">{r.usuariNom}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{r.usuariEmail}</span>
                    </div>
                    <button 
                      onClick={() => setUserInfoModal(r)}
                      className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                      title="Informació Usuari"
                    >
                      <Info size={12} />
                    </button>
                  </div>
                </td>
                <td className="p-6">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase">{new Date(r.dataSessio).toLocaleDateString('ca-ES', { day: '2-digit', month: 'long' })}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${getTorn(r.dataSessio) === 'Matí' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                           {getTorn(r.dataSessio)}
                        </span>
                        <Clock size={10} className="text-slate-400 ml-1" />
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(r.dataSessio).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}h</span>
                      </div>
                   </div>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                         <User size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{r.psicoleg || "Aleix Romero Pociello"}</span>
                   </div>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                        r.estat === 'confirmada' ? 'bg-emerald-500' : 
                        r.estat === 'cancel·lada' ? 'bg-red-500' :
                        r.estat === 'cancel·lada_usuari' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${
                        r.estat === 'confirmada' ? 'text-emerald-500' : 
                        r.estat === 'cancel·lada' ? 'text-red-500' :
                        r.estat === 'cancel·lada_usuari' ? 'text-amber-500' : 'text-blue-500'
                    }`}>
                        {r.estat === 'confirmada' ? 'Acceptat' : 
                         r.estat === 'cancel·lada' ? 'Cancel·lat (Admin)' :
                         r.estat === 'cancel·lada_usuari' ? 'Cancel·lat (Usuari)' : 'Pendent'}
                    </span>
                   </div>
                </td>
                <td className="p-6">
                   <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${r.biodataFet ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {r.biodataFet ? 'FET' : 'NO FET'}
                      </span>
                      {r.biodataFet && (
                         <button 
                           onClick={() => setBiodataModal(r)}
                           className="text-violet-500 hover:text-violet-600 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                          >
                           <Eye size={12} /> Informe
                         </button>
                      )}
                   </div>
                </td>
                <td className="p-6 text-right space-x-1">
                  <button onClick={() => onUpdateStatus(r.id, 'confirmada')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Acceptar"><UserCheck size={18} /></button>
                  <button onClick={() => onUpdateStatus(r.id, 'cancel·lada')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel·lar"><UserX size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reserves.length === 0 && (
          <div className="p-32 text-center flex flex-col items-center gap-6">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">No hi ha reserves pendents</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VIEW: Subscripcions i Pagaments
 */
function SubscripcionsView({ subscripcions, onUpdateStatus, darkMode }: any) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex items-center gap-10">
        <BackButton darkMode={darkMode} />
        <div>
          <span className="text-amber-600 font-bold uppercase tracking-[0.2em] text-[10px]">Subscriptions & finance</span>
          <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Control de <span className="text-amber-600">Pagaments</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscripcions.map((s: any) => (
          <div key={s.id} className={`p-8 rounded-[2.5rem] border relative overflow-hidden transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`absolute top-0 left-0 w-full h-1 ${s.pendentDePagament ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <CreditCard size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                s.pla === 'premium' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
              }`}>{s.pla}</span>
            </div>
            <h4 className={`font-black text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>{s.usuariEmail}</h4>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 uppercase font-bold tracking-widest">Estat Pagament:</span>
                <span className={s.pendentDePagament ? 'text-red-500 font-black uppercase' : 'text-emerald-500 font-black uppercase'}>
                  {s.pendentDePagament ? 'Pendent' : 'Al Corrent'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => onUpdateStatus(s.id, { pendentDePagament: !s.pendentDePagament })}
              className={`mt-8 w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                s.pendentDePagament ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {s.pendentDePagament ? 'Marcar com Pagat' : 'Generar Pendent'}
            </button>
          </div>
        ))}
      </div>
      {subscripcions.length === 0 && <p className="p-20 text-center text-slate-400 uppercase font-black text-xs tracking-widest">No hi ha dades de subscripció</p>}
    </div>
  );
}
