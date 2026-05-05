import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { TEMARI_DETALL } from '../../../../constants/temari';

/**
 * Component per a l'Àmbit C: Seguretat i policia.
 */
export default function TemariAmbitC({ 
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
  const temes = TEMARI_DETALL.C.map(t => t.titol);

  const handleToggle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(index);
  };

  const handleItemClick = (index: number) => {
    onTemaSeleccionat(index);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-12 px-6 bg-[#00274d] overflow-y-auto">
      <header className="pt-10 w-full max-w-sm md:max-w-2xl flex items-center gap-4 mb-8">
        <button 
          onClick={onTornar}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black italic uppercase text-white tracking-widest leading-tight">
            Àmbit <span className="text-emerald-400">C</span>
          </h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest italic">Seguretat i Policia</p>
        </div>
      </header>

      <main className="w-full max-w-sm md:max-w-2xl">
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-2 shadow-2xl">
          {/* Capçaleres de la llista */}
          <div className="flex px-4 py-3 border-b border-white/5 items-center">
            <div className="w-8 mr-4"></div> 
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/30">Tema</span>
            <span className="w-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Llegit</span>
          </div>

          <ul className="flex flex-col mt-1">
            {temes.map((tema, i) => (
              <React.Fragment key={i}>
                <motion.li 
                  onClick={() => handleItemClick(i)}
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="flex gap-4 p-5 rounded-2xl cursor-pointer transition-all group"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm transition-colors mt-0.5 ${
                    progres[i] ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {i + 1}
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    <span className={`text-sm md:text-base font-bold transition-colors ${
                      progres[i] ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}>
                      {tema}
                    </span>

                    {/* Milestone Detallat (si n'hi ha) */}
                    {progresDetallat[i] && (
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Llegit:</span>
                        <div className="flex gap-1.5">
                          {progresDetallat[i].map((llegit, idx) => (
                            <div 
                              key={idx} 
                              className={`text-[9px] font-black transition-all ${
                                llegit 
                                ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)] scale-110' 
                                : 'text-white/5'
                              }`}
                            >
                              {idx + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Separador vertical */}
                  <div className="w-px h-8 bg-white/10 self-center mx-1" />
                  
                  {/* Checkbox visual Àmbit C */}
                  <div 
                    onClick={(e) => handleToggle(i, e)}
                    className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center self-center ${
                    progres[i] 
                    ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                    : 'bg-white/5 border-white/10 group-hover:border-emerald-400/50'
                  }`}>
                    {progres[i] && <Check size={14} className="text-white stroke-[4]" />}
                  </div>
                </motion.li>

                {i < temes.length - 1 && (
                  <div className="mx-6 border-b border-white/5" />
                )}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </main>

      <footer className="mt-12 text-center text-white/10">
        <p className="text-[9px] font-black uppercase tracking-[0.3em]">Temari Oficial • Seguretat i Policia</p>
      </footer>
    </div>
  );
}
