import React, { useState } from 'react';
import { Play, ChevronLeft, Youtube, Dumbbell, Target } from 'lucide-react';

/* 
  Aquest component gestiona els consells tècnics de forma modular per al Circuit d'Agilitat.
  Cada botó representa un punt crític on es poden esgarrapar segons al cronòmetre.
*/

interface ConsellProps {
  titol: string;
  onClick: () => void;
  color: string;
}

const BotoConsell = ({ titol, onClick, color }: ConsellProps) => (
  <button 
    onClick={onClick}
    className="w-full bg-white/5 hover:bg-white/15 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-4 transition-all active:scale-[0.98] group"
  >
    <div className="flex items-center gap-4">
      <div className={`w-8 h-8 rounded-lg bg-${color}/10 flex items-center justify-center text-${color} group-hover:scale-110 transition-transform`}>
        <Play size={14} className="fill-current" />
      </div>
      <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest group-hover:text-white transition-colors text-left uppercase italic">
        {titol}
      </span>
    </div>
    <div className="text-white/20 group-hover:text-white/40 transition-colors">
      <Play size={12} />
    </div>
  </button>
);

interface ConsellsCircuitProps {
  color: string;
}

export const ConsellsCircuitAgilitat = ({ color }: ConsellsCircuitProps) => {
  const [puntSeleccionat, setPuntSeleccionat] = useState<string | null>(null);

  const dadesCircuit: { [key: string]: { explicacio: string, exercicis: string[] } } = {
    "Atacar la tanca": {
      explicacio: "La sortida és vital. Has d'atacar la primera tanca amb decisió per guanyar inèrcia des del segon zero.",
      exercicis: ["Sortides de reacció", "Skipping alt contra paret", "Acceleracions 5m"]
    },
    "Voltereta a la colxoneta": {
      explicacio: "No és gimnàstica artística. Ha de ser ràpida, compacta i sense perdre l'orientació per aixecar-te d'un salt.",
      exercicis: ["Volteretes amb llast", "Burpees explosives", "Core stability"]
    },
    "Primera tanca": {
      explicacio: "Passar per sota requereix agilitat i baixar el centre de gravetat al màxim sense tocar el llistó.",
      exercicis: ["Mobilitat de maluc", "Pas de tanca lateral", "Esquat profund"]
    },
    "Saltar el plint": {
      explicacio: "Fes servir les mans per recolzar-te i impel·lir el cos. No saltis massa alt, busca la línia recta.",
      exercicis: ["Box jumps", "Salt de longitud", "Plio-box altern"]
    },
    "Segona tanca": {
      explicacio: "Mantenir la velocitat mentre canvies de direcció. Ull amb els peus per no ensopegar amb les bases.",
      exercicis: ["Z-runs", "Slalom entre cons", "Propiocepció de turmell"]
    },
    "Tercera tanca": {
      explicacio: "L'últim obstacle abans del pes. Manté la concentració i no baixis el ritme per la fatiga.",
      exercicis: ["Circuit d'agilitat reduït", "Multi-salts", "Equilibri dinàmic"]
    },
    "Agafar el pes correctament": {
      explicacio: "No perdis temps dubtant. Agafa el sac amb seguretat pel centre per evitar que es mogui durant el gir.",
      exercicis: ["Farmer's walk", "Clean amb manuella", "Poder d'aspror (grip)"]
    },
    "El gir": {
      explicacio: "Clava el peu interior per pivotar ràpidament. El cos s'ha d'inclinar cap al gir per vèncer la inèrcia.",
      exercicis: ["Girs en 8", "Llançaments de pilota medicinal", "Pivots de bàsquet"]
    },
    "Últim sprint": {
      explicacio: "Corre com si t'hi anés la vida. No frenis fins que el pit hagi passat totalment la línia d'arribada.",
      exercicis: ["Sprints resistits", "Fartlek intens", "Tècnica de cursa"]
    }
  };

  if (puntSeleccionat) {
    const info = dadesCircuit[puntSeleccionat];
    return (
      <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPuntSeleccionat(null)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-sm font-black italic uppercase text-white tracking-widest">{puntSeleccionat}</h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-emerald-400">
            <Target size={18} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Secret del temps</span>
          </div>
          <p className="text-[12px] text-white/70 leading-relaxed italic">
            "{info.explicacio}"
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] ml-2">Tècnica Oficial</span>
          <a href={VIDEO_PROVA} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-2xl aspect-video bg-black/40 border border-white/10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <Youtube size={48} className="text-red-500 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white">Analitzar execució</span>
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] ml-2">Entrenament específic</span>
          <div className="flex flex-col gap-2">
            {info.exercicis.map((ex, idx) => (
              <a key={idx} href={VIDEO_PROVA} target="_blank" rel="noopener noreferrer" className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                    <Dumbbell size={16} />
                  </div>
                  <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest group-hover:text-white">
                    {ex}
                  </span>
                </div>
                <Youtube size={14} className="text-white/20 group-hover:text-red-500" />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const puntsClau = Object.keys(dadesCircuit);

  return (
    <div className="flex flex-col gap-2 w-full animate-in fade-in duration-500">
      {puntsClau.map((punto, idx) => (
        <BotoConsell 
          key={idx} 
          titol={punto} 
          color={color} 
          onClick={() => setPuntSeleccionat(punto)} 
        />
      ))}
    </div>
  );
};

const VIDEO_PROVA = "https://youtu.be/mrnciH-f1Kc?si=Is8UU2tn-Ch4emyh";

export const ConsellsCourseNavette = ({ color }: { color: string }) => {
  const [puntSeleccionat, setPuntSeleccionat] = useState<string | null>(null);

  const dadesNavette: { [key: string]: { explicacio: string, exercicis: string[] } } = {
    "El gir (pivot)": {
      explicacio: "No facis una corba oberta. Posa un peu sobre la línia i gira sobre ell mateix (pivot) per sortir en direcció contrària immediatament.",
      exercicis: ["Exercicis de pivot", "Slalom curt 5m", "Acceleració-frenada"]
    },
    "Braçat i postura": {
      explicacio: "Els braços marquen el ritme. Han d'anar coordinats i relaxats per no gastar energia innecessària.",
      exercicis: ["Tècnica de braçat", "Core stability", "Skipping relaxat"]
    },
    "Respiració rítmica": {
      explicacio: "Troba un ritme de respiració que coincideixi amb les teves gambades. No aguantis l'aire, oxigena els músculs.",
      exercicis: ["Running aeròbic", "Control de la respiració", "Sèries llargues"]
    },
    "Acceleració progressiva": {
      explicacio: "No gastis tota l'energia als primers nivells. Corre al ritme del xiulet, ni més ràpid ni més lent.",
      exercicis: ["Interval training", "Fartlek progressiu", "Control de ritme"]
    },
    "Fortalesa mental": {
      explicacio: "Quan les cames cremin, el cap mana. Visualitza el següent xiulet com la teva única meta a curt termini.",
      exercicis: ["Sèries d'alta intensitat", "Visualització", "Entrenament de resistència"]
    }
  };

  if (puntSeleccionat) {
    const info = dadesNavette[puntSeleccionat];
    return (
      <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPuntSeleccionat(null)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-sm font-black italic uppercase text-white tracking-widest">{puntSeleccionat}</h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-emerald-400">
            <Target size={18} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Tècnica de carrera</span>
          </div>
          <p className="text-[12px] text-white/70 leading-relaxed italic">
            "{info.explicacio}"
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] ml-2">Masterclass</span>
          <a href={VIDEO_PROVA} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-2xl aspect-video bg-black/40 border border-white/10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <Youtube size={48} className="text-red-500 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest text-white/70">Veure consell en vídeo</span>
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] ml-2">Treball de camp</span>
          <div className="flex flex-col gap-2">
            {info.exercicis.map((ex, idx) => (
              <a key={idx} href={VIDEO_PROVA} target="_blank" rel="noopener noreferrer" className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 transition-all active:scale-[0.98] group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                    <Dumbbell size={16} />
                  </div>
                  <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest group-hover:text-white">
                    {ex}
                  </span>
                </div>
                <Youtube size={14} className="text-white/20 group-hover:text-red-500" />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <p className="text-[11px] text-white/50 leading-relaxed italic text-center px-4">
        "La Course Navette no és només córrer, és saber gestionar la teva energia i optimitzar cada gir."
      </p>
      <div className="flex flex-col gap-2">
        {Object.keys(dadesNavette).map((p, idx) => (
          <BotoConsell key={idx} titol={p} color={color} onClick={() => setPuntSeleccionat(p)} />
        ))}
      </div>
    </div>
  );
};

export const ConsellsPressBanca = ({ color }: { color: string }) => {
  const [musculSeleccionat, setMusculSeleccionat] = useState<string | null>(null);

  const dadesMusculs: { [key: string]: { explicacio: string, exercicis: string[] } } = {
    "Pectoral major": {
      explicacio: "És el motor principal del moviment. Un pectoral fort permet una empenta explosiva des de la part inferior del recorregut.",
      exercicis: ["Press inclinat amb manuelles", "Obertures en politja", "Flexions explosives"]
    },
    "Tríceps braquial": {
      explicacio: "Responsable de l'extensió final del colze. Fonamental per bloquejar el pes a la part alta i evitar que la barra es quedi a mig camí.",
      exercicis: ["Press francès", "Extensions en politja alta", "Fons de tríceps"]
    },
    "Deltoide anterior": {
      explicacio: "Ajuda en la fase inicial de l'aixecament. Estabilitza l'espatlla i dóna potència extra quan la barra s'enlaira del pit.",
      exercicis: ["Press militar", "Elevacions frontals", "Press Arnold"]
    },
    "Serrat anterior": {
      explicacio: "Estabilitza l'escàpula contra la caixa toràcica. Un serrat actiu manté la base sòlida per a tota l'empenta.",
      exercicis: ["Push-up plus", "Serratus punch", "Planxes dinàmiques"]
    },
    "Trapeci": {
      explicacio: "Controla la retracció escapular. Manté l'espatlla en una posició segura i mecànicament avantatjosa durant tot l'exercici.",
      exercicis: ["Rem amb barra", "Encongiments", "Face pulls"]
    },
    "Dorsal ample": {
      explicacio: "Proporciona la base de suport sobre el banc. Actua com un 'moll' que ajuda a controlar el descens i estabilitzar la barra.",
      exercicis: ["Dominades", "Rem invertit", "Pull-over con mancuerna"]
    }
  };

  if (musculSeleccionat) {
    const info = dadesMusculs[musculSeleccionat];
    return (
      <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
        {/* Capçalera Detall */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMusculSeleccionat(null)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-sm font-black italic uppercase text-white tracking-widest">{musculSeleccionat}</h3>
        </div>

        {/* Targeta Explicativa */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-emerald-400">
            <Target size={18} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Per què és important?</span>
          </div>
          <p className="text-[12px] text-white/70 leading-relaxed italic">
            "{info.explicacio}"
          </p>
        </div>

        {/* Vídeo Tècnic */}
        <div className="flex flex-col gap-3">
          <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] ml-2">Anàlisi de la prova</span>
          <a 
            href={VIDEO_PROVA} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl aspect-video bg-black/40 border border-white/10 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <Youtube size={48} className="text-red-500 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">Veure correcció tècnica</span>
          </a>
        </div>

        {/* Exercicis Millora */}
        <div className="flex flex-col gap-3">
          <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] ml-2">Exercicis per millorar</span>
          <div className="flex flex-col gap-2">
            {info.exercicis.map((ex, idx) => (
              <a 
                key={idx}
                href={VIDEO_PROVA}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                    <Dumbbell size={16} />
                  </div>
                  <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                    {ex}
                  </span>
                </div>
                <Youtube size={14} className="text-white/20 group-hover:text-red-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <p className="text-[11px] text-white/50 leading-relaxed italic text-center px-4">
        "T'ensenyem a treballar els músculs principals i secundaris implicats en un press de banca perfecte."
      </p>

      {/* Músculs Principals */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] ml-2">Músculs Principals</h3>
        <div className="flex flex-col gap-2">
          {["Pectoral major", "Tríceps braquial", "Deltoide anterior"].map((m, idx) => (
            <BotoConsell key={idx} titol={m} color={color} onClick={() => setMusculSeleccionat(m)} />
          ))}
        </div>
      </div>

      {/* Músculs Secundaris */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] ml-2">Músculs Secundaris</h3>
        <div className="flex flex-col gap-2">
          {["Serrat anterior", "Trapeci", "Dorsal ample"].map((m, idx) => (
            <BotoConsell key={idx} titol={m} color={color} onClick={() => setMusculSeleccionat(m)} />
          ))}
        </div>
      </div>
    </div>
  );
};
