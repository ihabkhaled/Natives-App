import { TEST_IDS } from '@/shared/config';

import { MATCH_STATUS } from './matches.constants';
import type { MatchScoreboard } from '../types/matches.types';

/** How many members the scorer/assist pickers and the stats table resolve. */
export const MATCH_ROSTER_PAGE_SIZE = 100;

/**
 * The shape the screen renders while the real scoreboard is loading, absent,
 * or forbidden. Scoring is closed on it, so no control is ever live against a
 * placeholder.
 */
export const EMPTY_SCOREBOARD: MatchScoreboard = {
  matchId: '',
  status: MATCH_STATUS.Scheduled,
  ourScore: 0,
  opponentScore: 0,
  period: 1,
  streamVersion: 0,
  recordVersion: 0,
  result: 'undecided',
  rulesetKey: '',
  rulesetVersion: 0,
  target: 1,
  capApplied: 'none',
  complete: false,
  halftimeReached: false,
  scoringOpen: false,
  timeouts: { allowance: 0, remainingForUs: 0, remainingForThem: 0 },
};

/** The value the scorer/assist pickers use for "not attributed". */
export const UNATTRIBUTED_VALUE = 'unattributed';

export const MATCHES_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.matchesLoading,
  errorTestId: TEST_IDS.matchesError,
  offlineTestId: TEST_IDS.matchesOffline,
  forbiddenTestId: TEST_IDS.matchesForbidden,
  emptyTestId: TEST_IDS.matchesEmpty,
} as const;

export const SCOREBOARD_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.scoreboardLoading,
  errorTestId: TEST_IDS.scoreboardError,
  offlineTestId: TEST_IDS.scoreboardOffline,
  forbiddenTestId: TEST_IDS.scoreboardForbidden,
  emptyTestId: TEST_IDS.scoreboardEmpty,
} as const;

export const MATCH_STATS_STATE_TEST_IDS = {
  loadingTestId: TEST_IDS.matchStatsLoading,
  errorTestId: TEST_IDS.matchStatsError,
  offlineTestId: TEST_IDS.matchStatsOffline,
  forbiddenTestId: TEST_IDS.matchStatsForbidden,
  emptyTestId: TEST_IDS.matchStatsEmpty,
} as const;
