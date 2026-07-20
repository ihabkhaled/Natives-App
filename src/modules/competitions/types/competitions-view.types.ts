import type { AsyncViewCopy } from '@/shared/types';
import type { AsyncViewStatus } from '@/shared/ui';

import type { AvailabilityValue, SquadTransition } from '../constants/competitions.constants';

/** The scope, grants, and connectivity every competitions screen resolves. */
export interface CompetitionsContextView {
  readonly teamId: string;
  readonly membershipId: string;
  readonly isOffline: boolean;
  readonly canReadCompetitions: boolean;
  readonly canManageCompetitions: boolean;
  readonly canReadSquads: boolean;
  readonly canManageSquads: boolean;
  readonly canOverrideEligibility: boolean;
  readonly canReadRoster: boolean;
  readonly canManageRoster: boolean;
  readonly canLockRoster: boolean;
  readonly isLoading: boolean;
}

/** Which i18n namespace a screen draws its shared state copy from. */
export interface ScreenCopyNamespace {
  readonly loadingLabel: string;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly retry: string;
  readonly offlineTitle: string;
  readonly offlineMessage: string;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
}

/** Callbacks every competitions mutation hook reports its outcome through. */
export interface CompetitionsMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: () => void;
}

/** Screen copy every competitions screen shares: async + guard + empty. */
export interface CompetitionsScreenCopy extends AsyncViewCopy {
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
}

export interface CompetitionsOption {
  readonly value: string;
  readonly label: string;
}

export interface FactRowView {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

export interface CompetitionCardView {
  readonly id: string;
  readonly name: string;
  readonly typeLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly windowLabel: string;
  readonly organizerLabel: string;
  readonly divisionLabel: string;
  readonly openLabel: string;
}

export interface CompetitionsListView extends CompetitionsScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly countLabel: string;
  readonly statusFilterLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly CompetitionsOption[];
  readonly typeFilterLabel: string;
  readonly typeFilter: string;
  readonly typeOptions: readonly CompetitionsOption[];
  readonly items: readonly CompetitionCardView[];
  readonly hasMatches: boolean;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly squadsLinkLabel: string;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onTypeFilterChange: (value: string) => void;
  readonly onOpen: (competitionId: string) => void;
  readonly onOpenSquads: () => void;
}

export interface StageRowView {
  readonly id: string;
  readonly name: string;
  readonly formatLabel: string;
  readonly ordinalLabel: string;
  readonly roundsLabel: string;
  readonly rounds: readonly string[];
  readonly roundsEmptyLabel: string;
}

export interface FixtureRowView {
  readonly id: string;
  readonly opponentName: string;
  readonly homeAwayLabel: string;
  readonly timeLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly venueLabel: string;
  readonly rescheduleNote: string | null;
}

export interface OpponentRowView {
  readonly id: string;
  readonly name: string;
  readonly shortName: string | null;
  readonly statusLabel: string;
}

export interface CompetitionDetailView extends CompetitionsScreenCopy {
  readonly title: string;
  readonly backLabel: string;
  readonly status: AsyncViewStatus;
  readonly heading: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly typeLabel: string;
  readonly summaryHeading: string;
  readonly facts: readonly FactRowView[];
  readonly descriptionHeading: string;
  readonly description: string | null;
  readonly cancellationNotice: string | null;
  readonly stagesHeading: string;
  readonly stagesIntro: string;
  readonly stagesEmptyLabel: string;
  readonly stages: readonly StageRowView[];
  readonly fixturesHeading: string;
  readonly fixturesIntro: string;
  readonly fixturesEmptyLabel: string;
  readonly fixtures: readonly FixtureRowView[];
  readonly opponentsHeading: string;
  readonly opponentsIntro: string;
  readonly opponentsEmptyLabel: string;
  readonly opponents: readonly OpponentRowView[];
  readonly onBack: () => void;
}

export interface SquadCardView {
  readonly id: string;
  readonly name: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly revisionLabel: string;
  readonly deadlineLabel: string;
  readonly thresholdLabel: string;
  readonly openLabel: string;
}

