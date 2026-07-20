import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, StatusChip } from '@/shared/ui';

import type { TryoutCandidateListProps } from './tryout-candidate-list.types';

/**
 * The candidate roll. It carries a reference, a display name, and a status —
 * never an email, a phone number, or a readiness note.
 */
export function TryoutCandidateList(props: TryoutCandidateListProps): React.JSX.Element {
  return props.items.length === 0 ? (
    <IonNote>{props.emptyLabel}</IonNote>
  ) : (
    <ul data-testid={TEST_IDS.tryoutCandidateList} className="app-candidate-list">
      {props.items.map((row) => (
        <li
          key={row.candidateId}
          data-testid={TEST_IDS.tryoutCandidateRow}
          className={
            row.isSelected ? 'app-candidate-row app-candidate-row--selected' : 'app-candidate-row'
          }
        >
          <div className="app-candidate-row__main">
            <IonText>
              <h3 className="app-candidate-row__title m-0">{row.displayName}</h3>
            </IonText>
            <IonNote>{row.reference}</IonNote>
            {row.checkedInLabel === null ? null : <IonNote>{row.checkedInLabel}</IonNote>}
          </div>
          <div className="app-candidate-row__meta">
            <StatusChip label={row.statusLabel} tone={row.statusTone} />
            {row.canCheckIn ? (
              <AppButton
                label={row.checkInLabel}
                tone="secondary"
                testId={TEST_IDS.tryoutCheckIn}
                onClick={() => {
                  props.onCheckIn(row.candidateId);
                }}
              />
            ) : null}
            <AppButton
              label={row.openLabel}
              tone="ghost"
              testId={TEST_IDS.tryoutCandidateOpen}
              onClick={() => {
                props.onSelect(row.candidateId);
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
