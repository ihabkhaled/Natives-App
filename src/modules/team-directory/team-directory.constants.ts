import { SHARED_SCREEN_COPY_KEYS } from '@/shared/view';
import { I18N_KEYS } from '@/shared/i18n';

/**
 * The public directory endpoint is live, so the screen no longer shows the
 * "photos and the full roster are on their way" notice.
 */
export const TEAM_DIRECTORY_ENDPOINT_LIVE = true;

/**
 * The one public team this deployment serves; the `{slug}` path parameter.
 *
 * This must match the `teams.slug` the API stores — the endpoint looks the
 * team up by it, and a mismatch is an unexplained 404 on the public page
 * rather than an error anyone can read.
 */
export const TEAM_DIRECTORY_SLUG = 'un';

/**
 * Staff responsibility codes from the per-team staff-title catalog. Distinct
 * from RBAC permission roles: these describe who is responsible for what on
 * the public "who's who", and one person may hold several.
 */
const STAFF_TITLE = {
  Coach: 'coach',
  CoCoach: 'co-coach',
  SpiritCaptain: 'spirit-captain',
  Finance: 'finance',
  SocialMediaMarketing: 'social-media-marketing',
  Analysis: 'analysis',
  Technical: 'technical',
} as const;

/** Bucket for a title the catalog grows before this client learns about it. */
export const STAFF_TITLE_OTHER = 'other';

/** Display order of the responsibility groups on the public page. */
export const STAFF_TITLE_ORDER = [
  STAFF_TITLE.Coach,
  STAFF_TITLE.CoCoach,
  STAFF_TITLE.SpiritCaptain,
  STAFF_TITLE.Finance,
  STAFF_TITLE.SocialMediaMarketing,
  STAFF_TITLE.Analysis,
  STAFF_TITLE.Technical,
] as const;

/** Translated heading for every known title code, plus the unknown bucket. */
export const STAFF_TITLE_I18N_KEYS: Readonly<Record<string, string>> = {
  [STAFF_TITLE.Coach]: I18N_KEYS.teamDirectory.titleCoach,
  [STAFF_TITLE.CoCoach]: I18N_KEYS.teamDirectory.titleCoCoach,
  [STAFF_TITLE.SpiritCaptain]: I18N_KEYS.teamDirectory.titleSpiritCaptain,
  [STAFF_TITLE.Finance]: I18N_KEYS.teamDirectory.titleFinance,
  [STAFF_TITLE.SocialMediaMarketing]: I18N_KEYS.teamDirectory.titleSocialMedia,
  [STAFF_TITLE.Analysis]: I18N_KEYS.teamDirectory.titleAnalysis,
  [STAFF_TITLE.Technical]: I18N_KEYS.teamDirectory.titleTechnical,
  [STAFF_TITLE_OTHER]: I18N_KEYS.teamDirectory.titleOther,
};

/** Accessible names for the team's social profiles, keyed by SOCIAL_LINKS. */
export const TEAM_SOCIAL_LABEL_I18N_KEYS = {
  facebook: I18N_KEYS.publicFooter.facebookLabel,
  instagram: I18N_KEYS.publicFooter.instagramLabel,
  tiktok: I18N_KEYS.publicFooter.tiktokLabel,
} as const;

/** The five designed non-ready states, drawn from the shared state namespace. */
export const TEAM_DIRECTORY_SCREEN_COPY_KEYS = {
  loadingLabel: I18N_KEYS.teamDirectory.loadingLabel,
  ...SHARED_SCREEN_COPY_KEYS,
} as const;

/** Only encrypted profiles are ever linked out of the public page. */
export const TEAM_SOCIAL_URL_PREFIX = 'https://';
