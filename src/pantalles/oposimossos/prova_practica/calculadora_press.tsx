import { useState, useEffect, useRef } from "react";
import { Timer, RotateCcw, Play, Square, Info, ChevronRight, Hash } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * TAULES OFICIALS DE PUNTUACIÓ (PRESS DE BANCA)
 */
const TAULA_HOMES_PB = [
  { punts: 10, reps: 43 }, // > 42
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
  { punts: 10, reps: 35 }, // > 34
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

const calcularNotaPB = (reps: number, genere: 'home' | 'dona') => {
  const taula = genere === 'home' ? TAULA_HOMES_PB : TAULA_DONES_PB;
  for (const marc of taula) {
    if (reps >= marc.reps) return marc.punts;
  }
  return 0;
};

export default function CalculadoraPress({ onTancar }: { onTancar: () => void }) {
  const [tab, setTab] = useState<'calculadora' | 'oficial'>('calculadora');
  const [genere, setGenere] = useState<'home' | 'dona'>('home');
  const [pas, setPas] = useState<'timer' | 'input' | 'result'>('timer');
  
  // ESTATS COMPTE ENRERE PRE-INICI
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [preCountdown, setPreCountdown] = useState(5);

  // COLORS DINÀMICS
  const themeColor = genere === 'home' ? 'emerald-400' : 'orange-500';
  const themeText = genere === 'home' ? 'text-emerald-400' : 'text-orange-500';
  const themeBorder = genere === 'home' ? 'border-emerald-400' : 'border-orange-500';
  const themeBg = genere === 'home' ? 'bg-emerald-400' : 'bg-orange-500';
  const themeStroke = genere === 'home' ? 'stroke-emerald-400' : 'stroke-orange-500';

  // ESTATS CRONÒMETRE
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  
  // INPUT REPS
  const [repsInput, setRepsInput] = useState<string>("");

  // SOROLLS (PIPS)
  const playPip = (type: 'soft' | 'strong' | 'end' = 'soft') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      
      if (type === 'soft') {
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // La4
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      } else if (type === 'strong') {
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // La5
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.05);
      } else {
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // Més agut final
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.05);
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

  // LOGICA COMPTE ENRERE PRE-INICI
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
            setIsRunning(true); // Comença la prova real
          }
          return next;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [isCountingDown]);

  // LOGICA 45 SEGONS
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playPip('end');
            setPas('input');
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

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
    } else if (isCountingDown) {
      setIsCountingDown(false);
      setPreCountdown(5);
    } else {
      setIsCountingDown(true);
      setPreCountdown(5);
      playPip('soft'); // Primer pip immediat
    }
  };

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
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
        <button 
          onClick={() => setTab('calculadora')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'calculadora' ? 'bg-yellow-400 text-[#00274d]' : 'text-white/40'}`}
        >
          Calculadora intel·ligent
        </button>
        <button 
          onClick={() => setTab('oficial')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'oficial' ? 'bg-yellow-400 text-[#00274d]' : 'text-white/40'}`}
        >
          Valors i notes oficials
        </button>
      </div>

      {tab === 'calculadora' ? (
        <div className="flex flex-col gap-8 items-center">
          
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => { setGenere('home'); resetAll(); }}
              className={`flex-1 py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all ${genere === 'home' ? themeBg + '/10 ' + themeBorder + ' ' + themeText : 'bg-transparent border-white/10 text-white/40'}`}
            >
              Home (40kg)
            </button>
            <button 
              onClick={() => { setGenere('dona'); resetAll(); }}
              className={`flex-1 py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all ${genere === 'dona' ? themeBg + '/10 ' + themeBorder + ' ' + themeText : 'bg-transparent border-white/10 text-white/40'}`}
            >
              Dona (25kg)
            </button>
          </div>

          <AnimatePresence mode="wait">
            {pas === 'timer' && (
              <motion.div 
                key="timer-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center gap-8 w-full"
              >
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="128" cy="128" r="115" className="stroke-white/5 fill-none" strokeWidth="10" />
                    {isCountingDown ? (
                       <circle cx="128" cy="128" r="115" className="stroke-yellow-400 fill-none transition-all duration-1000" strokeWidth="10" strokeDasharray="722" strokeDashoffset={722 - (722 * (preCountdown / 5))} strokeLinecap="round" />
                    ) : (
                       <circle cx="128" cy="128" r="115" className={`${themeStroke} fill-none transition-all duration-100`} strokeWidth="10" strokeDasharray="722" strokeDashoffset={722 - (722 * (timeLeft / 45))} strokeLinecap="round" />
                    )}
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <AnimatePresence mode="wait">
                      {isCountingDown ? (
                        <motion.span 
                          key="countdown-val"
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="text-8xl font-black italic text-yellow-400 tabular-nums"
                        >
                          {preCountdown}
                        </motion.span>
                      ) : (
                        <motion.span 
                          key="timer-val"
                          className="text-6xl font-black italic text-white tabular-nums"
                        >
                          {Math.ceil(timeLeft)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                      {isCountingDown ? 'Preparat...' : 'Segons'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={toggleTimer}
                  className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase italic tracking-widest transition-all shadow-xl active:scale-95 ${isRunning || isCountingDown ? 'bg-red-500 text-white' : themeBg + ' text-[#00274d]'}`}
                >
                  {isRunning || isCountingDown ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  {isCountingDown ? 'Cancel·lar' : isRunning ? 'Aturar' : 'Començar compte enrere'}
                </button>
              </motion.div>
            )}

            {pas === 'input' && (
              <motion.div 
                key="input-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center gap-8 w-full"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-400 flex items-center justify-center text-[#00274d] shadow-xl animate-bounce">
                  <Timer size={32} />
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">TEMPS EXHAURIT!</h2>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Quantes repeticions has fet?</p>
                </div>

                <div className="relative w-full">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                    <Hash size={24} />
                  </div>
                  <input 
                    type="number"
                    value={repsInput}
                    onChange={(e) => setRepsInput(e.target.value)}
                    placeholder="Repeticions"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-16 text-2xl font-black text-white focus:outline-none focus:border-emerald-400 transition-all placeholder:text-white/10"
                    autoFocus
                  />
                </div>

                <button 
                  onClick={finalitzar}
                  disabled={!repsInput}
                  className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase italic tracking-widest transition-all shadow-xl active:scale-95 ${repsInput ? themeBg + ' text-[#00274d]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                >
                  Calcula la meva nota <ChevronRight size={20} />
                </button>
              </motion.div>
            )}

            {pas === 'result' && (
              <motion.div 
                key="result-step"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-8 w-full"
              >
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full ${themeBg} opacity-10 animate-pulse`}></div>
                  <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeText} mb-1`}>La teva nota</span>
                    <div className="text-8xl font-black italic text-white flex items-baseline">
                      {nota} <span className={`text-xl ${themeText} opacity-50 ml-1`}>/10</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 text-center">
                   <p className="text-white/60 text-sm font-bold italic">
                     Has fet <span className={themeText}>{repsInput} repeticions</span> oficials.
                   </p>
                   <p className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-relaxed max-w-[200px]">
                     Barems oficials per a {genere === 'home' ? 'homes' : 'dones'}.
                   </p>
                </div>

                <button 
                  onClick={resetAll}
                  className="w-full py-6 rounded-[2rem] border border-white/10 flex items-center justify-center gap-3 font-black uppercase italic tracking-widest transition-all active:scale-95 text-white/50 hover:text-white"
                >
                  <RotateCcw size={20} /> Tornar a provar
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      ) : (
        <div className="flex flex-col gap-4">
           <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <button onClick={() => setGenere('home')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider transition-colors ${genere === 'home' ? 'bg-emerald-400 text-[#00274d]' : 'text-white/40'}`}>Homes</button>
              <button onClick={() => setGenere('dona')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider transition-colors ${genere === 'dona' ? 'bg-orange-500 text-white' : 'text-white/40'}`}>Dones</button>
           </div>
           <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className={`grid grid-cols-2 bg-white/10 p-4 text-[10px] font-black uppercase tracking-widest ${themeText} italic`}>
                <span>Punts (P)</span>
                <span className="text-right text-white">Reps (PB)</span>
              </div>
              <div className="flex flex-col">
                {(genere === 'home' ? TAULA_HOMES_PB : TAULA_DONES_PB).map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 p-4 border-t border-white/5 text-xs font-bold items-center">
                    <span className={`${themeText} font-black`}>{item.punts} punts</span>
                    <span className="text-right text-white italic">{idx === 0 ? `> ${item.reps - 1}` : item.reps} reps</span>
                  </div>
                ))}
                <div className="grid grid-cols-2 p-4 border-t border-white/5 text-xs font-bold items-center bg-red-500/10">
                    <span className="text-red-500 font-black">0 punts</span>
                    <span className="text-right text-white italic">{genere === 'home' ? '< 24' : '< 10'} reps</span>
                </div>
              </div>
           </div>
        </div>
      )}

      <button onClick={onTancar} className="text-white/20 hover:text-white text-[10px] font-black uppercase tracking-widest mt-4 underline underline-offset-4">Tornar enrere</button>
    </div>
  );
}
