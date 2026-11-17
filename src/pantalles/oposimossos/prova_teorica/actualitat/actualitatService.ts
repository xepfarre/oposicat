import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

/**
 * SERVEI I TIPUS D'ACTUALITAT (APP MÒBIL)
 * Comentari planer per a no-programadors:
 * Aquest fitxer defineix quina forma té cada notícia (titol, resum, ambit, color i data)
 * i s'encarrega de llegir-les de la col·lecció "noticies_actualitat" de Firestore.
 */

export type AmbitNoticia = "internacional" | "espanya" | "catalunya";
export type ColorImportancia = "blanc" | "taronja" | "verd";

export interface NoticiaActualitat {
  id: string;
  titol: string;
  resum: string;
  ambit: AmbitNoticia;
  color: ColorImportancia;
  data: string; // Format recomanat YYYY-MM-DD
  timestampMs: number; // Valor intern per ordenar de més recent a més antiga
}

// Comentari planer per a no-programadors:
// Normalitza el text de l'àmbit perquè encara que a la base de dades arribi en majúscules o amb espais,
// sempre caigui dins d'un dels 3 blocs oficials: Internacional, Espanya o Catalunya.
function normalitzarAmbit(valor: unknown): AmbitNoticia {
  const net = String(valor || "")
    .trim()
    .toLowerCase();
  if (net === "internacional") return "internacional";
  if (net === "espanya" || net === "españa") return "espanya";
  return "catalunya";
}

// Comentari planer per a no-programadors:
// Normalitza el color d'importància a un dels 3 colors acordats: blanc, taronja o verd.
function normalitzarColor(valor: unknown): ColorImportancia {
  const net = String(valor || "")
    .trim()
    .toLowerCase();
  if (net === "verd" || net === "verde") return "verd";
  if (net === "taronja" || net === "naranja") return "taronja";
  return "blanc";
}

// Comentari planer per a no-programadors:
// Converteix el camp "data" (sigui text com "2026-11-17" o un Timestamp de Firebase)
// en una data llegible YYYY-MM-DD i en mil·lisegons per poder ordenar fàcilment.
function parsejarDataNoticia(valorData: unknown): { text: string; ms: number } {
  if (!valorData) {
    return { text: "", ms: 0 };
  }

  // Si és un Timestamp oficial de Firestore amb mètode toDate()
  if (typeof valorData === "object" && valorData !== null && typeof (valorData as any).toDate === "function") {
    const dt: Date = (valorData as any).toDate();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return { text: formatter.format(dt), ms: dt.getTime() };
  }

  // Si arriba com a text (ex: "2026-11-17" o ISO complet "2026-11-17T10:00:00Z")
  const str = String(valorData).trim();
  const matchIso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchIso) {
    const isoDia = `${matchIso[1]}-${matchIso[2]}-${matchIso[3]}`;
    const ms = Date.parse(`${isoDia}T12:00:00Z`) || 0;
    return { text: isoDia, ms };
  }

  // Si arriba en format europeu "DD/MM/YYYY"
  const matchEu = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (matchEu) {
    const isoDia = `${matchEu[3]}-${matchEu[2]}-${matchEu[1]}`;
    const ms = Date.parse(`${isoDia}T12:00:00Z`) || 0;
    return { text: isoDia, ms };
  }

  const parsed = Date.parse(str);
  return { text: str, ms: Number.isNaN(parsed) ? 0 : parsed };
}

// Comentari planer per a no-programadors:
// Retorna la data d'avui a Catalunya (format YYYY-MM-DD) per comparar-la amb el camp "data" de cada notícia.
export function obtenirDataAvuiCatalunya(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Comentari planer per a no-programadors:
// Formata la data "YYYY-MM-DD" a un format més còmode de llegir per a l'alumne (ex: "17/11/2026").
export function formatarDataVisual(dataIso: string): string {
  const match = dataIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return dataIso;
}

// Comentari planer per a no-programadors:
// Llegeix totes les notícies de la col·lecció "noticies_actualitat" de Firestore.
// Si encara no n'hi ha cap o l'usuari entra sense sessió (mode prova sense login),
// retorna una llista buida de forma segura perquè l'app mostri "Encara no hi ha notícies" sense errors.
export async function carregarNoticiesActualitat(): Promise<NoticiaActualitat[]> {
  try {
    const snap = await getDocs(collection(db, "noticies_actualitat"));
    if (snap.empty) return [];

    const llista: NoticiaActualitat[] = snap.docs.map((docSnap) => {
      const d = docSnap.data() || {};
      const { text, ms } = parsejarDataNoticia(d.data);
      return {
        id: docSnap.id,
        titol: String(d.titol || "").trim(),
        resum: String(d.resum || "").trim(),
        ambit: normalitzarAmbit(d.ambit),
        color: normalitzarColor(d.color),
        data: text,
        timestampMs: ms,
      };
    });

    // Ordenem sempre de la més recent a la més antiga
    return llista
      .filter((n) => n.titol.length > 0 || n.resum.length > 0)
      .sort((a, b) => b.timestampMs - a.timestampMs);
  } catch (err: any) {
    // Si falla per permisos (ex: mode sense sessió iniciada), no trenquem la pantalla
    console.warn("[Actualitat] No s'han pogut llegir noticies_actualitat:", err?.code || err);
    return [];
  }
}

// Comentari planer per a no-programadors:
// Retorna els colors i textos visuals per mostrar el distintiu blanc, taronja o verd de cada notícia.
export function obtenirEstilColor(color: ColorImportancia) {
  switch (color) {
    case "verd":
      return {
        etiqueta: "Probable",
        puntClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
        voraClass: "border-l-4 border-l-emerald-400",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      };
    case "taronja":
      return {
        etiqueta: "Possible",
        puntClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]",
        voraClass: "border-l-4 border-l-amber-400",
        badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      };
    case "blanc":
    default:
      return {
        etiqueta: "Poc probable",
        puntClass: "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]",
        voraClass: "border-l-4 border-l-white/80",
        badgeClass: "bg-white/10 text-white/90 border-white/25",
      };
  }
}
