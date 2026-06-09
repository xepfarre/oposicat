// Service Worker unificat oficial per a OposiCAT (PWA + Firebase Cloud Messaging)
// Versió: 2.0.0
// Explicació per a no-programadors: Aquest fitxer reuneix dues grans feines en un sol guardià de WhatsApp-estil:
// 1. Guarda a la tauleta el "esquelet" de la web per a obrir-se a l'instant i complir les normes d'instal·lació de Google Chrome.
// 2. Escolta els senyals de notificacions des de Firebase amb la pantalla apagada per a fer sonar alertes.

// ------------------------------------------------------------------------------------------------
// 1. CONFIGURACIÓ I GESTIÓ DE MEMÒRIA CAU (PWA STANDALONE)
// ------------------------------------------------------------------------------------------------
const CACHE_NAME = 'oposicat-pwa-v5'; // Incrementem per forçar neteja completa de memòries antigues
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg'
];

// Event d'instal·lació de la PWA
self.addEventListener('install', (event) => {
  console.log('[OposiCAT SW] S\'està instal·lant el nou motor unificat...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[OposiCAT SW] Desar assets essencials en memòria local offline...');
      // Intentem afegir individualment cada recurs perquè si un falla, els altres es desin correctament i el SW NO falli
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => 
          cache.add(url).catch(err => console.warn(`[OposiCAT SW] No s'ha pogut pre-carregar l'asset offline per defecte: ${url}`, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Event d'activació de la PWA (Neteja dels fitxers obsolets)
self.addEventListener('activate', (event) => {
  console.log('[OposiCAT SW] S\'està activant el motor unificat...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
                  .map((name) => {
                    console.log('[OposiCAT SW] Esborrant memòria cau antiga obsoleta:', name);
                    return caches.delete(name);
                  })
      );
    })
  );
  return self.clients.claim();
});

// Event de petició (Proxy dels fitxers per obrir l'APP ràpid i sense Internet)
self.addEventListener('fetch', (event) => {
  // Ignorem protocols no-estàndards o extensions del navegador de l'usuari
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Deixem passar directament les peticions que no siguin consultes simples d'arxius (p. ex. canvis a BBDD)
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si el fitxer existeix correctament a Internet, el servim i de pas en guardem una còpia offline actualitzada
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // En cas de pèrdua total de cobertura, servim els fitxers salvats
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si és navegació de pàgina web, evitem que surti el dinosaure de Chrome rebotant a la portada unificada
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// ------------------------------------------------------------------------------------------------
// 2. CONFIGURACIÓ DE NOTIFICACIONS PUSH EN SEGON PLA (FIREBASE CLOUD MESSAGING)
// ------------------------------------------------------------------------------------------------

try {
  // Importem asíncronament els motors de comunicació oficials de Google
  importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

  // Inicialitzem el mòdul de seguretat intern connectat amb Firestore d'OposiCAT
  firebase.initializeApp({
    apiKey: "AIzaSyD3PO0_0K5Elg_7zyMNEQfyRGKglERZzj8",
    authDomain: "gen-lang-client-0728216405.firebaseapp.com",
    projectId: "gen-lang-client-0728216405",
    storageBucket: "gen-lang-client-0728216405.firebasestorage.app",
    messagingSenderId: "364619099649",
    appId: "1:364619099649:web:d4f7f4356d5dac8f8a1a00"
  });

  if (firebase.messaging.isSupported()) {
    const messaging = firebase.messaging();

    // Escoltador d'alertes quan la tauleta té la pantalla bloquejada o l'APP no està oberta
    messaging.onBackgroundMessage((payload) => {
      console.log('[OposiCAT SW Push] S\'ha rebut un missatge en segon pla:', payload);
      
      const titolNotificacio = payload.notification?.title || payload.data?.title || "OposiCAT Alerta! 📢";
      const opcionsNotificacio = {
        body: payload.notification?.body || payload.data?.body || "Tens novetats importants pendents d'estudi.",
        icon: '/icon-192.png',
        badge: '/icon.svg',
        tag: payload.data?.tag || 'oposicat-notificacio', // Agrupa notificacions per no embussar la tauleta
        renotify: true,
        data: payload.data || {}
      };

      self.registration.showNotification(titolNotificacio, opcionsNotificacio);
    });
  } else {
    console.warn('[OposiCAT SW] El navegador no suporta o té desactivat el mòdul de notificacions push natiu de Google.');
  }
} catch (err) {
  console.warn('[OposiCAT SW] Alerta controlada: Càrrega de mòduls push de seguretat bloquejada o reduïda directament pel terminal (adblock/offline/sandbox):', err);
}

// En fer clic a sobre de la notificació de la tablet, obrim l'APP a l'instant
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
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
