// Explicació per a no-programadors:
// Aquest fitxer conté la pantalla dedicada "Eines de l'Entrevista en Directe".
// Està especialment dissenyada per utilitzar-se des del telèfon mòbil o ordinador durant una classe 1v1 amb el professor.
// Mostra exclusivament les 10 Competències Clau oficials dels Mossos d'Esquadra.
// - Quan l'alumne prem qualsevol competència, s'il·lumina en COLOR VERD i s'envia a l'instant al professor.
// - Quan l'entrevistador/professor indica una competència clau important des del Backoffice, s'il·lumina a l'instant en COLOR BLAU a la pantalla de l'alumne!
// - Si tots dos la marquen alhora, es mostra clarament amb distinció doble (blau del docent + verd de l'alumne).

import React, { useState, useEffect } from 'react';
import { Brain, ArrowLeft, RotateCcw, Sparkles, CheckCircle2, Star, Check, UserCheck, FileText, Send, X, Copy, CheckCheck } from 'lucide-react';
import { db, auth } from '../../../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { COMPETENCIES_ENTREVISTA_LIVE_10 } from './preguntes_biodata';

// Explicació per a no-programadors:
// Propietats que rep aquest component:
// - onTornar: funció per tancar aquesta pantalla i tornar a les notes de l'entrevista
// - userIdProp: l'identificador únic de l'alumne a la base de dades
// - nomAlumneProp: el nom o correu de l'aspirant
// - esDocent: si és cert, activa els comandaments avançats per al professor (pautar en blau, enviar preguntes, etc.)
// - onInserirANotes: funció opcional per traspassar el resum de competències directament al bloc de notes
interface EinesEntrevistaLiveWebProps {
  onTornar?: () => void;
  userIdProp?: string;
  nomAlumneProp?: string;
  esDocent?: boolean;
  onInserirANotes?: (text: string) => void;
}

