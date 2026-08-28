import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Brain, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  X, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  HelpCircle,
  BookOpen,
  ArrowRight,
  FileText,
  ChevronLeft
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, query, collectionGroup, doc, getDoc, setDoc, writeBatch, increment } from 'firebase/firestore';

// Explicació per a no-programadors:
// Definim l'estructura que tindran les preguntes reals extretes directament de Firestore.
interface Question {
  id: string | number;
  pregunta: string;
  opcions: string[];
  correcta: number;
  explicacio: string;
  ambit?: string;
  tema?: number;
  capitol?: number;
  any?: string | number;
  examenId?: string;
  status?: 'activa' | 'suspesa';
}

// Interfície de propietats si calguessin en el futur
interface PropsExamensOficials {
  onTornar?: () => void;
}

export default function WebWorkspacePCExamensOficials({ onTornar }: PropsExamensOficials) {
  // Explicació per a no-programadors:
  // Estats per a la càrrega adaptativa i de progrés d'estadístiques reals de l'estudiant.
  const [loadingStats, setLoadingStats] = useState(true);
  const [totalEncerts, setTotalEncerts] = useState(0);
  const [totalErrades, setTotalErrades] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);
  
  // Guardem l'examen on l'usuari té millors mètriques i on més ha fallat de forma persistent
  const [millorExamen, setMillorExamen] = useState<{ id: string, name: string, percent: number } | null>(null);
  const [pitjorExamen, setPitjorExamen] = useState<{ id: string, name: string, percent: number } | null>(null);

  // Estat del simulador interactiu de test (igual de potent que el d'OposiMossos)
  const [simuladorActiu, setSimuladorActiu] = useState(false);
  const [preguntesTest, setPreguntesTest] = useState<Question[]>([]);
  const [loadingPreguntes, setLoadingPreguntes] = useState(false);

  // Seleccions de la configuració de la prova
  const [tab, setTab] = useState<'examen' | 'errades'>('examen');
  const [examenSeleccionat, setExamenSeleccionat] = useState<string>('');
  const [numPreguntes, setNumPreguntes] = useState<number>(30);
  const [tempsLlimitMinuts, setTempsLimitMinuts] = useState<string>('45');

  // Estats interns de la resolució de l'examen en curs
  const [preguntaActualIdx, setPreguntaActualIdx] = useState(0);
  const [respostaSeleccionadaIdx, setRespostaSeleccionadaIdx] = useState<number | null>(null);
  const [encertsExamen, setEncertsExamen] = useState(0);
  const [erradesExamen, setErradesExamen] = useState(0);
  const [finalitzatExamen, setFinalitzatExamen] = useState(false);
  const [segonsRestants, setSegonsRestants] = useState<number | null>(null);
  const [historialRespostesTest, setHistorialRespostesTest] = useState<Record<number, number>>({});
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [realQuestionsCount, setRealQuestionsCount] = useState(0);

  // Llista d'anys històrics reals amb preguntes a l'oposició
  const EXAMENS_OFICIALS = [
    { any: '2024', t: "Convocatòria Oficial 2024", dsc: "Examen oficial de la Generalitat de Catalunya corresponent a la darrera promoció d'accés (30 preguntes)." },
    { any: '2023', t: "Convocatòria Oficial 2023", dsc: "El model de referència amb una gran incidència de l'Àmbit de Seguretat i Policia (C)." },
    { any: '2022', t: "Convocatòria Oficial 2022", dsc: "Ideal per provar habilitats sota un estricte ràtio de penalització de preguntes." },
    { any: '2021', t: "Convocatòria Oficial 2021", dsc: "Conté preguntes clau sobre igualtat de gènere de l'Àmbit Institucional." },
    { any: '2020', t: "Convocatòria Oficial 2020", dsc: "Examen històric d'accés a l'escala bàsica de Mossos d'Esquadra." }
  ];

  // Explicació per a no-programadors:
  // Carreguem des de Firestore el registre de respostes d'aquest estudiant per calcular en quins
  // exàmens té un major percentatge d'èxit o on té un volum d'errades més preocupant.
  const carregarEstadistiquesRealsOficials = async () => {
    setLoadingStats(true);
    const user = auth.currentUser;
    if (!user) {
      setLoadingStats(false);
      return;
    }

    try {
      // Carreguem totals globals sumats des de l'agrupador general
      const statsRef = doc(db, `usuaris/${user.uid}/estadistiques`, "totals");
      const statsSnap = await getDoc(statsRef);
      
      let totalEncertsHist = 0;
      let totalErradesHist = 0;

      if (statsSnap.exists()) {
        const d = statsSnap.data() || {};
        totalEncertsHist = d.totalEncerts_oficials || 0;
        totalErradesHist = d.totalErrades_oficials || 0;
      }

      // Si no tenim un comptador atòmic d'oficials a Firestore, calculem a mà llegint el filtre dels intents de respostes
      const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
      const respostesSnap = await getDocs(respostesRef);

      const dadesPerAny: { [key: string]: { encerts: number, total: number } } = {};
      let encertsCalculats = 0;
      let erradesCalculats = 0;

      respostesSnap.docs.forEach(docSnap => {
        const d = docSnap.data();
        const esCorrecta = !!d.encertada;
        const examenAny = d.examenAny || d.ambit_oficial || null;

        if (examenAny) {
          if (esCorrecta) {
            encertsCalculats++;
          } else {
            erradesCalculats++;
          }

          if (!dadesPerAny[examenAny]) {
            dadesPerAny[examenAny] = { encerts: 0, total: 0 };
          }
          dadesPerAny[examenAny].total++;
          if (esCorrecta) {
            dadesPerAny[examenAny].encerts++;
          }
        }
      });

      // Si els mètodes automatitzats van donar zero, usem el càlcul detallat manual d'historial
      const encertsFinal = totalEncertsHist > 0 ? totalEncertsHist : encertsCalculats;
      const erradesFinal = totalErradesHist > 0 ? totalErradesHist : erradesCalculats;

      setTotalEncerts(encertsFinal);
      setTotalErrades(erradesFinal);

      let millor: typeof millorExamen = null;
      let pitjor: typeof pitjorExamen = null;

      Object.keys(dadesPerAny).forEach(anyKey => {
        const dades = dadesPerAny[anyKey];
        if (dades.total > 0) {
          const percent = Number(((dades.encerts / dades.total) * 100).toFixed(1));

          if (!millor || percent > millor.percent) {
            millor = { id: anyKey, name: `Examen ${anyKey}`, percent };
          }
          if (!pitjor || percent < pitjor.percent) {
            pitjor = { id: anyKey, name: `Examen ${anyKey}`, percent };
          }
        }
      });

      setMillorExamen(millor);
      setPitjorExamen(pitjor);

    } catch (err) {
      console.error("Error carregant estadístiques d'exàmens oficials:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    carregarEstadistiquesRealsOficials();
  }, []);

  // Explicació per a no-programadors:
  // Permet restablir les respostes dels exàmens oficials d'un alumne per poder tornar a preparar
  // la convocatòria netament des de zero.
  const handleResetEstadistiquesOficials = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoadingStats(true);
    try {
      const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
      const respostesSnap = await getDocs(respostesRef);
      
      const batch = writeBatch(db);
      // Netejem només respostes d'exàmens oficials passats conservant intents d'estudi de temari regular
      respostesSnap.docs.forEach(docSnap => {
        const d = docSnap.data();
        if (d.examenAny || d.ambit_oficial) {
          batch.delete(docSnap.ref);
        }
      });

      const totalsRef = doc(db, `usuaris/${user.uid}/estadistiques`, "totals");
      batch.set(totalsRef, {
        totalEncerts_oficials: 0,
        totalErrades_oficials: 0
      }, { merge: true });

      await batch.commit();

      setTotalEncerts(0);
      setTotalErrades(0);
      setMillorExamen(null);
      setPitjorExamen(null);
      setResetConfirm(false);
    } catch (err) {
      console.error("Error restablint mètriques d'oficials:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Creació i descàrrega de preguntes d'exàmens oficials de la base de dades
  const handleLlançarExamenOficial = async () => {
    setLoadingPreguntes(true);
    setPreguntesTest([]);
    setPreguntaActualIdx(0);
    setRespostaSeleccionadaIdx(null);
    setEncertsExamen(0);
    setErradesExamen(0);
    setFinalitzatExamen(false);
    setHistorialRespostesTest({});

    try {
      // Descarreguem en paral·lel
      const [snapNew, snapOld] = await Promise.all([
        getDocs(query(collectionGroup(db, "preguntes_codificades"))),
        getDocs(collection(db, "examens/mossos/preguntes"))
      ]);
      
      const listNew = snapNew.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      const listOld = snapOld.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      
      let list = [...listNew, ...listOld];
      list = list.filter(q => q.status !== 'suspesa');

      if (tab === 'errades') {
        // Filtratge d'errades dels exàmens oficials d'aquest alumne logejat
        const user = auth.currentUser;
        if (user) {
          const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
          const respostesSnap = await getDocs(respostesRef);
          
          const erradesOficialsIds = respostesSnap.docs
            .filter(d => !d.data().encertada && (d.data().examenAny || d.data().ambit_oficial))
            .map(d => d.data().preguntaId?.toString());

          list = list.filter(q => erradesOficialsIds.includes(q.id.toString()));
        }
      } else {
        // Filtratge per any específic
        list = list.filter(q => q.any?.toString() === examenSeleccionat || q.examenId === examenSeleccionat);
      }

      if (list.length === 0) {
        setPreguntesTest([]);
        setSimuladorActiu(true);
      } else {
        const rawCount = list.length;
        setRealQuestionsCount(rawCount);
        
        let listToUse = [...list];
        // En cas de tenir un volum reduït, fem una barreja per fer un simulacre consistent
        if (rawCount < numPreguntes && tab !== 'errades') {
          setShowWarningModal(true);
          let repeatedList: Question[] = [];
          const shuffledBase = [...list].sort(() => 0.5 - Math.random());
          while (repeatedList.length < numPreguntes) {
            repeatedList.push(...[...shuffledBase].sort(() => 0.5 - Math.random()));
          }
          listToUse = repeatedList.slice(0, numPreguntes);
        } else {
          setShowWarningModal(false);
          listToUse = [...list].sort(() => 0.5 - Math.random()).slice(0, numPreguntes);
        }

        setPreguntesTest(listToUse);

        // Activació del temporitzador
        if (tempsLlimitMinuts !== 'inf') {
          setSegonsRestants(parseInt(tempsLlimitMinuts, 10) * 60);
        } else {
          setSegonsRestants(null);
        }

        setSimuladorActiu(true);
      }
    } catch (err) {
      console.error("Error llançant l'examen oficial passat:", err);
    } finally {
      setLoadingPreguntes(false);
    }
  };

  // Temporitzador d'examen
  useEffect(() => {
    if (segonsRestants === null || finalitzatExamen || !simuladorActiu || preguntesTest.length === 0) return;

    const intervalId = setInterval(() => {
      setSegonsRestants(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(intervalId);
          setFinalitzatExamen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [segonsRestants, finalitzatExamen, simuladorActiu, preguntesTest]);

  const formatTemps = () => {
    if (segonsRestants === null) return '∞';
    const minuts = Math.floor(segonsRestants / 60);
    const segons = segonsRestants % 60;
    return `${minuts}:${segons.toString().padStart(2, '0')}`;
  };

  // Desar una resposta interactiva
  const handleTriarRespostaOficial = async (opcioIdx: number) => {
    if (respostaSeleccionadaIdx !== null) return;

    setRespostaSeleccionadaIdx(opcioIdx);
    setHistorialRespostesTest(prev => ({ ...prev, [preguntaActualIdx]: opcioIdx }));

    const pregunta = preguntesTest[preguntaActualIdx];
    const esCorrecta = opcioIdx === pregunta.correcta;

    if (esCorrecta) {
      setEncertsExamen(prev => prev + 1);
    } else {
      setErradesExamen(prev => prev + 1);
    }

    // Desar el progrés d'intent directament a Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const preguntaId = pregunta.id.toString();
        const respostaRef = doc(db, `usuaris/${user.uid}/respostes_preguntes`, preguntaId);

        const anyDeLaPregunta = pregunta.any?.toString() || examenSeleccionat || "unspecified";

        let intents = 1;
        let correctes = esCorrecta ? 1 : 0;
        let errors = esCorrecta ? 0 : 1;

        const snap = await getDoc(respostaRef);
        if (snap.exists()) {
          const dades = snap.data();
          intents = (dades.intents || 0) + 1;
          correctes = (dades.correctes || 0) + (esCorrecta ? 1 : 0);
          errors = (dades.errors || 0) + (esCorrecta ? 0 : 1);
        }

        // Deixem constància que l'intent correspon a un examen oficial passat
        await setDoc(respostaRef, {
          preguntaId: preguntaId,
          encertada: esCorrecta,
          respostaSeleccionada: opcioIdx,
          intents,
          correctes,
          errors,
          examenAny: anyDeLaPregunta,
          ambit_oficial: "oficial_interior",
          actualitzatEl: new Date().toISOString()
        }, { merge: true });

        // Incrementem estadístiques de control de rendiment general dels exàmens històrics d’interior
        const totalsRef = doc(db, `usuaris/${user.uid}/estadistiques`, "totals");
        await setDoc(totalsRef, {
          totalEncerts_oficials: esCorrecta ? increment(1) : increment(0),
          totalErrades_oficials: esCorrecta ? increment(0) : increment(1)
        }, { merge: true });

      } catch (err) {
        console.error("Error desant mètriques d'examen oficial:", err);
      }
    }
  };

  const handleSeguentPreguntaOficial = () => {
    if (preguntaActualIdx < preguntesTest.length - 1) {
      setPreguntaActualIdx(prev => prev + 1);
      setRespostaSeleccionadaIdx(null);
    } else {
      setFinalitzatExamen(true);
      // Recarreguem les dades globals reals de rendiment
      carregarEstadistiquesRealsOficials();
    }
  };

  // Càlcul de la nota d'avaluació oficial (Encerts - (Errades * 0.33)) sobre base 10
  const calcularNotaExamenOficial = () => {
    if (preguntesTest.length === 0) return 0;
    const nota = encertsExamen - (erradesExamen * 0.33);
    const notaNormalitzada = (nota / preguntesTest.length) * 10;
    return Math.max(0, parseFloat(notaNormalitzada.toFixed(2)));
  };

  // Visualitzador de càrrega
  if (loadingPreguntes) {
    return (
      <div className="bg-slate-950/45 backdrop-blur-lg border border-slate-850 p-12 rounded-[32px] shadow-2xl flex flex-col items-center justify-center min-h-[480px] text-center gap-6 animate-in fade-in duration-300">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full shadow-lg shadow-emerald-500/20"
        />
        <div className="space-y-1">
          <h2 className="text-white text-lg font-black italic uppercase tracking-widest">SINCIONITZANT CONVOCATÒRIA REAL...</h2>
          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Obtenint dades de respostes i preguntes aprovades pel Departament d'Interior</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      
      {/* 1. SECCIÓ DEL SIMULADOR ACTIU SI L'USUARI HA COMENÇAT UNA PROVA */}
      {simuladorActiu ? (
        <div className="bg-slate-950/75 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 text-left animate-in fade-in duration-300">
          
          {/* Capçalera del test en curs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-white/5 pb-5 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f296] animate-pulse" />
                <span className="text-[9px] text-[#00f296] font-black uppercase tracking-wider bg-[#00f296]/10 px-2.5 py-1 rounded border border-[#00f296]/20">
                  {tab === 'errades' ? 'REPÀS ACTIU D\'ERRADES' : 'MODEL OFICIAL D\'OPOSICIÓ MOSSOS'}
                </span>
              </div>
              <h2 className="text-white text-base md:text-xl font-black italic uppercase tracking-wider text-left">
                {tab === 'errades' ? '📝 MILLORA DE PREGUNTES OFICIALS ERRADES' : `⚡ CONVOCATÒRIA REAL ${examenSeleccionat} • ${preguntesTest.length} PREGUNTES`}
              </h2>
            </div>
            
            {/* Cronòmetre de l'examen */}
            <div className="flex items-center gap-3 bg-red-500/15 border border-red-500/35 px-4 py-2 rounded-2xl self-start sm:self-center">
              <Clock className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[7.5px] font-black uppercase tracking-widest text-red-300">Temps restant</span>
                <span className="text-xs md:text-sm font-black text-white font-mono">{formatTemps()}</span>
              </div>
            </div>
          </div>

          {preguntesTest.length === 0 ? (
            /* SI NO HI HA CAP PREGUNTA */
            <div className="p-8 text-center max-w-lg mx-auto flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-red-500 shadow-xl">
                <AlertTriangle size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-white text-lg font-black italic uppercase tracking-widest">SENSE PREGUNTES ENREGISTRADES</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  No hem trobat preguntes oficials per a aquesta convocatòria a la base de dades, o bé encara no has fallat cap pregunta d'examen oficial per repassar!
                </p>
              </div>
              <button
                onClick={() => setSimuladorActiu(false)}
                className="bg-white hover:bg-yellow-400 text-slate-950 font-black italic uppercase text-[10px] tracking-widest py-3 px-6 rounded-xl transition-all"
              >
                ◀ Tornar al llistat
              </button>
            </div>
          ) : !finalitzatExamen ? (
            /* SECCIÓ PREGUNTES ACTIVES */
            <div className="space-y-6">
              
              {/* Barra de progrés de dalt */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                    Pregunta {preguntaActualIdx + 1} de {preguntesTest.length}
                  </span>
                  <span className="text-[8.5px] text-yellow-400 font-black uppercase tracking-wider">
                    Plantilla de control de Departament d'Interior
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5 flex gap-0.5">
                  {preguntesTest.map((_, i) => {
                    let cName = 'bg-slate-950/80';
                    if (i === preguntaActualIdx) cName = 'bg-yellow-400';
                    else if (i < preguntaActualIdx) {
                      const respUsu = historialRespostesTest[i];
                      const esCorr = respUsu === preguntesTest[i].correcta;
                      cName = esCorr ? 'bg-emerald-500' : 'bg-red-500';
                    }
                    return <div key={i} className={`flex-1 ${cName} transition-all duration-300 h-full`} />;
                  })}
                </div>
              </div>

              {/* El text de l'enunciat */}
              <div className="bg-slate-900/60 border border-white/5 p-6 md:p-8 rounded-[24px] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <p className="text-white text-sm md:text-lg font-bold italic uppercase tracking-tight leading-relaxed select-none relative z-10 text-left">
                  {preguntesTest[preguntaActualIdx].pregunta}
                </p>
              </div>

              {/* Les quatre opcions elegibles */}
              <div className="grid grid-cols-1 gap-3.5 pt-2">
                {preguntesTest[preguntaActualIdx].opcions.map((opcio, idx) => {
                  const isSelected = respostaSeleccionadaIdx === idx;
                  const isCorrect = idx === preguntesTest[preguntaActualIdx].correcta;
                  const showResult = respostaSeleccionadaIdx !== null;

                  let borderClass = 'border-white/5 bg-slate-900/45 hover:bg-slate-900/85 hover:border-white/10';
                  let iconBgClass = 'bg-slate-950 text-slate-400';

                  if (showResult) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500/45 bg-emerald-500/10 text-emerald-100';
                      iconBgClass = 'bg-emerald-500 text-slate-950';
                    } else if (isSelected) {
                      borderClass = 'border-red-500/45 bg-red-500/10 text-red-100';
                      iconBgClass = 'bg-red-500 text-white';
                    } else {
                      borderClass = 'border-white/5 bg-slate-900/20 opacity-35';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-yellow-400 bg-yellow-400/5 text-yellow-300';
                    iconBgClass = 'bg-yellow-400 text-slate-950';
                  }

                  const lletres = ['A', 'B', 'C', 'D'];

                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleTriarRespostaOficial(idx)}
                      disabled={showResult}
                      whileHover={!showResult ? { x: 4 } : {}}
                      className={`w-full p-4 md:p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer relative overflow-hidden font-semibold ${borderClass}`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black italic text-xs shrink-0 transition-all ${iconBgClass}`}>
                        {lletres[idx]}
                      </span>
                      <span className="text-[11px] md:text-sm leading-relaxed text-left">{opcio}</span>
                      
                      {showResult && isCorrect && (
                        <Check size={16} className="text-emerald-400 ml-auto shrink-0 stroke-[3]" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <X size={16} className="text-red-500 ml-auto shrink-0 stroke-[3]" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Bloc justificatiu de la resposta */}
              <AnimatePresence>
                {respostaSeleccionadaIdx !== null && preguntesTest[preguntaActualIdx].explicacio && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-5 md:p-6 rounded-[20px] border flex flex-col md:flex-row items-start gap-4 transition-all duration-300 ${
                      respostaSeleccionadaIdx === preguntesTest[preguntaActualIdx].correcta
                        ? 'bg-emerald-500/5 border-emerald-500/25'
                        : 'bg-red-500/5 border-red-500/25'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      respostaSeleccionadaIdx === preguntesTest[preguntaActualIdx].correcta
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      <Brain size={18} />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">Dictamen i Justificació de la Generalitat</h4>
                      <p className="text-[11.5px] md:text-xs text-slate-350 leading-relaxed font-semibold text-left">
                        {preguntesTest[preguntaActualIdx].explicacio}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botons de navegació */}
              <div className="flex justify-between items-center pt-5 border-t border-white/5">
                <button
                  onClick={() => {
                    if (confirm("Segur que vols tancar aquest històric oficial del Departament d'Interior? El procés es desarà, però perdràs la puntuació general de la prova actual.")) {
                      setSimuladorActiu(false);
                      carregarEstadistiquesRealsOficials();
                    }
                  }}
                  className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  ◀ Abandonar històric oficial
                </button>

                <button
                  onClick={handleSeguentPreguntaOficial}
                  disabled={respostaSeleccionadaIdx === null}
                  className={`py-3 px-8 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                    respostaSeleccionadaIdx !== null
                    ? 'bg-red-650 hover:bg-red-550 text-white shadow-lg shadow-red-650/20'
                    : 'bg-white/5 text-white/10 cursor-not-allowed'
                  }`}
                >
                  <span>{preguntaActualIdx === preguntesTest.length - 1 ? 'Tancar i Avaluar 🏁' : 'Següent pregunta ▶'}</span>
                </button>
              </div>

            </div>
          ) : (
            /* RESUM DE RESULTATS A L'EXAMEN HISTÒRIC */
            <div className="text-center space-y-8 max-w-4xl mx-auto py-4 animate-in fade-in duration-300">
              
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center text-yellow-500 shadow-xl shadow-yellow-550/10">
                  <Trophy size={36} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-[#00f296] font-black uppercase tracking-wider bg-[#00f296]/15 px-3 py-1 rounded">
                    CONVOCATÒRIA DE PROVA EVALUADA
                  </span>
                  <h3 className="text-xl md:text-3xl font-black italic uppercase text-white tracking-widest mt-2 block">
                    QUALIFICACIÓ DE L'OPOSITOR
                  </h3>
                  <p className="text-xs text-slate-400 font-bold tracking-tight">
                    Avalua la teva nota d'acord amb la puntuació i càlcul real de descompte oficial del tribunal de Catalunya.
                  </p>
                </div>
              </div>

              {/* Quadrant de mètriques d'acadèmies reals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Nota global */}
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[24px] flex flex-col justify-center items-center text-center gap-2">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Nota Estimada</span>
                  <div className="relative flex items-center justify-center">
                    <span className={`text-4xl md:text-6xl font-black italic tracking-tighter ${
                      calcularNotaExamenOficial() >= 5 ? 'text-emerald-400' : 'text-red-500'
                    }`}>
                      {calcularNotaExamenOficial()}
                    </span>
                    <span className="text-slate-500 text-xs font-black absolute -top-1 -right-4">/10</span>
                  </div>
                  <span className="text-[10px] text-slate-400 italic font-bold">
                    {calcularNotaExamenOficial() >= 5 ? '🚦 APTE PER ALS MOSSOS D\'ESQUADRA' : '❌ NO APTE (Requereix reforç)'}
                  </span>
                </div>

                {/* Encerts */}
                <div className="bg-emerald-500/5 border border-emerald-500/15 p-6 rounded-[24px] flex flex-col justify-center items-center text-center gap-1.5">
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest font-bold">Enunciats Encertats</span>
                  <span className="text-3xl md:text-5xl font-black italic text-emerald-400">
                    {encertsExamen}
                  </span>
                  <p className="text-[9.5px] text-slate-400 font-semibold italic">
                    Has retingut +{encertsExamen} respostes correctes al teu perfil.
                  </p>
                </div>

                {/* Errades */}
                <div className="bg-red-500/5 border border-red-500/15 p-6 rounded-[24px] flex flex-col justify-center items-center text-center gap-1.5">
                  <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">Penalitzadores</span>
                  <span className="text-3xl md:text-5xl font-black italic text-red-500">
                    {erradesExamen}
                  </span>
                  <p className="text-[9.5px] text-slate-400 font-semibold italic">
                    Resten -{(erradesExamen * 0.33).toFixed(2)} sobre la plantilla global.
                  </p>
                </div>

              </div>

              {/* Desglossament històric d'examen passat */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-black uppercase text-white/55 ml-2">JUSTIFICACIÓ DETALLADA PREGUNTA PER PREGUNTA:</h4>
                <div className="bg-slate-900/25 border border-white/5 rounded-3xl p-5 md:p-8 space-y-4 max-h-[350px] overflow-y-auto">
                  {preguntesTest.map((qp, idx) => {
                    const triada = historialRespostesTest[idx];
                    const esCorrecta = triada === qp.correcta;
                    return (
                      <div key={idx} className="border-b border-white/5 pb-4 last:border-0 last:pb-0 space-y-2 text-left">
                        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 text-left">
                          <span className="text-[11px] text-white font-black italic leading-tight uppercase text-left">
                            {idx + 1}. {qp.pregunta}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                            esCorrecta ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {esCorrecta ? '✓ Encertada (+1.00)' : `✗ Errada / Correcta: ${['A', 'B', 'C', 'D'][qp.correcta]} (-0.33)`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 italic leading-relaxed font-semibold text-left">
                          Retro Generalitat: {qp.explicacio}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botó per tancar resultats de l'escriptori */}
              <button
                onClick={() => setSimuladorActiu(false)}
                className="bg-white hover:bg-yellow-400 text-slate-950 font-black italic uppercase text-[11px] tracking-widest py-4 px-10 rounded-xl transition-all shadow-lg active:scale-95 duration-200 cursor-pointer block mx-auto"
              >
                Tancar qualificació i triar una altra convocatòria 🏁
              </button>

            </div>
          )}

        </div>
      ) : (
        /* 2. TAULER DE CONTROL HISTÒRIC GENERAL PER A L'ESTUDIANT LOGEJAT */
        <div className="bg-slate-950/45 backdrop-blur-lg border border-slate-850 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 text-left animate-in fade-in duration-300">
          
          {/* Títol i descripció */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Arxiu Històric d'Exàmens Oficials
                </span>
              </div>
              <h1 className="text-xl md:text-3xl font-black italic uppercase text-white tracking-widest leading-none text-left">
                ⚡ EXÀMENS OFICIALS PASSATS
              </h1>
              <p className="text-xs text-slate-400 font-bold max-w-2xl leading-relaxed text-left">
                Accedeix i resol de manera totalment interactiva les plantilles d'examen elaborades pel tribunal examinador oficial del cos de Mossos d'Esquadra de la Generalitat de Catalunya corresponents a les darreres convocatòries.
              </p>
            </div>
          </div>

          {/* TAULER BENTO D'ESTADÍSTIQUES ACADÈMIQUES AMB TEXTURA GLASS */}
          <section className="space-y-3 font-sans">
            <h3 className="text-[10px] font-black italic uppercase tracking-widest text-[#00f296]/90 ml-1 text-left">
              • Rendiment històric en convocatòries oficials passades
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Targeta 1: Encerts totals */}
              <div className="bg-slate-900/35 border border-white/5 p-5 rounded-[22px] flex items-center gap-4 shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={18} className="stroke-[3]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Encerts oficials</span>
                  <span className="text-xl font-black italic text-emerald-400 leading-tight">
                    {loadingStats ? "..." : totalEncerts}
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">Preguntes respostes</span>
                </div>
              </div>

              {/* Targeta 2: Errades acumulades */}
              <div className="bg-slate-900/35 border border-white/5 p-5 rounded-[22px] flex items-center gap-4 shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                  <X size={18} className="stroke-[3]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider font-bold">Errades històriques</span>
                  <span className="text-xl font-black italic text-red-500 leading-tight">
                    {loadingStats ? "..." : totalErrades}
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">Penalitzadores reals</span>
                </div>
              </div>

              {/* Targeta 3: Millor convocatòria */}
              <div className="bg-slate-900/35 border border-white/5 p-5 rounded-[22px] flex items-center gap-4 shadow-md relative overflow-hidden group col-span-1 md:col-span-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/5 rounded-full blur-xl pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <Trophy size={16} />
                </div>
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Major domini</span>
                  <span className="text-[12.5px] font-black italic text-yellow-400 leading-tight truncate mt-0.5 block">
                    {loadingStats ? "Carregant..." : (millorExamen ? millorExamen.name : 'Dades insuficients')}
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">
                    {millorExamen ? `Ràtio d'èxit: ${millorExamen.percent}%` : 'Marge de provat general'}
                  </span>
                </div>
              </div>

              {/* Targeta 4: Pitjor convocatòria */}
              <div className="bg-slate-900/35 border border-white/5 p-5 rounded-[22px] flex items-center justify-between gap-4 shadow-md min-w-0 relative">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Requereix impuls</span>
                    <span className="text-[12.5px] font-black italic text-red-400 leading-tight truncate mt-0.5 block">
                      {loadingStats ? "Carregant..." : (pitjorExamen ? pitjorExamen.name : 'Marge actiu')}
                    </span>
                    <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">
                      {pitjorExamen ? `Ràtio d'èxit: ${pitjorExamen.percent}%` : 'Cap examen fallat d\'interior'}
                    </span>
                  </div>
                </div>

                {/* Reset parcial d'exàmens oficials per a l'alumne */}
                <div className="shrink-0 pl-1">
                  {resetConfirm ? (
                    <button
                      onClick={handleResetEstadistiquesOficials}
                      className="w-10 h-10 bg-red-650 hover:bg-red-550 border border-red-550 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-md shadow-red-950/20"
                      title="Confirmar reiniciar exàmens oficials"
                    >
                      <Check size={14} className="text-white fill-white stroke-[3] animate-pulse" />
                      <span className="text-[6px] font-black uppercase text-white leading-none mt-0.5">Segur?</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setResetConfirm(true)}
                      className="w-10 h-10 bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-500 hover:text-white transition-all rounded-xl flex items-center justify-center cursor-pointer"
                      title="Reiniciar resultats d'exàmens oficials"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* BARRA DE TABS EXCLUSIVA */}
          <div className="flex w-full bg-slate-950 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => setTab('examen')}
              className={`flex-1 py-3 rounded-xl font-black italic uppercase text-[10px] sm:text-xs tracking-widest transition-all cursor-pointer ${
                tab === 'examen'
                  ? 'bg-[#00f296] text-slate-950 font-black tracking-widest shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📂 FILTRAR PER CONVOCATÒRIES PASSADES
            </button>
            
            <button
              onClick={() => setTab('errades')}
              className={`flex-1 py-3 rounded-xl font-black italic uppercase text-[10px] sm:text-xs tracking-widest transition-all cursor-pointer ${
                tab === 'errades'
                  ? 'bg-red-600 text-white font-black tracking-widest shadow-lg shadow-red-650/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 ENTRENAMENT D'ERRADES D'EXÀMENS OFICIALS
            </button>
          </div>

          {/* SECCIÓ ADAPTADA AL TAB */}
          {tab === 'examen' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 italic uppercase tracking-widest">
                  Tria quina convocatòria històrica del cos de Mossos d'Esquadra que desitges simular interactivement:
                </p>
              </div>

              {/* LLISTA MULTICOLUMNA DE CONVOCATÒRIES REALS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXAMENS_OFICIALS.map(ex => {
                  const esSeleccionat = examenSeleccionat === ex.any;
                  return (
                    <button
                      key={ex.any}
                      onClick={() => setExamenSeleccionat(ex.any)}
                      className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-4 cursor-pointer group shadow ${
                        esSeleccionat 
                          ? 'border-[#00f296] bg-slate-900/40 text-white' 
                          : 'border-white/5 bg-slate-900/10 hover:bg-slate-900/20 hover:border-white/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                          esSeleccionat 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          Any {ex.any}
                        </span>
                        <h4 className="text-white text-xs md:text-sm font-black italic uppercase mt-1 leading-tight">
                          {ex.t}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold italic leading-relaxed pt-1 text-left">
                          {ex.dsc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-left mt-2 border-t border-white/5 pt-2">
                        <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">Generalitat de Catalunya</span>
                        <span className={`text-[10px] font-black uppercase ${esSeleccionat ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white transition-colors'}`}>
                          {esSeleccionat ? '✓ Seleccionat' : 'Triar examen ▶'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* MODAL DE SELECTORS REALS PER COMPONENT DE CODI */}
              {examenSeleccionat && (
                <div className="bg-slate-900/20 border border-white/5 rounded-[24px] p-6 space-y-5 animate-in slide-in-from-bottom duration-300">
                  <div className="flex flex-col sm:flex-row items-baseline justify-between gap-3 border-b border-white/5 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00f296] italic">
                      PARÀMETRES D'EVALUACIÓ SELECTIVA (CONVOCATÒRIA {examenSeleccionat}) :
                    </span>
                    <span className="text-[9px] text-slate-500 italic font-semibold">
                      Recorda que 45 minuts i 30 preguntes és el model real estipulat en el DOGC oficial!
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Configuració del volum d’estudi */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Mida i quantitat d'estudi:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 30, 50].map(val => (
                          <button
                            key={val}
                            onClick={() => setNumPreguntes(val)}
                            className={`py-3 text-xs font-black italic uppercase rounded-xl border transition-all cursor-pointer ${
                              numPreguntes === val
                                ? 'bg-[#00f296] text-slate-950 font-black border-[#00f296]'
                                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            {val} preguntes {val === 30 && "(Estàndard)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Configuració de la durada del examen */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Rellotge regulador:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: '10 minuts', val: '10' },
                          { label: '45 minuts (DOGC)', val: '45' },
                          { label: 'Indefinit', val: 'inf' }
                        ].map(t => (
                          <button
                            key={t.val}
                            onClick={() => setTempsLimitMinuts(t.val)}
                            className={`py-3 text-[10px] font-black italic uppercase rounded-xl border transition-all cursor-pointer ${
                              tempsLlimitMinuts === t.val
                                ? 'bg-white/20 text-white font-bold border-white/30'
                                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botó per activar simulador */}
                  <button
                    onClick={handleLlançarExamenOficial}
                    className="w-full bg-[#FFDF00] hover:bg-yellow-400 text-slate-950 font-black italic uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl transition-all cursor-pointer block text-center"
                  >
                    🚀 LLANÇAR INTERACCió DE CONVOCATÒRIA REAL
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* TAB DE PREGUNTES ERRADES */
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-slate-900/25 border border-white/5 p-6 rounded-[28px] max-w-2xl text-left">
                <p className="text-xs font-bold text-slate-350 leading-relaxed text-left">
                  Practica únicament els enunciats que has fallat anteriorment dins de les teves simulacions realitzades d'exàmens oficials d'interior. Un cop responguis amb èxit d'encert, el sistema consolidarà la resposta de forma positiva en el teu historial per donar-te com a apte!
                </p>
              </div>

              <button
                onClick={handleLlançarExamenOficial}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black italic uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl transition-all cursor-pointer block text-center border-b-4 border-red-800"
              >
                📝 RECORREGUT INTEL·LIGENT DE REFORÇ (SENSE LÍMIT DE TEMPS)
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
