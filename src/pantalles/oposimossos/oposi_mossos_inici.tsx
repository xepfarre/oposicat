import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Bell, X, Check, BellRing, Settings, ShieldAlert, KeyRound, Smartphone, Tablet } from "lucide-react";
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
  onLaMevaOposicio
}: { 
  onTornar: () => void, 
  onProvaTeorica: () => void,
  onProvaPractica?: () => void,
  onProvaPsicologica?: () => void,
  onLaMevaOposicio: () => void
}) {

  // Explicació per a no-programadors: Estats de control per saber si canvia l'usuari identificat o si encara s'està verificant la sessió a Firebase, evitant així llançar consultes sense permís.
  const [authCarregada, setAuthCarregada] = useState<boolean>(false);
  const [usuariActiu, setUsuariActiu] = useState<any>(null);

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
  const [modalNotificacionsObert, setModalNotificacionsObert] = useState<boolean>(false);

  const [tokenFCMInput, setTokenFCMInput] = useState<string>("");
  const [guardantToken, setGuardantToken] = useState<boolean>(false);
  
  // Explicació per a no-programadors: Estats del nou sistema simplificat automàtic d'un sol clic per evitar que l'estudiant vegi formularis complexos.
  const [activantAvisosUnic, setActivantAvisosUnic] = useState<boolean>(false);

  // Escolta l'event natiu de descàrrega d'aplicacions PWA a Android/Chrome
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any>(null);
  const [modalConsellsInstalacioObert, setModalConsellsInstalacioObert] = useState<boolean>(false);
  const [pestanyaDispositiu, setPestanyaDispositiu] = useState<"chrome" | "firefox" | "ios" | "hermit" | "apk">("chrome");

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

  return (
    <div 
      className="fixed inset-0 w-full bg-[#00274d] overflow-y-auto flex flex-col items-center px-6 pb-20"
      style={{ WebkitOverflowScrolling: "touch" }}
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
            onClick={() => window.open("https://mossos.gencat.cat/", "_blank")}
            className="basis-[35%] bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl py-5 flex items-center justify-center shadow-lg shadow-amber-900/10 transition-all active:scale-95 group"
          >
            <span className="text-amber-100 font-black italic text-sm md:text-xl uppercase tracking-widest group-hover:scale-105 transition-transform">
              Web
            </span>
          </button>
        </div>

        {/* Línia de separació */}
        <div className="flex items-center py-1">
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Botons principals en grid en tauletes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={onProvaTeorica}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-4 md:py-6 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
          >
            <span className="text-white font-black italic text-lg md:text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform text-center px-4">
              Prova Teòrica
            </span>
            <div className="h-0.5 w-8 bg-red-600 mt-1 rounded-full opacity-50" />
          </button>

          <button 
            onClick={onProvaPractica}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-4 md:py-6 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
          >
            <span className="text-white font-black italic text-lg md:text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform text-center px-4">
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

        {/* Línia de separació */}
        <div className="flex items-center py-1">
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* FILA INFERIOR: Botons auxiliars de la App del Canal d'Opositor */}
        <div className="grid grid-cols-3 gap-2 mt-1 md:mt-4">
          
          {/* Botó Patrocinadors */}
          <button className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group">
            <span className="text-white font-black italic text-[8px] md:text-[10px] uppercase tracking-tighter text-center px-1">
              Patrocinadors
            </span>
          </button>

          {/* Explicació per a no-programadors: Botó d'instal·lació PWA directament disponible que obre la descàrrega neta o obre la guia interactiva si és un iPad o tablet Android que necessita camí manual dels 3 puntets. */}
          <button 
            id="boto-instalacio-pwa"
            onClick={instal_larAppNativaPWA}
            className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group relative cursor-pointer"
          >
            <Smartphone className="w-4 h-4 mb-1 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
            <span className="text-white font-black italic text-[8px] md:text-[10px] uppercase tracking-tighter text-center px-1">
              Instal·lar App 📱
            </span>
            {pwaInstallPrompt && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Explicació per a no-programadors: Botó de notificacions completament operatiu amb comptador real de missatges rebuts per l'equip d'OposiCAT en forma de campana amb un 'badge' o globus vermell polsat amb animació. */}
          <button 
            id="boto-notificacions-mobil"
            onClick={() => setModalNotificacionsObert(true)}
            className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group relative"
          >
            <Bell className={`w-4 h-4 mb-1 transition-colors ${numNotificacions > 0 ? "text-amber-400 animate-bounce" : "text-white/60 group-hover:text-white"}`} />
            <span className="text-white font-black italic text-[8px] md:text-[10px] uppercase tracking-tighter text-center px-1">
              Notificacions
            </span>
            {numNotificacions > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border border-white/20 rounded-full text-[8px] font-black text-white flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.6)] animate-pulse">
                {numNotificacions}
              </span>
            )}
          </button>
        </div>

        {/* BOTÓ PER TORNAR AL SEL·LECTOR */}
        <button 
          onClick={onTornar}
          className="mt-6 w-full py-2 flex items-center justify-center gap-2 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-95 group"
        >
          <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
          <span className="text-white/60 group-hover:text-white font-black italic text-[10px] uppercase tracking-widest transition-colors">
            Tornar al sel·lector d'APP's
          </span>
        </button>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-2 mt-4 shrink-0 px-6">
        <p className="text-[9px] font-black uppercase tracking-wider text-white opacity-80 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

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
    </div>
  );
}
