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

export interface DashboardLogo {
  url?: string | null;
  name?: string | null;
  path?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface DashboardOrganization {
  id: string;
  name: string;
  slug?: string | null;
  contactEmail?: string | null;
  organizationTypes?: string | string[] | null;
  homepage?: string | null;
  description?: string | null;
  logo?: DashboardLogo | null;
  linkedinProfile?: string | null;
  githubProfile?: string | null;
  twitterProfile?: string | null;
  location?: string | null;
}

export interface DashboardUser {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  bio?: string | null;
  username?: string | null;
  githubProfile?: string | null;
  linkedinProfile?: string | null;
  twitterProfile?: string | null;
  location?: string | null;
  profilePicture?: DashboardLogo | null;
  organizationMemberships?: Array<{
    organization?: { name?: string | null; id?: string | null } | null;
    role?: { name?: string | null } | null;
  } | null> | null;
}

export interface EntityDetailsData {
  organizations?: DashboardOrganization[] | null;
}

export interface UserDetailsData {
  me?: DashboardUser | null;
}

interface DashboardStore {
  entityDetails: EntityDetailsData | null;
  userDetails: UserDetailsData | null;
  setEntityDetails: (data: EntityDetailsData | null) => void;
  setUserDetails: (data: UserDetailsData | null) => void;
  allEntityDetails: EntityDetailsData | null;
  setAllEntityDetails: (data: EntityDetailsData | null) => void;
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
