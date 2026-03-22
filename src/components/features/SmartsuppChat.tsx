'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    _smartsupp?: { key?: string; [key: string]: any };
    smartsupp?: ((...args: any[]) => void) & { _?: any[] };
    __SMARTSUPP_LOADED__?: boolean;
  }
}

/**
 * Smartsupp live chat loader.
 *
 * Mirrors the official embed snippet in a React/Next-friendly way:
 * - Initializes window._smartsupp and assigns the key
 * - Creates the smartsupp queue function if needed
 * - Dynamically injects the loader script
 * - Guards against duplicate script injection
 *
 * The key is read from NEXT_PUBLIC_SMARTSUPP_KEY, falling back to the
 * provided key if the env var is not set.
 */
export default function SmartsuppChat() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const envKey = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;
    const key = envKey || '97096bfe3a71931a431fd8232cdc9d7c159f6135';

    // Avoid re-injecting on client-side navigations
    if (window.__SMARTSUPP_LOADED__) {
      return;
    }

    // Initialize global object and key (as in the original snippet)
    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = key;

    // window.smartsupp||(function(d){ ... })(document);
    if (!window.smartsupp) {
      const d = document;
      const s = d.getElementsByTagName('script')[0];
      const c = d.createElement('script');
      const o = function (...args: any[]) {
        (o._ = o._ || []).push(args);
      } as Window['smartsupp'];
      o._ = [];

      window.smartsupp = o;

      c.type = 'text/javascript';
      c.charset = 'utf-8';
      c.async = true;
      c.src = 'https://www.smartsuppchat.com/loader.js?';
      if (s && s.parentNode) {
        s.parentNode.insertBefore(c, s);
      } else {
        d.head.appendChild(c);
      }
    }

    window.__SMARTSUPP_LOADED__ = true;
  }, []);

  // Optional: noscript fallback (mostly relevant for non-JS users)
  return (
    <noscript
      dangerouslySetInnerHTML={{
        __html:
          'Powered by <a href="https://www.smartsupp.com" target="_blank" rel="noreferrer">Smartsupp</a>',
      }}
    />
  );
}

