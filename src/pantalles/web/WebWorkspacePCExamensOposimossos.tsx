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
  HelpCircle as QuestionIcon,
  BookOpen,
  ArrowRight,
  Bookmark,
  ChevronLeft
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, query, collectionGroup, doc, getDoc, setDoc, writeBatch, increment } from 'firebase/firestore';
import { TEMARI_DETALL } from '../../constants/temari';

// Explicació per a no-programadors:
// Definim l'estructura de dades d'una pregunta d'examen de la nostra base de dades.
interface Question {
  id: string | number;
  pregunta: string;
  opcions: string[];
  correcta: number;
  explicacio: string;
  ambit?: string;
  tema?: number;
  capitol?: number;
  status?: 'activa' | 'suspesa';
}

// Interfície dels paràmetres (Props) que rep el component
interface PropsExamens {
  onTornar?: () => void;
}

export default function WebWorkspacePCExamensOposimossos({ onTornar }: PropsExamens) {
  // Explicació per a no-programadors:
  // Estats per a les estadístiques reals de l'estudiant sincronitzades directament amb Firestore.
  const [loadingStats, setLoadingStats] = useState(true);
  const [totalEncerts, setTotalEncerts] = useState(0);
  const [totalErrades, setTotalErrades] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [millorTema, setMillorTema] = useState<{ id: string, name: string, percent: number, encertades: number, totals: number } | null>(null);
  const [pitjorTema, setPitjorTema] = useState<{ id: string, name: string, percent: number, encertades: number, totals: number } | null>(null);

  // Estat per a l'àvatar de l'alumne
  const [avatarEstil, setAvatarEstil] = useState<string>("👮‍♂️");

  // Estat del simulador
  const [simuladorActiu, setSimuladorActiu] = useState(false);
  const [preguntesTest, setPreguntesTest] = useState<Question[]>([]);
  const [loadingPreguntes, setLoadingPreguntes] = useState(false);

  // Estat de configuració de l'examen
  const [tab, setTab] = useState<'examen' | 'errades'>('examen');
  const [seleccions, setSeleccions] = useState<{ [key: string]: number[] }>({
    A: [],
    B: [],
    C: []
  });
  const [numPreguntes, setNumPreguntes] = useState<number>(30);
  const [tempsLlimitMinuts, setTempsLimitMinuts] = useState<string>('45');

  // Estats interns de la resolució d'un examen actiu
  const [preguntaActualIdx, setPreguntaActualIdx] = useState(0);
  const [respostaSeleccionadaIdx, setRespostaSeleccionadaIdx] = useState<number | null>(null);
  const [encertsExamen, setEncertsExamen] = useState(0);
  const [erradesExamen, setErradesExamen] = useState(0);
  const [finalitzatExamen, setFinalitzatExamen] = useState(false);
  const [segonsRestants, setSegonsRestants] = useState<number | null>(null);
  const [historialRespostesTest, setHistorialRespostesTest] = useState<Record<number, number>>({});
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [realQuestionsCount, setRealQuestionsCount] = useState(0);

  // Explicació per a no-programadors:
  // Carrega l'àvatar de l'usuari desat localment.
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

  // Formatador del nom d'un tema (per exemple: tema_1.2 -> Àmbit A, Tema 2)
  const formatTemaNom = (temaKey: string) => {
    const parts = temaKey.replace('tema_', '').split('.');
    if (parts.length === 2) {
      const ambitCodi = parts[0] === '1' ? 'A' : parts[0] === '2' ? 'B' : 'C';
      const indexNum = parseInt(parts[1], 10) - 1;
      const temesDelBloc = TEMARI_DETALL[ambitCodi as 'A' | 'B' | 'C'];
      if (temesDelBloc && temesDelBloc[indexNum]) {
        return temesDelBloc[indexNum].titol;
      }
      return `Àmbit ${ambitCodi} • Tema ${parts[1]}`;
    }
    return temaKey;
  };

  // Carregar historial d'estadístiques reals directament de Firestore d'aquest alumne logejat
  const carregarEstadistiquesRealsWeb = async () => {
    setLoadingStats(true);
    const user = auth.currentUser;
    if (!user) {
      setLoadingStats(false);
      return;
    }

    try {
      const statsRef = doc(db, `usuaris/${user.uid}/estadistiques`, "totals");
      const statsSnap = await getDoc(statsRef);

      let encertsNum = 0;
      let erradesNum = 0;

      const encertatsPerTema: { [key: string]: number } = {};
      const intentsPerTema: { [key: string]: number } = {};

      if (statsSnap.exists()) {
        const statsData = statsSnap.data() || {};
        encertsNum = statsData.totalEncerts || 0;
        erradesNum = statsData.totalErrades || 0;
        
        Object.keys(statsData).forEach(key => {
          if (key.startsWith('intents_tema_')) {
            const temaKey = key.replace('intents_', '');
            intentsPerTema[temaKey] = statsData[key] || 0;
          }
          if (key.startsWith('correctes_tema_')) {
            const temaKey = key.replace('correctes_', '');
            encertatsPerTema[temaKey] = statsData[key] || 0;
          }
        });
      } else {
        // Fallback d'inicialització gradual si no hi ha dades directes resumides
        const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
        const respostesSnap = await getDocs(respostesRef);

        respostesSnap.docs.forEach(docSnap => {
          const d = docSnap.data();
          const esEncertada = !!d.encertada;

          if (esEncertada) {
            encertsNum++;
          } else {
            erradesNum++;
          }

          if (d.ambit !== undefined && d.tema !== undefined) {
            const ambitMap: { [key: string]: number } = { A: 1, B: 2, C: 3 };
            const ambitId = ambitMap[d.ambit] || 1;
            const temaVisual = parseInt(d.tema.toString(), 10) + 1;
            const temaKey = `tema_${ambitId}.${temaVisual}`;

            intentsPerTema[temaKey] = (intentsPerTema[temaKey] || 0) + 1;
            if (esEncertada) {
              const prevValue = encertatsPerTema[temaKey] || 0;
              encertatsPerTema[temaKey] = prevValue + 1;
            }
          }
        });
      }

      setTotalEncerts(encertsNum);
      setTotalErrades(erradesNum);

      let millor: typeof millorTema = null;
      let pitjor: typeof pitjorTema = null;

      Object.keys(intentsPerTema).forEach(temaKey => {
        const totalIntentsTema = intentsPerTema[temaKey] || 0;
        if (totalIntentsTema > 0) {
          const encertatsUsuari = encertatsPerTema[temaKey] || 0;
          const percent = Number(((encertatsUsuari / totalIntentsTema) * 100).toFixed(1));

          if (!millor || percent > millor.percent) {
            millor = {
              id: temaKey,
              name: formatTemaNom(temaKey),
              percent: percent,
              encertades: encertatsUsuari,
              totals: totalIntentsTema
            };
          } else if (millor && percent === millor.percent) {
            if (totalIntentsTema > millor.totals) {
              millor = {
                id: temaKey,
                name: formatTemaNom(temaKey),
                percent: percent,
                encertades: encertatsUsuari,
                totals: totalIntentsTema
              };
            }
          }

          if (!pitjor || percent < pitjor.percent) {
            pitjor = {
              id: temaKey,
              name: formatTemaNom(temaKey),
              percent: percent,
              encertades: encertatsUsuari,
              totals: totalIntentsTema
            };
          } else if (pitjor && percent === pitjor.percent) {
            if (totalIntentsTema > pitjor.totals) {
              pitjor = {
                id: temaKey,
                name: formatTemaNom(temaKey),
                percent: percent,
                encertades: encertatsUsuari,
                totals: totalIntentsTema
              };
            }
          }
        }
      });

      setMillorTema(millor);
      setPitjorTema(pitjor);

    } catch (err) {
      console.error("Error carregant estadístiques d'exàmens per a web:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    carregarEstadistiquesRealsWeb();
  }, []);

  // Explicació per a no-programadors:
  // Funció que esborra permanentment de Firestore totes les respostes fetes per un usuari
  // per poder restablir el seu progrés i tornar a fer els exàmens des del principi de forma neta.
  const handleResetEstadistiquesWeb = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoadingStats(true);
    try {
      const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
      const respostesSnap = await getDocs(respostesRef);
      
      const batch = writeBatch(db);
      respostesSnap.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });

      const statsRef = doc(db, `usuaris/${user.uid}/estadistiques`, "totals");
      batch.delete(statsRef);

      await batch.commit();

      setTotalEncerts(0);
      setTotalErrades(0);
      setMillorTema(null);
      setPitjorTema(null);
      setResetConfirm(false);
    } catch (err) {
      console.error("Error restablint l'historial:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Creació d'examen (Llançar simulador)
  const handleLlançarExamen = async () => {
    setLoadingPreguntes(true);
    setPreguntesTest([]);
    setPreguntaActualIdx(0);
    setRespostaSeleccionadaIdx(null);
    setEncertsExamen(0);
    setErradesExamen(0);
    setFinalitzatExamen(false);
    setHistorialRespostesTest({});

    try {
      // Obtenim preguntes de Firestore
      const [snapNew, snapOld] = await Promise.all([
        getDocs(query(collectionGroup(db, "preguntes_codificades"))),
        getDocs(collection(db, "examens/mossos/preguntes"))
      ]);
      
      const listNew = snapNew.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      const listOld = snapOld.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      
      let list = [...listNew, ...listOld];
      list = list.filter(q => q.status !== 'suspesa');

      if (tab === 'errades') {
        // Explicació per a no-programadors:
        // Llegim les preguntes que l'usuari ha fallat històricament de la seva col·lecció de respostes de Firestore.
        const user = auth.currentUser;
        if (user) {
          const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
          const respostesSnap = await getDocs(respostesRef);
          const erradesIds = respostesSnap.docs
            .filter(d => !d.data().encertada)
            .map(d => d.data().preguntaId?.toString());

          list = list.filter(q => erradesIds.includes(q.id.toString()));
        }
      } else {
        // Filtratge normal basat en temari actiu
        const teSeleccions = Object.values(seleccions).some(arr => arr.length > 0);
        if (teSeleccions) {
          list = list.filter(q => {
            const ambit = q.ambit || 'A';
            const tema = q.tema !== undefined ? parseInt(q.tema.toString(), 10) + 1 : null;
            
            if (!seleccions[ambit] || seleccions[ambit].length === 0) return false;
            return tema !== null && seleccions[ambit].includes(tema);
          });
        }
      }

      if (list.length === 0) {
        setPreguntesTest([]);
        setSimuladorActiu(true);
      } else {
        const rawCount = list.length;
        setRealQuestionsCount(rawCount);
        
        let listToUse = [...list];
        // Si no en té prous, crea un llistat cíclic simulat barrejant els que té
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

        // Configuració del compte enrere
        if (tempsLlimitMinuts !== 'inf') {
          setSegonsRestants(parseInt(tempsLlimitMinuts, 10) * 60);
        } else {
          setSegonsRestants(null);
        }

        setSimuladorActiu(true);
      }
    } catch (err) {
      console.error("Error llançant el simulador per a la web:", err);
    } finally {
      setLoadingPreguntes(false);
    }
  };

  // Temporitzador per a l'examen en curs
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

  // Triar una resposta dins de l'examen
  const handleTriarRespostaWeb = async (opcioIdx: number) => {
    if (respostaSeleccionadaIdx !== null) return; // Ja ha contestat aquesta pregunta
    
    setRespostaSeleccionadaIdx(opcioIdx);
    setHistorialRespostesTest(prev => ({ ...prev, [preguntaActualIdx]: opcioIdx }));

    const pregunta = preguntesTest[preguntaActualIdx];
    const esCorrecta = opcioIdx === pregunta.correcta;

    if (esCorrecta) {
      setEncertsExamen(prev => prev + 1);
    } else {
      setErradesExamen(prev => prev + 1);
    }

    // Sincronització immediata dels progressos amb Firebase Firestore per seguretat d'intents
    const user = auth.currentUser;
    if (user) {
      try {
        const preguntaId = pregunta.id.toString();
        const respostaRef = doc(db, `usuaris/${user.uid}/respostes_preguntes`, preguntaId);

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

        await setDoc(respostaRef, {
          preguntaId: preguntaId,
          encertada: esCorrecta,
          respostaSeleccionada: opcioIdx,
          intents,
          correctes,
          errors,
          ambit: pregunta.ambit || 'A',
          tema: pregunta.tema !== undefined ? parseInt(pregunta.tema.toString(), 10) : 0,
          actualitzatEl: new Date().toISOString()
        }, { merge: true });

        // Augmentem els atòmics de totals resumits generals de control escolar ràpid.
        const d_ambit = pregunta.ambit || 'A';
        const d_tema = pregunta.tema !== undefined ? parseInt(pregunta.tema.toString(), 10) : 0;
        const ambitMap: { [key: string]: number } = { A: 1, B: 2, C: 3 };
        const ambitId = ambitMap[d_ambit] || 1;
        const temaVisual = d_tema + 1;
        const temaKey = `tema_${ambitId}.${temaVisual}`;

        const totalsRef = doc(db, `usuaris/${user.uid}/estadistiques`, "totals");
        await setDoc(totalsRef, {
          totalRespostes: increment(1),
          totalEncerts: esCorrecta ? increment(1) : increment(0),
          totalErrades: esCorrecta ? increment(0) : increment(1),
          [`intents_${temaKey}`]: increment(1),
          [`correctes_${temaKey}`]: esCorrecta ? increment(1) : increment(0)
        }, { merge: true });

      } catch (err) {
        console.error("Error guardant intent de dades de l'escriptori:", err);
      }
    }
  };

  const handleSeguentPreguntaWeb = () => {
    if (preguntaActualIdx < preguntesTest.length - 1) {
      setPreguntaActualIdx(prev => prev + 1);
      setRespostaSeleccionadaIdx(null);
    } else {
      setFinalitzatExamen(true);
      // Recarreguem les nostres estadístiques generals per visualitzar els nous èxits dels fons d'escriptori
      carregarEstadistiquesRealsWeb();
    }
  };

  // Toggle de tema particular en la llista
  const handleToggleTema = (blocId: string, temaId: number) => {
    setSeleccions(prev => {
      const actuals = prev[blocId];
      if (actuals.includes(temaId)) {
        return { ...prev, [blocId]: actuals.filter(id => id !== temaId) };
      } else {
        return { ...prev, [blocId]: [...actuals, temaId] };
      }
    });
  };

  // Activa o desactiva tots els temes d'un bloc concret d'una sola vegada
  const handleToggleTotsClase = (blocId: string, temesIds: number[]) => {
    setSeleccions(prev => {
      const actuals = prev[blocId];
      if (actuals.length === temesIds.length) {
        return { ...prev, [blocId]: [] };
      } else {
        return { ...prev, [blocId]: [...temesIds] };
      }
    });
  };

  // Creem la configuració dels blocs oficials (Basats en TEMARI_DETALL)
  const BLOCS_ESCRIPTORI = [
    { 
      id: 'A', 
      nom: "Àmbit A: Coneixements de l'entorn", 
      colorBorder: 'border-emerald-500/20 hover:border-emerald-500/40',
      colorText: 'text-emerald-400',
      colorBg: 'bg-emerald-500/5',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
      temes: TEMARI_DETALL.A.map((t, i) => ({ id: i + 1, titol: t.titol, subtemes: t.subtemes })) 
    },
    { 
      id: 'B', 
      nom: 'Àmbit B: Àmbit Institucional', 
      colorBorder: 'border-blue-500/20 hover:border-blue-500/40',
      colorText: 'text-blue-400',
      colorBg: 'bg-blue-500/5',
      badge: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
      temes: TEMARI_DETALL.B.map((t, i) => ({ id: i + 1, titol: t.titol, subtemes: t.subtemes })) 
    },
    { 
      id: 'C', 
      nom: 'Àmbit C: Seguretat i Policia', 
      colorBorder: 'border-purple-500/20 hover:border-purple-500/40',
      colorText: 'text-purple-400',
      colorBg: 'bg-purple-500/5',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
      temes: TEMARI_DETALL.C.map((t, i) => ({ id: i + 1, titol: t.titol, subtemes: t.subtemes })) 
    }
  ];

  // Càlcul de la nota d'examen estil ISPC GENCAT (Fórmula oficial: Encerts - (Errades * 0.33)) convertida a base 10
  const calcularNotaExamenWeb = () => {
    if (preguntesTest.length === 0) return 0;
    const nota = encertsExamen - (erradesExamen * 0.33);
    const notaNormalitzada = (nota / preguntesTest.length) * 10;
    return Math.max(0, parseFloat(notaNormalitzada.toFixed(2)));
  };

  // En cas d'un loding de càrrega estructural:
  if (loadingPreguntes) {
    return (
      <div className="bg-slate-950/45 backdrop-blur-lg border border-slate-850 p-12 rounded-[32px] shadow-2xl flex flex-col items-center justify-center min-h-[480px] text-center gap-6 animate-in fade-in duration-300">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-4 border-yellow-500 border-t-transparent rounded-full shadow-lg shadow-yellow-500/20"
        />
        <div className="space-y-1">
          <h2 className="text-white text-lg font-black italic uppercase tracking-widest">PREPARANT SIMULACRE PREMIUM...</h2>
          <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Descarregant base de preguntes i dades acadèmiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      
      {/* 1. VISUALITZADOR DEL SIMULADOR ACTIU (ZONA TOTAL D'EXAMEN) */}
      {simuladorActiu ? (
        <div className="bg-slate-950/75 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 text-left animate-in fade-in duration-300">
          
          {/* Capçalera del test en curs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-white/5 pb-5 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] text-[#00f296] font-black uppercase tracking-wider bg-[#00f296]/10 px-2.5 py-1 rounded border border-[#00f296]/20">
                  {tab === 'errades' ? 'RECORREGUT DE MILLORA D\'ERRADES' : 'AVALUACIÓ OFICIAL EN CURS'}
                </span>
              </div>
              <h2 className="text-white text-base md:text-xl font-black italic uppercase tracking-wider">
                {tab === 'errades' ? '📝 ENTRENAMENT DE PREGUNTES ERRADES' : `⚡ EXAMEN SELECTIU DE MOSSOS • ${preguntesTest.length} PREGUNTES`}
              </h2>
            </div>
            
            {/* Rellotge cronòmetre amb disseny de vidre i fons premium */}
            <div className="flex items-center gap-3 bg-red-500/15 border border-red-500/35 px-4 py-2 rounded-2xl self-start sm:self-center">
              <Clock className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
              <div className="flex flex-col">
                <span className="text-[7.5px] font-black uppercase tracking-widest text-red-300">Temps restant</span>
                <span className="text-xs md:text-sm font-black text-white font-mono">{formatTemps()}</span>
              </div>
            </div>
          </div>

          {preguntesTest.length === 0 ? (
            /* SI NO HI HA PREGUNTES DISPONIBLES */
            <div className="p-8 text-center max-w-lg mx-auto flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-red-500 shadow-xl">
                <AlertTriangle size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-white text-lg font-black italic uppercase tracking-widest">SENSE PREGUNTES ACTIVES</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  Sembla que no hi ha cap pregunta registrada o fallada en aquesta combinació. Si estàs provant les teves errades, recorda que abans has de respondre preguntes en els simulacres de temari!
                </p>
              </div>
              <button
                onClick={() => setSimuladorActiu(false)}
                className="bg-white hover:bg-yellow-400 text-slate-950 font-black italic uppercase text-[10px] tracking-widest py-3 px-6 rounded-xl transition-all"
              >
                Tornar a la selecció
              </button>
            </div>
          ) : !finalitzatExamen ? (
            /* FLUX PRINCIPAL DE PREGUNTES */
            <div className="space-y-6">
              
              {/* Barra de progrés superior d'exàmens */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                    Pregunta {preguntaActualIdx + 1} de {preguntesTest.length}
                  </span>
                  <span className="text-[8.5px] text-yellow-400 font-black uppercase">
                    Model d'accés lògic ISPC
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

              {/* ENUNCIAT */}
              <div className="bg-slate-900/60 border border-white/5 p-6 md:p-8 rounded-[24px] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />
                <p className="text-white text-sm md:text-lg font-bold italic uppercase tracking-tight leading-relaxed select-none relative z-10">
                  {preguntesTest[preguntaActualIdx].pregunta}
                </p>
              </div>

              {/* LLISTA D'OPCIONS SELECTIVES */}
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
                      onClick={() => handleTriarRespostaWeb(idx)}
                      disabled={showResult}
                      whileHover={!showResult ? { x: 4 } : {}}
                      className={`w-full p-4 md:p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer relative overflow-hidden font-semibold ${borderClass}`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black italic text-xs shrink-0 transition-all ${iconBgClass}`}>
                        {lletres[idx]}
                      </span>
                      <span className="text-[11px] md:text-sm leading-relaxed">{opcio}</span>
                      
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

              {/* TEXT RETROALIMENTACIÓ DENS (EXPLICACIÓ DIDÀCTICA DE L'ERROR/ENCERT) */}
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
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">Explicació i justificació legal</h4>
                      <p className="text-[11.5px] md:text-xs text-slate-350 leading-relaxed font-semibold">
                        {preguntesTest[preguntaActualIdx].explicacio}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BOTÓ SEGUENT / AVANÇAR */}
              <div className="flex justify-between items-center pt-5 border-t border-white/5">
                <button
                  onClick={() => {
                    if (confirm("Segur que vols abandonar el simulacre en curs? Perdràs aquest test (però els intents fets es desen al teu perfil).")) {
                      setSimuladorActiu(false);
                      carregarEstadistiquesRealsWeb();
                    }
                  }}
                  className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  ◀ Abandonar examen
                </button>

                <button
                  onClick={handleSeguentPreguntaWeb}
                  disabled={respostaSeleccionadaIdx === null}
                  className={`py-3 px-8 rounded-xl font-black italic uppercase text-[10px] tracking-widest flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                    respostaSeleccionadaIdx !== null
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-650/20'
                    : 'bg-white/5 text-white/10 cursor-not-allowed'
                  }`}
                >
                  <span>{preguntaActualIdx === preguntesTest.length - 1 ? 'Acabar simulacre 🏁' : 'Següent pregunta ▶'}</span>
                </button>
              </div>

            </div>
          ) : (
            /* RESUM FINAL DE RESULTATS */
            <div className="text-center space-y-8 max-w-4xl mx-auto py-4 animate-in fade-in duration-300">
              
              {/* Icones i trofeu d'èxit o constància */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center text-yellow-500 shadow-xl shadow-yellow-550/10">
                  <Trophy size={36} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-[#00f296] font-black uppercase tracking-wider bg-[#00f296]/15 px-3 py-1 rounded">
                    PROVA DE CAMPUS FINALITZADA COMPLETAMENT
                  </span>
                  <h3 className="text-xl md:text-3xl font-black italic uppercase text-white tracking-widest leading-none mt-2">
                    SIMULACRE COMPLETAT!
                  </h3>
                  <p className="text-xs text-slate-400 font-bold tracking-tight">
                    Avalua les teves mètriques reals per identificar els teus punts forts i el marge exacte d'estudi.
                  </p>
                </div>
              </div>

              {/* Bento grid de resultats del test d'escriptori */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Nota final estil ISPC */}
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[24px] flex flex-col justify-center items-center text-center gap-2">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Nota Estimada</span>
                  <div className="relative flex items-center justify-center">
                    <span className={`text-4xl md:text-6xl font-black italic tracking-tighter ${
                      calcularNotaExamenWeb() >= 5 ? 'text-emerald-400' : 'text-red-500'
                    }`}>
                      {calcularNotaExamenWeb()}
                    </span>
                    <span className="text-slate-500 text-xs font-black absolute -top-1 -right-4">/10</span>
                  </div>
                  <span className="text-[10px] text-slate-400 italic font-bold">
                    {calcularNotaExamenWeb() >= 5 ? '🚦 APTE PER ACCEDIR A L\'ISPC' : '❌ NO APTE (Marge de millora)'}
                  </span>
                </div>

                {/* Encerts totals */}
                <div className="bg-emerald-500/5 border border-emerald-500/15 p-6 rounded-[24px] flex flex-col justify-center items-center text-center gap-1.5">
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Respostes Encertades</span>
                  <span className="text-3xl md:text-5xl font-black italic text-emerald-400">
                    {encertsExamen}
                  </span>
                  <p className="text-[9.5px] text-slate-400 font-semibold italic">
                    Has sumat +{encertsExamen} punts nets al teu perfil.
                  </p>
                </div>

                {/* Errades penalitzades */}
                <div className="bg-red-500/5 border border-red-500/15 p-6 rounded-[24px] flex flex-col justify-center items-center text-center gap-1.5">
                  <span className="text-[10px] text-red-400 font-black uppercase tracking-widest font-bold">Preguntes Errades</span>
                  <span className="text-3xl md:text-5xl font-black italic text-red-500">
                    {erradesExamen}
                  </span>
                  <p className="text-[9.5px] text-slate-400 font-semibold italic">
                    Penalització de -{(erradesExamen * 0.33).toFixed(2)} punts nets.
                  </p>
                </div>

              </div>

              {/* Resum textual de la llista de preguntes resoltes per a un repàs extrem */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-black uppercase text-white/55 ml-2">REVISIÓ DE PREGUNTA PER PREGUNTA:</h4>
                <div className="bg-slate-900/25 border border-white/5 rounded-3xl p-5 md:p-8 space-y-4 max-h-[350px] overflow-y-auto">
                  {preguntesTest.map((qp, idx) => {
                    const triada = historialRespostesTest[idx];
                    const esCorrecta = triada === qp.correcta;
                    return (
                      <div key={idx} className="border-b border-white/5 pb-4 last:border-0 last:pb-0 space-y-2">
                        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2">
                          <span className="text-[11px] text-white font-black italic leading-tight uppercase">
                            {idx + 1}. {qp.pregunta}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            esCorrecta ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {esCorrecta ? '✓ Encertada (+1.00)' : `✗ Errada / Correcta: ${['A', 'B', 'C', 'D'][qp.correcta]} (-0.33)`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 italic leading-relaxed font-semibold">
                          Retro: {qp.explicacio}
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
                Tancar resultats i dissenyar un nou test 🏁
              </button>

            </div>
          )}

        </div>
      ) : (
        /* 2. TAULER DE CONTROL I SELECTOR DE L'ESTUDIANT (ESCRIPTORI COMPLET) */
        <div className="bg-slate-950/45 backdrop-blur-lg border border-slate-850 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 text-left animate-in fade-in duration-300">
          
          {/* Capçalera informativa dels exàmens de la web */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse inline-block" />
                <span className="text-[9px] font-black uppercase text-yellow-500 tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                  Campus Virtual d'Alt Rendiment
                </span>
              </div>
              <h1 className="text-xl md:text-3xl font-black italic uppercase text-white tracking-widest leading-none text-left">
                ⚡ EXÀMENS OPOSIMOSSOS
              </h1>
              <p className="text-xs text-slate-400 font-bold max-w-2xl leading-relaxed text-left">
                Practica a temps real de dilluns a diumenge amb de milers de preguntes específiques de l'oposició. Un ràpid simulador de test que sintonitza les teves errades per demanar retroalimentació immediata.
              </p>
            </div>
          </div>

          {/* TAULER BENTO D'ESTADÍSTIQUES ACADÈMIQUES AMB TEXTURA GLASS */}
          <section className="space-y-3 font-sans">
            <h3 className="text-[10px] font-black italic uppercase tracking-widest text-[#00f296]/90 ml-1">
              • El meu quadre de rendiment persistent
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Targeta 1: Encents totals */}
              <div className="bg-slate-900/35 border border-white/5 p-5 rounded-[22px] flex items-center gap-4 shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={18} className="stroke-[3]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Encerts totals</span>
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
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Errades fallades</span>
                  <span className="text-xl font-black italic text-red-500 leading-tight">
                    {loadingStats ? "..." : totalErrades}
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">Penalitzen d'examen</span>
                </div>
              </div>

              {/* Targeta 3: Millor Tema */}
              <div className="bg-slate-900/35 border border-white/5 p-5 rounded-[22px] flex items-center gap-4 shadow-md relative overflow-hidden group col-span-1 md:col-span-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/5 rounded-full blur-xl pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                  <Trophy size={16} />
                </div>
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">La meva fortalesa</span>
                  <span className="text-[12.5px] font-black italic text-yellow-400 leading-tight truncate mt-0.5 block">
                    {loadingStats ? "Carregant..." : (millorTema ? millorTema.name : 'Per provar')}
                  </span>
                  <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">
                    {millorTema ? `Percentatge d'èxit: ${millorTema.percent}%` : 'Sense intents suficients'}
                  </span>
                </div>
              </div>

              {/* Targeta 4: Pitjor tema (Boto d'accés / Reset) */}
              <div className="bg-slate-900/35 border border-white/5 p-5 rounded-[22px] flex items-center justify-between gap-4 shadow-md min-w-0 relative">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">Punt feble</span>
                    <span className="text-[12.5px] font-black italic text-red-400 leading-tight truncate mt-0.5 block">
                      {loadingStats ? "Carregant..." : (pitjorTema ? pitjorTema.name : 'Per triar')}
                    </span>
                    <span className="text-[7.5px] text-slate-400 font-bold mt-0.5">
                      {pitjorTema ? `Ràtio d'èxit: ${pitjorTema.percent}%` : 'Marge de treball net'}
                    </span>
                  </div>
                </div>

                {/* Acció de reset de l'estudiant de dades de l'escola */}
                <div className="shrink-0 pl-1">
                  {resetConfirm ? (
                    <button
                      onClick={handleResetEstadistiquesWeb}
                      className="w-10 h-10 bg-red-650 hover:bg-red-550 border border-red-550 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-md shadow-red-950/20"
                      title="Confirmar reiniciar tot"
                    >
                      <Check size={14} className="text-white fill-white stroke-[3] animate-pulse" />
                      <span className="text-[6px] font-black uppercase text-white leading-none mt-0.5">Segur?</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setResetConfirm(true)}
                      className="w-10 h-10 bg-slate-950 hover:bg-slate-900 border border-white/5 text-slate-500 hover:text-white transition-all rounded-xl flex items-center justify-center cursor-pointer"
                      title="Reiniciar dades dels testos"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* FILTRA/PANTALLES DE SELECCIÓ (TABS DE TREBALL DE LA PROVA) */}
          <div className="flex w-full bg-slate-950 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => setTab('examen')}
              className={`flex-1 py-3 rounded-xl font-black italic uppercase text-[10px] sm:text-xs tracking-widest transition-all cursor-pointer ${
                tab === 'examen'
                  ? 'bg-yellow-400 text-slate-950 font-black tracking-widest shadow-lg shadow-yellow-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛠️ EXAMEN SELECTIU DE BLOCS I TEMES
            </button>
            
            <button
              onClick={() => setTab('errades')}
              className={`flex-1 py-3 rounded-xl font-black italic uppercase text-[10px] sm:text-xs tracking-widest transition-all cursor-pointer ${
                tab === 'errades'
                  ? 'bg-red-600 text-white font-black tracking-widest shadow-lg shadow-red-650/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 ENTRENAMENT DE PREGUNTES ERRADES
            </button>
          </div>

          {/* CONTINGUT SEGONS PESTANYA SELECCIONADA */}
          {tab === 'examen' ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Llista interactiva explicativa del bloc de l'ordinador */}
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 italic uppercase tracking-widest">
                  Tria els temes que vols incorporar al teu simulacre personalitzat d'escriptori d'avui :
                </p>
              </div>

              {/* GRID MULTICOLUMNA DE BLOCS DE MODALITAT ESCRIPTORI COMPLET */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {BLOCS_ESCRIPTORI.map(bloc => (
                  <div 
                    key={bloc.id} 
                    className={`bg-slate-900/15 backdrop-blur-sm border ${bloc.colorBorder} p-5 md:p-6 rounded-[28px] space-y-4`}
                  >
                    {/* Capçalera del bloc de l'ordinador */}
                    <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                      <div className="flex flex-col text-left">
                        <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-500">Composició escolar</span>
                        <h4 className="text-white text-xs md:text-sm font-black italic uppercase leading-tight mt-0.5">
                          {bloc.nom.split(': ')[1]}
                        </h4>
                      </div>

                      {/* Botó selecció ràpida "Tots" d'escriptori de 2026 */}
                      <button
                        onClick={() => handleToggleTotsClase(bloc.id, bloc.temes.map(t => t.id))}
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded transition-all cursor-pointer border ${
                          seleccions[bloc.id].length === bloc.temes.length
                            ? 'bg-yellow-400 border-yellow-400 text-slate-950 font-black'
                            : 'bg-slate-950 text-slate-400 hover:text-white border-white/5'
                        }`}
                      >
                        {seleccions[bloc.id].length === bloc.temes.length ? '✓ Tots' : '+ Tots'}
                      </button>
                    </div>

                    {/* Llista de temes de disseny comprimit d'alta qualitat d'escriptori */}
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {bloc.temes.map(tema => {
                        const seleccionat = seleccions[bloc.id].includes(tema.id);
                        return (
                          <button
                            key={tema.id}
                            onClick={() => handleToggleTema(bloc.id, tema.id)}
                            className={`w-full p-2.5 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
                              seleccionat
                                ? 'bg-yellow-400/5 border-yellow-400/30 text-yellow-300'
                                : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-900 hover:border-white/10'
                            }`}
                          >
                            <span className={`w-5 h-5 flex items-center justify-center rounded border text-[10px] font-black tracking-tight shrink-0 transition-all ${
                              seleccionat
                                ? 'bg-yellow-400 border-yellow-400 text-slate-950'
                                : 'bg-slate-900 border-white/10 text-slate-500'
                            }`}>
                              {tema.id}
                            </span>
                            <span className="text-[10px] md:text-[11.5px] font-bold truncate leading-tight flex-1">
                              {tema.titol}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* BLOC DE CONFIGURACIÓ DE METRIQUES SENSE POP-UP (DIRECTAMENT EN PANTALLA GENERAL) */}
              <div className="bg-slate-900/10 border border-white/5 p-6 rounded-[28px] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* 1. Volum de preguntes triats */}
                <div className="space-y-3 text-left md:col-span-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">• Mida de preguntes desitjada:</span>
                  <div className="flex gap-2.5">
                    {[10, 30, 100].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumPreguntes(num)}
                        className={`flex-1 py-2.5 font-black text-xs italic rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          numPreguntes === num
                            ? 'bg-[#FFDF00] border-[#FFDF00] text-slate-950 font-black shadow-lg shadow-yellow-500/15'
                            : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <span>{num} Qs</span>
                        {num === 30 && <span className="text-[7.5px] uppercase font-black opacity-70">(OFC)</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Rellotge de minuts triats */}
                <div className="space-y-3 text-left md:col-span-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">• Temps estimador de treball:</span>
                  <div className="flex gap-2.5">
                    {[
                      { label: '10 Min', value: '10' },
                      { label: '45 Min (Is)', value: '45' },
                      { label: 'Indefinit', value: 'inf' }
                    ].map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setTempsLimitMinuts(item.value)}
                        className={`flex-1 py-2.5 font-black text-xs italic rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          tempsLlimitMinuts === item.value
                            ? 'bg-white border-white text-slate-950 font-black shadow-lg shadow-white/10'
                            : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Gran Acció d'engegar el simulador d'exàmens del Campus */}
                <div className="md:col-span-4 pt-2 md:pt-6">
                  <button
                    onClick={handleLlançarExamen}
                    disabled={Object.values(seleccions).flat().length === 0}
                    className={`w-full rounded-2xl py-4 font-black italic uppercase tracking-[0.2em] text-xs shadow-2xl transition-all border-b-4 duration-300 transform active:scale-95 cursor-pointer ${
                      Object.values(seleccions).flat().length > 0
                        ? 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-yellow-500/20 border-yellow-600 font-extrabold'
                        : 'bg-slate-900 text-slate-500 border-transparent cursor-not-allowed opacity-45'
                    }`}
                  >
                    🚀 COMENCAR EL SIMULACRE
                  </button>
                </div>

              </div>

            </div>
          ) : (
            /* COMPONENT D'ENTRENAMENT DE PREGUNTES ERRADES */
            <div className="space-y-6 animate-in fade-in duration-300 text-left max-w-2xl mx-auto py-4">
              
              <div className="bg-slate-900/20 border border-white/5 p-6 rounded-[28px] space-y-4">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                  <Brain size={24} />
                </div>
                
                <h3 className="text-white text-base md:text-lg font-black italic uppercase tracking-wider">
                  SISTEMA DE CORRECCIÓ INTEL·LIGENT DE FALLADES
                </h3>
                
                <p className="text-slate-350 text-xs leading-relaxed font-semibold">
                  S'ha configurat un algorisme didàctic per defecte amb un total estimat de <span className="text-red-400 font-bold">20 preguntes errades històriques d'estudi</span>. En polsar començar, el sistema cercarà automàticament quines preguntes teòriques dels exàmens has fallat en el passat un cop demanades a la xarxa, i te les farà repassar una a una fins consolidar-les amb èxit.
                </p>
                
                <span className="text-[10px] text-slate-400 italic block">
                  👉 Cada vegada que encertis una pregunta de la llista d'errades es canviarà el seu estat a correcte dins del teu perfil de l'acadèmia.
                </span>
              </div>

              <button
                onClick={handleLlançarExamen}
                className="w-full bg-red-650 hover:bg-red-550 text-white rounded-3xl py-5 font-black italic uppercase tracking-[0.3em] text-sm shadow-2xl shadow-red-500/20 active:scale-95 transition-all border-b-4 border-red-800 cursor-pointer text-center"
              >
                ENTRENAR DUBTES ERRATS COMÚNS
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
