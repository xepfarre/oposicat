import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { TEMARI_DETALL } from '../../constants/temari';
import { CONTINGUT_TEMARI_TEXTS } from '../../constants/contingut_textos';
import { 
  BookOpen, ShieldCheck, Dumbbell, UserCheck, Play, Video, 
  ListTodo, FileText, Brain, GraduationCap, ArrowRight, ArrowLeft, ChevronLeft,
  HelpCircle, Utensils, MapPin, Calendar, Clock, ChevronDown, 
  ChevronRight, Activity, Timer, Send, Search, CheckCircle2, 
  AlertTriangle, Lock, Award, Volume2, User, Highlighter, Eraser, Check,
  Bell
} from 'lucide-react';

// Explicació per a no-programadors: Importem els fons temàtics generats per IA per a cadascuna de les 3 fases
// @ts-ignore
import fonsTeorica from '../../assets/images/Teorica.png';
// @ts-ignore
import fonsFisica from '../../assets/images/fons_fisica_1780343173628.png';
// @ts-ignore
import fonsPsicologica from '../../assets/images/fons_psicologica_1780343193032.png';

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

  // Estats per a l'hora del PC i la sirena de colors de Mossos d'Esquadra (animació estil backoffice)
  // Explicació per a no-programadors: Guardem l'hora actual i l'estat de pampallugues (base/groc, color1/blau o color2/vermell).
  const [horaActual, setHoraActual] = useState(new Date());
  const [animationState, setAnimationState] = useState<'base' | 'color1' | 'color2'>('base');

  // Explicació per a no-programadors: Aquest efecte s'executa tant a l'inici com quan hi ha canvis en la sessió de l'estudiant. S'encarrega d'agafar l'identificador de l'usuari en línia (UID), consultar directament la fitxa d'usuari oficial 'usuaris' a la base de dades Firestore de Firebase i estirar-ne el camp 'displayName'. D'aquesta manera s'evita totalment inventar noms i s'ensenyen les dades reals que s'hagin posat en registrar-se.
  useEffect(() => {
    const carregarPerfilReal = async () => {
      const usuariAutenticat = auth.currentUser;
      if (usuariAutenticat) {
        try {
          // Busquem el document d'aquest estudiant a la col·lecció 'usuaris'
          const docRef = doc(db, 'usuaris', usuariAutenticat.uid);
          const snapshotDoc = await getDoc(docRef);
          
          if (snapshotDoc.exists()) {
            const dades = snapshotDoc.data();
            if (dades && dades.displayName) {
              setNomEstudiantReal(`👤 ${dades.displayName}`);
              return;
            }
          }
          // Fallback en cas que no hi hagi displayName encara a la col·lecció de base de dades
          if (usuariAutenticat.displayName) {
            setNomEstudiantReal(`👤 ${usuariAutenticat.displayName}`);
          } else if (usuariAutenticat.email) {
            // Generem un nom a partir del seu correu, ex: xepfarre per a xepfarre@gmail.com
            const nomNet = usuariAutenticat.email.split('@')[0];
            setNomEstudiantReal(`👤 ${nomNet.charAt(0).toUpperCase() + nomNet.slice(1)}`);
          }
        } catch (err) {
          console.error("No s'ha pogut obtenir el nom complet de l'estudiant des de Firestore:", err);
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
      }
    });

    return () => subscripcioAuth();
  }, []);

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

  // Explicació per a no-programadors: Triem el fons de pantalla segons la secció seleccionada per l'alumne
  let fonsActiuUrl = '';
  if (seccioActiva !== 'avui') {
    if (seccioActiva.startsWith('fisica_')) {
      fonsActiuUrl = fonsFisica;
    } else if (seccioActiva.startsWith('psico_') || seccioActiva === 'teorica_psicotecnics') {
      fonsActiuUrl = fonsPsicologica;
    } else if (seccioActiva.startsWith('teorica_')) {
      fonsActiuUrl = fonsTeorica;
    }
  }

  return (
    <div className="bg-[#010915] text-slate-100 min-h-screen font-sans flex antialiased">
      
      {/* ========================================================================= */}
      {/* 1. BARRA LATERAL (SIDEBAR) ESQUERRA - ORGANITZADA EXCLUSIVAMENT EN LES 3 PROVES */}
      {/* ========================================================================= */}
      <aside className="w-80 bg-slate-950 border-r border-blue-950/60 flex flex-col justify-between hidden lg:flex shrink-0 max-h-screen overflow-y-auto relative z-[60] selection:bg-red-650">
        
        <div className="p-5 space-y-6">
          
          {/* LOGOTIP CORPORATIU OPOSICAT I HORA LOCAL EN VIU */}
          {/* Explicació per a no-programadors: Mostra la marca oficial d'OposiCAT en groc corporatiu i l'hora de l'ordinador actualitzant-se en viu cada segon. Si hi cliquem, tornem al menú neutre. */}
          <div 
            onClick={() => setSeccioActiva('avui')}
            className="flex items-center justify-between p-4 bg-slate-900/30 hover:bg-slate-900/50 border border-blue-900/15 rounded-2xl shadow-lg shadow-blue-950/10 mb-4 transition-all cursor-pointer group relative"
          >
            {/* Esquerra: Nom d'OposiCAT i el Rellotge, centrats horitzontalment a l'espai equidistant entre la paret esquerra i la línia separadora */}
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1">
              <h1 className="text-[17px] font-black uppercase tracking-widest text-[#FFDF00] group-hover:scale-[1.02] transition-all duration-300" id="sidebar-logo-oposicat">
                OposiCAT
              </h1>
              <span className="text-[10.5px] font-mono font-bold text-white tracking-widest leading-none">
                {horaActual.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </span>
            </div>

            {/* Dreta: Línia vertical de separació tallant i campana de notificacions a la dreta del tot */}
            <div className="flex items-center space-x-3 pr-1.5">
              {/* Línia separadora vertical de disseny minimalista llimat */}
              <div id="separador-campana-notificacions" className="w-[1.5px] h-8 bg-blue-900/40 rounded-full shrink-0" />

              {/* Contenidor de la campana de notificacions amb posició segura */}
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
                  className={`relative p-2 rounded-full hover:bg-slate-850/60 transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    numNotificacions > 0 ? 'text-[#FFDF00]' : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <Bell className="w-8 h-8 animate-wiggle" />
                  {numNotificacions > 0 ? (
                    <span 
                      id="badge-notificacions-vermell" 
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse"
                    >
                      {numNotificacions}
                    </span>
                  ) : (
                    <span 
                      id="badge-notificacions-gris" 
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-slate-800 border border-slate-700/60 rounded-full text-[9.5px] font-black text-slate-400 flex items-center justify-center"
                    >
                      0
                    </span>
                  )}
                </button>

                {/* Menú de notificacions un cop obert la campana flotant de dalt */}
                {desplegableNotificacionsObert && (
                  <div 
                    id="desplegable-notificacions-flotant"
                    className="fixed left-[336px] top-4 w-[420px] bg-slate-950/98 border border-blue-900/40 rounded-2xl shadow-2xl p-4 z-50 text-left backdrop-blur-md animate-in fade-in slide-in-from-left-2 duration-200 flex flex-col h-[580px] max-h-[85vh]"
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

                    {/* Llistat scrollable amb les 10 notificacions d'alta qualitat configurables en viu */}
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
                          {/* Indicador de notificació no llegida */}
                          {!item.llegida && (
                            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-650 rounded-full animate-pulse shadow-[0_0_6px_rgba(225,29,72,0.5)]" />
                          )}

                          <div className="flex flex-col space-y-2 pr-1">
                            {/* Fila superior: Títol de la notificació i Temps a la dreta de tot d'acord amb la petició de l'usuari */}
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

                            {/* Cos central explicatiu */}
                            <p className="text-[10.5px] text-slate-400 font-medium leading-relaxed">
                              {item.text}
                            </p>

                            {/* Fila inferior: Etiquetes d'importància completes mòbils situades a baix a la dreta de la targeta */}
                            <div className="flex items-center justify-end pt-1">
                              {/* Explicació per a no-programadors: Etiqueta amb el text complet llimat (molt important en Vermell, important en Taronja i poc important en Verd fòsfor tipus Paint) seguint el criteri de text sencer. */}
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

                    {/* Peu informatiu de l'escola de repàs d'oposicions d'OposiCAT */}
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
            {/* A. 1A FASE: PROVA TEÒRICA */}
            {/* ----------------------------------------------------------------- */}
            <div className="space-y-1">
              <button 
                onClick={() => setAcordioExamenTeoricObert(!acordioExamenTeoricObert)}
                className="w-full flex items-center justify-between text-left py-2 px-1 border-b border-blue-900/15 cursor-pointer"
                id="sidebar-btn-seccio-teorica"
              >
                <div className="flex items-center gap-2">
                  {/* Comentari planer per a no-programadors: Restaurem el contingut original "1. PROVA TEÒRICA" segons desitjos de l'usuari */}
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-205">
                    1. PROVA TEÒRICA
                  </span>
                </div>
                {acordioExamenTeoricObert ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

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
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] text-slate-202 hover:bg-slate-905"
                      id="btn-sub-examen-teoric"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> EXAMEN TEÒRIC
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
                          onClick={() => {
                            setSeccioActiva('teorica_temari_oficial');
                            setMostrarTresAmbitsInici(true);
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'teorica_temari_oficial' 
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Temari Oficial (DOGC)</span>
                        </button>

                        {/* 2. Temari OposiMossos */}
                        {/* Comentari planer per a no-programadors: Canviem el text de l'opció del menú per 'Area d'estudi personal' tal com reclama el client */}
                        <button
                          id="opt-teorica-temari-oposimossos"
                          onClick={() => setSeccioActiva('teorica_temari_oposimossos')}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'teorica_temari_oposimossos' 
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Area d'estudi personal</span>
                        </button>

                        {/* 3. Classes Premium */}
                        <button
                          id="opt-teorica-classes-premium"
                          onClick={() => setSeccioActiva('teorica_classes_premium')}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'teorica_classes_premium' 
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Classes Premium</span>
                        </button>

                        {/* 4. Classes en Directe */}
                        <button
                          id="opt-teorica-classes-directe"
                          onClick={() => setSeccioActiva('teorica_classes_directe')}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase relative ${
                            seccioActiva === 'teorica_classes_directe' 
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Classes en Directe</span>
                          <span className="absolute right-2 top-2.5 w-1.5 h-1.5 rounded-full bg-[#00f296] animate-pulse" />
                        </button>

                        {/* 5. Exàmens OposiMossos */}
                        <button
                          id="opt-teorica-examens-oposimossos"
                          onClick={() => setSeccioActiva('teorica_examens_oposimossos')}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'teorica_examens_oposimossos' 
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Exàmens OposiMossos</span>
                        </button>

                        {/* 6. Exàmens Oficials Passats */}
                        <button
                          id="opt-teorica-examens-oficials"
                          onClick={() => setSeccioActiva('teorica_examens_oficials')}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'teorica_examens_oficials' 
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
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
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] text-slate-205 hover:bg-slate-905"
                      id="btn-sub-examen-psicotecnic"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" /> EXAMEN PSICOTÈCNIC
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
                              onClick={() => {
                                setSeccioActiva('teorica_psicotecnics');
                                setPsicotecnicActiu(prova);
                              }}
                              className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                                actiu 
                                  ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                                  : 'hover:bg-slate-900 text-slate-400 border border-transparent'
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
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] text-slate-205 hover:bg-slate-905"
                      id="btn-sub-actualitat"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> ACTUALITAT
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
                              onClick={() => {
                                setSeccioActiva('teorica_actualitat');
                                setActualitatActiva(opcio);
                              }}
                              className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                                actiu 
                                  ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                                  : 'hover:bg-slate-900 text-slate-400 border border-transparent'
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
              <button 
                onClick={() => setAcordioProvesFisiquesObert(!acordioProvesFisiquesObert)}
                className="w-full flex items-center justify-between text-left py-2 px-1 border-b border-blue-900/15 cursor-pointer"
                id="sidebar-btn-seccio-fisica"
              >
                <div className="flex items-center gap-2">
                  {/* Comentari planer per a no-programadors: Restaurem "2. PROVA FÍSICA" al menú lateral de la web */}
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-205">
                    2. PROVA FÍSICA
                  </span>
                </div>
                {acordioProvesFisiquesObert ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {acordioProvesFisiquesObert && (
                <div className="pl-3.5 py-2 flex flex-col gap-3 border-l border-blue-500/10 ml-1.5">
                  
                  {/* ====== DESPLEGABLE INTERN 1: PROVES FÍSIQUES (3) ====== */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioProvesFisiques3Obert(!subAcordioProvesFisiques3Obert)}
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] text-slate-205 hover:bg-slate-905"
                      id="btn-sub-proves-fisiques"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" /> PROVES FÍSIQUES (3)
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
                          onClick={() => {
                            setSeccioActiva('fisica_proves');
                            setFisicaProvaActiva('Press de banca');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'fisica_proves' && fisicaProvaActiva === 'Press de banca'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Press de banca</span>
                        </button>

                        {/* 2. Circuit d'agilitat */}
                        <button
                          id="opt-fisica-agilitat"
                          onClick={() => {
                            setSeccioActiva('fisica_proves');
                            setFisicaProvaActiva("Circuit d'agilitat");
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'fisica_proves' && fisicaProvaActiva === "Circuit d'agilitat"
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Circuit d'agilitat</span>
                        </button>

                        {/* 3. Curse Navette */}
                        <button
                          id="opt-fisica-navette"
                          onClick={() => {
                            setSeccioActiva('fisica_proves');
                            setFisicaProvaActiva('Curse Navette');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'fisica_proves' && fisicaProvaActiva === 'Curse Navette'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
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
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] text-slate-205 hover:bg-slate-905"
                      id="btn-sub-dieta"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" /> DIETA
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
                          onClick={() => {
                            setSeccioActiva('fisica_dieta');
                            setDietaActiva('Dieta gratuïta');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'fisica_dieta' && dietaActiva === 'Dieta gratuïta'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Dieta gratuïta</span>
                        </button>

                        {/* 2. Dieta Premium */}
                        <button
                          id="opt-dieta-premium"
                          onClick={() => {
                            setSeccioActiva('fisica_dieta');
                            setDietaActiva('Dieta premium');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'fisica_dieta' && dietaActiva === 'Dieta premium'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
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
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] text-slate-205 hover:bg-slate-905"
                      id="btn-sub-buscar-gimnas"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> BUSCAR GIMNÀS
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
                          onClick={() => {
                            setSeccioActiva('fisica_gimnas');
                            setGimnasActiu('Buscar gimnàs');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'fisica_gimnas' && gimnasActiu === 'Buscar gimnàs'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Buscar gimnàs</span>
                        </button>

                        {/* 2. Donar d'alta gimnàs */}
                        <button
                          id="opt-gimnas-alta"
                          onClick={() => {
                            setSeccioActiva('fisica_gimnas');
                            setGimnasActiu("Donar d'alta gimnàs");
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'fisica_gimnas' && gimnasActiu === "Donar d'alta gimnàs"
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
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
              <button 
                onClick={() => setAcordioPsicologicaObert(!acordioPsicologicaObert)}
                className="w-full flex items-center justify-between text-left py-2 px-1 border-b border-blue-900/15 cursor-pointer"
                id="sidebar-btn-seccio-psico"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-205">
                    3. PROVA PSICOLÒGICA
                  </span>
                </div>
                {acordioPsicologicaObert ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {acordioPsicologicaObert && (
                <div className="pl-3.5 py-2 flex flex-col gap-3 border-l border-purple-500/10 ml-1.5 font-sans">
                  
                  {/* ====== SOTS-DESPLEGABLE 1: COMPETÈNCIES CLAU ====== */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioPsicoCompetenciesObert(!subAcordioPsicoCompetenciesObert)}
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] text-slate-205 hover:bg-slate-905"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" /> Competencies clau
                      </span>
                      {subAcordioPsicoCompetenciesObert ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {subAcordioPsicoCompetenciesObert && (
                      <div className="pl-3 flex flex-col gap-1 border-l border-white/5 ml-1.5 mt-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setSeccioActiva('psico_competencies');
                            setPsicoSubSeccioActiva('Apren com es puntua');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'psico_competencies' && psicoSubSeccioActiva === 'Apren com es puntua'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Apren com es puntua</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ====== SOTS-DESPLEGABLE 2: BIODATA ====== */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioPsicoBiodataObert(!subAcordioPsicoBiodataObert)}
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] text-slate-205 hover:bg-slate-905"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" /> Biodata
                      </span>
                      {subAcordioPsicoBiodataObert ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {subAcordioPsicoBiodataObert && (
                      <div className="pl-3 flex flex-col gap-1 border-l border-white/5 ml-1.5 mt-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setSeccioActiva('psico_biodata');
                            setPsicoSubSeccioActiva('test biodata');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'psico_biodata' && psicoSubSeccioActiva === 'test biodata'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- test biodata</span>
                        </button>

                        <button
                          onClick={() => {
                            setSeccioActiva('psico_biodata');
                            setPsicoSubSeccioActiva('preguntes personals');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'psico_biodata' && psicoSubSeccioActiva === 'preguntes personals'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- preguntes personals</span>
                        </button>

                        <button
                          onClick={() => {
                            setSeccioActiva('psico_biodata');
                            setPsicoSubSeccioActiva('preguntes laborals');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'psico_biodata' && psicoSubSeccioActiva === 'preguntes laborals'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- preguntes laborals</span>
                        </button>

                        <button
                          onClick={() => {
                            setSeccioActiva('psico_biodata');
                            setPsicoSubSeccioActiva('preguntes PGME');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'psico_biodata' && psicoSubSeccioActiva === 'preguntes PGME'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- preguntes PGME</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ====== SOTS-DESPLEGABLE 3: ENTREVISTA ====== */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setSubAcordioPsicoEntrevistaObert(!subAcordioPsicoEntrevistaObert)}
                      className="w-full text-left p-2 rounded-xl flex items-center justify-between transition-all cursor-pointer font-extrabold italic text-[11px] text-slate-205 hover:bg-slate-905"
                    >
                      <span className="flex items-center gap-2 uppercase tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" /> Entrevista
                      </span>
                      {subAcordioPsicoEntrevistaObert ? (
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {subAcordioPsicoEntrevistaObert && (
                      <div className="pl-3 flex flex-col gap-1 border-l border-white/5 ml-1.5 mt-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setSeccioActiva('psico_entrevista');
                            setPsicoSubSeccioActiva("Practicar l'entrevista");
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'psico_entrevista' && psicoSubSeccioActiva === "Practicar l'entrevista"
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- Practicar l'entrevista</span>
                        </button>

                        <button
                          onClick={() => {
                            setSeccioActiva('psico_cita');
                            setPsicoSubSeccioActiva('demanar cita');
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold italic text-[10px] uppercase ${
                            seccioActiva === 'psico_cita' && psicoSubSeccioActiva === 'demanar cita'
                              ? 'bg-blue-950/80 border border-blue-900 text-[#FFDF00]' 
                              : 'hover:bg-slate-900 text-slate-400 border border-transparent'
                          }`}
                        >
                          <span>- demanar cita</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>

        {/* ACCIONS INFERIORS DEL CAMPUS */}
        <div className="p-5 border-t border-blue-950/40 space-y-3.5 bg-slate-950/90">
          <button
            onClick={onObrirAppMobilSimulacre}
            className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-black italic uppercase tracking-wider py-3 rounded-xl transition-all text-center cursor-pointer"
          >
            Sincronitzar amb el Mòbil (App)
          </button>
          
          <button
            onClick={onTornarLanding}
            className="w-full text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors block py-1"
          >
            ← Sortir al Web públic
          </button>
        </div>

      </aside>

      {/* ========================================================================= */}
      {/* 2. ZONA DE CONTINGUT CENTRAL DRETA (WORK AREA MULTIFUNCIONS) EN DESKTOP */}
      {/* ========================================================================= */}
      <div 
        className="flex-1 flex flex-col max-h-screen overflow-hidden relative transition-all duration-700 bg-cover bg-center"
        style={fonsActiuUrl ? { 
          backgroundImage: `linear-gradient(rgba(1, 9, 21, 0.90), rgba(1, 9, 21, 0.94)), url(${fonsActiuUrl})`
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
                    onClick={() => {
                      setDesplegablePerfilObert(false);
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
          {/* Explicació per a no-programadors: Fem servir un contenidor intern de max-w-6xl per a centrar el contingut, de manera que el scroll vertical de PC es col·loqui a l'extrem lateral dret de la pantalla en lloc de quedar susmès o surant al bell mig. */}
          <div className="p-6 sm:p-10 flex flex-col gap-6 max-w-6xl w-full mx-auto pb-20">
        
        {/* CAPÇALERA MULTI-SITUACIÓ */}
        {seccioActiva !== 'avui' && (
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
          <div className="flex-1 flex flex-col items-center pt-10 sm:pt-24 pb-16 px-4 max-w-4xl mx-auto text-center gap-32 sm:gap-40 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-[3rem] font-black tracking-tight text-white font-sans antialiased uppercase">
                Què vols fer avui?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold max-w-lg mx-auto italic tracking-wide">
                Selecciona la fase de l'oposició per començar a preparar-te
              </p>
            </div>
            
            <div className="relative w-full sm:w-[28rem] select-none z-10 transition-all duration-300">
              {/* Línia vertical gris a l'esquerra dibuixada al croquis del client */}
              <div className="absolute -left-10 lg:-left-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
              
              <div className="flex flex-col gap-6 w-full">
                
                {/* Botó 1: Prova teòrica (Groc corporatiu, sense icones, d'una mida elegant i equilibrada) */}
                <button
                  id="btn-index-prova-teorica"
                  onClick={() => {
                    setSeccioActiva('teorica_temari_oficial');
                    setAcordioExamenTeoricObert(true);
                    setSubAcordioTeoricObert(true);
                    setMostrarTresAmbitsInici(true);
                  }}
                  className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.22em] py-5 px-10 rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-sm border-2 border-transparent"
                >
                  {/* Comentari planer per a no-programadors: Restaurem el contingut original "Prova teòrica" del botó central perquè s'han desfet tots els canvis d'Area d'estudi */}
                  Prova teòrica
                </button>

                {/* Botó 2: Preova física (Groc corporatiu, sense icones, d'una mida elegant i equilibrada) */}
                <button
                  id="btn-index-preova-fisica"
                  onClick={() => {
                    setSeccioActiva('fisica_proves');
                    setAcordioProvesFisiquesObert(true);
                    setSubAcordioProvesFisiques3Obert(true);
                  }}
                  className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.22em] py-5 px-10 rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-sm border-2 border-transparent"
                >
                  {/* Comentari planer per a no-programadors: Restaurem "Preova física" per al segon botó d'accés del web */}
                  Preova física
                </button>

                {/* Botó 3: Prova psicotècnica (Groc corporatiu, sense icones, d'una mida elegant i equilibrada) */}
                <button
                  id="btn-index-prova-psicotecnica"
                  onClick={() => {
                    setSeccioActiva('teorica_psicotecnics');
                    setAcordioExamenTeoricObert(true);
                    setSubAcordioPsicotecnicObert(true);
                  }}
                  className="group relative w-full bg-[#FFDF00] hover:bg-[#fff066] text-slate-950 font-black italic uppercase tracking-[0.22em] py-5 px-10 rounded-full shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-98 cursor-pointer text-center text-sm border-2 border-transparent"
                >
                  Prova psicotècnica
                </button>

              </div>

              {/* Línia vertical gris a la dreta dibuixada al croquis del client */}
              <div className="absolute -right-10 lg:-right-16 top-2 bottom-2 w-[2px] bg-slate-800 rounded-full hidden sm:block"></div>
            </div>
          </div>
        )}

        {/* A.1. TEMARI OFICIAL DEL DOGC */}
        {seccioActiva === 'teorica_temari_oficial' && (() => {
          // Explicació per a no-programadors: Calculem els temes completats per a cadascun dels tres àmbits de manera dinàmica a partir de l'estat local.
          const totalA = TEMARI_DETALL.A.length;
          const totalB = TEMARI_DETALL.B.length;
          const totalC = TEMARI_DETALL.C.length;

          const llegitA = Array.from({ length: totalA }, (_, i) => !!temesLlegitsLocals[`A_${i}`]);
          const llegitB = Array.from({ length: totalB }, (_, i) => !!temesLlegitsLocals[`B_${i}`]);
          const llegitC = Array.from({ length: totalC }, (_, i) => !!temesLlegitsLocals[`C_${i}`]);

          const pctA = Math.round((llegitA.filter(Boolean).length / totalA) * 100);
          const pctB = Math.round((llegitB.filter(Boolean).length / totalB) * 100);
          const pctC = Math.round((llegitC.filter(Boolean).length / totalC) * 100);

          // 1. PANTALLA INICIAL DE 3 BLOCS (MATEIXA ESTÈTICA QUE L'APP SEGONS LA FOTO DE L'USUARI)
          // Explicació per a no-programadors:
          // Aplicarem l'Opció 2 per augmentar el contrast mitjançant un fons amb efecte "glassmorphism" (vidre fosc) de vora blava semi-transparent.
          // Això encapsula tota la pantalla de Temari en una targeta d'alt contrast. Així, aïllem el contingut per sobre del fons decoratiu general.
          // Reestructurem els botons de selecció d'àmbits: col·locats de forma vertical (1 a dalt, 2 al mig i el tercer a sota), 
          // sent més prims de dalt a baix i més llargs en horitzontal per a una usabilitat premium.
          if (mostrarTresAmbitsInici) {
            // Explicació per a no-programadors: Configurem l'amplada màxima al 85% ("max-w-[85%]") i centrem horitzontalment la targeta ("mx-auto") per reduir l'amplada un 15% tal com ha sol·licitat l'usuari
            return (
              <div className="bg-slate-950/50 backdrop-blur-lg border border-slate-800/50 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-8 animate-in fade-in duration-300 max-w-[85%] mx-auto w-full text-left">
                {/* Capçalera superior amb botó de tornada enrere en la part superior esquerra i el bloc del Temari Oficial al mig */}
                <div className="flex items-center justify-between w-full relative min-h-16">
                  {/* Botó enrere amb l'icona < per retrocedir a 'avui' */}
                  <button 
                    onClick={() => setSeccioActiva('avui')}
                    className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-white/5 rounded-2xl active:scale-95 shadow-lg text-white transition-all cursor-pointer flex items-center justify-center relative z-20"
                    title="Tornar a l'inici"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>

                  {/* Escut o fons decoratiu del títol ovalat de Temari Oficial exactament com la foto del client */}
                  <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center select-none text-center">
                    <div className="bg-slate-950/90 px-8 py-3 rounded-full border border-white/10 shadow-2xl flex items-center justify-center">
                      <h2 className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase leading-none text-center">
                        <span className="text-white">Temari </span>
                        <span className="text-[#FFDF00]">Oficial</span>
                      </h2>
                    </div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.22em] italic mt-2.5 block text-center">
                      Convocatòria 2025-2026
                    </span>
                    <div className="h-0.5 w-[50px] bg-[#FFDF00]/55 rounded-full mt-1.5" />
                  </div>

                  {/* Lloc buit a la dreta per centrar exactament la capçalera */}
                  <div className="w-11" />
                </div>

                {/* Banner grog de text informatiu en català cursiu */}
                <div className="bg-slate-950/30 border border-slate-800/50 rounded-2xl py-4 px-6 shadow-xl text-center">
                  <p className="text-[#FFDF00]/95 text-xs sm:text-sm font-semibold leading-relaxed italic">
                    "Et presentem el temari oficial de l'oposició de Mossos d'Esquadra de l'any 2025-2026 perquè en facis ús en qualsevol lloc."
                  </p>
                </div>

                {/* Llistat en vertical dels 3 blocs interactius, ordenats de dalt a baix i més estilitzats (vertical stack) */}
                <div className="flex flex-col gap-4 pt-2">
                  
                  {/* BLOC ÀMBIT A (TOP / DALT) */}
                  <motion.button
                    onClick={() => {
                      setAmbitSeleccionat('A');
                      setMostrarTresAmbitsInici(false);
                    }}
                    whileHover={{ scale: 1.015, translateY: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-blue-650/10 hover:bg-blue-650/15 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all text-left shadow-lg cursor-pointer group hover:border-blue-500/40"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icona de llibre en blau, més petita i integrada en format horitzontal */}
                      <div className="p-3 bg-blue-500 rounded-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                        <BookOpen className="text-white" size={18} />
                      </div>
                      <div>
                        <span className="text-white/60 font-black italic uppercase text-[9px] tracking-widest block mb-0.5">Àmbit A</span>
                        <h3 className="text-white font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                          Coneixements de l'entorn
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:text-right w-full sm:w-auto mt-2 sm:mt-0 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      <div className="flex items-center justify-between sm:justify-end gap-3 text-[10px]">
                        <span className="font-bold uppercase text-slate-400 tracking-widest text-[9px]">Llegit:</span>
                        <span className="text-[#FFDF00] font-black text-sm italic">{pctA}%</span>
                      </div>
                      <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-w-xs sm:max-w-none">
                        {llegitA.map((llegit, idx) => (
                          <span
                            key={idx}
                            className={`text-[9.5px] font-black px-1.5 py-0.5 rounded transition-all leading-none ${
                              llegit
                                ? 'text-emerald-450 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)] bg-emerald-500/10 border border-emerald-500/20'
                                : 'text-slate-650 font-normal bg-slate-950/40'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.button>

                  {/* BLOC ÀMBIT B (MIDDLE / AL MIG) */}
                  <motion.button
                    onClick={() => {
                      setAmbitSeleccionat('B');
                      setMostrarTresAmbitsInici(false);
                    }}
                    whileHover={{ scale: 1.015, translateY: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-amber-650/15 hover:bg-amber-650/20 border border-amber-500/25 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all text-left shadow-lg cursor-pointer group hover:border-amber-500/40"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icona de temple/institució en color taronja/ambre mètric */}
                      <div className="p-3 bg-amber-500 rounded-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                        <GraduationCap className="text-white" size={18} />
                      </div>
                      <div>
                        <span className="text-white/60 font-black italic uppercase text-[9px] tracking-widest block mb-0.5">Àmbit B</span>
                        <h3 className="text-white font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                          Àmbit institucional
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:text-right w-full sm:w-auto mt-2 sm:mt-0 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      <div className="flex items-center justify-between sm:justify-end gap-3 text-[10px]">
                        <span className="font-bold uppercase text-slate-400 tracking-widest text-[9px]">Llegit:</span>
                        <span className="text-[#FFDF00] font-black text-sm italic">{pctB}%</span>
                      </div>
                      <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-w-xs sm:max-w-none">
                        {llegitB.map((llegit, idx) => (
                          <span
                            key={idx}
                            className={`text-[9.5px] font-black px-1.5 py-0.5 rounded transition-all leading-none ${
                              llegit
                                ? 'text-emerald-450 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)] bg-emerald-500/10 border border-emerald-500/20'
                                : 'text-slate-650 font-normal bg-slate-950/40'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.button>

                  {/* BLOC ÀMBIT C (BOTTOM / ABAIX) */}
                  <motion.button
                    onClick={() => {
                      setAmbitSeleccionat('C');
                      setMostrarTresAmbitsInici(false);
                    }}
                    whileHover={{ scale: 1.015, translateY: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-emerald-650/10 hover:bg-emerald-650/15 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all text-left shadow-lg cursor-pointer group hover:border-emerald-500/40"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icona d'escut en color verd maragda, molt estilitzada */}
                      <div className="p-3 bg-emerald-500 rounded-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                        <ShieldCheck className="text-white" size={18} />
                      </div>
                      <div>
                        <span className="text-white/60 font-black italic uppercase text-[9px] tracking-widest block mb-0.5">Àmbit C</span>
                        <h3 className="text-white font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                          Àmbit de seguretat i policia
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:text-right w-full sm:w-auto mt-2 sm:mt-0 shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      <div className="flex items-center justify-between sm:justify-end gap-3 text-[10px]">
                        <span className="font-bold uppercase text-slate-400 tracking-widest text-[9px]">Llegit:</span>
                        <span className="text-[#FFDF00] font-black text-sm italic">{pctC}%</span>
                      </div>
                      <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-w-xs sm:max-w-none">
                        {llegitC.map((llegit, idx) => (
                          <span
                            key={idx}
                            className={`text-[9.5px] font-black px-1.5 py-0.5 rounded transition-all leading-none ${
                              llegit
                                ? 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)] bg-emerald-500/10 border border-emerald-500/20'
                                : 'text-slate-650 font-normal bg-slate-950/40'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.button>

                </div>

                {/* Peu de pàgina de l'acadèmia pintat d'una forma corporativa i asèptica */}
                {/* Explicació per a no-programadors: Cambiem el peu de pàgina de la targeta a "OposiMossos - Preparació d'oposicions" per petició de l'usuari */}
                <div className="text-center pt-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] select-none">
                  OposiMossos - Preparació d'oposicions
                </div>
              </div>
            );
          }

          // 2. PANTALLA DETALLADA D'ÀMBIT (AMB PESTANYES RÀPIDES I RÈPLICA DEL FORMAT DE L'APP DE L'USUARI)
          // Explicació per a no-programadors: Aquesta és la cuina del nostre lector de l'ordinador. Dividim el comportament en 3 fases:
          // A) Si tenim obert un capítol o punt concret (subtemaSeleccionatIndex), mostrem el Lector de text amb subratllador.
          // B) Si estem dins d'un Tema seleccionat, mostrem el lllistat complet de capítols.
          // C) Si estem a la pantalla general de l'àmbit, llistem els temes generals de les oposicions.

          // --- FASE A: EL LECTOR DE CONTINGUT DINÀMIC ---
          if (temaSeleccionatIndex !== null && subtemaSeleccionatIndex !== null) {
            const dadesTema = TEMARI_DETALL[ambitSeleccionat]?.[temaSeleccionatIndex];
            const titolCapitol = dadesTema?.subtemes[subtemaSeleccionatIndex] || "";
            const clauCapitol = `${ambitSeleccionat}_${temaSeleccionatIndex}_${subtemaSeleccionatIndex}`;
            const completat = !!detallLlegitsLocals[clauCapitol];
            const contingutDesat = contingutPersonalitzatLocals[clauCapitol];
            const contingutOriginal = CONTINGUT_TEMARI_TEXTS[ambitSeleccionat]?.[temaSeleccionatIndex]?.[subtemaSeleccionatIndex] || "";

            // Formatem el contingut original a HTML (paràgrafs) si no n'hi ha cap de desat anteriorment.
            const inicialitzarContingut = () => {
              if (contingutDesat) return contingutDesat;
              if (!contingutOriginal) return "";
              // Dividim per salts de paràgraf i construïm paràgrafs HTML per al lector
              return contingutOriginal.split('\n\n').map(p => 
                `<p class="text-slate-200 text-sm md:text-base leading-relaxed mb-6 font-medium text-justify transition-all">${p}</p>`
              ).join('');
            };

            // Explicació per a no-programadors: Aquesta funció s'encarrega d'analitzar quin fragment de text té seleccionat l'estudiant i de pintar-lo de groc d'un sol cop. S'activa en deixar de prémer el ratolí.
            const handleSubratllar = () => {
              if (einaActiva !== 'highlighter') return;
              
              const selection = window.getSelection();
              if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

              const range = selection.getRangeAt(0);
              const span = document.createElement('span');
              span.className = 'highlighter-span bg-yellow-400/80 text-black px-1 rounded-sm shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all cursor-pointer select-text';
              
              try {
                range.surroundContents(span);
                selection.removeAllRanges();
                
                // Explicació per a no-programadors: Guardem l'HTML modificat a la nostra memòria en aquest mateix instant per tal que es gardi a favor d'OposiCAT.
                if (pcArticleRef.current) {
                  const htmlNou = pcArticleRef.current.innerHTML;
                  setContingutPersonalitzatLocals(prev => ({
                    ...prev,
                    [clauCapitol]: htmlNou
                  }));
                }
              } catch (e) {
                console.warn("No es pot subratllar a través de múltiples blocs complexos de text.");
              }
            };

            // Explicació per a no-programadors: Si la goma d'esborrar està activa i l'usuari clica sobre un tros subratllat en groc, desfem el subratllat al moment.
            const handleEsborrarFocus = (e: React.MouseEvent) => {
              if (einaActiva !== 'eraser') return;
              
              const target = e.target as HTMLElement;
              if (target.classList.contains('highlighter-span')) {
                const parent = target.parentNode;
                if (parent) {
                  // Recomponem el contingut original sense el span decoratiu
                  while (target.firstChild) {
                    parent.insertBefore(target.firstChild, target);
                  }
                  parent.removeChild(target);
                  
                  // Desem el canvi sense el subratllat
                  if (pcArticleRef.current) {
                    const htmlNou = pcArticleRef.current.innerHTML;
                    setContingutPersonalitzatLocals(prev => ({
                      ...prev,
                      [clauCapitol]: htmlNou
                    }));
                  }
                }
              }
            };

            return (
              <div className="space-y-6 animate-in fade-in duration-300 text-left max-w-[85%] mx-auto w-full relative">
                
                {/* Capçalera del Lector */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 border border-slate-800/50 rounded-3xl backdrop-blur-md">
                  <button
                    onClick={() => {
                      setSubtemaSeleccionatIndex(null);
                      setEinaActiva(null); // Resetejem eina activa en sortir
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 hover:text-[#FFDF00] text-slate-300 font-extrabold italic uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer border border-slate-800/50"
                  >
                    <ChevronRight size={14} className="rotate-180" />
                    <span>Tornar als Capítols</span>
                  </button>

                  <div className="bg-slate-950/60 border border-slate-800/50 py-1.5 px-4 rounded-xl text-[10px] font-black italic uppercase text-amber-400 tracking-wider">
                    Llegint: À-{(ambitSeleccionat)} • Tema {temaSeleccionatIndex + 1}
                  </div>
                </div>

                {/* El text d'estudi amb format premium */}
                <div className="bg-slate-950/50 border border-slate-800/50 p-6 md:p-10 rounded-[32px] shadow-2xl relative">
                  
                  {/* Capçalera de capítol amb icona corporativa */}
                  <div className="mb-6 md:mb-8 pb-4 border-b border-slate-800/40 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-[#FFDF00] font-black uppercase tracking-[0.2em] font-mono">
                        CAPÍTOL {subtemaSeleccionatIndex + 1} DE {dadesTema?.subtemes.length} • ISPC OPOSIMOSSOS
                      </span>
                      <h2 className="text-lg md:text-2xl font-black italic uppercase text-white leading-tight">
                        {titolCapitol}
                      </h2>
                    </div>

                    <div className="shrink-0 p-3 bg-red-650/15 rounded-xl border border-red-600/20 text-red-400">
                      <BookOpen size={20} />
                    </div>
                  </div>

                  {/* Banner d'informació sobre subratllador amb canviador de modalitats actiu */}
                  <div className="bg-[#0b1e36]/65 border border-blue-900/50 rounded-2xl p-4 md:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
                    <div className="flex items-center gap-4">
                       <div className={`p-2.5 rounded-xl transition-all ${
                        einaActiva === 'highlighter' ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20' : 
                        einaActiva === 'eraser' ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {einaActiva === 'highlighter' ? <Highlighter size={18} className="animate-pulse" /> : einaActiva === 'eraser' ? <Eraser size={18} /> : <Highlighter size={18} />}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-200 tracking-wider leading-none mb-1">
                          {einaActiva === 'highlighter' ? 'Eina Activa: Subratllador Oficial' : 
                           einaActiva === 'eraser' ? 'Eina Activa: Goma d\'Esborrar' : 
                           'Subratllador Intel·ligent de l’APP obert'}
                        </h4>
                        <p className="text-[10px] md:text-xs text-blue-200/80 font-semibold italic leading-relaxed">
                          {einaActiva === 'highlighter' ? (
                            <span>Selecciona qualsevol text del temari amb el cursor per a marcar-lo en groc.</span>
                          ) : einaActiva === 'eraser' ? (
                            <span>Clica damunt de qualsevol frase o fragment groc per a extreure el subratllat.</span>
                          ) : (
                            <span className="space-y-2 block">
                              <span>
                                Tens a la teva disposició eines d’estudi professionals d’OposiCAT{' '}
                                <span className="text-yellow-400 font-bold not-italic">tot el que subratillis després ho veuras a la teva area d'estudi</span>{' '}
                                per a poder estudiar millor!
                              </span>
                              <span className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-800/10">
                                <button className="bg-sky-400 hover:bg-sky-500 text-slate-950 text-[9.5px] font-black uppercase tracking-wider px-3 h-6 rounded-md transition-all cursor-pointer flex items-center justify-center shadow-lg active:scale-95 leading-none shrink-0" onClick={() => {}}>
                                  Area d'estudi
                                </button>
                                <span className="text-blue-200/80 font-bold text-[10px] sm:text-xs">
                                  ← Software especial per estudiar, clica'm
                                </span>
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Selectors ràpids d'eines integrats directament al visor en format vertical per donar més espai horitzontal al text explicatiu */}
                    <div className="flex flex-col gap-2 w-full md:w-36 self-stretch md:self-auto shrink-0">
                      <button
                        onClick={() => setEinaActiva(einaActiva === 'highlighter' ? null : 'highlighter')}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                          einaActiva === 'highlighter'
                            ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-md shadow-yellow-400/25'
                            : 'bg-yellow-950/20 text-yellow-300 hover:bg-yellow-950/40 border-yellow-900/40'
                        }`}
                      >
                        <Highlighter size={13} />
                        <span>Subratllar</span>
                      </button>

                      <button
                        onClick={() => setEinaActiva(einaActiva === 'eraser' ? null : 'eraser')}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                          einaActiva === 'eraser'
                            ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/25'
                            : 'bg-red-950/20 text-red-300 hover:bg-red-950/40 border-red-900/40'
                        }`}
                      >
                        <Eraser size={13} />
                        <span>Esborrar</span>
                      </button>


                    </div>
                  </div>

                  {/* Presentació del contingut del DOGC */}
                  <div 
                    onMouseUp={handleSubratllar}
                    onTouchEnd={handleSubratllar}
                    onClick={handleEsborrarFocus}
                    className={`bg-slate-950/85 border border-slate-800/60 rounded-2xl p-5 md:p-8 shadow-inner select-text transition-all duration-300 relative ${
                      einaActiva === 'highlighter' ? 'ring-2 ring-yellow-400/25 bg-yellow-400/[0.02]' : 
                      einaActiva === 'eraser' ? 'ring-2 ring-red-500/25 bg-red-500/[0.02]' : ''
                    }`}
                  >
                    {/* Indicador visual de l'eina flotant al costat dels paràgrafs per si l'estudiant s'oblida de l'estat */}
                    {einaActiva && (
                      <div className={`absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md animate-pulse ${
                        einaActiva === 'highlighter' ? 'bg-yellow-400 text-slate-950' : 'bg-red-500 text-white'
                      }`}>
                        {einaActiva === 'highlighter' ? 'Mètode Subratllat actiu' : 'Mode Esborrar actiu'}
                      </div>
                    )}

                    <div 
                      ref={pcArticleRef}
                      className={`prose prose-invert max-w-none select-text text-justify transition-all duration-200 ${
                        einaActiva === 'eraser' ? 'hover:opacity-90' : ''
                      }`}
                      dangerouslySetInnerHTML={{ __html: inicialitzarContingut() }}
                    />
                    
                    {!contingutOriginal && (
                      <div className="py-12 flex flex-col items-center gap-4 opacity-40 text-center animate-pulse">
                        <div className="w-12 h-12 rounded-full border border-dashed border-slate-500 flex items-center justify-center">
                          <AlertTriangle className="text-amber-500" size={18} />
                        </div>
                        <p className="text-xs uppercase font-black tracking-widest text-slate-400">Resum i contingut oficial en camí d'incorporació</p>
                      </div>
                    )}
                  </div>

                  {/* Botó interactiu per marcar com a completat */}
                  {contingutOriginal && (
                    <div className="mt-8 flex justify-center pb-2">
                      <button 
                        onClick={() => {
                          setDetallLlegitsLocals(prev => {
                            const nouestat = { ...prev, [clauCapitol]: !completat };
                            
                            // Comprovem si tots els capítols del tema estan completats per actualitzar automàticament el tema com a "Llegit"
                            const totsCapitolsComplets = dadesTema.subtemes.every((_, subIdx) => {
                              const key = `${ambitSeleccionat}_${temaSeleccionatIndex}_${subIdx}`;
                              return nouestat[key] || (key === clauCapitol ? !completat : false);
                            });
                            
                            setTemesLlegitsLocals(prevTemes => ({
                              ...prevTemes,
                              [`${ambitSeleccionat}_${temaSeleccionatIndex}`]: totsCapitolsComplets
                            }));
                            
                            return nouestat;
                          });
                          setSubtemaSeleccionatIndex(null);
                          setEinaActiva(null); // Resetejem en tancar
                        }}
                        className={`flex items-center gap-2.5 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer border ${
                          completat 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-950/10' 
                            : 'bg-[#FFDF00] text-slate-950 hover:bg-yellow-400 border-yellow-500'
                        }`}
                      >
                        <CheckCircle2 size={16} />
                        {completat ? '✓ Llegit correctament' : 'Marcar capítol com a llegit'}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          }

          // --- FASE B: DETALL DE TEMA (LLISTAT DE CAPÍTOLS) ---
          if (temaSeleccionatIndex !== null && subtemaSeleccionatIndex === null) {
            const dadesTema = TEMARI_DETALL[ambitSeleccionat]?.[temaSeleccionatIndex];
            const titolTema = dadesTema?.titol || "";
            const subtemes = dadesTema?.subtemes || [];

            return (
              <div className="space-y-6 animate-in fade-in duration-300 text-left max-w-[85%] mx-auto w-full">
                
                {/* Capçalera del Detall de Tema */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 border border-slate-800/50 rounded-3xl backdrop-blur-md">
                  <button
                    onClick={() => setTemaSeleccionatIndex(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 hover:text-[#FFDF00] text-slate-300 font-extrabold italic uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer border border-slate-800/50"
                  >
                    <ChevronRight size={14} className="rotate-180" />
                    <span>Tornar al Temari</span>
                  </button>

                  <div className="bg-slate-950/60 border border-slate-800/50 py-1.5 px-4 rounded-xl text-[10px] font-black italic uppercase text-white tracking-wider">
                    Tema {temaSeleccionatIndex + 1} de l'Àmbit {ambitSeleccionat}
                  </div>
                </div>

                {/* Caixa d'informació del Tema */}
                <div className="bg-slate-950/50 border border-slate-800/50 p-6 md:p-10 rounded-[32px] shadow-2xl space-y-6 text-left">
                  
                  {/* Capçalera elegant */}
                  <div className="border-b border-slate-800/40 pb-5">
                    <span className="text-[9px] text-[#FFDF00] font-black uppercase tracking-[0.25em] font-mono block mb-1">
                      TEMA DETALLAT {temaSeleccionatIndex + 1} • {subtemes.length} CAPÍTOLS OFICIALS
                    </span>
                    <h2 className="text-xl md:text-3xl font-black italic uppercase text-white leading-tight">
                      {titolTema}
                    </h2>
                  </div>

                  {/* Llista dels Capítols o punts de l'examen de Mossos */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {subtemes.map((temaStr, idx) => {
                      const clauCapitol = `${ambitSeleccionat}_${temaSeleccionatIndex}_${idx}`;
                      const completat = !!detallLlegitsLocals[clauCapitol];

                      return (
                        <div
                          key={idx}
                          onClick={() => setSubtemaSeleccionatIndex(idx)}
                          className="border border-slate-800/60 hover:border-blue-900/60 bg-slate-950/85 hover:bg-slate-900/65 p-5 rounded-2xl flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Número de Capítol */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black italic text-xs shrink-0 ${
                              completat 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/5' 
                                : 'bg-slate-950 border border-slate-800/50 text-slate-400 group-hover:text-[#FFDF00]'
                            }`}>
                              {idx + 1}
                            </div>

                            <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white leading-snug line-clamp-2">
                                {temaStr}
                              </h4>
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="text-[8px] font-black uppercase text-blue-400/80 tracking-widest">Llegir Resum</span>
                                <div className="h-px w-3 bg-blue-500/30" />
                              </div>
                            </div>
                          </div>

                          {/* Checkbox per marcar des de la mateixa llista de capítols sense obrir */}
                          <div 
                            onClick={(e) => {
                              e.stopPropagation(); // Evitem obrir el lector
                              setDetallLlegitsLocals(prev => {
                                const nouestat = { ...prev, [clauCapitol]: !completat };
                                
                                // Comprovem si tots els capítols estan completats
                                const totsCapitolsComplets = subtemes.every((_, subIdx) => {
                                  const key = `${ambitSeleccionat}_${temaSeleccionatIndex}_${subIdx}`;
                                  return nouestat[key];
                                });
                                
                                setTemesLlegitsLocals(prevTemes => ({
                                  ...prevTemes,
                                  [`${ambitSeleccionat}_${temaSeleccionatIndex}`]: totsCapitolsComplets
                                }));
                                
                                return nouestat;
                              });
                            }}
                            className={`w-6 h-6 rounded-md border transition-all flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 ${
                              completat 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {completat && <Check size={14} className="stroke-[4]" />}
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            );
          }

          // --- FASE C: LLEST DE TEMES DEL BLOC SELECCIONAT ---
          return (
            <div className="space-y-6 animate-in fade-in duration-300 text-left max-w-[85%] mx-auto w-full">
              
              {/* Capçalera del visor detallat: Té la capçalera de pestanyes de selecció i el botó de retorn */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 border border-blue-950/40 rounded-3xl">
                
                {/* Botó de retorn a l'inici dels 3 blocs */}
                <button
                  onClick={() => setMostrarTresAmbitsInici(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 hover:text-[#FFDF00] text-slate-300 font-extrabold italic uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer border border-[#062040]/50"
                  id="btn-tornar-tria-ambits"
                >
                  <ChevronRight size={14} className="rotate-180" />
                  <span>Enrere al Temari</span>
                </button>

                {/* FILTRE DE TRES ÀMBITS COMPACTES */}
                <div className="bg-slate-950/80 border border-slate-800/50 p-1 rounded-xl flex gap-1.5 w-full sm:w-auto max-w-md">
                  {(['A', 'B', 'C'] as const).map((a) => {
                    const actiu = ambitSeleccionat === a;
                    const nomAmbit = a === 'A' ? 'Àmbit A (Institucional)' : a === 'B' ? 'Àmbit B (Policial)' : 'Àmbit C (Penal)';
                    return (
                      <button
                        key={a}
                        onClick={() => {
                          setAmbitSeleccionat(a);
                          setTemaSeleccionatIndex(null);
                          setSubtemaSeleccionatIndex(null);
                        }}
                        className={`flex-1 text-center py-2 px-3 sm:px-4 rounded-lg text-[10px] font-black italic uppercase transition-all tracking-wider cursor-pointer whitespace-nowrap ${
                          actiu 
                            ? 'bg-red-650 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                        }`}
                      >
                        {nomAmbit}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LLISTA DE TEMES DE L'ÀMBIT INTEGRAT AMB CASALLES REALS D'EXCEL·LENT DISSENY */}
              {/* Explicació per a no-programadors: Hem redissenyat per complet aquesta llista perquè s'assembli estèticament al llistat dels capítols. Cadascun dels temes d'OposiMossos es converteix en una fila polida amb un quadrat a l'esquerra amb el número de tema, el títol oficial al mig amb el seu progrés, i el selector de completat/llegit a la dreta de forma coherent */}
              <div className="grid md:grid-cols-2 gap-4">
                {TEMARI_DETALL[ambitSeleccionat] && TEMARI_DETALL[ambitSeleccionat].map((dadesTema, index) => {
                  const clauEstudi = `${ambitSeleccionat}_${index}`;
                  const completat = !!temesLlegitsLocals[clauEstudi];

                  // Calculem quants capítols d'aquest tema tenim completats realment a l'ordinador
                  const capitolsTema = dadesTema.subtemes || [];
                  const capitolsLlegits = capitolsTema.filter((_, subIdx) => {
                    const clauCap = `${ambitSeleccionat}_${index}_${subIdx}`;
                    return !!detallLlegitsLocals[clauCap];
                  }).length;

                  return (
                    <div 
                      key={index}
                      onClick={() => {
                        setTemaSeleccionatIndex(index);
                        setSubtemaSeleccionatIndex(null);
                      }}
                      className="border border-slate-800/60 hover:border-blue-900/60 bg-slate-950/85 hover:bg-slate-900/65 p-5 rounded-2xl flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Número de Tema en lloc de capítol formatat amb T1, T2 de forma molt minimalista */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black italic text-xs shrink-0 ${
                          completat 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-md shadow-emerald-500/5' 
                            : 'bg-slate-950 border border-slate-800/50 text-slate-450 group-hover:text-[#FFDF00] transition-colors'
                        }`}>
                          T{index + 1}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <span className="text-[8.5px] font-black uppercase text-blue-400/80 tracking-widest block font-mono">
                            {dadesTema.subtemes.length} Capítols Oficials
                          </span>
                          <h4 className="text-xs sm:text-sm font-black italic uppercase text-slate-100 group-hover:text-white leading-snug line-clamp-2 transition-colors">
                            {dadesTema.titol}
                          </h4>
                          
                          {/* Petit progrés adaptat amb una barra de càrrega idèntica per visualitzar clarament la finalització */}
                          <div className="flex items-center gap-3 pt-0.5">
                            <span className="text-[9px] font-bold text-slate-500">
                              Progrés: {capitolsLlegits}/{capitolsTema.length}
                            </span>
                            <div className="flex-1 max-w-[80px] h-1 bg-slate-950/60 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${(capitolsLlegits / capitolsTema.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Checkbox real a la part dreta, coherent amb el mòdul dels capítols d'estudi de Mossos */}
                      <div 
                        onClick={(e) => {
                          e.stopPropagation(); // Evitem obrir la llista de capítols en clicar sobre del select
                          setTemesLlegitsLocals(prev => {
                            const nouTemaCompletat = !completat;
                            const nouestat = { ...prev, [clauEstudi]: nouTemaCompletat };
                            
                            // Marquem automàticament tots els capítols d'aquest tema d'una sola vegada
                            setDetallLlegitsLocals(prevCaps => {
                              const actualitzacioCaps = { ...prevCaps };
                              capitolsTema.forEach((_, subIdx) => {
                                actualitzacioCaps[`${ambitSeleccionat}_${index}_${subIdx}`] = nouTemaCompletat;
                              });
                              return actualitzacioCaps;
                            });

                            return nouestat;
                          });
                        }}
                        className={`w-6 h-6 rounded-md border transition-all flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 ${
                          completat 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {completat && <Check size={14} className="stroke-[4]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })()}

        {/* A.2. TEMARI OPOSIMOSSOS */}
        {seccioActiva === 'teorica_temari_oposimossos' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <h3 className="text-base font-black italic uppercase text-[#FFDF00]">EL MÈTODE D'ESTUDI OPOSIMOSSOS PER COMBATRE EL TEMARI</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              No serveix de res memoriar lleis sense saber on incideixen més els tribunals examinadors oficials de la Generalitat de Catalunya de forma històrica. Hem sintetitzat tot el contingut en mapes conceptuals.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-1.5">
                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider block">🗣️ SÍNTESIS D'OR INSTITUCIONAL</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Focus en la Llei Orgànica 2/1986 i en la llei 10/1994 sota mètode actiu de repetició espaiada. No dediquis hores a la història de Catalunya pura sense controlar el Codi Deontològic, que suposa el 25% del bloc policial.
                </p>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-1.5">
                <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-wider block">🎨 MAPES DE CONCEPTE RÀPID</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Tots els nostres temes contenen esquemes digitals descarregables des del mòbil per recordar de forma visual l'ordre jeràrquic de la Generalitat, el Parlament, la Presidència de Catalunya i els òrgans judicinals complets de l'Estat.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-950/30 via-red-950/10 to-[#021329] p-5 rounded-3xl border border-red-500/10 flex flex-col md:flex-row items-center gap-5 justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-[#00f296] font-extrabold uppercase tracking-widest block">💡 CONSELL BBDD D'ESTUDI A FUTUR</span>
                <p className="text-[11px] text-slate-300 italic font-semibold leading-relaxed">
                  "Et recomanem, modificaríem i/o recorda que pot passar... a futur" que si la teva connexió Wi-Fi/cable falla un moment a l'ordinador, l'estat d'aprenentatge s'actualitza al localStorage i s'enviarà de forma asíncrona a Firestore tan bon punt detecti internet, garantint que la teva sessió continuï intacta i sense pèrdua d'avenços.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* A.3. CLASSES PREMIUM */}
        {seccioActiva === 'teorica_classes_premium' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* REPRODUCTOR SIMULAT */}
            <div className="bg-slate-950 border border-[#062040]/40 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="aspect-video w-full bg-slate-900 border-b border-white/5 flex flex-col items-center justify-center relative p-6">
                
                {/* Visualització del vídeo segons quina lliçó estigui activa */}
                <div className="absolute inset-0 bg-[#021329] bg-opacity-70 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-500 hover:scale-105 active:scale-95 transition-all text-white" onClick={() => setReproduintVideo(!reproduintVideo)}>
                    {reproduintVideo ? (
                      <span className="text-xl font-bold font-mono">⏸</span>
                    ) : (
                      <Play className="w-6 h-6 fill-white text-white ml-1" />
                    )}
                  </div>
                  <div>
                    <span className="text-[8.5px] bg-[#00f296]/10 text-[#00f296] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {reproduintVideo ? 'REPRODUINT EXPLICACIÓ AUDIOVISUAL' : 'REPRODUCCIÓ DISPONIBLE EN PC'}
                    </span>
                    <h5 className="text-sm font-black uppercase tracking-wide text-white mt-2">
                      {classeVideoActiva === 'introduccio_estudi' && "Sessió 01: El mètode d'estudi de Mossos i estructura sencer de l'oposició"}
                      {classeVideoActiva === 'generalitat_estatut' && "Sessió 02: L'Estatut d'Autonomia i les Competències de Seguretat Pública"}
                      {classeVideoActiva === 'codi_deontologic' && "Sessió 03: Ètica i Codi Deontològic Policial dels Mossos"}
                    </h5>
                    <p className="text-[10px] text-slate-400 italic">
                      Preparador oficial: Inspector Lluís Mas - Departament d'Interior OposiCAT
                    </p>
                  </div>
                </div>

                {/* Barra de progrés de vídeo inferior ficticia */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600/30">
                  <div className={`bg-red-500 h-full ${reproduintVideo ? 'w-1/3 animate-pulse' : 'w-1/12'}`} />
                </div>
              </div>
            </div>

            {/* SELECCIÓ DE CLASSES GRAVADES */}
            <div className="space-y-3.5 text-left">
              <span className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest block pl-1">
                Llistat de sessions gravades de formació:
              </span>
              <div className="grid gap-3">
                {[
                  { clau: 'introduccio_estudi', t: "Sessió 01: El mètode d'estudi i gestió del temps a l'ISPC", durada: "45 minuts", dsc: "Inici de preparació, consells per als 3 àmbits, importància de desmuntar falses afirmacions." },
                  { clau: 'generalitat_estatut', t: "Sessió 02: Estatut de Catalunya i Llei 10/1994", durada: "1 hora 12 min", dsc: "Resum exhaustiu sobre dret estatutari, relacions exteriors, coordinació amb policies locals." },
                  { clau: 'codi_deontologic', t: "Sessió 03: Codi de Deontologia de la Policia de Catalunya", durada: "38 minuts", dsc: "Preàmbul de les assemblees europees, l'ús de la força de forma regulada i principis constitucionals de dret." }
                ].map((v) => (
                  <button
                    key={v.clau}
                    onClick={() => { setClasseVideoActiva(v.clau); setReproduintVideo(false); }}
                    className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                      classeVideoActiva === v.clau 
                        ? 'bg-[#02142d]/80 border-blue-900 text-[#FFDF00]' 
                        : 'bg-slate-950 border-white/5 text-slate-350 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] text-red-500 font-bold block">{v.t}</span>
                      <p className="text-[11px] text-slate-400 leading-normal font-semibold italic">{v.dsc}</p>
                    </div>
                    <span className="text-[9.5px] font-mono text-slate-500 shrink-0 bg-black/45 px-2 py-1 rounded ml-3">
                      ⏳ {v.durada}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* A.4. CLASSES EN DIRECTE */}
        {seccioActiva === 'teorica_classes_directe' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-[#00f296] animate-ping shrink-0" />
              <h3 className="text-base font-black italic uppercase text-white">PROXIMS DIRECTES PROGRAMATS AL CALENDARI</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Tots els dimarts i dijous es fan connexions en directe interactives amb el nostre tutor psicòleg i sotsinspector per tal de resoldre en viu dubtes del temari o repassar psicotècnics d'última generació.
            </p>

            <div className="p-5 bg-slate-950/60 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1.5 text-left">
                <span className="text-[8.5px] bg-[#00f296]/15 text-[#00f296] font-bold px-2 py-0.5 rounded uppercase tracking-widest inline-block">
                  AQUEST DIJOUS APAGAT DE DUBTES
                </span>
                <h4 className="text-xs font-black italic text-white uppercase mt-1">Sessió de dubtes d'Història i dret penal (Àmbit C)</h4>
                <div className="flex gap-4 text-[10px] text-slate-400">
                  <span>📅 Dijous, 04 de Juny</span>
                  <span>⏳ 19:30 h (Durada: 90 min)</span>
                </div>
              </div>

              {/* Enllaç fictici actiu de connexió clònic síncron */}
              <button className="bg-[#00f296] hover:bg-[#00d783] active:scale-95 text-slate-950 font-black uppercase text-[10px] tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-950/25">
                ENTRAR A LA CLASSE (DE MOODLE)
              </button>
            </div>
          </div>
        )}

        {/* A.5. EXÀMENS OPOSIMOSSOS - SIMULADOR INTERACTIU EN DIRECTE EN ORDINADOR */}
        {seccioActiva === 'teorica_examens_oposimossos' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <h3 className="text-base font-black italic uppercase text-white">SIMULADOR INTERACTIU DE TEST CLOUD</h3>
            
            {!testEnCurs ? (
              <div className="space-y-5">
                <p className="text-xs text-slate-350 leading-relaxed">
                  Avalua el teu nivell directament a la pantalla del teu ordinador abans de la prova definitiva a l'ISPC de Mollet. Configura les mètriques d'exemple ara mateix.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Volum d'estudi de preguntes:</span>
                    <div className="flex gap-2">
                      {[15, 30, 50].map((num) => (
                        <button
                          key={num}
                          onClick={() => setQuantitatPreguntesTest(num)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            quantitatPreguntesTest === num 
                              ? 'bg-red-650 text-white' 
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          {num} Qs
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Rellotge regulador de minuts:</span>
                    <div className="flex gap-2">
                      {[15, 25, 45].map((ts) => (
                        <button
                          key={ts}
                          onClick={() => setTempsLimitTest(ts)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            tempsLimitTest === ts 
                              ? 'bg-red-650 text-white' 
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          {ts} Min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { setTestEnCurs(true); setTestFinalitzat(false); setRespostesUsuariTest({}); setTestsPreguntaActual(0); }}
                  className="w-full bg-[#FFDF00] hover:bg-yellow-500 text-slate-950 font-black italic uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all cursor-pointer text-xs text-center"
                >
                  🚀 LLANÇAR SIMULADOR EN VIU (A ORDINADOR)
                </button>
              </div>
            ) : (
              <div className="space-y-5 bg-slate-950/80 p-6 rounded-2xl border border-white/5">
                
                {/* Rellotge de dalt */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-[9.5px] text-[#00f296] font-bold uppercase tracking-wider">
                    TEST ACTIU DE L'ESTUDIANT • {quantitatPreguntesTest} PREGUNTES
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    <span>⏱️ {tempsLimitTest}:00 minuts restants</span>
                  </div>
                </div>

                {!testFinalitzat ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                        Pregunta {testsPreguntaActual + 1} de {preguntesSimulacreExemple.length} (Exemple)
                      </span>
                      <span className="text-[8px] bg-red-650 text-white px-2 py-0.5 rounded uppercase font-bold">
                        HISTÒRIC OFICIAL
                      </span>
                    </div>

                    <h4 className="text-xs font-black italic uppercase text-white leading-relaxed">
                      {preguntesSimulacreExemple[testsPreguntaActual].pregunta}
                    </h4>

                    {/* Respostes seleccionables */}
                    <div className="grid gap-2 pt-2">
                      {Object.entries(preguntesSimulacreExemple[testsPreguntaActual].opcions).map(([lletra, textOp]) => {
                        const seleccionada = respostesUsuariTest[testsPreguntaActual] === lletra;
                        return (
                          <button
                            key={lletra}
                            onClick={() => setRespostesUsuariTest(prev => ({ ...prev, [testsPreguntaActual]: lletra }))}
                            className={`w-full p-3.5 rounded-xl border text-left text-[11px] leading-relaxed transition-all cursor-pointer flex gap-3 font-semibold ${
                              seleccionada 
                                ? 'bg-blue-950/80 border-[#FFDF00] text-white' 
                                : 'bg-slate-900 border-white/5 text-slate-350 hover:bg-slate-850'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black italic mr-1 ${
                              seleccionada ? 'bg-[#FFDF00] text-slate-950' : 'bg-slate-950 text-slate-400'
                            }`}>{lletra}</span>
                            <span>{textOp}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Navegació entre preguntes del simulacre */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <button
                        onClick={() => setTestsPreguntaActual(prev => Math.max(0, prev - 1))}
                        disabled={testsPreguntaActual === 0}
                        className="text-[10px] font-black uppercase text-slate-400 disabled:opacity-35 cursor-pointer"
                      >
                        ◀ Anterior
                      </button>

                      {testsPreguntaActual < preguntesSimulacreExemple.length - 1 ? (
                        <button
                          onClick={() => setTestsPreguntaActual(prev => prev + 1)}
                          disabled={!respostesUsuariTest[testsPreguntaActual]}
                          className="text-[10px] font-black uppercase text-red-500 hover:underline disabled:opacity-35 cursor-pointer"
                        >
                          Següent pregunta ▶
                        </button>
                      ) : (
                        <button
                          onClick={() => setTestFinalitzat(true)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[10px] py-2 px-4 rounded-lg cursor-pointer transition-colors"
                        >
                          ✓ finalitzar simulacre
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // RESULTATS DEL TEST
                  <div className="text-center p-4 space-y-4">
                    <span className="text-[20px]">🎉</span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">SIMULACRE DE PROVA COMPLETAT!</h4>
                    
                    {/* Calcula respostes encertades d'exemple */}
                    <div className="bg-[#02142d]/80 border border-blue-900/10 rounded-2xl p-4 max-w-sm mx-auto text-left gap-1">
                      {preguntesSimulacreExemple.map((qp, i) => {
                        const resp = respostesUsuariTest[i];
                        const corre = resp === qp.correcta;
                        return (
                          <div key={i} className="text-[10px] border-b border-white/5 py-1.5 last:border-0">
                            <div className="flex justify-between font-bold">
                              <span className="text-white">Pregunta {i + 1}: Resposta {resp || 'no contestada'}</span>
                              <span className={corre ? 'text-emerald-400' : 'text-red-500'}>
                                {corre ? '✓ Correcta (+1.00)' : `✗ Incorrecta / Correcta: ${qp.correcta} (-0.33)`}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-400 italic font-semibold leading-relaxed mt-1">Retro: {qp.explicacio}</p>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setTestEnCurs(false)}
                      className="text-xs text-red-500 font-extrabold uppercase hover:underline cursor-pointer block mx-auto"
                    >
                      Tancar resultats i configurar un nou examen
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* A.6. EXÀMENS OFICIALS PASSATS */}
        {seccioActiva === 'teorica_examens_oficials' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <h3 className="text-base font-black italic uppercase text-white">HISTÒRIC D'EXÀMENS OFICIALS DEL DEPARTAMENT D'INTERIOR</h3>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Els millors aspirants a la força policial s'entrenen amb les plantilles i preguntes exactes elaborades per l'ISPC i Interior de la Generalitat dels darrers anys.
            </p>

            <div className="grid gap-3 pt-2">
              {[
                { any: 'Convocatòria 2024', t: "Prova Teòrica de Coneixements - Model A" , dsc: "Examen real d'accés a l'escala bàsica, publicat en el DOGC oficial, amb 30 preguntes sobre història, marc legal i constitucions." },
                { any: 'Convocatòria 2023', t: "Examen d'oposició de Mossos d’Esquadra - Model B", dsc: "Conté gran volum de preguntes sobre deontologia policial i Unió Europea." },
                { any: 'Convocatòria 2022', t: "Prova Oficial de Continguts i Repàs Comú", dsc: "Plantilla oficial de respostes per calcular possibles penalitzacions de preguntes dobles." }
              ].map((ex, i) => (
                <div key={i} className="bg-slate-950/70 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#00f296] font-mono font-bold block">{ex.any}</span>
                    <h4 className="text-xs font-black italic uppercase text-white">{ex.t}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold italic leading-relaxed">{ex.dsc}</p>
                  </div>
                  <button className="bg-[#00274d] hover:bg-[#00386e] text-[#FFDF00] border border-blue-900/40 text-[9.5px] font-black uppercase tracking-wider py-2.5 px-4 rounded-lg cursor-pointer transition-all">
                    DESCARREGAR PDF & PLANTILLA
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* A.7. EXAMEN PSICOTÈCNIC DISPOSAT EN FORMAT D'APRENENTATGE D'ALT RENDIMENT */}
        {seccioActiva === 'teorica_psicotecnics' && (() => {
          // Explicació per a no-programadors: Aquest bloc sencer agafa el tipus de psicotècnic seleccionat 
          // a la barra lateral i pinta la seva teoria, una pregunta real de l'oposició i dona feedback actiu al triar opció.
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
              opcions: ["En Josep és comandament de forma obligatòria", "En Josep vesteix d'etiqueta, però no té per què ser comandament", "En Josep no és comandament", "La premissa conté una incoherència total"],
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

          const dades = llistatPsico[psicotecnicActiu] || llistatPsico["Sèries Aritmètiques"];

          return (
            <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-950 pb-4">
                <div>
                  <span className="text-[9px] text-teal-400 font-extrabold uppercase tracking-widest block">ENTRENAMENT DE L'ORDINADOR</span>
                  <h3 className="text-base font-black italic uppercase text-[#FFDF00] mt-1">PSICOTÈCNIC: {psicotecnicActiu}</h3>
                </div>
                <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                  PROVA INDIVIDUAL
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
                    <p className="text-[10.5px] text-slate-300 font-medium leading-relaxed leading-relaxed">
                      {dades.explicacio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* A.8. ACTUALITAT VIGENT DEL DOGC */}
        {seccioActiva === 'teorica_actualitat' && (() => {
          // Explicació per a no-programadors: Pinta dinàmicament la notícia de l'esquerra sota control d'alta fidelitat de dades.
          const llistatActualitat: Record<string, { titol: string, detall: string, data: string, consell: string }> = {
            "Última setmana": {
              titol: "DARRERS BUTLLETINS DE REESTRUCTURACIÓ ACORDADA (DOGC)",
              detall: "S'han definit les noves directrius i competències de ciberseguretat interna i cooperació de Mossos amb policies locals per l'any en curs, juntament amb protocols d'atenció primària unificada en matèria d'assistència policial.",
              data: "Fa pocs dies al DOGC oficial",
              consell: "Atenció: Les qüestions organizatives d'Interior són altament demanades pel departament als exàmens teòrics."
            },
            "Notícies de l'any": {
              titol: "RESUMS I REFORMES DEL CODI DEONTOLÒGIC ESPANYOL I CATALÀ",
              detall: "Recull complet de les adaptacions legislatives, de l'Estatut de Catalunya sobre els ports marítims policials i la transició completa de la regulació Tetra II de comunicacions unificades d'emergència.",
              data: "Resum actualitzat de tot l'any",
              consell: "Els canvis realitzats a l'inici d'any solen constituir precisament l'objectiu de 2-3 preguntes per a la repesca."
            },
            "Exàmens d'actualitat": {
              titol: "PROVA DE SIMULACIÓ DEL CONSELL PEDAGÒGIC ACORD DOGC",
              detall: "Examen interactiu clònic dissenyat expressament basat en el darrer volum de normatives del Govern. No repassis amb contingut obsolet d'anteriors anys, on molts aspirants fallen sense motiu!",
              data: "Proves generades durant aquest matí",
              consell: "Fins a un 10% dels aspirants no aconsegueixen l'aprovat per mantenir definicions caducades de lleis orgàniques reformades d'urgència."
            }
          };

          const dades = llistatActualitat[actualitatActiva] || llistatActualitat["Última setmana"];

          return (
            <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-950 pb-4">
                <div>
                  <span className="text-[9px] text-[#00f296] font-extrabold uppercase tracking-widest block font-mono">DADES ACTUALITZADES VIGENTS</span>
                  <h3 className="text-base font-black italic uppercase text-white mt-1">SITUACIÓ ACTUAL: {actualitatActiva}</h3>
                </div>
                <span className="text-[9.5px] text-slate-500 tracking-wider uppercase font-mono">{dades.data}</span>
              </div>

              <div className="space-y-4 pt-2">
                <div className="p-5 bg-slate-950/80 border border-white/5 rounded-2xl text-left space-y-2.5">
                  <span className="text-[10px] text-[#00f296] font-black block uppercase tracking-wider">
                    📢 {dades.titol}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {dades.detall}
                  </p>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-[9px] text-[#FFDF00] uppercase font-bold tracking-wider block">⚠️ ALERTA DE COMPILACIÓ DE TUTORIA:</span>
                  <p className="text-[10px] text-slate-205 italic mt-1 font-semibold leading-relaxed">
                    {dades.consell}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* A.9. LES 3 PROVES FÍSIQUES - AMB SUB-PANTALLES SEGONS PROVA ACTIVA (REGLA 1 I 3) */}
        {seccioActiva === 'fisica_proves' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-950 pb-4">
              <div>
                <span className="text-[9px] text-blue-400 font-extrabold uppercase tracking-widest block font-mono">2A FASE: PREPARACIÓ FÍSICA</span>
                <h3 className="text-base font-black italic uppercase text-white mt-1">PROVA ACTIVA: {fisicaProvaActiva}</h3>
              </div>
              <span className="text-[9.5px] bg-blue-500/10 text-blue-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                APTITUD FÍSICA
              </span>
            </div>

            {fisicaProvaActiva === 'Press de banca' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  Consisteix a realitzar el major nombre possible de repeticions de press de banca en un temps màxim de 45 segons. El pes s'ajusta de manera homogènia segons el sexe de l'aspirant.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-3">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">♂️ BAREMS HOMES (CÀRREGA: 40 KG)</span>
                    <ul className="text-xs text-slate-300 space-y-1.5 font-medium font-mono">
                      <li>• Menys de 3 repeticions: 0 punts</li>
                      <li>• 3 repeticions: 1 punt</li>
                      <li>• 15 repeticions: 5 punts</li>
                      <li>• 27 repeticions o més: 10 punts (Sobresortint)</li>
                    </ul>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-3">
                    <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">♀️ BAREMS DONES (CÀRREGA: 25 KG)</span>
                    <ul className="text-xs text-slate-300 space-y-1.5 font-medium font-mono">
                      <li>• Menys de 3 repeticions: 0 punts</li>
                      <li>• 3 repeticions: 1 punt</li>
                      <li>• 13 repeticions: 5 punts</li>
                      <li>• 23 repeticions o més: 10 punts (Sobresortint)</li>
                    </ul>
                  </div>
                </div>
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

        {/* A.10. DIETA DISPOSADA EN MODÈL INTEGRAL GRATIU I PREMIUM (REGLA 1 I 3) */}
        {seccioActiva === 'fisica_dieta' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-950 pb-4">
              <div>
                <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest block font-mono">ALIMENTACIÓ D'ALT RENDIMENT</span>
                <h3 className="text-base font-black italic uppercase text-white mt-1">PLANIFICACIÓ: {dietaActiva}</h3>
              </div>
              <span className="text-[9.5px] bg-amber-500/10 text-amber-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                NUTRICIÓ INTEGRAL
              </span>
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

        {/* A.11. CERCADOR DE GIMNASOS O REGISTRE (REGLA 1 I 3) */}
        {seccioActiva === 'fisica_gimnas' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-950 pb-4">
              <div>
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block font-mono">XARXA DE GIMNASOS COL·LABORADORS</span>
                <h3 className="text-base font-black italic uppercase text-white mt-1">SECCIÓ: {gimnasActiu}</h3>
              </div>
              <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                ENTRENAMENT LOCAL
              </span>
            </div>

            {gimnasActiu === 'Buscar gimnàs' ? (
              <div className="space-y-6 animate-in fade-in duration-150">
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  Entrena en un dels nostres pavellons o centres col·laboradors amb un circuit pintat de canvi de velocitat de forma homònima a la prova oficial.
                </p>

                {/* Filtre localització */}
                <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/5 max-w-sm">
                  {['totes', 'barcelona', 'girona', 'lleida', 'tarragona'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setLocalitatGimnasFiltre(loc)}
                      className={`flex-1 py-1.5 text-[9.5px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                        localitatGimnasFiltre === loc 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {loc.substring(0, 3)}
                    </button>
                  ))}
                </div>

                {/* Llista interactiva */}
                <div className="grid md:grid-cols-2 gap-4">
                  {gimnasosCatalunya
                    .filter(g => localitatGimnasFiltre === 'totes' || g.ciutat === localitatGimnasFiltre)
                    .map((g, idx) => (
                      <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9.5px] bg-[#00f296]/10 text-[#00f296] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            {g.ciutat}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono italic">{g.hores}</span>
                        </div>
                        <h5 className="text-xs font-black italic uppercase text-white">{g.nom}</h5>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-semibold italic">{g.dsc}</p>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-150 max-w-xl">
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  Ets propietari d’un gimnàs o coneixes un centre amb marques homologades de la Generalitat? Informa'ns d'aquest punt per poder-lo posar a l'abast dels alumnes d'OposiCAT.
                </p>

                {altaGimnasExitosa ? (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl space-y-2 animate-in zoom-in-95 duration-150">
                    <span className="text-sm">🎉</span>
                    <span className="text-[11px] font-black uppercase tracking-wider block">PROPUESTA ENVIADA CORRECTAMENT!</span>
                    <p className="text-[11px] font-semibold text-slate-200 italic leading-relaxed">
                      La informació del gimnàs <strong className="text-emerald-400">"{nomNouGimnas}"</strong> s'ha enviat correctament al cos de preparadors oficial d'OposiCAT. El validarem i s'afegirà a la llista d'esportistes un cop s'hagin revisat els barems físics de l'equip. Moltes gràcies pel teu ajut didàctic!
                    </p>
                    <button
                      onClick={() => {
                        setNomNouGimnas("");
                        setInstalNouGimnas("");
                        setAltaGimnasExitosa(false);
                      }}
                      className="text-[10px] text-[#00f296] hover:underline uppercase font-bold mt-2 font-mono cursor-pointer"
                    >
                      Demanar l'alta de un altre gimnàs
                    </button>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!nomNouGimnas.trim()) {
                        alert("S'ha d'introduir el nom del gimnàs de forma correcta.");
                        return;
                      }
                      setAltaGimnasExitosa(true);
                    }}
                    className="p-6 bg-slate-950 border border-white/5 rounded-2xl space-y-4 text-left"
                  >
                    <span className="text-[10px] text-[#FFDF00] font-black uppercase tracking-wider block border-b border-white/5 pb-2">
                      📝 SOL·LICITUD D'HOMOLOGACIÓ DIRECTA
                    </span>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Nom de la Instal·lació</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex. Gimnàs Olimpus de Sabadell"
                        value={nomNouGimnas}
                        onChange={(e) => setNomNouGimnas(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Ciutat de Catalunya</label>
                      <select
                        value={ciutatNouGimnas}
                        onChange={(e) => setCiutatNouGimnas(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                      >
                        <option value="barcelona">Barcelona</option>
                        <option value="girona">Girona</option>
                        <option value="lleida">Lleida</option>
                        <option value="tarragona">Tarragona</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">Equipaments disponibles (Ex. Pistes, tanques, fustes de press)</label>
                      <textarea
                        placeholder="Ex. Té un circuit de velocitat pintat a la sala polivalent i 3 bancs de press de banca professionals homologats de forma síncrona."
                        value={instalNouGimnas}
                        onChange={(e) => setInstalNouGimnas(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 px-3 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-500 font-semibold resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black uppercase text-[10px] py-3.5 rounded-xl transition-all cursor-pointer text-center"
                    >
                      SOLICITAR L'ALTA DE MANERA INMEDIATA
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* SECCIÓ C: LA PROVA PSICOLÒGICA EN INTEGRAL (REGLA 1 I 3 - L'ERA DE LEGO) */}
        {/* ----------------------------------------------------------------- */}

        {/* C.1. COMPETÈNCIES CLAU - APRÈN COM ES PUNTUA */}
        {seccioActiva === 'psico_competencies' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-950 pb-4">
              <div>
                <span className="text-[9px] text-[#FFDF00] font-extrabold uppercase tracking-widest block font-mono">3A FASE: REQUISITS PSICOLÒGICS</span>
                <h3 className="text-base font-black italic uppercase text-white mt-1">COMPETÈNCIES CLAU</h3>
              </div>
              <span className="text-[9.5px] bg-purple-500/10 text-purple-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                PUNTUACIÓ OFICIAL
              </span>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              El Cos de Mossos d'Esquadra avalua i puntua un conjunt de competències clau per dictaminar si el perfil de l'aspirant s'acobla a la proximitat de servei, la integració social i el manteniment respectuós de la llei civil.
            </p>

            <div className="bg-slate-950 p-6 rounded-2xl border border-blue-900/10 space-y-4">
              <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block border-b border-white/5 pb-2">📋 BAREM COMPETENCIAL DEL MÒDUL</span>
              <div className="space-y-3 pt-1">
                <div className="p-4 bg-slate-900/50 rounded-xl space-y-1">
                  <span className="text-xs font-black text-white">1. COMPROMÍS AMB EL SERVEI I INTEGRITAT (Fins a 3 punts)</span>
                  <p className="text-[11.5px] text-slate-400 font-medium leading-relaxed">Puntua l'orientació sincera d'ajuda cap a la ciutadania catalana, la veracitat deontològica de caràcter i la protecció de la convivència pacífica.</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl space-y-1">
                  <span className="text-xs font-black text-white">2. GESTIÓ DE L'ESTRÈS I AUTOCONTROL (Fins a 3 punts)</span>
                  <p className="text-[11.5px] text-slate-400 font-medium leading-relaxed">Mesura l'aptitud mental per mantindre un criteri fred, l'equilibri i la paraula tranquil·la davant d'estímuls nocius, provocacions o conflictes al carrer.</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl space-y-1">
                  <span className="text-xs font-black text-white">3. COMUNICACIÓ, TREBALL EN EQUIP I JERARQUIA (Fins a 4 punts)</span>
                  <p className="text-[11.5px] text-slate-400 font-medium leading-relaxed">Sumes punts en mostrar assertivitat en binomis, empatia en l'atenció ciutadana i plena disciplina d'obediència dels reglaments interns de l'acadèmia.</p>
                </div>
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <span className="text-[9px] text-[#FFDF00] uppercase font-bold tracking-wider block">💡 CONSELL DIDÀCTIC DEL PROGRAMA D'ALT RENDIMENT:</span>
                <p className="text-[10.5px] text-slate-205 italic mt-1 font-semibold leading-relaxed">
                  Durant el test de biodata i l'entrevista oral, busca ser completament coherent. El tribunal utilitza mecanismes de control creuat per invalidar perfils que mostren respostes sobre-estudiades o poc realistes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* C.2. PROVES DE BIODATA AMB SUB-PANTALLES (TEST, PERSONALS, LABORALS, PGME) */}
        {seccioActiva === 'psico_biodata' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-950 pb-4">
              <div>
                <span className="text-[9px] text-[#FFDF00] font-extrabold uppercase tracking-widest block font-mono">3A FASE: BIODATA</span>
                <h3 className="text-base font-black italic uppercase text-white mt-1">SECCIÓ: {psicoSubSeccioActiva}</h3>
              </div>
              <span className="text-[9.5px] bg-[#00f296]/10 text-[#00f296] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                BIODATA MOSSOS
              </span>
            </div>

            {/* Sub-pantalla 1: test biodata */}
            {psicoSubSeccioActiva === 'test biodata' && (
              <div className="space-y-6">
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  Aquest diagnòstic competencial mesura el perfil general segons dades de treball recollides. Les mètriques mostren les qualitats potencials de l'opositor en base síncrona.
                </p>

                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-base shrink-0">⚠️</span>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider block">
                      INFORME DE MÒSTRES ORIENTATIVES
                    </span>
                    <p className="text-[11px] font-semibold text-slate-200 leading-relaxed italic">
                      Estàs visualitzant l'estat d'avaluació d'un test simulador. Acompleix els qüestionaris següents de l'acadèmia per augmentar la flexibilitat didàctica de dret.
                    </p>
                  </div>
                </div>

                {/* Mètriques */}
                <div className="flex flex-col gap-3 max-w-md">
                  {[
                    { nom: "Adaptabilitat en pistes i situació de perill", nota: 8, color: "text-emerald-400", bar: "bg-emerald-400" },
                    { nom: "Autocontrol sota pressió policial", nota: 6, color: "text-yellow-450", bar: "bg-yellow-400" },
                    { nom: "Treball en equip organitzat", nota: 9, color: "text-emerald-400", bar: "bg-emerald-400" },
                    { nom: "Habilitats de comunicació i dret deontològic", nota: 7, color: "text-emerald-400", bar: "bg-emerald-400" }
                  ].map((c, i) => (
                    <div key={i} className="bg-slate-950 p-4 border border-white/5 rounded-2xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10.5px] font-extrabold text-white italic">{c.nom}</span>
                        <div className="flex items-baseline gap-0.5 text-xs font-mono font-black">
                          <span className={c.color}>{c.nota}</span>
                          <span className="text-slate-500 text-[10px]">/10</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${c.nota * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-pantalla 2: preguntes personals */}
            {psicoSubSeccioActiva === 'preguntes personals' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  Tenen com a finalitat conèixer el teu reflex d'integritat, l'equilibri de l'opositor fora de servei, la vida llar i la capacitat sincera d'acceptar els teus defectes i virtuts davant del tribunal policial.
                </p>
                <div className="space-y-3">
                  <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-purple-400 font-bold block uppercase font-mono">📋 PREGUNTA VALORADA:</span>
                    <p className="text-xs text-slate-300 font-semibold italic leading-relaxed">"Expliqueu algun error personal important realitzat en el passat i quina conducta vau rectificar."</p>
                    <p className="text-[10.5px] text-slate-400 pt-2 leading-relaxed leading-relaxed">
                      <strong>Recomanació d'OposiCAT:</strong> Sigueu sincer, però no alarmista. Mostreu maduresa en acceptar la responsabilitat plena de l'error i detalleu ràpidament de quina manera el vau canviar positicament.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-purple-400 font-bold block uppercase font-mono">📋 CONCEPCIÓ DE L'OPOSICIÓ:</span>
                    <p className="text-xs text-slate-300 font-semibold italic leading-relaxed">"Per què creieu que esteu preparat mentalment per a assumir l'ús controlat de la força quan sigui requerit?"</p>
                    <p className="text-[10.5px] text-slate-400 pt-2 leading-relaxed">
                      <strong>Recomanació d'OposiCAT:</strong> Emfatitzeu la serenitat, el respecte deontològic als protocols interns establerts pel dret civil i la proporcionalitat sota supervisió.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-pantalla 3: preguntes laborals */}
            {psicoSubSeccioActiva === 'preguntes laborals' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  S'analitzen els antecedents professionals, com gestiones canvis ràpids d'equip, tasques d'alta intensitat didàctica i lideratge de dret en el dia a dia de forma homogènia.
                </p>
                <div className="space-y-3">
                  <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-blue-400 font-bold block uppercase font-mono">💼 DISCIPLINA I LIDERATGE:</span>
                    <p className="text-xs text-slate-300 font-semibold italic leading-relaxed">"Heu pres mai una decisió d'alta transcendència a la vostra feina sense aval de caps?"</p>
                    <p className="text-[10.5px] text-slate-400 pt-2 leading-relaxed">
                      <strong>Criteri d'aula acadèmica:</strong> Remarqueu que en serveis estructurats (igual que Mossos) les decisions sempre es prenen acatant la línia de comandament directa legal, excepte en urgències d'extrema gravetat sota reglament nacional.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-blue-400 font-bold block uppercase font-mono">💼 GESTIÓ D'EQUIP EN CRISI:</span>
                    <p className="text-xs text-slate-300 font-semibold italic leading-relaxed">"Com reaccioneu si un subordinat directe es nega repetidament a fer una tasca d'emergència?"</p>
                    <p className="text-[10.5px] text-slate-400 pt-2 leading-relaxed">
                      <strong>Criteri d'aula acadèmica:</strong> Expliqueu l'ús de la paraula ferma d'autoritat i seguretat de proximitat, seguit de l'informe pertinent sota conductes reglamentades.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-pantalla 4: preguntes PGME */}
            {psicoSubSeccioActiva === 'preguntes PGME' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  Aquesta àrea mesura l'encaix amb la "Policia de la Generalitat - Mossos d'Esquadra" (PGME) en matèria d'obediència de dret, valors de país, i de quina manera et comportes davant d'estaments d'autoritat catalana.
                </p>
                <div className="space-y-3">
                  <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-pink-400 font-bold block uppercase font-mono">⚖️ REGLES I JURAMENT D'OBEDIÈNCIA:</span>
                    <p className="text-xs text-slate-300 font-semibold italic leading-relaxed">"Quina seria la teva opció si estàs patrullant en un binomi i el teu company comet un intent de suborn?"</p>
                    <p className="text-[10.5px] text-slate-400 pt-2 leading-relaxed">
                      <strong>Educació d'assaig:</strong> El deure ètic i legal de la PGME està per sobre dels vincles de companyonia. Com a mosso d'esquadra, has de notificar de manera síncrona i formal la infracció als òrgans superiors disciplinaris.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-pink-400 font-bold block uppercase font-mono">🚓 VOCACIÓ DE COST A COMISSARIA:</span>
                    <p className="text-xs text-slate-300 font-semibold italic leading-relaxed">"Què esteu disposat a sacrificar en la vostra vida de llar pel servei diari de la seguretat ciutadana dels Mossos?"</p>
                    <p className="text-[10.5px] text-slate-400 pt-2 leading-relaxed">
                      <strong>Educació d'assaig:</strong> Argumenteu la vostra capacitat d'adaptació en canvis de guàrdia ràpids, torns de nit o emergències nacionals, un deure clau del jurament policial.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* C.3. PRÀCTICA DE L'ENTREVISTA */}
        {seccioActiva === 'psico_entrevista' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-950 pb-4">
              <div>
                <span className="text-[9px] text-[#FFDF00] font-extrabold uppercase tracking-widest block font-mono">3A FASE: PREPARACIÓ PSICOLÒGICA ORAL</span>
                <h3 className="text-base font-black italic uppercase text-white mt-1">PRACTICAR L'ENTREVISTA</h3>
              </div>
              <span className="text-[9.5px] bg-[#00f296]/10 text-[#00f296] font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                ACADÈMIA MOSSOS
              </span>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Els nostres experts de l'escola de repàs d'alt rendiment d'OposiCAT han seleccionat les categories i preguntes d'anys anteriors a l'acadèmia ISPC per tal de preparar defenses de qualitat.
            </p>

            {/* Selector de dades de categoria de preguntes d'entrevista */}
            <div className="grid md:grid-cols-4 gap-2 border-b border-white/5 pb-4">
              {[
                { t: "MOTIVACIONS INICIALS", dsc: "Valors i causes" },
                { t: "ESTUDIS/FORMACIÓ", dsc: "Bagatge formal" },
                { t: "EXPERIÈNCIA LABORAL", dsc: "Històric d'equips" },
                { t: "PREGUNTES PERSONALS", dsc: "Defectes i virtuts" }
              ].map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setCategoriaEntrevistaActiva(idx)}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col gap-1 items-center justify-center ${
                    categoriaEntrevistaActiva === idx 
                      ? 'bg-blue-950/80 border-[#FFDF00] text-[#FFDF00]' 
                      : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-[9.5px] font-black tracking-wider leading-none">{c.t}</span>
                  <span className="text-[8px] opacity-70 leading-normal">{c.dsc}</span>
                </button>
              ))}
            </div>

            {/* Contingut Interactiu segons categoria d'entrevista */}
            <div className="space-y-4 pt-1">
              {categoriaEntrevistaActiva === 0 && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[9px] text-[#00f296] font-black uppercase">🗣️ PREGUNTA 1: PER QUÈ VOLS SER MOSSO D'ESQUADRA?</span>
                  <p className="text-xs font-black text-white leading-relaxed">
                    "Quina és la teva motivació principal per ser Mosso d'Esquadra de Catalunya? Quins són els valors claus d'un policia d'escala bàsica sota sots-direcció?"
                  </p>
                  <div className="h-[1.5px] bg-[#00f296]/15 my-2 w-12" />
                  <p className="text-[10.5px] text-slate-350 leading-relaxed italic">
                    <strong>Defensa recomanada:</strong> Esmenta el compromís profund de servei públic amb la ciutadania de Catalunya, la recerca de seguretat ciutadana sota directrius jeràrquiques i l'alineació estricta amb el Codi Deontològic.
                  </p>
                </div>
              )}

              {categoriaEntrevistaActiva === 1 && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[9px] text-[#00f296] font-black uppercase">🧠 PREGUNTA 2: ENCAIX DEL BAGATGE EDUCACIONAL</span>
                  <p className="text-xs font-black text-white leading-relaxed">
                    "Creus que el teu bagatge educatiu i de formació formal o universitària encaixa amb els camps que treballa la policia de proximitat o de dret?"
                  </p>
                  <div className="h-[1.5px] bg-[#00f296]/15 my-2 w-12" />
                  <p className="text-[10.5px] text-slate-350 leading-relaxed italic">
                    <strong>Defensa recomanada:</strong> Vincula l'apreciació acadèmica o habilitats organitzatives adquirides directament amb la capacitat d'aprenentatge a l'ISPC i manteniment de l'ordre d'Estat civil sota normatives constitucionals.
                  </p>
                </div>
              )}

              {categoriaEntrevistaActiva === 2 && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[9px] text-[#00f296] font-black uppercase">💼 PREGUNTA 3: SITUACIÓ DE CONFLICTE LABORAL</span>
                  <p className="text-xs font-black text-white leading-relaxed">
                    "Explica alguna situació laboral o de servei anterior en la que vas haver de gestionar un conflicte directe en equip de treball o clients."
                  </p>
                  <div className="h-[1.5px] bg-[#00f296]/15 my-2 w-12" />
                  <p className="text-[10.5px] text-slate-350 leading-relaxed italic">
                    <strong>Defensa recomanada:</strong> Accentua l'escolta activa de les dues parts, l'assertivitat en l'actuació de dret de pau i el respecte absolut cap a les conclusions conjuntes del gestor del grup.
                  </p>
                </div>
              )}

              {categoriaEntrevistaActiva === 3 && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[9px] text-[#00f296] font-black uppercase">👤 PREGUNTA 4: DEFECTES I VIRTUTS DE L'OPOSITOR</span>
                  <p className="text-xs font-black text-white leading-relaxed">
                    "Digues tres defectes i tres virtuts de la teva personalitat relacionades amb el servei públic, coordinació i jerarquia."
                  </p>
                  <div className="h-[1.5px] bg-[#00f296]/15 my-2 w-12" />
                  <p className="text-[10.5px] text-slate-350 leading-relaxed italic">
                    <strong>Defensa recomanada:</strong> Menciona virtuts com la disciplina, la puntualitat extrema i la capacitat activa de treball en equip sota crisis. Com a defectes, utilitza trets sans i controlables (ex: excés d'autoexigència tècnica, que compenses planificant millor).
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* C.4. DEMANAR CITA AMB PSICÒLEGS DE L'EQUIP */}
        {seccioActiva === 'psico_cita' && (
          <div className="bg-[#02142d]/30 border border-[#062040]/30 p-8 rounded-3xl space-y-6 animate-in fade-in duration-200 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-950 pb-4">
              <div>
                <span className="text-[9px] text-[#FFDF00] font-extrabold uppercase tracking-widest block font-mono">3A FASE: SIMULACRES EXCLUSIUS</span>
                <h3 className="text-base font-black italic uppercase text-white mt-1">RESERVA DE CITA INDIVIDUAL</h3>
              </div>
              <span className="text-[9.5px] bg-amber-500/10 text-amber-450 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                SIMULACRE 1 ALUMNE
              </span>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Reserva una convocatòria de simulacre individual en línia amb un psicòleg professional que t'ajudarà de forma síncrona a repassar el teu perfil d'opositor per anar totalment segur.
            </p>

            {!citaReservadaCorrectament ? (
              <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex gap-4 justify-between text-[11px] border-b border-white/5 pb-2">
                  <div className="flex flex-col">
                    <span className="text-slate-500 font-bold block uppercase tracking-wider">DIA TRIAT</span>
                    <span className="text-white font-extrabold italic">DIVENDRES, 12 DE JUNY</span>
                  </div>
                  <span className="text-[#00f296] font-extrabold block">LLOC DISPONIBLE EN CAMPUS DE MOODLE</span>
                </div>

                {/* Torn de matí o tarda */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <button
                    onClick={() => setCitaTornTriat('mati')}
                    className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      citaTornTriat === 'mati' 
                        ? 'bg-[#00f296] text-slate-950 font-black' 
                        : 'bg-slate-900 text-slate-400 border border-white/5'
                    }`}
                  >
                    MATÍ
                  </button>
                  <button
                    onClick={() => setCitaTornTriat('tarda')}
                    className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      citaTornTriat === 'tarda' 
                        ? 'bg-[#00f296] text-slate-950 font-black' 
                        : 'bg-slate-900 text-slate-400 border border-white/5'
                    }`}
                  >
                    TARDA
                  </button>
                </div>

                {/* Hores disponibles */}
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {(citaTornTriat === 'mati' ? ['09:00', '10:00', '11:00', '12:00', '13:00'] : ['16:00', '17:00', '18:00', '19:00', '20:00']).map((hora) => (
                    <button
                      key={hora}
                      onClick={() => setCitaHoraTriada(hora)}
                      className={`py-2 rounded-xl text-[10px] font-mono leading-none flex items-center justify-center border transition-all cursor-pointer ${
                        citaHoraTriada === hora 
                          ? 'bg-[#00f296]/20 border-[#00f296] text-[#00f296] font-black' 
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      {hora}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCitaReservadaCorrectament(true)}
                  className="w-full bg-[#00f296] hover:bg-[#00d783] active:scale-95 text-slate-950 font-black uppercase text-xsTracking text-center py-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-950/30"
                >
                  RESERVAR LA MEVA SESSIÓ DE SIMULACRE ARA
                </button>
              </div>
            ) : (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/25 text-center rounded-2xl space-y-3 max-w-md mx-auto">
                <p className="text-xs text-emerald-400 font-extrabold uppercase italic tracking-wider">
                  ✓ ASSAIG D'ENTREVISTA PROGRAMAT CORRECTAMENT!
                </p>
                <p className="text-[10.5px] text-slate-300 font-medium">
                  Hem adjudicat la cita el proper <strong className="text-white">Divendres 12 de Juny a les {citaHoraTriada}h ({citaTornTriat === 'mati' ? 'Matí' : 'Tarda'})</strong>. Rebràs un enllaç de connexió exclusiu de Zoom al teu correu electrònic oficial una hora abans del simulacre.
                </p>
                <button
                  onClick={() => setCitaReservadaCorrectament(false)}
                  className="text-[9px] text-[#00f296] font-black uppercase tracking-wider hover:underline block mx-auto pt-2 cursor-pointer"
                >
                  Modificar la cita reservada
                </button>
              </div>
            )}
          </div>
        )}

      </div>
      </main>
    </div>
  </div>
  );
}
