import { useState } from 'react';
import { TEMARI_DETALL } from '../../constants/temari';

// ============================================================================
// COMPONENT: WebWorkspacePC
// Explicació per a no-programadors:
// Aquest component és el "escriptori d'estudi" de l'estudiant de PC.
// En lloc de veure el disseny d'un mòbil petit, utilitzem l'espai d'una pantalla ampla
// d'ordinador. Té una barra lateral a l'esquerra (Sidebar) per moure's pels diferents
// temes de l'oposició i canviar d'àmbits, i una zona de treball on es mostren exàmens recomanats
// o l'estat d'aprenentatge.
// ============================================================================

interface PropsWorkspacePC {
  progresOriginal: any;
  onTornarLanding: () => void;
  onObrirAppMobilSimulacre: () => void;
}

export default function WebWorkspacePC({ progresOriginal, onTornarLanding, onObrirAppMobilSimulacre }: PropsWorkspacePC) {
  // Estat per triar quina secció de l'espai d'estudis es mira (Temari, Tests, o Estadístiques)
  const [apartatActiu, setApartatActiu] = useState<'temari' | 'tests' | 'guies'>('temari');
  
  // Estat per filtrar els temes segons l'Àmbit (A, B o C)
  const [ambitSeleccionat, setAmbitSeleccionat] = useState<'A' | 'B' | 'C'>('A');

  // Estats per a la creació ràpida de tests
  const [quantitatPreguntes, setQuantitatPreguntes] = useState<number>(30);
  const [tempsLlimit, setTempsLlimit] = useState<string>('45');
  const [testExitos, setTestExitos] = useState(false);

  // Calcula el percentatge general d'estudi
  const totalTemes = 7 + 8 + 5; // 20 temes totals
  const totalLlegits = 
    progresOriginal.A.filter(Boolean).length + 
    progresOriginal.B.filter(Boolean).length + 
    progresOriginal.C.filter(Boolean).length;
  
  const percentatge = Math.round((totalLlegits / totalTemes) * 100);

  const llançarTestExpress = (e: React.FormEvent) => {
    e.preventDefault();
    setTestExitos(true);
    setTimeout(() => {
      setTestExitos(false);
    }, 4000);
  };

  return (
    <div className="bg-[#021329] text-slate-100 min-h-screen font-sans flex antialiased">
      
      {/* 1. BARRA LATERAL (SIDEBAR) ESTIL PC D'ALTA DENSITAT */}
      <aside className="w-80 bg-slate-950 border-r border-blue-950/40 p-6 flex flex-col justify-between hidden lg:flex shrink-0">
        <div className="space-y-8">
          
          {/* Capçalera del Campus d'estudis */}
          <div className="flex items-center gap-3 border-b border-blue-950/40 pb-5">
            <div className="bg-blue-600 px-3 py-1 rounded-lg text-white font-extrabold italic text-xs">
              CAMPUS
            </div>
            <div>
              <h2 className="text-sm font-black italic text-white leading-none uppercase tracking-wider">
                OposiMossos PC
              </h2>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                Àrea d’Alumnes
              </span>
            </div>
          </div>

          {/* Menú de navegació de l'espai d'estudiants */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-slate-600 font-extrabold uppercase tracking-widest mb-1">General</span>
            <button
              id="ws-btn-apartat-temari"
              onClick={() => setApartatActiu('temari')}
              className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer font-bold italic uppercase text-xs ${
                apartatActiu === 'temari' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                  : 'hover:bg-slate-900 border border-transparent text-slate-400'
              }`}
            >
              📖 Temari i Progrés
            </button>
            <button
              id="ws-btn-apartat-tests"
              onClick={() => setApartatActiu('tests')}
              className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer font-bold italic uppercase text-xs ${
                apartatActiu === 'tests' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                  : 'hover:bg-slate-900 border border-transparent text-slate-400'
              }`}
            >
              ⏱️ Crear Simulacres
            </button>
            <button
              id="ws-btn-apartat-guies"
              onClick={() => setApartatActiu('guies')}
              className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer font-bold italic uppercase text-xs ${
                apartatActiu === 'guies' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                  : 'hover:bg-slate-900 border border-transparent text-slate-400'
              }`}
            >
              🎓 Consells d'Oposició
            </button>
          </div>

          {/* Targeta d'estat del rendiment d'estudis */}
          <div className="bg-[#021329] border border-blue-900/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">El Teu Progrés</span>
              <span className="text-[10px] text-[#FFDF00] font-black italic">{percentatge}%</span>
            </div>
            {/* Barra de progrés visual */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-1000" 
                style={{ width: `${percentatge}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-[#FFDF00] font-black uppercase tracking-wider text-center">
              Continua per la teva plaça oficial!
            </p>
          </div>

        </div>

        {/* Accions de sortida secundàries */}
        <div className="space-y-4 border-t border-blue-950/40 pt-5">
          <button
            onClick={onObrirAppMobilSimulacre}
            className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-[10px] font-black italic uppercase tracking-wider py-3 rounded-xl transition-all text-center cursor-pointer"
          >
            Sincronitzar amb el Mòbil (App)
          </button>
          <button
            onClick={onTornarLanding}
            className="w-full text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-wider text-center cursor-pointer"
          >
            ← Sortir al Web públic
          </button>
        </div>
      </aside>

      {/* 2. ZONA DE CONTINGUT CENTRAL PRINCIPAL (WORK AREA) */}
      <main className="flex-1 p-6 sm:p-10 flex flex-col gap-8 max-w-6xl mx-auto overflow-y-auto">
        
        {/* Capçalera superior amb benvinguda */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-950/30 pb-6 w-full">
          <div>
            <h1 className="text-2xl font-black italic uppercase text-white tracking-wide">
              Escriptori d'Estudiants
            </h1>
            <p className="text-xs text-slate-400 font-semibold">
              Prepara les teves proves d'accés a Mossos d'Esquadra des de la millor pantalla.
            </p>
          </div>
          
          {/* Botó per forçar el canvi en el mòbil - útil quan vol veure els marges reals del mockup mòbil */}
          <button 
            onClick={onObrirAppMobilSimulacre}
            className="lg:hidden bg-blue-600 text-white font-black uppercase italic tracking-wider text-[10px] px-4 py-2.5 rounded-lg active:scale-95 transition-all cursor-pointer"
          >
            Obrir Aplicació Mòbil
          </button>
        </div>

        {/* CONTINGUT: SECCIÓ DE LLEGIR TEMARI (APARTAT ACTIU) */}
        {apartatActiu === 'temari' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Selecció d’Àmbits per ràpida resposta */}
            <div className="bg-slate-950/40 border border-slate-900 ring-1 ring-white/5 p-2 rounded-2xl flex gap-2 max-w-md">
              {(['A', 'B', 'C'] as const).map((a) => {
                const actiu = ambitSeleccionat === a;
                const nomAmbit = a === 'A' ? 'Àmbit A (Institucional)' : a === 'B' ? 'Àmbit B (Policial)' : 'Àmbit C (Penal)';
                return (
                  <button
                    key={a}
                    onClick={() => setAmbitSeleccionat(a)}
                    className={`flex-1 text-center py-2.5 rounded-xl text-[10px] font-extrabold italic uppercase transition-all tracking-wider cursor-pointer ${
                      actiu 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {nomAmbit}
                  </button>
                );
              })}
            </div>

            {/* Graella de Temes del Àmbit seleccionat actualment */}
            <div className="grid md:grid-cols-2 gap-4">
              {TEMARI_DETALL[ambitSeleccionat] && Object.keys(TEMARI_DETALL[ambitSeleccionat]).map((clau, index) => {
                const dadesTema = TEMARI_DETALL[ambitSeleccionat][clau as any];
                // Comprova si està llegit el tema sencer utilitzant les dades
                const completatTotal = progresOriginal[ambitSeleccionat][index];
                
                return (
                  <div 
                    key={index} 
                    className="border border-slate-900 bg-[#010c1c]/40 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-900/30 transition-all gap-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-[#FFDF00] font-mono tracking-wider font-extrabold uppercase">
                          {ambitSeleccionat}.{index + 1} • {dadesTema.subtemes.length} Punts de Teoria
                        </span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                          completatTotal ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'
                        }`}>
                          {completatTotal ? '✓ Completat' : 'Pendent'}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-black italic uppercase text-white leading-normal">
                        {dadesTema.titol}
                      </h4>

                      {/* Llista dels primers 3 subtemes d'exemple per comprovar i testejar */}
                      <div className="space-y-1 pt-2">
                        {dadesTema.subtemes.slice(0, 3).map((sub: string, subIdx: number) => (
                          <div key={subIdx} className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="text-blue-500">•</span>
                            <span className="truncate">{sub}</span>
                          </div>
                        ))}
                        {dadesTema.subtemes.length > 3 && (
                          <span className="text-[10px] text-slate-600 font-bold italic block pl-3">
                            i {dadesTema.subtemes.length - 3} capítols més...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-900/40 pt-3 flex items-center justify-between">
                      <button
                        onClick={onObrirAppMobilSimulacre}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-black italic uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Estudiar en format App
                      </button>
                      <span className="text-[8px] text-slate-500 font-mono">ID: {ambitSeleccionat}.{index + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTINGUT: SECCIÓ DE CREACIO DE SIMULACRES D'EXÀMEN (TESTS) */}
        {apartatActiu === 'tests' && (
          <div className="max-w-2xl bg-slate-950/40 border border-slate-900 p-8 rounded-3xl space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h3 className="text-base font-black italic uppercase text-white">Configurar Examen Simulacre de PC</h3>
              <p className="text-xs text-slate-500">
                Pots configurar el simulacres d’exàmens històrics per a avaluar els teus percentatges de triomf abans de la convocatòria oficial.
              </p>
            </div>

            <form onSubmit={llançarTestExpress} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Volum de Preguntes</label>
                  <select
                    value={quantitatPreguntes}
                    onChange={(e) => setQuantitatPreguntes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 outline-none text-xs text-white px-4 py-3.5 rounded-xl transition-all cursor-pointer font-bold uppercase"
                  >
                    <option value={15}>15 Preguntes (Express)</option>
                    <option value={30}>30 Preguntes (Oficial Comú)</option>
                    <option value={50}>50 Preguntes (Doble)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Temps màxim del Rellotge</label>
                  <select
                    value={tempsLlimit}
                    onChange={(e) => setTempsLlimit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 outline-none text-xs text-white px-4 py-3.5 rounded-xl transition-all cursor-pointer font-bold uppercase"
                  >
                    <option value="25">25 Minuts</option>
                    <option value="45">45 Minuts (Oficial)</option>
                    <option value="90">90 Minuts</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes simulat d'Àmbits */}
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Filtres de Temes Actius</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#021329] border border-blue-900/35 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white">Àmbit A</span>
                    <span className="text-[8px] bg-emerald-500 text-slate-950 font-extrabold px-1 rounded">ON</span>
                  </div>
                  <div className="bg-[#021329] border border-blue-900/35 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white">Àmbit B</span>
                    <span className="text-[8px] bg-emerald-500 text-slate-950 font-extrabold px-1 rounded">ON</span>
                  </div>
                  <div className="bg-[#021329] border border-blue-900/35 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white">Àmbit C</span>
                    <span className="text-[8px] bg-emerald-500 text-slate-950 font-extrabold px-1 rounded">ON</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FFDF00] hover:bg-yellow-500 text-[#021329] text-xs font-black italic uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-yellow-500/10 transition-all cursor-pointer"
              >
                Generar Simulacre d'Examen PC
              </button>
            </form>

            {testExitos && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                <p className="text-xs text-emerald-400 font-extrabold uppercase italic tracking-wider">
                  ✓ Generant base de preguntes de test per ordinador...
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Com que t'estàs formant des de l'ordinador, et recomanem fer servir el llançador de l'APP mòbil per provar els nostres simuladors que contenen el 100% de la retroalimentació interactiva en temps real.
                </p>
              </div>
            )}
          </div>
        )}

        {/* CONTINGUT: SECCIÓ D'ACOMPANYAMENT DIDÀCTIC / CONSELLS */}
        {apartatActiu === 'guies' && (
          <div className="bg-[#010c1c]/40 border border-slate-900 p-8 rounded-3xl space-y-6 animate-in fade-in duration-300">
            <h3 className="text-base font-black italic uppercase text-white">El mètode d'estudis guanyador per a Mossos</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Treballar l'oposició de Mossos d'Esquadra requereix disciplina tant en la part intel·lectual com en les teves actituds. El temari oficial inclou aspectes de dret, organització, història i seguretat ciutadana que t'has de saber al detall.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-blue-900/10">
                <span className="text-[10px] text-[#FFDF00] font-black uppercase tracking-wider block mb-2">💡 Com organitzar la setmana</span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  Intenta estudiar un tema de l’Àmbit A i un tema del Àmbit B o C combinats. Mai facis només un sol bloc o et cansaràs molt ràpidament. Els caps de setmana aprofita per avaluar-te amb simulacres de 30 preguntes.
                </p>
              </div>
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-blue-900/10">
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-wider block mb-2">🏃 Prova física a tenir en compte</span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  A OposiMossos tenim la secció completa de proves físiques (Circuit, Navette, i Tracció). Registra-ho en format mòbil per a dur un control net directament des de la pista del pavelló esportiu.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
