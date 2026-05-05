import { ChevronLeft } from "lucide-react";

/**
 * PANTALLA: ExamenTeoricInici
 * Secció específica per a la prova teòrica de coneixements.
 * Ubicació: /src/pantalles/oposimossos/prova_teorica/examen_teoric/examen_teoric_inici.tsx
 */
export default function ExamenTeoricInici({ 
  onTornar,
  onTemariOficial
}: { 
  onTornar: () => void,
  onTemariOficial: () => void 
}) {
  
  // Llista de botons demanats
  const botons = [
    { text: "Temari oficial", action: onTemariOficial },
    { text: "Temari d'OposiMossos", action: null },
    { text: "Classes premium", action: null },
    { text: "Classes en directe", action: null },
    { text: "Examens d'OposiMossos", action: null },
    { text: "Examens Oficials passats", action: null }
  ];

  return (
    // Fons blau fosc corporatiu i gestió de l'scroll
    <div className="flex min-h-screen w-full flex-col items-center pb-6 px-10 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 text-center mb-2">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10">
          <h1 className="text-3xl font-black italic tracking-tighter select-none">
            <span className="text-white">Oposi </span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-white text-lg font-black italic tracking-tighter uppercase opacity-90">
            Exàmen Teòric
          </h2>
          <div className="h-0.5 w-12 bg-red-600 rounded-full mb-1" />
        </div>
      </header>

      {/* CONTINGUT: Botons en graella en tauletes */}
      <main className="w-full max-w-sm md:max-w-2xl flex flex-col items-center flex-1 py-4 md:py-6">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {botons.map((boto, idx) => (
            <button 
              key={idx}
              onClick={() => boto.action && boto.action()}
              className="w-full bg-white/10 border-white/20 hover:bg-white/20 border rounded-xl py-6 md:py-10 text-white font-black italic uppercase text-[11px] md:text-sm tracking-widest transition-all active:scale-95 shadow-lg"
            >
              {boto.text}
            </button>
          ))}
        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6 pt-6">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tornar a Prova Teòrica</span>
        </button>
        
        <p className="text-[9px] font-black uppercase tracking-wider text-white opacity-80 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

    </div>
  );
}
