import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type * as QueryPackage from '@/packages/query';
import { useAppQuery, useInvalidatingMutation } from '@/packages/query';
import type * as SharedUiModule from '@/shared/ui';

import { setupToastHarness } from '../../../../tests/setup/toast-test.helper';
import { replayDeadLetter } from '../services/replay-dead-letter.service';
import { useOperationsCentre } from './use-operations-centre.hook';
import { useAdminContext } from './use-admin-context.hook';

vi.mock('@/packages/query', async (importOriginal) => ({
  ...(await importOriginal<typeof QueryPackage>()),
  useAppQuery: vi.fn(),
  useInvalidatingMutation: vi.fn(),
}));
vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: vi.fn(),
}));
vi.mock('./use-admin-context.hook', () => ({ useAdminContext: vi.fn() }));
vi.mock('../services/replay-dead-letter.service', () => ({ replayDeadLetter: vi.fn() }));

type MutationOptions = Parameters<typeof useInvalidatingMutation>[0];

const toast = setupToastHarness();

function mockOperationsCentre(): { run: ReturnType<typeof vi.fn> } {
  vi.mocked(useAdminContext).mockReturnValue({
    teamId: 'team-1',
    membershipId: 'membership-1',
    isOffline: false,
    canReadSettings: true,
    canManageSettings: true,
    canManageRoles: true,
    canManageRules: true,
    canReadAudit: true,
    canManageOutbox: true,
    canManagePlatform: true,
    isLoading: false,
  });
  vi.mocked(useAppQuery).mockReturnValue({
    data: undefined,
    isPending: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  const run = vi.fn();
  vi.mocked(useInvalidatingMutation).mockReturnValue({ run, isRunning: false });
  return { run };
}

function capturedMutationOptions(): MutationOptions {
  const options = vi.mocked(useInvalidatingMutation).mock.calls[0]?.[0];
  if (options === undefined) {
    throw new Error('expected the replay mutation to be composed');
  }
  return options;
}

describe('useOperationsCentre', () => {
  it('issues the dead-letter and job-health reads for real (contract 1.2.0)', () => {
    mockOperationsCentre();

    renderHook(() => useOperationsCentre());

    // Query order in the hook: metrics, dead letters, job health, audit. The
    // capability-honesty markers are OFF, so every read is live for a
    // principal holding the outbox grant.
    const calls = vi.mocked(useAppQuery).mock.calls;
    expect(calls[0]?.[0]).toMatchObject({ enabled: true });
    expect(calls[1]?.[0]).toMatchObject({ enabled: true });
    expect(calls[2]?.[0]).toMatchObject({ enabled: true });
    expect(calls[3]?.[0]).toMatchObject({ enabled: true });
  });

  it('states an honest zero-state for an empty dead-letter list', () => {
    mockOperationsCentre();

    const { result } = renderHook(() => useOperationsCentre());

    expect(result.current.deadLetterEmptyLabel).toContain('No dead-lettered events');
    expect(result.current.deadLetterRows).toEqual([]);
    expect(result.current.jobRows).toEqual([]);
  });

  it('replays strictly by event id, never by payload', async () => {
    mockOperationsCentre();
    vi.mocked(replayDeadLetter).mockResolvedValue(true);
    renderHook(() => useOperationsCentre());

    await capturedMutationOptions().mutationFn('evt-dead-0001');

    expect(replayDeadLetter).toHaveBeenCalledExactlyOnceWith('evt-dead-0001');
  });

  it('confirms a queued replay with a success toast', () => {
    mockOperationsCentre();
    renderHook(() => useOperationsCentre());

    capturedMutationOptions().onSuccess();

    expect(toast.showToast).toHaveBeenCalledWith({
      message: 'Event re-queued.',
      tone: 'success',
    });
  });

  it('reports a refused replay with a danger toast', () => {
    mockOperationsCentre();
    renderHook(() => useOperationsCentre());

    capturedMutationOptions().onError(new Error('refused'));

    expect(toast.showToast).toHaveBeenCalledWith({
      message: 'Could not re-queue the event.',
      tone: 'danger',
    });
  });
});
