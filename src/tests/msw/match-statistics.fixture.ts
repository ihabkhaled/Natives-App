import type { matchStatisticsResponseSchema } from '@/modules/matches';
import type { SchemaOutput } from '@/packages/schema';

import { MOCK_MATCHES } from './matches-ids.fixture';

type StatisticsDto = SchemaOutput<typeof matchStatisticsResponseSchema>;
type PlayerDto = StatisticsDto['players'][number];

function player(overrides: Partial<PlayerDto> & { membershipId: string }): PlayerDto {
  return {
    rosterEntryId: null,
    rostered: true,
    pointsPlayed: 0,
    offencePointsPlayed: 0,
    defencePointsPlayed: 0,
    goals: 0,
    assists: 0,
    callahans: 0,
    drops: 0,
    throwaways: 0,
    blocks: 0,
    opponentErrorsForced: 0,
    ...overrides,
  };
}

/**
 * A deliberately honest roster:
 *  - two players with real contributions,
 *  - one rostered player whose measured line is all zeros (the
 *    zero-contribution completeness case),
 *  - one player whose per-point measures the stream cannot support at all
 *    (every measure null — "not enough data", never 0).
 */
const PLAYERS: readonly PlayerDto[] = [
  player({
    membershipId: 'mem-omar',
    pointsPlayed: 12,
    offencePointsPlayed: 7,
    defencePointsPlayed: 5,
    goals: 4,
    assists: 3,
    blocks: 2,
    drops: 1,
    throwaways: 1,
  }),
  player({
    membershipId: 'mem-nadia',
    pointsPlayed: 9,
    offencePointsPlayed: 4,
    defencePointsPlayed: 5,
    goals: 2,
    assists: 5,
    blocks: 1,
  }),
  player({ membershipId: MOCK_MATCHES.zeroContributionMembershipId }),
  player({
    membershipId: MOCK_MATCHES.unmeasuredMembershipId,
    pointsPlayed: null,
    offencePointsPlayed: null,
    defencePointsPlayed: null,
    goals: null,
    assists: null,
    callahans: null,
    drops: null,
    throwaways: null,
    blocks: null,
    opponentErrorsForced: null,
  }),
];

export function matchStatisticsResponse(matchId: string): StatisticsDto {
  return {
    matchId,
    teamId: MOCK_MATCHES.teamId,
    rulesetKey: MOCK_MATCHES.rulesetKey,
    rulesetVersion: 2,
    statsEngineVersion: 'stats-engine-1',
    lineupsRecorded: true,
    playsRecorded: true,
    opponentErrorAttribution: false,
    team: {
      pointsStarted: 21,
      pointsCompleted: 21,
      holds: 9,
      breaks: 6,
      opponentHolds: 4,
      opponentBreaks: 2,
      goalsFor: 15,
      goalsAgainst: 11,
      drops: 3,
      throwaways: 5,
      blocks: 4,
      turnovers: 8,
      opponentErrors: null,
    },
    players: [...PLAYERS],
  };
}
