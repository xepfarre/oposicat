import { ChevronLeft } from 'lucide-react';

const llistatPsico: Record<string, { desc: string, pregunta: string, opcions: string[], correcta: number, explicacio: string }> = {
  "Sèries Aritmètiques": {
    desc: "Trobar el patró numèric d'una seqüència i deduir el següent valor seguint regles matemàtiques d'increment, resta o multiplicació.",
    pregunta: "Quina xifra tanca la sèrie lògica: 3, 6, 12, 15, 30, 33, ...?",
    opcions: ["36", "66", "45", "60"],
    correcta: 1,
    explicacio: "El patró s'alterna: primer es multiplica per 2 (3 * 2 = 6), després se suma 3 (6 + 3 = 9... ah, seguim l'ordre: 3 [+3] = 6, 6 [*2] = 12, 12 [+3] = 15, 15 [*2] = 30, 30 [+3] = 33, llavors 33 [*2] = 66."
  },
  "Figures i Espai": {
    desc: "Visualitzar rotacions de figures geomètriques o desplegament de teles / cubs per avaluar orientació en patrulla.",
    pregunta: "Si rotem un cub a la dreta un quart d'angle i després cap amunt, quina de les cares queda mirant exactament a dalt?",
    opcions: ["La cara oposada a la inicial", "La cara adjacent lateral esquerra", "La mateixa cara de sota inicial", "La cara oposada al fons del pla"],
    correcta: 1,
    explicacio: "En moure lateralment a la dreta, la cara lateral esquerra passa a estar al mig, i al fer la rotació vertical cap amunt, aquesta ascendeix a la posició superior."
  },
  "Raonament Lògic": {
    desc: "Avaluar sil·logismes policials o enunciats de causa-efecte per validar conclusions formals deductives.",
    pregunta: "Tots els comandaments vesteixen d'etiqueta. En Josep vesteix d'etiqueta. Per tant:",
    opcions: ["En Josep és comandament de forma obligatòria", "En Josep vesteix d'etiqueta, pero no té per què ser comandament", "En Josep no és comandament", "La premissa conté una incoherència total"],
    correcta: 1,
    explicacio: "Que tots els comandaments vesteixin d'etiqueta no significa que NOMÉS els comandaments puguin vestir així (fal·làcia de l'afirmació del conseqüent)."
  },
  "Comprensió Verbal": {
    desc: "Identificar sinònims, definicions pures o paraules intruses d'alt rang lingüístic per a l'elaboració d'atestats.",
    pregunta: "Quin dels següents mots és un sinònim precís de la paraula 'DISSENTIR'?",
    opcions: ["Acoquinar", "Discrepar", "Acaçar", "Pactar"],
    correcta: 1,
    explicacio: "Dissentir significa separar-se del parer, sentir o dictamen de l'altre, per tant és equivalent a discrepar."
  },
  "Càlcul Mental Ràpid": {
    desc: "Fraccions de temps reduïdes on has de realitzar sumes, restes, divisions i multiplicacions ràpides.",
    pregunta: "Calcula ràpidament sense usar llapis: (18 * 4) + (24 / 3) - 15 = ?",
    opcions: ["65", "72", "80", "55"],
    correcta: 0,
    explicacio: "Operacions pas a pas: 18 * 4 = 72; 24 / 3 = 8. Després sumem 72 + 8 = 80; finalment restem 15, donat com a resultat final 65."
  },
  "Memòria Visual": {
    desc: "Retenir detalls d'una escena de crim o matrícules de vehicles sospitosos en un interval de 20 segons.",
    pregunta: "La matrícula d'un infractor és 'GI-4422-AZ'. Si memoritzes les parelles de lletres, quina era la primera combinació?",
    opcions: ["GI i AZ", "GI i ZA", "IG i AZ", "AG i ZI"],
    correcta: 0,
    explicacio: "La secció oficial de la matrícula històrica conté 'GI' com a província inicial de Girona i 'AZ' com a tancament final."
  },
  "Resolució de Problemes": {
    desc: "Problemes de velocitat, consum de carburant de patrulles o càlcul percentual de delictes anuals.",
    pregunta: "Un vehicle patrulla viatja a 120 km/h darrere d'un sospitós a 100 km/h que li porta 10 km de distància. Quant de temps triga a detenir-lo?",
    opcions: ["30 minuts", "15 minuts", "20 minuts", "45 minuts"],
    correcta: 0,
    explicacio: "Diferència de velocitats de 20 km/h. Per recórrer l'avantatge de 10 km requerirà 0,5 hores (exactament 30 minuts)."
  },
  "Atenció i Resistència": {
    desc: "Identificació ràpida de caràcters repetits, errors tipogràfics o paraules amb un detall canviat sota fatiga ocular.",
    pregunta: "Quantes vegades es repeteix la combinació de lletres 'qp' en la següent línia: qpqpqqpqppppqp?",
    opcions: ["3 vegades", "4 vegades", "5 vegades", "6 vegades"],
    correcta: 1,
    explicacio: "Si mirem el text ordenadament, trobem 'qp' a: [qp] [qp] q [qp] qppp [qp]. Apareix 4 vegades exactes."
  },
  "Sèries de Dominós": {
    desc: "Reconèixer moviments circulars, simetria o progressió lògica numèrica recreada sobre fitxes clàssiques de dominó.",
    pregunta: "Quina fitxa de dominó tanca la seqüència lògica: [1/2] - [2/3] - [3/4] - [4/5] - [?]",
    opcions: ["[5/6]", "[6/1]", "[0/0]", "[1/1]"],
    correcta: 0,
    explicacio: "Sèrie incremental contínua simple: els numeradors pugen (+1) i els denominadors també pujant de forma contínua (+1), donant [5/6]."
  },
  "Aptituds Administratives": {
    desc: "Criteris d'indexació alfabètica pura, classificació de fitxers de comissaria o ordenació cronològica.",
    pregunta: "Quin cognom ha d'anar col·locat en primer lloc sota els criteris de classificació de l'alfabet català?",
    opcions: ["Sánchez, Josep", "Sanz, Carles", "Santi, Andreu", "San José, Maria"],
    correcta: 3,
    explicacio: "San José conté un espai buit que es prioritza per davant de qualseval combinació de Sánchez o Santi."
  }
};

