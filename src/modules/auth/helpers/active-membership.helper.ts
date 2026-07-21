import type { AuthMembership } from '../types/auth.types';

/**
 * Resolve the membership every team-scoped screen works inside.
 *
 * A principal can hold several scopes. `preferredTeamId` is the team they
 * explicitly switched to (persisted client-side); it wins whenever it still
 * matches one of the memberships the server returned, so a reload keeps them
 * where they were. It is deliberately ignored when it does not match: a team
 * they were removed from must not pin the app to a scope the server will
 * refuse, and degrading to a real scope beats a dead app.
 *
 * Without a usable preference the active scope is the first membership whose
 * lifecycle status is `active`, falling back to the first membership returned
 * so a suspended-but-real scope still resolves instead of silently becoming
 * "no team". Returns null only when the principal genuinely has no membership.
 */
export function selectActiveMembership(
  memberships: readonly AuthMembership[],
  preferredTeamId: string | null = null,
): AuthMembership | null {
  const preferred =
    preferredTeamId === null
      ? undefined
      : memberships.find((membership) => membership.teamId === preferredTeamId);
  return (
    preferred ??
    memberships.find((membership) => membership.status === 'active') ??
    memberships[0] ??
    null
  );
}
