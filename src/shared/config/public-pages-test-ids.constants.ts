/**
 * Test ids for the standalone public marketing pages split out of the landing
 * page. Split from the aggregate catalog so TEST_IDS stays within its size
 * budget.
 */
export const PUBLIC_PAGES_TEST_IDS = {
  ultimatePage: 'ultimate-page',
  spiritPage: 'spirit-page',
  galleryPage: 'gallery-page',
  locationPage: 'location-page',
  // publicAchievementsPage, not achievementsPage: standings-test-ids.constants.ts
  // already claims 'achievements-page' for the protected standings screen.
  publicAchievementsPage: 'public-achievements-page',
  landingSectionMore: 'landing-section-more',
} as const;
