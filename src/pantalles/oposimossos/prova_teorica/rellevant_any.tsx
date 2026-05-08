import { ChevronLeft, Info, Star, ShieldCheck, MapPin } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: RellevantAny
 * Mostra els esdeveniments i dades més importants de l'últim any per a l'oposició.
 */
export default function RellevantAny({ onTornar }: { onTornar: () => void }) {
  
  // Resum de fets rellevants de l'últim any (context simulat 2025-2026)
  const fetsRellevants = [
    {
      id: 1,
      mes: "Gener",
      titol: "Nova convocatòria d'accés a Mossos d'Esquadra",
      descripcio: "S'anuncia la convocatòria més gran de la dècada amb 900+ places, consolidant el creixement del cos cap als 22.000 agents.",
      impacte: "Alta"
    },
    {
      id: 2,
      mes: "Març",
      titol: "Actualització del reglament d'armes a nivell estatal",
      descripcio: "Canvis significatius en les llicències de tipus C i la tinença d'armes per a personal de seguretat privada.",
      impacte: "Mitjana"
    },
    {
      id: 3,
      mes: "Abril",
      titol: "Acord pel finançament singular de Catalunya",
      descripcio: "Inici de les negociacions per a la gestió plena dels tributs, un tema recurrent en les proves d'actualitat política.",
      impacte: "Alta"
    },
    {
      id: 4,
      mes: "Juny",
      titol: "Desplegament total de la Policia Marítima dels Mossos",
      descripcio: "El cos assumeix competències plenes en aigües interiors i vigilància de la costa catalana.",
      impacte: "Alta"
    },
    {
      id: 5,
      mes: "Agost",
      titol: "Llei de mesures contra la multireincidència",
      descripcio: "Reforma del Codi Penal per endurir les penes en furts i delictes lleus reincidents, clau per a la seguretat ciutadana.",
      impacte: "Molt Alta"
    },
    {
      id: 6,
      mes: "Octubre",
      titol: "Celebració del 30è aniversari del desplegament a Barcelona",
      descripcio: "Actes institucionals que repassen la història i l'evolució del cos en la capital catalana.",
      impacte: "Mitjana"
    },
    {
      id: 7,
      mes: "Desembre",
      titol: "Informe sobre ciberdelinqüència a Catalunya 2025",
      descripcio: "Les estafes digitals ja representen el 30% dels delictes denunciats, obligant a reforçar les unitats d'investigació.",
      impacte: "Alta"
    },
    {
      id: 8,
      mes: "Febrer",
      titol: "Pla Estratègic Mossos 2030",
      descripcio: "Presentació del full de ruta per a la digitalització total i l'ús de drons en seguretat ciutadana.",
      impacte: "Alta"
    }
  ];

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white">
      
      {/* CAPÇALERA */}
      <header className="w-full p-6 flex flex-col gap-6 shrink-0 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={onTornar}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-amber-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Resum de l'Any</span>
            <h1 className="text-white text-base font-black uppercase italic tracking-tight">
              Fets <span className="text-emerald-400">Rellevants</span>
            </h1>
          </div>
        </div>
      </header>

      {/* LLISTA DE FETS */}
      <main className="w-full max-w-md md:max-w-6xl px-6 flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-x-10 md:gap-y-12 md:py-8">
        {fetsRellevants.map((fet, index) => (
          <motion.div
            key={fet.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative bg-white/5 border border-white/10 rounded-[2.5rem] p-6 pt-8 md:p-10 md:pt-12 shadow-xl"
          >
            {/* Etiqueta de mes flotant */}
            <div className="absolute -top-3 left-8 bg-emerald-500 text-[#00274d] px-4 py-1.5 rounded-full font-black italic uppercase text-[10px] md:text-sm tracking-widest shadow-lg shadow-emerald-500/20">
              {fet.mes}
            </div>

            <div className="flex flex-col gap-3 md:gap-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-white font-black italic uppercase tracking-tight text-sm md:text-xl leading-tight pr-4">
                  {fet.titol}
                </h2>
                <div className="shrink-0 flex flex-col items-end gap-1">
                   <div className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <Star key={i} size={8} className={i < (fet.impacte === 'Molt Alta' ? 3 : fet.impacte === 'Alta' ? 2 : 1) ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                      ))}
                   </div>
                   <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] opacity-30 italic">Impacte</span>
                </div>
              </div>
              
              <div className="h-px w-full bg-white/5" />
              
              <p className="text-white/60 text-xs md:text-lg leading-relaxed font-medium">
                {fet.descripcio}
              </p>

              <div className="flex items-center gap-2 mt-1 py-2 px-3 bg-white/5 rounded-2xl w-fit">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-emerald-400/80">Confirmat per ISPC</span>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="mt-8 bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center gap-4 text-center md:col-span-2">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-amber-400">
               <Info size={24} />
            </div>
            <div className="flex flex-col gap-2">
               <span className="text-xs font-black italic uppercase tracking-widest">Atenció aspirant</span>
               <p className="text-[11px] text-white/50 leading-relaxed max-w-[200px] mx-auto">
                 L'ISPC posa especial èmfasi en el coneixement de la realitat social i institucional de Catalunya de l'últim any.
               </p>
            </div>
        </div>
      </main>

    </div>
  );
}
