import { ChevronLeft, Dumbbell } from "lucide-react";

/**
 * PANTALLA: ProvaPractica (Física)
 * Preparació per a les proves físiques de Mossos.
 */
export default function ProvaPracticaInici({ onTornar }: { onTornar: () => void }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-between pb-6 px-10 bg-[#00274d] overflow-hidden">
      <header className="pt-14 w-full flex flex-col items-center gap-6">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10">
          <h1 className="text-3xl font-black italic tracking-tighter select-none text-white">
            Oposi <span className="text-red-600">Mossos</span>
          </h1>
        </div>
        <h2 className="text-white text-lg font-black italic tracking-tighter uppercase opacity-90">
          Prova Física
        </h2>
      </header>

      <main className="w-full max-w-xs flex flex-col items-center justify-center gap-8 py-10">
        <div className="bg-white/5 border border-white/10 rounded-full p-8 shadow-inner">
          <Dumbbell size={48} className="text-[#FFDF00] opacity-80" />
        </div>
        <div className="text-center">
          <p className="text-white font-black italic uppercase tracking-tighter text-xl">
            Preparació Física
          </p>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">
            Entrenaments personalitzats <br/> per superar el Circuit.
          </p>
        </div>
      </main>

      <footer className="w-full max-w-xs flex flex-col items-center gap-6">
        <button onClick={onTornar} className="flex items-center gap-2 text-white/50 hover:text-white">
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tornar al menú</span>
        </button>
        <p className="text-[9px] font-black uppercase tracking-wider text-white opacity-80">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>
    </div>
  );
}
