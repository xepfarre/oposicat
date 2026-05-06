import React from 'react';
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
  const handleToggle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(index, e);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-12 px-6 bg-[#00274d] overflow-y-auto">
      <header className="pt-10 w-full max-w-sm md:max-w-2xl flex items-center gap-4 mb-8">
        <button 
          onClick={onTornar}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <span className="text-emerald-400 font-black italic uppercase text-[10px] tracking-widest block mb-1">Àmbit A</span>
          <h1 className="text-xl font-black italic uppercase text-white tracking-widest leading-tight">
            Entorn <span className="text-white/60">Sociopolític</span>
          </h1>
        </div>
      </header>

      <main className="w-full max-w-sm md:max-w-2xl flex flex-col gap-4">
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex px-4 py-3 border-b border-white/5 items-center">
            <div className="w-8 mr-4"></div>
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/30">Pla d'Estudi / Capítols</span>
            <span className="w-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Estudiat</span>
          </div>

          <ul className="flex flex-col mt-1">
            {temes.map((tema, i) => (
              <React.Fragment key={i}>
                <motion.li 
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  onClick={() => onSeleccionarTema(i)}
                  className="group flex px-4 py-5 cursor-pointer transition-all border-b border-white/5 last:border-0"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm mr-4 transition-colors ${
                    progres[i] ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-400'
                  }`}>
                    {i + 1}
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-1">
                    <span className={`text-sm font-bold leading-tight transition-colors ${
                      progres[i] ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`}>
                      {tema}
                    </span>

                    {/* Milestone Detallat (ESTUDIAT: 1 2 3...) */}
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Estudiat:</span>
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
                        ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                        : 'bg-white/5 border-white/10 group-hover:border-emerald-400/50'
                      }`}
                    >
                      {progres[i] && <Check size={14} className="text-white stroke-[4]" />}
                    </div>
                  </div>
                </motion.li>
                
                {progres[i] && (
                  <div className="bg-emerald-500/5 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-emerald-400/80 tracking-widest">Tema completat amb èxit</span>
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
