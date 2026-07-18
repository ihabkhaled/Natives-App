import type { DashboardBreakdownRowView } from '../../types/dashboard-view.types';

export interface DashboardBreakdownProps {
  readonly caption: string;
  readonly rows: readonly DashboardBreakdownRowView[];
}
