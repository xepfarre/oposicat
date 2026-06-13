import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Check, Home, MessageSquare, Bell } from 'lucide-react';

import { TEMARI_DETALL } from '../../../../constants/temari';

// @ts-ignore
// Explicació per a no-programadors: Importem la mateixa imatge de gent estudiant que tenim al campus de PC de d'OposiCAT.
import fonsTeorica from '../../../../assets/images/fons_teorica_1780343152615.png';

/**
 * Component per a l'Àmbit A: Coneixements de l'entorn.
 * Comentari planer per a no-programadors: Ara el títol està desbloquejat i es desplaça al mètode del scroll.
 * A més, utilitza el fons d'estudi real i el menú de botons inferior corporatiu igualitzat.
 */
export default function TemariAmbitA({ 
  onTornar, 
  onTemaSeleccionat, 
  progres, 
  progresDetallat,
  onToggle,
  onAnarSeccio,
  onAnarInici
}: { 
  onTornar: () => void, 
  onTemaSeleccionat: (index: number) => void,
  progres: boolean[],
  progresDetallat: Record<number, boolean[]>,
  onToggle: (i: number) => void,
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void,
  onAnarInici?: () => void
}) {
  const [avatarEstil, setAvatarEstil] = useState<string>("👮‍♂️");
  const temes = TEMARI_DETALL.A.map(t => t.titol);

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

  // Funció per canviar l'estat d'un tema (marcar/desmarcar)
  const handleToggle = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitem que el clic es propagui a la navegació del tema
    onToggle(index);
  };

  /**
   * Gestiona el clic a tot l'element de la llista.
   * Navega al detall del tema seleccionat.
   */
  const handleItemClick = (index: number) => {
    onTemaSeleccionat(index);
  };

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
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10 relative">
          <button 
            onClick={onTornar}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-3xl font-black italic tracking-tighter select-none pl-6 pr-2">
            <span className="text-white">Oposi </span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-white text-md font-black italic tracking-tighter uppercase opacity-90">
            Àmbit A
          </h2>
          <div className="h-0.5 w-10 bg-blue-500 rounded-full mb-1" />
          <p className="text-white/60 text-[8px] font-bold uppercase tracking-wider">
            Coneixements de l'entorn
          </p>
        </div>
      </header>

      <main className="w-full md:max-w-4xl flex flex-col items-center pb-6 transition-none">
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-2 shadow-2xl w-full">
          {/* Capçaleres de la llista */}
          <div className="hidden md:flex px-4 py-3 border-b border-white/5 items-center">
             <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Llistat de Temes oficials</span>
          </div>
          <div className="flex md:hidden px-4 py-3 border-b border-white/5 items-center">
            <div className="w-8 mr-4"></div> {/* Espai per al número */}
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-white/30">Tema</span>
            <span className="w-6 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Llegit</span>
          </div>

          <ul className="flex flex-col md:grid md:grid-cols-2 mt-1">
            {temes.map((tema, i) => (
              <React.Fragment key={i}>
                <motion.li 
                  onClick={() => handleItemClick(i)}
                  whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.02)' }}
                  className="flex gap-4 p-5 rounded-2xl cursor-pointer transition-all group"
                >
                  {/* Número del tema */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black italic text-sm transition-colors mt-0.5 ${
                    progres[i] ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {i + 1}
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-1">
                    <span className={`text-sm md:text-base font-bold leading-tight transition-colors ${
                      progres[i] ? 'text-white' : 'text-white/80 group-hover:text-white'
                    }`}>
                      {tema}
                    </span>

                    {/* Milestone Detallat (LLEGIT: 1 2 3...) */}
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Llegit:</span>
                      <div className="flex gap-1.5 focus:outline-none">
                        {progresDetallat[i] && progresDetallat[i].map((llegit, idx) => (
                          <span 
                            key={idx} 
                            className={`text-[9px] font-black transition-all ${
                              llegit 
                              ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' 
                              : 'text-white/5'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Separador vertical */}
                  <div className="w-px h-8 bg-white/10 self-center mx-1" />

                  {/* Checkbox "Llegit" */}
                  <div className="flex flex-col items-center gap-1 self-center">
                    <div 
                      onClick={(e) => handleToggle(i, e)}
                      className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${
                        progres[i] 
                        ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                        : 'bg-white/5 border-white/10 group-hover:border-blue-400/50'
                      }`}
                    >
                      {progres[i] && <Check size={14} className="text-white stroke-[3]" />}
                    </div>
                  </div>
                </motion.li>
                
                {/* Línia de separació gris entre temes (exceptuant l'últim) */}
                {i < temes.length - 1 && (
                  <div className="mx-6 border-b border-white/5 md:hidden" />
                )}
              </React.Fragment>
            ))}
          </ul>
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
