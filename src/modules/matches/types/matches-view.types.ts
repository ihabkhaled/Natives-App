import type { AsyncViewStatus, ChartTableRow, FactListItem, SelectFieldOption } from '@/shared/ui';
import type { ScreenCopy, ScreenCopyKeys } from '@/shared/view';

import type { MatchTransition } from '../constants/matches.constants';

export type ScreenCopyNamespace = ScreenCopyKeys;
export type MatchesScreenCopy = ScreenCopy;

/** Team scope, effective grants, and connectivity for every match screen. */
export interface MatchesContextView {
  readonly teamId: string;
  readonly userId: string;
  readonly isOffline: boolean;
  readonly canReadMatches: boolean;
  readonly canScoreMatch: boolean;
  readonly canFinalizeMatch: boolean;
  readonly canReadStatistics: boolean;
  readonly canReadAnalysis: boolean;
  readonly isLoading: boolean;
}

export interface MatchCardView {
  readonly id: string;
  readonly title: string;
  readonly scoreLabel: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly resultLabel: string;
  readonly homeAwayLabel: string;
  readonly isLive: boolean;
  readonly openScoreboardLabel: string;
  readonly openStatisticsLabel: string;
}

export interface MatchesListView extends MatchesScreenCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly status: AsyncViewStatus;
  readonly countLabel: string;
  readonly statusFilterLabel: string;
  readonly statusFilter: string;
  readonly statusOptions: readonly SelectFieldOption[];
  readonly items: readonly MatchCardView[];
  readonly hasMatches: boolean;
  readonly noMatchesTitle: string;
  readonly noMatchesMessage: string;
  readonly onStatusFilterChange: (value: string) => void;
  readonly onOpenScoreboard: (matchId: string) => void;
  readonly onOpenStatistics: (matchId: string) => void;
}

export interface ScoreboardHeadView {
  readonly usLabel: string;
  readonly themLabel: string;
  readonly ourScore: string;
  readonly theirScore: string;
  readonly statusLabel: string;
  readonly statusTone: string;
  readonly periodLabel: string;
  readonly capLabel: string;
  readonly capValue: string;
  readonly liveRegionLabel: string;
  readonly announcement: string;
}

interface ScoringControlView {
  readonly testId: string;
  readonly label: string;
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly onPress: () => void;
}

export interface ScoringPanelView {
  readonly heading: string;
  readonly intro: string;
  readonly scorerLabel: string;
  readonly scorerValue: string;
  readonly scorerOptions: readonly SelectFieldOption[];
  readonly assistLabel: string;
  readonly assistValue: string;
  readonly assistOptions: readonly SelectFieldOption[];
  readonly usControl: ScoringControlView;
  readonly themControl: ScoringControlView;
  readonly blockedNotice: string | null;
  readonly onScorerChange: (value: string) => void;
  readonly onAssistChange: (value: string) => void;
}

export interface TimeoutPanelView {
  readonly heading: string;
  readonly usControl: ScoringControlView;
  readonly themControl: ScoringControlView;
  readonly usRemainingLabel: string;
  readonly themRemainingLabel: string;
}

export interface TransitionButtonView {
  readonly transition: MatchTransition;
  readonly label: string;
  readonly disabled: boolean;
}

export interface StatePanelView {
  readonly heading: string;
  readonly intro: string;
  readonly buttons: readonly TransitionButtonView[];
  readonly isRunning: boolean;
  readonly onTransition: (transition: MatchTransition) => void;
}

export interface TimelineRowView {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string | null;
  readonly tone: string | null;
}

export interface TimelinePanelView {
  readonly heading: string;
  readonly intro: string;
  readonly rows: readonly TimelineRowView[];
  readonly emptyLabel: string;
  readonly undoLabel: string;
  readonly undoDisabled: boolean;
  readonly undoBlockedNotice: string | null;
  readonly undoReasonLabel: string;
  readonly undoReason: string;
  readonly undoConfirmLabel: string;
  readonly undoCancelLabel: string;
  readonly undoTitle: string;
  readonly undoMessage: string;
  readonly isUndoOpen: boolean;
  readonly isUndoRunning: boolean;
  readonly onUndoOpen: () => void;
  readonly onUndoCancel: () => void;
  readonly onUndoReasonChange: (value: string) => void;
  readonly onUndoConfirm: () => void;
}

export interface QueueRowView {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly tone: string;
}

