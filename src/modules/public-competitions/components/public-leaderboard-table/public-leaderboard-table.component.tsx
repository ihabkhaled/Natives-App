import { TEST_IDS } from '@/shared/config';

import type { PublicLeaderboardTableProps } from './public-leaderboard-table.types';

/**
 * The per-competition individual leaderboard. The bar behind each points cell
 * is the visualization — the repo's own CSS-meter idiom, drawn from the same
 * numbers the cells print — so it needs no chart library and no separate
 * tabular alternative: the table *is* the data, and the meter is decorative
 * (`aria-hidden`). Bar width uses a logical inline size, so it grows from the
 * right in Arabic without a second stylesheet.
 */
export function PublicLeaderboardTable(props: PublicLeaderboardTableProps): React.JSX.Element {
  const { labels } = props;
  return (
    <div className="app-showcase-scroll">
      <table className="app-showcase-board" data-testid={TEST_IDS.publicCompetitionLeaderboard}>
        <caption>{labels.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{labels.columnRank}</th>
            <th scope="col">{labels.columnPlayer}</th>
            <th scope="col">{labels.columnPoints}</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr
              key={row.key}
              data-testid={TEST_IDS.publicCompetitionLeaderboardRow}
              className={
                row.isLeader ? 'app-showcase-board__row app-showcase-board__row--leader' : undefined
              }
            >
              <td className="app-showcase-board__rank">{row.rankText}</td>
              <th scope="row" className="app-showcase-board__player">
                {row.displayName}
              </th>
              <td className="app-showcase-board__points">
                <span className="app-showcase-board__meter" aria-hidden="true">
                  <span
                    className="app-showcase-board__fill"
                    style={{ inlineSize: `${String(row.barPercent)}%` }}
                  />
                </span>
                <span className="app-showcase-board__value">{row.pointsText}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
