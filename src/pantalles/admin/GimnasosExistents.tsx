import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  X, 
  Lock as LockIcon, 
  Check, 
  RefreshCw,
  Power,
  Dumbbell
} from "lucide-react";
import { DATA_CATALUNYA } from "../../data/municipis";

// Comentari planer per a no-programadors:
// Aquest component permet als administradors gestionar de dalt a baix tots els gimnasos
// col·laboradors existents que tenim donats d'alta a la base de dades.
// Permet cercar ràpidament un centre per província, comarca o municipi. També ens dóna
// el poder d'editar qualsevol de les seves dades (com ara canviar el número de telèfon o posar preus nous),
// suspendre'ls temporalment (posar-los en quarantena si hi ha queixes) o eliminar-los del tot.

interface Gimnas {
  id: string;
  nom: string;
  provincia: string;
  comarca: string;
  municipi: string;
  adreca?: string;
  entrenament: string[];
  telefon?: string;
  correu?: string;
  descripcio?: string;
  preus?: string;
  infoPrivada?: string;
  imatges?: string[];
  suspes?: boolean; // Camp per a suspendre (quarentena)
}

export default function GimnasosExistents({ darkMode, setConfirmModal }: any) {
  const [gimnasos, setGimnasos] = useState<Gimnas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtres de cerca
  const [filtreProvincia, setFiltreProvincia] = useState("");
  const [filtreComarca, setFiltreComarca] = useState("");
  const [filtreMunicipi, setFiltreMunicipi] = useState("");
  const [cercaText, setCercaText] = useState("");

  // Estat per a l'edició de dades d'un gimnàs existent
  const [gimnasAEditar, setGimnasAEditar] = useState<Gimnas | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Camps del formulari d'edició
  const [editNom, setEditNom] = useState("");
  const [editProvincia, setEditProvincia] = useState("");
  const [editComarca, setEditComarca] = useState("");
  const [editMunicipi, setEditMunicipi] = useState("");
  const [editAdreca, setEditAdreca] = useState("");
  const [editTelefon, setEditTelefon] = useState("");
  const [editCorreu, setEditCorreu] = useState("");
  const [editPreus, setEditPreus] = useState("");
  const [editDescripcio, setEditDescripcio] = useState("");
  const [editInfoPrivada, setEditInfoPrivada] = useState("");
  const [editEntrenament, setEditEntrenament] = useState<string[]>([]);
  const [editImatges, setEditImatges] = useState<string[]>([]);
  const [novaUrlImatge, setNovaUrlImatge] = useState("");

  const modalitats = ["Circuit Agilitat", "Course Navette", "Press de Banca"];
  const provincias = ["Barcelona", "Girona", "Lleida", "Tarragona"];

  // Comentari planer per a no-programadors:
  // Escoltador en temps real (onSnapshot). Sempre que fem un canvi a Firestore (modificar, suspendre o eliminar),
  // aquest mètode actualitza la llista de la nostra pantalla a l'acte per estar sempre al dia.
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "gimnasos"), orderBy("nom", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const llista: Gimnas[] = [];
      snapshot.forEach((doc) => {
        llista.push({ id: doc.id, ...doc.data() } as Gimnas);
      });
      setGimnasos(llista);
      setLoading(false);
    }, (err) => {
      console.error("Error escoltant gimnasos: ", err);
      setError("No s'ha pogut establir la connexió en temps real amb els gimnasos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Comentari planer per a no-programadors:
  // Funció per a posar en suspens (quarantena) o tornar a activar un gimnàs.
  // Canvia la propietat 'suspes' del document a Firestore. Si és true, el gimnàs s'oculta al cercador d'usuaris.
  const handleToggleSuspensio = async (id: string, estatActual: boolean) => {
    try {
      const docRef = doc(db, "gimnasos", id);
      await updateDoc(docRef, {
        suspes: !estatActual
      });
      setSuccessMsg(estatActual ? "S'ha tornat a activar el gimnàs de forma correcta." : "S'ha posat el gimnàs en quarantena temporal.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error en canviar suspensió: ", err);
      setError("No s'ha pogut canviar l'estat de quarantena a la base de dades.");
    }
  };

  // Comentari planer per a no-programadors:
  // Funció per eliminar definitivament un gimnàs de la base de dades.
  // Obrirà la modal de confirmació del sistema per evitar esborrats accidentals.
  const handleEliminarGimnas = (id: string, nom: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Gimnàs Permanentment",
      message: `Estàs absolutament segur que vols eliminar '${nom}'? Aquesta acció esborrarà la fitxa de forma irreversible del servidor de Firebase.`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "gimnasos", id));
          setSuccessMsg(`El gimnàs '${nom}' s'ha esborrat de la base de dades.`);
          setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err) {
          console.error("Error eliminant gimnàs: ", err);
          setError("No s'ha pogut completar l'eliminació a Firestore.");
        }
      }
    });
  };

  // Comentari planer per a no-programadors:
  // Obre el panell de modificació i hi carrega totes les dades que té actualment
  // guardades el gimnàs seleccionat per a que puguem polir-les.
  const handleObrirEdicio = (g: Gimnas) => {
    setGimnasAEditar(g);
    setEditNom(g.nom);
    setEditProvincia(g.provincia);
    setEditComarca(g.comarca || "");
    setEditMunicipi(g.municipi || "");
    setEditAdreca(g.adreca || "");
    setEditTelefon(g.telefon || "");
    setEditCorreu(g.correu || "");
    setEditPreus(g.preus || "");
    setEditDescripcio(g.descripcio || "");
    setEditInfoPrivada(g.infoPrivada || "");
    setEditEntrenament(g.entrenament || []);
    setEditImatges(g.imatges || []);
    setNovaUrlImatge("");
    setIsEditModalOpen(true);
  };

  // Comentari planer per a no-programadors:
  // Funció per a canviar les disciplines d'entrenament admeses dins de la fitxa editable.
  const toggleEditEntrenament = (mod: string) => {
    if (editEntrenament.includes(mod)) {
      setEditEntrenament(editEntrenament.filter(m => m !== mod));
    } else {
      setEditEntrenament([...editEntrenament, mod]);
    }
  };

  // Comentari planer per a no-programadors:
  // Afegeix una nova foto d'instal·lació a través de la seva adreça d'internet (URL).
  const handleAfegirFoto = () => {
    if (novaUrlImatge.trim()) {
      setEditImatges([...editImatges, novaUrlImatge.trim()]);
      setNovaUrlImatge("");
    }
  };

  // Comentari planer per a no-programadors:
  // Treu una imatge existent del carrusel en el formulari d'edició.
  const handleEliminarFoto = (idx: number) => {
    setEditImatges(editImatges.filter((_, i) => i !== idx));
  };

  // Comentari planer per a no-programadors:
  // Desa finalment a Firestore els canvis fets en la fitxa del gimnàs i tanca la finestra emergent.
  const handleDesarCanvisGimnas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gimnasAEditar) return;

    try {
      const docRef = doc(db, "gimnasos", gimnasAEditar.id);
      await updateDoc(docRef, {
        nom: editNom,
        provincia: editProvincia,
        comarca: editComarca,
        municipi: editMunicipi,
        adreca: editAdreca,
        telefon: editTelefon,
        correu: editCorreu,
        preus: editPreus,
        descripcio: editDescripcio,
        infoPrivada: editInfoPrivada,
        entrenament: editEntrenament,
        imatges: editImatges,
        actualitzatEl: serverTimestamp()
      });

      setIsEditModalOpen(false);
      setGimnasAEditar(null);
      setSuccessMsg(`S'han desat correctament els canvis per al gimnàs '${editNom}'.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error al desar modificació de gimnàs: ", err);
      setError("No s'han pogut actualitzar les dades del gimnàs a Firestore.");
    }
  };

  // Lògica de selecció de comarca i municipi en l'edició
  const comarquesDisponibles = editProvincia ? Object.keys(DATA_CATALUNYA[editProvincia as keyof typeof DATA_CATALUNYA] || {}) : [];
  const municipisDisponibles = (editProvincia && editComarca) ? (DATA_CATALUNYA[editProvincia as keyof typeof DATA_CATALUNYA]?.[editComarca] || []) : [];

  // Lògica de selecció de comarques i municipis en els filtres de cerca
  const comarquesFiltre = filtreProvincia ? Object.keys(DATA_CATALUNYA[filtreProvincia as keyof typeof DATA_CATALUNYA] || {}) : [];
  const municipisFiltre = (filtreProvincia && filtreComarca) ? (DATA_CATALUNYA[filtreProvincia as keyof typeof DATA_CATALUNYA]?.[filtreComarca] || []) : [];

  // Comentari planer per a no-programadors:
  // Apliquem tots els filtres que l'usuari ha demanat a la pantalla.
  // Filtra pel text escrit, per la província, per la comarca i pel municipi indicats als botons.
  const gimnasosFiltrats = gimnasos.filter((g) => {
    const matchProvincia = filtreProvincia === "" || g.provincia === filtreProvincia;
    const matchComarca = filtreComarca === "" || g.comarca === filtreComarca;
    const matchMunicipi = filtreMunicipi === "" || g.municipi === filtreMunicipi;
    const matchCercaText = cercaText === "" || 
      g.nom.toLowerCase().includes(cercaText.toLowerCase()) ||
      g.municipi.toLowerCase().includes(cercaText.toLowerCase()) ||
      (g.adreca && g.adreca.toLowerCase().includes(cercaText.toLowerCase()));

    return matchProvincia && matchComarca && matchMunicipi && matchCercaText;
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-500 text-left">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice / Gimnasos / Gestió</span>
          <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            GIMNASOS <span className="text-emerald-500">EXISTENTS</span>
          </h1>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Banc de dades i directori de gimnasos col·laboradors d'OposiCAT homologats per a opositors.
          </p>
        </div>
      </header>

      {/* COMPORTAMENT DE FEEDBACK DE LES OPERACIONS */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-black uppercase tracking-wider text-center animate-bounce">
          ✔ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs font-black uppercase tracking-wider text-center">
          ⚠ {error}
        </div>
      )}

      {/* SECCIÓ FILTRES I CERCADOR */}
      <div className={`p-6 md:p-8 rounded-[2.5rem] border ${
        darkMode ? 'bg-slate-800/40 border-slate-700/60 shadow-lg shadow-black/10' : 'bg-white border-slate-100 shadow-sm'
      } flex flex-col gap-6`}>
        <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
          <Search className="text-emerald-500 shrink-0" size={20} />
          <input 
            type="text" 
            placeholder="Cerca per nom de gimnàs, adreça o municipi..." 
            value={cercaText}
            onChange={(e) => setCercaText(e.target.value)}
            className={`w-full bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-500 ${
              darkMode ? 'text-white' : 'text-slate-800'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PROVINCIA */}
          <div className="space-y-1.5">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest pl-1">Filtrar per Província</span>
            <select 
              value={filtreProvincia}
              onChange={(e) => { setFiltreProvincia(e.target.value); setFiltreComarca(""); setFiltreMunicipi(""); }}
              className={`w-full p-3.5 rounded-xl border-none outline-none font-bold text-xs uppercase tracking-tight ${
                darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <option value="">Totes les Províncies</option>
              {provincias.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* COMARCA */}
          <div className="space-y-1.5">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest pl-1">Filtrar per Comarca</span>
            <select 
              disabled={!filtreProvincia}
              value={filtreComarca}
              onChange={(e) => { setFiltreComarca(e.target.value); setFiltreMunicipi(""); }}
              className={`w-full p-3.5 rounded-xl border-none outline-none font-bold text-xs uppercase tracking-tight transition-all ${
                !filtreProvincia ? 'opacity-30' : ''
              } ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              <option value="">Totes les Comarques</option>
              {comarquesFiltre.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* MUNICIPI */}
          <div className="space-y-1.5">
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest pl-1">Filtrar per Municipi</span>
            <select 
              disabled={!filtreComarca}
              value={filtreMunicipi}
              onChange={(e) => setFiltreMunicipi(e.target.value)}
              className={`w-full p-3.5 rounded-xl border-none outline-none font-bold text-xs uppercase tracking-tight transition-all ${
                !filtreComarca ? 'opacity-30' : ''
              } ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              <option value="">Tots els Municipis</option>
              {municipisFiltre.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* LLISTAT DE GIMNASOS EN KAI-GRID CARD */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
          <RefreshCw className="animate-spin text-emerald-500" size={32} />
          <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Establidant connexió amb Firestore...</p>
        </div>
      ) : gimnasosFiltrats.length === 0 ? (
        <div className={`py-20 text-center border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-4 ${
          darkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <Building2 className="text-slate-500/10" size={56} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            No s'ha trobat cap gimnàs homologat amb els criteris indicats.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {gimnasosFiltrats.map((g) => (
            <div 
              key={g.id}
              className={`p-6 md:p-7 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between gap-6 group relative overflow-hidden ${
                g.suspes 
                  ? (darkMode ? 'bg-slate-950/20 border-yellow-500/20' : 'bg-yellow-50/20 border-yellow-200')
                  : (darkMode ? 'bg-slate-850 border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-emerald-500 hover:shadow-lg shadow-sm')
              }`}
            >
              {/* QUARENTENA BADGE DINS LA TARGETA */}
              {g.suspes && (
                <div className="absolute top-0 right-0">
                  <span className="text-[7.5px] font-black uppercase px-3.5 py-1 bg-yellow-500 text-[#001a33] rounded-bl-[1.2rem] leading-none tracking-wider">
                    En Quarantena / Suspès
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-5">
                {/* CAPÇALERA DE CARD */}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    {g.imatges?.[0] ? (
                      <img src={g.imatges[0]} alt={g.nom} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Dumbbell size={20} />
                      </div>
                    )}
                  </div>
                  <div className="pr-12">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[7px] font-black uppercase rounded">{g.provincia}</span>
                      <span className="text-slate-400 dark:text-slate-600 text-[8px]">•</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">{g.municipi}</span>
                    </div>
                    <h4 className={`text-base font-black uppercase italic tracking-tighter line-clamp-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {g.nom}
                    </h4>
                    {g.adreca && (
                      <span className="text-[9px] text-slate-400 block truncate mt-0.5">{g.adreca}</span>
                    )}
                  </div>
                </div>

                {/* MODALITATS D'ENTRENAMENT */}
                <div className="flex flex-wrap gap-1.5">
                  {g.entrenament && g.entrenament.map(mod => (
                    <span key={mod} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-[8px] font-bold uppercase text-slate-500">
                      {mod}
                    </span>
                  ))}
                </div>

                {/* DADES CONTACTE */}
                <div className="grid grid-cols-2 gap-3 py-2 border-y border-dashed border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 opacity-70">
                    <Phone size={12} className="text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-bold truncate">{g.telefon || "Sense telèfon"}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-70">
                    <Mail size={12} className="text-emerald-500 shrink-0" />
                    <span className="text-[10px] font-bold truncate" title={g.correu}>{g.correu || "Sense correu"}</span>
                  </div>
                </div>

                {/* TARIFES */}
                {g.preus && (
                  <div className={`p-3 rounded-2xl ${darkMode ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
                    <span className="text-[7.5px] font-black uppercase text-slate-400 block mb-0.5">Preus informats:</span>
                    <p className="text-[10px] font-medium leading-relaxed line-clamp-2">{g.preus}</p>
                  </div>
                )}

                {/* INFO PRIVADA INTERNA */}
                {g.infoPrivada && (
                  <div className="flex items-center gap-2 p-2 px-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                    <LockIcon size={10} className="text-amber-500" />
                    <span className="text-[8px] font-black uppercase text-amber-500 truncate max-w-[200px]">
                      Info privada: {g.infoPrivada}
                    </span>
                  </div>
                )}
              </div>

              {/* BOTONS ACCIÓ INFERIORS */}
              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  onClick={() => handleEliminarGimnas(g.id, g.nom)}
                  className={`p-2.5 rounded-xl transition-all ${
                    darkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                  }`}
                  title="Eliminar gimnàs"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  onClick={() => handleToggleSuspensio(g.id, !!g.suspes)}
                  className={`p-2.5 rounded-xl transition-all ${
                    g.suspes 
                      ? (darkMode ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-slate-900' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-white')
                      : (darkMode ? 'bg-slate-700 text-slate-300 hover:bg-yellow-500 hover:text-[#001a33]' : 'bg-slate-100 text-slate-600 hover:bg-yellow-500 hover:text-[#001a33]')
                  }`}
                  title={g.suspes ? "Activar gimnàs (Traure de quarantena)" : "Suspendre gimnàs (Quarantena)"}
                >
                  <Power size={15} />
                </button>
                <button
                  onClick={() => handleObrirEdicio(g)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                >
                  <Edit3 size={12} /> Modificar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE EDICIÓ EXCLUSIU */}
      {isEditModalOpen && gimnasAEditar && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => { setIsEditModalOpen(false); setGimnasAEditar(null); }} />
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] border-2 p-8 md:p-10 shadow-2xl ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => { setIsEditModalOpen(false); setGimnasAEditar(null); }}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <span className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">Panell Administrador d'Edició</span>
              <h3 className="text-3xl font-black uppercase italic mt-1">Modificar Gimnàsexistent</h3>
              <p className="text-xs text-slate-400 mt-1">
                Aquests canvis s'aplicaran a l'acte per a tots els opositors que cerquin centres d'entrenament des de la seva aplicació mòbil.
              </p>
            </div>

            <form onSubmit={handleDesarCanvisGimnas} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Nom Oficial del Centre</label>
                  <input 
                    required
                    value={editNom}
                    onChange={e => setEditNom(e.target.value)}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Tipus de Prova Homologada</label>
                  <div className="flex flex-wrap gap-2">
                    {modalitats.map(mod => {
                      const isSelected = editEntrenament.includes(mod);
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => toggleEditEntrenament(mod)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border-2 ${
                            isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-transparent border-slate-200 text-slate-400'
                          }`}
                        >
                          {mod}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* LOCALITZACIÓ EDITABLE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Província</label>
                  <select 
                    required
                    value={editProvincia}
                    onChange={e => { setEditProvincia(e.target.value); setEditComarca(""); setEditMunicipi(""); }}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  >
                    <option value="">Selecciona província</option>
                    {Object.keys(DATA_CATALUNYA).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Comarca</label>
                  <select 
                    required
                    disabled={!editProvincia}
                    value={editComarca}
                    onChange={e => { setEditComarca(e.target.value); setEditMunicipi(""); }}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  >
                    <option value="">Selecciona comarca</option>
                    {comarquesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Municipi</label>
                  <select 
                    required
                    disabled={!editComarca}
                    value={editMunicipi}
                    onChange={e => setEditMunicipi(e.target.value)}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm appearance-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  >
                    <option value="">Selecciona municipi</option>
                    {municipisDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* ADREÇA EDITABLE */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Adreça completa</label>
                <input 
                  required
                  value={editAdreca}
                  onChange={e => setEditAdreca(e.target.value)}
                  className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                />
              </div>

              {/* CONTACTE EDITABLE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Telèfon de contacte</label>
                  <input 
                    value={editTelefon}
                    onChange={e => setEditTelefon(e.target.value)}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Correu electrònic</label>
                  <input 
                    value={editCorreu}
                    onChange={e => setEditCorreu(e.target.value)}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
              </div>

              {/* PREUS I DESCRIPCIÓ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Tarifes i Preus per a l'Estudiant</label>
                  <textarea 
                    value={editPreus}
                    onChange={e => setEditPreus(e.target.value)}
                    rows={4}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm resize-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Descripció o text comercial</label>
                  <textarea 
                    value={editDescripcio}
                    onChange={e => setEditDescripcio(e.target.value)}
                    rows={4}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm resize-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
              </div>

              {/* IMATGES EDITABLES */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Imatges del Centre (URLs)</label>
                <div className="flex gap-2">
                  <input 
                    value={novaUrlImatge}
                    onChange={e => setNovaUrlImatge(e.target.value)}
                    placeholder="Adreça d'internet de la nova foto..."
                    className={`flex-1 p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                  <button 
                    type="button"
                    onClick={handleAfegirFoto}
                    className="px-6 bg-slate-800 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-slate-700 transition-all"
                  >
                    Afegir
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {editImatges.map((img, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleEliminarFoto(idx)}
                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* INFORMACIÓ PRIVADA */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500 px-1">
                  <LockIcon size={12} /> Notes Privades d'Administració
                </label>
                <textarea 
                  value={editInfoPrivada}
                  onChange={e => setEditInfoPrivada(e.target.value)}
                  rows={2}
                  className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-[11px] resize-none ${darkMode ? 'bg-amber-500/5 text-amber-500' : 'bg-amber-50 text-amber-900'}`}
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setGimnasAEditar(null); }}
                  className="px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/15 transition-all"
                >
                  Desar i Actualitzar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
