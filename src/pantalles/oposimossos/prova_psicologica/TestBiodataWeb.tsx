// Explicació per a no-programadors:
// Aquest component gestiona la pantalla interactiva del TEST BIODATA i EL MEU PERFIL PSICOPROFESSIONAL a la versió Web.
// Permet dos modes de funcionament clarament diferenciats:
// 1. Mode 'practica': El simulacre oficial de 80 preguntes amb compte enrere de 25 minuts, selecció d'opcions (A, B, C),
//    selector ràpid de preguntes, confirmació de lliurament i càlcul automàtic de notes.
// 2. Mode 'perfil': Visualització directa del diagnòstic de les 10 competències clau oficials del Cos de Mossos d'Esquadra,
//    amb verificació de línies vermelles (notes < 5.0) i detector de desitjabilitat social / incoherència (> 6 deutes de 10.0).

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertTriangle, 
  RotateCcw, Sparkles, ShieldCheck, Play, Award, BarChart3, HelpCircle,
  FileCheck, ArrowRight, Eye
} from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { MAP_COMPETENCIES, PreguntaBiodata } from './preguntes_biodata';
import { BANC_80_PREGUNTES_BIODATA } from './banc_preguntes_biodata_default';

interface TestBiodataWebProps {
  modeInicial?: 'practica' | 'perfil';
  onTornar: () => void;
  onTornarMenuPrincipal?: () => void;
  onAnarConsisteix?: () => void;
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
    if (preguntesList.length > 0) {
      setRespostesUsuari(Array(preguntesList.length).fill(null));
    }
  }, [preguntesList]);

  // Explicació per a no-programadors:
  // Índex de la pregunta que l'estudiant està contestant en aquest moment (de 0 a preguntesList.length - 1).
  const [indexPreguntaActual, setIndexPreguntaActual] = useState<number>(0);

  // Temps del test: 25 minuts = 1500 segons
  const TEMPS_TOTAL_SEGONS = 25 * 60;
  const [tempsRestant, setTempsRestant] = useState<number>(TEMPS_TOTAL_SEGONS);

  // Diàleg modal per confirmar el lliurament del test
  const [mostraModalLliurar, setMostraModalLliurar] = useState<boolean>(false);

  // Resultats calculats del test (un array amb les 10 notes de 0 a 10 per a cadascuna de les 10 competències)
  const [resultatsTest, setResultatsTest] = useState<number[] | null>(null);
  const [esResultatExemple, setEsResultatExemple] = useState<boolean>(false);

  // Carregar el darrer test desat (per Firestore o localStorage vinculat a l'usuari actual)
  useEffect(() => {
    const carregarDarrerTest = async () => {
      // Explicació per a no-programadors: 
      // Comprovem si l'usuari actual té un test de Biodata desat a la base de dades Firestore.
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        try {
          const q = query(
            collection(db, `usuaris/${userId}/resultats_biodata`),
            orderBy('creatEl', 'desc'),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0].data();
            if (d.resultats && Array.isArray(d.resultats) && d.resultats.length === 10) {
              setResultatsTest(d.resultats);
              setEsResultatExemple(false);
              return;
            }
          }
        } catch (e) {
          console.error("Error carregant darrer test des de Firestore", e);
        }

        // Si falla Firestore, comprovem el localStorage del navegador privat per a aquest usuari concret
        try {
          const local = localStorage.getItem(`oposicat_biodata_test_${userId}`);
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length === 10) {
              setResultatsTest(parsed);
              setEsResultatExemple(false);
              return;
            }
          }
        } catch (e) {
          console.error("Error carregant darrer test des de local", e);
        }
      }

      // Si l'usuari no ha fet cap test encara, deixem els resultats a null per mostrar-ho a 0 per defecte
      setResultatsTest(null);
      setEsResultatExemple(false);
    };

    carregarDarrerTest();
  }, []);

  // Explicació per a no-programadors:
  // Temporitzador asíncron que corre segon a segon quan l'usuari està fent el test ('fent_test').
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (estatActual === 'fent_test' && tempsRestant > 0) {
      interval = setInterval(() => {
        setTempsRestant((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            // S'ha esgotat el temps de 25 minuts: finalitzem automàticament
            finalitzarTest(respostesUsuari, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [estatActual, tempsRestant, respostesUsuari]);

  // Formatador de temps (ex: 24:59)
  const formatarTemps = (segons: number) => {
    const min = Math.floor(segons / 60);
    const sec = segons % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Explicació per a no-programadors:
  // Funció per calcular la nota final sobre 10 de cadascuna de les 10 competències clau:
  // - Suma els punts obtinguts a cada pregunta segons l'opció triada.
  // - Calcula la proporció respecte a la nota màxima possible.
  // - Normalitza a una escala de 0.0 a 10.0.
  const finalitzarTest = (respostes: (number | null)[], tempsExhaurit = false) => {
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
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      try {
        localStorage.setItem(`oposicat_biodata_test_${userId}`, JSON.stringify(puntuacions));
      } catch (e) {
        console.error("Error desant resultats a localStorage", e);
      }

      // Guardem a Firestore
      addDoc(collection(db, `usuaris/${userId}/resultats_biodata`), {
        userId,
        resultats: puntuacions,
        respostesUsuari: respostes,
        creatEl: new Date().toISOString()
      }).catch(e => console.error("Error desant resultats a Firestore", e));
    }

    setMostraModalLliurar(false);
    setEstatActual('perfil');

    if (tempsExhaurit) {
      alert("⚠️ S'ha esgotat el temps límit de 25 minuts! El teu test s'ha processat automàticament.");
    }
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
            PRACTICAR EL TEST BIODATA
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Simula les condicions reals de la prova de Biodata oficial del Cos de Mossos d'Esquadra. Respon a les 80 preguntes situacionals tancades per mesurar el teu perfil competencial.
          </p>
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

            {/* Pill 2: 25 Minuts */}
            <div className="bg-[#020b18] rounded-2xl border border-slate-800 p-4 flex flex-col gap-1 text-center items-center justify-center">
              <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">25:00</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Temps Límit</span>
              <span className="text-[10px] text-slate-400">Cronòmetre amb compte enrere</span>
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
                <span><strong>Sinceritat realista:</strong> No intentis marcar sempre l'opció perfecta en tot; si obtens un 10 en més de 6 competències es detectarà incoherència / desitjabilitat social.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Línies vermelles:</strong> Qualsevol competència amb una puntuació inferior a 5.0 suposarà un no apte automàtic excloent a l'oposició.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Agilitat:</strong> Disposes d'uns 18 segons de mitjana per pregunta. Respon de forma àgil i sense encallar-te.</span>
              </li>
            </ul>
          </div>

          {/* Botó gran d'inici */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => {
                setTempsRestant(TEMPS_TOTAL_SEGONS);
                setIndexPreguntaActual(0);
                setRespostesUsuari(Array(preguntesList.length).fill(null));
                setEstatActual('fent_test');
              }}
              className="w-full sm:flex-1 py-4 px-8 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.20em] rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm flex items-center justify-center gap-3"
              id="btn-comencar-test-biodata"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>COMENÇAR EL TEST BIODATA</span>
            </button>

            {resultatsTest && (
              <button
                onClick={() => setEstatActual('perfil')}
                className="w-full sm:w-auto py-4 px-6 bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Veure el meu perfil actual</span>
              </button>
            )}
          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // RENDERITZAT 2: SIMULADOR DE TEST ACTIU ('fent_test')
  // =========================================================================
  if (estatActual === 'fent_test') {
    const esUltimaPregunta = indexPreguntaActual === preguntesList.length - 1;
    const respostaSeleccionada = respostesUsuari[indexPreguntaActual];
    const tempsCritic = tempsRestant < 180; // Menys de 3 minuts

    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 text-left font-sans pb-16 animate-in fade-in duration-200">
        
        {/* BARRA SUPERIOR DE CONTROL: TEMPS I PROGRESSIÓ */}
        <div className="bg-[#0c1424]/95 border border-blue-900/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-30 backdrop-blur-md">
          
          {/* Progrés */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
              Pregunta <span className="text-[#FFDF00] text-sm">{indexPreguntaActual + 1}</span> / {preguntesList.length}
            </span>
            <div className="hidden sm:block h-4 w-[1px] bg-slate-700" />
            <span className="text-[11px] font-bold text-slate-400 font-mono hidden sm:inline-block">
              {totalRespostes} contestades ({percentatgeCompletat}%)
            </span>
          </div>

          {/* Rellotge / Cronòmetre */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-black text-sm transition-all ${
              tempsCritic 
                ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' 
                : 'bg-[#020b18] border-slate-700 text-cyan-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatarTemps(tempsRestant)}</span>
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
              onClick={() => setIndexPreguntaActual(prev => Math.max(prev - 1, 0))}
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
                onClick={() => setIndexPreguntaActual(prev => Math.min(prev + 1, preguntesList.length - 1))}
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
                  onClick={() => setIndexPreguntaActual(pIdx)}
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
                  onClick={() => finalitzarTest(respostesUsuari, false)}
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
                Totes les teves competències estan actualment a <strong>0.0 / 10</strong>. Respon les 80 preguntes situacionals (25 minuts) per generar el teu mapa real.
              </p>
            </div>
            <button
              onClick={() => setEstatActual('intro_practica')}
              className="w-full sm:w-auto py-3.5 px-6 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 shrink-0"
              id="btn-comencar-primer-biodata"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Començar el Test Biodata</span>
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
                : "Tindràs 25 minuts per respondre 80 preguntes oficials de caràcter situacional."}
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
