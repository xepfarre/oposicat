import { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ExamenTeoricInici
 * Secció específica per a la prova teòrica de coneixements.
 * Ubicació: /src/pantalles/oposimossos/prova_teorica/examen_teoric/examen_teoric_inici.tsx
 */
export default function ExamenTeoricInici({ 
  onTornar,
  onTemariOficial,
  onTemariOposimossos,
  onClassesPremium,
  onClassesDirecte,
  onExamensOficialsPassats,
  onExamensOposimossos
}: { 
  onTornar: () => void,
  onTemariOficial: () => void,
  onTemariOposimossos: () => void,
  onClassesPremium: () => void,
  onClassesDirecte: () => void,
  onExamensOficialsPassats: () => void,
  onExamensOposimossos: () => void
}) {
  const [scrolled, setScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detectem l'scroll del contenidor per a l'efecte de la capçalera
  const handleContainerScroll = () => {
    if (scrollContainerRef.current) {
      setScrolled(scrollContainerRef.current.scrollTop > 40);
    }
  };
  
  // Llista de botons demanats
  const botons = [
    { text: "Temari oficial", action: onTemariOficial },
    { text: "Temari d'OposiMossos", action: onTemariOposimossos },
    { text: "Classes premium", action: onClassesPremium },
    { text: "Classes en directe", action: onClassesDirecte },
    { text: "Examens d'OposiMossos", action: onExamensOposimossos },
    { text: "Examens Oficials passats", action: onExamensOficialsPassats }
  ];

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleContainerScroll}
      className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      
      {/* CAPÇALERA FIXA: Es queda a dalt de tot mentre l'usuari navega */}
      <header 
        style={{ 
          height: scrolled ? "calc(70px + env(safe-area-inset-top))" : "calc(140px + env(safe-area-inset-top))",
          backgroundColor: scrolled ? "rgba(0, 39, 77, 0.98)" : "rgba(0, 39, 77, 0.5)",
          borderBottomColor: scrolled ? "rgba(255, 255, 255, 0.1)" : "transparent",
          paddingTop: "env(safe-area-inset-top)"
        }}
        className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center justify-center border-b transition-none px-6 backdrop-blur-md"
      >
        <div className="relative w-full flex items-center justify-center max-w-4xl">
          {/* Botó de retorn */}
          <button 
            style={{ 
              transform: scrolled ? "scale(0.95)" : "scale(1)"
            }}
            onClick={onTornar}
            className="absolute left-0 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          {/* Logo "OposiMossos" */}
          <div 
            style={{ 
              transform: scrolled ? "scale(0.85)" : "scale(1)"
            }}
            className="bg-black/30 px-6 py-2 rounded-2xl border border-white/10"
          >
            <h1 className="text-2xl font-black italic tracking-tighter select-none whitespace-nowrap">
              <span className="text-white">Oposi </span>
              <span className="text-red-600">Mossos</span>
            </h1>
          </div>
        </div>
        
        {/* Informació extra: S'amaga o es mostra sense animació suau */}
        <div 
          style={{ 
            opacity: scrolled ? 0 : 1,
            display: scrolled ? 'none' : 'flex',
            marginTop: "16px"
          }}
          className="flex flex-col items-center gap-1"
        >
          <h2 className="text-white text-md font-black italic tracking-tighter uppercase opacity-90">
            Exàmen Teòric
          </h2>
          <div className="h-0.5 w-10 bg-red-600 rounded-full mb-1" />
        </div>
      </header>

      {/* 
          CONTINGUT PRINCIPAL: 
          Fem servir un padding (pt) que s'ajusta segons si la capçalera està oberta o tancada.
      */}
      <main 
        className="w-full md:max-w-4xl flex flex-col items-center pb-10 px-6 transition-none"
        style={{ 
          paddingTop: scrolled 
            ? "calc(80px + env(safe-area-inset-top))" 
            : "calc(160px + env(safe-area-inset-top))" 
        }}
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {botons.map((boto, idx) => (
            <button 
              key={idx}
              onClick={() => boto.action && boto.action()}
              className="w-full bg-white/10 border-white/20 hover:bg-white/20 border rounded-xl py-6 md:py-16 text-white font-black italic uppercase text-[11px] md:text-base tracking-widest transition-all active:scale-95 shadow-lg"
            >
              {boto.text}
            </button>
          ))}

        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-2">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tornar a Prova Teòrica</span>
        </button>
        
        <p className="text-[8px] font-black uppercase tracking-wider text-white opacity-40 select-none whitespace-nowrap mt-2">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

    </div>
  );
}
