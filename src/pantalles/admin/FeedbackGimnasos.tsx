import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Check, 
  X, 
  Edit3, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Calendar, 
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowLeft,
  Instagram,
  Facebook,
  Globe,
  Award,
  DollarSign,
  Info
} from "lucide-react";
import { DATA_CATALUNYA } from "../../data/municipis";

// Comentari planer per a no-programadors:
// Aquest component serveix per a que els administradors de l'aplicació rebin, revisin,
// editin i acceptin les propostes de gimnasos nous que envien tant els usuaris com els propietaris.
// En lloc d'haver de copiar manualment les dades de les notificacions, aquest tauler automatitza el procés
// creant el gimnàs de manera automàtica quan es prem "Acceptar".

interface PropostaGimnas {
  id: string;
  usuariId: string;
  tipusProposta: "usuari" | "propietari";
  nomSollicitant?: string; // Enviat per l'usuari
  nomPropietari?: string;   // Enviat pel propietari
  emailContacte: string;
  telefon?: string;
  nomGimnas: string;
  provincia: string;
  comarca: string;
  municipi: string;
  adreca: string;
  proves: string[];
  comentari?: string;
  estat: "pendent" | "acceptada" | "denegada";
  creatEl: string;
  
  // Dades adicionals de propietari i noves estructures d'horaris i xarxes (OposiCAT)
  telefonContacte?: string;
  web?: string;
  tarifes?: string;
  horaris?: string;

  // Camps nous (10 punts del formulari d'OposiCAT)
  horaris_setmana?: string;
  horaris_dissabte?: string;
  horaris_diumenge?: string;
  horaris_festius?: string;
  horari_especial_opos?: string;
  te_preu_especial_opositors?: boolean | string;
  preu_especial_opositors?: string;
  rrss_instagram?: string;
  rrss_facebook?: string;
  rrss_twitter?: string;
  rrss_tiktok?: string;
  rrss_web?: string;

  permis_whatsapp?: boolean | string;
  te_tarifa_especial_opos?: string;
  tipus_tarifa_opos?: string | null;
  valor_tarifa_opos?: string | null;
  tarifes_mensuals_raw?: any[];
  tarifes_trimestrals_raw?: any[];
  tarifes_anuals_raw?: any[];
  ciutat?: string;
  preus?: string;
  te_entrenador_opos?: boolean | string;
}

