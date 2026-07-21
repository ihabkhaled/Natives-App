import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as QueryModule from '@/packages/query';
import { buildQueuedOperation } from '@/tests/msw/matches-domain.fixture';

import { replayScorekeeperQueue } from '../services/replay-scorekeeper-queue.service';
import { useScorekeeperQueueStore } from '../store/scorekeeper-queue.store';
import { useScorekeeperQueue } from './use-scorekeeper-queue.hook';

const { invalidateQueries } = vi.hoisted(() => ({ invalidateQueries: vi.fn() }));

vi.mock('../services/replay-scorekeeper-queue.service', () => ({
  replayScorekeeperQueue: vi.fn(),
}));
vi.mock('@/packages/query', async (importOriginal) => ({
  ...(await importOriginal<typeof QueryModule>()),
  useQueryClient: () => ({ invalidateQueries }),
}));

const OWNER = 'user-1';

function enqueue(...overrides: Parameters<typeof buildQueuedOperation>[0][]): void {
  for (const item of overrides) {
    useScorekeeperQueueStore.getState().enqueue(buildQueuedOperation(item));
  }
}

function renderQueue(isOnline = true) {
  return renderHook(() => useScorekeeperQueue(OWNER, 'team-natives', 'match-1', isOnline));
}

beforeEach(() => {
  vi.clearAllMocks();
  useScorekeeperQueueStore.getState().clear();
  vi.mocked(replayScorekeeperQueue).mockResolvedValue({
    appliedOperationIds: [],
    replayedOperationIds: [],
    conflictOperationIds: [],
    failedOperationIds: [],
  });
});

describe('useScorekeeperQueue', () => {
  it('replays the owned queue on reconnect and refreshes the authoritative record', async () => {
    enqueue({ operationId: 'op-a-000001' });

    renderQueue();

    await waitFor(() => {
      expect(replayScorekeeperQueue).toHaveBeenCalledOnce();
    });
    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalled();
    });
  });

  it('never replays while offline', async () => {
    enqueue({ operationId: 'op-a-000001' });

    renderQueue(false);

    await Promise.resolve();
    expect(replayScorekeeperQueue).not.toHaveBeenCalled();
  });

  it('never replays another account queue', async () => {
    enqueue({ operationId: 'op-a-000001', ownerUserId: 'user-2' });

    const { result } = renderQueue();

    await Promise.resolve();
    expect(replayScorekeeperQueue).not.toHaveBeenCalled();
    expect(result.current.operations).toStrictEqual([]);
    expect(result.current.hasForeignQueue).toBe(true);
  });

  it('exposes conflicts separately from pending work', () => {
    enqueue(
      { operationId: 'op-a-000001', state: 'conflict' },
      { operationId: 'op-b-000001', state: 'failed' },
    );

    const { result } = renderQueue();

    expect(result.current.conflicts).toHaveLength(1);
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.hasFailed).toBe(true);
  });

  it('returns only the failed operations to pending on a manual retry', () => {
    enqueue(
      { operationId: 'op-a-000001', state: 'failed' },
      { operationId: 'op-b-000001', state: 'conflict' },
    );
    const { result } = renderQueue();

    act(() => {
      result.current.retryFailed();
    });

    const states = useScorekeeperQueueStore.getState().operations.map((item) => item.state);
    // The conflict is untouched: it needs a decision, not another attempt.
    expect(states).toStrictEqual(['pending', 'conflict']);
  });

  it('discards only the conflicting operation the coach chose, then refreshes', () => {
    enqueue(
      { operationId: 'op-a-000001', state: 'conflict' },
      { operationId: 'op-b-000001', state: 'conflict' },
    );
    const { result } = renderQueue();

    act(() => {
      result.current.discardConflict('op-a-000001');
    });

    expect(
      useScorekeeperQueueStore.getState().operations.map((item) => item.operationId),
    ).toStrictEqual(['op-b-000001']);
    expect(invalidateQueries).toHaveBeenCalled();
  });

  it('reloads the authoritative record on request', () => {
    const { result } = renderQueue();

    act(() => {
      result.current.reloadAuthoritative();
    });

    expect(invalidateQueries).toHaveBeenCalled();
  });
});
