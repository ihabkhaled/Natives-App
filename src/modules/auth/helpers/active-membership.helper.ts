import type { AuthMembership } from '../types/auth.types';

/**
 * Resolve the membership every team-scoped screen works inside. A principal
 * can hold several scopes; the active one is the first membership whose
 * lifecycle status is `active`, falling back to the first membership returned
 * so a suspended-but-real scope still resolves instead of silently becoming
 * "no team". Returns null only when the principal genuinely has no membership.
 */
export function selectActiveMembership(
  memberships: readonly AuthMembership[],
): AuthMembership | null {
  return memberships.find((membership) => membership.status === 'active') ?? memberships[0] ?? null;
}
