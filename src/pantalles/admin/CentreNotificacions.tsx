import React, { useState, useMemo, useEffect } from "react";
import { 
  Bell, 
  Send, 
  Smartphone, 
  Mail, 
  Clock, 
  Database, 
  Info, 
  Save, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  History,
  Copy,
  Users,
  ArrowRight,
  ArrowLeft,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

// Comentari planer per a no-programadors:
// Gestió estructurada d'operacions i errors de bases de dades amb Firebase per reportar incidències.
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, setErrorState?: (msg: string | null) => void) {
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (setErrorState) {
    let cleanMsg = "S'ha produït un error de Firebase";
    const erStr = errInfo.error;
    if (erStr.includes("permission-denied") || erStr.toLowerCase().includes("permission")) {
      cleanMsg = "Accés denegat (Missing or insufficient permissions): La teva sessió no té els permisos suficients d'administració de Firestore per llistar, crear o editar notificacions oficials d'OposiCAT en aquesta base de dades.";
    } else {
      cleanMsg = `Error de base de dades Firestore [${operationType}] a [${path}]: ${erStr}`;
    }
    setErrorState(cleanMsg);
  } else {
    throw new Error(JSON.stringify(errInfo));
  }
}

// Definim les propietats de connexió, per exemple si s'activa el mode fosc
interface NotificationProps {
  darkMode: boolean;
}

// Tipus de canals on podem enviar notificacions segons el Pas 1
type CanalNotificacio = "WEB_APP" | "EMAIL" | "PUSH_MOBIL";

// Acció final que l'usuari tria fer al Pas 2
type AccioNotificacio = "ENVIAR" | "GUARDAR" | "PROGRAMAR";

// Tipus d'elements d'historial
interface ElementHistorial {
  id: string;
  titol: string;
  cos: string;
  canal: CanalNotificacio;
  accio: AccioNotificacio;
  dataProgramada?: string;
  horaProgramada?: string;
  audiència: string;
  dataCreacio: string;
  suspesa?: boolean; // Comentari planer: indica si l'avís futur ha estat aturat o suspès temporalment.
}

