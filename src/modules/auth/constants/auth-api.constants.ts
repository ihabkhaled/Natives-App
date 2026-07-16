/** NestJS auth endpoints, relative to the versioned API base URL. */
export const AUTH_API_PATHS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  currentUser: '/auth/me',
} as const;
