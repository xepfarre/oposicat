// Explicació per a no-programadors:
// Aquest fitxer conté el mòdul avançat de "Gestió d'Usuaris, Entrevistes i Preparació de Classes" per al Backoffice d'OposiCAT.
// Permet als professors i psicòlegs:
// 1. Diari de Sessions: Enregistrar en directe què diu l'alumne a cada pregunta, importar plantilles de preguntes i consultar l'històric d'altres professors.
// 2. Resultats Biodata: Veure les 10 competències clau oficials i fer clic a qualsevol per veure el desglossament exacte de preguntes i respostes de l'alumne.
// 3. Preparació de Classes & Plantilles: Crear i gestionar presets de classes ("Classe 1 - Genèrica", "Marc - Sessió 02", etc.) i utilitzar-los en un clic.

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, UserCheck, MessageSquare, Calendar, Brain, ClipboardList, 
  Plus, Clock, Award, AlertCircle, CheckCircle2, Trash2, Edit3, 
  BookOpen, Save, X, ChevronRight, ChevronDown, GraduationCap, Eye, RefreshCw,
  Sparkles, FileText, ArrowLeft, ShieldCheck, HeartHandshake, Copy,
  CheckCircle, AlertTriangle, Layers, Play, Check, ExternalLink, HelpCircle,
  Radio, Send, RotateCcw, Zap, Activity, CheckSquare
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { 
  collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp, query, orderBy, onSnapshot
} from 'firebase/firestore';
import { MAP_COMPETENCIES, COMPETENCIES_ENTREVISTA_LIVE_10, PreguntaBiodata } from '../oposimossos/prova_psicologica/preguntes_biodata';
import { BANC_80_PREGUNTES_BIODATA } from '../oposimossos/prova_psicologica/banc_preguntes_biodata_default';

// Interfície per a cada pregunta formulada durant una sessió
export interface PreguntaAvaluada {
  id: string;
  enunciat: string;
  respostaAlumne: string; // Què ha dit l'alumne
  valoracioDocent?: string; // Comentari o feedback del professor
  puntuacio?: number; // Nota d'aquesta resposta (1 a 10)
}

// Interfície d'una sessió d'entrevista o tutoria psicopedagògica
export interface SessioEntrevista {
  id: string;
  userId: string;
  dataSessio: string;
  horaSessio: string;
  professorNom: string;
  tipusSessio: string; // Ex: 'Simulacre PGME', 'Revisió Biodata', 'Situacions pràctiques'
  contingutConversa: string; // Resum global
  puntsForts: string;
  puntsMillora: string;
  notesProperaClasse: string; // Anotació per a altres professors
  nivellPreparacio: 'inicial' | 'en_desenvolupament' | 'bon_nivell' | 'perfil_mossos';
  preguntesAvaluades: PreguntaAvaluada[];
  plantillaUtilitzadaId?: string;
  plantillaUtilitzadaTitol?: string;
  createdAt?: any;
  actualitzatEl?: any;
}

// Interfície per a les plantilles de classes (Presets)
export interface PlantillaClasse {
  id: string;
  titol: string; // Ex: "Classe 1 - Genèrica", "Marc - Sessió 02"
  descripcio?: string;
  esGlobal: boolean; // true = accessible per a tots els alumnes; false = només per a aquest alumne
  userId?: string; // ID de l'alumne si és una plantilla personalitzada
  ambit: string; // "Biodata", "Entrevista PGME", "Situacions de carrer", "Seguiment personal"
  objectius?: string;
  preguntes: {
    id: string;
    text: string;
    pautesProfessor?: string;
  }[];
  createdAt?: any;
}

// Plantilles predeterminades del sistema per quan la base de dades és nova
const PLANTILLES_PER_DEFECTE: PlantillaClasse[] = [
  {
    id: 'preset_default_1',
    titol: 'Classe 01 - Introducció al Biodata i Perfil Policial',
    descripcio: 'Sessió inicial d\'anàlisi del qüestionari Biodata, revisió de motivacions i primer contacte.',
    esGlobal: true,
    ambit: 'Biodata',
    objectius: 'Comprovar la vocació pel cos de Mossos d\'Esquadra, detectar dubtes en el qüestionari i establir un clima de confiança.',
    preguntes: [
      { id: 'p1', text: 'Què et motiva principalment a voler formar part del Cos de Mossos d\'Esquadra?', pautesProfessor: 'Avaluar vocació real vs cerca d\'estabilitat laboral.' },
      { id: 'p2', text: 'Quines virtuts personals creus que pots aportar al servei policial del dia a dia?', pautesProfessor: 'Comprovar autoconeixement, humilitat i coherència amb el perfil.' },
      { id: 'p3', text: 'Com vas gestionar les preguntes situacionals del teu test Biodata?', pautesProfessor: 'Revisar si ha estat sincer o ha intentat donar respostes socialment desitjables.' },
      { id: 'p4', text: 'Tens antecedents o alguna situació personal que consideris que cal tractar amb transparència?', pautesProfessor: 'Valorar honestedat i capacitat d\'afrontar errors passats.' },
      { id: 'p5', text: 'Què opina el teu entorn proper (família/parella) sobre la teva decisió de ser mosso/a?', pautesProfessor: 'Analitzar el suport familiar i l\'estabilitat de l\'entorn.' }
    ]
  },
  {
    id: 'preset_default_2',
    titol: 'Classe 02 - Simulacre d\'Entrevista i Situacions Crítiques de Carrer',
    descripcio: 'Avaluació de l\'autocontrol sota pressió, ús proporcional de la força i comunicació assertiva.',
    esGlobal: true,
    ambit: 'Entrevista PGME',
    objectius: 'Posar a prova l\'estabilitat emocional de l\'aspirant davant provocacions o dilemes deontològics.',
    preguntes: [
      { id: 'p1', text: 'Un ciutadà t\'insulta greument durant un tall de carrer. Com reacciones seguint els protocols?', pautesProfessor: 'Detectar reactivitat o impulsivitat. Cal serenor absoluta i fermesa.' },
      { id: 'p2', text: 'El teu company de patrulla vol utilitzar la força de forma desproporcionada. Què fas exactament?', pautesProfessor: 'Avaluar respecte als drets humans, aturar el company i comunicar-ho a comandament.' },
      { id: 'p3', text: 'Explica una situació de la teva vida real on hagis viscut una forta discrepància i com la vas resoldre.', pautesProfessor: 'Cercar capacitat de mediació i negociació real.' },
      { id: 'p4', text: 'Quina diferència hi ha entre autoritat i autoritarisme segons el teu criteri policial?', pautesProfessor: 'Verificar si entén el concepte de servei públic a la ciutadania.' },
      { id: 'p5', text: 'Estàs disposat/da a ser destinat a qualsevol punt de Catalunya i a fer torns rotatius complexos?', pautesProfessor: 'Comprovar disponibilitat geogràfica i sacrifici personal.' }
    ]
  }
];

interface GestioUsuarisPsicotecnicaProps {
  darkMode: boolean;
  usuarisInicials?: any[];
}

