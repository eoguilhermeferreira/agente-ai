'use client';

import { useEffect, useRef } from 'react';
import api from '@/lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

async function setupPush() {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const { data } = await api.get('/push/vapid-public-key');
    if (!data.publicKey) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });

    await api.post('/push/subscribe', { subscription });
  } catch (err) {
    console.error('[Push] setup failed:', err);
  }
}

export function usePushNotifications() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current || typeof window === 'undefined') return;
    done.current = true;
    setupPush();
  }, []);
}
