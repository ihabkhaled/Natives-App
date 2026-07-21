import type { SchemaOutput } from '@/packages/schema';

import type {
  matchEventListResponseSchema,
  matchEventResponseSchema,
  matchListResponseSchema,
  matchOperationResponseSchema,
  matchResponseSchema,
  matchRulesetListResponseSchema,
  matchScoreboardResponseSchema,
} from '../schemas/match.schema';
import type {
  Match,
  MatchEvent,
  MatchOperationResult,
  MatchPage,
  MatchRuleset,
  MatchScoreboard,
} from '../types/matches.types';

type MatchDto = SchemaOutput<typeof matchResponseSchema>;
type MatchListDto = SchemaOutput<typeof matchListResponseSchema>;
type ScoreboardDto = SchemaOutput<typeof matchScoreboardResponseSchema>;
type EventDto = SchemaOutput<typeof matchEventResponseSchema>;
type EventListDto = SchemaOutput<typeof matchEventListResponseSchema>;
type OperationDto = SchemaOutput<typeof matchOperationResponseSchema>;
type RulesetListDto = SchemaOutput<typeof matchRulesetListResponseSchema>;

export function mapMatch(dto: MatchDto): Match {
  return {
    matchId: dto.matchId,
    competitionId: dto.competitionId,
    fixtureId: dto.fixtureId,
    rosterId: dto.rosterId,
    rulesetId: dto.rulesetId,
    status: dto.status,
    homeAway: dto.homeAway,
    ourScore: dto.ourScore,
    opponentScore: dto.opponentScore,
    period: dto.period,
    streamVersion: dto.streamVersion,
    recordVersion: dto.recordVersion,
    result: dto.result,
    capApplied: dto.capApplied,
    startedAt: dto.startedAt,
    finalizedAt: dto.finalizedAt,
  };
}

export function mapMatchPage(dto: MatchListDto): MatchPage {
  return { items: dto.items.map(mapMatch), total: dto.total };
}

export function mapMatchScoreboard(dto: ScoreboardDto): MatchScoreboard {
  return {
    matchId: dto.matchId,
    status: dto.status,
    ourScore: dto.ourScore,
    opponentScore: dto.opponentScore,
    period: dto.period,
    streamVersion: dto.streamVersion,
    recordVersion: dto.recordVersion,
    result: dto.result,
    rulesetKey: dto.rulesetKey,
    rulesetVersion: dto.rulesetVersion,
    target: dto.target,
    capApplied: dto.capApplied,
    complete: dto.complete,
    halftimeReached: dto.halftimeReached,
    scoringOpen: dto.scoringOpen,
    timeouts: {
      allowance: dto.timeouts.allowance,
      remainingForUs: dto.timeouts.remainingForUs,
      remainingForThem: dto.timeouts.remainingForThem,
    },
  };
}

export function mapMatchEvent(dto: EventDto): MatchEvent {
  return {
    eventId: dto.eventId,
    sequence: dto.sequence,
    operationId: dto.operationId,
    eventType: dto.eventType,
    scoringSide: dto.scoringSide,
    points: dto.points,
    ourScoreAfter: dto.ourScoreAfter,
    opponentScoreAfter: dto.opponentScoreAfter,
    period: dto.period,
    scorerMembershipId: dto.scorerMembershipId,
    voidsEventId: dto.voidsEventId,
    voided: dto.voided,
    voidReason: dto.voidReason,
    recordedAt: dto.recordedAt,
  };
}

/** Newest first: the field wants the last point at the top of the timeline. */
export function mapMatchEvents(dto: EventListDto): readonly MatchEvent[] {
  return [...dto.items].sort((left, right) => right.sequence - left.sequence).map(mapMatchEvent);
}

export function mapMatchOperation(dto: OperationDto): MatchOperationResult {
  return {
    outcome: dto.outcome,
    eventId: dto.event.eventId,
    operationId: dto.event.operationId,
    streamVersion: dto.streamVersion,
    ourScore: dto.ourScore,
    opponentScore: dto.opponentScore,
  };
}

export function mapMatchRuleset(dto: RulesetListDto['items'][number]): MatchRuleset {
  return {
    rulesetId: dto.rulesetId,
    rulesetKey: dto.rulesetKey,
    rulesetVersion: dto.rulesetVersion,
    name: dto.name,
    gameTo: dto.gameTo,
    winBy: dto.winBy,
    hardCap: dto.hardCap,
    softCapMinutes: dto.softCapMinutes,
    softCapPlus: dto.softCapPlus,
    timeCapMinutes: dto.timeCapMinutes,
    halftimeAt: dto.halftimeAt,
    timeoutsPerTeam: dto.timeoutsPerTeam,
    periods: dto.periods,
  };
}

export function mapMatchRulesets(dto: RulesetListDto): readonly MatchRuleset[] {
  return dto.items.map(mapMatchRuleset);
}
