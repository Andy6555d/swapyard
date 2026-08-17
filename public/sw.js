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
