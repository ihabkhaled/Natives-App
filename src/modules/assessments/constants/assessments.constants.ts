import { I18N_KEYS } from '@/shared/i18n';

/** Assessment lifecycle, mirroring the backend enum exactly. */
export const ASSESSMENT_STATUS = {
  Draft: 'draft',
  Submitted: 'submitted',
  InReview: 'in_review',
  Approved: 'approved',
  Published: 'published',
  Revised: 'revised',
} as const;

export type AssessmentStatus = (typeof ASSESSMENT_STATUS)[keyof typeof ASSESSMENT_STATUS];

export const REVIEW_DECISION = {
  StartReview: 'start_review',
  Approve: 'approve',
  Reject: 'reject',
} as const;

export type ReviewDecision = (typeof REVIEW_DECISION)[keyof typeof REVIEW_DECISION];

/**
 * One user-facing workflow step. `submit` and `publish` are their own
 * endpoints; the three review decisions share the review endpoint.
 */
export const ASSESSMENT_WORKFLOW_STEP = {
  Submit: 'submit',
  StartReview: 'start_review',
  Approve: 'approve',
  Reject: 'reject',
  Publish: 'publish',
} as const;

export type AssessmentWorkflowStep =
  (typeof ASSESSMENT_WORKFLOW_STEP)[keyof typeof ASSESSMENT_WORKFLOW_STEP];

export const FEEDBACK_STATUS = {
  Draft: 'draft',
  InReview: 'in_review',
  Published: 'published',
  Revised: 'revised',
} as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[keyof typeof FEEDBACK_STATUS];

export const GOAL_STATUS = {
  Proposed: 'proposed',
  Active: 'active',
  Achieved: 'achieved',
  Missed: 'missed',
  Cancelled: 'cancelled',
} as const;

export type GoalStatus = (typeof GOAL_STATUS)[keyof typeof GOAL_STATUS];

export const GOAL_TRANSITION = {
  Activate: 'activate',
  Achieve: 'achieve',
  Miss: 'miss',
  Cancel: 'cancel',
  Reopen: 'reopen',
} as const;

export type GoalTransition = (typeof GOAL_TRANSITION)[keyof typeof GOAL_TRANSITION];

export const METRIC_DIRECTION = {
  HigherIsBetter: 'higher_is_better',
  LowerIsBetter: 'lower_is_better',
  TargetRange: 'target_range',
  Descriptive: 'descriptive',
} as const;

export type MetricDirection = (typeof METRIC_DIRECTION)[keyof typeof METRIC_DIRECTION];

export const METRIC_VALUE_KIND = {
  Legacy05: 'legacy_0_5',
  Timed: 'timed',
  Count: 'count',
  Percentage: 'percentage',
  Categorical: 'categorical',
  Text: 'text',
} as const;

export type MetricValueKind = (typeof METRIC_VALUE_KIND)[keyof typeof METRIC_VALUE_KIND];

/**
 * Where a metric's number comes from. Derived from the definition's tags so a
 * coach judgement is never presented as if it were a measured stopwatch time.
 */
export const METRIC_SOURCE = {
  Subjective: 'subjective',
  Objective: 'objective',
  Attendance: 'attendance',
  External: 'external',
  Match: 'match',
} as const;

export type MetricSource = (typeof METRIC_SOURCE)[keyof typeof METRIC_SOURCE];

/** Tag → source classification, applied in declaration order. */
export const METRIC_SOURCE_TAGS: readonly (readonly [string, MetricSource])[] = [
  ['attendance', METRIC_SOURCE.Attendance],
  ['match', METRIC_SOURCE.Match],
  ['external', METRIC_SOURCE.External],
  ['objective', METRIC_SOURCE.Objective],
  ['measured', METRIC_SOURCE.Objective],
];

