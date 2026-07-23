import type {
  AttendanceExcuse,
  AttendanceQueueState,
  AttendanceSheetState,
  AttendanceStatus,
} from '../constants/attendance.constants';

/** Copy for one designed non-ready state block on the member screen. */
interface MyAttendanceStateCopy {
  readonly loadingLabel: string;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly retryLabel: string;
  readonly onRetry: () => void;
  readonly offlineTitle: string;
  readonly offlineMessage: string;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
}

interface ParticipationBreakdownRowView {
  readonly key: string;
  readonly label: string;
  readonly valueText: string;
}

/** The participation summary card, honest about "not enough data". */
export interface ParticipationCardView {
  readonly title: string;
  readonly rateLabel: string;
  readonly rateText: string;
  readonly hasRate: boolean;
  readonly breakdown: readonly ParticipationBreakdownRowView[];
  readonly ruleNotice: string;
  readonly candidateNotice: string | null;
  /** True when the backend reports no approved attendance rule yet. */
  readonly isNotConfigured: boolean;
  readonly notConfiguredMessage: string;
}

/** The per-session self check-in card, driven by the server-ruled state. */
export interface SelfCheckInCardView {
  readonly title: string;
  readonly sessionLabel: string | null;
  readonly noSessionMessage: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly statusChip: { readonly label: string; readonly tone: string } | null;
  readonly stateMessage: string | null;
  readonly offlineNotice: string | null;
  readonly canCheckIn: boolean;
  readonly checkInLabel: string;
  readonly isSubmitting: boolean;
  readonly noteLabel: string;
  readonly noteValue: string;
  readonly onNoteChange: (value: string) => void;
  readonly onCheckIn: () => void;
}

/** One session of the member's own history, fully translated. */
export interface SelfHistoryRowView {
  readonly sessionId: string;
  readonly dateLabel: string;
  readonly typeLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly latenessLabel: string | null;
  readonly excuseLabel: string | null;
  readonly sourceLabel: string | null;
  readonly notFinalizedHint: string | null;
}

/** The bounded newest-first history section with its load-more window. */
export interface SelfHistoryListView {
  readonly title: string;
  readonly isLoading: boolean;
  readonly loadingLabel: string;
  readonly rows: readonly SelfHistoryRowView[];
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly loadMoreLabel: string;
  readonly canLoadMore: boolean;
  readonly onLoadMore: () => void;
}

export interface MyAttendanceScreenView extends MyAttendanceStateCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly privacyNotice: string;
  readonly status: AttendanceScreenStatus;
  readonly participation: ParticipationCardView | null;
  readonly checkIn: SelfCheckInCardView;
  readonly history: SelfHistoryListView;
}

export type AttendanceScreenStatus =
  'loading' | 'error' | 'offline' | 'empty' | 'ready' | 'forbidden';

export interface AttendanceOption<Value extends string> {
  readonly value: Value;
  readonly label: string;
}

export interface AttendanceRosterRowView {
  readonly membershipId: string;
  readonly playerLabel: string;
  readonly memberIdentifierLabel: string;
  readonly rsvpLabel: string;
  readonly rsvpTone: string;
  readonly isHistorical: boolean;
  readonly historicalLabel: string;
  readonly isSelected: boolean;
  readonly selectLabel: string;
  readonly status: AttendanceStatus | null;
  readonly statusLabel: string;
  readonly statusOptions: readonly AttendanceOption<AttendanceStatus>[];
  readonly latenessMinutes: string;
  readonly showLateness: boolean;
  readonly latenessLabel: string;
  readonly excuseCategory: AttendanceExcuse | null;
  readonly showExcuse: boolean;
  readonly excuseLabel: string;
  readonly excuseNoneLabel: string;
  readonly excuseOptions: readonly AttendanceOption<AttendanceExcuse>[];
  readonly queueState: AttendanceQueueState | null;
  readonly syncLabel: string;
  readonly conflictMessage: string | null;
  readonly correctionReason: string;
  readonly correctionReasonLabel: string;
  readonly correctionReasonPlaceholder: string;
  readonly canSaveCorrection: boolean;
  readonly isLocked: boolean;
  /** Locked sheet + `attendance.correct`: the audited correction editor shows. */
  readonly showCorrectionEditor: boolean;
  /** Locked sheet without `attendance.correct`: the row renders read-only. */
  readonly isReadOnly: boolean;
  readonly historyLabel: string;
  readonly saveCorrectionLabel: string;
}

