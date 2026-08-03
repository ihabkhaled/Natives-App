import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { MeetingCardProps } from './meeting-card.types';

/**
 * One board meeting. The minutes line is driven by approval, not by status: a
 * meeting can be marked minuted while its minutes still await approval, and a
 * decision is only quotable once they are approved.
 */
export function MeetingCard(props: MeetingCardProps): React.JSX.Element {
  const { view } = props;
  return (
    <article
      className="app-surface-card flex flex-col gap-2 p-4"
      data-testid={`${TEST_IDS.governanceMeetingCard}-${view.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip label={view.statusLabel} tone="medium" />
        <StatusChip
          label={view.visibilityCaption}
          tone={view.isMinutesApproved ? 'success' : 'medium'}
        />
        <h3 className="m-0 text-sm font-semibold">{view.title}</h3>
      </div>

      <IonText color="medium">
        <p className="m-0 text-xs">
          {view.scheduledLabel}: <time dateTime={view.scheduledAt}>{view.scheduledAt}</time>
        </p>
      </IonText>
      <IonText color="medium">
        <p className="m-0 text-xs">{view.minutesLabel}</p>
      </IonText>

      <p className="m-0 text-xs font-semibold">{view.decisionsLabel}</p>
      {view.decisions.length === 0 ? null : (
        <ul className="m-0 flex list-disc flex-col gap-1 ps-4 text-sm">
          {view.decisions.map((decision) => (
            <li key={decision}>{decision}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
