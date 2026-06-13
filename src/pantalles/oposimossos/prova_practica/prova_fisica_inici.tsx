import { useState, useEffect } from "react";
import { ChevronLeft, MapPin, Apple, ArrowRight, Timer, Activity, Weight, Home, MessageSquare, Bell } from "lucide-react";
import { motion } from "motion/react";
import OnEntrenarInici from "./on_entrenar_inici";
import DetallProvaFisica from "./detall_prova_fisica";
import Dieta from "./dieta";
// Explicació per a no-programadors: Importem la mateixa imatge que fem servir a la pàgina de la web de les proves físiques per mantenir una línia estètica idèntica
// @ts-ignore
import fonsFisica from "../../../assets/images/fons_fisica_1780343173628.png";

type TipusProva = 'circuit' | 'press' | 'navette';

/**
 * PANTALLA: ProvaFisicaInici
 * Menú principal redissenyat per a la preparació de les proves físiques.
 */
export default function ProvaFisicaInici({ 
  onTornar,
  onAnarSeccio
}: { 
  onTornar: () => void,
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void
}) {
  
  // Estat per gestionar la sub-pantalla interna
  const [seccio, setSeccio] = useState<'menu' | 'on_entrenar' | 'dieta' | TipusProva>('menu');
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

  // Si estem veient la part de trobar on entrenar
  if (seccio === 'on_entrenar') {
    return <OnEntrenarInici onTornar={() => setSeccio('menu')} />;
  }

  // Si estem a la secció de dieta
  if (seccio === 'dieta') {
    return <Dieta onTornar={() => setSeccio('menu')} />;
  }

  // Detalls individuals de cada prova
  if (seccio === 'circuit') {
    return (
      <DetallProvaFisica 
        nom="Circuit d'Agilitat"
        subtitol="Agilitat i Velocitat"
        descripcio="Has de recórrer un circuit amb tancaments, salts i girs en el menor temps possible."
        videoUrl="https://youtu.be/mrnciH-f1Kc?si=Is8UU2tn-Ch4emyh"
        onTornar={() => setSeccio('menu')}
        onDieta={() => setSeccio('dieta')}
        onOnEntrenar={() => setSeccio('on_entrenar')}
        onAnarSeccio={onAnarSeccio}
        color="emerald-400"
      />
    );
  }

  if (seccio === 'press') {
    return (
      <DetallProvaFisica 
        nom="Press de Banca"
        subtitol="Força Tren Superior"
        descripcio="Aixecament d'un pes determinat (40kg homes / 25kg dones) el màxim nombre de repeticions."
        videoUrl="https://youtu.be/mrnciH-f1Kc?si=Is8UU2tn-Ch4emyh"
        onTornar={() => setSeccio('menu')}
        onDieta={() => setSeccio('dieta')}
        onOnEntrenar={() => setSeccio('on_entrenar')}
        onAnarSeccio={onAnarSeccio}
        color="emerald-400"
      />
    );
  }

  if (seccio === 'navette') {
    return (
      <DetallProvaFisica 
        nom="Course Navette"
        subtitol="Resistència Aeròbica"
        descripcio="Cursa d'anada i tornada sobre 20 metres seguint el ritme marcat per un senyal acústic."
        videoUrl="https://youtu.be/mrnciH-f1Kc?si=Is8UU2tn-Ch4emyh"
        onTornar={() => setSeccio('menu')}
        onDieta={() => setSeccio('dieta')}
        onOnEntrenar={() => setSeccio('on_entrenar')}
        onAnarSeccio={onAnarSeccio}
        color="emerald-400"
      />
    );
  }

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#010915] overflow-y-auto px-6 pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* Explicació per a no-programadors: Es col·loca exactament de fons de pantalla la mateixa imatge de la prova física que es fa servir a la web. Utilitzem la combinació de colors oficials del web (el color fosc #010915) i una opacitat del 40% perquè es vegi la de pista d'atletisme exactament igual que a la versió d'ordinador */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-full">
        <img 
          src={fonsFisica} 
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-40 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#010915]/90 via-[#010915]/80 to-[#010915]" />
      </div>

      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-4 pb-6 text-center md:max-w-4xl md:mx-auto relative z-10">
        
        {/* BOTÓ ENRERA (A l'esquerra, posicionament absolut per no moure el centre) */}
        <button 
          onClick={onTornar}
          className="absolute left-0 top-14 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div className="bg-white/10 backdrop-blur-md px-8 py-3 md:py-6 md:px-12 rounded-2xl shadow-xl border border-white/10">
          <h1 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase text-white">
            Prova <span className="text-emerald-400">Física</span>
          </h1>
        </div>
        <p className="text-white/45 text-[9px] md:text-sm font-black uppercase tracking-[0.2em] max-w-[250px] md:max-w-md leading-relaxed text-center">
          Preparació física integral per superar l'accés al cos.
        </p>
        <button 
          onClick={() => window.open('https://mossos.gencat.cat/ca/els_mossos_desquadra/acces_al_cos/Mosso_a/mosso_a_46_23/prova-fisica-acces-cos-mossos/', '_blank')}
          className="mt-2 bg-yellow-400 hover:bg-yellow-300 rounded-full py-2.5 px-6 md:py-4 md:px-10 transition-all active:scale-95 group flex items-center gap-2 shadow-lg border-none"
        >
          <span className="text-[#00274d] text-[8px] md:text-xs font-black uppercase tracking-[0.2em]">
            Informació oficial de la prova
          </span>
          <ArrowRight size={12} className="text-[#00274d]/40 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* BOTONS PRINCIPALS */}
      <main className="w-full max-w-md md:max-w-4xl px-6 flex flex-col gap-6 md:gap-10 relative z-10">
        
        {/* Comentari planer per a no-programadors: Retornem els botons de Dieta i On puc entrenar a la secció superior, mostrant-los a sobre de les proves oficials tal com estaven prèviament */}
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          <button 
            onClick={() => setSeccio('dieta')}
            className="flex flex-col items-center justify-center gap-2 md:gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 md:p-8 transition-all active:scale-95 group shadow-lg"
          >
            <div className="w-9 h-9 md:w-16 md:h-16 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Apple size={20} className="md:size-8" />
            </div>
            <span className="text-white font-black italic uppercase tracking-wider text-[10px] md:text-base">Dieta</span>
          </button>
          
          <button 
            onClick={() => setSeccio('on_entrenar')}
            className="flex flex-col items-center justify-center gap-2 md:gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 md:p-8 transition-all active:scale-95 group shadow-lg"
          >
            <div className="w-9 h-9 md:w-16 md:h-16 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <MapPin size={20} className="md:size-8" />
            </div>
            <span className="text-white font-black italic uppercase tracking-wider text-[10px] md:text-base">On puc entrenar</span>
          </button>
        </div>

        {/* SECCIÓ DE PROVES ESPECÍFIQUES */}
        <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-6">
          <div className="px-4 text-white/30 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] mb-1 md:col-span-3 md:text-center md:mb-4">Les 3 proves oficials</div>
          {/* CIRCUIT D'AGILITAT */}
          <button 
            onClick={() => setSeccio('circuit')}
            className="w-full bg-gradient-to-r from-emerald-500/10 to-transparent hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl p-3 md:p-6 flex items-center md:flex-col md:text-center justify-between md:justify-center gap-4 group transition-all active:scale-95 shadow-lg"
          >
            <div className="flex items-center md:flex-col gap-4">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-emerald-50 flex items-center justify-center text-[#00274d] shrink-0">
                <Activity size={20} className="md:size-8" />
              </div>
              <div className="flex flex-col items-start md:items-center leading-tight">
                <span className="text-white font-black italic uppercase tracking-wider text-[11px] md:text-base">Prova - Circuit agilitat</span>
                <span className="text-emerald-400/40 text-[8px] md:text-xs font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Agilitat i velocitat</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/20 mr-2 md:hidden group-hover:text-white transition-all shrink-0" />
          </button>

          {/* PRESS DE BANCA */}
          <button 
            onClick={() => setSeccio('press')}
            className="w-full bg-gradient-to-r from-emerald-500/10 to-transparent hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl p-3 md:p-6 flex items-center md:flex-col md:text-center justify-between md:justify-center gap-4 group transition-all active:scale-95 shadow-lg"
          >
            <div className="flex items-center md:flex-col gap-4">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-emerald-50 flex items-center justify-center text-[#00274d] shrink-0">
                <Weight size={20} className="md:size-8" />
              </div>
              <div className="flex flex-col items-start md:items-center leading-tight">
                <span className="text-white font-black italic uppercase tracking-wider text-[11px] md:text-base">Prova - Press de Banca</span>
                <span className="text-emerald-400/40 text-[8px] md:text-xs font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Força del tren superior</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/20 mr-2 md:hidden group-hover:text-white transition-all shrink-0" />
          </button>

          {/* CURSE NAVETTE */}
          <button 
            onClick={() => setSeccio('navette')}
            className="w-full bg-gradient-to-r from-emerald-500/10 to-transparent hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl p-3 md:p-6 flex items-center md:flex-col md:text-center justify-between md:justify-center gap-4 group transition-all active:scale-95 shadow-lg"
          >
            <div className="flex items-center md:flex-col gap-4">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-emerald-50 flex items-center justify-center text-[#00274d] shrink-0">
                <Timer size={20} className="md:size-8" />
              </div>
              <div className="flex flex-col items-start md:items-center leading-tight">
                <span className="text-white font-black italic uppercase tracking-wider text-[11px] md:text-base">Prova - Course navette</span>
                <span className="text-emerald-400/40 text-[8px] md:text-xs font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Resistència aeròbica</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/20 mr-2 md:hidden group-hover:text-white transition-all shrink-0" />
          </button>
        </div>

      </main>

      {/* PEU DE PÀGINA: Espaiat suficient per a la barra de navegació */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-4 pt-4 pb-24 relative z-10">
        <p className="text-[8px] font-black uppercase tracking-wider text-white/20 select-none whitespace-nowrap mt-2">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

      {/* Comentari planer per a no-programadors: Barra inferior de botons del menú corporatiu adaptada visualment amb el color oficial fosquíssim de les proves físiques de la web (#010915) per obtenir una integració estètica sublim. */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-45 bg-[#010915]/95 backdrop-blur-md border-t border-white/10 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all duration-300"
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
            </div>
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Perfil
            </span>
          </button>

        </div>
      </div>

    </div>
  );
}
