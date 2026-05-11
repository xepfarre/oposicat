import React, { useState, useRef } from 'react';
import { ChevronLeft, FileText } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ExamensOficialsPassatsInici
 * Mostra un llistat dels exàmens oficials d'anys anteriors.
 */
export default function ExamensOficialsPassatsInici({ onTornar }: { onTornar: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detectem l'scroll del contenidor per a l'efecte de la capçalera
  const handleContainerScroll = () => {
    if (scrollContainerRef.current) {
      setScrolled(scrollContainerRef.current.scrollTop > 40);
    }
  };
  
  // Llista d'anys segons la petició
  const anys = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleContainerScroll}
      className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-20 px-6" 
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
          
          <div className={`bg-white/5 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 ${
            scrolled ? 'scale-90' : 'scale-100'
          }`}>
            <h1 className={`font-black italic tracking-tighter uppercase ${
              scrolled ? 'text-lg' : 'text-xl md:text-3xl'
            }`}>
              <span className="text-white">Exàmens </span>
              <span className="text-blue-400">Oficials</span>
            </h1>
          </div>
        </div>
      </header>

      {/* LLISTAT DE BOTONS D'EXÀMENS */}
      <main 
        className="w-full md:max-w-4xl flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4 px-6"
        style={{ 
          paddingTop: scrolled 
            ? "calc(100px + env(safe-area-inset-top))" 
            : "calc(160px + env(safe-area-inset-top))" 
        }}
      >
        <div className={`col-span-full mb-6 text-center transition-all ${scrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          <p className="text-white/60 text-xs md:text-lg font-medium max-w-sm md:max-w-xl mx-auto leading-relaxed">
            Mira i posa't a prova amb els exàmens oficials d'altres anys.
          </p>
        </div>
        {anys.map((any, idx) => (
          <motion.button
            key={any}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 md:p-6 flex items-center justify-between group transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <FileText size={20} className="md:size-6" />
              </div>
              <span className="text-white font-black italic uppercase tracking-wider text-sm md:text-lg">
                Examen oficial de l'any {any}
              </span>
            </div>
            <ChevronLeft size={18} className="rotate-180 text-white/20 group-hover:text-white transition-colors" />
          </motion.button>
        ))}
      </main>

      {/* FOOTER */}
      <footer className="mt-12">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white transition-all active:scale-95 group"
        >
          <ChevronLeft size={20} className="text-white/30 group-hover:text-white transition-colors" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Tornar a l'examen teòric</span>
        </button>
      </footer>

    </div>
  );
}