const provesPsicotecnics = [
  "Sèries Aritmètiques", "Figures i Espai", "Raonament Lògic", 
  "Comprensió Verbal", "Càlcul Mental Ràpid", "Memòria Visual", 
  "Resolució de Problemes", "Atenció i Resistència", "Sèries de Dominós", 
  "Aptituds Administratives"
];

interface PropsPCPsicotecnics {
  psicotecnicActiu: string;
  setPsicotecnicActiu: (prova: string) => void;
  respostaPsicoTriada: number | null;
  setRespostaPsicoTriada: (idx: number | null) => void;
  mostrarExplicacioPsico: boolean;
  setMostrarExplicacioPsico: (mostra: boolean) => void;
  onGoBack: () => void;
}

/**
 * COMPONENT: WebWorkspacePCPsicotecnics
 * 
 * Explicació per a no-programadors:
 * Aquest component agrupa l'entrenament dels 10 grans exercicis psicotècnics d'OposiCAT.
 * Mostra de manera ordenada la capçalera de l'examen, les fons, la pregunta interactiva del tipus test,
 * i permet validar la resposta donant feedback inmediat en català i consells pedagògics pel tutor a futur.
 */
export default function WebWorkspacePCPsicotecnics({
  psicotecnicActiu,
  setPsicotecnicActiu,
  respostaPsicoTriada,
  setRespostaPsicoTriada,
  mostrarExplicacioPsico,
  setMostrarExplicacioPsico,
  onGoBack
}: PropsPCPsicotecnics) {
  
  const dades = llistatPsico[psicotecnicActiu] || llistatPsico["Sèries Aritmètiques"];

  return (
    <div className="space-y-6 w-full text-left animate-in fade-in duration-300">
      
      {/* Explicació per a no-programadors: Botó de color negre / gris subtil per poder recular fàcilment cap al menú dels 8 botons de l'usuari. */}
      <div className="flex justify-start">
        <button
          id="btn-psico-tornar-teoria"
          onClick={onGoBack}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-slate-700/80 transition-all text-[11px] font-black italic uppercase tracking-wider text-slate-350 hover:text-white cursor-pointer"
        >
          <ChevronLeft size={16} className="text-[#00f296] group-hover:-translate-x-0.5 transition-transform" />
          Tornar al menú dels 8 botons
        </button>
      </div>

      {/* CAPÇALERA DE PÀGINA DE PSICOTÈCNICS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase text-teal-400 tracking-wider bg-teal-400/10 px-2.5 py-0.5 rounded border border-teal-400/20">
              ENTRENAMENT PSICOTÈCNIC DE MÀXIM RENDIMENT
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-black italic uppercase text-white tracking-widest leading-none">
            🧠 PROVA PSICOTÈCNICA
          </h1>
          <p className="text-xs text-slate-400 font-bold max-w-2xl leading-relaxed">
            Practica directament totes les àrees de psicotècnics requerides pel cos de Mossos d'Esquadra en oposicions passades i futures.
          </p>
        </div>
      </div>

      {/* MENÚ DE SELECCIÓ INTERACTIVA DE SUB-EXERCICIS */}
      <div className="space-y-3">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
          OPCIONS D'EXERCICIS PSICOTÈCNICS (TASES DE COORDENADES DE PREGUNTES CLON SOTA MOODLE):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {provesPsicotecnics.map((prova, idx) => {
            const actiu = psicotecnicActiu === prova;
            return (
              <button
                key={idx}
                onClick={() => {
                  setPsicotecnicActiu(prova);
                  setRespostaPsicoTriada(null);
                  setMostrarExplicacioPsico(false);
                }}
                className={`py-3 px-3 rounded-xl font-black italic uppercase text-[10px] tracking-wide transition-all border text-center cursor-pointer flex flex-col justify-center items-center min-h-[54px] ${
                  actiu
                    ? 'bg-[#00f296] text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/15 font-extrabold'
                    : 'bg-slate-950/60 text-slate-300 border-white/5 hover:border-slate-800 hover:text-white'
                }`}
              >
                {prova}
              </button>
            );
          })}
        </div>
      </div>

      {/* VISUALITZACIÓ EXERCICI ACTIU */}
      <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-950 pb-4">
          <div>
            <span className="text-[9px] text-teal-400 font-extrabold uppercase tracking-widest block">ENTRENAMENT INDIVIDUAL ACTIU</span>
            <h3 className="text-base font-black italic uppercase text-[#FFDF00] mt-1">PSICOTÈCNIC: {psicotecnicActiu}</h3>
          </div>
          <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            PROVA AUTÓNOMA
          </span>
        </div>

        <p className="text-xs text-slate-350 leading-relaxed font-semibold">
          {dades.desc}
        </p>

        {/* L'ENTRENAMENT INTERACTIU DE PSICOTÈCNICS */}
        <div className="border border-blue-900/15 p-6 rounded-2xl bg-slate-950/80 space-y-4">
          <span className="text-[9px] bg-red-650/15 text-red-400 font-extrabold uppercase px-2.5 py-1 rounded tracking-wider inline-block">
            PREGUNTA TIPO EXAMEN OFICIAL (MOODLE COHERENT)
          </span>
          
          <p className="text-xs font-black text-white leading-relaxed">
            {dades.pregunta}
          </p>

          {/* OPCIONS DE RESPOSTA */}
          <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
            {dades.opcions.map((op, idx) => {
              const triada = respostaPsicoTriada === idx;
              const esLaCorrecta = idx === dades.correcta;
              let estilBoto = "bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-850 hover:border-teal-500/40";
              if (respostaPsicoTriada !== null) {
                if (triada) {
                  estilBoto = esLaCorrecta 
                    ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold" 
                    : "bg-red-950/70 border-red-500 text-red-300 font-bold";
                } else if (esLaCorrecta) {
                  estilBoto = "bg-emerald-950/30 border-emerald-500/40 text-emerald-300";
                } else {
                  estilBoto = "bg-slate-950 border-white/5 text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (respostaPsicoTriada === null) {
                      setRespostaPsicoTriada(idx);
                      setMostrarExplicacioPsico(true);
                    }
                  }}
                  className={`p-3.5 border rounded-xl text-left text-xs transition-all cursor-pointer flex gap-3 ${estilBoto}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    triada ? 'bg-white text-slate-950' : 'bg-slate-950 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{op}</span>
                </button>
              );
            })}
          </div>

          {/* FEEDBACK EXPLICATIU DEL TUTOR SOTA ARQUITECTURA DIDÀCTICA */}
          {respostaPsicoTriada !== null && mostrarExplicacioPsico && (
            <div className="p-4 bg-blue-950/40 border border-blue-900/30 rounded-xl space-y-1.5 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-[9.5px] font-black uppercase text-[#FFDF00]">
                  🔔 EXPLICACIÓ I RETROALIMENTACIÓ DEL TUTOR
                </span>
                <button 
                  onClick={() => {
                    setRespostaPsicoTriada(null);
                    setMostrarExplicacioPsico(false);
                  }}
                  className="text-[9px] text-[#00f296] hover:underline uppercase font-bold"
                >
                  Tornar a provar
                </button>
              </div>
              <p className="text-[10.5px] text-slate-300 font-medium leading-relaxed">
                {dades.explicacio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
