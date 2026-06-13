import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Shield, Landmark, ChevronDown, ChevronUp, Home, MessageSquare, Bell } from 'lucide-react';
import { TEMARI_DETALL } from '../../../constants/temari';

// Explicació per a no-programadors: Importem la mateixa imatge que fem servir a la pàgina de la web de les proves teòriques per mantenir una línia estètica idèntica
// @ts-ignore
import fonsTeorica from "../../../assets/images/fons_teorica_1780343152615.png";

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
  progres,
  onAnarSeccio,
  onAnarInici
}: { 
  onTornar: () => void,
  onAmbitA: () => void,
  onAmbitB: () => void,
  onAmbitC: () => void,
  onSeleccionarTema: (ambit: 'A' | 'B' | 'C', index: number) => void,
  onSeleccionarSubtema: (ambit: 'A' | 'B' | 'C', temaIndex: number, subtemaIndex: number) => void,
  progres: { A: boolean[], B: boolean[], C: boolean[] },
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void,
  onAnarInici?: () => void
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

  // Explicació per a no-programadors: Estat d'àvatar escollit per l'alumne o estudiant, s'executa a l'iniciar per mostrar la icona corporativa personalitzada.
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
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#010915] overflow-y-auto pb-32 px-6" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* Explicació per a no-programadors: Imatge oficial de fons de la prova de teòrica amb l'opacitat adequada (35%) i un degradat que es mescla amb el color fosc #010915 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-full">
        <img 
          src={fonsTeorica} 
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#010915]/90 via-[#010915]/85 to-[#010915]" />
      </div>

      <div className="relative z-10 w-full max-w-sm md:max-w-2xl flex flex-col items-center">
        {/* CAPÇALERA */}
        <header className="pt-10 w-full flex items-center gap-4 mb-8">
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

        <main className="w-full flex flex-col gap-6">
          
          {/* Label: Informació de la secció */}
          {/* Comentari planer: Text de benvinguda a l'Àrea combinant el text indicat de l'estudiant */}
          <div className="bg-white/5 border border-white/10 rounded-2xl py-4 px-5 shadow-xl">
            <p className="text-amber-400 text-xs md:text-sm font-medium leading-relaxed text-center italic">
              "L'area d'esttudi es la teva zona priovada d'estudi. Aqui torbaras resums de cada tema, veuras el que has subratllat tu personalment."
            </p>
          </div>

          {/* Llistat d'Àmbits de la Teòrica */}
          <div className="flex flex-col gap-4">
            
            {/* ------------------ ÀMBIT A ------------------ */}
            <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-black/30 backdrop-blur-md shadow-xl">
              {/* Capçalera del Desplegable */}
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

                          {/* Llista de Capítols del Tema */}
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
              {/* Capçalera del Desplegable */}
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

                          {/* Llista de Capítols del Tema */}
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
              {/* Capçalera del Desplegable */}
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

                          {/* Llista de Capítols del Tema */}
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

      {/* Comentari planer per a no-programadors: Barra inferior de botons del menú corporatiu adaptada visualment amb el color oficial de la web (#010915) per a consistència total. */}
      {onAnarSeccio && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-45 bg-[#010915]/95 backdrop-blur-md border-t border-white/10 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-300"
          style={{ paddingBottom: "calc(5px + env(safe-area-inset-bottom, 6px))" }}
        >
          <div className="w-full max-w-md grid grid-cols-4 gap-1">
            
            {/* Botó 1: Casa (retorna a l'inici de Mossos) */}
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
                {/* Indicador de notificació polsant */}
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
