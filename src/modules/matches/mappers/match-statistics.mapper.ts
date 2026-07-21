import type { SchemaOutput } from '@/packages/schema';

import type {
  matchStatisticsResponseSchema,
  playerMatchStatisticsSchema,
} from '../schemas/match-statistics.schema';
import type { MatchStatistics, PlayerMatchStatistics } from '../types/matches.types';

type StatisticsDto = SchemaOutput<typeof matchStatisticsResponseSchema>;
type PlayerDto = SchemaOutput<typeof playerMatchStatisticsSchema>;

/**
 * Nulls are carried through untouched. A missing measure must reach the view
 * model as null so the table can say "not enough data"; converting it to 0
 * here would invent a measurement the server never made.
 */
export function mapPlayerMatchStatistics(dto: PlayerDto): PlayerMatchStatistics {
  return {
    membershipId: dto.membershipId,
    rostered: dto.rostered,
    pointsPlayed: dto.pointsPlayed,
    offencePointsPlayed: dto.offencePointsPlayed,
    defencePointsPlayed: dto.defencePointsPlayed,
    goals: dto.goals,
    assists: dto.assists,
    callahans: dto.callahans,
    drops: dto.drops,
    throwaways: dto.throwaways,
    blocks: dto.blocks,
  };
}

export function mapMatchStatistics(dto: StatisticsDto): MatchStatistics {
  return {
    matchId: dto.matchId,
    rulesetKey: dto.rulesetKey,
    rulesetVersion: dto.rulesetVersion,
    statsEngineVersion: dto.statsEngineVersion,
    lineupsRecorded: dto.lineupsRecorded,
    playsRecorded: dto.playsRecorded,
    opponentErrorAttribution: dto.opponentErrorAttribution,
    team: {
      pointsStarted: dto.team.pointsStarted,
      pointsCompleted: dto.team.pointsCompleted,
      holds: dto.team.holds,
      breaks: dto.team.breaks,
      opponentHolds: dto.team.opponentHolds,
      opponentBreaks: dto.team.opponentBreaks,
      goalsFor: dto.team.goalsFor,
      goalsAgainst: dto.team.goalsAgainst,
      turnovers: dto.team.turnovers,
      opponentErrors: dto.team.opponentErrors,
    },
    players: dto.players.map(mapPlayerMatchStatistics),
  };
}
