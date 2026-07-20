import {
  buildInitialAssessmentRecords,
  MOCK_ASSESSMENT_CREATED_AT,
  MOCK_ASSESSMENTS_TEAM_ID,
  MOCK_SELF_MEMBERSHIP_ID,
  MOCK_TEMPLATE_ID,
  type AssessmentRecordFixture,
  type AssessmentValueRecord,
} from './assessments-data.fixture';
import {
  buildInitialFeedbackRecords,
  buildInitialGoalRecords,
  type FeedbackRecordFixture,
  type GoalRecordFixture,
} from './assessments-development.fixture';

type JsonObject = Record<string, unknown>;

const EVALUATOR_USER_ID = 'user-coach';

let assessments: AssessmentRecordFixture[] = buildInitialAssessmentRecords();
let feedback: FeedbackRecordFixture[] = buildInitialFeedbackRecords();
let goals: GoalRecordFixture[] = buildInitialGoalRecords();

export function resetMockAssessmentsState(): void {
  assessments = buildInitialAssessmentRecords();
  feedback = buildInitialFeedbackRecords();
  goals = buildInitialGoalRecords();
}

function find(assessmentId: string): AssessmentRecordFixture | undefined {
  return assessments.find((record) => record.id === assessmentId);
}

function toSummary(record: AssessmentRecordFixture): JsonObject {
  return {
    id: record.id,
    familyId: record.familyId,
    teamId: MOCK_ASSESSMENTS_TEAM_ID,
    periodId: record.periodId,
    membershipId: record.membershipId,
    evaluatorUserId: EVALUATOR_USER_ID,
    status: record.status,
    revision: record.revision,
    recordVersion: record.recordVersion,
    createdAt: MOCK_ASSESSMENT_CREATED_AT,
    publishedAt: record.publishedAt,
  };
}

function toDetail(record: AssessmentRecordFixture): JsonObject {
  return {
    assessment: {
      id: record.id,
      familyId: record.familyId,
      teamId: MOCK_ASSESSMENTS_TEAM_ID,
      seasonId: null,
      periodId: record.periodId,
      templateId: MOCK_TEMPLATE_ID,
      membershipId: record.membershipId,
      evaluatorUserId: EVALUATOR_USER_ID,
      status: record.status,
      revision: record.revision,
      summary: record.summary,
      recordVersion: record.recordVersion,
      submittedAt: record.status === 'draft' ? null : MOCK_ASSESSMENT_CREATED_AT,
      submittedBy: record.status === 'draft' ? null : EVALUATOR_USER_ID,
      reviewedAt: null,
      reviewedBy: null,
      publishedAt: record.publishedAt,
      publishedBy: record.publishedAt === null ? null : EVALUATOR_USER_ID,
      supersededAt: null,
      supersededById: null,
      createdBy: EVALUATOR_USER_ID,
      createdAt: MOCK_ASSESSMENT_CREATED_AT,
      updatedAt: MOCK_ASSESSMENT_CREATED_AT,
    },
    values: record.values.map((value) => ({ ...value })),
  };
}

export function listAssessmentsResponse(limit: number, offset: number): JsonObject {
  const page = assessments.slice(offset, offset + limit);
  return {
    items: page.map((record) => toSummary(record)),
    total: assessments.length,
    limit,
    offset,
  };
}

export function assessmentDetailResponse(assessmentId: string): JsonObject | null {
  const record = find(assessmentId);
  return record === undefined ? null : toDetail(record);
}

export function revisionsResponse(assessmentId: string): JsonObject | null {
  const record = find(assessmentId);
  if (record === undefined) {
    return null;
  }
  return {
    items: assessments
      .filter((candidate) => candidate.familyId === record.familyId)
      .map((candidate) => toSummary(candidate)),
  };
}

/** Optimistic concurrency: a stale expected version is a 409 for the caller. */
export function saveValues(
  assessmentId: string,
  expectedRecordVersion: number,
  summary: string | null,
  values: readonly AssessmentValueRecord[],
): JsonObject | 'not-found' | 'conflict' {
  const record = find(assessmentId);
  if (record === undefined) {
    return 'not-found';
  }
  if (record.recordVersion !== expectedRecordVersion) {
    return 'conflict';
  }
  record.summary = summary;
  record.recordVersion += 1;
  record.values = values.map((value) => ({
    metricDefinitionId: value.metricDefinitionId,
    numericValue: value.numericValue ?? null,
    textValue: value.textValue ?? null,
    note: value.note ?? null,
    confidence: null,
    observationCount: null,
  }));
  return toDetail(record);
}

const REVIEW_TRANSITIONS: Record<string, AssessmentRecordFixture['status']> = {
  start_review: 'in_review',
  approve: 'approved',
  reject: 'draft',
};

