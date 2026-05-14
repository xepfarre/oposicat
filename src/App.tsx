import { useState } from 'react';
import Pantalla_Inici from './pantalles/pantalla_inici';
import OposiMossosInici from './pantalles/oposimossos/oposi_mossos_inici';
import ProvaTeoricaInici from './pantalles/oposimossos/prova_teorica/prova_teorica_inici';
import ExamenTeoricInici from './pantalles/oposimossos/prova_teorica/examen_teoric/examen_teoric_inici';
import EmCostaEstudiarInici from './pantalles/oposimossos/prova_teorica/em_costa_estudiar_inici';
import ProvaFisicaInici from './pantalles/oposimossos/prova_practica/prova_fisica_inici';
import ProvaPsicologicaInici from './pantalles/oposimossos/prova_psicologica/prova_psicologica_inici';
import TemariOficialInici from './pantalles/oposimossos/prova_teorica/temari_oficial_inici';
import TemariAmbitA from './pantalles/oposimossos/prova_teorica/temari_oficial/ambit_a';
import TemariAmbitB from './pantalles/oposimossos/prova_teorica/temari_oficial/ambit_b';
import TemariAmbitC from './pantalles/oposimossos/prova_teorica/temari_oficial/ambit_c';
import DetallTemaGeneric from './pantalles/oposimossos/prova_teorica/temari_oficial/detall_tema_generic';
import LectorContingut from './pantalles/oposimossos/prova_teorica/temari_oficial/lector_contingut';

// Temari Oposimossos (Resums)
import TemariOposimossosInici from './pantalles/oposimossos/prova_teorica/temari_oposimossos_inici';
import OposiAmbitA from './pantalles/oposimossos/prova_teorica/temari_oposimossos/ambit_a';
import OposiAmbitB from './pantalles/oposimossos/prova_teorica/temari_oposimossos/ambit_b';
import OposiAmbitC from './pantalles/oposimossos/prova_teorica/temari_oposimossos/ambit_c';
import DetallTemaOposimossos from './pantalles/oposimossos/prova_teorica/temari_oposimossos/detall_tema_generic';
import LectorOposimossos from './pantalles/oposimossos/prova_teorica/temari_oposimossos/lector_contingut';

import ClassesPremiumInici from './pantalles/oposimossos/prova_teorica/examen_teoric/classes_premium_inici';
import ClaseLuna from './pantalles/oposimossos/prova_teorica/examen_teoric/clase_luna';
import ClassesDirecteInici from './pantalles/oposimossos/prova_teorica/examen_teoric/classes_directe_inici';
import ExamensOficialsPassatsInici from './pantalles/oposimossos/prova_teorica/examen_teoric/examens_oficials_passats_inici';
import ExamensOposimossosInici from './pantalles/oposimossos/prova_teorica/examen_teoric/examens_oposimossos_inici';
import ExamenSimuladorMossos from './pantalles/oposimossos/prova_teorica/examen_teoric/examen_simulador_mossos';
import ExamenPsicotecnicInici from './pantalles/oposimossos/prova_teorica/examen_psicotecnic_inici';
import ActualitatInici from './pantalles/oposimossos/prova_teorica/actualitat_inici';
import AdminPanel from './pantalles/admin/AdminPanel';
import AdminLogin from './pantalles/admin/AdminLogin';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import { TEMARI_DETALL } from './constants/temari';
import { CONTINGUT_TEMARI_TEXTS } from './constants/contingut_textos';
// @ts-ignore
import LaMevaOposicio from './pantalles/oposimossos/la_meva_oposicio';

/**
 * COMPONENT PRINCIPAL: App
 * Gestiona la navegació entre les diferents pantalles de l'aplicació OposiCAT.
 */
