import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, Shield, Search, ChevronDown, CheckCircle2, ChevronLeft, 
  BookOpen, HelpCircle, AlertCircle, Sparkles, Filter, FileText
} from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

/* =============================================================================
 * COMPONENT: QuestionariBiograficWeb
 * -----------------------------------------------------------------------------
 * Explicació per a no-programadors:
 * Aquest component mostra la guia i el banc oficial de preguntes del QÜESTIONARI BIOGRÀFIC
 * per a la Prova Psicològica i Biodata d'accés a la Policia de la Generalitat - Mossos d'Esquadra.
 * 
 * Estructura visual i funcional:
 * 1. Títol superior únic i net ("ENTÈN I PRACTICA EL QÜESTIONARI BIOGRÀFIC").
 * 2. Sistema interactiu i didàctic de Preguntes i Respostes (FAQ) sobre com és la prova.
 * 3. Selector de 4 Blocs Temàtics d'igual mida en graella ("Selecciona un bloc temàtic que explorar i practicar"):
 *    - Dades Personals (Informació i context)
 *    - Preguntes Personals (Autoconeixement i passat)
 *    - Preguntes Laborals (Experiència i trajectòria)
 *    - Preguntes de PGME (Valors i cultura mosso)
 * 4. Barra d'eines: Cercador ràpid + Botó Plegar/Desplegar totes.
 * 5. Llistat interactiu de preguntes amb resposta orientativa i consells d'OposiCAT.
 * 6. Carrega automàtica des de Firestore si hi ha preguntes noves afegides.
 * 7. Targeta d'acció per practicar Biodata / Entrevista i botons de retorn.
 * ============================================================================= */

export type BlocBiograficTipus = 'tots' | 'dades_personals' | 'personals' | 'laborals' | 'pgme';

export interface PreguntaBiograficaItem {
  id: string;
  bloc: 'dades_personals' | 'personals' | 'laborals' | 'pgme';
  pregunta: string;
  respostaModel?: string;
  consellOposicat?: string;
  competenciesAvaluades?: string[];
  docId?: string;
}

interface QuestionariBiograficWebProps {
  onTornar: () => void;
  onTornarMenuPrincipal: () => void;
  onAnarBiodata?: () => void;
  onAnarEntrevista?: () => void;
  blocInicial?: BlocBiograficTipus;
}

