import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Newspaper,
  RefreshCw,
  X,
} from "lucide-react";
import { db } from "../../lib/firebase";

/**
 * VISTA DEL BACKOFFICE: RevisarNoticiesView
 * Comentari planer per a no-programadors:
 * Aquesta pantalla permet als administradors veure totes les notícies de "noticies_actualitat"
 * ordenades per dies, comprovar quin color hi ha assignat Gemini (blanc, taronja o verd),
 * i pujar o baixar aquest color indicant obligatòriament un motiu.
 * Cada correcció queda desada a "correccions_noticies" perquè Gemini aprengui del criteri humà.
 */

type ColorNoticia = "blanc" | "taronja" | "verd";
type AmbitNoticia = "internacional" | "espanya" | "catalunya";

interface NoticiaRevisio {
  id: string;
  titol: string;
  resum: string;
  ambit: AmbitNoticia;
  color: ColorNoticia;
  data: string;
  font?: string;
  enllac?: string;
}

const MOTIUS_BAIXAR = [
  "No té relació amb el temari",
  "No és prou rellevant",
  "Massa local o anecdòtica",
  "Notícia repetida",
];

const MOTIUS_PUJAR = [
  "Tema clau per a Mossos",
  "Tema recurrent a les acadèmies",
  "Afecta la seguretat o la llei a Catalunya",
];

const NIVELL_COLOR: Record<ColorNoticia, number> = {
  blanc: 0,
  taronja: 1,
  verd: 2,
};

function normalitzarColor(valor: unknown): ColorNoticia {
  const net = String(valor || "").trim().toLowerCase();
  if (net === "verd" || net === "verde") return "verd";
  if (net === "taronja" || net === "naranja") return "taronja";
  return "blanc";
}

function normalitzarAmbit(valor: unknown): AmbitNoticia {
  const net = String(valor || "").trim().toLowerCase();
  if (net === "internacional") return "internacional";
  if (net === "espanya" || net === "españa") return "espanya";
  return "catalunya";
}

function normalitzarDataDia(valor: unknown): string {
  if (!valor) return "Sense data";
  if (
    typeof valor === "object" &&
    valor !== null &&
    typeof (valor as any).toDate === "function"
  ) {
    const dt: Date = (valor as any).toDate();
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dt);
  }
  const str = String(valor).trim();
  const matchIso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchIso) return `${matchIso[1]}-${matchIso[2]}-${matchIso[3]}`;
  return str || "Sense data";
}

