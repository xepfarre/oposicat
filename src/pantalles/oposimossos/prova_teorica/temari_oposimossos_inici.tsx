import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Shield, Landmark, ChevronDown, ChevronUp } from 'lucide-react';
import { TEMARI_DETALL } from '../../../constants/temari';

/**
 * Pantalla del Temari d'OposiMossos (Resums).
 * Comentari planer per a no-programadors: Aquesta pantalla és l'Àrea d'estudi personal de l'estudiant.
 * Hem canviat el títol general a "Area d'estudi" i adaptat els Àmbits (A, B, C) perquè es despleguin
 * com uns acordions elegants seguint exactament l'estètica d'exàmens, amb botons per accedir-hi ràpidament.
 */
export default function TemariOposimossosInici({ 
  onTornar, 
  onAmbitA,
  onAmbitB,
  onAmbitC,
  onSeleccionarTema,
  onSeleccionarSubtema,
  progres
}: { 
  onTornar: () => void,
  onAmbitA: () => void,
  onAmbitB: () => void,
  onAmbitC: () => void,
  onSeleccionarTema: (ambit: 'A' | 'B' | 'C', index: number) => void,
  onSeleccionarSubtema: (ambit: 'A' | 'B' | 'C', temaIndex: number, subtemaIndex: number) => void,
  progres: { A: boolean[], B: boolean[], C: boolean[] }
}) {
  
  // Comentari planer per a no-programadors: Controlems quins d'aquests àmbits (A, B o C) estan expandits o tancats a l'aplicació
  const [blocsOberts, setBlocsOberts] = useState<{ [key: string]: boolean }>({
    A: false,
    B: false,
    C: false
  });

  // Comentari planer per a no-programadors: Guardem quins temes individuals estan expandits per mostrar els seus capítols directament
  const [temesOberts, setTemesOberts] = useState<{ [key: string]: boolean }>({});

  const toggleBloc = (id: string) => {
    setBlocsOberts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTema = (key: string) => {
    setTemesOberts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-12 px-6">
      
      {/* CAPÇALERA */}
      <header className="pt-10 w-full max-w-sm md:max-w-2xl flex items-center gap-4 mb-8">
        <button 
          onClick={onTornar}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          {/* Comentari planer: Hem rebatejat el títol superior a "Area d'estudi" segons l'encàrrec */}
          <h1 className="text-xl font-black italic uppercase text-white tracking-widest leading-tight">
            Area d'estudi
          </h1>
          <p className="text-[10px] text-white/50 uppercase tracking-widest italic">Estudi Personalitzat 2025-2026</p>
        </div>
      </header>

      <main className="w-full max-w-sm md:max-w-3xl flex flex-col gap-6">
        
        {/* Label: Informació de la secció */}
        {/* Comentari planer: Text de benvinguda a l'Àrea combinant el text indicat de l'estudiant */}
        <div className="bg-white/5 border border-white/10 rounded-2xl py-4 px-5 shadow-xl">
          <p className="text-amber-400 text-xs md:text-sm font-medium leading-relaxed text-center italic">
            "L'area d'esttudi es la teva zona priovada d'estudi. Aqui torbaras resums de cada tema, veuras el que has subratllat tu personalment."
          </p>
        </div>

        {/* Llistat d'Àmbits estil desplegable d'exàmens */}
        <div className="flex flex-col gap-4">
          
          {/* ------------------ ÀMBIT A ------------------ */}
          <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-md shadow-xl">
            {/* Capçalera del Desplegable (Estètica com a bloc d'exàmens) */}
            <button 
              onClick={() => toggleBloc('A')}
              className="w-full p-4 flex items-center justify-between transition-all group hover:bg-white/5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-500 rounded-lg text-white">
                  <BookOpen size={18} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black italic uppercase tracking-[0.2em] text-white/30 leading-none mb-1">
                    Àmbit A
                  </span>
                  <h3 className="font-black italic uppercase text-xs text-white tracking-tight leading-tight">
                    Coneixements de l'entorn
                  </h3>
                </div>
              </div>
              
              <div className="text-white/20 mr-2">
                {blocsOberts['A'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {/* Contingut obert de l'Àmbit A */}
            {blocsOberts['A'] && (
              <div className="flex flex-col gap-3 p-4 bg-black/40 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] text-white/50 leading-relaxed italic mb-1">
                  Fes clic sobre qualsevol tema per a desplegar els seus capítols i començar a estudiar directament:
                </p>
                
                <div className="flex flex-col gap-2">
                  {TEMARI_DETALL.A.map((temaObj, i) => {
                    const temaCompletat = progres.A[i];
                    const temaObert = !!temesOberts[`A-${i}`];
                    return (
                      <div key={i} className="flex flex-col border border-white/5 rounded-xl overflow-hidden bg-white/5 shadow-md">
                        {/* Capçalera del Tema */}
                        <button
                          onClick={() => toggleTema(`A-${i}`)}
                          className="w-full text-left p-3 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg font-black italic text-xs flex items-center justify-center transition-colors ${
                              temaCompletat ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/30'
                            }`}>
                              {i + 1}
                            </div>
                            <span className="text-xs font-bold leading-tight text-white group-hover:text-amber-400 transition-colors">
                              {temaObj.titol}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-white/40 italic font-black">
                              {temaObj.subtemes.length} Capítols
                            </span>
                            <div className="text-white/30">
                              {temaObert ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>
                        </button>

                        {/* Llista de Capítols del Tema (Desplegable) */}
                        {temaObert && (
                          <div className="flex flex-col gap-1 p-2 bg-black/25 border-t border-white/5 animate-in slide-in-from-top-1 duration-150">
                            {temaObj.subtemes.map((subtema, subIdx) => (
                              <motion.button
                                key={subIdx}
                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => onSeleccionarSubtema('A', i, subIdx)}
                                className="w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-white/70 hover:text-amber-400 transition-colors cursor-pointer group/sub"
                              >
                                <span className="text-[11px] font-medium leading-relaxed truncate pr-4">
                                  {subtema}
                                </span>
                                <span className="text-[9px] text-white/20 group-hover/sub:text-amber-400 font-bold">➔</span>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Milestones de progrés lúdic */}
                <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-white/45 tracking-[0.2em]">Estudiats:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {progres.A.map((llegit, i) => (
                        <span 
                          key={i} 
                          className={`text-xs font-black transition-all ${
                            llegit 
                            ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' 
                            : 'text-white/10'
                          }`}
                        >
                          {i + 1}
                        </span>
                      ))}
                    </div>
                    <span className="text-white font-black text-xs italic ml-2">
                      {Math.round((progres.A.filter(Boolean).length / progres.A.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ------------------ ÀMBIT B ------------------ */}
          <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-md shadow-xl">
            {/* Capçalera del Desplegable (Estètica com a bloc d'exàmens) */}
            <button 
              onClick={() => toggleBloc('B')}
              className="w-full p-4 flex items-center justify-between transition-all group hover:bg-white/5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-amber-500 rounded-lg text-white">
                  <Landmark size={18} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black italic uppercase tracking-[0.2em] text-white/30 leading-none mb-1">
                    Àmbit B
                  </span>
                  <h3 className="font-black italic uppercase text-xs text-white tracking-tight leading-tight">
                    Àmbit institucional
                  </h3>
                </div>
              </div>
              
              <div className="text-white/20 mr-2">
                {blocsOberts['B'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {/* Contingut obert de l'Àmbit B */}
            {blocsOberts['B'] && (
              <div className="flex flex-col gap-3 p-4 bg-black/40 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] text-white/50 leading-relaxed italic mb-1">
                  Fes clic sobre qualsevol tema per a desplegar els seus capítols i començar a estudiar directament:
                </p>
                
                <div className="flex flex-col gap-2">
                  {TEMARI_DETALL.B.map((temaObj, i) => {
                    const temaCompletat = progres.B[i];
                    const temaObert = !!temesOberts[`B-${i}`];
                    return (
                      <div key={i} className="flex flex-col border border-white/5 rounded-xl overflow-hidden bg-white/5 shadow-md">
                        {/* Capçalera del Tema */}
                        <button
                          onClick={() => toggleTema(`B-${i}`)}
                          className="w-full text-left p-3 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg font-black italic text-xs flex items-center justify-center transition-colors ${
                              temaCompletat ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-300 group-hover:bg-amber-500/30'
                            }`}>
                              {i + 1}
                            </div>
                            <span className="text-xs font-bold leading-tight text-white group-hover:text-amber-400 transition-colors">
                              {temaObj.titol}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-white/40 italic font-black">
                              {temaObj.subtemes.length} Capítols
                            </span>
                            <div className="text-white/30">
                              {temaObert ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>
                        </button>

                        {/* Llista de Capítols del Tema (Desplegable) */}
                        {temaObert && (
                          <div className="flex flex-col gap-1 p-2 bg-black/25 border-t border-white/5 animate-in slide-in-from-top-1 duration-150">
                            {temaObj.subtemes.map((subtema, subIdx) => (
                              <motion.button
                                key={subIdx}
                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => onSeleccionarSubtema('B', i, subIdx)}
                                className="w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-white/70 hover:text-amber-400 transition-colors cursor-pointer group/sub"
                              >
                                <span className="text-[11px] font-medium leading-relaxed truncate pr-4">
                                  {subtema}
                                </span>
                                <span className="text-[9px] text-white/20 group-hover/sub:text-amber-400 font-bold">➔</span>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Milestones de progrés lúdic */}
                <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-white/45 tracking-[0.2em]">Estudiats:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {progres.B.map((llegit, i) => (
                        <span 
                          key={i} 
                          className={`text-xs font-black transition-all ${
                            llegit 
                            ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' 
                            : 'text-white/10'
                          }`}
                        >
                          {i + 1}
                        </span>
                      ))}
                    </div>
                    <span className="text-white font-black text-xs italic ml-2">
                      {Math.round((progres.B.filter(Boolean).length / progres.B.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ------------------ ÀMBIT C ------------------ */}
          <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-md shadow-xl">
            {/* Capçalera del Desplegable (Estètica com a bloc d'exàmens) */}
            <button 
              onClick={() => toggleBloc('C')}
              className="w-full p-4 flex items-center justify-between transition-all group hover:bg-white/5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500 rounded-lg text-white">
                  <Shield size={18} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black italic uppercase tracking-[0.2em] text-white/30 leading-none mb-1">
                    Àmbit C
                  </span>
                  <h3 className="font-black italic uppercase text-xs text-white tracking-tight leading-tight">
                    Àmbit de seguretat i policia
                  </h3>
                </div>
              </div>
              
              <div className="text-white/20 mr-2">
                {blocsOberts['C'] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {/* Contingut obert de l'Àmbit C */}
            {blocsOberts['C'] && (
              <div className="flex flex-col gap-3 p-4 bg-black/40 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                <p className="text-[10px] text-white/50 leading-relaxed italic mb-1">
                  Fes clic sobre qualsevol tema per a desplegar els seus capítols i començar a estudiar directament:
                </p>
                
                <div className="flex flex-col gap-2">
                  {TEMARI_DETALL.C.map((temaObj, i) => {
                    const temaCompletat = progres.C[i];
                    const temaObert = !!temesOberts[`C-${i}`];
                    return (
                      <div key={i} className="flex flex-col border border-white/5 rounded-xl overflow-hidden bg-white/5 shadow-md">
                        {/* Capçalera del Tema */}
                        <button
                          onClick={() => toggleTema(`C-${i}`)}
                          className="w-full text-left p-3 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg font-black italic text-xs flex items-center justify-center transition-colors ${
                              temaCompletat ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30'
                            }`}>
                              {i + 1}
                            </div>
                            <span className="text-xs font-bold leading-tight text-white group-hover:text-amber-400 transition-colors">
                              {temaObj.titol}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-white/40 italic font-black">
                              {temaObj.subtemes.length} Capítols
                            </span>
                            <div className="text-white/30">
                              {temaObert ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>
                        </button>

                        {/* Llista de Capítols del Tema (Desplegable) */}
                        {temaObert && (
                          <div className="flex flex-col gap-1 p-2 bg-black/25 border-t border-white/5 animate-in slide-in-from-top-1 duration-150">
                            {temaObj.subtemes.map((subtema, subIdx) => (
                              <motion.button
                                key={subIdx}
                                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => onSeleccionarSubtema('C', i, subIdx)}
                                className="w-full text-left py-2 px-3 rounded-lg flex items-center justify-between text-white/70 hover:text-amber-400 transition-colors cursor-pointer group/sub"
                              >
                                <span className="text-[11px] font-medium leading-relaxed truncate pr-4">
                                  {subtema}
                                </span>
                                <span className="text-[9px] text-white/20 group-hover/sub:text-amber-400 font-bold">➔</span>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Milestones de progrés lúdic */}
                <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-white/45 tracking-[0.2em]">Estudiats:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {progres.C.map((llegit, i) => (
                        <span 
                          key={i} 
                          className={`text-xs font-black transition-all ${
                            llegit 
                            ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' 
                            : 'text-white/10'
                          }`}
                        >
                          {i + 1}
                        </span>
                      ))}
                    </div>
                    <span className="text-white font-black text-xs italic ml-2">
                      {Math.round((progres.C.filter(Boolean).length / progres.C.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="mt-12 text-center text-white/20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">OposiCatalunya • Area d'estudi</p>
      </footer>
    </div>
  );
}
