'use client';

import { useEffect, useState } from 'react';

const CONSENT_KEY = 'ehf-cookie-consent';

export default function CookieBanner() {
  const [isAccepted, setIsAccepted] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem(CONSENT_KEY)
      : 'accepted';
    setIsAccepted(stored === 'accepted');
  }, []);

  function accept() {
    window.localStorage.setItem(CONSENT_KEY, 'accepted');
    setIsAccepted(true);
  }

  if (isAccepted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="m-4 max-w-xl w-full rounded-lg border border-gray-300 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Cookies og lokal lagring</h2>
        <p className="text-sm text-gray-800 mb-4">
          Denne siden bruker cookies og lokal lagring (LocalStorage) for å lagre faktura-, avsender- og mottakerdata i nettleseren din. 
          Du må godta bruk av cookies for å fortsette.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={accept}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Godta og fortsett
          </button>
          <a
            href="https://nettvett.no/informasjonskapsler"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-700 hover:underline text-center sm:text-left"
          >
            Les mer om cookies
          </a>
        </div>
      </div>
    </div>
  );
}
