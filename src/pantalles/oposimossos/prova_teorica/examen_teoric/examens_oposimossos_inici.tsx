import { useState } from "react";
import { ChevronLeft, BarChart3, Target, AlertTriangle } from "lucide-react";

/**
 * PANTALLA: ExamensOposimossosInici
 * Pantalla de selecció d'exàmens per blocs i subtemes.
 * Basat en el disseny "Paint" enviat per l'usuari.
 */

export default function ExamensOposimossosInici({ 
  onTornar, 
  onComencar 
}: { 
  onTornar: () => void;
  onComencar: (num: number, temps: string, seleccions: { [key: string]: number[] }) => void;
}) {
  // Estats per a la selecció de l'usuari
  const [tab, setTab] = useState<'errades' | 'examen'>('examen');
  const [seleccions, setSeleccions] = useState<{ [key: string]: number[] }>({
    A: [],
    B: [],
    C: []
  });

  // Estats per al Modal de configuració
  const [showConfig, setShowConfig] = useState(false);
  const [numPreguntes, setNumPreguntes] = useState<number>(30);
  const [temps, setTemps] = useState<string>('45');

  // Dades de la estructura del temari (Blocks)
  const BLOCS = [
    { id: 'A', nom: 'Bloc A', temes: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
    { id: 'B', nom: 'Bloc B', temes: [1, 2, 3, 4, 5, 6, 7] },
    { id: 'C', nom: 'Bloc C', temes: [1, 2, 3, 4, 5] },
  ];

  // Funció per toggle de tema
  const toggleTema = (blocId: string, tema: number) => {
    setSeleccions(prev => {
      const actuals = prev[blocId];
      if (actuals.includes(tema)) {
        return { ...prev, [blocId]: actuals.filter(t => t !== tema) };
      } else {
        return { ...prev, [blocId]: [...actuals, tema] };
      }
    });
  };

  // Funció per seleccionar tots els d'un bloc
  const toggleTots = (blocId: string, totsTemes: number[]) => {
    setSeleccions(prev => {
      const actuals = prev[blocId];
      if (actuals.length === totsTemes.length) {
        return { ...prev, [blocId]: [] };
      } else {
        return { ...prev, [blocId]: [...totsTemes] };
      }
    });
  };

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20">
      
      {/* HEADER */}
      <header className="pt-12 w-full flex flex-col items-center gap-6 pb-6 shadow-2xl">
        <div className="relative w-full flex items-center justify-center max-w-4xl">
          <button 
            onClick={onTornar}
            className="absolute left-0 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="bg-black/30 px-6 py-2 rounded-2xl border border-white/10">
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">
              Exàmens OposiMossos
            </h1>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md flex flex-col gap-8 mt-4">
        
        {/* SECCIÓ ESTADÍSTIQUES (Estil Paint interpretat) */}
        <section className="flex flex-col gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-black italic uppercase tracking-widest text-white/40 flex items-center gap-2">
              <BarChart3 size={14} className="text-emerald-400" />
              Total preguntes
            </span>
            <div className="flex items-center gap-2 font-black italic text-xl">
              <span className="text-emerald-400">100</span>
              <span className="text-white/20">-</span>
              <span className="text-red-500">219</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Target size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Millor tema</span>
                <span className="text-sm font-bold text-white/80 italic">Bloc A. 3 (Història de Catalunya)</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Necessita millorar</span>
                <span className="text-sm font-bold text-white/80 italic">Bloc B. 5 (La Corona)</span>
              </div>
            </div>
          </div>
        </section>

        {/* TABS (Preguntes Errades | Examen) */}
        <div className="flex w-full bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button 
            onClick={() => setTab('errades')}
            className={`flex-1 py-3 rounded-xl font-black italic uppercase text-[10px] tracking-widest transition-all ${
              tab === 'errades' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-white/30 hover:text-white/60'
            }`}
          >
            Preguntes errades
          </button>
          <button 
            onClick={() => setTab('examen')}
            className={`flex-1 py-3 rounded-xl font-black italic uppercase text-[10px] tracking-widest transition-all ${
              tab === 'examen' ? 'bg-emerald-500 text-[#00274d] shadow-lg shadow-emerald-500/20' : 'text-white/30 hover:text-white/60'
            }`}
          >
            Examen
          </button>
        </div>

        {/* SELECCIÓ DE BLOCS I TEMES */}
        <div className="flex flex-col gap-4">
          {BLOCS.map(bloc => (
            <div key={bloc.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black italic uppercase text-lg text-white/80 tracking-tighter">
                  {bloc.nom}
                </h3>
                <button 
                  onClick={() => toggleTots(bloc.id, bloc.temes)}
                  className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                    seleccions[bloc.id].length === bloc.temes.length
                    ? 'bg-yellow-400 border-yellow-400 text-[#00274d]'
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                  }`}
                >
                  Tots
                </button>
              </div>

              <div className="flex flex-wrap gap-1 md:gap-1.5">
                {bloc.temes.map(tema => (
                  <button 
                    key={tema}
                    onClick={() => toggleTema(bloc.id, tema)}
                    className={`w-8 h-8 md:w-9 md:h-9 rounded-lg border flex items-center justify-center font-bold text-[10px] md:text-xs transition-all ${
                      seleccions[bloc.id].includes(tema)
                      ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-lg shadow-yellow-400/5'
                      : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20 hover:text-white/60'
                    }`}
                  >
                    {tema}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓ COMENÇAR - Obre el modal de configuració */}
        <button 
          onClick={() => setShowConfig(true)}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-[#00274d] rounded-3xl py-6 font-black italic uppercase tracking-[0.3em] text-lg shadow-2xl shadow-yellow-400/20 active:scale-95 transition-all mt-4 border-b-4 border-yellow-600"
        >
          Començar
        </button>

      </main>

      {/* MODAL DE CONFIGURACIÓ (Pop-up) */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pb-20">
          <div className="absolute inset-0 bg-[#001a33]/90 backdrop-blur-md" onClick={() => setShowConfig(false)} />
          
          <div className="relative w-full max-w-xs bg-[#00274d] border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            {/* Preguntes */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-black italic uppercase tracking-[0.2em] text-emerald-400 text-center">
                Quantes preguntes vols?
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[10, 30, 100].map((n) => (
                  <button 
                    key={n}
                    onClick={() => setNumPreguntes(n)}
                    className={`py-2.5 rounded-xl font-black italic border transition-all flex items-center justify-center gap-2 text-sm ${
                      numPreguntes === n 
                      ? "bg-yellow-400 border-yellow-400 text-[#00274d] scale-[1.02] shadow-lg shadow-yellow-400/20" 
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {n} {n === 30 && <span className="text-[7px] opacity-70 uppercase tracking-tighter">(Oficial)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Temps */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-black italic uppercase tracking-[0.2em] text-emerald-400 text-center">
                Quant de temps vols?
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { label: '10 minuts', val: '10' },
                  { label: '45 minuts', val: '45', official: true },
                  { label: 'Indefinit', val: 'inf' }
                ].map((t) => (
                  <button 
                    key={t.val}
                    onClick={() => setTemps(t.val)}
                    className={`py-2.5 rounded-xl font-black italic border transition-all flex items-center justify-center gap-2 text-sm ${
                      temps === t.val 
                      ? "bg-white/20 border-white/30 text-white scale-[1.02] shadow-lg shadow-white/10" 
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {t.label} {t.official && <span className="text-[7px] text-yellow-400 uppercase tracking-tighter">(Oficial)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Botó final */}
            <button 
              onClick={() => {
                setShowConfig(false);
                onComencar(numPreguntes, temps, seleccions);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#00274d] rounded-xl py-4 font-black italic uppercase tracking-[0.2em] text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              Comença
            </button>
            
          </div>
        </div>
      )}

      <footer className="mt-12 opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">
          OposiMossos • Sistema d'Exàmens
        </p>
      </footer>

    </div>
  );
}
