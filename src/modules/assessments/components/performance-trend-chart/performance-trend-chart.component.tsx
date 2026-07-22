import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { ChartDataTable } from '@/shared/ui';

import { CHART_GEOMETRY } from '../../constants/assessments.constants';
import type { PerformanceTrendChartProps } from './performance-trend-chart.types';

/**
 * In-house SVG trend line. No chart vendor: the geometry arrives as prepared
 * path data. Unevaluated periods break the line instead of dropping to zero,
 * and the same numbers are always available in the tabular alternative below.
 */
export function PerformanceTrendChart(props: PerformanceTrendChartProps): React.JSX.Element {
  const { chart } = props;
  return (
    <figure className="app-surface-card app-chart" data-testid={TEST_IDS.performanceTrendChart}>
      <figcaption className="app-chart__caption">
        <IonText>
          <h3 className="app-chart__title m-0">{chart.title}</h3>
        </IonText>
        <IonNote>{chart.description}</IonNote>
      </figcaption>
      <div className="app-chart__canvas">
        <svg
          viewBox={`0 0 ${String(CHART_GEOMETRY.width)} ${String(CHART_GEOMETRY.height)}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={chart.description}
          className="app-chart__svg app-chart__svg--trend"
        >
          <path className="app-chart__area" d={chart.areaPath} />
          <path className="app-chart__line" d={chart.linePath} />
          {chart.markers.map((marker) => (
            <circle key={marker.key} className="app-chart__dot" cx={marker.x} cy={marker.y} r={4} />
          ))}
        </svg>
        <ul className="app-chart__axis">
          {chart.axisTicks.map((tick) => (
            <li key={tick.key} className="app-chart__tick">
              {tick.label}
            </li>
          ))}
        </ul>
      </div>
      {chart.hasGap ? <IonNote className="app-chart__note">{chart.gapNotice}</IonNote> : null}
      {chart.lowDataNotice === null ? null : (
        <IonNote className="app-chart__note">{chart.lowDataNotice}</IonNote>
      )}
      <ChartDataTable
        caption={chart.tableCaption}
        toggleLabel={chart.tableToggleLabel}
        columnLabels={chart.columnLabels}
        rows={chart.rows}
      />
    </figure>
  );
}
