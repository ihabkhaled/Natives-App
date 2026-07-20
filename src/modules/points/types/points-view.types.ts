import type { AsyncViewCopy } from '@/shared/types';
import type { AsyncViewStatus, ChartTableRow } from '@/shared/ui';

/**
 * Prepared, fully-translated view models handed to the presentational points
 * components. Every label is resolved and every instant formatted here so the
 * components stay UI-only.
 */
type PointsStatus = AsyncViewStatus;

export interface PointsScreenCopy extends AsyncViewCopy {
  readonly forbiddenTitle: string;
  readonly forbiddenMessage: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
}

export interface PointsOption {
  readonly value: string;
  readonly label: string;
}

export interface RankExplanationRowView {
  readonly key: string;
  readonly category: string;
  readonly pointsText: string;
}

export interface RankExplanationView {
  readonly heading: string;
  readonly intro: string;
  readonly categoryColumn: string;
  readonly pointsColumn: string;
  readonly rows: readonly RankExplanationRowView[];
  readonly totalLabel: string;
  readonly totalText: string;
  readonly ruleVersionLabel: string;
  readonly emptyLabel: string;
  readonly serverNotice: string;
}

export interface LeaderboardRowView {
  readonly membershipId: string;
  readonly rankText: string;
  readonly memberLabel: string;
  readonly totalText: string;
  /** True when the server total is 0 — the row still shows, muted. */
  readonly isZero: boolean;
  readonly isTied: boolean;
  readonly tiedLabel: string | null;
  readonly movementGlyph: string;
  readonly movementLabel: string;
  readonly movementTone: string;
  readonly movementDetail: string;
  readonly badgeCountLabel: string | null;
  readonly isExpanded: boolean;
  readonly explainLabel: string;
  readonly explanation: RankExplanationView;
}

export interface PointsCategoryChartBarView {
  readonly key: string;
  readonly label: string;
  readonly valueText: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly labelY: number;
}

export interface PointsCategoryChartView {
  readonly heading: string;
  readonly description: string;
  readonly emptyLabel: string;
  readonly viewBox: string;
  readonly bars: readonly PointsCategoryChartBarView[];
  readonly tableToggleLabel: string;
  readonly tableCaption: string;
  readonly columnLabels: readonly string[];
  readonly tableRows: readonly ChartTableRow[];
}

/** The board's filter chrome, freshness, and tie-break statement. */
export interface LeaderboardChrome {
  readonly filtersHeading: string;
  readonly periodLabel: string;
  readonly periodValue: string;
  readonly periodOptions: readonly PointsOption[];
  readonly cohortLabel: string;
  readonly cohortValue: string;
  readonly cohortOptions: readonly PointsOption[];
  readonly categoryLabel: string;
  readonly categoryValue: string;
  readonly categoryOptions: readonly PointsOption[];
  readonly freshnessLabel: string;
  readonly countLabel: string;
  readonly tieRuleHeading: string;
  readonly tieRuleLabel: string;
  readonly tieRuleNotice: string;
  readonly zeroNotice: string;
  readonly tableCaption: string;
  readonly columnRank: string;
  readonly columnMember: string;
  readonly columnTotal: string;
  readonly columnMovement: string;
  readonly columnBadges: string;
}

export interface LeaderboardView extends PointsScreenCopy, LeaderboardChrome {
  readonly title: string;
  readonly subtitle: string;
  readonly status: PointsStatus;
  readonly rows: readonly LeaderboardRowView[];
  readonly onPeriodChange: (value: string) => void;
  readonly onCohortChange: (value: string) => void;
  readonly onCategoryChange: (value: string) => void;
  readonly onToggleExplain: (membershipId: string) => void;
}

export interface LedgerEntryView {
  readonly id: string;
  readonly typeLabel: string;
  readonly typeTone: string;
  readonly amountText: string;
  readonly sourceLabel: string;
  readonly categoryLabel: string | null;
  readonly reasonText: string;
  readonly ruleVersionLabel: string;
  readonly dateLabel: string;
}

export interface BadgeView {
  readonly badgeKey: string;
  readonly label: string;
  readonly thresholdLabel: string;
  readonly pointsAtAwardLabel: string;
  readonly awardedLabel: string;
}

export interface BadgeCandidateView {
  readonly key: string;
  readonly thresholdLabel: string;
  readonly progressLabel: string;
  readonly isReached: boolean;
}

/** The ledger body, prepared once by the history helper. */
export interface PointsHistoryBody {
  readonly totalHeading: string;
  readonly totalText: string;
  readonly ledgerHeading: string;
  readonly ledgerIntro: string;
  readonly ledgerEmptyLabel: string;
  readonly appendOnlyNotice: string;
  readonly entries: readonly LedgerEntryView[];
  readonly hasEntries: boolean;
  readonly badgesHeading: string;
  readonly badgesIntro: string;
  readonly badgesEmptyLabel: string;
  readonly badges: readonly BadgeView[];
  readonly candidateHeading: string;
  readonly candidateIntro: string;
  readonly candidates: readonly BadgeCandidateView[];
  readonly chart: PointsCategoryChartView;
}

export interface PointsHistoryView extends PointsScreenCopy, PointsHistoryBody {
  readonly title: string;
  readonly subtitle: string;
  readonly status: PointsStatus;
}
