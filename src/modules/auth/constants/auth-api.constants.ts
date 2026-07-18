/** NestJS auth endpoints, relative to the versioned API base URL. */
export const AUTH_API_PATHS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  currentUser: '/auth/me',
  passwordForgot: '/auth/forgot-password',
  passwordReset: '/auth/reset-password',
  invitations: '/auth/invitations',
  invitationAccept: '/invitations/accept',
  sessions: '/auth/sessions',
  sessionsRevokeOthers: '/auth/sessions/revoke-others',
} as const;

/** Invitation lookup path for an opaque invitation token. */
export function invitationDetailPath(token: string): string {
  return `${AUTH_API_PATHS.invitations}/${encodeURIComponent(token)}`;
}

/** Single-session revoke path for one device/session id. */
export function sessionRevokePath(sessionId: string): string {
  return `${AUTH_API_PATHS.sessions}/${encodeURIComponent(sessionId)}/revoke`;
}
