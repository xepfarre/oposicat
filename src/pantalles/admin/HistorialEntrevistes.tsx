// Explicació per a no-programadors:
// Aquest fitxer és el component encarregat de l'apartat:
// "Psicotècnica" -> "Entrevistes personals" -> "1- Entrevista" -> "4- Veure Historial d'Entrevistes".
// Mostra un seguit de botons verticals ordenats per data amb totes les sessions d'entrevista
// que s'han finalitzat i desat per a l'alumne seleccionat.
// En fer clic a qualsevol sessió, es pot recuperar i llegir tot el text i les notes de l'entrevista.

import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, User, ArrowLeft, RefreshCw, FileText, ChevronRight, 
  Copy, Check, Trash2, BookOpen, AlertCircle, Sparkles, MessageSquare,
  ShieldCheck, Eye
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore';

// Interfície per definir com és una entrevista desada a la base de dades
export interface SessioEntrevistaGuardada {
  id: string;
  alumneId: string;
  alumneNom: string;
  alumneEmail?: string;
  professorId?: string;
  professorNom?: string;
  professorEmail?: string;
  data?: string;
  notes?: string;
  einaSeleccionada?: string;
  estat?: string;
  creatEl?: string;
  timestamp?: any;
}

interface HistorialEntrevistesProps {
  darkMode: boolean;
  alumne: any;
  onTornar: () => void;
}

