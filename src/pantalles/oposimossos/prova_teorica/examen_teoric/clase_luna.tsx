import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ClaseLuna
 * Una classe buida però amb el label "HOLA SOC EL LUNA".
 */
export default function ClaseLuna({ onTornar }: { onTornar: () => void }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-10 bg-[#00274d]">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/30 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center gap-8 text-center"
      >
        <div className="bg-amber-400 text-black px-8 py-3 rounded-2xl font-black italic text-xl uppercase tracking-widest shadow-xl shadow-amber-400/20">
          HOLA SOC EL LUNA
        </div>
        
        <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.3em] max-w-[200px] leading-relaxed">
          Classe en fase de blindatge. Properament trobaràs aquí el contingut audiovisual de preparació.
        </p>

        <button 
          onClick={onTornar}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mt-4"
        >
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tornar a classes</span>
        </button>
      </motion.div>

    </div>
  );
}
