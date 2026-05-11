import { ChevronLeft, Apple, UtensilsCrossed, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import DietaPremiumQuiz from "./dieta_premium_quiz";

/**
 * PANTALLA: Dieta
 * Secció de nutrició per a opositors.
 */
export default function Dieta({ onTornar }: { onTornar: () => void }) {
  // Estat per gestionar si veiem el menú o el qüestionari
  const [seccio, setSeccio] = useState<'menu' | 'premium_quiz'>('menu');

  if (seccio === 'premium_quiz') {
    return <DietaPremiumQuiz onTornar={() => setSeccio('menu')} />;
  }

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* CAPÇALERA INTEGRADA AMB BOTÓ TORNAR */}
      <header className="pt-8 w-full flex items-center justify-center gap-4 pb-10 md:max-w-4xl md:mx-auto relative">
        <button 
          onClick={onTornar}
          className="absolute left-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90 border border-white/10 shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="bg-white/5 px-8 py-3 rounded-xl border border-white/10 shadow-lg">
          <h1 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase text-white">
            <span className="text-emerald-400">Dieta</span>
          </h1>
        </div>
      </header>

      {/* CONTINGUT PRINCIPAL */}
      <main className="w-full max-w-md md:max-w-xl flex flex-col gap-10">
        
        {/* EXPLICACIÓ INICIAL COMPACTA */}
        <div className="flex flex-col gap-4 px-4">
          <div className="flex items-center gap-3">
            <Apple size={18} className="text-emerald-400" />
            <h2 className="text-sm md:text-xl font-black italic uppercase tracking-tight text-white/80">
              Nutrició i Rendiment
            </h2>
          </div>
          
          <p className="text-xs md:text-base text-white/40 leading-relaxed italic">
            Per tal de millorar al màxim la nostra musculatura i rendiment físic, la dieta és clau. T'ajudem de dues formes:{" "}
            <span className="text-blue-400/80 font-bold uppercase">genèrica</span> o{" "}
            <span className="text-yellow-400/80 font-bold uppercase">personalitzada</span>.
          </p>
        </div>

        {/* SECCIÓ DE BOTONS SLIM */}
        <div className="flex flex-col gap-6">
          
          {/* OPCIÓ 1: GENÈRICA */}
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 px-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/15 italic">
               Ajuda dietistes (estàndard)
             </div>
             <motion.button 
               whileTap={{ scale: 0.98 }}
               className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-6 md:p-8 flex items-center justify-between group transition-all"
             >
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-[#00274d] transition-all">
                   <UtensilsCrossed size={20} className="md:size-8" />
                 </div>
                 <span className="text-lg md:text-3xl font-black italic uppercase tracking-tighter text-white">
                   Dieta Genèrica
                 </span>
               </div>
               <ChevronLeft className="rotate-180 text-white/10 group-hover:text-white/40 transition-colors" size={16} />
             </motion.button>
          </div>

          {/* OPCIÓ 2: PREMIUM / PERSONALITZADA */}
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 px-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-yellow-400/15 italic">
               Ajuda nutricionistes (Premium)
             </div>
             <motion.button 
               onClick={() => setSeccio('premium_quiz')}
               whileTap={{ scale: 0.98 }}
               className="w-full bg-yellow-400/5 hover:bg-yellow-400/10 border border-yellow-400/10 rounded-2xl p-6 md:p-8 flex items-center justify-between group transition-all"
             >
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-yellow-400 flex items-center justify-center text-[#00274d] group-hover:scale-105 transition-transform">
                   <Sparkles size={20} className="md:size-8" />
                 </div>
                 <span className="text-lg md:text-3xl font-black italic uppercase tracking-tighter text-yellow-400">
                   Dieta Premium
                 </span>
               </div>
               <ChevronLeft className="rotate-180 text-yellow-400/20 group-hover:text-yellow-400/50 transition-colors" size={16} />
             </motion.button>
          </div>

        </div>

      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-4 pt-12">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 group transition-all"
        >
          <ChevronLeft size={20} className="text-white/30 group-hover:text-white transition-colors" />
          <span className="text-white/40 group-hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
            Tornar al Menú Física
          </span>
        </button>
        <p className="text-[8px] font-black uppercase tracking-wider text-white/20 select-none whitespace-nowrap mt-2">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

    </div>
  );
}
