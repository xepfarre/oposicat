import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { determinarRolSegonsEmail, tancarSessio, garantirFitxaPerfilFirestore } from '../../lib/authService';
import { TEMARI_DETALL } from '../../constants/temari';
import { CONTINGUT_TEMARI_TEXTS } from '../../constants/contingut_textos';
import WebWorkspacePCEstudiPersonal from './WebWorkspacePCEstudiPersonal';
import WebWorkspacePCTemariOficial from './WebWorkspacePCTemariOficial';
import WebWorkspacePCLectorOposimossos from './WebWorkspacePCLectorOposimossos';
import WebWorkspacePCTemariClassesPremium from './WebWorkspacePCTemariClassesPremium';
import WebWorkspacePCVideoOposimossos from './WebWorkspacePCVideoOposimossos';
import WebWorkspacePCClassesDirecte from './WebWorkspacePCClassesDirecte';
import WebWorkspacePCExamensOposimossos from './WebWorkspacePCExamensOposimossos';
import WebWorkspacePCExamensOficials from './WebWorkspacePCExamensOficials';
import WebWorkspacePCActualitat from './WebWorkspacePCActualitat';
import WebWorkspacePCPsicotecnics from './WebWorkspacePCPsicotecnics';
import { ConsisteixProvaPsicologica } from '../oposimossos/prova_psicologica/ConsisteixProvaPsicologica';
import { ConsisteixBiodata } from '../oposimossos/prova_psicologica/ConsisteixBiodata';
import { CompetenciesClauWeb } from '../oposimossos/prova_psicologica/CompetenciesClauWeb';
import { QuestionariBiograficWeb } from '../oposimossos/prova_psicologica/QuestionariBiograficWeb';
import { TestBiodataWeb } from '../oposimossos/prova_psicologica/TestBiodataWeb';
import { ConsisteixEntrevista } from '../oposimossos/prova_psicologica/ConsisteixEntrevista';
import { PracticarEntrevistaWeb } from '../oposimossos/prova_psicologica/PracticarEntrevistaWeb';
import { DemanarCitaWeb } from '../oposimossos/prova_psicologica/DemanarCitaWeb';
import { CalculadoraPressWeb } from '../../components/CalculadoraPressWeb';
import { CercadorGimnasosWeb } from '../../components/CercadorGimnasosWeb';
import { 
  BookOpen, ShieldCheck, Dumbbell, UserCheck, Play, Video, 
  ListTodo, FileText, Brain, GraduationCap, ArrowRight, ArrowLeft, ChevronLeft,
  HelpCircle, Utensils, MapPin, Calendar, Clock, ChevronDown, 
  ChevronRight, Activity, Timer, Send, Search, CheckCircle2, 
  AlertTriangle, Lock, Award, Volume2, User, Highlighter, Eraser, Check,
  Bell, PanelLeftClose, PanelLeftOpen, Menu, ChevronsLeft, ChevronsRight
} from 'lucide-react';

// Explicació per a no-programadors: Importem els fons temàtics generats per IA per a cadascuna de les 3 fases
// @ts-ignore
import fonsTeorica from '../../assets/images/Teorica.png';
// @ts-ignore
import fonsFisica from '../../assets/images/fons_fisica_1780343173628.png';
// @ts-ignore
import fonsPsicologica from '../../assets/images/fons_psicologica_1780343193032.png';
// Explicació per a no-programadors: Importem la nova imatge web_app_inici.png per posar-la com a fons de pantalla principal del Workspace (Què vols fer avui?).
// @ts-ignore
import fonsIniciAvui from '../../assets/images/web_app_inici.png';
// Explicació per a no-programadors: Importem la foto Foto03.png per posar-la com a fons de pantalla principal quan arribem a "Temari Oficial".
// @ts-ignore
import fonsFoto03 from '../../assets/images/Foto03.png';
// Explicació per a no-programadors: Importem la imatge web_app_entrevista_1.jpeg per utilitzar-la com a fons de pantalla exclusiu a la Fase 3: Prova d'adequació psicoprofessional.
// @ts-ignore
import fonsEntrevista from '../../assets/images/web_app_entrevista_1.jpeg';

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
    explicacio: "San José conté un espai buit que es prioritza per davant de qualsevol combinació de Sánchez o Santi."
  }
};

interface PropsWorkspacePC {
  progresOriginal: any;
  onTornarLanding: () => void;
  onObrirAppMobilSimulacre: () => void;
}

/**
 * COMPONENT: WebWorkspacePC
 * 
 * Explicació per a no-programadors:
 * Aquest fitxer s'encarrega d'estructurar tota la barra lateral d'estudis de l'ordinador (Campus Web)
 * segons el format oficial de les 3 proves que demanava l'opositor.
 * Hem eliminat els text genèrics i hem creat 3 grans carpetes/fases amb tots els submenús interactius
 * perquè l'alumne cliqui i canviï la pantalla central de contingut en viu, tal com ho farien en un entorn real de producció.
 */
