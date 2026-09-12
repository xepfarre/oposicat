// Explicació per a no-programadors:
// Aquest fitxer és el component "Lego" encarregat de gestionar la classe/sessió d'Entrevista Personal en Directe.
// Quan el professor clica a "2- Començar entrevista", s'obre aquesta pantalla amb:
// 1. Un pop-up inicial de comprovació (Alumne, Professor/a, Data) amb botó verd (correcte) i vermell (incorrecte/retorn).
// 2. Un carrusel superior horitzontal amb 4 opcions: Preset - Genèric, Preset - Alumne, Històric - Alumne, Eines interactives.
// 3. Un bloc gran de text per prendre les notes i anotacions en calent durant la conversa amb l'alumne.
// 4. Un botó inferior "Acabar entrevista" que desa tot el contingut a la Base de Dades (Firestore) a l'historial de l'alumne.

import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Calendar, Clock, Check, X, ChevronLeft, ChevronRight, 
  Save, Sparkles, BookOpen, Layers, History, Wrench, MessageSquare, 
  ArrowLeft, CheckCircle2, AlertCircle, FileText, Send, UserCheck, PlusCircle, Brain
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import GestioPresetsGenerics from './GestioPresetsGenerics';
import { EinesEntrevistaLiveWeb } from '../oposimossos/prova_psicologica/EinesEntrevistaLiveWeb';

interface SessioEntrevistaEnDirecteProps {
  darkMode: boolean;
  alumne: any;
  onTornar: () => void;
  notesInicials?: string;
}

