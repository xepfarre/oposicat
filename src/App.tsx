import { useState } from 'react';
import PantallaBenvinguda from './pantalles/PantallaBenvinguda';
import PantallaVerificacioCorreu from './pantalles/PantallaVerificacioCorreu';
import Pantalla_Inici from './pantalles/pantalla_inici';
import OposiMossosInici from './pantalles/oposimossos/oposi_mossos_inici';
import ProvaTeoricaInici from './pantalles/oposimossos/prova_teorica/prova_teorica_inici';
import ExamenTeoricInici from './pantalles/oposimossos/prova_teorica/examen_teoric/examen_teoric_inici';
import EmCostaEstudiarInici from './pantalles/oposimossos/prova_teorica/em_costa_estudiar_inici';
import ProvaFisicaInici from './pantalles/oposimossos/prova_practica/prova_fisica_inici';
import ProvaPsicologicaInici from './pantalles/oposimossos/prova_psicologica/prova_psicologica_inici';
import TemariOficialInici from './pantalles/oposimossos/prova_teorica/temari_oficial_inici';
import TemariAmbitA from './pantalles/oposimossos/prova_teorica/temari_oficial/ambit_a';
import TemariAmbitB from './pantalles/oposimossos/prova_teorica/temari_oficial/ambit_b';
import TemariAmbitC from './pantalles/oposimossos/prova_teorica/temari_oficial/ambit_c';
import DetallTemaGeneric from './pantalles/oposimossos/prova_teorica/temari_oficial/detall_tema_generic';
import LectorContingut from './pantalles/oposimossos/prova_teorica/temari_oficial/lector_contingut';

// Temari Oposimossos (Resums)
import TemariOposimossosInici from './pantalles/oposimossos/prova_teorica/temari_oposimossos_inici';
import OposiAmbitA from './pantalles/oposimossos/prova_teorica/temari_oposimossos/ambit_a';
import OposiAmbitB from './pantalles/oposimossos/prova_teorica/temari_oposimossos/ambit_b';
import OposiAmbitC from './pantalles/oposimossos/prova_teorica/temari_oposimossos/ambit_c';
import DetallTemaOposimossos from './pantalles/oposimossos/prova_teorica/temari_oposimossos/detall_tema_generic';
import LectorOposimossos from './pantalles/oposimossos/prova_teorica/temari_oposimossos/lector_contingut';

import ClassesPremiumInici from './pantalles/oposimossos/prova_teorica/examen_teoric/classes_premium_inici';
import ClaseLuna from './pantalles/oposimossos/prova_teorica/examen_teoric/clase_luna';
import ClassesDirecteInici from './pantalles/oposimossos/prova_teorica/examen_teoric/classes_directe_inici';
import ExamensOficialsPassatsInici from './pantalles/oposimossos/prova_teorica/examen_teoric/examens_oficials_passats_inici';
import ExamensOposimossosInici from './pantalles/oposimossos/prova_teorica/examen_teoric/examens_oposimossos_inici';
import ExamenSimuladorMossos from './pantalles/oposimossos/prova_teorica/examen_teoric/examen_simulador_mossos';
import ExamenPsicotecnicInici from './pantalles/oposimossos/prova_teorica/examen_psicotecnic_inici';
import ActualitatInici from './pantalles/oposimossos/prova_teorica/actualitat_inici';
import AdminPanel from './pantalles/admin/AdminPanel';
import AdminLogin from './pantalles/admin/AdminLogin';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { tancarSessio, garantirFitxaPerfilFirestore } from './lib/authService';
import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

import { TEMARI_DETALL } from './constants/temari';
import { CONTINGUT_TEMARI_TEXTS } from './constants/contingut_textos';
// @ts-ignore
import LaMevaOposicio from './pantalles/oposimossos/la_meva_oposicio';

// Explicació per a no-programadors: Importem els fons d'estudi pesants per poder pre-carregar-los immediatament.
// @ts-ignore
import fonsTeoricaImg from './assets/images/Teorica.png';
// @ts-ignore
import fonsFisicaImg from './assets/images/fons_fisica_1780343173628.png';
// @ts-ignore
import fonsPsicologicaImg from './assets/images/fons_psicologica_1780343193032.png';

const IMATGES_A_PRECARREGAR = [
  fonsTeoricaImg,
  fonsFisicaImg,
  fonsPsicologicaImg,
  '/assets/imatges/fons_ispc.png',
  '/assets/imatges/carrusel_mossos.png',
  '/assets/imatges/carrusel_bombers.png',
  '/assets/imatges/carrusel_agentrural.png',
  '/assets/imatges/carrusel_proteciocivil.png',
  'https://images.unsplash.com/photo-1513829096999-4978602297f7?q=80&w=1200&auto=format&fit=crop&blur=3',
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=1200&auto=format&fit=crop&blur=3',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop&blur=3',
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1200&auto=format&fit=crop&blur=3'
];

// Nous components Modulars de la part Web i de d’Administració (Backoffice)
import SelectorDesenvolupament, { VistaDesenvolupament } from './components/SelectorDesenvolupament';
import WebLandingPC from './pantalles/web/WebLandingPC';
import WebLandingSmartphone from './pantalles/web/WebLandingSmartphone';
import WebLoginPC from './pantalles/web/WebLoginPC';
import WebWorkspacePC from './pantalles/web/WebWorkspacePC';
import WebBackofficePC from './pantalles/web/WebBackofficePC';
import WebLandingMobil from './pantalles/web/WebLandingMobil';
import WebRedireccioMobil from './pantalles/web/WebRedireccioMobil';
import PaginaMossos from './pages/PaginaMossos';

