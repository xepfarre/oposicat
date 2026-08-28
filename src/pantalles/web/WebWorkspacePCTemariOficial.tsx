import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft,
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  Highlighter, 
  Eraser, 
  AlertTriangle, 
  CheckCircle2,
  Play,
  Sparkles,
  Compass
} from 'lucide-react';
import { TEMARI_DETALL } from '../../constants/temari';
import { CONTINGUT_TEMARI_TEXTS } from '../../constants/contingut_textos';

// Explicació per a no-programadors: Importem la foto nova del fons oficial de teoria Foto03.png per donar-li atmosfera de campus d'alta volada a la zona d'estudi oficial.
// @ts-ignore
import fonsFoto03 from '../../assets/images/Foto03.png';

// Explicació per a no-programadors: Interfície TypeScript que blinda les propietats i funcions de control que necessitem per sincronitzar l'aula virtual amb el Campus general.
interface PropsTemariOficial {
  temesLlegitsLocals: Record<string, boolean>;
  setTemesLlegitsLocals: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  detallLlegitsLocals: Record<string, boolean>;
  setDetallLlegitsLocals: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  contingutPersonalitzatLocals: Record<string, string>;
  setContingutPersonalitzatLocals: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  mostrarTresAmbitsInici: boolean;
  setMostrarTresAmbitsInici: (v: boolean) => void;
  ambitSeleccionat: 'A' | 'B' | 'C';
  setAmbitSeleccionat: (a: 'A' | 'B' | 'C') => void;
  temaSeleccionatIndex: number | null;
  setTemaSeleccionatIndex: (i: number | null) => void;
  subtemaSeleccionatIndex: number | null;
  setSubtemaSeleccionatIndex: (i: number | null) => void;
  onTornarALInici: () => void;
}

