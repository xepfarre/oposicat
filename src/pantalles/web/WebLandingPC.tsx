import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

// Explicació per a no-programadors: Importem les imatges del mòbil i de fons que usarem a les fases
// @ts-ignore
import fonsTeorica from '../../assets/images/Teorica.png';
// @ts-ignore
import fonsFisica from '../../assets/images/fons_fisica_1780343173628.png';
// @ts-ignore
import fonsPsicologica from '../../assets/images/fons_psicologica_1780343193032.png';
// @ts-ignore
import fonsIspc from '../../assets/images/ISPC.jpg';

// @ts-ignore
import t1Image from '../../assets/images/T-1.png';
// @ts-ignore
import t2Image from '../../assets/images/T-2.png';
// @ts-ignore
import t3Image from '../../assets/images/T-3.png';
// @ts-ignore
import t4Image from '../../assets/images/T-4.png';

// Explicació per a no-programadors: Importem les imatges de fons personalitzades dels Mossos i dels Bombers
// per crear el fons dual ambiental del mòdul final de registre (Call to Action).
// @ts-ignore
import fonsMossosRegistre from '../../assets/images/mossos_cotxe.png';
// @ts-ignore
import fonsBombersRegistre from '../../assets/images/bombers_camio.png';

interface PropsWebLanding {
  onEntrarWorkspace: () => void;
  onEntrarBackoffice: () => void;
  onSimularEntrarMovil: () => void;
  onAnarMossos?: () => void;
}