// Component unificat de Properament
// Explicació per a no-programadors: Mostra una pantalla amb l'estètica premium de l'acadèmia per a les rutes de bombers, agents rurals i protecció civil temporalment pendents de rebre temari complet.
function PlantaProperament({ títol }: { títol: string }) {
  return (
    <div style={{ backgroundColor: '#050b14', minHeight: '100vh' }} className="min-h-screen text-slate-100 font-sans flex flex-col justify-between selection:bg-[#FFDF00] selection:text-slate-900">
      <header className="border-b border-[#111e36] bg-[#050b14]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="no-underline">
            <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '1px', userSelect: 'none' }} className="text-white hover:opacity-90 transition-opacity">
              OPOSICIONS{' '}
              <span className="italic">
                <span className="text-[#FFDF00]">C</span>
                <span className="text-[#e10613]">A</span>
                <span className="text-[#FFDF00]">T</span>
                <span className="text-[#e10613]">A</span>
                <span className="text-[#FFDF00]">L</span>
                <span className="text-[#e10613]">U</span>
                <span className="text-[#FFDF00]">N</span>
                <span className="text-[#e10613]">Y</span>
                <span className="text-[#FFDF00]">A</span>
              </span>
            </span>
          </Link>
          <Link to="/" className="text-xs font-black italic uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
            ← Tornar a l'inici
          </Link>
        </div>
      </header>
      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center items-center text-center">
        <span className="inline-block bg-[#FFDF00]/10 text-[#FFDF00] border border-[#FFDF00]/20 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest animate-pulse mb-6">
          🔒 ACCÉS TANCAT TEMPORALMENT
        </span>
        <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-wider text-white mb-4">
          Preparem el Cos de <span className="text-[#FFDF00]">{títol}</span>
        </h1>
        <p className="text-slate-400 font-medium text-xs sm:text-sm max-w-lg mx-auto mb-8 leading-relaxed">
          Els nostres experts i docents estan enllestint la càrrega dels temaris resumits oficials d'OposiCAT per a aquesta secció. Estarà disponible molt aviat de manera 100% digitalitzada.
        </p>
        <Link to="/" className="px-6 py-3 bg-[#111e36] hover:bg-[#1e293b] text-[#FFDF00] rounded-xl font-black italic uppercase tracking-wider text-xs transition-all border border-[#FFDF00]/20">
          Explorar Mossos d'Esquadra (Activa)
        </Link>
      </main>
      <footer className="border-t border-[#111e36] bg-[#050b14]/80 py-6 text-center text-[11px] text-slate-500 font-sans">
        © {new Date().getFullYear()} OposicionsCatalunya.
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';

/**
 * COMPONENT PRINCIPAL: App
 * Gestiona la navegació entre les diferents pantalles de l'aplicació OposiCAT.
 */
