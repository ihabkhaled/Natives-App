import { IonNote, IonText } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { ChartDataTable } from '@/shared/ui';

import type { PointsCategoryChartProps } from './points-category-chart.types';

/**
 * In-house SVG bar chart of the points each category contributed. No chart
 * vendor: the geometry arrives as prepared rectangles, and the same numbers
 * are always available in the tabular alternative below.
 */
export function PointsCategoryChart(props: PointsCategoryChartProps): React.JSX.Element {
  const { view } = props;
  return (
    <figure className="app-surface-card app-chart" data-testid={TEST_IDS.pointsCategoryChart}>
      <figcaption className="app-chart__caption">
        <IonText>
          <h3 className="app-chart__title m-0">{view.heading}</h3>
        </IonText>
        <IonNote>{view.description}</IonNote>
      </figcaption>
      {view.bars.length === 0 ? (
        <IonNote>{view.emptyLabel}</IonNote>
      ) : (
        <div className="app-chart__canvas">
          <svg
            viewBox={view.viewBox}
            role="img"
            aria-label={view.description}
            className="app-chart__svg app-chart__svg--bars"
          >
            {view.bars.map((bar) => (
              <g key={bar.key}>
                <rect
                  className="app-chart__bar"
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  rx={6}
                />
                <text className="app-chart__bar-label" x={8} y={bar.labelY}>
                  {`${bar.label} · ${bar.valueText}`}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
      <ChartDataTable
        caption={view.tableCaption}
        toggleLabel={view.tableToggleLabel}
        columnLabels={view.columnLabels}
        rows={view.tableRows}
      />
    </figure>
  );
}
