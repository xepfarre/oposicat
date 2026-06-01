// ============================================================================
// COMPONENT: WebRedireccioMobil
// Explicació per a no-programadors:
// Aquest mòdul conté la pantalla de "Redirecció de Descàrrega per a mòbils".
// Si un alumne intenta utilitzar la versió Web des d'un telèfon de pantalla petita,
// la mateixa web li diu educadament que l'aplicació funciona 10 vegades millor si es
// descarrega l'APP directament del mercat d'aplicacions. Mostra botons de descàrrega
// de l'App Store i Google Play (amb dissenys visuals de tipus botó de descàrrega)
// i un botó gran per començar a utilitzar l'APP directament en línia de forma alternativa.
// ============================================================================

interface PropsRedireccio {
  onTornarLandingMobil: () => void;
  onLlançarAppMòbil: () => void;
}

export default function WebRedireccioMobil({ onTornarLandingMobil, onLlançarAppMòbil }: PropsRedireccio) {
  return (
    <div className="bg-[#021329] text-slate-100 min-h-screen font-sans flex flex-col justify-between p-6 selection:bg-blue-600 selection:text-white antialiased">
      
      {/* 1. SECCIÓ SUPERIOR AMB BOTONS DE TORNADA */}
      <nav className="flex items-center justify-between border-b border-blue-950/30 pb-4 h-16">
        <button
          onClick={onTornarLandingMobil}
          className="text-[10px] text-slate-400 hover:text-white font-extrabold uppercase tracking-wide cursor-pointer flex items-center gap-1.5"
        >
          ← Tornar
        </button>
        <div className="text-[9px] text-[#FFDF00] font-black uppercase tracking-widest leading-none">
          OposiMossos APP
        </div>
      </nav>

      {/* 2. AREA DE DESCARREGA PROPIAMENT */}
      <main className="flex-1 py-10 flex flex-col justify-center items-center gap-8 max-w-sm mx-auto text-center">
        
        {/* Icona circular animada d'OposiMossos mòbil */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#FFDF00]/20 rounded-3xl filter blur-xl animate-pulse"></div>
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-700 to-[#FFDF00] p-1 rounded-3xl shadow-xl flex items-center justify-center relative border border-white/15">
            <div className="bg-[#021329] w-full h-full rounded-[20px] flex items-center justify-center text-white font-black italic text-xl">
              OM
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-1 rounded-full shadow border-2 border-[#021329] uppercase tracking-widest leading-none">
            Gratis
          </span>
        </div>

        {/* Títol cridaner de tipus App */}
        <div className="space-y-3">
          <h2 className="text-2xl font-black italic uppercase leading-tight text-white">
            Descarrega l'APP d'OposiMossos
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto font-medium">
            Estudies des del mòbil? S'ha detectat que estàs utilitzant una pantalla tàctil petita. El nostre simulador de test en línia està totalment integrat i optimitzat per a mòbil si el descarregues oficialment:
          </p>
        </div>

        {/* CONTINGUDS VISUALS DE MERCAT D’APLICACIONS */}
        <div className="space-y-4 w-full">
          
          {/* Botó Simulat: Google Play Store */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onLlançarAppMòbil(); // Per provar, l’enllacem directament a l'APP del dispositiu
            }}
            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-98 cursor-pointer"
          >
            <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-xl">
              🤖
            </div>
            <div className="text-left">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">Disponible a</span>
              <span className="text-white text-xs font-black uppercase italic tracking-wider leading-none">Google Play Store</span>
            </div>
          </a>

          {/* Botó Simulat: Apple App Store */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onLlançarAppMòbil(); // Per provar, l’enllacem directament a l'APP del dispositiu
            }}
            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-98 cursor-pointer"
          >
            <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-xl">
              🍎
            </div>
            <div className="text-left">
              <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">Disponible a</span>
              <span className="text-white text-xs font-black uppercase italic tracking-wider leading-none">Apple App Store</span>
            </div>
          </a>

        </div>

        {/* Separador visual de camí alternatiu */}
        <div className="relative w-full flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-900"></div>
          </div>
          <span className="relative bg-[#021329] px-4 text-[9px] text-slate-600 font-mono uppercase tracking-widest font-extrabold">O també</span>
        </div>

        {/* Botó ràpid per provar directament el simulacre mòbil */}
        <button
          onClick={onLlançarAppMòbil}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black italic uppercase py-4 rounded-xl shadow-lg shadow-blue-500/10 transition-all cursor-pointer"
        >
          Iniciar App al Navegador
        </button>

      </main>

      {/* 3. FOOTER */}
      <footer className="text-center text-slate-600 text-[8px] leading-loose font-semibold uppercase tracking-wider border-t border-blue-950/20 pt-4 pb-2">
        OposiMossos • Campus Oficial • Segur i lliure d'Spam
      </footer>
    </div>
  );
}
