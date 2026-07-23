import type { BackendApiSchemas } from '@/packages/api-contract';

/**
 * Deterministic self-insight payloads: the caller's computed performance
 * score (with its explanation) and their per-protocol measurement history.
 */
const SELF_MEMBERSHIP_ID = 'membership-natives-1';
const MOCK_TEAM_ID = 'team-natives';

function buildScoreExplanation(): BackendApiSchemas['ScoreExplanationResponseDto'] {
  return {
    completeness: 0.8,
    confidence: 'high',
    formulaVersion: 1,
    overall: {
      numerator: 78.4,
      denominator: 100,
      display: 78.4,
      unrounded: 78.42,
      includedCount: 4,
      excludedCount: 1,
      sufficient: true,
    },
    rule: { name: 'Overall 2026', ruleId: 'rule-1', ruleKey: 'overall-2026', version: 2 },
    components: [
      {
        categoryKey: 'technical',
        weight: 0.4,
        display: 81,
        unrounded: 81.2,
        included: true,
        excludedReason: null,
        assessedMetrics: 6,
        totalMetrics: 6,
      },
      {
        categoryKey: 'attendance',
        weight: 0.2,
        display: null,
        unrounded: null,
        included: false,
        excludedReason: 'insufficient_data',
        assessedMetrics: 0,
        totalMetrics: 1,
      },
    ],
  };
}

export function buildMyScoreResponse(): BackendApiSchemas['ScoreListResponseDto'] {
  return {
    items: [
      {
        id: 'score-1',
        teamId: MOCK_TEAM_ID,
        membershipId: SELF_MEMBERSHIP_ID,
        seasonId: 'season-2026-spring',
        periodId: null,
        ruleId: 'rule-1',
        ruleKey: 'overall-2026',
        ruleVersion: 2,
        status: 'ready',
        value: 78.4,
        numerator: 78.4,
        denominator: 100,
        completeness: 0.8,
        confidence: 'high',
        includedCount: 4,
        excludedCount: 1,
        sourceHash: 'hash-1',
        error: null,
        computedAt: '2026-07-18T08:00:00.000Z',
        createdAt: '2026-07-18T08:00:00.000Z',
        updatedAt: '2026-07-18T08:00:00.000Z',
        explanation: buildScoreExplanation(),
      },
    ],
  };
}

function buildSprintProtocol(): BackendApiSchemas['ProtocolResponseDto'] {
  return {
    id: 'protocol-sprint-20',
    protocolKey: 'sprint-20m',
    name: '20m sprint',
    description: 'Two-point start, best of three.',
    discipline: 'speed',
    direction: 'better_lower',
    resultPolicy: 'best',
    unit: 'seconds',
    minValue: 2,
    maxValue: 10,
    instructions: null,
    safetyNotes: null,
    status: 'active',
    seasonId: null,
    teamId: MOCK_TEAM_ID,
    recordVersion: 1,
    createdAt: '2026-06-01T10:00:00.000Z',
    createdBy: null,
    updatedAt: '2026-06-01T10:00:00.000Z',
  };
}

interface AttemptSpec {
  readonly id: string;
  readonly attemptNumber: number;
  readonly canonicalValue: number | null;
  readonly disqualified: boolean;
  readonly dqReason: string | null;
  readonly recordedAt: string;
}

function buildAttempt(spec: AttemptSpec): BackendApiSchemas['AttemptResponseDto'] {
  return {
    membershipId: SELF_MEMBERSHIP_ID,
    protocolId: 'protocol-sprint-20',
    sessionId: 'msession-1',
    teamId: MOCK_TEAM_ID,
    unit: 'seconds',
    evaluatorUserId: 'user-coach',
    notes: null,
    rawValue: null,
    valid: !spec.disqualified,
    createdAt: spec.recordedAt,
    ...spec,
  };
}

const ATTEMPT_SPECS: readonly AttemptSpec[] = [
  {
    id: 'attempt-1',
    attemptNumber: 1,
    canonicalValue: 3.1,
    disqualified: false,
    dqReason: null,
    recordedAt: '2026-07-01T16:00:00.000Z',
  },
  {
    id: 'attempt-2',
    attemptNumber: 2,
    canonicalValue: null,
    disqualified: true,
    dqReason: 'false start',
    recordedAt: '2026-07-08T16:00:00.000Z',
  },
  {
    id: 'attempt-3',
    attemptNumber: 3,
    canonicalValue: 3.4,
    disqualified: false,
    dqReason: null,
    recordedAt: '2026-07-15T16:00:00.000Z',
  },
];

export function buildMyMeasurementsResponse(): BackendApiSchemas['HistoryResponseDto'] {
  return {
    membershipId: SELF_MEMBERSHIP_ID,
    entries: [
      {
        protocol: buildSprintProtocol(),
        result: {
          method: 'best',
          direction: 'better_lower',
          best: 3.1,
          average: 3.25,
          latest: 3.4,
          selected: 3.1,
          consideredCount: 2,
          excludedCount: 1,
        },
        attempts: ATTEMPT_SPECS.map(buildAttempt),
      },
    ],
  };
}
