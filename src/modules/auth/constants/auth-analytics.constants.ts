/** Analytics event names owned by the auth module. */
export const AUTH_ANALYTICS_EVENTS = {
  loginSucceeded: 'auth.login_succeeded',
  logoutCompleted: 'auth.logout_completed',
  passwordResetRequested: 'auth.password_reset_requested',
  passwordResetCompleted: 'auth.password_reset_completed',
  invitationAccepted: 'auth.invitation_accepted',
  sessionRevoked: 'auth.session_revoked',
} as const;
