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
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d] overflow-y-auto pb-12">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 pb-6 text-center">
        <div className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">
            Exàmen <span className="text-red-500">Psicotècnic</span>
          </h1>
        </div>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] max-w-[250px] leading-relaxed">
          Selecciona el tipus d'entrenament mental que vols realitzar avui.
        </p>
      </header>

      {/* QUADRÍCULA D'EXERCICIS */}
      <main className="w-full max-w-md px-6 grid grid-cols-1 gap-3">
        {exercicis.map((ex, index) => (
          <motion.button
            key={ex.id}
            onClick={() => setExerciciSeleccionat({ id: ex.id, titol: ex.titol })}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-4 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 ${ex.color} rounded-xl text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                {ex.icona}
              </div>
              <span className="text-white font-black italic uppercase tracking-wider text-sm">
                {ex.titol}
              </span>
            </div>
            <div className="bg-white/10 p-2 rounded-lg text-white/20 group-hover:text-white transition-colors">
              <ChevronLeft className="rotate-180" size={16} />
            </div>
          </motion.button>
        ))}
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6 pt-10">
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
