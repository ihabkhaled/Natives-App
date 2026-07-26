import { IonNote } from '@/packages/ionic';
import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import { StandingsSourceBadge } from '../standings-source-badge';
import type { StandingsTableProps } from './standings-table.types';

/**
 * The standings table: a real `<table>` with row headers so a screen reader
 * reaches every place. Wide stat columns collapse away on narrow screens
 * (never a page-wide horizontal scroll); the diff is the only client-derived
 * number and the note below says so. The qualification `undecided` renders as
 * muted text, not a chip — honesty, not alarm.
 */
export function StandingsTable(props: StandingsTableProps): React.JSX.Element {
  const { view } = props;
  return (
    <div className="app-standings__scroll">
      <table data-testid={TEST_IDS.standingsTable} className="app-standings-table">
        <caption>{view.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{view.columns.place}</th>
            <th scope="col">{view.columns.entrant}</th>
            <th scope="col">{view.columns.played}</th>
            <th scope="col" className="app-standings-table__wide">
              {view.columns.wins}
            </th>
            <th scope="col" className="app-standings-table__wide">
              {view.columns.losses}
            </th>
            <th scope="col" className="app-standings-table__wide">
              {view.columns.ties}
            </th>
            <th scope="col" className="app-standings-table__wide">
              {view.columns.pointsFor}
            </th>
            <th scope="col" className="app-standings-table__wide">
              {view.columns.pointsAgainst}
            </th>
            <th scope="col" className="app-standings-table__wide">
              {view.columns.diff}
            </th>
            <th scope="col">{view.columns.points}</th>
            <th scope="col" className="app-standings-table__wide">
              {view.columns.spirit}
            </th>
            <th scope="col">{view.columns.qualification}</th>
          </tr>
        </thead>
        <tbody>
          {view.rows.map((row) => (
            <tr
              key={row.key}
              data-testid={TEST_IDS.standingsRow}
              className={
                row.isOurTeam
                  ? 'app-standings-table__row app-standings-table__row--ours'
                  : 'app-standings-table__row'
              }
            >
              <th scope="row" className="app-standings-table__place">
                {row.place}
              </th>
              <td className="app-standings-table__entrant">
                <span>{row.entrantLabel}</span>
                {row.sourceBadge === null ? null : (
                  <StandingsSourceBadge badge={row.sourceBadge} provenance={row.provenance} />
                )}
              </td>
              <td>{row.played}</td>
              <td className="app-standings-table__wide">{row.wins}</td>
              <td className="app-standings-table__wide">{row.losses}</td>
              <td className="app-standings-table__wide">{row.ties}</td>
              <td className="app-standings-table__wide">{row.pointsFor}</td>
              <td className="app-standings-table__wide">{row.pointsAgainst}</td>
              <td className="app-standings-table__wide">{row.diff}</td>
              <td className="app-standings-table__points">{row.points}</td>
              <td className="app-standings-table__wide">{row.spirit}</td>
              <td>
                {row.qualification === null ? (
                  <IonNote>{row.qualificationMutedLabel}</IonNote>
                ) : (
                  <StatusChip label={row.qualification.label} tone={row.qualification.tone} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <IonNote className="app-standings__note">{view.diffDerivedNote}</IonNote>
      <div className="app-standings__footer" data-testid={TEST_IDS.standingsRuleFooter}>
        <IonNote>{view.ruleFooter}</IonNote>
        <button
          type="button"
          className="app-standings__rules-link"
          data-testid={TEST_IDS.standingsRulesLink}
          onClick={view.onOpenRules}
        >
          {view.rulesLinkLabel}
        </button>
      </div>
    </div>
  );
}
