import { IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, AsyncStateView, EmptyState, PageShell } from '@/shared/ui';

import { AnalyticsSeriesChart } from '../analytics-series-chart';
import { DimensionPicker } from '../dimension-picker';
import { PeriodTypePicker } from '../period-type-picker';
import { PLAYER_ANALYTICS_STATE_TEST_IDS } from './player-analytics-view.constants';
import type { PlayerAnalyticsScreenProps } from './player-analytics-view.types';

/**
 * One player's series, reached from the team screen or the member profile.
 * A foreign or unknown membership renders the designed not-found panel —
 * never a blank chart.
 */
export function PlayerAnalyticsScreen(props: PlayerAnalyticsScreenProps): React.JSX.Element {
  return (
    <PageShell title={props.title} testId={TEST_IDS.playerAnalyticsPage}>
      <section
        data-testid={TEST_IDS.playerAnalyticsView}
        aria-label={props.title}
        className="app-analytics flex flex-col gap-5"
      >
        <header className="app-screen-intro">
          <IonText>
            <p className="m-0 font-medium" data-testid={TEST_IDS.playerAnalyticsIdentity}>
              {props.identityLabel}
            </p>
          </IonText>
          <IonText color="medium">
            <p className="m-0 text-sm">{props.subtitle}</p>
          </IonText>
          <AppButton
            label={props.backLabel}
            tone="ghost"
            testId={TEST_IDS.playerAnalyticsBack}
            onClick={props.onBack}
          />
        </header>

        <div className="app-analytics__controls">
          <DimensionPicker controls={props.controls} />
          <PeriodTypePicker controls={props.controls} />
        </div>

        {props.isScopeMissing ? (
          <EmptyState title={props.notFoundTitle} message={props.notFoundMessage} />
        ) : (
          <AsyncStateView view={props} variant="card" {...PLAYER_ANALYTICS_STATE_TEST_IDS} />
        )}

        {props.status === 'ready' && props.chart !== null && !props.isScopeMissing ? (
          <AnalyticsSeriesChart chart={props.chart} />
        ) : null}
      </section>
    </PageShell>
  );
}
