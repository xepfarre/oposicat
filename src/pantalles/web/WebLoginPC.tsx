import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  iniciarSessioAmbCorreu, 
  crearCompteAmbCorreu, 
  iniciarSessioAmbGoogle 
} from '../../lib/authService';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, Chrome, Loader2, ShieldAlert } from 'lucide-react';

/**
 * PROPS PER AL COMPONENT WEB LOGIN PC
 * Defineix les dependències que necessita rebre del component pare (App) per enllaçar les accions.
 */
interface WebLoginPCProps {
  onSessioIniciada: (perfil: any) => void; // Cridat quan s'inicia correctament la sessió
  onTornar: () => void;                    // Torna enrere cap a la Landing corporativa
}

/**
 * COMPONENT: WebLoginPC (FRONTEND / PANTALLA DE LOG IN COMPARTIDA)
 * 
 * Explicació per a no-programadors:
 * - Aquesta pantalla recrea perfectament la distribució de la foto del Paint:
 *   - Fons espectacular dels Mossos d'Esquadra de Catalunya (salutant a l'acadèmia ISPC).
 *   - L'esquerra conté la fitxa interactiva de registre o accés tradicional amb email i contrasenya.
 *   - La dreta conté una targeta de text amb la política de "Dispositiu únic / Sessió única síncrona",
 *     on s'avisa de l'asincronia cloud automàtica entre el mòbil i el web, i l'agraïment de confiança.
 */
