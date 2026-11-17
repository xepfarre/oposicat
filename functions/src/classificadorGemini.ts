import { GoogleGenAI, Type } from "@google/genai";
import { Firestore } from "firebase-admin/firestore";

/**
 * MÒDUL DE CLASSIFICACIÓ DE NOTÍCIES AMB GEMINI (CLOUD FUNCTION)
 * Comentari planer per a no-programadors:
 * Aquest fitxer s'encarrega de:
 * 1. Llegir les últimes correccions que l'administrador ha fet a "correccions_noticies".
 * 2. Enviar el lot de notícies a Gemini juntament amb aquestes correccions com a exemples.
 * 3. Desar cada notícia classificada a "noticies_actualitat" amb els camps:
 *    titol, resum, ambit, color, data, font i enllac.
 */

export type AmbitNoticia = "internacional" | "espanya" | "catalunya";
export type ColorNoticia = "blanc" | "taronja" | "verd";

export interface NoticiaBruta {
  titol: string;
  resum: string;
  font: string;
  enllac: string;
  data?: string;
}

export interface NoticiaClassificada extends NoticiaBruta {
  ambit: AmbitNoticia;
  color: ColorNoticia;
  data: string;
}

interface CorreccioExemple {
  titol: string;
  resum: string;
  colorAnterior: string;
  colorNou: string;
  motiu: string;
}

// Comentari planer per a no-programadors:
// Model principal i model de reserva si Google retorna saturació temporal (error 429 o 503).
const MODEL_PRINCIPAL = "gemini-3.6-flash";
const MODEL_RESERVA = "gemini-3.5-flash-lite";

// Comentari planer per a no-programadors:
// Comprova si l'error retornat per l'API de Gemini correspon a un codi HTTP 429 o 503.
function esError429o503(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { status?: unknown; code?: unknown; message?: unknown };
  if (err.status === 429 || err.status === 503) return true;
  if (err.code === 429 || err.code === 503) return true;
  const msg = String(err.message || "");
  return /\b(429|503)\b/.test(msg);
}

// Comentari planer per a no-programadors:
// Executa la petició a Gemini amb el model principal i, només si falla amb 429 o 503, reintenta amb el de reserva.
async function generarContingutAmbReserva(
  ai: GoogleGenAI,
  contents: string,
  config: Record<string, unknown>
) {
  try {
    return await ai.models.generateContent({
      model: MODEL_PRINCIPAL,
      contents,
      config,
    });
  } catch (error) {
    if (esError429o503(error)) {
      console.warn(
        `[Actualitat CF] Error 429/503 amb ${MODEL_PRINCIPAL}. Canviant al model de reserva ${MODEL_RESERVA}.`
      );
      return await ai.models.generateContent({
        model: MODEL_RESERVA,
        contents,
        config,
      });
    }
    throw error;
  }
}

// Comentari planer per a no-programadors:
// Si un mitjà té conIA = false, Gemini tradueix primer el titular i el resum al català
// sense modificar mai cap nom propi (persones, partits, llocs, institucions o empreses).
export async function traduirNoticiesAlCatalaAmbGemini(
  noticies: NoticiaBruta[],
  apiKey: string
): Promise<NoticiaBruta[]> {
  if (noticies.length === 0) return [];

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const llistaEntrada = noticies
    .map(
      (n, idx) =>
        `[${idx}] Titular: ${n.titol}\nResum: ${n.resum}`
    )
    .join("\n\n");

  const prompt = `Ets un traductor periodístic professional al català.
Tradueix al català natural i correcte el titular i el resum de cadascuna d'aquestes notícies.
REGLES ESTRICTES:
- NO canviïs MAI els noms propis (noms de persones, ciutats, països si ja són propis o noms oficials d'entitats, empreses, partits, lleis o institucions estrangeres que s'han de mantenir fidels).
- Si un camp ja està en català o és buit (""), retorna'l tal qual.
- Si el resum és "(Este medio no incluye resumen para esta noticia)", tradueix-lo a "(Aquest mitjà no inclou resum per a aquesta notícia)".
- Retorna exactament un objecte JSON per cada índex.

NOTÍCIES A TRADUIR:
${llistaEntrada}`;

  const resposta = await generarContingutAmbReserva(ai, prompt, {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.INTEGER },
          titol: { type: Type.STRING },
          resum: { type: Type.STRING },
        },
        required: ["index", "titol", "resum"],
      },
    },
  });

  const textJson = resposta.text || "[]";
  const traduccions: Array<{
    index: number;
    titol: string;
    resum: string;
  }> = JSON.parse(textJson);

  const mapa = new Map<number, { titol: string; resum: string }>();
  for (const t of traduccions) {
    mapa.set(t.index, { titol: t.titol, resum: t.resum });
  }

  return noticies.map((n, idx) => {
    const trad = mapa.get(idx);
    return {
      ...n,
      titol: trad?.titol?.trim() || n.titol,
      resum: trad?.resum?.trim() || n.resum,
    };
  });
}

