import { safeParseWithSchema } from '@/packages/schema';

import { persistedActiveTeamSchema } from './active-team.schema';

export interface PersistedActiveTeam {
  readonly selectedTeamId: string | null;
}

export const ACTIVE_TEAM_STORE_VERSION = 1;

/** "No explicit choice yet" — the app falls back to the first active membership. */
export const NO_ACTIVE_TEAM_SELECTION: PersistedActiveTeam = { selectedTeamId: null };

/**
 * Versioned migration for the persisted team selection. A payload written by a
 * newer build, or one that no longer parses, degrades to "no selection" rather
 * than pinning the app to a scope it cannot reason about.
 */
export function migratePersistedActiveTeam(
  persisted: unknown,
  fromVersion: number,
): PersistedActiveTeam {
  if (fromVersion > ACTIVE_TEAM_STORE_VERSION) {
    return NO_ACTIVE_TEAM_SELECTION;
  }
  const parsed = safeParseWithSchema(persistedActiveTeamSchema, persisted);
  return parsed.success ? parsed.data : NO_ACTIVE_TEAM_SELECTION;
}
