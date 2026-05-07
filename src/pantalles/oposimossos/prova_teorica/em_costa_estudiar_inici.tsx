import { ChevronLeft, Coffee, Lightbulb, Timer, BookOpen, Quote, Smile } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: EmCostaEstudiar
 * Secció de suport psicològic i tècniques d'estudi per als alumnes que passen per moments difícils.
 */
export default function EmCostaEstudiar({ onTornar }: { onTornar: () => void }) {
  
  const consells = [
    {
      titol: "El Mètode Pomodoro",
      desc: "Estudia 25 minuts i descansa 5. La teva ment necessita pauses curtes per fixar la informació.",
      icona: <Timer className="text-red-400" />
    },
    {
      titol: "Active Recall",
      desc: "En comptes de llegir el mateix cop i cop, intenta explicar-ho en veu alta com si fossis el professor.",
      icona: <Lightbulb className="text-amber-400" />
    },
    {
      titol: "Gestió dels dies dolents",
      desc: "Si avui no pots més, para. Dormir 8 hores és millor que estudiar 10 hores cansat.",
      icona: <Coffee className="text-blue-400" />
    }
  ];

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
          <span className="text-cyan-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Acompanyament Mental</span>
          <h1 className="text-white text-base font-black uppercase italic tracking-tight">
            Em costa <span className="text-red-500">Estudiar</span>
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md px-6 flex flex-col gap-8">
        
        {/* FRASE MOTIVADORA SENSE SER PESADA */}
        <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 p-8 rounded-[2.5rem] border border-cyan-500/20 shadow-2xl relative overflow-hidden">
           <Quote size={40} className="absolute -top-2 -left-2 text-cyan-500/10" />
           <p className="text-cyan-100 font-bold italic text-sm leading-relaxed text-center relative z-10">
             "L'oposició no és una carrera de 100 metres, és una marató. El que compta no és qui va més ràpid, sinó qui no deixa de caminar."
           </p>
           <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
              <Smile size={14} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">Equip OposiMossos</span>
           </div>
        </div>

        {/* SECCIÓ DE CONSELLS */}
        <section className="flex flex-col gap-4">
           <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] ml-2">Tècniques que funcionen:</h3>
           {consells.map((c, index) => (
             <motion.div 
               key={index}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.1 }}
               className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-start gap-4"
             >
                <div className="bg-white/5 p-3 rounded-2xl shrink-0">
                   {c.icona}
                </div>
                <div className="flex flex-col gap-1">
                   <h4 className="text-white font-black italic uppercase text-xs tracking-tight">{c.titol}</h4>
                   <p className="text-white/50 text-[11px] leading-relaxed font-medium">{c.desc}</p>
                </div>
             </motion.div>
           ))}
        </section>

        {/* RECURSOS EXTRA */}
        <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 flex flex-col gap-4">
           <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-emerald-400" />
              <span className="text-xs font-black italic uppercase tracking-widest">Resums i Mapes Mentals</span>
           </div>
           <p className="text-white/40 text-[10px] leading-relaxed">
             A vegades el text cansa. Si t'has encallat en un tema, prova de dibuixar-lo o fer-ne un esquema visual. Ajuda a relaxar la vista i el cervell.
           </p>
           <button className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all">
             Veure galeria de mapes mentals
           </button>
        </div>

        <p className="text-white/20 text-[9px] text-center font-medium leading-relaxed italic px-4">
          Si realment el bloqueig és molt gran, tanca els llibres, surt a caminar 20 minuts i torna-ho a intentar demà. Som humans, no màquines.
        </p>

      </main>

    </div>
  );
}
