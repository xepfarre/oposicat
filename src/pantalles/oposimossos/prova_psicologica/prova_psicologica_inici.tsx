import React, { useState, useEffect } from 'react';
import { ChevronLeft, BrainCircuit, Youtube, Calendar as CalendarIcon, Clock, Home, MessageSquare, Bell } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ca } from 'date-fns/locale';
import { GuiaBiodata } from "./biodata_guia";
import { CompetenciesClau } from "./competencies_clau";
import { EntrevistaGuia } from "./entrevista_guia";
import GestioBiodata from "./gestio_biodata";
import { ConsisteixEntrevista } from "./ConsisteixEntrevista";

// Explicació per a no-programadors: Importem la mateixa imatge que fem servir a la pàgina de la web de les proves psicològiques per mantenir una línia estètica idèntica
// @ts-ignore
import fonsPsicologica from "../../../assets/images/fons_psicologica_1780343193032.png";

/**
 * PANTALLA: ProvaPsicologica
 * Preparació per als tests psicotècnics i personalitat.
 */
export default function ProvaPsicologicaInici({ 
  onTornar,
  onAnarSeccio 
}: { 
  onTornar: () => void;
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void;
}) {
  const [seccio, setSeccio] = useState<'principal' | 'biodata' | 'competencies' | 'menu_entrevista' | 'consisteix_entrevista' | 'entrevista' | 'cita' | 'gestio_biodata'>('principal');
  const [seccioBiodata, setSeccioBiodata] = useState<'menu' | 'personals' | 'laborals' | 'pgme' | 'test'>('menu');
  // Estat per a controlar la subsecció activa de la guia del test de biodata (evitant salts dobles d'enrere)
  const [subSeccioTest, setSubSeccioTest] = useState<'menu' | 'que_es' | 'practica'>('menu');
  
  // Estats per a la cita
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [torn, setTorn] = useState<'mati' | 'tarda'>('mati');
  const [hora, setHora] = useState<string>('');

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
            className="absolute left-4 flex items-center justify-center w-10 h-10 bg-[#0a213a] border border-white/10 rounded-full text-white/40 hover:text-white transition-all shadow-xl active:scale-95"
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

  // Explicació per a no-programadors: Helper (empaquetador) creat per unificar el mateix fons de la web amb l'imatge del psicòleg, el degradat blau fosc policia consistent i la barra inferior de navegació a cada subpantalla del test i entrevistes de forma completament modular.
  const WrapperPsicologica = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="fixed inset-0 w-full flex flex-col items-center bg-[#010915] overflow-y-auto px-6 pb-32" style={{ WebkitOverflowScrolling: "touch" }}>
        
        {/* Explicació per a no-programadors: Imatge oficial de fons de la prova de psicologia amb l'opacitat adequada (35%) i un degradat que es mescla bonicament amb el color fosc #010915 que usa la web des d'ordinador */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-full">
          <img 
            src={fonsPsicologica} 
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#010915]/90 via-[#010915]/85 to-[#010915]" />
        </div>

        {/* Explicació per a no-programadors: Contingut real de la secció del mòbil centrat a la pantalla per damunt de la imatge de fons */}
        <div className="relative z-10 w-full max-w-md md:max-w-4xl flex flex-col items-center min-h-full">
          {children}
        </div>

        {/* Comentari planer per a no-programadors: Barra inferior de botons del menú corporatiu adaptada visualment amb el color oficial fosquíssim de les proves de la web (#010915) per obtenir una integració estètica sublim. */}
        {onAnarSeccio && (
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
                onClick={() => onAnarSeccio('forum')}
                className="py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 text-white/50 hover:text-white/80"
              >
                <div className="relative">
                  <MessageSquare className="w-6 h-6 transition-all group-hover:scale-115 text-pink-400/60 group-hover:text-pink-400" />
                  {/* Indicador de notificació polsant */}
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
  };

  if (seccio === 'cita') {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    return (
      <WrapperPsicologica>
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
      </WrapperPsicologica>
    );
  }

  if (seccio === 'menu_entrevista') {
    return (
      <WrapperPsicologica>
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica onBackClick={() => setSeccio('principal')} />
        </header>

        <main className="w-full max-w-md flex flex-col gap-5 flex-1 justify-center py-4">
          {/* Opció 1: En què consisteix l'entrevista */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5 px-2">
              <span className="text-[9px] text-[#00f296] font-black uppercase tracking-[0.3em] italic text-center">
                Guia Oficial i Criteris d'Avaluació
              </span>
              <p className="text-white/40 text-[10px] font-medium text-center leading-relaxed max-w-[300px] italic">
                Descobreix com es puntua, què valoren els psicòlegs, com calcular la nota i quines són les 3 vies de preguntes.
              </p>
            </div>
            <button 
              onClick={() => setSeccio('consisteix_entrevista')}
              className="w-full bg-[#00f296] hover:bg-emerald-400 text-slate-950 rounded-2xl py-4 flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl group px-6 text-center cursor-pointer"
            >
              <span className="font-black italic uppercase tracking-widest text-lg">En què consisteix l'entrevista</span>
            </button>
          </div>

          {/* Separador visual tipus línia */}
          <div className="h-[1px] bg-white/10 w-full my-1" />

          {/* Opció 2: Pràctica d'examen */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5 px-2">
              <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.3em] italic drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] text-center">
                practica amb les preguntes de l'examen
              </span>
              <p className="text-white/40 text-[10px] font-medium text-center leading-relaxed max-w-[300px] italic">
                En aquest apartat pots veure quines són les preguntes que durant anys han estat fent a l'entrevista. Pots mirar-les i practicar-les tu mateix/a.
              </p>
            </div>
            <button 
              onClick={() => setSeccio('entrevista')}
              className="w-full bg-[#FFDF00] hover:bg-[#ffe633] text-slate-950 rounded-2xl py-4 flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl group px-6 text-center cursor-pointer"
            >
              <span className="font-black italic uppercase tracking-widest text-lg">Practicar l'entrevista</span>
            </button>
          </div>

          {/* Separador visual tipus línia */}
          <div className="h-[1px] bg-white/10 w-full my-1" />

          {/* Opció 3: Demana cita */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col items-center gap-1.5 px-2">
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.3em] italic text-center">
                Practica amb psicòlegs d'oposicions
              </span>
              <p className="text-white/40 text-[10px] font-medium text-center leading-relaxed max-w-[300px] italic">
                Posa en pràctica un cop hagis vist les preguntes de l'apartat anterior, a més a més d'haver fet el test del biodata per a conèixer-te millor, amb els nostres psicòlegs especialitzats en oposicions!
              </p>
            </div>
            <button 
              onClick={() => setSeccio('cita')}
              className="w-full bg-[#1a3a5a]/60 hover:bg-[#1a3a5a]/80 border border-white/10 rounded-2xl py-4 flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl group px-6 text-center cursor-pointer"
            >
              <span className="text-white font-[900] italic uppercase tracking-widest text-lg leading-tight">Demana cita</span>
              <span className="text-white/60 font-black italic uppercase text-[10px] tracking-widest mt-1">( Psicòlegs especialitzats )</span>
            </button>
          </div>
        </main>

        <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-12 shrink-0 px-6">
        </footer>
      </WrapperPsicologica>
    );
  }

  if (seccio === 'consisteix_entrevista') {
    return (
      <WrapperPsicologica>
        <header className="pt-6 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica onBackClick={() => setSeccio('menu_entrevista')} />
        </header>

        <main className="w-full max-w-4xl flex flex-col items-center pb-8">
          <ConsisteixEntrevista 
            onTornar={() => setSeccio('menu_entrevista')}
            onTornarMenuPrincipal={() => setSeccio('principal')}
            onPracticarEntrevista={() => setSeccio('entrevista')}
            onAnarCompetencies={() => setSeccio('competencies')}
          />
        </main>
      </WrapperPsicologica>
    );
  }

  if (seccio === 'entrevista') {
    return (
      <WrapperPsicologica>
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
      </WrapperPsicologica>
    );
  }

  if (seccio === 'biodata') {
    return (
      <WrapperPsicologica>
        <header className="pt-8 w-full flex flex-col items-center shrink-0">
          <HeaderTeorica onBackClick={() => {
              // Si estem dins d'un apartat secundari del test (ex: teoria/pràctica), primer tornem al menú d'aquest test (la foto de l'usuari)
              if (seccioBiodata === 'test' && subSeccioTest !== 'menu') {
                setSubSeccioTest('menu');
              } else if (seccioBiodata === 'menu') {
                // Si ja som al menú de biodata del principi de tot, tornem al menú principal de psicos
                setSeccio('principal');
              } else {
                // Altres seccions (personals, laborals...) o menú de test, tornen al menú de biodata superior
                setSeccioBiodata('menu');
                setSubSeccioTest('menu');
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
            subSeccioTest={subSeccioTest}
            setSubSeccioTest={setSubSeccioTest}
          />
        </main>

        <footer className="w-full max-w-xs flex flex-col items-center gap-4 pb-10 mt-8 shrink-0 px-6">
          <p className="text-[8px] font-black uppercase tracking-wider text-white/10 select-none whitespace-nowrap">
            Preparació acadèmica per a oposicions de l'ISPC
          </p>
        </footer>
      </WrapperPsicologica>
    );
  }

  if (seccio === 'gestio_biodata') {
    return (
      <GestioBiodata onTornar={() => setSeccio('principal')} />
    );
  }

  if (seccio === 'competencies') {
    return (
      <WrapperPsicologica>
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
      </WrapperPsicologica>
    );
  }

  return (
    <WrapperPsicologica>
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
    </WrapperPsicologica>
  );
}


