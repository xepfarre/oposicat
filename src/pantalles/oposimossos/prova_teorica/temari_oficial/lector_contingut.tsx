import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, CheckCircle2, Highlighter, Eraser } from 'lucide-react';

/**
 * Component per llegir el contingut literal d'un punt del temari.
 * Inclou funcionalitat de subratllat i goma d'esborrar amb persistència.
 */
interface LectorContingutProps {
  titol: string;
  subtitol: string;
  contingutOriginal: string;
  contingutDesat?: string;
  completat: boolean;
  onTornar: () => void;
  onMarcarCompletat: () => void;
  onGuardarContingut: (html: string) => void;
}

export default function LectorContingut({ 
  titol, 
  subtitol, 
  contingutOriginal, 
  contingutDesat,
  completat,
  onTornar, 
  onMarcarCompletat,
  onGuardarContingut
}: LectorContingutProps) {
  const [einaActiva, setEinaActiva] = useState<'highlighter' | 'eraser' | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);

  // Formatem el contingut original a HTML (paràgrafs) si no n'hi ha cap de desat
  const inicialitzarContingut = () => {
    if (contingutDesat) return contingutDesat;
    return contingutOriginal.split('\n\n').map(p => 
      `<p class="text-white/90 text-sm md:text-base leading-relaxed mb-6 font-medium text-justify italic transition-all">${p}</p>`
    ).join('');
  };
  
  /**
   * Gestiona el subratllat del text seleccionat.
   */
  const handleSubratllar = () => {
    if (einaActiva !== 'highlighter') return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    // Afegim una classe identificadora per a la goma d'esborrar
    span.className = 'highlighter-span bg-yellow-400/80 text-black px-1 rounded-sm shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all cursor-pointer';
    
    try {
      range.surroundContents(span);
      selection.removeAllRanges();
      
      // Guardem el nou estat HTML
      if (articleRef.current) {
        onGuardarContingut(articleRef.current.innerHTML);
      }
    } catch (e) {
      console.warn("No es pot subratllar a través de múltiples nodes complexos.");
    }
  };

  /**
   * Gestiona l'esborrat de subratllats.
   */
  const handleEsborrarFocus = (e: React.MouseEvent | React.TouchEvent) => {
    if (einaActiva !== 'eraser') return;
    
    const target = e.target as HTMLElement;
    if (target.classList.contains('highlighter-span')) {
      const parent = target.parentNode;
      if (parent) {
        // Tornem el contingut al seu lloc original (unwrap)
        while (target.firstChild) {
          parent.insertBefore(target.firstChild, target);
        }
        parent.removeChild(target);
        
        // Guardem el nou estat HTML sense el subratllat
        if (articleRef.current) {
          onGuardarContingut(articleRef.current.innerHTML);
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-32 bg-[#00274d] overflow-y-auto relative">
      {/* CAPÇALERA FIXA */}
      <header className="sticky top-0 z-30 w-full bg-[#00274d]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={onTornar}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase text-amber-400 tracking-widest mb-0.5 truncate">{subtitol}</p>
          <h1 className="text-sm font-bold text-white leading-tight truncate">{titol}</h1>
        </div>
      </header>

      {/* LABEL INFORMATIU SUPERIOR */}
      <div className="w-full max-w-sm md:max-w-2xl px-6 pt-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center gap-3"
        >
          <Highlighter size={14} className="text-blue-400 flex-shrink-0" />
          <p className="text-[10px] text-blue-200/70 font-medium italic">
            Recorda que pots utilitzar el sistema de <span className="text-amber-400 font-black">subrallat</span> de l'APP per a remarcar allo que mes important et sembli.
          </p>
        </motion.div>
      </div>

      <main className="w-full max-w-sm md:max-w-2xl px-6 pt-6">
        {/* ÀREA DE TEXT */}
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onMouseUp={handleSubratllar}
          onTouchEnd={handleSubratllar}
          onClick={handleEsborrarFocus}
          className={`bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative transition-all duration-500 ${
            einaActiva === 'highlighter' ? 'ring-2 ring-amber-400/30 bg-white/[0.07]' : 
            einaActiva === 'eraser' ? 'ring-2 ring-rose-400/30 bg-white/[0.07]' : ''
          }`}
        >
          {/* Icona decorativa */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/50">
            <BookOpen size={24} className="text-white" />
          </div>

          <div 
            ref={articleRef}
            className={`prose prose-invert max-w-none select-text ${
              einaActiva === 'eraser' ? 'cursor-not-allowed opacity-70' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: inicialitzarContingut() }}
          />

          {!contingutOriginal && (
            <div className="py-12 flex flex-col items-center gap-4 opacity-30 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-white" />
              <p className="text-xs uppercase font-black tracking-widest">Pendent d'incorporar el contingut oficial</p>
            </div>
          )}
        </motion.article>

        {/* BOTÓ DE COMPLETAT */}
        {contingutOriginal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex justify-center"
          >
            <button 
              onClick={() => {
                onMarcarCompletat();
                onTornar();
              }}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 ${
                completat 
                ? 'bg-emerald-500 text-white shadow-emerald-900/50' 
                : 'bg-white text-[#00274d] hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              <CheckCircle2 size={20} />
              {completat ? 'Llegit Correctament' : 'Marcar com a llegit'}
            </button>
          </motion.div>
        )}
      </main>

      {/* BOTONS FLOTANTS (FAB TOOLS) */}
      <div className="fixed bottom-10 right-6 z-50 flex flex-col gap-3">
        {/* GOMA D'ESBORRAR */}
        <motion.button
          onClick={() => setEinaActiva(einaActiva === 'eraser' ? null : 'eraser')}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 border ${
            einaActiva === 'eraser' 
            ? 'bg-rose-500 text-white border-rose-400 ring-4 ring-rose-500/20' 
            : 'bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20'
          }`}
          title="Esborrar subrallats"
        >
          <Eraser size={20} />
        </motion.button>

        {/* SUBRATLLADOR */}
        <motion.button
          onClick={() => setEinaActiva(einaActiva === 'highlighter' ? null : 'highlighter')}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 border relative ${
            einaActiva === 'highlighter' 
            ? 'bg-amber-400 text-[#00274d] border-amber-300 ring-4 ring-amber-400/20' 
            : 'bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20'
          }`}
          title="Subrallar text"
        >
          <Highlighter size={20} className={einaActiva === 'highlighter' ? 'animate-pulse' : ''} />
          
          <AnimatePresence>
            {einaActiva && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: -90 }}
                exit={{ opacity: 0, scale: 0.5, x: 10 }}
                className={`absolute whitespace-nowrap px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest pointer-events-none shadow-lg ${
                  einaActiva === 'highlighter' ? 'bg-amber-400 text-[#00274d]' : 'bg-rose-500 text-white'
                }`}
              >
                {einaActiva === 'highlighter' ? 'Mode Subrallat' : 'Mode Esborrar'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 text-center text-white/10 px-8">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] mb-2">Copyright Oficial ISPC • OposiCAT</p>
        <p className="text-[7px] italic opacity-50">S'autoritza l'ús literal del temari oficial per a la plataforma OposiCAT sota els permisos establerts.</p>
      </footer>
    </div>
  );
}

