/**
 * Public self-signup copy. Split out of the aggregate catalog so I18N_KEYS
 * stays within its size budget; validate-locales.mjs reads every
 * *keys.constants.ts.
 *
 * Signup never starts a session: the backend answers `201 { state: 'pending' }`
 * and the account stays inert until an administrator approves it. The copy in
 * this family has to say that plainly rather than imply the user is signed in.
 */
export const SIGNUP_I18N_KEYS = {
  title: 'signup.title',
  intro: 'signup.intro',
  cta: 'signup.cta',
  displayNameLabel: 'signup.displayNameLabel',
  displayNamePlaceholder: 'signup.displayNamePlaceholder',
  emailLabel: 'signup.emailLabel',
  emailPlaceholder: 'signup.emailPlaceholder',
  passwordLabel: 'signup.passwordLabel',
  passwordPlaceholder: 'signup.passwordPlaceholder',
  passwordHint: 'signup.passwordHint',
  submit: 'signup.submit',
  submitting: 'signup.submitting',
  statusSubmitting: 'signup.statusSubmitting',
  haveAccount: 'signup.haveAccount',
  summaryTitle: 'signup.summaryTitle',
  validationNameRequired: 'signup.validationNameRequired',
  validationNameTooLong: 'signup.validationNameTooLong',
  validationEmailTooLong: 'signup.validationEmailTooLong',
  validationPasswordTooLong: 'signup.validationPasswordTooLong',
  emailTaken: 'signup.emailTaken',
  pendingTitle: 'signup.pendingTitle',
  pendingMessage: 'signup.pendingMessage',
  pendingStepsTitle: 'signup.pendingStepsTitle',
  pendingStepReview: 'signup.pendingStepReview',
  pendingStepEmail: 'signup.pendingStepEmail',
  pendingStepSignIn: 'signup.pendingStepSignIn',
} as const;
