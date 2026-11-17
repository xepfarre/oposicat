import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import ExamenActualitat from "./examen_actualitat";
import NoticiesAvuiVista from "./actualitat/NoticiesAvuiVista";
import NoticiesExamenVista from "./actualitat/NoticiesExamenVista";
import ComFuncionaActualitatVista from "./actualitat/ComFuncionaActualitatVista";

/**
 * PANTALLA: ActualitatInici (Només vista APP Mòbil)
 * Comentari planer per a no-programadors:
 * Aquesta és la pantalla principal d'Actualitat dins de Prova teòrica de l'APP mòbil.
 * Fa servir el mateix fons fosc (#010915) i estil de botons que Prova teòrica,
 * i ofereix 4 botons: Notícies d'avui, Notícies per a l'examen, Exàmens d'actualitat i Com funciona.
 */
export default function ActualitatInici({ onTornar }: { onTornar: () => void }) {
  // Estat per controlar quina subpantalla d'Actualitat està veient l'usuari
  const [seccio, setSeccio] = useState<
    "menu" | "noticies_avui" | "noticies_examen" | "examen_actualitat" | "com_funciona"
  >("menu");

  // Subpantalla 1: Notícies d'avui (agrupades en Internacional, Espanya i Catalunya)
  if (seccio === "noticies_avui") {
    return <NoticiesAvuiVista onTornar={() => setSeccio("menu")} />;
  }

  // Subpantalla 2: Notícies per a l'examen (taronja i verd de més recent a més antiga)
  if (seccio === "noticies_examen") {
    return <NoticiesExamenVista onTornar={() => setSeccio("menu")} />;
  }

  // Subpantalla 3: Exàmens d'actualitat (manté exactament el simulador existent)
  if (seccio === "examen_actualitat") {
    return <ExamenActualitat onTornar={() => setSeccio("menu")} />;
  }

  // Subpantalla 4: Com funciona (explicació dels botons i dels colors)
  if (seccio === "com_funciona") {
    return <ComFuncionaActualitatVista onTornar={() => setSeccio("menu")} />;
  }

  return (
    <div
      className="fixed inset-0 w-full overflow-y-auto flex flex-col items-center px-6 pb-20 bg-[#010915] select-none"
      style={{
        WebkitOverflowScrolling: "touch",
        // Comentari planer per a no-programadors: Mateix fons fosc degradat (#010915) que Prova Teòrica per mantenir la coherència visual.
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
          {/* Botó per tornar a Prova teòrica */}
          <button
            onClick={onTornar}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl active:scale-90 shadow-lg cursor-pointer"
            aria-label="Tornar enrere"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <h1 className="text-3xl font-black italic tracking-tighter select-none pl-6 pr-2">
            <span className="text-white">Oposi </span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>

        {/* Títol de la secció + ratlla vermella */}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-white text-lg font-black italic tracking-widest uppercase opacity-95 text-center">
            Actualitat
          </h2>
          <div className="h-1 w-12 bg-red-600 rounded-full" />
        </div>
      </header>

      {/* ELS 4 BOTONS PRINCIPALS (Mateix estil que Prova Teòrica) */}
      <main className="w-full max-w-md flex flex-col items-center gap-3 mt-2">
        <button
          onClick={() => setSeccio("noticies_avui")}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          Notícies d'avui
        </button>

        <button
          onClick={() => setSeccio("noticies_examen")}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          Notícies per a l'examen
        </button>

        <button
          onClick={() => setSeccio("examen_actualitat")}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          Exàmens d'actualitat
        </button>

        {/* Separador suau abans del botó d'ajuda */}
        <div className="w-full h-px bg-white/10 my-1" />

        <button
          onClick={() => setSeccio("com_funciona")}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl py-6 text-white font-black italic uppercase text-[11px] md:text-lg tracking-widest transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          Com funciona
        </button>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="mt-12 opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">
          OposiMossos • Actualitat
        </p>
      </footer>
    </div>
  );
}

