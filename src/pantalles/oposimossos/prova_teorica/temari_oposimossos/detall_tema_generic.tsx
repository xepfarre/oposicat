import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Check } from 'lucide-react';

/**
 * Pantalla Genèrica que llista els Subtemes o Capítols d'un Tema.
 * Adaptada per al Temari d'OposiMossos (Resums).
 */
export default function DetallTemaGeneric({ 
  onTornar, 
  ambitNom, 
  temaTitol, 
  subtemes, 
  progres,
  onSeleccionarSubtema,
  onToggle 
}: { 
  onTornar: () => void,
  ambitNom: string,
  temaTitol: string,
  subtemes: string[],
  progres: boolean[],
  onSeleccionarSubtema: (index: number) => void,
  onToggle: (index: number) => void
}) {
  return (
    <div className="fixed inset-0 w-full flex flex-col items-center pb-12 px-6 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA */}
      <header className="pt-10 w-full max-w-sm md:max-w-2xl flex items-center gap-4 mb-8">
        <button 
          onClick={onTornar}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <span className="text-emerald-400 font-black italic uppercase text-[10px] tracking-widest block mb-1">{ambitNom}</span>
          <h1 className="text-lg md:text-xl font-black italic uppercase text-white tracking-widest leading-tight">
            {temaTitol}
          </h1>
        </div>
      </header>

      <main className="w-full max-w-sm md:max-w-2xl">
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-2 shadow-2xl">
          {/* Capçalera de secció */}
          <div className="flex px-5 py-4 border-b border-white/5 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                <BookOpen size={16} />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Punts Clau</h2>
                <p className="text-xs text-white/60">Resums blindats per a l'estudi</p>
              </div>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              Estudiat
            </div>
          </div>

          <ul className="flex flex-col gap-0.5 mt-2 px-2 pb-2">
            {subtemes.map((tema, i) => (
              <motion.li 
                key={i} 
                onClick={() => onSeleccionarSubtema(i)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)', x: 4 }}
                className="flex gap-4 p-4 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-white/5 active:scale-[0.99]"
              >
                {/* Indicador de número / Punt */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm transition-colors flex-shrink-0 ${
                  progres[i] ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20'
                }`}>
                  {i + 1}
                </div>

                {/* Text descriptiu */}
                <div className="flex-1 flex flex-col justify-center">
                  <span className={`text-sm md:text-base font-bold transition-all leading-snug ${
                    progres[i] ? 'text-white' : 'text-white/80 group-hover:text-white'
                  }`}>
                    {tema}
                  </span>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] uppercase tracking-widest text-emerald-400/60 font-black">
                      Obrir Resum
                    </span>
                    <div className="h-px w-4 bg-emerald-400/20" />
                  </div>
                </div>

                {/* Checkbox "Estudiat" */}
                <div className="flex flex-col items-center gap-1 self-center">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(i);
                    }}
                    className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center flex-shrink-0 ${
                      progres[i] 
                      ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                      : 'bg-white/5 border-white/10 group-hover:border-emerald-400/50'
                    }`}
                  >
                    {progres[i] && <Check size={14} className="text-white stroke-[4]" />}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="mt-12 text-center text-white/10">
        <p className="text-[10px] font-black uppercase tracking-widest">Resums OposiMossos v1.0</p>
      </footer>

    </div>
  );
}
