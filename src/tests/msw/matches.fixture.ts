import type {
  matchEventResponseSchema,
  matchListResponseSchema,
  matchResponseSchema,
  matchRulesetListResponseSchema,
  matchScoreboardResponseSchema,
} from '@/modules/matches';
import type { SchemaOutput } from '@/packages/schema';

import { MOCK_MATCHES } from './matches-ids.fixture';

type MatchDto = SchemaOutput<typeof matchResponseSchema>;
type MatchListDto = SchemaOutput<typeof matchListResponseSchema>;
type ScoreboardDto = SchemaOutput<typeof matchScoreboardResponseSchema>;
type EventDto = SchemaOutput<typeof matchEventResponseSchema>;
type RulesetListDto = SchemaOutput<typeof matchRulesetListResponseSchema>;

const EPOCH = '2026-07-18T15:00:00.000Z';

interface MatchRecord {
  match: MatchDto;
  events: EventDto[];
  /** operationId -> the payload fingerprint the server first accepted. */
  operations: Map<string, string>;
}

function baseMatch(overrides: Partial<MatchDto> & { matchId: string }): MatchDto {
  return {
    teamId: MOCK_MATCHES.teamId,
    seasonId: MOCK_MATCHES.seasonId,
    competitionId: MOCK_MATCHES.competitionId,
    fixtureId: MOCK_MATCHES.fixtureId,
    rosterId: MOCK_MATCHES.rosterId,
    rulesetId: MOCK_MATCHES.rulesetId,
    status: 'live',
    homeAway: 'home',
    ourScore: 8,
    opponentScore: 6,
    period: 1,
    streamVersion: 14,
    recordVersion: 3,
    revision: 0,
    result: 'undecided',
    capApplied: 'none',
    engineVersion: 'match-engine-1',
    notes: null,
    startedAt: EPOCH,
    completedAt: null,
    finalizedAt: null,
    createdAt: EPOCH,
    updatedAt: EPOCH,
    ...overrides,
  };
}

function pointEvent(sequence: number, ourScoreAfter: number, opponentScoreAfter: number): EventDto {
  return {
    eventId: `${MOCK_MATCHES.eventIdPrefix}${String(sequence).padStart(3, '0')}`,
    matchId: MOCK_MATCHES.liveMatchId,
    sequence,
    operationId: `seed-operation-${String(sequence)}`,
    eventType: 'point',
    scoringSide: ourScoreAfter > opponentScoreAfter ? 'us' : 'them',
    points: 1,
    ourScoreAfter,
    opponentScoreAfter,
    period: 1,
    scorerMembershipId: null,
    assistMembershipId: null,
    voidsEventId: null,
    voided: false,
    voidReason: null,
    occurredAt: EPOCH,
    recordedAt: EPOCH,
  };
}

const SEED_EVENTS: readonly EventDto[] = [pointEvent(13, 7, 6), pointEvent(14, 8, 6)];

function seedRecords(): Map<string, MatchRecord> {
  return new Map<string, MatchRecord>([
    [
      MOCK_MATCHES.liveMatchId,
      {
        match: baseMatch({ matchId: MOCK_MATCHES.liveMatchId }),
        events: [...SEED_EVENTS],
        operations: new Map<string, string>(),
      },
    ],
    [
      MOCK_MATCHES.completedMatchId,
      {
        match: baseMatch({
          matchId: MOCK_MATCHES.completedMatchId,
          status: 'completed',
          ourScore: 15,
          opponentScore: 11,
          result: 'win',
          streamVersion: 30,
          completedAt: EPOCH,
        }),
        events: [],
        operations: new Map<string, string>(),
      },
    ],
  ]);
}

let records = seedRecords();

export function resetMockMatchesState(): void {
  records = seedRecords();
}

export function matchRecord(matchId: string): MatchRecord | null {
  return records.get(matchId) ?? null;
}

export function matchesResponse(): MatchListDto {
  const items = [...records.values()].map((record) => record.match);
  return { items, total: items.length, limit: 20, offset: 0 };
}

export function scoreboardResponse(matchId: string): ScoreboardDto | null {
  const record = records.get(matchId);
  if (record === undefined) {
    return null;
  }
  const match = record.match;
  return {
    matchId: match.matchId,
    status: match.status,
    ourScore: match.ourScore,
    opponentScore: match.opponentScore,
    period: match.period,
    streamVersion: match.streamVersion,
    recordVersion: match.recordVersion,
    revision: match.revision,
    result: match.result,
    rulesetKey: MOCK_MATCHES.rulesetKey,
    rulesetVersion: 2,
    engineVersion: match.engineVersion,
    target: 15,
    capApplied: match.capApplied,
    complete: match.status === 'completed' || match.status === 'finalized',
    halftimeReached: false,
    scoringOpen: match.status === 'live',
    timeouts: {
      allowance: 2,
      usedByUs: 1,
      usedByThem: 0,
      remainingForUs: 1,
      remainingForThem: 2,
    },
  };
}

export function eventsResponse(matchId: string): {
  items: readonly EventDto[];
  total: number;
  limit: number;
  offset: number;
} {
  const record = records.get(matchId);
  const items = record?.events ?? [];
  return { items, total: items.length, limit: 200, offset: 0 };
}

export function rulesetsResponse(): RulesetListDto {
  return {
    items: [
      {
        rulesetId: MOCK_MATCHES.rulesetId,
        rulesetKey: MOCK_MATCHES.rulesetKey,
        rulesetVersion: 2,
        name: 'League rules',
        gameTo: 15,
        winBy: 2,
        hardCap: 17,
        softCapMinutes: 75,
        softCapPlus: 1,
        timeCapMinutes: 90,
        halftimeAt: 8,
        timeoutsPerTeam: 2,
        timeoutsPerPeriod: null,
        periods: 1,
        status: 'active',
      },
    ],
    total: 1,
    limit: 20,
    offset: 0,
  };
}

export { type EventDto, type MatchRecord };
