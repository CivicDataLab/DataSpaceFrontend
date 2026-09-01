'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

const BHASHINI_SCRIPT_ID = 'bhashini-website-translation';
const BHASHINI_SCRIPT_SRC =
  'https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js';
const BHASHINI_HOLDER_ID = '__bhashini-plugin-holder';

function getHolder() {
  let holder = document.getElementById(BHASHINI_HOLDER_ID);
  if (!holder) {
    holder = document.createElement('div');
    holder.id = BHASHINI_HOLDER_ID;
    holder.hidden = true;
    document.body.appendChild(holder);
  }
  return holder;
}

export default function BhashiniTranslation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const holder = getHolder();
    while (holder.firstChild) {
      container.appendChild(holder.firstChild);
    }

    return () => {
      while (container.firstChild) {
        holder.appendChild(container.firstChild);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="bhashini-plugin-container flex items-center"
      />
      <Script
        id={BHASHINI_SCRIPT_ID}
        src={BHASHINI_SCRIPT_SRC}
        strategy="afterInteractive"
        {...({
          'language-icon-color': '#fff',
        } as Record<string, string>)}
      />
    </>
  );
}
