import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, ChevronLeft, DivideCircle, Circle, CheckCircle2, Timer as TimerIcon, Info, Play, ChevronRight } from 'lucide-react';

/* 
  Aquest fitxer conté la lògica i les dades dels plans d'entrenament.
  Seguint la regla de modularitat, cada prova té el seu propi conjunt de dades.
*/

// Definim com ha de ser un exercici (nom, temps, imatge i consells)
interface Exercici {
  nom: string;
  temps: string;
  imatge: string;
  consells: string[];
}

// Definim com ha de ser un pla de la setmana (dates, si està bloquejat o no i els seus exercicis)
interface SetmanaPla {
  inici: string;
  fi: string;
  mes: string;
  bloquejat: boolean;
  nomPla?: string;
  exercicis?: Exercici[];
}

// Simulació de dades que vindrien del panell de control (Backoffice)
const EXERCICIS_MOCK: Exercici[] = [
  { 
    nom: "Sèries de velocitat 20m", 
    temps: "8 sèries", 
    imatge: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800&auto=format&fit=crop", 
    consells: ["Mantén el tronc recte", "Mira al front", "Amortigua amb la punta del peu"]
  },
  { 
    nom: "Flexions explosives", 
    temps: "45 segons", 
    imatge: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop", 
    consells: ["Baixa fins gairebé tocar el terra", "Colzes a 45 graus", "Nucli (core) ben activat"]
  },
  { 
    nom: "Esprints amb canvi de sentit", 
    temps: "30 segons", 
    imatge: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=800&auto=format&fit=crop", 
    consells: ["Baixa el centre de gravetat al gir", "Busca la màxima explosivitat", "Respira ritmicament"]
  },
  { 
    nom: "Skipping vertical", 
    temps: "60 segons", 
    imatge: "https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=800&auto=format&fit=crop", 
    consells: ["Puja els genolls fins al maluc", "Mou els braços coordinadament", "Recupera sense aturar-te"]
  },
  { 
    nom: "Burpees d'alta intensitat", 
    temps: "15 repeticions", 
    imatge: "https://images.unsplash.com/photo-1599058917232-d750c8259422?q=80&w=800&auto=format&fit=crop", 
    consells: ["Fes el salt final amb potència", "Mantén el ritme constant", "Cura la posició de l'esquena"]
  },
  { 
    nom: "Plancha abdominal dinàmica", 
    temps: "45 segons", 
    imatge: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop", 
    consells: ["No pugis el cul", "Aguanta la respiració controlada", "Alterna els suports lentament"]
  }
];

// Llista dels 5 plans d'entrenament (només el primer està desbloquejat)
const PLANS_BASE: SetmanaPla[] = [
  { 
    inici: "5", fi: "11", mes: "Maig", bloquejat: false, 
    nomPla: "Pla d'entrenament setmana 5 al 11",
    exercicis: EXERCICIS_MOCK
  },
  { inici: "12", fi: "18", mes: "Maig", bloquejat: true },
  { inici: "19", fi: "25", mes: "Maig", bloquejat: true },
  { inici: "26", fi: "1", mes: "Juny", bloquejat: true },
  { inici: "2", fi: "8", mes: "Juny", bloquejat: true },
];

/**
 * PANTALLA DE DETALL DE L'ENTRENAMENT (Interior)
 * Aquest component mostra un exercici concret dins de la rutina de 8 passos.
 */
