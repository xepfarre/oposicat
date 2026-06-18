import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
// @ts-ignore
import T1Image from '../assets/images/T-1.png';
// @ts-ignore
import T2Image from '../assets/images/T-2.png';
// @ts-ignore
import T3Image from '../assets/images/T-3.png';
// @ts-ignore
import T32Image from '../assets/images/T-3_2.png';
// @ts-ignore
import T4Image from '../assets/images/T-4.png';
// @ts-ignore
import FonsTeoricaImage from '../assets/images/Teorica.png';
// Explicació per a no-programadors: Importem la nova imatge de fons FP.png per a la secció de la prova teòrica del web de Mossos.
// @ts-ignore
import FonsFPImage from '../assets/images/FP.png';
// Explicació per a no-programadors: Importem la imatge de fons PF.png per assignar-la com a fons decoratiu del bloc complet de la PROVA FÍSICA.
// @ts-ignore
import FonsPFImage from '../assets/images/PF.png';
// Explicació per a no-programadors: Importem la imatge de fons PP.png per assignar-la com a fons decoratiu del bloc complet de la PROVA PSICOPROFESSIONAL.
// @ts-ignore
import FonsPPImage from '../assets/images/PP.png';
// Explicació per a no-programadors: Importem les imatges de preparació psicoprofessional P-0 fins a P-5 des de la carpeta de recursos.
// @ts-ignore
import P0Image from '../assets/images/P-0.png';
// @ts-ignore
import P1Image from '../assets/images/P-1.png';
// @ts-ignore
import P2Image from '../assets/images/P-2.png';
// @ts-ignore
import P3Image from '../assets/images/P-3.png';
// @ts-ignore
import P4Image from '../assets/images/P-4.png';
// @ts-ignore
import P5Image from '../assets/images/P-5.png';
// @ts-ignore
import P6Image from '../assets/images/P-6.png';
// Explicació per a no-programadors: Importem les imatges de preparació física F-0 fins a F-8 des de la carpeta de recursos.
// @ts-ignore
import F0Image from '../assets/images/F-0.png';
// @ts-ignore
import F1Image from '../assets/images/F-1.png';
// @ts-ignore
import F2Image from '../assets/images/F-2.png';
// @ts-ignore
import F3Image from '../assets/images/F-3.png';
// @ts-ignore
import F4Image from '../assets/images/F-4.png';
// @ts-ignore
import F5Image from '../assets/images/F-5.png';
// @ts-ignore
import F6Image from '../assets/images/F-6.png';
// @ts-ignore
import F7Image from '../assets/images/F-7.png';
// @ts-ignore
import F8Image from '../assets/images/F-8.png';
// Explicació per a no-programadors: Importem la sèrie d'imatges X-0 fins a X-5 per a la secció de Comunitat i Motivació.
// @ts-ignore
import X0Image from '../assets/images/X-0.png';
// @ts-ignore
import X1Image from '../assets/images/X-1.png';
// @ts-ignore
import X2Image from '../assets/images/X-2.png';
// @ts-ignore
import X3Image from '../assets/images/X-3.png';
// @ts-ignore
import X4Image from '../assets/images/X-4.png';
// @ts-ignore
import X5Image from '../assets/images/X-5.png';
// Explicació per a no-programadors: Importem la imatge XP1, que s'utilitzarà com a fons de pantalla de la secció de comunitat i motivació.
// @ts-ignore
import XPImage from '../assets/images/XP1.png';

interface PropsPaginaMossos {
  onTornar?: () => void;
  onEntrarCampus?: () => void;
}

/**
 * COMPONENT: PaginaMossos (Pàgina d'Aterratge de Mossos d'Esquadra)
 * Explicació per a no-programadors:
 * Aquesta és la pantalla premium específica que veuen els opositors interessats en entrar al Cos de Mossos d'Esquadra.
 * Manté l'estètica d'alt contrast basada en un blau gairebé negre per afavorir la llegibilitat continuada
 * i compta amb un botó d'accés ràpid per tornar a la pantalla d'inici principal en qualsevol moment.
 */
