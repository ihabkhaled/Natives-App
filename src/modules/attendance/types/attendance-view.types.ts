import type {
  AttendanceExcuse,
  AttendanceQueueState,
  AttendanceSheetState,
  AttendanceStatus,
} from '../constants/attendance.constants';

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
