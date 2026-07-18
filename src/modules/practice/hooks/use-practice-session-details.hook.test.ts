import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useEffectivePermissions } from '@/modules/auth';
import { openExternalUrl } from '@/platform';
import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';
import { PERMISSIONS } from '@/shared/security';
import { useAppToast } from '@/shared/ui';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { buildPracticeSessionDetail } from '../../../../tests/factories/practice.factory';
import { RSVP_REASON, RSVP_STATUS } from '../constants/practice.constants';
import { useRsvpMutation } from '../mutations/use-rsvp-mutation.hook';
import { usePracticeSessionDetails } from './use-practice-session-details.hook';
import { usePracticeSessionQuery } from './use-practice-session-query.hook';
import { usePracticeTeamContext } from './use-practice-team-context.hook';

const submit = vi.fn();
const showToast = vi.fn();

vi.mock('./use-practice-session-query.hook', () => ({ usePracticeSessionQuery: vi.fn() }));
vi.mock('./use-practice-team-context.hook', () => ({ usePracticeTeamContext: vi.fn() }));
vi.mock('../mutations/use-rsvp-mutation.hook', () => ({ useRsvpMutation: vi.fn() }));
vi.mock('@/modules/auth', () => ({ useEffectivePermissions: vi.fn() }));
vi.mock('@/platform', () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: true })),
  openExternalUrl: vi.fn(() => Promise.resolve()),
}));
vi.mock('@/shared/ui', () => ({ useAppToast: vi.fn(() => ({ showToast })) }));

function mutationCallbacks() {
  return vi.mocked(useRsvpMutation).mock.calls[0]?.[2];
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(usePracticeTeamContext).mockReturnValue({
    teamId: 'team-1',
    isLoading: false,
    isError: false,
  });
  vi.mocked(usePracticeSessionQuery).mockReturnValue({
    session: buildPracticeSessionDetail({
      rsvp: { ...buildPracticeSessionDetail().rsvp, version: 5 },
    }),
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  });
  vi.mocked(useRsvpMutation).mockReturnValue({
    submit,
    isSubmitting: false,
    error: null,
    isConflict: false,
    reset: vi.fn(),
  });
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: [PERMISSIONS.practicesRead, PERMISSIONS.practicesRsvpSelf],
    accountActive: true,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
  });
  vi.mocked(useAppToast).mockReturnValue({ showToast });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeSessionDetails', () => {
  it('builds a ready view enabling the RSVP control', () => {
    const { result } = renderHook(() => usePracticeSessionDetails('sess-1'));

    expect(usePracticeSessionQuery).toHaveBeenCalledWith('team-1', 'sess-1');
    expect(useRsvpMutation).toHaveBeenCalledWith('team-1', 'sess-1', expect.any(Object));
    expect(result.current.status).toBe('ready');
    expect(result.current.detail?.rsvp.canRespond).toBe(true);
  });

  it('submits the selected reason with the seen version', () => {
    const { result } = renderHook(() => usePracticeSessionDetails('sess-1'));

    act(() => {
      result.current.onSelectReason(RSVP_REASON.injury);
    });
    act(() => {
      result.current.onSubmitRsvp(RSVP_STATUS.notGoing);
    });

    expect(submit).toHaveBeenCalledWith({
      status: RSVP_STATUS.notGoing,
      reasonCategory: RSVP_REASON.injury,
      version: 5,
    });
  });

  it('opens the venue map through the external navigation owner', () => {
    const { result } = renderHook(() => usePracticeSessionDetails('sess-1'));

    act(() => {
      result.current.onOpenMap('https://maps.example.com/?q=x');
    });

    expect(openExternalUrl).toHaveBeenCalledWith('https://maps.example.com/?q=x');
  });

  it('swallows a blocked map url without throwing', async () => {
    vi.mocked(openExternalUrl).mockRejectedValueOnce(new Error('blocked'));
    const { result } = renderHook(() => usePracticeSessionDetails('sess-1'));

    await act(async () => {
      result.current.onOpenMap('https://blocked.example');
      await Promise.resolve();
    });

    expect(openExternalUrl).toHaveBeenCalledWith('https://blocked.example');
  });

  it('toasts a distinct message for conflict versus generic errors', () => {
    renderHook(() => usePracticeSessionDetails('sess-1'));
    const callbacks = mutationCallbacks();

    callbacks?.onError(new AppError({ code: APP_ERROR_CODE.Conflict }));
    const conflictToast = showToast.mock.calls[0]?.[0] as { message: string };
    expect(conflictToast.message).toContain('refreshed');

    callbacks?.onError(new AppError({ code: APP_ERROR_CODE.Server }));
    const errorToast = showToast.mock.calls[1]?.[0] as { message: string };
    expect(errorToast.message).toContain('could not');

    callbacks?.onSuccess();
    const successToast = showToast.mock.calls[2]?.[0] as { tone: string };
    expect(successToast.tone).toBe('success');
  });

  it('omits the expected version when the detail has not loaded', () => {
    vi.mocked(usePracticeSessionQuery).mockReturnValue({
      session: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => usePracticeSessionDetails('sess-1'));
    act(() => {
      result.current.onSubmitRsvp(RSVP_STATUS.going);
    });

    expect(submit).toHaveBeenCalledWith({
      status: RSVP_STATUS.going,
      reasonCategory: null,
      version: null,
    });
  });
});
