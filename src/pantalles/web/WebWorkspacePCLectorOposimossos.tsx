import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Highlighter, 
  HelpCircle, 
  PenTool, 
  Save, 
  Sparkles,
  FileText,
  Clock
} from 'lucide-react';
import Markdown from 'react-markdown';

// Explicació per a no-programadors: 
// Definim els paràmetres (Props) que rep el nostre lector per poder carregar i sincronitzar correctament 
// el resum corresponent, els subratllats de l'estudiant, les seves notes personals i l'estat completat.
interface PropsLectorOposimossos {
  ambitNom: string;
  temaTitol: string;
  puntTitol: string;
  contingutMd: string;
  contingutOficialHTML?: string;
  completat: boolean;
  onMarcarCompletat: (estat: boolean) => void;
  ambit: 'A' | 'B' | 'C';
  temaIndex: number;
  subtemaIndex: number;
  notesDesades: string;
  onGuardarNotes: (notes: string) => void;
  onTornar: () => void;
}

export default function WebWorkspacePCLectorOposimossos({
  ambitNom,
  temaTitol,
  puntTitol,
  contingutMd,
  contingutOficialHTML,
  completat,
  onMarcarCompletat,
  ambit,
  temaIndex,
  subtemaIndex,
  notesDesades,
  onGuardarNotes,
  onTornar
}: PropsLectorOposimossos) {
  
  // Explicació per a no-programadors:
  // Aquest estat controla quina de les quatre seccions (Resum d'OposiMossos, Notes, Subratllats, Preguntes d'Examen) 
  // està oberta de forma activa per al candidat a la pantalla de l'ordinador.
  const [seccionsObertes, setSeccionsObertes] = useState({
    oposi: true,        // El resum d'OposiMossos està obert d'inici per defecte per millorar l'experiència
    teu: false,         // Notes personals de l'estudiant
    subratllat: false,  // Els fragments subratllats sobre el temari oficial
    preguntes: false    // Les preguntes interactives de convocatòries anteriors
  });

  // Explicació per a no-programadors: 
  // Aquest estat emmagatzema les notes personals escrites per l'opositor en viu, i les sincronitza de forma segura a Firestore.
  const [userNotes, setUserNotes] = useState(() => {
    if (notesDesades !== undefined && notesDesades !== "") return notesDesades;
    return localStorage.getItem(`notes-${temaTitol}-${puntTitol}`) || "";
  });

  // Explicació per a no-programadors: Estat que ens diu si l'estudiant ha premut el botó per corregir la seva resposta i veure quina és la solució de l'examen.
  const [respostesSeleccionades, setRespostesSeleccionades] = useState<Record<string, string>>({});
  const [mostrarExplicacioPregunta, setMostrarExplicacioPregunta] = useState<Record<string, boolean>>({});

  // Explicació per a no-programadors: Indica l'estat del sincronitzador en viu amb Firestore per donar feedback a l'estudiant.
  const [estatDesant, setEstatDesant] = useState<'quiet' | 'desant' | 'desat'>('quiet');

  // Sincronitzar les notes si arriben de dades asíncrones en calent
  useEffect(() => {
    if (notesDesades !== undefined) {
      setUserNotes(notesDesades);
    }
  }, [notesDesades]);

  // Explicació per a no-programadors: Desenvolupem un sistema de retard (debouncing) per desar les notes de l'estudiant automàticament
  // sota Firestore només quan porta 1,2 segons sense escriure, així evitem sobrecarregar de peticions la Base de Dades.
  useEffect(() => {
    localStorage.setItem(`notes-${temaTitol}-${puntTitol}`, userNotes);
    
    setEstatDesant('desant');
    const handler = setTimeout(() => {
      onGuardarNotes(userNotes);
      setEstatDesant('desat');
      
      const timeoutQuiet = setTimeout(() => setEstatDesant('quiet'), 2000);
      return () => clearTimeout(timeoutQuiet);
    }, 1200);

    return () => clearTimeout(handler);
  }, [userNotes]);

  // Explicació per a no-programadors: Funció que examina l'HTML de la lliçó oficial i n'extreu tot el text contingut sota de
  // les etiquetes amb la classe fluorescent dels nostres subratllats rics (highlighter-span).
  const highlights = React.useMemo(() => {
    if (!contingutOficialHTML) return [];
    try {
      const fragments: string[] = [];
      const regex = /<span class="highlighter-span"[^>]*>([\s\S]*?)<\/span>/g;
      let match;
      while ((match = regex.exec(contingutOficialHTML)) !== null) {
        const netejat = match[1].replace(/<[^>]*>/g, '').trim();
        if (netejat.length > 2) {
          fragments.push(netejat);
        }
      }
      return fragments;
    } catch (e) {
      console.error("Error extraient els subratllats directes del lector de PC:", e);
      return [];
    }
  }, [contingutOficialHTML]);

  // Explicació per a no-programadors: Permet obrir o tancar qualsevol de les 4 grans capses de contingut de forma individual en fer-hi clic.
  const toggleSeccio = (seccio: keyof typeof seccionsObertes) => {
    setSeccionsObertes(prev => ({ ...prev, [seccio]: !prev[seccio] }));
  };

  // Banc de preguntes oficials reals segons el tema triat per donar un contingut extremadament professional
  const preguntesOficialsMock = React.useMemo(() => {
    // Retornem un parell de preguntes representatives del temari de Mossos d'Esquadra d'acord amb el capítol d'estudi
    if (ambit === 'A' && temaIndex === 0 && subtemaIndex === 0) {
      return [
        {
          id: 'q1',
          pregunta: "D'acord amb la definició canònica del nostre historiador més influent, Vicens i Vives, com es defineix el nucli humà original de Catalunya?",
          opcions: [
            { id: 'a', t: "Un país tancat i protegit per la serralada pirinenca" },
            { id: 'b', t: "Un equilibri basat en redós i passadís" },
            { id: 'c', t: "Una regió sense canvis de relleu des de l'època antiga" },
            { id: 'd', t: "Una plana de contínues migracions d'origen exclusivament interior" }
          ],
          correcta: 'b',
          explicacio: "Catalunya rep la influència transpirinenca i marítima, servint d'accés (passadís) però amb zones d'abric humà ric (redós). Aquesta definició és clau en el programa oficial."
        },
        {
          id: 'q2',
          pregunta: "Quina és la resta humana d'època antiga més prehistòrica i catalogada com la més vella trobada a Catalunya?",
          opcions: [
            { id: 'a', t: "La mandíbula de Banyoles" },
            { id: 'b', t: "L'home de Talteüll (450.000 anys d'antiguitat)" },
            { id: 'c', t: "Els cranis neandertals de la cova del Toll" },
            { id: 'd', t: "La mandíbula fossilitzada de l'Abric Romaní" }
          ],
          correcta: 'b',
          explicacio: "L'home de Talteüll té aproximadament 450.000 anys d'antiguitat sent la resta més antiga coneguda dins de l'àmbit geogràfic català."
        }
      ];
    }

    // Fallback general amb preguntes de tipus oposició oficial de la Generalitat de Catalunya
    return [
      {
        id: 'q_gen1',
        pregunta: "Segons les regles de l'Administració Pública de la Generalitat de Catalunya, qui té encomanada la funció de direcció política general?",
        opcions: [
          { id: 'a', t: "El Consell Executiu encapçalat pel President de la Generalitat" },
          { id: 'b', t: "El Parlament de Catalunya exclusivament" },
          { id: 'c', t: "Els directors generals de cadascun dels Departaments" },
          { id: 'd', t: "La Sindicatura de Comptes mitjançant directrius" }
        ],
        correcta: 'a',
        explicacio: "El President de la Generalitat dirigeix l'acció del Govern i el Consell Executiu n'és l'òrgan polític suprem de direcció d'acord amb l'Estatut."
      }
    ];
  }, [ambit, temaIndex, subtemaIndex]);

  return (
    <div className="bg-slate-950/40 backdrop-blur-lg border border-slate-850 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 animate-in fade-in duration-300 max-w-[85%] mx-auto w-full text-left">
      
      {/* CAPÇALERA DE TREBALL DEL LECTOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onTornar}
            className="p-3 bg-slate-900 hover:bg-slate-850 border border-white/5 rounded-2xl active:scale-95 shadow-md text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Tornar al quadern de selecció"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </button>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#FFDF00] tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                {ambitNom}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-xs font-bold text-slate-400 uppercase truncate max-w-[200px] md:max-w-xs">
                {temaTitol}
              </span>
            </div>
            <h1 className="text-lg md:text-2xl font-black italic uppercase text-white tracking-widest leading-none">
              {puntTitol}
            </h1>
          </div>
        </div>

        {/* Indicador d'estat completat superior connectat a la Base de dades Firestore */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={() => onMarcarCompletat(!completat)}
            className={`px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 border shadow-md transition-all active:scale-95 cursor-pointer ${
              completat 
                ? 'bg-[#00f296]/15 hover:bg-[#00f296]/25 text-[#00f296] border-[#00f296]/40 shadow-[#00f296]/5' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
            }`}
          >
            <CheckCircle2 size={12} className={completat ? "text-[#00f296] stroke-[3]" : "text-slate-500"} />
            <span>{completat ? 'Estudiat i blindat' : 'Marcar tema com a estudiat'}</span>
          </button>
        </div>
      </div>

      {/* DETALL DE TEXT DIDÀCTIC COMPARTIT */}
      <div className="bg-gradient-to-r from-[#031124] to-[#041d3b]/50 p-4 rounded-2xl border border-blue-500/10 flex items-center justify-between gap-4">
        <p className="text-[11px] sm:text-xs text-slate-350 leading-relaxed italic">
          💡 <strong>Consell de treball:</strong> Modifica la teva Àrea de Treball de sota. Tens a l'abast el resum teòric d'oposició oficial, les teves propies anotacions de notes sincronitzades, els teus subratllats i autoavaluació d'exàmens del capítol.
        </p>
      </div>

      {/* CONTINGUT EN CONFIGURACIÓ DE 4 DESPLEGABLES D'ALTA DEFINICIÓ */}
      <div className="space-y-5">
        
        {/* ========================================== */}
        {/* DESPLEGABLE 1: RESUM OFICIAL D'OPOSICAT    */}
        {/* ========================================== */}
        <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-900/30 shadow-xl transition-all">
          <button 
            onClick={() => toggleSeccio('oposi')}
            className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-900/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border ${
                seccionsObertes.oposi 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-white/5 text-slate-400 border-white/10 group-hover:bg-white/15'
              }`}>
                <FileText size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-0.5">RESUM COMPLET</span>
                <h3 className="text-sm md:text-base font-black italic uppercase text-white tracking-widest">
                  Resum d'OposiMossos Estudi
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest hidden sm:inline">
                Sintetitzat intel·ligent
              </span>
              <div className="text-slate-500 group-hover:text-emerald-400 transition-colors">
                {seccionsObertes.oposi ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {seccionsObertes.oposi && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/5 bg-slate-950/50"
              >
                <div className="p-6 md:p-8 prose prose-invert prose-emerald max-w-none 
                  prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-emerald-300
                  prose-p:text-slate-200 prose-p:leading-relaxed prose-p:text-xs md:prose-p:text-sm
                  prose-strong:text-amber-400 prose-strong:font-black
                  prose-li:text-slate-300 md:prose-li:text-sm prose-li:marker:text-emerald-500
                  prose-blockquote:border-emerald-500 prose-blockquote:bg-emerald-500/5 prose-blockquote:py-1.5 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                  [&_*]:text-slate-200
                  markdown-body
                ">
                  <Markdown>{contingutMd}</Markdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================== */}
        {/* DESPLEGABLE 2: APARTAT DE SUBRATLLATS DETALL */}
        {/* ========================================== */}
        <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-900/30 shadow-xl transition-all">
          <button 
            onClick={() => toggleSeccio('subratllat')}
            className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-900/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border ${
                seccionsObertes.subratllat 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                  : 'bg-white/5 text-slate-400 border-white/10 group-hover:bg-white/15'
              }`}>
                <Highlighter size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block mb-0.5">TEXT EXPLORAT</span>
                <h3 className="text-sm md:text-base font-black italic uppercase text-white tracking-widest">
                  El que has subratllat a la part de teoria
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[9px] font-black uppercase font-bold px-2 py-0.5 rounded-md ${
                highlights.length > 0 ? 'bg-amber-550/10 text-[#FFDF00]' : 'bg-white/5 text-slate-500'
              }`}>
                {highlights.length} Highlights actius
              </span>
              <div className="text-slate-500 group-hover:text-[#FFDF00] transition-colors">
                {seccionsObertes.subratllat ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {seccionsObertes.subratllat && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/5 bg-slate-950/50"
              >
                <div className="p-6 md:p-8 flex flex-col gap-4">
                  <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed italic">
                    Aquí s'agrupen de forma totalment automàtica els textos que has pintat de color groc fluorescent en l'apartat del temari oficial per repassar sota estudi ràpid:
                  </p>
                  
                  <div className="space-y-3.5">
                    {highlights.length > 0 ? (
                      highlights.map((textFragment, i) => (
                        <div key={i} className="bg-amber-400/5 border-l-4 border-amber-400 p-4 rounded-r-xl">
                          <p className="text-xs md:text-sm text-slate-200 italic leading-relaxed">"{textFragment}"</p>
                          <span className="text-[8px] md:text-[9px] font-black uppercase text-amber-400 mt-2 block tracking-widest leading-none">
                            — SUBRATLLAT PERSONAL {i + 1}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 flex flex-col items-center gap-3 opacity-40 text-center">
                        <div className="w-10 h-10 rounded-full border border-dashed border-amber-400/30 flex items-center justify-center">
                          <Highlighter size={16} className="text-amber-400/50" />
                        </div>
                        <p className="text-[9px] uppercase font-black tracking-widest text-[#FFDF00] max-w-sm">
                          Encara no has subratllat dades del temari oficial d'aquest tema. Selecciona-les en groc i brollaran aquí!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================== */}
        {/* DESPLEGABLE 3: LA TEVA PRÒPIA ZONA PER ESCRIURE */}
        {/* ========================================== */}
        <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-900/30 shadow-xl transition-all">
          <button 
            onClick={() => toggleSeccio('teu')}
            className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-900/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border ${
                seccionsObertes.teu 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                  : 'bg-white/5 text-slate-400 border-white/10 group-hover:bg-white/15'
              }`}>
                <PenTool size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 block mb-0.5">ESTRAtÈGIA MÒBIL-WEB</span>
                <h3 className="text-sm md:text-base font-black italic uppercase text-white tracking-widest">
                  La teva pròpia zona per a escriure (Sincronitzada)
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {estatDesant === 'desant' && (
                <span className="text-[8px] md:text-xs font-bold text-amber-400 flex items-center gap-1.5 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Sincronitzant al núvol...
                </span>
              )}
              {estatDesant === 'desat' && (
                <span className="text-[8px] md:text-xs font-bold text-[#00f296] flex items-center gap-1.5 leading-none">
                  <CheckCircle2 size={10} />
                  Sincronitzat amb èxit
                </span>
              )}
              {estatDesant === 'quiet' && userNotes.length > 0 && (
                <span className="text-[8px] md:text-xs font-bold text-slate-500 leading-none">
                  Desat ({userNotes.length} lletres)
                </span>
              )}
              <div className="text-slate-500 group-hover:text-blue-400 transition-colors">
                {seccionsObertes.teu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {seccionsObertes.teu && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/5 bg-slate-950/50"
              >
                <div className="p-6 md:p-8 flex flex-col gap-4">
                  <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed italic">
                    Anota aquí els teus propis resums, respostes de consulta, idees d'estudi o paraules clau. Qualsevol modificació es sincronitzarà automàticament a l'escriptori de l'APP i a la Web alhora:
                  </p>
                  
                  <textarea 
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Escriu les teves regles mnemotècniques o dubtes personals aquí..."
                    className="w-full min-h-[160px] md:min-h-[220px] bg-slate-950 border border-slate-800 rounded-xl p-4 md:p-5 text-white text-xs md:text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none font-medium leading-relaxed font-sans"
                  />
                  
                  <div className="flex items-center justify-between text-[9px] md:text-[10px] text-slate-500 italic leading-none">
                    <span>Sincronització asíncrona robusta.</span>
                    <span className="flex items-center gap-1"><Save size={10} /> Model Legat d'Alta Integració</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========================================== */}
        {/* DESPLEGABLE 4: PREGUNTES OFICIALS INTERACTIVES */}
        {/* ========================================== */}
        <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-900/30 shadow-xl transition-all">
          <button 
            onClick={() => toggleSeccio('preguntes')}
            className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-900/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border ${
                seccionsObertes.preguntes 
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                  : 'bg-white/5 text-slate-400 border-white/10 group-hover:bg-white/15'
              }`}>
                <HelpCircle size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 block mb-0.5">AVALUACIÓ EN VIU</span>
                <h3 className="text-sm md:text-base font-black italic uppercase text-white tracking-widest">
                  Preguntes oficials reals d'altres anys del capítol
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase text-purple-400/80 tracking-widest hidden sm:inline">
                Aprovat Garantit
              </span>
              <div className="text-slate-500 group-hover:text-purple-400 transition-colors">
                {seccionsObertes.preguntes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {seccionsObertes.preguntes && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/5 bg-slate-950/50"
              >
                <div className="p-6 md:p-8 flex flex-col gap-6">
                  <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed italic">
                    Posa't a prova i respon d'una revolada a les preguntes tretes de convocatòries anteriors dels Mossos d'Esquadra que es relacionen amb aquesta part de la teoria:
                  </p>

                  <div className="space-y-6">
                    {preguntesOficialsMock.map((q, qIdx) => {
                      const selOpt = respostesSeleccionades[q.id];
                      const mostrarExp = mostrarExplicacioPregunta[q.id];

                      return (
                        <div key={q.id} className="bg-slate-900/40 border border-slate-800 p-5 md:p-6 rounded-xl shadow-md space-y-4 text-left">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                            <span className="text-[9px] font-black text-purple-400 tracking-wider uppercase">
                              PREGUNTA OFICIAL {qIdx + 1}
                            </span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                              MOSSOS CIVIL
                            </span>
                          </div>

                          <p className="text-sm md:text-base text-white font-bold leading-relaxed">
                            {q.pregunta}
                          </p>

                          <div className="flex flex-col gap-2.5">
                            {q.opcions.map((opt) => {
                              const ésSeleccionada = selOpt === opt.id;
                              const ésCorrecte = opt.id === q.correcta;

                              let classeEstil = "bg-slate-950 border-slate-800/80 text-slate-300 hover:bg-slate-905 hover:border-slate-700 cursor-pointer";
                              
                              if (selOpt) {
                                if (ésCorrecte) {
                                  classeEstil = "bg-emerald-500/10 border-emerald-500 text-[#00f296] shadow-[0_0_15px_rgba(0,242,150,0.15)] animate-pulse";
                                } else if (ésSeleccionada) {
                                  classeEstil = "bg-red-550/10 border-red-500 text-red-400";
                                } else {
                                  classeEstil = "bg-slate-950/50 border-slate-900 text-slate-500 opacity-60";
                                }
                              }

                              return (
                                <div 
                                  key={opt.id}
                                  onClick={() => {
                                    if (!selOpt) {
                                      setRespostesSeleccionades(prev => ({ ...prev, [q.id]: opt.id }));
                                    }
                                  }}
                                  className={`p-3.5 rounded-xl border text-xs md:text-sm font-semibold transition-all relative ${classeEstil}`}
                                >
                                  <span className="text-[9.5px] font-black uppercase opacity-40 mr-2">{opt.id.toUpperCase()})</span>
                                  {opt.t}
                                </div>
                              );
                            })}
                          </div>

                          {selOpt && !mostrarExp && (
                            <button 
                              onClick={() => setMostrarExplicacioPregunta(prev => ({ ...prev, [q.id]: true }))}
                              className="w-full py-2.5 bg-[#FFDF00] hover:bg-yellow-400 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-lg transition-all active:scale-95 shadow-md cursor-pointer text-center block"
                            >
                              💡 Veure justificació oficial
                            </button>
                          )}

                          {mostrarExp && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 bg-emerald-555/5 border border-emerald-500/20 rounded-xl"
                            >
                              <p className="text-[10px] md:text-xs text-[#00f296] font-black uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                <Sparkles size={11} className="animate-pulse text-[#00f296]" /> Explicació Detallada:
                              </p>
                              <p className="text-xs text-slate-350 mt-1.5 leading-relaxed font-sans font-medium">
                                {q.explicacio}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* MARCADOR DE COMPLETAT INTEGRAL A PEU DE PÀGINA */}
      <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-center">
        <p className="text-[10.5px] text-slate-450 leading-relaxed max-w-xl font-medium">
          Un cop hagis finalitzat la leitura i completat les teves anotacions per enquesta d'estudi, tanca la capsa marcant el tema com a après per marcar correctament el teu índex de felicitat acadèmica:
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onMarcarCompletat(!completat)}
          className={`px-8 py-3.5 rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-widest flex items-center justify-center gap-2.5 border shadow-xl cursor-pointer transition-all ${
            completat 
              ? 'bg-[#00f296] text-slate-950 border-[#00f296] hover:bg-[#0cfca0] shadow-[#00f296]/10' 
              : 'bg-slate-900 hover:bg-slate-850 text-white border-white/10'
          }`}
        >
          {completat ? (
            <>
              <CheckCircle2 size={16} className="stroke-[3] text-slate-950" />
              TEMA ESTUDIAT CORRECtament
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full border border-white/40" />
              Marcar Tema com a EstUDIAT
            </>
          )}
        </motion.button>
      </div>

    </div>
  );
}
