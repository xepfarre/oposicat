// Explicació per a no-programadors:
// Aquest fitxer és el component "Lego" encarregat de:
// "2. Eina de gestió - Professorat" -> "3- Historial - Alumne concret".
// Permet als professors:
// 1. Triar un alumne de l'acadèmia.
// 2. Escriure i desar notes, observacions i reflexions de seguiment d'aquell alumne.
// 3. Compartir aquestes notes perquè qualsevol altre professor que li faci classe pugui llegir-les de forma clara i ràpida.
// 4. Modificar o eliminar notes pròpies, i filtrar per text o categoria (ex: "Punts febles", "Consells", "Seguiment general").

import React, { useState, useEffect } from 'react';
import { 
  Clock, Plus, Search, Tag, Edit3, Trash2, Check, X, 
  Sparkles, ArrowLeft, Copy, CheckCircle2, AlertCircle, 
  ChevronDown, UserCheck, MessageSquare, Send, Calendar,
  User, RefreshCw, Bookmark, Share2, HelpCircle
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  query, where, orderBy 
} from 'firebase/firestore';

export interface NotaHistorialDocent {
  id?: string;
  alumneId: string;
  alumneNom: string;
  alumneEmail?: string;
  professorId?: string;
  professorNom: string;
  professorEmail?: string;
  titol: string;
  contingut: string;
  etiqueta?: string;
  creatEl: string;
  actualitzatEl?: string;
}

interface HistorialAlumneConcretProps {
  darkMode: boolean;
  alumneInicial?: any;
  onTornar?: () => void;
}

// Categories suggerides per a les notes entre docents
const CATEGORIES_NOTES_DOCENTS: string[] = [
  "Seguiment general",
  "Consell per a pròxima entrevista",
  "Punts febles / Línies vermelles",
  "Punts forts i evolució positiva",
  "Revisió Biodata i coherència",
  "Comunicació no verbal / Postura"
];

