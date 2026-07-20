import type { AsyncViewCopy } from '@/shared/types';
import type { AsyncViewStatus } from '@/shared/ui';

import type { DecisionOutcome } from '../constants/tryouts.constants';

/** The scope, grants, and connectivity every staff tryout screen resolves. */
export interface TryoutsContextView {
  readonly teamId: string;
  readonly isOffline: boolean;
  readonly canManage: boolean;
  readonly canReadContacts: boolean;
  readonly canReadReadiness: boolean;
  readonly canEvaluate: boolean;
  readonly canDecide: boolean;
  readonly canConvert: boolean;
  readonly isLoading: boolean;
}

export interface TryoutsScreenCopy extends AsyncViewCopy {
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
}

export interface TryoutsOption {
  readonly value: string;
  readonly label: string;
}

export interface TryoutFactView {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

/** Registration form field state, one entry per collected value. */
export interface RegistrationFieldView {
  readonly value: string;
  readonly errorMessage: string | null;
  readonly onChange: (value: string) => void;
}

export interface RegistrationResultView {
  readonly title: string;
  readonly message: string;
  readonly referenceLabel: string;
  readonly reference: string | null;
}

export interface TryoutRegistrationView extends TryoutsScreenCopy {
  readonly title: string;
  readonly intro: string;
  readonly status: AsyncViewStatus;
  readonly backendPendingNotice: string;
  readonly eventLabel: string;
  readonly eventValue: string;
  readonly eventOptions: readonly TryoutsOption[];
  readonly capacityNotice: string | null;
  readonly nameLabel: string;
  readonly namePlaceholder: string;
  readonly name: RegistrationFieldView;
  readonly preferredLabel: string;
  readonly preferred: RegistrationFieldView;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly email: RegistrationFieldView;
  readonly phoneLabel: string;
  readonly phone: RegistrationFieldView;
  readonly birthYearLabel: string;
  readonly birthYear: RegistrationFieldView;
  readonly consentHeading: string;
  readonly consentStatement: string;
  readonly consentVersionLabel: string;
  readonly consentGiven: boolean;
  readonly consentError: string | null;
  readonly privacyHeading: string;
  readonly privacyNotice: string;
  readonly submitLabel: string;
  readonly isSubmitting: boolean;
  readonly canSubmit: boolean;
  readonly result: RegistrationResultView | null;
  readonly onEventChange: (value: string) => void;
  readonly onConsentChange: (value: boolean) => void;
  readonly onSubmit: () => void;
}

export interface TryoutCardView {
  readonly id: string;
  readonly name: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly heldAtLabel: string;
  readonly capacityLabel: string;
  readonly waitlistLabel: string;
  readonly openLabel: string;
}

export interface TryoutsListView extends TryoutsScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly backendPendingNotice: string;
  readonly items: readonly TryoutCardView[];
  readonly onOpen: (tryoutId: string) => void;
}

/** A candidate row. There is no field here that could leak contact detail. */
export interface CandidateRowView {
  readonly candidateId: string;
  readonly reference: string;
  readonly displayName: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly checkedInLabel: string | null;
  readonly canCheckIn: boolean;
  readonly checkInLabel: string;
  readonly openLabel: string;
  readonly isSelected: boolean;
}

export interface RestrictedBlockView {
  readonly heading: string;
  readonly isPermitted: boolean;
  readonly restrictedTitle: string;
  readonly restrictedMessage: string;
  readonly notice: string;
  readonly facts: readonly TryoutFactView[];
}

export interface EvaluationRowView {
  readonly criterion: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly TryoutsOption[];
  readonly onChange: (value: string) => void;
}

export interface EvaluationPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly rows: readonly EvaluationRowView[];
  readonly noteLabel: string;
  readonly notePlaceholder: string;
  readonly noteValue: string;
  readonly submitLabel: string;
  readonly isSaving: boolean;
  readonly forbiddenNotice: string | null;
  readonly onNoteChange: (value: string) => void;
  readonly onSubmit: () => void;
}

interface DecisionActionView {
  readonly outcome: DecisionOutcome;
  readonly label: string;
  readonly tone: string;
  readonly testId: string;
  readonly onSelect: () => void;
}

export interface DecisionPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly currentLabel: string | null;
  readonly offerExpiryLabel: string | null;
  readonly reasonLabel: string;
  readonly reasonPlaceholder: string;
  readonly reasonValue: string;
  readonly validationMessage: string | null;
  readonly actions: readonly DecisionActionView[];
  readonly isSaving: boolean;
  readonly forbiddenNotice: string | null;
  readonly onReasonChange: (value: string) => void;
}

export interface ConversionPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly previewHeading: string;
  readonly previewFacts: readonly TryoutFactView[];
  readonly accountNotice: string;
  readonly confirmLabel: string;
  readonly isSaving: boolean;
  readonly blockedNotice: string | null;
  readonly forbiddenNotice: string | null;
  readonly onConfirm: () => void;
}

export interface CandidatePanelView {
  readonly heading: string;
  readonly referenceLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly consentLabel: string;
  readonly contacts: RestrictedBlockView;
  readonly readiness: RestrictedBlockView;
  readonly evaluation: EvaluationPanelView;
  readonly decision: DecisionPanelView;
  readonly conversion: ConversionPanelView;
}

export interface TryoutDetailView extends TryoutsScreenCopy {
  readonly title: string;
  readonly backLabel: string;
  readonly status: AsyncViewStatus;
  readonly backendPendingNotice: string;
  readonly heading: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly facts: readonly TryoutFactView[];
  readonly candidatesHeading: string;
  readonly candidatesIntro: string;
  readonly candidatesEmptyLabel: string;
  readonly statusFilterLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly TryoutsOption[];
  readonly countLabel: string;
  readonly rows: readonly CandidateRowView[];
  readonly selectPrompt: string;
  readonly panel: CandidatePanelView | null;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onSelect: (candidateId: string) => void;
  readonly onCheckIn: (candidateId: string) => void;
  readonly onBack: () => void;
}