export interface ConflictRowView {
  readonly key: string;
  readonly label: string;
  readonly queuedLabel: string;
  readonly queuedValue: string;
  readonly serverLabel: string;
  readonly serverValue: string;
  readonly discardLabel: string;
  readonly reloadLabel: string;
  readonly onDiscard: () => void;
  readonly onReload: () => void;
}

export interface QueuePanelView {
  readonly heading: string;
  readonly intro: string;
  readonly badgeLabel: string;
  readonly badgeTone: string;
  readonly rows: readonly QueueRowView[];
  readonly syncedTitle: string;
  readonly syncedMessage: string;
  readonly retryLabel: string;
  readonly hasFailed: boolean;
  readonly onRetryFailed: () => void;
  readonly limitTitle: string | null;
  readonly limitMessage: string | null;
  readonly foreignTitle: string | null;
  readonly foreignMessage: string | null;
  readonly conflictHeading: string;
  readonly conflictIntro: string;
  readonly conflictNote: string;
  readonly conflicts: readonly ConflictRowView[];
}

export interface FinalizePanelView {
  readonly heading: string;
  readonly intro: string;
  readonly actionLabel: string;
  readonly disabled: boolean;
  readonly isRunning: boolean;
  readonly statusNotice: string;
  readonly blockedNotice: string | null;
  readonly onFinalize: () => void;
}

export interface ScoreboardScreenView extends MatchesScreenCopy {
  readonly title: string;
  readonly heading: string;
  readonly subtitle: string;
  readonly backLabel: string;
  readonly status: AsyncViewStatus;
  readonly permissionNotice: string | null;
  readonly head: ScoreboardHeadView;
  readonly rulesHeading: string;
  readonly rulesIntro: string;
  readonly rules: readonly FactListItem[];
  readonly scoring: ScoringPanelView;
  readonly timeouts: TimeoutPanelView;
  readonly state: StatePanelView;
  readonly timeline: TimelinePanelView;
  readonly queue: QueuePanelView;
  readonly finalize: FinalizePanelView;
  readonly onBack: () => void;
}

export interface PlayerStatRowView {
  readonly membershipId: string;
  readonly name: string;
  readonly rosteredLabel: string;
  readonly isRostered: boolean;
  readonly hasNoContribution: boolean;
  readonly zeroNotice: string | null;
  readonly cells: readonly string[];
  readonly openLabel: string;
}

export interface PlayerReportView {
  readonly heading: string;
  readonly facts: readonly FactListItem[];
  readonly zeroNotice: string | null;
  readonly missingNotice: string | null;
  readonly closeLabel: string;
}

export interface MatchStatisticsScreenView extends MatchesScreenCopy {
  readonly title: string;
  readonly heading: string;
  readonly subtitle: string;
  readonly backLabel: string;
  readonly status: AsyncViewStatus;
  readonly teamHeading: string;
  readonly teamIntro: string;
  readonly teamFacts: readonly FactListItem[];
  readonly chartHeading: string;
  readonly chartCaption: string;
  readonly chartToggle: string;
  readonly chartColumns: readonly string[];
  readonly chartRows: readonly ChartTableRow[];
  readonly chartBars: readonly ChartBarView[];
  readonly playersHeading: string;
  readonly playersIntro: string;
  readonly playersCaption: string;
  readonly playerCountLabel: string;
  readonly playerColumns: readonly string[];
  readonly playerRows: readonly PlayerStatRowView[];
  readonly incompleteNotice: string | null;
  readonly report: PlayerReportView | null;
  readonly reportHeading: string;
  readonly reportIntro: string;
  readonly glossaryHeading: string;
  readonly glossaryIntro: string;
  readonly glossary: readonly FactListItem[];
  readonly derivationHeading: string;
  readonly derivationIntro: string;
  readonly derivation: readonly FactListItem[];
  readonly video: VideoGapView;
  readonly onBack: () => void;
  readonly onOpenReport: (membershipId: string) => void;
  readonly onCloseReport: () => void;
}

export interface ChartBarView {
  readonly key: string;
  readonly label: string;
  readonly valueText: string;
  readonly percent: number;
}

/**
 * The video-analysis surface. The backend does not ship clip, timestamp, or
 * tag endpoints yet, so this is a documented gap rather than mocked content.
 */
export interface VideoGapView {
  readonly heading: string;
  readonly title: string;
  readonly message: string;
  readonly deferredNote: string;
}
