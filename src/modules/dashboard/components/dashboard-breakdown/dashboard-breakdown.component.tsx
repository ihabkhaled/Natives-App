import { DASHBOARD_BREAKDOWN_TEST_IDS } from './dashboard-breakdown.constants';
import type { DashboardBreakdownProps } from './dashboard-breakdown.types';

/**
 * Accessible tabular alternative to a chart: a real table with a caption and
 * row headers, so screen readers and keyboard users get the same breakdown.
 * Missing values render muted so a null projection never reads as zero.
 */
export function DashboardBreakdown(props: DashboardBreakdownProps): React.JSX.Element {
  return (
    <table className="w-full text-sm" data-testid={DASHBOARD_BREAKDOWN_TEST_IDS.table}>
      <caption className="sr-only">{props.caption}</caption>
      <tbody>
        {props.rows.map((row) => (
          <tr key={row.key}>
            <th scope="row" className="py-1 text-start font-normal">
              {row.label}
            </th>
            <td className={row.hasValue ? 'py-1 text-end' : 'py-1 text-end opacity-60'}>
              {row.valueText}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
