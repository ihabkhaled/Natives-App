import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import { TrainingStatusChip } from '../training-status-chip';
import type { TrainingDetailBodyProps } from './training-detail-body.types';

/**
 * The ready state of one training claim: its facts, the evidence metadata,
 * the buddies, the append-only history, and the workflow actions. The
 * candidate-points line always carries the "server awards these" notice.
 */
export function TrainingDetailBody(props: TrainingDetailBodyProps): React.JSX.Element {
  const { view } = props;
  return (
    <>
      {view.changesBanner === null ? null : (
        <p
          data-testid={TEST_IDS.trainingChangesBanner}
          role="status"
          className="app-training-banner"
        >
          {view.changesBanner}
        </p>
      )}

      <header className="app-surface-card app-training-detail__head">
        <div className="app-training-detail__headline">
          <IonText>
            <h2 className="app-training-detail__title m-0">{view.typeName}</h2>
          </IonText>
          <TrainingStatusChip label={view.statusLabel} tone={view.statusTone} />
        </div>
        <IonNote>{`${view.dateLabel} · ${view.durationLabel}`}</IonNote>
        <p className="app-training-detail__candidate m-0">{view.candidateLabel}</p>
        <IonNote>{view.candidateNotice}</IonNote>
        {view.notes === null ? null : <p className="m-0">{view.notes}</p>}
      </header>

      {view.reviewNote === null ? null : (
        <section className="app-surface-card" aria-label={view.reviewNoteHeading}>
          <span className="app-eyebrow">{view.reviewNoteHeading}</span>
          <p className="m-0">{view.reviewNote}</p>
        </section>
      )}

      <section className="app-surface-card" aria-label={view.evidenceHeading}>
        <span className="app-eyebrow">{view.evidenceHeading}</span>
        <IonNote>{view.evidencePrivacyNotice}</IonNote>
        {view.evidence.length === 0 ? <IonNote>{view.evidenceEmptyLabel}</IonNote> : null}
        <ul className="app-training-chiplist">
          {view.evidence.map((item) => (
            <li key={item.id} data-testid={TEST_IDS.trainingEvidenceItem}>
              <span className="app-training-chiplist__kind">{item.kindLabel}</span>
              <span className="app-training-chiplist__value">{item.reference}</span>
              <TrainingStatusChip label={item.scanLabel} tone={item.scanTone} />
            </li>
          ))}
        </ul>
      </section>

      <section className="app-surface-card" aria-label={view.buddiesHeading}>
        <span className="app-eyebrow">{view.buddiesHeading}</span>
        {view.buddies.length === 0 ? <IonNote>{view.buddiesEmptyLabel}</IonNote> : null}
        <ul className="app-training-chiplist">
          {view.buddies.map((buddy) => (
            <li key={buddy.id} data-testid={TEST_IDS.trainingBuddyItem}>
              <span className="app-training-chiplist__value">{buddy.membershipId}</span>
              <TrainingStatusChip label={buddy.statusLabel} tone={buddy.statusTone} />
              {buddy.respondedLabel === null ? null : <IonNote>{buddy.respondedLabel}</IonNote>}
            </li>
          ))}
        </ul>
      </section>

      <section className="app-surface-card" aria-label={view.historyHeading}>
        <span className="app-eyebrow">{view.historyHeading}</span>
        <IonNote>{view.historyIntro}</IonNote>
        {view.history.length === 0 ? <IonNote>{view.historyEmptyLabel}</IonNote> : null}
        <ol data-testid={TEST_IDS.trainingHistoryList} className="app-training-history">
          {view.history.map((entry) => (
            <li key={entry.key} data-testid={TEST_IDS.trainingHistoryItem}>
              <TrainingStatusChip label={entry.label} tone={entry.tone} />
              <IonNote>{entry.timeText}</IonNote>
            </li>
          ))}
        </ol>
      </section>

      <div data-testid={TEST_IDS.trainingWorkflowBar} className="app-training-actions">
        {view.actions.map((action) => (
          <AppButton
            key={action.key}
            label={action.label}
            tone={action.tone === 'danger' ? 'danger' : 'primary'}
            loading={action.isBusy}
            onClick={action.onSelect}
            testId={action.testId}
          />
        ))}
      </div>
    </>
  );
}
