import { vi } from 'vitest';

import type {
  AssessmentEntryView,
  AssessmentsView,
  AssessmentSummaryView,
  FeedbackCardView,
  GoalCardView,
  MetricFieldView,
  MetricGroupView,
  PerformanceView,
  RadarChartView,
  TrendChartView,
} from '@/modules/assessments/types/assessments-view.types';

function buildAssessmentsStateCopy() {
  return {
    loadingLabel: 'Loading assessments…',
    errorTitle: 'Assessments did not load',
    errorMessage: 'Try again.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect.',
    offlineNoticeLabel: 'Reconnect.',
    isOffline: false,
    forbiddenTitle: 'Not available to you',
    forbiddenMessage: 'No permission.',
  };
}

export function buildMetricFieldView(overrides: Partial<MetricFieldView> = {}): MetricFieldView {
  return {
    metricDefinitionId: 'metric-speed',
    name: 'Speed',
    definition: 'Acceleration over 40 metres.',
    guidance: 'Compare against the squad baseline.',
    requiredLabel: 'Required',
    isRequired: true,
    directionLabel: 'Higher is better',
    sourceLabel: 'Measured',
    source: 'objective',
    unitLabel: null,
    isScoreScale: true,
    isTextScale: false,
    options: [],
    minimumValue: 0,
    maximumValue: 5,
    stepValue: 1,
    numericValue: 4,
    textValue: null,
    note: null,
    isEvaluated: true,
    valueReadout: '4',
    inputLabel: 'Score for Speed',
    ...overrides,
  };
}

function buildMetricGroupView(overrides: Partial<MetricGroupView> = {}): MetricGroupView {
  return {
    categoryId: 'cat-athletic',
    name: 'Athletic',
    description: 'Speed, power, stamina.',
    fields: [buildMetricFieldView()],
    ...overrides,
  };
}

export function buildAssessmentSummaryView(
  overrides: Partial<AssessmentSummaryView> = {},
): AssessmentSummaryView {
  return {
    id: 'asmt-draft-1',
    periodLabel: 'Summer 2026',
    playerLabel: 'mem-002',
    statusLabel: 'Draft',
    statusTone: 'medium',
    revisionLabel: 'Revision 1',
    timestampLabel: 'Updated May 1, 2026',
    openLabel: 'Open',
    ...overrides,
  };
}

export function buildAssessmentsView(overrides: Partial<AssessmentsView> = {}): AssessmentsView {
  return {
    title: 'Assessments',
    subtitle: 'Score the squad.',
    status: 'ready',
    ...buildAssessmentsStateCopy(),
    emptyTitle: 'No assessments yet',
    emptyMessage: 'Nothing here.',
    noMatchesTitle: 'No assessments match',
    noMatchesMessage: 'Clear a filter.',
    listLabel: 'Team assessments',
    countLabel: '1 of 1 assessments',
    statusFilterLabel: 'Status',
    filterAllLabel: 'All',
    statusFilter: 'all',
    statusOptions: [
      { value: 'all', label: 'All' },
      { value: 'draft', label: 'Draft' },
    ],
    items: [buildAssessmentSummaryView()],
    hasMatches: true,
    onStatusFilterChange: vi.fn(),
    onOpen: vi.fn(),
    ...overrides,
  };
}

export function buildAssessmentEntryView(
  overrides: Partial<AssessmentEntryView> = {},
): AssessmentEntryView {
  return {
    title: 'Assessment entry',
    status: 'ready',
    ...buildAssessmentsStateCopy(),
    emptyTitle: 'Assessment not found',
    emptyMessage: 'It no longer exists.',
    backLabel: 'Back to assessments',
    onBack: vi.fn(),
    statusLabel: 'Draft',
    statusTone: 'medium',
    revisionLabel: 'Revision 1',
    periodLabel: 'Period',
    playerLabel: 'mem-002',
    gridLabel: 'Metric scores',
    groups: [buildMetricGroupView()],
    notEvaluatedLabel: 'Not evaluated',
    notEvaluatedHint: 'Not evaluated is not a zero.',
    clearLabel: 'Clear',
    noteLabel: 'Evidence note',
    notePlaceholder: 'What did you observe?',
    completenessLabel: 'Completeness',
    completenessValue: '1 of 3 metrics evaluated',
    completenessPercent: 33,
    summaryLabel: 'Overall summary',
    summaryPlaceholder: 'Optional summary.',
    summary: '',
    isEditable: true,
    readOnlyLabel: '',
    saveLabel: 'Save draft',
    isSaving: false,
    workflowLabel: 'Assessment workflow',
    workflowActions: [
      { step: 'submit', label: 'Submit for review', tone: 'primary', testId: 'assessment-submit' },
    ],
    isTransitioning: false,
    revisionsLabel: 'Revision history',
    revisionsEmptyLabel: 'No earlier revisions.',
    revisions: [],
    onScoreChange: vi.fn(),
    onNumericChange: vi.fn(),
    onTextChange: vi.fn(),
    onNoteChange: vi.fn(),
    onClearValue: vi.fn(),
    onSummaryChange: vi.fn(),
    onSave: vi.fn(),
    onWorkflowStep: vi.fn(),
    ...overrides,
  };
}

