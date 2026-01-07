import apiService from "./services/apiService";

const VAPID_PUBLIC_KEY = 'BFCt4i-AaR8Ieks9qFjimVbOMHZdQRN0DnHaccdbf4NTfREUGPBYF8WNDhu1M_KuRmCIGzB_uwZTuO6PykdkAkI';

export async function subscribeUser() {
    // 1️⃣ Check if already subscribed (from DB)
    const data = await apiService.postMethod('http://localhost:5000/subscription/my-subscription', {
        credentials: 'include' // if you use cookies/session
    });
    // const data = await existing.json();

    const subscriptions = data.data.data;

    if (subscriptions && subscriptions.length > 0) {
        console.log('Already subscribed:', subscriptions);
        return; // Skip subscription
    }

    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.register('/sw.js');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY) as BufferSource
    });

    // 3️⃣ Save subscription in backend
    // await fetch('http://localhost:5000/subscribe', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ subscription })
    // });
    await apiService.postMethod('http://localhost:5000/subscription/subscribe', { "subscription": subscription })

    console.log('Subscribed and saved:', subscription);
}



function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const view = new Uint8Array(buffer);

    for (let i = 0; i < rawData.length; i++) {
        view[i] = rawData.charCodeAt(i);
    }

    return buffer;
}

