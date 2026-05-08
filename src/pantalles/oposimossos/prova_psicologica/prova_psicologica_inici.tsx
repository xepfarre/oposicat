import React, { useState } from 'react';
import { ChevronLeft, BrainCircuit, Youtube } from "lucide-react";
import { GuiaBiodata } from "./biodata_guia";
import { CompetenciesClau } from "./competencies_clau";
import { EntrevistaGuia } from "./entrevista_guia";

/**
 * PANTALLA: ProvaPsicologica
 * Preparació per als tests psicotècnics i personalitat.
 */
export default function ProvaPsicologicaInici({ onTornar }: { onTornar: () => void }) {
  const [seccio, setSeccio] = useState<'principal' | 'biodata' | 'competencies' | 'entrevista'>('principal');
  const [seccioBiodata, setSeccioBiodata] = useState<'menu' | 'personals' | 'laborals' | 'pgme' | 'test'>('menu');

  /* 
    Capçalera idèntica a la prova teòrica
  */
  const HeaderTeorica = () => (
    <div className="flex flex-col items-center w-full mb-6 shrink-0">
      <div className="bg-[#0a213a] border border-white/10 px-10 py-4 rounded-[2.5rem] shadow-2xl mb-6">
        <h1 className="text-2xl font-black italic tracking-tighter select-none">
          <span className="text-white font-[900]">Oposi</span>
          <span className="text-[#ff0000] font-[900]"> Mossos</span>
        </h1>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-white text-lg font-black italic tracking-wider uppercase">
          PROVA PSICOLÒGICA
        </h2>
        <div className="h-0.5 w-12 bg-red-600 rounded-full" />
      </div>
    </div>
  );

  if (seccio === 'entrevista') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center pb-8 px-10 bg-[#00274d] overflow-y-auto">
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica />
          
          <div className="flex flex-col items-center mb-4">
            <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] text-center">
              PROVA - ENTREVISTA
            </h3>
          </div>
        </header>

        <main className="w-full max-w-md flex flex-col items-center flex-1">
          <EntrevistaGuia onBack={() => setSeccio('principal')} />
        </main>
      </div>
    );
  }

  if (seccio === 'biodata') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center pb-8 px-10 bg-[#00274d] overflow-y-auto">
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica />
          
          <div className="flex flex-col items-center mb-4">
            <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] text-center">
              GUIA BIODATA
            </h3>
          </div>
        </header>

        <main className="w-full max-w-md flex flex-col items-center flex-1">
          <GuiaBiodata 
            seccio={seccioBiodata} 
            setSeccio={setSeccioBiodata}
          />
        </main>

        <footer className="w-full max-w-xs flex flex-col items-center gap-6 mt-auto pt-10 shrink-0">
          <button 
            onClick={() => {
              if (seccioBiodata === 'menu') {
                setSeccio('principal');
              } else {
                setSeccioBiodata('menu');
              }
            }}
            className="flex items-center gap-3 text-white/40 hover:text-white transition-all uppercase italic font-black text-[10px] tracking-[0.2em]"
          >
            <ChevronLeft size={16} /> {seccioBiodata === 'menu' ? 'TORNAR AL MENÚ' : 'TORNAR AL MENÚ BIODATA'}
          </button>
        </footer>
      </div>
    );
  }

  if (seccio === 'competencies') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center pb-8 px-10 bg-[#00274d] overflow-y-auto">
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica />
          
          <div className="flex flex-col items-center mb-4">
            <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] text-center">
              COMPETÈNCIES CLAU
            </h3>
          </div>
        </header>

        <main className="w-full max-w-md flex flex-col items-center flex-1">
          <CompetenciesClau />
        </main>

        <footer className="w-full max-w-xs flex flex-col items-center gap-6 mt-auto pt-10 shrink-0">
          <button 
            onClick={() => setSeccio('principal')}
            className="flex items-center gap-3 text-white/40 hover:text-white transition-all uppercase italic font-black text-[10px] tracking-[0.2em]"
          >
            <ChevronLeft size={16} /> TORNAR AL MENÚ
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-8 px-10 bg-[#00274d] overflow-y-auto">
      <header className="pt-8 w-full flex flex-col items-center shrink-0">
        <HeaderTeorica />
        
        <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mb-6 text-center max-w-[250px] leading-relaxed">
           PREPARACIÓ INTEGRAL PER SUPERAR L'ACCÉS AL COS.
        </p>
      </header>

      <main className="w-full max-w-md flex flex-col gap-2 flex-1">
        {/* Botó de YouTube inicial - Ara en una sola línia per igualar tamany */}
        <a 
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full h-[63.7898px] bg-red-600/90 hover:bg-red-600 border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-xl px-6"
        >
          <Youtube size={20} className="text-white fill-white shrink-0" />
          <span className="text-white font-[900] italic uppercase tracking-widest text-xs">EN QUÈ CONSISTEIX LA PROVA?</span>
        </a>

        {/* Línia gris de separació - Marges reduïts */}
        <div className="h-[1px] bg-white/10 w-full my-1" />

        {/* Label Importantíssim */}
        <div className="flex justify-center">
          <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] italic drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
            IMPORTANTÍSSIM
          </span>
        </div>

        {/* Botó Competències clau */}
        <button 
          onClick={() => setSeccio('competencies')}
          className="w-full bg-[#1a3a5a]/60 hover:bg-[#1a3a5a]/80 border border-cyan-400/30 rounded-2xl py-6 text-cyan-400 font-black italic uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl border-dashed"
        >
          COMPETÈNCIES CLAU
        </button>

        {/* Línia gris de separació sol·licitada entre competències i proves - Marges reduïts */}
        <div className="h-[1px] bg-white/10 w-full my-1" />

        <button 
          onClick={() => setSeccio('biodata')}
          className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-6 text-white font-black italic uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl"
        >
          PROVA - BIODATA
        </button>

        <button 
          onClick={() => setSeccio('entrevista')}
          className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-6 text-white font-black italic uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl"
        >
          PROVA - ENTREVISTA
        </button>
      </main>

      <footer className="w-full max-w-xs flex flex-col items-center gap-6 mt-auto pt-10 shrink-0">
        <button 
          onClick={onTornar}
          className="flex items-center gap-3 text-white/40 hover:text-white transition-all uppercase italic font-black text-[10px] tracking-[0.2em]"
        >
          <ChevronLeft size={16} /> TORNAR AL MENÚ
        </button>
      </footer>
    </div>
  );
}

