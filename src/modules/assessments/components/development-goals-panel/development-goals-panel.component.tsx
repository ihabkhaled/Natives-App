import { IonNote, IonText } from '@/packages/ionic';
import { cx } from '@/packages/ui-classes';
import { TEST_IDS } from '@/shared/config';
import { AppButton, EmptyState } from '@/shared/ui';

import { AssessmentStatusChip } from '../assessment-status-chip';
import type { DevelopmentGoalsPanelProps } from './development-goals-panel.types';

/**
 * Development goals with their action plans. Unmeasured progress shows its own
 * copy and no meter — a goal that was never measured is not a goal at 0%.
 */
export function DevelopmentGoalsPanel(props: DevelopmentGoalsPanelProps): React.JSX.Element {
  return (
    <section
      className="app-goals-panel"
      data-testid={TEST_IDS.developmentGoalsPanel}
      aria-label={props.title}
    >
      <IonText>
        <h2 className="app-eyebrow app-panel__title m-0">{props.title}</h2>
      </IonText>
      {props.goals.length === 0 ? (
        <EmptyState title={props.emptyTitle} message={props.emptyMessage} />
      ) : null}
      {props.goals.map((goal) => (
        <article
          key={goal.id}
          className="app-surface-card app-goal-card"
          data-testid={TEST_IDS.developmentGoalCard}
        >
          <header className="app-goal-card__head">
            <IonText>
              <h3 className="app-goal-card__title m-0">{goal.title}</h3>
            </IonText>
            <AssessmentStatusChip label={goal.statusLabel} tone={goal.statusTone} />
          </header>
          {goal.description === null ? null : (
            <IonNote className="app-goal-card__description">{goal.description}</IonNote>
          )}
          <div className="app-goal-card__facts">
            {goal.targetLabel === null ? null : (
              <span className="app-metric-tag">{goal.targetLabel}</span>
            )}
            {goal.baselineLabel === null ? null : (
              <span className="app-metric-tag">{goal.baselineLabel}</span>
            )}
            <span className="app-metric-tag">{goal.dueLabel}</span>
          </div>
          <div className="app-goal-card__progress" data-testid={TEST_IDS.developmentGoalProgress}>
            <span className="app-goal-card__progress-label">{goal.progressLabel}</span>
            {goal.progressPercent === null ? null : (
              <span
                className="app-goal-card__track"
                role="progressbar"
                aria-label={goal.title}
                aria-valuenow={goal.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span
                  className="app-goal-card__fill"
                  style={{ inlineSize: `${String(goal.progressPercent)}%` }}
                />
              </span>
            )}
          </div>
          <IonText>
            <h4 className="app-eyebrow app-goal-card__actions-title m-0">{goal.actionsLabel}</h4>
          </IonText>
          <ul className="app-goal-card__actions">
            {goal.actions.map((action) => (
              <li
                key={action.key}
                className={cx('app-goal-action', action.done ? 'app-goal-action--done' : undefined)}
                data-testid={TEST_IDS.developmentGoalAction}
              >
                <span className="app-goal-action__state">{action.stateLabel}</span>
                <span className="app-goal-action__text">{action.description}</span>
                {action.dueLabel === null ? null : (
                  <IonNote className="app-goal-action__due">{action.dueLabel}</IonNote>
                )}
              </li>
            ))}
          </ul>
          {goal.transition === null ? null : (
            <AppButton
              label={goal.transition.label}
              tone="secondary"
              loading={props.isTransitioning}
              testId={TEST_IDS.developmentGoalTransition}
              onClick={() => {
                props.onTransition(goal.id);
              }}
            />
          )}
        </article>
      ))}
    </section>
  );
}