export default function WebWorkspacePC({ progresOriginal, onTornarLanding, onObrirAppMobilSimulacre }: PropsWorkspacePC) {
  
  // Estats de navegació del Campus d'alta definició
  const [seccioActiva, setSeccioActiva] = useState<string>('avui');

  // Explicació per a no-programadors: Aquest estat controla si l'alumne ha triat "Prova teòrica" i està en el segon pas d'estudis de teoria (6 opcions de benvinguda).
  const [mostrantSubTeoria, setMostrantSubTeoria] = useState<boolean>(false);

  // Explicació per a no-programadors: Aquest estat controla si l'alumne ha triat "Prova física" i està en el segon pas d'estudis d'esport.
  const [mostrantSubFisica, setMostrantSubFisica] = useState<boolean>(false);

  // Explicació per a no-programadors: Aquest estat controla si l'alumne ha triat "Prova psicològica" i està en el menú de les 3 opcions sol·licitades (En què consisteix, Biodata, Entrevista).
  const [mostrantSubPsicologica, setMostrantSubPsicologica] = useState<boolean>(false);

  // Explicació per a no-programadors: Aquest estat controla si l'alumne ha entrat a "Prova biodata" (submenú dels 3 blocs: Verd, Blau i Groc amb 4 botons).
  const [mostrantSubBiodata, setMostrantSubBiodata] = useState<boolean>(false);

  // Explicació per a no-programadors: Aquest estat controla si l'alumne ha entrat a "Test competencial" (dins de Prova - Biodata) amb els 3 botons sol·licitats.
  const [mostrantSubTestCompetencial, setMostrantSubTestCompetencial] = useState<boolean>(false);

  // Explicació per a no-programadors: Aquest estat controla si l'alumne ha entrat a "Prova - Entrevista" (submenú de 3 botons: En què consisteix, Practicar l'entrevista, Demanar cita).
  const [mostrantSubEntrevista, setMostrantSubEntrevista] = useState<boolean>(false);

  // Explicació per a no-programadors: Estat que controla si la barra lateral d'estudi està comprimida (mode icones / compacte) o expandida (mode complet).
  // Això permet a l'alumne en tauletes (tablets) i ordinadors gaudir de molt més espai de pantalla per al contingut.
  const [sidebarComprimit, setSidebarComprimit] = useState<boolean>(false);

  // Explicació per a no-programadors: Sempre que l'usuari canviï d'activitat des de la barra d'eines lateral d'esquerra, reiniciem el flux per a que en tornar a la benvinguda ("avui") es tornin a llistar les 3 grans proves de l'oposició.
  useEffect(() => {
    if (seccioActiva !== 'avui') {
      setMostrantSubTeoria(false);
      setMostrantSubFisica(false);
      setMostrantSubPsicologica(false);
      setMostrantSubBiodata(false);
      setMostrantSubTestCompetencial(false);
      setMostrantSubEntrevista(false);
    }
  }, [seccioActiva]);
  
  // Explicació per a no-programadors: Estats per a desar el nom real de l'alumne recuperat de la Base de dades Firestore de forma segura i controlar si el menú d'opcions del perfil està obert o tancat en fer clic a la part superior dreta. We never invent names!
  const [nomEstudiantReal, setNomEstudiantReal] = useState<string>('👤 Estudiant');
  const [desplegablePerfilObert, setDesplegablePerfilObert] = useState<boolean>(false);
  
  // Explicació per a no-programadors: Estats reactius de control que guarden si Firebase ja ha resolt l'espera de la sessió del navegador (authCarregada) i quina és la fitxa activa de l'estudiant loguejat (usuariActiu). Això blinda completament la sincronització de dades.
  const [usuariActiu, setUsuariActiu] = useState<any>(null);
  const [authCarregada, setAuthCarregada] = useState<boolean>(false);
  
  // Explicació per a no-programadors: Guardem en el navegador de l'alumne (localStorage) quines notificacions de Firestore ja ha llegit per no barrejar dades entre diferents estudiants que comparteixen la maieixa base de dades.
  const [notificacionsLlegidesIds, setNotificacionsLlegidesIds] = useState<string[]>(() => {
    try {
      const deLocalStorage = localStorage.getItem('oposicat_notificacions_llegides');
      return deLocalStorage ? JSON.parse(deLocalStorage) : [];
    } catch {
      return [];
    }
  });

  // Explicació per a no-programadors: Llista dinàmica de notificacions oficials obtingudes en temps real des de la base de dades de Firestore. S'actualitza automàticament cada cop que l'administrador publica una alerta o plantilla d'avís des del Centre de Notificacions d'OposiCAT.
  const [notificacions, setNotificacions] = useState<any[]>([]);

  // Explicació per a no-programadors: Aquest efecte es connecta en temps real a la col·lecció "notificacions" de Firestore quan l'usuari s'ha identificat correctament, d'aquesta manera qualsevol dispositiu de l'estudiant rep en calent les darreres alertes de l'equip de repàs d'OposiCAT sense fallades de permisos.
  useEffect(() => {
    if (!authCarregada || !usuariActiu) {
      // Si la comprovació inicial encara corre, no llançarem consultes en fals que puguin donar error "Missing or insufficient permissions"
      return;
    }

    const colRef = collection(db, 'notificacions');
    const q = query(colRef, orderBy('creadaEl', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const elements: any[] = [];
      snapshot.forEach((docSnap) => {
        const dades = docSnap.data();
        
        // Només mostrem les notificacions que hagin estat finalment "enviades" o les que no estiguin explicitament suspeses pel panell d'administració
        if (dades.accio === 'ENVIAR' && !dades.suspesa) {
          // Calculem la data o el temps relatiu transcorregut amb un llenguatge planer i fàcil d'enviament de l'escola de repàs
          let textTemps = "Ara mateix";
          if (dades.creadaEl && typeof dades.creadaEl.toDate === 'function') {
            const dataCreacio = dades.creadaEl.toDate();
            const diferenciaMs = Date.now() - dataCreacio.getTime();
            const diferenciaMinuts = Math.floor(diferenciaMs / 60000);
            const diferenciaHores = Math.floor(diferenciaMinuts / 60);
            
            if (diferenciaMinuts < 1) {
              textTemps = "Ara mateix";
            } else if (diferenciaMinuts < 60) {
              textTemps = `Fa ${diferenciaMinuts} min`;
            } else if (diferenciaHores < 24) {
              textTemps = `Fa ${diferenciaHores} h`;
            } else {
              const dia = dataCreacio.getDate();
              const mesos = ["gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des."];
              textTemps = `${dia} de ${mesos[dataCreacio.getMonth()]}`;
            }
          } else {
            textTemps = "Recentment";
          }

          // Inferim la importància de forma intel·ligent segons el canal d'enviament o paraules clau reals del títol del missatge corporatiu de l'escola de repàs d'OposiCAT
          let imp = "poc";
          const titolLower = (dades.titol || "").toLowerCase();
          
          if (titolLower.includes("important") || titolLower.includes("urgent") || titolLower.includes("canvi") || dades.canal === "PUSH_MOBIL") {
            imp = "molt";
          } else if (titolLower.includes("simulacre") || titolLower.includes("nou") || titolLower.includes("actualitzat") || dades.canal === "WEB_APP") {
            imp = "important";
          }
          
          elements.push({
            id: docSnap.id,
            titol: dades.titol || "Avís oficial OposiCAT",
            text: dades.cos || "",
            llegida: notificacionsLlegidesIds.includes(docSnap.id),
            data: textTemps,
            importancia: imp
          });
        }
      });
      setNotificacions(elements);
    }, (error) => {
      // Explicació per a no-programadors: En cas d'un d'error per permisos en desconnectar-se d'un ordinador, ignorem l'alarma temporalment per evitar alertes falses al navegador de l'alumne durant el tancament de sessió.
      const isPermissionError = error instanceof Error && error.message.toLowerCase().includes('permission');
      if (isPermissionError && !auth.currentUser) {
        return;
      }
      const dadesSessioError = {
        error: error instanceof Error ? error.message : String(error),
        operationType: 'list',
        path: 'notificacions',
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          emailVerified: auth.currentUser?.emailVerified
        }
      };
      console.warn("Firestore info log d'alarma d'estudiant:", JSON.stringify(dadesSessioError));
    });

    return () => unsubscribe();
  }, [notificacionsLlegidesIds, authCarregada, usuariActiu]);

  const [desplegableNotificacionsObert, setDesplegableNotificacionsObert] = useState<boolean>(false);
  const numNotificacions = notificacions.filter(n => !n.llegida).length;

  // Explicació per a no-programadors: Marcar totes les notificacions alhora com a llegides guardant-ne els indicadors ID a la memòria permanent de l'ordinador (localStorage).
  const marcarTotesComALlegides = () => {
    const totsElsIds = notificacions.map(n => n.id);
    const nousIdsLlegits = Array.from(new Set([...notificacionsLlegidesIds, ...totsElsIds]));
    setNotificacionsLlegidesIds(nousIdsLlegits);
    try {
      localStorage.setItem('oposicat_notificacions_llegides', JSON.stringify(nousIdsLlegits));
    } catch (e) {
      console.warn("No s'ha pogut escriure a localStorage:", e);
    }
  };

  // Explicació per a no-programadors: Canviar l'estat d'una sola notificació en fer-hi clic (si està llogida es torna no llegida, o al revés).
  const alternarNotificacioLlegida = (id: string | number) => {
    const idStr = String(id);
    let nousIds: string[];
    if (notificacionsLlegidesIds.includes(idStr)) {
      nousIds = notificacionsLlegidesIds.filter(x => x !== idStr);
    } else {
      nousIds = [...notificacionsLlegidesIds, idStr];
    }
    setNotificacionsLlegidesIds(nousIds);
    try {
      localStorage.setItem('oposicat_notificacions_llegides', JSON.stringify(nousIds));
    } catch (e) {
      console.warn("No s'ha pogut escriure a localStorage:", e);
    }
  };
  
  // Controls de desplegables d'acordió interns tant del menú esquerre com de la zona dreta
  const [acordioExamenTeoricObert, setAcordioExamenTeoricObert] = useState(true);
  const [acordioProvesFisiquesObert, setAcordioProvesFisiquesObert] = useState(true);
  const [acordioPsicologicaObert, setAcordioPsicologicaObert] = useState(true);

  // Estats per als nous sub-desplegables interactius de la Prova Teòrica del Campus Web
  // Explicació per a no-programadors: s'encarreguen de guardar si cada part ("Examen teòric", "Examen psicotècnic" o "Actualitat") està desplegat o guardat.
  const [subAcordioTeoricObert, setSubAcordioTeoricObert] = useState(false);
  const [subAcordioPsicotecnicObert, setSubAcordioPsicotecnicObert] = useState(false);
  const [subAcordioActualitatObert, setSubAcordioActualitatObert] = useState(false);

  // Estats per als nous sub-desplegables de la Prova Física del Campus Web (Regla 1 i 3)
  // Explicació per a no-programadors: Guarden l'estat d'obertura dels desplegables de física (Proves físiques, Dieta, Gimnàs)
  const [subAcordioProvesFisiques3Obert, setSubAcordioProvesFisiques3Obert] = useState(false);
  const [subAcordioDietaObert, setSubAcordioDietaObert] = useState(false);
  const [subAcordioBuscarGimnasObert, setSubAcordioBuscarGimnasObert] = useState(false);

  // Guarda quina sub-secció o detall del bloc de Prova Física s'ha seleccionat de forma activa
  // Explicació per a no-programadors: Si l'esportista prem "Press de banca", "Dieta premium" o "Donar d'alta gimnàs", ho recordarem aquí per dibuixar la pantalla corresponent.
  const [fisicaProvaActiva, setFisicaProvaActiva] = useState<string>("Press de banca");
  const [dietaActiva, setDietaActiva] = useState<string>("Dieta gratuïta");
  const [gimnasActiu, setGimnasActiu] = useState<string>("Buscar gimnàs");

  // Estats per al formulari de creació d'un nou gimnàs homologat a l'escola de repàs d'alt rendiment
  // Explicació per a no-programadors: Guarden la informació introduïda per l'usuari en el formulari abans d'enviar-la.
  const [nomNouGimnas, setNomNouGimnas] = useState("");
  const [ciutatNouGimnas, setCiutatNouGimnas] = useState("barcelona");
  const [instalNouGimnas, setInstalNouGimnas] = useState("");
  const [altaGimnasExitosa, setAltaGimnasExitosa] = useState(false);

  // Estats per als sub-desplegables de la Prova Psicològica (Regla 1 i 3)
  // Explicació per a no-programadors: Ens permeten obrir o tancar des del menú de l'esquerra els apartats de Competències, Biodata i Entrevista sense icones.
  const [subAcordioPsicoCompetenciesObert, setSubAcordioPsicoCompetenciesObert] = useState(false);
  const [subAcordioPsicoBiodataObert, setSubAcordioPsicoBiodataObert] = useState(false);
  const [subAcordioPsicoEntrevistaObert, setSubAcordioPsicoEntrevistaObert] = useState(false);

  // Guarda quina sub-pantalla de la prova psicològica tenim activa actualment
  // Explicació per a no-programadors: Sabrem si pintar el test de biodata, preguntes personals, laborals, etcètera.
  const [psicoSubSeccioActiva, setPsicoSubSeccioActiva] = useState<string>("Apren com es puntua");

  // Guarda quina sub-prova concreta de psicotècnics o actualitat ha seleccionat l'alumne
  const [psicotecnicActiu, setPsicotecnicActiu] = useState<string>("Sèries Aritmètiques");
  const [actualitatActiva, setActualitatActiva] = useState<string>("Última setmana");

  // Llistats complets de temes per als submenús de dalt
  const provesPsicotecnics = [
    "Sèries Aritmètiques",
    "Figures i Espai",
    "Raonament Lògic",
    "Comprensió Verbal",
    "Càlcul Mental Ràpid",
    "Memòria Visual",
    "Resolució de Problemes",
    "Atenció i Resistència",
    "Sèries de Dominós",
    "Aptituds Administratives"
  ];

  const provesActualitat = [
    "Última setmana",
    "Notícies de l'any",
    "Exàmens d'actualitat"
  ];

  // CONTROL INTERACTIU D'ÀMBITS DE TEORIA
  const [ambitSeleccionat, setAmbitSeleccionat] = useState<'A' | 'B' | 'C'>('A');

  // Explicació per a no-programadors: Aquest estat serveix per recordar si el sistema ha d'ensenyar primer els 3 blocs d'àmbits tancats (com la primera foto) o el llistat dels capítols complets d'un àmbit (com la segona foto).
  const [mostrarTresAmbitsInici, setMostrarTresAmbitsInici] = useState<boolean>(true);

  // Explicació per a no-programadors: Estats per a gestionar el flux natural d'estudi de l'App (seleccionar un tema Concret, llegir punts/capítols i obrir el lector interactiu).
  const [temaSeleccionatIndex, setTemaSeleccionatIndex] = useState<number | null>(null);
  const [subtemaSeleccionatIndex, setSubtemaSeleccionatIndex] = useState<number | null>(null);
  
  // Explicació per a no-programadors: Estats per a gestionar l'eina activa del subratllador o goma d'esborrar en el lector de continguts de PC per a estudiar de forma molt còmoda.
  const [einaActiva, setEinaActiva] = useState<'highlighter' | 'eraser' | null>(null);
  const pcArticleRef = useRef<HTMLDivElement>(null);

  // Explicació per a no-programadors: Referències d'elements visuals de la pantalla per poder detectar correctament quan l'usuari clica fora de cadascun dels desplegables de perfil o de notificacions.
  const notificacionsContenidorRef = useRef<HTMLDivElement>(null);
  const perfilContenidorRef = useRef<HTMLDivElement>(null);

  // Explicació per a no-programadors: Aquest efecte s'activa en iniciar i comprova contínuament on fa clic l'usuari a la pantalla de l'ordinador. Si veu que es clica a fora dels desplegables actius (notificacions o usuari), els tanca de forma intel·ligent automàticament.
  useEffect(() => {
    const comprovaClicExterior = (esdeveniment: MouseEvent) => {
      const nodeClicat = esdeveniment.target as Node;
      
      // Tanquem desplegable de notificacions si cliquem fora del seu node contenidor
      if (desplegableNotificacionsObert && notificacionsContenidorRef.current && !notificacionsContenidorRef.current.contains(nodeClicat)) {
        setDesplegableNotificacionsObert(false);
      }
      
      // Tanquem desplegable de perfil si cliquem fora del seu node contenidor
      if (desplegablePerfilObert && perfilContenidorRef.current && !perfilContenidorRef.current.contains(nodeClicat)) {
        setDesplegablePerfilObert(false);
      }
    };

    // Registrem el mètode d'escolta a nivell global del document de la pàgina web
    document.addEventListener('mousedown', comprovaClicExterior);
    return () => {
      // L'alliberem si el component es tanca per mantenir el navegador lleuger
      document.removeEventListener('mousedown', comprovaClicExterior);
    };
  }, [desplegableNotificacionsObert, desplegablePerfilObert]);

  // Explicació per a no-programadors: Estat per desar quins capítols concrets d'un tema estan completats (llegits rics).
  const [detallLlegitsLocals, setDetallLlegitsLocals] = useState<Record<string, boolean>>(() => {
    const defaultState: Record<string, boolean> = {};
    if (progresOriginal && progresOriginal.detall) {
      ['A', 'B', 'C'].forEach(amb => {
        if (progresOriginal.detall[amb]) {
          Object.keys(progresOriginal.detall[amb]).forEach((temaIdxStr) => {
            const arr = progresOriginal.detall[amb][temaIdxStr];
            if (Array.isArray(arr)) {
              arr.forEach((llegit: boolean, subIdx: number) => {
                defaultState[`${amb}_${temaIdxStr}_${subIdx}`] = !!llegit;
              });
            }
          });
        }
      });
    }
    return defaultState;
  });

  // Explicació per a no-programadors: Estat per guardar les notes o resums enriquits d'estudi editats per l'usuari amb el editor/subratllador que porta el lector canònic.
  const [contingutPersonalitzatLocals, setContingutPersonalitzatLocals] = useState<Record<string, string>>(() => {
    const defaultState: Record<string, string> = {};
    if (progresOriginal && progresOriginal.contingutPersonalitzat) {
      Object.keys(progresOriginal.contingutPersonalitzat).forEach(clau => {
        defaultState[clau] = progresOriginal.contingutPersonalitzat[clau];
      });
    }
    return defaultState;
  });

  // Explicació per a no-programadors: Estat per desar les notes redactades per l'estudiant des de la Web i després sincronitzar-les a Firestore de forma segura.
  const [notesEstudiantLocals, setNotesEstudiantLocals] = useState<Record<string, string>>(() => {
    const defaultState: Record<string, string> = {};
    if (progresOriginal && progresOriginal.notesEstudiant) {
      Object.keys(progresOriginal.notesEstudiant).forEach(clau => {
        defaultState[clau] = progresOriginal.notesEstudiant[clau];
      });
    }
    return defaultState;
  });

  // Explicació per a no-programadors: Estat per a guardar si un subtema del resum d'OposiMossos està de veritat llegit/estudiat per l'alumne o no.
  const [detallLlegitsLocalsOposimossos, setDetallLlegitsLocalsOposimossos] = useState<Record<string, boolean>>(() => {
    const defaultState: Record<string, boolean> = {};
    if (progresOriginal && progresOriginal.oposimossos && progresOriginal.oposimossos.detall) {
      ['A', 'B', 'C'].forEach(amb => {
        if (progresOriginal.oposimossos.detall[amb]) {
          Object.keys(progresOriginal.oposimossos.detall[amb]).forEach((temaIdxStr) => {
            const arr = progresOriginal.oposimossos.detall[amb][temaIdxStr];
            if (Array.isArray(arr)) {
              arr.forEach((llegit: boolean, subIdx: number) => {
                defaultState[`${amb}_${temaIdxStr}_${subIdx}`] = !!llegit;
              });
            }
          });
        }
      });
    }
    return defaultState;
  });

  // Funció per guardar les notes des de la web i sincronitzar amb Firebase de forma robusta
  const guardarNotesEstudiantWeb = (ambit: 'A' | 'B' | 'C', temaIdx: number, subtemaIdx: number, notes: string) => {
    const clau = `${ambit}-${temaIdx}-${subtemaIdx}`;
    setNotesEstudiantLocals(prev => ({
      ...prev,
      [clau]: notes
    }));
    
    if (usuariActiu) {
      import('../../lib/progresEstudisService').then(({ desarNotesEstudiant }) => {
        desarNotesEstudiant(usuariActiu.uid, ambit, temaIdx, subtemaIdx, notes);
      });
    }
  };

  // Funció per marcar / desmarcar subtema de l'àrea de resum com a llegit connectat amb la base de dades
  const guardarProgresLecturaOposimossosWeb = (ambit: 'A' | 'B' | 'C', temaIdx: number, subtemaIdx: number, completat: boolean) => {
    const clau = `${ambit}_${temaIdx}_${subtemaIdx}`;
    setDetallLlegitsLocalsOposimossos(prev => ({
      ...prev,
      [clau]: completat
    }));

    if (usuariActiu) {
      import('../../lib/progresEstudisService').then(({ desarProgresLectura }) => {
        desarProgresLectura(usuariActiu.uid, 'oposimossos', ambit, temaIdx, subtemaIdx, completat);
      });
    }
  };

  // Explicació per a no-programadors: Estat per a guardar si un vídeo d'una classe premium ha estat ja vist o completat per l'opositor.
  const [detallVistosLocalsVideos, setDetallVistosLocalsVideos] = useState<Record<string, boolean>>(() => {
    const defaultState: Record<string, boolean> = {};
    if (progresOriginal && progresOriginal.classes_premium && progresOriginal.classes_premium.detall) {
      ['A', 'B', 'C'].forEach(amb => {
        if (progresOriginal.classes_premium.detall[amb]) {
          Object.keys(progresOriginal.classes_premium.detall[amb]).forEach((temaIdxStr) => {
            const arr = progresOriginal.classes_premium.detall[amb][temaIdxStr];
            if (Array.isArray(arr)) {
              arr.forEach((vist: boolean, subIdx: number) => {
                defaultState[`${amb}_${temaIdxStr}_${subIdx}`] = !!vist;
              });
            }
          });
        }
      });
    }
    return defaultState;
  });

  // Funció per marcar / desmarcar un vídeo de les classes premium com a vist connectat amb la base de dades
  const guardarProgresVideoPremiumWeb = (ambit: 'A' | 'B' | 'C', temaIdx: number, subtemaIdx: number, completat: boolean) => {
    const clau = `${ambit}_${temaIdx}_${subtemaIdx}`;
    setDetallVistosLocalsVideos(prev => ({
      ...prev,
      [clau]: completat
    }));

    if (usuariActiu) {
      import('../../lib/progresEstudisService').then(({ desarProgresLectura }) => {
        desarProgresLectura(usuariActiu.uid, 'oposimossos', ambit, temaIdx, subtemaIdx, completat);
      });
    }
  };

  // CONTROL INTERACTIU D'ENTRENAMENT DE PSICOTÈCNICS
  // Explicació per a no-programadors: Enregistrem quina resposta ha triat l'usuari a la pregunta d'exemple i si vol mostrar l'explicació detallada.
  const [respostaPsicoTriada, setRespostaPsicoTriada] = useState<number | null>(null);
  const [mostrarExplicacioPsico, setMostrarExplicacioPsico] = useState<boolean>(false);

  // CONTROL INTERACTIU DE MARCAR TEMA COM A LLEGIT SENSE TOCAR BBDD DE MANERA DIRECTA
  const [temesLlegitsLocals, setTemesLlegitsLocals] = useState<Record<string, boolean>>(() => {
    // Carrega l'estat inicial basat en les dades del progresOriginal de l'usuari
    const defaultState: Record<string, boolean> = {};
    if (progresOriginal) {
      ['A', 'B', 'C'].forEach(amb => {
        if (progresOriginal[amb]) {
          progresOriginal[amb].forEach((llegit: boolean, idx: number) => {
            defaultState[`${amb}_${idx}`] = !!llegit;
          });
        }
      });
    }
    return defaultState;
  });

  // CONTROL INTERACTIU DE REPRODUCCIÓ DE CLASSES ENREGISTRADES (PREMIUM)
  const [classeVideoActiva, setClasseVideoActiva] = useState<string>('introduccio_estudi');
  const [reproduintVideo, setReproduintVideo] = useState(false);

  // CONTROL INTERACTIU PER AL SIMULADOR DE TESTS INTERNS EN ORDINADOR (PROVES EXÀMENS)
  const [quantitatPreguntesTest, setQuantitatPreguntesTest] = useState(15);
  const [tempsLimitTest, setTempsLimitTest] = useState(25);
  const [testEnCurs, setTestEnCurs] = useState(false);
  const [testsPreguntaActual, setTestsPreguntaActual] = useState(0);
  const [respostesUsuariTest, setRespostesUsuariTest] = useState<Record<number, string>>({});
  const [testFinalitzat, setTestFinalitzat] = useState(false);

  const preguntesSimulacreExemple = [
    {
      id: 1,
      pregunta: "Quina és la durada màxima del mandat dels diputats i diputades del Parlament de Catalunya de forma extraordinària?",
      opcions: { A: "3 anys", B: "4 anys", C: "5 anys", D: "6 anys" },
      correcta: "B",
      explicacio: "D'acord amb l'Estatut d'Autonomia de Catalunya de 2006, el mandat és d'un període de 4 anys des de les eleccions."
    },
    {
      id: 2,
      pregunta: "En quin any van ser creats originàriament els primers escamots dels Mossos d'Esquadra en la història policial?",
      opcions: { A: "1721", B: "1719", C: "1844", D: "1931" },
      correcta: "B",
      explicacio: "Es van establir els primers mossos l'any 1719 per part del marquès de Castel-Rodrigo (orígens de les Esquadres de Paisans)."
    },
    {
      id: 3,
      pregunta: "Com es considera un dret fonamental d'acord amb la Constitució Espanyola de 1978?",
      opcions: { A: "Un dret regulat a la secció segona del títol primer de la carta general", B: "Un dret lliure independent del text constitucional", C: "Qualsevol llei aprovada pel Senat", D: "Un dret reservat exclusivament al Govern" },
      correcta: "A",
      explicacio: "Els drets fonamentals de màxima protecció abasten de l'article 14 al 29 de la secció primera i el preàmbul d'igualtat."
    }
  ];

  // CONTROL DE LA CALCULADORA DEL CIRCUIT DE VELOCITAT (PROVA FÍSICA)
  const [segonsAgilitat, setSegonsAgilitat] = useState<string>('12.1');
  const [sexeAgilitat, setSexeAgilitat] = useState<'masculi' | 'femeni'>('masculi');
  const [calculaEstadisticaNota, setCalculaEstadisticaNota] = useState<number | null>(null);

  const calcularNotaCircuitDOGC = () => {
    const temps = parseFloat(segonsAgilitat);
    if (isNaN(temps) || temps <= 0) {
      setCalculaEstadisticaNota(0);
      return;
    }
    // Barems orientatius oficials masculí / femení del DOGC
    if (sexeAgilitat === 'masculi') {
      if (temps <= 10.2) setCalculaEstadisticaNota(10);
      else if (temps <= 10.5) setCalculaEstadisticaNota(9);
      else if (temps <= 11.0) setCalculaEstadisticaNota(8);
      else if (temps <= 11.4) setCalculaEstadisticaNota(7);
      else if (temps <= 11.8) setCalculaEstadisticaNota(6);
      else if (temps <= 12.2) setCalculaEstadisticaNota(5);
      else if (temps <= 12.6) setCalculaEstadisticaNota(4);
      else if (temps <= 13.0) setCalculaEstadisticaNota(3);
      else if (temps <= 13.5) setCalculaEstadisticaNota(2);
      else if (temps <= 14.0) setCalculaEstadisticaNota(1);
      else setCalculaEstadisticaNota(0);
    } else {
      if (temps <= 11.2) setCalculaEstadisticaNota(10);
      else if (temps <= 11.5) setCalculaEstadisticaNota(9);
      else if (temps <= 12.0) setCalculaEstadisticaNota(8);
      else if (temps <= 12.4) setCalculaEstadisticaNota(7);
      else if (temps <= 12.8) setCalculaEstadisticaNota(6);
      else if (temps <= 13.2) setCalculaEstadisticaNota(5);
      else if (temps <= 13.6) setCalculaEstadisticaNota(4);
      else if (temps <= 14.0) setCalculaEstadisticaNota(3);
      else if (temps <= 14.5) setCalculaEstadisticaNota(2);
      else if (temps <= 15.0) setCalculaEstadisticaNota(1);
      else setCalculaEstadisticaNota(0);
    }
  };

  // CONTROL INTERACTIU DE BUSCADOR DE GIMNASOS
  const [localitatGimnasFiltre, setLocalitatGimnasFiltre] = useState<string>('totes');
  const gimnasosCatalunya = [
    { nom: "Grup Oposició Agilitat Sants", ciutat: "barcelona", hores: "Dimarts i Dijous 19:30h", dsc: "Entrenament oficial de circuit en pista homologada amb reproduccions exactes de les fustes i tanques de Mossos." },
    { nom: "Club d'Atletisme Lleida Oposicions", ciutat: "lleida", hores: "Dilluns i Dimecres 18:00h", dsc: "Experts en la cursa de Navette i increment de potència aeròbica." },
    { nom: "Pavelló Girona Nord d'Opositors", ciutat: "girona", hores: "Tots els dissabtes 09:30h", dsc: "Simulacres de circuit i mesurament de tracció sobre barra rígida amb dinamòmetres d'alta precisió." },
    { nom: "Gimnàs Olímpic Tarraco - Secció Mossos", ciutat: "tarragona", hores: "Dimecres 20:00h", dsc: "Escenari cobert per assajar flexibilitat i augment de potència explosiva en un click." }
  ];

  // CONTROL INTERACTIU DE CATEGORIES DE PREGUNTES DE L'ENTREVISTA
  const [categoriaEntrevistaActiva, setCategoriaEntrevistaActiva] = useState<number>(0);

  // CONTROL INTERACTIU DE FORMULARI DE CITA AMB PSICÒLEGS
  const [citaTornTriat, setCitaTornTriat] = useState<'mati' | 'tarda'>('mati');
  const [citaHoraTriada, setCitaHoraTriada] = useState<string>('10:00');
  const [citaReservadaCorrectament, setCitaReservadaCorrectament] = useState(false);

  // Estats per al rol de l'usuari (Control d'accés per a testers 'usuari_alpha')
  // Comentari planer per a no-programadors:
  // Si l'usuari té el rol "usuari_alpha", només té accés a la prova psicològica.
  // Les proves teòrica i física es mostren en gris, deshabilitades i inaccessibles.
  const [rolUsuari, setRolUsuari] = useState<string>('usuari_alpha');
  const esUsuariAlpha = rolUsuari === 'usuari_alpha';

  // Estats per a l'hora del PC i la sirena de colors de Mossos d'Esquadra (animació estil backoffice)
  // Explicació per a no-programadors: Guardem l'hora actual i l'estat de pampallugues (base/groc, color1/blau o color2/vermell).
  const [horaActual, setHoraActual] = useState(new Date());
  const [animationState, setAnimationState] = useState<'base' | 'color1' | 'color2'>('base');

  // Explicació per a no-programadors: Aquest efecte s'executa tant a l'inici com quan hi ha canvis en la sessió de l'estudiant. S'encarrega d'agafar l'identificador de l'usuari en línia (UID), consultar directament la fitxa d'usuari oficial 'usuaris' a la base de dades Firestore de Firebase i estirar-ne el camp 'displayName' i 'rol'. Si el document no existís a Firestore, el garanteix i crea automàticament de forma silenciosa.
  useEffect(() => {
    const carregarPerfilReal = async () => {
      const usuariAutenticat = auth.currentUser;
      if (usuariAutenticat) {
        try {
          // Assegurem que la fitxa a Firestore existeixi de debò
          const perfilGarantit = await garantirFitxaPerfilFirestore(usuariAutenticat);
          
          if (perfilGarantit.displayName) {
            setNomEstudiantReal(`👤 ${perfilGarantit.displayName}`);
          }
          if (perfilGarantit.rol) {
            setRolUsuari(perfilGarantit.rol);
            return;
          }
          
          // Deducció automàtica de rol per email si no venia a Firestore
          const rolCalculat = determinarRolSegonsEmail(usuariAutenticat.email, 'usuari_alpha');
          setRolUsuari(rolCalculat);

          // Fallback en cas que no hi hagi displayName encara a la col·lecció de base de dades
          if (usuariAutenticat.displayName) {
            setNomEstudiantReal(`👤 ${usuariAutenticat.displayName}`);
          } else if (usuariAutenticat.email) {
            // Generem un nom a partir del seu correu, ex: xepfarre per a xepfarre@gmail.com
            const nomNet = usuariAutenticat.email.split('@')[0];
            setNomEstudiantReal(`👤 ${nomNet.charAt(0).toUpperCase() + nomNet.slice(1)}`);
          }
        } catch (err) {
          console.error("No s'ha pogut obtenir o garantir el perfil de l'estudiant des de Firestore:", err);
          const rolFallback = determinarRolSegonsEmail(usuariAutenticat.email, 'usuari_alpha');
          setRolUsuari(rolFallback);
          setNomEstudiantReal('👤 Estudiant');
        }
      }
    };

    // Escoltador d'autenticació en viu per canvis ràpids o càrregues asíncrones
    const subscripcioAuth = auth.onAuthStateChanged((usuariActiu) => {
      setAuthCarregada(true);
      if (usuariActiu) {
        setUsuariActiu(usuariActiu);
        carregarPerfilReal();
      } else {
        setUsuariActiu(null);
        setNomEstudiantReal('👤 Estudiant');
        setRolUsuari('usuari_alpha');
      }
    });

    return () => subscripcioAuth();
  }, []);

  // Explicació per a no-programadors:
  // Blindatge de navegació per a usuaris Alpha (testers):
  // Si estan navegant per un lloc no permès (teòrica o física), els redirigim automàticament a l'inici.
  useEffect(() => {
    if (esUsuariAlpha) {
      if (seccioActiva.startsWith('teorica_') || seccioActiva.startsWith('fisica_') || mostrantSubTeoria || mostrantSubFisica) {
        setSeccioActiva('avui');
        setMostrantSubTeoria(false);
        setMostrantSubFisica(false);
      }
    }
  }, [esUsuariAlpha, seccioActiva, mostrantSubTeoria, mostrantSubFisica]);

  // Explicació per a no-programadors: Netegem qualsevol selecció quan l'estudiant canvia d'eina o la tanca.
  useEffect(() => {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
    }
  }, [einaActiva]);

  useEffect(() => {
    // Actualitzem l'hora en temps real cada segon
    const intervalRellotge = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);

    // Seqüència de llums policials (colors blau i vermell dels Mossos d'Esquadra)
    const executaSirena = () => {
      setAnimationState('color1'); // Color Blau
      setTimeout(() => setAnimationState('color2'), 1000); // Color Vermell
      setTimeout(() => setAnimationState('base'), 2000); // Tornar al color base habitual
    };

    // Primera pampalluga de benvinguda de la sirena als 4 segons
    const timeoutInicial = setTimeout(executaSirena, 4000);

    // Loop de la sirena cada minut (60 segons)
    const intervalSirena = setInterval(executaSirena, 60000);

    return () => {
      clearInterval(intervalRellotge);
      clearTimeout(timeoutInicial);
      clearInterval(intervalSirena);
    };
  }, []);

  // Càlcul ràpid d'estadística general
  const totalTemes = 7 + 8 + 5;
  const totalLlegits = Object.values(temesLlegitsLocals).filter(Boolean).length;
  const percentatgeEstudis = Math.round((totalLlegits / totalTemes) * 100);

  // Explicació per a no-programadors: Triem el fons de pantalla segons la secció seleccionada per l'alumne o l'accés d'inici "Què vols fer avui?"
  let fonsActiuUrl = '';
  if (seccioActiva === 'avui') {
    if (mostrantSubPsicologica) {
      // Explicació per a no-programadors: Per petició expressa de l'opositor, quan estem a la Fase 3: Prova d'adequació psicoprofessional, es mostra la imatge web_app_entrevista_1.jpeg.
      fonsActiuUrl = fonsEntrevista;
    } else {
      // Explicació per a no-programadors: Per petició de l'alumne, utilitzem web_app_inici.png com a fons de pantalla principal del campus a WEB-PC-WORKSPACE.
      fonsActiuUrl = fonsIniciAvui;
    }
  } else if (
    seccioActiva === 'teorica_temari_oficial' || 
    seccioActiva === 'teorica_temari_oposimossos' || 
    seccioActiva === 'teorica_classes_premium' || 
    seccioActiva === 'teorica_video_oposimossos' || 
    seccioActiva === 'teorica_classes_directe' ||
    seccioActiva === 'teorica_examens_oposimossos' ||
    seccioActiva === 'teorica_examens_oficials'
  ) {
    // Explicació per a no-programadors: Per petició de l'alumne, en les àrees de Temari Oficial, Àrea d'Estudi Personal, Classes Premium i Simuladors/Històrics d'Exàmens, s'utilitza la imatge Foto03.png per dotar d'una estètica premium de gran presència visual.
    fonsActiuUrl = fonsFoto03;
  } else if (seccioActiva.startsWith('fisica_')) {
    fonsActiuUrl = fonsFisica;
  } else if (seccioActiva.startsWith('psico_')) {
    // Explicació per a no-programadors: Quan s'obre qualsevol apartat de Fase 3: Avaluació Psicoprofessional (com En què consisteix, Competències, Biodata o Entrevista), es posa de fons web_app_entrevista_1.jpeg.
    fonsActiuUrl = fonsEntrevista;
  } else if (seccioActiva === 'teorica_psicotecnics') {
    fonsActiuUrl = fonsPsicologica;
  } else if (seccioActiva.startsWith('teorica_')) {
    fonsActiuUrl = fonsTeorica;
  }

  return (
    <div className="bg-[#010915] text-slate-100 min-h-screen font-sans flex antialiased">
      
      {/* ========================================================================= */}
      {/* 1. BARRA LATERAL (SIDEBAR) ESQUERRA - ORGANITZADA EXCLUSIVAMENT EN LES 3 PROVES */}
      {/* Explicació per a no-programadors: En tauletes (md:) és més estreta (w-56 / 224px) per deixar molt més espai de lectura,
          i permet comprimir-se en una barra estreta d'icones (w-16) amb un sol clic. */}
      {/* ========================================================================= */}
      <aside 
        className={`${
          sidebarComprimit ? 'w-16 md:w-16 lg:w-16' : 'w-72 md:w-56 lg:w-72 xl:w-80'
        } bg-slate-950 border-r border-blue-950/60 flex flex-col justify-between hidden md:flex shrink-0 max-h-screen overflow-y-auto relative z-[60] selection:bg-red-650 transition-all duration-300 ease-in-out`}
      >
        {sidebarComprimit ? (
          /* =========================================================================
             MODE COMPRIMIT (ICON-ONLY): Barra estreta d'accés directe amb botó d'expandir
             ========================================================================= */
          <div className="flex flex-col items-center py-4 space-y-5 h-full justify-between select-none">
            
            {/* Part Superior: Logotip compacte i Campana de Notificacions */}
            <div className="flex flex-col items-center space-y-4 w-full px-2">
              
              {/* Logotip compacte OposiCAT */}
              <button
                type="button"
                onClick={() => setSeccioActiva('avui')}
                title="Inici - OposiCAT"
                className="w-10 h-10 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-blue-900/30 text-[#FFDF00] font-black text-xs cursor-pointer flex items-center justify-center tracking-wider transition-all"
              >
                OC
              </button>

              {/* Campana de Notificacions en mode compacte */}
              <div 
                ref={notificacionsContenidorRef}
                className="relative flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesplegableNotificacionsObert(prev => !prev);
                }}
              >
                <button
                  type="button"
                  id="btn-campana-notificacions-compacta"
                  title="Notificacions"
                  className={`relative p-2 rounded-full hover:bg-slate-850/60 transition-all cursor-pointer flex items-center justify-center ${
                    numNotificacions > 0 ? 'text-[#FFDF00]' : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <Bell className="w-5 h-5 animate-wiggle" />
                  {numNotificacions > 0 && (
                    <span 
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-[0_0_6px_rgba(220,38,38,0.6)] animate-pulse"
                    >
                      {numNotificacions}
                    </span>
                  )}
                </button>

                {/* Desplegable de notificacions flotant */}
                {desplegableNotificacionsObert && (
                  <div 
                    id="desplegable-notificacions-flotant-compacte"
                    className="fixed left-20 top-4 w-[380px] sm:w-[420px] bg-slate-950/98 border border-blue-900/40 rounded-2xl shadow-2xl p-4 z-50 text-left backdrop-blur-md animate-in fade-in slide-in-from-left-2 duration-200 flex flex-col h-[580px] max-h-[85vh]"
                  >
                    <div className="px-2 py-2 border-b border-blue-950/40 mb-3 flex justify-between items-center shrink-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-[#FFDF00] font-black">Notificacions Actives</span>
                        <span className="bg-[#FFDF00]/10 text-[#FFDF00] text-[9.5px] px-1.5 py-0.5 rounded-full font-bold">
                          {numNotificacions} noves
                        </span>
                      </div>
                      {numNotificacions > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarTotesComALlegides();
                          }}
                          className="text-[9.5px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer border border-slate-850 hover:border-slate-800 px-2.5 py-1 rounded-lg"
                        >
                          Llegir totes
                        </button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[480px]">
                      {notificacions.map((item) => (
                        <div 
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            alternarNotificacioLlegida(item.id);
                          }}
                          className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer relative group/item ${
                            item.llegida 
                              ? 'bg-slate-900/10 border-slate-900/20 text-slate-500 opacity-60 hover:opacity-85' 
                              : 'bg-slate-900/60 border-blue-900/20 hover:border-blue-900/45 text-slate-250 shadow-md shadow-blue-950/5'
                          }`}
                        >
                          {!item.llegida && (
                            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-650 rounded-full animate-pulse shadow-[0_0_6px_rgba(225,29,72,0.5)]" />
                          )}
                          <div className="flex flex-col space-y-2 pr-1">
                            <div className="flex items-start justify-between gap-3 shrink-0">
                              <p className={`text-[11.5px] font-black tracking-wide leading-snug group-hover/item:text-[#FFDF00] transition-colors flex-1 ${
                                item.llegida ? 'text-slate-500' : 'text-slate-200'
                              }`}>
                                {item.titol}
                              </p>
                              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest shrink-0 pt-0.5">
                                {item.data}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed">
                              {item.text}
                            </p>
                            <div className="flex items-center justify-end pt-1">
                              {!item.llegida && item.importancia === 'molt' && (
                                <span className="bg-red-600 text-white font-black text-[8px] py-1 px-3 rounded-full uppercase tracking-wider select-none shrink-0 shadow-[0_0_6px_rgba(220,38,38,0.25)]">
                                  molt important
                                </span>
                              )}
                              {!item.llegida && item.importancia === 'important' && (
                                <span className="bg-orange-500 text-white font-black text-[8px] py-1 px-3 rounded-full uppercase tracking-wider select-none shrink-0 shadow-[0_0_6px_rgba(249,115,22,0.25)]">
                                  important
                                </span>
                              )}
                              {!item.llegida && item.importancia === 'poc' && (
                                <span className="bg-[#b3f202] text-slate-950 font-black text-[8px] py-1 px-3 rounded-full uppercase tracking-wider select-none shrink-0">
                                  poc important
                                </span>
                              )}
                              {item.llegida && (
                                <span className="bg-slate-900 border border-slate-800/60 text-slate-500 font-black text-[8px] py-1 px-3 rounded-full uppercase tracking-wider select-none shrink-0">
                                  llegida
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Separador */}
              <div className="w-8 h-[1px] bg-blue-900/30 my-1" />

              {/* Accés ràpid a les 3 fases en format icona */}
              <div className="flex flex-col items-center space-y-3 w-full">
                {/* 0. Menú principal (Què vols fer avui?) */}
                <button
                  type="button"
                  onClick={() => {
                    setSeccioActiva('avui');
                    setMostrantSubTeoria(false);
                    setMostrantSubFisica(false);
                    setMostrantSubPsicologica(false);
                    setMostrantSubBiodata(false);
                  }}
                  title="0. Menú principal"
                  className={`p-2.5 rounded-xl transition-all cursor-pointer relative ${
                    seccioActiva === 'avui' && !mostrantSubTeoria && !mostrantSubFisica && !mostrantSubPsicologica && !mostrantSubBiodata
                      ? 'bg-blue-950 border border-blue-800 text-[#FFDF00] shadow-md shadow-blue-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                </button>

                {/* 1. Prova Teòrica */}
                <button
                  type="button"
                  disabled={esUsuariAlpha}
                  onClick={() => {
                    if (esUsuariAlpha) return;
                    setSeccioActiva('avui');
                    setMostrantSubTeoria(true);
                    setMostrantSubFisica(false);
                    setMostrantSubPsicologica(false);
                    setMostrantSubBiodata(false);
                  }}
                  title={esUsuariAlpha ? "1. Prova Teòrica (Accés restringit)" : "1. Prova Teòrica"}
                  className={`p-2.5 rounded-xl transition-all relative ${
                    esUsuariAlpha
                      ? 'text-slate-600 opacity-40 cursor-not-allowed'
                      : (seccioActiva === 'avui' && mostrantSubTeoria) || seccioActiva.startsWith('teorica_')
                        ? 'bg-blue-950 border border-blue-800 text-[#FFDF00] shadow-md shadow-blue-950/40 cursor-pointer'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  {!esUsuariAlpha && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" />}
                </button>

                {/* 2. Prova Física */}
                <button
                  type="button"
                  disabled={esUsuariAlpha}
                  onClick={() => {
                    if (esUsuariAlpha) return;
                    setSeccioActiva('avui');
                    setMostrantSubTeoria(false);
                    setMostrantSubFisica(true);
                    setMostrantSubPsicologica(false);
                    setMostrantSubBiodata(false);
                  }}
                  title={esUsuariAlpha ? "2. Prova Física (Accés restringit)" : "2. Prova Física"}
                  className={`p-2.5 rounded-xl transition-all relative ${
                    esUsuariAlpha
                      ? 'text-slate-600 opacity-40 cursor-not-allowed'
                      : (seccioActiva === 'avui' && mostrantSubFisica) || seccioActiva.startsWith('fisica_')
                        ? 'bg-blue-950 border border-blue-800 text-[#FFDF00] shadow-md shadow-blue-950/40 cursor-pointer'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer'
                  }`}
                >
                  <Dumbbell className="w-5 h-5" />
                  {!esUsuariAlpha && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>

                {/* 3. Prova Psicològica */}
                <button
                  type="button"
                  onClick={() => {
                    setSeccioActiva('avui');
                    setMostrantSubTeoria(false);
                    setMostrantSubFisica(false);
                    setMostrantSubPsicologica(true);
                    setMostrantSubBiodata(false);
                  }}
                  title="3. Prova Psicològica"
                  className={`p-2.5 rounded-xl transition-all cursor-pointer relative ${
                    (seccioActiva === 'avui' && (mostrantSubPsicologica || mostrantSubBiodata)) || seccioActiva.startsWith('psico_')
                      ? 'bg-blue-950 border border-blue-800 text-[#FFDF00] shadow-md shadow-blue-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
                </button>
              </div>

            </div>

            {/* Part Inferior Comprimida: Botó d'ampliar groc */}
            <div className="flex flex-col items-center space-y-2 pb-3">
              <button
                type="button"
                id="btn-expandir-sidebar-bottom"
                onClick={() => setSidebarComprimit(false)}
                title="Expandir menú lateral"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-400/50 hover:border-amber-400 text-[#FFDF00] transition-all cursor-pointer shadow-md shadow-amber-500/10 hover:scale-105 active:scale-95"
              >
                <PanelLeftOpen className="w-5 h-5 text-[#FFDF00] stroke-[2.5]" />
              </button>
            </div>

          </div>
        ) : (
          /* =========================================================================
             MODE EXPANDIT (COMPLET): Menú lateral complet amb mida optimitzada per a tablet
             ========================================================================= */
          <>
            <div className="p-3 md:p-3.5 lg:p-5 space-y-4 md:space-y-4 lg:space-y-6">
              
              {/* LOGOTIP CORPORATIU OPOSICAT, HORA LOCAL I BOTÓ PER COMPRIMIR */}
              <div 
                className="flex items-center justify-between p-2.5 md:p-3 lg:p-4 bg-slate-900/30 hover:bg-slate-900/50 border border-blue-900/15 rounded-2xl shadow-lg shadow-blue-950/10 mb-3 md:mb-4 transition-all group relative"
              >
                {/* Esquerra: Nom d'OposiCAT i el Rellotge */}
                <div 
                  onClick={() => setSeccioActiva('avui')}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-0.5 cursor-pointer"
                >
                  <h1 className="text-sm md:text-[15px] lg:text-[17px] font-black uppercase tracking-widest text-[#FFDF00] group-hover:scale-[1.02] transition-all duration-300" id="sidebar-logo-oposicat">
                    OposiCAT
                  </h1>
                  <span className="text-[9px] md:text-[9.5px] lg:text-[10.5px] font-mono font-bold text-white tracking-widest leading-none">
                    {horaActual.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                  </span>
                </div>

                {/* Dreta: Campana de Notificacions i Botó de Comprimir */}
                <div className="flex items-center space-x-1.5 md:space-x-2 shrink-0">
                  {/* Línia separadora vertical */}
                  <div id="separador-campana-notificacions" className="w-[1.5px] h-6 md:h-7 bg-blue-900/40 rounded-full shrink-0" />

                  {/* Contenidor de la campana de notificacions */}
                  <div 
                    ref={notificacionsContenidorRef}
                    className="relative z-10 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDesplegableNotificacionsObert(prev => !prev);
                    }}
                  >
                    <button
                      type="button"
                      id="btn-campana-notificacions"
                      className={`relative p-1.5 md:p-2 rounded-full hover:bg-slate-850/60 transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                        numNotificacions > 0 ? 'text-[#FFDF00]' : 'text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      <Bell className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 animate-wiggle" />
                      {numNotificacions > 0 ? (
                        <span 
                          id="badge-notificacions-vermell" 
                          className="absolute top-0 right-0 w-4 h-4 md:w-4.5 md:h-4.5 bg-red-600 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse"
                        >
                          {numNotificacions}
                        </span>
                      ) : (
                        <span 
                          id="badge-notificacions-gris" 
                          className="absolute top-0 right-0 w-4 h-4 bg-slate-800 border border-slate-700/60 rounded-full text-[8.5px] font-black text-slate-400 flex items-center justify-center"
                        >
                          0
                        </span>
                      )}
                    </button>

                    {/* Menú de notificacions un cop obert la campana flotant */}
                    {desplegableNotificacionsObert && (
                      <div 
                        id="desplegable-notificacions-flotant"
                        className="fixed left-[240px] md:left-[235px] lg:left-[300px] xl:left-[336px] top-4 w-[380px] sm:w-[420px] bg-slate-950/98 border border-blue-900/40 rounded-2xl shadow-2xl p-4 z-50 text-left backdrop-blur-md animate-in fade-in slide-in-from-left-2 duration-200 flex flex-col h-[580px] max-h-[85vh]"
                      >
                        {/* Capçalera del panell de notificacions amb la quantitat de pendents */}
                        <div className="px-2 py-2 border-b border-blue-950/40 mb-3 flex justify-between items-center shrink-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-[#FFDF00] font-black">Notificacions Actives</span>
                            <span className="bg-[#FFDF00]/10 text-[#FFDF00] text-[9.5px] px-1.5 py-0.5 rounded-full font-bold">
                              {numNotificacions} noves
                            </span>
                          </div>
                          {numNotificacions > 0 && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                marcarTotesComALlegides();
                              }}
                              className="text-[9.5px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer border border-slate-850 hover:border-slate-800 px-2.5 py-1 rounded-lg"
                            >
                              Llegir totes
                            </button>
                          )}
                        </div>

                        {/* Llistat scrollable amb les notificacions */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[480px]">
                          {notificacions.map((item) => (
                            <div 
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                alternarNotificacioLlegida(item.id);
                              }}
                              className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer relative group/item ${
                                item.llegida 
                                  ? 'bg-slate-900/10 border-slate-900/20 text-slate-500 opacity-60 hover:opacity-85' 
                                  : 'bg-slate-900/60 border-blue-900/20 hover:border-blue-900/45 text-slate-250 shadow-md shadow-blue-950/5'
                              }`}
                            >
                              {!item.llegida && (
                                <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-650 rounded-full animate-pulse shadow-[0_0_6px_rgba(225,29,72,0.5)]" />
                              )}

                              <div className="flex flex-col space-y-2 pr-1">
                                <div className="flex items-start justify-between gap-3 shrink-0">
                                  <p className={`text-[11.5px] font-black tracking-wide leading-snug group-hover/item:text-[#FFDF00] transition-colors flex-1 ${
                                    item.llegida ? 'text-slate-500' : 'text-slate-200'
                                  }`}>
                                    {item.titol}
                                  </p>
                                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest shrink-0 pt-0.5">
                                    {item.data}
                                  </span>
                                </div>

                                <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed">
                                  {item.text}
                                </p>

                                <div className="flex items-center justify-end pt-1">
                                  {!item.llegida && item.importancia === 'molt' && (
                                    <span className="bg-red-600 text-white font-black text-[8px] py-1 px-3 rounded-full uppercase tracking-wider select-none shrink-0 shadow-[0_0_6px_rgba(220,38,38,0.25)]">
                                      molt important
                                    </span>
                                  )}
                                  {!item.llegida && item.importancia === 'important' && (
                                    <span className="bg-orange-500 text-white font-black text-[8px] py-1 px-3 rounded-full uppercase tracking-wider select-none shrink-0 shadow-[0_0_6px_rgba(249,115,22,0.25)]">
                                      important
                                    </span>
                                  )}
                                  {!item.llegida && item.importancia === 'poc' && (
                                    <span className="bg-[#b3f202] text-slate-950 font-black text-[8px] py-1 px-3 rounded-full uppercase tracking-wider select-none shrink-0">
                                      poc important
                                    </span>
                                  )}
                                  {item.llegida && (
                                    <span className="bg-slate-900 border border-slate-800/60 text-slate-500 font-black text-[8px] py-1 px-3 rounded-full uppercase tracking-wider select-none shrink-0">
                                      llegida
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-blue-950/20 pt-2.5 mt-2.5 flex items-center justify-between text-[9px] text-slate-500 shrink-0 px-1 font-semibold uppercase tracking-widest">
                          <span>OposiCAT Campus Web</span>
                          <span>Total: {notificacions.length}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

          {/* ==================== FASES DE L'OPOSICIÓ (LEGO ARQUITECTURA) ==================== */}
          <div className="space-y-4 pt-1">
            
            {/* ----------------------------------------------------------------- */}
            {/* 0. MENÚ PRINCIPAL */}
            {/* Explicació per a no-programadors: Enllaç directe a la pantalla d'inici "Què vols fer avui?" */}
            {/* ----------------------------------------------------------------- */}
            <div className="space-y-1">
              <div 
                className={`w-full flex items-center justify-between py-2 px-1 border-b border-blue-900/15 transition-all ${
                  seccioActiva === 'avui' && !mostrantSubTeoria && !mostrantSubFisica && !mostrantSubPsicologica
                    ? 'text-[#FFDF00] bg-blue-950/40 rounded-lg px-2'
                    : 'text-slate-205'
                }`}
                id="sidebar-container-menu-principal"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSeccioActiva('avui');
                    setMostrantSubTeoria(false);
                    setMostrantSubFisica(false);
                    setMostrantSubPsicologica(false);
                  }}
                  className="flex-1 text-left cursor-pointer hover:text-white transition-colors flex items-center justify-between"
                  id="sidebar-btn-menu-principal"
                >
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    0. MENÚ PRINCIPAL
                  </span>
                  <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-widest">
                    Inici
                  </span>
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* A. 1A FASE: PROVA TEÒRICA */}
            {/* ----------------------------------------------------------------- */}
            <div className="space-y-1">
              <div 
                className={`w-full flex items-center justify-between py-2 px-1 border-b border-blue-900/15 transition-all ${
                  seccioActiva === 'avui' && mostrantSubTeoria
                    ? 'text-[#FFDF00] bg-blue-950/40 rounded-lg px-2'
                    : esUsuariAlpha ? 'text-slate-500 opacity-60' : 'text-slate-205'
                }`}
                id="sidebar-container-seccio-teorica"
              >
                {/* Clic al títol: Porta directament al menú d'opcions de la prova teòrica (Bloquejat si és usuari_alpha) */}
                <button
                  type="button"
                  disabled={esUsuariAlpha}
                  onClick={() => {
                    if (esUsuariAlpha) return;
                    setSeccioActiva('avui');
                    setMostrantSubTeoria(true);
                    setMostrantSubFisica(false);
                    setMostrantSubPsicologica(false);
                  }}
                  className={`flex-1 text-left transition-colors ${
                    esUsuariAlpha ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer hover:text-white'
                  }`}
                  id="sidebar-btn-seccio-teorica"
                  title={esUsuariAlpha ? "Accés restringit per a testers Alpha" : undefined}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    1. PROVA TEÒRICA
                  </span>
                </button>

                {/* Clic a la fletxa: Permet veure l'estructura del menú */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAcordioExamenTeoricObert(!acordioExamenTeoricObert);
                  }}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer rounded transition-colors"
                  title={acordioExamenTeoricObert ? "Plegar menú" : "Desplegar menú"}
                >
                  {acordioExamenTeoricObert ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>

              {acordioExamenTeoricObert && (
                <div className="pl-3.5 py-2 flex flex-col gap-3 border-l border-red-500/10 ml-1.5">
                  
                  {/* =========================================================================
                      SUB-OCURRÈNCIA 1: EXAMEN TEÒRIC (DESPLEGABLE INTERN)
                      Explicació per a no-programadors: Aquest botó permet desplegar o amagar 
                      els 6 temes o mètodes d'estudi teòrics com els que trobem a l'APP.
                      ========================================================================= */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioTeoricObert(!subAcordioTeoricObert)}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] ${
                        esUsuariAlpha ? 'text-slate-500 hover:text-slate-400' : 'text-slate-202 hover:bg-slate-905'
                      }`}
                      id="btn-sub-examen-teoric"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${esUsuariAlpha ? 'bg-slate-600' : 'bg-red-500'}`} /> EXAMEN TEÒRIC
                      </span>
                      {subAcordioTeoricObert ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {subAcordioTeoricObert && (
                      <div className="pl-3 flex flex-col gap-1 border-l border-white/5 ml-1.5 mt-1 space-y-0.5">
                        
                        {/* 1. Temari Oficial */}
                        <button
                          id="opt-teorica-temari-oficial"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('teorica_temari_oficial');
                            setMostrarTresAmbitsInici(true);
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'teorica_temari_oficial' 
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Temari Oficial (DOGC)</span>
                        </button>

                        {/* 2. Temari OposiMossos */}
                        <button
                          id="opt-teorica-temari-oposimossos"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('teorica_temari_oposimossos');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'teorica_temari_oposimossos' 
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Area d'estudi personal</span>
                        </button>

                        {/* 3. Classes Premium */}
                        <button
                          id="opt-teorica-classes-premium"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('teorica_classes_premium');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'teorica_classes_premium' 
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Classes Premium</span>
                        </button>

                        {/* 4. Classes en Directe */}
                        <button
                          id="opt-teorica-classes-directe"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('teorica_classes_directe');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase relative ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'teorica_classes_directe' 
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Classes en Directe</span>
                          {!esUsuariAlpha && <span className="absolute right-2 top-2.5 w-1.5 h-1.5 rounded-full bg-[#00f296] animate-pulse" />}
                        </button>

                        {/* 5. Exàmens OposiMossos */}
                        <button
                          id="opt-teorica-examens-oposimossos"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('teorica_examens_oposimossos');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'teorica_examens_oposimossos' 
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Exàmens OposiMossos</span>
                        </button>

                        {/* 6. Exàmens Oficials Passats */}
                        <button
                          id="opt-teorica-examens-oficials"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('teorica_examens_oficials');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'teorica_examens_oficials' 
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Exàmens Oficials Passats</span>
                        </button>

                      </div>
                    )}
                  </div>

                  {/* =========================================================================
                      SUB-OCURRÈNCIA 2: EXAMEN PSICOTÈCNIC (DESPLEGABLE INTERN)
                      Explicació per a no-programadors: En clicar aquest element es desplegarà de 
                      forma immediata el llistat dels 10 exàmens psicotècnics d'entrenament ràpid.
                      ========================================================================= */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioPsicotecnicObert(!subAcordioPsicotecnicObert)}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] ${
                        esUsuariAlpha ? 'text-slate-500 hover:text-slate-400' : 'text-slate-205 hover:bg-slate-905'
                      }`}
                      id="btn-sub-examen-psicotecnic"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${esUsuariAlpha ? 'bg-slate-600' : 'bg-teal-500'}`} /> EXAMEN PSICOTÈCNIC
                      </span>
                      {subAcordioPsicotecnicObert ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {subAcordioPsicotecnicObert && (
                      <div className="pl-3 flex flex-col gap-1 border-l border-white/5 ml-1.5 mt-1 space-y-0.5">
                        {provesPsicotecnics.map((prova, i) => {
                          const actiu = seccioActiva === 'teorica_psicotecnics' && psicotecnicActiu === prova;
                          return (
                            <button
                              key={i}
                              id={`opt-psico-prova-${i}`}
                              disabled={esUsuariAlpha}
                              onClick={() => {
                                if (esUsuariAlpha) return;
                                setSeccioActiva('teorica_psicotecnics');
                                setPsicotecnicActiu(prova);
                              }}
                              className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                                esUsuariAlpha
                                  ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                                  : actiu 
                                    ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                    : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                              }`}
                            >
                              <span>- {prova}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* =========================================================================
                      SUB-OCURRÈNCIA 3: ACTUALITAT (DESPLEGABLE INTERN)
                      Explicació per a no-programadors: Botó per veure els blocs d'actualitat DOGC;
                      mostra l'última setmana, les notícies anuals i els exàmens d'actualitat.
                      ========================================================================= */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioActualitatObert(!subAcordioActualitatObert)}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] ${
                        esUsuariAlpha ? 'text-slate-500 hover:text-slate-400' : 'text-slate-205 hover:bg-slate-905'
                      }`}
                      id="btn-sub-actualitat"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${esUsuariAlpha ? 'bg-slate-600' : 'bg-emerald-500'}`} /> ACTUALITAT
                      </span>
                      {subAcordioActualitatObert ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {subAcordioActualitatObert && (
                      <div className="pl-3 flex flex-col gap-1 border-l border-white/5 ml-1.5 mt-1 space-y-0.5">
                        {provesActualitat.map((opcio, i) => {
                          const actiu = seccioActiva === 'teorica_actualitat' && actualitatActiva === opcio;
                          return (
                            <button
                              key={i}
                              id={`opt-actualitat-opcio-${i}`}
                              disabled={esUsuariAlpha}
                              onClick={() => {
                                if (esUsuariAlpha) return;
                                setSeccioActiva('teorica_actualitat');
                                setActualitatActiva(opcio);
                              }}
                              className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                                esUsuariAlpha
                                  ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                                  : actiu 
                                    ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                    : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                              }`}
                            >
                              <span>- {opcio}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* B. 2A FASE: PROVA FÍSICA INCLOENT SOTS-DESPLEGABLES SENSE ICONES (REGLA 1 I 3) */}
            {/* ----------------------------------------------------------------- */}
            <div className="space-y-1">
              <div 
                className={`w-full flex items-center justify-between py-2 px-1 border-b border-blue-900/15 transition-all ${
                  seccioActiva === 'avui' && mostrantSubFisica
                    ? 'text-[#FFDF00] bg-blue-950/40 rounded-lg px-2'
                    : esUsuariAlpha ? 'text-slate-500 opacity-60' : 'text-slate-205'
                }`}
                id="sidebar-container-seccio-fisica"
              >
                {/* Clic al títol: Porta directament al menú d'opcions de la prova física (Bloquejat si és usuari_alpha) */}
                <button
                  type="button"
                  disabled={esUsuariAlpha}
                  onClick={() => {
                    if (esUsuariAlpha) return;
                    setSeccioActiva('avui');
                    setMostrantSubTeoria(false);
                    setMostrantSubFisica(true);
                    setMostrantSubPsicologica(false);
                  }}
                  className={`flex-1 text-left transition-colors ${
                    esUsuariAlpha ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer hover:text-white'
                  }`}
                  id="sidebar-btn-seccio-fisica"
                  title={esUsuariAlpha ? "Accés restringit per a testers Alpha" : undefined}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    2. PROVA FÍSICA
                  </span>
                </button>

                {/* Clic a la fletxa: Permet veure l'estructura del menú */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAcordioProvesFisiquesObert(!acordioProvesFisiquesObert);
                  }}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer rounded transition-colors"
                  title={acordioProvesFisiquesObert ? "Plegar menú" : "Desplegar menú"}
                >
                  {acordioProvesFisiquesObert ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>

              {acordioProvesFisiquesObert && (
                <div className="pl-3.5 py-2 flex flex-col gap-3 border-l border-blue-500/10 ml-1.5">
                  
                  {/* ====== DESPLEGABLE INTERN 1: PROVES FÍSIQUES (3) ====== */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioProvesFisiques3Obert(!subAcordioProvesFisiques3Obert)}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] ${
                        esUsuariAlpha ? 'text-slate-500 hover:text-slate-400' : 'text-slate-205 hover:bg-slate-905'
                      }`}
                      id="btn-sub-proves-fisiques"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${esUsuariAlpha ? 'bg-slate-600' : 'bg-blue-500'}`} /> PROVES FÍSIQUES (3)
                      </span>
                      {subAcordioProvesFisiques3Obert ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {subAcordioProvesFisiques3Obert && (
                      <div className="pl-3 flex flex-col gap-1 border-l border-white/5 ml-1.5 mt-1 space-y-0.5">
                        
                        {/* 1. Press de banca */}
                        <button
                          id="opt-fisica-banca"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('fisica_proves');
                            setFisicaProvaActiva('Press de banca');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'fisica_proves' && fisicaProvaActiva === 'Press de banca'
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Press de banca</span>
                        </button>

                        {/* 2. Circuit d'agilitat */}
                        <button
                          id="opt-fisica-agilitat"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('fisica_proves');
                            setFisicaProvaActiva("Circuit d'agilitat");
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'fisica_proves' && fisicaProvaActiva === "Circuit d'agilitat"
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Circuit d'agilitat</span>
                        </button>

                        {/* 3. Curse Navette */}
                        <button
                          id="opt-fisica-navette"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('fisica_proves');
                            setFisicaProvaActiva('Curse Navette');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'fisica_proves' && fisicaProvaActiva === 'Curse Navette'
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Curse Navette</span>
                        </button>

                      </div>
                    )}
                  </div>

                  {/* ====== DESPLEGABLE INTERN 2: DIETA ====== */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioDietaObert(!subAcordioDietaObert)}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] ${
                        esUsuariAlpha ? 'text-slate-500 hover:text-slate-400' : 'text-slate-205 hover:bg-slate-905'
                      }`}
                      id="btn-sub-dieta"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${esUsuariAlpha ? 'bg-slate-600' : 'bg-amber-500'}`} /> DIETA
                      </span>
                      {subAcordioDietaObert ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {subAcordioDietaObert && (
                      <div className="pl-3 flex flex-col gap-1 border-l border-white/5 ml-1.5 mt-1 space-y-0.5">
                        
                        {/* 1. Dieta gratuïta */}
                        <button
                          id="opt-dieta-gratuita"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('fisica_dieta');
                            setDietaActiva('Dieta gratuïta');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'fisica_dieta' && dietaActiva === 'Dieta gratuïta'
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Dieta gratuïta</span>
                        </button>

                        {/* 2. Dieta Premium */}
                        <button
                          id="opt-dieta-premium"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('fisica_dieta');
                            setDietaActiva('Dieta premium');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'fisica_dieta' && dietaActiva === 'Dieta premium'
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Dieta premium</span>
                        </button>

                      </div>
                    )}
                  </div>

                  {/* ====== DESPLEGABLE INTERN 3: BUSCAR GIMNÀS ====== */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioBuscarGimnasObert(!subAcordioBuscarGimnasObert)}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] ${
                        esUsuariAlpha ? 'text-slate-500 hover:text-slate-400' : 'text-slate-205 hover:bg-slate-905'
                      }`}
                      id="btn-sub-buscar-gimnas"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${esUsuariAlpha ? 'bg-slate-600' : 'bg-emerald-500'}`} /> BUSCAR GIMNÀS
                      </span>
                      {subAcordioBuscarGimnasObert ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {subAcordioBuscarGimnasObert && (
                      <div className="pl-3 flex flex-col gap-1 border-l border-white/5 ml-1.5 mt-1 space-y-0.5">
                        
                        {/* 1. Buscar Gimnas */}
                        <button
                          id="opt-gimnas-cerca"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('fisica_gimnas');
                            setGimnasActiu('Buscar gimnàs');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'fisica_gimnas' && gimnasActiu === 'Buscar gimnàs'
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Buscar gimnàs</span>
                        </button>

                        {/* 2. Donar d'alta gimnàs */}
                        <button
                          id="opt-gimnas-alta"
                          disabled={esUsuariAlpha}
                          onClick={() => {
                            if (esUsuariAlpha) return;
                            setSeccioActiva('fisica_gimnas');
                            setGimnasActiu("Donar d'alta gimnàs");
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all font-bold italic text-[10px] uppercase ${
                            esUsuariAlpha
                              ? 'text-slate-600 cursor-not-allowed opacity-50 select-none'
                              : seccioActiva === 'fisica_gimnas' && gimnasActiu === "Donar d'alta gimnàs"
                                ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00] cursor-pointer' 
                                : 'hover:bg-slate-900 text-slate-400 border border-transparent cursor-pointer'
                          }`}
                        >
                          <span>- Donar d'alta gimnàs</span>
                        </button>

                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* C. 3A FASE: PROVA PSICOLÒGICA */}
            {/* ----------------------------------------------------------------- */}
            <div className="space-y-1">
              <div 
                className={`w-full flex items-center justify-between py-2 px-1 border-b border-blue-900/15 transition-all ${
                  seccioActiva === 'avui' && mostrantSubPsicologica
                    ? 'text-[#FFDF00] bg-blue-950/40 rounded-lg px-2'
                    : 'text-slate-205'
                }`}
                id="sidebar-container-seccio-psico"
              >
                {/* Clic al títol: Porta directament al menú de 3 botons de la prova psicològica sense obrir/tancar l'acordió */}
                <button
                  type="button"
                  onClick={() => {
                    setSeccioActiva('avui');
                    setMostrantSubTeoria(false);
                    setMostrantSubFisica(false);
                    setMostrantSubPsicologica(true);
                  }}
                  className="flex-1 text-left cursor-pointer hover:text-white transition-colors"
                  id="sidebar-btn-seccio-psico"
                >
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    3. PROVA PSICOLÒGICA
                  </span>
                </button>

                {/* Clic a la fletxa: Només aquest botó obre o tanca el desplegable del menú lateral */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAcordioPsicologicaObert(!acordioPsicologicaObert);
                  }}
                  className="p-1 hover:text-white text-slate-400 cursor-pointer rounded transition-colors"
                  title={acordioPsicologicaObert ? "Plegar menú" : "Desplegar menú"}
                  id="sidebar-toggle-arrow-psico"
                >
                  {acordioPsicologicaObert ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {acordioPsicologicaObert && (
                <div className="pl-3.5 py-2 flex flex-col gap-2 border-l border-purple-500/10 ml-1.5 font-sans">
                  
                  {/* ====== OPCIÓ 1: EN QUÈ CONSISTEIX LA PROVA ====== */}
                  <button
                    onClick={() => {
                      setSeccioActiva('psico_consisteix_prova');
                      setMostrantSubTeoria(false);
                      setMostrantSubFisica(false);
                      setMostrantSubPsicologica(false);
                      setMostrantSubBiodata(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] ${
                      seccioActiva === 'psico_consisteix_prova'
                        ? 'bg-blue-950/80 border border-emerald-500 text-emerald-400'
                        : 'text-slate-205 hover:bg-slate-905 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> En què consisteix la prova
                    </span>
                  </button>

                  {/* ====== OPCIÓ 2: PROVA - BIODATA ====== */}
                  <button
                    onClick={() => {
                      setSeccioActiva('avui');
                      setMostrantSubTeoria(false);
                      setMostrantSubFisica(false);
                      setMostrantSubPsicologica(false);
                      setMostrantSubBiodata(true);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] ${
                      seccioActiva === 'avui' && mostrantSubBiodata
                        ? 'bg-blue-950/80 border border-[#FFDF00] text-[#FFDF00]'
                        : 'text-slate-205 hover:bg-slate-905 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF00] shrink-0" /> Prova - Biodata
                    </span>
                  </button>

                  {/* ====== OPCIÓ 3: PROVA - ENTREVISTA ====== */}
                  <button
                    onClick={() => {
                      setSeccioActiva('avui');
                      setMostrantSubTeoria(false);
                      setMostrantSubFisica(false);
                      setMostrantSubPsicologica(false);
                      setMostrantSubBiodata(false);
                      setMostrantSubEntrevista(true);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] ${
                      (seccioActiva === 'avui' && mostrantSubEntrevista) || seccioActiva === 'psico_consisteix_entrevista' || seccioActiva === 'psico_entrevista_practica' || seccioActiva === 'psico_cita'
                        ? 'bg-blue-950/80 border border-[#FFDF00] text-[#FFDF00]'
                        : 'text-slate-205 hover:bg-slate-905 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF00] shrink-0" /> Prova - Entrevista
                    </span>
                  </button>

                </div>
              )}
            </div>

          </div>

        </div>

            {/* ACCIÓ INFERIOR: AMAGAR MENÚ */}
            {/* Explicació per a no-programadors: Botó d'acció groc per amagar i comprimir el menú lateral amb un sol clic */}
            <div className="p-3.5 lg:p-4 border-t border-blue-950/40 bg-slate-950/90">
              <button
                type="button"
                id="btn-amagar-menu-sidebar-bottom"
                onClick={() => setSidebarComprimit(true)}
                className="w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all duration-200 text-center cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 border border-amber-300/60"
              >
                <PanelLeftClose className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Amagar menú</span>
              </button>
            </div>
          </>
        )}

      </aside>

      {/* ========================================================================= */}
      {/* 2. ZONA DE CONTINGUT CENTRAL DRETA (WORK AREA MULTIFUNCIONS) EN DESKTOP */}
      {/* ========================================================================= */}
      <div 
        className="flex-1 flex flex-col max-h-screen overflow-hidden relative transition-all duration-700 bg-cover bg-center"
        style={fonsActiuUrl ? { 
          // Explicació per a no-programadors: Si estem a la benvinguda ("avui"), "Fase 3 / Prova Psicològica", "Temari Oficial", "Àrea d'Estudi", o "Classes Premium" apliquem menys opacitat fosca per gaudir de la imatge de fons amb millor presència i qualitat visual. En altres pantalles l'enfosquim fins al 90-94% per evitar contra-claredats.
          backgroundImage: (
            seccioActiva === 'avui' || 
            seccioActiva.startsWith('psico_') ||
            seccioActiva === 'teorica_temari_oficial' || 
            seccioActiva === 'teorica_temari_oposimossos' || 
            seccioActiva === 'teorica_classes_premium' || 
            seccioActiva === 'teorica_video_oposimossos' || 
            seccioActiva === 'teorica_classes_directe' ||
            seccioActiva === 'teorica_examens_oposimossos' ||
            seccioActiva === 'teorica_examens_oficials'
          ) 
            ? `linear-gradient(rgba(1, 9, 21, 0.70), rgba(1, 9, 21, 0.84)), url(${fonsActiuUrl})`
            : `linear-gradient(rgba(1, 9, 21, 0.90), rgba(1, 9, 21, 0.94)), url(${fonsActiuUrl})`
        } : undefined}
      >
        
        {/* REGLA 1 I 3 - L'ERA DE LEGO: CAPÇALERA SUPERIOR AMB ACCÉS A ZONA PERSONAL I EFECTE SIRENA */}
        {/* Explicació per a no-programadors: Aquest bloc és la capçalera superior dreta. Té l'indicador interactiu "OposiMossos" al centre. En lloc de canviar el text de color, canviem tot el fons d'aquesta capçalera simulant les llums de la policia (sirena de Mossos) cada minut, posant-la de color blau, vermell, i reestablint el fons original. */}
        <motion.header 
          animate={{
            backgroundColor: animationState === 'color1' ? '#3b82f6' : animationState === 'color2' ? '#ef4444' : 'rgba(2, 6, 23, 0.7)',
            boxShadow: animationState !== 'base' ? `0 10px 40px ${animationState === 'color1' ? '#3b82f6' : '#ef4444'}66` : 'none',
          }}
          transition={{ duration: 0.4 }}
          className="h-16 border-b border-blue-950/40 flex items-center justify-between px-6 sm:px-10 shrink-0 select-none relative z-50 text-white"
        >
          {/* Esquerra buida per equilibrar el format del Disseny de fulls de Lego */}
          <div className="w-40 hidden sm:block"></div>
          
          {/* Centre: Títol OposiMossos que retorna a l'estat d'inici 'avui' en fer click */}
          <div 
            onClick={() => setSeccioActiva('avui')}
            className="text-center flex flex-col items-center cursor-pointer group"
          >
            <span 
              className={`text-base font-black uppercase italic transition-all duration-300 inline-block group-hover:scale-105 ${
                animationState !== 'base' 
                  ? 'text-white scale-[1.05] tracking-[0.25em]' 
                  : 'text-[#FFDF00] tracking-[0.2em]'
              }`}
            >
              OposiMossos
            </span>
          </div>

          {/* Dreta: Botó amb el nom de l'alumne per anar a la seva zona personal */}
          <div ref={perfilContenidorRef} className="w-52 flex justify-end relative">
            {/* Explicació per a no-programadors: Aquest botó obre o tanca un menú flotant d'opcions personals (perfil de l'estudiant). Mostra en temps real el nom de l'usuari/estudiant llegit des de la base de dades. */}
            <button 
              id="btn-perfil-personal-alumne"
              type="button"
              onClick={() => setDesplegablePerfilObert(prev => !prev)}
              className={`py-1.5 px-3.5 rounded-full text-[10.5px] font-black italic uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer flex items-center gap-1.5 ${
                animationState !== 'base'
                  ? 'bg-white/15 hover:bg-white/25 border border-white/20 text-white'
                  : 'bg-[#02142d]/80 hover:bg-[#062040]/70 border border-blue-900/35 text-slate-200 shadow-md shadow-blue-950/20'
              }`}
            >
              <span>{nomEstudiantReal}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${desplegablePerfilObert ? 'rotate-180' : ''}`} />
            </button>

            {/* Explicació per a no-programadors: Aquest és el quadre desplegable d'opcions (Dropdown) d'estil flotant. S'obre únicament quan l'alumne fa clic sobre el seu nom d'usuari de dalt. De moment les opcions estan inventades pel disseny sense funcionalitat complexa tal com es desitja. */}
            {desplegablePerfilObert && (
              <div 
                className="absolute right-0 top-11 w-56 bg-slate-950/95 border border-blue-900/40 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 text-left"
              >
                {/* Capçalera del Perfil o Detalls d'estat de connexió */}
                <div className="px-3.5 py-2.5 border-b border-blue-950/40 mb-1.5">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#FFDF00] font-black leading-none">Estat del Campus</p>
                  <p className="text-[11px] font-bold text-slate-350 mt-1 truncate">
                    {auth.currentUser?.email || 'estudiant@oposicat.cat'}
                  </p>
                </div>
                
                {/* Botons d'opcions interactius de moment buits */}
                <button
                  type="button"
                  className="w-full text-left py-2 px-3.5 text-[11px] font-bold uppercase italic tracking-wider text-slate-200 hover:bg-slate-900 border border-transparent hover:border-blue-950/40 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                  onClick={() => setDesplegablePerfilObert(false)}
                >
                  <span className="group-hover:text-[#FFDF00] transition-colors">👤 El meu Perfil</span>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Actiu</span>
                </button>

                <button
                  type="button"
                  className="w-full text-left py-2 px-3.5 text-[11px] font-bold uppercase italic tracking-wider text-slate-250 hover:bg-slate-900 border border-transparent hover:border-blue-950/40 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                  onClick={() => setDesplegablePerfilObert(false)}
                >
                  <span className="group-hover:text-[#FFDF00] transition-colors">📊 El meu Progrés</span>
                </button>

                <button
                  type="button"
                  className="w-full text-left py-2 px-3.5 text-[11px] font-bold uppercase italic tracking-wider text-slate-250 hover:bg-slate-900 border border-transparent hover:border-blue-950/40 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                  onClick={() => setDesplegablePerfilObert(false)}
                >
                  <span className="group-hover:text-[#FFDF00] transition-colors">⚙️ Configuració</span>
                </button>

                <button
                  type="button"
                  className="w-full text-left py-2 px-3.5 text-[11px] font-bold uppercase italic tracking-wider text-slate-250 hover:bg-slate-900 border border-transparent hover:border-blue-950/40 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                  onClick={() => setDesplegablePerfilObert(false)}
                >
                  <span className="group-hover:text-[#FFDF00] transition-colors">🔑 Canviar Contrasenya</span>
                </button>

                {/* Acció de Sortida o tancament de sessió del Campus */}
                <div className="border-t border-blue-950/40 mt-1.5 pt-1.5">
                  <button
                    type="button"
                    className="w-full text-left py-2.5 px-3.5 text-[11px] font-black uppercase italic tracking-wider text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                    onClick={async () => {
                      // Comentari planer per a no-programadors: Quan l'estudiant clica a Tancar Sessió, tanquem la seva sessió de Firebase de forma segura i el redirigim a la pantalla de Login
                      setDesplegablePerfilObert(false);
                      try {
                        await tancarSessio();
                      } catch (err) {
                        console.error("Error tancant sessió:", err);
                      }
                      onTornarLanding();
                    }}
                  >
                    <span className="group-hover:text-red-300 transition-colors">🚪 Tancar Sessió</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* Explicació per a no-programadors: Fem servir un contenidor intern de dades. Per al visualitzador de vídeo o mode split compacte, el fem totalment ample arribant fins al lateral mateix del menú tacti de l'esquerra (max-w-none). Per a les classes en directe, demanades més amples pel client, li apliquem un max-w-7xl ampli. Per a les altres de l'oposició, mantenim la distribució de max-w-6xl clàssica. */}
          <div className={`flex flex-col gap-6 w-full mx-auto pb-20 ${
            seccioActiva === 'teorica_video_oposimossos' 
              ? 'max-w-none p-4 md:p-6' 
              : seccioActiva === 'teorica_classes_directe'
              ? 'p-6 sm:p-10 max-w-7xl'
              : 'p-6 sm:p-10 max-w-6xl'
          }`}>
        
        {/* CAPÇALERA MULTI-SITUACIÓ (Oculta a la pantalla d'inici, a 'En què consisteix la prova', 'Consisteix Biodata', 'Competències clau', 'Qüestionari Biogràfic' i les pantalles d'Entrevista per evitar sobrecàrrega visual i títols redundants) */}
        {seccioActiva !== 'avui' && seccioActiva !== 'psico_consisteix_prova' && seccioActiva !== 'psico_consisteix_biodata' && seccioActiva !== 'psico_competencies' && seccioActiva !== 'psico_biodata' && seccioActiva !== 'psico_consisteix_entrevista' && seccioActiva !== 'psico_entrevista_practica' && seccioActiva !== 'psico_cita' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-950/35 pb-5 w-full animate-in fade-in duration-300">
            <div>
              <header className="mb-1 shrink-0">
                <span className="text-[#FFDF00] text-[9.5px] font-black uppercase tracking-[0.25em] block">
                  CAMPUS WEB DIGITAL • OPOSIMOSSOS
                </span>
              </header>
              <h1 className="text-xl font-black italic uppercase text-white tracking-wide">
                {/* Comentari planer per a no-programadors: Restaurem el títol mostrat a la capçalera de "Fase 1 - Prova teòrica" segons la comanda per desfer els canvis d'Area d'estudi */}
                {seccioActiva.startsWith('teorica') && "📋 Fase 1 - Prova teòrica"}
                {seccioActiva.startsWith('fisica') && "🏃 FASE 2: PREPARACIÓ I PROVES FÍSIQUES"}
                {seccioActiva.startsWith('psico') && "🧠 FASE 3: AVALUACIÓ PSICOPROFESSIONAL"}
              </h1>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                {seccioActiva.startsWith('teorica') && "Temari oficial de l'oposició de Mossos d'Esquadra."}
                {seccioActiva.startsWith('fisica') && "Mesura els teus temps en el circuit de velocitat, descarrega la dieta o cerca centres de preparació."}
                {seccioActiva.startsWith('psico') && "Analitza la teva conducta de Biodata en viu, repassa preguntes de tribunals o bloqueja cita de repàs."}
              </p>
            </div>

            <button 
              onClick={onObrirAppMobilSimulacre}
              className="lg:hidden bg-red-650 text-white font-black uppercase italic tracking-wider text-[10px] px-4 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              Obrir versió mòbil adaptada
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* A. RENDERITZADOR CONDICIONAL DE SECCIONS */}
        {/* ========================================== */}

        {/* PANTALLA INICIAL NEUTRE - QUÈ VOLS FER AVUI? (ESTIL FIN DE MOCKUP) */}
        {/* Explicació per a no-programadors: Aquesta és la pantalla inicial neta de benvinguda. S'ha augmentat clarament la separació vertical (gap-32 sm:gap-40) per empènyer els botons cap a la meitat inferior del panell, imitant perfectament la distribució de la imatge del client. A més, s'ha reduït l'amplada dels botons a 28rem (uns 450px) i el farcit a dalt i a baix (py-5) perquè es vegin una mica més estilitzats, reajustant el traçat de les línies grises delimitadores de l'esquerra i la dreta. */}
        {seccioActiva === 'avui' && (
          <div className="flex-1 flex flex-col items-center pt-10 sm:pt-20 pb-16 px-4 max-w-4xl mx-auto text-center gap-24 sm:gap-32 animate-in fade-in slide-in-from-bottom-6 duration-500">
            
            {/* Explicació per a no-programadors: Canviem de forma dinàmica la capçalera si l'usuari ha seleccionat la Prova Teòrica, Física, Psicològica, Prova Biodata, Test Competencial o Prova Entrevista */}
            {!mostrantSubTeoria && !mostrantSubFisica && !mostrantSubPsicologica && !mostrantSubBiodata && !mostrantSubTestCompetencial && !mostrantSubEntrevista ? (
              <div className="space-y-4">
                <h2 className="text-4xl sm:text-[3rem] font-black tracking-tight text-white font-sans antialiased uppercase">
                  Què vols fer avui?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-semibold max-w-lg mx-auto italic tracking-wide">
                  Selecciona la fase de l'oposició per començar a preparar-te
                </p>
              </div>
            ) : mostrantSubTeoria ? (
              <div className="space-y-4">
                <span className="text-[#FFDF00] uppercase font-black italic tracking-widest text-xs">Fase 1: Prova Teòrica</span>
                <h2 className="text-3xl sm:text-[2.6rem] font-black tracking-tight text-white font-sans antialiased uppercase">
                  Àrea d'estudi teòric
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-semibold max-w-lg mx-auto italic tracking-wide">
                  Selecciona el contingut que vols treballar per començar la teva sessió d'estudi
                </p>
              </div>
            ) : mostrantSubFisica ? (
              <div className="space-y-4">
                <span className="text-[#FFDF00] uppercase font-black italic tracking-widest text-xs">Fase 2: Prova Física</span>
                <h2 className="text-3xl sm:text-[2.6rem] font-black tracking-tight text-white font-sans antialiased uppercase">
                  Àrea de preparació física
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-semibold max-w-lg mx-auto italic tracking-wide">
                  Selecciona el contingut que vols treballar per començar la teva sessió d'entrenament
                </p>
              </div>
            ) : mostrantSubTestCompetencial ? (
              <div className="space-y-3">
                <span className="text-[#FFDF00] uppercase font-black italic tracking-wider text-base sm:text-lg lg:text-xl block drop-shadow-md">
                  Fase 3 : Prova d'adequació psicoprofessional
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold tracking-normal text-slate-100 font-sans antialiased uppercase max-w-2xl mx-auto leading-snug">
                  Preparació del Test Competencial
                </h2>
              </div>
            ) : mostrantSubBiodata ? (
              <div className="space-y-3">
                <span className="text-[#FFDF00] uppercase font-black italic tracking-wider text-base sm:text-lg lg:text-xl block drop-shadow-md">
                  Fase 3 : Prova d'adequació psicoprofessional
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold tracking-normal text-slate-100 font-sans antialiased uppercase max-w-2xl mx-auto leading-snug">
                  Preparació de la Prova Biodata
                </h2>
              </div>
            ) : mostrantSubEntrevista ? (
              <div className="space-y-3">
                <span className="text-[#FFDF00] uppercase font-black italic tracking-wider text-base sm:text-lg lg:text-xl block drop-shadow-md">
                  Fase 3 : Prova d'adequació psicoprofessional
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold tracking-normal text-slate-100 font-sans antialiased uppercase max-w-2xl mx-auto leading-snug">
                  Preparació de la Prova Entrevista
                </h2>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-[#FFDF00] uppercase font-black italic tracking-wider text-base sm:text-lg lg:text-xl block drop-shadow-md">
                  Fase 3 : Prova d'adequació psicoprofessional
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold tracking-normal text-slate-100 font-sans antialiased uppercase max-w-2xl mx-auto leading-snug">
                  Àrea de preparació integral de la prova psicoprofessional
                </h2>
              </div>
            )}
            
            {/* Explicació per a no-programadors: Si no s'ha triat cap submenú, pintem el triadre de botons principal. */}
            {!mostrantSubTeoria && !mostrantSubFisica && !mostrantSubPsicologica && !mostrantSubBiodata && !mostrantSubTestCompetencial && !mostrantSubEntrevista ? (
              <div className="relative w-full sm:w-[28rem] select-none z-10 transition-all duration-300">
                {/* Línia vertical gris a l'esquerra dibuixada al croquis del client */}
                <div className="absolute -left-10 lg:-left-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                
                <div className="flex flex-col gap-6 w-full">
                  
                  {/* Botó 1: Prova teòrica (Deshabilitat i en gris per a usuari_alpha) */}
                  <button
                    id="btn-index-prova-teorica"
                    disabled={esUsuariAlpha}
                    onClick={() => {
                      if (esUsuariAlpha) return;
                      // Explicació per a no-programadors: En comptes de carregar el temari immediatament, obrim el nou pas de selecció de les 6 opcions de teoria demanat per l'opositor.
                      setMostrantSubTeoria(true);
                    }}
                    title={esUsuariAlpha ? "Accés restringit per a testers Alpha" : undefined}
                    className={
                      esUsuariAlpha
                        ? "relative w-full bg-slate-800/80 border-2 border-slate-700/60 text-slate-500 font-black italic uppercase tracking-[0.22em] py-5 px-10 rounded-full cursor-not-allowed opacity-60 text-center text-sm shadow-none select-none"
                        : "group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.22em] py-5 px-10 rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-sm border-2 border-transparent"
                    }
                  >
                    Prova teòrica
                  </button>
 
                  {/* Botó 2: Prova física (Deshabilitat i en gris per a usuari_alpha) */}
                  <button
                    id="btn-index-prova-fisica"
                    disabled={esUsuariAlpha}
                    onClick={() => {
                      if (esUsuariAlpha) return;
                      setMostrantSubFisica(true);
                    }}
                    title={esUsuariAlpha ? "Accés restringit per a testers Alpha" : undefined}
                    className={
                      esUsuariAlpha
                        ? "relative w-full bg-slate-800/80 border-2 border-slate-700/60 text-slate-500 font-black italic uppercase tracking-[0.22em] py-5 px-10 rounded-full cursor-not-allowed opacity-60 text-center text-sm shadow-none select-none"
                        : "group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.22em] py-5 px-10 rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-sm border-2 border-transparent"
                    }
                  >
                    Prova física
                  </button>
 
                  {/* Botó 3: Prova psicològica (Obre el menú de 3 opcions: En què consisteix la prova, Prova - Biodata i Prova - Entrevista) */}
                  <button
                    id="btn-index-prova-psicologica"
                    onClick={() => {
                      setMostrantSubPsicologica(true);
                    }}
                    className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.22em] py-5 px-10 rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-sm border-2 border-transparent"
                  >
                    Prova psicològica
                  </button>
 
                </div>
 
                {/* Línia vertical gris a la dreta dibuixada al croquis del client */}
                <div className="absolute -right-10 lg:-right-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
              </div>
            ) : mostrantSubTeoria ? (
              // Explicació per a no-programadors: Aquest és el segon pas d'estudis de teoria (les 6 sub-opcions de l'esquerra). Dissenyem una quadrícula de dues columnes per a una ergonomia impecable. Retornem al disseny original sense la imatge de fons demanada en el canvi anterior.
              <div className="flex flex-col items-center gap-8 w-full animate-in fade-in duration-300">
                <div className="relative w-full sm:w-[35rem] select-none z-10 transition-all duration-300">
                  {/* Línia vertical gris a l'esquerra dibuixada al croquis del client adaptada a l'alçada */}
                  <div className="absolute -left-10 lg:-left-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    
                    {/* Opció 1: Temari Oficial (DOGC) */}
                    <button
                      id="sub-opt-temari-oficial"
                      onClick={() => {
                        setSeccioActiva('teorica_temari_oficial');
                        setAcordioExamenTeoricObert(true);
                        setSubAcordioTeoricObert(true);
                        setMostrarTresAmbitsInici(true);
                      }}
                      className="group relative bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      Temari Oficial (DOGC)
                    </button>
 
                     {/* Opció 2: Àrea d'Estudi Personal */}
                    <button
                      id="sub-opt-estudi-personal"
                      onClick={() => {
                        setSeccioActiva('teorica_temari_oposimossos');
                        setAcordioExamenTeoricObert(true);
                        setSubAcordioTeoricObert(true);
                      }}
                      className="group relative bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      Àrea d'Estudi Personal
                    </button>
 
                     {/* Opció 3: Classes Premium */}
                    <button
                      id="sub-opt-classes-premium"
                      onClick={() => {
                        setSeccioActiva('teorica_classes_premium');
                        setAcordioExamenTeoricObert(true);
                        setSubAcordioTeoricObert(true);
                      }}
                      className="group relative bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      Classes Premium
                    </button>
 
                     {/* Opció 4: Classes en Directe */}
                    <button
                      id="sub-opt-classes-directe"
                      onClick={() => {
                        setSeccioActiva('teorica_classes_directe');
                        setAcordioExamenTeoricObert(true);
                        setSubAcordioTeoricObert(true);
                      }}
                      className="group relative bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px] relative overflow-hidden"
                    >
                      Classes en Directe
                      <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-[#00f296] animate-pulse" />
                    </button>
 
                     {/* Opció 5: Exàmens OposiMossos */}
                    <button
                      id="sub-opt-examens-oposimossos"
                      onClick={() => {
                        setSeccioActiva('teorica_examens_oposimossos');
                        setAcordioExamenTeoricObert(true);
                        setSubAcordioTeoricObert(true);
                      }}
                      className="group relative bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      Exàmens OposiMossos
                    </button>
 
                     {/* Opció 6: Exàmens Oficials Passats */}
                    <button
                      id="sub-opt-examens-oficials"
                      onClick={() => {
                        setSeccioActiva('teorica_examens_oficials');
                        setAcordioExamenTeoricObert(true);
                        setSubAcordioTeoricObert(true);
                      }}
                      className="group relative bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      Exàmens Oficials Passats
                    </button>
 
                     {/* Explicació per a no-programadors: Nou botó d'Actualitat de color blau per obrir immediatament les notícies sectorials i simulacres DOGC des d'aquest menú principal d'estudi teòric. */}
                    <button
                      id="sub-opt-actualitat"
                      onClick={() => {
                        setSeccioActiva('teorica_actualitat');
                        setAcordioExamenTeoricObert(true);
                        setSubAcordioActualitatObert(true);
                      }}
                      className="group relative bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      Actualitat (DOGC)
                    </button>
 
                     {/* Explicació per a no-programadors: Nou botó d'Exàmens Psicotècnics de color verd clar per obrir l'àrea ràpida de testos abstractes, numèrics i espacials demanats per l'opositor. */}
                    <button
                      id="sub-opt-psicotecnics"
                      onClick={() => {
                        setSeccioActiva('teorica_psicotecnics');
                        setAcordioExamenTeoricObert(true);
                        setSubAcordioPsicotecnicObert(true);
                      }}
                      className="group relative bg-[#00f296] hover:bg-emerald-400 text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      Psicotècnics
                    </button>
 
                   </div>
 
                   {/* Línia vertical gris a la dreta dibuixada al croquis del client */}
                   <div className="absolute -right-10 lg:-right-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                 </div>
 
                 {/* Botó de tornada enrere: Permet tornar al pas anterior de 3 botons de forma completament fàcil i usable */}
                 <button
                   onClick={() => setMostrantSubTeoria(false)}
                   className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-6 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer"
                 >
                   <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                   <span>Tornar al menú principal</span>
                 </button>
               </div>
            ) : mostrantSubFisica ? (
              // Explicació per a no-programadors: Aquest és el segon pas d'estudis de preparació física, dissenyat de manera exactament equivalent a l'àrea d'estudi teòric sota un equilibri increïble de colors i píndoles de disseny.
              <div className="flex flex-col items-center gap-8 w-full animate-in fade-in duration-300">
                <div className="relative w-full sm:w-[35rem] select-none z-10 transition-all duration-300">
                  {/* Línia vertical gris a l'esquerra dibuixada al croquis del client adaptada a l'alçada */}
                  <div className="absolute -left-10 lg:-left-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    
                    {/* Opció 1: Press de banca - color groc */}
                    <button
                      id="sub-opt-fisica-banca"
                      onClick={() => {
                        setSeccioActiva('fisica_proves');
                        setFisicaProvaActiva('Press de banca');
                        setAcordioProvesFisiquesObert(true);
                        setSubAcordioProvesFisiques3Obert(true);
                      }}
                      className="group relative bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      🏋️‍♂️ Press banc
                    </button>

                    {/* Opció 2: Circuit d'agilitat - color groc */}
                    <button
                      id="sub-opt-fisica-agilitat"
                      onClick={() => {
                        setSeccioActiva('fisica_proves');
                        setFisicaProvaActiva("Circuit d'agilitat");
                        setAcordioProvesFisiquesObert(true);
                        setSubAcordioProvesFisiques3Obert(true);
                      }}
                      className="group relative bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      🏃‍♂️ Agilitat
                    </button>

                    {/* Opció 3: Curse Navette - color groc */}
                    <button
                      id="sub-opt-fisica-navette"
                      onClick={() => {
                        setSeccioActiva('fisica_proves');
                        setFisicaProvaActiva('Curse Navette');
                        setAcordioProvesFisiquesObert(true);
                        setSubAcordioProvesFisiques3Obert(true);
                      }}
                      className="group relative bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      🫁 Curse navette
                    </button>

                    {/* Opció 4: Dieta esport - color verd */}
                    <button
                      id="sub-opt-fisica-dieta"
                      onClick={() => {
                        setSeccioActiva('fisica_dieta');
                        if (!dietaActiva) setDietaActiva('Dieta gratuïta');
                        setAcordioProvesFisiquesObert(true);
                        setSubAcordioProvesFisiques3Obert(true);
                      }}
                      className="group relative bg-[#00f296] hover:bg-emerald-400 text-slate-950 font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      🥗 Dieta esport
                    </button>

                    {/* Opció 5: Buscar gimnàs - color blau */}
                    <button
                      id="sub-opt-fisica-gimnas"
                      onClick={() => {
                        setSeccioActiva('fisica_gimnas');
                        setGimnasActiu('Buscar gimnàs');
                        setAcordioProvesFisiquesObert(true);
                        setSubAcordioProvesFisiques3Obert(true);
                      }}
                      className="group relative bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-wider py-4 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-xs flex items-center justify-center min-h-[60px]"
                    >
                      📍 Buscar gimnàs
                    </button>

                  </div>

                  {/* Línia vertical gris a la dreta dibuixada al croquis del client */}
                  <div className="absolute -right-10 lg:-right-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                </div>

                {/* Botó de tornada enrere: Permet tornar al pas anterior de 3 botons de forma completament fàcil i usable */}
                <button
                  onClick={() => setMostrantSubFisica(false)}
                  className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-6 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                  <span>Tornar al menú principal</span>
                </button>
              </div>
            ) : mostrantSubBiodata ? (
              // Explicació per a no-programadors: Menú dedicat a la "Prova Biodata" amb exactament 3 botons clars i usables:
              // 1. «En què consisteix la prova» (Verd)
              // 2. «Practicar el test biodata» (Groc)
              // 3. «El meu perfil psicoprofesional (Resultat del test)» (Groc / Daurat)
              <div className="flex flex-col items-center gap-8 w-full animate-in fade-in duration-200">
                <div className="relative w-full sm:w-[28rem] select-none z-10">
                  {/* Línia vertical gris a l'esquerra dibuixada al croquis del client */}
                  <div className="absolute -left-10 lg:-left-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                  
                  <div className="flex flex-col gap-6 w-full">
                    
                    {/* ====== BLOC 1: EN QUÈ CONSISTEIX LA PROVA (VERD) ====== */}
                    <div className="w-full">
                      <button
                        id="sub-opt-biodata-consisteix"
                        onClick={() => {
                          setSeccioActiva('psico_consisteix_biodata');
                        }}
                        className="group relative w-full bg-[#00f296] hover:bg-[#00d984] text-slate-950 font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                      >
                        En què consisteix la prova
                      </button>
                    </div>

                    {/* ====== BLOC 2: COM ES PUNTUA - COMPETÈNCIES CLAU (BLAU) ====== */}
                    <div className="w-full">
                      <button
                        id="sub-opt-biodata-com-es-puntua"
                        onClick={() => {
                          setSeccioActiva('psico_competencies');
                          setPsicoSubSeccioActiva('Apren com es puntua');
                        }}
                        className="group relative w-full bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent shadow-blue-900/30"
                      >
                        Com es puntua - Competències clau
                      </button>
                    </div>

                    {/* ====== BLOC 3: LES 2 PROVES (GROC) ====== */}
                    <div className="flex flex-col items-start gap-4 w-full pt-1">
                      <p className="text-xs sm:text-sm text-slate-400 font-semibold italic tracking-wide text-left pl-1">
                        Selecciona quina prova vols realitzar :
                      </p>
                      
                      <div className="flex flex-col gap-4 w-full">
                        {/* Opció 1 de Bloc 3: QÜESTIONARI BIOGRÀFIC */}
                        <button
                          id="sub-opt-biodata-questionari-biografic"
                          onClick={() => {
                            setSeccioActiva('psico_biodata');
                            setPsicoSubSeccioActiva('preguntes personals');
                            setAcordioPsicologicaObert(true);
                            setSubAcordioPsicoBiodataObert(true);
                          }}
                          className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                        >
                          Qüestionari biogràfic
                        </button>

                        {/* Opció 2 de Bloc 3: TEST COMPETENCIAL */}
                        <button
                          id="sub-opt-biodata-test-competencial"
                          onClick={() => {
                            setMostrantSubBiodata(false);
                            setMostrantSubTestCompetencial(true);
                            setMostrantSubPsicologica(false);
                            setSeccioActiva('avui');
                          }}
                          className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                        >
                          Test competencial
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Línia vertical gris a la dreta dibuixada al croquis del client */}
                  <div className="absolute -right-10 lg:-right-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                </div>

                {/* Botons de navegació de tornada enrere */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    onClick={() => {
                      setMostrantSubBiodata(false);
                      setMostrantSubPsicologica(true);
                    }}
                    className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-purple-500/40 hover:text-purple-400 duration-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    <span>Tornar a la prova psicològica</span>
                  </button>

                  <button
                    onClick={() => {
                      setMostrantSubBiodata(false);
                      setMostrantSubPsicologica(false);
                      setSeccioActiva('avui');
                    }}
                    className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-slate-400 active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer"
                  >
                    <span>Menú principal</span>
                  </button>
                </div>
              </div>
            ) : mostrantSubTestCompetencial ? (
              // Explicació per a no-programadors: Menú dedicat a "Test competencial" (dins de Prova - Biodata).
              // Conté exactament els 3 botons sol·licitats pel client:
              // 1. «En que consisteix la prova» (Verd clar)
              // 2. «Test biodata» (Groc)
              // 3. «Perfil Competencial» (Groc) amb el label informatiu superior: "Resultats del biodata"
              <div className="flex flex-col items-center gap-8 w-full animate-in fade-in duration-200">
                <div className="relative w-full sm:w-[28rem] select-none z-10">
                  {/* Línia vertical gris a l'esquerra dibuixada al croquis del client */}
                  <div className="absolute -left-10 lg:-left-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                  
                  <div className="flex flex-col gap-6 w-full">
                    
                    {/* ====== BOTÓ 1: EN QUE CONSISTEIX LA PROVA (VERD) ====== */}
                    <div className="w-full">
                      <button
                        id="sub-opt-test-competencial-consisteix"
                        onClick={() => {
                          setSeccioActiva('psico_consisteix_biodata');
                        }}
                        className="group relative w-full bg-[#00f296] hover:bg-[#00d984] text-slate-950 font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                      >
                        En que consisteix la prova
                      </button>
                    </div>

                    {/* ====== BOTÓ 2: TEST BIODATA (GROC) ====== */}
                    <div className="w-full">
                      <button
                        id="sub-opt-test-competencial-test-biodata"
                        onClick={() => {
                          setSeccioActiva('psico_biodata');
                          setPsicoSubSeccioActiva('test biodata practica');
                          setAcordioPsicologicaObert(true);
                          setSubAcordioPsicoBiodataObert(true);
                        }}
                        className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                      >
                        Test biodata
                      </button>
                    </div>

                    {/* ====== BOTÓ 3: PERFIL COMPETENCIAL (AMB LABEL INFORMATIU SUPERIOR: RESULTATS DEL BIODATA) ====== */}
                    <div className="flex flex-col items-start gap-1.5 w-full">
                      {/* Label informatiu damunt del botó */}
                      <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#FFDF00] pl-3 self-start font-mono flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFDF00] animate-pulse"></span>
                        Resultats del biodata
                      </span>
                      
                      <button
                        id="sub-opt-test-competencial-perfil"
                        onClick={() => {
                          setSeccioActiva('psico_biodata');
                          setPsicoSubSeccioActiva('test biodata perfil');
                          setAcordioPsicologicaObert(true);
                          setSubAcordioPsicoBiodataObert(true);
                        }}
                        className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                      >
                        Perfil Competencial
                      </button>
                    </div>

                  </div>

                  {/* Línia vertical gris a la dreta dibuixada al croquis del client */}
                  <div className="absolute -right-10 lg:-right-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                </div>

                {/* Botons de navegació de tornada enrere */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    onClick={() => {
                      setMostrantSubTestCompetencial(false);
                      setMostrantSubBiodata(true);
                    }}
                    className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-amber-500/40 hover:text-amber-400 duration-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    <span>Tornar a Prova - Biodata</span>
                  </button>

                  <button
                    onClick={() => {
                      setMostrantSubTestCompetencial(false);
                      setMostrantSubBiodata(false);
                      setMostrantSubPsicologica(false);
                      setSeccioActiva('avui');
                    }}
                    className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-slate-400 active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer"
                  >
                    <span>Menú principal</span>
                  </button>
                </div>
              </div>
            ) : mostrantSubEntrevista ? (
              // Explicació per a no-programadors: Menú dedicat a la "Prova - Entrevista" amb 3 botons estructurats:
              // - 1 (Verd): «En què consisteix l'entrevista»
              // - 2 (Groc): «Practicar l'entrevista»
              // - 3 (Groc): «Demanar cita»
              <div className="flex flex-col items-center gap-8 w-full animate-in fade-in duration-200">
                <div className="relative w-full sm:w-[28rem] select-none z-10">
                  {/* Línia vertical gris a l'esquerra dibuixada al croquis del client */}
                  <div className="absolute -left-10 lg:-left-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                  
                  <div className="flex flex-col gap-6 w-full">
                    
                    {/* ====== BLOC 1: EN QUÈ CONSISTEIX L'ENTREVISTA (VERD) ====== */}
                    <div className="w-full">
                      <button
                        id="sub-opt-entrevista-consisteix"
                        onClick={() => {
                          setSeccioActiva('psico_consisteix_entrevista');
                        }}
                        className="group relative w-full bg-[#00f296] hover:bg-emerald-400 text-slate-950 font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                      >
                        En què consisteix l'entrevista
                      </button>
                    </div>

                    {/* ====== BLOC 2: ELS 2 BOTONS D'ACCIÓ (GROC) ====== */}
                    <div className="flex flex-col items-start gap-4 w-full pt-1">
                      <p className="text-xs sm:text-sm text-slate-400 font-semibold italic tracking-wide text-left pl-1">
                        Selecciona quina opció vols practicar :
                      </p>
                      
                      <div className="flex flex-col gap-4 w-full">
                        {/* Opció 1: PRACTICAR L'ENTREVISTA */}
                        <button
                          id="sub-opt-entrevista-practicar"
                          onClick={() => {
                            setSeccioActiva('psico_entrevista_practica');
                          }}
                          className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                        >
                          Practicar l'entrevista
                        </button>

                        {/* Opció 2: DEMANAR CITA */}
                        <button
                          id="sub-opt-entrevista-demanar-cita"
                          onClick={() => {
                            setSeccioActiva('psico_cita');
                          }}
                          className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.20em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                        >
                          Demanar cita
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Línia vertical gris a la dreta dibuixada al croquis del client */}
                  <div className="absolute -right-10 lg:-right-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                </div>

                {/* Botons de navegació de tornada enrere */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    onClick={() => {
                      setMostrantSubEntrevista(false);
                      setMostrantSubPsicologica(true);
                    }}
                    className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-purple-500/40 hover:text-purple-400 duration-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    <span>Tornar a la prova psicològica</span>
                  </button>

                  <button
                    onClick={() => {
                      setMostrantSubEntrevista(false);
                      setMostrantSubPsicologica(false);
                      setSeccioActiva('avui');
                    }}
                    className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-slate-400 active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer"
                  >
                    <span>Menú principal</span>
                  </button>
                </div>
              </div>
            ) : (
              // Explicació per a no-programadors: Aquest és el menú de la Prova Psicològica organitzat en 2 blocs ben diferenciats i separats:
              // - Bloc 1 (Verd corporatiu elegant): «En què consisteix la prova» a la part superior
              // - Bloc 2 (Groc corporatiu): El text explicatiu «Selecciona el bloc...» just damunt dels 2 botons «Prova - Biodata» i «Prova - Entrevista»
              // S'ha eliminat l'animació d'escalat d'entrada molest i es manté un suau desplaçament en passar el ratolí.
              <div className="flex flex-col items-center gap-8 w-full">
                <div className="relative w-full sm:w-[28rem] select-none z-10">
                  {/* Línia vertical gris a l'esquerra dibuixada al croquis del client */}
                  <div className="absolute -left-10 lg:-left-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                  
                  <div className="flex flex-col gap-8 w-full">
                    
                    {/* ====== BLOC 1: EN QUÈ CONSISTEIX LA PROVA (VERD A DALT) ====== */}
                    <div className="w-full">
                      {/* Opció 1: En què consisteix la prova (Verd) */}
                      <button
                        id="sub-opt-psico-consisteix"
                        onClick={() => {
                          setSeccioActiva('psico_consisteix_prova');
                        }}
                        className="group relative w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black italic uppercase tracking-[0.22em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                      >
                        En què consisteix la prova
                      </button>
                    </div>

                    {/* ====== BLOC 2: LES DUES PROVES AMB EL TEXT A SOBRE (GROC CORPORATIU) ====== */}
                    <div className="flex flex-col items-start gap-4 w-full">
                      {/* Subtítol explicatiu situat damunt dels 2 botons de les proves */}
                      <p className="text-xs sm:text-sm text-slate-400 font-semibold italic tracking-wide text-left pl-1">
                        Selecciona quina prova vols estudiar :
                      </p>
                      
                      <div className="flex flex-col gap-4 w-full">
                        {/* Opció 2: Prova - Biodata */}
                        <button
                          id="sub-opt-psico-biodata"
                          onClick={() => {
                            setMostrantSubPsicologica(false);
                            setMostrantSubBiodata(true);
                          }}
                          className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.22em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                        >
                          Prova - Biodata
                        </button>

                        {/* Opció 3: Prova - Entrevista */}
                        <button
                          id="sub-opt-psico-entrevista"
                          onClick={() => {
                            setMostrantSubPsicologica(false);
                            setMostrantSubBiodata(false);
                            setMostrantSubEntrevista(true);
                          }}
                          className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.22em] py-5 px-8 rounded-full shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center text-sm border-2 border-transparent"
                        >
                          Prova - Entrevista
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Línia vertical gris a la dreta dibuixada al croquis del client */}
                  <div className="absolute -right-10 lg:-right-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
                </div>

                {/* Botó de tornada enrere: Permet tornar al pas anterior de 3 botons de forma completament fàcil i usable */}
                <button
                  onClick={() => setMostrantSubPsicologica(false)}
                  className="group flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-white/10 px-6 py-2.5 rounded-full text-[10px] font-black italic uppercase tracking-widest text-[#FFDF00] active:scale-95 transition-all shadow-lg hover:border-red-650/40 hover:text-red-500 duration-200 cursor-pointer mt-2"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                  <span>Tornar al menú principal</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* A.1. TEMARI OFICIAL DEL DOGC */}
        {seccioActiva === 'teorica_temari_oficial' && (
          <WebWorkspacePCTemariOficial
            temesLlegitsLocals={temesLlegitsLocals}
            setTemesLlegitsLocals={setTemesLlegitsLocals}
            detallLlegitsLocals={detallLlegitsLocals}
            setDetallLlegitsLocals={setDetallLlegitsLocals}
            contingutPersonalitzatLocals={contingutPersonalitzatLocals}
            setContingutPersonalitzatLocals={setContingutPersonalitzatLocals}
            mostrarTresAmbitsInici={mostrarTresAmbitsInici}
            setMostrarTresAmbitsInici={setMostrarTresAmbitsInici}
            ambitSeleccionat={ambitSeleccionat}
            setAmbitSeleccionat={setAmbitSeleccionat}
            temaSeleccionatIndex={temaSeleccionatIndex}
            setTemaSeleccionatIndex={setTemaSeleccionatIndex}
            subtemaSeleccionatIndex={subtemaSeleccionatIndex}
            setSubtemaSeleccionatIndex={setSubtemaSeleccionatIndex}
            onTornarALInici={() => {
              // Explicació per a no-programadors: Restablim l'estat per tornar al menú superior de l'ordinador
              setSeccioActiva('avui');
            }}
          />
        )}

        {/* A.2. TEMARI OPOSIMOSSOS */}
        {seccioActiva === 'teorica_temari_oposimossos' && (
          <WebWorkspacePCEstudiPersonal
            contingutPersonalitzatLocals={contingutPersonalitzatLocals}
            temesLlegitsLocals={temesLlegitsLocals}
            onTornar={() => {
              // Explicació per a no-programadors: Restablim l'estat per tornar al menú superior de l'ordinador
              setSeccioActiva('avui');
            }}
            onEstudiarTema={(ambit, temaIdx, subtemaIdx) => {
              // Explicació per a no-programadors: Carreguem la nova vista de l'àrea d'estudi de resums enriquida d'OposiMossos per a ordinadors
              setAmbitSeleccionat(ambit);
              setTemaSeleccionatIndex(temaIdx);
              setSubtemaSeleccionatIndex(subtemaIdx);
              setMostrarTresAmbitsInici(false);
              setSeccioActiva('teorica_lector_oposimossos');
            }}
          />
        )}

        {/* VISTA DETALLADA DEL LECTOR D'ESTUDI OPOSIMOSSOS PER A PC */}
        {seccioActiva === 'teorica_lector_oposimossos' && temaSeleccionatIndex !== null && subtemaSeleccionatIndex !== null && (
          <WebWorkspacePCLectorOposimossos
            ambitNom={`ÀMBIT ${ambitSeleccionat}`}
            temaTitol={TEMARI_DETALL[ambitSeleccionat][temaSeleccionatIndex].titol}
            puntTitol={TEMARI_DETALL[ambitSeleccionat][temaSeleccionatIndex].subtemes[subtemaSeleccionatIndex]}
            contingutMd={
              ambitSeleccionat === 'A' && temaSeleccionatIndex === 0 && subtemaSeleccionatIndex === 0
              ? `### 1.1.1. L'Antiguitat a Catalunya (Context)

*   **Vicens i Vives** defineix Catalunya com → **Redòs i passadís**.
*   Les dues restes humanes més antigues de Catalunya són ↓
    *   **La més antiga**: L'home de Talteüll - 450.000 anys.
    *   **La segona**: La mandíbula de Banyoles.`
              : `### Títol de la Secció d'Estudi

*   **Punts Clau:** En aquest capítol de l'Àmbit ${ambitSeleccionat} analitzem l'estratègia i els conceptes fonamentals de la lliçó.
*   *Recomanació d'estudi:* Desenvolupa el teu resum propi a la secció inferior i respon de forma activa a les preguntes d'autoavaluació d'altres anys. El teu progrés es sincronitzarà amb l'App mòbil immediatament.`
            }
            contingutOficialHTML={contingutPersonalitzatLocals[`${ambitSeleccionat}_${temaSeleccionatIndex}_${subtemaSeleccionatIndex}`]}
            completat={!!detallLlegitsLocalsOposimossos[`${ambitSeleccionat}_${temaSeleccionatIndex}_${subtemaSeleccionatIndex}`]}
            onMarcarCompletat={(nouEstat) => {
              guardarProgresLecturaOposimossosWeb(ambitSeleccionat, temaSeleccionatIndex, subtemaSeleccionatIndex, nouEstat);
            }}
            ambit={ambitSeleccionat}
            temaIndex={temaSeleccionatIndex}
            subtemaIndex={subtemaSeleccionatIndex}
            notesDesades={notesEstudiantLocals[`${ambitSeleccionat}-${temaSeleccionatIndex}-${subtemaSeleccionatIndex}`] || ""}
            onGuardarNotes={(notes) => {
              guardarNotesEstudiantWeb(ambitSeleccionat, temaSeleccionatIndex, subtemaSeleccionatIndex, notes);
            }}
            onTornar={() => {
              setSeccioActiva('teorica_temari_oposimossos');
            }}
          />
        )}

        {/* A.3. CLASSES PREMIUM */}
        {seccioActiva === 'teorica_classes_premium' && (
          <WebWorkspacePCTemariClassesPremium
            videosVistosLocals={detallVistosLocalsVideos}
            onTornar={() => {
              // Explicació per a no-programadors: Restablim l'estat per tornar al menú superior de l'ordinador
              setSeccioActiva('avui');
            }}
            onSeleccionarVideo={(ambit, temaIdx, subtemaIdx) => {
              setAmbitSeleccionat(ambit);
              setTemaSeleccionatIndex(temaIdx);
              setSubtemaSeleccionatIndex(subtemaIdx);
              setSeccioActiva('teorica_video_oposimossos');
            }}
          />
        )}

        {/* VISTA DETALLADA DEL LECTOR DE VÍDEOS PREMIUM PER A PC */}
        {seccioActiva === 'teorica_video_oposimossos' && temaSeleccionatIndex !== null && subtemaSeleccionatIndex !== null && (
          <WebWorkspacePCVideoOposimossos
            ambitNom={`ÀMBIT ${ambitSeleccionat}`}
            temaTitol={TEMARI_DETALL[ambitSeleccionat][temaSeleccionatIndex].titol}
            puntTitol={TEMARI_DETALL[ambitSeleccionat][temaSeleccionatIndex].subtemes[subtemaSeleccionatIndex]}
            completat={!!detallVistosLocalsVideos[`${ambitSeleccionat}_${temaSeleccionatIndex}_${subtemaSeleccionatIndex}`]}
            onMarcarCompletat={(nouEstat) => {
              guardarProgresVideoPremiumWeb(ambitSeleccionat, temaSeleccionatIndex, subtemaSeleccionatIndex, nouEstat);
            }}
            ambit={ambitSeleccionat}
            temaIndex={temaSeleccionatIndex}
            subtemaIndex={subtemaSeleccionatIndex}
            notesDesades={notesEstudiantLocals[`${ambitSeleccionat}-${temaSeleccionatIndex}-${subtemaSeleccionatIndex}`] || ""}
            onGuardarNotes={(notes) => {
              guardarNotesEstudiantWeb(ambitSeleccionat, temaSeleccionatIndex, subtemaSeleccionatIndex, notes);
            }}
            onTornar={() => {
              setSeccioActiva('teorica_classes_premium');
            }}
          />
        )}

        {/* A.4. CLASSES EN DIRECTE */}
        {seccioActiva === 'teorica_classes_directe' && (
          <WebWorkspacePCClassesDirecte />
        )}

        {/* A.5. EXÀMENS OPOSIMOSSOS - SIMULADOR INTERACTIU EN DIRECTE EN ORDINADOR */}
        {seccioActiva === 'teorica_examens_oposimossos' && (
          <WebWorkspacePCExamensOposimossos />
        )}

        {/* A.6. EXÀMENS OFICIALS PASSATS */}
        {seccioActiva === 'teorica_examens_oficials' && (
          <WebWorkspacePCExamensOficials />
        )}

        {/* A.7. EXAMEN PSICOTÈCNIC DISPOSAT EN FORMAT D'APRENENTATGE D'ALT RENDIMENT */}
        {seccioActiva === 'teorica_psicotecnics' && (
          <WebWorkspacePCPsicotecnics 
            psicotecnicActiu={psicotecnicActiu}
            setPsicotecnicActiu={setPsicotecnicActiu}
            respostaPsicoTriada={respostaPsicoTriada}
            setRespostaPsicoTriada={setRespostaPsicoTriada}
            mostrarExplicacioPsico={mostrarExplicacioPsico}
            setMostrarExplicacioPsico={setMostrarExplicacioPsico}
            onGoBack={() => {
              setSeccioActiva('avui');
              setMostrantSubTeoria(true);
            }}
          />
        )}

         {/* A.8. ACTUALITAT VIGENT DEL DOGC */}
        {seccioActiva === 'teorica_actualitat' && (
          // Explicació per a no-programadors: Instanciem el nou mòdul integrat d'actualitat interactiva, sincronitzat fidelment amb la dinàmica de l'APP mòbil i li passem l'onGoBack per poder tornar enrere fàcilment al menú de 8 botons.
          <WebWorkspacePCActualitat 
            onGoBack={() => {
              setSeccioActiva('avui');
              setMostrantSubTeoria(true);
            }} 
          />
        )}

        {/* A.9. MENÚ DE PREPARACIÓ FÍSICA INTEGRADA AMB 5 OPCIONS (REGLA 1, 3 I REGLA DE COMENTARIS EN CATALÀ) */}
        {/* Explicació per a no-programadors: Hem unificat les pantalles d'esport, nutrició i gimnàs en un únic contenidor visual per poder canviar d'opció immediatament fent clic a una línia molt polida de 5 botons, en lloc de tenir-ho dividit de l'esquerra. */}
        {(seccioActiva === 'fisica_proves' || seccioActiva === 'fisica_dieta' || seccioActiva === 'fisica_gimnas') && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            
            {/* LLETRA O TITOL DE LA PANTALLA GENERAL FÍSICA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-950/40 pb-4">
              <div>
                <span className="text-[9px] text-[#FFDF00] font-extrabold uppercase tracking-widest block font-mono">OPOSICAT SPORT DE RENDIMENT</span>
                <h3 className="text-base font-black italic uppercase text-white mt-1">
                  {seccioActiva === 'fisica_proves' && `PREPARACIÓ: PROVA D'${fisicaProvaActiva.toUpperCase()}`}
                  {seccioActiva === 'fisica_dieta' && `NUTRICIÓ I SUPLEMENTACIÓ: ${dietaActiva.toUpperCase()}`}
                  {seccioActiva === 'fisica_gimnas' && `CENTRES COL·LABORADORS: ${gimnasActiu.toUpperCase()}`}
                </h3>
              </div>
              <span className="text-[9.5px] bg-amber-500/10 text-amber-500 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono border border-amber-500/20">
                Aptitud esportiva de Mossos
              </span>
            </div>

            {/* MENÚ DE 5 OPCIONS UNIFICAT (AMB COLOR GROC, VERD I BLAU SEGONS CRITERI DE L'USUARI) */}
            {/* Explicació per a no-programadors: Una botonera horitzontal fàcil de prémer que unifica l'accés a les proves físiques (grocs), dieta d'alimentació (verd) i cercador de gimnasos col·laboradors d'OposiCAT (blau). */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              
              {/* 1. Press de Banca - Color groc si actiu o hover groc */}
              <button
                id="btn-nav-opt-banca"
                onClick={() => {
                  setSeccioActiva('fisica_proves');
                  setFisicaProvaActiva('Press de banca');
                }}
                className={`py-3 px-4 rounded-2xl text-[11px] font-black uppercase italic tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  seccioActiva === 'fisica_proves' && fisicaProvaActiva === 'Press de banca'
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-[#FFDF00] shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                    : 'bg-slate-950/45 border-white/5 text-slate-450 hover:text-[#FFDF00] hover:border-yellow-500/20'
                }`}
              >
                <span className="text-sm">🏋️‍♂️</span>
                <span className="tracking-wide">Press banca</span>
                <span className="text-[8px] font-mono not-italic opacity-60 lowercase">força pectoral</span>
              </button>

              {/* 2. Circuit d'agilitat - Color groc si actiu o hover groc */}
              <button
                id="btn-nav-opt-agilitat"
                onClick={() => {
                  setSeccioActiva('fisica_proves');
                  setFisicaProvaActiva("Circuit d'agilitat");
                }}
                className={`py-3 px-4 rounded-2xl text-[11px] font-black uppercase italic tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  seccioActiva === 'fisica_proves' && fisicaProvaActiva === "Circuit d'agilitat"
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-[#FFDF00] shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                    : 'bg-slate-950/45 border-white/5 text-slate-450 hover:text-[#FFDF00] hover:border-yellow-500/20'
                }`}
              >
                <span className="text-sm">🏃‍♂️</span>
                <span className="tracking-wide">Agilitat</span>
                <span className="text-[8px] font-mono not-italic opacity-60 lowercase">velocitat i canvis</span>
              </button>

              {/* 3. Curse Navette - Color groc si actiu o hover groc */}
              <button
                id="btn-nav-opt-navette"
                onClick={() => {
                  setSeccioActiva('fisica_proves');
                  setFisicaProvaActiva('Curse Navette');
                }}
                className={`py-3 px-4 rounded-2xl text-[11px] font-black uppercase italic tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  seccioActiva === 'fisica_proves' && fisicaProvaActiva === 'Curse Navette'
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-[#FFDF00] shadow-[0_0_12px_rgba(250,204,21,0.15)]'
                    : 'bg-slate-950/45 border-white/5 text-slate-450 hover:text-[#FFDF00] hover:border-yellow-500/20'
                }`}
              >
                <span className="text-sm">🫁</span>
                <span className="tracking-wide">Curse navette</span>
                <span className="text-[8px] font-mono not-italic opacity-60 lowercase">resistència aeròbica</span>
              </button>

              {/* 4. Dieta - Color verd per a l’alimentació d’esportistes */}
              <button
                id="btn-nav-opt-dieta"
                onClick={() => {
                  setSeccioActiva('fisica_dieta');
                  if (!dietaActiva) setDietaActiva('Dieta gratuïta');
                }}
                className={`py-3 px-4 rounded-2xl text-[11px] font-black uppercase italic tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  seccioActiva === 'fisica_dieta'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-[#00f296] shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950/45 border-white/5 text-slate-450 hover:text-[#00f296] hover:border-emerald-500/20'
                }`}
              >
                <span className="text-sm">🥗</span>
                <span className="tracking-wide">Dieta esport</span>
                <span className="text-[8px] font-mono not-italic opacity-60 lowercase">plans de nutrients</span>
              </button>

              {/* 5. Cerca de gimnàs - Color blau per a cercar centres al mapa */}
              <button
                id="btn-nav-opt-gimnas"
                onClick={() => {
                  setSeccioActiva('fisica_gimnas');
                  setGimnasActiu('Buscar gimnàs');
                }}
                className={`py-3 px-4 rounded-2xl text-[11px] font-black uppercase italic tracking-wider transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  seccioActiva === 'fisica_gimnas'
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    : 'bg-slate-950/45 border-white/5 text-slate-450 hover:text-blue-400 hover:border-blue-500/20'
                }`}
              >
                <span className="text-sm">📍</span>
                <span className="tracking-wide">Buscar gimnàs</span>
                <span className="text-[8px] font-mono not-italic opacity-60 lowercase">centres col·laboradors</span>
              </button>

            </div>

            {/* CONTINGUTS ESPECÍFICS EN FASE INTEGRADORA */}
            <div className="pt-2">
              
              {/* SUB-SECCIÓ 1: PROVES FÍSIQUES DE CAPACITAT */}
              {seccioActiva === 'fisica_proves' && (
                <div className="space-y-6">
                  {fisicaProvaActiva === 'Press de banca' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                        Consisteix a realitzar el major nombre possible de repeticions de press de banca en un temps màxim de 45 segons. El pes s'ajusta segons el sexe de l'aspirant. Entrena directament amb el nostre simulador integrat i el seu cronòmetre acústic virtual.
                      </p>
                      
                      {/* Explicació per a no-programadors: Instanciem el nou component modular que hereta de forma precisa la calculadora/cronòmetre d'àudio del Press de Banca de l'aplicació. */}
                      <CalculadoraPressWeb />

                      <div className="p-4 bg-[#00274d]/40 border border-blue-900/30 rounded-xl">
                        <span className="text-[9px] text-[#FFDF00] uppercase font-bold tracking-wider block">💡 CONSELL DEL PREPARADOR D'ALT RENDIMENT:</span>
                        <p className="text-[10.5px] text-slate-205 italic mt-1 font-semibold leading-relaxed">
                          Evita el rebot al pit. Els jutges de l'oposició de Mossos d'Esquadra invalidaran qualsevol repetició on la barra no toqui lleugerament l'estèrnum de forma controlada sense impuls.
                        </p>
                      </div>
                    </div>
                  )}

                  {fisicaProvaActiva === "Circuit d'agilitat" && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                        El circuit d'agilitat mesura la velocitat, acceleració i coordinació en canvis de direcció ràpids. Has de superar dues tanques, un llistó i un matalàs de forma correcta sense tombar cap obstacle del circuit.
                      </p>

                      {/* CALCULADORA AVANÇADA DE BAREMS DEL CIRCUIT (DOGC) */}
                      <div className="bg-slate-950 p-6 rounded-2xl border border-blue-900/30 space-y-4">
                        <div className="flex gap-2 justify-between items-baseline border-b border-white/5 pb-2">
                          <span className="text-[9.5px] text-[#FFDF00] font-black uppercase tracking-wider">
                            🧮 CALCULADORA DE NOTA RESPECTE ALS BAREMS DEL DOGC
                          </span>
                          <span className="text-[8.5px] text-slate-500 uppercase font-mono">CIRCUIT DE VELOCITAT</span>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 items-end">
                          {/* Sexe */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sexe de l’Aspira't</label>
                            <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                              <button
                                onClick={() => setSexeAgilitat('masculi')}
                                className={`flex-1 py-1.5 text-[9.5px] font-black uppercase rounded-lg cursor-pointer ${
                                  sexeAgilitat === 'masculi' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Masculí
                              </button>
                              <button
                                onClick={() => setSexeAgilitat('femeni')}
                                className={`flex-1 py-1.5 text-[9.5px] font-black uppercase rounded-lg cursor-pointer ${
                                  sexeAgilitat === 'femeni' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                Femení
                              </button>
                            </div>
                          </div>

                          {/* Segons entrats pels estudiants */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Temps de circuit (Segons)</label>
                            <input
                              type="text"
                              placeholder="Ex. 12.1"
                              value={segonsAgilitat}
                              onChange={(e) => setSegonsAgilitat(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-red-650 font-bold"
                            />
                          </div>

                          {/* Botó de calcul */}
                          <button
                            onClick={calcularNotaCircuitDOGC}
                            className="bg-red-650 hover:bg-red-700 active:scale-95 text-white font-black uppercase text-[10px] py-3.5 rounded-xl transition-all cursor-pointer text-center"
                          >
                            CALCULAR LA MEVA NOTA
                          </button>
                        </div>

                        {calculaEstadisticaNota !== null && (
                          <div className="p-4 bg-blue-950/50 border border-blue-900/30 rounded-xl flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-slate-400 font-bold uppercase">VALORACIÓ MATEMÀTICA</span>
                              <p className="text-[10.5px] text-slate-205 leading-none italic font-semibold">Barem del circuit real de les oposicions de Mossos</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-black italic text-[#FFDF00]">{calculaEstadisticaNota}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">/10 punts</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {fisicaProvaActiva === 'Curse Navette' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                        La Curse Navette és una prova de resistència aeròbica consistent a recórrer un tram de 20 metres a un compàs de velocitat incremental que augmenta a cada període acoblat.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-3">
                          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">♂️ BAREMS HOMES (PERÍODES)</span>
                          <ul className="text-xs text-slate-300 space-y-1.5 font-medium font-mono">
                            <li>• Menys d'un període de 9.5: 0 punts</li>
                            <li>• Període de 9.5: 1 punt</li>
                            <li>• Període de 11.5: 5 punts</li>
                            <li>• Període de 13.5 o més: 10 punts (Excel·lent)</li>
                          </ul>
                        </div>
                        <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-3">
                          <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">♀️ BAREMS DONES (PERÍODES)</span>
                          <ul className="text-xs text-slate-300 space-y-1.5 font-medium font-mono">
                            <li>• Menys d'un període de 7.5: 0 punts</li>
                            <li>• Període de 7.5: 1 punt</li>
                            <li>• Període de 9.5: 5 punts</li>
                            <li>• Període de 11.5 o més: 10 punts (Excel·lent)</li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <span className="text-[9px] text-[#FFDF00] uppercase font-bold tracking-wider block">📋 AJUST MENTAL I RESISTÈNCIA:</span>
                        <p className="text-[10px] text-slate-205 italic mt-1 font-semibold leading-relaxed">
                          Mantén un ritme constant i no esparreguis gaire energia en els girs. Treballa bé la trepitjada i no superis la línia de 20 metres abans del senyal acústic per evitar cansar el cor abans d'hora.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECCIÓ 2: NUTRICIÓ D'ALT RENDIMENT */}
              {seccioActiva === 'fisica_dieta' && (
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <button
                      id="opt-dieta-gratuita-unificada"
                      onClick={() => setDietaActiva('Dieta gratuïta')}
                      className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase transition-all duration-150 cursor-pointer ${
                        dietaActiva === 'Dieta gratuïta'
                          ? 'border-[#00f296]/30 bg-[#00f296]/5 text-[#00f296]'
                          : 'border-white/5 hover:bg-slate-950/40 text-slate-400'
                      }`}
                    >
                      Dieta gratuïta general
                    </button>
                    <button
                      id="opt-dieta-premium-unificada"
                      onClick={() => setDietaActiva('Dieta premium')}
                      className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase transition-all duration-150 cursor-pointer ${
                        dietaActiva === 'Dieta premium'
                          ? 'border-[#00f296]/30 bg-[#00f296]/5 text-[#00f296]'
                          : 'border-white/5 hover:bg-slate-950/40 text-slate-400'
                      }`}
                    >
                      Dieta premium especialitzada
                    </button>
                  </div>

                  {dietaActiva === 'Dieta gratuïta' ? (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                        Aquest és el pla equilibrat general dissenyat de forma clàssica per a aportar la dosi perfecta de macronutrients necessaris per un esportista a comissaria.
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9.5px] text-[#FFDF00] font-black uppercase tracking-wider block">🥞 esmorzar</span>
                          <p className="text-[10.5px] text-slate-400 leading-relaxed font-semibold italic">Tortita de civada integral de gra amb 3 clares d'ou i mel natural de canya.</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9.5px] text-blue-400 font-black uppercase tracking-wider block">🥩 dinar</span>
                          <p className="text-[10.5px] text-slate-400 leading-relaxed font-semibold italic">Pit de gall d'indi fresc o salmó salvatge amb 150g d'arròs gessamí i verdures al vapor.</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9.5px] text-emerald-400 font-black uppercase tracking-wider block">🐔 sopar</span>
                          <p className="text-[10.5px] text-slate-400 leading-relaxed font-semibold italic">Truita de formatge fresc o pollastre rostit amb amanida de fulles riques en zinc i magnesium.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                        El Programa Premium d'OposiCAT ofereix una dieta d'extrema biodisponibilitat muscular combinada amb un ajust de suplementació d'alt nivell.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-2">
                          <span className="text-[10px] text-[#FFDF00] font-bold uppercase tracking-wider block">🍽️ PLA PRE-ENTRENAMENT DE FORÇA</span>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            Ous de gallines felices remenats amb moniato rostit, fruita vermella seca d'alta capacitat antioxidant i aigua purificada de llimona de forma primerenca.
                          </p>
                        </div>
                        <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-2">
                          <span className="text-[10px] text-[#FFDF00] font-bold uppercase tracking-wider block">🧪 SUPLEMENTACIÓ RECOMANADA</span>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            Cicle de Creatina Monohidratada (5g diaris per augmentar l'explosió en press de banca) i Beta-alanina per retardar la fatiga dels quadríceps a la Course Navette.
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#00274d] hover:bg-[#00386e] text-[#FFDF00] border border-blue-900/40 p-4 rounded-xl flex items-center justify-between transition-all">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase block tracking-wider font-mono">🔒 SOL·LICITAR NUTRICIONISTA PERSONALITZAT</span>
                          <p className="text-[11px] text-slate-300 font-medium">Dissenya la teva ràtio calòrica basat en el teu greix corporal de forma individual.</p>
                        </div>
                        <button onClick={() => alert("La connexió amb el nutricionista és una funcionalitat premium d'OposiCAT!")} className="bg-[#FFDF00] hover:bg-yellow-450 text-slate-950 text-[10px] font-black uppercase py-2.5 px-4 rounded-lg cursor-pointer transition-all shrink-0">
                          S'HA DE COMPRAR
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-SECCIÓ 3: CERCADOR DE GIMNASOS COL·LABORADORS */}
              {seccioActiva === 'fisica_gimnas' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                    Entrena en un dels nostres pavellons o centres col·laboradors de Catalunya. Troba instal·lacions que compten amb tancaments homologats, fustes reals i pistes pintades per a optimitzar el teu rendiment.
                  </p>
                  
                  {/* Explicació per a no-programadors: Instanciem el nou cercador intel·ligent per províncies, comarques i municipis procedent de l'aplicació nativa. */}
                  <CercadorGimnasosWeb />
                </div>
              )}

            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓ C: LA PROVA PSICOLÒGICA EN INTEGRAL (REGLA 1 I 3 - L'ERA DE LEGO) */}
        {/* ----------------------------------------------------------------- */}

        {/* C.0. EN QUÈ CONSISTEIX LA PROVA D'ADEQUACIÓ PSICOPROFESSIONAL (GENERAL) */}
        {seccioActiva === 'psico_consisteix_prova' && (
          <ConsisteixProvaPsicologica
            onTornar={() => {
              setSeccioActiva('avui');
              setMostrantSubPsicologica(true);
            }}
            onObrirCompetencies={() => {
              setSeccioActiva('psico_competencies');
              setPsicoSubSeccioActiva('Apren com es puntua');
              setAcordioPsicologicaObert(true);
            }}
          />
        )}

        {/* C.0.B. EN QUÈ CONSISTEIX LA PROVA DEL BIODATA (ESTRUCTURA DEL QÜESTIONARI BIOGRÀFIC) */}
        {seccioActiva === 'psico_consisteix_biodata' && (
          <ConsisteixBiodata
            onTornar={() => {
              // Comentari planer per a no-programadors: Retorna directament al menú dels 4 blocs de la Prova Biodata (En què consisteix, Com es puntua, Qüestionari biogràfic i Test competencial)
              setSeccioActiva('avui');
              setMostrantSubBiodata(true);
              setMostrantSubTestCompetencial(false);
              setMostrantSubPsicologica(false);
            }}
            onTornarMenuPrincipal={() => {
              setSeccioActiva('avui');
              setMostrantSubTestCompetencial(false);
              setMostrantSubBiodata(false);
              setMostrantSubPsicologica(false);
            }}
            onPracticaBiografic={() => {
              // Explicació per a no-programadors: Enllaç directe a la pràctica del Qüestionari Biogràfic
              setSeccioActiva('psico_biodata');
              setPsicoSubSeccioActiva('preguntes personals');
              setAcordioPsicologicaObert(true);
              setSubAcordioPsicoBiodataObert(true);
            }}
            onPracticaBiodata={() => {
              // Explicació per a no-programadors: Enllaç directe a la pràctica del Test Biodata
              setSeccioActiva('psico_biodata');
              setPsicoSubSeccioActiva('test biodata practica');
              setAcordioPsicologicaObert(true);
              setSubAcordioPsicoBiodataObert(true);
            }}
          />
        )}

        {/* C.1. COMPETÈNCIES CLAU - COM ES PUNTUA */}
        {seccioActiva === 'psico_competencies' && (
          <CompetenciesClauWeb
            onTornar={() => {
              setSeccioActiva('avui');
              setMostrantSubBiodata(true);
              setMostrantSubPsicologica(false);
              setMostrantSubEntrevista(false);
            }}
            onTornarMenuPrincipal={() => {
              setSeccioActiva('avui');
              setMostrantSubBiodata(false);
              setMostrantSubPsicologica(false);
              setMostrantSubEntrevista(false);
            }}
            onAnarBiodata={() => {
              // Explicació per a no-programadors: Obre el submenú de la Prova Biodata
              setSeccioActiva('avui');
              setMostrantSubBiodata(true);
              setMostrantSubPsicologica(false);
              setMostrantSubEntrevista(false);
            }}
            onAnarEntrevista={() => {
              // Explicació per a no-programadors: Obre el submenú de la Prova Entrevista
              setSeccioActiva('avui');
              setMostrantSubEntrevista(true);
              setMostrantSubBiodata(false);
              setMostrantSubPsicologica(false);
            }}
          />
        )}

        {/* C.2. PROVES DE BIODATA AMB SUB-PANTALLES (TEST BIODATA, PERFIL RESULTATS, QÜESTIONARI BIOGRÀFIC) */}
        {seccioActiva === 'psico_biodata' && (
          <>
            {/* Sub-pantalla 1: Practicar el Test Biodata (Simulacre complet de 80 preguntes oficials amb cronòmetre de 25 minuts) */}
            {psicoSubSeccioActiva === 'test biodata practica' || psicoSubSeccioActiva === 'test biodata' ? (
              <TestBiodataWeb
                modeInicial="practica"
                onTornar={() => {
                  setSeccioActiva('avui');
                  setMostrantSubTestCompetencial(true);
                  setMostrantSubBiodata(false);
                  setMostrantSubPsicologica(false);
                }}
                onTornarMenuPrincipal={() => {
                  setSeccioActiva('avui');
                  setMostrantSubTestCompetencial(false);
                  setMostrantSubBiodata(false);
                  setMostrantSubPsicologica(false);
                }}
                onAnarConsisteix={() => {
                  setSeccioActiva('psico_consisteix_biodata');
                }}
              />
            ) : psicoSubSeccioActiva === 'test biodata perfil' || psicoSubSeccioActiva === 'resultats' || psicoSubSeccioActiva === 'perfil' ? (
              /* Sub-pantalla 2: El meu perfil competencial (Resultat del test) - 10 competències clau oficials */
              <TestBiodataWeb
                modeInicial="perfil"
                onTornar={() => {
                  setSeccioActiva('avui');
                  setMostrantSubTestCompetencial(true);
                  setMostrantSubBiodata(false);
                  setMostrantSubPsicologica(false);
                }}
                onTornarMenuPrincipal={() => {
                  setSeccioActiva('avui');
                  setMostrantSubTestCompetencial(false);
                  setMostrantSubBiodata(false);
                  setMostrantSubPsicologica(false);
                }}
                onAnarConsisteix={() => {
                  setSeccioActiva('psico_consisteix_biodata');
                }}
              />
            ) : (
              /* Sub-pantalla 3: Qüestionari Biogràfic Web interactiu amb els blocs oficials */
              <QuestionariBiograficWeb
                blocInicial={
                  psicoSubSeccioActiva === 'preguntes laborals'
                    ? 'laborals'
                    : psicoSubSeccioActiva === 'preguntes PGME'
                    ? 'pgme'
                    : psicoSubSeccioActiva === 'preguntes personals'
                    ? 'personals'
                    : 'personals'
                }
                onTornar={() => {
                  // Explicació per a no-programadors: Retorna a la pantalla del menú de Biodata
                  setSeccioActiva('avui');
                  setMostrantSubBiodata(true);
                  setMostrantSubPsicologica(false);
                  setMostrantSubEntrevista(false);
                }}
                onTornarMenuPrincipal={() => {
                  // Explicació per a no-programadors: Retorna al menú principal de l'aplicació
                  setSeccioActiva('avui');
                  setMostrantSubBiodata(false);
                  setMostrantSubPsicologica(false);
                  setMostrantSubEntrevista(false);
                }}
                onAnarBiodata={() => {
                  // Explicació per a no-programadors: Obre la secció de Test Competencial
                  setSeccioActiva('avui');
                  setMostrantSubTestCompetencial(true);
                  setMostrantSubBiodata(false);
                  setMostrantSubPsicologica(false);
                }}
                onAnarEntrevista={() => {
                  // Explicació per a no-programadors: Obre el submenú d'Entrevista
                  setSeccioActiva('avui');
                  setMostrantSubEntrevista(true);
                  setMostrantSubBiodata(false);
                  setMostrantSubPsicologica(false);
                }}
              />
            )}
          </>
        )}

        {/* C.3. EN QUÈ CONSISTEIX L'ENTREVISTA */}
        {seccioActiva === 'psico_consisteix_entrevista' && (
          <ConsisteixEntrevista
            onTornar={() => {
              setSeccioActiva('avui');
              setMostrantSubEntrevista(true);
              setMostrantSubPsicologica(false);
            }}
            onTornarMenuPrincipal={() => {
              setSeccioActiva('avui');
              setMostrantSubEntrevista(false);
              setMostrantSubPsicologica(false);
            }}
            onPracticarEntrevista={() => {
              setSeccioActiva('psico_entrevista_practica');
            }}
            onAnarCompetencies={() => {
              setSeccioActiva('psico_competencies');
            }}
          />
        )}

        {/* C.4. PRACTICAR L'ENTREVISTA */}
        {seccioActiva === 'psico_entrevista_practica' && (
          <PracticarEntrevistaWeb
            onTornar={() => {
              setSeccioActiva('avui');
              setMostrantSubEntrevista(true);
              setMostrantSubPsicologica(false);
            }}
            onTornarMenuPrincipal={() => {
              setSeccioActiva('avui');
              setMostrantSubEntrevista(false);
              setMostrantSubPsicologica(false);
            }}
            onDemanarCita={() => {
              setSeccioActiva('psico_cita');
            }}
            onFesBiodata={() => {
              // Explicació per a no-programadors: Condueix l'usuari directament al menú dedicat de la Prova Biodata
              setSeccioActiva('avui');
              setMostrantSubBiodata(true);
              setMostrantSubEntrevista(false);
              setMostrantSubPsicologica(false);
            }}
          />
        )}

        {/* C.5. DEMANAR CITA AMB PSICÒLEGS DE L'EQUIP */}
        {seccioActiva === 'psico_cita' && (
          <DemanarCitaWeb
            onTornar={() => {
              setSeccioActiva('avui');
              setMostrantSubEntrevista(true);
              setMostrantSubPsicologica(false);
            }}
            onTornarMenuPrincipal={() => {
              setSeccioActiva('avui');
              setMostrantSubEntrevista(false);
              setMostrantSubPsicologica(false);
            }}
          />
        )}

      </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BARRA DE NAVEGACIÓ INFERIOR (BOTTOM NAV) EXCLUSIVA PER A DISPOSITIUS MÒBILS */}
      {/* ========================================================================= */}
      {/* Comentari per a no-programadors:
          Aquesta barra inferior s'activa exclusivament en telèfons mòbils (amb la classe "md:hidden").
          En ordinadors i tauletes (a partir de la mida "md:") queda completament oculta perquè 
          s'utilitza la barra lateral esquerra tradicional.
          Permet als opositors canviar d'àrea d'estudi amb el polze a l'instant sense haver d'estirar la mà. */}
      <nav 
        id="mobile-bottom-nav-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#020b18]/95 backdrop-blur-xl border-t border-blue-900/40 px-2 py-1 flex items-center justify-around shadow-[0_-6px_20px_rgba(0,0,0,0.65)] select-none"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      >
        {/* 1. Inici (Què vols fer avui?) */}
        <button
          type="button"
          id="btn-mobile-nav-inici"
          onClick={() => {
            setSeccioActiva('avui');
            setMostrantSubTeoria(false);
            setMostrantSubFisica(false);
            setMostrantSubPsicologica(false);
            setMostrantSubBiodata(false);
            setMostrantSubTestCompetencial(false);
            setMostrantSubEntrevista(false);
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            seccioActiva === 'avui' && !mostrantSubTeoria && !mostrantSubFisica && !mostrantSubPsicologica
              ? 'text-[#FFDF00] bg-blue-950/70 border border-amber-400/30 shadow-[0_0_10px_rgba(255,223,0,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <GraduationCap className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black uppercase tracking-tight">Inici</span>
        </button>

        {/* 2. Fase 1: Prova Teòrica */}
        <button
          type="button"
          id="btn-mobile-nav-teorica"
          disabled={esUsuariAlpha}
          onClick={() => {
            if (esUsuariAlpha) return;
            setSeccioActiva('avui');
            setMostrantSubTeoria(true);
            setMostrantSubFisica(false);
            setMostrantSubPsicologica(false);
            setMostrantSubBiodata(false);
            setMostrantSubTestCompetencial(false);
            setMostrantSubEntrevista(false);
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            esUsuariAlpha
              ? 'text-slate-600 opacity-40 cursor-not-allowed border border-transparent'
              : (seccioActiva === 'avui' && mostrantSubTeoria) || seccioActiva.startsWith('teorica_')
              ? 'text-[#FFDF00] bg-blue-950/70 border border-amber-400/30 shadow-[0_0_10px_rgba(255,223,0,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black uppercase tracking-tight">Teòrica</span>
        </button>

        {/* 3. Fase 2: Prova Física */}
        <button
          type="button"
          id="btn-mobile-nav-fisica"
          disabled={esUsuariAlpha}
          onClick={() => {
            if (esUsuariAlpha) return;
            setSeccioActiva('avui');
            setMostrantSubTeoria(false);
            setMostrantSubFisica(true);
            setMostrantSubPsicologica(false);
            setMostrantSubBiodata(false);
            setMostrantSubTestCompetencial(false);
            setMostrantSubEntrevista(false);
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            esUsuariAlpha
              ? 'text-slate-600 opacity-40 cursor-not-allowed border border-transparent'
              : (seccioActiva === 'avui' && mostrantSubFisica) || seccioActiva.startsWith('fisica_')
              ? 'text-[#FFDF00] bg-blue-950/70 border border-amber-400/30 shadow-[0_0_10px_rgba(255,223,0,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Dumbbell className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black uppercase tracking-tight">Física</span>
        </button>

        {/* 4. Fase 3: Prova Psicològica / Biodata */}
        <button
          type="button"
          id="btn-mobile-nav-psico"
          onClick={() => {
            setSeccioActiva('avui');
            setMostrantSubTeoria(false);
            setMostrantSubFisica(false);
            setMostrantSubPsicologica(true);
            setMostrantSubBiodata(false);
            setMostrantSubTestCompetencial(false);
            setMostrantSubEntrevista(false);
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
            (seccioActiva === 'avui' && (mostrantSubPsicologica || mostrantSubBiodata || mostrantSubTestCompetencial || mostrantSubEntrevista)) || seccioActiva.startsWith('psico_')
              ? 'text-[#FFDF00] bg-blue-950/70 border border-amber-400/30 shadow-[0_0_10px_rgba(255,223,0,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Brain className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-black uppercase tracking-tight">Psico</span>
        </button>

        {/* 5. Notificacions / Avisos en temps real */}
        <button
          type="button"
          id="btn-mobile-nav-notificacions"
          onClick={() => setDesplegableNotificacionsObert(prev => !prev)}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer relative ${
            desplegableNotificacionsObert
              ? 'text-[#FFDF00] bg-blue-950/70 border border-amber-400/30 shadow-[0_0_10px_rgba(255,223,0,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5 mb-0.5" />
            {numNotificacions > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-600 rounded-full text-[8px] font-black text-white flex items-center justify-center shadow-[0_0_6px_rgba(220,38,38,0.7)] animate-pulse">
                {numNotificacions}
              </span>
            )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-tight">Avisos</span>
        </button>
      </nav>

      {/* MODAL / POPUP DE NOTIFICACIONS ADAPTAT PER A MÒBIL */}
      {desplegableNotificacionsObert && (
        <div 
          id="mobile-notificacions-modal"
          className="md:hidden fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200"
          onClick={() => setDesplegableNotificacionsObert(false)}
        >
          <div 
            className="w-full max-w-lg bg-slate-950 border border-blue-900/50 rounded-3xl shadow-2xl p-4 text-left flex flex-col max-h-[75vh] mb-16 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-1 py-2 border-b border-blue-950/40 mb-3 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] uppercase tracking-wider text-[#FFDF00] font-black">Notificacions Actives</span>
                <span className="bg-[#FFDF00]/10 text-[#FFDF00] text-[9.5px] px-2 py-0.5 rounded-full font-bold">
                  {numNotificacions} noves
                </span>
              </div>
              <div className="flex items-center gap-2">
                {numNotificacions > 0 && (
                  <button 
                    onClick={() => marcarTotesComALlegides()}
                    className="text-[9px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer border border-slate-800 px-2 py-1 rounded-lg"
                  >
                    Llegir totes
                  </button>
                )}
                <button 
                  onClick={() => setDesplegableNotificacionsObert(false)}
                  className="text-xs font-black text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[50vh]">
              {notificacions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No tens cap notificació pendent.
                </div>
              ) : (
                notificacions.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => alternarNotificacioLlegida(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                      item.llegida 
                        ? 'bg-slate-900/20 border-slate-900/30 text-slate-500 opacity-60' 
                        : 'bg-slate-900/70 border-blue-900/30 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-black text-slate-200">{item.titol}</p>
                      <span className="text-[8.5px] font-mono text-slate-500 shrink-0">{item.data}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
