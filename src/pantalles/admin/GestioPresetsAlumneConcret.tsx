// Explicació per a no-programadors:
// Aquest fitxer és el component "Lego" encarregat de la gestió de:
// "2. Eina de gestió - Professorat" -> "2- Presets - Alumne concret".
// Permet als professors:
// 1. Triar un alumne concret per gestionar el seu banc de preguntes personalitzat.
// 2. Crear, editar i eliminar preguntes a mida per treballar els seus punts febles o aspectes del Biodata.
// 3. Assignar etiquetes específiques de l'alumne (ex: "Punts Febles", "Revisió Biodata", "Autocontrol", etc.).
// 4. Cada pregunta conté:
//    - Pregunta: L'enunciat formulat a l'aspirant.
//    - Es busca: Què avalua o busca observar el docent.
//    - Resposta: Pautes, resposta model o criteris d'avaluació.
//    - Ordre numèric (1, 2, 3...).
//    - Etiquetes associades.
// 5. Filtrar, seleccionar i exportar preguntes per preparar la seva entrevista personalitzada.

import React, { useState, useEffect } from 'react';
import { 
  User, Plus, Search, Tag, Edit3, Trash2, Check, X, 
  Sparkles, Layers, ArrowLeft, Copy, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, Filter, Eye, RefreshCw, FileText,
  UserCheck, Sliders, Lock
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  serverTimestamp, query, where, orderBy 
} from 'firebase/firestore';
import { TOTES_LES_ETIQUETES_OFICIALS } from './GestioPresetsGenerics';

export interface PreguntaAlumneConcret {
  id?: string;
  alumneId: string;
  alumneNom: string;
  alumneEmail?: string;
  pregunta: string;
  esBusca: string;
  resposta: string;
  etiquetes: string[];
  ordre?: number;
  actiu?: boolean;
  creatEl?: string;
  actualitzatEl?: string;
}

interface GestioPresetsAlumneConcretProps {
  darkMode: boolean;
  alumneInicial?: any;
  onTornar?: () => void;
  onSeleccionarPerAEntrevista?: (textInjectat: string) => void;
}

// Etiquetes ràpides recomanades específicament per a alumnes concrets
export const ETIQUETES_ALUMNE_SUGGERIDES: string[] = [
  "Punts febles a reforçar",
  "Contradiccions Biodata",
  "Casos pràctics personalitzats",
  "Treball d'Autocontrol (AGE)",
  "Treball de Comunicació (HSC)",
  "Trajectòria professional prèvia",
  "Valors i maduresa policial",
  "Simulacre intensiu",
  "Revisió segona volta"
];

