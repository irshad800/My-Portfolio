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
    if (event.data) data = event.data.json();
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'portfolio-system-notification',
    renotify: true,
    data: { url: self.registration.scope }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle tap on system notification in mobile OS status bar / desktop tray
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./#/admin');
      }
    })
  );
});
