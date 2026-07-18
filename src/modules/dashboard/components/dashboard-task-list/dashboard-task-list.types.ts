import type { DashboardTaskView } from '../../types/dashboard-view.types';

export interface DashboardTaskListProps {
  readonly tasks: readonly DashboardTaskView[];
  readonly emptyLabel: string;
}
