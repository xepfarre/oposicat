import { useState, useEffect } from "react";
import { ChevronLeft, BarChart3, Target, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Check } from "lucide-react";
import { TEMARI_DETALL } from "../../../../constants/temari";
import { db, auth } from "../../../../lib/firebase";
import { collection, getDocs, doc, getDoc, writeBatch, setDoc } from "firebase/firestore";

/**
 * PANTALLA: ExamensOposimossosInici
 * Pantalla de selecció d'exàmens per blocs i subtemes.
 * Basat en el disseny "Paint" enviat per l'usuari.
 */

export default function ExamensOposimossosInici({ 
  onTornar, 
  onComencar 
}: { 
  onTornar: () => void;
  onComencar: (num: number, temps: string, seleccions: { [key: string]: number[] }) => void;
}) {
  // Comprovació i estats per a la càrrega de dades d'analítica realment persistida
  const [loadingStats, setLoadingStats] = useState(true);
  const [totalEncerts, setTotalEncerts] = useState(0);
  const [totalErrades, setTotalErrades] = useState(0);
  const [resetConfirm, setResetConfirm] = useState(false);
  
  // Guardem l'objecte complet de dades per al millor i pitjor tema de l'opositor
  const [millorTema, setMillorTema] = useState<{ id: string, name: string, percent: number, encertades: number, totals: number } | null>(null);
  const [pitjorTema, setPitjorTema] = useState<{ id: string, name: string, percent: number, encertades: number, totals: number } | null>(null);

  // Comentari planer per a no-programadors:
  // Converteix una clau de tema de la base de dades (com 'tema_1.2') en el seu títol de la llista TEMARI_DETALL.
  const formatTemaNom = (temaKey: string) => {
    const parts = temaKey.replace('tema_', '').split('.');
    if (parts.length === 2) {
      const ambitCodi = parts[0] === '1' ? 'A' : parts[0] === '2' ? 'B' : 'C';
      const indexNum = parseInt(parts[1], 10) - 1;
      const temesDelBloc = TEMARI_DETALL[ambitCodi as 'A' | 'B' | 'C'];
      if (temesDelBloc && temesDelBloc[indexNum]) {
        return temesDelBloc[indexNum].titol;
      }
      return `Àmbit ${ambitCodi} • Tema ${parts[1]}`;
    }
    return temaKey;
  };

  // Comentari planer per a no-programadors:
  // Carrega les dades en directe només obrir la pantalla del progrés.
  // Es demanen (1) les respostes totals que té registrades l'estudiant i (2) l'inventari virtual 'comptadors/temari' on s'emmagatzema el denominador (totals per tema).
  useEffect(() => {
    const carregarEstadistiquesReals = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoadingStats(false);
        return;
      }

      try {
        // 1. Llegim el document d'inventari 'comptadors/temari' on estan desats els números de preguntes de cada tema
        const comptadorRef = doc(db, 'comptadors', 'temari');
        const comptadorSnap = await getDoc(comptadorRef);
        const totalsTemes = comptadorSnap.exists() ? comptadorSnap.data() : {};

        // 2. Comentari planer per a no-programadors:
        // Intentem carregar primer la foto resum pre-agregada de l'estudiant de forma instantània.
        // Si no existeix (Inicialització Gradual!), el document és nul o no s'ha creat mai. En aquest cas, demanem la col·lecció completa antiga com a fallback automàtic, 
        // o si tampoc té respostes, s'inicialitza tot a zero (0) sense problemes ni errors visuals per garantir que mai falli.
        const statsRef = doc(db, `usuaris/${user.uid}/estadistiques`, "totals");
        const statsSnap = await getDoc(statsRef);

        let encertsNum = 0;
        let erradesNum = 0;

        // Mapejos on acumularem quantes preguntes té l'usuari correctament encertades per tema i intents totals
        const encertatsPerTema: { [key: string]: number } = {};
        const intentsPerTema: { [key: string]: number } = {};

        if (statsSnap.exists()) {
          const statsData = statsSnap.data() || {};
          encertsNum = statsData.totalEncerts || 0;
          erradesNum = statsData.totalErrades || 0;
          
          Object.keys(statsData).forEach(key => {
            if (key.startsWith('intents_tema_')) {
              const temaKey = key.replace('intents_', '');
              intentsPerTema[temaKey] = statsData[key] || 0;
            }
            if (key.startsWith('correctes_tema_')) {
              const temaKey = key.replace('correctes_', '');
              encertatsPerTema[temaKey] = statsData[key] || 0;
            }
          });
        } else {
          // Fallback: com que no té el document d'estadístiques totals (Inicialització Gradual),
          // llegim les respostes individuals de l'estudiant per si té històric antic i reconstruïm els totals.
          const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
          const respostesSnap = await getDocs(respostesRef);

          respostesSnap.docs.forEach(docSnap => {
            const d = docSnap.data();
            const esEncertada = !!d.encertada;

            if (esEncertada) {
              encertsNum++;
            } else {
              erradesNum++;
            }

            // Agrupació per temes de cara al ràtio de percentatge
            if (d.ambit !== undefined && d.tema !== undefined) {
              const ambitMap: { [key: string]: number } = { A: 1, B: 2, C: 3 };
              const ambitId = ambitMap[d.ambit] || 1;
              const temaVisual = parseInt(d.tema.toString(), 10) + 1;
              const temaKey = `tema_${ambitId}.${temaVisual}`;

              intentsPerTema[temaKey] = (intentsPerTema[temaKey] || 0) + 1;
              if (esEncertada) {
                const prevValue = encertatsPerTema[temaKey] || 0;
                encertatsPerTema[temaKey] = prevValue + 1;
              }
            }
          });

          // Si té dades històriques, l'auto-sincronitzem asíncronament de cara al futur
          if (respostesSnap.size > 0) {
            const upObj: any = {
              totalRespostes: encertsNum + erradesNum,
              totalEncerts: encertsNum,
              totalErrades: erradesNum
            };
            Object.keys(intentsPerTema).forEach(k => {
              upObj[`intents_${k}`] = intentsPerTema[k];
            });
            Object.keys(encertatsPerTema).forEach(k => {
              upObj[`correctes_${k}`] = encertatsPerTema[k];
            });
            setDoc(statsRef, upObj, { merge: true }).catch(err => {
              console.warn("No s'han pogut pré-agregar les estadístiques antigues d'OposiCAT per a exàmens:", err);
            });
          }
        }

        setTotalEncerts(encertsNum);
        setTotalErrades(erradesNum);

        // 3. Càlcul del % d'encert de cadascun dels temes actius per resoldre quin és el millor i pitjor tema.
        // Comentari planer per a no-programadors:
        // Ara calculem els millors i pitjors temes basant-nos en les respostes que REALMENT ha intentat cada estudiant,
        // garantint que si té intents, aquests temes es mostrin. Evitem que quedi 'Per determinar' si només s'hi han registrat errors.
        let millor: typeof millorTema = null;
        let pitjor: typeof pitjorTema = null;

        Object.keys(intentsPerTema).forEach(temaKey => {
          const totalIntentsTema = intentsPerTema[temaKey] || 0;
          if (totalIntentsTema > 0) {
            const encertatsUsuari = encertatsPerTema[temaKey] || 0;
            const percent = Number(((encertatsUsuari / totalIntentsTema) * 100).toFixed(1));

            // Resolem el millor tema (per favor de ràtio)
            if (!millor || percent > millor.percent) {
              millor = {
                id: temaKey,
                name: formatTemaNom(temaKey),
                percent: percent,
                encertades: encertatsUsuari,
                totals: totalIntentsTema
              };
            } else if (millor && percent === millor.percent) {
              // En cas d'empat de percentatges, mostrem el tema que contingui major densitat de volum
              if (totalIntentsTema > millor.totals) {
                millor = {
                  id: temaKey,
                  name: formatTemaNom(temaKey),
                  percent: percent,
                  encertades: encertatsUsuari,
                  totals: totalIntentsTema
                };
              }
            }

            // Resolem el pitjor tema
            if (!pitjor || percent < pitjor.percent) {
              pitjor = {
                id: temaKey,
                name: formatTemaNom(temaKey),
                percent: percent,
                encertades: encertatsUsuari,
                totals: totalIntentsTema
              };
            } else if (pitjor && percent === pitjor.percent) {
              // En cas d'empat d'equivalent percentatge, usem el tema que contingui més volum actiu
              if (totalIntentsTema > pitjor.totals) {
                pitjor = {
                  id: temaKey,
                  name: formatTemaNom(temaKey),
                  percent: percent,
                  encertades: encertatsUsuari,
                  totals: totalIntentsTema
                };
              }
            }
          }
        });

        setMillorTema(millor);
        setPitjorTema(pitjor);

      } catch (err) {
        console.error("Error calculant l'anàlisi de rendiment teòric des d'exàmens:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    carregarEstadistiquesReals();
  }, []);

  // Comentari planer per a no-programadors:
  // Funció que escombra el progrés en directe quan l'opositor confirma que vol reiniciar les dades.
  const handleResetEstadistiques = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoadingStats(true);
    try {
      const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
      const respostesSnap = await getDocs(respostesRef);
      
      const batch = writeBatch(db);
      respostesSnap.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });

      // Comentari planer per a no-programadors:
      // Aprofitem el mateix batch d'operacions per esborrar també el sumari resum a fi que s'inicialitzi gradualment des de zero el proper cop.
      const statsRef = doc(db, `usuaris/${user.uid}/estadistiques`, "totals");
      batch.delete(statsRef);

      await batch.commit();

      setTotalEncerts(0);
      setTotalErrades(0);
      setMillorTema(null);
      setPitjorTema(null);
      setResetConfirm(false);
    } catch (err) {
      console.error("Error esborrant historial:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Estats per a la selecció de l'usuari
  const [tab, setTab] = useState<'errades' | 'examen'>('examen');
  const [seleccions, setSeleccions] = useState<{ [key: string]: number[] }>({
    A: [],
    B: [],
    C: []
  });

  // Estat per controlar quins blocs estan desplegats
  const [blocsOberts, setBlocsOberts] = useState<{ [key: string]: boolean }>({
    A: true,
    B: false,
    C: false
  });

  // Estats per al Modal de configuració
  const [showConfig, setShowConfig] = useState(false);
  const [numPreguntes, setNumPreguntes] = useState<number>(30);
  const [temps, setTemps] = useState<string>('45');

  // Dades de la estructura del temari (Blocks) - Ara amb títols reals
  const BLOCS = [
    { 
      id: 'A', 
      nom: 'Àmbit A: Coneixements de l\'entorn', 
      temes: TEMARI_DETALL.A.map((t, i) => ({ id: i + 1, titol: t.titol })) 
    },
    { 
      id: 'B', 
      nom: 'Àmbit B: Institucional', 
      temes: TEMARI_DETALL.B.map((t, i) => ({ id: i + 1, titol: t.titol })) 
    },
    { 
      id: 'C', 
      nom: 'Àmbit C: Seguretat i Policia', 
      temes: TEMARI_DETALL.C.map((t, i) => ({ id: i + 1, titol: t.titol })) 
    },
  ];

  // Funció per toggle de tema
  const toggleTema = (blocId: string, temaId: number) => {
    setSeleccions(prev => {
      const actuals = prev[blocId];
      if (actuals.includes(temaId)) {
        return { ...prev, [blocId]: actuals.filter(t => t !== temaId) };
      } else {
        return { ...prev, [blocId]: [...actuals, temaId] };
      }
    });
  };

  // Funció per seleccionar tots els d'un bloc
  const toggleTots = (e: React.MouseEvent, blocId: string, temesIds: number[]) => {
    e.stopPropagation(); // Evitem desplegar/plegar el bloc al fer clic a "Tots"
    setSeleccions(prev => {
      const actuals = prev[blocId];
      if (actuals.length === temesIds.length) {
        return { ...prev, [blocId]: [] };
      } else {
        return { ...prev, [blocId]: [...temesIds] };
      }
    });
  };

  // Toggle desplegable de bloc
  const toggleBloc = (blocId: string) => {
    setBlocsOberts(prev => ({ ...prev, [blocId]: !prev[blocId] }));
  };

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full max-w-lg md:max-w-4xl flex flex-col items-center shrink-0 text-center mb-4 relative">
        
        {/* FILA 1: BOTÓ ENRERA + LOGO */}
        <div className="w-full flex items-center justify-center relative mb-8">
          <button 
            onClick={onTornar}
            className="absolute left-0 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="bg-black/30 backdrop-blur-md px-10 py-3 rounded-[1.5rem] shadow-xl border border-white/10">
            <h1 className="text-2xl font-black italic tracking-tighter select-none">
              <span className="text-white">Oposi </span>
              <span className="text-red-500">Mossos</span>
            </h1>
          </div>
        </div>

        {/* FILA 2: TITOL SECCIO + RATLLA */}
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-lg font-black italic tracking-widest text-white uppercase mb-1">
            Exàmens Oposimossos
          </h2>
          <div className="w-12 h-1 bg-red-600 rounded-full" />
        </div>
      </header>

      <main className="w-full max-w-md flex flex-col gap-8 mt-4">
        
        {/* SECCIÓ ESTADÍSTIQUES (Segons l'últim croquis de l'usuari) */}
        <section className="flex flex-col gap-4 w-full">
          <h3 className="text-xs font-black italic uppercase tracking-widest text-white/50 ml-4 mb-[-8px]">
            Resum dels examens :
          </h3>

          {/* CONTENIDOR 1: ENCERTS | ERRADES | RESET */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-3 grid grid-cols-[1fr_1fr_64px] items-center gap-1 shadow-xl">
            <div className="flex items-center justify-center gap-2 border-r border-white/10 h-full py-1">
              <span className="text-[9px] font-bold text-white/40 italic uppercase">Encerts:</span>
              <span className="text-xl font-black italic text-emerald-400">
                {loadingStats ? "..." : totalEncerts}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 border-r border-white/10 h-full py-1">
              <span className="text-[9px] font-bold text-white/40 italic uppercase">Errades:</span>
              <span className="text-xl font-black italic text-red-500">
                {loadingStats ? "..." : totalErrades}
              </span>
            </div>

            {resetConfirm ? (
              <button 
                onClick={handleResetEstadistiques}
                className="flex flex-col items-center justify-center h-full gap-0.5 text-red-400 hover:text-red-300 transition-all active:scale-95 cursor-pointer"
              >
                <Check size={14} className="animate-pulse" />
                <span className="text-[6px] font-black italic uppercase text-center leading-tight">Segur?</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  setResetConfirm(true);
                  // Després de 4 segons torna a canviar el botó de Restablir per prevenir tocs accidentals.
                  setTimeout(() => setResetConfirm(false), 4000);
                }}
                className="flex flex-col items-center justify-center h-full gap-0.5 group transition-all active:scale-90 cursor-pointer"
              >
                <RefreshCw size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                <span className="text-[7px] font-black italic uppercase text-white/25 text-center leading-tight">Reset</span>
              </button>
            )}
          </div>

          {/* CONTENIDOR 2: MILLOR | PITJOR TEMA */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-3 px-4 flex flex-col gap-1.5 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[9px] font-bold text-white/40 italic uppercase shrink-0">El meu millor tema :</span>
              <span className="text-[11px] font-black italic text-emerald-400 tracking-tight truncate max-w-[180px] text-right">
                {loadingStats ? "Carregant..." : (millorTema ? millorTema.name : 'Per determinar')}
              </span>
            </div>
            
            <div className="h-[1px] w-full bg-white/5" />

            <div className="flex items-center justify-between gap-4">
              <span className="text-[9px] font-bold text-white/40 italic uppercase shrink-0">He de millorar en :</span>
              <span className="text-[11px] font-black italic text-red-500 tracking-tight truncate max-w-[180px] text-right">
                {loadingStats ? "Carregant..." : (pitjorTema ? pitjorTema.name : 'Per determinar')}
              </span>
            </div>
          </div>
        </section>

        {/* TABS (Examen | Preguntes Errades) - Estil compacte i color blau fosc */}
        <div className="flex w-full bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
          {/* Botó EXAMEN (A l'esquerra, seleccionat per defecte) */}
          <button 
            onClick={() => setTab('examen')}
            className={`flex-1 py-2.5 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all ${
              tab === 'examen' 
              ? 'bg-emerald-500 text-[#00274d] shadow-lg shadow-emerald-500/20' 
              : 'text-white/30 hover:text-white/60'
            }`}
          >
            Examen
          </button>
          
          {/* Botó PREGUNTES ERRADES (A la dreta) */}
          <button 
            onClick={() => setTab('errades')}
            className={`flex-1 py-2.5 rounded-xl font-black italic uppercase text-[9px] tracking-widest transition-all ${
              tab === 'errades' 
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
              : 'text-white/30 hover:text-white/60'
            }`}
          >
            Preguntes errades
          </button>
        </div>

        {/* CONTINGUT CONDICIONAL: Depèn de quina pestanya hem seleccionat a dalt */}
        {tab === 'examen' ? (
          /* SI SELECCIONEM "EXAMEN": Mostrem la llista de blocs i temes */
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* TEXT INSTRUCTIU */}
            <div className="text-center w-full">
              <p className="text-[10px] font-bold text-white/30 italic uppercase tracking-widest">
                Desplega el bloc que vulguis provar i selecciona el tema!
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {BLOCS.map(bloc => (
                <div key={bloc.id} className="flex flex-col gap-2">
                  {/* CAPÇALERA DEL BLOC (Ara és un div per evitar botons niats) */}
                  <div 
                    className="w-full bg-black/30 backdrop-blur-md border border-white/10 rounded-xl flex items-stretch justify-between overflow-hidden shadow-xl"
                  >
                    {/* Àrea clickable principal per desplegar el bloc */}
                    <button 
                      onClick={() => toggleBloc(bloc.id)}
                      className="flex-1 p-4 flex items-center justify-between transition-all group hover:bg-white/5 text-left"
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] font-black italic uppercase tracking-[0.2em] text-white/30 leading-none">
                          Bloc {bloc.id}
                        </span>
                        <h3 className="font-black italic uppercase text-xs text-white tracking-tight leading-tight">
                          {bloc.nom.split(': ')[1]}
                        </h3>
                      </div>
                      
                      <div className="text-white/20 mr-2">
                        {blocsOberts[bloc.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>
                    
                    {/* Separador i Botó "Tots" */}
                    <div className="flex items-center gap-0">
                      <div className="h-10 w-[1px] bg-white/10" />
                      <button 
                        onClick={(e) => toggleTots(e, bloc.id, bloc.temes.map(t => t.id))}
                        className={`px-4 h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all ${
                          seleccions[bloc.id].length === bloc.temes.length
                          ? 'bg-yellow-400 text-[#00274d]'
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Tots
                      </button>
                    </div>
                  </div>

                  {/* LLISTAT DE TEMES (Si està obert) */}
                  {blocsOberts[bloc.id] && (
                    <div className="flex flex-col gap-1.5 px-2 animate-in slide-in-from-top-2 duration-200">
                      {bloc.temes.map(tema => (
                        <button 
                          key={tema.id}
                          onClick={() => toggleTema(bloc.id, tema.id)}
                          className={`w-full p-3 rounded-xl border flex items-center gap-4 transition-all text-left ${
                            seleccions[bloc.id].includes(tema.id)
                            ? 'bg-yellow-400/10 border-yellow-400/40 text-yellow-400 shadow-xl shadow-yellow-400/5'
                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-6 h-6 flex items-center justify-center rounded-lg border font-black text-[10px] shrink-0 transition-all ${
                            seleccions[bloc.id].includes(tema.id)
                            ? 'bg-yellow-400 text-[#00274d] border-yellow-400'
                            : 'bg-white/5 border-white/10 text-white/20'
                          }`}>
                            {tema.id}
                          </div>
                          <span className={`text-[11px] font-bold italic truncate leading-tight ${
                            seleccions[bloc.id].includes(tema.id) ? 'text-white' : ''
                          }`}>
                            {tema.titol}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* BOTÓ COMENÇAR EXAMEN - Obre el modal de configuració */}
            <button 
              onClick={() => setShowConfig(true)}
              disabled={Object.values(seleccions).flat().length === 0}
              className={`w-full rounded-3xl py-6 font-black italic uppercase tracking-[0.3em] text-lg shadow-2xl active:scale-95 transition-all mt-4 border-b-4 ${
                Object.values(seleccions).flat().length > 0
                ? 'bg-yellow-400 hover:bg-yellow-300 text-[#00274d] shadow-yellow-400/20 border-yellow-600'
                : 'bg-white/5 text-white/10 border-white/5 cursor-not-allowed border-transparent'
              }`}
            >
              Començar
            </button>
          </div>
        ) : (
          /* SI SELECCIONEM "PREGUNTES ERRADES": Mostrem el missatge d'explicació i botó especial */
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Label explicatiu estil blau fosc / glassmorphism */}
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 shadow-xl text-center">
              <p className="text-sm font-bold text-white/80 italic leading-relaxed">
                Dona a <span className="text-red-400">començar</span> per tal de només practicar les preguntes que has errat! Un cop les encertis les convertires en preguntes encertades.
              </p>
            </div>

            {/* Botó començar pràctica d'errades */}
            <button 
              onClick={() => onComencar(20, 'inf', {})} // Configuració per defecte per a errades
              className="w-full bg-red-500 hover:bg-red-400 text-white rounded-3xl py-6 font-black italic uppercase tracking-[0.3em] text-lg shadow-2xl shadow-red-500/20 active:scale-95 transition-all border-b-4 border-red-700"
            >
              Començar
            </button>
          </div>
        )}
      </main>

      {/* MODAL DE CONFIGURACIÓ (Pop-up) */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pb-20">
          <div className="absolute inset-0 bg-[#001a33]/90 backdrop-blur-md" onClick={() => setShowConfig(false)} />
          
          <div className="relative w-full max-w-xs bg-[#00274d] border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            
            {/* Recordatori d'examen oficial */}
            <div className="text-center px-4">
              <p className="text-[10px] font-bold text-white/30 italic leading-relaxed">
                " Recorda que 45 minuts i 30 preguntes el que et trobaras el dia de l'examen! "
              </p>
            </div>

            {/* Preguntes */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-black italic uppercase tracking-[0.2em] text-emerald-400 text-center">
                Quantes preguntes vols?
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[10, 30, 100].map((n) => (
                  <button 
                    key={n}
                    onClick={() => setNumPreguntes(n)}
                    className={`py-2.5 rounded-xl font-black italic border transition-all flex items-center justify-center gap-2 text-sm ${
                      numPreguntes === n 
                      ? "bg-yellow-400 border-yellow-400 text-[#00274d] scale-[1.02] shadow-lg shadow-yellow-400/20" 
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {n} {n === 30 && <span className="text-[7px] opacity-70 uppercase tracking-tighter">(Oficial)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Temps */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[10px] font-black italic uppercase tracking-[0.2em] text-emerald-400 text-center">
                Quant de temps vols?
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { label: '10 minuts', val: '10' },
                  { label: '45 minuts', val: '45', official: true },
                  { label: 'Indefinit', val: 'inf' }
                ].map((t) => (
                  <button 
                    key={t.val}
                    onClick={() => setTemps(t.val)}
                    className={`py-2.5 rounded-xl font-black italic border transition-all flex items-center justify-center gap-2 text-sm ${
                      temps === t.val 
                      ? "bg-white/20 border-white/30 text-white scale-[1.02] shadow-lg shadow-white/10" 
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {t.label} {t.official && <span className="text-[7px] text-yellow-400 uppercase tracking-tighter">(Oficial)</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Botó final */}
            <button 
              onClick={() => {
                setShowConfig(false);
                onComencar(numPreguntes, temps, seleccions);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#00274d] rounded-xl py-4 font-black italic uppercase tracking-[0.2em] text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              Comença
            </button>
            
          </div>
        </div>
      )}

      <footer className="mt-12 opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">
          OposiMossos • Sistema d'Exàmens
        </p>
      </footer>

    </div>
  );
}
