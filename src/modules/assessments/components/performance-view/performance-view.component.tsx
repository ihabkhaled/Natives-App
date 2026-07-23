import { IonSegment, IonSegmentButton, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AsyncStateView, PageShell } from '@/shared/ui';

import { CoachFeedbackPanel } from '../coach-feedback-panel';
import { MeasurementHistoryPanel } from '../measurement-history-panel';
import { PerformanceScoresTab } from '../performance-scores-tab';
import { PERFORMANCE_STATE_TEST_IDS } from './performance-view.constants';
import type { PerformanceViewProps } from './performance-view.types';

/**
 * Member performance area: three deep-linkable tabs behind one nav entry —
 * scores (+ own score card), own measurements, and coach feedback with the
 * acknowledgement flow.
 */
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
        {props.tabs.length > 1 ? (
          <IonSegment
            data-testid={TEST_IDS.performanceTabBar}
            aria-label={props.tabBarLabel}
            value={props.activeTab}
            onIonChange={(event) => {
              props.onTabChange(String(event.detail.value));
            }}
          >
            {props.tabs.map((tab) => (
              <IonSegmentButton
                key={tab.id}
                value={tab.id}
                data-testid={`${TEST_IDS.performanceTab}-${tab.id}`}
                className="min-h-[44px]"
              >
                {tab.label}
              </IonSegmentButton>
            ))}
          </IonSegment>
        ) : null}
        <AsyncStateView view={props} variant="dashboard" {...PERFORMANCE_STATE_TEST_IDS} />
        {props.status === 'ready' ? (
          <>
            {props.activeTab === 'scores' ? <PerformanceScoresTab {...props} /> : null}
            {props.activeTab === 'measurements' ? (
              <MeasurementHistoryPanel view={props.measurements} />
            ) : null}
            {props.activeTab === 'feedback' ? (
              <CoachFeedbackPanel
                title={props.feedbackTitle}
                emptyTitle={props.feedbackEmptyTitle}
                emptyMessage={props.feedbackEmptyMessage}
                cards={props.feedbackCards}
                isAcknowledging={props.isAcknowledging}
                onAcknowledge={props.onAcknowledge}
              />
            ) : null}
          </>
        ) : null}
      </section>
    </PageShell>
  );
}
