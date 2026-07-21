import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { evaluateFinalizeGuard, isMatchImmutable } from './finalize-guard.helper';

const READY = {
  status: 'completed',
  queuedCount: 0,
  scoreboardStreamVersion: 20,
  lastKnownStreamVersion: 20,
  canFinalize: true,
} as const;

describe('evaluateFinalizeGuard', () => {
  it('allows finalizing when everything is synced, current, and completed', () => {
    expect(evaluateFinalizeGuard(READY)).toStrictEqual({ allowed: true, blockedKey: null });
  });

  it('BLOCKS while anything is still queued', () => {
    expect(evaluateFinalizeGuard({ ...READY, queuedCount: 2 })).toStrictEqual({
      allowed: false,
      blockedKey: I18N_KEYS.scoreboard.finalizeBlockedQueue,
    });
  });

  it('blocks on a stale projection before it blocks on the status', () => {
    expect(
      evaluateFinalizeGuard({ ...READY, status: 'live', scoreboardStreamVersion: 19 }),
    ).toStrictEqual({
      allowed: false,
      blockedKey: I18N_KEYS.scoreboard.finalizeBlockedStale,
    });
  });

  it('blocks until the match is completed', () => {
    expect(evaluateFinalizeGuard({ ...READY, status: 'live' })).toStrictEqual({
      allowed: false,
      blockedKey: I18N_KEYS.scoreboard.finalizeBlockedStatus,
    });
  });

  it('blocks without the finalize grant', () => {
    expect(evaluateFinalizeGuard({ ...READY, canFinalize: false })).toStrictEqual({
      allowed: false,
      blockedKey: I18N_KEYS.scoreboard.permissionNotice,
    });
  });

  it('allows a scoreboard ahead of the last observed version', () => {
    expect(evaluateFinalizeGuard({ ...READY, scoreboardStreamVersion: 21 }).allowed).toBe(true);
  });
});

describe('isMatchImmutable', () => {
  it.each([
    ['finalized', true],
    ['abandoned', true],
    ['live', false],
    ['completed', false],
  ] as const)('reports %s as immutable=%s', (status, expected) => {
    expect(isMatchImmutable(status)).toBe(expected);
  });
});
