import type {
  AssessmentCatalog,
  AssessmentDetail,
  AssessmentSummary,
  DevelopmentGoal,
  MetricDefinition,
  PublishedAssessment,
  SharedFeedback,
} from '@/modules/assessments';

const SPRING = 'period-spring-2026';
const SUMMER = 'period-summer-2026';
const TEMPLATE = 'template-senior-2026';

export function buildMetricDefinition(overrides: Partial<MetricDefinition> = {}): MetricDefinition {
  return {
    id: 'metric-speed',
    categoryId: 'cat-athletic',
    scaleId: 'scale-0-5',
    key: 'speed',
    name: 'Speed',
    definition: 'Acceleration over 40 metres.',
    direction: 'higher_is_better',
    guidance: 'Compare against the squad baseline.',
    tags: ['objective'],
    source: 'objective',
    ...overrides,
  };
}

export function buildAssessmentCatalog(
  overrides: Partial<AssessmentCatalog> = {},
): AssessmentCatalog {
  return {
    templates: [
      {
        id: TEMPLATE,
        teamId: 'team-natives',
        key: 'senior-2026',
        name: 'Senior squad 2026',
        version: 2,
        metrics: [
          { metricDefinitionId: 'metric-speed', required: true, sortOrder: 1 },
          { metricDefinitionId: 'metric-attitude', required: false, sortOrder: 2 },
          { metricDefinitionId: 'metric-notes', required: false, sortOrder: 3 },
        ],
      },
    ],
    metrics: [
      buildMetricDefinition(),
      buildMetricDefinition({
        id: 'metric-attitude',
        categoryId: 'cat-mental',
        key: 'attitude',
        name: 'Attitude',
        tags: ['subjective'],
        source: 'subjective',
      }),
      buildMetricDefinition({
        id: 'metric-notes',
        categoryId: 'cat-mental',
        scaleId: 'scale-text',
        key: 'notes',
        name: 'Coach notes',
        direction: 'descriptive',
        tags: [],
        source: 'subjective',
      }),
    ],
    scales: [
      {
        id: 'scale-0-5',
        key: 'legacy-0-5',
        name: 'Evaluator 0–5',
        valueKind: 'legacy_0_5',
        unit: null,
        minimumValue: 0,
        maximumValue: 5,
        stepValue: 1,
        categoricalOptions: [],
        guidance: 'Score against the rubric.',
      },
      {
        id: 'scale-text',
        key: 'free-text',
        name: 'Free text',
        valueKind: 'text',
        unit: null,
        minimumValue: null,
        maximumValue: null,
        stepValue: null,
        categoricalOptions: [],
        guidance: 'Describe what you observed.',
      },
    ],
    categories: [
      {
        id: 'cat-athletic',
        key: 'athletic',
        name: 'Athletic',
        description: 'Speed, power, stamina.',
        sortOrder: 1,
      },
      {
        id: 'cat-mental',
        key: 'mental',
        name: 'Mental',
        description: 'Attitude and resilience.',
        sortOrder: 2,
      },
    ],
    periods: [
      {
        id: SPRING,
        teamId: 'team-natives',
        templateId: TEMPLATE,
        name: 'Spring 2026',
        startsOn: '2026-03-01',
        endsOn: '2026-05-31',
      },
      {
        id: SUMMER,
        teamId: 'team-natives',
        templateId: TEMPLATE,
        name: 'Summer 2026',
        startsOn: '2026-06-01',
        endsOn: '2026-08-31',
      },
    ],
    ...overrides,
  };
}

export function buildAssessmentSummary(
  overrides: Partial<AssessmentSummary> = {},
): AssessmentSummary {
  return {
    id: 'asmt-draft-1',
    familyId: 'family-draft',
    teamId: 'team-natives',
    periodId: SUMMER,
    membershipId: 'mem-002',
    evaluatorUserId: 'user-coach',
    status: 'draft',
    revision: 1,
    recordVersion: 1,
    createdAtIso: '2026-05-01T09:00:00.000Z',
    publishedAtIso: null,
    ...overrides,
  };
}

export function buildAssessmentDetail(overrides: Partial<AssessmentDetail> = {}): AssessmentDetail {
  return {
    assessment: {
      id: 'asmt-draft-1',
      familyId: 'family-draft',
      teamId: 'team-natives',
      seasonId: null,
      periodId: SUMMER,
      templateId: TEMPLATE,
      membershipId: 'mem-002',
      evaluatorUserId: 'user-coach',
      status: 'draft',
      revision: 1,
      summary: null,
      recordVersion: 1,
      submittedAtIso: null,
      reviewedAtIso: null,
      publishedAtIso: null,
      supersededAtIso: null,
      createdAtIso: '2026-05-01T09:00:00.000Z',
      updatedAtIso: '2026-05-01T09:00:00.000Z',
    },
    values: [
      {
        metricDefinitionId: 'metric-speed',
        numericValue: 4,
        textValue: null,
        note: null,
        confidence: null,
        observationCount: null,
      },
      {
        metricDefinitionId: 'metric-attitude',
        numericValue: 0,
        textValue: null,
        note: null,
        confidence: null,
        observationCount: null,
      },
    ],
    ...overrides,
  };
}

export function buildPublishedAssessment(
  overrides: Partial<PublishedAssessment> = {},
): PublishedAssessment {
  return {
    id: 'asmt-published-1',
    teamId: 'team-natives',
    periodId: SUMMER,
    templateId: TEMPLATE,
    membershipId: 'mem-001',
    revision: 2,
    summary: 'Sharper cuts.',
    publishedAtIso: '2026-07-10T12:00:00.000Z',
    values: [
      { metricDefinitionId: 'metric-speed', numericValue: 4, textValue: null },
      { metricDefinitionId: 'metric-attitude', numericValue: 0, textValue: null },
    ],
    ...overrides,
  };
}

export function buildSharedFeedback(overrides: Partial<SharedFeedback> = {}): SharedFeedback {
  return {
    id: 'feedback-1',
    teamId: 'team-natives',
    membershipId: 'mem-001',
    status: 'published',
    revision: 1,
    positiveFrisbee: 'Break-side flick is a weapon.',
    frisbeeImprovement: 'Reset earlier.',
    positiveMental: null,
    mentalImprovement: null,
    teamRole: 'Handler',
    recommendedPosition: null,
    summary: 'Strong block.',
    publishedAtIso: '2026-07-12T12:00:00.000Z',
    acknowledgedAtIso: null,
    clarificationRequested: false,
    ...overrides,
  };
}

export function buildDevelopmentGoal(overrides: Partial<DevelopmentGoal> = {}): DevelopmentGoal {
  return {
    goal: {
      id: 'goal-2',
      teamId: 'team-natives',
      membershipId: 'mem-001',
      title: 'Raise reset completion',
      description: 'Complete 90% of resets.',
      measurableTarget: '90% reset completion',
      targetValue: 90,
      baselineValue: 72,
      progressValue: 81,
      progressNote: null,
      evidence: null,
      status: 'active',
      dueDate: '2026-08-31',
      completedAtIso: null,
      recordVersion: 2,
    },
    actions: [
      { description: 'Marked reset drills', sortOrder: 1, done: true, dueDate: null },
      { description: 'Film review', sortOrder: 2, done: false, dueDate: '2026-08-15' },
    ],
    ...overrides,
  };
}
