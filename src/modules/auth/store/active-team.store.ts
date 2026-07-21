import { createPersistedAppStore } from '@/packages/state';
import { createPreferencesStorageAdapter } from '@/platform';
import { STORAGE_KEYS } from '@/shared/config';

import {
  ACTIVE_TEAM_STORE_VERSION,
  migratePersistedActiveTeam,
  NO_ACTIVE_TEAM_SELECTION,
} from './active-team.migrations';

export interface ActiveTeamState {
  /** The team the principal chose to work inside; null until they choose one. */
  readonly selectedTeamId: string | null;
  readonly selectTeam: (teamId: string) => void;
  readonly clearSelection: () => void;
}

/**
 * Which of the principal's teams the app is currently scoped to.
 *
 * This is genuinely client-global state: the server has no opinion about which
 * of a multi-team principal's scopes they are looking at right now, and the
 * choice must survive a reload. Persisted (versioned, schema-validated) through
 * the platform Preferences adapter — id only, never server state or secrets.
 */
export const useActiveTeamStore = createPersistedAppStore<ActiveTeamState>(
  (set) => ({
    ...NO_ACTIVE_TEAM_SELECTION,
    selectTeam: (selectedTeamId) => {
      set({ selectedTeamId });
    },
    clearSelection: () => {
      set(NO_ACTIVE_TEAM_SELECTION);
    },
  }),
  {
    storageKey: STORAGE_KEYS.activeTeam,
    version: ACTIVE_TEAM_STORE_VERSION,
    storage: createPreferencesStorageAdapter(),
    migrate: (persisted, fromVersion) =>
      migratePersistedActiveTeam(persisted, fromVersion) as ActiveTeamState,
    // Re-validating at the current version is idempotent here: a valid payload
    // passes through, anything else degrades to "no selection".
    validate: (candidate) =>
      migratePersistedActiveTeam(candidate, ACTIVE_TEAM_STORE_VERSION) as ActiveTeamState,
    partialize: (state) => ({ selectedTeamId: state.selectedTeamId }),
  },
);
