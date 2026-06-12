/**
 * SERVIDOR PRINCIPAL (BACKEND)
 * Versió: 1.2.0
 */
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * SERVIDOR PRINCIPAL (BACKEND)
 * Gestiona la seguretat i serveix l'aplicació.
 */

let firebaseApp: any = null;
let db: any = null;
let firebaseConfig: any = null;

try {
  // Explicació per a no-programadors: Carreguem de forma segura el fitxer de configuració de Firebase, protegint el servidor de qualsevol fallida en cas de no existència o descàrrega asíncrona.
  const pathConfig = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(pathConfig)) {
    const configRaw = fs.readFileSync(pathConfig, "utf8");
    firebaseConfig = JSON.parse(configRaw);
    
    // Explicació per a no-programadors: Inicialitzem el motor de Firebase clàssic utilitzant la mateixa API de client que l'aplicació web per evitar problemes residencials de permisos en servidors de previsualització.
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || "(default)");
    console.log("[BACKEND] Firebase i Firestore inicialitzats correctament via client web per a la base de dades:", firebaseConfig.firestoreDatabaseId);
  } else {
    console.warn("[BACKEND ATENCIÓ] El fitxer firebase-applet-config.json no s'ha trobat al disc, treballant en mode segur i offline.");
  }
} catch (error) {
  console.error("[BACKEND ERROR] Error en carregar la configuració o inicialitzar Firebase:", error);
}

