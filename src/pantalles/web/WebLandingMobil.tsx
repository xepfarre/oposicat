// ============================================================================
// COMPONENT: WebLandingMobil
// Explicació per a no-programadors:
// Aquest component és la pàgina d'entrada (Landing) però quan un usuari
// entra a la web utilitzant el seu dispositiu mòbil.
// El disseny de PC és massa gran per a la pantalla d'un telèfon, així que aquí
// simplifiquem els textos, fem botons grans fàcils de polsar amb el polze,
// i ens enfoquem en mostrar la qualitat d'OposiMossos perquè s'apuntin a l'acadèmia.
// ============================================================================

interface PropsLandingMobil {
  onTornarLandingGral: () => void;
  onAnarA_Redireccio: () => void;
}

export default function WebLandingMobil({ onTornarLandingGral, onAnarA_Redireccio }: PropsLandingMobil) {
  return (
    <div className="bg-[#021329] text-slate-100 min-h-screen font-sans flex flex-col justify-between p-5 selection:bg-blue-600 selection:text-white">
      
      {/* 1. CAPÇALERA SIMPLIFICADA PER A MÒBIL */}
      <header className="flex items-center justify-between border-b border-blue-950/30 pb-4 h-16">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-blue-700 to-[#FFDF00] p-0.5 rounded-lg shadow-md">
            <div className="bg-[#021329] px-2 py-0.5 rounded-[5px] text-[11px] font-black italic tracking-wider">
              Oposi<span className="text-[#FFDF00]">Mossos</span>
            </div>
          </div>
          <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest">
            Mòbil Web
          </span>
        </div>
        
        {/* Enllaç discret per anar directament a la redirecció de descàrrega d'App */}
        <button
          onClick={onAnarA_Redireccio}
          className="text-[9px] text-[#FFDF00] font-black italic uppercase tracking-wider bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg cursor-pointer"
        >
          DESCARREGAR APP
        </button>
      </header>

      {/* 2. ZONA HERO SLIDE-UP */}
      <main className="flex-1 py-10 flex flex-col justify-center gap-8">
        <div className="space-y-4 text-center">
          <span className="inline-block text-[9px] bg-blue-600/10 border border-blue-600/20 text-blue-400 px-3 py-1 rounded-full uppercase font-black tracking-widest">
            🛡️ Convocatòria Mossos 2026/2027
          </span>
          <h2 className="text-3xl font-black italic uppercase tracking-tight leading-none text-white">
            Prepara la teva plaça a <span className="bg-gradient-to-r from-blue-400 to-[#FFDF00] bg-clip-text text-transparent">Mossos d’Esquadra</span>
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto font-medium">
            Entra a l'única acadèmia digital línia que conté un temari optimitzat, simulacres d'exàmens reals i controls de progrés des de qualsevol dispositiu mòbil.
          </p>
        </div>

        {/* Cridada a l'Acció de Gran Format Mòbil */}
        <div className="space-y-3 flex flex-col items-center">
          <button
            onClick={onAnarA_Redireccio}
            className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase text-xs py-4 rounded-xl shadow-lg shadow-blue-500/15 transition-all text-center cursor-pointer"
          >
            Únete de franc a l'App Oficial
          </button>
          <button
            onClick={onTornarLandingGral}
            className="text-[9px] text-slate-500 hover:text-white font-black uppercase tracking-wider py-2 cursor-pointer"
          >
            ← Veure versió de PC d'escriptori
          </button>
        </div>

        {/* Petit mock-up minimalista amb dades KPIs clau */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 space-y-3 max-w-sm mx-auto w-full">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block text-center">Mètode OposiMossos</span>
          
          <div className="grid grid-cols-2 gap-4 divide-x divide-slate-900 text-center">
            <div>
              <div className="text-lg font-black text-[#FFDF00] italic">92%</div>
              <div className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">Aprovació</div>
            </div>
            <div>
              <div className="text-lg font-black text-blue-400 italic">4k+</div>
              <div className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">Aprovats Reals</div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. PEU DE PÀGINA DE TRACTAMENT MÒBIL */}
      <footer className="border-t border-blue-950/20 pt-4 pb-2 text-center text-slate-600 text-[9px] leading-loose font-semibold uppercase tracking-wider">
        © {new Date().getFullYear()} OposiCAT • OposiMossos Acadèmia Línia
      </footer>
    </div>
  );
}
