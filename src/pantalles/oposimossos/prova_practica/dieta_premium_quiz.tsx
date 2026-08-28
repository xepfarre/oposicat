import { useState, useMemo } from "react";
import { ChevronLeft, Check, ArrowRight, RotateCcw, Calculator, Sparkles, Loader2, Apple, Scale, Dumbbell, AlertTriangle, ShieldCheck } from "lucide-react";
import CalculadoraDieta from "./calculadora_dieta";
import { auth, db, handleFirestoreError, OperationType } from "../../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

// Explicació per a no-programadors: Importem la mateixa imatge de fons per a l'aplicació (Dieta_APP.png) per mantenir el disseny unificat i coherent
// @ts-ignore
import fonsDieta from "../../../assets/images/Dieta_APP.png";

export default function DietaPremiumQuiz({ 
  onTornar,
  onAnarSeccio
}: { 
  onTornar: () => void;
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void;
}) {
  // Explicació per a no-programadors: Gestionem el pas actual del qüestionari.
  // Pas 0: Benvinguda
  // Pas 1: Dades Corporals (Edat, Gènere, Alçada, Pes)
  // Pas 2: Entrenament i Règim Diari (Activitat Diària, Dies d'Entrenament)
  // Pas 3: L'Objectiu de la Convocatòria
  // Pas 4: Filtres i Intoleràncies Alimentàries
  // Pas 5: Resum de Dades, Fórmules i Avís Legal de Seguretat
  // Pas 6: Pantalla de la Calculadora de Dietes
  const [currentStep, setCurrentStep] = useState(0);

  // Explicació per a no-programadors: Estats del formulari per recollir cada dada de l'estudiant
  const [edat, setEdat] = useState<string>("");
  const [genere, setGenere] = useState<"home" | "dona" | "">("");
  const [alcada, setAlcada] = useState<string>(""); // en cm
  const [pes, setPes] = useState<string>(""); // en kg

  // Pas 2
  const [activitatDiaria, setActivitatDiaria] = useState<"sedentari" | "lleuger" | "actiu" | "">("");
  const [diesEntrenament, setDiesEntrenament] = useState<string>("");

  // Pas 3
  const [objectiu, setObjectiu] = useState<"perdua_greix" | "manteniment" | "guany_forca" | "">("");

  // Pas 4
  const [estilVida, setEstilVida] = useState<"omnivor" | "vegetaria" | "vega" | "">("");
  const [intoleranciaGluten, setIntoleranciaGluten] = useState<boolean>(false);
  const [intoleranciaLactosa, setIntoleranciaLactosa] = useState<boolean>(false);
  const [intoleranciaFruitsSecs, setIntoleranciaFruitsSecs] = useState<boolean>(false);

  // Pas 5: Avís legal i confirmació d'esforç esportiu
  const [acceptoTermes, setAcceptoTermes] = useState<boolean>(false);

  // Estats auxiliars d'interfície
  const [guardant, setGuardant] = useState(false);
  const [errorEnviament, setErrorEnviament] = useState("");

  // Explicació per a no-programadors: Aquesta funció realitza els càlculs segons les directrius exactes rebudes de rendiment de Mossos
  const calculsTotals = useMemo(() => {
    const pesNum = parseFloat(pes);
    const alcadaNum = parseFloat(alcada);
    const edatNum = parseInt(edat);

    if (isNaN(pesNum) || isNaN(alcadaNum) || isNaN(edatNum) || !genere) {
      return null;
    }

    // 1. Índex de Massa Corporal (IMC)
    const alcadaMetres = alcadaNum / 100;
    const imc = pesNum / (alcadaMetres * alcadaMetres);

    // 2. Índex Metabòlic Basal (IMB) segons gènere
    let imb = 0;
    if (genere === "home") {
      imb = (10 * pesNum) + (6.25 * alcadaNum) - (5 * edatNum) + 5;
    } else {
      imb = (10 * pesNum) + (6.25 * alcadaNum) - (5 * edatNum) - 161;
    }

    // 3. Calories Totals Diàries segons Factor d'Activitat
    let factor = 1.375; // per defecte (Lleuger)
    if (activitatDiaria === "sedentari") {
      factor = 1.2;
    } else if (activitatDiaria === "lleuger") {
      factor = 1.375;
    } else if (activitatDiaria === "actiu") {
      factor = 1.55;
    }

    const kcalBase = imb * factor;
    let kcalTotals = kcalBase;

    // Ajust per objectiu de la convocatòria
    if (objectiu === "perdua_greix") {
      kcalTotals = kcalBase - 400;
    } else if (objectiu === "guany_forca") {
      kcalTotals = kcalBase + 300;
    }

    // 4. Repartiment de Macronutrients (Macros)
    // Proteïnes = 2g per cada kg de pes (4 kcal per gram)
    const protesGrams = 2 * pesNum;
    const protesKcal = protesGrams * 4;

    // Greixos = 25% de les KCAL totals diàries (9 kcal per gram)
    const greixosKcal = kcalTotals * 0.25;
    const greixosGrams = greixosKcal / 9;

    // Carbohidrats = La resta de les calories dividida entre 4 (4 kcal per gram)
    const carbsKcal = kcalTotals - protesKcal - greixosKcal;
    const carbsGrams = carbsKcal > 0 ? carbsKcal / 4 : 0;

    return {
      imc: Number(imc.toFixed(1)),
      imb: Math.round(imb),
      kcal: Math.round(kcalTotals),
      protes: Math.round(protesGrams),
      greixos: Math.round(greixosGrams),
      carbs: Math.round(carbsGrams)
    };
  }, [pes, alcada, edat, genere, activitatDiaria, objectiu]);

  // Explicació per a no-programadors: Funció que desa les dades completades i els macronutrients personalitzats a Firestore
  const handleCalcularDieta = async () => {
    const user = auth.currentUser;
    if (!acceptoTermes) {
      setErrorEnviament("És obligatori acceptar l'avís legal per poder calcular la dieta.");
      return;
    }

    if (user && calculsTotals) {
      setGuardant(true);
      setErrorEnviament("");
      try {
        const dadesRef = doc(db, "usuaris", user.uid, "dades_dietes", "dades");
        await setDoc(dadesRef, {
          userId: user.uid,
          edat: parseInt(edat),
          genere,
          alcada: parseFloat(alcada),
          pes: parseFloat(pes),
          activitatDiaria,
          diesEntrenament,
          objectiu,
          estilVida,
          intolerancies: {
            gluten: intoleranciaGluten,
            lactosa: intoleranciaLactosa,
            fruitsSecs: intoleranciaFruitsSecs
          },
          calculs: calculsTotals,
          completat: true,
          actualitzatEl: new Date().toISOString(),
          creatEl: new Date().toISOString()
        }, { merge: true });
        
        setCurrentStep(6);
      } catch (err) {
        console.error("Error guardant dades de dieta de l'usuari:", err);
        setErrorEnviament("No s'han pogut desar les dades de dieta a Firestore. Comprova la teva connexió.");
        handleFirestoreError(err, OperationType.WRITE, `usuaris/${user.uid}/dades_dietes/dades`);
      } finally {
        setGuardant(false);
      }
    } else {
      // Si és un usuari convidat o no tenim dades de càlcul correctes, simplement passem a la calculadora
      setCurrentStep(6);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validació ràpida del Pas 1
      if (!edat || !genere || !alcada || !pes) {
        alert("Si us plau, emplena totes les teves dades corporals bàsiques.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!activitatDiaria || !diesEntrenament) {
        alert("Si us plau, respon les preguntes d'entrenament i activitat diària.");
        return;
      }
    }
    if (currentStep === 3) {
      if (!objectiu) {
        alert("Si us plau, tria un objectiu per a la teva convocatòria.");
        return;
      }
    }
    if (currentStep === 4) {
      if (!estilVida) {
        alert("Si us plau, selecciona el teu estil de vida alimentari.");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const resetQuiz = () => {
    setCurrentStep(1);
    setEdat("");
    setGenere("");
    setAlcada("");
    setPes("");
    setActivitatDiaria("");
    setDiesEntrenament("");
    setObjectiu("");
    setEstilVida("");
    setIntoleranciaGluten(false);
    setIntoleranciaLactosa(false);
    setIntoleranciaFruitsSecs(false);
    setAcceptoTermes(false);
    setErrorEnviament("");
  };

  // Explicació per a no-programadors: Si estem al pas 6, renderitzem directament la calculadora de dieta passant el callback per poder reiniciar
  if (currentStep === 6) {
    return (
      <CalculadoraDieta 
        onTornar={() => {
          // Si l'estudiant vol refer les dades, posem el pas final per permetre-li modificar les dades desades
          setCurrentStep(5);
        }} 
        onAnarSeccio={onAnarSeccio} 
      />
    );
  }

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-20" style={{ WebkitOverflowScrolling: "touch" }}>
      
      {/* Explicació per a no-programadors: Imatge de fons de les dietes de l'acadèmia estil vidre translúcid */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src={fonsDieta} 
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-70 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#00274d]/50 to-[#00274d]/98" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* CAPÇALERA DE COMPROMÍS ESPORTIU */}
        {/* Explicació per a no-programadors: A la capçalera col·loquem el títol "Dieta" en gran i negreta centrat només quan l'usuari és al pas inicial, i l'indicador de progrés quan està responent */}
        <header className="pt-8 w-full flex flex-col items-center gap-4 pb-6 md:max-w-xl md:mx-auto">
          <div className="flex items-center justify-between w-full">
            <button 
              onClick={currentStep === 0 ? onTornar : handlePrevStep}
              className="w-10 h-10 rounded-full bg-[#001f3d]/30 backdrop-blur-md flex items-center justify-center text-white/70 border border-white/15 hover:bg-[#00274d]/40 transition-all active:scale-90"
              id="btn_quiz_tornar"
            >
              <ChevronLeft size={20} />
            </button>
            
            {currentStep === 0 ? (
              <span className="text-lg font-black italic uppercase tracking-wider text-white">Dieta</span>
            ) : (
              <div className="flex gap-1.5" id="progress_indicator">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      s === currentStep ? "w-8 bg-emerald-400" : s < currentStep ? "w-4 bg-emerald-400/40" : "w-4 bg-white/10"
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="w-10" />
          </div>
        </header>

        {/* PAS 0: PANTALLA D'INICI (BENVINGUDA I PROPÒSIT) */}
        {/* Explicació per a no-programadors: Es tracta de la pantalla inicial molt directa i neta, amb el nou format sol·licitat */}
        {currentStep === 0 && (
          <main className="w-full max-w-md flex flex-col gap-8 animate-fade-in text-center py-6" id="quiz_pas_0">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-lg backdrop-blur-md">
              <Apple size={40} className="text-emerald-400" />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400 italic">
                CONFIGURACIÓ INICIAL
              </span>
              <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                Ajusta els teus <span className="text-emerald-400">MACROS</span>
              </h1>
              <p className="text-xs md:text-sm text-white/75 leading-relaxed italic px-2 mt-2">
                Respon 4 preguntes ràpides per adaptar automàticament els teus macronutrients a les proves de Course Navette, Circuit i Press de Banca. Ajustarem les teves KCAL, greixos, proteïnes i carbohidrats a les teves necessitats.
              </p>
            </div>

            <button 
              onClick={() => setCurrentStep(1)}
              className="w-full bg-emerald-500 text-[#00274d] rounded-2xl py-5 font-black italic uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition-all text-xs md:text-sm mt-4"
              id="btn_quiz_comencar"
            >
              <Sparkles size={18} />
              Començar qüestionari
            </button>
          </main>
        )}

        {/* PAS 1: DADES CORPORALS */}
        {currentStep === 1 && (
          <main className="w-full max-w-md flex flex-col gap-6 animate-fade-in" id="quiz_pas_1">
            <div className="flex flex-col gap-1 text-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Pas 1 de 5</span>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Dades Corporals de l'Opositor</h2>
              <p className="text-xs text-white/55 italic">Introdueix els teus paràmetres antropomètrics bàsics per determinar la teva taxa metabòlica inicial.</p>
            </div>

            <div className="bg-[#001c38]/25 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col gap-5 shadow-xl">
              
              {/* Selecció de Gènere */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/50 italic">Gènere Biològic</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGenere("home")}
                    className={`py-3.5 rounded-xl font-black italic uppercase text-xs tracking-wider border transition-all ${
                      genere === "home"
                        ? "bg-emerald-500 text-[#00274d] border-emerald-500 shadow-md"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    Home
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenere("dona")}
                    className={`py-3.5 rounded-xl font-black italic uppercase text-xs tracking-wider border transition-all ${
                      genere === "dona"
                        ? "bg-emerald-500 text-[#00274d] border-emerald-500 shadow-md"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    Dona
                  </button>
                </div>
              </div>

              {/* Input d'Edat */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/50 italic">Edat (Anys)</label>
                <input
                  type="number"
                  placeholder="Ex: 27"
                  min="18"
                  max="65"
                  value={edat}
                  onChange={(e) => setEdat(e.target.value)}
                  className="w-full bg-[#001f3d]/30 border border-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 font-bold focus:outline-none"
                />
              </div>

              {/* Input d'Alçada */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/50 italic">Alçada (en cm)</label>
                <input
                  type="number"
                  placeholder="Ex: 175"
                  min="120"
                  max="230"
                  value={alcada}
                  onChange={(e) => setAlcada(e.target.value)}
                  className="w-full bg-[#001f3d]/30 border border-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 font-bold focus:outline-none"
                />
              </div>

              {/* Input de Pes */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/50 italic">Pes actual (en kg)</label>
                <input
                  type="number"
                  placeholder="Ex: 74.5"
                  min="40"
                  max="160"
                  step="0.1"
                  value={pes}
                  onChange={(e) => setPes(e.target.value)}
                  className="w-full bg-[#001f3d]/30 border border-white/10 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/30 font-bold focus:outline-none"
                />
              </div>

            </div>

            <button 
              onClick={handleNextStep}
              disabled={!edat || !genere || !alcada || !pes}
              className="w-full bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-[#00274d] rounded-2xl py-4.5 font-black italic uppercase tracking-[0.2em] text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 hover:bg-yellow-300 transition-all mt-2"
              id="btn_pas1_següent"
            >
              Següent Pas
              <ArrowRight size={16} />
            </button>
          </main>
        )}

        {/* PAS 2: ENTRENAMENT I RÈGIM DIARI */}
        {currentStep === 2 && (
          <main className="w-full max-w-md flex flex-col gap-6 animate-fade-in" id="quiz_pas_2">
            <div className="flex flex-col gap-1 text-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Pas 2 de 5</span>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Entrenament i Règim Diari</h2>
              <p className="text-xs text-white/55 italic">El teu desgast calòric canvia segons la teva feina i la periodització dels teus entrenaments.</p>
            </div>

            <div className="flex flex-col gap-5">
              
              {/* Pregunta 1: Activitat Diària */}
              <div className="bg-[#001c38]/25 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex flex-col gap-3 shadow-xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 italic">Activitat diària fora del gimnàs</span>
                
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActivitatDiaria("sedentari")}
                    className={`p-4 rounded-xl border flex flex-col items-start gap-1 text-left backdrop-blur-md transition-all ${
                      activitatDiaria === "sedentari"
                        ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <span className="font-black italic uppercase text-xs">Sedentari / Estudiant</span>
                    <span className="text-[10px] text-white/50 leading-relaxed italic">Estudi continuat a la biblioteca o treball assegut amb desplaçaments mínims.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivitatDiaria("lleuger")}
                    className={`p-4 rounded-xl border flex flex-col items-start gap-1 text-left backdrop-blur-md transition-all ${
                      activitatDiaria === "lleuger"
                        ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <span className="font-black italic uppercase text-xs">Activitat Moderada</span>
                    <span className="text-[10px] text-white/50 leading-relaxed italic">Estudi amb feina de peu, desplaçaments a peu habituals o vendes al detall.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivitatDiaria("actiu")}
                    className={`p-4 rounded-xl border flex flex-col items-start gap-1 text-left backdrop-blur-md transition-all ${
                      activitatDiaria === "actiu"
                        ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <span className="font-black italic uppercase text-xs">Altament Actiu</span>
                    <span className="text-[10px] text-white/50 leading-relaxed italic">Feines d'esforç físic com seguretat privada, construcció o entrenaments diaris dobles.</span>
                  </button>
                </div>
              </div>

              {/* Pregunta 2: Freqüència entrenament Mossos */}
              <div className="bg-[#001c38]/25 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex flex-col gap-3 shadow-xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 italic">Dies d'entrenament de proves físiques</span>
                
                <div className="grid grid-cols-3 gap-2">
                  {["1-2 dies", "3-4 dies", "5+ dies"].map((opcio) => (
                    <button
                      key={opcio}
                      type="button"
                      onClick={() => setDiesEntrenament(opcio)}
                      className={`py-3.5 rounded-xl font-black italic uppercase text-[10px] tracking-wider border text-center transition-all ${
                        diesEntrenament === opcio
                          ? "bg-emerald-500 text-[#00274d] border-emerald-500 shadow-md"
                          : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      {opcio}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <button 
              onClick={handleNextStep}
              disabled={!activitatDiaria || !diesEntrenament}
              className="w-full bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-[#00274d] rounded-2xl py-4.5 font-black italic uppercase tracking-[0.2em] text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 hover:bg-yellow-300 transition-all mt-2"
              id="btn_pas2_següent"
            >
              Següent Pas
              <ArrowRight size={16} />
            </button>
          </main>
        )}

        {/* PAS 3: L'OBJECTIU A LA CONVOCATÒRIA */}
        {currentStep === 3 && (
          <main className="w-full max-w-md flex flex-col gap-6 animate-fade-in" id="quiz_pas_3">
            <div className="flex flex-col gap-1 text-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Pas 3 de 5</span>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">L'Objectiu a la Convocatòria</h2>
              <p className="text-xs text-white/55 italic">El focus nutricional ha d'estar perfectament alineat amb els teus punts febles o forts de les proves de l'ISPC.</p>
            </div>

            <div className="flex flex-col gap-3">
              
              <button
                type="button"
                onClick={() => setObjectiu("perdua_greix")}
                className={`w-full p-5 rounded-2xl border flex flex-col items-start gap-1 text-left backdrop-blur-md transition-all ${
                  objectiu === "perdua_greix"
                    ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                    : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 text-rose-400">
                  <Scale size={16} />
                  <span className="font-black italic uppercase text-xs">Pèrdua de greix / Definició</span>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed italic mt-1">
                  Busco reduir el percentatge adipós per moure'm amb màxima lleugeresa a la Navette i ser àgil esquivant cons al circuit de Mossos, evitant pes mort inútil. (S'aplica un dèficit controlat de -400 kcal).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setObjectiu("manteniment")}
                className={`w-full p-5 rounded-2xl border flex flex-col items-start gap-1 text-left backdrop-blur-md transition-all ${
                  objectiu === "manteniment"
                    ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                    : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 text-blue-400">
                  <Dumbbell size={16} />
                  <span className="font-black italic uppercase text-xs">Manteniment i millora de potència</span>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed italic mt-1">
                  Vull optimitzar el meu rendiment actual. L'objectiu és mantenir el pes corporal actual i potenciar l'explosivitat de l'entrenament diari amb càlculs equilibrats. (Calories estables neutres).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setObjectiu("guany_forca")}
                className={`w-full p-5 rounded-2xl border flex flex-col items-start gap-1 text-left backdrop-blur-md transition-all ${
                  objectiu === "guany_forca"
                    ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                    : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 text-yellow-400">
                  <Sparkles size={16} />
                  <span className="font-black italic uppercase text-xs">Guany de massa muscular / Força</span>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed italic mt-1">
                  Prioritzo el guany de força absoluta i potència muscular. Clau per aconseguir el màxim de repeticions possibles en la prova de press de banca i guanyar força de tracció. (S'aplica un superàvit de +300 kcal).
                </p>
              </button>

            </div>

            <button 
              onClick={handleNextStep}
              disabled={!objectiu}
              className="w-full bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-[#00274d] rounded-2xl py-4.5 font-black italic uppercase tracking-[0.2em] text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 hover:bg-yellow-300 transition-all mt-2"
              id="btn_pas3_següent"
            >
              Següent Pas
              <ArrowRight size={16} />
            </button>
          </main>
        )}

        {/* PAS 4: FILTRES I TOLERÀNCIES ALIMENTÀRIES */}
        {currentStep === 4 && (
          <main className="w-full max-w-md flex flex-col gap-6 animate-fade-in" id="quiz_pas_4">
            <div className="flex flex-col gap-1 text-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Pas 4 de 5</span>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Filtres i Toleràncies Alimentàries</h2>
              <p className="text-xs text-white/55 italic">Configura les preferències bàsiques de la teva alimentació diària per evitar al·lèrgies o intoleràncies.</p>
            </div>

            <div className="flex flex-col gap-5">
              
              {/* Pregunta: Estil de Vida */}
              <div className="bg-[#001c38]/25 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex flex-col gap-3 shadow-xl">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 italic font-bold">Estil de vida alimentari</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEstilVida("omnivor")}
                    className={`py-3 rounded-xl font-black italic uppercase text-[10px] tracking-wider border text-center transition-all ${
                      estilVida === "omnivor"
                        ? "bg-emerald-500 text-[#00274d] border-emerald-500 shadow-md"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    Omnívor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstilVida("vegetaria")}
                    className={`py-3 rounded-xl font-black italic uppercase text-[10px] tracking-wider border text-center transition-all ${
                      estilVida === "vegetaria"
                        ? "bg-emerald-500 text-[#00274d] border-emerald-500 shadow-md"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    Vegetarià
                  </button>
                  <button
                    type="button"
                    onClick={() => setEstilVida("vega")}
                    className={`py-3 rounded-xl font-black italic uppercase text-[10px] tracking-wider border text-center transition-all ${
                      estilVida === "vega"
                        ? "bg-emerald-500 text-[#00274d] border-emerald-500 shadow-md"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    Vegà
                  </button>
                </div>
              </div>

              {/* Pregunta: Intoleràncies */}
              <div className="bg-[#001c38]/25 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 italic font-bold">Intoleràncies o al·lèrgies (Opcional)</span>
                  <p className="text-[9px] text-white/40 italic mt-0.5">Marca les opcions per descartar de forma intel·ligent a la calculadora.</p>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIntoleranciaGluten(!intoleranciaGluten)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between backdrop-blur-md transition-all ${
                      intoleranciaGluten
                        ? "bg-yellow-400/20 border-yellow-400/40 text-yellow-400"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60"
                    }`}
                  >
                    <span className="font-black italic uppercase text-xs">Sense Gluten</span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      intoleranciaGluten ? "border-yellow-400 bg-yellow-400 text-[#00274d]" : "border-white/15"
                    }`}>
                      {intoleranciaGluten && <Check size={12} strokeWidth={4} />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntoleranciaLactosa(!intoleranciaLactosa)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between backdrop-blur-md transition-all ${
                      intoleranciaLactosa
                        ? "bg-yellow-400/20 border-yellow-400/40 text-yellow-400"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60"
                    }`}
                  >
                    <span className="font-black italic uppercase text-xs">Sense Lactosa</span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      intoleranciaLactosa ? "border-yellow-400 bg-yellow-400 text-[#00274d]" : "border-white/15"
                    }`}>
                      {intoleranciaLactosa && <Check size={12} strokeWidth={4} />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIntoleranciaFruitsSecs(!intoleranciaFruitsSecs)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between backdrop-blur-md transition-all ${
                      intoleranciaFruitsSecs
                        ? "bg-yellow-400/20 border-yellow-400/40 text-yellow-400"
                        : "bg-[#001f3d]/20 border-white/10 text-white/60"
                    }`}
                  >
                    <span className="font-black italic uppercase text-xs">Sense Fruits Secs</span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      intoleranciaFruitsSecs ? "border-yellow-400 bg-yellow-400 text-[#00274d]" : "border-white/15"
                    }`}>
                      {intoleranciaFruitsSecs && <Check size={12} strokeWidth={4} />}
                    </div>
                  </button>
                </div>
              </div>

            </div>

            <button 
              onClick={handleNextStep}
              disabled={!estilVida}
              className="w-full bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-[#00274d] rounded-2xl py-4.5 font-black italic uppercase tracking-[0.2em] text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 hover:bg-yellow-300 transition-all mt-2"
              id="btn_pas4_següent"
            >
              Següent Pas
              <ArrowRight size={16} />
            </button>
          </main>
        )}

        {/* PAS 5: PANTALLA FINAL: RESUM DE DADES, EXPLICACIÓ DE CÀLCULS I AVÍS LEGAL */}
        {currentStep === 5 && calculsTotals && (
          <main className="w-full max-w-md flex flex-col gap-6 animate-fade-in pb-12" id="quiz_pas_5">
            <div className="flex flex-col gap-1 text-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Pas 5 de 5</span>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Confirma el teu perfil nutricional</h2>
              <p className="text-xs text-white/55 italic">Revisa detingudament que el resum de dades de rendiment calculades sigui correcte.</p>
            </div>

            {/* Targetes de resum de càlculs instantanis */}
            <div className="bg-[#001c38]/30 backdrop-blur-md border border-white/15 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
              
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-white/5">
                <div className="flex flex-col gap-0.5 bg-[#001124]/30 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Metabolisme Basal</span>
                  <span className="text-lg font-black italic text-white leading-none">{calculsTotals.imb} <span className="text-xs font-semibold text-white/50">kcal</span></span>
                </div>
                <div className="flex flex-col gap-0.5 bg-[#001124]/30 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider">Índex IMC</span>
                  <span className="text-lg font-black italic text-emerald-400 leading-none">{calculsTotals.imc} <span className="text-[10px] font-bold text-emerald-400/60">{calculsTotals.imc < 18.5 ? "Sota Pes" : calculsTotals.imc < 25 ? "Normal" : "Sobrepès"}</span></span>
                </div>
              </div>

              {/* Objectiu Diari Central */}
              <div className="text-center py-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 italic block mb-1">Calories de Rendiment totals</span>
                <span className="text-4xl font-black italic text-white uppercase tracking-tight">{calculsTotals.kcal} <span className="text-xs font-black uppercase tracking-normal text-white/60">kcal/dia</span></span>
              </div>

              {/* Repartiment de Macronutrients */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/5">
                <div className="bg-[#00274d]/50 border border-white/5 p-2 rounded-xl flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider text-rose-300">Proteïna</span>
                  <span className="text-base font-black italic text-rose-400 mt-1">{calculsTotals.protes}g</span>
                  <span className="text-[8px] text-white/45 uppercase mt-0.5">{calculsTotals.protes * 4} kcal</span>
                </div>
                <div className="bg-[#00274d]/50 border border-white/5 p-2 rounded-xl flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider text-yellow-300">Greixos</span>
                  <span className="text-base font-black italic text-yellow-400 mt-1">{calculsTotals.greixos}g</span>
                  <span className="text-[8px] text-white/45 uppercase mt-0.5">{calculsTotals.greixos * 9} kcal</span>
                </div>
                <div className="bg-[#00274d]/50 border border-white/5 p-2 rounded-xl flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-300">Carbs</span>
                  <span className="text-base font-black italic text-blue-400 mt-1">{calculsTotals.carbs}g</span>
                  <span className="text-[8px] text-white/45 uppercase mt-0.5">{calculsTotals.carbs * 4} kcal</span>
                </div>
              </div>

            </div>

            {/* TEXT EXPLICATIU DELS CÀLCULS */}
            <div className="bg-emerald-950/20 backdrop-blur-md border border-emerald-500/20 p-5 rounded-2xl flex flex-col gap-2 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-400">
                <Apple size={15} />
                <h3 className="text-[10px] font-black uppercase tracking-wider italic">Explicació de Càlculs Interns :</h3>
              </div>
              <p className="text-[10px] md:text-xs text-white/80 leading-relaxed italic pr-1">
                <strong>Càlcul Científic de Rendiment:</strong> En acceptar aquest perfil, l'aplicació aplicarà de forma automatitzada la fórmula científica de <strong>Mifflin-St Jeor</strong> per obtenir el teu Índex Metabòlic Basal (IMB). Aquest s'ajusta multiplicant-lo pel factor d'activitat corresponent (de sedentari a molt actiu) per obtenir les calories de manteniment. Posteriorment s'aplica el tall d'energia segons l'objectiu de la teva convocatòria (-400 kcal per perdre greix i polir Navette, o +300 kcal per guanyar força en press de banca). El repartiment de macronutrients es fixa estrictament a un ràtio de 2g de proteïna per kg de pes, un 25% de les calories totals diàries en greixos insaturats de qualitat i la resta d'energia es lliura en carbohidrats per saturar el glucogen muscular.
              </p>
            </div>

            {/* AVÍS LEGAL - DISCLAIMER */}
            <div className="bg-rose-950/20 border border-rose-500/20 p-5 rounded-2xl flex flex-col gap-3 shadow-lg">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle size={15} />
                <h3 className="text-[10px] font-black uppercase tracking-wider italic">Clàusula Exempció de Responsabilitat :</h3>
              </div>
              <p className="text-[10px] text-white/70 leading-relaxed italic">
                Els valors metabòlics, macronutrients i llistes d'aliments calculats en aquesta aplicació tenen un caràcter estrictament informatiu, orientatiu, acadèmic i d'assessorament esportiu. Sota cap concepte substitueixen el diagnòstic d'un professional de la salut, d'un metge esportiu o d'un dietista-nutricionista col·legiat. L'opositor assumeix sota la seva pròpia discreció i risc la gestió física i esportiva d'aquestes recomanacions. OposiCAT queda totalment eximida de qualsevol tipus de responsabilitat civil, mèdica o de salut derivada directament o indirectament de les recomanacions preses.
              </p>

              {/* Checkbox obligatori */}
              <button
                type="button"
                onClick={() => setAcceptoTermes(!acceptoTermes)}
                className={`flex items-start gap-3 mt-1 p-3 rounded-xl border text-left transition-all ${
                  acceptoTermes ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "bg-black/10 border-white/5 text-white/50 hover:text-white"
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  acceptoTermes ? "border-emerald-400 bg-emerald-400 text-[#00274d]" : "border-white/15"
                }`}>
                  {acceptoTermes && <Check size={12} strokeWidth={4} />}
                </div>
                <p className="text-[10px] leading-relaxed font-bold">
                  Accepto expressament les condicions generals d'exempció de responsabilitat mèdica i entenc el caràcter orientatiu d'aquesta calculadora d'alt rendiment d'OposiCAT.
                </p>
              </button>
            </div>

            {errorEnviament && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-center text-xs font-bold">
                {errorEnviament}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleCalcularDieta}
                disabled={guardant || !acceptoTermes}
                className="w-full bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-[#00274d] rounded-2xl py-5 font-black italic uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all text-xs md:text-sm"
                id="btn_confirmar_final"
              >
                {guardant ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Guardant perfil...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Generar dieta
                  </>
                )}
              </button>

              <button 
                onClick={resetQuiz}
                disabled={guardant}
                className="w-full bg-[#001f3d]/25 hover:bg-[#00274d]/35 backdrop-blur-md border border-white/10 text-white/80 rounded-2xl py-4.5 font-black italic uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 transition-all text-xs"
                id="btn_recomencar_quiz"
              >
                <RotateCcw size={16} />
                Reiniciar Dades i Valors
              </button>
            </div>
          </main>
        )}

      </div>
    </div>
  );
}
