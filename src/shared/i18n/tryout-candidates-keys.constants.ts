/**
 * Tryout candidates copy. Split out of the aggregate catalog so I18N_KEYS stays within
 * its size budget; validate-locales.mjs reads every *keys.constants.ts.
 */
export const TRYOUT_CANDIDATES_I18N_KEYS = {
  navLabel: 'tryoutCandidates.navLabel',
  title: 'tryoutCandidates.title',
  subtitle: 'tryoutCandidates.subtitle',
  loadingLabel: 'tryoutCandidates.loadingLabel',
  emptyTitle: 'tryoutCandidates.emptyTitle',
  emptyMessage: 'tryoutCandidates.emptyMessage',
  listHeading: 'tryoutCandidates.listHeading',
  listIntro: 'tryoutCandidates.listIntro',
  countLabel: 'tryoutCandidates.countLabel',
  actionFailed: 'tryoutCandidates.actionFailed',
} as const;
