/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Importem les eines bàsiques de React (el "motor" de l'aplicació)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Importem la pantalla que veiem al principi (Ruta senzilla com a la imatge)
import { BrowserRouter } from 'react-router-dom';
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
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
}

// Registre del Service Worker per habilitar el mode APP en mòbils i tablets
if ('serviceWorker' in navigator) {
  const registerSW = () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(registration => console.log('SW unificat d\'OposiCAT registrat amb èxit:', registration.scope))
      .catch(err => console.log('Error en registrar el SW d\'OposiCAT:', err));
  };

  // Explicació per a no-programadors: Si la pàgina ja s'ha acabat de carregar abans que s'activi aquest bloc de codi de React,
  // engeguem el registre del vigilant immediatament per evitar quedar-nos esperant per sempre.
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}
