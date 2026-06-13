import { useState, useEffect } from "react";
import { ChevronLeft, Home, MessageSquare, Bell } from "lucide-react";
import { motion } from "motion/react";

/**
 * PANTALLA: ExamenTeoricInici
 * Secció específica per a la prova teòrica de coneixements totalment desbloquejada per a smartphone d'OposiCAT.
 * Comentari planer per a no-programadors: Aquesta pantalla ara té el mateix fons adaptatiu blau policia de la pantalla general,
 * el títol ja no està bloquejat sinó que es desplaça naturalment quan es fa scroll, i s'han afegit les mateixes pestanyes corporatives.
 * Ubicació: /src/pantalles/oposimossos/prova_teorica/examen_teoric/examen_teoric_inici.tsx
 */
export default function ExamenTeoricInici({ 
  onTornar,
  onTemariOficial,
  onTemariOposimossos,
  onClassesPremium,
  onClassesDirecte,
  onExamensOficialsPassats,
  onExamensOposimossos,
  onAnarSeccio,
  onAnarInici
}: { 
  onTornar: () => void,
  onTemariOficial: () => void,
  onTemariOposimossos: () => void,
  onClassesPremium: () => void,
  onClassesDirecte: () => void,
  onExamensOficialsPassats: () => void,
  onExamensOposimossos: () => void,
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void,
  onAnarInici?: () => void
}) {

  // Explicació per a no-programadors: Estil d'àvatar obtingut dinàmicament d'OposiCAT per a mostrar la icona personalitzada que hagi escollit l'alumne.
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
  
  // Llista de seccions amb els seus botons de tota la vida
  const seccions = [
    {
      titol: "Temari",
      items: [
        { text: "Temari oficial", action: onTemariOficial },
        /* Comentari planer per a no-programadors: Cambiem el nom del botó a 'Area d'estudi personal' tal com ha demanat el client */
        { text: "Area d'estudi personal", action: onTemariOposimossos },
      ]
    },
    {
      titol: "Classes",
      items: [
        { text: "Classes premium", action: onClassesPremium },
        { text: "Classes en directe", action: onClassesDirecte },
      ]
    },
    {
      titol: "Examens",
      items: [
        { text: "Examens d'OposiMossos", action: onExamensOposimossos },
        { text: "Examens Oficials passats", action: onExamensOficialsPassats }
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 w-full overflow-y-auto flex flex-col items-center px-6 pb-28 bg-[#00274d] select-none"
      style={{ 
        WebkitOverflowScrolling: "touch",
        // Comentari planer per a no-programadors: Copiem exactament el mateix fons de pantalla amb degradat i imatge que a la pantalla anterior per coherència visual corporativa.
        backgroundImage: "linear-gradient(to bottom, rgba(0, 39, 77, 0.88), rgba(0, 39, 77, 0.94)), url('/assets/imatges/fons_ispc.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "20% bottom"
      }}
    >
      
      {/* CAPÇALERA ESTÀTICA - Desbloquejada, es desplaça naturalment com a l'inici */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 mb-4">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10 relative">
          {/* Botó de retorn integrat amb estil iOS per a una navegació ràpida enrere */}
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
            Exàmen Teòric
          </h2>
          <div className="h-0.5 w-10 bg-red-600 rounded-full mb-1" />
          <p className="text-white/60 text-[8px] font-bold uppercase tracking-wider">
            Preparació acadèmica per a l'ISPC
          </p>
        </div>
      </header>

      {/* CONTINGUT PRINCIPAL */}
      <main className="w-full md:max-w-4xl flex flex-col items-center pb-6 transition-none">
        <div className="w-full flex flex-col gap-6">
          {seccions.map((seccio, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-3">
              {/* Títol de la secció (Label) */}
              <div className="pl-4">
                <h3 className="text-[10px] font-black italic uppercase tracking-[0.2em] text-white/30">
                  {seccio.titol}
                </h3>
              </div>

              {/* Botons de la secció */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seccio.items.map((boto, bIdx) => (
                  <button 
                    key={bIdx}
                    onClick={() => boto.action && boto.action()}
                    className="w-full bg-white/10 border-white/20 hover:bg-white/20 border rounded-xl py-6 md:py-8 text-white font-black italic uppercase text-[11px] md:text-base tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
                  >
                    {boto.text}
                  </button>
                ))}
              </div>

              {/* Línia de separació (excepte l'últim) */}
              {sIdx < seccions.length - 1 && (
                <div className="mt-3 px-10">
                  <div className="h-[1px] w-full bg-white/10" />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* PEU DE PÀGINA - Comentari planer: S'elimina el botó de retorn "Tornar a Prova Teòrica" per deixar només l'explicació polida, tal com ha demanat l'aspirant. */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-2">
        <p className="text-[8px] font-black uppercase tracking-wider text-white opacity-40 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

      {/* Comentari planer per a no-programadors: Barra inferior corporativa idèntica a l'original amb brillantor blau policia per a coherència amb el menú principal de l'aplicació mòbil. */}
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
              {/* Indicador de notificació polsant corporatiu */}
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
