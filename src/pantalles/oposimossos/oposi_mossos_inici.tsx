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

  // Explicació per a no-programadors: Estats del diàleg flotant per vincular o registrar claus FCM reals de l'Smartphone (iOS o Android) de l'estudiant de forma multipantalla.
  const [modalFCMObert, setModalFCMObert] = useState<boolean>(false);
  const [tokenFCMInput, setTokenFCMInput] = useState<string>("");
  const [guardantToken, setGuardantToken] = useState<boolean>(false);
  
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

  // Carregar els dispositius registrats en obrir-se el configurador FCM de l'alumne
  useEffect(() => {
    if (modalFCMObert && usuariActiu) {
      carregarMeusDispositiusFCM();
    }
  }, [modalFCMObert, usuariActiu]);

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
      alert(`S'ha completat la sol·licitud amb un avís d'entorn: ${err?.message || err}. Com que et trobes en un entorn virtualitzat, recorda que pots introduir o verificar el token també manualment.`);
    } finally {
      setObtinguentToken(false);
    }
  };

  // Calculador ràpid de quantes notificacions estan pendents de llegir per pintar el cercle vermell d'avís
  const numNotificacions = notificacions.filter(n => !n.llegida).length;

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

        {/* FILA INFERIOR: Botons auxiliars de la App */}
        <div className="grid grid-cols-3 gap-2 mt-1 md:mt-4">
          
          {/* Botó Patrocinadors */}
          <button className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 md:py-8 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group">
            <span className="text-white font-black italic text-[8px] md:text-xs uppercase tracking-tighter text-center px-2">
              Patrocinadors
            </span>
          </button>

          {/* Explicació per a no-programadors: Botó de notificacions completament operatiu amb comptador real de missatges rebuts per l'equip d'OposiCAT en forma de campana amb un 'badge' o globus vermell polsat amb animació. */}
          <button 
            id="boto-notificacions-mobil"
            onClick={() => setModalNotificacionsObert(true)}
            className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 md:py-8 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group relative"
          >
            <Bell className={`w-4 h-4 mb-1.5 transition-colors ${numNotificacions > 0 ? "text-amber-400 animate-bounce" : "text-white/60 group-hover:text-white"}`} />
            <span className="text-white font-black italic text-[8px] md:text-xs uppercase tracking-tighter text-center px-2">
              Notificacions
            </span>
            {numNotificacions > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border border-white/20 rounded-full text-[9px] font-black text-white flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.6)] animate-pulse">
                {numNotificacions}
              </span>
            )}
          </button>

          {/* Botó Opcions de Dispositius i Avisos */}
          <button 
            onClick={() => setModalFCMObert(true)}
            className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 md:py-8 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group"
          >
            <Settings className="w-4 h-4 mb-1.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <span className="text-white font-black italic text-[8px] md:text-xs uppercase tracking-tighter text-center px-2">
              Configurador FCM
            </span>
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

      {/* DIÀLEG FLOTANT MODAL CONFIGURADOR DE TOKENS FCM PER SMARTPHONE */}
      {modalFCMObert && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-[#00274d] border border-blue-900/50 w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Capçalera del modal mòbil */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <h3 className="text-white font-black italic text-sm uppercase tracking-wider">
                  Configuració de Dispositiu (FCM)
                </h3>
              </div>
              <button 
                onClick={() => setModalFCMObert(false)}
                className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contingut interior del formulari d'enllaç de token */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              
              {/* Estudiant actiu actual identificat */}
              <div className="bg-black/20 border border-white/5 p-3 rounded-2xl flex items-center gap-3">
                <div className="bg-amber-400/10 p-2 rounded-xl">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase text-white/40 tracking-wider">Perfil Autenticat</p>
                  <p className="text-[11px] text-white font-bold truncate max-w-[250px]">{usuariActiu?.email || "No identificat"}</p>
                </div>
              </div>

              {/* Secció 1: Permís global de notificació */}
              <div className="text-left space-y-1.5">
                <p className="text-[10px] font-black text-amber-300 uppercase tracking-wider">1. Permís del Navegador (PWA)</p>
                <div className="bg-white/5 p-3.5 rounded-2xl flex items-center justify-between border border-white/5">
                  <div>
                    <p className="text-[10px] text-white font-bold">Estat del Permís:</p>
                    <p className="text-[9px] text-white/60 mt-0.5">
                      {permisNotificacio === "granted" ? "✅ Permès (Notificacions operatives)" : "❌ No permès o pendent"}
                    </p>
                  </div>
                  {permisNotificacio !== "granted" && (
                    <button
                      onClick={demanarPermisNotificacions}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all"
                    >
                      Demanar Permís
                    </button>
                  )}
                </div>
              </div>

              {/* Secció 2: Enllaçar token FCM des de Firebase Console o mòbil d'estudis */}
              <div className="text-left space-y-2">
                <p className="text-[10px] font-black text-[#b3f202] uppercase tracking-wider">2. Codi de l'Smartphone (Token FCM)</p>
                <p className="text-[9.5px] leading-relaxed text-white/70">
                  Deixa que l'aplicació generi el certificat push directament connectant-se a Google, o bé enganxa en calent la teva clau postal si ho prefereixes:
                </p>

                <div className="space-y-2.5">
                  <button
                    onClick={obtenirTokenNatiu}
                    disabled={obtinguentToken || !usuariActiu}
                    className="w-full bg-[#b3f202] hover:bg-[#a1d902] text-slate-950 text-[10px] font-black uppercase py-2.5 px-4 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-lg shadow-[#b3f202]/5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 animate-bounce" />
                    {obtinguentToken ? "Obtinguent certificat..." : "🔔 Generar clau automàticament"}
                  </button>

                  <textarea
                    value={tokenFCMInput}
                    onChange={(e) => setTokenFCMInput(e.target.value)}
                    placeholder="Enganxa aquí la teva adreça o token postal fcm..."
                    className="w-full bg-slate-950/80 border border-blue-900/40 rounded-2xl p-3.5 text-white placeholder-white/20 text-[10px] font-mono leading-normal focus:outline-none focus:ring-1 focus:ring-amber-500 h-16 resize-none transition-all"
                  />
                </div>
              </div>

              {/* Secció 3: Els meus múltiples dispositius registrats per rebre notificacions d'OposiCAT */}
              <div className="text-left space-y-2 pt-1">
                <p className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>3. Els Meus Dispositius ({meusDispositius.length})</span>
                  {carregantDispositius && <span className="text-[8px] text-amber-400 animate-pulse lowercase font-normal">carregant...</span>}
                </p>
                
                {meusDispositius.length === 0 ? (
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-[9px] text-white/50 text-center leading-relaxed">
                    No tens cap mòbil, tauleta o navegador registrat en calent a OposiCAT encara per rebre avisos. Genera una clau i prem Vincular.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {meusDispositius.map((disp, i) => (
                      <div key={disp.id || i} className="bg-black/30 border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-2 text-left">
                        <div className="flex items-center gap-2 max-w-[70%]">
                          <div className="bg-blue-950/80 p-2 rounded-xl text-amber-400 shrink-0">
                            {disp.plataforma === "web_pc" ? (
                              <Tablet className="w-3.5 h-3.5 text-sky-400" />
                            ) : (
                              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">
                              {disp.plataforma === "web_pc" ? "Navegador Web / PC" : disp.plataforma === "ios" ? "Apple iPhone" : "Dispositiu Android"}
                            </p>
                            <p className="text-[8px] font-mono text-white/40 truncate">
                              {disp.token}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("Segur que vols desvincular aquest dispositiu d'OposiCAT?")) {
                              esborrarFCMTokenDeBBDD_Especific(disp.id);
                            }
                          }}
                          disabled={guardantToken}
                          className="text-red-400 hover:text-red-300 text-[8px] font-black uppercase bg-red-500/10 hover:bg-red-500/20 py-1.5 px-2.5 rounded-xl transition-all cursor-pointer border border-red-500/10"
                        >
                          Esborrar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nota de privacitat i robustesa acadèmica d'RGPD de forma neta */}
              <div className="bg-[#b3f252]/5 border border-[#b3f202]/25 p-3.5 rounded-xl text-[9px] leading-relaxed text-white/80 text-left">
                🛡️ <span className="font-bold text-amber-300">Garantia RGPD:</span> Els dispositius estan enllaçats en calent amb el teu identificador d'estudiant. Les teves claus i correu estan completament blindats i tancats, fora de l'abast de qualsevol altre estudiant de l'escola de mossos.
              </div>

            </div>

            {/* Panell d'accions finals */}
            <div className="px-5 py-4 border-t border-white/10 bg-black/20 flex gap-3">
              <button
                onClick={() => setModalFCMObert(false)}
                className="flex-1 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white text-[10px] font-black uppercase py-2.5 px-4 rounded-xl transition-all"
              >
                Tancar
              </button>
              <button
                onClick={() => desarFCMTokenABBDD(tokenFCMInput)}
                disabled={guardantToken || !tokenFCMInput.trim() || !usuariActiu}
                className="flex-1 bg-amber-500 text-slate-950 hover:bg-amber-400 text-[10px] font-black uppercase py-2.5 px-4 rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-amber-500/10"
              >
                {guardantToken ? "Vinculant..." : "🔔 Vincular Dispositiu"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
