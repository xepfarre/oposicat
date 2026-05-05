import { useState } from 'react';
import Pantalla_Inici from './pantalles/pantalla_inici';
import OposiMossosInici from './pantalles/oposimossos/oposi_mossos_inici';
import ProvaTeoricaInici from './pantalles/oposimossos/prova_teorica/prova_teorica_inici';
import ExamenTeoricInici from './pantalles/oposimossos/prova_teorica/examen_teoric/examen_teoric_inici';
import EmCostaEstudiarInici from './pantalles/oposimossos/prova_teorica/em_costa_estudiar_inici';
import ProvaPracticaInici from './pantalles/oposimossos/prova_practica/prova_practica_inici';
import ProvaPsicologicaInici from './pantalles/oposimossos/prova_psicologica/prova_psicologica_inici';
import TemariOficialInici from './pantalles/oposimossos/prova_teorica/temari_oficial_inici';
import TemariAmbitA from './pantalles/oposimossos/prova_teorica/temari_oficial/ambit_a';
import TemariAmbitB from './pantalles/oposimossos/prova_teorica/temari_oficial/ambit_b';
import TemariAmbitC from './pantalles/oposimossos/prova_teorica/temari_oficial/ambit_c';
import DetallTemaGeneric from './pantalles/oposimossos/prova_teorica/temari_oficial/detall_tema_generic';
import LectorContingut from './pantalles/oposimossos/prova_teorica/temari_oficial/lector_contingut';
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
  type Pantalla = 'inici' | 'mossos' | 'prova_teorica' | 'prova_practica' | 'prova_psicologica' | 'examen_teoric' | 'em_costa_estudiar' | 'la_meva_oposicio' | 'temari_oficial' | 'temari_ambit_a' | 'temari_ambit_b' | 'temari_ambit_c' | 'detall_tema' | 'lector_contingut';
  const [pantalla, setPantalla] = useState<Pantalla>('inici');
  
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
        0: Array(9).fill(false), // A.1: 9 punts
        1: Array(8).fill(false), // A.2: 8 punts
        2: Array(5).fill(false), // A.3: 5 punts
        3: Array(4).fill(false), // A.4: 4 punts
        4: Array(6).fill(false), // A.5: 6 punts
        5: Array(5).fill(false), // A.6: 5 punts
        6: Array(5).fill(false), // A.7: 5 punts
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
        1: Array(7).fill(false), // C.2: 7 punts
        2: Array(5).fill(false), // C.3: 5 punts
        3: Array(3).fill(false), // C.4: 3 punts
        4: Array(3).fill(false), // C.5: 3 punts
      }
    },
    // Nou magatzem per als textos subratllats (HTML)
    contingutPersonalitzat: {} as Record<string, string> 
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

  // Funció per marcar un tema com a llegit/no llegit
  const toggleTemaLlegit = (ambit: 'A' | 'B' | 'C', index: number) => {
    setProgres(prev => {
      const nouAmbit = [...prev[ambit]];
      nouAmbit[index] = !nouAmbit[index];
      return { ...prev, [ambit]: nouAmbit };
    });
  };

  // Funció per marcar un subtema com a llegit/no llegit
  const toggleSubtemaLlegit = (ambit: 'A' | 'B' | 'C', temaIndex: number, subIndex: number) => {
    setProgres(prev => {
      // @ts-ignore
      const nouSub = [...prev.detall[ambit][temaIndex]];
      nouSub[subIndex] = !nouSub[subIndex];
      
      return {
        ...prev,
        detall: {
          ...prev.detall,
          [ambit]: {
            ...prev.detall[ambit],
            [temaIndex]: nouSub
          }
        }
      };
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
  const handleAnarTemariAmbitA = () => setPantalla('temari_ambit_a');
  const handleAnarTemariAmbitB = () => setPantalla('temari_ambit_b');
  const handleAnarTemariAmbitC = () => setPantalla('temari_ambit_c');
  
  const handleSeleccionarTema = (ambit: 'A' | 'B' | 'C', index: number) => {
    setTemaSeleccionat({ ambit, index });
    setPantalla('detall_tema');
  };

  const handleSeleccionarSubtema = (index: number) => {
    setSubtemaSeleccionat(index);
    setPantalla('lector_contingut');
  };

  const handleTornarDeLector = () => {
    setPantalla('detall_tema');
    setSubtemaSeleccionat(null);
  };

  const handleTornarDeDetall = () => {
    if (temaSeleccionat?.ambit === 'A') setPantalla('temari_ambit_a');
    else if (temaSeleccionat?.ambit === 'B') setPantalla('temari_ambit_b');
    else setPantalla('temari_ambit_c');
    setTemaSeleccionat(null);
  };

  const handleTornarMossos = () => setPantalla('mossos');
  const handleAnarLaMevaOposicio = () => setPantalla('la_meva_oposicio');

  return (
    <>
      {pantalla === 'inici' && (
        <Pantalla_Inici onEntrar={handleEntrar} />
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
        />
      )}

      {pantalla === 'em_costa_estudiar' && (
        <EmCostaEstudiarInici onTornar={handleAnarTeorica} />
      )}

      {pantalla === 'prova_practica' && (
        <ProvaPracticaInici onTornar={handleTornarMossos} />
      )}

      {pantalla === 'prova_psicologica' && (
        <ProvaPsicologicaInici onTornar={handleTornarMossos} />
      )}

      {pantalla === 'la_meva_oposicio' && (
        <LaMevaOposicio onTornar={handleTornarMossos} />
      )}
    </>
  );
}
