import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, CheckCircle2, AlertCircle, BookOpen, 
  HelpCircle, Trash2, Edit3, Award, Sparkles, FileText, Check, X
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, doc, getDocs, addDoc, deleteDoc, updateDoc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';

/**
 * ============================================================================
 * ELS PRINCIPALS - CRITERIS DE TREBALL PER A OPOSICAT
 * 
 * Comentari planer per a no-programadors:
 * Aquest component és el banc d'estudi i simulacres d'examen per a la 
 * convocatòria de la Policia Local de Tremp (17 de Setembre).
 * 
 * Permet a l'estudiant:
 * 1. Afegir les seves pròpies preguntes oficials amb 4 opcions (A, B, C, D)
 *    i desar-les directament a la base de dades (Firestore).
 * 2. Fer un simulacre de test en viu amb correcció instantània i explicació.
 * 3. Gestionar, editar i consultar totes les preguntes guardades.
 * ============================================================================
 */

export interface PreguntaTremp {
  id?: string;
  enunciat: string;
  opcions: [string, string, string, string];
  indexCorrecta: number; // 0=A, 1=B, 2=C, 3=D
  tema: string; // Ex: Tema 1, Ordenances Tremp, Marc Constitucional, etc.
  explicacio?: string;
  creadaPer?: string;
  dataCreacio?: any;
}

interface ProvaPLTrempWebProps {
  onTornar: () => void;
  usuariEmail?: string;
}

