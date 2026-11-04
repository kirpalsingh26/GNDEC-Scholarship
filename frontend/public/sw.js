// GNDEC Scholarship Portal - Service Worker for Web Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'GNDEC Scholarship Portal';
    const options = {
      body: payload.body || 'You have an important update regarding your scholarship application.',
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      vibrate: [150, 80, 150],
      tag: payload.data?.type || 'gndec-notification',
      renotify: true,
      data: payload.data || { url: '/student/dashboard' },
      actions: [
        {
          action: 'open_url',
          title: 'View Update',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('GNDEC Scholarship Portal', {
        body: text,
        icon: '/favicon.ico',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/student/dashboard';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If an existing portal window is open, focus it and navigate
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
          }
        }
        // Otherwise, open a new window to the target link
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

