/**
 * The public contact relay endpoint, relative to the versioned API base URL.
 * Unauthenticated by design: a visitor writing to the team has no account.
 */
export const CONTACT_API_PATHS = {
  contact: '/contact',
} as const;
