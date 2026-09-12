// Explicació per a no-programadors:
// Aquest fitxer és el component "Lego" encarregat de la gestió del Banc de Preguntes i Presets Genèrics per al Professorat.
// Permet:
// 1. Donar d'alta, modificar i esborrar preguntes del banc general.
// 2. Cada pregunta té 3 camps clau:
//    - Pregunta: L'enunciat formulat a l'aspirant.
//    - Es busca: Què avalua o busca observar el tribunal/professor (objectiu pedagògic).
//    - Resposta: Pautes, resposta model o indicadors positius/negatius.
// 3. Assignar una o múltiples etiquetes (ex: "Primer dia Biodata", "Competències", "Casos pràctics", etc.).
// 4. Filtrar per etiquetes o cerca, seleccionar les preguntes desitjades i generar el paquet llest per carregar a la sessió d'entrevista.

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Tag, Edit3, Trash2, Check, X, 
  Sparkles, Layers, ArrowLeft, Copy, CheckCircle2, AlertCircle, 
  ChevronDown, ChevronUp, Filter, Eye, RefreshCw, FileText
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  serverTimestamp, query, orderBy 
} from 'firebase/firestore';

export interface PreguntaBanc {
  id?: string;
  pregunta: string;
  esBusca: string;
  resposta: string;
  etiquetes: string[];
  ordre?: number; // Ordre numèric de la pregunta dins de la classe o preset (1, 2, 3...)
  actiu?: boolean;
  creatEl?: string;
  actualitzatEl?: string;
}

interface GestioPresetsGenericsProps {
  darkMode: boolean;
  onTornar?: () => void;
  // Callback opcional per si es crida des de la sessió en directe per injectar text
  onSeleccionarPerAEntrevista?: (textInjectat: string) => void;
}

// =========================================================================
// DEFINICIÓ DELS 4 GRUPS D'ETIQUETES EN DESPLEGABLES
// =========================================================================

// 1. DESPLEGABLE 1: Classes Biodata (del 1 al 10)
export const ETIQUETES_CLASSES_BIODATA: string[] = Array.from(
  { length: 10 }, 
  (_, i) => `Classe Biodata ${i + 1}`
);

// 2. DESPLEGABLE 2: Classes Entrevista (del 1 al 10)
export const ETIQUETES_CLASSES_ENTREVISTA: string[] = Array.from(
  { length: 10 }, 
  (_, i) => `Classe Entrevista ${i + 1}`
);

// 3. DESPLEGABLE 3: Les 10 Competències Clau Oficials (ISPC / PGME)
export const ETIQUETES_COMPETENCIES_CLAU: string[] = [
  "1. Habilitats socials i comunicatives",
  "2. Orientació de servei a la ciutadania",
  "3. Treball en equip i col·laboració",
  "4. Adaptabilitat i flexibilitat",
  "5. Autocontrol i gestió de l'estrès",
  "6. Autogestió i creixement personal",
  "7. Compromís amb l'organització",
  "8. Eficiència i orientació a la qualitat",
  "9. Resolució de problemes",
  "10. Iniciativa i autonomia"
];

// 4. DESPLEGABLE 4: Altres categories i temàtiques
export const ETIQUETES_ALTRES_SUGGERIDES: string[] = [
  "Casos pràctics i dilemes",
  "Valors i ètica policial",
  "Motivació i vocació",
  "Dades biogràfiques i trajectòria",
  "Coneixement del cos de Mossos",
  "Simulacre global",
  "Primer dia Biodata"
];

// Agrupació de totes les suggerides oficials
export const TOTES_LES_ETIQUETES_OFICIALS: string[] = [
  ...ETIQUETES_CLASSES_BIODATA,
  ...ETIQUETES_CLASSES_ENTREVISTA,
  ...ETIQUETES_COMPETENCIES_CLAU,
  ...ETIQUETES_ALTRES_SUGGERIDES
];

