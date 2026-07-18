import { IonNote } from '@/packages/ionic';

import { DashboardWidget } from '../dashboard-widget';
import type { DashboardWidgetListProps } from './dashboard-widget-list.types';

/** The prepared widget grid, with a stale-data notice when offline. */
export function DashboardWidgetList(props: DashboardWidgetListProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {props.isOffline ? <IonNote>{props.offlineNoticeLabel}</IonNote> : null}
      {props.widgets.map((widget) => (
        <DashboardWidget key={widget.kind} widget={widget} />
      ))}
    </div>
  );
}
