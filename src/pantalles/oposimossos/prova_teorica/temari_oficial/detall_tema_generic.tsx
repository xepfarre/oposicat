import React, { useState, useRef } from 'react';
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
  const [scrolled, setScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detectem l'scroll del contenidor per a l'efecte de la capçalera
  const handleContainerScroll = () => {
    if (scrollContainerRef.current) {
      setScrolled(scrollContainerRef.current.scrollTop > 40);
    }
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
        <div className="w-full md:max-w-4xl mx-auto flex items-center gap-2 md:gap-4 px-2">
          <button 
            onClick={onTornar}
            className={`shrink-0 p-3 rounded-full border border-white/10 text-white active:scale-90 ${
              scrolled ? 'bg-white/5 scale-90' : 'bg-white/5'
            }`}
          >
            <ArrowLeft size={scrolled ? 18 : 20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 mb-0.5 ${scrolled ? 'hidden' : 'flex'}`}>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/30">
                Àmbit {ambit}
              </span>
            </div>
            <h1 className={`font-black italic uppercase text-white tracking-widest leading-[1.1] ${
              scrolled ? 'text-[9px] md:text-xs line-clamp-2' : 'text-lg md:text-2xl'
            }`}>
              {scrolled && <span className="text-blue-400 mr-1">À-{ambit}:</span>}
              {titol}
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
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-2 shadow-2xl">
          {/* Capçalera de secció */}
          <div className="flex px-5 py-4 border-b border-white/5 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <BookOpen size={16} />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Contingut del tema</h2>
                <p className="text-xs text-white/60">Marca els punts a mesura que els llegeixis</p>
              </div>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
              Llegit
            </div>
          </div>

          <ul className="flex flex-col md:grid md:grid-cols-2 gap-0.5 mt-2 px-2 pb-2">
            {subtemes.map((tema, i) => (
              <motion.li 
                key={i} 
                onClick={() => onSubtemaClick ? onSubtemaClick(i) : onToggle(i)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)', x: 4 }}
                className="flex gap-4 p-4 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-white/5 active:scale-[0.99]"
              >
                {/* Indicador de número / Punt */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm transition-colors flex-shrink-0 ${
                  progres[i] ? 'bg-emerald-500 text-white' : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                }`}>
                  {i + 1}
                </div>

                {/* Text descriptiu (Títol del Punt) */}
                <div className="flex-1 flex flex-col justify-center">
                  <span className={`text-sm md:text-base font-bold transition-all leading-snug ${
                    progres[i] ? 'text-white' : 'text-white/80 group-hover:text-white'
                  }`}>
                    {tema}
                  </span>
                  {/* Petit indicador d'acció */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] uppercase tracking-widest text-blue-400/60 font-black">
                      Llegir Resum
                    </span>
                    <div className="h-px w-4 bg-blue-400/20" />
                  </div>
                </div>

                {/* Checkbox "Llegit" */}
                <div className="flex flex-col items-center gap-1 self-center">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(i);
                    }}
                    className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center flex-shrink-0 ${
                      progres[i] 
                      ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' 
                      : 'bg-white/5 border-white/10 group-hover:border-blue-400/50'
                    }`}
                  >
                    {progres[i] && <Check size={14} className="text-white stroke-[4]" />}
                  </div>
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
