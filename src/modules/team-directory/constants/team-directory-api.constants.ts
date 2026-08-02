/**
 * Public directory path, relative to the versioned API base URL. It is
 * unauthenticated by design: this is the page a visitor sees before they have
 * an account.
 */
export function publicTeamDirectoryPath(slug: string): string {
  return `/public/teams/${encodeURIComponent(slug)}/directory`;
}
