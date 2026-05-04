import { ChevronLeft, Dumbbell } from "lucide-react";

/**
 * PANTALLA: ProvaPractica (Física)
 * Preparació per a les proves físiques de Mossos.
 */
export default function ProvaPracticaInici({ onTornar }: { onTornar: () => void }) {
  return (
    // Fons blau fosc corporatiu i gestió de l'scroll
    <div className="flex min-h-screen w-full flex-col items-center pb-6 px-10 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 mb-2">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10 text-center">
          <h1 className="text-3xl font-black italic tracking-tighter select-none">
            <span className="text-white">Oposi </span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-white text-lg font-black italic tracking-tighter uppercase opacity-90">
            Prova Física
          </h2>
          <div className="h-0.5 w-12 bg-red-600 rounded-full mb-1" />
        </div>
      </header>

      {/* 
          CONTINGUT PRINCIPAL: 
          Disseny adaptat a tauletes (md:grid-cols-2 o similar).
      */}
      <main className="w-full max-w-sm md:max-w-2xl flex flex-col items-center flex-1 py-2 md:py-4">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          
          {/* Bloc 1: Informació Oficial */}
          <button className="w-full md:col-span-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl py-6 md:py-10 text-amber-100 font-black italic uppercase text-[11px] md:text-sm tracking-widest transition-all active:scale-95 shadow-lg">
            Informació oficial
          </button>

          {/* Línia de separació */}
          <div className="md:col-span-2 flex items-center">
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Bloc 2: Proves Físiques */}
          <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 md:py-12 text-white font-black italic uppercase text-[11px] md:text-sm tracking-widest transition-all active:scale-95 shadow-lg">
            Prova - Press de banca
          </button>
          <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 md:py-12 text-white font-black italic uppercase text-[11px] md:text-sm tracking-widest transition-all active:scale-95 shadow-lg">
            Prova - Circuit agilitat
          </button>
          <button className="w-full md:col-span-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 md:py-12 text-white font-black italic uppercase text-[11px] md:text-sm tracking-widest transition-all active:scale-95 shadow-lg">
            Prova - Curse Navette
          </button>

          {/* Línia de separació */}
          <div className="md:col-span-2 flex items-center">
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Bloc 3: Dieta */}
          <button className="w-full md:col-span-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl py-6 md:py-10 text-emerald-100 font-black italic uppercase text-[11px] md:text-sm tracking-widest transition-all active:scale-95 shadow-lg">
            Dieta
          </button>

        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6 mt-12 shrink-0">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tornar al menú</span>
        </button>
        
        <p className="text-[9px] font-black uppercase tracking-wider text-white opacity-80 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

    </div>
  );
}
