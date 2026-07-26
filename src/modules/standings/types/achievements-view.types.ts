import type { AsyncViewStatus, SelectFieldOption } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

import type { ChipView } from './standings-view.types';

/** One achievement row/card in the workspace list. */
export interface AchievementCardView {
  readonly key: string;
  readonly iconName: 'trophy' | 'medal' | 'ribbon';
  readonly title: string;
  readonly achievedOn: string;
  readonly subject: string;
  readonly statusChip: ChipView;
  readonly visibilityChip: ChipView;
  readonly sourceTag: string;
  readonly onOpen: () => void;
}

/** One lit/unlit step of the approval timeline. */
export interface TimelineStepView {
  readonly key: string;
  readonly label: string;
  readonly isCurrent: boolean;
  readonly isReached: boolean;
}

/** One gated action of the transition bar. */
export interface TransitionActionView {
  readonly key: string;
  readonly label: string;
  readonly tone: 'primary' | 'secondary' | 'danger';
  readonly needsConfirm: boolean;
  readonly onTrigger: () => void;
}

/** The pending confirm step of a transition, when one is armed. */
export interface TransitionConfirmView {
  readonly message: string;
  readonly reasonLabel: string | null;
  readonly reasonHint: string | null;
  readonly reasonValue: string;
  readonly onReasonChange: (value: string) => void;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly isRunning: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** The opened claim: facts, timeline, and the gated transition bar. */
export interface AchievementDetailView {
  readonly heading: string;
  readonly facts: readonly {
    readonly key: string;
    readonly label: string;
    readonly value: string;
  }[];
  readonly timelineHeading: string;
  readonly timeline: readonly TimelineStepView[];
  readonly rejectionReason: string | null;
  readonly rejectionReasonLabel: string;
  readonly conflictNotice: string | null;
  readonly actions: readonly TransitionActionView[];
  readonly confirm: TransitionConfirmView | null;
  readonly closeLabel: string;
  readonly onClose: () => void;
}

/** The create-claim form, present only while open. */
export interface AchievementFormView {
  readonly heading: string;
  readonly titleLabel: string;
  readonly titleValue: string;
  readonly onTitleChange: (value: string) => void;
  readonly categoryLabel: string;
  readonly categoryValue: string;
  readonly categoryOptions: readonly SelectFieldOption[];
  readonly onCategoryChange: (value: string) => void;
  readonly dateLabel: string;
  readonly dateValue: string;
  readonly dateDisplayValue: string;
  readonly datePlaceholder: string;
  readonly dateOpenLabel: string;
  readonly dateDialogTitle: string;
  readonly dateCloseLabel: string;
  readonly isDateOpen: boolean;
  readonly onDateOpen: () => void;
  readonly onDateDismiss: () => void;
  readonly onDateChange: (value: string) => void;
  readonly memberLabel: string;
  readonly memberValue: string;
  readonly memberOptions: readonly SelectFieldOption[];
  readonly onMemberChange: (value: string) => void;
  readonly descriptionLabel: string;
  readonly descriptionValue: string;
  readonly onDescriptionChange: (value: string) => void;
  readonly evidenceLabel: string;
  readonly evidenceValue: string;
  readonly onEvidenceChange: (value: string) => void;
  readonly visibilityLabel: string;
  readonly visibilityHint: string;
  readonly visibilityValue: string;
  readonly visibilityOptions: readonly SelectFieldOption[];
  readonly onVisibilityChange: (value: string) => void;
  readonly validationMessage: string | null;
  readonly submitLabel: string;
  readonly cancelLabel: string;
  readonly canSubmit: boolean;
  readonly isSaving: boolean;
  readonly onSubmit: () => void;
  readonly onCancel: () => void;
}

/** One outcome row of an import run. */
interface ImportOutcomeRowView {
  readonly key: string;
  readonly reference: string;
  readonly outcome: ChipView;
}

/** The 3-step import wizard, present only for import.manage holders. */
export interface ImportWizardView {
  readonly heading: string;
  readonly intro: string;
  readonly step: 'input' | 'preview' | 'done';
  readonly inputLabel: string;
  readonly inputHint: string;
  readonly inputValue: string;
  readonly onInputChange: (value: string) => void;
  readonly parseError: string | null;
  readonly parseLabel: string;
  readonly canParse: boolean;
  readonly onParse: () => void;
  readonly previewHeading: string | null;
  readonly outcomeRows: readonly ImportOutcomeRowView[];
  readonly totals: string | null;
  readonly commitLabel: string;
  readonly canCommit: boolean;
  readonly isRunning: boolean;
  readonly onCommit: () => void;
  readonly backLabel: string;
  readonly onBack: () => void;
}

/** The achievements workspace screen, ready to render. */
export interface AchievementsScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly subtitle: string;
  readonly statusFilterLabel: string;
  readonly statusFilterValue: string;
  readonly statusFilterOptions: readonly SelectFieldOption[];
  readonly onStatusFilterChange: (value: string) => void;
  readonly categoryFilterLabel: string;
  readonly categoryFilterValue: string;
  readonly categoryFilterOptions: readonly SelectFieldOption[];
  readonly onCategoryFilterChange: (value: string) => void;
  readonly cards: readonly AchievementCardView[];
  readonly createLabel: string | null;
  readonly onOpenCreate: () => void;
  readonly form: AchievementFormView | null;
  readonly detail: AchievementDetailView | null;
  readonly importLabel: string | null;
  readonly onOpenImport: () => void;
  readonly importWizard: ImportWizardView | null;
  readonly banner: string | null;
}

/** One medal card of the trophy cabinet. */
export interface HistoryEntryView {
  readonly key: string;
  readonly iconName: 'trophy' | 'medal' | 'ribbon';
  readonly title: string;
  readonly achievedOn: string;
  readonly categoryLabel: string;
  readonly memberName: string | null;
}

/** One season group of the cabinet timeline. */
export interface HistorySeasonView {
  readonly key: string;
  readonly heading: string;
  readonly entries: readonly HistoryEntryView[];
}

/** The trophy-cabinet screen, ready to render. */
export interface TeamHistoryScreenView extends ScreenCopy {
  readonly status: AsyncViewStatus;
  readonly title: string;
  readonly subtitle: string;
  readonly categoryFilterLabel: string;
  readonly categoryFilterValue: string;
  readonly categoryFilterOptions: readonly SelectFieldOption[];
  readonly onCategoryFilterChange: (value: string) => void;
  readonly seasons: readonly HistorySeasonView[];
  readonly countLabel: string;
  readonly loadMoreLabel: string | null;
  readonly onLoadMore: () => void;
  readonly manageLink: string | null;
  readonly onOpenManage: () => void;
}
