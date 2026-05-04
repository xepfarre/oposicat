import { ChevronLeft, GraduationCap } from "lucide-react";

/**
 * PANTALLA: EmCostaEstudiarInici
 * Recull de tècniques d'estudi per a persones que tenen dificultats per concentrar-se.
 * Ubicació: /src/pantalles/oposimossos/prova_teorica/em_costa_estudiar_inici.tsx
 */
export default function EmCostaEstudiarInici({ onTornar }: { onTornar: () => void }) {
  
  const metodes = [
    {
      nom: "Mètode Pomodoro",
      url: "https://www.youtube.com/watch?v=V51bTPmFgRs",
      desc: "Gestió del temps i descansos"
    },
    {
      nom: "Mètode Feynman",
      url: "https://www.youtube.com/watch?v=5JsTaboFGig",
      desc: "Aprendre explicant conceptes"
    },
    {
      nom: "Mètode Blurting",
      url: "https://www.youtube.com/watch?v=t_Gl270AJW4",
      desc: "Memorització per descàrrega mental"
    }
  ];

  return (
    <div className="flex min-h-screen w-full flex-col items-center pb-6 px-10 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 mb-8 text-center">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10">
          <h1 className="text-3xl font-black italic tracking-tighter select-none">
            <span className="text-white">Oposi </span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-amber-500" size={24} />
            <h2 className="text-white text-lg font-black italic tracking-tighter uppercase opacity-90">
              Em costa estudiar
            </h2>
          </div>
          <div className="h-0.5 w-12 bg-amber-500 rounded-full mb-1" />
          <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider">
            Tècniques per millorar el teu rendiment
          </p>
        </div>
      </header>

      {/* CONTINGUT: Botons amb enllaços externs */}
      <main className="w-full max-w-sm md:max-w-2xl flex flex-col items-center flex-1 py-4">
        <div className="w-full flex flex-col gap-4">
          {metodes.map((m, idx) => (
            <button 
              key={idx}
              onClick={() => window.open(m.url, '_blank')}
              className="w-full bg-white/10 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 text-left transition-all active:scale-95 shadow-xl group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white font-black italic uppercase text-sm md:text-lg tracking-widest block group-hover:text-amber-200 transition-colors">
                    {m.nom}
                  </span>
                  <span className="text-white/40 text-[10px] md:text-xs font-bold uppercase mt-1 block">
                    {m.desc}
                  </span>
                </div>
                <div className="bg-red-600/20 p-2 rounded-lg">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-red-600 border-b-[6px] border-b-transparent ml-1" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6 mt-12 shrink-0">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tornar a Prova Teòrica</span>
        </button>
        
        <p className="text-[9px] font-black uppercase tracking-wider text-white opacity-80 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

    </div>
  );
}