export default function WebLandingPC({ 
  onEntrarWorkspace, 
  onEntrarBackoffice, 
  onSimularEntrarMovil,
  onAnarMossos
}: PropsWebLanding) {
  
  const navigate = useNavigate();

  // Controls de fase per visualitzar les proves teòriques, físiques o psicològiques de manera interactiva
  const [faseActiva, setFaseActiva] = useState<'teorica' | 'fisica' | 'psicologica' | 'entrevista'>('teorica');

  // Explicació per a no-programadors: Aquest estat desa l'oposició que escull l'alumne al selector elegant de la capçalera. Comença de manera predeterminada a 'quisom' per rebre'l amb calidesa didàctica.
  const [oposicioSeleccionada, setOposicioSeleccionada] = useState<string>('quisom');

  // Explicació per a no-programadors:
  // Aquests dos nous estats donen vida a la seqüència de llums interactiva que simula les sirenes d'emergència.
  // 'pasSirena' controla de manera molt unificada i cronològica cadascun dels segons d'espera, enceses i aturades.
  // 'hoveredBoto' desa quina oposició s'està explorant manualment amb el punter del ratolí per pausar l'automatisme.
  const CICLE_SIRENES = [
    'espera_inicial_1', 'espera_inicial_2', 'espera_inicial_3', // Esperar 3 segons en entrar per primer cop
    'mossos_1', 'mossos_2',                                     // Mossos d'Esquadra encesos (2 segons de seqüència)
    'pausa_despres_mossos',                                     // Esperar 1 segon després d'acabar mossos
    'bombers_1', 'bombers_2',                                   // Bombers de Catalunya actius (2 segons de seqüència)
    'pausa_despres_bombers',                                    // Esperar 1 segon després de bombers
    'rurals_1', 'rurals_2',                                     // Agents Rurals actius (2 segons de seqüència)
    'pausa_despres_rurals',                                     // Esperar 1 segon després d'agents rurals
    'proteccio_1', 'proteccio_2',                               // Protecció Civil actiu (2 segons de seqüència)
    'pausa_final_1', 'pausa_final_2', 'pausa_final_3', 'pausa_final_4', 'pausa_final_5' // Esperar 5 segons abans de reiniciar
  ];
  const [pasSirena, setPasSirena] = useState<string>('espera_inicial_1');
  const [hoveredBoto, setHoveredBoto] = useState<string | null>(null);

  useEffect(() => {
    // Si l'usuari fa hover manualment sobre qualsevol dels botons de la seqüència, la seqüència es pausa a l'acte
    if (hoveredBoto !== null) return;

    const interval = setInterval(() => {
      setPasSirena((actual) => {
        const index = CICLE_SIRENES.indexOf(actual);
        if (index === -1) return 'espera_inicial_1';

        // Si hem completat el període d'espera final de 5 segons ('pausa_final_5'),
        // reiniciem directament des de la primera oposició ('mossos_1') per saltar l'espera inicial de 3 segons (que només és al d'inici).
        if (actual === 'pausa_final_5') {
          return 'mossos_1';
        }

        const seguentIndex = index + 1;
        return CICLE_SIRENES[seguentIndex] || 'mossos_1';
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hoveredBoto]);

  // Explicació per a no-programadors:
  // Funció auxiliar per calcular exactament quin color correspon a cada botó d'oposició en cada instant de la seqüència.
  // Es defineixen els colors oficials alternants (sirenes de policia, bombers, rurals i protecció civil) o el disseny fosc en repòs.
  const obtenirEstilBotoSirena = (clau: string) => {
    const actiuIAdient = hoveredBoto === null;
    const isHovered = hoveredBoto === clau;

    // Disseny funcional per defecte (Estil de descans / Inactiu)
    let backgroundColor = '#0a1424';
    let textColor = '#94a3b8';
    let borderColor = '#1e293b';

    if (clau === 'mossos') {
      if (isHovered) {
        backgroundColor = '#0055a5';
        textColor = '#ffffff';
        borderColor = '#0055a5';
      } else if (actiuIAdient && pasSirena === 'mossos_1') {
        backgroundColor = '#0055a5';
        textColor = '#ffffff';
        borderColor = '#0055a5';
      } else if (actiuIAdient && pasSirena === 'mossos_2') {
        backgroundColor = '#e10613';
        textColor = '#ffffff';
        borderColor = '#e10613';
      }
    } else if (clau === 'bombers') {
      if (isHovered) {
        backgroundColor = '#d9381e';
        textColor = '#ffffff';
        borderColor = '#d9381e';
      } else if (actiuIAdient && pasSirena === 'bombers_1') {
        backgroundColor = '#d9381e';
        textColor = '#ffffff';
        borderColor = '#d9381e';
      } else if (actiuIAdient && pasSirena === 'bombers_2') {
        backgroundColor = '#ff7900';
        textColor = '#ffffff';
        borderColor = '#ff7900';
      }
    } else if (clau === 'rurals') {
      if (isHovered) {
        backgroundColor = '#1b4d3e';
        textColor = '#ffffff';
        borderColor = '#1b4d3e';
      } else if (actiuIAdient && pasSirena === 'rurals_1') {
        backgroundColor = '#1b4d3e';
        textColor = '#ffffff';
        borderColor = '#1b4d3e';
      } else if (actiuIAdient && pasSirena === 'rurals_2') {
        backgroundColor = '#ffffff';
        textColor = '#020b16';
        borderColor = '#ffffff';
      }
    } else if (clau === 'proteccio') {
      if (isHovered) {
        backgroundColor = '#ffcc00';
        textColor = '#020b16';
        borderColor = '#ffcc00';
      } else if (actiuIAdient && pasSirena === 'proteccio_1') {
        backgroundColor = '#ffcc00';
        textColor = '#020b16';
        borderColor = '#ffcc00';
      } else if (actiuIAdient && pasSirena === 'proteccio_2') {
        backgroundColor = '#ff6600';
        textColor = '#ffffff';
        borderColor = '#ff6600';
      }
    }

    return {
      backgroundColor,
      color: textColor,
      borderColor,
      transition: 'all 0.25s ease-in-out',
    };
  };

  // Llista d'esdeveniments o característiques explicatives d'OposiMossos per a no-programadors
  const carruselFons = {
    teorica: fonsTeorica,
    fisica: fonsFisica,
    psicologica: fonsPsicologica,
    entrevista: fonsPsicologica
  };

  // Comentari per a no-programadors:
  // Retornem la Landing corporativa original d'OposiMossos completament reconstituïda,
  // amb les seves targetes, efectes Hover, fons de pantalles, i les proves de l'examen detallades de manera colossal.
  return (
    <div className="bg-[#020b16] text-slate-100 min-h-screen font-sans selection:bg-blue-600 selection:text-white transition-colors duration-500 overflow-x-hidden">
      
      {/* 1. SECCIÓ: CAPÇALERA / HEADER CORPORATIU REDISSENYAT */}
      {/* Explicació per a no-programadors:
          Aquesta és la capçalera d'alta definició fixada a dalt ("sticky") per a un accés immediat en fer scroll vertical.
          Utilitza el color blau profund oficial #050b14 amb un subtil difuminat de rerefons i disseny justificat. */}
      <header 
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#050b14ef', // Color blau fosc profund corporatiu sota les directrius d'OposiCAT
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #111e36',
          boxSizing: 'border-box',
          width: '100%',
          padding: '14px 24px', // Marges i farcits amplis dels costats perquè respiri l'escriptori
        }}
      >
        <div 
          style={{
            maxWidth: '80rem', // Equival a max-w-7xl de Tailwind (1280px d'amplada màxima)
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', // Flexbox d'estil línia recta de punta a punta per separar els blocs al màxim
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative' // Explicació per a no-programadors: Establim la posició relativa per poder col·locar el bloc central exactament al mig
          }}
        >
          
          {/* BLOC ESQUERRA (Ancoratge i Filtre General) */}
          {/* Explicació per a no-programadors: 
              Enllacem el logotip d'OposicionsCatalunya de la manera més esquerra possible eliminant elements d'empenta. */}
          <div style={{ display: 'flex', alignItems: 'center', zIndex: 10 }}>
            {/* Logo d'OposicionsCatalunya amb colors de la bandera */}
            <span 
              style={{ 
                fontSize: '22px', 
                fontWeight: '900', // Altament ressaltat (font-black)
                fontStyle: 'italic', // Text cursiva professional
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                color: '#ffffff',
                userSelect: 'none'
              }}
            >
              OPOSICIONS{" "}
              <span style={{ fontStyle: 'italic' }}>
                <span style={{ color: '#FFDF00' }}>C</span>
                <span style={{ color: '#e10613' }}>A</span>
                <span style={{ color: '#FFDF00' }}>T</span>
                <span style={{ color: '#e10613' }}>A</span>
                <span style={{ color: '#FFDF00' }}>L</span>
                <span style={{ color: '#e10613' }}>U</span>
                <span style={{ color: '#FFDF00' }}>N</span>
                <span style={{ color: '#e10613' }}>Y</span>
                <span style={{ color: '#FFDF00' }}>A</span>
              </span>
            </span>
          </div>

          {/* BLOC CENTRAL (Missatge d'Acció centrat al mig de la pantalla de manera absoluta) */}
          {/* Explicació per a no-programadors:
              Mostrem el text d'explicació completament centrat a la pantalla de forma absoluta per evitar empentes d'amplada. 
              Posem pointer-events a 'none' perquè no interactuï amb el ratolí si passa per sobre. */}
          <div 
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '11px',
              fontWeight: '850',
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
              color: '#FFDF00', // El groc elèctric d'OposiCAT
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              userSelect: 'none',
              pointerEvents: 'none',
              textAlign: 'center',
              zIndex: 5
            }}
            className="hidden lg:block animate-pulse font-sans tracking-widest text-[#FFDF00] whitespace-nowrap"
          >
            Selecciona una oposició per veure totes les opcions.
          </div>

          {/* BLOC DRETA (Navegació i Acció de Conversió) */}
          {/* Explicació per a no-programadors: Enllaços minimalistes de navegació d'alta definició i acció d'embullo de l'edició del Campus. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            
            {/* Enllaços de Navegació Minimalistes Dinàmics */}
            {/* Explicació per a no-programadors:
                Si l'oposició canvia, mostrem de manera neta els 4 enllaços corporatius directes sobre fases d'Estudi d'OposiCAT. */}
            {oposicioSeleccionada !== 'quisom' && (
              <nav className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => {
                    setFaseActiva('teorica');
                    document.getElementById('proves')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}
                  className="text-slate-400 hover:text-[#FFDF00] transition-colors"
                >
                  PROVA TEÒRICA
                </button>
                <button 
                  onClick={() => {
                    setFaseActiva('fisica');
                    document.getElementById('proves')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}
                  className="text-slate-400 hover:text-[#FFDF00] transition-colors"
                >
                  PROVA PRÀCTICA
                </button>
                <button 
                  onClick={() => {
                    setFaseActiva('psicologica');
                    document.getElementById('proves')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}
                  className="text-slate-400 hover:text-[#FFDF00] transition-colors"
                >
                  PROVA PSICOPROFESSIONAL
                </button>
                <button 
                  onClick={() => {
                    setFaseActiva('entrevista');
                    document.getElementById('proves')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}
                  className="text-slate-400 hover:text-[#FFDF00] transition-colors"
                >
                  EXTRES
                </button>
              </nav>
            )}

            {/* Botó de Conversió Principal: Accés Premium al Campus Virtual */}
            {/* Explicació per a no-programadors: Aquest botó és el cor de la conversió. Té un gradient espectacular del blau a verd fosc, textura suau 3D i un micro-efecte selectiu de canvi de tamany ("active:scale-95"). */}
            <button
              onClick={onEntrarWorkspace}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                color: '#ffffff',
                backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #065f46 100%)', // Degradat espectacular de blau a verd fosc
                boxShadow: '0 4px 14px 0 rgba(29, 78, 216, 0.35)',
              }}
              className="hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              CAMPUS VIRTUAL 💻
            </button>
          </div>

        </div>
      </header>

      {/* Explicació per a no-programadors:
          Aquesta és la nova barra d'oposicions unificada situada immediatament a sota del header.
          Està formada per 4 blocs que estan completament "pegats" els uns amb els altres (reixeta de 4 columnes sense espais: gap-0).
          A dalt de tot de cada bloc hi ha el botó interactiu amb la seqüència de colors animada del cos (sirenes), i a sota la tira d'estat:
          "Comencem!" de color verd per a Mossos d'Esquadra, i "Pròximament" amb un cadenat per a Bombers de Catalunya, Agents Rurals i Protecció Civil. */}
      <div id="barra-sirenes-superior" className="w-full bg-[#050b14] border-b border-[#111e36] relative z-40 select-none">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 max-w-full mx-auto">
          
          {/* Bloc 1: Mossos d'Esquadra */}
          <div className="flex flex-col border-r border-[#111e36] md:border-r-0 lg:border-r">
            <button
              onMouseEnter={() => setHoveredBoto('mossos')}
              onMouseLeave={() => setHoveredBoto(null)}
              onClick={() => {
                setOposicioSeleccionada('mossos');
                if (onAnarMossos) {
                  onAnarMossos();
                } else {
                  navigate('/mossos');
                }
              }}
              style={obtenirEstilBotoSirena('mossos')}
              className="px-4 py-4 font-black text-xs md:text-sm uppercase tracking-wider cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2 select-none min-h-[58px]"
            >
              👮 Mossos d'Esquadra
            </button>
            <div className="bg-[#10b981]/10 text-[#10b981] py-1.5 text-center font-black text-[10px] sm:text-xs uppercase tracking-widest border-t border-[#111e36]">
              ● Comencem!
            </div>
          </div>

          {/* Bloc 2: Bombers de Catalunya */}
          <div className="flex flex-col border-r border-[#111e36]">
            <button
              onMouseEnter={() => setHoveredBoto('bombers')}
              onMouseLeave={() => setHoveredBoto(null)}
              onClick={() => {
                setOposicioSeleccionada('bombers');
                navigate('/bombers');
              }}
              style={obtenirEstilBotoSirena('bombers')}
              className="px-4 py-4 font-black text-xs md:text-sm uppercase tracking-wider cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2 select-none min-h-[58px]"
            >
              🚒 Bombers de Catalunya
            </button>
            <div className="bg-[#0f172a]/60 text-slate-500 py-1.5 text-center font-bold text-[10px] sm:text-xs uppercase tracking-widest border-t border-[#111e36] flex items-center justify-center gap-1">
              <span>🔒</span> Pròximament
            </div>
          </div>

          {/* Bloc 3: Agents Rurals */}
          <div className="flex flex-col border-r border-[#111e36] md:border-r-0 lg:border-r">
            <button
              onMouseEnter={() => setHoveredBoto('rurals')}
              onMouseLeave={() => setHoveredBoto(null)}
              onClick={() => {
                setOposicioSeleccionada('rurals');
                navigate('/agents-rurals');
              }}
              style={obtenirEstilBotoSirena('rurals')}
              className="px-4 py-4 font-black text-xs md:text-sm uppercase tracking-wider cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2 select-none min-h-[58px]"
            >
              🌲 Agents Rurals
            </button>
            <div className="bg-[#0f172a]/60 text-slate-500 py-1.5 text-center font-bold text-[10px] sm:text-xs uppercase tracking-widest border-t border-[#111e36] flex items-center justify-center gap-1">
              <span>🔒</span> Pròximament
            </div>
          </div>

          {/* Bloc 4: Protecció Civil */}
          <div className="flex flex-col">
            <button
              onMouseEnter={() => setHoveredBoto('proteccio')}
              onMouseLeave={() => setHoveredBoto(null)}
              onClick={() => {
                setOposicioSeleccionada('proteccio');
                navigate('/proteccio-civil');
              }}
              style={obtenirEstilBotoSirena('proteccio')}
              className="px-4 py-4 font-black text-xs md:text-sm uppercase tracking-wider cursor-pointer active:scale-95 text-center flex items-center justify-center gap-2 select-none min-h-[58px]"
            >
              🛡️ Protecció Civil
            </button>
            <div className="bg-[#0f172a]/60 text-slate-500 py-1.5 text-center font-bold text-[10px] sm:text-xs uppercase tracking-widest border-t border-[#111e36] flex items-center justify-center gap-1">
              <span>🔒</span> Pròximament
            </div>
          </div>

        </div>
      </div>

      {/* 2. SECCIÓ HERO - EL GRAN LLANÇAMENT DE PRESENTACIÓ DINÀMIC */}
      {/* Explicació per a no-programadors:
          Aquesta és la secció principal "Hero". Ara, de forma dinàmica, comprova si l'estudiant té seleccionat "Qui som?".
          Si és així, usarem el fons real de l'Acadèmia ISPC (ISPC.jpg) blindat amb un overlay fosc i difuminat professional natiu per millorar el contrast fins al 100%. */}
      <section 
        style={
          oposicioSeleccionada === 'quisom'
            ? {
                backgroundImage: `url(${fonsIspc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                overflow: 'hidden',
              }
            : {}
        }
        className={
          oposicioSeleccionada === 'quisom'
            ? "relative pt-24 pb-32 px-6"
            : "relative pt-24 pb-32 px-6 overflow-hidden bg-gradient-to-b from-[#020b16] to-[#01060e]"
        }
      >
        {/* Capa pseudo-element / protectora de fons per a Qui Som */}
        {/* Explicació per a no-programadors:
            Per garantir que els textos i icones es llegeixin a la perfecció sobre una foto real d'un campus molt il·luminat, 
            creem aquesta capa protectora absoluta amb color marí profund translúcid i desenfocament (backdrop-filter: blur(8px)). */}
        {oposicioSeleccionada === 'quisom' && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(3, 7, 18, 0.78)', // Color blau nit/negre molt fosc al 78% d'opacitat per equilibrar el contrast
              backdropFilter: 'blur(2px)', // Rebaixat radicalment a 2px perquè es reconegui nítidament l'edifici de l'escola de policia al darrere
              zIndex: 1,
            }}
          />
        )}

        {/* Contenidor central amb z-index alt per col·locar el text i els mosaic d'elements a dalt de tot de la capa de fons */}
        <div 
          style={{ zIndex: 10 }}
          className="max-w-7xl mx-auto text-center space-y-8 relative"
        >
          
          {oposicioSeleccionada === 'quisom' ? (
            <>
              {/* Explicació per a no-programadors:
                  Aquest és el títol d'impacte principal del bloc "Qui Som". 
                  L'hem actualitzat segons les teves instruccions per destacar el nom d'OposiCAT amb una gradació elegant de colors corporatius 
                  i hem col·locat a sota (en una segona línia de capçalera) la frase que recorda el nostre passat com a professionals del cos formats a l'ISPC. */}
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight text-white leading-tight max-w-5xl mx-auto flex flex-col gap-3">
                <span>
                  PREPARA'T L'OPOSICIÓ AMB{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-[#FFDF00] bg-clip-text text-transparent">
                    OPOSICAT
                  </span>
                </span>
                <span className="text-lg md:text-2xl font-bold tracking-normal text-slate-300 block normal-case font-sans">
                  Som professionals que ja hem passat per l'ISPC
                </span>
              </h1>

              <p className="text-slate-200 text-sm md:text-base max-w-4xl mx-auto leading-relaxed font-sans font-medium">
                Som una empresa especialitzada en la preparació integral d'oposicions de l'àmbit de la seguretat i les emergències a Catalunya. El nostre equip està format per professionals en actiu que ja hem passat per absolutament tots els processos selectius i per l'ISPC, des d'escoles de policia fins a bombers. Sabem exactament com es viu tot des de dins i volem guiar-te cap a la teva plaça. Per aconseguir-ho, hem desenvolupat software innovador d'última generació dissenyat exclusivament per potenciar la teva memòria, optimitzar el teu estudi i cobrir totes les fases de la teva oposició.
              </p>

              {/* Explicació per a no-programadors: Aquest component és un mosaic modern (reixeta auto-adaptable amb Grid i Flex lateral) formatejat amb 4 grans columnes de valor. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto pt-6 text-left">
                {/* Columna 1: Companys de l'escola */}
                <div 
                  style={{
                    backgroundColor: '#0a1424ef',
                    border: '1px solid rgba(16, 185, 129, 0.35)', // Vora molt subtil verda esmeralda
                  }}
                  className="p-5 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] duration-300 relative z-20"
                >
                  <div 
                    style={{ color: '#10b981' }} 
                    className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                  >
                    <span>✓</span> COMPANYS DE L'ESCOLA
                  </div>
                  <p className="text-[#94a3b8] text-[11.5px] leading-relaxed font-medium">
                    Som funcionaris que ja hem passat per l'ISPC i tots els processos. Sabem com aprovar des de dins.
                  </p>
                </div>

                {/* Columna 2: Totes les fases incloses */}
                <div 
                  style={{
                    backgroundColor: '#0a1424ef',
                    border: '1px solid rgba(255, 223, 0, 0.35)', // Vora molt subtil groga elèctrica
                  }}
                  className="p-5 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] duration-300 relative z-20"
                >
                  <div 
                    style={{ color: '#FFDF00' }} 
                    className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                  >
                    <span>✓</span> TOTES LES FASES INCLOSES
                  </div>
                  <p className="text-[#94a3b8] text-[11.5px] leading-relaxed font-medium">
                    Entrena de forma integral des del temari oficial i psicotècnics fins a les proves físiques i entrevista.
                  </p>
                </div>

                {/* Columna 3: Software propi innovador */}
                <div 
                  style={{
                    backgroundColor: '#0a1424ef',
                    border: '1px solid rgba(236, 72, 153, 0.35)', // Vora molt subtil rosa/magenta
                  }}
                  className="p-5 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] duration-300 relative z-20"
                >
                  <div 
                    style={{ color: '#ec4899' }} 
                    className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                  >
                    <span>✓</span> SOFTWARE PROPI INNOVADOR
                  </div>
                  <p className="text-[#94a3b8] text-[11.5px] leading-relaxed font-medium">
                    Desenvolupem les nostres pròpies eines digitals i campus per donar solució a cada problema d'estudi.
                  </p>
                </div>

                {/* Columna 4: Apps web i smartphone */}
                <div 
                  style={{
                    backgroundColor: '#0a1424ef',
                    border: '1px solid rgba(56, 189, 248, 0.35)', // Vora molt subtil blau cel
                  }}
                  className="p-5 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] duration-300 relative z-20"
                >
                  <div 
                    style={{ color: '#38bdf8' }} 
                    className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                  >
                    <span>✓</span> APPS WEB I SMARTPHONE
                  </div>
                  <p className="text-[#94a3b8] text-[11.5px] leading-relaxed font-medium">
                    Ecosistema multidispositiu total. Estudia sense barreres amb les nostres aplicacions integrals.
                  </p>
                </div>
              </div>

              {/* Explicació per a no-programadors: Hem eliminat els botons de mostra de plans i software per deixar una interfície més neta i enfocada purament en la selecció general. */}
            </>
          ) : (
            <>
              {/* Explicació per a no-programadors: Si hem estipulat una oposició, mostrem el disseny d'impacte superior adreçat a la plaça oficial */}
              <span className="inline-flex items-center gap-2 text-[9px] bg-yellow-500/10 border border-yellow-500/25 text-[#FFDF00] px-4 py-1.5 rounded-full uppercase font-black tracking-widest animate-pulse">
                👑 ACADÈMIA {oposicioSeleccionada === 'mossos' ? "MOSSOS D’ESQUADRA" : oposicioSeleccionada === 'bombers' ? "BOMBERS" : oposicioSeleccionada === 'rurals' ? "AGENTS RURALS" : "PROTECCIÓ CIVIL"} LÍDER
              </span>

              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight text-white leading-none max-w-4xl mx-auto">
                Aconsegueix la teva plaça a la <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-[#FFDF00] bg-clip-text text-transparent">Generalitat de Catalunya</span>
              </h1>

              <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Plataforma digital interactiva dissenyada específicament per a l'estudiant de {oposicioSeleccionada === 'mossos' ? "Mossos d'Esquadra" : oposicioSeleccionada === 'bombers' ? "Bombers de la Generalitat" : oposicioSeleccionada === 'rurals' ? "Agents Rurals" : "Protecció Civil"}. El temari oficial centralitzat, àrea d'estudi personalitzada i simulacres de dades 100% reals.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={onEntrarWorkspace}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FFDF00] hover:bg-yellow-400 text-slate-950 text-xs font-black italic uppercase tracking-wider shadow-xl shadow-yellow-500/10 transition-all cursor-pointer active:scale-95"
                >
                  Començar a Estudiar Gratuïtament
                </button>
                <a
                  href="#proves"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 text-white text-xs font-black italic uppercase tracking-wider border border-slate-800 transition-all text-center"
                >
                  Més informació sobre les fases
                </a>
              </div>
            </>
          )}

        </div>

        {/* Cèrcol brillant ambient al darrere de la Landing */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-[2]"></div>
      </section>

      {/* Explicació per a no-programadors:
          Aquesta és la secció reformada d'estadístiques de "qui-som" amb 7 micro-targetes molt compactes, fines i altament estilitzades.
          Cada targeta té cantonades arrodonides (rounded-xl), fons fosc translúcid, vora subtil amb el seu color corresponent, un padding minimalista i la xifra gran continguda (text-xl d'alta definició) per no sobrecarregar visualment. */}
      <section id="metode" className="py-14 border-t border-slate-900 bg-[#01060e]/90 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Explicació per a no-programadors:
              Inserim una capçalera de secció molt estilitzada per posar en context les dades de valor de l'ecosistema.
              Consta d'un text superior petit en format etiqueta d'un groc elèctric llampant d'OposiCAT (#FFDF00) amb les lletres ben separades,
              i un títol principal en blanc elegant i centrat per atreure l'interès del futur alumne amb un espaiat premium perquè tot respiri millor. */}
          <div className="text-center mb-8 md:mb-10">
            <span style={{ color: '#FFDF00' }} className="text-xs sm:text-sm font-bold tracking-widest uppercase block mb-2">
              L'ECOSISTEMA DIGITAL MÉS COMPLET
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Tot el que necessites per aconseguir la teva plaça
            </h3>
          </div>

          <div className="flex flex-wrap items-stretch justify-center gap-3">
            
            {/* Micro-targeta 1: Groc */}
            <div 
              style={{
                backgroundColor: 'rgba(10, 20, 36, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 223, 0, 0.2)'
              }}
              className="rounded-xl py-3 px-4 flex flex-col justify-center text-center transition-all hover:scale-[1.03] duration-200 min-w-[130px] max-w-[170px] flex-1 shrink-0"
            >
              <div style={{ color: '#FFDF00' }} className="text-xl font-black italic tracking-tight">
                94.2%
              </div>
              <div className="text-[10px] text-slate-350 font-bold uppercase tracking-wider mt-1.5 leading-tight">
                Recomanació de l'App
              </div>
            </div>

            {/* Micro-targeta 2: Blau */}
            <div 
              style={{
                backgroundColor: 'rgba(10, 20, 36, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}
              className="rounded-xl py-3 px-4 flex flex-col justify-center text-center transition-all hover:scale-[1.03] duration-200 min-w-[130px] max-w-[170px] flex-1 shrink-0"
            >
              <div style={{ color: '#38bdf8' }} className="text-xl font-black italic tracking-tight">
                +250k
              </div>
              <div className="text-[10px] text-slate-355 font-bold uppercase tracking-wider mt-1.5 leading-tight">
                Tests Processats
              </div>
            </div>

            {/* Micro-targeta 3: Rosa */}
            <div 
              style={{
                backgroundColor: 'rgba(10, 20, 36, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(236, 72, 153, 0.2)'
              }}
              className="rounded-xl py-3 px-4 flex flex-col justify-center text-center transition-all hover:scale-[1.03] duration-200 min-w-[130px] max-w-[170px] flex-1 shrink-0"
            >
              <div style={{ color: '#ec4899' }} className="text-xl font-black italic tracking-tight">
                24/7
              </div>
              <div className="text-[10px] text-slate-355 font-bold uppercase tracking-wider mt-1.5 leading-tight">
                Accés il·limitat al Campus
              </div>
            </div>

            {/* Micro-targeta 4: Groc */}
            <div 
              style={{
                backgroundColor: 'rgba(10, 20, 36, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 223, 0, 0.2)'
              }}
              className="rounded-xl py-3 px-4 flex flex-col justify-center text-center transition-all hover:scale-[1.03] duration-200 min-w-[130px] max-w-[170px] flex-1 shrink-0"
            >
              <div style={{ color: '#FFDF00' }} className="text-xl font-black italic tracking-tight">
                +50
              </div>
              <div className="text-[10px] text-slate-355 font-bold uppercase tracking-wider mt-1.5 leading-tight">
                Plans d'entrenament
              </div>
            </div>

            {/* Micro-targeta 5: Verd */}
            <div 
              style={{
                backgroundColor: 'rgba(10, 20, 36, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
              className="rounded-xl py-3 px-4 flex flex-col justify-center text-center transition-all hover:scale-[1.03] duration-200 min-w-[130px] max-w-[170px] flex-1 shrink-0"
            >
              <div style={{ color: '#10b981' }} className="text-xl font-black italic tracking-tight">
                12
              </div>
              <div className="text-[10px] text-slate-355 font-bold uppercase tracking-wider mt-1.5 leading-tight">
                Cronòmetres especials físiques
              </div>
            </div>

            {/* Micro-targeta 6: Rosa */}
            <div 
              style={{
                backgroundColor: 'rgba(10, 20, 36, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(236, 72, 153, 0.2)'
              }}
              className="rounded-xl py-3 px-4 flex flex-col justify-center text-center transition-all hover:scale-[1.03] duration-200 min-w-[130px] max-w-[170px] flex-1 shrink-0"
            >
              <div style={{ color: '#ec4899' }} className="text-xl font-black italic tracking-tight">
                TOP 1
              </div>
              <div className="text-[10px] text-slate-355 font-bold uppercase tracking-wider mt-1.5 leading-tight">
                Èxit en Psicoprofessionals
              </div>
            </div>

            {/* Micro-targeta 7: Blau */}
            <div 
              style={{
                backgroundColor: 'rgba(10, 20, 36, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}
              className="rounded-xl py-3 px-4 flex flex-col justify-center text-center transition-all hover:scale-[1.03] duration-200 min-w-[130px] max-w-[170px] flex-1 shrink-0"
            >
              <div style={{ color: '#38bdf8' }} className="text-xl font-black italic tracking-tight">
                100%
              </div>
              <div className="text-[10px] text-slate-355 font-bold uppercase tracking-wider mt-1.5 leading-tight">
                Simulacres d'Entrevista i Biodades
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Explicació per a no-programadors:
          Aquesta és la secció definitiva de crida a l'acció (CTA) abans d'arribar al peu de pàgina de la web.
          Incorporem un fons ambiental elegant de tipus dual: a l'esquerra, la imatge d'un cotxe de Mossos, i a la dreta, un camió de Bombers.
          Cadascun es difumina progressivament cap al centre mitjançant un efecte de "màscara de gradient" (mask-image i -webkit-mask-image en l'estil) perquè el text i botó centrals lluminosos llegeixin a la perfecció sobre fons fosc pur (#050b14).
          L'opacitat es limita a un 20% molt fi i discret per funcionar purament com a reflex de marca.
          Incorporem la classe 'whitespace-nowrap' per garantir que el botó de registre es mantingui ferm en un sol bloc. */}
      <section className="py-16 bg-[#050b14] border-t border-slate-900/60 text-center px-6 relative overflow-hidden z-10">
        
        {/* Capa de fons dual en absolut darrere del contingut per a no-programadors */}
        <div className="absolute inset-0 w-full h-full -z-10 flex overflow-hidden pointer-events-none">
          {/* Costat Esquerre (Mossos d'Esquadra) difuminat cap a la dreta */}
          <div 
            style={{ 
              backgroundImage: `url(${fonsMossosRegistre})`,
              maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
              WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
            }}
            className="w-1/2 h-full bg-cover bg-center opacity-20"
          />
          {/* Costat Dret (Bombers de la Generalitat) difuminat cap a l'esquerra */}
          <div 
            style={{ 
              backgroundImage: `url(${fonsBombersRegistre})`,
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
            }}
            className="w-1/2 h-full bg-cover bg-center opacity-20"
          />
        </div>

        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          
          {/* Frase motivadora superior */}
          <p style={{ color: '#f8fafc' }} className="text-base sm:text-lg font-medium leading-relaxed max-w-xl mx-auto">
            Estàs a un clic de fer el canvi de la teva vida. Registra't gratis i visita'ns! El primer pas és el més important.
          </p>

          {/* Botó de registre d'alta conversió */}
          <div className="pt-2">
            <button
              onClick={onEntrarWorkspace}
              style={{ cursor: 'pointer' }}
              className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-gradient-to-r from-sky-450 via-teal-500 to-emerald-500 hover:from-sky-350 hover:to-emerald-450 text-white font-black text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 transform active:scale-95 transition-all text-center inline-flex items-center justify-center gap-2 duration-300"
            >
              REGISTRA'T DE FRANC I PROVA L'APP WEB I MÒBIL 🚀
            </button>
          </div>

          {/* Secció de descàrrega mòbil integrada */}
          <div className="pt-4">
            <p className="text-slate-500 text-xs font-medium mb-3">
              Disponible també per a dispositius mòbils:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Botó descarregar d'Android */}
              <button 
                disabled 
                className="bg-black/90 hover:bg-black text-white flex items-center px-4 py-1.5 rounded-xl border border-zinc-850 gap-2.5 text-left h-10 select-none cursor-not-allowed opacity-90"
              >
                <span className="text-lg">🤖</span>
                <div className="flex flex-col justify-center">
                  <span className="text-[8px] uppercase text-zinc-400 font-bold tracking-tight leading-none">Disponible a</span>
                  <span className="text-[11px] font-black tracking-wide leading-tight font-sans">Google Play</span>
                </div>
              </button>

              {/* Botó descarregar d'iOS */}
              <button 
                disabled 
                className="bg-black/90 hover:bg-black text-white flex items-center px-4 py-1.5 rounded-xl border border-zinc-850 gap-2.5 text-left h-10 select-none cursor-not-allowed opacity-90"
              >
                <span className="text-lg">🍏</span>
                <div className="flex flex-col justify-center">
                  <span className="text-[8px] uppercase text-zinc-400 font-bold tracking-tight leading-none">Aconsegueix-ho a l'</span>
                  <span className="text-[11px] font-black tracking-wide leading-tight font-sans">App Store</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. SECCIÓ PEU DE PÀGINA INTEGRAL OPOSICIONSCATALUNYA */}
      {/* Explicació per a no-programadors:
          Aquest és el peu de pàgina de l'acadèmia. Està dividit en 4 grans columnes que canvien automàticament de 4 a 1 columna en pantalles de mòbil (gràcies a les etiquetes grid-cols-1 i md:grid-cols-4).
          S'estructura per ajudar l'usuari a trobar de forma fàcil la direcció o secció d'interès amb disseny minimalista d'alt contrast. */}
      <footer className="border-t border-[#1e293b] py-14 px-6 bg-[#020617] text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* COLUMNA 1: L'ACADÈMIA (Marca de l'empresa) */}
          <div className="space-y-4">
            <span className="text-[#FFDF00] font-black italic tracking-widest text-lg block">OposicionsCatalunya</span>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-sans font-medium">
              OposicionsCatalunya - La plataforma tecnològica d'alt rendiment per a la preparació de cossos de seguretat i emergències a Catalunya.
            </p>
            <p className="text-slate-500 text-[11px] font-sans">
              © {new Date().getFullYear()} OposicionsCatalunya. Tots els drets reservats.
            </p>
          </div>

          {/* COLUMNA 2: COSSOS D'OPOSICIÓ */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">COSSOS</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Mossos d'Esquadra
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Bombers de la Generalitat
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Agents Rurals
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Protecció Civil
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: MÒDULS I LINKS CORPORATIUS */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">NOSALTRES</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Qui som
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Contacta'ns (Suport Alumne)
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Preus i Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  El nostre Software
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: TEXTOS LEGALS SEGONS NORMATIVA VIGENT */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">LEGAL</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Avís Legal
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Política de Privacitat
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Política de Cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200 text-xs md:text-sm block">
                  Condicions de Contractació (Termes d'Ús)
                </a>
              </li>
            </ul>
          </div>

        </div>
      </footer>

    </div>
  );
}