export const EinesEntrevistaLiveWeb: React.FC<EinesEntrevistaLiveWebProps> = ({
  onTornar,
  userIdProp,
  nomAlumneProp,
  esDocent = false,
  onInserirANotes
}) => {
  // Comentari planer per a no-programadors:
  // Obtenim l'identificador de l'usuari autenticat en temps real
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  const targetUserId = userIdProp || currentUser?.uid || 'usuari_convidat';
  const targetUserNom = nomAlumneProp || currentUser?.displayName || currentUser?.email || 'Aspirant OposiCAT';

  // Competències marcades per l'alumne (en color verd)
  const [competenciesMarcades, setCompetenciesMarcades] = useState<string[]>([]);
  // Competències destacades pel professor/entrevistador (en color blau)
  const [professorCompetencies, setProfessorCompetencies] = useState<string[]>([]);
  const [preguntaActual, setPreguntaActual] = useState<string>('');
  const [textNovaPregunta, setTextNovaPregunta] = useState<string>('');
  const [enviantPregunta, setEnviantPregunta] = useState<boolean>(false);
  const [estatConnexio, setEstatConnexio] = useState<'connectant' | 'connectat' | 'desconnectat'>('connectant');
  
  // Mode de marcatge quan estem en perfil docent:
  // 'docent': fa clic i s'il·lumina en BLAU com a pauta per a l'alumne
  // 'alumne': fa clic i s'il·lumina en VERD (com si l'alumne marqués la resposta)
  const [modeMarcatgeDocent, setModeMarcatgeDocent] = useState<'docent' | 'alumne'>('docent');
  const [missatgeCopiat, setMissatgeCopiat] = useState<boolean>(false);

  // Escoltador en temps real (onSnapshot) amb la base de dades Firestore
  useEffect(() => {
    if (!targetUserId || !db) return;

    const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
    const unsub = onSnapshot(docRef, (snap) => {
      setEstatConnexio('connectat');
      if (snap.exists()) {
        const dades = snap.data();
        if (Array.isArray(dades.competenciesMarcades)) {
          setCompetenciesMarcades(dades.competenciesMarcades);
        }
        if (Array.isArray(dades.professorCompetencies)) {
          setProfessorCompetencies(dades.professorCompetencies);
        } else {
          setProfessorCompetencies([]);
        }
        if (dades.preguntaActualText !== undefined) {
          setPreguntaActual(dades.preguntaActualText || '');
        }
      }
    }, (err) => {
      console.warn("Error escoltant pissarra live:", err);
      setEstatConnexio('desconnectat');
    });

    return () => unsub();
  }, [targetUserId]);

  // Comentari per a no-programadors:
  // Si som docent i estem en mode docent, marquem les pautes del professor en BLAU.
  // Si som alumne o docent en mode alumne, marquem les respostes de l'aspirant en VERD.
  const handleClickCompetencia = async (codiComp: string) => {
    if (esDocent && modeMarcatgeDocent === 'docent') {
      // Commutar pauta del professor en BLAU
      let noves: string[] = [];
      if (professorCompetencies.includes(codiComp)) {
        noves = professorCompetencies.filter((c) => c !== codiComp);
      } else {
        noves = [...professorCompetencies, codiComp];
      }
      setProfessorCompetencies(noves);

      try {
        if (db) {
          const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
          await setDoc(docRef, {
            professorCompetencies: noves,
            ultimaActualitzacio: serverTimestamp(),
            userId: targetUserId,
            nomAlumne: targetUserNom,
            ultimClicDocent: codiComp
          }, { merge: true });
        }
      } catch (e) {
        console.error("Error sincronitzant competència docent:", e);
      }
    } else {
      // Commutar resposta de l'aspirant en VERD
      let novesCompetencies: string[] = [];
      if (competenciesMarcades.includes(codiComp)) {
        novesCompetencies = competenciesMarcades.filter((c) => c !== codiComp);
      } else {
        novesCompetencies = [...competenciesMarcades, codiComp];
      }
      setCompetenciesMarcades(novesCompetencies);

      try {
        if (db) {
          const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
          await setDoc(docRef, {
            competenciesMarcades: novesCompetencies,
            ultimaActualitzacio: serverTimestamp(),
            userId: targetUserId,
            nomAlumne: targetUserNom,
            emailAlumne: currentUser?.email || '',
            ultimClic: codiComp
          }, { merge: true });
        }
      } catch (e) {
        console.error("Error sincronitzant competència:", e);
      }
    }
  };

  // Funció per netejar les respostes de l'alumne (en verd)
  const netejarRespostesAlumne = async () => {
    setCompetenciesMarcades([]);
    try {
      if (db) {
        const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
        await setDoc(docRef, {
          competenciesMarcades: [],
          ultimaActualitzacio: serverTimestamp(),
          ultimClic: 'reset_alumne'
        }, { merge: true });
      }
    } catch (e) {
      console.error("Error netejant respostes alumne:", e);
    }
  };

  // Funció per netejar les pautes del professor (en blau)
  const netejarPautesDocent = async () => {
    setProfessorCompetencies([]);
    try {
      if (db) {
        const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
        await setDoc(docRef, {
          professorCompetencies: [],
          ultimaActualitzacio: serverTimestamp(),
          ultimClicDocent: 'reset_docent'
        }, { merge: true });
      }
    } catch (e) {
      console.error("Error netejant pautes docent:", e);
    }
  };

  // Funció per netejar tota la pissarra a zero
  const netejarTot = async () => {
    setCompetenciesMarcades([]);
    setProfessorCompetencies([]);
    setPreguntaActual('');
    try {
      if (db) {
        const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
        await setDoc(docRef, {
          competenciesMarcades: [],
          professorCompetencies: [],
          preguntaActualText: '',
          ultimaActualitzacio: serverTimestamp(),
          ultimClic: 'reset_total'
        }, { merge: true });
      }
    } catch (e) {
      console.error("Error netejant pissarra completa:", e);
    }
  };

  // Funció per enviar la pregunta o situació en viu a l'alumne
  const handleEnviarPregunta = async () => {
    if (!textNovaPregunta.trim()) return;
    setEnviantPregunta(true);
    try {
      if (db) {
        const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
        await setDoc(docRef, {
          preguntaActualText: textNovaPregunta.trim(),
          ultimaActualitzacio: serverTimestamp()
        }, { merge: true });
      }
      setPreguntaActual(textNovaPregunta.trim());
      setTextNovaPregunta('');
    } catch (e) {
      console.error("Error enviant pregunta live:", e);
    } finally {
      setEnviantPregunta(false);
    }
  };

  // Funció per esborrar l'enunciat de la pregunta en directe
  const handleEsborrarPregunta = async () => {
    try {
      if (db) {
        const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
        await setDoc(docRef, {
          preguntaActualText: '',
          ultimaActualitzacio: serverTimestamp()
        }, { merge: true });
      }
      setPreguntaActual('');
    } catch (e) {
      console.error("Error esborrant pregunta:", e);
    }
  };

  // Funció per generar un resum estructurat i afegir-lo a les notes de l'entrevista
  const handleCopiarOInserirNotes = () => {
    const titolsAlumne = competenciesMarcades
      .map(id => COMPETENCIES_ENTREVISTA_LIVE_10.find(c => c.id === id)?.titol || id)
      .join(', ');
    const titolsDocent = professorCompetencies
      .map(id => COMPETENCIES_ENTREVISTA_LIVE_10.find(c => c.id === id)?.titol || id)
      .join(', ');
    const coincidents = competenciesMarcades
      .filter(id => professorCompetencies.includes(id))
      .map(id => COMPETENCIES_ENTREVISTA_LIVE_10.find(c => c.id === id)?.titol || id)
      .join(', ');

    const resumText = [
      `=== AVALUACIÓ EN DIRECTE: 10 COMPETÈNCIES CLAU ===`,
      preguntaActual ? `• Situació / Pregunta plantejada: "${preguntaActual}"` : null,
      `• Pautes de l'entrevistador (Blau): ${titolsDocent || 'Cap seleccionada'}`,
      `• Competències defensades per l'aspirant (Verd): ${titolsAlumne || 'Cap seleccionada'}`,
      `• Coincidències directes: ${coincidents || 'Cap coincidència registrada'}`,
      `================================================`
    ].filter(Boolean).join('\n');

    if (onInserirANotes) {
      onInserirANotes(resumText);
      setMissatgeCopiat(true);
      setTimeout(() => setMissatgeCopiat(false), 3000);
    } else {
      navigator.clipboard?.writeText(resumText);
      setMissatgeCopiat(true);
      setTimeout(() => setMissatgeCopiat(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1a] text-white flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-150">
      
      {/* CAPÇALERA SUPERIOR NETEJA I AMB CONTROL DE RETORN */}
      <div className="w-full max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onTornar && (
            <button
              onClick={onTornar}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Tancar eina i tornar a les notes de l'entrevista"
              id="btn-tornar-de-eines-live"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Tornar a les notes</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-amber-400" />
                10 Competències Clau
              </h1>
              {esDocent && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white">
                  Panell Docent 1v1
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Aspirant: <strong className="text-slate-200">{targetUserNom}</strong>
            </p>
          </div>
        </div>

        {/* Estat de sincronització i accions ràpides */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
            {estatConnexio === 'connectat' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-semibold text-[10px]">Sincronitzat</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-400 font-medium text-[10px]">Connectant...</span>
              </>
            )}
          </div>

          {/* Botó per netejar */}
          <button
            onClick={netejarTot}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            title="Reiniciar seleccions de la pissarra"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {/* SELECTOR DE MODE DE MARCATGE PER AL DOCENT */}
      {esDocent && (
        <div className="w-full max-w-3xl mx-auto my-2.5 p-3 rounded-2xl bg-[#0a1426] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-slate-300 text-[11px] font-bold">
              En fer clic a una competència marcaràs:
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Mode 1: Pauta del docent (Blau) */}
            <button
              onClick={() => setModeMarcatgeDocent('docent')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                modeMarcatgeDocent === 'docent'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300" />
              Pauta Docent (Blau)
            </button>

            {/* Mode 2: Resposta Aspirant (Verd) */}
            <button
              onClick={() => setModeMarcatgeDocent('alumne')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                modeMarcatgeDocent === 'alumne'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              Aspirant (Verd)
            </button>
          </div>
        </div>
      )}

      {/* LLEGENDA DE COLORS DIDÀCTICA: VERD (ALUMNE) I BLAU (PROFESSOR) */}
      <div className="w-full max-w-3xl mx-auto my-1 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px]">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />
            <span className="text-slate-300 font-medium">
              Defensades per l'alumne (<strong className="text-emerald-400">{competenciesMarcades.length} en Verd</strong>)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/30 animate-pulse" />
            <span className="text-slate-300 font-medium">
              Pautes del professor (<strong className="text-blue-400">{professorCompetencies.length} en Blau</strong>)
            </span>
          </div>
        </div>
        
        {competenciesMarcades.filter(c => professorCompetencies.includes(c)).length > 0 && (
          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-300" />
            {competenciesMarcades.filter(c => professorCompetencies.includes(c)).length} Coincidència
          </span>
        )}
      </div>

      {/* CAIXA DEL DOCENT PER ENVIAR SITUACIÓ / PREGUNTA EN DIRECTE */}
      {esDocent && (
        <div className="w-full max-w-3xl mx-auto my-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Plantejar situació o cas pràctic a l'aspirant en viu:
            </span>
            {preguntaActual && (
              <button
                onClick={handleEsborrarPregunta}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
              >
                Esborrar pregunta activa
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={textNovaPregunta}
              onChange={(e) => setTextNovaPregunta(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEnviarPregunta()}
              placeholder="Escriu una pregunta o situació (ex: Què fas si un company pren una decisió incorrecta?)..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={handleEnviarPregunta}
              disabled={enviantPregunta || !textNovaPregunta.trim()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </div>

          {preguntaActual && (
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-xs text-amber-200">
              <strong className="font-bold text-amber-300">Activa a la pantalla de l'alumne:</strong> {preguntaActual}
            </div>
          )}
        </div>
      )}

      {/* BANNER EN PANTALLA DE L'ALUMNE SI NO ÉS DOCENT */}
      {!esDocent && preguntaActual && (
        <div className="w-full max-w-2xl mx-auto my-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">
              Situació / Pregunta de l'entrevistador:
            </span>
            <p className="text-xs text-amber-100 font-medium leading-relaxed">
              {preguntaActual}
            </p>
          </div>
        </div>
      )}

      {/* LLISTA VERTICAL DE LES 10 COMPETÈNCIES CLAU (VERD PER ALUMNE, BLAU IL·LUMINAT PER PROFESSOR) */}
      <div className="w-full max-w-3xl mx-auto my-auto py-2">
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {COMPETENCIES_ENTREVISTA_LIVE_10.map((comp) => {
            const isSelectedAlumne = competenciesMarcades.includes(comp.id);
            const isSelectedDocent = professorCompetencies.includes(comp.id);
            const isCoincident = isSelectedAlumne && isSelectedDocent;

            return (
              <button
                key={comp.id}
                id={`btn-live-comp-${comp.id}`}
                onClick={() => handleClickCompetencia(comp.id)}
                className={`w-full p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] cursor-pointer select-none flex items-center justify-between gap-3 ${
                  isCoincident
                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 text-slate-950 font-black border-blue-400 shadow-xl shadow-blue-500/25 ring-2 ring-blue-400'
                    : isSelectedDocent
                    ? 'bg-blue-600 text-white font-black border-blue-400 shadow-xl shadow-blue-600/30 ring-2 ring-blue-400 animate-in fade-in'
                    : isSelectedAlumne
                    ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/60'
                    : 'bg-[#0a1426] border-slate-800/90 text-slate-200 hover:border-slate-700 hover:bg-[#0f1d36]'
                }`}
              >
                {/* Text literal de la competència */}
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black shrink-0 ${
                    isCoincident
                      ? 'bg-slate-950 text-amber-300'
                      : isSelectedDocent
                      ? 'bg-slate-950 text-blue-300'
                      : isSelectedAlumne
                      ? 'bg-slate-950 text-emerald-400'
                      : 'border border-slate-700 bg-slate-900/80 text-slate-400'
                  }`}>
                    {comp.id}
                  </span>

                  <span className={`text-xs sm:text-sm tracking-wide ${
                    isCoincident ? 'font-black text-slate-950' : isSelectedDocent ? 'font-black text-white' : isSelectedAlumne ? 'font-black text-slate-950' : 'font-semibold text-slate-200'
                  }`}>
                    {comp.titol}
                  </span>
                </div>

                {/* Indicadors visuals d'estat (Verd / Blau / Coincident) */}
                <div className="shrink-0 flex items-center gap-1.5">
                  {isCoincident ? (
                    <div className="flex items-center gap-1 bg-slate-950 text-amber-300 px-2 py-1 rounded-md text-[10px] font-black uppercase shadow">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>Coincident!</span>
                    </div>
                  ) : isSelectedDocent ? (
                    <div className="flex items-center gap-1 bg-slate-950 text-blue-300 px-2 py-1 rounded-md text-[10px] font-black uppercase shadow">
                      <Star className="w-3 h-3 text-blue-400" />
                      <span>Pauta Docent</span>
                    </div>
                  ) : isSelectedAlumne ? (
                    <div className="flex items-center gap-1 bg-slate-950 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-black uppercase shadow">
                      <Check className="w-3 h-3" />
                      <span>Aspirant</span>
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Resum de competències i botó per inserir al bloc de notes */}
        <div className="mt-3 p-3.5 rounded-2xl bg-[#091222] border border-slate-800 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Aspirant ({competenciesMarcades.length}):
              </span>
              {competenciesMarcades.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic">
                  Cap competència marcada per l'aspirant encara...
                </span>
              ) : (
                competenciesMarcades.map((codi) => {
                  const c = COMPETENCIES_ENTREVISTA_LIVE_10.find((item) => item.id === codi);
                  return (
                    <span
                      key={codi}
                      className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wide"
                    >
                      {c?.titol || codi}
                    </span>
                  );
                })
              )}
            </div>

            {competenciesMarcades.length > 0 && (
              <button
                onClick={netejarRespostesAlumne}
                className="text-[10px] text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                Netejar aspirant
              </button>
            )}
          </div>

          {/* Resum de les competències pautades pel professor en blau */}
          {professorCompetencies.length > 0 && (
            <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-blue-400 uppercase flex items-center gap-1">
                  <Star className="w-3 h-3" /> Pautes docent ({professorCompetencies.length}):
                </span>
                {professorCompetencies.map((codi) => {
                  const c = COMPETENCIES_ENTREVISTA_LIVE_10.find((item) => item.id === codi);
                  return (
                    <span
                      key={codi}
                      className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-black text-[10px] tracking-wide border border-blue-400/40"
                    >
                      {c?.titol || codi}
                    </span>
                  );
                })}
              </div>

              <button
                onClick={netejarPautesDocent}
                className="text-[10px] text-blue-400 hover:underline font-bold cursor-pointer"
              >
                Netejar pautes
              </button>
            </div>
          )}

          {/* BOTÓ DESTACAT: INSERIR RESUM AL BLOC DE NOTES DE L'ENTREVISTA */}
          {esDocent && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 text-center sm:text-left">
                Vols traspassar aquesta avaluació al document de l'entrevista?
              </span>

              <button
                onClick={handleCopiarOInserirNotes}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                id="btn-inserir-competencies-notes"
              >
                {missatgeCopiat ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-300" />
                    <span>Afegit al bloc de notes!</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Inserir resum al bloc de notes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PEU DE PÀGINA DISCRET AMB ORIENTACIÓ DIDÀCTICA */}
      <div className="w-full max-w-3xl mx-auto pt-2 text-center text-[10px] text-slate-500">
        OposiCAT • Pissarra d'Entrevista en Directe 1v1 sincronitzada en temps real
      </div>
    </div>
  );
};
