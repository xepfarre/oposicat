import { useState } from 'react';
import Pantalla_Inici from './pantalles/pantalla_inici';
import OposiMossosInici from './pantalles/oposimossos/oposi_mossos_inici';
import ProvaTeoricaInici from './pantalles/oposimossos/prova_teorica/prova_teorica_inici';
import ExamenTeoricInici from './pantalles/oposimossos/prova_teorica/examen_teoric/examen_teoric_inici';
import EmCostaEstudiarInici from './pantalles/oposimossos/prova_teorica/em_costa_estudiar_inici';
import ProvaPracticaInici from './pantalles/oposimossos/prova_practica/prova_practica_inici';
import ProvaPsicologicaInici from './pantalles/oposimossos/prova_psicologica/prova_psicologica_inici';

/**
 * COMPONENT PRINCIPAL: App
 * Gestiona la navegació entre les diferents pantalles de l'aplicació OposiCAT.
 */
export default function App() {
  // Estat per saber quina pantalla estem mostrant
  type Pantalla = 'inici' | 'mossos' | 'prova_teorica' | 'prova_practica' | 'prova_psicologica' | 'examen_teoric' | 'em_costa_estudiar';
  const [pantalla, setPantalla] = useState<Pantalla>('inici');

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
  const handleTornarMossos = () => setPantalla('mossos');

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
        />
      )}

      {pantalla === 'prova_teorica' && (
        <ProvaTeoricaInici 
          onTornar={handleTornarMossos} 
          onExamenTeoric={handleAnarExamenTeoric}
          onEmCostaEstudiar={handleAnarEmCostaEstudiar}
        />
      )}

      {pantalla === 'examen_teoric' && (
        <ExamenTeoricInici onTornar={handleAnarTeorica} />
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
    </>
  );
}
