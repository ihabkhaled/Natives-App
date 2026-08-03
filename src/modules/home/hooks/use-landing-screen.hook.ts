import { contactPath } from '@/modules/contact';
import { newsPath } from '@/modules/news';
import { publicCompetitionsPath } from '@/modules/public-competitions';
import {
  TEAM_DIRECTORY_SLUG,
  teamDirectoryPath,
  useTeamDirectoryQuery,
} from '@/modules/team-directory';
import { tryoutRegistrationPath } from '@/modules/tryouts';
import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation } from '@/packages/router';
import { useNetworkStatus } from '@/platform';
import { I18N_KEYS } from '@/shared/i18n';

import type { CompetitionsSectionView } from '../helpers/landing-competitive-seam.helper';
import { buildCompetitionsSection } from '../helpers/landing-competitive-seam.helper';
import { buildHeroSection, type HeroSectionView } from '../helpers/landing-hero.helper';
import { buildNewsSection, type NewsSectionView } from '../helpers/landing-news-seam.helper';
import { buildSocialSection, type SocialSectionView } from '../helpers/landing-social.helper';
import type { StaffDirectorySectionView } from '../helpers/landing-team-seam.helper';
import { buildStaffDirectorySection } from '../helpers/landing-team-seam.helper';
import type {
  AboutPreviewSectionView,
  ExplainerSectionView,
  FinalCtaSectionView,
} from '../helpers/landing-static-sections.helper';
import {
  buildAboutPreviewSection,
  buildExplainerSection,
  buildFinalCtaSection,
} from '../helpers/landing-static-sections.helper';
import { aboutPath, rootPath, ultimatePath } from '../routes/home.paths';

/** A "see more" affordance pointing from a landing teaser to its full page. */
export interface SectionLinkView {
  readonly label: string;
  readonly onClick: () => void;
}

export interface LandingScreenView {
  readonly path: string;
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly hero: HeroSectionView;
  readonly explainer: ExplainerSectionView;
  readonly explainerLink: SectionLinkView;
  readonly aboutPreview: AboutPreviewSectionView;
  readonly staffDirectory: StaffDirectorySectionView;
  readonly staffLink: SectionLinkView;
  readonly competitions: CompetitionsSectionView;
  readonly competitionsLink: SectionLinkView;
  readonly news: NewsSectionView;
  readonly newsLink: SectionLinkView;
  readonly social: SocialSectionView;
  readonly finalCta: FinalCtaSectionView;
}

/**
 * View model for the landing page at `/`.
 *
 * The landing page is a front door, not the whole site: each subject (the
 * sport, spirit, the roster, results, news, the gallery, our turf) has its own
 * page, and the section here is a teaser that links to it. Sections reuse the
 * same builders those pages use, so a teaser can never drift from its page.
 */
export function useLandingScreen(): LandingScreenView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const network = useNetworkStatus();
  const directoryQuery = useTeamDirectoryQuery(TEAM_DIRECTORY_SLUG);
  const directorySeam = {
    isLoading: directoryQuery.isLoading,
    error: directoryQuery.error,
    isOffline: !network.isOnline,
    onRetry: directoryQuery.refetch,
  };

  const goTo =
    (path: string): (() => void) =>
    (): void => {
      navigation.push(path);
    };

  const goToTryouts = goTo(tryoutRegistrationPath());
  const goToAbout = goTo(aboutPath());
  const goToContact = goTo(contactPath());
  const seeMore = t(I18N_KEYS.publicPages.seeAll);

  return {
    path: rootPath(),
    seoTitle: `${t(I18N_KEYS.landing.metaTitle)} — ${t(I18N_KEYS.common.appName)}`,
    seoDescription: t(I18N_KEYS.landing.metaDescription),
    hero: buildHeroSection(t, goToTryouts, goToAbout),
    explainer: buildExplainerSection(t),
    explainerLink: { label: seeMore, onClick: goTo(ultimatePath()) },
    aboutPreview: buildAboutPreviewSection(t, goToAbout),
    staffDirectory: buildStaffDirectorySection(t, directoryQuery.data ?? null, directorySeam),
    staffLink: { label: seeMore, onClick: goTo(teamDirectoryPath()) },
    competitions: buildCompetitionsSection(t, directoryQuery.data ?? null, directorySeam),
    competitionsLink: { label: seeMore, onClick: goTo(publicCompetitionsPath()) },
    news: buildNewsSection(t),
    newsLink: { label: seeMore, onClick: goTo(newsPath()) },
    social: buildSocialSection(t),
    finalCta: buildFinalCtaSection(t, goToTryouts, goToContact),
  };
}
