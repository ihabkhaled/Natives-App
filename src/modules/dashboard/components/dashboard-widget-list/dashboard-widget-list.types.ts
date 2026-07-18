import type { DashboardWidgetView } from '../../types/dashboard-view.types';

export interface DashboardWidgetListProps {
  readonly widgets: readonly DashboardWidgetView[];
  readonly isOffline: boolean;
  readonly offlineNoticeLabel: string;
}
