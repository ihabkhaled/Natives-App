import type { AppBarNotification } from '../app-bar.types';

export interface NotificationsPanelProps {
  readonly panelTitle: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly loadingLabel: string;
  readonly isLoading: boolean;
  readonly items: readonly AppBarNotification[];
  readonly unreadChipLabel: string;
  readonly viewAllLabel: string;
  readonly preferencesLabel: string;
  readonly onOpen: (notificationId: string) => void;
  readonly onViewAll: () => void;
  readonly onOpenPreferences: () => void;
}
