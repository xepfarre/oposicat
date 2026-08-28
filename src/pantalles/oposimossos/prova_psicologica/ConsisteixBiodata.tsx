import React from 'react';
import { ChevronLeft } from 'lucide-react';

/* 
  Explicació per a no-programadors:
  Aquest component mostra la pantalla "EN QUÈ CONSISTEIX LA PROVA" dins de la "Prova - Biodata".
  S'ha estructurat en 2 grans blocs independents segons el disseny requerit:
  
  - Títol Principal: "ESTRUCTURA DE L'EXAMEN BIODATA. QUÈ EL FORMA?"
  
  - BLOC 1: "PROVA 1 - EXAMEN DEL QÜESTIONARI BIOGRÀFIC"
    * Targeta superior ampla: Format i objectiu del Qüestionari Biogràfic (preguntes obertes).
    * Graella de 4 targetes: Els 4 blocs que el componen (01 Personal, 02 Acadèmica, 03 Laboral, 04 Preguntes Mossos).
  
  - BLOC 2: "PROVA 2 - EXAMEN DEL QÜESTIONARI BIODATA"
    * Targeta superior ampla: Format i objectiu del Test Biodata / Competencial (preguntes tancades/test).
    * Targeta destacada: L'examen psicomètric i competencial (mesura de les 10 competències clau).
*/

interface ConsisteixBiodataProps {
  onTornar: () => void;
  onTornarMenuPrincipal?: () => void;
  onPracticaBiografic?: () => void;
  onPracticaBiodata?: () => void;
}

