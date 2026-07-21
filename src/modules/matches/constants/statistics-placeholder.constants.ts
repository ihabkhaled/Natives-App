import type { MatchStatistics } from '../types/matches.types';

/**
 * What the statistics screen renders while the projection is loading, absent,
 * or forbidden. It carries no players, so the screen shows its designed empty
 * state rather than a table of invented zeros.
 */
export const EMPTY_MATCH_STATISTICS: MatchStatistics = {
  matchId: '',
  rulesetKey: '',
  rulesetVersion: 0,
  statsEngineVersion: '',
  lineupsRecorded: false,
  playsRecorded: false,
  opponentErrorAttribution: false,
  team: {
    pointsStarted: 0,
    pointsCompleted: 0,
    holds: 0,
    breaks: 0,
    opponentHolds: 0,
    opponentBreaks: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    turnovers: null,
    opponentErrors: null,
  },
  players: [],
};
