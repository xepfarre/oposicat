import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Target, Calendar } from 'lucide-react';

/**
 * Pantalla que mostra el progrés detallat del temari.
 * Hem simplificat el disseny per centrar l'atenció en els mòduls completats.
 */
export default function LaMevaOposicio({ 
  onTornar,
  progresDetallat = { A: {}, B: {}, C: {} }
}: { 
  onTornar: () => void,
  progresDetallat: any
}) {
  // Càlcul ràpid de punts totals i estudiats
  const calcularPunts = (ambit: 'A' | 'B' | 'C') => {
    const dades = progresDetallat[ambit] || {};
    let estudiats = 0;
    let totals = 0;
    Object.values(dades).forEach((arr: any) => {
      estudiats += arr.filter(Boolean).length;
      totals += arr.length;
    });
    return { estudiats, totals };
  };

  const puntsA = calcularPunts('A');
  const puntsB = calcularPunts('B');
  const puntsC = calcularPunts('C');

  const estudiatsTotals = puntsA.estudiats + puntsB.estudiats + puntsC.estudiats;
  const totalsTotals = puntsA.totals + puntsB.totals + puntsC.totals || 1;
  const percentatgeGlobal = Math.round((estudiatsTotals / totalsTotals) * 100);

  return (
    <div className="fixed inset-0 h-full w-full flex flex-col items-center pb-20 px-6 bg-[#00274d] overflow-y-auto">
      
      <header className="pt-12 w-full max-w-xl flex items-center gap-5 mb-10 shrink-0">
        <button 
          onClick={onTornar}
          className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-4xl font-black italic uppercase text-white tracking-tighter leading-none">
            El meu <span className="text-yellow-400">Progrés</span>
          </h1>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] mt-1">Estat de la preparació del temari</p>
        </div>
      </header>

      <main className="w-full max-w-md flex flex-col gap-6">
        
        {/* BLOC 1: PROGRÉS DEL TEMARI */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#001a33]/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center">
                <BookOpen className="text-blue-400" size={28} />
              </div>
              <div>
                <span className="text-white font-black italic uppercase text-base tracking-tighter block">Temari Oficial</span>
                <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Àmbits A, B i C</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-black text-3xl italic tracking-tighter">{percentatgeGlobal}%</span>
            </div>
          </div>
          
          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentatgeGlobal}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            />
          </div>

          <div className="flex flex-col gap-3 mb-8">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Àmbit A:</span>
              <span className="text-xs font-black italic text-white uppercase"><span className="text-emerald-400">{puntsA.estudiats}</span>/{puntsA.totals} Punts</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Àmbit B:</span>
              <span className="text-xs font-black italic text-white uppercase"><span className="text-emerald-400">{puntsB.estudiats}</span>/{puntsB.totals} Punts</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Àmbit C:</span>
              <span className="text-xs font-black italic text-white uppercase"><span className="text-emerald-400">{puntsC.estudiats}</span>/{puntsC.totals} Punts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-center">
              Més informació
            </button>
            <button className="py-5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-center">
              Ajuda'm a millorar
            </button>
          </div>
        </motion.div>

        {/* BLOC 2: PROCÉS FÍSIC */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-[#001a33]/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center">
                <Target className="text-red-400" size={28} />
              </div>
              <div>
                <span className="text-white font-black italic uppercase text-base tracking-tighter block">Procés Físic</span>
                <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Circuit, Navette, Banca</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-blue-400 font-black text-3xl italic tracking-tighter">66%</span>
            </div>
          </div>
          
          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '66%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-red-500 to-blue-500 h-full rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            />
          </div>

          <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
            Més informació
          </button>
        </motion.div>

        {/* BLOC 3: PROCÉS PSICOTÈCNIC */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-[#001a33]/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center">
                <Calendar className="text-amber-400" size={28} />
              </div>
              <div>
                <span className="text-white font-black italic uppercase text-base tracking-tighter block">Procés Psicotècnic</span>
                <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Raoament i Personalitat</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-black text-3xl italic tracking-tighter">40%</span>
            </div>
          </div>
          
          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-amber-400 to-amber-700 h-full rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            />
          </div>

          <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
            Més informació
          </button>
        </motion.div>

      </main>

      <footer className="mt-12 opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">OposiMossos • Sistema de Progrés</p>
      </footer>
    </div>
  );
}
