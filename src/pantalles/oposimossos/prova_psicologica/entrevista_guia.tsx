import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, ListCheck, ChevronDown, ChevronUp } from 'lucide-react';

/* 
  Aquest component mostra el llistat de preguntes reals de l'entrevista personal.
  Ara inclou un selector tipus acordió per no saturar la pantalla.
*/

export const EntrevistaGuia = ({ onBack }: { onBack: () => void }) => {
  const [catOberta, setCatOberta] = useState<number | null>(null);

  const categories = [
    {
      titol: "PREGUNTES INICIALS",
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
    }
  ];

  const handleToggle = (idx: number) => {
    setCatOberta(catOberta === idx ? null : idx);
  };

  return (
    <div className="flex flex-col flex-1 gap-6 w-full animate-in fade-in duration-500 pb-20">
      
      {/* Intro Label Section */}
      <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2rem] md:rounded-[4rem] pt-6 md:pt-16 px-6 md:px-16 pb-8 md:pb-20 -mx-4 md:mx-0 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 md:gap-10 text-center">
          <div className="w-12 h-12 md:w-24 md:h-24 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400">
            <MessageSquare size={24} className="md:size-12" />
          </div>
          <p className="text-[11px] md:text-2xl text-white/80 font-bold leading-relaxed italic px-2 md:max-w-3xl">
            "Llistat de preguntes que múltiples psicòlegs de forma oficial han avaluat durant anys a les entrevistes de la fase d'oposició"
          </p>
          
          <div className="w-full h-[1px] bg-white/5 my-2 md:my-6" />
          
          <div className="flex items-center gap-2 md:gap-4">
            <ListCheck size={14} className="text-cyan-400/60 md:size-6" />
            <span className="text-cyan-400/60 font-black italic uppercase text-[9px] md:text-sm tracking-widest text-center">SELECCIONS UNA CATEGORIA PER VEURE LES PREGUNTES</span>
          </div>
        </div>
      </div>

      {/* Accordion Questions Area */}
      <div className="flex flex-col md:grid md:grid-cols-2 md:items-start gap-3 md:gap-8">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex flex-col">
             {/* Category Toggle Button */}
             <button 
                onClick={() => handleToggle(idx)}
                className={`w-full flex items-center justify-between py-5 px-6 md:py-10 md:px-12 rounded-2xl md:rounded-3xl border transition-all duration-300 ${
                  catOberta === idx 
                  ? 'bg-cyan-400/10 border-cyan-400/30' 
                  : 'bg-[#1a3a5a]/20 border-white/5 hover:bg-[#1a3a5a]/40 hover:border-white/10'
                }`}
             >
                <span className={`text-[11px] md:text-xl font-black italic uppercase tracking-widest ${
                   catOberta === idx ? 'text-cyan-400' : 'text-white/70'
                }`}>
                  {cat.titol}
                </span>
                {catOberta === idx ? (
                  <ChevronUp size={16} className="text-cyan-400 md:size-8" />
                ) : (
                  <ChevronDown size={16} className="text-white/30 md:size-8" />
                )}
             </button>
             
             {/* Questions Content */}
             {catOberta === idx && (
               <div className="flex flex-col gap-2 md:gap-4 mt-2 md:mt-6 px-2 animate-in slide-in-from-top-2 duration-300">
                  {cat.preguntes.map((preg, pIdx) => (
                    <div 
                      key={pIdx} 
                      className="bg-black/20 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-6 px-5 md:px-10 shadow-inner"
                    >
                      <p className="text-[11px] md:text-lg text-white/60 italic leading-relaxed">
                        {preg}
                      </p>
                    </div>
                  ))}
               </div>
             )}
          </div>
        ))}
      </div>

      <button 
        onClick={onBack}
        className="flex items-center justify-center gap-3 text-white/40 hover:text-white transition-all uppercase italic font-black text-[10px] tracking-[0.2em] mt-8 mb-12"
      >
        <ChevronLeft size={16} /> TORNAR AL MENÚ PSICOLÒGIC
      </button>

    </div>
  );
};
