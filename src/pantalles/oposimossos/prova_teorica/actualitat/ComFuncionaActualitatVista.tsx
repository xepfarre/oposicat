import { ChevronLeft } from "lucide-react";

/**
 * VISTA: Com funciona (Actualitat - APP Mòbil)
 * Comentari planer per a no-programadors:
 * Explica de manera breu i clara què fa cada botó de la pantalla d'Actualitat
 * i quin significat tenen els tres colors de les notícies (blanc, taronja i verd).
 */
export default function ComFuncionaActualitatVista({ onTornar }: { onTornar: () => void }) {
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
            Com funciona
          </h2>
          <div className="h-1 w-12 bg-red-600 rounded-full" />
        </div>
      </header>

      {/* CONTINGUT EXPLICATIU BREU */}
      <main className="w-full max-w-md flex flex-col gap-6 pb-8">
        {/* Bloc 1: Què hi ha a cada botó */}
        <section className="bg-white/10 border border-white/20 rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <h3 className="text-xs font-black italic uppercase tracking-[0.2em] text-white/90">
            Què trobaràs a cada botó
          </h3>

          <div className="flex flex-col gap-2.5 text-xs text-white/80 leading-relaxed">
            <p>
              <strong className="text-white">Notícies d'avui:</strong> Les notícies destacades del dia d'avui, ordenades en Internacional, Espanya i Catalunya.
            </p>
            <p>
              <strong className="text-white">Notícies per a l'examen:</strong> El recull històric de totes les notícies marcades en taronja o verd, ordenades de la més recent a la més antiga.
            </p>
            <p>
              <strong className="text-white">Exàmens d'actualitat:</strong> Tests tipus examen per posar a prova el que has après.
            </p>
          </div>
        </section>

        {/* Bloc 2: Significat dels colors */}
        <section className="bg-white/10 border border-white/20 rounded-xl p-5 shadow-lg flex flex-col gap-3">
          <h3 className="text-xs font-black italic uppercase tracking-[0.2em] text-white/90">
            Què vol dir cada color
          </h3>

          <div className="flex flex-col gap-3">
            {/* Color Blanc */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/15 rounded-xl p-3">
              <span className="w-3.5 h-3.5 rounded-full bg-white shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              <div className="text-xs">
                <span className="font-black uppercase tracking-wider text-white block">
                  Blanc
                </span>
                <span className="text-white/75">
                  Poc probable que surti a l'examen.
                </span>
              </div>
            </div>

            {/* Color Taronja */}
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
              <div className="text-xs">
                <span className="font-black uppercase tracking-wider text-amber-300 block">
                  Taronja
                </span>
                <span className="text-white/80">
                  Possible que surti a l'examen.
                </span>
              </div>
            </div>

            {/* Color Verd */}
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              <div className="text-xs">
                <span className="font-black uppercase tracking-wider text-emerald-300 block">
                  Verd
                </span>
                <span className="text-white/80">
                  Probable que surti a l'examen.
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
