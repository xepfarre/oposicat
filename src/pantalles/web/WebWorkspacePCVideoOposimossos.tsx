import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Play, 
  ExternalLink, 
  User, 
  Shield, 
  BookOpen, 
  CheckCircle2, 
  Sparkles,
  Award,
  Clock,
  Heart,
  Send,
  MessageSquare,
  ThumbsUp,
  Zap,
  PenTool,
  Save,
  Video
} from 'lucide-react';

// Explicació per a no-programadors:
// Definim els paràmetres (Props) que el nostre visualitzador de vídeo necessita per a enllaçar-se
// amb la resta de l'aplicació d'OposiCAT. Per a evitar qualsevol trencament de l'arquitectura del pare,
// mantenim la definició d'anotacions que s'emmagatzemen a nivell global.
interface PropsVideoOposimossos {
  ambitNom: string;
  temaTitol: string;
  puntTitol: string;
  completat: boolean;
  onMarcarCompletat: (estat: boolean) => void;
  ambit: 'A' | 'B' | 'C';
  temaIndex: number;
  subtemaIndex: number;
  notesDesades: string;
  onGuardarNotes: (notes: string) => void;
  onTornar: () => void;
}

// Explicació per a no-programadors: Interfície amb les dades d'una pregunta o resposta del nostre sistema de Fòrum d'Alumnes.
interface DubteComunitari {
  id: string;
  autor: string;
  rol: 'alumne' | 'professor';
  text: string;
  faTemps: string;
  mAgraves: number;
  usuariHaDonatCor: boolean;
  respostes?: DubteComunitari[];
}

