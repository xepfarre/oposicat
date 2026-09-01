// Explicació per a no-programadors:
// Aquest component gestiona la pantalla interactiva del TEST BIODATA / TEST COMPETENCIAL i EL MEU PERFIL PSICOPROFESSIONAL a la versió Web.
// Permet dos modes de funcionament clarament diferenciats:
// 1. Mode 'practica': El simulacre oficial de 80 preguntes amb compte enrere de 45 minuts, selecció d'opcions (A, B, C),
//    selector ràpid de preguntes, auto-guardat automàtic per reprendre el test si es tanca el navegador,
//    avís amigable de temps exhaurit sense penalització i càlcul de notes.
// 2. Mode 'perfil': Visualització directa del diagnòstic de les 10 competències clau oficials del Cos de Mossos d'Esquadra,
//    amb verificació de línies vermelles (notes < 5.0) i detector de desitjabilitat social / incoherència (> 6 deutes de 10.0).

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertTriangle, 
  RotateCcw, Sparkles, ShieldCheck, Play, Award, BarChart3, HelpCircle,
  FileCheck, ArrowRight, Eye, RefreshCw, BookmarkCheck, Check
} from 'lucide-react';
import { collection, addDoc, getDocs, getDoc, doc, setDoc, deleteDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { MAP_COMPETENCIES, PreguntaBiodata } from './preguntes_biodata';
import { BANC_80_PREGUNTES_BIODATA } from './banc_preguntes_biodata_default';

interface TestBiodataWebProps {
  modeInicial?: 'practica' | 'perfil';
  onTornar: () => void;
  onTornarMenuPrincipal?: () => void;
  onAnarConsisteix?: () => void;
}

// Estructura de l'esborrany per guardar el progrés de l'examen a mig fer
interface EsborranyExamenBiodata {
  respostesUsuari: (number | null)[];
  indexPreguntaActual: number;
  tempsRestant: number;
  totalContestades: number;
  dataActualitzacio?: string;
}

export const TestBiodataWeb: React.FC<TestBiodataWebProps> = ({
  modeInicial = 'practica',
  onTornar,
  onTornarMenuPrincipal,
  onAnarConsisteix
}) => {
  // Explicació per a no-programadors:
  // Controla l'estat actual de la pantalla:
  // - 'intro_practica': Pantalla prèvia amb les instruccions del simulacre de 80 preguntes abans d'iniciar el rellotge.
  // - 'fent_test': El simulador de preguntes actiu amb el cronòmetre corrent.
  // - 'perfil': Visualització dels resultats i perfil psicoprofessional de les 10 competències.
  const [estatActual, setEstatActual] = useState<'intro_practica' | 'fent_test' | 'perfil'>(
    modeInicial === 'perfil' ? 'perfil' : 'intro_practica'
  );

  // Carreguem la llista de preguntes:
  // 1r intent: Des de la col·lecció oficial de Firestore 'preguntes_biodata_oficial'.
  // Si no n'hi ha o falla la xarxa: fem servir el banc per defecte de 80 preguntes oficials.
  const [preguntesList, setPreguntesList] = useState<PreguntaBiodata[]>(BANC_80_PREGUNTES_BIODATA);
  const [loadingPreguntes, setLoadingPreguntes] = useState<boolean>(true);

  useEffect(() => {
    const carregarPreguntes = async () => {
      try {
        const q = query(collection(db, "preguntes_biodata_oficial"), orderBy("id", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const llista: PreguntaBiodata[] = [];
          snap.forEach(docSnap => {
            const data = docSnap.data();
            if (!data.suspensa) {
              llista.push({
                id: data.id,
                enunciat: data.enunciat,
                competencia: data.competencia,
                opcions: data.opcions,
                suspensa: data.suspensa
              });
            }
          });
          if (llista.length > 0) {
            llista.sort((a, b) => a.id - b.id);
            setPreguntesList(llista);
          }
        }
      } catch (err) {
        console.warn("Utilitzant banc de preguntes predeterminat per a Biodata", err);
      } finally {
        setLoadingPreguntes(false);
      }
    };
    carregarPreguntes();
  }, []);

  // Explicació per a no-programadors:
  // Array de respostes seleccionades per l'estudiant (un índex numèric 0, 1, 2 per a les opcions A, B, C, o null si encara no ha respost).
  const [respostesUsuari, setRespostesUsuari] = useState<(number | null)[]>([]);

  useEffect(() => {
    if (preguntesList.length > 0 && respostesUsuari.length === 0) {
      setRespostesUsuari(Array(preguntesList.length).fill(null));
    }
  }, [preguntesList, respostesUsuari.length]);

  // Explicació per a no-programadors:
  // Índex de la pregunta que l'estudiant està contestant en aquest moment (de 0 a preguntesList.length - 1).
  const [indexPreguntaActual, setIndexPreguntaActual] = useState<number>(0);

  // Temps del test: 45 minuts = 2700 segons
  const TEMPS_TOTAL_SEGONS = 45 * 60;
  const [tempsRestant, setTempsRestant] = useState<number>(TEMPS_TOTAL_SEGONS);

  // Diàleg modal per confirmar el lliurament del test
  const [mostraModalLliurar, setMostraModalLliurar] = useState<boolean>(false);

  // Diàleg modal per informar que el temps de 45 minuts s'ha esgotat (sense penalització)
  const [mostraModalTempsExhaurit, setMostraModalTempsExhaurit] = useState<boolean>(false);

  // Resultats calculats del test (un array amb les 10 notes de 0 a 10 per a cadascuna de les 10 competències)
  const [resultatsTest, setResultatsTest] = useState<number[] | null>(null);
  const [esResultatExemple, setEsResultatExemple] = useState<boolean>(false);
  const [darrerTestCompletat, setDarrerTestCompletat] = useState<{
    resultats: number[];
    respostesUsuari?: (number | null)[];
    creatEl?: string;
  } | null>(null);

  // Estat per emmagatzemar un esborrany detectat a la base de dades / local
  const [esborranyDetectat, setEsborranyDetectat] = useState<EsborranyExamenBiodata | null>(null);
  const [guardantProgres, setGuardantProgres] = useState<boolean>(false);

  // Diàleg modal amb el disclaimer de confirmació en voler començar un test nou
  const [mostraModalDisclaimerNouTest, setMostraModalDisclaimerNouTest] = useState<boolean>(false);
  
  // Alerta informativa si fa clic a revisar/continuar i no té cap test guardat
  const [mostraAvisSenseTest, setMostraAvisSenseTest] = useState<boolean>(false);

  // Comprovació i càrrega d'esborranys pendents en obrir el component
  // Comentari per a no-programadors:
  // Aquesta funció cerca a la base de dades de Firestore si l'usuari (o l'alumne Marc Betriu) té un examen a mitges.
  // Cerca tant pel compte autenticat com per l'identificador únic de base de dades de Marc Betriu (JtA1NbIFIqNlCKHbG5wKJ9G8VLr1)
  // per assegurar que es recuperin totes les respostes, el temps restant i la pregunta on es va quedar.
  useEffect(() => {
    const comprovarEsborrany = async () => {
      const u = auth.currentUser;
      const uidsACercar = Array.from(
        new Set([u?.uid, 'JtA1NbIFIqNlCKHbG5wKJ9G8VLr1'].filter(Boolean))
      ) as string[];

      // 1r intent: Cercar a Firestore per tots els UIDs candidats
      if (db) {
        for (const uid of uidsACercar) {
          try {
            // Intent A: Col·lecció 'esborrany_test_competencial' -> doc 'actual'
            const docRefA = doc(db, 'usuaris', uid, 'esborrany_test_competencial', 'actual');
            const snapA = await getDoc(docRefA);
            if (snapA.exists()) {
              const d = snapA.data();
              const respostes = Array.isArray(d.respostesUsuari) ? d.respostesUsuari : Array.isArray(d.respostes) ? d.respostes : null;
              if (respostes && respostes.length > 0) {
                const contestades = respostes.filter((r: any) => r !== null && r !== undefined).length;
                if (contestades > 0) {
                  setEsborranyDetectat({
                    respostesUsuari: respostes,
                    indexPreguntaActual: typeof d.indexPreguntaActual === 'number' ? d.indexPreguntaActual : 0,
                    tempsRestant: typeof d.tempsRestant === 'number' && d.tempsRestant > 0 ? d.tempsRestant : TEMPS_TOTAL_SEGONS,
                    totalContestades: contestades,
                    dataActualitzacio: d.dataActualitzacio || new Date().toLocaleString('ca-ES')
                  });
                  return;
                }
              }
            }

            // Intent B: Col·lecció 'esborrany_biodata' -> doc 'actual'
            const docRefB = doc(db, 'usuaris', uid, 'esborrany_biodata', 'actual');
            const snapB = await getDoc(docRefB);
            if (snapB.exists()) {
              const d = snapB.data();
              const respostes = Array.isArray(d.respostesUsuari) ? d.respostesUsuari : Array.isArray(d.respostes) ? d.respostes : null;
              if (respostes && respostes.length > 0) {
                const contestades = respostes.filter((r: any) => r !== null && r !== undefined).length;
                if (contestades > 0) {
                  setEsborranyDetectat({
                    respostesUsuari: respostes,
                    indexPreguntaActual: typeof d.indexPreguntaActual === 'number' ? d.indexPreguntaActual : 0,
                    tempsRestant: typeof d.tempsRestant === 'number' && d.tempsRestant > 0 ? d.tempsRestant : TEMPS_TOTAL_SEGONS,
                    totalContestades: contestades,
                    dataActualitzacio: d.dataActualitzacio || new Date().toLocaleString('ca-ES')
                  });
                  return;
                }
              }
            }

            // Intent C: Document principal de l'usuari
            const userDocRef = doc(db, 'usuaris', uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const ud = userSnap.data();
              const possibleDraft = ud.esborrany_test_competencial || ud.esborranyBiodata || ud.biodata_progres;
              if (possibleDraft && Array.isArray(possibleDraft.respostesUsuari)) {
                const contestades = possibleDraft.respostesUsuari.filter((r: any) => r !== null && r !== undefined).length;
                if (contestades > 0) {
                  setEsborranyDetectat({
                    respostesUsuari: possibleDraft.respostesUsuari,
                    indexPreguntaActual: possibleDraft.indexPreguntaActual || 0,
                    tempsRestant: possibleDraft.tempsRestant || TEMPS_TOTAL_SEGONS,
                    totalContestades: contestades,
                    dataActualitzacio: possibleDraft.dataActualitzacio || new Date().toLocaleString('ca-ES')
                  });
                  return;
                }
              }
            }
          } catch (e) {
            console.warn(`No s'ha pogut llegir l'esborrany de Firestore per a ${uid}:`, e);
          }
        }
      }

      // 2n intent: Des de localStorage com a còpia de seguretat
      for (const uid of uidsACercar) {
        try {
          const localKeys = [
            `oposicat_biodata_esborrany_${uid}`,
            `oposicat_biodata_esborrany_JtA1NbIFIqNlCKHbG5wKJ9G8VLr1`,
            'oposicat_biodata_esborrany_default'
          ];
          for (const key of localKeys) {
            const localData = localStorage.getItem(key);
            if (localData) {
              const parsed = JSON.parse(localData);
              if (Array.isArray(parsed.respostesUsuari) && parsed.respostesUsuari.length > 0) {
                const contestades = parsed.respostesUsuari.filter((r: any) => r !== null && r !== undefined).length;
                if (contestades > 0) {
                  setEsborranyDetectat({
                    respostesUsuari: parsed.respostesUsuari,
                    indexPreguntaActual: parsed.indexPreguntaActual || 0,
                    tempsRestant: parsed.tempsRestant || TEMPS_TOTAL_SEGONS,
                    totalContestades: contestades,
                    dataActualitzacio: parsed.dataActualitzacio || new Date().toLocaleString('ca-ES')
                  });
                  return;
                }
              }
            }
          }
        } catch (e) {
          console.warn("Error llegint esborrany de localStorage:", e);
        }
      }
    };

    comprovarEsborrany();
  }, []);

  // Funció per desar el progrés de l'examen en temps real
  const desarProgresActual = async (
    respostes: (number | null)[],
    indexPreg: number,
    temps: number
  ) => {
    const u = auth.currentUser;
    const uid = u?.uid || (u?.email === 'marcbetriu@gmail.com' ? 'JtA1NbIFIqNlCKHbG5wKJ9G8VLr1' : 'JtA1NbIFIqNlCKHbG5wKJ9G8VLr1');
    const contestades = respostes.filter(r => r !== null).length;

    const dadesEsborrany = {
      respostesUsuari: respostes,
      indexPreguntaActual: indexPreg,
      tempsRestant: temps,
      totalContestades: contestades,
      dataActualitzacio: new Date().toLocaleString('ca-ES'),
      emailAlumne: u?.email || 'marcbetriu@gmail.com'
    };

    // Guardem en local per accés instantani
    try {
      const localKey = `oposicat_biodata_esborrany_${uid}`;
      localStorage.setItem(localKey, JSON.stringify(dadesEsborrany));
      localStorage.setItem('oposicat_biodata_esborrany_JtA1NbIFIqNlCKHbG5wKJ9G8VLr1', JSON.stringify(dadesEsborrany));
    } catch (e) {
      console.warn("Error guardant a localStorage:", e);
    }

    // Guardem a Firestore
    if (uid && db) {
      setGuardantProgres(true);
      try {
        const docRef = doc(db, 'usuaris', uid, 'esborrany_test_competencial', 'actual');
        await setDoc(docRef, {
          ...dadesEsborrany,
          ultimaActualitzacioTimestamp: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn("Error desant esborrany a Firestore:", err);
      } finally {
        setGuardantProgres(false);
      }
    }
  };

  // Funció per esborrar l'esborrany quan el test es finalitza definitivament o es reinicia de zero
  const netejarEsborrany = async () => {
    const u = auth.currentUser;
    const uidsANetejar = Array.from(
      new Set([u?.uid, 'JtA1NbIFIqNlCKHbG5wKJ9G8VLr1'].filter(Boolean))
    ) as string[];

    for (const uid of uidsANetejar) {
      try {
        localStorage.removeItem(`oposicat_biodata_esborrany_${uid}`);
      } catch (e) {}
      
      if (db) {
        try {
          const docRef = doc(db, 'usuaris', uid, 'esborrany_test_competencial', 'actual');
          await deleteDoc(docRef);
        } catch (e) {
          console.warn(`Error esborrant esborrany de Firestore per a ${uid}:`, e);
        }
      }
    }

    try {
      localStorage.removeItem('oposicat_biodata_esborrany_default');
    } catch (e) {}

    setEsborranyDetectat(null);
  };

  // Carregar el darrer test desat (per Firestore o localStorage vinculat a Marc Betriu o usuari actual)
  useEffect(() => {
    const carregarDarrerTest = async () => {
      const u = auth.currentUser;
      const uidsACercar = Array.from(
        new Set([u?.uid, 'JtA1NbIFIqNlCKHbG5wKJ9G8VLr1'].filter(Boolean))
      ) as string[];

      if (db) {
        for (const uid of uidsACercar) {
          try {
            const q = query(
              collection(db, `usuaris/${uid}/resultats_biodata`),
              orderBy('creatEl', 'desc'),
              limit(1)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
              const d = snap.docs[0].data();
              if (d.resultats && Array.isArray(d.resultats) && d.resultats.length === 10) {
                setResultatsTest(d.resultats);
                setDarrerTestCompletat({
                  resultats: d.resultats,
                  respostesUsuari: d.respostesUsuari || undefined,
                  creatEl: d.creatEl || undefined
                });
                setEsResultatExemple(false);
                return;
              }
            }
          } catch (e) {
            console.error(`Error carregant darrer test des de Firestore per a ${uid}`, e);
          }
        }
      }

      // Si falla Firestore, comprovem el localStorage privat
      for (const uid of uidsACercar) {
        try {
          const local = localStorage.getItem(`oposicat_biodata_test_${uid}`);
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length === 10) {
              setResultatsTest(parsed);
              setDarrerTestCompletat({
                resultats: parsed
              });
              setEsResultatExemple(false);
              return;
            }
          }
        } catch (e) {
          console.error("Error carregant darrer test des de local", e);
        }
      }

      setResultatsTest(null);
      setDarrerTestCompletat(null);
      setEsResultatExemple(false);
    };

    carregarDarrerTest();
  }, []);

  // Explicació per a no-programadors:
  // Temporitzador asíncron que corre segon a segon quan l'usuari està fent el test ('fent_test').
  // En cas d'arribar a 0, NO penalitza: obre un modal informatiu que tranquil·litza l'usuari i li permet lliurar o continuar.
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (estatActual === 'fent_test' && tempsRestant > 0) {
      interval = setInterval(() => {
        setTempsRestant((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            // S'ha esgotat el temps de 45 minuts: informem a l'usuari sense cap penalització
            setMostraModalTempsExhaurit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [estatActual, tempsRestant]);

  // Formatador de temps (ex: 44:59)
  const formatarTemps = (segons: number) => {
    const min = Math.floor(segons / 60);
    const sec = segons % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Explicació per a no-programadors:
  // Funció per calcular la nota final sobre 10 de cadascuna de les 10 competències clau:
  // - Suma els punts obtinguts a cada pregunta segons l'opció triada.
  // - Calcula la proporció respecte a la nota màxima possible.
  // - Normalitza a una escala de 0.0 a 10.0 sense cap penalització de temps.
  const finalitzarTest = (respostes: (number | null)[]) => {
    const puntsAconseguits: Record<string, number> = {};
    const puntsMaxims: Record<string, number> = {};

    MAP_COMPETENCIES.forEach(comp => {
      puntsAconseguits[comp.id] = 0;
      puntsMaxims[comp.id] = 0;
    });

    preguntesList.forEach((preg, idx) => {
      const respostaIdx = respostes[idx];

      MAP_COMPETENCIES.forEach(comp => {
        const compId = comp.id;

        const getPunts = (op: any) => {
          if (op.multidimensional && op.multidimensional[compId] !== undefined) {
            return op.multidimensional[compId];
          }
          if (preg.competencia === compId) {
            return op.punts || 0;
          }
          return 0;
        };

        const maxPunts = Math.max(...preg.opcions.map(getPunts), 0);
        puntsMaxims[compId] += maxPunts;

        if (respostaIdx !== null && preg.opcions[respostaIdx] !== undefined) {
          puntsAconseguits[compId] += getPunts(preg.opcions[respostaIdx]);
        }
      });
    });

    const puntuacions: number[] = MAP_COMPETENCIES.map(comp => {
      const aconseguit = puntsAconseguits[comp.id] || 0;
      const maxim = puntsMaxims[comp.id] || 1;

      if (maxim === 0) return 5.0;

      let nota = (aconseguit / maxim) * 10;
      if (nota < 0) nota = 0;
      if (nota > 10) nota = 10;

      return parseFloat(nota.toFixed(1));
    });

    setResultatsTest(puntuacions);
    setEsResultatExemple(false);

    // Guardem a localStorage privat de l'usuari actual
    const u = auth.currentUser;
    const userId = u?.uid || (u?.email === 'marcbetriu@gmail.com' ? 'JtA1NbIFIqNlCKHbG5wKJ9G8VLr1' : null);

    if (userId) {
      try {
        localStorage.setItem(`oposicat_biodata_test_${userId}`, JSON.stringify(puntuacions));
      } catch (e) {
        console.error("Error desant resultats a localStorage", e);
      }

      // Guardem a Firestore
      if (db) {
        addDoc(collection(db, `usuaris/${userId}/resultats_biodata`), {
          userId,
          resultats: puntuacions,
          respostesUsuari: respostes,
          creatEl: new Date().toISOString()
        }).catch(e => console.error("Error desant resultats a Firestore", e));
      }
    }

    // Netejem l'esborrany un cop lliurat l'examen
    netejarEsborrany();

    setMostraModalLliurar(false);
    setMostraModalTempsExhaurit(false);
    setEstatActual('perfil');
  };

  // Funció per reprendre un examen guardat prèviament
  const handleReprendreExamen = () => {
    if (!esborranyDetectat) return;

    // Assegurem que l'array té la mida correcta
    let respostesRestaurades = [...esborranyDetectat.respostesUsuari];
    if (respostesRestaurades.length < preguntesList.length) {
      const afegir = Array(preguntesList.length - respostesRestaurades.length).fill(null);
      respostesRestaurades = [...respostesRestaurades, ...afegir];
    }

    setRespostesUsuari(respostesRestaurades);
    setIndexPreguntaActual(Math.min(esborranyDetectat.indexPreguntaActual || 0, preguntesList.length - 1));
    setTempsRestant(esborranyDetectat.tempsRestant > 0 ? esborranyDetectat.tempsRestant : TEMPS_TOTAL_SEGONS);
    setEstatActual('fent_test');
  };

  // Funció per començar un examen de zero
  const handleComencarDeZero = () => {
    setTempsRestant(TEMPS_TOTAL_SEGONS);
    setIndexPreguntaActual(0);
    setRespostesUsuari(Array(preguntesList.length).fill(null));
    netejarEsborrany();
    setEstatActual('fent_test');
  };

  // Funció per gestionar el clic a "Revisar / Continuar test"
  const handleClicRevisarContinuar = () => {
    if (esborranyDetectat && esborranyDetectat.totalContestades > 0) {
      // Reprèn el test a mig fer
      handleReprendreExamen();
    } else if (resultatsTest || darrerTestCompletat) {
      // Obre el perfil / diagnòstic de l'últim test completat
      setEstatActual('perfil');
    } else {
      // No té cap test previ
      setMostraAvisSenseTest(true);
    }
  };

  // Funció per gestionar el clic a "Començar un test nou"
  const handleClicComencarNouTest = () => {
    // Si té un esborrany o un test anterior, o directament sempre, mostrem el disclaimer requerit
    setMostraModalDisclaimerNouTest(true);
  };

  // Nombre de preguntes respostes
  const totalRespostes = respostesUsuari.filter(r => r !== null).length;
  const percentatgeCompletat = preguntesList.length > 0 
    ? Math.round((totalRespostes / preguntesList.length) * 100)
    : 0;

  const preguntaActualObj = preguntesList[indexPreguntaActual] || preguntesList[0];

  // =========================================================================
  // RENDERITZAT 1: PANTALLA D'INTRODUCCIÓ DE PRÀCTICA
  // =========================================================================
  if (estatActual === 'intro_practica') {
    const teTestEnCurs = esborranyDetectat && esborranyDetectat.totalContestades > 0;
    const teTestCompletat = Boolean(resultatsTest || darrerTestCompletat);

    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 text-left font-sans pb-12 animate-in fade-in duration-200">
        
        {/* Barra superior de navegació */}
        <div className="flex items-center justify-between">
          <button
            onClick={onTornar}
            className="group inline-flex items-center gap-2 text-slate-300 hover:text-[#FFDF00] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
            id="btn-tornar-biodata-menu-top"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Tornar a la Prova Biodata</span>
          </button>

          {onAnarConsisteix && (
            <button
              onClick={onAnarConsisteix}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-emerald-500/10"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>En què consisteix la prova</span>
            </button>
          )}
        </div>

        {/* Capçalera del Test */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFDF00] shrink-0 shadow-[0_0_8px_rgba(255,223,0,0.8)]" />
            <span className="text-[10px] text-[#FFDF00] font-black uppercase tracking-[0.2em] font-mono">
              SIMULACRE OFICIAL D'OPOSICIÓ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            TEST COMPETENCIAL (BIODATA)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Simula les condicions de la prova competencial oficial de Mossos d'Esquadra. Respon a les 80 preguntes situacionals amb 45 minuts de temps per mesurar el teu perfil competencial.
          </p>
        </div>

        {/* ===================================================================== */}
        {/* LES 2 OPCIONS PRINCIPALS D'ACCÉS AL TEST COMPETENCIAL */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* OPCIÓ 1: REVISAR / CONTINUAR TEST */}
          <div 
            onClick={handleClicRevisarContinuar}
            className={`group relative rounded-3xl p-6 sm:p-7 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-5 shadow-2xl ${
              teTestEnCurs
                ? 'bg-gradient-to-br from-[#0c1424] via-blue-950/80 to-amber-950/30 border-[#FFDF00]/70 hover:border-[#FFDF00] ring-1 ring-[#FFDF00]/30 hover:scale-[1.01]'
                : teTestCompletat
                ? 'bg-gradient-to-br from-[#0c1424] via-blue-950/60 to-emerald-950/30 border-emerald-500/50 hover:border-emerald-400 hover:scale-[1.01]'
                : 'bg-[#0c1424]/90 border-blue-900/40 hover:border-slate-600 hover:bg-[#0f1b2e]'
            }`}
            id="card-opcio-revisar-continuar-test"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/5 group-hover:bg-[#FFDF00]/20 text-[#FFDF00] rounded-2xl shrink-0 border border-white/10 group-hover:border-[#FFDF00]/40 transition-colors shadow-inner">
                  {teTestEnCurs ? (
                    <BookmarkCheck className="w-6 h-6 text-[#FFDF00]" />
                  ) : teTestCompletat ? (
                    <Award className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <RotateCcw className="w-6 h-6 text-cyan-400" />
                  )}
                </div>

                {teTestEnCurs ? (
                  <span className="text-[10px] font-black bg-[#FFDF00] text-slate-950 px-3 py-1 rounded-full uppercase tracking-wider font-mono shadow-md animate-pulse">
                    En curs
                  </span>
                ) : teTestCompletat ? (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    Últim test desat
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    Historial
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-[#FFDF00] transition-colors">
                  Revisar / Continuar test
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {teTestEnCurs
                    ? `Tens un examen a mig fer amb ${esborranyDetectat?.totalContestades} de ${preguntesList.length} preguntes contestades. Continua exactament des d'on el vas deixar amb el temps restant.`
                    : teTestCompletat
                    ? "Revisa els resultats i diagnòstic psicoprofessional complet de les 10 competències del teu darrer test finalitzat."
                    : "Revisa o reprèn el teu darrer simulacre de preguntes enregistrat."}
                </p>
              </div>
            </div>

            {/* Mètriques o estat visual si hi ha examen en curs */}
            {teTestEnCurs && esborranyDetectat && (
              <div className="grid grid-cols-2 gap-2 bg-[#020b18]/80 p-3 rounded-2xl border border-[#FFDF00]/20 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pregunta actual</span>
                  <span className="text-sm font-black text-cyan-300 font-mono">
                    {esborranyDetectat.indexPreguntaActual + 1} de {preguntesList.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Temps restant</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {formatarTemps(esborranyDetectat.tempsRestant)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClicRevisarContinuar();
              }}
              className="w-full py-3 px-4 bg-white/10 group-hover:bg-[#FFDF00] group-hover:text-slate-950 text-white font-black uppercase tracking-wider text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              id="btn-revisar-continuar-test"
            >
              {teTestEnCurs ? (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>CONTINUAR ON HO VAIG DEIXAR</span>
                </>
              ) : teTestCompletat ? (
                <>
                  <Award className="w-4 h-4" />
                  <span>REVISAR EL MEU ÚLTIM TEST</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>REVISAR / CONTINUAR TEST</span>
                </>
              )}
            </button>
          </div>

          {/* OPCIÓ 2: COMENÇAR UN TEST NOU */}
          <div 
            onClick={handleClicComencarNouTest}
            className="group relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#0c1424] via-blue-950/70 to-amber-950/20 border-2 border-slate-700/80 hover:border-[#FFDF00] transition-all duration-200 cursor-pointer flex flex-col justify-between gap-5 shadow-2xl hover:scale-[1.01]"
            id="card-opcio-comencar-test-nou"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-[#FFDF00]/15 group-hover:bg-[#FFDF00] group-hover:text-slate-950 text-[#FFDF00] rounded-2xl shrink-0 border border-[#FFDF00]/30 transition-all shadow-inner">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                  Simulacre 45 min
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide group-hover:text-[#FFDF00] transition-colors">
                  Començar un test nou
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Inicia un nou simulacre complet oficial de 80 preguntes situacionals des de zero amb compte enrere de 45 minuts.
                </p>
              </div>
            </div>

            <div className="bg-[#020b18]/80 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#FFDF00] shrink-0 mt-0.5" />
              <span>
                Avalua les teves 10 competències de Mossos d'Esquadra de forma neta i actualitzada.
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClicComencarNouTest();
              }}
              className="w-full py-3 px-4 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black uppercase tracking-wider text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 active:scale-95"
              id="btn-comencar-test-nou-principal"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>COMENÇAR UN TEST NOU</span>
            </button>
          </div>

        </div>

        {/* Targeta d'Instruccions i Paràmetres oficials */}
        <div className="bg-[#0c1424]/90 rounded-3xl border border-blue-900/40 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <span>Normativa i Paràmetres del Simulacre</span>
            </h2>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              Format Oficial
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pill 1: 80 Preguntes */}
            <div className="bg-[#020b18] rounded-2xl border border-slate-800 p-4 flex flex-col gap-1 text-center items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-[#FFDF00] font-mono">80</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Preguntes Situacionals</span>
              <span className="text-[10px] text-slate-400">3 opcions de resposta (A, B, C)</span>
            </div>

            {/* Pill 2: 45 Minuts */}
            <div className="bg-[#020b18] rounded-2xl border border-slate-800 p-4 flex flex-col gap-1 text-center items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">45:00</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Temps Límit (45 min)</span>
              <span className="text-[10px] text-slate-400">Sense penalització si s'esgota</span>
            </div>

            {/* Pill 3: 10 Competències */}
            <div className="bg-[#020b18] rounded-2xl border border-slate-800 p-4 flex flex-col gap-1 text-center items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">10</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Competències Clau</span>
              <span className="text-[10px] text-slate-400">Diagnòstic complet del perfil</span>
            </div>
          </div>

          {/* Consells essencials */}
          <div className="bg-[#020b18] rounded-2xl border border-slate-800 p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Consells clau per respondre el test</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Temps i tranquil·litat:</strong> Disposes de 45 minuts (uns 34 segons per pregunta). Si s'esgota el temps, podràs revisar i lliurar sense cap penalització.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Guardat continu:</strong> Cada resposta que marquis es guarda automàticament. Si tanques la finestra per error, podràs reprendre l'examen sense perdre res.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Sinceritat realista:</strong> No intentis marcar sempre l'opció perfecta en tot; si obtens un 10 en més de 6 competències es detectarà incoherència / desitjabilitat social.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Línies vermelles:</strong> Qualsevol competència amb una puntuació inferior a 5.0 suposarà un no apte automàtic excloent a l'oposició.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* MODAL DISCLAIMER PER A COMENÇAR UN TEST NOU */}
        {/* ===================================================================== */}
        {mostraModalDisclaimerNouTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0b1b2d] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-2xl shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">
                    Començar un nou test
                  </h3>
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider font-mono font-bold">
                    Avís de reinici de simulacre
                  </span>
                </div>
              </div>

              <div className="bg-[#020b18] rounded-2xl border border-slate-800 p-4 space-y-2 text-xs">
                <p className="text-amber-300 font-bold text-sm leading-relaxed">
                  Si fas clic a continuar es borrarà el teu últim test.
                </p>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Aquesta acció reiniciarà el cronòmetre a 45:00 minuts i obrirà les 80 preguntes del simulacre des de zero. A partir d'aquest moment, aquest serà el test actiu que sortirà quan facis clic a <strong>"Revisar / Continuar test"</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setMostraModalDisclaimerNouTest(false);
                    handleComencarDeZero();
                  }}
                  className="w-full py-3.5 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 text-xs font-black uppercase tracking-widest italic rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  id="btn-confirmar-comencar-nou-test"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>SÍ, CONTINUAR I COMENÇAR TEST NOU</span>
                </button>
                <button
                  onClick={() => setMostraModalDisclaimerNouTest(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all border border-white/5 cursor-pointer"
                >
                  Cancel·lar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* MODAL INFORMATIU SI NO HI HA TEST PREVI PER REVISAR */}
        {/* ===================================================================== */}
        {mostraAvisSenseTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0b1b2d] border border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 border border-blue-500/40 text-cyan-300 rounded-2xl shrink-0">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">
                    Sense test previ detectat
                  </h3>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-mono font-bold">
                    Primer accés al Test Biodata
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Encara no tens cap simulacre començat ni cap test previ enregistrat. Fes clic a <strong>"Començar un test nou"</strong> per iniciar el teu primer simulacre oficial de 80 preguntes.
              </p>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setMostraAvisSenseTest(false);
                    setMostraModalDisclaimerNouTest(true);
                  }}
                  className="w-full py-3.5 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Començar un test nou ara
                </button>
                <button
                  onClick={() => setMostraAvisSenseTest(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all border border-white/5 cursor-pointer"
                >
                  Tancar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // RENDERITZAT 2: SIMULADOR DE TEST ACTIU ('fent_test')
  // =========================================================================
  if (estatActual === 'fent_test') {
    const esUltimaPregunta = indexPreguntaActual === preguntesList.length - 1;
    const respostaSeleccionada = respostesUsuari[indexPreguntaActual];
    const tempsCritic = tempsRestant < 180 && tempsRestant > 0; // Menys de 3 minuts

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 text-left font-sans pb-16 animate-in fade-in duration-200">
        
        {/* BARRA SUPERIOR DE CONTROL: TEMPS I PROGRESSIÓ */}
        <div className="bg-[#0c1424]/95 border border-blue-900/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-30 backdrop-blur-md">
          
          {/* Progrés i indicador de guardat automàtic */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
              Pregunta <span className="text-[#FFDF00] text-sm">{indexPreguntaActual + 1}</span> / {preguntesList.length}
            </span>
            <div className="hidden sm:block h-4 w-[1px] bg-slate-700" />
            <span className="text-[11px] font-bold text-slate-400 font-mono hidden sm:inline-block">
              {totalRespostes} contestades ({percentatgeCompletat}%)
            </span>

            {/* Indicador discret de sincronització */}
            <span className="hidden md:flex items-center gap-1 text-[10px] text-emerald-400/80 font-mono pl-2">
              <Check className="w-3 h-3" /> Auto-guardat
            </span>
          </div>

          {/* Rellotge / Cronòmetre */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-black text-sm transition-all ${
              tempsRestant === 0
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : tempsCritic 
                ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' 
                : 'bg-[#020b18] border-slate-700 text-cyan-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{tempsRestant === 0 ? '45:00 (Temps esgotat)' : formatarTemps(tempsRestant)}</span>
            </div>

            {/* Botó Lliurar Test */}
            <button
              onClick={() => setMostraModalLliurar(true)}
              className="py-2 px-5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              id="btn-lliurar-test-top"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lliurar Test</span>
            </button>
          </div>
        </div>

        {/* BARRA DE PROGRÉS VISUAL */}
        <div className="w-full bg-slate-900/80 h-2 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-[#FFDF00] to-emerald-400 transition-all duration-300"
            style={{ width: `${percentatgeCompletat}%` }}
          />
        </div>

        {/* TARGETA DE LA PREGUNTA ACTUAL */}
        <div className="bg-[#0c1424]/90 rounded-3xl border border-blue-900/40 p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Capçalera de la pregunta */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFDF00] shrink-0" />
              <span className="text-[11px] font-black text-[#FFDF00] uppercase tracking-wider font-mono">
                PREGUNTA {indexPreguntaActual + 1} DE {preguntesList.length}
              </span>
            </div>
            
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-400/20 px-3 py-1 rounded-full font-mono uppercase tracking-wider">
              {preguntaActualObj.competencia}
            </span>
          </div>

          {/* Enunciat */}
          <p className="text-base sm:text-lg md:text-xl font-bold text-white leading-relaxed">
            {preguntaActualObj.enunciat}
          </p>

          {/* Les 3 opcions de resposta (A, B, C) */}
          <div className="space-y-3 pt-2">
            {preguntaActualObj.opcions.map((opcio, opIdx) => {
              const lletra = opIdx === 0 ? 'A' : opIdx === 1 ? 'B' : 'C';
              const estaSeleccionada = respostaSeleccionada === opIdx;

              return (
                <button
                  key={opIdx}
                  onClick={() => {
                    const novesRespostes = [...respostesUsuari];
                    novesRespostes[indexPreguntaActual] = opIdx;
                    setRespostesUsuari(novesRespostes);
                    // Guardat automàtic del progrés
                    desarProgresActual(novesRespostes, indexPreguntaActual, tempsRestant);
                  }}
                  className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                    estaSeleccionada
                      ? 'bg-blue-950 border-[#FFDF00] text-white shadow-xl shadow-amber-500/10 ring-2 ring-[#FFDF00]/30'
                      : 'bg-[#020b18] hover:bg-slate-900/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 transition-colors ${
                    estaSeleccionada
                      ? 'bg-[#FFDF00] text-slate-950'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}>
                    {lletra}
                  </span>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed pt-1">
                    {opcio.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CONTROLS DE NAVEGACIÓ ENTRE PREGUNTES */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              disabled={indexPreguntaActual === 0}
              onClick={() => {
                const nouIndex = Math.max(indexPreguntaActual - 1, 0);
                setIndexPreguntaActual(nouIndex);
                desarProgresActual(respostesUsuari, nouIndex, tempsRestant);
              }}
              className={`py-3 px-5 rounded-2xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                indexPreguntaActual === 0
                  ? 'bg-white/2 border-white/5 text-slate-600 cursor-not-allowed'
                  : 'bg-[#020b18] hover:bg-white/10 border-slate-800 text-slate-300 hover:text-white cursor-pointer active:scale-95'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {esUltimaPregunta ? (
              <button
                onClick={() => setMostraModalLliurar(true)}
                className="py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <span>Finalitzar i Lliurar</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  const nouIndex = Math.min(indexPreguntaActual + 1, preguntesList.length - 1);
                  setIndexPreguntaActual(nouIndex);
                  desarProgresActual(respostesUsuari, nouIndex, tempsRestant);
                }}
                className="py-3 px-6 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <span>Següent</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SELECTOR RÀPID NUMÈRIC DE 80 PREGUNTES */}
        <div className="bg-[#0c1424]/80 rounded-3xl border border-blue-900/30 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Navegador de preguntes
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Contestada
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-700" /> Pendent
              </span>
            </div>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-16 gap-1.5">
            {preguntesList.map((p, pIdx) => {
              const contestada = respostesUsuari[pIdx] !== null;
              const esActual = indexPreguntaActual === pIdx;

              return (
                <button
                  key={pIdx}
                  onClick={() => {
                    setIndexPreguntaActual(pIdx);
                    desarProgresActual(respostesUsuari, pIdx, tempsRestant);
                  }}
                  className={`h-8 rounded-lg font-mono text-[10.5px] font-bold transition-all cursor-pointer flex items-center justify-center ${
                    esActual
                      ? 'bg-[#FFDF00] text-slate-950 ring-2 ring-amber-400 font-black scale-105'
                      : contestada
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10 hover:text-slate-300'
                  }`}
                  title={`Pregunta ${pIdx + 1}`}
                >
                  {pIdx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* MODAL INFORMATIU DE TEMPS EXHAURIT (45 MINUTS) SENSE PENALITZACIÓ */}
        {mostraModalTempsExhaurit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0b1b2d] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-2xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">
                    Temps límit de 45 minuts exhaurit
                  </h3>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono font-bold">
                    Entorn d'entrenament OposiCAT (Sense penalització)
                  </span>
                </div>
              </div>

              <div className="bg-[#020b18] rounded-2xl border border-slate-800 p-4 space-y-2 text-xs">
                <p className="text-slate-200 leading-relaxed">
                  El compte enrere de 45 minuts ha finalitzat. Com que estàs en un <strong>entorn de prova i aprenentatge</strong>, <strong className="text-emerald-400">no hi ha cap penalització de punts ni descompte</strong>.
                </p>
                <div className="pt-2 flex justify-between text-slate-300 font-mono text-[11px] border-t border-slate-800/80">
                  <span>Preguntes respostes:</span>
                  <span className="text-emerald-400 font-bold">{totalRespostes} / {preguntesList.length}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  onClick={() => finalitzarTest(respostesUsuari)}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-widest italic rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Lliurar el test i veure el meu diagnòstic
                </button>
                <button
                  onClick={() => setMostraModalTempsExhaurit(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all border border-white/5 cursor-pointer"
                >
                  Continuar responent / revisar sense pressa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CONFIRMACIÓ DE LLIURAMENT */}
        {mostraModalLliurar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0b1b2d] border border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase italic text-white">
                    Lliurar el test de Biodata?
                  </h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                    Simulacre oficial de 80 preguntes
                  </span>
                </div>
              </div>

              <div className="bg-[#020b18] rounded-2xl border border-slate-800 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Preguntes contestades:</span>
                  <span className="text-emerald-400 font-bold font-mono">{totalRespostes} / {preguntesList.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Preguntes en blanc:</span>
                  <span className="text-amber-400 font-bold font-mono">{preguntesList.length - totalRespostes}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Temps restant:</span>
                  <span className="text-cyan-400 font-bold font-mono">{formatarTemps(tempsRestant)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                En confirmar, es processaran les teves respostes i es generarà el teu <strong>perfil psicoprofessional complet de les 10 competències</strong>.
              </p>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => finalitzarTest(respostesUsuari)}
                  className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-slate-950 text-xs font-black uppercase tracking-widest italic rounded-2xl transition-all cursor-pointer shadow-lg shadow-red-500/20"
                >
                  SÍ, LLIURAR EL TEST ARA
                </button>
                <button
                  onClick={() => setMostraModalLliurar(false)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all border border-white/5 cursor-pointer"
                >
                  Continuar contestant
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // RENDERITZAT 3: EL MEU PERFIL PSICOPROFESSIONAL ('perfil')
  // =========================================================================
  if (estatActual === 'perfil') {
    const haRealitzatTest = resultatsTest !== null && Array.isArray(resultatsTest) && resultatsTest.length === 10;

    // Càlcul de mètriques d'idoneïtat de Mossos d'Esquadra si ha fet el test:
    // 1. Si qualsevol competència és < 5.0 -> NO APTE (Línia vermella)
    // 2. Si hi ha > 6 desenes de 10.0 -> INCOHERENT (Detector de mentides / Desitjabilitat social)
    const competenciesSotaPerfil = haRealitzatTest 
      ? MAP_COMPETENCIES.filter((comp, idx) => (resultatsTest[idx] || 0) < 5.0) 
      : [];
    const perfectesDe10 = haRealitzatTest 
      ? MAP_COMPETENCIES.filter((comp, idx) => (resultatsTest[idx] || 0) === 10.0) 
      : [];

    let veredicteTipus: 'APTE' | 'NO_APTE' | 'INCOHERENT' | 'PENDENT' = 'PENDENT';
    let veredicteTitol = "SENSE PROVES REALITZADES";
    let veredicteDescripcio = "Encara no has realitzat cap simulacre del Test Biodata. Fes el teu primer test interactiu de 80 preguntes oficials per mesurar les 10 competències clau, verificar les teves línies vermelles i obtenir el teu perfil psicoprofessional complet.";
    let veredicteEstil = "border-blue-500/30 bg-blue-500/10 text-cyan-300";

    if (haRealitzatTest) {
      if (competenciesSotaPerfil.length > 0) {
        veredicteTipus = 'NO_APTE';
        veredicteTitol = "NO APTE AUTOMÀTIC (LÍNIES VERMELLES)";
        veredicteDescripcio = `Has obtingut una puntuació inferior a 5.0 en competències crítiques (${competenciesSotaPerfil.map(c => c.nom).join(', ')}). Aquest perfil resulta excloent de forma directa a la fase d'oposició.`;
        veredicteEstil = "border-red-500/30 bg-red-500/10 text-red-400";
      } else if (perfectesDe10.length > 6) {
        veredicteTipus = 'INCOHERENT';
        veredicteTitol = "TEST INCOHERENT (DETECTOR DE MENTIDES)";
        veredicteDescripcio = "S'han identificat més de 6 competències amb un 10.0 perfecte simultani. El sistema detecta desitjabilitat social excessiva o manca de sinceritat. Un perfil humà real té matisos; evita fingir perfecció absoluta.";
        veredicteEstil = "border-amber-500/30 bg-amber-500/10 text-amber-400";
      } else {
        veredicteTipus = 'APTE';
        veredicteTitol = "APTE AMB BON PERFIL POLICIAL";
        veredicteDescripcio = "El teu patró competencial és òptim, sòlid i equilibrat. Complir amb el perfil de caràcter policial de Mossos d'Esquadra. Et recomanem entrenar la defensa d'aquests resultats de cara a l'entrevista personal.";
        veredicteEstil = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      }
    }

    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 text-left font-sans pb-16 animate-in fade-in duration-200">
        
        {/* Barra de retorn superior */}
        <div className="flex items-center justify-between">
          <button
            onClick={onTornar}
            className="group inline-flex items-center gap-2 text-slate-300 hover:text-[#FFDF00] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
            id="btn-tornar-biodata-menu-perfil"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Tornar a la Prova Biodata</span>
          </button>

          <button
            onClick={() => setEstatActual('intro_practica')}
            className="text-[11px] font-bold text-[#FFDF00] hover:text-amber-300 transition-colors uppercase tracking-wider flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-amber-400/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{haRealitzatTest ? 'Fer un nou test' : 'Iniciar primer test'}</span>
          </button>
        </div>

        {/* Capçalera del Perfil */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px] ${
              haRealitzatTest ? 'bg-emerald-400 shadow-emerald-400/80' : 'bg-cyan-400 shadow-cyan-400/80'
            }`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-mono ${
              haRealitzatTest ? 'text-emerald-400' : 'text-cyan-400'
            }`}>
              DIAGNÒSTIC DE RENDIMENT PERSONAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
            EL MEU PERFIL PSICOPROFESSIONAL
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Avaluació de les 10 competències clau del perfil oficial de Mossos d'Esquadra basades en el teu test de Biodata.
          </p>
        </div>

        {/* TARGETA DE VEREDICTE GLOBAL */}
        <div className={`rounded-3xl border p-6 sm:p-8 shadow-2xl space-y-3 backdrop-blur-md ${veredicteEstil}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider font-mono">
              VEREDICTE DE L'INFORME BIODATA
            </span>
            <span className="font-mono text-[10px] font-black uppercase tracking-widest border border-current px-2.5 py-0.5 rounded-full">
              {veredicteTipus}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-wide">
            {veredicteTitol}
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-white/80">
            {veredicteDescripcio}
          </p>
        </div>

        {/* BANNER D'AVÍS / CRIDA A L'ACCIÓ SI ENCARA NO S'HA FET CAP TEST */}
        {!haRealitzatTest && (
          <div className="bg-[#0c1424]/90 border border-[#FFDF00]/30 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 backdrop-blur-md">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFDF00]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#FFDF00]">
                  Comença el teu diagnòstic competencial
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Totes les teves competències estan actualment a <strong>0.0 / 10</strong>. Respon les 80 preguntes situacionals (45 minuts) per generar el teu mapa real.
              </p>
            </div>
            <button
              onClick={() => setEstatActual('intro_practica')}
              className="w-full sm:w-auto py-3.5 px-6 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shrink-0"
              id="btn-comencar-primer-biodata"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Començar el Test Competencial</span>
            </button>
          </div>
        )}

        {/* GRAELLA DE LES 10 COMPETÈNCIES CLAU */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Desglossament de les 10 Competències Clau</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Puntuacions de 0.0 a 10.0</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MAP_COMPETENCIES.map((comp, idx) => {
              const valor = haRealitzatTest && resultatsTest[idx] !== undefined 
                ? resultatsTest[idx] 
                : 0.0;

              let colorText = "text-slate-400";
              let colorBarra = "bg-slate-700";
              let badgeBg = "bg-slate-800 text-slate-400 border-slate-700";
              let etiquetaRang = "Pendent d'avaluar";

              if (haRealitzatTest) {
                if (valor < 5.0) {
                  colorText = "text-red-400";
                  colorBarra = "bg-red-500";
                  badgeBg = "bg-red-500/10 text-red-400 border-red-500/20";
                  etiquetaRang = "Sota perfil / Línia vermella";
                } else if (valor < 7.0) {
                  colorText = "text-amber-400";
                  colorBarra = "bg-amber-400";
                  badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  etiquetaRang = "Correcte / Millorable";
                } else {
                  colorText = "text-emerald-400";
                  colorBarra = "bg-emerald-400";
                  badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  etiquetaRang = "Apte / Excel·lent";
                }
              }

              return (
                <div 
                  key={idx}
                  className="bg-[#0c1424]/90 rounded-2xl border border-blue-900/40 p-5 shadow-lg flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        {idx + 1}. {comp.nom}
                      </span>
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-400/20 font-bold">
                        {comp.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {comp.descripcio}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeBg}`}>
                        {etiquetaRang}
                      </span>
                      <div className="flex items-baseline gap-0.5">
                        <span className={`font-mono text-base font-black ${colorText}`}>
                          {valor.toFixed(1)}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">/10</span>
                      </div>
                    </div>

                    <div className="w-full bg-[#020b18] h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${colorBarra}`}
                        style={{ width: `${valor * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACCIONS FINALS */}
        <div className="bg-[#0c1424]/90 rounded-3xl border border-blue-900/40 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wide">
              {haRealitzatTest 
                ? "Vols repetir el test per millorar les teves competències?" 
                : "Vols realitzar el teu primer simulacre ara mateix?"}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {haRealitzatTest 
                ? "Pots realitzar tants simulacres com necessitis abans de la prova real." 
                : "Tindràs 45 minuts per respondre 80 preguntes oficials de caràcter situacional."}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setEstatActual('intro_practica')}
              className="w-full sm:w-auto py-3.5 px-6 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              {haRealitzatTest ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
              <span>{haRealitzatTest ? 'Repetir el Test' : 'Començar el Test'}</span>
            </button>

            <button
              onClick={onTornar}
              className="w-full sm:w-auto py-3.5 px-5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-white/10 cursor-pointer"
            >
              Menú Biodata
            </button>
          </div>
        </div>

      </div>
    );
  }

  return null;
};
