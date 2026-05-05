import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';

/**
 * Component per al Tema 1 de l'Àmbit A: Història de Catalunya (part I).
 * Inclou la llista de sub-punts amb funcionalitat de seguiment (read check).
 */
export default function TemariAmbitATema1({ 
  onTornar, 
  progres, 
  onToggle 
}: { 
  onTornar: () => void,
  progres: boolean[],
  onToggle: (i: number) => void
}) {
  const subtemes = [
    "L'antiguitat a Catalunya",
    "La Catalunya romana",
    "El naixement de Catalunya",
    "La Catalunya feudal (s. XI-XII)",
    "L'expansió catalanoaragonesa (s. XIII-XIV)",
    "La crisi de la baixa edat mitjana (s. XIV i XV)",
    "Catalunya en la monarquia hispànica i la Guerra dels Segadors (s. XVI-XVII)",
    "La Guerra de Successió i l'Onze de Setembre",
    "Les transformacions del segle XVIII"
  ];

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
          <h1 className="text-lg font-black italic uppercase text-white tracking-widest leading-tight">
            Tema <span className="text-blue-400">1</span>
          </h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest italic">Història de Catalunya (part I)</p>
        </div>
      </header>

      <main className="w-full max-w-sm md:max-w-2xl">
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-2 shadow-2xl overflow-hidden">
          
          {/* Capçaleres de columnes */}
          <div className="flex px-4 py-3 border-b border-white/5 items-center">
            <div className="w-8 mr-4"></div>
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/30 text-left">Punt</span>
            <span className="w-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Llegit</span>
          </div>

          {/* Llista de sub-punts */}
          <ul className="flex flex-col gap-1 mt-1">
            {subtemes.map((tema, i) => (
              <motion.li 
                key={i} 
                onClick={() => onToggle(i)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                className="flex gap-4 p-4 rounded-2xl cursor-pointer transition-colors group"
              >
                {/* Indicador de número */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm transition-colors ${
                  progres[i] ? 'bg-emerald-500 text-white' : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                }`}>
                  {i + 1}
                </div>

                {/* Text descriptiu */}
                <span className={`flex-1 text-sm md:text-base font-medium transition-all self-center ${
                  progres[i] ? 'text-white' : 'text-white/80 group-hover:text-white'
                }`}>
                  {tema}
                </span>

                {/* Separador vertical */}
                <div className="w-px h-6 bg-white/10 self-center mx-1" />

                {/* Checkbox Verd */}
                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center self-center ${
                  progres[i] 
                  ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                  : 'bg-white/5 border-white/10 group-hover:border-blue-400/50'
                }`}>
                  {progres[i] && <Check size={14} className="text-white stroke-[4]" />}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="mt-12 text-center text-white/10 italic">
        <p className="text-[9px] font-black uppercase tracking-[0.3em]">OposiCatalunya • Formació Mossos</p>
      </footer>
    </div>
  );
}
