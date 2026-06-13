import { useState, useEffect } from "react";
import { ChevronLeft, BarChart3, RefreshCw, ChevronDown, ChevronUp, FileText, Home, MessageSquare, Bell } from "lucide-react";

// Explicació per a no-programadors: Importem la joia visual de wallpaper de la teòrica oficial d'OposiCAT
// @ts-ignore
import fonsTeorica from "../../../../assets/images/fons_teorica_1780343152615.png";

/**
 * PANTALLA: ExamensOficialsPassatsInici
 * Pantalla de selecció d'exàmens oficials d'anys anteriors.
 */

export default function ExamensOficialsPassatsInici({ 
  onTornar, 
  onComencar,
  onAnarSeccio,
  onAnarInici
}: { 
  onTornar: () => void;
  onComencar: (num: number, temps: string, seleccions: { [key: string]: number[] }, examenId: string) => void;
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void;
  onAnarInici?: () => void;
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

  // Explicació per a no-programadors: Estat per a l'àvatar persistent recuperat de memòria local.
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

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#010915] overflow-y-auto px-6 pb-32" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* Explicació per a no-programadors: Imatge de fons oficial per OposiTeòrica amb opacitat polida i ambient de nit fosca */}
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
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-lg font-black italic tracking-widest text-white uppercase mb-1 text-center">
              Exàmens Oficials Passats
            </h2>
            <div className="w-12 h-1 bg-red-600 rounded-full" />
          </div>
        </header>

        <main className="w-full flex flex-col gap-8 mt-4">
          
          {/* SECCIÓ ESTADÍSTIQUES */}
          <section className="flex flex-col gap-4 w-full">
            <h3 className="text-xs font-black italic uppercase tracking-widest text-white/50 ml-4 mb-[-8px]">
              Resum dels examens :
            </h3>

            {/* CONTENIDOR 1: ENCERTS | ERRADES | RESET */}
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-3 grid grid-cols-[1fr_1fr_64px] items-center gap-1 shadow-xl">
              <div className="flex items-center justify-center gap-2 border-r border-white/10 h-full py-1">
                <span className="text-[9px] font-bold text-white/40 italic uppercase">Encerts:</span>
                <span className="text-xl font-black italic text-emerald-400">100</span>
              </div>

              <div className="flex items-center justify-center gap-2 border-r border-white/10 h-full py-1">
                <span className="text-[9px] font-bold text-white/40 italic uppercase">Errades:</span>
                <span className="text-xl font-black italic text-red-500">78</span>
              </div>

              <button className="flex flex-col items-center justify-center h-full gap-0.5 group transition-all active:scale-90 cursor-pointer">
                <RefreshCw size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                <span className="text-[7px] font-black italic uppercase text-white/25 text-center leading-tight">Reset</span>
              </button>
            </div>

            {/* CONTENIDOR 2: MILLOR | PITJOR EXAMEN (Canviat de tema a examen) */}
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-3 px-4 flex flex-col gap-1.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/40 italic uppercase">El meu millor examen :</span>
                <span className="text-[11px] font-black italic text-emerald-400 tracking-tight truncate max-w-[180px]">Examen 2023</span>
              </div>
              
              <div className="h-[1px] w-full bg-white/5" />

              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/40 italic uppercase">He de millorar en :</span>
                <span className="text-[11px] font-black italic text-red-500 tracking-tight truncate max-w-[180px]">Examen 2021</span>
              </div>
            </div>
          </section>

          {/* TABS (Exàmens | Preguntes Errades) */}
          <div className="flex w-full bg-black/35 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
            <button 
              onClick={() => setTab('examen')}
              className={`flex-1 py-2.5 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all cursor-pointer ${
                tab === 'examen' 
                ? 'bg-emerald-500 text-[#010915] shadow-lg shadow-emerald-500/20' 
                : 'text-white/30 hover:text-white/60'
              }`}
            >
              Exàmens
            </button>
            
            <button 
              onClick={() => setTab('errades')}
              className={`flex-1 py-2.5 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all cursor-pointer ${
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
                    className={`w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center justify-between transition-all group shadow-xl hover:bg-white/5 cursor-pointer ${
                      examenSeleccionat === any ? 'border-emerald-500/50 bg-emerald-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg border transition-all ${
                        examenSeleccionat === any
                        ? 'bg-emerald-500 text-[#010915] border-emerald-500'
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
                className={`w-full rounded-3xl py-6 font-black italic uppercase tracking-[0.3em] text-lg shadow-2xl active:scale-95 transition-all mt-4 border-b-4 cursor-pointer ${
                  examenSeleccionat
                  ? 'bg-yellow-400 hover:bg-yellow-300 text-[#010915] shadow-yellow-400/20 border-yellow-600 font-extrabold'
                  : 'bg-white/5 text-white/10 border-white/5 cursor-not-allowed border-transparent'
                }`}
              >
                Començar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 text-sans">
              <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 shadow-xl text-center">
                <p className="text-xs font-bold text-white/80 italic leading-relaxed">
                  Dona a <span className="text-red-400">començar</span> per tal de només practicar les preguntes que has errat! Un cop les encertis les convertires en preguntes encertades.
                </p>
              </div>

              <button 
                onClick={() => onComencar(20, 'inf', {}, 'errades')}
                className="w-full bg-red-500 hover:bg-red-400 text-white rounded-3xl py-6 font-black italic uppercase tracking-[0.3em] text-lg shadow-2xl shadow-red-500/20 active:scale-95 transition-all border-b-4 border-red-700 cursor-pointer"
              >
                Començar
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE CONFIGURACIÓ */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pb-20">
          <div className="absolute inset-0 bg-[#010915]/90 backdrop-blur-md" onClick={() => setShowConfig(false)} />
          
          <div className="relative w-full max-w-xs bg-[#010915] border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            
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
                    className={`py-2.5 rounded-xl font-black italic border transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ${
                      numPreguntes === n 
                      ? "bg-yellow-400 border-yellow-400 text-[#010915] scale-[1.02] shadow-lg shadow-yellow-400/20 font-black" 
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
                    className={`py-2.5 rounded-xl font-black italic border transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ${
                      temps === t.val 
                      ? "bg-white/20 border-white/30 text-white scale-[1.02] shadow-lg shadow-white/10 font-bold" 
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
                onComencar(numPreguntes, temps, {}, examenSeleccionat?.toString() || "");
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#010915] rounded-xl py-4 font-black italic uppercase tracking-[0.2em] text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              Comença
            </button>
            
          </div>
        </div>
      )}

      {/* Comentari planer per a no-programadors: Barra de navegació unificada a la secció inferior persistent */}
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
