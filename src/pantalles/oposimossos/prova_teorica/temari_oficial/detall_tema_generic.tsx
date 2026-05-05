import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, BookOpen } from 'lucide-react';

/**
 * Component genèric per mostrar el detall de qualsevol tema.
 * Segueix l'estètica de l'aplicació i l'arquitectura de Lego.
 */
interface DetallTemaProps {
  titol: string;
  ambit: string;
  subtemes: string[];
  progres: boolean[];
  onTornar: () => void;
  onToggle: (index: number) => void;
  onSubtemaClick?: (index: number) => void;
}

export default function DetallTemaGeneric({ 
  titol, 
  ambit, 
  subtemes, 
  progres, 
  onTornar, 
  onToggle,
  onSubtemaClick
}: DetallTemaProps) {
  
  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-12 px-6 bg-[#00274d] overflow-y-auto">
      {/* CAPÇALERA DE TEMA */}
      <header className="pt-10 w-full max-w-sm md:max-w-2xl flex items-center gap-4 mb-8">
        <button 
          onClick={onTornar}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/30">
              Àmbit {ambit}
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-black italic uppercase text-white tracking-widest leading-tight">
            {titol}
          </h1>
        </div>
      </header>

      <main className="w-full max-w-sm md:max-w-2xl">
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-2 shadow-2xl">
          {/* Capçalera de secció */}
          <div className="flex px-5 py-4 border-b border-white/5 items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Contingut del tema</h2>
              <p className="text-xs text-white/60">Marca els punts a mesura que els llegeixis</p>
            </div>
          </div>

          <ul className="flex flex-col gap-0.5 mt-2">
            {subtemes.map((tema, i) => (
              <motion.li 
                key={i} 
                onClick={() => onSubtemaClick ? onSubtemaClick(i) : onToggle(i)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="flex gap-4 p-4 rounded-2xl cursor-pointer transition-all group"
              >
                {/* Indicador de número */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm transition-colors flex-shrink-0 ${
                  progres[i] ? 'bg-emerald-500 text-white' : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                }`}>
                  {i + 1}
                </div>

                {/* Text descriptiu */}
                <div className="flex-1 flex flex-col justify-center">
                  <span className={`text-sm md:text-base font-medium transition-all ${
                    progres[i] ? 'text-white' : 'text-white/80 group-hover:text-white'
                  }`}>
                    {tema}
                  </span>
                  {/* Petit indicador d'acció */}
                  <span className="text-[8px] uppercase tracking-widest text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    Clica per llegir el contingut
                  </span>
                </div>

                {/* Checkbox Verd */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(i);
                  }}
                  className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center self-center flex-shrink-0 ${
                    progres[i] 
                    ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                    : 'bg-white/5 border-white/10 group-hover:border-blue-400/50'
                  }`}
                >
                  {progres[i] && <Check size={14} className="text-white stroke-[4]" />}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Info adicional */}
        <div className="mt-6 p-5 bg-white/5 rounded-2xl border border-white/5 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] italic">
            "Recorda que pots tornar a revisar qualsevol punt clicant sobre ell de nou."
          </p>
        </div>
      </main>

      <footer className="mt-12 text-center text-white/10">
        <p className="text-[9px] font-black uppercase tracking-[0.3em]">Temari Oficial • OposiCAT 2025</p>
      </footer>
    </div>
  );
}