export const QuestionariBiograficWeb: React.FC<QuestionariBiograficWebProps> = ({
  onTornar,
  onTornarMenuPrincipal,
  onAnarBiodata,
  onAnarEntrevista,
  blocInicial = 'tots',
}) => {
  // Estat per filtrar per bloc seleccionat
  const [blocActiu, setBlocActiu] = useState<BlocBiograficTipus>(blocInicial);

  // Estat per controlar quines targetes de preguntes estan desplegades
  const [obertes, setObertes] = useState<string[]>([]);
  const [cerca, setCerca] = useState<string>('');

  // Preguntes predeterminades de l'acadèmia amb explicacions riques
  const preguntesPerDefecte: PreguntaBiograficaItem[] = [
    // =========================================================================
    // 1. BLOC: DADES PERSONALS (INFORMACIÓ I CONTEXT SENSE PUNTUACIÓ DIRECTA)
    // =========================================================================
    {
      id: 'bio-dp-1',
      bloc: 'dades_personals',
      pregunta: "Dades de filiació: Nom complet, edat, data de naixement i municipi actual de residència.",
      respostaModel: "Indiqueu de forma clara i directa el vostre nom complet, edat actual, data de naixement i el municipi on esteu empadronats i viviu habitualment.",
      consellOposicat: "Aquestes dades són purament informatives i administratives. No avaluen competències clau, però serveixen al tribunal per verificar el teu expedient administratiu i de residència.",
      competenciesAvaluades: ["Dades de context i filiació"]
    },
    {
      id: 'bio-dp-2',
      bloc: 'dades_personals',
      pregunta: "Situació de convivència: Amb qui vius actualment? Tens parella, fills o germans?",
      respostaModel: "Descriviu la vostra unitat familiar actual (per exemple: visc amb la meva parella / visc amb els meus pares i germà) amb total naturalitat i precisió.",
      consellOposicat: "Serveix per conèixer l'entorn de convivència i estabilitat de l'opositor. No té cap incidència negativa tenir fills, parella o viure de forma independent.",
      competenciesAvaluades: ["Dades de context i filiació"]
    },
    {
      id: 'bio-dp-3',
      bloc: 'dades_personals',
      pregunta: "Tens familiars directes o amics que treballin al cos de Mossos d'Esquadra o en altres cossos policials?",
      respostaModel: "Indiqueu si teniu o no familiars (per exemple: Sí, el meu oncle és caporal a Trànsit / No, no tinc cap familiar en cossos policials).",
      consellOposicat: "El tribunal ho pregunta per contextualitzar el teu coneixement directe del cos. Respondre que sí o que no no afegeix ni resta punts per aprovar.",
      competenciesAvaluades: ["Dades de context i filiació"]
    },
    {
      id: 'bio-dp-4',
      bloc: 'dades_personals',
      pregunta: "Nivell d'estudis reglats i idiomes: Quina és la teva màxima titulació acadèmica i quines llengües domines?",
      respostaModel: "Exposeu els vostres estudis oficials finalitzats (Batxillerat, CFGS, Grau Universitari) i els idiomes que parleu o teniu certificats (català, castellà, anglès, etc.).",
      consellOposicat: "Sigueu fidels a la vostra documentació oficial. El coneixement d'idiomes estrangers o titulacions superiors és una dada valuosa per al vostre historial.",
      competenciesAvaluades: ["Dades de context i filiació"]
    },
    {
      id: 'bio-dp-5',
      bloc: 'dades_personals',
      pregunta: "Permisos de conducció i mobilitat: Quins permisos de conduir tens i quina disponibilitat tens per desplaçar-te per Catalunya?",
      respostaModel: "Confirmeu la tinença del permís B (i altres si s'escau com A2 o C) i la disponibilitat plena per prestar servei a qualsevol Àrea Bàsica Policial del territori.",
      consellOposicat: "La mobilitat geogràfica és una característica inherent a la condició de mosso/a d'esquadra. Mostreu sempre total flexibilitat i predisposició.",
      competenciesAvaluades: ["Dades de context i filiació"]
    },
    {
      id: 'bio-dp-6',
      bloc: 'dades_personals',
      pregunta: "Has viscut, estudiat o treballat alguna temporada fora de Catalunya o a l'estranger?",
      respostaModel: "Detalleu breument estades per estudis (com beques Erasmus o idiomes), feines estacionals o voluntariats, o bé confirmeu la residència continuada a Catalunya.",
      consellOposicat: "Les experiències fora aporten context de maduresa i autonomia personal. Si no heu viscut fora, no té cap aspecte negatiu.",
      competenciesAvaluades: ["Dades de context i filiació"]
    },

    // =========================================================================
    // 2. BLOC: PREGUNTES PERSONALS (AUTOCONEIXEMENT I PASSAT)
    // =========================================================================
    {
      id: 'bio-per-1',
      bloc: 'personals',
      pregunta: "Digui'm els seus 3 majors defectes i 3 majors virtuts.",
      respostaModel: "És fonamental seleccionar virtuts directament aplicables a la feina policial (constància, ordre, capacitat d'escolta i empatia) i defectes reals però no invalidants (perfeccionisme que requereix aprendre a delegar, autoexigència alta o tendència a analitzar en excés abans d'actuar), explicant sempre com els teniu sota control.",
      consellOposicat: "Eviteu clixés artificials com «sóc massa treballador». El tribunal vol veure maduresa i autocrítica real. Mai mencioneu defectes incompatibles amb la funció pública com la impulsivitat o el desordre.",
      competenciesAvaluades: ["Autogestió i creixement personal", "Autocontrol i gestió de l'estrès", "Habilitats socials"]
    },
    {
      id: 'bio-per-2',
      bloc: 'personals',
      pregunta: "És el primer cop que es presenta? Si no ho és, per què es presenta un altre cop?",
      respostaModel: "Si és el primer cop, emfatitzeu la preparació metòdica i exhaustiva prèvia. Si repetiu convocatòria, enfoqueu-ho com una prova fefaent de perseverança, compromís inamovible i vocació contrastada, explicant de quina manera heu reforçat les àrees de millora.",
      consellOposicat: "Mai culpeu tercers ni el tribunal anterior si no vau aprovar. Assumiu el procés com una oportunitat d'evolució i demostreu constància i fermesa.",
      competenciesAvaluades: ["Compromís amb l'organització", "Autogestió i creixement personal", "Adaptabilitat i flexibilitat"]
    },
    {
      id: 'bio-per-3',
      bloc: 'personals',
      pregunta: "Per què creu que vostè ha d'aprovar aquesta oposició aquest any?",
      respostaModel: "Perquè disposo de la maduresa vital, l'estabilitat emocional i la preparació teòrica i física necessàries per assumir el deure policial. El meu projecte professional està plenament alineat amb els valors de servei, proximitat i respecte de la PG-ME.",
      consellOposicat: "No us compareu despectivament amb altres opositors. Centreu el discurs exclusivament en la vostra vàlua, dedicació i compromís amb el servei públic.",
      competenciesAvaluades: ["Orientació de servei a la ciutadania", "Habilitats socials i comunicatives", "Compromís amb l'organització"]
    },
    {
      id: 'bio-per-4',
      bloc: 'personals',
      pregunta: "Descrigui breument la situació que més por ha passat a la seva vida.",
      respostaModel: "Exposeu una situació d'emergència real (un accident de trànsit, un ensurt mèdic familiar o un imprevist greu) on vau sentir por o angoixa però vau mantenir el cap fred per actuar de forma ordenada, avisar els serveis d'emergència i protegir les persones.",
      consellOposicat: "La por és una emoció humana natural. Negar-la denota immaduresa o manca de sinceritat. El tribunal vol avaluar que la por no us paralitza i que sabeu mantenir el control sota pressió.",
      competenciesAvaluades: ["Autocontrol i gestió de l'estrès", "Resolució de problemes", "Iniciativa i autonomia"]
    },
    {
      id: 'bio-per-5',
      bloc: 'personals',
      pregunta: "Expliqueu algun error personal important realitzat en el passat i quina conducta vau rectificar.",
      respostaModel: "Cal assumir un error real del passat sense desviar culpes cap a tercers, detallant les conseqüències assumides amb responsabilitat i quins nous hàbits, mètodes o protocols personals vau establir per garantir que no es tornés a repetir.",
      consellOposicat: "L'error no ha de constituir cap delicte ni falta ètica greu. El valor d'aquesta pregunta rau en la capacitat d'aprenentatge i la humilitat per rectificar.",
      competenciesAvaluades: ["Autogestió i creixement personal", "Eficiència i orientació a la qualitat", "Adaptabilitat"]
    },
    {
      id: 'bio-per-6',
      bloc: 'personals',
      pregunta: "Parli'm de vostè. Quin tipus de persona és i com el defineix el seu entorn familiar i d'amics?",
      respostaModel: "Definiu-vos com una persona tranquil·la, resolutiva, compromesa amb la feina i de tracte proper. Destaqueu hàbits d'estil de vida saludable, constància en els objectius i capacitat per escoltar i ajudar l'entorn quan cal.",
      consellOposicat: "Estructureu la resposta en tres eixos: formació/feina, estil de vida/valors i relacions humanes. Eviteu mostrar un perfil individualista o conflictiu.",
      competenciesAvaluades: ["Habilitats socials i comunicatives", "Adaptabilitat i flexibilitat", "Treball en equip"]
    },

    // =========================================================================
    // 3. BLOC: PREGUNTES LABORALS (EXPERIÈNCIA I TRAJECTÒRIA)
    // =========================================================================
    {
      id: 'bio-lab-1',
      bloc: 'laborals',
      pregunta: "Quants anys ha treballat vostè i en quins sectors o empreses?",
      respostaModel: "Resum cronològic clar i concís de la vostra vida laboral, destacant les competències adquirides en cadascuna de les feines: atenció al públic, treball sota pressió horària, coordinació en equip, ordre i compliment estricte de procediments.",
      consellOposicat: "Les dates i feines han de coincidir exactament amb el document escrit que vau lliurar i amb la vostra Vida Laboral oficial. No deixeu llacunes temporals sense justificació raonable.",
      competenciesAvaluades: ["Treball en equip i col·laboració", "Eficiència i orientació a la qualitat", "Adaptabilitat"]
    },
    {
      id: 'bio-lab-2',
      bloc: 'laborals',
      pregunta: "Quin és el càrrec o responsabilitat més important que vostè ha desenvolupat?",
      respostaModel: "Descriviu el lloc de treball on heu assumit major autonomia, gestió d'incidències, coordinació de companys o custodia de bens/valors, explicant com vau respondre a la confiança de l'empresa.",
      consellOposicat: "No cal haver estat director per tenir responsabilitat: haver estat encarregat de tancament, de caixa, de seguretat o de la formació de noves incorporacions és plenament vàlid.",
      competenciesAvaluades: ["Iniciativa i autonomia", "Resolució de problemes", "Compromís amb l'organització"]
    },
    {
      id: 'bio-lab-3',
      bloc: 'laborals',
      pregunta: "Si tornés a néixer, estudiaria i treballaria en el mateix?",
      respostaModel: "Exposeu satisfacció amb el camí vital i professional recorregut, indicant que cada feina i estudi us ha aportat eines de maduresa i resolució que ara poseu al servei de la vostra veritable vocació policial.",
      consellOposicat: "Eviteu transmetre sensació de penediment o ressentiment cap a ocupacions passades. Demostreu que sabeu treure profit positiu de cada experiència.",
      competenciesAvaluades: ["Autogestió i creixement personal", "Adaptabilitat i flexibilitat", "Compromís organitzatiu"]
    },
    {
      id: 'bio-lab-4',
      bloc: 'laborals',
      pregunta: "Ha tingut mai cap discrepància o conflicte amb un company o un superior? Com ho va resoldre?",
      respostaModel: "Exposeu una discrepància professional de criteri tècnic resolta mitjançant el diàleg tranquil, l'assertivitat i, un cop presa la decisió final pel responsable, l'acatament i col·laboració lleial amb l'equip.",
      consellOposicat: "En cap cas mencioneu discussions agressives ni faltes de respecte. Mostreu habilitat per separar el debat constructiu de la disciplina professional.",
      competenciesAvaluades: ["Treball en equip i col·laboració", "Habilitats socials i comunicatives", "Compromís amb l'organització"]
    },
    {
      id: 'bio-lab-5',
      bloc: 'laborals',
      pregunta: "Heu pres mai una decisió d'alta transcendència a la vostra feina sense aval directe de caps?",
      respostaModel: "Exposeu una situació d'urgència sobrevinguda on calia actuar de forma immediata per evitar un perjudici greu o protegir persones, seguint sempre el marc dels protocols generals i informant tan aviat com va ser possible.",
      consellOposicat: "A la Policia la línia jeràrquica és sagrada. Remarqueu que en situacions ordinàries se segueixen estrictament les instruccions, i només en emergències extremes s'actua d'ofici.",
      competenciesAvaluades: ["Iniciativa i autonomia", "Resolució de problemes", "Compromís amb l'organització"]
    },

    // =========================================================================
    // 4. BLOC: PREGUNTES DE PGME (VALORS I CULTURA MOSSO)
    // =========================================================================
    {
      id: 'bio-pg-1',
      bloc: 'pgme',
      pregunta: "Per què vostè vol ser policia / Mosso d'Esquadra?",
      respostaModel: "Voldria ser Mosso d'Esquadra perquè considero que sóc una persona que vol ajudar la societat catalana de forma altruista, propera i professional. Desenvoluparé la feina amb gran responsabilitat i respecte als drets i llibertats, amb els peus a terra i sense creure'm un superheroi.",
      consellOposicat: "Aquesta és una de les respostes fonamentals de tota la fase d'oposició. Fonamenteu-la en la vocació de servei públic, l'ajuda ciutadana i el compliment del deure.",
      competenciesAvaluades: ["Orientació de servei a la ciutadania", "Compromís amb l'organització", "Habilitats socials"]
    },
    {
      id: 'bio-pg-2',
      bloc: 'pgme',
      pregunta: "Per què ha decidit ser Mosso d'Esquadra i no Policia Local, Guàrdia Civil o Policia Nacional?",
      respostaModel: "Perquè m'identifico plenament amb la Policia de la Generalitat com a policia integral de Catalunya, que cobreix des de la seguretat ciutadana fins a la investigació criminal i el trànsit, arrelada a la societat i cultura catalana.",
      consellOposicat: "Mai desqualifiqueu cap altre cos policial. Mostreu respecte unànime per tots ells, explicant amb estima i coherència el motiu de la vostra elecció per PG-ME.",
      competenciesAvaluades: ["Compromís amb l'organització", "Habilitats socials i comunicatives"]
    },
    {
      id: 'bio-pg-3',
      bloc: 'pgme',
      pregunta: "Què espera de la feina de Mosso d'Esquadra durant el seu primer any de servei a comissaria?",
      respostaModel: "Espero integrar-me ràpidament al servei de Seguretat Ciutadana (USC), aprendre amb humilitat dels companys veterans i comandaments, aplicar el rigor tècnic après a l'ISPC i oferir una atenció exemplar a cada ciutadà.",
      consellOposicat: "No mostreu ànsies per anar a unitats d'elit (GEI, BRIMO, helicòpters) el primer dia. La base essencial d'un bon agent és la patrulla de seguretat ciutadana.",
      competenciesAvaluades: ["Eficiència i orientació a la qualitat", "Treball en equip i col·laboració", "Adaptabilitat"]
    },
    {
      id: 'bio-pg-4',
      bloc: 'pgme',
      pregunta: "Què creu vostè que la ciutadania espera d'un agent de Mossos d'Esquadra?",
      respostaModel: "La societat espera una policia de proximitat, justa, imparcial, ràpida en l'auxili, amb empatia absoluta cap a les víctimes i amb una autoritat exercida amb fermesa, serenitat i proporcionalitat.",
      consellOposicat: "Recordeu que el Codi Ètic de la PGME estableix que la confiança ciutadana és el pilar indispensable de l'eficàcia policial.",
      competenciesAvaluades: ["Orientació de servei a la ciutadania", "Habilitats socials i comunicatives", "Compromís organitzatiu"]
    },
    {
      id: 'bio-pg-5',
      bloc: 'pgme',
      pregunta: "Quina especialitat és la que més li agradaria treballar dins del cos a llarg termini?",
      respostaModel: "Em crida especialment l'atenció l'àrea d'Investigació / Trànsit / Seguretat Ciutadana per la meva capacitat d'anàlisi i rigor, però la meva prioritat immediata és servir allà on el cos ho consideri més necessari per a la societat.",
      consellOposicat: "Demostreu interès per la progressió professional, però deixeu molt clar que esteu 100% compromesos amb la destinació que us assigni el cos.",
      competenciesAvaluades: ["Adaptabilitat i flexibilitat", "Compromís amb l'organització", "Iniciativa i autonomia"]
    },
    {
      id: 'bio-pg-6',
      bloc: 'pgme',
      pregunta: "Què faria si patrullant en un binomi el seu company comet una irregularitat greu o un intent de suborn?",
      respostaModel: "Aturaria immediatament l'acció antireglamentària del company i donaria compte oficial i immediat del fet als comandaments superiors. El deure legal i el Codi Deontològic de la PG-ME prevalen sempre per damunt de qualsevol malentès de companyonia.",
      consellOposicat: "Davant d'una falta ètica o delicte flagrant, la lleialtat és cap a la institució, la ciutadania i la legalitat. Mai dubteu en aquesta resposta.",
      competenciesAvaluades: ["Compromís amb l'organització", "Autogestió i creixement personal", "Autocontrol"]
    }
  ];

  const [preguntes, setPreguntes] = useState<PreguntaBiograficaItem[]>(preguntesPerDefecte);

  // Carregar preguntes addicionals de Firestore si l'administrador n'ha afegit de noves
  useEffect(() => {
    const carregarPreguntesBBDD = async () => {
      try {
        const [snapDp, snapPer, snapLab, snapPg] = await Promise.all([
          getDocs(query(collection(db, "preguntes_biodata_dades_personals"))),
          getDocs(query(collection(db, "preguntes_biodata_personals"))),
          getDocs(query(collection(db, "preguntes_biodata_laborals"))),
          getDocs(query(collection(db, "preguntes_biodata_pgme")))
        ]);

        const extrets: PreguntaBiograficaItem[] = [];

        snapDp.forEach(docSnap => {
          const d = docSnap.data();
          if (d.pregunta) {
            extrets.push({
              id: `db-dp-${docSnap.id}`,
              bloc: 'dades_personals',
              pregunta: d.pregunta,
              respostaModel: d.resposta || d.respostaModel,
              consellOposicat: d.consell || d.consellOposicat,
              competenciesAvaluades: d.competencies || ["Dades de context i filiació"],
              docId: docSnap.id
            });
          }
        });

        snapPer.forEach(docSnap => {
          const d = docSnap.data();
          if (d.pregunta) {
            extrets.push({
              id: `db-per-${docSnap.id}`,
              bloc: 'personals',
              pregunta: d.pregunta,
              respostaModel: d.resposta || d.respostaModel,
              consellOposicat: d.consell || d.consellOposicat,
              competenciesAvaluades: d.competencies || ["Autogestió i creixement personal", "Autocontrol i gestió de l'estrès"],
              docId: docSnap.id
            });
          }
        });

        snapLab.forEach(docSnap => {
          const d = docSnap.data();
          if (d.pregunta) {
            extrets.push({
              id: `db-lab-${docSnap.id}`,
              bloc: 'laborals',
              pregunta: d.pregunta,
              respostaModel: d.resposta || d.respostaModel,
              consellOposicat: d.consell || d.consellOposicat,
              competenciesAvaluades: d.competencies || ["Treball en equip i col·laboració", "Eficiència i qualitat"],
              docId: docSnap.id
            });
          }
        });

        snapPg.forEach(docSnap => {
          const d = docSnap.data();
          if (d.pregunta) {
            extrets.push({
              id: `db-pg-${docSnap.id}`,
              bloc: 'pgme',
              pregunta: d.pregunta,
              respostaModel: d.resposta || d.respostaModel,
              consellOposicat: d.consell || d.consellOposicat,
              competenciesAvaluades: d.competencies || ["Orientació de servei a la ciutadania", "Compromís amb l'organització"],
              docId: docSnap.id
            });
          }
        });

        if (extrets.length > 0) {
          // Fusionem preguntes per defecte amb les de la BBDD sense duplicar preguntes amb text idèntic
          const mapPerText = new Map<string, PreguntaBiograficaItem>();
          preguntesPerDefecte.forEach(p => mapPerText.set(p.pregunta.trim().toLowerCase(), p));
          extrets.forEach(p => mapPerText.set(p.pregunta.trim().toLowerCase(), p));
          setPreguntes(Array.from(mapPerText.values()));
        }
      } catch (err) {
        console.warn("Connexió amb Firestore opcional per a preguntes de biogràfic:", err);
      }
    };

    carregarPreguntesBBDD();
  }, []);

  // Comptadors per bloc
  const countDadesPersonals = preguntes.filter(p => p.bloc === 'dades_personals').length;
  const countPersonals = preguntes.filter(p => p.bloc === 'personals').length;
  const countLaborals = preguntes.filter(p => p.bloc === 'laborals').length;
  const countPgme = preguntes.filter(p => p.bloc === 'pgme').length;

  // Alternar desplegament d'una targeta
  const toggleTargeta = (id: string) => {
    if (obertes.includes(id)) {
      setObertes(obertes.filter(item => item !== id));
    } else {
      setObertes([...obertes, id]);
    }
  };

  // Desplegar o plegar totes les targetes filtrades
  const desplegarTotes = () => {
    const idsFiltrats = preguntesFiltrades.map(p => p.id);
    if (obertes.length === idsFiltrats.length) {
      setObertes([]);
    } else {
      setObertes(idsFiltrats);
    }
  };

  // Filtrar per bloc i per cerca
  const preguntesFiltrades = preguntes.filter(p => {
    // Filtre per bloc
    if (blocActiu !== 'tots' && p.bloc !== blocActiu) {
      return false;
    }
    // Filtre per text de cerca
    if (cerca.trim()) {
      const queryText = cerca.toLowerCase();
      const matchPregunta = p.pregunta.toLowerCase().includes(queryText);
      const matchResposta = p.respostaModel?.toLowerCase().includes(queryText) || false;
      const matchConsell = p.consellOposicat?.toLowerCase().includes(queryText) || false;
      const matchComp = p.competenciesAvaluades?.some(c => c.toLowerCase().includes(queryText)) || false;
      return matchPregunta || matchResposta || matchConsell || matchComp;
    }
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 text-left font-sans pb-10">
      
      {/* ========================================================================= */}
      {/* 1. TÍTOL ÚNIC I NET */}
      {/* ========================================================================= */}
      <div className="pt-2 pb-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          ENTÈN I PRACTICA EL QÜESTIONARI BIOGRÀFIC
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* 2. SISTEMA DE PREGUNTES I RESPOSTES (FAQ DIDÀCTIC) */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800/70 pb-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-black text-sm sm:text-base uppercase tracking-wider">
              GUIA RÀPIDA DEL QÜESTIONARI BIOGRÀFIC
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Tot el que necessites saber per la 1 prova de l'examen psicoprofessional en 6 ràpides targetes.
            </p>
          </div>
        </div>

        {/* Llistat de Preguntes i Respostes directes (tots els títols en blau fort unificat) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* FAQ 1: Com és la prova */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              COM ÉS LA PROVA?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              Prova escrita a desenvolupar de 4 blocs principals.
            </p>
          </div>

          {/* FAQ 2: Quant dura */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              QUANT DURA?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              Dura 25 minuts.
            </p>
          </div>

          {/* FAQ 3: Què trobaré a l'examen */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              QUÈ TROBARÉ A L'EXAMEN?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              L'examen conté 4 planes. Cada plana conté preguntes relacionades amb cada bloc.
            </p>
          </div>

          {/* FAQ 4: S'avaluen les competències clau */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              EN AQUEST PUNT JA S'AVALUEN LES COMPETÈNCIES CLAU?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              En algunes de les preguntes sí, en altres només és informació per donar context a l'entrevista.
            </p>
          </div>

          {/* FAQ 5: Quins blocs hi ha */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              QUINS BLOCS HI HA?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              Dades Personals, Àmbit Personal, Trajectòria Laboral i Cultura PG-ME.
            </p>
          </div>

          {/* FAQ 6: On es fa la prova */}
          <div className="bg-[#020b18] border border-slate-800/80 rounded-xl p-4 space-y-1.5 flex flex-col justify-between">
            <span className="text-[11px] text-blue-400 font-black uppercase tracking-wider block font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shadow-[0_0_6px_rgba(96,165,250,0.7)]" />
              ON ES FA LA PROVA?
            </span>
            <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed font-semibold">
              Normalment i els últims anys s'ha fet a la UAB (Universitat Autònoma de Barcelona) els dies que sortiran publicats al web de la Generalitat.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ELS 4 BLOCS TEMÀTICS D'IGUAL MIDA EN GRAELLA (4 AL COSTAT DE L'ALTRE) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <span className="text-xs sm:text-sm font-black uppercase text-slate-300 tracking-wider">
            SELECCIONA UN BLOC TEMÀTIC QUE EXPLORAR I PRACTICAR :
          </span>
          <button
            onClick={() => setBlocActiu('tots')}
            className={`text-xs font-bold font-mono uppercase px-3.5 py-1.5 rounded-lg transition-all self-start sm:self-auto cursor-pointer ${
              blocActiu === 'tots'
                ? 'bg-[#FFDF00] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800'
            }`}
          >
            Veure tots ({preguntes.length})
          </button>
        </div>

        {/* Graella de 4 blocs del mateix tamany, un al costat de l'altre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* BLOC 1: DADES PERSONALS */}
          <button
            onClick={() => setBlocActiu(blocActiu === 'dades_personals' ? 'tots' : 'dades_personals')}
            id="btn-bloc-dades-personals"
            className={`w-full text-center rounded-2xl p-5 sm:p-6 transition-all duration-200 border cursor-pointer active:scale-98 flex flex-col items-center justify-center gap-2 group min-h-[120px] ${
              blocActiu === 'dades_personals'
                ? 'bg-purple-950/80 border-purple-400 shadow-xl shadow-purple-950/30 ring-1 ring-purple-400/50'
                : 'bg-[#0f1f38]/90 hover:bg-[#132847] border-white/10 hover:border-purple-500/40 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
              <span className="text-white font-black italic uppercase tracking-wider text-sm sm:text-base group-hover:text-purple-300 transition-colors">
                DADES PERSONALS
              </span>
            </div>
            <span className="text-purple-300/70 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em]">
              INFORMACIÓ I CONTEXT · {countDadesPersonals} PREGUNTES
            </span>
          </button>

          {/* BLOC 2: PREGUNTES PERSONALS */}
          <button
            onClick={() => setBlocActiu(blocActiu === 'personals' ? 'tots' : 'personals')}
            id="btn-bloc-preguntes-personals"
            className={`w-full text-center rounded-2xl p-5 sm:p-6 transition-all duration-200 border cursor-pointer active:scale-98 flex flex-col items-center justify-center gap-2 group min-h-[120px] ${
              blocActiu === 'personals'
                ? 'bg-blue-950/80 border-cyan-400 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-400/50'
                : 'bg-[#0f1f38]/90 hover:bg-[#132847] border-white/10 hover:border-cyan-500/40 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-white font-black italic uppercase tracking-wider text-sm sm:text-base group-hover:text-cyan-300 transition-colors">
                PREGUNTES PERSONALS
              </span>
            </div>
            <span className="text-cyan-300/70 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em]">
              AUTOCONEIXEMENT I PASSAT · {countPersonals} PREGUNTES
            </span>
          </button>

          {/* BLOC 3: PREGUNTES LABORALS */}
          <button
            onClick={() => setBlocActiu(blocActiu === 'laborals' ? 'tots' : 'laborals')}
            id="btn-bloc-preguntes-laborals"
            className={`w-full text-center rounded-2xl p-5 sm:p-6 transition-all duration-200 border cursor-pointer active:scale-98 flex flex-col items-center justify-center gap-2 group min-h-[120px] ${
              blocActiu === 'laborals'
                ? 'bg-amber-950/80 border-amber-400 shadow-xl shadow-amber-950/30 ring-1 ring-amber-400/50'
                : 'bg-[#0f1f38]/90 hover:bg-[#132847] border-white/10 hover:border-amber-500/40 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="text-white font-black italic uppercase tracking-wider text-sm sm:text-base group-hover:text-amber-300 transition-colors">
                PREGUNTES LABORALS
              </span>
            </div>
            <span className="text-amber-300/70 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em]">
              EXPERIÈNCIA I TRAJECTÒRIA · {countLaborals} PREGUNTES
            </span>
          </button>

          {/* BLOC 4: PREGUNTES DE PGME */}
          <button
            onClick={() => setBlocActiu(blocActiu === 'pgme' ? 'tots' : 'pgme')}
            id="btn-bloc-preguntes-pgme"
            className={`w-full text-center rounded-2xl p-5 sm:p-6 transition-all duration-200 border cursor-pointer active:scale-98 flex flex-col items-center justify-center gap-2 group min-h-[120px] ${
              blocActiu === 'pgme'
                ? 'bg-emerald-950/80 border-emerald-400 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-400/50'
                : 'bg-[#0f1f38]/90 hover:bg-[#132847] border-white/10 hover:border-emerald-500/40 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-white font-black italic uppercase tracking-wider text-sm sm:text-base group-hover:text-emerald-300 transition-colors">
                PREGUNTES DE PGME
              </span>
            </div>
            <span className="text-emerald-300/70 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em]">
              VALORS I CULTURA MOSSO · {countPgme} PREGUNTES
            </span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BARRA D'EINES: CERCADOR + BOTÓ PONT PLEGAR/DESPLEGAR */}
      {/* ========================================================================= */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Cercador ràpid */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Cerca per pregunta, consell o concepte clau..."
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
            {obertes.length === preguntesFiltrades.length && preguntesFiltrades.length > 0
              ? 'Plegar totes' 
              : 'Desplegar totes'}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. LLISTAT DE TARGETES DE PREGUNTES INTERACTIVES */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        {preguntesFiltrades.map((item) => {
          const estaOberta = obertes.includes(item.id);

          // Determinació d'estil i colors segons el bloc temàtic
          const dotColor = 
            item.bloc === 'dades_personals' ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.7)]' :
            item.bloc === 'personals' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]' :
            item.bloc === 'laborals' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]' :
            'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]';

          const badgeText =
            item.bloc === 'dades_personals' ? 'DADES PERSONALS I CONTEXT' :
            item.bloc === 'personals' ? 'ÀMBIT PERSONAL' :
            item.bloc === 'laborals' ? 'TRAJECTÒRIA LABORAL' :
            'CULTURA PG-ME';

          const badgeStyle =
            item.bloc === 'dades_personals' ? 'text-purple-300 bg-purple-500/10 border-purple-400/20' :
            item.bloc === 'personals' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-400/20' :
            item.bloc === 'laborals' ? 'text-amber-400 bg-amber-500/10 border-amber-400/20' :
            'text-emerald-400 bg-emerald-500/10 border-emerald-400/20';

          return (
            <div
              key={item.id}
              className={`bg-[#0c1424] rounded-2xl border transition-all duration-200 shadow-lg ${
                estaOberta 
                  ? 'border-cyan-500/40 shadow-cyan-950/20' 
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Capçalera de la targeta (feta clicable) */}
              <button
                onClick={() => toggleTargeta(item.id)}
                className="w-full p-5 sm:p-6 flex items-center justify-between text-left gap-4 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                  {/* Punt brillant corporatiu */}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9.5px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    </div>

                    <h3 className="text-white font-extrabold text-sm sm:text-base tracking-wide group-hover:text-cyan-300 transition-colors leading-snug">
                      "{item.pregunta}"
                    </h3>
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
                  
                  {/* Resposta model orientativa */}
                  <div className="pt-3 space-y-2">
                    <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block font-mono">
                      ORIENTACIÓ I RESPOSTA MODEL RECOMANADA :
                    </span>
                    <div className="bg-[#020b18] border border-slate-800/90 rounded-xl p-4 text-slate-200 text-xs sm:text-sm leading-relaxed italic">
                      "{item.respostaModel || 'Elabora la teva resposta basant-te en fets reals, demostrant sinceritat, autocrítica i una sòlida vocació de servei públic.'}"
                    </div>
                  </div>

                  {/* Consell clau d'OposiCAT */}
                  {item.consellOposicat && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-[#FFDF00] font-black uppercase tracking-wider block font-mono">
                        CRITERI I CONSELL CLAU D'OPOSICAT :
                      </span>
                      <div className="bg-[#020b18] border border-yellow-500/20 rounded-xl p-3.5 text-slate-300 text-xs leading-relaxed">
                        {item.consellOposicat}
                      </div>
                    </div>
                  )}

                  {/* Competències clau relacionades / Avís de desbloqueig */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block font-mono">
                      {item.bloc === 'dades_personals'
                        ? "OBSERVACIÓ DEL TRIBUNAL :"
                        : "COMPETÈNCIES CLAU QUE AVALUA EL TRIBUNAL AMB AQUESTA PREGUNTA :"}
                    </span>
                    <div className="bg-[#020b18] border border-blue-500/20 rounded-xl p-3 text-slate-300 text-xs leading-relaxed flex items-center gap-2">
                      <span className="text-cyan-400 text-sm shrink-0">🔒</span>
                      <p className="font-medium text-slate-200">
                        Desbloquejarem quines competències clau estan involucrades en breus posterior a les primeres classes d'entrevista.
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {preguntesFiltrades.length === 0 && (
          <div className="bg-[#0c1424] rounded-2xl border border-slate-800 p-8 text-center space-y-3">
            <p className="text-slate-400 text-xs">
              No s'ha trobat cap pregunta amb el terme <strong className="text-white">"{cerca}"</strong>.
            </p>
            <button
              onClick={() => {
                setCerca('');
                setBlocActiu('tots');
              }}
              className="text-xs text-cyan-400 hover:underline font-bold uppercase"
            >
              Restablir tots els filtres
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. TARGETA DE CLOENDA DIDÀCTICA: CRIDA A L'ACCIÓ */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#0c1424] to-[#020b18] rounded-2xl border border-[#FFDF00]/25 p-6 sm:p-7 shadow-2xl space-y-5 text-center sm:text-left">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-5">
          <div className="space-y-2 flex-1">
            <h4 className="text-white font-black text-sm sm:text-base uppercase tracking-tight">
              Posa en pràctica el teu Qüestionari Biogràfic amb el Test Biodata o una sessió d'Entrevista Personal.
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Entrena el teu discurs i les teves respostes per arribar a l'entrevista oral amb la màxima seguretat.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Botó 1: Practicar Test Biodata */}
            <button
              id="btn-practicar-biodata-des-de-biografic"
              onClick={() => {
                if (onAnarBiodata) {
                  onAnarBiodata();
                } else {
                  onTornar();
                }
              }}
              className="bg-[#FFDF00] hover:bg-yellow-400 active:scale-95 text-slate-950 font-black italic uppercase text-xs sm:text-sm px-6 py-4 rounded-xl shadow-xl hover:shadow-yellow-500/20 transition-all duration-200 cursor-pointer border border-yellow-300/40"
            >
              Practicar Test Biodata
            </button>

            {/* Botó 2: Practicar Entrevista */}
            <button
              id="btn-practicar-entrevista-des-de-biografic"
              onClick={() => {
                if (onAnarEntrevista) {
                  onAnarEntrevista();
                } else {
                  onTornar();
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black italic uppercase text-xs sm:text-sm px-6 py-4 rounded-xl shadow-xl hover:shadow-blue-600/20 transition-all duration-200 cursor-pointer border border-blue-400/30"
            >
              Practicar Entrevista
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. BOTONS DE NAVEGACIÓ INFERIOR */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
        <button
          onClick={onTornar}
          className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-cyan-500/40 hover:text-cyan-400 duration-200 cursor-pointer"
          id="btn-tornar-menu-biodata-inferior-biografic"
        >
          <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Tornar a la Prova Biodata</span>
        </button>

        <button
          onClick={onTornarMenuPrincipal}
          className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-slate-400 active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer"
          id="btn-tornar-menu-principal-inferior-biografic"
        >
          <span>Menú principal</span>
        </button>
      </div>

    </div>
  );
};

