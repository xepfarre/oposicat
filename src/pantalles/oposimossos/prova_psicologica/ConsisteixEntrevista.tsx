import React from 'react';
import { 
  ChevronLeft, 
  Award, 
  HelpCircle, 
  Scale, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  UserCheck, 
  Layers, 
  Target, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  Globe
} from 'lucide-react';

/* =============================================================================
 * COMPONENT: ConsisteixEntrevista
 * -----------------------------------------------------------------------------
 * Explicació per a no-programadors:
 * Aquest component mostra la guia pedagògica, transparent i tranquil·litzadora
 * sobre el funcionament, criteris de correcció, preguntes habituals i sistema
 * d'avaluació de l'Entrevista Personal de la Policia de la Generalitat - Mossos d'Esquadra (PGME).
 * 
 * Estructura de blocs modulars:
 * - CAPÇALERA: L'avaluació presencial del teu perfil policial
 * - BLOC 1: Com es puntua l'entrevista? (10 Competències Clau + De 0 a 100 punts + Enllaç a Competències)
 * - BLOC 2: Què es valora a l'entrevista? (Coherència i Maduresa + Pauta de Conducta + Resum)
 * - BLOC 3: Què pregunten a l'entrevista? (3 Vies: Aclariment Biodata, Preguntes Estàndard amb enllaç de pràctica, Preguntes Prospectives)
 * - BLOC 4: És cert que els entrevistadors volen suspendre't? (Objectiu de buscar motius per aprovar-te)
 * - BLOC 5: Quan i com sabré la nota? (Publicació a la web de la Generalitat i tall dels 50 pts = APTE/A)
 * ============================================================================= */

interface ConsisteixEntrevistaProps {
  onTornar: () => void;
  onTornarMenuPrincipal: () => void;
  onPracticarEntrevista?: () => void;
  onAnarCompetencies?: () => void;
}

