import { ChevronLeft, Play, ExternalLink, User, Shield, BookOpen } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ClaseLuna (Detall de la Classe Premium)
 * Mostra la informació de la classe seleccionada, el professor i l'enllaç al vídeo.
 */
export default function ClaseLuna({ 
  onTornar, 
  bloc, 
  tema, 
  subtema 
}: { 
  onTornar: () => void,
  bloc: string,
  tema: string,
  subtema: string
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white">
          {/* CAPÇALERA AMB BOTÓ TORNAR I TÍTOL */}
      <header className="w-full p-6 flex items-center gap-4 shrink-0 max-w-2xl md:max-w-4xl mx-auto">
        <button 
          onClick={onTornar}
          className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft size={24} className="md:size-8" />
        </button>
        <div className="flex flex-col overflow-hidden">
          <span className="text-amber-400 text-[8px] md:text-sm font-black uppercase tracking-[0.2em] opacity-70">Classe Premium</span>
          <h1 className="text-white text-xs md:text-lg font-black uppercase italic tracking-tight truncate">
            {subtema}
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md md:max-w-4xl px-6 flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 md:py-10">
        
        {/* CARÀTULA / LOGO OPOSICAT (Fons integrat amb l'APP) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-32 md:h-64 bg-black/20 backdrop-blur-md rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center p-4 border border-white/10 relative overflow-hidden group md:col-span-2"
        >
          {/* Resplendor central sutil */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/5 to-transparent opacity-50" />
          
          <div className="flex items-center text-4xl md:text-8xl font-black italic tracking-tighter relative z-10 group-hover:scale-105 transition-transform duration-500">
            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Oposi</span>
            <span className="text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.3)]">CAT</span>
          </div>

          <div className="absolute bottom-3 right-6 md:bottom-8 md:right-12 text-[8px] md:text-xs font-black uppercase text-white/10 tracking-widest italic">
            Premium Content
          </div>
        </motion.div>

        {/* INFORMACIÓ DE LA CLASSE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col h-full gap-4 bg-black/20 backdrop-blur-md p-5 md:p-10 rounded-3xl border border-white/10 shadow-xl"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-amber-400 text-[9px] md:text-xs font-black uppercase tracking-[0.2em]">S'està reproduint ara:</span>
            <h2 className="text-white text-lg md:text-3xl font-black italic uppercase leading-tight">
              {subtema}
            </h2>
            <p className="text-white/40 text-[9px] md:text-sm font-bold uppercase tracking-tight">
              {tema}
            </p>
          </div>

          <div className="h-px w-full bg-white/5" />

          {/* FITXA TÈCNICA */}
          <div className="grid grid-cols-1 gap-3 md:gap-6">
            <div className="flex items-center gap-3 md:gap-5 group">
              <div className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <User size={16} className="md:size-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-white/30 text-[8px] md:text-xs font-black uppercase tracking-widest">Professor</span>
                <span className="text-white font-bold text-xs md:text-xl uppercase italic">Guillem</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              <div className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Shield size={16} className="md:size-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-white/30 text-[8px] md:text-xs font-black uppercase tracking-widest">Professió</span>
                <span className="text-white font-bold text-xs md:text-xl uppercase italic">Mosso d'Esquadra</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              <div className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <BookOpen size={16} className="md:size-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-white/30 text-[8px] md:text-xs font-black uppercase tracking-widest">Bloc</span>
                <span className="text-white font-bold text-xs md:text-xl uppercase italic">BLOC {bloc}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BOTÓ REPRODUCCIÓ YT */}
        <div className="flex flex-col gap-6 md:justify-center">
          <motion.a 
            href="https://youtu.be/mrnciH-f1Kc"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-red-600 hover:bg-red-500 text-white p-3 md:p-8 rounded-2xl flex items-center justify-center gap-3 md:gap-6 shadow-xl shadow-red-900/40 transition-all active:scale-95 group"
          >
            <div className="w-8 h-8 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
              <Play size={16} className="md:size-8" fill="currentColor" />
            </div>
            <div className="flex flex-col items-start pr-4 text-left">
              <span className="text-[8px] md:text-xs font-black uppercase tracking-widest opacity-70">Obrir a YouTube</span>
              <span className="text-sm md:text-2xl font-black italic uppercase tracking-tighter">Veure ara la classe</span>
            </div>
            <ExternalLink size={14} className="md:size-6 ml-auto opacity-40 shrink-0" />
          </motion.a>

          <p className="text-white/20 text-[9px] md:text-sm text-center md:text-left font-medium leading-relaxed italic">
            Recorda que pots descarregar el temari corresponent a aquest tema en format PDF en l'apartat de resums d'OposiMossos.
          </p>
        </div>
      </main>

    </div>
  );
}
