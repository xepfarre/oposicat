import React, { useState } from 'react';
import { Target, Search, ChevronDown, ChevronUp, CheckCircle2, ChevronLeft, Award, Sparkles, BookOpen } from 'lucide-react';

/* =============================================================================
 * COMPONENT: CompetenciesClauWeb
 * -----------------------------------------------------------------------------
 * Explicació per a no-programadors:
 * Aquest component mostra les 10 Competències Clau oficials de la Policia de la
 * Generalitat - Mossos d'Esquadra (PGME) per a la Prova Psicològica i Biodata.
 * 
 * Estructura visual:
 * 1. Capçalera neta amb títol i comptador oficial (10 competències).
 * 2. Targeta d'introducció didàctica sobre com avalua el tribunal i els psicòlegs.
 * 3. Cercador ràpid i botó per desplegar/plegar totes les targetes.
 * 4. Llistat interactiu de les 10 targetes de competències clau amb indicadors de conducta.
 * 5. Targeta de cloenda didàctica amb consells d'alt rendiment.
 * 6. Botons de navegació inferior ("Tornar a la Prova Biodata" i "Menú principal").
 * ============================================================================= */

interface CompetenciaItem {
  id: number;
  titol: string;
  descripcio: string;
  categoria?: string;
  punts: string[];
}

interface CompetenciesClauWebProps {
  onTornar: () => void;
  onTornarMenuPrincipal: () => void;
  onAnarBiodata?: () => void;
  onAnarEntrevista?: () => void;
}

