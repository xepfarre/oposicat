import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Check, BookOpen, Home, MessageSquare, Bell } from 'lucide-react';

// @ts-ignore
// Explicació per a no-programadors: Importem la mateixa imatge de gent estudiant que tenim al campus de PC de d'OposiCAT.
import fonsTeorica from '../../../../assets/images/fons_teorica_1780343152615.png';

/**
 * Component genèric per mostrar el detall de qualsevol tema.
 * Comentari planer per a no-programadors: Ara el títol està desbloquejat i es desplaça al mètode del scroll.
 * A més, utilitza el fons d'estudi real i el menú de botons inferior corporatiu igualitzat.
 */
interface DetallTemaProps {
  titol: string;
  ambit: string;
  subtemes: string[];
  progres: boolean[];
  onTornar: () => void;
  onToggle: (index: number) => void;
  onSubtemaClick?: (index: number) => void;
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void;
  onAnarInici?: () => void;
}

export default function DetallTemaGeneric({ 
  titol, 
  ambit, 
  subtemes, 
  progres, 
  onTornar, 
  onToggle,
  onSubtemaClick,
  onAnarSeccio,
  onAnarInici
}: DetallTemaProps) {
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
    <div 
      className="fixed inset-0 w-full overflow-y-auto flex flex-col items-center px-6 pb-28 bg-[#00274d] select-none" 
      style={{ 
        WebkitOverflowScrolling: "touch",
        // Comentari planer per a no-programadors: Fons de fons d'estudiants elegant idèntic al temari oficial d'OposiCAT
        backgroundImage: `linear-gradient(to bottom, rgba(0, 39, 77, 0.88), rgba(0, 39, 77, 0.94)), url('${fonsTeorica}')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top"
      }}
    >
      {/* CAPÇALERA ESTÀTICA I DESBLOQUEJADA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 mb-4">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10 relative w-full md:max-w-4xl flex items-center justify-center">
          <button 
            onClick={onTornar}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter select-none pl-6 pr-2 text-white text-center">
            Àmbit <span className="text-blue-400">{ambit}</span>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-2 text-center px-4 max-w-xl">
          <h2 className="text-white text-sm md:text-base font-black italic tracking-normal uppercase opacity-90 leading-tight">
            {titol}
          </h2>
          <div className="h-0.5 w-10 bg-blue-500 rounded-full mb-1 mx-auto" />
          <p className="text-white/60 text-[8px] font-bold uppercase tracking-wider">
            Contingut del Tema
          </p>
        </div>
      </header>

      <main className="w-full md:max-w-4xl flex flex-col items-center pb-6 transition-none">
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-2 shadow-2xl w-full">
          {/* Capçalera de secció */}
          <div className="flex px-5 py-4 border-b border-white/5 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <BookOpen size={16} />
              </div>
              <div className="text-left">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Punts d'Estudi</h2>
                <p className="text-xs text-white/60">Clica per a llegir cadascun d'ells</p>
              </div>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
              Llegit
            </div>
          </div>

          <ul className="flex flex-col md:grid md:grid-cols-2 gap-0.5 mt-2 px-2 pb-2">
            {subtemes.map((sub, i) => (
              <motion.li 
                key={i} 
                onClick={() => onSubtemaClick ? onSubtemaClick(i) : onToggle(i)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)', x: 4 }}
                className="flex gap-4 p-4 rounded-2xl cursor-pointer transition-all group border border-transparent hover:border-white/5 active:scale-[0.99]"
              >
                {/* Indicador de número / Punt */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm transition-colors flex-shrink-0 ${
                  progres[i] ? 'bg-emerald-500 text-white' : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20'
                }`}>
                  {i + 1}
                </div>

                {/* Text descriptiu (Títol del Punt) */}
                <div className="flex-1 flex flex-col justify-center text-left">
                  <span className={`text-sm font-bold transition-all leading-snug ${
                    progres[i] ? 'text-white' : 'text-white/80 group-hover:text-white'
                  }`}>
                    {sub}
                  </span>
                  {/* Petit indicador d'acció */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] uppercase tracking-widest text-blue-400/60 font-black">
                      Llegir Resum
                    </span>
                    <div className="h-px w-4 bg-blue-400/20" />
                  </div>
                </div>

                {/* Checkbox "Llegit" */}
                <div className="flex flex-col items-center gap-1 self-center">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(i);
                    }}
                    className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center flex-shrink-0 ${
                      progres[i] 
                      ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' 
                      : 'bg-white/5 border-white/10 group-hover:border-blue-400/50'
                    }`}
                  >
                    {progres[i] && <Check size={14} className="text-white stroke-[3]" />}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Info adicional */}
        <div className="mt-6 p-5 bg-white/5 rounded-2xl border border-white/5 text-center w-full">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] italic">
            "Recorda que pots tornar a revisar qualsevol punt clicant sobre ell de nou."
          </p>
        </div>
      </main>

      {/* PEU DE PÀGINA NET SENSE EL BOTÓ DE RETURN */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-2">
        <p className="text-[8px] font-black uppercase tracking-wider text-white opacity-40 select-none whitespace-nowrap text-center">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

      {/* Comentari planer per a no-programadors: Barra inferior corporativa idèntica a l'original amb brillantor blau policia. */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-45 bg-[#13355c]/95 backdrop-blur-md border-t border-white/20 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-300"
        style={{ paddingBottom: "calc(5px + env(safe-area-inset-bottom, 6px))" }}
      >
        <div className="w-full max-w-md grid grid-cols-4 gap-1">
          
          {/* Botó 1: Casa (retorna a l'inici original de Mossos directament) */}
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
            onClick={() => onAnarSeccio?.('forum')}
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
            onClick={() => onAnarSeccio?.('noticies')}
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
            onClick={() => onAnarSeccio?.('perfil')}
            className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
          >
            <div className="relative">
              <span className="text-[20px] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
                {avatarEstil}
              </span>
              <span className="absolute -top-1 -right-1 text-[8px] animate-pulse">⭐</span>
            </div>
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Perfil 👮‍♂️
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
