import { ChevronLeft, Youtube, TrendingUp, Calculator, Calendar, Play, X, Apple, MapPin, Home, MessageSquare, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import CalculadoraCircuit from "./calculadora_circuit";
import CalculadoraPress from "./calculadora_press";
import CalculadoraNavette from "./calculadora_navette";
import { PlaCourseNavette, PlaCircuitAgilitat, PlaPressBanca } from "./plans_entrenament";
import { ConsellsCircuitAgilitat, ConsellsPressBanca, ConsellsCourseNavette } from "./consells_tecnics";
// Explicació per a no-programadors: Importem el fons d'atletisme real de la versió web per donar-li la mateixa consistència visual també a cadascuna de les 3 proves
// @ts-ignore
import fonsFisica from "../../../assets/images/fons_fisica_1780343173628.png";

interface DetallProvaFisicaProps {
  nom: string;
  subtitol: string;
  descripcio: string;
  videoUrl: string;
  onTornar: () => void;
  onDieta?: () => void;
  onOnEntrenar?: () => void;
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void;
  color?: string;
}

/**
 * COMPONENT: DetallProvaFisica
 * Estructura modular per a les proves físiques (Circuit, Press, Navette).
 */
export default function DetallProvaFisica({ 
  nom, 
  subtitol, 
  descripcio, 
  videoUrl, 
  onTornar,
  onDieta,
  onOnEntrenar,
  onAnarSeccio,
  color = "emerald-400" 
}: DetallProvaFisicaProps) {

  const [seccioInterna, setSeccioInterna] = useState<'principal' | 'calculadora' | 'pla' | 'consells'>('principal');
  // Explicació per a no-programadors: Estat d'àvatar obtingut dinàmicament per a mostrar el mateix dibuix d'avatar personalitzat escollit des del perfil de l'alumne.
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

  /* 
    Funció que renderitza la vista detallada dels consells tècnics per millorar.
  */
  const renderContingutConsells = () => {
    return (
      <div className="flex flex-col gap-6 pb-20">
        <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 flex items-center text-left gap-4 shadow-2xl">
          <div className={`w-12 h-12 shrink-0 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color}`}>
            <TrendingUp size={24} />
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-black italic uppercase text-white tracking-widest">Guia de Millora</h2>
            <p className="text-white/40 text-[8px] font-bold uppercase tracking-[0.2em]">Tècniques i consells d'experts</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {nom.toLocaleLowerCase().includes('circuit') && <ConsellsCircuitAgilitat color={color} />}
          {nom.toLocaleLowerCase().includes('press') && <ConsellsPressBanca color={color} />}
          {nom.toLocaleLowerCase().includes('navette') && <ConsellsCourseNavette color={color} />}
        </div>

        <button 
          onClick={() => setSeccioInterna('principal')}
          className="mt-4 w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white/50 font-black uppercase italic tracking-widest hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <ChevronLeft size={20} /> Tornar a la prova
        </button>
      </div>
    );
  };

  /* 
    Funció que renderitza la vista detallada del pla d'entrenament.
  */
  const renderContingutPla = () => {
    return (
      <div className="flex flex-col gap-6 pb-20">
        <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 flex items-center text-left gap-4 shadow-2xl">
          <div className={`w-12 h-12 shrink-0 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color}`}>
            <Calendar size={24} />
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-black italic uppercase text-white tracking-widest">Pla d'Entrenament</h2>
            <p className="text-white/40 text-[8px] font-bold uppercase tracking-[0.2em]">Guia setmanal personalitzada</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {nom.toLocaleLowerCase().includes('circuit') && <PlaCircuitAgilitat color={color} />}
          {nom.toLocaleLowerCase().includes('press') && <PlaPressBanca color={color} />}
          {nom.toLocaleLowerCase().includes('navette') && <PlaCourseNavette color={color} />}
        </div>

        <button 
          onClick={() => setSeccioInterna('principal')}
          className="mt-4 w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white/50 font-black uppercase italic tracking-widest hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <ChevronLeft size={20} /> Tornar a la prova
        </button>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#010915] overflow-y-auto pb-32">
      
      {/* Explicació per a no-programadors: Es col·loca exactament de fons de pantalla la mateixa imatge de la prova física que es fa servir a la web. Utilitzem la combinació de colors oficials del web (el color fosc #010915) i una opacitat del 40% per aconseguir un contrast perfecte i consistent */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-full">
        <img 
          src={fonsFisica} 
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-40 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#010915]/90 via-[#010915]/80 to-[#010915]" />
      </div>
      
      {/* CAPÇALERA AMB BOTÓ TORNAR */}
      <header className="pt-10 w-full flex flex-col items-center gap-4 pb-6 px-6 max-w-2xl shrink-0 relative z-10">
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={seccioInterna === 'principal' ? onTornar : () => setSeccioInterna('principal')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className={`text-${color} text-[8px] font-black uppercase tracking-[0.2em] opacity-70`}>{subtitol}</span>
            <h1 className="text-xl font-black italic tracking-tighter uppercase text-white">
              Prova: <span className={`text-${color}`}>{nom}</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md px-6 flex flex-col gap-6 relative z-10">
        
        {seccioInterna === 'principal' ? (
          <>
            {/* BREU DESCRIPCIÓ */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
              <p className="text-[11px] text-white/60 font-medium leading-relaxed italic text-center">
                "{descripcio}"
              </p>
            </div>

            {/* 1. BOTÓ YOUTUBE: EN QUÈ CONSISTEIX */}
            <button 
              onClick={() => window.open(videoUrl, '_blank')}
              className="w-full relative overflow-hidden bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 rounded-[2rem] p-4 flex items-center gap-5 transition-all active:scale-95 group shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Youtube size={24} />
              </div>
              <div className="flex flex-col items-start text-left leading-tight">
                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-1">Vídeo oficial</span>
                <span className="text-white font-black italic uppercase tracking-wider text-sm">En què consisteix la prova?</span>
              </div>
              <div className="absolute right-6 opacity-20 group-hover:opacity-100 transition-opacity">
                <Play size={20} className="fill-current text-white" />
              </div>
            </button>

            {/* SECCIÓ DE RECURSOS */}
            <div className="flex flex-col gap-3">
              
              {/* 2. COM MILLORAR */}
              <button 
                onClick={() => setSeccioInterna('consells')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-5 group transition-all active:scale-95"
              >
                <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} group-hover:rotate-12 transition-transform`}>
                  <TrendingUp size={20} />
                </div>
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="text-white font-black italic uppercase tracking-wider text-[11px]">Com millorar en la prova</span>
                  <span className="text-white/30 text-[9px] font-medium uppercase tracking-widest mt-1 text-left">Tècniques i consells d'experts</span>
                </div>
              </button>

              {/* 3. CALCULADORA DE PUNTS */}
              <button 
                onClick={() => { 
                  if(nom.toLocaleLowerCase().includes('circuit') || nom.toLocaleLowerCase().includes('press') || nom.toLocaleLowerCase().includes('navette')) {
                    setSeccioInterna('calculadora'); 
                  }
                }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-5 group transition-all active:scale-95"
              >
                <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} group-hover:rotate-12 transition-transform`}>
                  <Calculator size={20} />
                </div>
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="text-white font-black italic uppercase tracking-wider text-[11px]">Calculadora de punts</span>
                  <span className="text-white/30 text-[9px] font-medium uppercase tracking-widest mt-1 text-left">Calcula la teva nota oficial</span>
                </div>
              </button>

              {/* 4. PLA D'ENTRENAMENT */}
              <button 
                onClick={() => setSeccioInterna('pla')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-5 group transition-all active:scale-95"
              >
                <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} group-hover:rotate-12 transition-transform`}>
                  <Calendar size={20} />
                </div>
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="text-white font-black italic uppercase tracking-wider text-[11px]">Pla d'entrenament</span>
                  <span className="text-white/30 text-[9px] font-medium uppercase tracking-widest mt-1 text-left">Guia setmanal personalitzada</span>
                </div>
              </button>

            </div>

          </>
        ) : seccioInterna === 'calculadora' ? (
          <div className="flex flex-col gap-6">
            {nom.toLocaleLowerCase().includes('circuit') && <CalculadoraCircuit onTancar={() => setSeccioInterna('principal')} />}
            {nom.toLocaleLowerCase().includes('press') && <CalculadoraPress onTancar={() => setSeccioInterna('principal')} />}
            {nom.toLocaleLowerCase().includes('navette') && <CalculadoraNavette onTancar={() => setSeccioInterna('principal')} />}
            
            <button 
              onClick={() => setSeccioInterna('principal')}
              className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white/50 font-black uppercase italic tracking-widest hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <ChevronLeft size={20} /> Tornar a la prova
            </button>
          </div>
        ) : seccioInterna === 'pla' ? (
          renderContingutPla()
        ) : (
          renderContingutConsells()
        )}

      </main>

      {/* Comentari planer per a no-programadors: Barra inferior de botons del menú corporatiu adaptada visualment amb el color oficial fosquíssim de les proves físiques de la web (#010915) per obtenir una integració estètica sublim. */}
      {onAnarSeccio && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-45 bg-[#010915]/95 backdrop-blur-md border-t border-white/10 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-300"
          style={{ paddingBottom: "calc(5px + env(safe-area-inset-bottom, 6px))" }}
        >
          <div className="w-full max-w-md grid grid-cols-4 gap-1">
            
            {/* Botó 1: Casa (retorna a l'inici de Mossos) */}
            <button 
              onClick={() => onAnarSeccio('home')}
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
