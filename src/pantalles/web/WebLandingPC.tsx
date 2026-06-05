import { useState, useEffect } from 'react';

// Importacions d'imatges generades amb IA per a la secció psicoprofessioonal
// @ts-ignore
import biodataTestImage from '../../assets/images/biodata_test_mock_1780249798091.png';
// @ts-ignore
import ispcQuestionsImage from '../../assets/images/ispc_questions_mock_1780249816019.png';
// @ts-ignore
import psychoInterviewImage from '../../assets/images/psychological_interview_1780249831944.png';
// @ts-ignore
import fonsTeorica from '../../assets/images/fons_teorica_1780343152615.png';
// @ts-ignore
import fonsFisica from '../../assets/images/fons_fisica_1780343173628.png';
// @ts-ignore
import fonsPsicologica from '../../assets/images/fons_psicologica_1780343193032.png';

// ============================================================================
// COMPONENT: WebLandingPC
// Explicació per a no-programadors:
// Aquesta és la landing page (pàgina d'aterratge) de cara al públic en general que
// entra des del seu ordinador a "oposimossos.cat" o s'ho troba a Google.
// Té seccions professionals per atraure clients, ensenya dades de l'escola,
// preus simulats de subscripcions i botons ben clars. També redirigeix a l'Espai d'Estudis (Workspace).
// ============================================================================

interface PropsWebLanding {
  onEntrarWorkspace: () => void;
  onEntrarBackoffice: () => void;
  onSimularEntrarMovil: () => void;
}

