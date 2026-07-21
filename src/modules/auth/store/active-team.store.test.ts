import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@/shared/config';

import { useActiveTeamStore } from './active-team.store';

/** Capacitor Preferences prefixes every web key with its storage group. */
const PERSISTED_KEY = `CapacitorStorage.${STORAGE_KEYS.activeTeam}`;

/** Let the async Preferences adapter finish its write. */
function flushStorageWork(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function seedPersisted(state: Record<string, unknown>, version = 1): void {
  localStorage.setItem(PERSISTED_KEY, JSON.stringify({ state, version }));
}

async function importFreshStore(): Promise<typeof useActiveTeamStore> {
  vi.resetModules();
  const module = await import('./active-team.store');
  return module.useActiveTeamStore;
}

beforeEach(async () => {
  useActiveTeamStore.getState().clearSelection();
  await flushStorageWork();
  localStorage.clear();
});

afterEach(() => {
  vi.resetModules();
});

describe('useActiveTeamStore', () => {
  it('starts with no explicit choice so the default scope applies', () => {
    expect(useActiveTeamStore.getState().selectedTeamId).toBeNull();
  });

  it('records the team the principal switched to', () => {
    useActiveTeamStore.getState().selectTeam('team-2');

    expect(useActiveTeamStore.getState().selectedTeamId).toBe('team-2');
  });

  it('clears back to "no choice" on demand', () => {
    useActiveTeamStore.getState().selectTeam('team-2');
    useActiveTeamStore.getState().clearSelection();

    expect(useActiveTeamStore.getState().selectedTeamId).toBeNull();
  });

  it('holds the selected id only: never memberships, roles, or team names', () => {
    useActiveTeamStore.getState().selectTeam('team-2');

    expect(Object.keys(useActiveTeamStore.getState()).sort()).toEqual([
      'clearSelection',
      'selectTeam',
      'selectedTeamId',
    ]);
  });

  it('persists the choice, and nothing else, through the platform adapter', async () => {
    useActiveTeamStore.getState().selectTeam('team-2');
    await flushStorageWork();

    const raw = localStorage.getItem(PERSISTED_KEY);
    expect(raw).not.toBeNull();
    const envelope = JSON.parse(raw!) as { state: Record<string, unknown>; version: number };
    expect(envelope.state).toEqual({ selectedTeamId: 'team-2' });
    expect(envelope.version).toBe(1);
  });

  it('restores a previously chosen team on the next boot', async () => {
    seedPersisted({ selectedTeamId: 'team-3' });

    const store = await importFreshStore();
    await flushStorageWork();

    expect(store.getState().selectedTeamId).toBe('team-3');
  });

  it('ignores a payload written by a newer build rather than guessing at it', async () => {
    seedPersisted({ selectedTeamId: 'team-3' }, 99);

    const store = await importFreshStore();
    await flushStorageWork();

    expect(store.getState().selectedTeamId).toBeNull();
  });

  it('degrades a corrupted payload to "no selection" instead of crashing startup', async () => {
    seedPersisted({ selectedTeamId: 42 });

    const store = await importFreshStore();
    await flushStorageWork();

    expect(store.getState().selectedTeamId).toBeNull();
  });
});
