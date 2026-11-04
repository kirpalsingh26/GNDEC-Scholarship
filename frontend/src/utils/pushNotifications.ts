import api from '../services/api.js';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks if browser supports Service Workers and Web Push Notifications.
 */
export const isPushSupported = (): boolean => {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

/**
 * Gets current notification permission state ('default' | 'granted' | 'denied').
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
};

/**
 * Registers the service worker /sw.js
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (error) {
    console.warn('Service worker registration failed:', error);
    return null;
  }
};

/**
 * Requests permission and subscribes device to Web Push notifications.
 * Stores the subscription securely in MongoDB via backend API.
 */
export const subscribeToWebPush = async (): Promise<{
  success: boolean;
  message?: string;
}> => {
  if (!isPushSupported()) {
    return { success: false, message: 'Web push is not supported in this browser.' };
  }

  try {
    // 1. Request Browser Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        message: 'Notification permission was denied or dismissed.',
      };
    }

    // 2. Register Service Worker
    const reg = await registerServiceWorker();
    if (!reg) {
      return { success: false, message: 'Could not register service worker.' };
    }

    // 3. Fetch VAPID Public Key from Backend
    const keyRes = await api.get('/notifications/vapid-public-key');
    const vapidPublicKey = keyRes.data?.data?.publicKey;
    if (!vapidPublicKey) {
      return { success: false, message: 'Could not retrieve VAPID public key from server.' };
    }

    // 4. Subscribe via PushManager
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // 5. Send Subscription to Backend to store securely in MongoDB
    const subJson = subscription.toJSON();
    await api.post('/notifications/subscribe', {
      endpoint: subJson.endpoint,
      keys: subJson.keys,
      userAgent: navigator.userAgent,
    });

    return { success: true, message: 'Web push notifications enabled successfully!' };
  } catch (error: any) {
    console.error('Failed to subscribe to web push:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Subscription failed.',
    };
  }
};

/**
 * Unsubscribes current device from Web Push notifications.
 */
export const unsubscribeFromWebPush = async (): Promise<boolean> => {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await api.post('/notifications/unsubscribe', { endpoint: sub.endpoint });
      await sub.unsubscribe();
    }
    return true;
  } catch (err) {
    console.warn('Error unsubscribing:', err);
    return false;
  }
};

/**
 * Checks if current device already has an active push subscription.
 */
export const checkIsSubscribed = async (): Promise<boolean> => {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return sub !== null;
  } catch {
    return false;
  }
};

