import { ChevronLeft, Youtube, TrendingUp, Calculator, Calendar, Play, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import CalculadoraCircuit from "./calculadora_circuit";
import CalculadoraPress from "./calculadora_press";
import CalculadoraNavette from "./calculadora_navette";
import { PlaCourseNavette, PlaCircuitAgilitat, PlaPressBanca } from "./plans_entrenament";
import { ConsellsCircuitAgilitat, ConsellsPressBanca, ConsellsCourseNavette } from "./consells_tecnics";

interface DetallProvaFisicaProps {
  nom: string;
  subtitol: string;
  descripcio: string;
  videoUrl: string;
  onTornar: () => void;
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
  color = "emerald-400" 
}: DetallProvaFisicaProps) {

  const [seccioInterna, setSeccioInterna] = useState<'principal' | 'calculadora' | 'pla' | 'consells'>('principal');

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
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-24">
      
      {/* CAPÇALERA AMB BOTÓ TORNAR */}
      <header className="pt-10 w-full flex flex-col items-center gap-4 pb-6 px-6 max-w-2xl shrink-0">
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

      <main className="w-full max-w-md px-6 flex flex-col gap-6">
        
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

    </div>
  );
}
