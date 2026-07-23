import type { MemberTier } from './members.fixture';

/**
 * The server-owned role catalog with display metadata, exactly as
 * `GET /rbac/teams/:teamId/assignable-roles` serves it. `physio` is a
 * deliberately client-unknown slug: it pins that a newly seeded backend role
 * renders through the server displayName without a client release.
 */
const ROLE_CATALOG: Readonly<Record<string, { displayName: string; description: string }>> = {
  member: { displayName: 'Member', description: 'Reads their own data and team boards.' },
  scorekeeper: { displayName: 'Scorekeeper', description: 'Records live match scores.' },
  analyst: { displayName: 'Analyst', description: 'Reads team-wide analytics.' },
  physio: { displayName: 'Physiotherapist', description: 'Reads player wellness data.' },
  coach: { displayName: 'Coach', description: 'Manages practices, assessments and squads.' },
  team_admin: {
    displayName: 'Team Admin',
    description: 'Full control of this team, members and settings.',
  },
};

const ASSIGNABLE_CATALOG_BY_TIER: Record<MemberTier, readonly string[]> = {
  admin: ['member', 'scorekeeper', 'analyst', 'physio', 'coach', 'team_admin'],
  coach: ['member', 'scorekeeper', 'analyst', 'physio'],
  member: [],
};

/** Slugs that exist in the catalog but are never grantable through a team. */
const PROTECTED_ROLE_SLUGS: readonly string[] = ['super_admin'];

export function assignableRolesResponse(teamId: string, tier: MemberTier): Record<string, unknown> {
  return {
    teamId,
    roles: ASSIGNABLE_CATALOG_BY_TIER[tier].map((slug) => ({
      slug,
      displayName: ROLE_CATALOG[slug]?.displayName ?? slug,
      description: ROLE_CATALOG[slug]?.description ?? '',
    })),
  };
}

/** Classify a requested invite role the way the backend's RBAC surface does. */
export function classifyInviteRole(
  tier: MemberTier,
  slug: string,
): 'ok' | 'unknown' | 'protected' | 'above-ceiling' {
  if (PROTECTED_ROLE_SLUGS.includes(slug)) {
    return 'protected';
  }
  if (ROLE_CATALOG[slug] === undefined) {
    return 'unknown';
  }
  return ASSIGNABLE_CATALOG_BY_TIER[tier].includes(slug) ? 'ok' : 'above-ceiling';
}
