import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

type NavigationProps = {
  isNavigating: boolean;
  setIsNavigation: (isNavigating: boolean) => void;
};

export const useIsNavigating = create<NavigationProps>((set) => ({
  isNavigating: false,
  setIsNavigation: (isNavigating) => set({ isNavigating }),
}));

interface DashboardStore {
  entityDetails: any;
  userDetails: any;
  setEntityDetails: (data: any) => void;
  setUserDetails: (data: any) => void;
  allEntityDetails: any;
  setAllEntityDetails: (data: any) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  entityDetails: null,
  userDetails: null,
  setEntityDetails: (data) => set({ entityDetails: data }),
  setUserDetails: (data) => set({ userDetails: data }),
  allEntityDetails: null,
  setAllEntityDetails: (data) => set({ allEntityDetails: data }),
}));

export { shallow };