export default function PaginaMossos({ onTornar, onEntrarCampus }: PropsPaginaMossos) {
  // Explicació per a no-programadors: Aquest estat controla el fons d'emergències del requadre central.
  // Cada 5 segons canviarà entre color Blau Mossos d'Esquadra i Vermell d'Emergències/Seguretat de la Generalitat.
  const [esColorBlau, setEsColorBlau] = useState(true);

  // Explicació per a no-programadors: Aquest estat indica quin dels 5 botons del campus s'ha pressionat.
  // En lloc de romandre estàtic, ara cada clic actualitza dinàmicament la imatge a l'esquerra i el text a la dreta.
  const [indexModulActiu, setIndexModulActiu] = useState(0);

  // Explicació per a no-programadors: Aquest estat indica quin dels mòduls de la PROVA FÍSICA s'està visualitzant actualment.
  const [indexModulFisicaActiu, setIndexModulFisicaActiu] = useState(0);

  // Explicació per a no-programadors: Aquest estat controla el visor detallat de les imatges o Lightbox. Desa la llista d'imatges del bloc actiu i l'índex de la imatge que s'està mirant, de manera que l'usuari es pugui moure endavant i endarrere de forma còmoda.
  const [lightboxData, setLightboxData] = useState<{ images: string[]; index: number } | null>(null);

  // Explicació per a no-programadors: Aquest efecte s'activa quan obrim una imatge gran. Escolta si l'estudiant prem les tecles Esc (per tancar), Fletxa Esquerra (imatge anterior) o Fletxa Dreta (imatge següent) per fer l'experiència súper ràpida.
  useEffect(() => {
    if (!lightboxData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Right") {
        setLightboxData((prev) => {
          if (!prev) return null;
          const nextIndex = (prev.index + 1) % prev.images.length;
          return { ...prev, index: nextIndex };
        });
      } else if (e.key === "ArrowLeft" || e.key === "Left") {
        setLightboxData((prev) => {
          if (!prev) return null;
          const prevIndex = (prev.index - 1 + prev.images.length) % prev.images.length;
          return { ...prev, index: prevIndex };
        });
      } else if (e.key === "Escape") {
        setLightboxData(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxData ? lightboxData.images.length : 0]);

  const modulsTeorica = [
    {
      emoji: "📚",
      botoText: "1. TEMARI OFICIAL",
      etiqueta: "TEMARI DIGITAL INTERACTIU",
      titol: "Estudia amb eficiència amb el Temari Oficial d'OposiCAT",
      descripcio: "",
      // Explicació per a no-programadors: Punts destacats amb text en negreta i checks verds pel Temari Oficial
      puntsClau: [
        {
          boldText: "Format 100% digital:",
          normalText: "Contingut oficial i actualitzat, optimitzat per a mòbil, tablet i PC."
        },
        {
          boldText: "Eines interactives:",
          normalText: "Sistema de subratllat intel·ligent i mode lectura per protegir la teva vista."
        },
        {
          boldText: "Criteris oficials:",
          normalText: "Estructurat punt per punt segons el temari de la Generalitat i el cos de Mossos."
        }
      ],
      imatge: T1Image
    },
    {
      emoji: "🧠",
      botoText: "2. PSICOTÈCNICS",
      etiqueta: "PREPARACIÓ DE CAPACITATS",
      titol: "Entrena la ment amb el mòdul de Psicotècnics",
      descripcio: "",
      // Explicació per a no-programadors: Punts destacats amb text en negreta i checks verds pel mòdul de Psicotècnics
      puntsClau: [
        {
          boldText: "Teoria psicoprofessional:",
          normalText: "Guies i metodologies clares per entendre com funciona cada tipus de test."
        },
        {
          boldText: "Estratègia de biodades:",
          normalText: "Explicació teòrica de com enfocar el qüestionari biogràfic de forma correcta."
        },
        {
          boldText: "Preparació d'entrevistes:",
          normalText: "Marc teòric amb les claus i competències que avaluen els psicòlegs oficials."
        }
      ],
      imatge: T2Image
    },
    {
      emoji: "📺",
      botoText: "3. CLASSES EN DIRECTE",
      etiqueta: "SESSIONS SÍNCRONES ACTIVES",
      titol: "Connecta't al campus amb les Classes en Directe",
      descripcio: "",
      // Explicació per a no-programadors: Punts destacats amb text en negreta i checks verds per les Classes en Directe
      puntsClau: [
        {
          boldText: "Sessions setmanals:",
          normalText: "Classes teòriques en línia i en directe per repassar els temes més complexos."
        },
        {
          boldText: "Resolució de dubtes:",
          normalText: "Interacció en temps real amb els professors per aclarir conceptes del temari."
        },
        {
          boldText: "Planificació activa:",
          normalText: "Anàlisi de l'estratègia d'estudi de cara a les dates oficials de l'examen."
        }
      ],
      imatge: T3Image
    },
    {
      emoji: "🎬",
      botoText: "4. CLASSES SOTA DEMANDA",
      etiqueta: "BIBLIOTECA MULTIMÈDIA",
      titol: "Avança al teu ritme amb les Classes Sota Demanda",
      descripcio: "",
      // Explicació per a no-programadors: Punts destacats amb text en negreta i checks verds per la Biblioteca a la carta
      puntsClau: [
        {
          boldText: "Biblioteca Premium:",
          normalText: "Totes les classes teòriques gravades en alta resolució per veure-les quan vulguis."
        },
        {
          boldText: "Ritme personalitzat:",
          normalText: "Avança, repassa i descarrega el contingut audiovisual sense dependre d'horaris."
        },
        {
          boldText: "Repetició il·limitada:",
          normalText: "Torna a veure les explicacions dels temes més difícils tantes vegades com necessitis."
        }
      ],
      imatge: T32Image
    },
    {
      emoji: "👤",
      botoText: "5. EL MEU CAMPUS",
      etiqueta: "PANELL DE CONTROL DE L'ALUMNE",
      titol: "Gestiona el teu rendiment des d'El Meu Campus",
      descripcio: "",
      // Explicació per a no-programadors: Punts destacats amb text en negreta i checks verds per l'Espai Alumne i seguiment
      puntsClau: [
        {
          boldText: "Control del progrés:",
          normalText: "Estadístiques teòriques personals i mapes de calor dels teus encerts i errors."
        },
        {
          boldText: "Gestor de resums:",
          normalText: "Espai personal per desar els teus apunts digitals, esquemes i notes clau."
        },
        {
          boldText: "Històrics guardats:",
          normalText: "Sincronització persistent de les teves hores d'estudi en qualsevol dispositiu."
        }
      ],
      imatge: T4Image
    }
  ];

  // Explicació per a no-programadors: Aquestes dues funcions permeten un desplaçament seqüencial per cadascun dels mòduls de la PROVA TEÒRICA.
  // Quan es prem la fletxa de l'esquerra, retrocedeix un mòdul de la llista circularment. Amb la fletxa dreta, s'avança al següent de forma contínua.
  const anarAnteriorTeorica = () => {
    setIndexModulActiu((prev) => (prev === 0 ? modulsTeorica.length - 1 : prev - 1));
  };

  const anarSeguentTeorica = () => {
    setIndexModulActiu((prev) => (prev === modulsTeorica.length - 1 ? 0 : prev + 1));
  };

  // Explicació per a no-programadors: Les dades de la prova física configurades completament amb els títols originals elegants restaurats, i situant els codis identificadors en català sense faltes com a etiquetes verds ressaltades de referència al costat de cada botó mapejat.
  const modulsFisica = [
    {
      emoji: "🏃",
      botoText: "1- Pantalla inicial",
      etiqueta: "1- Pantalla inicial",
      titol: "Prepara la teva condició física amb OposiCAT",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Dietes intel·ligents:",
          normalText: "Menús i macronutrients totalment adaptats al teu desgast diari."
        },
        {
          boldText: "Cercador de gimnasos:",
          normalText: "Localitza els centres associats més propers amb instal·lacions oficials."
        },
        {
          boldText: "Les 3 proves clau:",
          normalText: "Preparació específica per a circuit, press de banca i navette."
        }
      ],
      imatge: F0Image
    },
    {
      emoji: "📜",
      botoText: "2- Bases oficials",
      etiqueta: "2- Bases oficials",
      titol: "Normativa i Bases Oficials del DOGC",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Descripció al detall:",
          normalText: "Guia pas a pas del text oficial per conèixer l'exercici perfectament."
        },
        {
          boldText: "Evita penalitzacions:",
          normalText: "Tot el que NO pots fer el dia de la prova per evitar un nul."
        },
        {
          boldText: "Criteris d'avaluació:",
          normalText: "Informació directa de com mesura el temps el tribunal."
        }
      ],
      imatge: F1Image
    },
    {
      emoji: "💡",
      botoText: "3- Com millorar (amb vídeos)",
      etiqueta: "3- Com millorar (amb vídeos)",
      titol: "Tècniques i Consells d'Experts",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Punts crítics:",
          normalText: "Secrets per esgarrapar segons a la tanca, el plint o la colxoneta."
        },
        {
          boldText: "Millora biomecànica:",
          normalText: "Consells de postura i execució per optimitzar la teva força."
        },
        {
          boldText: "Propiocepció activa:",
          normalText: "Exercicis clau per millorar la reactivitat i el control dels teus peus."
        }
      ],
      imatge: F2Image
    },
    {
      emoji: "⏱️",
      botoText: "4- Calculadora intel·ligent",
      etiqueta: "4- Calculadora intel·ligent",
      titol: "Mesura les teves marques en temps real",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Cronòmetre integrat:",
          normalText: "Un simulador digital a punt per registrar els teus temps al moment."
        },
        {
          boldText: "Registre instantani:",
          normalText: "Guarda la teva marca al finalitzar el circuit amb un sol clic."
        },
        {
          boldText: "Interfície àgil:",
          normalText: "Disseny optimitzat per fer-lo servir mentre estàs entrenant al gimnàs."
        }
      ],
      imatge: F3Image
    },
    {
      emoji: "📈",
      botoText: "5- Nota instantània",
      etiqueta: "5- Nota instantània",
      titol: "Analitza i guarda la teva nota",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Historial de marques:",
          normalText: "Desa els teus millors registres per veure la teva progressió."
        },
        {
          boldText: "Nota ponderada:",
          normalText: "Càlcul automàtic de la teva puntuació global sobre 10."
        },
        {
          boldText: "Feedback interactiu:",
          normalText: "Consells personalitzats de l'app segons el teu resultat de tall."
        }
      ],
      imatge: F8Image
    },
    {
      emoji: "📊",
      botoText: "6- Notes oficials",
      etiqueta: "6- Notes oficials",
      titol: "Consulta el teu barem oficial",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Filtre per gènere:",
          normalText: "Puntuacions completament desglossades per a homes i dones."
        },
        {
          boldText: "Nota instantània:",
          normalText: "Comprova quants punts (del 0 al 10) té el teu temps actual."
        },
        {
          boldText: "Objectiu 10 ideal:",
          normalText: "Visualitza la marca exacta que necessites per aconseguir la màxima nota."
        }
      ],
      imatge: F4Image
    },
    {
      emoji: "📅",
      botoText: "7- Rutina d'exercicis setmanal",
      etiqueta: "7- Rutina d'exercicis setmanal",
      titol: "La teva rutina setmanal estructurada",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Planificació progressiva:",
          normalText: "Entrenaments ordenats setmana a setmana per evitar lesions."
        },
        {
          boldText: "Calendari mensual:",
          normalText: "Control de les sessions completades i dels teus dies de descans."
        },
        {
          boldText: "Evolució constant:",
          normalText: "Bloquejos i rutines noves a mesura que el teu cos progressa."
        }
      ],
      imatge: F5Image
    },
    {
      emoji: "🏢",
      botoText: "8- Cercador de GYM",
      etiqueta: "8- Cercador de GYM",
      titol: "Troba el teu centre ideal a prop teu",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Filtre per municipi:",
          normalText: "Localitza els gimnasos més propers a la teva zona."
        },
        {
          boldText: "Equipament oficial:",
          normalText: "Filtra per centres que disposen del circuit de Mossos muntat."
        },
        {
          boldText: "Entrenament enfocat:",
          normalText: "Troba espais específics per a press de banca o course navette."
        }
      ],
      imatge: F6Image
    },
    {
      emoji: "🥗",
      botoText: "9- Dieta i calculadora",
      etiqueta: "9- Dieta i calculadora",
      titol: "La benzina per al teu rendiment físic",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Comptador de calories:",
          normalText: "Control de quilocalories restants basat en el teu desgast."
        },
        {
          boldText: "Control de macros:",
          normalText: "Gràfics i barres per mesurar carbohidrats, proteïnes i greixos."
        },
        {
          boldText: "Gestió de l'esmorzar/dinar:",
          normalText: "Registre net dels aliments que ingereixes durant el dia."
        }
      ],
      imatge: F7Image
    }
  ];

  // Explicació per a no-programadors: De la mateixa manera, aquestes funcions permeten navegar pels mòduls de la PROVA FÍSICA de forma cíclica quan se seleccionen les fletxes de navegació.
  const anarAnteriorFisica = () => {
    setIndexModulFisicaActiu((prev) => (prev === 0 ? modulsFisica.length - 1 : prev - 1));
  };

  const anarSeguentFisica = () => {
    setIndexModulFisicaActiu((prev) => (prev === modulsFisica.length - 1 ? 0 : prev + 1));
  };

  // Explicació per a no-programadors: Aquest estat indica quin dels 5 botons de la PROVA PSICOPROFESSIONAL s'ha premut.
  const [indexModulPsicoprofessionalActiu, setIndexModulPsicoprofessionalActiu] = useState(0);

  // Explicació per a no-programadors: Aquest estat indica quin dels 6 botons de la COMUNITAT I MOTIVACIÓ s'ha premut.
  const [indexModulComunitatActiu, setIndexModulComunitatActiu] = useState(0);

  // Explicació per a no-programadors: Les dades de la prova psicoprofessional configurades amb els nous 7 mòduls (P-0 fins a P-6) amb els nous títols de selecció i colors de checks rosa tematitzats.
  const modulsPsicoprofessional = [
    {
      emoji: "👮",
      botoText: "1- Pantalla incial",
      etiqueta: "1- PANTALLA INICIAL",
      titol: "Preparació Integral de la Prova Psicoprofessional",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Competències clau:",
          normalText: "Descobreix i treballa els trets de personalitat que busca el tribunal."
        },
        {
          boldText: "Prova Biodata:",
          normalText: "El qüestionari biogràfic complet preparat al mil·límetre per a tu."
        },
        {
          boldText: "Entrevista personal:",
          normalText: "Simulacres i claus per afrontar la darrera fase amb èxit."
        }
      ],
      imatge: P0Image
    },
    {
      emoji: "🧠",
      botoText: "2- Apren com es puntua",
      etiqueta: "2- APRÈN COM ES PUNTUA",
      titol: "Domina el perfil competencial requerit",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Marc d'avaluació:",
          normalText: "Entén com encaixen les teves respostes en els criteris dels psicòlegs."
        },
        {
          boldText: "Habilitats socials:",
          normalText: "Treballa la comunicació, l'adaptabilitat, l'autocontrol i el treball en equip."
        },
        {
          boldText: "Coherència verbal:",
          normalText: "Consells per mantenir un discurs lògic entre el text i la teva expressió corporal."
        }
      ],
      imatge: P1Image
    },
    {
      emoji: "📋",
      botoText: "3- Preguntes Biodata",
      etiqueta: "3- PREGUNTES BIODATA",
      titol: "Exemples i preguntes d'anys anteriors",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Preguntes oficials:",
          normalText: "Enfronta't als dubtes reals que fan sobre la Policia de la Generalitat."
        },
        {
          boldText: "Respostes guiades:",
          normalText: "Analitza exemples estructurats per saber com enfocar les teves respostes."
        },
        {
          boldText: "Criteris clau:",
          normalText: "Aprèn a expressar idees de forma clara, altruista i professional."
        }
      ],
      imatge: P2Image
    },
    {
      emoji: "📝",
      botoText: "4- Test Biodata",
      etiqueta: "4- TEST BIODATA",
      titol: "Entrena el teu qüestionari biogràfic",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Definició i propòsit:",
          normalText: "Coneix la importància del test que servirà de base per a la teva entrevista."
        },
        {
          boldText: "Simulador exclusiu:",
          normalText: "Un test expressament dissenyat per extreure els teus valors reals de l'ISPC."
        },
        {
          boldText: "La millor eina:",
          normalText: "Practica amb un qüestionari idèntic al que tindràs el dia de l'examen oficial."
        }
      ],
      imatge: P3Image
    },
    {
      emoji: "⚖️",
      botoText: "5- Resultats del Biodata",
      etiqueta: "5- RESULTATS DEL BIODATA",
      titol: "Diagnòstic competencial instantani",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Mètriques personalitzades:",
          normalText: "Visualitza la teva nota del 0 al 10 en cada competència clau analitzada."
        },
        {
          boldText: "Gràfics de rendiment:",
          normalText: "Barres de color dinàmiques (verd/groc) segons el teu nivell d'adaptabilitat i autocontrol."
        },
        {
          boldText: "Feedback orientatiu:",
          normalText: "Consells automàtics per saber quins punts de la teva personalitat has de millorar."
        }
      ],
      imatge: P4Image
    },
    {
      emoji: "🗣️",
      botoText: "6- Entrevistes amb Psicolegs",
      etiqueta: "6- ENTREVISTES AMB PSICÒLEGS",
      titol: "Reserva la teva entrevista personalitzada",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Sessió individual:",
          normalText: "Entrevista 1 a 1 amb els nostres experts per polir el teu perfil real."
        },
        {
          boldText: "Perfil sincronitzat:",
          normalText: "Els psicòlegs rebran els teus resultats del Biodata per a una sessió a mida."
        },
        {
          boldText: "Calendari flexible:",
          normalText: "Selecciona fàcilment el dia, el torn (matí/tarda) i l'hora amb un sol clic."
        }
      ],
      imatge: P5Image
    },
    {
      emoji: "📈",
      botoText: "7- Prepara't l'entrevista sol",
      etiqueta: "7- PREPARA'T L'ENTREVISTA SOL",
      titol: "Evolució continuada i ràting de millora",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Registre exhaustiu:",
          normalText: "Estat complet i recopilació dinàmica de totes les teves simulacions passades."
        },
        {
          boldText: "Mètriques comparatives:",
          normalText: "Analitza la teva progressió comparada directe amb la mitjana del teu grup."
        }
      ],
      imatge: P6Image
    }
  ];

  // Explicació per a no-programadors: Les dades del visualitzador de comunitat i motivació, configurades amb els 6 nous mòduls reals d'OposiCAT i les seves imatges X-0 fins a X-5.
  const modulsComunitat = [
    {
      emoji: "🏆",
      botoText: "1. GAMIFICACIÓ",
      etiqueta: "INTERFÍCIE DE RÀNQUINGS I GAMIFICACIÓ",
      titol: "Competició sana amb el sistema de rànquings",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Gamificació activa:",
          normalText: "Suma punts completant tests, entrenaments o complint els teus objectius diaris."
        },
        {
          boldText: "Foment de l'activitat:",
          normalText: "Una motivació extra per connectar-te diàriament i mantenir la teva rutina d'estudi."
        },
        {
          boldText: "Premis mensuals reals:",
          normalText: "Recompenses de veritat cada mes per als usuaris més compromesos de la plataforma."
        }
      ],
      imatge: X0Image
    },
    {
      emoji: "💬",
      botoText: "2. XATS INTEGRATS",
      etiqueta: "XATS INTEGRATS ALS RÀNQUINGS",
      titol: "Connexió i motivació amb els teus companys",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Xat integrat:",
          normalText: "Comenta les teves impressions, dubtes o bromes directament des del canal del rànquing."
        },
        {
          boldText: "Comunitat unida:",
          normalText: "Comparteix el teu dia a dia amb altres opositors per mantenir la constància alta."
        },
        {
          boldText: "Entorn interactiu:",
          normalText: "Canals dinàmics fets per i per a la comunitat d'aspirants a Mossos."
        }
      ],
      imatge: X1Image
    },
    {
      emoji: "🎁",
      botoText: "3. RECOMPENSES",
      etiqueta: "PREMIS I RECOMPENSES D'OPOSICAT",
      titol: "Recompenses reals per al teu esforç",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Podis mensuals:",
          normalText: "Obsequis exclusius per als 3 primers classificats de cada rànquing actiu."
        },
        {
          boldText: "Descomptes directes:",
          normalText: "Targetes regal i xecs per a marques líders en nutrició, supermercats i esport."
        },
        {
          boldText: "Col·laboracions oficials:",
          normalText: "Premis patrocinats que varien mensualment per premiar la teva constància."
        }
      ],
      imatge: X2Image
    },
    {
      emoji: "📊",
      botoText: "4. RÀNQUINGS",
      etiqueta: "VISUALITZACIÓ DEL RÀNQUING I MEDALLES",
      titol: "Mesura la teva posició a la comunitat",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Podi de medalles:",
          normalText: "Visualitza de forma gràfica i intuïtiva qui lidera la plataforma actualment."
        },
        {
          boldText: "Posició personal:",
          normalText: "Comprova instantàniament quin és el teu lloc actual per continuar escalant punts."
        },
        {
          boldText: "Ràtio de participació:",
          normalText: "Requisits mínims totalment clars per poder entrar a competir amb la resta."
        }
      ],
      imatge: X3Image
    },
    {
      emoji: "🗣️",
      botoText: "5. FÒRUMS DE DEBAT",
      etiqueta: "FÒRUM GENERAL I CANALS PERSONALITZATS",
      titol: "Fòrums de debat de totes les fases",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Canals per temàtiques:",
          normalText: "Espais organitzats per a dubtes de teoria, físiques, psicotècnics o l'entrevista."
        },
        {
          boldText: "Fòrums personals:",
          normalText: "Possibilitat de donar d'alta els teus propis fils de debat de forma lliure."
        },
        {
          boldText: "Resolució de dubtes:",
          normalText: "Resol preguntes complexes ajudant-vos mútuament amb la resta d'opositors."
        }
      ],
      imatge: X4Image
    },
    {
      emoji: "🏃‍♂️",
      botoText: "6. QUEDADES",
      etiqueta: "QUEDADES D'ESTUDI I ENTRENAMENT",
      titol: "Troba companys d'estudi o entrenament",
      descripcio: "",
      puntsClau: [
        {
          boldText: "Quedades reals:",
          normalText: "Espai ideal per organitzar sessions conjunts de couse navette, circuit o biblioteca."
        },
        {
          boldText: "Xats 100% públics:",
          normalText: "Interaccions totalment transparents i obertes dins dels canals per a una total seguretat."
        },
        {
          boldText: "Facilitat de contacte:",
          normalText: "Connecta fàcilment amb aspirants de la teva mateixa zona o municipi."
        }
      ],
      imatge: X5Image
    }
  ];

  // Explicació per a no-programadors: de la mateixa manera, aquestes funcions permeten navegar cíclicament per cadascun dels mòduls de la PROVA PSICOPROFESSIONAL.
  const anarAnteriorPsicoprofessional = () => {
    setIndexModulPsicoprofessionalActiu((prev) => (prev === 0 ? modulsPsicoprofessional.length - 1 : prev - 1));
  };

  const anarSeguentPsicoprofessional = () => {
    setIndexModulPsicoprofessionalActiu((prev) => (prev === modulsPsicoprofessional.length - 1 ? 0 : prev + 1));
  };

  // Explicació per a no-programadors: de la mateixa manera, aquestes funcions permeten navegar cíclicament per cadascun dels mòduls de la secció de COMUNITAT I MOTIVACIÓ.
  const anarAnteriorComunitat = () => {
    setIndexModulComunitatActiu((prev) => (prev === 0 ? modulsComunitat.length - 1 : prev - 1));
  };

  const anarSeguentComunitat = () => {
    setIndexModulComunitatActiu((prev) => (prev === modulsComunitat.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const temporitzador = setInterval(() => {
      setEsColorBlau((previ) => !previ);
    }, 5000);
    return () => clearInterval(temporitzador);
  }, []);

  return (
    <div 
      style={{ 
        backgroundColor: '#050b14', 
        minHeight: '100vh' 
      }} 
      className="min-h-screen text-slate-100 font-sans flex flex-col justify-between selection:bg-[#FFDF00] selection:text-slate-900"
    >
      
      {/* SECCIÓ SUPERIOR CONJUNTA AMB IMATGE DE FONS DE LA MOSSA (ISPC) */}
      {/* Explicació per a no-programadors: Aquest contenidor aplega el header, el menú i la part superior d'heroi de la pàgina sota la imatge física de fons del campus.
          Es difumina completament de dalt a baix cap a color sòlid foscor per tal que les següents seccions (com "Perquè nosaltres") romanguin totalment netes i independents. */}
      <div
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(5, 11, 20, 0.45) 0%, rgba(5, 11, 20, 0.95) 85%, #050b14 100%), url("/assets/imatges/fons_ispc.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          width: '100%',
        }}
      >
        
        {/* CAPÇALERA SIMPLIFICADA COPIADA DE LA PÀGINA PRINCIPAL */}
      {/* Explicació per a no-programadors: Capçalera d'alta definició, amb fons difuminat, alçada de 74px de cel·les i estil unificat. */}
      <header  
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#050b14ef', // Color blau fosc profund corporatiu sota les directrius d'OposiCAT
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #111e36',
          boxSizing: 'border-box',
          width: '100%',
          height: '74px', // Alçada estàtica d'alta precisió per al pas eix-a-eix de cel·les
          padding: '0 24px', // Marges laterals amplis per respirar l'escriptori
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* BLOC PORTABILITAT ABSOLUTA EXTRA-ESQUERRA: TORNAR A L'INICI (ESQUERRA DEL TOT) */}
        {/* Explicació per a no-programadors:
            Col·loquem el botó de retorn a l'extrem absolut del header per assegurar que queda enganxat
            al límit esquerre sense alterar mai l'alineació o posició del logotip de l'acadèmia. */}
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 150 }}>
          {onTornar ? (
            <button 
              onClick={onTornar}
              className="text-xs font-black italic uppercase tracking-wider text-slate-400 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer flex items-center gap-1"
              style={{ border: 'none', background: 'none' }}
            >
              ← Pàgina principal
            </button>
          ) : (
            <Link 
              to="/" 
              className="text-xs font-black italic uppercase tracking-wider text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              ← Pàgina principal
            </Link>
          )}
        </div>

        <div 
          style={{
            maxWidth: '80rem', // Equival a max-w-7xl de Tailwind (1280px d'amplada màxima)
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', // Flexbox d'estil línia recta de punta a punta per separar els blocs al màxim
            width: '100%',
            height: '100%', // Alçar de dalt a baix per complet
            boxSizing: 'border-box',
            position: 'relative' // Explicació per a no-programadors: Establim la posició relativa per poder col·locar el bloc central exactament al mig
          }}
        >
          {/* BLOC ESQUERRA SENSE EMPENTES: LOGO PRINCIPAL FIXAT A LA GRATELLA */}
          {/* Explicació per a no-programadors: 
              Aquest és el logo original de la marca d'alt rendiment d'OposicionsCatalunya.
              Perquè no es mogui ni un sol píxel quan entrem a la vista de Mossos, manté exactament
              la mateixa posició i marges lliures de padding (display flex simple sense empenta) que a la portada. */}
          <div style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
            {onTornar ? (
              <button onClick={onTornar} className="no-underline text-left cursor-pointer bg-transparent border-none p-0" style={{ border: 'none', background: 'none' }}>
                <span style={{ fontSize: '22px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffffff', userSelect: 'none' }} className="hover:opacity-90 transition-opacity">
                  OPOSICIONS{' '}
                  <span style={{ fontStyle: 'italic' }}>
                    <span style={{ color: '#FFDF00' }}>C</span>
                    <span style={{ color: '#e10613' }}>A</span>
                    <span style={{ color: '#FFDF00' }}>T</span>
                    <span style={{ color: '#e10613' }}>A</span>
                    <span style={{ color: '#FFDF00' }}>L</span>
                    <span style={{ color: '#e10613' }}>U</span>
                    <span style={{ color: '#FFDF00' }}>N</span>
                    <span style={{ color: '#e10613' }}>Y</span>
                    <span style={{ color: '#FFDF00' }}>A</span>
                  </span>
                </span>
              </button>
            ) : (
              <Link to="/" className="no-underline">
                <span style={{ fontSize: '22px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffffff', userSelect: 'none' }} className="hover:opacity-90 transition-opacity">
                  OPOSICIONS{' '}
                  <span style={{ fontStyle: 'italic' }}>
                    <span style={{ color: '#FFDF00' }}>C</span>
                    <span style={{ color: '#e10613' }}>A</span>
                    <span style={{ color: '#FFDF00' }}>T</span>
                    <span style={{ color: '#e10613' }}>A</span>
                    <span style={{ color: '#FFDF00' }}>L</span>
                    <span style={{ color: '#e10613' }}>U</span>
                    <span style={{ color: '#FFDF00' }}>N</span>
                    <span style={{ color: '#e10613' }}>Y</span>
                    <span style={{ color: '#FFDF00' }}>A</span>
                  </span>
                </span>
              </Link>
            )}
          </div>

          {/* BLOC CENTRAL S'HA CONVERTIT EN PANEL ESTÀTIC VERD DE CONVOCATÒRIES ACTIVES */}
          {/* Explicació per a no-programadors:
              Un botó-insígnia de color verd esmaralda fixat i estàtic que indica de forma elegant
              que les oposicions actuals a Mossos d'Esquadra tenen les convocatòries actives de 46/26 i 46/25. */}
          <div 
            style={{
              position: 'absolute',
              left: '50%', // Centrat pur a nivell de l'eix central lliure d'interferències
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
              height: '42px', // Més baix (menys alt) de manera que queda integrat elegantment sense tocar les vores superior i inferior
              backgroundColor: '#059669', // Verd estàtic esmeralda de seguretat i estat actiu
              boxShadow: '0 0 20px rgba(5, 150, 105, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
              border: '1px solid rgba(16, 185, 129, 0.6)',
              borderRadius: '6px', // Rectangular molt net i professional tipus bento box o botó integrat
              transition: 'all 300ms ease-in-out',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: '28px', // Ajustem el padding lateral perquè el text de la convocatòria hi càpiga perfectament sense sobreposar-se
              paddingRight: '28px',
              boxSizing: 'border-box',
            }}
            className="hidden lg:flex items-center select-none whitespace-nowrap active:brightness-110 cursor-pointer"
          >
            <span style={{ fontSize: '11.5px', fontWeight: '950', letterSpacing: '1px' }} className="uppercase tracking-wider font-sans text-white">
              🟢 CONVOCATÒRIES 46/26 I 46/25 ACTIVES
            </span>
          </div>

          {/* BLOC DRETA: ACCÉS PREMIUM AL CAMPUS */}
          {/* Explicació per a no-programadors: En lloc del text simple de reaccions de retorn, col·loquem el botó premium del campus idèntic en estil, degradat i ombra. */}
          <div style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
            {onEntrarCampus ? (
              <button
                onClick={onEntrarCampus}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ffffff',
                  backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #065f46 100%)', // Degradat exclusiu d'alta conversió d'OposiCAT
                  boxShadow: '0 4px 14px 0 rgba(29, 78, 216, 0.35)',
                }}
                className="hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                CAMPUS VIRTUAL 💻
              </button>
            ) : (
              <Link
                to="/?marketing=true"
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                  backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #065f46 100%)',
                  boxShadow: '0 4px 14px 0 rgba(29, 78, 216, 0.35)',
                  textDecoration: 'none'
                }}
                className="hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                CAMPUS VIRTUAL 💻
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* SUB-HEADER O BARRA DE NAVEGACIÓ SECUNDÀRIA (SUBNAV) */}
      {/* Explicació per a no-programadors: 
          Aquest bloc és una barra de botons d'accés ràpid que se situa just a sota de la capçalera principal.
          Permet a l'estudiant desplaçar-se ràpidament de dalt a baix de la pàgina de forma suau i elegant (scroll suau)
          sense haver de fer lliscar el dit o la roda del ratolí contínuament.
          La barra és intel·ligent i adaptativa, i en mòbils permet lliscar cap als costats (scroll horitzontal) sense trencar la graella. */}
      <div 
        className="w-full bg-[#030712]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-[74px] z-50 py-2.5 px-4 overflow-x-auto scrollbar-none whitespace-nowrap dynamic-subnav"
        style={{
          boxSizing: 'border-box',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-start md:justify-center gap-2 sm:gap-4">
          <button 
            onClick={() => {
              const el = document.getElementById('perque-nosaltres');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#FFDF00] uppercase px-3 py-1.5 rounded-lg hover:bg-slate-800/40 active:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            ⭐ Perquè OposiCAT
          </button>
          
          <span className="text-slate-700 select-none">|</span>

          <button 
            onClick={() => {
              const el = document.getElementById('detall-prova-teorica');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-[10px] sm:text-[11px] font-black tracking-widest text-slate-300 hover:text-white uppercase px-3 py-1.5 rounded-lg hover:bg-slate-800/40 active:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            📚 Prova Teòrica
          </button>

          <button 
            onClick={() => {
              const el = document.getElementById('detall-prova-fisica');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-[10px] sm:text-[11px] font-black tracking-widest text-slate-300 hover:text-white uppercase px-3 py-1.5 rounded-lg hover:bg-slate-800/40 active:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            🏃 Prova Física
          </button>

          <button 
            onClick={() => {
              const el = document.getElementById('detall-prova-psicoprofessional');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-[10px] sm:text-[11px] font-black tracking-widest text-slate-300 hover:text-white uppercase px-3 py-1.5 rounded-lg hover:bg-slate-800/40 active:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            🧠 Prova Psico
          </button>

          <span className="text-slate-700 select-none">|</span>

          <button 
            onClick={() => {
              const el = document.getElementById('detall-comunitat-motivacio');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-[10px] sm:text-[11px] font-black tracking-widest text-slate-300 hover:text-[#10b981] uppercase px-3 py-1.5 rounded-lg hover:bg-slate-800/40 active:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            🤝 Comunitat i Motivació
          </button>

          <button 
            onClick={() => {
              const el = document.getElementById('plans-preus-oposicat');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="text-[10px] sm:text-[11px] font-black tracking-widest text-slate-300 hover:text-[#FFDF00] uppercase px-3 py-1.5 rounded-lg hover:bg-slate-800/40 active:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          >
            🎟️ Plans i Preus
          </button>
        </div>
      </div>

      {/* SECCIÓ HERO PRINCIPAL ESTIL PREMIUM (SEGONS WIREFRAME DE LA IMATGE image_44dcc4.png) */}
      {/* Explicació per a no-programadors: 
          Aquesta secció és el bloc Hero principal de la landing. S'ha reestructurat segons l'esquema simètric del wireframe:
          1. Un títol gran centrat on destaca l'oposició en majúscules.
          2. Una fila dividida en dues columnes de convocatòria activa per cridar l'atenció de l'aspirant.
          3. Una graella equilibrada de 2 grans columnes de contingut institucional:
             - Esquerra: Avantatges del cos (sou, funcionari, conciliació, etc.).
             - Dreta: Requisits d'accés oficials (estudis, edat, permisos, etc.).
          4. Botons de conversió i d'acció situats a la base de les targetes de forma centrada. */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col justify-center items-center text-center relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 flex flex-col items-center w-full"
        >
          {/* 1. BLOC SUPERIOR (Títol reestructurat en dues línies segons demanat de l'usuari) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-wider text-white leading-snug max-w-4xl text-center">
            PREPARA'T L'OPOSICIÓ DE
            <br />
            <span className="text-[#FFDF00]">MOSSOS D'ESQUADRA</span>
          </h1>

          {/* 2. BLOC CENTRAL (Convocatòria activa dividida en 2 columnes en fila horitzontal) */}
          {/* Explicació per a no-programadors: S'ha afegit un fons fosc d'alta opacitat bg-[#050b14]/85 i un contorn de vora fina amb cantonades arrodonides rounded-2xl per tal de ressaltar la convocatòria activa sobre la imatge de fons de la mossa i garantir una òptima llegibilitat. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 max-w-4xl w-full mx-auto my-4 text-center bg-[#050b14]/85 backdrop-blur-md border border-slate-800/80 rounded-2xl py-6 shadow-2xl">
            {/* Columna 1 (Convocatòria activa 1) */}
            <div className="md:border-r md:border-slate-800/60 px-6 flex flex-col justify-center">
              <span className="text-2xl sm:text-3xl font-black text-[#10b981] block tracking-tight">
                Més de 1.600+ Places
              </span>
              <span className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium block">
                Nova promoció oficial del cos
              </span>
            </div>
            {/* Columna 2 (Convocatòria activa 2) */}
            <div className="px-6 flex flex-col justify-center">
              <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">
                Concurs Obert i Actiu
              </span>
              <span className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium block">
                Inscripcions i actualització de temari segons el DOGC
              </span>
            </div>
          </div>

          {/* 3. BLOCS INFERIORS (Graella gran de 2 columnes segons imatge de l'esquema) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full mx-auto mt-4 text-left">
            {/* TARGETA ESQUERRA ("Què ofereix ser Mosso d'Esquadra") */}
            <div className="bg-[#0a1220]/60 border border-slate-800/80 p-6 sm:p-8 rounded-xl hover:border-emerald-500/20 transition-all duration-300 shadow-xl shadow-black/40">
              <h3 className="text-[#FFDF00] font-black tracking-wider text-xs uppercase mb-6 flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <span className="text-sm">⭐</span> AVANTATGES DEL COS
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0 select-none mt-0.5">✓</span>
                  <p>
                    <strong className="text-white font-extrabold mr-1">Retribució competitiva:</strong>
                    Sou base excel·lent des de l'ingrés (uns 2.800€ bruts aprox. segons destinació).
                  </p>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0 select-none mt-0.5">✓</span>
                  <p>
                    <strong className="text-white font-extrabold mr-1">Estabilitat laboral absoluta:</strong>
                    Plaça de funcionari de carrera del grup C1 de la Generalitat amb caràcter indefinit.
                  </p>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0 select-none mt-0.5">✓</span>
                  <p>
                    <strong className="text-white font-extrabold mr-1">Flexibilitat de quadrants:</strong>
                    Horaris organitzats per a una conciliació òptima de la vida personal i laboral.
                  </p>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0 select-none mt-0.5">✓</span>
                  <p>
                    <strong className="text-white font-extrabold mr-1">Progrés professional:</strong>
                    Àmplies oportunitats de promoció interna, ascensos i especialització en branques del cos.
                  </p>
                </li>
              </ul>
            </div>

            {/* TARGETA DRETA ("Requisits d'Accés") */}
            <div className="bg-[#0a1220]/60 border border-slate-800/80 p-6 sm:p-8 rounded-xl hover:border-emerald-500/20 transition-all duration-300 shadow-xl shadow-black/40">
              <h3 className="text-[#FFDF00] font-black tracking-wider text-xs uppercase mb-6 flex items-center gap-2 border-b border-slate-800/60 pb-3">
                <span className="text-sm">📋</span> REQUISITS OBLIGATORIS
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0 select-none mt-0.5">✓</span>
                  <p>
                    <strong className="text-white font-extrabold mr-1">Titulació mínima:</strong>
                    Estar en possessió del títol de Batxillerat, Cicle Formatiu (CFGM) o un nivell equivalent.
                  </p>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0 select-none mt-0.5">✓</span>
                  <p>
                    <strong className="text-white font-extrabold mr-1">Edat i nacionalitat:</strong>
                    Tenir la nacionalitat espanyola i haver complert els 18 anys d'edat.
                  </p>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0 select-none mt-0.5">✓</span>
                  <p>
                    <strong className="text-white font-extrabold mr-1">Permisos de conduir:</strong>
                    Posseir el permís de la classe B en vigor abans de finalitzar el termini d'inscripció.
                  </p>
                </li>
                <li className="flex items-start gap-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0 select-none mt-0.5">✓</span>
                  <p>
                    <strong className="text-white font-extrabold mr-1">Aptitud legal i penal:</strong>
                    Mancar d'antecedents penals i no tenir cap inhabilitació oficial en l'administració.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* 4. BOTONS D'ACCIÓ */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-3xl mx-auto">
            {/* Botó de Conversió del Campus */}
            <Link
              to="/?marketing=true"
              className="px-10 py-4 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-[#10b981] text-white rounded-xl font-black italic uppercase tracking-wider text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all text-center shadow-xl shadow-blue-900/20 whitespace-nowrap"
            >
              COMENÇAR A ESTUDIAR ARA
            </Link>
            
            {onTornar ? (
              <button
                onClick={onTornar}
                className="px-10 py-4 w-full sm:w-auto border border-[#1e293b] hover:border-[#FFDF00]/40 text-slate-300 hover:text-white rounded-xl font-black italic uppercase tracking-wider text-xs sm:text-sm transition-all text-center cursor-pointer bg-transparent whitespace-nowrap"
              >
                Explorar altres Cossos
              </button>
            ) : (
              <Link
                to="/"
                className="px-10 py-4 w-full sm:w-auto border border-[#1e293b] hover:border-[#FFDF00]/40 text-slate-300 hover:text-white rounded-xl font-black italic uppercase tracking-wider text-xs sm:text-sm transition-all text-center whitespace-nowrap"
              >
                Explorar altres Cossos
              </Link>
            )}
          </div>
        </motion.div>
      </main>

      {/* Explicació per a no-programadors: Tanquem aquí el contenidor de fons d'imatge superior (mossa ISPC) perquè no afecti les seccions del final. */}
      </div>

      {/* ZONA TOTALMENT PERSONALITZABLE I DE PRESTIGI: PER QUÈ ESTUDIAR AMB OPOSICAT */}
      {/* Explicació per a no-programadors:
          Aquesta secció presenta la llista de beneficis en 4 columnes, però ara en un disseny molt més comprimit, compacte i minimalista de perfil baix.
          Cada columna organitza les seves dades en línia horitzontal contínua (flex-row sense salt de línia vertical), reduint els espais interiors (paddings) 
          i l'alçada total de les targetes. Cada vora simula una brillantor (glow) estilitzada amb el color d'accent. */}
      <section 
        id="perque-nosaltres" 
        className="w-full py-14 px-4 sm:px-6 md:px-8 border-t border-b border-[#111e36] bg-[#020813] text-center relative z-20 select-none"
      >
        <div className="max-w-7xl mx-auto w-full">
          
          {/* TÍTOL DE LA SECCIÓ (EN MAJÚSCULES, CENTRAT I EN LLETRA BLANCA/NEGRETA) */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-white mb-3 italic font-sans">
            PER QUÈ ESTUDIAR AMB OPOSICAT?
          </h2>
          
          {/* SUBTÍTOL DE LA SECCIÓ (CENTRAT, LLETRA MÉS PETITA I DE COLOR GRIS CLAR) */}
          <p className="text-slate-400 text-xs sm:text-[13px] max-w-2xl mx-auto mb-10 font-sans font-medium leading-relaxed">
            El grup d’OposiCAT ens hem centrat en el desenvolupament de programari (software) per tal de donar la màxima rendibilitat al teu temps.
          </p>
 
          {/* DISSENY RESPONSIVE DE 4 TARGETES (COLUMNS) DISPOSADES EN FILA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
            
            {/* Columna 1 (PROVA TEÒRICA): Verd neó / Verd menta brillant */}
            {/* Explicació per a no-programadors: 
                Disseny compacte i estilitzat on el check i el títol estan en línia amb la descripció per estalviar espai vertical. 
                S'utilitza una lletra petita, prima i de color suau per a una lectura ràpida. */}
            <div 
              style={{
                borderColor: 'rgba(16, 185, 129, 0.12)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.01)',
              }}
              className="bg-[#0c1424]/95 border border-slate-850 rounded-2xl p-4 sm:p-5 hover:border-emerald-500/35 transition-all duration-300 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                <h3 className="text-emerald-400 font-extrabold text-xs sm:text-[13px] uppercase tracking-wider font-sans">
                  PROVA TEÒRICA
                </h3>
                <span className="text-[10px] text-emerald-500/50 uppercase font-mono tracking-tight">Fase 1</span>
              </div>
 
              <div className="flex flex-col gap-2">
                {/* Item 1 */}
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-emerald-400 font-semibold mr-1">Temari oficial centralitzat:</strong>
                    Accés permanent i garantit a tot el temari digital actualitzat.
                  </p>
                </div>
 
                {/* Item 2 */}
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-emerald-400 font-semibold mr-1">Eines d'estudi avançades:</strong>
                    Subratllat interactiu, resums executius i gestor de conceptes.
                  </p>
                </div>
 
                {/* Item 3 */}
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-emerald-400 font-semibold mr-1">Simulacres i històric:</strong>
                    Exàmens oficials i simulacres inèdits en format interactiu.
                  </p>
                </div>
 
                {/* Item 4 */}
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-emerald-400 font-semibold mr-1">Sessions en directe i prèmium:</strong>
                    Classes setmanals síncrones i biblioteca sota demanda.
                  </p>
                </div>
              </div>
            </div>
 
            {/* Columna 2 (PROVA FÍSICA): Groc daurat / Groc neó */}
            {/* Explicació per a no-programadors: 
                Columna de color groc daurat per destacar les preparacions físiques, utilitzant el mateix disseny reduït de tipus horitzontal. */}
            <div 
              style={{
                borderColor: 'rgba(234, 179, 8, 0.12)',
                boxShadow: '0 0 20px rgba(234, 179, 8, 0.01)',
              }}
              className="bg-[#0c1424]/95 border border-slate-850 rounded-2xl p-4 sm:p-5 hover:border-yellow-500/35 transition-all duration-300 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                <h3 className="text-yellow-400 font-extrabold text-xs sm:text-[13px] uppercase tracking-wider font-sans">
                  PROVA FÍSICA
                </h3>
                <span className="text-[10px] text-yellow-500/50 uppercase font-mono tracking-tight">Fase 2</span>
              </div>
 
              <div className="flex flex-col gap-2">
                {/* Item 1 */}
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-yellow-400 font-semibold mr-1">Preparació biomecànica:</strong>
                    Sessions pràctiques per optimitzar cada grup muscular de la prova.
                  </p>
                </div>
 
                {/* Item 2 */}
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-yellow-400 font-semibold mr-1">Assessorament nutricional:</strong>
                    Planificació alimentària personalitzada vinculada al teu entrenament.
                  </p>
                </div>
 
                {/* Item 3 */}
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-yellow-400 font-semibold mr-1">Simulació cronometrada:</strong>
                    Cronòmetres exclusius que calculen la teva nota oficial automàticament.
                  </p>
                </div>
 
                {/* Item 4 */}
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-yellow-400 font-semibold mr-1">Planificació esportiva:</strong>
                    Rutines i entrenaments setmanals detallats per a una progressió òptima.
                  </p>
                </div>
              </div>
            </div>
 
            {/* Columna 3 (PROVA PSICOPROFESSIONAL): Rosa fúcsia / Rosa neó */}
            {/* Explicació per a no-programadors: 
                Disseny de color rosa neó altament discret, optimitzat per mantenir en una línia tota la mètrica d'avaluació. */}
            <div 
              style={{
                borderColor: 'rgba(236, 72, 153, 0.12)',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.01)',
              }}
              className="bg-[#0c1424]/95 border border-slate-850 rounded-2xl p-4 sm:p-5 hover:border-pink-500/35 transition-all duration-300 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                <h3 className="text-pink-400 font-extrabold text-xs sm:text-[13px] uppercase tracking-wider font-sans">
                  PROVA PSICOPROFESSIONAL
                </h3>
                <span className="text-[10px] text-pink-500/50 uppercase font-mono tracking-tight">Fase 3</span>
              </div>
 
              <div className="flex flex-col gap-2">
                {/* Item 1 */}
                <div className="flex items-start gap-2">
                  <span className="text-pink-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-pink-400 font-semibold mr-1">Enfocament de psicotècnics:</strong>
                    Metodologies d'anàlisi clares per afrontar amb èxit cada aptitud.
                  </p>
                </div>
 
                {/* Item 2 */}
                <div className="flex items-start gap-2">
                  <span className="text-pink-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-pink-400 font-semibold mr-1">Avaluació de biodades:</strong>
                    Qüestionaris de dades biogràfiques dissenyats per psicòlegs en actiu.
                  </p>
                </div>
 
                {/* Item 3 */}
                <div className="flex items-start gap-2">
                  <span className="text-pink-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-pink-400 font-semibold mr-1">Mentoria personalitzada:</strong>
                    Sessions de consultoria individuals amb experts per perfilar el teu biodada al 100%.
                  </p>
                </div>
 
                {/* Item 4 */}
                <div className="flex items-start gap-2">
                  <span className="text-pink-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-pink-400 font-semibold mr-1">Simulació d'entrevistes:</strong>
                    Més de 129 preguntes crucials d'impacte en convocatòries reals.
                  </p>
                </div>
              </div>
            </div>
 
            {/* Columna 4 (COMUNITAT I MOTIVACIÓ): Blau elèctric / Cian brillant */}
            {/* Explicació per a no-programadors: 
                Mètrica final de cohesió social de color blau brillant per tancar la secció amb l'alçada perfectament continguda de la graella. */}
            <div 
              style={{
                borderColor: 'rgba(6, 182, 212, 0.12)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.01)',
              }}
              className="bg-[#0c1424]/95 border border-slate-850 rounded-2xl p-4 sm:p-5 hover:border-cyan-500/35 transition-all duration-300 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                <h3 className="text-cyan-400 font-extrabold text-xs sm:text-[13px] uppercase tracking-wider font-sans">
                  COMUNITAT I MOTIVACIÓ
                </h3>
                <span className="text-[10px] text-cyan-500/50 uppercase font-mono tracking-tight">Comunitat</span>
              </div>
 
              <div className="flex flex-col gap-2">
                {/* Item 1 */}
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-cyan-400 font-semibold mr-1">Gamificació i premis:</strong>
                    Sistema de recompenses constants segons els teus objectius assolits.
                  </p>
                </div>
 
                {/* Item 2 */}
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-cyan-400 font-semibold mr-1">Rànquings interactius:</strong>
                    Mesura el teu nivell de preparació en temps real amb la comunitat.
                  </p>
                </div>
 
                {/* Item 3 */}
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-cyan-400 font-semibold mr-1">Xats i comunitat activa:</strong>
                    Sales de conversa temàtiques per fer networking amb altres opositors.
                  </p>
                </div>
 
                {/* Item 4 */}
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-black text-xs select-none shrink-0 mt-0.5">✓</span>
                  <p className="text-slate-300 text-xs sm:text-[12.5px] leading-relaxed">
                    <strong className="text-cyan-400 font-semibold mr-1">Alertes d'interès i descomptes:</strong>
                    Notificacions intel·ligents d'avisos clau i promocions exclusives.
                  </p>
                </div>
              </div>
            </div>
 
          </div>
        </div>
      </section>

      {/* SECCIÓ ADICIONAL DETALLADA: PROVA TEÒRICA */}
      {/* Explicació per a no-programadors:
          Aquesta nova secció representa l'esquema demanat: un títol i subtítol a dalt, una imatge gran visible a l'esquerra sense 
          contenidors complexos o "caixes" a sobre, un text explicatiu al costat dret basat en el text de farcit, i 5 botons d'acció exclusius i interactius a baix.
          Ara s'actualitza dinàmicament en fer clic a cadascun dels botons. */}
      <section 
        id="detall-prova-teorica" 
        className="w-full py-20 px-4 sm:px-6 md:px-8 border-b border-[#111e36] bg-[#020813] relative z-20 select-none overflow-hidden"
      >
        {/* Explicació per a no-programadors: Hem reduït el desenfocament (blur) de la imatge de fons de 8px a 3.5px perquè es vegi una mica més nítida i definida, tal com ens demana l'usuari. */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img 
            src={FonsFPImage} 
            alt="Fons de pantalla decoratiu de la Prova Teòrica" 
            className="w-full h-full object-cover opacity-15 blur-[3.5px] scale-105"
          />
          {/* Un subtil degradat fosc per integrar perfectament la imatge dins del disseny d'alt contrast d'OposiCAT */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020813]/60 via-[#020813]/30 to-[#020813]/60" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full z-10">
          
          {/* 1. TÍTOL I SUBTÍTOL DE LA SECCIÓ (A DALT DE TOT, CENTRATS) */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-emerald-400 italic font-sans">
              PROVA TEÒRICA
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mt-3 font-sans font-medium">
              Explora les eines d'estudi digital d'última generació que t'ajudaran a dominar tots els temes de la convocatòria de Mossos d'Esquadra.
            </p>
          </div>

          {/* 2. DISSENY CENTRAL: IMATGE GRAN A L'ESQUERRA I TEXT AL COSTAT DRET AMB FLETXES DE NAVEGACIÓ */}
          {/* Explicació per a no-programadors: Hem habilitat un sistema de fletxes interactives que envolten la imatge i el text explicatiu. 
              Això permet a l'alumne canviar ràpidament entre els cinc temes de forma seqüencial sense haver d'anar necessàriament a la botonera de sota. */}
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 mb-20 px-10 sm:px-14 lg:px-12">
            
            {/* Fletxa de canvi de mòdul a l'esquerra (Anterior) */}
            <button 
              onClick={anarAnteriorTeorica}
              className="absolute left-0 xl:-left-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full border border-emerald-500/20 bg-[#020813]/90 text-emerald-400 hover:bg-emerald-400 hover:text-black hover:border-emerald-400 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-emerald-900/10 cursor-pointer flex items-center justify-center"
              aria-label="Mòdul anterior"
            >
              <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Explicació per a no-programadors: Hem eliminat el color de fons blau-fosc del contenidor d'imatges ('bg-transparent') per fer-lo invisible, mantenint només la foto per a un aspecte més net. Al clicar, s'obre el zoom ampliat. */}
            <div className="w-full lg:w-[58%] aspect-[4/3] sm:aspect-[1.41] flex justify-center items-center overflow-hidden rounded-3xl border border-transparent bg-transparent select-none relative">
              <motion.img 
                key={indexModulActiu}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={modulsTeorica[indexModulActiu].imatge} 
                alt={`${modulsTeorica[indexModulActiu].titol} - OposiCAT`} 
                className="w-full h-full object-contain rounded-3xl hover:scale-[1.22] cursor-zoom-in transition-transform duration-500 ease-out"
                onClick={() => setLightboxData({ images: modulsTeorica.map(m => m.imatge), index: indexModulActiu })}
              />
            </div>

            {/* TEXT EXPLICATIU AL COSTAT DRET */}
            {/* Explicació per a no-programadors: El bloc de contingut amb els textos dinamitzats segons l'element actiu. */}
            <div className="w-full lg:w-[42%] text-left space-y-6">
              <motion.div
                key={indexModulActiu}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <span className="inline-block mb-3 text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {modulsTeorica[indexModulActiu].etiqueta}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {modulsTeorica[indexModulActiu].titol}
                </h3>
                {/* Explicació per a no-programadors: Si tenim els punts clau de la secció (com el Temari), els pintem un a un amb una icona de check i el seu text ressaltat en verd menta. En cas contrari, es mostra el paràgraf d'explicació estàndard. */}
                {modulsTeorica[indexModulActiu].puntsClau ? (
                  <ul className="space-y-4">
                    {modulsTeorica[indexModulActiu].puntsClau.map((punt, idxPunt) => (
                      <li key={idxPunt} className="flex items-start gap-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
                        <span className="text-emerald-400 font-extrabold text-sm sm:text-base shrink-0 select-none">✓</span>
                        <p>
                          <strong className="text-emerald-400 font-extrabold mr-1">{punt.boldText}</strong>
                          {punt.normalText}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {modulsTeorica[indexModulActiu].descripcio}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Fletxa de canvi de mòdul a la dreta (Següent) */}
            <button 
              onClick={anarSeguentTeorica}
              className="absolute right-0 xl:-left-auto xl:-right-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full border border-emerald-500/20 bg-[#020813]/90 text-emerald-400 hover:bg-emerald-400 hover:text-black hover:border-emerald-400 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-emerald-900/10 cursor-pointer flex items-center justify-center"
              aria-label="Mòdul següent"
            >
              <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

          </div>

          {/* Explicació per a no-programadors: Text indicant la sincronització en temps real entre diferents formats d'OposiCAT centrat damunt de la línia separadora. */}
          <div className="text-center mb-8 px-4">
            <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-3xl mx-auto">
              Totes les estadístiques i el progrés es sincronitzen en temps real entre l'APP per a smartphone (iOS i Android) i la WEB.
            </p>
          </div>

          {/* 3. TÍTOL DELS 5 BOTONS I LA SEVA ESTRUCTURA A BAIX DE TOT */}
          <div className="pt-8 border-t border-slate-900">
            <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs sm:text-sm text-center mb-8">
              MÒDULS DE LA PROVA TEÒRICA DISPONIBLES AL CAMPUS
            </h4>

            {/* ESTRUCTURA AMB ELS 5 BOTONS PROPORCIONALS DE MIDA IDÈNTICA I SENSE EMOTICONES */}
            {/* Explicació per a no-programadors: Fem servir una barra tipus graella (grid de 5 columnes) 
                perquè cadascun dels botons tingui exactament la message mida i proporció, eliminant completament les icones per netejar la vista. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {modulsTeorica.map((modul, idx) => {
                const esActiu = indexModulActiu === idx;
                return (
                  <button 
                    key={idx}
                    onClick={() => setIndexModulActiu(idx)}
                    className={`py-3.5 px-3 w-full rounded-xl border transition-all duration-200 text-center active:scale-95 flex items-center justify-center font-bold text-[11px] sm:text-xs uppercase tracking-wider ${
                      esActiu 
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md shadow-emerald-950/40 font-black' 
                        : 'border-slate-800 bg-[#0c1424]/40 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-white'
                    }`}
                  >
                    {modul.botoText}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓ ADICIONAL DETALLADA: PROVA FÍSICA */}
      {/* Explicació per a no-programadors:
          Aquesta nova secció representa l'esquema de la Prova Física, configurada ara amb un total de 9 mòduls d'aprenentatge.
          Cadascun canvia el títol, els conceptes clau i el mostrador d'imatges a la dreta emprant les línies F-0.png fins a F-8.png. */}
      <section 
        id="detall-prova-fisica" 
        className="w-full py-20 px-4 sm:px-6 md:px-8 border-b border-[#111e36] bg-[#020813] relative z-20 select-none overflow-hidden"
      >
        {/* Explicació per a no-programadors: Aquest bloc afegeix la imatge PF.png sota el contingut (z-0) amb un efecte de desenfocament o blur del 3% (equivalent a 3px en resolució de pantalla), suavitzant de forma bonica els contorns perquè contrasti genial amb el text blanc o groc. */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img 
            src={FonsPFImage} 
            alt="Fons de pantalla decoratiu de la Prova Física" 
            className="w-full h-full object-cover opacity-15 blur-[3px] scale-105"
          />
          {/* Explicació per a no-programadors: Capa fosca de degradat que atenua la brillantor de la imatge de fondo perquè els colors grocs de la prova física destaquin molt més d'acord amb els requisits. */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020813]/60 via-[#020813]/30 to-[#020813]/60" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full z-10">
          
          {/* 1. TÍTOL I SUBTÍTOL DE LA SECCIÓ (A DALT DE TOT, CENTRATS) */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-yellow-400 italic font-sans">
              PROVA FÍSICA
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mt-3 font-sans font-medium">
              Explora les eines de preparació física d'última generació que t'ajudaran a dominar les proves físiques de la convocatòria de Mossos d'Esquadra.
            </p>
          </div>

          {/* 2. DISSENY CENTRAL: TEXT A L'ESQUERRA I IMATGE COM A FOTOS AL COSTAT DRET AMB FLETXES DE NAVEGACIÓ */}
          {/* Explicació per a no-programadors: Hem habilitat de forma idèntica un sistema de fletxes interactives que envolten la imatge i el text de la prova física. 
              Això permet a l'estudiant canviar de mòdul físic cíclicament. Hem utilitzat la classe 'lg:flex-row-reverse' per invertir l'ordre i col·locar el text a l'esquerra i la imatge a la dreta. */}
          <div className="relative flex flex-col lg:flex-row-reverse items-center justify-between gap-12 lg:gap-16 mb-20 px-10 sm:px-14 lg:px-12">
            
            {/* Fletxa de canvi de mòdul a l'esquerra (Anterior) */}
            <button 
              onClick={anarAnteriorFisica}
              className="absolute left-0 xl:-left-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full border border-yellow-500/20 bg-[#020813]/90 text-yellow-400 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-yellow-900/10 cursor-pointer flex items-center justify-center"
              aria-label="Mòdul anterior"
            >
              <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Explicació per a no-programadors: Hem canviat el fons de color a transparent i eliminat la vora perquè les fotos es vegin més integrades. Al fer-hi clic, s'amplia amb zoom súper elegant. */}
            <div className="w-full lg:w-[58%] aspect-[4/3] sm:aspect-[1.41] flex justify-center items-center overflow-hidden rounded-3xl border border-transparent bg-transparent select-none relative">
              <motion.img 
                key={indexModulFisicaActiu}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={modulsFisica[indexModulFisicaActiu].imatge} 
                alt={`${modulsFisica[indexModulFisicaActiu].titol} - OposiCAT`} 
                className="w-full h-full object-contain rounded-3xl hover:scale-[1.22] cursor-zoom-in transition-transform duration-500 ease-out"
                onClick={() => setLightboxData({ images: modulsFisica.map(m => m.imatge), index: indexModulFisicaActiu })}
              />
            </div>

            {/* TEXT EXPLICATIU AL COSTAT DRET */}
            <div className="w-full lg:w-[42%] text-left space-y-6">
              <motion.div
                key={indexModulFisicaActiu}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <span className="inline-block mb-3 text-yellow-400 text-xs font-bold uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                  {modulsFisica[indexModulFisicaActiu].etiqueta}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {modulsFisica[indexModulFisicaActiu].titol}
                </h3>
                {modulsFisica[indexModulFisicaActiu].puntsClau ? (
                  <ul className="space-y-4">
                    {modulsFisica[indexModulFisicaActiu].puntsClau.map((punt, idxPunt) => (
                      <li key={idxPunt} className="flex items-start gap-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
                        <span className="text-yellow-400 font-extrabold text-sm sm:text-base shrink-0 select-none">✓</span>
                        <p>
                          <strong className="text-yellow-400 font-extrabold mr-1">{punt.boldText}</strong>
                          {punt.normalText}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {modulsFisica[indexModulFisicaActiu].descripcio}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Fletxa de canvi de mòdul a la dreta (Següent) */}
            <button 
              onClick={anarSeguentFisica}
              className="absolute right-0 xl:-left-auto xl:-right-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full border border-yellow-500/20 bg-[#020813]/90 text-yellow-400 hover:bg-yellow-400 hover:text-black hover:border-yellow-400 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-yellow-900/10 cursor-pointer flex items-center justify-center"
              aria-label="Mòdul següent"
            >
              <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

          </div>

          {/* Explicació per a no-programadors: Text indicant la sincronització en temps real entre diferents formats d'OposiCAT centrat damunt de la línia separadora. */}
          <div className="text-center mb-8 px-4">
            <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-3xl mx-auto">
              Totes les estadístiques i el progrés es sincronitzen en temps real entre l'APP per a smartphone (iOS i Android) i la WEB.
            </p>
          </div>

          {/* 3. TÍTOL DELS 9 BOTONS I LA SEVA ESTRUCTURA A BAIX DE TOT */}
          <div className="pt-8 border-t border-slate-900">
            <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs sm:text-sm text-center mb-8">
              MÒDULS DE LA PROVA FÍSICA DISPONIBLES AL CAMPUS
            </h4>

            {/* BOTONS PROPORCIONALS DE MIDA IDÈNTICA I SENSE EMOTICONES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 max-w-7xl mx-auto">
              {modulsFisica.map((modul, idx) => {
                const esActiu = indexModulFisicaActiu === idx;
                return (
                  <button 
                    key={idx}
                    onClick={() => setIndexModulFisicaActiu(idx)}
                    className={`py-3.5 px-3 w-full rounded-xl border transition-all duration-200 text-center active:scale-95 flex items-center justify-center font-bold text-[11px] sm:text-xs uppercase tracking-wider ${
                      esActiu 
                        ? 'border-yellow-500 bg-yellow-500/10 text-white shadow-md shadow-yellow-950/40 font-black' 
                        : 'border-slate-800 bg-[#0c1424]/40 text-slate-300 hover:bg-yellow-500/10 hover:border-yellow-500/40 hover:text-white'
                    }`}
                  >
                    {modul.botoText}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓ ADICIONAL DETALLADA: PROVA PSICOPROFESSIONAL */}
      {/* Explicació per a no-programadors:
          Aquesta secció representa el detall de la Prova Psicoprofessional, amb la mateixa estructura dinàmica d'alta interactivitat.
          L'alumne pot canviar de mòdul utilitzant les fletxes o els botons anteriors/següents. */}
      <section 
        id="detall-prova-psicoprofessional" 
        className="w-full py-20 px-4 sm:px-6 md:px-8 border-b border-[#111e36] bg-[#020813] relative z-20 select-none overflow-hidden"
      >
        {/* Explicació per a no-programadors: Aquest bloc afegeix la imatge PP.png sota el contingut (z-0) amb un efecte de desenfocament o blur del 3% (equivalent a 3px en resolució de pantalla), suavitzant de forma bonica els contorns de fons sense tapar la llegibilitat dels textos d'acord amb la petició de l'usuari. */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img 
            src={FonsPPImage} 
            alt="Fons de pantalla decoratiu de la Prova Psicoprofessional" 
            className="w-full h-full object-cover opacity-15 blur-[3px] scale-105"
          />
          {/* Explicació per a no-programadors: Capa fosca de degradat que atenua la brillantor de la imatge de fons perquè els colors rosa de la prova psicoprofessional destaquin molt d'acord amb els requisits. */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020813]/60 via-[#020813]/30 to-[#020813]/60" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full z-10">
          
          {/* 1. TÍTOL I SUBTÍTOL DE LA SECCIÓ (A DALT DE TOT, CENTRATS) */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-pink-400 italic font-sans">
              PROVA PSICOPROFESSIONAL
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mt-3 font-sans font-medium">
              Desenvolupa les teves competències de perfil de personalitat i valors professionals requerides per assolir l'èxit en els exercici de selecció.
            </p>
          </div>

          {/* 2. DISSENY CENTRAL: IMATGE GRAN A L'ESQUERRA I TEXT AL COSTAT DRET AMB FLETXES DE NAVEGACIÓ */}
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 mb-20 px-10 sm:px-14 lg:px-12">
            
            {/* Fletxa de canvi de mòdul a l'esquerra (Anterior) */}
            <button 
              onClick={anarAnteriorPsicoprofessional}
              className="absolute left-0 xl:-left-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full border border-pink-500/20 bg-[#020813]/90 text-pink-400 hover:bg-pink-400 hover:text-black hover:border-pink-400 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-pink-900/10 cursor-pointer flex items-center justify-center"
              aria-label="Mòdul anterior"
            >
              <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Explicació per a no-programadors: Modifiquem el fons aquí també perquè retingui la mateixa transparència estètica optimitzada sense caixes de fons. Al fer clic, visualitza l'ampliació super zoom. */}
            <div className="w-full lg:w-[58%] aspect-[4/3] sm:aspect-[1.41] flex justify-center items-center overflow-hidden rounded-3xl border border-transparent bg-transparent select-none relative">
              <motion.img 
                key={indexModulPsicoprofessionalActiu}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={modulsPsicoprofessional[indexModulPsicoprofessionalActiu].imatge} 
                alt={`${modulsPsicoprofessional[indexModulPsicoprofessionalActiu].titol} - OposiCAT`} 
                className="w-full h-full object-contain rounded-3xl hover:scale-[1.22] cursor-zoom-in transition-transform duration-500 ease-out"
                onClick={() => setLightboxData({ images: modulsPsicoprofessional.map(m => m.imatge), index: indexModulPsicoprofessionalActiu })}
              />
            </div>

            {/* TEXT EXPLICATIU AL COSTAT DRET */}
            <div className="w-full lg:w-[42%] text-left space-y-6">
              <motion.div
                key={indexModulPsicoprofessionalActiu}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <span className="inline-block mb-3 text-pink-400 text-xs font-bold uppercase tracking-widest bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                  {modulsPsicoprofessional[indexModulPsicoprofessionalActiu].etiqueta}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {modulsPsicoprofessional[indexModulPsicoprofessionalActiu].titol}
                </h3>
                {modulsPsicoprofessional[indexModulPsicoprofessionalActiu].puntsClau ? (
                  <ul className="space-y-4">
                    {modulsPsicoprofessional[indexModulPsicoprofessionalActiu].puntsClau.map((punt, idxPunt) => (
                      <li key={idxPunt} className="flex items-start gap-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
                        <span className="text-pink-400 font-extrabold text-sm sm:text-base shrink-0 select-none">✓</span>
                        <p>
                          <strong className="text-pink-400 font-extrabold mr-1">{punt.boldText}</strong>
                          {punt.normalText}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {modulsPsicoprofessional[indexModulPsicoprofessionalActiu].descripcio}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Fletxa de canvi de mòdul a la dreta (Següent) */}
            <button 
              onClick={anarSeguentPsicoprofessional}
              className="absolute right-0 xl:-left-auto xl:-right-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full border border-pink-500/20 bg-[#020813]/90 text-pink-400 hover:bg-pink-400 hover:text-black hover:border-pink-400 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-pink-900/10 cursor-pointer flex items-center justify-center"
              aria-label="Mòdul següent"
            >
              <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

          </div>

          {/* Explicació per a no-programadors: Text indicant la sincronització en temps real entre diferents formats d'OposiCAT centrat damunt de la línia separadora. */}
          <div className="text-center mb-8 px-4">
            <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-3xl mx-auto">
              Totes les estadístiques i el progrés es sincronitzen en temps real entre l'APP per a smartphone (iOS i Android) i la WEB.
            </p>
          </div>

          {/* 3. TÍTOL DELS 7 BOTONS I LA SEVA ESTRUCTURA A BAIX DE TOT */}
          <div className="pt-8 border-t border-slate-900">
            <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs sm:text-sm text-center mb-8">
              MÒDULS DE LA PROVA PSICOPROFESSIONAL DISPONIBLES AL CAMPUS
            </h4>

            {/* BOTONS PROPORCIONALS DE MIDA IDÈNTICA I SENSE EMOTICONES (DISSENY DE 7 COLUMNES PER A 7 BLOCS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 max-w-7xl mx-auto">
              {modulsPsicoprofessional.map((modul, idx) => {
                const esActiu = indexModulPsicoprofessionalActiu === idx;
                return (
                  <button 
                    key={idx}
                    onClick={() => setIndexModulPsicoprofessionalActiu(idx)}
                    className={`py-3.5 px-3 w-full rounded-xl border transition-all duration-200 text-center active:scale-95 flex items-center justify-center font-bold text-[11px] sm:text-xs uppercase tracking-wider ${
                      esActiu 
                        ? 'border-pink-500 bg-pink-500/10 text-white shadow-md shadow-pink-950/40 font-black' 
                        : 'border-slate-800 bg-[#0c1424]/40 text-slate-300 hover:bg-pink-500/10 hover:border-pink-500/40 hover:text-white'
                    }`}
                  >
                    {modul.botoText}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓ ADICIONAL DETALLADA: COMUNITAT I MOTIVACIÓ */}
      {/* Explicació per a no-programadors:
          Aquesta secció representa el bloc de Comunitat i Motivació amb un disseny interactiu i adaptatiu.
          Canvia de mòdul quan es clica cadascun dels botons inferiors o fletxes de navegació.
          Per demanat de l'usuari, s'inclou com a fons de pantalla la imatge XP1.png amb un filter blur de 3%. */}
      <section 
        id="detall-comunitat-motivacio" 
        className="w-full py-20 px-4 sm:px-6 md:px-8 border-b border-[#111e36] bg-[#020813] relative z-20 select-none overflow-hidden"
      >
        {/* Capa de fons de pantalla amb l'imatge XP1.png i blur del 3% (3px) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-color-dodge pointer-events-none"
          style={{ 
            backgroundImage: `url(${XPImage})`,
            filter: 'blur(3px)'
          }}
        />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          
          {/* 1. TÍTOL I SUBTÍTOL DE LA SECCIÓ (A DALT DE TOT, CENTRATS) */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-cyan-400 italic font-sans">
              COMUNITAT I MOTIVACIÓ
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mt-3 font-sans font-medium">
              Forma part d'una comunitat activa d'estudiants i preparadors que et mantindran motivat en cada pas del camí cap a la teva plaça.
            </p>
          </div>

          {/* 2. DISSENY CENTRAL: TEXT A L'ESQUERRA I IMATGE COM A FOTOS AL COSTAT DRET AMB FLETXES DE NAVEGACIÓ */}
          {/* Explicació per a no-programadors: En aquesta secció de Comunitat i Motivació hem demanat invertir l'ordre visual fent servir la propietat de Tailwind 'lg:flex-row-reverse'. Ara el text explicatiu es llegeix a la banda esquerra en ordinadors i la foto queda a la banda dreta. */}
          <div className="relative flex flex-col lg:flex-row-reverse items-center justify-between gap-12 lg:gap-16 mb-20 px-10 sm:px-14 lg:px-12">
            
            {/* Fletxa de canvi de mòdul a l'esquerra (Anterior) */}
            <button 
              onClick={anarAnteriorComunitat}
              className="absolute left-0 xl:-left-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full border border-cyan-500/20 bg-[#020813]/90 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-cyan-900/10 cursor-pointer flex items-center justify-center"
              aria-label="Mòdul anterior"
            >
              <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Explicació per a no-programadors: Modifiquem el fons a transparent en la darrera secció de Comunitat per homogeneïtzar la presentació visual dels elements gràfics. Al clicar-hi, pots fer zoom complet. */}
            <div className="w-full lg:w-[58%] aspect-[4/3] sm:aspect-[1.41] flex justify-center items-center overflow-hidden rounded-3xl border border-transparent bg-transparent select-none relative">
              <motion.img 
                key={indexModulComunitatActiu}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={modulsComunitat[indexModulComunitatActiu].imatge} 
                alt={`${modulsComunitat[indexModulComunitatActiu].titol} - OposiCAT`} 
                className="w-full h-full object-contain rounded-3xl hover:scale-[1.22] cursor-zoom-in transition-transform duration-500 ease-out"
                onClick={() => setLightboxData({ images: modulsComunitat.map(m => m.imatge), index: indexModulComunitatActiu })}
              />
            </div>

            {/* TEXT EXPLICATIU AL COSTAT DRET */}
            <div className="w-full lg:w-[42%] text-left space-y-6">
              <motion.div
                key={indexModulComunitatActiu}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <span className="inline-block mb-3 text-cyan-400 text-xs font-bold uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  {modulsComunitat[indexModulComunitatActiu].etiqueta}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {modulsComunitat[indexModulComunitatActiu].titol}
                </h3>
                {modulsComunitat[indexModulComunitatActiu].puntsClau ? (
                  <ul className="space-y-4">
                    {modulsComunitat[indexModulComunitatActiu].puntsClau.map((punt, idxPunt) => (
                      <li key={idxPunt} className="flex items-start gap-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
                        <span className="text-emerald-400 font-extrabold text-sm sm:text-base shrink-0 select-none">✓</span>
                        <p>
                          <strong className="text-cyan-400 font-extrabold mr-1">{punt.boldText}</strong>
                          {punt.normalText}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {modulsComunitat[indexModulComunitatActiu].descripcio}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Fletxa de canvi de mòdul a la dreta (Següent) */}
            <button 
              onClick={anarSeguentComunitat}
              className="absolute right-0 xl:-left-auto xl:-right-10 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full border border-cyan-500/20 bg-[#020813]/90 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 hover:scale-110 active:scale-90 transition-all duration-300 shadow-xl shadow-cyan-900/10 cursor-pointer flex items-center justify-center"
              aria-label="Mòdul següent"
            >
              <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

          </div>

          {/* Explicació per a no-programadors: Text indicant la sincronització en temps real entre diferents formats d'OposiCAT centrat damunt de la línia separadora. */}
          <div className="text-center mb-8 px-4">
            <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-3xl mx-auto">
              Totes les estadístiques i el progrés es sincronitzen en temps real entre l'APP per a smartphone (iOS i Android) i la WEB.
            </p>
          </div>

          {/* 3. TÍTOL DELS 6 BOTONS I LA SEVA ESTRUCTURA A BAIX DE TOT */}
          <div className="pt-8 border-t border-slate-900">
            <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs sm:text-sm text-center mb-8">
              MÒDULS DE COMUNITAT I MOTIVACIÓ DISPONIBLES AL CAMPUS
            </h4>

            {/* BOTONS PROPORCIONALS DE MIDA IDÈNTICA I SENSE EMOTICONES */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
              {modulsComunitat.map((modul, idx) => {
                const esActiu = indexModulComunitatActiu === idx;
                return (
                  <button 
                    key={idx}
                    onClick={() => setIndexModulComunitatActiu(idx)}
                    className={`py-3.5 px-3 w-full rounded-xl border transition-all duration-200 text-center active:scale-95 flex items-center justify-center font-bold text-[11px] sm:text-xs uppercase tracking-wider ${
                      esActiu 
                        ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-md shadow-cyan-950/40 font-black' 
                        : 'border-slate-800 bg-[#0c1424]/40 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-white'
                    }`}
                  >
                    {modul.botoText}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* SECCIÓ ADICIONAL DE PLANS I PREUS - TARIFES D'ACCÉS AL CAMPUS */}
      {/* Explicació per a no-programadors:
          Aquesta és la secció de plans de preus comprimida a la meitat d'alçada. 
          S'han reduït els marges, els espais de farcit i el diàmetre de les llistes perquè quedi perfectament compacte, elegant i fàcil de consultar d'un sol cop d'ull. */}
      <section 
        id="plans-preus-oposicat" 
        className="w-full py-10 px-4 sm:px-6 border-b border-[#111e36] bg-[#020617] relative z-20 select-none"
      >
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Títols de la secció de preus comprimits */}
          <div className="text-center mb-8">
            <span className="inline-block mb-1.5 text-amber-500 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/20">
               PLANS DE PREPARACIÓ ACADÈMICA
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white italic font-sans">
              MODALITATS D'INSCRIPCIÓ
            </h2>
            <p className="text-slate-400 text-xs max-w-xl mx-auto mt-1.5 font-sans font-medium leading-relaxed">
              Subscripcions flexibles adaptades al teu ritme de preparació. Sense matrícules, permanències ni costos extra.
            </p>
          </div>

          {/* Graella amb els 3 plans de preus en format ultra-compacte corregida per OposiCAT */}
          {/* Explicació per a no-programadors: Targetes de preu amb tres categories de pagament: Mensual, Trimestral i Anual.
              Es mostra una estructura transparent de característiques (amb checks ✓ i creus ✗) destacant en color daurat/ambre VIP el Pla Trimestral, que és el més recomanat per l'acadèmia. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
            
            {/* PLA 1: Mensual */}
            {/* Explicació per a no-programadors: Targeta minimalista i discreta per a subscripció mensual sense lligams. */}
            <div className="relative group flex flex-col justify-between py-5 px-6 rounded-2xl border border-slate-850 bg-[#070d19]/60 hover:border-slate-755 hover:bg-[#070d19]/80 transition-all duration-300">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Pla Mensual</h3>
                <p className="text-slate-400 text-[11px] mt-1 font-medium">Accés renovable mes a mes sense permanència.</p>
                
                {/* Preu */}
                <div className="my-3 flex items-baseline">
                  <span className="text-2xl sm:text-3xl font-black text-white">59,99€</span>
                  <span className="text-slate-400 text-xs font-semibold ml-1.5">/ mes</span>
                </div>

                <div className="border-t border-slate-800/85 pt-3">
                  <ul className="space-y-1.5 text-left text-slate-300 text-xs">
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-extrabold select-none shrink-0">✓</span>
                      <span>Temari oficial complet i actualitzat</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-extrabold select-none shrink-0">✓</span>
                      <span>Mòdul de test intel·ligent i estadístiques</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-extrabold select-none shrink-0">✓</span>
                      <span>Classes en directe i biblioteca de gravacions</span>
                    </li>
                    <li className="flex items-start gap-1.5 text-slate-500">
                      <span className="font-extrabold select-none shrink-0">✗</span>
                      <span className="line-through">Sense mòdul de dietes personalitzades</span>
                    </li>
                    <li className="flex items-start gap-1.5 text-slate-500">
                      <span className="font-extrabold select-none shrink-0">✗</span>
                      <span className="line-through">Sense sessions individuals de psicologia</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Botó directe en color blanc net molt discret */}
              <div className="mt-4 pt-3 border-t border-slate-800/40">
                <button className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer text-center">
                  COMENÇAR PROVA
                </button>
              </div>
            </div>

            {/* PLA 2: Trimestral (DISSENY DESTACAT AMB COLOR GOLD/AMBER VIP) */}
            {/* Explicació per a no-programadors: Targeta central molt vistosa, amb un marc daurat brullant per indicar que és el servei més comprat i complet. 
                S'actualitza el preu a 149,99€ demanat, incloent el subtext amb l'equivalència mensual aproximada. */}
            <div className="relative group flex flex-col justify-between py-5 px-6 rounded-2xl border-2 border-amber-500 bg-[#0c1a2d]/80 hover:bg-[#0c1a2d]/95 hover:border-amber-400 transition-all duration-300 shadow-xl shadow-amber-950/20">
              {/* Etiqueta flotant de Recomanat amb fons fosquitzat amb el text en color daurat/ambre fort */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="text-amber-400 font-extrabold text-[9px] uppercase tracking-widest bg-slate-950/90 px-3 py-0.5 rounded-full shadow-md border border-amber-500/50 text-center block whitespace-nowrap">
                  MÉS RECOMANAT ★
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-amber-400 tracking-tight mt-1">Pla Trimestral</h3>
                <p className="text-slate-300 text-[11px] mt-1 font-medium">La modalitat més triada pels aspirants.</p>
                
                {/* Preu */}
                <div className="my-3">
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-black text-white">149,99€</span>
                    <span className="text-slate-400 text-xs font-semibold ml-1.5">/ 3 mesos</span>
                  </div>
                  <p className="text-amber-500 text-[9px] font-bold mt-0.5 uppercase tracking-wide">
                    EQUIVAL A 49,99€/MES APROX.
                  </p>
                </div>

                <div className="border-t border-amber-500/20 pt-3">
                  <ul className="space-y-1.5 text-left text-slate-200 text-xs">
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-extrabold select-none shrink-0">✓</span>
                      <span>Tot el contingut del Pla Mensual inclòs</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-extrabold select-none shrink-0">✓</span>
                      <span>Planificació i seguiment de la preparació física</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-extrabold select-none shrink-0">✓</span>
                      <span>Simulacres de qüestionari biodata il·limitats</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-extrabold select-none shrink-0">✓</span>
                      <span>Planificació de dietes personalitzades a mida</span>
                    </li>
                    <li className="flex items-start gap-1.5 text-slate-400">
                      <span className="text-slate-500 font-bold select-none shrink-0">✗</span>
                      <span className="line-through text-slate-500">Sessions de psicologia individualitzades no incloses</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Botó principal amb degradat realçat d'ambre/daurat i ombra brillant */}
              <div className="mt-4 pt-3 border-t border-amber-500/10">
                <button className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-[11px] uppercase tracking-wider hover:from-amber-300 hover:to-yellow-400 transition-all duration-200 cursor-pointer text-center shadow-lg shadow-amber-500/20">
                  INICIAR SUBSCRIPCIÓ
                </button>
              </div>
            </div>

            {/* PLA 3: Pla Anual (Dreta) */}
            {/* Explicació per a no-programadors: Targeta tancada per a la preparació a llarg termini d'un any sencer, amb un botó buit per no treure-li el focus al del mig.
                S'actualitza el preu a 499,99€ demanat amb el subtext de l'aproximació mensual. */}
            <div className="relative group flex flex-col justify-between py-5 px-6 rounded-2xl border border-slate-800 bg-[#070d19]/60 hover:border-amber-500/30 hover:bg-[#070d19]/80 transition-all duration-300">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Pla Anual</h3>
                <p className="text-slate-400 text-[11px] mt-1 font-medium">Preparació integral fins al dia de l'examen oficial.</p>
                
                {/* Preu */}
                <div className="my-3">
                  <div className="flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-black text-white">499,99€</span>
                    <span className="text-slate-400 text-xs font-semibold ml-1.5">/ 12 mesos</span>
                  </div>
                  <p className="text-amber-500/80 text-[9px] font-bold mt-0.5 uppercase tracking-wide">
                    EQUIVAL A 39,99€/MES APROX.
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <ul className="space-y-1.5 text-left text-slate-300 text-xs">
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500/80 font-extrabold select-none shrink-0">✓</span>
                      <span>Tot el contingut del Pla Trimestral inclòs</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500/80 font-extrabold select-none shrink-0">✓</span>
                      <span>Accés complet il·limitat durant 12 mesos sense venciment</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500/80 font-extrabold select-none shrink-0">✓</span>
                      <span>Mòdul de preparació d'entrevistes i supòsits pràctics</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-amber-500/80 font-extrabold select-none shrink-0">✓</span>
                      <span>Inclou 1 sessió individual amb psicòleg (valorada en 69,99€)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Botó amb vora fina daurada, fons fosc i text daurat */}
              <div className="mt-4 pt-3 border-t border-slate-800/40">
                <button className="w-full py-2 px-4 rounded-xl border border-amber-500/40 bg-transparent text-amber-400 font-bold text-[11px] uppercase tracking-wider hover:bg-amber-500/10 hover:border-amber-400 transition-all duration-200 cursor-pointer text-center">
                  CONTRACTAR PLA ANUAL
                </button>
              </div>
            </div>

          </div>

          {/* Text legal o d'aclariment opcional sota les taules */}
          <div className="text-center mt-6 px-4">
            <p className="text-slate-500 text-[10px] font-sans max-w-2xl mx-auto">
              * La preparació d'entrevista presencial individualitzada amb psicòleg està subjecta a disponibilitat de calendaris de l'acadèmia. Recomanem formalitzar el registre setmanes abans de la publicació dels resultats.
            </p>
          </div>

        </div>
      </section>

      {/* 5. SECCIÓ PEU DE PÀGINA INTEGRAL (FOOTER) - OPOSICAT */}
      {/* Explicació per a no-programadors:
          Aquest peu de pàgina té un fons més fosc (quasi negre pur) que es separa clarament del fons de preus. Extreu dues seccions d'enllaços primaris en català per facilitar l'accés des de qualsevol pantalla, inclou el missatge de sincronització en temps real i l'avís de reservat el dret d'autor. */}
      <footer className="border-t border-slate-800/60 py-12 px-6 bg-[#02050a] relative z-20">
        <div className="max-w-7xl mx-auto w-full text-center space-y-8">
          
          {/* Enllaços legals i suport en columnes netes i minimalistes en pantalla gran, centrades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:max-w-xl mx-auto gap-8 sm:gap-4 pt-4 border-t border-slate-900/60 text-center">
            {/* Columna d'Enllaços Legals */}
            <div className="space-y-3">
              <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Enllaços legals</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200 text-xs block">
                    Avís Legal
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200 text-xs block">
                    Política de Privacitat
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200 text-xs block">
                    Política de Cookies
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna de Suport */}
            <div className="space-y-3">
              <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Suport</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200 text-xs block">
                    Contacte
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200 text-xs block">
                    Preguntes Freqüents (FAQ)
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors duration-200 text-xs block">
                    Suport Tècnic
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Drets d'autor a baix de tot */}
          <div className="pt-6 border-t border-slate-900/40">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              © 2026 OposiCAT. Tots els drets reservats. Preparació d'alt rendiment per a oposicions de Mossos d'Esquadra.
            </p>
          </div>

        </div>
      </footer>

      {/* EXPLICACIÓ PER A NO-PROGRAMADORS:
          Aquest és el visualitzador interactiu o Lightbox millorat per ampliar imatges en pantalla completa.
          Quan l'estudiant clica sobre qualsevol captura de pantalla, s'obre aquesta finestra elegant de fons fosc i borpós.
          A petició de l'usuari, s'ha afegit navegació completa:
          - Es pot anar a la imatge ANTERIOR o SEGÜENT de la llista clicant les fletxes flotants a banda i banda.
          - També funciona polsant les fletxes de direcció (esquerra/dreta) del teclat o la tecla Escape per tancar-lo.
          - Es mostra un comptador central a la part inferior per saber en quina captura ens trobem (Ex: 2 de 5). */}
      {lightboxData && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 select-none"
          onClick={() => setLightboxData(null)}
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center justify-center">
            
            {/* Botó de Tancar (A dalt a la dreta) */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setLightboxData(null);
              }}
              className="absolute -top-14 right-2 sm:right-0 bg-slate-900/90 border border-slate-700/80 hover:border-white text-white hover:text-[#FFDF00] w-10 h-10 rounded-full flex items-center justify-center text-lg font-black transition-all shadow-2xl z-[110] active:scale-95 cursor-pointer"
              title="Tancar (Esc)"
            >
              ✕
            </button>

            {/* Comptador superior discret */}
            <div className="absolute -top-12 left-4 text-xs font-semibold uppercase tracking-widest text-[#FFDF00]/90 bg-[#020813]/80 px-3 py-1 rounded-full border border-slate-800">
              Captura {lightboxData.index + 1} de {lightboxData.images.length}
            </div>

            {/* Contingut Central (Imatge + Fletxes de navegació flotants de gran mida) */}
            <div className="relative w-full flex items-center justify-center group" onClick={(e) => e.stopPropagation()}>
              
              {/* Fletxa Esquerra (Anterior) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxData(prev => {
                    if (!prev) return null;
                    const prevIndex = (prev.index - 1 + prev.images.length) % prev.images.length;
                    return { ...prev, index: prevIndex };
                  });
                }}
                className="absolute left-2 sm:-left-16 z-[110] p-3 rounded-full border border-slate-800 bg-[#020813]/90 text-slate-300 hover:text-[#FFDF00] hover:border-[#FFDF00]/30 hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-2xl"
                title="Anterior (Fletxa Esquerra)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Imatge Activa */}
              <img 
                src={lightboxData.images[lightboxData.index]} 
                alt="Visualització ampliada d'OposiCAT" 
                className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-slate-800/80 shadow-2xl transition-all duration-300"
              />

              {/* Fletxa Dreta (Següent) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxData(prev => {
                    if (!prev) return null;
                    const nextIndex = (prev.index + 1) % prev.images.length;
                    return { ...prev, index: nextIndex };
                  });
                }}
                className="absolute right-2 sm:-right-16 z-[110] p-3 rounded-full border border-slate-800 bg-[#020813]/90 text-slate-300 hover:text-[#FFDF00] hover:border-[#FFDF00]/30 hover:scale-110 active:scale-90 transition-all duration-200 cursor-pointer flex items-center justify-center shadow-2xl"
                title="Següent (Fletxa Dreta)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Llegenda explicativa de botons inferiors ràpids */}
            <div className="mt-6 flex flex-col items-center gap-2">
              {/* Informació d'ús del teclat de dreceres */}
              <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                💡 Tip: pots utilitzar les tecles <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">←</kbd> i <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">→</kbd> per navegar, o <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Esc</kbd> per tancar.
              </p>
              
              {/* Petits indicadors de posició */}
              <div className="flex gap-1.5 mt-2">
                {lightboxData.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxData(prev => prev ? { ...prev, index: i } : null)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      lightboxData.index === i ? "w-6 bg-[#FFDF00]" : "w-2 bg-slate-800 hover:bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
