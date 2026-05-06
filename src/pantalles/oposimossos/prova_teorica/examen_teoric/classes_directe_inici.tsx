import { ChevronLeft, Calendar, Clock, Bell, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

/**
 * PANTALLA: ClassesDirecteInici
 * Mostra el calendari de les properes classes en directe.
 * Aquesta pantalla és informativa i permet configurar avisos.
 */
export default function ClassesDirecteInici({ onTornar }: { onTornar: () => void }) {
  
  // Estat per controlar quin menú d'avisos està obert (pels índexs de les classes)
  const [avisObertIdx, setAvisObertIdx] = useState<number | null>(null);
  
  // Estat per desar la preferència d'avís de cada classe (per defecte 'no')
  const [preferencies, setPreferencies] = useState<Record<number, string>>({});

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
    <div className="flex min-h-screen w-full flex-col items-center pb-12 px-6 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA DE LA PANTALLA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 text-center mb-8">
        <div className="bg-emerald-500/10 backdrop-blur-md px-8 py-4 rounded-3xl shadow-xl border border-emerald-500/20">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            <span className="text-white">Classes en </span>
            <span className="text-emerald-400">Directe</span>
          </h1>
        </div>
        
        <p className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em] max-w-xs leading-relaxed">
          Connecta't en temps real amb els nostres instructors per resoldre dubtes i avançar en el temari.
        </p>
      </header>

      {/* LLISTAT DE PROPERES CLASSES (LABELS) */}
      <main className="w-full max-w-md flex flex-col gap-4">
        {properesClasses.map((clase, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-black/20 backdrop-blur-sm border ${clase.border} rounded-2xl p-5 flex flex-col gap-4 group relative`}
            style={{ zIndex: avisObertIdx === idx ? 100 : 1 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0">
                <p className="text-white text-xs font-black uppercase tracking-widest opacity-60">
                  Següent classe de 
                </p>
                <h3 className="text-amber-400 text-2xl font-black italic uppercase tracking-tighter leading-none mt-1">
                  {clase.bloc}
                </h3>
              </div>
              
              {/* CAMPANA D'AVISOS AMB DESPLEGABLE */}
              <div className="relative">
                <button 
                  onClick={() => setAvisObertIdx(avisObertIdx === idx ? null : idx)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    preferencies[idx] && preferencies[idx] !== 'No'
                    ? 'bg-amber-400 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
                    : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 shadow-lg'
                  }`}
                >
                  <Bell size={18} className={preferencies[idx] && preferencies[idx] !== 'No' ? 'animate-bounce' : ''} />
                </button>

                <AnimatePresence>
                  {avisObertIdx === idx && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-[#001c3d] border border-white/20 rounded-xl shadow-2xl p-2 z-[110]"
                    >
                      <p className="text-[8px] font-black uppercase text-white px-3 py-2 tracking-[0.2em]">Avisa'm</p>
                      <div className="flex flex-col gap-1">
                        {[
                          "No",
                          "La següent classe",
                          "Totes les classes del bloc"
                        ].map((opcio) => (
                          <button 
                            key={opcio}
                            onClick={() => seleccionarAvis(idx, opcio)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                              preferencies[idx] === opcio 
                              ? 'bg-white/10 text-white' 
                              : 'text-white/40 hover:bg-white/5'
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                              {opcio}
                            </span>
                            {preferencies[idx] === opcio && <Check size={12} className="text-amber-400" />}
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
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                  <Calendar size={10} className="text-white/40" />
                  <span className="text-[9px] font-bold text-white/70 uppercase">{clase.dia}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                  <Clock size={10} className="text-white/40" />
                  <span className="text-[9px] font-bold text-white/70">20:00h</span>
                </div>
              </div>
              <button className="bg-white text-black hover:bg-amber-400 transition-colors px-6 py-2 rounded-xl font-black italic uppercase text-[10px] tracking-widest shadow-lg shadow-black/20 active:scale-95">
                Entrar
              </button>
            </div>
          </motion.div>
        ))}
      </main>

      {/* FOOTER AMB EL BOTÓ DE TORNAR */}
      <footer className="mt-12">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white transition-all active:scale-95 group"
        >
          <ChevronLeft size={20} className="text-white/30 group-hover:text-white transition-colors" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">Tornar a l'examen teòric</span>
        </button>
      </footer>

    </div>
  );
}
