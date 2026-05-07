import { useState, useMemo } from "react";
import { ChevronLeft, Search, MapPin, Building2, ChevronDown, Check, Plus, User, Briefcase, ArrowRight } from "lucide-react";
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
    proves: ["Circuit Agilitat", "Course Navette"],
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
    proves: ["Circuit Agilitat", "Press de Banca", "Course Navette"],
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
    proves: ["Circuit Agilitat", "Press de Banca"],
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
                    autoFocus
                    type="text"
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
  const [provincia, setProvincia] = useState("");
  const [comarca, setComarca] = useState("");
  const [municipi, setMunicipi] = useState("");
  const [showAfegirOptions, setShowAfegirOptions] = useState(false);
  const [view, setView] = useState<'search' | 'list' | 'detail'>('search');
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);

  // Filtres
  const [filterPreu, setFilterPreu] = useState<string | null>(null);
  const [filterProves, setFilterProves] = useState<string[]>([]);
  const [filterTop, setFilterTop] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const selectedGym = useMemo(() => {
    return MOCK_GYMS.find(g => g.id === selectedGymId);
  }, [selectedGymId]);

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
    <div className="flex min-h-screen w-full flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white">
      
      {/* CAPÇALERA */}
      <header className="pt-10 w-full flex flex-col items-center gap-4 pb-6 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={handleTornarSearch}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <span className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70">
              {view === 'search' ? 'Gimnasos Col·laboradors' : view === 'list' ? 'Llistat de Centres' : 'Fitxa del Centre'}
            </span>
            <h1 className="text-xl font-black italic tracking-tighter uppercase text-white">
              {view === 'search' ? (
                <>On puc <span className="text-red-500">Entrenar?</span></>
              ) : view === 'list' ? (
                <>Centres a <span className="text-emerald-400">{municipi.split(" (")[0]}</span></>
              ) : (
                <span className="text-emerald-400">{selectedGym?.nom}</span>
              )}
            </h1>
          </div>
        </div>
      </header>

      {/* CONTINGUT DINÀMIC */}
      <main className="w-full max-w-md px-6 flex flex-col gap-6">
        
        {view === 'search' && (
          <>
            {/* Missatge introductori */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center shadow-xl">
              <p className="text-[11px] text-yellow-400 font-medium leading-relaxed italic px-2">
                "Des de OposiMossos sabem lo complicat que és trobar centres on entrenar, t'ajudem a crear un cercador on poder buscar, trobar i comunicar-nos a nosaltres nou centres i ajudar als altres companys."
              </p>
            </div>

            {/* SECCIÓ AFEGIR CENTRE */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setShowAfegirOptions(!showAfegirOptions)}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-xl"
              >
                <Plus size={20} className={`text-emerald-400 transition-transform duration-500 ${showAfegirOptions ? 'rotate-45' : 'rotate-0'}`} />
                <span className="text-xs font-black italic uppercase tracking-wider">Afegir centre</span>
              </button>

              <AnimatePresence>
                {showAfegirOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-2"
                  >
                    <button className="w-full bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <User size={20} />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[11px] font-black italic uppercase tracking-wider text-white">Sóc usuari del centre</span>
                        <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest mt-1">Vull donar-lo a conèixer</span>
                      </div>
                    </button>

                    <button className="w-full bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 rounded-2xl p-5 flex items-center gap-4 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Briefcase size={20} />
                      </div>
                      <div className="flex flex-col items-start leading-tight">
                        <span className="text-[11px] font-black italic uppercase tracking-wider text-white">Sóc propietari del centre</span>
                        <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest mt-1">Vull donar-lo a conèixer</span>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-2xl">
              
              <div className="flex items-center gap-3 mb-2">
                <MapPin size={20} className="text-emerald-400" />
                <span className="text-xs font-black italic uppercase tracking-wider">Cerca per ubicació</span>
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
                  className="flex flex-col gap-4 mt-4"
                >
                  <div className="bg-emerald-500 text-[#00274d] rounded-3xl p-8 flex flex-col items-center gap-4 shadow-xl shadow-emerald-500/20 text-center">
                    <div className="w-16 h-16 bg-[#00274d]/10 rounded-full flex items-center justify-center">
                        <Building2 size={32} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Has seleccionat</span>
                        <h2 className="text-xl font-black italic uppercase tracking-tight">{municipi}</h2>
                    </div>
                    
                    {parseInt(municipi.match(/\((\d+)\)/)?.[1] || "0") > 0 ? (
                        <button 
                          onClick={() => setView('list')}
                          className="bg-[#00274d] text-white px-8 py-4 rounded-xl font-black italic uppercase text-[12px] tracking-widest mt-2 hover:bg-[#00274d]/80 transition-all shadow-lg active:scale-95"
                        >
                          Veure Llista de Centres
                        </button>
                    ) : (
                        <div className="bg-[#00274d]/10 border border-[#00274d]/20 p-4 rounded-2xl w-full">
                          <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                            Actualment no disposem de centres col·laboradors en aquest municipi. Estem treballant per ampliar la base de dades.
                          </p>
                        </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {view === 'list' && (
          <div className="flex flex-col gap-4">
            
            {/* BARRA DE FILTRES AMB BOTÓ GROC */}
            <div className="flex flex-col gap-3 sticky top-0 bg-[#00274d] z-20 py-2">
               <button 
                 onClick={() => setShowFilters(!showFilters)}
                 className="w-full bg-yellow-400 hover:bg-yellow-300 text-[#00274d] font-black italic uppercase tracking-[0.1em] text-[10px] py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
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
                     className="overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-3"
                   >
                     <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setFilterTop(!filterTop)}
                          className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border text-center ${filterTop ? 'bg-yellow-400 border-yellow-400 text-[#00274d]' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Top Valorats (+4.5)
                        </button>
                        <button 
                          onClick={() => setFilterPreu(filterPreu === '€' ? null : '€')}
                          className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border text-center ${filterPreu === '€' ? 'bg-emerald-400 border-emerald-500 text-[#00274d]' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Econòmic (€)
                        </button>
                        <button 
                          onClick={() => toggleFilterProva('Circuit Agilitat')}
                          className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border text-center ${filterProves.includes('Circuit Agilitat') ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Amb Circuit
                        </button>
                        <button 
                          onClick={() => toggleFilterProva('Press de Banca')}
                          className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border text-center ${filterProves.includes('Press de Banca') ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Amb Press
                        </button>
                        <button 
                          onClick={() => toggleFilterProva('Course Navette')}
                          className={`col-span-2 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border text-center ${filterProves.includes('Course Navette') ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                          Entrenament de Navette
                        </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
               
               <div className="px-4 text-white/20 text-[8px] font-black uppercase tracking-widest flex justify-between items-center mt-1">
                  <span>S'han trobat {gymsInMunicipi.length} centres</span>
                  {(filterTop || filterPreu || filterProves.length > 0) && (
                    <button onClick={() => { setFilterTop(false); setFilterPreu(null); setFilterProves([]); }} className="text-emerald-400 underline">Netejar filtres</button>
                  )}
               </div>
            </div>

            {gymsInMunicipi.map(gym => (
              <button 
                key={gym.id}
                onClick={() => { setSelectedGymId(gym.id); setView('detail'); }}
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all active:scale-95"
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center text-yellow-400 gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                       <span className="text-[10px] font-black">{gym.estrelles}</span>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-black tracking-widest">{gym.preu}</span>
                  </div>
                  <span className="text-white font-black italic uppercase tracking-wider text-sm text-left">{gym.nom}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {gym.proves.map(p => (
                      <span key={p} className="text-[7px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded uppercase font-bold">{p}</span>
                    ))}
                  </div>
                </div>
                <ArrowRight size={20} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 ml-4 shrink-0" />
              </button>
            ))}
            
            {gymsInMunicipi.length === 0 && (
              <div className="p-12 text-center text-white/20 uppercase font-black tracking-widest text-xs italic">
                No hi ha gimnasos amb aquests filtres
              </div>
            )}
          </div>
        )}

        {view === 'detail' && selectedGym && (
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center gap-4 shadow-xl">
               <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Building2 size={40} />
               </div>
               <div className="flex flex-col">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-1 leading-tight">{selectedGym.nom}</h2>
                  <div className="flex items-center justify-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(selectedGym.estrelles) ? 'opacity-100' : 'opacity-20'}>★</span>
                    ))}
                    <span className="ml-2 text-white/40 text-[10px] font-black uppercase tracking-widest">{selectedGym.estrelles} / 5</span>
                    <span className="ml-3 text-emerald-400 text-[10px] font-black tracking-widest">({selectedGym.preu})</span>
                  </div>
               </div>
               <p className="text-white/60 text-xs leading-relaxed italic">{selectedGym.descripcio}</p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="px-4 text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">Instal·lacions per a</span>
              <div className="flex flex-wrap gap-2 px-2">
                {selectedGym.proves.map(p => (
                  <div key={p} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="px-4 text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">Darreres referències</span>
              <div className="flex flex-col gap-3">
                {selectedGym.referencies.map((ref, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest italic">{ref.usuari}</span>
                      <div className="flex gap-0.5 text-[8px]">
                        {[...Array(5)].map((_, j) => (
                          <span key={j} className={j < ref.nota ? 'text-yellow-400' : 'text-white/10'}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/50 text-[11px] leading-snug italic">"{ref.comentari}"</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
               <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 shrink-0">
                  <MapPin size={20} />
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Adreça oficial</span>
                  <span className="text-[11px] text-white font-medium">{selectedGym.adreca}</span>
               </div>
            </div>
            
            <button className="w-full bg-emerald-500 text-[#00274d] rounded-2xl py-5 font-black italic uppercase tracking-[0.15em] shadow-xl shadow-emerald-500/10 active:scale-95 transition-all text-sm mb-4">
              Contactar amb el centre
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
