import { useState, useMemo } from "react";
import { ChevronLeft, Plus, X, Utensils, Coffee, Sun, Moon, Apple, Calculator, Check } from "lucide-react";

/**
 * COMPONENT: Calculadora de Nutrients
 * Visualitza les kcal i macros restants i permet afegir aliments.
 * Versió ESTÀTICA (sense animacions).
 */

interface Aliment {
  id: string;
  nom: string;
  kcal: number;
  carbs: number;
  protes: number;
  greixos: number;
  apat: 'esmorzar' | 'dinnar' | 'sopar' | 'snacks';
}

export default function CalculadoraDieta({ onTornar }: { onTornar: () => void }) {
  // Objectius diaris (Targets) - Es podrien calcular segons el quiz
  const targets = {
    kcal: 2200,
    carbs: 250,
    protes: 150,
    greixos: 70
  };

  const [aliments, setAliments] = useState<Aliment[]>([]);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);

  // Aliments de prova per al selector
  const ALIMENTS_SUGGERITS = [
    { nom: "Pit de pollastre (150g)", kcal: 250, carbs: 0, protes: 45, greixos: 5 },
    { nom: "Arròs bullit (100g)", kcal: 130, carbs: 28, protes: 3, greixos: 0 },
    { nom: "Civada (50g)", kcal: 190, carbs: 33, protes: 7, greixos: 3 },
    { nom: "Ous (2 unitats)", kcal: 140, carbs: 1, protes: 12, greixos: 10 },
    { nom: "Poma", kcal: 52, carbs: 14, protes: 0, greixos: 0 },
    { nom: "Iogurt grec", kcal: 130, carbs: 6, protes: 10, greixos: 8 }
  ];

  // Càlculs de totals actuals
  const totals = useMemo(() => {
    return aliments.reduce((acc, curr) => ({
      kcal: acc.kcal + curr.kcal,
      carbs: acc.carbs + curr.carbs,
      protes: acc.protes + curr.protes,
      greixos: acc.greixos + curr.greixos
    }), { kcal: 0, carbs: 0, protes: 0, greixos: 0 });
  }, [aliments]);

  const restants = {
    kcal: targets.kcal - totals.kcal,
    carbs: targets.carbs - totals.carbs,
    protes: targets.protes - totals.protes,
    greixos: targets.greixos - totals.greixos
  };

  const addAliment = (base: any, apat: any) => {
    const nou = {
      ...base,
      id: Math.random().toString(36).substr(2, 9),
      apat
    };
    setAliments([...aliments, nou]);
    setShowAddModal(null);
  };

  const removeAliment = (id: string) => {
    setAliments(aliments.filter(a => a.id !== id));
  };

  const percentKcal = Math.min((totals.kcal / targets.kcal) * 100, 100);

  return (
    <div className="fixed inset-0 w-full flex flex-col items-center bg-[#00274d] overflow-y-auto px-6 pb-24">
      
      {/* CAPÇALERA ESTIL PETICIÓ RECOSTAT I CENTRAT */}
      <header className="pt-8 w-full max-w-[280px] md:max-w-xs flex flex-col gap-4 pb-6 border-b border-white/5 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onTornar} 
            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/60 border border-white/10 shrink-0"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-white/90 leading-none mb-1">
              Eina de nutrició
            </h1>
            <span className="text-xl font-black italic uppercase tracking-wider text-emerald-400 leading-none">
              Intel·ligent
            </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-md flex flex-col gap-8">
        
        {/* CERCLE DE PROGRESSIÓ CENTRAL AMB FONS DETALLAT */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            {/* 1. GLOW DE FONS (RADIAL GRADIENT) */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-3xl" />
            <div className="absolute w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl" />
            
            {/* 2. DECORACIÓ "INTELLIGENCE" (LINIES RADAR SUBTILS) */}
            <div className="absolute inset-0 border border-white/5 rounded-full scale-[0.85]" />
            <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.15] opacity-50" />
            
            {/* 3. MARQUES DE DADES (CROSSHAIRS) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-white/[0.03] scale-x-110" />
              <div className="h-full w-px bg-white/[0.03] scale-y-110" />
            </div>

            {/* SVG Arc de fons i progressió */}
            <svg className="w-full h-full -rotate-90 relative z-10">
                <circle cx="128" cy="128" r="110" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                <circle 
                    cx="128" cy="128" r="110" fill="transparent" 
                    stroke="url(#emeraldGradient)" strokeWidth="14" 
                    strokeDasharray="691"
                    strokeDashoffset={691 - (691 * percentKcal) / 100}
                    strokeLinecap="round"
                    className="shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                />
                <defs>
                    <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                </defs>
            </svg>

            {/* CONTINGUT CENTRAL */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
                <span className="text-6xl font-black italic tracking-tighter text-white drop-shadow-lg">
                    {restants.kcal < 0 ? 0 : restants.kcal}
                </span>
                <div className="flex flex-col items-center mt-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 leading-none">Kcal restants</span>
                  <div className="h-px w-10 bg-white/10 my-3" />
                  <div className="flex items-center gap-1.5 bg-white/5 py-1 px-3 rounded-full border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-white/50 italic uppercase tracking-wider">{totals.kcal} consumides</span>
                  </div>
                </div>
            </div>
        </div>

        {/* BARS DE MACROS */}
        <div className="grid grid-cols-3 gap-4">
            {/* CARBS */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                    <span className="text-[8px] font-black uppercase text-white/20">Carbs</span>
                    <span className="text-[10px] font-bold text-blue-400">{totals.carbs}g<span className="text-white/20">/{targets.carbs}g</span></span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                        style={{ width: `${Math.min((totals.carbs / targets.carbs) * 100, 100)}%` }}
                        className="h-full bg-blue-400 rounded-full"
                    />
                </div>
            </div>
            {/* PROTES */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                    <span className="text-[8px] font-black uppercase text-white/20">Protes</span>
                    <span className="text-[10px] font-bold text-emerald-400">{totals.protes}g<span className="text-white/20">/{targets.protes}g</span></span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                        style={{ width: `${Math.min((totals.protes / targets.protes) * 100, 100)}%` }}
                        className="h-full bg-emerald-400 rounded-full"
                    />
                </div>
            </div>
            {/* GREIXOS */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                    <span className="text-[8px] font-black uppercase text-white/20">Greixos</span>
                    <span className="text-[10px] font-bold text-yellow-400">{totals.greixos}g<span className="text-white/20">/{targets.greixos}g</span></span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                        style={{ width: `${Math.min((totals.greixos / targets.greixos) * 100, 100)}%` }}
                        className="h-full bg-yellow-400 rounded-full"
                    />
                </div>
            </div>
        </div>

        {/* LLISTA D'ÀPATS */}
        <div className="flex flex-col gap-4 mt-4">
            {[
                { key: 'esmorzar', label: 'Esmorzar', icon: Coffee, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                { key: 'dinnar', label: 'Dinnar', icon: Sun, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                { key: 'sopar', label: 'Sopar', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { key: 'snacks', label: 'Snacks', icon: Apple, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
            ].map((apat) => {
                const apatAliments = aliments.filter(a => a.apat === apat.key);
                const apatKcal = apatAliments.reduce((sum, a) => sum + a.kcal, 0);

                return (
                    <div key={apat.key} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${apat.bg} flex items-center justify-center ${apat.color}`}>
                                    <apat.icon size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black italic uppercase tracking-tight text-white">{apat.label}</span>
                                    {apatAliments.length > 0 && (
                                        <span className="text-[10px] text-white/30 font-bold italic">
                                            {apatAliments.map(a => a.nom).join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/60">{apatKcal} cal</span>
                                <button 
                                    onClick={() => setShowAddModal(apat.key)}
                                    className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/10"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                        
                        {/* Llistat d'aliments inserits a l'àpat (Sense AnimatePresence) */}
                        {apatAliments.map(alim => (
                            <div 
                                key={alim.id} 
                                className="px-4 pb-3 flex items-center justify-between group"
                            >
                                <div className="pl-11 text-xs text-white/40 italic">{alim.nom}</div>
                                <button onClick={() => removeAliment(alim.id)} className="text-red-400/30 hover:text-red-400 transition-colors">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>

      </main>

      {/* MODAL D'AFEGIR (Simulat) */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
              <div 
                  className="w-full max-w-md bg-[#00274d] border border-white/10 rounded-t-3xl p-6 pb-12 flex flex-col gap-6 shadow-2xl"
              >
                  <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black italic uppercase text-emerald-400">Afegir aliment</h3>
                      <button onClick={() => setShowAddModal(null)} className="text-white/20 hover:text-white"><X /></button>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                      {ALIMENTS_SUGGERITS.map(alim => (
                          <button 
                              key={alim.nom}
                              onClick={() => addAliment(alim, showAddModal)}
                              className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-between group text-left transition-all"
                          >
                              <div className="flex flex-col">
                                  <span className="text-sm font-bold text-white/80">{alim.nom}</span>
                                  <span className="text-[10px] text-white/30 uppercase tracking-widest">{alim.kcal} kcal | C:{alim.carbs} P:{alim.protes} G:{alim.greixos}</span>
                              </div>
                              <Plus size={16} className="text-emerald-400 opacity-100" />
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