const VistaDetalladaEntrenament = ({ pla, color, onTornar }: { pla: SetmanaPla, color: string, onTornar: () => void }) => {
  // Guardem quin exercici estem veient ara i quins ja hem marcat com a fets
  const [indexExercici, setIndexExercici] = useState(0);
  const [completats, setCompletats] = useState<number[]>([]);

  // Configurem la llista total de 8 exercicis (Estructura: Estiraments + 6 de core + Estiraments)
  const totsElsExercicis: Exercici[] = [
    { 
      nom: "Estiraments Dinàmics", 
      temps: "5 minuts", 
      imatge: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop", 
      consells: ["Prepara les articulacions", "Moviments suaus i controlats", "Augmenta la temperatura corporal"]
    },
    ...(pla.exercicis || []),
    { 
      nom: "Estiraments de Tornada a la calma", 
      temps: "10 minuts", 
      imatge: "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=800&auto=format&fit=crop", 
      consells: ["Relaxa la musculatura", "Respira profundament", "Aguanta 20 segons cada estirament"]
    }
  ];

  const exActual = totsElsExercicis[indexExercici];

  // Funció per marcar o desmarcar un exercici com a completat
  const toggleCompletat = (idx: number) => {
    if (completats.includes(idx)) {
      setCompletats(completats.filter(i => i !== idx)); // Si ja el teníem, el treiem
    } else {
      setCompletats([...completats, idx]); // Si no, l'afegim a la llista de verds
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-6 pb-48"
    >
      {/* CAPÇALERA: Nom del pla i botó per anar enrera */}
      <div className="flex items-center gap-4">
        <button onClick={onTornar} className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/50">
          <ChevronLeft size={18} />
        </button>
        <div className="flex flex-col">
          <span className="text-white/40 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Entrenament Personal</span>
          <h2 className="text-sm font-black italic uppercase text-white tracking-widest">{pla.nomPla}</h2>
        </div>
      </div>

      {/* ELS 8 BOTONS D'EXERCICIS: Canvien de color segons si s'han fet o n (Gris -> Verd) */}
      <div className="grid grid-cols-4 gap-2">
        {totsElsExercicis.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => { setIndexExercici(idx); toggleCompletat(idx); }}
            className={`h-10 rounded-xl border transition-all flex items-center justify-center ${
              indexExercici === idx 
                ? `ring-2 ring-${color} border-${color} bg-${color}/10` 
                : 'border-white/5 bg-white/5'
            } ${completats.includes(idx) ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'text-white/20'}`}
          >
            {completats.includes(idx) ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          </button>
        ))}
      </div>

      {/* Línia separadora gris segons el disseny sol·licitat */}
      <div className="h-px w-full bg-white/10 my-1" />

      {/* INFORMACIÓ DE L'EXERCICI SELECCIONAT */}
      <div className="flex flex-col gap-4 text-center items-center">
        {/* 4. Nom de l'exercici */}
        <h3 className="text-lg font-black italic uppercase text-white tracking-tighter">
          {exActual.nom}
        </h3>

        {/* 5. Temps o repeticions (Timer) */}
        <div className={`px-5 py-2 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center gap-2 mb-2`}>
          <TimerIcon size={14} className={`text-${color}`} />
          <span className={`text-[10px] font-black uppercase tracking-widest text-${color}`}>
            {exActual.temps}
          </span>
        </div>

        {/* 6. Foto o vídeo de l'exercici (Simulació amb imatges reals) */}
        <div className="w-full aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 relative group">
          <img src={exActual.imatge} alt={exActual.nom} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-14 h-14 rounded-full bg-${color} flex items-center justify-center text-white shadow-2xl`}>
              <Play size={24} className="fill-current" />
            </div>
          </div>
          
          {/* Fletxes per navegar entre els 8 exercicis */}
          <button 
            disabled={indexExercici === 0}
            onClick={() => setIndexExercici(prev => prev - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            disabled={indexExercici === totsElsExercicis.length - 1}
            onClick={() => setIndexExercici(prev => prev + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* 7. Part final amb el recordatori tècnic (Línies de text explicatives) */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-left flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
             <Info size={14} className={`text-${color}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Recordatori Tècnic</span>
          </div>
          {exActual.consells.map((consell, i) => (
             <div key={i} className="flex gap-3 items-start">
                <div className={`w-1.5 h-1.5 rounded-full bg-${color} mt-1.5 shrink-0`} />
                <p className="text-[11px] text-white/50 font-medium italic leading-relaxed">{consell}</p>
             </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * LLISTA DE PLANS (Vista principal)
 * Aquí l'usuari veu les 5 setmanes disponibles i l'estat de bloqueig.
 */
const LlistaPlans = ({ color }: { color: string }) => {
  const [seleccio, setSeleccio] = useState<SetmanaPla | null>(null);

  // Si l'usuari ha seleccionat un pla que no està bloquejat, mostrem el detall
  if (seleccio) {
    return <VistaDetalladaEntrenament pla={seleccio} color={color} onTornar={() => setSeleccio(null)} />;
  }

  return (
    <div className="flex flex-col gap-2 w-full pb-10">
      {PLANS_BASE.map((pla, idx) => (
        <button 
          key={idx}
          onClick={() => !pla.bloquejat && setSeleccio(pla)}
          className={`w-full bg-white/5 hover:bg-white/15 border border-white/5 rounded-xl p-3 flex items-center gap-4 transition-all active:scale-[0.98] group ${pla.bloquejat ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {/* Icona de bloqueig o desbloqueig */}
          <div className={`w-8 h-8 rounded-lg bg-${color}/20 flex items-center justify-center text-${color} text-xs font-black italic`}>
            {pla.bloquejat ? <Lock size={14} /> : <Unlock size={14} />}
          </div>
          <div className="flex flex-col items-start leading-none gap-1">
            <span className="text-[10px] text-white font-bold uppercase tracking-tight group-hover:text-amber-400 transition-colors">
              Pla d'entrenament setmana {pla.inici} al {pla.fi}
            </span>
            <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">{pla.mes} · {pla.bloquejat ? 'Vindrà properament' : 'Activitat disponible'}</span>
          </div>
          {!pla.bloquejat && <ChevronRight size={14} className="ml-auto text-white/20 group-hover:text-white" />}
        </button>
      ))}
    </div>
  );
};

/* 
  EXPORTEM ELS COMPONENTS PER A CADA PROVA
  Cada una d'aquestes funcions serveix per a les 3 proves físiques: Navette, Press i Circuit.
*/

export const PlaCourseNavette = (props: { color: string }) => {
  return <LlistaPlans {...props} />;
};

export const PlaCircuitAgilitat = (props: { color: string }) => {
  return <LlistaPlans {...props} />;
};

export const PlaPressBanca = (props: { color: string }) => {
  return <LlistaPlans {...props} />;
};