export default function App() {
  // Estat per saber quina pantalla estem mostrant
  type Pantalla = 'inici' | 'mossos' | 'prova_teorica' | 'prova_practica' | 'prova_psicologica' | 'examen_teoric' | 'em_costa_estudiar' | 'la_meva_oposicio' | 
    'temari_oficial' | 'temari_ambit_a' | 'temari_ambit_b' | 'temari_ambit_c' | 'detall_tema' | 'lector_contingut' |
    'temari_oposimossos' | 'temari_oposimossos_ambit_a' | 'temari_oposimossos_ambit_b' | 'temari_oposimossos_ambit_c' | 'detall_tema_oposimossos' | 'lector_contingut_oposimossos' |
    'classes_premium' | 'clase_luna' | 'classes_directe' | 'examens_oficials_passats' | 'examen_psicotecnic' | 'actualitat' | 'examens_oposimossos' | 'examens_oposimossos_simulador';
  const [pantalla, setPantalla] = useState<Pantalla>('inici');
  
  // Estats per al Backoffice
  const [mode, setMode] = useState<'app' | 'admin'>('app');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);
  
  // Estat per a la configuració del simulador
  const [simuladorConfig, setSimuladorConfig] = useState<{ 
    num: number, 
    temps: string, 
    seleccions: { [key: string]: number[] } 
  }>({ 
    num: 30, 
    temps: '45', 
    seleccions: { A: [], B: [], C: [] } 
  });
  
  // Estat per a la classe premium seleccionada
  const [classeSeleccionada, setClasseSeleccionada] = useState<{ bloc: string, tema: string, subtema: string } | null>(null);
  
  // Estat per saber quin tema estem visualitzant en detall
  const [temaSeleccionat, setTemaSeleccionat] = useState<{ ambit: 'A' | 'B' | 'C', index: number } | null>(null);
  const [subtemaSeleccionat, setSubtemaSeleccionat] = useState<number | null>(null);

  // Estat global del progrés de lectura (Arquitectura de Lego: dades a dalt de tot)
  const [progres, setProgres] = useState({
    A: Array(7).fill(false), // 7 temes a l'Àmbit A
    B: Array(8).fill(false), // 8 temes a l'Àmbit B
    C: Array(5).fill(false), // 5 temes a l'Àmbit C
    detall: {
      A: {
        0: Array(9).fill(false), // A.1: 9 punts (Història I)
        1: Array(8).fill(false), // A.2: 8 punts (Història II)
        2: Array(5).fill(false), // A.3: 5 punts (Policia)
        3: Array(4).fill(false), // A.4: 4 punts (Sociolingüística)
        4: Array(6).fill(false), // A.5: 6 punts (Geografia)
        5: Array(5).fill(false), // A.6: 5 punts (Entorn Social)
        6: Array(5).fill(false), // A.7: 5 punts (TIC)
      },
      B: {
        0: Array(5).fill(false), // B.1: 5 punts
        1: Array(5).fill(false), // B.2: 5 punts
        2: Array(6).fill(false), // B.3: 6 punts
        3: Array(8).fill(false), // B.4: 8 punts
        4: Array(4).fill(false), // B.5: 4 punts
        5: Array(4).fill(false), // B.6: 4 punts
        6: Array(7).fill(false), // B.7: 7 punts
        7: Array(3).fill(false), // B.8: 3 punts
      },
      C: {
        0: Array(2).fill(false), // C.1: 2 punts
        1: Array(8).fill(false), // C.2: 8 punts
        2: Array(5).fill(false), // C.3: 5 punts
        3: Array(3).fill(false), // C.4: 3 punts
        4: Array(3).fill(false), // C.5: 3 punts
      }
    },
    // Nou magatzem per als textos subratllats (HTML)
    contingutPersonalitzat: {} as Record<string, string>,
    // Progrés específic pel Temari d'Oposimossos (Resums)
    oposimossos: {
      A: Array(7).fill(false),
      B: Array(8).fill(false),
      C: Array(5).fill(false),
      detall: {
        A: {
          0: Array(9).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(4).fill(false), 4: Array(6).fill(false), 5: Array(5).fill(false), 6: Array(5).fill(false),
        },
        B: {
          0: Array(5).fill(false), 1: Array(5).fill(false), 2: Array(6).fill(false), 3: Array(8).fill(false), 4: Array(4).fill(false), 5: Array(4).fill(false), 6: Array(7).fill(false), 7: Array(3).fill(false),
        },
        C: {
          0: Array(2).fill(false), 1: Array(8).fill(false), 2: Array(5).fill(false), 3: Array(3).fill(false), 4: Array(3).fill(false),
        }
      }
    }
  });

  // Funció per guardar el contingut HTML personalitzat d'un subtema
  const guardarContingutPersonalitzat = (ambit: string, temaIdx: number, subtemaIdx: number, html: string) => {
    const clau = `${ambit}-${temaIdx}-${subtemaIdx}`;
    setProgres(prev => ({
      ...prev,
      contingutPersonalitzat: {
        ...prev.contingutPersonalitzat,
        [clau]: html
      }
    }));
  };

  // Funció per marcar un subtema com a llegit/no llegit (ARA ADREÇAT A AMBDÓS TEMARIS)
  const toggleSubtemaLlegit = (ambit: 'A' | 'B' | 'C', temaIndex: number, subIndex: number, tipus: 'oficial' | 'oposimossos' = 'oficial') => {
    setProgres(prev => {
      if (tipus === 'oficial') {
        const nouSub = [...prev.detall[ambit][temaIndex]];
        nouSub[subIndex] = !nouSub[subIndex];
        return {
          ...prev,
          detall: { ...prev.detall, [ambit]: { ...prev.detall[ambit], [temaIndex]: nouSub } }
        };
      } else {
        // @ts-ignore
        const nouSub = [...prev.oposimossos.detall[ambit][temaIndex]];
        nouSub[subIndex] = !nouSub[subIndex];
        return {
          ...prev,
          oposimossos: {
            ...prev.oposimossos,
            detall: {
              ...prev.oposimossos.detall,
              [ambit]: {
                // @ts-ignore
                ...prev.oposimossos.detall[ambit],
                [temaIndex]: nouSub
              }
            }
          }
        };
      }
    });
  };

  const toggleTemaLlegit = (ambit: 'A' | 'B' | 'C', index: number, tipus: 'oficial' | 'oposimossos' = 'oficial') => {
    setProgres(prev => {
      if (tipus === 'oficial') {
        const nouAmbit = [...prev[ambit]];
        nouAmbit[index] = !nouAmbit[index];
        return { ...prev, [ambit]: nouAmbit };
      } else {
        const nouAmbit = [...prev.oposimossos[ambit]];
        nouAmbit[index] = !nouAmbit[index];
        return {
          ...prev,
          oposimossos: { ...prev.oposimossos, [ambit]: nouAmbit }
        };
      }
    });
  };

  const handleEntrar = (nom: string) => {
    if (nom === "Mossos") setPantalla('mossos');
    else console.log(`Pendent d'implementar la secció: ${nom}`);
  };

  const handleTornarInici = () => setPantalla('inici');
  const handleAnarTeorica = () => setPantalla('prova_teorica');
  const handleAnarExamenTeoric = () => setPantalla('examen_teoric');
  const handleAnarEmCostaEstudiar = () => setPantalla('em_costa_estudiar');
  const handleAnarPractica = () => setPantalla('prova_practica');
  const handleAnarPsicologica = () => setPantalla('prova_psicologica');
  const handleAnarTemariOficial = () => setPantalla('temari_oficial');
  const handleAnarTemariOposimossos = () => setPantalla('temari_oposimossos');
  const handleAnarClassesPremium = () => setPantalla('classes_premium');
  const handleAnarClassesDirecte = () => setPantalla('classes_directe');
  const handleAnarExamensOficialsPassats = () => setPantalla('examens_oficials_passats');
  const handleAnarExamensOposimossos = () => setPantalla('examens_oposimossos');
  const handleComencarSimulador = (num: number, temps: string, seleccions: { [key: string]: number[] }) => {
    setSimuladorConfig({ num, temps, seleccions });
    setPantalla('examens_oposimossos_simulador');
  };

  const handleAnarTemariAmbitA = () => setPantalla('temari_ambit_a');
  const handleAnarTemariAmbitB = () => setPantalla('temari_ambit_b');
  const handleAnarTemariAmbitC = () => setPantalla('temari_ambit_c');
  
  const handleAnarOposiAmbitA = () => setPantalla('temari_oposimossos_ambit_a');
  const handleAnarOposiAmbitB = () => setPantalla('temari_oposimossos_ambit_b');
  const handleAnarOposiAmbitC = () => setPantalla('temari_oposimossos_ambit_c');
  const handleAnarExamenPsicotecnic = () => setPantalla('examen_psicotecnic');
  const handleAnarActualitat = () => setPantalla('actualitat');

  const handleSeleccionarTema = (ambit: 'A' | 'B' | 'C', index: number, tipus: 'oficial' | 'oposimossos' = 'oficial') => {
    setTemaSeleccionat({ ambit, index });
    setPantalla(tipus === 'oficial' ? 'detall_tema' : 'detall_tema_oposimossos');
  };

  const handleSeleccionarSubtema = (index: number, tipus: 'oficial' | 'oposimossos' = 'oficial') => {
    setSubtemaSeleccionat(index);
    setPantalla(tipus === 'oficial' ? 'lector_contingut' : 'lector_contingut_oposimossos');
  };

  const handleTornarDeLector = () => {
    if (pantalla === 'lector_contingut') setPantalla('detall_tema');
    else setPantalla('detall_tema_oposimossos');
    setSubtemaSeleccionat(null);
  };

  const handleTornarDeDetall = () => {
    const isOposi = pantalla === 'detall_tema_oposimossos';
    if (temaSeleccionat?.ambit === 'A') setPantalla(isOposi ? 'temari_oposimossos_ambit_a' : 'temari_ambit_a');
    else if (temaSeleccionat?.ambit === 'B') setPantalla(isOposi ? 'temari_oposimossos_ambit_b' : 'temari_ambit_b');
    else setPantalla(isOposi ? 'temari_oposimossos_ambit_c' : 'temari_ambit_c');
    setTemaSeleccionat(null);
  };

  const handleTornarMossos = () => setPantalla('mossos');
  const handleAnarLaMevaOposicio = () => setPantalla('la_meva_oposicio');

  // Gestió Backoffice
  const handleSortirBackoffice = () => window.location.href = "/";

  return (
    <Routes>
      {/* RUTA DE GESTIÓ: Backoffice Web (Bypass temporal segons petició) */}
      <Route path="/admin/*" element={<AdminPanel onExit={handleSortirBackoffice} />} />

      {/* RUTA DE L'APP: Experiència d'usuari (actual) */}
      <Route path="*" element={
        <div className="contents">
          {pantalla === 'inici' && (
            <Pantalla_Inici onEntrar={handleEntrar} onAdminClick={() => window.location.href = "/admin"} />
          )}
          
          {pantalla === 'mossos' && (
            <OposiMossosInici 
              onTornar={handleTornarInici} 
              onProvaTeorica={handleAnarTeorica}
              onProvaPractica={handleAnarPractica}
              onProvaPsicologica={handleAnarPsicologica}
              onLaMevaOposicio={handleAnarLaMevaOposicio}
            />
          )}

          {pantalla === 'prova_teorica' && (
            <ProvaTeoricaInici 
              onTornar={handleTornarMossos} 
              onExamenTeoric={handleAnarExamenTeoric}
              onExamenPsicotecnic={handleAnarExamenPsicotecnic}
              onActualitat={handleAnarActualitat}
              onEmCostaEstudiar={handleAnarEmCostaEstudiar}
            />
          )}

          {pantalla === 'temari_oficial' && (
            <TemariOficialInici 
              onTornar={handleAnarExamenTeoric} 
              onAmbitA={handleAnarTemariAmbitA}
              onAmbitB={handleAnarTemariAmbitB}
              onAmbitC={handleAnarTemariAmbitC}
              progres={progres}
            />
          )}

          {pantalla === 'temari_ambit_a' && (
            <TemariAmbitA 
              onTornar={handleAnarTemariOficial} 
              onTemaSeleccionat={(i) => handleSeleccionarTema('A', i)}
              progres={progres.A}
              progresDetallat={progres.detall.A}
              onToggle={(i) => toggleTemaLlegit('A', i)}
            />
          )}

          {pantalla === 'temari_ambit_b' && (
            <TemariAmbitB 
              onTornar={handleAnarTemariOficial} 
              onTemaSeleccionat={(i) => handleSeleccionarTema('B', i)}
              progres={progres.B}
              progresDetallat={progres.detall.B}
              onToggle={(i) => toggleTemaLlegit('B', i)}
            />
          )}

          {pantalla === 'temari_ambit_c' && (
            <TemariAmbitC 
              onTornar={handleAnarTemariOficial} 
              onTemaSeleccionat={(i) => handleSeleccionarTema('C', i)}
              progres={progres.C}
              progresDetallat={progres.detall.C}
              onToggle={(i) => toggleTemaLlegit('C', i)}
            />
          )}

          {pantalla === 'detall_tema' && temaSeleccionat && (
            <DetallTemaGeneric 
              titol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].titol}
              ambit={temaSeleccionat.ambit}
              subtemes={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].subtemes}
              progres={progres.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A]}
              onTornar={handleTornarDeDetall}
              onToggle={(subIdx) => toggleSubtemaLlegit(temaSeleccionat.ambit, temaSeleccionat.index, subIdx)}
              onSubtemaClick={(subIdx) => handleSeleccionarSubtema(subIdx)}
            />
          )}

          {pantalla === 'lector_contingut' && temaSeleccionat && subtemaSeleccionat !== null && (
            <LectorContingut 
              titol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].subtemes[subtemaSeleccionat]}
              subtitol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].titol}
              index={subtemaSeleccionat + 1}
              contingutOriginal={CONTINGUT_TEMARI_TEXTS[temaSeleccionat.ambit]?.[temaSeleccionat.index]?.[subtemaSeleccionat] || ""}
              contingutDesat={progres.contingutPersonalitzat[`${temaSeleccionat.ambit}-${temaSeleccionat.index}-${subtemaSeleccionat}`]}
              completat={progres.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A][subtemaSeleccionat]}
              onTornar={handleTornarDeLector}
              onGuardarContingut={(html) => guardarContingutPersonalitzat(temaSeleccionat.ambit, temaSeleccionat.index, subtemaSeleccionat, html)}
              onMarcarCompletat={() => {
                if (!progres.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A][subtemaSeleccionat]) {
                  toggleSubtemaLlegit(temaSeleccionat.ambit, temaSeleccionat.index, subtemaSeleccionat);
                }
              }}
            />
          )}

          {pantalla === 'examen_teoric' && (
            <ExamenTeoricInici 
              onTornar={handleAnarTeorica} 
              onTemariOficial={handleAnarTemariOficial}
              onTemariOposimossos={handleAnarTemariOposimossos}
              onClassesPremium={handleAnarClassesPremium}
              onClassesDirecte={handleAnarClassesDirecte}
              onExamensOficialsPassats={handleAnarExamensOficialsPassats}
              onExamensOposimossos={handleAnarExamensOposimossos}
            />
          )}

          {pantalla === 'examens_oposimossos' && (
            <ExamensOposimossosInici 
              onTornar={handleAnarExamenTeoric} 
              onComencar={handleComencarSimulador}
            />
          )}

          {pantalla === 'examens_oposimossos_simulador' && (
            <ExamenSimuladorMossos 
              onTornar={handleAnarExamensOposimossos}
              numPreguntes={simuladorConfig.num}
              temps={simuladorConfig.temps}
              seleccions={simuladorConfig.seleccions}
            />
          )}

          {pantalla === 'classes_premium' && (
            <ClassesPremiumInici 
              onTornar={handleAnarExamenTeoric} 
              onSeleccionarClasse={(classeInfo) => {
                setClasseSeleccionada(classeInfo);
                setPantalla('clase_luna');
              }}
            />
          )}

          {pantalla === 'clase_luna' && classeSeleccionada && (
            <ClaseLuna 
              onTornar={handleAnarClassesPremium} 
              bloc={classeSeleccionada.bloc}
              tema={classeSeleccionada.tema}
              subtema={classeSeleccionada.subtema}
            />
          )}

          {pantalla === 'classes_directe' && (
            <ClassesDirecteInici onTornar={handleAnarExamenTeoric} />
          )}

          {pantalla === 'examens_oficials_passats' && (
            <ExamensOficialsPassatsInici onTornar={handleAnarExamenTeoric} />
          )}

          {pantalla === 'examen_psicotecnic' && (
            <ExamenPsicotecnicInici onTornar={handleAnarTeorica} />
          )}

          {pantalla === 'actualitat' && (
            <ActualitatInici onTornar={handleAnarTeorica} />
          )}

          {pantalla === 'temari_oposimossos' && (
            <TemariOposimossosInici 
              onTornar={handleAnarExamenTeoric} 
              onAmbitA={handleAnarOposiAmbitA}
              onAmbitB={handleAnarOposiAmbitB}
              onAmbitC={handleAnarOposiAmbitC}
              progres={progres.oposimossos}
            />
          )}

          {pantalla === 'temari_oposimossos_ambit_a' && (
            <OposiAmbitA 
              onTornar={() => setPantalla('temari_oposimossos')} 
              temes={Object.keys(TEMARI_DETALL.A).map(k => TEMARI_DETALL.A[k as any].titol)}
              onSeleccionarTema={(i) => handleSeleccionarTema('A', i, 'oposimossos')}
              progres={progres.oposimossos.A}
              progresDetallat={Object.values(progres.oposimossos.detall.A)}
              onToggle={(i) => toggleTemaLlegit('A', i, 'oposimossos')}
            />
          )}

          {pantalla === 'temari_oposimossos_ambit_b' && (
            <OposiAmbitB 
              onTornar={() => setPantalla('temari_oposimossos')} 
              temes={Object.keys(TEMARI_DETALL.B).map(k => TEMARI_DETALL.B[k as any].titol)}
              onSeleccionarTema={(i) => handleSeleccionarTema('B', i, 'oposimossos')}
              progres={progres.oposimossos.B}
              progresDetallat={Object.values(progres.oposimossos.detall.B)}
              onToggle={(i) => toggleTemaLlegit('B', i, 'oposimossos')}
            />
          )}

          {pantalla === 'temari_oposimossos_ambit_c' && (
            <OposiAmbitC 
              onTornar={() => setPantalla('temari_oposimossos')} 
              temes={Object.keys(TEMARI_DETALL.C).map(k => TEMARI_DETALL.C[k as any].titol)}
              onSeleccionarTema={(i) => handleSeleccionarTema('C', i, 'oposimossos')}
              progres={progres.oposimossos.C}
              progresDetallat={Object.values(progres.oposimossos.detall.C)}
              onToggle={(i) => toggleTemaLlegit('C', i, 'oposimossos')}
            />
          )}

          {pantalla === 'detall_tema_oposimossos' && temaSeleccionat && (
            <DetallTemaOposimossos 
              ambitNom={`ÀMBIT ${temaSeleccionat.ambit}`}
              temaTitol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].titol}
              subtemes={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].subtemes}
              progres={progres.oposimossos.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A]}
              onTornar={handleTornarDeDetall}
              onToggle={(subIdx) => toggleSubtemaLlegit(temaSeleccionat.ambit, temaSeleccionat.index, subIdx, 'oposimossos')}
              onSeleccionarSubtema={(subIdx) => handleSeleccionarSubtema(subIdx, 'oposimossos')}
            />
          )}

          {pantalla === 'lector_contingut_oposimossos' && temaSeleccionat && subtemaSeleccionat !== null && (
            <LectorOposimossos 
              ambitNom={`ÀMBIT ${temaSeleccionat.ambit}`}
              temaTitol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].titol}
              puntTitol={TEMARI_DETALL[temaSeleccionat.ambit][temaSeleccionat.index].subtemes[subtemaSeleccionat]}
              contingutMd={
                temaSeleccionat.ambit === 'A' && temaSeleccionat.index === 0 && subtemaSeleccionat === 0
                ? `### 1.1.1. L'Antiguitat a Catalunya (Context)

*   **Vicens i Vives** defineix Catalunya com → **Redòs i passadís**.
*   Les dues restes humanes més antigues de Catalunya són ↓
    *   **La més antiga**: L'home de Talteüll - 450.000 anys.
    *   **La segona**: La mandíbula de Banyoles.`
                : "*Estat actual: En fase de blindatge. Properament trobaràs aquí el resum optimitzat d'OposiMossos.*"
              }
              contingutOficialHTML={progres.contingutPersonalitzat[`${temaSeleccionat.ambit}-${temaSeleccionat.index}-${subtemaSeleccionat}`]}
              completat={progres.oposimossos.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A][subtemaSeleccionat]}
              onTornar={handleTornarDeLector}
              onMarcarCompletat={() => {
                if (!progres.oposimossos.detall[temaSeleccionat.ambit][temaSeleccionat.index as keyof typeof progres.detall.A][subtemaSeleccionat]) {
                  toggleSubtemaLlegit(temaSeleccionat.ambit, temaSeleccionat.index, subtemaSeleccionat, 'oposimossos');
                }
              }}
            />
          )}

          {pantalla === 'em_costa_estudiar' && (
            <EmCostaEstudiarInici onTornar={handleAnarTeorica} />
          )}

          {pantalla === 'prova_practica' && (
            <ProvaFisicaInici onTornar={handleTornarMossos} />
          )}

          {pantalla === 'prova_psicologica' && (
            <ProvaPsicologicaInici onTornar={handleTornarMossos} />
          )}

          {pantalla === 'la_meva_oposicio' && (
            <LaMevaOposicio 
              onTornar={handleTornarMossos} 
              progresDetallat={progres.detall}
            />
          )}
        </div>
      } />
    </Routes>
  );
}
