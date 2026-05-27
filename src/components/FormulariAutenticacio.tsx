import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  crearCompteAmbCorreu, 
  iniciarSessioAmbCorreu, 
  iniciarSessioAmbGoogle 
} from '../lib/authService';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowLeft, Chrome, Loader2 } from 'lucide-react';

/**
 * COMPONENT DE FORMULARI D’AUTENTICACIÓ (FRONTEND)
 * 
 * Aquesta és la cara que veu l'estudiant per registrar-se o fer el login.
 * Està separat modularment d'acord amb els criteris de treball ("Lego").
 * 
 * Explicació planer per a no-programadors:
 * - Aquest component té un intercanviador ('mode') que et permet estar en mode 'login' (entrar) o 'registre' (crear compte).
 * - Durant l'espera d'una resposta de la base de dades Firestore, mostrem un cercle de càrrega ('carregant') per avisar l'usuari.
 */

interface FormulariAutenticacioProps {
  onSessioIniciada: (perfil: any) => void; // Què fer quan la sessió s'inicia correctament
  onTornar: () => void;                    // Què fer si l'usuari clica per anar enrere
}

export default function FormulariAutenticacio({
  onSessioIniciada,
  onTornar
}: FormulariAutenticacioProps) {
  // Estats interns per gestionar el formulari
  const [mode, setMode] = useState<'login' | 'registre'>('login');
  const [email, setEmail] = useState('');
  const [contrasenya, setContrasenya] = useState('');
  const [nom, setNom] = useState('');
  
  // Estats pel control d'espera i alertes
  const [carregant, setCarregant] = useState(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  const [exitString, setExitString] = useState<string | null>(null);

  // Explicació de Traduccions d'Errors de Firebase a Català planer per a l'opositor:
  const traduirErrorFirebase = (codi: string): string => {
    switch (codi) {
      case 'auth/invalid-email':
        return 'L’adreça de correu electrònic no té un format vàlid.';
      case 'auth/user-disabled':
        return 'Aquest compte d’estudiant ha estat desactivat per l’administrador.';
      case 'auth/user-not-found':
        return 'No s’ha trobat cap alumne amb aquest correu. Si us plau, registra’t.';
      case 'auth/wrong-password':
        return 'La contrasenya introduïda no és correcta.';
      case 'auth/email-already-in-use':
        return 'Ja existeix un compte creat amb aquest correu electrònic.';
      case 'auth/weak-password':
        return 'La contrasenya és massa feble. Ha de tenir un mínim de 6 caràcters.';
      case 'auth/popup-closed-by-user':
        return 'S’ha tancat la finestra de Google abans de completar l’accés.';
      default:
        return 'Hi ha hagut un inconvenient de connexió. Comprova la teva xarxa i torna-ho a provar.';
    }
  };

  // Enviar el formulari de correu tradicional (Login o Registre)
  const handleEnviarFormulari = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorString(null);
    setExitString(null);

    // Validacions bàsiques de seguretat en el navegador
    if (!email || !contrasenya) {
      setErrorString('Si us plau, omple tots els camps obligatoris.');
      return;
    }

    if (mode === 'registre' && !nom) {
      setErrorString('Si us plau, escriu el teu nom complet per a la targeta d’estudiant.');
      return;
    }

    setCarregant(true);

    try {
      if (mode === 'login') {
        const resultat = await iniciarSessioAmbCorreu(email, contrasenya);
        setExitString(`Benvingut/da de nou, ${resultat.perfil.displayName}!`);
        // Esperem un instant petit per donar temps a veure el missatge verd d’èxit
        setTimeout(() => {
          onSessioIniciada(resultat.perfil);
        }, 1200);
      } else {
        const perfil = await crearCompteAmbCorreu(email, contrasenya, nom);
        setExitString(`S’ha enviat un correu de verificació a ${email}. Benvingut/da a OposiCAT!`);
        setTimeout(() => {
          onSessioIniciada(perfil);
        }, 3000);
      }
    } catch (err: any) {
      console.error("Error en el procés d’autenticació:", err);
      setErrorString(traduirErrorFirebase(err.code || ''));
    } finally {
      setCarregant(false);
    }
  };

  // Iniciar sessió d'un sol clic amb Google
  const handleGoogleAuth = async () => {
    setErrorString(null);
    setExitString(null);
    setCarregant(true);

    try {
      const resultat = await iniciarSessioAmbGoogle();
      setExitString(`Accés correcte amb Google! Hola, ${resultat.perfil.displayName}.`);
      setTimeout(() => {
        onSessioIniciada(resultat.perfil);
      }, 1200);
    } catch (err: any) {
      console.error("Error en autenticació Google:", err);
      setErrorString(traduirErrorFirebase(err.code || ''));
    } finally {
      setCarregant(false);
    }
  };

  return (
    <div id="auth-container" className="w-full max-w-sm mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
      {/* Botó Tornar Enrere */}
      <button 
        id="btn-tornar-auth"
        onClick={onTornar}
        disabled={carregant}
        className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-semibold mb-6 transition-colors cursor-pointer disabled:opacity-40"
      >
        <ArrowLeft className="w-4 h-4 text-red-500" />
        Tornar a l'inici
      </button>

      {/* Selector de Mode (Iniciar sessió / Registrar-se) */}
      <div id="auth-selector-tabs" className="grid grid-cols-2 bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
        <button
          id="tab-login"
          onClick={() => { setMode('login'); setErrorString(null); }}
          disabled={carregant}
          className={`py-2 text-xs font-black italic uppercase tracking-wider rounded-lg transition-all ${
            mode === 'login' 
              ? 'bg-[#00274d] text-[#FFDF00] border border-white/10 shadow-lg' 
              : 'text-white/60 hover:text-white'
          }`}
        >
          Iniciar sessió
        </button>
        <button
          id="tab-registre"
          onClick={() => { setMode('registre'); setErrorString(null); }}
          disabled={carregant}
          className={`py-2 text-xs font-black italic uppercase tracking-wider rounded-lg transition-all ${
            mode === 'registre' 
              ? 'bg-[#00274d] text-[#FFDF00] border border-white/10 shadow-lg' 
              : 'text-white/60 hover:text-white'
          }`}
        >
          Crear compte
        </button>
      </div>

      {/* Alerta d’Error */}
      <AnimatePresence>
        {errorString && (
          <motion.div
            id="auth-error-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-xl text-xs mb-5 font-medium leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorString}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerta d’Èxit */}
      <AnimatePresence>
        {exitString && (
          <motion.div
            id="auth-exit-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-3 rounded-xl text-xs mb-5 font-medium leading-relaxed"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{exitString}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulari d’entrada */}
      <form id="auth-form" onSubmit={handleEnviarFormulari} className="space-y-4">
        
        {/* Camp de Nom (Només visible en mode Registre) */}
        {mode === 'registre' && (
          <div id="field-nom" className="space-y-1.5">
            <label className="text-white/70 text-xs font-black italic uppercase tracking-wider block">
              El teu nom i cognoms
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-white/40" />
              </span>
              <input
                id="input-nom"
                type="text"
                placeholder="Ex. Joan Vila i Farré"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                disabled={carregant}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-semibold"
              />
            </div>
          </div>
        )}

        {/* Camp de Correu Electrònic */}
        <div id="field-email" className="space-y-1.5">
          <label className="text-white/70 text-xs font-black italic uppercase tracking-wider block">
            Correu electrònic
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-white/40" />
            </span>
            <input
              id="input-email"
              type="email"
              placeholder="usuari@oposicat.cat"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={carregant}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-semibold"
              required
            />
          </div>
        </div>

        {/* Camp de Contrasenya */}
        <div id="field-password" className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-white/70 text-xs font-black italic uppercase tracking-wider block">
              Contrasenya
            </label>
            {mode === 'login' && (
              <span className="text-[10px] text-white/45 font-semibold hover:text-white cursor-pointer transition-colors">
                L'has oblidat?
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-white/40" />
            </span>
            <input
              id="input-password"
              type="password"
              placeholder="••••••••"
              value={contrasenya}
              onChange={(e) => setContrasenya(e.target.value)}
              disabled={carregant}
              className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-semibold"
              required
            />
          </div>
        </div>

        {/* Botó d’acció principal de formulari */}
        <button
          id="btn-auth-submit"
          type="submit"
          disabled={carregant}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black italic text-sm uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {carregant ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Processant accés...
            </>
          ) : mode === 'login' ? (
            'Entrar com opositor'
          ) : (
            'Donar-se d’alta i registrar-se'
          )}
        </button>
      </form>

      {/* Línia de divisió de mètodes d'accés */}
      <div id="auth-divider" className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <span className="relative bg-slate-900/90 px-3 text-[10px] font-black italic text-white/40 uppercase tracking-widest">
          O també
        </span>
      </div>

      {/* Botó de Google Auth */}
      <button
        id="btn-auth-google"
        type="button"
        onClick={handleGoogleAuth}
        disabled={carregant}
        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-white font-black italic text-xs uppercase tracking-wider py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
      >
        {carregant ? (
          <Loader2 className="w-4 h-4 animate-spin text-white/50" />
        ) : (
          <Chrome className="w-4 h-4 text-red-500" />
        )}
        Entrar ràpid amb Google
      </button>

      {/* Declaració de responsabilitat per dades sensibles (Recordatori didàctic d'habitualitat) */}
      <p id="lbl-seguretat-rgpd" className="mt-5 text-[9px] text-white/30 text-center uppercase font-bold tracking-wider leading-normal">
        Protecció RGPD de 2 nivells activa. Les teves dades sensibles es troben encriptades en un cicle independent de seguretat.
      </p>
    </div>
  );
}
