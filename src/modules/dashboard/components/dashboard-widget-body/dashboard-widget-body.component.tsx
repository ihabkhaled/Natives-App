import { DashboardBreakdown } from '../dashboard-breakdown';
import { DashboardMetric } from '../dashboard-metric';
import { DashboardTaskList } from '../dashboard-task-list';
import type { DashboardWidgetBodyProps } from './dashboard-widget-body.types';

/** Registry-driven dispatch: render the body for the widget's presentation. */
export function DashboardWidgetBody(props: DashboardWidgetBodyProps): React.JSX.Element {
  const { widget } = props;
  return widget.presentation === 'metric' ? (
    <DashboardMetric metric={widget.metric} />
  ) : widget.presentation === 'breakdown' ? (
    <DashboardBreakdown caption={widget.caption} rows={widget.rows} />
  ) : (
    <DashboardTaskList tasks={widget.tasks} emptyLabel={widget.emptyTasksLabel} />
  );
}
