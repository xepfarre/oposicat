import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';

import { TEMARI_DETALL } from '../../../../constants/temari';

/**
 * Component per a l'Àmbit B: Àmbit institucional.
 */
export default function TemariAmbitB({ 
  onTornar, 
  onTemaSeleccionat,
  progres, 
  progresDetallat = {},
  onToggle 
}: { 
  onTornar: () => void,
  onTemaSeleccionat: (index: number) => void,
  progres: boolean[],
  progresDetallat?: Record<number, boolean[]>,
  onToggle: (i: number) => void
}) {
  const [scrolled, setScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const temes = TEMARI_DETALL.B.map(t => t.titol);

  // Detectem l'scroll del contenidor per a l'efecte de la capçalera
  const handleContainerScroll = () => {
    if (scrollContainerRef.current) {
      setScrolled(scrollContainerRef.current.scrollTop > 40);
    }
  };

  const handleToggle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(index);
  };

  const handleItemClick = (index: number) => {
    onTemaSeleccionat(index);
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
            <ArrowLeft size={scrolled ? 18 : 20} />
          </button>
          <div className="flex-1">
            <h1 className={`font-black italic uppercase text-white tracking-widest leading-tight ${
              scrolled ? 'text-lg' : 'text-xl'
            }`}>
              Àmbit <span className="text-amber-400">B</span>
            </h1>
            <p className={`text-white/50 uppercase tracking-widest italic ${
              scrolled ? 'text-[8px]' : 'text-[10px]'
            }`}>
              Àmbit Institucional
            </p>
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
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-2 shadow-2xl">
          {/* Capçaleres de la llista */}
          <div className="hidden md:flex px-4 py-3 border-b border-white/5 items-center">
             <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Llistat de Temes oficials</span>
          </div>
          <div className="flex md:hidden px-4 py-3 border-b border-white/5 items-center">
            <div className="w-8 mr-4"></div> 
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/30">Tema</span>
            <span className="w-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Llegit</span>
          </div>

          <ul className="flex flex-col md:grid md:grid-cols-2 mt-1">
            {temes.map((tema, i) => (
              <React.Fragment key={i}>
                <motion.li 
                  onClick={() => handleItemClick(i)}
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="flex gap-4 p-5 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm transition-colors mt-0.5 ${
                    progres[i] ? 'bg-blue-600 text-white' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {i + 1}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center gap-1">
                    <span className={`text-sm md:text-base font-bold leading-tight transition-colors ${
                      progres[i] ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}>
                      {tema}
                    </span>

                    {/* Milestone Detallat (LLEGIT: 1 2 3...) */}
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Llegit:</span>
                      <div className="flex gap-1.5 focus:outline-none">
                        {progresDetallat[i] && progresDetallat[i].map((llegit, idx) => (
                          <span 
                            key={idx} 
                            className={`text-[9px] font-black transition-all ${
                              llegit 
                              ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' 
                              : 'text-white/5'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Separador vertical */}
                  <div className="w-px h-8 bg-white/10 self-center mx-1" />

                  {/* Checkbox "Llegit" */}
                  <div className="flex flex-col items-center gap-1 self-center">
                    <div 
                      onClick={(e) => handleToggle(i, e)}
                      className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
                      progres[i] 
                      ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                      : 'bg-white/5 border-white/10 group-hover:border-amber-400/50'
                    }`}>
                      {progres[i] && <Check size={14} className="text-white stroke-[4]" />}
                    </div>
                  </div>
                </motion.li>

                {i < temes.length - 1 && (
                  <div className="mx-6 border-b border-white/5 md:hidden" />
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </main>

      <footer className="mt-12 text-center text-white/10">
        <p className="text-[9px] font-black uppercase tracking-[0.3em]">Temari Oficial • Àmbit Institucional</p>
      </footer>
    </div>
  );
}
