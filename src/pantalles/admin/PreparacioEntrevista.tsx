// Explicació per a no-programadors:
// Aquest fitxer és el component encarregat de l'apartat:
// "Psicotècnica" -> "Entrevistes personals" -> "1- Entrevista" -> "3- Preparar Entrevistes".
// Permet al professorat:
// 1. Veure i gestionar la preparació prèvia de l'entrevista per a l'alumne seleccionat.
// 2. Importar un perfil o paquet de preguntes d'una classe sencera (ex: "Classe Biodata 1") amb el seu ordre predeterminat (1, 2, 3...) o preguntes soltes.
// 3. Afegir preguntes a mida o notes pedagògiques prèvies específiques per a aquest aspirant.
// 4. Desar la preparació a la Base de Dades (Firestore) perquè quedi llesta quan es faci l'entrevista en directe.

import React, { useState, useEffect } from 'react';
import { 
  Sliders, User, Calendar, BookOpen, Layers, Plus, Trash2, Edit3, 
  Save, Check, Sparkles, ArrowLeft, ArrowUp, ArrowDown, HelpCircle, 
  AlertCircle, CheckCircle2, Play, Copy, RefreshCw, X, FileText, ChevronRight
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import GestioPresetsGenerics, { PreguntaBanc } from './GestioPresetsGenerics';

// Interfície per a una pregunta dins de la preparació de l'alumne
export interface PreguntaPreparada {
  id: string;
  ordre: number;
  pregunta: string;
  esBusca: string;
  resposta: string;
  etiquetes?: string[];
}

interface PreparacioEntrevistaProps {
  darkMode: boolean;
  alumne: any;
  onTornar: () => void;
  onComencarAmbGuio?: (textGuio: string) => void;
}

export default function PreparacioEntrevista({
  darkMode,
  alumne,
  onTornar,
  onComencarAmbGuio
}: PreparacioEntrevistaProps) {
  
  const nomAlumne = alumne?.nom || alumne?.displayName || alumne?.email || 'Alumne seleccionat';
  const usuariActual = auth?.currentUser;
  const nomProfessor = usuariActual?.displayName || usuariActual?.email || 'Professor/a d\'OposiCAT';

  // =========================================================================
  // ESTATS PRINCIPALS DE LA PREPARACIÓ
  // =========================================================================
  const [preguntes, setPreguntes] = useState<PreguntaPreparada[]>([]);
  const [objectiusSessio, setObjectiusSessio] = useState<string>('');
  const [carregant, setCarregant] = useState<boolean>(true);
  const [desant, setDesant] = useState<boolean>(false);
  const [missatgeExit, setMissatgeExit] = useState<string | null>(null);
  const [missatgeError, setMissatgeError] = useState<string | null>(null);
  const [ultimaModificacio, setUltimaModificacio] = useState<string | null>(null);

  // Modal per seleccionar presets genèrics
  const [modalBancPresetsObert, setModalBancPresetsObert] = useState<boolean>(false);

  // Formulari ràpid per afegir/editar una pregunta a mida
  const [modalNovaPreguntaObert, setModalNovaPreguntaObert] = useState<boolean>(false);
  const [preguntaEnEdicio, setPreguntaEnEdicio] = useState<PreguntaPreparada | null>(null);
  const [formEnunciat, setFormEnunciat] = useState<string>('');
  const [formEsBusca, setFormEsBusca] = useState<string>('');
  const [formResposta, setFormResposta] = useState<string>('');

  // =========================================================================
  // 1. CARREGAR LA PREPARACIÓ EXISTENT DES DE FIRESTORE
  // =========================================================================
  // Comentari per a no-programadors:
  // Quan s'obre aquesta pantalla per a un alumne, mirem si ja teníem una preparació
  // guardada prèviament a la base de dades per recuperar-la automàticament.
  useEffect(() => {
    const carregarPreparacio = async () => {
      if (!alumne?.id && !alumne?.uid) {
        setCarregant(false);
        return;
      }

      const alumneId = alumne.id || alumne.uid;
      setCarregant(true);

      try {
        if (db) {
          const docRef = doc(db, 'preparacions_entrevistes', alumneId);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            if (data.preguntes && Array.isArray(data.preguntes)) {
              setPreguntes(data.preguntes);
            }
            if (data.objectiusSessio) {
              setObjectiusSessio(data.objectiusSessio);
            }
            if (data.actualitzatEl || data.data) {
              setUltimaModificacio(data.actualitzatEl || data.data);
            }
          }
        }
      } catch (err) {
        console.warn("Avís en carregar la preparació de l'entrevista:", err);
      } finally {
        setCarregant(false);
      }
    };

    carregarPreparacio();
  }, [alumne]);

  // =========================================================================
  // 2. IMPORTAR PREGUNTES DEL BANC DE PRESETS GENÈRICS
  // =========================================================================
  // Comentari per a no-programadors:
  // Quan el professor fa "Carregar a l'entrevista" des del banc de presets,
  // processem el text o les preguntes i les afegim ordenadament a la llista.
  const handleImportarDesDePreset = (textPreset: string) => {
    if (!textPreset.trim()) return;

    // Convertim el text estructurat en blocs de preguntes
    const blocs = textPreset.split(/🔵\s*Pregunta\s*(?:#?\d+)?\s*:/i).filter(b => b.trim().length > 0);
    
    const novesPreguntes: PreguntaPreparada[] = blocs.map((bloc, index) => {
      const partsEsBusca = bloc.split(/🟠\s*Es busca\s*:/i);
      const enunciat = partsEsBusca[0]?.trim() || '';
      
      let esBusca = '';
      let resposta = '';

      if (partsEsBusca.length > 1) {
        const partsResposta = partsEsBusca[1].split(/🟢\s*Resposta(?: alumne)?\s*:/i);
        esBusca = partsResposta[0]?.trim() || '';
        resposta = partsResposta[1]?.trim() || '';
      }

      const numOrdre = preguntes.length + index + 1;

      return {
        id: `prep_${Date.now()}_${index}`,
        ordre: numOrdre,
        pregunta: enunciat,
        esBusca: esBusca,
        resposta: resposta
      };
    });

    setPreguntes(prev => [...prev, ...novesPreguntes]);
    setModalBancPresetsObert(false);
    setMissatgeExit(`S'han importat ${novesPreguntes.length} preguntes a la preparació de l'alumne.`);
    setTimeout(() => setMissatgeExit(null), 3000);
  };

  // =========================================================================
  // 3. GESTIÓ D'EDICIÓ / CREACIÓ DE PREGUNTES A MIDA
  // =========================================================================
  const obrirCrearPreguntaAMida = () => {
    setPreguntaEnEdicio(null);
    setFormEnunciat('');
    setFormEsBusca('');
    setFormResposta('');
    setModalNovaPreguntaObert(true);
  };

  const obrirEditarPregunta = (p: PreguntaPreparada) => {
    setPreguntaEnEdicio(p);
    setFormEnunciat(p.pregunta);
    setFormEsBusca(p.esBusca);
    setFormResposta(p.resposta);
    setModalNovaPreguntaObert(true);
  };

  const guardarPreguntaAMida = () => {
    if (!formEnunciat.trim() || !formEsBusca.trim()) {
      alert("Cal omplir obligatòriament la Pregunta i el camp 'Es busca'.");
      return;
    }

    if (preguntaEnEdicio) {
      // Editar existent
      setPreguntes(prev => prev.map(item => 
        item.id === preguntaEnEdicio.id 
          ? { ...item, pregunta: formEnunciat.trim(), esBusca: formEsBusca.trim(), resposta: formResposta.trim() }
          : item
      ));
    } else {
      // Crear nova
      const nova: PreguntaPreparada = {
        id: `prep_custom_${Date.now()}`,
        ordre: preguntes.length + 1,
        pregunta: formEnunciat.trim(),
        esBusca: formEsBusca.trim(),
        resposta: formResposta.trim()
      };
      setPreguntes(prev => [...prev, nova]);
    }

    setModalNovaPreguntaObert(false);
  };

  const eliminarPregunta = (id: string) => {
    setPreguntes(prev => {
      const filtrades = prev.filter(p => p.id !== id);
      // Reordenem consecutivament 1, 2, 3...
      return filtrades.map((p, idx) => ({ ...p, ordre: idx + 1 }));
    });
  };

  const mourePregunta = (index: number, direccio: 'amunt' | 'avall') => {
    if (direccio === 'amunt' && index === 0) return;
    if (direccio === 'avall' && index === preguntes.length - 1) return;

    const nouIndex = direccio === 'amunt' ? index - 1 : index + 1;
    const llistaCopia = [...preguntes];
    const [elementMogut] = llistaCopia.splice(index, 1);
    llistaCopia.splice(nouIndex, 0, elementMogut);

    // Reassignem l'ordre consecutiu
    const llistaReordenada = llistaCopia.map((p, idx) => ({ ...p, ordre: idx + 1 }));
    setPreguntes(llistaReordenada);
  };

  // =========================================================================
  // 4. GENERAR TEXT ESTRUCTURAT I DESAR A FIRESTORE
  // =========================================================================
  const generarTextComplet = (): string => {
    let textFinal = '';

    if (objectiusSessio.trim()) {
      textFinal += `📌 OBJECTIUS DE LA SESSIÓ:\n${objectiusSessio.trim()}\n\n---\n\n`;
    }

    const preguntesText = preguntes.map((p, idx) => {
      const num = p.ordre || idx + 1;
      let bloc = `🔵 Pregunta ${num}: ${p.pregunta}\n`;
      if (p.esBusca.trim()) {
        bloc += `🟠 Es busca: ${p.esBusca}\n`;
      }
      bloc += `🟢 Resposta alumne: ${p.resposta || ''}`;
      return bloc;
    }).join('\n\n');

    textFinal += preguntesText;
    return textFinal;
  };

  const handleGuardarPreparacio = async (comencarSessio: boolean = false) => {
    if (!alumne?.id && !alumne?.uid) {
      alert("No hi ha cap alumne seleccionat per desar la preparació.");
      return;
    }

    const alumneId = alumne.id || alumne.uid;
    setDesant(true);
    setMissatgeError(null);

    const araStr = new Date().toLocaleString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const dadesPreparacio = {
      alumneId: alumneId,
      alumneNom: nomAlumne,
      alumneEmail: alumne?.email || '',
      professorId: usuariActual?.uid || 'admin',
      professorNom: nomProfessor,
      objectiusSessio: objectiusSessio.trim(),
      preguntes: preguntes,
      textGuioComplet: generarTextComplet(),
      numPreguntes: preguntes.length,
      actualitzatEl: araStr,
      timestamp: serverTimestamp()
    };

    try {
      if (db) {
        // 1. Guardem a la col·lecció dedicada 'preparacions_entrevistes'
        await setDoc(doc(db, 'preparacions_entrevistes', alumneId), dadesPreparacio, { merge: true });

        // 2. Opcionalment intentem reflectir-ho a la fitxa d'usuari (si existeix i tenim permisos)
        try {
          await setDoc(doc(db, 'usuaris', alumneId), {
            entrevistaPreparada: dadesPreparacio
          }, { merge: true });
        } catch (subErr) {
          console.warn("Avís no crític actualitzant la fitxa d'usuari:", subErr);
        }
      }

      setUltimaModificacio(araStr);
      setMissatgeExit("Preparació de l'entrevista desada correctament a la base de dades!");
      setTimeout(() => setMissatgeExit(null), 3000);

      if (comencarSessio && onComencarAmbGuio) {
        onComencarAmbGuio(generarTextComplet());
      }
    } catch (err: any) {
      console.error("Error desant la preparació a Firestore:", err);
      setMissatgeError("S'ha produït un error en desar la preparació. Si us plau, torna-ho a provar.");
    } finally {
      setDesant(false);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-6 transition-colors duration-200 ${
      darkMode ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* CAPÇALERA SUPERIOR AMB ACCIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onTornar}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Tornar al menú d'opcions de l'entrevista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                3- Preparar Entrevistes
              </span>
              {ultimaModificacio && (
                <span className="text-[10px] text-slate-400 font-medium">
                  Última edició: {ultimaModificacio}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1">
              Guió i Preparació per a {nomAlumne}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configura les preguntes, pautes docents i objectius que es carregaran a la sessió en directe.
            </p>
          </div>
        </div>

        {/* BOTONS D'ACCIÓ RÀPIDA */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => handleGuardarPreparacio(false)}
            disabled={desant}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer active:scale-95 shadow-sm ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-white' 
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            {desant ? <RefreshCw className="w-4 h-4 animate-spin text-purple-500" /> : <Save className="w-4 h-4 text-purple-500" />}
            <span>Desar preparació</span>
          </button>

          {onComencarAmbGuio && (
            <button
              onClick={() => handleGuardarPreparacio(true)}
              disabled={desant || preguntes.length === 0}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition-all cursor-pointer active:scale-95 shadow-md shadow-purple-600/20 hover:from-purple-500 hover:to-indigo-500 ${
                preguntes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Començar entrevista</span>
            </button>
          )}
        </div>
      </div>

      {/* NOTIFICACIONS D'ÈXIT O ERROR */}
      {missatgeExit && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{missatgeExit}</span>
        </div>
      )}

      {missatgeError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{missatgeError}</span>
        </div>
      )}

      {/* BLOC D'OBJECTIUS DOCENTS PER A LA SESSIÓ */}
      <div className={`p-5 rounded-2xl border flex flex-col gap-2.5 ${
        darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Objectius pedagògics per a aquesta sessió (Opcional):</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium normal-case">
            Punts febles a incidir, perfil competencial, etc.
          </span>
        </label>
        <textarea
          value={objectiusSessio}
          onChange={(e) => setObjectiusSessio(e.target.value)}
          placeholder="Exemple: Incidir en l'autocontrol davant de preguntes de pressió. Treballar coherència amb les respostes 12 i 45 del seu Biodata..."
          rows={2}
          className={`w-full p-3.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
            darkMode ? 'bg-slate-900/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
          }`}
        />
      </div>

      {/* BARRA D'EINES PER AFEGIR PREGUNTES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black uppercase tracking-tight">
            Preguntes preparades ({preguntes.length})
          </span>
          <span className="text-[11px] text-slate-400">
            (Es presentaran en aquest ordre a la classe)
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* BOTÓ IMPORTAR PRESETS GENÈRICS */}
          <button
            onClick={() => setModalBancPresetsObert(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Banc de Presets / Classes</span>
          </button>

          {/* BOTÓ AFEGIR PREGUNTA A MIDA */}
          <button
            onClick={obrirCrearPreguntaAMida}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-purple-300' 
                : 'bg-purple-50 hover:bg-purple-100/70 border-purple-200 text-purple-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Pregunta a mida</span>
          </button>
        </div>
      </div>

      {/* LLISTAT DE PREGUNTES PREPARADES */}
      {carregant ? (
        <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
          <span>Carregant preparació de l'alumne...</span>
        </div>
      ) : preguntes.length === 0 ? (
        <div className={`p-8 rounded-3xl border text-center flex flex-col items-center justify-center gap-3 ${
          darkMode ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Encara no hi ha cap pregunta preparada per a aquesta entrevista
            </h3>
            <p className="text-xs mt-1 max-w-md">
              Fes clic a <strong>«Banc de Presets / Classes»</strong> per carregar una classe sencera (ex: Classe Biodata 1) o afegeix preguntes personalitzades a mida.
            </p>
          </div>
          <button
            onClick={() => setModalBancPresetsObert(true)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-sm"
          >
            Explorar Banc de Presets
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {preguntes.map((p, index) => (
            <div
              key={p.id || index}
              className={`p-5 rounded-2xl border transition-all flex flex-col gap-3.5 ${
                darkMode ? 'bg-slate-800/90 border-slate-700/80 hover:border-purple-500/50' : 'bg-white border-slate-200 hover:border-purple-300'
              }`}
            >
              {/* CAPÇALERA DE LA PREGUNTA */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    #{p.ordre || index + 1}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-tight mb-1">
                      🔵 Pregunta {p.ordre || index + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                      {p.pregunta}
                    </h4>
                  </div>
                </div>

                {/* ACCIONS: REORDENAR, EDITAR, ELIMINAR */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => mourePregunta(index, 'amunt')}
                    disabled={index === 0}
                    className={`p-1.5 rounded-lg border text-slate-400 hover:text-slate-700 dark:hover:text-white ${
                      index === 0 ? 'opacity-30 cursor-not-allowed border-transparent' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                    }`}
                    title="Moure amunt"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => mourePregunta(index, 'avall')}
                    disabled={index === preguntes.length - 1}
                    className={`p-1.5 rounded-lg border text-slate-400 hover:text-slate-700 dark:hover:text-white ${
                      index === preguntes.length - 1 ? 'opacity-30 cursor-not-allowed border-transparent' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                    }`}
                    title="Moure avall"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => obrirEditarPregunta(p)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                    title="Editar pregunta"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => eliminarPregunta(p.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    title="Eliminar de la preparació"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* DETALL: ES BUSCA I RESPOSTA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                    <span>🟠 Es busca (Pauta docent):</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {p.esBusca || <span className="italic text-slate-400">Sense pauta</span>}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                    <span>🟢 Resposta alumne:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {p.resposta || <span className="italic text-slate-400 font-normal">Es deixarà en blanc per a la resposta en viu</span>}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BANC DE PRESETS GENÈRICS (PER IMPORTAR PREGUNTES AQUEST ALUMNE) */}
      {/* ========================================================================= */}
      {modalBancPresetsObert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className={`w-full max-w-5xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Importar des del Banc de Presets i Classes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Filtra per classe (ex: Classe Biodata 1), fes «Seleccionar-ho tot» o tria preguntes soltes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalBancPresetsObert(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <GestioPresetsGenerics
                darkMode={darkMode}
                onTornar={() => setModalBancPresetsObert(false)}
                onSeleccionarPerAEntrevista={handleImportarDesDePreset}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR PREGUNTA A MIDA */}
      {/* ========================================================================= */}
      {modalNovaPreguntaObert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">
                  {preguntaEnEdicio ? 'Editar pregunta a mida' : 'Nova pregunta a mida'}
                </h3>
              </div>
              <button
                onClick={() => setModalNovaPreguntaObert(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* ENUNCIAT */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <span>1. Enunciat de la pregunta:</span>
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <textarea
                  value={formEnunciat}
                  onChange={(e) => setFormEnunciat(e.target.value)}
                  placeholder="Escriu la pregunta que formularàs a l'aspirant..."
                  rows={2}
                  className={`w-full p-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* ES BUSCA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <span>2. Què es busca / Criteris docents:</span>
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                <textarea
                  value={formEsBusca}
                  onChange={(e) => setFormEsBusca(e.target.value)}
                  placeholder="Quina competència o reacció avaluem en aquesta pregunta?"
                  rows={2}
                  className={`w-full p-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* RESPOSTA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <span>3. Resposta / Pauta model (Opcional):</span>
                </label>
                <textarea
                  value={formResposta}
                  onChange={(e) => setFormResposta(e.target.value)}
                  placeholder="Es pot deixar en blanc per defecte per anotar la resposta durant l'entrevista..."
                  rows={2}
                  className={`w-full p-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setModalNovaPreguntaObert(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel·lar
              </button>
              <button
                onClick={guardarPreguntaAMida}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-sm"
              >
                Guardar pregunta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