function formatarDiaCatala(diaIso: string): string {
  const match = diaIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return diaIso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export default function RevisarNoticiesView({
  darkMode,
  userEmail,
}: {
  darkMode: boolean;
  userEmail?: string;
}) {
  const [noticies, setNoticies] = useState<NoticiaRevisio[]>([]);
  const [carregant, setCarregant] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Estat de la finestra emergent (modal) quan s'intenta pujar o baixar un color
  const [canviPendent, setCanviPendent] = useState<{
    noticia: NoticiaRevisio;
    colorNou: ColorNoticia;
    direccio: "pujar" | "baixar";
  } | null>(null);
  const [motiuSeleccionat, setMotiuSeleccionat] = useState<string>("");
  const [motiuPersonalitzat, setMotiuPersonalitzat] = useState<string>("");
  const [desant, setDesant] = useState(false);

  // Comentari planer per a no-programadors:
  // Llegeix totes les notícies publicades a "noticies_actualitat" per mostrar-les al professor.
  const carregarNoticies = async () => {
    setCarregant(true);
    setErrorMsg(null);
    try {
      const snap = await getDocs(collection(db, "noticies_actualitat"));
      const llista: NoticiaRevisio[] = snap.docs.map((docSnap) => {
        const d = docSnap.data() || {};
        return {
          id: docSnap.id,
          titol: String(d.titol || "Sense titular"),
          resum: String(d.resum || ""),
          ambit: normalitzarAmbit(d.ambit),
          color: normalitzarColor(d.color),
          data: normalitzarDataDia(d.data),
          font: d.font ? String(d.font) : "",
          enllac: d.enllac ? String(d.enllac) : "",
        };
      });
      setNoticies(llista);
    } catch (err: any) {
      console.error("[RevisarNoticies] Error carregant noticies_actualitat:", err);
      setErrorMsg(
        err?.message || "No s'han pogut carregar les notícies de Firestore."
      );
    } finally {
      setCarregant(false);
    }
  };

  useEffect(() => {
    carregarNoticies();
  }, []);

  // Agrupem les notícies per dia, ordenant els dies del més recent al més antic
  const noticiesPerDies = useMemo(() => {
    const mapa: Record<string, NoticiaRevisio[]> = {};
    for (const n of noticies) {
      if (!mapa[n.data]) mapa[n.data] = [];
      mapa[n.data].push(n);
    }
    const diesOrdenats = Object.keys(mapa).sort((a, b) => b.localeCompare(a));
    return diesOrdenats.map((dia) => ({
      dia,
      items: mapa[dia],
    }));
  }, [noticies]);

  // Obre el diàleg obligatori de motiu quan l'admin prem pujar o baixar color
  const obrirModalCanvi = (noticia: NoticiaRevisio, colorNou: ColorNoticia) => {
    const direccio =
      NIVELL_COLOR[colorNou] > NIVELL_COLOR[noticia.color] ? "pujar" : "baixar";
    setCanviPendent({ noticia, colorNou, direccio });
    setMotiuSeleccionat("");
    setMotiuPersonalitzat("");
  };

  // Desa el nou color a "noticies_actualitat" i registra la correcció a "correccions_noticies"
  const confirmarCanviColor = async () => {
    if (!canviPendent) return;
    const motiuFinal =
      motiuSeleccionat === "__altre__"
        ? motiuPersonalitzat.trim()
        : motiuSeleccionat.trim();

    if (!motiuFinal) return;

    setDesant(true);
    setErrorMsg(null);
    try {
      const { noticia, colorNou } = canviPendent;
      const colorAnterior = noticia.color;

      // 1. Actualitzem el color a la notícia real de noticies_actualitat
      await updateDoc(doc(db, "noticies_actualitat", noticia.id), {
        color: colorNou,
      });

      // 2. Desem el registre d'aprenentatge a correccions_noticies
      await addDoc(collection(db, "correccions_noticies"), {
        noticiaId: noticia.id,
        noticia: {
          titol: noticia.titol,
          resum: noticia.resum,
          ambit: noticia.ambit,
          data: noticia.data,
          font: noticia.font || "",
          enllac: noticia.enllac || "",
        },
        colorAnterior,
        colorNou,
        motiu: motiuFinal,
        corregitPer: userEmail || "admin",
        creadaEl: serverTimestamp(),
      });

      // 3. Actualitzem la llista en pantalla a l'instant
      setNoticies((prev) =>
        prev.map((item) =>
          item.id === noticia.id ? { ...item, color: colorNou } : item
        )
      );
      setCanviPendent(null);
      setOkMsg(
        `Color actualitzat de ${colorAnterior} a ${colorNou} i motiu desat a correccions_noticies.`
      );
      setTimeout(() => setOkMsg(null), 5000);
    } catch (err: any) {
      console.error("[RevisarNoticies] Error desant la correcció:", err);
      setErrorMsg(
        err?.message ||
          "Error en desar la correcció. Revisa que tinguis la sessió d'administrador iniciada."
      );
    } finally {
      setDesant(false);
    }
  };

  const badgeColor = (color: ColorNoticia) => {
    if (color === "verd") {
      return {
        label: "Verd · Probable",
        classes:
          "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
        dot: "bg-emerald-500",
      };
    }
    if (color === "taronja") {
      return {
        label: "Taronja · Possible",
        classes: "bg-amber-500/15 text-amber-500 border-amber-500/30",
        dot: "bg-amber-500",
      };
    }
    return {
      label: "Blanc · Poc probable",
      classes: darkMode
        ? "bg-white/10 text-slate-200 border-white/25"
        : "bg-slate-100 text-slate-700 border-slate-300",
      dot: darkMode ? "bg-white" : "bg-slate-400",
    };
  };

  const nomAmbit: Record<AmbitNoticia, string> = {
    internacional: "Internacional",
    espanya: "Espanya",
    catalunya: "Catalunya",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* CAPÇALERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper size={18} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              Prova Teòrica / Actualitat
            </span>
          </div>
          <h2
            className={`text-3xl font-black tracking-tight ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Revisar notícies
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Revisa les notícies agrupades per dia. En pujar o baixar un color, el motiu queda registrat per ajustar el criteri de Gemini.
          </p>
        </div>

        <button
          onClick={carregarNoticies}
          disabled={carregant}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer ${
            darkMode
              ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <RefreshCw size={14} className={carregant ? "animate-spin" : ""} />
          Actualitzar
        </button>
      </div>

      {/* MISSATGES D'ESTAT */}
      {okMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{okMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* LLISTAT PER DIES */}
      {carregant ? (
        <div
          className={`p-12 rounded-3xl border text-center ${
            darkMode
              ? "bg-slate-900/50 border-slate-800 text-slate-400"
              : "bg-white border-slate-200 text-slate-500"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-widest">
            Carregant notícies d'actualitat...
          </p>
        </div>
      ) : noticiesPerDies.length === 0 ? (
        <div
          className={`p-12 rounded-3xl border text-center ${
            darkMode
              ? "bg-slate-900/50 border-slate-800 text-slate-300"
              : "bg-white border-slate-200 text-slate-600"
          }`}
        >
          <p className="text-sm font-bold">
            Encara no hi ha notícies a noticies_actualitat.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {noticiesPerDies.map((grup) => (
            <section key={grup.dia} className="space-y-4">
              {/* Separador de dia */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
                    darkMode
                      ? "bg-slate-900 border-slate-800 text-white"
                      : "bg-slate-100 border-slate-200 text-slate-800"
                  }`}
                >
                  <Calendar size={14} className="text-blue-500" />
                  {formatarDiaCatala(grup.dia)}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {grup.items.length}{" "}
                  {grup.items.length === 1 ? "notícia" : "notícies"}
                </span>
                <div
                  className={`flex-1 h-px ${
                    darkMode ? "bg-slate-800" : "bg-slate-200"
                  }`}
                />
              </div>

              {/* Targetes del dia */}
              <div className="grid grid-cols-1 gap-4">
                {grup.items.map((noticia) => {
                  const estil = badgeColor(noticia.color);
                  const opcionsPujar: ColorNoticia[] = (
                    ["taronja", "verd"] as ColorNoticia[]
                  ).filter((c) => NIVELL_COLOR[c] > NIVELL_COLOR[noticia.color]);
                  const opcionsBaixar: ColorNoticia[] = (
                    ["taronja", "blanc"] as ColorNoticia[]
                  ).filter((c) => NIVELL_COLOR[c] < NIVELL_COLOR[noticia.color]);

                  return (
                    <article
                      key={noticia.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        darkMode
                          ? "bg-slate-900 border-slate-800"
                          : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${estil.classes}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${estil.dot}`}
                            />
                            {estil.label}
                          </span>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              darkMode
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {nomAmbit[noticia.ambit]}
                          </span>

                          {noticia.font && (
                            <span className="text-[11px] font-semibold text-slate-400">
                              {noticia.font}
                            </span>
                          )}
                        </div>

                        <h3
                          className={`text-base font-black leading-snug ${
                            darkMode ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {noticia.titol}
                        </h3>

                        {noticia.resum && (
                          <p
                            className={`text-xs leading-relaxed ${
                              darkMode ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {noticia.resum}
                          </p>
                        )}

                        {noticia.enllac && (
                          <a
                            href={noticia.enllac}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:underline pt-1"
                          >
                            Veure notícia original
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>

                      {/* Botons de pujar o baixar color */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {opcionsBaixar.map((desti) => (
                          <button
                            key={`down-${desti}`}
                            onClick={() => obrirModalCanvi(noticia, desti)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              darkMode
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                                : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            <ArrowDown size={14} />
                            Baixar a {desti}
                          </button>
                        ))}

                        {opcionsPujar.map((desti) => (
                          <button
                            key={`up-${desti}`}
                            onClick={() => obrirModalCanvi(noticia, desti)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              darkMode
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            <ArrowUp size={14} />
                            Pujar a {desti}
                          </button>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* FINESTRA OBLIGATÒRIA DE MOTIU DEL CANVI */}
      {canviPendent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-5 ${
              darkMode
                ? "bg-slate-900 border-slate-700 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-block text-[10px] font-black uppercase tracking-widest mb-1 ${
                    canviPendent.direccio === "pujar"
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {canviPendent.direccio === "pujar"
                    ? "Pujar rellevància"
                    : "Baixar rellevància"}{" "}
                  · {canviPendent.noticia.color} → {canviPendent.colorNou}
                </span>
                <h3 className="text-lg font-black leading-snug">
                  Per què canvies el color?
                </h3>
              </div>

              <button
                onClick={() => setCanviPendent(null)}
                className="p-2 rounded-xl hover:bg-slate-500/10 cursor-pointer"
                aria-label="Tancar"
              >
                <X size={18} />
              </button>
            </div>

            <p
              className={`text-xs p-3 rounded-xl border ${
                darkMode
                  ? "bg-slate-950/60 border-slate-800 text-slate-300"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              {canviPendent.noticia.titol}
            </p>

            {/* Opcions predefinides segons si s'està baixant o pujant */}
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Tria un motiu obligatori:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {(canviPendent.direccio === "baixar"
                  ? MOTIUS_BAIXAR
                  : MOTIUS_PUJAR
                ).map((motiu) => {
                  const actiu = motiuSeleccionat === motiu;
                  return (
                    <button
                      key={motiu}
                      type="button"
                      onClick={() => setMotiuSeleccionat(motiu)}
                      className={`text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        actiu
                          ? "bg-blue-600 text-white border-blue-500 shadow-md"
                          : darkMode
                          ? "bg-slate-800/70 border-slate-700 text-slate-200 hover:bg-slate-800"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {motiu}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setMotiuSeleccionat("__altre__")}
                  className={`text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    motiuSeleccionat === "__altre__"
                      ? "bg-blue-600 text-white border-blue-500 shadow-md"
                      : darkMode
                      ? "bg-slate-800/70 border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Escriure un motiu a mà...
                </button>
              </div>

              {motiuSeleccionat === "__altre__" && (
                <textarea
                  rows={3}
                  value={motiuPersonalitzat}
                  onChange={(e) => setMotiuPersonalitzat(e.target.value)}
                  placeholder="Escriu aquí el motiu exacte perquè Gemini aprengui aquest criteri..."
                  className={`w-full mt-2 p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"
                  }`}
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCanviPendent(null)}
                disabled={desant}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer ${
                  darkMode
                    ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Cancel·lar
              </button>

              <button
                type="button"
                onClick={confirmarCanviColor}
                disabled={
                  desant ||
                  !motiuSeleccionat ||
                  (motiuSeleccionat === "__altre__" &&
                    !motiuPersonalitzat.trim())
                }
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
              >
                {desant ? "Desant..." : "Confirmar i desar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
