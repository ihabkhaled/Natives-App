import type { AsyncViewCopy } from '@/shared/types';

import type {
  AssessmentWorkflowStep,
  GoalTransition,
  MetricSource,
} from '../constants/assessments.constants';

/**
 * Prepared, fully-translated view models handed to the presentational
 * assessment components. Every label is resolved and every instant formatted
 * here so the components stay UI-only.
 */
export type AssessmentsStatus = 'loading' | 'error' | 'offline' | 'forbidden' | 'empty' | 'ready';

export interface AssessmentSummaryView {
  readonly id: string;
  readonly periodLabel: string;
  readonly playerLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly revisionLabel: string;
  readonly timestampLabel: string;
  readonly openLabel: string;
}

export interface AssessmentsView extends AsyncViewCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AssessmentsStatus;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly listLabel: string;
  readonly countLabel: string;
  readonly statusFilterLabel: string;
  readonly filterAllLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly AssessmentFilterOption[];
  readonly items: readonly AssessmentSummaryView[];
  readonly hasMatches: boolean;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onOpen: (assessmentId: string) => void;
}

export interface AssessmentFilterOption {
  readonly value: string;
  readonly label: string;
}

export interface MetricFieldView {
  readonly metricDefinitionId: string;
  readonly name: string;
  readonly definition: string;
  readonly guidance: string;
  readonly requiredLabel: string;
  readonly isRequired: boolean;
  readonly directionLabel: string;
  readonly sourceLabel: string;
  readonly source: MetricSource;
  readonly unitLabel: string | null;
  readonly isScoreScale: boolean;
  readonly isTextScale: boolean;
  readonly options: readonly string[];
  readonly minimumValue: number | null;
  readonly maximumValue: number | null;
  readonly stepValue: number | null;
  /** `null` means not evaluated; it is never rendered as 0. */
  readonly numericValue: number | null;
  readonly textValue: string | null;
  readonly note: string | null;
  readonly isEvaluated: boolean;
  readonly valueReadout: string;
  readonly inputLabel: string;
}

export interface MetricGroupView {
  readonly categoryId: string;
  readonly name: string;
  readonly description: string;
  readonly fields: readonly MetricFieldView[];
}

export interface WorkflowActionView {
  readonly step: AssessmentWorkflowStep;
  readonly label: string;
  readonly tone: 'primary' | 'secondary' | 'ghost' | 'danger';
  readonly testId: string;
}

export interface AssessmentRevisionView {
  readonly id: string;
  readonly label: string;
  readonly statusLabel: string;
  readonly statusTone: string;
}

export interface AssessmentEntryView extends AsyncViewCopy {
  readonly title: string;
  readonly status: AssessmentsStatus;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly backLabel: string;
  readonly onBack: () => void;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly revisionLabel: string;
  readonly periodLabel: string;
  readonly playerLabel: string;
  readonly gridLabel: string;
  readonly groups: readonly MetricGroupView[];
  readonly notEvaluatedLabel: string;
  readonly notEvaluatedHint: string;
  readonly clearLabel: string;
  readonly noteLabel: string;
  readonly notePlaceholder: string;
  readonly completenessLabel: string;
  readonly completenessValue: string;
  readonly completenessPercent: number;
  readonly summaryLabel: string;
  readonly summaryPlaceholder: string;
  readonly summary: string;
  readonly isEditable: boolean;
  readonly readOnlyLabel: string;
  readonly saveLabel: string;
  readonly isSaving: boolean;
  readonly workflowLabel: string;
  readonly workflowActions: readonly WorkflowActionView[];
  readonly isTransitioning: boolean;
  readonly revisionsLabel: string;
  readonly revisionsEmptyLabel: string;
  readonly revisions: readonly AssessmentRevisionView[];
  readonly onScoreChange: (metricDefinitionId: string, score: number) => void;
  readonly onNumericChange: (metricDefinitionId: string, raw: string) => void;
  readonly onTextChange: (metricDefinitionId: string, raw: string) => void;
  readonly onNoteChange: (metricDefinitionId: string, raw: string) => void;
  readonly onClearValue: (metricDefinitionId: string) => void;
  readonly onSummaryChange: (raw: string) => void;
  readonly onSave: () => void;
  readonly onWorkflowStep: (step: AssessmentWorkflowStep) => void;
}

