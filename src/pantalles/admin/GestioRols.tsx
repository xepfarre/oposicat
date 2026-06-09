import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../../lib/firebase";
import { 
  collection, 
  getDocs, 
  setDoc, 
  addDoc,
  doc, 
  updateDoc,
  getDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Activity, 
  RefreshCw, 
  Save, 
  Info,
  Shield,
  Briefcase,
  AlertTriangle,
  User,
  CheckCircle,
  XCircle,
  Search,
  Sliders,
  History,
  Database,
  Lock,
  Eye,
  Settings,
  AlertOctagon,
  Users
} from "lucide-react";
import { ConfiguracioRol } from "../../types";

// Comentari planer per a no-programadors:
// Aquestes són les definicions textuals dels 10 rols que governen OposiCAT.
// Si no hi hagués dades a Firestore, l'aplicació s'encarrega d'injectar-los com a punt d'inici saludable.
const ROLS_PREDEFINITS: ConfiguracioRol[] = [
  {
    id: "admin_master",
    nom: "Admin Master",
    descripcio: "Rol superior absolut. Accés total a totes les configuracions, eliminacions de bases de dades i capacitat per enviar notificacions globals.",
    actiu: true,
    permisos: { enviarNotificacions: true, visualitzarFinances: true, actualitzarTeoria: true, gestioIncidencies: true, gestioFisica: true, veureTemariSencer: true, accesLimitatFreeTrial: false, gestioPreguntesTeoria: true }
  },
  {
    id: "admin",
    nom: "Administrador / Soci",
    descripcio: "Accés reservat als 2 socis fundadors. Permet visualitzar estadístiques, comprovar finances, gestionar opositors i llançar notificacions oficials.",
    actiu: true,
    permisos: { enviarNotificacions: true, visualitzarFinances: true, actualitzarTeoria: true, gestioIncidencies: true, gestioFisica: true, veureTemariSencer: true, accesLimitatFreeTrial: false, gestioPreguntesTeoria: true }
  },
  {
    id: "tester",
    nom: "Tester / Provador",
    descripcio: "Perfil de proves destinat a validar exàmens asíncrons i auditar mòduls de notificacions abans del llançament oficial.",
    actiu: true,
    permisos: { enviarNotificacions: false, visualitzarFinances: false, actualitzarTeoria: false, gestioIncidencies: false, gestioFisica: false, veureTemariSencer: true, accesLimitatFreeTrial: false, gestioPreguntesTeoria: false }
  },
  {
    id: "treballador_nivell_1",
    nom: "Treballador Nivell 1",
    descripcio: "Gestor de continguts teòrics i d'actualitat de nivell bàsic. Edita temes però no pot enviar notificacions ni eliminar exàmens.",
    actiu: true,
    permisos: { enviarNotificacions: false, visualitzarFinances: false, actualitzarTeoria: true, gestioIncidencies: false, gestioFisica: false, veureTemariSencer: true, accesLimitatFreeTrial: false, gestioPreguntesTeoria: false }
  },
  {
    id: "treballador_nivell_2",
    nom: "Treballador Nivell 2",
    descripcio: "Gestor de nivell mitjà. Habilitat per gestionar incidències, assignar consultes amb psicòlegs i crear calendaris físics.",
    actiu: true,
    permisos: { enviarNotificacions: false, visualitzarFinances: false, actualitzarTeoria: true, gestioIncidencies: true, gestioFisica: true, veureTemariSencer: true, accesLimitatFreeTrial: false, gestioPreguntesTeoria: false }
  },
  {
    id: "treballador_nivell_3",
    nom: "Treballador Nivell 3",
    descripcio: "Coordinador operatiu de continguts. Té permís per redactar notificacions push de l'APP d'estudi però no per enviar-les directament de forma immediata.",
    actiu: true,
    permisos: { enviarNotificacions: false, visualitzarFinances: false, actualitzarTeoria: true, gestioIncidencies: true, gestioFisica: true, veureTemariSencer: true, accesLimitatFreeTrial: false, gestioPreguntesTeoria: false }
  },
  {
    id: "usuari",
    nom: "Usuari Opositor",
    descripcio: "Perfil estàndard dels estudiants de pagament complet. Accés i dret a visualitzar temari i fer entrenaments bàsics.",
    actiu: true,
    permisos: { enviarNotificacions: false, visualitzarFinances: false, actualitzarTeoria: false, gestioIncidencies: false, gestioFisica: false, veureTemariSencer: true, accesLimitatFreeTrial: false, gestioPreguntesTeoria: false }
  },
  {
    id: "usuari_free_trial",
    nom: "Usuari Prova (Free Trial)",
    descripcio: "Compte de prova gratuïta de 3 dies per a nous alumnes/usuaris registrats. No tenen accés d'edició ni dret d'enviament de cap mena.",
    actiu: true,
    permisos: { enviarNotificacions: false, visualitzarFinances: false, actualitzarTeoria: false, gestioIncidencies: false, gestioFisica: false, veureTemariSencer: false, accesLimitatFreeTrial: true, gestioPreguntesTeoria: false }
  },
  {
    id: "usuari_bannejat",
    nom: "Usuari Bannejat",
    descripcio: "Accés totalment bloquejat per violació de termes d'ús de comptes compartits o impagament recurrent.",
    actiu: true,
    permisos: { enviarNotificacions: false, visualitzarFinances: false, actualitzarTeoria: false, gestioIncidencies: false, gestioFisica: false, veureTemariSencer: false, accesLimitatFreeTrial: false, gestioPreguntesTeoria: false }
  },
  {
    id: "usuari_sospitos",
    nom: "Usuari Sospitós",
    descripcio: "Estat en observació automatitzada. Permet l'estudi de contingut general, però bloqueja canvis o reserves de cita de cita o psicòleg.",
    actiu: true,
    permisos: { enviarNotificacions: false, visualitzarFinances: false, actualitzarTeoria: false, gestioIncidencies: false, gestioFisica: false, veureTemariSencer: true, accesLimitatFreeTrial: false, gestioPreguntesTeoria: false }
  }
];