export default function SessioEntrevistaEnDirecte({ 
  darkMode, 
  alumne, 
  onTornar,
  notesInicials = ''
}: SessioEntrevistaEnDirecteProps) {
  
  // =========================================================================
  // 1. ESTATS DE LA SESSIÓ I POP-UP DE VALIDACIÓ INICIAL
  // =========================================================================
  
  // Nom de l'alumne o text de reserva
  const nomAlumne = alumne?.nom || alumne?.displayName || alumne?.email || 'Alumne sense nom';
  
  // Nom del professor/a connectat o valor per defecte
  const usuariActual = auth?.currentUser;
  const nomProfessor = usuariActual?.displayName || usuariActual?.email || 'Professor/a d\'OposiCAT';
  
  // Data actual en format català amable
  const dataAvui = new Date().toLocaleDateString('ca-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Control del pop-up de verificació (obert per defecte a l'inici)
  const [modalVerificacioObert, setModalVerificacioObert] = useState(true);
  
  // =========================================================================
  // 2. ESTATS DEL CARRUSEL SUPERIOR (4 OPCIONS)
  // =========================================================================
  
  // Opcions del carrusel definides pel client:
  // 1- Preset - Generic
  // 2- Preset - Alumne
  // 3- Historic - Alumne
  // 4- Eines interactives
  const opcionsCarrusel = [
    { id: 'preset_generic', titol: 'Preset - Genèric', icon: BookOpen, desc: 'Plantilles i preguntes generals de simulacre' },
    { id: 'preset_alumne', titol: 'Preset - Alumne', icon: User, desc: 'Pautes i preguntes a mida per aquest alumne' },
    { id: 'historic_alumne', titol: 'Històric - Alumne', icon: History, desc: 'Consultar resums i notes de sessions anteriors' },
    { id: 'eines_interactives', titol: 'Eines interactives', icon: Wrench, desc: 'Rúbriques, temporitzador i dinàmiques en viu' },
  ];

  const [opcioCarruselActiva, setOpcioCarruselActiva] = useState<string>('preset_generic');
  
  // Referència per desplaçar el carrusel a esquerra/dreta
  const carruselRef = useRef<HTMLDivElement>(null);

  const moureCarrusel = (direccio: 'esquerra' | 'dreta') => {
    if (carruselRef.current) {
      const desflacament = direccio === 'esquerra' ? -200 : 200;
      carruselRef.current.scrollBy({ left: desflacament, behavior: 'smooth' });
    }
  };

  // =========================================================================
  // 3. ESTAT DEL BLOC DE TEXT I DESAT A LA BASE DE DADES
  // =========================================================================
  
  const [notesText, setNotesText] = useState<string>(notesInicials || '');
  const [desant, setDesant] = useState<boolean>(false);
  const [entrevistaFinalitzada, setEntrevistaFinalitzada] = useState<boolean>(false);
  const [missatgeError, setMissatgeError] = useState<string | null>(null);
  const [modalPresetsGenericsObert, setModalPresetsGenericsObert] = useState<boolean>(false);
  // Estat per obrir l'eina interactiva de les 10 competències clau
  const [modalEinesInteractivesObert, setModalEinesInteractivesObert] = useState<boolean>(false);

  // Comentari per a no-programadors:
  // Funció per gestionar el clic a qualsevol opció del carrusel superior:
  // Si clica a "Eines interactives", obrim directament la pissarra de les 10 competències en directe
  // mantenint intacte el text que l'entrevistador tingui escrit al bloc de notes!
  const handleClicOpcioCarrusel = (idOpcio: string) => {
    setOpcioCarruselActiva(idOpcio);
    if (idOpcio === 'eines_interactives') {
      setModalEinesInteractivesObert(true);
    } else if (idOpcio === 'preset_generic') {
      setModalPresetsGenericsObert(true);
    }
  };

  // Comentari per a no-programadors:
  // Si no s'ha passat un guió inicial explícit, comprovem si l'alumne ja tenia una
  // preparació desada prèviament a Firestore per carregar-la directament.
  useEffect(() => {
    if (notesInicials) {
      setNotesText(notesInicials);
      return;
    }

    const carregarPreparacioDesada = async () => {
      if (!alumne?.id && !alumne?.uid) return;
      const alumneId = alumne.id || alumne.uid;
      try {
        if (db) {
          const docRef = doc(db, 'preparacions_entrevistes', alumneId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.textGuioComplet && !notesText.trim()) {
              setNotesText(data.textGuioComplet);
            }
          }
        }
      } catch (err) {
        console.warn("Avís comprovant preparació prèvia de l'alumne:", err);
      }
    };

    carregarPreparacioDesada();
  }, [alumne, notesInicials]);

  // Funció per desar l'entrevista a Firestore en clicar "Acabar entrevista"
  const handleAcabarEntrevista = async () => {
    if (!notesText.trim()) {
      const confirmar = window.confirm("El bloc de text està buit. Vols finalitzar l'entrevista igualment?");
      if (!confirmar) return;
    }

    setDesant(true);
    setMissatgeError(null);

    try {
      // Dades completes de l'entrevista per a la BBDD
      const dadesEntrevista = {
        alumneId: alumne?.id || alumne?.uid || 'sense_id',
        alumneNom: nomAlumne,
        alumneEmail: alumne?.email || '',
        professorId: usuariActual?.uid || 'admin',
        professorNom: nomProfessor,
        professorEmail: usuariActual?.email || '',
        data: dataAvui,
        notes: notesText,
        einaSeleccionada: opcioCarruselActiva,
        estat: 'finalitzada',
        creatEl: new Date().toISOString(),
        timestamp: serverTimestamp()
      };

      // 1. Guardem a la col·lecció global 'entrevistes_personals'
      if (db) {
        await addDoc(collection(db, 'entrevistes_personals'), dadesEntrevista);
        
        // 2. Si l'alumne té ID, també ho desem a la seva subcol·lecció per accés directe ràpid
        if (alumne?.id || alumne?.uid) {
          const userId = alumne.id || alumne.uid;
          await addDoc(collection(db, `usuaris/${userId}/sessions_entrevista`), dadesEntrevista);
        }
      }

      setEntrevistaFinalitzada(true);
    } catch (err: any) {
      console.error("Error desant l'entrevista a Firestore:", err);
      setMissatgeError("S'ha produït un error en desar l'entrevista a la base de dades. Si us plau, torna-ho a provar.");
    } finally {
      setDesant(false);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-5 transition-colors duration-200 ${
      darkMode ? 'text-slate-100' : 'text-slate-800'
    }`}>

      {/* ========================================================================= */}
      {/* POP-UP INICIAL DE VERIFICACIÓ (ALUMNE, PROFESSOR, DATA) */}
      {/* ========================================================================= */}
      {modalVerificacioObert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-150 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Capçalera del pop-up */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Verificació de la Sessió
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprova que les dades següents siguin correctes abans de començar:
                </p>
              </div>
            </div>

            {/* Els 3 Valors Sol·licitats */}
            <div className="flex flex-col gap-3">
              
              {/* VALOR 1: ALUMNE */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Alumne:
                    </span>
                    <span className="text-sm font-black text-purple-600 dark:text-purple-300">
                      {nomAlumne}
                    </span>
                  </div>
                </div>
              </div>

              {/* VALOR 2: PROFESSOR/A */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Professor/a:
                    </span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-300">
                      {nomProfessor}
                    </span>
                  </div>
                </div>
              </div>

              {/* VALOR 3: DATA */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Data:
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-300">
                      {dataAvui}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTONS PETITS: VERD (CORRECTE) I VERMELL (INCORRECTE) */}
            <div className="pt-2 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-center text-slate-500 dark:text-slate-400">
                Tot és correcte per iniciar l'entrevista?
              </span>
              
              <div className="flex items-center justify-center gap-3">
                
                {/* BOTÓ VERMELL PETIT: INCORRECTE (Torna enrere) */}
                <button
                  onClick={onTornar}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                  title="Les dades són incorrectes, torna endarrere"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  Incorrecte (Enrere)
                </button>

                {/* BOTÓ VERD PETIT: CORRECTE (Desapareix el pop-up) */}
                <button
                  onClick={() => setModalVerificacioObert(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                  title="Tot és correcte, començar sessió"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Correcte (Continuar)
                </button>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA QUAN L'ENTREVISTA S'HA FINALITZAT I GUARDAT AMB ÈXIT */}
      {/* ========================================================================= */}
      {entrevistaFinalitzada ? (
        <div className={`p-8 rounded-3xl border text-center flex flex-col items-center justify-center gap-4 max-w-xl mx-auto my-6 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">
            Entrevista Finalitzada i Desada
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Totes les notes i dades de l'entrevista de l'aspirant <strong>{nomAlumne}</strong> s'han registrat correctament a l'historial amb la data d'avui ({dataAvui}) i el professor/a ({nomProfessor}).
          </p>
          <button
            onClick={onTornar}
            className="mt-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Tornar al menú d'entrevistes
          </button>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* BARRA SUPERIOR DE CONTEXT (Alumne + Data + Retorn) */}
          {/* ========================================================================= */}
          <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={onTornar}
                className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Tornar al menú anterior"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Sessió en directe
                </span>
                <span className="text-xs sm:text-sm font-black">
                  Alumne: {nomAlumne}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                Docent: <strong className="text-slate-800 dark:text-slate-200">{nomProfessor}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                {dataAvui}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* EINA CARRUSEL SUPERIOR (AMPLE DE PUNTA A PUNTA, POC ALT, 4 OPCIONS) */}
          {/* ========================================================================= */}
          <div className={`w-full rounded-2xl border p-2 flex items-center gap-2 relative ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            
            {/* Botó Fletxa Esquerra */}
            <button
              onClick={() => moureCarrusel('esquerra')}
              className={`p-1.5 sm:p-2 rounded-xl border shrink-0 transition-all cursor-pointer active:scale-90 ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Desplaçar carrusel a l'esquerra"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Contenidor de les 4 opcions horitzontals amb scroll suau */}
            <div 
              ref={carruselRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full py-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {opcionsCarrusel.map((opcio) => {
                const esActiva = opcioCarruselActiva === opcio.id;
                const Icona = opcio.icon;
                return (
                  <button
                    key={opcio.id}
                    onClick={() => handleClicOpcioCarrusel(opcio.id)}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer active:scale-95 ${
                      esActiva
                        ? 'bg-purple-600 border-purple-600 text-white shadow-sm ring-2 ring-purple-500/30'
                        : darkMode
                        ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white'
                        : 'bg-slate-50 hover:bg-purple-50/50 border-slate-200 text-slate-700 hover:text-purple-700'
                    }`}
                  >
                    <Icona className={`w-3.5 h-3.5 ${esActiva ? 'text-white' : 'text-purple-500'}`} />
                    <span>{opcio.titol}</span>
                  </button>
                );
              })}
            </div>

            {/* Botó Fletxa Dreta */}
            <button
              onClick={() => moureCarrusel('dreta')}
              className={`p-1.5 sm:p-2 rounded-xl border shrink-0 transition-all cursor-pointer active:scale-90 ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Desplaçar carrusel a la dreta"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

          {/* Mini Indicador de l'opció del carrusel activa */}
          <div className={`px-4 py-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            darkMode ? 'bg-purple-950/20 border-purple-900/40 text-purple-300' : 'bg-purple-50/60 border-purple-200 text-purple-900'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Eina activa del carrusel: <strong>{opcionsCarrusel.find(o => o.id === opcioCarruselActiva)?.titol}</strong>
              </span>
            </div>

            {/* Accions ràpides segons l'opció activa del carrusel */}
            <div className="flex items-center gap-2 flex-wrap">
              {opcioCarruselActiva === 'preset_generic' && (
                <button
                  onClick={() => setModalPresetsGenericsObert(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                  id="btn-obrir-banc-des-de-sessio"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Obrir Banc de Preguntes / Presets</span>
                </button>
              )}

              {opcioCarruselActiva === 'eines_interactives' && (
                <button
                  onClick={() => setModalEinesInteractivesObert(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer transition-all animate-pulse"
                  id="btn-obrir-eines-interactives-sessio"
                >
                  <Brain className="w-3.5 h-3.5 text-amber-300" />
                  <span>Obrir Pissarra 10 Competències Clau</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RESTA DEL BLOC: BLOC DE TEXT PER A LES NOTES D'ENTREVISTA */}
          {/* ========================================================================= */}
          <div className={`p-5 rounded-3xl border flex flex-col gap-4 shadow-sm ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-black uppercase tracking-tight">
                  Bloc de Notes de l'Entrevista
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalPresetsGenericsObert(true)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  + Inserir preguntes des del Banc
                </button>
                <div className="text-[11px] text-slate-400 font-medium">
                  {notesText.length} caràcters | {notesText.trim() ? notesText.trim().split(/\s+/).length : 0} paraules
                </div>
              </div>
            </div>

            {/* Textarea Gran per prendre notes en calent */}
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Escriu aquí les notes, preguntes realitzades, observacions del comportament de l'aspirant, punts forts, àrees de millora i recomanacions de cara a l'entrevista oficial de Mossos d'Esquadra..."
              rows={12}
              className={`w-full p-4 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                darkMode 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-500' 
                  : 'bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
              id="textarea-notes-entrevista"
            />

            {/* Missatge d'error si falla el desat */}
            {missatgeError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{missatgeError}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* BOTÓ INFERIOR: "ACABAR ENTREVISTA" */}
            {/* ========================================================================= */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                En acabar, es desarà tot el text a l'historial de l'alumne amb la data i el docent responsable.
              </span>

              <button
                onClick={handleAcabarEntrevista}
                disabled={desant}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 cursor-pointer transition-all"
                id="btn-acabar-entrevista"
              >
                {desant ? (
                  <>
                    <Save className="w-4 h-4 animate-spin" />
                    Desant a la base de dades...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Acabar entrevista
                  </>
                )}
              </button>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* MODAL: BANC DE PREGUNTES I PRESETS PER INJECTAR DIRECTAMENT */}
          {/* ========================================================================= */}
          {modalPresetsGenericsObert && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
              <div className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto ${
                darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <h3 className="text-base font-black uppercase tracking-tight">
                      Selecciona preguntes per a la sessió de l'alumne
                    </h3>
                  </div>
                  <button
                    onClick={() => setModalPresetsGenericsObert(false)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Component complet del Banc de Preguntes amb mode selecció per a sessió */}
                <GestioPresetsGenerics
                  darkMode={darkMode}
                  onSeleccionarPerAEntrevista={(contingutGenerat) => {
                    setNotesText((prev) => {
                      if (!prev.trim()) return contingutGenerat;
                      return prev + '\n\n' + contingutGenerat;
                    });
                    setModalPresetsGenericsObert(false);
                  }}
                  onTornar={() => setModalPresetsGenericsObert(false)}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL / PANTALLA EN DIRECTE: 10 COMPETÈNCIES CLAU (EINES INTERACTIVES)   */}
          {/* ========================================================================= */}
          {modalEinesInteractivesObert && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col overflow-y-auto animate-in fade-in duration-150">
              {/* Comentari per a no-programadors:
                  Aquest component es connecta a Firestore a la sala en temps real de l'alumne.
                  El docent pot marcar les seves pautes (Blau), veure el que defensa l'alumne (Verd),
                  enviar-li preguntes o situacions i, el més important:
                  TOT EL QUE S'HA ESCRIT AL BLOC DE NOTES ES CONSERVA INTACTE!
              */}
              <EinesEntrevistaLiveWeb
                userIdProp={alumne?.id || alumne?.uid}
                nomAlumneProp={nomAlumne}
                esDocent={true}
                onTornar={() => setModalEinesInteractivesObert(false)}
                onInserirANotes={(resumCompetencies) => {
                  // Inserim el resum al final del bloc de notes sense perdre el text previ
                  setNotesText((textExistent) => {
                    if (!textExistent.trim()) return resumCompetencies;
                    return textExistent + '\n\n' + resumCompetencies;
                  });
                }}
              />
            </div>
          )}
        </>
      )}

    </div>
  );
}
