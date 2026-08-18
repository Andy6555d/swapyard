// Required by Chrome's install criteria. Deliberately a plain pass-through,
// not a cache, since SwapYard's listings/requests must always show live
// data, not a stale offline copy.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', (event) => {
  let data = { title: 'SwapYard', url: '/browse' };
  try {
    data = event.data.json();
  } catch (e) {
    // fall back to defaults above
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'SwapYard', {
      body: 'Tap to view on SwapYard',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/browse' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/browse';
  event.waitUntil(clients.openWindow(url));
});
