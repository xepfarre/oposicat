import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Target, Calendar } from 'lucide-react';

/**
 * Pantalla que mostra el progrés detallat del temari.
 * Hem simplificat el disseny per centrar l'atenció en els mòduls completats.
 */
export default function LaMevaOposicio({ onTornar }: { onTornar: () => void }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-12 px-6 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA AMB BOTÓ TORNAR */}
      <header className="pt-10 w-full max-w-2xl flex items-center gap-4 mb-8">
        <button 
          onClick={onTornar}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black italic uppercase text-white tracking-widest">
            El meu <span className="text-amber-400 text-2xl">Progrés</span>
          </h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest">Estat de la preparació del temari</p>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-8">
        
        {/* BLOC 1: PROGRÉS DEL TEMARI */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <BookOpen className="text-blue-400" size={24} />
              </div>
              <div>
                <span className="text-white font-black italic uppercase text-sm tracking-wider block">Temari Oficial</span>
                <span className="text-white/40 text-[10px] uppercase tracking-tighter">Àmbits A, B i C</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-black text-2xl italic">70%</span>
            </div>
          </div>
          
          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/10 mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 mb-6">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-white/40 px-2">
              <span>Àmbit A: 22/25</span>
              <span>Àmbit B: 14/20</span>
              <span>Àmbit C: 08/15</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 group">
              <span className="group-hover:text-white transition-colors text-center block">Més informació</span>
            </button>
            <button className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 group">
              <span className="group-hover:text-emerald-300 transition-colors text-center block">Ajuda'm a millorar</span>
            </button>
          </div>
        </motion.div>

        {/* BLOC 2: PROCÉS FÍSIC */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                <Target className="text-red-400" size={24} />
              </div>
              <div>
                <span className="text-white font-black italic uppercase text-sm tracking-wider block">Procés Físic</span>
                <span className="text-white/40 text-[10px] uppercase tracking-tighter">Circuit, Navette, Banca</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-blue-400 font-black text-2xl italic">66%</span>
            </div>
          </div>
          
          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/10 mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '66%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-red-500 to-blue-500 h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            />
          </div>

          <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 group">
            <span className="group-hover:text-white transition-colors">Més informació</span>
          </button>
        </motion.div>

        {/* BLOC 3: PROCÉS PSICOTÈCNIC */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                <Calendar className="text-amber-400" size={24} />
              </div>
              <div>
                <span className="text-white font-black italic uppercase text-sm tracking-wider block">Procés Psicotècnic</span>
                <span className="text-white/40 text-[10px] uppercase tracking-tighter">Raoament i Personalitat</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-amber-500 font-black text-2xl italic">40%</span>
            </div>
          </div>
          
          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/10 mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-amber-500 to-amber-700 h-full rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            />
          </div>

          <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 group">
            <span className="group-hover:text-white transition-colors">Més informació</span>
          </button>
        </motion.div>

      </main>

      {/* PEU DE PÀGINA */}
      <footer className="mt-12 text-center text-white/10 uppercase italic font-bold">
        <p className="text-[9px] tracking-[0.2em]">OposiCatalunya Track • ISPC 2025</p>
      </footer>
    </div>
  );
}
