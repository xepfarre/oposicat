import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ArrowRight, Check } from 'lucide-react';

export default function AmbitA({ 
  onTornar, 
  temes, 
  progres, 
  progresDetallat,
  onSeleccionarTema,
  onToggle 
}: { 
  onTornar: () => void,
  temes: string[],
  progres: boolean[],
  progresDetallat: boolean[][],
  onSeleccionarTema: (index: number) => void,
  onToggle: (index: number, e: React.MouseEvent) => void
}) {
  const [scrolled, setScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detectem l'scroll del contenidor per a l'efecte de la capçalera
  const handleContainerScroll = () => {
    if (scrollContainerRef.current) {
      setScrolled(scrollContainerRef.current.scrollTop > 40);
    }
  };

  const handleToggle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(index, e);
  };

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleContainerScroll}
      className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-20 px-6" 
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* CAPÇALERA DINÀMICA I FIXA */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 ${
          scrolled 
          ? 'bg-[#00274d]/90 backdrop-blur-md h-20 border-b border-white/10 shadow-2xl' 
          : 'bg-transparent h-32'
        }`}
        style={{ 
          paddingTop: "env(safe-area-inset-top)" 
        }}
      >
        <div className="w-full md:max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={onTornar}
            className={`p-3 rounded-full border border-white/10 text-white active:scale-90 ${
              scrolled ? 'bg-white/5 scale-90' : 'bg-white/5'
            }`}
          >
            <ChevronLeft size={scrolled ? 18 : 20} />
          </button>
          <div className="flex-1">
            <span className={`text-blue-400 font-black italic uppercase tracking-widest block ${
              scrolled ? 'text-[8px]' : 'text-[10px] md:text-sm mb-1'
            }`}>
              Àmbit A
            </span>
            <h1 className={`font-black italic uppercase text-white tracking-widest leading-tight ${
              scrolled ? 'text-lg' : 'text-xl md:text-3xl'
            }`}>
              Entorn <span className="text-white/60">Sociopolític</span>
            </h1>
          </div>
        </div>
      </header>

      <main 
        className="w-full md:max-w-6xl"
        style={{ 
          paddingTop: scrolled 
            ? "calc(90px + env(safe-area-inset-top))" 
            : "calc(120px + env(safe-area-inset-top))" 
        }}
      >
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex px-4 py-3 border-b border-white/5 items-center">
            <div className="w-8 mr-4 md:hidden"></div>
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/30 md:text-center">Pla d'Estudi / Capítols</span>
            <span className="w-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-center md:hidden">Estudiat</span>
          </div>

          <ul className="flex flex-col md:grid md:grid-cols-2 mt-1">
            {temes.map((tema, i) => (
              <React.Fragment key={i}>
                <motion.li 
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => onSeleccionarTema(i)}
                  className="group flex px-4 py-5 cursor-pointer transition-all border-b border-white/5 last:border-0 md:border-r"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm mr-4 transition-colors ${
                    progres[i] ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/20 group-hover:bg-blue-500/20 group-hover:text-blue-400'
                  }`}>
                    {i + 1}
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-1">
                    <span className={`text-sm font-bold leading-tight transition-colors ${
                      progres[i] ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`}>
                      {tema}
                    </span>

                    {/* Milestone Detallat (LLEGIT: 1 2 3...) */}
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Llegit:</span>
                      <div className="flex gap-1.5 focus:outline-none">
                        {progresDetallat[i] && progresDetallat[i].map((estudiat, idx) => (
                          <span 
                            key={idx} 
                            className={`text-[9px] font-black transition-all ${
                              estudiat 
                              ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' 
                              : 'text-white/10'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-white/10 self-center mx-1" />

                  <div className="flex flex-col items-center gap-1 self-center">
                    <div 
                      onClick={(e) => handleToggle(i, e)}
                      className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
                        progres[i] 
                        ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                        : 'bg-white/5 border-white/10 group-hover:border-blue-400/50'
                      }`}
                    >
                      {progres[i] && <Check size={14} className="text-white stroke-[4]" />}
                    </div>
                  </div>
                </motion.li>
                
                {progres[i] && (
                  <div className="bg-blue-500/5 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-blue-400/80 tracking-widest">Tema completat amb èxit</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </main>

      <footer className="mt-12 text-center text-white/20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">OposiCatalunya • Ambit A • Resums</p>
      </footer>
    </div>
  );
}
