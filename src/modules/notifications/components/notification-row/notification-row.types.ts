import type { NotificationRowView } from '../../types/notifications-view.types';

export interface NotificationRowProps {
  readonly row: NotificationRowView;
  readonly onOpen: (notificationId: string) => void;
  readonly onMarkRead: (notificationId: string) => void;
}
