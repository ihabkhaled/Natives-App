/**
 * Copy for the standalone public marketing pages split out of the landing
 * page. Each page carries its own title and meta description because each one
 * targets a different search intent — a single scrolling page can only ever
 * rank for one of them.
 *
 * Section bodies are NOT duplicated here: every page reuses the canonical
 * `landing.*` / `about.*` copy through the existing section builders, so the
 * teaser on `/` and the full page can never drift apart.
 */
export const PUBLIC_PAGES_I18N_KEYS = {
  ultimateEyebrow: 'publicPages.ultimateEyebrow',
  ultimateTitle: 'publicPages.ultimateTitle',
  ultimateMetaTitle: 'publicPages.ultimateMetaTitle',
  ultimateMetaDescription: 'publicPages.ultimateMetaDescription',

  spiritEyebrow: 'publicPages.spiritEyebrow',
  spiritTitle: 'publicPages.spiritTitle',
  spiritMetaTitle: 'publicPages.spiritMetaTitle',
  spiritMetaDescription: 'publicPages.spiritMetaDescription',

  galleryEyebrow: 'publicPages.galleryEyebrow',
  galleryTitle: 'publicPages.galleryTitle',
  galleryMetaTitle: 'publicPages.galleryMetaTitle',
  galleryMetaDescription: 'publicPages.galleryMetaDescription',

  locationEyebrow: 'publicPages.locationEyebrow',
  locationTitle: 'publicPages.locationTitle',
  locationMetaTitle: 'publicPages.locationMetaTitle',
  locationMetaDescription: 'publicPages.locationMetaDescription',

  achievementsEyebrow: 'publicPages.achievementsEyebrow',
  achievementsTitle: 'publicPages.achievementsTitle',
  achievementsMetaTitle: 'publicPages.achievementsMetaTitle',
  achievementsMetaDescription: 'publicPages.achievementsMetaDescription',

  navUltimate: 'publicPages.navUltimate',
  navSpirit: 'publicPages.navSpirit',
  navGallery: 'publicPages.navGallery',
  navLocation: 'publicPages.navLocation',
  navAchievements: 'publicPages.navAchievements',

  seeAll: 'publicPages.seeAll',
} as const;
