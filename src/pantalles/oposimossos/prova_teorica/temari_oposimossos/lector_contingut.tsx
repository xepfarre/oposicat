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
  completat,
  onMarcarCompletat
}: { 
  onTornar: () => void,
  ambitNom: string,
  temaTitol: string,
  puntTitol: string,
  contingutMd: string,
  completat: boolean,
  onMarcarCompletat: () => void
}) {
  const [scrollY, setScrollY] = useState(0);

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
        ? 'bg-[#00274d]/90 backdrop-blur-xl py-3 border-white/10 shadow-2xl' 
        : 'bg-transparent py-6 border-transparent'
      }`}>
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-4">
          <button 
            onClick={onTornar}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-[0.2em] whitespace-nowrap">
                {ambitNom}
              </span>
              <div className="h-px w-3 bg-white/20" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">
                {temaTitol}
              </span>
            </div>
            <h1 className="text-sm font-black italic uppercase text-white tracking-widest truncate leading-none">
              {puntTitol}
            </h1>
          </div>
        </div>
      </header>

      {/* CONTINGUT DEL RESUM */}
      <main className="w-full max-w-2xl px-6 pt-32 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/20 backdrop-blur-sm rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Header del Resum */}
          <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-transparent border-b border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-900/40">
                <LayoutPanelLeft size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Resum d'Estudi</span>
            </div>
            <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-tight">
              {puntTitol}
            </h2>
          </div>

          {/* Cos del Text - Markdown adaptat per a resums */}
          <div className="p-8 md:p-10">
            <div className="prose prose-invert prose-emerald max-w-none 
              prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-emerald-400
              prose-p:text-white/80 prose-p:leading-relaxed prose-p:text-base
              prose-strong:text-emerald-300 prose-strong:font-black
              prose-li:text-white/70 prose-li:marker:text-emerald-500
              prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-500/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              markdown-body
            ">
              <Markdown>{contingutMd}</Markdown>
            </div>
          </div>
        </motion.div>
      </main>

      {/* BARRA INFERIOR D'ACCIONS */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 w-full bg-black/60 backdrop-blur-2xl border-t border-white/10 p-6 z-50 flex justify-center"
        >
          <motion.div className="w-full max-w-lg flex flex-col items-center gap-4">
            <button 
              onClick={onMarcarCompletat}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black italic uppercase tracking-widest text-xs transition-all shadow-xl ${
                completat 
                ? 'bg-emerald-500 text-white shadow-emerald-500/40 cursor-default' 
                : 'bg-white text-black hover:bg-emerald-500 hover:text-white active:scale-95'
              }`}
            >
              <CheckCircle2 size={20} />
              {completat ? 'Estudiat Correctament' : 'Marcar com a estudiat'}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
