import { useState } from "react";
import { ChevronLeft, Check, ArrowRight, RotateCcw, Calculator, Sparkles } from "lucide-react";
import CalculadoraDieta from "./calculadora_dieta";

/**
 * PANTALLA: Qüestionari Dieta Premium
 * 5 passos per personalitzar la dieta + resum final (Versió ESTÀTICA).
 */

interface Question {
  id: number;
  title: string;
  explanation: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Objectiu Principal",
    explanation: "Per tal de dissenyar la dieta ideal, necessitem saber què busques prioritzar en els teus entrenaments de l'oposició.",
    options: ["Guanyar massa muscular", "Millorar la resistència (Navette)", "Perdre greix mantenint potència"]
  },
  {
    id: 2,
    title: "Nivell d'activitat",
    explanation: "Ens permet calcular la despesa calòrica diària segons el teu ritme de vida actual i els teus entrenaments.",
    options: ["Entrenament diari intens", "Mescla d'estudi i gimnàs (moderat)", "Sedesntari amb 2-3 sessions setmanals"]
  },
  {
    id: 3,
    title: "Freqüència de menjars",
    explanation: "Com vols organitzar el teu dia? L'estructura dels menjars és vital per mantenir l'energia durant l'estudi i l'esport.",
    options: ["3 menjars grans", "5 menjars (recomanat)", "Ayun intermitent amb finestres"]
  },
  {
    id: 4,
    title: "Preferències alimentàries",
    explanation: "Volem que la dieta sigui sostenible. Digues-nos quina base prefereixes per als teus plats principals.",
    options: ["Omnívora (de tot)", "Baixa en carbohidrats (Keto/Low carb)", "Vegetariana / Proteïna vegetal"]
  },
  {
    id: 5,
    title: "Suplementació",
    explanation: "L'ajuda extra pot marcar la diferència en la recuperació després del circuit o de la prova de press de banca.",
    options: ["Sense suplements (natural)", "Bàsica (Proteïna/Creatina)", "Completa enfocada a rendiment"]
  }
];

export default function DietaPremiumQuiz({ onTornar }: { onTornar: () => void }) {
  const [currentStep, setCurrentStep] = useState(0); // 0 a 4 són preguntes, 5 és resum, 6 és calculadora
  const [selections, setSelections] = useState<string[]>(new Array(5).fill(""));
  const [isStepCompleted, setIsStepCompleted] = useState<boolean[]>(new Array(5).fill(false));

  const handleSelectOption = (option: string) => {
    const newSelections = [...selections];
    newSelections[currentStep] = option;
    setSelections(newSelections);

    const newIsCompleted = [...isStepCompleted];
    newIsCompleted[currentStep] = true; 
    setIsStepCompleted(newIsCompleted);
  };

  const markAsCompleted = () => {
    if (selections[currentStep]) {
      const newIsCompleted = [...isStepCompleted];
      newIsCompleted[currentStep] = true;
      setIsStepCompleted(newIsCompleted);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setSelections(new Array(5).fill(""));
    setIsStepCompleted(new Array(5).fill(false));
  };

  // Pantalla de la Calculadora de Nutrients (Pas final)
  if (currentStep === 6) {
    return <CalculadoraDieta onTornar={() => setCurrentStep(5)} />;
  }

  // Pantalla de resum final (Pas 6, índex 5)
  if (currentStep === 5) {
    return (
      <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20">
        <header className="pt-8 w-full flex flex-col items-center gap-4 pb-10">
          <div className="bg-yellow-400 px-6 py-2 rounded-xl border border-yellow-500/20">
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-[#00274d]">
              Confirmació Dieta
            </h1>
          </div>
        </header>

        <main className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
              ¿Confirmes que el que has seleccionat és correcte?
            </h2>
            <p className="text-xs text-white/40 uppercase font-bold tracking-widest italic">
              Revisa les teves respostes abans de generar el pla
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
            {QUESTIONS.map((q, idx) => (
              <div key={q.id} className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400/60 italic">
                  {q.title}
                </span>
                <span className="text-sm font-bold text-white/90">
                  {selections[idx]}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setCurrentStep(6)}
              className="w-full bg-emerald-500 text-[#00274d] rounded-2xl py-5 font-black italic uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
            >
              <Calculator size={20} />
              Calcular la dieta
            </button>
            <button 
              onClick={resetQuiz}
              className="w-full bg-white/5 border border-white/10 text-white/60 rounded-2xl py-5 font-black italic uppercase tracking-widest flex items-center justify-center gap-3"
            >
              <RotateCcw size={20} />
              Modificar respostes
            </button>
          </div>
        </main>

        <footer className="pt-10">
          <button onClick={onTornar} className="text-white/20 text-[10px] font-black uppercase tracking-widest hover:text-white">
            Sortir del qüestionari
          </button>
        </footer>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentStep];

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20">
      
      <header className="pt-8 w-full flex flex-col items-center gap-6 pb-8 md:max-w-xl md:mx-auto">
        <div className="flex items-center justify-between w-full">
          <button 
            onClick={currentStep === 0 ? onTornar : prevStep}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 border border-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full ${
                  s === currentStep ? "w-8 bg-yellow-400" : s < currentStep ? "w-4 bg-yellow-400/30" : "w-4 bg-white/10"
                }`}
              />
            ))}
          </div>
          <div className="w-10" />
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 italic">
            Pas {currentStep + 1} de 5
          </span>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Pregunta {currentStep + 1}
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md md:max-w-lg flex flex-col gap-6">
        
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Explicació pas {currentStep + 1} :</h3>
          </div>
          <p className="text-xs md:text-sm text-white/60 leading-relaxed italic pr-2">
            {currentQ.explanation}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {currentQ.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelectOption(opt)}
              className={`w-full p-4 rounded-xl border flex items-center justify-between group ${
                selections[currentStep] === opt 
                  ? "bg-yellow-400/10 border-yellow-400/50 text-yellow-400" 
                  : "bg-white/5 border-white/5 text-white/50"
              }`}
            >
              <span className={`font-black italic uppercase tracking-tight text-xs md:text-base ${selections[currentStep] === opt ? "text-yellow-400" : "text-white/50"}`}>
                {opt}
              </span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selections[currentStep] === opt ? "border-yellow-400 bg-yellow-400 text-[#00274d]" : "border-white/10 bg-transparent"
              }`}>
                {selections[currentStep] === opt && <Check size={12} strokeWidth={4} />}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button 
            onClick={markAsCompleted}
            disabled={!selections[currentStep] || isStepCompleted[currentStep]}
            className={`w-full py-3 rounded-lg font-black italic uppercase tracking-widest border text-[10px] ${
              isStepCompleted[currentStep]
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 opacity-40"
                : selections[currentStep]
                  ? "bg-white/10 border-white/10 text-white"
                  : "bg-white/5 border-white/5 text-white/10 cursor-not-allowed"
            }`}
          >
            {isStepCompleted[currentStep] ? "Pas Completat ✓" : "Confirmar Selecció"}
          </button>

          <button 
            onClick={nextStep}
            disabled={!isStepCompleted[currentStep]}
            className={`w-full py-4 rounded-2xl font-black italic uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 ${
              isStepCompleted[currentStep]
                ? "bg-yellow-400 text-[#00274d]"
                : "bg-white/5 border border-white/10 text-white/10 cursor-not-allowed"
            }`}
          >
            Següent
            <ArrowRight size={18} />
          </button>
        </div>

      </main>

    </div>
  );
}
