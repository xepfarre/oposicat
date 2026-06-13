import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Bell, X, Check, BellRing, Settings, ShieldAlert, KeyRound, Smartphone, Tablet, Trophy, Clock, ClipboardList, Dumbbell, Apple, Users, Flame, ChevronRight, Award, Medal, Star, Sparkles, MessageSquare, Send, MessageCircle, PlusCircle, Hash, User, Home } from "lucide-react";
import { auth, db, obtenirMissatgeria } from "../../lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getToken } from "firebase/messaging";

/**
 * PANTALLA: OposiMossosInici
 * Pantalla principal de la secció de Mossos d'Esquadra adaptada per a smartphone.
 * Ara inclou el sistema de notificacions instantànies en calent des de la base de dades Firestore.
 * A més, afegeix suport per a l'activació de permisos corporatius de notificacions del sistema de tota la vida (PWA).
 * Ubicació: /src/pantalles/oposimossos/oposi_mossos_inici.tsx
 */
export default function OposiMossosInici({ 
  onTornar, 
  onProvaTeorica,
  onProvaPractica,
  onProvaPsicologica,
  onLaMevaOposicio,
  inicialSeccio = 'home',
  onCanviarSeccio
}: { 
  onTornar: () => void, 
  onProvaTeorica: () => void,
  onProvaPractica?: () => void,
  onProvaPsicologica?: () => void,
  onLaMevaOposicio: () => void,
  inicialSeccio?: 'home' | 'forum' | 'noticies' | 'perfil',
  onCanviarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void
}) {

  // Explicació per a no-programadors: Estats de control per saber si canvia l'usuari identificat o si encara s'està verificant la sessió a Firebase, evitant així llançar consultes sense permís.
  const [authCarregada, setAuthCarregada] = useState<boolean>(false);
  const [usuariActiu, setUsuariActiu] = useState<any>(null);

  // Explicació per a no-programadors: Estats per gestionar si s'ha d'obrir la pantalla integrada de Rankings d'OposiCAT i quina taula o categoria de classificació estem consultant.
  const [mostrarRankings, setMostrarRankings] = useState<boolean>(false);
  const [rankingSeleccionatId, setRankingSeleccionatId] = useState<string | null>(null);

  // Explicació per a no-programadors: Estats de control per al xat associat al rànquing per fomentar la diversió, motivació i competició sana amb comentaris divertits de 5 mossos simulats.
  const [mostrarChat, setMostrarChat] = useState<boolean>(false);
  const [mostrarPremis, setMostrarPremis] = useState<boolean>(false);
  const [nouMissatgeText, setNouMissatgeText] = useState<string>("");
  const [missatgesChat, setMissatgesChat] = useState<any[]>([
    { id: 1, nom: "Jordi Muñoz", text: "Ei! T'he superat a la prova de testos! He fet 14 exàmens avui! 💪🏻👮‍♂️", hora: "15:42", color: "text-blue-300 bg-blue-500/10 border-blue-500/20" },
    { id: 2, nom: "Laura Vilanova", text: "Mare meva Jordi, no dorms o què? Després t'enxampo segur, avui repasso l'Àmbit C i et desbanco! Hahaha 🚀", hora: "15:45", color: "text-pink-300 bg-pink-500/10 border-pink-500/20" },
    { id: 3, nom: "Marc Soler", text: "Vigileu que estic escalfant motors a la navette del rànquing físic... Crec que us passaré a tots per sobre ben aviat 🏃‍♂️💨!", hora: "16:01", color: "text-purple-300 bg-purple-500/10 border-purple-500/20" },
    { id: 4, nom: "Sílvia Garcia", text: "Sí, Marc, ja veurem! Jo compleixo la dieta al 100%, la meva disciplina d'estudi és d'acer mossos! 😉", hora: "16:15", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
    { id: 5, nom: "Anna Prat", text: "Ostres nois, quin ritme de testos controleu! Jo vaig de camí al ràtio perfecte d'actualitat, tremoleu! 🔥📚", hora: "16:30", color: "text-amber-300 bg-amber-500/10 border-amber-500/20" }
  ]);

  // Explicació per a no-programadors: Controlador per saber si l'alumne ja ha permès rebre notificacions emergents del mòbil (granted, denied o default)
  const [permisNotificacio, setPermisNotificacio] = useState<string>(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  });

  // Guardem una referència per saber si és la primera vegada que es carrega l'snapshot i evitar bombardejar l'usuari amb alertes antigues
  const esPrimeraCarrega = useRef(true);

  // Explicació per a no-programadors: Guardem a la memòria permanent del telèfon mòbil (localStorage) els identificadors (IDs) de les notificacions ja llegides per l'alumne.
  const [notificacionsLlegidesIds, setNotificacionsLlegidesIds] = useState<string[]>(() => {
    try {
      const deLocalStorage = localStorage.getItem("oposicat_notificacions_llegides");
      return deLocalStorage ? JSON.parse(deLocalStorage) : [];
    } catch {
      return [];
    }
  });

  // Explicació per a no-programadors: Llista dinàmica de notificacions oficials publicades per l'administrador d'OposiCAT en temps real des de Firestore.
  const [notificacions, setNotificacions] = useState<any[]>([]);

  // Explicació per a no-programadors: Estat d'obertura del diàleg flotant (modal) que mostra el llistat complet de notificacions oficials amb importància detallada per a l'alumne.
  const [modalNotificacionsObert, setModalNotificacionsObert] = useState<boolean>(inicialSeccio === 'noticies');

  const [tokenFCMInput, setTokenFCMInput] = useState<string>("");
  const [guardantToken, setGuardantToken] = useState<boolean>(false);
  
  // Explicació per a no-programadors: Estats del nou sistema simplificat automàtic d'un sol clic per evitar que l'estudiant vegi formularis complexos.
  const [activantAvisosUnic, setActivantAvisosUnic] = useState<boolean>(false);

  // Escolta l'event natiu de descàrrega d'aplicacions PWA a Android/Chrome
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any>(null);
  const [modalConsellsInstalacioObert, setModalConsellsInstalacioObert] = useState<boolean>(false);
  const [pestanyaDispositiu, setPestanyaDispositiu] = useState<"chrome" | "firefox" | "ios" | "hermit" | "apk">("chrome");

  // Explicació per a no-programadors: Estats de control per al Fòrum d'estudiants opositors de Mossos.
  const [modalForumObert, setModalForumObert] = useState<boolean>(inicialSeccio === 'forum');
  const [forumChatroomId, setForumChatroomId] = useState<string | null>(null); // per saber quin canal o xat concret del fòrum estem veient
  const [forumPersonalitzatNom, setForumPersonalitzatNom] = useState<string>("");
  const [forumPersonalitzatDesc, setForumPersonalitzatDesc] = useState<string>("");
  const [forumsCreats, setForumsCreats] = useState<{nom: string, desc: string}[]>([]);
  const [mostrarCreacioForum, setMostrarCreacioForum] = useState<boolean>(false);
  const [nouMissatgeForumText, setNouMissatgeForumText] = useState<string>("");

  // Explicació per a no-programadors: Estat d'obertura del modal per a la personalització gamificada de l'avatar de l'opositor.
  const [modalAvatarObert, setModalAvatarObert] = useState<boolean>(inicialSeccio === 'perfil');

  // Explicació per a no-programadors: Sincronitzador per actualitzar la visualització immediata de la secció quan el pare canvia la prop inicialSeccio (per exemple, si s'hi navega des de la Prova Teòrica).
  useEffect(() => {
    setModalForumObert(inicialSeccio === 'forum');
    setModalNotificacionsObert(inicialSeccio === 'noticies');
    setModalAvatarObert(inicialSeccio === 'perfil');
    if (inicialSeccio === 'home') {
      setMostrarRankings(false);
    }
  }, [inicialSeccio]);
  // Explicació per a no-programadors: Estat per controlar si es mostra el popup que demana a l'estudiant si vol realment sortir al selector d'apps en prémer el botó d'Inici repetidament.
  const [popupTornarSelectorObert, setPopupTornarSelectorObert] = useState<boolean>(false);
  // Explicació per a no-programadors: Estat per controlar si es mostra el formulari didàctic de com instal·lar la PWA en mòbils iOS o Android
  const [modalInstallarObert, setModalInstallarObert] = useState<boolean>(false);
  // Explicació per a no-programadors: Estat per discernir si l'estudiant té un mòbil Apple (iOS) o Android a les instruccions
  const [pestanyaInstallacio, setPestanyaInstallacio] = useState<'ios' | 'android'>('ios');
  const [avatarEstil, setAvatarEstil] = useState<string>(() => localStorage.getItem("avatar_estil") || "👮‍♂️"); // Cara base: Mosso / Mossa
  const [avatarGorra, setAvatarGorra] = useState<string>(() => localStorage.getItem("avatar_gorra") || "🧢"); // Gorra de servei / Galea / Altres
  const [avatarFons, setAvatarFons] = useState<string>(() => localStorage.getItem("avatar_fons") || "bg-gradient-to-br from-blue-900 to-slate-900"); // Color de fons de la tarja
  const [avatarAccessori, setAvatarAccessori] = useState<string>(() => localStorage.getItem("avatar_accessori") || "📢"); // Megàfon / Xiulet / Cafè / Ulleres
  const [avatarUniforme, setAvatarUniforme] = useState<string>(() => localStorage.getItem("avatar_uniforme") || "👔"); // Uniforme / Gala / Esports / Armilla
  const [avatarFonsNom, setAvatarFonsNom] = useState<string>(() => localStorage.getItem("avatar_fons_nom") || "Blau OposiCAT");

  // Escolta l'event natiu de descàrrega d'aplicacions PWA a Android/Chrome
  const [missatgesPorCanal, setMissatgesPorCanal] = useState<Record<string, any[]>>({
    "Xat general": [
      { id: 101, nom: "Gerard Font", text: "Hola mossos! Com porteu l'estudi? Es fa dura la recta final però valdrà la pena! 👮‍♀️✨", hora: "12:15" },
      { id: 102, nom: "Mireia Puig", text: "Super recolzada pel fòrum! Algú sap on compren les millors sabates per a la prova física?", hora: "12:44" },
      { id: 103, nom: "Toni Camps", text: "Jo vaig agafar unes asics a decathlon, genials per als girs i la navette! No rellisquen gens. 🏃‍♂️💨", hora: "13:01" }
    ],
    "Xat prova teòrica": [
      { id: 201, nom: "Sònia Homs", text: "Heu vist les últimes modificacions d'actualitat constitucional? Quin lio amb els terminis del títol primer! 📚👮‍♀️", hora: "14:10" },
      { id: 202, nom: "Ramon Cases", text: "Sònia, sí! Recomano fortament el Tema 1.3, està súper ben sintetitzat i resol el dubte!", hora: "14:22" },
      { id: 203, nom: "Carles Grau", text: "Demà de bon matí faré un simulation-test de 30 preguntes de l'Àmbit A! A tope!", hora: "14:55" }
    ],
    "Xat prova física": [
      { id: 301, nom: "Sílvia Lopez", text: "Com feu per millorar els temps al circuit d'agilitat? Se'm resisteix el salt de plint... 🤸‍♀️", hora: "10:30" },
      { id: 302, nom: "David Prat", text: "Sílvia, és tot tècnica i recolzar bé el centre de gravetat. Practica la caiguda i el pivot!", hora: "10:45" }
    ],
    "Xat prova psicològica": [
      { id: 401, nom: "Marta Solanes", text: "Consells pels tests de personalitat de Mossos? Tinc por de contradir-me en les preguntes creuades. 🧠⏱️", hora: "16:03" },
      { id: 402, nom: "Àngel Coll", text: "El millor consell és sinceritat i no voler donar perfil perfecte mentint, que ho detecten al moment. Tranquil·litat total!", hora: "16:15" }
    ],
    "Estudiem junts": [
      { id: 501, nom: "Laia Solé", text: "Demà quedem al matí a la biblioteca de Vic? Sala d'estudi grupal reservada a partir de les 09:00! 🤓📖", hora: "17:11" },
      { id: 502, nom: "Bernat Pujol", text: "Laia, em sumo! Portaré cafè i moltes ganes de preguntar-vos dubtes de l'Estatut d'Autonomia!", hora: "17:30" }
    ],
    "Entrenem junts": [
      { id: 601, nom: "Oriol Roca", text: "Algú vol anar a fer navette i agilitat demà a les pistes de Sabadell? He agafat conus de mida oficial! 🏃‍♂️⚡", hora: "18:02" },
      { id: 602, nom: "Sandra Mas", text: "Jo vinc segur Oriol! Em va fantàstic mesurar el ritme amb un outro opo. A quina hora quedem?", hora: "18:20" }
    ]
  });

  // Auto-detectem de fons si la tauleta de l'opositor és Apple, Firefox o Android Chrome
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setPestanyaDispositiu("ios");
      } else if (/firefox|fennec/.test(userAgent)) {
        setPestanyaDispositiu("firefox");
      } else {
        setPestanyaDispositiu("chrome");
      }
    }
  }, []);

  // Escolta l'event natiu de descàrrega d'aplicacions PWA a Android/Chrome
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Explicació per a no-programadors: Estats per emmagatzemar la llista de múltiples dispositius que l'opositor té vinculats per rebre avisos d'OposiCAT.
  const [meusDispositius, setMeusDispositius] = useState<any[]>([]);
  const [carregantDispositius, setCarregantDispositius] = useState<boolean>(false);

  // Explicació per a no-programadors: Consulta directa a Firestore filtrant exclusivament per l'usuari actiu per recuperar de forma segura tots els seus mòbils o navegadors registrats.
  const carregarMeusDispositiusFCM = async () => {
    if (!usuariActiu) return;
    try {
      setCarregantDispositius(true);
      const colRef = collection(db, "fcm_tokens");
      const { query, where, getDocs, limit } = await import("firebase/firestore");
      const q = query(colRef, where("userId", "==", usuariActiu.uid), limit(15));
      const querySnapshot = await getDocs(q);
      
      const llista: any[] = [];
      querySnapshot.forEach((docSnap) => {
        llista.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });
      setMeusDispositius(llista);
    } catch (err) {
      console.warn("Informació: El navegador encara no té cap fcm_token vinculat o error de lectura.", err);
    } finally {
      setCarregantDispositius(false);
    }
  };

  // Explicació per a no-programadors: Funció que desa amb total seguretat el token de notificació generat pel mòbil de l'estudiant a la taula 'fcm_tokens' de Firestore.
  const desarFCMTokenABBDD = async (valorToken: string) => {
    if (!usuariActiu) {
      alert("Atenció: S'ha de tenir la sessió de l'opositor activa per registrar notificacions.");
      return;
    }
    const tokenNetejat = (valorToken || "").trim();
    if (!tokenNetejat) {
      alert("Introdueix un codi de token vàlid de l'Smartphone abans de desar.");
      return;
    }

    setGuardantToken(true);
    
    // Suport multidispositiu en calent: per permetre tenir tants mòbils o tauletes registrades com fagi falta,
    // es construeix un ID de document segur i determinista amb el seu propi valor parcial per evitar col·lisions de repetició.
    const fragmentTokenSegur = tokenNetejat.replace(/[^a-zA-Z0-9_\-]/g, "").substring(0, 50);
    const tokenId = `fcm_${usuariActiu.uid}_${fragmentTokenSegur}`;

    // Auto-detecció senzilla de la plataforma de destinació (iOS o Android) pel disseny de contingut
    let plataformaSufix: "android" | "ios" | "web_pc" = "android";
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      plataformaSufix = "ios";
    } else if (/windows|macintosh|linux/.test(userAgent)) {
      plataformaSufix = "web_pc";
    }

    try {
      // Desar o sobreescriure a fcm_tokens i protegir amb la regla Zero-Trust desplegada de protecció de dades
      await setDoc(doc(db, "fcm_tokens", tokenId), {
        userId: usuariActiu.uid,
        email: usuariActiu.email || "correu-notificacio@oposicat.cat",
        token: tokenNetejat,
        plataforma: plataformaSufix,
        creadaEl: serverTimestamp() // Molt important d'acord amb la regla de seguretat de firestore.rules
      });
      
      alert(`Perfecte! El Token FCM ha estat desat correctament sota Firestore utilitzant el teu perfil d'estudiant.`);
      setTokenFCMInput("");
      carregarMeusDispositiusFCM();
    } catch (error: any) {
      console.error("Error al registrar fcm_token:", error);
      alert("Error en desar el token. Recordi revisar que té la sessió iniciada correctament.");
    } finally {
      setGuardantToken(false);
    }
  };

  // Explicació per a no-programadors: Funció per si l'estudiant desitja bloquejar o desactivar un dels seus mòbils enllançats i desvincular totalment l'enviament.
  const esborrarFCMTokenDeBBDD_Especific = async (idDocumentToken: string) => {
    setGuardantToken(true);
    try {
      await deleteDoc(doc(db, "fcm_tokens", idDocumentToken));
      alert("Dispositiu desvinculat. Ja no rebràs notificacions directes en aquest terminal mòbil.");
      carregarMeusDispositiusFCM();
    } catch (error) {
      console.error("Error al desvincular:", error);
      alert("S'ha produït un error al desvincular el dispositiu de l'escola.");
    } finally {
      setGuardantToken(false);
    }
  };

  const [obtinguentToken, setObtinguentToken] = useState<boolean>(false);

  // Explicació per a no-programadors: Sol·licita instantàniament a Google el token físic d'entrega push del dispositiu mòbil, utilitzant la signatura de seguretat de Firebase (VAPID) de la teva imatge.
  const obtenirTokenNatiu = async () => {
    try {
      setObtinguentToken(true);
      if (typeof window === "undefined" || !("Notification" in window)) {
        alert("El teu navegador o emulador de proves no ofereix suport per a notificacions del sistema.");
        return;
      }

      if (Notification.permission !== "granted") {
        const nouPermis = await Notification.requestPermission();
        setPermisNotificacio(nouPermis);
        if (nouPermis !== "granted") {
          alert("Permís denegat. Per rebre notificacions mòbils, primer has de concedir els permisos al diàleg emergent.");
          return;
        }
      }

      // Provem de connectar amb la passarel·la asíncrona de Firebase
      const msgeria = await obtenirMissatgeria();
      if (!msgeria) {
        alert("No s'ha obtingut resposta del motor Firebase Cloud Messaging. Revisa que estiguis navegant des d'un entorn segur amb suport HTTPS.");
        return;
      }

      // Utilitzem la clau pública VAPID obtinguda de la teva captura de pantalla!
      const clauVapidPublica = "BE854ef6enb_fwGu0euE60KNri-OapYlikkwsOxXm-AruH7ENqqRCq6CBB9ms6tNq6oTznrE-P6mq5Xk9wW_5Lk";

      const tokenFCM = await getToken(msgeria, { vapidKey: clauVapidPublica });
      if (tokenFCM) {
        setTokenFCMInput(tokenFCM);
        alert("Fantàstic! S'ha obtingut la clau única (Token FCM) del mòbil de forma totalment automàtica! Ara pots prémer 'Desar Token' per connectar-lo a la base de dades.");
      } else {
        alert("El sistema de Google ha retornat un token buit. Si és un iPhone, recorda obrir el web des de la Pantalla d'Inici (llançada des de l'opció Compartir -> Ancorar a pantalla d'inici).");
      }
    } catch (err: any) {
      console.warn("Retorn de registre FCM natiu:", err);
      alert(`S'ha completat la sol·licitud amb un avís d'entorn: ${err?.message || err}`);
    } finally {
      setObtinguentToken(false);
    }
  };

  // Explicació per a no-programadors: Aquesta és la nova funció d'activació "Un sol clic".
  // L'alumne només prem un botó, i el mòbil demana el permís, genera el canal segur amb Google
  // i s'auto-vincula directament a la nostra base de dades Firestore de forma completament invisible.
  const activarAvisosUnSolClic = async (silencios: boolean = false) => {
    try {
      setActivantAvisosUnic(true);
      if (typeof window === "undefined" || !("Notification" in window)) {
        if (!silencios) {
          alert("El teu dispositiu o navegador no suporta les notificacions de sistema.");
        }
        return;
      }

      // 1. Demanem el permís natiu si encara no està acceptat
      if (Notification.permission !== "granted") {
        const nouPermis = await Notification.requestPermission();
        setPermisNotificacio(nouPermis);
        if (nouPermis !== "granted") {
          if (!silencios) {
            alert("Per rebre els avisos d'oposició d'OposiCAT és indispensable concedir els permisos en el qüestionari emergent del teu navegador.");
          }
          return;
        }
      }

      // 2. Anem a buscar el vigilant asíncron (Service Worker i Firebase Cloud Messaging)
      const msgeria = await obtenirMissatgeria();
      if (!msgeria) {
        if (!silencios) {
          alert("El motor de notificacions de Google encara s'està carregant o requereix connexió segura HTTPS.");
        }
        return;
      }

      const clauVapidPublica = "BE854ef6enb_fwGu0euE60KNri-OapYlikkwsOxXm-AruH7ENqqRCq6CBB9ms6tNq6oTznrE-P6mq5Xk9wW_5Lk";
      const tokenFCM = await getToken(msgeria, { vapidKey: clauVapidPublica });
      
      if (!tokenFCM) {
        if (!silencios) {
          alert("Google no ha pogut emetre un codi únic en aquest moment. Si és un terminal Apple, recorda afegir la web a la Pantalla de l'Inici per permetre les notificacions.");
        }
        return;
      }

      // 3. Posem-lo a l'input de text opcional dels tècnics
      setTokenFCMInput(tokenFCM);

      // 4. El desem automàticament a Firestore sense que l'usuari hagi de prémer res més!
      if (!usuariActiu) {
        if (!silencios) {
          alert("Revisa que tinguis el teu compte d'estudiant iniciat correctament.");
        }
        return;
      }

      const fragmentTokenSegur = tokenFCM.replace(/[^a-zA-Z0-9_\-]/g, "").substring(0, 50);
      const tokenId = `fcm_${usuariActiu.uid}_${fragmentTokenSegur}`;

      let plataformaSufix: "android" | "ios" | "web_pc" = "android";
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        plataformaSufix = "ios";
      } else if (/windows|macintosh|linux/.test(userAgent)) {
        plataformaSufix = "web_pc";
      }

      await setDoc(doc(db, "fcm_tokens", tokenId), {
        userId: usuariActiu.uid,
        email: usuariActiu.email || "correu-notificacio@oposicat.cat",
        token: tokenFCM,
        plataforma: plataformaSufix,
        creadaEl: serverTimestamp()
      });

      // Actualitzem llista local
      await carregarMeusDispositiusFCM();
      
      // Llançar avis de cortesia amb so i vibració
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("OposiCAT Connectat! 📢", {
          body: "Configuració completada amb èxit. Rebràs els simulacres de Mossos en temps real directament aquí.",
          icon: "/icon-192.png",
          badge: "/icon.svg"
        });
      }
      
      if (!silencios) {
        alert("✅ Enllaç realitzat amb èxit! El teu dispositiu s'ha vinculat i ja rebràs correctament les alertes d'exàmens.");
      }
    } catch (err: any) {
      console.warn("Error en el procés d'activació en un clic:", err);
      if (!silencios) {
        alert(`S'ha completat l'enllaç del dispositiu: ${err?.message || err}`);
      }
    } finally {
      setActivantAvisosUnic(false);
    }
  };

  // Explicació per a no-programadors: Aquesta és la funció que activa el diàleg d'instal·lació de debò.
  // Si la tablet d'estudiant suporta el mètode de descàrrega d'un clic de Chrome, el llança.
  // Si no és així, o estem a Safari, de seguida li obrim una finestra explicativa super didàctica que l'acompanya al pas a pas dels 3 puntets o l'opció "Compartir" de la tauleta.
  const instal_larAppNativaPWA = async () => {
    if (!pwaInstallPrompt) {
      // El navegador encara no ha detectat o bloqueja l'esdeveniment: mostrem la guia intel·ligent a la tauleta
      setModalConsellsInstalacioObert(true);
      return;
    }
    try {
      await pwaInstallPrompt.prompt();
      const eleccio = await pwaInstallPrompt.userChoice;
      console.log("[OposiCAT PWA] Resposta de l'usuari a la instal·lació neta:", eleccio.outcome);
      if (eleccio.outcome === "accepted") {
        setPwaInstallPrompt(null);
      } else {
        // Si canvia de pensament o té dubtes, obrim la guia per oferir el camí manual
        setModalConsellsInstalacioObert(true);
      }
    } catch (err) {
      console.warn("Error llançant l'instal·lador oficial PWA:", err);
      setModalConsellsInstalacioObert(true);
    }
  };

  // Explicació per a no-programadors: Efecte per enllaçar de fons de manera transparent cap token si l'usuari ja té prèviament concedit el permís. Així és automàtic des que obre l'App.
  useEffect(() => {
    if (usuariActiu && permisNotificacio === "granted") {
      const sincronitzacioDeFonsSilenciosa = async () => {
        try {
          const msgeria = await obtenirMissatgeria();
          if (msgeria) {
            const clauVapidPublica = "BE854ef6enb_fwGu0euE60KNri-OapYlikkwsOxXm-AruH7ENqqRCq6CBB9ms6tNq6oTznrE-P6mq5Xk9wW_5Lk";
            const tokenFCM = await getToken(msgeria, { vapidKey: clauVapidPublica });
            if (tokenFCM) {
              const fragmentTokenSegur = tokenFCM.replace(/[^a-zA-Z0-9_\-]/g, "").substring(0, 50);
              const tokenId = `fcm_${usuariActiu.uid}_${fragmentTokenSegur}`;
              
              let plataformaSufix: "android" | "ios" | "web_pc" = "android";
              const userAgent = navigator.userAgent.toLowerCase();
              if (/iphone|ipad|ipod/.test(userAgent)) {
                plataformaSufix = "ios";
              } else if (/windows|macintosh|linux/.test(userAgent)) {
                plataformaSufix = "web_pc";
              }

              await setDoc(doc(db, "fcm_tokens", tokenId), {
                userId: usuariActiu.uid,
                email: usuariActiu.email || "correu-notificacio@oposicat.cat",
                token: tokenFCM,
                plataforma: plataformaSufix,
                creadaEl: serverTimestamp()
              });
              console.log("[OposiCAT PWA] Sincronització automàtica silenciosa verificada amb èxit.");
            }
          }
        } catch (e) {
          console.log("[OposiCAT PWA] Sincronització silenciosa completada/avís:", e);
        }
      };
      sincronitzacioDeFonsSilenciosa();
    }
  }, [usuariActiu, permisNotificacio]);

  // Explicació per a no-programadors: Demanar a l'usuari activar les notificacions reals del mòbil
  const demanarPermisNotificacions = async () => {
    if (!("Notification" in window)) {
      alert("El teu dispositiu o navegador no suporta notificacions emergents directament.");
      return;
    }

    try {
      const resultat = await Notification.requestPermission();
      setPermisNotificacio(resultat);
      
      if (resultat === "granted") {
        // Llancem una petita notificació inicial de cortesia perquè l'usuari vegi immediatament com queda de bé
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          const opcionsInicials: any = {
            body: "Rebràs els simulacres d'examen i comunicats d'OposiCAT en temps real al teu mòbil.",
            icon: "/icon.svg",
            badge: "/icon.svg"
          };
          reg.showNotification("Notificacions Activades!", opcionsInicials);
        } else {
          new Notification("Notificacions Activades!", {
            body: "Rebràs els simulacres d'examen i comunicats d'OposiCAT en temps real.",
            icon: "/icon.svg"
          });
        }
      }
    } catch (err) {
      console.error("Error al demanar permís de notificació:", err);
    }
  };

  // Calculador ràpid de quantes notificacions estan pendents de llegir per pintar el cercle vermell d'avís
  const numNotificacions = notificacions.filter(n => !n.llegida).length;

  // Explicació per a no-programadors: Efecte per rebre l'estat d'autenticació i posar en marxa o aturar de forma neta les subscripcions a la sessió de l'estudiant.
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((usuari) => {
      setAuthCarregada(true);
      if (usuari) {
        setUsuariActiu(usuari);
      } else {
        setUsuariActiu(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Explicació per a no-programadors: Benvinguda transparent al primer accés de l'opositor.
  // Si l'alumne entra per primer cop de veritat a la seva sessió d'OposiCAT i el navegador encara té el permís
  // de notificacions en default (sense decidir), demanem immediatament el permís del sistema de Chrome o Safari
  // per llançar el pop-up natiu de demanar permisos. Sense mostrar diàlegs corporis falsos que puguin molestar.
  useEffect(() => {
    if (authCarregada && usuariActiu) {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          const timer = setTimeout(() => {
            activarAvisosUnSolClic(true);
          }, 1500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [authCarregada, usuariActiu]);

  // Explicació per a no-programadors: Aquest efecte es connecta en temps real a la base de dades de notificacions de Firestore un cop l'usuari s'ha identificat. Si l'administrador prem "Enviar", rebrem immediatament la notificació al mòbil sense haver de recarregar la pàgina.
  useEffect(() => {
    if (!authCarregada || !usuariActiu) {
      // Evitem consultes en fred per estalviar errors involuntaris de permisos fins que la sessió estigui totalment llesta
      return;
    }

    const colRef = collection(db, "notificacions");
    const q = query(colRef, orderBy("creadaEl", "desc"), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const elements: any[] = [];
      
      snapshot.forEach((docSnap) => {
        const dades = docSnap.data();

        // Només volem dibuixar a la llista aquelles que hagin estat finalment enviades pel personal docent i que no estiguin "suspeses"
        if (dades.accio === "ENVIAR" && !dades.suspesa) {
          
          // Calculem de forma senzilla el temps transcorregut de publicació per fer el disseny planer de l'escola
          let textTemps = "Ara mateix";
          if (dades.creadaEl && typeof dades.creadaEl.toDate === "function") {
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

          // Classifiquem automàticament la importància segons el títol corporatiu oficial tal com fem a la web de l'ordinador
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

      // Explicació per a no-programadors: Si l'usuari té obert el mòbil amb els permisos concedits, i no és la càrrega inicial (per evitar rebre de cop l'històric), li llancem la notificació directament de les noves alertes rebudes en calent en temps real!
      if (!esPrimeraCarrega.current) {
        snapshot.docChanges().forEach((canvi) => {
          if (canvi.type === "added") {
            const dades = canvi.doc.data();
            if (dades.accio === "ENVIAR" && !dades.suspesa) {
              // Comprovem si s'ha creat fa menys de 45 segons per descartar càrregues flotants de memòria
              let esFrisc = false;
              if (dades.creadaEl && typeof dades.creadaEl.toDate === "function") {
                const dif = Date.now() - dades.creadaEl.toDate().getTime();
                if (dif < 45000) {
                  esFrisc = true;
                }
              }

              if (esFrisc && Notification.permission === "granted") {
                if ("serviceWorker" in navigator) {
                  navigator.serviceWorker.ready.then((reg) => {
                    const opcionsMobil: any = {
                      body: dades.cos || "Tens un nou missatge acadèmic urgent.",
                      icon: "/icon.svg",
                      badge: "/icon.svg",
                      vibrate: [200, 100, 200, 100, 200],
                      tag: canvi.doc.id,
                      requireInteraction: true
                    };
                    reg.showNotification(dades.titol || "Avís oficial OposiCAT", opcionsMobil);
                  }).catch(() => {
                    new Notification(dades.titol || "Avís oficial OposiCAT", {
                      body: dades.cos || "Tens un nou missatge acadèmic urgent.",
                      icon: "/icon.svg"
                    });
                  });
                } else {
                  new Notification(dades.titol || "Avís oficial OposiCAT", {
                    body: dades.cos || "Tens un nou missatge acadèmic urgent.",
                    icon: "/icon.svg"
                  });
                }
              }
            }
          }
        });
      }

      esPrimeraCarrega.current = false;
      setNotificacions(elements);
    }, (error) => {
      // Ignorem avisos de permisos temporals si s'està tancant la sessió a l'aplicació mòbil
      const isPermissionError = error instanceof Error && error.message.toLowerCase().includes("permission");
      if (isPermissionError && !auth.currentUser) {
        return;
      }
      console.warn("Firestore info parcial d'alarma al mòbil d'estudiant:", error);
    });

    return () => unsubscribe();
  }, [notificacionsLlegidesIds, authCarregada, usuariActiu]);

  // Explicació per a no-programadors: Funció per marcar totes les notificacions alhora com a llegides a la memòria
  const marcarTotesComALlegides = () => {
    const totsElsIds = notificacions.map(n => n.id);
    const nousIdsLlegits = Array.from(new Set([...notificacionsLlegidesIds, ...totsElsIds]));
    setNotificacionsLlegidesIds(nousIdsLlegits);
    try {
      localStorage.setItem("oposicat_notificacions_llegides", JSON.stringify(nousIdsLlegits));
    } catch { }
  };

  // Explicació per a no-programadors: Funció per canviar l'estat d'individualment llegida / no llegida al clicar a sobre de cadascuna
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
      localStorage.setItem("oposicat_notificacions_llegides", JSON.stringify(nousIds));
    } catch { }
  };

  // Explicació per a no-programadors: Funció per dibuixar el detall d'un rànquing seleccionat en format de podi olímpic (1r, 2n i 3r) i llista per als llocs 4, 5 i següents.
  const renderDetallRanking = (id: string | null) => {
    if (!id) return null;
    
    // Dades dels rankings completament segures amb voluntat didàctica
    const dadesRankings: { [key: string]: { titol: string, unitat: string, participants: { pos: number, nom: string, valor: string | number, esUsuari?: boolean }[] } } = {
      testos: {
        titol: "Més tests fets",
        unitat: "tests completats",
        participants: [
          { pos: 1, nom: "Laura Vilanova", valor: 142 },
          { pos: 2, nom: "Marc Soler", valor: 138 },
          { pos: 3, nom: "Jordi Muñoz", valor: 120 },
          { pos: 4, nom: "Anna Prat", valor: 115 },
          { pos: 5, nom: "Albert Roca", valor: 98 },
        ]
      },
      notes: {
        titol: "Millors notes de test",
        unitat: "mitjana / 10",
        participants: [
          { pos: 1, nom: "Jordi Muñoz", valor: "9.65" },
          { pos: 2, nom: "Sílvia Garcia", valor: "9.42" },
          { pos: 3, nom: "Marc Soler", valor: "9.15" },
          { pos: 4, nom: "Anna Prat", valor: "8.90" },
          { pos: 5, nom: "Laura Vilanova", valor: "8.85" },
        ]
      },
      temps: {
        titol: "Més temps connectat",
        unitat: "hores d'estudi actiu",
        participants: [
          { pos: 1, nom: "Sílvia Garcia", valor: "156h" },
          { pos: 2, nom: "Laura Vilanova", valor: "148h" },
          { pos: 3, nom: "Marc Soler", valor: "132h" },
          { pos: 4, nom: "Joan Busquets", valor: "118h" },
          { pos: 5, nom: "Jordi Muñoz", valor: "95h" },
        ]
      },
      exercici: {
        titol: "Més exercici físic fet",
        unitat: "sessions d'esport",
        participants: [
          { pos: 1, nom: "Marc Soler", valor: 48 },
          { pos: 2, nom: "Anna Prat", valor: 42 },
          { pos: 3, nom: "Albert Roca", valor: 38 },
          { pos: 4, nom: "Laura Vilanova", valor: 35 },
          { pos: 5, nom: "Jordi Muñoz", valor: 30 },
        ]
      },
      dieta: {
        titol: "Seguiment de la dieta",
        unitat: "compliment (30 dies)",
        participants: [
          { pos: 1, nom: "Laura Vilanova", valor: "100%" },
          { pos: 2, nom: "Sílvia Garcia", valor: "98%" },
          { pos: 3, nom: "Anna Prat", valor: "95%" },
          { pos: 4, nom: "Marc Soler", valor: "92%" },
          { pos: 5, nom: "Jordi Muñoz", valor: "90%" },
        ]
      },
      entrevistes: {
        titol: "Més entrevistes fetes",
        unitat: "simulacres completats",
        participants: [
          { pos: 1, nom: "Jordi Muñoz", valor: 18 },
          { pos: 2, nom: "Laura Vilanova", valor: 15 },
          { pos: 3, nom: "Albert Roca", valor: 14 },
          { pos: 4, nom: "Sílvia Garcia", valor: 12 },
          { pos: 5, nom: "Marc Soler", valor: 10 },
        ]
      },
      entrenaments: {
        titol: "Entrenaments completats",
        unitat: "sessions de força/cardio",
        participants: [
          { pos: 1, nom: "Marc Soler", valor: 32 },
          { pos: 2, nom: "Anna Prat", valor: 28 },
          { pos: 3, nom: "Albert Roca", valor: 27 },
          { pos: 4, nom: "Sílvia Garcia", valor: 24 },
          { pos: 5, nom: "Jordi Muñoz", valor: 22 },
        ]
      }
    };

    const dadesActuals = dadesRankings[id] || dadesRankings.testos;
    const p1 = dadesActuals.participants.find(p => p.pos === 1);
    const p2 = dadesActuals.participants.find(p => p.pos === 2);
    const p3 = dadesActuals.participants.find(p => p.pos === 3);
    const restants = dadesActuals.participants.filter(p => p.pos > 3);

    // Afegim l'usuari actiu com a posició simulada per generar immersió i feedback didàctic continu
    const nomUsuari = usuariActiu?.displayName || "Tu (Estudiant)";
    const usuariSimulat = { pos: 14, nom: nomUsuari, valor: "--", esUsuari: true };

    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Títol de la Categoria */}
        <div className="text-center mb-1">
          <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest bg-indigo-500/15 px-3 py-1 rounded-full">
            Detall del Rànquing
          </span>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase mt-2">
            {dadesActuals.titol}
          </h2>
          <p className="text-[11px] text-white/50 tracking-wide mt-1">
            Mesura de qualificació: <span className="text-white/80 font-mono font-bold lowercase">{dadesActuals.unitat}</span>
          </p>
        </div>

        {/* PODI D'HONOR OLÍMPIC (2n, 1r, 3r) */}
        <div className="grid grid-cols-3 items-end gap-2 mt-4 bg-black/25 backdrop-blur-sm p-4 rounded-[2rem] border border-white/5 shadow-inner">
          
          {/* Segon lloc (Argent) */}
          {p2 && (
            <div className="flex flex-col items-center flex-1">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-slate-700/80 border-2 border-slate-300 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  <Medal className="w-6 h-6 text-slate-300" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-900 border border-slate-700 text-[10px] font-black flex items-center justify-center">
                  2
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-200 mt-2 text-center truncate w-full px-1">
                {p2.nom}
              </span>
              <span className="text-[11px] font-mono font-black text-slate-300 bg-white/5 px-2 py-0.5 rounded-md mt-1">
                {p2.valor}
              </span>
              <div className="w-full bg-slate-500/20 h-16 rounded-t-xl mt-3 flex items-center justify-center border-t border-slate-300/20">
                <span className="text-slate-300/40 text-[10px] font-black italic">II</span>
              </div>
            </div>
          )}

          {/* Primer lloc (Or) */}
          {p1 && (
            <div className="flex flex-col items-center flex-1 -mt-4">
              <div className="relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                </div>
                <div className="w-14 h-14 rounded-full bg-amber-600/80 border-2 border-amber-400 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-amber-500/20">
                  <Star className="w-7 h-7 text-amber-300 fill-amber-300" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-900 border border-amber-600 text-xs font-black flex items-center justify-center">
                  1
                </span>
              </div>
              <span className="text-[11px] font-black text-amber-300 mt-2 text-center truncate w-full px-1">
                {p1.nom}
              </span>
              <span className="text-[12px] font-mono font-black text-[#FFDF00] bg-white/10 px-2.5 py-0.5 rounded-md mt-1 animate-pulse shadow-md shadow-amber-500/10">
                {p1.valor}
              </span>
              <div className="w-full bg-amber-500/35 h-24 rounded-t-xl mt-3 flex items-center justify-center border-t border-amber-400/40">
                <span className="text-amber-300/50 text-xs font-black italic">I</span>
              </div>
            </div>
          )}

          {/* Tercer lloc (Bronze) */}
          {p3 && (
            <div className="flex flex-col items-center flex-1">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-amber-900/80 border-2 border-amber-700 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  <Medal className="w-6 h-6 text-amber-600" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-amber-100 border border-amber-900 text-[10px] font-black flex items-center justify-center">
                  3
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-200/90 mt-2 text-center truncate w-full px-1">
                {p3.nom}
              </span>
              <span className="text-[11px] font-mono font-black text-amber-600 bg-white/5 px-2 py-0.5 rounded-md mt-1">
                {p3.valor}
              </span>
              <div className="w-full bg-amber-700/20 h-12 rounded-t-xl mt-3 flex items-center justify-center border-t border-amber-700/20">
                <span className="text-amber-600/40 text-[10px] font-black italic">III</span>
              </div>
            </div>
          )}

        </div>

        {/* RESTA DE LA CLASSIFICACIÓ (TOP 4, 5) */}
        <div className="flex flex-col gap-2 mt-2">
          {restants.map((p) => (
            <div 
              key={p.pos}
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-xs font-black text-white/40">
                  #{p.pos}
                </span>
                <span className="text-xs font-bold text-white/80">
                  {p.nom}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-md">
                {p.valor}
              </span>
            </div>
          ))}

          {/* Posició de l'usuari actual llogat per establir feedback didàctic rígid */}
          <div className="w-full bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center justify-between mt-1">
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-black text-indigo-400">
                #{usuariSimulat.pos}
              </span>
              <span className="text-xs font-black italic uppercase tracking-wider text-indigo-200">
                {usuariSimulat.nom}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Sense ràtio</span>
            </div>
          </div>
        </div>

        {/* BLOC INDICATIU DE PROPERES INSTÀNCIES DE RÀQUIS */}
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl mt-4 shadow-md backdrop-blur-sm">
          <h4 className="text-xs font-black italic uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-1.5 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Com participo?
          </h4>
          <p className="text-[11px] text-white/80 leading-relaxed font-semibold text-center mt-1">
            {id === "testos" 
              ? "Un cop hagis completat com a minim un test de 30 preguntes de cadascun dels temes de l'APP, apareixeràs al rànquing i podràs començar a competir amb la resta d'usuaris."
              : "Molt aviat s'explicarà el funcionament i repte corresponents per participar en aquesta modalitat de rànquing i començar a competir amb la resta d'usuaris de cara als millors premis!"
            }
          </p>
        </div>

        {/* ACCIÓ DE TORNADA AL MENÚ DE RANKINGS */}
        <button
          onClick={() => setRankingSeleccionatId(null)}
          className="mt-4 w-full bg-white/10 hover:bg-white/15 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
          <span className="font-extrabold italic text-xs uppercase tracking-widest text-white">
            Tornar als Rankings
          </span>
        </button>
      </div>
    );
  };

  if (mostrarRankings) {
    return (
      <div 
        className="fixed inset-0 w-full bg-[#001f3d] overflow-y-auto flex flex-col items-center px-6 pb-36 text-white"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Capçalera dels Rankings */}
        <header className="pt-14 w-full flex flex-col items-center gap-4 shrink-0 mb-6 font-sans">
          <div className="bg-black/35 backdrop-blur-md px-6 py-3 rounded-3xl shadow-xl border border-white/10 flex items-center gap-4 w-full max-w-md">
            <button 
              onClick={() => {
                if (rankingSeleccionatId) {
                  setRankingSeleccionatId(null);
                } else {
                  setMostrarRankings(false);
                }
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center pr-6">
              <h1 className="text-xl font-black italic tracking-tighter uppercase select-none">
                <span className="text-white">Rankings </span>
                <span className="text-indigo-400">Classificació</span>
              </h1>
            </div>
          </div>
        </header>

        {rankingSeleccionatId === null ? (
          /* PANTALLA PRINCIPAL DE RANKINGS: LLISTAT DE BOTONS DE CATEGORIES */
          <main className="w-full max-w-md flex flex-col gap-4 font-sans">
            {/* Explicació per a no-programadors: Text d'introducció destacant en diferents colors (groc, rosa, verd i taronja) els premis que poden guanyar per motivar l'estudiant */}
            <div className="text-center mb-2 px-2 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
              <p className="text-white/80 text-xs font-semibold leading-relaxed">
                Participa als nostres rànquings! Entra a cadascun d'ells, descobreix què has de fer per <span className="text-red-500 font-black uppercase">participar</span> i aconsegueix <span className="text-yellow-400 font-black">regals</span>, <span className="text-pink-400 font-black">vals de descompte dels nostres patrocinadors</span>, <span className="text-emerald-400 font-black">mesos gratuïts de la nostra APP</span> i <span className="text-orange-500 font-black">molts altres premis</span>. No t'ho perdis, diverteix-te mentre aprens i prepara't per convertir-te en el pròxim Mosso o la pròxima Mossa d'Esquadra!
              </p>
            </div>

            {/* Explicació per a no-programadors: Fila de dos botons en paral·lel d'igual mida i proporció perquè s'ajustin al disseny mòbil i estiguin a l'abast de l'estudiant */}
            <div className="flex gap-2 justify-center w-full my-2">
              <button
                onClick={() => {
                  setMostrarChat(!mostrarChat);
                  setMostrarPremis(false); // Amaguem els premis per no tapar tota la pantalla si obre el xat
                }}
                className="flex-1 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-full flex items-center justify-center gap-1.5 transition-all text-indigo-300 font-bold text-[11px] uppercase tracking-wider select-none cursor-pointer active:scale-95 shadow-md shadow-indigo-950/40"
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Chat rànquing</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </button>

              <button
                onClick={() => {
                  setMostrarPremis(!mostrarPremis);
                  setMostrarChat(false); // Amaguem el xat per no saturar la pantalla si obre els premis
                }}
                className={`flex-1 px-3 py-2 border rounded-full flex items-center justify-center gap-1.5 transition-all font-bold text-[11px] uppercase tracking-wider select-none cursor-pointer active:scale-95 shadow-md ${
                  mostrarPremis 
                    ? "bg-amber-500/40 border-amber-400 text-white shadow-amber-950/60" 
                    : "bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/30 text-amber-300 shadow-amber-950/40"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Premis</span>
              </button>
            </div>

            {/* INTERFÍCIE HISTÒRICA I DETALLADA DE PREMIS MENSUALS DESTACATS */}
            {mostrarPremis && (
              <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-[1.8rem] p-5 flex flex-col gap-4 mb-4 font-sans shadow-2xl backdrop-blur-md animate-fade-in text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400 animate-bounce animate-pulse" />
                    Premis i Recompenses d'OposiCAT
                  </span>
                  <button 
                    onClick={() => setMostrarPremis(false)}
                    className="text-xs font-black text-white/40 hover:text-white/80 transition-all uppercase tracking-widest text-[9px] bg-white/5 px-2.5 py-1 rounded-full cursor-pointer"
                  >
                    Amagar
                  </button>
                </div>

                <p className="text-xs text-white/90 leading-relaxed font-semibold">
                  Els premis mensuals podem variar en funció de les aportacions i obsequis que els nostres patrocinadors ofereixen a la millor comunitat d'opositors: la nostra.
                </p>

                {/* Podi de premis mensuals */}
                <div className="flex flex-col gap-2.5 py-1">
                  
                  {/* 1r Classificat */}
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
                    <span className="text-2xl select-none">🏆</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">1a posició rànquing</p>
                      <p className="text-xs text-white font-extrabold">Val de descompte de 20 € a Prozis.</p>
                    </div>
                  </div>

                  {/* 2n Classificat */}
                  <div className="flex items-center gap-3 bg-slate-500/10 border border-slate-500/30 rounded-2xl p-3">
                    <span className="text-2xl select-none font-sans font-black">🥈</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">2a posició rànquing</p>
                      <p className="text-xs text-white font-extrabold">Descomptes per un valor de 15 € al supermercat Plusfresc.</p>
                    </div>
                  </div>

                  {/* 3r Classificat */}
                  <div className="flex items-center gap-3 bg-amber-800/10 border border-amber-800/30 rounded-2xl p-3">
                    <span className="text-2xl select-none">🥉</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">3a posició rànquing</p>
                      <p className="text-xs text-white font-extrabold">Val de descompte de 10 € a Decathlon.</p>
                    </div>
                  </div>

                </div>

                <div className="border-t border-white/5 pt-2 font-sans">
                  <p className="text-[10px] text-white/55 italic leading-relaxed font-medium">
                    Els premis estan subjectes a disponibilitat i poden ser modificats o substituïts per altres de valor equivalent segons les col·laboracions vigents.
                  </p>
                </div>
              </div>
            )}

            {/* INTERFÍCIE DEL XAT INTERACTIU AMB COMENTARIS DIVERTITS I INPUT ACTIU MOGUT AL TOP */}
            {mostrarChat && (
              <div className="w-full bg-black/45 border border-white/10 rounded-[1.8rem] p-4 flex flex-col gap-3 mb-4 font-sans shadow-2xl backdrop-blur-md animate-fade-in text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                    Debat de l'oposició en directe
                  </span>
                  <button 
                    onClick={() => setMostrarChat(false)}
                    className="text-xs font-black text-white/40 hover:text-white/80 transition-all uppercase tracking-widest text-[9px] bg-white/5 px-2.5 py-1 rounded-full cursor-pointer"
                  >
                    Amagar xat
                  </button>
                </div>

                {/* Llista de missatges de la conversa sota scroll actiu */}
                <div className="flex flex-col gap-3 overflow-y-auto max-h-[220px] pr-1 py-1" style={{ WebkitOverflowScrolling: "touch" }}>
                  {missatgesChat.map((m) => (
                    <div key={m.id} className="flex flex-col gap-1 text-left font-sans">
                      <div className="flex items-center gap-1.5 justify-start">
                        <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg border ${m.color}`}>
                          {m.nom}
                        </span>
                        <span className="text-[9px] text-white/30 font-mono">{m.hora}</span>
                      </div>
                      <p className="text-xs text-white/95 bg-white/5 border border-white/5 px-3 py-2 rounded-2xl ml-1 leading-relaxed shadow-sm">
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Formulari d'enviament directe on qualsevol opositor pot parlar amb el seu nom d'usuari de veritat */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!nouMissatgeText.trim()) return;
                    const nomDeVeritat = usuariActiu?.displayName || "Tu (Estudiant)";
                    const nouM = {
                      id: Date.now(),
                      nom: nomDeVeritat,
                      text: nouMissatgeText,
                      hora: new Date().toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" }),
                      color: "text-indigo-200 bg-indigo-500/25 border-indigo-500/45 font-black uppercase"
                    };
                    setMissatgesChat([...missatgesChat, nouM]);
                    setNouMissatgeText("");
                  }}
                  className="flex items-center gap-2 mt-1 pt-2 border-t border-white/5"
                >
                  <input
                    type="text"
                    value={nouMissatgeText}
                    onChange={(e) => setNouMissatgeText(e.target.value)}
                    placeholder="Escriu un comentari o broma opositora..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all cursor-pointer text-white active:scale-95 shadow-md shadow-indigo-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* LLISTA DE BOTONS PRINCIPALS DE RANKING */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "testos", títol: "Més tests fets", icon: ClipboardList, desc: "Total d'exàmens i tests completats", color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-200" },
                { id: "notes", títol: "Millor notes", icon: Award, desc: "Mitjana de les darreres qualificacions de test", color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-200" },
                { id: "temps", títol: "Més temps connectat", icon: Clock, desc: "Hores d'estudi active registrades", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-200" },
                { id: "exercici", títol: "Més exercici fet", icon: Dumbbell, desc: "Sessions d'exercici físic d'oposició realitzades", color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-200" },
                { id: "dieta", títol: "El que més segueix la dieta", icon: Apple, desc: "Millors ràtios de compliment del menú nutricional", color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-200" },
                { id: "entrevistes", títol: "Més entrevistes fetes", icon: Users, desc: "Simulacres de prova personal completats", color: "from-cyan-500/20 to-sky-500/10 border-cyan-500/30 text-cyan-200" },
                { id: "entrenaments", títol: "Més sessions d'entrenaments completades", icon: Flame, desc: "Més sessions d'entrenament físic completes", color: "from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-200 text-left" }
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.id}
                    onClick={() => setRankingSeleccionatId(b.id)}
                    className={`w-full bg-gradient-to-r ${b.color} border rounded-2xl p-4 flex items-center justify-between shadow-lg hover:brightness-110 active:scale-[0.98] transition-all group cursor-pointer`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-3 bg-black/20 rounded-xl">
                        <Icon className="w-5 h-5 shrink-0" />
                      </div>
                      <div>
                        <h3 className="font-extrabold italic text-sm uppercase tracking-wide">
                          {b.títol}
                        </h3>
                        <p className="text-[10px] text-white/50 lowercase mt-0.5 font-medium leading-none">
                          {b.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                  </button>
                )
              })}
            </div>

            {/* BOTÓ DE TANCAR / TORNAR */}
            <button 
              onClick={() => setMostrarRankings(false)}
              className="mt-6 w-full py-3 flex items-center justify-center gap-2 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-95 text-white cursor-pointer"
            >
              <span className="font-black italic text-[11px] uppercase tracking-widest text-white/80">
                Tornar al Menú Principal
              </span>
            </button>
          </main>
        ) : (
          /* DETALL DE RANKING SELECCIONAT: VISUALITZACIÓ EXCEL·LENT DEL PODI I TOP 5 */
          <main className="w-full max-w-md flex flex-col gap-4 font-sans">
            {renderDetallRanking(rankingSeleccionatId)}
          </main>
        )}

        {/* Comentari planer per a no-programadors: Barra inferior redissenyada amb un to blau policia molt més clar i lluent (bg-[#13355c]) en lloc de gairebé negre per augmentar el contrast, i reduïm l'alçada del seu contenidor utilitzant 'pt-1.5' i adaptant el padding inferior ('calc(5px + ...)') perquè quedi més estreta, moderna i no ocupi tant d'espai a la pantalla. */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#13355c]/95 backdrop-blur-md border-t border-white/20 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-300"
          style={{ paddingBottom: "calc(5px + env(safe-area-inset-bottom, 6px))" }}
        >
          <div className="w-full max-w-md grid grid-cols-4 gap-1">
            
            {/* Botó 1: Casa (Inici) */}
            <button 
              onClick={() => {
                setMostrarRankings(false);
                setModalForumObert(false);
                setModalNotificacionsObert(false);
                setModalAvatarObert(false);
              }}
              className={`py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group cursor-pointer rounded-xl hover:bg-white/5 ${
                (!mostrarRankings && !modalForumObert && !modalNotificacionsObert && !modalAvatarObert)
                  ? "text-blue-200"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <Home className={`w-6 h-6 transition-all group-hover:scale-115 ${
                (!mostrarRankings && !modalForumObert && !modalNotificacionsObert && !modalAvatarObert)
                  ? "text-blue-300"
                  : "text-slate-300 group-hover:text-white"
              }`} />
              <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
                Inici
              </span>
            </button>

            {/* Botó 2: Fòrum */}
            <button 
              onClick={() => {
                setMostrarRankings(false);
                setModalForumObert(true);
                setModalNotificacionsObert(false);
                setModalAvatarObert(false);
              }}
              className={`py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 ${
                modalForumObert
                  ? "text-pink-400"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="relative">
                <MessageSquare className={`w-6 h-6 transition-all group-hover:scale-115 ${
                  modalForumObert ? "text-pink-400" : "text-pink-400/60 group-hover:text-pink-400"
                }`} />
                {/* Indicador de notificació polsant */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75 font-bold"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
              </div>
              <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
                Fòrum 💬
              </span>
            </button>

            {/* Botó 3: Notícies */}
            <button 
              onClick={() => {
                setMostrarRankings(false);
                setModalForumObert(false);
                setModalNotificacionsObert(true);
                setModalAvatarObert(false);
              }}
              className={`py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 ${
                modalNotificacionsObert
                  ? "text-[#FFDF00]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="relative">
                <Bell className={`w-6 h-6 transition-all group-hover:scale-115 ${
                  modalNotificacionsObert 
                    ? "text-[#FFDF00]" 
                    : (numNotificacions > 0 ? "text-[#FFDF00] animate-bounce" : "text-white/60 group-hover:text-white")
                }`} />
                {numNotificacions > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-600 border border-white/20 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.6)]">
                    {numNotificacions}
                  </span>
                )}
              </div>
              <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
                Notícies
              </span>
            </button>

            {/* Botó 4: Perfil */}
            <button 
              onClick={() => {
                setMostrarRankings(false);
                setModalForumObert(false);
                setModalNotificacionsObert(false);
                setModalAvatarObert(true);
              }}
              className={`py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 ${
                modalAvatarObert
                  ? "text-blue-300"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className="relative">
                <span className="text-[20px] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
                  {avatarEstil}
                </span>
                <span className="absolute -top-1 -right-1 text-[8px] animate-pulse">⭐</span>
              </div>
              <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
                Perfil 👮‍♂️
              </span>
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 w-full bg-[#010915] overflow-y-auto flex flex-col items-center px-6 pb-36"
      style={{ 
        WebkitOverflowScrolling: "touch",
        // Comentari planer per a no-programadors: Deixem la imatge de fons amb un to molt més fosc alineat amb el disseny noble d'OposiCAT per a màxima consonància estètica a tota l'App.
        backgroundImage: "linear-gradient(to bottom, rgba(1, 9, 21, 0.92), rgba(1, 9, 21, 0.96)), url('/assets/imatges/fons_ispc.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "20% bottom"
      }}
    >
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 mb-2">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10">
          <h1 className="text-3xl font-black italic tracking-tighter select-none">
            <span className="text-white">Oposi </span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>
        
        <h2 className="text-white text-lg font-black italic tracking-tighter uppercase opacity-90">
          Benvingut, <span className="text-red-500">aspirant</span>
        </h2>
      </header>

      {/* ZONA DELS BOTONS PRINCIPALS */}
      <main className="w-full md:max-w-4xl flex flex-col gap-4">
        
        {/* Comentari planer per a no-programadors: Targeta/Banner elegant per instar l'usuari a instal·lar l'App a iOS o Android amb instruccions simples i clares. */}
        <div className="bg-gradient-to-r from-red-600/15 to-indigo-600/15 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-lg shrink-0">
                📲
              </div>
              <div className="flex flex-col">
                <span className="text-white text-xs font-black italic uppercase tracking-wider">
                  Vols instal·lar l'App al mòbil?
                </span>
                <span className="text-white/60 text-[10px] font-medium leading-tight">
                  Guarda OposiCAT a la teva pantalla d'inici per estudiar millor a pantalla completa sense anuncis ni barres de cerca!
                </span>
              </div>
            </div>
            <button 
              onClick={() => setModalInstallarObert(true)}
              className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold italic text-[10px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-900/20 select-none shrink-0"
            >
              Instal·lar
            </button>
          </div>
        </div>

        {/* Bloc 0: Accés directe (Dividit en 2: 60% Oposició / 40% Web) */}
        <div className="flex w-full gap-4">
          <button 
            onClick={onLaMevaOposicio}
            className="basis-[65%] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl py-5 flex items-center justify-center shadow-lg shadow-amber-900/10 transition-all active:scale-95 group"
          >
            <span className="text-amber-100 font-black italic text-[11px] sm:text-sm md:text-xl uppercase tracking-widest group-hover:scale-105 transition-transform truncate px-2 text-center">
              La meva oposició
            </span>
          </button>
          
          <button 
            onClick={() => setMostrarRankings(true)}
            className="basis-[35%] bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-2xl py-5 flex items-center justify-center shadow-lg shadow-indigo-900/10 transition-all active:scale-95 group"
          >
            <span className="text-indigo-100 font-black italic text-sm md:text-xl uppercase tracking-widest group-hover:scale-105 transition-transform">
              Rankings
            </span>
          </button>
        </div>

        {/* Línia de separació */}
        <div className="flex items-center py-1">
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Botons principals en grid en tauletes o llista vertical clàssica */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={onProvaTeorica}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-4 md:py-6 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
          >
            <span className="text-white font-black italic text-lg md:text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform text-center px-4">
              {/* Comentari planer per a no-programadors: Restaurem el nom original de "Prova Teòrica" per petició de l'usuari */}
              Prova Teòrica
            </span>
            <div className="h-0.5 w-8 bg-red-600 mt-1 rounded-full opacity-50" />
          </button>

          <button 
            onClick={onProvaPractica}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-4 md:py-6 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
          >
            <span className="text-white font-black italic text-lg md:text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform text-center px-4">
              {/* Comentari planer per a no-programadors: Restaurem "Prova Física" per a la part de preparació física */}
              Prova Física
            </span>
            <div className="h-0.5 w-8 bg-red-600 mt-1 rounded-full opacity-50" />
          </button>

          <button 
            onClick={onProvaPsicologica}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-4 md:py-6 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
          >
            <span className="text-white font-black italic text-lg md:text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform text-center px-4">
              Prova Psicològica
            </span>
            <div className="h-0.5 w-8 bg-red-600 mt-1 rounded-full opacity-50" />
          </button>
        </div>
      </main>

      {/* Comentari planer per a no-programadors: Barra inferior redissenyada amb un to fosc ben elegant (#010915) per estar en màxima sintonia amb el gradient global, mantenint el nostre preciós disseny de botons. */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#010915]/95 backdrop-blur-md border-t border-white/20 px-4 pt-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-300"
        style={{ paddingBottom: "calc(5px + env(safe-area-inset-bottom, 6px))" }}
      >
        <div className="w-full max-w-md grid grid-cols-4 gap-1">
          
          {/* Botó 1: Casa (Inici) */}
          <button 
            onClick={() => {
              onCanviarSeccio?.('home');
              // Comentari planer per a no-programadors: Si ja estem a la pantalla principal (cap modal ni rànquing obert),
              // mostrem el popup a l'aspirant preguntant-li si vol realment tornar al selector d'apps.
              if (!mostrarRankings && !modalForumObert && !modalNotificacionsObert && !modalAvatarObert) {
                setPopupTornarSelectorObert(true);
              } else {
                // Si s'estava a una altra part, el retorneu a l'inici tancant tots els canals.
                setMostrarRankings(false);
                setModalForumObert(false);
                setModalNotificacionsObert(false);
                setModalAvatarObert(false);
              }
            }}
            className={`py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group cursor-pointer rounded-xl hover:bg-white/5 ${
              (!mostrarRankings && !modalForumObert && !modalNotificacionsObert && !modalAvatarObert)
                ? "text-blue-200"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <Home className={`w-6 h-6 transition-all group-hover:scale-115 ${
              (!mostrarRankings && !modalForumObert && !modalNotificacionsObert && !modalAvatarObert)
                ? "text-blue-300"
                : "text-slate-300 group-hover:text-white"
            }`} />
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Inici
            </span>
          </button>

          {/* Botó 2: Fòrum */}
          <button 
            onClick={() => {
              onCanviarSeccio?.('forum');
              setMostrarRankings(false);
              setModalForumObert(true);
              setModalNotificacionsObert(false);
              setModalAvatarObert(false);
            }}
            className={`py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 ${
              modalForumObert
                ? "text-pink-400"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <div className="relative">
              <MessageSquare className={`w-6 h-6 transition-all group-hover:scale-115 ${
                modalForumObert ? "text-pink-400" : "text-pink-400/60 group-hover:text-pink-400"
              }`} />
              {/* Indicador de notificació polsant */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75 font-bold"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
            </div>
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Fòrum 💬
            </span>
          </button>

          {/* Botó 3: Notícies */}
          <button 
            onClick={() => {
              onCanviarSeccio?.('noticies');
              setMostrarRankings(false);
              setModalForumObert(false);
              setModalNotificacionsObert(true);
              setModalAvatarObert(false);
            }}
            className={`py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 ${
              modalNotificacionsObert
                ? "text-[#FFDF00]"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <div className="relative">
              <Bell className={`w-6 h-6 transition-all group-hover:scale-115 ${
                modalNotificacionsObert 
                  ? "text-[#FFDF00]" 
                  : (numNotificacions > 0 ? "text-[#FFDF00] animate-bounce" : "text-white/60 group-hover:text-white")
              }`} />
              {numNotificacions > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-600 border border-white/20 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.6)]">
                  {numNotificacions}
                </span>
              )}
            </div>
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Notícies
            </span>
          </button>

          {/* Botó 4: Perfil */}
          <button 
            onClick={() => {
              onCanviarSeccio?.('perfil');
              setMostrarRankings(false);
              setModalForumObert(false);
              setModalNotificacionsObert(false);
              setModalAvatarObert(true);
            }}
            className={`py-2 px-1 flex flex-col items-center justify-center transition-all active:scale-95 group relative cursor-pointer rounded-xl hover:bg-white/5 ${
              modalAvatarObert
                ? "text-blue-300"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <div className="relative">
              <span className="text-[20px] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none">
                {avatarEstil}
              </span>
              <span className="absolute -top-1 -right-1 text-[8px] animate-pulse">⭐</span>
            </div>
            <span className="font-extrabold italic text-[11px] uppercase tracking-wider text-center mt-1">
              Perfil 👮‍♂️
            </span>
          </button>

        </div>
      </div>

      {/* Comentari planer per a no-programadors: Targeta modal de confirmació d'escriptori i mòbil d'OposiCAT per evitar alertes síncrones del navegador que poden bloquejar-se en un iframe */}
      {popupTornarSelectorObert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#00274d] border-2 border-red-600/30 w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600/15 flex items-center justify-center border border-red-500/20 text-red-500 text-xl font-bold animate-pulse">
                👮‍♂️
              </div>
              <p className="text-white/95 font-bold text-sm leading-relaxed px-2">
                Has clicat a INICI estant ja a la pestanya d'inici, vols tornar al sel·lector d'Apps d'Oposicat?
              </p>
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    setPopupTornarSelectorObert(false);
                    onTornar();
                  }}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black italic text-xs uppercase py-3 rounded-xl transition-all shadow-md tracking-wider cursor-pointer"
                >
                  Sí, tornar
                </button>
                <button
                  onClick={() => setPopupTornarSelectorObert(false)}
                  className="bg-white/10 hover:bg-white/15 active:scale-95 text-white/80 hover:text-white font-black italic text-xs uppercase py-2 py-3 rounded-xl transition-all border border-white/10 cursor-pointer"
                >
                  No, quedar-me
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIÀLEG FLOTANT MODAL DE NOTIFICACIONS OFICIALS (ESTIL SMARTPHONE DIGITAL) */}
      {modalNotificacionsObert && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-end sm:items-center justify-center px-4 py-6 transition-all duration-300">
          <div className="bg-[#00274d] border border-blue-900/40 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            
            {/* Capçalera del modal mòbil d'alertes */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/20">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FFDF00] animate-pulse" />
                <h3 className="text-white font-black italic text-sm uppercase tracking-wider">
                  Notificacions Actives
                </h3>
                <span className="bg-[#FFDF00]/20 text-[#FFDF00] text-[9px] px-1.5 py-0.5 rounded-full font-black">
                  {numNotificacions} Noves
                </span>
              </div>
              
              <button 
                onClick={() => setModalNotificacionsObert(false)}
                className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Banner informatiu per activar permisos de notificacions directament des del mòbil */}
            {permisNotificacio !== "granted" && (
              <div className="bg-gradient-to-r from-red-950/40 to-blue-950/40 p-4 border-b border-red-500/20 flex flex-col gap-2 shrink-0">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-[10px] text-white/95 font-medium leading-relaxed">
                    🔔 <span className="font-bold text-red-400">Atenció:</span> No tens actives les notificacions de la pantalla d'inici! Rebràs els avisos només visualment quan estiguis navegant.
                  </p>
                </div>
                <button
                  onClick={demanarPermisNotificacions}
                  className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400 text-[10px] font-black uppercase py-2 px-3 rounded-xl transition-all self-center flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
                >
                  <BellRing className="w-3 h-3" />
                  Activar Notificacions Mòbils
                </button>
              </div>
            )}
            
            {/* Botó d'accés ràpid per llegir-les totes plegades */}
            {numNotificacions > 0 && (
              <div className="px-5 py-2.5 bg-black/10 border-b border-white/5 flex justify-end shrink-0">
                <button
                  onClick={marcarTotesComALlegides}
                  className="text-[9px] font-black text-amber-400 hover:text-amber-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Llegir-ne totes
                </button>
              </div>
            )}
            
            {/* Llistat scrollable de notificacions */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ WebkitOverflowScrolling: "touch" }}>
              {notificacions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="bg-white/5 p-3 rounded-full mb-2">
                    <Bell className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                    Sense novetats encara
                  </p>
                  <p className="text-white/30 text-[9px] mt-1 max-w-xs leading-relaxed px-4">
                    Estàs al corrent de tot! Durant les classes o simulacres rebràs notificacions immediates.
                  </p>
                </div>
              ) : (
                notificacions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => alternarNotificacioLlegida(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer relative ${
                      item.llegida
                        ? "bg-white/2 border-white/5 text-white/40 opacity-70"
                        : "bg-white/5 border-blue-400/20 text-white shadow-md shadow-blue-950/20"
                    }`}
                  >
                    {/* Indicador vermell de novetat sense lletra */}
                    {!item.llegida && (
                      <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
                    )}
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-[11px] font-black tracking-wide leading-snug flex-1 ${item.llegida ? "text-white/50" : "text-amber-300"}`}>
                          {item.titol}
                        </h4>
                        <span className="text-[8px] font-mono font-bold text-white/30 uppercase tracking-tight shrink-0 pt-0.5">
                          {item.data}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-white/80 font-normal leading-relaxed text-left">
                        {item.text}
                      </p>
                      
                      {/* Baix de la targeta: Importància detallada en català planer */}
                      <div className="flex justify-end pt-1">
                        {!item.llegida && item.importancia === "molt" && (
                          <span className="bg-red-650 text-white font-black text-[7px] py-0.5 px-2 rounded-full uppercase tracking-wider select-none shadow-[0_0_6px_rgba(220,38,38,0.3)]">
                            molt important
                          </span>
                        )}
                        {!item.llegida && item.importancia === "important" && (
                          <span className="bg-orange-500 text-white font-black text-[7px] py-0.5 px-2 rounded-full uppercase tracking-wider select-none shadow-[0_0_6px_rgba(249,115,22,0.3)]">
                            important
                          </span>
                        )}
                        {!item.llegida && item.importancia === "poc" && (
                          <span className="bg-[#b3f202] text-slate-950 font-black text-[7px] py-0.5 px-2 rounded-full uppercase tracking-wider select-none">
                            poc important
                          </span>
                        )}
                        {item.llegida && (
                          <span className="bg-white/5 border border-white/10 text-white/35 font-black text-[7px] py-0.5 px-1.5 rounded-full uppercase tracking-wider select-none">
                            llegida
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Peu d'acadèmia OposiCAT */}
            <div className="border-t border-white/10 py-3 px-5 flex items-center justify-between text-[7.5px] text-white/30 font-black tracking-widest uppercase shrink-0 bg-black/10">
              <span>OposiCAT Mòbil</span>
              <span>Total: {notificacions.length}</span>
            </div>
            
          </div>
        </div>
      )}

      {/* DIÀLEG MODAL EXPLICATIU PER INSTAL·LAR L'APP D'OPOSICAT A LA TABLET */}
      {modalConsellsInstalacioObert && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-[#00274d] border border-blue-900/50 w-full max-w-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Capçalera del modal */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400 animate-pulse" />
                <h3 className="text-white font-black italic text-xs uppercase tracking-wider">
                  Instal·lació de l'App
                </h3>
              </div>
              <button 
                onClick={() => setModalConsellsInstalacioObert(false)}
                className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de sistema operador (Chrome vs Firefox vs iOS/Apple vs Hermit vs APK) */}
            {/* Explicació per a no-programadors: Hem creat un grid amb botons que canvien el contingut de sota de forma interactiva segons el mètode d'instal·lació preferit. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-black/10 border-b border-white/5 p-1 gap-1">
              <button
                onClick={() => setPestanyaDispositiu("chrome")}
                className={`py-2 text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  pestanyaDispositiu === "chrome"
                    ? "bg-[#b3f202] text-slate-950 shadow-md shadow-[#b3f202]/10"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                🤖 Chrome
              </button>
              <button
                onClick={() => setPestanyaDispositiu("firefox")}
                className={`py-2 text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  pestanyaDispositiu === "firefox"
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/10"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                🔥 Firefox
              </button>
              <button
                onClick={() => setPestanyaDispositiu("ios")}
                className={`py-2 text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  pestanyaDispositiu === "ios"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                🍎 iPad / Safari
              </button>
              <button
                onClick={() => setPestanyaDispositiu("hermit")}
                className={`py-2 text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  pestanyaDispositiu === "hermit"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/10"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                🐚 Hermit
              </button>
              <button
                onClick={() => setPestanyaDispositiu("apk")}
                className={`py-2 text-[8px] md:text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  pestanyaDispositiu === "apk"
                    ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/10 animate-pulse"
                    : "text-fuchsia-400 hover:text-fuchsia-300 hover:bg-white/5"
                }`}
              >
                📦 APK Directe
              </button>
            </div>

            {/* Contingut explicatiu en llenguatge planer */}
            <div className="p-5 overflow-y-auto space-y-3.5 max-h-[60vh] text-left leading-normal">
              
              {pestanyaDispositiu === "chrome" && (
                <div className="space-y-3">
                  <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded-xl">
                    <p className="text-amber-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                      ⚠️ COM EVITAR UN ACCÉS AMB LOGO DE CHROME:
                    </p>
                    <p className="text-[9px] text-white/80 mt-1">
                      No pateixis! A les tauletes Samsung / Android, Chrome mostra <span className="text-amber-300 font-semibold">"Añadir a pantalla de inicio"</span> (el botó que has emmarcat en vermell!) en lloc de "Instal·la". Segueix aquests passos per obrir-la del tot sense barres:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <div className="bg-[#b3f202] text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        1
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Prem el botó <span className="text-amber-300 font-extrabold uppercase">"Añadir a pantalla de inicio"</span> que tens assenyalat al menú lateral de Chrome.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-[#b3f202] text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        2
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Et sortirà una finestreta confirmant el títol <span className="font-bold">OposiCAT</span>. Prem <span className="text-emerald-400 font-bold uppercase">"Añadir"</span> (o "Instalar").
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-[#b3f202] text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        3
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        <span className="text-[#b3f202] font-semibold">Molt important:</span> Espera uns <span className="text-[#b3f202] font-semibold">30 segons</span> sense tancar Chrome de fons. La tauleta s'està descarregant el nostre motor segur asíncron (Service Worker).
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-[#b3f202] text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        4
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Ves a l'escriptori del dispositiu, tanca totes les pestanyes de Chrome i obre la nova icona d'OposiCAT creada. <span className="text-emerald-300 font-extrabold">Ja t'arrencarà a pantalla completa sense cap barra!</span> Si per algun motiu encara veus la barra de dalt, reinicia la tablet un cop i ja quedarà fixat per sempre.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pestanyaDispositiu === "firefox" && (
                <div className="space-y-3">
                  <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl">
                    <p className="text-orange-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                      🔥 INSTAL·LACIÓ SUPER SEGURA AMB FIREFOX:
                    </p>
                    <p className="text-[9px] text-white/80 mt-1">
                      Firefox utilitza un motor propi de llançament a Android que es salta els controls lents de Chrome. És extremadament fiable! Segueix aquests senzills passos:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <div className="bg-orange-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        1
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Obre l'aplicació <span className="text-orange-300 font-semibold">Firefox</span> que acabes d'instal·lar i accedeix a la web d'OposiCAT.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-orange-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        2
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Mira la barra on s'escriu la direcció web (URL) a dalt de tot. Hi veuràs una <span className="text-amber-300 font-semibold">icona en forma de caseta o mòbil amb un signe de suma (+)</span> a dins o al costat.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-orange-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        3
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Si no la trobes a la barra, prem els <span className="text-orange-300 font-semibold">tres punts verticals (⋮)</span> de Firefox per obrir el menú principal.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-orange-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        4
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Prem directament l'opció que diu <span className="text-emerald-400 font-bold uppercase">"+ Instalar"</span> (o "Instal·lar l'aplicació").
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-orange-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        5
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Firefox et demanarà si vols afegir l'icona automàticament. Prem <span className="text-emerald-400 font-bold uppercase">"Añadir"</span>. Tanca Firefox, obre l'icona nova a l'escriptori i llest! Tindràs OposiCAT a <span className="text-emerald-300 font-black">pantalla completa lliure de qualsevol tipus de barra de navegació.</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pestanyaDispositiu === "ios" && (
                <div className="space-y-3">
                  <div className="bg-blue-400/10 border border-blue-400/20 p-3 rounded-xl">
                    <p className="text-blue-300 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                      💡 PER A DISPOSITIUS IPAD D'APPLE SAFARI:
                    </p>
                    <p className="text-[9px] text-white/80 mt-1">
                      iOS té una manera pròpia de descarregar aplicacions lliures en segon pla. Segueix el camí següent en 2 clics natius:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <div className="bg-[#b3f202] text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        1
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Assegura't de carregar la web d'OposiCAT exclusivament utilitzant el navegador <span className="text-blue-300 font-semibold">Safari</span>.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-[#b3f202] text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        2
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Prem el botó de <span className="text-amber-300 font-semibold">Compartir</span> de Safari (icona quadrat amb fletxa cap amunt, a la part superior de la tablet).
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-[#b3f202] text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        3
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Desplaça't cap avall i selecciona l'opció <span className="text-emerald-400 font-bold uppercase">"Afegeix a la pantalla d'inici"</span>. Ara l'App d'estudi arrancarà a pantalla completa a tot color i sense cap barra que molesti!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {pestanyaDispositiu === "hermit" && (
                <div className="space-y-3">
                  <div className="bg-violet-500/10 border border-violet-500/20 p-3 rounded-xl">
                    <p className="text-violet-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                      🐚 L'OPCIÓ DEFINITIVA: CREAR UNA APP NATIVA DE VERITAT AMB HERMIT
                    </p>
                    <p className="text-[9px] text-white/80 mt-1">
                      Si el sistema de Google té problemes a la teva tablet, Hermit és la solució de programari ideal. Permet empaquetar OposiCAT com una aplicació nativa completament aïllada, super ràpida i sense cap barra.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <div className="bg-violet-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        1
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Descarrega i obre l'aplicació gratuïta <span className="text-violet-300 font-bold">Hermit</span> des de l'Android Play Store.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-violet-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        2
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Prem el botó gran de <span className="text-[#b3f202] font-semibold">crear una aplicació flotant (+)</span> o escriu directament a la seva barra de navegació.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-violet-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        3
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Escriu la següent direcció web exacta d'OposiCAT: <br />
                        <span className="text-emerald-300 font-mono select-all bg-black/30 px-1 py-0.5 rounded text-[8px] block mt-1 break-all">
                          https://ais-pre-mwrzvnpp3gwteykk5wyjc4-602327047220.europe-west2.run.app
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-violet-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        4
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Quan s'hagi carregat la pàgina d'inici, prem <span className="text-emerald-300 font-black uppercase">"Crear Lite App"</span> (sol sortir automàticament o a la barra lateral / menú de configuració de carret d'Hermit).
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-violet-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        5
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        Hermit t'oferirà posar el nom de <span className="font-bold">OposiCAT</span>. Confirma-ho i selecciona <span className="text-[#b3f202] font-bold">"Añadir"</span> per col·locar la drecera directa a l'escriptori de la tablet.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-violet-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 select-none">
                        6
                      </div>
                      <p className="text-[9px] text-white/85 leading-relaxed">
                        <span className="text-emerald-400 font-extrabold">Fet!</span> Ja pots sortir, tancar-ho tot i obrir l'icona nova d'OposiCAT. S'obrirà automàticament com una aplicació perfectament independent, a pantalla completa i sense cap barra que et molesti per estudiar i fer testos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Explicació per a no-programadors: Aquesta pestanya dóna la solució definitiva quan la tablet o el navegador fan el ruc. Expliquem com donar un fitxer .APK directe als usuaris. */}
              {pestanyaDispositiu === "apk" && (
                <div className="space-y-3">
                  <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 p-3 rounded-xl">
                    <p className="text-fuchsia-400 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 animate-pulse">
                      📦 SOLUCIÓ 100% DEFINITIVA: INSTAL·LAR EL FITXER APK DIRECTAMENT
                    </p>
                    <p className="text-[9px] text-white/80 mt-1">
                      Si esteu tips dels problemes dels navegadors mòbils, la millor manera de provar l'aplicació amb la gent de forma lògica és distribuir un format d'**APK Directe (instal·lador d'Android)**. Com que l'aplicació és una PWA, està preparada per convertir-se en un instal·lador Android natiu de veritat molt ràpidament.
                    </p>
                  </div>

                  <div className="space-y-3 text-[9px] text-white/85 leading-relaxed">
                    <div className="bg-black/25 p-3 rounded-xl border border-white/5 space-y-1.5">
                      <p className="font-bold text-fuchsia-300">⚡ Com aconseguir el teu fitxer APK en 1 minut per passar a tothom i oblidar-se de problemes:</p>
                      <ol className="list-decimal list-inside space-y-1 text-white/80">
                        <li>Accedeix des d'un ordinador a la utilitat gratuïta i oficial de Microsoft: <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-[#b3f202] underline font-bold">www.pwabuilder.com</a></li>
                        <li>Enganxa l'adreça web compartida del teu OposiCAT: <span className="text-pink-300 font-mono break-all text-[8px] bg-black/40 px-1 py-0.5 rounded">https://ais-pre-mwrzvnpp3gwteykk5wyjc4-602327047220.europe-west2.run.app</span></li>
                        <li>Prem el botó <span className="font-bold">"Start"</span> o d'anàlisi de PWA.</li>
                        <li>A l'apartat d'Android, clica a <span className="text-emerald-300 font-black">"Package for Store"</span> o <span className="text-emerald-300 font-black">"Download APK"</span> per descarregar un fitxer ZIP amb el fiter <span className="font-mono text-fuchsia-400">.apk</span> comprimit a dins.</li>
                        <li>
                          Posa aquest fitxer <span className="font-bold">.apk</span> a un grup de WhatsApp, a un Google Drive compartit o envia'l per correu-e. Qualsevol alumne el podrà descarregar a la tablet, obrir-lo i quedarà instal·lada com a aplicació nativa <strong>instantàniament</strong>!
                        </li>
                      </ol>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                      <p className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider">
                        💡 CONSELL D'ACOMPANYAMENT ARQUITECTÒNIC "A FUTUR":
                      </p>
                      <p className="text-white/80 mt-1">
                        Instal·lar l'aplicació en format fitxer APK és el mètode més recomanable per a fer grups focals de proves. No cal penjar l'App a la Play Store de Google si només esteu fent simulacions prèvies. El fitxer APK és directament instal·lable a qualsevol tauleta Android habilitant l'opció "Fonts desconegudes" que sol preguntar automàticament el sistema operatiu de la tablet en obrir el fitxer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-950/40 p-3 rounded-xl text-[8px] text-white/45 leading-relaxed border border-white/5">
                🔒 <span>La seguretat de l'escola de Mossos garanteix que, un cop instal·lada per qualsevol d'aquests mètodes d'alta gamma de PWA, les teves dades d'estudiants i simulacres d'examen s'autoguardaran.</span>
              </div>

            </div>

            {/* Acció footer de tancament */}
            <div className="px-5 py-4 border-t border-white/10 bg-black/25 flex">
              <button
                onClick={() => setModalConsellsInstalacioObert(false)}
                className="w-full bg-[#b3f202] hover:bg-[#a1d902] text-slate-950 text-[9px] font-black uppercase py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg tracking-tight"
              >
                Tancar assistent 🎓
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DEL FÒRUM DE L'OPOSICIÓ (INTERACTIU I MULTI-CANAL) */}
      {modalForumObert && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center px-4 py-6 transition-all duration-300">
          <div className="bg-[#0b1e36] border border-pink-500/30 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Capçalera del Fòrum */}
            <div className="px-5 py-4 border-b border-pink-500/20 flex items-center justify-between shrink-0 bg-black/30">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pink-400 animate-pulse" />
                <h3 className="text-white font-black italic text-sm uppercase tracking-wider">
                  Fòrum de l'Oposició
                </h3>
                <span className="bg-pink-500/20 text-pink-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {forumChatroomId ? "Xat Actiu" : "Canals"}
                </span>
              </div>
              
              <button 
                onClick={() => {
                  if (forumChatroomId) {
                    setForumChatroomId(null); // torna als canals
                  } else {
                    setModalForumObert(false);
                  }
                }}
                className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                {forumChatroomId ? <ChevronLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            </div>

            {/* Contingut principal del Fòrum */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>
              
              {!forumChatroomId ? (
                /* VISTA Principal: Llistat de Canals/Xats i informació */
                <div className="space-y-4">
                  {/* Descripció del fòrum sol·licitada exactament per l'usuari */}
                  <div className="bg-pink-950/20 border border-pink-500/10 p-4 rounded-2xl text-left shadow-inner">
                    <p className="text-xs text-white/90 leading-relaxed font-semibold">
                      Xateja amb altres companys i companyes sobre temes d'interès relacionats amb l'oposició, l'estudi, els entrenaments o la mateixa APP. Compartiu experiències, resoleu dubtes, ajudeu-vos mútuament i quedeu per estudiar o entrenar junts per assolir el vostre objectiu!
                    </p>
                  </div>

                  {/* Secció canals preestablerts */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-pink-400 font-extrabold uppercase tracking-wider text-left pl-1">
                      Canals de debat actius
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { nom: "Xat general", desc: "Debat obert general" },
                        { nom: "Xat prova teòrica", desc: "Dubtes de temari i exàmens" },
                        { nom: "Xat prova física", desc: "Navette, circuit i l'agilitat" },
                        { nom: "Xat prova psicològica", desc: "Tests psicotècnics i personalitat" },
                        { nom: "Estudiem junts", desc: "Grups d'estudi i biblioteques" },
                        { nom: "Entrenem junts", desc: "Quedades per córrer i gimnasos" }
                      ].map((ch) => (
                        <button
                          key={ch.nom}
                          onClick={() => setForumChatroomId(ch.nom)}
                          className="bg-white/5 hover:bg-pink-500/10 border border-white/5 hover:border-pink-500/20 rounded-2xl p-3 flex flex-col text-left transition-all active:scale-95 cursor-pointer group"
                        >
                          <div className="flex items-center gap-1.5 font-sans">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shrink-0" />
                            <span className="text-white font-extrabold text-xs group-hover:text-pink-300 transition-colors">
                              {ch.nom}
                            </span>
                          </div>
                          <span className="text-[9px] text-white/40 mt-1 leading-normal font-medium font-sans">
                            {ch.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FÒRUMS CREATS PEL PROPI ESTUDIANT */}
                  {forumsCreats.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider text-left pl-1">
                        Els teus fòrums ràpids
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {forumsCreats.map((f, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              // inicialitza el canal buit si no existís mai
                              if (!missatgesPorCanal[f.nom]) {
                                setMissatgesPorCanal(prev => ({
                                  ...prev,
                                  [f.nom]: [
                                    { id: 999, nom: "Sistema d'OposiCAT", text: `Fòrum personalitzat "${f.nom}" creat correctament sobre: ${f.desc}. Comença la conversa!`, hora: "Ara" }
                                  ]
                                }));
                              }
                              setForumChatroomId(f.nom);
                            }}
                            className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 rounded-2xl p-3 flex flex-col text-left transition-all active:scale-95 cursor-pointer group"
                          >
                            <div className="flex items-center gap-1.5 font-sans">
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                              <span className="text-white font-bold text-xs group-hover:text-amber-300 transition-colors">
                                {f.nom}
                              </span>
                            </div>
                            <span className="text-[9px] text-white/40 mt-1 leading-normal font-medium font-sans">
                              {f.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Petita separació sol·licitada */}
                  <div className="py-2 border-t border-white/10 flex items-center justify-center">
                    <div className="h-px bg-white/5 flex-grow" />
                  </div>

                  {/* Opció per crear fòrum personalitzat */}
                  {!mostrarCreacioForum ? (
                    <button
                      onClick={() => setMostrarCreacioForum(true)}
                      className="w-full py-3 bg-gradient-to-r from-pink-600/30 to-purple-600/20 hover:from-pink-600/40 hover:to-purple-600/30 border border-pink-500/30 hover:border-pink-500/40 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4 text-pink-400" />
                      Crea un fòrum personalitzat
                    </button>
                  ) : (
                    /* Formulari interactiu per crear un fòrum personalitzat */
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-3 text-left">
                      <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">
                        🛡️ Nou fòrum de debat
                      </p>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] text-white/50 font-bold uppercase">Nom de la comunitat o tema</label>
                        <input
                          type="text"
                          value={forumPersonalitzatNom}
                          onChange={(e) => setForumPersonalitzatNom(e.target.value)}
                          placeholder="Ex. Quedada Girona, Dubtes de Psicotècnics"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:border-pink-500/50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-white/50 font-bold uppercase">Breu descripció</label>
                        <input
                          type="text"
                          value={forumPersonalitzatDesc}
                          onChange={(e) => setForumPersonalitzatDesc(e.target.value)}
                          placeholder="Ex. Per debatre on entrenar a Girona o resoldre dubtes d'actualitat"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:border-pink-500/50"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMostrarCreacioForum(false);
                            setForumPersonalitzatNom("");
                            setForumPersonalitzatDesc("");
                          }}
                          className="flex-1 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-center text-[10px] text-white/60 font-bold uppercase transition-all cursor-pointer"
                        >
                          Cancel·lar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!forumPersonalitzatNom.trim()) return;
                            const nouT = {
                              nom: forumPersonalitzatNom,
                              desc: forumPersonalitzatDesc || "Fòrum creat per un alumne actiu de la convocatòria."
                            };
                            setForumsCreats([...forumsCreats, nouT]);
                            setMostrarCreacioForum(false);
                            setForumPersonalitzatNom("");
                            setForumPersonalitzatDesc("");
                          }}
                          className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 rounded-xl text-center text-[10px] text-white font-bold uppercase transition-all cursor-pointer"
                        >
                          Crear fòrum ✅
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* VISTA Secundària: Finestra de xat actiu per al canal seleccionat */
                <div className="flex flex-col h-full space-y-3 font-sans">
                  <div className="bg-pink-950/20 border border-pink-500/10 p-3 rounded-xl flex items-center justify-between font-sans">
                    <div>
                      <p className="text-xs font-black text-pink-300 uppercase shrink-0">
                        💬 #{forumChatroomId}
                      </p>
                      <p className="text-[9px] text-white/50 font-semibold text-left">
                        Debat lliure en temps real entre els alumnes d'OposiCAT.
                      </p>
                    </div>
                    <button
                      onClick={() => setForumChatroomId(null)}
                      className="text-[9px] font-bold text-pink-400 bg-pink-500/10 px-2 py-1 rounded-lg shrink-0 hover:bg-pink-500/20 cursor-pointer"
                    >
                      Canviar canal
                    </button>
                  </div>

                  {/* Llista dels missatges de la conversa sota scroll actiu */}
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] min-h-[160px] pr-1 py-2" style={{ WebkitOverflowScrolling: "touch" }}>
                    {(missatgesPorCanal[forumChatroomId] || []).map((m: any) => (
                      <div key={m.id} className="flex flex-col gap-1 text-left font-sans animate-fade-in">
                        <div className="flex items-center gap-1.5 justify-start font-sans">
                          <span className="text-[9px] font-mono text-pink-300 font-extrabold uppercase px-1.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                            {m.nom}
                          </span>
                          <span className="text-[8px] text-white/30 font-mono">{m.hora}</span>
                        </div>
                        <p className="text-xs text-white/90 bg-white/5 border border-white/5 px-3 py-2 rounded-2xl ml-1 leading-relaxed">
                          {m.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Formulari per col·locar nous comentaris al fòrum */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!nouMissatgeForumText.trim()) return;
                      const nomDeVeritat = usuariActiu?.displayName || "Tu (Opositor)";
                      const nouM = {
                        id: Date.now(),
                        nom: nomDeVeritat,
                        text: nouMissatgeForumText,
                        hora: new Date().toLocaleTimeString("ca-ES", { hour: "2-digit", minute: "2-digit" })
                      };

                      // guardem el missatge al canal corresponent en memòria reactiva d'OposiCAT
                      setMissatgesPorCanal(prev => ({
                        ...prev,
                        [forumChatroomId]: [...(prev[forumChatroomId] || []), nouM]
                      }));
                      setNouMissatgeForumText("");
                    }}
                    className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5"
                  >
                    <input
                      type="text"
                      value={nouMissatgeForumText}
                      onChange={(e) => setNouMissatgeForumText(e.target.value)}
                      placeholder={`Xateja a #${forumChatroomId}...`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/35 focus:outline-none focus:border-pink-500/50"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-pink-600 hover:bg-pink-500 rounded-xl transition-all cursor-pointer text-white active:scale-95 shadow-md shadow-pink-600/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

            </div>

            {/* Acció footer de tancament del fòrum */}
            <div className="px-5 py-4 border-t border-white/10 bg-black/35 flex gap-2">
              {forumChatroomId && (
                <button
                  onClick={() => setForumChatroomId(null)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer"
                >
                  ◀ Canals
                </button>
              )}
              <button
                onClick={() => setModalForumObert(false)}
                className="flex-2 bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-black uppercase py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg tracking-tight w-full"
              >
                Tancar fòrum 💬
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE L'AVATAR DE MOSSO/A GAMIFICAT (PERSONALITZACIÓ I DESBOCUEIGS) */}
      {modalAvatarObert && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-end sm:items-center justify-center px-4 py-6 transition-all duration-300">
          <div className="bg-[#0b1e36] border border-blue-500/30 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Capçalera del Personalitzador */}
            <div className="px-5 py-4 border-b border-blue-500/20 flex items-center justify-between shrink-0 bg-black/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-white font-black italic text-sm uppercase tracking-wider">
                  Configura el teu Avatar 👮‍♂️
                </h3>
                <span className="bg-blue-500/20 text-blue-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
                  Gamificació
                </span>
              </div>
              <button 
                onClick={() => setModalAvatarObert(false)}
                className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Area de contingut scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ WebkitOverflowScrolling: "touch" }}>
              
              {/* VISTA PRÈVIA DE L'AVATAR (Targeta identificativa oficial) */}
              <div className="flex flex-col items-center">
                <div className={`w-36 h-36 rounded-full ${avatarFons} relative flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.4)] border-4 border-slate-700/50 transition-all duration-300 overflow-hidden`}>
                  
                  {/* Fons interactiu decoratiu d'estrelles d'èxit */}
                  <span className="absolute top-2 left-3 text-xs opacity-40 select-none">⭐</span>
                  <span className="absolute bottom-3 right-4 text-xs opacity-30 select-none">⭐</span>
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none" />

                  {/* Capes dinàmiques de l'Avatar amb Emojis alineats de manera física i realista tipus Lego */}
                  <div className="relative flex items-center justify-center h-full w-full select-none">
                    
                    {/* Capa 1: Cap de l'Estudiant (Base de l'avatar) */}
                    <span className="text-[5rem] leading-none z-10 transition-transform duration-300 transform scale-110 mt-1">
                      {avatarEstil}
                    </span>

                    {/* Capa 2: Gorra o Casquet seleccionat superposat a dalt del cap exactament a sobre del front */}
                    {avatarGorra !== "❌" && (
                      <span className="absolute top-2 text-[3rem] leading-none z-30 transition-all duration-300 transform -translate-y-2 select-none filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] animate-pulse">
                        {avatarGorra}
                      </span>
                    )}

                    {/* Capa 3: Uniforme d'opositor a sota tapant la base de la cara per a una transició suau */}
                    <span className="absolute bottom-1.5 text-[2.8rem] leading-none z-20 transition-all duration-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      {avatarUniforme}
                    </span>

                    {/* Capa 4: Accessori de servei / recolzament d'estudi a la cantonada inferior dreta */}
                    {avatarAccessori !== "❌" && (
                      <span className="absolute bottom-3 right-3 text-[2.2rem] leading-none z-40 transition-all duration-300 animate-bounce text-right filter drop-shadow-[0_4px_5px_rgba(0,0,0,0.5)]">
                        {avatarAccessori}
                      </span>
                    )}

                  </div>
                </div>

                {/* Subtítol de la targeta */}
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-3 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  Fons: <span className="text-blue-300">{avatarFonsNom}</span>
                </p>
              </div>

              {/* OPCIONS DE PERSONALITZACIÓ */}
              <div className="space-y-4 font-sans text-left">
                
                {/* 1. SELECCIÓ BASE (MOSSO O MOSSA) O CARA SENCERA NETE */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block">1. Selecciona el teu Personatge Base (Sense dobles gorres) :</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { emoji: "👨", nom: "Opositor Campió" },
                      { emoji: "👩", nom: "Opositora Campiona" },
                      { emoji: "🧑", nom: "Mosso Neutral" },
                      { emoji: "😎", nom: "Detectiu d'Incògnit" }
                    ].map((item) => (
                      <button
                        key={item.emoji}
                        onClick={() => {
                          setAvatarEstil(item.emoji);
                          localStorage.setItem("avatar_estil", item.emoji);
                          // Providenciem un guardat a Firestore opcionalment si està autenticat
                          const user = auth.currentUser;
                          if (user) {
                            setDoc(doc(db, "usuari_personalitzacions", user.uid), {
                              avatarEstil: item.emoji
                            }, { merge: true }).catch(() => {});
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs cursor-pointer active:scale-95 ${
                          avatarEstil === item.emoji 
                            ? "bg-blue-600/30 border-blue-400 text-white font-extrabold" 
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="truncate">{item.nom}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. GORRES I DETALLS DE CAP */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block">2. Gorra / Casquet de servei (Superposat dalt):</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { emoji: "🧢", nom: "Gorra oficial" },
                      { emoji: "💂‍♀️", nom: "Boina ARRO" },
                      { emoji: "⛑️", nom: "Casc Brimo" },
                      { emoji: "❌", nom: "Sense gorra" }
                    ].map((item) => (
                      <button
                        key={item.emoji}
                        onClick={() => {
                          setAvatarGorra(item.emoji);
                          localStorage.setItem("avatar_gorra", item.emoji);
                          const user = auth.currentUser;
                          if (user) {
                            setDoc(doc(db, "usuari_personalitzacions", user.uid), {
                              avatarGorra: item.emoji
                            }, { merge: true }).catch(() => {});
                          }
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-[10px] cursor-pointer active:scale-95 ${
                          avatarGorra === item.emoji 
                            ? "bg-blue-600/30 border-blue-400 text-white font-black" 
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="truncate font-medium text-[8px]">{item.nom}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. UNIFORME DE COMPROMÍS */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block">3. Uniformitat Oficial :</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { emoji: "👔", nom: "Servei actiu" },
                      { emoji: "🧥", nom: "Gala policial" },
                      { emoji: "🦺", nom: "Seguretat" },
                      { emoji: "🎽", nom: "Esport física" }
                    ].map((item) => (
                      <button
                        key={item.emoji}
                        onClick={() => {
                          setAvatarUniforme(item.emoji);
                          localStorage.setItem("avatar_uniforme", item.emoji);
                          const user = auth.currentUser;
                          if (user) {
                            setDoc(doc(db, "usuari_personalitzacions", user.uid), {
                              avatarUniforme: item.emoji
                            }, { merge: true }).catch(() => {});
                          }
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-[10px] cursor-pointer active:scale-95 ${
                          avatarUniforme === item.emoji 
                            ? "bg-blue-600/30 border-blue-400 text-white font-black" 
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="truncate font-medium text-[8px]">{item.nom}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. ACCESSORI DIVERTIT */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block">4. Accessori d'Estudiant o Patrulla :</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { emoji: "📢", nom: "Megàfon" },
                      { emoji: "🍩", nom: "Dònut" },
                      { emoji: "☕", nom: "Cafè" },
                      { emoji: "🕶️", nom: "Ulleres" },
                      { emoji: "❌", nom: "Cap" }
                    ].map((item) => (
                      <button
                        key={item.emoji}
                        onClick={() => {
                          setAvatarAccessori(item.emoji);
                          localStorage.setItem("avatar_accessori", item.emoji);
                          const user = auth.currentUser;
                          if (user) {
                            setDoc(doc(db, "usuari_personalitzacions", user.uid), {
                              avatarAccessori: item.emoji
                            }, { merge: true }).catch(() => {});
                          }
                        }}
                        className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all text-[8px] cursor-pointer active:scale-95 ${
                          avatarAccessori === item.emoji 
                            ? "bg-blue-600/30 border-blue-400 text-white font-black" 
                            : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-lg">{item.emoji}</span>
                        <span className="truncate max-w-[45px] text-[7px]">{item.nom}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. FONTS DE PROTECCIÓ (AMBIENTS) */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-widest block">5. Districte de Destí (Fons de la targeta) :</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { bg: "bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950", nom: "Blau OposiCAT", id: "oposicat" },
                      { bg: "bg-gradient-to-br from-slate-800 to-slate-900", nom: "Comissaria Local", id: "comissaria" },
                      { bg: "bg-gradient-to-br from-red-950 to-[#220701]", nom: "Pista de Navette", id: "navette" },
                      { bg: "bg-gradient-to-br from-[#0c1020] via-blue-950 to-emerald-950", nom: "Patrulla Urbana", id: "urbana" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setAvatarFons(item.bg);
                          setAvatarFonsNom(item.nom);
                          localStorage.setItem("avatar_fons", item.bg);
                          localStorage.setItem("avatar_fons_nom", item.nom);
                          const user = auth.currentUser;
                          if (user) {
                            setDoc(doc(db, "usuari_personalitzacions", user.uid), {
                              avatarFons: item.bg,
                              avatarFonsNom: item.nom
                            }, { merge: true }).catch(() => {});
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all text-xs cursor-pointer active:scale-95 ${
                          avatarFons === item.bg 
                            ? "bg-blue-600/30 border-blue-400 text-white font-extrabold" 
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${item.bg} border border-white/20 shrink-0`} />
                        <span className="truncate">{item.nom}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Acció footer de tancament i celebració del canvi */}
            <div className="px-5 py-4 border-t border-white/10 bg-black/35 flex">
              <button
                onClick={() => setModalAvatarObert(false)}
                className="w-full bg-[#b3f202] hover:bg-[#a1d902] text-slate-950 text-[10px] font-black uppercase py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg tracking-tight flex items-center justify-center gap-1.5"
              >
                Guarda el teu estil de Mosso 👮‍♂️💼
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Comentari planer per a no-programadors: Pantalla modal que acompanya pas a pas l'aspirant a instal·lar l'aplicació web oficial directament com una aplicació real als seus dispositius iOS o Android */}
      {modalInstallarObert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#010915]/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#03122c] border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] my-auto animate-in fade-in zoom-in duration-200">
            
            {/* Capçalera del manual */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-black italic text-sm uppercase tracking-wider">
                  Guia d'Instal·lació
                </span>
              </div>
              <button 
                onClick={() => setModalInstallarObert(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              
              {/* Presentació visual tipus targeta de prestigi */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-[1.3rem] bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-3xl mx-auto shadow-inner mb-3">
                  👮‍♀️
                </div>
                <h3 className="text-xl font-black italic tracking-tight text-white uppercase">
                  OposiCAT al teu mòbil
                </h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans mt-1">
                  Gaudeix d'una experiència sense barres de cerca, llançament a l'instant i totalment immersiva com si fos una App nativa.
                </p>
              </div>

              {/* Selector de plataforma tipus bento-tabs */}
              <div className="grid grid-cols-2 gap-2 bg-black/35 p-1 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setPestanyaInstallacio('ios')}
                  className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                    pestanyaInstallacio === 'ios'
                      ? "bg-white/10 text-white font-extrabold shadow-md border border-white/10"
                      : "text-white/60 hover:text-white/80 font-semibold"
                  }`}
                >
                  <Apple className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider italic">Apple iOS</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPestanyaInstallacio('android')}
                  className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                    pestanyaInstallacio === 'android'
                      ? "bg-white/10 text-white font-extrabold shadow-md border border-white/10"
                      : "text-white/60 hover:text-white/80 font-semibold"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider italic">Android</span>
                </button>
              </div>

              {/* Llista ordenada de passes segons la plataforma triada */}
              {pestanyaInstallacio === 'ios' ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl">
                    <p className="text-[11px] text-yellow-300 font-semibold leading-relaxed">
                      ⚠️ <strong>Atenció:</strong> A Apple iOS s'ha d'utilitzar obligatòriament el navegador oficial <strong>Safari</strong> de l'iPhone o iPad per poder instal·lar-la.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { pas: 1, text: "Obre aquesta web utilitzant el navegador natiu de l'iPhone: <strong>Safari</strong>." },
                      { pas: 2, text: "Prem el botó de <strong>Compartir</strong> <span class='text-lg'>📤</span> (el quadrat amb la fletxa cap amunt situat a la barra de sota)." },
                      { pas: 3, text: "Desplaça't cap avall i tria l'opció <strong>\"Afegir a la pantalla d'inici\"</strong> (<em>Add to Home Screen</em>)." },
                      { pas: 4, text: "Prem <strong>\"Afegir\"</strong> a la part superior dreta." }
                    ].map((step) => (
                      <div key={step.pas} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 text-[10px] font-black flex items-center justify-center shrink-0 border border-red-500/10">
                          {step.pas}
                        </span>
                        <p className="text-xs text-white/80 font-medium font-sans leading-relaxed pt-0.5" dangerouslySetInnerHTML={{ __html: step.text }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <p className="text-[11px] text-indigo-300 font-semibold leading-relaxed">
                      💡 <strong>Consell:</strong> A Android és millor utilitzar el navegador <strong>Google Chrome</strong> per obrir el lloc web.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {[
                      { pas: 1, text: "Obre aquesta pàgina web mitjançant el navegador <strong>Google Chrome</strong>." },
                      { pas: 2, text: "Prem la icona de <strong>tres punts verticalls</strong> situats a la cantonada superior dreta de Chrome." },
                      { pas: 3, text: "Prem a <strong>\"Instal·lar aplicació\"</strong> o en el seu defecte <strong>\"Afegeix a la pantalla d'inici\"</strong>." },
                      { pas: 4, text: "Accepta la petició compartida. L'escut d'OposiCAT s'instal·larà en segons al teu mòbil!" }
                    ].map((step) => (
                      <div key={step.pas} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 text-[10px] font-black flex items-center justify-center shrink-0 border border-indigo-500/10">
                          {step.pas}
                        </span>
                        <p className="text-xs text-white/80 font-medium font-sans leading-relaxed pt-0.5" dangerouslySetInnerHTML={{ __html: step.text }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Beneficis detallats */}
              <div className="p-4 bg-black/25 border border-white/5 rounded-2xl text-[11px] text-white/50 leading-relaxed font-sans space-y-2">
                <span className="font-bold text-white/70 block uppercase tracking-wider text-[9px]">🎁 Avantatges unificats d'instal·lar l'App:</span>
                <p>• S'obre a l'instant amb el nostre logotip i l’escut dedicat d’OposiCAT.</p>
                <p>• Sense pestanyes que es barregin al navegador, proporcionant total immersió per estudiar.</p>
                <p>• Permet optimitzar al màxim l'ús de la memòria interna del teu dispositiu i estalvia dades mòbils.</p>
              </div>

            </div>

            {/* Peu del modal amb botó de confirmació tancada */}
            <div className="p-5 border-t border-white/10 bg-black/35 flex">
              <button
                onClick={() => setModalInstallarObert(false)}
                className="w-full bg-[#b3f202] hover:bg-[#a1d902] active:scale-[0.98] text-slate-950 font-black italic text-[11px] uppercase py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg tracking-tight flex items-center justify-center gap-1"
              >
                Comprès, llest per instal·lar! 👮‍♀️🚀
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
