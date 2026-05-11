import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, Search, MapPin, Building2, ChevronDown, Check, Plus, User, Briefcase, ArrowRight, X, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DATA_CATALUNYA } from "../../../data/municipis";

/**
 * MOCK DE GIMNASOS PER MUNICIPI
 * Per a la prova, tots els municipis tindran 10 gimnasos.
 */
const GIMNASOS_COUNT: Record<string, number> = {};

interface Gym {
  id: string;
  nom: string;
  municipi: string;
  adreca: string;
  estrelles: number;
  preu: '€' | '€€' | '€€€';
  descripcio: string;
  proves: string[]; // Proves que es poden preparar
  referencies: { usuari: string; comentari: string; nota: number }[];
}

const MOCK_GYMS: Gym[] = [
  {
    id: "g1",
    nom: "Sparring Opos",
    municipi: "Tot",
    adreca: "Carrer de l'Esforç, 12",
    estrelles: 4.9,
    preu: '€€',
    descripcio: "Màxima especialització en el circuit d'agilitat. Tenim els tancaments oficials.",
    proves: ["Circuit d'Agilitat", "Course Navette"],
    referencies: [{ usuari: "Joan B.", comentari: "El millor circuit que he provat.", nota: 5 }]
  },
  {
    id: "g2",
    nom: "Iron Mossos",
    municipi: "Tot",
    adreca: "Av. de la Força, 4",
    estrelles: 4.7,
    preu: '€',
    descripcio: "Econòmic i amb tot el necessari per al press de banca.",
    proves: ["Press de Banca"],
    referencies: [{ usuari: "Carla S.", comentari: "Molt barat i funcional.", nota: 4 }]
  },
  {
    id: "g3",
    nom: "Elite Police Prep",
    municipi: "Tot",
    adreca: "Rambla de la Victòria, 88",
    estrelles: 5.0,
    preu: '€€€',
    descripcio: "Centre Premium. Entrenador personal inclòs i simulacres setmanals.",
    proves: ["Circuit d'Agilitat", "Press de Banca", "Course Navette"],
    referencies: [{ usuari: "Pere M.", comentari: "Servei excel·lent, val el que costa.", nota: 5 }]
  },
  {
    id: "g4",
    nom: "Navette Master Club",
    municipi: "Tot",
    adreca: "Passatge del Vent, 3",
    estrelles: 4.2,
    preu: '€',
    descripcio: "Especialistes en resistència aeròbica i navette.",
    proves: ["Course Navette"],
    referencies: [{ usuari: "Marta V.", comentari: "Pista de 20m perfecta.", nota: 4 }]
  },
  {
    id: "g5",
    nom: "Strong Body Opos",
    municipi: "Tot",
    adreca: "Carrer del Plom, 50",
    estrelles: 4.5,
    preu: '€€',
    descripcio: "Enfocat a la força bruta per al press de banca.",
    proves: ["Press de Banca"],
    referencies: [{ usuari: "Lluís F.", comentari: "Bones barres i discos.", nota: 5 }]
  },
  {
    id: "g6",
    nom: "Agility Pro",
    municipi: "Tot",
    adreca: "Carrer del Gir, 1",
    estrelles: 3.8,
    preu: '€',
    descripcio: "Petit però amb circuit permanentment muntat.",
    proves: ["Circuit Agilitat"],
    referencies: [{ usuari: "Sònia K.", comentari: "Una mica estret però útil.", nota: 3 }]
  },
  {
    id: "g7",
    nom: "CEMS Policia",
    municipi: "Tot",
    adreca: "Platja de la Calma, 20",
    estrelles: 4.6,
    preu: '€€€',
    descripcio: "Centre multiesportiu amb monitors ex-agents.",
    proves: ["Circuit Agilitat", "Press de Banca", "Course Navette"],
    referencies: [{ usuari: "Albert D.", comentari: "Saben exactament què demanen.", nota: 5 }]
  },
  {
    id: "g8",
    nom: "Gimnàs del Barri",
    municipi: "Tot",
    adreca: "Carrer Major, 45",
    estrelles: 3.5,
    preu: '€',
    descripcio: "Gimnàs convencional que permet portar el teu material d'opos.",
    proves: ["Press de Banca"],
    referencies: [{ usuari: "Dani P.", comentari: "Maquinària antiga.", nota: 3 }]
  },
  {
    id: "g9",
    nom: "Total Training Opos",
    municipi: "Tot",
    adreca: "Avinguda del Coratge, 11",
    estrelles: 4.4,
    preu: '€€',
    descripcio: "Bon balanç entre preu i instal·lacions per a Navette.",
    proves: ["Course Navette", "Press de Banca"],
    referencies: [{ usuari: "Enric H.", comentari: "Bona relació qualitat-preu.", nota: 4 }]
  },
  {
    id: "g10",
    nom: "Olympic Dream",
    municipi: "Tot",
    adreca: "Vila Olímpica, local 4",
    estrelles: 4.1,
    preu: '€€€',
    descripcio: "Instal·lacions d'alt nivell.",
    proves: ["Circuit d'Agilitat", "Press de Banca"],
    referencies: [{ usuari: "Rosa L.", comentari: "Instal·lacions top.", nota: 4 }]
  }
];

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
          <span className={`text-xs font-bold uppercase tracking-wide ${value ? 'text-emerald-400' : 'text-white/30 italic'}`}>
            {value || `Selecciona ${label.toLowerCase()}...`}
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
  const [view, setView] = useState<'search' | 'list' | 'detail'>('search');
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  // Llista de fotos d'exemple. 
  // Intentem carregar les de l'usuari primer, però tenim fallbacks reals de Unsplash 
  // que coincideixen amb el que l'usuari ha demanat (cycling, fitnes, piscina, boxa).
  const gymPhotos = [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop", // Sala fitnes
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop", // Peses
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2070&auto=format&fit=crop", // Piscina/Spa
    "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=2070&auto=format&fit=crop"  // Cycling / Cintes
  ];

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

  // Busquem el gimnàs seleccionat dins de la nostra llista de dades
  const selectedGym = useMemo(() => 
    MOCK_GYMS.find(g => g.id === selectedGymId),
  [selectedGymId]);

  // Filtres
  const [filterPreu, setFilterPreu] = useState<string | null>(null);
  const [filterProves, setFilterProves] = useState<string[]>([]);
  const [filterTop, setFilterTop] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const gymsInMunicipi = useMemo(() => {
    let list = [...MOCK_GYMS];
    
    // Aplicar filtres
    if (filterPreu) list = list.filter(g => g.preu === filterPreu);
    if (filterTop) list = list.filter(g => g.estrelles >= 4.5);
    
    // Filtre multiselecció: el centre ha de tenir TOTES les proves seleccionades
    if (filterProves.length > 0) {
      list = list.filter(g => 
        filterProves.every(p => g.proves.includes(p))
      );
    }
    
    return list;
  }, [municipi, filterPreu, filterProves, filterTop]);

  const toggleFilterProva = (prova: string) => {
    setFilterProves(prev => 
      prev.includes(prova) 
        ? prev.filter(p => p !== prova) 
        : [...prev, prova]
    );
  };

  const provincies = Object.keys(DATA_CATALUNYA);
  
  const comarques = useMemo(() => {
    return provincia ? Object.keys(DATA_CATALUNYA[provincia as keyof typeof DATA_CATALUNYA]) : [];
  }, [provincia]);

  const municipis = useMemo(() => {
    if (!provincia || !comarca) return [];
    // @ts-ignore
    const baseMunicipis: string[] = DATA_CATALUNYA[provincia][comarca] || [];
    return baseMunicipis.map(m => {
      // Simulem 10 gimnasos a cada municipi per al test
      return `${m} (10)`;
    });
  }, [provincia, comarca]);

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
      className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto text-white" 
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="w-full flex flex-col items-center pb-40 px-6">
      
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
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 text-center shadow-xl md:col-span-2">
              <p className="text-[11px] md:text-lg text-yellow-400 font-medium leading-relaxed italic px-2">
                "Des de OposiMossos sabem lo complicat que és trobar centres on entrenar, t'ajudem a crear un cercador on poder buscar, trobar i comunicar-nos a nosaltres nou centres i ajudar als altres companys."
              </p>
            </div>

            {/* SECCIÓ AFEGIR CENTRE */}
            <div className="flex flex-col gap-4 w-full h-full">
              <button 
                onClick={() => setShowAfegirOptions(!showAfegirOptions)}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 md:py-8 flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-xl"
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
                    <button className="w-full bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 md:p-8 flex items-center gap-4 transition-all group">
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <User size={20} className="md:size-8" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[11px] md:text-base font-black italic uppercase tracking-wider text-white">Sóc usuari del centre</span>
                        <span className="text-[9px] md:text-xs font-medium text-white/30 uppercase tracking-widest mt-1">Vull donar-lo a conèixer</span>
                      </div>
                    </button>

                    <button className="w-full bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 rounded-2xl p-5 md:p-8 flex items-center gap-4 transition-all group">
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Briefcase size={20} className="md:size-8" />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[11px] md:text-base font-black italic uppercase tracking-wider text-white">Sóc propietari del centre</span>
                        <span className="text-[9px] md:text-xs font-medium text-white/30 uppercase tracking-widest mt-1">Vull donar-lo a conèixer</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-10 flex flex-col gap-6 shadow-2xl w-full">
              
              <div className="flex items-center gap-3 mb-2">
                <MapPin size={20} className="text-emerald-400 md:size-8" />
                <span className="text-xs md:text-xl font-black italic uppercase tracking-wider">Cerca per ubicació</span>
              </div>

              <SmartSelector 
                label="La teva província"
                options={provincies}
                value={provincia}
                onSelect={handleSelectProvincia}
              />

              <SmartSelector 
                label="La teva comarca"
                options={comarques}
                value={comarca}
                onSelect={handleSelectComarca}
                disabled={!provincia}
              />

              <SmartSelector 
                label="El teu municipi"
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
                  <div className="bg-emerald-500 text-[#00274d] rounded-3xl p-8 md:p-14 flex flex-col items-center gap-4 md:gap-8 shadow-xl shadow-emerald-500/20 text-center">
                    <div className="w-16 h-16 md:w-32 md:h-32 bg-[#00274d]/10 rounded-full flex items-center justify-center">
                        <Building2 size={32} className="md:size-16" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] opacity-50">Has seleccionat</span>
                        <h2 className="text-xl md:text-5xl font-black italic uppercase tracking-tight">{municipi}</h2>
                    </div>
                    
                    {parseInt(municipi.match(/\((\d+)\)/)?.[1] || "0") > 0 ? (
                        <button 
                          onClick={() => setView('list')}
                          className="bg-[#00274d] text-white px-8 py-4 md:px-14 md:py-6 rounded-xl font-black italic uppercase text-[12px] md:text-xl tracking-widest mt-2 hover:bg-[#00274d]/80 transition-all shadow-lg active:scale-95"
                        >
                          Veure Llista de Centres
                        </button>
                    ) : (
                        <div className="bg-[#00274d]/10 border border-[#00274d]/20 p-4 rounded-2xl w-full max-w-sm md:max-w-xl">
                          <p className="text-[9px] md:text-sm font-bold uppercase tracking-widest leading-relaxed">
                            Actualment no disposem de centres col·laboradors en aquest municipi. Estem treballant per ampliar la base de dades.
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
            <div className="flex flex-col gap-3 sticky top-0 bg-[#00274d] z-20 py-2 md:col-span-2">
               <button 
                 onClick={() => setShowFilters(!showFilters)}
                 className="w-full bg-yellow-400 hover:bg-yellow-300 text-[#00274d] font-black italic uppercase tracking-[0.1em] text-[10px] md:text-sm py-3 md:py-5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
               >
                 <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                 Filtrar per
               </button>

               <AnimatePresence>
                 {showFilters && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-3 md:p-6 flex flex-col gap-3"
                   >
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
                        <button 
                          onClick={() => setFilterTop(!filterTop)}
                          className={`px-3 py-2 md:py-4 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border text-center ${filterTop ? 'bg-yellow-400 border-yellow-400 text-[#00274d]' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Top Valorats (+4.5)
                        </button>
                        <button 
                          onClick={() => setFilterPreu(filterPreu === '€' ? null : '€')}
                          className={`px-3 py-2 md:py-4 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border text-center ${filterPreu === '€' ? 'bg-emerald-400 border-emerald-500 text-[#00274d]' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Econòmic (€)
                        </button>
                        <button 
                          onClick={() => toggleFilterProva('Circuit Agilitat')}
                          className={`px-3 py-2 md:py-4 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border text-center ${filterProves.includes('Circuit Agilitat') ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Amb Circuit
                        </button>
                        <button 
                          onClick={() => toggleFilterProva('Press de Banca')}
                          className={`px-3 py-2 md:py-4 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border text-center ${filterProves.includes('Press de Banca') ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Amb Press
                        </button>
                        <button 
                          onClick={() => toggleFilterProva('Course Navette')}
                          className={`px-3 py-2 md:py-4 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border text-center ${filterProves.includes('Course Navette') ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Entrenament de Navette
                        </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
               
               <div className="px-4 text-white/20 text-[8px] md:text-xs font-black uppercase tracking-widest flex justify-between items-center mt-1">
                  <span>S'han trobat {gymsInMunicipi.length} centres</span>
                  {(filterTop || filterPreu || filterProves.length > 0) && (
                    <button onClick={() => { setFilterTop(false); setFilterPreu(null); setFilterProves([]); }} className="text-emerald-400 underline">Netejar filtres</button>
                  )}
               </div>
            </div>

            {gymsInMunicipi.map(gym => {
              const hasCircuit = gym.proves.includes('Circuit Agilitat');
              const hasPress = gym.proves.includes('Press de Banca');
              const hasNavette = gym.proves.includes('Course Navette');
              const preuSimulat = gym.preu === '€' ? '30€' : gym.preu === '€€' ? '45€' : '60€';

              return (
                <button 
                  key={gym.id}
                  onClick={() => { setSelectedGymId(gym.id); setView('detail'); }}
                  className="w-full bg-[#001a33] border border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden"
                >
                  {/* NOM DEL CENTRE (GROC) */}
                  <div className="w-full flex items-center justify-between">
                    <h3 className="text-yellow-400 font-black italic uppercase tracking-tighter text-lg md:text-2xl text-left">
                      {gym.nom}
                    </h3>
                    <div className="p-2 rounded-full bg-white/5 border border-white/5 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all">
                      <ArrowRight size={20} className="text-white/40 group-hover:text-emerald-400 transition-all" />
                    </div>
                  </div>

                  {/* RATLLA GRIS + VALORACIÓ */}
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/40 font-black text-xs md:text-sm">({gym.estrelles})</span>
                  </div>

                  {/* CONTINGUT DIVIDIT (OFEREIX vs PREU) */}
                  <div className="flex items-start gap-6 w-full">
                    
                    {/* ESQUERRA: PROVES */}
                    <div className="flex-1 flex flex-col gap-2">
                       <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">Ofereix:</span>
                       
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             {hasPress ? <Check size={14} className="text-emerald-400" /> : <X size={14} className="text-red-500/50" />}
                             <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wide ${hasPress ? 'text-white/80' : 'text-white/20 line-through'}`}>Press de Banca</span>
                          </div>
                          <div className="flex items-center gap-2">
                             {hasCircuit ? <Check size={14} className="text-emerald-400" /> : <X size={14} className="text-red-500/50" />}
                             <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wide ${hasCircuit ? 'text-white/80' : 'text-white/20 line-through'}`}>Circuit d'Agilitat</span>
                          </div>
                          <div className="flex items-center gap-2">
                             {hasNavette ? <Check size={14} className="text-emerald-400" /> : <X size={14} className="text-red-500/50" />}
                             <span className={`text-[10px] md:text-sm font-bold uppercase tracking-wide ${hasNavette ? 'text-white/80' : 'text-white/20 line-through'}`}>Course Navette</span>
                          </div>
                       </div>
                    </div>

                    {/* DRETRA: PREU (AMB RALLA VERTICAL) */}
                    <div className="flex items-stretch gap-6">
                       <div className="w-px bg-white/10 self-stretch" />
                       <div className="flex flex-col justify-center gap-1">
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/40">Preu:</span>
                          <span className="text-xl md:text-3xl font-black italic text-emerald-400 tracking-tighter">{preuSimulat}</span>
                       </div>
                    </div>

                  </div>

                  {/* ADREÇA SUBTIL A BAIX */}
                  <div className="mt-2 pt-3 border-t border-white/5 flex items-center gap-2 text-white/20">
                    <MapPin size={10} />
                    <span className="text-[8px] md:text-xs font-medium uppercase tracking-widest truncate">{gym.adreca}</span>
                  </div>
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
            
            {/* CARRUSEL DE FOTOS (Simulant les fotos enviades) */}
            <div className="relative w-full aspect-square md:aspect-video rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentPhoto}
                  src={gymPhotos[currentPhoto]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              {/* Overlay Gradient per a que els botons es vegin millor */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

              {/* Navigació carrusel */}
              <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setCurrentPhoto(prev => (prev > 0 ? prev - 1 : gymPhotos.length - 1))}
                  className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 active:scale-90 transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentPhoto(prev => (prev < gymPhotos.length - 1 ? prev + 1 : 0))}
                  className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 active:scale-90 transition-all"
                >
                  <ArrowRight size={24} />
                </button>
              </div>

              {/* Punts indicadors (Pagination dots) - COM AL DIBUIX */}
              <div className="absolute bottom-10 inset-x-0 flex justify-center gap-2">
                {gymPhotos.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentPhoto ? 'w-8 bg-yellow-400' : 'w-2 bg-white/30'}`}
                  />
                ))}
              </div>
            </div>

            {/* SECCIÓ DETALLS SENSE LABELS (Disseny segons esquetx) */}
            <div className="flex flex-col gap-10 px-2 md:px-4">
               
               {/* DESCRIPCIÓ DEL CENTRE */}
               <div className="flex flex-col gap-3">
                 <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Descripció del centre :</h3>
                 <p className="text-sm md:text-lg text-white/70 leading-relaxed italic">
                   {selectedGym.descripcio} Actualment comptem amb un espai totalment renovat per a que puguis assolir la teva plaça amb les millors garanties.
                 </p>
               </div>

               <div className="h-px bg-white/10 w-full" />

               {/* QUÈ POTS ENTRENAR */}
               <div className="flex flex-col gap-4">
                 <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Què pots entrenar :</h3>
                 <div className="flex flex-col gap-2">
                   {/* Llista de les 3 proves principals amb text normal i mida més petita */}
                   {['Course Navette', 'Circuit d\'Agilitat', 'Press de Banca'].map(prova => {
                      const isIncluded = selectedGym.proves.includes(prova);
                      return (
                        <div key={prova} className="flex items-center gap-3">
                           <span className={`text-sm md:text-xl font-bold uppercase tracking-tight ${isIncluded ? 'text-white' : 'text-white/10 line-through'}`}>
                             {isIncluded ? '•' : '×'} {prova}
                           </span>
                        </div>
                      );
                   })}
                 </div>
               </div>

               <div className="h-px bg-white/10 w-full" />

               {/* OPINIONS DEL CENTRE */}
               <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between border-b border-white/5 pb-2">
                   <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Opinions del centre :</h3>
                   <div className="flex items-center gap-2 text-yellow-400/50 text-xs">
                     {[...Array(5)].map((_, i) => (
                       <span key={i} className={i < Math.floor(selectedGym.estrelles) ? 'opacity-100' : 'opacity-20'}>★</span>
                     ))}
                     <span className="ml-1 font-black italic">({selectedGym.estrelles})</span>
                   </div>
                 </div>
                 
                 <div className="flex flex-col gap-6">
                   {selectedGym.referencies.map((ref, i) => (
                     <div key={i} className="flex flex-col gap-1 border-l border-white/10 pl-5">
                       <div className="flex items-center gap-3">
                          <span className="text-yellow-400/80 font-black uppercase text-[10px] tracking-widest">{ref.usuari}</span>
                          <span className="text-white/10 text-[9px] font-bold italic">{ref.nota}/5 ★</span>
                       </div>
                       <p className="text-white/50 italic text-xs md:text-base leading-relaxed">"{ref.comentari}"</p>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="h-px bg-white/10 w-full" />

               {/* PREUS I TARIFES */}
               <div className="flex flex-col gap-4">
                 <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">Preus i tarifes :</h3>
                 <div className="flex flex-col gap-3">
                   <p className="text-sm md:text-lg text-white/70 leading-relaxed font-bold italic">
                     • Horari de 9 a 14 de dill a diss - <span className="text-emerald-400">40€</span>
                   </p>
                   <p className="text-sm md:text-lg text-white/70 leading-relaxed font-bold italic">
                     • Nomes entrenar per les oposicions de dill a div de 17h a 20h - <span className="text-emerald-400">20€</span>
                   </p>
                 </div>
               </div>

            </div>

            {/* BOTONS D'ACCESO RAPID */}
            <div className="px-2 md:px-4 pb-10">
              <div className="grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setShowContactModal(true)}
                  className="bg-emerald-500 text-[#00274d] rounded-3xl py-4 md:py-6 font-black italic uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-sm md:text-xl"
                 >
                   Contactar
                 </button>
                 <button 
                  onClick={() => window.open('https://www.google.com/maps/search/gym+Gran+Via+Barcelona', '_blank')}
                  className="bg-white/5 border border-white/10 text-white rounded-3xl py-4 md:py-6 font-black italic uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all text-sm md:text-xl"
                 >
                   Com arribar
                 </button>
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
                className="bg-[#00274d] border border-white/10 w-full max-w-sm rounded-[3rem] p-8 md:p-12 relative shadow-2xl"
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
                      href="tel:931234567" 
                      className="flex flex-col gap-1 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-black text-xl italic group-hover:text-emerald-400 transition-colors">93 123 45 67</span>
                        <Phone size={18} className="text-white/20 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">
                        Atenció: Lu-Vi (09:00 - 21:00)
                      </span>
                    </a>

                    {/* EMAIL */}
                    <a 
                      href="mailto:hola@centreentrenament.cat" 
                      className="flex flex-col gap-1 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-black text-sm italic group-hover:text-emerald-400 transition-colors">hola@centreentrenament.cat</span>
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

      </main>
      </div>
    </div>
  );
}
