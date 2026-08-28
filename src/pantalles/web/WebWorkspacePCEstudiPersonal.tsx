import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  ChevronLeft, 
  FolderLock, 
  Sparkles, 
  Play, 
  Database, 
  Clock, 
  Compass, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { TEMARI_DETALL } from '../../constants/temari';

// Explicació per a no-programadors: Interfície TypeScript que defineix les propietats que rebrà aquest component des del pare general de la web.
interface PropsEstudiPersonal {
  contingutPersonalitzatLocals: Record<string, string>;
  temesLlegitsLocals: Record<string, boolean>;
  onTornar: () => void;
  onEstudiarTema: (ambit: 'A' | 'B' | 'C', temaIndex: number, subtemaIndex: number) => void;
}

export default function WebWorkspacePCEstudiPersonal({
  contingutPersonalitzatLocals,
  temesLlegitsLocals,
  onTornar,
  onEstudiarTema
}: PropsEstudiPersonal) {
  
  // Explicació per a no-programadors: Pestanya principal activa dins de la nostra Àrea d'Estudi (Temari/Subratllats/Consells)
  const [pestanyaActiva, setPestanyaActiva] = useState<'temes' | 'subratllats' | 'consells'>('temes');
  
  // Explicació per a no-programadors: Àmbit de la teoria seleccionat actualment per revisar el contingut (per defecte l'Ambit A)
  const [ambitSeleccionat, setAmbitSeleccionat] = useState<'A' | 'B' | 'C'>('A');

  // Explicació per a no-programadors: Un estat per controlar quins temes concrets de la llista estan expandits
  const [temesDesplegats, setTemesDesplegats] = useState<Record<string, boolean>>({});

  const toggleTema = (id: string) => {
    setTemesDesplegats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Explicació per a no-programadors: Calculem els temes completats per a cadascun dels tres àmbits d'estudi de manera dinàmica.
  const statsAmbits = useMemo(() => {
    const totalA = TEMARI_DETALL.A.length;
    const totalB = TEMARI_DETALL.B.length;
    const totalC = TEMARI_DETALL.C.length;

    let completatsA = 0;
    let completatsB = 0;
    let completatsC = 0;

    for (let i = 0; i < totalA; i++) {
      if (temesLlegitsLocals[`A_${i}`]) completatsA++;
    }
    for (let i = 0; i < totalB; i++) {
      if (temesLlegitsLocals[`B_${i}`]) completatsB++;
    }
    for (let i = 0; i < totalC; i++) {
      if (temesLlegitsLocals[`C_${i}`]) completatsC++;
    }

    return {
      A: { total: totalA, completats: completatsA, pct: Math.round((completatsA / totalA) * 100) || 0 },
      B: { total: totalB, completats: completatsB, pct: Math.round((completatsB / totalB) * 100) || 0 },
      C: { total: totalC, completats: completatsC, pct: Math.round((completatsC / totalC) * 100) || 0 }
    };
  }, [temesLlegitsLocals]);

  // Explicació per a no-programadors: Aquesta funció analítica és com "màgia". Cerca en totes les notes desades contingut HTML i extreu el text que vas marcar amb el subratllador groc. Format: <span class="highlighter-span">...</span>
  const textorsSubratllats = useMemo(() => {
    const llista: Array<{
      ambit: 'A' | 'B' | 'C';
      temaIdx: number;
      subtemaIdx: number;
      titolTema: string;
      nomSubtema: string;
      fragments: string[];
    }> = [];

    // Recorrem totes les claus desades a localStorage (ex: "A_0_1" -> Àmbit A, Tema 0, Subtema 1)
    Object.entries(contingutPersonalitzatLocals).forEach(([clau, html]) => {
      const parts = clau.split('_');
      if (parts.length === 3) {
        const amb = parts[0] as 'A' | 'B' | 'C';
        const tIdx = parseInt(parts[1]);
        const sIdx = parseInt(parts[2]);

        // Protecció de seguretat en cas de dades invàlides
        if (!TEMARI_DETALL[amb]?.[tIdx]) return;

        const temaObj = TEMARI_DETALL[amb][tIdx];
        const titolTema = temaObj.titol;
        const nomSubtema = temaObj.subtemes[sIdx] || `Punt ${sIdx + 1}`;

        // Intentem cercar fragments de text dins del codi HTML que portin la classe 'highlighter-span' utilitzada pel subratllador groc
        const fragments: string[] = [];
        try {
          // Creem un diccionari o exprés regular senzill (Regex) per extreure el text contingut dins de l'etiqueta highlighter-span
          // Aquest patró és robust i ràpid
          const regex = /<span class="highlighter-span"[^>]*>([\s\S]*?)<\/span>/g;
          let match;
          while ((match = regex.exec(html)) !== null) {
            const netejat = match[1].replace(/<[^>]*>/g, '').trim(); // Eliminem restes d'etiquetes internes de seguretat
            if (netejat.length > 2) {
              fragments.push(netejat);
            }
          }
        } catch (e) {
          console.error("Error extraient els subratllats de la base local: ", e);
        }

        if (fragments.length > 0) {
          llista.push({
            ambit: amb,
            temaIdx: tIdx,
            subtemaIdx: sIdx,
            titolTema,
            nomSubtema,
            fragments
          });
        }
      }
    });

    return llista;
  }, [contingutPersonalitzatLocals]);

  return (
    <div className="bg-slate-950/50 backdrop-blur-lg border border-slate-800/50 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 animate-in fade-in duration-300 max-w-[85%] mx-auto w-full text-left">
      
      {/* 1. CAPÇALERA DE L'ÀREA: Botó d'enrere i títol de la secció */}
      <div className="flex items-center justify-between w-full relative min-h-16">
        
        {/* Botó enrere per tornar de manera immediata i ràpida a la benvinguda del "Què vols fer avui?" */}
        <button 
          onClick={onTornar}
          className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-white/5 rounded-2xl active:scale-95 shadow-lg text-white transition-all cursor-pointer flex items-center justify-center relative z-20"
          title="Tornar al selector"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Títol ovalat de gran contrast d'Estudi Personalitzat seguint el patró dels canònics del campus */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center select-none text-center">
          <div className="bg-slate-950/90 px-8 py-3 rounded-full border border-white/10 shadow-2xl flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFDF00] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase leading-none text-center">
              <span className="text-[#FFDF00]">Àrea d'estudi </span>
              <span className="text-white">personal</span>
            </h2>
          </div>
        </div>
      </div>

      {/* 2. NOTA DIDÀCTICA: Citació sol·licitada pel client amb disseny minimalista */}
      <div className="bg-gradient-to-r from-blue-950/30 via-[#021329] to-blue-950/30 p-5 rounded-2xl border border-blue-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Compass className="w-20 h-20 text-blue-400" />
        </div>
        <p className="text-[#FFDF00] text-xs sm:text-sm font-black italic uppercase tracking-wider mb-1.5 flex items-center gap-2">
          <span>📚 El teu escriptori privat de treball</span>
        </p>
        <p className="text-[11px] sm:text-xs text-slate-300 font-semibold leading-relaxed italic max-w-3xl">
          "L'area d'esttudi es la teva zona priovada d'estudi. Aqui torbaras resums de cada tema, veuras el que has subratllat tu personalment."
        </p>
      </div>

      {/* 3. MENÚ DE NAVEGACIÓ INTERN (Pestanyes de disseny "Glass") */}
      <div className="flex border-b border-white/5 gap-2 pb-0.5">
        <button
          onClick={() => setPestanyaActiva('temes')}
          className={`px-5 py-3 text-xs font-black italic uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            pestanyaActiva === 'temes' 
              ? 'border-[#FFDF00] text-[#FFDF00]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          🗂️ Els Meus Temes i Progrés
        </button>
        <button
          onClick={() => setPestanyaActiva('subratllats')}
          className={`px-5 py-3 text-xs font-black italic uppercase tracking-wider border-b-2 transition-all cursor-pointer relative ${
            pestanyaActiva === 'subratllats' 
              ? 'border-[#FFDF00] text-[#FFDF00]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          ✏️ Quadern de Subratllats
          {textorsSubratllats.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-650 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full border border-black animate-bounce">
              {textorsSubratllats.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setPestanyaActiva('consells')}
          className={`px-5 py-3 text-xs font-black italic uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            pestanyaActiva === 'consells' 
              ? 'border-[#FFDF00] text-[#FFDF00]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          🛰️ Salut i Consells de BBDD
        </button>
      </div>

      {/* 4. SECCIÓ 1: ELS MEUS TEMES I PROGRÉS */}
      {pestanyaActiva === 'temes' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Targetes superiors per visualitzar el progrés global per Àmbits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['A', 'B', 'C'] as const).map((a) => {
              const actiu = ambitSeleccionat === a;
              const stats = statsAmbits[a];
              const nomAmbit = a === 'A' ? 'Coneixements de l\'Entorn' : a === 'B' ? 'Àmbit Policial' : 'Àmbit de Dret Penal';
              const colorIcon = a === 'A' ? 'bg-blue-650 text-blue-100' : a === 'B' ? 'bg-red-650 text-red-100' : 'bg-purple-650 text-purple-100';

              return (
                <div
                  key={a}
                  onClick={() => setAmbitSeleccionat(a)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border text-left flex flex-col justify-between h-32 select-none relative overflow-hidden ${
                    actiu 
                      ? 'bg-slate-900 border-blue-500/50 shadow-[0_0_20px_rgba(30,144,255,0.15)]' 
                      : 'bg-slate-950/40 border-slate-800 hover:bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black italic ${colorIcon}`}>
                        {a}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block leading-none">ÀMBIT {a}</span>
                        <span className="text-[11px] text-white font-black italic uppercase tracking-wider block mt-1">{nomAmbit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase mb-1">
                      <span>Progrés d'Estudi</span>
                      <span className="text-[#FFDF00]">{stats.completats}/{stats.total} Llegits ({stats.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          a === 'A' ? 'bg-blue-505' : a === 'B' ? 'bg-red-655' : 'bg-purple-655'
                        }`}
                        style={{ width: `${stats.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Llista de temes de l'Àmbit actiu per ser desplegats */}
          <div className="space-y-3 bg-slate-950/30 p-4 rounded-3xl border border-slate-800/40">
            <h4 className="text-xs font-black italic text-[#FFDF00] uppercase tracking-wider mb-2">
              📂 Llista interactiva de l'Àmbit {ambitSeleccionat}:
            </h4>

            {TEMARI_DETALL[ambitSeleccionat].map((temaObj, tIdx) => {
              const completat = !!temesLlegitsLocals[`${ambitSeleccionat}_${tIdx}`];
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
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-8 h-8 rounded-xl font-black italic text-xs flex items-center justify-center border shrink-0 ${
                        completat 
                          ? 'bg-[#00f296]/10 border-[#00f296]/30 text-[#00f296]' 
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}>
                        {tIdx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[11px] text-white font-bold italic uppercase tracking-wider block">
                          {temaObj.titol}
                        </span>
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">
                          {temaObj.subtemes.length} Capítols d'Estudi Oficial
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {completat && (
                        <span className="bg-[#00f296]/10 text-[#00f296] text-[8px] font-black uppercase tracking-widest border border-[#00f296]/30 px-2 py-1 rounded-md">
                          Llegit
                        </span>
                      )}
                      <span className="text-slate-500 text-xs">
                        {obert ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {/* Llista de Subtemes si el tema es troba demanat obert */}
                  {obert && (
                    <div className="p-4 bg-slate-950/40 border-t border-white/5 divide-y divide-white/5 flex flex-col animate-in duration-150">
                      {temaObj.subtemes.map((sub, sIdx) => {
                        const claudetall = `${ambitSeleccionat}_${tIdx}_${sIdx}`;
                        const subcompletat = !!contingutPersonalitzatLocals[claudetall];

                        return (
                          <div 
                            key={sIdx} 
                            className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="text-[11px] text-slate-350 font-medium font-sans">
                                {sub}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {subcompletat && (
                                <span className="text-[7.5px] bg-[#FFDF00]/10 text-[#FFDF00] border border-[#FFDF00]/30 py-0.5 px-1.5 rounded-md font-black italic uppercase tracking-wider">
                                  Conté subratllats
                                </span>
                              )}
                              <button
                                onClick={() => onEstudiarTema(ambitSeleccionat, tIdx, sIdx)}
                                className="flex items-center gap-1.5 px-4 py-1 bg-[#FFDF00] hover:bg-yellow-400 text-slate-950 font-black italic uppercase tracking-widest rounded-lg text-[9px] cursor-pointer transition-all active:scale-95 border border-yellow-500 shadow-md whitespace-nowrap"
                              >
                                <Play size={8} className="fill-slate-950 stroke-none" />
                                <span>Estudiar Ara</span>
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
      )}

      {/* 5. SECCIÓ 2: QUADERN DE SUBRATLLATS DINÀMIC */}
      {pestanyaActiva === 'subratllats' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {textorsSubratllats.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-slate-950/40 border border-white/5 space-y-4 max-w-xl mx-auto">
              <span className="text-4xl block">✏️</span>
              <h3 className="text-white font-black italic uppercase text-sm tracking-wide">EL TEU QUADERN ESTÀ SENSE FULLS SUBRATLLATS</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-relaxed">
                Cada cop que llegeixes un tema oficial del DOGC amb la nostra eina de subratllat groc de la pantalla, els fragments marcats de text es guardaran de forma instantània en aquest requadre d'estudi perquè puguis fer un repàs molt ràpid abans dels teus exàmens oficials.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onEstudiarTema('A', 0, 1)}
                  className="px-6 py-3 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider text-[10px] rounded-full active:scale-95 transition-all shadow-lg cursor-pointer"
                >
                  🚀 Anar al temari oficial per subratllar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black italic text-[#FFDF00] uppercase tracking-wider">
                  📖 Fragments de Text Guardats ({textorsSubratllats.reduce((sum, item) => sum + item.fragments.length, 0)}):
                </h4>
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">
                  Mètode de Repetició Activa
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {textorsSubratllats.map((bloc, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 text-left space-y-4 relative overflow-hidden"
                  >
                    {/* Capçalera d'on prové aquest text */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[8px] text-[#FFDF00] font-extrabold uppercase tracking-widest block leading-none">
                          ÀMBIT {bloc.ambit} · TEMA {bloc.temaIdx + 1}
                        </span>
                        <span className="text-[11px] text-white font-black italic uppercase tracking-wider block mt-1">
                          {bloc.nomSubtema}
                        </span>
                      </div>

                      <button
                        onClick={() => onEstudiarTema(bloc.ambit, bloc.temaIdx, bloc.subtemaIdx)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-850 hover:text-[#FFDF00] text-slate-300 border border-[#062040]/50 rounded-lg text-[9px] font-extrabold italic uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Play size={8} />
                        <span>Obrir Tema</span>
                      </button>
                    </div>

                    {/* Fragments realçats grocs */}
                    <div className="space-y-3 pl-3 border-l border-yellow-500/30">
                      {bloc.fragments.map((frag, fIdx) => (
                        <div 
                          key={fIdx} 
                          className="bg-yellow-405/10 text-yellow-150 border border-yellow-500/20 p-3 rounded-xl relative group hover:border-yellow-500/40 transition-colors"
                        >
                          <span className="absolute -left-1.5 top-3 w-1.5 h-1.5 rounded-full bg-yellow-400 group-hover:scale-125 transition-transform" />
                          <p className="text-[11.5px] italic font-semibold leading-relaxed font-sans text-justify">
                            "{frag}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 6. SECCIÓ 3: SALUT MILITAR I CONSELLS DE BBDD A FUTUR (ACCOMPANYAMENT DIDÀCTIC REQUERIT) */}
      {pestanyaActiva === 'consells' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Bloc d'acompanyament didàctic de base de dades a futur per l'opositor */}
          <div className="bg-[#03122e]/40 border border-blue-500/20 rounded-3xl p-6 md:p-8 space-y-6">
            
            {/* TÍTOL SOL·LICITAT PER LA REGLA GENERAL */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Database className="w-6 h-6 text-[#FFDF00] shrink-0" />
              <div>
                <h3 className="text-white font-black italic uppercase text-xs tracking-wider">
                  Et recomano, modificaria i/o recorda que pot passar... a futur
                </h3>
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block mt-0.5">
                  Disseny d'Arxiu de Base de Dades per a OposiCAT Campus
                </span>
              </div>
            </div>

            <div className="text-slate-300 font-medium text-[11px] sm:text-xs leading-relaxed space-y-4">
              <p>
                Durant la creació d’aquesta nova peca modular de Lego, he establert una connexió bidireccional amb els teus estats locals. A continuació, t’explico amb calma i de forma molt plana quines consideracions hem de tenir al cap d'un futur a l'hora de publicar oficialment aquesta base de dades:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider block">📡 Sincronització Asíncrona Robusta</span>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Si l'estudiant té talls parcials de cobertura al mòbil o l'ordinador durant la lectura, el nostre sistema a futur guardaria els canvis directament al <strong>localStorage</strong> de forma interna. Tan bon punt l'ordinador torni a rebre senyal, el codi sincronitzaria totes les notes a la base col·lectiva de <strong>Cloud Firestore</strong> de fons, evitant absolutament qualsevol pèrdua d'estudi de l'opositor.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[10px] text-[#00f296] font-extrabold uppercase tracking-wider block">🔒 Seguretat i Validació de Rols</span>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Quan configurem la base de dades en producció, s'han de canviar les regles obertes de Firestore per validar correctament el rol del compte. L’estudiant només ha de poder editar canvis del seu propi perfil i notes en groc sota l’ID <strong>`auth.uid`</strong>, assegurant una seguretat infranquejable i evitant accessos d'escriptura no autoritzats.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block">🛡️ Còpies de Seguretat Crítiques</span>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Recomanem habilitar un pla de <strong>backups automàtics diaris</strong> des de la consola de Google Cloud per a tota la col·lecció d’OposiCAT. Això garantirà la capacitat de restauració total d'un estat anòmal en pocs minuts en cas d'un dany menor inesperat.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">🎁 Sincronització de Dispositiu</span>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Perquè l'estudiant senti que l'App i el Web treballen com un sol òrgan, utilitzarem claus ID estables des d'un perfil d'usuari registrat de manera que en iniciar la sessió al PC carregui la llista exacta de temaris estudiats directament des de qualsevol smartphone.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* MÈTODES D'APRENENTATGE RECOMANATS PER L'EQUIP */}
          <div className="space-y-4">
            <h4 className="text-xs font-black italic text-[#FFDF00] uppercase tracking-wider">
              🚀 Consells del Mètode OposiMossos:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-1.5">
                <span className="text-[10px] text-[#00f296] font-extrabold uppercase tracking-widest block">🗣️ RECULADA ACTIVA</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  No et limitis a llegir de forma passiva. Tanca l’ordinador durant 3 minuts un cop acabis d'estudiar i intenta escriure al teu quadern una llista amb les idees clau exposades. Això duplica la retenció.
                </p>
              </div>

              <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-1.5">
                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest block">📅 REPETICIÓ ESPAIADA</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Revisa els temes amb intervals d'1 dia, 3 dies, 1 setmana i després 1 mes. El nostre programador d'estudis de l'aplicació s'encarrega d'analitzar-ho per tu.
                </p>
              </div>

              <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-1.5">
                <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block">⚡ FOCUS MENTAL</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Realitza els teus simulacres de psicotècnics d'OposiCAT sempre a la mateixa hora del dia que tindrà l'examen real d'oposició per entrenar el cervell a la pressió màxima de temps.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
