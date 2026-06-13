import { useState, useEffect } from "react";
import { ChevronLeft, Home, MessageSquare, Bell } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ProvaTeorica (Inici)
 * Secció dedicada a la preparació de la prova de coneixements totalment desbloquejada per a smartphone d'OposiCAT.
 * Comentari planer per a no-programadors: Aquesta pantalla ara té un comportament de desplaçament estàtic,
 * de manera que el títol ja no queda immòbil quan es fa scroll, sinó que es mou fluidament com a la pantalla d'inici de Mossos!
 * Ubicació: /src/pantalles/oposimossos/prova_teorica/prova_teorica_inici.tsx
 */
export default function ProvaTeoricaInici({ 
  onTornar, 
  onExamenTeoric, 
  onExamenPsicotecnic,
  onActualitat,
  onEmCostaEstudiar,
  onAnarSeccio
}: { 
  onTornar: () => void, 
  onExamenTeoric: () => void, 
  onExamenPsicotecnic: () => void,
  onActualitat: () => void,
  onEmCostaEstudiar: () => void,
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void
}) {

  // Explicació per a no-programadors: Estil d'àvatar obtingut dinàmicament per a mostrar el mateix dibuix d'avatar personalitzat escollit des del perfil de l'alumne.
  const [avatarEstil, setAvatarEstil] = useState<string>("👮‍♂️");

  useEffect(() => {
    try {
      const deLocalStorage = localStorage.getItem("avatar_estil");
      if (deLocalStorage) {
        setAvatarEstil(deLocalStorage);
      }
    } catch {
      // Valor de defecte segur si falla l'accés a memòria del navegador
      setAvatarEstil("👮‍♂️");
    }
  }, []);
  
  return (
    <div 
      className="fixed inset-0 w-full overflow-y-auto flex flex-col items-center px-6 pb-28 bg-[#010915] select-none"
      style={{ 
        WebkitOverflowScrolling: "touch",
        // Comentari planer per a no-programadors: Posem el mateix fons fosc d'escriptori degradat (#010915) per tancar la consistència corporativa en tota l'app.
        backgroundImage: "linear-gradient(to bottom, rgba(1, 9, 21, 0.92), rgba(1, 9, 21, 0.96)), url('/assets/imatges/fons_ispc.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "20% bottom"
      }}
    >
      
      {/* CAPÇALERA ESTÀTICA - Desbloquejada, es mou amb el scroll natural de la pàgina */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 mb-4">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10 relative">
          {/* Botó de retorn de tota la vida estil iOS per si l'estudiant prefereix anar enrere de forma directa */}
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
            Prova Teòrica
          </h2>
          <div className="h-0.5 w-10 bg-red-600 rounded-full mb-1" />
          <p className="text-white/60 text-[8px] font-bold uppercase tracking-wider">
            Preparació acadèmica per a l'ISPC
          </p>
        </div>
      </header>

      {/* CONTINGUT PRINCIPAL */}
      <main className="w-full md:max-w-4xl flex flex-col items-center pb-6 transition-none">

        {/* Botons de la secció Teòrica en grid per a Tablet i llista fluida per a mòbils */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <button 
            onClick={() => window.open('https://tramits.gencat.cat/ca/tramits/tramits-temes/23243_-_Acces-a-1.587-places-de-mosso-a-de-lescala-basica-del-Cos-de-Mossos-dEsquadra-convocatoria-46-25?gestioSite=interior&__disableDirectEdit=true&category=725c8452-a82c-11e3-a972-000c29052e2c&moda=1', '_blank')}
            className="w-full md:col-span-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl py-6 md:py-14 text-amber-100 font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            Informació personal
          </button>

          {/* Línia de separació gris entre Informació i Exàmens */}
          <div className="md:col-span-2 flex items-center py-2">
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button 
            onClick={onExamenTeoric}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 md:py-20 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            Exàmen teòric
          </button>
          <button 
            onClick={onExamenPsicotecnic}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 md:py-20 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            Exàmen psicotècnic
          </button>
          <button 
            onClick={onActualitat}
            className="w-full md:col-span-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 md:py-14 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            Actualitat
          </button>
          
          {/* Línia de separació gris entre blocs */}
          <div className="md:col-span-2 flex items-center py-2">
            <div className="flex-1 h-px bg-white/10" />
          </div>
          
          <button 
            onClick={onEmCostaEstudiar}
            className="w-full md:col-span-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl py-6 md:py-14 text-emerald-100 font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-900/20 cursor-pointer"
          >
            Em costa estudiar
          </button>

        </div>
      </main>

      {/* Comentari planer per a no-programadors: Barra inferior de botons del menú corporatiu idèntica a l'original, ara amb un to fosc ben elegant (#010915). */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-45 bg-[#010915]/95 backdrop-blur-md border-t border-white/20 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-300"
        style={{ paddingBottom: "calc(5px + env(safe-area-inset-bottom, 6px))" }}
      >
        <div className="w-full max-w-md grid grid-cols-4 gap-1">
          
          {/* Botó 1: Casa (retorna a l'inici de Mossos) */}
          <button 
            onClick={onTornar}
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
              {/* Indicador de notificació polsant de tota la vida */}
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
