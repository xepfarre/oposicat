import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Target, Calendar, Brain, RefreshCw, ExternalLink } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * PANTALLA: LaMevaOposicio
 * Pantalla que mostra el progrés detallat del temari i inclou la secció
 * d'anàlisi de dades de rendiment real (encerts, errades, millor i pitjor tema).
 */
export default function LaMevaOposicio({ 
  onTornar,
  progresDetallat = { A: {}, B: {}, C: {} }
}: { 
  onTornar: () => void,
  progresDetallat: any
}) {
  // Comprovació i estats per a la càrrega de dades d'analítica realment persistida
  const [loadingStats, setLoadingStats] = useState(true);
  const [totalEncerts, setTotalEncerts] = useState(0);
  const [totalErrades, setTotalErrades] = useState(0);
  
  // Guardem l'objecte complet de dades per al millor i pitjor tema de l'opositor
  const [millorTema, setMillorTema] = useState<{ id: string, name: string, percent: number, encertades: number, totals: number } | null>(null);
  const [pitjorTema, setPitjorTema] = useState<{ id: string, name: string, percent: number, encertades: number, totals: number } | null>(null);

  // Càlcul planer de punts totals i estudiats (lectura de temari)
  const calcularPunts = (ambit: 'A' | 'B' | 'C') => {
    const dades = progresDetallat[ambit] || {};
    let estudiats = 0;
    let totals = 0;
    Object.values(dades).forEach((arr: any) => {
      estudiats += arr.filter(Boolean).length;
      totals += arr.length;
    });
    return { estudiats, totals };
  };

  const puntsA = calcularPunts('A');
  const puntsB = calcularPunts('B');
  const puntsC = calcularPunts('C');

  const estudiatsTotals = puntsA.estudiats + puntsB.estudiats + puntsC.estudiats;
  const totalsTotals = puntsA.totals + puntsB.totals + puntsC.totals || 1;
  const percentatgeGlobal = Math.round((estudiatsTotals / totalsTotals) * 100);

  // Comentari planer per a no-programadors:
  // Carrega les dades en directe només obrir la pantalla del progrés.
  // Es demanen (1) les respostes totals que té registrades l'estudiant i (2) l'inventari virtual 'comptadors/temari' on s'emmagatzema el denominador (totals per tema).
  useEffect(() => {
    const carregarEstadistiquesReals = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoadingStats(false);
        return;
      }

      try {
        // 1. Llegim el document d'inventari 'comptadors/temari' on estan desats els números de preguntes de cada tema
        const comptadorRef = doc(db, 'comptadors', 'temari');
        const comptadorSnap = await getDoc(comptadorRef);
        const totalsTemes = comptadorSnap.exists() ? comptadorSnap.data() : {};

        // 2. Comentari planer per a no-programadors:
        // Intentem carregar primer la foto resum pre-agregada de l'estudiant de forma instantània.
        // Si no existeix (Inicialització Gradual!), el document és nul o no s'ha creat mai. En aquest cas, demanem la col·lecció completa antiga com a fallback automàtic, 
        // o si tampoc té respostes, s'inicialitza tot a zero (0) sense problemes ni errors visuals per garantir que mai falli.
        const statsRef = doc(db, `usuaris/${user.uid}/estadistiques`, "totals");
        const statsSnap = await getDoc(statsRef);

        let encertsNum = 0;
        let erradesNum = 0;

        // Mapejos on acumularem quantes preguntes té l'usuari correctament encertades per tema i intents totals
        const encertatsPerTema: { [key: string]: number } = {};
        const intentsPerTema: { [key: string]: number } = {};

        if (statsSnap.exists()) {
          const statsData = statsSnap.data() || {};
          encertsNum = statsData.totalEncerts || 0;
          erradesNum = statsData.totalErrades || 0;
          
          Object.keys(statsData).forEach(key => {
            if (key.startsWith('intents_tema_')) {
              const temaKey = key.replace('intents_', '');
              intentsPerTema[temaKey] = statsData[key] || 0;
            }
            if (key.startsWith('correctes_tema_')) {
              const temaKey = key.replace('correctes_', '');
              encertatsPerTema[temaKey] = statsData[key] || 0;
            }
          });
        } else {
          // Fallback: com que no té el document d'estadístiques totals (Inicialització Gradual),
          // llegim les respostes individuals de l'estudiant per si té històric antic i reconstruïm els totals.
          const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
          const respostesSnap = await getDocs(respostesRef);

          respostesSnap.docs.forEach(docSnap => {
            const d = docSnap.data();
            const esEncertada = !!d.encertada;

            if (esEncertada) {
              encertsNum++;
            } else {
              erradesNum++;
            }

            // Agrupació per temes de cara al ràtio de percentatge
            if (d.ambit !== undefined && d.tema !== undefined) {
              const ambitMap: { [key: string]: number } = { A: 1, B: 2, C: 3 };
              const ambitId = ambitMap[d.ambit] || 1;
              const temaVisual = parseInt(d.tema.toString(), 10) + 1;
              const temaKey = `tema_${ambitId}.${temaVisual}`;

              intentsPerTema[temaKey] = (intentsPerTema[temaKey] || 0) + 1;
              if (esEncertada) {
                encertatsPerTema[temaKey] = (encertatsPerTema[temaKey] || 0) + 1;
              }
            }
          });

          // Si té dades històriques, l'auto-sincronitzem asíncronament de cara al futur
          if (respostesSnap.size > 0) {
            const upObj: any = {
              totalRespostes: encertsNum + erradesNum,
              totalEncerts: encertsNum,
              totalErrades: erradesNum
            };
            Object.keys(intentsPerTema).forEach(k => {
              upObj[`intents_${k}`] = intentsPerTema[k];
            });
            Object.keys(encertatsPerTema).forEach(k => {
              upObj[`correctes_${k}`] = encertatsPerTema[k];
            });
            setDoc(statsRef, upObj, { merge: true }).catch(err => {
              console.warn("No s'han pogut pré-agregar les estadístiques antigues d'OposiCAT:", err);
            });
          }
        }

        setTotalEncerts(encertsNum);
        setTotalErrades(erradesNum);

        // 3. Càlcul del % d'encert de cadascun dels temes actius per resoldre quin és el millor i pitjor tema.
        // Comentari planer per a no-programadors:
        // Ara calculem els millors i pitjors temes basant-nos en les respostes que REALMENT ha intentat cada estudiant,
        // garantint que si té intents, aquests temes es mostrin. Evitem que quedi 'Per determinar' si només s'hi han registrat errors.
        let millor: typeof millorTema = null;
        let pitjor: typeof pitjorTema = null;

        Object.keys(intentsPerTema).forEach(temaKey => {
          const totalIntentsTema = intentsPerTema[temaKey] || 0;
          if (totalIntentsTema > 0) {
            const encertatsUsuari = encertatsPerTema[temaKey] || 0;
            const percent = Number(((encertatsUsuari / totalIntentsTema) * 100).toFixed(1));

            // Resolem el millor tema (per favor de ràtio)
            if (!millor || percent > millor.percent) {
              millor = {
                id: temaKey,
                name: formatTemaNom(temaKey),
                percent: percent,
                encertades: encertatsUsuari,
                totals: totalIntentsTema
              };
            } else if (millor && percent === millor.percent) {
              // En cas d'empat de percentatges, mostrem el tema que contingui major densitat de volum
              if (totalIntentsTema > millor.totals) {
                millor = {
                  id: temaKey,
                  name: formatTemaNom(temaKey),
                  percent: percent,
                  encertades: encertatsUsuari,
                  totals: totalIntentsTema
                };
              }
            }

            // Resolem el pitjor tema
            if (!pitjor || percent < pitjor.percent) {
              pitjor = {
                id: temaKey,
                name: formatTemaNom(temaKey),
                percent: percent,
                encertades: encertatsUsuari,
                totals: totalIntentsTema
              };
            } else if (pitjor && percent === pitjor.percent) {
              // En cas d'empat de pitjor percentatge, usem el tema que contingui més volum per ressaltar la necessitat d'estudi
              if (totalIntentsTema > pitjor.totals) {
                pitjor = {
                  id: temaKey,
                  name: formatTemaNom(temaKey),
                  percent: percent,
                  encertades: encertatsUsuari,
                  totals: totalIntentsTema
                };
              }
            }
          }
        });

        setMillorTema(millor);
        setPitjorTema(pitjor);

      } catch (err) {
        console.error("Error calculant l'anàlisi de rendiment teòric:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    carregarEstadistiquesReals();
  }, []);

  // Comentari planer per a no-programadors:
  // Converteix internament 'tema_1.2' en text bonic didàctic net 'Àmbit A • Tema 2' basat en la nomenclatura.
  const formatTemaNom = (temaKey: string) => {
    const parts = temaKey.replace('tema_', '').split('.');
    if (parts.length === 2) {
      const ambitCodi = parts[0] === '1' ? 'A' : parts[0] === '2' ? 'B' : 'C';
      return `Àmbit ${ambitCodi} • Tema ${parts[1]}`;
    }
    return temaKey;
  };

  return (
    <div className="fixed inset-0 h-full w-full flex flex-col items-center pb-20 px-6 bg-[#00274d] overflow-y-auto">
      
      <header className="pt-12 w-full max-w-xl flex items-center gap-5 mb-10 shrink-0">
        <button 
          onClick={onTornar}
          className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all active:scale-90"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-4xl font-black italic uppercase text-white tracking-tighter leading-none">
            El meu <span className="text-yellow-400">Progrés</span>
          </h1>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em] mt-1">Estat de la preparació del temari</p>
        </div>
      </header>

       <main className="w-full max-w-md flex flex-col gap-6">

        {/* Explicació per a no-programadors: Secció de Links Oficials sol·licitada.
            Presenta botons mòbils estilitzats per obrir directament les pàgines de convocatòria oficial de la Generalitat. */}
        <div className="flex flex-col gap-2 w-full">
          <div className="text-left w-full pl-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Link oficials
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <a 
              href="https://mossos.gencat.cat/ca/els_mossos_desquadra/acces_al_cos/Mosso_a/mosso-a-convocatoria-46-25-de-maig-de-2025/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-white/5 hover:bg-[#003c75] border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex items-center justify-between transition-all active:scale-[0.98] group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-white font-extrabold text-xs group-hover:text-amber-300 transition-colors">
                  Convocatoria 2025 (46/25) - Activa
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all animate-pulse" />
            </a>

            <a 
              href="https://mossos.gencat.cat/ca/els_mossos_desquadra/acces_al_cos/Mosso_a/mosso-a-convocatoria-46-26/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-white/5 hover:bg-[#003c75] border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex items-center justify-between transition-all active:scale-[0.98] group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-white font-extrabold text-xs group-hover:text-amber-300 transition-colors">
                  Convocatoria 2026 (46/26) - Activa
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all animate-pulse" />
            </a>
          </div>
        </div>

        {/* Explicació per a no-programadors: Etiqueta de l'Avenç Personal abans dels blocs de rendiment i progrés actuals de l'estudiant. */}
        <div className="text-left w-full pl-1 mt-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Avenç personal :
          </span>
        </div>

        {/* BLOC EXTRA NOU: ANÀLISI DETALLAT DE RENDIMENT DE PREGUNTES EN DIRECTE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-br from-[#001e3d] to-[#001124] rounded-3xl border border-white/10 p-5 shadow-xl relative overflow-hidden"
        >
          {/* Fons sensorials decoratius per a una estètica de primer nivell */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <span className="text-white font-black italic uppercase text-sm tracking-tighter block">Rendiment de Teòrica</span>
              <span className="text-white/30 text-[9px] font-semibold uppercase tracking-wider leading-none">Ràtio d'encert real per temes</span>
            </div>
          </div>

          {loadingStats ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <RefreshCw className="animate-spin text-emerald-400" size={18} />
              <span className="text-[8px] font-black uppercase tracking-widest text-white/35">Sincronitzant...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* Graella d'encerts actius i errades actives */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* targetes d'encerts actius */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 flex items-center justify-between relative overflow-hidden">
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Encerts</span>
                    <span className="text-xl font-black text-emerald-400 tracking-tighter italic leading-none mt-1">{totalEncerts}</span>
                  </div>
                  <span className="text-lg select-none">🟢</span>
                </div>

                {/* targetes d'errades actives */}
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-3 flex items-center justify-between relative overflow-hidden">
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Errades</span>
                    <span className="text-xl font-black text-red-400 tracking-tighter italic leading-none mt-1">{totalErrades}</span>
                  </div>
                  <span className="text-lg select-none">🔴</span>
                </div>

              </div>

              {/* Secció millor i pitjor tema segons ràtio de % d'encert total del contingut actiu */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                
                {/* Millor tema */}
                <div className="flex items-center justify-between gap-3 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  <div className="flex flex-col min-w-0">
                    <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Millor Tema</span>
                    <span className="text-white font-black uppercase italic tracking-tight text-[11px] truncate">
                      {millorTema ? millorTema.name : 'Per determinar'}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-emerald-400 font-black text-sm italic tracking-tighter leading-none">
                      {millorTema ? `${millorTema.percent}%` : '--'}
                    </span>
                  </div>
                </div>

                {/* Pitjor tema */}
                <div className="flex items-center justify-between gap-3 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  <div className="flex flex-col min-w-0">
                    <span className="text-red-400 text-[8px] font-black uppercase tracking-widest">Pitjor Tema</span>
                    <span className="text-white font-black uppercase italic tracking-tight text-[11px] truncate">
                      {pitjorTema ? pitjorTema.name : 'Per determinar'}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-red-400 font-black text-sm italic tracking-tighter leading-none">
                      {pitjorTema ? `${pitjorTema.percent}%` : '--'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </motion.div>
        
        {/* BLOC GLOBAL D'AVENÇ SENSE REDUNDÀNCIES VERTICALS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-[#001a33]/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 shadow-xl flex flex-col gap-4"
        >
          {/* Progrés 1: Temari Oficial */}
          <div className="flex flex-col gap-1.5 pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="text-blue-400 w-4 h-4 shrink-0" />
                <span className="text-white font-black italic uppercase text-xs tracking-tight">Temari Oficial (A, B, C)</span>
              </div>
              <span className="text-emerald-400 font-black text-sm italic tracking-tighter">{percentatgeGlobal}%</span>
            </div>
            
            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                style={{ width: `${percentatgeGlobal}%` }}
                className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500 h-full rounded-full"
              />
            </div>

            <div className="flex justify-between items-center text-[9px] text-white/50 font-bold px-1 mt-0.5">
              <span>Àmbit A: <b className="text-blue-300">{puntsA.estudiats}/{puntsA.totals}</b></span>
              <span>Àmbit B: <b className="text-blue-300">{puntsB.estudiats}/{puntsB.totals}</b></span>
              <span>Àmbit C: <b className="text-blue-300">{puntsC.estudiats}/{puntsC.totals}</b></span>
            </div>
          </div>

          {/* Progrés 2: Procés Físic */}
          <div className="flex flex-col gap-1.5 pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="text-red-400 w-4 h-4 shrink-0" />
                <span className="text-white font-black italic uppercase text-xs tracking-tight">Procés Físic (Navette i Circuit)</span>
              </div>
              <span className="text-red-400 font-black text-sm italic tracking-tighter">66%</span>
            </div>
            
            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                style={{ width: '66%' }}
                className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full"
              />
            </div>
          </div>

          {/* Progrés 3: Procés Psicotècnic */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="text-amber-400 w-4 h-4 shrink-0" />
                <span className="text-white font-black italic uppercase text-xs tracking-tight">Procés Psicotècnic</span>
              </div>
              <span className="text-amber-400 font-black text-sm italic tracking-tighter">40%</span>
            </div>
            
            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
              <div 
                style={{ width: '40%' }}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full"
              />
            </div>
          </div>

        </motion.div>

      </main>

      <footer className="mt-12 opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">OposiMossos • Sistema de Progrés</p>
      </footer>
    </div>
  );
}