export default function WebLoginPC({ onSessioIniciada, onTornar }: WebLoginPCProps) {
  // Estats interns de formulari
  const [mode, setMode] = useState<'login' | 'registre'>('login');
  const [email, setEmail] = useState('');
  const [contrasenya, setContrasenya] = useState('');
  const [nom, setNom] = useState('');
  const [recordam, setRecordam] = useState(true); // "Remember Me": Selector demanat per l'opositor
  
  // Estats pel control del cercle de càrrega i alertes informatives
  const [carregant, setCarregant] = useState(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  const [exitString, setExitString] = useState<string | null>(null);

  // Explicació per a no-programadors:
  // Traduïm els codis secrets i tècnics de Firebase a missatges molt planers i catalans fàcils d'entendre per tothom.
  const traduirErrorFirebase = (codi: string): string => {
    switch (codi) {
      case 'auth/invalid-email':
        return 'El correu electrònic no té un format correcte (exemple: alumne@oposicat.cat).';
      case 'auth/user-disabled':
        return 'Aquest compte d’alumne ha estat inhabilitat temporalment per l’administrador.';
      case 'auth/user-not-found':
        return 'No s’ha trobat cap alumne amb aquest correu. Si us plau, registra’t creant un nou compte.';
      case 'auth/wrong-password':
        return 'La contrasenya entrada no coincideix. Comprova el bloqueig de majúscules.';
      case 'auth/email-already-in-use':
        return 'Aquest email ja està registrat a OposiCAT. Fes "Iniciar sessió" per entrar.';
      case 'auth/weak-password':
        return 'La contrasenya ha de ser més segura i tenir com a mínim 6 lletres o números.';
      case 'auth/popup-closed-by-user':
        return 'S’ha cancel·lat el desplegable d’accés de Google abans de validar.';
      default:
        return 'Hi ha hagut un petit incident de connexió o validació. Si us plau, torna-ho a provar en un moment.';
    }
  };

  // Envia el formulari clàssic de login o registre de base de dades
  const handleEnviarFormulari = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorString(null);
    setExitString(null);

    // Protecció en cas de camps buits
    if (!email || !contrasenya) {
      setErrorString('Si us plau, completa tots els camps per continuar.');
      return;
    }

    if (mode === 'registre' && !nom) {
      setErrorString('Has d’escriure el teu nom i cognoms per a desmuntar la fitxa d’alumne.');
      return;
    }

    setCarregant(true);

    try {
      if (mode === 'login') {
        // Enllaç amb el Servei del servidor/backend d'accés (signInWithEmailAndPassword)
        const resultat = await iniciarSessioAmbCorreu(email, contrasenya);
        
        // Explicació planer:
        // Si l'alumne ha activat "Remember me", guardem la preferència local a l'ordinador de forma síncrona
        if (recordam) {
          localStorage.setItem('oposicat_sessio_guardada', 'true');
          localStorage.setItem('oposicat_correu_guardat', email);
        } else {
          localStorage.removeItem('oposicat_sessio_guardada');
        }

        setExitString(`Sessió verificada! Benvingut de nou al campus, ${resultat.perfil.displayName || 'Opositor/a'}.`);
        
        // Esperem un petit temps d'animació perquè pugui llegir el rètol d'èxit de color verd
        setTimeout(() => {
          onSessioIniciada(resultat.perfil);
        }, 1200);

      } else {
        // Cridem al backend per crear el nou compte a Firebase Auth i Firestore alhora
        const perfil = await crearCompteAmbCorreu(email, contrasenya, nom);
        
        setExitString(`Compte generat amb èxit! Hem enviat un mail de confirmació a ${email}.`);
        
        setTimeout(() => {
          onSessioIniciada(perfil);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Incident a l'autenticar-se de forma web:", err);
      setErrorString(traduirErrorFirebase(err.code || ''));
    } finally {
      setCarregant(false);
    }
  };

  // Iniciar sessió ràpida a la base de dades amb 1 click gràcies a Google
  const handleGoogleAccasRapit = async () => {
    setErrorString(null);
    setExitString(null);
    setCarregant(true);

    try {
      const resultat = await iniciarSessioAmbGoogle();
      
      if (recordam) {
        localStorage.setItem('oposicat_sessio_google', 'true');
      }

      setExitString(`Sessió iniciada amb Google! Hola de nou, ${resultat.perfil.displayName}.`);
      
      setTimeout(() => {
        onSessioIniciada(resultat.perfil);
      }, 1250);
    } catch (err: any) {
      console.error("Incident amb l'accés de Google en PC:", err);
      setErrorString(traduirErrorFirebase(err.code || ''));
    } finally {
      setCarregant(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full bg-cover bg-center flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundImage: "url('/assets/imatges/fons_ispc.png')" }}
    >
      {/* CAPA PROFESSIONAL DE DEGRADAT FOSC SOTA LA IMATGE PER A EXCEL·LENT VISUALITZACIÓ */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#021329]/95 via-[#021329]/90 to-[#010c1c]/95 z-0" />

      {/* RECEPTACLE CONTENIDOR DE MOSSOS - DE DOS COSTATS COM AL DIBUIX */}
      <div className="relative z-10 w-full max-w-5xl bg-slate-950/70 border border-blue-900/40 rounded-[32px] p-6 sm:p-10 md:p-12 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
        
        {/* BOTÓ TORNAR CAP AL WEB PÚBLIC */}
        <button
          onClick={onTornar}
          disabled={carregant}
          className="self-start flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider mb-8 cursor-pointer disabled:opacity-45 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-red-500" />
          <span>Tornar al Web públic</span>
        </button>

        {/* REPARTIMENT DE COSTATS EN GRID ESPACIAT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
          
          {/* ========================================================= */}
          {/* COSTAT ESQUERRA: EL DIARI DE LOG IN AMB PESTANYES I INPUTS */}
          {/* ========================================================= */}
          <div className="bg-[#03152b]/95 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-center">
            
            {/* LOGOTIP INTERN D'ACCÉS AL CAMPUS */}
            <div className="flex flex-col items-center mb-6">
              <header className="mb-2 shrink-0">
                <div className="bg-black/45 px-6 py-2 rounded-2xl border border-white/10">
                  <h1 className="text-xl font-black italic tracking-tighter select-none">
                    <span className="text-white">Oposi</span>
                    <span className="text-red-600">Mossos</span>
                  </h1>
                </div>
              </header>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center">
                Àrea Privada d'Estudiants
              </p>
            </div>

            {/* SELECCIÓ DE MÈTODE (INICIAR SESSIÓ / CREAR COMPTE / REGISTRE) */}
            <div className="grid grid-cols-2 bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
              <button
                onClick={() => { setMode('login'); setErrorString(null); }}
                disabled={carregant}
                className={`py-2 text-[10px] font-black italic uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  mode === 'login' 
                    ? 'bg-[#00274d] text-[#FFDF00] border border-white/10 shadow-md' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Iniciar sessió
              </button>
              <button
                onClick={() => { setMode('registre'); setErrorString(null); }}
                disabled={carregant}
                className={`py-2 text-[10px] font-black italic uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  mode === 'registre' 
                    ? 'bg-[#00274d] text-[#FFDF00] border border-white/10 shadow-md' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Crear compte
              </button>
            </div>

            {/* ALERTES INFORMATIVES EN CAS D'ERROR */}
            <AnimatePresence mode="wait">
              {errorString && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 bg-red-600/15 border border-red-500/25 text-red-150 p-3 rounded-xl text-xs mb-4 font-semibold leading-relaxed"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorString}</span>
                </motion.div>
              )}
              {exitString && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-150 p-3 rounded-xl text-xs mb-4 font-semibold leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{exitString}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORMULARI INTERACTIU */}
            <form onSubmit={handleEnviarFormulari} className="space-y-4">
              
              {/* Entrar el Nom complet si és un Registre de fitxa */}
              {mode === 'registre' && (
                <div className="space-y-1.5 text-left">
                  <label className="text-white/70 text-[10px] font-black italic uppercase tracking-wider block">
                    Nom i cognoms de l'estudiant
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-white/30" />
                    </span>
                    <input
                      type="text"
                      placeholder="Ex. Andreu Mas i Codina"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      disabled={carregant}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 transition-all font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* INPUT DE CORREU */}
              <div className="space-y-1.5 text-left">
                <label className="text-white/70 text-[10px] font-black italic uppercase tracking-wider block">
                  Correu electrònic
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-white/30" />
                  </span>
                  <input
                    type="email"
                    placeholder="estudiant@oposicat.cat"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={carregant}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* INPUT DE CONTRASENYA */}
              <div className="space-y-1.5 text-left">
                <label className="text-white/70 text-[10px] font-black italic uppercase tracking-wider block">
                  Contrasenya d'accés
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-white/30" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={contrasenya}
                    onChange={(e) => setContrasenya(e.target.value)}
                    disabled={carregant}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* SELECTOR INTERACTIU: REMEMBER ME / RECORDA'M (DEMANAT PER L'OPOSITOR) */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={recordam}
                    onChange={(e) => setRecordam(e.target.checked)}
                    disabled={carregant}
                    className="rounded text-red-650 focus:ring-red-650 h-3.5 w-3.5 bg-black/40 border-white/10 cursor-pointer accent-red-650"
                  />
                  <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                    Recorda'm a l'ordinador
                  </span>
                </label>
                <span className="text-[9px] text-[#00f296] font-extrabold uppercase hover:underline cursor-pointer">
                  Recuperar dades
                </span>
              </div>

              {/* BOTÓ D'ACCÉS PRINCIPAL */}
              <button
                type="submit"
                disabled={carregant}
                className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-650 active:scale-95 text-white font-black italic text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {carregant ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Establir connexió cloud...</span>
                  </>
                ) : mode === 'login' ? (
                  'Entrar al Campus d’estudiants'
                ) : (
                  'Registrar-me i activar compte'
                )}
              </button>
            </form>

            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <span className="relative bg-[#03152b] px-3.5 text-[9px] font-black italic text-slate-400 uppercase tracking-widest">
                O TAMBÉ AMB 1-CLICK
              </span>
            </div>

            {/* GOOGLE ACCÉS DE 1 CLICK */}
            <button
              onClick={handleGoogleAccasRapit}
              disabled={carregant}
              className="w-full bg-[#0a2038] hover:bg-[#0f2845] border border-white/5 active:scale-95 text-slate-100 font-black italic text-[11px] uppercase tracking-wider py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45"
            >
              <Chrome className="w-4 h-4 text-red-500" />
              <span>Entrada ràpida amb Google</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* COSTAT DRETA: EL BLOC DE TEXT EXPLICATIU I SEGURETAT (SESSIÓ ÚNICA) */}
          {/* ========================================================= */}
          <div className="flex flex-col justify-between py-2 text-left">
            <div>
              {/* Alerta de Seguretat de color corporatiu d'OposiCAT */}
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 flex items-start gap-3 mb-6">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider block">
                    ⚠️ RECORDATORI IMPORTANT: DISPOSITIU ÚNIC
                  </span>
                  <p className="text-[11px] font-semibold text-slate-200 leading-relaxed italic">
                    Recorda que només pots tenir oberta la sessió a un dispositiu alhora. Si entres ara a la web, es desconnectarà del teu mòbil la sessió immediatament i viceversa.
                  </p>
                </div>
              </div>

              {/* Informació d'ajuda d'alta comoditat d'accés */}
              <div className="space-y-4">
                <h3 className="text-base font-black italic uppercase text-[#FFDF00] tracking-wider">
                  Estudia amb la ment tranquil·la
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  Entrar és molt fàcil i només amb 1 click, així que no et preocupis! No perdràs gens de temps havent de logejar-te a cada sessió de repàs, i tot el teu progrés, targetes de test i anotacions es mantenen guardades sota clau de seguretat al núvol oficial d'estudiants.
                </p>
              </div>
            </div>

            {/* Agraïment del tribunal de preparadors d'OposiMossos */}
            <div className="mt-8 border-t border-white/10 pt-5 flex items-center gap-3">
              <div className="w-1.5 h-10 bg-red-600 rounded-full" />
              <div>
                <p className="text-xs text-white font-black italic uppercase">
                  Moltes gràcies per confiar en nosaltres!
                </p>
                <span className="text-[9px] text-[#00f296] font-bold uppercase tracking-wider block mt-0.5">
                  L'equip d'OposiCAT & Mossos d'Esquadra de Catalunya
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
