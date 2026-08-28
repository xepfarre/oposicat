import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, Edit2, Check, AlertCircle, Search, 
  EyeOff, Eye, RefreshCw, Star, ArrowLeft, ArrowUpRight, HelpCircle
} from "lucide-react";
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, writeBatch } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { MAP_COMPETENCIES, PreguntaBiodata } from "./preguntes_biodata";

/**
 * COMPONENT: GestioBiodata
 * Permet gestionar les 80 preguntes oficials de la prova de Biodata a la BBDD de Firestore.
 * Inclou alta de noves preguntes, modificació, suspensió, eliminació definitiva i importació per defecte.
 */
export default function GestioBiodata({ onTornar }: { onTornar: () => void }) {
  const [preguntes, setPreguntes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedComp, setSelectedComp] = useState<string>("TOTS");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Explicació per a no-programadors:
  // Estats per gestionar quantes preguntes es mostren a la vegada (per defecte 10) i en quina pàgina estem.
  const [limitPreguntes, setLimitPreguntes] = useState<number>(10);
  const [paginaActual, setPaginaActual] = useState<number>(1);

  // Explicació per a no-programadors:
  // Sempre que l'usuari faci una cerca o canviï el filtre de competència, reiniciem la pàgina a la primera (1) 
  // per evitar que l'alumne es quedi en una pàgina que ja no existeix amb el nou filtre aplicat.
  useEffect(() => {
    setPaginaActual(1);
  }, [search, selectedComp, limitPreguntes]);

  // Explicació per a no-programadors:
  // Control de diàleg de confirmació personalitzat a la interfície d'OposiCAT.
  // Això evita fer servir "window.confirm", que en molts navegadors moderns es bloqueja 
  // si l'aplicació s'executa a l'interior d'un marc (iframe).
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    titol: string;
    missatge: string;
    onConfirm: () => void;
  } | null>(null);

  const demanarConfirmacio = (titol: string, missatge: string, accio: () => void) => {
    setConfirmModal({
      isOpen: true,
      titol,
      missatge,
      onConfirm: () => {
        setConfirmModal(null);
        accio();
      }
    });
  };

  // Estats per als formularis d'alta i edició
  const [editingPregunta, setEditingPregunta] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mostrarGuia, setMostrarGuia] = useState(false);

  // Estat del formulari de pregunta
  const [formEnunciat, setFormEnunciat] = useState("");
  const [formCompetencia, setFormCompetencia] = useState<any>("HSC");
  const [formOpcions, setFormOpcions] = useState([
    { text: "", punts: 1, multidimensional: {} as Record<string, number> },
    { text: "", punts: 0, multidimensional: {} as Record<string, number> },
    { text: "", punts: -1, multidimensional: {} as Record<string, number> }
  ]);

  // Explicació per a no-programadors: 
  // Carreguem de manera asíncrona totes les preguntes de la col·lecció de Firestore.
  // El paràmetre 'silencios' permet actualitzar les dades en segon pla sense desmuntar la llista
  // ni fer que la pantalla salti amunt de tot.
  const carregarPreguntes = async (silencios: boolean = false) => {
    if (!silencios) {
      setLoading(true);
    }
    setError(null);
    try {
      const q = query(collection(db, "preguntes_biodata_oficial"), orderBy("id", "asc"));
      const snap = await getDocs(q);
      const llista: any[] = [];
      snap.forEach(docSnap => {
        llista.push({
          docId: docSnap.id,
          ...docSnap.data()
        });
      });
      // Endrecem per ID numèric
      llista.sort((a, b) => (a.id || 0) - (b.id || 0));
      setPreguntes(llista);
    } catch (e: any) {
      console.error("Error carregant preguntes de biodata oficial", e);
      setError("No s'ha pogut connectar amb la BBDD. S'ha detectat un error: " + e.message);
    } finally {
      if (!silencios) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    carregarPreguntes();
  }, []);

  // Explicació per a no-programadors:
  // Esborrat físic d'un document a la col·lecció de Firestore.
  // Primer eliminem de l'estat local per a una resposta instantània i actualitzem silenciosament.
  const handleBorrar = (docId: string, idNum: number) => {
    demanarConfirmacio(
      "ELIMINAR PREGUNTA DEFINITIVAMENT",
      `Segur que vols eliminar definitivament la pregunta #${idNum} de la base de dades? Aquesta acció és irreversible i deixarà l'historial d'alguns usuaris descompensat.`,
      async () => {
        try {
          setPreguntes(prev => prev.filter(p => p.docId !== docId));
          await deleteDoc(doc(db, "preguntes_biodata_oficial", docId));
          setInfoMessage(`Pregunta #${idNum} eliminada de forma definitiva.`);
          await carregarPreguntes(true);
        } catch (e: any) {
          setError("Error en eliminar la pregunta: " + e.message);
        }
      }
    );
  };

  // Explicació per a no-programadors:
  // Posa en suspens o torna a habilitar una pregunta sense desmuntar la pantalla ni perdre la posició.
  const handleToggleSuspendre = async (docId: string, actualEstat: boolean, idNum: number) => {
    try {
      const nouEstat = !actualEstat;
      setPreguntes(prev => prev.map(p => p.docId === docId ? { ...p, suspensa: nouEstat } : p));
      await updateDoc(doc(db, "preguntes_biodata_oficial", docId), {
        suspensa: nouEstat
      });
      setInfoMessage(`Pregunta #${idNum} ${nouEstat ? "suspensa (invisible per a l'alumne)" : "activada (visible per a l'alumne)"}.`);
      await carregarPreguntes(true);
    } catch (e: any) {
      setError("Error en canviar l'estat de suspensió: " + e.message);
    }
  };

  // Prepara els estats per obrir el formulari d'edició
  const obrirModificar = (preg: any) => {
    setEditingPregunta(preg);
    setIsAdding(false);
    setFormEnunciat(preg.enunciat);
    setFormCompetencia(preg.competencia);
    // Fem còpia profunda de les opcions per evitar lligams de memòria
    setFormOpcions(preg.opcions.map((op: any) => ({
      text: op.text,
      punts: op.punts,
      multidimensional: { ...op.multidimensional }
    })));
  };

  // Prepara els estats per obrir el formulari d'alta
  const obrirAlta = () => {
    setEditingPregunta(null);
    setIsAdding(true);
    setFormEnunciat("");
    setFormCompetencia("HSC");
    setFormOpcions([
      { text: "", punts: 2, multidimensional: {} },
      { text: "", punts: 0, multidimensional: {} },
      { text: "", punts: -2, multidimensional: {} }
    ]);
  };

  // Explicació per a no-programadors:
  // Desa el formulari tant d'edició com d'alta nova.
  // Quan modifiquem una pregunta existent, actualitzem immediatament la memòria (estat local)
  // i sincronitzem en segon pla ('silencios = true') per mantenir exactament la posició de l'usuari
  // a la pantalla sense salts sobtats.
  const handleDesarFormulari = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEnunciat.trim()) {
      alert("L'enunciat és obligatori.");
      return;
    }

    const targetId = editingPregunta ? editingPregunta.id : null;
    setIsSaving(true);

    try {
      if (isAdding) {
        // Generem una ID superior a les que tenim actualment
        const maxId = preguntes.reduce((max, p) => p.id > max ? p.id : max, 0);
        const novaPregunta = {
          id: maxId + 1,
          enunciat: formEnunciat,
          competencia: formCompetencia,
          suspensa: false,
          opcions: formOpcions.map(op => ({
            text: op.text,
            punts: Number(op.punts),
            multidimensional: op.multidimensional || {}
          }))
        };
        const refDoc = await addDoc(collection(db, "preguntes_biodata_oficial"), novaPregunta);
        setInfoMessage("S'ha creat la nova pregunta de Biodata amb èxit.");
        setPreguntes(prev => [...prev, { docId: refDoc.id, ...novaPregunta }].sort((a, b) => (a.id || 0) - (b.id || 0)));
        setEditingPregunta(null);
        setIsAdding(false);
        await carregarPreguntes(true);
      } else {
        // Modificar una de ja existent
        const docId = editingPregunta.docId;
        const novesOpcions = formOpcions.map(op => ({
          text: op.text,
          punts: Number(op.punts),
          multidimensional: op.multidimensional || {}
        }));

        await updateDoc(doc(db, "preguntes_biodata_oficial", docId), {
          enunciat: formEnunciat,
          competencia: formCompetencia,
          opcions: novesOpcions
        });

        // Actualitzem l'estat local de forma immediata
        setPreguntes(prev => prev.map(p => {
          if (p.docId === docId || p.id === targetId) {
            return {
              ...p,
              enunciat: formEnunciat,
              competencia: formCompetencia,
              opcions: novesOpcions
            };
          }
          return p;
        }));

        setInfoMessage(`Pregunta #${targetId} modificada correctament.`);
        setEditingPregunta(null);
        setIsAdding(false);

        // Recàrrega silenciosa en segon pla
        await carregarPreguntes(true);

        // Assegurem que l'element continuï enfocat i visible a la mateixa alçada
        if (targetId) {
          setTimeout(() => {
            const el = document.getElementById(`pregunta-card-${targetId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 50);
        }
      }
    } catch (e: any) {
      setError("Error desant el formulari: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Funció per editar un valor multidimensional específic
  const canviarValorMultidimensional = (opcioIndex: number, compCode: string, valor: number) => {
    const novesOpcions = [...formOpcions];
    if (!novesOpcions[opcioIndex].multidimensional) {
      novesOpcions[opcioIndex].multidimensional = {};
    }
    if (valor === 0) {
      delete novesOpcions[opcioIndex].multidimensional[compCode];
    } else {
      novesOpcions[opcioIndex].multidimensional[compCode] = valor;
    }
    setFormOpcions(novesOpcions);
  };

  // Explicació per a no-programadors:
  // Funció reutilitzable que renderitza el formulari complet de pregunta (enunciat, competència clau,
  // les 3 opcions A/B/C, punts core i les 10 competències multidimensionals).
  // Quan es fa servir per a una 'Nova Pregunta', es mostra a dalt; quan es modifica una pregunta de la llista,
  // es mostra directament al mateix lloc (inline) on estava la targeta de la pregunta.
  const renderFormulari = (titol: string, isInline: boolean = false) => (
    <div className={`rounded-3xl p-6 shadow-2xl transition-all duration-200 ${
      isInline 
        ? "bg-[#081b33] border-2 border-purple-500 ring-4 ring-purple-500/20" 
        : "bg-[#0a213a]/60 border border-purple-500/30"
    }`}>
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-purple-500/20">
        <h3 className="text-base md:text-lg font-black uppercase italic tracking-widest text-purple-300 flex items-center gap-2">
          <Star size={18} className="text-purple-400" />
          {titol}
        </h3>
        {isInline && (
          <span className="text-[9px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
            Edició directa al lloc
          </span>
        )}
      </div>

      <form onSubmit={handleDesarFormulari} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Enunciat de la pregunta</label>
          <textarea
            required
            rows={3}
            value={formEnunciat}
            onChange={e => setFormEnunciat(e.target.value)}
            placeholder="Exemple: Durant una intervenció tens un desacord greu amb el teu binomi davant del ciutadà. Com ho gestiones?"
            className="w-full bg-[#010915] border border-white/10 rounded-2xl p-4 font-bold text-xs md:text-sm text-white focus:border-purple-500/50 outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Competència Principal</label>
            <select
              value={formCompetencia}
              onChange={e => setFormCompetencia(e.target.value as any)}
              className="bg-[#010915] border border-white/10 rounded-2xl p-3.5 font-bold text-xs text-white focus:border-purple-500/50 outline-none cursor-pointer"
            >
              {MAP_COMPETENCIES.map(comp => (
                <option key={comp.id} value={comp.id} className="bg-[#010915] text-white">
                  [{comp.id}] - {comp.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* LES 3 RESPOSTES AMB VALORS DE COMPETÈNCIES */}
        <div className="flex flex-col gap-4 mt-2">
          <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest">
            Configuració de les 3 Opcions de Resposta
          </span>

          {formOpcions.map((op, opIndex) => {
            const prefix = opIndex === 0 ? "A" : opIndex === 1 ? "B" : "C";
            return (
              <div key={opIndex} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                  <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black flex items-center justify-center shrink-0">
                    {prefix}
                  </span>
                  <input
                    type="text"
                    required
                    value={op.text}
                    onChange={e => {
                      const nOpcions = [...formOpcions];
                      nOpcions[opIndex].text = e.target.value;
                      setFormOpcions(nOpcions);
                    }}
                    placeholder={`Text de l'opció ${prefix}...`}
                    className="flex-1 bg-[#010915] border border-white/10 rounded-xl px-4 py-2.5 font-semibold text-xs text-white focus:border-purple-500/50 outline-none w-full"
                  />
                  <div className="flex items-center gap-2 shrink-0 bg-[#010915] border border-white/10 px-3 py-1.5 rounded-xl">
                    <label className="text-[10px] font-black uppercase text-slate-300">Puntuació General:</label>
                    <input
                      type="number"
                      step="1"
                      value={op.punts}
                      onChange={e => {
                        const nOpcions = [...formOpcions];
                        nOpcions[opIndex].punts = Number(e.target.value);
                        setFormOpcions(nOpcions);
                      }}
                      className="w-16 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 font-black text-center text-sm text-emerald-400 focus:border-purple-500/50 outline-none"
                    />
                  </div>
                </div>

                {/* VALORS PER COMPETÈNCIA DIDÀCTICS I CLARS */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                        Impacte en les 10 Competències Policials:
                      </span>
                      <span className="text-[9px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                        Valors de -10 a +10
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 italic">
                      Com influeix triar aquesta resposta en cada habilitat del policia?
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {MAP_COMPETENCIES.map(comp => {
                      const val = op.multidimensional[comp.id] || 0;
                      return (
                        <div 
                          key={comp.id} 
                          className={`flex flex-col justify-between p-3 rounded-2xl border transition-all ${
                            val > 0 
                              ? "bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20" 
                              : val < 0 
                              ? "bg-red-950/20 border-red-500/40 ring-1 ring-red-500/20" 
                              : "bg-[#010915]/80 border-white/10 hover:border-purple-500/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <div className="flex flex-col min-w-0 pr-1">
                              <span className={`text-xs font-black leading-tight ${
                                val > 0 ? "text-emerald-300" : val < 0 ? "text-red-300" : "text-white"
                              }`}>
                                {comp.nomCurt}
                              </span>
                              <span className="text-[8.5px] text-slate-400 line-clamp-1 mt-0.5" title={comp.descripcio}>
                                {comp.resum}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 shrink-0">
                              {comp.id}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => canviarValorMultidimensional(opIndex, comp.id, Math.max(-10, val - 1))}
                              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 flex items-center justify-center text-xs font-black text-slate-300 transition-all cursor-pointer"
                              title="Restar 1 punt"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="-10"
                              max="10"
                              value={val}
                              onChange={e => canviarValorMultidimensional(opIndex, comp.id, Number(e.target.value))}
                              className={`flex-1 text-center font-black text-xs py-1 rounded-lg border outline-none transition-all ${
                                val > 0 
                                  ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/50" 
                                  : val < 0 
                                  ? "text-red-400 bg-red-500/15 border-red-500/50" 
                                  : "text-slate-400 bg-black/40 border-white/10"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => canviarValorMultidimensional(opIndex, comp.id, Math.min(10, val + 1))}
                              className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 flex items-center justify-center text-xs font-black text-slate-300 transition-all cursor-pointer"
                              title="Sumar 1 punt"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTONS DEL FORMULARI */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              setEditingPregunta(null);
              setIsAdding(false);
            }}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
          >
            {isSaving && <RefreshCw size={14} className="animate-spin text-white" />}
            <span>{isSaving ? "Desant Canvis..." : "Desar Canvis"}</span>
          </button>
        </div>
      </form>
    </div>
  );

  // Filtre de cerca i competència activa
  const preguntesFiltrades = preguntes.filter(p => {
    const compleixCerca = p.enunciat.toLowerCase().includes(search.toLowerCase()) || 
                          p.id.toString().includes(search);
    const compleixComp = selectedComp === "TOTS" || p.competencia === selectedComp;
    return compleixCerca && compleixComp;
  });

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#010915] text-white">
      {/* CAPÇALERA DEL PANNELL */}
      <div className="w-full bg-[#0a213a]/95 border-b border-white/10 px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-4 sticky -top-10 -mx-10 z-40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onTornar}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-slate-300 hover:text-white"
            title="Tornar"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <span className="text-purple-400 font-black uppercase text-[9px] tracking-[0.2em] block">
              Backoffice / Administració OposiCAT
            </span>
            <h1 className="text-lg md:text-xl font-black uppercase italic tracking-wider text-white">
              Gestió del Banc de <span className="text-purple-400">Biodata</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setMostrarGuia(prev => !prev)}
            className={`border px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
              mostrarGuia 
                ? "bg-purple-600/30 border-purple-500/50 text-purple-300 shadow-lg" 
                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
            }`}
            title="Mostra la guia detallada de les 10 competències clau del cos policial"
          >
            <HelpCircle size={15} className="text-purple-400" />
            {mostrarGuia ? "Amagar Guia" : "Guia Competències"}
          </button>

          <button
            onClick={() => carregarPreguntes(false)}
            className="bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Sincronitza i descarrega l'estat actual de la base de dades Firestore"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refrescar BBDD
          </button>

          <button
            onClick={obrirAlta}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} /> Nova Pregunta
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* GUIA DIDÀCTICA DE COMPETÈNCIES CLAU */}
        {mostrarGuia && (
          <div className="bg-[#091b30] border border-purple-500/30 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                  <Star size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-purple-200">
                    Guia de Competències Clau Policials
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Aquestes són les 10 dimensions conductuals oficials avaluades al test psicotècnic de Biodata:
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setMostrarGuia(false)} 
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕ Tancar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {MAP_COMPETENCIES.map(comp => (
                <div 
                  key={comp.id} 
                  className="bg-[#010915]/80 border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1.5 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-white leading-tight">
                      {comp.nomCurt}
                    </span>
                    <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {comp.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-300/80 leading-tight">
                    {comp.nom}
                  </span>
                  <p className="text-[9.5px] text-slate-400 leading-relaxed mt-1 flex-1">
                    {comp.descripcio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL D'ALERTA O NOTA INFORMATIVA */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-300 text-xs font-bold shadow-lg">
            <AlertCircle size={20} className="shrink-0 text-red-400" />
            <p>{error}</p>
          </div>
        )}

        {infoMessage && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-300 text-xs font-bold shadow-lg animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <Check size={20} className="shrink-0 text-emerald-400" />
              <p>{infoMessage}</p>
            </div>
            <button onClick={() => setInfoMessage(null)} className="text-emerald-400 hover:underline text-[9px] font-black uppercase tracking-widest">Tancar</button>
          </div>
        )}

        {/* Explicació per a no-programadors:
            Només mostrem el formulari a la part superior quan estem creant una 'Nova Pregunta' des de zero.
            Quan estem modificant una pregunta existent, s'editarà directament a la seva posició a la llista (inline).
        */}
        {isAdding && (
          <div className="animate-in zoom-in-95 duration-200">
            {renderFormulari("Crear Nova Pregunta de Biodata", false)}
          </div>
        )}

        {/* FILTRES I CERCA DE PREGUNTES */}
        <div className="bg-[#0a213a]/30 border border-white/5 rounded-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-2xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cerca per enunciat o ID..."
                className="w-full bg-[#010915] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-xs md:text-sm text-white focus:border-purple-500/50 outline-none font-bold"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-[#010915] border border-white/10 rounded-2xl px-4 py-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mostrar:</span>
              <select
                value={limitPreguntes}
                onChange={e => {
                  setLimitPreguntes(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="bg-transparent text-xs font-black text-purple-400 outline-none cursor-pointer focus:text-purple-300"
              >
                <option value={10} className="bg-[#0c1d33] text-white">10 files</option>
                <option value={20} className="bg-[#0c1d33] text-white">20 files</option>
                <option value={50} className="bg-[#0c1d33] text-white">50 files</option>
                <option value={100} className="bg-[#0c1d33] text-white">100 files</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Competència:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedComp("TOTS")}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedComp === "TOTS" ? "bg-purple-600 text-white shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Totes
              </button>
              {MAP_COMPETENCIES.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedComp(comp.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                    selectedComp === comp.id ? "bg-purple-600 text-white font-black shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                  title={`${comp.nom}: ${comp.descripcio}`}
                >
                  <span>{comp.nomCurt}</span>
                  <span className="opacity-60 text-[8px] font-mono">[{comp.id}]</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BANC DE PREGUNTES */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <RefreshCw className="animate-spin text-purple-400" size={32} />
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Carregant preguntes de Biodata...</span>
          </div>
        ) : preguntesFiltrades.length === 0 ? (
          <div className="bg-[#0a213a]/20 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
            <HelpCircle size={40} className="text-slate-500" />
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">No s'han trobat preguntes</h4>
              <p className="text-slate-500 text-xs max-w-sm">
                No hi ha cap pregunta registrada que coincideixi amb la cerca o el banc està buit a Firestore. Pots afegir noves preguntes fent servir el botó de creació situat a dalt.
              </p>
            </div>
            {preguntes.length === 0 && (
              <button
                onClick={obrirAlta}
                className="mt-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Plus size={14} /> Crear Nova Pregunta
              </button>
            )}
          </div>
        ) : (() => {
          // Explicació per a no-programadors:
          // Definim els càlculs matemàtics per a saber quantes pàgines tenim i quin rang concret 
          // de preguntes estem mostrant en cada moment segons el filtre "Mostrar" escollit.
          const totalPagines = Math.ceil(preguntesFiltrades.length / limitPreguntes);
          const inici = (paginaActual - 1) * limitPreguntes;
          const preguntesPaginades = preguntesFiltrades.slice(inici, inici + limitPreguntes);
          const totalFiltrades = preguntesFiltrades.length;
          const indexMostrantInici = totalFiltrades === 0 ? 0 : inici + 1;
          const indexMostrantFi = Math.min(inici + limitPreguntes, totalFiltrades);
          const paginesArray = Array.from({ length: totalPagines }, (_, i) => i + 1);

          return (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Llista de preguntes filtrades ({totalFiltrades} de {preguntes.length}) — Pàgina {paginaActual} de {totalPagines}
                </span>
                {totalFiltrades > 0 && (
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    Mostrant {indexMostrantInici} a {indexMostrantFi} del total filtrat
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {preguntesPaginades.map((p, index) => {
                  const compObj = MAP_COMPETENCIES.find(c => c.id === p.competencia);
                  const compNom = compObj ? compObj.nom : p.competencia;
                  const compNomCurt = compObj ? compObj.nomCurt : p.competencia;
                  const isEditingThis = editingPregunta && (editingPregunta.id === p.id || (editingPregunta.docId && editingPregunta.docId === p.docId));

                  {/* Explicació per a no-programadors:
                      Si l'usuari clica "Modificar" en aquesta pregunta, substituïm la targeta estàtica
                      pel formulari d'edició directament en aquest punt de la llista (inline editing).
                      D'aquesta manera, no cal desplaçar-se (fer scroll) amunt i avall.
                  */}
                  if (isEditingThis) {
                    return (
                      <div key={p.docId || index} id={`pregunta-card-${p.id}`} className="animate-in zoom-in-95 duration-200 scroll-mt-24">
                        {renderFormulari(`Modificar Pregunta #${p.id}`, true)}
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={p.docId || index}
                      id={`pregunta-card-${p.id}`}
                      className={`border rounded-3xl p-5 md:p-6 transition-all duration-200 flex flex-col gap-5 scroll-mt-24 ${
                        p.suspensa 
                          ? "bg-slate-950/40 border-slate-800/60 opacity-60" 
                          : "bg-[#0a213a]/20 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {/* Capçalera del Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-black px-2.5 py-1 bg-white/5 rounded-lg text-slate-400">
                            #{p.id}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                            p.suspensa ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {p.suspensa ? "SUSPESA (Invisible)" : "ACTIVA (Visible)"}
                          </span>
                          <span 
                            className="text-xs text-purple-300 font-extrabold flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-xl"
                            title={`${compNom}: ${compObj?.descripcio || ''}`}
                          >
                            <span className="text-slate-400 font-semibold text-[10px]">Competència:</span>
                            <span className="text-white font-black">{compNomCurt}</span>
                            <span className="text-purple-400 font-mono text-[10px]">[{p.competencia}]</span>
                          </span>
                        </div>

                        {/* Botons d'acció */}
                        <div className="flex items-center gap-2">
                          {/* 1. Botó Suspendre / Activar */}
                          <button
                            onClick={() => handleToggleSuspendre(p.docId, !!p.suspensa, p.id)}
                            className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${
                              p.suspensa 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                            }`}
                            title={p.suspensa ? "Activar pregunta" : "Suspendre pregunta"}
                          >
                            {p.suspensa ? <Eye size={14} /> : <EyeOff size={14} />}
                            <span>{p.suspensa ? "Habilitar" : "Suspendre"}</span>
                          </button>

                          {/* 2. Botó Modificar */}
                          <button
                            onClick={() => obrirModificar(p)}
                            className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                            title="Modificar directament aquí"
                          >
                            <Edit2 size={14} />
                            <span>Modificar</span>
                          </button>

                          {/* 3. Botó Borrar */}
                          <button
                            onClick={() => handleBorrar(p.docId, p.id)}
                            className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                            title="Borrar definitivament"
                          >
                            <Trash2 size={14} />
                            <span>Borrar</span>
                          </button>
                        </div>
                      </div>

                      {/* Enunciat */}
                      <div>
                        <h4 className="text-white text-xs md:text-sm font-extrabold italic leading-relaxed">
                          "{p.enunciat}"
                        </h4>
                      </div>

                      {/* Les 3 opcions amb valors multidimensionals exposats */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">
                          Opcions i valors de competència associats:
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {p.opcions && p.opcions.map((op: any, iNum: number) => {
                            const lletra = iNum === 0 ? "A" : iNum === 1 ? "B" : "C";
                            const multidims = op.multidimensional || {};
                            const multKeys = Object.keys(multidims).filter(k => multidims[k] !== 0);

                            return (
                              <div key={iNum} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black w-5 h-5 rounded-full bg-white/5 text-slate-300 flex items-center justify-center shrink-0">
                                    {lletra}
                                  </span>
                                  <span className="text-[10px] font-black text-emerald-400">
                                    Puntuació: {op.punts >= 0 ? `+${op.punts}` : op.punts}
                                  </span>
                                </div>

                                <p className="text-[11px] text-white/70 italic leading-relaxed flex-1">
                                  {op.text}
                                </p>

                                {multKeys.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-white/5">
                                    {multKeys.map(k => {
                                      const val = multidims[k];
                                      const compInfo = MAP_COMPETENCIES.find(c => c.id === k);
                                      const nomAMostrar = compInfo ? compInfo.nomCurt : k;
                                      return (
                                        <span 
                                          key={k} 
                                          title={`${compInfo?.nom || k}: ${val > 0 ? `+${val}` : val}`}
                                          className={`text-[9px] font-black tracking-wide px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                                            val > 0 ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" : "bg-red-500/15 text-red-300 border border-red-500/20"
                                          }`}
                                        >
                                          <span>{nomAMostrar}</span>
                                          <span className="font-bold opacity-80">({val > 0 ? `+${val}` : val})</span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CONTROLS DE PAGINACIÓ PERSONALITZATS */}
              {totalPagines > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-5 bg-[#0a213a]/15 border border-white/5 rounded-3xl backdrop-blur-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Mostrant de la {indexMostrantInici} a la {indexMostrantFi} de {totalFiltrades} preguntes en total
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {/* Botó Anterior */}
                    <button
                      disabled={paginaActual === 1}
                      onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                      className={`p-2.5 rounded-xl border transition-all ${
                        paginaActual === 1 
                          ? "bg-white/2 border-white/5 text-slate-600 cursor-not-allowed" 
                          : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 cursor-pointer"
                      }`}
                      title="Pàgina anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Números de pàgina */}
                    {paginesArray.map(n => (
                      <button
                        key={n}
                        onClick={() => setPaginaActual(n)}
                        className={`w-9 h-9 rounded-xl border text-xs font-black transition-all ${
                          paginaActual === n
                            ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20"
                            : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 cursor-pointer"
                        }`}
                      >
                        {n}
                      </button>
                    ))}

                    {/* Botó Següent */}
                    <button
                      disabled={paginaActual === totalPagines}
                      onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPagines))}
                      className={`p-2.5 rounded-xl border transition-all ${
                        paginaActual === totalPagines 
                          ? "bg-white/2 border-white/5 text-slate-600 cursor-not-allowed" 
                          : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 cursor-pointer"
                      }`}
                      title="Pàgina següent"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* RECOMANACIÓ A FUTUR DE BBDD / CONSELL DIDÀCTIC */}
        <div className="bg-[#1a3a5a]/20 border border-white/10 rounded-[2.5rem] p-6 mt-10">
          <h4 className="text-yellow-400 font-black uppercase tracking-widest text-xs mb-3">
            Et recomano, modificaria i/o recorda que pot passar... a futur
          </h4>
          <p className="text-white/85 text-[11px] md:text-xs leading-relaxed">
            Recorda que el banc de preguntes oficial del Biodata creix constantment de forma directament proporcional a les exigències selectives de l'ISPC. A futur, seria interessant implementar un control de logs d'auditoria que registri quins administradors modifiquen cada pregunta, així com automatitzar còpies de seguretat setmanals de la col·lecció de <strong>preguntes_biodata_oficial</strong> per si algú esborra accidentalment alguna de les preguntes clau de la psicotècnica. Això us estalviarà molts mals de cap durant el llançament de la campanya d'OposiCAT!
          </p>
        </div>

        {/* MODAL DE CONFIRMACIÓ PERSONALITZADA PER A EVITAR DIÀLEGS SÍNCRONS DEL NAVEGADOR DINTRE D'UN IFRAME */}
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0b1b2d] border border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-5 text-left">
              {/* Línia estètica de dalt d'OposiCAT */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-yellow-500 to-emerald-500" />
              
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl shrink-0">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase italic tracking-wider text-purple-300">
                    {confirmModal.titol}
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed mt-1.5">
                    {confirmModal.missatge}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
