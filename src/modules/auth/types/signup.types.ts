/** The three fields `POST /auth/signup` accepts, as the form holds them. */
export interface SignupFormValues {
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
}

/** Translated labels the signup form renders; no key ever reaches the UI. */
export interface SignupFormCopy {
  readonly displayNameLabel: string;
  readonly displayNamePlaceholder: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly passwordHint: string;
  readonly showPassword: string;
  readonly hidePassword: string;
  readonly capsLockWarning: string;
  readonly summaryTitle: string;
  readonly submit: string;
  readonly submitting: string;
  readonly statusSubmitting: string;
}

/** The awaiting-approval confirmation shown after a successful request. */
export interface SignupPendingCopy {
  readonly title: string;
  readonly message: string;
  readonly stepsTitle: string;
  readonly steps: readonly string[];
}

/** Every translated string one signup screen render needs. */
export interface SignupScreenCopy {
  readonly title: string;
  readonly logoLabel: string;
  readonly intro: string;
  readonly haveAccount: string;
  readonly backToLogin: string;
  readonly form: SignupFormCopy;
  readonly pending: SignupPendingCopy;
}
