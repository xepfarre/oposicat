import { useState } from "react";
import { ChevronLeft, Check, X, RefreshCw, Trophy, Brain } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * PANTALLA: ExamenActualitat
 * Simulador de test per posar a prova els coneixements d'actualitat de l'aspirant.
 */
export default function ExamenActualitat({ onTornar }: { onTornar: () => void }) {
  
  // Preguntes simulades sobre fets recents
  const preguntes = [
    {
      id: 1,
      pregunta: "Quin és l'objectiu principal de la fase de pre-alerta per sequera activada recentment a Catalunya?",
      opcions: [
        "Prohibir totalment el reg agrícola a tot el territori.",
        "Monitoritzar embassaments i preparar mesures d'estalvi preventiu.",
        "Tancar l'accés a les platges de l'àrea metropolitana.",
        "Augmentar el preu de l'aigua un 50% de forma immediata."
      ],
      correcta: 1,
      explicacio: "La pre-alerta serveix per fer un seguiment estret dels recursos hídrics abans d'aplicar restriccions severes."
    },
    {
      id: 2,
      pregunta: "Quina és la xifra aproximada d'agents que es preveu que tingui el cos de Mossos d'Esquadra segons el pla de creixement actual?",
      opcions: [
        "15.000 agents",
        "17.500 agents",
        "22.000 agents",
        "30.000 agents"
      ],
      correcta: 2,
      explicacio: "El sostre de la plantilla s'ha fixat en uns 22.000 agents per donar resposta a les noves competències."
    },
    {
      id: 3,
      pregunta: "Quin esdeveniment tecnològic ha motivat un desplegament especial de seguretat a Barcelona aquest maig?",
      opcions: [
        "La fira de videojocs IndieDevDay.",
        "El Mobile World Congress (MWC).",
        "La fira del llibre digital de Sarrià.",
        "L'Smart City Expo World Congress."
      ],
      correcta: 1,
      explicacio: "El MWC és l'esdeveniment tecnològic més important i requereix un dispositiu coordinat de seguretat."
    },
    {
      id: 4,
      pregunta: "Quina reforma legal s'ha impulsat recentment per millorar la seguretat ciutadana davant els petits delictes?",
      opcions: [
        "Llei de liberalització d'horaris comercials.",
        "Reforma del Codi Penal contra la multireincidència.",
        "Decret de tancament de locals nocturns a partir de les 2h.",
        "Nova llei de caça i pesca en zones protegides."
      ],
      correcta: 1,
      explicacio: "La multireincidència és un dels grans reptes de la seguretat ciutadana a Catalunya."
    },
    {
      id: 5,
      pregunta: "Quina nova competència ha assumit plenament el cos de Mossos d'Esquadra durant l'últim any?",
      opcions: [
        "Vigilància del trànsit aeri internacional.",
        "Control total de les fronteres terrestres amb França.",
        "Funcions de Policia Marítima en tota la costa catalana.",
        "Gestió directa del sistema de pensions estatal."
      ],
      correcta: 2,
      explicacio: "La Policia Marítima és una de les competències més noves i rellevants del cos."
    }
  ];

  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respostaSeleccionada, setRespostaSeleccionada] = useState<number | null>(null);
  const [encerts, setEncerts] = useState(0);
  const [finalitzat, setFinalitzat] = useState(false);

  // Gestionar la selecció de resposta
  const handleResposta = (index: number) => {
    if (respostaSeleccionada !== null) return;
    setRespostaSeleccionada(index);
    if (index === preguntes[preguntaActual].correcta) {
      setEncerts(prev => prev + 1);
    }
  };

  // Passar a la següent pregunta
  const seguentPregunta = () => {
    if (preguntaActual < preguntes.length - 1) {
      setPreguntaActual(prev => prev + 1);
      setRespostaSeleccionada(null);
    } else {
      setFinalitzat(true);
    }
  };

  // Reiniciar test
  const reiniciar = () => {
    setPreguntaActual(0);
    setRespostaSeleccionada(null);
    setEncerts(0);
    setFinalitzat(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white">
      
      {/* CAPÇALERA */}
      <header className="w-full p-6 flex items-center gap-4 shrink-0 max-w-2xl mx-auto">
        <button 
          onClick={onTornar}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col">
          <span className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Simulador de Test</span>
          <h1 className="text-white text-base font-black uppercase italic tracking-tight">
            Examen <span className="text-red-500">Actualitat</span>
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md px-6 flex flex-col gap-6">
        
        <AnimatePresence mode="wait">
          {!finalitzat ? (
            <motion.div 
              key={preguntaActual}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Progrés */}
              <div className="flex items-center justify-between px-2">
                 <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Pregunta {preguntaActual + 1} de {preguntes.length}</span>
                 <div className="flex gap-1">
                    {preguntes.map((_, i) => (
                      <div key={i} className={`w-4 h-1 rounded-full ${i === preguntaActual ? 'bg-red-500' : i < preguntaActual ? 'bg-emerald-500' : 'bg-white/10'}`} />
                    ))}
                 </div>
              </div>

              {/* Enunciat */}
              <div className="bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-xl">
                 <p className="text-white font-black italic text-sm leading-snug uppercase tracking-tight">
                   {preguntes[preguntaActual].pregunta}
                 </p>
              </div>

              {/* Opcions */}
              <div className="flex flex-col gap-3">
                {preguntes[preguntaActual].opcions.map((opcio, index) => {
                  const isSelected = respostaSeleccionada === index;
                  const isCorrect = index === preguntes[preguntaActual].correcta;
                  const showResult = respostaSeleccionada !== null;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleResposta(index)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                        !showResult ? 'bg-white/5 border-white/10 hover:bg-white/10' :
                        isSelected && isCorrect ? 'bg-emerald-500/20 border-emerald-500/50' :
                        isSelected && !isCorrect ? 'bg-red-500/20 border-red-500/50' :
                        isCorrect ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-black/10 border-white/5 opacity-40'
                      }`}
                    >
                      <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-black italic ${
                        !showResult ? 'bg-white/10 text-white/50' :
                        isCorrect ? 'bg-emerald-500 text-white' :
                        isSelected ? 'bg-red-500 text-white' : 'bg-white/5 text-white/20'
                      }`}>
                         {showResult && isCorrect ? <Check size={16} /> : 
                          showResult && isSelected && !isCorrect ? <X size={16} /> : 
                          String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-[11px] font-bold leading-tight">{opcio}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explicació i Botó Següent */}
              {respostaSeleccionada !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 mt-2"
                >
                  <div className="bg-amber-400/10 border border-amber-400/20 p-4 rounded-2xl">
                     <p className="text-amber-400 text-[10px] font-medium leading-relaxed italic">
                       <span className="font-black not-italic uppercase tracking-widest mr-2 block mb-1">Feedback:</span>
                       {preguntes[preguntaActual].explicacio}
                     </p>
                  </div>
                  <button 
                    onClick={seguentPregunta}
                    className="bg-white text-[#00274d] w-full p-4 rounded-2xl font-black italic uppercase text-xs tracking-widest shadow-xl shadow-white/5 hover:bg-amber-400 transition-colors"
                  >
                    Següent Pregunta
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-8 py-10 text-center"
            >
               <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center relative">
                  <Trophy size={64} className="text-amber-400" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-white/10 rounded-full"
                  />
               </div>
               
               <div className="flex flex-col gap-2">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Test Finalitzat</h2>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Puntuació Obtinguda</p>
               </div>

               <div className="bg-white/10 px-10 py-6 rounded-3xl border border-white/10 flex flex-col items-center">
                  <span className="text-5xl font-black italic tracking-tighter text-white">
                    {encerts}/{preguntes.length}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-emerald-400">
                    {encerts >= 4 ? 'Molt bona preparació!' : encerts >= 3 ? 'Bon camí, segueix així' : 'Cal repassar més l\'actualitat'}
                  </span>
               </div>

               <div className="flex flex-col w-full gap-3">
                 <button 
                   onClick={reiniciar}
                   className="w-full bg-white text-[#00274d] p-5 rounded-2xl font-black italic uppercase text-xs tracking-widest flex items-center justify-center gap-3"
                 >
                   <RefreshCw size={18} />
                   Tornar-ho a provar
                 </button>
                 <button 
                   onClick={onTornar}
                   className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black italic uppercase text-xs tracking-widest"
                 >
                   Sortir del simulador
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-2xl mt-4 opacity-50">
           <Brain size={20} className="text-white" />
           <p className="text-[8px] font-bold uppercase tracking-widest leading-relaxed">
             Aquesta eina està dissenyada per mantenir-te actualitzat. L'ISPC sol incloure 5-10 preguntes sobre temes recents en la prova oficial.
           </p>
        </div>

      </main>

    </div>
  );
}
