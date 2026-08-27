import { useEffect, useState } from 'react';

export function useKeyPress(targetKey: string, withMeta?: boolean): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    function downHandler({
      key,
      metaKey,
    }: {
      key: string;
      metaKey?: boolean;
    }): void {
      if (withMeta) {
        if (key === targetKey && metaKey) {
          setKeyPressed(true);
        }
        return;
      }

      if (key === targetKey) {
        setKeyPressed(true);
      }
    }

    function upHandler({
      key,
    }: {
      key: string;
      metaKey?: boolean;
    }): void {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    }

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey, withMeta]);

  return keyPressed;
}
