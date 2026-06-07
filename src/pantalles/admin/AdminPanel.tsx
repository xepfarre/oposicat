import React, { useState, useEffect, useMemo } from "react";
import { auth, db } from "../../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  serverTimestamp, 
  query, 
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  collectionGroup
} from "firebase/firestore";
import AdminLogin from "./AdminLogin";
import GestioRols from "./GestioRols";
import CentreNotificacions from "./CentreNotificacions";
import { DATA_CATALUNYA } from "../../data/municipis";
import { 
  Plus, 
  Trash2, 
  Bell,
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
  FileDown,
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
  Wand2,
  ArrowLeft,
  ArrowRight,
  Video,
  Image as ImageIcon,
  ExternalLink,
  Type,
  Building2,
  Phone,
  Mail,
  Lock as LockIcon,
  Shield
} from "lucide-react";
import { TEMARI_DETALL } from "../../constants/temari";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

// Comentari planer per a no-programadors:
// Definim els tipus d'operacions possibles a la base de dades
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Representació estàndard de dades d'error de Firestore exigida pel skill de Firebase
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

// Gestor d'errors segur com indica el protocol de "firebase-integration"
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error capturat de forma segura: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * PANTALLA: AdminPanel (Web de Gestió)
 * Portal professional per a la gestió de continguts d'OposiCAT.
 */
