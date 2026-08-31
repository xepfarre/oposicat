// Explicació per a no-programadors:
// Aquest fitxer conté la pantalla dedicada "Eines de l'Entrevista en Directe".
// Està especialment dissenyada per utilitzar-se des del telèfon mòbil o ordinador durant una classe 1v1 amb el professor.
// Mostra exclusivament les 10 Competències Clau oficials dels Mossos d'Esquadra.
// Quan l'alumne prem qualsevol competència, aquesta s'il·lumina i s'envia a l'instant (en temps real)
// a la pantalla del professor al Backoffice, permetent treballar i argumentar conjuntament.

import React, { useState, useEffect } from 'react';
import { Brain, ArrowLeft, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { db, auth } from '../../../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { COMPETENCIES_ENTREVISTA_LIVE_10 } from './preguntes_biodata';

interface EinesEntrevistaLiveWebProps {
  onTornar?: () => void;
  userIdProp?: string;
  nomAlumneProp?: string;
}

export const EinesEntrevistaLiveWeb: React.FC<EinesEntrevistaLiveWebProps> = ({
  onTornar,
  userIdProp,
  nomAlumneProp
}) => {
  // Comentari planer per a no-programadors:
  // Obtenim l'identificador de l'alumne autenticat o el que ens han passat per propietat
  const currentAuthUser = auth.currentUser;
  const targetUserId = userIdProp || currentAuthUser?.uid || 'usuari_convidat';
  const targetUserNom = nomAlumneProp || currentAuthUser?.displayName || currentAuthUser?.email || 'Aspirant OposiCAT';

  const [competenciesMarcades, setCompetenciesMarcades] = useState<string[]>([]);
  const [preguntaActual, setPreguntaActual] = useState<string>('');
  const [estatConnexio, setEstatConnexio] = useState<'connectant' | 'connectat' | 'desconnectat'>('connectant');

  // Escoltador en temps real (onSnapshot) amb la base de dades
  useEffect(() => {
    if (!targetUserId) return;

    const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
    const unsub = onSnapshot(docRef, (snap) => {
      setEstatConnexio('connectat');
      if (snap.exists()) {
        const dades = snap.data();
        if (Array.isArray(dades.competenciesMarcades)) {
          setCompetenciesMarcades(dades.competenciesMarcades);
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

  // Funció per marcar o desmarcar una competència i sincronitzar amb el professor
  const toggleCompetencia = async (codiComp: string) => {
    let novesCompetencies: string[] = [];
    if (competenciesMarcades.includes(codiComp)) {
      novesCompetencies = competenciesMarcades.filter((c) => c !== codiComp);
    } else {
      novesCompetencies = [...competenciesMarcades, codiComp];
    }

    setCompetenciesMarcades(novesCompetencies);

    // Guardem a Firestore en temps real
    try {
      const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
      await setDoc(docRef, {
        competenciesMarcades: novesCompetencies,
        ultimaActualitzacio: serverTimestamp(),
        userId: targetUserId,
        nomAlumne: targetUserNom,
        emailAlumne: currentAuthUser?.email || '',
        ultimClic: codiComp
      }, { merge: true });
    } catch (e) {
      console.error("Error sincronitzant competència:", e);
    }
  };

  // Funció per netejar la pissarra (per a la següent pregunta)
  const netejarPissarra = async () => {
    setCompetenciesMarcades([]);
    try {
      const docRef = doc(db, 'usuaris', targetUserId, 'entrevista_live_state', 'actual');
      await setDoc(docRef, {
        competenciesMarcades: [],
        ultimaActualitzacio: serverTimestamp(),
        ultimClic: 'reset'
      }, { merge: true });
    } catch (e) {
      console.error("Error netejant pissarra:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1a] text-white flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-150">
      
      {/* CAPÇALERA SUPERIOR NETEJA I SENSE DISTRACCIONS */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          {onTornar && (
            <button
              onClick={onTornar}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Tornar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-amber-400" />
              10 Competències Clau
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Entrevista en directe 1v1
            </p>
          </div>
        </div>

        {/* Estat de sincronització amb el professor */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            {estatConnexio === 'connectat' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-medium text-[10px] hidden xs:inline">En directe</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-400 font-medium text-[10px]">Connectant...</span>
              </>
            )}
          </div>

          <button
            onClick={netejarPissarra}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            title="Netejar selecció"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Netejar</span>
          </button>
        </div>
      </div>

      {/* BANNER OPCIONAL SI EL PROFESSOR HA ENVIAT UN ENUNCIAT O CAS PRÀCTIC */}
      {preguntaActual && (
        <div className="w-full max-w-2xl mx-auto my-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">
              Situació / Pregunta del professor:
            </span>
            <p className="text-xs text-amber-100 font-medium leading-relaxed">
              {preguntaActual}
            </p>
          </div>
        </div>
      )}

      {/* LLISTA VERTICAL DE LES 10 COMPETÈNCIES CLAU (SENSE ACLARACIONS, COLOR VERD EN FER CLIC) */}
      <div className="w-full max-w-2xl mx-auto my-auto py-2">
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {COMPETENCIES_ENTREVISTA_LIVE_10.map((comp) => {
            const isSelected = competenciesMarcades.includes(comp.id);
            return (
              <button
                key={comp.id}
                id={`btn-live-comp-${comp.id}`}
                onClick={() => toggleCompetencia(comp.id)}
                className={`w-full p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] cursor-pointer select-none flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/60'
                    : 'bg-[#0a1426] border-slate-800/90 text-slate-200 hover:border-slate-700 hover:bg-[#0f1d36]'
                }`}
              >
                {/* Text literal de la competència sense aclaracions */}
                <span className={`text-xs sm:text-sm tracking-wide ${
                  isSelected ? 'font-black text-slate-950' : 'font-bold text-slate-200'
                }`}>
                  {comp.titol}
                </span>

                {/* Indicador visual de selecció verda */}
                <div className="shrink-0 flex items-center justify-center">
                  {isSelected ? (
                    <span className="w-6 h-6 rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center shadow">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full border border-slate-700 bg-slate-900/80 flex items-center justify-center text-[11px] font-mono text-slate-500">
                      {comp.id}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Resum de competències seleccionades per l'aspirant per donar suport a l'argumentació */}
        <div className="mt-3 p-3 rounded-xl bg-[#091222] border border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Actives ({competenciesMarcades.length}):
            </span>
            {competenciesMarcades.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">
                Fes clic a les competències implicades a la teva resposta...
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
              onClick={netejarPissarra}
              className="text-[10px] text-emerald-400 hover:underline font-bold cursor-pointer"
            >
              Netejar per a la següent pregunta
            </button>
          )}
        </div>
      </div>

      {/* PEU DE PÀGINA DISCRET AMB ORIENTACIÓ DIDÀCTICA */}
      <div className="w-full max-w-2xl mx-auto pt-2 text-center text-[10px] text-slate-500">
        OposiCAT • Pissarra d'Entrevista en Directe sincronitzada amb el teu docent
      </div>
    </div>
  );
};
