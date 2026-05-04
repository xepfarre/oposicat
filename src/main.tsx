/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Importem les eines bàsiques de React (el "motor" de l'aplicació)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Importem la pantalla que veiem al principi (Ruta senzilla com a la imatge)
import App from './App.tsx';

// Importem el disseny i els estils globals (Ruta senzilla com a la imatge)
import './estils/estils_globals.css';

console.log("React App: main.tsx initialized");

/**
 * Aquesta és la funció que engega realment l'aplicació en el navegador.
 */
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
