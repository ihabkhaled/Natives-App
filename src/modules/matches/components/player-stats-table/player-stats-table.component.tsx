import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { AppButton, SectionPanel } from '@/shared/ui';

import type { PlayerStatsTableProps } from './player-stats-table.types';

/**
 * Every rostered player, including the ones with nothing recorded.
 *
 * A measured zero renders "0"; a measure the stream cannot support renders
 * "not enough data". A player whose whole line is a measured zero keeps their
 * row and carries an explicit note, because silently omitting them would make
 * the table look complete while hiding half the squad.
 */
export function PlayerStatsTable(props: PlayerStatsTableProps): React.JSX.Element {
  const { view } = props;
  return (
    <SectionPanel
      heading={view.playersHeading}
      intro={view.playersIntro}
      notice={view.incompleteNotice}
      testId={TEST_IDS.matchStatsPlayers}
    >
      <IonNote>{view.playerCountLabel}</IonNote>
      <div className="app-match-stats__scroll">
        <table className="app-match-stats__table">
          <caption className="sr-only">{view.playersCaption}</caption>
          <thead>
            <tr>
              {view.playerColumns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
              <th scope="col">
                <span className="sr-only">{view.reportHeading}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {view.playerRows.map((row) => (
              <tr
                key={row.membershipId}
                data-testid={TEST_IDS.matchStatsPlayerRow}
                className={row.hasNoContribution ? 'app-match-stats__row--quiet' : undefined}
              >
                <th scope="row">
                  {row.name}
                  <IonNote className="app-match-stats__badge">{row.rosteredLabel}</IonNote>
                  {row.zeroNotice === null ? null : (
                    <IonNote className="app-match-stats__badge">{row.zeroNotice}</IonNote>
                  )}
                </th>
                {row.cells.map((cell, index) => (
                  <td key={`${row.membershipId}-${String(index)}`}>{cell}</td>
                ))}
                <td>
                  <AppButton
                    label={row.openLabel}
                    tone="ghost"
                    testId={TEST_IDS.matchStatsPlayerOpen}
                    onClick={() => {
                      view.onOpenReport(row.membershipId);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}