// // Preguntes inicials d'alta qualitat basades en la prova oficial de Mossos d'Esquadra amb ordre predeterminat (1 a 10)
export const PREGUNTES_EXEMPLE_BIODATA: Omit<PreguntaBanc, 'id'>[] = [
  {
    pregunta: "Per què has decidit presentar-te a les oposicions de Mossos d'Esquadra i no a altres cossos de seguretat?",
    esBusca: "Vocació real, motivació intrínseca, coneixement específic de les competències i desplegament dels Mossos d'Esquadra a Catalunya vs altres cossos.",
    resposta: "Cercar una resposta madura, coherent amb el Biodata, evitant frases fetes ('m'agrada ajudar la gent'). Ha de destacar el model de policia de proximitat i l'arrelament al territori.",
    etiquetes: ["Classe Biodata 1", "Classe Entrevista 1", "Motivació i vocació", "7. Compromís amb l'organització"],
    ordre: 1,
    actiu: true,
    creatEl: new Date().toISOString()
  },
  {
    pregunta: "Al teu qüestionari Biodata indiques que et consideres una persona flexible. Posa'm un exemple real de la teva feina anterior on vas haver de canviar totalment de plans.",
    esBusca: "Adaptabilitat al canvi, coherència i veracitat amb el que ha escrit al Biodata (detecció de contradiccions).",
    resposta: "L'aspirant ha d'explicar una situació concreta amb estructura STAR (Situació, Tasca, Acció, Resultat) sense culpar companys ni mostrar rigidesa mental.",
    etiquetes: ["Classe Biodata 1", "4. Adaptabilitat i flexibilitat", "Dades biogràfiques i trajectòria"],
    ordre: 2,
    actiu: true,
    creatEl: new Date().toISOString()
  },
  {
    pregunta: "Com descriuries la teva capacitat per treballar sota pressió quan hi ha desacords forts en un equip?",
    esBusca: "Autocontrol, estabilitat emocional, assertivitat i capacitat per no prendre els conflictes de manera personal.",
    resposta: "Buscar arguments d'escolta activa, respecte a les instruccions jeràrquiques i canalització de les tensions sense bloquejos ni reaccions agressives.",
    etiquetes: ["Classe Entrevista 1", "5. Autocontrol i gestió de l'estrès", "3. Treball en equip i col·laboració"],
    ordre: 3,
    actiu: true,
    creatEl: new Date().toISOString()
  },
  {
    pregunta: "Què en pensa la teva família o entorn proper de la teva decisió de ser policia? T'hi donen suport?",
    esBusca: "Xarxa de suport psicosocial, estabilitat familiar davant de riscos, horaris rotatius i canvis de destinació territorial.",
    resposta: "Resposta que reflecteixi maduresa i diàleg amb l'entorn. Si no hi ha suport unànime, valorar com l'aspirant gestiona la seva autonomia i determinació.",
    etiquetes: ["Classe Biodata 1", "1. Habilitats socials i comunicatives", "Motivació i vocació"],
    ordre: 4,
    actiu: true,
    creatEl: new Date().toISOString()
  },
  {
    pregunta: "Explica'm un moment de la teva vida en què vas cometre un error important. Com el vas gestionar i quina lliçó en vas extreure?",
    esBusca: "Autocrítica constructiva, honestedat, assumir la responsabilitat sense derivar culpes cap a tercers i capacitat d'aprenentatge.",
    resposta: "Valorar positivament que reconegui l'error de forma genuïna, que expliqui com el va esmenar immediatament i el canvi d'hàbit posterior per no repetir-lo.",
    etiquetes: ["Classe Entrevista 2", "6. Autogestió i creixement personal", "Valors i ètica policial"],
    ordre: 5,
    actiu: true,
    creatEl: new Date().toISOString()
  },
  {
    pregunta: "Quina és la teva reacció habitual quan un superior et dona una ordre amb la qual no estàs d'acord?",
    esBusca: "Principi de jerarquia i disciplina vs capacitat de manifestar criteris tècnics de forma respectuosa i pels canals adequats.",
    resposta: "L'ordre s'ha de complir llevat que sigui manifestament il·legal o atempti contra els drets fonamentals. Valorar l'acatament i la comunicació assertiva a posteriori.",
    etiquetes: ["Classe Entrevista 2", "7. Compromís amb l'organització", "Casos pràctics i dilemes"],
    ordre: 6,
    actiu: true,
    creatEl: new Date().toISOString()
  },
  {
    pregunta: "Si durant un servei el teu company de patrulla té una actitud despectiva o desproporcionada amb un ciutadà, com actues tu?",
    esBusca: "Resolució de dilemes ètics, protecció de la imatge del Cos, mediació i respecte als drets de la ciutadania.",
    resposta: "Distingir entre intervenir immediatament per rebaixar la tensió i preservar el ciutadà, i parlar després en privat amb el company o donar compte al comandament si la gravetat ho requereix.",
    etiquetes: ["Classe Entrevista 3", "2. Orientació de servei a la ciutadania", "Valors i ètica policial", "Casos pràctics i dilemes"],
    ordre: 7,
    actiu: true,
    creatEl: new Date().toISOString()
  },
  {
    pregunta: "Quins són els 3 punts forts del teu caràcter i quins 2 punts consideres que hauries de millorar?",
    esBusca: "Autoconeixement realista, coherència amb els ítems de personalitat del Biodata i orientació a la millora contínua.",
    resposta: "Evitar defectes disfressats de virtuts ('sóc massa perfeccionista'). Buscar debilitats reals no incompatibles amb la funció policial que estigui treballant activament.",
    etiquetes: ["Classe Biodata 2", "6. Autogestió i creixement personal", "1. Habilitats socials i comunicatives"],
    ordre: 8,
    actiu: true,
    creatEl: new Date().toISOString()
  },
  {
    pregunta: "En una situació d'emergència on no hi ha comandament present i cal prendre una decisió en segons, com procedeixes?",
    esBusca: "Presa de decisions, capacitat resolutiva, ponderació de riscos i aplicació del principi de congruència, oportunitat i proporcionalitat (COP).",
    resposta: "Capacitat d'avaluar la situació amb calma, prioritzar la integritat física de les persones, actuar amb decisió i comunicar ràpidament per ràdio a sala.",
    etiquetes: ["Classe Entrevista 4", "9. Resolució de problemes", "10. Iniciativa i autonomia", "Casos pràctics i dilemes"],
    ordre: 9,
    actiu: true,
    creatEl: new Date().toISOString()
  },
  {
    pregunta: "Com portes la frustració quan dediques molt d'esforç a un projecte o objectiu i el resultat no és l'esperat?",
    esBusca: "Tolerància a la frustració, resiliència, perseverança i equilibri emocional.",
    resposta: "Explicar com analitza el motiu de la fallada, extreu conclusions útils i manté l'ànim i la constància sense desmotivar-se ni culpar la sort.",
    etiquetes: ["Classe Biodata 3", "5. Autocontrol i gestió de l'estrès", "6. Autogestió i creixement personal"],
    ordre: 10,
    actiu: true,
    creatEl: new Date().toISOString()
  }
];