export const ASSESSMENT_STATUS_LABEL_KEYS: Record<AssessmentStatus, string> = {
  [ASSESSMENT_STATUS.Draft]: I18N_KEYS.assessments.statusDraft,
  [ASSESSMENT_STATUS.Submitted]: I18N_KEYS.assessments.statusSubmitted,
  [ASSESSMENT_STATUS.InReview]: I18N_KEYS.assessments.statusInReview,
  [ASSESSMENT_STATUS.Approved]: I18N_KEYS.assessments.statusApproved,
  [ASSESSMENT_STATUS.Published]: I18N_KEYS.assessments.statusPublished,
  [ASSESSMENT_STATUS.Revised]: I18N_KEYS.assessments.statusRevised,
};

export const ASSESSMENT_STATUS_TONES: Record<AssessmentStatus, string> = {
  [ASSESSMENT_STATUS.Draft]: 'medium',
  [ASSESSMENT_STATUS.Submitted]: 'primary',
  [ASSESSMENT_STATUS.InReview]: 'warning',
  [ASSESSMENT_STATUS.Approved]: 'tertiary',
  [ASSESSMENT_STATUS.Published]: 'success',
  [ASSESSMENT_STATUS.Revised]: 'medium',
};

export const GOAL_STATUS_LABEL_KEYS: Record<GoalStatus, string> = {
  [GOAL_STATUS.Proposed]: I18N_KEYS.assessments.goalStatusProposed,
  [GOAL_STATUS.Active]: I18N_KEYS.assessments.goalStatusActive,
  [GOAL_STATUS.Achieved]: I18N_KEYS.assessments.goalStatusAchieved,
  [GOAL_STATUS.Missed]: I18N_KEYS.assessments.goalStatusMissed,
  [GOAL_STATUS.Cancelled]: I18N_KEYS.assessments.goalStatusCancelled,
};

export const GOAL_STATUS_TONES: Record<GoalStatus, string> = {
  [GOAL_STATUS.Proposed]: 'medium',
  [GOAL_STATUS.Active]: 'primary',
  [GOAL_STATUS.Achieved]: 'success',
  [GOAL_STATUS.Missed]: 'danger',
  [GOAL_STATUS.Cancelled]: 'medium',
};

export const METRIC_DIRECTION_LABEL_KEYS: Record<MetricDirection, string> = {
  [METRIC_DIRECTION.HigherIsBetter]: I18N_KEYS.assessments.metricDirectionHigher,
  [METRIC_DIRECTION.LowerIsBetter]: I18N_KEYS.assessments.metricDirectionLower,
  [METRIC_DIRECTION.TargetRange]: I18N_KEYS.assessments.metricDirectionTarget,
  [METRIC_DIRECTION.Descriptive]: I18N_KEYS.assessments.metricDirectionDescriptive,
};

export const METRIC_SOURCE_LABEL_KEYS: Record<MetricSource, string> = {
  [METRIC_SOURCE.Subjective]: I18N_KEYS.assessments.sourceSubjective,
  [METRIC_SOURCE.Objective]: I18N_KEYS.assessments.sourceObjective,
  [METRIC_SOURCE.Attendance]: I18N_KEYS.assessments.sourceAttendance,
  [METRIC_SOURCE.External]: I18N_KEYS.assessments.sourceExternal,
  [METRIC_SOURCE.Match]: I18N_KEYS.assessments.sourceMatch,
};

/** The legacy 0–5 scale the coach grid renders as discrete score buttons. */
export const LEGACY_SCORE_STEPS: readonly number[] = [0, 1, 2, 3, 4, 5];

/** Top of the legacy evaluator scale; the radar and trend bands key on it. */
export const LEGACY_SCORE_MAXIMUM = 5;

export const ASSESSMENTS_PAGE_SIZE = 50;

/** Chart viewport in user units; the SVG scales fluidly via viewBox. */
export const CHART_GEOMETRY = {
  width: 640,
  height: 220,
  paddingX: 44,
  paddingY: 24,
  radarSize: 320,
  radarRings: 4,
} as const;
