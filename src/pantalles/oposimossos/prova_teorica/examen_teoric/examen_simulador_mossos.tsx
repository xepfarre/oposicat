import { useState, useEffect } from "react";
import { ChevronLeft, Check, X, RefreshCw, Trophy, Brain, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth } from "../../../../lib/firebase";
import { collection, getDocs, query, collectionGroup, doc, getDoc, setDoc } from "firebase/firestore";

/**
 * PANTALLA: ExamenSimuladorMossos
 * Simulador de test d'OposiMossos basat en l'estètica d'Examen Actualitat.
 */
interface Question {
  id: string | number;
  pregunta: string;
  opcions: string[];
  correcta: number;
  explicacio: string;
  ambit?: string;
  tema?: number;
  capitol?: number;
  status?: 'activa' | 'suspesa';
}

export default function ExamenSimuladorMossos({ 
  onTornar, 
  numPreguntes, 
  temps,
  seleccions,
  examenId
}: { 
  onTornar: () => void;
  numPreguntes: number;
  temps: string;
  seleccions: { [key: string]: number[] };
  examenId?: string;
}) {
  const [preguntes, setPreguntes] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comentaris planers per a no-programadors:
  // Afegim aquests estats per gestionar si el nombre de preguntes trobades a Firestore per la selecció
  // de l'alumne és inferior al total que ha escollit (pe. ha demanat fer-ne 10 i només n'hi ha 3 actives).
  // D'aquesta manera podrem llançar el bonic pop-up d'avís didàctic de repetició.
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [realQuestionsCount, setRealQuestionsCount] = useState(0);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        // Consultem en paral·lel nova estructura i antiga
        const [snapNew, snapOld] = await Promise.all([
          getDocs(query(collectionGroup(db, "preguntes_codificades"))),
          getDocs(collection(db, "examens/mossos/preguntes"))
        ]);
        
        const listNew = snapNew.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        const listOld = snapOld.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        
        let list = [...listNew, ...listOld];
        
        // 1. Filtrar només actives
        list = list.filter(q => q.status !== 'suspesa');
 
        // 2. FILTRATGE ESPECIAL PER EXAMEN OFICIAL O ERRADES
        if (examenId) {
          if (examenId === 'errades') {
            // Lògica de preguntes errades (placeholder per ara)
          } else {
            // Filtratge per any o ID d'examen oficial
            // @ts-ignore
            list = list.filter(q => q.any?.toString() === examenId || q.examenId === examenId);
          }
        } else {
          // 3. FILTRATGE PER SELECCIÓ DE TEMARI (Simulador normal)
          const teSeleccions = Object.values(seleccions).some(arr => arr.length > 0);
          
          if (teSeleccions) {
            list = list.filter(q => {
              const ambit = q.ambit || 'A';
              // Comentari planer per a no-programadors:
              // Normalitzem els temes de la BBDD (indexats a 0) pel seu valor visual visible de l'alumne (indexat a 1).
              const tema = q.tema !== undefined ? parseInt(q.tema.toString(), 10) + 1 : null;
              
              if (!seleccions[ambit] || seleccions[ambit].length === 0) return false;
              return tema !== null && seleccions[ambit].includes(tema);
            });
          }
        }
 
        if (list.length === 0) {
          setPreguntes([]);
        } else {
          const rawCount = list.length;
          setRealQuestionsCount(rawCount);
          
          let listToUse = [...list];
          if (rawCount < numPreguntes) {
            // Comentari planer per a no-programadors:
            // Si el llistat real té menys elements dels que ha seleccionat fer l'estudiant,
            // activem l'avís flotant i generem un conjunt cíclic on les preguntes es repeteixin
            // de forma barrejada per garantir que es cobreix el total triat sense errors de l'examen.
            setShowWarningModal(true);
            
            let repeatedList: Question[] = [];
            const shuffledBase = [...list].sort(() => 0.5 - Math.random());
            while (repeatedList.length < numPreguntes) {
              repeatedList.push(...[...shuffledBase].sort(() => 0.5 - Math.random()));
            }
            listToUse = repeatedList.slice(0, numPreguntes);
          } else {
            // Si en tenim suficients, conservem el flux estàndard de selecció aleatòria
            listToUse = [...list].sort(() => 0.5 - Math.random()).slice(0, numPreguntes);
          }
          
          setPreguntes(listToUse);
        }
      } catch (error) {
        console.error("Error carregant preguntes:", error);
        setPreguntes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [numPreguntes, seleccions, examenId]);

  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respostaSeleccionada, setRespostaSeleccionada] = useState<number | null>(null);
  const [encerts, setEncerts] = useState(0);
  const [finalitzat, setFinalitzat] = useState(false);

  // Comentaris planers per a no-programadors:
  // Creem un estat anomenat 'segonsRestants' on calcularem el temps de l'examen en segons (minuts escollits multiplicats per 60).
  // Si l'alumne escull examen sense límit de temps ("inf"), es mantindrà buit (null) i es mostrarà el símbol d'infinit.
  const [segonsRestants, setSegonsRestants] = useState<number | null>(() => {
    if (temps === 'inf' || !temps) return null;
    const minuts = parseInt(temps, 10);
    return isNaN(minuts) ? null : minuts * 60;
  });

  // Comentaris planers per a no-programadors:
  // Aquest temporitzador s'executa contínuament en segon pla cada segon (1000 mil·lisegons).
  // Si s'acaba el temps (arriba a 0 segons), el procés canvia automàticament l'estat a 'finalitzat'
  // per tancar el qüestionari i lliurar la nota actual a l'alumne per seguretat d'examen real.
  useEffect(() => {
    if (segonsRestants === null || finalitzat || loading) return;

    const intervalId = setInterval(() => {
      setSegonsRestants(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(intervalId);
          setFinalitzat(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [segonsRestants, finalitzat, loading]);

  // Comentaris planers per a no-programadors:
  // Aquesta petita funció de suport s'encarrega d'agafar la xifra de segons restants (per exemple, 175)
  // i transformar-la elegantment al format visual típic de minut:segon (per exemple, 2:55) amb dígits dobles en els segons.
  const visualitzarTempsRestant = () => {
    if (segonsRestants === null) return '∞';
    const minuts = Math.floor(segonsRestants / 60);
    const segons = segonsRestants % 60;
    return `${minuts}:${segons.toString().padStart(2, '0')}`;
  };

  const handleResposta = async (index: number) => {
    if (respostaSeleccionada !== null) return;
    setRespostaSeleccionada(index);
    const correcta = preguntes[preguntaActual].correcta;
    const esCorrecta = index === correcta;

    if (esCorrecta) {
      setEncerts(prev => prev + 1);
    }

    // Explicació per a no-programadors: Gravem immediatament la resposta a Firestore si l'usuari/opositor està logejat.
    // D'aquesta manera s'acumula quin percentatge d'èxit té cada alumne de cara a futurs testos de repàs de fallades.
    const user = auth.currentUser;
    if (user) {
      try {
        const pregunta = preguntes[preguntaActual];
        const preguntaId = pregunta.id.toString();
        const respostaRef = doc(db, `usuaris/${user.uid}/respostes_preguntes`, preguntaId);
        
        let intents = 1;
        let correctes = esCorrecta ? 1 : 0;
        let errors = esCorrecta ? 0 : 1;

        const snap = await getDoc(respostaRef);
        if (snap.exists()) {
          const dades = snap.data();
          intents = (dades.intents || 0) + 1;
          correctes = (dades.correctes || 0) + (esCorrecta ? 1 : 0);
          errors = (dades.errors || 0) + (esCorrecta ? 0 : 1);
        }

        await setDoc(respostaRef, {
          preguntaId: preguntaId,
          encertada: esCorrecta,
          respostaSeleccionada: index,
          intents: intents,
          correctes: correctes,
          errors: errors,
          ambit: pregunta.ambit || 'A',
          tema: pregunta.tema !== undefined ? parseInt(pregunta.tema.toString(), 10) : 0,
          actualitzatEl: new Date().toISOString()
        }, { merge: true });

        console.log(`Resposta registrada: Pregunta ${preguntaId} -> ${esCorrecta ? 'CORRECTE' : 'ERROR'}`);
      } catch (err) {
        console.error("Error guardant resposta de l'usuari:", err);
      }
    }
  };

  const seguentPregunta = () => {
    if (preguntaActual < preguntes.length - 1) {
      setPreguntaActual(prev => prev + 1);
      setRespostaSeleccionada(null);
    } else {
      setFinalitzat(true);
    }
  };

  const reiniciar = () => {
    setPreguntaActual(0);
    setRespostaSeleccionada(null);
    setEncerts(0);
    setFinalitzat(false);
    // Comentari planer per a no-programadors:
    // Reiniciem també el temporitzador al seu valor original de temps quan es tria tornar a intentar el qüestionari.
    if (temps !== 'inf' && temps) {
      const minuts = parseInt(temps, 10);
      setSegonsRestants(isNaN(minuts) ? null : minuts * 60);
    } else {
      setSegonsRestants(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#001a33] z-[200] flex flex-col items-center justify-center p-10 text-center gap-8">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full shadow-lg shadow-emerald-500/20"
         />
         <div className="flex flex-col gap-3">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Comprovant les preguntes mes noves d'Oposimossos</h2>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-xs animate-pulse">
               Descarregant contingut...
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto pb-12 text-white z-50">
      
      {/* CAPÇALERA */}
      <header className="w-full p-6 flex items-center gap-4 shrink-0 max-w-2xl mx-auto">
        <button 
          onClick={onTornar}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col">
          <span className="text-emerald-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Simulador OposiMossos</span>
          <h1 className="text-white text-base font-black uppercase italic tracking-tight">
            Examen <span className="text-yellow-400">Teòric</span>
          </h1>
        </div>
        <div className="ml-auto bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{visualitzarTempsRestant()}</span>
        </div>
      </header>

      {preguntes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto gap-6 animate-in fade-in duration-300">
           <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-red-500">
              <AlertTriangle size={28} />
           </div>
           
           <div className="flex flex-col gap-2">
              <h2 className="text-lg font-black italic uppercase tracking-tight text-white">
                Tema en preparació
              </h2>
              <div className="h-0.5 w-8 bg-red-500 rounded-full mx-auto my-1" />
              <p className="text-white/80 text-xs font-semibold leading-relaxed">
                Encara no s'han donat d'alta preguntes en aquest tema.
              </p>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider leading-relaxed mt-2">
                El nostre equip de docents està preparant contingut exclusiu per a aquesta secció. S'actualitza automàticament cada setmana!
              </p>
           </div>
           
           <div className="flex flex-col w-full gap-3 mt-4">
             <button 
               onClick={onTornar}
               className="w-full bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-2xl py-4 font-black italic uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg"
             >
               Tornar a la selecció
             </button>
             
             {/* Comentari planer per a no-programadors:
                 Boto d'utilitat didàctica per si es volen injectar preguntes de mostra ràpida a la base de dades local/remota en entorns de prova. */}
             <button 
               onClick={async () => {
                 try {
                   const colRef = collection(db, "preguntes_codificades");
                   const exemplesMossos = [
                     {
                       pregunta: "Quin cos té atribuïdes les funcions de policia de la Generalitat de Catalunya?",
                       opcions: ["Guàrdia Urbana de Barcelona", "Mossos d'Esquadra", "Policia Nacional i Guàrdia Civil simultàniament", "Cos d'Agents Rurals"],
                       correcta: 1,
                       explicacio: "L'Estatut d'Autonomia i la Llei 10/1994 especifiquen que els Mossos d'Esquadra són la policia de la Generalitat de Catalunya de forma integral.",
                       ambit: "B",
                       tema: 1, 
                       status: "activa"
                     },
                     {
                       pregunta: "Quin article de la Constitució Espanyola de 1978 preveu la creació de les forces i cossos de seguretat de l'Estat?",
                       opcions: ["Article 104", "Article 55", "Article 155", "Article 9.3"],
                       correcta: 0,
                       explicacio: "L'article 104 de la Constitució estableix que les forces i cossos de seguretat tindran com a missió protegir el lliure exercici dels drets i llibertats lícits de la ciutadania.",
                       ambit: "A",
                       tema: 0,
                       status: "activa"
                     },
                     {
                       pregunta: "Quin és l'òrgan col·legiat col·laboratiu suprem de coordinació policial de Catalunya?",
                       opcions: ["El Consell de Seguretat de Catalunya", "La Taula de Coordinació de Seguretat", "El Comitè Policial del Nord", "L'Assemblea Plenària de la Seguretat"],
                       correcta: 0,
                       explicacio: "El Consell de Seguretat de Catalunya és l'òrgan consultiu i col·laboratiu suprem de coordinació de la Generalitat de Catalunya.",
                       ambit: "C",
                       tema: 0,
                       status: "activa"
                     },
                     {
                       pregunta: "L'ús de la força policial pels Mossos d'Esquadra s'ha d'ajustar estrictament a quins principis?",
                       opcions: ["Oportunitat, congruència i proporcionalitat", "Rapidesa, secret professional i jerarquia", "Iniciativa pròpia, contundència deliberada i submissió", "Exclusivitat, discrecionalitat absoluta i defense pròpia"],
                       correcta: 0,
                       explicacio: "Els principis fonamentals d'actuació de l'ús de la força policial són l'oportunitat, la congruència i la proporcionalitat reglamentària.",
                       ambit: "B",
                       tema: 2,
                       status: "activa"
                     },
                     {
                       pregunta: "Quina és la durada acadèmica típica de la formació teòrica bàsica lectiva a l'Institut de Seguretat Pública de Catalunya (ISPC)?",
                       opcions: ["3 mesos", "9 mesos", "2 anys", "18 mesos"],
                       correcta: 1,
                       explicacio: "El curs de formació bàsica per a l'accés al cos té una duració lectiva ordinària d'uns 9 mesos (un curs acadèmic).",
                       ambit: "B",
                       tema: 0,
                       status: "activa"
                     }
                   ];

                   const proms = exemplesMossos.map(async (p, idx) => {
                     await setDoc(doc(colRef, `pregunta_mos_prueba_${idx}`), p);
                   });

                   await Promise.all(proms);
                   alert("Exemples de preguntes inserits correctament! Ara el teu simulador tindrà preguntes de test.");
                   window.location.reload();
                 } catch (e: any) {
                   alert("Error en l'intent de càrrega: " + e.message);
                 }
               }}
               className="mt-2 text-white/20 hover:text-white/40 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
             >
               Injectar preguntes de simulacre (Desar a Firestore)
             </button>
           </div>
        </div>
      ) : (
        <main className="w-full max-w-md md:max-w-4xl px-6 flex flex-col gap-6 md:py-8">
        
        <AnimatePresence mode="wait">
          {!finalitzat ? (
            <motion.div 
              key={preguntaActual}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* Progrés */}
              <div className="flex items-center justify-between px-2">
                 <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Pregunta {preguntaActual + 1} de {preguntes.length}</span>
                 <div className="flex gap-1 overflow-hidden max-w-[100px]">
                    {preguntes.map((_, i) => (
                      <div key={i} className={`min-w-[4px] h-1 rounded-full ${i === preguntaActual ? 'bg-yellow-400 w-4' : i < preguntaActual ? 'bg-emerald-500' : 'bg-white/10'}`} />
                    ))}
                 </div>
              </div>

              {/* Enunciat */}
              <div className="bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-xl">
                 <p className="text-white font-black italic text-sm leading-snug uppercase tracking-tight">
                   {preguntes[preguntaActual].pregunta}
                 </p>
              </div>

              {/* Opcions */}
              <div className="flex flex-col gap-3">
                {preguntes[preguntaActual].opcions.map((opcio, index) => {
                  const isSelected = respostaSeleccionada === index;
                  const isCorrect = index === preguntes[preguntaActual].correcta;
                  const showResult = respostaSeleccionada !== null;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleResposta(index)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                        !showResult ? 'bg-white/5 border-white/10 hover:bg-white/10' :
                        isSelected && isCorrect ? 'bg-emerald-500/20 border-emerald-500/50' :
                        isSelected && !isCorrect ? 'bg-red-500/20 border-red-500/50' :
                        isCorrect ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-black/10 border-white/5 opacity-40'
                      }`}
                    >
                      <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-black italic ${
                        !showResult ? 'bg-white/10 text-white/50' :
                        isCorrect ? 'bg-emerald-500 text-white' :
                        isSelected ? 'bg-red-500 text-white' : 'bg-white/5 text-white/20'
                      }`}>
                         {showResult && isCorrect ? <Check size={16} /> : 
                          showResult && isSelected && !isCorrect ? <X size={16} /> : 
                          String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-[11px] font-bold leading-tight">{opcio}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explicació i Botó Següent */}
              {respostaSeleccionada !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 mt-2"
                >
                  <div className="bg-amber-400/10 border border-amber-400/20 p-4 rounded-2xl">
                     <p className="text-amber-400 text-[10px] font-medium leading-relaxed italic">
                       <span className="font-black not-italic uppercase tracking-widest mr-2 block mb-1">Nota formativa:</span>
                       {preguntes[preguntaActual].explicacio}
                     </p>
                  </div>
                  <button 
                    onClick={seguentPregunta}
                    className="bg-white text-[#00274d] w-full p-4 rounded-2xl font-black italic uppercase text-xs tracking-widest shadow-xl shadow-white/5 hover:bg-yellow-400 transition-colors"
                  >
                    Següent Pregunta
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-8 py-10 text-center"
            >
               <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center relative">
                  <Trophy size={64} className="text-yellow-400" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-white/10 rounded-full"
                  />
               </div>
               
               <div className="flex flex-col gap-2">
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter">Simulació completa</h2>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Resultat Final</p>
               </div>

               <div className="bg-white/10 px-10 py-6 rounded-3xl border border-white/10 flex flex-col items-center">
                  <span className="text-5xl font-black italic tracking-tighter text-white">
                    {encerts}/{preguntes.length}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-emerald-400">
                    {encerts === preguntes.length ? 'Excel·lent! Estàs a punt.' : encerts >= preguntes.length * 0.7 ? 'Molt bona puntuació.' : 'Cal seguir estudiant els blocs.'}
                  </span>
               </div>

               <div className="flex flex-col w-full gap-3">
                 <button 
                    onClick={reiniciar}
                    className="w-full bg-yellow-400 text-[#00274d] p-5 rounded-2xl font-black italic uppercase text-xs tracking-widest flex items-center justify-center gap-3"
                  >
                   <RefreshCw size={18} />
                   Tornar a intentar
                 </button>
                 <button 
                   onClick={onTornar}
                   className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black italic uppercase text-xs tracking-widest"
                 >
                   Sortir
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-2xl mt-4 opacity-50">
           <Brain size={20} className="text-white" />
           <p className="text-[8px] font-bold uppercase tracking-widest leading-relaxed">
             Aquesta simulació utilitza preguntes reals d'exàmens passats adaptades al nou temari. Recorda que l'examen oficial té 30 preguntes.
           </p>
        </div>

      </main>
      )}

      {/* 
         Comentari planer per a no-programadors:
         Aquest bonic panell d'alerta flotant d'alta qualitat (Pop-up didàctic) adverteix a l'opositor/estudiant
         que el banc actual d'OposiMossos té menys preguntes reals de les sol·licitades per a les seves rutes de blocs/temes.
         L'adverteix amistosament de la repetició cíclica de qüestionaris per conservar l'experiència d'examen (10/30/100 preguntes)
         i només li permet acceptar amb un únic botó per un llançament ràpid i didàctic.
      */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#001a33]/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-sm bg-[#00274d] border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-3xl flex items-center justify-center text-yellow-400 animate-pulse">
                <AlertTriangle size={32} />
              </div>
              
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-400 block">Sincronització setmanal activa</span>
                <h3 className="text-lg font-black italic uppercase text-white tracking-tight leading-tight">
                  Avís de repetició de preguntes
                </h3>
                <div className="h-0.5 w-10 bg-yellow-400 rounded-full mx-auto my-2" />
                <p className="text-xs text-white/85 font-semibold leading-relaxed">
                  Actualment hi ha menys preguntes de les que has seleccionat (X = {numPreguntes}), algunes preguntes es poden repetir. Actualitzem cada setmana amb més preguntes!!
                </p>
              </div>

              <button
                onClick={() => setShowWarningModal(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#00274d] rounded-2xl py-4 font-black italic uppercase tracking-wider text-xs shadow-xl shadow-emerald-500/10 transition-all active:scale-95"
              >
                Acceptar i començar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
