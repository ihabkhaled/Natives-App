import { IonSelect, IonSelectOption } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { DevelopmentGoalsPanel } from '../development-goals-panel';
import { PerformanceRadarChart } from '../performance-radar-chart';
import { PerformanceScoreCard } from '../performance-score-card';
import { PerformanceTrendChart } from '../performance-trend-chart';
import type { PerformanceScoresTabProps } from './performance-scores-tab.types';

/** The scores tab: charts, the own score card, and development goals. */
export function PerformanceScoresTab(props: PerformanceScoresTabProps): React.JSX.Element {
  return (
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
      {props.scoreCard === null ? null : <PerformanceScoreCard view={props.scoreCard} />}
      <DevelopmentGoalsPanel
        title={props.goalsTitle}
        emptyTitle={props.goalsEmptyTitle}
        emptyMessage={props.goalsEmptyMessage}
        goals={props.goals}
        isTransitioning={props.isTransitioningGoal}
        onTransition={props.onGoalTransition}
      />
    </>
  );
}
