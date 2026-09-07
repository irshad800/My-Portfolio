// Service Worker for Portfolio Mobile & OS System Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming background push events if Web Push API is used
self.addEventListener('push', (event) => {
  let data = { title: '⚡ Portfolio Alert', body: 'New visitor or message on your portfolio!' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  // Construct absolute URL for icon so image load never returns 404
  const baseUrl = self.registration.scope || '/';
  const iconUrl = new URL('favicon.jpeg', baseUrl).href;

  const options = {
    body: data.body || 'New activity recorded on your portfolio',
    icon: data.icon || iconUrl,
    badge: data.badge || iconUrl,
    vibrate: [300, 100, 300, 100, 300],
    tag: 'portfolio-alert-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    data: { url: baseUrl + '#/admin' }
  };

  event.waitUntil(self.registration.showNotification(data.title || '⚡ Portfolio Alert', options));
});

// Handle tap on system notification in mobile OS status bar / desktop tray
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './#/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
