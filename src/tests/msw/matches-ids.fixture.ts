import { MOCK_PRACTICE } from './mock-data.constants';

/** Canonical team-scoped match contract identifiers. */
export const MOCK_MATCHES = {
  teamId: MOCK_PRACTICE.teamId,
  seasonId: '20000000-0000-4000-8000-000000000001',
  competitionId: '20000000-0000-4000-8000-000000000002',
  fixtureId: '20000000-0000-4000-8000-000000000003',
  rosterId: '20000000-0000-4000-8000-000000000004',
  rulesetId: '20000000-0000-4000-8000-000000000005',
  rulesetKey: 'league-standard',
  liveMatchId: '21000000-0000-4000-8000-000000000001',
  completedMatchId: '21000000-0000-4000-8000-000000000002',
  eventIdPrefix: '22000000-0000-4000-8000-000000000',
  /** A rostered player the statistics projection reports an all-zero line for. */
  zeroContributionMembershipId: 'mem-mai',
  /** A player whose per-point measures the stream cannot support. */
  unmeasuredMembershipId: 'mem-zed',
} as const;
