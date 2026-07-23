import type {
  DashboardWidgetRetryCopy,
  DashboardWidgetView,
} from '../../types/dashboard-view.types';

export interface DashboardWidgetProps extends DashboardWidgetRetryCopy {
  readonly widget: DashboardWidgetView;
  readonly onOpenLink: (path: string) => void;
}
