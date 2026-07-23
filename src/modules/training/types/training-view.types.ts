import type { AsyncViewCopy } from '@/shared/types';
import type { AsyncViewStatus } from '@/shared/ui';

import type { EvidenceKind, ReviewDecision } from '../constants/training.constants';
import type { BuddySectionView } from './training-buddy-view.types';

export type { BuddySectionView } from './training-buddy-view.types';

/** The scope, grants, and connectivity every training screen resolves. */
export interface TrainingContextView {
  readonly teamId: string;
  readonly membershipId: string;
  readonly isOffline: boolean;
  readonly canRead: boolean;
  readonly canSubmit: boolean;
  readonly canReview: boolean;
  readonly isLoading: boolean;
}

/** Callbacks every training mutation hook reports its outcome through. */
export interface TrainingMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: () => void;
}

/**
 * Prepared, fully-translated view models handed to the presentational
 * training components. Every label is resolved and every instant formatted
 * here so the components stay UI-only.
 */
export type TrainingStatus = AsyncViewStatus;

/** Screen copy every training screen shares: async + guard + empty. */
export interface TrainingScreenCopy extends AsyncViewCopy {
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
}

export interface TrainingOption {
  readonly value: string;
  readonly label: string;
}

/**
 * One activity type in the picker. The label carries the honest candidate
 * value: when the type is unapproved it reads "pending" and `hasCandidate`
 * is false, so no number is ever guessed.
 */
export interface ActivityTypeOptionView {
  readonly value: string;
  readonly label: string;
  readonly candidateLabel: string;
  readonly hasCandidate: boolean;
  readonly requiresEvidence: boolean;
  readonly durationBoundsLabel: string | null;
}

interface EvidenceDraftView {
  readonly key: string;
  readonly kindLabel: string;
  readonly reference: string;
  readonly description: string | null;
}

export interface EvidenceItemView {
  readonly id: string;
  readonly kindLabel: string;
  readonly reference: string;
  readonly description: string | null;
  readonly scanLabel: string;
  readonly scanTone: string;
}

export interface BuddyItemView {
  readonly id: string;
  readonly membershipId: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly respondedLabel: string | null;
}

/** Every edit the composer can report back to its hook. */
export interface ComposerCallbacks {
  readonly onTypeChange: (value: string) => void;
  readonly onDateChange: (value: string) => void;
  readonly onDateOpen: () => void;
  readonly onDateDismiss: () => void;
  readonly onDurationChange: (value: string) => void;
  readonly onQuantityChange: (value: string) => void;
  readonly onNotesChange: (value: string) => void;
  readonly onSave: () => void;
}

export interface TrainingComposerView extends ComposerCallbacks {
  readonly heading: string;
  readonly intro: string;
  readonly typeLabel: string;
  readonly typePlaceholder: string;
  readonly typeValue: string;
  readonly typeOptions: readonly ActivityTypeOptionView[];
  readonly dateLabel: string;
  readonly dateValue: string;
  readonly dateDisplayValue: string;
  readonly datePlaceholder: string;
  readonly dateOpenLabel: string;
  readonly dateDialogTitle: string;
  readonly dateCloseLabel: string;
  readonly dateHint: string;
  readonly isDateOpen: boolean;
  readonly dateMax: string;
  readonly dateLocale: string;
  readonly durationLabel: string;
  readonly durationValue: string;
  readonly durationHint: string | null;
  readonly quantityLabel: string;
  readonly quantityValue: string;
  readonly showsQuantity: boolean;
  readonly notesLabel: string;
  readonly notesPlaceholder: string;
  readonly notesValue: string;
  readonly candidateHeading: string;
  readonly candidateLabel: string;
  readonly candidateHint: string;
  readonly candidateNotice: string;
  readonly hasCandidate: boolean;
  readonly evidence: TrainingEvidenceEditorView;
  readonly buddies: TrainingBuddyEditorView;
  readonly saveLabel: string;
  readonly isSaving: boolean;
  readonly canSave: boolean;
  readonly validationMessage: string | null;
}

export interface TrainingEvidenceEditorView {
  readonly heading: string;
  readonly intro: string;
  readonly privacyNotice: string;
  readonly kindLabel: string;
  readonly kindValue: EvidenceKind;
  readonly kindOptions: readonly TrainingOption[];
  readonly referenceLabel: string;
  readonly referenceValue: string;
  readonly descriptionLabel: string;
  readonly descriptionValue: string;
  readonly addLabel: string;
  readonly removeLabel: string;
  readonly emptyLabel: string;
  readonly items: readonly EvidenceDraftView[];
  readonly canAdd: boolean;
  readonly onKindChange: (value: string) => void;
  readonly onReferenceChange: (value: string) => void;
  readonly onDescriptionChange: (value: string) => void;
  readonly onAdd: () => void;
  readonly onRemove: (key: string) => void;
}

