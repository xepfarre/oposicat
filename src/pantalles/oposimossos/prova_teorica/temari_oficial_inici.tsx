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
          <h1 className="text-xl font-black italic uppercase text-white tracking-widest leading-tight" id="temari-oficial-titol">
            Temari <span className="text-amber-400">Oficial</span>
          </h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest italic">Convocatòria 2025-2026</p>
        </div>
      </header>

      <main className="w-full max-w-sm md:max-w-6xl flex flex-col gap-6" id="temari-oficial-main">
        
        {/* Label: Text informatiu corregit i ara groc */}
        <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-5 shadow-xl md:py-6">
          <p className="text-amber-400/90 text-xs md:text-lg font-medium leading-relaxed text-center italic">
            "Et presentem el temari oficial de l'oposició de Mossos d'Esquadra de l'any 2025-2026 prequè en facis ús en qualsevol lloc."
          </p>
        </div>

        {/* Llistat d'Àmbits */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
          
          {/* Àmbit A */}
          <motion.button 
            onClick={onAmbitA}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-3xl p-5 flex flex-col gap-4 transition-all text-left group"
            id="ambit-a-btn"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-900/50 group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <span className="text-white/60 font-black italic uppercase text-[10px] tracking-widest block mb-0.5">Àmbit A</span>
                <h3 className="text-white font-bold text-base leading-tight uppercase">
                  Coneixements de l'entorn
                </h3>
              </div>
            </div>

            {/* Milestones Àmbit A */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Llegit:</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {progres.A.map((llegit, i) => (
                      <span 
                        key={i} 
                        className={`text-xs font-black transition-all ${
                          llegit 
                          ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' 
                          : 'text-white/10'
                        }`}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  <span className="text-white font-black text-sm italic ml-2">
                    {Math.round((progres.A.filter(Boolean).length / progres.A.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.button>

          {/* Àmbit B */}
          <motion.button 
            onClick={onAmbitB}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 rounded-3xl p-5 flex flex-col gap-4 transition-all text-left group"
            id="ambit-b-btn"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-amber-500 rounded-xl shadow-lg shadow-amber-900/50 group-hover:scale-110 transition-transform">
                <Landmark className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <span className="text-white/60 font-black italic uppercase text-[10px] tracking-widest block mb-0.5">Àmbit B</span>
                <h3 className="text-white font-bold text-base leading-tight uppercase">
                  Àmbit institucional
                </h3>
              </div>
            </div>

            {/* Milestones Àmbit B */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Llegit:</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {progres.B.map((llegit, i) => (
                      <span 
                        key={i} 
                        className={`text-xs font-black transition-all ${
                          llegit 
                          ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' 
                          : 'text-white/10'
                        }`}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  <span className="text-white font-black text-sm italic ml-2">
                    {Math.round((progres.B.filter(Boolean).length / progres.B.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.button>

          {/* Àmbit C */}
          <motion.button 
            onClick={onAmbitC}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 rounded-3xl p-5 flex flex-col gap-4 transition-all text-left group"
            id="ambit-c-btn"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/50 group-hover:scale-110 transition-transform">
                <Shield className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <span className="text-white/60 font-black italic uppercase text-[10px] tracking-widest block mb-0.5">Àmbit C</span>
                <h3 className="text-white font-bold text-base leading-tight uppercase">
                  Àmbit de seguretat i policia
                </h3>
              </div>
            </div>

            {/* Milestones Àmbit C */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Llegit:</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {progres.C.map((llegit, i) => (
                      <span 
                        key={i} 
                        className={`text-xs font-black transition-all ${
                          llegit 
                          ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' 
                          : 'text-white/10'
                        }`}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  <span className="text-white font-black text-sm italic ml-2">
                    {Math.round((progres.C.filter(Boolean).length / progres.C.length) * 100)}%
                  </span>
                </div>
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
