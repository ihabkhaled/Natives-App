import type {
  Match,
  MatchEvent,
  MatchRuleset,
  MatchScoreboard,
  MatchStatistics,
  PlayerMatchStatistics,
  ScorekeeperQueuedOperation,
} from '@/modules/matches';

const EPOCH = '2026-07-18T15:00:00.000Z';

export function buildMatch(overrides: Partial<Match> = {}): Match {
  return {
    matchId: 'match-1',
    competitionId: 'competition-1',
    fixtureId: 'fixture-1',
    rosterId: 'roster-1',
    rulesetId: 'ruleset-1',
    status: 'live',
    homeAway: 'home',
    ourScore: 8,
    opponentScore: 6,
    period: 1,
    streamVersion: 14,
    recordVersion: 3,
    result: 'undecided',
    capApplied: 'none',
    startedAt: EPOCH,
    finalizedAt: null,
    ...overrides,
  };
}

export function buildScoreboard(overrides: Partial<MatchScoreboard> = {}): MatchScoreboard {
  return {
    matchId: 'match-1',
    status: 'live',
    ourScore: 8,
    opponentScore: 6,
    period: 1,
    streamVersion: 14,
    recordVersion: 3,
    result: 'undecided',
    rulesetKey: 'league-standard',
    rulesetVersion: 2,
    target: 15,
    capApplied: 'none',
    complete: false,
    halftimeReached: false,
    scoringOpen: true,
    timeouts: { allowance: 2, remainingForUs: 1, remainingForThem: 2 },
    ...overrides,
  };
}

export function buildMatchEvent(overrides: Partial<MatchEvent> = {}): MatchEvent {
  return {
    eventId: 'event-1',
    sequence: 14,
    operationId: 'operation-1',
    eventType: 'point',
    scoringSide: 'us',
    points: 1,
    ourScoreAfter: 8,
    opponentScoreAfter: 6,
    period: 1,
    scorerMembershipId: null,
    voidsEventId: null,
    voided: false,
    voidReason: null,
    recordedAt: EPOCH,
    ...overrides,
  };
}

export function buildMatchRuleset(overrides: Partial<MatchRuleset> = {}): MatchRuleset {
  return {
    rulesetId: 'ruleset-1',
    rulesetKey: 'league-standard',
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
    periods: 1,
    ...overrides,
  };
}

export function buildQueuedOperation(
  overrides: Partial<ScorekeeperQueuedOperation> = {},
): ScorekeeperQueuedOperation {
  return {
    operationId: 'operation-abcdefgh',
    ownerUserId: 'user-1',
    teamId: 'team-natives',
    matchId: 'match-1',
    kind: 'point',
    payload: {
      kind: 'point',
      scoringSide: 'us',
      scorerMembershipId: null,
      assistMembershipId: null,
    },
    payloadFingerprint: 'point|us|-|-',
    baseStreamVersion: 14,
    state: 'pending',
    retryCount: 0,
    conflictServerScore: null,
    createdAtIso: EPOCH,
    ...overrides,
  };
}

export function buildPlayerStatistics(
  overrides: Partial<PlayerMatchStatistics> = {},
): PlayerMatchStatistics {
  return {
    membershipId: 'mem-omar',
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
    ...overrides,
  };
}

export function buildMatchStatistics(overrides: Partial<MatchStatistics> = {}): MatchStatistics {
  return {
    matchId: 'match-1',
    rulesetKey: 'league-standard',
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
      turnovers: 8,
      opponentErrors: null,
    },
    players: [buildPlayerStatistics()],
    ...overrides,
  };
}
