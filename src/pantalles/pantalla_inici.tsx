import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * PANTALLA D'INICI (FRONTEND)
 * Versió: 1.1.0
 * Disseny rígid per a mòbil: sense scroll, colors canviants i jerarquia clara.
 */
export default function Pantalla_Inici({ 
  onEntrar, 
  onAdminClick,
  usuariActiu,
  onLogout
}: { 
  onEntrar: (nom: string) => void;
  onAdminClick: () => void;
  usuariActiu?: any;
  onLogout?: () => void;
}) {
  const [index, setIndex] = useState(0);

  const dades = [
    { 
      nom: "Mossos", 
      linia1: "MOSSOS", 
      linia2: "D'ESQUADRA", 
      color: "bg-[#00274d]", 
      fons: "https://images.unsplash.com/photo-1513829096999-4978602297f7?q=80&w=1200&auto=format&fit=crop&blur=3",
      actiu: true 
    },
    { 
      id: 1,
      nom: "Bombers", 
      linia1: "BOMBERS", 
      linia2: "DE CATALUNYA", 
      color: "bg-[#BE1E2D]", 
      fons: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=1200&auto=format&fit=crop&blur=3",
      actiu: false 
    },
    { 
      id: 2,
      nom: "Agents Rurals", 
      linia1: "AGENTS", 
      linia2: "RURALS", 
      color: "bg-[#277A44]", 
      fons: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop&blur=3",
      actiu: false 
    },
    { 
      id: 3,
      nom: "Protecció Civil", 
      linia1: "PROTECCIÓ", 
      linia2: "CIVIL", 
      color: "bg-[#F37021]", 
      fons: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1200&auto=format&fit=crop&blur=3",
      actiu: false, 
      dark: false 
    }
  ];

  const cos = dades[index];

  const següent = () => setIndex((i) => (i + 1) % dades.length);
  const anterior = () => setIndex((i) => (i - 1 + dades.length) % dades.length);

  return (
    <div className={`relative flex h-screen w-full flex-col items-center justify-between pb-6 px-10 transition-colors duration-700 overflow-hidden ${cos.color}`}>
      
      {/* Explicació per a no-programadors: Capa de fons difuminada amb la imatge de l'especialitat de seguretat corresponent barrejat amb degradats de color */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-700 overflow-hidden">
        <img 
          key={cos.fons}
          src={cos.fons} 
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover scale-110 blur-md opacity-25 transition-all duration-700 ease-in-out select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>
      
      {/* CAPÇALERA: Amb contenidor protector suau per garantir contrast permanent del logotip */}
      <header className="relative z-10 pt-14 w-full flex flex-col items-center gap-2">
        <div className="bg-black/30 backdrop-blur-md px-10 py-4 rounded-3xl shadow-xl border border-white/10 flex flex-col items-center">
          <h1 className="text-4xl font-black italic tracking-tighter select-none">
            <span className="text-white">Oposi</span>
            <span className="text-[#FFDF00]">CAT</span>
          </h1>
          {usuariActiu && (
            <div className="mt-2 text-center flex flex-col items-center">
              <span className="text-[11px] text-[#FFDF00] uppercase font-black italic tracking-wider">
                Alumne: {usuariActiu.displayName || usuariActiu.email || "Estudiant"}
              </span>
              <button 
                onClick={onLogout}
                className="mt-1 text-[9px] text-red-400 hover:text-red-500 font-extrabold uppercase tracking-widest cursor-pointer transition-colors"
              >
                Tancar sessió
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CARRUSEL CENTRAL (ESTÀTIC) */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          {/* Fletxa Esquerra */}
          <button 
            onClick={anterior} 
            className={`absolute -left-16 md:-left-24 top-1/2 -translate-y-1/2 z-20 p-2 cursor-pointer transition-opacity hover:opacity-100 ${cos.dark ? 'text-black/20' : 'text-white/20'}`}
          >
            <ChevronLeft className="size-16 md:size-24" strokeWidth={3} />
          </button>

          {/* Quadrat Central */}
          <div className={`flex flex-col h-72 w-56 md:h-96 md:w-80 items-center justify-center rounded-[3.5rem] md:rounded-[5rem] border-2 shadow-2xl transition-all p-4 ${cos.dark ? 'border-black/10 bg-black/5' : 'border-white/20 bg-white/5'}`}>
            <span className={`text-4xl md:text-6xl font-black italic tracking-tighter leading-none text-center ${cos.dark ? 'text-black/90' : 'text-white/90'}`}>
              {cos.linia1}
            </span>
            <div className={`my-2 md:my-4 h-1 w-12 md:w-20 rounded-full ${cos.dark ? 'bg-black/20' : 'bg-white/20'}`} />
            <span className={`text-2xl md:text-4xl font-black italic tracking-tighter leading-none text-center ${cos.dark ? 'text-black/70' : 'text-white/70'}`}>
              {cos.linia2}
            </span>
          </div>

          {/* Fletxa Dreta */}
          <button 
            onClick={següent} 
            className={`absolute -right-16 md:-right-24 top-1/2 -translate-y-1/2 z-20 p-2 cursor-pointer transition-opacity hover:opacity-100 ${cos.dark ? 'text-black/20' : 'text-white/20'}`}
          >
            <ChevronRight className="size-16 md:size-24" strokeWidth={3} />
          </button>
        </div>

      </div>

      {/* ACCIÓ INFERIOR */}
      <footer className="relative z-10 w-full max-w-xs md:max-w-2xl flex flex-col items-center gap-6">
        
        {/* INDICADORS DE MINIATURES (PAGINACIÓ) */}
        <div className="flex gap-4 mb-2">
          {dades.map((d, i) => (
            <div 
              key={i}
              onClick={() => setIndex(i)}
              className={`h-3 md:h-4 rounded-full transition-all duration-300 cursor-pointer border border-white/10 ${
                index === i 
                  ? 'w-12 md:w-32 bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                  : `w-4 md:w-8 ${d.color} opacity-60 hover:opacity-100`
              }`}
              title={d.nom}
            />
          ))}
        </div>

        <button 
          disabled={!cos.actiu}
          onClick={() => onEntrar(cos.nom)}
          className={`w-full rounded-2xl py-6 md:py-8 text-sm md:text-xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 
            ${cos.actiu 
              ? 'bg-[#12192C] text-white hover:bg-black cursor-pointer shadow-black/40' 
              : 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'
            }`}
        >
          {cos.actiu ? "Entrar a l'App" : "Proximament"}
        </button>
        
        <p className={`text-[9px] font-black uppercase tracking-wider opacity-80 select-none whitespace-nowrap ${cos.dark ? 'text-black' : 'text-white'}`}>
          Preparació acadèmica per a oposicions de l'ISPC
        </p>

        <button 
          onClick={onAdminClick}
          className="text-[8px] font-bold text-white/5 uppercase tracking-widest hover:text-white/20 transition-colors mt-2"
        >
          Accés Intern
        </button>
      </footer>
    </div>
  );
}
