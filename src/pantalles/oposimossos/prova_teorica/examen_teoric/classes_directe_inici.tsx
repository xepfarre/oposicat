import { ChevronLeft, Calendar, Clock, Bell, Check, Home, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

// Explicació per a no-programadors: Importem la imatge oficial de la web d'OposiTeòrica per fons visual congruent
// @ts-ignore
import fonsTeorica from "../../../../assets/images/fons_teorica_1780343152615.png";

/**
 * PANTALLA: ClassesDirecteInici
 * Mostra el calendari de les properes classes en directe.
 * Aquesta pantalla és informativa i permet configurar avisos.
 */
export default function ClassesDirecteInici({ 
  onTornar,
  onAnarSeccio,
  onAnarInici
}: { 
  onTornar: () => void,
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void,
  onAnarInici?: () => void
}) {
  
  // Estat per controlar quin menú d'avisos està obert (pels índexs de les classes)
  const [avisObertIdx, setAvisObertIdx] = useState<number | null>(null);
  
  // Estat per desar la preferència d'avís de cada classe (per defecte 'no')
  const [preferencies, setPreferencies] = useState<Record<number, string>>({});

  // Explicació per a no-programadors: Estat d'àvatar escollit per l'usuari/estudiant de la memòria local.
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

  // Llista de les properes classes segons la petició de l'usuari
  const properesClasses = [
    { bloc: 'Bloc A', dia: 'Dilluns', color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { bloc: 'Bloc B', dia: 'Dimarts', color: 'text-blue-400', border: 'border-blue-500/30' },
    { bloc: 'Bloc C', dia: 'Dimecres', color: 'text-purple-400', border: 'border-purple-500/30' },
    { bloc: 'Psicotècnics', dia: 'Dijous', color: 'text-amber-400', border: 'border-amber-500/30' }
  ];

  /**
   * Canvia la preferència d'avís per a una classe concreta
   */
  const seleccionarAvis = (idx: number, opcio: string) => {
    setPreferencies(prev => ({ ...prev, [idx]: opcio }));
    setAvisObertIdx(null); // Tanquem el menú en seleccionar
  };

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#010915] overflow-y-auto pb-32 px-6" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* Explicació per a no-programadors: Capa decorativa d'imatge de fons corporativa en qualitat professional */}
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
              Classes en Directe
            </h2>
            <div className="w-12 h-1 bg-red-600 rounded-full" />
          </div>
          
          {/* LABEL GRIS PERSONALITZAT */}
          <div className="max-w-md bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
            <p className="text-slate-400 text-[11px] font-bold tracking-tight leading-relaxed text-center">
              Disfruta de les classes que fem cada setmana dels 3 blocs de temari i del temari psicotècnic. 
              Si vols veure tema a tema clases en la maxima qualitat entra a 
              <span className="text-amber-400 underline ml-1 font-black">Clases Premium</span>.
            </p>
          </div>
        </header>

        {/* LLISTAT DE PROPERES CLASSES (LABELS) */}
        <main className="w-full flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8">
          {properesClasses.map((clase, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-black/20 backdrop-blur-sm border ${clase.border} rounded-2xl p-5 md:p-8 flex flex-col gap-4 group relative`}
              style={{ zIndex: avisObertIdx === idx ? 100 : 1 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0">
                  <p className="text-white text-xs md:text-sm font-black uppercase tracking-widest opacity-60">
                    Següent classe de 
                  </p>
                  <h3 className="text-amber-400 text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none mt-1">
                    {clase.bloc}
                  </h3>
                </div>
                
                {/* CAMPANA D'AVISOS AMB DESPLEGABLE */}
                <div className="relative">
                  <button 
                    onClick={() => setAvisObertIdx(avisObertIdx === idx ? null : idx)}
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                      preferencies[idx] && preferencies[idx] !== 'No'
                      ? 'bg-amber-400 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                      : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 shadow-lg'
                    }`}
                  >
                    <Bell size={18} className={`md:size-6 ${preferencies[idx] && preferencies[idx] !== 'No' ? 'animate-bounce' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {avisObertIdx === idx && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 10 }}
                        className="absolute right-0 mt-2 w-56 md:w-72 bg-[#001c3d] border border-white/20 rounded-xl shadow-2xl p-2 z-[110]"
                      >
                        <p className="text-[8px] md:text-xs font-black uppercase text-white px-3 py-2 tracking-[0.2em]">Avisa'm</p>
                        <div className="flex flex-col gap-1">
                          {[
                            "No",
                            "La següent classe",
                            "Totes les classes del bloc"
                          ].map((opcio) => (
                            <button 
                              key={opcio}
                              onClick={() => seleccionarAvis(idx, opcio)}
                              className={`flex items-center justify-between px-3 py-2.5 md:py-4 rounded-lg transition-all text-left ${
                                preferencies[idx] === opcio 
                                ? 'bg-white/10 text-white' 
                                : 'text-white/40 hover:bg-white/5'
                              }`}
                            >
                              <span className="text-[10px] md:text-sm font-bold uppercase tracking-tight">
                                {opcio}
                              </span>
                              {preferencies[idx] === opcio && <Check size={12} className="text-amber-400 md:size-4" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 md:px-4 md:py-2 bg-white/5 rounded-lg border border-white/10">
                    <Calendar size={10} className="text-white/40 md:size-4" />
                    <span className="text-[9px] md:text-sm font-bold text-white/70 uppercase">{clase.dia}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 md:px-4 md:py-2 bg-white/5 rounded-lg border border-white/10">
                    <Clock size={10} className="text-white/40 md:size-4" />
                    <span className="text-[9px] md:text-sm font-bold text-white/70">20:00h</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (clase.bloc === 'Bloc A') {
                      window.open('https://meet.google.com/vux-apjg-vmv', '_blank');
                    } else if (clase.bloc === 'Bloc B') {
                      window.open('https://meet.google.com/zmw-cqmr-fyx', '_blank');
                    } else if (clase.bloc === 'Bloc C') {
                      window.open('https://meet.google.com/xyj-kvxf-hhf', '_blank');
                    } else if (clase.bloc === 'Psicotècnics') {
                      window.open('https://meet.google.com/vnm-bppt-thj', '_blank');
                    }
                  }}
                  className="bg-white text-black hover:bg-amber-400 transition-colors px-6 py-2 md:px-10 md:py-4 rounded-xl font-black italic uppercase text-[10px] md:text-sm tracking-widest shadow-lg shadow-black/20 active:scale-95"
                >
                  Entrar
                </button>
              </div>
            </motion.div>
          ))}
        </main>
      </div>

      {/* Comentari planer per a no-programadors: Menu corporatiu persistent inferior adaptat amb color corporatiu d'OposiCatalunya */}
      {onAnarSeccio && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-45 bg-[#010915]/95 backdrop-blur-md border-t border-white/10 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-300"
          style={{ paddingBottom: "calc(5px + env(safe-area-inset-bottom, 6px))" }}
        >
          <div className="w-full max-w-md grid grid-cols-4 gap-1">
            
            {/* Botó 1: Casa */}
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
