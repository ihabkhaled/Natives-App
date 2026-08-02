/**
 * Public landing page (`/`) copy. Split out of the aggregate catalog so
 * I18N_KEYS stays within its size budget; validate-locales.mjs reads every
 * *keys.constants.ts.
 */
export const LANDING_I18N_KEYS = {
  metaTitle: 'landing.metaTitle',
  metaDescription: 'landing.metaDescription',

  heroEyebrow: 'landing.heroEyebrow',
  heroTitle: 'landing.heroTitle',
  heroTagline: 'landing.heroTagline',
  heroFounded: 'landing.heroFounded',
  heroPrimaryCta: 'landing.heroPrimaryCta',
  heroSecondaryCta: 'landing.heroSecondaryCta',

  explainerEyebrow: 'landing.explainerEyebrow',
  explainerHeading: 'landing.explainerHeading',
  explainerBody: 'landing.explainerBody',

  aboutPreviewHeading: 'landing.aboutPreviewHeading',
  aboutPreviewQuote: 'landing.aboutPreviewQuote',
  aboutPreviewCta: 'landing.aboutPreviewCta',

  staffHeading: 'landing.staffHeading',
  staffIntro: 'landing.staffIntro',
  staffTitleCoach: 'landing.staffTitleCoach',
  staffTitleCoCoach: 'landing.staffTitleCoCoach',
  staffTitleSpiritCaptain: 'landing.staffTitleSpiritCaptain',
  staffTitleFinance: 'landing.staffTitleFinance',
  staffTitleSocialMedia: 'landing.staffTitleSocialMedia',
  staffTitleAnalysis: 'landing.staffTitleAnalysis',
  staffTitleTechnical: 'landing.staffTitleTechnical',
  staffAvatarLabel: 'landing.staffAvatarLabel',
  staffEmptyTitle: 'landing.staffEmptyTitle',
  staffEmptyMessage: 'landing.staffEmptyMessage',

  playersHeading: 'landing.playersHeading',
  playersIntro: 'landing.playersIntro',
  playersEmptyTitle: 'landing.playersEmptyTitle',
  playersEmptyMessage: 'landing.playersEmptyMessage',

  competitionsHeading: 'landing.competitionsHeading',
  competitionsIntro: 'landing.competitionsIntro',
  competitionsRankPending: 'landing.competitionsRankPending',
  competitionsEmptyTitle: 'landing.competitionsEmptyTitle',
  competitionsEmptyMessage: 'landing.competitionsEmptyMessage',

  matchesHeading: 'landing.matchesHeading',
  matchesIntro: 'landing.matchesIntro',
  matchesEmptyTitle: 'landing.matchesEmptyTitle',
  matchesEmptyMessage: 'landing.matchesEmptyMessage',

  leaderboardHeading: 'landing.leaderboardHeading',
  leaderboardIntro: 'landing.leaderboardIntro',
  leaderboardEmptyTitle: 'landing.leaderboardEmptyTitle',
  leaderboardEmptyMessage: 'landing.leaderboardEmptyMessage',

  newsHeading: 'landing.newsHeading',
  newsIntro: 'landing.newsIntro',
  newsEmptyTitle: 'landing.newsEmptyTitle',
  newsEmptyMessage: 'landing.newsEmptyMessage',

  locationHeading: 'landing.locationHeading',
  locationIntro: 'landing.locationIntro',
  locationAddress: 'landing.locationAddress',
  locationCta: 'landing.locationCta',
  locationMapAlt: 'landing.locationMapAlt',

  galleryHeading: 'landing.galleryHeading',
  galleryIntro: 'landing.galleryIntro',
  galleryPlaceholderAlt: 'landing.galleryPlaceholderAlt',

  achievementsHeading: 'landing.achievementsHeading',
  statFoundedLabel: 'landing.statFoundedLabel',
  statFoundedValue: 'landing.statFoundedValue',
  statRosterLabel: 'landing.statRosterLabel',
  statRosterValue: 'landing.statRosterValue',
  statLocationLabel: 'landing.statLocationLabel',
  statLocationValue: 'landing.statLocationValue',
  statCompetitionsLabel: 'landing.statCompetitionsLabel',
  statCompetitionsValue: 'landing.statCompetitionsValue',

  socialHeading: 'landing.socialHeading',
  socialIntro: 'landing.socialIntro',

  finalCtaHeading: 'landing.finalCtaHeading',
  finalCtaBody: 'landing.finalCtaBody',
  finalCtaPrimary: 'landing.finalCtaPrimary',
  finalCtaSecondary: 'landing.finalCtaSecondary',
} as const;
