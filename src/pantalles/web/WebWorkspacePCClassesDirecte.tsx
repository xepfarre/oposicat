import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Bell, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Video, 
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';

// Explicació per a no-programadors:
// Definim la interfície dels paràmetres (Props) que rep el nostre component d'escriptori.
// D'aquesta manera garantim una connexió estable, fluida i sense errors amb el panell principal (WebWorkspacePC).
interface PropsClassesDirecte {
  onTornar?: () => void;
}

export default function WebWorkspacePCClassesDirecte({ onTornar }: PropsClassesDirecte) {
  // Explicació per a no-programadors:
  // Estats per controlar quins desplegables d'avisos (campana de notificacions) estan actius.
  const [avisObertIdx, setAvisObertIdx] = useState<number | null>(null);
  
  // Explicació per a no-programadors:
  // Estem desant les preferències de l'alumne a nivell de sessió/local per quan vulgui rebre un correu o alerta de fons.
  // Per defecte les activem totes perquè des d'un inici facin el bonic parpelleig grog que agrada a l'opositor.
  const [preferencies, setPreferencies] = useState<Record<number, string>>({
    0: "Totes les sessions del bloc",
    1: "Totes les sessions del bloc",
    2: "Totes les sessions del bloc",
    3: "Totes les sessions del bloc"
  });

  // Llista de classes oficials en directe de Mossos programades per l'acadèmia.
  // Explicació per a no-programadors: Hem canviat el títol perquè surti com a temes numèrics del 1 al 9 ("Tema 1", "Tema 2" ...)
  // i l'hora porti un espai "20:00 h" seguint el que ha demanat el client.
  const properesClasses = [
    { 
      bloc: 'Bloc A', 
      titol: 'Tema 1 - Dret Constitucional i Estatut de Catalunya',
      dia: 'Dilluns', 
      hora: '20:00 h',
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/40',
      badgeBg: 'bg-emerald-500/15',
      professor: 'Sotsinspector Carles',
      link: 'https://meet.google.com/vux-apjg-vmv'
    },
    { 
      bloc: 'Bloc B', 
      titol: 'Tema 2 - Història de la Policia i Seguretat de Catalunya',
      dia: 'Dimarts', 
      hora: '20:00 h',
      color: 'text-blue-400', 
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      hoverBorder: 'hover:border-blue-500/40',
      badgeBg: 'bg-blue-500/15',
      professor: 'Mosso Guillem',
      link: 'https://meet.google.com/zmw-cqmr-fyx'
    },
    { 
      bloc: 'Bloc C', 
      titol: 'Tema 3 - Codi Penal, Detencions i Ètica Policial',
      dia: 'Dimecres', 
      hora: '20:00 h',
      color: 'text-purple-400', 
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/20',
      hoverBorder: 'hover:border-purple-500/40',
      badgeBg: 'bg-purple-500/15',
      professor: 'Sergent Roger',
      link: 'https://meet.google.com/xyj-kvxf-hhf'
    },
    { 
      bloc: 'Psicotècnics', 
      titol: 'Tema 4 - Pràctica de Figures Espacials i Sèries Numèriques',
      dia: 'Dijous', 
      hora: '20:00 h',
      color: 'text-amber-400', 
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      hoverBorder: 'hover:border-amber-500/40',
      badgeBg: 'bg-amber-500/15',
      professor: 'Psicòloga Laura',
      link: 'https://meet.google.com/vnm-bppt-thj'
    }
  ];

  // Funció per configurar l'avís de la campana de forma interactiva
  const seleccionarAvis = (idx: number, opcio: string) => {
    setPreferencies(prev => ({ ...prev, [idx]: opcio }));
    setAvisObertIdx(null);
  };

  return (
    <div className="bg-slate-950/45 backdrop-blur-lg border border-slate-850 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 w-full text-left animate-in fade-in duration-300 pointer-events-auto">
      
      {/* CAPÇALERA DE CLASSES EN DIRECTE */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block" />
            <span className="text-[9px] font-black uppercase text-red-500 tracking-wider bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20">
              EMISSIÓ EN DIRECTE
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-black italic uppercase text-white tracking-widest leading-none text-left">
            🎬 CLASSES EN DIRECTE
          </h1>
          <p className="text-xs text-slate-400 font-bold max-w-2xl leading-relaxed text-left">
            Connecta't en viu de dilluns a dijous per consolidar el temari oficial, polir tècniques d'examen i resoldre els teus dubtes a l'instant amb l'equip d'instructors.
          </p>
        </div>
      </div>

      {/* BANNER REFORMAT D'ALERTA O CONSELL ACADÈMIC */}
      <div className="p-5 bg-slate-900/60 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 text-left relative z-10 max-w-3xl">
          <span className="text-[8.5px] bg-[#00f296]/15 text-[#00f296] font-black px-2 py-0.5 rounded uppercase tracking-widest inline-block">
            AVÍS DE L'INSTRUCTOR
          </span>
          <h4 className="text-xs font-black italic text-white uppercase mt-1">SESSIONS SETMANALS DE RESOLUCIÓ DE DUBTES</h4>
          <p className="text-[11.5px] text-slate-350 leading-relaxed font-semibold">
            Cada setmana repassem en comunitat els tres blocs del temari oficial i la preparació de psicotècnics. Recorda que si prefereixes estudiar de manera completament lliure, pas a pas i al teu propi ritme, tens disponible la biblioteca a l'àrea de <span className="text-yellow-400 font-bold underline">Classes Enregistrades</span> del menú lateral.
          </p>
        </div>
      </div>

      {/* LLISTAT DE PROPERES CLASSES (GRID PREMIUM ESCRIPTORI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {properesClasses.map((clase, idx) => {
          const teAlerta = preferencies[idx] && preferencies[idx] !== "No";
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`bg-slate-900/25 backdrop-blur-sm border ${clase.border} ${clase.hoverBorder} p-6 md:p-8 rounded-[24px] flex flex-col justify-between gap-6 relative group transition-all duration-300`}
            >
              <div className="flex flex-col gap-4">
                
                {/* Explicació per a no-programadors: Títols més grans i distribució al 50%-50% amb el nom de l'instructor com demana el client */}
                <div className="border-b border-white/5 pb-3">
                  <div className="flex flex-row items-center justify-between gap-2.5">
                    <span className={`text-[11px] md:text-sm font-black uppercase ${clase.color} ${clase.badgeBg} border ${clase.border} px-3.5 py-1 bg-slate-950/40 rounded-xl tracking-wider text-left block w-1/2`}>
                      {clase.bloc}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider text-right block w-1/2">
                      INSTRUCTOR: <span className="text-white font-extrabold">{clase.professor}</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-white text-base md:text-lg font-black italic uppercase tracking-wider leading-snug text-left">
                    {clase.titol}
                  </h3>
                </div>
              </div>

              {/* DETAILS DE DIA I HORA + ENLLAÇ GOOGLE MEET */}
              {/* Explicació per a no-programadors: Forcem flex-nowrap i whitespace-nowrap perquè els detalls de dia i hora apareguin sempre en una sola línia neta sense trencar-se. */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 flex-nowrap shrink-0 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/50 rounded-xl border border-white/5 text-[11px] font-semibold text-slate-300 whitespace-nowrap shrink-0">
                    <Calendar size={12} className="text-slate-500 shrink-0" />
                    <span className="whitespace-nowrap">Cada {clase.dia}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/50 rounded-xl border border-white/5 text-[11px] font-semibold text-slate-300 whitespace-nowrap shrink-0">
                    <Clock size={12} className="text-slate-500 shrink-0" />
                    <span className="whitespace-nowrap">{clase.hora}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  
                  {/* BOTÓ INTERACTIU DE CAMPANA DE NOTIFICACIONS */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setAvisObertIdx(avisObertIdx === idx ? null : idx)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                        teAlerta
                          ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.2)] animate-pulse'
                          : 'bg-slate-950 border-white/5 text-slate-550 hover:text-slate-300 hover:border-white/10'
                      }`}
                      title="Configurar avís d'estudi"
                    >
                      <Bell size={16} />
                    </button>

                    <AnimatePresence>
                      {avisObertIdx === idx && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                          className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-md"
                        >
                          <p className="text-[8.5px] font-black uppercase text-slate-400 px-3 py-2 tracking-[0.2em]">Configurar Avís</p>
                          <div className="flex flex-col gap-0.5">
                            {[
                              "No avisar",
                              "La propera classe",
                              "Totes les sessions del bloc"
                            ].map((opcio) => {
                              const actiu = (opcio === "No avisar" && !teAlerta) || (opcio === "La propera classe" && preferencies[idx] === "La propera classe") || (opcio === "Totes les sessions del bloc" && preferencies[idx] === "Totes les sessions del bloc");
                              return (
                                <button 
                                  key={opcio}
                                  onClick={() => seleccionarAvis(idx, opcio === "No avisar" ? "No" : opcio)}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left ${
                                    actiu 
                                      ? 'bg-white/10 text-white font-extrabold' 
                                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <span className="text-[10px] font-bold uppercase tracking-tight">
                                    {opcio}
                                  </span>
                                  {actiu && <Check size={11} className="text-yellow-400 stroke-[3]" />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={() => window.open(clase.link, '_blank', 'noopener,noreferrer')}
                    className="bg-white hover:bg-red-500 text-slate-950 hover:text-white transition-all duration-300 px-5 py-2.5 rounded-xl font-black italic uppercase text-[10px] tracking-widest shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Video size={12} className="stroke-[3]" />
                    <span>Entrar directe</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
