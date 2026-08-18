'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Register the service worker on every visit, not just when enabling
    // notifications, this is required for the install prompt to ever fire.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const alreadyDismissed = sessionStorage.getItem('installPromptDismissed') === 'true';
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone || alreadyDismissed) {
      setDismissed(true);
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setPlatform('ios');
      setDismissed(false);
    }

    function handleBeforeInstallPrompt(e: any) {
      e.preventDefault();
      setInstallEvent(e);
      setPlatform('android');
      setDismissed(false);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem('installPromptDismissed', 'true');
  }

  async function handleInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setDismissed(true);
    sessionStorage.setItem('installPromptDismissed', 'true');
  }

  if (dismissed || !platform) return null;

  return (
    <div className="install-banner">
      <div className="wrap install-banner-inner">
        {platform === 'android' ? (
          <>
            <span>Install SwapYard on your phone for one-tap access and stock alerts.</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary btn-sm" onClick={handleInstall}>Install</button>
              <button className="btn btn-ghost btn-sm" onClick={handleDismiss}>Not now</button>
            </div>
          </>
        ) : (
          <>
            <span>
              Add SwapYard to your Home Screen: tap the Share icon, then &quot;Add to Home Screen&quot;.
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleDismiss}>Got it</button>
          </>
        )}
      </div>
    </div>
  );
}