export const ProvaPLTrempWeb: React.FC<ProvaPLTrempWebProps> = ({ onTornar, usuariEmail = 'xepfarre@gmail.com' }) => {
  // Mode de pantalla: 'menu' (selecció), 'crear' (afegir pregunta), 'test' (practicar simulacre), 'llistat' (veure totes)
  const [pestanya, setPestanya] = useState<'menu' | 'crear' | 'test' | 'llistat'>('menu');

  // Llistat de preguntes carregades des de la base de dades (Firestore)
  const [preguntes, setPreguntes] = useState<PreguntaTremp[]>([]);
  const [carregant, setCarregant] = useState(true);

  // Formularis per afegir nova pregunta
  const [nouEnunciat, setNouEnunciat] = useState('');
  const [opcioA, setOpcioA] = useState('');
  const [opcioB, setOpcioB] = useState('');
  const [opcioC, setOpcioC] = useState('');
  const [opcioD, setOpcioD] = useState('');
  const [correctaSeleccionada, setCorrectaSeleccionada] = useState<number>(0);
  const [nouTema, setNouTema] = useState('Policia Local Tremp - Temari General');
  const [novaExplicacio, setNovaExplicacio] = useState('');
  const [missatgeExit, setMissatgeExit] = useState('');

  // Estats per a la modificació/edició de preguntes existents a la BBDD
  const [preguntaAEditar, setPreguntaAEditar] = useState<PreguntaTremp | null>(null);
  const [editEnunciat, setEditEnunciat] = useState('');
  const [editOpcioA, setEditOpcioA] = useState('');
  const [editOpcioB, setEditOpcioB] = useState('');
  const [editOpcioC, setEditOpcioC] = useState('');
  const [editOpcioD, setEditOpcioD] = useState('');
  const [editCorrecta, setEditCorrecta] = useState<number>(0);
  const [editTema, setEditTema] = useState('');
  const [editExplicacio, setEditExplicacio] = useState('');
  const [guardantEdicio, setGuardantEdicio] = useState(false);

  // Estats per a l'eliminació segura de preguntes (mitjançant finestra pròpia, evitant el confirm() del navegador que es bloqueja a l'iframe)
  const [preguntaAEliminar, setPreguntaAEliminar] = useState<PreguntaTremp | null>(null);
  const [eliminant, setEliminant] = useState(false);

  // Estats per al simulador de test
  const [indexPreguntaTest, setIndexPreguntaTest] = useState(0);
  const [respostaTriada, setRespostaTriada] = useState<number | null>(null);
  const [revelarResposta, setRevelarResposta] = useState(false);
  const [encerts, setEncerts] = useState(0);
  const [errades, setErrades] = useState(0);
  const [testFinalitzat, setTestFinalitzat] = useState(false);

  // Carregar preguntes des de Firestore al carregar el component
  useEffect(() => {
    carregarPreguntes();
  }, []);

  const carregarPreguntes = async () => {
    setCarregant(true);
    const path = 'preguntes_pl_tremp';
    try {
      const colRef = collection(db, path);
      const q = query(colRef, orderBy('dataCreacio', 'desc'));
      const snap = await getDocs(q);
      
      const llista: PreguntaTremp[] = [];
      snap.forEach((docItem) => {
        const data = docItem.data() as any;
        llista.push({
          id: docItem.id,
          enunciat: data.enunciat || '',
          opcions: data.opcions || ['', '', '', ''],
          indexCorrecta: data.indexCorrecta ?? 0,
          tema: data.tema || 'General',
          explicacio: data.explicacio || '',
          creadaPer: data.creadaPer,
          dataCreacio: data.dataCreacio,
        });
      });

      // Si encara no hi ha preguntes a la BBDD, afegim preguntes base d'exemple de mostra
      if (llista.length === 0) {
        setPreguntes(PREGUNTES_BASE_TREMP);
      } else {
        setPreguntes(llista);
      }
    } catch (error) {
      console.error('Error al carregar preguntes de PL Tremp:', error);
      // Carreguem les base en cas de qualsevol incidència per garantir que l'estudiant pugui estudiar sempre
      setPreguntes(PREGUNTES_BASE_TREMP);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (errReport) {
        // No interrompre la interfície visual de l'alumne
      }
    } finally {
      setCarregant(false);
    }
  };

  // Funció per desar una nova pregunta a Firestore
  const guardarNovaPregunta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouEnunciat.trim() || !opcioA.trim() || !opcioB.trim() || !opcioC.trim() || !opcioD.trim()) {
      alert('Si us plau, omple tant la pregunta com les 4 opcions A, B, C i D.');
      return;
    }

    const novaPregunta: PreguntaTremp = {
      enunciat: nouEnunciat.trim(),
      opcions: [opcioA.trim(), opcioB.trim(), opcioC.trim(), opcioD.trim()],
      indexCorrecta: correctaSeleccionada,
      tema: nouTema.trim() || 'General Tremp',
      explicacio: novaExplicacio.trim(),
      creadaPer: usuariEmail,
      dataCreacio: serverTimestamp(),
    };

    const path = 'preguntes_pl_tremp';
    try {
      const docRef = await addDoc(collection(db, path), novaPregunta);
      setPreguntes(prev => [{ ...novaPregunta, id: docRef.id }, ...prev]);
      
      // Netejar el formulari
      setNouEnunciat('');
      setOpcioA('');
      setOpcioB('');
      setOpcioC('');
      setOpcioD('');
      setNovaExplicacio('');
      setMissatgeExit('Pregunta desada correctament a la base de dades!');
      setTimeout(() => setMissatgeExit(''), 3500);
    } catch (err) {
      console.error('Error guardant a Firestore:', err);
      // Guardar localment com a pla B per no perdre la feina de l'alumne
      setPreguntes(prev => [{ ...novaPregunta, id: 'local_' + Date.now() }, ...prev]);
      setMissatgeExit('Pregunta guardada en aquesta sessió!');
      setTimeout(() => setMissatgeExit(''), 3500);
      try {
        handleFirestoreError(err, OperationType.CREATE, path);
      } catch (errReport) {
        // Logjat pel diagnòstic
      }
    }
  };

  // Funció per obrir la finestra de confirmació d'eliminació d'una pregunta
  const sollicitarEliminacio = (preg: PreguntaTremp) => {
    setPreguntaAEliminar(preg);
  };

  // Funció per executar l'eliminació definitiva a Firestore i a la interfície
  const confirmarEliminacio = async () => {
    if (!preguntaAEliminar) return;

    const id = preguntaAEliminar.id;
    const path = `preguntes_pl_tremp/${id}`;
    setEliminant(true);

    try {
      // Si té identificador real a la base de dades Firestore, l'esborrem del servidor
      if (id && !id.startsWith('local_') && !id.startsWith('base_')) {
        await deleteDoc(doc(db, 'preguntes_pl_tremp', id));
      }

      // Traiem la pregunta de la memòria local i del llistat d'estudi
      setPreguntes(prev => prev.filter(p => p.id !== id));

      // Si s'estava editant aquesta pregunta, tanquem la finestra d'edició
      if (preguntaAEditar?.id === id) {
        setPreguntaAEditar(null);
      }

      // Si estàvem fent el test amb aquesta pregunta, reajustem l'índex per no quedar en blanc
      setRespostaTriada(null);
      setRevelarResposta(false);
      setIndexPreguntaTest(prev => (prev > 0 && prev >= preguntes.length - 1 ? prev - 1 : prev));

      setPreguntaAEliminar(null);
      setMissatgeExit('Pregunta esborrada correctament de la base de dades!');
      setTimeout(() => setMissatgeExit(''), 3500);
    } catch (err) {
      console.error('Error eliminant la pregunta a Firestore:', err);
      // Fins i tot si falla la xarxa, l'eliminem de la sessió de l'alumne
      setPreguntes(prev => prev.filter(p => p.id !== id));
      setPreguntaAEliminar(null);
      setMissatgeExit('Pregunta eliminada del banc!');
      setTimeout(() => setMissatgeExit(''), 3500);
      try {
        handleFirestoreError(err, OperationType.DELETE, path);
      } catch (errReport) {
        // Enregistrat pel diagnòstic
      }
    } finally {
      setEliminant(false);
    }
  };

  // Funció per obrir la finestra d'edició i carregar les dades de la pregunta seleccionada
  const obrirModalEdicio = (preg: PreguntaTremp) => {
    setPreguntaAEditar(preg);
    setEditEnunciat(preg.enunciat);
    setEditOpcioA(preg.opcions[0] || '');
    setEditOpcioB(preg.opcions[1] || '');
    setEditOpcioC(preg.opcions[2] || '');
    setEditOpcioD(preg.opcions[3] || '');
    setEditCorrecta(preg.indexCorrecta);
    setEditTema(preg.tema);
    setEditExplicacio(preg.explicacio || '');
  };

  // Funció per tancar la finestra d'edició
  const tancarModalEdicio = () => {
    setPreguntaAEditar(null);
    setGuardantEdicio(false);
  };

  // Funció per guardar els canvis fets a la pregunta a la BBDD (Firestore)
  const guardarCanvisEdicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preguntaAEditar) return;

    if (!editEnunciat.trim() || !editOpcioA.trim() || !editOpcioB.trim() || !editOpcioC.trim() || !editOpcioD.trim()) {
      alert('Si us plau, omple tant la pregunta com les 4 opcions A, B, C i D.');
      return;
    }

    setGuardantEdicio(true);
    const dadesActualitzades = {
      enunciat: editEnunciat.trim(),
      opcions: [editOpcioA.trim(), editOpcioB.trim(), editOpcioC.trim(), editOpcioD.trim()] as [string, string, string, string],
      indexCorrecta: editCorrecta,
      tema: editTema.trim() || 'General Tremp',
      explicacio: editExplicacio.trim(),
    };

    const targetId = preguntaAEditar.id;
    const path = `preguntes_pl_tremp/${targetId}`;

    try {
      // Si la pregunta és a Firestore (no local ni base de mostra), actualitzem directament
      if (targetId && !targetId.startsWith('local_') && !targetId.startsWith('base_')) {
        await updateDoc(doc(db, 'preguntes_pl_tremp', targetId), dadesActualitzades);
      }

      // Actualitzem l'estat local de la llista de preguntes
      setPreguntes(prev => prev.map(p => {
        if (p.id === targetId) {
          return {
            ...p,
            ...dadesActualitzades,
          };
        }
        return p;
      }));

      tancarModalEdicio();
      setMissatgeExit('Pregunta modificada i actualitzada a la base de dades!');
      setTimeout(() => setMissatgeExit(''), 3500);
    } catch (err) {
      console.error('Error actualitzant a Firestore:', err);
      // Actualitzem localment per no perdre el canvi de l'usuari
      setPreguntes(prev => prev.map(p => {
        if (p.id === targetId) {
          return {
            ...p,
            ...dadesActualitzades,
          };
        }
        return p;
      }));
      tancarModalEdicio();
      setMissatgeExit('Pregunta actualitzada!');
      setTimeout(() => setMissatgeExit(''), 3500);
      try {
        handleFirestoreError(err, OperationType.UPDATE, path);
      } catch (errReport) {
        // Logjat pel diagnòstic
      }
    } finally {
      setGuardantEdicio(false);
    }
  };

  // Gestió del Simulador de Test
  const iniciarSimulacre = () => {
    setIndexPreguntaTest(0);
    setRespostaTriada(null);
    setRevelarResposta(false);
    setEncerts(0);
    setErrades(0);
    setTestFinalitzat(false);
    setPestanya('test');
  };

  const seleccionarOpcioTest = (idx: number) => {
    if (revelarResposta) return;
    setRespostaTriada(idx);
    setRevelarResposta(true);

    const pregActual = preguntes[indexPreguntaTest];
    if (idx === pregActual.indexCorrecta) {
      setEncerts(prev => prev + 1);
    } else {
      setErrades(prev => prev + 1);
    }
  };

  const seguentPreguntaTest = () => {
    if (indexPreguntaTest + 1 < preguntes.length) {
      setIndexPreguntaTest(prev => prev + 1);
      setRespostaTriada(null);
      setRevelarResposta(false);
    } else {
      setTestFinalitzat(true);
    }
  };

  const preguntaActual = preguntes[indexPreguntaTest];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 sm:p-8 selection:bg-[#FFDF00] selection:text-slate-900">
      
      {/* CAPÇALERA SUPERIOR */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-blue-900/40">
        <div className="flex items-center gap-4">
          <button
            onClick={onTornar}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-[#FFDF00] border border-[#FFDF00]/30 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tornar a OposiCAT</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black italic uppercase tracking-wider text-white">
                CONVOCATÒRIA <span className="text-[#FFDF00]">PL TREMP</span>
              </span>
              <span className="bg-red-600/90 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full animate-pulse">
                Examen: 17 Setembre
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Banc de preguntes personal i simulacres d'examen
            </p>
          </div>
        </div>

        {/* COMPTADOR DE PREGUNTES */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Preguntes</span>
          <span className="text-2xl font-black text-[#FFDF00]">{preguntes.length}</span>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓ INTERN (4 PESTANYES) */}
      <div className="max-w-5xl mx-auto w-full flex flex-wrap gap-2 pt-6">
        <button
          onClick={() => setPestanya('menu')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            pestanya === 'menu'
              ? 'bg-[#FFDF00] text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          Panell Principal
        </button>

        <button
          onClick={iniciarSimulacre}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            pestanya === 'test'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Fer Simulacre ({preguntes.length})</span>
        </button>

        <button
          onClick={() => setPestanya('crear')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            pestanya === 'crear'
              ? 'bg-[#FFDF00] text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Afegir Nova Pregunta</span>
        </button>

        <button
          onClick={() => setPestanya('llistat')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
            pestanya === 'llistat'
              ? 'bg-[#FFDF00] text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Banc de Preguntes ({preguntes.length})</span>
        </button>
      </div>

      {/* CONTINGUT SEGONS PESTANYA SELECCIONADA */}
      <div className="max-w-5xl mx-auto w-full mt-6">
        
        {/* ================================================================= */}
        {/* PESTANYA 1: MENU PRINCIPAL                                        */}
        {/* ================================================================= */}
        {pestanya === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Targeta 1: Fer Simulacre */}
            <div 
              onClick={iniciarSimulacre}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/40 p-6 rounded-3xl cursor-pointer hover:border-emerald-400 hover:scale-[1.02] transition-all group shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black italic uppercase tracking-wider text-white group-hover:text-emerald-400 transition-colors">
                1. Practicar Simulacre
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Posa a prova els teus coneixements amb preguntes tipus test de 4 opcions i correcció instantània.
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  {preguntes.length} preguntes preparades
                </span>
                <span className="text-xs font-black text-emerald-400">Començar →</span>
              </div>
            </div>

            {/* Targeta 2: Afegir Preguntes */}
            <div 
              onClick={() => setPestanya('crear')}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-[#FFDF00]/40 p-6 rounded-3xl cursor-pointer hover:border-[#FFDF00] hover:scale-[1.02] transition-all group shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FFDF00]/20 flex items-center justify-center text-[#FFDF00] mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black italic uppercase tracking-wider text-white group-hover:text-[#FFDF00] transition-colors">
                2. Afegir Preguntes
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Afegeix les preguntes del temari de Tremp, lleis locals o ordenances municipals per estudiar-les.
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#FFDF00] uppercase tracking-wider">
                  Desat automàtic al núvol
                </span>
                <span className="text-xs font-black text-[#FFDF00]">Afegir →</span>
              </div>
            </div>

            {/* Targeta 3: Banc de Preguntes */}
            <div 
              onClick={() => setPestanya('llistat')}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/40 p-6 rounded-3xl cursor-pointer hover:border-blue-400 hover:scale-[1.02] transition-all group shadow-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black italic uppercase tracking-wider text-white group-hover:text-blue-400 transition-colors">
                3. Veure Tot el Banc
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Revisa totes les preguntes guardades, amb la solució correcta i l'explicació detallada.
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  Total: {preguntes.length}
                </span>
                <span className="text-xs font-black text-blue-400">Consultar →</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTANYA 2: AFEGIR NOVA PREGUNTA                                  */}
        {/* ================================================================= */}
        {pestanya === 'crear' && (
          <form onSubmit={guardarNovaPregunta} className="bg-slate-900/90 border border-blue-900/40 p-6 sm:p-8 rounded-3xl shadow-2xl animate-in fade-in duration-300">
            <h2 className="text-lg font-black italic uppercase tracking-wider text-[#FFDF00] mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Nova Pregunta Oficial per a Tremp</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Aquesta pregunta es desarà a la base de dades i s'inclourà immediatament als simulacres de test.
            </p>

            {missatgeExit && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{missatgeExit}</span>
              </div>
            )}

            {/* TEMA / CATEGORIA */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Tema o Secció del Temari
              </label>
              <input
                type="text"
                value={nouTema}
                onChange={e => setNouTema(e.target.value)}
                placeholder="Ex: Tema 1 - Marc Constitucional o Ordenances Tremp"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FFDF00]"
              />
            </div>

            {/* ENUNCIAT */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Enunciat de la Pregunta *
              </label>
              <textarea
                value={nouEnunciat}
                onChange={e => setNouEnunciat(e.target.value)}
                rows={3}
                placeholder="Escriu aquí la pregunta de l'examen oficial..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FFDF00]"
              />
            </div>

            {/* LES 4 OPCIONS */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Opcions de Resposta (Marca amb el botó circular quina és la CORRECTA) *
              </label>

              {/* Opció A */}
              <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                correctaSeleccionada === 0 ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setCorrectaSeleccionada(0)}
                  className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center cursor-pointer transition-all ${
                    correctaSeleccionada === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  A
                </button>
                <input
                  type="text"
                  value={opcioA}
                  onChange={e => setOpcioA(e.target.value)}
                  placeholder="Opció A..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                />
                {correctaSeleccionada === 0 && (
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-md">
                    Correcta
                  </span>
                )}
              </div>

              {/* Opció B */}
              <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                correctaSeleccionada === 1 ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setCorrectaSeleccionada(1)}
                  className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center cursor-pointer transition-all ${
                    correctaSeleccionada === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  B
                </button>
                <input
                  type="text"
                  value={opcioB}
                  onChange={e => setOpcioB(e.target.value)}
                  placeholder="Opció B..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                />
                {correctaSeleccionada === 1 && (
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-md">
                    Correcta
                  </span>
                )}
              </div>

              {/* Opció C */}
              <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                correctaSeleccionada === 2 ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setCorrectaSeleccionada(2)}
                  className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center cursor-pointer transition-all ${
                    correctaSeleccionada === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  C
                </button>
                <input
                  type="text"
                  value={opcioC}
                  onChange={e => setOpcioC(e.target.value)}
                  placeholder="Opció C..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                />
                {correctaSeleccionada === 2 && (
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-md">
                    Correcta
                  </span>
                )}
              </div>

              {/* Opció D */}
              <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                correctaSeleccionada === 3 ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setCorrectaSeleccionada(3)}
                  className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center cursor-pointer transition-all ${
                    correctaSeleccionada === 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  D
                </button>
                <input
                  type="text"
                  value={opcioD}
                  onChange={e => setOpcioD(e.target.value)}
                  placeholder="Opció D..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                />
                {correctaSeleccionada === 3 && (
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-md">
                    Correcta
                  </span>
                )}
              </div>
            </div>

            {/* EXPLICACIÓ / JUSTIFICACIÓ */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Explicació o Article de la Llei (Opcional)
              </label>
              <textarea
                value={novaExplicacio}
                onChange={e => setNovaExplicacio(e.target.value)}
                rows={2}
                placeholder="Ex: Segons l'article 54 de la Llei de Policies Locals..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FFDF00]"
              />
            </div>

            {/* BOTÓ DESAR */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPestanya('menu')}
                className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                className="bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Desar Pregunta
              </button>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* PESTANYA 3: SIMULACRE DE TEST                                     */}
        {/* ================================================================= */}
        {pestanya === 'test' && (
          <div className="animate-in fade-in duration-300">
            {preguntes.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center">
                <p className="text-slate-400 text-sm">Encara no hi ha cap pregunta al banc de Tremp.</p>
                <button
                  onClick={() => setPestanya('crear')}
                  className="mt-4 bg-[#FFDF00] text-slate-950 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Afegir la primera pregunta
                </button>
              </div>
            ) : testFinalitzat ? (
              /* RESULTATS DEL TEST */
              <div className="bg-slate-900/90 border border-[#FFDF00]/30 p-8 rounded-3xl text-center max-w-xl mx-auto shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-[#FFDF00]/20 text-[#FFDF00] flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-wider text-white">
                  Simulacre Completat!
                </h2>
                <p className="text-xs text-slate-400 mt-1">Has finalitzat totes les preguntes del banc de Tremp.</p>

                <div className="grid grid-cols-2 gap-4 my-8">
                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl">
                    <span className="text-3xl font-black text-emerald-400">{encerts}</span>
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300 mt-1">Encerts</p>
                  </div>
                  <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-2xl">
                    <span className="text-3xl font-black text-red-400">{errades}</span>
                    <p className="text-[10px] font-black uppercase tracking-wider text-red-300 mt-1">Errades</p>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={iniciarSimulacre}
                    className="bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Repetir Simulacre
                  </button>
                  <button
                    onClick={() => setPestanya('menu')}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Tornar al Menú
                  </button>
                </div>
              </div>
            ) : (
              /* PREGUNTA ACTUAL */
              <div className="bg-slate-900/90 border border-blue-900/40 p-6 sm:p-8 rounded-3xl shadow-2xl">
                
                {/* PROGRÉS I ACCIÓ DE MODIFICAR */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FFDF00]">
                      Pregunta {indexPreguntaTest + 1} de {preguntes.length}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {preguntaActual?.tema || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {preguntaActual && (
                      <>
                        <button
                          type="button"
                          onClick={() => obrirModalEdicio(preguntaActual)}
                          title="Modificar aquesta pregunta a la base de dades"
                          className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Modificar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => sollicitarEliminacio(preguntaActual)}
                          title="Eliminar aquesta pregunta de la base de dades"
                          className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </>
                    )}
                    <div className="flex items-center gap-2 text-xs font-black pl-2 border-l border-slate-800">
                      <span className="text-emerald-400">✓ {encerts}</span>
                      <span className="text-red-400">✕ {errades}</span>
                    </div>
                  </div>
                </div>

                {/* ENUNCIAT */}
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed mb-6">
                  {preguntaActual?.enunciat}
                </h3>

                {/* 4 OPCIONS */}
                <div className="space-y-3 mb-6">
                  {preguntaActual?.opcions.map((opc, idx) => {
                    const lletra = ['A', 'B', 'C', 'D'][idx];
                    const esTriada = respostaTriada === idx;
                    const esCorrecta = idx === preguntaActual.indexCorrecta;

                    let estil = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700';

                    if (revelarResposta) {
                      if (esCorrecta) {
                        estil = 'bg-emerald-950/60 border-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/10';
                      } else if (esTriada && !esCorrecta) {
                        estil = 'bg-red-950/60 border-red-500 text-red-200';
                      } else {
                        estil = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => seleccionarOpcioTest(idx)}
                        disabled={revelarResposta}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${estil}`}
                      >
                        <span className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                          revelarResposta && esCorrecta 
                            ? 'bg-emerald-500 text-slate-950' 
                            : revelarResposta && esTriada && !esCorrecta
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {lletra}
                        </span>
                        <span className="text-xs sm:text-sm flex-1">{opc}</span>
                        {revelarResposta && esCorrecta && (
                          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        {revelarResposta && esTriada && !esCorrecta && (
                          <X className="w-5 h-5 text-red-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* EXPLICACIÓ DESPRÉS DE RESPONDRE */}
                {revelarResposta && (
                  <div className="mb-6 p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 animate-in fade-in">
                    <p className="text-[11px] font-black uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Justificació Oficial:</span>
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {preguntaActual?.explicacio || `La resposta correcta és la ${['A', 'B', 'C', 'D'][preguntaActual?.indexCorrecta]}.`}
                    </p>
                  </div>
                )}

                {/* BOTÓ SEGÜENT PREGUNTA */}
                {revelarResposta && (
                  <div className="flex justify-end">
                    <button
                      onClick={seguentPreguntaTest}
                      className="bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      {indexPreguntaTest + 1 < preguntes.length ? 'Següent Pregunta →' : 'Veure Resultats Finals'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* PESTANYA 4: BANC DE PREGUNTES (LLISTAT COMPLET)                   */}
        {/* ================================================================= */}
        {pestanya === 'llistat' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black italic uppercase tracking-wider text-slate-300">
                Totes les Preguntes ({preguntes.length})
              </h2>
              <button
                onClick={() => setPestanya('crear')}
                className="bg-[#FFDF00] text-slate-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                + Afegir Pregunta
              </button>
            </div>

            {preguntes.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="bg-slate-900/70 border border-slate-800/80 p-5 rounded-2xl hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-[#FFDF00] bg-[#FFDF00]/10 px-2 py-0.5 rounded-md">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                        {item.tema}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-white mb-3">
                      {item.enunciat}
                    </p>

                    {/* Llistat d'opcions en petit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {item.opcions.map((opc, opcIdx) => (
                        <div 
                          key={opcIdx}
                          className={`p-2 rounded-lg border ${
                            opcIdx === item.indexCorrecta 
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold' 
                              : 'bg-slate-950 border-slate-900 text-slate-400'
                          }`}
                        >
                          <span className="font-mono mr-1.5">{['A', 'B', 'C', 'D'][opcIdx]})</span>
                          {opc}
                        </div>
                      ))}
                    </div>

                    {item.explicacio && (
                      <p className="text-[11px] text-slate-400 mt-2 italic bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                        💡 {item.explicacio}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => obrirModalEdicio(item)}
                      title="Modificar / Editar aquesta pregunta"
                      className="flex items-center gap-1 text-slate-400 hover:text-amber-300 px-2.5 py-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Modificar</span>
                    </button>

                    <button
                      onClick={() => sollicitarEliminacio(item)}
                      title="Eliminar aquesta pregunta de la base de dades"
                      className="flex items-center gap-1 text-slate-400 hover:text-red-400 px-2.5 py-1.5 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Esborrar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* FINESTRA MODAL PER A MODIFICAR / EDITAR UNA PREGUNTA DE LA BBDD       */}
      {/* Comentari planer per a no-programadors: Aquesta finestra s'obre quan */}
      {/* fas clic a "Modificar pregunta". Et permet canviar l'enunciat, les    */}
      {/* opcions, la resposta correcta o l'explicació si la IA s'ha equivocat. */}
      {/* ===================================================================== */}
      {preguntaAEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Capçalera del modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[#FFDF00]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Modificar Pregunta de la Base de Dades
                  </h3>
                  <p className="text-xs text-slate-400">
                    Corregeix o perfecciona el text i les opcions de la pregunta
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={tancarModalEdicio}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulari d'edició */}
            <form onSubmit={guardarCanvisEdicio} className="space-y-4">
              
              {/* Tema */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Tema / Àmbit
                </label>
                <input
                  type="text"
                  value={editTema}
                  onChange={(e) => setEditTema(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="Ex: Policia Local Tremp - Ordenances"
                />
              </div>

              {/* Enunciat */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Enunciat de la Pregunta
                </label>
                <textarea
                  value={editEnunciat}
                  onChange={(e) => setEditEnunciat(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="Escriu la pregunta aquí..."
                  required
                />
              </div>

              {/* 4 Opcions amb selector de la correcta */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Opcions de resposta (marca la rodona de la que sigui correcta)
                </label>

                {[
                  { lletra: 'A', val: editOpcioA, setVal: setEditOpcioA, idx: 0 },
                  { lletra: 'B', val: editOpcioB, setVal: setEditOpcioB, idx: 1 },
                  { lletra: 'C', val: editOpcioC, setVal: setEditOpcioC, idx: 2 },
                  { lletra: 'D', val: editOpcioD, setVal: setEditOpcioD, idx: 3 },
                ].map((itemOpc) => (
                  <div key={itemOpc.lletra} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditCorrecta(itemOpc.idx)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all cursor-pointer ${
                        editCorrecta === itemOpc.idx
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      title={`Marcar opció ${itemOpc.lletra} com a resposta correcta`}
                    >
                      {itemOpc.lletra}
                    </button>
                    <input
                      type="text"
                      value={itemOpc.val}
                      onChange={(e) => itemOpc.setVal(e.target.value)}
                      className={`flex-1 bg-slate-950 border rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors ${
                        editCorrecta === itemOpc.idx
                          ? 'border-emerald-500/50 bg-emerald-950/20'
                          : 'border-slate-800 focus:border-amber-400'
                      }`}
                      placeholder={`Text per a l'opció ${itemOpc.lletra}...`}
                      required
                    />
                    {editCorrecta === itemOpc.idx && (
                      <span className="text-emerald-400 text-xs font-bold shrink-0 hidden sm:inline">
                        ✓ Correcta
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explicació / Justificació */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Explicació / Fonament Jurídic (Opcional)
                </label>
                <textarea
                  value={editExplicacio}
                  onChange={(e) => setEditExplicacio(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  placeholder="Explicació de per què aquesta opció és la vàlida..."
                />
              </div>

              {/* Botons d'acció */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
                {/* Botó per eliminar la pregunta directament des de la finestra d'edició */}
                <button
                  type="button"
                  onClick={() => {
                    const p = preguntaAEditar;
                    tancarModalEdicio();
                    sollicitarEliminacio(p);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Pregunta</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={tancarModalEdicio}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel·lar
                  </button>
                  <button
                    type="submit"
                    disabled={guardantEdicio}
                    className="bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {guardantEdicio ? 'Desant canvis...' : 'Desar Modificacions'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FINESTRA MODAL DE CONFIRMACIÓ D'ELIMINACIÓ (100% lliure de bloquejos)      */}
      {/* ========================================================================= */}
      {preguntaAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/30 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            
            {/* Capçalera d'avís */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Eliminar Pregunta
                </h3>
                <p className="text-xs text-slate-400">
                  Aquesta acció esborrarà la pregunta de la base de dades de Tremp
                </p>
              </div>
            </div>

            {/* Caixa amb resum de la pregunta a esborrar */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
                "{preguntaAEliminar.enunciat}"
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  {preguntaAEliminar.tema}
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Opció correcta: {['A', 'B', 'C', 'D'][preguntaAEliminar.indexCorrecta]}
                </span>
              </div>
            </div>

            <p className="text-xs text-red-300/80">
              Segur que vols eliminar aquesta pregunta? Desapareixerà definitivament del banc de preguntes i dels simulacres de test.
            </p>

            {/* Botons Cancel·lar i Confirmar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreguntaAEliminar(null)}
                disabled={eliminant}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel·lar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacio}
                disabled={eliminant}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{eliminant ? 'Eliminant...' : 'Sí, Eliminar'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// ============================================================================
// PREGUNTES OFICIALS BASE PER A LA POLICIA LOCAL DE TREMP
// (Exemples adaptats a la normativa de policia local i municipi)
// ============================================================================
const PREGUNTES_BASE_TREMP: PreguntaTremp[] = [
  {
    id: 'base_1',
    enunciat: 'Segons la Llei 16/1991, de les policies locals de Catalunya, quin rang de comandament ostenta el cap del cos de la policia local?',
    opcions: [
      'El de la categoria més alta que existeixi a la plantilla de la policia del municipi',
      'Sempre el rang d’Inspector o Sotsinspector',
      'El de comissari principal de la policia local',
      'El de sergent o caporal en tots els casos'
    ],
    indexCorrecta: 0,
    tema: 'Llei 16/1991 Policies Locals',
    explicacio: 'L’article 25 de la Llei 16/1991 estableix que el cap del cos és la categoria més alta que existeixi a la plantilla del municipi corresponent.'
  },
  {
    id: 'base_2',
    enunciat: 'A quin municipi i comarca pertany administrativament la Policia Local de Tremp?',
    opcions: [
      'Municipi de Tremp, capital de la comarca del Pallars Jussà',
      'Municipi de Tremp, comarca de l’Alt Urgell',
      'Municipi de Tremp, comarca del Pallars Sobirà',
      'Municipi de Tremp, comarca de la Noguera'
    ],
    indexCorrecta: 0,
    tema: 'Territori i Marc Municipal de Tremp',
    explicacio: 'Tremp és el cap del municipi i la capital històrica i administrativa de la comarca del Pallars Jussà.'
  },
  {
    id: 'base_3',
    enunciat: 'Quin dels següents és un principi bàsic d’actuació de les forces i cossos de seguretat segons la Llei Orgànica 2/1986?',
    opcions: [
      'Adequació, necessitat i proporcionalitat en l’ús dels mitjans i la força',
      'Lliure albir en situacions de control de trànsit',
      'Prioritat econòmica de la recaptació sobre la prevenció',
      'Absoluta subjecció a ordres superiors encara que siguin il·legals'
    ],
    indexCorrecta: 0,
    tema: 'LO 2/1986 Forces i Cossos de Seguretat',
    explicacio: 'L’ús de la força es regeix imperativament pels principis de congruència, oportunitat i proporcionalitat segons l’art. 5 de la LO 2/1986.'
  }
];
export default ProvaPLTrempWeb;
