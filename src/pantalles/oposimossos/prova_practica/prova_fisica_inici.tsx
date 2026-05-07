import { ChevronLeft, Info, MapPin, Dumbbell, Apple, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ProvaFisicaInici
 * Menú principal per a la preparació de les proves físiques de Mossos.
 */
export default function ProvaFisicaInici({ onTornar }: { onTornar: () => void }) {
  
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d] overflow-y-auto pb-12">
      
      {/* CAPÇALERA */}
      <header className="pt-10 w-full flex flex-col items-center gap-4 pb-6 text-center">
        <div className="bg-white/10 backdrop-blur-md px-8 py-3 rounded-2xl shadow-xl border border-white/10">
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-white">
            Prova <span className="text-emerald-400">Física</span>
          </h1>
        </div>
        <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] max-w-[250px] leading-relaxed">
          Preparació física integral per superat l'accés al cos.
        </p>
      </header>

      {/* BOTONS PRINCIPALS */}
      <main className="w-full max-w-md px-6 flex flex-col gap-3">
        
        {/* BOTÓ 1: INFORMACIÓ OFICIAL */}
        <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-[1.5rem] p-3 flex items-center justify-between group transition-all shadow-lg active:scale-95">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Info size={20} />
            </div>
            <span className="text-white font-black italic uppercase tracking-wider text-[11px]">
              Informació oficial
            </span>
          </div>
          <ArrowRight size={16} className="text-white/20 mr-2 group-hover:text-white transition-all" />
        </button>

        {/* BOTÓ 2: TROBAR ON ENTRENAR */}
        <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-[1.5rem] p-3 flex items-center justify-between group transition-all shadow-lg active:scale-95">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <MapPin size={20} />
            </div>
            <span className="text-white font-black italic uppercase tracking-wider text-[11px]">
              Trobar on entrenar
            </span>
          </div>
          <ArrowRight size={16} className="text-white/20 mr-2 group-hover:text-white transition-all" />
        </button>

        {/* GRUP DE PROVES I DIETA */}
        <div className="grid grid-cols-1 gap-2 mt-2">
           <div className="px-4 text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Entrenament i Nutrició</div>
           
           <div className="flex flex-col gap-2">
              {/* BOTÓ 3: LES 3 PROVES FÍSIQUES */}
              <button className="w-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-500/20 rounded-[2rem] p-4 flex flex-col items-center text-center gap-3 group transition-all shadow-xl active:scale-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-[#00274d] shadow-lg shadow-emerald-500/40 group-hover:scale-110 transition-transform">
                  <Dumbbell size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black italic uppercase tracking-wider text-sm">
                    Les 3 proves físiques
                  </span>
                  <span className="text-emerald-400/60 text-[8px] font-black uppercase tracking-widest mt-0.5">Circuit, Pressió i Navette</span>
                </div>
              </button>

              {/* BOTÓ 4: DIETA */}
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-[1.5rem] p-3 flex items-center justify-between group transition-all active:scale-95">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <Apple size={20} />
                  </div>
                  <span className="text-white font-black italic uppercase tracking-wider text-[11px]">
                    Dieta
                  </span>
                </div>
                <div className="bg-white/10 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest opacity-40 mr-1">Nutrició Esportiva</div>
              </button>
           </div>
        </div>

      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6 pt-12">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 group transition-all"
        >
          <ChevronLeft size={20} className="text-white/30 group-hover:text-white transition-colors" />
          <span className="text-white/40 group-hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
            Tornar al Menú Principal
          </span>
        </button>
      </footer>

    </div>
  );
}
