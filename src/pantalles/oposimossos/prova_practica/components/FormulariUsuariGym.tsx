import { useState, useMemo } from "react";
import { Check, X, Loader2, ArrowRight, ArrowLeft, Instagram, Facebook, Globe, Plus, Trash2 } from "lucide-react";
import { db, auth } from "../../../../lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { DATA_CATALUNYA } from "../../../../data/municipis";
import { motion, AnimatePresence } from "motion/react";
import SearchableSelect from "../../../../components/SearchableSelect";

// Explicació per a no-programadors:
// Aquestes són les tres proves oficials de la part física per a l'oposició de Mossos d'Esquadra.
// El sol·licitant indicarà quines d'aquestes es poden preparar al centre.
const PROVES_DISPONIBLES = [
  "Circuit d'Agilitat",
  "Press de Banca",
  "Course Navette"
];

// Opcions de temps per als selectors d'horaris (intervals de 30 minuts)
const OPOCIONS_HORES = [
  "05:00", "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00"
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface FormulariUsuariGymProps {
  onTancar: () => void;
  onSuccess: () => void;
}

export default function FormulariUsuariGym({ onTancar, onSuccess }: FormulariUsuariGymProps) {
  // Explicació per a no-programadors:
  // Controlarem el pas del qüestionari (de l'1 al 5) utilitzant un estat de React.
  const [pas, setPas] = useState(1);
  const totalPassos = 5;

  // --- PAS 1: DADES DE CONTACTE ---
  // Explicació per a no-programadors:
  // Els usuaris poden triar entre ser "Anònim" o introduir el seu "Nom i cognom".
  const [tipusNom, setTipusNom] = useState<"anonim" | "nom_cognom">("anonim");
  const [nomSollicitant, setNomSollicitant] = useState("");
  const [emailContacte, setEmailContacte] = useState(auth.currentUser?.email || "");
  const [telefonContacte, setTelefonContacte] = useState("");
  const [permisWhatsapp, setPermisWhatsapp] = useState(true);

  // --- PAS 2: LOCALITZACIÓ ---
  const [nomGimnas, setNomGimnas] = useState("");
  const [proves, setProves] = useState<string[]>([]);
  const [provincia, setProvincia] = useState("");
  const [comarca, setComarca] = useState("");
  const [municipi, setMunicipi] = useState("");
  const [ciutat, setCiutat] = useState(""); // Camp nou: En quina ciutat es troba el centre
  const [adreca, setAdreca] = useState("");

  // --- PAS 3: HORARIS ---
  // Horaris generals
  const [teHorariSetmana, setTeHorariSetmana] = useState<"si" | "no">("si");
  const [oberturaSetmana, setOberturaSetmana] = useState("07:00");
  const [tancamentSetmana, setTancamentSetmana] = useState("22:00");

  const [teHorariDissabte, setTeHorariDissabte] = useState<"si" | "no">("no");
  const [oberturaDissabte, setOberturaDissabte] = useState("09:00");
  const [tancamentDissabte, setTancamentDissabte] = useState("14:00");

  const [teHorariDiumenge, setTeHorariDiumenge] = useState<"si" | "no">("no");
  const [oberturaDiumenge, setOberturaDiumenge] = useState("09:00");
  const [tancamentDiumenge, setTancamentDiumenge] = useState("14:00");

  const [teHorariFestius, setTeHorariFestius] = useState<"si" | "no">("no");
  const [oberturaFestius, setOberturaFestius] = useState("09:00");
  const [tancamentFestius, setTancamentFestius] = useState("14:00");

  const [hoDesconecHoraris, setHoDesconecHoraris] = useState(false);

  // Horaris per a opositors
  const [teHorariOpositors, setTeHorariOpositors] = useState<"si" | "no">("no");
  const [teHorariOposSetmana, setTeHorariOposSetmana] = useState<"si" | "no">("si");
  const [oberturaOposSetmana, setOberturaOposSetmana] = useState("18:00");
  const [tancamentOposSetmana, setTancamentOposSetmana] = useState("20:00");

  const [teHorariOposDissabte, setTeHorariOposDissabte] = useState<"si" | "no">("no");
  const [oberturaOposDissabte, setOberturaOposDissabte] = useState("10:00");
  const [tancamentOposDissabte, setTancamentOposDissabte] = useState("13:00");

  const [teHorariOposDiumenge, setTeHorariOposDiumenge] = useState<"si" | "no">("no");
  const [oberturaOposDiumenge, setOberturaOposDiumenge] = useState("10:00");
  const [tancamentOposDiumenge, setTancamentOposDiumenge] = useState("13:00");

  const [hoDesconecHorarisOpos, setHoDesconecHorarisOpos] = useState(false);

  // --- PAS 4: PREUS I TARIFES ---
  const [desconecPreus, setDesconecPreus] = useState(false);
  
  // Selecció de quines tarifes es volen afegir
  const [teTarifaMensual, setTeTarifaMensual] = useState(false);
  const [teTarifaTrimestral, setTeTarifaTrimestral] = useState(false);
  const [teTarifaAnual, setTeTarifaAnual] = useState(false);

  // Llistats dinàmics per a múltiples tarifes de cada tipus
  const [tarifesMensuals, setTarifesMensuals] = useState<number[]>([40]);
  const [tarifesTrimestrals, setTarifesTrimestrals] = useState<number[]>([110]);
  const [tarifesAnuals, setTarifesAnuals] = useState<number[]>([400]);

  // Tarifes especials per a opositors
  const [teTarifaEspecialOpos, setTeTarifaEspecialOpos] = useState<"si" | "no">("no");
  const [tipusTarifaOpos, setTipusTarifaOpos] = useState<"extra" | "reduida">("reduida");
  const [preuExtraOpos, setPreuExtraOpos] = useState(10);
  const [preuReduitOpos, setPreuReduitOpos] = useState(35);

  // --- PAS 5: PUBLICITAT I DETALLS ---
  const [rrssInstagram, setRrssInstagram] = useState("");
  const [rrssFacebook, setRrssFacebook] = useState("");
  const [rrssTwitter, setRrssTwitter] = useState("");
  const [rrssTiktok, setRrssTiktok] = useState("");
  const [rrssWeb, setRrssWeb] = useState("");
  const [cosesValor, setCosesValor] = useState("");

  // Estats auxiliars d'enviament
  const [enviant, setEnviant] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Llistats geogràfics de Catalunya
  const provincies = Object.keys(DATA_CATALUNYA);

  const comarques = useMemo(() => {
    return provincia ? Object.keys(DATA_CATALUNYA[provincia as keyof typeof DATA_CATALUNYA] || {}) : [];
  }, [provincia]);

  const municipis = useMemo(() => {
    if (!provincia || !comarca) return [];
    return DATA_CATALUNYA[provincia as keyof typeof DATA_CATALUNYA]?.[comarca] || [];
  }, [provincia, comarca]);

  // Afegir o treure proves físiques de la llista
  const handleToggleProva = (prova: string) => {
    if (proves.includes(prova)) {
      setProves(proves.filter(p => p !== prova));
    } else {
      setProves([...proves, prova]);
    }
  };

  // Explicació per a no-programadors:
  // Validem si el pas actual és vàlid abans de permetre avançar.
  const canAvançar = () => {
    if (pas === 1) {
      const nomValid = tipusNom === "anonim" || (tipusNom === "nom_cognom" && nomSollicitant.trim() !== "");
      return nomValid && telefonContacte.trim() !== "";
    }
    if (pas === 2) {
      return nomGimnas.trim() !== "" && provincia !== "" && comarca !== "" && municipi !== "" && ciutat.trim() !== "" && adreca.trim() !== "" && proves.length > 0;
    }
    if (pas === 3) {
      if (hoDesconecHoraris) return true;
      // Si no es desconeix, cal haver omplert almenys els horaris de setmana si estan actius
      if (teHorariSetmana === "si" && (!oberturaSetmana || !tancamentSetmana)) return false;
      return true;
    }
    if (pas === 4) {
      if (desconecPreus) return true;
      // Si no es desconeix, ha de tenir activada i configurada com a mínim una de les tarifes generals (mensual, trimestral o anual)
      const teAlmenysUnaTarifa = teTarifaMensual || teTarifaTrimestral || teTarifaAnual;
      if (!teAlmenysUnaTarifa) return false;
      return true;
    }
    return true;
  };

  // Envia la proposta de forma segura a la base de dades Firestore d'OposiCAT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pas < totalPassos) {
      if (canAvançar()) {
        setPas(pas + 1);
      }
      return;
    }
    if (!canAvançar()) return;

    setErrorMsg(null);
    setEnviant(true);

    const propostesRef = collection(db, "propostes_gimnasos");
    const novaPropostaDoc = doc(propostesRef);

    try {
      // Explicació per a no-programadors:
      // Creem un format textual bonic i clar d'horaris i tarifes per a que l'app existent el pugui mostrar perfectament sense trencar res.
      let horarisSetmanaText = hoDesconecHoraris ? "Desconegut" : (teHorariSetmana === "si" ? `${oberturaSetmana}h a ${tancamentSetmana}h` : "No disponible");
      let horarisDissabteText = hoDesconecHoraris ? "Desconegut" : (teHorariDissabte === "si" ? `${oberturaDissabte}h a ${tancamentDissabte}h` : "No disponible");
      let horarisDiumengeText = hoDesconecHoraris ? "Desconegut" : (teHorariDiumenge === "si" ? `${oberturaDiumenge}h a ${tancamentDiumenge}h` : "No disponible");
      let horarisFestiusText = hoDesconecHoraris ? "Desconegut" : (teHorariFestius === "si" ? `${oberturaFestius}h a ${tancamentFestius}h` : "No disponible");

      let horariEspecialOposText = "No disposa";
      if (hoDesconecHorarisOpos) {
        horariEspecialOposText = "Desconegut";
      } else if (teHorariOpositors === "si") {
        let parts = [];
        if (teHorariOposSetmana === "si") parts.push(`Entre setmana: ${oberturaOposSetmana}h a ${tancamentOposSetmana}h`);
        if (teHorariOposDissabte === "si") parts.push(`Dissabte: ${oberturaOposDissabte}h a ${tancamentOposDissabte}h`);
        if (teHorariOposDiumenge === "si") parts.push(`Diumenge: ${oberturaOposDiumenge}h a ${tancamentOposDiumenge}h`);
        horariEspecialOposText = parts.length > 0 ? parts.join(" | ") : "Sí, hores convingudes";
      }

      // Format textual de tarifes per al cercador general
      let preusFormatted = "";
      if (desconecPreus) {
        preusFormatted = "Contacta amb el centre per consultar les tarifes.";
      } else {
        let parts = [];
        if (teTarifaMensual) parts.push(`Mensual: ${tarifesMensuals.map(p => `${p}€`).join(" / ")}`);
        if (teTarifaTrimestral) parts.push(`Trimestral: ${tarifesTrimestrals.map(p => `${p}€`).join(" / ")}`);
        if (teTarifaAnual) parts.push(`Anual: ${tarifesAnuals.map(p => `${p}€`).join(" / ")}`);
        
        if (teTarifaEspecialOpos === "si") {
          if (tipusTarifaOpos === "extra") {
            parts.push(`Descompte opositors: Quota base + ${preuExtraOpos}€ suplement opos`);
          } else {
            parts.push(`Tarifa plana reduïda opositors: ${preuReduitOpos}€/mes`);
          }
        }
        preusFormatted = parts.join(" | ");
      }

      const novaProposta = {
        usuariId: auth.currentUser?.uid || "anonim",
        tipusProposta: "usuari",
        nomSollicitant: tipusNom === "anonim" ? "Anònim" : nomSollicitant,
        emailContacte,
        telefonContacte,
        permis_whatsapp: permisWhatsapp,
        nomGimnas,
        provincia,
        comarca,
        municipi,
        ciutat, // Ciutat desada de manera correcta i estructurada
        adreca: `${adreca} (${ciutat})`,
        proves,
        
        // Horaris generals estructurats i en format text retrospectiu
        horaris_setmana: horarisSetmanaText,
        horaris_dissabte: horarisDissabteText,
        horaris_diumenge: horarisDiumengeText,
        horaris_festius: horarisFestiusText,
        horari_especial_opos: horariEspecialOposText,
        
        // Tarifes i preus estructurats
        preus: preusFormatted,
        tarifes: preusFormatted,
        desconec_preus: desconecPreus,
        tarifes_mensuals_raw: teTarifaMensual ? tarifesMensuals : [],
        tarifes_trimestrals_raw: teTarifaTrimestral ? tarifesTrimestrals : [],
        tarifes_anuals_raw: teTarifaAnual ? tarifesAnuals : [],
        te_tarifa_especial_opos: teTarifaEspecialOpos,
        tipus_tarifa_opos: teTarifaEspecialOpos === "si" ? tipusTarifaOpos : null,
        valor_tarifa_opos: teTarifaEspecialOpos === "si" ? (tipusTarifaOpos === "extra" ? preuExtraOpos : preuReduitOpos) : null,

        // Xarxes socials i informació addicional
        rrss_instagram: rrssInstagram,
        rrss_facebook: rrssFacebook,
        rrss_twitter: rrssTwitter,
        rrss_tiktok: rrssTiktok,
        rrss_web: rrssWeb,

        comentari: cosesValor.substring(0, 1000), // Limitem el contingut extra a 1000 caràcters
        estat: "pendent",
        creatEl: new Date().toISOString()
      };

      await setDoc(novaPropostaDoc, novaProposta);
      setEnviant(false);
      onSuccess();
    } catch (err: any) {
      setEnviant(false);
      setErrorMsg("S'ha produït un error al desar la proposta del centre. Torna-ho a provar.");
      handleFirestoreError(err, OperationType.WRITE, `propostes_gimnasos/${novaPropostaDoc.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left text-white max-h-[80vh]">
      {/* CAPÇALERA DE FORMULARI */}
      <div className="flex flex-col gap-1.5 pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
            PROPOSAR NOU GIMNÀS (USUARI)
          </span>
          <span className="text-[10px] font-bold text-white/40 uppercase">
            Pas {pas} de {totalPassos}
          </span>
        </div>
        <h3 className="text-xl font-black italic uppercase tracking-tight text-white">
          {pas === 1 && "Dades de Contacte"}
          {pas === 2 && "Localització del Centre"}
          {pas === 3 && "Horaris d'Obertura"}
          {pas === 4 && "Preus i Tarifes"}
          {pas === 5 && "Publicitat del Gimnàs"}
        </h3>
        {/* Barra de progrés */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300" 
            style={{ width: `${(pas / totalPassos) * 100}%` }}
          />
        </div>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-2xl font-bold">
          {errorMsg}
        </div>
      )}

      {/* CONTINGUT DINÀMIC SEGONS EL PAS */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 py-1 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence mode="wait">
          {pas === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
              key="pas1"
            >
              {/* NOM SENSE SECUNDÀRIES COMPLEXITATS */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                  Vols enviar la proposta de forma Anònima o amb el teu Nom? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTipusNom("anonim");
                      setNomSollicitant("");
                    }}
                    className={`p-4 rounded-2xl font-black italic uppercase text-center text-xs tracking-wider border transition-all ${
                      tipusNom === "anonim"
                        ? "bg-emerald-500 text-[#001529] border-emerald-500"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    Anònim
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipusNom("nom_cognom")}
                    className={`p-4 rounded-2xl font-black italic uppercase text-center text-xs tracking-wider border transition-all ${
                      tipusNom === "nom_cognom"
                        ? "bg-emerald-500 text-[#001529] border-emerald-500"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    Nom i cognom
                  </button>
                </div>
              </div>

              {tipusNom === "nom_cognom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-col gap-2"
                >
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                    El teu Nom i Cognom *
                  </label>
                  <input
                    type="text"
                    value={nomSollicitant}
                    onChange={(e) => setNomSollicitant(e.target.value)}
                    placeholder="Ex: Marc Garriga"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 font-bold"
                    required={tipusNom === "nom_cognom"}
                  />
                </motion.div>
              )}

              {/* EMAIL */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                  Correu Electrònic de contacte (Opcional)
                </label>
                <input
                  type="email"
                  value={emailContacte}
                  onChange={(e) => setEmailContacte(e.target.value)}
                  placeholder="Ex: alumne@oposicat.cat"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              {/* TELEFON */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                  Telèfon de contacte * (Obligatori)
                </label>
                <input
                  type="tel"
                  value={telefonContacte}
                  onChange={(e) => setTelefonContacte(e.target.value)}
                  placeholder="Ex: 600 123 456"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 font-bold"
                  required
                />
                
                <label className="flex items-start gap-3 mt-1.5 px-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={permisWhatsapp}
                    onChange={(e) => setPermisWhatsapp(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-[10px] leading-tight text-white/60 font-medium group-hover:text-white transition-colors">
                    Dono permís perquè l'equip d'OposiCAT em pugui contactar via WhatsApp si és necessari aclarir dades.
                  </span>
                </label>
              </div>
            </motion.div>
          )}

          {pas === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
              key="pas2"
            >
              {/* NOM GIMNÀS */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                  Nom del centre o gimnàs *
                </label>
                <input
                  type="text"
                  value={nomGimnas}
                  onChange={(e) => setNomGimnas(e.target.value)}
                  placeholder="Ex: Gimnàs Municipal de Vic"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>

              {/* PROVES DISPONIBLES */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                  Quines proves es poden preparar al centre? * (Mínim una)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {PROVES_DISPONIBLES.map(prova => {
                    const actiu = proves.includes(prova);
                    return (
                      <button
                        type="button"
                        key={prova}
                        onClick={() => handleToggleProva(prova)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                          actiu ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${actiu ? 'bg-emerald-500 border-emerald-500 text-[#001529]' : 'border-white/20'}`}>
                          {actiu && <Check size={10} />}
                        </div>
                        {prova}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UBICACIÓ GEOGRÀFICA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SearchableSelect
                  label="Província *"
                  value={provincia}
                  onChange={(val) => {
                    setProvincia(val);
                    setComarca("");
                    setMunicipi("");
                  }}
                  options={provincies}
                  placeholder="Selecciona província"
                  required
                  darkMode={true}
                />

                <SearchableSelect
                  label="Comarca *"
                  value={comarca}
                  onChange={(val) => {
                    setComarca(val);
                    setMunicipi("");
                  }}
                  options={comarques}
                  placeholder="Selecciona comarca"
                  disabled={!provincia}
                  required
                  darkMode={true}
                />

                <SearchableSelect
                  label="Municipi *"
                  value={municipi}
                  onChange={(val) => setMunicipi(val)}
                  options={municipis}
                  placeholder="Selecciona municipi"
                  disabled={!comarca}
                  required
                  darkMode={true}
                />
              </div>

              {/* CAMP NOU: CIUTAT DEL MUNICIPI */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                  En quina ciutat del municipi es troba el centre? *
                </label>
                <input
                  type="text"
                  value={ciutat}
                  onChange={(e) => setCiutat(e.target.value)}
                  placeholder="Ex: Vic, Sentfores, etc."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>

              {/* ADREÇA FISICA */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                  Adreça Completa (Carrer, número, pis) *
                </label>
                <input
                  type="text"
                  value={adreca}
                  onChange={(e) => setAdreca(e.target.value)}
                  placeholder="Ex: Carrer Major, 15, Baixos"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>
            </motion.div>
          )}

          {pas === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
              key="pas3"
            >
              {/* CHECKBOX HO DESCONEC AMB PRIORITAT PER ALS USUARIS */}
              <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer group hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={hoDesconecHoraris}
                  onChange={(e) => {
                    setHoDesconecHoraris(e.target.checked);
                    if (e.target.checked) {
                      setTeHorariSetmana("no");
                      setTeHorariDissabte("no");
                      setTeHorariDiumenge("no");
                      setTeHorariFestius("no");
                    } else {
                      setTeHorariSetmana("si");
                    }
                  }}
                  className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs font-black uppercase italic tracking-wider text-emerald-400 group-hover:text-white transition-colors">
                  Ho desconec (No conec els horaris del centre)
                </span>
              </label>

              {!hoDesconecHoraris && (
                <div className="space-y-4 border-l-2 border-white/10 pl-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400">1. Horaris del Centre</h4>

                  {/* Dilluns a divendres */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/80">Disposa d'horari entre setmana (Lu-Vi)?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTeHorariSetmana("si")}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teHorariSetmana === "si" ? 'bg-emerald-500 text-[#001529]' : 'bg-white/5 text-white/40'}`}
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeHorariSetmana("no")}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teHorariSetmana === "no" ? 'bg-slate-700 text-white' : 'bg-white/5 text-white/40'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    {teHorariSetmana === "si" && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black uppercase text-white/40">Hora Obertura</span>
                          <select
                            value={oberturaSetmana}
                            onChange={(e) => setOberturaSetmana(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white"
                          >
                            {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black uppercase text-white/40">Hora Tancament</span>
                          <select
                            value={tancamentSetmana}
                            onChange={(e) => setTancamentSetmana(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white"
                          >
                            {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Caps de Setmana */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/80">Disposa d'horari de cap de setmana?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTeHorariDissabte("si")}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teHorariDissabte === "si" ? 'bg-emerald-500 text-[#001529]' : 'bg-white/5 text-white/40'}`}
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeHorariDissabte("no")}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teHorariDissabte === "no" ? 'bg-slate-700 text-white' : 'bg-white/5 text-white/40'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    {teHorariDissabte === "si" && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black uppercase text-white/40">Hora Obertura</span>
                          <select
                            value={oberturaDissabte}
                            onChange={(e) => setOberturaDissabte(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white"
                          >
                            {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black uppercase text-white/40">Hora Tancament</span>
                          <select
                            value={tancamentDissabte}
                            onChange={(e) => setTancamentDissabte(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white"
                          >
                            {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Festius */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/80">Disposa d'horari en Festius?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTeHorariFestius("si")}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teHorariFestius === "si" ? 'bg-emerald-500 text-[#001529]' : 'bg-white/5 text-white/40'}`}
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeHorariFestius("no")}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teHorariFestius === "no" ? 'bg-slate-700 text-white' : 'bg-white/5 text-white/40'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                    {teHorariFestius === "si" && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black uppercase text-white/40">Hora Obertura</span>
                          <select
                            value={oberturaFestius}
                            onChange={(e) => setOberturaFestius(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white"
                          >
                            {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-black uppercase text-white/40">Hora Tancament</span>
                          <select
                            value={tancamentFestius}
                            onChange={(e) => setTancamentFestius(e.target.value)}
                            className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white"
                          >
                            {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. HORARI ADAPTAT A OPOSITORS */}
              <div className="space-y-4 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400">2. Horari Adaptat a Opositors</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTeHorariOpositors("si")}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teHorariOpositors === "si" ? 'bg-emerald-500 text-[#001529]' : 'bg-white/5 text-white/40'}`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeHorariOpositors("no")}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teHorariOpositors === "no" ? 'bg-slate-700 text-white' : 'bg-white/5 text-white/40'}`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {teHorariOpositors === "si" && (
                  <div className="space-y-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                    {/* Desconec de l'opositor */}
                    <label className="flex items-center gap-2.5 pb-2 border-b border-white/10 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hoDesconecHorarisOpos}
                        onChange={(e) => setHoDesconecHorarisOpos(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                      />
                      <span className="text-[10px] font-bold text-white/60">Ho desconec (No sé els horaris específics)</span>
                    </label>

                    {!hoDesconecHorarisOpos && (
                      <div className="space-y-3">
                        {/* Opositors setmana */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white/70">Horari especial setmana?</span>
                          <button
                            type="button"
                            onClick={() => setTeHorariOposSetmana(teHorariOposSetmana === "si" ? "no" : "si")}
                            className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${teHorariOposSetmana === "si" ? 'bg-emerald-500 text-[#001529]' : 'bg-slate-700 text-white'}`}
                          >
                            {teHorariOposSetmana === "si" ? "ACTIU" : "INACTIU"}
                          </button>
                        </div>
                        {teHorariOposSetmana === "si" && (
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={oberturaOposSetmana}
                              onChange={(e) => setOberturaOposSetmana(e.target.value)}
                              className="bg-slate-900 border border-white/5 text-[11px] rounded-lg p-2 font-bold text-white"
                            >
                              {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <select
                              value={tancamentOposSetmana}
                              onChange={(e) => setTancamentOposSetmana(e.target.value)}
                              className="bg-slate-900 border border-white/5 text-[11px] rounded-lg p-2 font-bold text-white"
                            >
                              {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        )}

                        {/* Opositors dissabte */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white/70">Horari especial dissabte?</span>
                          <button
                            type="button"
                            onClick={() => setTeHorariOposDissabte(teHorariOposDissabte === "si" ? "no" : "si")}
                            className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${teHorariOposDissabte === "si" ? 'bg-emerald-500 text-[#001529]' : 'bg-slate-700 text-white'}`}
                          >
                            {teHorariOposDissabte === "si" ? "ACTIU" : "INACTIU"}
                          </button>
                        </div>
                        {teHorariOposDissabte === "si" && (
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={oberturaOposDissabte}
                              onChange={(e) => setOberturaOposDissabte(e.target.value)}
                              className="bg-slate-900 border border-white/5 text-[11px] rounded-lg p-2 font-bold text-white"
                            >
                              {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <select
                              value={tancamentOposDissabte}
                              onChange={(e) => setTancamentOposDissabte(e.target.value)}
                              className="bg-slate-900 border border-white/5 text-[11px] rounded-lg p-2 font-bold text-white"
                            >
                              {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        )}

                        {/* Opositors diumenge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-white/70">Horari especial diumenge?</span>
                          <button
                            type="button"
                            onClick={() => setTeHorariOposDiumenge(teHorariOposDiumenge === "si" ? "no" : "si")}
                            className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${teHorariOposDiumenge === "si" ? 'bg-emerald-500 text-[#001529]' : 'bg-slate-700 text-white'}`}
                          >
                            {teHorariOposDiumenge === "si" ? "ACTIU" : "INACTIU"}
                          </button>
                        </div>
                        {teHorariOposDiumenge === "si" && (
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={oberturaOposDiumenge}
                              onChange={(e) => setOberturaOposDiumenge(e.target.value)}
                              className="bg-slate-900 border border-white/5 text-[11px] rounded-lg p-2 font-bold text-white"
                            >
                              {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <select
                              value={tancamentOposDiumenge}
                              onChange={(e) => setTancamentOposDiumenge(e.target.value)}
                              className="bg-slate-900 border border-white/5 text-[11px] rounded-lg p-2 font-bold text-white"
                            >
                              {OPOCIONS_HORES.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {pas === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
              key="pas4"
            >
              {/* CHECKBOX DESCONEC PREUS AL COMENCAMENT */}
              <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer group hover:bg-white/10 transition-all">
                <input
                  type="checkbox"
                  checked={desconecPreus}
                  onChange={(e) => {
                    setDesconecPreus(e.target.checked);
                    if (e.target.checked) {
                      setTeTarifaMensual(false);
                      setTeTarifaTrimestral(false);
                      setTeTarifaAnual(false);
                    } else {
                      setTeTarifaMensual(true);
                    }
                  }}
                  className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs font-black uppercase italic tracking-wider text-emerald-400 group-hover:text-white transition-colors">
                  Ho desconec (No conec les tarifes del centre)
                </span>
              </label>

              {!desconecPreus && (
                <div className="space-y-4 pl-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Quin és el preu base del gimnàs?</h4>

                  {/* TARIFA MENSUAL */}
                  <div className="space-y-2.5 p-4 bg-white/5 border border-white/10 rounded-3xl">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teTarifaMensual}
                        onChange={(e) => setTeTarifaMensual(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-white">Tarifa Mensual</span>
                    </label>

                    {teTarifaMensual && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                        {tarifesMensuals.map((preu, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <select
                              value={preu}
                              onChange={(e) => {
                                const noves = [...tarifesMensuals];
                                noves[idx] = Number(e.target.value);
                                setTarifesMensuals(noves);
                              }}
                              className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white flex-1"
                            >
                              {Array.from({ length: 501 }, (_, i) => (
                                <option key={i} value={i}>{i} €</option>
                              ))}
                            </select>
                            {tarifesMensuals.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setTarifesMensuals(tarifesMensuals.filter((_, i) => i !== idx))}
                                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/20"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTarifesMensuals([...tarifesMensuals, 40])}
                          className="text-[10px] font-black uppercase text-emerald-400 hover:text-white transition-colors flex items-center gap-1 mt-1"
                        >
                          <Plus size={12} /> Tinc una altra tarifa mensual
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* TARIFA TRIMESTRAL */}
                  <div className="space-y-2.5 p-4 bg-white/5 border border-white/10 rounded-3xl">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teTarifaTrimestral}
                        onChange={(e) => setTeTarifaTrimestral(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-white">Tarifa Trimestral</span>
                    </label>

                    {teTarifaTrimestral && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                        {tarifesTrimestrals.map((preu, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <select
                              value={preu}
                              onChange={(e) => {
                                const noves = [...tarifesTrimestrals];
                                noves[idx] = Number(e.target.value);
                                setTarifesTrimestrals(noves);
                              }}
                              className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white flex-1"
                            >
                              {Array.from({ length: 501 }, (_, i) => {
                                const val = i * 10;
                                return <option key={val} value={val}>{val} €</option>;
                              })}
                            </select>
                            {tarifesTrimestrals.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setTarifesTrimestrals(tarifesTrimestrals.filter((_, i) => i !== idx))}
                                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/20"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTarifesTrimestrals([...tarifesTrimestrals, 110])}
                          className="text-[10px] font-black uppercase text-emerald-400 hover:text-white transition-colors flex items-center gap-1 mt-1"
                        >
                          <Plus size={12} /> Tinc una altra tarifa trimestral
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* TARIFA ANUAL */}
                  <div className="space-y-2.5 p-4 bg-white/5 border border-white/10 rounded-3xl">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={teTarifaAnual}
                        onChange={(e) => setTeTarifaAnual(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-white">Tarifa Anual</span>
                    </label>

                    {teTarifaAnual && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                        {tarifesAnuals.map((preu, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <select
                              value={preu}
                              onChange={(e) => {
                                const noves = [...tarifesAnuals];
                                noves[idx] = Number(e.target.value);
                                setTarifesAnuals(noves);
                              }}
                              className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white flex-1"
                            >
                              {Array.from({ length: 501 }, (_, i) => {
                                const val = i * 10;
                                return <option key={val} value={val}>{val} €</option>;
                              })}
                            </select>
                            {tarifesAnuals.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setTarifesAnuals(tarifesAnuals.filter((_, i) => i !== idx))}
                                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/20"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTarifesAnuals([...tarifesAnuals, 400])}
                          className="text-[10px] font-black uppercase text-emerald-400 hover:text-white transition-colors flex items-center gap-1 mt-1"
                        >
                          <Plus size={12} /> Tinc una altra tarifa anual
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* 2. TARIFES ESPECIALS PER A OPOSITORS */}
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/80">Disposen de tarifes especials per a opositors?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTeTarifaEspecialOpos("si")}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teTarifaEspecialOpos === "si" ? 'bg-emerald-500 text-[#001529]' : 'bg-white/5 text-white/40'}`}
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeTarifaEspecialOpos("no")}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${teTarifaEspecialOpos === "no" ? 'bg-slate-700 text-white' : 'bg-white/5 text-white/40'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {teTarifaEspecialOpos === "si" && (
                      <div className="space-y-3 p-4 bg-white/5 rounded-3xl border border-white/10">
                        <span className="text-[10px] font-bold text-white/60">El preu especial per al opositor és un extra o és tarifa reduïda?</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setTipusTarifaOpos("extra")}
                            className={`p-3 rounded-xl text-center text-[10px] font-black uppercase tracking-wider border ${
                              tipusTarifaOpos === "extra" ? "bg-emerald-500 text-[#001529] border-emerald-500" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            És un Extra (+ suplement)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTipusTarifaOpos("reduida")}
                            className={`p-3 rounded-xl text-center text-[10px] font-black uppercase tracking-wider border ${
                              tipusTarifaOpos === "reduida" ? "bg-emerald-500 text-[#001529] border-emerald-500" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            És Tarifa reduïda / Preu fix
                          </button>
                        </div>

                        {tipusTarifaOpos === "extra" ? (
                          <div className="flex flex-col gap-1 pt-2">
                            <span className="text-[9px] font-black uppercase text-white/40">Quant es sumaria a la quota mensual? (0 a 100€)</span>
                            <select
                              value={preuExtraOpos}
                              onChange={(e) => setPreuExtraOpos(Number(e.target.value))}
                              className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white"
                            >
                              {Array.from({ length: 101 }, (_, i) => (
                                <option key={i} value={i}>{i} €</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 pt-2">
                            <span className="text-[9px] font-black uppercase text-white/40">Quin és el preu especial mensual? (0 a 200€)</span>
                            <select
                              value={preuReduitOpos}
                              onChange={(e) => setPreuReduitOpos(Number(e.target.value))}
                              className="bg-slate-900 border border-white/10 text-xs rounded-xl p-2.5 font-bold text-white"
                            >
                              {Array.from({ length: 201 }, (_, i) => (
                                <option key={i} value={i}>{i} €</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {pas === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
              key="pas5"
            >
              {/* AFRETEIX XARXES SOCIALS SENSE EL MISSATGE DE CONTACTE (Que va abaix de tot del pas final) */}
              <div className="space-y-2.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                  Afegir Xarxes Socials del centre (Opcional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <Instagram size={14} className="text-pink-500 shrink-0" />
                    <input
                      type="text"
                      value={rrssInstagram}
                      onChange={(e) => setRrssInstagram(e.target.value)}
                      placeholder="Instagram URL"
                      className="w-full bg-transparent text-xs text-white focus:outline-none font-semibold"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <Facebook size={14} className="text-blue-500 shrink-0" />
                    <input
                      type="text"
                      value={rrssFacebook}
                      onChange={(e) => setRrssFacebook(e.target.value)}
                      placeholder="Facebook URL"
                      className="w-full bg-transparent text-xs text-white focus:outline-none font-semibold"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <span className="text-xs font-black text-slate-300 w-3.5 text-center font-sans">X</span>
                    <input
                      type="text"
                      value={rrssTwitter}
                      onChange={(e) => setRrssTwitter(e.target.value)}
                      placeholder="Twitter / X URL"
                      className="w-full bg-transparent text-xs text-white focus:outline-none font-semibold"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <span className="text-xs font-black text-slate-300 w-3.5 text-center">🎵</span>
                    <input
                      type="text"
                      value={rrssTiktok}
                      onChange={(e) => setRrssTiktok(e.target.value)}
                      placeholder="TikTok URL"
                      className="w-full bg-transparent text-xs text-white focus:outline-none font-semibold"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <Globe size={14} className="text-emerald-500 shrink-0" />
                  <input
                    type="text"
                    value={rrssWeb}
                    onChange={(e) => setRrssWeb(e.target.value)}
                    placeholder="Pàgina web oficial (Ex: https://www.meugimnas.cat)"
                    className="w-full bg-transparent text-xs text-white focus:outline-none font-semibold"
                  />
                </div>
              </div>

              {/* COSES DE VALOR EXTRA */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                  Disposa de més coses de valor que no surten en el qüestionari? (Opcional)
                </label>
                <textarea
                  value={cosesValor}
                  onChange={(e) => setCosesValor(e.target.value)}
                  placeholder="Detalla qualsevol altra informació important (pistes d'atletisme, entrenador personal dedicat, entrenament exclusiu per a oposicions, etc.)"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 font-bold resize-none leading-relaxed"
                />
              </div>

              {/* LABEL FINAL DEL PAS FINAL REQUERIT */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] leading-relaxed text-white/60">
                Recordeu que els gimnasos seran donats d'alta després de passar una revisió per a l'equip d'Oposicat. Si voleu demanar més informació o proporcionar-ne més, podeu contactar amb l'equip d'OposiCAT al telèfon 618 22 21 45 o al correu de oposicat@gmail.com
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER DEL FORMULARI - NAV DE PAS_A_PAS */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 shrink-0">
        {pas > 1 ? (
          <button
            type="button"
            onClick={() => setPas(pas - 1)}
            className="bg-white/5 border border-white/10 text-white rounded-2xl py-4 font-black italic uppercase tracking-widest text-[11px] hover:bg-white/10 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Enrere
          </button>
        ) : (
          <button
            type="button"
            onClick={onTancar}
            className="bg-white/5 border border-white/10 text-white rounded-2xl py-4 font-black italic uppercase tracking-widest text-[11px] hover:bg-white/10 active:scale-95 transition-all text-center"
          >
            Cancel·lar
          </button>
        )}

        {pas < totalPassos ? (
          <button
            key="boto-seguent"
            type="button"
            onClick={() => setPas(pas + 1)}
            disabled={!canAvançar()}
            className="bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-[#00274d] rounded-2xl py-4 font-black italic uppercase tracking-widest text-[11px] hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Següent <ArrowRight size={14} />
          </button>
        ) : (
          <button
            key="boto-enviar"
            type="submit"
            disabled={enviant || !canAvançar()}
            className="bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-[#00274d] rounded-2xl py-4 font-black italic uppercase tracking-widest text-[11px] hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {enviant ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Enviant...
              </>
            ) : (
              "Donar d'alta"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
