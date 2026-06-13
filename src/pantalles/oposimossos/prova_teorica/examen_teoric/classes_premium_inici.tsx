import { ChevronLeft, ChevronDown, PlayCircle, BookOpen, Home, MessageSquare, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { TEMARI_DETALL } from "../../../../constants/temari";

// Explicació per a no-programadors: Importem la mateixa imatge que fem servir a la pàgina de la web de les proves teòriques per mantenir una línia estètica idèntica
// @ts-ignore
import fonsTeorica from "../../../../assets/images/fons_teorica_1780343152615.png";

/**
 * PANTALLA: ClassesPremiumInici
 * Pantalla que permet seleccionar classes premium organitzades per blocs i temes.
 */
export default function ClassesPremiumInici({ 
  onTornar,
  onSeleccionarClasse,
  onAnarSeccio,
  onAnarInici
}: { 
  onTornar: () => void,
  onSeleccionarClasse: (info: { bloc: string, tema: string, subtema: string }) => void,
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void,
  onAnarInici?: () => void
}) {
  
  // Estats per controlar quins desplegables estan oberts
  const [blocObert, setBlocObert] = useState<string | null>(null);
  const [temaObert, setTemaObert] = useState<string | null>(null);

  // Explicació per a no-programadors: Estat d'àvatar escollit per l'alumne o estudiant, obtingut de la memòria local per a major coherència.
  const [avatarEstil, setAvatarEstil] = useState<string>("👮‍♂️");

  useEffect(() => {
    try {
      const deLocalStorage = localStorage.getItem("avatar_estil");
      if (deLocalStorage) {
        setAvatarEstil(deLocalStorage);
      }
    } catch {
      setAvatarEstil("👮‍♂️");
    }
  }, []);

  // Mapatge dels noms dels blocs
  const blocs = [
    { id: 'A', nom: 'BLOC A' },
    { id: 'B', nom: 'BLOC B' },
    { id: 'C', nom: 'BLOC C' }
  ];

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#010915] overflow-y-auto pb-32 px-6" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* Explicació per a no-programadors: Fons oficial amb l'imatge d'OposiTeòrica i un elegant gradient a sobre */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-full">
        <img 
          src={fonsTeorica} 
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#010915]/90 via-[#010915]/85 to-[#010915]" />
      </div>

      <div className="relative z-10 w-full max-w-lg md:max-w-4xl flex flex-col items-center">
        {/* CAPÇALERA */}
        <header className="pt-14 w-full flex flex-col items-center shrink-0 text-center mb-4 relative">
          
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
        <main className="w-full flex flex-col gap-4 py-4 md:py-10">
          
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
                                  className="w-full p-3 rounded-lg flex items-center gap-3 hover:bg-white/5 group transition-all text-left animate-in fade-in duration-200"
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

      {/* Comentari planer per a no-programadors: Barra inferior de botons corporatius adaptada per a l'estètica fosca d'avui */}
      {onAnarSeccio && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-45 bg-[#010915]/95 backdrop-blur-md border-t border-white/10 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-300"
          style={{ paddingBottom: "calc(5px + env(safe-area-inset-bottom, 6px))" }}
        >
          <div className="w-full max-w-md grid grid-cols-4 gap-1">
            
            {/* Botó 1: Casa (retorna a l'inici de Mossos) */}
            <button 
              onClick={onAnarInici || onTornar}
              className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
            >
              <Home className="w-6 h-6 transition-all group-hover:scale-115 text-slate-300 group-hover:text-white" />
              <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
                Inici
              </span>
            </button>

            {/* Botó 2: Fòrum */}
            <button 
              onClick={() => onAnarSeccio('forum')}
              className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
            >
              <div className="relative">
                <MessageSquare className="w-6 h-6 transition-all group-hover:scale-115 text-pink-400/60 group-hover:text-pink-400" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75 font-bold"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
              </div>
              <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
                Fòrum 💬
              </span>
            </button>

            {/* Botó 3: Notícies */}
            <button 
              onClick={() => onAnarSeccio('noticies')}
              className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
            >
              <div className="relative">
                <Bell className="w-6 h-6 transition-all group-hover:scale-115 text-white/60 group-hover:text-white" />
              </div>
              <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
                Notícies
              </span>
            </button>

            {/* Botó 4: Perfil */}
            <button 
              onClick={() => onAnarSeccio('perfil')}
              className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
            >
              <div className="relative">
                <span className="text-[20px] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
                  {avatarEstil}
                </span>
              </div>
              <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
                Perfil
              </span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
