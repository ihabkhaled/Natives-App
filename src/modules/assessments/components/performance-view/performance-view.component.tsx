import { IonSelect, IonSelectOption, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell } from '@/shared/ui';

import { CoachFeedbackPanel } from '../coach-feedback-panel';
import { DevelopmentGoalsPanel } from '../development-goals-panel';
import { PerformanceRadarChart } from '../performance-radar-chart';
import { PerformanceTrendChart } from '../performance-trend-chart';
import { PERFORMANCE_STATE_TEST_IDS } from './performance-view.constants';
import type { PerformanceViewProps } from './performance-view.types';

/** Player performance: accessible charts, coach feedback, development goals. */
export function PerformanceView(props: PerformanceViewProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.performancePage}>
      <section
        data-testid={TEST_IDS.performanceView}
        aria-label={props.title}
        className="app-performance flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
        </header>
        <AsyncStateView view={props} variant="dashboard" {...PERFORMANCE_STATE_TEST_IDS} />
        {props.status === 'ready' ? (
          <>
            {/* Charts need the staff-scoped catalog; when it is not readable
                the whole block stays out instead of an empty select posing as
                a chart area. */}
            {props.trend === null && props.radar === null ? null : (
              <div className="app-performance__charts">
                <div className="app-performance__chart-head">
                  <IonSelect
                    data-testid={TEST_IDS.performanceMetricSelect}
                    label={props.metricSelectLabel}
                    value={props.selectedMetricId}
                    onIonChange={(event) => {
                      props.onSelectMetric(event.detail.value as string);
                    }}
                  >
                    {props.metricOptions.map((option) => (
                      <IonSelectOption key={option.value} value={option.value}>
                        {option.label}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>
                {props.trend === null ? null : <PerformanceTrendChart chart={props.trend} />}
                {props.radar === null ? null : <PerformanceRadarChart chart={props.radar} />}
              </div>
            )}
            <CoachFeedbackPanel
              title={props.feedbackTitle}
              emptyTitle={props.feedbackEmptyTitle}
              emptyMessage={props.feedbackEmptyMessage}
              cards={props.feedbackCards}
              isAcknowledging={props.isAcknowledging}
              onAcknowledge={props.onAcknowledge}
            />
            <DevelopmentGoalsPanel
              title={props.goalsTitle}
              emptyTitle={props.goalsEmptyTitle}
              emptyMessage={props.goalsEmptyMessage}
              goals={props.goals}
              isTransitioning={props.isTransitioningGoal}
              onTransition={props.onGoalTransition}
            />
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
