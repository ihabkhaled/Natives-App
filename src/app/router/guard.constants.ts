/**
 * Every terminal outcome a route guard can reach. Guards never expose
 * restricted content: an unmet condition resolves to a redirect or a
 * dedicated state, never the guarded screen.
 */
export const GUARD_STATUS = {
  Loading: 'loading',
  RedirectLogin: 'redirect-login',
  RedirectHome: 'redirect-home',
  Forbidden: 'forbidden',
  AccountBlocked: 'account-blocked',
  Onboarding: 'onboarding',
  NoTeam: 'no-team',
  Allow: 'allow',
} as const;

export type GuardStatus = (typeof GUARD_STATUS)[keyof typeof GUARD_STATUS];