export default function FeedbackGimnasos({ darkMode }: { darkMode: boolean }) {
  const [propostes, setPropostes] = useState<PropostaGimnas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estat per a la proposta que s'està editant o modificant abans d'acceptar
  const [propostaAEditar, setPropostaAEditar] = useState<PropostaGimnas | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Camps editables pel formulari de modificació
  const [editNomGimnas, setEditNomGimnas] = useState("");
  const [editProvincia, setEditProvincia] = useState("");
  const [editComarca, setEditComarca] = useState("");
  const [editMunicipi, setEditMunicipi] = useState("");
  const [editAdreca, setEditAdreca] = useState("");
  const [editTelefon, setEditTelefon] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editProves, setEditProves] = useState<string[]>([]);
  const [editComentari, setEditComentari] = useState("");
  const [editTarifes, setEditTarifes] = useState("");
  
  // Nous camps editables de la modal de revisió de l'admin
  const [editHorarisSetmana, setEditHorarisSetmana] = useState("");
  const [editHorarisDissabte, setEditHorarisDissabte] = useState("");
  const [editHorarisDiumenge, setEditHorarisDiumenge] = useState("");
  const [editHorarisFestius, setEditHorarisFestius] = useState("");
  const [editHorariEspecialOpos, setEditHorariEspecialOpos] = useState("");
  const [editTePreuEspecialOpositors, setEditTePreuEspecialOpositors] = useState(false);
  const [editPreuEspecialOpositors, setEditPreuEspecialOpositors] = useState("");
  const [editTeEntrenadorOpos, setEditTeEntrenadorOpos] = useState(false);
  const [editRrssInstagram, setEditRrssInstagram] = useState("");
  const [editRrssFacebook, setEditRrssFacebook] = useState("");
  const [editRrssTwitter, setEditRrssTwitter] = useState("");
  const [editRrssTiktok, setEditRrssTiktok] = useState("");
  const [editRrssWeb, setEditRrssWeb] = useState("");

  const modalitats = ["Circuit Agilitat", "Course Navette", "Press de Banca"];

  // Comentari planer per a no-programadors:
  // Escoltador en temps real (onSnapshot). Sempre que un usuari enviï un formulari
  // des del seu mòbil o des d'internet, el llistat s'actualitzarà automàticament a la pantalla d'administració
  // sense haver de recarregar la pàgina de forma manual.
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "propostes_gimnasos"), orderBy("creatEl", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const llista: PropostaGimnas[] = [];
      snapshot.forEach((doc) => {
        llista.push({ id: doc.id, ...doc.data() } as PropostaGimnas);
      });
      setPropostes(llista);
      setLoading(false);
    }, (err) => {
      console.error("Error al carregar propostes de gimnasos: ", err);
      setError("No s'han pogut carregar les propostes de gimnasos des de Firestore.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Comentari planer per a no-programadors:
  // Funció per rebutjar o denegar una sol·licitud enviada. Canvia l'estat a "denegada"
  // de manera permanent perquè quedi arxivada com a denegada a la base de dades.
  const handleDenegar = async (id: string) => {
    try {
      const docRef = doc(db, "propostes_gimnasos", id);
      await updateDoc(docRef, { estat: "denegada" });
      setSuccessMsg("La proposta ha estat rebutjada i arxivada correctament.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error al denegar proposta: ", err);
      setError("No s'ha pogut actualitzar l'estat de la proposta a Firestore.");
    }
  };

  // Comentari planer per a no-programadors:
  // Funció per acceptar directament una proposta. Agafa totes les dades que ens ha facilitat
  // l'usuari i crea un registre de gimnàs oficial llançat a la col·lecció 'gimnasos'.
  // Al mateix temps, canvia l'estat de la proposta a 'acceptada' perquè no torni a sortir com a pendent.
  const handleAcceptarDirecte = async (proposta: PropostaGimnas) => {
    try {
      // 1. Creem el gimnàs directament a la col·lecció oficial 'gimnasos'
      const hisOpos = proposta.te_preu_especial_opositors === true || proposta.te_preu_especial_opositors === 'true' || proposta.te_tarifa_especial_opos === "si";
      const valOpos = proposta.preu_especial_opositors || proposta.valor_tarifa_opos || "";
      const hasCoaches = proposta.te_entrenador_opos === true || proposta.te_entrenador_opos === 'true' || proposta.comentari?.toLowerCase().includes("entrenador") || proposta.comentari?.toLowerCase().includes("preparador");
      
      const demanantNom = proposta.nomSollicitant || proposta.nomPropietari || "Anònim";
      
      const demanantTel = proposta.telefonContacte || proposta.telefon || "";
      
      const instagramUrl = proposta.rrss_instagram || "";
      const facebookUrl = proposta.rrss_facebook || "";
      const twitterUrl = proposta.rrss_twitter || "";
      const tiktokUrl = proposta.rrss_tiktok || "";
      const webUrl = proposta.rrss_web || proposta.web || "";

      const gimnasosRef = collection(db, "gimnasos");
      await addDoc(gimnasosRef, {
        nom: proposta.nomGimnas,
        provincia: proposta.provincia,
        comarca: proposta.comarca,
        municipi: proposta.municipi,
        adreca: proposta.adreca,
        entrenament: proposta.proves || [],
        telefon: demanantTel,
        correu: proposta.emailContacte || "",
        descripcio: proposta.comentari || "Aquest gimnàs ha estat proposat i verificat per la comunitat d'OposiCAT.",
        preus: proposta.tarifes || proposta.preus || "Tarifes generals sota consulta al centre.",
        
        // Conservació íntegra de tots els camps d'OposiCAT
        horaris_setmana: proposta.horaris_setmana || proposta.horaris || "",
        horaris_dissabte: proposta.horaris_dissabte || "",
        horaris_diumenge: proposta.horaris_diumenge || "",
        horaris_festius: proposta.horaris_festius || "",
        horari_especial_opos: proposta.horari_especial_opos || "",
        te_preu_especial_opositors: hisOpos,
        preu_especial_opositors: valOpos,
        te_entrenador_opos: hasCoaches,
        rrss_instagram: instagramUrl,
        rrss_facebook: facebookUrl,
        rrss_twitter: twitterUrl,
        rrss_tiktok: tiktokUrl,
        rrss_web: webUrl,

        infoPrivada: `Proposta acceptada de l'usuari: ${demanantNom} (${proposta.emailContacte})`,
        imatges: [], // S'inicialitza buit, l'admin ho podrà editar després
        creatEl: serverTimestamp()
      });

      // 2. Marquem la proposta com a acceptada
      const propostaRef = doc(db, "propostes_gimnasos", proposta.id);
      await updateDoc(propostaRef, { estat: "acceptada" });

      setSuccessMsg(`S'ha donat d'alta el gimnàs '${proposta.nomGimnas}' i s'ha acceptat la proposta!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error en acceptar proposta directa: ", err);
      setError("S'ha produït un error en registrar el gimnàs o actualitzar la proposta.");
    }
  };

  // Comentari planer per a no-programadors:
  // Quan l'administrador vol polir o corregir detalls de la proposta (com ara escurçar el nom del gimnàs,
  // corregir una falta d'ortografia, afegir les tarifes reals, etc.) abans de publicar-lo,
  // utilitzem aquesta funció per obrir una finestra modal amb els camps pre-omplerts.
  const handleObrirModificacio = (proposta: PropostaGimnas) => {
    setPropostaAEditar(proposta);
    setEditNomGimnas(proposta.nomGimnas);
    setEditProvincia(proposta.provincia);
    setEditComarca(proposta.comarca);
    setEditMunicipi(proposta.municipi);
    setEditAdreca(proposta.adreca);
    setEditTelefon(proposta.telefonContacte || proposta.telefon || "");
    setEditEmail(proposta.emailContacte);
    setEditProves(proposta.proves || []);
    setEditComentari(proposta.comentari || "");
    setEditTarifes(proposta.tarifes || proposta.preus || "Tarifes generals sota consulta al centre.");
    
    // Càrrega de dades d'estat de la proposta original
    setEditHorarisSetmana(proposta.horaris_setmana || proposta.horaris || "");
    setEditHorarisDissabte(proposta.horaris_dissabte || "");
    setEditHorarisDiumenge(proposta.horaris_diumenge || "");
    setEditHorarisFestius(proposta.horaris_festius || "");
    setEditHorariEspecialOpos(proposta.horari_especial_opos || "");
    
    const isSpecialOpos = proposta.te_preu_especial_opositors === true || proposta.te_preu_especial_opositors === 'true' || proposta.te_tarifa_especial_opos === "si";
    const specialValOpos = proposta.preu_especial_opositors || proposta.valor_tarifa_opos || "";
    const hasCoaches = proposta.te_entrenador_opos === true || proposta.te_entrenador_opos === 'true' || proposta.comentari?.toLowerCase().includes("entrenador") || proposta.comentari?.toLowerCase().includes("preparador");
    
    setEditTePreuEspecialOpositors(isSpecialOpos);
    setEditPreuEspecialOpositors(specialValOpos);
    setEditTeEntrenadorOpos(hasCoaches);
    
    setEditRrssInstagram(proposta.rrss_instagram || "");
    setEditRrssFacebook(proposta.rrss_facebook || "");
    setEditRrssTwitter(proposta.rrss_twitter || "");
    setEditRrssTiktok(proposta.rrss_tiktok || "");
    setEditRrssWeb(proposta.rrss_web || proposta.web || "");

    setIsEditModalOpen(true);
  };

  // Comentari planer per a no-programadors:
  // Afegeix o treu una modalitat d'entrenament física (com Course Navette) de la llista d'activitats del formulari d'edició.
  const toggleEditProva = (mod: string) => {
    if (editProves.includes(mod)) {
      setEditProves(editProves.filter(p => p !== mod));
    } else {
      setEditProves([...editProves, mod]);
    }
  };

  // Comentari planer per a no-programadors:
  // Guarda finalment os canvis que hem modificat de la sol·licitud a la finestra modal,
  // publica el nou gimnàs de manera oficial i tanca la modal, actualitzant l'estat a 'acceptada'.
  const handleGuardarModificacio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propostaAEditar) return;

    try {
      // 1. Creem el gimnàs oficial a la col·lecció 'gimnasos' amb les dades editades
      const gimnasosRef = collection(db, "gimnasos");
      await addDoc(gimnasosRef, {
        nom: editNomGimnas,
        provincia: editProvincia,
        comarca: editComarca,
        municipi: editMunicipi,
        adreca: editAdreca,
        entrenament: editProves,
        telefon: editTelefon,
        correu: editEmail,
        descripcio: editComentari || "Aquest gimnàs ha estat verificat i editat per l'administració d'OposiCAT.",
        preus: editTarifes,
        
        // Conservació íntegra dels nous camps editats per l'admin
        horaris_setmana: editHorarisSetmana,
        horaris_dissabte: editHorarisDissabte,
        horaris_diumenge: editHorarisDiumenge,
        horaris_festius: editHorarisFestius,
        horari_especial_opos: editHorariEspecialOpos,
        te_preu_especial_opositors: editTePreuEspecialOpositors,
        preu_especial_opositors: editPreuEspecialOpositors,
        te_entrenador_opos: editTeEntrenadorOpos,
        rrss_instagram: editRrssInstagram,
        rrss_facebook: editRrssFacebook,
        rrss_twitter: editRrssTwitter,
        rrss_tiktok: editRrssTiktok,
        rrss_web: editRrssWeb,

        infoPrivada: `Proposta modificada i acceptada des d'administració. Sol·licitant original: ${propostaAEditar.nomSollicitant || propostaAEditar.nomPropietari || "Anònim"} (${propostaAEditar.emailContacte})`,
        imatges: [],
        creatEl: serverTimestamp()
      });

      // 2. Marquem la proposta original de la base de dades com a 'acceptada'
      const propostaRef = doc(db, "propostes_gimnasos", propostaAEditar.id);
      await updateDoc(propostaRef, { estat: "acceptada" });

      setIsEditModalOpen(false);
      setPropostaAEditar(null);
      setSuccessMsg(`S'ha editat i publicat amb èxit el gimnàs '${editNomGimnas}'!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Error en desar la proposta modificada: ", err);
      setError("No s'ha pogut publicar el gimnàs modificat.");
    }
  };

  const comarquesEditables = editProvincia ? Object.keys(DATA_CATALUNYA[editProvincia as keyof typeof DATA_CATALUNYA] || {}) : [];
  const municipisEditables = (editProvincia && editComarca) ? (DATA_CATALUNYA[editProvincia as keyof typeof DATA_CATALUNYA]?.[editComarca] || []) : [];

  const pendents = propostes.filter(p => p.estat === "pendent");
  const processades = propostes.filter(p => p.estat !== "pendent");

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-500 text-left">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px]">Backoffice / Gimnasos / Propostes</span>
          <h1 className={`text-4xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            GESTIÓ DE GIMNÀS / <span className="text-emerald-500">GESTIÓ USUARI</span>
          </h1>
          <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Banc de notificacions i propostes enviades per opositors i propietaris de centres.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-500">
              {pendents.length} propostes pendents de verificar
            </span>
          </div>
        </div>
      </header>

      {/* MISSATGES D'ALERTES / ÈXIT */}
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

      {/* CONTINGUT PRINCIPAL DIVIDIT EN PENDENTS I ARXIVADES */}
      <div className="space-y-12">
        
        {/* SECCIÓ 1: PENDENTS */}
        <div className="space-y-6">
          <h3 className={`text-xl font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
            <Clock size={20} className="text-yellow-500" />
            Notificacions pendents de revisió ({pendents.length})
          </h3>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
              <RefreshCw className="animate-spin text-emerald-500" size={32} />
              <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">Carregant propostes en temps real...</p>
            </div>
          ) : pendents.length === 0 ? (
            <div className={`py-16 text-center border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <Building2 className="text-slate-500/20" size={48} />
              <p className="text-xs uppercase font-black tracking-widest text-slate-400">Tot al dia! No hi ha cap proposta de gimnàs pendent.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {pendents.map((p) => {
                const isOwner = p.tipusProposta === 'propietari';
                const hasWhatsApp = p.permis_whatsapp === true || p.permis_whatsapp === 'true' || p.permis_whatsapp === 'si';
                
                // Horaris
                const hSetmana = p.horaris_setmana || p.horaris || "";
                const hDissabte = p.horaris_dissabte || "";
                const hDiumenge = p.horaris_diumenge || "";
                const hFestius = p.horaris_festius || "";
                const hEspecial = p.horari_especial_opos || "";

                // Preus i descomptes d'opositors
                const isSpecialOpos = p.te_preu_especial_opositors === true || p.te_preu_especial_opositors === 'true' || p.te_tarifa_especial_opos === "si";
                const valOpos = p.preu_especial_opositors || p.valor_tarifa_opos || "";
                const tipusOposText = p.tipus_tarifa_opos === 'extra' ? "Suplement extra sobre quota base" : "Quota plana reduïda d'opositor";

                // Xarxes socials
                const insta = p.rrss_instagram || "";
                const face = p.rrss_facebook || "";
                const twit = p.rrss_twitter || "";
                const tik = p.rrss_tiktok || "";
                const webLink = p.rrss_web || p.web || "";

                return (
                  <div 
                    key={p.id}
                    className={`p-6 md:p-8 rounded-[2.5rem] border-2 transition-all flex flex-col gap-6 relative overflow-hidden ${
                      darkMode 
                        ? 'bg-slate-800/40 border-slate-700/60 hover:border-emerald-500/40 shadow-xl shadow-black/20' 
                        : 'bg-white border-slate-100 hover:border-emerald-500 shadow-sm'
                    }`}
                  >
                    {/* TIPUS DE PROPONENT (USUARI O PROPIETARI) */}
                    <div className="absolute top-0 right-0">
                      <span className={`text-[9px] font-black uppercase px-5 py-2 rounded-bl-[1.5rem] leading-none tracking-wider ${
                        isOwner 
                          ? 'bg-yellow-500 text-slate-950' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {isOwner ? '⚡ Propietari del centre' : '👤 Opositor / Usuari'}
                      </span>
                    </div>

                    {/* CAPÇALERA DE TARGETA */}
                    <div className="flex flex-col gap-2 pr-32">
                      <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={11} /> {p.provincia} {p.comarca ? `• ${p.comarca}` : ""} {p.municipi ? `• ${p.municipi}` : ""} {p.ciutat ? `(${p.ciutat})` : ""}
                      </span>
                      <h4 className={`text-2xl font-black uppercase italic tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {p.nomGimnas}
                      </h4>
                      {p.adreca && (
                        <span className="text-[11px] text-slate-400 font-bold tracking-tight">
                          Adreça: <span className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{p.adreca}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      
                      {/* BLOC 1: DADES DEL DEMANANT / CONTACTE */}
                      <div className={`p-5 rounded-3xl flex flex-col gap-3 ${darkMode ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
                        <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1">
                          <User size={12} /> Contacte i Proponent
                        </span>
                        
                        <div className="space-y-2">
                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 font-bold uppercase">Nom de contacte</span>
                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                              {p.nomSollicitant || p.nomPropietari || "Anònim"}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-[8px] text-slate-400 font-bold uppercase">Correu electrònic</span>
                            <span className="text-xs font-black text-slate-400 truncate">
                              {p.emailContacte}
                            </span>
                          </div>

                          {(p.telefon || p.telefonContacte) && (
                            <div className="flex flex-col">
                              <span className="text-[8px] text-slate-400 font-bold uppercase">Telèfon de contacte</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                  {p.telefonContacte || p.telefon}
                                </span>
                                {hasWhatsApp && (
                                  <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[7px] font-bold uppercase tracking-tight">
                                    Permet WhatsApp
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* BLOC 2: APTITUDS FÍSIQUES A ENTRENAR */}
                      <div className={`p-5 rounded-3xl flex flex-col gap-3 ${darkMode ? 'bg-slate-900/60' : 'bg-slate-50'}`}>
                        <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1">
                          <Award size={12} /> Aptituds Físiques Disponibles
                        </span>
                        
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {p.proves && p.proves.length > 0 ? p.proves.map(pr => (
                            <span key={pr} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-tight border border-emerald-500/20">
                              {pr}
                            </span>
                          )) : (
                            <span className="text-xs text-slate-400 italic">No s'han triat proves específiques.</span>
                          )}
                        </div>

                        {/* CANALS SOCIALS I WEB */}
                        <div className="mt-auto pt-3 border-t border-slate-700/20">
                          <span className="text-[8px] font-black uppercase text-slate-400 block mb-1.5">Enllaços i xarxes socials:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {webLink && (
                              <a href={webLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-[8px] font-bold uppercase transition-all">
                                <Globe size={10} /> Web
                              </a>
                            )}
                            {insta && (
                              <a href={insta} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-lg text-[8px] font-bold uppercase transition-all">
                                <Instagram size={10} /> Instagram
                              </a>
                            )}
                            {face && (
                              <a href={face} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-lg text-[8px] font-bold uppercase transition-all">
                                <Facebook size={10} /> Facebook
                              </a>
                            )}
                            {twit && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-slate-500/10 text-slate-400 rounded-lg text-[8px] font-bold uppercase">
                                Twitter/X
                              </span>
                            )}
                            {tik && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-slate-500/10 text-slate-400 rounded-lg text-[8px] font-bold uppercase">
                                TikTok
                              </span>
                            )}
                            {!webLink && !insta && !face && !twit && !tik && (
                              <span className="text-[9px] text-slate-500 font-medium">Sense xarxes informades.</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* BLOC 3: HORARIS COMPLETES DEL CENTRE */}
                    <div className={`p-5 rounded-3xl flex flex-col gap-3 border ${darkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                      <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1">
                        <Clock size={12} /> Horaris Detallats de l'Establiment
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[7px] text-slate-400 font-black uppercase">Dilluns a Divendres</span>
                          <span className="text-xs font-bold truncate">{hSetmana || "No indicat"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] text-slate-400 font-black uppercase">Dissabte</span>
                          <span className="text-xs font-bold truncate">{hDissabte || "No indicat"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] text-slate-400 font-black uppercase">Diumenge</span>
                          <span className="text-xs font-bold truncate">{hDiumenge || "Tancat/No indicat"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] text-slate-400 font-black uppercase">Festius</span>
                          <span className="text-xs font-bold truncate">{hFestius || "Tancat/No indicat"}</span>
                        </div>
                      </div>

                      {hEspecial && hEspecial !== "No disposa" && (
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-0.5 mt-1 text-left">
                          <span className="text-[8px] font-black uppercase text-amber-500 flex items-center gap-1">
                            ⭐ HORARI ESPECIAL OPOSICIONS
                          </span>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 leading-relaxed">
                            {hEspecial}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* BLOC 4: PREUS, TARIFES I DESCOMPTES D'OPOSITORS */}
                    <div className={`p-5 rounded-3xl flex flex-col gap-3 border ${darkMode ? 'bg-slate-900/20 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                      <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1">
                        <DollarSign size={12} /> Preus, Tarifes i Avantatges d'OposiCAT
                      </span>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] text-slate-400 font-black uppercase">Tarifes informades (Textual o Generals)</span>
                          <p className="text-xs font-semibold leading-relaxed">
                            {p.tarifes || p.preus || "Tarifes generals sota consulta directe al centre."}
                          </p>

                          {/* RAW PRICES */}
                          {((p.tarifes_mensuals_raw && p.tarifes_mensuals_raw.length > 0) || 
                            (p.tarifes_trimestrals_raw && p.tarifes_trimestrals_raw.length > 0) || 
                            (p.tarifes_anuals_raw && p.tarifes_anuals_raw.length > 0)) && (
                            <div className="flex flex-wrap gap-2.5 mt-2 bg-slate-500/5 p-2 rounded-xl">
                              {p.tarifes_mensuals_raw && p.tarifes_mensuals_raw.length > 0 && (
                                <span className="text-[9px] font-bold"><span className="text-[8px] text-slate-400 uppercase">Mensual:</span> {p.tarifes_mensuals_raw.join(" / ")}€</span>
                              )}
                              {p.tarifes_trimestrals_raw && p.tarifes_trimestrals_raw.length > 0 && (
                                <span className="text-[9px] font-bold"><span className="text-[8px] text-slate-400 uppercase">Trimestral:</span> {p.tarifes_trimestrals_raw.join(" / ")}€</span>
                              )}
                              {p.tarifes_anuals_raw && p.tarifes_anuals_raw.length > 0 && (
                                <span className="text-[9px] font-bold"><span className="text-[8px] text-slate-400 uppercase">Anual:</span> {p.tarifes_anuals_raw.join(" / ")}€</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* SECCIÓ PREU ESPECIAL */}
                        <div className={`p-4 rounded-2xl flex flex-col justify-center gap-1 text-left ${
                          isSpecialOpos 
                            ? 'bg-emerald-500/10 border border-emerald-500/20' 
                            : 'bg-slate-500/5'
                        }`}>
                          <span className={`text-[8px] font-black uppercase ${isSpecialOpos ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {isSpecialOpos ? '🏷️ DESCOMPTE ACTIU PER A OPOSITORS' : 'No informa descompte opositor'}
                          </span>
                          {isSpecialOpos ? (
                            <div className="space-y-1">
                              <p className="text-lg font-black text-emerald-500 tracking-tight leading-none">
                                {valOpos}
                              </p>
                              {p.tipus_tarifa_opos && (
                                <span className="text-[8px] text-slate-400 block font-bold uppercase leading-none">
                                  {tipusOposText}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 font-semibold italic">
                              No s'ha definit cap quota especial per opositors de manera explícita.
                            </p>
                          )}
                        </div>

                        {/* SECCIÓ ENTRENADOR ESPECIALITZAT */}
                        <div className={`p-4 rounded-2xl flex flex-col justify-center gap-1 text-left ${
                          p.te_entrenador_opos === true || p.te_entrenador_opos === 'true' || p.comentari?.toLowerCase().includes("entrenador") || p.comentari?.toLowerCase().includes("preparador")
                            ? 'bg-blue-500/10 border border-blue-500/20' 
                            : 'bg-slate-500/5'
                        }`}>
                          <span className={`text-[8px] font-black uppercase ${p.te_entrenador_opos === true || p.te_entrenador_opos === 'true' || p.comentari?.toLowerCase().includes("entrenador") || p.comentari?.toLowerCase().includes("preparador") ? 'text-blue-400' : 'text-slate-400'}`}>
                            {p.te_entrenador_opos === true || p.te_entrenador_opos === 'true' || p.comentari?.toLowerCase().includes("entrenador") || p.comentari?.toLowerCase().includes("preparador") ? '🏃‍♂️ ENTRENADOR OPOSICIONS ACTIU' : 'No informa preparador físic'}
                          </span>
                          {p.te_entrenador_opos === true || p.te_entrenador_opos === 'true' || p.comentari?.toLowerCase().includes("entrenador") || p.comentari?.toLowerCase().includes("preparador") ? (
                            <p className="text-xs text-blue-300 font-extrabold tracking-tight mt-1">
                              Disposa de preparació professional guiada per a opositors de Mossos.
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500 font-semibold italic">
                              No s'indiquen preparadors especialitzats de forma directa.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* COMENTARI */}
                    {p.comentari && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <MessageSquare size={11} /> Descripció / Aportació de Valor del Centre:
                        </span>
                        <p className={`text-[12px] italic font-medium leading-relaxed p-4 rounded-2xl ${darkMode ? 'bg-slate-900/30 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                          "{p.comentari}"
                        </p>
                      </div>
                    )}

                    <div className="h-px bg-white/5 w-full mt-2" />

                    {/* ACCIONS DE LA PROPUESTA */}
                    <div className="flex flex-wrap gap-2 justify-end mt-1">
                      <button
                        onClick={() => handleDenegar(p.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                          darkMode 
                            ? 'border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white' 
                            : 'border-red-200 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <X size={14} /> Rebutjar
                      </button>
                      <button
                        onClick={() => handleObrirModificacio(p)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                          darkMode 
                            ? 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500 hover:text-white' 
                            : 'border-indigo-200 bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white'
                        }`}
                      >
                        <Edit3 size={14} /> Modificar i Crear
                      </button>
                      <button
                        onClick={() => handleAcceptarDirecte(p)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/15"
                      >
                        <Check size={14} /> Validar i Publicar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECCIÓ 2: PROCESSADES / ARXIVADES */}
        <div className="space-y-6">
          <h3 className={`text-xl font-black uppercase italic tracking-tighter opacity-60 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Historial de propostes gestionades ({processades.length})
          </h3>

          {processades.length === 0 ? (
            <p className="text-xs text-slate-500 italic pl-2">Encara no s'ha processat cap proposta.</p>
          ) : (
            <div className={`border rounded-[2.5rem] overflow-hidden ${darkMode ? 'border-slate-800 bg-slate-900/10' : 'border-slate-100 bg-white'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[9px] font-black uppercase tracking-wider ${darkMode ? 'border-slate-800 text-slate-500 bg-slate-950/20' : 'border-slate-100 text-slate-400 bg-slate-50'}`}>
                      <th className="p-4 pl-8">Gimnàs</th>
                      <th className="p-4">Tipus</th>
                      <th className="p-4">Ubicació</th>
                      <th className="p-4">Proponent</th>
                      <th className="p-4 pr-8 text-right">Estat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {processades.map(p => (
                      <tr key={p.id} className="text-xs font-semibold hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="p-4 pl-8">
                          <span className={`font-black uppercase tracking-tight text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{p.nomGimnas}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            p.tipusProposta === 'propietari' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>
                            {p.tipusProposta}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{p.provincia} ({p.municipi})</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span>{p.nomSollicitant || p.nomPropietari || "Anònim"}</span>
                            <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{p.emailContacte}</span>
                          </div>
                        </td>
                        <td className="p-4 pr-8 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                            p.estat === 'acceptada' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {p.estat === 'acceptada' ? <Check size={10} /> : <X size={10} />}
                            {p.estat}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE MODIFICACIÓ AVANS DE PUBLICAR */}
      {isEditModalOpen && propostaAEditar && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => { setIsEditModalOpen(false); setPropostaAEditar(null); }} />
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] border-2 p-8 md:p-10 shadow-2xl ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => { setIsEditModalOpen(false); setPropostaAEditar(null); }}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <span className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">Edició i Publicació d'instal·lació</span>
              <h3 className="text-3xl font-black uppercase italic mt-1">Revisar Gimnàs Recomanat</h3>
              <p className="text-xs text-slate-400 mt-1">
                Modifica els camps de la sol·licitud original de l'usuari abans de crear oficialment el gimnàs a la base de dades.
              </p>
            </div>

            <form onSubmit={handleGuardarModificacio} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Nom Oficial del Centre</label>
                  <input 
                    required
                    value={editNomGimnas}
                    onChange={e => setEditNomGimnas(e.target.value)}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-1">Aptituds físiques disponibles</label>
                  <div className="flex flex-wrap gap-2">
                    {modalitats.map(mod => {
                      const isSelected = editProves.includes(mod);
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => toggleEditProva(mod)}
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
                    {comarquesEditables.map(c => <option key={c} value={c}>{c}</option>)}
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
                    {municipisEditables.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* ADREÇA FÍSICA EDITABLE */}
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
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
              </div>

              {/* TARIFES EDITABLES */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Preus i Tarifes oficials *</label>
                <textarea 
                  required
                  value={editTarifes}
                  onChange={e => setEditTarifes(e.target.value)}
                  rows={2}
                  className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm resize-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                />
              </div>

              {/* HORARIS EDITABLES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 block px-1">Horaris d'obertura</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block px-1">Dl - Dv</span>
                      <input 
                        required
                        value={editHorarisSetmana}
                        onChange={e => setEditHorarisSetmana(e.target.value)}
                        className={`w-full p-3 rounded-xl border-none outline-none font-bold text-xs ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block px-1">Dissabte</span>
                      <input 
                        value={editHorarisDissabte}
                        onChange={e => setEditHorarisDissabte(e.target.value)}
                        className={`w-full p-3 rounded-xl border-none outline-none font-bold text-xs ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase block px-1">Diumenge</span>
                      <input 
                        value={editHorarisDiumenge}
                        onChange={e => setEditHorarisDiumenge(e.target.value)}
                        className={`w-full p-3 rounded-xl border-none outline-none font-bold text-xs ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-500 block px-1">Horari Especial oposicions</span>
                  <input 
                    value={editHorariEspecialOpos}
                    onChange={e => setEditHorariEspecialOpos(e.target.value)}
                    placeholder="Ex: Ma-Dj de 18:30 a 20h"
                    className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                  />
                </div>
              </div>

              {/* DADES D'OPOSITORS I XARXES EDITABLES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase text-slate-500">Descompte o Preu Especial Opositors</span>
                    <button
                      type="button"
                      onClick={() => setEditTePreuEspecialOpositors(!editTePreuEspecialOpositors)}
                      className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${editTePreuEspecialOpositors ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                    >
                      {editTePreuEspecialOpositors ? 'Sí' : 'No'}
                    </button>
                  </div>
                  {editTePreuEspecialOpositors && (
                    <input 
                      value={editPreuEspecialOpositors}
                      onChange={e => setEditPreuEspecialOpositors(e.target.value)}
                      placeholder="Ex: quota d'opositor a 35€/mes sense matrícula"
                      className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                    />
                  )}

                  <div className="flex items-center justify-between px-1 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] font-black uppercase text-slate-500">Disposa d'Entrenadors per a Opositors</span>
                    <button
                      type="button"
                      onClick={() => setEditTeEntrenadorOpos(!editTeEntrenadorOpos)}
                      className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${editTeEntrenadorOpos ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                    >
                      {editTeEntrenadorOpos ? 'Sí' : 'No'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 block px-1">Xarxes Socials i Web</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      value={editRrssInstagram}
                      onChange={e => setEditRrssInstagram(e.target.value)}
                      placeholder="Instagram URL"
                      className={`w-full p-3 rounded-xl border-none outline-none font-semibold text-xs ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                    />
                    <input 
                      value={editRrssFacebook}
                      onChange={e => setEditRrssFacebook(e.target.value)}
                      placeholder="Facebook URL"
                      className={`w-full p-3 rounded-xl border-none outline-none font-semibold text-xs ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      value={editRrssTwitter}
                      onChange={e => setEditRrssTwitter(e.target.value)}
                      placeholder="Twitter URL"
                      className={`w-full p-2 rounded-lg border-none outline-none font-semibold text-[10px] ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                    />
                    <input 
                      value={editRrssTiktok}
                      onChange={e => setEditRrssTiktok(e.target.value)}
                      placeholder="TikTok URL"
                      className={`w-full p-2 rounded-lg border-none outline-none font-semibold text-[10px] ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                    />
                    <input 
                      value={editRrssWeb}
                      onChange={e => setEditRrssWeb(e.target.value)}
                      placeholder="Pàgina Web URL"
                      className={`w-full p-2 rounded-lg border-none outline-none font-semibold text-[10px] ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                    />
                  </div>
                </div>
              </div>

              {/* COMENTARI COM A DESCRIPCIÓ OFICIAL */}
              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[10px] font-black uppercase text-slate-500 px-1">Descripció del centre o Comentaris de publicació *</label>
                <textarea 
                  required
                  value={editComentari}
                  onChange={e => setEditComentari(e.target.value)}
                  rows={3}
                  className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm resize-none ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setPropostaAEditar(null); }}
                  className="px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/15 transition-all"
                >
                  Confirmar i Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
