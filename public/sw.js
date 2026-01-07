self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};

    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', {
            body: data.body || 'New message',
            icon: '/vite.svg',
            badge: '/vite.svg'
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
