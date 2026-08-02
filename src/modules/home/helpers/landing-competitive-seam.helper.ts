import { I18N_KEYS } from '@/shared/i18n';

import { LANDING_COMPETITIONS } from '../constants/landing-competitions.constants';
import { buildLandingSeamChrome, type LandingSeamChrome } from './landing-seam-copy.helper';

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
 * Competitions entered this season — real seed names (EUNC 2026, EUDL 2026);
 * ranks/scores were not supplied, so every card reads "results pending"
 * rather than an invented placement. Backed by the public showcase endpoint
 * once contract 1.8.0 ships.
 */
export function buildCompetitionsSection(t: Translate): CompetitionsSectionView {
  const rankStatus = t(I18N_KEYS.landing.competitionsRankPending);
  const competitions = LANDING_COMPETITIONS.map((competition) => ({
    id: competition.id,
    name: competition.name,
    season: competition.season,
    rankStatus,
  }));
  return {
    heading: t(I18N_KEYS.landing.competitionsHeading),
    intro: t(I18N_KEYS.landing.competitionsIntro),
    chrome: buildLandingSeamChrome(
      t,
      competitions.length > 0,
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
