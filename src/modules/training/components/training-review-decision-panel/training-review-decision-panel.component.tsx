import { IonNote, IonText, IonTextarea } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton } from '@/shared/ui';

import { TrainingStatusChip } from '../training-status-chip';
import type { TrainingReviewDecisionPanelProps } from './training-review-decision-panel.types';

/**
 * The selected claim and its decision controls. Signals are advisory prompts
 * phrased as observations, and self-review replaces the actions with a plain
 * statement rather than a disabled button the reviewer would keep pressing.
 */
export function TrainingReviewDecisionPanel(
  props: TrainingReviewDecisionPanelProps,
): React.JSX.Element {
  const { view } = props;
  return (
    <>
      <div className="app-training-detail__headline">
        <IonText>
          <h3 className="app-training-detail__title m-0">{view.typeName}</h3>
        </IonText>
        <TrainingStatusChip label={view.statusLabel} tone={view.statusTone} />
      </div>
      <IonNote>{`${view.dateLabel} · ${view.durationLabel}`}</IonNote>
      <IonNote>{view.evidenceLabel}</IonNote>
      {view.notes === null ? null : <p className="m-0">{view.notes}</p>}

      <section
        data-testid={TEST_IDS.trainingReviewSignals}
        aria-label={view.signalsHeading}
        className="app-training-signals"
      >
        <span className="app-eyebrow">{view.signalsHeading}</span>
        <IonNote>{view.signalsIntro}</IonNote>
        {view.signals.length === 0 ? (
          <IonNote>{view.signalsNoneLabel}</IonNote>
        ) : (
          <ul className="app-training-signals__list">
            {view.signals.map((signal) => (
              <li key={signal.key}>{signal.label}</li>
            ))}
          </ul>
        )}
      </section>

      <span className="app-eyebrow">{view.decisionHeading}</span>
      {view.selfBlockedNotice === null ? null : (
        <IonNote color="warning" role="status">
          {view.selfBlockedNotice}
        </IonNote>
      )}
      <IonTextarea
        data-testid={TEST_IDS.trainingReviewNote}
        label={view.noteLabel}
        labelPlacement="stacked"
        placeholder={view.notePlaceholder}
        autoGrow
        rows={3}
        value={view.noteValue}
        onIonInput={(event) => {
          view.onNoteChange(event.detail.value ?? '');
        }}
      />
      {view.noteError === null ? null : (
        <IonNote color="danger" role="alert">
          {view.noteError}
        </IonNote>
      )}
      <div className="app-training-actions">
        {view.actions.map((action) => (
          <AppButton
            key={action.decision}
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
