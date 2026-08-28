// ============================================================================
// COMPONENT: WebLandingMobil
// Explicació per a no-programadors:
// Aquest component és la versió mòbil adaptada per a smartphone d'OposiCAT.
// S'ha configurat la imatge de fons oficial de l'ISPC de forma global per a tota
// la pantalla del dispositiu, amb un vel fosc translúcid que unifica tot l'estil
// visual. Els enllaços, botons i selectors de la graella estan completament elevats 
// de forma neta i accessible amb un disseny polonès i exclusiu de tipus App Nativa.
// ============================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
// Explicació per a no-programadors: Importem la fotografia real de la façana de l'ISPC des dels assets guardats.
import fonsIspc from '../../assets/images/ISPC.jpg';

interface PropsLandingMobil {
  // Explicació per a no-programadors: Acció que permet saltar cap enrere cap a la visual de pantalla d'ordinador (PC).
  onTornarLandingGral: () => void;
  // Explicació per a no-programadors: Acció central per entrar al Campus o fer descàrregues.
  onAnarA_Redireccio: () => void;
}

export default function WebLandingMobil({ onTornarLandingGral, onAnarA_Redireccio }: PropsLandingMobil) {
  // Explicació per a no-programadors: Gestor de rutes intern de react-router.
  const navigate = useNavigate();

  // Explicació per a no-programadors: Aquest estat binari ('true' o 'false') controla si el selector d'oposicions està desplegat.
  const [isDropdownObert, setIsDropdownObert] = useState(false);

  return (
    <div
      style={{
        backgroundImage: `url(${fonsIspc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      className="relative text-slate-100 min-h-screen font-sans flex flex-col justify-between p-4 selection:bg-[#FFDF00] selection:text-slate-900 transition-colors duration-300 overflow-x-hidden"
    >
      {/* Capa global de fons fosc amb lleu desenfocament de vidre per a un disseny premium */}
      {/* Explicació per a no-programadors: Aquest és el vel fosc translúcid (overlay) aplicat a escala global que permet veure subtilment l'acadèmia ISPC de fons de manera elegant sense perdre contrast de lletres. */}
      <div className="absolute inset-0 bg-[#020b16]/92 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Continguts realment elevats amb z-10 per sobre de la imatge de fons global */}
      <div className="relative z-10 flex flex-col justify-between flex-1 w-full space-y-6">

        {/* 1. CAPÇALERA TOTALMENT CENTRADA DE L'APP MÒBIL */}
        {/* Explicació per a no-programadors:
            El logo 'OposiCAT' s'ubica perfectament al mig amb 'Oposi' en color blanc, i 'CAT' en color groc vibrant.
            El subtítol 'Acadèmia Digital' queda col·locat a la part inferior centrat amb la seva mida i color original.
            El botó de Campus es reconverteix a "Descargar APP" a la part dreta absoluta. */}
        <header className="relative flex flex-col items-center justify-center border-b border-white/10 pb-3 min-h-[64px] w-full pt-1.5">
          
          {/* Logotip centrat al mig */}
          <div className="text-center">
            <span className="font-sans font-black text-lg tracking-wider uppercase select-none text-white">
              Oposi<span className="text-[#FFDF00]">CAT</span>
            </span>
            {/* Subtítol centrat a sota */}
            <span className="text-[7.5px] text-slate-500 font-extrabold uppercase tracking-widest block mt-0.5">
              Acadèmia Digital
            </span>
          </div>

          {/* Botó modular a la dreta amb enllaç de redirecció o descàrrega */}
          <button
            onClick={onAnarA_Redireccio}
            className="absolute right-0 top-3 text-[8.5px] font-black italic uppercase tracking-wider bg-gradient-to-r from-blue-700 to-emerald-700 hover:brightness-110 active:scale-95 text-white px-2.5 py-1.5 rounded-lg shadow-md shadow-blue-500/10 cursor-pointer transition-all flex items-center gap-1"
          >
            Descargar APP 📲
          </button>
        </header>

        {/* 2. COMPONENT SELECTOR DE COSSOS DESPLEGABLE HORITZONTAL */}
        {/* Explicació per a no-programadors:
            Aquesta secció utilitza el sistema d'enclavatge per mostrar el botó en tota l'amplada horitzontal.
            Quan és polsat, s'obre un menú elegant de selecció cap avall amb els 4 colors demanats. */}
        <section className="mt-4 mb-4">
          <span className="text-[9.5px] text-[#FFDF00] font-bold uppercase tracking-wider block text-center mb-2 px-1">
            👉 Fes click i sel·leciona l'oposició que vols descobrir i estudiar
          </span>
          
          {/* Botó d'amplada horitzontal d'estil polsador d'alta tecnologia */}
          <button
            onClick={() => setIsDropdownObert(!isDropdownObert)}
            className="w-full bg-[#050c18]/90 border border-slate-700/60 rounded-xl py-3.5 px-4 text-white text-xs sm:text-sm font-extrabold flex items-center justify-between shadow-lg shadow-black/35 hover:bg-slate-900 active:scale-[0.99] transition-all cursor-pointer select-none"
          >
            <div className="flex items-center space-x-2">
              <span>🛡️</span>
              <span>Sel·leciona l'oposició</span>
            </div>
            <span className="text-slate-400 text-xs transition-transform duration-300">
              {isDropdownObert ? '▲' : '▼'}
            </span>
          </button>

          {/* Llistat que es desplega cap avall en fer clic al botó d'amplada total */}
          {isDropdownObert && (
            <div className="mt-2.5 p-2.5 bg-[#050c18] border border-slate-800/80 rounded-xl space-y-2.5 animate-fadeIn">
              
              {/* Botó 1 - Blau: Mossos d'Esquadra */}
              <button
                onClick={() => {
                  setIsDropdownObert(false);
                  navigate('/mossos');
                }}
                className="w-full bg-blue-700/95 hover:bg-blue-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg flex items-center justify-between border border-blue-500/20 shadow-sm transition-all cursor-pointer"
              >
                <span>👮 Mossos d'Esquadra</span>
                <span className="text-[8px] bg-blue-900/50 px-2 py-0.5 rounded text-blue-200">Activa</span>
              </button>

              {/* Botó 2 - Vermell: Bombers de la Generalitat */}
              <button
                onClick={() => {
                  setIsDropdownObert(false);
                  navigate('/bombers');
                }}
                className="w-full bg-red-700/95 hover:bg-red-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg flex items-center justify-between border border-red-500/20 shadow-sm transition-all cursor-pointer"
              >
                <span>🚒 Bombers de la Generalitat</span>
                <span className="text-[8px] bg-red-900/50 px-2 py-0.5 rounded text-red-200">Aviat</span>
              </button>

              {/* Botó 3 - Verd: Agents Rurals */}
              <button
                onClick={() => {
                  setIsDropdownObert(false);
                  navigate('/agents-rurals');
                }}
                className="w-full bg-emerald-700/95 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg flex items-center justify-between border border-emerald-500/20 shadow-sm transition-all cursor-pointer"
              >
                <span>🌲 Agents Rurals</span>
                <span className="text-[8px] bg-emerald-900/50 px-2 py-0.5 rounded text-emerald-200">Aviat</span>
              </button>

              {/* Botó 4 - Taronja: Protecció Civil */}
              <button
                onClick={() => {
                  setIsDropdownObert(false);
                  navigate('/proteccio-civil');
                }}
                className="w-full bg-orange-600/95 hover:bg-orange-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg flex items-center justify-between border border-orange-500/20 shadow-sm transition-all cursor-pointer"
              >
                <span>🛡️ Protecció Civil</span>
                <span className="text-[8px] bg-orange-900/50 px-2 py-0.5 rounded text-orange-200">Aviat</span>
              </button>

            </div>
          )}
        </section>

        {/* 3. HERO SECTION CINESTÈSICA */}
        {/* Explicació per a no-programadors:
            Aquesta secció es fusiona amb el fons general d'alta resolució, emprant un bonic bloc transparent 
            esmerilat amb contorns fins de color d'alta fidelitat per emmarcar perfectament el missatge d'OposiCAT. */}
        <main className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40 backdrop-blur-md shadow-2xl p-5 sm:p-8 flex flex-col justify-center space-y-4 text-center">
          
          <div className="space-y-2">
            <span className="inline-block text-[8px] sm:text-[9.5px] bg-blue-500/15 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full uppercase font-black tracking-widest mx-auto">
              🛡️ Convocatòries Finals 2026 / 2027
            </span>
            <h2 id="hero-titol-mobil" className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
              PREPARA'T L'OPOSICIÓ AMB <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFDF00] to-[#ff9f00]">OPOSICAT</span>
            </h2>
            <p className="text-xs text-[#10b981] font-black uppercase tracking-wider">
              ✦ Som professionals que ja hem passat per l'ISPC ✦
            </p>
          </div>

          <p className="text-sm text-slate-200 tracking-wide leading-relaxed p-3 bg-slate-950/50 backdrop-blur-md rounded-lg border border-slate-800/40 max-w-sm mx-auto font-medium">
            Desenvolupem tecnologia intel·ligent per ajudar-te a memoritzar el temari oficial, superar els psicotècnics d'alt rendiment i aprovar l'entrevista oficial de selecció.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={onAnarA_Redireccio}
              className="w-full max-w-xs mx-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:brightness-110 text-white font-black italic uppercase text-[10px] py-3.5 rounded-xl shadow-lg shadow-blue-500/15 transition-all text-center cursor-pointer active:scale-95 block"
            >
              Comença de franc au mateix 🚀
            </button>
            <button
              onClick={onTornarLandingGral}
              className="text-[9px] text-slate-400 hover:text-white font-black uppercase tracking-wider block mx-auto py-1 cursor-pointer transition-colors"
            >
              ← Veure versió d'escriptori (PC)
            </button>
          </div>
        </main>

        {/* 4. REESTRUCTURACIÓ DE LES TARGETES D'AVANTATGES */}
        <section className="mt-8 mb-4 space-y-4">
          <div className="text-center">
            <span className="text-[8px] text-[#FFDF00] font-black uppercase tracking-widest block mb-1">
              ⚡ PER QUÈ ESTUDIAR AMB NOSALTRES?
            </span>
            <h3 className="text-xs font-extrabold text-[#94a3b8] uppercase tracking-wide">
              Avantatges d'estudi d'OposiCAT
            </h3>
          </div>

          <div id="targetes-avantatges-mobil" className="grid grid-cols-1 gap-4">
            
            <div className="bg-[#070b13]/85 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 shadow-sm space-y-3">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-md">
                <span>✓ El nostre equip d'elit</span>
              </div>
              <h4 className="text-white font-black text-sm tracking-tight">Companys directes de l'escola</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold">
                Som funcionaris en actiu que ja hem passat per l'ISPC i tots os processos selectius oficials de Catalunya. Sabem com aprovar des de dins.
              </p>
            </div>

            <div className="bg-[#070b13]/85 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 shadow-sm space-y-3">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-md">
                <span>✓ Preparació total</span>
              </div>
              <h4 className="text-white font-black text-sm tracking-tight">Totes les fases cobertes al 100%</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold">
                Des del temari teòric completament desglossat, els psicotècnics d'alta capacitat i dret públic, fins al tractament físic directament preparat.
              </p>
            </div>

            <div className="bg-[#070b13]/85 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 shadow-sm space-y-3">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-md">
                <span>✓ Tecnologia mòbil</span>
              </div>
              <h4 className="text-white font-black text-sm tracking-tight">Software propi d'innovació</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold">
                Desenvolupem les nostres pròpies simulacions de simulacres i rutes de pràctiques per oferir-te exactament el mateix dret i preguntes cada any.
              </p>
            </div>

            <div className="bg-[#070b13]/85 backdrop-blur-sm border border-slate-800/60 rounded-xl p-5 shadow-sm space-y-3">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-md">
                <span>✓ Estudia lliurement</span>
              </div>
              <h4 className="text-white font-black text-sm tracking-tight">Adaptabilitat multidispositiu</h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold">
                El campus digital d'OposiCAT s'adapta al mil·límetre a la pantalla del mòbil per permetre't estudiar a qualsevol hora i en qualsevol trajecte.
              </p>
            </div>

          </div>
        </section>

        {/* 5. GRAELLA D'ESTADÍSTIQUES */}
        <section className="my-8 p-4 bg-[#050b14]/85 backdrop-blur-sm border border-slate-800/60 rounded-2xl">
          <div className="text-center mb-4">
            <span className="text-[8px] text-blue-400 font-black tracking-widest uppercase block mb-1">
              ECOSISTEMA MIL·LIMÈTRIC D'OPOSICAT
            </span>
            <h3 className="text-xs font-extrabold text-white uppercase tracking-tight">
              Tot el que necessites per la teva plaça
            </h3>
          </div>

          <div id="estadistiques-bento-mobil" className="grid grid-cols-2 gap-3">
            
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg py-3 px-4 text-center flex flex-col justify-center items-center">
              <span className="text-[#FFDF00] text-xl font-black italic tracking-tight">94.2%</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-1 text-center font-mono">
                Recomanació
              </span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg py-3 px-4 text-center flex flex-col justify-center items-center">
              <span className="text-sky-400 text-xl font-black italic tracking-tight">+250k</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-1 text-center font-mono">
                Tests Comunitaris
              </span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg py-3 px-4 text-center flex flex-col justify-center items-center">
              <span className="text-pink-500 text-xl font-black italic tracking-tight">24/7/365</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-1 text-center font-mono">
                Accés lliure
              </span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg py-3 px-4 text-center flex flex-col justify-center items-center">
              <span className="text-[#FFDF00] text-xl font-black italic tracking-tight">+50</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-1 text-center font-mono">
                Rutes d'Estudi
              </span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg py-3 px-4 text-center flex flex-col justify-center items-center">
              <span className="text-[#10b981] text-xl font-black italic tracking-tight">12</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-1 text-center font-mono">
                Proves Físiques
              </span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg py-3 px-4 text-center flex flex-col justify-center items-center">
              <span className="text-pink-500 text-xl font-black italic tracking-tight">TOP 1</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-1 text-center font-mono">
                Psicotècnics
              </span>
            </div>

            <div className="col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-lg py-3 px-4 text-center flex flex-col justify-center items-center">
              <span className="text-sky-400 text-xs sm:text-sm font-black italic tracking-tight">100% EXCEL·LENT</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mt-1 text-center">
                Simulacres d'Entrevista i Temari Oficial
              </span>
            </div>

          </div>
        </section>

        {/* 6. PEU DE PÀGINA */}
        <footer className="mt-8 border-t border-white/10 pt-8 pb-4 bg-[#010912]/95 -mx-4 px-6 text-center">
          
          <div id="footer-menu-interactiu-mobil" className="grid grid-cols-1 gap-6 text-center">
            
            <div className="space-y-3 pb-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFDF00] to-[#ff7e00] font-black italic text-xl sm:text-2xl block tracking-wide select-none">
                OposicionsCatalunya
              </span>
              <p className="text-slate-400 text-[10px] leading-relaxed font-semibold max-w-xs mx-auto">
                La plataforma estrella d'estudi mòbil i preparació total de l'àmbit de la seguretat a Catalunya.
              </p>
            </div>

            <div className="border-b border-slate-950 pb-5 pt-2">
              <h4 className="text-xs font-bold tracking-widest text-[#FFDF00] mb-3 uppercase">Cossos d'Estudi</h4>
              <div className="flex flex-col space-y-1 font-semibold">
                <a onClick={() => navigate('/mossos')} className="py-2 block text-sm text-slate-350 hover:text-white transition cursor-pointer">
                  👮 Mossos d'Esquadra GENCAT
                </a>
                <span className="py-2 block text-sm text-slate-600 cursor-not-allowed">
                  🚒 Bombers de la Generalitat (Aviat)
                </span>
                <span className="py-2 block text-sm text-slate-600 cursor-not-allowed">
                  🌲 Agents Rurals del Territori (Aviat)
                </span>
                <span className="py-2 block text-sm text-slate-600 cursor-not-allowed">
                  🛡️ Protecció Civil Autonòmica (Aviat)
                </span>
              </div>
            </div>

            <div className="border-b border-slate-950 pb-5">
              <h4 className="text-xs font-bold tracking-widest text-[#FFDF00] mb-3 uppercase">L'Acadèmia</h4>
              <div className="flex flex-col space-y-1 font-semibold">
                <a href="#" className="py-2 block text-sm text-slate-350 hover:text-white transition">
                  Qui som i Equip Docent
                </a>
                <a onClick={onAnarA_Redireccio} className="py-2 block text-sm text-slate-350 hover:text-[#FFDF00] transition cursor-pointer">
                  Campus Virtual OposiCAT 💻
                </a>
                <span className="py-2 block text-sm text-slate-500">
                  Contacte: suport@oposicat.cat ✉
                </span>
              </div>
            </div>

            <div className="border-b border-slate-950 pb-5">
              <h4 className="text-xs font-bold tracking-widest text-[#FFDF00] mb-3 uppercase">Notes Legals</h4>
              <div className="flex flex-col space-y-1 font-semibold">
                <a href="#" className="py-2 block text-sm text-slate-355 hover:text-white transition">
                  Avís Legal
                </a>
                <a href="#" className="py-2 block text-sm text-slate-355 hover:text-white transition">
                  Política de Privacitat
                </a>
                <a href="#" className="py-2 block text-sm text-slate-355 hover:text-white transition">
                  Política de Cookies d'Estudi
                </a>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-4 text-center">
            <p className="text-slate-600 text-[8.5px] font-bold uppercase tracking-widest leading-relaxed">
              © {new Date().getFullYear()} OposicionsCatalunya • Tots els drets reservats de propietat.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
