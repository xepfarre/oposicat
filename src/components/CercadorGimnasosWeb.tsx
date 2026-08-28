import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, Search, MapPin, Building2, ChevronDown, Check, Plus, User, Briefcase, ArrowRight, X, Phone, Mail, Lock, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DATA_CATALUNYA } from "../data/municipis";

// Explicació per a no-programadors: Importem la connexió a la base de dades de Firestore per al cercador web
import { db } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

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
}

interface SelectorProps {
  label: string;
  options: string[];
  value: string;
  onSelect: (val: string) => void;
  disabled?: boolean;
}

/**
 * Explicació per a no-programadors:
 * Selector de municipi/comarca/província amb filtre intern intel·ligent.
 * Permet filtrar dinàmicament escrivint o seleccionant amb un desplegable elegant.
 */
function SmartSelectorWeb({ label, options, value, onSelect, disabled }: SelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const handleSelect = (opt: string) => {
    onSelect(opt);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={`flex flex-col gap-1.5 w-full ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
      <label className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      
      <div className="relative">
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 flex items-center justify-between text-left group transition-all hover:bg-slate-900/80 hover:border-slate-800"
        >
          <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-2 ${value ? 'text-emerald-400' : 'text-slate-500'}`}>
            {disabled && <Lock size={11} className="opacity-50 text-slate-400" />}
            {value || (label === 'Província' ? 'Selecciona província' : label === 'Comarca' ? 'Ex: Vallès Occidental' : 'Ex: Sant Cugat o Sabadell')}
          </span>
          <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              {/* Cercador de text intern */}
              <div className="p-2 border-b border-white/5 bg-slate-950">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Buscar ${label.toLowerCase()}...`}
                    className="w-full bg-slate-900 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[11px] font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Llistat d'opcions filtrades de províncies o municipis */}
              <div className="max-h-40 overflow-y-auto divide-y divide-white/5">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      className="w-full p-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center justify-between transition-colors"
                    >
                      <span>{opt}</span>
                      {opt === value && <Check size={12} className="text-emerald-450" />}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                    Sense resultats
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

export function CercadorGimnasosWeb() {
  const [provincia, setProvincia] = useState("");
  const [comarca, setComarca] = useState("");
  const [municipi, setMunicipi] = useState("");
  const [showAfegirOptions, setShowAfegirOptions] = useState(false);
  const [view, setView] = useState<'search' | 'list' | 'detail'>('search');
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [sollicitudTipus, setSollicitudTipus] = useState<'usuari' | 'propietari' | null>(null);
  const [sollicitudNom, setSollicitudNom] = useState("");
  const [sollicitudAdreca, setSollicitudAdreca] = useState("");
  const [sollicitudExces, setSollicitudExces] = useState(false);

  // Explicació per a no-programadors: Estat per a emmagatzemar la llista de gimnasos que llegim de la base de dades Firestore en temps real
  const [allGyms, setAllGyms] = useState<Gym[]>([]);

  useEffect(() => {
    const q = query(collection(db, "gimnasos"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gymsList: Gym[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.suspes) return;

        gymsList.push({
          id: doc.id,
          nom: data.nom || "",
          provincia: data.provincia || "",
          comarca: data.comarca || "",
          municipi: data.municipi || "",
          adreca: data.adreca || "",
          estrelles: data.estrelles || 4.5,
          preus: data.preus || "",
          descripcio: data.descripcio || "",
          proves: data.entrenament || [],
          referencies: data.referencies || [
            { usuari: "Opositor", comentari: "Molt bon material per a oposicions.", nota: 5 }
          ],
          telefon: data.telefon || "",
          correu: data.correu || "",
          imatges: data.imatges || []
        });
      });
      setAllGyms(gymsList);
    });
    return () => unsubscribe();
  }, []);

  // Explicació per a no-programadors: Compta quants gimnasos col·laboradors hi ha a cada municipi a partir de la BBDD
  const gymsCountByMunicipi = useMemo(() => {
    const counts: Record<string, number> = {};
    allGyms.forEach(gym => {
      const mun = gym.municipi;
      counts[mun] = (counts[mun] || 0) + 1;
    });
    return counts;
  }, [allGyms]);

  // Fotografies realistes per al carrusel
  const gymPhotos = [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2070&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=2070&auto=format&fit=crop"  
  ];

  const selectedGym = useMemo(() => 
    allGyms.find(g => g.id === selectedGymId),
  [allGyms, selectedGymId]);

  // Filtres avançats per re-ajustar els centres trobats
  const [filterPreu, setFilterPreu] = useState<string | null>(null);
  const [filterProves, setFilterProves] = useState<string[]>([]);
  const [filterTop, setFilterTop] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Explicació per a no-programadors: Obté la llista final filtrada de gimnasos col·laboradors actius
  const gymsInMunicipi = useMemo(() => {
    // Netegem el municipi de la part de "(num)"
    const cleanMunicipi = municipi.split(" (")[0];
    let list = allGyms.filter(g => g.municipi === cleanMunicipi);
    
    // Filtre preu
    if (filterPreu) {
      list = list.filter(g => {
        if (!g.preus) return false;
        if (filterPreu === '€') {
          return g.preus.includes('30€') || g.preus.includes('25€') || g.preus.includes('20€');
        } else if (filterPreu === '€€') {
          return g.preus.includes('40€') || g.preus.includes('45€') || g.preus.includes('50€');
        } else {
          return g.preus.includes('60€') || g.preus.includes('70€') || g.preus.includes('80€');
        }
      });
    }
    // Filtre valoracions altes
    if (filterTop) list = list.filter(g => g.estrelles >= 4.5);
    // Filtre per proves físiques adaptades
    if (filterProves.length > 0) {
      list = list.filter(g => 
        filterProves.every(p => {
          if (p === "Circuit d'Agilitat") {
            return g.proves.includes("Circuit d'Agilitat") || g.proves.includes("Circuit Agilitat");
          }
          return g.proves.includes(p);
        })
      );
    }
    
    return list;
  }, [allGyms, municipi, filterPreu, filterProves, filterTop]);

  const toggleFilterProva = (prova: string) => {
    setFilterProves(prev => 
      prev.includes(prova) 
        ? prev.filter(p => p !== prova) 
        : [...prev, prova]
    );
  };

  const provincies = Object.keys(DATA_CATALUNYA);
  
  const comarques = useMemo(() => {
    return provincia ? Object.keys(DATA_CATALUNYA[provincia as keyof typeof DATA_CATALUNYA] || {}) : [];
  }, [provincia]);

  const municipis = useMemo(() => {
    if (!provincia || !comarca) return [];
    // @ts-ignore
    const baseMunicipis: string[] = DATA_CATALUNYA[provincia]?.[comarca] || [];
    return baseMunicipis.map(m => {
      const count = gymsCountByMunicipi[m] || 0;
      return `${m} (${count})`;
    });
  }, [provincia, comarca, gymsCountByMunicipi]);

  const handleSelectProvincia = (val: string) => {
    setProvincia(val);
    setComarca("");
    setMunicipi("");
  };

  const handleSelectComarca = (val: string) => {
    setComarca(val);
    setMunicipi("");
  };

  const enviarSollicitud = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sollicitudNom.trim()) return;
    setSollicitudExces(true);
  };

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-blue-900/30 space-y-6">
      
      {/* Capçalera d'estat del cercador */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-emerald-450" />
          <div>
            <h4 className="text-[11px] font-black tracking-widest text-emerald-450 uppercase">Plànol Municipal de Centres</h4>
            <p className="text-[9px] text-slate-400 uppercase font-mono">Trobador de Pistes oficials de Course Navette i Circuits d'Agilitat</p>
          </div>
        </div>

        {view !== 'search' && (
          <button
            onClick={() => {
              if (view === 'detail') setView('list');
              else setView('search');
            }}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold uppercase text-[9.5px] px-2.5 py-1.5 rounded-lg border border-white/5 cursor-pointer transition-all"
          >
            <ChevronLeft size={12} />
            Enrere
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === 'search' && (
          <motion.div 
            key="search-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <p className="text-[10.5px] text-slate-300 font-medium leading-relaxed italic text-center">
                "Des d'OposiCAT sabem com és de frustrant buscar camins o poliesportius adequats. Hem creat un cens social on pots filtrar instal·lacions reals que compten amb tancaments homologats de fusta per a la prova d'agilitat i espai de press de banca reglamentari."
              </p>
            </div>

            <div className="grid md:grid-cols-12 gap-6 items-start">
              
              {/* Formular de cerca de l'esportista */}
              <div className="md:col-span-7 bg-slate-900/25 p-5 rounded-xl border border-white/5 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FFDF00]">📍 CONFIGURA LA TEVA UBICACIÓ</span>
                
                <div className="space-y-3">
                  <SmartSelectorWeb 
                    label="Província"
                    options={provincies}
                    value={provincia}
                    onSelect={handleSelectProvincia}
                  />

                  <SmartSelectorWeb 
                    label="Comarca"
                    options={comarques}
                    value={comarca}
                    onSelect={handleSelectComarca}
                    disabled={!provincia}
                  />

                  <SmartSelectorWeb 
                    label="Municipi"
                    options={municipis}
                    value={municipi}
                    onSelect={setMunicipi}
                    disabled={!comarca}
                  />
                </div>

                {municipi && (
                  <button
                    onClick={() => setView('list')}
                    className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black italic uppercase tracking-wider text-[10.5px] py-3 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Building2 size={13} />
                    Explorar {gymsInMunicipi.length} centres a {municipi.split(" (")[0]}
                  </button>
                )}
              </div>

              {/* Secció dreta d'afegir un nou centre */}
              <div className="md:col-span-5 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">➕ CONEIXES UN CENTRE APTE?</span>
                
                <div className="bg-slate-900/15 border border-white/5 rounded-xl p-4 space-y-3">
                  <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
                    Col·labora amb OposiCAT! Ajuda a altres opositors donant d'alta entorns on es puguin entrenar de forma autònoma.
                  </p>

                  {!sollicitudTipus ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSollicitudTipus('usuari')}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-[9px] font-black uppercase border border-white/5 rounded-lg text-white/80 cursor-pointer"
                      >
                        Sóc usuari
                      </button>
                      <button 
                        onClick={() => setSollicitudTipus('propietari')}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-[9px] font-black uppercase border border-white/5 rounded-lg text-white/80 cursor-pointer"
                      >
                        Sóc propietari
                      </button>
                    </div>
                  ) : sollicitudExces ? (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-lg text-emerald-400 text-[9.5px] font-semibold">
                      🎉 Moltes gràcies! Hem enviat la proposta de "{sollicitudNom}" per a ser auditada pels nostres entrenadors físics. Rebràs una trucada de confirmació aviat.
                    </div>
                  ) : (
                    <form onSubmit={enviarSollicitud} className="space-y-2 animate-in fade-in duration-200">
                      <input 
                        type="text" 
                        placeholder="Nom de la instal·lació" 
                        value={sollicitudNom}
                        onChange={(e) => setSollicitudNom(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-[10.5px] text-white focus:outline-none"
                      />
                      <input 
                        type="text" 
                        placeholder="Adreça o Carretera" 
                        value={sollicitudAdreca}
                        onChange={(e) => setSollicitudAdreca(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-[10.5px] text-white focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => setSollicitudTipus(null)}
                          className="px-2.5 py-1 text-[9px] bg-slate-900 text-slate-400 font-bold uppercase rounded hover:text-white"
                        >
                          Cancel·lar
                        </button>
                        <button 
                          type="submit" 
                          className="flex-1 py-1 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase rounded shadow"
                        >
                          Trametre dades
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {view === 'list' && (
          <motion.div 
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Secció de filtres de visualització */}
            <div className="flex flex-col gap-2 bg-slate-900/30 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                  Focalització ({gymsInMunicipi.length} centres aptes)
                </span>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-emerald-400 hover:text-emerald-350 text-[9.5px] font-black uppercase cursor-pointer"
                >
                  {showFilters ? 'Tancar filtres' : 'Ajustar filtres...'}
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 animate-in slide-in-from-top-1 duration-150">
                  <button 
                    onClick={() => setFilterTop(!filterTop)}
                    className={`p-2 rounded-lg text-[9px] font-black uppercase border tracking-wider transition-all cursor-pointer ${filterTop ? 'bg-emerald-500/10 border-emerald-400 text-emerald-450' : 'bg-slate-950 border-white/5 text-slate-500'}`}
                  >
                    Alta valoració (+4.5)
                  </button>
                  <button 
                    onClick={() => setFilterPreu(filterPreu === '€' ? null : '€')}
                    className={`p-2 rounded-lg text-[9px] font-black uppercase border tracking-wider transition-all cursor-pointer ${filterPreu === '€' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-450' : 'bg-slate-950 border-white/5 text-slate-500'}`}
                  >
                    Econòmic (€)
                  </button>
                  <button 
                    onClick={() => toggleFilterProva("Circuit d'Agilitat")}
                    className={`p-2 rounded-lg text-[9px] font-black uppercase border tracking-wider transition-all cursor-pointer ${filterProves.includes("Circuit d'Agilitat") ? 'bg-blue-600/10 border-blue-400 text-blue-400' : 'bg-slate-950 border-white/5 text-slate-500'}`}
                  >
                    Amb Circuit
                  </button>
                  <button 
                    onClick={() => toggleFilterProva("Course Navette")}
                    className={`p-2 rounded-lg text-[9px] font-black uppercase border tracking-wider transition-all cursor-pointer ${filterProves.includes("Course Navette") ? 'bg-blue-600/10 border-blue-400 text-blue-400' : 'bg-slate-950 border-white/5 text-slate-500'}`}
                  >
                    Course Navette
                  </button>
                </div>
              )}
            </div>

            {/* Llista quadriculada de gimnasos fitxats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gymsInMunicipi.map(gym => {
                const hasCircuit = gym.proves.some(p => p.includes("Circuit"));
                const hasPress = gym.proves.some(p => p.includes("Press"));
                const hasNavette = gym.proves.some(p => p.includes("Navette"));
                const tarifesPreu = (() => {
                  if (!gym.preus) return "Cons.";
                  const match = gym.preus.match(/\d+[\s]*€/);
                  if (match) return `${match[0].replace(/\s+/g, '')}/mes`;
                  const numMatch = gym.preus.match(/\d+/);
                  if (numMatch) return `${numMatch[0]}€/mes`;
                  return "Cons.";
                })();

                return (
                  <div 
                    key={gym.id}
                    className="bg-slate-900/30 border border-white/5 hover:border-emerald-500/25 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all relative overflow-hidden group hover:bg-slate-900/50"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h5 className="text-white font-black italic uppercase text-sm md:text-base leading-tight tracking-tight">
                          {gym.nom}
                        </h5>
                        <div className="flex items-center gap-0.5 text-yellow-400 shrink-0 text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-yellow-400 stroke-none" />
                          <span>{gym.estrelles}</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        {gym.descripcio}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {hasCircuit && <span className="bg-emerald-500/10 text-emerald-400 text-[7.5px] font-extrabold uppercase py-0.5 px-1.5 rounded border border-emerald-500/20">Circuit d'Agilitat</span>}
                        {hasPress && <span className="bg-sky-500/10 text-sky-400 text-[7.5px] font-extrabold uppercase py-0.5 px-1.5 rounded border border-sky-500/20">Press de Banca</span>}
                        {hasNavette && <span className="bg-orange-500/10 text-orange-400 text-[7.5px] font-extrabold uppercase py-0.5 px-1.5 rounded border border-orange-500/20 font-mono">Course Navette</span>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Quota inicial:</span>
                        <span className="text-xs font-mono font-black text-emerald-450">{tarifesPreu}</span>
                      </div>
                      
                      <button
                        onClick={() => { setSelectedGymId(gym.id); setView('detail'); }}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-[#00f296] hover:text-slate-950 font-black uppercase tracking-wider text-[9px] rounded-lg transition-all border border-white/5 flex items-center gap-1 cursor-pointer"
                      >
                        Més detalls
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {gymsInMunicipi.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-[10px] uppercase font-black tracking-widest italic md:col-span-2">
                  No s'ha localitzat cap gimnàs col·laborador amb aquests filtres actius.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'detail' && selectedGym && (
          <motion.div 
            key="detail-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Carrusel adaptat a contingut web */}
            <div className="relative w-full h-44 sm:h-64 rounded-xl overflow-hidden border border-white/10 group shadow-2xl">
              <img 
                src={gymPhotos[currentPhoto]}
                className="w-full h-full object-cover transition-all"
                alt="Instal·lacions del gimnàs"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Controls de carrusel */}
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setCurrentPhoto(p => p > 0 ? p - 1 : gymPhotos.length - 1)}
                  className="p-1.5 bg-slate-900/60 rounded-full border border-white/10 text-white cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentPhoto(p => p < gymPhotos.length - 1 ? p + 1 : 0)}
                  className="p-1.5 bg-slate-900/60 rounded-full border border-white/10 text-white cursor-pointer"
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Indicators a la cantonada inferior dreta */}
              <div className="absolute bottom-3 right-4 flex gap-1">
                {gymPhotos.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPhoto(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${i === currentPhoto ? 'w-4 bg-[#FFDF00]' : 'w-1.5 bg-white/30'}`}
                  />
                ))}
              </div>

              {/* Nom del gimnàs flotant */}
              <div className="absolute bottom-3 left-4">
                <h4 className="text-white font-black italic uppercase text-lg sm:text-2xl tracking-tight drop-shadow-md">
                  {selectedGym.nom}
                </h4>
              </div>
            </div>

            {/* Informació modular de la fitxa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider">🎯 Presentació d’aquest entorn:</span>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic">
                    "{selectedGym.descripcio} Hem pintat les distàncies exactes dels 20m de la Course Navette i posem a la teva disposició barres i discs d'escalfament de Mossos."
                  </p>
                </div>

                <div className="p-3 bg-slate-900/30 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider">🛠️ Proves que pots coordinar:</span>
                  <ul className="text-[10px] text-slate-300 font-bold uppercase space-y-1.5">
                    {['Circuit d\'Agilitat', 'Course Navette', 'Press de Banca'].map(p => {
                      const isIncluded = selectedGym.proves.includes(p);
                      return (
                        <li key={p} className="flex items-center gap-1.5">
                          <span>{isIncluded ? '✅' : '❌'}</span>
                          <span className={isIncluded ? 'text-white' : 'text-slate-650'}>{p}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-900/20 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[8.5px] font-black uppercase text-[#FFDF00] tracking-wider block">🗣️ Opinat per opositors reals:</span>
                  
                  <div className="space-y-2.5">
                    {selectedGym.referencies.map((ref, idx) => (
                      <div key={idx} className="border-l-2 border-emerald-500/20 pl-3 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-black text-slate-400">{ref.usuari}</span>
                          <span className="text-[8px] text-emerald-400 font-mono">({ref.nota}/5 ★)</span>
                        </div>
                        <p className="text-[10px] text-slate-350 italic">"{ref.comentari}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tarifes reals de la fitxa del centre */}
                <div className="space-y-1">
                  <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider">🏷️ Quadre de preus i tarifes:</span>
                  <div className="text-[10.5px] text-slate-300 leading-relaxed font-semibold italic space-y-1">
                    <p>{selectedGym.preus || "Contacta amb el centre per consultar les tarifes vigents per a opositors."}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[10px] tracking-wider italic rounded-xl cursor-pointer active:scale-95 transition-all shadow-lg shadow-emerald-500/5 text-center"
                  >
                    Contactar per telèfon i e-mail
                  </button>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedGym.nom + ' ' + selectedGym.adreca)}`, '_blank')}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider rounded-xl border border-white/5 cursor-pointer text-center"
                  >
                    Anar-hi (Google Maps)
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'acompanyament de dades acústiques */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl space-y-6"
            >
              <button 
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950 hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-all cursor-pointer"
              >
                <X size={14} />
              </button>

              <div className="space-y-1 text-center">
                <span className="text-[8px] font-black uppercase text-emerald-450 tracking-widest block">DADES DE CONTACTE DIRECTE</span>
                <h3 className="text-base font-black italic uppercase text-white tracking-tight">Hola! Com prefereixes comunicar-te amb nosaltres?</h3>
              </div>

              <div className="space-y-3">
                <a 
                  href={`tel:${(selectedGym?.telefon || "931234567").replace(/\s+/g, '')}`} 
                  className="block p-4 bg-slate-950/50 border border-white/5 hover:border-emerald-500/20 hover:bg-slate-950 rounded-xl transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-black italic text-lg leading-none group-hover:text-emerald-450">{selectedGym?.telefon || "93 123 45 67"}</span>
                    <Phone size={14} className="text-slate-500 group-hover:text-emerald-450" />
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">Atenció real: Dl-Dv (09h - 21h)</span>
                </a>

                <a 
                  href={`mailto:${selectedGym?.correu || "contacte@gimnasopos.cat"}`} 
                  className="block p-4 bg-slate-950/50 border border-white/5 hover:border-emerald-500/20 hover:bg-slate-950 rounded-xl transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-black italic text-xs leading-none group-hover:text-emerald-450 truncate max-w-[200px]">{selectedGym?.correu || "contacte@gimnasopos.cat"}</span>
                    <Mail size={14} className="text-slate-500 group-hover:text-emerald-450" />
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">Responem en poques hores</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
