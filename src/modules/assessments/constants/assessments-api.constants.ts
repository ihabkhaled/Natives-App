/** NestJS assessment + development endpoints, relative to the API base URL. */
const ASSESSMENTS_API_PATHS = {
  teams: '/teams',
} as const;

function teamPath(teamId: string): string {
  return `${ASSESSMENTS_API_PATHS.teams}/${encodeURIComponent(teamId)}`;
}

/** Team-scoped assessment collection (coach/reviewer view). */
export function playerAssessmentsPath(teamId: string): string {
  return `${teamPath(teamId)}/player-assessments`;
}

/** One assessment with its values. */
export function playerAssessmentPath(teamId: string, assessmentId: string): string {
  return `${playerAssessmentsPath(teamId)}/${encodeURIComponent(assessmentId)}`;
}

/** Autosave path for a draft assessment's values. */
export function assessmentValuesPath(teamId: string, assessmentId: string): string {
  return `${playerAssessmentPath(teamId, assessmentId)}/values`;
}

/** Workflow transition path for a named step (submit/review/publish). */
export function assessmentWorkflowPath(teamId: string, assessmentId: string, step: string): string {
  return `${playerAssessmentPath(teamId, assessmentId)}/${step}`;
}

/** Revision family history for one assessment. */
export function assessmentRevisionsPath(teamId: string, assessmentId: string): string {
  return `${playerAssessmentPath(teamId, assessmentId)}/revisions`;
}

/** The signed-in player's own published assessments. */
export function myAssessmentsPath(teamId: string): string {
  return `${teamPath(teamId)}/my-assessments`;
}

/** Catalog resource path (templates/metrics/scales/categories/periods). */
export function assessmentCatalogPath(teamId: string, resource: string): string {
  return `${teamPath(teamId)}/assessment-catalog/${resource}`;
}

/** The signed-in player's own published coach feedback. */
export function myFeedbackPath(teamId: string): string {
  return `${teamPath(teamId)}/my-feedback`;
}

/** Acknowledgement path for one published feedback record. */
export function feedbackAcknowledgePath(teamId: string, feedbackId: string): string {
  return `${myFeedbackPath(teamId)}/${encodeURIComponent(feedbackId)}/acknowledge`;
}

/** The signed-in player's own development goals. */
export function myDevelopmentGoalsPath(teamId: string): string {
  return `${teamPath(teamId)}/my-development-goals`;
}

/** Team-scoped development goals. */
function developmentGoalsPath(teamId: string): string {
  return `${teamPath(teamId)}/development-goals`;
}

/** Lifecycle transition path for one development goal. */
export function goalTransitionPath(teamId: string, goalId: string): string {
  return `${developmentGoalsPath(teamId)}/${encodeURIComponent(goalId)}/transition`;
}

/** Catalog sub-resources the gateway reads. */
export const CATALOG_RESOURCES = {
  templates: 'templates',
  metrics: 'metrics',
  scales: 'scales',
  categories: 'categories',
  periods: 'periods',
} as const;

/** Workflow endpoints that own their own path segment. */
export const WORKFLOW_STEP_PATHS = {
  submit: 'submit',
  review: 'review',
  publish: 'publish',
} as const;
