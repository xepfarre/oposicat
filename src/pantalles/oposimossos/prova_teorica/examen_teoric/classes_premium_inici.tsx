import { ChevronLeft, ChevronDown, PlayCircle, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { TEMARI_DETALL } from "../../../../constants/temari";

/**
 * PANTALLA: ClassesPremiumInici
 * Pantalla que permet seleccionar classes premium organitzades per blocs i temes.
 */
export default function ClassesPremiumInici({ 
  onTornar,
  onSeleccionarClasse
}: { 
  onTornar: () => void,
  onSeleccionarClasse: (info: { bloc: string, tema: string, subtema: string }) => void
}) {
  
  // Estats per controlar quins desplegables estan oberts
  const [blocObert, setBlocObert] = useState<string | null>(null);
  const [temaObert, setTemaObert] = useState<string | null>(null);

  // Mapatge dels noms dels blocs
  const blocs = [
    { id: 'A', nom: 'BLOC A' },
    { id: 'B', nom: 'BLOC B' },
    { id: 'C', nom: 'BLOC C' }
  ];

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-12 px-6">
      
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
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-lg font-black italic tracking-widest text-white uppercase mb-1">
            Classes Premium
          </h2>
          <div className="w-12 h-1 bg-red-600 rounded-full" />
        </div>
        
        {/* LABEL GRIS PERSONALITZAT */}
        <div className="max-w-md bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <p className="text-slate-400 text-[11px] font-bold tracking-tight leading-relaxed text-center">
            Selecciona el tema que vulguis veure una classe amb la màxima qualitat, 
            recorda que fem classes en directe de dilluns a dijous en l'apartat de 
            <span className="text-amber-400 underline ml-1">"Classes en directe"</span>.
          </p>
        </div>
      </header>

      {/* LLISTAT DE BLOCS / TEMES / CAPÍTOLS */}
      <main className="w-full max-w-lg md:max-w-4xl flex flex-col gap-4 py-4 md:py-10">
        
        {blocs.map((bloc) => (
          <div key={bloc.id} className="flex flex-col gap-2">
            
            {/* BOTÓ DE BLOC */}
            <button
              onClick={() => {
                setBlocObert(blocObert === bloc.id ? null : bloc.id);
                setTemaObert(null); // Tancquem temes en canviar de bloc
              }}
              className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all border ${
                blocObert === bloc.id 
                ? 'bg-red-600 border-red-500 shadow-lg shadow-red-900/30' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-white font-black italic uppercase tracking-tighter text-xl">
                {bloc.nom}
              </span>
              <ChevronDown 
                className={`text-white transition-transform duration-300 ${blocObert === bloc.id ? 'rotate-180' : ''}`} 
                size={24} 
              />
            </button>

            {/* LLISTAT DE TEMES DEL BLOC */}
            <AnimatePresence>
              {blocObert === bloc.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden flex flex-col gap-2 pl-4"
                >
                  {TEMARI_DETALL[bloc.id as keyof typeof TEMARI_DETALL].map((tema, tIdx) => (
                    <div key={tIdx} className="flex flex-col gap-2">
                      
                      {/* BOTÓ DE TEMA */}
                      <button
                        onClick={() => setTemaObert(temaObert === tema.titol ? null : tema.titol)}
                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-all border ${
                          temaObert === tema.titol
                          ? 'bg-white/20 border-white/30'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-white/90 font-bold uppercase text-[11px] tracking-wide text-left">
                          TEMA {tIdx + 1}: {tema.titol}
                        </span>
                        <ChevronDown 
                          className={`text-white/40 transition-transform duration-300 ${temaObert === tema.titol ? 'rotate-180' : ''}`} 
                          size={16} 
                        />
                      </button>

                      {/* LLISTAT DE CAPÍTOLS DEL TEMA */}
                      <AnimatePresence>
                        {temaObert === tema.titol && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden flex flex-col gap-1 pl-4"
                          >
                            {tema.subtemes.map((subtema, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => onSeleccionarClasse({
                                  bloc: bloc.id,
                                  tema: tema.titol,
                                  subtema: subtema
                                })}
                                className="w-full p-3 rounded-lg flex items-center gap-3 hover:bg-white/5 group transition-all text-left"
                              >
                                <div className="p-2 bg-red-600/20 text-red-500 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-all">
                                  <PlayCircle size={14} />
                                </div>
                                <span className="text-white/60 text-[10px] font-medium uppercase tracking-tight group-hover:text-white transition-colors">
                                  {subtema}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
            Tornar a Exàmen Teòric
          </span>
        </button>
      </footer>

    </div>
  );
}