// Comentari planer per a no-programadors:
// Llegeix fins a 20 correccions recents fetes per l'administrador perquè Gemini imiti el seu criteri.
export async function obtenirUltimesCorreccions(
  db: Firestore
): Promise<CorreccioExemple[]> {
  const snap = await db
    .collection("correccions_noticies")
    .orderBy("creadaEl", "desc")
    .limit(20)
    .get();

  return snap.docs.map((d) => {
    const dades = d.data() || {};
    const noticia = dades.noticia || {};
    return {
      titol: String(noticia.titol || dades.titol || ""),
      resum: String(noticia.resum || dades.resum || ""),
      colorAnterior: String(dades.colorAnterior || ""),
      colorNou: String(dades.colorNou || ""),
      motiu: String(dades.motiu || ""),
    };
  });
}

// Comentari planer per a no-programadors:
// Envia les notícies a Gemini i torna per a cadascuna l'àmbit geogràfic i el color d'importància per a l'examen de Mossos.
export async function classificarNoticiesAmbGemini(
  noticies: NoticiaBruta[],
  correccions: CorreccioExemple[],
  apiKey: string,
  dataPerDefecte: string
): Promise<NoticiaClassificada[]> {
  if (noticies.length === 0) return [];

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const blocExemples =
    correccions.length > 0
      ? correccions
          .map(
            (c, i) =>
              `${i + 1}. Titular: "${c.titol}" | Resum: "${c.resum}" -> El sistema va posar "${c.colorAnterior}", però l'administrador ho va corregir a "${c.colorNou}". Motiu: "${c.motiu}".`
          )
          .join("\n")
      : "Encara no hi ha correccions prèvies.";

  const llistaEntrada = noticies
    .map(
      (n, idx) =>
        `[${idx}] Titular: ${n.titol}\nResum: ${n.resum}\nFont: ${n.font}`
    )
    .join("\n\n");

  const prompt = `Ets un expert preparador d'oposicions a Mossos d'Esquadra (ISPC).
Has de classificar cadascuna de les següents notícies amb:
1) "ambit": només pot ser "internacional", "espanya" o "catalunya".
2) "color": només pot ser:
   - "blanc": poc probable que surti a l'examen de Mossos (anècdotes, esports menors, successos locals menors, entreteniment).
   - "taronja": possible que surti a l'examen (política general, economia rellevant, fets socials destacats).
   - "verd": probable que surti a l'examen (lleis aprovades, seguretat, cossos policials, Mossos d'Esquadra, justícia, grans canvis institucionals a Catalunya/Espanya/UE).

EXEMPLES DE CORRECCIONS REALS DE L'ADMINISTRADOR (aplica aquest mateix criteri):
${blocExemples}

NOTÍCIES A CLASSIFICAR (retorna exactament un objecte per cada índex):
${llistaEntrada}`;

  const resposta = await generarContingutAmbReserva(ai, prompt, {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.INTEGER },
          ambit: {
            type: Type.STRING,
            enum: ["internacional", "espanya", "catalunya"],
          },
          color: {
            type: Type.STRING,
            enum: ["blanc", "taronja", "verd"],
          },
        },
        required: ["index", "ambit", "color"],
      },
    },
  });

  const textJson = resposta.text || "[]";
  const classificacions: Array<{
    index: number;
    ambit: AmbitNoticia;
    color: ColorNoticia;
  }> = JSON.parse(textJson);

  const mapa = new Map<number, { ambit: AmbitNoticia; color: ColorNoticia }>();
  for (const item of classificacions) {
    mapa.set(item.index, { ambit: item.ambit, color: item.color });
  }

  return noticies.map((n, idx) => {
    const res = mapa.get(idx);
    return {
      titol: n.titol,
      resum: n.resum,
      font: n.font,
      enllac: n.enllac,
      data: n.data || dataPerDefecte,
      ambit: res?.ambit || "catalunya",
      color: res?.color || "blanc",
    };
  });
}

// Comentari planer per a no-programadors:
// Desa totes les notícies ja classificades dins la col·lecció "noticies_actualitat" fent servir un lot (batch).
export async function desarNoticiesActualitat(
  db: Firestore,
  noticiesClassificades: NoticiaClassificada[]
): Promise<number> {
  if (noticiesClassificades.length === 0) return 0;

  const batch = db.batch();
  const colRef = db.collection("noticies_actualitat");

  for (const n of noticiesClassificades) {
    const docRef = colRef.doc();
    batch.set(docRef, {
      titol: n.titol,
      resum: n.resum,
      ambit: n.ambit,
      color: n.color,
      data: n.data,
      font: n.font,
      enllac: n.enllac,
    });
  }

  await batch.commit();
  return noticiesClassificades.length;
}