// Comentari planer per a no-programadors:
// Llista d'etiquetes en català per a les nostres columnes/propietats de Firestore.
const DESCRIPCIONS_CAMPS_FIRESTORE = [
  { camp: "uid", tipus: "String (Text)", descripcio: "Clau primària única que identifica l'usuari a Firebase Authentication de forma segura." },
  { camp: "email", tipus: "String (Text)", descripcio: "Correu electrònic de contacte oficial, utilitzat per al log in." },
  { camp: "displayName", tipus: "String (Text)", descripcio: "Nom i cognoms o pseudònim triat per l'estudiant del perfil." },
  { camp: "rol", tipus: "String (Text)", descripcio: "Càrrec o rol que té assignat d'entre els 10 possibles de l'organigrama." },
  { camp: "haPagat", tipus: "Boolean (Sí/No)", descripcio: "Control de tresoreria per comprovar que la subscripció està ben abonada en el banc." },
  { camp: "estatSubscripcio", tipus: "String (Text)", descripcio: "Estat de l'accés com actiu, de prova (free_trial) o bloquejat (banned)." },
  { camp: "correuVerificat", tipus: "Boolean (Sí/No)", descripcio: "Enllaç amb el servei de correus de Firebase per saber si és una adreça de correu reial." },
  { camp: "idSessioActiva", tipus: "String (Text o Buit)", descripcio: "Registra l'identificador del dispositiu mòbil actual per evitar que l'estudiant comparteixi el mateix compte amb un amic alhora." }
];

