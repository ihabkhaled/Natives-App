import type {
  AssessmentStatus,
  AssessmentWorkflowStep,
  FeedbackStatus,
  GoalStatus,
  GoalTransition,
  MetricDirection,
  MetricSource,
  MetricValueKind,
} from '../constants/assessments.constants';

/**
 * App-owned assessment, feedback, and development-goal domain. Wire instants
 * are renamed to the `…Iso` convention (UTC ISO 8601) and presented in
 * Africa/Cairo at the edge.
 *
 * `null` means "not evaluated / unknown" everywhere in this module and is
 * never coerced to zero: a metric that was not observed is a different fact
 * from a metric scored 0, and the two must never collapse.
 */
export interface AssessmentValue {
  readonly metricDefinitionId: string;
  readonly numericValue: number | null;
  readonly textValue: string | null;
  readonly note: string | null;
  readonly confidence: number | null;
  readonly observationCount: number | null;
}

interface AssessmentRecord {
  readonly id: string;
  readonly familyId: string;
  readonly teamId: string;
  readonly seasonId: string | null;
  readonly periodId: string;
  readonly templateId: string;
  readonly membershipId: string;
  readonly evaluatorUserId: string;
  readonly status: AssessmentStatus;
  readonly revision: number;
  readonly summary: string | null;
  readonly recordVersion: number;
  readonly submittedAtIso: string | null;
  readonly reviewedAtIso: string | null;
  readonly publishedAtIso: string | null;
  readonly supersededAtIso: string | null;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
}

export interface AssessmentDetail {
  readonly assessment: AssessmentRecord;
  readonly values: readonly AssessmentValue[];
}

export interface AssessmentSummary {
  readonly id: string;
  readonly familyId: string;
  readonly teamId: string;
  readonly periodId: string;
  readonly membershipId: string;
  readonly evaluatorUserId: string;
  readonly status: AssessmentStatus;
  readonly revision: number;
  readonly recordVersion: number;
  readonly createdAtIso: string;
  readonly publishedAtIso: string | null;
}

