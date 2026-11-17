import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  AmbitNoticia,
  NoticiaActualitat,
  carregarNoticiesActualitat,
  obtenirDataAvuiCatalunya,
  obtenirEstilColor,
} from "./actualitatService";

/**
 * VISTA: Notícies d'avui (APP Mòbil)
 * Comentari planer per a no-programadors:
 * Mostra les notícies del dia actual llegides de "noticies_actualitat" a Firestore,
 * separades en tres blocs: Internacional, Espanya i Catalunya.
 * Cada notícia ensenya el seu color (blanc, taronja o verd), titular i resum curt.
 */
export default function NoticiesAvuiVista({ onTornar }: { onTornar: () => void }) {
  const [noticiesAvui, setNoticiesAvui] = useState<NoticiaActualitat[]>([]);
  const [carregant, setCarregant] = useState(true);

  useEffect(() => {
    let actiu = true;
    const carregar = async () => {
      setCarregant(true);
      const totes = await carregarNoticiesActualitat();
      const avui = obtenirDataAvuiCatalunya();
      // Filtrem només les notícies que tenen la data d'avui
      const delDia = totes.filter((n) => n.data === avui);
      if (actiu) {
        setNoticiesAvui(delDia);
        setCarregant(false);
      }
    };
    carregar();
    return () => {
      actiu = false;
    };
  }, []);

  // Els 3 blocs oficials en l'ordre sol·licitat
  const blocs: { id: AmbitNoticia; titol: string }[] = [
    { id: "internacional", titol: "Internacional" },
    { id: "espanya", titol: "Espanya" },
    { id: "catalunya", titol: "Catalunya" },
  ];

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
            Notícies d'avui
          </h2>
          <div className="h-1 w-12 bg-red-600 rounded-full" />
        </div>
      </header>

      {/* CONTINGUT PRINCIPAL */}
      <main className="w-full max-w-md flex flex-col gap-6 pb-8">
        {carregant ? (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
              Carregant notícies...
            </p>
          </div>
        ) : noticiesAvui.length === 0 ? (
          <div className="w-full bg-white/5 border border-white/15 rounded-2xl p-8 text-center shadow-lg">
            <p className="text-white/80 text-sm font-bold tracking-wide">
              Encara no hi ha notícies
            </p>
          </div>
        ) : (
          blocs.map((bloc) => {
            const noticiesBloc = noticiesAvui.filter((n) => n.ambit === bloc.id);

            return (
              <section key={bloc.id} className="w-full flex flex-col gap-3">
                {/* Títol del bloc geogràfic */}
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black italic uppercase tracking-[0.2em] text-white/80">
                    {bloc.titol}
                  </h3>
                  <div className="flex-1 h-px bg-white/10 ml-3" />
                </div>

                {noticiesBloc.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-center">
                    <p className="text-white/50 text-xs font-medium">
                      Encara no hi ha notícies
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {noticiesBloc.map((noticia) => {
                      const estil = obtenirEstilColor(noticia.color);
                      return (
                        <article
                          key={noticia.id}
                          className={`bg-white/10 border border-white/15 ${estil.voraClass} rounded-xl p-4 shadow-lg flex flex-col gap-2`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${estil.badgeClass}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${estil.puntClass}`} />
                              {estil.etiqueta}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-white leading-snug">
                            {noticia.titol}
                          </h4>
                          <p className="text-xs text-white/75 leading-relaxed">
                            {noticia.resum}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
