/** NestJS auth endpoints, relative to the versioned API base URL. */
export const AUTH_API_PATHS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  currentUser: '/auth/me',
  passwordForgot: '/auth/password/forgot',
  passwordReset: '/auth/password/reset',
  invitations: '/auth/invitations',
  sessions: '/auth/sessions',
  sessionsRevokeOthers: '/auth/sessions/revoke-others',
} as const;

/** Invitation lookup path for an opaque invitation token. */
export function invitationDetailPath(token: string): string {
  return `${AUTH_API_PATHS.invitations}/${encodeURIComponent(token)}`;
}

/** Invitation acceptance path (password creation) for an invitation token. */
export function invitationAcceptPath(token: string): string {
  return `${invitationDetailPath(token)}/accept`;
}

/** Single-session revoke path for one device/session id. */
export function sessionRevokePath(sessionId: string): string {
  return `${AUTH_API_PATHS.sessions}/${encodeURIComponent(sessionId)}/revoke`;
}
