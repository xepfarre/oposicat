import { useState, useEffect, useRef } from "react";
import { Timer, RotateCcw, Play, Square, Hash, ChevronRight, Volume2, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * Explicació per a no-programadors:
 * Aquestes constants guarden els valors oficials de puntuació (barems) per al Press de Banca de l'oposició de Mossos d'Esquadra.
 * Cada línia conté els punts que es donen en funció del nombre mínim de repeticions que ha fet l'aspirant.
 */
const TAULA_HOMES_PB = [
  { punts: 10, reps: 43 }, 
  { punts: 9, reps: 39 },
  { punts: 8, reps: 36 },
  { punts: 7, reps: 34 },
  { punts: 6, reps: 33 },
  { punts: 5, reps: 31 },
  { punts: 4, reps: 30 },
  { punts: 3, reps: 28 },
  { punts: 2, reps: 27 },
  { punts: 1, reps: 24 }
];

const TAULA_DONES_PB = [
  { punts: 10, reps: 35 }, 
  { punts: 9, reps: 30 },
  { punts: 8, reps: 27 },
  { punts: 7, reps: 24 },
  { punts: 6, reps: 22 },
  { punts: 5, reps: 20 },
  { punts: 4, reps: 18 },
  { punts: 3, reps: 16 },
  { punts: 2, reps: 13 },
  { punts: 1, reps: 10 }
];

/**
 * Explicació per a no-programadors:
 * Aquesta funció rep les repeticions obtingudes i calcula automàticament la nota final (sobre 10) 
 * comparant-les amb la taula corresponent segons el gènere (home o dona).
 */
const calcularNotaPB = (reps: number, genere: 'home' | 'dona') => {
  const taula = genere === 'home' ? TAULA_HOMES_PB : TAULA_DONES_PB;
  for (const marc of taula) {
    if (reps >= marc.reps) return marc.punts;
  }
  return 0;
};

export function CalculadoraPressWeb() {
  // Explicació per a no-programadors: Controla la pestanya activa (Si veu el simulador interactiu o els barems oficials en una taula clara).
  const [tab, setTab] = useState<'calculadora' | 'oficial'>('calculadora');
  // Explicació per a no-programadors: El sexe d'estudi de l'aspirant per adaptar la càrrega reglamentària.
  const [genere, setGenere] = useState<'home' | 'dona'>('home');
  // Explicació per a no-programadors: Pas del simulador (timer -> introduir dades -> mostrar el certificat de nota).
  const [pas, setPas] = useState<'timer' | 'input' | 'result'>('timer');
  
  // Explicació per a no-programadors: Compta enrere de 5 segons abans de començar per col·locar-se a la barra del banc.
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [preCountdown, setPreCountdown] = useState(5);

  // Explicació per a no-programadors: Colors temàtics depenent del gènere compilat per dotar d'un contrast ergonòmic.
  const themeColor = genere === 'home' ? 'sky-400' : 'orange-500';
  const themeText = genere === 'home' ? 'text-sky-450' : 'text-orange-500';
  const themeBorder = genere === 'home' ? 'border-sky-500/30' : 'border-orange-500/30';
  const themeBg = genere === 'home' ? 'bg-sky-500' : 'bg-orange-500';
  const themeStroke = genere === 'home' ? 'stroke-sky-400' : 'stroke-orange-500';

  // Explicació per a no-programadors: El temps de prova dels 45 segons oficials que disminueixen dinàmicament.
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  
  // Explicació per a no-programadors: Repeticions fetes inserides per l'usuari.
  const [repsInput, setRepsInput] = useState<string>("");

  /**
   * Explicació per a no-programadors:
   * Aquesta funció fa sonar un "bip" acústic real mitjançant l'altaveu de l'ordinador/mòbil.
   * Serveix com una senyalització idèntica a la que usen els jutges físics durant la prova reals de l'oposició.
   */
  const playPip = (type: 'soft' | 'strong' | 'end' = 'soft') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      
      if (type === 'soft') {
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Nota de preparació
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
      } else if (type === 'strong') {
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Senyal d'inici (bip agut)
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.05);
      } else {
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // Fi del temps (bip llarg agut)
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      }
      
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // Explicació per a no-programadors: Gestiona el compte enrere dels 5 segons previs de col·locació física.
  useEffect(() => {
    if (isCountingDown && preCountdown > 0) {
      countdownRef.current = setInterval(() => {
        setPreCountdown(prev => {
          const next = prev - 1;
          if (next > 0) {
            playPip('soft');
          } else if (next === 0) {
            playPip('strong');
            setIsCountingDown(false);
            setIsRunning(true); // Entra el temporitzador oficial de 45 segons
          }
          return next;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [isCountingDown]);

  // Explicació per a no-programadors: Disminueix dècima a dècima el temporitzador de 45 segons per a una precisió total.
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playPip('end');
            setPas('input'); // Obrim immediatament el formulari de repeticions
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, timeLeft]);

  // Explicació per a no-programadors: Encen, atura o cancel·la la prova actual de temporitzador.
  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else if (isCountingDown) {
      setIsCountingDown(false);
      setPreCountdown(5);
    } else {
      setIsCountingDown(true);
      setPreCountdown(5);
      playPip('soft');
    }
  };

  // Explicació per a no-programadors: Reinicia tot el formulari i cronòmetre per preparar un nou intent.
  const resetAll = () => {
    setTimeLeft(45);
    setIsRunning(false);
    setIsCountingDown(false);
    setPreCountdown(5);
    setPas('timer');
    setRepsInput("");
  };

  const finalitzar = () => {
    setPas('result');
  };

  const nota = pas === 'result' ? calcularNotaPB(parseInt(repsInput || "0"), genere) : null;

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-blue-900/30 space-y-6">
      
      {/* Capçalera del component */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FFDF00]" />
          <div>
            <h4 className="text-[11px] font-black tracking-widest text-[#FFDF00] uppercase">Simulador de Press de Banca</h4>
            <p className="text-[9px] text-slate-400 uppercase font-mono">Entrena amb els barems del DOGC i cronòmetre acústic real</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('calculadora')}
            className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'calculadora' ? 'bg-[#FFDF00] text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Calculadora interactiva
          </button>
          <button
            onClick={() => setTab('oficial')}
            className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              tab === 'oficial' ? 'bg-[#FFDF00] text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Barems oficials
          </button>
        </div>
      </div>

      {tab === 'calculadora' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Columna Esquerra: Selector de Gènere i Prova Interactiva */}
          <div className="md:col-span-7 space-y-6 flex flex-col items-center">
            
            {/* Botons de Sexe */}
            <div className="flex gap-2 w-full max-w-sm">
              <button 
                onClick={() => { setGenere('home'); resetAll(); }}
                className={`flex-1 py-2.5 rounded-xl border font-black uppercase tracking-widest text-[9.5px] transition-all cursor-pointer text-center ${
                  genere === 'home' 
                    ? 'bg-sky-500/10 border-sky-400/40 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.1)]' 
                    : 'bg-transparent border-white/5 text-slate-500 hover:text-white'
                }`}
              >
                Home (Càrrega: 40 kg)
              </button>
              <button 
                onClick={() => { setGenere('dona'); resetAll(); }}
                className={`flex-1 py-2.5 rounded-xl border font-black uppercase tracking-widest text-[9.5px] transition-all cursor-pointer text-center ${
                  genere === 'dona' 
                    ? 'bg-orange-500/10 border-orange-400/40 text-orange-450 shadow-[0_0_12px_rgba(249,115,22,0.1)]' 
                    : 'bg-transparent border-white/5 text-slate-500 hover:text-white'
                }`}
              >
                Dona (Càrrega: 25 kg)
              </button>
            </div>

            {/* Visualització del temporitzador segons el pas */}
            <div className="w-full max-w-sm bg-slate-900/60 p-6 rounded-2xl border border-white/5 flex flex-col items-center">
              <AnimatePresence mode="wait">
                {pas === 'timer' && (
                  <motion.div 
                    key="timer-step"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center gap-6 w-full"
                  >
                    {/* Cercle animat del cronòmetre */}
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="88" cy="88" r="76" className="stroke-white/5 fill-none" strokeWidth="8" />
                        {isCountingDown ? (
                           <circle 
                             cx="88" cy="88" r="76" 
                             className="stroke-yellow-400 fill-none transition-all duration-1000" 
                             strokeWidth="8" 
                             strokeDasharray="477" 
                             strokeDashoffset={477 - (477 * (preCountdown / 5))} 
                             strokeLinecap="round" 
                           />
                        ) : (
                           <circle 
                             cx="88" cy="88" r="76" 
                             className={`${themeStroke} fill-none transition-all duration-100`} 
                             strokeWidth="8" 
                             strokeDasharray="477" 
                             strokeDashoffset={477 - (477 * (timeLeft / 45))} 
                             strokeLinecap="round" 
                           />
                        )}
                      </svg>
                      
                      <div className="absolute flex flex-col items-center text-center">
                        <AnimatePresence mode="wait">
                          {isCountingDown ? (
                            <motion.span 
                              key="countdown-val"
                              initial={{ scale: 1.3, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.7, opacity: 0 }}
                              className="text-6xl font-black italic text-yellow-450 tabular-nums"
                            >
                              {preCountdown}
                            </motion.span>
                          ) : (
                            <motion.span 
                              key="timer-val"
                              className="text-5xl font-black italic text-white tabular-nums leading-none"
                            >
                              {Math.ceil(timeLeft)}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">
                          {isCountingDown ? 'COL·LOCAT...' : 'SEGONS'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full space-y-2">
                      <button 
                        onClick={toggleTimer}
                        className={`w-full py-3.5 rounded-full flex items-center justify-center gap-2 font-black uppercase italic tracking-wider transition-all shadow-lg active:scale-95 text-[10px] cursor-pointer ${
                          isRunning || isCountingDown 
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/20' 
                            : themeBg + ' text-slate-950 hover:bg-opacity-90'
                        }`}
                      >
                        {isRunning || isCountingDown ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                        {isCountingDown ? 'Cancel·lar' : isRunning ? 'Aturar cronòmetre' : 'Començar test acústic'}
                      </button>
                      
                      <p className="text-[8.5px] text-slate-400 text-center uppercase tracking-wide flex items-center justify-center gap-1">
                        <Volume2 className="w-3 h-3 text-slate-500" /> El sistema emetrà alertes sonores de ritme de regulació
                      </p>
                    </div>
                  </motion.div>
                )}

                {pas === 'input' && (
                  <motion.div 
                    key="input-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center gap-5 w-full text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450 shadow-xl animate-bounce">
                      <Timer className="w-6 h-6" />
                    </div>
                    
                    <div className="space-y-1">
                      <h5 className="text-sm font-black italic text-white uppercase tracking-tight">TEMPS EXHAURIT!</h5>
                      <p className="text-slate-400 text-[9px] font-semibold uppercase tracking-wider">Configura el total de repeticions que has assolit</p>
                    </div>

                    <div className="relative w-full">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <Hash className="w-4 h-4" />
                      </div>
                      <input 
                        type="number"
                        value={repsInput}
                        onChange={(e) => setRepsInput(e.target.value)}
                        placeholder="Ex. 28 repeticions"
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-10 text-base font-black text-white focus:outline-none focus:border-emerald-400 transition-all font-mono"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={resetAll}
                        className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white font-bold uppercase text-[9px] tracking-wider active:scale-95 transition-all bg-slate-900 cursor-pointer"
                      >
                        Repetir
                      </button>
                      
                      <button 
                        onClick={finalitzar}
                        disabled={!repsInput}
                        className={`flex-[2] py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase italic tracking-wider transition-all shadow-md active:scale-95 text-[9px] cursor-pointer ${
                          repsInput 
                            ? themeBg + ' text-[#00274d]' 
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }`}
                      >
                        Obtenir nota <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {pas === 'result' && (
                  <motion.div 
                    key="result-step"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-5 w-full text-center"
                  >
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <div className={`absolute inset-0 rounded-full ${themeBg} opacity-5 animate-pulse`}></div>
                      <div className="flex flex-col items-center">
                        <span className={`text-[8px] font-black uppercase tracking-[0.22em] ${themeText} mb-1`}>La teva nota</span>
                        <div className="text-6xl font-black italic text-white flex items-baseline leading-none">
                          {nota} <span className={`text-sm ${themeText} opacity-60 ml-0.5`}>/10</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-300 text-xs font-bold italic">
                        Has realitzat <span className={`${themeText} font-black`}>{repsInput} repeticions</span> vàlides
                      </p>
                      <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-relaxed max-w-[200px]">
                        Calculat d'acord amb els barems de la darrera convocatòria de Mossos d'Esquadra.
                      </p>
                    </div>

                    <button 
                      onClick={resetAll}
                      className="w-full py-3 rounded-xl border border-white/10 flex items-center justify-center gap-2 font-black uppercase italic tracking-wider transition-all active:scale-95 text-slate-400 hover:text-white text-[9px] bg-slate-900 cursor-pointer"
                    >
                      <RotateCcw size={13} /> Reiniciar entrenament
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Columna Dreta: Didàctica i consells exclusius */}
          <div className="md:col-span-5 space-y-4 text-xs font-semibold self-start h-full flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest block">📝 REGLAMENT DE PRESS DE BANCA</span>
              
              <div className="space-y-2 text-slate-350 leading-relaxed text-[11px] font-medium">
                <p>
                  1. Es comença estirat sobre el banc, amb els peus plans al terra de manera paral·lela.
                </p>
                <p>
                  2. A l'iniciar l'alarma, disposaràs de <strong className="text-white">45 segons</strong> per fer tantes aixecades com puguis.
                </p>
                <p>
                  3. La barra s'ha de dur a tocar del pit (sense rebotar) i posteriorment estendre totalment els colzes.
                </p>
                <p>
                  4. La càrrega oficial és de <strong className="text-[#FFDF00]">40 kg per homes</strong> i <strong className="text-[#FFDF00]">25 kg per dones</strong>. Un sol intent permès.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-1.5">
              <span className="text-[8.5px] text-sky-400 font-bold uppercase tracking-wider block">⚡ ENTRENAMENT RECOMANAT</span>
              <p className="text-[10px] text-slate-400 italic">
                Treballa 3 dies per setmana la força màxima amb càrregues superiors (60-70%) i 1 dia per setmana fes sèries de resistència a temps real (45s) per condicionar el sistema neuromuscular i aconseguir els 10 punts!
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* Pestanya de Barems Oficials en Taula de Dues Columnes */
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setGenere('home')} 
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer rounded-lg text-center ${
                genere === 'home' ? 'bg-sky-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Càrrega Homes: 40 kg
            </button>
            <button 
              onClick={() => setGenere('dona')} 
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer rounded-lg text-center ${
                genere === 'dona' ? 'bg-orange-500 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Càrrega Dones: 25 kg
            </button>
          </div>

          <div className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden">
            <div className={`grid grid-cols-2 bg-slate-900 p-3 text-[9.5px] font-black uppercase tracking-wide ${themeText} italic border-b border-white/5`}>
              <span>Nota Oficial (Punts)</span>
              <span className="text-right text-white">Repeticions Mínimes Requerides</span>
            </div>
            
            <div className="flex flex-col h-72 overflow-y-auto divide-y divide-white/5">
              {(genere === 'home' ? TAULA_HOMES_PB : TAULA_DONES_PB).map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 p-3 text-[11px] font-bold items-center hover:bg-white/5 transition-colors">
                  <span className={`${themeText} font-black`}>{item.punts} punts</span>
                  <span className="text-right text-white italic font-mono">{idx === 0 ? `≥ ${item.reps} repeticions` : `${item.reps} repeticions`}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 p-3 text-[11px] font-bold items-center bg-rose-950/10">
                <span className="text-rose-400 font-black">0 punts (No apte)</span>
                <span className="text-right text-slate-400 italic font-mono">{genere === 'home' ? '< 24 repeticions' : '< 10 repeticions'}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
