/**
 * Jersey orders copy. Split out of the aggregate catalog so I18N_KEYS stays within
 * its size budget; validate-locales.mjs reads every *keys.constants.ts.
 */
export const JERSEY_I18N_KEYS = {
  navLabel: 'jersey.navLabel',
  title: 'jersey.title',
  subtitle: 'jersey.subtitle',
  loadingLabel: 'jersey.loadingLabel',
  emptyTitle: 'jersey.emptyTitle',
  emptyMessage: 'jersey.emptyMessage',
  listHeading: 'jersey.listHeading',
  listIntro: 'jersey.listIntro',
  countLabel: 'jersey.countLabel',
  actionFailed: 'jersey.actionFailed',
} as const;