export const ConsisteixBiodata: React.FC<ConsisteixBiodataProps> = ({
  onTornar,
  onTornarMenuPrincipal,
  onPracticaBiografic,
  onPracticaBiodata,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 text-left font-sans pb-12 animate-in fade-in duration-200">
      
      {/* Botó superior de retorn elegant */}
      <div className="flex items-center justify-between">
        <button
          onClick={onTornar}
          className="group inline-flex items-center gap-2 text-slate-300 hover:text-[#FFDF00] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
          id="btn-tornar-menu-biodata-top"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Tornar a la Prova Biodata</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* CAPÇALERA GENERAL DE LA PANTALLA */}
      {/* ========================================================================= */}
      <div className="space-y-1 pt-1 pb-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
          ESTRUCTURA DE L'EXAMEN BIODATA. QUÈ EL FORMA?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Descripció detallada de les dues proves escrites que conformen la fase del Biodata per a l'accés al Cos de Mossos d'Esquadra.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* BLOC 1: PROVA 1 - EXAMEN DEL QÜESTIONARI BIOGRÀFIC */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424]/90 rounded-3xl border border-blue-900/40 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Títol del Bloc 1 */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-wide">
              PROVA 1 - EXAMEN DEL QÜESTIONARI BIOGRÀFIC
            </h2>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-400/20 font-mono uppercase tracking-wider hidden sm:inline-block">
            4 Blocs Temàtics
          </span>
        </div>

        {/* 1.1 Targeta ampla: Format i objectiu del Qüestionari Biogràfic */}
        <div className="bg-[#020b18] rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-md">
          <div className="flex items-center mb-2.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 mr-2 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <h3 className="text-white font-bold tracking-wider uppercase text-xs sm:text-sm">
              FORMAT I OBJECTIU DE LA PROVA
            </h3>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            El <strong className="text-white font-semibold">Qüestionari Biogràfic</strong> és una prova escrita de preguntes obertes a desenvolupar on hauràs d'exposar la teva trajectòria vital, acadèmica i professional. L'objectiu és recollir informació contrastable que el tribunal avaluador utilitzarà com a base durant l'entrevista personal. La prova s'estructura en <strong className="text-white font-semibold">4 blocs</strong>:
          </p>
        </div>

        {/* 1.2 Graella dels 4 blocs que comprenen el Qüestionari Biogràfic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* TARGETA 1: Àmbit Personal */}
          <div className="bg-[#020b18] rounded-2xl border border-slate-800/90 p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-900/30">
            <div className="space-y-2.5">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-2 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                <h4 className="text-white font-bold tracking-wider uppercase text-xs">
                  01 · Àmbit Personal
                </h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Dades personals, entorn familiar, convivència, lloc de residència, edat i context quotidià.
              </p>
            </div>
          </div>

          {/* TARGETA 2: Trajectòria Acadèmica */}
          <div className="bg-[#020b18] rounded-2xl border border-slate-800/90 p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-900/30">
            <div className="space-y-2.5">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-2 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                <h4 className="text-white font-bold tracking-wider uppercase text-xs">
                  02 · Trajectòria Acadèmica
                </h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Títols oficials, idiomes, cursos i formacions clau que defineixen el teu perfil formatiu.
              </p>
            </div>
          </div>

          {/* TARGETA 3: Trajectòria Laboral */}
          <div className="bg-[#020b18] rounded-2xl border border-slate-800/90 p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-900/30">
            <div className="space-y-2.5">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-2 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                <h4 className="text-white font-bold tracking-wider uppercase text-xs">
                  03 · Trajectòria Laboral
                </h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Historial complet de feines prèvies, motius de canvi i dates exactes d'alta i baixa laboral.
              </p>
            </div>
          </div>

          {/* TARGETA 4: Preguntes Mossos / Àmbit Policial */}
          <div className="bg-[#020b18] rounded-2xl border border-slate-800/90 p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-900/30">
            <div className="space-y-2.5">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-2 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                <h4 className="text-white font-bold tracking-wider uppercase text-xs">
                  04 · Preguntes Mossos
                </h4>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Preguntes relacionades amb la funció policial, motivació directa, disponibilitat i especialitats del cos.
              </p>
            </div>
          </div>

        </div>

        {/* 1.3 Botó Practica a la part dreta i de color groc */}
        <div className="flex items-center justify-end pt-2">
          <button
            id="btn-practica-prova1-biografic"
            onClick={() => {
              if (onPracticaBiografic) {
                onPracticaBiografic();
              } else {
                onTornar();
              }
            }}
            className="inline-flex items-center gap-2 bg-[#FFDF00] hover:bg-yellow-400 active:scale-95 text-slate-950 font-black italic uppercase text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 cursor-pointer border border-yellow-300/40"
          >
            <span>Practica</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* BLOC 2: PROVA 2 - EXAMEN DEL QÜESTIONARI BIODATA */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424]/90 rounded-3xl border border-purple-900/40 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Títol del Bloc 2 */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-purple-400 shrink-0 shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-wide">
              PROVA 2 - EXAMEN DEL QÜESTIONARI BIODATA
            </h2>
          </div>
          <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-400/20 font-mono uppercase tracking-wider hidden sm:inline-block">
            Test Competencial
          </span>
        </div>

        {/* 2.1 Targeta ampla: Format i objectiu del Test Biodata */}
        <div className="bg-[#020b18] rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-md">
          <div className="flex items-center mb-2.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400 mr-2 shrink-0 shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
            <h3 className="text-white font-bold tracking-wider uppercase text-xs sm:text-sm">
              FORMAT I OBJECTIU DE LA PROVA
            </h3>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            És un tipus test on selecciones o la que s'escau més amb tu o valorar de major a menor 3 opcions. En cada resposta modifiques el teu perfil psicològic (sumes i restes punts de les competències clau).
          </p>
        </div>

        {/* 2.2 Targeta central destacada: Mida reduïda i centrada */}
        <div className="w-full max-w-3xl mx-auto bg-[#020b18] rounded-2xl border border-purple-500/30 p-5 sm:p-6 shadow-xl transition-all duration-200 hover:border-purple-500/50">
          <div className="space-y-2.5">
            <div className="flex items-center">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400 mr-2.5 shrink-0 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
              <h4 className="text-white font-black tracking-wider uppercase text-xs sm:text-sm">
                01 · Examen del Qüestionari Biodata / Test Competencial
              </h4>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              És un examen de 25 minuts on s'han de respondre en format tipus test 80 preguntes en escala de major a menor o quina s'adequa millor a tu (depenent de l'any), i cada resposta té relació directa en sumar punts a una competència i restar-ne a una altra.
            </p>
          </div>
        </div>

        {/* 2.3 Botó Practica a la part dreta i de color groc */}
        <div className="flex items-center justify-end pt-2">
          <button
            id="btn-practica-prova2-biodata"
            onClick={() => {
              if (onPracticaBiodata) {
                onPracticaBiodata();
              } else {
                onTornar();
              }
            }}
            className="inline-flex items-center gap-2 bg-[#FFDF00] hover:bg-yellow-400 active:scale-95 text-slate-950 font-black italic uppercase text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-yellow-500/25 transition-all duration-200 cursor-pointer border border-yellow-300/40"
          >
            <span>Practica</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* NAVEGACIÓ INFERIOR DE RETORN */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={onTornar}
          className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-6 py-3 rounded-full text-xs font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-cyan-500/40 hover:text-cyan-400 duration-200 cursor-pointer"
          id="btn-tornar-menu-biodata-bottom"
        >
          <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Tornar a la Prova Biodata</span>
        </button>

        {onTornarMenuPrincipal && (
          <button
            onClick={onTornarMenuPrincipal}
            className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-6 py-3 rounded-full text-xs font-black italic uppercase tracking-widest text-slate-400 active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer"
            id="btn-tornar-menu-principal-biodata-bottom"
          >
            <span>Menú principal</span>
          </button>
        )}
      </div>

    </div>
  );
};
