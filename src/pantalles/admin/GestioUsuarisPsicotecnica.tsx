// Explicació per a no-programadors:
// Aquest fitxer conté el mòdul de "Entrevistes personals" del Backoffice d'OposiCAT.
// Està estructurat en dos grans blocs seguint les instruccions del professorat:
// 1. Entrevista: Gestió directa amb l'alumne (requereix seleccionar primer un alumne per desbloquejar la resta de funcions).
// 2. Eina de gestió - Professorat: Eines docents generals (Presets genèrics, Presets per alumne i Historial per alumne).

import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, MessageSquare, Calendar, Brain, ClipboardList, 
  Plus, Clock, Award, AlertCircle, CheckCircle2, Trash2, Edit3, 
  BookOpen, Save, X, ChevronRight, ChevronDown, GraduationCap, Eye, RefreshCw,
  Sparkles, FileText, ArrowLeft, ShieldCheck, HeartHandshake, Copy,
  CheckCircle, AlertTriangle, Layers, Play, Check, ExternalLink, HelpCircle,
  Radio, Send, RotateCcw, Zap, Activity, CheckSquare, Search, User, Lock, Sliders
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp, query, orderBy, onSnapshot
} from 'firebase/firestore';
import SessioEntrevistaEnDirecte from './SessioEntrevistaEnDirecte';
import GestioPresetsGenerics from './GestioPresetsGenerics';
import GestioPresetsAlumneConcret from './GestioPresetsAlumneConcret';
import HistorialAlumneConcret from './HistorialAlumneConcret';
import PreparacioEntrevista from './PreparacioEntrevista';
import HistorialEntrevistes from './HistorialEntrevistes';
import VisualitzacioBiodataAlumne from './VisualitzacioBiodataAlumne';

interface GestioUsuarisPsicotecnicaProps {
  darkMode: boolean;
  usuarisInicials?: any[];
}

