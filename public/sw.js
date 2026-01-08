
// Force new SW to take control immediately
self.addEventListener('install', event => {
    self.skipWaiting(); // Activates this SW immediately
});

self.addEventListener('activate', event => {
    event.waitUntil(
        // Claim all clients so pages controlled by old SW switch to this one
        self.clients.claim()
    );
});


self.addEventListener('push', event => {

    const data = event.data ? event.data.json() : {};

    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', {
            body: data.body || 'New message',
            icon: '/favicon.png',
            badge: '/image.png'
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});


