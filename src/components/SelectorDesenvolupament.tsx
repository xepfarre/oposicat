import { useState } from 'react';

// ============================================================================
// COMPONENT: SelectorDesenvolupament
// Explicació per a no-programadors:
// Aquest component és com una "caixa de control de darrere de les escenes".
// Es col·loca de manera "flotant" a la part inferior dreta d'OposiCAT
// i té un botó de tipus selector/engranatge. En prémer-lo, s'obre un menú
// on el dissenyador pot triar quina part del web (o de l'app de mòbil) vol visualitzar.
// Permet dissenyar la web, l'APP, la redirecció de descàrrega o el Backoffice de PC
// compartint l'entorn de treball sense danyar cap marge que ja tinguem definit!
// ============================================================================

export type VistaDesenvolupament = 
  | 'app_mobil'               // APP Mòbil original
  | 'web_pc_website'          // WEB - PC - Website (landing oficial)
  | 'web_pc_login'            // WEB - PC - Login (accès privat)
  | 'web_pc_workspace'        // WEB - PC - Workspace (zona d'estudiats web)
  | 'web_pc_backoffice'       // WEB - PC - Backoffice (gestió d'alumnes)
  | 'web_mobil_website'       // WEB - Mòbil - Website (landing adaptada)
  | 'web_smartphone_website'  // WEB - Smartphone - Website (Landing de PC copiada literal per a Smartphone)
  | 'web_mobil_redireccio'    // WEB - Mòbil - Redirecció/Descàrrega de l'APP
  | 'web_pc_mossos';          // WEB - PC - Mossos (pàgina d'aterratge de mossos)

interface PropsSelector {
  vistaActual: VistaDesenvolupament;
  onChangeVista: (novaVista: VistaDesenvolupament) => void;
}

export default function SelectorDesenvolupament({ vistaActual, onChangeVista }: PropsSelector) {
  // Aquest estat controla si la caixa de comandaments està oberta o tancada a la pantalla
  const [obert, setObert] = useState(false);

  // Llista de vistes amb els seus títols i etiquetes funcionals
  const opcionsVistes: { valor: VistaDesenvolupament; titol: string; descripcio: string; color: string }[] = [
    {
      valor: 'app_mobil',
      titol: '📱 APP Mòbil (Actual)',
      descripcio: 'L’aplicació oficial de preparació tal com està ara.',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      valor: 'web_pc_website',
      titol: '🖥️ WEB - PC - Website',
      descripcio: 'Pàgina corporativa d’OposiMossos per a ordinadors de casa.',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    },
    {
      valor: 'web_pc_mossos',
      titol: '👮 WEB - PC - MOSSOS',
      descripcio: 'Pàgina corporativa específica d’accés al Cos de Mossos d’Esquadra.',
      color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
    },
    {
      valor: 'web_pc_login',
      titol: '🔑 WEB - PC - Login',
      descripcio: 'Pantalla de login/registre d’Escriptori amb la foto de fons de Mossos.',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    },
    {
      valor: 'web_pc_workspace',
      titol: '🎓 WEB - PC - Workspace',
      descripcio: 'Espai d’estudi web amb temari i tests per ordinador.',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      valor: 'web_pc_backoffice',
      titol: '🛠️ WEB - PC - Backoffice',
      descripcio: 'Panell de control i comissions del gestor d’OposiCAT.',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      valor: 'web_mobil_website',
      titol: '📱 WEB - Mòbil - Website',
      descripcio: 'Pàgina corporativa d’aterratge adaptada a pantalles de mòbils.',
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    },
    {
      valor: 'web_smartphone_website',
      titol: '📱 WEB - Smartphone - Website',
      descripcio: 'Landing de PC original duplicada per a Smartphone per ensenyar als clients.',
      color: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    },
    {
      valor: 'web_mobil_redireccio',
      titol: '📲 WEB - Mòbil - Redirecció',
      descripcio: 'Pantalla de descàrrega suggerida de l’aplicació mòbil.',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  ];

  return (
    <div id="selector-desenvolupament-flotant" className="fixed bottom-4 right-4 z-[99999] font-sans antialiased">
      {/* Botó Flotant d’Obertura / Tancament amb efecte de pols suau */}
      <button
        id="btn-obrir-selector-dev"
        onClick={() => setObert(!obert)}
        className="w-14 h-14 bg-gradient-to-tr from-slate-900 to-slate-800 text-slate-100 hover:text-white rounded-full flex items-center justify-center shadow-xl border border-slate-700 hover:border-slate-500 transition-all active:scale-95 group relative cursor-pointer"
        title="Canviar vista de l'aplicació (Mode Dev)"
      >
        <svg 
          className={`w-7 h-7 transition-transform duration-500 ${obert ? 'rotate-180 text-rose-400' : 'group-hover:rotate-45'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {obert ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          )}
        </svg>
        {/* Puntet brillant indicador de mode actiu */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
      </button>

      {/* Caixa de Menú Desplegable d'ajustament */}
      {obert && (
        <div id="panell-opcions-dev" className="absolute bottom-16 right-0 w-80 bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex flex-col gap-1 border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black italic text-white uppercase tracking-wider">
              Selector Multivista
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Eina de desenvolupament de vistes per a OposiCAT. Canvia entre mòduls de PC i mòbils fàcilment.
            </p>
          </div>

          {/* S'ubiquen totes les opcions de treball */}
          <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
            {opcionsVistes.map((opcio) => {
              const actiu = vistaActual === opcio.valor;
              return (
                <button
                  id={`btn-vista-dev-${opcio.valor}`}
                  key={opcio.valor}
                  onClick={() => {
                    onChangeVista(opcio.valor);
                    setObert(false); // Es tanca per comoditat després de seleccionar
                  }}
                  className={`w-full text-left p-3 rounded-2xl flex flex-col gap-1 transition-all border cursor-pointer active:scale-98 ${
                    actiu 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-slate-950 border-slate-900 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black italic tracking-wide">
                      {opcio.titol}
                    </span>
                    {actiu && (
                      <span className="text-[9px] bg-white text-blue-800 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                        Actiu
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] leading-snug font-medium ${actiu ? 'text-blue-100' : 'text-slate-400'}`}>
                    {opcio.descripcio}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-800 pt-3 mt-1 flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
              OposiCAT • Dev V1.2
            </span>
            <button
              onClick={() => {
                onChangeVista('app_mobil');
                setObert(false);
              }}
              className="text-[9px] text-rose-400 hover:text-rose-300 font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Forçar Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