/** One plotted point; `value === null` is a gap that must not be drawn as 0. */
export interface ChartPoint {
  readonly label: string;
  readonly value: number | null;
}

export interface ChartTableRow {
  readonly key: string;
  readonly label: string;
  readonly valueText: string;
}

export interface TrendChartView {
  readonly title: string;
  readonly description: string;
  readonly points: readonly ChartPoint[];
  readonly linePath: string;
  readonly areaPath: string;
  readonly markers: readonly ChartMarker[];
  readonly axisTicks: readonly ChartAxisTick[];
  readonly hasGap: boolean;
  readonly gapNotice: string;
  readonly lowDataNotice: string | null;
  readonly tableCaption: string;
  readonly tableToggleLabel: string;
  readonly columnLabels: readonly string[];
  readonly rows: readonly ChartTableRow[];
}

export interface ChartMarker {
  readonly key: string;
  readonly x: number;
  readonly y: number;
}

export interface ChartAxisTick {
  readonly key: string;
  readonly x: number;
  readonly y: number;
  readonly label: string;
}

export interface RadarAxisView {
  readonly key: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

export interface RadarChartView {
  readonly title: string;
  readonly description: string;
  readonly polygonPoints: string;
  readonly ringRadii: readonly number[];
  readonly axes: readonly RadarAxisView[];
  readonly center: number;
  readonly size: number;
  readonly tableCaption: string;
  readonly tableToggleLabel: string;
  readonly columnLabels: readonly string[];
  readonly rows: readonly ChartTableRow[];
}

export interface FeedbackSectionView {
  readonly key: string;
  readonly label: string;
  readonly body: string;
}

export interface FeedbackCardView {
  readonly id: string;
  readonly publishedLabel: string;
  readonly sections: readonly FeedbackSectionView[];
  readonly acknowledgeLabel: string;
  readonly acknowledgedLabel: string | null;
  readonly isAcknowledged: boolean;
  readonly clarifyLabel: string;
  readonly clarificationLabel: string | null;
}

interface GoalActionView {
  readonly key: string;
  readonly description: string;
  readonly stateLabel: string;
  readonly done: boolean;
  readonly dueLabel: string | null;
}

export interface GoalCardView {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly targetLabel: string | null;
  readonly baselineLabel: string | null;
  readonly progressLabel: string;
  readonly progressPercent: number | null;
  readonly dueLabel: string;
  readonly actionsLabel: string;
  readonly actions: readonly GoalActionView[];
  readonly transition: GoalTransitionView | null;
}

export interface GoalTransitionView {
  readonly transition: GoalTransition;
  readonly label: string;
}

export interface PerformanceView extends AsyncViewCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AssessmentsStatus;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly metricSelectLabel: string;
  readonly metricOptions: readonly AssessmentFilterOption[];
  readonly selectedMetricId: string;
  readonly onSelectMetric: (metricId: string) => void;
  readonly trend: TrendChartView | null;
  readonly radar: RadarChartView | null;
  readonly feedbackTitle: string;
  readonly feedbackEmptyTitle: string;
  readonly feedbackEmptyMessage: string;
  readonly feedbackCards: readonly FeedbackCardView[];
  readonly isAcknowledging: boolean;
  readonly onAcknowledge: (feedbackId: string, clarificationRequested: boolean) => void;
  readonly goalsTitle: string;
  readonly goalsEmptyTitle: string;
  readonly goalsEmptyMessage: string;
  readonly goals: readonly GoalCardView[];
  readonly isTransitioningGoal: boolean;
  readonly onGoalTransition: (goalId: string) => void;
}
