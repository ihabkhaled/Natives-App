/**
 * Public competitions showcase test ids (the signed-out results pages). Split
 * out of the aggregate catalog so TEST_IDS stays within its size budget; raw
 * test ids remain forbidden everywhere else (ESLint:
 * architecture/no-inline-test-ids).
 */
export const PUBLIC_COMPETITIONS_TEST_IDS = {
  publicCompetitionsPage: 'public-competitions-page',
  publicCompetitionsList: 'public-competitions-list',
  publicCompetitionsLoading: 'public-competitions-loading',
  publicCompetitionsError: 'public-competitions-error',
  publicCompetitionsOffline: 'public-competitions-offline',
  publicCompetitionsForbidden: 'public-competitions-forbidden',
  publicCompetitionsEmpty: 'public-competitions-empty',
  publicCompetitionsSeamNotice: 'public-competitions-seam-notice',
  publicCompetitionCard: 'public-competition-card',
  publicCompetitionCardLink: 'public-competition-card-link',
  publicCompetitionFinish: 'public-competition-finish',
  publicCompetitionDetailPage: 'public-competition-detail-page',
  publicCompetitionDetailLoading: 'public-competition-detail-loading',
  publicCompetitionDetailError: 'public-competition-detail-error',
  publicCompetitionDetailOffline: 'public-competition-detail-offline',
  publicCompetitionDetailForbidden: 'public-competition-detail-forbidden',
  publicCompetitionDetailEmpty: 'public-competition-detail-empty',
  publicCompetitionBack: 'public-competition-back',
  publicCompetitionMatchesTable: 'public-competition-matches-table',
  publicCompetitionMatchRow: 'public-competition-match-row',
  publicCompetitionMatchScore: 'public-competition-match-score',
  publicCompetitionMatchToggle: 'public-competition-match-toggle',
  publicCompetitionMatchPlayers: 'public-competition-match-players',
  publicCompetitionLeaderboard: 'public-competition-leaderboard',
  publicCompetitionLeaderboardRow: 'public-competition-leaderboard-row',
} as const;
