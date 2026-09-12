// Explicació per a no-programadors:
// Aquest fitxer és el component encarregat de l'apartat:
// "Psicotècnica" -> "Entrevistes personals" -> "1- Entrevista" -> "5- Veure Biodata".
// Permet als professors i avaluadors visualitzar en mode només lectura els resultats
// i qualificacions de les competències clau obtingudes per l'alumne seleccionat als Tests Competencials.
// Mostra un selector entre:
// 1. Test Competencial - 1 (Actiu i clicable, que carrega el darrer examen de 80 preguntes fet per l'aspirant).
// 2. Test Competencial - 2 (En gris, pendent de donar d'alta).
// 3. Test Competencial - 3 (En gris, pendent de donar d'alta).

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Brain, Award, AlertTriangle, CheckCircle2, ShieldAlert,
  Calendar, RefreshCw, BarChart3, Lock, ChevronRight, Info, User,
  CheckCircle, Target, Sparkles, HelpCircle, FileCheck
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { MAP_COMPETENCIES } from '../oposimossos/prova_psicologica/preguntes_biodata';

interface VisualitzacioBiodataAlumneProps {
  darkMode: boolean;
  alumne: any;
  onTornar: () => void;
}

export default function VisualitzacioBiodataAlumne({
  darkMode,
  alumne,
  onTornar
}: VisualitzacioBiodataAlumneProps) {

  const nomAlumne = alumne?.nom || alumne?.displayName || alumne?.email || 'Alumne seleccionat';
  const alumneId = alumne?.id || alumne?.uid || '';

  // Estat per al test seleccionat: per defecte 'test_1'
  const [testSeleccionat, setTestSeleccionat] = useState<'test_1' | 'test_2' | 'test_3'>('test_1');

  // Estats per a les dades del Test 1
  const [carregant, setCarregant] = useState<boolean>(true);
  const [dadesBiodata, setDadesBiodata] = useState<any | null>(null);
  const [errorCarrega, setErrorCarrega] = useState<string | null>(null);

  // =========================================================================
  // 1. CARREGAR EL DARRER TEST COMPETENCIAL DE L'ALUMNE
  // =========================================================================
  // Comentari per a no-programadors:
  // Anem a la col·lecció 'resultats_biodata' de l'alumne i n'extraiem el darrer examen completat.
  const carregarDarrerTest = async () => {
    if (!alumneId) {
      setCarregant(false);
      return;
    }

    setCarregant(true);
    setErrorCarrega(null);

    try {
      if (db) {
        // Cercar a la subcol·lecció de resultats de biodata de l'usuari
        const q = query(
          collection(db, `usuaris/${alumneId}/resultats_biodata`),
          orderBy('creatEl', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
          const docData = snap.docs[0].data();
          setDadesBiodata({
            id: snap.docs[0].id,
            ...docData
          });
        } else {
          // Comprovem si les dades venien incrustades a la fitxa de l'alumne
          if (alumne.biodataResults || alumne.resultatsBiodata || alumne.resultats_biodata) {
            setDadesBiodata(alumne.biodataResults || alumne.resultatsBiodata || alumne.resultats_biodata);
          } else {
            setDadesBiodata(null);
          }
        }
      }
    } catch (err: any) {
      console.error("Error carregant el test competencial de l'alumne:", err);
      setErrorCarrega("No s'ha pogut carregar el resultat del test competencial.");
    } finally {
      setCarregant(false);
    }
  };

  useEffect(() => {
    carregarDarrerTest();
  }, [alumneId]);

  // =========================================================================
  // 2. CÀLCUL I DIAGNÒSTIC COMPETENCIAL DEL TEST 1
  // =========================================================================
  const resultatsNotes = dadesBiodata?.resultats || [];
  const teResultats = Array.isArray(resultatsNotes) && resultatsNotes.length > 0;

  // Càlcul de competències crítiques (< 5.0) i perfectes (10.0)
  const competenciesSotaPerfil = MAP_COMPETENCIES.filter((_, idx) => (resultatsNotes[idx] || 0) < 5.0);
  const perfectesDe10 = MAP_COMPETENCIES.filter((_, idx) => (resultatsNotes[idx] || 0) === 10.0);

  // Nota mitjana global sobre 10
  const notaMitjana = teResultats 
    ? (resultatsNotes.reduce((acc: number, n: number) => acc + (n || 0), 0) / resultatsNotes.length).toFixed(1)
    : null;

  // Formatador de la data de lliurament de l'examen
  let dataLliuramentFormatada = 'Sense data';
  if (dadesBiodata?.creatEl) {
    try {
      dataLliuramentFormatada = new Date(dadesBiodata.creatEl).toLocaleString('ca-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (_) {
      dataLliuramentFormatada = String(dadesBiodata.creatEl);
    }
  }

  // Càlcul del veredicte pedagògic
  let veredicteTipus = 'APTE';
  let veredicteTitol = "PERFIL APTE I EQUILIBRAT";
  let veredicteDescripcio = "L'aspirant presenta un perfil competencial adient amb el patró policial requerit pel cos de Mossos d'Esquadra, sense línies vermelles destacades.";
  let veredicteBadge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

  if (competenciesSotaPerfil.length > 0) {
    veredicteTipus = 'NO_APTE';
    veredicteTitol = `NO APTE - ${competenciesSotaPerfil.length} COMPETÈNCIES PER SOTA DE 5.0`;
    veredicteDescripcio = `S'han detectat puntuacions crítiques per sota del llindar mínim a: ${competenciesSotaPerfil.map(c => c.nomCurt).join(', ')}. Cal incidir en aquests punts a l'entrevista.`;
    veredicteBadge = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  } else if (perfectesDe10.length > 6) {
    veredicteTipus = 'INCOHERENT';
    veredicteTitol = "ALERTA DE DESITJABILITAT SOCIAL (PERFECCIONISME EXTREM)";
    veredicteDescripcio = "S'han registrat més de 6 competències amb una nota de 10.0 exacta. L'aspirant ha intentat respondre el que 'queda bé' en lloc de ser sincer, fet que el tribunal detecta fàcilment.";
    veredicteBadge = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  }

  return (
    <div className={`w-full flex flex-col gap-6 transition-colors duration-200 ${
      darkMode ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* ========================================================================= */}
      {/* CAPÇALERA SUPERIOR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onTornar}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Tornar enrere"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white flex items-center gap-1">
                <Brain className="w-3 h-3" />
                5- Veure Biodata
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Mode només lectura
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1">
              Resultats del Biodata de {nomAlumne}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualitza les competències clau, qualificacions i diagnòstic psicotècnic dels tests competencials.
            </p>
          </div>
        </div>

        {/* BOTÓ DE REFRESCA */}
        <div className="flex items-center gap-2">
          <button
            onClick={carregarDarrerTest}
            disabled={carregant}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${carregant ? 'animate-spin text-purple-500' : ''}`} />
            <span>Actualitzar</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SELECTOR DE TESTS COMPETENCIALS (1, 2, 3) */}
      {/* ========================================================================= */}
      {/* Comentari per a no-programadors:
          Aquí mostrem els 3 botons del test. El 1 és clicable i actiu.
          El 2 i el 3 estan en gris i deshabilitats perquè són exàmens diferents pendents de donar d'alta. */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Selecciona el Test Competencial:
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* BOTÓ 1: TEST COMPETENCIAL - 1 (ACTIU) */}
          <button
            type="button"
            onClick={() => setTestSeleccionat('test_1')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden ${
              testSeleccionat === 'test_1'
                ? darkMode
                  ? 'bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/10'
                  : 'bg-purple-50/80 border-purple-500 shadow-sm shadow-purple-500/10'
                : darkMode
                  ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                testSeleccionat === 'test_1'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                Disponible
              </span>
              <FileCheck className={`w-4 h-4 ${testSeleccionat === 'test_1' ? 'text-purple-500' : 'text-slate-400'}`} />
            </div>
            
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Test Competencial - 1
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulacre oficial de 80 preguntes
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold">
              <span className="text-purple-600 dark:text-purple-400">
                {teResultats ? `Nota: ${notaMitjana} / 10` : 'Pendent de realitzar'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>

          {/* BOTÓ 2: TEST COMPETENCIAL - 2 (DESACTIVAT EN GRIS) */}
          <div
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 opacity-60 cursor-not-allowed select-none ${
              darkMode ? 'bg-slate-800/30 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Pendent d'alta
              </span>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            
            <div>
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">
                Test Competencial - 2
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Examen en fase de preparació
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-medium text-slate-400">
              <span>Properament disponible</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* BOTÓ 3: TEST COMPETENCIAL - 3 (DESACTIVAT EN GRIS) */}
          <div
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 opacity-60 cursor-not-allowed select-none ${
              darkMode ? 'bg-slate-800/30 border-slate-800 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Pendent d'alta
              </span>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            
            <div>
              <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">
                Test Competencial - 3
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Examen en fase de preparació
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] font-medium text-slate-400">
              <span>Properament disponible</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTINGUT DETALLAT DEL TEST COMPETENCIAL - 1 */}
      {/* ========================================================================= */}
      {carregant ? (
        <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
          <span>Carregant resultats de les 10 competències clau...</span>
        </div>
      ) : !teResultats ? (
        /* ESTAT QUAN L'ALUMNE ENCARA NO HA COMPLETAT EL TEST DE 80 PREGUNTES */
        <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center gap-4 ${
          darkMode ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
            <Brain className="w-7 h-7" />
          </div>
          <div className="flex flex-col max-w-md">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              L'alumne encara no ha completat el Test Competencial - 1
            </h3>
            <p className="text-xs mt-1 leading-relaxed">
              En aquest apartat es mostraran les notes de les <strong>10 competències clau</strong> i el perfil psicotècnic tan bon punt l'aspirant hagi realitzat el qüestionari complet de <strong>80 preguntes</strong> des de la seva àrea d'estudiant.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-600/20">
            Total preguntes requerides: 80 preguntes competencials
          </div>
        </div>
      ) : (
        /* VISTA DE RESULTATS I QUALIFICACIONS DE LES COMPETÈNCIES */
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {/* TARGETA RESUM DE DIAGNÒSTIC I NOTA MITJANA */}
          <div className={`p-6 rounded-3xl border ${veredicteBadge} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center shrink-0">
                {veredicteTipus === 'APTE' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : veredicteTipus === 'NO_APTE' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black/10 rounded-md">
                    {veredicteTipus}
                  </span>
                  <span className="text-xs font-bold opacity-80">
                    Realitzat el: {dataLliuramentFormatada}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight mt-1">
                  {veredicteTitol}
                </h3>
                <p className="text-xs opacity-90 mt-1 max-w-2xl leading-relaxed">
                  {veredicteDescripcio}
                </p>
              </div>
            </div>

            {/* NOTA MITJANA GLOBAL */}
            <div className="px-6 py-4 rounded-2xl bg-black/10 text-center shrink-0 self-stretch sm:self-auto flex sm:flex-col items-center justify-between sm:justify-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                Nota Mitjana
              </span>
              <div className="text-3xl font-black font-mono">
                {notaMitjana} <span className="text-sm opacity-60">/ 10</span>
              </div>
              <span className="text-[10px] font-bold opacity-75">
                80 de 80 preguntes
              </span>
            </div>
          </div>

          {/* REIXA DE LES 10 COMPETÈNCIES CLAU */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>Avaluació per Competència (10 Competències Clau):</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Puntuació mínima d'aptitud: 5.0 / 10
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MAP_COMPETENCIES.map((comp, idx) => {
                const nota = resultatsNotes[idx] !== undefined ? resultatsNotes[idx] : 0;
                const esSotaPerfil = nota < 5.0;
                const esPerfecte = nota === 10.0;

                let colorText = "text-emerald-500 dark:text-emerald-400";
                let colorBarra = "bg-emerald-500";
                let badgeEstat = "Aprovat";
                let badgeEstil = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

                if (esSotaPerfil) {
                  colorText = "text-rose-500 dark:text-rose-400";
                  colorBarra = "bg-rose-500";
                  badgeEstat = "Línia vermella (< 5.0)";
                  badgeEstil = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                } else if (esPerfecte) {
                  colorText = "text-amber-500 dark:text-amber-400";
                  colorBarra = "bg-amber-500";
                  badgeEstat = "Perfecció (10.0)";
                  badgeEstil = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                }

                return (
                  <div
                    key={comp.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3.5 transition-all shadow-sm ${
                      darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* ENCAPÇALAMENT DE LA COMPETÈNCIA */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-purple-600/10 text-purple-600 dark:text-purple-400">
                            {comp.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${badgeEstil}`}>
                            {badgeEstat}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1 leading-snug">
                          {comp.nom}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {comp.descripcio}
                        </p>
                      </div>

                      {/* NOTA NUMÈRICA */}
                      <div className="text-right shrink-0">
                        <div className={`text-xl font-black font-mono leading-none ${colorText}`}>
                          {nota.toFixed(1)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          sobre 10
                        </span>
                      </div>
                    </div>

                    {/* BARRA DE PROGRÉS */}
                    <div className="flex flex-col gap-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-700/60 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${colorBarra}`}
                          style={{ width: `${Math.min(100, Math.max(0, nota * 10))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>0.0</span>
                        <span className="font-bold text-slate-500">Llindar mínim: 5.0</span>
                        <span>10.0</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