export interface TrainingBuddyEditorView {
  readonly heading: string;
  readonly intro: string;
  readonly addFieldLabel: string;
  readonly addLabel: string;
  readonly removeLabel: string;
  readonly emptyLabel: string;
  readonly value: string;
  readonly options: readonly TrainingOption[];
  readonly selected: readonly TrainingOption[];
  readonly canAdd: boolean;
  readonly onValueChange: (value: string) => void;
  readonly onAdd: () => void;
  readonly onRemove: (membershipId: string) => void;
}

export interface SubmissionSummaryView {
  readonly id: string;
  readonly typeName: string;
  readonly dateLabel: string;
  readonly durationLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly evidenceLabel: string;
  readonly buddyLabel: string | null;
  readonly openLabel: string;
}

export interface TrainingWorkspaceView extends TrainingScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: TrainingStatus;
  readonly composer: TrainingComposerView;
  readonly buddies: BuddySectionView;
  readonly listLabel: string;
  readonly countLabel: string;
  readonly statusFilterLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly TrainingOption[];
  readonly items: readonly SubmissionSummaryView[];
  readonly hasMatches: boolean;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onOpen: (submissionId: string) => void;
}

export interface TrainingHistoryEntryView {
  readonly key: string;
  readonly label: string;
  readonly timeText: string;
  readonly tone: string;
}

export interface TrainingWorkflowActionView {
  readonly key: string;
  readonly label: string;
  readonly testId: string;
  readonly tone: string;
  readonly isBusy: boolean;
  readonly onSelect: () => void;
}

/** The claim's own facts, prepared once by the detail helper. */
export interface TrainingDetailBody {
  readonly typeName: string;
  readonly dateLabel: string;
  readonly durationLabel: string;
  readonly notes: string | null;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly candidateLabel: string;
  readonly candidateNotice: string;
  readonly changesBanner: string | null;
}

export interface TrainingDetailView extends TrainingScreenCopy, TrainingDetailBody {
  readonly title: string;
  readonly backLabel: string;
  readonly status: TrainingStatus;
  readonly notFoundTitle: string;
  readonly notFoundMessage: string;
  readonly reviewNoteHeading: string;
  readonly reviewNote: string | null;
  readonly evidenceHeading: string;
  readonly evidenceEmptyLabel: string;
  readonly evidencePrivacyNotice: string;
  readonly evidence: readonly EvidenceItemView[];
  readonly buddiesHeading: string;
  readonly buddiesEmptyLabel: string;
  readonly buddies: readonly BuddyItemView[];
  readonly historyHeading: string;
  readonly historyIntro: string;
  readonly historyEmptyLabel: string;
  readonly history: readonly TrainingHistoryEntryView[];
  readonly actions: readonly TrainingWorkflowActionView[];
  readonly onBack: () => void;
}

export interface ReviewQueueItemView {
  readonly id: string;
  readonly typeName: string;
  readonly dateLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly evidenceLabel: string;
  readonly isSelected: boolean;
  readonly openLabel: string;
}

export interface ReviewSignalView {
  readonly key: string;
  readonly label: string;
}

export interface ReviewDecisionActionView {
  readonly decision: ReviewDecision;
  readonly label: string;
  readonly testId: string;
  readonly tone: string;
  readonly isBusy: boolean;
  readonly onSelect: () => void;
}

export interface ReviewDetailPanelView {
  readonly typeName: string;
  readonly dateLabel: string;
  readonly durationLabel: string;
  readonly notes: string | null;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly evidenceLabel: string;
  readonly buddyLabel: string;
  readonly signalsHeading: string;
  readonly signalsIntro: string;
  readonly signalsNoneLabel: string;
  readonly signals: readonly ReviewSignalView[];
  readonly decisionHeading: string;
  readonly noteLabel: string;
  readonly notePlaceholder: string;
  readonly noteValue: string;
  readonly noteError: string | null;
  readonly selfBlockedNotice: string | null;
  readonly actions: readonly ReviewDecisionActionView[];
  readonly onNoteChange: (value: string) => void;
}

export interface TrainingReviewView extends TrainingScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: TrainingStatus;
  readonly queueHeading: string;
  readonly queueCountLabel: string;
  readonly statusFilterLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly TrainingOption[];
  readonly items: readonly ReviewQueueItemView[];
  readonly selectPrompt: string;
  readonly detail: ReviewDetailPanelView | null;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onSelect: (submissionId: string) => void;
}
