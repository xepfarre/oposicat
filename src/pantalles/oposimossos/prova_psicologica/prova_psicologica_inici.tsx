import React, { useState } from 'react';
import { ChevronLeft, BrainCircuit, Youtube, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ca } from 'date-fns/locale';
import { GuiaBiodata } from "./biodata_guia";
import { CompetenciesClau } from "./competencies_clau";
import { EntrevistaGuia } from "./entrevista_guia";

/**
 * PANTALLA: ProvaPsicologica
 * Preparació per als tests psicotècnics i personalitat.
 */
export default function ProvaPsicologicaInici({ onTornar }: { onTornar: () => void }) {
  const [seccio, setSeccio] = useState<'principal' | 'biodata' | 'competencies' | 'menu_entrevista' | 'entrevista' | 'cita'>('principal');
  const [seccioBiodata, setSeccioBiodata] = useState<'menu' | 'personals' | 'laborals' | 'pgme' | 'test'>('menu');
  
  // Estats per a la cita
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [torn, setTorn] = useState<'mati' | 'tarda'>('mati');
  const [hora, setHora] = useState<string>('');

  /* 
    Capçalera idèntica a la prova teòrica
  */
  const HeaderTeorica = ({ onBackClick }: { onBackClick?: () => void }) => (
    <div className="flex flex-col items-center w-full mb-6 shrink-0">
      <div className="relative flex items-center justify-center w-full mb-6 max-w-md">
        <div className="bg-[#0a213a] border border-white/10 px-8 py-3 rounded-[2rem] shadow-2xl">
          <h1 className="text-xl font-black italic tracking-tighter select-none">
            <span className="text-white font-[900]">Oposi</span>
            <span className="text-[#ff0000] font-[900]"> Mossos</span>
          </h1>
        </div>
        {onBackClick && (
          <button 
            onClick={onBackClick}
            className="absolute right-4 flex items-center justify-center w-10 h-10 bg-[#0a213a] border border-white/10 rounded-full text-white/40 hover:text-white transition-all shadow-xl active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-white text-lg font-black italic tracking-wider uppercase">
          PROVA PSICOLÒGICA
        </h2>
        <div className="h-0.5 w-12 bg-red-600 rounded-full" />
      </div>
    </div>
  );

  if (seccio === 'cita') {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20">
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica onBackClick={() => setSeccio('menu_entrevista')} />
          <div className="flex flex-col items-center -mt-4 mb-6">
            <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] text-center">
              DEMANA CITA - PSICÒLEGS
            </h3>
          </div>
        </header>

        <main className="w-full max-w-md flex flex-col gap-6">
          {/* 2- Label explicatiu */}
          <div className="w-full bg-[#1a3a5a]/40 border border-white/10 rounded-2xl p-5 text-center shadow-lg">
             <p className="text-white/80 text-[11px] font-medium leading-relaxed">
                Per poder-te donar una experiencia personalitzada ( com en l' <span className="text-yellow-400 font-bold">entrevista oficial</span> ) et recomane fer el <span className="text-purple-400 font-bold">TEST BIODATA</span> per tal de que els nostres psicolegs tinguin el teu perfil psicoprofesional i et facin una <span className="text-yellow-400 font-bold">sesió personalitzada</span> i no generica.
             </p>
          </div>

          {/* 3- Botó Biodata */}
          <button 
            onClick={() => setSeccio('biodata')}
            className="w-full h-10 bg-[#1a3a5a]/60 hover:bg-[#1a3a5a]/80 border border-purple-400/30 rounded-xl text-purple-200 font-black italic uppercase text-xs tracking-widest transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <BrainCircuit size={14} />
            FER EL TEST DE BIODATA
          </button>

          {/* 4- Secció Demanar Cita */}
          <div className="w-full bg-[#1a3a5a]/40 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
            {!selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-black italic uppercase text-sm tracking-widest">Calendari</h4>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-white/40 hover:text-white transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-white font-bold text-xs uppercase min-w-[80px] text-center">
                      {format(currentMonth, 'MMMM yyyy', { locale: ca })}
                    </span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-white/40 hover:text-white transition-colors rotate-180">
                      <ChevronLeft size={20} />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'].map(d => (
                    <div key={d} className="text-white/20 text-[8px] font-black uppercase text-center py-2">{d}</div>
                  ))}
                  {Array.from({ length: start.getDay() === 0 ? 6 : start.getDay() - 1 }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {days.map(day => (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold text-white/60 hover:bg-white/5 hover:text-white transition-all"
                    >
                      {format(day, 'd')}
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">Selecciona un dia per veure hores</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">DIA SELECCIONAT</span>
                    <span className="text-white font-black italic uppercase text-sm">{format(selectedDate, "eeee, d 'de' MMMM", { locale: ca })}</span>
                  </div>
                  <button 
                    onClick={() => { setSelectedDate(null); setHora(''); }}
                    className="text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:underline"
                  >
                    Canviar dia
                  </button>
                </div>

                <div className="h-[1px] bg-white/10 w-full" />

                <div className="flex gap-2 mb-2">
                  <button 
                    onClick={() => setTorn('mati')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${torn === 'mati' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40'}`}
                  >
                    Matí
                  </button>
                  <button 
                    onClick={() => setTorn('tarda')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${torn === 'tarda' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40'}`}
                  >
                    Tarda
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(torn === 'mati' ? ['09:00', '10:00', '11:00', '12:00', '13:00'] : ['17:00', '18:00', '19:00', '20:00', '21:00']).map(h => (
                    <button
                      key={h}
                      onClick={() => setHora(h)}
                      className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                        hora === h 
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>

                {/* Boto Reservar */}
                <button 
                  disabled={!hora}
                  onClick={() => {
                    const text = `Hola, voldria reservar una cita per al dia ${format(selectedDate!, 'dd/MM/yy')} a les ${hora} (${torn}).`;
                    window.open(`https://wa.me/34689725801?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-xl mt-2 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
                >
                  RESERVAR ARA
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-8 shrink-0 px-6">
          <p className="text-[8px] font-black uppercase tracking-wider text-white/10 select-none whitespace-nowrap">
            Preparació acadèmica per a oposicions de l'ISPC
          </p>
        </footer>
      </div>
    );
  }

  if (seccio === 'menu_entrevista') {
    return (
      <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20">
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica onBackClick={() => setSeccio('principal')} />
        </header>

        <main className="w-full max-w-md flex flex-col gap-6 flex-1 justify-center">
          {/* Opció 1: Pràctica d'examen */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 px-2">
              <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.3em] italic drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] text-center">
                practica amb les preguntes de l'examen
              </span>
              <p className="text-white/40 text-[10px] font-medium text-center leading-relaxed max-w-[300px] italic">
                En aquest apartat pots veure quines són les preguntes que durant anys han estat fent a l'entrevista. Pots mirar-les i practicar-les tu mateix/a.
              </p>
            </div>
            <button 
              onClick={() => setSeccio('entrevista')}
              className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl group px-6 text-center"
            >
              <span className="text-white font-[900] italic uppercase tracking-widest text-xl">Practicar l'entrevista</span>
            </button>
          </div>

          {/* Separador visual tipus línia gris */}
          <div className="h-[1px] bg-white/10 w-full my-4" />

          {/* Opció 2: Demana cita */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 px-2">
              <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.3em] italic text-center">
                Practica amb psicolegs d'oposicions
              </span>
              <p className="text-white/40 text-[10px] font-medium text-center leading-relaxed max-w-[300px] italic">
                Posa en pràctica un cop hagis vist les preguntes de l'apartat anterior, a més a més de haver fet el test del biodata per a conèixer-te millor, amb els nostres psicòlegs especialitzats en oposicions!
              </p>
            </div>
            <button 
              onClick={() => setSeccio('cita')}
              className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl group px-6 text-center"
            >
              <span className="text-white font-[900] italic uppercase tracking-widest text-xl leading-tight">Demana cita</span>
              <span className="text-white/60 font-black italic uppercase text-[10px] tracking-widest mt-1">( Psicòlegs especialitzats )</span>
            </button>
          </div>
        </main>

        <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-12 shrink-0 px-6">
        </footer>
      </div>
    );
  }

  if (seccio === 'entrevista') {
    return (
      <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20" style={{ WebkitOverflowScrolling: "touch" }}>
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica onBackClick={() => setSeccio('menu_entrevista')} />
          
          <div className="flex flex-col items-center mb-4">
            <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] text-center">
              PROVA - ENTREVISTA
            </h3>
          </div>
        </header>

        <main className="w-full max-w-md md:max-w-3xl flex flex-col items-center">
          <EntrevistaGuia onBack={() => setSeccio('menu_entrevista')} />
        </main>
      </div>
    );
  }

  if (seccio === 'biodata') {
    return (
      <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20" style={{ WebkitOverflowScrolling: "touch" }}>
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica onBackClick={() => {
              if (seccioBiodata === 'menu') {
                setSeccio('principal');
              } else {
                setSeccioBiodata('menu');
              }
            }} />
          
          <div className="flex flex-col items-center mb-4">
            <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] text-center">
              GUIA BIODATA
            </h3>
          </div>
        </header>

        <main className="w-full max-w-md md:max-w-3xl flex flex-col items-center flex-1">
          <GuiaBiodata 
            seccio={seccioBiodata} 
            setSeccio={setSeccioBiodata}
          />
        </main>

        <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-8 shrink-0 px-6">
          <p className="text-[8px] font-black uppercase tracking-wider text-white/10 select-none whitespace-nowrap">
            Preparació acadèmica per a oposicions de l'ISPC
          </p>
        </footer>
      </div>
    );
  }

  if (seccio === 'competencies') {
    return (
      <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20" style={{ WebkitOverflowScrolling: "touch" }}>
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica onBackClick={() => setSeccio('principal')} />
          
          <div className="flex flex-col items-center mb-4">
            <h3 className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] text-center">
              COMPETÈNCIES CLAU
            </h3>
          </div>
        </header>

        <main className="w-full max-w-md md:max-w-3xl flex flex-col items-center flex-1">
          <CompetenciesClau />
        </main>

        <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-8 shrink-0 px-6">
          <p className="text-[8px] font-black uppercase tracking-wider text-white/10 select-none whitespace-nowrap">
            Preparació acadèmica per a oposicions de l'ISPC
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20" style={{ WebkitOverflowScrolling: "touch" }}>
      <header className="pt-8 w-full flex flex-col items-center shrink-0">
        <HeaderTeorica onBackClick={onTornar} />
        
        <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mb-2 text-center max-w-[250px] leading-relaxed">
           PREPARACIÓ INTEGRAL PER SUPERAR L'ACCÉS AL COS.
        </p>
      </header>

      <main className="w-full max-w-md md:max-w-4xl flex flex-col gap-2 md:grid md:grid-cols-2 md:gap-6 flex-1">
        {/* Botó de YouTube inicial */}
        <a 
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full h-14 md:h-24 bg-red-600/90 hover:bg-red-600 border border-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center gap-3 md:gap-6 transition-all active:scale-95 group shadow-xl px-6 md:col-span-2"
        >
          <Youtube size={20} className="text-white fill-white shrink-0 md:size-8" />
          <span className="text-white font-[900] italic uppercase tracking-widest text-xs md:text-xl">EN QUÈ CONSISTEIX LA PROVA?</span>
        </a>

        {/* Línia gris de separació */}
        <div className="h-[1px] bg-white/10 w-full my-3 md:col-span-2 md:my-6" />

        {/* Label Competències */}
        <div className="flex justify-center md:col-span-2">
          <span className="text-[9px] md:text-xs text-white/60 font-black uppercase tracking-[0.3em] italic text-center leading-relaxed max-w-[280px]">
            Es la forma com es puntua aquesta prova. <span className="text-yellow-400 font-black">Molt important</span>
          </span>
        </div>

        {/* Botó Competències clau */}
        <button 
          onClick={() => setSeccio('competencies')}
          className="w-full h-14 md:h-24 bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-cyan-400 font-black italic uppercase text-xs md:text-xl tracking-widest transition-all active:scale-95 shadow-xl md:col-span-2"
        >
          COMPETÈNCIES CLAU
        </button>

        {/* Línia gris de separació sol·licitada entre competències i proves */}
        <div className="h-[1px] bg-white/10 w-full my-3 md:col-span-2 md:my-6" />

        <button 
          onClick={() => setSeccio('biodata')}
          className="w-full h-14 md:h-24 bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-white font-black italic uppercase text-xs md:text-xl tracking-widest transition-all active:scale-95 shadow-xl"
        >
          PROVA - BIODATA
        </button>

        <button 
          onClick={() => setSeccio('menu_entrevista')}
          className="w-full h-14 md:h-24 bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-white font-black italic uppercase text-xs md:text-xl tracking-widest transition-all active:scale-95 shadow-xl"
        >
          PROVA - ENTREVISTA
        </button>
      </main>

      <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-8 shrink-0 px-6">
        <p className="text-[8px] font-black uppercase tracking-wider text-white/10 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>
    </div>
  );
}


