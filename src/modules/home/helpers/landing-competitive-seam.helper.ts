import { I18N_KEYS } from '@/shared/i18n';

import type { TeamDirectory } from '@/modules/team-directory';

import {
  buildLandingSeamChrome,
  buildLiveSeamChrome,
  type LandingSeamChrome,
  type LiveSeamState,
} from './landing-seam-copy.helper';

type Translate = (key: string) => string;

interface CompetitionCardView {
  readonly id: string;
  readonly name: string;
  readonly season: string;
  readonly rankStatus: string;
}

export interface CompetitionsSectionView {
  readonly heading: string;
  readonly intro: string;
  readonly chrome: LandingSeamChrome;
  readonly competitions: readonly CompetitionCardView[];
}

/**
 * Competitions entered this season, from the same public directory read the
 * team page uses — so an admin publishing a competition sees it here without
 * a release. No placement is shown: results are not recorded yet, and every
 * card reads "results pending" rather than an invented finish.
 */
export function buildCompetitionsSection(
  t: Translate,
  directory: TeamDirectory | null,
  seam: LiveSeamState,
): CompetitionsSectionView {
  const rankStatus = t(I18N_KEYS.landing.competitionsRankPending);
  const competitions = (directory?.competitions ?? []).map((competition) => ({
    id: competition.id,
    name: competition.name,
    season: competition.seasonName,
    rankStatus,
  }));
  return {
    heading: t(I18N_KEYS.landing.competitionsHeading),
    intro: t(I18N_KEYS.landing.competitionsIntro),
    chrome: buildLiveSeamChrome(
      t,
      { ...seam, hasData: directory !== null, hasItems: competitions.length > 0 },
      I18N_KEYS.landing.competitionsEmptyTitle,
      I18N_KEYS.landing.competitionsEmptyMessage,
    ),
    competitions,
  };
}

export interface MatchScoresSectionView {
  readonly heading: string;
  readonly intro: string;
  readonly chrome: LandingSeamChrome;
}

/** Recent match scores — no results recorded yet; an honest empty state. */
export function buildMatchScoresSection(t: Translate): MatchScoresSectionView {
  return {
    heading: t(I18N_KEYS.landing.matchesHeading),
    intro: t(I18N_KEYS.landing.matchesIntro),
    chrome: buildLandingSeamChrome(
      t,
      false,
      I18N_KEYS.landing.matchesEmptyTitle,
      I18N_KEYS.landing.matchesEmptyMessage,
    ),
  };
}

export interface LeaderboardSectionView {
  readonly heading: string;
  readonly intro: string;
  readonly chrome: LandingSeamChrome;
}

/** Per-competition individual leaderboard — unlocks once matches are scored. */
export function buildLeaderboardSection(t: Translate): LeaderboardSectionView {
  return {
    heading: t(I18N_KEYS.landing.leaderboardHeading),
    intro: t(I18N_KEYS.landing.leaderboardIntro),
    chrome: buildLandingSeamChrome(
      t,
      false,
      I18N_KEYS.landing.leaderboardEmptyTitle,
      I18N_KEYS.landing.leaderboardEmptyMessage,
    ),
  };
}
