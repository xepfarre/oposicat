import { ChevronLeft, PlayCircle } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ClassesPremiumInici
 * Pantalla que llista les classes premium disponibles.
 */
export default function ClassesPremiumInici({ 
  onTornar,
  onSeleccionarClasse
}: { 
  onTornar: () => void,
  onSeleccionarClasse: (id: string) => void
}) {
  
  const classes = [
    { id: 'luna', titol: 'Classe de prova', autor: 'Luna', etiqueta: 'HOLA SOC EL LUNA' }
  ];

  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-6 px-10 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 text-center mb-2">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10">
          <h1 className="text-3xl font-black italic tracking-tighter select-none">
            <span className="text-white">Classes </span>
            <span className="text-red-600">Premium</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-white text-lg font-black italic tracking-tighter uppercase opacity-90">
            Contingut Exclusiu
          </h2>
          <div className="h-0.5 w-12 bg-red-600 rounded-full mb-1" />
        </div>
      </header>

      {/* LLISTAT DE CLASSES */}
      <main className="w-full max-w-2xl flex flex-col gap-4 py-8">
        {classes.map((classe) => (
          <motion.button
            key={classe.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSeleccionarClasse(classe.id)}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="p-4 bg-red-600 rounded-xl shadow-lg shadow-red-900/40 text-white transition-transform group-hover:scale-110">
                <PlayCircle size={24} />
              </div>
              <div>
                <h3 className="text-white font-black italic uppercase tracking-wider text-sm md:text-base">
                  {classe.titol}
                </h3>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">
                  Professor: {classe.autor}
                </p>
                <div className="mt-2 bg-amber-400 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded inline-block">
                  {classe.etiqueta}
                </div>
              </div>
            </div>
            <div className="text-white/20 group-hover:text-white transition-colors">
              <ChevronLeft className="rotate-180" size={24} />
            </div>
          </motion.button>
        ))}
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6 pt-6">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tornar a Exàmen Teòric</span>
        </button>
      </footer>

    </div>
  );
}
