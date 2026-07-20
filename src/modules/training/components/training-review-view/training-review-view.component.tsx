import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, PageShell, SelectField } from '@/shared/ui';

import { TrainingReviewDecisionPanel } from '../training-review-decision-panel';
import { TrainingStatusChip } from '../training-status-chip';
import { TRAINING_REVIEW_STATE_TEST_IDS } from './training-review-view.constants';
import type { TrainingReviewViewProps } from './training-review-view.types';

/**
 * Reviewer workspace: the bounded queue on the lead side, the selected claim
 * and its decision panel on the trail side. Anti-abuse hints are presented as
 * neutral prompts to look at, never as an accusation or an automatic verdict.
 */
export function TrainingReviewScreen(props: TrainingReviewViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.trainingReviewPage}>
      <section
        data-testid={TEST_IDS.trainingReviewView}
        aria-label={props.title}
        className="app-training-review flex flex-col gap-5"
      >
        <header className="app-screen-intro app-training-review__intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
          <SelectField
            testId={TEST_IDS.trainingStatusFilter}
            label={props.statusFilterLabel}
            value={props.statusFilter}
            options={props.statusOptions}
            onChange={props.onStatusFilterChange}
          />
        </header>

        <AsyncStateView view={props} variant="list" {...TRAINING_REVIEW_STATE_TEST_IDS} />

        {props.status === 'ready' ? (
          <div className="app-training-review__grid">
            <section aria-label={props.queueHeading} className="app-training-review__queue">
              <span className="app-eyebrow">{props.queueHeading}</span>
              <IonNote>{props.queueCountLabel}</IonNote>
              <ul data-testid={TEST_IDS.trainingReviewQueue} className="app-training-list">
                {props.items.map((item) => (
                  <li
                    key={item.id}
                    data-testid={TEST_IDS.trainingReviewQueueItem}
                    className={
                      item.isSelected
                        ? 'app-surface-card app-training-card app-training-card--selected'
                        : 'app-surface-card app-training-card'
                    }
                  >
                    <div className="app-training-card__main">
                      <IonText>
                        <h3 className="app-training-card__title m-0">{item.typeName}</h3>
                      </IonText>
                      <IonNote>{item.dateLabel}</IonNote>
                    </div>
                    <div className="app-training-card__meta">
                      <TrainingStatusChip label={item.statusLabel} tone={item.statusTone} />
                      <AppButton
                        label={item.openLabel}
                        tone="ghost"
                        onClick={() => {
                          props.onSelect(item.id);
                        }}
                        testId={TEST_IDS.trainingSubmissionOpen}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section
              data-testid={TEST_IDS.trainingReviewDetail}
              aria-live="polite"
              className="app-surface-card app-training-review__detail"
            >
              {props.detail === null ? (
                <IonNote>{props.selectPrompt}</IonNote>
              ) : (
                <TrainingReviewDecisionPanel view={props.detail} />
              )}
            </section>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