export default function WebWorkspacePCTemariOficial({
  temesLlegitsLocals,
  setTemesLlegitsLocals,
  detallLlegitsLocals,
  setDetallLlegitsLocals,
  contingutPersonalitzatLocals,
  setContingutPersonalitzatLocals,
  ambitSeleccionat,
  setAmbitSeleccionat,
  temaSeleccionatIndex,
  setTemaSeleccionatIndex,
  subtemaSeleccionatIndex,
  setSubtemaSeleccionatIndex,
  onTornarALInici
}: PropsTemariOficial) {

  // Explicació per a no-programadors: Estat intern per controlar quina eina d'estudi tenim activa en el panell flotant del lector (subratllador o goma d'esborrar).
  const [einaActiva, setEinaActiva] = useState<'highlighter' | 'eraser' | null>(null);
  const pcArticleRef = useRef<HTMLDivElement>(null);

  // Explicació per a no-programadors: Estat per a recordar quins temes del llistat d'acordió estan desplegats en aquest moment.
  const [temesDesplegats, setTemesDesplegats] = useState<Record<string, boolean>>({});

  const toggleTema = (id: string) => {
    setTemesDesplegats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Explicació per a no-programadors: Netegem qualsevol selecció de text quan l'estudiant canvia de mètode o tanca l'eina.
  useEffect(() => {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
    }
  }, [einaActiva]);

  // Explicació per a no-programadors: Calculem els de temes completats per a cadascun dels tres àmbits de manera completament dinàmica a partir del llistat sincronitzat.
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

  // =========================================================================
  // FASE A: EL LECTOR DE CONTINGUT DINÀMIC CONCRET
  // =========================================================================
  if (temaSeleccionatIndex !== null && subtemaSeleccionatIndex !== null) {
    const dadesTema = TEMARI_DETALL[ambitSeleccionat]?.[temaSeleccionatIndex];
    const titolCapitol = dadesTema?.subtemes[subtemaSeleccionatIndex] || "";
    const clauCapitol = `${ambitSeleccionat}_${temaSeleccionatIndex}_${subtemaSeleccionatIndex}`;
    const completat = !!detallLlegitsLocals[clauCapitol];
    const contingutDesat = contingutPersonalitzatLocals[clauCapitol];
    const contingutOriginal = CONTINGUT_TEMARI_TEXTS[ambitSeleccionat]?.[temaSeleccionatIndex]?.[subtemaSeleccionatIndex] || "";

    // Formatem el contingut original a HTML (paràgrafs) si no n'hi ha cap de desat anteriorment.
    const inicialitzarContingut = () => {
      if (contingutDesat) return contingutDesat;
      if (!contingutOriginal) return "";
      return contingutOriginal.split('\n\n').map(p => 
        `<p class="text-slate-200 text-sm md:text-base leading-relaxed mb-6 font-medium text-justify transition-all">${p}</p>`
      ).join('');
    };

    // Explicació per a no-programadors: Gestiona la lògica de subratllar en color grog el text seleccionat per l'estudiant de forma immediata.
    const handleSubratllar = () => {
      if (einaActiva !== 'highlighter') return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'highlighter-span bg-yellow-400/80 text-black px-1 rounded-sm shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all cursor-pointer select-text';
      
      try {
        range.surroundContents(span);
        selection.removeAllRanges();
        
        if (pcArticleRef.current) {
          const htmlNou = pcArticleRef.current.innerHTML;
          setContingutPersonalitzatLocals(prev => ({
            ...prev,
            [clauCapitol]: htmlNou
          }));
        }
      } catch (e) {
        console.warn("No es pot subratllar a través de múltiples blocs complexos de text.");
      }
    };

    // Explicació per a no-programadors: Elimina d'una forma intel·ligent el subratllat en clicar-hi damunt si l'eina "Goma d'esborrar" es troba activa.
    const handleEsborrarFocus = (e: React.MouseEvent) => {
      if (einaActiva !== 'eraser') return;
      
      const target = e.target as HTMLElement;
      if (target.classList.contains('highlighter-span')) {
        const parent = target.parentNode;
        if (parent) {
          while (target.firstChild) {
            parent.insertBefore(target.firstChild, target);
          }
          parent.removeChild(target);
          
          if (pcArticleRef.current) {
            const htmlNou = pcArticleRef.current.innerHTML;
            setContingutPersonalitzatLocals(prev => ({
              ...prev,
              [clauCapitol]: htmlNou
            }));
          }
        }
      }
    };

    return (
      <div className="space-y-6 animate-in duration-300 text-left max-w-[85%] mx-auto w-full relative select-none">
        
        {/* Capçalera del Lector Oficial */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 border border-slate-800/50 rounded-3xl backdrop-blur-md">
          <button
            onClick={() => {
              setSubtemaSeleccionatIndex(null);
              setEinaActiva(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 hover:text-[#FFDF00] text-slate-300 font-extrabold italic uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer border border-slate-800/50"
          >
            <ChevronLeft size={14} />
            <span>Tornar als Capítols</span>
          </button>

          <div className="bg-slate-950/60 border border-slate-800/50 py-1.5 px-4 rounded-xl text-[10px] font-black italic uppercase text-amber-400 tracking-wider">
            Llegint: À-{ambitSeleccionat} • Tema {temaSeleccionatIndex + 1}
          </div>
        </div>

        {/* El text d'estudi amb format premium - Explicació per a no-programadors: Format de fons de color blau de la nit original elegant i net */}
        <div className="bg-slate-950/50 border border-slate-800/50 p-6 md:p-10 rounded-[32px] shadow-2xl relative">
          
          <div className="mb-6 md:mb-8 pb-4 border-b border-slate-800/40 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9.5px] text-[#FFDF00] font-black uppercase tracking-[0.2em] font-mono">
                CAPÍTOL {subtemaSeleccionatIndex + 1} DE {dadesTema?.subtemes.length} • ISPC OPOSIMOSSOS
              </span>
              <h2 className="text-lg md:text-2xl font-black italic uppercase text-white leading-tight">
                {titolCapitol}
              </h2>
            </div>

            <div className="shrink-0 p-3 bg-red-650/15 rounded-xl border border-red-600/20 text-red-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
          </div>

          {/* Format de subratllador enriquït del DOGC */}
          <div className="bg-[#0b1e36]/65 border border-blue-900/50 rounded-2xl p-4 md:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-4">
               <div className={`p-2.5 rounded-xl transition-all ${
                einaActiva === 'highlighter' ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20' : 
                einaActiva === 'eraser' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 
                'bg-blue-500/10 text-blue-400'
              }`}>
                {einaActiva === 'highlighter' ? <Highlighter size={18} className="animate-pulse" /> : einaActiva === 'eraser' ? <Eraser size={18} /> : <Highlighter size={18} />}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider leading-none mb-1">
                  {einaActiva === 'highlighter' ? 'Eina Activa: Subratllador Oficial' : 
                   einaActiva === 'eraser' ? "Eina Activa: Goma d'Esborrar" : 
                   'Subratllador Intel·ligent de l’APP obert'}
                </h4>
                <p className="text-[10px] md:text-xs text-blue-200/80 font-semibold italic leading-relaxed">
                  {einaActiva === 'highlighter' ? (
                    <span>Selecciona qualsevol text del temari amb el cursor per a marcar-lo en groc.</span>
                  ) : einaActiva === 'eraser' ? (
                    <span>Clica damunt de qualsevol frase o fragment groc per a extreure el subratllat.</span>
                  ) : (
                    <span>
                      Tens a la teva disposició eines d’estudi professionals d’OposiCAT{' '}
                      <span className="text-yellow-400 font-bold not-italic">tot el que subratillis després ho veuràs a la teva àrea d'estudi</span>{' '}
                      per a poder estudiar millor!
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Selectors ràpids d'eines */}
            <div className="flex flex-col gap-2 w-full md:w-36 self-stretch md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setEinaActiva(einaActiva === 'highlighter' ? null : 'highlighter')}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                  einaActiva === 'highlighter'
                    ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-md shadow-yellow-400/25'
                    : 'bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/40 border-yellow-900/40'
                }`}
              >
                <Highlighter size={13} />
                <span>Subratllar</span>
              </button>

              <button
                type="button"
                onClick={() => setEinaActiva(einaActiva === 'eraser' ? null : 'eraser')}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                  einaActiva === 'eraser'
                    ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/25'
                    : 'bg-red-950/20 text-red-300 hover:bg-red-950/40 border-red-900/40'
                }`}
              >
                <Eraser size={13} />
                <span>Esborrar</span>
              </button>
            </div>
          </div>

          {/* Presentació del contingut amb les eienes */}
          <div 
            onMouseUp={handleSubratllar}
            onTouchEnd={handleSubratllar}
            onClick={handleEsborrarFocus}
            className={`bg-slate-950/85 border border-slate-800/60 rounded-2xl p-5 md:p-8 shadow-inner select-text transition-all duration-300 relative ${
              einaActiva === 'highlighter' ? 'ring-2 ring-yellow-400/25 bg-yellow-400/[0.02]' : 
              einaActiva === 'eraser' ? 'ring-2 ring-red-500/25 bg-red-500/[0.02]' : ''
            }`}
          >
            {einaActiva && (
              <div className={`absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md animate-pulse ${
                einaActiva === 'highlighter' ? 'bg-yellow-400 text-slate-950' : 'bg-red-500 text-white'
              }`}>
                {einaActiva === 'highlighter' ? 'Mètode Subratllat actiu' : 'Mode Esborrar actiu'}
              </div>
            )}

            <div 
              ref={pcArticleRef}
              className={`prose prose-invert max-w-none select-text text-justify transition-all duration-200 ${
                einaActiva === 'eraser' ? 'hover:opacity-90' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: inicialitzarContingut() }}
            />
            
            {!contingutOriginal && (
              <div className="py-12 flex flex-col items-center gap-4 opacity-40 text-center animate-pulse">
                <div className="w-12 h-12 rounded-full border border-dashed border-slate-500 flex items-center justify-center">
                  <AlertTriangle className="text-amber-500" size={18} />
                </div>
                <p className="text-xs uppercase font-black tracking-widest text-slate-400">Resum i contingut oficial en camí d'incorporació</p>
              </div>
            )}
          </div>

          {/* Botó per completar */}
          {contingutOriginal && (
            <div className="mt-8 flex justify-center pb-2">
              <button 
                type="button"
                onClick={() => {
                  setDetallLlegitsLocals(prev => {
                    const nouestat = { ...prev, [clauCapitol]: !completat };
                    
                    const totsCapitolsComplets = dadesTema.subtemes.every((_, subIdx) => {
                      const key = `${ambitSeleccionat}_${temaSeleccionatIndex}_${subIdx}`;
                      return nouestat[key] || (key === clauCapitol ? !completat : false);
                    });
                    
                    setTemesLlegitsLocals(prevTemes => ({
                      ...prevTemes,
                      [`${ambitSeleccionat}_${temaSeleccionatIndex}`]: totsCapitolsComplets
                    }));
                    
                    return nouestat;
                  });
                  setSubtemaSeleccionatIndex(null);
                  setEinaActiva(null);
                }}
                className={`flex items-center gap-2.5 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer border ${
                  completat 
                    ? 'bg-[#00f296]/10 text-[#00f296] border-[#00f296]/25 shadow-emerald-950/10' 
                    : 'bg-[#FFDF00] text-slate-950 hover:bg-yellow-400 border-yellow-500'
                }`}
              >
                <CheckCircle2 size={16} />
                {completat ? '✓ Llegit correctament' : 'Marcar capítol com a llegit'}
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // FASE B & C: REPLICACIÓ COMPLETA DE L'ÀREA D'ESTUDI PERSONAL DE REBUIG
  // =========================================================================
  return (
    <div className="bg-slate-950/50 backdrop-blur-lg border border-slate-800/50 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 animate-in duration-300 max-w-[85%] mx-auto w-full text-left select-none">
        {/* 1. CAPÇALERA DE L'ÀREA: Botó d'enrere i títol de la secció */}
      <div className="flex items-center justify-between w-full relative min-h-16">
        
        {/* Botó enrere per tornar de manera immediata i ràpida a la benvinguda del "Què vols fer avui?" */}
        <button 
          type="button"
          onClick={onTornarALInici}
          className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-white/5 rounded-2xl active:scale-95 shadow-lg text-white transition-all cursor-pointer flex items-center justify-center relative z-20"
          title="Tornar al selector"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Títol ovalat de gran contrast de Temari Oficial seguint el mateix disseny molt xulo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center select-none text-center">
          <div className="bg-slate-950/90 px-8 py-3 rounded-full border border-white/10 shadow-2xl flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFDF00] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase leading-none text-center">
              <span className="text-white">Temari </span>
              <span className="text-[#FFDF00]">Oficial</span>
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
          <span>📚 Temari Oficial (DOGC) - Convocatòria 2025-2026</span>
        </p>
        <p className="text-[11px] sm:text-xs text-slate-300 font-semibold leading-relaxed italic max-w-3xl">
          "Et presentem el temari oficial de l'oposició de Mossos d'Esquadra de l'any 2025-2026 perquè en facis ús en qualsevol lloc."
        </p>
      </div>

      {/* 3. MENÚ DE NAVEGACIÓ INTERN (Ometent per complet els separadors de subratllats i consells, demanat) */}
      <div className="flex border-b border-white/5 gap-2 pb-0.5">
        <div className="px-5 py-3 text-xs font-black italic uppercase tracking-wider border-b-2 border-[#FFDF00] text-[#FFDF00]">
          🗂️ Temari Oficial i Progrés de l'Oposició
        </div>
      </div>

      {/* 4. COS CENTRAL D'ÀMBITS BENTO I ACORDIONS INTERACTIUS */}
      <div className="space-y-6">
        
        {/* Targetes superiors per visualitzar el progrés global per Àmbits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['A', 'B', 'C'] as const).map((a) => {
            const actiu = ambitSeleccionat === a;
            const stats = statsAmbits[a];
            const nomAmbit = a === 'A' ? "Coneixements de l'Entorn" : a === 'B' ? 'Àmbit Institucional' : 'Àmbit de Seguretat i Policia';
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
                        a === 'A' ? 'bg-blue-500' : a === 'B' ? 'bg-red-500' : 'bg-purple-500'
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

          {TEMARI_DETALL[ambitSeleccionat] && TEMARI_DETALL[ambitSeleccionat].map((temaObj, tIdx) => {
            const completat = !!temesLlegitsLocals[`${ambitSeleccionat}_${tIdx}`];
            const obert = !!temesDesplegats[`${ambitSeleccionat}_${tIdx}`];

            return (
              <div 
                key={tIdx} 
                className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden transition-all duration-305"
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

                {/* Llista de Subtemes si el tema es troba desplegat l'acordió d'estudi amb els play icons */}
                {obert && (
                  <div className="p-4 bg-slate-950/40 border-t border-white/5 divide-y divide-white/5 flex flex-col animate-in duration-150">
                    
                    {/* Explicació per a no-programadors: Capçalera de columna per a saber ràpidament el propòsit dels botons de control a la dreta */}
                    <div className="hidden sm:flex items-center justify-between pb-3 text-[10px] font-black uppercase tracking-widest text-[#FFDF00] select-none">
                      <span className="pl-1 text-slate-500 font-sans">Capítols del Tema</span>
                      <div className="flex items-center gap-6 pr-1">
                        <span className="w-12 text-center text-slate-400">Llegit</span>
                        <span className="w-[115px] text-center text-slate-400">Estudiar</span>
                      </div>
                    </div>

                    {temaObj.subtemes.map((sub, sIdx) => {
                      const claudetall = `${ambitSeleccionat}_${tIdx}_${sIdx}`;
                      const subcompletat = !!detallLlegitsLocals[claudetall];
                      const teSubratllats = !!contingutPersonalitzatLocals[claudetall];

                      return (
                        <div 
                          key={sIdx} 
                          className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 py-3"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-[11px] text-slate-300 font-medium font-sans text-left">
                              {sub}
                            </span>
                            {teSubratllats && (
                              <span className="text-[7.5px] bg-[#FFDF00]/10 text-[#FFDF00] border border-[#FFDF00]/30 py-0.5 px-1.5 rounded-md font-black italic uppercase tracking-wider shrink-0">
                                Conté subratllats
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-6 self-end sm:self-center shrink-0">
                            {/* Explicació per a no-programadors: Checkbox interactiu que es mou cap a la dreta per petició d'usuari i compta amb etiqueta de fàcil lectura */}
                            <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0 sm:w-12 select-none">
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 sm:hidden">Llegit?</span>
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetallLlegitsLocals(prev => {
                                    const nouestat = { ...prev, [claudetall]: !subcompletat };
                                    
                                    const totsCapitolsComplets = temaObj.subtemes.every((_, subIdx) => {
                                      const key = `${ambitSeleccionat}_${tIdx}_${subIdx}`;
                                      return nouestat[key];
                                    });
                                    
                                    setTemesLlegitsLocals(prevTemes => ({
                                      ...prevTemes,
                                      [`${ambitSeleccionat}_${tIdx}`]: totsCapitolsComplets
                                    }));
                                    
                                    return nouestat;
                                  });
                                }}
                                className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 active:scale-95 ${
                                  subcompletat 
                                    ? 'bg-[#00f296] border-[#00f296] text-slate-950 shadow-md shadow-emerald-500/10' 
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                }`}
                                title={subcompletat ? "Marcar com a no llegit" : "Marcar com a llegit"}
                              >
                                {subcompletat && <Check size={11} className="stroke-[4]" />}
                              </div>
                            </div>

                            {/* Explicació per a no-programadors: Botó d'estudi premium que canvia a groguenc d'alt contrast amb tipografia negra súper xula */}
                            <div className="w-[115px] flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setTemaSeleccionatIndex(tIdx);
                                  setSubtemaSeleccionatIndex(sIdx);
                                }}
                                className="w-full flex items-center justify-center gap-1.5 px-4 py-1 bg-[#FFDF00] hover:bg-yellow-400 text-slate-950 font-black italic uppercase tracking-widest rounded-lg text-[9px] cursor-pointer transition-all active:scale-95 border border-yellow-500 shadow-md whitespace-nowrap"
                              >
                                <Play size={8} className="fill-slate-950 stroke-none" />
                                <span>Estudiar Ara</span>
                              </button>
                            </div>
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

      <div className="text-center pt-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] select-none">
        OposiMossos - Preparació d'oposicions oficials
      </div>
    </div>
  );
}