export default function GestioPresetsGenerics({ 
  darkMode, 
  onTornar,
  onSeleccionarPerAEntrevista
}: GestioPresetsGenericsProps) {
  
  // =========================================================================
  // ESTATS PRINCIPALS
  // =========================================================================
  const [preguntes, setPreguntes] = useState<PreguntaBanc[]>([]);
  const [carregant, setCarregant] = useState<boolean>(true);
  const [cercaText, setCercaText] = useState<string>('');
  const [etiquetesSeleccionades, setEtiquetesSeleccionades] = useState<string[]>([]);
  
  // Estat del formulari de creació / edició
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

  // Preguntes seleccionades per al paquet/preset de classe
  const [idsSeleccionades, setIdsSeleccionades] = useState<string[]>([]);
  const [modalVistaPreviaObert, setModalVistaPreviaObert] = useState<boolean>(false);
  const [copiatAmbExit, setCopiatAmbExit] = useState<boolean>(false);

  // Desplegables de targeta
  const [targetesDesplegades, setTargetesDesplegades] = useState<{ [key: string]: boolean }>({});

  const alternarDesplegable = (id: string) => {
    setTargetesDesplegades(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // =========================================================================
  // CARREGAR PREGUNTES DE FIRESTORE
  // =========================================================================
  // Comentari per a no-programadors:
  // Carreguem les preguntes de la base de dades i les ordenem per defecte
  // segons el seu número d'ordre (1, 2, 3...) o per data si no en tenen.
  const carregarPreguntes = async () => {
    setCarregant(true);
    try {
      if (db) {
        const snap = await getDocs(collection(db, 'banc_preguntes_entrevistes'));
        const llista: PreguntaBanc[] = [];
        snap.forEach(docSnap => {
          llista.push({ id: docSnap.id, ...docSnap.data() } as PreguntaBanc);
        });

        // Ordenem per ordre ascendent (1, 2, 3...) i secundàriament per data de creació
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
      console.error("Error carregant el banc de preguntes:", err);
    } finally {
      setCarregant(false);
    }
  };

  useEffect(() => {
    carregarPreguntes();
  }, []);

  // =========================================================================
  // SEEDING INICIAL D'EXEMPLE (SI EL BANC ESTÀ BUIT)
  // =========================================================================
  const handleCarregarExemplesInicials = async () => {
    setDesant(true);
    setMissatgeInfo(null);
    try {
      if (db) {
        for (const p of PREGUNTES_EXEMPLE_BIODATA) {
          await addDoc(collection(db, 'banc_preguntes_entrevistes'), {
            ...p,
            timestamp: serverTimestamp()
          });
        }
        setMissatgeInfo("S'han carregat amb èxit les 10 preguntes inicials de 'Primer dia Biodata'!");
        await carregarPreguntes();
      }
    } catch (err) {
      console.error("Error carregant exemples inicials:", err);
      setMissatgeInfo("S'ha produït un error carregant les preguntes d'exemple.");
    } finally {
      setDesant(false);
    }
  };

  // =========================================================================
  // GESTIÓ DEL FORMULARI (CREAR / EDITAR)
  // =========================================================================
  // Comentari per a no-programadors:
  // Quan donem d'alta una nova pregunta al banc de presets:
  // 1. Els camps obligatoris són la Pregunta i "Es busca" (criteris docents).
  // 2. La Resposta és opcional (per defecte queda buida per a la resposta de l'alumne).
  // 3. L'ordre és un número (1, 2, 3...) per establir la seqüència exacta a la classe.
  // 4. Les etiquetes s'inicien completament buides per defecte i és obligatori triar-ne almenys una.
  const obrirFormulariCrear = () => {
    setModeFormulari('crear');
    setPreguntaEnEdicioId(null);
    setFormPregunta('');
    setFormEsBusca('');
    setFormResposta('');
    setFormOrdre(String(preguntes.length + 1));
    // Per defecte les etiquetes surten buides
    setFormEtiquetes([]);
    setNovaEtiquetaInput('');
  };

  const obrirFormulariEditar = (p: PreguntaBanc) => {
    setModeFormulari('editar');
    setPreguntaEnEdicioId(p.id || null);
    setFormPregunta(p.pregunta || '');
    setFormEsBusca(p.esBusca || '');
    setFormResposta(p.resposta || '');
    setFormOrdre(p.ordre !== undefined && p.ordre !== null ? String(p.ordre) : '');
    setFormEtiquetes(p.etiquetes ? [...p.etiquetes] : []);
    setNovaEtiquetaInput('');
  };

  const tancarFormulari = () => {
    setModeFormulari(null);
    setPreguntaEnEdicioId(null);
  };

  const afegirEtiquetaAlForm = (etiqueta: string) => {
    const neta = etiqueta.trim();
    if (!neta) return;
    if (!formEtiquetes.includes(neta)) {
      setFormEtiquetes([...formEtiquetes, neta]);
    }
    setNovaEtiquetaInput('');
  };

  const treureEtiquetaDelForm = (etiqueta: string) => {
    setFormEtiquetes(formEtiquetes.filter(e => e !== etiqueta));
  };

  const handleGuardarPregunta = async () => {
    // Validem exclusivament la Pregunta i Què es busca
    if (!formPregunta.trim() || !formEsBusca.trim()) {
      alert("Cal omplir obligatòriament la Pregunta i el camp 'Es busca'.");
      return;
    }

    // Validem que s'hagi triat obligatòriament almenys 1 etiqueta
    if (formEtiquetes.length === 0) {
      alert("Si us plau, tria obligatòriament almenys 1 etiqueta als desplegables per classificar la pregunta.");
      return;
    }

    setDesant(true);
    setMissatgeInfo(null);

    try {
      const usuari = auth?.currentUser;
      const numOrdre = formOrdre.trim() ? parseInt(formOrdre.trim(), 10) : undefined;

      const dadesNovaPregunta: any = {
        pregunta: formPregunta.trim(),
        esBusca: formEsBusca.trim(),
        resposta: formResposta.trim(), // Pot estar buida per defecte
        etiquetes: formEtiquetes,
        actiu: true,
        actualitzatEl: new Date().toISOString(),
        autor: usuari?.email || 'Professor/a OposiCAT'
      };

      if (numOrdre !== undefined && !isNaN(numOrdre)) {
        dadesNovaPregunta.ordre = numOrdre;
      }

      if (modeFormulari === 'crear') {
        if (db) {
          await addDoc(collection(db, 'banc_preguntes_entrevistes'), {
            ...dadesNovaPregunta,
            creatEl: new Date().toISOString(),
            timestamp: serverTimestamp()
          });
        }
        setMissatgeInfo("Pregunta donada d'alta correctament al banc de preguntes!");
      } else if (modeFormulari === 'editar' && preguntaEnEdicioId) {
        if (db) {
          await updateDoc(doc(db, 'banc_preguntes_entrevistes', preguntaEnEdicioId), dadesNovaPregunta);
        }
        setMissatgeInfo("Pregunta actualitzada amb èxit!");
      }

      tancarFormulari();
      await carregarPreguntes();
    } catch (err) {
      console.error("Error desant la pregunta:", err);
      alert("S'ha produït un error en desar la pregunta a la base de dades.");
    } finally {
      setDesant(false);
    }
  };

  const handleEsborrarPregunta = async (id: string) => {
    const confirmar = window.confirm("Segur que vols esborrar aquesta pregunta del banc general?");
    if (!confirmar) return;

    try {
      if (db) {
        await deleteDoc(doc(db, 'banc_preguntes_entrevistes', id));
      }
      setPreguntes(prev => prev.filter(p => p.id !== id));
      setIdsSeleccionades(prev => prev.filter(item => item !== id));
      setMissatgeInfo("Pregunta esborrada correctament.");
    } catch (err) {
      console.error("Error esborrant la pregunta:", err);
      alert("No s'ha pogut esborrar la pregunta.");
    }
  };

  // =========================================================================
  // GESTIÓ DE FILTRES I ETIQUETES
  // =========================================================================
  const toggleFiltreEtiqueta = (etiqueta: string) => {
    if (etiquetesSeleccionades.includes(etiqueta)) {
      setEtiquetesSeleccionades(etiquetesSeleccionades.filter(e => e !== etiqueta));
    } else {
      setEtiquetesSeleccionades([...etiquetesSeleccionades, etiqueta]);
    }
  };

  // Totes les etiquetes úniques presents al banc o a les oficials
  const totesLesEtiquetesDisponibles = Array.from(
    new Set([
      ...TOTES_LES_ETIQUETES_OFICIALS,
      ...preguntes.flatMap(p => p.etiquetes || [])
    ])
  ).sort();

  // Filtrar preguntes segons text de cerca i etiquetes
  // Comentari per a no-programadors:
  // Les preguntes filtrades es mantenen ordenades pel seu número d'ordre (1, 2, 3...)
  const preguntesFiltrades = preguntes.filter(p => {
    // Filtre per text
    const cerca = cercaText.toLowerCase();
    const coincideixText = 
      !cerca ||
      p.pregunta?.toLowerCase().includes(cerca) ||
      p.esBusca?.toLowerCase().includes(cerca) ||
      p.resposta?.toLowerCase().includes(cerca);

    // Filtre per etiquetes (si n'hi ha de seleccionades, la pregunta ha de tenir almenys una)
    const coincideixEtiqueta = 
      etiquetesSeleccionades.length === 0 ||
      (p.etiquetes && p.etiquetes.some(e => etiquetesSeleccionades.includes(e)));

    return coincideixText && coincideixEtiqueta;
  }).sort((a, b) => {
    const numA = a.ordre !== undefined && a.ordre !== null && !isNaN(a.ordre) ? Number(a.ordre) : 9999;
    const numB = b.ordre !== undefined && b.ordre !== null && !isNaN(b.ordre) ? Number(b.ordre) : 9999;
    if (numA !== numB) return numA - numB;
    const dataA = a.creatEl || '';
    const dataB = b.creatEl || '';
    return dataB.localeCompare(dataA);
  });

  // =========================================================================
  // GESTIÓ DE SELECCIÓ I PREPARACIÓ DEL PRESET DE CLASSE
  // =========================================================================
  // Comentari per a no-programadors:
  // - Si el professor selecciona preguntes soltes d'una en una, es respecta l'ordre en què les clica.
  // - Si el professor fa "Seleccionar-ho tot" en una classe (ex: Classe Biodata 1), s'afegeixen en l'ordre predeterminat 1, 2, 3...
  const toggleSeleccioPregunta = (id: string) => {
    if (idsSeleccionades.includes(id)) {
      setIdsSeleccionades(idsSeleccionades.filter(item => item !== id));
    } else {
      setIdsSeleccionades([...idsSeleccionades, id]);
    }
  };

  const seleccionarTotesLesFiltrades = () => {
    const ids = preguntesFiltrades.map(p => p.id!).filter(Boolean);
    // Si no hi havia res seleccionat, establim directament l'ordre de les filtrades (1, 2, 3...)
    if (idsSeleccionades.length === 0) {
      setIdsSeleccionades(ids);
    } else {
      setIdsSeleccionades(Array.from(new Set([...idsSeleccionades, ...ids])));
    }
  };

  const deseleccionarTotes = () => {
    setIdsSeleccionades([]);
  };

  // Generar el text estructurat de preguntes seleccionades per al quadre de l'entrevista
  // Comentari per a no-programadors: 
  // Quan el professor carrega les preguntes:
  // 1. Si s'ha fet "Seleccionar-ho tot" d'un perfil/classe, s'importa l'estructura completa en ordre (1..10).
  // 2. Si s'han agafat preguntes soltes (com ara de competències clau), surten en l'ordre precís de selecció.
  // Format net i concís:
  // 🔵 Pregunta 1: [enunciat]
  // 🟠 Es busca: [pauta/explicació docent]
  // 🟢 Resposta alumne: [espai per escriure la resposta de l'alumne]
  const generarTextPreset = (): string => {
    const preguntesAIncloure = idsSeleccionades
      .map(id => preguntes.find(p => p.id === id))
      .filter((p): p is PreguntaBanc => Boolean(p));

    if (preguntesAIncloure.length === 0) return '';

    return preguntesAIncloure.map((p, idx) => {
      let bloc = `🔵 Pregunta ${idx + 1}: ${p.pregunta}\n`;
      bloc += `🟠 Es busca: ${p.esBusca || 'Avaluar competències clau'}\n`;
      bloc += `🟢 Resposta alumne: `;
      return bloc;
    }).join('\n\n----------------------------------------\n\n');
  };

  const handleCopiarTextPreset = () => {
    const text = generarTextPreset();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiatAmbExit(true);
    setTimeout(() => setCopiatAmbExit(false), 2500);
  };

  const handleCarregarDirecteAEntrevista = () => {
    const text = generarTextPreset();
    if (!text) return;
    if (onSeleccionarPerAEntrevista) {
      onSeleccionarPerAEntrevista(text);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-5 ${
      darkMode ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* ========================================================================= */}
      {/* CAPÇALERA SUPERIOR AMB RETORN I ACCIÓ D'ALTA */}
      {/* ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
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
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Eina de Gestió - Professorat
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight">
              1- Presets - Genèric (Banc de Preguntes)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botó per donar d'alta nova pregunta: només es mostra si NO estem en mode selecció per carregar a entrevista */}
          {!onSeleccionarPerAEntrevista && (
            <button
              onClick={obrirFormulariCrear}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
              id="btn-nova-pregunta-banc"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Nova Pregunta
            </button>
          )}
        </div>
      </div>

      {/* Missatge d'èxit / feedback temporal */}
      {missatgeInfo && (
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-800 dark:text-blue-200 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{missatgeInfo}</span>
          </div>
          <button onClick={() => setMissatgeInfo(null)} className="text-blue-400 hover:text-blue-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORMULARI MODAL DE CREACIÓ / EDICIÓ DE PREGUNTA */}
      {/* ========================================================================= */}
      {modeFormulari && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-7 flex flex-col gap-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Capçalera del Formulari */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black">
                  {modeFormulari === 'crear' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight">
                    {modeFormulari === 'crear' ? "Donar d'Alta Nova Pregunta" : "Modificar Pregunta del Banc"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defineix la formulació, què s'avalua, la resposta esperada i les etiquetes
                  </p>
                </div>
              </div>
              <button 
                onClick={tancarFormulari}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CAMP 1: PREGUNTA */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>1. Pregunta (Formulació a l'aspirant):</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formPregunta}
                onChange={(e) => setFormPregunta(e.target.value)}
                placeholder="Exemple: Per què has decidit presentar-te a Mossos d'Esquadra i no a la Policia Local o Policia Nacional?"
                rows={3}
                className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* CAMP 2: ES BUSCA */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>2. Es busca (Què avalua / Objectiu del professor):</span>
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formEsBusca}
                onChange={(e) => setFormEsBusca(e.target.value)}
                placeholder="Exemple: Vocació genuïna, coneixement específic de competències i model policial de proximitat vs seguretat ciutadana."
                rows={2}
                className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* CAMP 3: RESPOSTA (OPCIONAL / EN BLANC PER DEFECTE) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>3. Resposta de l'alumne / Pauta (Opcional):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold normal-case">
                  (Es deixa en blanc per defecte per a la resposta de l'alumne)
                </span>
              </label>
              <textarea
                value={formResposta}
                onChange={(e) => setFormResposta(e.target.value)}
                placeholder="Opcional: Deixar en blanc perquè l'alumne hi respongui durant l'entrevista, o afegeix alguna pauta breu..."
                rows={3}
                className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* CAMP 4: ETIQUETES (CLASSIFICACIÓ AMB ELS 4 DESPLEGABLES - OBLIGATÒRIA ALMENYS 1) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  <span>4. Etiquetes de la pregunta:</span>
                  <span className="text-rose-500">* (Obligatòria almenys 1)</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Tria als 4 desplegables de sota</span>
              </div>

              {/* Etiquetes seleccionades actuals */}
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 min-h-[48px] items-center bg-slate-50/50 dark:bg-slate-800/40">
                {formEtiquetes.length === 0 ? (
                  <span className="text-xs text-slate-400 italic px-1">Cap etiqueta seleccionada. Tria-la als desplegables de sota.</span>
                ) : (
                  formEtiquetes.map(et => (
                    <span
                      key={et}
                      className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-95 duration-100"
                    >
                      <Tag className="w-3 h-3 text-blue-200" />
                      <span>{et}</span>
                      <button
                        type="button"
                        onClick={() => treureEtiquetaDelForm(et)}
                        className="hover:text-rose-200 cursor-pointer p-0.5 rounded-full hover:bg-white/10"
                        title="Eliminar etiqueta"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Els 4 Desplegables de selecció d'etiquetes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* DESPLEGABLE 1: CLASSE BIODATA (1 al 10) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-blue-500" />
                    <span>Desplegable 1: Classe Biodata (1-10)</span>
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        afegirEtiquetaAlForm(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-blue-500' : 'bg-white border-slate-300 text-slate-800 hover:border-blue-500'
                    }`}
                  >
                    <option value="" disabled>+ Selecciona Classe Biodata...</option>
                    {ETIQUETES_CLASSES_BIODATA.map(opcio => (
                      <option key={opcio} value={opcio}>
                        {formEtiquetes.includes(opcio) ? `✓ ${opcio} (ja afegida)` : `+ ${opcio}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DESPLEGABLE 2: CLASSE ENTREVISTA (1 al 10) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-purple-500" />
                    <span>Desplegable 2: Classe Entrevista (1-10)</span>
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        afegirEtiquetaAlForm(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-purple-500' : 'bg-white border-slate-300 text-slate-800 hover:border-purple-500'
                    }`}
                  >
                    <option value="" disabled>+ Selecciona Classe Entrevista...</option>
                    {ETIQUETES_CLASSES_ENTREVISTA.map(opcio => (
                      <option key={opcio} value={opcio}>
                        {formEtiquetes.includes(opcio) ? `✓ ${opcio} (ja afegida)` : `+ ${opcio}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DESPLEGABLE 3: LES 10 COMPETÈNCIES CLAU */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Desplegable 3: Competències Clau (10)</span>
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        afegirEtiquetaAlForm(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-amber-500' : 'bg-white border-slate-300 text-slate-800 hover:border-amber-500'
                    }`}
                  >
                    <option value="" disabled>+ Selecciona Competència Clau...</option>
                    {ETIQUETES_COMPETENCIES_CLAU.map(opcio => (
                      <option key={opcio} value={opcio}>
                        {formEtiquetes.includes(opcio) ? `✓ ${opcio} (ja afegida)` : `+ ${opcio}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DESPLEGABLE 4: ALTRES */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-500" />
                    <span>Desplegable 4: Altres</span>
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        afegirEtiquetaAlForm(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500' : 'bg-white border-slate-300 text-slate-800 hover:border-emerald-500'
                    }`}
                  >
                    <option value="" disabled>+ Selecciona Categoria d'Altres...</option>
                    {ETIQUETES_ALTRES_SUGGERIDES.map(opcio => (
                      <option key={opcio} value={opcio}>
                        {formEtiquetes.includes(opcio) ? `✓ ${opcio} (ja afegida)` : `+ ${opcio}`}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Crear nova etiqueta personalitzada lliure */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={novaEtiquetaInput}
                  onChange={(e) => setNovaEtiquetaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      afegirEtiquetaAlForm(novaEtiquetaInput);
                    }
                  }}
                  placeholder="O escriu una etiqueta personalitzada lliure..."
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => afegirEtiquetaAlForm(novaEtiquetaInput)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                >
                  Afegir
                </button>
              </div>

            </div>

            {/* CAMP 5: ORDRE DE LA PREGUNTA DINS DE LA CLASSE / PRESET */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span>5. Ordre de la pregunta dins del Preset / Classe:</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Seqüència (1, 2, 3...)</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={formOrdre}
                  onChange={(e) => setFormOrdre(e.target.value)}
                  placeholder="1"
                  className={`w-28 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    darkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Estableix la posició en importar la classe sencera mitjançant <strong>«Seleccionar-ho tot»</strong> (es carregarà 1, 2, 3...).
                </p>
              </div>
            </div>

            {/* BOTONS D'ACCIÓ DEL FORMULARI */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={tancarFormulari}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                Cancel·lar
              </button>

              <button
                type="button"
                onClick={handleGuardarPregunta}
                disabled={desant}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                {desant ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Desant a Firestore...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    {modeFormulari === 'crear' ? "Guardar Pregunta" : "Actualitzar Pregunta"}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓ DE FILTRES PER ETIQUETES (AMB ELS 4 DESPLEGABLES) I CERCADOR */}
      {/* ========================================================================= */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col gap-4 shadow-sm ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Cercador + Resum */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={cercaText}
              onChange={(e) => setCercaText(e.target.value)}
              placeholder="Cerca per text, pregunta o pauta..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs font-bold text-slate-500">
            <span>
              Mostrant <strong>{preguntesFiltrades.length}</strong> de <strong>{preguntes.length}</strong> preguntes
            </span>
            {etiquetesSeleccionades.length > 0 && (
              <button
                onClick={() => setEtiquetesSeleccionades([])}
                className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer ml-2"
              >
                Netejar filtres ({etiquetesSeleccionades.length})
              </button>
            )}
          </div>
        </div>

        {/* ELS 4 DESPLEGABLES DE FILTRE */}
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              <span>Filtra per Desplegables Temàtics:</span>
            </div>
            {etiquetesSeleccionades.length > 0 && (
              <span className="text-[10px] font-bold text-blue-500">
                {etiquetesSeleccionades.length} filtre(s) actiu(s)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            
            {/* FILTRE DESPLEGABLE 1: CLASSE BIODATA (1 al 10) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Classe Biodata (1-10)
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    toggleFiltreEtiqueta(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-blue-500'
                }`}
              >
                <option value="" disabled>Filtra per Classe Biodata...</option>
                {ETIQUETES_CLASSES_BIODATA.map(opcio => {
                  const num = preguntes.filter(p => p.etiquetes && p.etiquetes.includes(opcio)).length;
                  const seleccionada = etiquetesSeleccionades.includes(opcio);
                  return (
                    <option key={opcio} value={opcio}>
                      {seleccionada ? `✓ ${opcio} (${num})` : `${opcio} (${num})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* FILTRE DESPLEGABLE 2: CLASSE ENTREVISTA (1 al 10) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Classe Entrevista (1-10)
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    toggleFiltreEtiqueta(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-purple-500'
                }`}
              >
                <option value="" disabled>Filtra per Classe Entrevista...</option>
                {ETIQUETES_CLASSES_ENTREVISTA.map(opcio => {
                  const num = preguntes.filter(p => p.etiquetes && p.etiquetes.includes(opcio)).length;
                  const seleccionada = etiquetesSeleccionades.includes(opcio);
                  return (
                    <option key={opcio} value={opcio}>
                      {seleccionada ? `✓ ${opcio} (${num})` : `${opcio} (${num})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* FILTRE DESPLEGABLE 3: LES 10 COMPETÈNCIES CLAU */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Competències Clau (10)
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    toggleFiltreEtiqueta(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-amber-500' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-amber-500'
                }`}
              >
                <option value="" disabled>Filtra per Competència Clau...</option>
                {ETIQUETES_COMPETENCIES_CLAU.map(opcio => {
                  const num = preguntes.filter(p => p.etiquetes && p.etiquetes.includes(opcio)).length;
                  const seleccionada = etiquetesSeleccionades.includes(opcio);
                  return (
                    <option key={opcio} value={opcio}>
                      {seleccionada ? `✓ ${opcio} (${num})` : `${opcio} (${num})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* FILTRE DESPLEGABLE 4: ALTRES */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                4. Altres Categories
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    toggleFiltreEtiqueta(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-emerald-500'
                }`}
              >
                <option value="" disabled>Filtra per Altres...</option>
                {ETIQUETES_ALTRES_SUGGERIDES.map(opcio => {
                  const num = preguntes.filter(p => p.etiquetes && p.etiquetes.includes(opcio)).length;
                  const seleccionada = etiquetesSeleccionades.includes(opcio);
                  return (
                    <option key={opcio} value={opcio}>
                      {seleccionada ? `✓ ${opcio} (${num})` : `${opcio} (${num})`}
                    </option>
                  );
                })}
              </select>
            </div>

          </div>

          {/* Xips dels filtres actius */}
          {etiquetesSeleccionades.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
                Filtres seleccionats:
              </span>
              {etiquetesSeleccionades.map(etiqueta => (
                <span
                  key={etiqueta}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <Tag className="w-3 h-3 text-blue-200" />
                  <span>{etiqueta}</span>
                  <button
                    onClick={() => toggleFiltreEtiqueta(etiqueta)}
                    className="hover:text-rose-200 cursor-pointer"
                    title="Treure filtre"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* BARRA D'ACCIÓ RÀPIDA DE SELECCIÓ (PER PREPARAR CLASSES / PRESETS) */}
      {/* ========================================================================= */}
      <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        idsSeleccionades.length > 0
          ? darkMode ? 'bg-blue-950/30 border-blue-800/60 text-blue-200' : 'bg-blue-50/80 border-blue-200 text-blue-900'
          : darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs font-black uppercase tracking-wider">
            Preguntes triades: <strong className="text-blue-600 dark:text-blue-400">{idsSeleccionades.length}</strong>
            {preguntesFiltrades.length > 0 && (
              <span className="text-slate-400 font-normal ml-1">
                (de {preguntesFiltrades.length} visibles)
              </span>
            )}
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={seleccionarTotesLesFiltrades}
              className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              ✓ Seleccionar-ho tot
            </button>
            <button
              onClick={deseleccionarTotes}
              disabled={idsSeleccionades.length === 0}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                idsSeleccionades.length > 0
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 cursor-pointer active:scale-95'
                  : 'text-slate-400 opacity-50 cursor-not-allowed'
              }`}
            >
              ✕ Deseleccionar-ho tot
            </button>
          </div>
        </div>

        {idsSeleccionades.length > 0 && (
          <div className="flex items-center gap-2">
            {onSeleccionarPerAEntrevista && (
              <button
                onClick={handleCarregarDirecteAEntrevista}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Carregar {idsSeleccionades.length} a l'Entrevista
              </button>
            )}

            <button
              onClick={() => setModalVistaPreviaObert(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Previsualitzar Text ({idsSeleccionades.length})
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LLISTA DE PREGUNTES DEL BANC */}
      {/* ========================================================================= */}
      {carregant ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Carregant el banc de preguntes...</span>
        </div>
      ) : preguntes.length === 0 ? (
        /* Estat buit inicial amb botó per carregar exemples */
        <div className={`p-8 sm:p-10 rounded-3xl border text-center flex flex-col items-center justify-center gap-4 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight">
            El Banc de Preguntes està buit
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Comença donant d'alta la teva primera pregunta o carrega automàticament el paquet inicial de 10 preguntes clau de <strong>"Primer dia Biodata"</strong>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <button
              onClick={handleCarregarExemplesInicials}
              disabled={desant}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Carregar 10 Preguntes de Biodata
            </button>
            {!onSeleccionarPerAEntrevista && (
              <button
                onClick={obrirFormulariCrear}
                className="px-5 py-3 rounded-2xl border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Crear Pregunta Manualment
              </button>
            )}
          </div>
        </div>
      ) : preguntesFiltrades.length === 0 ? (
        <div className={`p-8 rounded-2xl border text-center text-slate-500 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm font-bold">No s'ha trobat cap pregunta amb els filtres aplicats.</p>
          <button
            onClick={() => { setCercaText(''); setEtiquetesSeleccionades([]); }}
            className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase cursor-pointer"
          >
            Netejar tots els filtres
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {preguntesFiltrades.map((p, index) => {
            const estaSeleccionada = p.id ? idsSeleccionades.includes(p.id) : false;
            const esDesplegada = p.id ? targetesDesplegades[p.id] : false;

            return (
              <div
                key={p.id || index}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col gap-2.5 ${
                  estaSeleccionada
                    ? darkMode
                      ? 'bg-blue-950/20 border-blue-600/80 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-blue-50/40 border-blue-400 shadow-md ring-1 ring-blue-400/40'
                    : darkMode
                    ? 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                {/* Capçalera de la targeta */}
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Checkbox i Pregunta (Botó Blau) */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => p.id && toggleSeleccioPregunta(p.id)}
                      className={`w-5 h-5 rounded-lg border shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-all ${
                        estaSeleccionada
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : darkMode ? 'border-slate-700 hover:border-blue-400' : 'border-slate-300 hover:border-blue-500'
                      }`}
                      title={estaSeleccionada ? "Deseleccionar pregunta" : "Seleccionar per a la sessió"}
                    >
                      {estaSeleccionada && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex flex-col gap-1 flex-1">
                      {/* Enunciat amb Emoticona / Botó Blau */}
                      <div className="flex items-start gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-tight shrink-0 mt-0.5">
                          🔵 Pregunta {p.ordre !== undefined && p.ordre !== null && !isNaN(p.ordre) ? `#${p.ordre}` : ''}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                          {p.pregunta}
                        </h4>
                      </div>

                      {/* Xips d'etiquetes associades */}
                      {p.etiquetes && p.etiquetes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pl-1">
                          {p.etiquetes.map(et => (
                            <span
                              key={et}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                darkMode ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              <Tag className="w-2.5 h-2.5 text-blue-500" />
                              {et}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botons d'acció de la targeta (Editar / Esborrar només si no estem només important; Expandir sempre) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!onSeleccionarPerAEntrevista && (
                      <>
                        <button
                          onClick={() => obrirFormulariEditar(p)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                          }`}
                          title="Editar pregunta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => p.id && handleEsborrarPregunta(p.id)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer text-rose-500 hover:bg-rose-500/10 ${
                            darkMode ? 'border-slate-700' : 'border-slate-200'
                          }`}
                          title="Esborrar pregunta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => p.id && alternarDesplegable(p.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                      }`}
                      title={esDesplegada ? "Plegar detalls" : "Desplegar pauta i resposta"}
                    >
                      {esDesplegada ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                </div>

                {/* Bloc 2: "Es busca" (Emoticona / Color Taronja) */}
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  darkMode 
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-200' 
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}>
                  <span className="inline-flex items-center gap-1 font-black uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    🟠 Es busca:
                  </span>
                  <span className="leading-relaxed font-medium flex-1">
                    {p.esBusca || "Criteris d'avaluació i competències clau."}
                  </span>
                </div>

                {/* Bloc 3: "Resposta / Pauta" (Emoticona / Color Verd) */}
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  darkMode 
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' 
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}>
                  <span className="inline-flex items-center gap-1 font-black uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    🟢 Resposta alumne:
                  </span>
                  <span className="leading-relaxed font-medium flex-1">
                    {p.resposta || "Pauta i resposta model per a contrastar durant l'entrevista."}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* POP-UP MODAL DE VISTA PRÈVIA DEL TEXT PRESET (PER COPIAR / CARREGAR) */}
      {/* ========================================================================= */}
      {modalVistaPreviaObert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-7 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black uppercase tracking-tight">
                  Text Preparat per a la Sessió ({idsSeleccionades.length} preguntes)
                </h3>
              </div>
              <button 
                onClick={() => setModalVistaPreviaObert(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aquest és el format exacte que es carregarà al quadre de text de l'entrevista quan el professor seleccioni aquest preset:
            </p>

            <pre className={`p-4 rounded-2xl border text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto ${
              darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              {generarTextPreset()}
            </pre>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Llest per copiar o injectar a la sessió
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopiarTextPreset}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                >
                  {copiatAmbExit ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Copiat al Porta-retalls!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Text
                    </>
                  )}
                </button>

                {onSeleccionarPerAEntrevista && (
                  <button
                    onClick={() => {
                      handleCarregarDirecteAEntrevista();
                      setModalVistaPreviaObert(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer active:scale-95 shadow-md shadow-blue-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Injectar a l'Entrevista
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
