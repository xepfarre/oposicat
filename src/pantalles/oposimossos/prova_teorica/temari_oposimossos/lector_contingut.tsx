import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, CheckCircle2, ChevronRight, ChevronLeft, LayoutPanelLeft } from 'lucide-react';
import Markdown from 'react-markdown';

/**
 * Lector de Contingut per als Resums d'OposiMossos.
 * Optimitzat per a un estudi ràpid i eficient.
 */
export default function LectorContingut({ 
  onTornar, 
  ambitNom, 
  temaTitol, 
  puntTitol,
  contingutMd,
  contingutOficialHTML,
  completat,
  onMarcarCompletat
}: { 
  onTornar: () => void,
  ambitNom: string,
  temaTitol: string,
  puntTitol: string,
  contingutMd: string,
  contingutOficialHTML?: string,
  completat: boolean,
  onMarcarCompletat: () => void
}) {
  const [scrollY, setScrollY] = useState(0);
  const [menuObert, setMenuObert] = useState(false);
  const [opcionsMostra, setOpcionsMostra] = useState({
    oposi: true,
    teu: false,
    subratllat: false,
    preguntes: false
  });
  const [userNotes, setUserNotes] = useState(() => {
    return localStorage.getItem(`notes-${temaTitol}-${puntTitol}`) || "";
  });
  const [mostrarResposta, setMostrarResposta] = useState(false);

  // Desar notes automàticament
  useEffect(() => {
    localStorage.setItem(`notes-${temaTitol}-${puntTitol}`, userNotes);
  }, [userNotes, temaTitol, puntTitol]);

  // Extreiem els subratllats de l'HTML desat
  const extractHighlights = (html?: string) => {
    if (!html) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const spans = doc.querySelectorAll('.highlighter-span');
    return Array.from(spans).map(span => span.textContent || "");
  };

  const highlights = extractHighlights(contingutOficialHTML);

  const toggleOpcio = (opcio: keyof typeof opcionsMostra) => {
    setOpcionsMostra(prev => ({ ...prev, [opcio]: !prev[opcio] }));
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d]">
      
      {/* CAPÇALERA FLOTANT / FIXA */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrollY > 20 
        ? 'bg-[#00274d]/90 backdrop-blur-xl border-white/10 shadow-2xl' 
        : 'bg-[#00274d] border-transparent'
      }`}>
        <div className="max-w-4xl md:max-w-6xl mx-auto px-6 py-6 md:py-10 flex items-start gap-4 md:gap-8">
          <button 
            onClick={onTornar}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90 mt-1 md:p-4"
          >
            <ArrowLeft size={18} className="md:size-6" />
          </button>
          
          <div className="flex-1 flex flex-col gap-3 md:gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                <span className="text-[9px] md:text-sm font-black uppercase text-emerald-400 tracking-[0.2em] whitespace-nowrap">
                  {ambitNom}
                </span>
                <div className="h-px w-3 md:w-6 bg-white/20" />
                <span className="text-[9px] md:text-sm font-bold text-white/40 uppercase tracking-widest truncate">
                  {temaTitol}
                </span>
              </div>
              <h1 className="text-sm md:text-2xl font-black italic uppercase text-white tracking-widest truncate leading-none">
                {puntTitol}
              </h1>
            </div>

            {/* Menú Què vols mostrar? */}
            <div className="relative self-start">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuObert(!menuObert);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-3 rounded-lg border transition-all text-[10px] md:text-sm font-black uppercase tracking-widest ${
                  menuObert 
                  ? 'bg-amber-400 border-amber-400 text-black' 
                  : 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10'
                }`}
              >
                Què vols mostrar
                <LayoutPanelLeft size={14} className="md:size-5" />
              </button>

              <AnimatePresence>
                {menuObert && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 mt-2 w-56 md:w-80 bg-[#001a33] border border-white/10 rounded-xl shadow-2xl p-2 z-[100]"
                  >
                    <p className="text-[8px] md:text-xs font-black uppercase text-white/30 px-3 py-2 tracking-[0.2em]">Què vols mostrar?</p>
                    <div className="flex flex-col gap-1 md:gap-2">
                      {[
                        { id: 'oposi', label: 'Resum Oposi', color: 'text-emerald-400' },
                        { id: 'teu', label: 'El teu resum', color: 'text-blue-400' },
                        { id: 'subratllat', label: 'El que has Subratllat', color: 'text-amber-400' },
                        { id: 'preguntes', label: 'Preguntes oficials', color: 'text-purple-400' }
                      ].map((item) => (
                        <button 
                          key={item.id}
                          onClick={() => toggleOpcio(item.id as keyof typeof opcionsMostra)}
                          className={`flex items-center gap-3 px-3 py-2.5 md:py-4 rounded-lg transition-all text-left ${
                            opcionsMostra[item.id as keyof typeof opcionsMostra] 
                            ? 'bg-white/10 text-white' 
                            : 'text-white/40 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-4 h-4 md:w-6 md:h-6 rounded border flex items-center justify-center transition-all ${
                            opcionsMostra[item.id as keyof typeof opcionsMostra] 
                            ? 'bg-amber-400 border-amber-400' 
                            : 'border-white/20'
                          }`}>
                            {opcionsMostra[item.id as keyof typeof opcionsMostra] && <CheckCircle2 size={10} className="text-black stroke-[3] md:size-4" />}
                          </div>
                          <span className={`text-[11px] md:text-sm font-bold uppercase tracking-tight ${opcionsMostra[item.id as keyof typeof opcionsMostra] ? item.color : ''}`}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* CONTINGUT DINÀMIC */}
      <main className="w-full max-w-2xl md:max-w-4xl px-6 pt-40 md:pt-60 pb-32 flex flex-col gap-8 md:gap-14">
        
        {/* SECTION: RESUM OPOSI */}
        <AnimatePresence>
          {opcionsMostra.oposi && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/20 backdrop-blur-sm rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl"
            >
              <div className="p-4 md:p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 md:p-3 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-900/40">
                    <LayoutPanelLeft size={14} className="md:size-6" />
                  </div>
                  <span className="text-[10px] md:text-base font-black uppercase tracking-[0.3em] text-emerald-400">Resum d'OposiMossos</span>
                </div>
              </div>
              <div className="p-6 md:p-14 prose prose-invert prose-emerald max-w-none 
                prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-emerald-400
                prose-p:text-white prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg
                prose-strong:text-white prose-strong:font-black
                prose-li:text-white md:prose-li:text-lg prose-li:marker:text-emerald-500
                prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-500/5 prose-blockquote:py-1 prose-blockquote:px-4 md:prose-blockquote:px-8 prose-blockquote:rounded-r-lg
                [&_*]:text-white 
                markdown-body
              ">
                <Markdown>{contingutMd}</Markdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION: EL TEU RESUM */}
        <AnimatePresence>
          {opcionsMostra.teu && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/20 backdrop-blur-sm rounded-[2rem] border border-blue-500/30 overflow-hidden shadow-2xl"
            >
              <div className="p-4 md:p-8 bg-gradient-to-br from-blue-500/10 to-transparent border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 md:p-3 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-900/40">
                    <BookOpen size={14} className="md:size-6" />
                  </div>
                  <span className="text-[10px] md:text-base font-black uppercase tracking-[0.3em] text-blue-400">El teu resum propi</span>
                </div>
              </div>
              <div className="p-6 md:p-10">
                <textarea 
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Escriu aquí les teves pròpies notes o regles mnemotècniques..."
                  className="w-full min-h-[200px] md:min-h-[400px] bg-white/5 border border-white/10 rounded-xl p-4 md:p-8 text-white text-sm md:text-lg focus:outline-none focus:border-blue-500/50 transition-all resize-none font-medium leading-relaxed"
                />
                <p className="mt-4 text-[10px] md:text-sm text-white/30 italic">Aquest espai és exclusiu per a tu. Les teves notes s'emmagatzeman localment.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION: EL QUE HAS SUBRATLLAT */}
        <AnimatePresence>
          {opcionsMostra.subratllat && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/20 backdrop-blur-sm rounded-[2rem] border border-amber-500/30 overflow-hidden shadow-2xl"
            >
              <div className="p-4 md:p-8 bg-gradient-to-br from-amber-500/10 to-transparent border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 md:p-3 bg-amber-500 rounded-lg text-white shadow-lg shadow-amber-900/40">
                    <Clock size={14} className="md:size-6" />
                  </div>
                  <span className="text-[10px] md:text-base font-black uppercase tracking-[0.3em] text-amber-500">Highlights del Temari Oficial</span>
                </div>
              </div>
              <div className="p-8 md:p-14">
                <div className="space-y-4 md:space-y-8">
                  {highlights.length > 0 ? (
                    highlights.map((h, i) => (
                      <div key={i} className="bg-amber-400/10 border-l-4 border-amber-400 p-4 md:p-8 rounded-r-xl">
                        <p className="text-sm md:text-xl text-white/90 italic">"{h}"</p>
                        <span className="text-[8px] md:text-xs font-black uppercase text-amber-400 mt-2 md:mt-4 block tracking-widest">— Subratllat al Temari Oficial</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 md:py-16 flex flex-col items-center gap-4 md:gap-8 opacity-30 text-center">
                      <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-dashed border-amber-400/30" />
                      <p className="text-[10px] md:text-sm uppercase font-black tracking-widest text-amber-400/50">Encara no has subratllat res en aquest apartat del temari oficial</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION: PREGUNTES OFICIALS */}
        <AnimatePresence>
          {opcionsMostra.preguntes && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/20 backdrop-blur-sm rounded-[2rem] border border-purple-500/30 overflow-hidden shadow-2xl"
            >
              <div className="p-4 md:p-8 bg-gradient-to-br from-purple-500/10 to-transparent border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 md:p-3 bg-purple-500 rounded-lg text-white shadow-lg shadow-purple-900/40">
                    <CheckCircle2 size={14} className="md:size-6" />
                  </div>
                  <span className="text-[10px] md:text-base font-black uppercase tracking-[0.3em] text-purple-400">Exàmens Oficials Anteriors</span>
                </div>
              </div>
              <div className="p-8 md:p-14 flex flex-col gap-6 md:gap-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 shadow-xl">
                  <div className="flex items-center justify-between mb-4 md:mb-8">
                    <span className="text-[10px] md:text-sm font-black text-purple-400 uppercase tracking-widest">Convocatòria 2025</span>
                    <span className="text-[9px] md:text-xs font-bold text-white/30 uppercase">Pregunta Oficial</span>
                  </div>
                  
                  <p className="text-base md:text-2xl text-white font-bold leading-tight mb-6 md:mb-10">"Com defineix Vicens i Vives Catalunya?"</p>
                  
                  <div className="flex flex-col gap-2.5 md:gap-4">
                    {[
                      { id: 'a', t: "Un país meravellós" },
                      { id: 'b', t: "Passadís i redós" },
                      { id: 'c', t: "Com part d'Espanya" },
                      { id: 'd', t: "El país més antic d'Europa" }
                    ].map((opt) => (
                      <div 
                        key={opt.id}
                        className={`p-3 md:p-6 rounded-xl border text-sm md:text-lg font-bold transition-all px-4 md:px-8 ${
                          mostrarResposta 
                          ? opt.id === 'b'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-red-500/5 border-red-500/20 text-white/20'
                          : 'bg-white/5 border-white/10 text-white'
                        }`}
                      >
                        <span className="text-[10px] md:text-xs uppercase opacity-40 mr-3">{opt.id} —</span>
                        {opt.t}
                      </div>
                    ))}
                  </div>

                  {!mostrarResposta && (
                    <button 
                      onClick={() => setMostrarResposta(true)}
                      className="w-full mt-6 md:mt-10 py-3 md:py-6 bg-purple-500 hover:bg-purple-400 text-white rounded-xl font-black uppercase text-[10px] md:text-sm tracking-widest transition-all active:scale-95 shadow-lg shadow-purple-900/40"
                    >
                      Mostra la correcta
                    </button>
                  )}
                  
                  {mostrarResposta && (
                    <p className="mt-4 md:mt-8 text-[10px] md:text-sm text-emerald-400 font-bold uppercase text-center tracking-widest animate-pulse">
                      La resposta correcta és la B
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}
