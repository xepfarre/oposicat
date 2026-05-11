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
    <div 
      ref={scrollContainerRef}
      onScroll={handleContainerScroll}
      className="fixed inset-0 h-full w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-20 px-6" 
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      
      {/* CAPÇALERA DINÀMICA I FIXA */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-6 ${
          scrolled 
          ? 'bg-[#00274d]/90 backdrop-blur-md h-20 border-b border-white/10 shadow-2xl' 
          : 'bg-transparent h-40'
        }`}
        style={{ 
          paddingTop: "env(safe-area-inset-top)" 
        }}
      >
        <div className="relative w-full max-w-4xl flex items-center justify-center">
          <button 
            onClick={onTornar}
            className={`absolute left-0 p-3 rounded-full border border-white/10 text-white active:scale-90 ${
              scrolled ? 'bg-white/5 scale-90' : 'bg-white/5'
            }`}
          >
            <ChevronLeft size={scrolled ? 18 : 20} />
          </button>
          
          <div className={`bg-white/10 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10 ${
            scrolled ? 'scale-90 py-2' : 'scale-100'
          }`}>
            <h1 className={`font-black italic tracking-tighter uppercase text-white ${
              scrolled ? 'text-lg' : 'text-2xl'
            }`}>
              Actualitat <span className="text-amber-400">ISPC</span>
            </h1>
          </div>
        </div>
      </header>

      {/* LLISTAT DE BOTONS */}
      <main 
        className="w-full md:max-w-6xl flex flex-col md:grid md:grid-cols-3 gap-4"
        style={{ 
          paddingTop: scrolled 
            ? "calc(100px + env(safe-area-inset-top))" 
            : "calc(160px + env(safe-area-inset-top))" 
        }}
      >
        {/* LABEL GROC SOL·LICITAT */}
        <div className={`col-span-full mb-6 mx-auto max-w-[300px] text-center transition-all ${scrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <p className="text-amber-400 text-xs font-bold leading-relaxed shadow-sm">
            "Troba aqui les noticies me rellevants de l'ultima setmana, les coses mes rellevants de l'ultim any o l'eina de practica d'actualitat."
          </p>
        </div>
        {opcions.map((opc, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              if (opc.id === 'setmana') {
                setSeccio('noticies_setmana');
              } else if (opc.id === 'any') {
                setSeccio('rellevant_any');
              } else if (opc.id === 'examen') {
                setSeccio('examen_actualitat');
              }
            }}
            className={`w-full bg-gradient-to-br ${opc.color} hover:bg-white/10 border border-white/10 rounded-[2rem] p-6 md:p-10 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 group transition-all shadow-lg active:scale-95`}
          >
            <div className="flex flex-row md:flex-col items-center gap-5">
              <div className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl bg-black/20 flex items-center justify-center ${opc.iconColor} group-hover:scale-110 transition-transform`}>
                {/* SVG icon size adjustment for tablet */}
                {React.cloneElement(opc.icona as React.ReactElement<any>, { size: 32 })}
              </div>
              <div className="flex flex-col items-start md:items-center text-left md:text-center">
                <span className="text-white font-black italic uppercase tracking-wider text-sm md:text-xl leading-tight">
                  {opc.titol}
                </span>
                <span className="text-white/40 text-[9px] md:text-xs font-bold uppercase tracking-widest mt-1">
                  {opc.desc}
                </span>
              </div>
            </div>
            <ArrowRight size={18} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all md:hidden" />
          </motion.button>
        ))}
      </main>

      {/* BOTÓ TORNAR */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6 pt-12">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 group transition-all"
        >
          <ChevronLeft size={20} className="text-white/30 group-hover:text-white transition-colors" />
          <span className="text-white/40 group-hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
            Tornar a Prova Teòrica
          </span>
        </button>
      </footer>

    </div>
  );
}
