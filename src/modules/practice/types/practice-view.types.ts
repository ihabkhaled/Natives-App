import type { AsyncViewCopy } from '@/shared/types';

import type {
  PracticeScope,
  PracticeType,
  RsvpReason,
  RsvpStatus,
} from '../constants/practice.constants';

/**
 * Prepared, fully-translated view models handed to the presentational practice
 * components. Every label is resolved and every instant formatted in Cairo time
 * here so the components stay UI-only.
 */
export type PracticeCalendarStatus =
  'loading' | 'error' | 'offline' | 'empty' | 'ready' | 'forbidden';

export type PracticeSessionStatus = PracticeCalendarStatus;

export interface PracticeSessionCardView {
  readonly id: string;
  readonly title: string;
  readonly typeLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly showStatusBadge: boolean;
  readonly isCancelled: boolean;
  readonly timeLabel: string;
  readonly venueLabel: string | null;
  readonly rsvpLabel: string;
  readonly rsvpTone: string;
  readonly changeLabel: string | null;
  readonly waitlistLabel: string | null;
}

export interface PracticeDaySectionView {
  readonly dayKey: string;
  readonly dayLabel: string;
  readonly sessions: readonly PracticeSessionCardView[];
}

export interface PracticeDetailRowView {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

export interface PracticeVenueView {
  readonly name: string;
  readonly addressLine: string | null;
  readonly mapUrl: string | null;
  readonly directionsLabel: string;
  readonly notesHeading: string;
  readonly notes: string | null;
}

export interface PracticeAgendaItemView {
  readonly id: string;
  readonly label: string;
  readonly durationLabel: string | null;
}

export interface PracticeCountView {
  readonly key: string;
  readonly label: string;
  readonly countText: string;
}

export interface RsvpOptionView {
  readonly value: RsvpStatus;
  readonly label: string;
  readonly color: string;
  readonly testId: string;
  readonly isActive: boolean;
}

export interface RsvpReasonOptionView {
  readonly value: RsvpReason;
  readonly label: string;
}

export interface RsvpControlData {
  readonly prompt: string;
  readonly yourResponseLabel: string;
  readonly currentStatusLabel: string;
  readonly currentStatusTone: string;
  readonly options: readonly RsvpOptionView[];
  readonly reasonLabel: string;
  readonly reasonNoneLabel: string;
  readonly reasonOptions: readonly RsvpReasonOptionView[];
  readonly showReason: boolean;
  readonly canRespond: boolean;
  readonly disabledExplanation: string | null;
  readonly deadlineLabel: string | null;
  readonly waitlistLabel: string | null;
}

interface PracticeScopeOptionView {
  readonly value: PracticeScope;
  readonly label: string;
}

interface PracticeTypeOptionView {
  readonly value: PracticeType;
  readonly label: string;
}

interface RsvpFilterOptionView {
  readonly value: RsvpStatus;
  readonly label: string;
}

export interface PracticeFilterOptions {
  readonly scope: readonly PracticeScopeOptionView[];
  readonly type: readonly PracticeTypeOptionView[];
  readonly rsvp: readonly RsvpFilterOptionView[];
}

export interface PracticeFilterView {
  readonly scopeLabel: string;
  readonly scope: PracticeScope;
  readonly scopeOptions: readonly PracticeScopeOptionView[];
  readonly onScopeChange: (scope: PracticeScope) => void;
  readonly typeLabel: string;
  readonly typeAllLabel: string;
  readonly type: PracticeType | null;
  readonly typeOptions: readonly PracticeTypeOptionView[];
  readonly onTypeChange: (type: PracticeType | null) => void;
  readonly rsvpLabel: string;
  readonly rsvpAllLabel: string;
  readonly rsvp: RsvpStatus | null;
  readonly rsvpOptions: readonly RsvpFilterOptionView[];
  readonly onRsvpChange: (rsvp: RsvpStatus | null) => void;
}

export interface PracticeCalendarView extends AsyncViewCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: PracticeCalendarStatus;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly filter: PracticeFilterView;
  readonly sections: readonly PracticeDaySectionView[];
  readonly onSelectSession: (sessionId: string) => void;
  readonly hasMore: boolean;
  readonly isFetchingMore: boolean;
  readonly loadMoreLabel: string;
  readonly onLoadMore: () => void;
  readonly boundedNotice: string | null;
  readonly subscriptionHeading: string;
  readonly subscriptionBody: string;
}

export interface PracticeSessionDetailData {
  readonly title: string;
  readonly typeLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly isCancelled: boolean;
  readonly changeHeading: string | null;
  readonly changeMessage: string | null;
  readonly scheduleHeading: string;
  readonly scheduleRows: readonly PracticeDetailRowView[];
  readonly capacityLabel: string;
  readonly venueHeading: string;
  readonly venue: PracticeVenueView | null;
  readonly venueTbdLabel: string;
  readonly instructionsHeading: string;
  readonly instructions: string | null;
  readonly agendaHeading: string;
  readonly agendaEmptyLabel: string;
  readonly agenda: readonly PracticeAgendaItemView[];
  readonly countsHeading: string;
  readonly counts: readonly PracticeCountView[] | null;
  readonly countsPrivateLabel: string;
  readonly updatedLabel: string;
  readonly subscriptionHeading: string;
  readonly subscriptionBody: string;
  readonly rsvp: RsvpControlData;
}

export interface PracticeSessionScreenView extends AsyncViewCopy {
  readonly title: string;
  readonly status: PracticeSessionStatus;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly detail: PracticeSessionDetailData | null;
  readonly selectedReason: RsvpReason | null;
  readonly onSelectReason: (reason: RsvpReason | null) => void;
  readonly onSubmitRsvp: (status: RsvpStatus) => void;
  readonly isSubmitting: boolean;
  readonly conflictNote: string | null;
  readonly onOpenMap: (url: string) => void;
}