export default function GestioUsuarisPsicotecnica({ darkMode, usuarisInicials = [] }: GestioUsuarisPsicotecnicaProps) {
  // Comentari per a no-programadors:
  // 'seccioPrincipal' controla quin dels 2 menús principals està visualitzant el professor:
  // - 'inici': Mostra el menú vertical de 2 opcions ("1- Entrevista" i "2- Eina de gestió - Professorat").
  // - 'entrevista': Mostra el submenú de 5 opcions de l'entrevista d'alumne.
  // - 'gestio_professorat': Mostra el submenú de 3 opcions per al professorat.
  const [seccioPrincipal, setSeccioPrincipal] = useState<'inici' | 'entrevista' | 'gestio_professorat'>('inici');

  // Comentari per a no-programadors:
  // 'subSeccioActiva' guarda quin botó s'ha premut per si es vol veure el panell corresponent (de moment buit / preparat per al següent pas)
  const [subSeccioActiva, setSubSeccioActiva] = useState<string | null>(null);
  const [guioPerAEntrevista, setGuioPerAEntrevista] = useState<string>('');

  // Comentari per a no-programadors:
  // 'usuariSeleccionat' guarda l'alumne triat. Si és null, els botons 2, 3, 4 i 5 de l'apartat 'Entrevista' surten bloquejats en gris.
  const [usuariSeleccionat, setUsuariSeleccionat] = useState<any | null>(null);

  // Llista d'usuaris per al cercador / selector
  const [llistaUsuaris, setLlistaUsuaris] = useState<any[]>(usuarisInicials);
  const [cercador, setCercador] = useState('');
  const [carregantUsuaris, setCarregantUsuaris] = useState(false);
  const [modalSelectorAlumneObert, setModalSelectorAlumneObert] = useState(false);

  // Carregar usuaris reals des de Firestore en iniciar
  useEffect(() => {
    const carregarUsuarisBBDD = async () => {
      if (!db) return;
      setCarregantUsuaris(true);
      try {
        const snap = await getDocs(collection(db, 'usuaris'));
        if (!snap.empty) {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setLlistaUsuaris(items);
        }
      } catch (err) {
        console.warn("Avís carregant usuaris a Entrevistes Personals:", err);
      } finally {
        setCarregantUsuaris(false);
      }
    };
    carregarUsuarisBBDD();
  }, []);

  // Filtratge d'alumnes segons el cercador
  const usuarisFiltrats = llistaUsuaris.filter(u => {
    const nom = (u.nom || u.displayName || u.email || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const cerca = cercador.toLowerCase();
    return nom.includes(cerca) || email.includes(cerca);
  });

  return (
    <div className={`max-w-5xl mx-auto flex flex-col gap-6 p-4 sm:p-6 transition-colors duration-200 ${
      darkMode ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* CAPÇALERA SUPERIOR AMB RETORN RÀPID */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {seccioPrincipal !== 'inici' && (
            <button
              onClick={() => {
                setSeccioPrincipal('inici');
                setSubSeccioActiva(null);
              }}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Tornar al menú principal de 2 opcions"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white">
                Backoffice Docent
              </span>
              {seccioPrincipal === 'entrevista' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  1. Entrevista
                </span>
              )}
              {seccioPrincipal === 'gestio_professorat' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  2. Eina de gestió - Professorat
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1">
              Entrevistes Personals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Panell docent per a la preparació, seguiment psicopedagògic i avaluació d'aspirants a Mossos d'Esquadra.
            </p>
          </div>
        </div>

        {/* Indicador d'Alumne Actiu si està seleccionat */}
        {usuariSeleccionat && (
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${
            darkMode ? 'bg-slate-800/80 border-purple-500/30' : 'bg-purple-50/70 border-purple-200'
          }`}>
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs">
              {(usuariSeleccionat.nom || usuariSeleccionat.displayName || usuariSeleccionat.email || 'A')[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Alumne seleccionat
              </span>
              <span className="text-xs font-black truncate max-w-[180px]">
                {usuariSeleccionat.nom || usuariSeleccionat.displayName || usuariSeleccionat.email}
              </span>
            </div>
            <button
              onClick={() => setModalSelectorAlumneObert(true)}
              className="text-[11px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 underline ml-1 cursor-pointer"
            >
              Canviar
            </button>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* VISTA 1: MENÚ VERTICAL PRINCIPAL (NIVELL 1) */}
      {/* ========================================================================= */}
      {seccioPrincipal === 'inici' && (
        <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Selecciona una àrea de treball:
          </p>

          {/* BOTÓ 1: ENTREVISTA */}
          <button
            onClick={() => {
              setSeccioPrincipal('entrevista');
              setSubSeccioActiva(null);
            }}
            className={`group relative p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md active:scale-[0.99] ${
              darkMode 
                ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 hover:border-purple-500/60' 
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-400'
            }`}
            id="btn-menu-principal-entrevista"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                1
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                    Entrevista
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Accés a la selecció d'alumne, sessió en directe, preparació de preguntes, historial i revisió de Biodata.
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
          </button>

          {/* BOTÓ 2: EINA DE GESTIÓ - PROFESSORAT */}
          <button
            onClick={() => {
              setSeccioPrincipal('gestio_professorat');
              setSubSeccioActiva(null);
            }}
            className={`group relative p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md active:scale-[0.99] ${
              darkMode 
                ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 hover:border-blue-500/60' 
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-400'
            }`}
            id="btn-menu-principal-gestio-professorat"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                2
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                    Eina de gestió - Professorat
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Configuració de Presets genèrics per a classes, Presets personalitzats per alumne i Historial general.
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: MENÚ DE 5 OPCIONS -> "1- ENTREVISTA" */}
      {/* ========================================================================= */}
      {seccioPrincipal === 'entrevista' && (
        <div className="w-full">
          {/* Si s'ha premut '2- Començar entrevista' i tenim alumne, obrim directament la classe en directe */}
          {subSeccioActiva === '2_comencar_entrevista' && usuariSeleccionat ? (
            <SessioEntrevistaEnDirecte 
              darkMode={darkMode}
              alumne={usuariSeleccionat}
              notesInicials={guioPerAEntrevista}
              onTornar={() => {
                setSubSeccioActiva(null);
                setGuioPerAEntrevista('');
              }}
            />
          ) : subSeccioActiva === '3_preparar_entrevistes' && usuariSeleccionat ? (
            /* SUBPANTALLA 3: PREPARAR ENTREVISTES PER A L'ALUMNE */
            <PreparacioEntrevista 
              darkMode={darkMode}
              alumne={usuariSeleccionat}
              onTornar={() => setSubSeccioActiva(null)}
              onComencarAmbGuio={(guio) => {
                setGuioPerAEntrevista(guio);
                setSubSeccioActiva('2_comencar_entrevista');
              }}
            />
          ) : subSeccioActiva === '4_veure_historial' && usuariSeleccionat ? (
            /* SUBPANTALLA 4: VEURE HISTORIAL D'ENTREVISTES */
            <HistorialEntrevistes 
              darkMode={darkMode}
              alumne={usuariSeleccionat}
              onTornar={() => setSubSeccioActiva(null)}
            />
          ) : subSeccioActiva === '5_veure_biodata' && usuariSeleccionat ? (
            /* SUBPANTALLA 5: VEURE BIODATA (TESTS COMPETENCIALS 1, 2, 3) */
            <VisualitzacioBiodataAlumne 
              darkMode={darkMode}
              alumne={usuariSeleccionat}
              onTornar={() => setSubSeccioActiva(null)}
            />
          ) : (
            <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full py-2">
              
              {/* AVIS DIDÀCTIC SI NO HI HA ALUMNE SELECCIONAT */}
              {!usuariSeleccionat && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                  darkMode ? 'bg-amber-950/30 border-amber-800/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="text-xs font-bold leading-relaxed">
                    Necessites sel·lecionar sobre quin alumne de les oposicions de Mossos d'Esquadra vols treballar.
                  </div>
                </div>
              )}

              {/* LLISTA VERTICAL DE LES 5 OPCIONS */}
              <div className="flex flex-col gap-3">
            
            {/* 1. SELECCIONA L'ALUMNE */}
            <button
              onClick={() => setModalSelectorAlumneObert(true)}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm active:scale-[0.99] ${
                usuariSeleccionat
                  ? darkMode 
                    ? 'bg-purple-950/20 border-purple-500/50 hover:bg-purple-950/30' 
                    : 'bg-purple-50/70 border-purple-300 hover:bg-purple-100/60'
                  : darkMode 
                    ? 'bg-slate-800 border-purple-500/40 hover:border-purple-500' 
                    : 'bg-white border-purple-300 hover:border-purple-500'
              }`}
              id="btn-opcio-1-selecciona-alumne"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  1
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-black uppercase tracking-tight">
                      1- Selecciona l'alumne
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {usuariSeleccionat 
                      ? `Alumne carregat: ${usuariSeleccionat.nom || usuariSeleccionat.displayName || usuariSeleccionat.email} (Clica per canviar)`
                      : "Clica aquí per triar l'alumne de la base de dades i desbloquejar el panell."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {usuariSeleccionat ? (
                  <span className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-purple-600 text-white flex items-center gap-1.5 shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                    Carregat
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                    Triar
                  </span>
                )}
              </div>
            </button>

            {/* 2. COMENÇAR ENTREVISTA */}
            <button
              disabled={!usuariSeleccionat}
              onClick={() => setSubSeccioActiva('2_comencar_entrevista')}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between shadow-sm ${
                !usuariSeleccionat
                  ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                  : `cursor-pointer active:scale-[0.99] ${
                      subSeccioActiva === '2_comencar_entrevista'
                        ? 'border-purple-500 ring-2 ring-purple-500/20 ' + (darkMode ? 'bg-slate-800' : 'bg-purple-50/50')
                        : darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-purple-400' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-300'
                    }`
              }`}
              id="btn-opcio-2-comencar-entrevista"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                  !usuariSeleccionat ? 'bg-slate-400 text-white' : 'bg-purple-600 text-white'
                }`}>
                  2
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-black uppercase tracking-tight">
                      2- Començar entrevista
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Inicia la sessió en directe, registre de respostes i avaluació en temps real.
                  </p>
                </div>
              </div>
              {!usuariSeleccionat ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* 3. PREPARAR ENTREVISTES */}
            <button
              disabled={!usuariSeleccionat}
              onClick={() => setSubSeccioActiva('3_preparar_entrevistes')}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between shadow-sm ${
                !usuariSeleccionat
                  ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                  : `cursor-pointer active:scale-[0.99] ${
                      subSeccioActiva === '3_preparar_entrevistes'
                        ? 'border-purple-500 ring-2 ring-purple-500/20 ' + (darkMode ? 'bg-slate-800' : 'bg-purple-50/50')
                        : darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-purple-400' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-300'
                    }`
              }`}
              id="btn-opcio-3-preparar-entrevistes"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                  !usuariSeleccionat ? 'bg-slate-400 text-white' : 'bg-purple-600 text-white'
                }`}>
                  3
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-black uppercase tracking-tight">
                      3- Preparar entrevistes
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Planifica preguntes clau, selecciona pautes específiques o assigna un guió previ.
                  </p>
                </div>
              </div>
              {!usuariSeleccionat ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* 4. VEURE HISTORIAL D'ENTREVISTES */}
            <button
              disabled={!usuariSeleccionat}
              onClick={() => setSubSeccioActiva('4_veure_historial')}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between shadow-sm ${
                !usuariSeleccionat
                  ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                  : `cursor-pointer active:scale-[0.99] ${
                      subSeccioActiva === '4_veure_historial'
                        ? 'border-purple-500 ring-2 ring-purple-500/20 ' + (darkMode ? 'bg-slate-800' : 'bg-purple-50/50')
                        : darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-purple-400' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-300'
                    }`
              }`}
              id="btn-opcio-4-veure-historial"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                  !usuariSeleccionat ? 'bg-slate-400 text-white' : 'bg-purple-600 text-white'
                }`}>
                  4
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-black uppercase tracking-tight">
                      4- Veure historial d'entrevistes
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Consulta el registre de simulacres anteriors, evolució de l'aspirant i feedback de sessions.
                  </p>
                </div>
              </div>
              {!usuariSeleccionat ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* 5. VEURE BIODATA */}
            <button
              disabled={!usuariSeleccionat}
              onClick={() => setSubSeccioActiva('5_veure_biodata')}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between shadow-sm ${
                !usuariSeleccionat
                  ? 'opacity-40 grayscale cursor-not-allowed bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                  : `cursor-pointer active:scale-[0.99] ${
                      subSeccioActiva === '5_veure_biodata'
                        ? 'border-purple-500 ring-2 ring-purple-500/20 ' + (darkMode ? 'bg-slate-800' : 'bg-purple-50/50')
                        : darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-purple-400' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-300'
                    }`
              }`}
              id="btn-opcio-5-veure-biodata"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                  !usuariSeleccionat ? 'bg-slate-400 text-white' : 'bg-purple-600 text-white'
                }`}>
                  5
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-black uppercase tracking-tight">
                      5- Veure Biodata
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Accedeix a les 10 notes competencials de l'alumne i al detall de les 80 preguntes respostes.
                  </p>
                </div>
              </div>
              {!usuariSeleccionat ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              )}
            </button>

          </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: MENÚ DE 3 OPCIONS -> "2- EINA DE GESTIÓ - PROFESSORAT" */}
      {/* ========================================================================= */}
      {seccioPrincipal === 'gestio_professorat' && (
        <div className="w-full">
          {subSeccioActiva === 'prof_1_presets_generic' ? (
            /* SUBPANTALLA 1: BANC DE PREGUNTES I PRESETS GENÈRICS */
            <GestioPresetsGenerics 
              darkMode={darkMode}
              onTornar={() => setSubSeccioActiva(null)}
              onSeleccionarPerAEntrevista={(textInjectat) => {
                setGuioPerAEntrevista(textInjectat);
                setSeccioPrincipal('entrevista');
                setSubSeccioActiva('preparacio');
              }}
            />
          ) : subSeccioActiva === 'prof_2_presets_alumne' ? (
            /* SUBPANTALLA 2: PRESETS PER A ALUMNE CONCRET */
            <GestioPresetsAlumneConcret
              darkMode={darkMode}
              alumneInicial={usuariSeleccionat}
              onTornar={() => setSubSeccioActiva(null)}
              onSeleccionarPerAEntrevista={(textInjectat) => {
                setGuioPerAEntrevista(textInjectat);
                setSeccioPrincipal('entrevista');
                setSubSeccioActiva('preparacio');
              }}
            />
          ) : subSeccioActiva === 'prof_3_historial_alumne' ? (
            /* SUBPANTALLA 3: HISTORIAL I NOTES DOCENTS PER A ALUMNE CONCRET */
            <HistorialAlumneConcret
              darkMode={darkMode}
              alumneInicial={usuariSeleccionat}
              onTornar={() => setSubSeccioActiva(null)}
            />
          ) : (
            <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full py-2">
              
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Menú de configuració docent:
              </p>

              <div className="flex flex-col gap-3">
                
                {/* 1. PRESETS - GENÈRIC */}
                <button
                  onClick={() => setSubSeccioActiva('prof_1_presets_generic')}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm active:scale-[0.99] ${
                    subSeccioActiva === 'prof_1_presets_generic'
                      ? 'border-blue-500 ring-2 ring-blue-500/20 ' + (darkMode ? 'bg-slate-800' : 'bg-blue-50/50')
                      : darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-blue-400' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300'
                  }`}
                  id="btn-prof-1-presets-generic"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      1
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-base font-black uppercase tracking-tight">
                          1- Presets - Genèric
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Banc de preguntes amb etiquetes (Biodata, Competències, Casos pràctics) i pautes docents.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                {/* 2. PRESETS - ALUMNE CONCRET */}
                <button
                  onClick={() => setSubSeccioActiva('prof_2_presets_alumne')}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm active:scale-[0.99] ${
                    subSeccioActiva === 'prof_2_presets_alumne'
                      ? 'border-blue-500 ring-2 ring-blue-500/20 ' + (darkMode ? 'bg-slate-800' : 'bg-blue-50/50')
                      : darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-blue-400' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300'
                  }`}
                  id="btn-prof-2-presets-alumne"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      2
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-base font-black uppercase tracking-tight">
                          2- Presets - Alumne concret
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Plantilles personalitzades i preguntes a mida per treballar punts febles d'un aspirant específic.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                {/* 3. HISTORIAL - ALUMNE CONCRET */}
                <button
                  onClick={() => setSubSeccioActiva('prof_3_historial_alumne')}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm active:scale-[0.99] ${
                    subSeccioActiva === 'prof_3_historial_alumne'
                      ? 'border-blue-500 ring-2 ring-blue-500/20 ' + (darkMode ? 'bg-slate-800' : 'bg-blue-50/50')
                      : darkMode ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-blue-400' : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300'
                  }`}
                  id="btn-prof-3-historial-alumne"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      3
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-base font-black uppercase tracking-tight">
                          3- Historial - Alumne concret
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Històric global de sessions i notes pedagògiques compartides entre els professors per alumne.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SELECTOR D'ALUMNE */}
      {/* ========================================================================= */}
      {modalSelectorAlumneObert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 flex flex-col gap-5 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight">
                    1- Selecciona l'alumne
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tria l'aspirant per desbloquejar les opcions de l'entrevista
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalSelectorAlumneObert(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CERCADOR D'ALUMNES */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cerca per nom o correu electrònic..."
                value={cercador}
                onChange={(e) => setCercador(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* LLISTA RESULTATS */}
            <div className="max-h-72 overflow-y-auto flex flex-col gap-2 pr-1">
              {carregantUsuaris ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Carregant usuaris...
                </div>
              ) : usuarisFiltrats.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No s'ha trobat cap alumne amb aquest criteri.
                </div>
              ) : (
                usuarisFiltrats.map(u => {
                  const esSeleccionat = usuariSeleccionat?.id === u.id;
                  const nomMostrar = u.nom || u.displayName || u.email || 'Alumne sense nom';
                  return (
                    <button
                      key={u.id || u.email}
                      onClick={() => {
                        setUsuariSeleccionat(u);
                        setModalSelectorAlumneObert(false);
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        esSeleccionat
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40'
                          : darkMode
                          ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80'
                          : 'bg-slate-50 hover:bg-purple-50/50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs ${
                          esSeleccionat ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                          {nomMostrar[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black">{nomMostrar}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</span>
                        </div>
                      </div>
                      {esSeleccionat ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* PEU DEL MODAL */}
            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setModalSelectorAlumneObert(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Tancar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
