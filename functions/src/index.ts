import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import {
  NoticiaBruta,
  classificarNoticiesAmbGemini,
  desarNoticiesActualitat,
  obtenirUltimesCorreccions,
  traduirNoticiesAlCatalaAmbGemini,
} from "./classificadorGemini.js";

/**
 * CLOUD FUNCTION: processarNoticiesEntrada
 * Comentari planer per a no-programadors:
 * Aquesta funció s'executa automàticament al núvol de Firebase cada vegada que
 * entra un document nou a la col·lecció "noticies_entrada" de la base de dades
 * "ai-studio-4316edef-f851-4517-ace5-a1e671262e58".
 */

const DATABASE_ID = "ai-studio-4316edef-f851-4517-ace5-a1e671262e58";
const geminiApiKey = defineSecret("GEMINI_API_KEY");

// Inicialitzem Firebase Admin una sola vegada
if (getApps().length === 0) {
  initializeApp();
}

// Tipus exactes de l'estructura que envia l'agent a noticies_entrada
interface NoticiaEntradaAgent {
  titular: string;
  titularOriginal: string;
  resumen: string;
  enlace: string;
}

interface MediEntradaAgent {
  nombre: string; // "BBC News" | "The Guardian" | "RTVE" | "3Cat"
  conIA: boolean;
  noticias: NoticiaEntradaAgent[];
}

interface DocumentNoticiesEntrada {
  creado?: any;
  fechaLocal?: string;
  origen?: string;
  medios?: MediEntradaAgent[];
  processat?: boolean;
}

// Comentari planer per a no-programadors:
// Converteix el camp "creado" (Timestamp de Firestore) a format "YYYY-MM-DD" en hora d'Espanya (Europe/Madrid).
function extreureDataEspanyaYYYYMMDD(creado: any, fechaLocal?: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  if (creado && typeof creado.toDate === "function") {
    return formatter.format(creado.toDate());
  }

  if (creado && typeof creado.seconds === "number") {
    return formatter.format(new Date(creado.seconds * 1000));
  }

  // Fallback segur si "creado" no estigués disponible: parsejar "D/M/YYYY, ..." de fechaLocal
  if (fechaLocal) {
    const match = String(fechaLocal).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) {
      const dia = match[1].padStart(2, "0");
      const mes = match[2].padStart(2, "0");
      const any = match[3];
      return `${any}-${mes}-${dia}`;
    }
  }

  return formatter.format(new Date());
}

export const processarNoticiesEntrada = onDocumentCreated(
  {
    document: "noticies_entrada/{docId}",
    database: DATABASE_ID,
    region: "europe-west1",
    secrets: [geminiApiKey],
    timeoutSeconds: 180,
    memory: "512MiB",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const dades = (snapshot.data() || {}) as DocumentNoticiesEntrada;

    // Evitem processar dues vegades el mateix document si ja estava marcat
    if (dades.processat === true) {
      console.log(`[Actualitat CF] El document ${snapshot.id} ja estava processat.`);
      return;
    }

    const db = getFirestore(DATABASE_ID);
    const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY || "";

    if (!apiKey) {
      throw new Error(
        "[Actualitat CF] Falta la clau GEMINI_API_KEY als secrets de Firebase Functions."
      );
    }

    const dataDia = extreureDataEspanyaYYYYMMDD(dades.creado, dades.fechaLocal);
    const medios = Array.isArray(dades.medios) ? dades.medios : [];

    // Separem les notícies que ja venen en català (conIA: true) de les que s'han de traduir (conIA: false)
    const noticiesJaTraduides: NoticiaBruta[] = [];
    const noticiesPerTraduiir: NoticiaBruta[] = [];

    for (const medi of medios) {
      const font = String(medi?.nombre || "").trim();
      const conIA = medi?.conIA === true;
      const llista = Array.isArray(medi?.noticias) ? medi.noticias : [];

      for (const item of llista) {
        const titular = String(item?.titular || "").trim();
        const resum = String(item?.resumen || "").trim();
        const enllac = String(item?.enlace || "").trim();

        // Ignorem entrades totalment buides
        if (!titular && !resum) continue;

        const noticiaMapejada: NoticiaBruta = {
          titol: titular,
          resum,
          font,
          enllac,
          data: dataDia,
        };

        if (conIA) {
          noticiesJaTraduides.push(noticiaMapejada);
        } else {
          noticiesPerTraduiir.push(noticiaMapejada);
        }
      }
    }

    // Si hi ha mitjans amb conIA a false, primer traduïm titular i resum al català respectant els noms propis
    const noticiesTraduides =
      noticiesPerTraduiir.length > 0
        ? await traduirNoticiesAlCatalaAmbGemini(noticiesPerTraduiir, apiKey)
        : [];

    const totesLesNoticies = [...noticiesJaTraduides, ...noticiesTraduides];

    let totalDesades = 0;
    if (totesLesNoticies.length > 0) {
      // Llegim les últimes correccions fetes des del Backoffice perquè Gemini apliqui el mateix criteri
      const correccions = await obtenirUltimesCorreccions(db);

      // Classifiquem àmbit (internacional, espanya, catalunya) i color (blanc, taronja, verd)
      const classificades = await classificarNoticiesAmbGemini(
        totesLesNoticies,
        correccions,
        apiKey,
        dataDia
      );

      // Desem cada notícia individualment a noticies_actualitat
      totalDesades = await desarNoticiesActualitat(db, classificades);
    }

    // Marquem el document entrant com a processat per evitar duplicats
    await snapshot.ref.update({
      processat: true,
      processatEl: FieldValue.serverTimestamp(),
      totalNoticiesProcessades: totalDesades,
      dataAssignada: dataDia,
    });

    console.log(
      `[Actualitat CF] Document ${snapshot.id} processat correctament. Notícies desades: ${totalDesades} (data: ${dataDia}).`
    );
  }
);
