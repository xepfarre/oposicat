import { useState, Fragment } from "react";
import { ChevronLeft, Clock, Tag, Calendar, Star } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: RellevantAny
 * Mostra els esdeveniments i dades més importants de l'últim any per a l'oposició.
 * Ara dividit per mesos i una secció de més importants.
 */
export default function RellevantAny({ onTornar }: { onTornar: () => void }) {
  const [view, setView] = useState<'list' | 'news'>('list');
  const [selectedTitle, setSelectedTitle] = useState('');

  const mesos = [
    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny", 
    "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
  ];

  // Generem dades de prova per a cada categoria (Important + 12 mesos)
  const getMockNoticies = (titol: string) => {
    const isImportant = titol === "Notícies més importants de l'any";
    const mesNom = isImportant ? "Gener" : titol;
    const prefix = isImportant ? "Destacat" : "Notícia";
    
    return [
      {
        id: "n1",
        data: `20 ${mesNom}`,
        categoria: "Seguretat",
        titol: `${prefix} 1: Canvis en el codi de seguretat`,
        descripcio: "Descripció detallada del fet rellevant que ha tingut lloc en aquest període i que és clau per a l'oposició."
      },
      {
        id: "n2",
        data: `15 ${mesNom}`,
        categoria: "Política",
        titol: `${prefix} 2: Nova normativa pel cos`,
        descripcio: "Un canvi normatiu o declaració política que afecta directament al temari d'actualitat de Mossos."
      },
      {
        id: "n3",
        data: `10 ${mesNom}`,
        categoria: "Societat",
        titol: `${prefix} 3: Esdeveniment social clau`,
        descripcio: "Esdeveniment de rellevància social a Catalunya que l'aspirant ha de conèixer."
      },
      {
        id: "n4",
        data: `05 ${mesNom}`,
        categoria: "Economia",
        titol: `${prefix} 4: Pressupostos de seguretat`,
        descripcio: "Publicació de xifres o canvis en el pressupost que impacten en el sector públic."
      },
      {
        id: "n5",
        data: `01 ${mesNom}`,
        categoria: "Cultura",
        titol: `${prefix} 5: Efemèride cultural`,
        descripcio: "Manifestació cultural o efemèride important celebrada en aquest mes."
      }
    ];
  };

  const noticies = getMockNoticies(selectedTitle);

  const handleBack = () => {
    if (view === 'news') {
      setView('list');
    } else {
      onTornar();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center shrink-0 text-center mb-4 relative">
        
        {/* FILA 1: BOTÓ ENRERA + LOGO */}
        <div className="w-full flex items-center justify-center relative mb-8 px-6 max-w-4xl">
          <button 
            onClick={handleBack}
            className="absolute left-6 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg"
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
        <div className="flex flex-col items-center mb-4 px-6">
          <span className="text-amber-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">
            {view === 'list' ? "Resum de l'Any" : "Notícies del Mes"}
          </span>
          <h2 className="text-lg font-black italic tracking-widest text-white uppercase mb-1 text-center">
            {view === 'list' ? "Fets Rellevants" : selectedTitle}
          </h2>
          <div className="w-12 h-1 bg-red-600 rounded-full" />
        </div>
      </header>

      {view === 'list' ? (
        <main className="w-full max-w-md md:max-w-2xl px-6 flex flex-col gap-4 mt-4">
          
          {/* BOTÓ DESTACAT */}
          <div className="w-full flex flex-col mb-4">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2 self-start pl-2">
              L'imprescindible per l'examen
            </span>
            <button 
              onClick={() => {
                setSelectedTitle("Notícies més importants de l'any");
                setView('news');
              }}
              className="w-full bg-amber-400/10 border-amber-400/40 hover:bg-amber-400/20 border-2 rounded-xl py-6 text-amber-400 font-black italic uppercase text-[12px] md:text-lg tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
            >
              <Star size={20} className="fill-amber-400" />
              Notícies més importants de l'any
            </button>
          </div>

          <div className="w-full h-px bg-white/5 my-2" />

          {/* LLISTA DE MESOS */}
          <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2 self-start pl-2">
            El més rellevant mes a mes
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            {mesos.map((mes, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedTitle(mes);
                  setView('news');
                }}
                className="w-full bg-white/5 border-white/10 hover:bg-white/10 border rounded-xl py-4 text-white font-black italic uppercase text-[11px] md:text-sm tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar size={14} className="opacity-40" />
                {mes}
              </button>
            ))}
          </div>
        </main>
      ) : (
        <main className="w-full max-w-md md:max-w-2xl px-6 flex flex-col gap-4 mt-4">
          {noticies.map((n, index) => {
            const mostrarSeparador = index === 0 || noticies[index - 1].data !== n.data;
            
            return (
              <Fragment key={n.id}>
                {mostrarSeparador && (
                  <div className="col-span-full flex items-center gap-4 py-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] whitespace-nowrap text-amber-400">
                      {n.data.toUpperCase()}
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-8 flex flex-col gap-3 relative overflow-hidden h-fit mb-4"
                >
                  {/* Indicador lateral de categoria */}
                  <div className="absolute top-0 right-0 p-3 md:p-5">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                      <Tag size={10} className="text-amber-400" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/60">{n.categoria}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <h2 className="text-sm md:text-xl font-black italic uppercase leading-tight pr-16 md:pr-24 tracking-tight">
                      {n.titol}
                    </h2>
                  </div>
                  
                  <p className="text-white/50 text-[11px] md:text-sm leading-relaxed font-medium mt-1">
                    {n.descripcio}
                  </p>

                  <div className="flex items-center gap-2 mt-2 opacity-20">
                    <Clock size={10} />
                    <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">REGISTRAT</span>
                  </div>
                </motion.div>
              </Fragment>
            );
          })}
          
          <button 
            onClick={() => setView('list')}
            className="mt-8 w-full py-4 border border-white/10 rounded-xl text-white/30 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all"
          >
            Tornar al llistat de mesos
          </button>
        </main>
      )}

    </div>
  );
}

