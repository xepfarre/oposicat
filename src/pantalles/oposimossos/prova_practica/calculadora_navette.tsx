import { useState, useEffect, useRef } from "react";
import { Timer, RotateCcw, Play, Square, Info, Activity, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * CONFIGURACIÓ COURSE NAVETTE (Standard Léger)
 * Cada nivell dura aprox 1 minut.
 */
const NAVETTE_DATA = [
  { level: 1, speed: 8.5, shuttles: 7, interval: 8.47 },
  { level: 2, speed: 9.0, shuttles: 8, interval: 8.00 },
  { level: 3, speed: 9.5, shuttles: 8, interval: 7.58 },
  { level: 4, speed: 10.0, shuttles: 9, interval: 7.20 },
  { level: 5, speed: 10.5, shuttles: 9, interval: 6.86 },
  { level: 6, speed: 11.0, shuttles: 10, interval: 6.55 },
  { level: 7, speed: 11.5, shuttles: 10, interval: 6.26 },
  { level: 8, speed: 12.0, shuttles: 11, interval: 6.00 },
  { level: 9, speed: 12.5, shuttles: 11, interval: 5.76 },
  { level: 10, speed: 13.0, shuttles: 12, interval: 5.54 },
  { level: 11, speed: 13.5, shuttles: 12, interval: 5.33 },
  { level: 12, speed: 14.0, shuttles: 13, interval: 5.14 },
  { level: 13, speed: 14.5, shuttles: 13, interval: 4.97 },
];

/**
 * BAREMS OFICIALS MOSSOS (CL)
 */
const SCORE_HOMES = [
  { punts: 10, val: 12.5 },
  { punts: 9, val: 12.0 },
  { punts: 8, val: 11.0 },
  { punts: 7, val: 10.5 },
  { punts: 6, val: 9.5 },
  { punts: 5, val: 9.0 },
  { punts: 4, val: 8.5 },
  { punts: 3, val: 8.0 },
  { punts: 2, val: 7.5 },
  { punts: 1, val: 6.5 }
];

const SCORE_DONES = [
  { punts: 10, val: 10.0 },
  { punts: 9, val: 9.0 },
  { punts: 8, val: 8.0 },
  { punts: 7, val: 7.5 },
  { punts: 6, val: 7.0 },
  { punts: 5, val: 6.5 },
  { punts: 4, val: 6.0 },
  { punts: 3, val: 5.0 },
  { punts: 2, val: 4.5 },
  { punts: 1, val: 3.5 }
];

const calcularNotaNavette = (level: number, shuttle: number, totalShuttlesInLevel: number, genere: 'home' | 'dona') => {
  const currentVal = level + (shuttle / totalShuttlesInLevel);
  const taula = genere === 'home' ? SCORE_HOMES : SCORE_DONES;
  for (const marc of taula) {
    if (currentVal >= marc.val) return marc.punts;
  }
  return 0;
};

export default function CalculadoraNavette({ onTancar }: { onTancar: () => void }) {
  const [tab, setTab] = useState<'calculadora' | 'oficial'>('calculadora');
  const [genere, setGenere] = useState<'home' | 'dona'>('home');
  const [pas, setPas] = useState<'start' | 'running' | 'result'>('start');
  
  // COLORS DINÀMICS
  const themeColor = genere === 'home' ? 'emerald-400' : 'orange-500';
  const themeText = genere === 'home' ? 'text-emerald-400' : 'text-orange-500';
  const themeStroke = genere === 'home' ? 'stroke-emerald-400' : 'stroke-orange-500';
  const themeBg = genere === 'home' ? 'bg-emerald-400' : 'bg-orange-500';

  // ESTATS NAVETTE
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [preCountdown, setPreCountdown] = useState(5);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentShuttle, setCurrentShuttle] = useState(1);
  const [shuttleTimeLeft, setShuttleTimeLeft] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // ESTATS FINALS
  const [finalLevel, setFinalLevel] = useState(0);
  const [finalShuttle, setFinalShuttle] = useState(0);
  const [finalTotalShuttles, setFinalTotalShuttles] = useState(0);

  const playPip = (type: 'soft' | 'strong' | 'start' = 'soft') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      
      if (type === 'soft') {
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      } else if (type === 'strong') {
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.05);
      } else {
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.1);
      }
      
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
  };

  const parlar = (text: string) => {
    if ('speechSynthesis' in window) {
      // Netegem qualsevol veu pendent per evitar cues que bloquegin el sistema
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ca-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Millora per a iOS: Forçar la cerca de veus de nou cada vegada
      const voices = window.speechSynthesis.getVoices();
      const veuCatalana = voices.find(v => v.lang.includes('ca-') || v.lang === 'ca-ES') 
                         || voices.find(v => v.name.toLowerCase().includes('català'));
      
      if (veuCatalana) {
        utterance.voice = veuCatalana;
      }

      // En iOS a vegades cal un petit retard entre el cancel i el speak
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  };

  /**
   * FUNCIÓ CRÍTICA PER A iOS: 
   * Desbloqueja els sistemes d'audio i veu en la primera interacció oficial
   */
  const desbloquejarAudioiOS = async () => {
    // 1. Desbloquejar AudioContext
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      // Fem sonar un silenci per inicialitzar el maquinari
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("No s'ha pogut desbloquejar l'AudioContext", e);
    }

    // 2. Desbloquejar SpeechSynthesis amb una frase buida
    if ('speechSynthesis' in window) {
      const emptyUtterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(emptyUtterance);
    }
  };

  // Carregar veus tan bon punt el component està llest (específic per a Safari/Chrome iOS)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoices = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoices);
    }
  }, []);

  // COMPTE ENRERE PREVI
  useEffect(() => {
    if (isCountingDown && preCountdown > 0) {
      countdownRef.current = setInterval(() => {
        setPreCountdown(prev => {
          const next = prev - 1;
          if (next > 0) playPip('soft');
          else if (next === 0) {
            playPip('start');
            setIsCountingDown(false);
            setPas('running');
            startNavette();
            parlar("Comença la prova de resistència. Nivell 1.");
          }
          return next;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [isCountingDown]);

  const startNavette = () => {
    setCurrentLevelIdx(0);
    setCurrentShuttle(1);
    setShuttleTimeLeft(NAVETTE_DATA[0].interval);
  };

  // LÒGICA NAVETTE
  useEffect(() => {
    if (pas === 'running') {
      timerRef.current = setInterval(() => {
        setShuttleTimeLeft(prev => {
          if (prev <= 0.1) {
            const levelData = NAVETTE_DATA[currentLevelIdx];
            let nextShuttle = currentShuttle;
            let nextLevelIdx = currentLevelIdx;

            if (currentShuttle < levelData.shuttles) {
              // SEGÜENT SHUTTLE MATEIX NIVELL
              playPip('strong');
              nextShuttle = currentShuttle + 1;
              setCurrentShuttle(nextShuttle);
              
              // Anunciar nivell i mig (aproximadament a la meitat dels llargs)
              const migNivell = Math.floor(levelData.shuttles / 2) + 1;
              if (nextShuttle === migNivell) {
                const notaActual = calcularNotaNavette(levelData.level, nextShuttle, levelData.shuttles, genere);
                parlar(`Nivell ${levelData.level} i mig. Si et plantes ara tens la puntuació de ${notaActual}.`);
              }

              return levelData.interval;
            } else {
              // SEGÜENT NIVELL
              if (currentLevelIdx < NAVETTE_DATA.length - 1) {
                playPip('start');
                nextLevelIdx = currentLevelIdx + 1;
                setCurrentLevelIdx(nextLevelIdx);
                setCurrentShuttle(1);
                
                const notaActual = calcularNotaNavette(NAVETTE_DATA[nextLevelIdx].level, 1, NAVETTE_DATA[nextLevelIdx].shuttles, genere);
                parlar(`Nivell ${NAVETTE_DATA[nextLevelIdx].level}. Si et plantes ara tens la puntuació de ${notaActual}.`);
                
                return NAVETTE_DATA[nextLevelIdx].interval;
              } else {
                finalitzar();
                return 0;
              }
            }
          }
          return prev - 0.05;
        });
      }, 50);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pas, currentLevelIdx, currentShuttle]);

  const finalitzar = () => {
    setFinalLevel(NAVETTE_DATA[currentLevelIdx].level);
    setFinalShuttle(currentShuttle);
    setFinalTotalShuttles(NAVETTE_DATA[currentLevelIdx].shuttles);
    setPas('result');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetAll = () => {
    setPas('start');
    setIsCountingDown(false);
    setPreCountdown(5);
    setCurrentLevelIdx(0);
    setCurrentShuttle(1);
  };

  const nota = pas === 'result' ? calcularNotaNavette(finalLevel, finalShuttle, finalTotalShuttles, genere) : null;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* TABS OFICIALS/CALC */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
        <button onClick={() => setTab('calculadora')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'calculadora' ? 'bg-yellow-400 text-[#00274d]' : 'text-white/40'}`}>Calculadora intel·ligent</button>
        <button onClick={() => setTab('oficial')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'oficial' ? 'bg-yellow-400 text-[#00274d]' : 'text-white/40'}`}>Valors i notes oficials</button>
      </div>

      {tab === 'calculadora' ? (
        <div className="flex flex-col gap-8 items-center">
          
          {/* GENERE SELECTOR */}
          <div className="flex gap-2 w-full">
            <button onClick={() => { setGenere('home'); resetAll(); }} className={`flex-1 py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all ${genere === 'home' ? themeBg + '/10 ' + themeText + ' border-emerald-400' : 'bg-transparent border-white/10 text-white/40'}`}>Home</button>
            <button onClick={() => { setGenere('dona'); resetAll(); }} className={`flex-1 py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all ${genere === 'dona' ? themeBg + '/10 ' + themeText + ' border-orange-500' : 'bg-transparent border-white/10 text-white/40'}`}>Dona</button>
          </div>

          {/* CONTINGUT DINÀMIC DEL TEST */}
          <div className="flex flex-col items-center w-full">
            {pas === 'start' && (
              <div className="flex flex-col items-center gap-8 w-full animate-in fade-in duration-500">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  {/* CERCLE DE PROGRÉS VISUAL */}
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="128" cy="128" r="115" className="stroke-white/5 fill-none" strokeWidth="10" />
                    {isCountingDown && (
                      <circle 
                        cx="128" 
                        cy="128" 
                        r="115" 
                        className="stroke-yellow-400 fill-none transition-all duration-1000" 
                        strokeWidth="10" 
                        strokeDasharray="722" 
                        strokeDashoffset={722 - (722 * (preCountdown / 5))} 
                        strokeLinecap="round" 
                      />
                    )}
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    {isCountingDown ? (
                      <span className="text-8xl font-black italic text-yellow-400">{preCountdown}</span>
                    ) : (
                      <Activity size={80} className="text-white/10" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                      {isCountingDown ? 'Preparat...' : 'Course Navette'}
                    </span>
                  </div>
                </div>
                
                {/* BOTÓ D'INICI */}
                <button 
                  onClick={async () => { 
                    await desbloquejarAudioiOS();
                    setIsCountingDown(true); 
                    playPip('soft'); 
                  }} 
                  className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-3 font-black uppercase italic tracking-widest transition-all shadow-xl active:scale-95 ${isCountingDown ? 'bg-red-500 text-white' : themeBg + ' text-[#00274d]'}`}
                >
                  {isCountingDown ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  {isCountingDown ? 'Cancel·lar' : 'Començar Test'}
                </button>
              </div>
            )}

            {pas === 'running' && (
              <div className="flex flex-col items-center gap-10 w-full animate-in zoom-in-95 duration-300">
                
                {/* INDICADOR DE NIVELL I ESTAT */}
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white/30">Nivell</span>
                    <span className="text-6xl font-black italic text-white leading-none">{NAVETTE_DATA[currentLevelIdx].level}</span>
                    <span className="text-xl font-black italic text-white/20">/ {genere === 'home' ? '12.5' : '10'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-yellow-400 text-[#00274d] text-[10px] font-black uppercase tracking-widest">
                      Segment {currentShuttle}
                    </div>
                  </div>
                </div>

                {/* BARRES DE PROGRÉS (GROGUES) */}
                <div className="w-full flex flex-col gap-6 px-4">
                  
                  {/* SEGÜENT LLARG */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400 italic">Següent llarg</span>
                      <span className="text-[10px] font-black tabular-nums text-yellow-400">{shuttleTimeLeft.toFixed(1)}s</span>
                    </div>
                    <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        className="h-full bg-yellow-400"
                        initial={false}
                        animate={{ width: `${(shuttleTimeLeft / NAVETTE_DATA[currentLevelIdx].interval) * 100}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    </div>
                  </div>

                  {/* SEGÜENT MIGRACIÓ DE NIVELL */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400/60 italic">Següent nivell</span>
                      <span className="text-[10px] font-black text-white/60 uppercase">{(NAVETTE_DATA[currentLevelIdx].shuttles - currentShuttle)} llargs restants</span>
                    </div>
                    <div className="w-full h-2 bg-yellow-400/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-yellow-400/30"
                        initial={false}
                        animate={{ 
                          width: `${(( (NAVETTE_DATA[currentLevelIdx].shuttles - currentShuttle) * NAVETTE_DATA[currentLevelIdx].interval + shuttleTimeLeft ) / (NAVETTE_DATA[currentLevelIdx].shuttles * NAVETTE_DATA[currentLevelIdx].interval)) * 100}%` 
                        }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    </div>
                  </div>

                </div>

                <div className="flex flex-col items-center gap-1">
                   <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest italic">Velocitat: {NAVETTE_DATA[currentLevelIdx].speed} km/h</p>
                </div>

                <button onClick={finalitzar} className="w-full py-6 rounded-[2rem] bg-red-500 text-white flex items-center justify-center gap-3 font-black uppercase italic tracking-widest transition-all shadow-xl active:scale-95">
                  <Square size={20} fill="currentColor" /> Aturar (Em planto)
                </button>
              </div>
            )}

            {pas === 'result' && (
              <div className="flex flex-col items-center gap-8 w-full animate-in zoom-in-95 duration-500">
                <div className="w-64 h-64 rounded-full border-4 border-dashed border-white/10 flex flex-col items-center justify-center">
                   <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${themeText} mb-2`}>Nota oficial</span>
                   <div className="text-8xl font-black italic text-white flex items-baseline">
                     {nota} <span className={`text-xl ${themeText} opacity-40 ml-2`}>/10</span>
                   </div>
                </div>
                <div className="text-center">
                  <p className="text-white/60 font-bold italic">Has arribat al <span className={themeText}>Nivell {finalLevel} (Sèrie {finalShuttle})</span></p>
                  <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter mt-2 leading-relaxed">Equivaleix a un paràmetre CL de {(finalLevel + finalShuttle/finalTotalShuttles).toFixed(1)}</p>
                </div>
                <button onClick={resetAll} className="w-full py-6 rounded-[2rem] border border-white/10 flex items-center justify-center gap-3 font-black uppercase italic tracking-widest text-white/50 hover:text-white active:scale-95 transition-all">
                  <RotateCcw size={20} /> Reiniciar Test
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="flex flex-col gap-4">
           {/* TAULES OFICIALS CURSE NAVETTE */}
           <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <button onClick={() => setGenere('home')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider transition-colors ${genere === 'home' ? 'bg-emerald-400 text-[#00274d]' : 'text-white/40'}`}>Homes</button>
              <button onClick={() => setGenere('dona')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider transition-colors ${genere === 'dona' ? 'bg-orange-500 text-white' : 'text-white/40'}`}>Dones</button>
           </div>
           <div className={`bg-white/5 rounded-2xl border ${genere === 'home' ? 'border-emerald-400/20' : 'border-orange-500/20'} overflow-hidden shadow-2xl`}>
              <div className={`grid grid-cols-2 bg-white/10 p-4 text-[10px] font-black uppercase tracking-widest ${themeText} italic`}>
                <span>Punts (P)</span>
                <span className="text-right text-white">Nivell (CL)</span>
              </div>
              {(genere === 'home' ? SCORE_HOMES : SCORE_DONES).map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 p-4 border-t border-white/5 text-xs font-bold items-center">
                  <span className={`${themeText} font-black`}>{item.punts} punts</span>
                  <span className="text-right text-white italic">{idx === 0 ? `> ${item.val - 0.5}` : item.val}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 p-4 border-t border-white/5 text-xs font-bold items-center bg-red-500/10">
                <span className="text-red-500 font-black">0 punts</span>
                <span className="text-right text-white italic">{genere === 'home' ? '< 6.5' : '< 3.5'}</span>
              </div>
           </div>
        </div>
      )}

      <button onClick={onTancar} className="text-white/20 hover:text-white text-[10px] font-black uppercase tracking-widest mt-4 underline underline-offset-4">Tornar enrere</button>
    </div>
  );
}
