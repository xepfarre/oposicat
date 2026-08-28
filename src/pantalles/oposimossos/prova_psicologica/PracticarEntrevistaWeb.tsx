import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, ListCheck, ChevronDown, ChevronUp, Search } from 'lucide-react';

/* =============================================================================
 * COMPONENT: PracticarEntrevistaWeb
 * -----------------------------------------------------------------------------
 * Guia i banc de preguntes oficials de l'Entrevista Personal dels Mossos d'Esquadra.
 * Permet explorar les categories oficials amb acordions interactius.
 * ============================================================================= */

interface PracticarEntrevistaWebProps {
  onTornar: () => void;
  onTornarMenuPrincipal: () => void;
  onDemanarCita?: () => void;
  onFesBiodata?: () => void;
}

export const PracticarEntrevistaWeb: React.FC<PracticarEntrevistaWebProps> = ({
  onTornar,
  onTornarMenuPrincipal,
  onDemanarCita,
  onFesBiodata,
}) => {
  const [catOberta, setCatOberta] = useState<number | null>(0);
  const [cerca, setCerca] = useState<string>('');

  const categories = [
    {
      titol: "PREGUNTES INICIALS",
      descripcio: "Preguntes introductòries per avaluar el tarannà, nervis i context d'arribada.",
      preguntes: [
        "1 Què tal?",
        "2 Està molt nerviós?",
        "3 D'on ve?",
        "4 Ha pogut aparcar bé?",
        "5 Està preparat per començar?",
        "6 Com li ha anat l’oposició fins ara?"
      ]
    },
    {
      titol: "FORMACIÓ",
      descripcio: "Avaluació del teu recorregut acadèmic, motivacions d'aprenentatge i autoavaluació.",
      preguntes: [
        "7 Quins estudis ha realitzat?",
        "8 Que enyora de l'època d'estudiant?",
        "9 Tornaria a realitzar els mateixos estudis? Per què?",
        "10 Té altres cursos no reglats? Quins?",
        "11 En base a la seva formació acadèmica, què pot aportar vostè als MMEE?",
        "12 Fiqui’s una nota com a estudiant. Per què?",
        "13 Quin tipus d'estudiant era/és?"
      ]
    },
    {
      titol: "EXPERIÈNCIA LABORAL",
      descripcio: "Historial de feines, gestió de conflictes en equip, relació amb superiors i resolució.",
      preguntes: [
        "14 Quina és la darrera feina que ha fet?",
        "15 Com la va aconseguir?",
        "16 A què es dedica aquesta empresa?",
        "17 Quin càrrec tenia a l'empresa?",
        "18 Quines eren les seves funcions?",
        "19 Què és el que li agradava més de la seva feina?",
        "20 Què és el que li agradava menys?",
        "21 En quina feina va aprendre més?",
        "22 Per què vol canviar de feina?",
        "23 Compti’m un dia de treball a la seva feina.",
        "24 Expliqui’m algun conflicte que hagi tingut a la feina.",
        "25 En quina ocasió es va enfadar amb el seu superior.",
        "26 Què és el que se li dóna més bé a la feina?",
        "27 Què és el que se li dóna més malament?",
        "28 Posi’s una nota com a treballador."
      ]
    },
    {
      titol: "PREGUNTES PERSONALS",
      descripcio: "Trets de personalitat, punts forts i febles, entorn familiar, hàbits, tolerància i autocontrol.",
      preguntes: [
        "29 Parli’m de vostè. Quin tipus de persona és?",
        "30 Digui’m 3 punts forts del seu caràcter, de la seva manera de ser.",
        "31 Digui’m tres punts febles.",
        "32 Què creu que la gent pensa de vostè?",
        "33 Quin és el tret més destacable de la seva personalitat?",
        "34 Parlant dels seus punts febles, què ha fet per a intentar millorar-los?",
        "35 Com em podria convèncer de què vostè és una persona tolerant cap als altres?",
        "36 Parli’m dels seus pares, a què es dediquen?",
        "37 Quins estudis van fer els seus pares?",
        "38 Defineixi el sèu pare. Què destacaria d'ell?",
        "39 Què és el que més li ha aportat a vostè?",
        "40 Defineixi la seva mare. Què destacaria d'ella?",
        "41 Què és el que més li ha aportat a vostè?",
        "42 Parli’m dels seus germans, a què es dediquen?",
        "43 Quina relació ha tingut amb els seus germans?",
        "44 Què aporta vostè la seva família?",
        "45 Què podria destacar de les celebracions festives amb la família?",
        "46 Quins són els seus hobbies? Cada quan els pràctica?",
        "47 Quin és el seu favorit? Per què?",
        "48 Conti’m un dia normal de cap de setmana.",
        "49 En quines ocasions veu alcohol?",
        "50 Quin tipus de begudes alcohòliques pren?",
        "51 Quina és la que més li agrada? Per què?",
        "52 Quina quantitat d'alcohol pren?",
        "53 Quants cubates li fan falta per a emborratxar-se?",
        "54 Quantes vegades s'ha emborratxat?",
        "55 Expliquin en quina situació es van donar, que recorda?",
        "56 Quines drogues ha provat En quines situacions les pren?",
        "57 Quina quantitat de droga pren?",
        "58 Com va començar a consuming droga i qui li va oferir?",
        "59 Els seus amics fumen porros?",
        "60 Coneix gent que consumeix drogues?",
        "61 Pertany a cap associació, algun club?",
        "62 Digui-m quin fet ha marcat la seva vida?",
        "63 Quina ha sigut l’experiència més bona de la seva vida? I la més dolenta?",
        "64 Què canviaria del teu passat?",
        "65 Quina és la decisió més important que va haver de prendre en el passat?",
        "66 Ha passat por alguna vegada a la seva vida? Quan?",
        "67 Quines manies té? Quines rutines ha de fer sí o sí?",
        "68 Expliquin una situació en la que hagi perdut la paciència.",
        "69 Expliquin una situació en la que hagi actuat malament.",
        "70 Què no suporta dels altres?",
        "71 Quin tipus de persones el fan enfadar?",
        "72 Com encaixa les crítiques?",
        "73 Què creu que s'hauria de fer amb els delinqüents?",
        "74 Expliqui’m alguna experiència violenta que hagi tingut?",
        "75 En quina situació faria servir la violència?",
        "76 I si ataquen a la teva família?",
        "77 Expliqui’m quines són les notícies que darrerament l'hagin afectat?"
      ]
    },
    {
      titol: "PREGUNTES SOBRE MMEE",
      descripcio: "Motivació específica, coneixement de funcions, estructura, codi deontològic, armes i situacions policials.",
      preguntes: [
        "78 Per què vol ser MMEE?",
        "79 Què li ha fet decidir a presentar-se a aquesta oposició?",
        "80 Què pot aportar vostè al cos?",
        "81 Quantes vegades s’ha presentat a aquesta oposició?",
        "82 Perquè no s’ha presentat abans?",
        "83 Si finalment suspèn, tornaria a presentar-se? Per què?",
        "84 Amb quina altra feina es pot comparar la dels MMEE?",
        "85 S’ha presentat a altres oposicions? Quines? Per què?",
        "86 Quines funcions té encomanades el cos MMEE?",
        "87 Quina imatge creu que la gent del carrer té dels MMEE?",
        "88 Quina és la darrera notícia que ha sentit sobre els MMEE?",
        "89 Estaria disposat a canviar de domicili?",
        "90 Quines especialitats coneix dels MMEE?",
        "91 Quina és la que més li agrada? Quina és la que menys?",
        "92 A quina li agradaria acabar treballant?",
        "93 Què vol fer dins del cos? A què aspira?",
        "94 Té coneguts o familiars dins del cos MMEE?",
        "95 Digui’m els seus noms, on treballen? Quina relació té amb ells?",
        "96 Què li han explica’t sobre el cos?",
        "97 Què li han explica’t sobre la feina?",
        "98 Què li ha sorprès més?",
        "99 Quina estructura organitzativa té el cos MMEE?",
        "100 Ha estat mai en una oficina comarcal dels MMEE?",
        "101 Què en sap del curs bàsic per a ser MMEE?",
        "102 Amb quina altra professió es pot comparar la dels MMEE?",
        "103 Denunciaria un familiar seu si cometés una infracció?",
        "104 Quin és el major defecte que pot tenir un MMEE?",
        "105 Quines qualitats personal creu que ha de tenir un MMEE?",
        "106 Quines d'aquestes té vostè?",
        "107 Quina creu que és la qualitat més important que ha de tenir un MMEE?",
        "108 Què li va dir la seva família quan els hi va dir que volia presentar-se a MMEE?",
        "109 Quin problema o quin incident no li agradaria trobar-se mai treballant?",
        "110 Com creu que ha de ser treballar MMEE?",
        "111 Com m’explicaria a mi què és un MMEE?",
        "112 Què fa un dia de treball normal un MMEE?",
        "113 Quina creu que és la millor arma d’un MMEE?",
        "114 Què en pensa de les armes de foc?",
        "115 Ha dispara’t mai?",
        "116 Què va sentir? Com creu que es sentirà portant un arma?",
        "117 Com puc saber que vostè està prepara’t?",
        "118 Què espera d’aquesta feina?",
        "119 Es veu capacitat per a ser MMEE? Per què?",
        "120 Si no pogués ser MMEE, que li agradaria ser?",
        "121 Quin detall valora més d’un company?",
        "122 Delataria al seu company si aquest cometés alguna il·legalitat?",
        "123 Com pot garantir-me que actuarà correctament?",
        "124 Quins riscos té la professió MMEE?",
        "125 Descrigui com seria el seu comandament ideal?",
        "126 L'han aturat mai els MMEE?",
        "127 Quina impressió li va fer?",
        "128 La policia l’han denunciat mai a vostè?",
        "129 Si trobeu una persona nerviosa com la calmaríeu?"
      ]
    },
    {
      titol: "CLOENDA - PART FINAL",
      descripcio: "Pregunta final de tancament per afegir qualsevol aspecte rellevant abans de finalitzar l'entrevista.",
      preguntes: [
        "130 Hem arribat a la part final de l'entrevista. Disposa d'un minut per afegir el que vostè vulgui. Vol afegir alguna cosa de rellevància?"
      ]
    }
  ];

  const handleToggle = (idx: number) => {
    setCatOberta(catOberta === idx ? null : idx);
  };

  const totalPreguntes = categories.reduce((acc, c) => acc + c.preguntes.length, 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 text-left">
      
      {/* ========================================================================= */}
      {/* 1. CAPÇALERA MINIMALISTA */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
          PRACTICAR L'ENTREVISTA
        </h1>
        <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20 font-mono">
          {totalPreguntes} Preguntes Reals
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 2. TARGETA D'INTRODUCCIÓ: BANC DE PREGUNTES DE TRIBUNALS OFICIALS */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800/70 pb-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h2 className="text-white font-black text-sm sm:text-base uppercase tracking-wider">
            BANC DE PREGUNTES DE TRIBUNALS OFICIALS
          </h2>
        </div>

        {/* Textos explicatius demanats */}
        <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 font-normal">
          <p>
            Hem recopilat més de 100 preguntes reals formulades per membres i psicòlegs dels tribunals avaluadors al llarg de diferents convocatòries de Mossos d'Esquadra.
          </p>
          <p>
            Tingues en compte que els entrevistadors tenen plena llibertat per sortir del guió i fer preguntes imprevistes; tot i això, si assimiles la columna vertebral i l'enfocament competencial que t'ensenyem, disposaràs d'una base sòlida per defensar qualsevol resposta amb coherència i seguretat.
          </p>
          <p>
            Llegeix cada bloc, reflexiona com estructuraries el teu argument i entrena de forma autònoma. Un cop tinguis el contingut clar, és el moment de posar-ho a prova en condicions reals de pressió amb els nostres psicòlegs i preparadors.
          </p>
        </div>

        {/* Cercador ràpid de preguntes */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
          <input
            type="text"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Cercar pregunta per paraula clau (ex: feina, alcohol, MMEE, arma...)"
            className="w-full bg-[#020b18] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FFDF00] transition-colors"
          />
          {cerca && (
            <button
              onClick={() => setCerca('')}
              className="absolute right-3 top-3.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LLISTAT DE CATEGORIES I PREGUNTES */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {categories.map((cat, idx) => {
          const preguntesFiltrades = cerca.trim()
            ? cat.preguntes.filter(p => p.toLowerCase().includes(cerca.toLowerCase()))
            : cat.preguntes;

          if (cerca.trim() && preguntesFiltrades.length === 0) {
            return null;
          }

          const estaOberta = catOberta === idx || cerca.trim().length > 0;

          return (
            <div
              key={idx}
              className="bg-[#0c1424] rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg transition-all duration-200"
            >
              {/* Botó capçalera de categoria */}
              <button
                onClick={() => handleToggle(idx)}
                className={`w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors cursor-pointer ${
                  estaOberta ? 'bg-slate-900/60 border-b border-slate-800/60' : 'hover:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center gap-3 pr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                        {cat.titol}
                      </h3>
                      <span className="text-[10px] text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded-full font-mono font-bold">
                        {preguntesFiltrades.length} {preguntesFiltrades.length === 1 ? 'pregunta' : 'preguntes'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5 hidden sm:block">
                      {cat.descripcio}
                    </p>
                  </div>
                </div>

                <div className="text-slate-400 shrink-0 pl-2">
                  {estaOberta ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Contingut desplegable de preguntes */}
              {estaOberta && (
                <div className="p-4 sm:p-5 space-y-2 bg-[#060e1a]/60">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {preguntesFiltrades.map((preg, pIdx) => {
                      const matchNumero = preg.match(/^(\d+)\s+(.*)$/);
                      const num = matchNumero ? matchNumero[1] : '';
                      const textPregunta = matchNumero ? matchNumero[2] : preg;

                      return (
                        <div
                          key={pIdx}
                          className="bg-[#0c1424] border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-3 sm:p-3.5 transition-all flex items-start gap-3 shadow-sm group"
                        >
                          <span className="text-[11px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md shrink-0 font-mono mt-0.5 border border-cyan-400/20">
                            #{num || pIdx + 1}
                          </span>
                          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-medium group-hover:text-white">
                            {textPregunta}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3.1. TARGETA DE PREPARACIÓ I CRIDA A L'ACCIÓ PER A BIODATA I DEMANAR CITA */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#0c1424] to-[#020b18] rounded-2xl border border-[#FFDF00]/25 p-6 sm:p-7 shadow-2xl space-y-5 text-center sm:text-left">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-5">
          <div className="space-y-2 flex-1">
            <h4 className="text-white font-black text-sm sm:text-base uppercase tracking-tight">
              Prepara't per posar a prova tot el que has après i practicat?
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Fes el Test de Biodata (per a poder tenir el teu perfil psicoprofessional) i demana cita amb un preparador d'OposiCAT!
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Botó 1: Fes el Biodata */}
            <button
              id="btn-fes-biodata-entrevista-final"
              onClick={() => {
                if (onFesBiodata) {
                  onFesBiodata();
                } else {
                  onTornar();
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black italic uppercase text-xs sm:text-sm px-6 py-4 rounded-xl shadow-xl hover:shadow-blue-600/20 transition-all duration-200 cursor-pointer border border-blue-400/30"
            >
              Fes el Biodata
            </button>

            {/* Botó 2: Demana cita */}
            <button
              id="btn-demana-cita-entrevista-final"
              onClick={() => {
                if (onDemanarCita) {
                  onDemanarCita();
                } else {
                  const text = "Hola, voldria demanar cita per a preparar l'entrevista personal de Mossos d'Esquadra.";
                  window.open(`https://wa.me/34689725801?text=${encodeURIComponent(text)}`, '_blank');
                }
              }}
              className="bg-[#FFDF00] hover:bg-[#fff066] active:scale-95 text-slate-950 font-black italic uppercase text-xs sm:text-sm px-6 py-4 rounded-xl shadow-xl hover:shadow-yellow-500/20 transition-all duration-200 cursor-pointer border border-yellow-400/50"
            >
              Demana cita
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTONS DE NAVEGACIÓ INFERIOR */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
        <button
          onClick={onTornar}
          id="btn-tornar-menu-entrevista-practica-bottom"
          className="group inline-flex items-center gap-2 bg-[#020b18] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-3 rounded-full text-xs font-black italic uppercase tracking-wider text-[#FFDF00] transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Tornar a la Prova Entrevista</span>
        </button>

        <button
          onClick={onTornarMenuPrincipal}
          id="btn-tornar-menu-principal-entrevista-practica-bottom"
          className="inline-flex items-center gap-2 bg-[#020b18] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-6 py-3 rounded-full text-xs font-black italic uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
        >
          <span>Menú principal</span>
        </button>
      </div>

    </div>
  );
};