export interface AssessmentPage {
  readonly items: readonly AssessmentSummary[];
  readonly total: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

export interface MetricScale {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly valueKind: MetricValueKind;
  readonly unit: string | null;
  readonly minimumValue: number | null;
  readonly maximumValue: number | null;
  readonly stepValue: number | null;
  readonly categoricalOptions: readonly string[];
  readonly guidance: string;
}

interface MetricCategory {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly sortOrder: number;
}

export interface MetricDefinition {
  readonly id: string;
  readonly categoryId: string;
  readonly scaleId: string;
  readonly key: string;
  readonly name: string;
  readonly definition: string;
  readonly direction: MetricDirection;
  readonly guidance: string;
  readonly tags: readonly string[];
  readonly source: MetricSource;
}

interface TemplateMetric {
  readonly metricDefinitionId: string;
  readonly required: boolean;
  readonly sortOrder: number;
}

interface AssessmentTemplate {
  readonly id: string;
  readonly teamId: string;
  readonly key: string;
  readonly name: string;
  readonly version: number;
  readonly metrics: readonly TemplateMetric[];
}

interface AssessmentPeriod {
  readonly id: string;
  readonly teamId: string;
  readonly templateId: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
}

/** Everything the metric grid needs to render one template's fields. */
export interface AssessmentCatalog {
  readonly templates: readonly AssessmentTemplate[];
  readonly metrics: readonly MetricDefinition[];
  readonly scales: readonly MetricScale[];
  readonly categories: readonly MetricCategory[];
  readonly periods: readonly AssessmentPeriod[];
}

interface PublishedValue {
  readonly metricDefinitionId: string;
  readonly numericValue: number | null;
  readonly textValue: string | null;
}

export interface PublishedAssessment {
  readonly id: string;
  readonly teamId: string;
  readonly periodId: string;
  readonly templateId: string;
  readonly membershipId: string;
  readonly revision: number;
  readonly summary: string | null;
  readonly publishedAtIso: string | null;
  readonly values: readonly PublishedValue[];
}

/** A player's own view of published feedback; private coach notes never ship. */
export interface SharedFeedback {
  readonly id: string;
  readonly teamId: string;
  readonly membershipId: string;
  readonly status: FeedbackStatus;
  readonly revision: number;
  readonly positiveFrisbee: string | null;
  readonly frisbeeImprovement: string | null;
  readonly positiveMental: string | null;
  readonly mentalImprovement: string | null;
  readonly teamRole: string | null;
  readonly recommendedPosition: string | null;
  readonly summary: string | null;
  readonly publishedAtIso: string | null;
  readonly acknowledgedAtIso: string | null;
  readonly clarificationRequested: boolean;
}

interface GoalAction {
  readonly description: string;
  readonly sortOrder: number;
  readonly done: boolean;
  readonly dueDate: string | null;
}

interface GoalRecord {
  readonly id: string;
  readonly teamId: string;
  readonly membershipId: string;
  readonly title: string;
  readonly description: string | null;
  readonly measurableTarget: string | null;
  readonly targetValue: number | null;
  readonly baselineValue: number | null;
  readonly progressValue: number | null;
  readonly progressNote: string | null;
  readonly evidence: string | null;
  readonly status: GoalStatus;
  readonly dueDate: string | null;
  readonly completedAtIso: string | null;
  readonly recordVersion: number;
}

export interface DevelopmentGoal {
  readonly goal: GoalRecord;
  readonly actions: readonly GoalAction[];
}

/** Draft edit for one metric, held locally until an explicit save. */
export interface AssessmentValueDraft {
  readonly metricDefinitionId: string;
  readonly numericValue: number | null;
  readonly textValue: string | null;
  readonly note: string | null;
}

export interface SaveAssessmentValuesInput {
  readonly summary: string | null;
  readonly values: readonly AssessmentValueDraft[];
  readonly expectedRecordVersion: number;
}

export interface AssessmentTransitionInput {
  readonly assessmentId: string;
  readonly expectedRecordVersion: number;
  readonly step: AssessmentWorkflowStep;
}

export interface GoalTransitionInput {
  readonly goalId: string;
  readonly transition: GoalTransition;
  readonly expectedRecordVersion: number;
}

export interface AcknowledgeFeedbackInput {
  readonly feedbackId: string;
  readonly clarificationRequested: boolean;
}

/** One weighted component of the computed performance score. */
interface ScoreComponentRow {
  readonly categoryKey: string;
  readonly weight: number;
  readonly display: number | null;
  readonly included: boolean;
}

/** The caller's own computed score; `value: null` = not computed yet. */
export interface MyPerformanceScore {
  readonly id: string;
  readonly value: number | null;
  readonly confidence: 'none' | 'low' | 'medium' | 'high';
  readonly completeness: number;
  readonly status: 'stale' | 'building' | 'ready' | 'failed';
  readonly ruleKey: string;
  readonly ruleVersion: number;
  readonly computedAtIso: string | null;
  readonly components: readonly ScoreComponentRow[];
}

/** One recorded attempt; a DQ'd/invalid attempt plots as a gap, never zero. */
interface MeasurementAttemptPoint {
  readonly id: string;
  readonly attemptNumber: number;
  readonly recordedAtIso: string;
  readonly canonicalValue: number | null;
  readonly isCountable: boolean;
}

/** One protocol's own history with the policy-selected result. */
export interface MeasurementProtocolHistory {
  readonly protocolId: string;
  readonly name: string;
  readonly unit: string;
  readonly direction: 'better_higher' | 'better_lower';
  readonly method: 'best' | 'average' | 'latest';
  readonly selected: number | null;
  readonly consideredCount: number;
  readonly attempts: readonly MeasurementAttemptPoint[];
}