export const CompetenciesClauWeb: React.FC<CompetenciesClauWebProps> = ({
  onTornar,
  onTornarMenuPrincipal,
  onAnarBiodata,
  onAnarEntrevista,
}) => {
  // Estat per controlar quines targetes estan desplegades (per defecte totes plegades/tancades)
  const [obertes, setObertes] = useState<number[]>([]);
  const [cerca, setCerca] = useState<string>('');

  // Llistat oficial de les 10 competències clau segons el temari i tribunals de PGME
  const competencies: CompetenciaItem[] = [
    {
      id: 1,
      titol: "Habilitats socials i comunicatives",
      descripcio: "Coherència, assertivitat i claredat en l'expressió verbal i no verbal davant la ciutadania i comandaments.",
      categoria: "Relacional i Expressió",
      punts: [
        "Manté coherència entre el llenguatge verbal i l'expressió corporal.",
        "Expressa idees de forma clara i estructurada per facilitar la comprensió.",
        "S'ajusta amb facilitat a diferents nivells i registres de comunicació.",
        "Identifica les emocions pròpies i alienes per gestionar les interaccions.",
        "Expressa opinions i defensa criteris amb respecte i asseveració."
      ]
    },
    {
      id: 2,
      titol: "Orientació de servei a la ciutadania",
      descripcio: "Sensibilitat social, empatia amb les víctimes i vocació de protecció del bé comú de la societat catalana.",
      categoria: "Servei Públic",
      punts: [
        "Escolta i dona solucions proactives a les necessitats de la societat.",
        "Aplica un tracte educat, correcte i professional en les relacions.",
        "Mostra sensibilitat extrema cap a les víctimes i la diversitat social.",
        "Comprèn com les seves accions impacten en el col·lectiu i la institució."
      ]
    },
    {
      id: 3,
      titol: "Treball en equip i col·laboració",
      descripcio: "Cohesió de grup, cooperació en binomis operatius i foment d'un clima professional positiu.",
      categoria: "Interpersonal",
      punts: [
        "Reconeix i valora la feina realitzada per la resta de companys.",
        "Fomenta el flux d'informació dins de l'unitat de treball.",
        "Promou un bon ambient per assolir els objectius del grup.",
        "S'integra i s'adapta al ritme operatiu dels altres membres de l'equip."
      ]
    },
    {
      id: 4,
      titol: "Adaptabilitat i flexibilitat",
      descripcio: "Agilitat mental davant de canvis sobtats d'escenari, horaris, torns o directrius operatives.",
      categoria: "Operativa",
      punts: [
        "Accepta i integra crítiques o opinions noves amb agilitat mental.",
        "S'ajusta a canvis sobtats de tasques o entorns segons la necessitat.",
        "Capacitat per treballar sota diferents condicions operatives.",
        "Modifica l'enfocament personal segons evoluciona la situació."
      ]
    },
    {
      id: 5,
      titol: "Autocontrol i gestió de l'estrès",
      descripcio: "Manteniment de la calma, serenitat de judici i autocontrol emocional sota situacions d'alta tensió.",
      categoria: "Emocional i Pressió",
      punts: [
        "Conserva la serenitat en imprevistos per actuar amb criteri.",
        "Desenvolupa respostes eficaces en situacions de molta tensió.",
        "Ajusta el ritme de treball a les altes exigències sense perdre eficàcia."
      ]
    },
    {
      id: 6,
      titol: "Autogestió i creixement personal",
      descripcio: "Autocrítica constructiva, integritat, maduresa i voluntat constant de superació i millora tècnica.",
      categoria: "Desenvolupament",
      punts: [
        "Encara els reptes diaris amb autoconfiança i seguretat.",
        "Assumeix les conseqüències de les seves decisions amb integritat.",
        "Coneix els seus punts forts i àrees de millora per ser més eficient.",
        "Busca constantment la millora de les seves capacitats professionals.",
        "Accepta les errades pròpies amb una mentalitat constructiva."
      ]
    },
    {
      id: 7,
      titol: "Compromís amb l'organització",
      descripcio: "Alineació amb els valors de la PGME, respecte a la línia jeràrquica i compliment del Codi Deontològic.",
      categoria: "Institucional",
      punts: [
        "Enfoca l'esforç cap als objectius i valors dels Mossos d'Esquadra.",
        "Accepta i respecta l'estructura jeràrquica del cos.",
        "Segueix estrictament les normes ètiques, legals i socials.",
        "Transmet una imatge de seriositat i prestigi com a representant institucional."
      ]
    },
    {
      id: 8,
      titol: "Eficiència i orientació a la qualitat",
      descripcio: "Rigor tècnic, responsabilitat amb el material assignat i compliment exemplar del deure professional.",
      categoria: "Execució Tècnica",
      punts: [
        "Demostra implicació directa en l'assoliment d'un servei excel·lent.",
        "Domina les tasques tècniques del lloc de treball amb precisió.",
        "Treballa amb sentit del deure per garantir la millor atenció segons l'objectiu.",
        "Incorpora aprenentatges nous a la pràctica diària de forma natural.",
        "Cura del manteniment i bon ús del material assignat."
      ]
    },
    {
      id: 9,
      titol: "Resolució de problemes",
      descripcio: "Anàlisi ràpida de conflictes, avaluació d'alternatives proporcionals i presa de decisions eficaç.",
      categoria: "Pensament Crític",
      punts: [
        "Identifica ràpidament el conflicte i analitza la informació clau.",
        "Avalua diferents opcions per trobar la solució més adequada.",
        "Decideix amb determinació tenint en compte les futures conseqüències."
      ]
    },
    {
      id: 10,
      titol: "Iniciativa i autonomia",
      descripcio: "Proactivitat resolutiva, fermesa en moments crítics i coordinació dins del marc d'instruccions.",
      categoria: "Lideratge i Decisió",
      punts: [
        "Reacciona amb immediatesa davant de requeriments i demandes.",
        "Actua de forma resolutiva en situacions quotidianes sense supervisió.",
        "Afronta dificultats amb fermesa i transmet seguretat a l'entorn.",
        "Presa de decisions alineada amb la direcció operativa del cos."
      ]
    }
  ];

  // Alternar estat de desplegament d'una targeta
  const toggleTargeta = (id: number) => {
    if (obertes.includes(id)) {
      setObertes(obertes.filter(item => item !== id));
    } else {
      setObertes([...obertes, id]);
    }
  };

  // Desplegar o plegar totes les targetes alhora
  const desplegarTotes = () => {
    if (obertes.length === competencies.length) {
      setObertes([]);
    } else {
      setObertes(competencies.map(c => c.id));
    }
  };

  // Filtrar per text de cerca (cerca per títol, descripció o punts)
  const competenciesFiltrades = competencies.filter(c => {
    if (!cerca.trim()) return true;
    const query = cerca.toLowerCase();
    return (
      c.titol.toLowerCase().includes(query) ||
      c.descripcio.toLowerCase().includes(query) ||
      c.categoria?.toLowerCase().includes(query) ||
      c.punts.some(p => p.toLowerCase().includes(query))
    );
  });

  const totalIndicadors = competencies.reduce((acc, c) => acc + c.punts.length, 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 text-left font-sans pb-10">
      
      {/* ========================================================================= */}
      {/* 1. CAPÇALERA MINIMALISTA */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
        <div>
          <span className="text-[10px] text-[#FFDF00] font-black uppercase tracking-widest block font-mono">
            3A FASE : PROVA PSICOPROFESSIONAL
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-0.5">
            COM ES PUNTUA · COMPETÈNCIES CLAU
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-400/20 font-mono">
            10 Competències
          </span>
          <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-400/20 font-mono">
            {totalIndicadors} Claus
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TARGETA D'INTRODUCCIÓ: MARC COMPETENCIAL */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800/70 pb-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-black text-sm sm:text-base uppercase tracking-wider">
              COM S'AVALUA EL PERFIL COMPETENCIAL A MOSSOS D'ESQUADRA
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Marc oficial de criteris conductuals que empren els tribunals i psicòlegs avaluadors.
            </p>
          </div>
        </div>

        {/* Text explicatiu didàctic */}
        <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3.5 font-normal">
          <p>
            El procés de selecció i formació de Mossos d'Esquadra no mesura opinions personals ni bones intencions, sinó <strong className="text-white font-bold">conductes observables</strong>. Les competències clau són l'únic patró homogeni que s'utilitza de forma transversal durant totes les fases del procés:
          </p>

          <ul className="space-y-3 pt-1 pl-1">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5 shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200">
                <strong className="text-cyan-400 font-bold">Al Biodata i Test Competencial:</strong> Les teves respostes no es qualifiquen com a «correctes» o «incorrectes», sinó que sumen o resten puntuació a cadascuna de les 10 competències per traçar el teu perfil de partida.
              </p>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5 shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200">
                <strong className="text-cyan-400 font-bold">A l'Entrevista Personal:</strong> El tribunal no jutja la teva simpatia; agafa el teu mapa competencial previ i et sotmet a preguntes incisives i supòsits per contrastar si les teves conductes reals encaixen amb els mínims exigits (recordant que suspendre determinades competències suposa l'exclusió directa).
              </p>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5 shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200">
                <strong className="text-cyan-400 font-bold">A l'Escola de Policia (ISPC):</strong> L'avaluació per competències continua vigent durant tot el Curs de Formació Bàsica. Aspectes com l'autocontrol, el treball en equip, l'adaptabilitat, la deontologia i la presa de decisions són avaluats diàriament pels instructors més enllà de les notes dels exàmens teòrics o físics.
              </p>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5 shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
              <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200">
                <strong className="text-cyan-400 font-bold">Durant l'Any de Pràctiques:</strong> Un cop al carrer, les avaluacions trimestrals dels teus comandaments directes i tutors es basen exactament en aquest mateix diccionari competencial abans de ser nomenat funcionari de carrera.
              </p>
            </li>
          </ul>

          <p className="pt-1 text-slate-200 font-medium">
            Des del Biodata fins a l'últim dia de pràctiques, les teves notes seran sempre les competències clau. Dominar-les no és només el secret per superar l'oposició, sinó l'eina definitiva per superar l'ISPC i consolidar la teva plaça com a agent.
          </p>
        </div>

        {/* Eines: Cercador + Botó Desplegar/Plegar Totes */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Cercador ràpid */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={cerca}
              onChange={(e) => setCerca(e.target.value)}
              placeholder="Cerca per competència o conducta clau..."
              className="w-full bg-[#020b18] border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            {cerca && (
              <button
                onClick={() => setCerca('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Botó per desplegar o plegar tot */}
          <button
            onClick={desplegarTotes}
            className="inline-flex items-center justify-center gap-2 bg-[#020b18] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {obertes.length === competencies.length ? 'Plegar totes' : 'Desplegar totes'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LLISTAT DE LES 10 TARGETES DE COMPETÈNCIES CLAU */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        {competenciesFiltrades.map((comp) => {
          const estaOberta = obertes.includes(comp.id);

          return (
            <div
              key={comp.id}
              className={`bg-[#0c1424] rounded-2xl border transition-all duration-200 shadow-lg ${
                estaOberta 
                  ? 'border-cyan-500/40 shadow-cyan-950/20' 
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Capçalera de la targeta (feta clicable) */}
              <button
                onClick={() => toggleTargeta(comp.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left gap-4 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                  {/* Punt blau brillant corporatiu (com a Practicar Entrevista) */}
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-white font-extrabold text-sm sm:text-base tracking-wide uppercase group-hover:text-cyan-300 transition-colors">
                        {comp.titol}
                      </h3>
                      <span className="text-[10px] text-cyan-400/90 bg-cyan-500/10 px-2.5 py-0.5 rounded-full font-mono font-bold border border-cyan-400/20">
                        {comp.punts.length} claus
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed hidden sm:block">
                      {comp.descripcio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    estaOberta 
                      ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400 rotate-180' 
                      : 'bg-[#020b18] border-slate-800 text-slate-400 group-hover:text-white'
                  }`}>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                  </div>
                </div>
              </button>

              {/* Cos desplegable de la targeta */}
              {estaOberta && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-slate-800/80 animate-in fade-in duration-150 space-y-4">
                  {/* Descripció visible en mòbil */}
                  <p className="text-slate-300 text-xs italic leading-relaxed pt-3 sm:hidden border-b border-slate-800/60 pb-3">
                    {comp.descripcio}
                  </p>

                  <div className="pt-3 space-y-2.5">
                    <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block font-mono">
                      CLAUS CONDUCTUALS OBSERVABLES PEL TRIBUNAL :
                    </span>

                    <div className="grid sm:grid-cols-1 gap-2.5">
                      {comp.punts.map((punt, pIdx) => (
                        <div
                          key={pIdx}
                          className="bg-[#020b18] border border-slate-800/90 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 hover:border-slate-700/90 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-medium">
                            {punt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {competenciesFiltrades.length === 0 && (
          <div className="bg-[#0c1424] rounded-2xl border border-slate-800 p-8 text-center space-y-3">
            <p className="text-slate-400 text-xs">
              No s'ha trobat cap competència amb el terme <strong className="text-white">"{cerca}"</strong>.
            </p>
            <button
              onClick={() => setCerca('')}
              className="text-xs text-cyan-400 hover:underline font-bold uppercase"
            >
              Netejar filtre de cerca
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. TARGETA DE CLOENDA DIDÀCTICA: CRIDA A L'ACCIÓ */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#0c1424] to-[#020b18] rounded-2xl border border-[#FFDF00]/25 p-6 sm:p-7 shadow-2xl space-y-5 text-center sm:text-left">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-5">
          <div className="space-y-2 flex-1">
            <h4 className="text-white font-black text-sm sm:text-base uppercase tracking-tight">
              Posa a prova el que has après de les competències clau tant en el Biodata com en l'Entrevista.
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Practica tu sol o amb els nostres professionals.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Botó 1: Practicar Biodata */}
            <button
              id="btn-practicar-biodata-des-de-competencies"
              onClick={() => {
                if (onAnarBiodata) {
                  onAnarBiodata();
                } else {
                  onTornar();
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black italic uppercase text-xs sm:text-sm px-6 py-4 rounded-xl shadow-xl hover:shadow-blue-600/20 transition-all duration-200 cursor-pointer border border-blue-400/30"
            >
              Practicar Biodata
            </button>

            {/* Botó 2: Practicar Entrevista */}
            <button
              id="btn-practicar-entrevista-des-de-competencies"
              onClick={() => {
                if (onAnarEntrevista) {
                  onAnarEntrevista();
                }
              }}
              className="bg-[#FFDF00] hover:bg-[#fff066] active:scale-95 text-slate-950 font-black italic uppercase text-xs sm:text-sm px-6 py-4 rounded-xl shadow-xl hover:shadow-yellow-500/20 transition-all duration-200 cursor-pointer border border-yellow-400/50"
            >
              Practicar Entrevista
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTONS DE NAVEGACIÓ INFERIOR */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
        <button
          onClick={onTornar}
          className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-purple-500/40 hover:text-purple-400 duration-200 cursor-pointer"
          id="btn-tornar-menu-biodata-inferior-competencies"
        >
          <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Tornar a la Prova Biodata</span>
        </button>

        <button
          onClick={onTornarMenuPrincipal}
          className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-slate-400 active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer"
          id="btn-tornar-menu-principal-inferior-competencies"
        >
          <span>Menú principal</span>
        </button>
      </div>

    </div>
  );
};
