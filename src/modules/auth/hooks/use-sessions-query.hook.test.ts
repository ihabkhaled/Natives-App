import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { listSessions } from '../services/list-sessions.service';
import { useSessionsQuery } from './use-sessions-query.hook';

vi.mock('../services/list-sessions.service', () => ({ listSessions: vi.fn() }));

const SESSION = {
  id: 'session-1',
  device: 'Chrome on macOS',
  approxLocation: 'Cairo, EG',
  lastActiveAtIso: '2026-07-18T09:30:00.000Z',
  isCurrent: true,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('useSessionsQuery', () => {
  it('returns the loaded sessions once the request resolves', async () => {
    vi.mocked(listSessions).mockResolvedValue([SESSION]);

    const { result } = renderHookWithProviders(() => useSessionsQuery());

    await waitFor(() => {
      expect(result.current.sessions).toEqual([SESSION]);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('exposes an empty list and an AppError when the request fails', async () => {
    vi.mocked(listSessions).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.Unauthorized }));

    const { result } = renderHookWithProviders(() => useSessionsQuery());

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.error?.code).toBe(APP_ERROR_CODE.Unauthorized);
    expect(result.current.sessions).toEqual([]);
  });

  it('refetches on demand', async () => {
    vi.mocked(listSessions).mockResolvedValue([SESSION]);

    const { result } = renderHookWithProviders(() => useSessionsQuery());
    await waitFor(() => {
      expect(result.current.sessions).toHaveLength(1);
    });

    result.current.refetch();

    await waitFor(() => {
      expect(listSessions).toHaveBeenCalledTimes(2);
    });
  });
});
