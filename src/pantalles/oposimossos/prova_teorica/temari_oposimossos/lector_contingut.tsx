import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Highlighter, 
  HelpCircle, 
  PenTool, 
  Save, 
  Sparkles,
  FileText
} from 'lucide-react';
import Markdown from 'react-markdown';

/**
 * Lector de Contingut per als Resums d'OposiMossos (Lògica de "Lego" per al l'estudiant).
 * Optimitzat per a un estudi ràpid, ordenat i modern, seguint el disseny dels desplegables de l'Àrea d'Estudi.
 */
export default function LectorContingut({ 
  onTornar, 
  ambitNom, 
  temaTitol, 
  puntTitol,
  contingutMd,
  contingutOficialHTML,
  completat,
  onMarcarCompletat,
  ambit,
  temaIndex,
  subtemaIndex,
  notesDesades,
  onGuardarNotes
}: { 
  onTornar: () => void,
  ambitNom: string,
  temaTitol: string,
  puntTitol: string,
  contingutMd: string,
  contingutOficialHTML?: string,
  completat: boolean,
  onMarcarCompletat: () => void,
  ambit?: 'A' | 'B' | 'C',
  temaIndex?: number,
  subtemaIndex?: number,
  notesDesades?: string,
  onGuardarNotes?: (notes: string) => void
}) {
  // Comentari per a no-programadors: Lleigeix la posició del desplaçament vertical (scroll) del dispositiu
  const [scrollY, setScrollY] = useState(0);

  // Comentari per a no-programadors: Aquest estat controla quins dels 4 blocs (Resum, Personal, Subratllats, Preguntes) estan expandits o tancats per estudiar
  const [seccionsObertes, setSeccionsObertes] = useState({
    oposi: true,        // El resum d'OposiMossos està obert de sortida per defecte
    teu: false,         // El resum personal de l'estudiant
    subratllat: false,  // Els fragments subratllats sobre el temari d'origen
    preguntes: false    // Les preguntes interactives de convocatòries reals
  });

  // Comentari per a no-programadors: Desa temporalment les notes personals de l'usuari amb memòria persistent (local)
  const [userNotes, setUserNotes] = useState(() => {
    if (notesDesades !== undefined && notesDesades !== "") return notesDesades;
    return localStorage.getItem(`notes-${temaTitol}-${puntTitol}`) || "";
  });

  // Comentari per a no-programadors: Controla si la resposta a la pregunta d'examen ja s'està mostrant en color verd/vermell
  const [mostrarResposta, setMostrarResposta] = useState(false);

  // Comentari per a no-programadors: Indica si els canvis al resum personal s'estan desant correctament al núvol/base de dades
  const [estatDesant, setEstatDesant] = useState<'quiet' | 'desant' | 'desat'>('quiet');

  // Sincronitzar les notes desades de Firestore si es carreguen asíncronament més tard
  useEffect(() => {
    if (notesDesades !== undefined && notesDesades !== "") {
      setUserNotes(notesDesades);
    }
  }, [notesDesades]);

  // Desar notes automàticament amb un petit retard (debouncing) per no col·lapsar Firestore
  useEffect(() => {
    localStorage.setItem(`notes-${temaTitol}-${puntTitol}`, userNotes);
    if (onGuardarNotes) {
      setEstatDesant('desant');
      const handler = setTimeout(() => {
        onGuardarNotes(userNotes);
        setEstatDesant('desat');
        // Després d'un moment tornem a l'estat silenciós/quiet
        const timeoutQuiet = setTimeout(() => setEstatDesant('quiet'), 2000);
        return () => clearTimeout(timeoutQuiet);
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [userNotes, temaTitol, puntTitol, onGuardarNotes]);

  // Extreiem els subratllats de l'HTML desat
  const extractHighlights = (html?: string) => {
    if (!html) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const spans = doc.querySelectorAll('.highlighter-span');
      return Array.from(spans).map(span => span.textContent || "");
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const highlights = extractHighlights(contingutOficialHTML);

  // Comentari per a no-programadors: Obrir i tancar de forma animada qualsevol apartat amb un sol clic
  const toggleSeccio = (seccio: keyof typeof seccionsObertes) => {
    setSeccionsObertes(prev => ({ ...prev, [seccio]: !prev[seccio] }));
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-24">
      
      {/* CAPÇALERA FLOTANT FIXA */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrollY > 20 
        ? 'bg-[#00274d]/95 backdrop-blur-xl border-white/10 shadow-2xl py-3 md:py-4' 
        : 'bg-[#00274d] border-transparent py-4 md:py-6'
      }`}>
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-4">
          <button 
            onClick={onTornar}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90 cursor-pointer flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={16} className="md:size-5" />
          </button>
          
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[8px] md:text-xs font-black uppercase text-[#00f296] tracking-[0.15em] whitespace-nowrap">
                {ambitNom}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-[8px] md:text-xs font-bold text-white/40 uppercase truncate">
                {temaTitol}
              </span>
            </div>
            <h1 className="text-xs md:text-lg font-black italic uppercase text-white tracking-wider truncate leading-none">
              {puntTitol}
            </h1>
          </div>

          {/* Indicador superior de si està estudiat */}
          <div className="shrink-0 flex items-center gap-2">
            <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
              completat 
              ? 'bg-[#00f296]/15 text-[#00f296] border border-[#00f296]/30' 
              : 'bg-white/5 text-white/40 border border-white/10'
            }`}>
              {completat ? 'Estudiat' : 'Pendent'}
            </span>
          </div>
        </div>
      </header>

      {/* CONTINGUT PRINCIPAL EN FORMAT CAIXES DESPLEGABLES (ACORDIONS COHERENTS) */}
      <main className="w-full max-w-4xl px-6 pt-24 md:pt-32 pb-32 flex flex-col gap-5">
        
        {/* Descripció didàctica adaptada */}
        <div className="text-center md:text-left mb-2">
          <p className="text-[10px] md:text-xs text-white/50 tracking-wide font-medium">
            Entorn de lectura avançat. Fes clic sobre qualsevol secció de sota per anar modificant, prenent notes o posant-te a prova sobre aquest capítol de l'oposició:
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓ 1: RESUM OPOSIMOSSOS */}
        {/* ========================================================================= */}
        <div className="flex flex-col border border-white/5 rounded-2xl overflow-hidden bg-white/5 shadow-xl transition-all">
          <button 
            onClick={() => toggleSeccio('oposi')}
            className="w-full text-left p-4 md:p-6 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-colors border ${
                seccionsObertes.oposi 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-white/5 text-white/60 border-white/10 group-hover:bg-white/10'
              }`}>
                <FileText size={16} className="md:size-5" />
              </div>
              <div>
                <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-emerald-400 block mb-0.5">ESTUDI INTEL·LIGENT</span>
                <h3 className="text-xs md:text-base font-black italic uppercase text-white tracking-widest">
                  Resum d'OposiMossos
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] md:text-xs font-black uppercase text-white/30 tracking-widest hidden sm:inline">
                Sintetitzat
              </span>
              <div className="text-white/30 group-hover:text-emerald-400 transition-colors">
                {seccionsObertes.oposi ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {seccionsObertes.oposi && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/5 bg-black/30"
              >
                <div className="p-6 md:p-10 prose prose-invert prose-emerald max-w-none 
                  prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-emerald-300
                  prose-p:text-white/90 prose-p:leading-relaxed prose-p:text-xs md:prose-p:text-sm
                  prose-strong:text-amber-400 prose-strong:font-black
                  prose-li:text-white/80 md:prose-li:text-sm prose-li:marker:text-emerald-500
                  prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-500/5 prose-blockquote:py-1.5 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                  [&_*]:text-white/90
                  markdown-body
                ">
                  <Markdown>{contingutMd}</Markdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓ 2: EL TEU RESUM PROPI */}
        {/* ========================================================================= */}
        <div className="flex flex-col border border-white/5 rounded-2xl overflow-hidden bg-white/5 shadow-xl transition-all">
          <button 
            onClick={() => toggleSeccio('teu')}
            className="w-full text-left p-4 md:p-6 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-colors border ${
                seccionsObertes.teu 
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                : 'bg-white/5 text-white/60 border-white/10 group-hover:bg-white/10'
              }`}>
                <PenTool size={16} className="md:size-5" />
              </div>
              <div>
                <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-blue-400 block mb-0.5">EL MEU ESPAI</span>
                <h3 className="text-xs md:text-base font-black italic uppercase text-white tracking-widest">
                  El teu resum personal
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Comentari per a no-programadors: Petit pilot d'estat de desat automàtic */}
              {estatDesant === 'desant' && (
                <span className="text-[8px] md:text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Desant...
                </span>
              )}
              {estatDesant === 'desat' && (
                <span className="text-[8px] md:text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={10} />
                  Desat
                </span>
              )}
              {estatDesant === 'quiet' && userNotes.length > 0 && (
                <span className="text-[8px] md:text-xs font-bold text-white/40">
                  {userNotes.length} caràcters
                </span>
              )}
              <div className="text-white/30 group-hover:text-blue-400 transition-colors">
                {seccionsObertes.teu ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {seccionsObertes.teu && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/5 bg-black/30"
              >
                <div className="p-5 md:p-8 flex flex-col gap-4">
                  <p className="text-[10px] md:text-xs text-white/50 leading-relaxed italic">
                    Aquí pots anar escrivint els teus propis esquemes, regles o idees mnemotècniques mentre estudies el resum. S'emmagatzema sol automàticament al teu núvol d'usuari:
                  </p>
                  <textarea 
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Escriu les teves anotacions o punts clau de la lliçó aquí..."
                    className="w-full min-h-[160px] md:min-h-[260px] bg-black/40 border border-white/10 rounded-xl p-4 md:p-6 text-white text-xs md:text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none font-medium leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[9px] md:text-xs text-white/30 italic">
                    <span>Configurat amb sincronització asíncrona segura.</span>
                    <span className="flex items-center gap-1"><Save size={10} /> Model Multicapa</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓ 3: EL QUE HAS SUBRATLLAT */}
        {/* ========================================================================= */}
        <div className="flex flex-col border border-white/5 rounded-2xl overflow-hidden bg-white/5 shadow-xl transition-all">
          <button 
            onClick={() => toggleSeccio('subratllat')}
            className="w-full text-left p-4 md:p-6 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-colors border ${
                seccionsObertes.subratllat 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-white/5 text-white/60 border-white/10 group-hover:bg-white/10'
              }`}>
                <Highlighter size={16} className="md:size-5" />
              </div>
              <div>
                <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-amber-400 block mb-0.5">LECTURA FOCALITZADA</span>
                <h3 className="text-xs md:text-base font-black italic uppercase text-white tracking-widest">
                  Highlights del Temari Oficial
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[9px] md:text-xs font-bold px-2 py-0.5 rounded-full ${
                highlights.length > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/30'
              }`}>
                {highlights.length} Highlights
              </span>
              <div className="text-white/30 group-hover:text-amber-400 transition-colors">
                {seccionsObertes.subratllat ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {seccionsObertes.subratllat && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/5 bg-black/30"
              >
                <div className="p-6 md:p-8 flex flex-col gap-4">
                  <p className="text-[10px] md:text-xs text-white/50 leading-relaxed italic mb-1">
                    Aquí s'agrupen tots els fragments que hagis decidit subratllat en groc fluorescent a la lectura del temari oficial d'OposiCAT per poder rellegir-los directament:
                  </p>
                  
                  <div className="space-y-3.5">
                    {highlights.length > 0 ? (
                      highlights.map((textFragment, i) => (
                        <div key={i} className="bg-amber-400/10 border-l-4 border-amber-400 p-3.5 md:p-5 rounded-r-xl">
                          <p className="text-xs md:text-sm text-white/95 italic leading-relaxed">"{textFragment}"</p>
                          <span className="text-[8px] md:text-[9px] font-black uppercase text-amber-400 mt-2 block tracking-widest">
                            — SUBRATLLAT NÚMERO {i + 1}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 md:py-12 flex flex-col items-center gap-3 opacity-40 text-center">
                        <div className="w-10 h-10 rounded-full border border-dashed border-amber-400/30 flex items-center justify-center">
                          <Highlighter size={16} className="text-amber-400/50" />
                        </div>
                        <p className="text-[10px] md:text-xs uppercase font-black tracking-widest text-[#FFDF00] max-w-sm">
                          Encara no has subratllat cap fragment al text de convocatòria. Comença a pintar i apareixerà aquí dret!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓ 4: PREGUNTES OFICIALS */}
        {/* ========================================================================= */}
        <div className="flex flex-col border border-white/5 rounded-2xl overflow-hidden bg-white/5 shadow-xl transition-all">
          <button 
            onClick={() => toggleSeccio('preguntes')}
            className="w-full text-left p-4 md:p-6 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-colors border ${
                seccionsObertes.preguntes 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                : 'bg-white/5 text-white/60 border-white/10 group-hover:bg-white/10'
              }`}>
                <HelpCircle size={16} className="md:size-5" />
              </div>
              <div>
                <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-purple-400 block mb-0.5">AUTOAVALUACIÓ</span>
                <h3 className="text-xs md:text-base font-black italic uppercase text-white tracking-widest">
                  Preguntes oficials
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[8px] md:text-xs font-black uppercase text-purple-400/70 tracking-widest hidden sm:inline">
                Exàmens Reals
              </span>
              <div className="text-white/30 group-hover:text-purple-400 transition-colors">
                {seccionsObertes.preguntes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {seccionsObertes.preguntes && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/5 bg-black/30"
              >
                <div className="p-5 md:p-8 flex flex-col gap-4">
                  <p className="text-[10px] md:text-xs text-white/50 leading-relaxed italic">
                    Practica amb preguntes extretes d'oposicions reals anteriors de la Generalitat de Catalunya corresponents a aquest tema d'estudi:
                  </p>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-5 md:p-7 shadow-xl">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                      <span className="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest">
                        CONVOCATÒRIA MOSSOS D'ESQUADRA
                      </span>
                      <span className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase">
                        PREGUNTA D'EXAMEN
                      </span>
                    </div>
                    
                    <p className="text-xs md:text-base text-white font-bold leading-relaxed mb-5">
                      "Segons el material d'estudi oficial analitzat, com es defineix Catalunya per part del conegut historiador Vicens i Vives?"
                    </p>
                    
                    <div className="flex flex-col gap-2.5">
                      {[
                        { id: 'a', t: "Un país completament obert a l'exterior" },
                        { id: 'b', t: "Un equilibri basat en redós i passadís" },
                        { id: 'c', t: "Un territori sense canvis des de l'època carolíngia" },
                        { id: 'd', t: "El nucli original de tota la civilització mediterrània occidental" }
                      ].map((opt) => (
                        <div 
                          key={opt.id}
                          className={`p-3 md:p-4 rounded-xl border text-xs md:text-sm font-bold transition-all ${
                            mostrarResposta 
                            ? opt.id === 'b'
                              ? 'bg-[#00f296]/20 border-[#00f296] text-[#00f296] shadow-[0_0_15px_rgba(0,242,150,0.15)] animate-bounce'
                              : 'bg-red-500/5 border-red-500/20 text-white/25'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="text-[9px] font-black uppercase opacity-40 mr-2">{opt.id.toUpperCase()} )</span>
                          {opt.t}
                        </div>
                      ))}
                    </div>

                    {!mostrarResposta ? (
                      <button 
                        onClick={() => setMostrarResposta(true)}
                        className="w-full mt-5 py-3.5 bg-[#FFDF00] hover:bg-[#fff266] text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-yellow-950/20 cursor-pointer text-center"
                      >
                        Comprova quina és la correcta
                      </button>
                    ) : (
                      <div className="mt-4 p-3 bg-emerald-500/15 border border-[#00f296]/30 rounded-xl text-center">
                        <p className="text-[9px] md:text-xs text-[#00f296] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 leading-none">
                          <Sparkles size={11} className="animate-spin" /> EXCEL·LENT! LA RESPOSTA CORRECTA ÉS LA B
                        </p>
                        <p className="text-[9px] text-white/40 mt-1 italic font-medium leading-relaxed">
                          La combinació de muntanya i costa ens configura des de l'antiguitat sota aquesta definició.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* BOTÓ DE PROGRESS: MARCAR COM A ESTUDIAT AL FINAL DE LA PANTALLA */}
        {/* ========================================================================= */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-[10px] md:text-xs text-white/40 leading-relaxed max-w-lg text-center font-medium">
            Una vegada hagis acabat de repassar el resum d'OposiMossos i d'introduir les teves notes claus, recorda marcar la lliçó per visualitzar-la correctament al panell de progrés general:
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onMarcarCompletat}
            className={`px-8 py-4 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-3 border shadow-xl cursor-pointer transition-all ${
              completat 
              ? 'bg-[#00f296] text-slate-950 border-[#00f296] font-black shadow-[#00f296]/20' 
              : 'bg-white/5 hover:bg-white/10 text-white/90 border-white/15'
            }`}
          >
            {completat ? (
              <>
                <CheckCircle2 size={16} className="stroke-[3]" />
                TEMA ESTUDIAT CORRECtament
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full border border-white/40" />
                Marcar Tema com a EstUDIAT
              </>
            )}
          </motion.button>
        </div>

      </main>
    </div>
  );
}
