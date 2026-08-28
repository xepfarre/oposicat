import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronLeft, 
  Video, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  User, 
  FileText
} from 'lucide-react';
import { TEMARI_DETALL } from '../../constants/temari';

// Explicació per a no-programadors: 
// Definim els paràmetres (Props) que rep el nostre menú de Classes Premium per a ordinador 
// per poder carregar i enllaçar correctament el progrés dels vídeos vistos i reactius.
interface PropsTemariClassesPremium {
  onTornar: () => void;
  onSeleccionarVideo: (ambit: 'A' | 'B' | 'C', temaIndex: number, subtemaIndex: number) => void;
  videosVistosLocals: Record<string, boolean>;
}

export default function WebWorkspacePCTemariClassesPremium({
  onTornar,
  onSeleccionarVideo,
  videosVistosLocals
}: PropsTemariClassesPremium) {
  
  // Explicació per a no-programadors: Àmbit de la teoria seleccionat actualment per veure les seves classes (per defecte l'Ambit A).
  const [ambitSeleccionat, setAmbitSeleccionat] = useState<'A' | 'B' | 'C'>('A');

  // Explicació per a no-programadors: Estat que ens diu quins dels temes de la llista es troben expandits per l'usuari.
  const [temesDesplegats, setTemesDesplegats] = useState<Record<string, boolean>>({});

  const toggleTema = (id: string) => {
    setTemesDesplegats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Explicació per a no-programadors: Calculem automàticament quants vídeos ha finalitzat/vist l'estudiant d'un cop d'ull.
  const statsVideos = useMemo(() => {
    const totalA = TEMARI_DETALL.A.length;
    const totalB = TEMARI_DETALL.B.length;
    const totalC = TEMARI_DETALL.C.length;

    let completatsA = 0;
    let completatsB = 0;
    let completatsC = 0;

    for (let i = 0; i < totalA; i++) {
      if (videosVistosLocals[`A_${i}`]) completatsA++;
    }
    for (let i = 0; i < totalB; i++) {
      if (videosVistosLocals[`B_${i}`]) completatsB++;
    }
    for (let i = 0; i < totalC; i++) {
      if (videosVistosLocals[`C_${i}`]) completatsC++;
    }

    return {
      A: { total: totalA, completats: completatsA, pct: Math.round((completatsA / (totalA || 1)) * 100) },
      B: { total: totalB, completats: completatsB, pct: Math.round((completatsB / (totalB || 1)) * 100) },
      C: { total: totalC, completats: completatsC, pct: Math.round((completatsC / (totalC || 1)) * 100) }
    };
  }, [videosVistosLocals]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* CAPÇALERA DE VISTA D'HOT-SPOTS DE CLASSES PREMIUM EN VERSIÓ PC */}
      {/* Explicació per a no-programadors: Aquesta capçalera conté el botó de retorn, el títol principal i l'explicació didàctica a sota de les classes premium */}
      <div className="flex flex-col gap-6 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onTornar}
            className="p-3 bg-slate-900 hover:bg-slate-850 border border-white/5 rounded-2xl active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Tornar al menú principal del campus"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
          
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-black uppercase text-red-500 tracking-wider bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
              Campus Acadèmic
            </span>
            <h1 className="text-xl md:text-2xl font-black italic uppercase text-white tracking-widest leading-none">
              Classes Premium d'OposiCAT
            </h1>
          </div>
        </div>

        {/* Explicació per a no-programadors: Caixa que contextualitza les classes enregistrades i convida l'usuari a conèixer les classes en directe amb un botó interactiu */}
        <div className="bg-red-550/5 border border-red-500/10 p-5 rounded-2xl text-xs md:text-sm text-slate-300 leading-relaxed text-left space-y-2 max-w-4xl">
          <p className="font-bold text-[#FFDF00] uppercase tracking-wider text-[11px] mb-1">
            🎬 Estudia quan vulguis, com vulguis
          </p>
          <p className="text-slate-300">
            Des d’OposiCAT sabem que no sempre és fàcil trobar el temps o el moment ideal per a les{' '}
            <button 
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-650 hover:bg-red-500 border border-red-500 hover:scale-105 text-white font-black italic uppercase tracking-widest rounded-lg text-[10px] cursor-pointer transition-all active:scale-95 mx-1"
              title="A futur obrirà les classes en directe directament"
              onClick={() => {
                // Explicació per a no-programadors: Actualment no fa res (a l'espera de ser creat a futur de forma modular)
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
              classes en directe
            </button>{' '}
            Per això, t'oferim aquesta selecció de sessions enregistrades perquè avancis al teu propi ritme, sense pressió però sense pausa. Perquè en una oposició, la clau de l'èxit és no deixar mai d'intentar-ho ni de progressar!
          </p>
        </div>
      </div>

      {/* BLOC DE CARTES BENTO DE SELECCIÓ D'ÀMBITS (A, B, C) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(['A', 'B', 'C'] as const).map((a) => {
          const stats = statsVideos[a];
          const actiu = ambitSeleccionat === a;

          return (
            <div 
              key={a}
              onClick={() => setAmbitSeleccionat(a)}
              className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4 select-none ${
                actiu 
                  ? 'bg-gradient-to-br from-red-950/20 to-slate-950 border-red-500/30' 
                  : 'bg-slate-900/40 hover:bg-slate-900/60 border-white/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    actiu ? 'bg-red-500/10 border-red-550/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    <Video size={18} />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 font-black uppercase block tracking-widest leading-none mb-0.5">ÀMBIT</span>
                    <h3 className="text-sm font-black italic uppercase text-white tracking-widest leading-none">
                      {a === 'A' ? 'A - ENtORN' : a === 'B' ? 'B - INSTItUCIONAL' : 'C - SEgUREtAt'}
                    </h3>
                  </div>
                </div>
                {actiu && <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />}
              </div>

              {/* Informació del progrés fictici de vídeos interactius */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <span>SESSIONS VISTES</span>
                  <span>{stats.pct}% Completat</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full rounded-full transition-all duration-500 bg-red-500"
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INTERFÍCIE LISTA DE SESSIONS DEL BLOC TRIAT */}
      <div className="space-y-4 bg-slate-950/25 p-5 md:p-6 rounded-3xl border border-slate-800/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <h4 className="text-xs md:text-sm font-black italic text-[#FFDF00] uppercase tracking-wider">
            🎬 Vídeos i Classes resoltes de l'ambit {ambitSeleccionat}:
          </h4>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Fes clic a qualsevol lliçó per obrir els capítols
          </span>
        </div>

        <div className="space-y-3">
          {TEMARI_DETALL[ambitSeleccionat].map((temaObj, tIdx) => {
            const vist = !!videosVistosLocals[`${ambitSeleccionat}_${tIdx}`];
            const obert = !!temesDesplegats[`${ambitSeleccionat}_${tIdx}`];

            return (
              <div 
                key={tIdx} 
                className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Capçalera del tema */}
                <div 
                  onClick={() => toggleTema(`${ambitSeleccionat}_${tIdx}`)}
                  className="p-4 flex items-center justify-between hover:bg-slate-850/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className={`w-8 h-8 rounded-xl font-black italic text-xs flex items-center justify-center border shrink-0 ${
                      vist 
                        ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      {tIdx + 1}
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] md:text-xs text-white font-bold italic uppercase tracking-wider block">
                        Tema {tIdx + 1}: {temaObj.titol}
                      </span>
                      <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">
                        {temaObj.subtemes.length} Sessions de Video-Aprenentatge
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {vist && (
                      <span className="bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-widest border border-red-500/30 px-2 py-1 rounded-md">
                        Completat
                      </span>
                    )}
                    <span className="text-slate-500 text-xs">
                      {obert ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Llistat de subtemes o capítols si s'ha canviat a obert */}
                {obert && (
                  <div className="p-4 bg-slate-950/40 border-t border-white/5 divide-y divide-white/5 flex flex-col animate-in duration-150">
                    {temaObj.subtemes.map((sub, sIdx) => {
                      const clauVideo = `${ambitSeleccionat}_${tIdx}_${sIdx}`;
                      const videoVist = !!videosVistosLocals[clauVideo];

                      return (
                        <div 
                          key={sIdx} 
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-550 shrink-0" />
                            <span className="text-[11px] text-slate-350 font-medium font-sans">
                              {sub}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {videoVist && (
                              <span className="text-[7.5px] bg-[#00f296]/10 text-[#00f296] border border-[#00f296]/30 py-0.5 px-1.5 rounded-md font-black italic uppercase tracking-wider">
                                Vist i estudiat
                              </span>
                            )}
                            <button
                              onClick={() => onSeleccionarVideo(ambitSeleccionat, tIdx, sIdx)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase tracking-widest rounded-lg text-[9px] cursor-pointer transition-all active:scale-95 border border-red-500 shadow-md whitespace-nowrap"
                            >
                              <Play size={8} className="fill-white stroke-none" />
                              <span>Anar al vídeo</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
