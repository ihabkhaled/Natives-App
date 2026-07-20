import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { ChartDataTable } from '@/shared/ui';

import type { PerformanceRadarChartProps } from './performance-radar-chart.types';

/**
 * Category radar, rendered in-house. A radar is only ever offered alongside
 * its text alternative — the table below carries the same averages, with
 * unevaluated categories reported as "not evaluated" rather than as zero.
 */
export function PerformanceRadarChart(props: PerformanceRadarChartProps): React.JSX.Element {
  const { chart } = props;
  return (
    <figure
      className="app-surface-card app-chart app-chart--radar"
      data-testid={TEST_IDS.performanceRadarChart}
    >
      <figcaption className="app-chart__caption">
        <IonText>
          <h3 className="app-chart__title m-0">{chart.title}</h3>
        </IonText>
        <IonNote>{chart.description}</IonNote>
      </figcaption>
      <svg
        viewBox={`0 0 ${String(chart.size)} ${String(chart.size)}`}
        role="img"
        aria-label={chart.description}
        className="app-chart__svg app-chart__svg--radar"
      >
        {chart.ringRadii.map((radius) => (
          <circle
            key={radius}
            className="app-chart__ring"
            cx={chart.center}
            cy={chart.center}
            r={radius}
          />
        ))}
        {chart.axes.map((axis) => (
          <line
            key={axis.key}
            className="app-chart__spoke"
            x1={chart.center}
            y1={chart.center}
            x2={axis.x}
            y2={axis.y}
          />
        ))}
        <polygon className="app-chart__polygon" points={chart.polygonPoints} />
      </svg>
      <ul className="app-chart__legend">
        {chart.axes.map((axis) => (
          <li key={axis.key} className="app-chart__legend-item">
            {axis.label}
          </li>
        ))}
      </ul>
      <ChartDataTable
        caption={chart.tableCaption}
        toggleLabel={chart.tableToggleLabel}
        columnLabels={chart.columnLabels}
        rows={chart.rows}
      />
    </figure>
  );
}
