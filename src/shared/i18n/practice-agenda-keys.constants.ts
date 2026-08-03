/**
 * Practice agenda copy. Split out of the aggregate catalog so I18N_KEYS stays within
 * its size budget; validate-locales.mjs reads every *keys.constants.ts.
 */
export const PRACTICE_AGENDA_I18N_KEYS = {
  navLabel: 'practiceAgenda.navLabel',
  title: 'practiceAgenda.title',
  subtitle: 'practiceAgenda.subtitle',
  loadingLabel: 'practiceAgenda.loadingLabel',
  emptyTitle: 'practiceAgenda.emptyTitle',
  emptyMessage: 'practiceAgenda.emptyMessage',
  listHeading: 'practiceAgenda.listHeading',
  listIntro: 'practiceAgenda.listIntro',
  countLabel: 'practiceAgenda.countLabel',
  actionFailed: 'practiceAgenda.actionFailed',
} as const;
