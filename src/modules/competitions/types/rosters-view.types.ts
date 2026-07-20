import type { AsyncViewStatus } from '@/shared/ui';

import type {
  CompetitionsOption,
  CompetitionsScreenCopy,
  FactRowView,
} from './competitions-view.types';

/** Prepared view models for the competition and match roster screens. */
export interface RosterCardView {
  readonly id: string;
  readonly name: string;
  readonly kindLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly divisionLabel: string;
  readonly sizeLabel: string;
  readonly revisionLabel: string;
  readonly openLabel: string;
}

export interface RostersListView extends CompetitionsScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly countLabel: string;
  readonly kindFilterLabel: string;
  readonly kindFilter: string;
  readonly kindOptions: readonly CompetitionsOption[];
  readonly items: readonly RosterCardView[];
  readonly hasMatches: boolean;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly onKindFilterChange: (value: string) => void;
  readonly onOpen: (rosterId: string) => void;
}

export interface RosterEntryRowView {
  readonly entryId: string;
  readonly membershipId: string;
  readonly jerseyLabel: string;
  readonly roleLabel: string;
  readonly lineLabel: string;
  readonly positionLabel: string;
  readonly divisionLabel: string;
  readonly availabilityLabel: string;
  readonly overrideNote: string | null;
  readonly removeLabel: string;
  readonly isRemovable: boolean;
}

interface RosterViolationView {
  readonly key: string;
  readonly label: string;
  readonly severityLabel: string;
  readonly tone: string;
}

export interface RosterValidationPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly verdictLabel: string;
  readonly verdictTone: string;
  readonly compositionHeading: string;
  readonly composition: readonly FactRowView[];
  readonly violationsHeading: string;
  readonly violationsEmptyLabel: string;
  readonly violations: readonly RosterViolationView[];
}

export interface RosterHistoryRowView {
  readonly key: string;
  readonly label: string;
  readonly timeLabel: string;
  readonly entryCountLabel: string;
}

export interface RosterLifecycleActionView {
  readonly key: string;
  readonly label: string;
  readonly tone: string;
  readonly isBusy: boolean;
  readonly onSelect: () => void;
}

export interface RosterDetailView extends CompetitionsScreenCopy {
  readonly title: string;
  readonly backLabel: string;
  readonly status: AsyncViewStatus;
  readonly heading: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly facts: readonly FactRowView[];
  readonly notes: string | null;
  readonly lifecycleHeading: string;
  readonly lifecycleIntro: string;
  readonly lockedNotice: string | null;
  readonly actions: readonly RosterLifecycleActionView[];
  readonly validation: RosterValidationPanelView;
  readonly entriesHeading: string;
  readonly entriesIntro: string;
  readonly entriesEmptyLabel: string;
  readonly entriesColumns: readonly string[];
  readonly entries: readonly RosterEntryRowView[];
  readonly historyHeading: string;
  readonly historyEmptyLabel: string;
  readonly history: readonly RosterHistoryRowView[];
  readonly onRemoveEntry: (membershipId: string) => void;
  readonly onBack: () => void;
}
