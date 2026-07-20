/** Deterministic assessment catalog + records for mock mode and tests. */
export const MOCK_ASSESSMENTS_TEAM_ID = 'team-natives';

export const MOCK_ASSESSMENT_IDS = {
  draft: 'asmt-draft-1',
  submitted: 'asmt-submitted-1',
  published: 'asmt-published-1',
  publishedPrevious: 'asmt-published-0',
} as const;

export const MOCK_METRIC_IDS = {
  speed: 'metric-speed',
  power: 'metric-power',
  stamina: 'metric-stamina',
  offense: 'metric-offense',
  defense: 'metric-defense',
  attitude: 'metric-attitude',
} as const;

export const MOCK_CATEGORY_IDS = {
  athletic: 'cat-athletic',
  offense: 'cat-offense',
  defense: 'cat-defense',
  mental: 'cat-mental',
} as const;

export const MOCK_SCALE_IDS = {
  score: 'scale-0-5',
  timed: 'scale-timed',
  text: 'scale-text',
} as const;

export const MOCK_PERIOD_IDS = {
  spring: 'period-spring-2026',
  summer: 'period-summer-2026',
} as const;

export const MOCK_TEMPLATE_ID = 'template-senior-2026';
const MOCK_ASSESSMENT_MEMBERSHIP_ID = 'mem-002';
export const MOCK_SELF_MEMBERSHIP_ID = 'mem-001';
export const MOCK_FEEDBACK_ID = 'feedback-1';
export const MOCK_GOAL_IDS = { proposed: 'goal-1', active: 'goal-2' } as const;

const CREATED_AT = '2026-05-01T09:00:00.000Z';

export interface AssessmentValueRecord {
  metricDefinitionId: string;
  numericValue: number | null;
  textValue: string | null;
  note: string | null;
  confidence: number | null;
  observationCount: number | null;
}

export interface AssessmentRecordFixture {
  id: string;
  familyId: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'published' | 'revised';
  periodId: string;
  membershipId: string;
  revision: number;
  recordVersion: number;
  summary: string | null;
  publishedAt: string | null;
  values: AssessmentValueRecord[];
}

function value(
  metricDefinitionId: string,
  numericValue: number | null,
  note: string | null = null,
): AssessmentValueRecord {
  return {
    metricDefinitionId,
    numericValue,
    textValue: null,
    note,
    confidence: null,
    observationCount: null,
  };
}

/** Draft: stamina unevaluated, attitude scored 0 — two distinct facts. */
function draftRecords(): AssessmentRecordFixture[] {
  return [
    {
      id: MOCK_ASSESSMENT_IDS.draft,
      familyId: 'family-draft',
      status: 'draft',
      periodId: MOCK_PERIOD_IDS.summer,
      membershipId: MOCK_ASSESSMENT_MEMBERSHIP_ID,
      revision: 1,
      recordVersion: 1,
      summary: null,
      publishedAt: null,
      values: [
        value(MOCK_METRIC_IDS.speed, 4),
        value(MOCK_METRIC_IDS.power, 3, 'Strong pulls in the last scrimmage.'),
        value(MOCK_METRIC_IDS.attitude, 0),
      ],
    },
    {
      id: MOCK_ASSESSMENT_IDS.submitted,
      familyId: 'family-submitted',
      status: 'submitted',
      periodId: MOCK_PERIOD_IDS.summer,
      membershipId: MOCK_SELF_MEMBERSHIP_ID,
      revision: 1,
      recordVersion: 2,
      summary: 'Ready for review.',
      publishedAt: null,
      values: [value(MOCK_METRIC_IDS.speed, 3), value(MOCK_METRIC_IDS.offense, 4)],
    },
  ];
}

/** Two published periods so the trend chart has a real series with a gap. */
function publishedRecords(): AssessmentRecordFixture[] {
  return [
    {
      id: MOCK_ASSESSMENT_IDS.publishedPrevious,
      familyId: 'family-published',
      status: 'published',
      periodId: MOCK_PERIOD_IDS.spring,
      membershipId: MOCK_SELF_MEMBERSHIP_ID,
      revision: 1,
      recordVersion: 3,
      summary: 'Solid spring block.',
      publishedAt: '2026-05-20T12:00:00.000Z',
      values: [
        value(MOCK_METRIC_IDS.speed, 3),
        value(MOCK_METRIC_IDS.power, 2),
        value(MOCK_METRIC_IDS.offense, 3),
        value(MOCK_METRIC_IDS.defense, 3),
      ],
    },
    {
      id: MOCK_ASSESSMENT_IDS.published,
      familyId: 'family-published-2',
      status: 'published',
      periodId: MOCK_PERIOD_IDS.summer,
      membershipId: MOCK_SELF_MEMBERSHIP_ID,
      revision: 2,
      recordVersion: 4,
      summary: 'Sharper cuts, steadier hucks.',
      publishedAt: '2026-07-10T12:00:00.000Z',
      values: [
        value(MOCK_METRIC_IDS.speed, 4),
        value(MOCK_METRIC_IDS.power, 3),
        value(MOCK_METRIC_IDS.offense, 4),
        value(MOCK_METRIC_IDS.defense, 4),
        value(MOCK_METRIC_IDS.attitude, 5),
      ],
    },
  ];
}

/** The full deterministic record set for one reset. */
export function buildInitialAssessmentRecords(): AssessmentRecordFixture[] {
  return [...draftRecords(), ...publishedRecords()];
}

export const MOCK_ASSESSMENT_CREATED_AT = CREATED_AT;
