import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import { TrainingStatusChip } from '../training-status-chip';
import type { TrainingSubmissionListProps } from './training-submission-list.types';

/** The member's own claims, newest first, each a tappable card row. */
export function TrainingSubmissionList(props: TrainingSubmissionListProps): React.JSX.Element {
  return (
    <ul data-testid={TEST_IDS.trainingSubmissionList} className="app-training-list">
      {props.items.map((item) => (
        <li
          key={item.id}
          data-testid={TEST_IDS.trainingSubmissionCard}
          className="app-surface-card app-training-card"
        >
          <div className="app-training-card__main">
            <IonText>
              <h3 className="app-training-card__title m-0">{item.typeName}</h3>
            </IonText>
            <IonNote>{`${item.dateLabel} · ${item.durationLabel}`}</IonNote>
            <IonNote>{item.evidenceLabel}</IonNote>
          </div>
          <div className="app-training-card__meta">
            <TrainingStatusChip label={item.statusLabel} tone={item.statusTone} />
            {item.buddyLabel === null ? null : <IonNote>{item.buddyLabel}</IonNote>}
            <AppButton
              label={item.openLabel}
              tone="ghost"
              onClick={() => {
                props.onOpen(item.id);
              }}
              testId={TEST_IDS.trainingSubmissionOpen}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