export default function WebWorkspacePCVideoOposimossos({
  ambitNom,
  temaTitol,
  puntTitol,
  completat,
  onMarcarCompletat,
  ambit,
  temaIndex,
  subtemaIndex,
  notesDesades,
  onGuardarNotes,
  onTornar
}: PropsVideoOposimossos) {

  // Explicació per a no-programadors: Estat per discernir el mode visual de visualització seleccionat per l'alumne.
  // Podrà triar entre 'visualitzador' (estàndard) o 'split' (Video + Apunts compacte).
  const [modePantalla, setModePantalla] = useState<'visualitzador' | 'split'>('visualitzador');

  // Explicació per a no-programadors: Controla si la reproducció de YouTube (amb iframe de YouTube integrat) està activa.
  const [reproduint, setReproduint] = useState(false);

  // Explicació per a no-programadors: Estat de text per guardar les anotacions personals que fa l'alumne mentre estudia.
  const [userNotes, setUserNotes] = useState(() => {
    if (notesDesades !== undefined && notesDesades !== "") return notesDesades;
    return localStorage.getItem(`notes-video-${temaTitol}-${puntTitol}`) || "";
  });

  const [estatDesant, setEstatDesant] = useState<'quiet' | 'desant' | 'desat'>('quiet');

  // Explicació per a no-programadors: Text de la nova pregunta que l'alumne en estudi vol formular.
  const [nouDubteText, setNouDubteText] = useState("");

  // Explicació per a no-programadors: Base de dades inicial d'exemple per simular una comunitat activa de Mossos d'Esquadra que es pregunten i responen.
  const [comentaris, setComentaris] = useState<DubteComunitari[]>([
    {
      id: "dubte-1",
      autor: "Jordi S.",
      rol: "alumne",
      text: "Hola! Tinc un dubte amb el tema del repartiment competencial que s'explica al minut 02:15. Les competències executives i la regulació s'analitzaven de forma conjunta a la prova oficial anterior o demanen sempre la llei 10/1994 a fons? Gràcies pel vídeo!",
      faTemps: "Fa 2 hores",
      mAgraves: 12,
      usuariHaDonatCor: false,
      respostes: [
        {
          id: "resposta-1",
          autor: "Mosso Guillem",
          rol: "professor",
          text: "Hola Jordi! Molt bona pregunta. A l'oposició de Mossos és crucial diferenciar-ho: la competència d'ordenació i seguretat general es recull directament a l'Estatut de Catalunya de 2006, mentre que la llei 10/1994 governa estrictament l'estructura interna del nostre Cos. Al proper examen sol·licitaran ambdues, però t'aconsello centrar-te primer en els terminis i comandaments orgànics del departament de l'Interior. Endavant amb l'estudi!",
          faTemps: "Fa 1 hora",
          mAgraves: 24,
          usuariHaDonatCor: false
        }
      ]
    },
    {
      id: "dubte-2",
      autor: "Clara M.",
      rol: "alumne",
      text: "Bon dia Guillem. Hi ha algun resum mnemotècnic que ens faciliti memoritzar l'organització d'aquest bloc teòric? M'encanta com expliques la història policial de forma tan entenedora, es fa divertit estudiar!",
      faTemps: "Fa 1 dia",
      mAgraves: 8,
      usuariHaDonatCor: false,
      respostes: [
        {
          id: "resposta-2",
          autor: "Mosso Guillem",
          rol: "professor",
          text: "Moltes gràcies Clara per les teves paraules! M'alegra molt que t'ajudi la meva manera de transmetre-ho. Com a consell mnemotècnic ràpid: associa sempre els articles de drets humans i ètica policial a l'Assemblea del Consell d'Europa de 1979. Recorda la sigla 'ACE-79'. Un clàssic que cau a gairebé totes les convocatòries oficials!",
          faTemps: "Fa 23 hores",
          mAgraves: 19,
          usuariHaDonatCor: false
        }
      ]
    }
  ]);

  // URLs del vídeo clau de l'excel·lent Mosso d'Esquadra que dóna lliçons a OposiCAT.
  const youtubeUrl = "https://youtu.be/mrnciH-f1Kc";
  const youtubeEmbedUrl = "https://www.youtube.com/embed/mrnciH-f1Kc?autoplay=1&rel=0";

  // Sincronització de les notes de la base de dades si canvien des de dalt.
  useEffect(() => {
    if (notesDesades !== undefined) {
      setUserNotes(notesDesades);
    }
  }, [notesDesades]);

  // Explicació per a no-programadors: Sincronitzador asíncron automàtic amb la base de dades de l'alumne (locals i cloud) amb un breu delay protector.
  useEffect(() => {
    localStorage.setItem(`notes-video-${temaTitol}-${puntTitol}`, userNotes);
    
    setEstatDesant('desant');
    const handler = setTimeout(() => {
      onGuardarNotes(userNotes);
      setEstatDesant('desat');
      
      const timeoutQuiet = setTimeout(() => setEstatDesant('quiet'), 2000);
      return () => clearTimeout(timeoutQuiet);
    }, 1200);

    return () => clearTimeout(handler);
  }, [userNotes]);

  // Explicació per a no-programadors: Calculem el format numèric de la convenció X.X.X oficial d'OposiCAT.
  const ambitNumero = ambit === 'A' ? 1 : ambit === 'B' ? 2 : 3;
  const formatConvencio = `${ambitNumero}.${temaIndex + 1}.${subtemaIndex + 1}`;

  // Funció per posar o treure "m'agrada" dels dubtes del fòrum escolar
  const gestionarCor = (idPregunta: string, idResposta?: string) => {
    setComentaris(prev => prev.map(c => {
      if (idResposta && c.id === idPregunta && c.respostes) {
        return {
          ...c,
          respostes: c.respostes.map(r => {
            if (r.id === idResposta) {
              const increment = r.usuariHaDonatCor ? -1 : 1;
              return { ...r, mAgraves: r.mAgraves + increment, usuariHaDonatCor: !r.usuariHaDonatCor };
            }
            return r;
          })
        };
      }
      if (!idResposta && c.id === idPregunta) {
        const increment = c.usuariHaDonatCor ? -1 : 1;
        return { ...c, mAgraves: c.mAgraves + increment, usuariHaDonatCor: !c.usuariHaDonatCor };
      }
      return c;
    }));
  };

  // Funció per a que l'alumne enviï un nou dubte comunitari al fòrum de la masterclass
  const publicarNouDubte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouDubteText.trim()) return;

    const nouDubte: DubteComunitari = {
      id: `dubte-nou-${Date.now()}`,
      autor: "Tu (Alumne OposiCAT)",
      rol: "alumne",
      text: nouDubteText.trim(),
      faTemps: "Ara mateix",
      mAgraves: 0,
      usuariHaDonatCor: false,
      respostes: []
    };

    setComentaris(prev => [nouDubte, ...prev]);
    setNouDubteText("");
  };

  return (
    <div className="bg-slate-950/45 backdrop-blur-lg border border-slate-850 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 w-full text-left animate-in fade-in duration-300 pointer-events-auto">
      
      {/* CAPÇALERA DE CONFIGURACIÓ DE L'ENREGISTRAMENT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-4 text-left">
          <button 
            onClick={onTornar}
            className="p-3 bg-slate-900 hover:bg-slate-850 border border-white/5 rounded-2xl active:scale-95 shadow-md text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Tornar al llistat de lliçons d'estudi"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </button>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-red-500 tracking-wider bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                Lliçó en Vídeo Premium
              </span>
              <span className="text-white/20">|</span>
              <span className="text-xs font-bold text-slate-400 uppercase truncate text-left">
                Punt {formatConvencio}
              </span>
            </div>
            <h1 className="text-lg md:text-2xl font-black italic uppercase text-white tracking-widest leading-none text-left">
              {puntTitol}
            </h1>
          </div>
        </div>

        {/* Marcador d'Estat: si l'usuari ja ha donat per vista i consolidada aquesta classe */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={() => onMarcarCompletat(!completat)}
            className={`px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 border shadow-md transition-all active:scale-95 cursor-pointer ${
              completat 
                ? 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border-red-500/40 shadow-red-500/5' 
                : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
            }`}
          >
            <CheckCircle2 size={12} className={completat ? "text-red-500 stroke-[3]" : "text-slate-500"} />
            <span>{completat ? 'Vídeo Vist' : 'Marcar com a vist'}</span>
          </button>
        </div>
      </div>

      {/* TABS DE SELECCIÓ DE MODE DE TREBALL (NOU!) */}
      {/* Explicació per a no-programadors: Dos botons elegants per dalt del vídeo que canvien la forma en què es distribueix l'espai d'estudi d'OposiCAT */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setModePantalla('visualitzador')}
          className={`px-5 py-3 rounded-t-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all cursor-pointer ${
            modePantalla === 'visualitzador'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-slate-900/40 text-slate-400 hover:text-white border-b-2 border-transparent'
          }`}
        >
          <Play size={14} />
          <span>Visualitzador de vídeo</span>
        </button>
        <button
          onClick={() => setModePantalla('split')}
          className={`px-5 py-3 rounded-t-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all cursor-pointer ${
            modePantalla === 'split'
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-slate-900/40 text-slate-400 hover:text-white border-b-2 border-transparent'
          }`}
        >
          <PenTool size={14} />
          <span>Vídeo + Apunts</span>
        </button>
      </div>

      {/* CONTINGUT DINÀMIC SEGONS EL MODE TRIAAT */}
      {modePantalla === 'visualitzador' ? (
        // ==========================================
        // 1. ORIGINAL FULL VIEW (VISUALITZADOR ESTÀNDARD)
        // ==========================================
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* REPRODUCTOR VERMELL GEGANT */}
          <div className="w-full max-w-4xl aspect-video mx-auto relative rounded-[32px] overflow-hidden border border-red-500/20 shadow-2xl group bg-slate-950 flex flex-col items-center justify-center">
            {reproduint ? (
              <iframe 
                src={youtubeEmbedUrl}
                className="absolute inset-0 w-full h-full shadow-2xl rounded-[32px]"
                title={`Reproductor del vídeo: ${puntTitol}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div 
                className="absolute inset-0 bg-gradient-to-br from-red-650 via-red-600 to-red-800 flex flex-col items-center justify-center text-center p-8 space-y-6 cursor-pointer select-none group-hover:from-red-600 group-hover:to-red-750 transition-all duration-300"
                onClick={() => setReproduint(true)}
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/assets/images/fons_teorica_1780343152615.png')" }} />
                
                <div className="w-24 h-24 bg-white hover:scale-110 active:scale-95 text-red-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border border-white/40">
                  <Play className="w-10 h-10 fill-red-600 text-red-600 ml-1.5" />
                </div>

                <div className="space-y-2 max-w-2xl px-4 relative z-10 text-center">
                  <span className="text-[10px] font-black uppercase text-[#FFDF00] tracking-[0.25em] bg-black/35 px-3 py-1.5 rounded-full border border-yellow-500/20 backdrop-blur-md">
                    Masterclass d'Alt Estudi
                  </span>
                  <h2 className="text-xl md:text-3xl font-black italic uppercase text-white tracking-widest leading-none drop-shadow-md text-center">
                    REPRODUIR ENREGISTRAMENT COMPLET
                  </h2>
                  <p className="text-white/80 text-xs md:text-sm italic font-medium leading-relaxed text-center">
                    Tutor preparador de Seguretat Pública: Mosso Guillem. Fes clic en aquest visor vermell per obrir-lo de forma directa al campus acadèmic.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(youtubeUrl, "_blank", "noopener,noreferrer");
                    }}
                    className="px-6 py-2.5 bg-slate-950/70 hover:bg-slate-950 border border-white/10 hover:border-white/20 text-white font-black italic uppercase tracking-wider rounded-xl text-[10px] cursor-pointer transition-all active:scale-95 flex items-center gap-2"
                  >
                    <ExternalLink size={12} className="text-red-500" />
                    <span>Obrir directament a YouTube</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ELS TRES BLOCS BENTO (VERD, ROSA, BLAU AMB LA DURADA) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* BLOC VERD: PROFESSOR */}
            <div className="bg-[#00f296]/5 border border-[#00f296]/15 p-6 rounded-3xl text-left flex flex-col justify-between gap-4 shadow-lg hover:border-[#00f296]/30 transition-all duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-3 border-b border-[#00f296]/10 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00f296]/15 flex items-center justify-center text-[#00f296] border border-[#00f296]/20">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest block mb-0.5">PEÇA VERDA PROFESSOR</span>
                    <span className="text-[#00f296] font-black uppercase italic text-sm tracking-widest">MOSSO GUILLEM</span>
                  </div>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed font-semibold text-left">
                  Especialista de seguretat en actiu de la Generalitat. Professor encarregat de dret de l'ISPC i tècnica de filtratge.
                </p>
              </div>
              <div className="flex items-center gap-2.5 bg-[#00f296]/10 border border-[#00f296]/20 py-1.5 px-3 rounded-xl text-[10px] text-[#00f296] font-extrabold uppercase tracking-wide w-fit">
                <Shield size={10} className="stroke-[3]" />
                <span>Cos Oficial de Mossos</span>
              </div>
            </div>

            {/* BLOC ROSA: ESTRUCTURA */}
            <div className="bg-pink-500/5 border border-pink-500/15 p-6 rounded-3xl text-left flex flex-col justify-between gap-4 shadow-lg hover:border-pink-500/30 transition-all duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-3 border-b border-pink-500/10 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 border border-pink-500/20">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest block mb-0.5">PEÇA ROSA ESTRUCTURA</span>
                    <span className="text-pink-400 font-black uppercase italic text-sm tracking-widest">ÀMBIT {ambit}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Tema:</span>
                  <p className="text-slate-200 text-xs font-bold truncate text-left" title={temaTitol}>
                    {temaTitol}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 py-1.5 px-3 rounded-xl text-[10px] text-pink-400 font-extrabold uppercase tracking-wide w-fit">
                <Award size={10} />
                <span>Capítol format: {formatConvencio}</span>
              </div>
            </div>

            {/* BLOC BLAU: DURADA DE L'AUDIOVISUAL (MODIFICAT!) */}
            <div className="bg-blue-500/5 border border-blue-500/15 p-6 rounded-3xl text-left flex flex-col justify-between gap-4 shadow-lg hover:border-blue-500/30 transition-all duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-3 border-b border-blue-500/10 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest block mb-0.5">PEÇA BLAVA LLIÇÓ</span>
                    <span className="text-blue-400 font-black uppercase italic text-sm tracking-widest">DURADA TOTAL</span>
                  </div>
                </div>
                <div className="space-y-1 text-left">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block text-left">TEMPS DE VIDEO ENREGISTRAT:</span>
                  <p className="text-white text-base font-black italic uppercase tracking-wider text-left">
                    ⏳ 5:22 Minuts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 py-1.5 px-3 rounded-xl text-[10px] text-blue-400 font-extrabold uppercase tracking-wide w-fit">
                <Zap size={10} />
                <span>Sessió Sintètica Clau</span>
              </div>
            </div>

          </div>

          {/* FÒRUM DE COMUNITAT (QUESTIONS I RESPOSTES DE SOTA) */}
          <div className="bg-slate-900/15 border border-white/5 rounded-[32px] p-6 md:p-8 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] block">COMUNITAT ACADÈMICA</span>
                <h2 className="text-white text-base md:text-lg font-black italic uppercase flex items-center gap-2 text-left">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  Preguntes i Dubtes del Vídeo
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                {comentaris.length} Preguntes actives de l'oposició
              </span>
            </div>

            {/* Formulari de dubtes */}
            <form onSubmit={publicarNouDubte} className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block text-left">
                Tens algun dubte d'aquest tema? El Mosso Guillem et respondrà directament:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text"
                  value={nouDubteText}
                  onChange={(e) => setNouDubteText(e.target.value)}
                  placeholder="Escriu aquí el teu dubte respecte el minut o contingut de la lliçó..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs md:text-sm focus:outline-none focus:border-red-500/50 transition-all font-medium leading-relaxed"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-650 hover:bg-red-500 text-white font-black italic uppercase tracking-widest rounded-xl text-[10px] cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 border border-red-500 shrink-0"
                >
                  <Send size={10} />
                  <span>Preguntar</span>
                </button>
              </div>
            </form>

            {/* Llista de preguntes */}
            <div className="space-y-6 pt-2">
              {comentaris.map((c) => (
                <div key={c.id} className="space-y-4 border-b border-white/5 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black italic text-sm text-slate-400 shrink-0">
                        {c.autor[0]}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-extrabold text-xs uppercase italic">{c.autor}</span>
                          {c.rol === 'professor' && (
                            <span className="text-[8.5px] font-black uppercase text-[#FFDF00] tracking-wider bg-yellow-500/15 border border-yellow-500/40 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(255,223,0,0.15)] animate-pulse flex items-center gap-1">
                              <Sparkles size={10} className="fill-[#FFDF00]" />
                              Instructor OposiCAT
                            </span>
                          )}
                          <span className="text-[9px] text-slate-500">{c.faTemps}</span>
                        </div>
                        <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium text-left">
                          {c.text}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => gestionarCor(c.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10.5px] font-black transition-all active:scale-90 cursor-pointer ${
                        c.usuariHaDonatCor 
                          ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                          : 'bg-slate-950 border-white/5 text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                      }`}
                    >
                      <Heart size={12} className={c.usuariHaDonatCor ? "fill-red-500 text-red-500" : "text-slate-550"} />
                      <span>{c.mAgraves}</span>
                    </button>
                  </div>

                  {c.respostes && c.respostes.map((r) => (
                    <div key={r.id} className="ml-6 md:ml-12 bg-slate-900/40 border border-slate-850 p-4 md:p-5 rounded-2xl space-y-3 shadow-md relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-start justify-between gap-4 relative z-10">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-yellow-500 to-red-600 text-white flex items-center justify-center font-black italic text-xs shrink-0 shadow-lg border border-yellow-400/20">
                            GM
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-extrabold text-xs uppercase italic">{r.autor}</span>
                              <span className="text-[8.5px] font-black uppercase text-[#FFDF00] tracking-wider bg-yellow-500/15 border border-yellow-500/40 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(255,223,0,0.15)] animate-pulse flex items-center gap-1">
                                <Sparkles size={10} className="fill-[#FFDF00]" />
                                Instructor OposiCAT
                              </span>
                              <span className="text-[9px] text-slate-500">{r.faTemps}</span>
                            </div>
                            <p className="text-slate-350 text-xs md:text-sm leading-relaxed font-medium text-left">
                              {r.text}
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => gestionarCor(c.id, r.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10.5px] font-black transition-all active:scale-90 cursor-pointer ${
                            r.usuariHaDonatCor 
                              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                              : 'bg-slate-950 border-white/5 text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                          }`}
                        >
                          <Heart size={10} className={r.usuariHaDonatCor ? "fill-red-500 text-red-500" : "text-slate-550"} />
                          <span>{r.mAgraves}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        // ==========================================
        // 2. VIDEO + APUNTS COMPACT LAYOUT (SPLIT SCREEN - MODIFICAT!)
        // ==========================================
        // Explicació per a no-programadors: Estètica minimalista d'alt rendiment inspirada exactament en la imatge del client.
        // Dalt tenim un grid de 2 columnes:
        // - Esquerra (Àrea Vermella): Botó de retornar, professor, àmbit i tema d'estudi.
        // - Dreta (Àrea Rosa): Reproductor en mida reduïda ("petit video").
        // i a sota una immensa regió groga:
        // - Baix (Àrea Groga): Editor gegant d'apunts integrat, on l'estudiant pren notes lliurement que es guarden automàticament a la base de dades i àrea d'estudi personal.
        <div className="grid grid-cols-1 gap-6 animate-in focus-in duration-300">
          
          {/* ZONA SUPERIOR: GRID DE DUES COLUMNS (VERMELLA - ESQUERRA, ROSA - DRETA) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 2.A SECTOR ESQUERRA (ZONA VERMELLA - INFORMACIÓ EXCLUSIVA) */}
            <div className="bg-gradient-to-br from-red-950/45 to-red-900/10 border border-red-500/20 p-6 rounded-3xl flex flex-col justify-between gap-4 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-red-500/10 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/30">
                    <Shield size={20} className="text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-red-400 text-[9px] font-black uppercase tracking-widest block mb-0.5">ESTRUTURA COMPACTA</span>
                    <span className="text-white font-black uppercase italic text-sm tracking-widest">ZONA INFORMATIVA</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    📚 ÀMBIT {ambit} • Punt {formatConvencio}
                  </div>
                  <h3 className="text-white text-base font-black uppercase italic tracking-wider leading-snug">
                    {puntTitol}
                  </h3>
                  <div className="text-[11px] text-slate-350 font-medium">
                    <span className="text-red-400 font-bold uppercase">Professor:</span> Mosso Guillem
                  </div>
                </div>
              </div>

              {/* Botó integrat de darrera per canviar l'estat o revisar */}
              <button
                onClick={onTornar}
                className="w-fit flex items-center gap-2 px-4 py-2 bg-slate-900/90 hover:bg-slate-850 border border-white/5 rounded-xl text-[10px] text-slate-300 hover:text-white font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95"
              >
                <ArrowLeft size={10} />
                <span>Selector de temari</span>
              </button>
            </div>

            {/* 2.B SECTOR DRETA (ZONA ROSA - REPRODUCTOR VÍDEO COMPACT) */}
            <div className="bg-pink-500/5 border border-pink-500/25 p-4 rounded-3xl flex flex-col justify-center items-center min-h-[220px] relative overflow-hidden shadow-xl">
              <div className="absolute top-2 left-2 z-10">
                <span className="text-[8px] font-black uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                  Visualitzador reduït
                </span>
              </div>

              {reproduint ? (
                <div className="w-full max-w-md aspect-video relative rounded-2xl overflow-hidden border border-pink-500/10 shadow-lg">
                  <iframe 
                    src={youtubeEmbedUrl}
                    className="absolute inset-0 w-full h-full rounded-2xl"
                    title={`Reproductor del vídeo compact: ${puntTitol}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div 
                  onClick={() => setReproduint(true)}
                  className="bg-black/60 hover:bg-black/85 rounded-2xl border border-pink-500/10 p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer select-none w-full max-w-md aspect-video transition-all shadow-md"
                >
                  <div className="w-14 h-14 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-black uppercase tracking-widest text-center">
                      Iniciar reproducció
                    </h4>
                    <p className="text-slate-400 text-[10px] italic text-center">
                      Lliçó comprimida ⏳ 5:22 min
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* 2.C ZONA INFERIOR (ZONA GROGA - EDITOR GEGANT D'APUNTS D'ALT ESTUDI) */}
          <div className="bg-yellow-500/5 border border-yellow-500/25 p-6 rounded-[28px] space-y-4 shadow-2xl relative text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-yellow-500/15 pb-3">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 bg-yellow-500/15 border border-yellow-500/25 rounded-xl text-yellow-500">
                  <PenTool size={18} />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-black uppercase italic text-yellow-400 tracking-widest text-left">
                    Quadern d'Apunts Personalitzat (Estudi actiu OposiCAT)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold text-left">
                    Aquesta informació es guarda en temps real a l'àrea d'estudi d'oposicions
                  </p>
                </div>
              </div>

              {/* Símbol d'estat de desat interactiu i asíncron */}
              <div className="shrink-0 self-end sm:self-center">
                {estatDesant === 'desant' && (
                  <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                    Desant anotacions en directe...
                  </span>
                )}
                {estatDesant === 'desat' && (
                  <span className="text-[9px] font-bold text-[#00f296] flex items-center gap-1.5 bg-[#00f296]/10 px-3 py-1 rounded-lg border border-[#00f296]/20">
                    <CheckCircle2 size={10} className="stroke-[3]" />
                    Desat i Sincronitzat a OposiCAT cloud
                  </span>
                )}
                {estatDesant === 'quiet' && (
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-900 border border-white/5 px-2 py-1 rounded-lg">
                    Apunts actius ({userNotes.length} lletres)
                  </span>
                )}
              </div>
            </div>

            {/* Àrea d'edició d'apunts gegant i completament responsive */}
            <textarea 
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Comença a escriure aquí les teves mnemotècnies, definicions, esquematització de dret, dubtes o dates de l'Estatut per guardar-les i recuperar-les després en la teva Àrea d'Estudia Personal..."
              className="w-full min-h-[320px] bg-slate-950/90 border border-yellow-500/25 rounded-xl p-5 text-white text-xs md:text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all resize-y font-sans leading-relaxed selection:bg-yellow-500/25"
            />

            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[10px] text-yellow-400 font-semibold leading-relaxed">
              <Save size={12} className="shrink-0" />
              <span>
                Recordatori: Tot el que escriguis aquí es fusionarà dinàmicament sota la fitxa del tema d'oposició actiu, garantint un accés àgil des de qualsevol tablet o mòbil.
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