export default function AdminPanel({ onExit }: { onExit: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [userRol, setUserRol] = useState<string>("usuari_free_trial");
  const [authError, setAuthError] = useState<string | null>(null);
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
    analisis: false,
    notificacions: false
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
  const [exercicisFisics, setExercicisFisics] = useState<any[]>([]);
  const [plansEntrenament, setPlansEntrenament] = useState<any[]>([]);
  const [preguntesBiodataPersonals, setPreguntesBiodataPersonals] = useState<any[]>([]);
  const [preguntesBiodataLaborals, setPreguntesBiodataLaborals] = useState<any[]>([]);
  const [preguntesBiodataPGME, setPreguntesBiodataPGME] = useState<any[]>([]);
  const [preguntesEntrevista, setPreguntesEntrevista] = useState<any[]>([]);
  
  const [psicolegs, setPsicolegs] = useState<any[]>([]);
  const [usuaris, setUsuaris] = useState<any[]>([]);
  
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

  const [nouExercici, setNouExercici] = useState({
    nom: "",
    temps: "30 segons",
    categoria: "Circuit Agilitat", // Categoria per filtrar
    imatge: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    consells: ["", "", ""]
  });

  const [nouPlaFisic, setNouPlaFisic] = useState({
    setmana: 1,
    tipusProva: "Course Navette", // Course Navette | Circuit Agilitat | Press de Banca
    exercicisIds: [] as string[]
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
    // Comentari planer per a no-programadors:
    // Aquest vigilant de seguretat es posa en marxa un cop l'administrador obre la pàgina.
    // Analitza la sessió en temps real per garantir que només els usuaris amb privilegis de
    // gestor o administradors autoritzats puguin visualitzar el contingut privat del Backoffice.
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      setCheckingAuth(true);
      if (currentUser) {
        // Llista blindada d'emails administradors oficials de l'ecosistema OposiCAT
        const adminEmails = ["xepfarre@gmail.com", "xepfarre7@gmail.com", "sergivinu@gmail.com"];
        const emailLower = (currentUser.email || "").toLowerCase();
        const pertanyALlista = adminEmails.includes(emailLower);
        
        let teRolAdmin = false;
        try {
          // Consultem de forma segura la fitxa d'usuari a Firestore per verificar el camp "rol"
          const userDoc = await getDoc(doc(db, "usuaris", currentUser.uid));
          if (userDoc.exists()) {
            const dades = userDoc.data();
            let rolActual = dades.rol || "usuari_free_trial";
            
            // Comentari planer per a no-programadors:
            // Si el correu de la persona que entra pertany a la llista oficial d'administradors (xepfarre, sergi, etc.)
            // però té dades antigues o un rol d'"opositor" a Firestore, el sistema el promou automàticament a
            // "admin_master" o "admin" a la base de dades perquè no quedi mai bloquejat dels menús de gestió.
            if (pertanyALlista) {
              const rolCorrecte = (emailLower === "xepfarre@gmail.com") ? "admin_master" : "admin";
              if (rolActual !== rolCorrecte) {
                console.log(`[FORCED-ADMIN-UPGRADE] Actualitzant rol de ${emailLower} de "${rolActual}" a "${rolCorrecte}" per aliniar-lo amb la llista de seguretat.`);
                try {
                  await updateDoc(doc(db, "usuaris", currentUser.uid), { rol: rolCorrecte });
                  rolActual = rolCorrecte;
                } catch (updateErr) {
                  console.error("Error actualitzant rol d'administrador forçat a Firestore:", updateErr);
                }
              }
            }
            
            setUserRol(rolActual);
            const rolsPermesosBackoffice = ["admin_master", "admin", "treballador_nivell_1", "treballador_nivell_2", "treballador_nivell_3"];
            if (rolsPermesosBackoffice.includes(rolActual)) {
              teRolAdmin = true;
            }
          } else {
            // Si és nou o encara no té doc Firestore creat, calculem el provisional temporal
            const provisional = (emailLower === "xepfarre@gmail.com") ? "admin_master" : "admin";
            setUserRol(provisional);
          }
        } catch (e) {
          console.error("Error durant la consulta del rol d'administrador a la base de dades:", e);
        }

        if (pertanyALlista || teRolAdmin) {
          setIsAdminVerified(true);
          setAuthError(null);
          fetchData();
        } else {
          setIsAdminVerified(false);
          setAuthError("Accés denegat: Aquest perfil no disposa de permisos d'Administrador d'OposiCAT.");
          await auth.signOut();
        }
      } else {
        setIsAdminVerified(false);
      }
      setCheckingAuth(false);
    });

    return () => unsub();
  }, [activeTab, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    
    // Timer de seguretat més llarg (30s) per donar temps a la primera connexió
    const timeout = setTimeout(() => {
      if (loading) {
        setFetchError("La base de dades no respon de forma immediata. Possible falta d'índexs composts.");
        setLoading(false);
      }
    }, 30000);

    // Comentari planer per a no-programadors:
    // Aquesta funció fa de "escut protector". Si alguna de les col·leccions de la base de dades
    // té un error o no està indexada, impedeix que tota l'aplicació falli.
    const safeFetch = async (queryCall: any, label: string) => {
      try {
        return await getDocs(queryCall);
      } catch (e: any) {
        console.warn(`[RESILLIÈNCIA OPOSICAT] Avís de càrrega per a (${label}):`, e.message);
        return { docs: [] } as any;
      }
    };

    try {
      // Autoseed silenciosos de Rols si estan buits a la base de dades
      try {
        const rolsSnap = await getDocs(collection(db, "rols"));
        if (rolsSnap.empty) {
          console.log("[AUTO-SEED] Sementant els 10 rols predefinits d'OposiCAT...");
          const ROLS_PRE_DEFINITS = [
            { id: "admin_master", nom: "Admin Master", descripcio: "Rol superior absolut. Accés total a totes les configuracions, eliminacions de bases de dades i capacitat per llançar notificacions globals.", actiu: true, permisos: { enviarNotificacions: true } },
            { id: "admin", nom: "Administrador / Soci", descripcio: "Accés reservat als 2 socis fundadors. Permet visualitzar estadístiques, comprovar finances, gestionar opositors i llançar notificacions oficials.", actiu: true, permisos: { enviarNotificacions: true } },
            { id: "tester", nom: "Tester / Provador", descripcio: "Perfil de proves destinat a validar exàmens asíncrons i auditar mòduls de notificacions abans del llançament oficial.", actiu: false, permisos: { enviarNotificacions: false } },
            { id: "treballador_nivell_1", nom: "Treballador Nivell 1", descripcio: "Gestor de continguts teòrics i d'actualitat de nivell bàsic. Edita temes però no pot enviar notificacions ni eliminar exàmens.", actiu: true, permisos: { enviarNotificacions: false } },
            { id: "treballador_nivell_2", nom: "Treballador Nivell 2", descripcio: "Gestor de nivell mitjà. Habilitat per gestionar incidències, assignar consultes amb psicòlegs i crear calendaris físics.", actiu: true, permisos: { enviarNotificacions: false } },
            { id: "treballador_nivell_3", nom: "Treballador Nivell 3", descripcio: "Coordinador operatiu de continguts. Té permís per redactar notificacions push de l'APP d'estudi però no per enviar-les directament de forma immediata.", actiu: true, permisos: { enviarNotificacions: false } },
            { id: "usuari", nom: "Usuari Opositor", descripcio: "Perfil estàndard dels estudiants de pagament complet. Accés i dret a visualitzar temari i fer entrenaments.", actiu: true, permisos: { enviarNotificacions: false } },
            { id: "usuari_free_trial", nom: "Usuari Prova (Free Trial)", descripcio: "Compte de prova gratuïta de 3 dies per a nous alumnes/usuaris registrats. No tenen accés d'edició ni dret d'enviament de cap mena.", actiu: true, permisos: { enviarNotificacions: false } },
            { id: "usuari_bannejat", nom: "Usuari Bannejat", descripcio: "Accés totalment bloquejat per violació de termes d'ús de comptes compartits o impagament.", actiu: true, permisos: { enviarNotificacions: false } },
            { id: "usuari_sospitos", nom: "Usuari Sospitós", descripcio: "Estat en observació automatitzada. Permet l'estudi de contingut general, però bloqueja canvis o reserves de cita.", actiu: true, permisos: { enviarNotificacions: false } }
          ];
          for (const r of ROLS_PRE_DEFINITS) {
            await setDoc(doc(db, "rols", r.id), {
              nom: r.nom,
              descripcio: r.descripcio,
              actiu: r.actiu,
              permisos: r.permisos || {},
              actualitzatEl: serverTimestamp()
            }, { merge: true });
          }
        }
      } catch (err) {
        console.warn("No s'ha pogut auto-verificar o crear la col·lecció de rols:", err);
      }

      // Executem totes les consultes EN PARAL·LEL i de forma aïllada i resistent a errades
      const [
        snapNew, snapOld, snapAct, snapGim, snapRes, snapSub, snapPsiTip, snapPsiPreg, snapExFis, snapPlaFis,
        snapBioPer, snapBioLab, snapBioPGME, snapEnt, snapUsuaris, snapActPreg
      ] = await Promise.all([
        safeFetch(query(collectionGroup(db, "preguntes_codificades")), "preguntes_codificades"),
        safeFetch(query(collection(db, "examens/mossos/preguntes")), "examens/mossos/preguntes"),
        safeFetch(query(collection(db, "actualitat")), "actualitat"),
        safeFetch(query(collection(db, "gimnasos")), "gimnasos"),
        safeFetch(query(collection(db, "reserves_psicologia")), "reserves_psicologia"),
        safeFetch(query(collection(db, "subscripcions")), "subscripcions"),
        safeFetch(query(collection(db, "psicotecnics_tipus"), orderBy("titol")), "psicotecnics_tipus"),
        safeFetch(query(collection(db, "psicotecnics_preguntes"), orderBy("createdAt", "desc")), "psicotecnics_preguntes"),
        safeFetch(query(collection(db, "exercicis_fisics"), orderBy("nom")), "exercicis_fisics"),
        safeFetch(query(collection(db, "plans_entrenament"), orderBy("setmana")), "plans_entrenament"),
        safeFetch(query(collection(db, "preguntes_biodata_personals")), "preguntes_biodata_personals"),
        safeFetch(query(collection(db, "preguntes_biodata_laborals")), "preguntes_biodata_laborals"),
        safeFetch(query(collection(db, "preguntes_biodata_pgme")), "preguntes_biodata_pgme"),
        safeFetch(query(collection(db, "preguntes_entrevista"), orderBy("createdAt", "desc")), "preguntes_entrevista"),
        safeFetch(query(collection(db, "usuaris")), "usuaris"),
        safeFetch(query(collection(db, "actualitat_preguntes"), orderBy("createdAt", "desc")), "actualitat_preguntes")
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
      
      // Processar exercicis físics
      setExercicisFisics(snapExFis.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Processar plans entrenament
      setPlansEntrenament(snapPlaFis.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Processar preguntes biodata
      setPreguntesBiodataPersonals(snapBioPer.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPreguntesBiodataLaborals(snapBioLab.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPreguntesBiodataPGME(snapBioPGME.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Processar preguntes entrevista
      setPreguntesEntrevista(snapEnt.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Processar usuaris asíncronament des de la base de dades Firestore
      setUsuaris(snapUsuaris.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Psicòlegs per defecte (si no n'hi ha a la BBDD)
      setPsicolegs([
        { id: "p1", nom: "Aleix Romeo Pociello" },
        { id: "p2", nom: "Maria Blazquez Godia" }
      ]);

      setFetchError(null);

    } catch (err: any) {
      console.error("Error durant un dels sub-processats del panell:", err);
      setFetchError(err.message || "Error parcial en connectar amb Firestore.");
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

  const loadMockBiodata = () => {
    const personals = [
      { id: "mock-bio-p1", pregunta: "Digui'm els seus 3 majors defectes i 3 majors virtuts.", resposta: "Resposta pendent de definir...", createdAt: new Date() },
      { id: "mock-bio-p2", pregunta: "És el primer cop que es presenta? Si no ho és, per què es presenta un altre cop?", resposta: "Resposta pendent de definir...", createdAt: new Date() },
      { id: "mock-bio-p3", pregunta: "Per què creu que vostè ha d'aprovar aquesta oposició aquest any?", resposta: "Resposta pendent de definir...", createdAt: new Date() },
      { id: "mock-bio-p4", pregunta: "Descrigui breument la situació que més por ha passat a la seva vida.", resposta: "Resposta pendent de definir...", createdAt: new Date() }
    ];
    const laborals = [
      { id: "mock-bio-l1", pregunta: "Quants anys ha treballat vostè i on?", resposta: "Resposta pendent de definir...", createdAt: new Date() },
      { id: "mock-bio-l2", pregunta: "Quin és el càrrec més important que vostè ha desenvolupat?", resposta: "Resposta pendent de definir...", createdAt: new Date() },
      { id: "mock-bio-l3", pregunta: "Si tornés a néixer, estudiaria el mateix?", resposta: "Resposta pendent de definir...", createdAt: new Date() }
    ];
    const pgme = [
      { id: "mock-bio-pg1", pregunta: "Per què vostè vol ser policia?", resposta: "Voldria ser policia perquè considero que sóc una persona que vol ajudar a la societat de forma altruista i professional. Desenvoluparé la feina amb gran professionalitat i responsabilitat per a donar el màxim nivell del servei. Estic preparat per a fer el que sigui necessari per als ciutadans i el cos de PGME, però amb els peus a terra, sense creure'm un superheroi.", createdAt: new Date() },
      { id: "mock-bio-pg2", pregunta: "Per què ha decidit ser mosso i no policia local?", resposta: "Resposta pendent de definir...", createdAt: new Date() },
      { id: "mock-bio-pg3", pregunta: "Què espera de la feina de mosso?", resposta: "Resposta pendent de definir...", createdAt: new Date() },
      { id: "mock-bio-pg4", pregunta: "Què creu vostè que la ciutadania espera de vostè?", resposta: "Resposta pendent de definir...", createdAt: new Date() },
      { id: "mock-bio-pg5", pregunta: "Quina especialitat és la que més li agradaria treballar dins del cos?", resposta: "Resposta pendent de definir...", createdAt: new Date() }
    ];

    setPreguntesBiodataPersonals(personals);
    setPreguntesBiodataLaborals(laborals);
    setPreguntesBiodataPGME(pgme);
    setFetchError(null);
  };

  const loadMockEntrevista = () => {
    const mocks = [
      // INICIALS
      { id: "e-mock-1", pregunta: "1 Què tal?", seccio: "PREGUNTES INICIALS", createdAt: new Date() },
      { id: "e-mock-2", pregunta: "2 Està molt nerviós?", seccio: "PREGUNTES INICIALS", createdAt: new Date() },
      { id: "e-mock-3", pregunta: "3 D'on ve?", seccio: "PREGUNTES INICIALS", createdAt: new Date() },
      
      // FORMACIÓ
      { id: "e-mock-4", pregunta: "7 Quins estudis ha realitzat?", seccio: "FORMACIÓ", createdAt: new Date() },
      { id: "e-mock-5", pregunta: "9 Tornaria a realitzar els mateixos estudis? Per què?", seccio: "FORMACIÓ", createdAt: new Date() },
      { id: "e-mock-6", pregunta: "13 Quin tipus d'estudiant era/és?", seccio: "FORMACIÓ", createdAt: new Date() },
      
      // LABORAL
      { id: "e-mock-7", pregunta: "14 Quina és la darrera feina que ha fet?", seccio: "EXPERIÈNCIA LABORAL", createdAt: new Date() },
      { id: "e-mock-8", pregunta: "22 Per què vol canviar de feina?", seccio: "EXPERIÈNCIA LABORAL", createdAt: new Date() },
      { id: "e-mock-9", pregunta: "24 Expliqui’m algun conflicte que hagi tingut a la feina.", seccio: "EXPERIÈNCIA LABORAL", createdAt: new Date() },
      
      // PERSONALS
      { id: "e-mock-10", pregunta: "29 Parli’m de vostè. Quin tipus de persona és?", seccio: "PREGUNTES PERSONALS", createdAt: new Date() },
      { id: "e-mock-11", pregunta: "30 Digui’m 3 punts forts del seu caràcter.", seccio: "PREGUNTES PERSONALS", createdAt: new Date() },
      { id: "e-mock-12", pregunta: "31 Digui’m tres punts febles.", seccio: "PREGUNTES PERSONALS", createdAt: new Date() },
      
      // MMEE
      { id: "e-mock-13", pregunta: "78 Per què vol ser MMEE?", seccio: "PREGUNTES SOBRE MMEE", createdAt: new Date() },
      { id: "e-mock-14", pregunta: "86 Quines funcions té encomanades el cos MMEE?", seccio: "PREGUNTES SOBRE MMEE", createdAt: new Date() },
      { id: "e-mock-15", pregunta: "107 Quina creu que és la qualitat més important que ha de tenir un MMEE?", seccio: "PREGUNTES SOBRE MMEE", createdAt: new Date() }
    ];
    setPreguntesEntrevista(mocks);
    setFetchError(null);
  };

  const loadMockReserves = (targetDateStr?: string) => {
    const names = ["Roger de Flor", "Laia Martínez", "Jordi Soler", "Marta Vinu"];
    
    // Si no ens passen data, usem la d'avui. Si ens la passen (ex: "2026-05-20"), la fem servir
    const today = targetDateStr ? new Date(targetDateStr) : new Date();
    
    const mocks = names.map((name, i) => {
      const date = new Date(today);
      // Alguns per la data seleccionada, d'altres per al dia següent
      const dayOffset = i >= 2 ? 1 : 0;
      date.setDate(today.getDate() + dayOffset); 
      date.setHours(10 + (i * 2), 0, 0, 0);
      
      return {
        id: `mock-res-${Date.now()}-${i}`,
        usuariNom: name,
        usuariEmail: `${name.toLowerCase().replace(/ /g, '.')}@exemple.com`,
        dataSessio: date.toISOString(),
        estat: i % 2 === 0 ? "pendent" : "confirmada",
        notes: "Aspirant amb perfil molt equilibrat per a la simulació backoffice.",
        telefon: "600 000 000",
        edat: (22 + i).toString(),
        anysOpositant: (1 + i).toString(),
        psicoleg: i === 1 ? "Aleix Romeo Pociello" : "", 
        biodataFet: true,
        competencies: {
          "Orientació al servei": 8.5,
          "Autocontrol": 7.2,
          "Comunicació": 9.0,
          "Treball en equip": 8.0,
          "Ètica": 9.5
        },
        biodataInforme: "Dades de prova generades localment per a verificació de disseny.",
        createdAt: new Date()
      };
    });

    setReserves(prev => [...mocks, ...prev]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleSeedCites = async () => {
    // Aquesta funció es manté per si es vol persistir a la BBDD, 
    // però el botó de "proves" ara farà servir la versió local
    setLoading(true);
    try {
      const names = ["Roger de Flor", "Laia Martínez", "Jordi Soler", "Marta Vinu"];
      const dates = [
        new Date(), // Avui (perquè sigui visible immediatament)
        new Date(Date.now() + 86400000 * 1), // Demà
        new Date(Date.now() + 86400000 * 2), // Demà pasat
        new Date(Date.now() + 86400000 * 3)  // En 3 dies
      ];
      
      dates[0].setHours(10, 0, 0, 0);
      dates[1].setHours(12, 30, 0, 0);
      dates[2].setHours(16, 0, 0, 0);
      dates[3].setHours(18, 45, 0, 0);

      const promises = names.map((name, i) => {
        return addDoc(collection(db, "reserves_psicologia"), {
          usuariNom: name,
          usuariEmail: `${name.toLowerCase().replace(/ /g, '.')}@exemple.com`,
          dataSessio: dates[i].toISOString(),
          estat: "pendent",
          notes: "Aspirant molt motivat amb bona presència. Té dubtes sobre el circuit d'agilitat.",
          telefon: "600 000 000",
          edat: (22 + i).toString(),
          anysOpositant: (1 + i).toString(),
          psicoleg: "", 
          biodataFet: true,
          competencies: {
            "Orientació al servei": 7 + Math.random() * 3,
            "Autocontrol": 6 + Math.random() * 4,
            "Comunicació": 8 + Math.random() * 2,
            "Treball en equip": 7 + Math.random() * 3,
            "Ètica": 9 + Math.random()
          },
          biodataInforme: "Perfil apte per al servei policial amb gran capacitat de treball en equip i comunicació efectiva.",
          createdAt: serverTimestamp()
        });
      });

      await Promise.all(promises);
      await fetchData(); // Force refresh
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error seeding cites:", error);
    } finally {
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
    if (userRol !== "admin_master" && userRol !== "admin") {
      setFetchError("Accés denegat: Només els rols d'Admin Master i Administradors tenen permís de notificació / inserció.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setFetchError(null), 5000);
      return;
    }
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
    if (userRol !== "admin_master" && userRol !== "admin") {
      setFetchError("Accés denegat: Només els rols d'Admin Master i Administradors tenen permís de notificació / inserció.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setFetchError(null), 5000);
      return;
    }
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

  const handleAddExerciciFisic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "exercicis_fisics"), {
        ...nouExercici,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setNouExercici({ nom: "", temps: "30 segons", categoria: "Circuit Agilitat", imatge: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", consells: ["", "", ""] });
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error afegint exercici:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlaEntrenament = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "plans_entrenament"), {
        ...nouPlaFisic,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setNouPlaFisic({ setmana: 1, tipusProva: "Course Navette", exercicisIds: [] });
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error afegint pla d'entrenament:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funció per generar exercicis d'exemple ràpidament (LOCAL)
  const handleGenerateExampleExercicis = () => {
    console.log("Generant exercicis de prova...");
    const timestamp = Date.now();
    const exemples = [
      { id: `local-ex-${timestamp}-1`, nom: "Skipping Alt", categoria: "Circuit Agilitat", temps: "45 segons", imatge: "https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800", consells: ["Genolls a l'alçada del melic", "Braços coordinats", "Punta del peu activa"], createdAt: new Date() },
      { id: `local-ex-${timestamp}-2`, nom: "Flexions Diamant", categoria: "Press de Banca", temps: "15 reps", imatge: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800", consells: ["Mans en forma de diamant", "Colzes enganxats al cos", "Esquena totalment recta"], createdAt: new Date() },
      { id: `local-ex-${timestamp}-3`, nom: "Squat Jumps", categoria: "Circuit Agilitat", temps: "30 segons", imatge: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800", consells: ["Amortigua bé la caiguda", "Talons a terra en baixar", "Salt explosiu amunt"], createdAt: new Date() },
      { id: `local-ex-${timestamp}-4`, nom: "Resistència incremental", categoria: "Course Navette", temps: "Paliers 1-5", imatge: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800", consells: ["Mantén el core rígid", "Gira tot el tronc", "Mira la mà que puja"], createdAt: new Date() }
    ];

    setExercicisFisics(prev => {
      const nous = exemples.filter(ex => !prev.some(p => p.nom === ex.nom));
      return [...nous, ...prev];
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    return exemples; 
  };

  // Funció per generar plans d'exemple si hi ha exercicis (LOCAL)
  const handleGenerateExamplePlans = () => {
    console.log("Generant plans de prova...");
    let exercicisPerPla = [...exercicisFisics];
    
    // Si no hi ha exercicis, en generem uns quants primer
    if (exercicisPerPla.length < 4) {
        const nousEx = handleGenerateExampleExercicis();
        exercicisPerPla = [...nousEx, ...exercicisPerPla];
    }
    
    const timestamp = Date.now();
    const nousPlans = [
      {
        id: `local-pla-${timestamp}-1`,
        setmana: 1,
        tipusProva: "Circuit Agilitat",
        exercicisIds: exercicisPerPla.slice(0, 3).map(ex => ex.id),
        createdAt: new Date()
      },
      {
        id: `local-pla-${timestamp}-2`,
        setmana: 2,
        tipusProva: "Press de Banca",
        exercicisIds: exercicisPerPla.slice(1, 3).map(ex => ex.id),
        createdAt: new Date()
      },
      {
        id: `local-pla-${timestamp}-3`,
        setmana: 3,
        tipusProva: "Course Navette",
        exercicisIds:  exercicisPerPla.filter(ex => ex.categoria === "Course Navette").map(ex => ex.id),
        createdAt: new Date()
      }
    ];
    
    setPlansEntrenament(prev => [...nousPlans, ...prev]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  // Funció per generar gimnasos d'exemple (LOCAL)
  const handleGenerateExampleGimnasos = () => {
    const timestamp = Date.now();
    const exemples = [
      { 
        id: `local-gym-${timestamp}-1`, 
        nom: "Eurofitness Sant Cugat", 
        provincia: "Barcelona", 
        comarca: "Vallès Occidental", 
        municipi: "Sant Cugat del Vallès",
        entrenament: ["Circuit Agilitat", "Course Navette"],
        imatges: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"],
        descripcio: "Instal·lacions d'alt rendiment amb zona específica per a opositors.",
        telefon: "935 891 234",
        correu: "info@eurofitness.cat",
        preus: "Pack oposicions: 45€/mes. Sessions soltes: 12€.",
        infoPrivada: "Acord de comissió del 10% per cada alumne inscrit via OposiCAT.",
        createdAt: new Date() 
      },
      { 
        id: `local-gym-${timestamp}-2`, 
        nom: "GEiEG Girona", 
        provincia: "Girona", 
        comarca: "Gironès", 
        municipi: "Girona",
        entrenament: ["Circuit Agilitat", "Press de Banca"],
        imatges: ["https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800"],
        descripcio: "Centre multiesportiu amb pista d'atletisme reglamentària.",
        telefon: "972 234 567",
        correu: "salut@geieg.cat",
        preus: "Quota mensual: 52€. Inclou piscina i gimnàs.",
        infoPrivada: "Contacte directe: Joan (Director esportiu). Molt col·laborador.",
        createdAt: new Date() 
      },
      { 
        id: `local-gym-${timestamp}-3`, 
        nom: "Gimnàs Lleida Sport", 
        provincia: "Lleida", 
        comarca: "Segrià", 
        municipi: "Lleida",
        entrenament: ["Course Navette"],
        imatges: ["https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800"],
        descripcio: "Especialistes en resistència i preparació física de Bombers.",
        telefon: "973 112 233",
        correu: "admin@lleidasport.com",
        preus: "Sessió única Navette: 8€.",
        infoPrivada: "Interès en fer conveni exclusiu per a l'Àmbit C.",
        createdAt: new Date() 
      }
    ];

    setGimnasos(prev => {
      const nous = exemples.filter(ex => !prev.some(p => p.nom === ex.nom));
      return [...nous, ...prev];
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleDelete = async (fullPath: string, id?: string) => {
    try {
      if (id?.toString().startsWith('local-') || id?.toString().startsWith('mock-')) {
          setExercicisFisics(prev => prev.filter(ex => ex.id !== id));
          setPlansEntrenament(prev => prev.filter(p => p.id !== id));
          setPreguntes(prev => prev.filter(p => p.id !== id));
          setPreguntesBiodataPersonals(prev => prev.filter(q => q.id !== id));
          setPreguntesBiodataLaborals(prev => prev.filter(q => q.id !== id));
          setPreguntesBiodataPGME(prev => prev.filter(q => q.id !== id));
          setPreguntesEntrevista(prev => prev.filter(q => q.id !== id));
          return;
      }
      if (fullPath) {
        await deleteDoc(doc(db, fullPath));
        fetchData();
      }
    } catch (err) {
      console.error("Error eliminant:", err);
    }
  };

  const handleLocalDelete = (id: string) => {
    setPreguntes(prev => prev.filter(p => p.id !== id));
  };

  /**
   * FUNCIÓ: handlePurgeCollection
   * Aquesta funció serveix per esborrar completament tots els documents d'una col·lecció de la base de dades Firestore.
   * Primer, descarrega tots els elements de la col·lecció triada (com ara les reserves velles).
   * Després, els va eliminant d'un en un de la base de dades del servidor per deixar la col·lecció totalment buida.
   * Finalment, torna a carregar les dades de l'aplicació per reflectir els canvis en directe a la pantalla.
   */
  const handlePurgeCollection = async (collectionName: string) => {
    setLoading(true); // Activem l'indicador de càrrega per avisar que estem treballant
    try {
      // Obtenim tots els documents de la col·lecció posant-nos en contacte amb el servidor de Firebase
      const snap = await getDocs(collection(db, collectionName));
      
      // Creem un llistat d'ordres d'eliminació, una per cada document trobat
      const promises = snap.docs.map(doc => deleteDoc(doc.ref));
      
      // Executem totes les ordres d'eliminació alhora per anar el més ràpid possible
      await Promise.all(promises);
      
      // Tornem a demanar les dades actuals per actualitzar el que es veu a la pantalla
      await fetchData();
      
      setSuccess(true); // Indiquem que el procés ha funcionat correctament
      setTimeout(() => setSuccess(false), 3000); // Guardem el missatge d'èxit després de 3 segons
    } catch (err: any) {
      console.error(`Error de servidor en purgant ${collectionName}:`, err);
      // Si el servidor falla o no hi ha connexió (com en un test local), de forma segura netegem l'estat localment en memòria
      if (collectionName === "reserves_psicologia") {
        setReserves([]);
      }
    } finally {
      setLoading(false); // Desactivem l'indicador de càrrega
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 bg-[#001a33] flex flex-col items-center justify-center p-6 z-[200] text-white">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase tracking-widest text-[#FFDF00]">Verificant permisos d'accés...</p>
          <p className="text-white/60 text-xs font-semibold leading-relaxed max-w-xs">
            Comprovant de forma segura la teva credencial d'administrador a OposiCAT.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdminVerified) {
    return (
      <AdminLogin 
        onLoginSuccess={() => {
          // L'onAuthStateChanged escoltarà el canvi, comprovarà el rol i autoritzarà l'accés
        }} 
        initialError={authError || undefined}
      />
    );
  }

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
                            // Comentari planer per a no-programadors:
                            // Quan seleccionem un cos de seguretat des del desplegable superior (com Mossos d'Esquadra),
                            // redirigim a l'usuari directament al camí d'inici arrel de l'administració ("/admin").
                            // Això garanteix que vegi primer la benvinguda original del servei d'OposiCAT
                            // en lloc de quedar-se clavat a la pàgina de notificacions o qualsevol altra pantalla antiga.
                            navigate('/admin');
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
                  />
                  <SidebarItem 
                    to="/admin/rols" 
                    active={activeTab === 'rols'} 
                    icon={<Shield size={18} />} 
                    label="Gestió de Rols" 
                    badge="Nova"
                  />
                </CollapsibleSection>
              </div>

              {/* LÍNIA DIVISÒRIA */}
              <div className="h-px bg-white/10 mx-2" />

              {/* SECCIÓ 4: COMUNICACIÓ (CENTRE DE NOTIFICACIONS ACCESSIBLE) */}
              <div className="space-y-1">
                <CollapsibleSection 
                  title="Centre de Notificacions" 
                  isOpen={openSections.notificacions} 
                  onToggle={() => toggleSection('notificacions')}
                  icon={<Bell size={14} />}
                >
                  <SidebarItem 
                    to="/admin/notificacions" 
                    active={activeTab === 'notificacions'} 
                    icon={<Bell size={18} />} 
                    label="Notificacions" 
                    badge="Avisos"
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
                  <SidebarItem 
                    to="/admin/manteniment" 
                    active={activeTab === 'manteniment'} 
                    icon={<Database size={18} />} 
                    label="Manteniment BBDD" 
                    badge="Admin" 
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
              <Route path="exercicis-fisics" element={
                <ExercicisFisicsView 
                  exercicis={exercicisFisics}
                  nouExercici={nouExercici}
                  setNouExercici={setNouExercici}
                  onSubmit={handleAddExerciciFisic}
                  onLoadMock={handleGenerateExampleExercicis}
                  onDelete={handleDelete}
                  loading={loading}
                  success={success}
                  darkMode={darkMode}
                />
              } />
              <Route path="plans-entrenament" element={
                <PlansEntrenamentView 
                  plans={plansEntrenament}
                  exercicisDisponibles={exercicisFisics}
                  nouPla={nouPlaFisic}
                  setNouPla={setNouPlaFisic}
                  onSubmit={handleAddPlaEntrenament}
                  onLoadMock={handleGenerateExamplePlans}
                  onDelete={handleDelete}
                  loading={loading}
                  success={success}
                  darkMode={darkMode}
                />
              } />
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
                userRol={userRol}
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
                userRol={userRol}
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
                onLoadMock={handleGenerateExampleGimnasos}
                darkMode={darkMode}
              />
            } />
            <Route path="biodata/personals" element={
              <PreguntesBiodataView 
                preguntes={preguntesBiodataPersonals}
                type="personals"
                onDelete={handleDelete}
                onAdd={async (q: any) => {
                  setLoading(true);
                  try {
                    await addDoc(collection(db, "preguntes_biodata_personals"), { ...q, createdAt: serverTimestamp() });
                    fetchData();
                  } finally { setLoading(false); }
                }}
                onLoadMock={loadMockBiodata}
                darkMode={darkMode}
              />
            } />
            <Route path="biodata/laborals" element={
              <PreguntesBiodataView 
                preguntes={preguntesBiodataLaborals}
                type="laborals"
                onDelete={handleDelete}
                onAdd={async (q: any) => {
                  setLoading(true);
                  try {
                    await addDoc(collection(db, "preguntes_biodata_laborals"), { ...q, createdAt: serverTimestamp() });
                    fetchData();
                  } finally { setLoading(false); }
                }}
                onLoadMock={loadMockBiodata}
                darkMode={darkMode}
              />
            } />
            <Route path="biodata/pgme" element={
              <PreguntesBiodataView 
                preguntes={preguntesBiodataPGME}
                type="pgme"
                onDelete={handleDelete}
                onAdd={async (q: any) => {
                  setLoading(true);
                  try {
                    await addDoc(collection(db, "preguntes_biodata_pgme"), { ...q, createdAt: serverTimestamp() });
                    fetchData();
                  } finally { setLoading(false); }
                }}
                onLoadMock={loadMockBiodata}
                darkMode={darkMode}
              />
            } />
            <Route path="entrevista" element={
              <PreguntesEntrevistaView 
                preguntes={preguntesEntrevista}
                onDelete={handleDelete}
                onAdd={async (q: any) => {
                  setLoading(true);
                  try {
                    await addDoc(collection(db, "preguntes_entrevista"), { ...q, createdAt: serverTimestamp() });
                    fetchData();
                  } finally { setLoading(false); }
                }}
                onLoadMock={loadMockEntrevista}
                darkMode={darkMode}
              />
            } />
            <Route path="cites" element={
              <ReservesUsuariView 
                reserves={reserves}
                onUpdateStatus={async (id: string, estat: string) => {
                  if (id.startsWith('mock-')) {
                    setReserves(prev => prev.map(r => r.id === id ? { ...r, estat } : r));
                    return;
                  }
                  setLoading(true);
                  try {
                    await updateDoc(doc(db, "reserves_psicologia", id), { estat });
                    fetchData();
                  } finally { setLoading(false); }
                }}
                onSeedData={loadMockReserves}
                darkMode={darkMode}
              />
            } />
            <Route path="psicolegs" element={
              <GestioPsicolegsView 
                reserves={reserves}
                fetchData={fetchData}
                onSeedData={loadMockReserves}
                darkMode={darkMode}
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
            <Route path="usuaris" element={
              <UsuarisView 
                usuaris={usuaris}
                onUpdateUser={async (uid: string, data: any) => {
                  setLoading(true);
                  try {
                    // Comentari planer per a no-programadors:
                    // Si s'està modificant el rol d'un opositor/estudiant des d'aquesta taula,
                    // enregistrem un canvi manual dins del registre cloud d'auditoria de socis.
                    if (data && data.rol !== undefined) {
                      const userDoc = await getDoc(doc(db, "usuaris", uid));
                      if (userDoc.exists()) {
                        const dadesAbans = userDoc.data();
                        const anticRol = dadesAbans.rol || "opositor";
                        
                        // Només realitzem la gravació del log si el rol s'ha modificat realment
                        if (anticRol !== data.rol) {
                          const autorEmail = auth.currentUser?.email || "desconegut";
                          const autorNom = auth.currentUser?.displayName || "Administrador OposiCAT";
                          
                          await addDoc(collection(db, "logs_rols"), {
                            quiRealitzaNom: autorNom,
                            quiRealitzaEmail: autorEmail,
                            usuariAfectatId: uid,
                            usuariAfectatNom: dadesAbans.displayName || "Novell Opositor",
                            usuariAfectatEmail: dadesAbans.email || "sense@email.com",
                            rolAnterior: anticRol,
                            rolNou: data.rol,
                            fecha: serverTimestamp(),
                            tipusModificacio: "manual" // Identificador essencial que indica que el canvi és manual
                          });
                        }
                      }
                    }

                    await updateDoc(doc(db, "usuaris", uid), data);
                    fetchData();
                  } catch (err) {
                    handleFirestoreError(err, OperationType.UPDATE, `usuaris/${uid}`);
                  } finally { setLoading(false); }
                }}
                onAddMockUser={async () => {
                  setLoading(true);
                  try {
                    const mockUid = "mock_user_" + Math.random().toString(36).substring(2, 9);
                    await setDoc(doc(db, "usuaris", mockUid), {
                      uid: mockUid,
                      displayName: "Opositor Prova Fictici (" + Math.floor(Math.random() * 100) + ")",
                      email: "prova_" + Math.random().toString(36).substring(2, 6) + "@oposicat.cat",
                      rol: "opositor",
                      haPagat: false,
                      estatSubscripcio: "pendent_de_pagament",
                      correuVerificat: true,
                      creatEl: new Date().toISOString()
                    });
                    fetchData();
                  } catch (err) {
                    handleFirestoreError(err, OperationType.CREATE, "usuaris");
                  } finally { setLoading(false); }
                }}
                darkMode={darkMode}
              />
            } />
            <Route path="rols" element={<GestioRols darkMode={darkMode} />} />
            <Route path="notificacions" element={<CentreNotificacions darkMode={darkMode} />} />
            <Route path="manteniment" element={
              <MantenimentView 
                onPurgeCollection={handlePurgeCollection}
                loading={loading}
                success={success}
                darkMode={darkMode}
                totalReserves={reserves.length}
                totalPreguntes={preguntes.length}
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
 * VIEW: MantenimentView
 * Pantalla que permet sintonitzar de forma segura la base de dades i s'allotja al backoffice.
 * Permet forçar l'esborrat (purga) de col·leccions senceres a voluntat del desenvolupador.
 */
function MantenimentView({ 
  onPurgeCollection, 
  loading, 
  success, 
  darkMode,
  totalReserves,
  totalPreguntes 
}: { 
  onPurgeCollection: (name: string) => Promise<void>, 
  loading: boolean, 
  success: boolean, 
  darkMode: boolean,
  totalReserves: number,
  totalPreguntes: number 
}) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 animate-in fade-in duration-300">
      <header className="relative flex items-center justify-center mb-10">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton darkMode={darkMode} />
        </div>
        <div className="text-center flex flex-col items-center">
          <h1 className={`text-5xl font-black tracking-tighter italic uppercase mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Manteniment <span className="text-red-500">BBDD</span>
          </h1>
          <div className="h-1.5 w-32 bg-red-500 rounded-full mb-4" />
          <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Eines de Desenvolupador / Control de Firestore
          </p>
        </div>
      </header>

      <div className={`p-8 rounded-[2.5rem] border transition-colors duration-300 ${darkMode ? 'bg-slate-800/40 border-slate-700 shadow-2xl shadow-black/30' : 'bg-white border-slate-200 shadow-xl'} flex flex-col gap-8`}>
        {/* Avís amb explicació en català planer per a no-programadors */}
        <div className="flex items-start gap-4 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
          <Info size={24} className="shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-sm uppercase tracking-wide">Atenció: Accions Permanents i Irreversibles</h4>
            <p className="text-xs leading-relaxed opacity-90">
              Aquesta pantalla serveix per forçar la base de dades a netejar les col·leccions del servidor de Firebase d'un sol cop. 
              En prémer un d'aquests botons, s'esborraran tots els elements guardats de forma permanent. Useu-lo amb seny!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PURGA DE RESERVES PSICOLOGIA */}
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'} flex flex-col justify-between gap-5`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="text-blue-500" size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider">Cites d'Entrevista i Psicologia</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-1">
                Aquesta és la col·lecció de dades de psicologia antigues i actives. En prémer el botó inferior directament demanarà tot el llistat al servidor i li enviarà ordres d'esborrat per a cadascuna completament.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Documents vius:</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">{totalReserves}</span>
              </div>
            </div>
            <button
              disabled={loading}
              onClick={() => onPurgeCollection("reserves_psicologia")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
            >
              {loading ? "Processant eliminació..." : "Netejar Reserves Psicològiques"}
            </button>
          </div>

          {/* PURGA TEMARI */}
          <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'} flex flex-col justify-between gap-5`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="text-amber-500" size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider">Temari Codificat</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-1">
                Aquesta col·lecció allotja les referències del temari i les llistes de preguntes d'exàmens del sandbox. Si vols canviar o estructurar noves taules de preguntes des de zero, el pots esvair aquí.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Documents vius:</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded">{totalPreguntes}</span>
              </div>
            </div>
            <button
              disabled={loading}
              onClick={() => onPurgeCollection("temari")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
            >
              {loading ? "Processant eliminació..." : "Netejar Col·lecció Temari"}
            </button>
          </div>
        </div>

        {success && (
          <div className="text-center p-3 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold uppercase tracking-wider max-w-sm mx-auto w-full animate-bounce">
            ✔ Base de dades purgada satisfactòriament!
          </div>
        )}
      </div>
    </div>
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
            <MenuActionLink to="/admin/exercicis-fisics" label="Gestió d'exercici" icon={<Activity size={18} />} darkMode={darkMode} color="emerald" />
            <MenuActionLink to="/admin/plans-entrenament" label="Gestió de pla d'entrenament" icon={<Calendar size={18} />} darkMode={darkMode} color="emerald" />
          </div>
        </div>

        {/* LÍNIA DIVISÒRIA CENTRAL */}
        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 absolute left-1/2 top-0 bottom-0" />

        {/* COLUMNA 2: GIMNASOS */}
        <div className="flex flex-col px-12 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gestió de gimnasos</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="/admin/gimnasos?mode=alta" label="Donar d'alta gimnàs nou" icon={<Plus size={18} />} darkMode={darkMode} color="emerald" />
            <MenuActionLink to="/admin/gimnasos" label="Gestió de gimnàs existent" icon={<Building2 size={18} />} darkMode={darkMode} color="emerald" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreguntesBiodataView({ preguntes, type, onAdd, onDelete, onLoadMock, darkMode }: any) {
  const [nova, setNova] = useState({ pregunta: "", resposta: "" });

  const titol = type === 'personals' ? 'Preguntes Personals' : type === 'laborals' ? 'Preguntes Laborals' : 'Preguntes PGME';
  const icon = type === 'personals' ? <ClipboardList size={20} /> : type === 'laborals' ? <Briefcase size={20} /> : <FileText size={20} />;
  const color = "purple";
  const collectionName = `preguntes_biodata_${type}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(nova);
    setNova({ pregunta: "", resposta: "" });
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <BackButton darkMode={darkMode} />
          <div>
            <span className="text-purple-500 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice / Psicotècnica / Biodata</span>
            <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Gestió <span className="text-purple-500 uppercase">Biodata</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-500">Conexió a la BBDD estable</span>
          </div>
          <button 
            onClick={onLoadMock}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100'}`}
          >
            <Wand2 size={16} /> Test ( No BBDD )
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* COLUMNA ESQUERRA: FORMULARI ALTA */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className={`p-8 rounded-[3rem] border-2 shadow-xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-lg shadow-purple-500/20">
                   <Plus size={24} />
                </div>
                <h3 className={`text-xl font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>Donar d'alta {type}</h3>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Enunciat de la pregunta</label>
                  <textarea 
                    required
                    rows={3}
                    value={nova.pregunta}
                    onChange={e => setNova({...nova, pregunta: e.target.value})}
                    placeholder="Escriu la pregunta aquí..."
                    className={`w-full p-5 rounded-2xl border-none outline-none font-bold text-sm resize-none ${darkMode ? 'bg-slate-900 text-white placeholder:text-slate-700' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Resposta suggerida / Guia</label>
                  <textarea 
                    required
                    rows={5}
                    value={nova.resposta}
                    onChange={e => setNova({...nova, resposta: e.target.value})}
                    placeholder="Escriu la resposta aquí..."
                    className={`w-full p-5 rounded-2xl border-none outline-none font-bold text-sm resize-none ${darkMode ? 'bg-slate-900 text-white placeholder:text-slate-700' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-3xl font-black uppercase italic tracking-widest text-sm shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                >
                  Registrar Pregunta Biodata
                </button>
             </form>
          </div>
        </div>

        {/* COLUMNA DRETA: BANC DE PREGUNTES */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className={`p-8 rounded-[3rem] border-2 flex flex-col gap-8 ${darkMode ? 'bg-slate-900/20 border-slate-800/50' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
                   {icon}
                </div>
                <div>
                   <h3 className={`text-2xl font-black uppercase tracking-tighter italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>Banc de preguntes existent</h3>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {preguntes.length}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {preguntes.map((q: any) => (
                <div key={q.id} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between gap-8 group ${darkMode ? 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50' : 'bg-white border-slate-100 hover:border-purple-500 shadow-sm'}`}>
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                        {type}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic opacity-0 group-hover:opacity-100 transition-opacity">ID: {q.id}</span>
                    </div>
                    <h4 className={`text-lg font-bold italic tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      "{q.pregunta}"
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl line-clamp-2 italic">{q.resposta}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={() => onDelete(`${collectionName}/${q.id}`, q.id)}
                      className="p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={24} />
                    </button>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${darkMode ? 'bg-slate-900/60 text-purple-400' : 'bg-slate-50 text-slate-300 group-hover:text-purple-500 group-hover:bg-purple-50'}`}>
                      {icon}
                    </div>
                  </div>
                </div>
              ))}

              {preguntes.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-center px-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                  <ClipboardList size={56} className="text-slate-200 dark:text-slate-800 mb-8" />
                  <p className="font-black uppercase italic tracking-widest text-[11px] text-slate-400">No hi ha cap pregunta registrada encara</p>
                </div>
              )}
            </div>
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
            <MenuActionLink to="/admin/biodata/personals" label="Gestió preguntes personals" icon={<ClipboardList size={18} />} darkMode={darkMode} color="purple" />
            <MenuActionLink to="/admin/biodata/laborals" label="Gestió preguntes laborals" icon={<Briefcase size={18} />} darkMode={darkMode} color="purple" />
            <MenuActionLink to="/admin/biodata/pgme" label="Gestió preguntes PGME" icon={<FileText size={18} />} darkMode={darkMode} color="purple" />
          </div>
        </div>

        {/* LÍNIA DIVISÒRIA */}
        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 absolute left-1/3 top-0 bottom-0" />

        {/* COLUMNA 2: ENTREVISTA */}
        <div className="flex flex-col px-8 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Entrevista</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="/admin/entrevista" label="Gestió de preguntes d'entrevista" icon={<MessageSquare size={18} />} darkMode={darkMode} color="purple" />
          </div>
        </div>

        {/* LÍNIA DIVISÒRIA */}
        <div className="hidden md:block w-px bg-slate-200 dark:bg-slate-800 absolute left-2/3 top-0 bottom-0" />

        {/* COLUMNA 3: GESTIÓ CLIENTS */}
        <div className="flex flex-col px-8 gap-8">
          <h3 className={`text-2xl font-black uppercase tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-800'}`}>Gestió Clients</h3>
          <div className="flex flex-col gap-4">
            <MenuActionLink to="/admin/cites" label="Gestió de cites d'usuari" icon={<Calendar size={18} />} darkMode={darkMode} color="emerald" />
            <MenuActionLink to="/admin/psicolegs" label="Gestió de psicòlegs i assignacions" icon={<Users2 size={18} />} darkMode={darkMode} color="blue" />
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
function PreguntesEntrevistaView({ preguntes, onAdd, onDelete, onLoadMock, darkMode }: any) {
  const SECCIONS_ENTREVISTA = [
    "PREGUNTES INICIALS",
    "FORMACIÓ",
    "EXPERIÈNCIA LABORAL",
    "PREGUNTES PERSONALS",
    "PREGUNTES SOBRE MMEE"
  ];

  const [nova, setNova] = useState({ pregunta: "", seccio: SECCIONS_ENTREVISTA[0] });
  const [filterSeccio, setFilterSeccio] = useState("Totes les seccions");

  const preguntesFiltrades = preguntes.filter((q: any) => 
    filterSeccio === "Totes les seccions" || q.seccio === filterSeccio
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(nova);
    setNova({ pregunta: "", seccio: SECCIONS_ENTREVISTA[0] });
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <BackButton darkMode={darkMode} />
          <div>
            <span className="text-cyan-500 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice / Psicotècnica / Entrevista</span>
            <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Gestió <span className="text-cyan-600 uppercase">Entrevista</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-500">Conexió a la BBDD estable</span>
          </div>
          <button 
            onClick={onLoadMock}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white' : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white border border-cyan-100'}`}
          >
            <Wand2 size={16} /> Carregar Exemples
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* COLUMNA ESQUERRA: FORMULARI ALTA */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className={`p-8 rounded-[3rem] border-2 shadow-xl ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-cyan-500 text-white rounded-2xl shadow-lg shadow-cyan-500/20">
                   <Plus size={24} />
                </div>
                <h3 className={`text-xl font-black uppercase italic italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>Donar d'alta pregunta</h3>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Secció de l'entrevista</label>
                  <select 
                    value={nova.seccio}
                    onChange={e => setNova({...nova, seccio: e.target.value})}
                    className={`w-full p-5 rounded-2xl border-none outline-none font-bold text-sm appearance-none cursor-pointer ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}
                  >
                    {SECCIONS_ENTREVISTA.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1 tracking-widest">Enunciat de la pregunta</label>
                  <textarea 
                    required
                    rows={4}
                    value={nova.pregunta}
                    onChange={e => setNova({...nova, pregunta: e.target.value})}
                    placeholder="Ex: Què faria si veiés un company cometent una il·legalitat?"
                    className={`w-full p-5 rounded-2xl border-none outline-none font-bold text-sm resize-none ${darkMode ? 'bg-slate-900 text-white placeholder:text-slate-700' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-3xl font-black uppercase italic tracking-widest text-sm shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                >
                  Confirmar i Publicar
                </button>
             </form>
          </div>

          <div className={`p-8 rounded-[3rem] border-2 flex flex-col gap-4 ${darkMode ? 'bg-slate-900/40 border-slate-800/50' : 'bg-slate-50 border-slate-100'}`}>
             <div className="flex items-center gap-3">
               <Info size={18} className="text-cyan-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instruccions</span>
             </div>
             <p className="text-[11px] leading-relaxed text-slate-500 font-medium italic">
               Recorda que les preguntes han de ser representatives de situacions reals. Evita preguntes redundants dins d'una mateixa secció.
             </p>
          </div>
        </div>

        {/* COLUMNA DRETA: BANC DE PREGUNTES */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className={`p-8 rounded-[3rem] border-2 flex flex-col gap-8 ${darkMode ? 'bg-slate-900/20 border-slate-800/50' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-2xl">
                   <MessageSquare size={20} />
                </div>
                <div>
                   <h3 className={`text-2xl font-black uppercase tracking-tighter italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>Banc de preguntes</h3>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mostrant {preguntesFiltrades.length} de {preguntes.length} preguntes</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 min-w-[250px]">
                 <div className={`flex items-center gap-3 w-full px-5 py-3 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Filter size={16} className="text-slate-400" />
                    <select 
                      value={filterSeccio}
                      onChange={e => setFilterSeccio(e.target.value)}
                      className="bg-transparent border-none outline-none font-bold text-[11px] uppercase tracking-tighter w-full text-slate-500"
                    >
                      <option>Totes les seccions</option>
                      {SECCIONS_ENTREVISTA.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {preguntesFiltrades.map((q: any) => (
                <div key={q.id} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between gap-8 group ${darkMode ? 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50' : 'bg-white border-slate-100 hover:border-cyan-500 shadow-sm'}`}>
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${darkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                        {q.seccio}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic opacity-0 group-hover:opacity-100 transition-opacity">ID: {q.id}</span>
                    </div>
                    <h4 className={`text-lg font-bold italic tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      "{q.pregunta}"
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={() => onDelete(`preguntes_entrevista/${q.id}`, q.id)}
                      className="p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={24} />
                    </button>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${darkMode ? 'bg-slate-900/60 text-cyan-400' : 'bg-slate-50 text-slate-300 group-hover:text-cyan-500 group-hover:bg-cyan-50'}`}>
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </div>
              ))}

              {preguntesFiltrades.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-center px-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                  <MessageSquare size={56} className="text-slate-200 dark:text-slate-800 mb-8" />
                  <p className="font-black uppercase italic tracking-widest text-[11px] text-slate-400">No s'ha trobat cap pregunta en aquesta secció</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
function ActualitatView({ actualitats, novaActualitat, setNovaActualitat, onSubmit, onDelete, loading, success, darkMode, onLoadMock, userRol }: any) {
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
                    {userRol !== "admin_master" && userRol !== "admin" && (
                      <div className="p-4 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold leading-relaxed">
                        Atenció! Tens el rol "{userRol}". No disposes de permís actiu per crear, publicar o llançar dades d'actualitat als opositors en aquest moment.
                      </div>
                    )}
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
function ActualitatPreguntesView({ actualitats, novaActualitat, setNovaActualitat, onSubmit, onDelete, loading, success, darkMode, userRol }: any) {
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
                     {userRol !== "admin_master" && userRol !== "admin" && (
                       <div className="p-4 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold leading-relaxed">
                         Atenció! Tens el rol "{userRol}". No disposes de permís actiu per crear, publicar o llançar preguntes d'actualitat als opositors en aquest moment.
                       </div>
                     )}
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
/**
 * VIEW: Gestió d'Exercicis Físics
 * Permet donar d'alta els tipus d'exercicis (LEGO) que s'usaran en els plans.
 */
function ExercicisFisicsView({ exercicis, nouExercici, setNouExercici, onSubmit, onLoadMock, onDelete, loading, success, darkMode }: any) {
  const [extraFiltre, setExtraFiltre] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between w-full">
        <div className="flex items-center gap-10">
          <BackButton darkMode={darkMode} />
          <div>
            <span className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice / Prova Física</span>
            <h1 className={`text-4xl font-black tracking-tight mt-1 uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Gestió d'<span className="text-emerald-600">Exercicis</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {success && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"
            >
              ✓ Actualitzat
            </motion.div>
          )}
          <button 
            onClick={onLoadMock}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100'}`}
          >
            <Wand2 size={16} /> Test ( No BBDD )
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* FORMULARI O BOTÓ D'OBRIR */}
        <div className="lg:col-span-5 flex flex-col gap-4">
           {!isFormOpen ? (
             <button 
               onClick={() => setIsFormOpen(true)}
               className={`w-full p-8 rounded-[2.5rem] border-2 border-dashed flex items-center justify-between group transition-all ${darkMode ? 'bg-slate-800/20 border-slate-700 hover:border-emerald-500 hover:bg-slate-800/40' : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5'}`}
             >
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Plus size={28} strokeWidth={3} />
                   </div>
                   <div className="text-left">
                      <h3 className={`text-xl font-black uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>Afegir Exercici</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nou component local o BBDD</p>
                   </div>
                </div>
                <ChevronRight size={24} className={`text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1`} />
             </button>
           ) : (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className={`p-8 rounded-[2.5rem] border-2 shadow-2xl relative ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}
             >
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                   <X size={20} />
                </button>

                <h3 className={`text-xl font-black uppercase italic mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Nou Exercici</h3>
                
                <form onSubmit={(e) => { onSubmit(e); setIsFormOpen(false); }} className="flex flex-col gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nom de l'exercici</label>
                    <input 
                      required
                      value={nouExercici.nom}
                      onChange={e => setNouExercici({...nouExercici, nom: e.target.value})}
                      placeholder="Ex: Sèries de velocitat 20m"
                      className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Categoria de Prova</label>
                    <select 
                      value={nouExercici.categoria}
                      onChange={e => setNouExercici({...nouExercici, categoria: e.target.value})}
                      className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none cursor-pointer ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}
                    >
                      <option value="Course Navette">Course Navette</option>
                      <option value="Circuit Agilitat">Circuit Agilitat</option>
                      <option value="Press de Banca">Press de Banca</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Temps / Repeticions</label>
                    <input 
                      required
                      value={nouExercici.temps}
                      onChange={e => setNouExercici({...nouExercici, temps: e.target.value})}
                      placeholder="Ex: 30 segons"
                      className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}
                    />
                  </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">URL Imatge / Vídeo (Placeholder)</label>
                  <input 
                    required
                    value={nouExercici.imatge}
                    onChange={e => setNouExercici({...nouExercici, imatge: e.target.value})}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>

                {/* CONSELLS TÈCNICS */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Consells Tècnics (3 punts)</label>
                  {nouExercici.consells.map((c: string, idx: number) => (
                    <input 
                      key={idx}
                      required
                      value={c}
                      onChange={e => {
                        const newConsells = [...nouExercici.consells];
                        newConsells[idx] = e.target.value;
                        setNouExercici({...nouExercici, consells: newConsells});
                      }}
                      placeholder={`Consell ${idx + 1}...`}
                      className={`w-full p-3 rounded-xl border-none outline-none text-xs font-medium ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}
                    />
                  ))}
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className={`w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase italic tracking-widest transition-all active:scale-95 shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3`}
                >
                  {loading ? "Processant..." : <><Activity size={18} /> Registrar Exercici</>}
                </button>
                {success && <p className="text-emerald-500 text-[10px] font-black uppercase text-center mt-2">✓ Exercici creat correctament</p>}
              </form>
             </motion.div>
           )}
        </div>

        {/* BANC D'EXERCICIS AMB FILTRES */}
        <div className="lg:col-span-7">
           <div className={`p-6 rounded-[2.5rem] border-2 flex flex-col gap-6 h-full ${darkMode ? 'bg-slate-800/20 border-slate-700/50' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50'}`}>
              
              {/* CAPÇALERA BANC COMPACTA */}
              <div className="flex flex-col gap-4 border-b border-slate-500/10 pb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                       <Filter size={20} />
                    </div>
                    <div>
                       <h3 className={`text-lg font-black uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>Banc d'Exercicis</h3>
                    </div>
                 </div>

                 {/* FILTRES D'ESTIL COMPACTE */}
                 <div className="flex flex-wrap items-center gap-1.5">
                    {["Tots", "Course Navette", "Circuit Agilitat", "Press de Banca"].map((cat) => (
                       <button
                         key={cat}
                         onClick={() => setExtraFiltre(cat === "Tots" ? "" : cat)}
                         className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            (cat === "Tots" ? extraFiltre === "" : extraFiltre === cat)
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                            : darkMode ? 'bg-slate-900 text-slate-500 hover:text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                         }`}
                       >
                         {cat}
                       </button>
                    ))}
                 </div>
              </div>

              {/* LLISTAT COMPACTE */}
              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                 {exercicis
                   .filter((ex: any) => extraFiltre === "" ? true : ex.categoria === extraFiltre)
                   .length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                       <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-800 mb-4">
                          <Dumbbell size={32} />
                       </div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Cap exercici trobat per aquest filtre</p>
                       <button 
                         onClick={onLoadMock}
                         className="px-4 py-2 bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                       >
                         Carregar exercicis de prova
                       </button>
                    </div>
                   ) : (
                    exercicis
                      .filter((ex: any) => extraFiltre === "" ? true : ex.categoria === extraFiltre)
                      .map((ex: any) => (
                        <div key={ex.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900/30 border-transparent hover:border-slate-700' : 'bg-slate-50/50 border-transparent hover:border-slate-100'}`}>
                           <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                                 <img src={ex.imatge} className="w-full h-full object-cover opacity-60" />
                              </div>
                              <div className="min-w-0">
                                 <h4 className={`font-black uppercase italic text-xs truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{ex.nom}</h4>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-bold text-emerald-500 uppercase">{ex.categoria}</span>
                                    <span className="text-[8px] font-medium text-slate-400 uppercase">{ex.temps}</span>
                                 </div>
                              </div>
                           </div>
                           <button 
                             onClick={() => onDelete(`exercicis_fisics/${ex.id}`, ex.id)}
                             className={`p-2 rounded-lg transition-all shrink-0 ${darkMode ? 'hover:bg-red-500/20 text-slate-600 hover:text-red-400' : 'hover:bg-red-50 text-slate-300 hover:text-red-500'}`}
                           >
                              <Trash2 size={14} />
                           </button>
                        </div>
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
 * VIEW: Gestió de Plans d'Entrenament
 * Permet combinar exercicis existents en una setmana específica per a una prova.
 */
function PlansEntrenamentView({ plans, exercicisDisponibles, nouPla, setNouPla, onSubmit, onLoadMock, onDelete, loading, success, darkMode }: any) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between w-full">
        <div className="flex items-center gap-10">
          <BackButton darkMode={darkMode} />
          <div>
            <span className="text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice / Prova Física</span>
            <h1 className={`text-4xl font-black tracking-tight mt-1 uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Plans d'<span className="text-emerald-600">Entrenament</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {success && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20"
             >
               ✓ Pla Publicat
             </motion.div>
           )}
           <button 
             onClick={onLoadMock}
             disabled={loading}
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100'}`}
           >
             <Wand2 size={16} /> Test ( No BBDD )
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* FORMULARI O BOTÓ D'OBRIR */}
        <div className="lg:col-span-5 flex flex-col gap-4">
           {!isFormOpen ? (
              <button 
                onClick={() => setIsFormOpen(true)}
                className={`w-full p-8 rounded-[2.5rem] border-2 border-dashed flex items-center justify-between group transition-all ${darkMode ? 'bg-slate-800/20 border-slate-700 hover:border-emerald-500 hover:bg-slate-800/40' : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5'}`}
              >
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                       <Plus size={28} strokeWidth={3} />
                    </div>
                    <div className="text-left">
                       <h3 className={`text-xl font-black uppercase italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>Afegir Pla</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Combinació local d'exercicis</p>
                    </div>
                 </div>
                 <ChevronRight size={24} className={`text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-1`} />
              </button>
           ) : (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className={`p-8 rounded-[2.5rem] border-2 shadow-2xl relative ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}
             >
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                   <X size={20} />
                </button>

                <h3 className={`text-xl font-black uppercase italic mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Nou Pla Setmanal</h3>
                
                <form onSubmit={(e) => { onSubmit(e); setIsFormOpen(false); }} className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Setmana núm.</label>
                        <input 
                          type="number"
                          min="1"
                          max="52"
                          required
                          value={nouPla.setmana}
                          onChange={e => setNouPla({...nouPla, setmana: parseInt(e.target.value)})}
                          className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Prova</label>
                        <select 
                          value={nouPla.tipusProva}
                          onChange={e => setNouPla({...nouPla, tipusProva: e.target.value})}
                          className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none cursor-pointer ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}
                        >
                          <option value="Course Navette">Course Navette</option>
                          <option value="Circuit Agilitat">Circuit Agilitat</option>
                          <option value="Press de Banca">Press de Banca</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 flex items-center justify-between">
                        Exercicis del pla (Select Multip)
                        <span className="text-[8px] opacity-50 italic">Tria per ordre d'execució</span>
                     </label>
                     
                     <div className={`grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto p-2 rounded-2xl ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                        {exercicisDisponibles.length === 0 ? (
                          <p className="p-4 text-[10px] text-center opacity-30 uppercase font-bold uppercase tracking-widest">No hi ha exercicis creats!</p>
                        ) : (
                          exercicisDisponibles.map((ex: any) => {
                            const isSelected = nouPla.exercicisIds.includes(ex.id);
                            return (
                              <button
                                key={ex.id}
                                type="button"
                                onClick={() => {
                                  const ids = isSelected 
                                    ? nouPla.exercicisIds.filter((id: string) => id !== ex.id)
                                    : [...nouPla.exercicisIds, ex.id];
                                  setNouPla({...nouPla, exercicisIds: ids});
                                }}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                  isSelected 
                                    ? 'bg-emerald-600 border-emerald-500 text-white' 
                                    : darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-600'
                                }`}
                              >
                                 <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-white text-emerald-600 border-white' : 'border-slate-500'}`}>
                                    {isSelected && <Check size={14} strokeWidth={4} />}
                                 </div>
                                 <span className="text-[11px] font-black uppercase truncate">{ex.nom}</span>
                              </button>
                            );
                          })
                        )}
                     </div>
                  </div>

                  <button 
                    disabled={loading || nouPla.exercicisIds.length === 0}
                    type="submit"
                    className={`w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3`}
                  >
                    {loading ? "Processant..." : <><Calendar size={18} /> Publicar Pla</>}
                  </button>
                  {success && <p className="text-emerald-500 text-[10px] font-black uppercase text-center mt-2">✓ Pla publicat amb èxit</p>}
                </form>
             </motion.div>
           )}
        </div>

        {/* LLISTAT DE PLANS PUBLICATS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <h3 className={`text-base font-black uppercase tracking-widest px-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Banc de Plans Publicats</h3>
           
           <div className="flex flex-col gap-4">
              {plans.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 px-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                   <Calendar size={48} className="text-slate-300 dark:text-slate-700 mb-6" />
                   <p className="font-black uppercase italic tracking-widest text-xs mb-6">No hi ha plans publicats encara</p>
                   <button 
                     onClick={onLoadMock}
                     className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
                   >
                     Generar plans de prova ràpidament
                   </button>
                </div>
              ) : (
                plans.map((p: any) => (
                  <div key={p.id} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col gap-6 group ${darkMode ? 'bg-slate-800 border-slate-700/50 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-500 shadow-sm shadow-slate-200/50'}`}>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                              <Calendar size={24} />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">SETMANA {p.setmana}</span>
                                 <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.tipusProva}</span>
                              </div>
                              <h4 className={`text-lg font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                 Rutina de {p.exercicisIds?.length || 0} exercicis
                              </h4>
                           </div>
                        </div>
                        <button 
                           onClick={() => onDelete(`plans_entrenament/${p.id}`, p.id)}
                           className={`p-3 rounded-xl transition-all ${darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-400 hover:bg-red-500 hover:text-white'}`}
                        >
                           <Trash2 size={18} />
                        </button>
                     </div>

                     {/* MINI LLISTAT D'EXERCICIS DINS EL PLA */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        {p.exercicisIds?.map((exId: string, idx: number) => {
                           const ex = exercicisDisponibles.find((e: any) => e.id === exId);
                           if (!ex) return null;
                           return (
                              <div key={exId} className={`flex items-center gap-3 p-2 rounded-xl ${darkMode ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
                                 <span className="text-[10px] font-black text-emerald-500 w-4">{idx + 1}</span>
                                 <span className={`text-[10px] font-bold uppercase truncate ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{ex.nom}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function GimnasosView({ gimnasos, onDelete, onAdd, onLoadMock, darkMode }: any) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const isAltaMode = mode === 'alta';

  const [nouGimnas, setNouGimnas] = useState({ 
    nom: "", 
    imatges: [] as string[], 
    descripcio: "", 
    entrenament: [] as string[], 
    preus: "", 
    telefon: "", 
    correu: "", 
    provincia: "", 
    comarca: "", 
    municipi: "", 
    infoPrivada: "" 
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filtreProvincia, setFiltreProvincia] = useState("");
  const [filtreEntrenament, setFiltreEntrenament] = useState("");
  const [urlImatge, setUrlImatge] = useState("");

  const provincias = ["Barcelona", "Girona", "Lleida", "Tarragona"];
  const modalitats = ["Circuit Agilitat", "Course Navette", "Press de Banca"];

  const toggleEntrenament = (mod: string) => {
    setNouGimnas(prev => ({
      ...prev,
      entrenament: prev.entrenament.includes(mod)
        ? prev.entrenament.filter(m => m !== mod)
        : [...prev.entrenament, mod]
    }));
  };

  const addImatge = () => {
    if (urlImatge.trim()) {
      setNouGimnas(prev => ({ ...prev, imatges: [...prev.imatges, urlImatge] }));
      setUrlImatge("");
    }
  };

  const removeImatge = (index: number) => {
    setNouGimnas(prev => ({
      ...prev,
      imatges: prev.imatges.filter((_, i) => i !== index)
    }));
  };

  const gimnasosFiltrats = gimnasos.filter((g: any) => {
    const matchProvincia = filtreProvincia === "" || g.provincia === filtreProvincia;
    const matchEntrenament = filtreEntrenament === "" || g.entrenament?.includes(filtreEntrenament);
    return matchProvincia && matchEntrenament;
  });

  const comarquesDisponibles = nouGimnas.provincia ? Object.keys(DATA_CATALUNYA[nouGimnas.provincia as keyof typeof DATA_CATALUNYA] || {}) : [];
  const municipisDisponibles = (nouGimnas.provincia && nouGimnas.comarca) ? (DATA_CATALUNYA[nouGimnas.provincia as keyof typeof DATA_CATALUNYA]?.[nouGimnas.comarca] || []) : [];

  const FormContent = () => (
    <form onSubmit={async (e) => { e.preventDefault(); await onAdd(nouGimnas); setIsFormOpen(false); if (isAltaMode) navigate('/admin/gimnasos'); }} className="space-y-8">
      {/* SECCIÓ 1: DADES BÀSIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 px-1">Nom del centre</label>
          <input 
            required
            value={nouGimnas.nom}
            onChange={e => setNouGimnas({...nouGimnas, nom: e.target.value})}
            placeholder="Ex: Eurofitness Sant Cugat"
            className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 px-1">Tipus d'entrenament disponible</label>
          <div className="flex flex-wrap gap-2">
              {modalitats.map(mod => {
                const isSelected = nouGimnas.entrenament.includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleEntrenament(mod)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${
                      isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-transparent border-slate-200 text-slate-400'
                    }`}
                  >
                    {mod}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* SECCIÓ 2: LOCALITZACIÓ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 px-1">Província</label>
          <select 
            required
            value={nouGimnas.provincia}
            onChange={e => setNouGimnas({...nouGimnas, provincia: e.target.value, comarca: "", municipi: ""})}
            className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
          >
            <option value="">Selecciona província</option>
            {Object.keys(DATA_CATALUNYA).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 px-1">Comarca</label>
          <select 
            required
            disabled={!nouGimnas.provincia}
            value={nouGimnas.comarca}
            onChange={e => setNouGimnas({...nouGimnas, comarca: e.target.value, municipi: ""})}
            className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none transition-all ${!nouGimnas.provincia ? 'opacity-30' : ''} ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
          >
            <option value="">Selecciona comarca</option>
            {comarquesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 px-1">Municipi</label>
          <select 
            required
            disabled={!nouGimnas.comarca}
            value={nouGimnas.municipi}
            onChange={e => setNouGimnas({...nouGimnas, municipi: e.target.value})}
            className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none transition-all ${!nouGimnas.comarca ? 'opacity-30' : ''} ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
          >
            <option value="">Selecciona municipi</option>
            {municipisDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* SECCIÓ 3: CONTACTE I PREUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-6">
          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 px-1">Telèfon de contacte</label>
              <input 
                value={nouGimnas.telefon}
                onChange={e => setNouGimnas({...nouGimnas, telefon: e.target.value})}
                placeholder="Ex: 93 XXXXXXX"
                className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
              />
          </div>
          <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 px-1">Correu electrònic</label>
              <input 
                value={nouGimnas.correu}
                onChange={e => setNouGimnas({...nouGimnas, correu: e.target.value})}
                placeholder="Ex: hola@gimnas.com"
                className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
              />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 px-1">Preus i Tarifes</label>
          <textarea 
              value={nouGimnas.preus}
              onChange={e => setNouGimnas({...nouGimnas, preus: e.target.value})}
              placeholder="Detalla els packs, matrícules o preus per sessió..."
              className={`w-full h-[140px] p-4 rounded-2xl border-none outline-none font-bold text-sm resize-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
          />
        </div>
      </div>

      {/* SECCIÓ 4: DESCRIPCIÓ I IMATGES */}
      <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 px-1">Descripció del centre</label>
          <textarea 
            value={nouGimnas.descripcio}
            onChange={e => setNouGimnas({...nouGimnas, descripcio: e.target.value})}
            placeholder="Breu descripció del gimnàs i les seves instal·lacions..."
            className={`w-full h-24 p-4 rounded-2xl border-none outline-none font-bold text-sm resize-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
          />
        </div>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 px-1">Imatges del centre (URLs)</label>
          <div className="flex gap-2">
            <input 
              value={urlImatge}
              onChange={e => setUrlImatge(e.target.value)}
              placeholder="Afegeix URL de la imatge..."
              className={`flex-1 p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
            />
            <button 
              type="button"
              onClick={addImatge}
              className="px-6 bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-slate-700 transition-all"
            >
              Afegir
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {nouGimnas.imatges.map((img, idx) => (
              <div key={idx} className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeImatge(idx)}
                  className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓ 5: INFO PRIVADA */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500 px-1">
          <LockIcon size={12} /> Informació Privada (Només per a nosaltres)
        </label>
        <textarea 
          value={nouGimnas.infoPrivada}
          onChange={e => setNouGimnas({...nouGimnas, infoPrivada: e.target.value})}
          placeholder="Comentaris sobre comissionat, tracte especial, acords de pagament, etc."
          className={`w-full h-24 p-4 rounded-2xl border-none outline-none font-bold text-[11px] resize-none ${darkMode ? 'bg-amber-500/5 text-amber-500' : 'bg-amber-50 text-amber-900'}`}
        />
      </div>

      <button 
        type="submit"
        className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black uppercase italic tracking-widest text-lg shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 transition-all"
      >
        Registrar Gimnàs i Publicar
      </button>
    </form>
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <BackButton darkMode={darkMode} />
          <div>
            <span className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice / Prova Física</span>
            <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {isAltaMode ? 'Alta de ' : 'Gestió de '} 
              <span className="text-emerald-500 uppercase">Gimnasos</span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onLoadMock}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100'}`}
          >
            <Wand2 size={16} /> Test ( No BBDD )
          </button>
          {!isAltaMode && (
            <button 
              onClick={() => setIsFormOpen(true)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'}`}
            >
              <Plus size={16} /> Donar d'alta un gimnàs nou
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* CAS 1: MODE ALTA DIRECTA (SENSE MODAL) */}
        {isAltaMode ? (
          <div className="lg:col-span-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className={`rounded-[3rem] border p-12 shadow-xl ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              <div className="mb-10 flex items-center justify-between">
                 <div>
                   <span className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">Registre d'instal·lació</span>
                   <h3 className="text-3xl font-black uppercase italic mt-1">Nou Gimnàs Col·laborador</h3>
                 </div>
                 <Link 
                   to="/admin/gimnasos"
                   className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                 >
                   Veure banc de gimnasos
                 </Link>
              </div>
              <FormContent />
            </motion.div>
          </div>
        ) : (
          <>
            {/* CAS 2: BANC DE GIMNASOS EXISTENT AMB FILTRES I OPCIÓ DE MODAL SI ES VOL */}
            <AnimatePresence>
              {isFormOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] border p-10 shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                  >
                    <button 
                      onClick={() => setIsFormOpen(false)}
                      className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={24} />
                    </button>

                    <div className="mb-10">
                       <span className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">Registre d'instal·lació</span>
                       <h3 className="text-2xl font-black uppercase italic mt-1">Nou Gimnàs Col·laborador</h3>
                    </div>
                    <FormContent />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="lg:col-span-12 flex flex-col gap-8">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                  <h3 className={`text-base font-black uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Banc de gimnasos existent</h3>
                  
                  <div className="flex flex-wrap items-center gap-4">
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">Província:</span>
                        <select 
                           value={filtreProvincia}
                           onChange={e => setFiltreProvincia(e.target.value)}
                           className={`px-4 py-2 rounded-xl border-none outline-none font-bold text-[10px] uppercase tracking-tighter ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}
                        >
                           <option value="">Totes</option>
                           {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">Entrenament:</span>
                        <select 
                           value={filtreEntrenament}
                           onChange={e => setFiltreEntrenament(e.target.value)}
                           className={`px-4 py-2 rounded-xl border-none outline-none font-bold text-[10px] uppercase tracking-tighter ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}
                        >
                           <option value="">Tots</option>
                           {modalitats.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                  {gimnasosFiltrats.map((g: any) => (
                    <div key={g.id} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col gap-6 group ${darkMode ? 'bg-slate-800 border-slate-700/50 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-500 shadow-sm shadow-slate-200/50'}`}>
                       {/* CAPÇALERA CARD */}
                       <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                             <div className={`w-16 h-16 rounded-3xl overflow-hidden shrink-0 border-2 ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
                                {g.imatges?.[0] ? (
                                   <img src={g.imatges[0]} alt={g.nom} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                      <Dumbbell size={24} />
                                   </div>
                                )}
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded-md">{g.provincia}</span>
                                   <span className="text-slate-300 dark:text-slate-600">•</span>
                                   <span className="text-[9px] font-bold text-slate-400 uppercase">{g.municipi}</span>
                                </div>
                                <h4 className={`text-lg font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>{g.nom}</h4>
                             </div>
                          </div>
                          <button 
                            onClick={() => onDelete(`gimnasos/${g.id}`, g.id)}
                            className={`p-3 rounded-xl transition-all ${darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-400 hover:bg-red-500 hover:text-white'}`}
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>

                       {/* CONTINGUT CARD */}
                       <div className="space-y-4">
                          <div className="flex flex-wrap gap-1.5">
                             {g.entrenament?.map((mod: string) => (
                               <span key={mod} className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-[8px] font-black uppercase text-slate-500">{mod}</span>
                             ))}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-50 dark:border-slate-700/50">
                             <div className="flex items-center gap-2 opacity-60">
                                <Phone size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-bold">{g.telefon || "Sense tlf"}</span>
                             </div>
                             <div className="flex items-center gap-2 opacity-60">
                                <Mail size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-bold truncate">{g.correu || "Sense correu"}</span>
                             </div>
                          </div>

                          {g.preus && (
                            <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
                               <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Tarifes i Preus</span>
                               <p className="text-[10px] font-medium leading-relaxed line-clamp-2">{g.preus}</p>
                            </div>
                          )}
                          
                          {g.infoPrivada && (
                            <div className="flex items-center gap-2 p-2 px-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                               <LockIcon size={10} className="text-amber-500" />
                               <span className="text-[8px] font-black uppercase text-amber-600">Info Interna Disponible</span>
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                  
                  {gimnasosFiltrats.length === 0 && (
                    <div className="lg:col-span-3 py-20 flex flex-col items-center justify-center text-center px-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                       <Building2 size={48} className="text-slate-300 dark:text-slate-700 mb-6" />
                       <p className="font-black uppercase italic tracking-widest text-[10px] text-slate-400 mb-6">No hi ha cap gimnàs registrat encara</p>
                       <button 
                         onClick={onLoadMock}
                         className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
                       >
                         Carregar gimnasos de prova
                       </button>
                    </div>
                  )}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * VIEW: Gestió de Cites d'Usuari (Llista simple)
 */
function ReservesUsuariView({ reserves, onUpdateStatus, onSeedData, darkMode }: any) {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <BackButton darkMode={darkMode} />
          <div>
            <span className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice / Serveis / Cites</span>
            <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Cites <span className="text-emerald-600 uppercase">Usuaris</span>
            </h1>
          </div>
        </div>
        <button 
          onClick={onSeedData}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'}`}
        >
          <Wand2 size={16} /> Generar Cites de Prova
        </button>
      </header>

      <div className={`rounded-[3rem] border-2 overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-xl'}`}>
        <table className="w-full text-left">
          <thead>
            <tr className={`border-b text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
              <th className="p-8">Usuari</th>
              <th className="p-8">Data i Hora</th>
              <th className="p-8">Estat</th>
              <th className="p-8 text-right">Accions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {reserves.map((r: any) => (
              <tr key={r.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                <td className="p-8">
                  <div className="flex flex-col">
                    <span className={`text-lg font-black italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>{r.usuariNom || "Candidat"}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.usuariEmail}</span>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase italic">{r.dataSessio ? new Date(r.dataSessio).toLocaleDateString('ca-ES', { day: '2-digit', month: 'long' }) : "Pendent"}</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                       {r.dataSessio ? new Date(r.dataSessio).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                    </span>
                  </div>
                </td>
                <td className="p-8">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    r.estat === 'confirmada' ? 'bg-emerald-500/10 text-emerald-500' : 
                    r.estat === 'cancel·lada' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {r.estat || 'pendent'}
                  </span>
                </td>
                <td className="p-8 text-right space-x-2">
                   <button onClick={() => onUpdateStatus(r.id, 'confirmada')} className="p-3 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all" title="Confirmar"><UserCheck size={20} /></button>
                   <button onClick={() => onUpdateStatus(r.id, 'cancel·lada')} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Anul·lar"><UserX size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reserves.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-50">
            <Calendar size={48} className="mb-4" />
            <p className="font-black uppercase italic tracking-widest text-xs">No hi ha cites registrades</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VIEW: Gestió de Psicòlegs (Assignació i Detalls)
 */
function GestioPsicolegsView({ reserves, fetchData, onSeedData, darkMode }: any) {
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
  const [psicolegs] = useState([
    "Aleix Romeo Pociello",
    "Maria Blazquez Godia"
  ]);

  // Filtrar reserves pel dia seleccionat
  const reservesDia = reserves.filter((r: any) => {
    // Intentem parsejar la data segons el format que tinguem
    let rDateStr = "";
    
    // Si és un objecte Date (mock data createdAt o r.data)
    if (r.dataSessio && typeof r.dataSessio === 'string') {
      // Per dades ISO: 2024-05-18T10:00:00.000Z
      // Hem de ser curosos amb el timezone si volem "Local Date"
      const d = new Date(r.dataSessio);
      rDateStr = getLocalDateString(d);
    } else if (r.data instanceof Date) {
      rDateStr = getLocalDateString(r.data);
    } else if (r.data && r.data.toDate) {
      rDateStr = getLocalDateString(r.data.toDate());
    }
    
    return rDateStr === selectedDate;
  });

  const handleAssignPsicolog = async (reservaId: string, psicoleg: string) => {
    if (reservaId.startsWith('mock-')) {
      alert(`Simulació: Assignant psicòleg ${psicoleg} a la cita local.`);
      // O podríem actualitzar l'estat localment si volguéssim fer-ho més pro
      return;
    }
    try {
      const resRef = doc(db, "reserves_psicologia", reservaId);
      await updateDoc(resRef, { psicoleg: psicoleg });
      fetchData();
    } catch (error) {
      console.error("Error assignant psicòleg:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-10">
          <BackButton darkMode={darkMode} />
          <div>
            <span className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice / Serveis / Psicologia</span>
            <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Gestió <span className="text-emerald-600 uppercase">Cites</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onSeedData(selectedDate)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all mr-4 ${darkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'}`}
          >
            <Wand2 size={16} /> Cites de Prova
          </button>

          <div className={`px-6 py-3 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <span className="text-[10px] font-black uppercase text-slate-400">Selecciona Dia:</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`bg-transparent border-none outline-none font-black text-sm uppercase cursor-pointer ${darkMode ? 'text-white' : 'text-slate-800'}`}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* COLUMNA ESQUERRA: RESUM O INFO */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <div className={`p-8 rounded-[2.5rem] border-2 ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100 shadow-sm'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                  <Calendar size={24} />
                </div>
                <h3 className={`text-lg font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-emerald-900'}`}>{selectedDate}</h3>
              </div>
              <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-6">Resum de la jornada</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-slate-400">CITES AVUI:</span>
                  <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{reservesDia.length}</span>
                </div>
              </div>
           </div>

           <div className={`p-8 rounded-[2.5rem] border-2 ${darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-100 shadow-sm'}`}>
              <h4 className="text-[10px] font-black uppercase text-slate-500 mb-6 tracking-widest px-2">Psicòlegs Actius</h4>
              <div className="space-y-4">
                {psicolegs.map(p => (
                  <div key={p} className={`flex items-center gap-4 p-3 rounded-2xl ${darkMode ? 'bg-slate-900/40 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold">{p}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* COLUMNA DRETA: LLISTAT DE CITES */}
        <div className="lg:col-span-9 flex flex-col gap-6">
           <div className={`p-8 rounded-[3rem] border-2 flex flex-col gap-8 ${darkMode ? 'bg-slate-900/40 border-slate-800/50' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex items-center justify-between px-2">
                <h3 className={`text-2xl font-black uppercase tracking-tighter italic ${darkMode ? 'text-white' : 'text-slate-800'}`}>Cites Programades</h3>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase rounded-full">Total: {reservesDia.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {reservesDia.map((r: any) => {
                  let hora = "Pendent";
                  if (r.data instanceof Date) {
                    hora = r.data.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
                  } else if (r.data && r.data.toDate) {
                    hora = r.data.toDate().toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
                  } else if (r.dataSessio) {
                    const d = new Date(r.dataSessio);
                    hora = d.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
                  }

                  return (
                    <div key={r.id} className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col gap-8 group ${darkMode ? 'bg-slate-800 border-slate-700/50 hover:border-emerald-500/50' : 'bg-slate-50/50 border-slate-100 hover:border-emerald-500 shadow-sm'}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${darkMode ? 'bg-slate-900 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm shadow-emerald-500/5 group-hover:shadow-emerald-500/20'}`}>
                            <span className="text-[10px] uppercase opacity-50 mb-1">HORA</span>
                            <span className="text-xl italic">{hora}</span>
                          </div>
                          <div>
                            <h4 className={`text-2xl font-black uppercase italic tracking-tighter leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{r.usuariNom || "Candidat sense nom"}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.usuariEmail || "sense email"}</p>
                               <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${r.estat === 'completada' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{r.estat || 'pendent'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                           <button 
                             onClick={() => alert('Generant i descarregant informe Biodata del candidat...')}
                             className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100'}`}
                           >
                              <FileDown size={18} /> descarregar PDF Biodata
                           </button>
                        </div>
                      </div>

                      <div className={`p-6 rounded-[2rem] border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-inner'}`}>
                         <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                               <Users size={18} />
                            </div>
                            <div>
                               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Assignació de Psicòleg responsable</span>
                               <p className="text-[11px] font-bold text-slate-400 italic">Assigna el professional que realitzarà la sessió</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-3">
                           <select 
                             value={r.psicoleg || ""}
                             onChange={(e) => handleAssignPsicolog(r.id, e.target.value)}
                             className={`min-w-[220px] px-6 py-3.5 rounded-2xl border-none outline-none font-black text-[11px] uppercase tracking-tighter appearance-none cursor-pointer transition-all ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800 hover:bg-slate-100 shadow-sm'}`}
                           >
                             <option value="">-- No assignat encara --</option>
                             {psicolegs.map(p => <option key={p} value={p}>{p}</option>)}
                           </select>
                           
                           {r.psicoleg && (
                             <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in">
                               <Check size={20} />
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                  );
                })}

                {reservesDia.length === 0 && (
                  <div className="py-24 flex flex-col items-center justify-center text-center px-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                    <Calendar size={56} className="text-slate-200 dark:text-slate-800 mb-8" />
                    <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-500 mb-2">No hi ha cites per aquest dia</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selecciona una altra data al calendari superior</p>
                  </div>
                )}
              </div>
           </div>
        </div>
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

/**
 * VIEW: Gestió d'Usuaris i Opositors
 */
function UsuarisView({ usuaris, onUpdateUser, onAddMockUser, darkMode }: any) {
  const [filterName, setFilterName] = useState("");
  const [filterRol, setFilterRol] = useState("all");
  const [filterEstatSubscripcio, setFilterEstatSubscripcio] = useState("all");
  const [filterPagament, setFilterPagament] = useState("all");

  // Comentari planer per a no-programadors:
  // Llista legible dels noms en català per als 10 rols que gestionem a l'aplicació.
  const ROLS_NOMS_CAT: any = {
    admin_master: "Admin Master",
    admin: "Administrador / Soci",
    tester: "Tester / Provador",
    treballador_nivell_1: "Treballador Nivell 1",
    treballador_nivell_2: "Treballador Nivell 2",
    treballador_nivell_3: "Treballador Nivell 3",
    usuari: "Usuari Opositor",
    usuari_free_trial: "Usuari Prova (Free trial)",
    usuari_bannejat: "Usuari Bannejat",
    usuari_sospitos: "Usuari Sospitós",
    opositor: "Usuari Opositor"
  };

  // Comentari planer per a no-programadors:
  // Tria els colors visuals que s'assignaran al pin o etiqueta de cada usuari segons el seu nivell de permisos.
  function getRolBadgeStyle(rol: string) {
    switch (rol) {
      case 'admin_master':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'admin':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'tester':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'treballador_nivell_1':
      case 'treballador_nivell_2':
      case 'treballador_nivell_3':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'usuari':
      case 'opositor':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'usuari_free_trial':
        return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      case 'usuari_bannejat':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'usuari_sospitos':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-700/20';
    }
  }

  // Comentari planer per a no-programadors:
  // Aquest formatador descodifica de forma segura el format en què Firestore guarda les dates
  // (ja sigui com a text normal, segons de Firebase o un objecte data, evitant que la web peti).
  function renderFormatDate(dateVal: any, incloureHora: boolean = false) {
    if (!dateVal) return "Sense registre de data";
    
    // Si ja és una cadena text formatejada des de la base de dades
    if (typeof dateVal === 'string' && dateVal.includes(' de ')) {
      return dateVal;
    }

    try {
      let d: Date | null = null;
      if (dateVal && typeof dateVal === 'object') {
        if (typeof dateVal.toDate === 'function') {
          d = dateVal.toDate();
        } else if (dateVal instanceof Date) {
          d = dateVal;
        } else if (dateVal.seconds) {
          d = new Date(dateVal.seconds * 1000);
        } else if (dateVal._seconds) {
          d = new Date(dateVal._seconds * 1000);
        }
      }
      
      if (!d) {
        d = new Date(dateVal);
      }
      
      if (!d || isNaN(d.getTime())) {
        if (typeof dateVal === 'string') return dateVal;
        return "Format data no vàlid";
      }
      
      const opcions: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      };

      if (incloureHora) {
        opcions.hour = '2-digit';
        opcions.minute = '2-digit';
      }
      
      return d.toLocaleDateString('ca-ES', opcions);
    } catch (e) {
      if (typeof dateVal === 'string') return dateVal;
      return "S/D";
    }
  }

  // Comentari planer per a no-programadors:
  // Processem i purguem la llista en memòria per detectar quins usuaris tenen correus duplicats.
  // Quan en detectem de duplicats (p. ex., mateix mail via Google i contrasenya clàssica), ens quedem
  // amb la fitxa que té un rang d'administrador o que ha pagat / és activa, mantenint el darrer estat i conexió.
  const usuarisNetejatsDeDuplicats = useMemo(() => {
    const map = new Map<string, any>();
    
    if (!Array.isArray(usuaris)) return [];
    
    usuaris.forEach((u: any) => {
      if (!u) return;
      const emailNet = (u.email || "").toLowerCase().trim();
      
      // Si l'usuari no té correu registrat (extremadament rar), l'identifiquem pel seu ID de Firestore
      if (!emailNet) {
        const idAlt = u.uid || u.id || ("usuari_sense_mail_" + Math.random());
        map.set(idAlt, u);
        return;
      }
      
      const existent = map.get(emailNet);
      if (!existent) {
        map.set(emailNet, u);
      } else {
        // Mirem si un d'ells és administrador de debò o té l'estat d'accés autoritzat (activa)
        const existEsAdmin = existent.rol === 'admin';
        const uEsAdmin = u.rol === 'admin';
        const existEsActiva = existent.estatSubscripcio === 'activa';
        const uEsActiva = u.estatSubscripcio === 'activa';

        if ((uEsAdmin && !existEsAdmin) || (uEsActiva && !existEsActiva)) {
          // Reemplacem amb el perfil superior/legal oficial actiu
          map.set(emailNet, u);
        } else {
          // Comentari planer per a no-programadors:
          // Aquesta petita funció extreu i calcula els mil·lisegons d'una data de manera robusta
          const getSegons = (dateVal: any): number => {
            if (!dateVal) return 0;
            try {
              if (typeof dateVal === 'object') {
                if (typeof dateVal.toDate === 'function') return dateVal.toDate().getTime();
                if (dateVal.seconds) return dateVal.seconds * 1000;
                if (dateVal._seconds) return dateVal._seconds * 1000;
              }
              const parsed = new Date(dateVal).getTime();
              return isNaN(parsed) ? 0 : parsed;
            } catch (err) {
              return 0;
            }
          };
          
          const existTime = getSegons(existent.creatEl || existent.creatElTimestamp);
          const uTime = getSegons(u.creatEl || u.creatElTimestamp);
          if (uTime > existTime) {
            map.set(emailNet, u);
          }
        }
      }
    });
    
    return Array.from(map.values());
  }, [usuaris]);

  // Comentari planer per a no-programadors:
  // Aquest filtre exhaustiu s'executa ara sobre la llista neta de duplicats d'abans,
  // descartant al vol les cerques ràpides de l'usuari segons el rol, estat d'accés o cercador per text.
  const usuarisFiltrats = useMemo(() => {
    if (!Array.isArray(usuarisNetejatsDeDuplicats)) return [];
    
    return usuarisNetejatsDeDuplicats.filter((u: any) => {
      if (!u) return false;
      const nomSencer = String(u.displayName || "").toLowerCase();
      const correu = String(u.email || "").toLowerCase();
      const cerca = (filterName || "").toLowerCase();
      
      const coincideixNom = nomSencer.includes(cerca) || correu.includes(cerca);
      const coincideixRol = filterRol === "all" || u.rol === filterRol;
      const coincideixEstat = filterEstatSubscripcio === "all" || u.estatSubscripcio === filterEstatSubscripcio;
      
      let coincideixPagament = true;
      if (filterPagament === "pagat") {
        coincideixPagament = u.haPagat === true;
      } else if (filterPagament === "no_pagat") {
        coincideixPagament = u.haPagat !== true;
      }

      return coincideixNom && coincideixRol && coincideixEstat && coincideixPagament;
    });
  }, [usuarisNetejatsDeDuplicats, filterName, filterRol, filterEstatSubscripcio, filterPagament]);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <BackButton darkMode={darkMode} />
          <div>
            <span className="text-yellow-500 font-bold uppercase tracking-[0.2em] text-[10px]">Gestió de control d'alumnat</span>
            <h1 className={`text-4xl font-black mt-1 uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Llistat d' <span className="text-yellow-500">Usuaris</span>
            </h1>
          </div>
        </div>

        {/* Accions de prova de la base de dades */}
        <button
          onClick={onAddMockUser}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-900 font-extrabold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl shadow-xl shadow-yellow-500/10 transition-all hover:-translate-y-0.5"
        >
          <Plus size={16} />
          <span>Generar Usuari Prova</span>
        </button>
      </header>

      {/* Bloc de Filtres */}
      <div className={`p-6 sm:p-8 rounded-[2rem] border ${
        darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-slate-200'
      } flex flex-col gap-6`}>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
          <h3 className={`font-black text-xs uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Filtres de Cerca Actius</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Cerca de Text */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buscar per nom o correu</label>
            <input
              type="text"
              placeholder="Ex: Joan..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                darkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Filtre Rol - Comentari planer per a no-programadors:
              Ara hem afegit tots els 10 rols de l'organigrama als filtres. 
              D'aquesta manera es pot buscar o filtrar de cop quins usuaris són testers,
              quants tenen l'accés banejat o quins són treballadors de nivell 1, 2 o 3. */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrar per Rol</label>
            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                darkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Tots els Rols</option>
              <option value="admin_master">Admin Master</option>
              <option value="admin">Administrador / Soci</option>
              <option value="tester">Tester / Provador</option>
              <option value="treballador_nivell_1">Treballador Nivell 1</option>
              <option value="treballador_nivell_2">Treballador Nivell 2</option>
              <option value="treballador_nivell_3">Treballador Nivell 3</option>
              <option value="usuari">Usuari Opositor (usuari)</option>
              <option value="opositor">Usuari Opositor (opositor)</option>
              <option value="usuari_free_trial">Usuari Prova (Free Trial)</option>
              <option value="usuari_bannejat">Usuari Bannejat</option>
              <option value="usuari_sospitos">Usuari Sospitós</option>
            </select>
          </div>

          {/* Filtre Estat Subscripció */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estat de Subscripció</label>
            <select
              value={filterEstatSubscripcio}
              onChange={(e) => setFilterEstatSubscripcio(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                darkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Tots els estats</option>
              <option value="activa">Subscripció Activa</option>
              <option value="caducada">Accés Caducat</option>
              <option value="pendent_de_pagament">Pendent de pagament</option>
            </select>
          </div>

          {/* Filtre Pagament */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verificació Pagat / No Pagat</label>
            <select
              value={filterPagament}
              onChange={(e) => setFilterPagament(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                darkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Tots els pagaments</option>
              <option value="pagat">Al corrent de pagament</option>
              <option value="no_pagat">Sense pagar (Pendent)</option>
            </select>
          </div>
        </div>

        {/* Resum de cerca de l'acadèmia */}
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex flex-wrap gap-x-6 gap-y-1 mt-2">
          <span>S'han trobat <span className="text-yellow-500 font-black">{usuarisFiltrats.length}</span> opositors sense duplicar.</span>
          {usuaris.length > usuarisNetejatsDeDuplicats.length && (
            <span className="text-emerald-500">✔ S'han unificat i netejat {usuaris.length - usuarisNetejatsDeDuplicats.length} duplicacions.</span>
          )}
        </div>
      </div>

      {/* Comentari planer per a no-programadors:
          Aquesta és la secció on dibuixem la llista de tots els nostres opositors.
          En lloc d'estar dividits en columnes verticals de targetes de mida petita, ara cadascun és una línia horitzontal àmplia de punta a punta.
          Això organitza la informació en un format molt més net per a monitors amples on es pot veure tot de manera directa, facilitant la feina! */}
      <div className="flex flex-col gap-4">
        {usuarisFiltrats.map((u: any) => {
          const estatLabels: any = {
            activa: "Activa (Al dia)",
            caducada: "Caducada",
            pendent_de_pagament: "Pendent d'activació"
          };

          // Determinació visual de l'avatar amb l'inicial de l'usuari de manera 100% segura
          const inicial = String(u.displayName || u.email || "O").substring(0, 1).toUpperCase();
          
          return (
            <div 
              key={u.id || u.uid} 
              className={`p-5 md:py-4 md:pl-8 md:pr-6 rounded-[1.5rem] border relative overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                darkMode ? 'bg-slate-800/60 border-slate-800/80 hover:bg-slate-800' : 'bg-white border-slate-150 hover:bg-slate-50/50 shadow-sm'
              }`}
            >
              {/* Comentari planer per a no-programadors:
                  Aquest indicador vertical pintat al perfil esquerre ens diu el pols d'un cop d'ull:
                  verd si tot és correcte, taronja si està esperant validació o vermell si l'accés s'ha llimitat. */}
              <div className={`absolute top-0 bottom-0 left-0 w-2 h-full ${
                u.estatSubscripcio === 'activa' ? 'bg-emerald-500' : 
                u.estatSubscripcio === 'pendent_de_pagament' ? 'bg-amber-500' : 'bg-rose-500'
              }`}></div>

              {/* Bloc 1 (Esquerra): Perfil complet general de l'usuari/estudiant */}
              <div className="flex items-center gap-4 min-w-0 md:w-[28%] pl-2 md:pl-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm select-none flex-shrink-0 ${
                  u.rol === 'admin' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                }`}>
                  {u.rol === 'admin' ? <Shield size={18} /> : <span className="font-sans">{inicial}</span>}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-black text-xs md:text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'}`} title={u.displayName || "Novell Opositor"}>
                      {u.displayName || "Novell Opositor"}
                    </h3>
                    
                    <span className={`px-2 py-0.5 rounded-full text-[7.5px] font-black uppercase tracking-wider ${getRolBadgeStyle(u.rol)}`}>
                      {ROLS_NOMS_CAT[u.rol] || u.rol || "Usuari Opositor"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{u.email}</p>
                  <span className="text-[8px] font-mono text-slate-500 block mt-0.5">ID: {u.uid || u.id}</span>
                </div>
              </div>

              {/* Bloc 2 (Centre): Detalls acadèmics organitzats en línia de dalt a baix mitjançant col·legues horitzontals */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-6 min-w-0 md:flex-1 md:px-6 md:border-l md:border-r border-slate-200/40 dark:border-slate-700/40 py-3.5 md:py-0">
                
                {/* Estat d'accés curs */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Estat d'accés:</span>
                  <span className={`font-black uppercase text-[10px] truncate ${
                    u.estatSubscripcio === 'activa' ? 'text-emerald-400' : 
                    u.estatSubscripcio === 'pendent_de_pagament' ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {estatLabels[u.estatSubscripcio] || u.estatSubscripcio || "SENSE SUB"}
                  </span>
                </div>

                {/* Estat de rebut o pagament */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Rebut de Curs:</span>
                  <span className={`font-bold text-[10px] flex items-center gap-1.5 ${u.haPagat ? 'text-emerald-400' : 'text-rose-400'} truncate`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${u.haPagat ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {u.haPagat ? 'Certificat Pagat' : 'Pendent'}
                  </span>
                </div>

                {/* Data que es va registrar l'estudiant */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px]">Data de Registre:</span>
                  <span className={`text-slate-400 font-mono text-[10px] truncate ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {renderFormatDate(u.creatEl || u.creatElTimestamp)}
                  </span>
                </div>

                {/* Última connexió efectuada per l'alumnat */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse flex-shrink-0"></span>
                    Última connexió:
                  </span>
                  <span className="text-yellow-500 font-bold text-[10px] truncate" title={u.ultimAccesEl}>
                    {renderFormatDate(u.ultimAccesEl || u.ultimaConnexio || u.lastLogin, true)}
                  </span>
                </div>
              </div>

              {/* Bloc 3 (Dreta): Accions i controls ràpids d'administració de l'aula de l'acadèmia */}
              <div className="flex flex-row md:flex-col lg:flex-row gap-2 shrink-0 md:w-[22%]">
                {/* Botó per obrir o tancar l'aixeta de l'accés */}
                <button
                  onClick={() => onUpdateUser(u.id || u.uid, { 
                    estatSubscripcio: u.estatSubscripcio === 'activa' ? 'caducada' : 'activa',
                    haPagat: u.estatSubscripcio !== 'activa' // Si l'activem manualment, marquem com a pagat per coherència
                  })}
                  className={`flex-1 py-2 px-3 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all truncate text-center cursor-pointer ${
                    u.estatSubscripcio !== 'activa' 
                      ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-md' 
                      : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                  }`}
                >
                  {u.estatSubscripcio === 'activa' ? 'Anul·lar Accés' : 'Autoritzar Accés'}
                </button>

                {/* Botó per commutar el càrrec/rol (Opositor clàssic o Administrador de control) */}
                {/* Selector Dropdown de Rol - Comentari planer per a no-programadors:
                    En lloc d'un botó simple de si/no admin, ara l'Admin Master pot triar manualment
                    qualsevol dels 10 rols predefinits a la base de dades. Només cal obrir el desplegable
                    i fer-hi un clic; Firestore es sincronitza i es desa automàticament sense haver d'escriure res. */}
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <select
                    value={u.rol || "opositor"}
                    onChange={(e) => onUpdateUser(u.id || u.uid, { rol: e.target.value })}
                    className={`w-full py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer ${
                      darkMode 
                        ? 'bg-slate-900 border-slate-700 text-slate-300' 
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {(() => {
                      // Comentari planer per a no-programadors:
                      // Mitjançant l'email de l'usuari en línia de Firebase Auth (auth.currentUser),
                      // mirem si és el Master d'OposiCAT ("xepfarre@gmail.com").
                      // Només ell pot promoure usuaris a Administrador / Soci o Admin Master.
                      const emailLower = (auth.currentUser?.email || "").toLowerCase().trim();
                      const ésMaster = emailLower === "xepfarre@gmail.com";
                      
                      const options = [
                        { val: "admin_master", text: "★ Admin Master" },
                        { val: "admin", text: "♛ Administrador / Soci" },
                        { val: "tester", text: "✈ Tester / Provador" },
                        { val: "treballador_nivell_1", text: "✎ Treballador Nivell 1" },
                        { val: "treballador_nivell_2", text: "✎ Treballador Nivell 2" },
                        { val: "treballador_nivell_3", text: "✎ Treballador Nivell 3" },
                        { val: "usuari", text: "✔ Usuari Opositor (usuari)" },
                        { val: "opositor", text: "✔ Usuari Opositor (opositor)" },
                        { val: "usuari_free_trial", text: "⏳ Usuari Prova (Free trial)" },
                        { val: "usuari_bannejat", text: "✖ Usuari Bannejat" },
                        { val: "usuari_sospitos", text: "⚠ Usuari Sospitós" }
                      ];

                      return options
                        .filter(opt => ésMaster || (opt.val !== "admin_master" && opt.val !== "admin"))
                        .map(opt => (
                          <option key={opt.val} value={opt.val}>
                            {opt.text}
                          </option>
                        ));
                    })()}
                  </select>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {usuarisFiltrats.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-center px-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
          <User size={56} className="text-slate-200 dark:text-slate-800 mb-8" />
          <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-500 mb-2">No s'ha obtingut cap usuari</h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 max-w-sm leading-relaxed">
            La col·lecció de la BBDD a Firestore està deserta, o bé cap usuari compleix els filtres de cerca aplicats. Pots prémer el botó superior per generar un usuari de prova a la BBDD i testar!
          </p>
        </div>
      )}
    </div>
  );
}

