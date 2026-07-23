import type {
  DashboardWidgetRetryCopy,
  DashboardWidgetView,
} from '../../types/dashboard-view.types';

export interface DashboardWidgetListProps extends DashboardWidgetRetryCopy {
  readonly widgets: readonly DashboardWidgetView[];
  readonly isOffline: boolean;
  readonly offlineNoticeLabel: string;
  readonly onOpenLink: (path: string) => void;
}
