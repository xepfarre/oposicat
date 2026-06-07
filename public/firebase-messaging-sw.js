// Explicació per a no-programadors: Aquest és el vigilant de segon pla (Service Worker) oficial de Firebase.
// S'executa directament a la memòria del telèfon o tauleta de l'alumne fins i tot quan la pantalla està tancada.
// En cas de rebre un "xiulet" des del servidor de notificacions d'OposiCAT, es desperta, pinta l'alerta i torna a dormir.

// Importem asíncronament els motors de comunicació oficials i segurs de Google (formats compatibilitat de seguretat v9)
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Inicialitzem el mòdul de seguretat intern de segon pla connectat amb el teu servidor exacte d'OposiCAT
firebase.initializeApp({
  apiKey: "AIzaSyD3PO0_0K5Elg_7zyMNEQfyRGKglERZzj8",
  authDomain: "gen-lang-client-0728216405.firebaseapp.com",
  projectId: "gen-lang-client-0728216405",
  storageBucket: "gen-lang-client-0728216405.firebasestorage.app",
  messagingSenderId: "364619099649",
  appId: "1:364619099649:web:d4f7f4356d5dac8f8a1a00"
});

const messaging = firebase.messaging();

// Explicació per a no-programadors: Intercepta les alertes llançades si l'alumne té la tauleta bloquejada o l'aplicació en segon pla.
messaging.onBackgroundMessage((payload) => {
  console.log('[OposiCAT SW] S\'ha rebut un missatge en segon pla (pantalla apagada o tancada):', payload);
  
  // Extraiem el títol i el cos del missatge rebut des de Firebase
  const titolNotificacio = payload.notification?.title || payload.data?.title || "OposiCAT Alerta! 📢";
  const opcionsNotificacio = {
    body: payload.notification?.body || payload.data?.body || "Tens novetats importants de l'oposició de Mossos d'Esquadra pendents d'estudi.",
    icon: '/icon.svg',
    badge: '/icon.svg', // Icona petita per a la barra de tasques d'Android o iOS
    tag: payload.data?.tag || 'oposicat-notificacio', // Agrupa notificacions similars per a evitar saturar la barra de l'alumne
    renotify: true, // Vibra un altre cop si arriba amb el mateix tag
    data: payload.data || {}
  };

  // Pintem el missatge natiu de sistema operatiu en segon pla
  self.registration.showNotification(titolNotificacio, opcionsNotificacio);
});

// Explicació per a no-programadors: Permet a l'estudiant fer clic sobre l'alerta i obrir directament OposiCAT al navegador.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Obre la teva aplicació mòbil OposiCAT
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