export default function CentreNotificacions({ darkMode }: NotificationProps) {
  // Com comentari planer per a no-programadors:
  // Aquest estat serveix per recordar quina de les 4 opcions principals tenim obertes.
  // Si és 'null', vol dir que estem a la pantalla inicial gran de triar opció ("Que vols fer?").
  // Si té un valor ('generar', 'reutilitzar', 'programar', 'altres'), mostrarem aquella pantalla,
  // però mantenint la barra superior horitzontal amb els 4 botons ràpids per canviar, com demana el croquis de l'usuari.
  const [opcioActiva, setOpcioActiva] = useState<"generar" | "reutilitzar" | "programar" | "altres" | null>(null);

  // -------------------------------------------------------------
  // ESTATS DE LA SECCIÓ: GENERAR NOTIFICACIÓ (Pas 1 i Pas 2)
  // -------------------------------------------------------------
  const [pasActual, setPasActual] = useState<1 | 2>(1);
  const [canalSeleccionat, setCanalSeleccionat] = useState<CanalNotificacio>("WEB_APP");
  const [titol, setTitol] = useState("");
  const [cos, setCos] = useState("");
  const [accioFinal, setAccioFinal] = useState<AccioNotificacio>("ENVIAR");

  // Estat de programació (només visible si es tria PROGRAMAR)
  const [dataProgramacio, setDataProgramacio] = useState("");
  const [horaProgramacio, setHoraProgramacio] = useState("");
  const [audiènciaSeleccionada, setAudiènciaSeleccionada] = useState("tots"); // tots, premium, actius

  // Estat del quadre de confirmació d'estàs segur
  const [mostraConfirmaModal, setMostraConfirmaModal] = useState(false);
  
  // Explicació per a no-programadors: Aquest estat ("enviant") serveix com un "semàfor" de seguretat.
  // Quan l'administrador prem el botó d'enviar, es posa en "cert" per bloquejar qualsevol clic addicional.
  // Això evita que si algun botó es prem dues vegades o s'impacienta mentre es fa la connexió, es dupliquin de cop les notificacions.
  const [enviant, setEnviant] = useState(false);
  
  // Estat de notificació d'èxit temporal (banner verd superior)
  const [missatgeExit, setMissatgeExit] = useState<string | null>(null);
  // Estat de notificació d'error temporal (banner vermell superior)
  const [missatgeError, setMissatgeError] = useState<string | null>(null);

  // -------------------------------------------------------------
  // ESTATS DE LES PESTANYES INTERNES D'ALERTA PROGRAMADA (OPCIÓ 3)
  // -------------------------------------------------------------
  // Com comentari planer per a no-programadors:
  // 'pestanyaProgramar' permet saber si l'administrador vol veure el formulari per dissenyar una nova alerta programada,
  // o si vol saltar a la pestanya de gestió on hi ha la cua de totes les alertes programades pendents de llançament futur.
  const [pestanyaProgramar, setPestanyaProgramar] = useState<"crear" | "llista">("crear");
  // Desem l'identificador de la notificació programada que l'usuari estigui modificant en aquell moment.
  const [editantAlertaId, setEditantAlertaId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // DADES SIMULADES PER A REUTILITZAR I HISTORIAL (LEGO ARQUITECTURA)
  // -------------------------------------------------------------
  // Com comentari planer per a no-programadors:
  // Aquí tenim una llista d'anteriors notificacions ja creades que es poden duplicar o "reutilitzar" amb un sol clic.
  const [pantillesReutilitzables, setPantillesReutilitzables] = useState<ElementHistorial[]>([
    {
      id: "p1",
      titol: "🚨 canvi de data per al simulacre global",
      cos: "Molt important: el simulacre previst per demà dissabte es trasllada de forma extraordinària a diumenge a les 10:00h per tasques de manteniment del servidor d'exàmens.",
      canal: "WEB_APP",
      accio: "ENVIAR",
      audiència: "Tots els Estudiants (General)",
      dataCreacio: "Fa 2 dies"
    },
    {
      id: "p2",
      titol: "📚 Nou contingut afegit al Tema 1.3 de l'Àmbit A (Estructura de la Policia)",
      cos: "S'ha publicat un nou resum explicatiu i una infografia sintetitzada sobre el Consell de la Policia de la Generalitat. Descarrega-ho a la teva zona personal.",
      canal: "EMAIL",
      accio: "ENVIAR",
      audiència: "Només Premium Actius",
      dataCreacio: "Fa 1 setmana"
    },
    {
      id: "p3",
      titol: "⚠️ Recordatori d'estudi de cap de setmana",
      cos: "No deixis que es refredin els teus coneixements! Fes avui un repàs ràpid de 20 preguntes aleatòries de l'Àmbit de Seguretat Ciutadana.",
      canal: "PUSH_MOBIL",
      accio: "ENVIAR",
      audiència: "Tots els Estudiants (General)",
      dataCreacio: "Fa 2 setmanes"
    }
  ]);

  // Historial d'accions realitzat on anem guardant el que fa l'administrador
  const [historialEnviades, setHistorialEnviades] = useState<ElementHistorial[]>([]);

  // Com comentari planer per a no-programadors:
  // Connectem en temps real la llista de notificacions amb Firestore.
  // D'aquesta manera, quan un administrador genera, edita, suspèn o elimina una alerta,
  // el canvi es reflectirà immediatament a l'escriptori del backoffice de tothom.
  useEffect(() => {
    const q = query(collection(db, "notificacions"), orderBy("creadaEl", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ElementHistorial[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let dataCreacio = "Avui";
          if (data.creadaEl) {
            if (typeof data.creadaEl.toDate === "function") {
              dataCreacio = data.creadaEl.toDate().toLocaleString("ca-ES", { hour12: false });
            } else if (typeof data.creadaEl === "string") {
              dataCreacio = new Date(data.creadaEl).toLocaleString("ca-ES", { hour12: false });
            }
          }
          items.push({
            id: docSnap.id,
            titol: data.titol || "",
            cos: data.cos || "",
            canal: data.canal || "WEB_APP",
            accio: data.accio || "ENVIAR",
            dataProgramada: data.dataProgramada,
            horaProgramada: data.horaProgramada,
            audiència: data.audiencia || "Tots els Estudiants (General)",
            dataCreacio,
            suspesa: data.suspesa ?? false,
          });
        });
        setHistorialEnviades(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "notificacions", setMissatgeError);
      }
    );
    return () => unsubscribe();
  }, []);

  // -------------------------------------------------------------
  // LÒGICA I CÀLCULS EN TEMPS REAL (USEMEMO)
  // -------------------------------------------------------------
  // Com comentari planer per a no-programadors:
  // Es defineixen límits lògics de caràcters per a les notificacions per evitar que els textos siguin massa llargs 
  // i es vegin malament a les pantalles petites dels mòbils de l'usuari.
  const limitCaracters = useMemo(() => {
    if (canalSeleccionat === "PUSH_MOBIL") {
      return { titol: 35, cos: 100 };
    }
    if (canalSeleccionat === "WEB_APP") {
      return { titol: 60, cos: 280 };
    }
    // Per Correu Electrònic donem molt més marge
    return { titol: 110, cos: 1500 };
  }, [canalSeleccionat]);

  // Funció per validar i passar al Pas 2
  const tractarSegüentPas = () => {
    if (!titol.trim()) {
      alert("Si us plau, introdueix un títol abans de continuar.");
      return;
    }
    if (!cos.trim()) {
      alert("Si us plau, escriu el cos del missatge descriptiu de la notificació.");
      return;
    }
    setPasActual(2);
  };

  // Funció d'execució definitiva quan l'usuari diu "Sí, n'estic segur"
  const confirmarIExecutarAccio = async () => {
    // Explicació per a no-programadors: Si la notificació ja s'està processant o enviant,
    // aturem de forma immediata l'execució per protegir el sistema i no crear brossa duplicada.
    if (enviant) return;
    setEnviant(true);

    // Netegem qualsevol error o missatge previ d'intents de dades anteriors
    setMissatgeError(null);
    setMissatgeExit(null);

    // Si hem escollit programar, hem de demanar la data d'enviament obligatòria abans
    if (accioFinal === "PROGRAMAR" && (!dataProgramacio || !horaProgramacio)) {
      alert("Atenció: si tries 'Programar' has d'omplir el dia i l'hora de llançament futur.");
      setMostraConfirmaModal(false);
      setEnviant(false);
      return;
    }

    try {
      const emailCreador = auth.currentUser?.email || "v2_administrador@oposicat.cat";

      if (editantAlertaId) {
        // ACTUALITZACIÓ EN FIRESTORE
        const docRef = doc(db, "notificacions", editantAlertaId);
        await updateDoc(docRef, {
          titol: titol,
          cos: cos,
          canal: canalSeleccionat,
          dataProgramada: dataProgramacio || "",
          horaProgramada: horaProgramacio || "",
          audiencia: audiènciaSeleccionada === "tots" ? "Tots els Estudiants (General)" : "Només Premium Actius",
        });

        setEditantAlertaId(null);
        setMissatgeExit(`📝 S'ha modificat la notificació "${titol}" correctament a Firestore!`);
        setMostraConfirmaModal(false);
        
        // Buidem el formulari
        setTitol("");
        setCos("");
        setDataProgramacio("");
        setHoraProgramacio("");
        
        // Explicació per a no-programadors: Alliberem el semàfor de seguretat un cop acabada la feina
        setEnviant(false);

        setTimeout(() => {
          setMissatgeExit(null);
          setPestanyaProgramar("llista");
        }, 2000);
        return;
      }

      // CREACIÓ O PROGRAMACIÓ EN FIRESTORE
      const novaNotifPayload = {
        titol: titol,
        cos: cos,
        canal: canalSeleccionat,
        accio: accioFinal,
        dataProgramada: accioFinal === "PROGRAMAR" ? dataProgramacio : "",
        horaProgramada: accioFinal === "PROGRAMAR" ? horaProgramacio : "",
        audiencia: audiènciaSeleccionada === "tots" ? "Tots els Estudiants (General)" : "Només Premium Actius",
        creadaEl: serverTimestamp(),
        creadaPer: emailCreador,
        suspesa: false
      };

      await addDoc(collection(db, "notificacions"), novaNotifPayload);

      // Explicació per a no-programadors: Si l'escola de Mossos tria ENVIAR l'alerta al moment en lloc de programar o desar de plantilla,
      // iniciem una crida immediata al nostre servidor (Backend) per demanar-li que busqui i faci sonar les sirenes dels dispositius mòbils en calent de veritat.
      if (accioFinal === "ENVIAR") {
        try {
          const respostaServer = await fetch("/api/notificar-dispositius", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              titol: titol,
              cos: cos,
              canal: canalSeleccionat,
              audiencia: audiènciaSeleccionada
            })
          });
          const resultatPush = await respostaServer.json();
          console.log("[FRONTEND PUSH] Resposta de retransmissió de segon pla del servidor:", resultatPush);
        } catch (errorEnviament) {
          console.warn("[FRONTEND PUSH] Avís del servidor a l'enviament en segon pla, utilitzant mode simulador de proves d'arquitectura.", errorEnviament);
        }
      }

      // Definim el missatge bonic d'èxit segons el tipus d'acció realitzada
      let textÈxit = "";
      if (accioFinal === "ENVIAR") {
        textÈxit = `🚀 S'ha enviat i publicat la notificació "${titol}" correctament a Firestore!`;
      } else if (accioFinal === "GUARDAR") {
        textÈxit = `💾 S'ha desat la notificació com un esborrany o plantilla a Firestore.`;
      } else {
        textÈxit = `⏰ Notificació programada correctament al núvol pel dia ${dataProgramacio} a les ${horaProgramacio}.`;
      }

      setMissatgeExit(textÈxit);
      setMostraConfirmaModal(false);

      // Buidem el formulari un cop completat
      setTitol("");
      setCos("");
      setPasActual(1);
      
      // Explicació per a no-programadors: Alliberem el semàfor abans de reencaminar l'escriptori administratiu
      setEnviant(false);

      // Tanquem el banner verd automàticament als 5 segons
      setTimeout(() => {
        setMissatgeExit(null);
        // Comentari planer per a no-programadors:
        // Si hem programat una alerta directament des de la secció de programació,
        // ens quedem a la secció canviant el llistat a la pestanya de la cua per verificar el canvi.
        if (opcioActiva === "programar") {
          setPestanyaProgramar("llista");
        } else {
          setOpcioActiva("altres");
        }
      }, 3200);

    } catch (error) {
      setMostraConfirmaModal(false);
      setEnviant(false);
      handleFirestoreError(error, editantAlertaId ? OperationType.UPDATE : OperationType.CREATE, "notificacions", setMissatgeError);
    }
  };

  // Funció per reutilitzar una plantilla del llistat directament amb un clic
  const tractarReutilitzacioDirecta = (notif: ElementHistorial) => {
    setCanalSeleccionat(notif.canal);
    setTitol(notif.titol);
    setCos(notif.cos);
    setPasActual(1);
    setOpcioActiva("generar");
    
    // Alerta visual de recuperació de plantilla
    setMissatgeExit(`📋 S'han carregat les dades de: "${notif.titol}" al creador principal.`);
    setTimeout(() => setMissatgeExit(null), 3000);
  };

  // Com comentari planer per a no-programadors:
  // Permet aturar (suspendre) o tornar a activar un avís que tenim en cua futur de Mossos d'Esquadra a Firestore.
  const commutaSuspensioNotificacio = async (id: string) => {
    try {
      const trobat = historialEnviades.find(item => item.id === id);
      if (trobat) {
        const nouEstat = !trobat.suspesa;
        const docRef = doc(db, "notificacions", id);
        await updateDoc(docRef, {
          suspesa: nouEstat
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notificacions/${id}`);
    }
  };

  // Com comentari planer per a no-programadors:
  // Carrega les dades de l'avís de la cua que volem editar als camps del formulari
  // i canvia la visualització a la pestanya on s'edita l'alerta.
  const prepararEdicioNotificacio = (item: ElementHistorial) => {
    setTitol(item.titol);
    setCos(item.cos);
    setCanalSeleccionat(item.canal);
    setDataProgramacio(item.dataProgramada || "");
    setHoraProgramacio(item.horaProgramada || "");
    setAudiènciaSeleccionada(item.audiència === "Tots els Estudiants (General)" ? "tots" : "premium");
    setEditantAlertaId(item.id);
    setPestanyaProgramar("crear");
  };

  // Com comentari planer per a no-programadors:
  // Cancel·la l'edició d'una alerta programada i buida de nou el formulari de treball.
  const cancel·larEdicioNotificacio = () => {
    setTitol("");
    setCos("");
    setDataProgramacio("");
    setHoraProgramacio("");
    setEditantAlertaId(null);
  };

  // Funció per esborrar algun avís de l'historial o de la cua de programades
  const esborrarNotificacio = async (id: string) => {
    if (window.confirm("Vols eliminar definitivament aquest registre de notificació de la base de dades Firestore?")) {
      try {
        await deleteDoc(doc(db, "notificacions", id));
        if (editantAlertaId === id) {
          cancel·larEdicioNotificacio();
        }
        setMissatgeExit("🗑️ S'ha eliminat la notificació correctament de Firestore!");
        setTimeout(() => setMissatgeExit(null), 2500);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `notificacions/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6" id="wrapper_centre_notificacions">
      
      {/* CAPÇALERA PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10" id="capçalera_seccio_comunicacio">
        <div>
          <span className="text-[10px] font-bold uppercase text-blue-500 tracking-[0.25em] block mb-1">Panell d'Administració OposiCAT</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Bell className="text-blue-500 w-8 h-8 animate-bounce" />
            Centre de Notificacions
          </h2>
          <p className="text-xs text-slate-450 mt-1 max-w-3xl">
            Crea, programa, automatitza i llança avisos immediats per a aplicacions web, missatges de correu electrònic corporatius o alertes push natives als telèfons intel·ligents dels opositors a Catalunya.
          </p>
        </div>

        {/* Botó de restablir pàgina o tornar a la landing inicial */}
        {opcioActiva !== null && (
          <button
            onClick={() => setOpcioActiva(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 rounded-xl text-xs font-bold transition-all"
            id="boto_tornar_inici_pantalla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Pantalla d'Aterrada Inicial
          </button>
        )}
      </div>

      {/* BANNER VERD D'ÈXIT TEMPORAL */}
      <AnimatePresence>
        {missatgeExit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-3"
            id="banner_notificacio_exit"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{missatgeExit}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BANNER VERMELL D'ERROR DE FIRESTORE / FIREBASE */}
      <AnimatePresence>
        {missatgeError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            id="banner_notificacio_error"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <strong className="block uppercase text-[10px] tracking-wider text-red-500 font-black">Error detectat en temps real</strong>
                <span className="leading-relaxed">{missatgeError}</span>
              </div>
            </div>
            <button 
              onClick={() => setMissatgeError(null)}
              className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-red-500/20 text-red-350 hover:bg-red-500/35 transition-all cursor-pointer shrink-0"
              type="button"
            >
              Tancar avís
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          SELECTOR SUPERIOR HORITZONTAL EN ALT DE TOT DESPRÉS DEL TÍTOL
          Només és visible quan ja hem entrat dins una opció (no estem a landing)
         ------------------------------------------------------------- */}
      {opcioActiva !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-2 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap gap-2 items-center"
          id="selector_horitzontal_superior"
        >
          {/* OPCIÓ 1 */}
          <button
            onClick={() => { setOpcioActiva("generar"); setPasActual(1); }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              opcioActiva === "generar"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-black"
                : "bg-slate-950/40 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
            id="nav_sup_generar"
          >
            <Send className="w-3.5 h-3.5" />
            1. Generar Notificació
          </button>

          {/* OPCIÓ 2 */}
          <button
            onClick={() => setOpcioActiva("reutilitzar")}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              opcioActiva === "reutilitzar"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-black"
                : "bg-slate-950/40 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
            id="nav_sup_reutilitzar"
          >
            <Copy className="w-3.5 h-3.5" />
            2. Reutilitzar una
          </button>

          {/* OPCIÓ 3 */}
          <button
            onClick={() => { setOpcioActiva("programar"); setPasActual(1); setAccioFinal("PROGRAMAR"); }}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              opcioActiva === "programar"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-black"
                : "bg-slate-950/40 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
            id="nav_sup_programar"
          >
            <Clock className="w-3.5 h-3.5" />
            3. Programar d'avís
          </button>

          {/* OPCIÓ 4 */}
          <button
            onClick={() => setOpcioActiva("altres")}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              opcioActiva === "altres"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-black"
                : "bg-slate-950/40 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
            id="nav_sup_altres"
          >
            <History className="w-3.5 h-3.5" />
            4. Altres i Historial
          </button>
        </motion.div>
      )}

      {/* -------------------------------------------------------------
          PANTALLA D'ATERRIZATGE INICIAL: "Què vols fer?"
          A pareix en gran, en vertical, amb bonic estil bento-grid d'OposiCAT
         ------------------------------------------------------------- */}
      {opcioActiva === null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          id="pantalla_aterratge_notificacions"
        >
          {/* Títol indicador central */}
          <div className="text-center py-6 border-b border-white/5 space-y-2">
            <h3 className="text-3xl font-black text-white">Què vols fer avui?</h3>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Tria una de les quatre operacions verticals de sota per començar a dissenyar el flux de missatges de l'aplicació.
            </p>
          </div>

          <div className="flex flex-col gap-4" id="blocs_grans_verticals">
            
            {/* OPCIÓ A: Generar Notificació */}
            <button
              onClick={() => { setOpcioActiva("generar"); setPasActual(1); }}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-blue-500 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all group duration-300 relative overflow-hidden w-full cursor-pointer"
              id="bloc_aterrada_generar"
            >
              <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <Send className="w-48 h-48 text-blue-500 rotate-12" />
              </div>
              <div className="flex items-start md:items-center gap-5 z-10">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-all shrink-0">
                  <Send className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.15em] block">Pas a pas en calent</span>
                  <h4 className="text-xl font-black text-white">Generar una notificació</h4>
                  <p className="text-xs text-slate-400 leading-normal max-w-2xl">
                    Redacta un títol, selecciona el canal de distribució i configura les accions llançant-la al Pas 2 de forma guiada i simple.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-500 text-xs font-bold shrink-0 self-end md:self-auto z-10 bg-blue-500/10 group-hover:bg-blue-500/20 px-3.5 py-2 rounded-xl transition-all">
                <span>Començar</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* OPCIÓ B: Reutilitzar anterior */}
            <button
              onClick={() => setOpcioActiva("reutilitzar")}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-blue-500 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all group duration-300 relative overflow-hidden w-full cursor-pointer"
              id="bloc_aterrada_reutilitzar"
            >
              <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <Copy className="w-48 h-48 text-indigo-500 rotate-12" />
              </div>
              <div className="flex items-start md:items-center gap-5 z-10">
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-all shrink-0">
                  <Copy className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.15em] block font-black">Estalvia feina</span>
                  <h4 className="text-xl font-black text-white">Reutilitzar una notificació</h4>
                  <p className="text-xs text-slate-400 leading-normal max-w-2xl">
                    Tria missatges passats d'èxit de la llista d'esborranys i carrega'ls al creador en 1 sol clic per estalviar temps.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold shrink-0 self-end md:self-auto z-10 bg-indigo-500/10 group-hover:bg-indigo-500/20 px-3.5 py-2 rounded-xl transition-all">
                <span>Explorar plantilles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* OPCIÓ C: Programar notificació */}
            <button
              onClick={() => { setOpcioActiva("programar"); setPasActual(1); setAccioFinal("PROGRAMAR"); }}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-blue-500 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all group duration-300 relative overflow-hidden w-full cursor-pointer"
              id="bloc_aterrada_programar"
            >
              <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <Clock className="w-48 h-48 text-purple-500 rotate-12" />
              </div>
              <div className="flex items-start md:items-center gap-5 z-10">
                <div className="w-14 h-14 bg-purple-500/10 text-purple-400 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-all shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-400 tracking-[0.15em] block">Sincronització intel·ligent</span>
                  <h4 className="text-xl font-black text-white">Programar una notificació</h4>
                  <p className="text-xs text-slate-400 leading-normal max-w-2xl">
                    Escriu els avisos avui de forma asíncrona i deixa que el sistema els enviï automàticament el dia que vulguis.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold shrink-0 self-end md:self-auto z-10 bg-purple-500/10 group-hover:bg-purple-500/20 px-3.5 py-2 rounded-xl transition-all">
                <span>Programar dia/hora</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* OPCIÓ D: Altres Accions i Historial */}
            <button
              onClick={() => setOpcioActiva("altres")}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-blue-500 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all group duration-300 relative overflow-hidden w-full cursor-pointer"
              id="bloc_aterrada_altres"
            >
              <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <History className="w-48 h-48 text-emerald-500 rotate-12" />
              </div>
              <div className="flex items-start md:items-center gap-5 z-10">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-all shrink-0">
                  <History className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.15em] block">Estat del servei</span>
                  <h4 className="text-xl font-black text-white">Altres accions i Historial</h4>
                  <p className="text-xs text-slate-400 leading-normal max-w-2xl">
                    Supervisa la llista dels darrers enviaments realitzats, llegeix consells de base de dades i històrics de l'app.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold shrink-0 self-end md:self-auto z-10 bg-emerald-500/10 group-hover:bg-emerald-500/20 px-3.5 py-2 rounded-xl transition-all">
                <span>Veure Historial</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>

          {/* SÈCCIÓ RECOMANACIÓ A FUTUR DE SEGURETAT DE FIRESTORE (SEGONS REGLA 6 D'AGENTS.MD) */}
          <div className="p-6 bg-blue-950/20 border border-blue-500/20 rounded-3xl space-y-3" id="consell_a_futur_firestore">
            <div className="flex items-center gap-2 text-blue-400">
              <Database className="w-5 h-5 shrink-0" />
              <h5 className="text-xs font-black uppercase tracking-wider">
                Et recomano, modificaria i/o recorda que pot passar... a futur
              </h5>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Quan integrem el Centre de Notificacions amb una col·lecció directa de Firestore anomenada <code>notificacions_enviades</code>, és indispensable afegir dades d'auditoria (com ara <code>correu_administrador</code> o timestamp del moment d'enviament). També un recordatori: a futur s'han de crear <strong>Regles d'Escriptura strictes a firestore.rules</strong>, fent que únicament els usuaris que disposin del camp <code>rol_usuari == 'admin'</code> al seu document de perfil personal de Firestore puguin escriure nous registres de notificació. Qualsevol intent d'escriptura per part d'un estudiant comú serà bloquejat instantàniament per Firebase, protegint-nos d'atacs de publicitat no desitjada!
            </p>
          </div>
        </motion.div>
      )}

      {/* -------------------------------------------------------------
          PANTALLA: OPCIÓ 1 (GENERAR NOTIFICACIÓ)
         ------------------------------------------------------------- */}
      {opcioActiva === "generar" && (
        <motion.div
          key="seccio_generadora"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          id="pantalla_opcio_generadora"
        >
          {/* Caixa de Formulari de passos (mida gran) */}
          <div className="lg:col-span-8 p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-6" id="bloc_form_pas_generar">
            
            {/* Selector d'indicació del pas superior */}
            <div className="flex items-center justify-between" id="indicador_de_pas_visual">
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase bg-slate-950 px-3 py-1.5 rounded-xl">
                ⚙️ PAS ACTUAL: <strong className="text-blue-500">{pasActual} de 2</strong>
              </span>

              <div className="flex gap-1.5" id="mini_punts_passos">
                <span className={`w-6 h-1.5 rounded-full ${pasActual >= 1 ? "bg-blue-500" : "bg-slate-750"}`} />
                <span className={`w-6 h-1.5 rounded-full ${pasActual === 2 ? "bg-blue-500" : "bg-slate-750"}`} />
              </div>
            </div>

            {/* FORMULARI PAS 1 */}
            {pasActual === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
                id="contingut_formulari_pas1"
              >
                {/* 1. TIPUS DE NOTIFICACIÓ (CANAL) */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-slate-300 tracking-wider block">
                    1. Tipus de notificació (Canal d'entrega)
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="grup_selectors_canal">
                    
                    {/* Canal WEB/APP */}
                    <button
                      type="button"
                      onClick={() => setCanalSeleccionat("WEB_APP")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        canalSeleccionat === "WEB_APP"
                          ? "bg-blue-500/10 border-blue-500 text-blue-400"
                          : "bg-slate-950/40 border-slate-850 text-slate-450 hover:bg-slate-950 hover:text-slate-300"
                      }`}
                      id="canal_boto_webapp"
                    >
                      <Bell className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                      <div>
                        <span className="text-xs font-black block text-slate-200">En l'APP / WEB</span>
                        <span className="text-[10px] text-slate-450 leading-relaxed block mt-0.5">Avís flotant a l'interior del portal d'estudiant de Mossos.</span>
                      </div>
                    </button>

                    {/* Canal EMAIL */}
                    <button
                      type="button"
                      onClick={() => setCanalSeleccionat("EMAIL")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        canalSeleccionat === "EMAIL"
                          ? "bg-blue-500/10 border-blue-500 text-blue-400"
                          : "bg-slate-950/40 border-slate-850 text-slate-450 hover:bg-slate-950 hover:text-slate-300"
                      }`}
                      id="canal_boto_email"
                    >
                      <Mail className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
                      <div>
                        <span className="text-xs font-black block text-slate-200">Correu Electrònic</span>
                        <span className="text-[10px] text-slate-450 leading-relaxed block mt-0.5">S'envia de forma robusta i asíncrona a la bústia de l'estudiant.</span>
                      </div>
                    </button>

                    {/* Canal MOBIL */}
                    <button
                      type="button"
                      onClick={() => setCanalSeleccionat("PUSH_MOBIL")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        canalSeleccionat === "PUSH_MOBIL"
                          ? "bg-blue-500/10 border-blue-500 text-blue-400"
                          : "bg-slate-950/40 border-slate-850 text-slate-450 hover:bg-slate-950 hover:text-slate-300"
                      }`}
                      id="canal_boto_pushmobil"
                    >
                      <Smartphone className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                      <div>
                        <span className="text-xs font-black block text-slate-200">Notificació al Mòbil</span>
                        <span className="text-[10px] text-[#8e9cae] leading-relaxed block mt-0.5">Avís push directe que fa vibrar el smartphone de l'opositor.</span>
                      </div>
                    </button>

                  </div>
                </div>

                {/* 2. TÍTOL DE LA NOTIFICACIÓ */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase text-slate-300 tracking-wider">
                      2. Títol de la notificació
                    </label>
                    <span className="text-[10px] font-mono text-slate-450">
                      Màxim: {titol.length} / {limitCaracters.titol} caràcters
                    </span>
                  </div>
                  <input
                    type="text"
                    value={titol}
                    maxLength={limitCaracters.titol}
                    onChange={(e) => setTitol(e.target.value)}
                    placeholder="Escriu el títol de la notificació..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 outline-none focus:border-blue-500 transition-all font-semibold"
                    id="input_titol_notif"
                  />
                  {canalSeleccionat !== "EMAIL" && (
                    <p className="text-[10px] text-slate-500 leading-snug">
                      * El títol s'escurçarà automàticament a les pantalles de telèfon per garantir una experiència elegant de notificació.
                    </p>
                  )}
                </div>

                {/* 3. COS O TEXT */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase text-slate-300 tracking-wider">
                      3. Cos de la notificació
                    </label>
                    <span className="text-[10px] font-mono text-slate-450">
                      Màxim: {cos.length} / {limitCaracters.cos} caràcters
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={cos}
                    maxLength={limitCaracters.cos}
                    onChange={(e) => setCos(e.target.value)}
                    placeholder="Proporciona el missatge o text explicatiu per llançar..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 outline-none focus:border-blue-500 transition-all leading-relaxed"
                    id="textarea_cos_notif"
                  />
                </div>

                {/* CONTROL DE SALT AL PAS 2 */}
                <div className="pt-4 border-t border-white/5 flex justify-end" id="control_boto_avançar">
                  <button
                    type="button"
                    onClick={tractarSegüentPas}
                    className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                    id="boto_pasar_pas2"
                  >
                    Anar al Pas 2: Triar Acció
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            ) : (
              // FORMULARI PAS 2
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
                id="contingut_formulari_pas2"
              >
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase text-slate-300 tracking-wider block">
                    1. Què vols fer amb la notificació ?
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" id="grup_botons_que_vols_fer">
                    
                    {/* ENVIAR LA NOTIFICACIO */}
                    <button
                      type="button"
                      onClick={() => setAccioFinal("ENVIAR")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        accioFinal === "ENVIAR"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                          : "bg-slate-950/40 border-slate-850 text-slate-450 hover:bg-slate-950 hover:text-slate-300"
                      }`}
                      id="accio_boto_enviar"
                    >
                      <Send className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold block text-slate-200">Enviar-la ara mateix</strong>
                        <span className="text-[10px] text-slate-450 leading-normal block mt-0.5">S'emetrà de forma immediata i directa (avís en viu).</span>
                      </div>
                    </button>

                    {/* ENVIAR I GUARDAR LA NOTIFICACIO */}
                    <button
                      type="button"
                      onClick={() => setAccioFinal("GUARDAR")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        accioFinal === "GUARDAR"
                          ? "bg-amber-500/10 border-amber-500 text-amber-400"
                          : "bg-slate-950/40 border-slate-850 text-slate-450 hover:bg-slate-950 hover:text-slate-300"
                      }`}
                      id="accio_boto_guardar"
                    >
                      <Save className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold block text-slate-200">Desar com a plantilla</strong>
                        <span className="text-[10px] text-slate-450 leading-normal block mt-0.5">Es guardarà a l'apartat de Reutilitzables de sota.</span>
                      </div>
                    </button>

                    {/* PROGRAMAR LA NOTIFICACIO */}
                    <button
                      type="button"
                      onClick={() => setAccioFinal("PROGRAMAR")}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        accioFinal === "PROGRAMAR"
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "bg-slate-950/40 border-slate-850 text-slate-450 hover:bg-slate-950 hover:text-slate-300"
                      }`}
                      id="accio_boto_programar"
                    >
                      <Clock className="w-5 h-5 shrink-0 text-purple-400 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold block text-slate-200">Programar dia i hora</strong>
                        <span className="text-[10px] text-slate-450 leading-normal block mt-0.5">S'agendarà en base temporal per a enviaments en diferit.</span>
                      </div>
                    </button>

                  </div>
                </div>

                {/* SEGMENT D'AUDIÈNCIA */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-300 tracking-wider block">
                    2. Selecciona l'audiència o grup de recepció:
                  </label>
                  <select
                    value={audiènciaSeleccionada}
                    onChange={(e) => setAudiènciaSeleccionada(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-200 cursor-pointer focus:border-blue-500 outline-none"
                    id="select_audiencia_recepcio"
                  >
                    <option value="tots">📢 Tots els Estudiants registrats a OposiCAT (Públic General)</option>
                    <option value="premium">💎 Només estudiants amb pla actiu de subscripció Premium (VIP)</option>
                  </select>
                </div>

                {/* DETALL DE DATA I HORA SI ES TRIA PROGRAMAR */}
                {accioFinal === "PROGRAMAR" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-xl bg-purple-950/10 border border-purple-500/25 grid grid-cols-1 md:grid-cols-2 gap-4"
                    id="formulari_detallat_data_hora"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#cf92ff]">Dia d'enviament:</span>
                      <input
                        type="date"
                        value={dataProgramacio}
                        onChange={(e) => setDataProgramacio(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                        id="input_data_programacio_especifica"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#cf92ff]">Hora d'enviament:</span>
                      <input
                        type="time"
                        value={horaProgramacio}
                        onChange={(e) => setHoraProgramacio(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                        id="input_hora_programacio_especifica"
                      />
                    </div>
                  </motion.div>
                )}

                {/* BOTONS FINALS D'ACCIO I ENRERE */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between" id="barra_navegacio_formulari_finals">
                  <button
                    type="button"
                    onClick={() => setPasActual(1)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-all"
                    id="boto_tornar_pas1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Enrere al Pas 1 (Edició)
                  </button>

                  <button
                    type="button"
                    onClick={() => setMostraConfirmaModal(true)}
                    className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                      accioFinal === "ENVIAR" ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                      accioFinal === "GUARDAR" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                      "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                    id="boto_disparar_accio_confirmar"
                  >
                    {accioFinal === "ENVIAR" && "Enviar notificació"}
                    {accioFinal === "GUARDAR" && "Desar plantilla"}
                    {accioFinal === "PROGRAMAR" && "Programar llançament"}
                  </button>
                </div>

              </motion.div>
            )}

          </div>

          {/* Maqueta dreta (Mobile Mockup) de Vista en viu del canal escollit */}
          <div className="lg:col-span-4 space-y-4" id="columna_maqueta_mobil_previsualitzacio">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">Previsualització del dispositiu:</span>
            
            <div className="p-3.5 bg-slate-950 rounded-[40px] border-4 border-slate-800 shadow-2xl relative" id="mobil_carcasa_mock">
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" /> {/* Notch del telèfon */}

              <div className="bg-slate-900 rounded-[30px] p-4 min-h-[300px] flex flex-col justify-between" id="contingut_pantalla_simulada">
                
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <span>OposiCAT • 09:41</span>
                  <span>📶 🔋</span>
                </div>

                {/* Renderització o notificació fictícia llançada en directe */}
                <div className="flex-1 flex flex-col justify-center py-4" id="bloc_notif_maquetat">
                  {!titol.trim() && !cos.trim() ? (
                    <span className="text-[10px] text-slate-500 leading-relaxed italic text-center block px-4">
                      * Previsualitzador en temps real. Al introduir lletres al títol i contingut de la part esquerra es pintarà el comportament del canal per a proves.
                    </span>
                  ) : (
                    <motion.div
                      key={canalSeleccionat}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2 text-left"
                      id="caixa_alerta_maqueta"
                    >
                      <div className="flex justify-between items-center text-[8px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                          <strong className="text-slate-300 font-extrabold uppercase">OposiCAT App</strong>
                        </div>
                        <span>Ara</span>
                      </div>

                      <h5 className="text-[11px] font-black leading-tight text-white line-clamp-1">
                        {titol || "(Sense Títol)"}
                      </h5>

                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-3">
                        {cos || "(Sense descripció...)"}
                      </p>

                      <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[8px] text-slate-500">
                        <span>Format de canal utilitzat:</span>
                        <strong className="text-blue-500 uppercase tracking-widest">{canalSeleccionat}</strong>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto" /> {/* Botó d'Inici de mòbil */}

              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* -------------------------------------------------------------
          PANTALLA: OPCIÓ 2 (REUTILITZAR ANTERIOR)
         ------------------------------------------------------------- */}
      {opcioActiva === "reutilitzar" && (
        <motion.div
          key="seccio_reutilitzar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
          id="pantalla_opcio_reutilitzadora"
        >
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Catàleg d'esborranys i plantilles ràpides</h3>
            <p className="text-xs text-slate-400">
              Usa qualsevol de les següents plantilles ja publicades amb èxit o guardades com a esborranys per llançar alertes un altre cop ràpidament.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="quadricula_reutilitzar">
            {pantillesReutilitzables.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col justify-between items-start space-y-4 hover:border-slate-700 transition-all"
                id={`card_reutilizable_${item.id}`}
              >
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-black uppercase text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded-lg">
                      Canal: {item.canal}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.dataCreacio}</span>
                  </div>

                  <h4 className="text-sm font-black text-white leading-tight">{item.titol}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.cos}</p>
                </div>

                <button
                  onClick={() => tractarReutilitzacioDirecta(item)}
                  className="px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-[11px] font-extrabold flex items-center gap-1.5 self-end"
                  id={`boto_carregar_plantilla_${item.id}`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Carregar i Editar dades
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* -------------------------------------------------------------
          PANTALLA: OPCIÓ 3 (PROGRAMAR NOTIFICACIÓ DES DE CREADOR INTEGRAT COOPERATIU)
         ------------------------------------------------------------- */}
      {opcioActiva === "programar" && (
        <motion.div
          key="seccio_programar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-6"
          id="pantalla_opcio_programar"
        >
          {/* Capçalera del mòdul de programació de canvis */}
          <div className="space-y-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="text-purple-500" />
                {editantAlertaId ? "Modificar alerta asíncrona de futur" : "Programar alerta asíncrona per al futur"}
              </h3>
              <p className="text-xs text-slate-450">
                L'arribada programada permet estalviar hores de treball de gestió corporativa. Configura les alertes de Mossos d'Esquadra que s'enviaran automàticament.
              </p>
            </div>
            {/* Comentari planer per a no-programadors: Botó per cancel·lar netejant tot si estem modificant una programació */}
            {editantAlertaId && (
              <button
                onClick={cancel·larEdicioNotificacio}
                className="px-3.5 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all text-xs font-bold"
                id="boto_cancel_edicio_programacio_super"
              >
                Cancel·lar Edició d'Avís
              </button>
            )}
          </div>

          {/* Sub-pestanyes internament segmentades: Facilita alternar entre crear de zero i veure la cua asíncrona prevista */}
          <div className="flex border-b border-slate-800 gap-1" id="sub_pestanyes_programar">
            <button
              onClick={() => {
                setPestanyaProgramar("crear");
              }}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
                pestanyaProgramar === "crear"
                  ? "bg-slate-950 border-slate-800 text-purple-400 font-extrabold"
                  : "bg-transparent border-transparent text-slate-450 hover:text-slate-350"
              }`}
              id="sub_pestanya_boto_crear"
            >
              {editantAlertaId ? "📝 Modificar alerta de futur" : "⏰ 1. Programar alerta asíncrona per al futur"}
            </button>
            <button
              onClick={() => {
                setPestanyaProgramar("llista");
              }}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-t border-x ${
                pestanyaProgramar === "llista"
                  ? "bg-slate-950 border-slate-800 text-purple-400 font-extrabold"
                  : "bg-transparent border-transparent text-slate-450 hover:text-slate-350"
              }`}
              id="sub_pestanya_boto_llista"
            >
              📂 2. Alertes programades ({historialEnviades.filter(item => item.accio === "PROGRAMAR").length})
            </button>
          </div>

          {/* SÈCCIÓ EN DOS CANALS INTERNS D'ACORD AMB LA TRIA VISUAL */}
          {pestanyaProgramar === "crear" ? (
            <div className="space-y-6" id="cos_pestanya_creacio_programat">
              {editantAlertaId && (
                <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl text-xs flex items-center justify-between" id="alerta_mode_edicio_visual">
                  <span className="font-semibold">⚠️ Mode Edició actiu: Estàs redefinint el llançament futur de l'avís d'administrador: <strong>{editantAlertaId}</strong>.</span>
                  <button onClick={cancel·larEdicioNotificacio} className="underline text-[10px] font-black uppercase hover:text-white">Descartar Canvis</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Títol de la notificació a programar:</label>
                  <input
                    type="text"
                    value={titol}
                    onChange={(e) => setTitol(e.target.value)}
                    placeholder="Exemple: 🚨 Recordatori de Simulacre Global..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                    id="programador_directe_titol"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">Canal d'entrega:</label>
                  <select
                    value={canalSeleccionat}
                    onChange={(e) => setCanalSeleccionat(e.target.value as CanalNotificacio)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white cursor-pointer"
                    id="programador_directe_canal"
                  >
                    <option value="WEB_APP">WEB / APP</option>
                    <option value="EMAIL">Correu Electrònic (EMAIL)</option>
                    <option value="PUSH_MOBIL">Mòbil / Telèfon intel·ligent (PUSH)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Cos o text secundari:</label>
                <textarea
                  rows={4}
                  value={cos}
                  onChange={(e) => setCos(e.target.value)}
                  placeholder="Escriu la descripció sencera de l'avís d'OposiCAT aquí..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  id="programador_directe_cos"
                />
              </div>

              <div className="p-4 bg-purple-950/10 border border-purple-500/20 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4" id="quadre_dia_hora_seccio_prog">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-400">Selecciona el dia d'enviament futur:</span>
                  <input
                    type="date"
                    value={dataProgramacio}
                    onChange={(e) => setDataProgramacio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    id="prog_date_direct"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-400">Selecciona l'hora exacta de llançament:</span>
                  <input
                    type="time"
                    value={horaProgramacio}
                    onChange={(e) => setHoraProgramacio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                    id="prog_time_direct"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {editantAlertaId && (
                  <button
                    onClick={cancel·larEdicioNotificacio}
                    className="px-5 py-3 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 font-bold text-xs uppercase tracking-wider transition-all"
                    id="boto_cancel_edició_form"
                  >
                    Netejar / Cancel·lar
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!titol.trim() || !cos.trim() || !dataProgramacio || !horaProgramacio) {
                      alert("Atenció: abans de guardar has d'omplir el títol, cos complet, data i hora de programació futurista.");
                      return;
                    }
                    setAccioFinal("PROGRAMAR");
                    setMostraConfirmaModal(true);
                  }}
                  className="px-5 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  id="boto_desat_programat_directe"
                >
                  <Calendar className="w-4 h-4" />
                  {editantAlertaId ? "Desar Canvis de la Programació" : "Guardar Llançament Programat"}
                </button>
              </div>
            </div>
          ) : (
            /* PESTANYA B: LLISTAT DE NOTIFICACIONS FUTURES EN CUA (AMB SUSPENDRE, MODIFICAR, ELIMINAR) */
            <div className="space-y-4" id="cos_pestanya_llista_programat">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden" id="taula_cua_programades_caixa">
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center" id="taula_cua_capcalera">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                    Cua de control horari futur ({historialEnviades.filter(item => item.accio === "PROGRAMAR").length} alertes en cua)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse inline-block" />
                    <span className="text-[10px] text-slate-500 font-mono">Processament asíncron: Actiu</span>
                  </div>
                </div>

                {historialEnviades.filter(item => item.accio === "PROGRAMAR").length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500 italic space-y-2">
                    <p>No hi ha notificacions programades per al futur en aquests moments.</p>
                    <button
                      onClick={() => setPestanyaProgramar("crear")}
                      className="px-4 py-2 bg-purple-600/15 text-purple-400 hover:bg-purple-600/35 transition-all text-[11px] rounded-lg mt-2 font-black uppercase tracking-wider"
                    >
                      + Programar una nova alerta ara mateix
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-850" id="llista_items_cua_taula">
                    {historialEnviades
                      .filter(item => item.accio === "PROGRAMAR")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5 hover:bg-slate-900/10 transition-all relative"
                          id={`fila_cua_${item.id}`}
                        >
                          <div className="space-y-2 max-w-3xl w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Canal */}
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400">
                                {item.canal === "WEB_APP" ? "📱 WEB / APP" : item.canal === "EMAIL" ? "✉️ CORREU ELECTRÒNIC" : "🔔 PUSH MOBIL"}
                              </span>

                              {/* A qui va dirigit */}
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-lg">
                                Dirigit a: {item.audiència}
                              </span>

                              {/* Estat de Suspensió (Comentari planer: Per a no-programadors, avisa ràpid si està en pausa) */}
                              <span className={`text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                item.suspesa
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.suspesa ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
                                {item.suspesa ? "⏸️ SUSPESA / PAUSA" : "▶️ ACTIVA A LA CUA"}
                              </span>
                            </div>

                            <h4 className="text-sm font-black text-white leading-tight">{item.titol}</h4>
                            <p className="text-xs text-slate-450 leading-relaxed max-w-2xl">{item.cos}</p>

                            {/* Informació de llançament futur */}
                            <div className="text-[10px] font-black text-purple-400 flex items-center gap-1.5 bg-purple-950/15 border border-purple-500/10 w-fit px-2.5 py-1 rounded-lg">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>S'enviarà el: {item.dataProgramada} a les {item.horaProgramada}</span>
                            </div>
                          </div>

                          {/* Accions de la targeta: Suspendre/Reprendre, Modificar i Eliminar */}
                          <div className="flex items-center gap-2 shrink-0 self-end xl:self-auto" id={`grup_botons_cua_${item.id}`}>
                            {/* Botó de Suspendre / Activar */}
                            <button
                              onClick={() => commutaSuspensioNotificacio(item.id)}
                              className={`px-3 py-2 rounded-xl transition-all text-xs font-bold flex items-center gap-1 ${
                                item.suspesa
                                  ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white"
                                  : "bg-amber-600/10 text-amber-400 border border-amber-500/20 hover:bg-amber-600 hover:text-white"
                              }`}
                              title={item.suspesa ? "Reprendre llançament de l'avís" : "Suspendre/Aturar enviament futur"}
                              id={`boto_suspensio_${item.id}`}
                            >
                              {item.suspesa ? "▶️ Activar" : "⏸️ Suspendre"}
                            </button>

                            {/* Botó de Modificar */}
                            <button
                              onClick={() => prepararEdicioNotificacio(item)}
                              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
                              title="Modificar dades de l'avís"
                              id={`boto_edicio_${item.id}`}
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Modificar</span>
                            </button>

                            {/* Botó d'Eliminar */}
                            <button
                              onClick={() => esborrarNotificacio(item.id)}
                              className="p-2.5 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all shrink-0"
                              title="Eliminar l'alerta"
                              id={`boto_eliminacio_cua_${item.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* -------------------------------------------------------------
          PANTALLA: OPCIÓ 4 (ALTRES ACCIONS I HISTORIAL INTEGRAT)
         ------------------------------------------------------------- */}
      {opcioActiva === "altres" && (
        <motion.div
          key="seccio_altres"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
          id="pantalla_opcio_altres_historial"
        >
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="text-emerald-500" />
              Historial d'alertes en curs i registrades
            </h3>
            <p className="text-xs text-slate-450">
              Llista detallada d'esdeveniments que s'han llançat cap a la comunitat d'opositors de Mossos a Catalunya per auditar el comportament.
            </p>
          </div>

          {/* TAULA DE REGISTRE HISTÒRIC */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden" id="taula_historial_caixa">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center" id="taula_capçalera_seccio">
              <span className="text-xs font-bold text-slate-300">Notificacions de l'aplicació ({historialEnviades.length})</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulseinline-block" />
                <span className="text-[10px] text-slate-400 font-bold">Servidor de cues: Actiu i funcionant</span>
              </div>
            </div>

            {historialEnviades.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                No hi ha notificacions registrades en el llistat històric de cues de distribució d'OposiCAT.
              </div>
            ) : (
              <div className="divide-y divide-slate-800" id="llista_items_taula">
                {historialEnviades.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900/20 transition-all"
                    id={`fila_historial_${item.id}`}
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/25 text-blue-400">
                          {item.canal}
                        </span>
                        
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          item.accio === "PROGRAMAR" ? "bg-purple-500/25 text-purple-400" : "bg-emerald-500/25 text-emerald-400"
                        }`}>
                          {item.accio}
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono">
                          Llançat: {item.dataCreacio}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200">{item.titol}</h4>
                      <p className="text-[11px] text-slate-450 leading-relaxed">{item.cos}</p>

                      {item.dataProgramada && (
                        <div className="text-[9px] font-bold text-purple-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Programada per: {item.dataProgramada} a les {item.horaProgramada}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => esborrarNotificacio(item.id)}
                      className="p-2 rounded bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all shrink-0"
                      title="Eliminar de l'historial"
                      id={`boto_maper_${item.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* -------------------------------------------------------------
          MODAL INTEGRAT D'ESTÀS SEGUR? DE SEGURETAT DE PASSOS D'OPOSICAT
         ------------------------------------------------------------- */}
      <AnimatePresence>
        {mostraConfirmaModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="modal_estas_segur_notificacio">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              id="contingut_intern_modal"
            >
              <div className="flex items-center gap-3 text-yellow-500">
                <AlertTriangle className="w-8 h-8 shrink-0" />
                <div>
                  <h4 className="text-md font-black text-white">Estàs completament segur?</h4>
                  <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest block mt-0.5">Control de seguretat administratiu</span>
                </div>
              </div>

              <div className="text-xs text-slate-350 space-y-2 leading-relaxed">
                <p>Estàs a punt de guardar i executar la següent acció comunicativa d'OposiCAT:</p>
                
                <div className="p-3 bg-slate-950 rounded-xl space-y-1 text-slate-400">
                  <div className="text-[9px] font-black text-blue-500 uppercase">Títol de la notificació:</div>
                  <strong className="text-white text-xs block truncate">{titol || "(Sense Títol)"}</strong>
                  
                  <div className="text-[9px] font-black text-blue-500 uppercase mt-2">Canal i Accionadors:</div>
                  <span className="text-slate-300 font-bold block">{canalSeleccionat} | {accioFinal}</span>
                </div>
                
                <p className="text-slate-400 italic">
                  * A Catalunya molts opositors preparen la seva prova intensament, per la qual cosa qualsevol missatge arriba instantàniament als seus dispositius reals o correus!
                </p>
              </div>

               <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5" id="botons_modal_confirm">
                <button
                  type="button"
                  onClick={() => !enviant && setMostraConfirmaModal(false)}
                  disabled={enviant}
                  className={`px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold transition-all ${
                    enviant 
                      ? "text-slate-550 opacity-50 cursor-not-allowed" 
                      : "hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                  }`}
                  id="boto_no_modal"
                >
                  No, cancel·lar
                </button>
                <button
                  type="button"
                  onClick={confirmarIExecutarAccio}
                  disabled={enviant}
                  className={`px-5 py-2.5 rounded-xl text-xs text-white font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
                    enviant 
                      ? "bg-blue-800 opacity-60 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer"
                  }`}
                  id="boto_si_modal_moure"
                >
                  {enviant ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processant...
                    </>
                  ) : (
                    "Sí, n'estic segur"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
