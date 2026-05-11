import { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ProvaTeorica (Inici)
 * Secció dedicada a la preparació de la prova de coneixements.
 * Ubicació: /src/pantalles/oposimossos/prova_teorica/prova_teorica_inici.tsx
 */
export default function ProvaTeoricaInici({ 
  onTornar, 
  onExamenTeoric, 
  onExamenPsicotecnic,
  onActualitat,
  onEmCostaEstudiar 
}: { 
  onTornar: () => void, 
  onExamenTeoric: () => void, 
  onExamenPsicotecnic: () => void,
  onActualitat: () => void,
  onEmCostaEstudiar: () => void
}) {
  const [scrolled, setScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detectem l'scroll del contenidor per fer efecte al header.
  const handleContainerScroll = () => {
    if (scrollContainerRef.current) {
      setScrolled(scrollContainerRef.current.scrollTop > 40);
    }
  };
  
  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleContainerScroll}
      className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pt-6 px-6 pb-20"
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
        
        {/* Informació extra: S'amaga instantàniament per evitar salts */}
        <div 
          style={{ 
            opacity: scrolled ? 0 : 1,
            display: scrolled ? 'none' : 'flex',
            marginTop: "16px"
          }}
          className="flex flex-col items-center gap-1"
        >
          <h2 className="text-white text-md font-black italic tracking-tighter uppercase opacity-90">
            Prova Teòrica
          </h2>
          <div className="h-0.5 w-10 bg-red-600 rounded-full mb-1" />
          <p className="text-white/60 text-[8px] font-bold uppercase tracking-wider">
            Exàmen dia 5 de gener. Queden 0 dies
          </p>
        </div>
      </header>

      {/* 
          CONTINGUT PRINCIPAL: 
          Fem servir un padding (pt) que s'ajusta segons si la capçalera està oberta o tancada.
          Això garanteix que en iPhones el contingut mai quedi tapat.
      */}
      <main 
        className="w-full md:max-w-4xl flex flex-col items-center pb-10 px-6 transition-none"
        style={{ 
          paddingTop: scrolled 
            ? "calc(80px + env(safe-area-inset-top))" 
            : "calc(160px + env(safe-area-inset-top))" 
        }}
      >

        {/* Botons de la secció Teòrica en grid per a Tablet */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <button 
            onClick={() => window.open('https://tramits.gencat.cat/ca/tramits/tramits-temes/23243_-_Acces-a-1.587-places-de-mosso-a-de-lescala-basica-del-Cos-de-Mossos-dEsquadra-convocatoria-46-25?gestioSite=interior&__disableDirectEdit=true&category=725c8452-a82c-11e3-a972-000c29052e2c&moda=1', '_blank')}
            className="w-full md:col-span-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl py-6 md:py-14 text-amber-100 font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg"
          >
            Informació personal
          </button>

          {/* Línia de separació gris entre Informació i Exàmens */}
          <div className="md:col-span-2 flex items-center py-2">
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button 
            onClick={onExamenTeoric}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 md:py-20 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg"
          >
            Exàmen teòric
          </button>
          <button 
            onClick={onExamenPsicotecnic}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 md:py-20 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg"
          >
            Exàmen psicotècnic
          </button>
          <button 
            onClick={onActualitat}
            className="w-full md:col-span-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 md:py-14 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg"
          >
            Actualitat
          </button>
          
          {/* Línia de separació gris entre blocs */}
          <div className="md:col-span-2 flex items-center py-2">
            <div className="flex-1 h-px bg-white/10" />
          </div>
          
          <button 
            onClick={onEmCostaEstudiar}
            className="w-full md:col-span-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl py-6 md:py-14 text-emerald-100 font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
          >
            Em costa estudiar
          </button>

        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tornar al menú</span>
        </button>
        
        <p className="text-[8px] font-black uppercase tracking-wider text-white opacity-40 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

    </div>
  );
}
