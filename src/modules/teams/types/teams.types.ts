import type { SeasonStatus, TeamStatus } from '../constants/teams.constants';

/**
 * App-owned teams domain. Wire instants keep the `…Iso` convention; wire dates
 * stay date-only strings because that is what the backend stores and compares.
 */
export interface Team {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly locale: string;
  readonly timezone: string;
  readonly primaryColor: string | null;
  readonly status: TeamStatus;
  readonly updatedAtIso: string;
  /** Optimistic-concurrency token every write has to echo back. */
  readonly version: number;
}

export interface Season {
  readonly id: string;
  readonly teamId: string;
  readonly slug: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly status: SeasonStatus;
  readonly version: number;
}

/** Create payload: slug and name are the only fields the backend requires. */
export interface CreateTeamInput {
  readonly slug: string;
  readonly name: string;
  readonly timezone: string | null;
  readonly locale: string | null;
  readonly primaryColor: string | null;
}

/** Update payload; slug is immutable server-side and is deliberately absent. */
export interface UpdateTeamInput {
  readonly name: string;
  readonly timezone: string | null;
  readonly locale: string | null;
  readonly primaryColor: string | null;
  readonly expectedVersion: number;
}

export interface CreateSeasonInput {
  readonly slug: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly status: SeasonStatus;
}

export interface UpdateSeasonInput extends CreateSeasonInput {
  readonly expectedVersion: number;
}

/** One permission in the seeded catalog, grouped by the area it governs. */
interface PermissionCatalogEntry {
  readonly key: string;
  readonly area: string;
  readonly description: string;
}

/** One role bundle and the permission keys it grants. */
export interface RoleBundle {
  readonly key: string;
  readonly displayName: string;
  readonly description: string;
  readonly isSystem: boolean;
  readonly permissions: readonly string[];
}

export interface RoleMatrix {
  readonly policyVersion: number;
  readonly permissions: readonly PermissionCatalogEntry[];
  readonly roles: readonly RoleBundle[];
}
