import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  AmbitNoticia,
  NoticiaActualitat,
  carregarNoticiesActualitat,
  formatarDataVisual,
  obtenirEstilColor,
} from "./actualitatService";

/**
 * VISTA: Notícies per a l'examen (APP Mòbil)
 * Comentari planer per a no-programadors:
 * Mostra el recull de totes les notícies marcades amb color taronja o verd
 * de la col·lecció "noticies_actualitat", ordenades de la més recent a la més antiga.
 */
export default function NoticiesExamenVista({ onTornar }: { onTornar: () => void }) {
  const [noticiesExamen, setNoticiesExamen] = useState<NoticiaActualitat[]>([]);
  const [carregant, setCarregant] = useState(true);

  useEffect(() => {
    let actiu = true;
    const carregar = async () => {
      setCarregant(true);
      const totes = await carregarNoticiesActualitat();
      // Filtrem només les notícies importants (color taronja o verd), ja venen ordenades de més recent a més antiga
      const seleccionades = totes.filter(
        (n) => n.color === "taronja" || n.color === "verd"
      );
      if (actiu) {
        setNoticiesExamen(seleccionades);
        setCarregant(false);
      }
    };
    carregar();
    return () => {
      actiu = false;
    };
  }, []);

  const nomAmbit: Record<AmbitNoticia, string> = {
    internacional: "Internacional",
    espanya: "Espanya",
    catalunya: "Catalunya",
  };

  return (
    <div
      className="fixed inset-0 w-full overflow-y-auto flex flex-col items-center px-6 pb-16 bg-[#010915] select-none text-white"
      style={{
        WebkitOverflowScrolling: "touch",
        // Mateix fons fosc degradat que Prova Teòrica
        backgroundImage:
          "linear-gradient(to bottom, rgba(1, 9, 21, 0.92), rgba(1, 9, 21, 0.96)), url('/assets/imatges/fons_ispc.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "20% bottom",
      }}
    >
      {/* CAPÇALERA */}
      <header className="pt-14 w-full max-w-lg flex flex-col items-center gap-6 shrink-0 mb-6">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10 relative w-full max-w-xs flex items-center justify-center">
          <button
            onClick={onTornar}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg cursor-pointer"
            aria-label="Tornar"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-3xl font-black italic tracking-tighter select-none pl-6 pr-2">
            <span className="text-white">Oposi </span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-white text-lg font-black italic tracking-widest uppercase opacity-95 text-center">
            Notícies per a l'examen
          </h2>
          <div className="h-1 w-12 bg-red-600 rounded-full" />
        </div>
      </header>

      {/* CONTINGUT PRINCIPAL */}
      <main className="w-full max-w-md flex flex-col gap-4 pb-8">
        {carregant ? (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
              Carregant notícies...
            </p>
          </div>
        ) : noticiesExamen.length === 0 ? (
          <div className="w-full bg-white/5 border border-white/15 rounded-2xl p-8 text-center shadow-lg">
            <p className="text-white/80 text-sm font-bold tracking-wide">
              Encara no hi ha notícies
            </p>
          </div>
        ) : (
          noticiesExamen.map((noticia) => {
            const estil = obtenirEstilColor(noticia.color);
            return (
              <article
                key={noticia.id}
                className={`bg-white/10 border border-white/15 ${estil.voraClass} rounded-xl p-4 shadow-lg flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${estil.badgeClass}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${estil.puntClass}`} />
                    {estil.etiqueta}
                  </span>

                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/50">
                    <span>{nomAmbit[noticia.ambit]}</span>
                    {noticia.data && (
                      <>
                        <span>•</span>
                        <span>{formatarDataVisual(noticia.data)}</span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-black text-white leading-snug">
                  {noticia.titol}
                </h3>
                <p className="text-xs text-white/75 leading-relaxed">
                  {noticia.resum}
                </p>
              </article>
            );
          })
        )}
      </main>
    </div>
  );
}
