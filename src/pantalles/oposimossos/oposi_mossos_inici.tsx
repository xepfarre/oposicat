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
    <div className="flex h-screen w-full flex-col items-center justify-between pb-6 px-10 bg-[#00274d] overflow-hidden">
      
      {/* CAPÇALERA */}
      <header className="pt-14 w-full flex flex-col items-center gap-6">
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

      {/* ZONA DELS BOTONS */}
      <main className="w-full max-w-xs flex flex-col gap-3">
        
        <button 
          onClick={onProvaTeorica}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-5 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
        >
          <span className="text-white font-black italic text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform">
            Prova Teòrica
          </span>
          <div className="h-0.5 w-8 bg-[#FFDF00] mt-1 rounded-full opacity-50" />
        </button>

        <button 
          onClick={onProvaPractica}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-5 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
        >
          <span className="text-white font-black italic text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform">
            Prova Física
          </span>
          <div className="h-0.5 w-8 bg-[#FFDF00] mt-1 rounded-full opacity-50" />
        </button>

        <button 
          onClick={onProvaPsicologica}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl py-5 flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 group"
        >
          <span className="text-white font-black italic text-xl uppercase tracking-tighter group-hover:scale-105 transition-transform">
            Prova Psicològica
          </span>
          <div className="h-0.5 w-8 bg-[#FFDF00] mt-1 rounded-full opacity-50" />
        </button>

        <div className="grid grid-cols-3 gap-2 mt-1">
          <button className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group">
            <span className="text-white font-black italic text-[8px] uppercase tracking-tighter text-center">
              Patrocinadors
            </span>
          </button>

          <button className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group">
            <span className="text-white font-black italic text-[8px] uppercase tracking-tighter text-center">
              Subscripcions
            </span>
          </button>

          <button className="bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl py-4 flex flex-col items-center justify-center shadow-lg transition-all active:scale-90 group">
            <span className="text-white font-black italic text-[8px] uppercase tracking-tighter text-center">
              Notificacions
            </span>
          </button>
        </div>
      </main>

      {/* PEU DE PÀGINA */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-6">
        <button 
          onClick={onTornar}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tornar a la selecció</span>
        </button>
        
        <p className="text-[9px] font-black uppercase tracking-wider text-white opacity-80 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

    </div>
  );
}