export default function GestioPresetsAlumneConcret({ 
  darkMode, 
  alumneInicial,
  onTornar,
  onSeleccionarPerAEntrevista
}: GestioPresetsAlumneConcretProps) {
  
  // =========================================================================
  // 1. ESTATS DE L'ALUMNE SELECCIONAT I LLISTA D'ALUMNES
  // =========================================================================
  const [alumneActiu, setAlumneActiu] = useState<any | null>(alumneInicial || null);
  const [llistaAlumnes, setLlistaAlumnes] = useState<any[]>([]);
  const [carregantAlumnes, setCarregantAlumnes] = useState<boolean>(false);
  const [desplegableAlumnesObert, setDesplegableAlumnesObert] = useState<boolean>(false);
  const [cercaAlumneText, setCercaAlumneText] = useState<string>('');

  // =========================================================================
  // 2. ESTATS DEL BANC DE PREGUNTES DE L'ALUMNE
  // =========================================================================
  const [preguntes, setPreguntes] = useState<PreguntaAlumneConcret[]>([]);
  const [carregant, setCarregant] = useState<boolean>(false);
  const [cercaText, setCercaText] = useState<string>('');
  const [etiquetesSeleccionades, setEtiquetesSeleccionades] = useState<string[]>([]);
  
  // Formulari de creació / edició
  const [modeFormulari, setModeFormulari] = useState<'crear' | 'editar' | null>(null);
  const [preguntaEnEdicioId, setPreguntaEnEdicioId] = useState<string | null>(null);
  
  const [formPregunta, setFormPregunta] = useState<string>('');
  const [formEsBusca, setFormEsBusca] = useState<string>('');
  const [formResposta, setFormResposta] = useState<string>('');
  const [formOrdre, setFormOrdre] = useState<string>('');
  const [formEtiquetes, setFormEtiquetes] = useState<string[]>([]);
  const [novaEtiquetaInput, setNovaEtiquetaInput] = useState<string>('');
  
  const [desant, setDesant] = useState<boolean>(false);
  const [missatgeInfo, setMissatgeInfo] = useState<string | null>(null);

  // Preguntes seleccionades per al paquet de classe personalitzada
  const [idsSeleccionades, setIdsSeleccionades] = useState<string[]>([]);
  const [modalVistaPreviaObert, setModalVistaPreviaObert] = useState<boolean>(false);
  const [copiatAmbExit, setCopiatAmbExit] = useState<boolean>(false);

  // Desplegables de targetes
  const [targetesDesplegades, setTargetesDesplegades] = useState<{ [key: string]: boolean }>({});

  const alternarDesplegable = (id: string) => {
    setTargetesDesplegades(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // =========================================================================
  // 3. CARREGAR LLISTA D'ALUMNES DE FIRESTORE
  // =========================================================================
  useEffect(() => {
    const carregarUsuaris = async () => {
      if (!db) return;
      setCarregantAlumnes(true);
      try {
        const snap = await getDocs(collection(db, 'usuaris'));
        if (!snap.empty) {
          const usuaris = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setLlistaAlumnes(usuaris);
          // Si no hi ha alumne inicial, triem el primer per defecte
          if (!alumneActiu && usuaris.length > 0) {
            setAlumneActiu(usuaris[0]);
          }
        }
      } catch (err) {
        console.error("Error carregant alumnes:", err);
      } finally {
        setCarregantAlumnes(false);
      }
    };
    carregarUsuaris();
  }, []);

  // =========================================================================
  // 4. CARREGAR PREGUNTES DE L'ALUMNE SELECCIONAT
  // =========================================================================
  const alumneId = alumneActiu?.id || alumneActiu?.uid || '';
  const nomAlumne = alumneActiu?.nom || alumneActiu?.displayName || alumneActiu?.email || 'Alumne seleccionat';

  const carregarPreguntesAlumne = async () => {
    if (!alumneId) {
      setPreguntes([]);
      setCarregant(false);
      return;
    }

    setCarregant(true);
    try {
      if (db) {
        // Cercar a la col·lecció 'presets_preguntes_alumnes' filtrant per alumneId
        const q = query(
          collection(db, 'presets_preguntes_alumnes'),
          where('alumneId', '==', alumneId)
        );
        const snap = await getDocs(q);
        const llista: PreguntaAlumneConcret[] = [];
        snap.forEach(docSnap => {
          llista.push({ id: docSnap.id, ...docSnap.data() } as PreguntaAlumneConcret);
        });

        // Ordenem per ordre ascendent (1, 2, 3...) i secundàriament per data
        llista.sort((a, b) => {
          const numA = a.ordre !== undefined && a.ordre !== null && !isNaN(a.ordre) ? Number(a.ordre) : 9999;
          const numB = b.ordre !== undefined && b.ordre !== null && !isNaN(b.ordre) ? Number(b.ordre) : 9999;
          if (numA !== numB) return numA - numB;
          const dataA = a.creatEl || '';
          const dataB = b.creatEl || '';
          return dataB.localeCompare(dataA);
        });

        setPreguntes(llista);
      }
    } catch (err) {
      console.error("Error carregant presets de l'alumne:", err);
    } finally {
      setCarregant(false);
    }
  };

  useEffect(() => {
    carregarPreguntesAlumne();
  }, [alumneId]);

  // =========================================================================
  // 5. GESTIÓ D'ETIQUETES AL FORMULARI
  // =========================================================================
  const afegirEtiquetaAlForm = (etiqueta: string) => {
    const neta = etiqueta.trim();
    if (!neta) return;
    if (!formEtiquetes.includes(neta)) {
      setFormEtiquetes([...formEtiquetes, neta]);
    }
    setNovaEtiquetaInput('');
  };

  const eliminarEtiquetaDelForm = (etiqueta: string) => {
    setFormEtiquetes(formEtiquetes.filter(e => e !== etiqueta));
  };

  // Alternar selecció d'etiquetes de filtre
  const alternarFiltreEtiqueta = (etiqueta: string) => {
    if (etiquetesSeleccionades.includes(etiqueta)) {
      setEtiquetesSeleccionades(etiquetesSeleccionades.filter(e => e !== etiqueta));
    } else {
      setEtiquetesSeleccionades([...etiquetesSeleccionades, etiqueta]);
    }
  };

  // =========================================================================
  // 6. CREAR O EDITAR PREGUNTA DE L'ALUMNE
  // =========================================================================
  const obrirFormulariCreacio = () => {
    setPreguntaEnEdicioId(null);
    setFormPregunta('');
    setFormEsBusca('');
    setFormResposta('');
    // Proper número d'ordre automàtic
    const seguentOrdre = preguntes.length > 0 
      ? Math.max(...preguntes.map(p => p.ordre || 0)) + 1 
      : 1;
    setFormOrdre(String(seguentOrdre));
    setFormEtiquetes([`Alumne: ${nomAlumne}`, 'Punts febles a reforçar']);
    setModeFormulari('crear');
  };

  const obrirFormulariEdicio = (p: PreguntaAlumneConcret) => {
    setPreguntaEnEdicioId(p.id || null);
    setFormPregunta(p.pregunta || '');
    setFormEsBusca(p.esBusca || '');
    setFormResposta(p.resposta || '');
    setFormOrdre(p.ordre !== undefined && p.ordre !== null ? String(p.ordre) : '1');
    setFormEtiquetes(p.etiquetes || []);
    setModeFormulari('editar');
  };

  const desarPregunta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPregunta.trim() || !alumneId) return;

    setDesant(true);
    try {
      const ordreNum = parseInt(formOrdre, 10);
      const ordreFinal = isNaN(ordreNum) ? 1 : ordreNum;

      const dades: Partial<PreguntaAlumneConcret> = {
        alumneId: alumneId,
        alumneNom: nomAlumne,
        alumneEmail: alumneActiu?.email || '',
        pregunta: formPregunta.trim(),
        esBusca: formEsBusca.trim(),
        resposta: formResposta.trim(),
        ordre: ordreFinal,
        etiquetes: formEtiquetes.length > 0 ? formEtiquetes : [`Alumne: ${nomAlumne}`],
        actiu: true,
        actualitzatEl: new Date().toISOString()
      };

      if (modeFormulari === 'crear') {
        dades.creatEl = new Date().toISOString();
        if (db) {
          const docRef = await addDoc(collection(db, 'presets_preguntes_alumnes'), dades);
          setPreguntes(prev => [...prev, { id: docRef.id, ...dades } as PreguntaAlumneConcret]);
        }
        setMissatgeInfo("Pregunta personalitzada per a l'alumne afegida correctament.");
      } else if (modeFormulari === 'editar' && preguntaEnEdicioId) {
        if (db) {
          await updateDoc(doc(db, 'presets_preguntes_alumnes', preguntaEnEdicioId), dades);
          setPreguntes(prev => prev.map(item => item.id === preguntaEnEdicioId ? { ...item, ...dades } : item));
        }
        setMissatgeInfo("Pregunta actualitzada correctament.");
      }

      setModeFormulari(null);
      setTimeout(() => setMissatgeInfo(null), 3500);
    } catch (err) {
      console.error("Error desant la pregunta de l'alumne:", err);
      alert("S'ha produït un error en desar la pregunta.");
    } finally {
      setDesant(false);
    }
  };

  // =========================================================================
  // 7. ELIMINAR PREGUNTA
  // =========================================================================
  const eliminarPregunta = async (id: string) => {
    if (!window.confirm("Segur que vols eliminar aquesta pregunta personalitzada d'aquest alumne?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'presets_preguntes_alumnes', id));
      }
      setPreguntes(prev => prev.filter(p => p.id !== id));
      setIdsSeleccionades(prev => prev.filter(selId => selId !== id));
      setMissatgeInfo("Pregunta eliminada del banc de l'alumne.");
      setTimeout(() => setMissatgeInfo(null), 3000);
    } catch (err) {
      console.error("Error eliminant la pregunta:", err);
    }
  };

  // =========================================================================
  // 8. SEMBRAR PREGUNTES DE MOSTRA PERSONALITZADES PER A L'ALUMNE
  // =========================================================================
  const sembrarPreguntesExemple = async () => {
    if (!alumneId) return;
    if (!window.confirm(`Vols carregar 4 preguntes model adaptades per a ${nomAlumne}?`)) return;

    setDesant(true);
    try {
      const exemples: Omit<PreguntaAlumneConcret, 'id'>[] = [
        {
          alumneId,
          alumneNom: nomAlumne,
          alumneEmail: alumneActiu?.email || '',
          pregunta: `Segons el teu Biodata, destaques per ser molt perfeccionista. Explica'ns una situació on aquest perfeccionisme et va jugar en contra.`,
          esBusca: "Autocrítica, detecció de rigidesa mental i capacitat d'acceptar la frustració.",
          resposta: "Ha de reconèixer que en tasques operatives la rapidesa i eficàcia primen per sobre del detallisme excessiu.",
          etiquetes: [`Alumne: ${nomAlumne}`, "Punts febles a reforçar", "Treball d'Autocontrol (AGE)"],
          ordre: 1,
          actiu: true,
          creatEl: new Date().toISOString()
        },
        {
          alumneId,
          alumneNom: nomAlumne,
          alumneEmail: alumneActiu?.email || '',
          pregunta: `Com penses gestionar la pressió d'actuar davant d'una multitud hostil tenint en compte que a l'examen competencial vas puntuar just a autocontrol?`,
          esBusca: "Maduresa davant les línies vermelles del tribunal, seguretat i equilibri emocional.",
          resposta: "Resposta tranquil·la, mantenint el contacte visual, explicant pautes de respiració i aplicació estricta del procediment policial.",
          etiquetes: [`Alumne: ${nomAlumne}`, "Contradiccions Biodata", "Treball d'Autocontrol (AGE)"],
          ordre: 2,
          actiu: true,
          creatEl: new Date().toISOString()
        },
        {
          alumneId,
          alumneNom: nomAlumne,
          alumneEmail: alumneActiu?.email || '',
          pregunta: `Si un company de patrulla et proposa no tramitar una denúncia a un conegut seu, quina és la teva actuació exacta pas a pas?`,
          esBusca: "Integritat, principis deontològics, respecte a la legalitat i capacitat d'assertivitat amb companys.",
          resposta: "Recordar el deure inexcusable de tramitació legal i actuar amb fermesa i educació sense cedir a pressions corporatives.",
          etiquetes: [`Alumne: ${nomAlumne}`, "Casos pràctics personalitzats", "Valors i maduresa policial"],
          ordre: 3,
          actiu: true,
          creatEl: new Date().toISOString()
        },
        {
          alumneId,
          alumneNom: nomAlumne,
          alumneEmail: alumneActiu?.email || '',
          pregunta: `Per què has escollit aquesta convocatòria i no vas entrar en promocions anteriors? Quin canvi vital o maduratiu has fet?`,
          esBusca: "Trajectòria vital, estabilitat, perseverança i arguments sòlids sobre el moment personal.",
          resposta: "Destacar el creixement personal, la preparació física i teòrica i la determinació per assolir la plaça.",
          etiquetes: [`Alumne: ${nomAlumne}`, "Trajectòria professional prèvia", "Simulacre intensiu"],
          ordre: 4,
          actiu: true,
          creatEl: new Date().toISOString()
        }
      ];

      for (const ex of exemples) {
        if (db) {
          await addDoc(collection(db, 'presets_preguntes_alumnes'), ex);
        }
      }

      await carregarPreguntesAlumne();
      setMissatgeInfo("Preguntes personalitzades inicials carregades correctament.");
      setTimeout(() => setMissatgeInfo(null), 3000);
    } catch (err) {
      console.error("Error sembrant preguntes:", err);
    } finally {
      setDesant(false);
    }
  };

  // =========================================================================
  // 9. SELECCIÓ I COMPILACIÓ DE PREGUNTES PER A L'ENTREVISTA
  // =========================================================================
  const alternarSeleccioPregunta = (id: string) => {
    if (idsSeleccionades.includes(id)) {
      setIdsSeleccionades(idsSeleccionades.filter(i => i !== id));
    } else {
      setIdsSeleccionades([...idsSeleccionades, id]);
    }
  };

  const seleccionarTotesFiltrades = () => {
    const ids = preguntesFiltrades.map(p => p.id!).filter(Boolean);
    setIdsSeleccionades(ids);
  };

  const desseleccionarTotes = () => {
    setIdsSeleccionades([]);
  };

  // Compilar el text del guió personalitzat
  const preguntesEscollides = preguntes.filter(p => p.id && idsSeleccionades.includes(p.id));
  
  const compilarGuióText = () => {
    let text = `=== GUIÓ PERSONALITZAT PER A: ${nomAlumne.toUpperCase()} ===\n`;
    text += `Data de preparació: ${new Date().toLocaleDateString('ca-ES')}\n`;
    text += `Total de preguntes assignades: ${preguntesEscollides.length}\n\n`;

    preguntesEscollides.forEach((p, idx) => {
      text += `--------------------------------------------------\n`;
      text += `PREGUNTA ${idx + 1} (Ordre: ${p.ordre || (idx + 1)}):\n`;
      text += `${p.pregunta}\n\n`;
      if (p.esBusca) {
        text += `[QUÈ ES BUSCA / OBJECTIU]:\n${p.esBusca}\n\n`;
      }
      if (p.resposta) {
        text += `[PAUTES I RESPOSTA MODEL]:\n${p.resposta}\n\n`;
      }
      if (p.etiquetes && p.etiquetes.length > 0) {
        text += `[ETIQUETES]: ${p.etiquetes.join(', ')}\n`;
      }
      text += `\n`;
    });

    return text;
  };

  const copiarGuioAlPortapapers = () => {
    const text = compilarGuióText();
    navigator.clipboard.writeText(text);
    setCopiatAmbExit(true);
    setTimeout(() => setCopiatAmbExit(false), 2500);
  };

  const utilitzarPerAEntrevista = () => {
    if (onSeleccionarPerAEntrevista) {
      const text = compilarGuióText();
      onSeleccionarPerAEntrevista(text);
      if (onTornar) onTornar();
    }
  };

  // =========================================================================
  // 10. FILTRATGE DE PREGUNTES
  // =========================================================================
  const preguntesFiltrades = preguntes.filter(p => {
    // Filtre de text lliure
    const text = `${p.pregunta} ${p.esBusca} ${p.resposta} ${p.etiquetes.join(' ')}`.toLowerCase();
    const passaText = cercaText ? text.includes(cercaText.toLowerCase()) : true;

    // Filtre d'etiquetes (ha de contenir totes les seleccionades)
    const passaEtiquetes = etiquetesSeleccionades.length > 0
      ? etiquetesSeleccionades.every(et => p.etiquetes.includes(et))
      : true;

    return passaText && passaEtiquetes;
  });

  // Alumnes filtrats al desplegable de cerca
  const alumnesFiltrats = llistaAlumnes.filter(u => {
    const nom = (u.nom || u.displayName || u.email || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const cerca = cercaAlumneText.toLowerCase();
    return nom.includes(cerca) || email.includes(cerca);
  });

  // Totes les etiquetes úniques existents en aquest alumne
  const etiquetesExistents = Array.from(
    new Set(preguntes.flatMap(p => p.etiquetes || []))
  );

  return (
    <div className={`w-full flex flex-col gap-6 transition-colors duration-200 ${
      darkMode ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* ========================================================================= */}
      {/* CAPÇALERA SUPERIOR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {onTornar && (
            <button
              onClick={onTornar}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Tornar enrere"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1">
                <User className="w-3 h-3" />
                2- Presets - Alumne concret
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Banc a mida per aspirant
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1">
              Presets i Preguntes per a {nomAlumne}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Crea pautes, preguntes d'incidència i etiquetes assignades exclusivament a aquest alumne.
            </p>
          </div>
        </div>

        {/* SELECTOR D'ALUMNE RÀPID */}
        <div className="relative flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setDesplegableAlumnesObert(!desplegableAlumnesObert)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-500" />
              <span className="truncate max-w-[150px]">{nomAlumne}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {desplegableAlumnesObert && (
              <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-xl z-50 p-2 ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="p-2 border-b border-slate-200 dark:border-slate-700 mb-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cercar alumne..."
                      value={cercaAlumneText}
                      onChange={(e) => setCercaAlumneText(e.target.value)}
                      className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none border ${
                        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto flex flex-col gap-1">
                  {alumnesFiltrats.map(u => {
                    const uNom = u.nom || u.displayName || u.email || 'Sense nom';
                    const esSeleccionat = (u.id || u.uid) === alumneId;
                    return (
                      <button
                        key={u.id || u.uid}
                        onClick={() => {
                          setAlumneActiu(u);
                          setDesplegableAlumnesObert(false);
                        }}
                        className={`p-2 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          esSeleccionat
                            ? 'bg-blue-600 text-white'
                            : darkMode ? 'hover:bg-slate-700/60 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{uNom}</span>
                        {esSeleccionat && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* BOTÓ NOVA PREGUNTA */}
          <button
            onClick={obrirFormulariCreacio}
            disabled={!alumneId}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Pregunta</span>
          </button>
        </div>
      </div>

      {/* MISSATGE INFORMATIU */}
      {missatgeInfo && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{missatgeInfo}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORMULARI DE CREACIÓ / EDICIÓ */}
      {/* ========================================================================= */}
      {modeFormulari && (
        <div className={`p-6 rounded-3xl border shadow-md animate-in fade-in duration-200 ${
          darkMode ? 'bg-slate-800/90 border-blue-500/40' : 'bg-blue-50/40 border-blue-200'
        }`}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                {modeFormulari === 'crear' ? 'Nova Pregunta Personalitzada' : 'Editar Pregunta'}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Alumne destinatari: <strong className="text-blue-600 dark:text-blue-400">{nomAlumne}</strong>
              </span>
            </div>
            <button
              onClick={() => setModeFormulari(null)}
              className="p-1.5 rounded-lg hover:bg-black/10 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={desarPregunta} className="flex flex-col gap-4">
            
            {/* CAMP 1: PREGUNTA */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Enunciat de la pregunta per a l'alumne: *
              </label>
              <textarea
                required
                rows={2}
                value={formPregunta}
                onChange={(e) => setFormPregunta(e.target.value)}
                placeholder="Ex: Segons el teu test Biodata, indiques que et costa delegar. Posa'ns un cas pràctic..."
                className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 focus:border-blue-500'
                }`}
              />
            </div>

            {/* REIXA DE 2 CAMPS: ES BUSCA I RESPOSTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CAMP 2: ES BUSCA */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Què es busca avaluar (Objectiu docent):
                </label>
                <textarea
                  rows={3}
                  value={formEsBusca}
                  onChange={(e) => setFormEsBusca(e.target.value)}
                  placeholder="Ex: Autocrítica, assertivitat, adaptabilitat al comandament..."
                  className={`w-full p-3 rounded-xl border text-xs outline-none transition-all ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* CAMP 3: RESPOSTA / PAUTES */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  3. Pautes i Resposta model orientativa:
                </label>
                <textarea
                  rows={3}
                  value={formResposta}
                  onChange={(e) => setFormResposta(e.target.value)}
                  placeholder="Ex: Ha d'evitar justificar-se i proposar mecanismes de control..."
                  className={`w-full p-3 rounded-xl border text-xs outline-none transition-all ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 focus:border-blue-500'
                  }`}
                />
              </div>

            </div>

            {/* ORDRE I ETIQUETES */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
              
              {/* ORDRE */}
              <div className="flex flex-col gap-1.5 sm:col-span-1">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Ordre (1, 2, 3...):
                </label>
                <input
                  type="number"
                  min="1"
                  value={formOrdre}
                  onChange={(e) => setFormOrdre(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold outline-none ${
                    darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              {/* ETIQUETES SELECCIONADES */}
              <div className="flex flex-col gap-1.5 sm:col-span-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Etiquetes assignades a aquesta pregunta:
                </label>
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={novaEtiquetaInput}
                    onChange={(e) => setNovaEtiquetaInput(e.target.value)}
                    placeholder="Escriu una etiqueta i prem Enter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        afegirEtiquetaAlForm(novaEtiquetaInput);
                      }
                    }}
                    className={`flex-1 p-2 rounded-xl border text-xs outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => afegirEtiquetaAlForm(novaEtiquetaInput)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
                  >
                    Afegir
                  </button>
                </div>

                {/* XIPS D'ETIQUETES */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formEtiquetes.map(et => (
                    <span
                      key={et}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5"
                    >
                      <Tag className="w-3 h-3" />
                      {et}
                      <button
                        type="button"
                        onClick={() => eliminarEtiquetaDelForm(et)}
                        className="hover:text-rose-500 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* ETIQUETES RÀPIDES SUGGERIDES */}
                <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px]">
                  <span className="text-slate-400 font-bold mr-1">Suggerides:</span>
                  {ETIQUETES_ALUMNE_SUGGERIDES.slice(0, 5).map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => afegirEtiquetaAlForm(sug)}
                      className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

              </div>

            </div>

            {/* BOTONS D'ACCIÓ */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setModeFormulari(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                disabled={desant}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {desant ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{modeFormulari === 'crear' ? "Crear Pregunta per a l'Alumne" : "Guardar Canvis"}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRA DE FILTRES I CERCA */}
      {/* ========================================================================= */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
        darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}>
        
        {/* CERCA DE TEXT */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Cercar preguntes de ${nomAlumne}...`}
            value={cercaText}
            onChange={(e) => setCercaText(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs outline-none transition-all ${
              darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
          {cercaText && (
            <button
              onClick={() => setCercaText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* CONTROLS DE SELECCIÓ I EXPORTACIÓ */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          
          {preguntes.length > 0 && (
            <>
              <button
                onClick={idsSeleccionades.length === preguntesFiltrades.length ? desseleccionarTotes : seleccionarTotesFiltrades}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                {idsSeleccionades.length === preguntesFiltrades.length ? "Desseleccionar totes" : `Seleccionar (${preguntesFiltrades.length})`}
              </button>

              {idsSeleccionades.length > 0 && (
                <button
                  onClick={() => setModalVistaPreviaObert(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Veure Paquet ({idsSeleccionades.length})</span>
                </button>
              )}
            </>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTRES PER ETIQUETA RÀPIDA */}
      {/* ========================================================================= */}
      {etiquetesExistents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            Filtrar:
          </span>
          {etiquetesExistents.map(et => {
            const esActiva = etiquetesSeleccionades.includes(et);
            return (
              <button
                key={et}
                onClick={() => alternarFiltreEtiqueta(et)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  esActiva
                    ? 'bg-blue-600 text-white shadow-sm'
                    : darkMode 
                      ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Tag className="w-3 h-3 opacity-70" />
                <span>{et}</span>
                {esActiva && <X className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
          {etiquetesSeleccionades.length > 0 && (
            <button
              onClick={() => setEtiquetesSeleccionades([])}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-bold underline ml-1 cursor-pointer"
            >
              Netejar filtres
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LLISTAT DE PREGUNTES DE L'ALUMNE */}
      {/* ========================================================================= */}
      {carregant ? (
        <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Carregant preguntes personalitzades de {nomAlumne}...</span>
        </div>
      ) : preguntesFiltrades.length === 0 ? (
        <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center gap-4 ${
          darkMode ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div className="flex flex-col max-w-md">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {cercaText || etiquetesSeleccionades.length > 0 
                ? "Cap pregunta coincideix amb els filtres" 
                : `${nomAlumne} encara no té preguntes personalitzades`}
            </h3>
            <p className="text-xs mt-1 leading-relaxed">
              {cercaText || etiquetesSeleccionades.length > 0
                ? "Prova de canviar el text de cerca o desseleccionar les etiquetes."
                : "Pots crear una pregunta a mida amb el botó superior o carregar un paquet de preguntes d'exemple adaptades a aquest aspirant."}
            </p>
          </div>

          {!cercaText && etiquetesSeleccionades.length === 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={sembrarPreguntesExemple}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Carregar 4 preguntes model per a {nomAlumne}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {preguntesFiltrades.map((p, idx) => {
            const pId = p.id || `temp-${idx}`;
            const esSeleccionada = idsSeleccionades.includes(pId);
            const estaDesplegada = targetesDesplegades[pId] ?? false;

            return (
              <div
                key={pId}
                className={`p-5 rounded-2xl border transition-all flex flex-col gap-3 shadow-sm ${
                  esSeleccionada
                    ? darkMode
                      ? 'bg-blue-950/20 border-blue-500/60 ring-1 ring-blue-500/30'
                      : 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400/30'
                    : darkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* FILA SUPERIOR: CHECKBOX, ORDRE, PREGUNTA I BOTONS D'ACCIÓ */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    
                    {/* CHECKBOX DE SELECCIÓ */}
                    <button
                      type="button"
                      onClick={() => alternarSeleccioPregunta(pId)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        esSeleccionada
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : darkMode ? 'border-slate-600 hover:border-blue-400' : 'border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {esSeleccionada && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {/* NUMERACIÓ D'ORDRE */}
                    <span className="mt-0.5 px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono font-black text-xs shrink-0">
                      #{p.ordre !== undefined && p.ordre !== null ? p.ordre : idx + 1}
                    </span>

                    {/* ENUNCIAT DE LA PREGUNTA */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                        {p.pregunta}
                      </h4>

                      {/* ETIQUETES */}
                      {p.etiquetes && p.etiquetes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {p.etiquetes.map(et => (
                            <span
                              key={et}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                            >
                              {et}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* BOTONS D'ACCIÓ (EDITAR, ELIMINAR, DESPLEGAR) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => obrirFormulariEdicio(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      title="Editar pregunta"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => p.id && eliminarPregunta(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      title="Eliminar pregunta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alternarDesplegable(pId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer ml-1"
                      title={estaDesplegada ? "Plegar pautes" : "Veure pautes i què es busca"}
                    >
                      {estaDesplegada ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* DETALL DESPLEGABLE: ES BUSCA I RESPOSTA MODEL */}
                {estaDesplegada && (
                  <div className={`mt-2 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150 ${
                    darkMode ? 'border-slate-700/80 bg-slate-900/40 p-3 rounded-xl' : 'border-slate-200 bg-slate-50/80 p-3 rounded-xl'
                  }`}>
                    {p.esBusca && (
                      <div className="flex flex-col gap-1">
                        <span className="font-black uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400">
                          Què es busca / Objectiu:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {p.esBusca}
                        </p>
                      </div>
                    )}

                    {p.resposta && (
                      <div className="flex flex-col gap-1">
                        <span className="font-black uppercase tracking-wider text-[10px] text-emerald-600 dark:text-emerald-400">
                          Pautes i Resposta model:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {p.resposta}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE VISTA PRÈVIA DEL PAQUET COMPILAT PER A L'ALUMNE */}
      {/* ========================================================================= */}
      {modalVistaPreviaObert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-3xl rounded-3xl border p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Paquet d'Entrevista Personalitzat ({preguntesEscollides.length} preguntes)
                </h3>
              </div>
              <button
                onClick={() => setModalVistaPreviaObert(false)}
                className="p-1.5 rounded-lg hover:bg-black/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aquest és el recull de preguntes que has seleccionat exclusivament per a <strong>{nomAlumne}</strong>. Pots copiar el text o carregar-lo a la sessió.
            </p>

            {/* ÀREA DE TEXT FORMATAT */}
            <div className={`p-4 rounded-2xl border font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto ${
              darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              {compilarGuióText()}
            </div>

            {/* BOTONS D'ACCIÓ */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                {copiatAmbExit && <span className="text-emerald-500 font-bold">Text copiat al portapapers!</span>}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copiarGuioAlPortapapers}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar Text</span>
                </button>
                {onSeleccionarPerAEntrevista && (
                  <button
                    onClick={utilitzarPerAEntrevista}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Assignar a l'Entrevista</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
