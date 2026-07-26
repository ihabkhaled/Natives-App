import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { ChartDataTable } from '@/shared/ui';

import { ANALYTICS_CHART_GEOMETRY } from '../../constants/analytics.constants';
import type { AnalyticsSeriesChartProps } from './analytics-series-chart.types';

/**
 * The in-house SVG series line. Geometry arrives prepared; a null period
 * breaks the line (with the gap notice below) instead of dropping to zero,
 * and the same numbers are always reachable in the tabular twin. The footer
 * cites the server's summary, benchmark, and calculation version verbatim.
 */
export function AnalyticsSeriesChart(props: AnalyticsSeriesChartProps): React.JSX.Element {
  const { chart } = props;
  return (
    <figure className="app-surface-card app-chart" data-testid={TEST_IDS.analyticsSeriesChart}>
      <figcaption className="app-chart__caption">
        <IonText>
          <h3 className="app-chart__title m-0">{chart.title}</h3>
        </IonText>
        <IonNote>{chart.description}</IonNote>
        <IonNote data-testid={TEST_IDS.analyticsDirectionLegend}>
          {`${chart.unitLabel} — ${chart.directionLegend}`}
        </IonNote>
      </figcaption>
      <div className="app-chart__canvas">
        <svg
          viewBox={`0 0 ${String(ANALYTICS_CHART_GEOMETRY.width)} ${String(ANALYTICS_CHART_GEOMETRY.height)}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={chart.description}
          className="app-chart__svg app-chart__svg--trend"
        >
          <path className="app-chart__line" d={chart.geometry.linePath} />
          {chart.geometry.markers.map((marker) => (
            <circle key={marker.key} className="app-chart__dot" cx={marker.x} cy={marker.y} r={4} />
          ))}
        </svg>
        <ul className="app-chart__axis">
          {chart.geometry.ticks.map((tick) => (
            <li key={tick.key} className="app-chart__tick">
              {tick.label}
            </li>
          ))}
        </ul>
      </div>
      {chart.gapNotice === null ? null : (
        <IonNote className="app-chart__note" data-testid={TEST_IDS.analyticsGapNotice}>
          {chart.gapNotice}
        </IonNote>
      )}
      <div className="app-chart__citations" data-testid={TEST_IDS.analyticsSeriesSummary}>
        <p className="m-0">{chart.summary}</p>
        <IonNote>{chart.benchmark}</IonNote>
        <IonNote>{chart.calculationVersion}</IonNote>
        <IonNote>{chart.computedAt}</IonNote>
      </div>
      <ChartDataTable
        caption={chart.tableCaption}
        toggleLabel={chart.tableToggleLabel}
        columnLabels={chart.tableColumnLabels}
        rows={chart.tableRows}
      />
    </figure>
  );
}