export default function HistorialEntrevistes({
  darkMode,
  alumne,
  onTornar
}: HistorialEntrevistesProps) {

  const nomAlumne = alumne?.nom || alumne?.displayName || alumne?.email || 'Alumne seleccionat';
  const alumneId = alumne?.id || alumne?.uid || '';

  // Estat per a la llista de sessions
  const [sessions, setSessions] = useState<SessioEntrevistaGuardada[]>([]);
  const [carregant, setCarregant] = useState<boolean>(true);
  const [errorCàrrega, setErrorCàrrega] = useState<string | null>(null);

  // Estat per a la sessió oberta en detall
  const [sessioSeleccionada, setSessioSeleccionada] = useState<SessioEntrevistaGuardada | null>(null);
  const [copiat, setCopiat] = useState<boolean>(false);
  const [eliminantId, setEliminantId] = useState<string | null>(null);

  // =========================================================================
  // 1. CARREGAR LES ENTREVISTES DE L'ALUMNE DES DE FIRESTORE
  // =========================================================================
  // Comentari per a no-programadors:
  // Cerquem a la base de dades totes les entrevistes que pertanyen a aquest alumne.
  // Busquem tant a la col·lecció global 'entrevistes_personals' com a la subcol·lecció de l'usuari
  // per assegurar-nos que no es perd cap registre.
  const carregarHistorial = async () => {
    if (!alumneId) {
      setCarregant(false);
      return;
    }

    setCarregant(true);
    setErrorCàrrega(null);

    try {
      if (db) {
        const entrevistesTrobades: SessioEntrevistaGuardada[] = [];
        const idsVistos = new Set<string>();

        // 1. Cercar a 'entrevistes_personals' on alumneId coincideix
        try {
          const qGlobal = query(
            collection(db, 'entrevistes_personals'),
            where('alumneId', '==', alumneId)
          );
          const snapGlobal = await getDocs(qGlobal);
          snapGlobal.forEach(docSnap => {
            if (!idsVistos.has(docSnap.id)) {
              idsVistos.add(docSnap.id);
              entrevistesTrobades.push({
                id: docSnap.id,
                ...(docSnap.data() as any)
              });
            }
          });
        } catch (errGlobal) {
          console.warn("Avís consultant entrevistes_personals:", errGlobal);
        }

        // 2. Cercar a la subcol·lecció 'usuaris/{userId}/sessions_entrevista'
        try {
          const snapSub = await getDocs(collection(db, `usuaris/${alumneId}/sessions_entrevista`));
          snapSub.forEach(docSnap => {
            if (!idsVistos.has(docSnap.id)) {
              idsVistos.add(docSnap.id);
              entrevistesTrobades.push({
                id: docSnap.id,
                ...(docSnap.data() as any)
              });
            }
          });
        } catch (errSub) {
          console.warn("Avís consultant subcol·lecció de sessions:", errSub);
        }

        // Ordenem les sessions de més recent a més antiga
        entrevistesTrobades.sort((a, b) => {
          const dataA = a.creatEl || a.data || '';
          const dataB = b.creatEl || b.data || '';
          return dataB.localeCompare(dataA);
        });

        setSessions(entrevistesTrobades);
      }
    } catch (err: any) {
      console.error("Error carregant l'historial d'entrevistes:", err);
      setErrorCàrrega("No s'ha pogut carregar l'historial d'entrevistes de l'alumne.");
    } finally {
      setCarregant(false);
    }
  };

  useEffect(() => {
    carregarHistorial();
  }, [alumneId]);

  // =========================================================================
  // 2. COPIAR TEXT DE L'ENTREVISTA AL PORTAPAPERS
  // =========================================================================
  const handleCopiarText = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiat(true);
    setTimeout(() => setCopiat(false), 2500);
  };

  // =========================================================================
  // 3. ELIMINAR UNA ENTREVISTA EN CAS QUE SIGUI DE PROVA
  // =========================================================================
  const handleEliminarSessio = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmar = window.confirm("Estàs segur que vols eliminar aquest registre d'entrevista de l'historial?");
    if (!confirmar) return;

    setEliminantId(id);
    try {
      if (db) {
        // Esborrem de la col·lecció global
        try {
          await deleteDoc(doc(db, 'entrevistes_personals', id));
        } catch (_) {}

        // Esborrem de la subcol·lecció si hi era
        if (alumneId) {
          try {
            await deleteDoc(doc(db, `usuaris/${alumneId}/sessions_entrevista`, id));
          } catch (_) {}
        }
      }

      setSessions(prev => prev.filter(s => s.id !== id));
      if (sessioSeleccionada?.id === id) {
        setSessioSeleccionada(null);
      }
    } catch (err) {
      console.error("Error eliminant la sessió d'entrevista:", err);
      alert("S'ha produït un error en eliminar la sessió.");
    } finally {
      setEliminantId(null);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-6 transition-colors duration-200 ${
      darkMode ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* CAPÇALERA SUPERIOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (sessioSeleccionada) {
                // Si estem veient el detall d'una entrevista, tornem a la llista de sessions
                setSessioSeleccionada(null);
              } else {
                // Si estem a la llista, tornem al menú principal de l'entrevista
                onTornar();
              }
            }}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Tornar enrere"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white flex items-center gap-1">
                <Clock className="w-3 h-3" />
                4- Veure Historial d'Entrevistes
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {sessions.length} {sessions.length === 1 ? 'sessió enregistrada' : 'sessions enregistrades'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1">
              Historial d'Entrevistes de {nomAlumne}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Recupera i consulta tot el contingut, preguntes i anotacions de les sessions finalitzades.
            </p>
          </div>
        </div>

        {/* BOTÓ DE REFRESCA */}
        <div className="flex items-center gap-2">
          <button
            onClick={carregarHistorial}
            disabled={carregant}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${carregant ? 'animate-spin text-purple-500' : ''}`} />
            <span>Actualitzar</span>
          </button>
        </div>
      </div>

      {/* ERROR DE CÀRREGA */}
      {errorCàrrega && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorCàrrega}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: DETALL D'UNA ENTREVISTA RECUPERADA */}
      {/* ========================================================================= */}
      {sessioSeleccionada ? (
        <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col gap-6 shadow-sm animate-in fade-in zoom-in-95 duration-150 ${
          darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          {/* BARRA SUPERIOR DE LA SESSIÓ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Sessió d'entrevista
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Finalitzada
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {sessioSeleccionada.data || 'Data desconeguda'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopiarText(sessioSeleccionada.notes)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                  copiat
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : darkMode
                      ? 'bg-slate-700 hover:bg-slate-650 border-slate-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                }`}
              >
                {copiat ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiat ? 'Copiat!' : 'Copiar text'}</span>
              </button>

              <button
                onClick={() => setSessioSeleccionada(null)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                Tornar a l'historial
              </button>
            </div>
          </div>

          {/* METADADES: DOCENT I EINES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
              darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <User className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Docent responsable</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {sessioSeleccionada.professorNom || 'Professor/a d\'OposiCAT'}
                </span>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
              darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Data del registre</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {sessioSeleccionada.data || 'Registrada'}
                </span>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
              darkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Eina utilitzada</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {sessioSeleccionada.einaSeleccionada || 'Notes lliures'}
                </span>
              </div>
            </div>
          </div>

          {/* CONTINGUT COMPLET DE L'ENTREVISTA */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>Contingut, preguntes i anotacions registrades:</span>
            </label>
            <div className={`p-5 rounded-2xl border font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed select-text ${
              darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              {sessioSeleccionada.notes || (
                <span className="italic text-slate-400 font-sans">Aquesta sessió es va desar sense anotacions de text.</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VISTA 2: SEGUIT DE BOTONS VERTICALS AMB LES ENTREVISTES GUARDADES */
        /* ========================================================================= */
        <div className="flex flex-col gap-3">
          {carregant ? (
            <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
              <span>Carregant l'historial de sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            /* ESTAT BUIT: NO HI HA ENTREVISTES ANTERIORS */
            <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center gap-3 ${
              darkMode ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <div className="w-14 h-14 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  No hi ha cap entrevista enregistrada per a {nomAlumne}
                </h3>
                <p className="text-xs mt-1 max-w-md">
                  Quan finalitzis una entrevista en directe des de l'apartat <strong>«2- Començar Entrevista»</strong> i cliquis a <strong>«Acabar entrevista»</strong>, apareixerà automàticament aquí per poder-la consultar quan vulguis.
                </p>
              </div>
              <button
                onClick={onTornar}
                className="mt-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-sm"
              >
                Tornar al menú
              </button>
            </div>
          ) : (
            /* LLISTAT DE BOTONS VERTICALS D'ENTREVISTES */
            <div className="flex flex-col gap-3">
              {sessions.map((sessio, index) => {
                const numeroSessio = sessions.length - index;
                const primerFragment = sessio.notes?.trim()?.slice(0, 140) || 'Sense anotacions...';

                return (
                  <div
                    key={sessio.id || index}
                    onClick={() => setSessioSeleccionada(sessio)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSessioSeleccionada(sessio);
                      }
                    }}
                    className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group shadow-sm cursor-pointer active:scale-[0.99] select-none ${
                      darkMode 
                        ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 hover:border-purple-500' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1 pr-4">
                      {/* NÚMERO DE SESSIÓ */}
                      <div className="w-11 h-11 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex flex-col items-center justify-center font-black shrink-0">
                        <span className="text-[10px] leading-none uppercase">Sessió</span>
                        <span className="text-sm leading-none mt-0.5">#{numeroSessio}</span>
                      </div>

                      {/* INFORMACIÓ DE L'ENTREVISTA */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {sessio.data || 'Data desconeguda'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Finalitzada
                          </span>
                          {sessio.professorNom && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              • Docent: {sessio.professorNom}
                            </span>
                          )}
                        </div>

                        {/* FRAGMENT PRELIMINAR DE LES NOTES */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {primerFragment}
                        </p>
                      </div>
                    </div>

                    {/* BOTONS D'ACCIÓ AL COSTAT DRET */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="p-2 rounded-xl border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 text-slate-400 group-hover:text-purple-500 transition-all">
                        <Eye className="w-5 h-5" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleEliminarSessio(sessio.id, e)}
                        disabled={eliminantId === sessio.id}
                        className="p-2 rounded-xl text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                        title="Eliminar de l'historial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
