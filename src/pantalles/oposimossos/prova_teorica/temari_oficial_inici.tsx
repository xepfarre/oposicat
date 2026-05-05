import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Shield, Landmark } from 'lucide-react';

/**
 * Pantalla del Temari Oficial de Mossos d'Esquadra 2025-2026.
 * Seguint l'arquitectura de "Lego", aquest component és independent.
 */
export default function TemariOficialInici({ 
  onTornar, 
  onAmbitA,
  onAmbitB,
  onAmbitC,
  progres
}: { 
  onTornar: () => void,
  onAmbitA: () => void,
  onAmbitB: () => void,
  onAmbitC: () => void,
  progres: { A: boolean[], B: boolean[], C: boolean[] }
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-12 px-6 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA */}
      <header className="pt-10 w-full max-w-sm md:max-w-2xl flex items-center gap-4 mb-8">
        <button 
          onClick={onTornar}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black italic uppercase text-white tracking-widest leading-tight">
            Temari <span className="text-amber-400">Oficial</span>
          </h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest italic">Convocatòria 2025-2026</p>
        </div>
      </header>

      <main className="w-full max-w-sm md:max-w-2xl flex flex-col gap-6">
        
        {/* Label: Text informatiu corregit i ara groc */}
        <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-5 shadow-xl">
          <p className="text-amber-400/90 text-xs md:text-sm font-medium leading-relaxed text-center italic">
            "Et presentem el temari oficial de l'oposició de Mossos d'Esquadra de l'any 2025-2026 prequè en facis ús en qualsevol lloc."
          </p>
        </div>

        {/* Llistat d'Àmbits */}
        <div className="flex flex-col gap-6">
          
          {/* Àmbit A */}
          <motion.button 
            onClick={onAmbitA}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-3xl p-4 flex flex-col gap-3 transition-all text-left group"
          >
            <div className="flex items-center gap-5">
              <div className="p-2.5 bg-blue-500 rounded-xl shadow-lg shadow-blue-900/50 group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <span className="text-white font-black italic uppercase text-[10px] tracking-widest block mb-0.5">Àmbit A</span>
                <h3 className="text-white font-bold text-sm md:text-base leading-tight uppercase">
                  Coneixements de l'entorn
                </h3>
              </div>
            </div>

            {/* Milestones Àmbit A - Integrats */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-white tracking-[0.2em] opacity-80">Llegit:</span>
                <div className="flex gap-3">
                  {progres.A.map((llegit, i) => (
                    <div 
                      key={i} 
                      className={`text-sm font-black transition-all ${
                        llegit 
                        ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] scale-125' 
                        : 'text-white/10 group-hover:text-white/20'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              {/* Percentatge Progrés A */}
              <div className="text-white font-black italic text-sm tracking-tighter pr-1 opacity-90 group-hover:opacity-100 transition-opacity">
                {Math.round((progres.A.filter(Boolean).length / progres.A.length) * 100)}%
              </div>
            </div>
          </motion.button>

          {/* Àmbit B */}
          <motion.button 
            onClick={onAmbitB}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 rounded-3xl p-4 flex flex-col gap-3 transition-all text-left group"
          >
            <div className="flex items-center gap-5">
              <div className="p-2.5 bg-amber-500 rounded-xl shadow-lg shadow-amber-900/50 group-hover:scale-110 transition-transform">
                <Landmark className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <span className="text-white font-black italic uppercase text-[10px] tracking-widest block mb-0.5">Àmbit B</span>
                <h3 className="text-white font-bold text-sm md:text-base leading-tight uppercase">
                  Àmbit institucional
                </h3>
              </div>
            </div>

            {/* Milestones Àmbit B - Integrats */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-white tracking-[0.2em] opacity-80">Llegit:</span>
                <div className="flex gap-3">
                  {progres.B.map((llegit, i) => (
                    <div 
                      key={i} 
                      className={`text-sm font-black transition-all ${
                        llegit 
                        ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] scale-125' 
                        : 'text-white/10 group-hover:text-white/20'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              {/* Percentatge Progrés B */}
              <div className="text-white font-black italic text-sm tracking-tighter pr-1 opacity-90 group-hover:opacity-100 transition-opacity">
                {Math.round((progres.B.filter(Boolean).length / progres.B.length) * 100)}%
              </div>
            </div>
          </motion.button>

          {/* Àmbit C */}
          <motion.button 
            onClick={onAmbitC}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-3xl p-4 flex flex-col gap-3 transition-all text-left group"
          >
            <div className="flex items-center gap-5">
              <div className="p-2.5 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/50 group-hover:scale-110 transition-transform">
                <Shield className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <span className="text-white font-black italic uppercase text-[10px] tracking-widest block mb-0.5">Àmbit C</span>
                <h3 className="text-white font-bold text-sm md:text-base leading-tight uppercase">
                  Àmbit de seguretat i policia
                </h3>
              </div>
            </div>

            {/* Milestones Àmbit C - Integrats */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-white tracking-[0.2em] opacity-80">Llegit:</span>
                <div className="flex gap-3">
                  {progres.C.map((llegit, i) => (
                    <div 
                      key={i} 
                      className={`text-sm font-black transition-all ${
                        llegit 
                        ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] scale-125' 
                        : 'text-white/10 group-hover:text-white/20'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              {/* Percentatge Progrés C */}
              <div className="text-white font-black italic text-sm tracking-tighter pr-1 opacity-90 group-hover:opacity-100 transition-opacity">
                {Math.round((progres.C.filter(Boolean).length / progres.C.length) * 100)}%
              </div>
            </div>
          </motion.button>

        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="mt-12 text-center text-white/20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">OposiCatalunya • Temari Oficial</p>
      </footer>
    </div>
  );
}

