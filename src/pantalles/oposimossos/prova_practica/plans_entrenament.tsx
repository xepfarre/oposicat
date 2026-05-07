import React from 'react';
import { motion } from 'motion/react';

/* 
  Aquest fitxer conté la lògica i les dades dels plans d'entrenament.
  Seguint la regla de modularitat, cada prova té el seu propi conjunt de dades.
*/

interface SetmanaPla {
  inici: string;
  fi: string;
  mes: string;
}

const PLANS_BASE: SetmanaPla[] = [
  { inici: "5", fi: "11", mes: "Maig" },
  { inici: "12", fi: "18", mes: "Maig" },
  { inici: "19", fi: "25", mes: "Maig" },
  { inici: "26", fi: "1", mes: "Juny" },
  { inici: "2", fi: "8", mes: "Juny" },
];

interface PlaComponentProps {
  color: string;
  onSelectSetmana: (pla: SetmanaPla) => void;
}

/* 
  Component genèric per mostrar la llista de setmanes d'un pla.
  S'adapta al color de la prova seleccionada.
*/
const LlistaPlans = ({ color, onSelectSetmana }: PlaComponentProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {PLANS_BASE.map((pla, idx) => (
        <button 
          key={idx}
          onClick={() => onSelectSetmana(pla)}
          className="w-full bg-white/5 hover:bg-white/15 border border-white/5 rounded-xl p-3 flex items-center gap-4 transition-all active:scale-[0.98] group"
        >
          <div className={`w-6 h-6 rounded-lg bg-${color}/20 flex items-center justify-center text-${color} text-[10px] font-black italic`}>
            {idx + 1}
          </div>
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-tight group-hover:text-white transition-colors text-left">
            Pla d'entrenament de la setmana del {pla.inici} al {pla.fi} del mes {pla.mes}
          </span>
        </button>
      ))}
    </div>
  );
};

/* 
  Aquí definim els components específics per a cada prova.
  En el futur, cada un podria tenir dades diferents si fos necessari.
*/

export const PlaCourseNavette = (props: PlaComponentProps) => {
  // Lògica específica per Navette si calgués
  return <LlistaPlans {...props} />;
};

export const PlaCircuitAgilitat = (props: PlaComponentProps) => {
  // Lògica específica per Circuit si calgués
  return <LlistaPlans {...props} />;
};

export const PlaPressBanca = (props: PlaComponentProps) => {
  // Lògica específica per Press Banca si calgués
  return <LlistaPlans {...props} />;
};
