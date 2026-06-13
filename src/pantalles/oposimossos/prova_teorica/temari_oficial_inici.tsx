import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, BookOpen, Shield, Landmark, Home, MessageSquare, Bell } from 'lucide-react';

// @ts-ignore
// Explicació per a no-programadors: Importem la fantàstica imatge real de gent estudiant generada específicament per a la prova teòrica del campus d'ordinadors d'OposiCAT.
import fonsTeorica from '../../../assets/images/fons_teorica_1780343152615.png';

/**
 * PANTALLA: TemariOficialInici
 * Pantalla del Temari Oficial de Mossos d'Esquadra 2025-2026.
 * Seguint les indicacions de l'usuari, s'ha desbloquejat el títol de la part superior
 * perquè faci scroll natural, s'ha importat la imatge de la web de gent estudiant de fons
 * i s'han incorporat les mateixes pestanyes corporatives que a les pantalles anteriors.
 * 
 * Explicació per a no-programadors: Aquesta pantalla és una peça de "Lego" clarament dividida del backend.
 * mostrant els tres grans àmbits d'estudi oficials per a Mossos (Coneixements, Institucional, i Seguretat).
 * Ubicació: /src/pantalles/oposimossos/prova_teorica/temari_oficial_inici.tsx
 */
export default function TemariOficialInici({ 
  onTornar, 
  onAmbitA,
  onAmbitB,
  onAmbitC,
  progres,
  onAnarSeccio,
  onAnarInici
}: { 
  onTornar: () => void,
  onAmbitA: () => void,
  onAmbitB: () => void,
  onAmbitC: () => void,
  progres: { A: boolean[], B: boolean[], C: boolean[] },
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void,
  onAnarInici?: () => void
}) {

  // Explicació per a no-programadors: Estil d'àvatar obtingut de la memòria local per mostrar la icona a mida triada per l'opositor.
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
      className="fixed inset-0 w-full overflow-y-auto flex flex-col items-center px-6 pb-28 bg-[#010915] select-none"
      style={{ 
        WebkitOverflowScrolling: "touch",
        // Explicació per a no-programadors: El següent fons fosc de degradat (#010915) utilitza la imatge real de gent estudiant per a una consonància total.
        backgroundImage: `linear-gradient(to bottom, rgba(1, 9, 21, 0.92), rgba(1, 9, 21, 0.96)), url('${fonsTeorica}')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top"
      }}
    >
      
      {/* CAPÇALERA ESTÀTICA - Completament lliure, el títol es desplaça al compàs de l'estudi de l'usuari */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 mb-4">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10 relative">
          {/* Botó de retorn per anar enrere cap a la pantalla de la Prova Teòrica de forma eficient */}
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
            Temari Oficial
          </h2>
          <div className="h-0.5 w-10 bg-amber-400 rounded-full mb-1" />
          <p className="text-white/60 text-[8px] font-bold uppercase tracking-wider">
            Convocatòria 2025-2026
          </p>
        </div>
      </header>

      {/* CONTINGUT PRINCIPAL */}
      <main className="w-full md:max-w-4xl flex flex-col gap-6 pb-6 transition-none">
        
        {/* Caixa de benvinguda al temari amb to daurat elegant */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl py-4 px-6 shadow-xl text-center">
          <p className="text-amber-300 text-xs md:text-sm font-semibold leading-relaxed italic pr-2 pl-2">
            "Et presentem el temari oficial de l'oposició de Mossos d'Esquadra de l'any 2025-2026 perquè en facis ús en qualsevol lloc."
          </p>
        </div>

        {/* Llistat actiu de cadascun dels camps d'estudi definits oficialment per l'ISPC */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
          
          {/* Àmbit A - Coneixements de l'entorn */}
          <motion.button 
            onClick={onAmbitA}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-3xl p-5 flex flex-col gap-4 transition-all text-left group cursor-pointer"
            id="ambit-a-btn-app"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-900/50 group-hover:scale-110 transition-transform">
                <BookOpen className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <span className="text-white/60 font-black italic uppercase text-[10px] tracking-widest block mb-0.5">Àmbit A</span>
                <h3 className="text-white font-bold text-base leading-tight uppercase">
                  Coneixements de l'entorn
                </h3>
              </div>
            </div>

            {/* Marc de progrés d'Àmbit A */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Llegit:</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
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
                  <span className="text-white font-black text-sm italic ml-2">
                    {Math.round((progres.A.filter(Boolean).length / progres.A.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.button>

          {/* Àmbit B - Àmbit institucional */}
          <motion.button 
            onClick={onAmbitB}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 rounded-3xl p-5 flex flex-col gap-4 transition-all text-left group cursor-pointer"
            id="ambit-b-btn-app"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-amber-500 rounded-xl shadow-lg shadow-amber-900/50 group-hover:scale-110 transition-transform">
                <Landmark className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <span className="text-white/60 font-black italic uppercase text-[10px] tracking-widest block mb-0.5">Àmbit B</span>
                <h3 className="text-white font-bold text-base leading-tight uppercase">
                  Àmbit institucional
                </h3>
              </div>
            </div>

            {/* Marc de progrés d'Àmbit B */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Llegit:</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
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
                  <span className="text-white font-black text-sm italic ml-2">
                    {Math.round((progres.B.filter(Boolean).length / progres.B.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.button>

          {/* Àmbit C - Àmbit de seguretat i policia */}
          <motion.button 
            onClick={onAmbitC}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 rounded-3xl p-5 flex flex-col gap-4 transition-all text-left group cursor-pointer"
            id="ambit-c-btn-app"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/50 group-hover:scale-110 transition-transform">
                <Shield className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <span className="text-white/60 font-black italic uppercase text-[10px] tracking-widest block mb-0.5">Àmbit C</span>
                <h3 className="text-white font-bold text-base leading-tight uppercase">
                  Àmbit de seguretat i policia
                </h3>
              </div>
            </div>

            {/* Marc de progrés d'Àmbit C */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Llegit:</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
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
                  <span className="text-white font-black text-sm italic ml-2">
                    {Math.round((progres.C.filter(Boolean).length / progres.C.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.button>

        </div>
      </main>

      {/* PEU DE PÀGINA EN BLANC - Eliminat completament el botó "Tornar al menú" com a petició de l'usuari */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-2">
        <p className="text-[8px] font-black uppercase tracking-wider text-white opacity-40 select-none whitespace-nowrap">
          OposiCatalunya • Preparació ISPC
        </p>
      </footer>

      {/* Comentari planer per a no-programadors: Barra inferior corporativa idèntica a l'original amb un to fosc (#010915) per a una coherència absoluta. */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-45 bg-[#010915]/95 backdrop-blur-md border-t border-white/20 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-300"
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
              {/* Indicador de notificació polsant de color rosa */}
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