export interface SquadsListView extends CompetitionsScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly countLabel: string;
  readonly statusFilterLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly CompetitionsOption[];
  readonly items: readonly SquadCardView[];
  readonly hasMatches: boolean;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onOpen: (squadId: string) => void;
}

export interface SignalChipView {
  readonly key: string;
  readonly label: string;
  readonly statusLabel: string;
  readonly tone: string;
}

/**
 * One advisory candidate row. `attendanceLabel` already reads "not enough
 * data" when the backend reported null, so the component never sees a number
 * it might round to zero.
 */
export interface CandidateRowView {
  readonly membershipId: string;
  readonly fullName: string;
  readonly attendanceLabel: string;
  readonly availabilityLabel: string;
  readonly jerseyLabel: string;
  readonly overallLabel: string;
  readonly overallTone: string;
  readonly signals: readonly SignalChipView[];
  readonly isSelected: boolean;
  readonly selectedBadge: string;
  readonly needsOverride: boolean;
  readonly overrideHint: string | null;
  readonly actionLabel: string;
  readonly isActionDisabled: boolean;
}

export interface OverrideDialogView {
  readonly heading: string;
  readonly intro: string;
  readonly candidateName: string;
  readonly reasonLabel: string;
  readonly reasonPlaceholder: string;
  readonly reasonValue: string;
  readonly validationMessage: string | null;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly canConfirm: boolean;
  readonly isSaving: boolean;
  readonly onReasonChange: (value: string) => void;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export interface EligibilityPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly advisoryNotice: string;
  readonly emptyLabel: string;
  readonly lockedNotice: string | null;
  readonly rows: readonly CandidateRowView[];
  readonly ratioHeading: string;
  readonly ratioFacts: readonly FactRowView[];
  readonly ratioVerdict: string;
  readonly override: OverrideDialogView | null;
  readonly onToggle: (membershipId: string) => void;
}

export interface AvailabilityRowView {
  readonly key: string;
  readonly membershipId: string;
  readonly availabilityLabel: string;
  readonly sourceLabel: string;
  readonly reason: string | null;
}

export interface AvailabilityPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly windowNotice: string | null;
  readonly valueLabel: string;
  readonly value: AvailabilityValue;
  readonly options: readonly CompetitionsOption[];
  readonly reasonLabel: string;
  readonly reasonPlaceholder: string;
  readonly reasonValue: string;
  readonly submitLabel: string;
  readonly isSaving: boolean;
  readonly emptyLabel: string;
  readonly rows: readonly AvailabilityRowView[];
  readonly onValueChange: (value: string) => void;
  readonly onReasonChange: (value: string) => void;
  readonly onSubmit: () => void;
}

export interface RosterRowView {
  readonly membershipId: string;
  readonly fullName: string;
  readonly jerseyLabel: string;
  readonly roleLabel: string;
  readonly availabilityLabel: string;
  readonly attendanceLabel: string;
}

export interface RosterPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly pendingNotice: string;
  readonly exportNote: string;
  readonly emptyLabel: string;
  readonly columns: readonly string[];
  readonly rows: readonly RosterRowView[];
}

export interface SquadTransitionActionView {
  readonly transition: SquadTransition;
  readonly label: string;
  readonly tone: string;
  readonly isBusy: boolean;
  readonly onSelect: () => void;
}

export interface SquadDetailView extends CompetitionsScreenCopy {
  readonly title: string;
  readonly backLabel: string;
  readonly status: AsyncViewStatus;
  readonly heading: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly facts: readonly FactRowView[];
  readonly notesHeading: string;
  readonly notes: string | null;
  readonly publishHeading: string;
  readonly publishIntro: string;
  readonly actions: readonly SquadTransitionActionView[];
  readonly eligibility: EligibilityPanelView;
  readonly availability: AvailabilityPanelView;
  readonly roster: RosterPanelView;
  readonly onBack: () => void;
}
