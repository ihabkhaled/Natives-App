import { TEST_IDS } from '@/shared/config';

import type { ChartDataTableProps } from './chart-data-table.types';

/**
 * The tabular alternative every chart in this module ships with. It is a real
 * table inside a native disclosure, so keyboard and screen-reader users reach
 * exactly the numbers the SVG draws — including the "not evaluated" gaps.
 */
export function ChartDataTable(props: ChartDataTableProps): React.JSX.Element {
  return (
    <details className="app-chart-table">
      <summary className="app-chart-table__toggle" data-testid={TEST_IDS.chartDataToggle}>
        {props.toggleLabel}
      </summary>
      <div className="app-chart-table__scroll">
        <table data-testid={TEST_IDS.chartDataTable}>
          <caption>{props.caption}</caption>
          <thead>
            <tr>
              {props.columnLabels.map((label) => (
                <th key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                <td>{row.valueText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
