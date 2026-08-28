import { useState, useEffect } from "react";
import { ChevronLeft, Apple, Loader2 } from "lucide-react";
import DietaPremiumQuiz from "./dieta_premium_quiz";
import CalculadoraDieta from "./calculadora_dieta";
import { auth, db, handleFirestoreError, OperationType } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Explicació per a no-programadors: Carreguem la nova imatge de fons de les dietes específica per a format aplicació (Dieta_APP.png) de forma segura
// @ts-ignore
import fonsDieta from "../../../assets/images/Dieta_APP.png";

/**
 * PANTALLA: Dieta
 * Secció de nutrició i alt rendiment per a opositors de Mossos.
 * Enllaça el qüestionari inicial amb la calculadora de calories reals de Firestore.
 */
export default function Dieta({ 
  onTornar,
  onAnarSeccio
}: { 
  onTornar: () => void;
  onAnarSeccio?: (seccio: 'home' | 'forum' | 'noticies' | 'perfil') => void;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [completat, setCompletat] = useState<boolean>(false);
  const [avatarEstil, setAvatarEstil] = useState<string>("👮‍♂️");

  // Explicació per a no-programadors: Quan l'opositor prem a "Dieta", comprovem si té el perfil de rendiment calculat i guardat a la base de dades Firestore.
  useEffect(() => {
    // Carreguem primer l'avatar des de l'emmagatzematge local de l'estudiant per mostrar-ho al menú inferior
    try {
      const deLocalStorage = localStorage.getItem("avatar_estil");
      if (deLocalStorage) {
        setAvatarEstil(deLocalStorage);
      }
    } catch {
      setAvatarEstil("👮‍♂️");
    }

    // Comprovem l'estat d'autenticació per carregar les dades de Firestore
    const desconnecta = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuaris", user.uid, "dades_dietes", "dades");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const dades = docSnap.data();
            // Si el qüestionari ha arribat a la pantalla final i s'ha guardat amb èxit
            if (dades.completat === true) {
              setCompletat(true);
            } else {
              setCompletat(false);
            }
          } else {
            setCompletat(false);
          }
        } catch (err) {
          console.error("Error verificant qüestionari a Firestore:", err);
          setCompletat(false);
          handleFirestoreError(err, OperationType.GET, `usuaris/${user.uid}/dades_dietes/dades`);
        }
      } else {
        // Si no està loggejat, es pot usar de forma estàndard amb valors per defecte a la calculadora o forçar qüestionari
        setCompletat(false);
      }
      setLoading(false);
    });

    return () => desconnecta();
  }, []);

  // Explicació per a no-programadors: Si està carregant l'estat de la base de dades, mostrem un disseny elegant de càrrega d'alt rendiment d'OposiCAT
  if (loading) {
    return (
      <div className="fixed inset-0 w-full flex flex-col items-center justify-center bg-[#00274d] px-6">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src={fonsDieta} 
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#00274d]/55 to-[#00274d]/98" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 bg-[#001f3d]/45 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center shadow-2xl">
          <Loader2 className="animate-spin text-emerald-400" size={36} />
          <h2 className="text-sm font-black italic uppercase tracking-wider text-white">Carregant Perfil Nutricional...</h2>
          <p className="text-[10px] text-white/50 italic leading-relaxed">Sincronitzant els teus càlculs de macronutrients d'OposiCAT</p>
        </div>
      </div>
    );
  }

  // Explicació per a no-programadors: Si l'opositor ja ha completat el qüestionari en el passat, obrim directament la Calculadora adaptada.
  // També li passem una acció especial (onResetQuiz) que ens permet amagar la calculadora i tornar a obrir el qüestionari inicial de forma local si així ho desitja l'estudiant.
  if (completat) {
    return (
      <CalculadoraDieta 
        onTornar={onTornar} 
        onAnarSeccio={onAnarSeccio} 
        onResetQuiz={() => setCompletat(false)}
      />
    );
  }

  // Explicació per a no-programadors: Si és la seva primera vegada, s'obre el qüestionari interactiu
  return (
    <DietaPremiumQuiz 
      onTornar={onTornar} 
      onAnarSeccio={onAnarSeccio} 
    />
  );
}
