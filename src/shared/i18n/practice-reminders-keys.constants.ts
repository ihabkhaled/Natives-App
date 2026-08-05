/**
 * Practice reminder copy. Split out of the aggregate catalog so I18N_KEYS stays
 * within its size budget; validate-locales.mjs reads every *keys.constants.ts.
 */
export const PRACTICE_REMINDERS_I18N_KEYS = {
  title: 'practiceReminders.title',
  subtitle: 'practiceReminders.subtitle',
  loadingLabel: 'practiceReminders.loadingLabel',
  errorTitle: 'practiceReminders.errorTitle',
  errorMessage: 'practiceReminders.errorMessage',
  eligibleLabel: 'practiceReminders.eligibleLabel',
  noResponseLabel: 'practiceReminders.noResponseLabel',
  kindsHeading: 'practiceReminders.kindsHeading',
  kindsEmpty: 'practiceReminders.kindsEmpty',
  windowOpen: 'practiceReminders.windowOpen',
  windowClosed: 'practiceReminders.windowClosed',
  windowReopened: 'practiceReminders.windowReopened',
  sessionPast: 'practiceReminders.sessionPast',
  dispatchAction: 'practiceReminders.dispatchAction',
  dispatchRunning: 'practiceReminders.dispatchRunning',
  dispatchResult: 'practiceReminders.dispatchResult',
  dispatchHeldBack: 'practiceReminders.dispatchHeldBack',
  dispatchNothingDue: 'practiceReminders.dispatchNothingDue',
  testAction: 'practiceReminders.testAction',
  testRunning: 'practiceReminders.testRunning',
  testQueued: 'practiceReminders.testQueued',
  testQuietHours: 'practiceReminders.testQuietHours',
  actionFailed: 'practiceReminders.actionFailed',
} as const;
