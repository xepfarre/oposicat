import { ChevronLeft, BookOpen } from "lucide-react";

/**
 * PANTALLA: ProvaTeorica (Inici)
 * Secció dedicada a la preparació de la prova de coneixements.
 * Ubicació: /src/pantalles/oposimossos/prova_teorica/prova_teorica_inici.tsx
 */
export default function ProvaTeoricaInici({ onTornar, onExamenTeoric }: { onTornar: () => void, onExamenTeoric: () => void }) {
  
  return (
    // Mantenim el fons blau fosc corporatiu i permetem l'scroll si hi ha molt contingut
    <div className="flex min-h-screen w-full flex-col items-center justify-between pb-6 px-10 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10">
          <h1 className="text-3xl font-black italic tracking-tighter select-none">
            <span className="text-white">Oposi </span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-white text-lg font-black italic tracking-tighter uppercase opacity-90">
            Prova Teòrica
          </h2>
          <div className="h-0.5 w-12 bg-red-600 rounded-full mb-1" />
          <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider">
            Exàmen dia 5 de gener. Queden 0 dies
          </p>
        </div>
      </header>

      {/* CONTINGUT PRINCIPAL: Centrat en els botons d'accés */}
      <main className="w-full max-w-xs flex flex-col items-center flex-1 py-10">
        {/* Botons de la secció Teòrica */}
        <div className="w-full flex flex-col gap-4">
          <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 text-white font-black italic uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-lg">
            Informació oficial
          </button>
          <button 
            onClick={onExamenTeoric}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 text-white font-black italic uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-lg"
          >
            Exàmen teòric
          </button>
          <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 text-white font-black italic uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-lg">
            Exàmen psicotècnic
          </button>
          <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 text-white font-black italic uppercase text-[11px] tracking-widest transition-all active:scale-95 shadow-lg">
            Actualitat
          </button>
        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6">
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