export default function GestioRols({ darkMode }: { darkMode: boolean }) {
  // Estats per a gestionar els rols i la càrrega de dades
  const [rols, setRols] = useState<ConfiguracioRol[]>([]);
  const [usuaris, setUsuaris] = useState<any[]>([]);
  const [logsAuditoria, setLogsAuditoria] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingUsuaris, setLoadingUsuaris] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  const [savingPermission, setSavingPermission] = useState<string | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Informació de l'usuari actual logat
  const [currentUserRol, setCurrentUserRol] = useState<string>("opolat_provisional");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("");

  // Controladora de la pestanya seleccionada actualment ("benvinguda", "rols_info", "gestio_permisos", "gestio_usuaris", "historial_auditoria")
  const [activeTab, setActiveTab] = useState<string>("benvinguda");

  // Estat del cercador de la gestió d'usuaris
  const [cercaUser, setCercaUser] = useState("");

  // Comentari planer per a no-programadors:
  // Aquest nou estat serveix per recordar quin rol s'ha escollit en el desplegable de filtre.
  // Si està buit, vol dir que l'usuari vol veure tothom (tots els rols).
  const [rolFiltre, setRolFiltre] = useState<string>("");

  // Comentari planer per a no-programadors:
  // Aquest efecte s'activa quan entrem a la pantalla. Es comunica amb Firebase Auth
  // per esbrinar el correu de la persona connectada, i després consulta quin és el seu rol
  // a la base de dades per decidir si té permisos d'Administrador d'empresa.
  // No fem servir cap llista de correus electrònics escrita al codi font per motius de seguretat.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUserEmail(user.email || "");
        setCurrentUserName(user.displayName || "Administrador");
        
        let provisionalRol = "opositor";

        try {
          const userDoc = await getDoc(doc(db, "usuaris", user.uid));
          if (userDoc.exists()) {
            const dades = userDoc.data();
            setCurrentUserRol(dades.rol || provisionalRol);
          } else {
            setCurrentUserRol(provisionalRol);
          }
        } catch (err) {
          console.warn("No hem pogut llegir el document de l'usuari a Firebase:", err);
          setCurrentUserRol(provisionalRol);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Per saber de manera ràpida si és un rol d'administrador ("admin" o "admin_master")
  const teRolAdministrador = useMemo(() => {
    return currentUserRol === "admin" || currentUserRol === "admin_master";
  }, [currentUserRol]);

  // Comentari planer per a no-programadors:
  // Funció que carrega el llistat dels 10 rols que tenim definits a la base de dades Firestore.
  // S'utilitzarà tant a la pestanya 1 (Rols i BD) com a la pestanya 2 (Gestió de permisos).
  const carregarRolsDeBBDD = async () => {
    setLoading(true);
    setErrorLocal(null);
    try {
      const querySnapshot = await getDocs(collection(db, "rols"));
      
      // Si la BBDD de Firebase està completament buida d'estructura, llancem la sembra de dades
      if (querySnapshot.empty) {
        console.log("Creant inicialització de rols a la base de dades Firestore per primer cop...");
        for (const rol of ROLS_PREDEFINITS) {
          await setDoc(doc(db, "rols", rol.id), {
            nom: rol.nom,
            descripcio: rol.descripcio,
            actiu: rol.actiu,
            permisos: rol.permisos || {},
            actualitzatEl: serverTimestamp()
          }, { merge: true });
        }
        
        const qSnapSegon = await getDocs(collection(db, "rols"));
        const llistaRols: ConfiguracioRol[] = [];
        qSnapSegon.forEach((doc) => {
          llistaRols.push({ id: doc.id, ...doc.data() } as ConfiguracioRol);
        });
        llistaRols.sort((a, b) => a.id.localeCompare(b.id));
        setRols(llistaRols);
        return;
      }

      const llistaRols: ConfiguracioRol[] = [];
      querySnapshot.forEach((doc) => {
        llistaRols.push({ id: doc.id, ...doc.data() } as ConfiguracioRol);
      });
      llistaRols.sort((a, b) => a.id.localeCompare(b.id));
      setRols(llistaRols);
    } catch (err: any) {
      console.error("Error consultant rols a Firestore:", err);
      setErrorLocal("S'ha produït un contratemps en demanar els rols a Firestore. Comprova la teva llicència de Firebase.");
    } finally {
      setLoading(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Aquest mètode descarrega la graella d'usuaris reials registrats actualment a la base de dades.
  // Servirà per al cercador que llista les persones i permet triar un rol del llistat directament amb un click.
  const carregarUsuarisDeBBDD = async () => {
    if (!teRolAdministrador) return;
    setLoadingUsuaris(true);
    setErrorLocal(null);
    try {
      const qSnap = await getDocs(collection(db, "usuaris"));
      const llista: any[] = [];
      qSnap.forEach((docSnap) => {
        llista.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Ordenem alfabèticament pel seu nom
      llista.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
      setUsuaris(llista);
    } catch (err: any) {
      console.error("Error carregant persones de Firestore:", err);
      setErrorLocal("No tenim suficients permisos de lectura o hi ha talls amb la xarxa en carregar la llista d'opositors.");
    } finally {
      setLoadingUsuaris(false);
    }
  };

  // Comentari planer per a no-programadors:
  // Aquest bloc consulta en temps real l'historial d'auditoria de la col·lecció `logs_rols`.
  // Es demana de forma descendent per poder veure en primer lloc l'última modificació feta en OposiCAT.
  // Gràcies al filtre, només mostrarem els canvis que s'hagin tocat manualment des de l'aplicació.
  const carregarLogsAuditoriaDeBBDD = async () => {
    if (currentUserRol !== "admin_master") return;
    setLoadingLogs(true);
    setErrorLocal(null);
    try {
      const qSnap = await getDocs(collection(db, "logs_rols"));
      let llista: any[] = [];
      qSnap.forEach((docSnap) => {
        const dades = docSnap.data();
        // Comentari planer: Només mostrem aquells canvis fets directament a mà per un administrador
        if (dades.tipusModificacio === "manual") {
          llista.push({ id: docSnap.id, ...dades });
        }
      });
      
      // Ordenació manual per data de logs per si algun no té format de data de servidor
      llista.sort((a, b) => {
        const dataA = a.fecha?.seconds ? a.fecha.seconds : 0;
        const dataB = b.fecha?.seconds ? b.fecha.seconds : 0;
        return dataB - dataA;
      });
      
      setLogsAuditoria(llista);
    } catch (err: any) {
      console.error("Error carregant logs de rols:", err);
      // Comentari planer: Mostrem dades addicionals de l'error real per ajudar l'usuari a comprovar els seus permisos cloud.
      setErrorLocal(`La col·lecció de registres l'admin_master no s'ha pogut llistar o està bloquejada temporalment. Detall tècnic de Firebase: ${err.message || err.code || err}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Carregar inicialment les dades per començar si és administrador
  useEffect(() => {
    carregarRolsDeBBDD();
    if (teRolAdministrador) {
      carregarUsuarisDeBBDD();
    }
  }, [currentUserRol]);

  // Comentari planer per a no-programadors:
  // Desa un nou estat de permisos per a un determinat rol dins d'un map de Firestore (Pestanya 2).
  // Per dur el canvi a la realitat, rep el nom del rol, actualitza el seu mapa de permisos i es desa al núvol.
  const desarPermisDeRol = async (rolId: string, permisClau: string, valor: boolean) => {
    setSavingPermission(rolId);
    setErrorLocal(null);
    setSuccessMsg(null);
    try {
      const rolActual = rols.find((r) => r.id === rolId);
      if (!rolActual) return;

      const nousPermisos = {
        ...(rolActual.permisos || {}),
        [permisClau]: valor
      };

      await updateDoc(doc(db, "rols", rolId), {
        permisos: nousPermisos,
        actualitzatEl: serverTimestamp()
      });

      setSuccessMsg(`S'han desat correctament els permisos del rol '${rolActual.nom}' a Firestore.`);
      await carregarRolsDeBBDD();
    } catch (err: any) {
      console.error("Error de seguretat actualitzant mapa de permisos:", err);
      setErrorLocal("No s'han pogut redefinir els privilegis en el document del rol. Revisa els permisos cloud.");
    } finally {
      setSavingPermission(null);
    }
  };

  // Comentari planer per a no-programadors:
  // Desa les modificacions de descripció o descativar d'un rol de forma permanent a Firebase Firestore.
  const desarCanviGeneralRol = async (rolId: string, dadesActualitzacion: any) => {
    setErrorLocal(null);
    setSuccessMsg(null);
    try {
      await updateDoc(doc(db, "rols", rolId), {
        ...dadesActualitzacion,
        actualitzatEl: serverTimestamp()
      });
      setSuccessMsg("S'ha desat l'estat i descripció del rol en l'organigrama amb èxit!");
      await carregarRolsDeBBDD();
    } catch (err) {
      setErrorLocal("Hi ha hagut un problema en desar la definició textual del rol.");
    }
  };

  // Comentari planer per a no-programadors:
  // Modifica directament el rol d'un usuari i crea alhora de manera sincronitzada un log d'auditoria.
  // Tot es realitza de forma autòctona a Firestore, evitant errors i talls de dades.
  const redefinirRolUsuariDirecte = async (usuariId: string, nouRolId: string) => {
    setErrorLocal(null);
    setSuccessMsg(null);
    try {
      const usuariAfectat = usuaris.find((u) => u.id === usuariId);
      if (!usuariAfectat) {
        setErrorLocal("No hem trobat l'estranya fitxa d'usuari a la llista actual de la BBDD.");
        return;
      }

      const anticRol = usuariAfectat.rol || "opositor";

      // 1. Modificar rol de l'usuari a Firestore lligat a "usuaris"
      await updateDoc(doc(db, "usuaris", usuariId), {
        rol: nouRolId,
        actualitzatEl: serverTimestamp()
      });

      // 2. Gravació estricta i sincronitzada de canvis d'escriptura a la col·lecció d'auditoria logs_rols
      const autorEmail = currentUserEmail || auth.currentUser?.email || "desconegut";
      const autorNom = currentUserName || auth.currentUser?.displayName || "Administrador d'empresa";

      await addDoc(collection(db, "logs_rols"), {
        quiRealitzaNom: autorNom,
        quiRealitzaEmail: autorEmail,
        usuariAfectatId: usuariId,
        usuariAfectatNom: usuariAfectat.displayName || "Novell Opositor",
        usuariAfectatEmail: usuariAfectat.email || "sense@email.com",
        rolAnterior: anticRol,
        rolNou: nouRolId,
        fecha: serverTimestamp(),
        tipusModificacio: "manual" // Marcador essencial per saber que s'ha canviat a mà des de la gestió manual de rols
      });

      setSuccessMsg(`El rol de '${usuariAfectat.displayName || usuariAfectat.email}' s'ha redefinit a '${nouRolId}' i s'ha registrat en el llibre d'auditories.`);
      
      // Actualitzar llistes reials
      await carregarUsuarisDeBBDD();
      if (currentUserRol === "admin_master") {
        await carregarLogsAuditoriaDeBBDD();
      }
    } catch (err: any) {
      console.error("Error canviant rol de l'estudiant:", err);
      setErrorLocal("S'ha denegat l'escriptura a Firestore. Comprova que no s'envaeixin regles estrictes de Firebase.");
    }
  };

  // Comentari planer per a no-programadors:
  // Filtra els usuaris que el cercador ens demana utilitzant la paraula clau de cerca de text,
  // i en paral·lel, si s'ha triat algun rol concret d'estudiants des del nou selector de filtratge.
  const usuarisFiltratsCercador = useMemo(() => {
    if (!Array.isArray(usuaris)) return [];
    return usuaris.filter((u) => {
      // 1. Filtre per nom o email escrit
      const cerca = cercaUser.toLowerCase().trim();
      const nom = (u.displayName || "").toLowerCase();
      const mail = (u.email || "").toLowerCase();
      const coincideixText = !cerca || nom.includes(cerca) || mail.includes(cerca);

      // 2. Filtre pel rol en calent escollit
      let coincideixRol = true;
      if (rolFiltre) {
        const userRolReal = u.rol || "opositor";
        // En OposiCAT normalment "opositor" o "usuari" és el mateix rol d'estudiant opositor
        if (rolFiltre === "opositor" || rolFiltre === "usuari") {
          coincideixRol = userRolReal === "opositor" || userRolReal === "usuari";
        } else {
          coincideixRol = userRolReal === rolFiltre;
        }
      }

      return coincideixText && coincideixRol;
    });
  }, [usuaris, cercaUser, rolFiltre]);

  // Retorna els estils visuals de cada pin o etiqueta visual per a no carregar-ho tot
  const getRolBadgeClass = (id: string) => {
    switch (id) {
      case "admin_master":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "admin":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "tester":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
      case "treballador_nivell_1":
      case "treballador_nivell_2":
      case "treballador_nivell_3":
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
      case "usuari":
      case "opositor":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "usuari_free_trial":
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      case "usuari_bannejat":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      case "usuari_sospitos":
        return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-700/20";
    }
  };

  // Traducció directa en català de cada rol a efectes informatius
  const ROL_NOMS_CAT: any = {
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

  return (
    <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 ${
      darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-100 text-slate-800"
    }`}>
      
      {/* Capçalera del Backoffice d'OposiCAT */}
      <div className="pb-6 mb-6 border-b border-dashed border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-500">
            <Shield className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Mòdul d'alta seguretat</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight" id="titol_gestio_de_rols">Gestió de rols</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Control de seguretat, organigrama de treball de l'empresa d'OposiCAT i assignació manual de rols de l'estudiantat.
          </p>
        </div>

        {/* Estat d'accés de la persona logada en l'APP */}
        <div className="flex items-center gap-2 bg-indigo-500/5 px-4 py-2.5 rounded-2xl border border-indigo-500/10">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <div className="text-[10px] space-y-0.5">
            <p className="font-semibold text-slate-500 uppercase tracking-wider">Identitat autònoma</p>
            <p className="font-bold text-slate-700 dark:text-slate-300">{currentUserEmail || "Consulta d'Auth..."} ({ROL_NOMS_CAT[currentUserRol] || currentUserRol})</p>
          </div>
        </div>
      </div>

      {/* RÈGIM JURÍDIC / PANTALLA EXCLUSIVA DE BENVINGUDA GENERAL (Arribada o quan no està autoritzat) */}
      <div className="p-6 mb-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
        <div className="flex items-start gap-4">
          <AlertOctagon className="w-8 h-8 flex-shrink-0 mt-1 animate-bounce" />
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">🚨 Avís Legal i Normativa Corporativa Exclusiva:</h4>
            <p className="text-xs leading-relaxed font-semibold">
              Aquesta pantalla esta reservada per l'administracio de l'empresa amb grau d'Administrador. Si visualitzes aquesta paguina avisa al teu superior d'inmediat. Efectuar qualsevol tipus de canvi en aquesta paguina sense el permis expliocit de l'empresa pot comportar greus carregels legals a part de l'expulsio inmediata de l'empresa. Moltes gracies.
            </p>
          </div>
        </div>
      </div>

      {/* Missatges globals d'escriptura (ÈXIT o DENEGAT) */}
      {errorLocal && (
        <div className="p-4 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{errorLocal}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs flex items-center gap-3">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* LAYOUT PRINCIPAL DE LA PANTALLA: DIVIDIT EN 2 PARTS */}
      <div className="grid grid-cols-12 gap-8 mt-6">
        
        {/* PARTE 1 DES DE ESQUERRA: MENÚ DE CONTROL VERTICAL / DE PESTANYES (COLE-12 lg:COL-4) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-800" : "bg-slate-50/50 border-slate-200"}`}>
            <p className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-4">Taulell d'accions administratrius</p>
            
            {/* LLISTA DELS 3 BOTONS IGUALS DE GRANS I ESPAIATS DE PESTANYES + 4t HISTÒRIC */}
            <div className="flex flex-col gap-3">
              
              {/* 1r Boto: ROLS */}
              <button
                disabled={!teRolAdministrador}
                onClick={() => {
                  setActiveTab("rols_info");
                  carregarRolsDeBBDD();
                }}
                className={`w-full py-4 px-5 rounded-xl font-bold uppercase tracking-wider text-xs transition duration-300 flex items-center gap-3 justify-center text-center ${
                  !teRolAdministrador 
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50 border border-transparent"
                    : activeTab === "rols_info"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-slate-150 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 border border-transparent"
                }`}
              >
                <Database className="w-4 h-4" />
                ROLS
              </button>

              {/* 2n Boto: Gestio de rols */}
              <button
                disabled={!teRolAdministrador}
                onClick={() => {
                  setActiveTab("gestio_permisos");
                  carregarRolsDeBBDD();
                }}
                className={`w-full py-4 px-5 rounded-xl font-bold uppercase tracking-wider text-xs transition duration-300 flex items-center gap-3 justify-center text-center ${
                  !teRolAdministrador 
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50 border border-transparent"
                    : activeTab === "gestio_permisos"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-slate-150 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 border border-transparent"
                }`}
              >
                <Sliders className="w-4 h-4" />
                Gestio de rols
              </button>

              {/* 3r Boto: Gestio de rols d'usuari */}
              <button
                disabled={!teRolAdministrador}
                onClick={() => {
                  setActiveTab("gestio_usuaris");
                  carregarUsuarisDeBBDD();
                }}
                className={`w-full py-4 px-5 rounded-xl font-bold uppercase tracking-wider text-xs transition duration-300 flex items-center gap-3 justify-center text-center ${
                  !teRolAdministrador 
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50 border border-transparent"
                    : activeTab === "gestio_usuaris"
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-slate-150 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 border border-transparent"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Gestio de rols d'usuari
              </button>

              {/* 4rt Boto: Historial d'auditoria (NOMÉS VISIBLE PER AL ADMIN_MASTER pel control estricte) */}
              {currentUserRol === "admin_master" && (
                <button
                  onClick={() => {
                    setActiveTab("historial_auditoria");
                    carregarLogsAuditoriaDeBBDD();
                  }}
                  className={`w-full py-4 px-5 rounded-xl font-bold uppercase tracking-wider text-xs transition duration-300 flex items-center gap-3 justify-center text-center border-2 border-indigo-500/20 ${
                    activeTab === "historial_auditoria"
                      ? "bg-indigo-750 text-white shadow-lg border-indigo-500"
                      : "bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-500"
                  }`}
                >
                  <History className="w-4 h-4" />
                  Auditoria de Socis
                </button>
              )}

            </div>
          </div>

          <div className={`p-5 rounded-2xl border text-xs text-slate-500 leading-relaxed ${darkMode ? "bg-slate-950/10 border-slate-800" : "bg-slate-50/20 border-slate-100"}`}>
            <p className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 mb-1">
              <Info className="w-4 h-4 text-indigo-500" /> Consell directiu d'OposiCAT:
            </p>
            <p>
              Totes les operacions d'escriptura sobre els rols d'usuaris estan auditades. Quan un membre de l'equip reverteixi o escali un compte, el seu nom, correu i el rol anterior quedaran memoritzats de forma irrevocable per la pau social dels socis.
            </p>
          </div>
        </div>

        {/* PARTE 2 DES DE DRETA: VISUALITZADOR DINÀMIC SEGONS LA PESTANYA (COLE-12 lg:COL-8) */}
        <div className="col-span-12 lg:col-span-8">
          
          {/* PESTANYA A: PANTALLA INICIAL D'ARRIBADA / BENVINGUDA GENERAL */}
          {activeTab === "benvinguda" && (
            <div className={`p-8 rounded-2xl border text-center flex flex-col items-center justify-center min-h-[350px] ${
              darkMode ? "bg-slate-950/10 border-slate-800" : "bg-slate-50/30 border-slate-150"
            }`}>
              <Shield className="w-16 h-16 text-indigo-500 mb-4 animate-pulse" />
              <h3 className="text-xl font-black">Controlador Corporatiu d'Rols de Seguretat</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
                Heu entrat al panell central d'admisions de la federació d'estudis d'OposiCAT. Si us plau, utilitzeu els botons de control de l'esquerra per comprovar les descripcions de la BBDD, gestionar els privilegis per grups de treballadors, o fer la redefinició d'opositors.
              </p>
              {!teRolAdministrador && (
                <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-950 rounded-xl text-slate-400 text-[10px] uppercase font-black tracking-wider flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> Estat de la sessió: Bloquejat per manca de Rols d'Administrador
                </div>
              )}
            </div>
          )}

          {/* PESTANYA B: DETALL DE ROLS + DESCRIPCIÓ DE LA BBDD (Pestanya ROLS) */}
          {activeTab === "rols_info" && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-black uppercase tracking-wider">Estructura Real de la BBDD de Rols de Firestore</h3>
                </div>
                <button
                  onClick={carregarRolsDeBBDD}
                  className="p-1 px-3.5 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-250 hover:bg-slate-100 dark:border-slate-750 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> actualitzar
                </button>
              </div>

              {/* Descripció estructural física de la BBDD real de Firestore */}
              <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs">
                <h4 className="font-bold text-indigo-400 flex items-center gap-1.5 mb-2.5">
                  <Database className="w-4 h-4" /> Estructura de dades de la co·lecció 'usuaris' a Firestore:
                </h4>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Els usuaris que es donen d'alta oficialment a OposiCAT tenen associades de forma nativa aquestes següents propietats físiques a Firestore:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DESCRIPCIONS_CAMPS_FIRESTORE.map((d, index) => (
                    <div key={index} className={`p-3 rounded-xl border ${darkMode ? "bg-slate-950/20 border-slate-800/80" : "bg-white border-slate-150"}`}>
                      <div className="flex justify-between items-center mb-1">
                        <code className="text-indigo-400 font-bold">{d.camp}</code>
                        <span className="text-[9px] text-slate-400 font-mono italic">{d.tipus}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{d.descripcio}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Llistat detallat de tot el que poden fer segons la descripció del rol */}
              <div className="space-y-4 pt-2">
                <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Descripció detallada del que pot fer cada Rol:</h4>
                <div className="grid grid-cols-1 gap-4">
                  {rols.map((rol) => (
                    <div key={rol.id} className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-800" : "bg-slate-50/50 border-slate-150"}`}>
                      <div className="flex justify-between items-start gap-4 mb-2.5">
                        <div className="space-y-0.5">
                          <h5 className="font-bold text-sm text-slate-700 dark:text-slate-200">{rol.nom}</h5>
                          <code className="text-[10px] text-indigo-400 font-mono">ID Document a Firestore: rols/{rol.id}</code>
                        </div>
                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-lg ${getRolBadgeClass(rol.id)}`}>
                          {rol.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        {rol.descripcio}
                      </p>
                      
                      {/* Llistat de capacitat real des del mapa de permisos */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                        {rol.permisos ? (
                          Object.entries(rol.permisos).map(([pClau, value]) => (
                            <span 
                              key={pClau} 
                              className={`inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-md font-semibold ${
                                value 
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                  : "bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                              }`}
                            >
                              {value ? "✔" : "✖"} {pClau.replace(/([A-Z])/g, ' $1')}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No té mapa de permisos definit.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* PESTANYA C: DEFINICIÓ I GESTOR DE QUÈ PODEN FER (Gestió de Rols / Permissions Config) */}
          {activeTab === "gestio_permisos" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-black uppercase tracking-wider">Configurador de capacitats per sector d'usuaris</h3>
                </div>
                <button
                  onClick={carregarRolsDeBBDD}
                  className="p-1 px-3.5 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-250 hover:bg-slate-100 dark:border-slate-750 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> actualitzar dades
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                <strong>📝 Consell de l'Administrador Master:</strong> En aquest mòdul podeu habilitar o tancar de forma reial els privilegis de programari de cada sector de treballadors o opositors d'OposiCAT. Per exemple, podeu canviar les qualitats dels opositors "free trial" o decidir si els testers poden tenir accés a veure finances. Quan commuteu els botons, es sincronitzaran permanentment a Firestore al instant.
              </p>

              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Carregant rols de Firestore...
                </div>
              ) : (
                <div className="space-y-4">
                  {rols.map((rol) => (
                    <div key={rol.id} className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-150"}`}>
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-150 dark:border-slate-800/80">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">{rol.nom}</h4>
                          <span className="font-mono text-[9px] text-slate-400 uppercase font-semibold">Codi ID: {rol.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Actiu en l'App:</label>
                          <input 
                            type="checkbox"
                            checked={rol.actiu}
                            onChange={(e) => desarCanviGeneralRol(rol.id, { actiu: e.target.checked })}
                            className="rounded text-indigo-500 h-4 w-4"
                          />
                        </div>
                      </div>

                      {/* Definició de drets i permisos actius */}
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Habilitar permisos sobre els següents àmbits:</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          
                          {/* Permís 1: Enviar Notificacions oficials */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${darkMode ? "bg-slate-950/20 border-slate-900" : "bg-slate-50/80 border-slate-100"}`}>
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Llançar Notificacions Push</span>
                              <p className="text-[9.5px] text-slate-400 leading-tight">Dret a enviar alertes oficials i avisos al mòbil de l'estudiant.</p>
                            </div>
                            <input 
                              type="checkbox"
                              checked={rol.permisos?.enviarNotificacions ?? false}
                              onChange={(e) => desarPermisDeRol(rol.id, "enviarNotificacions", e.target.checked)}
                              disabled={savingPermission === rol.id}
                              className="rounded text-indigo-500 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>

                          {/* Permís 2: Visualitzar finances */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${darkMode ? "bg-slate-950/20 border-slate-900" : "bg-slate-50/80 border-slate-100"}`}>
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Visualitzar Finances i Pagaments</span>
                              <p className="text-[9.5px] text-slate-400 leading-tight">Accés al panell de tresoreria per comprovar quotes i beneficis.</p>
                            </div>
                            <input 
                              type="checkbox"
                              checked={rol.permisos?.visualitzarFinances ?? false}
                              onChange={(e) => desarPermisDeRol(rol.id, "visualitzarFinances", e.target.checked)}
                              disabled={savingPermission === rol.id}
                              className="rounded text-indigo-500 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>

                          {/* Permís 3: Actualitzar teoria */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${darkMode ? "bg-slate-950/20 border-slate-900" : "bg-slate-50/80 border-slate-100"}`}>
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Editar Contingut Teòric i Temes</span>
                              <p className="text-[9.5px] text-slate-400 leading-tight">Permís per reescriure o actualitzar els articles d'estudi.</p>
                            </div>
                            <input 
                              type="checkbox"
                              checked={rol.permisos?.actualitzarTeoria ?? false}
                              onChange={(e) => desarPermisDeRol(rol.id, "actualitzarTeoria", e.target.checked)}
                              disabled={savingPermission === rol.id}
                              className="rounded text-indigo-500 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>

                          {/* Permís 4: Gestió incidences */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${darkMode ? "bg-slate-950/20 border-slate-900" : "bg-slate-50/80 border-slate-100"}`}>
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Atendre i Donar Suport (Incidències)</span>
                              <p className="text-[9.5px] text-slate-400 leading-tight">Comprovar missatges d'alumnes amb psicòlegs o reclamacions.</p>
                            </div>
                            <input 
                              type="checkbox"
                              checked={rol.permisos?.gestioIncidencies ?? false}
                              onChange={(e) => desarPermisDeRol(rol.id, "gestioIncidencies", e.target.checked)}
                              disabled={savingPermission === rol.id}
                              className="rounded text-indigo-500 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>

                          {/* Permís 5: Gestió física */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${darkMode ? "bg-slate-950/20 border-slate-900" : "bg-slate-50/80 border-slate-100"}`}>
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Preparació Física i Calendaris</span>
                              <p className="text-[9.5px] text-slate-400 leading-tight">Organitzar els plans de proves físiques corporatives.</p>
                            </div>
                            <input 
                              type="checkbox"
                              checked={rol.permisos?.gestioFisica ?? false}
                              onChange={(e) => desarPermisDeRol(rol.id, "gestioFisica", e.target.checked)}
                              disabled={savingPermission === rol.id}
                              className="rounded text-indigo-500 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>

                          {/* Permís 6: Accés complet temari */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${darkMode ? "bg-slate-950/20 border-slate-900" : "bg-slate-50/80 border-slate-100"}`}>
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Dret a veure tot el temari</span>
                              <p className="text-[9.5px] text-slate-400 leading-tight">Els opositors de pagament tenen accés integral als Àmbits d'estudi.</p>
                            </div>
                            <input 
                              type="checkbox"
                              checked={rol.permisos?.veureTemariSencer ?? false}
                              onChange={(e) => desarPermisDeRol(rol.id, "veureTemariSencer", e.target.checked)}
                              disabled={savingPermission === rol.id}
                              className="rounded text-indigo-500 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>

                          {/* Permís 7: Accés limitat free trial */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${darkMode ? "bg-slate-950/20 border-slate-900" : "bg-slate-50/80 border-slate-100"}`}>
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 font-serif">Compte limitat a 3 dies</span>
                              <p className="text-[9.5px] text-slate-400 leading-tight">Es tanca l'accés al quart dia llevat d'abonar correctament la quota.</p>
                            </div>
                            <input 
                              type="checkbox"
                              checked={rol.permisos?.accesLimitatFreeTrial ?? false}
                              onChange={(e) => desarPermisDeRol(rol.id, "accesLimitatFreeTrial", e.target.checked)}
                              disabled={savingPermission === rol.id}
                              className="rounded text-indigo-500 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>

                          {/* Permís 8: Gestió de preguntes teòriques en BBDD */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${darkMode ? "bg-slate-950/20 border-slate-900" : "bg-slate-50/80 border-slate-100"}`}>
                            <div className="space-y-0.5 max-w-[80%]">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Gestió de preguntes teòriques en BBDD</span>
                              <p className="text-[9.5px] text-slate-400 leading-tight">Dret a pujar, modificar i eliminar preguntes de la part teòrica de la base de dades.</p>
                            </div>
                            <input 
                              type="checkbox"
                              checked={rol.permisos?.gestioPreguntesTeoria ?? false}
                              onChange={(e) => desarPermisDeRol(rol.id, "gestioPreguntesTeoria", e.target.checked)}
                              disabled={savingPermission === rol.id}
                              className="rounded text-indigo-500 h-4 w-4 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>

                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* PESTANYA D: BUSCADOR DE PERSONES + CONSULTA / ASSIGNACIÓ MANUAL (Gestió de rols d'usuari) */}
          {activeTab === "gestio_usuaris" && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-black uppercase tracking-wider">Cercador i Modificador Manual de Rols</h3>
                </div>
                <button
                  onClick={carregarUsuarisDeBBDD}
                  className="p-1 px-3.5 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-250 hover:bg-slate-100 dark:border-slate-750 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingUsuaris ? "animate-spin" : ""}`} /> actualitzar llista
                </button>
              </div>

              {/* Caixa amb un cercador de text i un selector de rols integrat en línia adaptable */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch">
                {/* Cercador per lletres o email */}
                <div className={`p-3 rounded-2xl border flex-1 ${darkMode ? "bg-slate-950/20 border-slate-850" : "bg-slate-50/30 border-slate-150"} flex items-center gap-3`}>
                  <Search className="w-5 h-5 text-indigo-400 shrink-0" />
                  <input 
                    type="text"
                    placeholder="Escriviu el nom o correu d'algun opositor per localitzar-lo a la base de dades..."
                    value={cercaUser}
                    onChange={(e) => setCercaUser(e.target.value)}
                    className={`w-full py-2 px-3 text-sm rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 ${
                      darkMode 
                        ? "bg-slate-900 border-slate-700 text-slate-100" 
                        : "bg-white border-slate-250 text-slate-800"
                    }`}
                    id="input_cercador_persones_rols"
                  />
                </div>

                {/* Filtre específic del mètode de rol triat pel cercador */}
                <div className={`p-3 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-850" : "bg-slate-50/30 border-slate-150"} flex items-center gap-2 md:min-w-[240px]`}>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0">Filtrar per rol:</span>
                  <select
                    value={rolFiltre}
                    onChange={(e) => setRolFiltre(e.target.value)}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold outline-none border focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                      darkMode 
                        ? "bg-slate-900 border-slate-700 text-slate-100" 
                        : "bg-white border-slate-250 text-slate-800"
                    }`}
                    id="select_filtrar_usuaris_per_rol"
                  >
                    <option value="">Tots els rols</option>
                    <option value="admin_master">★ Admin Master</option>
                    <option value="admin">♛ Administrador / Soci</option>
                    <option value="tester">✈ Tester / Provador</option>
                    <option value="treballador_nivell_1">✎ Treballador Nivell 1</option>
                    <option value="treballador_nivell_2">✎ Treballador Nivell 2</option>
                    <option value="treballador_nivell_3">✎ Treballador Nivell 3</option>
                    <option value="opositor">✔ Usuari Opositor</option>
                    <option value="usuari_free_trial">⏳ Usuari Prova (Free trial)</option>
                    <option value="usuari_bannejat">✖ Usuari Bannejat</option>
                    <option value="usuari_sospitos">⚠ Usuari Sospitós</option>
                  </select>
                </div>
              </div>

              {loadingUsuaris ? (
                <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span>Consultant el registre total d'usuaris d'OposiCAT...</span>
                </div>
              ) : usuarisFiltratsCercador.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  Cap opositor registrat coincideix amb el patró de cerca indicat.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Públic trobat sense duplicacions ({usuarisFiltratsCercador.length} de {usuaris.length}):
                  </p>
                  
                  {usuarisFiltratsCercador.map((u) => (
                    <div 
                      key={u.id || u.uid}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                        darkMode ? "bg-slate-950/15 border-slate-850 hover:bg-slate-950/30" : "bg-white border-slate-150 hover:bg-slate-50/50"
                      }`}
                    >
                      {/* Dades de l'opositor */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200">
                            {u.displayName || "Novell Opositor"}
                          </h4>
                          <span className={`px-2 py-0.5 text-[8.5px] font-extrabold uppercase rounded-full ${getRolBadgeClass(u.rol)}`}>
                            {ROL_NOMS_CAT[u.rol] || u.rol || "Opositor clàssic"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          Email: {u.email} • ID: {u.uid || u.id}
                        </p>
                      </div>

                      {/* Desplegable d'assignació en calent a la base de dades */}
                      <div className="w-full sm:w-auto flex items-center gap-1.5 self-stretch sm:self-auto">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden md:inline">Canviar Rol:</label>
                        <select
                          value={u.rol || "opositor"}
                          onChange={(e) => redefinirRolUsuariDirecte(u.id || u.uid, e.target.value)}
                          className={`w-full sm:w-auto py-1.5 px-3 rounded-lg text-xs font-bold outline-none border focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                            darkMode 
                              ? "bg-slate-900 border-slate-700 text-slate-300" 
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          {(() => {
                            // Comentari planer per a no-programadors:
                            // Es comprova si la persona connectada actualment a OposiCAT és el correu exclusiu de la propietat ("xepfarre@gmail.com").
                            // Si ho és, rep de tornada tots els privilegis i la llista íntegra de rols corporatius.
                            // Si és qualsevol altre administrador o soci col·laborador, els rols considerats "superiors o el seu mateix" (Master i Admin) queden totalment ocults i protegits de canvis accidentals.
                            const emailLower = (currentUserEmail || "").toLowerCase().trim();
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
                  ))}
                </div>
              )}

            </div>
          )}

          {/* PESTANYA E: LLIBRE D'AUDITORIA D'ADMINISTRACIÓ (Només per a `admin_master`) */}
          {activeTab === "historial_auditoria" && currentUserRol === "admin_master" && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400 shrink-0" />
                  <h3 className="text-lg font-black uppercase tracking-wider">Historial de redeficins de control (Logs)</h3>
                </div>
                <button
                  onClick={carregarLogsAuditoriaDeBBDD}
                  className="p-1 px-3.5 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-250 hover:bg-slate-100 dark:border-slate-750 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingLogs ? "animate-spin" : ""}`} /> actualitzar registre
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-xl text-indigo-300">
                ⚠️ <strong>Avís exclusiu per a l'Admin Master:</strong> La llista següent recull de forma descendent totes les operacions fetes pels administradors o socis per canviar el rol o assignar llicències a d'altres persones. D'aquesta manera s'evita la creació indeguda i es manté l'auditoria permanent.
              </p>

              {loadingLogs ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Descarregant fitxers de registre de Firestore...
                </div>
              ) : logsAuditoria.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  A hores d'ara no consta cap operació de modificació de rols en l'historial cloud.
                </div>
              ) : (
                <div className="space-y-3 max-h-[450px] overflow-y-auto">
                  {logsAuditoria.map((log) => {
                    // Descodificar el timestamp de forma segura
                    let dataText = "Data indeterminada";
                    if (log.fecha) {
                      if (log.fecha.toDate) {
                        dataText = log.fecha.toDate().toLocaleString('ca-ES');
                      } else if (log.fecha.seconds) {
                        dataText = new Date(log.fecha.seconds * 1000).toLocaleString('ca-ES');
                      } else {
                        dataText = String(log.fecha);
                      }
                    }

                    return (
                      <div 
                        key={log.id}
                        className={`p-4 rounded-xl border text-xs ${
                          darkMode ? "bg-slate-950/20 border-slate-850" : "bg-white border-slate-150"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2.5 flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans font-bold text-slate-600 dark:text-slate-400">Administrador/Soci:</span>
                            <span className="text-indigo-400 font-extrabold">{log.quiRealitzaNom}</span>
                            <span className="text-slate-400 dark:text-slate-500 text-[10px]">({log.quiRealitzaEmail})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold">{dataText}</span>
                        </div>

                        <div className={`p-2.5 rounded-lg border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-100"} flex flex-col md:flex-row justify-between items-start md:items-center gap-2`}>
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Usuari destí del canvi:</p>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">
                              {log.usuariAfectatNom} <span className="font-mono text-[10px] text-slate-400">({log.usuariAfectatEmail})</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1.5 md:pt-0">
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-slate-100 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                              {log.rolAnterior}
                            </span>
                            <span className="text-indigo-500 font-bold">➔</span>
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${getRolBadgeClass(log.rolNou)}`}>
                              {log.rolNou}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
