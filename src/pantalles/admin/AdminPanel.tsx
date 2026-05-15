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
  Calendar,
  X
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
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("adminDarkMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("adminDarkMode", darkMode.toString());
  }, [darkMode]);

  // Estats per a Preguntes i Actualitat
  const [preguntes, setPreguntes] = useState<any[]>([]);
  const [actualitats, setActualitats] = useState<any[]>([]);
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
    categoria: "General",
    url: ""
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
      const [snapNew, snapOld, snapAct, snapGim, snapRes, snapSub] = await Promise.all([
        getDocs(query(collectionGroup(db, "preguntes_codificades"))),
        getDocs(query(collection(db, "examens/mossos/preguntes"))),
        getDocs(query(collection(db, "actualitat"))),
        getDocs(query(collection(db, "gimnasos"))),
        getDocs(query(collection(db, "reserves_psicologia"))),
        getDocs(query(collection(db, "subscripcions")))
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

      // Processar gimnasos
      setGimnasos(snapGim.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Processar reserves
      setReserves(snapRes.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Processar subscripcions
      setSubscripcions(snapSub.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (err: any) {
      console.error("Error detallat de càrrega:", err);
      // Si l'error diu que falta un índex, Firebase sol donar un link. El posarem a la consola.
      setFetchError(err.message || "Error al connectar amb Firestore.");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
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
    try {
      const path = getPreguntaPath(novaPregunta.ambit, novaPregunta.tema, novaPregunta.capitol);
      
      // Assegurar que els documents pare existeixen (perquè siguin visibles a la consola de Firebase)
      // Creem el camí pas a pas si cal (opcional però recomanat per visibilitat)
      const baseRef = doc(db, "temari", "mossos");
      await setDoc(baseRef, { nom: "Temari Mossos", actiu: true }, { merge: true });
      
      const ambitRef = doc(db, `temari/mossos/blocs/${novaPregunta.ambit}`);
      await setDoc(ambitRef, { ambit: novaPregunta.ambit }, { merge: true });

      if (editingId) {
        // Mode Edició: Busquem la pregunta per la seva ruta original (fullPath)
        const preguntaAEditar = preguntes.find(p => p.id === editingId);
        if (preguntaAEditar?.fullPath) {
          await updateDoc(doc(db, preguntaAEditar.fullPath), {
            ...novaPregunta,
            updatedAt: serverTimestamp()
          });
        }
        setEditingId(null);
      } else {
        // Mode Creació: Guardem a la "taula" específica del capítol
        await addDoc(collection(db, path), {
          ...novaPregunta,
          createdAt: serverTimestamp()
        });
      }
      setSuccess(true);
      setNovaPregunta({ 
        pregunta: "", 
        opcions: ["", "", "", ""], 
        correcta: 0, 
        ambit: "A", 
        tema: 0, 
        capitol: 0, 
        explicacio: "",
        status: "activa"
      });
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error gestionant pregunta:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'activa' ? 'suspesa' : 'activa';
      const pregunta = preguntes.find(p => p.id === id);
      if (pregunta?.fullPath) {
        await updateDoc(doc(db, pregunta.fullPath), {
          status: newStatus
        });
        fetchData();
      }
    } catch (err) {
      console.error("Error canviant estat:", err);
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
      setNovaActualitat({ titol: "", descripcio: "", data: new Date().toISOString().split('T')[0], categoria: "General", url: "" });
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
       console.error("Error afegint actualitat:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fullPath: string) => {
    try {
      await deleteDoc(doc(db, fullPath));
      fetchData();
    } catch (err) {
      console.error("Error eliminant:", err);
    }
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
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem 
            to="/admin" 
            active={activeTab === 'admin'} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard General" 
          />
          <SidebarItem 
            to="/admin/preguntes" 
            active={activeTab === 'preguntes'} 
            icon={<BookOpen size={20} />} 
            label="Banc de Preguntes" 
          />
          <SidebarItem 
            to="/admin/actualitat" 
            active={activeTab === 'actualitat'} 
            icon={<Newspaper size={20} />} 
            label="Portal d'Actualitat" 
          />
          <SidebarItem 
            to="/admin/gimnasos" 
            active={activeTab === 'gimnasos'} 
            icon={<Dumbbell size={20} />} 
            label="Gestió de Gimnasos" 
          />
          <SidebarItem 
            to="/admin/psicologia" 
            active={activeTab === 'psicologia'} 
            icon={<Calendar size={20} />} 
            label="Psicologia / Reserves" 
          />
          <SidebarItem 
            to="/admin/pagaments" 
            active={activeTab === 'pagaments'} 
            icon={<CreditCard size={20} />} 
            label="Subscripcions i Pagaments" 
          />
          <SidebarItem 
            to="/admin/usuaris" 
            active={activeTab === 'usuaris'} 
            icon={<Users size={20} />} 
            label="Gestió d'Usuaris" 
            badge="Pròximament"
          />
          <SidebarItem 
            to="/admin/estadistiques" 
            active={activeTab === 'estadistiques'} 
            icon={<BarChart3 size={20} />} 
            label="Anàlisi i Dades" 
            badge="Alpha"
          />
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
        
        {/* TOP BAR / HEADER */}
        <header className={`h-20 border-b flex items-center justify-between px-10 shrink-0 transition-colors duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
           <div className={`flex items-center gap-4 px-4 py-2 rounded-xl w-96 transition-colors ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <Search className={darkMode ? 'text-slate-400' : 'text-slate-400'} size={18} />
              <input 
                type="text" 
                placeholder="Cerca global..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="flex items-center gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg border transition-all ${darkMode ? 'bg-slate-700 border-slate-600 text-yellow-400 hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                title={darkMode ? "Pasar a mode clar" : "Pasar a mode fosc"}
              >
                 {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="flex gap-2 mr-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className={`text-[10px] font-black uppercase ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Sistema Online</span>
              </div>
              <button className={`p-2 border rounded-lg hover:bg-slate-50 transition-all ${darkMode ? 'text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white' : 'text-slate-400 border-slate-200 hover:text-slate-900 hover:bg-slate-50'}`}>
                 <Filter size={18} />
              </button>
           </div>
        </header>

        {/* CONTENT AREA */}
        <div className={`flex-1 overflow-y-auto p-10 transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-[#f8fafc]'}`}>
          <Routes>
            <Route path="/" element={<DashboardView preguntes={preguntes} actualitats={actualitats} darkMode={darkMode} />} />
            <Route path="preguntes" element={
              <PreguntesView 
                preguntes={preguntes} 
                novaPregunta={novaPregunta} 
                setNovaPregunta={setNovaPregunta} 
                onSubmit={handleAddQuestion}
                onDelete={handleDelete}
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
              />
            } />
            <Route path="actualitat" element={
              <ActualitatView 
                actualitats={actualitats} 
                novaActualitat={novaActualitat} 
                setNovaActualitat={setNovaActualitat} 
                onSubmit={handleAddActualitat}
                onDelete={handleDelete}
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
        </div>
      </main>
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
 * VIEW: Dashboard
 */
function DashboardView({ preguntes, actualitats, darkMode }: { preguntes: any[], actualitats: any[], darkMode: boolean }) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header>
        <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice Overview</span>
        <h1 className={`text-4xl font-black tracking-tight mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Taulell de <span className="text-blue-600">Control</span></h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard title="Total Preguntes" val={preguntes.length} color="blue" icon={<BookOpen />} trend="+12% vs últim mes" darkMode={darkMode} />
        <StatCard title="Actualitat Mossos" val={actualitats.length} color="emerald" icon={<Newspaper />} trend="5 pendents de revisió" darkMode={darkMode} />
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
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               Últimes Notícies Publicades
            </h3>
            <div className="space-y-4">
               {actualitats.slice(0, 4).map(n => (
                 <div key={n.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent ${darkMode ? 'hover:bg-slate-900 hover:border-slate-700' : 'hover:bg-slate-50 hover:border-slate-100'}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-emerald-950/30' : 'bg-emerald-50'}`}>
                       <Newspaper className="text-emerald-500" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className={`text-sm font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{n.titol}</p>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{n.data}</span>
                    </div>
                 </div>
               ))}
               <Link to="/admin/actualitat" className={`block text-center text-xs font-black uppercase tracking-widest pt-4 transition-colors ${darkMode ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-400 hover:text-emerald-600'}`}>Gestionar actualitat</Link>
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
function PreguntesView({ preguntes, novaPregunta, setNovaPregunta, onSubmit, onDelete, onToggleStatus, onEdit, editingId, cancelEdit, loading, error, success, darkMode, setConfirmModal, onRetry }: any) {
  
  // Obtenir dades del temari segons selecció
  const temesAmbit = TEMARI_DETALL[novaPregunta.ambit as 'A' | 'B' | 'C'] || [];
  const TemaSeleccionat = temesAmbit[novaPregunta.tema] || { titol: "", subtemes: [] };
  const capitolsTema = TemaSeleccionat.subtemes || [];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex items-end justify-between">
        <div>
           <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">Data Management</span>
           <h1 className={`text-4xl font-black tracking-tight mt-1 uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>{editingId ? 'Editant' : 'Banc de'} <span className="text-blue-600">Preguntes</span></h1>
        </div>
        <div className="flex gap-4 mb-1">
           <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${darkMode ? 'bg-blue-950/20 border-blue-900' : 'bg-blue-50 border-blue-100'}`}>
              <span className="text-[10px] font-black uppercase text-blue-600">Total</span>
              <span className={`text-sm font-black ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{preguntes.length}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
         {/* FORMULARI */}
         <div className="lg:col-span-1 sticky top-6">
            <div className={`p-8 rounded-[2.5rem] border shadow-xl overflow-hidden relative transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
               <div className={`absolute top-0 left-0 w-full h-1.5 ${editingId ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
               <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-xl font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>{editingId ? 'Modificar' : 'Nova Entrada'}</h3>
                  <div className="flex gap-2 items-center">
                    <a 
                      href={`https://console.firebase.google.com/project/gen-lang-client-0728216405/firestore/databases/ai-studio-4316edef-f851-4517-ace5-a1e671262e58/data`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-black uppercase text-blue-500 hover:underline bg-blue-500/10 px-2 py-1 rounded"
                      title="Obrir consola de base de dades"
                    >
                      BBDD ↗
                    </a>
                    {editingId && (
                      <button onClick={cancelEdit} className="text-[10px] font-black uppercase text-red-500 hover:underline">Cancel·lar</button>
                    )}
                  </div>
               </div>

               <form onSubmit={onSubmit} className="space-y-5">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enunciat de la pregunta</label>
                     <textarea 
                       required
                       value={novaPregunta.pregunta}
                       onChange={e => setNovaPregunta({...novaPregunta, pregunta: e.target.value})}
                       className={`w-full p-4 rounded-xl border-2 outline-none text-sm font-bold min-h-[100px] transition-all ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-blue-500 text-white' : 'bg-white border-slate-100 focus:border-blue-500 text-slate-900'}`}
                       placeholder="Segons la llei..."
                     />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opcions</label>
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
                         className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none transition-colors ${darkMode ? 'bg-slate-900 border-slate-700 focus:bg-blue-900/20 text-white' : 'bg-white border-slate-100 focus:bg-blue-50/50 text-slate-900'}`}
                         placeholder={`Opció ${String.fromCharCode(65+idx)}`}
                       />
                     ))}
                  </div>

                  <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Correcta</label>
                      <select 
                        value={novaPregunta.correcta}
                        onChange={e => setNovaPregunta({...novaPregunta, correcta: parseInt(e.target.value)})}
                        className={`w-full p-3 border-none rounded-xl text-xs font-bold outline-none transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}
                      >
                        {novaPregunta.opcions.map((_: any, i: number) => <option key={i} value={i}>Opció {String.fromCharCode(65+i)}</option>)}
                      </select>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">1- Àmbit</label>
                        <select 
                          value={novaPregunta.ambit}
                          onChange={e => setNovaPregunta({...novaPregunta, ambit: e.target.value, tema: 0, capitol: 0})}
                          className={`w-full p-3 border-none rounded-xl text-xs font-bold outline-none transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}
                        >
                          <option value="A">1- Bloc A (Coneixements Entorn)</option>
                          <option value="B">2- Bloc B (Institucional)</option>
                          <option value="C">3- Bloc C (Seguretat / Policia)</option>
                        </select>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">2- Tema</label>
                        <select 
                          value={novaPregunta.tema}
                          onChange={e => setNovaPregunta({...novaPregunta, tema: parseInt(e.target.value), capitol: 0})}
                          className={`w-full p-3 border-none rounded-xl text-xs font-bold outline-none transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}
                        >
                          {temesAmbit.map((t: any, idx: number) => (
                            <option key={idx} value={idx}>{idx + 1}- {t.titol}</option>
                          ))}
                        </select>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">3- Capítol</label>
                        <select 
                          value={novaPregunta.capitol}
                          onChange={e => setNovaPregunta({...novaPregunta, capitol: parseInt(e.target.value)})}
                          className={`w-full p-3 border-none rounded-xl text-xs font-bold outline-none transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}
                        >
                          {capitolsTema.map((cap: string, idx: number) => (
                            <option key={idx} value={idx}>{idx + 1}- {cap.length > 50 ? cap.substring(0, 50) + '...' : cap}</option>
                          ))}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Explicació Post-Resolució</label>
                     <textarea 
                       value={novaPregunta.explicacio}
                       onChange={e => setNovaPregunta({...novaPregunta, explicacio: e.target.value})}
                       className={`w-full p-4 rounded-xl border outline-none text-xs min-h-[80px] transition-all ${darkMode ? 'bg-slate-900 border-slate-700 focus:border-blue-400 text-slate-300' : 'bg-white border-slate-100 focus:border-blue-300 text-slate-600'}`}
                       placeholder="Feedback per a l'usuari..."
                     />
                  </div>

                  <button 
                    disabled={loading}
                    type="submit"
                    className={`w-full py-4 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm hover:translate-y-[-2px] hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${editingId ? 'bg-amber-500 shadow-amber-500/30' : 'bg-blue-600 shadow-blue-600/30'}`}
                  >
                    {loading ? "Processant..." : <>{editingId ? <Check size={18} /> : <Save size={18} />} {editingId ? 'Guardar Canvis' : 'Guardar Pregunta'}</>}
                  </button>
                  <AnimatePresence>
                    {success && (
                      <motion.div initial={{opacity:0, y: 10}} animate={{opacity:1, y: 0}} exit={{opacity:0}} className="text-center text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                         Acció completada amb èxit!
                      </motion.div>
                    )}
                  </AnimatePresence>
               </form>
            </div>
         </div>

         {/* TAULA LLISTA */}
         <div className="lg:col-span-2">
            <div className={`rounded-[2.5rem] border shadow-sm overflow-hidden transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className={`border-b transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50/50 border-slate-200'}`}>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contingut / Enunciat</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Ubicació</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Accions</th>
                     </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                     {loading && preguntes.length === 0 ? (
                        <tr>
                           <td colSpan={3} className="p-20 text-center">
                              <div className="flex flex-col items-center gap-4">
                                 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregant dades del banc...</span>
                              </div>
                           </td>
                        </tr>
                     ) : error ? (
                        <tr>
                           <td colSpan={3} className="p-10 text-center">
                              <div className="flex flex-col items-center gap-4 bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-lg mx-auto">
                                 <X className="text-red-500" size={32} />
                                 <h4 className="text-red-500 font-black uppercase text-xs tracking-widest">Error de Càrrega</h4>
                                 <p className="text-[10px] text-red-500/70 font-bold leading-relaxed">{error}</p>
                                 {error.includes("index") && (
                                   <div className="text-[9px] text-red-400 font-medium bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                                      Firebase necessita crear un índex per fer aquesta consulta. Si et surt un link blau al missatge anterior, fes-hi clic per activar-lo.
                                   </div>
                                 )}
                                 <button 
                                   onClick={onRetry}
                                   className="mt-2 px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all active:scale-95 flex items-center gap-2"
                                 >
                                    <RefreshCw size={14} /> Reintentar
                                 </button>
                                 <p className="text-[8px] text-red-400/50 uppercase font-black mt-2">PROJECTE: ai-studio-4316edef-f851-4517-ace5-a1e671262e58</p>
                              </div>
                           </td>
                        </tr>
                     ) : preguntes.length === 0 ? (
                        <tr>
                           <td colSpan={3} className="p-20 text-center">
                              <div className="flex flex-col items-center gap-4 opacity-40">
                                 <BookOpen size={40} className="text-slate-400" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No hi ha preguntes registrades</span>
                              </div>
                           </td>
                        </tr>
                     ) : (
                       preguntes.map(p => (
                        <tr key={p.id} className={`transition-colors group ${darkMode ? 'hover:bg-slate-900/30' : 'hover:bg-slate-50/30'} ${p.status === 'suspesa' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                           <td className="p-6">
                              <div className="flex items-center gap-2 mb-1">
                                 {p.status === 'suspesa' ? (
                                   <span className="text-[8px] px-1.5 py-0.5 bg-slate-500 text-white rounded font-black uppercase">En Suspensió</span>
                                 ) : (
                                   <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500 text-white rounded font-black uppercase">Activa</span>
                                 )}
                              </div>
                              <p className={`font-bold text-sm leading-relaxed mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{p.pregunta}</p>
                              <span className="text-[10px] text-slate-400 font-medium italic line-clamp-1">{p.explicacio}</span>
                           </td>
                           <td className="p-6 text-center">
                              <div className="flex flex-col items-center gap-1">
                                 <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${darkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>{p.ambit === 'A' ? '1' : p.ambit === 'B' ? '2' : '3'}.{p.tema + 1}.{p.capitol + 1}</span>
                              </div>
                           </td>
                           <td className="p-6">
                              <div className="flex items-center justify-end gap-1">
                                 {/* ACTIVAR / SUSPENDRE */}
                                 <button 
                                   onClick={() => setConfirmModal({
                                     isOpen: true,
                                     title: p.status === 'suspesa' ? "Activar Pregunta" : "Suspendre Pregunta",
                                     message: p.status === 'suspesa' 
                                       ? "Aquesta pregunta tornarà a aparèixer als exàmens dels alumnes." 
                                       : "La pregunta quedarà guardada però no sortirà als tests fins que la tornis a activar.",
                                     onConfirm: () => onToggleStatus(p.id, p.status || 'activa')
                                   })}
                                   className={`p-2 rounded-lg transition-all ${p.status === 'suspesa' ? 'text-blue-500 hover:bg-blue-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                                   title={p.status === 'suspesa' ? "Activar" : "Suspendre"}
                                 >
                                    {p.status === 'suspesa' ? <Eye size={18} /> : <EyeOff size={18} />}
                                 </button>
                                 
                                 {/* MODIFICAR */}
                                 <button 
                                   onClick={() => setConfirmModal({
                                     isOpen: true,
                                     title: "Modificar Pregunta",
                                     message: "Estàs segur que vols editar el contingut d'aquesta pregunta?",
                                     onConfirm: () => onEdit(p)
                                   })}
                                   className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                   title="Modificar"
                                 >
                                    <Edit3 size={18} />
                                 </button>

                                 {/* BORRAR */}
                                 <button 
                                   onClick={() => {
                                     // Capturem les dades actuals per al modal
                                     const targetPath = p.fullPath;
                                     const targetId = p.id;
                                     setConfirmModal({
                                       isOpen: true,
                                       title: "Eliminar Definitivament",
                                       message: "Aquesta acció no es pot desfer. La pregunta s'esborrarà completament de la base de dades.",
                                       onConfirm: () => {
                                         if (targetPath) {
                                           onDelete(targetPath);
                                         }
                                       }
                                     });
                                   }}
                                   className={`p-2 rounded-lg transition-all ${darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/20' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
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
  );
}

/**
 * VIEW: Actualitat
 */
function ActualitatView({ actualitats, novaActualitat, setNovaActualitat, onSubmit, onDelete, loading, success, darkMode }: any) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex items-end justify-between">
        <div>
           <span className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px]">News Management</span>
           <h1 className={`text-4xl font-black tracking-tight mt-1 uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>Feed d' <span className="text-emerald-600">Actualitat</span></h1>
        </div>
        <div className="flex gap-4 mb-1">
           <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${darkMode ? 'bg-emerald-950/20 border-emerald-900' : 'bg-emerald-50 border-emerald-100'}`}>
              <span className="text-[10px] font-black uppercase text-emerald-600">Publicades</span>
              <span className={`text-sm font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{actualitats.length}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* FORMULARI */}
          <div className={`p-10 rounded-[2.8rem] border shadow-xl overflow-hidden relative transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
            <h3 className={`text-xl font-black mb-8 uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>Publicar Notícia</h3>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Títol de la notícia</label>
                  <input 
                    required
                    value={novaActualitat.titol}
                    onChange={e => setNovaActualitat({...novaActualitat, titol: e.target.value})}
                    className={`w-full p-4 rounded-xl border-2 outline-none text-sm font-bold transition-all ${darkMode ? 'bg-slate-900 border-slate-800 focus:border-emerald-500 text-white' : 'bg-white border-slate-50 focus:border-emerald-500 text-slate-900'}`}
                    placeholder="Actualització DOGC..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categoria</label>
                  <input 
                    required
                    value={novaActualitat.categoria}
                    onChange={e => setNovaActualitat({...novaActualitat, categoria: e.target.value})}
                    className={`w-full p-4 rounded-xl border-2 outline-none text-sm font-bold transition-all ${darkMode ? 'bg-slate-900 border-slate-800 focus:border-emerald-500 text-white' : 'bg-white border-slate-50 focus:border-emerald-500 text-slate-900'}`}
                    placeholder="Ex: Policial"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cos de la descripció</label>
                <textarea 
                  required
                  value={novaActualitat.descripcio}
                  onChange={e => setNovaActualitat({...novaActualitat, descripcio: e.target.value})}
                  className={`w-full p-4 rounded-xl border-2 outline-none text-sm min-h-[120px] transition-all ${darkMode ? 'bg-slate-900 border-slate-800 focus:border-emerald-500 text-white' : 'bg-white border-slate-50 focus:border-emerald-500 text-slate-900'}`}
                  placeholder="Explica el contingut..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Oficial</label>
                  <input 
                    type="date"
                    value={novaActualitat.data}
                    onChange={e => setNovaActualitat({...novaActualitat, data: e.target.value})}
                    className={`w-full p-4 border-none rounded-xl text-sm font-bold outline-none transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link Extern (Opcional)</label>
                  <input 
                    type="url"
                    value={novaActualitat.url}
                    onChange={e => setNovaActualitat({...novaActualitat, url: e.target.value})}
                    className={`w-full p-4 border-none rounded-xl text-sm font-bold outline-none transition-colors ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-sm hover:translate-y-[-2px] hover:shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3"
              >
                {loading ? "Publicant..." : <><Plus size={18} /> Publicar al Feed</>}
              </button>
            </form>
          </div>

          {/* COLUMNA RECENT CASES */}
          <div className="space-y-6">
            <h3 className="font-black uppercase text-xs tracking-widest text-slate-400">Publicacions existents</h3>
            <div className="flex flex-col gap-4">
               {actualitats.map(n => (
                  <div key={n.id} className={`p-6 rounded-[2rem] border shadow-sm flex items-center justify-between group animate-in fade-in slide-in-from-right-4 duration-500 transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                     <div className="flex items-center gap-5">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0 ${darkMode ? 'bg-emerald-950/20' : 'bg-emerald-50'}`}>
                            <Newspaper size={24} />
                         </div>
                         <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                               <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${darkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>{n.categoria}</span>
                               <span className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">{n.data}</span>
                            </div>
                            <h4 className={`font-bold text-base leading-tight truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{n.titol}</h4>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-medium italic">{n.descripcio}</p>
                         </div>
                     </div>
                     <button 
                       onClick={() => onDelete(`actualitat/${n.id}`)} 
                       className={`p-3 rounded-xl transition-all ml-4 ${darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/20' : 'text-slate-200 hover:text-red-500 hover:bg-red-50'}`}
                     >
                        <Trash2 size={20} />
                     </button>
                  </div>
               ))}
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
      <header>
        <span className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px]">Gym management</span>
        <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gestió de <span className="text-blue-600">Gimnasos</span></h1>
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
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);

  const loadingMessages = [
    "Compilant bio-algoritmes de conducta...",
    "Construint base de dades interna...",
    "Sincronitzant núvols de dades neuronals...",
    "Generant estructura de reserves segures...",
    "Verificant integritat de l'historial...",
    "Encriptant fitxes de seguretat...",
    "Optimitzant rutes de memòria..."
  ];

  useEffect(() => {
    if (isSeeding) {
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 300); // Més ràpid per a generar dades
      return () => clearInterval(interval);
    }
  }, [isSeeding]);

  const handleSeed = async () => {
    setIsSeeding(true);
    // Donem temps a que es vegin els "missatges professionals"
    setTimeout(async () => {
      await onSeedData();
      setIsSeeding(false);
    }, 2000);
  };

  // Funció per determinar el torn
  const getTorn = (dateStr: string) => {
    const date = new Date(dateStr);
    const hour = date.getHours();
    return hour < 14 ? "Matí" : "Tarda";
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <span className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px]">Psychology & bookings</span>
          <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gestió de <span className="text-emerald-600">Reserves</span></h1>
        </div>
        <button 
          onClick={handleSeed}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
          disabled={isSeeding}
        >
          {isSeeding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
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
            {isSeeding ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Database className="text-emerald-500 animate-pulse" size={24} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-emerald-500 font-black uppercase text-xs tracking-[0.3em]">{loadingMessages[loadingMsgIdx]}</span>
                  <span className="text-slate-400 text-[10px] font-bold italic">Sincronitzant amb el Backoffice Central...</span>
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700">
                     <Calendar size={32} />
                  </div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hi ha reserves pendents</span>
                  <button 
                    onClick={handleSeed}
                    className="mt-2 text-emerald-500 hover:text-emerald-400 text-[9px] font-black uppercase tracking-widest underline underline-offset-4"
                  >
                    Generar una reserva de prova ara
                  </button>
               </div>
            )}
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
      <header>
        <span className="text-amber-600 font-bold uppercase tracking-[0.2em] text-[10px]">Subscriptions & finance</span>
        <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Control de <span className="text-amber-600">Pagaments</span></h1>
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
