import { useState } from 'react';
import FormulariAutenticacio from '../components/FormulariAutenticacio';

/**
 * PANTALLA DE BENVINGUDA ALPHA (FRONTEND)
 * Aquest component serveix com a porta d'entrada inicial per als tests de l'aplicació.
 * Permet escollir entre l'accés simulat d'usuari final (desactivat de moment) o l'accés complet de prova administratriva.
 * 
 * Re-dissenyat completament de conformitat amb l'última captura, fent servir l'estètica
 * ràpida de colors i lletres corporatives d'OposiMossos.
 */
export default function PantallaBenvinguda({
  onEntrarComAdmin,
  onEntrarComUsuari
}: {
  // Funció que es llançarà per entrar en mode "administrador/tot obert"
  onEntrarComAdmin: () => void;
  // Funció que es llançarà quan un estudiant iniciï la sessió correctament
  onEntrarComUsuari: (perfil: any) => void;
}) {
  const [mostrarAuth, setMostrarAuth] = useState(false);

  return (
    <div 
      className="fixed inset-0 w-full bg-[#010915] overflow-y-auto flex flex-col items-center px-6 pb-12 pt-8" 
      style={{ 
        WebkitOverflowScrolling: "touch",
        // Explicació per a no-programadors: Deixem la imatge de fons amb un to molt més fosc alineat amb el disseny d'OposiCAT per a màxima consonància estètica a tota l'App en qualsevol dispositiu, i amb posició del 20% bottom igual que a la pantalla d'inici original.
        backgroundImage: "linear-gradient(to bottom, rgba(1, 9, 21, 0.92), rgba(1, 9, 21, 0.96)), url('/assets/imatges/fons_ispc.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "20% bottom"
      }}
    >
      
      {/* CAPÇALERA IDÈNTICA AL LOGO PRINCIPAL */}
      <header className="relative z-10 pt-10 w-full flex flex-col items-center gap-6 shrink-0 mb-4">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10">
          <h1 className="text-3xl font-black italic tracking-tighter select-none">
            <span className="text-white">Oposi</span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>
      </header>

      {/* TÍTOL DE LA SETMANA (OPOSICAT ALPHA) */}
      <div className="relative z-10 flex flex-col items-center text-center mt-2 max-w-xs shrink-0 font-sans">
        <h2 className="text-white text-2xl font-black italic tracking-tighter uppercase opacity-95 leading-none">
          OPOSICAT
        </h2>
        <p className="text-red-500 font-black italic text-[11px] tracking-wider uppercase mt-1">
          {mostrarAuth ? "Pas 2: Autenticació Protegida" : "Versió Alpha ( test per a usuari )"}
        </p>
        {/* Línia vermella característica d'estil */}
        <div className="h-0.5 w-12 bg-red-600 mt-2.5 rounded-full opacity-60" />
      </div>

      {mostrarAuth ? (
        <div className="relative z-10 w-full max-w-sm mt-8 animate-fade-in shrink-0">
          <FormulariAutenticacio 
            onSessioIniciada={onEntrarComUsuari} 
            onTornar={() => setMostrarAuth(false)} 
          />
        </div>
      ) : (
        /* SECCIÓ CENTRAL: CLONES EXACTES DELS BOTONS D'OPOSIMOSSOS */
        <main className="relative z-10 w-full max-w-sm flex flex-col gap-6 my-10 px-2 shrink-0">
          
          {/* BOTÓ 1: ENTRAR COM USUARI (ACTIU AMB PANTALLA DE LOG IN REAL) */}
          <div className="flex flex-col w-full">
            <span className="text-[#FFDF00] font-black italic text-xs uppercase tracking-wider text-center mb-2.5 block leading-normal">
              Entrar com ho faria un usuari
            </span>
            <button
              onClick={() => setMostrarAuth(true)}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/25 rounded-2xl py-5 flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 group cursor-pointer text-center"
            >
              <span className="text-white font-black italic text-base uppercase tracking-wider group-hover:scale-105 transition-transform">
                Entrar com usuari
              </span>
              <div className="h-0.5 w-10 bg-red-600 mt-2 rounded-full shadow-md" />
            </button>
          </div>

          {/* LÍNIES SEPARADORES DE CONTINGUT */}
          <div className="flex items-center justify-center py-1">
            <div className="w-32 h-px bg-white/10" />
          </div>

          {/* BOTÓ 2: ENTRAR COM ADMIN (ACTIU I DESBLOQUEJAT) */}
          <div className="flex flex-col w-full">
            <span className="text-[#FFDF00] font-black italic text-xs uppercase tracking-wider text-center mb-2.5 block leading-normal">
              Entrar com admin (sense logging tot desbloquejat)
            </span>
            <button
              onClick={onEntrarComAdmin}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/25 rounded-2xl py-5 flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 group cursor-pointer text-center"
            >
              <span className="text-white font-black italic text-base uppercase tracking-wider group-hover:scale-105 transition-transform">
                Entrar com admin
              </span>
              <div className="h-0.5 w-10 bg-red-600 mt-2 rounded-full shadow-md" />
            </button>
          </div>

        </main>
      )}

      {/* PEU DE PÀGINA I VERSIÓ DEMANADA */}
      <footer className="relative z-10 w-full max-w-xs flex flex-col items-center gap-3 mt-auto shrink-0 pt-4">
        <span className="text-white/40 font-black italic text-[10px] uppercase tracking-widest bg-white/5 py-1.5 px-4 rounded-xl border border-white/5">
          Versió 0.0110678
        </span>
        
        <p className="text-[9px] font-black uppercase tracking-wider text-white opacity-80 select-none whitespace-nowrap">
          Preparació acadèmica per a oposicions de l'ISPC
        </p>
      </footer>

    </div>
  );
}
