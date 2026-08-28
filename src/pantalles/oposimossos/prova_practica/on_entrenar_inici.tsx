import { useState, useMemo, useEffect, useRef } from "react";
// Explicació per a no-programadors: Importem la icona StarHalf (mitja estrella) de la llibreria d'icones lucide-react per poder representar fraccions de valoració
import { ChevronLeft, Search, MapPin, Building2, ChevronDown, Check, Plus, User, Briefcase, ArrowRight, X, Phone, Mail, Lock, Star, StarHalf, Instagram, Facebook, Globe, Clock, Sparkles, Award, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DATA_CATALUNYA } from "../../../data/municipis";

// Explicació per a no-programadors: Importem la connexió a la base de dades de Firestore
import { db } from "../../../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

// Explicació per a no-programadors: Importem la imatge de fons creada per a la secció "On puc entrenar"
// @ts-ignore
import fonsOnEntrenar from "../../../assets/images/onentrenar.png";

// Explicació per a no-programadors: Importem els dos formularis modulars que hem creat per separar la lògica
import FormulariUsuariGym from "./components/FormulariUsuariGym";
import FormulariPropietariGym from "./components/FormulariPropietariGym";

interface Gym {
  id: string;
  nom: string;
  provincia?: string;
  comarca?: string;
  municipi: string;
  adreca: string;
  estrelles: number;
  preus?: string;
  descripcio: string;
  proves: string[]; // Proves que es poden preparar (mapejat de entrenament)
  referencies: { usuari: string; comentari: string; nota: number }[];
  telefon?: string;
  correu?: string;
  imatges?: string[];
  suspes?: boolean;
  te_preu_especial_opositors?: boolean;
  preu_especial_opositors?: string;
  horari_especial_opos?: string;
  tarifes_mensuals_raw?: number[];
  tarifes_trimestrals_raw?: number[];
  tarifes_anuals_raw?: number[];
  te_entrenador_opos?: boolean;
  // Explicació per a no-programadors: Afegim aquestes noves variables per guardar de forma detallada els horaris complets de setmana, dissabte, diumenge i festius registrats a la base de dades
  horaris_setmana?: string;
  horaris_dissabte?: string;
  horaris_diumenge?: string;
  horaris_festius?: string;
  // Explicació per a no-programadors: Afegim les adreces web i xarxes socials per poder mostrar enllaços directes a Instagram, Facebook, TikTok, Twitter o a la seva pròpia pàgina web des de la fitxa del centre
  rrss_instagram?: string;
  rrss_facebook?: string;
  rrss_twitter?: string;
  rrss_tiktok?: string;
  rrss_web?: string;
}

interface SelectorProps {
  label: string;
  options: string[];
  value: string;
  onSelect: (val: string) => void;
  disabled?: boolean;
}

/**
 * COMPONENT SELECTOR AMB BUSCADOR
 */