export default function HistorialAlumneConcret({
  darkMode,
  alumneInicial,
  onTornar
}: HistorialAlumneConcretProps) {

  // =========================================================================
  // 1. ESTATS DE L'ALUMNE
  // =========================================================================
  const [alumneActiu, setAlumneActiu] = useState<any | null>(alumneInicial || null);
  const [llistaAlumnes, setLlistaAlumnes] = useState<any[]>([]);
  const [desplegableAlumnesObert, setDesplegableAlumnesObert] = useState<boolean>(false);
  const [cercaAlumneText, setCercaAlumneText] = useState<string>('');

  const alumneId = alumneActiu?.id || alumneActiu?.uid || '';
  const nomAlumne = alumneActiu?.nom || alumneActiu?.displayName || alumneActiu?.email || 'Alumne seleccionat';

  // =========================================================================
  // 2. ESTATS DE LES NOTES DEL PROFESSORAT
  // =========================================================================
  const [notes, setNotes] = useState<NotaHistorialDocent[]>([]);
  const [carregant, setCarregant] = useState<boolean>(false);
  const [cercaNotes, setCercaNotes] = useState<string>('');
  const [filtreCategoria, setFiltreCategoria] = useState<string | null>(null);

  // Formulari de nova nota
  const [nomProfessor, setNomProfessor] = useState<string>(
    auth?.currentUser?.displayName || auth?.currentUser?.email?.split('@')[0] || 'Professor/a OposiCAT'
  );
  const [titolNota, setTitolNota] = useState<string>('');
  const [contingutNota, setContingutNota] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Seguiment general');

  // Mode edició
  const [notaEnEdicioId, setNotaEnEdicioId] = useState<string | null>(null);
  const [desant, setDesant] = useState<boolean>(false);
  const [missatgeInfo, setMissatgeInfo] = useState<string | null>(null);
  const [copiatNotaId, setCopiatNotaId] = useState<string | null>(null);

  // =========================================================================
  // 3. CARREGAR LLISTA D'ALUMNES
  // =========================================================================
  useEffect(() => {
    const carregarUsuaris = async () => {
      if (!db) return;
      try {
        const snap = await getDocs(collection(db, 'usuaris'));
        if (!snap.empty) {
          const usuaris = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setLlistaAlumnes(usuaris);
          if (!alumneActiu && usuaris.length > 0) {
            setAlumneActiu(usuaris[0]);
          }
        }
      } catch (err) {
        console.error("Error carregant alumnes:", err);
      }
    };
    carregarUsuaris();
  }, []);

  // =========================================================================
  // 4. CARREGAR NOTES DOCENTS DE L'ALUMNE DE FIRESTORE
  // =========================================================================
  const carregarNotes = async () => {
    if (!alumneId) {
      setNotes([]);
      setCarregant(false);
      return;
    }

    setCarregant(true);
    try {
      if (db) {
        const q = query(
          collection(db, 'notes_historial_docent'),
          where('alumneId', '==', alumneId)
        );
        const snap = await getDocs(q);
        const llista: NotaHistorialDocent[] = [];
        snap.forEach(docSnap => {
          llista.push({ id: docSnap.id, ...docSnap.data() } as NotaHistorialDocent);
        });

        // Ordenem les notes de més recents a més antigues
        llista.sort((a, b) => {
          const dataA = a.creatEl || '';
          const dataB = b.creatEl || '';
          return dataB.localeCompare(dataA);
        });

        setNotes(llista);
      }
    } catch (err) {
      console.error("Error carregant notes de l'alumne:", err);
    } finally {
      setCarregant(false);
    }
  };

  useEffect(() => {
    carregarNotes();
  }, [alumneId]);

  // =========================================================================
  // 5. DESAR O ACTUALITZAR NOTA DOCENT
  // =========================================================================
  const desarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contingutNota.trim() || !alumneId) return;

    setDesant(true);
    try {
      const dataHoraActual = new Date().toISOString();

      const dades: Partial<NotaHistorialDocent> = {
        alumneId: alumneId,
        alumneNom: nomAlumne,
        alumneEmail: alumneActiu?.email || '',
        professorId: auth?.currentUser?.uid || 'docent-admin',
        professorNom: nomProfessor.trim() || 'Professor/a OposiCAT',
        professorEmail: auth?.currentUser?.email || '',
        titol: titolNota.trim() || 'Anotació de seguiment',
        contingut: contingutNota.trim(),
        etiqueta: categoriaSeleccionada,
        actualitzatEl: dataHoraActual
      };

      if (notaEnEdicioId) {
        // Mode edició
        if (db) {
          await updateDoc(doc(db, 'notes_historial_docent', notaEnEdicioId), dades);
          setNotes(prev => prev.map(n => n.id === notaEnEdicioId ? { ...n, ...dades } : n));
        }
        setMissatgeInfo("Nota actualitzada correctament.");
        setNotaEnEdicioId(null);
      } else {
        // Mode creació
        dades.creatEl = dataHoraActual;
        if (db) {
          const docRef = await addDoc(collection(db, 'notes_historial_docent'), dades);
          setNotes(prev => [{ id: docRef.id, ...dades } as NotaHistorialDocent, ...prev]);
        }
        setMissatgeInfo("Nova nota compartida amb l'equip docent correctament.");
      }

      // Netejar formulari
      setTitolNota('');
      setContingutNota('');
      setTimeout(() => setMissatgeInfo(null), 3500);
    } catch (err) {
      console.error("Error desant la nota docent:", err);
      alert("S'ha produït un error en desar la nota.");
    } finally {
      setDesant(false);
    }
  };

  const iniciarEdicio = (n: NotaHistorialDocent) => {
    setNotaEnEdicioId(n.id || null);
    setTitolNota(n.titol || '');
    setContingutNota(n.contingut || '');
    setNomProfessor(n.professorNom || '');
    setCategoriaSeleccionada(n.etiqueta || 'Seguiment general');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancel·larEdicio = () => {
    setNotaEnEdicioId(null);
    setTitolNota('');
    setContingutNota('');
  };

  const eliminarNota = async (id: string) => {
    if (!window.confirm("Segur que vols eliminar aquesta nota docent?")) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'notes_historial_docent', id));
      }
      setNotes(prev => prev.filter(n => n.id !== id));
      setMissatgeInfo("Nota eliminada.");
      setTimeout(() => setMissatgeInfo(null), 3000);
    } catch (err) {
      console.error("Error eliminant la nota:", err);
    }
  };

  const copiarNota = (n: NotaHistorialDocent) => {
    const text = `[NOTA DOCENT - OPOSICAT]\nAlumne: ${n.alumneNom}\nProfessor: ${n.professorNom}\nData: ${new Date(n.creatEl).toLocaleDateString('ca-ES')}\nCategoria: ${n.etiqueta || 'General'}\nTítol: ${n.titol}\n\n${n.contingut}`;
    navigator.clipboard.writeText(text);
    if (n.id) {
      setCopiatNotaId(n.id);
      setTimeout(() => setCopiatNotaId(null), 2000);
    }
  };

  // =========================================================================
  // 6. FILTRATGE DE NOTES
  // =========================================================================
  const notesFiltrades = notes.filter(n => {
    const text = `${n.titol} ${n.contingut} ${n.professorNom} ${n.etiqueta}`.toLowerCase();
    const passaCerca = cercaNotes ? text.includes(cercaNotes.toLowerCase()) : true;
    const passaCategoria = filtreCategoria ? n.etiqueta === filtreCategoria : true;
    return passaCerca && passaCategoria;
  });

  const alumnesFiltrats = llistaAlumnes.filter(u => {
    const nom = (u.nom || u.displayName || u.email || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const cerca = cercaAlumneText.toLowerCase();
    return nom.includes(cerca) || email.includes(cerca);
  });

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
                <Clock className="w-3 h-3" />
                3- Historial - Alumne concret
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Notes compartides entre professors
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1">
              Historial Docent de {nomAlumne}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Escriu observacions, consells i seguiment d'aquest alumne perquè qualsevol altre professor pugui consultar-les.
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
              <span className="truncate max-w-[160px]">{nomAlumne}</span>
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

          <button
            onClick={carregarNotes}
            disabled={carregant}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
            title="Actualitzar llista de notes"
          >
            <RefreshCw className={`w-4 h-4 ${carregant ? 'animate-spin text-blue-500' : ''}`} />
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
      {/* FORMULARI PER ESCRIURE UNA NOTA PER A ALTRES PROFESSORS */}
      {/* ========================================================================= */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {notaEnEdicioId ? 'Modificar Nota Docent' : `Escriure nova nota sobre ${nomAlumne}`}
            </h3>
          </div>
          {notaEnEdicioId && (
            <button
              onClick={cancel·larEdicio}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              Cancel·lar edició
            </button>
          )}
        </div>

        <form onSubmit={desarNota} className="flex flex-col gap-4">
          
          {/* REIXA SUPERIOR: PROFESSOR, CATEGORIA I TÍTOL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* AUTOR / PROFESSOR */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Professor autor:
              </label>
              <input
                type="text"
                value={nomProfessor}
                onChange={(e) => setNomProfessor(e.target.value)}
                placeholder="El teu nom..."
                className={`w-full p-2.5 rounded-xl border text-xs outline-none font-bold ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            {/* CATEGORIA */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tipus de nota / Categoria:
              </label>
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs outline-none font-bold cursor-pointer ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {CATEGORIES_NOTES_DOCENTS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* TÍTOL RESUM */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Títol / Resum breu:
              </label>
              <input
                type="text"
                value={titolNota}
                onChange={(e) => setTitolNota(e.target.value)}
                placeholder="Ex: Sessió 2: Millora en comunicació"
                className={`w-full p-2.5 rounded-xl border text-xs outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

          </div>

          {/* TEXTAREA PRINCIPAL DE LA NOTA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Contingut de l'observació pedagògica per a l'equip: *
            </label>
            <textarea
              required
              rows={4}
              value={contingutNota}
              onChange={(e) => setContingutNota(e.target.value)}
              placeholder="Escriu aquí el que vulguis que altres professors sàpiguen sobre aquest alumne (punts febles detectats, consells per a la pròxima classe, aspectes a reforçar o felicitar)..."
              className={`w-full p-3 rounded-2xl border text-sm outline-none transition-all leading-relaxed ${
                darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
              }`}
            />
          </div>

          {/* BOTÓ D'ENVIAMENT */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Aquesta nota quedarà desada al perfil de {nomAlumne} i serà visible per a tots els professors.
            </span>
            <button
              type="submit"
              disabled={desant || !contingutNota.trim()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {desant ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{notaEnEdicioId ? "Guardar canvis" : "Publicar Nota Docent"}</span>
            </button>
          </div>

        </form>
      </div>

      {/* ========================================================================= */}
      {/* BARRA DE CERCA I FILTRES DE NOTES */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* CERCA */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cercar a les notes d'aquest alumne..."
            value={cercaNotes}
            onChange={(e) => setCercaNotes(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs outline-none transition-all ${
              darkMode ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
          {cercaNotes && (
            <button
              onClick={() => setCercaNotes('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* FILTRE PER CATEGORIA */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFiltreCategoria(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filtreCategoria === null
                ? 'bg-blue-600 text-white'
                : darkMode ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Totes ({notes.length})
          </button>
          {CATEGORIES_NOTES_DOCENTS.map(cat => {
            const num = notes.filter(n => n.etiqueta === cat).length;
            if (num === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setFiltreCategoria(cat === filtreCategoria ? null : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  filtreCategoria === cat
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] opacity-75">({num})</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* HISTÒRIC DE NOTES COMPARTIDES (FEED CRONOLÒGIC) */}
      {/* ========================================================================= */}
      {carregant ? (
        <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Carregant l'historial de notes de {nomAlumne}...</span>
        </div>
      ) : notesFiltrades.length === 0 ? (
        <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center gap-3 ${
          darkMode ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {cercaNotes || filtreCategoria ? "Cap nota coincideix amb la cerca" : "Encara no hi ha notes d'aquest alumne"}
          </h3>
          <p className="text-xs max-w-md leading-relaxed">
            {cercaNotes || filtreCategoria 
              ? "Prova de treure els filtres o el text de cerca."
              : `Fes servir el formulari superior per escriure la primera nota sobre ${nomAlumne}. Tots els professors podran llegir-la.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notesFiltrades.map(n => {
            let dataFormatada = 'Sense data';
            if (n.creatEl) {
              try {
                dataFormatada = new Date(n.creatEl).toLocaleString('ca-ES', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                });
              } catch (_) {
                dataFormatada = String(n.creatEl);
              }
            }

            return (
              <div
                key={n.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col gap-3 shadow-sm ${
                  darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                {/* ENCAPÇALAMENT DE LA NOTA: PROFESSOR, DATA I CATEGORIA */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs uppercase shrink-0">
                      {(n.professorNom || 'P')[0]}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {n.professorNom}
                        </span>
                        {n.etiqueta && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {n.etiqueta}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {dataFormatada}
                      </span>
                    </div>
                  </div>

                  {/* ACCIONS DE LA NOTA */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copiarNota(n)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      title="Copiar contingut de la nota"
                    >
                      {copiatNotaId === n.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => iniciarEdicio(n)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      title="Editar nota"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => n.id && eliminarNota(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      title="Eliminar nota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* TÍTOL I TEXT DE L'OBSERVACIÓ */}
                <div className="flex flex-col gap-1.5">
                  {n.titol && (
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {n.titol}
                    </h4>
                  )}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {n.contingut}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
