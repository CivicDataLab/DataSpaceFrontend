import { useSyncExternalStore } from 'react';

export const useIsMac = () => {
  return useSyncExternalStore(
    () => () => {},
    () => window.navigator.userAgent.includes('Mac'),
    () => false
  );
};