function SmartSelector({ label, options, value, onSelect, disabled }: SelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const handleSelect = (opt: string) => {
    onSelect(opt);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <label className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] ml-2">
        {label}
      </label>
      
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between text-left group transition-all hover:bg-white/10"
        >
          <span className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${value ? 'text-emerald-400' : 'text-white/30'}`}>
            {disabled && <Lock size={12} className="opacity-50" />}
            {value || (label === 'Província' ? 'Selecciona província' : label === 'Comarca' ? 'Ex: Vallès Occidental' : 'Ex: Sant Cugat del Vallès')}
          </span>
          <ChevronDown size={16} className={`text-white/20 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#001a33] border border-white/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              {/* Buscador */}
              <div className="p-3 border-b border-white/10 bg-white/5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input 
                    type="text"
                    readOnly
                    onFocus={(e) => e.target.readOnly = false}
                    onBlur={(e) => e.target.readOnly = true}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Buscar ${label.toLowerCase()}...`}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Llista d'opcions */}
              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      className="w-full p-4 text-left text-[11px] font-bold uppercase tracking-wider text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center justify-between transition-colors border-b border-white/5 last:border-0"
                    >
                      {opt}
                      {opt === value && <Check size={14} />}
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
                    No hi ha resultats
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * PANTALLA PRINCIPAL: OnEntrenarInici
 */
export default function OnEntrenarInici({ onTornar }: { onTornar: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [provincia, setProvincia] = useState("");
  const [comarca, setComarca] = useState("");
  const [municipi, setMunicipi] = useState("");
  const [showAfegirOptions, setShowAfegirOptions] = useState(false);
  // Explicació per a no-programadors: Guardem l'estat de quin formulari està obert i si s'ha mostrat el missatge d'èxit de l'enviament de la proposta
  const [activeForm, setActiveForm] = useState<'usuari' | 'propietari' | null>(null);
  const [mostraExits, setMostraExits] = useState(false);
  const [view, setView] = useState<'search' | 'list' | 'detail'>('search');
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  // Explicació per a no-programadors: Guardem la llista de gimnasos reals obtinguda de la base de dades
  const [allGyms, setAllGyms] = useState<Gym[]>([]);
  const [loadingGyms, setLoadingGyms] = useState(true);

  // Explicació per a no-programadors: Ens connectem a la col·lecció 'gimnasos' de Firestore en temps real
  useEffect(() => {
    const q = collection(db, "gimnasos");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Gym[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Si el gimnàs està suspès (en quarantena per part de l'administrador), no el mostrem
        if (!data.suspes) {
          // Determinem si té preu especial o descompte per a opositors de forma flexible
          const hasSpecialPrice = data.te_preu_especial_opositors === true || 
                                  data.te_preu_especial_opositors === 'true' || 
                                  data.te_tarifa_especial_opos === "si";

          // Determinem si disposa d'entrenador de forma flexible basat en descripció o dades explícites
          const hasCoaches = data.te_entrenador_opos === true || 
                             data.te_entrenador_opos === 'true' || 
                             (data.descripcio && /entrenador|preparador|coach/i.test(data.descripcio)) ||
                             (data.preus && /entrenador|preparador|coach/i.test(data.preus)) ||
                             (data.entrenament && data.entrenament.length > 0);

          list.push({
            id: doc.id,
            nom: data.nom,
            provincia: data.provincia,
            comarca: data.comarca,
            municipi: data.municipi,
            adreca: data.adreca || "",
            estrelles: data.estrelles || 4.5,
            preus: data.preus || "Contactar amb el centre",
            // Mapegem l'entrenament de la BBDD ("Circuit Agilitat", "Course Navette"...) a "proves"
            proves: data.entrenament || [],
            descripcio: data.descripcio || "Gimnàs col·laborador oficial per a preparar oposicions.",
            telefon: data.telefon || "",
            correu: data.correu || "",
            imatges: data.imatges || [],
            referencies: data.referencies || [
              { usuari: "Opositor/a", comentari: "Un centre fantàstic per a practicar les proves de circuit i potenciar la força.", nota: 5 }
            ],
            te_preu_especial_opositors: hasSpecialPrice,
            preu_especial_opositors: data.preu_especial_opositors || data.valor_tarifa_opos || "",
            horari_especial_opos: data.horari_especial_opos || "",
            tarifes_mensuals_raw: data.tarifes_mensuals_raw || [],
            tarifes_trimestrals_raw: data.tarifes_trimestrals_raw || [],
            tarifes_anuals_raw: data.tarifes_anuals_raw || [],
            te_entrenador_opos: hasCoaches,
            // Explicació per a no-programadors: Llegim directament els camps de la base de dades Firestore si existeixen
            horaris_setmana: data.horaris_setmana || "",
            horaris_dissabte: data.horaris_dissabte || "",
            horaris_diumenge: data.horaris_diumenge || "",
            horaris_festius: data.horaris_festius || "",
            rrss_instagram: data.rrss_instagram || "",
            rrss_facebook: data.rrss_facebook || "",
            rrss_twitter: data.rrss_twitter || "",
            rrss_tiktok: data.rrss_tiktok || "",
            rrss_web: data.rrss_web || "",
          });
        }
      });
      setAllGyms(list);
      setLoadingGyms(false);
    }, (error) => {
      console.error("Error obtenint els gimnasos reals: ", error);
      setLoadingGyms(false);
    });

    return () => unsubscribe();
  }, []);

  // Explicació per a no-programadors: Llista de fotos d'exemple amb fallbacks en cas que el centre no hagi pujat imatges pròpies
  const gymPhotos = useMemo(() => {
    const activeGym = allGyms.find(g => g.id === selectedGymId);
    if (activeGym && activeGym.imatges && activeGym.imatges.length > 0) {
      return activeGym.imatges;
    }
    return [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop", // Sala fitnes
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop", // Peses
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2070&auto=format&fit=crop", // Piscina/Spa
      "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=2070&auto=format&fit=crop"  // Cycling / Cintes
    ];
  }, [allGyms, selectedGymId]);

  // Aquest efecte s'encarrega de fer scroll automàtic cap a dalt quan l'usuari canvia de secció
  // (per exemple, de la cerca al llistat o del llistat al detall del centre).
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Si entrem al detall d'un gimnàs, reiniciem el carrusel a la primera foto
    if (view === 'detail') {
      setCurrentPhoto(0);
      setShowContactModal(false);
    }
  }, [view]);

  // Busquem el gimnàs seleccionat dins de la nostra llista de dades reals de Firestore
  const selectedGym = useMemo(() => 
    allGyms.find(g => g.id === selectedGymId),
  [allGyms, selectedGymId]);

  // Filtres i Ordenació
  // Explicació per a no-programadors: Definim els diferents filtres que l'usuari pot prémer, com l'ordenació per preu o valoració,
  // filtres per proves oficials, si disposa de descompte per a opositors o si té entrenadors dedicats.
  const [sortBy, setSortBy] = useState<'rating_desc' | 'price_asc' | 'price_desc' | null>(null);
  const [filterPreu, setFilterPreu] = useState<string | null>(null);
  const [filterProves, setFilterProves] = useState<string[]>([]);
  const [filterTop, setFilterTop] = useState(false);
  const [filterDescompte, setFilterDescompte] = useState(false);
  const [filterEntrenador, setFilterEntrenador] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  // Explicació per a no-programadors: Filtrem els gimnasos obtinguts de la BBDD pel municipi seleccionat i els filtres de l'usuari,
  // i posteriorment els ordenem segons la preferència d'ordre seleccionada (per preu o valoració).
  const gymsInMunicipi = useMemo(() => {
    const municipiNet = municipi.split(" (")[0];
    let list = allGyms.filter(g => g.municipi === municipiNet);
    
    // Aplicar filtres de preu baix (econòmic) estimant el text del preu
    if (filterPreu) {
      list = list.filter(g => {
        const textPreu = (g.preus || "").toLowerCase();
        return textPreu.includes("12€") || textPreu.includes("8€") || textPreu.includes("20€") || textPreu.includes("30€") || textPreu.includes("econòmic") || textPreu.includes("assequible");
      });
    }

    if (filterTop) {
      list = list.filter(g => g.estrelles >= 4.5);
    }

    // Filtre de Descomptes per a Opositors
    if (filterDescompte) {
      list = list.filter(g => g.te_preu_especial_opositors === true);
    }

    // Filtre de d'Entrenadors per a Opositors
    if (filterEntrenador) {
      list = list.filter(g => g.te_entrenador_opos === true);
    }
    
    // Filtre multiselecció de proves oficials: el centre ha de tenir TOTES les proves seleccionades
    // Explicació per a no-programadors: El programa és súper intel·ligent i comprova de manera flexible si el text s'assembla
    // a les proves oficials, evitant errors si a la base de dades s'ha escrit amb o sense accents, apòstrofs o abreviacions.
    if (filterProves.length > 0) {
      list = list.filter(g => 
        filterProves.every(p => {
          const normalizedGymProves = (g.proves || []).map(pr => pr.toLowerCase().trim());
          if (p === "Circuit d'Agilitat" || p === "Circuit Agilitat") {
            return normalizedGymProves.some(pr => 
              pr.includes("circuit") && (pr.includes("agilitat") || pr.includes("agilidad") || pr.includes("agili"))
            );
          }
          if (p === "Press de Banca" || p === "Press Banca") {
            return normalizedGymProves.some(pr => 
              pr.includes("press") && (pr.includes("banca") || pr.includes("bench") || pr.includes("bank"))
            );
          }
          if (p === "Course Navette" || p === "Cursa Navette") {
            return normalizedGymProves.some(pr => 
              pr.includes("navette") || pr.includes("course") || pr.includes("cursa")
            );
          }
          return normalizedGymProves.includes(p.toLowerCase().trim());
        })
      );
    }

    // Aplicar ordenació si hi ha un criteri seleccionat
    if (sortBy) {
      list = [...list].sort((a, b) => {
        if (sortBy === 'rating_desc') {
          return b.estrelles - a.estrelles;
        }

        // Helper per a extreure de manera robusta el preu base numèric
        const getBasePrice = (gym: Gym) => {
          if (gym.tarifes_mensuals_raw && gym.tarifes_mensuals_raw.length > 0) {
            return gym.tarifes_mensuals_raw[0];
          }
          if (gym.tarifes_trimestrals_raw && gym.tarifes_trimestrals_raw.length > 0) {
            return gym.tarifes_trimestrals_raw[0] / 3;
          }
          if (gym.tarifes_anuals_raw && gym.tarifes_anuals_raw.length > 0) {
            return gym.tarifes_anuals_raw[0] / 12;
          }
          // Si no té dades crues, busquem el primer nombre al text de preus
          const pricesInText = (gym.preus || "").match(/\d+/g);
          if (pricesInText && pricesInText.length > 0) {
            return Math.min(...pricesInText.map(Number));
          }
          return 0; // Si no té preu, el fiquem com a 0
        };

        const priceA = getBasePrice(a);
        const priceB = getBasePrice(b);

        if (sortBy === 'price_asc') {
          // Si algun no té preu, el fiquem al final del llistat d'econòmic
          if (priceA === 0) return 1;
          if (priceB === 0) return -1;
          return priceA - priceB;
        }
        if (sortBy === 'price_desc') {
          return priceB - priceA;
        }
        return 0;
      });
    }
    
    return list;
  }, [allGyms, municipi, filterPreu, filterProves, filterTop, filterDescompte, filterEntrenador, sortBy]);

  // Explicació per a no-programadors: Toguem les proves de la llista de filtres actius
  const toggleFilterProva = (prova: string) => {
    // Si premem "Circuit Agilitat" o semblant, normalitzem per fer el toggle correcte
    const standardName = 
      (prova === "Circuit Agilitat" || prova === "Circuit d'Agilitat") ? "Circuit d'Agilitat" :
      (prova === "Press Banca" || prova === "Press de Banca") ? "Press de Banca" :
      (prova === "Cursa Navette" || prova === "Course Navette") ? "Course Navette" : prova;

    setFilterProves(prev => 
      prev.includes(standardName) 
        ? prev.filter(p => p !== standardName) 
        : [...prev, standardName]
    );
  };

  const provincies = Object.keys(DATA_CATALUNYA);
  
  const comarques = useMemo(() => {
    return provincia ? Object.keys(DATA_CATALUNYA[provincia as keyof typeof DATA_CATALUNYA]) : [];
  }, [provincia]);

  // Explicació per a no-programadors: Comptem quants gimnasos reals tenim a la BBDD per a cada municipi de Catalunya
  const gimnasosPerMunicipi = useMemo(() => {
    const counts: Record<string, number> = {};
    allGyms.forEach(g => {
      const m = g.municipi;
      if (m) {
        counts[m] = (counts[m] || 0) + 1;
      }
    });
    return counts;
  }, [allGyms]);

  const municipis = useMemo(() => {
    if (!provincia || !comarca) return [];
    // @ts-ignore
    const baseMunicipis: string[] = DATA_CATALUNYA[provincia][comarca] || [];
    return baseMunicipis.map(m => {
      // Recomptem els gimnasos d'aquest municipi exactament de la base de dades
      const count = gimnasosPerMunicipi[m] || 0;
      return `${m} (${count})`;
    });
  }, [provincia, comarca, gimnasosPerMunicipi]);

  const handleSelectProvincia = (val: string) => {
    setProvincia(val);
    setComarca("");
    setMunicipi("");
    setView('search');
  };

  const handleSelectComarca = (val: string) => {
    setComarca(val);
    setMunicipi("");
    setView('search');
  };

  const handleTornarSearch = () => {
    if (view === 'detail') {
      setView('list');
    } else if (view === 'list') {
      setView('search');
    } else {
      onTornar();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full flex flex-col items-center bg-[#010915] overflow-y-auto text-white" 
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Explicació per a no-programadors: 
          Col·locquem la imatge "onentrenar.png" com a fons de pantalla amb una opacitat del 60% i un degradat a color fosc més suau.
          Això manté un estil corporatiu molt més clar i visible com el de la dieta, mantenint la lectura de la informació perfecta. */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-full">
        <img 
          src={fonsOnEntrenar} 
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-60 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#010915]/55 to-[#010915]/98" />
      </div>

      <div className="w-full flex flex-col items-center pb-40 px-6 relative z-10">
      
      {/* CAPÇALERA */}
      <header className="pt-10 w-full flex flex-col items-center gap-4 pb-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={handleTornarSearch}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-emerald-400 text-[8px] md:text-xs font-black uppercase tracking-[0.2em] opacity-70">
              {view === 'search' ? 'Gimnasos Col·laboradors' : view === 'list' ? 'Llistat de Centres' : 'Fitxa del Centre'}
            </span>
            <h1 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase text-white">
              {view === 'search' ? (
                <>On puc <span className="text-red-500">Entrenar?</span></>
              ) : view === 'list' ? (
                <>Centres a <span className="text-emerald-400">{municipi.split(" (")[0]}</span></>
              ) : (
                <span className="text-yellow-400">{selectedGym?.nom}</span>
              )}
            </h1>
          </div>
        </div>
      </header>

      {/* CONTINGUT DINÀMIC */}
      <main className="w-full max-w-md md:max-w-6xl px-6 flex flex-col gap-6 md:py-8">
        
        {view === 'search' && (
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 items-start">
            {/* Missatge introductori */}
            <div className="bg-[#0a1220]/95 border border-white/15 rounded-3xl p-6 md:p-10 text-center shadow-xl md:col-span-2">
              <p className="text-[11px] md:text-lg text-yellow-400 font-medium leading-relaxed italic px-2">
                "Des de OposiMossos sabem lo complicat que és trobar centres on entrenar, t'ajudem a crear un cercador on poder buscar, trobar i comunicar-nos a nosaltres nou centres i ajudar als altres companys."
              </p>
            </div>

            {/* SECCIÓ AFEGIR CENTRE */}
            <div className="flex flex-col gap-4 w-full h-full">
              <button 
                onClick={() => setShowAfegirOptions(!showAfegirOptions)}
                className="w-full bg-[#0e1d35]/95 hover:bg-[#152a4a]/95 border border-white/20 rounded-2xl p-4 md:py-8 flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-xl"
              >
                <Plus size={20} className={`text-emerald-400 md:size-8 transition-transform duration-500 ${showAfegirOptions ? 'rotate-45' : 'rotate-0'}`} />
                <span className="text-xs md:text-xl font-black italic uppercase tracking-wider">Afegir centre</span>
              </button>

              <AnimatePresence>
                {showAfegirOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-2"
                  >
                    <button 
                      onClick={() => {
                        setActiveForm('usuari');
                        setShowAfegirOptions(false);
                      }}
                      className="w-full bg-[#0a1220]/95 hover:bg-emerald-500/10 border border-white/15 hover:border-emerald-500/30 rounded-2xl p-5 md:p-8 flex items-center gap-4 transition-all group text-left"
                    >
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <User size={20} className="md:size-8" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[11px] md:text-base font-black italic uppercase tracking-wider text-white">Sóc usuari del centre</span>
                        <span className="text-[9px] md:text-xs font-medium text-white/30 uppercase tracking-widest mt-1">Vull donar-lo a conèixer</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => {
                        setActiveForm('propietari');
                        setShowAfegirOptions(false);
                      }}
                      className="w-full bg-[#0a1220]/95 hover:bg-blue-500/10 border border-white/15 hover:border-blue-500/30 rounded-2xl p-5 md:p-8 flex items-center gap-4 transition-all group text-left"
                    >
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Briefcase size={20} className="md:size-8" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[11px] md:text-base font-black italic uppercase tracking-wider text-white">Sóc proprietari del centre</span>
                        <span className="text-[9px] md:text-xs font-medium text-white/30 uppercase tracking-widest mt-1">Vull donar-lo a conèixer</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-[#0a1220]/95 border border-white/15 rounded-[2.5rem] p-6 md:p-10 flex flex-col gap-6 shadow-2xl w-full">
              
              <div className="flex items-center gap-3 mb-2">
                <MapPin size={20} className="text-emerald-400 md:size-8" />
                <span className="text-xs md:text-xl font-black italic uppercase tracking-wider">Cerca per ubicació</span>
              </div>

              <SmartSelector 
                label="Província"
                options={provincies}
                value={provincia}
                onSelect={handleSelectProvincia}
              />

              <SmartSelector 
                label="Comarca"
                options={comarques}
                value={comarca}
                onSelect={handleSelectComarca}
                disabled={!provincia}
              />

              <SmartSelector 
                label="Municipi"
                options={municipis}
                value={municipi}
                onSelect={setMunicipi}
                disabled={!comarca}
              />

            </div>

            {/* RESULTAT CERCADOR */}
            <AnimatePresence>
              {municipi && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-4 mt-4 w-full md:col-span-2"
                >
                  {/* 
                    Explicació per a no-programadors:
                    Hem canviat el fons verd brillant ("bg-emerald-500") que era gegant i massa llampant per un fons fosc
                    integrat ("bg-[#0a1220]/95") amb una vora elegant de color verd maragda ("border border-emerald-500/30").
                    Així l'element manté la coherència visual amb la resta de l'aplicació i es veu proporcionat en mides grans.
                  */}
                  <div className="bg-[#0a1220]/95 border border-emerald-500/30 rounded-[2.5rem] p-6 md:p-10 flex flex-col items-center gap-4 md:gap-6 shadow-2xl text-center">
                    {/* Explicació per a no-programadors: Reduïm la mida de la icona per mantenir la proporció perfecta */}
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
                        <Building2 size={24} className="md:size-10" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        {/* Explicació per a no-programadors: Textos més fins, estilitzats i de mides proporcionades */}
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-emerald-400/70">Has seleccionat</span>
                        <h2 className="text-lg md:text-3xl font-black italic uppercase tracking-tight text-white">{municipi}</h2>
                    </div>
                    
                    {/* 
                      Explicació per a no-programadors:
                      Si es troben centres col·laboradors (count > 0), es mostra una etiqueta de text descriptiva ("S'han trobat X resultats")
                      i un botó per veure aquests resultats ("Veure resultats").
                      Si no n'hi ha cap, s'amaga el botó i es mostra un text invitant a donar-los d'alta utilitzant l'eina "Afegir Centre".
                    */}
                    {parseInt(municipi.match(/\((\d+)\)/)?.[1] || "0") > 0 ? (
                      <div className="flex flex-col items-center gap-3 w-full">
                        <span className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-wider">
                          S'han trobat {parseInt(municipi.match(/\((\d+)\)/)?.[1] || "0")} resultats
                        </span>
                        <button 
                          onClick={() => setView('list')}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-black italic uppercase text-xs md:text-sm tracking-widest transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95"
                        >
                          Veure resultats
                        </button>
                      </div>
                    ) : (
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-xl w-full max-w-sm md:max-w-md">
                        <p className="text-xs md:text-sm font-semibold leading-relaxed text-emerald-300/80">
                          De moment no s'ha donat d'alta cap gimnàs en aquest municipi. Si en coneixes algun i ens vols ajudar, dona'ls d'alta amb l'eina de <span className="text-emerald-400 font-bold">Afegir Centre</span>.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {view === 'list' && (
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
            
            {/* BARRA DE FILTRES AMB BOTÓ GROC */}
            {/* Explicació per a no-programadors: Eliminem la posició sticky per evitar superposicions amb el fons */}
            <div className="flex flex-col gap-3 z-20 py-2 md:col-span-2">
               <button 
                 onClick={() => setShowFilters(!showFilters)}
                 className="w-full bg-yellow-400 hover:bg-yellow-300 text-[#00274d] font-black italic uppercase tracking-[0.1em] text-[10px] md:text-sm py-3 md:py-5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
               >
                 <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                 Filtrar i Ordenar Centres
               </button>

               <AnimatePresence>
                 {showFilters && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden bg-[#0a1220]/95 border border-white/15 rounded-2xl p-4 md:p-6 flex flex-col gap-5 text-left"
                   >
                     {/* SECCIÓ 1: ORDENACIÓ */}
                     <div className="flex flex-col gap-2">
                       <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-emerald-400">Ordenar per:</span>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                         <button 
                           onClick={() => setSortBy(sortBy === 'rating_desc' ? null : 'rating_desc')}
                           className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${sortBy === 'rating_desc' ? 'bg-yellow-400 border-yellow-400 text-[#00274d]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                         >
                           <Star size={12} className={sortBy === 'rating_desc' ? 'fill-current' : ''} />
                           De millor a pitjor valorat
                         </button>
                         <button 
                           onClick={() => setSortBy(sortBy === 'price_asc' ? null : 'price_asc')}
                           className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${sortBy === 'price_asc' ? 'bg-emerald-400 border-emerald-400 text-slate-950' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                         >
                           <span className="font-extrabold">€</span>
                           Preu més barat primer
                         </button>
                         <button 
                           onClick={() => setSortBy(sortBy === 'price_desc' ? null : 'price_desc')}
                           className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${sortBy === 'price_desc' ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                         >
                           <span className="font-extrabold">€€€</span>
                           Preu més car primer
                         </button>
                       </div>
                     </div>

                     {/* SECCIÓ 2: PROVES FÍSIQUES */}
                     <div className="flex flex-col gap-2">
                       <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-red-400">Proves que pots entrenar:</span>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                         <button 
                           onClick={() => toggleFilterProva("Circuit d'Agilitat")}
                           className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${filterProves.includes("Circuit d'Agilitat") ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                         >
                           <Check size={12} className={filterProves.includes("Circuit d'Agilitat") ? "opacity-100" : "opacity-30"} />
                           Circuit d'Agilitat
                         </button>
                         <button 
                           onClick={() => toggleFilterProva("Press de Banca")}
                           className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${filterProves.includes("Press de Banca") ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                         >
                           <Check size={12} className={filterProves.includes("Press de Banca") ? "opacity-100" : "opacity-30"} />
                           Press de Banca
                         </button>
                         <button 
                           onClick={() => toggleFilterProva("Course Navette")}
                           className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${filterProves.includes("Course Navette") ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                         >
                           <Check size={12} className={filterProves.includes("Course Navette") ? "opacity-100" : "opacity-30"} />
                           Course Navette
                         </button>
                       </div>
                     </div>

                     {/* SECCIÓ 3: CARACTERÍSTIQUES ADICIONALS */}
                     <div className="flex flex-col gap-2">
                       <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-blue-400">Característiques del centre:</span>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                         <button 
                           onClick={() => setFilterDescompte(!filterDescompte)}
                           className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${filterDescompte ? 'bg-emerald-400 border-emerald-400 text-slate-950 font-extrabold' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                         >
                           <Briefcase size={12} />
                           Descomptes Opositors
                         </button>
                         <button 
                           onClick={() => setFilterEntrenador(!filterEntrenador)}
                           className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${filterEntrenador ? 'bg-emerald-400 border-emerald-400 text-slate-950 font-extrabold' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                         >
                           <User size={12} />
                           Entrenadors Opositors
                         </button>
                         <button 
                           onClick={() => setFilterTop(!filterTop)}
                           className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${filterTop ? 'bg-yellow-400 border-yellow-400 text-slate-950 font-extrabold' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                         >
                           <Star size={12} />
                           Top Valorats (+4.5★)
                         </button>
                       </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
               
               <div className="px-4 text-white/20 text-[8px] md:text-xs font-black uppercase tracking-widest flex justify-between items-center mt-1">
                  <span>S'han trobat {gymsInMunicipi.length} centres</span>
                  {(filterTop || filterPreu || filterProves.length > 0 || filterDescompte || filterEntrenador || sortBy) && (
                    <button 
                      onClick={() => { 
                        setFilterTop(false); 
                        setFilterPreu(null); 
                        setFilterProves([]); 
                        setFilterDescompte(false); 
                        setFilterEntrenador(false); 
                        setSortBy(null); 
                      }} 
                      className="text-emerald-400 underline font-black uppercase tracking-wider cursor-pointer"
                    >
                      Netejar Filtres i Ordenació
                    </button>
                  )}
               </div>
            </div>

            {gymsInMunicipi.map(gym => {
              // Explicació per a no-programadors: Determinem amb un algorisme intel·ligent si el centre ofereix cadascuna
              // de les tres proves d'oposició oficials, sense importar petits detalls en el format de lletres.
              const normalizedGymProves = (gym.proves || []).map(pr => pr.toLowerCase().trim());
              const hasCircuit = normalizedGymProves.some(pr => pr.includes("circuit") && (pr.includes("agilitat") || pr.includes("agilidad") || pr.includes("agili")));
              const hasPress = normalizedGymProves.some(pr => pr.includes("press") && (pr.includes("banca") || pr.includes("bench") || pr.includes("bank")));
              const hasNavette = normalizedGymProves.some(pr => pr.includes("navette") || pr.includes("course") || pr.includes("cursa"));

              return (
                <button 
                  key={gym.id}
                  onClick={() => { setSelectedGymId(gym.id); setView('detail'); }}
                  className="w-full bg-[#0a1220]/95 border border-white/15 rounded-[2.5rem] p-6 md:p-8 flex flex-col gap-5 group hover:border-emerald-500/30 transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden"
                >
                  {/* 
                    Explicació per a no-programadors:
                    Calculem com es mostren les estrelles de valoració segons la nota del gimnàs:
                    1. Separem la nota en la part sencera (per exemple, si és un 4.5, la part sencera és 4) i la part decimal (el 0.5).
                    2. Arrodonim el decimal a una xifra per evitar errors matemàtics de precisió.
                    3. Apliquem la regla demanada:
                       - Si el decimal és entre 0.0 i 0.3, la següent estrella es queda buida.
                       - Si el decimal és entre 0.4 i 0.7, es dibuixa una estrella a la meitat (StarHalf).
                       - Si el decimal és igual o superior a 0.8, s'arrodoneix cap amunt i es pinta l'estrella sencera (Star).
                  */}
                  {(() => {
                    const val = parseFloat(String(gym.estrelles || "0"));
                    const sencer = Math.floor(val);
                    const decimal = Math.round((val - sencer) * 10) / 10;

                    {/*
                      Explicació per a no-programadors:
                      Dividim el text lliure de preus introduït pels administradors o usuaris en línies individuals.
                      Mapegem i classifiquem cadascuna d'aquestes tarifes:
                      Si conté paraules clau com 'opos' o 'paquet d'estudi' o 'oposició', la classifiquem com a Tarifa per a Opositor.
                      En cas contrari, la classifiquem com a Tarifa Normal d'Usuari General.
                    */}
                    const textPreus = gym.preus || "";
                    let normals: string[] = [];
                    let opositors: string[] = [];

                    if (!textPreus || textPreus === "Contactar amb el centre" || textPreus === "Contacta amb el centre per consultar les tarifes vigents per a opositors.") {
                      normals.push("Consultar amb el centre");
                    } else {
                      const linies = textPreus.split(/[\n;•]+/).map(l => l.trim()).filter(l => l.length > 0);
                      linies.forEach(l => {
                        const lower = l.toLowerCase();
                        if (lower.includes("opos") || lower.includes("estudi") || lower.includes("oposicio") || lower.includes("oposició")) {
                          opositors.push(l);
                        } else {
                          normals.push(l);
                        }
                      });
                      if (normals.length === 0 && opositors.length === 0) {
                        normals.push(textPreus);
                      }
                    }

                    return (
                      <>
                        {/* ZONA SUPERIOR (CAPÇALERA DE LA TARGETA) */}
                        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 text-left">
                          {/* Nom del centre en groc i estilitzat */}
                          <div className="flex-1">
                            <h3 className="text-yellow-400 font-black italic uppercase tracking-tighter text-lg md:text-2xl">
                              {gym.nom}
                            </h3>
                          </div>
                          
                          {/* Línia vertical separadora de la capçalera */}
                          <div className="hidden sm:block w-px h-8 bg-white/10 self-stretch" />

                          {/* Valoració numèrica i representació gràfica d'estrelles plenes/mitges/buides */}
                          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-white/50">
                              Valoració: {gym.estrelles}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((starIdx) => {
                                // Explicació per a no-programadors:
                                // Decidim quin dibuix d'estrella correspon a cada posició (de la 1 a la 5):
                                if (starIdx <= sencer) {
                                  // Estrella sencera i pintada de groc
                                  return (
                                    <Star 
                                      key={starIdx} 
                                      size={11} 
                                      className="text-yellow-400 fill-yellow-400" 
                                    />
                                  );
                                } else if (starIdx === sencer + 1) {
                                  // Estem a la posició decimal: decidim segons la regla de decimals
                                  if (decimal >= 0.8) {
                                    return (
                                      <Star 
                                        key={starIdx} 
                                        size={11} 
                                        className="text-yellow-400 fill-yellow-400" 
                                      />
                                    );
                                  } else if (decimal >= 0.4 && decimal <= 0.7) {
                                    return (
                                      <StarHalf 
                                        key={starIdx} 
                                        size={11} 
                                        className="text-yellow-400 fill-yellow-400" 
                                      />
                                    );
                                  } else {
                                    return (
                                      <Star 
                                        key={starIdx} 
                                        size={11} 
                                        className="text-white/20 fill-none" 
                                      />
                                    );
                                  }
                                } else {
                                  // Estrella buida i d'un color gris molt suau
                                  return (
                                    <Star 
                                      key={starIdx} 
                                      size={11} 
                                      className="text-white/20 fill-none" 
                                    />
                                  );
                                }
                              })}
                            </div>
                          </div>
                        </div>

                        {/* ZONA CENTRAL (GRAELLA DE CONTINGUTS AMB DUES COLUMNES) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-1 w-full text-left">
                          
                          {/* COLUMNA ESQUERRA: QUÈ S'OFEREIX */}
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/40">
                              Que ofereix:
                            </span>
                            <div className="flex flex-col gap-2">
                              {/* Prova 1: Press de Banca */}
                              <div className="flex items-center gap-2">
                                {hasPress ? <Check size={14} className="text-emerald-400 shrink-0" /> : <X size={14} className="text-red-500 shrink-0" />}
                                <span className={`text-[11px] md:text-sm font-bold uppercase tracking-wide ${hasPress ? 'text-white/90' : 'text-white/20 line-through'}`}>
                                  Press de Banca
                                </span>
                              </div>
                              
                              {/* Prova 2: Circuit d'Agilitat */}
                              <div className="flex items-center gap-2">
                                {hasCircuit ? <Check size={14} className="text-emerald-400 shrink-0" /> : <X size={14} className="text-red-500 shrink-0" />}
                                <span className={`text-[11px] md:text-sm font-bold uppercase tracking-wide ${hasCircuit ? 'text-white/90' : 'text-white/20 line-through'}`}>
                                  Circuit d'Agilitat
                                </span>
                              </div>

                              {/* Prova 3: Course Navette */}
                              <div className="flex items-center gap-2">
                                {hasNavette ? <Check size={14} className="text-emerald-400 shrink-0" /> : <X size={14} className="text-red-500 shrink-0" />}
                                <span className={`text-[11px] md:text-sm font-bold uppercase tracking-wide ${hasNavette ? 'text-white/90' : 'text-white/20 line-through'}`}>
                                  Course Navette
                                </span>
                              </div>

                              {/* Prova Extra: Disposa d'entrenadors d'oposicions */}
                              <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
                                {gym.proves && gym.proves.length > 0 ? <Check size={14} className="text-emerald-400 shrink-0" /> : <X size={14} className="text-red-500 shrink-0" />}
                                <span className="text-[11px] md:text-sm font-bold uppercase tracking-wide text-white/90">
                                  Disposa d'entrenadors d'oposicions: <span className={gym.proves && gym.proves.length > 0 ? "text-emerald-400 font-extrabold" : "text-red-500/50"}>{gym.proves && gym.proves.length > 0 ? "SÍ" : "NO"}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* COLUMNA DRETA: DETALL DE PREUS I TARIFES */}
                          <div className="flex flex-col gap-3 md:pl-6 md:border-l md:border-white/10">
                            
                            {/* Tarifa per a usuari normal */}
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/40">
                                Tarifa per a usuari normal:
                              </span>
                              <div className="flex flex-col gap-1">
                                {normals.map((t, idx) => (
                                  <span key={idx} className="text-[11px] md:text-sm font-black italic text-emerald-400 uppercase tracking-wide">
                                    • {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Tarifa especial per a opositors */}
                            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/40">
                                Tarifa per a opositors:
                              </span>
                              {opositors.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {opositors.map((t, idx) => (
                                    <span key={idx} className="text-[11px] md:text-sm font-black italic text-emerald-400 uppercase tracking-wide">
                                      • {t}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-red-500 font-black italic uppercase text-[11px] md:text-sm mt-0.5">
                                  <X size={12} className="text-red-500 shrink-0" />
                                  <span>No disponible</span>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* ZONA INFERIOR (CIUTAT - DIRECCIÓ) */}
                        <div className="w-full pt-3.5 border-t border-white/10 flex items-center gap-2 text-white/50 text-left">
                          <MapPin size={11} className="text-emerald-400 shrink-0" />
                          <span className="text-[9px] md:text-xs font-black uppercase tracking-wider truncate">
                            {gym.municipi} - {gym.adreca}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </button>
              );
            })}
            
            {gymsInMunicipi.length === 0 && (
              <div className="p-12 md:p-24 text-center text-white/20 uppercase font-black tracking-widest text-xs md:text-2xl italic md:col-span-2">
                No hi ha gimnasos amb aquests filtres
              </div>
            )}
          </div>
        )}

        {view === 'detail' && selectedGym && (
          <div className="flex flex-col gap-8 w-full max-w-4xl">
            
            {/* Explicació per a no-programadors: Targeta 1 - Identificació principal del centre (Nom, Ciutat, Direcció i Descripció)
                Aquest és el punt de partida on l'usuari veu directament les dades bàsiques de localització del gimnàs d'una manera clara i imponent. */}
            <div className="flex flex-col gap-6 bg-[#0a1220]/95 border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                    📍 {selectedGym.municipi}
                  </span>
                  {selectedGym.provincia && (
                    <span className="bg-white/5 border border-white/10 text-white/60 text-[10px] md:text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full">
                      {selectedGym.provincia}
                    </span>
                  )}
                </div>
                
                <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">
                  {selectedGym.nom}
                </h2>
                
                <div className="flex items-start gap-2.5 text-white/50 mt-1">
                  <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm font-semibold tracking-wide uppercase leading-normal">
                    {selectedGym.adreca}
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/10 w-full" />

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 italic">Descripció i presentació :</span>
                <p className="text-sm md:text-base text-white/70 leading-relaxed italic">
                  {selectedGym.descripcio || "Aquest centre no disposa de descripció detallada actualment. És un espai col·laborador ideal per dur a terme la teva preparació física oficial."}
                </p>
              </div>
            </div>

            {/* SECCIÓ DETALLS EN FORMAT BENTO (Disseny i estructura d'informació exclusiva de la BBDD) */}
            <div className="flex flex-col gap-8 px-2 md:px-4">
               
               {/* Explicació per a no-programadors: Targeta 2 - Preparació de l'Oposició d'OposiCAT i Entrenador Especialitzat (Punts 4 i 5)
                   Mostrem clarament quines activitats es poden entrenar per a Mossos i si disposen de la guia d'un preparador físic especialitzat per a les oposicions. */}
               <div className="flex flex-col gap-4">
                 <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Entrenament d'Oposicions al centre :</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                   
                   {/* BLOC ENTRENADOR D'OPOSITORS (Punt 5 de la petició) */}
                   <div className={`p-6 rounded-[2rem] flex flex-col justify-between gap-4 border transition-all md:col-span-1 ${
                     selectedGym.te_entrenador_opos 
                       ? 'bg-emerald-500/10 border-emerald-500/35 shadow-lg shadow-emerald-500/5' 
                       : 'bg-[#150a10]/50 border-red-500/15 opacity-80'
                   }`}>
                     <div className="flex items-center justify-between">
                       <span className={`text-[10px] font-black uppercase tracking-wider ${selectedGym.te_entrenador_opos ? 'text-emerald-400' : 'text-red-400'}`}>
                         {selectedGym.te_entrenador_opos ? '🏃‍♂️ Preparació Guiada' : '❌ Entrenament Lliure'}
                       </span>
                       <Award size={18} className={selectedGym.te_entrenador_opos ? 'text-emerald-400' : 'text-red-400/50'} />
                     </div>
                     <div>
                       {selectedGym.te_entrenador_opos ? (
                         <>
                           <h4 className="text-lg font-black text-white leading-tight uppercase italic">Entrenador Especialitzat</h4>
                           <p className="text-[11px] text-white/60 leading-normal mt-2">
                             El centre disposa de preparadors físics qualificats per guiar-te directament cap a l'èxit de les proves.
                           </p>
                         </>
                       ) : (
                         <>
                           <h4 className="text-sm font-black text-white/60 uppercase italic">Sense Guia Dedicada</h4>
                           <p className="text-[11px] text-white/40 leading-normal mt-2">
                             Actualment no s'ofereix entrenador per oposicions. Podràs practicar pel teu compte amb les instal·lacions.
                           </p>
                         </>
                       )}
                     </div>
                   </div>

                   {/* BLOC HORARI ESPECIAL OPOSITORS (Dins la informació d'entrenament) */}
                   <div className={`p-6 rounded-[2rem] flex flex-col justify-between gap-4 border transition-all md:col-span-2 ${
                     selectedGym.horari_especial_opos 
                       ? 'bg-blue-500/10 border-blue-500/35 shadow-lg shadow-blue-500/5' 
                       : 'bg-white/5 border-white/10 opacity-70'
                   }`}>
                     <div className="flex items-center justify-between">
                       <span className={`text-[10px] font-black uppercase tracking-wider ${selectedGym.horari_especial_opos ? 'text-blue-400' : 'text-white/40'}`}>
                         🕒 Franja per a Opositors
                       </span>
                       <Clock size={18} className={selectedGym.horari_especial_opos ? 'text-blue-400' : 'text-white/20'} />
                     </div>
                     <div>
                       {selectedGym.horari_especial_opos ? (
                         <>
                           <h4 className="text-lg font-black text-white leading-tight uppercase italic">Horari Especial Oposicions</h4>
                           <p className="text-xs text-white/60 leading-normal mt-2 italic">
                             "{selectedGym.horari_especial_opos}"
                           </p>
                         </>
                       ) : (
                         <>
                           <h4 className="text-sm font-black text-white/60 uppercase italic">Horari d'Accés General</h4>
                           <p className="text-[11px] text-white/40 leading-normal mt-2">
                             S'entrena lliurement durant totes les hores comercials d'obertura oficials d'aquest gimnàs.
                           </p>
                         </>
                       )}
                     </div>
                   </div>

                 </div>
               </div>

               {/* Explicació per a no-programadors: Targeta de les 3 Proves Físiques Oficials (Punt 4 de la petició)
                   Comparem el llistat de proves del gimnàs amb les 3 proves oficials de Mossos (Course Navette, Circuit d'Agilitat, Press de Banca) 
                   perquè l'alumne sàpiga exactament quin tipus d'entrenament real es pot realitzar al centre. */}
               <div className="flex flex-col gap-4">
                 <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Activitats físiques oficials disponibles :</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {[
                     {
                       nom: "Course Navette",
                       clau: "Course Navette",
                       icona: "🏃",
                       desc: "Mesura de la resistència aeròbica. Pistes d'anada i tornada amb línies d'assaig de 20 metres homologades."
                     },
                     {
                       nom: "Circuit d'Agilitat",
                       clau: "Circuit d'Agilitat",
                       icona: "🚧",
                       desc: "Coordinació i velocitat. Estructures homologades (plint, tanques i matalàs de caiguda de circuit oficial)."
                     },
                     {
                       nom: "Press de Banca",
                       clau: "Press de Banca",
                       icona: "🏋️",
                       desc: "Força de tren superior. Barra professional regulada, discos d'assaig homologats i banc pla de competició."
                     }
                   ].map(prova => {
                     const isIncluded = selectedGym.proves.includes(prova.clau) || selectedGym.proves.includes(prova.nom) || selectedGym.proves.some(p => p.toLowerCase().includes(prova.nom.toLowerCase().replace("'", "")));
                     return (
                       <div 
                         key={prova.nom} 
                         className={`p-6 rounded-3xl border flex flex-col gap-3.5 transition-all ${
                           isIncluded 
                             ? 'bg-[#0e1d35]/95 border-emerald-500/20 text-white shadow-xl' 
                             : 'bg-white/2 border-white/5 text-white/20'
                         }`}
                       >
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <span className="text-xl md:text-2xl">{prova.icona}</span>
                             <h4 className={`text-xs md:text-sm font-black uppercase tracking-tight ${isIncluded ? 'text-white' : 'text-white/20'}`}>
                               {prova.nom}
                             </h4>
                           </div>
                           <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isIncluded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/10'}`}>
                             {isIncluded ? <Check size={12} className="font-bold" /> : <X size={12} />}
                           </div>
                         </div>
                         <p className={`text-[11px] leading-relaxed ${isIncluded ? 'text-white/50' : 'text-white/10 line-through'}`}>
                           {prova.desc}
                         </p>
                       </div>
                     );
                   })}
                 </div>
               </div>

               <div className="h-px bg-white/10 w-full" />

               {/* Explicació per a no-programadors: Targeta 3 - Xarxes Socials (Punt 6 de la petició)
                   Permetem els alumnes comprovar l'estat i equipament de les instal·lacions visitant les xarxes socials i web oficials del centre d'entrenament. */}
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1">
                   <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Xarxes Socials i Instal·lacions :</h3>
                   <p className="text-[11px] text-white/40 italic">Informa't de l'equipament, materials i comunitat directament a través de les xarxes del centre:</p>
                 </div>
                 
                 {(selectedGym.rrss_instagram || selectedGym.rrss_facebook || selectedGym.rrss_twitter || selectedGym.rrss_tiktok || selectedGym.rrss_web) ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                     {selectedGym.rrss_web && (
                       <a 
                         href={selectedGym.rrss_web.startsWith('http') ? selectedGym.rrss_web : `https://${selectedGym.rrss_web}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-white text-xs font-black uppercase tracking-wide px-5 py-4 rounded-2xl transition-all active:scale-95"
                       >
                         <Globe size={16} className="text-emerald-400 shrink-0" />
                         <span className="truncate">Web Oficial</span>
                       </a>
                     )}

                     {selectedGym.rrss_instagram && (
                       <a 
                         href={selectedGym.rrss_instagram.startsWith('http') ? selectedGym.rrss_instagram : `https://instagram.com/${selectedGym.rrss_instagram.replace('@', '')}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-pink-500/40 hover:bg-pink-500/10 text-white text-xs font-black uppercase tracking-wide px-5 py-4 rounded-2xl transition-all active:scale-95"
                       >
                         <Instagram size={16} className="text-pink-400 shrink-0" />
                         <span className="truncate">Instagram</span>
                       </a>
                     )}

                     {selectedGym.rrss_facebook && (
                       <a 
                         href={selectedGym.rrss_facebook.startsWith('http') ? selectedGym.rrss_facebook : `https://facebook.com/${selectedGym.rrss_facebook}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 text-white text-xs font-black uppercase tracking-wide px-5 py-4 rounded-2xl transition-all active:scale-95"
                       >
                         <Facebook size={16} className="text-blue-400 shrink-0" />
                         <span className="truncate">Facebook</span>
                       </a>
                     )}

                     {selectedGym.rrss_tiktok && (
                       <a 
                         href={selectedGym.rrss_tiktok.startsWith('http') ? selectedGym.rrss_tiktok : `https://tiktok.com/@${selectedGym.rrss_tiktok.replace('@', '')}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 text-white text-xs font-black uppercase tracking-wide px-5 py-4 rounded-2xl transition-all active:scale-95"
                       >
                         <span className="text-sm shrink-0">🎵</span>
                         <span className="truncate">TikTok</span>
                       </a>
                     )}

                     {selectedGym.rrss_twitter && (
                       <a 
                         href={selectedGym.rrss_twitter.startsWith('http') ? selectedGym.rrss_twitter : `https://twitter.com/${selectedGym.rrss_twitter}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-slate-400/40 hover:bg-slate-400/10 text-white text-xs font-black uppercase tracking-wide px-5 py-4 rounded-2xl transition-all active:scale-95"
                       >
                         <span className="text-sm shrink-0 font-bold">𝕏</span>
                         <span className="truncate">Twitter</span>
                       </a>
                     )}
                   </div>
                 ) : (
                   <div className="bg-[#0a1220]/50 border border-white/5 p-4 rounded-2xl text-center">
                     <p className="text-xs text-white/40 italic">Aquest centre no té xarxes socials registrades. Recomanem contactar directament per a qualsevol consulta de material.</p>
                   </div>
                 )}
               </div>

               <div className="h-px bg-white/10 w-full" />

               {/* Explicació per a no-programadors: Targeta 4 - Horaris del Centre (Punt 7 de la petició)
                   Mostrem els horaris de setmana, dissabte, diumenge i festius de forma molt neta en un llistat organitzat com a fitxa d'agenda. */}
               <div className="flex flex-col gap-4">
                 <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Horaris d'obertura oficials :</h3>
                 
                 <div className="bg-[#0a1220]/95 border border-white/10 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex items-start gap-3.5">
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 mt-0.5 font-bold text-xs shrink-0">
                       DL-DV
                     </div>
                     <div className="flex flex-col gap-1 text-left">
                       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Dilluns a Divendres</span>
                       <span className="text-xs md:text-sm font-black text-white/80 uppercase">
                         {selectedGym.horaris_setmana || "No informat / Contactar"}
                       </span>
                     </div>
                   </div>

                   <div className="flex items-start gap-3.5">
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 mt-0.5 font-bold text-xs shrink-0">
                       DS
                     </div>
                     <div className="flex flex-col gap-1 text-left">
                       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Dissabtes</span>
                       <span className="text-xs md:text-sm font-black text-white/80 uppercase">
                         {selectedGym.horaris_dissabte || "Tancat / No disponible"}
                       </span>
                     </div>
                   </div>

                   <div className="flex items-start gap-3.5">
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 mt-0.5 font-bold text-xs shrink-0">
                       DG
                     </div>
                     <div className="flex flex-col gap-1 text-left">
                       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Diumenges</span>
                       <span className="text-xs md:text-sm font-black text-white/80 uppercase">
                         {selectedGym.horaris_diumenge || "Tancat / No disponible"}
                       </span>
                     </div>
                   </div>

                   <div className="flex items-start gap-3.5">
                     <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 mt-0.5 font-bold text-xs shrink-0">
                       FT
                     </div>
                     <div className="flex flex-col gap-1 text-left">
                       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Festius</span>
                       <span className="text-xs md:text-sm font-black text-white/80 uppercase">
                         {selectedGym.horaris_festius || "Tancat / No disponible"}
                       </span>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="h-px bg-white/10 w-full" />

               {/* Explicació per a no-programadors: Targeta 5 - Tarifes i Preus (Punt 8 de la petició)
                   Estructurem els preus d'una forma molt cridanera amb una targeta "premium" verda per si hi ha preu especial opositor
                   i el detall de les quotes lliures o de competició a sota. */}
               <div className="flex flex-col gap-4">
                 <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Preus i Tarifes detallades :</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   
                   {/* TARGETA DE TARIFA ESPECIAL OPOSICAT */}
                   <div className={`p-6 rounded-[2.5rem] border flex flex-col justify-between gap-6 transition-all ${
                     selectedGym.te_preu_especial_opositors 
                       ? 'bg-emerald-500/10 border-emerald-500/35 shadow-xl shadow-emerald-500/5' 
                       : 'bg-white/5 border-white/10 opacity-70'
                   }`}>
                     <div className="flex items-center gap-2 text-emerald-400">
                       <Sparkles size={18} className="shrink-0 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Descompte Alumne OposiCAT</span>
                     </div>
                     
                     <div className="flex flex-col gap-2">
                       {selectedGym.te_preu_especial_opositors ? (
                         <>
                           <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">Preu Especial</h4>
                           <p className="text-sm font-bold text-emerald-400 leading-normal italic mt-1">
                             "{selectedGym.preu_especial_opositors}"
                           </p>
                         </>
                       ) : (
                         <>
                           <h4 className="text-sm font-black text-white/60 uppercase italic">Quota Estàndard</h4>
                           <p className="text-xs text-white/40 leading-normal mt-1">
                             Aquest centre no disposa d'un preu exclusiu per opositors actualment.
                           </p>
                         </>
                       )}
                     </div>
                   </div>

                   {/* DETALL GENERAL DE TOTS ELS PREUS DEL CENTRE */}
                   <div className="bg-[#0e1d35]/90 border border-emerald-500/20 rounded-[2.5rem] p-6 flex flex-col justify-between gap-6 text-left shadow-xl">
                     <div className="flex items-center gap-2 text-emerald-400">
                       <DollarSign size={18} className="shrink-0" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Detall de quotes del centre</span>
                     </div>
                     <div className="flex flex-col gap-1.5">
                       <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Tarifes de referència:</h4>
                       <p className="text-sm md:text-base text-white/80 leading-relaxed font-bold italic">
                         {selectedGym.preus || "No informat. Us suggerim contactar directament amb les dades del centre per veure totes les opcions de soci."}
                       </p>
                     </div>
                   </div>

                 </div>
               </div>

               {/* Explicació per a no-programadors: Targeta 6 - Galeria Extra de fotos (Punt de fotos opcionals)
                   Tal com has demanat, eliminem el carrusel principal i només mostrem les fotos en aquesta secció
                   si realment la fitxa del gimnàs en conté alguna. Si no, no es renderitza res en aquest espai. */}
               {selectedGym.imatges && selectedGym.imatges.length > 0 ? (
                 <>
                   <div className="h-px bg-white/10 w-full" />
                   <div className="flex flex-col gap-4">
                     <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Galeria de fotografies del centre :</h3>
                     <div className="relative w-full aspect-square md:aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                       <AnimatePresence mode="wait">
                         <motion.img 
                           key={currentPhoto}
                           src={selectedGym.imatges[currentPhoto] || selectedGym.imatges[0]}
                           initial={{ opacity: 0, scale: 1.1 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 1.1 }}
                           transition={{ duration: 0.5 }}
                           className="w-full h-full object-cover"
                           referrerPolicy="no-referrer"
                         />
                       </AnimatePresence>
                       
                       <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                       {selectedGym.imatges.length > 1 && (
                         <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => setCurrentPhoto(prev => (prev > 0 ? prev - 1 : selectedGym.imatges.length - 1))}
                             className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 active:scale-90 transition-all text-white"
                           >
                             <ChevronLeft size={24} />
                           </button>
                           <button 
                             onClick={() => setCurrentPhoto(prev => (prev < selectedGym.imatges.length - 1 ? prev + 1 : 0))}
                             className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 active:scale-90 transition-all text-white"
                           >
                             <ArrowRight size={24} />
                           </button>
                         </div>
                       )}

                       {selectedGym.imatges.length > 1 && (
                         <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
                           {selectedGym.imatges.map((_, i) => (
                             <button 
                               key={i}
                               onClick={() => setCurrentPhoto(i)}
                               className={`h-2 rounded-full transition-all duration-300 ${i === currentPhoto ? 'w-8 bg-yellow-400' : 'w-2 bg-white/30'}`}
                             />
                           ))}
                         </div>
                       )}
                     </div>
                   </div>
                 </>
               ) : null}

             </div>

             {/* Explicació per a no-programadors: Targeta 7 - Botons de Contactar i Com arribar (Punt 9)
                 Dos botons molt cridaners integrats amb la base de dades. Com arribar utilitza l'adreça real del centre per buscar-lo a Google Maps en temps real. */}
             <div className="px-2 md:px-4 pb-10">
               <div className="grid grid-cols-2 gap-4">
                  <button 
                   onClick={() => setShowContactModal(true)}
                   className="bg-emerald-500 text-[#00274d] rounded-3xl py-4 md:py-6 font-black italic uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-sm md:text-xl"
                  >
                    Contactar
                  </button>
                  <button 
                   onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedGym.nom} ${selectedGym.adreca || ''} ${selectedGym.municipi || ''}`)}`, '_blank')}
                   className="bg-white/5 border border-white/10 text-white rounded-3xl py-4 md:py-6 font-black italic uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all text-sm md:text-xl"
                  >
                    Com arribar</button>
                </div>
              </div>
           </div>
        )}

        {/* POP-UP DE CONTACTE (MODAL INTEGRAT AMB EL DISSENY) */}
        <AnimatePresence>
          {showContactModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001529]/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#010915] border border-white/10 w-full max-w-sm rounded-[3rem] p-8 md:p-12 relative shadow-2xl"
              >
                {/* Botó de tancar */}
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col gap-10 mt-4">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 italic">Dades de contacte :</h4>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Hola! Com vols parlar amb nosaltres?</h2>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* TELÈFON */}
                    <a 
                      href={`tel:${(selectedGym.telefon || "931234567").replace(/\s+/g, '')}`} 
                      className="flex flex-col gap-1 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-black text-xl italic group-hover:text-emerald-400 transition-colors">{selectedGym.telefon || "93 123 45 67"}</span>
                        <Phone size={18} className="text-white/20 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">
                        Atenció: Lu-Vi (09:00 - 21:00)
                      </span>
                    </a>

                    {/* EMAIL */}
                    <a 
                      href={`mailto:${selectedGym.correu || "hola@centreentrenament.cat"}`} 
                      className="flex flex-col gap-1 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-black text-sm italic group-hover:text-emerald-400 transition-colors">{selectedGym.correu || "hola@centreentrenament.cat"}</span>
                        <Mail size={18} className="text-white/20 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">
                        Responem en menys de 24h
                      </span>
                    </a>
                  </div>

                  <p className="text-[10px] text-center text-white/20 font-medium uppercase tracking-tight">
                    T'esperem al centre, estem a punt per començar!
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* POP-UP DE FORMULARI PER AFEGIR CENTRE (MODAL INTEGRAT AMB EL DISSENY) */}
        <AnimatePresence>
          {activeForm && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001529]/80 backdrop-blur-md overflow-y-auto"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#010915] border border-white/10 w-full max-w-2xl rounded-[3rem] p-6 md:p-10 relative shadow-2xl my-8 overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-white/10"
              >
                {/* Botó de tancar */}
                <button 
                  onClick={() => setActiveForm(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>

                {activeForm === 'usuari' ? (
                  <FormulariUsuariGym 
                    onTancar={() => setActiveForm(null)}
                    onSuccess={() => {
                      setActiveForm(null);
                      setMostraExits(true);
                    }}
                  />
                ) : (
                  <FormulariPropietariGym 
                    onTancar={() => setActiveForm(null)}
                    onSuccess={() => {
                      setActiveForm(null);
                      setMostraExits(true);
                    }}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* POP-UP D'ÈXIT EN L'ENVIAMENT DE LA SOL·LICITUD */}
        <AnimatePresence>
          {mostraExits && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#001529]/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#010915] border border-white/10 w-full max-w-sm rounded-[3rem] p-8 md:p-12 relative shadow-2xl text-center flex flex-col items-center gap-6"
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                  <Check size={32} />
                </div>
                
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 italic">Enviat correctament</h4>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Proposta Rebuda!</h2>
                  <p className="text-xs text-white/50 leading-relaxed mt-2">
                    Moltes gràcies per la teva aportació. L'equip d'administració d'OposiCAT revisarà la informació d'aquest centre i el donarà d'alta al cercador al més aviat possible.
                  </p>
                </div>

                <button 
                  onClick={() => setMostraExits(false)}
                  className="w-full bg-emerald-500 text-[#00274d] rounded-2xl py-4 font-black italic uppercase tracking-widest text-[11px] hover:bg-emerald-400 active:scale-95 transition-all"
                >
                  D'acord
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      </div>
    </div>
  );
}
