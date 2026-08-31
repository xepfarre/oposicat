import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MessageSquare, CheckCircle2, Wrench, Sparkles, ExternalLink, Brain, ArrowRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ca } from 'date-fns/locale';
import { MAP_COMPETENCIES } from './preguntes_biodata';
import { EinesEntrevistaLiveWeb } from './EinesEntrevistaLiveWeb';

/* =============================================================================
 * COMPONENT: DemanarCitaWeb
 * -----------------------------------------------------------------------------
 * Reserva de cita individual amb psicòlegs especialitzats en oposicions.
 * Inclou calendari interactiu, selecció de torn i hora, reserva directa per WhatsApp
 * i accés directe a la nova pantalla "Eines de l'entrevista en directe" (10 Competències).
 * ============================================================================= */

interface DemanarCitaWebProps {
  onTornar: () => void;
  onTornarMenuPrincipal: () => void;
  onObrirEinesDirecte?: () => void;
}

export const DemanarCitaWeb: React.FC<DemanarCitaWebProps> = ({
  onTornar,
  onTornarMenuPrincipal,
  onObrirEinesDirecte,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [torn, setTorn] = useState<'mati' | 'tarda'>('mati');
  const [hora, setHora] = useState<string>('10:00');

  // Comentari planer per a no-programadors:
  // Estat per canviar a la nova pantalla dedicada d'"Eines de l'entrevista en directe"
  // de manera que en el mòbil només es vegin les 10 competències clau netes.
  const [mostrantPantallaLive, setMostrantPantallaLive] = useState(false);

  // Si l'usuari ha premut el botó d'Eines en directe, mostrem la pantalla exclusiva
  if (mostrantPantallaLive) {
    return (
      <EinesEntrevistaLiveWeb 
        onTornar={() => setMostrantPantallaLive(false)} 
      />
    );
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const horesDisponibles = torn === 'mati' 
    ? ['09:00', '10:00', '11:00', '12:00', '13:00'] 
    : ['17:00', '18:00', '19:00', '20:00', '21:00'];

  const handleReservar = () => {
    if (!selectedDate || !hora) return;
    const text = `Hola, voldria reservar una cita per al dia ${format(selectedDate, 'dd/MM/yyyy')} a les ${hora} (${torn}).`;
    window.open(`https://wa.me/34689725801?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 text-left">
      
      {/* ========================================================================= */}
      {/* ENLLAÇ DISCRET DE TORNADA SUPERIOR */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between">
        <button
          onClick={onTornar}
          className="group inline-flex items-center gap-2 text-slate-300 hover:text-[#FFDF00] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
          id="btn-tornar-menu-entrevista-cita-top"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Tornar a la Prova Entrevista</span>
        </button>

        <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20 font-mono">
          Psicòlegs Especialitzats
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. CAPÇALERA MINIMALISTA */}
      {/* ========================================================================= */}
      <div className="space-y-1 pt-1 pb-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
          DEMANAR CITA AMB EL PSICÒLEG
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* 2. TARGETA D'EXPLICACIÓ */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <h2 className="text-white font-bold text-sm uppercase tracking-wider">
              Simulacre d'Entrevista Personal 1 a 1
            </h2>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            Posa en pràctica un cop hagis vist les preguntes oficials i després de conèixer el teu perfil del Biodata. Prepara la teva defensa amb els nostres psicòlegs experts en tribunals de Mossos d'Esquadra.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CALENDARI I SELECCIÓ D'HORARI (GRAELLA RESPONSIVE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COLUMNA 1: CALENDARI INTERACTIU */}
        <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-5 sm:p-6 shadow-xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ca })}
              </h3>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                aria-label="Mes anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                aria-label="Mes següent"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Dies de la setmana */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-500 uppercase tracking-wider">
            <span>dl</span>
            <span>dt</span>
            <span>dc</span>
            <span>dj</span>
            <span>dv</span>
            <span>ds</span>
            <span>dg</span>
          </div>

          {/* Graella de dies del mes */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, idx) => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isCurrent = isSameMonth(day, currentMonth);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30 scale-105' 
                      : isCurrent 
                        ? 'text-slate-200 hover:bg-slate-800/80 bg-slate-900/40' 
                        : 'text-slate-600 opacity-40'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="pt-2 border-t border-slate-800/60 text-center">
              <span className="text-xs text-slate-400">
                Dia seleccionat: <strong className="text-white capitalize">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: ca })}</strong>
              </span>
            </div>
          )}
        </div>

        {/* COLUMNA 2: TORN I HORA */}
        <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider">
                Selecciona Torn i Horari
              </h3>
            </div>

            {/* Selector de Torn Matí / Tarda */}
            <div className="flex gap-2 p-1 bg-[#020b18] rounded-xl border border-slate-800">
              <button 
                onClick={() => {
                  setTorn('mati');
                  setHora('10:00');
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  torn === 'mati' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ☀️ Matí
              </button>
              <button 
                onClick={() => {
                  setTorn('tarda');
                  setHora('17:00');
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  torn === 'tarda' 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🌙 Tarda
              </button>
            </div>

            {/* Selector d'hores */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Hores disponibles ({torn === 'mati' ? 'Matí' : 'Tarda'}):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {horesDisponibles.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHora(h)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      hora === h 
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20' 
                        : 'bg-[#020b18] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botó de Confirmació per WhatsApp */}
          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <button 
              disabled={!selectedDate || !hora}
              onClick={handleReservar}
              className="w-full bg-[#00f296] hover:bg-emerald-400 text-slate-950 font-black italic uppercase tracking-[0.20em] py-4 px-6 rounded-xl shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm disabled:opacity-30 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>RESERVAR PER WHATSAPP</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center italic">
              S'obrirà el xat directe d'atenció per confirmar la disponibilitat del simulacre.
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. SECCIÓ D'EINES DE L'ENTREVISTA EN DIRECTE */}
      {/* ========================================================================= */}
      {/* Comentari planer per a no-programadors:
          Aquest botó condueix l'aspirant directament a la nova pantalla neta de la classe,
          on només veurà les 10 competències clau oficials preparades per al seu mòbil. */}
      <div className="pt-4 flex flex-col items-center justify-center space-y-2">
        <button
          onClick={() => {
            if (onObrirEinesDirecte) {
              onObrirEinesDirecte();
            } else {
              setMostrantPantallaLive(true);
            }
          }}
          id="btn-eines-entrevista-directe"
          className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 px-8 py-4 rounded-2xl font-black italic uppercase tracking-[0.15em] text-sm shadow-xl shadow-amber-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer w-full max-w-md border border-amber-300/40"
        >
          <Wrench className="w-5 h-5 text-slate-950" />
          <span>Eines de l'entrevista en directe</span>
          <ArrowRight className="w-5 h-5 ml-auto text-slate-950 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-[11px] text-amber-400/80 font-medium text-center">
          Pissarra interactiva amb les 10 competències clau per a la teva sessió 1v1
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTONS DE NAVEGACIÓ INFERIOR */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
        <button
          onClick={onTornar}
          id="btn-tornar-menu-entrevista-cita-bottom"
          className="group inline-flex items-center gap-2 bg-[#020b18] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-3 rounded-full text-xs font-black italic uppercase tracking-wider text-[#FFDF00] transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Tornar a la Prova Entrevista</span>
        </button>

        <button
          onClick={onTornarMenuPrincipal}
          id="btn-tornar-menu-principal-entrevista-cita-bottom"
          className="inline-flex items-center gap-2 bg-[#020b18] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-3 rounded-full text-xs font-black italic uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
        >
          <span>Menú principal</span>
        </button>
      </div>

    </div>
  );
};
