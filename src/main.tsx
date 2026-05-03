/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Importem les eines bàsiques de React (el "motor" de l'aplicació)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Importem la pantalla que veiem al principi
import Pantalla_Inici from './pantalles/pantalla_inici.tsx';

// Importem el disseny i els estils globals (colors, mides, etc.)
import './estils/estils_globals.css';

/**
 * Aquesta és la funció que engega realment l'aplicació en el navegador.
 * Busca un element amb l'ID 'root' al fitxer index.html i hi "dibuixa" la nostra app.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Posem la pantalla d'inici com a primera cosa que es veu */}
    <Pantalla_Inici />
  </StrictMode>,
);
