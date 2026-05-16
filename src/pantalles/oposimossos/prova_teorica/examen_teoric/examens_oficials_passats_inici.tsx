import { useState } from "react";
import { ChevronLeft, BarChart3, RefreshCw, ChevronDown, ChevronUp, FileText } from "lucide-react";

/**
 * PANTALLA: ExamensOficialsPassatsInici
 * Pantalla de selecció d'exàmens oficials d'anys anteriors.
 */

export default function ExamensOficialsPassatsInici({ 
  onTornar, 
  onComencar 
}: { 
  onTornar: () => void;
  onComencar: (num: number, temps: string, seleccions: { [key: string]: number[] }, examenId: string) => void;
}) {
  // Estats per a la selecció de l'usuari
  const [tab, setTab] = useState<'errades' | 'examen'>('examen');
  const [examenSeleccionat, setExamenSeleccionat] = useState<number | null>(null);

  // Estats per al Modal de configuració
  const [showConfig, setShowConfig] = useState(false);
  const [numPreguntes, setNumPreguntes] = useState<number>(30);
  const [temps, setTemps] = useState<string>('45');

  // Llista d'anys oficials
  const EXAMENS_OFICIALS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full max-w-lg md:max-w-4xl flex flex-col items-center shrink-0 text-center mb-4 relative">
        
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
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-lg font-black italic tracking-widest text-white uppercase mb-1 text-center">
            Exàmens Oficials Passats
          </h2>
          <div className="w-12 h-1 bg-red-600 rounded-full" />
        </div>
      </header>

      <main className="w-full max-w-md flex flex-col gap-8 mt-4">
        
        {/* SECCIÓ ESTADÍSTIQUES */}
        <section className="flex flex-col gap-4 w-full">
          <h3 className="text-xs font-black italic uppercase tracking-widest text-white/50 ml-4 mb-[-8px]">
            Resum dels examens :
          </h3>

          {/* CONTENIDOR 1: ENCERTS | ERRADES | RESET */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-3 grid grid-cols-[1fr_1fr_64px] items-center gap-1 shadow-xl">
            <div className="flex items-center justify-center gap-2 border-r border-white/10 h-full">
              <span className="text-[9px] font-bold text-white/40 italic uppercase">Encerts:</span>
              <span className="text-xl font-black italic text-emerald-400">100</span>
            </div>

            <div className="flex items-center justify-center gap-2 border-r border-white/10 h-full">
              <span className="text-[9px] font-bold text-white/40 italic uppercase">Errades:</span>
              <span className="text-xl font-black italic text-red-500">78</span>
            </div>

            <button className="flex flex-col items-center group transition-all active:scale-90">
              <RefreshCw size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
              <span className="text-[7px] font-black italic uppercase text-white/25 text-center leading-tight">Reset</span>
            </button>
          </div>

          {/* CONTENIDOR 2: MILLOR | PITJOR EXAMEN (Canviat de tema a examen) */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-3 px-4 flex flex-col gap-1.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-white/40 italic uppercase">El meu millor examen :</span>
              <span className="text-[11px] font-black italic text-emerald-400 tracking-tight truncate max-w-[160px]">Examen 2023</span>
            </div>
            
            <div className="h-[1px] w-full bg-white/5" />

            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-white/40 italic uppercase">He de millorar en :</span>
              <span className="text-[11px] font-black italic text-red-500 tracking-tight truncate max-w-[160px]">Examen 2021</span>
            </div>
          </div>
        </section>

        {/* TABS (Exàmens | Preguntes Errades) */}
        <div className="flex w-full bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
          <button 
            onClick={() => setTab('examen')}
            className={`flex-1 py-2.5 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all ${
              tab === 'examen' 
              ? 'bg-emerald-500 text-[#00274d] shadow-lg shadow-emerald-500/20' 
              : 'text-white/30 hover:text-white/60'
            }`}
          >
            Exàmens
          </button>
          
          <button 
            onClick={() => setTab('errades')}
            className={`flex-1 py-2.5 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all ${
              tab === 'errades' 
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
              : 'text-white/30 hover:text-white/60'
            }`}
          >
            Preguntes errades
          </button>
        </div>

        {/* CONTINGUT CONDICIONAL */}
        {tab === 'examen' ? (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            <div className="text-center w-full">
              <p className="text-[10px] font-bold text-white/30 italic uppercase tracking-widest leading-relaxed">
                Selecciona l'any de l'examen que vulguis practicar!
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {EXAMENS_OFICIALS.map(any => (
                <button 
                  key={any}
                  onClick={() => setExamenSeleccionat(any)}
                  className={`w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center justify-between transition-all group shadow-xl hover:bg-white/5 ${
                    examenSeleccionat === any ? 'border-emerald-500/50 bg-emerald-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg border transition-all ${
                      examenSeleccionat === any
                      ? 'bg-emerald-500 text-[#00274d] border-emerald-500'
                      : 'bg-white/5 border-white/10 text-white/20'
                    }`}>
                      <FileText size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] font-black italic uppercase tracking-[0.2em] text-white/30 leading-none mb-1">
                        Any oficial
                      </span>
                      <h3 className="font-black italic uppercase text-sm text-white tracking-tight">
                        Examen de l'any {any}
                      </h3>
                    </div>
                  </div>
                  
                  <div className={`transition-all ${examenSeleccionat === any ? 'text-emerald-400' : 'text-white/10'}`}>
                    <ChevronDown size={20} className="-rotate-90" />
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowConfig(true)}
              disabled={!examenSeleccionat}
              className={`w-full rounded-3xl py-6 font-black italic uppercase tracking-[0.3em] text-lg shadow-2xl active:scale-95 transition-all mt-4 border-b-4 ${
                examenSeleccionat
                ? 'bg-yellow-400 hover:bg-yellow-300 text-[#00274d] shadow-yellow-400/20 border-yellow-600'
                : 'bg-white/5 text-white/10 border-white/5 cursor-not-allowed border-transparent'
              }`}
            >
              Començar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 shadow-xl text-center">
              <p className="text-sm font-bold text-white/80 italic leading-relaxed">
                Dona a <span className="text-red-400">començar</span> per tal de només practicar les preguntes que has errat! Un cop les encertis les convertires en preguntes encertades.
              </p>
            </div>

            <button 
              onClick={() => onComencar(20, 'inf', {}, 'errades')}
              className="w-full bg-red-500 hover:bg-red-400 text-white rounded-3xl py-6 font-black italic uppercase tracking-[0.3em] text-lg shadow-2xl shadow-red-500/20 active:scale-95 transition-all border-b-4 border-red-700"
            >
              Començar
            </button>
          </div>
        )}
      </main>

      {/* MODAL DE CONFIGURACIÓ */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pb-20">
          <div className="absolute inset-0 bg-[#001a33]/90 backdrop-blur-md" onClick={() => setShowConfig(false)} />
          
          <div className="relative w-full max-w-xs bg-[#00274d] border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            <div className="text-center px-4">
              <p className="text-[10px] font-bold text-white/30 italic leading-relaxed">
                " Recorda que 45 minuts i 30 preguntes el que et trobaras el dia de l'examen! "
              </p>
            </div>

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

            <button 
              onClick={() => {
                setShowConfig(false);
                onComencar(numPreguntes, temps, {}, examenSeleccionat?.toString() || '');
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
          OposiMossos • Exàmens Oficials
        </p>
      </footer>

    </div>
  );
}
