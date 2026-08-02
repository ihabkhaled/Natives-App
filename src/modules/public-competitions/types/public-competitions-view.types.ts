import type { AsyncViewStatus } from '@/shared/ui';
import type { ScreenCopy } from '@/shared/view';

import type { MatchOutcome } from '../constants/public-showcase.constants';

/**
 * View models for the public showcase. Mappers produce the *structural* half
 * (already-formatted numbers, resolved paths, outcome tokens); the hooks
 * supply the *translated* half as a labels block. Keeping the two apart is
 * what lets the mappers stay pure, locale-aware, and React-free.
 */

/** One competition card in the public list. */
export interface PublicCompetitionCardView {
  readonly key: string;
  readonly slug: string;
  readonly name: string;
  readonly yearText: string;
  readonly formatText: string | null;
  readonly locationText: string | null;
  readonly datesText: string | null;
  /** Formatted finishing place, or null while results are pending. */
  readonly rankText: string | null;
  /** Formatted field size, or null when the organiser has not published it. */
  readonly entrantsText: string | null;
  readonly isResultPending: boolean;
  readonly detailPath: string;
}

/** One player line inside an expanded match row. */
export interface PublicPlayerScoreRowView {
  readonly key: string;
  readonly nameText: string;
  readonly goalsText: string;
  readonly assistsText: string;
  readonly blocksText: string;
}

/** One match row of the public results table. */
export interface PublicMatchRowView {
  readonly key: string;
  readonly opponentName: string;
  readonly dateText: string | null;
  /** Bidi-isolated `ours – theirs` pair, or null before the match is scored. */
  readonly scoreText: string | null;
  /** Word-per-side alternative for assistive tech, or null before scoring. */
  readonly scoreReadout: string | null;
  readonly outcome: MatchOutcome;
  readonly outcomeTone: string;
  readonly players: readonly PublicPlayerScoreRowView[];
}

/** One leaderboard row, with the bar width the table meter draws. */
export interface PublicLeaderboardRowView {
  readonly key: string;
  readonly rankText: string;
  readonly displayName: string;
  readonly pointsText: string;
  readonly barPercent: number;
  readonly isLeader: boolean;
}

/** The three content blocks one competition page renders, already mapped. */
export interface PublicShowcaseSections {
  readonly summary: PublicCompetitionCardView | null;
  readonly matches: readonly PublicMatchRowView[];
  readonly leaderboard: readonly PublicLeaderboardRowView[];
}

/** Translated copy the competition list renders. */
export interface PublicCompetitionsLabels {
  readonly yearLabel: string;
  readonly formatLabel: string;
  readonly locationLabel: string;
  readonly datesLabel: string;
  readonly finishLabel: string;
  readonly finishPending: string;
  readonly notPublished: string;
  readonly openDetail: string;
}

/** Translated copy the match-results table renders. */
export interface PublicMatchesLabels {
  readonly caption: string;
  readonly columnOpponent: string;
  readonly columnScore: string;
  readonly columnDate: string;
  readonly columnOutcome: string;
  readonly outcomes: Readonly<Record<MatchOutcome, string>>;
  readonly scorePending: string;
  readonly datePending: string;
  readonly showPlayers: string;
  readonly hidePlayers: string;
  readonly playersCaption: string;
  readonly playersEmpty: string;
  readonly columnPlayer: string;
  readonly columnGoals: string;
  readonly columnAssists: string;
  readonly columnBlocks: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
}

/** Translated copy the individual leaderboard renders. */
export interface PublicLeaderboardLabels {
  readonly caption: string;
  readonly columnRank: string;
  readonly columnPlayer: string;
  readonly columnPoints: string;
  readonly emptyTitle: string;
  readonly emptyMessage: string;
}

/**
 * The public competition list screen. It extends `ScreenCopy` so the shared
 * `AsyncStateView` can read the five designed states straight off the props.
 */
export interface PublicCompetitionsScreenView extends ScreenCopy {
  readonly path: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly heroEyebrow: string;
  readonly heroTitle: string;
  readonly heroIntro: string;
  readonly listHeading: string;
  readonly listIntro: string;
  readonly seamNoticeTitle: string;
  readonly seamNoticeMessage: string;
  readonly isSeamNoticeVisible: boolean;
  readonly status: AsyncViewStatus;
  readonly labels: PublicCompetitionsLabels;
  readonly cards: readonly PublicCompetitionCardView[];
  readonly onOpenCompetition: (detailPath: string) => void;
}

/** The public competition detail screen. */
export interface PublicCompetitionDetailScreenView extends ScreenCopy {
  readonly path: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly heroEyebrow: string;
  readonly title: string;
  readonly backLabel: string;
  readonly onBack: () => void;
  readonly status: AsyncViewStatus;
  readonly summary: PublicCompetitionCardView | null;
  readonly summaryLabels: PublicCompetitionsLabels;
  readonly matchesHeading: string;
  readonly matchesIntro: string;
  readonly matchesLabels: PublicMatchesLabels;
  readonly matches: readonly PublicMatchRowView[];
  readonly expandedMatchKey: string | null;
  readonly onToggleMatch: (key: string) => void;
  readonly leaderboardHeading: string;
  readonly leaderboardIntro: string;
  readonly leaderboardLabels: PublicLeaderboardLabels;
  readonly leaderboard: readonly PublicLeaderboardRowView[];
}