export default function App() {
  // Explicació per a no-programadors:
  // Inicialitzem els gestors de navegació oficials de la barra d'adreces de la web.
  // "location" serveix per conèixer on és l'usuari ara mateix (ex: si és a la ruta d'admin).
  // "navigate" serveix per empènyer l'usuari cap a una nova adreça sense haver de re-carregar la pàgina.
  const location = useLocation();
  const navigate = useNavigate();

  // Estat per saber quina pantalla estem mostrant
  type Pantalla = 'benvinguda_alpha' | 'inici' | 'mossos' | 'prova_teorica' | 'prova_practica' | 'prova_psicologica' | 'examen_teoric' | 'em_costa_estudiar' | 'la_meva_oposicio' | 
    'temari_oficial' | 'temari_ambit_a' | 'temari_ambit_b' | 'temari_ambit_c' | 'detall_tema' | 'lector_contingut' |
    'temari_oposimossos' | 'temari_oposimossos_ambit_a' | 'temari_oposimossos_ambit_b' | 'temari_oposimossos_ambit_c' | 'detall_tema_oposimossos' | 'lector_contingut_oposimossos' |
    'classes_premium' | 'clase_luna' | 'classes_directe' | 'examens_oficials_passats' | 'examen_psicotecnic' | 'actualitat' | 'examens_oposimossos' | 'examens_oposimossos_simulador';
  const [pantalla, setPantalla] = useState<Pantalla>('benvinguda_alpha');
  // Explicació per a no-programadors: Estat d'escriptori general per recordar quina pestanya s'ha deixat oberta a la barra de botons inferior corporativa.
  const [mossosInicialSeccio, setMossosInicialSeccio] = useState<'home' | 'forum' | 'noticies' | 'perfil'>('home');
  
  // Explicació per a no-programadors: Aquest estat permet recordar d'on venia l'usuari abans d'obrir la pàgina de Mossos d'Esquadra (ja sigui d'ordinador o del mòbil) per tal que, en prémer el botó enrere, torni al lloc corresponent.
  const [origenMossos, setOrigenMossos] = useState<VistaDesenvolupament>('web_pc_website');
  
  const esDevMode = (() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const teParamsDev = params.has('dev') || params.has('debug');
    const esEntornLocal = window.location.hostname.includes('localhost') || 
                          window.location.hostname.includes('127.0.0.1') || 
                          window.location.hostname.includes('run.app'); // AI Studio Dev env
    return teParamsDev || esEntornLocal;
  })();

  // Explicació per a no-programadors:
  // Definim si el selector engranatge "flotant" de canvi de vista s'ha de mostrar o no d'acord amb el teu desig.
  // Es manté actiu en entorn de proves o local, o si afegeixes '?dev=true' o '?debug=true' a l'enllaç de manera privada per a tu.
  // Per als alumnes del carrer al teu domini oficial de producció, aquest botó estarà 105% amagat i neta de fons!
  const esVistaMarketing = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).has('marketing') || new URLSearchParams(window.location.search).has('compartit'));

  // Estat per a la vista de desenvolupament (comprovació simultània web/app)
  // Explicació per a no-programadors:
  // Si aquest estat està en 'app_mobil', es carrega la versió de mòbil. Incorporat per a producció:
  // Si l'usuari entra des d'un ordinador (pantalla gran), li iniciarem la web de PC per defecte de manera totalment transparent,
  // mentre que si entra des de mòbil li mostrarem la landing/adreçat mòbil directament.
  // MODIFICACIÓ PER A PROVES: Si estem a l'entorn de desenvolupament o de proves d'AI Studio, arranquem directament en 'app_mobil' per facilitar el testatge ràpid.
  const [vistaDev, setVistaDev] = useState<VistaDesenvolupament>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('marketing') || params.has('compartit')) {
      return 'web_pc_workspace';
    }
    
    // Comentari planer per a no-programadors:
    // Quan treballem a l'entorn d'AI Studio o local, arranquem directament a 'web_pc_workspace' (WEB-PC-WORKSPACE)
    // per tal que l'aplicació s'obri d'immediat a la zona d'estudi de la web sense haver de fer clics extres.
    if (esDevMode) {
      return 'web_pc_workspace';
    }

    // Comentari planer per a no-programadors:
    // Per a la fase de proves amb testers a producció, enviem directament a la pantalla de Login del Campus ('web_pc_login')
    // per tal que es creïn un compte o iniciïn sessió i accedeixin a "Què vols fer avui?".
    return 'web_pc_login';
  });
  
  // Estats per al Backoffice
  const [mode, setMode] = useState<'app' | 'admin'>('app');
  const [user, setUser] = useState<any>(null);
  const [errorSessioDuplicada, setErrorSessioDuplicada] = useState(false);

  // Explicació per a no-programadors:
  // Precarreguem actiu-ment totes les imatges de fons pesades quan l'aplicació s'obre per primera vegada.
  // Així s'assegura que no es vegi cap segon en blau l'estudi o canviador fons en navegar entre les vistes.
  useEffect(() => {
    IMATGES_A_PRECARREGAR.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Explicació per a no-programadors:
  // Controlarem dinàmicament el comportament del desplaçament (scroll) global del navegador.
  // Quan s'utilitza la versió de PC (Landing d'Escriptori, Workspace o Backoffice),
  // s'ha de poder fer scroll vertical per veure tot el contingut de la pantalla de dalt a baix.
  // Per contra, quan l'alumne entra a l'App Mòbil, es bloqueja el desplaçament exterior
  // per conservar l'experiència tàctil polida d'una aplicació nativa sense rebots de finestra.
  useEffect(() => {
    if (vistaDev === 'app_mobil') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
    // Desem la neteja per si es desmunta el component
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [vistaDev]);

  // ============================================================================
  // SINCRONITZADORS DE LA BARRA D'ADRECES DE NAVEGADOR AMB EL SELECTOR FLOTANT
  // ============================================================================

  // Explicació per a no-programadors:
  // Sincronitzador intel·ligent 1:
  // Si l'usuari/gestor entra de cop des de fora a la ruta de l'administrador ("admin"),
  // obliguem al nostre selector flotant a posar-se en valor "web_pc_backoffice" de forma transparent.
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      if (vistaDev !== 'web_pc_backoffice') {
        setVistaDev('web_pc_backoffice');
      }
    }
  }, [location.pathname, vistaDev]);

  // Explicació per a no-programadors:
  // Sincronitzador intel·ligent 2:
  // Si el moderador canvia de vista des del selector flotant de desenvolupament (per exemple a l'APP o Landing),
  // però la barra d'adreces de dalt encara mostra "admin", el tornem a la ruta pública principal de forma asíncrona.
  useEffect(() => {
    if (vistaDev !== 'web_pc_backoffice' && location.pathname.startsWith('/admin')) {
      navigate('/');
    }
  }, [vistaDev, location.pathname, navigate]);

  // Explicació per a no-programadors:
  // Sincronitzador intel·ligent 3:
  // Si canviem per mitjà del selector flotant cap al "Backoffice de PC", i resulta que encara no estem a la
  // ruta web d'administrador ("/admin"), acompanyem al navegador enviant-lo-hi de manera instantània.
  useEffect(() => {
    if (vistaDev === 'web_pc_backoffice' && !location.pathname.startsWith('/admin')) {
      navigate('/admin');
    }
  }, [vistaDev, location.pathname, navigate]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && vistaDev === 'web_pc_login') {
        setVistaDev('web_pc_workspace');
      }
    });
    return () => unsub();
  }, [vistaDev]);

  // --------------------------------------------------------------------------
  // CONTROLADOR DE SESSIÓ ÚNICA SIMULTÀNIA (EVITA COMPTES COMPARTITS - RGPD)
  // Explicació per a no-programadors:
  // Cada vegada que l'alumne entra, li assignem una clau de sessió única en el navegador (sessionStorage).
  // Després guardem aquesta clau a Firebase. Si l'alumne obre un l'aplicació des d'un altre mòbil amb el seu compte,
  // el servidor rebrà una clau nova. L'aplicació del mòbil antic detectarà aquest canvi en temps
  // real directament i tancarà la seva sessió dient-li que "Has entrat en un altre dispositiu".
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!user) {
      setErrorSessioDuplicada(false);
      return;
    }

    // 1. Definim o recuperem la clau aleatòria d'aquest dispositiu
    let laMevaSessio = sessionStorage.getItem('idSessioActiva');
    if (!laMevaSessio) {
      laMevaSessio = 'sessio_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      sessionStorage.setItem('idSessioActiva', laMevaSessio);
    }

    const docRef = doc(db, 'usuaris', user.uid);

    // Variable de control lexical (Explicació planer per a no-programadors):
    // Ens serveix per saber si ja hem pogut escriure la nostra sessió amb èxit a Firestore.
    // Així evitem que l'escoltador en viu (onSnapshot) compari abans d'hora el nostre navegador amb
    // les dades antigues de la base de dades, evitant tancar la sessió de forma errònia durant la càrrega.
    let sessioRegistradaCorrectament = false;

    // 2. Intentem registrar la nostra clau de sessió única a la base de dades (Firestore)
    // Comentari planer per a no-programadors:
    // Aquesta funció s'encarrega de desar a la fitxa de l'estudiant quina és la seva sessió activa del mòbil/tauleta.
    // Si la fitxa oficial de l'usuari encara no existís a Firestore durant el registre o refresc (per un retard asíncron),
    // detectem l'error immediatament i li creem una fitxa de perfil nova, neta i segura de forma silenciosa amb "garantirFitxaPerfilFirestore()".
    // Això evita que l'aplicació mostri errors de connexió o de document absent a la tauleta de l'alumne.
    const registrarSessio = async () => {
      try {
        await updateDoc(docRef, {
          idSessioActiva: laMevaSessio,
          ultimAccesEl: new Date()
        });
        sessioRegistradaCorrectament = true;
      } catch (err: any) {
        const errorText = err?.message || String(err);
        
        // Comentari planer:
        // Si el Firestore diu que no troba cap document a actualitzar (No document to update),
        // vol dir que l'usuari existeix a Google/Email però falta inicialitzar la seva col·lecció de dades a OposiCAT.
        // Cridem al servei per construir silenciósament la fitxa i després ho provem de nou.
        if (errorText.includes("No document to update") || errorText.includes("not-found")) {
          try {
            console.log("Creant fitxa de perfil absent o recuperant dades des de Firestore pel control de sessions de l'estudiant:", user.uid);
            await garantirFitxaPerfilFirestore(user);
            
            // Un cop la fitxa està garantida a la base de dades, tornem a desar el dispositiu actual de manera neta
            await updateDoc(docRef, {
              idSessioActiva: laMevaSessio,
              ultimAccesEl: new Date()
            });
            sessioRegistradaCorrectament = true;
          } catch (errorCreacio) {
            console.error("No s'ha pogut auto-crear o actualizar la fitxa durant el controlador de sessió única:", errorCreacio);
          }
        } else {
          // En qualsevol altre cas de retard o concurrència, ho reintentem amb un interval de seguretat
          setTimeout(async () => {
            try {
              await updateDoc(docRef, {
                idSessioActiva: laMevaSessio,
                ultimAccesEl: new Date()
              });
              sessioRegistradaCorrectament = true;
            } catch (e) {
              console.error("No s'ha pogut establir la clau de sessió única simultània al segon intent:", e);
            }
          }, 1500);
        }
      }
    };

    registrarSessio();

    // 3. Listener en temps real sobre Firestore per detectar si un altre dispositiu entra
    const unsubSessio = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const dades = snapshot.data();
        const sessioABBDD = dades.idSessioActiva;

        // Comprovació crucial: si a la BBDD hi ha una clau de sessió i no és la nostra, algú més ha entrat!
        // Comentari planer per a no-programadors: Només fem aquesta comprovació si el nostre propi dispositiu ja s'ha
        // registrat amb èxit (sessioRegistradaCorrectament === true), per evitar tancaments per dades antigues.
        if (sessioRegistradaCorrectament && sessioABBDD && sessioABBDD !== laMevaSessio) {
          console.warn("Doble sessió detectada! Desconnectant aquest dispositiu per evitar l'ús fraudulent de comptes.");
          setErrorSessioDuplicada(true);
          tancarSessio().then(() => {
            setPantalla('benvinguda_alpha');
          });
        }
      }
    }, (error) => {
      console.error("Error en escoltar canvis de sessió única (permisos de Firebase o desconnexió):", error);
    });

    return () => {
      unsubSessio();
    };
  }, [user]);
  
  // Estat per a la configuració del simulador
  const [simuladorConfig, setSimuladorConfig] = useState<{ 
    num: number, 
    temps: string, 
    seleccions: { [key: string]: number[] },
    examenId?: string 
  }>({ 
    num: 30, 
    temps: '45', 
    seleccions: { A: [], B: [], C: [] } 
  });
  
  // Estat per a la classe premium seleccionada
  const [classeSeleccionada, setClasseSeleccionada] = useState<{ bloc: string, tema: string, subtema: string } | null>(null);
  
  // Estat per saber quin tema estem visualitzant en detall
  const [temaSeleccionat, setTemaSeleccionat] = useState<{ ambit: 'A' | 'B' | 'C', index: number } | null>(null);
  const [subtemaSeleccionat, setSubtemaSeleccionat] = useState<number | null>(null);

  // Estat global del progrés de lectura (Arquitectura de Lego: dades a dalt de tot)
  const [progres, setProgres] = useState({
    A: Array(7).fill(false), // 7 temes a l'Àmbit A
    B: Array(8).fill(false), // 8 temes a l'Àmbit B
    C: Array(5).fill(false), // 5 temes a l'Àmbit C
    detall: {
      A: {
        0: Array(9).fill(false), // A.1: 9 punts (Història I)
        1: Array(8).fill(false), // A.2: 8 punts (Història II)
        2: Array(5).fill(false), // A.3: 5 punts (Policia)
        3: Array(4).fill(false), // A.4: 4 punts (Sociolingüística)
        4: Array(6).fill(false), // A.5: 6 punts (Geografia)
        5: Array(5).fill(false), // A.6: 5 punts (Entorn Social)
        6: Array(5).fill(false), // A.7: 5 punts (TIC)
      },
      B: {
        0: Array(5).fill(false), // B.1: 5 punts
        1: Array(5).fill(false), // B.2: 5 punts
        2: Array(6).fill(false), // B.3: 6 punts
        3: Array(8).fill(false), // B.4: 8 punts
        4: Array(4).fill(false), // B.5: 4 punts
        5: Array(4).fill(false), // B.6: 4 punts
        6: Array(7).fill(false), // B.7: 7 punts
        7: Array(3).fill(false), // B.8: 3 punts
      },
      C: {
        0: Array(2).fill(false), // C.1: 2 punts
        1: Array(8).fill(false), // C.2: 8 punts
        2: Array(5).fill(false), // C.3: 5 punts
        3: Array(3).fill(false), // C.4: 3 punts
        4: Array(3).fill(false), // C.5: 3 punts
      }
    },
    // Nou magatzem per als textos subratllats (HTML)
    contingutPersonalitzat: {} as Record<string, string>,
    // Nou magatzem per a resums o notes propis de l'usuari sincronitzats
    notesEstudiant: {} as Record<string, string>,
    // Progrés específic pel Temari d'Oposimossos (Resums)
    oposimossos: {
      A: Array(7).fill(false),
      B: Array(8).fill(false),
      C: Array(5).fill(false),
      detall: {
        A: {
          0: Array(9).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(4).fill(false), 4: Array(6).fill(false), 5: Array(5).fill(false), 6: Array(5).fill(false),
        },
        B: {
          0: Array(5).fill(false), 1: Array(5).fill(false), 2: Array(6).fill(false), 3: Array(8).fill(false), 4: Array(4).fill(false), 5: Array(4).fill(false), 6: Array(7).fill(false), 7: Array(3).fill(false),
        },
        C: {
          0: Array(2).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(3).fill(false), 4: Array(3).fill(false),
        }
      }
    }
  });

  // Explicació per a no-programadors:
  // Hook de Sincronització global amb Firestore.
  // Quan un usuari inicia sessió o es detecta un canvi d'usuari:
  // - Si no hi ha sessió (null), deixem el progrés buit.
  // - Si hi ha sessió, descarreguem tot el seu progrés, els subratllats i les seves notes de resum d'estudiant.
  useEffect(() => {
    if (!user) {
      setProgres({
        A: Array(7).fill(false),
        B: Array(8).fill(false),
        C: Array(5).fill(false),
        detall: {
          A: { 0: Array(9).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(4).fill(false), 4: Array(6).fill(false), 5: Array(5).fill(false), 6: Array(5).fill(false) },
          B: { 0: Array(5).fill(false), 1: Array(5).fill(false), 2: Array(6).fill(false), 3: Array(8).fill(false), 4: Array(4).fill(false), 5: Array(4).fill(false), 6: Array(7).fill(false), 7: Array(3).fill(false) },
          C: { 0: Array(2).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(3).fill(false), 4: Array(3).fill(false) }
        },
        contingutPersonalitzat: {},
        notesEstudiant: {},
        oposimossos: {
          A: Array(7).fill(false),
          B: Array(8).fill(false),
          C: Array(5).fill(false),
          detall: {
            A: { 0: Array(9).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(4).fill(false), 4: Array(6).fill(false), 5: Array(5).fill(false), 6: Array(5).fill(false) },
            B: { 0: Array(5).fill(false), 1: Array(5).fill(false), 2: Array(6).fill(false), 3: Array(8).fill(false), 4: Array(4).fill(false), 5: Array(4).fill(false), 6: Array(7).fill(false), 7: Array(3).fill(false) },
            C: { 0: Array(2).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(3).fill(false), 4: Array(3).fill(false) }
          }
        }
      });
      return;
    }

    import('./lib/progresEstudisService').then(({ carregarProgresEstudis }) => {
      carregarProgresEstudis(user.uid).then((dadesFirestore) => {
        if (dadesFirestore) {
          setProgres(dadesFirestore);
        }
      });
    });
  }, [user]);

  // Funció per guardar el contingut HTML personalitzat d'un subtema
  const guardarContingutPersonalitzat = (ambit: string, temaIdx: number, subtemaIdx: number, html: string) => {
    const clau = `${ambit}-${temaIdx}-${subtemaIdx}`;
    setProgres(prev => ({
      ...prev,
      contingutPersonalitzat: {
        ...prev.contingutPersonalitzat,
        [clau]: html
      }
    }));

    if (user) {
      import('./lib/progresEstudisService').then(({ desarSubratllat }) => {
        desarSubratllat(user.uid, ambit, temaIdx, subtemaIdx, html);
      });
    }
  };

  // Funció per guardar les anotacions d'estudi personals redactades per l'estudiant
  const guardarNotesEstudiant = (ambit: 'A' | 'B' | 'C', temaIdx: number, subtemaIdx: number, notes: string) => {
    const clau = `${ambit}-${temaIdx}-${subtemaIdx}`;
    setProgres(prev => ({
      ...prev,
      notesEstudiant: {
        ...prev.notesEstudiant,
        [clau]: notes
      }
    }));

    if (user) {
      import('./lib/progresEstudisService').then(({ desarNotesEstudiant }) => {
        desarNotesEstudiant(user.uid, ambit, temaIdx, subtemaIdx, notes);
      });
    }
  };

  // Funció per marcar un subtema com a llegit/no llegit (ARA ADREÇAT A AMBDÓS TEMARIS)
  const toggleSubtemaLlegit = (ambit: 'A' | 'B' | 'C', temaIndex: number, subIndex: number, tipus: 'oficial' | 'oposimossos' = 'oficial') => {
    setProgres(prev => {
      let nouCompletat = false;
      if (tipus === 'oficial') {
        const nouSub = [...prev.detall[ambit][temaIndex]];
        nouSub[subIndex] = !nouSub[subIndex];
        nouCompletat = nouSub[subIndex];

        if (user) {
          import('./lib/progresEstudisService').then(({ desarProgresLectura }) => {
            desarProgresLectura(user.uid, 'oficial', ambit, temaIndex, subIndex, nouCompletat);
          });
        }

        return {
          ...prev,
          detall: { ...prev.detall, [ambit]: { ...prev.detall[ambit], [temaIndex]: nouSub } }
        };
      } else {
        // @ts-ignore
        const nouSub = [...prev.oposimossos.detall[ambit][temaIndex]];
        nouSub[subIndex] = !nouSub[subIndex];
        nouCompletat = nouSub[subIndex];

        if (user) {
          import('./lib/progresEstudisService').then(({ desarProgresLectura }) => {
            desarProgresLectura(user.uid, 'oposimossos', ambit, temaIndex, subIndex, nouCompletat);
          });
        }

        return {
          ...prev,
          oposimossos: {
            ...prev.oposimossos,
            detall: {
              ...prev.oposimossos.detall,
              [ambit]: {
                // @ts-ignore
                ...prev.oposimossos.detall[ambit],
                [temaIndex]: nouSub
              }
            }
          }
        };
      }
    });
  };

  const toggleTemaLlegit = (ambit: 'A' | 'B' | 'C', index: number, tipus: 'oficial' | 'oposimossos' = 'oficial') => {
    setProgres(prev => {
      let nouCompletat = false;
      if (tipus === 'oficial') {
        const nouAmbit = [...prev[ambit]];
        nouAmbit[index] = !nouAmbit[index];
        nouCompletat = nouAmbit[index];

        if (user) {
          import('./lib/progresEstudisService').then(({ desarProgresTemaSencer }) => {
            desarProgresTemaSencer(user.uid, 'oficial', ambit, index, nouCompletat);
          });
        }

        return { ...prev, [ambit]: nouAmbit };
      } else {
        const nouAmbit = [...prev.oposimossos[ambit]];
        nouAmbit[index] = !nouAmbit[index];
        nouCompletat = nouAmbit[index];

        if (user) {
          import('./lib/progresEstudisService').then(({ desarProgresTemaSencer }) => {
            desarProgresTemaSencer(user.uid, 'oposimossos', ambit, index, nouCompletat);
          });
        }

        return {
          ...prev,
          oposimossos: { ...prev.oposimossos, [ambit]: nouAmbit }
        };
      }
    });
  };

  const handleEntrar = (nom: string) => {
    if (nom === "Mossos") setPantalla('mossos');
    else console.log(`Pendent d'implementar la secció: ${nom}`);
  };

  const handleTornarInici = () => setPantalla('inici');
  const handleAnarTeorica = () => setPantalla('prova_teorica');
  const handleAnarExamenTeoric = () => setPantalla('examen_teoric');
  const handleAnarEmCostaEstudiar = () => setPantalla('em_costa_estudiar');
  const handleAnarPractica = () => setPantalla('prova_practica');
  const handleAnarPsicologica = () => setPantalla('prova_psicologica');
  const handleAnarTemariOficial = () => setPantalla('temari_oficial');
  const handleAnarTemariOposimossos = () => setPantalla('temari_oposimossos');
  const handleAnarClassesPremium = () => setPantalla('classes_premium');
  const handleAnarClassesDirecte = () => setPantalla('classes_directe');
  const handleAnarExamensOficialsPassats = () => setPantalla('examens_oficials_passats');
  const handleAnarExamensOposimossos = () => setPantalla('examens_oposimossos');
  const handleComencarSimulador = (num: number, temps: string, seleccions: { [key: string]: number[] }, examenId?: string) => {
    setSimuladorConfig({ num, temps, seleccions, examenId });
    setPantalla('examens_oposimossos_simulador');
  };

  const handleAnarTemariAmbitA = () => setPantalla('temari_ambit_a');
  const handleAnarTemariAmbitB = () => setPantalla('temari_ambit_b');
  const handleAnarTemariAmbitC = () => setPantalla('temari_ambit_c');
  
  const handleAnarOposiAmbitA = () => setPantalla('temari_oposimossos_ambit_a');
  const handleAnarOposiAmbitB = () => setPantalla('temari_oposimossos_ambit_b');
  const handleAnarOposiAmbitC = () => setPantalla('temari_oposimossos_ambit_c');
  const handleAnarExamenPsicotecnic = () => setPantalla('examen_psicotecnic');
  const handleAnarActualitat = () => setPantalla('actualitat');

  const handleSeleccionarTema = (ambit: 'A' | 'B' | 'C', index: number, tipus: 'oficial' | 'oposimossos' = 'oficial') => {
    setTemaSeleccionat({ ambit, index });
    setPantalla(tipus === 'oficial' ? 'detall_tema' : 'detall_tema_oposimossos');
  };

  const handleSeleccionarSubtema = (index: number, tipus: 'oficial' | 'oposimossos' = 'oficial') => {
    setSubtemaSeleccionat(index);
    setPantalla(tipus === 'oficial' ? 'lector_contingut' : 'lector_contingut_oposimossos');
  };

  const handleTornarDeLector = () => {
    if (pantalla === 'lector_contingut') setPantalla('detall_tema');
    else setPantalla('temari_oposimossos');
    setSubtemaSeleccionat(null);
  };

  const handleTornarDeDetall = () => {
    const isOposi = pantalla === 'detall_tema_oposimossos';
    if (isOposi) {
      setPantalla('temari_oposimossos');
    } else {
      if (temaSeleccionat?.ambit === 'A') setPantalla('temari_ambit_a');
      else if (temaSeleccionat?.ambit === 'B') setPantalla('temari_ambit_b');
      else setPantalla('temari_ambit_c');
    }
    setTemaSeleccionat(null);
  };

  const handleTornarMossos = () => {
    setMossosInicialSeccio('home');
    setPantalla('mossos');
  };
  const handleAnarLaMevaOposicio = () => setPantalla('la_meva_oposicio');

  // Gestió Backoffice
  // Explicació per a no-programadors:
  // Quan el moderador polsa "Sortir de l'admin" al panell, canviem el selector 
  // flotant de vistes a darrere de les escenes cap a la pàgina d'inici web pública ràpidament.
  const handleSortirBackoffice = () => {
    setVistaDev('web_pc_website');
  };

  return (
    <div className="relative min-h-screen">
      {/* EL SELECTOR FLOTANT NOMÉS ESTARÀ VISIBLE SI S'ACTIVA EL LOG DE DEPURACIÓ PRIVAT (?dev=true) O ESTEM A L'ENTORN DE DESENVOLUPAMENT (run.app o localhost) */}
      {!esVistaMarketing && esDevMode && (
        <SelectorDesenvolupament vistaActual={vistaDev} onChangeVista={setVistaDev} />
      )}

      <Routes>
        {/* RUTA DE GESTIÓ: Backoffice Web (Bypass temporal segons petició) */}
        <Route path="/admin/*" element={<AdminPanel onExit={handleSortirBackoffice} />} />

        {/* RUTES REALS DE CADA COS CORRESPONENT D'OPOSICIONS CATALUNYA */}
        {/* Explicació per a no-programadors: 
            Enllacem cada petició externa a la seva sub-landing corresponent de l'acadèmia. */}
        <Route path="/mossos" element={<PaginaMossos 
          onTornar={() => {
            setVistaDev('web_pc_website');
            navigate('/');
          }} 
          onEntrarCampus={() => {
            if (user) {
              setVistaDev('web_pc_workspace');
              navigate('/');
            } else {
              setVistaDev('web_pc_login');
              navigate('/');
            }
          }}
        />} />
        <Route path="/bombers" element={<PlantaProperament títol="Bombers de Catalunya" />} />
        <Route path="/agents-rurals" element={<PlantaProperament títol="Agents Rurals" />} />
        <Route path="/proteccio-civil" element={<PlantaProperament títol="Protecció Civil" />} />

        {/* RUTA DE L'APP: Experiència d'usuari (actual) */}
        <Route path="*" element={
          <div className="relative min-h-screen">
            {/* MODAL DE SESSIÓ DUPLICADA GLOBAL (Control anti-compartir compte) */}
          {errorSessioDuplicada && (
            <div id="modal-sessio-duplicada" className="fixed inset-0 z-[100000] bg-[#00274d]/98 backdrop-blur-xl flex items-center justify-center p-6">
              <div className="bg-slate-900 border border-red-500/20 rounded-3xl p-8 max-w-sm text-center shadow-2xl flex flex-col items-center gap-5">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-black italic uppercase tracking-wider">
                    Sessió Tancada
                  </h3>
                  <p className="text-white/70 text-xs font-semibold leading-relaxed">
                    S'ha detectat que has iniciat sessió des d'un altre dispositiu (mòbil, tauleta o ordinador d'un amic).
                  </p>
                  <p className="text-[#FFDF00] text-[9px] uppercase font-black tracking-widest leading-loose">
                    Control d’accés privat actiu
                  </p>
                </div>
                <button
                  id="btn-tancar-modal-sessio"
                  onClick={() => {
                    setErrorSessioDuplicada(false);
                    if (vistaDev.startsWith('web_pc_')) {
                      setVistaDev('web_pc_website');
                    } else {
                      setPantalla('benvinguda_alpha');
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black italic uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer"
                >
                  D'acord, tornar a l'inici
                </button>
              </div>
            </div>
          )}

          {/* VISTES WEB CONDICIONALS DE DESENVOLUPAMENT */}
          {vistaDev === 'web_pc_website' && (
            <WebLandingPC 
              onEntrarWorkspace={() => {
                if (user) {
                  setVistaDev('web_pc_workspace');
                } else {
                  setVistaDev('web_pc_login');
                }
              }} 
              onEntrarBackoffice={() => setVistaDev('web_pc_backoffice')}
              onSimularEntrarMovil={() => setVistaDev('web_mobil_website')}
              onAnarMossos={() => {
                setOrigenMossos('web_pc_website');
                setVistaDev('web_pc_mossos');
              }}
            />
          )}

          {vistaDev === 'web_pc_mossos' && (
            <PaginaMossos 
              onTornar={() => setVistaDev(origenMossos)}
              onEntrarCampus={() => {
                if (user) {
                  setVistaDev('web_pc_workspace');
                } else {
                  setVistaDev('web_pc_login');
                }
              }}
            />
          )}

          {vistaDev === 'web_pc_login' && (
            <WebLoginPC 
              onSessioIniciada={(perfil) => {
                setVistaDev('web_pc_workspace');
              }}
              onTornar={() => setVistaDev('web_pc_website')}
            />
          )}

          {vistaDev === 'web_pc_workspace' && (
            <WebWorkspacePC 
              progresOriginal={progres} 
              onTornarLanding={() => setVistaDev('web_pc_website')}
              onObrirAppMobilSimulacre={() => setVistaDev('app_mobil')}
            />
          )}

          {vistaDev === 'web_pc_backoffice' && (
            <WebBackofficePC 
              onTornarLanding={() => setVistaDev('web_pc_website')}
            />
          )}

          {vistaDev === 'web_mobil_website' && (
            <WebLandingMobil 
              onTornarLandingGral={() => setVistaDev('web_pc_website')} 
              onAnarA_Redireccio={() => setVistaDev('web_mobil_redireccio')}
            />
          )}

          {vistaDev === 'web_smartphone_website' && (
            <WebLandingSmartphone 
              onEntrarWorkspace={() => {
                if (user) {
                  setVistaDev('web_pc_workspace');
                } else {
                  setVistaDev('web_pc_login');
                }
              }}
              onEntrarBackoffice={() => setVistaDev('web_pc_backoffice')}
              onSimularEntrarMovil={() => setVistaDev('web_mobil_website')}
              onAnarMossos={() => {
                setOrigenMossos('web_smartphone_website');
                setVistaDev('web_pc_mossos');
              }}
            />
          )}

          {vistaDev === 'web_mobil_redireccio' && (
            <WebRedireccioMobil 
              onTornarLandingMobil={() => setVistaDev('web_mobil_website')} 
              onLlançarAppMòbil={() => setVistaDev('app_mobil')}
            />
          )}

          {/* NOMÉS SI ESTEM EN MODE APP MÒBIL S'EXECUTA LA LÒGICA ANTERIOR COMPLETAMENT SENSE TOCAR RES NI DESQUADRAR MARGES */}
          {vistaDev === 'app_mobil' && (
            <div className="contents">
              {user !== null && !user.emailVerified ? (
            <PantallaVerificacioCorreu 
              onVerificatCorrectament={() => {
                // Forcem l'actualització del state de l'usuari amb la instància actualitzada de Firebase
                setUser(auth.currentUser ? { ...auth.currentUser } : null);
                setPantalla('inici');
              }}
              onTancarSessio={() => {
                setUser(null);
                setPantalla('benvinguda_alpha');
              }}
            />
          ) : (
            <div className="contents">
              {pantalla === 'benvinguda_alpha' && (
              <PantallaBenvinguda 
                onEntrarComAdmin={() => setPantalla('inici')} 
                onEntrarComUsuari={(perfil) => {
                  console.log("Alumne entrat:", perfil);
                  setPantalla('inici');
                }}
              />
            )}
            
            {pantalla === 'inici' && (
              <Pantalla_Inici 
                onEntrar={handleEntrar} 
                onAdminClick={() => window.location.href = "/admin"} 
                usuariActiu={user}
                onLogout={async () => {
                  await tancarSessio();
                  setPantalla('benvinguda_alpha');
                }}
              />
            )}
          
          {pantalla === 'mossos' && (
            <OposiMossosInici 
              onTornar={handleTornarInici} 
              onProvaTeorica={handleAnarTeorica}
              onProvaPractica={handleAnarPractica}
              onProvaPsicologica={handleAnarPsicologica}
              onLaMevaOposicio={handleAnarLaMevaOposicio}
              inicialSeccio={mossosInicialSeccio}
              onCanviarSeccio={(seccio) => setMossosInicialSeccio(seccio)}
            />
          )}

          {pantalla === 'prova_teorica' && (
            <ProvaTeoricaInici 
              onTornar={handleTornarMossos} 
              onExamenTeoric={handleAnarExamenTeoric}
              onExamenPsicotecnic={handleAnarExamenPsicotecnic}
              onActualitat={handleAnarActualitat}
              onEmCostaEstudiar={handleAnarEmCostaEstudiar}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
            />
          )}

          {pantalla === 'temari_oficial' && (
            <TemariOficialInici 
              onTornar={handleAnarExamenTeoric} 
              onAmbitA={handleAnarTemariAmbitA}
              onAmbitB={handleAnarTemariAmbitB}
              onAmbitC={handleAnarTemariAmbitC}
              progres={progres}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'temari_ambit_a' && (
            <TemariAmbitA 
              onTornar={handleAnarTemariOficial} 
              onTemaSeleccionat={(i) => handleSeleccionarTema('A', i)}
              progres={progres.A}
              progresDetallat={progres.detall.A}
              onToggle={(i) => toggleTemaLlegit('A', i)}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'temari_ambit_b' && (
            <TemariAmbitB 
              onTornar={handleAnarTemariOficial} 
              onTemaSeleccionat={(i) => handleSeleccionarTema('B', i)}
              progres={progres.B}
              progresDetallat={progres.detall.B}
              onToggle={(i) => toggleTemaLlegit('B', i)}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'temari_ambit_c' && (
            <TemariAmbitC 
              onTornar={handleAnarTemariOficial} 
              onTemaSeleccionat={(i) => handleSeleccionarTema('C', i)}
              progres={progres.C}
              progresDetallat={progres.detall.C}
              onToggle={(i) => toggleTemaLlegit('C', i)}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'detall_tema' && temaSeleccionat && (
            <DetallTemaGeneric 
              titol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].titol}
              ambit={temaSeleccionat.ambit}
              subtemes={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].subtemes}
              progres={progres.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A]}
              onTornar={handleTornarDeDetall}
              onToggle={(subIdx) => toggleSubtemaLlegit(temaSeleccionat.ambit, temaSeleccionat.index, subIdx)}
              onSubtemaClick={(subIdx) => handleSeleccionarSubtema(subIdx)}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'lector_contingut' && temaSeleccionat && subtemaSeleccionat !== null && (
            <LectorContingut 
              titol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].subtemes[subtemaSeleccionat]}
              subtitol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].titol}
              index={subtemaSeleccionat + 1}
              contingutOriginal={CONTINGUT_TEMARI_TEXTS[temaSeleccionat.ambit]?.[temaSeleccionat.index]?.[subtemaSeleccionat] || ""}
              contingutDesat={progres.contingutPersonalitzat[`${temaSeleccionat.ambit}-${temaSeleccionat.index}-${subtemaSeleccionat}`]}
              completat={progres.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A][subtemaSeleccionat]}
              onTornar={handleTornarDeLector}
              onGuardarContingut={(html) => guardarContingutPersonalitzat(temaSeleccionat.ambit, temaSeleccionat.index, subtemaSeleccionat, html)}
              onMarcarCompletat={() => {
                if (!progres.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A][subtemaSeleccionat]) {
                  toggleSubtemaLlegit(temaSeleccionat.ambit, temaSeleccionat.index, subtemaSeleccionat);
                }
              }}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'examen_teoric' && (
            <ExamenTeoricInici 
              onTornar={handleAnarTeorica} 
              onTemariOficial={handleAnarTemariOficial}
              onTemariOposimossos={handleAnarTemariOposimossos}
              onClassesPremium={handleAnarClassesPremium}
              onClassesDirecte={handleAnarClassesDirecte}
              onExamensOficialsPassats={handleAnarExamensOficialsPassats}
              onExamensOposimossos={handleAnarExamensOposimossos}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'examens_oposimossos' && (
            <ExamensOposimossosInici 
              onTornar={handleAnarExamenTeoric} 
              onComencar={handleComencarSimulador}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'examens_oposimossos_simulador' && (
            <ExamenSimuladorMossos 
              onTornar={() => {
                if (simuladorConfig.examenId) setPantalla('examens_oficials_passats');
                else setPantalla('examens_oposimossos');
              }}
              numPreguntes={simuladorConfig.num}
              temps={simuladorConfig.temps}
              seleccions={simuladorConfig.seleccions}
              examenId={simuladorConfig.examenId}
            />
          )}

          {pantalla === 'classes_premium' && (
            <ClassesPremiumInici 
              onTornar={handleAnarExamenTeoric} 
              onSeleccionarClasse={(classeInfo) => {
                setClasseSeleccionada(classeInfo);
                setPantalla('clase_luna');
              }}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'clase_luna' && classeSeleccionada && (
            <ClaseLuna 
              onTornar={handleAnarClassesPremium} 
              bloc={classeSeleccionada.bloc}
              tema={classeSeleccionada.tema}
              subtema={classeSeleccionada.subtema}
            />
          )}

          {pantalla === 'classes_directe' && (
            <ClassesDirecteInici 
              onTornar={handleAnarExamenTeoric} 
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'examens_oficials_passats' && (
            <ExamensOficialsPassatsInici 
              onTornar={handleAnarExamenTeoric} 
              onComencar={handleComencarSimulador}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'examen_psicotecnic' && (
            <ExamenPsicotecnicInici onTornar={handleAnarTeorica} />
          )}

          {pantalla === 'actualitat' && (
            <ActualitatInici onTornar={handleAnarTeorica} />
          )}

          {pantalla === 'temari_oposimossos' && (
            <TemariOposimossosInici 
              onTornar={handleAnarExamenTeoric} 
              onAmbitA={handleAnarOposiAmbitA}
              onAmbitB={handleAnarOposiAmbitB}
              onAmbitC={handleAnarOposiAmbitC}
              onSeleccionarTema={(ambit, idx) => handleSeleccionarTema(ambit, idx, 'oposimossos')}
              onSeleccionarSubtema={(ambit, temaIdx, subtemaIdx) => {
                setTemaSeleccionat({ ambit, index: temaIdx });
                setSubtemaSeleccionat(subtemaIdx);
                setPantalla('lector_contingut_oposimossos');
              }}
              progres={progres.oposimossos}
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
              onAnarInici={() => setPantalla('mossos')}
            />
          )}

          {pantalla === 'temari_oposimossos_ambit_a' && (
            <OposiAmbitA 
              onTornar={() => setPantalla('temari_oposimossos')} 
              temes={Object.keys(TEMARI_DETALL.A).map(k => TEMARI_DETALL.A[k as any].titol)}
              onSeleccionarTema={(i) => handleSeleccionarTema('A', i, 'oposimossos')}
              progres={progres.oposimossos.A}
              progresDetallat={Object.values(progres.oposimossos.detall.A)}
              onToggle={(i) => toggleTemaLlegit('A', i, 'oposimossos')}
            />
          )}

          {pantalla === 'temari_oposimossos_ambit_b' && (
            <OposiAmbitB 
              onTornar={() => setPantalla('temari_oposimossos')} 
              temes={Object.keys(TEMARI_DETALL.B).map(k => TEMARI_DETALL.B[k as any].titol)}
              onSeleccionarTema={(i) => handleSeleccionarTema('B', i, 'oposimossos')}
              progres={progres.oposimossos.B}
              progresDetallat={Object.values(progres.oposimossos.detall.B)}
              onToggle={(i) => toggleTemaLlegit('B', i, 'oposimossos')}
            />
          )}

          {pantalla === 'temari_oposimossos_ambit_c' && (
            <OposiAmbitC 
              onTornar={() => setPantalla('temari_oposimossos')} 
              temes={Object.keys(TEMARI_DETALL.C).map(k => TEMARI_DETALL.C[k as any].titol)}
              onSeleccionarTema={(i) => handleSeleccionarTema('C', i, 'oposimossos')}
              progres={progres.oposimossos.C}
              progresDetallat={Object.values(progres.oposimossos.detall.C)}
              onToggle={(i) => toggleTemaLlegit('C', i, 'oposimossos')}
            />
          )}

          {pantalla === 'detall_tema_oposimossos' && temaSeleccionat && (
            <DetallTemaOposimossos 
              ambitNom={`ÀMBIT ${temaSeleccionat.ambit}`}
              temaTitol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].titol}
              subtemes={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].subtemes}
              progres={progres.oposimossos.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A]}
              onTornar={handleTornarDeDetall}
              onToggle={(subIdx) => toggleSubtemaLlegit(temaSeleccionat.ambit, temaSeleccionat.index, subIdx, 'oposimossos')}
              onSeleccionarSubtema={(subIdx) => handleSeleccionarSubtema(subIdx, 'oposimossos')}
            />
          )}

          {pantalla === 'lector_contingut_oposimossos' && temaSeleccionat && subtemaSeleccionat !== null && (
            <LectorOposimossos 
              ambitNom={`ÀMBIT ${temaSeleccionat.ambit}`}
              temaTitol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].titol}
              puntTitol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].subtemes[subtemaSeleccionat]}
              contingutMd={
                temaSeleccionat.ambit === 'A' && temaSeleccionat.index === 0 && subtemaSeleccionat === 0
                ? `### 1.1.1. L'Antiguitat a Catalunya (Context)

*   **Vicens i Vives** defineix Catalunya com → **Redòs i passadís**.
*   Les dues restes humanes més antigues de Catalunya són ↓
    *   **La més antiga**: L'home de Talteüll - 450.000 anys.
    *   **La segona**: La mandíbula de Banyoles.`
                : "*Estat actual: En fase de blindatge. Properament trobaràs aquí el resum optimitzat d'OposiMossos.*"
              }
              contingutOficialHTML={progres.contingutPersonalitzat[`${temaSeleccionat.ambit}-${temaSeleccionat.index}-${subtemaSeleccionat}`]}
              completat={progres.oposimossos.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A][subtemaSeleccionat]}
              onTornar={handleTornarDeLector}
              onMarcarCompletat={() => {
                if (!progres.oposimossos.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A][subtemaSeleccionat]) {
                  toggleSubtemaLlegit(temaSeleccionat.ambit, temaSeleccionat.index, subtemaSeleccionat, 'oposimossos');
                }
              }}
              ambit={temaSeleccionat.ambit}
              temaIndex={temaSeleccionat.index}
              subtemaIndex={subtemaSeleccionat}
              notesDesades={progres.notesEstudiant[`${temaSeleccionat.ambit}-${temaSeleccionat.index}-${subtemaSeleccionat}`] || ""}
              onGuardarNotes={(notes) => guardarNotesEstudiant(temaSeleccionat.ambit, temaSeleccionat.index, subtemaSeleccionat, notes)}
            />
          )}

          {pantalla === 'em_costa_estudiar' && (
            <EmCostaEstudiarInici onTornar={handleAnarTeorica} />
          )}

          {pantalla === 'prova_practica' && (
            <ProvaFisicaInici 
              onTornar={handleTornarMossos} 
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
            />
          )}

          {pantalla === 'prova_psicologica' && (
            <ProvaPsicologicaInici 
              onTornar={handleTornarMossos} 
              onAnarSeccio={(seccio) => {
                setMossosInicialSeccio(seccio);
                setPantalla('mossos');
              }}
            />
          )}

          {pantalla === 'la_meva_oposicio' && (
            <LaMevaOposicio 
              onTornar={handleTornarMossos} 
              progresDetallat={progres.detall}
            />
          )}
            </div>
          )}
            </div>
          )}
        </div>
      } />
    </Routes>

    {/* Node de precarrega invisible per a forçar el renderitzat i cache de GPU del navegador i evitar qualsevol parpelleig de fons blau */}
    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
      {IMATGES_A_PRECARREGAR.map((src, idx) => (
        <div key={idx} style={{ backgroundImage: `url(${src})`, width: 1, height: 1 }} />
      ))}
    </div>
    </div>
  );
}
