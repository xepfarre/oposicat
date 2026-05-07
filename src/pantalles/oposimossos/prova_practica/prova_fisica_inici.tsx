import { useState } from "react";
import { ChevronLeft, MapPin, Apple, ArrowRight, Timer, Activity, Weight } from "lucide-react";
import { motion } from "motion/react";
import OnEntrenarInici from "./on_entrenar_inici";
import DetallProvaFisica from "./detall_prova_fisica";

type TipusProva = 'circuit' | 'press' | 'navette';

/**
 * PANTALLA: ProvaFisicaInici
 * Menú principal redissenyat per a la preparació de les proves físiques.
 */
export default function ProvaFisicaInici({ onTornar }: { onTornar: () => void }) {
  
  // Estat per gestionar la sub-pantalla interna
  const [seccio, setSeccio] = useState<'menu' | 'on_entrenar' | TipusProva>('menu');

  // Si estem veient la part de trobar on entrenar
  if (seccio === 'on_entrenar') {
    return <OnEntrenarInici onTornar={() => setSeccio('menu')} />;
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
        color="emerald-400"
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d] overflow-y-auto pb-12">
      
      {/* CAPÇALERA */}
      <header className="pt-10 w-full flex flex-col items-center gap-4 pb-6 text-center">
        <div className="bg-white/10 backdrop-blur-md px-8 py-3 rounded-2xl shadow-xl border border-white/10">
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-white">
            Prova <span className="text-emerald-400">Física</span>
          </h1>
        </div>
        <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] max-w-[250px] leading-relaxed text-center">
          Preparació física integral per superar l'accés al cos.
        </p>
        <button 
          onClick={() => window.open('https://mossos.gencat.cat/ca/els_mossos_desquadra/acces_al_cos/Mosso_a/mosso_a_46_23/prova-fisica-acces-cos-mossos/', '_blank')}
          className="mt-2 bg-yellow-400 hover:bg-yellow-300 rounded-full py-2.5 px-6 transition-all active:scale-95 group flex items-center gap-2 shadow-lg border-none"
        >
          <span className="text-[#00274d] text-[8px] font-black uppercase tracking-[0.2em]">
            Informació oficial de la prova
          </span>
          <ArrowRight size={12} className="text-[#00274d]/40 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* BOTONS PRINCIPALS */}
      <main className="w-full max-w-md px-6 flex flex-col gap-6">
        
        {/* SECCIÓ SUPERIOR: DIETA I ENTRENAMENT */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 transition-all active:scale-95 group shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Apple size={20} />
            </div>
            <span className="text-white font-black italic uppercase tracking-wider text-[10px]">Dieta</span>
          </button>
          
          <button 
            onClick={() => setSeccio('on_entrenar')}
            className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 transition-all active:scale-95 group shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
              <MapPin size={20} />
            </div>
            <span className="text-white font-black italic uppercase tracking-wider text-[10px]">On puc entrenar</span>
          </button>
        </div>

        {/* SECCIÓ DE PROVES ESPECÍFIQUES */}
        <div className="flex flex-col gap-3">
          <div className="px-4 text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Les 3 proves oficials</div>
          {/* CIRCUIT D'AGILITAT */}
          <button 
            onClick={() => setSeccio('circuit')}
            className="w-full bg-gradient-to-r from-emerald-500/10 to-transparent hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between group transition-all active:scale-95 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-[#00274d] shrink-0">
                <Activity size={20} />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-white font-black italic uppercase tracking-wider text-[11px]">Prova - Circuit agilitat</span>
                <span className="text-emerald-400/40 text-[8px] font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Agilitat i velocitat</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/20 mr-2 group-hover:text-white transition-all shrink-0" />
          </button>

          {/* PRESS DE BANCA */}
          <button 
            onClick={() => setSeccio('press')}
            className="w-full bg-gradient-to-r from-emerald-500/10 to-transparent hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between group transition-all active:scale-95 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-[#00274d] shrink-0">
                <Weight size={20} />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-white font-black italic uppercase tracking-wider text-[11px]">Prova - Press de Banca</span>
                <span className="text-emerald-400/40 text-[8px] font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Força del tren superior</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/20 mr-2 group-hover:text-white transition-all shrink-0" />
          </button>

          {/* CURSE NAVETTE */}
          <button 
            onClick={() => setSeccio('navette')}
            className="w-full bg-gradient-to-r from-emerald-500/10 to-transparent hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between group transition-all active:scale-95 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-[#00274d] shrink-0">
                <Timer size={20} />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-white font-black italic uppercase tracking-wider text-[11px]">Prova - Course navette</span>
                <span className="text-emerald-400/40 text-[8px] font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Resistència aeròbica</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/20 mr-2 group-hover:text-white transition-all shrink-0" />
          </button>
        </div>

      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6 pt-12">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 group transition-all"
        >
          <ChevronLeft size={20} className="text-white/30 group-hover:text-white transition-colors" />
          <span className="text-white/40 group-hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
            Tornar al Menú Principal
          </span>
        </button>
      </footer>

    </div>
  );
}
