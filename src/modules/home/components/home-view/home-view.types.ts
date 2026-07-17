import type { ReactNode } from 'react';

export interface HomeViewProps {
  readonly greeting: string;
  readonly isLoadingUser: boolean;
  readonly loadingLabel: string;
  readonly logoutLabel: string;
  readonly isLoggingOut: boolean;
  readonly onLogout: () => void;
  readonly healthSlot: ReactNode;
}