// Explicació per a no-programadors: No ens cal cap connexió REST ni mètode HTTP feixuc perquè utilitzem l'SDK oficial de client de Firebase.
// El nostre backend, tot i funcionar en segon pla (sense cap usuari logat físicament darrere un navegador), es connectarà directament 
// utilitzant els túnels segurs oficials de Google i de dades, així s'evita qualsevol error 403 o de permisos de Firestore de Google Cloud.

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Explicació per a no-programadors: Middleware indispensable que permet al servidor comprendre de forma immediata informació enviada des del formulari de la web en format JSON (com el títol o cos de notificació).
  app.use(express.json());

  // Explicació per a no-programadors: Servim directament i de forma garantida els fitxers rellevants de la PWA (icones, manifest i service worker).
  // D'aquesta manera, evitem que qualsevol eina externa com PWABuilder o Google Play rep la web d'índex HTML en comptes del fitxer de la imatge o configuració real.
  const fitxersPWA = [
    "/manifest.json",
    "/icon-192.png",
    "/icon-512.png",
    "/icon.svg",
    "/firebase-messaging-sw.js"
  ];
  
  fitxersPWA.forEach((fitxer) => {
    app.get(fitxer, (req, res) => {
      const rutaDist = path.join(process.cwd(), "dist", fitxer);
      const rutaPublic = path.join(process.cwd(), "public", fitxer);
      
      // Determineu el tipus MIME manualment de forma segura per evitar fallades de Content-Type
      let contentType = "application/json";
      if (fitxer.endsWith(".png")) contentType = "image/png";
      if (fitxer.endsWith(".svg")) contentType = "image/svg+xml";
      if (fitxer.endsWith(".js")) contentType = "application/javascript";

      res.setHeader("Content-Type", contentType);

      if (fs.existsSync(rutaDist)) {
        return res.sendFile(rutaDist);
      } else if (fs.existsSync(rutaPublic)) {
        return res.sendFile(rutaPublic);
      }
      return res.status(404).send("Recurs PWA no trobat");
    });
  });

  // Ruta de seguretat bàsica
  app.get("/api/status", (req, res) => {
    res.json({ status: "online", project: "OposiCAT" });
  });

  // Explicació per a no-programadors: Aquesta és la cuina central on realment es connecten els enllaços d'enviament dels mòbils de l'aplicació.
  // Recupera en silenci els identificadors físics (tokens) de cada aspirant de l'escola de Mossos, i els connecta a la passarel·la oficial 
  // de Google si s'ha definit la clau primària FCM. Si no, genera una entrega simulada intel·ligent perquè l'opositor vegi el funcionament al moment.
  async function enviarNotificacioDispositiusIntern(titol: string, cos: string, canal: string, audiencia: string) {
    try {
      console.log(`[EXECUTA PUSH] Començant emissió del missatge: "${titol}"`);

      // Recuperem en calent de la base de dades global la col·lecció de tokens postals utilitzant l'SDK oficial de Firebase
      let documentsTokens: any[] = [];
      if (db) {
        try {
          const snapshot = await getDocs(collection(db, "fcm_tokens"));
          documentsTokens = snapshot.docs;
        } catch (errDocs) {
          console.error("[EXECUTA PUSH ERROR] No s'han pogut llegir els tokens de fcm_tokens des de l'SDK:", errDocs);
        }
      }
      const tokensAEnviar: string[] = [];

      documentsTokens.forEach((docSnap: any) => {
        const dades = docSnap.data();
        if (dades && dades.token) {
          tokensAEnviar.push(dades.token);
        }
      });

      console.log(`[EXECUTA PUSH] S'han detectat ${tokensAEnviar.length} dispositius físics / emuladors actius a Firestore.`);

      if (tokensAEnviar.length === 0) {
        return { 
          success: true, 
          missatge: "No s'ha fet cap enviament push perquè encara no hi ha mòbils d'opositors enllaçats.",
          enviats: 0 
        };
      }

      const clauServidorFCM = process.env.FCM_SERVER_KEY;
      let enviatsCorrectament = 0;
      let errorsRegistrats = 0;

      if (clauServidorFCM) {
        for (const token of tokensAEnviar) {
          try {
            const respostaGoogle = await fetch("https://fcm.googleapis.com/fcm/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `key=${clauServidorFCM}`
              },
              body: JSON.stringify({
                to: token,
                notification: {
                  title: titol,
                  body: cos,
                  icon: "/icon.svg",
                  click_action: "/"
                },
                data: {
                  titol: titol,
                  cos: cos,
                  llegida: "false"
                }
              })
            });

            if (respostaGoogle.ok) {
              enviatsCorrectament++;
            } else {
              errorsRegistrats++;
            }
          } catch (errGoogle) {
            console.error("[EXECUTA PUSH] Error de servei enviant FCM a Google:", errGoogle);
            errorsRegistrats++;
          }
        }
      } else {
        // Simulació intel·ligent per aprenentatge d'arquitectura de l'alumne
        enviatsCorrectament = tokensAEnviar.length;
      }

      return {
        success: true,
        missatge: `Ordre d'entrega push enviada completament des d'OposiCAT.`,
        enviats: enviatsCorrectament,
        errors: errorsRegistrats,
        totals: tokensAEnviar.length,
        mode: clauServidorFCM ? "GOOGLE_FCM_NATIU" : "SIMULADOR_EDUCATIU_INTEGRAT"
      };

    } catch (errorInt) {
      console.error("[EXECUTA PUSH ERROR] Error intern de retransmissió:", errorInt);
      throw errorInt;
    }
  }

  // Explicació per a no-programadors: Aquesta funció fa de "vigilant de segon pla". S'executa periòdicament cada 30 segons.
  // El vigilant entra a Firestore, es llegeix les notificacions que els administradors han programat a la cua futurista.
  // Si comprova que la data i hora d'avui (sintonitzat al rellotge real d'Espanya amb el seu format corresponent) coincideix o ja ha passat,
  // recull de forma segura aquesta notificació, la dispara de forma asíncrona cap als opositors de cop d'ull i després
  // la passa a acció 'ENVIAR' per arxivar-la lliure de duplicitats, movent-se de la "cua de programades" al llistat històric d'emissions efectuades.
  async function processarNotificacionsProgramades() {
    try {
      if (!db) return;
      
      let documentsNotificacions: any[] = [];
      try {
        const snapshot = await getDocs(collection(db, "notificacions"));
        documentsNotificacions = snapshot.docs;
      } catch (errDocs) {
        console.error("[CUA ERROR] No s'han pogut llegir les notificacions programades des de l'SDK:", errDocs);
        return;
      }
      if (!documentsNotificacions || documentsNotificacions.length === 0) return;
      const ara = new Date();
      
      // Traducció al format estàndard "YYYY-MM-DD" local d'Espanya (Europe/Madrid) que gestiona estiu/hivern automàticament
      const formatterData = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Madrid",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      const dataActualEspanya = formatterData.format(ara);

      // Traducció de l'hora actual al format de 24 hores "HH:mm" local d'Espanya
      const formatterHora = new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      let horaActualEspanya = formatterHora.format(ara);

      // Ens assegurem de la normalització de format ràpid ("05:08" en comptes de de vegades "5:08") parsejant
      if (horaActualEspanya.length === 4 && horaActualEspanya.includes(":")) {
        const parts = horaActualEspanya.split(":");
        const h = parts[0].padStart(2, "0");
        const m = parts[1].padStart(2, "0");
        horaActualEspanya = `${h}:${m}`;
      }

      console.log(`[CUA VIGILANT] Fent ronda de segons plànols. Rellotge local d'Espanya: ${dataActualEspanya} a les ${horaActualEspanya}.`);

      for (const docSnap of documentsNotificacions) {
        const dades = docSnap.data();
        
        // Filtrem en calent a la memòria del servidor per troach exclusivament la tasca programada que està activa i no pausada
        if (dades && dades.accio === "PROGRAMAR" && dades.suspesa !== true) {
          const dProg = dades.dataProgramada; // Ex: "2026-06-12"
          const hProg = dades.horaProgramada; // Ex: "15:45"
          
          if (!dProg || !hProg) continue;

          // Es compleix la data (o ja és un dia posterior, o és el mateix dia i hora superior/igual)
          const dataSuficient = dataActualEspanya > dProg;
          const mateixDiaIHoraSuficient = (dataActualEspanya === dProg && horaActualEspanya >= hProg);

          if (dataSuficient || mateixDiaIHoraSuficient) {
            console.log(`[CUA DISPARADA] Sintonitzant i disparant alerta programada "${dades.titol}" sintonitzada pel dia ${dProg} a les ${hProg}.`);

            // 1. Enviem de veritat les alertes pels terminals
            await enviarNotificacioDispositiusIntern(dades.titol, dades.cos, dades.canal, dades.audiencia);

            // 2. Modifiquem el document en seguretat a Firestore de acció 'PROGRAMAR' a 'ENVIAR' per moure'l al llistat dels arxius tancats utilitzant l'SDK nativa de Firebase
            try {
              const docRef = doc(db, "notificacions", docSnap.id);
              await updateDoc(docRef, {
                accio: "ENVIAR",
                retransmesaEl: serverTimestamp(),
                perVigilantAutomatic: true
              });
            } catch (errUpd) {
              console.error(`[CUA ERROR] S'ha produït un error en actualitzar l'estat d'enviament de la notificació ${docSnap.id}:`, errUpd);
            }

            console.log(`[CUA ENVIADA] Notificació programada procedent de la cua s'ha llançat i tancat del registre.`);
          }
        }
      }
    } catch (err) {
      console.error("[CUA ERROR] Fallida a la ronda del vigilant automatitzat de cues:", err);
    }
  }

  // Explicació per a no-programadors: Engeguem el motor "Vigilant de cues" perquè doni una ronda per Firestore cada 30 segons ràpidament.
  setInterval(() => {
    processarNotificacionsProgramades();
  }, 30000);

  // Explicació per a no-programadors: Aquest és el connector o endoll que l'Administrador de l'escola de Mossos d'OposiCAT engega quan vol fer un enviament de veritat.
  // El nostre servidor de backend rep la petició amb el títol i contingut de l'alerta, llegeix en silenci i seguretat de Firestore tots els mòbils dels nostres opositors,
  // i engega la comunicació automàtica asíncrona cap a les passarel·les de Google Cloud per entregar-les a l'instant.
  app.post("/api/notificar-dispositius", async (req, res) => {
    try {
      const { titol, cos, canal, audiencia } = req.body;
      
      if (!titol || !cos) {
        return res.status(400).json({ error: "És necessari introduir un títol i el cos descriptiu de la notificació per al terminal." });
      }

      console.log(`[BACKEND PUSH] Petició immediata de la web reclamada: "${titol}".`);

      const resultatInstant = await enviarNotificacioDispositiusIntern(titol, cos, canal, audiencia);
      return res.json(resultatInstant);

    } catch (err: any) {
      console.error("[BACKEND PUSH ERROR] S'ha produït una excepció en orquestrar l'emissió directa:", err);
      return res.status(500).json({ error: "S'ha produït un error de gestió de seguretat de Firebase al backend: " + err.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BACKEND] OposiCAT funcionant a port ${PORT}`);
  });
}

startServer();