export default function WebLandingPC({ onEntrarWorkspace, onEntrarBackoffice, onSimularEntrarMovil }: PropsWebLanding) {
  // Aquest estat simula que l'estudiant demana informació i se li mostra un avís d'èxit
  const [formulariEnviat, setFormulariEnviat] = useState(false);
  const [correu, setCorreu] = useState('');

  // Estats exclusius per al Simulador Interactiu de Proves Físiques (Recreació de la imatge):
  // Explicació per a no-programadors:
  // Aquests estats fan que el telèfon interactiu que es mostra a la landing sigui realment 
  // operatiu. Es pot triar Gènere (home/dona), activar o desactivar el cronòmetre de la foto,
  // i canviar entre la calculadora intel·ligent i el llistat oficial de taula de marques.
  const [sexeSelecionat, setSexeSelecionat] = useState<'home' | 'dona'>('home');
  const [actiuCrono, setActiuCrono] = useState<boolean>(false);
  const [segonsCrono, setSegonsCrono] = useState<number>(43);
  const [pestanyaCrono, setPestanyaCrono] = useState<'calculadora' | 'valors'>('calculadora');
  
  // Explicació per a no-programadors:
  // Aquest estat controla quina de les 6 captures de l'App (sol·licitades per l'usuari en format imatges reals)
  // s'està mostrant en cada moment a l'interior de la maqueta (smartphone emulat) de la secció de Teoria.
  const [capturaActiva, setCapturaActiva] = useState<number>(0);

  // Nous estats per al carrusel de la secció del Barem i Preparació Física i Àrea Psicoprofessional
  // Explicació per a no-programadors:
  // Aquests estats s'utilitzen per donar l'efecte de programari real a la recreació mòbil i controlar el canvi d'imatges.
  const [capturaFisicaActiva, setCapturaFisicaActiva] = useState<number>(0);
  const [capturaPsicoActiva, setCapturaPsicoActiva] = useState<number>(0);
  const [dietaConsumida, setDietaConsumida] = useState<number>(1036);
  const [filtreGimnas, setFiltreGimnas] = useState<string>("AMB PRESS");
  const [segonsAgilitat, setSegonsAgilitat] = useState<number>(16.66);
  const [sexeAgilitat, setSexeAgilitat] = useState<'home' | 'dona'>('home');
  const [musculObert, setMusculObert] = useState<string>("PECTORAL MAJOR");
  const [diesPla, setDiesPla] = useState<boolean[]>([true, true, true, false, true, true, false, false]);

  // Estats interactius reals per a la simulació de la 3ra prova (Psicoprofessional) d'OposiCAT
  const [categoriaPreguntaOberta, setCategoriaPreguntaOberta] = useState<number | null>(null);
  const [citaTornSeleccionat, setCitaTornSeleccionat] = useState<'mati' | 'tarda'>('mati');
  const [citaHoraSeleccionada, setCitaHoraSeleccionada] = useState<string>('10:00');

  // Increment automàtic del cronòmetre si l'usuari el té engegat
  useEffect(() => {
    let interval: any = null;
    if (actiuCrono) {
      interval = setInterval(() => {
        setSegonsCrono((prev) => (prev >= 999 ? 0 : prev + 1));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [actiuCrono]);

  // Explicació per a no-programadors:
  // Funció per realitzar un desplaçament (scroll) suau i net cap a qualsevol secció de la pàgina
  // sense haver d'alterar la barra de direccions ni utilitzar els símbols "#" que bloquegen la barra.
  const ferScrollASeccio = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const enviarFormulari = (e: React.FormEvent) => {
    e.preventDefault();
    if (correu) {
      setFormulariEnviat(true);
      setTimeout(() => {
        setFormulariEnviat(false);
        setCorreu('');
      }, 4000);
    }
  };

  return (
    <div className="bg-[#021329] text-slate-100 min-h-screen font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* 1. BARRA DE NAVEGACIÓ SUPERIOR (NAVBAR) EXCLUSIVA DE PC */}
      <nav className="border-b border-blue-950/40 bg-[#021329]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo d'OposiMossos amb imatge o vector de qualitat */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-[#FFDF00] p-0.5 rounded-lg shadow-md">
              <div className="bg-[#021329] px-2.5 py-1 rounded-[6px] text-white font-extrabold italic tracking-wider text-sm">
                Oposi<span className="text-[#FFDF00]">Mossos</span>
              </div>
            </div>
            <span className="text-slate-500 font-mono text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full tracking-wider uppercase font-bold hidden sm:inline-block">
              Web Oficial
            </span>
          </div>

          {/* Menú d'enllaços fidedignes i estructurats - OposiCAT */}
          {/* Explicació per a no-programadors:
              Aquests 5 botons d'apartat permeten anar directament als punts demanats per l'usuari i compten amb efectes visuals avançats per fer la interfície més moderna i homogènia. */}
          <div className="hidden md:flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <button
              onClick={() => ferScrollASeccio('elegeix-nos')}
              className="hover:text-white transition-all duration-300 cursor-pointer bg-transparent border border-transparent hover:border-slate-800/60 hover:bg-[#021329]/80 px-3.5 py-2 rounded-xl text-xs font-black uppercase duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              Elegeix-nos
            </button>
            <button
              onClick={() => ferScrollASeccio('proves-teorica')}
              className="hover:text-white transition-all duration-300 cursor-pointer bg-transparent border border-transparent hover:border-slate-800/60 hover:bg-[#021329]/80 px-3.5 py-2 rounded-xl text-xs font-black uppercase duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              Proves teòrica
            </button>
            <button
              onClick={() => ferScrollASeccio('prova-fisica')}
              className="hover:text-white transition-all duration-300 cursor-pointer bg-transparent border border-transparent hover:border-slate-800/60 hover:bg-[#021329]/80 px-3.5 py-2 rounded-xl text-xs font-black uppercase duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              Prova física
            </button>
            <button
              onClick={() => ferScrollASeccio('prova-psicoprofesional')}
              className="hover:text-white transition-all duration-300 cursor-pointer bg-transparent border border-transparent hover:border-slate-800/60 hover:bg-[#021329]/80 px-3.5 py-2 rounded-xl text-xs font-black uppercase duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              Prova psicoprofessional
            </button>
            <button
              onClick={() => ferScrollASeccio('preus-i-plans')}
              className="hover:text-white transition-all duration-300 cursor-pointer bg-transparent border border-transparent hover:border-slate-800/60 hover:bg-[#021329]/80 px-3.5 py-2 rounded-xl text-xs font-black uppercase duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              Preus i plans
            </button>
          </div>

          {/* Botons d'Accions ràpides - PC demana entrar al "Workspace" o simular l'App mòbil */}
          <div className="flex items-center gap-4">
            {/* L'estudiant pot iniciar la seva plataforma en línia immediatament directament */}
            {/* Explicació per a no-programadors:
                Hem dissenyat un botó 'Premium' amb gradient, vores arrodonides, efecte d'elevació reactiu al cursor i un resplendor subtil de fons per cridar l'atenció de l'alumne i invitar-lo a entrar al campus amb total entusiasme. */}
            <button
              onClick={onEntrarWorkspace}
              className="relative group overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-[10.5px] font-black italic uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border border-blue-400/20"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Iniciar Campus Web
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-400 to-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================== */}
      {/* 2. ZONA HERO (PANTALLA DE BENVINGUDA) COSSOS D'ELIT */}
      {/* Explicació per a no-programadors:
          Aquesta és la capçalera principal d'entrada (Hero). S'ha modificat per posar com a fons de pantalla la foto espectacular
          d'un policia dels Mossos d'Esquadra de Catalunya saludant a l'acadèmia ISPC (tal com demana l'opositor).
          S'inclou un degradat transparent-fosc (overlay) molt professional per garantir el màxim contrast de les lletres. */}
      {/* ========================================== */}
      <header 
        className="relative w-full overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/imatges/fons_ispc.png')" }}
      >
        {/* Capa de degradat fosc per garantir un contrast de lectura excel·lent i transició fluida */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#021329] via-[#021329]/95 to-[#021329]/40 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#010c1c] via-transparent to-[#021329]/30 z-0"></div>
        {/* Capa de tancament inferior de color sòlid per evitar que la imatge de fons es pugui filtrar a causa del pixel/subpixel rendering */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#010c1c] z-10 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="space-y-8 max-w-xl">
            {/* Comentari per a no-programadors:
                S'ha eliminat la insígnia/plaqueta superior a petició de l'usuari per netejar la capçalera. */}
            {/* Comentari per a no-programadors:
                S'actualitza el títol principal de la web per enfocar-lo a la nova crida de "Sigues un dels següents".
                Fem servir negreta i un degradat de colors modern per ressaltar molt clarament les paraules "Mossos d'Esquadra". */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tight text-white uppercase leading-[1.05]">
              Sigues un dels següents <span className="bg-gradient-to-r from-blue-400 via-[#FFDF00] to-yellow-500 bg-clip-text text-transparent">Mossos d’Esquadra</span>
            </h1>

            {/* Comentari per a no-programadors:
                Es modifica el bloc de text de sota el títol per ressaltar o destacar (highlight) de manera visual:
                - De color groc daurat (#FFDF00): "dissenyada i programada des de 0 per alumnes" i "desenvolupat programari i eines exclusives".
                - De color vermell cridaner (rose-500): "Descobreix-nos!".
                Això ajuda a fer una lectura ràpida (escombrat visual) de la clau del nostre servei d'estudi. */}
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-semibold">
              Som la primera APP del mercat <span className="text-[#FFDF00] font-bold">dissenyada i programada des de 0 per alumnes</span> que hem passat per tot el procés selectiu i l'escola de policia l'últim any. Coneixem de primera mà tot el procés i tenim les millors eines que puguis imaginar. Hem <span className="text-[#FFDF00] font-bold">desenvolupat programari i eines exclusives</span> per a l'oposició de Mossos d'Esquadra per a les 3 proves de selecció. <span className="text-rose-500 font-black tracking-wide">Descobreix-nos!</span>
            </p>

            {/* Comentari per a no-programadors:
                Es canvien els textos de la parella de botons principals. El blau ara convida a realitzar una prova lliure
                i gratuïta de l'aplicació, i el botó negre/fosc a descarregar-la per a dispositius mòbils o tauletes. */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onEntrarWorkspace}
                className="bg-gradient-to-tr from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 active:scale-95 text-white text-xs font-black italic uppercase tracking-wider py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all text-center cursor-pointer"
              >
                Prova gratuïta de l'APP
              </button>
              <button
                onClick={onSimularEntrarMovil}
                className="border border-slate-700/60 hover:border-slate-500 bg-slate-950/45 hover:bg-slate-950/80 text-slate-200 hover:text-white text-xs font-extrabold italic uppercase tracking-wider py-4 px-8 rounded-2xl transition-all text-center cursor-pointer"
              >
                Descarrega la versió de mòbil i/o tablet
              </button>
            </div>

            {/* Comentari per a no-programadors:
                S'han actualitzat les mètriques i comptadors inferiors de la capçalera a petició de l'usuari.
                Ara mostren el nombre exacte d'alumnes aptes/aprovats en cadascuna de les 3 grans fases de l'oposició:
                - 977 aprovats a la prova teòrica (color grogós de màxim impacte visual).
                - 653 aprovats a les proves físiques (color blau cel corporatiu).
                - 150 aprovats a les proves psicoprofessionals (color verd esmeralda brillant). */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/60">
              <div>
                <div className="text-3xl font-black text-[#FFDF00] italic">977</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aprovats prova teòrica</div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-400 italic">653</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aprovats proves físiques</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-400 italic">150</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aprovats psicoprofessionals</div>
              </div>
            </div>
          </div>

          {/* Comentari per a no-programadors:
              S'ha eliminat completament el panell de l'ordinador simulador (mockup) en aquesta zona superior.
              D'aquesta manera, la banda dreta queda totalment lliure de contingut i permet admirar
              la preciosa foto oficial de fons de l'escola de policia (ISPC) sense cap tipus de distracció. */}
          <div className="hidden lg:block w-full"></div>
        </div>
      </header>

      {/* ========================================== */}
      {/* 1. SECCIÓ: ELEGEIX-NOS (#elegeix-nos) */}
      {/* Explicació per a no-programadors:
          Aquesta és la secció on expliquem les principals de virtuts d'OposiCAT per a triar-nos.
          Detallem per què som líders en aprovats per a l'oposició de Mossos d'Esquadra de Catalunya. */}
      {/* ========================================== */}
      <section id="elegeix-nos" className="bg-[#010c1c] py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white">Per què estudiar amb OposiCAT?</h3>
            {/* Comentari per a no-programadors:
                Modifiquem el text introductori pel de l'enfocament del nostre equip en programari (software) i temps de qualitat. */}
            <p className="text-slate-400 text-xs md:text-sm font-semibold">
              El grup d'OposiCAT ens hem centrat en el desenvolupament de programari (software) per tal de donar la màxima rendibilitat al teu temps.
            </p>
          </div>

          {/* Comentari per a no-programadors:
              Ara dividim el contingut en 3 grans targetes, una per a cadascuna de les proves del procés de selecció de Mossos:
              - Prova Teòrica
              - Prova Física
              - Prova Psicoprofessional
              Cada targeta en lloc d'un paràgraf té una estructura de llista d'elements molt corporativa i de lectura agradable. */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Targeta 1 - Prova teòrica */}
            <div className="bg-[#021329]/40 border border-slate-900/85 p-8 rounded-3xl space-y-5 hover:border-blue-900/40 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-base font-black italic uppercase tracking-wider text-[#00f296]">Prova teòrica</h4>
                
                {/* Llistat visual amb puntets i colors corporatius */}
                <ul className="space-y-3 text-xs text-slate-300 font-semibold leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f296] shrink-0 mt-1.5"></span>
                    <span>Tens tot el temari oficial a la web, així mai el perdràs.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f296] shrink-0 mt-1.5"></span>
                    <span>Tens eines d'estudi increïbles: subratlla, guarda el més important, resums de cada tema i molt més.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f296] shrink-0 mt-1.5"></span>
                    <span>Exàmens d'anys passats portats a format virtual interactiu.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f296] shrink-0 mt-1.5"></span>
                    <span>Simulacres i exàmens propis fets pel nostre equip.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f296] shrink-0 mt-1.5"></span>
                    <span>Classes en directe cada setmana.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f296] shrink-0 mt-1.5"></span>
                    <span>Classes premium preenregistrades (per si vols estudiar al teu ritme).</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Targeta 2 - Prova física */}
            <div className="bg-[#021329]/40 border border-slate-900/85 p-8 rounded-3xl space-y-5 hover:border-yellow-500/20 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-base font-black italic uppercase tracking-wider text-[#FFDF00]">Prova física</h4>
                
                {/* Llistat visual amb puntets i colors corporatius */}
                <ul className="space-y-3 text-xs text-slate-300 font-semibold leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF00] shrink-0 mt-1.5"></span>
                    <span>Trobaràs classes d'explicació pràctica de com preparar cada múscul implicat en les proves.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF00] shrink-0 mt-1.5"></span>
                    <span>Eina avançada de dietes personalitzades: combina l'entrenament amb la teva salut alimentària.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF00] shrink-0 mt-1.5"></span>
                    <span>Cronòmetres especials de cada prova per saber la teva nota oficial (aplicació desenvolupada directament per nosaltres).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF00] shrink-0 mt-1.5"></span>
                    <span>Plans de preparació i entrenament setmanals ben detallats.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF00] shrink-0 mt-1.5"></span>
                    <span>Localitzador de gimnasos adequats de tot Catalunya per entrenar.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Targeta 3 - Prova psicoprofessional */}
            <div className="bg-[#021329]/40 border border-[#001021] p-8 rounded-3xl space-y-5 hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-base font-black italic uppercase tracking-wider text-white">Prova psicoprofessional</h4>
                
                {/* Llistat visual amb puntets i colors corporatius */}
                <ul className="space-y-3 text-xs text-slate-300 font-semibold leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span>Trobaràs explicacions clares i enfocaments de totes les proves psicotècniques del procés.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span>Exàmens de biodades complets creats directament per psicòlegs professionals.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span>Cites de mentoria amb psicòlegs experts (analitzant els resultats del teu biodada) per a una personalització del 100%.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span>Més de 129 preguntes crucials que acostumen a sortir a les entrevistes reals per a una pràctica eficient.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. SECCIÓ: PROVES TEÒRICA (#proves-teorica) */}
      {/* Explicació per a no-programadors:
          Aquesta part descriu les proves de la base de coneixements. S'estructura dividint els mòduls en Àmbits A, B i C,
          detallant quants temes contenen i quina és la naturalesa de cadascun. */}
      {/* ========================================== */}
      <section 
        id="proves-teorica" 
        className="bg-[#021329] py-20 border-t border-slate-900/60 scroll-mt-20 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(2, 19, 41, 0.91), rgba(2, 19, 41, 0.95)), url(${fonsTeorica})`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black italic uppercase tracking-widest text-[#FFDF00]">Fase Avaluadora 1</span>
            <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white">La Prova Teòrica de Coneixements</h3>
            <p className="text-slate-400 text-xs md:text-sm">
              L'examen oficial de la Generalitat conté preguntes tipus test dividides en 3 àmbits. Fes un cop d'ull a la nostra aplicació:
            </p>
          </div>

          {/* ESTRUCTURA PRINCIPAL DEL CARRUSEL (DISSENY DE PAINT: FLETXES + COLS DIVIDIDES) */}
          <div className="flex items-center gap-3 md:gap-6 max-w-6xl mx-auto">
            
            {/* FLETXA ESQUERRA DIRECTA DEL DISSENY */}
            <button 
              onClick={() => setCapturaActiva((prev) => (prev === 0 ? 5 : prev - 1))}
              className="bg-slate-950/60 border border-slate-850 hover:border-blue-500/45 text-slate-400 hover:text-white w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 text-base md:text-lg font-black shrink-0"
              title="Enrere"
            >
              ◀
            </button>

            {/* CONTENIDOR SPLIT: ESQUERRA MÒBIL (LG:COLS-6), DRETA EXPLICACIOK (LG:COLS-6)
                Comentari per a no-programadors:
                Hem canviat el fons d'aquest contenidor de captures ('bg-[#020e1d]/50') a un fons semi-transparent i desenfocat amb backdrop-blur-xl per gaudir del fons de l'acadèmia. */}
            <div className="flex-1 grid lg:grid-cols-12 gap-8 items-center bg-[#021329]/80 backdrop-blur-xl border border-slate-900/60 p-5 md:p-10 rounded-[32px]">
              
              {/* MITJA PANTALLA DRETA: DENTRE DE LA MATEIXA FILA, LI DONEM ORDER LAST (LG:ORDER-2) PERQUÈ SURTI A LA DRETA */}
              <div className="lg:col-span-6 space-y-5 lg:order-2">
                {(() => {
                  const dadesCaptures = [
                    {
                      subtitol: "APARTAT 01: Highlights del temari i exàmens",
                      titol: "Highlights del Temari i Exàmens Oficials",
                      dsc: "La nostra eina més valorada de l'app d'OposiCAT. L'algoritme ressalta directament els conceptes clau sobre el text del DOGC juntament amb preguntes de convocatòries anteriors reals.",
                      punts: [
                        { icon: "⚡", bold: "Estudi enfocat de veritat:", txt: "Línies subratllades amb groc d'alt impacte visual per memoritzar i aprendre fins a un 80% més de pressa." },
                        { icon: "🎓", bold: "Exàmens reals enllaçats:", txt: "Preguntes oficials verídiques (Ex: Vicens Vives) col·locades exactament sota del concepte teòric corresponent." }
                      ]
                    },
                    {
                      subtitol: "APARTAT 02: Classes premium en resolució màxima",
                      titol: "Reproductor de Classes i Talls Gravats al detall",
                      dsc: "Les classes d'OposiCAT s'estructuren en un reproductor premium molt intuïtiu. Sense pèrdues de temps, amb tot el contingut en alta resolució.",
                      punts: [
                        { icon: "👤", bold: "Professorat Mosso en actiu:", txt: "Classes fetes pel professor Guillem, policia en actiu coneighedor directe dels últims filtres de la Generalitat." },
                        { icon: "📺", bold: "Fàcil accés i descàrregues:", txt: "Obre els vídeos directament a YouTube per veure'ls a la tablet o SmartTV i descarrega resums oficials." }
                      ]
                    },
                    {
                      subtitol: "APARTAT 03: Calendari i suport setmanal",
                      titol: "Grup en Directe del Bloc A, Bloc B i Bloc C",
                      dsc: "Agenda amb alertes automàtiques. El campus t'indica en cada moment quins dies i hores es fan les sessions teòriques o de psicotècnics.",
                      punts: [
                        { icon: "📡", bold: "Interacció total via xat:", txt: "Pregunta qualsevol dubte a temps real directament amb el professor que estigui impartint la lliçó." },
                        { icon: "🔔", bold: "Avisos de setmana actius:", txt: "Activa les alarmes amb un polsador ràpid per no oblidar cap classe clau d'aquesta setmana." }
                      ]
                    },
                    {
                      subtitol: "APARTAT 04: Condicions 100% de competició",
                      titol: "Simulacre Oficial de Tests de l'examen",
                      dsc: "Modula els exàmens en línia de la millor manera possible. El sistema t'obliga a seguir els límits de temps i quantitat de preguntes verídiques de Mossos.",
                      punts: [
                        { icon: "⏱️", bold: "Examen oficial tipus test:", txt: "Règim estipulat de 30 preguntes en 45 minuts de rellotge per practicar el control dels nervis." },
                        { icon: "🚀", bold: "Tests d'entrenament lliure:", txt: "Possibilitat d'exàmens curts de 10 preguntes ràpides per a moments breus de transport o oci." }
                      ]
                    },
                    {
                      subtitol: "APARTAT 05: Fins a 5 punts claus de barem",
                      titol: "Mòdul independent de Psicotècnics",
                      dsc: "La part psicoprofessional l'has de preparar des del primer dia d'estudi. Aquest segment és altament estratègic i sol decidir qui aconsegueix plaça.",
                      punts: [
                        { icon: "🧠", bold: "6 tipus especialitzat de blocs:", txt: "Fitxes dominó, successions, perspectives tridimensionals, sèries geomètriques, càlcul mental actiu." },
                        { icon: "💡", bold: "Trucs de lògica d'especialistes:", txt: "Psicòlegs t'explicaran els millors mètodes de drecera mental per guanyar segons de més." }
                      ]
                    },
                    {
                      subtitol: "APARTAT 06: Temari viu i actualització diària",
                      titol: "Butlletí d'Actualitat de Catalunya del DOGC",
                      dsc: "Fets rellevants que cal conèixer. El Departament d'Interior de la Generalitat sol preguntar sobre fets, plans de seguretat o canvis legislatius recents.",
                      punts: [
                        { icon: "📰", bold: "Notícies d'impacte evaluable:", txt: "Seccions d'actualitat catalana, plans com el del Mobile World Congress o controls ambientals directes." },
                        { icon: "🔄", bold: "Sincronitzat sense compres extra:", txt: "Mantenim el programari totalment fresc de manera asíncrona sense sobrecostos per a l'estudiant." }
                      ]
                    }
                  ];

                  const seleccionada = dadesCaptures[capturaActiva] || dadesCaptures[0];

                  return (
                    <div className="space-y-4 text-left animate-fadeIn">
                      <span className="inline-block text-[#FFDF00] bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                        {seleccionada.subtitol}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black italic uppercase text-white leading-tight">
                        {seleccionada.titol}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                        {seleccionada.dsc}
                      </p>
                      <div className="space-y-3.5 pt-1">
                        {seleccionada.punts.map((pnt, pIdx) => (
                          <div key={pIdx} className="flex gap-2.5 items-start">
                            <span className="bg-blue-600/15 border border-blue-900/45 p-1.5 rounded-lg text-sm shrink-0">
                              {pnt.icon}
                            </span>
                            <div className="space-y-0.5">
                              <h4 className="text-[10.5px] font-black uppercase tracking-wide text-white">
                                {pnt.bold}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                                {pnt.txt}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botó CT de contacte/campus */}
                      <div className="pt-3">
                        <button 
                          onClick={onEntrarWorkspace}
                          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black italic uppercase tracking-wider py-3 px-6 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-650/15"
                        >
                          PROVAR AQUEST MODULE AL CAMPUS ARA →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* MITJA PANTALLA ESQUERRA SOTA LG (COL:6): EL MÒBIL LI REASSIGNEM COL-6, I ORDER-1 PERQUÈ ES MOSTRI A L'ESQUERRA EN GRANS PANTALLES */}
              <div className="lg:col-span-6 flex justify-center items-center lg:order-1">
                <div className="relative">
                  {/* Efete brillant de fons per ressaltar el telèfon */}
                  <div className="absolute inset-0 bg-blue-500/10 rounded-[48px] filter blur-[60px] -z-10 animate-pulse"></div>

                  {/* SMARTPHONE EN CSS NATIV (DISSENY MODERN MULTI-PANTALLA) */}
                  <div className="relative bg-[#020b16] rounded-[48px] p-4 shadow-2xl border-4 border-slate-800/90 w-[350px] h-[670px] flex flex-col justify-between overflow-hidden ring-12 ring-slate-950/40 select-none">
                    
                    {/* Botons mecànics del lateral del telèfon simulats en CSS */}
                    <div className="absolute top-24 -left-1 w-1 h-12 bg-slate-800 rounded-r-lg"></div>
                    <div className="absolute top-40 -left-1 w-1 h-16 bg-slate-800 rounded-r-lg"></div>
                    <div className="absolute top-32 -right-1 w-1.2 h-20 bg-slate-850 rounded-l-lg"></div>

                    {/* Barra de sensors superior i selfie (Dynamic Notch) */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-full flex justify-between items-center px-4.5 z-40 border border-slate-900">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 animate-pulse"></div>
                      <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
                      <div className="text-[7.5px] text-slate-500 font-mono font-bold">100%</div>
                    </div>

                    {/* PANTALLA INTRA-MÒBIL: SENSE SCROLLS LATERALS NI DISSENY AMBIGU */}
                    <div className="w-full h-full bg-[#011425] rounded-[38px] p-4 pt-8 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans border border-slate-950">
                      
                      {/* ======================================================= */}
                      {/* DETALL DE CAPTURA 0: HIGHLIGHTS DEL TEMARI I EXÀMENS OFICIALS */}
                      {/* ======================================================= */}
                      {capturaActiva === 0 && (
                        <div className="flex-1 flex flex-col justify-between h-full pt-1">
                          
                          {/* Barra de Títol */}
                          <div className="flex items-center gap-2.5 mb-2 mt-0.5">
                            <div className="w-8 h-8 rounded-full bg-[#092039] border border-slate-800 flex items-center justify-center text-slate-350 text-xs font-black">
                              ‹
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[7px] text-[#00f296] font-mono font-extrabold tracking-widest uppercase">
                                ÀMBIT A — HISTÒRIA DE CATALUNYA (PART I)
                              </span>
                              <h3 className="text-[12.5px] font-black italic uppercase leading-none text-white tracking-tight mt-0.5">
                                1. L’ANTIGUITAT A CATALUNYA
                              </h3>
                            </div>
                          </div>

                          {/* Botó Què vols mostrar */}
                          <div className="mb-3.5">
                            <div className="inline-flex items-center justify-center gap-2 w-full bg-[#011d38] border border-[#FFDF00]/30 py-2.5 px-4 rounded-xl shadow-inner cursor-pointer">
                              <span className="text-[8px] font-black text-[#FFDF00] tracking-widest italic uppercase">
                                QUÈ VOLS MOSTRAR
                              </span>
                              <span className="text-[#FFDF00] text-[9px]">㗊</span>
                            </div>
                          </div>

                          {/* Secció Central de Targetes */}
                          <div className="flex-1 space-y-3.5 overflow-hidden">
                            
                            {/* Card Taronja: Highlights */}
                            <div className="bg-[#021f37]/90 border border-amber-500/20 p-3.5 rounded-2xl relative shadow-md">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-[#FF9900]/15 text-[#FF9900] text-[9px] p-1 rounded-lg">⏱️</span>
                                <span className="text-[7.5px] font-black text-[#FF9900] uppercase tracking-wider">
                                  HIGHLIGHTS DEL TEMARI OFICIAL
                                </span>
                              </div>
                              <p className="text-[11.5px] text-slate-200 italic font-semibold leading-relaxed pl-1">
                                &ldquo;L'historiador Vicens Vives va definir Catalunya com a &ldquo;redós&rdquo; i &ldquo;passadís&rdquo;&rdquo;
                              </p>
                              <div className="border-l-2 border-[#FFDF00] pl-2 mt-2">
                                <span className="text-[7px] font-black text-[#FFDF00] uppercase tracking-wider block">
                                  — SUBRATLLAT AL TEMARI OFICIAL
                                </span>
                              </div>
                            </div>

                            {/* Card Lila: Exàmens Oficials */}
                            <div className="bg-[#021f37]/90 border border-purple-500/15 p-3.5 rounded-2xl relative shadow-md">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-purple-500/15 text-purple-400 text-[9px] p-1.5 rounded-full">✓</span>
                                <span className="text-[7.5px] font-black text-purple-300 uppercase tracking-wider">
                                  EXÀMENS OFICIALS ANTERIORS
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[8.5px] font-black text-purple-400 uppercase tracking-wider">
                                  CONVOCATÒRIA 2025
                                </span>
                                <span className="text-[7px] text-slate-550 font-extrabold uppercase">
                                  PREGUNTA OFICIAL
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-200 font-extrabold tracking-tight mb-2 leading-snug">
                                &ldquo;Com defineix Vicens i Vives Catalunya?&rdquo;
                              </p>

                              <div className="bg-[#011425] border border-blue-950/50 p-2.5 rounded-xl text-[9px] font-extrabold text-slate-300 shadow-sm flex items-center justify-between">
                                <span>A — Un país meravellós</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              </div>
                            </div>

                          </div>

                          {/* Peu del Mòbil amb engranatge flotant */}
                          <div className="flex justify-end p-1 relative z-30">
                            <div className="w-10 h-10 rounded-full bg-[#0a1829] border border-slate-800/80 hover:border-slate-700 flex items-center justify-center text-slate-400 shadow-md relative outline-1 outline-blue-500/20">
                              <span className="text-sm">⚙</span>
                              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 border border-[#011425]"></span>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* ======================================================= */}
                      {/* DETALL DE CAPTURA 1: CLASSES PREMIUM REENREGISTRADES */}
                      {/* ======================================================= */}
                      {capturaActiva === 1 && (
                        <div className="flex-1 flex flex-col justify-between h-full pt-1">
                          
                          {/* Barra superior de retorn */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-[#092039] border border-slate-800 flex items-center justify-center text-xs font-bold">
                              ‹
                            </div>
                            <span className="text-[8px] text-slate-400 font-black tracking-wider uppercase italic">
                              CLASSE PREMIUM / 1. L'ANTIGUITAT A CATALUNYA
                            </span>
                          </div>

                          {/* REPRODUCTOR MULTIMÈDIA INTEGRAT (REPRESENTACIÓ MULTIMÈDIA) */}
                          <div className="bg-slate-950/60 border border-slate-900 rounded-3xl h-44 flex flex-col justify-center items-center shadow-inner relative overflow-hidden group">
                            {/* Reflexos del fons */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/15 via-transparent to-yellow-500/5 pointer-events-none"></div>
                            
                            {/* Logo central d'OposiCAT de la imatge */}
                            <div className="text-center relative z-10 space-y-1">
                              <div className="text-3xl font-extrabold text-white tracking-widest italic">
                                Oposi<span className="text-[#FFDF00]">CAT</span>
                              </div>
                              <div className="text-[7.5px] font-mono tracking-widest text-slate-550 uppercase">
                                PREMIUM CONTENT
                              </div>
                            </div>
                            
                            {/* Barra de progrés de lectura */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-850">
                              <div className="h-full w-2/5 bg-gradient-to-r from-red-600 to-[#FFDF00]"></div>
                            </div>
                          </div>

                          {/* INDICADORS S'ESTÀ REPRODUINT */}
                          <div className="mt-3.5 space-y-3 flex-1 flex flex-col justify-between">
                            
                            <div className="space-y-1">
                              <span className="text-[7.5px] text-[#FFDF00] uppercase tracking-widest font-black block">
                                S'ESTÀ REPRODUINT ARA:
                              </span>
                              <h4 className="text-[12px] text-white font-extrabold uppercase italic leading-tight tracking-tight">
                                1. L’ANTIGUITAT A CATALUNYA
                              </h4>
                              <span className="text-[8px] text-slate-400 block font-bold leading-none">
                                HISTÒRIA DE CATALUNYA (PART I)
                              </span>
                            </div>

                            {/* Metadades del professorat */}
                            <div className="bg-[#021f37]/80 border border-slate-900 p-3 rounded-2xl space-y-2.5">
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px]">👤</span>
                                <div className="text-[8px] text-slate-400 uppercase font-black uppercase tracking-wider">
                                  PROFESSOR <span className="text-white italic font-black text-[9px] block">GUILLEM</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px]">🛡️</span>
                                <div className="text-[8px] text-slate-400 uppercase font-black uppercase tracking-wider">
                                  PROFESSIÓ <span className="text-white italic font-black text-[9px] block">MOSSO D'ESQUADRA</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-[10px]">📖</span>
                                <div className="text-[8px] text-slate-400 uppercase font-black uppercase tracking-wider">
                                  BLOC <span className="text-white italic font-black text-[block] block">BLOC A</span>
                                </div>
                              </div>
                            </div>

                            {/* Botó Roig de Youtube */}
                            <div className="pt-1">
                              <a 
                                href="https://youtube.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-[#FF1A1A] hover:bg-[#E60000] active:scale-95 text-white flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer shadow-lg shadow-red-650/15"
                              >
                                <span className="text-[12px] font-black italic tracking-wide uppercase flex items-center gap-2">
                                  <span className="inline-block bg-white text-red-600 rounded-full w-4.5 h-4.5 text-center text-[9px] leading-4.5 pt-0.5">▶</span> OBRIR A YOUTUBE
                                </span>
                                <span className="text-[11.5px] font-black italic tracking-wide uppercase text-white">
                                  VEURE ARA LA CLASSE ↗
                                </span>
                              </a>
                            </div>

                            {/* Nota de peu de text */}
                            <p className="text-[7.5px] text-slate-500 uppercase leading-normal tracking-wide text-center">
                              Recorda que pots descarregar el temari corresponent a aquest tema en PDF en l'apartat de resums d'OposiMossos.
                            </p>

                          </div>

                          {/* Engranatge */}
                          <div className="flex justify-end pt-1">
                            <div className="w-8 h-8 rounded-full bg-[#0a1829] border border-slate-800 flex items-center justify-center text-slate-450 text-xs">
                              ⚙
                            </div>
                          </div>

                        </div>
                      )}

                      {/* ======================================================= */}
                      {/* DETALL DE CAPTURA 2: CLASSES EN DIRECTE I AGENDA */}
                      {/* ======================================================= */}
                      {capturaActiva === 2 && (
                        <div className="flex-1 flex flex-col justify-between h-full pt-1">
                          
                          {/* Capçalera amb logo oficial */}
                          <div className="flex items-center justify-between mb-3 mt-0.5">
                            <div className="w-8 h-8 rounded-lg bg-[#092039] border border-slate-800 flex items-center justify-center text-slate-400 text-xs">
                              ‹
                            </div>
                            <div className="bg-[#021425] border border-slate-900 px-3 py-1.5 rounded-xl text-center">
                              <span className="text-[10.5px] font-extrabold text-white tracking-wider italic">
                                Oposi<span className="text-red-500">Mossos</span>
                              </span>
                            </div>
                            <div className="w-8"></div>
                          </div>

                          {/* Secció Títol Directes */}
                          <div className="text-center space-y-1 mb-2.5">
                            <h3 className="text-sm md:text-base font-black italic tracking-wide text-white uppercase">
                              CLASSES EN DIRECTE
                            </h3>
                            <div className="w-10 h-0.75 bg-red-600 mx-auto rounded-full"></div>
                          </div>

                          {/* Descripció del Bloc */}
                          <div className="bg-[#021f37]/80 border border-[#032142] p-3 rounded-2xl mb-4 text-center">
                            <p className="text-[9.5px] text-slate-350 font-semibold leading-relaxed">
                              Gaudeix de les classes que fem cada setmana dels 3 blocs de temari i del temari psicotècnic. Si vols veure tema a tema les classes en la màxima qualitat entra a <span className="text-[#FFDF00] underline font-black leading-none inline">Classes Premium</span>.
                            </p>
                          </div>

                          {/* Targets de directes */}
                          <div className="space-y-3 flex-1 overflow-hidden">
                            
                            {/* Bloc A */}
                            <div className="bg-[#021f37] border border-emerald-950 p-3.5 rounded-2xl relative flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <span className="text-[7.5px] text-slate-400 block font-bold leading-none uppercase">SEGÜENT CLASSE DE</span>
                                  <span className="text-base font-black text-[#FFDF00] italic uppercase tracking-wider block">
                                    BLOC A
                                  </span>
                                </div>
                                <span className="w-7 h-7 bg-[#FFDF00] text-[#011425] rounded-full flex items-center justify-center text-[10px] shadow font-bold">
                                  🔔
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-3">
                                <div className="flex gap-2">
                                  <span className="text-[8px] bg-slate-950 px-2 py-1.5 rounded-lg text-slate-300 font-mono font-bold">
                                    📅 DILLUNS
                                  </span>
                                  <span className="text-[8px] bg-slate-950 px-2 py-1.5 rounded-lg text-slate-300 font-mono font-bold">
                                    🕒 20:00h
                                  </span>
                                </div>
                                <button className="bg-white hover:bg-slate-100 text-slate-950 text-[10px] font-black uppercase py-1.5 px-4 rounded-xl transition-all shadow cursor-pointer text-center">
                                  ENTRAR
                                </button>
                              </div>
                            </div>

                            {/* Bloc B */}
                            <div className="bg-[#021f37] border border-blue-980/30 p-3.5 rounded-2xl relative flex flex-col justify-between opacity-85">
                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <span className="text-[7.5px] text-slate-450 block font-bold leading-none uppercase">SEGÜENT CLASSE DE</span>
                                  <span className="text-base font-black text-[#FFDF00] italic uppercase tracking-wider block">
                                    BLOC B
                                  </span>
                                </div>
                                <span className="w-7 h-7 bg-slate-950/60 text-slate-500 rounded-full flex items-center justify-center text-[10px]">
                                  🔔
                                </span>
                              </div>
                              <div className="flex justify-between items-center mt-3">
                                <div className="flex gap-2">
                                  <span className="text-[8px] bg-slate-950/40 px-2 py-1.5 rounded-lg text-slate-450 font-mono">
                                    📅 DIMARTS
                                  </span>
                                  <span className="text-[8px] bg-slate-950/40 px-2 py-1.5 rounded-lg text-slate-450 font-mono">
                                    🕒 20:00h
                                  </span>
                                </div>
                                <button className="bg-slate-800 text-slate-400 text-[10px] font-black uppercase py-1.5 px-4 rounded-xl transition-all cursor-pointer text-center">
                                  ENTRAR
                                </button>
                              </div>
                            </div>

                          </div>

                          {/* Engranatge */}
                          <div className="flex justify-end pt-1">
                            <div className="w-8 h-8 rounded-full bg-[#0a1829] border border-slate-800 flex items-center justify-center text-slate-450 text-xs">
                              ⚙
                            </div>
                          </div>

                        </div>
                      )}

                      {/* ======================================================= */}
                      {/* DETALL DE CAPTURA 3: CONFIGURADOR D'EXÀMENS I TESTS */}
                      {/* ======================================================= */}
                      {capturaActiva === 3 && (
                        <div className="flex-1 flex flex-col justify-between h-full pt-1">
                          
                          {/* Visió de benvinguda superior */}
                          <div className="text-center p-1 border-b border-blue-950/40 pb-2.5">
                            <span className="text-[8.5px] text-blue-400 italic font-black leading-relaxed">
                              &ldquo; Recorda que 45 minuts i 30 preguntes és el que et trobaràs el dia de l'examen! &rdquo;
                            </span>
                          </div>

                          {/* CONFIGURADOR DE PREGUNTES */}
                          <div className="my-3 space-y-2">
                            <span className="text-[9.5px] text-white uppercase font-black block tracking-widest text-center">
                              QUANTES PREGUNTES VOLS?
                            </span>
                            <div className="space-y-1.5">
                              {/* Botó desactiu */}
                              <div className="bg-[#021f37]/40 border border-slate-900 rounded-xl py-3 px-4 text-center text-xs font-mono font-bold text-slate-400">
                                10
                              </div>
                              {/* Botó actiu */}
                              <div className="bg-[#FFDF00] border-2 border-yellow-500 rounded-xl py-3 px-4 text-center text-xs font-black text-slate-950 shadow-md">
                                30 <span className="text-[8px] font-extrabold uppercase">(OFICIAL)</span>
                              </div>
                              {/* Botó desactiu */}
                              <div className="bg-[#021f37]/40 border border-slate-900 rounded-xl py-3 px-4 text-center text-xs font-mono font-bold text-slate-400">
                                100
                              </div>
                            </div>
                          </div>

                          {/* CONFIGURADOR DE TEMPS */}
                          <div className="my-3 space-y-2">
                            <span className="text-[9.5px] text-white uppercase font-black block tracking-widest text-center">
                              QUANT DE TEMPS VOLS?
                            </span>
                            <div className="space-y-1.5">
                              {/* Botó desactiu */}
                              <div className="bg-[#021f37]/40 border border-slate-900 rounded-xl py-3 px-4 text-center text-xs font-mono font-bold text-slate-400">
                                10 minuts
                              </div>
                              {/* Botó actiu/fosc fidedigne */}
                              <div className="bg-[#1b2f44] border border-[#00f296]/35 rounded-xl py-3 px-4 text-center text-xs font-black text-white shadow shadow-[#00f296]/5 flex items-center justify-center gap-1.5">
                                45 minuts <span className="text-[8px] text-[#00f296] font-extrabold uppercase">(OFICIAL)</span>
                              </div>
                              {/* Botó desactiu */}
                              <div className="bg-[#021f37]/40 border border-slate-900 rounded-xl py-3 px-4 text-center text-xs font-mono font-bold text-slate-400">
                                Indefinit
                              </div>
                            </div>
                          </div>

                          {/* BOTÓ DE COMENÇA EL TEST */}
                          <div className="pt-2">
                            <button className="w-full bg-[#00f296] hover:bg-[#00d984] text-[#011425] font-black italic uppercase text-xs py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/15 tracking-widest cursor-pointer text-center">
                              COMENÇA
                            </button>
                          </div>

                          {/* Engranatge */}
                          <div className="flex justify-end pt-1">
                            <div className="w-8 h-8 rounded-full bg-[#0a1829] border border-slate-800 flex items-center justify-center text-slate-450 text-xs">
                              ⚙
                            </div>
                          </div>

                        </div>
                      )}

                      {/* ======================================================= */}
                      {/* DETALL DE CAPTURA 4: ÀREA DE PSICOTÈCNICS */}
                      {/* ======================================================= */}
                      {capturaActiva === 4 && (
                        <div className="flex-1 flex flex-col justify-between h-full pt-1">
                          
                          {/* Capçalera */}
                          <div className="flex items-center justify-between mb-3 mt-0.5">
                            <div className="w-8 h-8 rounded-lg bg-[#092039] border border-slate-800 flex items-center justify-center text-slate-400 text-xs shadow-sm">
                              ‹
                            </div>
                            <div className="bg-[#021425] border border-slate-900 px-3 py-1 rounded-xl">
                              <span className="text-[10px] font-black text-white tracking-wider italic">
                                Oposi<span className="text-[#FF2A2A]">Mossos</span>
                              </span>
                            </div>
                            <div className="w-8"></div>
                          </div>

                          {/* Títol psicotècnics */}
                          <div className="text-center space-y-1 mb-2">
                            <h3 className="text-sm font-black italic tracking-wide text-white uppercase">
                              EXÀMEN PSICOTÈCNIC
                            </h3>
                            <div className="w-10 h-0.75 bg-red-650 mx-auto rounded-full"></div>
                          </div>

                          {/* Consell explicatiu amb cometes taronges */}
                          <div className="p-1 pb-2.5 text-center mb-1">
                            <p className="text-[8.5px] text-slate-400 italic font-semibold leading-relaxed">
                              &ldquo; Recorda que <span className="text-yellow-500 font-extrabold">5 PUNTS</span> del tot el comput total de la prova teòrica de l'oposició és l'examen psicotècnic, no ho deixis pel final i practica! &rdquo;
                            </p>
                          </div>

                          {/* Files del listat del psicotècnic */}
                          <div className="space-y-1.5 flex-1 overflow-hidden pr-0.5">
                            {[
                              { icon: "🧩", color: "bg-blue-600/15 border-blue-900/30 text-blue-400", nom: "Fitxes Dominó" },
                              { icon: "📚", color: "bg-emerald-500/15 border-[#032142] text-[#00f296]", nom: "Successions" },
                              { icon: "🧊", color: "bg-amber-500/15 border-amber-900/30 text-[#FFDF00]", nom: "Perspectives" },
                              { icon: "💠", color: "bg-purple-500/15 border-purple-900/30 text-purple-400", nom: "Figures i Cubs" },
                              { icon: "🔢", color: "bg-pink-500/15 border-pink-900/30 text-pink-400", nom: "Sèries Numèriques" },
                              { icon: "⚡", color: "bg-orange-500/15 border-orange-900/30 text-orange-400", nom: "Càlcul Mental" }
                            ].map((fila, idx) => (
                              <div 
                                key={idx}
                                className="bg-[#021f37]/80 border border-[#032142]/40 rounded-xl px-3 py-2 flex items-center justify-between hover:border-slate-800 transition-all cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border ${fila.color}`}>
                                    {fila.icon}
                                  </span>
                                  <span className="text-[10px] font-extrabold uppercase italic text-slate-100 tracking-wide font-sans">
                                    {fila.nom}
                                  </span>
                                </div>
                                <span className="text-slate-500 text-[10px] font-bold">›</span>
                              </div>
                            ))}
                          </div>

                          {/* Engranatge */}
                          <div className="flex justify-end pt-1">
                            <div className="w-8 h-8 rounded-full bg-[#0a1829] border border-slate-800 flex items-center justify-center text-slate-450 text-xs">
                              ⚙
                            </div>
                          </div>

                        </div>
                      )}

                      {/* ======================================================= */}
                      {/* DETALL DE CAPTURA 5: BUTLLETÍ DE NOTÍCIES RELLEVANTS */}
                      {/* ======================================================= */}
                      {capturaActiva === 5 && (
                        <div className="flex-1 flex flex-col justify-between h-full pt-1">
                          
                          {/* Barra de menú */}
                          <div className="flex items-center justify-between mb-3 mt-0.5 border-b border-blue-950/45 pb-2">
                            <div className="w-8 h-8 rounded-xl bg-[#092039] border border-slate-800 flex items-center justify-center text-slate-405 text-xs">
                              ‹
                            </div>
                            <div className="bg-[#021425] border border-slate-900 px-3.5 py-1.5 rounded-2xl">
                              <span className="text-[10.5px] font-black text-rose-500 italic tracking-wider">
                                Oposi<span className="text-white">Mossos</span>
                              </span>
                            </div>
                            <div className="w-8"></div>
                          </div>

                          {/* Secció Títols */}
                          <div className="text-center space-y-0.5 mb-1 bg-slate-950/20 py-1">
                            <span className="text-[7.5px] text-[#00f296] font-extrabold uppercase tracking-widest block leading-none">
                              ULTIMA SETMANA
                            </span>
                            <h3 className="text-sm md:text-base font-black italic text-white uppercase tracking-tight">
                              NOTÍCIES RELLEVANTS
                            </h3>
                            <div className="w-10 h-0.75 bg-red-650 mx-auto rounded-full"></div>
                          </div>

                          {/* Indicador de Data */}
                          <div className="text-center py-1 mt-0.5 mb-2 border-b border-slate-900/65">
                            <span className="text-[9px] font-black text-amber-500 tracking-wider">16 DE MAIG</span>
                          </div>

                          {/* Cartes de Notícies */}
                          <div className="space-y-3 flex-1 overflow-hidden pr-0.5">
                            
                            {/* Notícia 1: Sequera */}
                            <div className="bg-[#021f37] border border-blue-950 p-3 rounded-2xl space-y-1.5 relative">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-[10px] font-black italic text-[#FF9900] uppercase tracking-wide leading-tight flex-1">
                                  CATALUNYA ENTRA EN FASE DE PRE-ALERTA PER SEQUERA DESPRÉS D'UN ABRIL SEC
                                </h4>
                                <span className="bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/25 text-[6.5px] font-black uppercase px-2 py-0.5 rounded-lg shrink-0 tracking-wide mt-0.5">
                                  SOCIETAT
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-300 font-semibold leading-relaxed">
                                L'Agència Catalana de l'Aigua monitoritza els embassaments que es troben al 35% de la seva capacitat.
                              </p>
                              <div className="flex items-center gap-1 text-[7.5px] text-slate-500 font-mono">
                                <span>🕒</span> <span>ACTUALITZAT</span>
                              </div>
                            </div>

                            {/* Notícia 2: MWC */}
                            <div className="bg-[#021f37] border border-blue-950 p-3 rounded-2xl space-y-1.5 relative opacity-90">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-[10px] font-black italic text-teal-400 uppercase tracking-wide leading-tight flex-1">
                                  NOU PLA DE SEGURETAT PER AL MOBILE WORLD CONGRESS 2026
                                </h4>
                                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/25 text-[6.5px] font-black uppercase px-2 py-0.5 rounded-lg shrink-0 tracking-wide mt-0.5">
                                  SEGURETAT
                                </span>
                              </div>
                              <p className="text-[9.5px] text-slate-350 font-semibold leading-relaxed">
                                Interior confirma un desplegament especial de Mossos d'Esquadra per garantir la seguretat en l'esdeveniment tecnològic.
                              </p>
                              <div className="flex items-center gap-1 text-[7.5px] text-slate-500 font-mono">
                                <span>🕒</span> <span>ACTUALITZAT</span>
                              </div>
                            </div>

                          </div>

                          {/* Engranatge */}
                          <div className="flex justify-end pt-1">
                            <div className="w-8 h-8 rounded-full bg-[#0a1829] border border-slate-800 flex items-center justify-center text-slate-450 text-xs">
                              ⚙
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* FLETXA DRETA DIRECTA DEL DISSENY */}
            <button 
              onClick={() => setCapturaActiva((prev) => (prev === 5 ? 0 : prev + 1))}
              className="bg-slate-950/60 border border-slate-850 hover:border-blue-500/45 text-slate-400 hover:text-white w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 text-base md:text-lg font-black shrink-0"
              title="Següent"
            >
              ▶
            </button>

          </div>

          {/* DIBUIX DE PAINT: Horizontal pildores / cuandradets directes de control del carrusel */}
          {/* Explicació per a no-programadors:
              Aquest és el llistat de "cuandradets" demanats pel Paint que mostren que queden més fotos de l'app d'estudi per veure. */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-10 max-w-2xl mx-auto">
            {[
              { id: 0, nom: "01. Temari • Tests" },
              { id: 1, nom: "02. Classes Premium" },
              { id: 2, nom: "03. Agenda Directes" },
              { id: 3, nom: "04. Simulacre DOGC" },
              { id: 4, nom: "05. Psicotècnics" },
              { id: 5, nom: "06. Notícies" }
            ].map((pildora) => {
              const actiu = capturaActiva === pildora.id;
              return (
                <button
                  key={pildora.id}
                  onClick={() => setCapturaActiva(pildora.id)}
                  className={`px-3 py-2 rounded-xl transition-all h-8.5 duration-300 flex items-center justify-center cursor-pointer font-black text-[9.5px] uppercase italic tracking-wider ${
                    actiu 
                      ? 'bg-[#FFDF00] border-2 border-yellow-500 text-slate-950 shadow-md shadow-yellow-500/10' 
                      : 'bg-[#021425]/60 border border-slate-900 text-slate-450 hover:border-slate-800 hover:text-white'
                  }`}
                  title={`Veure pantalla ${pildora.id + 1}`}
                >
                  <span className="mr-1.5">{actiu ? "●" : "○"}</span>
                  {pildora.nom}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* 3. SECCIÓ: PROVA FÍSICA (#prova-fisica) */}
      {/* ========================================== */}
      {/* INICI ELEMENT RECREAT EXCLUSIU: SECCIÓ INTERACTIVA DE PROVES FÍSIQUES */}
      {/* Explicació per a no-programadors:
          Aquest és el punt de "Proves Físiques" que hem afegit a la web. Recrea fidelment
          la imatge del mòbil que ens has passat amb disseny de CSS natiu. L'usuari
          pot fer clic als canviadors de Home/Dona, canviar les pestanyes o "Aturar/Iniciar"
          el cronòmetre actiu per veure com funciona en temps real a la web. */}
      <section 
        id="prova-fisica" 
        className="bg-[#031935] py-20 border-t border-blue-950/60 scroll-mt-20 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(3, 25, 53, 0.91), rgba(3, 25, 53, 0.95)), url(${fonsFisica})`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black italic uppercase tracking-widest text-[#FFDF00]">Fase Avaluadora 2</span>
            <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white">La Prova d'Aptitud Física</h3>
            <p className="text-slate-400 text-xs md:text-sm">
              L'entrenament dels Mossos d’Esquadra de la Generalitat requereix paciència, alimentació adequada i disciplina. Descobreix la nostra eina de condicionament des de dins:
            </p>
          </div>

          {/* ESTRUCTURA PRINCIPAL DEL CARRUSEL FÍSIC (MÒBIL A LA DRETA, EXPLICACIÓ A L'ESQUERRA) */}
          <div className="flex items-center gap-3 md:gap-6 max-w-6xl mx-auto">
            
            {/* FLETXA ESQUERRA DIRECTA DEL DISSENY */}
            <button 
              onClick={() => setCapturaFisicaActiva((prev) => (prev === 0 ? 4 : prev - 1))}
              className="bg-slate-950/60 border border-slate-850 hover:border-blue-500/45 text-slate-400 hover:text-white w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 text-base md:text-lg font-black shrink-0"
              title="Enrere"
            >
              ◀
            </button>

            {/* CONTENIDOR SPLIT: ESQUERRA EXPLICACIÓ (LG:COLS-6), DRETA MÒBIL (LG:COLS-6) */}
            {/* Comentari per a no-programadors:
                Hem canviat el fons d'aquest contenidor per un estil semi-transparent amb desenfocament 'backdrop-blur-xl' perquè la imatge d'entrenament física quedi professionalment integrada de fons. */}
            <div className="flex-1 grid lg:grid-cols-12 gap-8 items-center bg-[#031935]/80 backdrop-blur-xl border border-slate-900/40 p-5 md:p-10 rounded-[32px]">
              
              {/* COLS-6 ESQUERRA: EXPLICACIÓ DE LA CAPTURA SELECCIONADA */}
              <div className="lg:col-span-6 space-y-5">
                {(() => {
                  const dadesFisiques = [
                    {
                      subtitol: "FÍSIC 01: NUTRICIÓ SENSE SECRETS",
                      titol: "Eina de Nutrició Intel·ligent i Càlcul de Macros",
                      dsc: "Una bona preparació física comença a la cuina. OposiCAT et calcula en directe els grams exactes de carbohidrats, proteïnes i greixos que necessites ingerir segons les teves sessions de gimnàs per arribar al pes i potència ideals.",
                      punts: [
                        { icon: "🍎", bold: "Ajust de calories actiu:", txt: "Monitoritza els aliments consumits per optimitzar cadascun dels teus àpats sense passar-te de les calories totals diàries de l'opositor." },
                        { icon: "🍟", bold: "Règim equilibrat:", txt: "Barres animades on podràs controlar els macronutrients de cada esmorzar de manera planificada de cara a les proves." }
                      ]
                    },
                    {
                      subtitol: "FÍSIC 02: ENTRENA AMB ELS MILLORS MATERIALS",
                      titol: "Cercador Intel·ligent de Gimnasos i Centres",
                      dsc: "Estudia on vols fer els teus simulacres. Troba centres a Catalunya que disposin de barres homologades de press de banca, circuits de navette o simulacres reals amb els materials oficials dels Mossos d'Esquadra de la Generalitat.",
                      punts: [
                        { icon: "🏋️", bold: "Filtres per equipament:", txt: "Selecciona exclusivament aquells gimnasos de la teva província o poble que ofereixin equipament del circuit d'agilitat homologat." },
                        { icon: "💵", bold: "Subscripció sense sobrecostos:", txt: "Accedeix a preus oficials exclusius i reduïts (com a 'Iron Mossos' per només 30€/mes) des de la nostra app d'estudi." }
                      ]
                    },
                    {
                      subtitol: "FÍSIC 03: APURA CADA SEGON DE L'EXAMEN",
                      titol: "Calculadora de Notes i Cronòmetre de Circuit",
                      dsc: "No perdis temps interpretant complexes taules del DOGC. Introdueix les teves mil·lisegons o segons aconseguits en el circuit d'agilitat i el campus realitzarà la conversió instantània al teu document de nota oficial sobre 10 punts.",
                      punts: [
                        { icon: "⏱️", bold: "Puntetjat exacte de mètrica:", txt: "S'actualitza segons siguis home o dona. Fes servir la calculadora integrada per a calibrar les teves millors marques del cap de setmana." },
                        { icon: "🔄", bold: "Simulació de competició:", txt: "Revisa directament la taula oficial de baremacions de la Generalitat sense necessitat de fullejar PDF de DOGC externs." }
                      ]
                    },
                    {
                      subtitol: "FÍSIC 04: EVITA LESIONS I MILLORA MARQUES",
                      titol: "Guia Anatòmica de Músculs de cada Prova",
                      dsc: "Executa els exercicis lliures d'errors. OposiCAT t'ensenya de forma interactiva quins són els músculs principals i secundaris implicats en cadascuna de les proves físiques de l'examen oficial.",
                      punts: [
                        { icon: "💪", bold: "Focus d'empenta correcta:", txt: "T'indiquem els músculs de tracció clau que cal enfortir com el pectoral major, el tríceps o els deltoides per augmentar el volum de repeticions." },
                        { icon: "🧠", bold: "Tècniques de millora d'experts:", txt: "Consells pràctics i preparacions fetes directament de la mà de entrenadors i mossos en actiu per perfeccionar l'agafada i l'estabilitat." }
                      ]
                    },
                    {
                      subtitol: "FÍSIC 05: DISCIPLINA DIÀRIA",
                      titol: "Plans d'Entrenament Setmanal Planificats",
                      dsc: "Organitza millor la teva evolució d'entrenament. L'aplicació compta amb un pla progressiu d'exercicis segons la setmana temporal d'oposició en la qual et trobis (Ex: Setmana 5 a l'11 d'entrenament).",
                      punts: [
                        { icon: "🗓️", bold: "Seguiment de dies actiu:", txt: "Marca les teves sessions de flexions explosives com a completades i l'app mantindrà un historial exacte del teu rendiment." },
                        { icon: "⏱️", bold: "Pautes de recuperació integrades:", txt: "Temporitzadors intel·ligents per fer exercicis de recuperació ràpida (ex: 45 segons de descans) amb reproductor i guies reals." }
                      ]
                    }
                  ];

                  const seleccionadaFisica = dadesFisiques[capturaFisicaActiva] || dadesFisiques[0];

                  return (
                    <div className="space-y-4 text-left animate-fadeIn">
                      <span className="inline-block text-[#FFDF00] bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                        {seleccionadaFisica.subtitol}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black italic uppercase text-white leading-tight">
                        {seleccionadaFisica.titol}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                        {seleccionadaFisica.dsc}
                      </p>
                      <div className="space-y-3.5 pt-1">
                        {seleccionadaFisica.punts.map((pnt, pIdx) => (
                          <div key={pIdx} className="flex gap-2.5 items-start">
                            <span className="bg-[#00f296]/10 border border-[#00f296]/20 p-1.5 rounded-lg text-sm shrink-0">
                              {pnt.icon}
                            </span>
                            <div className="space-y-0.5">
                              <h4 className="text-[10.5px] font-black uppercase tracking-wide text-white">
                                {pnt.bold}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                                {pnt.txt}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botó CTA de contacte / campus */}
                      <div className="pt-3">
                        <button 
                          onClick={onEntrarWorkspace}
                          className="w-full md:w-auto bg-green-605 hover:bg-green-500 text-white text-[10px] font-black italic uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-900/40"
                        >
                          PROVAR AQUEST MODULE AL CAMPUS ARA →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* COLS-6 DRETA: EL MÒBIL INTEGRES AMB LES CAPTURES INTERACTIVES */}
              {/* Comentari per a no-programadors:
                  Aquest és el telèfon intel·ligent simulat amb CSS natiu que canvia el seu contingut intern transparent 
                  en funció de la capture seleccionada. Tot el codi que hi ha a sota és completament fidel al disseny indicat. */}
              <div className="lg:col-span-6 flex justify-center items-center">
                <div className="relative">
                  
                  {/* Efete brillant de fons per ressaltar el telèfon clínicament útil */}
                  <div className="absolute inset-0 bg-[#00f296]/5 rounded-[48px] filter blur-[60px] -z-10 animate-pulse"></div>
                  
                  {/* SMARTPHONE EN CSS */}
                  <div className="relative bg-[#020b16] rounded-[48px] p-4 shadow-2xl border-4 border-slate-800 max-w-[340px] w-full aspect-[9/18] flex flex-col justify-between overflow-hidden ring-12 ring-slate-950/40 select-none">
                    
                    {/* Barra d'estat superior, altaveu i càmera selfie simulada */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-slate-950 rounded-full flex justify-between items-center px-4.5 z-40 border border-slate-900/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                      <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
                      <div className="text-[7.5px] text-slate-500 font-mono font-bold">100%</div>
                    </div>

                    {/* INTERIOR DE L'APP DE L'USUARI (MODULAR COMPROMÈS) */}
                    <div className="flex-1 bg-[#011c38] rounded-[38px] p-4 pt-8 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
                      
                      {/* CAPTURA 0: DIETA */}
                      {capturaFisicaActiva === 0 && (
                        <div className="flex-1 flex flex-col justify-between text-left animate-fadeIn">
                          <div>
                            {/* Capçalera del mòdul */}
                            <div className="flex items-center gap-2 mb-2">
                              <button onClick={() => setDietaConsumida(1036)} className="w-8 h-8 rounded-xl bg-[#092039] border border-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold font-mono">
                                ‹
                              </button>
                              <div className="flex flex-col">
                                <span className="text-[7.5px] text-[#00f296] font-bold tracking-wider uppercase">Eina de nutrició</span>
                                <h4 className="text-[12px] font-black italic uppercase leading-none text-white tracking-tight">INTEL·LIGENT</h4>
                              </div>
                            </div>

                            {/* Cercle calòric central de la imatge */}
                            <div className="relative w-36 h-36 mx-auto rounded-full border-4 border-[#032448]/60 flex items-center justify-center mt-3 shadow-inner">
                              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="44"
                                  stroke="#00f296"
                                  strokeWidth="4"
                                  fill="transparent"
                                  strokeDasharray="276"
                                  strokeDashoffset={(60 * (1800 - dietaConsumida)) / 1800}
                                  className="transition-all duration-700"
                                />
                              </svg>
                              <div className="absolute inset-1.5 bg-[#01152a] rounded-full flex flex-col items-center justify-center p-2 text-center border border-blue-900/10">
                                <span className="text-[28px] font-black italic text-white tracking-tight leading-none">
                                  {1800 - dietaConsumida}
                                </span>
                                <span className="text-[7px] text-slate-400 font-black uppercase tracking-wider mt-1.5">
                                  KCAL RESTANTS
                                </span>
                                <div className="mt-2 bg-[#00f296]/10 px-2.5 py-1 rounded-full border border-[#00f296]/20">
                                  <span className="text-[6.5px] text-[#00f296] font-extrabold uppercase tracking-wide">
                                    ● {dietaConsumida} CONSUMIDES
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Llistat de Macros de la imatge de referència */}
                            <div className="grid grid-cols-3 gap-2 mt-4 text-[7px] font-bold text-center">
                              <div>
                                <div className="text-slate-400 uppercase tracking-widest text-[6px]">CARBS</div>
                                <div className="text-blue-400 font-black mt-0.5">70<span className="text-[6px] text-slate-500">g/250g</span></div>
                                <div className="w-full bg-slate-900 h-1 rounded-full mt-1 overflow-hidden">
                                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '28%' }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400 uppercase tracking-widest text-[6px]">PROTES</div>
                                <div className="text-[#00f296] font-black mt-0.5">138<span className="text-[6px] text-slate-500">g/150g</span></div>
                                <div className="w-full bg-slate-900 h-1 rounded-full mt-1 overflow-hidden">
                                  <div className="bg-[#00f296] h-full rounded-full" style={{ width: '92%' }}></div>
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400 uppercase tracking-widest text-[6px]">GREIXOS</div>
                                <div className="text-yellow-400 font-black mt-0.5">15<span className="text-[6px] text-slate-500">g/70g</span></div>
                                <div className="w-full bg-slate-900 h-1 rounded-full mt-1 overflow-hidden">
                                  <div className="bg-yellow-400 h-full rounded-full" style={{ width: '21%' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Secció Esmorzar interactiva a sota */}
                          <div className="bg-[#021327]/85 border border-slate-900/60 p-2.5 rounded-2xl space-y-2 mt-1">
                            <div className="flex justify-between items-center pb-1 border-b border-blue-900/20">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-yellow-400">☕</span>
                                <span className="text-[8.5px] font-black italic uppercase text-white">ESMORZAR</span>
                              </div>
                              <span className="text-[8.5px] font-mono text-slate-400 font-extrabold">1036 cal</span>
                            </div>
                            <p className="text-[7.5px] text-slate-400 font-semibold leading-relaxed">
                              Poma, Poma, Poma, Arròs bullit (100g), Pit de pollastre (150g).
                            </p>
                            
                            {/* Controls de la llista de Dieta */}
                            <div className="flex justify-between items-center pt-1">
                              <button 
                                onClick={() => setDietaConsumida((prev) => Math.min(1800, prev + 100))}
                                className="bg-[#00f296]/15 hover:bg-[#00f296]/25 border border-[#00f296]/30 text-[#00f296] px-2.5 py-1 rounded-lg text-[6.5px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                + AFEGIR MENJAR
                              </button>
                              <button 
                                onClick={() => setDietaConsumida((prev) => Math.max(0, prev - 100))}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-2 py-1 rounded-lg text-[6.5px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                ✕ CORREGIR APAT
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CAPTURA 1: BUSCADOR DE GIMNASOS */}
                      {capturaFisicaActiva === 1 && (
                        <div className="flex-1 flex flex-col justify-between text-left animate-fadeIn">
                          <div>
                            {/* Capçalera del mòdul */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-xl bg-[#092039] border border-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold font-mono">
                                ‹
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Llistat de centres</span>
                                <h4 className="text-[12px] font-black italic uppercase leading-none text-white tracking-tight">CENTRES A <span className="text-[#00f296]">AVINYONET</span></h4>
                              </div>
                            </div>

                            {/* Botó filtre groc */}
                            <div className="mt-2 text-center">
                              <button 
                                onClick={() => setFiltreGimnas((v) => (v === "AMB PRESS" ? "AMB CIRCUIT" : "AMB PRESS"))}
                                className="bg-[#FFDF00] hover:bg-yellow-450 text-slate-950 font-black uppercase italic text-[8.5px] tracking-widest py-2 px-3.5 w-full rounded-xl flex items-center justify-center gap-1 shadow-md"
                              >
                                ▲ FILTRAR PER: {filtreGimnas}
                              </button>
                            </div>

                            {/* Grid filtres estil bento de la imatge */}
                            <div className="grid grid-cols-2 gap-1.5 mt-2">
                              <button className="bg-slate-900/60 border border-slate-850 p-1.5 rounded-lg text-center text-[6.5px] font-black uppercase text-slate-400">
                                TOP VALORATS (+4.5)
                              </button>
                              <button className="bg-slate-900/60 border border-slate-850 p-1.5 rounded-lg text-center text-[6.5px] font-black uppercase text-slate-400">
                                ECONÒMIC (€)
                              </button>
                              <button 
                                onClick={() => setFiltreGimnas("AMB CIRCUIT")}
                                className={`p-1.5 rounded-lg text-center text-[6.5px] font-black uppercase border transition-all ${
                                  filtreGimnas === "AMB CIRCUIT"
                                    ? 'bg-[#00f296]/15 border-[#00f296]/45 text-[#00f296]'
                                    : 'bg-slate-900/60 border-slate-850 text-slate-400'
                                }`}
                              >
                                AMB CIRCUIT
                              </button>
                              <button 
                                onClick={() => setFiltreGimnas("AMB PRESS")}
                                className={`p-1.5 rounded-lg text-center text-[6.5px] font-black uppercase border transition-all ${
                                  filtreGimnas === "AMB PRESS"
                                    ? 'bg-rose-500 border-rose-600 text-white'
                                    : 'bg-slate-900/60 border-slate-850 text-slate-400'
                                }`}
                              >
                                AMB PRESS
                              </button>
                            </div>

                            <div className="flex justify-between items-center text-[7px] mt-2.5 px-0.5">
                              <span className="text-slate-400 font-black">S'HAN TROBAT 1 CENTRE</span>
                              <button onClick={() => setFiltreGimnas("AMB PRESS")} className="text-[#00f296] font-black hover:underline">Netejar filtres</button>
                            </div>
                          </div>

                          {/* Targeta del centre IRON MOSSOS fidel a la imatge */}
                          <div className="bg-[#021327]/85 border border-[#04213d] p-3 rounded-2xl space-y-2 mt-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="text-[12px] font-black italic uppercase text-[#FFDF00]">IRON MOSSOS</h5>
                                <p className="text-[6.5px] text-slate-450 mt-0.5 leading-none">Av. de la Força, 4 • Avinyonet</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[9.5px] font-mono font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded-md">★ 4.7</span>
                              </div>
                            </div>
                            
                            <hr className="border-slate-900/60 my-1" />
                            
                            <div className="grid grid-cols-2 gap-1 items-end">
                              <div className="space-y-0.5">
                                <div className="text-[6px] text-slate-450 uppercase font-black tracking-wider">Oferirà:</div>
                                <div className="text-[7px] text-[#00f296] font-black flex items-center gap-1">
                                  ✓ PRESS DE BANCA
                                </div>
                                <div className="text-[7px] text-slate-500 font-semibold flex items-center gap-1">
                                  {filtreGimnas === "AMB CIRCUIT" ? "✓ CIRCUIT D'AGILITAT" : "✗ CIRCUIT D'AGILITAT"}
                                </div>
                                <div className="text-[7px] text-slate-500 font-semibold flex items-center gap-1">
                                  ✗ COURSE NAVETTE
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[5.5px] text-slate-450 uppercase font-black">Preu:</div>
                                <div className="text-xs font-black text-[#00f296] tracking-tight">30€ <span className="text-[6.5px] text-slate-400">/mes</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CAPTURA 2: CRONÒMETRES ESPECIALITZATS (CALCULADORA CIRCUIT) */}
                      {capturaFisicaActiva === 2 && (
                        <div className="flex-1 flex flex-col justify-between text-left animate-fadeIn">
                          <div>
                            {/* Capçalera del mòdul */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-8 h-8 rounded-xl bg-[#092039] border border-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold font-mono">
                                ‹
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[7px] text-[#00f296] font-bold tracking-wider uppercase leading-none">Agilitat i velocitat</span>
                                <h4 className="text-[12px] font-black italic uppercase leading-none text-white tracking-tight mt-0.5">PROVA: CIRCUIT D'AGILITAT</h4>
                              </div>
                            </div>

                            {/* Pestanyes dalt de la calculadora */}
                            <div className="grid grid-cols-2 gap-1 bg-[#001021]/80 rounded-lg p-0.5 border border-[#032142] mt-1.5">
                              <button className="text-[6.5px] font-black uppercase py-2.5 px-0.5 rounded-md bg-[#FFDF00] text-[#011c38] shadow-md">
                                CALCULADORA INTEL·LIGENT
                              </button>
                              <button className="text-[6.5px] font-black uppercase py-2.5 px-0.5 rounded-md text-slate-400 bg-transparent">
                                VALORS I NOTES OFICIALS
                              </button>
                            </div>

                            {/* Selectors Homes i Dones */}
                            <div className="grid grid-cols-2 gap-1.5 mt-2">
                              <button 
                                onClick={() => setSexeAgilitat('home')}
                                className={`py-1.5 rounded-lg border text-[7.5px] font-black uppercase tracking-wider text-center cursor-pointer transition-all ${
                                  sexeAgilitat === 'home'
                                    ? 'border-[#00f296] text-[#00f296] bg-[#00f296]/5 shadow-[0_0_10px_rgba(0,242,150,0.05)]'
                                    : 'border-slate-850 text-slate-500 bg-transparent'
                                }`}
                              >
                                HOME (MAX 13S)
                              </button>
                              <button 
                                onClick={() => setSexeAgilitat('dona')}
                                className={`py-1.5 rounded-lg border text-[7.5px] font-black uppercase tracking-wider text-center cursor-pointer transition-all ${
                                  sexeAgilitat === 'dona'
                                    ? 'border-[#00f296] text-[#00f296] bg-[#00f296]/5 shadow-[0_0_10px_rgba(0,242,150,0.05)]'
                                    : 'border-slate-850 text-slate-500 bg-transparent'
                                }`}
                              >
                                DONA (MAX 15.1S)
                              </button>
                            </div>
                          </div>

                          {/* Cercle principal de puntuació interactiva */}
                          <div className="flex-1 flex flex-col justify-center items-center py-1">
                            
                            <div className="relative w-32 h-32 rounded-full border-4 border-[#032448]/60 flex items-center justify-center mt-1">
                              
                              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="44"
                                  stroke="#00f296"
                                  strokeWidth="4.5"
                                  fill="transparent"
                                  strokeDasharray="276"
                                  strokeDashoffset={sexeAgilitat === 'home' ? (segonsAgilitat <= 13.5 ? 20 : segonsAgilitat >= 18 ? 240 : 120) : (segonsAgilitat <= 15.5 ? 20 : segonsAgilitat >= 20 ? 240 : 120)}
                                  className="transition-all duration-700"
                                />
                              </svg>

                              <div className="absolute inset-1.5 bg-[#01152a] rounded-full flex flex-col items-center justify-center p-2 text-center border border-blue-900/10">
                                <span className="text-[7px] text-slate-450 font-black uppercase tracking-widest leading-none">
                                  LA TEVA NOTA
                                </span>
                                
                                <span className="text-[34px] font-extrabold italic text-white tracking-tight mt-2.5 leading-none">
                                  {sexeAgilitat === 'home'
                                    ? (segonsAgilitat <= 13.7 ? "10" : segonsAgilitat <= 14.8 ? "8" : segonsAgilitat <= 16.9 ? "5" : "0")
                                    : (segonsAgilitat <= 15.6 ? "10" : segonsAgilitat <= 16.9 ? "8" : segonsAgilitat <= 19.1 ? "5" : "0")
                                  }<span className="text-xs text-slate-400 font-bold">/10</span>
                                </span>

                                <span className="text-[5.5px] text-[#00f296] font-black uppercase tracking-wider block mt-2.5">
                                  {sexeAgilitat === 'home'
                                    ? (segonsAgilitat <= 16.9 ? "✓ APTE MARCA" : "✗ NO APTE")
                                    : (segonsAgilitat <= 19.1 ? "✓ APTE MARCA" : "✗ NO APTE")
                                  }
                                </span>
                              </div>
                            </div>

                            {/* Botó Tornar a provar d'ajust segons */}
                            <div className="flex gap-2 items-center justify-center mt-3 bg-slate-950/40 p-1 rounded-xl border border-blue-950/30 w-full">
                              <button onClick={() => setSegonsAgilitat((v) => Math.max(10, Math.round((v - 0.5) * 100) / 100))} className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-xs font-mono font-bold hover:text-[#00f296] cursor-pointer">-</button>
                              <span className="text-[8px] font-mono font-black text-white">HAS TRIGAT: {segonsAgilitat}s</span>
                              <button onClick={() => setSegonsAgilitat((v) => Math.min(25, Math.round((v + 0.5) * 100) / 100))} className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-xs font-mono font-bold hover:text-[#00f296] cursor-pointer">+</button>
                            </div>
                          </div>

                          <div className="mt-2">
                            <button 
                              onClick={() => setSegonsAgilitat(16.66)}
                              className="w-full bg-[#092039] hover:bg-slate-900 border border-[#04213c] text-slate-200 text-[8.5px] font-black uppercase italic py-3 rounded-xl tracking-wider shadow active:scale-95 transition-all text-center"
                            >
                              ↺ TORNAR A PROVAR
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CAPTURA 3: GUIA ANATÒMICA (MÚSCULS DE CADA PROVA) */}
                      {capturaFisicaActiva === 3 && (
                        <div className="flex-1 flex flex-col justify-between text-left animate-fadeIn">
                          <div>
                            {/* Capçalera del mòdul */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-xl bg-[#092039] border border-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold font-mono">
                                ‹
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[7px] text-[#00f296] font-bold tracking-wider uppercase leading-none">Força tren superior</span>
                                <h4 className="text-[11.5px] font-black italic uppercase leading-none text-white tracking-tight mt-0.5">PROVA: PRESS DE BANCA</h4>
                              </div>
                            </div>

                            {/* Banner de Guia de millora anatòmica */}
                            <div className="bg-[#021327]/80 border border-slate-850 p-2 rounded-xl flex items-center gap-2">
                              <div className="bg-[#00f296]/10 p-1.5 rounded-lg text-xs">💪</div>
                              <div>
                                <h5 className="text-[8.5px] font-black uppercase tracking-wide text-white leading-none">GUIA DE MILLORA</h5>
                                <span className="text-[6px] text-slate-450 uppercase leading-none block mt-0.5">tècniques i consells d'experts</span>
                              </div>
                            </div>

                            <p className="text-[7.5px] text-slate-400 italic font-semibold leading-relaxed mt-2 text-center border-l-2 border-blue-900/30 pl-2">
                              "Ensenyem a treballar els músculs principals i secundaris implicats en un press de banca perfecte."
                            </p>
                          </div>

                          {/* Secció músculs seleccionables */}
                          <div className="flex-1 overflow-y-auto max-h-48 space-y-1.5 py-1.5 mt-1 pr-1 scrollbar-thin scrollbar-thumb-blue-900/60 scrollbar-track-transparent">
                            
                            <div className="text-[6.5px] text-[#00f296] font-extrabold uppercase tracking-widest pl-0.5">MÚSCULS PRINCIPALS:</div>
                            {[
                              { nom: "PECTORAL MAJOR", dsc: "Crucial per a l'empenta inicial del pes de 40kg / 25kg." },
                              { nom: "TRÍCEPS BRAQUIAL", dsc: "Actua en l'extensió final del colze en la part de bloqueig." },
                              { nom: "DELTOIDE ANTERIOR", dsc: "Sosté l'estabilitat articular alta durant el recorregut d'empit." }
                            ].map((musc) => (
                              <div 
                                key={musc.nom}
                                onClick={() => setMusculObert(musculObert === musc.nom ? "" : musc.nom)}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  musculObert === musc.nom 
                                    ? 'bg-[#00f296]/10 border-[#00f296]/30' 
                                    : 'bg-slate-900/60 border-slate-850 hover:border-slate-800'
                                }`}
                              >
                                <div className="flex justify-between items-center text-[7.5px] font-black text-white">
                                  <span>{musculObert === musc.nom ? "▼" : "▶"}&nbsp;&nbsp;{musc.nom}</span>
                                  <span className="text-[#00f296]">›</span>
                                </div>
                                {musculObert === musc.nom && (
                                  <p className="text-[6.5px] text-slate-400 font-semibold leading-relaxed mt-1 animate-slideUp">
                                    {musc.dsc}
                                  </p>
                                )}
                              </div>
                            ))}

                            <div className="text-[6.5px] text-slate-400 font-extrabold uppercase tracking-widest pl-0.5 pt-1.5 animate-fadeIn">MÚSCULS SECUNDARIS:</div>
                            {[
                              { nom: "SERRAT ANTERIOR", dsc: "Manté rígit l'omòplat enganxat al pit per empènyer millor." },
                              { nom: "TRAPECI", dsc: "Estabilitza les espatlles en la fase de baixada i retenció." }
                            ].map((musc) => (
                              <div 
                                key={musc.nom}
                                onClick={() => setMusculObert(musculObert === musc.nom ? "" : musc.nom)}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  musculObert === musc.nom 
                                    ? 'bg-[#00f296]/10 border-[#00f296]/30' 
                                    : 'bg-slate-900/60 border-slate-850 hover:border-slate-800'
                                }`}
                              >
                                <div className="flex justify-between items-center text-[7.5px] font-black text-white">
                                  <span>{musculObert === musc.nom ? "▼" : "▶"}&nbsp;&nbsp;{musc.nom}</span>
                                  <span className="text-[#00f296]">›</span>
                                </div>
                                {musculObert === musc.nom && (
                                  <p className="text-[6.5px] text-slate-400 font-semibold leading-relaxed mt-1 animate-slideUp">
                                    {musc.dsc}
                                  </p>
                                )}
                              </div>
                            ))}

                          </div>
                        </div>
                      )}

                      {/* CAPTURA 4: PLANS D'ENTRENAMENT PERSONALITZATS SETMANALS */}
                      {capturaFisicaActiva === 4 && (
                        <div className="flex-1 flex flex-col justify-between text-left animate-fadeIn">
                          <div>
                            {/* Capçalera del mòdul */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-xl bg-[#092039] border border-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold font-mono">
                                ‹
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[7px] text-[#00f296] font-bold tracking-wider uppercase leading-none">Força tren superior</span>
                                <h4 className="text-[11.5px] font-black italic uppercase leading-none text-white tracking-tight mt-0.5">PROVA: PRESS DE BANCA</h4>
                              </div>
                            </div>

                            {/* Banner de Pla d'entrenament */}
                            <div className="bg-[#021327]/80 border border-slate-850 p-2 rounded-xl flex items-center gap-2">
                              <div className="bg-blue-600/15 p-1.5 rounded-lg text-xs">📅</div>
                              <div>
                                <h5 className="text-[8.5px] font-black uppercase tracking-wide text-white leading-none">PLA D'ENTRENAMENT</h5>
                                <span className="text-[6px] text-slate-450 uppercase leading-none block mt-0.5">guia setmanal personalitzada</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[7.5px] font-black uppercase text-slate-400 mt-2">
                              <span>PLA SETMANES 5 AL 11</span>
                              <span className="text-[#00f296]">ENTRENAMENT PERSONAL</span>
                            </div>

                            {/* Graella dels 8 botons de check interactius */}
                            <div className="grid grid-cols-4 gap-1.5 mt-2">
                              {diesPla.map((boolea, index_boolea) => (
                                <button
                                  key={index_boolea}
                                  onClick={() => {
                                    const nousDies = [...diesPla];
                                    nousDies[index_boolea] = !nousDies[index_boolea];
                                    setDiesPla(nousDies);
                                  }}
                                  className={`aspect-square rounded-lg border flex items-center justify-center text-[8.5px] font-bold cursor-pointer transition-all ${
                                    boolea
                                      ? 'bg-[#00f296]/15 border-[#00f296] text-[#00f296]'
                                      : 'bg-slate-900/60 border-slate-850 text-slate-500 hover:border-slate-800'
                                  }`}
                                  title={`Dia ${index_boolea + 1}`}
                                >
                                  {boolea ? "✓" : `D${index_boolea + 1}`}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Exercici seleccionat a sota */}
                          <div className="bg-[#021327]/85 border border-[#04213d] p-3 rounded-2xl text-center space-y-2.5 mt-2">
                            <h5 className="text-[12px] font-black italic uppercase text-white tracking-wide">FLEXIONS EXPLOSIVES</h5>
                            
                            <div className="inline-block bg-[#00f296]/10 border border-[#00f296]/20 py-1.5 px-3 rounded-full text-[8.5px] text-[#00f296] font-mono font-black uppercase tracking-widest mx-auto">
                              ⏱ 45 SEGONS
                            </div>

                            {/* Mini player visual simulador directament com demana la imatge */}
                            <div className="flex justify-center items-center gap-3.5 pt-1">
                              <button className="text-[10px] text-slate-500 hover:text-white" title="Dia enrere">◀</button>
                              <button 
                                onClick={() => {
                                  const nousDies = [...diesPla];
                                  const primerFals = nousDies.indexOf(false);
                                  if (primerFals !== -1) nousDies[primerFals] = true;
                                  setDiesPla(nousDies);
                                }}
                                className="w-8 h-8 rounded-full bg-[#00f296] hover:scale-105 active:scale-95 flex items-center justify-center text-slate-950 font-black cursor-pointer shadow shadow-[#00f296]/25"
                                title="Iniciar sèrie"
                              >
                                ▶
                              </button>
                              <button className="text-[10px] text-slate-500 hover:text-white" title="Dia següent">▶</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* INDICADOR PEU MÒBIL DEL SIMULADOR */}
                      <div className="flex justify-between items-center text-slate-600 text-[8px] mt-3.5 pt-1.5 border-t border-[#042447]">
                        <span className="uppercase font-bold tracking-widest pl-0.5">OPOSIMOSSOS ATHLETICS</span>
                        <button 
                          onClick={() => {
                            setDietaConsumida(1036);
                            setFiltreGimnas("AMB PRESS");
                            setSegonsAgilitat(16.66);
                            setSexeAgilitat('home');
                            setMusculObert("PECTORAL MAJOR");
                            setDiesPla([true, true, true, false, true, true, false, false]);
                          }}
                          className="w-5.5 h-5.5 rounded-full bg-[#031d38] border border-blue-950/40 flex items-center justify-center text-[10px] text-slate-500 active:scale-90 cursor-pointer hover:bg-slate-900 hover:text-white shadow"
                          title="Reiniciar dades del formulari"
                        >
                          ⚙
                        </button>
                      </div>

                    </div>
                  </div>
                  
                </div>
              </div>

            </div> {/* FI DEL CONTENIDOR SPLIT */}

            {/* FLETXA DRETA DIRECTA DEL DISSENY */}
            <button 
              onClick={() => setCapturaFisicaActiva((prev) => (prev === 4 ? 0 : prev + 1))}
              className="bg-slate-950/60 border border-slate-850 hover:border-blue-500/45 text-slate-400 hover:text-white w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 text-base md:text-lg font-black shrink-0"
              title="Següent"
            >
              ▶
            </button>

          </div>

          {/* DIBUIX DE PAINT: Horizontal pildores directes de control del carrusel físic */}
          {/* Explicació per a no-programadors:
              Aquest és el llistat de botons de control interactius de la part física que canvien l'emulador mòbil al moment en fer-hi clic. */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-10 max-w-2xl mx-auto">
            {[
              { id: 0, nom: "01. Dieta i Macros" },
              { id: 1, nom: "02. Gimnasos Mossos" },
              { id: 2, nom: "03. Cronòmetres Circuit" },
              { id: 3, nom: "04. Guia Anatòmica" },
              { id: 4, nom: "05. Pla Entrenament" }
            ].map((pildora) => {
              const actiu = capturaFisicaActiva === pildora.id;
              return (
                <button
                  key={pildora.id}
                  onClick={() => setCapturaFisicaActiva(pildora.id)}
                  className={`px-3 py-2 rounded-xl h-8.5 transition-all duration-300 flex items-center justify-center cursor-pointer font-black text-[9.5px] uppercase italic tracking-wider ${
                    actiu 
                      ? 'bg-[#FFDF00] border-2 border-yellow-500 text-slate-950 shadow-md shadow-yellow-500/10' 
                      : 'bg-[#021425]/60 border border-slate-900 text-slate-450 hover:border-slate-800 hover:text-white'
                  }`}
                  title={`Veure apartat físic ${pildora.id + 1}`}
                >
                  <span className="mr-1.5">{actiu ? "●" : "○"}</span>
                  {pildora.nom}
                </button>
              );
            })}
          </div>

        </div>
      </section>
      {/* FI ELEMENT RECREAT EXCLUSIU */}

      {/* ========================================== */}
      {/* PART 4: PROVA PSICOPROFESSIONAL (#prova-psicoprofesional) */}
      {/* Explicació per a no-programadors:
          Aquesta secció detalla i explica la prova psicoprofessional (tests psicològics, qüestionari competencial i entrevista personal).
          Està completament traduïda i explicada en català planer de cara a l'opositor. */}
      {/* ========================================== */}
      <section 
        id="prova-psicoprofesional" 
        className="bg-[#010c1c] py-20 border-t border-slate-900/60 scroll-mt-20 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(1, 12, 28, 0.91), rgba(1, 12, 28, 0.95)), url(${fonsPsicologica})`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black italic uppercase tracking-widest text-[#FFDF00]">Fase Avaluadora 3</span>
            <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white">L'Àrea Psicoprofessional</h3>
            <p className="text-slate-400 text-xs md:text-sm">
              Una plaça de policia requereix un perfil psicològic equilibrat, ètic i adaptat. Preparem totes les sub-proves d'aquesta darrera fase de forma progressiva i pràctica:
            </p>
          </div>

          {/* ESTRUCTURA PRINCIPAL DEL CARRUSEL PSICOPROFESSIONAL (MÒBIL A L'ESQUERRA, EXPLICACIÓ A LA DRETA) */}
          <div className="flex items-center gap-3 md:gap-6 max-w-6xl mx-auto">
            
            {/* FLETXA ESQUERRA DIRECTA DEL DISSENY */}
            <button 
              onClick={() => setCapturaPsicoActiva((prev) => (prev === 0 ? 2 : prev - 1))}
              className="bg-slate-950/60 border border-slate-850 hover:border-blue-500/45 text-slate-400 hover:text-white w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 text-base md:text-lg font-black shrink-0"
              title="Enrere"
            >
              ◀
            </button>

            {/* CONTENIDOR SPLIT: ESQUERRA MÒBIL (LG:COLS-6), DRETA EXPLICACIÓ (LG:COLS-6)
                Comentari per a no-programadors:
                Hem canviat el fons d'aquest contenidor per un fons semi-transparent modern i elegant amb backdrop-blur-xl per a veure el despatx psicològic polidament integrat. */}
            <div className="flex-1 grid lg:grid-cols-12 gap-8 items-center bg-[#010c1c]/80 backdrop-blur-xl border border-slate-900/60 p-5 md:p-10 rounded-[32px]">
              
              {/* MITJA PANTALLA DRETA: EXPLICACIÓ DE LA CAPTURA SELECCIONADA */}
              <div className="lg:col-span-6 space-y-5 lg:order-2">
                {(() => {
                  const dadesPsicologiques = [
                    {
                      subtitol: "PSICO 01: BIODATA INÈDITS",
                      titol: "Tests de Biodata Inèdits de Mossos d’Esquadra",
                      dsc: "Supera el clàssic qüestionari de dades biogràfiques dels Mossos d’Esquadra de Catalunya amb exàmens i exercicis de dades personals totalment inèdits. Són idèntics als reals del tribunal opositor de la Generalitat però dissenyats específicament per cadascun dels nostres propis psicòlegs.",
                      punts: [
                        { icon: "📝", bold: "Idèntics a l'examen del tribunal:", txt: "Recreem meticulosament l'estructura, el format, el tipus de preguntes biogràfiques i la mètrica oficial per rebre un entrenament precís abans de l'entrevista." },
                        { icon: "🛡️", bold: "Generats pel nostre equip especialitzat:", txt: "Continguts de creació pròpia fets per psicòlegs d'OposiCAT que coneixen i s'estudien fins a l'últim detall de les dinàmiques de seguretat." }
                      ]
                    },
                    {
                      subtitol: "PSICO 02: MULTI-TESTS COMPETENCIALS",
                      titol: "Exercicis Pràctics creats per Psicòlegs de l’ISPC",
                      dsc: "Entrena't i resol de forma dinàmica preguntes dissenyades per psicòlegs que anteriorment col·laboraven directament a l'Institut de Seguretat Pública de Catalunya (ISPC) de Mollet del Vallès. Desenvolupa el millor criteri de repulsió d'estrès i ètica deontològica que demana el cos.",
                      punts: [
                        { icon: "🏫", bold: "Saber teòric de l'ISPC de Mollet:", txt: "Preguntes basades estrictament en les competències professionals de l'acadèmia de Mollet (treball cooperatiu, tolerància i servei públic)." },
                        { icon: "⚡", bold: "Exercicis dinàmics guanyadors:", txt: "Estudia centenars de supòsits d'examen reals en línia amb correccions detallades per aprovar sense dubtes." }
                      ]
                    },
                    {
                      subtitol: "PSICO 03: SIMULACRES D’ENTREVISTA ELIT",
                      titol: "Entrevistes Reals sobre el Teu Propi Biodata",
                      dsc: "Fugim de la preparació clònica que fan totes les altres acadèmies. Els nostres professionals utilitzaran el teu propi dossier de Biodata introduït anteriorment per a simular l'entrevista oficial dels Mossos d'Esquadra, polint les teves respostes al màxim.",
                      punts: [
                        { icon: "🗣️", bold: "Entrevistes al mil·límetre:", txt: "Aprofundim en la teva idoneïtat personalitzada en lloc de donar-te respostes buides de contingut genèric." },
                        { icon: "🎯", bold: "Preparació directa davant del tribunal:", txt: "Treballa amb psicòlegs professionals el teixit verbal, comunicatiu i d'actuació per garantir l'Aprovat." }
                      ]
                    }
                  ];

                  const seleccionadaPsico = dadesPsicologiques[capturaPsicoActiva] || dadesPsicologiques[0];

                  return (
                    <div className="space-y-4 text-left animate-fadeIn">
                      <span className="inline-block text-[#FFDF00] bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                        {seleccionadaPsico.subtitol}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black italic uppercase text-white leading-tight">
                        {seleccionadaPsico.titol}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                        {seleccionadaPsico.dsc}
                      </p>
                      <div className="space-y-3.5 pt-1">
                        {seleccionadaPsico.punts.map((pnt, pIdx) => (
                          <div key={pIdx} className="flex gap-2.5 items-start">
                            <span className="bg-[#00f296]/10 border border-[#00f296]/20 p-1.5 rounded-lg text-sm shrink-0">
                              {pnt.icon}
                            </span>
                            <div className="space-y-0.5">
                              <h4 className="text-[10.5px] font-black uppercase tracking-wide text-white">
                                {pnt.bold}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                                {pnt.txt}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botó CTA de contacte/campus */}
                      <div className="pt-3">
                        <button 
                          onClick={onEntrarWorkspace}
                          className="w-full md:w-auto bg-green-605 hover:bg-green-500 text-white text-[10px] font-black italic uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-950/40"
                        >
                          PROVAR AQUEST MODULE AL CAMPUS ARA →
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* MITJA PANTALLA ESQUERRA DE COLS-6 (AMB lg:order-1 PER COL·LOCAR EL SMARTPHONE MÒBIL A L'ESQUERRA EN ESCRIPTORI) */}
              {/* Comentari per a no-programadors:
                  Aquest és el telèfon intel·ligent simulat amb CSS que allotja l'interior de la capture interactiva actual.
                  Dins de la pantalla del mòbil es mostra la imatge generada per IA que representa exactament aquesta part del programari. */}
              <div className="lg:col-span-6 flex justify-center items-center lg:order-1">
                <div className="relative">
                  {/* Efecte brillant de fons per ressaltar el telèfon */}
                  <div className="absolute inset-0 bg-[#00f296]/5 rounded-[48px] filter blur-[60px] -z-10 animate-pulse"></div>

                  {/* SMARTPHONE EN CSS */}
                  <div className="relative bg-[#020b16] rounded-[48px] p-4 shadow-2xl border-4 border-slate-800 max-w-[340px] w-full aspect-[9/18] flex flex-col justify-between overflow-hidden ring-12 ring-slate-950/40 select-none">
                    
                    {/* Barra d'estat superior, altaveu i càmera selfie simulada */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-slate-950 rounded-full flex justify-between items-center px-4.5 z-40 border border-slate-900/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                      <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
                      <div className="text-[7.5px] text-slate-500 font-mono font-bold">100%</div>
                    </div>

                    {/* INTERIOR DE LA PANTALLA EN COMPROMÍS PROFESSIONAL */}
                    <div className="flex-1 bg-[#011c38] rounded-[38px] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans border border-blue-900/10">
                      
                      {/* CAPTURA 0: TEST DE BIODATA (RESULTATS DINÀMICS I RESTRICCIONS COHERENTS) */}
                      {capturaPsicoActiva === 0 && (
                        <div className="w-full h-full relative flex flex-col justify-between animate-fadeIn p-3 pt-7 overflow-y-auto select-none">
                          {/* Explicació per a no-programadors:
                              Aquesta secció de dalt simula el logotip i la capçalera exacta de l'aplicació d'OposiCAT en format mòbil,
                              mantenint un filet vermell de disseny de sota. */}
                          <div className="flex flex-col items-center">
                            {/* Logo OposiMossos clònic de l'app de mòbil */}
                            <div className="w-20 py-1 bg-[#0c2440]/85 rounded-full border border-white/5 flex items-center justify-center gap-1 mt-1 text-[8px] font-black uppercase tracking-wider">
                              <span className="text-white">Oposi</span>
                              <span className="text-red-500 italic">Mossos</span>
                            </div>

                            <h4 className="text-[12px] font-black uppercase tracking-widest text-center text-white mt-3">
                              PROVA PSICOLÒGICA
                            </h4>
                            <div className="h-[1.5px] bg-red-650 w-6 my-1" />
                            <span className="text-[7px] text-slate-400 font-extrabold tracking-[0.2em] uppercase">
                              GUIA BIODATA
                            </span>
                          </div>

                          {/* Diagnòstic final de l'estudiant */}
                          <div className="mt-2.5 text-center">
                            <span className="text-[8px] text-[#00f296] font-black uppercase tracking-widest italic block">
                              ★ DIAGNÒSTIC FINAL
                            </span>
                            <h5 className="text-[9.5px] font-black italic uppercase text-white tracking-wide mt-0.5">
                              RESULTATS DEL TEST DE BIODATA
                            </h5>
                            <div className="h-[1px] bg-[#00f296]/20 w-8 mx-auto mt-1" />
                          </div>

                          {/* Avís ambre de resultats d'exemple orientatius, de color de lletra molt cuidat */}
                          <div className="mt-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl p-2 text-center">
                            <span className="text-[7.5px] font-black uppercase tracking-wide block mb-0.5">
                              ⚠️ RESULTAT DE PROVA FICTICI / EXEMPLE
                            </span>
                            <p className="text-[7px] italic leading-tight text-white/50">
                              Estàs visualitzant un resum d'avaluació d'exemple orientatiu. Completa el teu test per visualitzar les teves mètriques competencials personalitzades.
                            </p>
                          </div>

                          {/* Llista vertical interactiva de competències d'ISPC en format minimalista mòbil */}
                          <div className="flex flex-col gap-2 mt-3 mb-2">
                            {[
                              { nom: "Adaptabilitat", nota: 8, color: "text-emerald-400", bar: "bg-emerald-400" },
                              { nom: "Autocontrol", nota: 6, color: "text-amber-400", bar: "bg-amber-400" },
                              { nom: "Treball en equip", nota: 9, color: "text-emerald-400", bar: "bg-emerald-400" },
                              { nom: "Habilitats de comunicació", nota: 7, color: "text-emerald-400", bar: "bg-emerald-400" }
                            ].map((c, i) => (
                              <div key={i} className="bg-[#1a3a5a]/20 border border-white/5 rounded-lg p-2 flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8.5px] font-extrabold text-white/90 italic">{i + 1}. {c.nom}</span>
                                  <div className="flex items-baseline gap-0.5 text-[8.5px] font-mono font-black">
                                    <span className={c.color}>{c.nota}</span>
                                    <span className="text-white/30 text-[6.5px]">/10</span>
                                  </div>
                                </div>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${c.nota * 10}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CAPTURA 1: PREGUNTES DE L'ENTREVISTA PSICOLÒGICA */}
                      {capturaPsicoActiva === 1 && (
                        <div className="w-full h-full relative flex flex-col justify-between animate-fadeIn p-3 pt-7 overflow-y-auto select-none">
                          {/* Explicació per a no-programadors:
                              En aquesta segona vista recreem l'apartat de preguntes de l'entrevista dels psicòlegs oficials.
                              El mòbil mostra una llista on els desplegables responen en viu en ser clicats. */}
                          <div className="flex flex-col items-center">
                            <div className="w-full flex items-center justify-between px-1">
                              <button className="text-[10px] text-slate-400 hover:text-white font-bold cursor-pointer">◀</button>
                              <div className="w-20 py-1 bg-[#0c2440]/80 rounded-full border border-white/5 flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-wider">
                                <span className="text-white">Oposi</span>
                                <span className="text-red-500 italic">Mossos</span>
                              </div>
                            </div>

                            <h4 className="text-[12px] font-black uppercase tracking-widest text-center text-white mt-3">
                              PROVA PSICOLÒGICA
                            </h4>
                            <div className="h-[1.5px] bg-red-650 w-6 my-1" />
                            <span className="text-[7px] text-[#00f296] font-extrabold tracking-[0.2em] uppercase">
                              PROVA - ENTREVISTA
                            </span>
                          </div>

                          {/* Targeta interior blava explicativa */}
                          <div className="mt-3 bg-[#113254]/30 border border-blue-900/30 rounded-xl p-2.5 text-center flex flex-col items-center gap-1.5 animate-pulse">
                            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-[9px]">
                              💬
                            </div>
                            <p className="text-slate-205 text-[8.5px] font-medium leading-relaxed italic px-1">
                              "Llistat de preguntes que múltiples psicòlegs de forma oficial han avaluat durant anys a les entrevistes de la fase d'oposició"
                            </p>
                            <span className="text-[7px] text-[#00f296] font-black uppercase tracking-wider block mt-1">
                              SELECCIONS UNA CATEGORIA PER VEURE LES PREGUNTES
                            </span>
                          </div>

                          {/* Llista interactiva de categories desplegables d'acordió d'oposició */}
                          <div className="flex flex-col gap-1.5 mt-3 mb-2">
                            {[
                              "PREGUNTES INICIALS",
                              "FORMACIÓ",
                              "EXPERIÈNCIA LABORAL",
                              "PREGUNTES PERSONALS"
                            ].map((cat, idx) => {
                              const obert = categoriaPreguntaOberta === idx;
                              return (
                                <div key={idx} className="flex flex-col border border-white/5 rounded-xl overflow-hidden transition-all">
                                  <button 
                                    onClick={() => setCategoriaPreguntaOberta(obert ? null : idx)}
                                    className={`w-full p-2 px-3 text-left flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider italic transition-all cursor-pointer ${
                                      obert ? "bg-[#113254] text-[#00f296]" : "bg-[#1a3a5a]/20 text-white/80 hover:bg-[#1a3a5a]/45"
                                    }`}
                                  >
                                    <span>{cat}</span>
                                    <span className="text-[8px] opacity-70">{obert ? "▲" : "▼"}</span>
                                  </button>
                                  
                                  {obert && (
                                    <div className="bg-[#0b213b]/65 p-2.5 text-[8.5px] italic leading-relaxed text-slate-300 font-semibold border-t border-white/5">
                                      {idx === 0 && "• Quina és la teva motivació principal per ser Mosso d'Esquadra de Catalunya? Quins són els valors claus?"}
                                      {idx === 1 && "• Creus que el teu bagatge educatiu i de formació formal encaixa amb els camps que treballa la policia?"}
                                      {idx === 2 && "• Explica alguna situació laboral en la que vas haver de gestionar un conflicte directe en equip de treball."}
                                      {idx === 3 && "• Digues tres defectes i tres virtuts de la teva personalitat relacionades amb el servei públic."}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* CAPTURA 2: DEMANA CITA AMB ELS PSICÒLEGS */}
                      {capturaPsicoActiva === 2 && (
                        <div className="w-full h-full relative flex flex-col justify-between animate-fadeIn p-3 pt-7 overflow-y-auto select-none">
                          {/* Explicació per a no-programadors:
                              En aquesta tercera vista col·loquem el formulari interactiu de Demana Cita - Psicòlegs.
                              Dóna un dinamisme absolut permetent escollir hores o canviar de matí a tarda. */}
                          <div className="flex flex-col items-center">
                            <h4 className="text-[12px] font-black uppercase tracking-widest text-center text-white mt-1">
                              PROVA PSICOLÒGICA
                            </h4>
                            <div className="h-[1.5px] bg-red-650 w-6 my-1" />
                            <span className="text-[7px] text-[#FFDF00] font-black tracking-[0.2em] uppercase">
                              DEMANA CITA - PSICÒLEGS
                            </span>
                          </div>

                          {/* Card informativa general de dades */}
                          <div className="mt-2.5 bg-[#1a3a5a]/20 border border-white/5 rounded-xl p-2.5 text-left">
                            <p className="text-white/85 text-[8.5px] leading-relaxed italic">
                              Per poder-te donar una experiència personalitzada ( com en l' <span className="text-yellow-500 font-extrabold">entrevista oficial</span> ) et recomane fer el <span className="text-fuchsia-400 font-extrabold">TEST BIODATA</span> per tal de que els nostres psicolegs tinguin el teu perfil psicoprofesional i et facin una <span className="text-yellow-550 font-extrabold">sesió personalitzada</span> i no generica.
                            </p>
                          </div>

                          {/* Botó del Test de Biodata d'inducció */}
                          <button className="w-full mt-2 border border-slate-700/60 bg-slate-900/60 text-slate-300 rounded-lg py-1.5 text-center text-[8.5px] font-black uppercase tracking-widest hover:text-white cursor-pointer active:scale-95 transition-all">
                            🧠 FER EL TEST DE BIODATA
                          </button>

                          {/* Formulari d'elecció de cita de simulacre */}
                          <div className="mt-3 bg-[#0a1f38] border border-white/5 rounded-xl p-3 flex flex-col gap-2.5">
                            <div className="flex items-center justify-between text-[8px]">
                              <div className="flex flex-col text-left">
                                <span className="text-white/45 font-bold uppercase tracking-wider">DIA SELECCIONAT</span>
                                <span className="text-white font-extrabold italic text-[9.5px]">DIVENDRES, 12 DE JUNY</span>
                              </div>
                              <button className="text-[#00f296] hover:underline font-black cursor-pointer">CANVIAR DIA</button>
                            </div>

                            <div className="h-[1px] bg-white/5" />

                            {/* Elecció de torns (Matí / Tarda) */}
                            <div className="grid grid-cols-2 gap-1.5 text-center">
                              <button 
                                onClick={() => setCitaTornSeleccionat('mati')}
                                className={`py-1 rounded-lg text-center text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  citaTornSeleccionat === 'mati' 
                                    ? "bg-[#00f296] text-slate-950 font-black" 
                                    : "bg-slate-950/20 text-slate-400 border border-white/5"
                                }`}
                              >
                                MATÍ
                              </button>
                              <button 
                                onClick={() => setCitaTornSeleccionat('tarda')}
                                className={`py-1 rounded-lg text-center text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  citaTornSeleccionat === 'tarda' 
                                    ? "bg-[#00f296] text-slate-950 font-black" 
                                    : "bg-slate-950/20 text-slate-400 border border-white/5"
                                }`}
                              >
                                TARDA
                              </button>
                            </div>

                            {/* Llista d'hores seleccionables */}
                            <div className="grid grid-cols-3 gap-1 mt-1 text-center">
                              {(citaTornSeleccionat === 'mati' ? ['09:00', '10:00', '11:00', '12:00', '13:00'] : ['16:00', '17:00', '18:00', '19:00', '20:00']).map((hora) => {
                                const seleccionada = citaHoraSeleccionada === hora;
                                return (
                                  <button 
                                    key={hora}
                                    onClick={() => setCitaHoraSeleccionada(hora)}
                                    className={`py-1.5 rounded-md text-[8.5px] font-mono leading-none flex items-center justify-center transition-all cursor-pointer ${
                                      seleccionada 
                                        ? "bg-[#00f296]/20 border border-[#00f296] text-[#00f296] font-black" 
                                        : "bg-[#11233d]/40 border border-white/5 text-slate-300 hover:border-white/15"
                                    }`}
                                  >
                                    {hora}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Botó de reserva gran i cridador d'atenció, de color verd vibrant */}
                            <button className="w-full mt-1.5 bg-[#00f296] hover:bg-[#00d783] active:scale-95 text-slate-950 font-black uppercase tracking-widest text-[9.5px] py-2.5 rounded-lg text-center transition-all cursor-pointer shadow-lg shadow-emerald-950/20">
                              RESERVAR ARA
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Enllaç/engranatge inferior de la maqueta mòbil */}
                      <div className="flex justify-between items-center text-slate-600 text-[8px] p-2 pt-1 border-t border-[#042447] bg-[#000f21]/40">
                        <span className="uppercase font-bold tracking-widest pl-1">OPOSIMOSSOS CAMPUS</span>
                        <div className="w-4 h-4 rounded-full bg-slate-950/80 flex items-center justify-center text-[7px] text-slate-550 font-bold">
                          ⚙
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              </div>

            </div>

            {/* FLETXA DRETA DIRECTA DEL DISSENY */}
            <button 
              onClick={() => setCapturaPsicoActiva((prev) => (prev === 2 ? 0 : prev + 1))}
              className="bg-slate-950/60 border border-slate-850 hover:border-blue-500/45 text-slate-400 hover:text-white w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 text-base md:text-lg font-black shrink-0"
              title="Següent"
            >
              ▶
            </button>

          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* 5. SECCIÓ DE PREUS I PLANS (#preus-i-plans) */}
      {/* Explicació per a no-programadors:
          Aquesta és la secció de tarifes i subscripcions des de la qual l'opositor pot triar
          el pla de pagament (Mensual, Trimestral o Anual). S'ha reanomenat l'ID de forma coherent. */}
      {/* ========================================== */}
      <section id="preus-i-plans" className="py-20 bg-[#021329] border-t border-slate-900/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black italic uppercase tracking-widest text-[#FFDF00]">Inversió de futur</span>
            <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white">Tarifes transparents i assequibles</h3>
            <p className="text-slate-400 text-xs">
              Sense matrícules ni compromisos ocults. Tria com formar-te d'acord amb les teves necessitats.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            <div className="border border-slate-900 bg-[#010c1c]/40 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-800 transition-all">
              <div className="space-y-4">
                <span className="text-[9px] bg-slate-800 text-slate-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">Iniciació</span>
                <h4 className="text-lg font-black italic uppercase text-white">Mensual Bàsic</h4>
                <div className="text-3xl font-black italic text-white">€29<span className="text-xs text-slate-500 font-bold uppercase">/mes</span></div>
                <p className="text-xs text-slate-400">Perfecte per polir detalls i agafar ritme de l'oposició.</p>
                <ul className="text-xs text-slate-500 space-y-2.5 pt-4">
                  <li className="flex items-center gap-2">✓ Temari oficial dels 3 àmbits</li>
                  <li className="flex items-center gap-2">✓ Creació de tests lliures</li>
                  <li className="flex items-center gap-2">✓ Control de progrés de lectura</li>
                  <li className="flex items-center gap-2 text-slate-600">✗ Accés a classes en directe</li>
                </ul>
              </div>
              <button onClick={onEntrarWorkspace} className="w-full mt-8 bg-slate-900 hover:bg-slate-850 text-white text-xs font-black italic uppercase py-3.5 rounded-xl transition-all cursor-pointer">
                Començar de franc
              </button>
            </div>

            <div className="border border-blue-600 bg-blue-950/20 rounded-3xl p-8 flex flex-col justify-between relative shadow-xl shadow-blue-600/5 hover:-translate-y-1 transition-all">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#FFDF00] text-[#021329] text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                El Més Recomanat
              </div>
              <div className="space-y-4">
                <span className="text-[9px] bg-blue-500/20 text-blue-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">Recomanat</span>
                <h4 className="text-lg font-black italic uppercase text-white">Trimestral Premium</h4>
                <div className="text-3xl font-black italic text-[#FFDF00]">€75<span className="text-xs text-slate-500 font-bold uppercase">/ 3 mesos</span></div>
                <p className="text-xs text-slate-400">La preparació en línia completa per excel·lir i treure màxima nota.</p>
                <ul className="text-xs text-slate-300 space-y-2.5 pt-4">
                  <li className="flex items-center gap-2"><span className="text-[#FFDF00]">✓</span> Tots els avantatges bàsics</li>
                  <li className="flex items-center gap-2"><span className="text-[#FFDF00]">✓</span> Accés a la Classe Premium de Luna</li>
                  <li className="flex items-center gap-2"><span className="text-[#FFDF00]">✓</span> Simulador d’exàmens històrics d’altres anys</li>
                  <li className="flex items-center gap-2"><span className="text-[#FFDF00]">✓</span> Classes en directe sincronitzades</li>
                </ul>
              </div>
              <button onClick={onEntrarWorkspace} className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black italic uppercase py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer">
                Inscriure'm ara
              </button>
            </div>

            <div className="border border-slate-900 bg-[#010c1c]/40 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-800 transition-all col-md-span-2 lg:col-span-1">
              <div className="space-y-4">
                <span className="text-[9px] bg-slate-800 text-slate-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">Professional</span>
                <h4 className="text-lg font-black italic uppercase text-white">Anual Elit</h4>
                <div className="text-3xl font-black italic text-white">€199<span className="text-xs text-slate-500 font-bold uppercase">/any</span></div>
                <p className="text-xs text-slate-400">Assegura l'estudi a llarg termini per tenir la plaça garantida.</p>
                <ul className="text-xs text-slate-500 space-y-2.5 pt-4">
                  <li className="flex items-center gap-2">✓ Suport docent directe per xat o mail</li>
                  <li className="flex items-center gap-2">✓ Actualitzacions de temari de franc</li>
                  <li className="flex items-center gap-2">✓ Correcció ràpida de proves de físiques</li>
                  <li className="flex items-center gap-2">✓ Prova Psicològica i qüestionari</li>
                </ul>
              </div>
              <button onClick={onEntrarWorkspace} className="w-full mt-8 bg-slate-900 hover:bg-slate-850 text-white text-xs font-black italic uppercase py-3.5 rounded-xl transition-all cursor-pointer">
                Començar ara
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FORMULARI FINAL DE SEGUEIXA DE NOTÍCIES / LANDING NEWSLETTER */}
      <section className="bg-slate-950 py-16 border-t border-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-3">
            <h3 className="text-xl md:text-2xl font-black italic uppercase text-white">Tens dubtes sobre les fases de l'oposició?</h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Deixa'ns el teu correu electrònic oficial i rebràs una guia en PDF escrita per ex-membres dels Mossos d'Esquadra que ja tenen la plaça i formen part del nostre tribunal simulador.
            </p>
          </div>

          <form onSubmit={enviarFormulari} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
            <input
              type="email"
              required
              value={correu}
              onChange={(e) => setCorreu(e.target.value)}
              placeholder="Exemple: elteucorreu@gmail.com"
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 outline-none text-xs text-white px-5 py-4 rounded-xl transition-all font-semibold"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black italic uppercase tracking-wider py-4 px-6 rounded-xl transition-all cursor-pointer"
            >
              Rebre Guia PDF de franc
            </button>
          </form>

          {formulariEnviat && (
            <p className="text-xs text-emerald-400 font-bold italic uppercase tracking-wider animate-pulse">
              ✓ Moltes gràcies! Rebràs el contingut i guies al correu indicat d'aquí a uns minuts.
            </p>
          )}
        </div>
      </section>

      {/* 6. PEU DE PÀGINA (FOOTER) PROFESIONAL */}
      <footer className="bg-slate-950/90 border-t border-slate-900/60 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
            © {new Date().getFullYear()} OposiCAT • Tots els drets reservats. Acadèmia de Preparació OposiMossos.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase text-slate-500">
            <a href="#" className="hover:text-slate-300">Avís Legal</a>
            <a href="#" className="hover:text-slate-300">Privacitat (RGPD)</a>
            <a href="#" className="text-blue-500/80 hover:text-blue-400 cursor-pointer" onClick={onEntrarBackoffice}>Accés Administrador</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