export function transitionAssessmentRecord(
  assessmentId: string,
  step: string,
  expectedRecordVersion: number,
): JsonObject | 'not-found' | 'conflict' {
  const record = find(assessmentId);
  if (record === undefined) {
    return 'not-found';
  }
  if (record.recordVersion !== expectedRecordVersion) {
    return 'conflict';
  }
  record.recordVersion += 1;
  if (step === 'submit') {
    record.status = 'submitted';
  } else if (step === 'publish') {
    record.status = 'published';
    record.publishedAt = '2026-07-19T12:00:00.000Z';
  } else {
    record.status = REVIEW_TRANSITIONS[step] ?? record.status;
  }
  return toDetail(record);
}

export function myAssessmentsResponse(limit: number, offset: number): JsonObject {
  const published = assessments.filter(
    (record) => record.status === 'published' && record.membershipId === MOCK_SELF_MEMBERSHIP_ID,
  );
  return {
    items: published.slice(offset, offset + limit).map((record) => ({
      id: record.id,
      teamId: MOCK_ASSESSMENTS_TEAM_ID,
      periodId: record.periodId,
      templateId: MOCK_TEMPLATE_ID,
      membershipId: record.membershipId,
      status: record.status,
      revision: record.revision,
      summary: record.summary,
      publishedAt: record.publishedAt,
      values: record.values.map((value) => ({
        metricDefinitionId: value.metricDefinitionId,
        numericValue: value.numericValue,
        textValue: value.textValue,
      })),
    })),
    total: published.length,
    limit,
    offset,
  };
}

export function myFeedbackResponse(limit: number, offset: number): JsonObject {
  const published = feedback.filter((record) => record.status === 'published');
  return {
    items: published.slice(offset, offset + limit).map((record) => ({
      id: record.id,
      teamId: MOCK_ASSESSMENTS_TEAM_ID,
      membershipId: MOCK_SELF_MEMBERSHIP_ID,
      status: record.status,
      revision: record.revision,
      positiveFrisbee: record.positiveFrisbee,
      frisbeeImprovement: record.frisbeeImprovement,
      positiveMental: record.positiveMental,
      mentalImprovement: record.mentalImprovement,
      teamRole: record.teamRole,
      recommendedPosition: record.recommendedPosition,
      summary: record.summary,
      publishedAt: record.publishedAt,
      acknowledgedAt: record.acknowledgedAt,
      clarificationRequested: record.clarificationRequested,
    })),
    total: published.length,
    limit,
    offset,
  };
}

export function acknowledgeFeedbackRecord(
  feedbackId: string,
  clarificationRequested: boolean,
): JsonObject | null {
  const record = feedback.find((candidate) => candidate.id === feedbackId);
  if (record === undefined) {
    return null;
  }
  record.acknowledgedAt = '2026-07-19T12:30:00.000Z';
  record.clarificationRequested = clarificationRequested;
  return {
    id: `ack-${feedbackId}`,
    feedbackId,
    membershipId: MOCK_SELF_MEMBERSHIP_ID,
    userId: 'user-1',
    acknowledgedAt: record.acknowledgedAt,
    clarificationRequested,
    clarificationNote: null,
  };
}

function toGoal(record: GoalRecordFixture): JsonObject {
  return {
    goal: {
      id: record.id,
      teamId: MOCK_ASSESSMENTS_TEAM_ID,
      membershipId: MOCK_SELF_MEMBERSHIP_ID,
      title: record.title,
      description: record.description,
      measurableTarget: record.measurableTarget,
      targetValue: record.targetValue,
      baselineValue: record.baselineValue,
      progressValue: record.progressValue,
      progressNote: null,
      evidence: null,
      status: record.status,
      dueDate: record.dueDate,
      completedAt: null,
      recordVersion: record.recordVersion,
    },
    actions: record.actions.map((action) => ({ ...action })),
  };
}

export function myGoalsResponse(limit: number, offset: number): JsonObject {
  return {
    items: goals.slice(offset, offset + limit).map((record) => toGoal(record)),
    total: goals.length,
    limit,
    offset,
  };
}

const GOAL_TRANSITIONS: Record<string, GoalRecordFixture['status']> = {
  activate: 'active',
  achieve: 'achieved',
  miss: 'missed',
  cancel: 'cancelled',
  reopen: 'active',
};

export function transitionGoalRecord(
  goalId: string,
  transition: string,
  expectedRecordVersion: number,
): JsonObject | 'not-found' | 'conflict' {
  const record = goals.find((candidate) => candidate.id === goalId);
  if (record === undefined) {
    return 'not-found';
  }
  if (record.recordVersion !== expectedRecordVersion) {
    return 'conflict';
  }
  record.status = GOAL_TRANSITIONS[transition] ?? record.status;
  record.recordVersion += 1;
  return toGoal(record);
}
