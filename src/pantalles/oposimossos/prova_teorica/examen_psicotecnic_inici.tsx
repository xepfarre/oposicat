import { useState } from "react";
import { ChevronLeft, Brain, Hash, LayoutGrid, Eye, MessageSquare, Zap, Target, Box, Layers } from "lucide-react";
import { motion } from "motion/react";
import DetallPsicotecnic from "./detall_psicotecnic";

/**
 * PANTALLA: ExamenPsicotecnicInici
 * Pantalla que llista els diferents tipus d'exercicis psicotècnics.
 */
export default function ExamenPsicotecnicInici({ onTornar }: { onTornar: () => void }) {
  
  // Estat per saber quin exercici hem seleccionat
  const [exerciciSeleccionat, setExerciciSeleccionat] = useState<{ id: string, titol: string } | null>(null);

  // Llista d'exercicis psicotècnics sol·licitats
  const exercicis = [
    { id: 'domino', titol: 'Fitxes Dominó', icona: <LayoutGrid size={20} />, color: 'bg-blue-500' },
    { id: 'successions', titol: 'Successions', icona: <Layers size={20} />, color: 'bg-emerald-500' },
    { id: 'perspectives', titol: 'Perspectives', icona: <Box size={20} />, color: 'bg-amber-500' },
    { id: 'figures_cubs', titol: 'Figures i Cubs', icona: <Layers size={20} />, color: 'bg-purple-500' },
    { id: 'series_numeriques', titol: 'Sèries Numèriques', icona: <Hash size={20} />, color: 'bg-red-500' },
    { id: 'calcul_mental', titol: 'Càlcul Mental', icona: <Zap size={20} />, color: 'bg-orange-500' },
    { id: 'memoria_visual', titol: 'Memòria Visual', icona: <Eye size={20} />, color: 'bg-cyan-500' },
    { id: 'raonament_logic', titol: 'Raonament Lògic', icona: <Brain size={20} />, color: 'bg-pink-500' },
    { id: 'comprensio_verbal', titol: 'Comprensió Verbal', icona: <MessageSquare size={20} />, color: 'bg-indigo-500' },
    { id: 'atencio_detall', titol: 'Atenció i Detall', icona: <Target size={20} />, color: 'bg-lime-500' },
  ];

  // Si tenim un exercici seleccionat, mostrem el seu detall
  if (exerciciSeleccionat) {
    return (
      <DetallPsicotecnic 
        onTornar={() => setExerciciSeleccionat(null)} 
        exercici={exerciciSeleccionat} 
      />
    );
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
            Exàmen Psicotècnic
          </h2>
          <div className="w-12 h-1 bg-red-600 rounded-full" />
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <p className="text-white/30 text-[9px] md:text-xs font-bold italic leading-relaxed max-w-[280px] md:max-w-2xl">
            " Recorda que <span className="text-yellow-400">5 PUNTS</span> del tot el comput total de la prova teorica de l'oposició és l'examen psicotecnic, no ho deixis pel final i practica! "
          </p>
        </div>
      </header>

      {/* QUADRÍCULA D'EXERCICIS */}
      <main className="w-full max-w-md md:max-w-6xl flex flex-col gap-3">
        {exercicis.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setExerciciSeleccionat({ id: ex.id, titol: ex.titol })}
            className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center justify-between group transition-all active:scale-[0.98] shadow-xl hover:bg-white/5"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${ex.color} text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                {ex.icona}
              </div>
              <span className="text-white font-black italic tracking-wider text-sm text-left">
                {ex.titol}
              </span>
            </div>
            <div className="text-white/10 group-hover:text-white transition-colors">
              <ChevronLeft className="rotate-180" size={18} />
            </div>
          </button>
        ))}
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="mt-12 opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">
          OposiMossos • Psicotècnics
        </p>
      </footer>

    </div>
  );
}
