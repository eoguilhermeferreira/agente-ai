self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'ChatNex — Atendimento Humano!';
  const options = {
    body: data.body || 'Um cliente precisa de atendimento humano agora.',
    icon: '/chatnex-icon.png',
    badge: '/chatnex-icon.png',
    vibrate: [300, 100, 300, 100, 300, 100, 500],
    requireInteraction: true,
    tag: 'human-needed',
    renotify: true,
    data: {
      url: data.url || '/atendimentos',
      conversationId: data.conversationId,
    },
    actions: [
      { action: 'view', title: 'Ver agora' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/atendimentos';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
