import { useState, useEffect, useRef } from "react";
import { Timer, RotateCcw, Play, Square, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * TAULES OFICIALS DE PUNTUACIÓ (CIRCUIT D'AGILITAT)
 * Basades en les imatges proporcionades per l'usuari.
 */
const TAULA_HOMES = [
  { punts: 10, temps: 16.3 },
  { punts: 9, temps: 16.8 },
  { punts: 8, temps: 17.3 },
  { punts: 7, temps: 17.8 },
  { punts: 6, temps: 18.4 },
  { punts: 5, temps: 18.9 },
  { punts: 4, temps: 19.4 },
  { punts: 3, temps: 19.9 },
  { punts: 2, temps: 20.4 },
  { punts: 1, temps: 21.5 }
];

const TAULA_DONES = [
  { punts: 10, temps: 18.9 },
  { punts: 9, temps: 19.5 },
  { punts: 8, temps: 20.2 },
  { punts: 7, temps: 20.9 },
  { punts: 6, temps: 21.6 },
  { punts: 5, temps: 22.3 },
  { punts: 4, temps: 23.0 },
  { punts: 3, temps: 23.7 },
  { punts: 2, temps: 24.4 },
  { punts: 1, temps: 25.5 }
];

const calcularNota = (temps: number, genere: 'home' | 'dona') => {
  const taula = genere === 'home' ? TAULA_HOMES : TAULA_DONES;
  for (const marc of taula) {
    if (temps <= marc.temps) return marc.punts;
  }
  return 0;
};

export default function CalculadoraCircuit({ onTancar }: { onTancar: () => void }) {
  const [tab, setTab] = useState<'calculadora' | 'oficial'>('calculadora');
  const [genere, setGenere] = useState<'home' | 'dona'>('home');
  
  // COLORS DINÀMICS segons el gènere
  const themeColor = genere === 'home' ? 'emerald-400' : 'orange-500';
  const themeText = genere === 'home' ? 'text-emerald-400' : 'text-orange-500';
  const themeBorder = genere === 'home' ? 'border-emerald-400' : 'border-orange-500';
  const themeBg = genere === 'home' ? 'bg-emerald-400' : 'bg-orange-500';
  const themeBgAlpha = genere === 'home' ? 'bg-emerald-400/10' : 'bg-orange-500/10';
  const themeStroke = genere === 'home' ? 'stroke-emerald-400' : 'stroke-orange-500';

  // ESTATS CRONÒMETRE
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now() - (time * 1000);
      timerRef.current = setInterval(() => {
        const currentSeconds = (Date.now() - startTime) / 1000;
        if (currentSeconds >= 60) {
          setTime(60);
          setIsRunning(false);
          setHasFinished(true);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setTime(currentSeconds);
        }
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const toggleTimer = () => {
    if (hasFinished) {
      setTime(0);
      setHasFinished(false);
    } else {
      if (isRunning) {
        setIsRunning(false);
        setHasFinished(true);
      } else {
        setIsRunning(true);
      }
    }
  };

  const nota = hasFinished ? calcularNota(time, genere) : null;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SELECTOR DE MODO */}
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
          
          {/* SELECTOR GÈNERE */}
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => { setGenere('home'); setHasFinished(false); setTime(0); }}
              className={`flex-1 py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all ${genere === 'home' ? 'bg-emerald-400/10 border-emerald-400 text-emerald-400' : 'bg-transparent border-white/10 text-white/40'}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setGenere('dona'); setHasFinished(false); setTime(0); }}
              className={`flex-1 py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all ${genere === 'dona' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-transparent border-white/10 text-white/40'}`}
            >
              Dona
            </button>
          </div>

          {/* CRONÒMETRE VISUAL (MÉS GRAN) */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle 
                cx="128" cy="128" r="115" 
                className="stroke-white/5 fill-none" 
                strokeWidth="10"
              />
              <circle 
                cx="128" cy="128" r="115" 
                className={`${themeStroke} fill-none transition-all duration-100`} 
                strokeWidth="10"
                strokeDasharray="722"
                strokeDashoffset={722 - (722 * (time / 60))}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute flex flex-col items-center">
              <AnimatePresence mode="wait">
                {hasFinished ? (
                  <motion.div 
                    key="score"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeText} mb-1`}>La teva nota</span>
                    <div className="text-7xl font-black italic text-white flex items-baseline">
                      {nota} <span className={`text-xl ${themeText} opacity-50 ml-1`}>/10</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="timer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-5xl font-black italic text-white tabular-nums">
                      {time.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Segons</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* BOTÓ ACCIÓ */}
          <button 
            onClick={toggleTimer}
            className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase italic tracking-widest transition-all shadow-xl active:scale-95 ${hasFinished ? 'bg-white/10 text-white' : isRunning ? 'bg-red-500 text-white' : `${themeBg} text-[#00274d]`}`}
          >
            {hasFinished ? <RotateCcw size={20} /> : isRunning ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            {hasFinished ? 'Tornar a provar' : isRunning ? 'Aturar' : 'Començar'}
          </button>

          {/* INFO SEGONS EL GÈNERE */}
          {hasFinished && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-white/40 uppercase font-bold text-center leading-relaxed"
            >
              Has trigat {time.toFixed(2)}s. <br/> Barems oficials per a {genere === 'home' ? 'homes' : 'dones'}.
            </motion.p>
          )}

        </div>
      ) : (
        <div className="flex flex-col gap-4">
           {/* TAULES OFICIALS */}
           <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <button 
                onClick={() => setGenere('home')}
                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider transition-colors ${genere === 'home' ? 'bg-emerald-400 text-[#00274d]' : 'text-white/40'}`}
              >
                Homes
              </button>
              <button 
                onClick={() => setGenere('dona')}
                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider transition-colors ${genere === 'dona' ? 'bg-orange-500 text-white' : 'text-white/40'}`}
              >
                Dones
              </button>
           </div>

           <div className={`bg-white/5 rounded-2xl border ${themeBorder} border-opacity-20 overflow-hidden shadow-2xl`}>
              <div className={`grid grid-cols-2 bg-white/10 p-4 text-[10px] font-black uppercase tracking-widest ${themeText} italic`}>
                <span>Punts (P)</span>
                <span className="text-right text-white">Temps (CA)</span>
              </div>
              <div className="flex flex-col">
                {(genere === 'home' ? TAULA_HOMES : TAULA_DONES).map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 p-4 border-t border-white/5 text-xs font-bold items-center">
                    <span className={`${themeText} font-black`}>{item.punts} punts</span>
                    <span className="text-right text-white italic">{idx === 0 ? `< ${item.temps}` : item.temps} s</span>
                  </div>
                ))}
                <div className="grid grid-cols-2 p-4 border-t border-white/5 text-xs font-bold items-center bg-red-500/10">
                    <span className="text-red-500 font-black">0 punts</span>
                    <span className="text-right text-white italic">{genere === 'home' ? '> 21.5' : '> 25.5'} s</span>
                </div>
              </div>
           </div>

           <div className={`p-4 ${themeBgAlpha} border border-white/5 rounded-xl flex gap-3 ${themeText} opacity-80`}>
              <Info size={16} className="shrink-0" />
              <p className="text-[9px] font-medium leading-relaxed italic">
                Aquests barems són els utilitzats en la darrera convocatòria oficial de Mossos d'Esquadra.
              </p>
           </div>
        </div>
      )}

      {/* BOTÓ TORNAR AL DETALL */}
      <button 
        onClick={onTancar}
        className="text-white/20 hover:text-white text-[10px] font-black uppercase tracking-widest mt-4 underline underline-offset-4"
      >
        Tornar enrere
      </button>

    </div>
  );
}
