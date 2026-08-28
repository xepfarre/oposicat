import React from 'react';
import { ChevronLeft, ArrowRight, Layers, Award, FileText, Users, Sparkles, CheckCircle2 } from 'lucide-react';

/* 
  Explicació per a no-programadors:
  Aquest component és la pantalla que explica detalladament en què consisteix la 
  Prova d'Adequació Psicoprofessional (Fase 3 de les oposicions de Mossos d'Esquadra).
  
  Disseny minimalista i elegant:
  - Títol clar, directe i integrat sense caixes pesades.
  - Icones estilitzades a cada encapçalament (Estructura de la Fase, Criteris de Valoració, Biodata i Entrevista).
  - Blocs de contingut amb fons fosc translúcid, vora subtil i lectura còmoda.
  - Targeta Hero destacada al final amb el Mètode de Preparació Integral (4 passos + CTA).
*/

interface ConsisteixProvaPsicologicaProps {
  onTornar: () => void;
  onObrirCompetencies?: () => void;
}

export const ConsisteixProvaPsicologica: React.FC<ConsisteixProvaPsicologicaProps> = ({
  onTornar,
  onObrirCompetencies,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-left font-sans pb-8 animate-in fade-in duration-200">
      
      {/* Botó subtil i elegant per tornar a la selecció de prova */}
      <div className="flex items-center justify-between">
        <button
          onClick={onTornar}
          className="group inline-flex items-center gap-2 text-slate-300 hover:text-[#FFDF00] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-white/5"
          id="btn-tornar-menu-psico"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Tornar a la selecció de prova</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TÍTOL DIRECTE I MINIMALISTA */}
      {/* ========================================================================= */}
      <div className="space-y-1 pt-1 pb-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
          En què consisteix la prova d’adequació psicoprofessional?
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* BLOC 1: ESTRUCTURA DE LA FASE AMB ICONA */}
      {/* ========================================================================= */}
      <div className="bg-[#020f22]/75 backdrop-blur-md border border-white/10 p-6 sm:p-7 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
            ESTRUCTURA DE LA FASE — QUINES PROVES COMPRÈN?
          </h2>
        </div>
        <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3">
          {/* Explicació per a no-programadors: Paràgraf 1 (Introducció) */}
          <p>
            Aquesta fase està formada per la suma de dues proves independents que es realitzen en dies separats: el <strong className="text-sky-300 font-semibold">Biodata</strong> i l'<strong className="text-sky-300 font-semibold">Entrevista personal</strong>.
          </p>
          {/* Explicació per a no-programadors: Paràgraf 2 (Resum Biodata) */}
          <p>
            En primer lloc, el <strong className="text-sky-300 font-semibold">Biodata</strong> recopila la teva trajectòria i trets personals mitjançant el qüestionari biogràfic i el test de personalitat, amb l'objectiu de generar un <strong className="text-emerald-400 underline font-semibold">informe competencial</strong> complet sobre el teu perfil.
          </p>
          {/* Explicació per a no-programadors: Paràgraf 3 (Resum Entrevista) */}
          <p>
            Posteriorment, a l'<strong className="text-sky-300 font-semibold">Entrevista personal</strong>, el tribunal avaluador pren com a referència aquest perfil previ per formular <strong className="text-emerald-400 font-semibold">preguntes prospectives</strong> i plantejar supòsits policials, professionals, laborals i personals, determinant si ets apte per a la funció policial.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BLOC 2: CRITERIS DE VALORACIÓ I PUNTUACIÓ AMB ICONA */}
      {/* ========================================================================= */}
      <div className="bg-[#020f22]/75 backdrop-blur-md border border-white/10 p-6 sm:p-7 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Award className="w-4 h-4 text-[#FFDF00] shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
            CRITERIS DE VALORACIÓ I PUNTUACIÓ
          </h2>
        </div>
        <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3">
          {/* Explicació per a no-programadors: Paràgraf 1 (El sistema de 10 competències i requisits per aprovar) */}
          <p>
            Ambdues proves s'estructuren sobre l'avaluació de <strong className="text-white font-semibold">10 competències clau</strong>: cada resposta que donis sumarà o restarà puntuació a cadascuna d'elles. Per superar la fase cal assolir una <strong className="text-emerald-400 font-semibold">puntuació global mínima de 50 punts</strong> (sobre 100) i, a més, tenir en compte que <strong className="text-rose-400 font-semibold">3 d'aquestes competències són eliminatòries</strong>; suspendre'n només una suposa l'exclusió directa del procés.
          </p>
          
          {/* Explicació per a no-programadors: Paràgraf 2 (Trencar clixés i necessitat d'enfocament competencial) */}
          <p>
            Cal allunyar-se de clixés com <em>«soc bona persona»</em>, <em>«vull ajudar la gent»</em>, <em>«sé arts marcials i puc defensar-me»</em> o <em>«tinc molta vocació»</em>. Si les teves respostes no s'articulen demostrant conductes associades a les competències clau exigides, no sumaràs punts o fins i tot en podràs perdre.
          </p>

          {/* Explicació per a no-programadors: Paràgraf 3 (Crida a l'acció / Enllaç cap a Competències Clau) */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-white/5">
            <p className="max-w-xl">
              Com que es tracta d'un sistema tècnic i complex, si vols aprofundir en el barem i funcionament exacte de la puntuació, pots consultar l'apartat dedicat:
            </p>
            <button
              type="button"
              onClick={() => {
                if (onObrirCompetencies) {
                  onObrirCompetencies();
                }
              }}
              className="inline-flex items-center gap-2 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black px-4 py-2 rounded-lg text-xs tracking-wider uppercase transition-all cursor-pointer active:scale-95 shrink-0 shadow-md"
              id="btn-enllac-competencies-clau"
            >
              <span>«COMPETÈNCIES CLAU»</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DUES CAIXES INFERIORS: BIODATA (ESQUERRA) I ENTREVISTA (DRETA) AMB ICONES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        
        {/* Caixa 1: PROVA 1 - BIODATA */}
        <div className="bg-[#020f22]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                PROVA 1 - BIODATA
              </h3>
            </div>

            {/* PARÀGRAF 1 (Importància estratègica) */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              El <strong className="text-sky-300 font-semibold">Biodata</strong> és la peça clau de tota la fase. Un bon exercici et pot aplanar el camí cap a l'aprovat a l'entrevista; en canvi, un mal Biodata pot fer que arribis a l'entrevista pràcticament suspès. Tingues en compte que, encara que el Biodata no hagi anat bé, aniràs igualment a l'entrevista personal, ja que la qualificació final no es publica fins a la conclusió de totes dues proves.
            </p>

            {/* PARÀGRAF 2 (Estructura de la jornada: 2 proves) */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Durant la jornada del Biodata realitzaràs dues proves diferenciades: el <strong className="text-emerald-400 font-semibold">Qüestionari biogràfic</strong> i el <strong className="text-emerald-400 font-semibold">Test competencial</strong>.
            </p>

            {/* BLOC 1: Qüestionari biogràfic (Format escrit) */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs sm:text-sm text-slate-300">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                BLOC 1: QÜESTIONARI BIOGRÀFIC (FORMAT ESCRIT)
              </h4>
              <p className="text-slate-300">
                És un examen de preguntes obertes a desenvolupar per escrit, estructurat en 4 blocs:
              </p>
              <ul className="space-y-1.5 pl-2 text-xs text-slate-300 leading-relaxed">
                <li>• <strong className="text-slate-100">Àmbit personal:</strong> dades personals, entorn familiar, convivència, lloc de residència i edat.</li>
                <li>• <strong className="text-slate-100">Trajectòria acadèmica:</strong> títols oficials, idiomes i formacions clau que defineixen el teu perfil.</li>
                <li>• <strong className="text-slate-100">Trajectòria laboral:</strong> historial complet de feines prèvies amb les dates exactes d'alta i baixa.</li>
                <li>• <strong className="text-slate-100">Àmbit policial:</strong> motivació pel cos de Mossos d'Esquadra, punts forts i especialitats d'interès.</li>
              </ul>
            </div>

            {/* BLOC 2: Test competencial (Format tipus test) */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs sm:text-sm text-slate-300">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                BLOC 2: TEST COMPETENCIAL (FORMAT TIPUS TEST)
              </h4>
              <p className="text-slate-300 leading-relaxed">
                És un examen de 80 preguntes amb molt poc temps per respondre i pensar (25 minuts). El format exacte pot variar segons l'any:
              </p>
              <ul className="space-y-1.5 pl-2 text-xs text-slate-300 leading-relaxed">
                <li>• <strong className="text-slate-100">Format d'ordenació:</strong> ordenar 3 opcions de major a menor afinitat.</li>
                <li>• <strong className="text-slate-100">Format d'elecció única:</strong> seleccionar 1 sola opció d'entre 3 alternatives.</li>
              </ul>
              <p className="text-slate-300 leading-relaxed pt-1">
                <strong className="text-[#FFDF00] font-semibold">Cada resposta que tries suma punts a una competència i en resta d'una altra.</strong> Per aquest motiu, treballarem a fons com respondre estratègicament per aconseguir un <strong className="text-pink-400 font-semibold">perfil equilibrat</strong> i no descompensar cap competència clau.
              </p>
            </div>
          </div>
        </div>

        {/* Caixa 2: ENTREVISTA PERSONAL */}
        <div className="bg-[#020f22]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <Users className="w-4 h-4 text-[#FFDF00] shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                ENTREVISTA PERSONAL
              </h3>
            </div>

            {/* PARÀGRAF 1 (Importància i preparació) */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Aquesta és la fase més crítica de tot el procés selectiu. <strong className="text-[#FFDF00] font-semibold">Durant la preparació la desmitificarem i la practicarem en totes les seves fases perquè perdis la por i aprenguis, de manera clara i estructurada, com superar la prova amb èxit.</strong>
            </p>

            {/* PARÀGRAF 2 (El punt de partida del tribunal) */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A la prova prèvia (<strong className="text-sky-300 font-semibold">Biodata</strong>) s'avaluen 10 competències clau (de 0 a 10 cadascuna). Com que aniràs a l'entrevista sense saber la teva nota prèvia —pots tenir una mitjana baixa o una nota alta amb alguna competència eliminatòria per sota del mínim—, cal preparar una entrevista impecable. Els entrevistadors tenen davant una radiografia del teu perfil i buscaran contrastar directament si ets apte com a futur agent de Mossos d'Esquadra.
            </p>

            {/* PARÀGRAF 3 (Estructura en 6 blocs i flexibilitat) */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs sm:text-sm text-slate-300">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF00]" />
                ESTRUCTURA EN 6 BLOCS
              </h4>
              <p className="text-slate-300 leading-relaxed">
                L'entrevista segueix una estructura clara basada en 6 blocs (pràcticament idèntics als àmbits del Biodata):
              </p>
              <ul className="space-y-1.5 pl-2 text-xs text-slate-300 leading-relaxed">
                <li>• <strong className="text-slate-100">Preguntes inicials:</strong> presa de contacte, trencar el gel i verificació de dades bàsiques.</li>
                <li>• <strong className="text-slate-100">Formació:</strong> anàlisi del teu recorregut acadèmic i motius de les teves decisions formatives.</li>
                <li>• <strong className="text-slate-100">Experiència laboral:</strong> aprofundiment en el teu historial professional, relacions laborals i gestió de problemes.</li>
                <li>• <strong className="text-slate-100">Preguntes personals:</strong> estil de vida, gestió de l'estrès, entorn familiar i autocontrol.</li>
                <li>• <strong className="text-slate-100">Preguntes sobre MMEE:</strong> coneixement de l'organització, motivació pel cos, valors i resolució de supòsits policials.</li>
                <li>• <strong className="text-slate-100">Cloenda:</strong> tram final on et cedeixen la paraula per si vols afegir, aclarir o matisar qualsevol aspecte.</li>
              </ul>
            </div>

            {/* PARÀGRAF 4 (Dinàmica del tribunal) */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-1.5 text-xs sm:text-sm text-slate-300">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF00]" />
                DINÀMICA DEL TRIBUNAL
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Segons les teves respostes, el tribunal pot allargar-se més en un bloc o fins i tot sortir del guió previst per aprofundir en un tema concret. Això no és ni positiu ni negatiu: simplement necessiten esvair qualsevol dubte sobre el teu perfil, ja que la seva responsabilitat és verificar la idoneïtat de qui portarà una arma de foc i representarà la seguretat pública.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TARGETA DESTACADA (HERO / BANNER): EL NOSTRE MÈTODE — PREPARACIÓ INTEGRAL */}
      {/* ========================================================================= */}
      <div 
        id="card-metode-preparacio-integral"
        className="relative overflow-hidden bg-gradient-to-br from-[#0c1629] via-[#0e1b33] to-[#142342] border-2 border-amber-400/40 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-amber-950/20 space-y-6 mt-6"
      >
        {/* Fons subtil amb reflex daurat */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Capçalera de la targeta */}
        <div className="relative space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-[#FFDF00]">
              <Sparkles className="w-5 h-5 shrink-0 text-[#FFDF00]" />
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-white">
              EL NOSTRE MÈTODE — PREPARACIÓ INTEGRAL I 100% CONNECTADA
            </h2>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-[#FFDF00] italic leading-snug pl-1">
            Una preparació efectiva exigeix que el <strong className="text-pink-400 font-semibold not-italic">Biodata</strong> i l'<strong className="text-pink-400 font-semibold not-italic">Entrevista</strong> es treballin com una única unitat avaluadora, tal com fa el tribunal oficial.
          </h3>
        </div>

        {/* Paràgraf d'introducció */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
          A la prova oficial, <strong className="text-pink-400 font-semibold">l'entrevista</strong> no és un qüestionari aïllat ni genèric: és una avaluació basada estrictament en les dades i el mapa competencial que has definit prèviament al teu <strong className="text-pink-400 font-semibold">Biodata</strong>. Per aquest motiu, el nostre sistema d'entrenament <strong className="text-sky-300 font-semibold">connecta totes dues fases de forma inseparable</strong>, reproduint fidelment el circuit i els criteris del tribunal avaluador.
        </p>

        {/* Graella de 4 passos del mètode (1 columna en mòbil, 2 columnes en escriptori) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          {/* Pas 1 */}
          <div className="bg-[#070e1c]/80 backdrop-blur-sm border border-white/10 hover:border-amber-400/30 transition-colors p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md flex flex-col justify-start">
            <div className="flex items-center gap-2 text-[#FFDF00] font-black text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>1. Elaboració estratègica del Biodata</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
              T'ensenyem a respondre el qüestionari i el test competencial per construir un perfil psicoprofessional sòlid, coherent i equilibrat.
            </p>
          </div>

          {/* Pas 2 */}
          <div className="bg-[#070e1c]/80 backdrop-blur-sm border border-white/10 hover:border-amber-400/30 transition-colors p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md flex flex-col justify-start">
            <div className="flex items-center gap-2 text-[#FFDF00] font-black text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>2. Generació del teu informe competencial</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
              A partir de les teves respostes, elaborem el teu perfil psicoprofessional per identificar amb precisió punts forts i àrees de millora.
            </p>
          </div>

          {/* Pas 3 */}
          <div className="bg-[#070e1c]/80 backdrop-blur-sm border border-white/10 hover:border-amber-400/30 transition-colors p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md flex flex-col justify-start">
            <div className="flex items-center gap-2 text-[#FFDF00] font-black text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>3. Simulacres 1 a 1 orientats al teu perfil</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
              Els nostres psicòlegs preparen l'entrevista prenent com a base el teu informe, practicant supòsits concrets on l'òrgan avaluador aprofundirà.
            </p>
          </div>

          {/* Pas 4 */}
          <div className="bg-[#070e1c]/80 backdrop-blur-sm border border-white/10 hover:border-amber-400/30 transition-colors p-4 sm:p-5 rounded-2xl space-y-1.5 shadow-md flex flex-col justify-start">
            <div className="flex items-center gap-2 text-[#FFDF00] font-black text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>4. Devolució tècnica i correcció de conductes</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
              Rebràs una valoració detallada sobre com defensar el teu resultat del biodata el dia de l'entrevista i demostrar que el perfil exigit per al cos de Mossos d'Esquadra s'adequa al teu perfil.
            </p>
          </div>

        </div>

        {/* Botó Call-To-Action (CTA) */}
        <div className="pt-3 flex justify-center sm:justify-start">
          <button
            id="btn-cta-programa-entrenament"
            type="button"
            onClick={() => {
              // Explicació per a no-programadors: Enllaç d'acció cap a la preparació o informació del programa
            }}
            className="group inline-flex items-center justify-center gap-2.5 bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black px-6 sm:px-8 py-3.5 rounded-full text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 cursor-pointer active:scale-95 border-2 border-amber-300/40"
          >
            <span>DESCOBREIX EL PROGRAMA D'ENTRENAMENT PERSONALITZAT</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>

    </div>
  );
};
