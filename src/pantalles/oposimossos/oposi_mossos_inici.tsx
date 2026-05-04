import { ChevronLeft } from "lucide-react";

/**
 * PANTALLA: OposiMossosInici
 * Pantalla principal de la secció de Mossos d'Esquadra.
 * Ubicació: /src/pantalles/oposimossos/oposi_mossos_inici.tsx
 */
export default function OposiMossosInici({ 
  onTornar, 
  onProvaTeorica,
  onProvaPractica,
  onProvaPsicologica
}: { 
  onTornar: () => void, 
  onProvaTeorica: () => void,
  onProvaPractica?: () => void,
  onProvaPsicologica?: () => void
}) {
  
  return (
    <div className="flex h-screen w-full flex-col items-center pb-6 px-10 bg-[#00274d] overflow-y-auto">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6 shrink-0 mb-2">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10">
          <h1 className="text-3xl font-black italic tracking-tighter select-none">
            <span className="text-white">Oposi </span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>
        
        <h2 className="text-white text-lg font-black italic tracking-tighter uppercase opacity-90">
          Benvingut, <span className="text-red-500">aspirant</span>
        </h2>
      </header>

      {/* 
          ZONA DELS BOTONS: 
          En mòbil una columna, en tauletes (md:) podem jugar amb l'espai.
      */}
      <main className="w-full max-w-sm md:max-w-2xl flex flex-col gap-3">
        
        {/* Bloc 0: Accés directe a la convocatòria (A dalt de tot) */}
        <button 
          onClick={() => window.open('https://mossos.gencat.cat/ca/els_mossos_desquadra/acces_al_cos/Mosso_a/mosso-a-convocatoria-46-25-de-maig-de-2025/', '_blank')}
          className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl py-4 md:py-5 flex items-center justify-center shadow-lg shadow-amber-900/10 transition-all active:scale-95 group"
        >
          <span className="text-amber-100 font-black italic text-sm md:text-base uppercase tracking-widest group-hover:scale-105 transition-transform">
            La meva oposició
          </span>
        </button>

        {/* Línia de separació gris */}
        <div className="flex items-center py-1">
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Botons principals en grid en tauletes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button 
            onClick={onProvaTeorica}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-4 md:py-6 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
          >
            <span className="text-white font-black italic text-lg md:text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform text-center px-4">
              Prova Teòrica
            </span>
            <div className="h-0.5 w-8 bg-red-600 mt-1 rounded-full opacity-50" />
          </button>

          <button 
            onClick={onProvaPractica}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-4 md:py-6 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
          >
            <span className="text-white font-black italic text-lg md:text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform text-center px-4">
              Prova Física
            </span>
            <div className="h-0.5 w-8 bg-red-600 mt-1 rounded-full opacity-50" />
          </button>

          <button 
            onClick={onProvaPsicologica}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-4 md:py-6 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
          >
            <span className="text-white font-black italic text-lg md:text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform text-center px-4">
              Prova Psicològica
            </span>
            <div className="h-0.5 w-8 bg-red-600 mt-1 rounded-full opacity-50" />
          </button>
        </div>

        {/* Línia de separació gris */}
        <div className="flex items-center py-1">
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* FILA INFERIOR: Botons auxiliars */}
        <div className="grid grid-cols-3 gap-2 mt-1 md:mt-4">
          <button className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 md:py-8 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group">
            <span className="text-white font-black italic text-[8px] md:text-xs uppercase tracking-tighter text-center px-2">
              Patrocinadors
            </span>
          </button>

          <button className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 md:py-8 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group">
            <span className="text-white font-black italic text-[8px] md:text-xs uppercase tracking-tighter text-center px-2">
              Notificacions
            </span>
          </button>

          <button className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 md:py-8 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group">
            <span className="text-white font-black italic text-[8px] md:text-xs uppercase tracking-tighter text-center px-2">
              Opcions
            </span>
          </button>
        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6 mt-8 shrink-0">
        <p className="text-[9px] font-black uppercase tracking-wider text-white opacity-80 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>
    </div>
  );
}
