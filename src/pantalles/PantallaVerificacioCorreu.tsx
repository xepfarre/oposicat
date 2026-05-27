import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Mail, CheckCircle2, RotateCw, LogOut, Loader2, AlertCircle } from 'lucide-react';

/**
 * PANTALLA DE VERIFICACIÓ DE CORREU Pendiente (FRONTEND/DIDÀCTIC)
 * 
 * Comentari planer per a no-programadors:
 * Aquesta pantalla serveix de "filtre de seguretat" o zona de "Stand-by".
 * Quan un nou estudiant es registra, li enviem una carta de verificació al seu e-mail.
 * Fins que no faci clic a l'enllaç del correu per demostrar que és el propietari real d'aquest correu,
 * l'aplicació el mantindrà aquí blockat per seguretat.
 * Un cop verifiqui, podrà prémer el botó groc per comprovar que tot és correcte i començar a estudiar!
 */

interface PantallaVerificacioCorreuProps {
  onVerificatCorrectament: () => void;
  onTancarSessio: () => void;
}

export default function PantallaVerificacioCorreu({
  onVerificatCorrectament,
  onTancarSessio
}: PantallaVerificacioCorreuProps) {
  const [comprovant, setComprovant] = useState(false);
  const [reenviant, setReenviant] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [exitText, setExitText] = useState<string | null>(null);
  const [correuUsuari, setCorreuUsuari] = useState('');

  useEffect(() => {
    // Recuperem el correu del nostre estudiant actual
    if (auth.currentUser) {
      setCorreuUsuari(auth.currentUser.email || '');
    }
  }, []);

  /**
   * ACCIÓ: COMPROVAR SI JA HA FET CLIC AL SEU E-MAIL
   * Comentari planer per a no-programadors:
   * Demanem a Firebase que "recarregui" la fitxa de seguretat del telèfon/tauleta de l'usuari.
   * D'aquesta manera, el mòbil s'assabenta si l'estudiant ha premut el link del correu des de l'ordinador.
   */
  const handleComprovarVerificacio = async () => {
    setErrorText(null);
    setExitText(null);
    setComprovant(true);

    try {
      const usuari = auth.currentUser;
      if (usuari) {
        // Recarreguem la informació directament des dels ordinadors de Google/Firebase
        await usuari.reload();
        
        // Si ara ja detectem que ha estat confirmat:
        if (usuari.emailVerified) {
          setExitText('Perfecte! Hem verificat la teva identitat. En un moment podràs començar!');
          
          // Actualitzem també la seva fitxa general de perfil a Firestore a nivell asíncron de servidores
          try {
            const referencaDoc = doc(db, 'usuaris', usuari.uid);
            await updateDoc(referencaDoc, {
              correuVerificat: true,
              ultimAccesEl: new Date()
            });
          } catch (errorDb) {
            console.warn("No s'ha pogut actualizar la fitxa de Firestore per al correuVerificat (pot ser un tema menor de permisos inicials):", errorDb);
          }

          // Donem un instant d'espera i canviem de pantalla per començar a estudiar
          setTimeout(() => {
            onVerificatCorrectament();
          }, 1500);
        } else {
          setErrorText('Encara no detectem la teva verificació. Si us plau, revisa la teva bústia d’entrada (o la carpeta de correu brossa/spam) i fes clic a l’enllaç que t’hem enviat.');
        }
      } else {
        setErrorText('No hem pogut trobar la teva sessió. Torna a intentar entrar de nou.');
      }
    } catch (err: any) {
      console.error("Error en recarregar dades de l'estudiant:", err);
      setErrorText('S’ha produït un inconvenient en connectar amb el servidor. Torna-ho a provar en uns instants.');
    } finally {
      setComprovant(false);
    }
  };

  /**
   * ACCIÓ: REENVIAR EL CORREU
   * Comentari planer per a no-programadors:
   * Si l'alumne ha perdut el missatge anterior o s'ha esborrat de la seva bústia,
   * Firebase li torna a generar una nova carta de benvinguda amb un link totalment segur i encriptat.
   */
  const handleReenviarCorreu = async () => {
    setErrorText(null);
    setExitText(null);
    setReenviant(true);

    try {
      const usuari = auth.currentUser;
      if (usuari) {
        await sendEmailVerification(usuari);
        setExitText(`S’ha reenviat amb èxit un nou e-mail de verificació a: ${correuUsuari}. Revisa també la teva carpeta d'Spam.`);
      } else {
        setErrorText('No s’ha pogut localitzar cap sessió vàlida de l’estudiant.');
      }
    } catch (err: any) {
      console.error('Error en reenviar el correu de verificació:', err);
      if (err.code === 'auth/too-many-requests') {
        setErrorText('S’han produït massa sol·licituds seguides. Espera un minut abans de tornar-te a enviar el correu de control per seguretat d’spam.');
      } else {
        setErrorText('No s’ha pogut enviar el correu d’activació. Torna-ho a intentar d’aquí a uns segons.');
      }
    } finally {
      setReenviant(false);
    }
  };

  /**
   * ACCIÓ: TANCAR SESSIÓ PER TORNAR ENRERE
   * Comentari planer per a no-programadors:
   * Si l'opositor s'ha equivocat escrivint el seu correu a la tauleta, d'aquesta manera
   * pot prémer el botó de sortir, i registrar-se de nou de bones a primeres amb la contrasenya correcta.
   */
  const handleSortir = async () => {
    try {
      await signOut(auth);
      onTancarSessio();
    } catch (err) {
      console.error("Error en tancar sessió des de verificació:", err);
      onTancarSessio(); // executem igual el canvi de pantalla per curar en salut
    }
  };

  return (
    <div className="fixed inset-0 w-full min-h-screen bg-[#00274d] text-white flex flex-col items-center justify-center p-6 overflow-y-auto">
      
      {/* Targeta Principal amb l'Estètica blindada OposiMossos */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6 animate-fade-in">
        
        {/* Logotip Superior */}
        <div className="bg-black/30 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/5 shadow-md">
          <h1 className="text-2xl font-black italic tracking-tighter select-none">
            <span className="text-white">Oposi</span>
            <span className="text-red-600">Mossos</span>
          </h1>
        </div>

        {/* Cercle d'Icona de Seguretat/Verificació */}
        <div className="w-16 h-16 bg-[#FFDF00]/10 border border-[#FFDF00]/20 rounded-2xl flex items-center justify-center text-[#FFDF00] shadow-sm shrink-0">
          <Mail className="w-8 h-8 animate-pulse" />
        </div>

        {/* Text explicatiu planer d'estat "Stand-by" */}
        <div className="space-y-3">
          <h2 className="text-[#FFDF00] text-lg font-black italic uppercase tracking-wider">
            Verifica el teu correu
          </h2>
          <p className="text-white/80 text-xs font-semibold leading-relaxed px-2">
            Hem enviat un correu automàtic de validació a l’adreça d’estudiant que has definit:
          </p>
          
          {/* Caixa visual del correu de l'estudiant */}
          <div className="bg-black/40 border border-white/5 py-2.5 px-4 rounded-xl max-w-xs mx-auto">
            <span className="text-white text-xs font-bold font-mono tracking-wide break-all select-all">
              {correuUsuari || 'carregant correu...'}
            </span>
          </div>

          <p className="text-white/60 text-[10px] uppercase font-black tracking-widest leading-loose pt-1">
            Revisa la teva safari/safata i clica l'enllaç rebut.
          </p>
        </div>

        {/* Línia de separació amb la identitat corporativa de fons */}
        <div className="h-0.5 w-12 bg-red-600 rounded-full opacity-60 shrink-0" />

        {/* Missatges dinàmics d'Alerta */}
        {errorText && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-200 p-3.5 rounded-xl text-left text-xs leading-relaxed w-full">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        {exitText && (
          <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-3.5 rounded-xl text-left text-xs leading-relaxed w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{exitText}</span>
          </div>
        )}

        {/* BLOC MULTI-BUTONS DE CONTROL */}
        <div className="w-full flex flex-col gap-3.5">
          
          {/* Botó 1 (Principal): Comprovar Verificació */}
          <button
            onClick={handleComprovarVerificacio}
            disabled={comprovant || reenviant}
            className="w-full bg-[#FFDF00] text-slate-950 hover:bg-[#ffe84d] active:scale-95 text-xs font-black italic uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {comprovant ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                Comprovant correu...
              </>
            ) : (
              <>
                <RotateCw className="w-4 h-4" />
                Ja l'he verificat, comprova-ho ara!
              </>
            )}
          </button>

          {/* Botó 2 (Secundari): Reenviar Correu */}
          <button
            onClick={handleReenviarCorreu}
            disabled={comprovant || reenviant}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-white text-xs font-black italic uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {reenviant ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                Enviant un nou correu...
              </>
            ) : (
              'Reenviar correu de confirmació'
            )}
          </button>

          {/* Enllaç de sota per a tancar sessió si s'ha equivocat */}
          <button
            onClick={handleSortir}
            disabled={comprovant || reenviant}
            className="mt-2.5 text-xs font-bold italic tracking-wide text-red-400 hover:text-red-300 flex items-center justify-center gap-2 group cursor-pointer transition-colors disabled:opacity-40"
          >
            <LogOut className="w-4 h-4 text-red-500 group-hover:-translate-x-0.5 transition-transform" />
            Sortir o corregir el correu electrònic
          </button>

        </div>

        {/* Declaració de seguretat final */}
        <p className="text-[8px] text-white/30 uppercase font-black tracking-widest w-full">
          OposiCAT Control d'Accessos • Protecció Activa
        </p>

      </div>
    </div>
  );
}
