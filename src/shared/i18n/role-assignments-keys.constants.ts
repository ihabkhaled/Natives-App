/**
 * Role assignments copy. Split out of the aggregate catalog so I18N_KEYS stays within
 * its size budget; validate-locales.mjs reads every *keys.constants.ts.
 */
export const ROLE_ASSIGNMENTS_I18N_KEYS = {
  navLabel: 'roleAssignments.navLabel',
  title: 'roleAssignments.title',
  subtitle: 'roleAssignments.subtitle',
  loadingLabel: 'roleAssignments.loadingLabel',
  emptyTitle: 'roleAssignments.emptyTitle',
  emptyMessage: 'roleAssignments.emptyMessage',
  listHeading: 'roleAssignments.listHeading',
  listIntro: 'roleAssignments.listIntro',
  countLabel: 'roleAssignments.countLabel',
  actionFailed: 'roleAssignments.actionFailed',
} as const;