export const ConsisteixEntrevista: React.FC<ConsisteixEntrevistaProps> = ({
  onTornar,
  onTornarMenuPrincipal,
  onPracticarEntrevista,
  onAnarCompetencies,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-7 animate-in fade-in duration-200 text-left font-sans pb-12">
      
      {/* ========================================================================= */}
      {/* ENLLAÇ DISCRET DE TORNADA SUPERIOR */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between">
        <button
          onClick={onTornar}
          className="group inline-flex items-center gap-2 text-slate-300 hover:text-[#FFDF00] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
          id="btn-tornar-menu-entrevista-top"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Tornar a la Prova Entrevista</span>
        </button>

        {/* Etiqueta d'estat de la fase */}
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-400/20 px-3 py-1 rounded-full font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          Guia Oficial de l'Entrevista
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 1. CAPÇALERA MINIMALISTA I INDICADORS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
        <div>
          <span className="text-[10px] text-[#FFDF00] font-black uppercase tracking-widest block font-mono">
            3A FASE : PROVA PSICOPROFESSIONAL
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-0.5">
            EN QUÈ CONSISTEIX L'ENTREVISTA
          </h1>
        </div>

        {/* Indicadors resumits de l'entrevista */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className="text-[11px] text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-400/20 font-mono">
            5 Blocs Clau
          </span>
          <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-400/20 font-mono">
            Escala 0-100 pts
          </span>
          <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-400/20 font-mono">
            Mínim: 50 pts (APTE/A)
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TARGETA D'INTRODUCCIÓ: SÍNTESI DIDÀCTICA */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800/70 pb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-black text-sm sm:text-base uppercase tracking-wider">
              L'AVALUACIÓ PRESENCIAL DEL TEU PERFIL POLICIAL
            </h2>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          L'entrevista no és un judici ni un interrogatori: és una conversa professional dissenyada per conèixer la persona que hi ha darrere del paper. El tribunal utilitzarà el teu Biodata com a mapa de ruta per comprovar com raones, com gestiones la pressió i quins valors guien la teva presa de decisions.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* BLOC 1: COM ES PUNTUA L'ENTREVISTA? */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-5 hover:border-cyan-500/30 transition-colors">
        <div className="flex items-start gap-3.5 border-b border-slate-800/70 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider font-mono">
              BLOC 1
            </span>
            <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-wide">
              Com es puntua l'entrevista?
            </h3>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          La nota final no surt de la simpatia que despertis ni d'un criteri subjectiu, sinó d'un sistema baremat que creua el teu test competencial previ amb el que defenses cara a cara.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Subtargeta 1: 10 Competències Clau */}
          <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs sm:text-sm">
                <Target className="w-4 h-4 shrink-0" />
                <span>10 Competències Clau</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                Cada competència rep una nota numèrica individual. No cal ser perfecte a totes, però sí demostrar un perfil equilibrat i sense carències crítiques.
              </p>
            </div>

            {/* Enllaç Saber-ne més cap a Competències Clau */}
            {onAnarCompetencies && (
              <div className="pt-2">
                <button
                  onClick={onAnarCompetencies}
                  id="btn-saber-mes-competencies"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer group bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-400/20"
                >
                  <span>Saber-ne més</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

          {/* Subtargeta 2: De 0 a 100 punts */}
          <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4.5 space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                <Award className="w-4 h-4 shrink-0" />
                <span>De 0 a 100 punts</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                La teva puntuació global és la suma ponderada de totes les àrees. Per assolir l'Apte/a necessites un mínim de <strong className="text-amber-400 font-mono">50 punts</strong> i no caure per sota del llindar en les competències eliminatòries.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BLOC 2: QUÈ ES VALORA A L'ENTREVISTA? */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-5 hover:border-cyan-500/30 transition-colors">
        <div className="flex items-start gap-3.5 border-b border-slate-800/70 pb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono">
              BLOC 2
            </span>
            <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-wide">
              Què es valora a l'entrevista?
            </h3>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          Abans que entris per la porta, els psicòlegs ja han llegit el teu expedient. La seva feina no és descobrir dades noves, sinó posar-les a prova:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Subtargeta 1: Coherència i Maduresa */}
          <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4.5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>Coherència i Maduresa</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
              Comprovem que el teu projecte vital, els motius per voler ser policia i la teva trajectòria personal tinguin sentit i solidesa argumental.
            </p>
          </div>

          {/* Subtargeta 2: Pauta de Conducta */}
          <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4.5 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm">
              <Layers className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Pauta de Conducta</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
              El test dona una radiografia de com reacciones davant de determinats escenaris; a l'entrevista comprovaran si aquest perfil coincideix amb la realitat.
            </p>
          </div>
        </div>

        {/* Banner Inferior: En resum */}
        <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            <strong className="text-white">En resum:</strong> Busquen assegurar-se que la persona que s'incorporarà a l'ISPC té el tarannà, l'estabilitat i la responsabilitat que exigeix portar una placa i una arma.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BLOC 3: QUÈ PREGUNTEN A L'ENTREVISTA? */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-5 hover:border-cyan-500/30 transition-colors">
        <div className="flex items-start gap-3.5 border-b border-slate-800/70 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">
              BLOC 3
            </span>
            <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-wide">
              Què pregunten a l'entrevista?
            </h3>
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          No hi ha dues entrevistes idèntiques, però totes es construeixen combinant tres tipus de preguntes:
        </p>

        <div className="space-y-3 pt-1">
          {/* Targeta 1: Preguntes d'Aclariment (Biodata) */}
          <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-black text-xs shrink-0 font-mono">
              1
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-xs sm:text-sm">
                Preguntes d'Aclariment (Biodata)
              </h4>
              <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                Serveixen per aclarir el que has posat en el Biodata, en l'examen 1 de desenvolupar. Buscaran contrastar i fer preguntes sobre temes que els hi hagin cridat l'atenció tant per ben raonats com per mal raonats.
              </p>
            </div>
          </div>

          {/* Targeta 2: Preguntes Estàndard */}
          <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-400 font-black text-xs shrink-0 font-mono">
              2
            </div>
            <div className="space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-white font-bold text-xs sm:text-sm">
                  Preguntes Estàndard
                </h4>
                <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                  Són una bateria de preguntes que tenen com a guia per fer durant la sessió, depenent de com es desenvolupi la sessió en faran unes o unes altres del seu interès.
                </p>
              </div>

              {/* Botó / Enllaç per anar a practicar les preguntes estàndard */}
              {onPracticarEntrevista && (
                <div className="pt-2">
                  <button
                    onClick={onPracticarEntrevista}
                    id="btn-saber-mes-preguntes-estandard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer group bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-400/20"
                  >
                    <span>Saber-ne més</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Targeta 3: Preguntes Prospectives */}
          <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-black text-xs shrink-0 font-mono">
              3
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-bold text-xs sm:text-sm">
                Preguntes Prospectives
              </h4>
              <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                Els psicòlegs tenen la potestat i l'obligació de sortir-se de les preguntes estàndard quan consideren oportú aprofundir en temes del seu interès. Poden començar per una pregunta estàndard i veure que la resposta que dones dóna peu a fer-ne d'altres per aprofundir en el tema.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BLOC 4: ÉS CERT QUE ELS ENTREVISTADORS VOLEN SUSPENDRE'T? */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-5 hover:border-emerald-500/30 transition-colors">
        <div className="flex items-start gap-3.5 border-b border-slate-800/70 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">
              BLOC 4
            </span>
            <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-wide">
              És cert que els entrevistadors volen suspendre't?
            </h3>
          </div>
        </div>

        {/* Badge / Pill verd tranquil·litzador */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-emerald-400 font-black text-xs uppercase tracking-wider font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>NO, EL SEU OBJECTIU ÉS BUSCAR MOTIUS PER APROVAR-TE.</span>
        </div>

        <div className="space-y-3.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            És habitual sortir de l'entrevista amb la sensació d'haver estat qüestionat contínuament. Tanmateix, la dinàmica és just la contrària: si un entrevistador insisteix repetidament sobre un tema (com l'autocontrol o la jerarquia), <strong className="text-white">no t'està atacant, t'està donant noves oportunitats per recuperar una competència que ha quedat fluixa</strong>.
          </p>

          <div className="bg-[#070e1b] rounded-xl border border-emerald-500/20 p-4.5 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-[#FFDF00] shrink-0 mt-0.5" />
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed">
              Si noten dubtes, no donen la competència per perduda: reformulen la pregunta per veure si ets capaç de redreçar la resposta. Quan sentis pressió, mantén la calma: <strong className="text-white">és el moment d'argumentar amb seguretat</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BLOC 5: QUAN I COM SABRÉ LA NOTA? */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-5 hover:border-amber-500/30 transition-colors">
        <div className="flex items-start gap-3.5 border-b border-slate-800/70 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider font-mono">
              BLOC 5
            </span>
            <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-wide">
              Quan i com sabré la nota?
            </h3>
          </div>
        </div>

        <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            Després de la sessió, el tribunal unifica les notes de les 10 competències i tanca la teva acta d'avaluació.
          </p>

          <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4 flex items-start gap-3">
            <Globe className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed">
              Quan finalitzin totes les entrevistes del procés selectiu, els resultats definitius <strong className="text-white">sortiran publicats oficialment a la web de la Generalitat de Catalunya</strong> (portal de processos selectius).
            </p>
          </div>

          {/* Targeta destacada del resultat APTE/A */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#070e1b] to-emerald-950/30 border-2 border-emerald-500/40 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest font-mono block">
                RESOLUCIÓ DEL PROCÉS
              </span>
              <p className="text-white font-bold text-sm sm:text-base leading-snug">
                Superar el tall dels <span className="text-[#FFDF00] font-black font-mono">50 punts</span> sense suspendre cap competència eliminatòria.
              </p>
            </div>

            <div className="bg-emerald-500 text-slate-950 font-black text-lg sm:text-xl px-6 py-2.5 rounded-full uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0 animate-pulse">
              APTE / A !
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTONS DE NAVEGACIÓ I ACCIÓ DIRECTA */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 pt-6">
        {onPracticarEntrevista && (
          <button
            onClick={onPracticarEntrevista}
            id="btn-anar-practicar-entrevista-des-de-guia"
            className="inline-flex items-center gap-2 bg-[#FFDF00] hover:bg-[#ffe633] text-slate-950 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg active:scale-95 hover:-translate-y-0.5"
          >
            <span>Practicar l'entrevista</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onTornar}
          id="btn-tornar-menu-entrevista-bottom"
          className="group inline-flex items-center gap-2 bg-[#020b18] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-3 rounded-full text-xs font-black italic uppercase tracking-wider text-[#FFDF00] transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Tornar a la Prova Entrevista</span>
        </button>

        <button
          onClick={onTornarMenuPrincipal}
          id="btn-tornar-menu-principal-entrevista-bottom"
          className="inline-flex items-center gap-2 bg-[#020b18] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-3 rounded-full text-xs font-black italic uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
        >
          <span>Menú principal</span>
        </button>
      </div>

    </div>
  );
};
