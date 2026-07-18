import { IonBadge, IonItem, IonLabel, IonList, IonNote } from '@/packages/ionic';

import { DASHBOARD_TASK_LIST_TEST_IDS } from './dashboard-task-list.constants';
import type { DashboardTaskListProps } from './dashboard-task-list.types';

/** Prioritized next-action list; an optional count badge and time per task. */
export function DashboardTaskList(props: DashboardTaskListProps): React.JSX.Element {
  return props.tasks.length === 0 ? (
    <IonNote>{props.emptyLabel}</IonNote>
  ) : (
    <IonList>
      {props.tasks.map((task) => (
        <IonItem key={task.id} lines="none" data-testid={DASHBOARD_TASK_LIST_TEST_IDS.item}>
          <IonLabel className="whitespace-normal">
            <p className="m-0">{task.label}</p>
            {task.timeText === null ? null : <IonNote>{task.timeText}</IonNote>}
          </IonLabel>
          {task.countText === null ? null : (
            <IonBadge slot="end" color={task.color}>
              {task.countText}
            </IonBadge>
          )}
        </IonItem>
      ))}
    </IonList>
  );
}
