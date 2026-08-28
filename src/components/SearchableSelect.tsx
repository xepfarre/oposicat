import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

// Comentari planer per a no-programadors:
// Aquest component actua com una capseta de selecció "intel·ligent". 
// En lloc de mostrar un llistat etern on l'usuari s'ha d'avorrir fent scroll (sobretot amb els municipis),
// obre un petit buscador que filtra les opcions a mesura que es va escrivint.
// També s'encarrega de tancar el menú automàticament si es fa clic a fora.

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  darkMode?: boolean; // Permet adaptar el color de fons i textos (fosc de la modal o mode de l'administrador)
  isAdminView?: boolean; // Ajust estètic addicional per al panell d'administració
}

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecciona...",
  disabled = false,
  required = false,
  darkMode = true,
  isAdminView = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Comentari planer per a no-programadors:
  // Detecta si s'ha fet clic fora del selector per tancar el desplegable de manera natural.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Comentari planer per a no-programadors:
  // Filtrem les opcions de la llista segons el text que l'usuari hagi escrit (sense importar majúscules o minúscules).
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-2 relative w-full text-left">
      {/* Etiqueta del camp */}
      <label className={`text-[10px] font-black uppercase tracking-wider px-1 ${
        isAdminView
          ? "text-slate-500"
          : "text-white/40"
      }`}>
        {label} {required && "*"}
      </label>
      
      {/* Selector clusable */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm("");
          }
        }}
        className={`w-full p-4 rounded-2xl border-none outline-none font-bold text-sm flex items-center justify-between cursor-pointer transition-all ${
          disabled ? 'opacity-30 pointer-events-none' : ''
        } ${
          isAdminView
            ? (darkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800')
            : (darkMode ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-800')
        }`}
      >
        <span className={value ? "" : (isAdminView ? "text-slate-400" : "text-white/20")}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={isAdminView ? (darkMode ? "text-slate-400" : "text-slate-500") : "text-white/40"} />
      </div>

      {/* Desplegable de cerca i opcions */}
      {isOpen && (
        <div className={`absolute z-50 left-0 right-0 top-[calc(100%+6px)] border rounded-2xl shadow-2xl overflow-hidden max-h-60 flex flex-col ${
          isAdminView
            ? (darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800')
            : (darkMode ? 'bg-[#0a122c] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800')
        }`}>
          {/* Caixa de cerca interna */}
          <div className={`flex items-center gap-2 p-3 border-b shrink-0 ${
            isAdminView
              ? (darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100')
              : (darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100')
          }`}>
            <Search size={14} className={isAdminView ? "text-slate-400" : "text-white/30"} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escriu per cercar..."
              onClick={(e) => e.stopPropagation()} // Evita que es tanqui el selector en fer clic a la barra de text
              className={`w-full bg-transparent text-xs focus:outline-none font-bold ${
                isAdminView
                  ? (darkMode ? 'text-white placeholder:text-white/30' : 'text-slate-800 placeholder:text-slate-400')
                  : (darkMode ? 'text-white placeholder:text-white/20' : 'text-slate-800 placeholder:text-slate-400')
              }`}
              autoFocus
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setSearchTerm(""); }}
                className={isAdminView ? "text-slate-400 hover:text-slate-600" : "text-white/40 hover:text-white"}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Llista d'opcions resultants */}
          <div className="overflow-y-auto flex-1 scrollbar-thin">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 text-xs font-bold cursor-pointer transition-colors ${
                    value === option
                      ? (isAdminView
                          ? 'bg-blue-500 text-white'
                          : 'bg-emerald-500/20 text-emerald-400')
                      : (isAdminView
                          ? (darkMode ? 'hover:bg-slate-750 text-white/90' : 'hover:bg-slate-100 text-slate-700')
                          : (darkMode ? 'hover:bg-white/5 text-white/80' : 'hover:bg-slate-100 text-slate-700'))
                  }`}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="p-4 text-xs font-semibold text-center opacity-40">
                No s'han trobat municipis o comarques...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
