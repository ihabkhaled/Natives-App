import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { TaskCardProps } from './task-card.types';

/**
 * One task the board raised. A blocked task says what it is waiting on, so the
 * board chases the dependency rather than the owner.
 */
export function TaskCard(props: TaskCardProps): React.JSX.Element {
  const { view } = props;
  return (
    <article
      className="app-surface-card flex flex-col gap-2 p-4"
      data-testid={`${TEST_IDS.governanceTaskCard}-${view.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip label={view.priorityLabel} tone={view.isClosed ? 'medium' : 'warning'} />
        <StatusChip label={view.statusLabel} tone="medium" />
        <h3 className="m-0 text-sm font-semibold">{view.title}</h3>
      </div>

      {view.description === null ? null : (
        <IonText color="medium">
          <p className="m-0 text-sm">{view.description}</p>
        </IonText>
      )}

      <IonText color="medium">
        <p className="m-0 text-xs">
          {view.dueLabel}
          {view.dueDate === null ? null : <time dateTime={view.dueDate}>: {view.dueDate}</time>}
        </p>
      </IonText>

      {view.blockedNotice === null ? null : (
        <p className="app-pending-notice m-0 text-xs">{view.blockedNotice}</p>
      )}
    </article>
  );
}
