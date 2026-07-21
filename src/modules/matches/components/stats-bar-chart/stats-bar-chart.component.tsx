import { TEST_IDS } from '@/shared/config';
import { ChartDataTable, SectionPanel } from '@/shared/ui';

import type { StatsBarChartProps } from './stats-bar-chart.types';

/**
 * A CSS bar chart with a real tabular alternative underneath. The bars are
 * decorative (`aria-hidden`); the numbers a screen reader or a keyboard user
 * reaches are the ones in the table, and they come from the same source.
 */
export function StatsBarChart(props: StatsBarChartProps): React.JSX.Element {
  return (
    <SectionPanel heading={props.heading} testId={TEST_IDS.matchStatsChart}>
      <ul className="app-match-chart" aria-hidden="true">
        {props.bars.map((bar) => (
          <li key={bar.key} className="app-match-chart__row">
            <span className="app-match-chart__label">{bar.label}</span>
            <span className="app-match-chart__track">
              <span
                className="app-match-chart__fill"
                style={{ inlineSize: `${String(bar.percent)}%` }}
              />
            </span>
            <span className="app-match-chart__value">{bar.valueText}</span>
          </li>
        ))}
      </ul>
      <ChartDataTable
        caption={props.caption}
        toggleLabel={props.toggleLabel}
        columnLabels={props.columns}
        rows={props.rows}
      />
    </SectionPanel>
  );
}
