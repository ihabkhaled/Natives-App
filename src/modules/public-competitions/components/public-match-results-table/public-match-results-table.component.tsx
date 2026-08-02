import { Fragment } from 'react';

import { TEST_IDS } from '@/shared/config';
import { StatusChip } from '@/shared/ui';

import type { PublicMatchResultsTableProps } from './public-match-results-table.types';

/**
 * Match results as a real `<table>` with row headers. The opponent cell is a
 * disclosure button: expanding it reveals that game's individual player
 * scores in a nested table, so the detail is one keystroke away without a
 * second navigation.
 *
 * The visible score is the bidi-isolated pair (`8 – 6` stays `8 – 6` in
 * Arabic); the screen-reader line spells out who scored what, because a
 * neutral dash is not a result anybody should have to infer.
 */
export function PublicMatchResultsTable(props: PublicMatchResultsTableProps): React.JSX.Element {
  const { labels } = props;
  return (
    <div className="app-showcase-scroll">
      <table className="app-showcase-table" data-testid={TEST_IDS.publicCompetitionMatchesTable}>
        <caption>{labels.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{labels.columnOpponent}</th>
            <th scope="col">{labels.columnScore}</th>
            <th scope="col">{labels.columnDate}</th>
            <th scope="col">{labels.columnOutcome}</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <Fragment key={row.key}>
              <tr
                data-testid={TEST_IDS.publicCompetitionMatchRow}
                className={`app-showcase-table__row app-showcase-table__row--${row.outcome}`}
              >
                <th scope="row">
                  <button
                    type="button"
                    className="app-showcase-table__toggle"
                    aria-expanded={props.expandedKey === row.key}
                    data-testid={TEST_IDS.publicCompetitionMatchToggle}
                    onClick={() => {
                      props.onToggle(row.key);
                    }}
                  >
                    <span className="app-showcase-table__opponent">{row.opponentName}</span>
                    <span className="app-showcase-table__hint">
                      {props.expandedKey === row.key ? labels.hidePlayers : labels.showPlayers}
                    </span>
                  </button>
                </th>
                <td
                  className="app-showcase-table__score"
                  data-testid={TEST_IDS.publicCompetitionMatchScore}
                >
                  <span aria-hidden={row.scoreReadout !== null}>
                    {row.scoreText ?? labels.scorePending}
                  </span>
                  {row.scoreReadout === null ? null : (
                    <span className="sr-only">{row.scoreReadout}</span>
                  )}
                </td>
                <td>{row.dateText ?? labels.datePending}</td>
                <td>
                  <StatusChip label={labels.outcomes[row.outcome]} tone={row.outcomeTone} />
                </td>
              </tr>
              {props.expandedKey === row.key ? (
                <tr data-testid={TEST_IDS.publicCompetitionMatchPlayers}>
                  <td colSpan={4} className="app-showcase-table__players">
                    {row.players.length === 0 ? (
                      <p className="app-showcase-table__players-empty">{labels.playersEmpty}</p>
                    ) : (
                      <table className="app-showcase-subtable">
                        <caption>{labels.playersCaption}</caption>
                        <thead>
                          <tr>
                            <th scope="col">{labels.columnPlayer}</th>
                            <th scope="col">{labels.columnGoals}</th>
                            <th scope="col">{labels.columnAssists}</th>
                            <th scope="col">{labels.columnBlocks}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.players.map((player) => (
                            <tr key={player.key}>
                              <th scope="row">{player.nameText}</th>
                              <td>{player.goalsText}</td>
                              <td>{player.assistsText}</td>
                              <td>{player.blocksText}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
