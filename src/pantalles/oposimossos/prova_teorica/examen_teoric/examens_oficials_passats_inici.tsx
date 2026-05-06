import { ChevronLeft, FileText } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ExamensOficialsPassatsInici
 * Mostra un llistat dels exàmens oficials d'anys anteriors.
 */
export default function ExamensOficialsPassatsInici({ onTornar }: { onTornar: () => void }) {
  
  // Llista d'anys segons la petició
  const anys = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-12 px-6 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 text-center mb-8">
        <div className="bg-white/5 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            <span className="text-white">Exàmens </span>
            <span className="text-blue-400">Oficials Passats</span>
          </h1>
        </div>
        
        <p className="text-white/60 text-xs font-medium max-w-sm leading-relaxed">
          Mira i posa't a prova amb els exàmens oficials d'altres anys.
        </p>
      </header>

      {/* LLISTAT DE BOTONS D'EXÀMENS */}
      <main className="w-full max-w-md flex flex-col gap-3">
        {anys.map((any, idx) => (
          <motion.button
            key={any}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between group transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <FileText size={20} />
              </div>
              <span className="text-white font-black italic uppercase tracking-wider text-sm">
                Examen oficial de l'any {any}
              </span>
            </div>
            <ChevronLeft size={18} className="rotate-180 text-white/20 group-hover:text-white transition-colors" />
          </motion.button>
        ))}
      </main>

      {/* FOOTER */}
      <footer className="mt-12">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white transition-all active:scale-95 group"
        >
          <ChevronLeft size={20} className="text-white/30 group-hover:text-white transition-colors" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Tornar a l'examen teòric</span>
        </button>
      </footer>

    </div>
  );
}
