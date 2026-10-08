'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from 'opub-ui';

const JUSTICEHUB_ORIGIN = 'https://justicehub.in';
const THEME_CSS = `${JUSTICEHUB_ORIGIN}/jh_home_new1.css`;
const THEME_LOGO = `${JUSTICEHUB_ORIGIN}/assets/jh_logo.png`;

const RETRY_MS = 2000;
const REVEAL_MS = 800;
const FALLBACK_MS = 8000;

export const isJusticeHubEmbed = (src: string) => {
  try {
    const { hostname } = new URL(src);
    return hostname === 'justicehub.in' || hostname === 'www.justicehub.in';
  } catch {
    return false;
  }
};

const JusticeHubEmbed = ({ src, title }: { src: string; title: string }) => {
  const [attempt, setAttempt] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const hasRetried = useRef(false);
  const revealed = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const queue = (fn: () => void, delay: number) => {
    timers.current.push(setTimeout(fn, delay));
  };

  const reveal = useCallback(() => {
    if (revealed.current) return;
    revealed.current = true;
    setIsReady(true);
  }, []);

  useEffect(() => {
    revealed.current = false;
    hasRetried.current = false;

    const fallback = setTimeout(reveal, FALLBACK_MS);
    timers.current.push(fallback);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [src, reveal]);

  const handleLoad = () => {
    if (revealed.current) return;

    if (!hasRetried.current) {
      hasRetried.current = true;
      // First response means a reload is coming. Cancel the give-up timer
      // so it cannot drop the spinner and then wipe the frame.
      timers.current.forEach(clearTimeout);
      timers.current = [];
      queue(() => {
        if (revealed.current) return;
        setAttempt((current) => current + 1);
      }, RETRY_MS);
      queue(reveal, FALLBACK_MS);
      return;
    }

    queue(reveal, REVEAL_MS);
  };

  return (
    <>
      <link rel="preconnect" href={JUSTICEHUB_ORIGIN} />
      <link rel="preload" href={THEME_CSS} as="style" />
      <link rel="preload" href={THEME_LOGO} as="image" />
      <div
        className="relative min-h-[640px] overflow-hidden rounded-2 border border-baseGraySlateSolid9 bg-surfaceDefault"
        aria-busy={!isReady}
      >
        {!isReady ? (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-surfaceDefault"
            role="status"
          >
            <Spinner />
            <span className="text-600">Loading dashboard</span>
          </div>
        ) : null}
        <iframe
          key={attempt}
          title={title}
          src={src}
          onLoad={handleLoad}
          className={`min-h-[640px] w-full border-0 ${isReady ? 'visible' : 'invisible'}`}
          allowFullScreen
        />
      </div>
    </>
  );
};

export default JusticeHubEmbed;
