import type { ReactNode } from 'react';

export interface HomeViewProps {
  readonly title: string;
  readonly greeting: string;
  readonly isLoadingUser: boolean;
  readonly loadingLabel: string;
  readonly logoutLabel: string;
  readonly manageSessionsLabel: string;
  readonly practiceCalendarLabel: string;
  readonly isLoggingOut: boolean;
  readonly onLogout: () => void;
  readonly onManageSessions: () => void;
  readonly onOpenPracticeCalendar: () => void;
  readonly dashboardSlot: ReactNode;
  readonly healthSlot: ReactNode;
}