export interface AttendanceRevisionView {
  readonly id: string;
  readonly transitionLabel: string;
  readonly occurredLabel: string;
  readonly reason: string | null;
}

export interface AttendanceScreenActions {
  readonly onRetry: () => void;
  readonly onSubmit: () => void;
  readonly onFinalize: () => void;
  readonly onRetryQueue: () => void;
  readonly onResolveConflict: (membershipId: string) => void;
  readonly onShowHistory: (membershipId: string) => void;
  readonly onSaveCorrection: (membershipId: string) => void;
}

export interface AttendanceScreenView extends AttendanceScreenActions {
  readonly title: string;
  readonly status: AttendanceScreenStatus;
  readonly loadingLabel: string;
  readonly errorTitle: string;
  readonly errorMessage: string;
  readonly retryLabel: string;
  readonly offlineTitle: string;
  readonly offlineMessage: string;
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
  readonly sessionLabel: string;
  readonly subtitle: string;
  readonly sheetState: AttendanceSheetState | null;
  readonly sheetStateLabel: string;
  readonly rosterSummary: string;
  readonly finalizedLabel: string | null;
  readonly queueSummary: string;
  readonly isOffline: boolean;
  readonly offlineQueueNotice: string;
  readonly privacyNotice: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly searchValue: string;
  readonly filterLabel: string;
  readonly filterAllLabel: string;
  readonly filterValue: AttendanceStatus | null;
  readonly statusOptions: readonly AttendanceOption<AttendanceStatus>[];
  readonly selectedCountLabel: string;
  readonly selectAllVisibleLabel: string;
  readonly rows: readonly AttendanceRosterRowView[];
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly markAllPresentLabel: string;
  readonly markSelectedPresentLabel: string;
  readonly markSelectedAbsentLabel: string;
  readonly undoLabel: string;
  readonly saveLabel: string;
  readonly finalizeLabel: string;
  readonly retryQueueLabel: string;
  readonly resolveConflictLabel: string;
  /** Whether the finalize action renders at all (`attendance.finalize`). */
  readonly showFinalize: boolean;
  readonly canUndo: boolean;
  readonly canSubmit: boolean;
  readonly canFinalize: boolean;
  readonly canRetryQueue: boolean;
  readonly isSubmitting: boolean;
  readonly isFinalizing: boolean;
  readonly isCorrecting: boolean;
  readonly isReplaying: boolean;
  readonly historyTitle: string;
  readonly historyEmptyLabel: string;
  readonly historyLoadingLabel: string;
  readonly historyMembershipId: string | null;
  readonly historyItems: readonly AttendanceRevisionView[];
  readonly isHistoryLoading: boolean;
  readonly onSearchChange: (value: string) => void;
  readonly onFilterChange: (value: AttendanceStatus | null) => void;
  readonly onToggleMember: (membershipId: string) => void;
  readonly onSelectAllVisible: () => void;
  readonly onStatusChange: (membershipId: string, status: AttendanceStatus) => void;
  readonly onLatenessChange: (membershipId: string, value: string) => void;
  readonly onExcuseChange: (membershipId: string, excuse: AttendanceExcuse | null) => void;
  readonly onCorrectionReasonChange: (membershipId: string, value: string) => void;
  readonly onMarkAllPresent: () => void;
  readonly onMarkSelectedPresent: () => void;
  readonly onMarkSelectedAbsent: () => void;
  readonly onUndo: () => void;
}
