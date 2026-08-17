'use client';

import { useState, useEffect } from 'react';
import { savePushSubscription, disablePush } from '@/app/alerts/actions';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function EnableNotifications({ pushEnabled }: { pushEnabled: boolean }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'unsupported'>('idle');
  const [enabled, setEnabled] = useState(pushEnabled);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
    }
  }, []);

  async function handleEnable() {
    setStatus('loading');
    setError('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Notifications were blocked. You can allow them in your browser settings.');
        setStatus('idle');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      await savePushSubscription(subscription.toJSON() as any);
      setEnabled(true);
    } catch (err) {
      setError('Something went wrong enabling notifications. Try again.');
    }
    setStatus('idle');
  }

  async function handleDisable() {
    setStatus('loading');
    await disablePush();
    setEnabled(false);
    setStatus('idle');
  }

  if (status === 'unsupported') {
    return <p className="upload-status">Push notifications aren&apos;t supported in this browser.</p>;
  }

  return (
    <div>
      {enabled ? (
        <>
          <p className="upload-status">Notifications are on for this device.</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleDisable} disabled={status === 'loading'}>
            Turn off notifications
          </button>
        </>
      ) : (
        <button type="button" className="btn btn-primary" onClick={handleEnable} disabled={status === 'loading'}>
          {status === 'loading' ? 'Enabling…' : 'Enable Notifications'}
        </button>
      )}
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}
