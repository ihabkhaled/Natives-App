import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';

import { RankExplanationPanel } from '../rank-explanation-panel';
import type { LeaderboardTableProps } from './leaderboard-table.types';

/**
 * The standings table. It is a real table with row headers so a screen reader
 * reaches every rank, and movement is carried by a glyph plus a text label —
 * never colour alone. Members on zero stay in the table, rendered muted.
 */
export function LeaderboardTable(props: LeaderboardTableProps): React.JSX.Element {
  const { view } = props;
  return (
    <div className="app-leaderboard__scroll">
      <table data-testid={TEST_IDS.leaderboardTable} className="app-leaderboard-table">
        <caption>{view.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{view.columnRank}</th>
            <th scope="col">{view.columnMember}</th>
            <th scope="col">{view.columnTotal}</th>
            <th scope="col">{view.columnMovement}</th>
            <th scope="col">{view.columnBadges}</th>
          </tr>
        </thead>
        {view.rows.map((row) => (
          <tbody key={row.membershipId}>
            <tr
              data-testid={TEST_IDS.leaderboardRow}
              className={
                row.isZero
                  ? 'app-leaderboard-table__row app-leaderboard-table__row--zero'
                  : 'app-leaderboard-table__row'
              }
            >
              <th scope="row" className="app-leaderboard-table__rank">
                {row.rankText}
                {row.tiedLabel === null ? null : (
                  <span className="app-leaderboard-table__tie">{row.tiedLabel}</span>
                )}
              </th>
              <td>{row.memberLabel}</td>
              <td className="app-leaderboard-table__total">{row.totalText}</td>
              <td data-testid={TEST_IDS.leaderboardMovement}>
                <span aria-hidden="true" className="app-leaderboard-table__glyph">
                  {row.movementGlyph}
                </span>
                <span className="app-leaderboard-table__movement">{row.movementLabel}</span>
                <IonNote>{row.movementDetail}</IonNote>
              </td>
              <td>
                {row.badgeCountLabel === null ? null : (
                  <span className="app-leaderboard-table__badges">{row.badgeCountLabel}</span>
                )}
                <button
                  type="button"
                  data-testid={TEST_IDS.leaderboardExplainToggle}
                  aria-expanded={row.isExpanded}
                  className="app-leaderboard-table__explain"
                  onClick={() => {
                    view.onToggleExplain(row.membershipId);
                  }}
                >
                  {row.explainLabel}
                </button>
              </td>
            </tr>
            {row.isExpanded ? (
              <tr>
                <td colSpan={5}>
                  <RankExplanationPanel view={row.explanation} />
                </td>
              </tr>
            ) : null}
          </tbody>
        ))}
      </table>
    </div>
  );
}
