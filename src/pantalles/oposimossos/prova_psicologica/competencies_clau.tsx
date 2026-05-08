import React from 'react';
import { Target, Info, CheckCircle2, ListChecks } from 'lucide-react';

/* 
  Aquest component detalla les Competències Clau segons els criteris de PGME.
  Inclou explicacions de per què són importants i la descripció de cadascuna.
*/

export const CompetenciesClau = () => {
  const competencies = [
    {
      titol: "Habilitats socials i comunicatives",
      punts: [
        "Manté coherència entre el llenguatge verbal i l'expressió corporal.",
        "Expressa idees de forma clara i estructurada per facilitar la comprensió.",
        "S'ajusta amb facilitat a diferents nivells i registres de comunicació.",
        "Identifica les emocions pròpies i alienes per gestionar les interaccions.",
        "Expressa opinions i defensa criteris amb respecte i asseveració."
      ]
    },
    {
      titol: "Orientació de servei a la ciutadania",
      punts: [
        "Escolta i dona solucions proactives a les necessitats de la societat.",
        "Aplica un tracte educat, correcte i professional en les relacions.",
        "Mostra sensibilitat extrema cap a les víctimes i la diversitat social.",
        "Comprèn com les seves accions impacten en el col·lectiu i la institució."
      ]
    },
    {
      titol: "Treball en equip i col·laboració",
      punts: [
        "Reconeix i valora la feina realitzada per la resta de companys.",
        "Fomenta el flux d'informació dins de l'unitat de treball.",
        "Promou un bon ambient per assolir els objectius del grup.",
        "S'integra i s'adapta al ritme operatiu dels altres membres de l'equip."
      ]
    },
    {
      titol: "Adaptabilitat i flexibilitat",
      punts: [
        "Accepta i integra crítiques o opinions noves amb agilitat mental.",
        "S'ajusta a canvis sobtats de tasques o entorns segons la necessitat.",
        "Capacitat per treballar sota diferents condicions operatives.",
        "Modifica l'enfocament personal segons evoluciona la situació."
      ]
    },
    {
      titol: "Autocontrol i gestió de l'estrès",
      punts: [
        "Conserva la serenitat en imprevistos per actuar amb criteri.",
        "Desenvolupa respostes eficaces en situacions de molta tensió.",
        "Ajusta el ritme de treball a les altes exigències sense perdre eficàcia."
      ]
    },
    {
      titol: "Autogestió i creixement personal",
      punts: [
        "Encara els reptes diaris amb autoconfiança i seguretat.",
        "Assumeix les conseqüències de les seves decisions amb integritat.",
        "Coneix els seus punts forts i àrees de millora per ser més eficient.",
        "Busca constantment la millora de les seves capacitats professionals.",
        "Accepta les errades pròpies amb una mentalitat constructiva."
      ]
    },
    {
      titol: "Compromís amb l'organització",
      punts: [
        "Enfoca l'esforç cap als objectius i valors dels Mossos d'Esquadra.",
        "Accepta i respecta l'estructura jeràrquica del cos.",
        "Segueix estrictament les normes ètiques, legals i socials.",
        "Transmet una imatge de seriositat i prestigi com a representant institucional."
      ]
    },
    {
      titol: "Eficiència i orientació a la qualitat",
      punts: [
        "Demostra implicació directa en l'assoliment d'un servei excel·lent.",
        "Domina les tasques tècniques del lloc de treball amb precisió.",
        "Treballa amb sentit del deure per garantir la millor atenció segons l'objectiu.",
        "Incorpora aprenentatges nous a la pràctica diària de forma natural.",
        "Cura del manteniment i bon ús del material assignat."
      ]
    },
    {
      titol: "Resolució de problemes",
      punts: [
        "Identifica ràpidament el conflicte i analitza la informació clau.",
        "Avalua diferents opcions per trobar la solució més adequada.",
        "Decideix amb determinació tenint en compte les futures conseqüències."
      ]
    },
    {
      titol: "Iniciativa i autonomia",
      punts: [
        "Reacciona amb immediatesa davant de requeriments i demandes.",
        "Actua de forma resolutiva en situacions quotidianes sense supervisió.",
        "Afronta dificultats amb fermesa i transmet seguretat a l'entorn.",
        "Presa de decisions alineada amb la direcció operativa del cos."
      ]
    }
  ];

  return (
    <div className="flex flex-col flex-1 gap-6 w-full animate-in fade-in duration-500 pb-20">
      
      {/* Intro Question Section */}
      <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2rem] md:rounded-[3rem] pt-6 md:pt-12 px-6 md:px-12 pb-8 md:pb-14 -mx-4 md:mx-0 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 md:gap-8 text-center">
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400">
            <Target size={24} className="md:size-10" />
          </div>
          <h3 className="text-white font-[900] italic leading-tight uppercase text-[12px] md:text-2xl tracking-widest px-4 md:max-w-2xl">
            Per a què són tant importants les competències clau i per què conèixer-les m'assegura aprovar?
          </h3>
          <p className="text-[11px] md:text-lg text-white/60 leading-relaxed italic md:max-w-xl">
            L'entrevista no busca saber què fas, sinó COM ho fas. Les competències són el marc on els entrevistadors t'encaixaran.
          </p>
          
          <button className="mt-2 w-full max-w-[220px] md:max-w-sm bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/40 rounded-xl md:rounded-2xl py-3 md:py-6 px-6 flex items-center justify-center gap-2 md:gap-4 transition-all active:scale-95 group">
            <Info size={16} className="text-cyan-400 md:size-6" />
            <span className="text-cyan-400 font-black italic uppercase text-[10px] md:text-lg tracking-widest">DESCOBREIX COM S'AVALUA</span>
          </button>
        </div>
      </div>

      {/* Label divider */}
      <div className="flex flex-col items-center gap-2 md:gap-4">
        <ListChecks size={20} className="text-white/20 md:size-10" />
        <span className="text-[10px] md:text-xl text-white/40 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] italic text-center">
          Totes les competències explicades
        </span>
      </div>

      {/* Competencies List */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-x-6 gap-y-8 md:gap-x-12 md:gap-y-16">
        {competencies.map((comp, idx) => (
          <div key={idx} className="flex flex-col gap-3 md:gap-6">
             <div className="flex items-center gap-3 md:gap-6 px-2">
                <div className="h-[1px] flex-1 bg-white/5" />
                <h4 className="text-[11px] md:text-xl font-black italic uppercase text-cyan-400/80 tracking-widest whitespace-nowrap">
                  {comp.titol}
                </h4>
                <div className="h-[1px] flex-1 bg-white/5" />
             </div>
             
             <div className="bg-[#1a3a5a]/20 border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-10 shadow-inner">
                <ul className="flex flex-col gap-3 md:gap-6">
                  {comp.punts.map((punt, pIdx) => (
                    <li key={pIdx} className="flex gap-3 md:gap-6 items-start group">
                      <CheckCircle2 size={14} className="text-cyan-400/40 mt-0.5 shrink-0 md:size-8" />
                      <p className="text-[11px] md:text-lg text-white/70 leading-relaxed italic group-hover:text-white/90 transition-colors">
                        {punt}
                      </p>
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        ))}
      </div>

    </div>
  );
};
