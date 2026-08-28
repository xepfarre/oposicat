import React, { useState } from 'react';
import { Youtube, ChevronLeft, User, Shield, FileText, Play, Info, PencilLine, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { MAP_COMPETENCIES } from './preguntes_biodata';

/* 
  Aquest component gestiona la guia de la Prova Biodata.
  Inclou explicacions interactives, preguntes genèriques i simulacre de pràctica del test de l'acadèmia.
  Tots els canvis d'estil segueixen la identitat d'OposiCAT.
*/

const VIDEO_BIODATA = "https://youtu.be/mrnciH-f1Kc?si=Is8UU2tn-Ch4emyh";

interface MenuButtonProps {
  titol: string;
  subtitol: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

const MenuButton = ({ titol, subtitol, onClick }: Omit<MenuButtonProps, 'icon' | 'color'>) => (
  <button 
    onClick={onClick}
    className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-6 flex flex-col items-center justify-center transition-all active:scale-95 group text-center"
  >
    <span className="text-white font-black italic uppercase tracking-widest text-xs leading-none">{titol}</span>
    <span className="text-white/30 text-[7px] font-black uppercase tracking-[0.2em] mt-1.5 group-hover:text-white/50 transition-colors uppercase">{subtitol}</span>
  </button>
);

export const GuiaBiodata = ({ 
  seccio, 
  setSeccio,
  actualitzaSeccioPare,
  subSeccioTest,
  setSubSeccioTest
}: { 
  seccio: 'menu' | 'personals' | 'laborals' | 'pgme' | 'test',
  setSeccio: (s: 'menu' | 'personals' | 'laborals' | 'pgme' | 'test') => void,
  actualitzaSeccioPare?: (s: any) => void,
  subSeccioTest: 'menu' | 'que_es' | 'practica',
  setSubSeccioTest: (s: 'menu' | 'que_es' | 'practica') => void
}) => {
  const [preguntaOberta, setPreguntaOberta] = useState<number | null>(null);
  const [blocObert, setBlocObert] = useState<number | null>(null);
  const [veureCompetencies, setVeureCompetencies] = useState<boolean>(false);

  // Explicació per a no-programadors:
  // Definim les 10 competències clau oficials requerides per l'usuari amb el seu corresponent nom.
  const competenciesClauTest = MAP_COMPETENCIES.map(c => c.nom);

  // Explicació per a no-programadors:
  // Definim els diferents estats del simulador de test de biodata per a guiar l'alumne durant la pràctica:
  // - 'opcions': pantalla inicial amb els dos passos interactius o botons reduïts.
  // - 'instruccions': avís de temps, regles i el format del test d'oposició.
  // - 'fent_test': interfície activa de preguntes (del qüestionari d'estudiant de 1 a 80).
  // - 'resultats': exposició dels resultats reals o d'exemple simulat.
  const [estatPractica, setEstatPractica] = useState<'opcions' | 'instruccions' | 'fent_test' | 'resultats'>('opcions');
  
  // Explicació per a no-programadors:
  // Gestionem quina de les 80 preguntes està responent actualment l'estudiant de forma seqüencial (de 0 a 79).
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  
  // Explicació per a no-programadors:
  // Carreguem dinàmicament les preguntes de Biodata des de la base de dades (Firestore) si hi ha dades gravades,
  // en cas contrari farem servir les 80 de referència programades al codi com a mètode de seguretat de contingut.
  const [preguntesList, setPreguntesList] = useState<any[]>([]);
  const [loadingPreguntes, setLoadingPreguntes] = useState<boolean>(true);

  React.useEffect(() => {
    const fetchPreguntesBBDD = async () => {
      try {
        const q = query(collection(db, "preguntes_biodata_oficial"), orderBy("id", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const llista: any[] = [];
          snap.forEach(docSnap => {
            llista.push({
              docId: docSnap.id,
              ...docSnap.data()
            });
          });
          llista.sort((a, b) => (a.id || 0) - (b.id || 0));
          // Filtrem les que estan suspeses (perquè l'alumne no les vegi en fer el test)
          const actives = llista.filter(p => p.suspensa !== true);
          setPreguntesList(actives);
        } else {
          setPreguntesList([]);
        }
      } catch (err) {
        console.error("Error carregant preguntes del test de biodata des de la BBDD", err);
        setPreguntesList([]);
      } finally {
        setLoadingPreguntes(false);
      }
    };
    fetchPreguntesBBDD();
  }, []);

  // Explicació per a no-programadors:
  // Creem una variable de drecera que conté el conjunt de preguntes actives a mostrar en temps real de l'examen.
  const preguntesActives = preguntesList;

  // Explicació per a no-programadors:
  // Guardem en un array de caselles el valor de la resposta seleccionada (+1, 0, -1, o qualsevol valor numèric).
  // Comença amb totes les caselles buides (null) adaptades de forma dinàmica segons la mida del pool de preguntes.
  const [respostesUsuari, setRespostesUsuari] = useState<(number | null)[]>([]);

  // Adaptem la mida de les respostes de l'usuari quan les preguntes de BBDD han finalitzat de carregar-se
  React.useEffect(() => {
    if (preguntesActives.length > 0) {
      setRespostesUsuari(Array(preguntesActives.length).fill(null));
    }
  }, [preguntesList]);
  
  // Explicació per a no-programadors:
  // El cronòmetre de 25 minuts que anirà reduint els segons (25 minuts = 1500 segons).
  const [tempsRestant, setTempsRestant] = useState<number>(25 * 60);

  // Explicació per a no-programadors:
  // Desarà els darrers valors d'escala obtinguts del test (0 a 10) per a cadascuna de les 10 competències de forma independent.
  const [resultatsTest, setResultatsTest] = useState<number[] | null>(null);

  // Explicació per a no-programadors:
  // Indica si les mètriques mostrades són fictícies/simulades d'exemple o provenen d'un test realitzat per l'usuari de veritat.
  const [esResultatDeProva, setEsResultatDeProva] = useState<boolean>(false);

  // Explicació per a no-programadors:
  // Controla si es mostra el diàleg de confirmació reactiu abans de lliurar definitivament el test de biodata.
  const [mostraConfirmacioLliurament, setMostraConfirmacioLliurament] = useState<boolean>(false);

  // Explicació per a no-programadors:
  // Carreguem des del navegador o de la base de dades Firestore el darrer assaig guardat per a l'alumne autònomament.
  React.useEffect(() => {
    const carregarDarrerTest = async () => {
      if (auth.currentUser) {
        try {
          const userId = auth.currentUser.uid;
          const q = query(
            collection(db, `usuaris/${userId}/resultats_biodata`),
            orderBy('creatEl', 'desc'),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0].data();
            if (d.resultats) {
              setResultatsTest(d.resultats);
              return;
            }
          }
        } catch (e) {
          console.error("Error carregant darrer test de la BBDD", e);
        }
      }

      // Si no està logat o falla la xarxa, provem el disc local del navegador (localStorage)
      try {
        const g = localStorage.getItem('oposicat_biodata_ultim_test');
        if (g) {
          setResultatsTest(JSON.parse(g));
        }
      } catch (e) {
        console.error("Error carregant el darrer test des de local", e);
      }
    };

    carregarDarrerTest();
  }, [auth.currentUser]);

  // Explicació per a no-programadors:
  // Fil de temporització asíncron per fer córrer el cronòmetre de 25 minuts enrere.
  // Es desactiva sol quan s'acaba el simulacre, l'estudiant surt de la pantalla o s'esgota el temps total.
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (estatPractica === 'fent_test' && tempsRestant > 0) {
      interval = setInterval(() => {
        setTempsRestant((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            // Si el temps s'exhaureix, finalitzem el test automàticament i calculem conclusions.
            finalitzarTest(respostesUsuari, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [estatPractica, tempsRestant, respostesUsuari]);

  // Explicació per a no-programadors:
  // Aquesta funció central és el motor de càlcul de les notes del test de biodata.
  // 1. Es creen dos sumatoris en temps real per a cadascuna de les 10 competències:
  //    - punts_aconseguits: acumula la puntuació de l'opció que tria l'usuari (pot ser negatiu).
  //    - punts_maxims: acumula el valor màxim que l'estudiant hagués pogut treure en aquella pregunta (independentment de la triada).
  // 2. S'aplica la fórmula de normalització estricte exigida de cara a les oposicions de Mossos:
  //    Nota_Competencia = ( punts_aconseguits_[COMPETÈNCIA] / punts_maxims_[COMPETÈNCIA] ) * 10
  // 3. S'apliquen els controls de límit de seguretat (sanity checks):
  //    - Tall Inferior: Si és menor de 0, es força automàticament a 0.
  //    - Tall Superior: Si supera el 10, es limita de forma estricta a 10.
  // 4. Els resultats d'escala es desen en format local per no perdre l'esforç i s'exposen de manera lúdica i transparent.
  const finalitzarTest = (respostes: (number | null)[], tempsExhaurit = false) => {
    // Inicialitzem els objectes comptadors per a cadascun dels codis de competència clau (HSC, OSC, TEC, etc.)
    const puntsAconseguits: Record<string, number> = {};
    const puntsMaxims: Record<string, number> = {};

    MAP_COMPETENCIES.forEach(comp => {
      puntsAconseguits[comp.id] = 0;
      puntsMaxims[comp.id] = 0;
    });

    // Recorrem de forma independent cadascuna de les preguntes reals del nostre motor de Biodata
    preguntesActives.forEach((preg, idx) => {
      const respostaIndex = respostes[idx];

      MAP_COMPETENCIES.forEach(comp => {
        const compId = comp.id;

        // Funció per obtenir els punts d'una opció per a una competència determinada (amb suport multidimensional per a no-programadors)
        const getPuntsForComp = (op: any) => {
          if (op.multidimensional && op.multidimensional[compId] !== undefined) {
            return op.multidimensional[compId];
          }
          if (preg.competencia === compId) {
            return op.punts;
          }
          return 0;
        };

        const maxPuntsPregunta = Math.max(...preg.opcions.map(getPuntsForComp));
        puntsMaxims[compId] += maxPuntsPregunta;

        if (respostaIndex !== null && preg.opcions[respostaIndex] !== undefined) {
          puntsAconseguits[compId] += getPuntsForComp(preg.opcions[respostaIndex]);
        }
      });
    });

    // Calculem la nota final unificada de cadascuna de les 10 competències seguint la llista oficial
    const puntuacions: number[] = MAP_COMPETENCIES.map(comp => {
      const aconseguits = puntsAconseguits[comp.id];
      const maxims = puntsMaxims[comp.id];

      // Evitem divisions entre 0
      if (maxims === 0) return 0;

      let nota = (aconseguits / maxims) * 10;

      // REGLAS DE CONTROL DE LÍMITS (SANITY CHECKS)
      // Tall Inferior: forçar a 0 si la nota final és menor que zero
      if (nota < 0) {
        nota = 0;
      }
      // Tall Superior: forçar a 10 si la nota calculada final és superior a 10
      if (nota > 10) {
        nota = 10;
      }

      // Deixem un decimal arrodonit amb exactitud per a una millor visualització
      return parseFloat(nota.toFixed(1));
    });

    setResultatsTest(puntuacions);
    setEsResultatDeProva(false);
    
    // Perdurabilitat local i remota: Gravem els resultats de l'alumne
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      addDoc(collection(db, `usuaris/${userId}/resultats_biodata`), {
        userId,
        resultats: puntuacions,
        respostesUsuari: respostes,
        creatEl: new Date().toISOString()
      }).catch(e => console.error("Error guardant resultats a Firestore", e));
    }

    try {
      localStorage.setItem('oposicat_biodata_ultim_test', JSON.stringify(puntuacions));
    } catch (e) {
      console.error("Error guardant resultats de test de biodata", e);
    }

    if (tempsExhaurit) {
      alert("⚠️ S'ha esgotat el temps regulat de 25 minuts! El teu test s'ha processat automàticament amb les respostes omplertes.");
    }
    setEstatPractica('resultats');
  };

  // Explicació per a no-programadors:
  // Funció per a carregar a l'instant un model fictici de prova i així poder veure el panell d'anàlisi competencial immediatament
  const visualitzarResultatDeProvaDirecte = () => {
    const valorsDeProva = [8.5, 6.0, 9.0, 7.5, 9.0, 8.0, 10.0, 7.0, 8.5, 5.5]; // Valors d'exemple excel·lents i realistes
    setResultatsTest(valorsDeProva);
    setEsResultatDeProva(true);
    setEstatPractica('resultats');
  };

  // Reiniciar l'estat de pregunta oberta quan canviem de secció
  React.useEffect(() => {
    setPreguntaOberta(null);
  }, [seccio]);

  const preguntesPersonals = [
    {
      p: "Digui'm els seus 3 majors defectes i 3 majors virtuts.",
      r: "Resposta pendent de definir..."
    },
    {
      p: "És el primer cop que es presenta? Si no ho és, per què es presenta un altre cop?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Per què creu que vostè ha d'aprovar aquesta oposició aquest any?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Descrigui breument la situació que mais por ha passat a la seva vida.",
      r: "Resposta pendent de definir..."
    }
  ];

  const preguntesLaborals = [
    {
      p: "Quants anys ha treballat vostè i on?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Quin és el càrrec més important que vostè ha desenvolupat?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Si tornés a néixer, estudiaria el mateix?",
      r: "Resposta pendent de definir..."
    }
  ];

  const preguntesPGME = [
    {
      p: "Per què vostè vol ser policia?",
      r: "Voldria ser policia perquè considero que sóc una persona que vol ajudar a la societat de forma altruista i professional. Desenvoluparé la feina amb gran professionalitat i responsabilitat per a donar el màxim nivell del servei. Estic preparat per a fer el que sigui necessari per als ciutadans i el cos de PGME, pero amb els peus a terra, sense creure'm un superheroi."
    },
    {
      p: "Per què ha decidit ser mosso i no policia local?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Què espera de la feina de mosso?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Què creu vostè que la ciutadania espera de vostè?",
      r: "Resposta pendent de definir..."
    },
    {
      p: "Quina especialitat és la que més li agradaria treballar dins del cos?",
      r: "Resposta pendent de definir..."
    }
  ];

  // Exposar l'estat de secció de la guia al pare si canvia
  React.useEffect(() => {
    if (actualitzaSeccioPare) actualitzaSeccioPare(seccio);
  }, [seccio]);

  const renderMenuPrincipal = () => (
    <div className="flex flex-col gap-3 md:gap-6 w-full animate-in fade-in duration-500">
      {/* Botó Vermell de YouTube - Rectangular com els altres */}
      <a 
        href={VIDEO_BIODATA} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full bg-red-600/90 hover:bg-red-600 border border-white/10 rounded-2xl md:rounded-3xl py-4 md:py-10 flex flex-col items-center justify-center transition-all active:scale-95 group shadow-xl mb-2 md:mb-6"
      >
        <span className="text-white font-black italic uppercase tracking-widest text-xs md:text-2xl leading-none">EN QUÈ CONSISTEIX LA PROVA?</span>
        <div className="flex items-center gap-2 mt-1.5 md:mt-3">
           <Youtube size={12} className="text-white md:size-6" />
           <span className="text-white/50 text-[7px] md:text-sm font-black uppercase tracking-[0.2em]">GUIA EN VÍDEO</span>
        </div>
      </a>

      {/* Línia separadora fina */}
      <div className="h-[1px] bg-white/5 w-full my-2 md:my-6 shadow-sm" />

      <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-6">
        <button 
          onClick={() => setSeccio('test')}
          className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl md:rounded-[2.5rem] py-6 md:py-16 flex flex-col items-center justify-center transition-all active:scale-95 group text-center md:col-span-2"
        >
          <span className="text-white font-black italic uppercase tracking-widest text-xs md:text-2xl leading-none">TEST DE BIODATA</span>
          <span className="text-white/30 text-[7px] md:text-sm font-black uppercase tracking-[0.2em] mt-1.5 md:mt-3 group-hover:text-white/50 transition-colors uppercase">SIMULACRE DE L'EXAMEN</span>
        </button>

        {/* Segona línia separadora per dividir el Test de les preguntes */}
        <div className="h-[1px] bg-white/5 w-full my-1 md:my-6 shadow-sm md:col-span-2" />

        <button 
          onClick={() => setSeccio('personals')}
          className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl md:rounded-[2.5rem] py-6 md:py-16 flex flex-col items-center justify-center transition-all active:scale-95 group text-center"
        >
          <span className="text-white font-black italic uppercase tracking-widest text-xs md:text-2xl leading-none">PREGUNTES PERSONALS</span>
          <span className="text-white/30 text-[7px] md:text-sm font-black uppercase tracking-[0.2em] mt-1.5 md:mt-3 group-hover:text-white/50 transition-colors uppercase">AUTOCONEIXEMENT I PASSAT</span>
        </button>

        <button 
          onClick={() => setSeccio('laborals')}
          className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl md:rounded-[2.5rem] py-6 md:py-16 flex flex-col items-center justify-center transition-all active:scale-95 group text-center"
        >
          <span className="text-white font-black italic uppercase tracking-widest text-xs md:text-2xl leading-none">PREGUNTES LABORALS</span>
          <span className="text-white/30 text-[7px] md:text-sm font-black uppercase tracking-[0.2em] mt-1.5 md:mt-3 group-hover:text-white/50 transition-colors uppercase">EXPERIÈNCIA I TRAJECTÒRIA</span>
        </button>

        <button 
          onClick={() => setSeccio('pgme')}
          className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl md:rounded-[2.5rem] py-6 md:py-16 flex flex-col items-center justify-center transition-all active:scale-95 group text-center md:col-span-2"
        >
          <span className="text-white font-black italic uppercase tracking-widest text-xs md:text-2xl leading-none">PREGUNTES DE PGME</span>
          <span className="text-white/30 text-[7px] md:text-sm font-black uppercase tracking-[0.2em] mt-1.5 md:mt-3 group-hover:text-white/50 transition-colors uppercase">VALORS i CULTURA MOSSO</span>
        </button>
      </div>
    </div>
  );

  if (seccio === 'personals') {
    return (
      <div className="flex flex-col flex-1 gap-4 animate-in slide-in-from-right-4 duration-300 w-full mb-10">
        <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2.5rem] md:rounded-[3rem] pt-6 md:pt-12 px-6 md:px-12 pb-8 md:pb-16 -mx-4 md:mx-0 shadow-2xl backdrop-blur-sm">
          <h3 className="text-blue-400 font-[900] italic uppercase text-base md:text-3xl mb-6 md:mb-12 tracking-[0.1em] text-center">Preguntes Personals</h3>
          
          <ul className="flex flex-col md:grid md:grid-cols-2 gap-x-4 gap-y-3 md:gap-x-10 md:gap-y-8">
            {preguntesPersonals.map((item, i) => (
              <li key={i} className="flex flex-col gap-2 md:gap-4">
                <div className="text-[12px] md:text-xl text-white/90 bg-[#1a3a5a]/60 py-3 md:py-8 px-5 md:px-10 rounded-xl md:rounded-3xl border border-white/5 leading-tight italic text-center shadow-inner w-full">
                  "{item.p}"
                </div>
                
                <button 
                  onClick={() => setPreguntaOberta(preguntaOberta === i ? null : i)}
                  className="flex items-center justify-center gap-2 py-1.5 md:py-3 text-[9px] md:text-sm font-black uppercase tracking-widest text-blue-400/70 hover:text-blue-400 transition-colors"
                >
                  {preguntaOberta === i ? (
                    <>AMAGAR RESPOSTA <ChevronUp size={12} className="md:size-5" /></>
                  ) : (
                    <>MOSTRA RESPOSTA <ChevronDown size={12} className="md:size-5" /></>
                  )}
                </button>

                {preguntaOberta === i && (
                  <div className="bg-black/20 border border-white/5 rounded-xl md:rounded-3xl p-4 md:p-10 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-[11px] md:text-lg text-white/60 leading-relaxed italic text-center">
                      {item.r}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (seccio === 'laborals') {
    return (
      <div className="flex flex-col flex-1 gap-4 animate-in slide-in-from-right-4 duration-300 w-full mb-10">
        <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2.5rem] md:rounded-[3rem] pt-6 md:pt-12 px-6 md:px-12 pb-8 md:pb-16 -mx-4 md:mx-0 shadow-2xl backdrop-blur-sm">
          <h3 className="text-amber-400 font-[900] italic uppercase text-base md:text-3xl mb-4 md:mb-10 tracking-[0.1em] text-center">Preguntes Laborals</h3>
          
          {/* Label introductori */}
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl md:rounded-3xl p-4 md:p-8 mb-6 md:mb-12 text-center">
            <p className="text-[11px] md:text-xl text-amber-400/90 font-bold leading-relaxed italic">
              "En aquesta secció es repassa la teva trajectòria professional i el teu compromís amb el treball."
            </p>
          </div>

          <ul className="flex flex-col md:grid md:grid-cols-2 gap-x-4 gap-y-3 md:gap-x-10 md:gap-y-8">
            {preguntesLaborals.map((item, i) => (
              <li key={i} className="flex flex-col gap-2 md:gap-4">
                <div className="text-[12px] md:text-xl text-white/90 bg-[#1a3a5a]/60 py-3 md:py-8 px-5 md:px-10 rounded-xl md:rounded-3xl border border-white/5 leading-tight italic text-center shadow-inner w-full">
                  "{item.p}"
                </div>
                
                <button 
                  onClick={() => setPreguntaOberta(preguntaOberta === i ? null : i)}
                  className="flex items-center justify-center gap-2 py-1.5 md:py-3 text-[9px] md:text-sm font-black uppercase tracking-widest text-amber-400/70 hover:text-amber-400 transition-colors"
                >
                  {preguntaOberta === i ? (
                    <>AMAGAR RESPOSTA <ChevronUp size={12} className="md:size-5" /></>
                  ) : (
                    <>MOSTRA RESPOSTA <ChevronDown size={12} className="md:size-5" /></>
                  )}
                </button>

                {preguntaOberta === i && (
                  <div className="bg-black/20 border border-white/5 rounded-xl md:rounded-3xl p-4 md:p-10 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[11px] md:text-lg text-white/60 leading-relaxed italic text-center">
                      {item.r}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (seccio === 'pgme') {
    return (
      <div className="flex flex-col flex-1 gap-4 animate-in slide-in-from-right-4 duration-300 w-full mb-10">
        <div className="bg-[#1a3a5a]/30 border border-white/10 rounded-[2.5rem] md:rounded-[3rem] pt-6 md:pt-12 px-6 md:px-12 pb-8 md:pb-16 -mx-4 md:mx-0 shadow-2xl backdrop-blur-sm">
          <h3 className="text-emerald-400 font-[900] italic uppercase text-base md:text-3xl mb-4 md:mb-10 tracking-[0.1em] text-center">Preguntes de PGME</h3>
          
          {/* Label introductori */}
          <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl md:rounded-3xl p-4 md:p-8 mb-6 md:mb-12 text-center">
            <p className="text-[11px] md:text-xl text-emerald-400/90 font-bold leading-relaxed italic">
              "En aquesta part de l'examen us faran preguntes relacionades amb la Policia de la Generalitat Mossos d'Esquadra (PGME)"
            </p>
          </div>

          <div className="flex flex-col items-center mb-4">
            <span className="text-[9px] md:text-sm text-white/30 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] italic text-center">Exemple de preguntes d'altres anys</span>
          </div>

          <ul className="flex flex-col md:grid md:grid-cols-2 gap-x-4 gap-y-3 md:gap-x-10 md:gap-y-8">
            {preguntesPGME.map((item, i) => (
              <li key={i} className="flex flex-col gap-2 md:gap-4">
                <div className="text-[12px] md:text-xl text-white/90 bg-[#1a3a5a]/60 py-3 md:py-8 px-5 md:px-10 rounded-xl md:rounded-3xl border border-white/5 leading-tight italic text-center shadow-inner w-full">
                  "{item.p}"
                </div>
                
                <button 
                  onClick={() => setPreguntaOberta(preguntaOberta === i ? null : i)}
                  className="flex items-center justify-center gap-2 py-1.5 md:py-3 text-[9px] md:text-sm font-black uppercase tracking-widest text-emerald-400/70 hover:text-emerald-400 transition-colors"
                >
                  {preguntaOberta === i ? (
                    <>AMAGAR RESPOSTA <ChevronUp size={12} className="md:size-5" /></>
                  ) : (
                    <>MOSTRA RESPOSTA <ChevronDown size={12} className="md:size-5" /></>
                  )}
                </button>

                {preguntaOberta === i && (
                  <div className="bg-black/20 border border-white/5 rounded-xl md:rounded-3xl p-4 md:p-10 mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-[11px] md:text-lg text-white/60 leading-relaxed italic text-center">
                      {item.r}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (seccio === 'test') {
    return (
      <div className="flex flex-col flex-1 gap-6 animate-in slide-in-from-right-4 duration-300 w-full animate-in fade-in duration-300">
        {subSeccioTest === 'menu' ? (
          <div className="flex flex-col gap-6 flex-1 justify-center animate-in fade-in duration-300">
            {/* Secció 1: Què és un test biodata */}
            {/* Explicació per a no-programadors:
                En aquest bloc mostrem la introducció i explicació detallada sobre la importància del test de biodata per a la prova policial.
                Després de l'explicació, oferim un botó més estilitzat per a conèixer més detalls de la guia de manera interactiva. */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2 px-2">
                <span className="text-[9px] text-[#ff0000] font-black uppercase tracking-[0.3em] italic drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] text-center">
                  DEFINICIÓ I PROPÒSIT DEL TEST
                </span>
                <p className="text-white/60 text-[10.5px] font-medium text-center leading-relaxed max-w-[340px] italic">
                  T'expliquem pas a pas en què consisteix un biodata i per què aquest biodata pot definir la teva entrevista i la teva escola a l'ISPC els propers anys. Has de conèixer per què aquest test és l'única informació que tindran de tu.
                </p>
              </div>
              <button 
                onClick={() => setSubSeccioTest('que_es')}
                className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-2.5 flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl group px-6 text-center"
              >
                <span className="text-white font-[900] italic uppercase tracking-widest text-[15px]">Què és un test biodata?</span>
                <span className="text-white/40 font-black italic uppercase text-[9px] tracking-widest mt-1">( Informació i guia )</span>
              </button>
            </div>

            {/* Separador de seccions, seguint la mateixa estètica del menú d'entrevista */}
            <div className="h-[1px] bg-white/10 w-full my-2" />

            {/* Secció 2: Practica el test biodata */}
            {/* Explicació per a no-programadors:
                Aquest bloc permet als estudiants posar en pràctica simulacres de biodata de l'acadèmia. */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2 px-2">
                <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.3em] italic text-center">
                  PRACTICA AMB LA MILLOR EINA
                </span>
                <p className="text-white/60 text-[10.5px] font-medium text-center leading-relaxed max-w-[340px] italic">
                  El nostre grup de psicòlegs han creat un test de biodata expressament per extreure els mateixos valors que tenen a l'ISPC en el transcurs de les oposicions. Es valora i qüestiona exactament igual, és la teva millor eina per a practicar.
                </p>
              </div>
              <button 
                onClick={() => setSubSeccioTest('practica')}
                className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 border border-white/10 rounded-2xl py-2.5 flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl group px-6 text-center"
              >
                <span className="text-white font-[900] italic uppercase tracking-widest text-[15px]">Practica el test biodata</span>
                <span className="text-white/40 font-black italic uppercase text-[9px] tracking-widest mt-1">( Exercicis de pràctica )</span>
              </button>
            </div>
          </div>
        ) : subSeccioTest === 'que_es' ? (
          <div className="flex flex-col flex-1 gap-4 animate-in fade-in duration-300">
            {/* Explicació per a no-programadors:
                Hem dissenyat una llista de desplegables interactius (acordió). Cada botó correspon a un dels conceptes clau sol·licitats pel disseny d'OposiCAT.
                En fer clic a cadascun, es mostra el detall de la informació teòrica amb un disseny molt polit i modern. */}
            <div className="flex flex-col gap-3">
              
              {/* BLOC 1: Què és la prova de biodata */}
              <div className="border border-white/10 rounded-2xl bg-[#1a3a5a]/20 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setBlocObert(blocObert === 1 ? null : 1)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span className="text-white font-[900] italic uppercase tracking-wider text-[11px] md:text-sm">
                    Què és la prova de biodata?
                  </span>
                  <div className="text-cyan-400 p-1">
                    {blocObert === 1 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {blocObert === 1 && (
                  <div className="p-4 pt-1 bg-black/10 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[10.5px] md:text-[13px] text-white/75 leading-relaxed italic">
                      És una prova que requereix de donar informació personal i informació psicològica al cos de Mossos per tal de que ells puguin esgrimir el teu perfil psicoprofessional amb les dades obtingudes.
                    </p>
                  </div>
                )}
              </div>

              {/* BLOC 2: Com es puntua? */}
              <div className="border border-white/10 rounded-2xl bg-[#1a3a5a]/20 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setBlocObert(blocObert === 2 ? null : 2)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span className="text-white font-[900] italic uppercase tracking-wider text-[11px] md:text-sm">
                    Com es puntua?
                  </span>
                  <div className="text-emerald-400 p-1">
                    {blocObert === 2 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {blocObert === 2 && (
                  <div className="p-4 pt-1 bg-black/10 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200 flex flex-col gap-3">
                    <p className="text-[10.5px] md:text-[13px] text-white/75 leading-relaxed italic">
                      A diferència del que la majoria de gent es pensa, es puntua durant la fase del biodata, a l'entrevista i un cop a l'escola i durant les pràctiques de policia (les 4 fases de l'aspirant) les competències clau. No es puntua si ets una bona persona de l'1-10, sinó que ser una bona persona serà un cúmul de competències clau que donaran punts o no a cadascuna d'elles. Entendre això és crític.
                    </p>
                    
                    {/* Botó interactiu per visualitzar les competències clau sol·licitades pel link del text */}
                    <button 
                      onClick={() => setVeureCompetencies(!veureCompetencies)}
                      className="inline-flex self-start items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider transition-all mt-1 cursor-pointer"
                    >
                      <Info size={11} /> {veureCompetencies ? "Amagar Competències Clau" : "Veure les Competències Clau de l’ISPC"}
                    </button>

                    {veureCompetencies && (
                      <div className="mt-2 p-3 bg-[#0a1b2e]/60 border border-emerald-500/10 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-[9px] text-[#00f296] font-black uppercase tracking-widest block mb-1.5">★ COMPETÈNCIES CLAU (ISPC)</span>
                        <ul className="text-[9.5px] text-white/60 space-y-1.5 italic">
                          <li>• <strong className="text-white/85">Adaptabilitat i flexibilitat:</strong> Capacitat per acceptar canvis i reaccionar correctament davant d'imprevistos.</li>
                          <li>• <strong className="text-white/85">Autocontrol i tolerància a la frustració:</strong> Domini de les emocions pròpies en condicions de màxima pressió.</li>
                          <li>• <strong className="text-white/85">Treball en equip:</strong> Col·laboració activa per un front comú d'objectius policials unificats.</li>
                          <li>• <strong className="text-white/85">Habilitats de comunicació:</strong> Claredat verbal, escolta activa i expressió de total seguretat.</li>
                          <li>• <strong className="text-white/85">Orientació al servei públic:</strong> Motivació altruista i voluntat per protegir la comunitat.</li>
                          <li>• <strong className="text-white/85">Presa de decisions i responsabilitat:</strong> Ètica exemplar i capacitat per escollir l'actuació mostrada sobre l'estrès.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BLOC 3: Què és el famós qüestionari de biodata */}
              <div className="border border-white/10 rounded-2xl bg-[#1a3a5a]/20 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setBlocObert(blocObert === 3 ? null : 3)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span className="text-white font-[900] italic uppercase tracking-wider text-[11px] md:text-sm">
                    Què és el "famós" qüestionari de biodata?
                  </span>
                  <div className="text-purple-400 p-1">
                    {blocObert === 3 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {blocObert === 3 && (
                  <div className="p-4 pt-1 bg-black/10 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[10.5px] md:text-[13px] text-white/75 leading-relaxed italic">
                      És on realment posarem un valor numèric a la teva personalitat en relació a les competències clau. On és tant important no ser un 10 en una competència com ser un 2. Els extrems són la definició de suspendre l'oposició, ja sigui per extremista o per mentider.
                    </p>
                  </div>
                )}
              </div>

              {/* BLOC 4: Com puc entendre i millorar en aquesta prova? */}
              <div className="border border-white/10 rounded-2xl bg-[#1a3a5a]/20 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setBlocObert(blocObert === 4 ? null : 4)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span className="text-white font-[900] italic uppercase tracking-wider text-[11px] md:text-sm">
                    Com puc entendre i millorar en aquesta prova?
                  </span>
                  <div className="text-amber-400 p-1">
                    {blocObert === 4 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {blocObert === 4 && (
                  <div className="p-4 pt-1 bg-black/10 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[10.5px] md:text-[13px] text-white/75 leading-relaxed italic">
                      Fàcil, fes el test de biodata, entén què has tret al resultat que et donem i demana una entrevista amb els nostres psicòlegs per a consells i polir el que has fet bé i malament.
                    </p>
                  </div>
                )}
              </div>

              {/* BLOC 5: Què no he de fer mai? */}
              <div className="border border-white/10 rounded-2xl bg-[#1a3a5a]/20 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setBlocObert(blocObert === 5 ? null : 5)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span className="text-white font-[900] italic uppercase tracking-wider text-[11px] md:text-sm">
                    Què no he de fer mai?
                  </span>
                  <div className="text-[#ff5555] p-1">
                    {blocObert === 5 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {blocObert === 5 && (
                  <div className="p-4 pt-1 bg-black/10 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[10.5px] md:text-[13px] text-white/75 leading-relaxed italic">
                      Repetir aquest test de biodata fins a saber-lo de memòria. Si ho fas, aprendràs de memòria les respostes i el dia de l'examen seran diferents i no hauràs après res. Fes-lo poques vegades i, després de fer-lo, demana cita amb el psicòleg per veure si vas millorant o no.
                    </p>
                  </div>
                )}
              </div>

            </div>

             <button 
               onClick={() => {
                 setBlocObert(null);
                 setVeureCompetencies(false);
                 setSubSeccioTest('menu');
               }} 
               className="mt-8 text-white/40 text-[10px] font-[900] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-white transition-colors italic cursor-pointer"
             >
               <ChevronLeft size={16} /> TORNAR AL MENÚ BIODATA
             </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 gap-4 animate-in fade-in duration-300">
            {/* Explicació per a no-programadors:
                En aquest apartat de Pràctica de Biodata, controlem quin sub-apartat del test hem de renderitzar:
                - 'opcions': Menú reduït amb el pas 1 i pas 2.
                - 'instruccions': Confirmació d'inici i regulacions de control de temps.
                - 'fent_test': El qüestionari en moviment (de la pregunta 1 a la 100).
                - 'resultats': Panell amb les visuals del gràfic competencial de les 10 competències de l'ISPC. */}

            {estatPractica === 'opcions' && (
              <div className="flex flex-col gap-4">
                {/* BLOC 1: COMENÇAR EL TEST */}
                <div className="bg-[#1a3a5a]/20 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 text-center backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <PencilLine size={16} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-emerald-400 font-black uppercase tracking-[0.2em] italic">
                      PAS 1: AVALUACIÓ INICIAL
                    </span>
                    <p className="text-white/60 text-[10px] md:text-[12px] font-medium leading-relaxed max-w-[340px] italic">
                      fes el test per saber el teu estat psicoprofesional, veure els resultats i despres un psicoleg pugui fer-te una clase personalitzada com en cap altra academia trobaras.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      // Iniciem l'estat del nou qüestionari
                      setPreguntaActual(0);
                      setRespostesUsuari(Array(preguntesActives.length).fill(null));
                      setTempsRestant(25 * 60); // 25 minuts
                      setEstatPractica('instruccions');
                    }}
                    className="w-full mt-1 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/20 text-emerald-400 rounded-lg py-2.5 text-center text-[10px] md:text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    COMENÇAR EL TEST DE BIODATA
                  </button>
                </div>

                {/* Línia de divisió de pas, estètica i minimalista */}
                <div className="h-[1px] bg-white/5 w-1/3 mx-auto" />

                {/* BLOC 2: VEURE ELS RESULTATS DE L'ÚLTIM TEST */}
                <div className="bg-[#1a3a5a]/20 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 text-center backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <FileText size={16} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-blue-400 font-black uppercase tracking-[0.2em] italic">
                      PAS 2: SEGUIMENT DE PROGRESSIÓ
                    </span>
                    <p className="text-white/60 text-[10px] md:text-[12px] font-medium leading-relaxed max-w-[340px] italic">
                      Mostar els resultats del meu ultim test.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (resultatsTest) {
                        setEsResultatDeProva(false);
                        setEstatPractica('resultats');
                      } else {
                        // Si no n'hi ha cap de realitzat per l'estudiant encara, carreguem el d'exemple
                        visualitzarResultatDeProvaDirecte();
                      }
                    }}
                    className="w-full mt-1 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 border border-blue-500/20 text-blue-400 rounded-lg py-2.5 text-center text-[10px] md:text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    VEURE ELS RESULTATS DEL TEST
                  </button>
                </div>

                <button 
                  onClick={() => setSubSeccioTest('menu')} 
                  className="mt-4 text-white/40 text-[10px] font-[900] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-white transition-colors italic cursor-pointer self-center"
                >
                  <ChevronLeft size={14} /> TORNAR AL MENÚ BIODATA
                </button>
              </div>
            )}

            {estatPractica === 'instruccions' && (
              <div className="flex flex-col gap-5 p-5 bg-[#1a3a5a]/10 border border-white/5 rounded-2xl text-center backdrop-blur-sm max-w-[420px] mx-auto animate-in zoom-in-95 duration-200">
                <span className="text-[9px] text-amber-400 font-black uppercase tracking-[0.25em] italic">
                  Normativa del Simulacre
                </span>
                
                {preguntesActives.length === 0 ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold leading-relaxed text-left flex items-start gap-2.5">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-black uppercase tracking-wider text-[10px]">No s'han trobat preguntes</h5>
                      <p className="mt-1 text-slate-300 text-[10px]">
                        Hores d'ara no hi ha preguntes de Biodata actives a la base de dades. Si us plau, demana a un administrador d'OposiCAT que generi o creï preguntes a la secció de gestió.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/80 text-[11px] md:text-sm font-medium leading-relaxed italic text-left">
                    El test es composa de <strong className="text-emerald-400">{preguntesActives.length} preguntes reals de tipus Biodata</strong> especialment dissenyades. Cada pregunta té 3 opcions de resposta psicoprofessional. Només pots seleccionar 1 de les 3 opcions en relació al que penses o sents davant de cada situació policial. Disposes d'un temps límit de <strong className="text-emerald-400">25 minuts</strong> per completar el simulacre.
                  </p>
                )}

                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    disabled={preguntesActives.length === 0}
                    onClick={() => {
                      setPreguntaActual(0);
                      setRespostesUsuari(Array(preguntesActives.length).fill(null));
                      setTempsRestant(25 * 60);
                      setEstatPractica('fent_test');
                    }}
                    className={`w-full rounded-xl py-3 text-center text-[11px] md:text-sm font-black uppercase tracking-widest transition-all ${
                      preguntesActives.length === 0
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                        : "bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 cursor-pointer"
                    }`}
                  >
                    COMENÇAR JA
                  </button>
                  <button 
                    onClick={() => setEstatPractica('opcions')}
                    className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest mt-1 cursor-pointer"
                  >
                    Tornar enrere
                  </button>
                </div>
              </div>
            )}

            {estatPractica === 'fent_test' && (
              <div className="flex flex-col gap-4 w-full max-w-[500px] mx-auto animate-in fade-in duration-200">
                {/* Capçalera del qüestionari: pregunta actual, timer i progrés temporal */}
                <div className="flex items-center justify-between bg-black/30 border border-white/5 p-3 rounded-xl">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">
                      Pregunta {preguntaActual + 1} de {preguntesActives.length}
                    </span>
                    <span className="text-[7.5px] text-white/50 font-black uppercase tracking-widest mt-0.5 max-w-[200px] truncate">
                      Àrea: {MAP_COMPETENCIES.find(c => c.id === preguntesActives[preguntaActual]?.competencia)?.nom || "General"}
                    </span>
                  </div>
                  
                  {/* Cronòmetre o temporitzador en format mono de 25 minuts */}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1a3a5a]/40 border border-[#00f296]/20 rounded-lg text-[#00f296]">
                    <span className="font-mono text-[13px] md:text-sm font-black tracking-widest">
                      {Math.floor(tempsRestant / 60).toString().padStart(2, '0')}:{(tempsRestant % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Barra de progrés visual fins a la línia de final */}
                <div className="w-full bg-white/5 rounded-full h-[3px]">
                  <div 
                    className="bg-emerald-400 h-[3px] rounded-full transition-all duration-300" 
                    style={{ width: `${((preguntaActual + 1) / preguntesActives.length) * 100}%` }}
                  />
                </div>

                {/* Targeta interior de la pregunta de competència */}
                <div className="bg-[#1a3a5a]/20 border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-5 text-center min-h-[160px] justify-center backdrop-blur-md">
                  <span className="text-[8px] text-white/35 font-bold uppercase tracking-widest">
                    Codi Pregunta: {(preguntaActual + 1).toString().padStart(3, '0')} | Codi Competència: [{preguntesActives[preguntaActual]?.competencia}]
                  </span>
                  
                  <h4 className="text-white font-extrabold italic text-xs md:text-sm leading-relaxed px-2">
                    "{preguntesActives[preguntaActual]?.enunciat}"
                  </h4>
                  
                  <p className="text-white/40 text-[9px] md:text-[10px] leading-relaxed max-w-[340px] italic">
                    Selecciona una única opció en relació al que penses o sents davant d'aquest tipus de situacions.
                  </p>
                </div>

                {/* Opcions de respostes interactives dinàmiques */}
                <div className="flex flex-col gap-2 mt-1">
                  {preguntesActives[preguntaActual]?.opcions?.map((op, i) => {
                    // El valor desat a l'array és l'índex triat de la pregunta (0, 1 o 2) per evitar conflictes de visualització
                    const seleccionada = respostesUsuari[preguntaActual] === i;
                    // Explicació per a no-programadors:
                    // Creem el prefix en majúscules 'A- ', 'B- ' o 'C- ' per cada resposta.
                    const prefix = i === 0 ? "A- " : i === 1 ? "B- " : "C- ";
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          const novesRespostes = [...respostesUsuari];
                          novesRespostes[preguntaActual] = i;
                          setRespostesUsuari(novesRespostes);

                          // UX auto-progressiu: canvi automàtic a la següent pregunta per fer el test més fluid i ràpid
                          if (preguntaActual < preguntesActives.length - 1) {
                            setTimeout(() => {
                              setPreguntaActual(prev => Math.min(prev + 1, preguntesActives.length - 1));
                            }, 220);
                          }
                        }}
                        className={`w-full py-3.5 px-5 rounded-xl border text-left flex items-center justify-between transition-all duration-150 active:scale-[0.99] cursor-pointer ${
                          seleccionada 
                            ? "bg-[#1a3a5a]/50 border-emerald-400 text-emerald-400 font-extrabold" 
                            : "bg-[#1a3a5a]/10 border-white/5 text-white/70 hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className="text-[11px] md:text-xs tracking-wider normal-case font-extrabold italic leading-relaxed pr-2">
                          {prefix}{op.text.toLowerCase()}
                        </span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          seleccionada ? "border-emerald-400 bg-emerald-400/20" : "border-white/20"
                        }`}>
                          {seleccionada && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Controls del peu del formulari del qüestionari */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    disabled={preguntaActual === 0}
                    onClick={() => setPreguntaActual(prev => Math.max(0, prev - 1))}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1 transition-colors ${
                      preguntaActual === 0 
                        ? "border-white/5 text-white/10 cursor-not-allowed" 
                        : "border-white/10 text-white/50 hover:text-white cursor-pointer"
                    }`}
                  >
                    Anterior
                  </button>

                  <button
                    onClick={() => {
                      setMostraConfirmacioLliurament(true);
                    }}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                  >
                    Lliurar Test
                  </button>

                  <button
                    disabled={preguntaActual === preguntesActives.length - 1}
                    onClick={() => setPreguntaActual(prev => Math.min(prev + 1, preguntesActives.length - 1))}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1 transition-colors ${
                      preguntaActual === preguntesActives.length - 1 
                        ? "border-white/5 text-white/10 cursor-not-allowed" 
                        : "border-white/10 text-white/50 hover:text-white cursor-pointer"
                    }`}
                  >
                    Següent
                  </button>
                </div>

                {/* Graella estètica resumida de navegació per fer seguiment visual ràpid */}
                <div className="mt-4 p-3 bg-black/20 border border-white/5 rounded-xl">
                  <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest block text-center mb-2">SEGUIMENT DE PREGUNTES ({preguntesActives.length})</span>
                  <div className="grid grid-cols-10 gap-1 justify-items-center">
                    {respostesUsuari.map((resp, idx) => {
                      const ésLaPreguntaActual = idx === preguntaActual;
                      const contestada = resp !== null;
                      return (
                        <button
                          key={idx}
                          onClick={() => setPreguntaActual(idx)}
                          className={`w-4 h-4 rounded text-[7px] font-black flex items-center justify-center transition-all cursor-pointer ${
                            ésLaPreguntaActual 
                              ? "bg-emerald-400 text-slate-950 font-black ring-2 ring-emerald-400/30" 
                              : contestada 
                                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400" 
                                : "bg-white/5 border border-white/5 text-white/30 hover:border-white/10"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modal de Confirmació de Lliurament de Test amb estil OposiCAT */}
                {mostraConfirmacioLliurament && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
                    <div className="w-full max-w-md bg-[#0b1b2d] border border-red-500/20 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
                      {/* Línia decorativa de perill superior d'OposiCAT */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/30 via-red-500 to-red-500/30" />
                      
                      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-6 h-6 text-red-400" />
                      </div>

                      <h3 className="text-white font-black italic uppercase tracking-wider text-sm mb-2">
                        Vols lliurar el test de biodata?
                      </h3>
                      
                      <p className="text-white/60 text-xs leading-relaxed mb-6">
                        Estàs a punt de lliurar el simulacre oficial de 80 preguntes. Es calcularà el perfil unificat de les teves 10 competències clau.
                      </p>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setMostraConfirmacioLliurament(false);
                            finalitzarTest(respostesUsuari);
                          }}
                          className="w-full py-3 bg-red-500 hover:bg-red-600 text-slate-950 text-xs font-black uppercase tracking-widest italic rounded-xl transition-all cursor-pointer"
                        >
                          SÍ, LLIURAR EL TEST
                        </button>
                        
                        <button
                          onClick={() => setMostraConfirmacioLliurament(false)}
                          className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/75 text-xs font-black uppercase tracking-widest italic rounded-xl transition-all border border-white/5 cursor-pointer"
                        >
                          CONTINUAR CONTESTANT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {estatPractica === 'resultats' && resultatsTest && (() => {
              // Explicació per a no-programadors:
              // Calculem les mètriques d'idoneïtat de l'usuari sobre el perfil de Mossos d'Esquadra d'acord amb el punt 4 del manual:
              // 1. SI QUALSEVOL COMPETÈNCIA OBTÉ UNA NOTA MENOR A 5.0 -> NO APTE (LÍNIA VERMELLA).
              // 2. SI S'OBTÉ UN 10 PERFECTE EN MÉS DE 6 COMPETÈNCIES ALHORA -> TEST INCOHERENT (DETECTOR DE MENTIDES).
              const competenciesSotaPerfil = MAP_COMPETENCIES.filter((comp, idx) => resultatsTest[idx] < 5.0);
              const perfectesDe10 = MAP_COMPETENCIES.filter((comp, idx) => resultatsTest[idx] === 10.0);

              let veredicteTipus: 'APTE' | 'NO_APTE' | 'INCOHERENT' = 'APTE';
              let veredicteTitol = "APTE AMB BON PERFIL";
              let veredicteDescripcio = "El teu patró competencial és del tot òptim i realista, complint amb el caràcter policial de Mossos. Mantens un perfil equilibrat. Et recomanem polir la defensa dels resultats de cara a l'entrevista real amb les nostres simulacions de l'acadèmia.";
              let veredicteEstil = "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

              if (competenciesSotaPerfil.length > 0) {
                veredicteTipus = 'NO_APTE';
                veredicteTitol = "NO APTE AUTOMÀTIC (LÍNIES VERMELLES)";
                veredicteDescripcio = `Has obtingut una puntuació inferior a 5.0 en competències clau crítiques: ${competenciesSotaPerfil.map(c => c.nom).join(', ')}. Això genera un perfil no apte excloent de forma directa segons criteris d'avaluació.`;
                veredicteEstil = "border-red-500/20 bg-red-500/10 text-red-400";
              } else if (perfectesDe10.length > 6) {
                veredicteTipus = 'INCOHERENT';
                veredicteTitol = "TEST INCOHERENT (DETECTOR DE MENTIDES)";
                veredicteDescripcio = "S'han identificat més de 6 competències amb una puntuació perfecta de 10.0 alhora. S'ha detectat desitjabilitat social extrema o manca de sinceritat de l'aspirant. Un perfil real té matisos; no vulguis simular la perfecció.";
                veredicteEstil = "border-amber-500/20 bg-amber-500/10 text-amber-400";
              }

              return (
                <div className="flex flex-col gap-4 w-full max-w-[520px] mx-auto animate-in zoom-in-95 duration-300">
                  {/* Capçalera de resultats */}
                  <div className="text-center flex flex-col items-center gap-1.5">
                    <span className="text-[9px] text-[#00f296] font-black uppercase tracking-[0.25em] italic">
                      ★ DIAGNÒSTIC FINAL
                    </span>
                    <h3 className="text-white font-[900] italic uppercase text-sm tracking-widest">
                      RESULTATS DEL TEST DE BIODATA
                    </h3>
                    <div className="h-[2px] bg-[#00f296]/20 w-12 rounded mt-1" />
                  </div>

                  {/* Quadre de Veredicte Global del Perfil */}
                  <div className={`border rounded-2xl p-4.5 flex flex-col gap-2 backdrop-blur-md text-left ${veredicteEstil}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider">
                        VEREDICTE DE L'INFORME
                      </span>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-80 border border-current px-2 py-0.5 rounded">
                        {veredicteTipus}
                      </span>
                    </div>
                    <h4 className="font-black italic uppercase text-xs md:text-sm tracking-wider">
                      {veredicteTitol}
                    </h4>
                    <p className="text-white/70 text-[10px] md:text-[11px] leading-relaxed italic">
                      {veredicteDescripcio}
                    </p>
                  </div>

                  {/* Avís de resultats de prova si és simulat per defecte */}
                  {esResultatDeProva && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400/90 rounded-xl p-3 text-center my-1 animate-pulse">
                      <span className="text-[10px] font-black uppercase tracking-wider block mb-0.5">
                        ⚠️ RESULTAT DE PROVA FICTICI / EXEMPLE
                      </span>
                      <p className="text-[9px] italic leading-relaxed text-white/60">
                        Estàs visualitzant un resum d'avaluació d'exemple orientatiu. Completa el teu test per visualitzar les teves mètriques competencials personalitzades.
                      </p>
                    </div>
                  )}

                  {/* Explicació per a no-programadors:
                      Dibuixem la llista de competències amb una barreja ràpida i fluida de files horitzontals. */}
                  <div className="flex flex-col gap-2.5 mt-2 max-h-[350px] overflow-y-auto pr-1">
                    {MAP_COMPETENCIES.map((comp, idx) => {
                      const valor = resultatsTest[idx];
                      
                      // Definició de colors per a l'índex obtingut: (Verd per a 7-10, Groc per a 5-6.9, Vermell per a < 5)
                      let colorText = "text-emerald-400";
                      let colorBarra = "bg-emerald-400";
                      let etiquetaRang = "Apte / Excel·lent";

                      if (valor < 5) {
                        colorText = "text-red-400";
                        colorBarra = "bg-red-500";
                        etiquetaRang = "Sota perfil / Risc crític";
                      } else if (valor < 7) {
                        colorText = "text-amber-400";
                        colorBarra = "bg-amber-400";
                        etiquetaRang = "Correcte / Millorable";
                      }

                      return (
                        <div 
                          key={idx} 
                          className="bg-[#1a3a5a]/20 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col text-left max-w-[340px]">
                              <span className="text-[10.5px] font-extrabold text-white/85 tracking-wider italic">
                                {idx + 1}. {comp.nom} <span className="text-[8px] font-bold text-white/30">[{comp.id}]</span>
                              </span>
                              <span className="text-[7.5px] text-white/40 font-black uppercase tracking-widest mt-0.5">
                                {etiquetaRang}
                              </span>
                            </div>
                            
                            {/* Nota de 0 a 10 en tipografia mono de gran contrast */}
                            <div className="flex items-baseline gap-0.5">
                              <span className={`font-mono text-xs md:text-sm font-black ${colorText}`}>
                                {valor.toFixed(1)}
                              </span>
                              <span className="font-mono text-[9px] text-white/30 font-bold">/10</span>
                            </div>
                          </div>

                          {/* Barra de progrés representativa d'entre 0 i 10 */}
                          <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${colorBarra}`} 
                              style={{ width: `${valor * 10}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Accions finals de results */}
                  <div className="flex flex-col gap-2.5 mt-3">
                    <button 
                      onClick={() => {
                        setPreguntaActual(0);
                        setRespostesUsuari(Array(preguntesActives.length).fill(null));
                        setTempsRestant(25 * 60);
                        setEstatPractica('instruccions');
                      }}
                      className="w-full bg-[#1a3a5a]/40 hover:bg-[#1a3a5a]/60 active:scale-95 border border-white/10 rounded-xl py-3 text-center text-[10px] md:text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-white"
                    >
                      FER UN NOU TEST (REINICIAR)
                    </button>
                    <button 
                      onClick={() => {
                        // Tornem al menú general de test de biodata (foto de l'estudiant de primeres)
                        setSubSeccioTest('menu');
                        setEstatPractica('opcions');
                      }}
                      className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] transition-colors italic cursor-pointer self-center"
                    >
                      Tornar al menú Biodata
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  }

  return renderMenuPrincipal();
};
