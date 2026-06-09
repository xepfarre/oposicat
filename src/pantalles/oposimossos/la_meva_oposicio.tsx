import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Target, Calendar, Brain, RefreshCw } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

        // 2. Llegim les respostes de l'usuari actual
        const respostesRef = collection(db, `usuaris/${user.uid}/respostes_preguntes`);
        const respostesSnap = await getDocs(respostesRef);

        let encertsNum = 0;
        let erradesNum = 0;

        // Mapeig on acumularem quantes preguntes té l'usuari correctament encertades per tema
        const encertatsPerTema: { [key: string]: number } = {};

        respostesSnap.docs.forEach(docSnap => {
          const d = docSnap.data();
          const esEncertada = !!d.encertada;

          // Si l'última resposta de l'usuari és correcta, es comptabilitza com un encert actiu.
          // Si és incorrecta, canvia a errada.
          if (esEncertada) {
            encertsNum++;
          } else {
            // El requeriment és: "Si falla una pregunta, sortira com una unica errada. Si la fa 3 cops i 3 cops malament, es 1 errada."
            // Com que cada document té com a ID el 'preguntaId' de Firestore, per molt que l'usuari torni a fer-la, 
            // el document s'actualitza o es sobreescriu, sumant així exactament 1 errada global, perfecte!
            erradesNum++;
          }

          // Agrupació per temes de cara al ràtio de percentatge
          if (d.ambit !== undefined && d.tema !== undefined) {
            const ambitMap: { [key: string]: number } = { A: 1, B: 2, C: 3 };
            const ambitId = ambitMap[d.ambit] || 1;
            const temaVisual = parseInt(d.tema.toString(), 10) + 1;
            const temaKey = `tema_${ambitId}.${temaVisual}`;

            if (esEncertada) {
              encertatsPerTema[temaKey] = (encertatsPerTema[temaKey] || 0) + 1;
            }
          }
        });

        setTotalEncerts(encertsNum);
        setTotalErrades(erradesNum);

        // 3. Càlcul del % d'encert de cadascun dels temes actius per resoldre quin és el millor i pitjor tema.
        // Criteri de l'estudiant: El coeficient és directament l'èxit sobre el total de preguntes del tema.
        // Exemple: tema de 2 preguntes amb 1 correcta (50%) és considerat millor que un tema de 1000 preguntes amb 100 d'encertats (10%).
        let millor: typeof millorTema = null;
        let pitjor: typeof pitjorTema = null;

        Object.keys(totalsTemes).forEach(temaKey => {
          const totalPreguntesTema = totalsTemes[temaKey] || 0;
          if (totalPreguntesTema > 0) {
            const encertatsUsuari = encertatsPerTema[temaKey] || 0;
            const percent = Number(((encertatsUsuari / totalPreguntesTema) * 100).toFixed(1));

            // Resolem el millor tema (per favor de ràtio)
            if (!millor || percent > millor.percent) {
              millor = {
                id: temaKey,
                name: formatTemaNom(temaKey),
                percent: percent,
                encertades: encertatsUsuari,
                totals: totalPreguntesTema
              };
            } else if (millor && percent === millor.percent) {
              // En cas d'empat de percentatges, mostrem el tema que contingui major densitat de volum
              if (totalPreguntesTema > millor.totals) {
                millor = {
                  id: temaKey,
                  name: formatTemaNom(temaKey),
                  percent: percent,
                  encertades: encertatsUsuari,
                  totals: totalPreguntesTema
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
                totals: totalPreguntesTema
              };
            } else if (pitjor && percent === pitjor.percent) {
              // En cas d'empat de pitjor percentatge, usem el tema que contingui més volum per ressaltar la necessitat d'estudi
              if (totalPreguntesTema > pitjor.totals) {
                pitjor = {
                  id: temaKey,
                  name: formatTemaNom(temaKey),
                  percent: percent,
                  encertades: encertatsUsuari,
                  totals: totalPreguntesTema
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

        {/* BLOC EXTRA NOU: ANÀLISI DETALLAT DE RENDIMENT DE PREGUNTES EN DIRECTE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-gradient-to-br from-[#001e3d] to-[#001124] rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Fons sensorials decoratius per a una estètica de primer nivell */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Brain size={28} />
            </div>
            <div>
              <span className="text-white font-black italic uppercase text-base tracking-tighter block">Rendiment de Teòrica</span>
              <span className="text-white/30 text-[10px] font-black uppercase tracking-widest leading-none">Càlcul matemàtic d'encert per temes</span>
            </div>
          </div>

          {loadingStats ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw className="animate-spin text-emerald-400" size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/35">Sincronitzant analítica...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              
              {/* Graella d'encerts actius i errades actives */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* targetes d'encerts actius */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-5 flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Encerts Actius</span>
                  <span className="text-3xl font-black text-emerald-400 tracking-tighter italic leading-none">{totalEncerts}</span>
                  <p className="text-[8px] text-white/50 leading-normal mt-1">Preguntes que mantens encertades actualment.</p>
                </div>

                {/* targetes d'errades actives */}
                <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-5 flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Errades Actives</span>
                  <span className="text-3xl font-black text-red-400 tracking-tighter italic leading-none">{totalErrades}</span>
                  <p className="text-[8px] text-white/50 leading-normal mt-1">Preguntes fallades. Fins i tot fent-ne 3 cops compta com 1.</p>
                </div>

              </div>

              {/* Secció millor i pitjor tema segons ràtio de % d'encert total del contingut actiu */}
              <div className="flex flex-col gap-3.5 border-t border-white/5 pt-5">
                
                {/* Millor tema */}
                <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col min-w-0">
                    <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">Millor Tema</span>
                    <span className="text-white font-black uppercase italic tracking-tight truncate mt-0.5">
                      {millorTema ? millorTema.name : 'Tema per determinar'}
                    </span>
                    <span className="text-[9px] text-white/40 font-bold mt-0.5">
                      {millorTema ? `${millorTema.encertades} de ${millorTema.totals} respostes correctes` : 'Realitza un simulacre de test primer'}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-emerald-400 font-black text-xl italic tracking-tighter block leading-none">
                      {millorTema ? `${millorTema.percent}%` : '--'}
                    </span>
                    <span className="text-[7px] text-white/20 uppercase font-black tracking-widest block mt-0.5">ÈXIT TEMA</span>
                  </div>
                </div>

                {/* Pitjor tema */}
                <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col min-w-0">
                    <span className="text-red-400 text-[8px] font-black uppercase tracking-widest">Pitjor Tema</span>
                    <span className="text-white font-black uppercase italic tracking-tight truncate mt-0.5">
                      {pitjorTema ? pitjorTema.name : 'Tema per determinar'}
                    </span>
                    <span className="text-[9px] text-white/40 font-bold mt-0.5">
                      {pitjorTema ? `${pitjorTema.encertades} de ${pitjorTema.totals} respostes correctes` : 'Tots els temes estan al dia o per iniciar'}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-red-400 font-black text-xl italic tracking-tighter block leading-none">
                      {pitjorTema ? `${pitjorTema.percent}%` : '--'}
                    </span>
                    <span className="text-[7px] text-white/20 uppercase font-black tracking-widest block mt-0.5">ÈXIT TEMA</span>
                  </div>
                </div>

              </div>

              {!millorTema && (
                <div className="text-center bg-white/5 border border-dashed border-white/10 rounded-2xl p-4">
                  <p className="text-[8px] font-bold text-white/40 leading-relaxed uppercase tracking-wider">
                    Dóna d'alta respostes fent els qüestionaris del simulador d'examen per activar les mètriques en temps real!
                  </p>
                </div>
              )}

            </div>
          )}
        </motion.div>
        
        {/* BLOC 1: PROGRÉS DEL TEMARI */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-[#001a33]/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center">
                <BookOpen className="text-blue-400" size={28} />
              </div>
              <div>
                <span className="text-white font-black italic uppercase text-base tracking-tighter block">Temari Oficial</span>
                <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Àmbits A, B i C</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-black text-3xl italic tracking-tighter">{percentatgeGlobal}%</span>
            </div>
          </div>
          
          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentatgeGlobal}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            />
          </div>

          <div className="flex flex-col gap-3 mb-8">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Àmbit A:</span>
              <span className="text-xs font-black italic text-white uppercase"><span className="text-emerald-400">{puntsA.estudiats}</span>/{puntsA.totals} Punts</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Àmbit B:</span>
              <span className="text-xs font-black italic text-white uppercase"><span className="text-emerald-400">{puntsB.estudiats}</span>/{puntsB.totals} Punts</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Àmbit C:</span>
              <span className="text-xs font-black italic text-white uppercase"><span className="text-emerald-400">{puntsC.estudiats}</span>/{puntsC.totals} Punts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-center">
              Més informació
            </button>
            <button className="py-5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 text-center">
              Ajuda'm a millorar
            </button>
          </div>
        </motion.div>

        {/* BLOC 2: PROCÉS FÍSIC */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full bg-[#001a33]/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center">
                <Target className="text-red-400" size={28} />
              </div>
              <div>
                <span className="text-white font-black italic uppercase text-base tracking-tighter block">Procés Físic</span>
                <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Circuit, Navette, Banca</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-blue-400 font-black text-3xl italic tracking-tighter">66%</span>
            </div>
          </div>
          
          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '66%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-red-500 to-blue-500 h-full rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            />
          </div>

          <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
            Més informació
          </button>
        </motion.div>

        {/* BLOC 3: PROCÉS PSICOTÈCNIC */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-[#001a33]/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center">
                <Calendar className="text-amber-400" size={28} />
              </div>
              <div>
                <span className="text-white font-black italic uppercase text-base tracking-tighter block">Procés Psicotècnic</span>
                <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Raoament i Personalitat</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-black text-3xl italic tracking-tighter">40%</span>
            </div>
          </div>
          
          <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/5 mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '40%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-amber-400 to-amber-700 h-full rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            />
          </div>

          <button className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-white/60 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
            Més informació
          </button>
        </motion.div>

      </main>

      <footer className="mt-12 opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">OposiMossos • Sistema de Progrés</p>
      </footer>
    </div>
  );
}
