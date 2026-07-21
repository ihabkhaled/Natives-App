import { describe, expect, it } from 'vitest';

import {
  ACTIVE_TEAM_STORE_VERSION,
  migratePersistedActiveTeam,
  NO_ACTIVE_TEAM_SELECTION,
} from './active-team.migrations';

describe('ACTIVE_TEAM_STORE_VERSION', () => {
  it('is the current persisted payload version', () => {
    expect(ACTIVE_TEAM_STORE_VERSION).toBe(1);
  });
});

describe('migratePersistedActiveTeam', () => {
  it('passes a valid payload of the current version through untouched', () => {
    expect(
      migratePersistedActiveTeam({ selectedTeamId: 'team-1' }, ACTIVE_TEAM_STORE_VERSION),
    ).toEqual({
      selectedTeamId: 'team-1',
    });
  });

  it('accepts a valid payload written by an older version', () => {
    expect(migratePersistedActiveTeam({ selectedTeamId: 'team-1' }, 0)).toEqual({
      selectedTeamId: 'team-1',
    });
  });

  it('ignores a payload written by a newer build rather than guessing at it', () => {
    expect(
      migratePersistedActiveTeam({ selectedTeamId: 'team-1' }, ACTIVE_TEAM_STORE_VERSION + 1),
    ).toEqual(NO_ACTIVE_TEAM_SELECTION);
  });

  it('degrades a corrupted payload to "no selection" instead of throwing', () => {
    expect(migratePersistedActiveTeam({ selectedTeamId: 42 }, ACTIVE_TEAM_STORE_VERSION)).toEqual(
      NO_ACTIVE_TEAM_SELECTION,
    );
    expect(migratePersistedActiveTeam(undefined, ACTIVE_TEAM_STORE_VERSION)).toEqual(
      NO_ACTIVE_TEAM_SELECTION,
    );
  });
});