export function buildTrendChartView(overrides: Partial<TrendChartView> = {}): TrendChartView {
  return {
    title: 'Trend over periods',
    description: 'Speed across 2 periods.',
    points: [
      { label: 'Spring 2026', value: 3 },
      { label: 'Summer 2026', value: null },
    ],
    linePath: 'M44 100',
    areaPath: '',
    markers: [{ key: 'spring-0', x: 44, y: 100 }],
    axisTicks: [
      { key: 'spring-0', x: 44, y: 216, label: 'Spring 2026' },
      { key: 'summer-1', x: 596, y: 216, label: 'Summer 2026' },
    ],
    hasGap: true,
    gapNotice: 'Periods without an evaluation are left blank.',
    lowDataNotice: null,
    tableCaption: 'Data behind Trend over periods',
    tableToggleLabel: 'Show the data table',
    columnLabels: ['Period', 'Value'],
    rows: [
      { key: 'spring-0', label: 'Spring 2026', valueText: '3' },
      { key: 'summer-1', label: 'Summer 2026', valueText: 'Not evaluated' },
    ],
    ...overrides,
  };
}

export function buildRadarChartView(overrides: Partial<RadarChartView> = {}): RadarChartView {
  return {
    title: 'Category profile',
    description: 'Latest published profile across 2 categories.',
    polygonPoints: '160,40 160,280',
    ringRadii: [31, 62, 93, 124],
    axes: [
      { key: 'athletic-0', label: 'Athletic', x: 160, y: 20 },
      { key: 'mental-1', label: 'Mental', x: 160, y: 300 },
    ],
    center: 160,
    size: 320,
    tableCaption: 'Data behind Category profile',
    tableToggleLabel: 'Show the data table',
    columnLabels: ['Metric', 'Value'],
    rows: [
      { key: 'athletic-0', label: 'Athletic', valueText: '4' },
      { key: 'mental-1', label: 'Mental', valueText: 'Not evaluated' },
    ],
    ...overrides,
  };
}

export function buildFeedbackCardView(overrides: Partial<FeedbackCardView> = {}): FeedbackCardView {
  return {
    id: 'feedback-1',
    publishedLabel: 'Published: July 12, 2026',
    sections: [
      { key: 'positiveFrisbee', label: 'Frisbee strengths', body: 'Break-side flick is a weapon.' },
    ],
    acknowledgeLabel: 'Acknowledge',
    acknowledgedLabel: null,
    isAcknowledged: false,
    clarifyLabel: 'Ask for clarification',
    clarificationLabel: null,
    ...overrides,
  };
}

export function buildGoalCardView(overrides: Partial<GoalCardView> = {}): GoalCardView {
  return {
    id: 'goal-2',
    title: 'Raise reset completion',
    description: 'Complete 90% of resets.',
    statusLabel: 'Active',
    statusTone: 'primary',
    targetLabel: '90% reset completion',
    baselineLabel: 'Baseline: 72',
    progressLabel: '50% of the target',
    progressPercent: 50,
    dueLabel: 'Due: 2026-08-31',
    actionsLabel: 'Action plan',
    actions: [
      {
        key: 'goal-2-0',
        description: 'Marked reset drills',
        stateLabel: 'Done',
        done: true,
        dueLabel: null,
      },
    ],
    transition: { transition: 'achieve', label: 'Mark achieved' },
    ...overrides,
  };
}

export function buildPerformanceView(overrides: Partial<PerformanceView> = {}): PerformanceView {
  return {
    title: 'My performance',
    subtitle: 'Your published trends.',
    status: 'ready',
    ...buildAssessmentsStateCopy(),
    emptyTitle: 'No assessments yet',
    emptyMessage: 'Nothing here.',
    metricSelectLabel: 'Metric',
    metricOptions: [{ value: 'metric-speed', label: 'Speed' }],
    selectedMetricId: 'metric-speed',
    onSelectMetric: vi.fn(),
    trend: buildTrendChartView(),
    radar: buildRadarChartView(),
    feedbackTitle: 'Coach feedback',
    feedbackEmptyTitle: 'No published feedback yet',
    feedbackEmptyMessage: 'It appears here once published.',
    feedbackCards: [buildFeedbackCardView()],
    isAcknowledging: false,
    onAcknowledge: vi.fn(),
    goalsTitle: 'Development goals',
    goalsEmptyTitle: 'No goals yet',
    goalsEmptyMessage: 'Goals appear here.',
    goals: [buildGoalCardView()],
    isTransitioningGoal: false,
    onGoalTransition: vi.fn(),
    ...overrides,
  };
}
