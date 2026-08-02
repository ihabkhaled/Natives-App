import { contactPath } from '@/modules/contact';
import { tryoutRegistrationPath } from '@/modules/tryouts';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { I18N_KEYS } from '@/shared/i18n';

import type { ActivePlayersSectionView, StaffDirectorySectionView } from '../helpers/landing-team-seam.helper';
import { buildActivePlayersSection, buildStaffDirectorySection } from '../helpers/landing-team-seam.helper';
import type {
  CompetitionsSectionView,
  LeaderboardSectionView,
  MatchScoresSectionView,
} from '../helpers/landing-competitive-seam.helper';
import {
  buildCompetitionsSection,
  buildLeaderboardSection,
  buildMatchScoresSection,
} from '../helpers/landing-competitive-seam.helper';
import { buildHeroSection, type HeroSectionView } from '../helpers/landing-hero.helper';
import { buildNewsSection, type NewsSectionView } from '../helpers/landing-news-seam.helper';
import { buildSocialSection, type SocialSectionView } from '../helpers/landing-social.helper';
import type {
  AboutPreviewSectionView,
  AchievementsSectionView,
  ExplainerSectionView,
  FinalCtaSectionView,
  GallerySectionView,
  LocationSectionView,
  SpiritValuesSectionView,
} from '../helpers/landing-static-sections.helper';
import {
  buildAboutPreviewSection,
  buildAchievementsSection,
  buildExplainerSection,
  buildFinalCtaSection,
  buildGallerySection,
  buildLocationSection,
  buildSpiritValuesSection,
} from '../helpers/landing-static-sections.helper';
import { aboutPath, rootPath } from '../routes/home.paths';

export interface LandingScreenView {
  readonly path: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly hero: HeroSectionView;
  readonly explainer: ExplainerSectionView;
  readonly aboutPreview: AboutPreviewSectionView;
  readonly staffDirectory: StaffDirectorySectionView;
  readonly activePlayers: ActivePlayersSectionView;
  readonly competitions: CompetitionsSectionView;
  readonly matchScores: MatchScoresSectionView;
  readonly leaderboard: LeaderboardSectionView;
  readonly news: NewsSectionView;
  readonly spiritValues: SpiritValuesSectionView;
  readonly location: LocationSectionView;
  readonly gallery: GallerySectionView;
  readonly achievements: AchievementsSectionView;
  readonly social: SocialSectionView;
  readonly finalCta: FinalCtaSectionView;
}

/** Prepared, translated view model for the public landing page at `/`. */
export function useLandingScreen(): LandingScreenView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const goToTryouts = (): void => {
    navigation.push(tryoutRegistrationPath());
  };
  const goToAbout = (): void => {
    navigation.push(aboutPath());
  };
  const goToContact = (): void => {
    navigation.push(contactPath());
  };

  return {
    path: rootPath(),
    seoTitle: `${t(I18N_KEYS.landing.metaTitle)} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: t(I18N_KEYS.landing.metaDescription),
    hero: buildHeroSection(t, goToTryouts, goToAbout),
    explainer: buildExplainerSection(t),
    aboutPreview: buildAboutPreviewSection(t, goToAbout),
    staffDirectory: buildStaffDirectorySection(t),
    activePlayers: buildActivePlayersSection(t),
    competitions: buildCompetitionsSection(t),
    matchScores: buildMatchScoresSection(t),
    leaderboard: buildLeaderboardSection(t),
    news: buildNewsSection(t),
    spiritValues: buildSpiritValuesSection(t),
    location: buildLocationSection(t),
    gallery: buildGallerySection(t),
    achievements: buildAchievementsSection(t),
    social: buildSocialSection(t),
    finalCta: buildFinalCtaSection(t, goToTryouts, goToContact),
  };
}
