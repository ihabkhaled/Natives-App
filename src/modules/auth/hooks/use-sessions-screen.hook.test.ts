import { act } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import {
  useSessionRevocationMutation,
  type SessionRevocationView,
} from '../mutations/use-session-revocation-mutation.hook';
import { useSessionsQuery, type SessionsQueryView } from './use-sessions-query.hook';
import { useSessionsScreen } from './use-sessions-screen.hook';

vi.mock('./use-sessions-query.hook', () => ({ useSessionsQuery: vi.fn() }));
vi.mock('../mutations/use-session-revocation-mutation.hook', () => ({
  useSessionRevocationMutation: vi.fn(),
}));

const SESSIONS = [
  {
    id: 'current',
    device: 'Chrome on macOS',
    approxLocation: 'Cairo, EG',
    lastActiveAtIso: '2026-07-18T09:30:00.000Z',
    isCurrent: true,
  },
  {
    id: 'other',
    device: '',
    approxLocation: 'Alexandria, EG',
    lastActiveAtIso: '2026-07-17T18:05:00.000Z',
    isCurrent: false,
  },
];

function mockQuery(overrides: Partial<SessionsQueryView> = {}): SessionsQueryView {
  const view: SessionsQueryView = {
    sessions: SESSIONS,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
  vi.mocked(useSessionsQuery).mockReturnValue(view);
  return view;
}

let revocationOptions: { onSuccess: () => void; onError: () => void } | undefined;

function mockRevocation(overrides: Partial<SessionRevocationView> = {}): SessionRevocationView {
  const view: SessionRevocationView = {
    revokeOne: vi.fn(),
    revokeOthers: vi.fn(),
    isRevoking: false,
    ...overrides,
  };
  revocationOptions = undefined;
  vi.mocked(useSessionRevocationMutation).mockImplementation((options) => {
    revocationOptions = options;
    return view;
  });
  return view;
}

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSessionsScreen', () => {
  it('maps sessions into translated rows with a fallback device name', () => {
    mockQuery();
    mockRevocation();

    const { result } = renderHookWithProviders(() => useSessionsScreen());

    expect(result.current.labels.title).toBe('Active sessions');
    expect(result.current.rows[0]?.device).toBe('Chrome on macOS');
    expect(result.current.rows[1]?.device).toBe('Unknown device');
    expect(result.current.rows[0]?.lastActiveText).not.toBe('');
    expect(result.current.hasOtherSessions).toBe(true);
  });

  it('reports no other sessions when only the current device is present', () => {
    mockQuery({ sessions: [SESSIONS[0]!] });
    mockRevocation();

    const { result } = renderHookWithProviders(() => useSessionsScreen());

    expect(result.current.hasOtherSessions).toBe(false);
  });

  it('translates a load failure and mirrors loading', () => {
    mockQuery({
      sessions: [],
      isLoading: true,
      error: new AppError({ code: APP_ERROR_CODE.Server }),
    });
    mockRevocation();

    const { result } = renderHookWithProviders(() => useSessionsScreen());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.errorMessage).toBe('Something went wrong on our side. Please try again.');
  });

  it('wires the revoke actions to the revocation mutation', () => {
    mockQuery();
    const revocation = mockRevocation();

    const { result } = renderHookWithProviders(() => useSessionsScreen());
    act(() => {
      result.current.onRevoke('other');
    });
    act(() => {
      result.current.onRevokeOthers();
    });

    expect(revocation.revokeOne).toHaveBeenCalledExactlyOnceWith('other');
    expect(revocation.revokeOthers).toHaveBeenCalledTimes(1);
  });

  it('confirms and reports revoke outcomes through toasts', () => {
    mockQuery();
    mockRevocation();

    renderHookWithProviders(() => useSessionsScreen());

    expect(() => {
      act(() => {
        revocationOptions?.onSuccess();
      });
      act(() => {
        revocationOptions?.onError();
      });
    }).not.toThrow();
  });
});
