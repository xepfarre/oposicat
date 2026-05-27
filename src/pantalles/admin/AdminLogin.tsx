import { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ShieldAlert, Mail, Lock, LogIn, Chrome } from "lucide-react";
import { motion } from "motion/react";

export default function AdminLogin({ onLoginSuccess, initialError }: { onLoginSuccess: () => void; initialError?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError("Email o contrasenya incorrectes.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const adminEmails = ["xepfarre@gmail.com", "sergivinu@gmail.com"];
      if (!adminEmails.includes(result.user.email || "")) {
         setError("Accés denegat: Aquest correu no té permisos d'administrador.");
         await auth.signOut();
         return;
      }
      onLoginSuccess();
    } catch (err: any) {
      setError("Error en el login amb Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#001a33] flex items-center justify-center p-6 z-[200]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl flex flex-col gap-8"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mb-2">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black italic uppercase text-slate-800 tracking-tight">Accés <span className="text-blue-600">Restringit</span></h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Portal exclusiu per a l'equip de gestió d'OposiCatalunya.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold text-center border border-red-100 italic">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correu@empresa.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contrasenya"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#001a33] text-white py-4 rounded-2xl font-black italic uppercase tracking-[0.2em] text-xs mt-2 flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Accedint..." : <><LogIn size={18}/> Entrar al Sistema</>}
          </button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-300 bg-white px-4">O bé</div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full border-2 border-slate-100 text-slate-600 py-4 rounded-2xl font-black italic uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
        >
          <Chrome size={18} /> Google Login (Admin Only)
        </button>

        <p className="text-center text-[9px] text-slate-300 uppercase font-black tracking-[0.3em]">
          SECURITY PROTOCOL ACCREDITED
        </p>
      </motion.div>
    </div>
  );
}
