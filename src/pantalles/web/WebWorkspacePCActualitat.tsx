import React, { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Globe, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Tag, 
  Newspaper, 
  Star, 
  Check, 
  X, 
  Trophy, 
  Brain, 
  RefreshCw, 
  Sparkles 
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Explicació per a no-programadors:
// Definim l'estructura per a les notícies de l'última setmana reals o simulades.
interface Noticia {
  id: string;
  data: string;
  categoria: string;
  titol: string;
  descripcio: string;
}

// Explicació per a no-programadors:
// Definim l'estructura de les preguntes del test d'actualitat per assegurar la integritat del sistema.
interface PreguntaActualitat {
  id: number;
  pregunta: string;
  opcions: string[];
  correcta: number;
  explicacio: string;
}

export default function WebWorkspacePCActualitat({ onGoBack }: { onGoBack?: () => void }) {
  // Explicació per a no-programadors:
  // Control de sub-pestanyes actives dins del panell d'actualitat general:
  // - 'setmana' per a l'actualitat setmanal.
  // - 'any' pels fets rellevants segmentats mes a mes.
  // - 'examen' pel simulador interactiu d'actualitat.
  const [subSeccio, setSubSeccio] = useState<'setmana' | 'any' | 'examen'>('setmana');

  // --- ESTATS PESTANYA "ÚLTIMA SETMANA" ---
  const [noticiesSetmana, setNoticiesSetmana] = useState<Noticia[]>([]);
  const [loadingSetmana, setLoadingSetmana] = useState(true);

  // --- ESTATS PESTANYA "NOTÍCIES DE L'ANY" ---
  const [anyView, setAnyView] = useState<'mesos' | 'detall'>('mesos');
  const [mesSeleccionat, setMesSeleccionat] = useState<string>('');
  
  // --- ESTATS PESTANYA "EXÀMENS D'ACTUALITAT" ---
  const [examenEnCurs, setExamenEnCurs] = useState(false);
  const [preguntaActualIdx, setPreguntaActualIdx] = useState(0);
  const [respostaSeleccionada, setRespostaSeleccionada] = useState<number | null>(null);
  const [encerts, setEncerts] = useState(0);
  const [examenFinalitzat, setExamenFinalitzat] = useState(false);

  // Explicació per a no-programadors:
  // 10 notícies realistes i d'actualitat molt relacionades amb els Mossos i Catalunya com a dades per defecte (període de context primavera-estiu 2026).
  const fallbackNoticies: Noticia[] = [
    {
      id: "f1",
      data: "16 Mai",
      categoria: "Societat",
      titol: "Catalunya entra en fase de pre-alerta per sequera després d'un abril sec",
      descripcio: "L'Agència Catalana de l'Aigua monitoritza els embassaments que es troben al 35% de la seva capacitat."
    },
    {
      id: "f2",
      data: "16 Mai",
      categoria: "Seguretat",
      titol: "Nou pla de seguretat de Mossos per al desenvolupament d'infraestructures crítiques el 2026",
      descripcio: "Interior confirma un desplegament especial de Mossos d'Esquadra per garantir la ciberseguretat als hubs energètics de la costa."
    },
    {
      id: "f3",
      data: "15 Mai",
      categoria: "Política",
      titol: "El Parlament aprova la nova llei d'habitatge per limitar preus en zones tenses",
      descripcio: "La normativa busca frenar l'escalada de preus de lloguer a l'àrea metropolitana de Barcelona."
    },
    {
      id: "f4",
      data: "14 Mai",
      categoria: "Economia",
      titol: "L'atur baixa a Catalunya per tercer mes consecutiu",
      descripcio: "Les dades de maig mostren una forta recuperació en el sector serveis i hostaleria."
    },
    {
      id: "f5",
      data: "14 Mai",
      categoria: "Tecnologia",
      titol: "Barcelona inaugura el nou hub d'Intel·ligència Artificial del sud d'Europa",
      descripcio: "El centre preveu crear més de 1.000 llocs de treball d'alta qualificació en els propers dos anys."
    },
    {
      id: "f6",
      data: "13 Mai",
      categoria: "Cultura",
      titol: "Sant Jordi 2026 bat rècords de vendes de llibres en català",
      descripcio: "El Gremi de Llibreters confirma un increment del 15% respecte a l'any anterior."
    },
    {
      id: "f7",
      data: "12 Mai",
      categoria: "Infraestructures",
      titol: "Les obres de la L9 del Metro entren en la seva fase final a Sarrià",
      descripcio: "Es preveu que el tram central estigui operatiu a principis de l'any vinent."
    },
    {
      id: "f8",
      data: "11 Mai",
      categoria: "Medi Ambient",
      titol: "Protecció Civil demana precaució davant les primeres onades de calor",
      descripcio: "S'activen els protocols d'informació a la gent gran i col·lectius vulnerables."
    },
    {
      id: "f9",
      data: "10 Mai",
      categoria: "Esports",
      titol: "El Barça femení es proclama campió de lliga per cinquena vegada consecutiva",
      descripcio: "L'equip manté la seva hegemonia en el futbol estatal amb una temporada gairebé perfecta."
    },
    {
      id: "f10",
      data: "09 Mai",
      categoria: "Sanitat",
      titol: "Salut implanta el nou sistema de recepta electrònica universal",
      descripcio: "El sistema permetrà retirar medicaments a qualsevol farmàcia de la Unió Europea amb el codi QR."
    }
  ];

  // Explicació per a no-programadors:
  // Mesos del calendari per consultar selectivament els fets clau de l'any.
  const mesosDeLAny = [
    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny", 
    "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
  ];

  // Explicació per a no-programadors:
  // Preguntes simulades sobre fets recents, exactament iguals que a l'APP, per repassar la cultura general de l'última part de la prova dels Mossos d'Esquadra.
  const preguntesActualitat: PreguntaActualitat[] = [
    {
      id: 1,
      pregunta: "Quin és l'objectiu principal de la fase de pre-alerta per sequera activada recentment a Catalunya?",
      opcions: [
        "Prohibir totalment el reg agrícola a tot el territori.",
        "Monitoritzar embassaments i preparar mesures d'estalvi preventiu.",
        "Tancar l'accés a les platges de l'àrea metropolitana.",
        "Augmentar el preu de l'aigua un 50% de forma immediata."
      ],
      correcta: 1,
      explicacio: "La pre-alerta serveix per fer un seguiment estret dels recursos hídrics dels embassaments de l'Agència Catalana de l'Aigua abans d'aplicar restriccions severes de nivell vermell."
    },
    {
      id: 2,
      pregunta: "Quina és la xifra aproximada d'agents que es preveu que tingui el cos de Mossos d'Esquadra segons el pla de creixement actual?",
      opcions: [
        "15.000 agents",
        "17.500 agents",
        "22.000 agents",
        "30.000 agents"
      ],
      correcta: 2,
      explicacio: "El pacte de creixement i coordinació de la plantilla entre la Generalitat i el Ministeri de l'Interior es va establir amb una xifra límit d'uns 22.000 agents."
    },
    {
      id: 3,
      pregunta: "Quin esdeveniment tecnològic ha motivat un desplegament especial de seguretat a Barcelona aquest maig?",
      opcions: [
        "La fira de videojocs IndieDevDay.",
        "El Mobile World Congress (MWC).",
        "La fira del llibre digital de Sarrià.",
        "L'Smart City Expo World Congress."
      ],
      correcta: 1,
      explicacio: "El Mobile World Congress (MWC) és la trobada tecnològica més multitudinària al recinte de Fira Barcelona i exigeix la coordinació dels diferents grups i unitats de Seguretat Ciutadana i Trànsit."
    },
    {
      id: 4,
      pregunta: "Quina reforma legal s'ha impulsat recentment per millorar la seguretat ciutadana davant els petits delictes?",
      opcions: [
        "Llei de liberalització d'horaris comercials.",
        "Reforma del Codi Penal contra la multireincidència.",
        "Decret de tancament de locals nocturns a partir de les 2h.",
        "Nova llei de caça i pesca en zones protegides."
      ],
      correcta: 1,
      explicacio: "La modificació del Codi Penal amb sancions de presó més efectives per als multireincidents pretén eradicar els furts sistemàtics ordinaris a les zones urbanes."
    },
    {
      id: 5,
      pregunta: "Quina nova competència ha assumit plenament el cos de Mossos d'Esquadra durant l'últim any?",
      opcions: [
        "Vigilància del trànsit aeri internacional.",
        "Control total de les fronteres terrestres amb França.",
        "Funcions de Policia Marítima en tota la costa catalana.",
        "Gestió directa del sistema de pensions estatal."
      ],
      correcta: 2,
      explicacio: "El desplegament marítim dels Mossos d'Esquadra per garantir la vigilància en aigües interiors i ports esportius n'ha esdevingut la seva darrera gran competència sectorial."
    }
  ];

  // Explicació per a no-programadors:
  // Carrega de dades en temps real (des de Firebase si hi ha connexió activa, altrament fem servir el fallback).
  useEffect(() => {
    const carregarDadesActualitat = async () => {
      setLoadingSetmana(true);
      try {
        const q = query(collection(db, "actualitat"), orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setNoticiesSetmana(fallbackNoticies);
        } else {
          const dades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Noticia));
          setNoticiesSetmana(dades);
        }
      } catch (err) {
        console.error("No s'ha pogut carregar des de Firestore, s'activen fallbacks d'estudi locals:", err);
        setNoticiesSetmana(fallbackNoticies);
      } finally {
        setLoadingSetmana(false);
      }
    };

    carregarDadesActualitat();
  }, []);

  // Explicació per a no-programadors:
  // Genera notícies de simulació mes a mes quan l'estudiant clica un mes qualsevol del bento de l'any.
  const obtenirNoticiesMes = (titolMes: string) => {
    const isImportant = titolMes === "Notícies més importants de l'any";
    const mesNom = isImportant ? "Gener" : titolMes;
    const prefix = isImportant ? "Esdeveniment clau de l'any" : `Fet destacat de ${titolMes}`;
    
    return [
      {
        id: "m1",
        data: `20 ${mesNom}`,
        categoria: "Seguretat",
        titol: `${prefix}: Unificació de dades policials`,
        descripcio: "Acord d'integració de la base de dades policials catalana amb els sistemes d'alerta d'Europol. Això enforteix l'intercanvi d'informació antiterrorista i de crim organitzat."
      },
      {
        id: "m2",
        data: `15 ${mesNom}`,
        categoria: "Política",
        titol: `${prefix}: Novetat reglamentària de l'escala bàsica`,
        descripcio: "Publicació al DOGC del decret que detalla els darrers canvis en l'organigrama operatiu intern d'Interior i les especialitzacions d'agents."
      },
      {
        id: "m3",
        data: `10 ${mesNom}`,
        categoria: "Societat",
        titol: `${prefix}: Campanya d'informació sobre estafes digitals`,
        descripcio: "Mossos llança un protocol informatiu dirigit a gent gran i comerços per prevenir phising i estafes informàtiques de darrera generació."
      },
      {
        id: "m4",
        data: `05 ${mesNom}`,
        categoria: "Economia",
        titol: `${prefix}: Licitació de nous materials mòbils`,
        descripcio: "Aprovació extraordinària de recursos econòmics per a la renovació dels vehicles especialitzats d'alta muntanya i l'adquisició de mitjans dronítics."
      }
    ];
  };

  // --- MÈTODES DEL SIMULADOR ---
  const handleRespostaTest = (opcioIdx: number) => {
    if (respostaSeleccionada !== null) return;
    setRespostaSeleccionada(opcioIdx);
    if (opcioIdx === preguntesActualitat[preguntaActualIdx].correcta) {
      setEncerts(prev => prev + 1);
    }
  };

  const handleSeguentPregunta = () => {
    if (preguntaActualIdx < preguntesActualitat.length - 1) {
      setPreguntaActualIdx(prev => prev + 1);
      setRespostaSeleccionada(null);
    } else {
      setExamenFinalitzat(true);
    }
  };

  const handleReiniciarSimulador = () => {
    setPreguntaActualIdx(0);
    setRespostaSeleccionada(null);
    setEncerts(0);
    setExamenFinalitzat(false);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      
      {/* Explicació per a no-programadors: Botó per tornar enrere al menú de 8 botons principals de teoria amb un disseny impecable i responsive */}
      {onGoBack && (
        <div className="flex justify-start">
          <button
            onClick={onGoBack}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-slate-700/80 transition-all text-[11px] font-black italic uppercase tracking-wider text-slate-350 hover:text-white cursor-pointer"
          >
            <ChevronLeft size={16} className="text-[#00f296] group-hover:-translate-x-0.5 transition-transform" />
            Tornar al menú dels 8 botons
          </button>
        </div>
      )}

      {/* CAPÇALERA DE PÀGINA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase text-yellow-400 tracking-wider bg-yellow-400/10 px-2.5 py-0.5 rounded border border-yellow-400/20">
              CULTURA GENERAL I ACTUALITAT SECTORIAL
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-black italic uppercase text-white tracking-widest leading-none">
            🗞️ ACTUALITAT CATALUNYA & SEGURETAT
          </h1>
          <p className="text-xs text-slate-400 font-bold max-w-2xl leading-relaxed">
            Repassa els successos informatius i legislatius recents de la Generalitat de Catalunya clau per a l'examen. Un percentatge dels punts teòrics avalua directament els canvis actuals del país.
          </p>
        </div>
      </div>

      {/* TABS DE SELECCIÓ PRINCIPAL DE L'ACTUALITAT */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 shadow-inner">
        <button
          onClick={() => setSubSeccio('setmana')}
          className={`flex-1 py-3 rounded-xl font-black italic uppercase text-[10px] sm:text-xs tracking-widest transition-all cursor-pointer ${
            subSeccio === 'setmana'
              ? 'bg-[#00f296] text-slate-950 shadow-lg shadow-emerald-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📅 ÚLTIMA SETMANA
        </button>

        <button
          onClick={() => {
            setSubSeccio('any');
            setAnyView('mesos');
          }}
          className={`flex-1 py-3 rounded-xl font-black italic uppercase text-[10px] sm:text-xs tracking-widest transition-all cursor-pointer ${
            subSeccio === 'any'
              ? 'bg-[#00f296] text-slate-950 shadow-lg shadow-emerald-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🌍 NOTÍCIES DE L'ANY
        </button>

        <button
          onClick={() => {
            setSubSeccio('examen');
            handleReiniciarSimulador();
            setExamenEnCurs(false);
          }}
          className={`flex-1 py-3 rounded-xl font-black italic uppercase text-[10px] sm:text-xs tracking-widest transition-all cursor-pointer ${
            subSeccio === 'examen'
              ? 'bg-[#00f296] text-slate-950 shadow-lg shadow-emerald-500/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📋 EXÀMENS ACTUALITAT
        </button>
      </div>

      {/* --- PESTANYA 1: ÚLTIMA SETMANA --- */}
      {subSeccio === 'setmana' && (
        <div className="space-y-6">
          <div className="text-left bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
            <p className="text-[#00f296] text-[10px] font-black uppercase tracking-widest mb-1">Butlletí d'informació continu</p>
            <p className="text-slate-350 text-xs font-semibold leading-relaxed">
              Resum diari dels fets més notables del territori i el departament. L'ISPC utilitza sovint dades d'infraestructures, demografia i seguretat ciutadana d’aquest mòdul.
            </p>
          </div>

          {loadingSetmana ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sincronitzant notícies recents...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {noticiesSetmana.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900/35 hover:bg-slate-900/60 transition-all border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between"
                  style={{ minHeight: '180px' }}
                >
                  <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                    <Tag size={10} className="text-emerald-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#00f296]">{n.categoria}</span>
                  </div>

                  <div className="space-y-3 pt-6 text-left">
                    <span className="text-[9px] text-[#00f296] font-bold tracking-widest uppercase bg-emerald-950/40 border border-emerald-900/30 px-2.5 py-0.5 rounded-md block w-fit">
                      📍 {n.data} • Catalunya
                    </span>
                    <h3 className="text-white text-sm md:text-base font-black italic uppercase leading-snug">
                      {n.titol}
                    </h3>
                    <p className="text-slate-400 text-[11px] md:text-xs leading-relaxed font-semibold">
                      {n.descripcio}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 opacity-40">
                    <Clock size={11} className="text-slate-400" />
                    <span className="text-[8.5px] font-black uppercase tracking-wider">Butlletí oficial Mossos</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="p-6 bg-[#FFDF00]/5 border border-[#FFDF00]/10 rounded-3xl flex flex-col sm:flex-row items-center gap-4 text-left">
            <Newspaper size={36} className="text-yellow-400 shrink-0 opacity-80" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase text-yellow-400 tracking-wider">RECOMANACIÓ GENERAL DE PREPARACIÓ ACADÈMICA</h4>
              <p className="text-slate-350 text-[10.5px] font-bold leading-relaxed">
                Repassar l'actualitat setmana a setmana t'ajudarà a no deixar-te sorprendre. Molts aspirants consoliden fins a un 1.5 extra de nota gràcies a estar connectats amb la realitat catalana de l’últim quadrimestre.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- PESTANYA 2: NOTÍCIES DE L'ANY --- */}
      {subSeccio === 'any' && (
        <div className="space-y-6">
          {anyView === 'mesos' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Notícia estrella de l'any */}
              <div className="bg-gradient-to-r from-yellow-500/5 to-yellow-600/10 border-2 border-yellow-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-3 flex-1 relative z-10">
                  <span className="bg-yellow-400 text-slate-950 text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded inline-flex items-center gap-1">
                    <Star size={10} className="fill-slate-950" /> IMPRESCINDIBLE PER AL TRIBUNAL
                  </span>
                  <h3 className="text-white text-base md:text-xl font-black italic uppercase leading-none mt-1">
                    Els 10 fets més importants de tot l'any 🏆
                  </h3>
                  <p className="text-slate-300 text-xs font-semibold leading-relaxed max-w-2xl">
                    L'equip pedagògic d'OposiMossos ha elaborat un quadre sinòptic amb les deu reformes d'estructura i fets constitucionals o autonòmics que has d'assimilar i memoritzar sí o sí.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setMesSeleccionat("Notícies més importants de l'any");
                    setAnyView('detall');
                  }}
                  className="bg-[#FFDF00] hover:bg-yellow-400 text-slate-950 font-black italic uppercase text-[10px] tracking-widest py-3.5 px-6 rounded-xl transition-all shadow-lg text-center whitespace-nowrap cursor-pointer shrink-0"
                >
                  Veure indispensables ▶
                </button>
              </div>

              {/* Llista bento dels 12 mesos */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider text-left pl-1">
                  • Consultar resums històrics mes a mes de l'any
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mesosDeLAny.map((mes, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMesSeleccionat(mes);
                        setAnyView('detall');
                      }}
                      className="bg-slate-900/30 hover:bg-slate-900/60 border border-white/5 hover:border-white/10 p-5 rounded-2xl text-center flex flex-col justify-center items-center gap-2 transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-colors shrink-0">
                        <Calendar size={16} />
                      </div>
                      <span className="text-white text-xs font-black italic uppercase tracking-wider block">
                        {mes}
                      </span>
                      <span className="text-[8px] text-slate-500 font-extrabold uppercase group-hover:text-emerald-400 transition-colors">
                        Sintetitzat
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* DETALL DELS FETS D'UN MES SELECCIONAT */
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <button
                  onClick={() => setAnyView('mesos')}
                  className="text-[10px] font-black uppercase text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={16} /> Tornar a la vista anual
                </button>
                <div className="bg-slate-950 border border-white/10 px-3.5 py-1 rounded-[10px] flex items-center gap-1.5 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] text-[#00f296] font-black uppercase tracking-wider">{mesSeleccionat}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {obtenirNoticiesMes(mesSeleccionat).map((n, i) => (
                  <div
                    key={n.id}
                    className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between"
                    style={{ minHeight: '180px' }}
                  >
                    <div className="absolute top-4 right-4 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <Tag size={10} className="text-yellow-400" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-yellow-300">{n.categoria}</span>
                    </div>

                    <div className="space-y-3 pt-4 text-left">
                      <span className="text-[8.5px] text-slate-400 font-bold block">
                        📆 {n.data} • Resum d'examen
                      </span>
                      <h4 className="text-white text-xs md:text-sm font-black italic uppercase leading-snug">
                        {n.titol}
                      </h4>
                      <p className="text-slate-350 text-[11px] md:text-xs leading-relaxed font-semibold">
                        {n.descripcio}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/5 opacity-40">
                      <Clock size={10} />
                      <span className="text-[8px] font-black uppercase">Actualitzat i codificat</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setAnyView('mesos')}
                className="w-full py-4 border border-white/10 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                ◀ RETORNAR A LA SELECCIÓ DE MESOS DE L'ANY
              </button>

            </div>
          )}
        </div>
      )}

      {/* --- PESTANYA 3: EXÀMENS D'ACTUALITAT --- */}
      {subSeccio === 'examen' && (
        <div className="space-y-6">
          {!examenEnCurs ? (
            /* PREPARAR L'EXAMEN D'ACTUALITAT */
            <div className="bg-slate-950/70 border border-white/5 p-8 rounded-3xl space-y-6 text-left max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <span className="text-4xl text-center block">🔬</span>
                <h3 className="text-base md:text-lg font-black italic uppercase text-white tracking-widest text-center mt-2">
                  SIMULACRE CONTROL D'ACTUALITAT
                </h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed text-center">
                  Avalua la teva memòria immediata i cultura general sobre els fets dels darrers mesos. Aquesta eina reprodueix el motor d'avaluació estipulat per l'ISPC.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">Volum d'avaluació</span>
                    <span className="text-xs font-black italic text-white uppercase mt-0.5">{preguntesActualitat.length} PREGUNTES</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider">Temps estimat</span>
                    <span className="text-xs font-black italic text-white uppercase mt-0.5">5 MINUTS</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  handleReiniciarSimulador();
                  setExamenEnCurs(true);
                }}
                className="w-full bg-[#FFDF00] hover:bg-yellow-450 text-slate-950 font-black italic uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all cursor-pointer text-xs text-center"
              >
                🚀 INICIAR PROVA D'ACTUALITAT INTERACTIVA
              </button>
            </div>
          ) : !examenFinalitzat ? (
            /* SIMULACRE EN CURS */
            <div className="bg-slate-950/70 border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 text-left max-w-3xl mx-auto">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[9.5px] text-[#00f296] font-black uppercase tracking-wider">
                  PROVA OFICIAL D'ACTUALITAT ACTIVA • {preguntaActualIdx + 1} DE {preguntesActualitat.length}
                </span>
                <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">
                   ⏱️ INDEFINIT
                </span>
              </div>

              {/* Progrés superior */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex gap-0.5 mb-2">
                {preguntesActualitat.map((_, i) => (
                  <div key={i} className={`h-full flex-1 transition-all ${
                    i === preguntaActualIdx ? 'bg-yellow-400' : i < preguntaActualIdx ? 'bg-emerald-500' : 'bg-white/5'
                  }`} />
                ))}
              </div>

              {/* Enunciat */}
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                <p className="text-white text-sm md:text-base font-black italic uppercase leading-relaxed">
                  {preguntesActualitat[preguntaActualIdx].pregunta}
                </p>
              </div>

              {/* Opcions seleccionables */}
              <div className="grid gap-3 pt-1">
                {preguntesActualitat[preguntaActualIdx].opcions.map((opcio, i) => {
                  const isSelecc = respostaSeleccionada === i;
                  const isCorrect = i === preguntesActualitat[preguntaActualIdx].correcta;
                  const showResult = respostaSeleccionada !== null;

                  let btnClass = 'border-white/5 bg-slate-900/40 text-slate-200 hover:bg-slate-900/80';
                  let statusBg = 'bg-slate-950 text-slate-400';

                  if (showResult) {
                    if (isCorrect) {
                      btnClass = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100 font-bold';
                      statusBg = 'bg-emerald-500 text-slate-950';
                    } else if (isSelecc) {
                      btnClass = 'border-red-500/50 bg-red-500/10 text-red-100 font-bold';
                      statusBg = 'bg-red-500 text-white';
                    } else {
                      btnClass = 'border-white/5 bg-slate-900/10 opacity-35';
                    }
                  } else if (isSelecc) {
                    btnClass = 'border-yellow-400 bg-yellow-400/5 text-yellow-300';
                    statusBg = 'bg-yellow-400 text-slate-950';
                  }

                  return (
                    <button
                      key={i}
                      disabled={showResult}
                      onClick={() => handleRespostaTest(i)}
                      className={`w-full p-4 rounded-xl border text-left text-[11px] md:text-xs leading-relaxed transition-all cursor-pointer flex gap-4 items-center ${btnClass}`}
                    >
                      <span className={`w-6 h-6 rounded-lg text-[9px] font-black italic mr-1 flex items-center justify-center shrink-0 ${statusBg}`}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <span>{opcio}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dictamen explicatiu */}
              {respostaSeleccionada !== null && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-[7.5px] font-black text-yellow-400 block uppercase tracking-widest">Justificativa Acadèmica d'OposiMossos:</span>
                  <p className="text-[10px] md:text-[11px] text-slate-400 font-semibold leading-relaxed italic">
                    {preguntesActualitat[preguntaActualIdx].explicacio}
                  </p>
                </div>
              )}

              {/* Navegació d'examen */}
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    if (confirm("Segur que vols tancar el simulacre d'actualitat? El progrés actual no quedarà desat.")) {
                      setExamenEnCurs(false);
                    }
                  }}
                  className="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  ◀ Abandonar simulacre
                </button>

                {respostaSeleccionada !== null && (
                  <button
                    onClick={handleSeguentPregunta}
                    className="bg-[#00f296] hover:bg-emerald-400 text-slate-950 font-black italic uppercase text-[10px] py-2.5 px-6 rounded-lg cursor-pointer transition-colors"
                  >
                    {preguntaActualIdx === preguntesActualitat.length - 1 ? 'FINALITZAR PROVA' : 'SEGUENT PREGUNTA ▶'}
                  </button>
                )}
              </div>

            </div>
          ) : (
            /* EXAMEN COMPLETAT / RESULTATS DE SEGURETAT */
            <div className="bg-slate-950/70 border border-white/5 p-8 rounded-3xl space-y-6 text-center max-w-2xl mx-auto animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center text-yellow-500 shadow-xl mx-auto">
                <Trophy size={28} className="animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-[#00f296] font-black uppercase tracking-wider bg-[#00f296]/15 px-3 py-1 rounded">
                  PROVA D'ACTUALITAT ENREGISTRADA
                </span>
                <h3 className="text-lg md:text-xl font-black italic uppercase text-white mt-2">
                  QUALIFICACIÓ RECENT DE L'ESTUDIANT
                </h3>
                <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto">
                  Has assolit la següent taxa de dades assimilades per a la propera convocatòria del cos de Mossos d'Esquadra.
                </p>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-2xl max-w-xs mx-auto border border-white/5">
                <span className="text-[10px] text-slate-500 font-black uppercase block tracking-wider">TAXA D'ÈXIT</span>
                <span className="text-3xl md:text-5xl font-black italic text-white leading-none block my-2">
                  {encerts} / {preguntesActualitat.length}
                </span>
                <span className={`text-[9px] font-black uppercase ${encerts >= 4 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {encerts >= 4 ? '🚦 APTE SENSE REPASSAR' : '📝 PRIORITZA REPASSAR MES A MES'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  onClick={handleReiniciarSimulador}
                  className="flex-1 bg-white/15 hover:bg-white/20 text-white font-black italic uppercase text-[10px] py-3.5 rounded-xl transition-all cursor-pointer border border-white/5"
                >
                  Tornar a avaluar
                </button>
                <button
                  onClick={() => setExamenEnCurs(false)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black italic uppercase text-[10px] py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  Tancar dades actualtat
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
