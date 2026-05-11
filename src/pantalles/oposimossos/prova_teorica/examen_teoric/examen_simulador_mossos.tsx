import { useState } from "react";
import { ChevronLeft, Check, X, RefreshCw, Trophy, Brain } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/**
 * PANTALLA: ExamenSimuladorMossos
 * Simulador de test d'OposiMossos basat en l'estètica d'Examen Actualitat.
 */
interface Question {
  id: number;
  pregunta: string;
  opcions: string[];
  correcta: number;
  explicacio: string;
}

export default function ExamenSimuladorMossos({ 
  onTornar, 
  numPreguntes, 
  temps 
}: { 
  onTornar: () => void;
  numPreguntes: number;
  temps: string;
}) {
  
  // Preguntes simulades per mostrar l'eina
  const totesLesPreguntes: Question[] = [
    {
      id: 1,
      pregunta: "Segons l'Estatut d'Autonomia de Catalunya, quina institució té la competència exclusiva en matèria de protecció de persones i béns i manteniment de l'ordre públic?",
      opcions: [
        "El Ministeri de l'Interior.",
        "La Generalitat de Catalunya (Mossos d'Esquadra).",
        "La Guardia Civil en coordinació amb la Policia Nacional.",
        "Els ajuntaments a través de la Guàrdia Urbana."
      ],
      correcta: 1,
      explicacio: "L'Estatut atorga a la Generalitat la competència per a la creació i l'organització d'una policia autonòmica."
    },
    {
      id: 2,
      pregunta: "Quin article de la Constitució Espanyola de 1978 estableix que les forces i cossos de seguretat tenen com a missió protegir el lliure exercici dels drets i llibertats?",
      opcions: [
        "Article 1.",
        "Article 55.",
        "Article 104.",
        "Article 149."
      ],
      correcta: 2,
      explicacio: "L'article 104 defineix la missió primordial de les Forces i Cossos de Seguretat sota la dependència del Govern."
    },
    {
      id: 3,
      pregunta: "En quin any es va refundar el cos de Mossos d'Esquadra com a policia de la Generalitat de Catalunya durant la democràcia?",
      opcions: [
        "1975",
        "1983",
        "1994",
        "2005"
      ],
      correcta: 1,
      explicacio: "La Llei 19/1983 va ser la base per a la creació definitiva del cos modern dels Mossos d'Esquadra."
    },
    {
      id: 4,
      pregunta: "Quin és el principi d'actuació que obliga a l'ús de la força només quan sigui estrictament necessari i en la mesura adequada?",
      opcions: [
        "Principi de jerarquia.",
        "Principi de proporcionalitat.",
        "Principi de celeritat.",
        "Principi d'oportunitat política."
      ],
      correcta: 1,
      explicacio: "La congruència, l'oportunitat i la proporcionalitat són els pilars de l'ús de la força policial."
    },
    {
      id: 5,
      pregunta: "A quin àmbit del temari pertany l'estudi de la Unió Europea i les seves institucions?",
      opcions: [
        "Àmbit A (Coneixements de l'entorn).",
        "Àmbit B (Institucional).",
        "Àmbit C (Seguretat i Policia).",
        "No forma part del temari de Mossos."
      ],
      correcta: 1,
      explicacio: "L'Àmbit B se centra en les institucions, incloent la Constitució, l'Estatut i la Unió Europea."
    }
  ];

  // Seleccionem només el número de preguntes demanat (o el màxim disponible)
  const preguntes = totesLesPreguntes.slice(0, numPreguntes);

  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respostaSeleccionada, setRespostaSeleccionada] = useState<number | null>(null);
  const [encerts, setEncerts] = useState(0);
  const [finalitzat, setFinalitzat] = useState(false);

  const handleResposta = (index: number) => {
    if (respostaSeleccionada !== null) return;
    setRespostaSeleccionada(index);
    if (index === preguntes[preguntaActual].correcta) {
      setEncerts(prev => prev + 1);
    }
  };

  const seguentPregunta = () => {
    if (preguntaActual < preguntes.length - 1) {
      setPreguntaActual(prev => prev + 1);
      setRespostaSeleccionada(null);
    } else {
      setFinalitzat(true);
    }
  };

  const reiniciar = () => {
    setPreguntaActual(0);
    setRespostaSeleccionada(null);
    setEncerts(0);
    setFinalitzat(false);
  };

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white z-50">
      
      {/* CAPÇALERA */}
      <header className="w-full p-6 flex items-center gap-4 shrink-0 max-w-2xl mx-auto">
        <button 
          onClick={onTornar}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col">
          <span className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Simulador OposiMossos</span>
          <h1 className="text-white text-base font-black uppercase italic tracking-tight">
            Examen <span className="text-yellow-400">Teòric</span>
          </h1>
        </div>
        <div className="ml-auto bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{temps === 'inf' ? '∞' : `${temps}:00`}</span>
        </div>
      </header>

      <main className="w-full max-w-md md:max-w-4xl px-6 flex flex-col gap-6 md:py-8">
        
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
                      <div key={i} className={`w-4 h-1 rounded-full ${i === preguntaActual ? 'bg-yellow-400' : i < preguntaActual ? 'bg-emerald-500' : 'bg-white/10'}`} />
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
                       <span className="font-black not-italic uppercase tracking-widest mr-2 block mb-1">Nota formativa:</span>
                       {preguntes[preguntaActual].explicacio}
                     </p>
                  </div>
                  <button 
                    onClick={seguentPregunta}
                    className="bg-white text-[#00274d] w-full p-4 rounded-2xl font-black italic uppercase text-xs tracking-widest shadow-xl shadow-white/5 hover:bg-yellow-400 transition-colors"
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
                  <Trophy size={64} className="text-yellow-400" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-white/10 rounded-full"
                  />
               </div>
               
               <div className="flex flex-col gap-2">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Simulació completa</h2>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Resultat Final</p>
               </div>

               <div className="bg-white/10 px-10 py-6 rounded-3xl border border-white/10 flex flex-col items-center">
                  <span className="text-5xl font-black italic tracking-tighter text-white">
                    {encerts}/{preguntes.length}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-emerald-400">
                    {encerts === preguntes.length ? 'Excel·lent! Estàs a punt.' : encerts >= preguntes.length * 0.7 ? 'Molt bona puntuació.' : 'Cal seguir estudiant els blocs.'}
                  </span>
               </div>

               <div className="flex flex-col w-full gap-3">
                 <button 
                    onClick={reiniciar}
                    className="w-full bg-yellow-400 text-[#00274d] p-5 rounded-2xl font-black italic uppercase text-xs tracking-widest flex items-center justify-center gap-3"
                  >
                   <RefreshCw size={18} />
                   Tornar a intentar
                 </button>
                 <button 
                   onClick={onTornar}
                   className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black italic uppercase text-xs tracking-widest"
                 >
                   Sortir
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-2xl mt-4 opacity-50">
           <Brain size={20} className="text-white" />
           <p className="text-[8px] font-bold uppercase tracking-widest leading-relaxed">
             Aquesta simulació utilitza preguntes reals d'exàmens passats adaptades al nou temari. Recorda que l'examen oficial té 30 preguntes.
           </p>
        </div>

      </main>

    </div>
  );
}
