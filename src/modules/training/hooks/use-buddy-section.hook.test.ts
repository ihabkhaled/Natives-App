import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SharedUiModule from '@/shared/ui';
import { useAppToast } from '@/shared/ui';

import { setupToastHarness } from '../../../../tests/setup/toast-test.helper';
import { useBuddyResponseMutation } from '../mutations/use-buddy-response-mutation.hook';
import { useBuddySection } from './use-buddy-section.hook';
import { useMyBuddiesQuery } from './use-my-buddies-query.hook';

const spies = vi.hoisted(() => ({ respond: vi.fn(), showToast: vi.fn() }));

vi.mock('./use-my-buddies-query.hook', () => ({ useMyBuddiesQuery: vi.fn() }));
vi.mock('../mutations/use-buddy-response-mutation.hook', () => ({
  useBuddyResponseMutation: vi.fn(),
}));
vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: vi.fn(),
}));

setupToastHarness();

function mutationCallbacks() {
  return vi.mocked(useBuddyResponseMutation).mock.calls[0]?.[1];
}

beforeEach(() => {
  spies.showToast.mockResolvedValue(undefined);
  vi.mocked(useAppToast).mockReturnValue({ showToast: spies.showToast });
  vi.mocked(useMyBuddiesQuery).mockReturnValue({
    data: {
      items: [
        {
          id: 'buddy-1',
          submissionId: 'sub-1',
          membershipId: 'membership-1',
          status: 'pending',
          respondedAtIso: null,
          createdAtIso: '2026-07-10T09:00:00.000Z',
        },
      ],
      total: 1,
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  });
  vi.mocked(useBuddyResponseMutation).mockReturnValue({
    respond: spies.respond,
    busyBuddyId: null,
    lastIntent: null,
  });
});

describe('useBuddySection', () => {
  it('forwards confirm and decline with their intents', () => {
    const { result } = renderHook(() => useBuddySection('team-1'));

    act(() => {
      result.current.onConfirm('buddy-1');
    });
    act(() => {
      result.current.onDecline('buddy-1');
    });

    expect(spies.respond).toHaveBeenNthCalledWith(1, { buddyId: 'buddy-1', intent: 'confirm' });
    expect(spies.respond).toHaveBeenNthCalledWith(2, { buddyId: 'buddy-1', intent: 'decline' });
  });

  it('toasts the intent-specific success copy and a generic failure', () => {
    renderHook(() => useBuddySection('team-1'));
    const callbacks = mutationCallbacks();

    callbacks?.onSuccess();
    expect((spies.showToast.mock.calls[0]?.[0] as { message: string }).message).toContain(
      'confirmed',
    );

    callbacks?.onError();
    expect((spies.showToast.mock.calls[1]?.[0] as { tone: string }).tone).toBe('danger');
  });
});
