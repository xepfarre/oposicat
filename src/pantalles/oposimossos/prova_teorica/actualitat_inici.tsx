import React, { useState, useRef } from "react";
import { ChevronLeft, Calendar, FileText, Globe, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import NoticiesSetmana from "./noticies_setmana";
import RellevantAny from "./rellevant_any";
import ExamenActualitat from "./examen_actualitat";

/**
 * PANTALLA: ActualitatInici
 * Pantalla que mostra les opcions d'actualitat: setmana, any i exàmens.
 */
export default function ActualitatInici({ onTornar }: { onTornar: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Estat per saber quina secció d'actualitat estem veient
  const [seccio, setSeccio] = useState<'menu' | 'noticies_setmana' | 'rellevant_any' | 'examen_actualitat'>('menu');

  // Detectem l'scroll del contenidor per a l'efecte de la capçalera
  const handleContainerScroll = () => {
    if (scrollContainerRef.current) {
      setScrolled(scrollContainerRef.current.scrollTop > 40);
    }
  };

  const opcions = [
    { 
      id: 'setmana',
      titol: "Què ha passat l'última setmana", 
      desc: "Resum de les notícies més fresques",
      icona: <Calendar size={20} />, 
      color: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-400"
    },
    { 
      id: 'any',
      titol: "Les coses més rellevants de l'any", 
      desc: "Conceptes clau que han marcat l'any",
      icona: <Globe size={20} />, 
      color: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-400"
    },
    { 
      id: 'examen',
      titol: "Examen d'actualitat", 
      desc: "Posa a prova els teus coneixements",
      icona: <FileText size={20} />, 
      color: "from-emerald-500/20 to-emerald-600/20",
      iconColor: "text-emerald-400"
    }
  ];

  // Si l'usuari tria notícies de la setmana
  if (seccio === 'noticies_setmana') {
    return <NoticiesSetmana onTornar={() => setSeccio('menu')} />;
  }

  // Si l'usuari tria coses rellevants de l'any
  if (seccio === 'rellevant_any') {
    return <RellevantAny onTornar={() => setSeccio('menu')} />;
  }

  // Si l'usuari tria l'examen
  if (seccio === 'examen_actualitat') {
    return <ExamenActualitat onTornar={() => setSeccio('menu')} />;
  }

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full max-w-lg md:max-w-4xl flex flex-col items-center shrink-0 text-center mb-4 relative">
        
        {/* FILA 1: BOTÓ ENRERA + LOGO */}
        <div className="w-full flex items-center justify-center relative mb-8">
          <button 
            onClick={onTornar}
            className="absolute left-0 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="bg-black/30 backdrop-blur-md px-10 py-3 rounded-[1.5rem] shadow-xl border border-white/10">
            <h1 className="text-2xl font-black italic tracking-tighter select-none">
              <span className="text-white">Oposi </span>
              <span className="text-red-500">Mossos</span>
            </h1>
          </div>
        </div>

        {/* FILA 2: TITOL SECCIO + RATLLA */}
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-lg font-black italic tracking-widest text-white uppercase mb-1 text-center">
            Actualitat
          </h2>
          <div className="w-12 h-1 bg-red-600 rounded-full" />
        </div>

        {/* LABEL GROC */}
        <div className="mt-4 mx-auto max-w-[300px] text-center">
          <p className="text-amber-400 text-[10px] font-bold italic leading-relaxed">
            "Troba aquí les notícies més rellevants de l'última setmana, les coses més rellevants de l'últim any o l'eina de pràctica d'actualitat."
          </p>
        </div>
      </header>

      {/* SECCIONS D'OPCIONS */}
      <main className="w-full max-w-md md:max-w-xl flex flex-col items-center mt-4 gap-5">
        
        {/* SECCIÓ 1 */}
        <div className="w-full flex flex-col">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2 self-start pl-2">
            Actualitat més recent
          </span>
          <button 
            onClick={() => setSeccio('noticies_setmana')}
            className="w-full bg-white/10 border-white/20 hover:bg-white/20 border rounded-xl py-4 md:py-8 text-white font-black italic uppercase text-[11px] md:text-base tracking-widest transition-all active:scale-95 shadow-lg"
          >
            Última setmana
          </button>
        </div>

        {/* SECCIÓ 2 */}
        <div className="w-full flex flex-col">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2 self-start pl-2">
            El més rellevant mes a mes
          </span>
          <button 
            onClick={() => setSeccio('rellevant_any')}
            className="w-full bg-white/10 border-white/20 hover:bg-white/20 border rounded-xl py-4 md:py-8 text-white font-black italic uppercase text-[11px] md:text-base tracking-widest transition-all active:scale-95 shadow-lg"
          >
            Notícies de l'any
          </button>
        </div>

        {/* SEPARADOR */}
        <div className="w-full h-px bg-white/5 my-1" />

        {/* SECCIÓ 3 */}
        <div className="w-full flex flex-col">
          <span className="text-yellow-400/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2 self-start pl-2">
            Practica amb examens d'actualitat
          </span>
          <button 
            onClick={() => setSeccio('examen_actualitat')}
            className="w-full bg-white/10 border-white/20 hover:bg-white/20 border rounded-xl py-4 md:py-8 text-white font-black italic uppercase text-[11px] md:text-base tracking-widest transition-all active:scale-95 shadow-lg"
          >
            Examens actualitat
          </button>
        </div>

      </main>

      {/* PEU DE PÀGINA */}
      <footer className="mt-12 opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">
          OposiMossos • Actualitat
        </p>
      </footer>

    </div>
  );
}
