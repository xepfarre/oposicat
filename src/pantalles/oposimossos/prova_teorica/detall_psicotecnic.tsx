import { ChevronLeft, Play, ExternalLink, BookOpen, Brain } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: DetallPsicotecnic
 * Mostra l'explicació, l'exemple i els recursos d'un exercici psicotècnic.
 */
export default function DetallPsicotecnic({ 
  onTornar, 
  exercici 
}: { 
  onTornar: () => void,
  exercici: { id: string, titol: string }
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white">
      
      {/* CAPÇALERA AMB BOTÓ TORNAR I TÍTOL */}
      <header className="w-full p-6 flex items-center gap-4 shrink-0 max-w-2xl mx-auto">
        <button 
          onClick={onTornar}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col overflow-hidden">
          <span className="text-amber-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Entrenament Psicotècnic</span>
          <h1 className="text-white text-xs font-black uppercase italic tracking-tight truncate">
            {exercici.titol}
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md px-6 flex flex-col gap-6">
        
        {/* EXPLICACIÓ DE L'EXERCICI (Etiqueta groga) */}
        <section className="flex flex-col gap-2">
          <div className="bg-amber-400 text-black px-4 py-1.5 rounded-lg w-fit text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-400/20">
            Explicació de l'exercici
          </div>
          <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/10">
            <p className="text-white/70 text-xs leading-relaxed font-medium">
              Aquest tipus d'exercici avalua la teva capacitat de raonament lògic i percepció espacial. 
              Hauràs d'identificar patrons, seqüències o relacions entre diferents elements visuals per trobar la solució correcta.
            </p>
          </div>
        </section>

        {/* EXEMPLE DE L'EXERCICI */}
        <section className="flex flex-col gap-3">
          <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] ml-2">
            Exemple de l'exercici:
          </h3>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group border border-white/10"
          >
            {/* Aquí aniria la foto que ens has passat */}
            <div className="w-full aspect-video flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
               {/* Simulem la foto del dominó amb un SVG o text per ara, ja que no podem carregar binaris directament des de la meva terminal */}
               <div className="flex flex-col items-center gap-4 opacity-80">
                  <div className="flex gap-2">
                    <div className="w-10 h-16 border-2 border-black rounded p-1 flex flex-col divide-y-2 divide-black">
                      <div className="h-1/2 flex items-center justify-center font-bold">1</div>
                      <div className="h-1/2 flex items-center justify-center font-bold">3</div>
                    </div>
                    <div className="w-10 h-16 border-2 border-black rounded p-1 flex flex-col divide-y-2 divide-black">
                      <div className="h-1/2 flex items-center justify-center font-bold">2</div>
                      <div className="h-1/2 flex items-center justify-center font-bold">4</div>
                    </div>
                    <div className="w-10 h-16 border-2 border-dashed border-gray-400 rounded p-1 flex flex-col divide-y-2 divide-dashed divide-gray-400">
                      <div className="h-1/2" />
                      <div className="h-1/2" />
                    </div>
                  </div>
                  <span className="text-black/40 text-[8px] font-black uppercase tracking-widest italic">Imatge d'exemple</span>
               </div>
            </div>
          </motion.div>
        </section>

        {/* BOTONS D'ACCIÓ */}
        <div className="flex flex-col gap-3 pt-2">
          
          {/* BOTÓ REPRODUCCIÓ YT */}
          <motion.a 
            href="https://youtu.be/mrnciH-f1Kc"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-red-600 hover:bg-red-500 text-white p-3.5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-900/40 transition-all group"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
              <Play size={16} fill="currentColor" />
            </div>
            <div className="flex flex-col items-start pr-4 text-left">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Explicació en vídeo</span>
              <span className="text-sm font-black italic uppercase tracking-tighter">Vídeo de {exercici.titol}</span>
            </div>
            <ExternalLink size={14} className="ml-auto opacity-40 shrink-0" />
          </motion.a>

          {/* BOTÓ EXERCICIS PRACTICAR */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white p-5 rounded-2xl flex items-center justify-center gap-3 transition-all group"
          >
            <div className="w-8 h-8 bg-amber-400/20 rounded-full flex items-center justify-center text-amber-400">
              <Brain size={18} />
            </div>
            <span className="text-xs font-black italic uppercase tracking-widest">Exercicis per a practicar</span>
            <div className="ml-auto bg-white/10 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest opacity-50">Properament</div>
          </motion.button>

        </div>

        <p className="text-white/20 text-[9px] text-center font-medium leading-relaxed italic mt-4">
          Recorda que la constància en els psicotècnics és la clau per baixar el temps de resposta en el dia de l'examen oficial.
        </p>

      </main>

    </div>
  );
}