export default function GestioUsuarisPsicotecnica({ darkMode, usuarisInicials = [] }: GestioUsuarisPsicotecnicaProps) {
  // =========================================================================
  // ESTATS PRINCIPALS DE LA PANTALLA
  // =========================================================================
  const [llistaUsuaris, setLlistaUsuaris] = useState<any[]>(usuarisInicials);
  const [cercador, setCercador] = useState('');
  const [filtreRol, setFiltreRol] = useState('tots');
  const [usuariSeleccionat, setUsuariSeleccionat] = useState<any | null>(null);
  const [carregantUsuaris, setCarregantUsuaris] = useState(false);

  // Pestanyes de navegació de l'alumne
  const [pestanyaAlumne, setPestanyaAlumne] = useState<'sessions' | 'biodata' | 'plantilles' | 'live'>('sessions');

  // =========================================================================
  // ESTATS PER AL NOU FLUX NET I SENSE SOROLL VISUAL
  // =========================================================================
  // Estat per a la confirmació prèvia d'accés a l'alumne ("Accediràs a l'alumne XXX. Vols continuar?")
  const [candidatConfirmacio, setCandidatConfirmacio] = useState<any | null>(null);
  
  // Vista principal un cop dins de l'alumne:
  // - 'menu': Les 3 opcions verticals principals
  // - 'entrevista_1v1': Opció 1 (Començar entrevista 1v1)
  // - 'info_alumne': Opció 2 (Informació de l'alumne - Biodata / Dades)
  // - 'preguntes_desades': Opció 3 (Deixar preguntes personals desades / Presets)
  const [vistaAlumne, setVistaAlumne] = useState<'menu' | 'entrevista_1v1' | 'info_alumne' | 'preguntes_desades'>('menu');

  // Sub-pestanyes superiors de l'Opció 1: "Començar entrevista 1v1"
  // 1) 'fulla_entrevista': Fulla de text on escriure directament les notes
  // 2) 'carregar_preguntes': Llista de preguntes que en fer-hi clic s'escriuen automàticament a la fulla
  // 3) 'eines_directe': Les 10 competències clau oficials en directe
  const [subPestanya1v1, setSubPestanya1v1] = useState<'fulla_entrevista' | 'carregar_preguntes' | 'eines_directe'>('fulla_entrevista');

  // Full de text ràpid per a la sessió d'entrevista en curs
  const [textFullEntrevista, setTextFullEntrevista] = useState<string>('');
  const [dataHoraEntrevista1v1, setDataHoraEntrevista1v1] = useState<string>(() => {
    const ara = new Date();
    return `${ara.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} a les ${ara.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}`;
  });
  const [sessioDesadaCorrectament, setSessioDesadaCorrectament] = useState(false);

  // =========================================================================
  // DADES DE LA PISSARRA EN DIRECTE 1V1 (LIVE STREAMING AMB L'ALUMNE)
  // =========================================================================
  const [liveCompetenciesAlumne, setLiveCompetenciesAlumne] = useState<string[]>([]);
  const [livePreguntaActual, setLivePreguntaActual] = useState<string>('');
  const [liveUltimClic, setLiveUltimClic] = useState<string>('');
  const [liveUltimaActualitzacio, setLiveUltimaActualitzacio] = useState<Date | null>(null);
  const [liveInputPregunta, setLiveInputPregunta] = useState<string>('');
  const [liveEnviantPregunta, setLiveEnviantPregunta] = useState<boolean>(false);
  const [liveProfessorCompetencies, setLiveProfessorCompetencies] = useState<string[]>([]);
  const [liveFeedbackDocent, setLiveFeedbackDocent] = useState<string>('');

  // =========================================================================
  // DADES DE SESSIONS D'ENTREVISTA
  // =========================================================================
  const [sessions, setSessions] = useState<SessioEntrevista[]>([]);
  const [carregantSessions, setCarregantSessions] = useState(false);
  const [sessioDesplegadaId, setSessioDesplegadaId] = useState<string | null>(null);

  // =========================================================================
  // DADES DE RESULTATS DEL BIODATA I PREGUNTES
  // =========================================================================
  const [resultatsBiodata, setResultatsBiodata] = useState<any | null>(null);
  const [carregantBiodata, setCarregantBiodata] = useState(false);
  const [competenciaSeleccionada, setCompetenciaSeleccionada] = useState<string | null>('HSC');
  const [bancPreguntes, setBancPreguntes] = useState<PreguntaBiodata[]>(BANC_80_PREGUNTES_BIODATA);

  // =========================================================================
  // DADES DE PLANTILLES DE CLASSES (PRESETS)
  // =========================================================================
  const [plantillesGlobals, setPlantillesGlobals] = useState<PlantillaClasse[]>(PLANTILLES_PER_DEFECTE);
  const [plantillesAlumne, setPlantillesAlumne] = useState<PlantillaClasse[]>([]);
  const [carregantPlantilles, setCarregantPlantilles] = useState(false);
  const [modalPlantillaObert, setModalPlantillaObert] = useState(false);
  const [plantillaEnEdicio, setPlantillaEnEdicio] = useState<PlantillaClasse | null>(null);

  // Formulari de plantilla
  const [formTitolPlantilla, setFormTitolPlantilla] = useState('');
  const [formDescPlantilla, setFormDescPlantilla] = useState('');
  const [formAmbitPlantilla, setFormAmbitPlantilla] = useState('Entrevista PGME');
  const [formObjectiusPlantilla, setFormObjectiusPlantilla] = useState('');
  const [formEsGlobal, setFormEsGlobal] = useState(true);
  const [formPreguntesPlantilla, setFormPreguntesPlantilla] = useState<{ id: string; text: string; pautesProfessor?: string }[]>([]);
  const [novaPreguntaText, setNovaPreguntaText] = useState('');
  const [novaPreguntaPauta, setNovaPreguntaPauta] = useState('');
  const [desantPlantilla, setDesantPlantilla] = useState(false);

  // =========================================================================
  // FORMULARI DE SESSIÓ EN DIRECTE / MODAL
  // =========================================================================
  const [modalSessioObert, setModalSessioObert] = useState(false);
  const [sessioEnEdicio, setSessioEnEdicio] = useState<SessioEntrevista | null>(null);
  const [desantSessio, setDesantSessio] = useState(false);

  // Camps de la sessió
  const [formProfessor, setFormProfessor] = useState('Professor OposiCAT');
  const [formDataSessio, setFormDataSessio] = useState(new Date().toISOString().split('T')[0]);
  const [formHoraSessio, setFormHoraSessio] = useState(new Date().toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }));
  const [formTipusSessio, setFormTipusSessio] = useState('Simulacre d\'Entrevista PGME (Mossos)');
  const [formContingut, setFormContingut] = useState('');
  const [formPuntsForts, setFormPuntsForts] = useState('');
  const [formPuntsMillora, setFormPuntsMillora] = useState('');
  const [formNotesPropera, setFormNotesPropera] = useState('');
  const [formNivell, setFormNivell] = useState<'inicial' | 'en_desenvolupament' | 'bon_nivell' | 'perfil_mossos'>('en_desenvolupament');
  const [formPreguntesSessio, setFormPreguntesSessio] = useState<PreguntaAvaluada[]>([]);
  const [plantillaUtilitzada, setPlantillaUtilitzada] = useState<{ id?: string; titol?: string }>({});

  // Modal d'importació de plantilles a la sessió
  const [modalImportarObert, setModalImportarObert] = useState(false);

  // =========================================================================
  // CARREGAR DADES INICIALS DES DE FIRESTORE
  // =========================================================================
  const carregarUsuarisBBDD = async () => {
    if (!db) return;
    setCarregantUsuaris(true);
    try {
      const snap = await getDocs(collection(db, 'usuaris'));
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLlistaUsuaris(items);
    } catch (err) {
      console.error("Error carregant usuaris a GestioUsuarisPsicotecnica:", err);
    } finally {
      setCarregantUsuaris(false);
    }
  };

  const carregarPlantillesGlobals = async () => {
    if (!db) return;
    try {
      const snap = await getDocs(collection(db, 'plantilles_classes'));
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as PlantillaClasse));
        setPlantillesGlobals(items);
      }
    } catch (err) {
      console.warn("No s'han pogut carregar plantilles globals de Firestore, fem servir per defecte:", err);
    }
  };

  const carregarBancPreguntesOficial = async () => {
    if (!db) return;
    try {
      const snap = await getDocs(collection(db, 'preguntes_biodata_oficial'));
      if (!snap.empty) {
        const llista: PreguntaBiodata[] = [];
        snap.forEach(docSnap => {
          const d = docSnap.data();
          if (!d.suspensa) {
            llista.push({
              id: d.id,
              enunciat: d.enunciat,
              competencia: d.competencia,
              opcions: d.opcions
            });
          }
        });
        if (llista.length > 0) {
          llista.sort((a, b) => a.id - b.id);
          setBancPreguntes(llista);
        }
      }
    } catch (err) {
      console.warn("Utilitzant banc de preguntes predeterminat per a preguntes de Biodata:", err);
    }
  };

  useEffect(() => {
    carregarUsuarisBBDD();
    carregarPlantillesGlobals();
    carregarBancPreguntesOficial();
  }, []);

  // =========================================================================
  // CARREGAR DADES DE L'ALUMNE SELECCIONAT
  // =========================================================================
  const carregarSessionsAlumne = async (uid: string) => {
    if (!db || !uid) return;
    setCarregantSessions(true);
    try {
      const colRef = collection(db, `usuaris/${uid}/sessions_entrevista`);
      const snap = await getDocs(colRef);
      const items: SessioEntrevista[] = snap.docs.map(d => ({
        id: d.id,
        userId: uid,
        ...(d.data() as any)
      }));
      // Ordenem de més recent a més antiga
      items.sort((a, b) => (b.dataSessio || '').localeCompare(a.dataSessio || ''));
      setSessions(items);
    } catch (err) {
      console.error("Error carregant sessions de l'alumne:", err);
    } finally {
      setCarregantSessions(false);
    }
  };

  const carregarBiodataAlumne = async (uid: string) => {
    if (!db || !uid) return;
    setCarregantBiodata(true);
    try {
      const colRef = collection(db, `usuaris/${uid}/resultats_biodata`);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        // Agafem l'últim test registrat
        const docs = snap.docs.map(d => d.data());
        docs.sort((a, b) => (b.creatEl || '').localeCompare(a.creatEl || ''));
        setResultatsBiodata(docs[0]);
      } else {
        setResultatsBiodata(null);
      }
    } catch (err) {
      console.warn("No s'han pogut carregar resultats de Biodata per a:", uid, err);
      setResultatsBiodata(null);
    } finally {
      setCarregantBiodata(false);
    }
  };

  const carregarPlantillesAlumne = async (uid: string) => {
    if (!db || !uid) return;
    try {
      const colRef = collection(db, `usuaris/${uid}/plantilles_personalitzades`);
      const snap = await getDocs(colRef);
      const items: PlantillaClasse[] = snap.docs.map(d => ({
        id: d.id,
        userId: uid,
        ...(d.data() as any)
      }));
      setPlantillesAlumne(items);
    } catch (err) {
      console.warn("No s'han pogut carregar plantilles personalitzades de l'alumne:", err);
    }
  };

  // Escoltador en temps real (onSnapshot) de la pissarra live de l'alumne seleccionat
  useEffect(() => {
    if (!usuariSeleccionat?.id || !db) return;

    const docRef = doc(db, 'usuaris', usuariSeleccionat.id, 'entrevista_live_state', 'actual');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setLiveCompetenciesAlumne(Array.isArray(d.competenciesMarcades) ? d.competenciesMarcades : []);
        setLivePreguntaActual(d.preguntaActualText || '');
        setLiveUltimClic(d.ultimClic || '');
        setLiveUltimaActualitzacio(new Date());
      } else {
        setLiveCompetenciesAlumne([]);
        setLivePreguntaActual('');
        setLiveUltimClic('');
        setLiveUltimaActualitzacio(null);
      }
    }, (err) => {
      console.warn("Error escoltant pissarra live de l'alumne:", err);
    });

    return () => unsub();
  }, [usuariSeleccionat?.id]);

  // Accions de control de la pissarra live per part del professor
  const handleEnviarPreguntaLive = async () => {
    if (!usuariSeleccionat?.id || !db || !liveInputPregunta.trim()) return;
    setLiveEnviantPregunta(true);
    try {
      const docRef = doc(db, 'usuaris', usuariSeleccionat.id, 'entrevista_live_state', 'actual');
      await setDoc(docRef, {
        preguntaActualText: liveInputPregunta.trim(),
        competenciesMarcades: [],
        ultimaActualitzacio: serverTimestamp(),
        ultimClic: 'nova_pregunta'
      }, { merge: true });
      setLivePreguntaActual(liveInputPregunta.trim());
      setLiveCompetenciesAlumne([]);
      setLiveProfessorCompetencies([]);
      setLiveInputPregunta('');
    } catch (err) {
      console.error("Error enviant pregunta a la pissarra live:", err);
    } finally {
      setLiveEnviantPregunta(false);
    }
  };

  const handleNetejarPissarraLive = async () => {
    if (!usuariSeleccionat?.id || !db) return;
    try {
      const docRef = doc(db, 'usuaris', usuariSeleccionat.id, 'entrevista_live_state', 'actual');
      await setDoc(docRef, {
        competenciesMarcades: [],
        preguntaActualText: '',
        ultimaActualitzacio: serverTimestamp(),
        ultimClic: 'netejar'
      }, { merge: true });
      setLiveCompetenciesAlumne([]);
      setLivePreguntaActual('');
      setLiveProfessorCompetencies([]);
    } catch (err) {
      console.error("Error netejant pissarra live:", err);
    }
  };

  const handleToggleProfessorComp = (codi: string) => {
    if (liveProfessorCompetencies.includes(codi)) {
      setLiveProfessorCompetencies(liveProfessorCompetencies.filter(c => c !== codi));
    } else {
      setLiveProfessorCompetencies([...liveProfessorCompetencies, codi]);
    }
  };

  const handleDesarPreguntaLiveADiari = () => {
    // Obrim el modal de sessió amb la pregunta actual i les competències ja pre-emplenades
    handleObrirNovaSessio();
    if (livePreguntaActual || liveCompetenciesAlumne.length > 0) {
      const resumCompetencies = liveCompetenciesAlumne.map(c => {
        const item = COMPETENCIES_ENTREVISTA_LIVE_10.find(m => m.id === c);
        return item?.titol || c;
      }).join(', ');

      setFormPreguntesSessio([{
        id: `preg_${Date.now()}`,
        enunciat: livePreguntaActual || 'Pregunta de situació pràctica formulada en directe',
        respostaAlumne: `Competències clau identificades per l'aspirant: ${resumCompetencies || 'Cap marcada'}`,
        valoracioDocent: liveFeedbackDocent || 'Sessió interactiva 1v1 registrada des de la pissarra en directe.',
        puntuacio: undefined
      }]);
    }
  };

  // Quan es fa clic a un alumne de la llista de l'esquerra:
  // Obrim el diàleg de confirmació: "Accediràs a l'alumne XXX. Vols continuar?"
  const handleDemanarConfirmacioUsuari = (u: any) => {
    setCandidatConfirmacio(u);
  };

  // Quan es confirma que realment volem entrar a l'alumne:
  const handleConfirmarAccesUsuari = () => {
    if (!candidatConfirmacio) return;
    const u = candidatConfirmacio;
    setUsuariSeleccionat(u);
    setCandidatConfirmacio(null);
    setVistaAlumne('menu'); // Mostra el menú principal de 3 opcions
    setSubPestanya1v1('fulla_entrevista');
    
    // Inicialitzem data/hora actual de l'entrevista
    const ara = new Date();
    setDataHoraEntrevista1v1(`${ara.toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} a les ${ara.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}`);
    setTextFullEntrevista(`=== SESSIÓ D'ENTREVISTA 1v1 ===\nAlumne: ${u.displayName || u.email}\nData i hora: ${ara.toLocaleDateString('ca-ES')} a les ${ara.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}\nDocent: ${auth?.currentUser?.displayName ? `Prof. ${auth.currentUser.displayName}` : 'Professor OposiCAT'}\n----------------------------------------\n\n[NOTES I RESPOSTES DE L'ALUMNE]:\n`);

    carregarSessionsAlumne(u.id);
    carregarBiodataAlumne(u.id);
    carregarPlantillesAlumne(u.id);
  };

  // Tancar o canviar d'alumne per tornar a la llista neta d'alumnes
  const handleTornarALlistaAlumnes = () => {
    setUsuariSeleccionat(null);
    setCandidatConfirmacio(null);
    setVistaAlumne('menu');
  };

  // Funció per carregar una pregunta fent clic directament des del banc/plantilles al full de text
  const handleAfegirPreguntaAFulla = (textPregunta: string, pautaDocent?: string) => {
    const nouText = `\n▶ PREGUNTA: ${textPregunta}${pautaDocent ? `\n(Pauta docent: ${pautaDocent})` : ''}\nResposta de l'aspirant: \n`;
    setTextFullEntrevista((prev) => prev + nouText);
    setSubPestanya1v1('fulla_entrevista'); // Retorna a la fulla automàticament
  };

  // Desar ràpidament el text de la fulla al diari de sessions de Firestore
  const handleDesarFullaADiari = async () => {
    if (!usuariSeleccionat || !db) return;
    if (!textFullEntrevista.trim()) {
      alert("La fulla d'entrevista està buida.");
      return;
    }

    try {
      const colRef = collection(db, `usuaris/${usuariSeleccionat.id}/sessions_entrevista`);
      const ara = new Date();
      const payload: any = {
        userId: usuariSeleccionat.id,
        dataSessio: ara.toISOString().split('T')[0],
        horaSessio: ara.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }),
        professorNom: auth?.currentUser?.displayName ? `Prof. ${auth.currentUser.displayName}` : 'Professor OposiCAT',
        tipusSessio: 'Entrevista 1v1 en Directe',
        contingutConversa: textFullEntrevista,
        puntsForts: '',
        puntsMillora: '',
        notesProperaClasse: '',
        nivellPreparacio: 'en_desenvolupament',
        preguntesAvaluades: [],
        createdAt: serverTimestamp(),
        actualitzatEl: serverTimestamp()
      };

      await addDoc(colRef, payload);
      await carregarSessionsAlumne(usuariSeleccionat.id);
      setSessioDesadaCorrectament(true);
      setTimeout(() => setSessioDesadaCorrectament(false), 3500);
    } catch (err) {
      console.error("Error desant sessió de text:", err);
      alert("S'ha produït un error en desar la fulla d'entrevista.");
    }
  };

  const handleSeleccionarUsuari = (u: any) => {
    handleDemanarConfirmacioUsuari(u);
  };

  // =========================================================================
  // GESTIÓ DEL FORMULARI DE SESSIÓ EN DIRECTE
  // =========================================================================
  const handleObrirNovaSessio = (plantillaBase?: PlantillaClasse) => {
    setSessioEnEdicio(null);
    setFormProfessor(auth?.currentUser?.displayName ? `Prof. ${auth.currentUser.displayName}` : 'Professor OposiCAT');
    setFormDataSessio(new Date().toISOString().split('T')[0]);
    setFormHoraSessio(new Date().toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' }));
    setFormTipusSessio(plantillaBase ? plantillaBase.ambit : 'Simulacre d\'Entrevista PGME (Mossos)');
    setFormContingut('');
    setFormPuntsForts('');
    setFormPuntsMillora('');
    setFormNotesPropera('');
    setFormNivell('en_desenvolupament');

    if (plantillaBase) {
      setPlantillaUtilitzada({ id: plantillaBase.id, titol: plantillaBase.titol });
      const preguntesImportades: PreguntaAvaluada[] = plantillaBase.preguntes.map((p, idx) => ({
        id: `preg_${Date.now()}_${idx}`,
        enunciat: p.text,
        respostaAlumne: '',
        valoracioDocent: p.pautesProfessor ? `Pauta docent: ${p.pautesProfessor}` : '',
        puntuacio: undefined
      }));
      setFormPreguntesSessio(preguntesImportades);
    } else {
      setPlantillaUtilitzada({});
      setFormPreguntesSessio([]);
    }

    setModalSessioObert(true);
  };

  const handleObrirEdicioSessio = (sessio: SessioEntrevista) => {
    setSessioEnEdicio(sessio);
    setFormProfessor(sessio.professorNom || 'Professor OposiCAT');
    setFormDataSessio(sessio.dataSessio || '');
    setFormHoraSessio(sessio.horaSessio || '');
    setFormTipusSessio(sessio.tipusSessio || '');
    setFormContingut(sessio.contingutConversa || '');
    setFormPuntsForts(sessio.puntsForts || '');
    setFormPuntsMillora(sessio.puntsMillora || '');
    setFormNotesPropera(sessio.notesProperaClasse || '');
    setFormNivell(sessio.nivellPreparacio || 'en_desenvolupament');
    setFormPreguntesSessio(sessio.preguntesAvaluades || []);
    setPlantillaUtilitzada({
      id: sessio.plantillaUtilitzadaId,
      titol: sessio.plantillaUtilitzadaTitol
    });
    setModalSessioObert(true);
  };

  const handleImportarPlantillaASessio = (plantilla: PlantillaClasse) => {
    setPlantillaUtilitzada({ id: plantilla.id, titol: plantilla.titol });
    if (plantilla.ambit) setFormTipusSessio(plantilla.ambit);

    const novesPreguntes: PreguntaAvaluada[] = plantilla.preguntes.map((p, idx) => ({
      id: `preg_${Date.now()}_${idx}`,
      enunciat: p.text,
      respostaAlumne: '',
      valoracioDocent: p.pautesProfessor ? `Pauta: ${p.pautesProfessor}` : '',
      puntuacio: undefined
    }));

    setFormPreguntesSessio(prev => [...prev, ...novesPreguntes]);
    setModalImportarObert(false);
  };

  const handleAfegirPreguntaManualSessio = () => {
    setFormPreguntesSessio(prev => [
      ...prev,
      {
        id: `preg_${Date.now()}`,
        enunciat: '',
        respostaAlumne: '',
        valoracioDocent: '',
        puntuacio: undefined
      }
    ]);
  };

  const handleModificarPreguntaSessio = (index: number, camp: keyof PreguntaAvaluada, valor: any) => {
    setFormPreguntesSessio(prev => {
      const arr = [...prev];
      arr[index] = { ...arr[index], [camp]: valor };
      return arr;
    });
  };

  const handleEliminarPreguntaSessio = (index: number) => {
    setFormPreguntesSessio(prev => prev.filter((_, i) => i !== index));
  };

  const handleDesarSessio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuariSeleccionat || !db) return;

    setDesantSessio(true);
    try {
      const payload: any = {
        userId: usuariSeleccionat.id,
        professorNom: formProfessor.trim() || 'Professor OposiCAT',
        dataSessio: formDataSessio,
        horaSessio: formHoraSessio,
        tipusSessio: formTipusSessio,
        contingutConversa: formContingut.trim(),
        puntsForts: formPuntsForts.trim(),
        puntsMillora: formPuntsMillora.trim(),
        notesProperaClasse: formNotesPropera.trim(),
        nivellPreparacio: formNivell,
        preguntesAvaluades: formPreguntesSessio,
        plantillaUtilitzadaId: plantillaUtilitzada.id || null,
        plantillaUtilitzadaTitol: plantillaUtilitzada.titol || null,
        actualitzatEl: serverTimestamp()
      };

      if (sessioEnEdicio) {
        const docRef = doc(db, `usuaris/${usuariSeleccionat.id}/sessions_entrevista/${sessioEnEdicio.id}`);
        await updateDoc(docRef, payload);
      } else {
        payload.createdAt = serverTimestamp();
        const colRef = collection(db, `usuaris/${usuariSeleccionat.id}/sessions_entrevista`);
        await addDoc(colRef, payload);
      }

      await carregarSessionsAlumne(usuariSeleccionat.id);
      setModalSessioObert(false);
    } catch (err) {
      console.error("Error desant sessió d'entrevista:", err);
      alert("No s'ha pogut desar la sessió a la base de dades.");
    } finally {
      setDesantSessio(false);
    }
  };

  const handleEsborrarSessio = async (sessioId: string) => {
    if (!usuariSeleccionat || !db) return;
    if (!window.confirm("Segur que vols eliminar el registre d'aquesta sessió?")) return;

    try {
      const docRef = doc(db, `usuaris/${usuariSeleccionat.id}/sessions_entrevista/${sessioId}`);
      await deleteDoc(docRef);
      setSessions(prev => prev.filter(s => s.id !== sessioId));
    } catch (err) {
      console.error("Error esborrant la sessió:", err);
      alert("Error eliminant la sessió.");
    }
  };

  // =========================================================================
  // GESTIÓ DE PLANTILLES DE CLASSES (PRESETS)
  // =========================================================================
  const handleObrirCrearPlantilla = (esGlobalDefault = true) => {
    setPlantillaEnEdicio(null);
    setFormTitolPlantilla(
      !esGlobalDefault && usuariSeleccionat
        ? `${usuariSeleccionat.displayName || 'Alumne'} - Sessió 02`
        : 'Classe 1 - Genèrica'
    );
    setFormDescPlantilla('');
    setFormAmbitPlantilla('Entrevista PGME');
    setFormObjectiusPlantilla('');
    setFormEsGlobal(esGlobalDefault);
    setFormPreguntesPlantilla([
      { id: 'p1', text: 'Com valores la teva evolució respecte a la sessió anterior?', pautesProfessor: 'Avaluar autocrítica i preparació.' }
    ]);
    setNovaPreguntaText('');
    setNovaPreguntaPauta('');
    setModalPlantillaObert(true);
  };

  const handleObrirEditarPlantilla = (plantilla: PlantillaClasse) => {
    setPlantillaEnEdicio(plantilla);
    setFormTitolPlantilla(plantilla.titol);
    setFormDescPlantilla(plantilla.descripcio || '');
    setFormAmbitPlantilla(plantilla.ambit || 'Entrevista PGME');
    setFormObjectiusPlantilla(plantilla.objectius || '');
    setFormEsGlobal(plantilla.esGlobal);
    setFormPreguntesPlantilla(plantilla.preguntes || []);
    setNovaPreguntaText('');
    setNovaPreguntaPauta('');
    setModalPlantillaObert(true);
  };

  const handleAfegirPreguntaAPlantilla = () => {
    if (!novaPreguntaText.trim()) return;
    setFormPreguntesPlantilla(prev => [
      ...prev,
      {
        id: `p_${Date.now()}`,
        text: novaPreguntaText.trim(),
        pautesProfessor: novaPreguntaPauta.trim() || undefined
      }
    ]);
    setNovaPreguntaText('');
    setNovaPreguntaPauta('');
  };

  const handleEliminarPreguntaDePlantilla = (index: number) => {
    setFormPreguntesPlantilla(prev => prev.filter((_, i) => i !== index));
  };

  const handleDesarPlantilla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitolPlantilla.trim() || !db) return;

    setDesantPlantilla(true);
    try {
      const payload: any = {
        titol: formTitolPlantilla.trim(),
        descripcio: formDescPlantilla.trim(),
        ambit: formAmbitPlantilla,
        objectius: formObjectiusPlantilla.trim(),
        esGlobal: formEsGlobal,
        preguntes: formPreguntesPlantilla,
        actualitzatEl: serverTimestamp()
      };

      if (formEsGlobal) {
        // Desa com a plantilla global a 'plantilles_classes'
        if (plantillaEnEdicio && plantillaEnEdicio.esGlobal) {
          await updateDoc(doc(db, `plantilles_classes/${plantillaEnEdicio.id}`), payload);
        } else {
          payload.createdAt = serverTimestamp();
          await addDoc(collection(db, 'plantilles_classes'), payload);
        }
        await carregarPlantillesGlobals();
      } else {
        // Desa com a plantilla personalitzada de l'alumne
        if (!usuariSeleccionat) {
          alert("Has de seleccionar un alumne per desar una plantilla personalitzada.");
          setDesantPlantilla(false);
          return;
        }
        payload.userId = usuariSeleccionat.id;
        if (plantillaEnEdicio && !plantillaEnEdicio.esGlobal) {
          await updateDoc(doc(db, `usuaris/${usuariSeleccionat.id}/plantilles_personalitzades/${plantillaEnEdicio.id}`), payload);
        } else {
          payload.createdAt = serverTimestamp();
          await addDoc(collection(db, `usuaris/${usuariSeleccionat.id}/plantilles_personalitzades`), payload);
        }
        await carregarPlantillesAlumne(usuariSeleccionat.id);
      }

      setModalPlantillaObert(false);
      alert("Plantilla de classe desada correctament!");
    } catch (err) {
      console.error("Error desant plantilla de classe:", err);
      alert("Error en desar la plantilla a la base de dades.");
    } finally {
      setDesantPlantilla(false);
    }
  };

  const handleEliminarPlantilla = async (plantilla: PlantillaClasse) => {
    if (!window.confirm(`Segur que vols eliminar la plantilla "${plantilla.titol}"?`)) return;
    if (!db) return;

    try {
      if (plantilla.esGlobal) {
        await deleteDoc(doc(db, `plantilles_classes/${plantilla.id}`));
        await carregarPlantillesGlobals();
      } else if (usuariSeleccionat) {
        await deleteDoc(doc(db, `usuaris/${usuariSeleccionat.id}/plantilles_personalitzades/${plantilla.id}`));
        await carregarPlantillesAlumne(usuariSeleccionat.id);
      }
    } catch (err) {
      console.error("Error eliminant plantilla:", err);
      alert("Error en eliminar la plantilla.");
    }
  };

  // =========================================================================
  // OBTENIR PREGUNTES I RESPOSTES DE LA COMPETÈNCIA SELECCIONADA EN EL BIODATA
  // =========================================================================
  const obtenirPreguntesDeCompetencia = (compId: string) => {
    const preguntesComp = bancPreguntes.filter(p => p.competencia === compId);
    return preguntesComp.map(preg => {
      // Trobem l'índex global d'aquesta pregunta al banc per recuperar la resposta que va triar l'alumne
      const indexGlobal = bancPreguntes.findIndex(bp => bp.id === preg.id);
      const indexRespostaUsuari = resultatsBiodata?.respostesUsuari?.[indexGlobal];
      const opcioTriada = indexRespostaUsuari !== null && indexRespostaUsuari !== undefined 
        ? preg.opcions[indexRespostaUsuari] 
        : null;

      return {
        pregunta: preg,
        indexRespostaUsuari,
        opcioTriada
      };
    });
  };

  // Filtratge d'usuaris per a la llista de l'esquerra
  const usuarisFiltrats = llistaUsuaris.filter(u => {
    const textMatch = 
      (u.displayName || '').toLowerCase().includes(cercador.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(cercador.toLowerCase()) ||
      (u.id || '').toLowerCase().includes(cercador.toLowerCase());
    
    if (filtreRol === 'tots') return textMatch;
    return textMatch && (u.rol === filtreRol);
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* CAPÇALERA SUPERIOR AMB ACCIONS RÀPIDES */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${
        darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/10 text-purple-600 rounded-xl">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 className={`text-xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Espai Psicopedagògic i Entrevistes OposiCAT
            </h2>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Registra sessions d'entrevistes pregunta a pregunta, importa plantilles de classes, analitza les 10 competències del Biodata i prepara sessions d'alt nivell.
            </p>
          </div>
        </div>

        <button
          onClick={carregarUsuarisBBDD}
          disabled={carregantUsuaris}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
            darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <RefreshCw size={14} className={carregantUsuaris ? 'animate-spin' : ''} />
          Refrescar Alumnes BBDD
        </button>
      </div>

      {/* MODAL / DIÀLEG DE CONFIRMACIÓ PER ACCEDIR A L'ALUMNE ("Accediràs a l'alumne XXX. Vols continuar?") */}
      {candidatConfirmacio && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-150 ${
            darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-600 flex items-center justify-center font-black text-xl shrink-0">
                {(candidatConfirmacio.displayName || candidatConfirmacio.email || "A").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className={`text-base font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                  Confirmar accés a l'alumne
                </h3>
                <p className="text-xs text-slate-400">
                  Verificació de seguretat de l'entrevista
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border text-center flex flex-col gap-1.5 ${
              darkMode ? "bg-slate-800/80 border-slate-700" : "bg-purple-50/60 border-purple-100"
            }`}>
              <p className={`text-xs ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                Accediràs a l'alumne:
              </p>
              <p className="text-base font-black text-purple-600 dark:text-purple-400">
                "{candidatConfirmacio.displayName || candidatConfirmacio.email}"
              </p>
              <p className={`text-xs font-bold mt-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                Vols continuar?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCandidatConfirmacio(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  darkMode ? "text-slate-400 hover:text-white bg-slate-800" : "text-slate-600 hover:text-slate-900 bg-slate-100"
                }`}
              >
                No, cancel·lar
              </button>
              <button
                type="button"
                onClick={handleConfirmarAccesUsuari}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Check size={16} />
                Sí, accedir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAS 1: CAP ALUMNE SELECCIONAT -> MOSTRA LA LLISTA D'ALUMNES COMPLETA SENSE SOROLL */}
      {!usuariSeleccionat ? (
        <div className={`w-full max-w-4xl mx-auto rounded-2xl border p-6 flex flex-col gap-5 shadow-sm ${
          darkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h3 className={`text-base font-black uppercase tracking-wider flex items-center gap-2 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                <Users size={18} className="text-purple-500" />
                Alumnes Registrats ({usuarisFiltrats.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Fes clic a qualsevol opositor per obrir el seu espai net d'entrevista i tutoria.
              </p>
            </div>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-500/10 px-3 py-1 rounded-full self-start sm:self-auto">
              Selecciona un alumne per començar
            </span>
          </div>

          {/* CERCA I FILTRE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cercar per nom, cognom o correu..."
                value={cercador}
                onChange={(e) => setCercador(e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border outline-none transition-all ${
                  darkMode ? "bg-slate-900/80 border-slate-700 text-white focus:border-purple-500" : "bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-500"
                }`}
              />
            </div>

            <select
              value={filtreRol}
              onChange={(e) => setFiltreRol(e.target.value)}
              className={`w-full py-2.5 px-3 text-xs rounded-xl border outline-none ${
                darkMode ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <option value="tots">Tots els rols</option>
              <option value="usuari_alpha">Usuaris Alpha</option>
              <option value="opositor">Opositors</option>
              <option value="alumne">Alumnes</option>
              <option value="admin">Administradors</option>
            </select>
          </div>

          {/* LLISTAT D'ALUMNES EN FORMAT TARGETA NET */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {carregantUsuaris ? (
              <div className="col-span-2 py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw size={20} className="animate-spin text-purple-500" />
                Carregant alumnes de Firestore...
              </div>
            ) : usuarisFiltrats.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-xs text-slate-400">
                No s'ha trobat cap alumne amb aquest criteri de cerca.
              </div>
            ) : (
              usuarisFiltrats.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSeleccionarUsuari(u)}
                  className={`text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                    darkMode
                      ? "bg-slate-900/60 border-slate-700/60 hover:bg-purple-950/30 hover:border-purple-500"
                      : "bg-slate-50 border-slate-200/80 hover:bg-purple-50 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      {(u.displayName || u.email || "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className={`text-xs font-black truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 ${darkMode ? "text-white" : "text-slate-800"}`}>
                        {u.displayName || "Sense nom assignat"}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {u.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                      u.rol === "admin" 
                        ? "bg-red-500/10 text-red-500" 
                        : u.rol === "usuari_alpha"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {u.rol || "alumne"}
                    </span>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        /* CAS 2: ALUMNE SELECCIONAT -> S'ELIMINA COMPLETAMENT LA LLISTA DE L'ESQUERRA PER EVITAR SOROLL VISUAL */
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* BARRA SUPERIOR DE L'ALUMNE AMB BOTÓ PER TORNAR / CANVIAR D'ALUMNE */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
            darkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center gap-3.5">
              <button
                onClick={handleTornarALlistaAlumnes}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                  darkMode ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
                title="Tornar a la llista d'alumnes"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-base shadow-md">
                {(usuariSeleccionat.displayName || usuariSeleccionat.email || "A").charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                    {usuariSeleccionat.displayName || "Alumne sense nom"}
                  </h3>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    usuariSeleccionat.rol === "admin" ? "bg-red-500/10 text-red-500" : "bg-purple-500/10 text-purple-500"
                  }`}>
                    {usuariSeleccionat.rol || "opositor"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{usuariSeleccionat.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleTornarALlistaAlumnes}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-purple-500 transition-all flex items-center gap-1.5"
              >
                <Users size={14} />
                <span>Canviar d'alumne</span>
              </button>
            </div>
          </div>

          {/* VISTA 1: MENÚ PRINCIPAL AMB ELS 3 BOTONS EN VERTICAL */}
          {vistaAlumne === "menu" && (
            <div className={`p-8 sm:p-10 rounded-2xl border flex flex-col gap-6 shadow-sm ${
              darkMode ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200"
            }`}>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-500">
                  Opcions de treball
                </span>
                <h3 className={`text-lg font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                  Què vols fer amb {usuariSeleccionat.displayName?.split(" ")[0] || "aquest alumne"}?
                </h3>
              </div>

              {/* ELS 3 BOTONS EN VERTICAL */}
              <div className="flex flex-col gap-4">
                {/* BOTÓ 1: COMENÇAR ENTREVISTA 1V1 */}
                <button
                  onClick={() => {
                    setVistaAlumne("entrevista_1v1");
                    setSubPestanya1v1("fulla_entrevista");
                  }}
                  id="btn-opcio-1-entrevista-1v1"
                  className={`w-full p-5 sm:p-6 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all duration-150 group cursor-pointer ${
                    darkMode
                      ? "bg-slate-900/90 border-purple-500/40 hover:border-purple-500 hover:bg-purple-950/20 shadow-md"
                      : "bg-purple-50/50 border-purple-200 hover:border-purple-400 hover:bg-purple-50 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      1
                    </div>
                    <div>
                      <h4 className={`text-base font-black tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 ${darkMode ? "text-white" : "text-slate-800"}`}>
                        Començar entrevista 1v1
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Fulla de notes en viu, banc de preguntes interactiu i eines en directe sincronitzades.
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-purple-500 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                {/* BOTÓ 2: INFORMACIÓ DE L'ALUMNE */}
                <button
                  onClick={() => {
                    setVistaAlumne("info_alumne");
                    setPestanyaAlumne("biodata");
                  }}
                  id="btn-opcio-2-info-alumne"
                  className={`w-full p-5 sm:p-6 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all duration-150 group cursor-pointer ${
                    darkMode
                      ? "bg-slate-900/70 border-slate-700 hover:border-indigo-500 hover:bg-slate-900"
                      : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      2
                    </div>
                    <div>
                      <h4 className={`text-base font-black tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${darkMode ? "text-white" : "text-slate-800"}`}>
                        Informació de l'alumne
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Consulta les respostes del Biodata (10 competències clau) i el diari històric de tutories anteriors.
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-indigo-500 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                {/* BOTÓ 3: DEIXAR PREGUNTES PERSONALS DESADES */}
                <button
                  onClick={() => {
                    setVistaAlumne("preguntes_desades");
                    setPestanyaAlumne("plantilles");
                  }}
                  id="btn-opcio-3-preguntes-desades"
                  className={`w-full p-5 sm:p-6 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all duration-150 group cursor-pointer ${
                    darkMode
                      ? "bg-slate-900/70 border-slate-700 hover:border-amber-500 hover:bg-slate-900"
                      : "bg-slate-50 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      3
                    </div>
                    <div>
                      <h4 className={`text-base font-black tracking-tight group-hover:text-amber-500 dark:group-hover:text-amber-400 ${darkMode ? "text-white" : "text-slate-800"}`}>
                        Deixar preguntes personals desades
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Prepara presets, fulls de ruta i bancs de preguntes específics abans de la sessió.
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPCIÓ 1: COMENÇAR ENTREVISTA 1V1 (AMB DATA/HORA I ELS 3 BOTONS SUPERIORS) */}
          {/* ========================================================================= */}
          {vistaAlumne === "entrevista_1v1" && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              
              {/* ENCAPÇALAMENT SUPERIOR: CONFIRMACIÓ DE DIA I HORA D'ENTREVISTA */}
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                darkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600/10 text-purple-600 rounded-xl">
                    <Clock size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">
                      Sessió d'Entrevista 1v1
                    </span>
                    <h3 className={`text-sm sm:text-base font-black ${darkMode ? "text-white" : "text-slate-800"}`}>
                      Entrevista amb {usuariSeleccionat.displayName || usuariSeleccionat.email}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar size={13} className="text-purple-500" />
                      <span>{dataHoraEntrevista1v1}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVistaAlumne("menu")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      darkMode ? "bg-slate-900 border-slate-700 text-slate-300 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Tornar al menú
                  </button>
                  <button
                    onClick={handleDesarFullaADiari}
                    id="btn-desar-fulla-notes"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Desar Sessió</span>
                  </button>
                </div>
              </div>

              {/* NOTIFICACIÓ DE DESAT CORRECTE */}
              {sessioDesadaCorrectament && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} />
                  <span>Sessió d'entrevista desada correctament al diari de l'alumne!</span>
                </div>
              )}

              {/* ELS 3 BOTONS SUPERIORS: Entrevista | Carregar preguntes | Eines en directe */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setSubPestanya1v1("fulla_entrevista")}
                  id="tab-sub-1v1-entrevista"
                  className={`p-3.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    subPestanya1v1 === "fulla_entrevista"
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                      : darkMode
                      ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <FileText size={16} />
                  <span>1. Entrevista (Full de Text)</span>
                </button>

                <button
                  onClick={() => setSubPestanya1v1("carregar_preguntes")}
                  id="tab-sub-1v1-carregar-preguntes"
                  className={`p-3.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    subPestanya1v1 === "carregar_preguntes"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                      : darkMode
                      ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ClipboardList size={16} />
                  <span>2. Carregar Preguntes</span>
                </button>

                <button
                  onClick={() => setSubPestanya1v1("eines_directe")}
                  id="tab-sub-1v1-eines-directe"
                  className={`p-3.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    subPestanya1v1 === "eines_directe"
                      ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20"
                      : darkMode
                      ? "bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-800"
                      : "bg-white border-slate-200 text-amber-600 hover:bg-amber-50/50"
                  }`}
                >
                  <Radio size={16} className={subPestanya1v1 === "eines_directe" ? "animate-pulse" : ""} />
                  <span>3. Eines en Directe (10 Comp.)</span>
                  {liveCompetenciesAlumne.length > 0 && (
                    <span className="bg-slate-950 text-emerald-400 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {liveCompetenciesAlumne.length}
                    </span>
                  )}
                </button>
              </div>

              {/* CONTINGUT SUB-PESTANYA 1: FULLA D'ENTREVISTA ON POSAR TEXT */}
              {subPestanya1v1 === "fulla_entrevista" && (
                <div className={`p-6 rounded-2xl border flex flex-col gap-4 shadow-sm ${
                  darkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                        <FileText size={16} className="text-purple-500" />
                        Full de Notes de l'Entrevista
                      </h4>
                      <p className="text-xs text-slate-400">
                        Escriu lliurement durant l'entrevista o fes clic a "Carregar preguntes" per afegir-les directament aquí.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTextFullEntrevista("")}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        Netejar full
                      </button>
                      <button
                        onClick={handleDesarFullaADiari}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        <Save size={13} />
                        Desar al diari
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={16}
                    value={textFullEntrevista}
                    onChange={(e) => setTextFullEntrevista(e.target.value)}
                    placeholder="Escriu aquí les preguntes formulades, les respostes de l'aspirant, el to de veu, la comunicació no verbal..."
                    className={`w-full p-4 text-xs sm:text-sm font-mono leading-relaxed rounded-xl border outline-none transition-all resize-y ${
                      darkMode
                        ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-purple-500"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-500"
                    }`}
                  />
                </div>
              )}

              {/* CONTINGUT SUB-PESTANYA 2: CARREGAR PREGUNTES (EN FER CLIC ESCRIU EL TEXT A L'ENTREVISTA) */}
              {subPestanya1v1 === "carregar_preguntes" && (
                <div className={`p-6 rounded-2xl border flex flex-col gap-5 shadow-sm ${
                  darkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                    <div>
                      <h4 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                        <ClipboardList size={16} className="text-indigo-500" />
                        Banc de Preguntes per a l'Entrevista
                      </h4>
                      <p className="text-xs text-slate-400">
                        Fes clic a qualsevol pregunta per afegir-la automàticament al teu Full de Notes de l'Entrevista.
                      </p>
                    </div>

                    <button
                      onClick={() => setSubPestanya1v1("fulla_entrevista")}
                      className="px-3.5 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg self-start sm:self-auto"
                    >
                      Veure Full de Notes
                    </button>
                  </div>

                  {/* PREGUNTES DELS PRESETS DE L'ALUMNE */}
                  {plantillesAlumne.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h5 className={`text-xs font-black uppercase tracking-wider text-indigo-500 flex items-center gap-2`}>
                        <UserCheck size={14} />
                        Preguntes Personalitzades per a {usuariSeleccionat.displayName || "l'alumne"}:
                      </h5>
                      <div className="flex flex-col gap-2">
                        {plantillesAlumne.flatMap(pl => pl.preguntes).map((preg, idx) => (
                          <button
                            key={`p_alumne_${idx}`}
                            onClick={() => handleAfegirPreguntaAFulla(preg.text, preg.pautesProfessor)}
                            className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all group ${
                              darkMode ? "bg-slate-900/80 border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-900" : "bg-indigo-50/50 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <p className={`text-xs font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                                  {preg.text}
                                </p>
                                {preg.pautesProfessor && (
                                  <p className="text-[11px] text-amber-500 italic mt-0.5">
                                    Pauta: {preg.pautesProfessor}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-indigo-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                              + Afegir a l'entrevista
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PREGUNTES DE LES PLANTILLES GLOBALS */}
                  <div className="flex flex-col gap-3">
                    <h5 className={`text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-2`}>
                      <Layers size={14} />
                      Banc de Preguntes de Classes Globals ({plantillesGlobals.length} plantilles disponibles):
                    </h5>
                    
                    <div className="flex flex-col gap-4">
                      {plantillesGlobals.map((pl) => (
                        <div key={pl.id} className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
                          darkMode ? "bg-slate-900/60 border-slate-700" : "bg-slate-50 border-slate-200"
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-purple-500">{pl.titol} ({pl.ambit})</span>
                            <span className="text-[10px] text-slate-400 font-bold">{pl.preguntes.length} preguntes</span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {pl.preguntes.map((preg, idx) => (
                              <button
                                key={preg.id || idx}
                                onClick={() => handleAfegirPreguntaAFulla(preg.text, preg.pautesProfessor)}
                                className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between gap-3 transition-all ${
                                  darkMode ? "bg-slate-800/80 border-slate-700 hover:border-purple-400 hover:bg-slate-800" : "bg-white border-slate-200 hover:border-purple-400 hover:bg-purple-50/50"
                                }`}
                              >
                                <span className={`font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                                  {preg.text}
                                </span>
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded shrink-0">
                                  + Inserir
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTINGUT SUB-PESTANYA 3: EINES EN DIRECTE (10 COMPETÈNCIES CLAU) */}
              {subPestanya1v1 === "eines_directe" && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                  {/* CAPÇALERA D'ESTAT LIVE I CONTROLS */}
                  <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${
                    darkMode ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Radio size={22} className="animate-pulse" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-black uppercase tracking-tight ${darkMode ? "text-white" : "text-slate-800"}`}>
                            Sessió 1v1 en Directe
                          </h3>
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Sincronitzat en viu
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Connectat amb <span className="font-bold text-amber-400">{usuariSeleccionat.displayName || usuariSeleccionat.email}</span>. Les pulsacions que faci al seu mòbil es reflectiran aquí a l'instant.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={handleNetejarPissarraLive}
                        id="btn-netejar-pissarra-live"
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Netejar selecció per a la següent pregunta"
                      >
                        <RotateCcw size={14} />
                        <span>Netejar Pissarra</span>
                      </button>

                      <button
                        onClick={handleDesarPreguntaLiveADiari}
                        id="btn-desar-live-a-diari"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Desar a Diari</span>
                      </button>
                    </div>
                  </div>

                  {/* FORMULADOR DE PREGUNTES / PAUTES EN DIRECTE */}
                  <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col gap-3 ${
                    darkMode ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Zap size={14} />
                        <span>Enviar Pregunta o Situació Pràctica al mòbil de l'alumne</span>
                      </label>
                      <span className="text-[10px] text-slate-400 italic">
                        L'alumne veurà aquest text a la seva pantalla
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={liveInputPregunta}
                        onChange={(e) => setLiveInputPregunta(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEnviarPreguntaLive();
                        }}
                        placeholder="Ex: En un control d'alcoholèmia, el conductor es nega a bufar i us insulta davant dels acompanyants..."
                        className={`w-full px-4 py-2.5 text-xs rounded-xl border outline-none font-medium transition-all ${
                          darkMode ? "bg-slate-950 border-slate-700 text-white focus:border-amber-400" : "bg-white border-slate-300 text-slate-800 focus:border-amber-500"
                        }`}
                      />
                      <button
                        onClick={handleEnviarPreguntaLive}
                        disabled={liveEnviantPregunta || !liveInputPregunta.trim()}
                        id="btn-enviar-pregunta-live"
                        className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 cursor-pointer shadow-md transition-all"
                      >
                        <Send size={13} />
                        <span>Enviar</span>
                      </button>
                    </div>

                    {/* TARGETA DE PREGUNTA ACTUAL EN DIRECTE */}
                    {livePreguntaActual && (
                      <div className="mt-1 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 animate-in fade-in">
                        <div className="flex items-start gap-2.5">
                          <MessageSquare size={16} className="text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black uppercase text-amber-400/80">Pregunta en pantalla:</p>
                            <p className="text-xs font-bold text-amber-200 mt-0.5 leading-relaxed">
                              "{livePreguntaActual}"
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleNetejarPissarraLive()}
                          className="text-amber-400/60 hover:text-amber-300 text-[11px] font-medium underline"
                        >
                          Treure
                        </button>
                      </div>
                    )}
                  </div>

                  {/* TAULELL LIVE: LES 10 COMPETÈNCIES CLAU */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className={`text-xs font-black uppercase tracking-wider ${darkMode ? "text-white" : "text-slate-800"}`}>
                          10 Competències Clau (Pissarra en Directe 1v1)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Fes clic a qualsevol competència per marcar-la o desmarcar-la com a pauta docent (es posarà en verd).
                        </p>
                      </div>

                      {/* Resum ràpid de seleccions */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                          Alumne: {liveCompetenciesAlumne.length} / 10
                        </span>
                        {liveProfessorCompetencies.length > 0 && (
                          <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                            Docent: {liveProfessorCompetencies.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* LLISTA VERTICAL DE LES 10 COMPETÈNCIES LITERALS (SENSE ACLARACIONS, COLOR VERD) */}
                    <div className="flex flex-col gap-2">
                      {COMPETENCIES_ENTREVISTA_LIVE_10.map((comp) => {
                        const esMarcadaAlumne = liveCompetenciesAlumne.includes(comp.id);
                        const esMarcadaDocent = liveProfessorCompetencies.includes(comp.id);
                        const esActiva = esMarcadaAlumne || esMarcadaDocent;
                        const esCoincident = esMarcadaAlumne && esMarcadaDocent;

                        return (
                          <div
                            key={comp.id}
                            id={`card-live-comp-${comp.id}`}
                            onClick={() => handleToggleProfessorComp(comp.id)}
                            className={`w-full p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer select-none ${
                              esMarcadaAlumne
                                ? "bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/60"
                                : esMarcadaDocent
                                ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500/50 shadow-sm"
                                : darkMode
                                ? "bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-black shrink-0 ${
                                esMarcadaAlumne
                                  ? "bg-slate-950 text-emerald-400"
                                  : esMarcadaDocent
                                  ? "bg-emerald-500 text-slate-950"
                                  : darkMode
                                  ? "bg-slate-800 text-slate-400"
                                  : "bg-slate-100 text-slate-600"
                              }`}>
                                {comp.id}
                              </span>

                              {/* Títol literal sense aclaracions */}
                              <span className={`text-xs sm:text-sm tracking-wide ${
                                esMarcadaAlumne ? "font-black text-slate-950" : esMarcadaDocent ? "font-bold text-emerald-300" : "font-semibold"
                              }`}>
                                {comp.titol}
                              </span>
                            </div>

                            {/* Indicadors d'estat a la dreta */}
                            <div className="flex items-center gap-2 shrink-0">
                              {esMarcadaAlumne && (
                                <span 
                                  className="flex items-center gap-1 text-[10px] font-black uppercase bg-slate-950 text-emerald-400 px-2 py-1 rounded-md shadow-sm"
                                  title="Marcat per l'alumne al seu mòbil"
                                >
                                  <Activity size={12} className="animate-pulse text-emerald-400" />
                                  Alumne
                                </span>
                              )}
                              {esMarcadaDocent && (
                                <span 
                                  className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-md border ${
                                    esMarcadaAlumne 
                                      ? "bg-slate-950/80 text-emerald-300 border-emerald-400" 
                                      : "bg-emerald-500 text-slate-950 border-emerald-400"
                                  }`}
                                  title="Pauta docent del professor"
                                >
                                  <CheckSquare size={12} />
                                  Pauta
                                </span>
                              )}
                              {esCoincident && (
                                <span className="hidden sm:flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-400 text-slate-950 px-2 py-1 rounded-md shadow-sm">
                                  <CheckCircle size={12} /> Coincident
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ANÀLISI PEDAGÒGIC I FEEDBACK EN DIRECTE */}
                  {liveCompetenciesAlumne.length > 0 && (
                    <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col gap-3 ${
                      darkMode ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        <Brain size={16} className="text-emerald-400" />
                        <h4 className={`text-xs font-black uppercase tracking-wider ${darkMode ? "text-white" : "text-slate-800"}`}>
                          Competències Marcades per l'Alumne
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className={`p-3.5 rounded-xl border ${darkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <p className="text-[10px] font-black uppercase text-emerald-400 mb-1.5">
                            Competències triades ({liveCompetenciesAlumne.length}):
                          </p>
                          <div className="flex flex-col gap-1">
                            {liveCompetenciesAlumne.map(c => {
                              const item = COMPETENCIES_ENTREVISTA_LIVE_10.find(m => m.id === c);
                              return (
                                <span key={c} className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-medium">
                                  {item?.titol || c}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className={`p-3.5 rounded-xl border ${darkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <p className="text-[10px] font-black uppercase text-emerald-400 mb-1.5">
                            Notes de feedback per al diari:
                          </p>
                          <textarea
                            rows={2}
                            value={liveFeedbackDocent}
                            onChange={(e) => setLiveFeedbackDocent(e.target.value)}
                            placeholder="Afegeix una observació de com ha defensat aquestes competències..."
                            className={`w-full p-2 text-xs rounded-lg border outline-none ${
                              darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPCIÓ 2: INFORMACIÓ DE L'ALUMNE (BIODATA I DIARI DE SESSIONS) */}
          {/* ========================================================================= */}
          {vistaAlumne === "info_alumne" && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setVistaAlumne("menu")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ArrowLeft size={14} /> Tornar al menú de l'alumne
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPestanyaAlumne("biodata")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      pestanyaAlumne === "biodata"
                        ? "bg-purple-600 text-white shadow-md"
                        : darkMode ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    1. Resultats Biodata (10 Comp.)
                  </button>
                  <button
                    onClick={() => setPestanyaAlumne("sessions")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      pestanyaAlumne === "sessions"
                        ? "bg-purple-600 text-white shadow-md"
                        : darkMode ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    2. Diari de Sessions ({sessions.length})
                  </button>
                </div>
              </div>

              {/* RENDERITZAT DE BIODATA */}
              {pestanyaAlumne === "biodata" && (
                <div className={`p-6 rounded-2xl border flex flex-col gap-6 ${
                  darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className={`text-base font-black uppercase tracking-wider flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                        <Brain size={18} className="text-purple-500" />
                        Avaluació de les 10 Competències Clau Oficials (Biodata)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Fes clic a qualsevol de les 10 competències per analitzar detalladament les respostes de l'opositor.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => carregarBiodataAlumne(usuariSeleccionat.id)}
                        disabled={carregantBiodata}
                        className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw size={12} className={carregantBiodata ? "animate-spin" : ""} />
                        Refrescar Biodata
                      </button>
                    </div>
                  </div>

                  {carregantBiodata ? (
                    <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                      <RefreshCw size={20} className="animate-spin text-purple-500" />
                      Carregant resultats del qüestionari psicopedagògic...
                    </div>
                  ) : !resultatsBiodata ? (
                    <div className="py-12 text-center flex flex-col items-center gap-3">
                      <Brain size={36} className="text-slate-400" />
                      <div className={`text-xs font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                        Aquest alumne encara no ha realitzat el qüestionari de Biodata oficial a la plataforma.
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        Quan completi el test de 80 preguntes a l'apartat de Prova Psicològica, veuràs aquí la seva radiografia competencial.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {/* RESUM DE PUNTUACIONS PER COMPETÈNCIA (10 BOTONS/CARDS) */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {MAP_COMPETENCIES.map((comp) => {
                          const puntuacio = resultatsBiodata.competencies?.[comp.id] || 0;
                          const isSelected = competenciaSeleccionada === comp.id;

                          const badgeColor = 
                            puntuacio >= 12 ? "text-emerald-500 bg-emerald-500/10" :
                            puntuacio >= 7 ? "text-blue-500 bg-blue-500/10" :
                            puntuacio >= 3 ? "text-amber-500 bg-amber-500/10" :
                            "text-rose-500 bg-rose-500/10";

                          return (
                            <button
                              key={comp.id}
                              onClick={() => setCompetenciaSeleccionada(comp.id)}
                              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                                isSelected
                                  ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                                  : darkMode
                                  ? "bg-slate-900/70 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800"
                                  : "bg-slate-50 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-purple-200" : "text-slate-400"}`}>
                                  {comp.id}
                                </span>
                                <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : badgeColor}`}>
                                  {puntuacio} pts
                                </span>
                              </div>

                              <div>
                                <h5 className={`text-xs font-black leading-snug line-clamp-2 ${isSelected ? "text-white" : darkMode ? "text-slate-200" : "text-slate-800"}`}>
                                  {comp.nom}
                                </h5>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* DETALL DE PREGUNTES DE LA COMPETÈNCIA SELECCIONADA */}
                      {competenciaSeleccionada && (
                        <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
                          darkMode ? "bg-slate-900/80 border-slate-700" : "bg-slate-50 border-slate-200"
                        }`}>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">
                                Desglossament detallat de respostes de l'alumne
                              </span>
                              <h5 className={`text-sm font-black uppercase ${darkMode ? "text-white" : "text-slate-800"}`}>
                                {MAP_COMPETENCIES.find(c => c.id === competenciaSeleccionada)?.nom} ({competenciaSeleccionada})
                              </h5>
                              <p className="text-xs text-slate-400">
                                {MAP_COMPETENCIES.find(c => c.id === competenciaSeleccionada)?.descripcio}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-4">
                            {obtenirPreguntesDeCompetencia(competenciaSeleccionada).map((item, qIdx) => (
                              <div
                                key={item.pregunta.id}
                                className={`p-4 rounded-xl border flex flex-col gap-3 ${
                                  darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <span className="w-6 h-6 rounded-lg bg-purple-600/10 text-purple-600 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                    {item.pregunta.id}
                                  </span>
                                  <div className="flex-1">
                                    <p className={`text-xs font-bold leading-relaxed ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                                      {item.pregunta.enunciat}
                                    </p>
                                  </div>
                                </div>

                                {/* OPCIONS DE LA PREGUNTA AMB LA RESPOSTA DE L'ALUMNE MARCADA */}
                                <div className="flex flex-col gap-1.5 pl-8">
                                  {item.pregunta.opcions.map((opcio, oIdx) => {
                                    const esTriada = item.indexRespostaUsuari === oIdx;
                                    const punts = opcio.punts;
                                    return (
                                      <div
                                        key={oIdx}
                                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                                          esTriada
                                            ? punts > 0
                                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-medium"
                                              : punts === 0
                                              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-400 text-amber-900 dark:text-amber-200 font-medium"
                                              : "bg-rose-50 dark:bg-rose-950/30 border-rose-400 text-rose-900 dark:text-rose-200 font-medium"
                                            : darkMode
                                            ? "bg-slate-900/40 border-slate-700/50 text-slate-400"
                                            : "bg-slate-50/60 border-slate-200/60 text-slate-600"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold shrink-0">{String.fromCharCode(65 + oIdx)})</span>
                                          <span>{opcio.text}</span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="text-[10px] font-bold opacity-75">
                                            ({punts > 0 ? `+${punts}` : punts} punts)
                                          </span>
                                          {esTriada && (
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase flex items-center gap-1 ${
                                              punts > 0 ? "bg-emerald-500 text-white" : punts === 0 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                                            }`}>
                                              <Check size={11} /> Triada per l'alumne
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* RENDERITZAT DE DIARI DE SESSIONS */}
              {pestanyaAlumne === "sessions" && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                      Historial complet de converses, preguntes formulades, respostes de l'alumne i notes entre docents.
                    </p>
                    <button
                      onClick={() => carregarSessionsAlumne(usuariSeleccionat.id)}
                      disabled={carregantSessions}
                      className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={12} className={carregantSessions ? "animate-spin" : ""} />
                      Refrescar sessions
                    </button>
                  </div>

                  {carregantSessions ? (
                    <div className={`p-8 rounded-2xl border text-center text-xs text-slate-400 ${
                      darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                    }`}>
                      <RefreshCw size={16} className="animate-spin text-purple-500 mx-auto mb-2" />
                      Carregant historial de sessions...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className={`p-8 rounded-2xl border text-center flex flex-col items-center gap-3 ${
                      darkMode ? "bg-slate-800/40 border-slate-700" : "bg-white border-slate-200"
                    }`}>
                      <MessageSquare size={32} className="text-slate-400" />
                      <div className={`text-xs font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                        Encara no hi ha cap sessió d'entrevista registrada per a aquest alumne.
                      </div>
                      <button
                        onClick={() => {
                          setVistaAlumne("entrevista_1v1");
                          setSubPestanya1v1("fulla_entrevista");
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm mt-1"
                      >
                        Començar entrevista 1v1 ara
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {sessions.map((s) => {
                        const isExpanded = sessioDesplegadaId === s.id;
                        return (
                          <div
                            key={s.id}
                            className={`p-5 rounded-2xl border flex flex-col gap-4 transition-all shadow-sm ${
                              darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="px-2.5 py-1 rounded-lg bg-purple-600/10 text-purple-600 font-black text-xs">
                                  {s.tipusSessio}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                  <Calendar size={13} />
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{s.dataSessio}</span>
                                  {s.horaSessio && <span>a les {s.horaSessio}</span>}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                  <span className="text-slate-300 dark:text-slate-600">•</span>
                                  <span className="font-medium text-slate-600 dark:text-slate-300">Docent: {s.professorNom}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  onClick={() => handleEsborrarSessio(s.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-all"
                                  title="Eliminar sessió"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 ${
                                darkMode ? "bg-slate-900/60 border-slate-700/60" : "bg-slate-50 border-slate-200"
                              }`}>
                                <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
                                  <MessageSquare size={12} />
                                  Resum Global de la Conversa:
                                </span>
                                <p className={`whitespace-pre-wrap ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                                  {s.contingutConversa || "Sense resum general anotat."}
                                </p>
                              </div>

                              <div className={`p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 ${
                                darkMode ? "bg-slate-900/60 border-slate-700/60" : "bg-slate-50 border-slate-200"
                              }`}>
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                                  <AlertCircle size={12} />
                                  Notes per a la propera classe & professors:
                                </span>
                                <p className={`whitespace-pre-wrap ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                                  {s.notesProperaClasse || "Sense indicacions específiques."}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPCIÓ 3: DEIXAR PREGUNTES PERSONALS DESADES (PLANTILLES & PRESETS) */}
          {/* ========================================================================= */}
          {vistaAlumne === "preguntes_desades" && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setVistaAlumne("menu")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ArrowLeft size={14} /> Tornar al menú de l'alumne
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleObrirCrearPlantilla(false)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={14} /> + Nou Preset per a {usuariSeleccionat.displayName?.split(" ")[0] || "l'alumne"}
                  </button>
                </div>
              </div>

              {/* CONTINGUT PLANTILLES */}
              <div className={`p-6 rounded-2xl border flex flex-col gap-6 ${
                darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div className="flex flex-col gap-1 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <h4 className={`text-base font-black uppercase tracking-wider flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
                    <Layers size={18} className="text-amber-500" />
                    Preguntes i Presets Específics per a {usuariSeleccionat.displayName || "l'alumne"}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Aquestes preguntes quedaran guardades i les podràs carregar en 1 clic durant les entrevistes 1v1.
                  </p>
                </div>

                {/* PRESETS DE L'ALUMNE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plantillesAlumne.length === 0 ? (
                    <div className={`col-span-2 p-8 rounded-xl border border-dashed text-center text-xs text-slate-400 flex flex-col items-center gap-3 ${
                      darkMode ? "border-slate-700 bg-slate-900/30" : "border-slate-300 bg-slate-50"
                    }`}>
                      <Layers size={32} className="text-slate-500" />
                      <p>Encara no has desat cap bateria de preguntes específiques per a aquest alumne.</p>
                      <button
                        onClick={() => handleObrirCrearPlantilla(false)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm"
                      >
                        Crear el primer preset
                      </button>
                    </div>
                  ) : (
                    plantillesAlumne.map((p) => (
                      <div
                        key={p.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-sm ${
                          darkMode ? "bg-slate-900/60 border-amber-500/30" : "bg-amber-50/40 border-amber-200"
                        }`}
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase">
                              {p.ambit}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                              {p.preguntes.length} preguntes
                            </span>
                          </div>
                          <h6 className={`text-sm font-black ${darkMode ? "text-white" : "text-slate-800"}`}>
                            {p.titol}
                          </h6>
                          {p.descripcio && (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {p.descripcio}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleObrirEditarPlantilla(p)}
                              className="p-1.5 text-slate-400 hover:text-amber-500"
                              title="Editar preset"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleEliminarPlantilla(p)}
                              className="p-1.5 text-slate-400 hover:text-red-500"
                              title="Eliminar preset"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              setVistaAlumne("entrevista_1v1");
                              setSubPestanya1v1("carregar_preguntes");
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5"
                          >
                            <Play size={12} /> Carregar a l'Entrevista
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL DE CREACIÓ / EDICIÓ DE SESSIÓ EN DIRECTE AMB PREGUNTES DETALLADES */}
      {/* ========================================================================= */}
      {modalSessioObert && usuariSeleccionat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-3xl rounded-2xl border p-6 shadow-2xl flex flex-col gap-5 my-8 ${
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600/10 text-purple-600 rounded-xl">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className={`text-base font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {sessioEnEdicio ? 'Editar Sessió d\'Entrevista' : 'Nova Sessió d\'Entrevista en Directe'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Alumne: <span className="font-bold text-purple-600">{usuariSeleccionat.displayName || usuariSeleccionat.email}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalSessioObert(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDesarSessio} className="flex flex-col gap-4">
              {/* DADES BÀSIQUES DE LA SESSIÓ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Docent / Professor</label>
                  <input
                    type="text"
                    required
                    value={formProfessor}
                    onChange={(e) => setFormProfessor(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Data de la Sessió</label>
                  <input
                    type="date"
                    required
                    value={formDataSessio}
                    onChange={(e) => setFormDataSessio(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Hora</label>
                  <input
                    type="text"
                    value={formHoraSessio}
                    onChange={(e) => setFormHoraSessio(e.target.value)}
                    placeholder="18:30"
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              {/* TIPUS I NIVELL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Tipus de Sessió / Matèria</label>
                  <input
                    type="text"
                    required
                    value={formTipusSessio}
                    onChange={(e) => setFormTipusSessio(e.target.value)}
                    placeholder="Ex: Simulacre PGME, Revisió Biodata..."
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Nivell d'adhesió al Perfil Policial</label>
                  <select
                    value={formNivell}
                    onChange={(e) => setFormNivell(e.target.value as any)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="inicial">Inicial (Requereix molt treball de base)</option>
                    <option value="en_desenvolupament">En Desenvolupament (Progressant correctament)</option>
                    <option value="bon_nivell">Bon Nivell (Perfil apte amb petits detalls)</option>
                    <option value="perfil_mossos">🌟 Perfil Mossos (Excel·lent i sòlid)</option>
                  </select>
                </div>
              </div>

              {/* SECCIÓ DE PREGUNTES EN DIRECTE */}
              <div className="flex flex-col gap-3 p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                      <ClipboardList size={14} />
                      Preguntes formulades en aquesta sessió ({formPreguntesSessio.length})
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Apunta en directe la resposta que dóna l'alumne a cada pregunta per avaluar-lo de manera precisa.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalImportarObert(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1"
                    >
                      <Layers size={12} /> Importar de Plantilla
                    </button>
                    <button
                      type="button"
                      onClick={handleAfegirPreguntaManualSessio}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1"
                    >
                      <Plus size={12} /> Nova Pregunta
                    </button>
                  </div>
                </div>

                {formPreguntesSessio.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No hi ha preguntes individuals afegides. Pots importar una plantilla o afegir-ne a mà.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                    {formPreguntesSessio.map((preg, idx) => (
                      <div
                        key={preg.id || idx}
                        className={`p-3 rounded-xl border text-xs flex flex-col gap-2 ${
                          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              placeholder="Enunciat de la pregunta formulada..."
                              value={preg.enunciat}
                              onChange={(e) => handleModificarPreguntaSessio(idx, 'enunciat', e.target.value)}
                              className={`w-full px-2.5 py-1 text-xs font-bold rounded-lg border outline-none ${
                                darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEliminarPreguntaSessio(idx)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* RESPOSTA DE L'ALUMNE */}
                        <textarea
                          rows={2}
                          placeholder="Què ha contestat l'alumne? Arguments, seguretat, dubtes..."
                          value={preg.respostaAlumne}
                          onChange={(e) => handleModificarPreguntaSessio(idx, 'respostaAlumne', e.target.value)}
                          className={`w-full p-2 text-xs rounded-lg border outline-none ${
                            darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RESUM I ANOTACIONS GLOBALS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Resum General de la Conversa</label>
                  <textarea
                    rows={3}
                    value={formContingut}
                    onChange={(e) => setFormContingut(e.target.value)}
                    placeholder="Resum global de la trobada, actitud de l'alumne..."
                    className={`w-full p-2.5 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-amber-500 flex items-center gap-1">
                    <Sparkles size={12} />
                    Anotació clau per a properes classes / Altres professors
                  </label>
                  <textarea
                    rows={3}
                    value={formNotesPropera}
                    onChange={(e) => setFormNotesPropera(e.target.value)}
                    placeholder="Què ha de saber el proper docent que atengui aquest alumne..."
                    className={`w-full p-2.5 text-xs rounded-xl border outline-none font-medium ${
                      darkMode ? 'bg-amber-950/20 border-amber-800/40 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  />
                </div>
              </div>

              {/* PUNTS FORTS I A MILLORAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-emerald-500">Punts Forts</label>
                  <input
                    type="text"
                    value={formPuntsForts}
                    onChange={(e) => setFormPuntsForts(e.target.value)}
                    placeholder="Ex: Gran assertivitat, bon to de veu, seguretat..."
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-rose-500">Punts a Polir</label>
                  <input
                    type="text"
                    value={formPuntsMillora}
                    onChange={(e) => setFormPuntsMillora(e.target.value)}
                    placeholder="Ex: Evitar gestos de tensió, polir motivació..."
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalSessioObert(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  disabled={desantSessio}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
                >
                  <Save size={15} />
                  {desantSessio ? 'Desant a Firestore...' : 'Desar Sessió d\'Entrevista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PER A IMPORTAR PLANTILLES A LA SESSIÓ ACTUAL */}
      {/* ========================================================================= */}
      {modalImportarObert && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl flex flex-col gap-4 ${
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className={`text-sm font-black uppercase ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Selecciona una Plantilla per Importar Preguntes
              </h4>
              <button onClick={() => setModalImportarObert(false)} className="text-slate-400 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
              {/* PLANTILLES DE L'ALUMNE */}
              {plantillesAlumne.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase text-indigo-500">
                    Plantilles de {usuariSeleccionat?.displayName || 'l\'alumne'}:
                  </span>
                  {plantillesAlumne.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleImportarPlantillaASessio(p)}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{p.titol}</div>
                        <div className="text-[11px] text-slate-400">{p.preguntes.length} preguntes • {p.ambit}</div>
                      </div>
                      <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg">
                        Importar
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* PLANTILLES GLOBALS */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-purple-500">
                  Plantilles Globals OposiCAT:
                </span>
                {plantillesGlobals.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleImportarPlantillaASessio(p)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{p.titol}</div>
                      <div className="text-[11px] text-slate-400">{p.preguntes.length} preguntes • {p.ambit}</div>
                    </div>
                    <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-lg">
                      Importar
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CREACIÓ / EDICIÓ DE PLANTILLA DE CLASSE */}
      {/* ========================================================================= */}
      {modalPlantillaObert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl flex flex-col gap-5 my-8 ${
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-600/10 text-purple-600 rounded-xl">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className={`text-base font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {plantillaEnEdicio ? 'Editar Plantilla de Classe' : 'Crear Nova Plantilla de Classe'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defineix el títol, objectius i el banc de preguntes que utilitzaràs en les sessions.
                  </p>
                </div>
              </div>

              <button onClick={() => setModalPlantillaObert(false)} className="text-slate-400 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDesarPlantilla} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Títol de la Plantilla</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Classe 1 - Genèrica o Marc - Sessió 02"
                  value={formTitolPlantilla}
                  onChange={(e) => setFormTitolPlantilla(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Àmbit / Matèria</label>
                  <select
                    value={formAmbitPlantilla}
                    onChange={(e) => setFormAmbitPlantilla(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="Biodata">Biodata i Perfil Psicològic</option>
                    <option value="Entrevista PGME">Entrevista Oficial PGME</option>
                    <option value="Situacions de carrer">Situacions Crítiques de Carrer</option>
                    <option value="Seguiment personal">Seguiment Personal i Motivació</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Tipus d'abast</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        checked={formEsGlobal}
                        onChange={() => setFormEsGlobal(true)}
                        className="text-purple-600"
                      />
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>Global (Tothom)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        checked={!formEsGlobal}
                        onChange={() => setFormEsGlobal(false)}
                        className="text-purple-600"
                      />
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        Alumne ({usuariSeleccionat?.displayName?.split(' ')[0] || 'Personal'})
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Objectius i Pla Pedagògic</label>
                <textarea
                  rows={2}
                  placeholder="Què es pretén aconseguir amb aquesta sessió..."
                  value={formObjectiusPlantilla}
                  onChange={(e) => setFormObjectiusPlantilla(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-xl border outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* LLISTA DE PREGUNTES DE LA PLANTILLA */}
              <div className="flex flex-col gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Preguntes del Full de Ruta ({formPreguntesPlantilla.length}):
                </label>

                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Escriu una pregunta per a la plantilla..."
                    value={novaPreguntaText}
                    onChange={(e) => setNovaPreguntaText(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Pauta o guia per al professor (opcional)..."
                      value={novaPreguntaPauta}
                      onChange={(e) => setNovaPreguntaPauta(e.target.value)}
                      className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAfegirPreguntaAPlantilla}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Afegir
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 mt-1">
                  {formPreguntesPlantilla.map((preg, idx) => (
                    <div
                      key={preg.id || idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                        darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-600/10 text-purple-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <p className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{preg.text}</p>
                          {preg.pautesProfessor && (
                            <p className="text-[11px] text-amber-500 italic mt-0.5">{preg.pautesProfessor}</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEliminarPreguntaDePlantilla(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalPlantillaObert(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  disabled={desantPlantilla}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
                >
                  <Save size={15} />
                  {desantPlantilla ? 'Desant...' : 'Desar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
