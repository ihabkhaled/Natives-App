import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { buildPracticeSessionListPage } from '../../../../tests/factories/practice.factory';
import { PRACTICE_SCOPE } from '../constants/practice.constants';
import { listPracticeSessions } from '../services/list-practice-sessions.service';
import { usePracticeSessionsQuery } from './use-practice-sessions-query.hook';

vi.mock('../services/list-practice-sessions.service', () => ({ listPracticeSessions: vi.fn() }));

const PARAMS = { scope: PRACTICE_SCOPE.upcoming, type: null, rsvp: null, pageSize: 20 } as const;

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeSessionsQuery', () => {
  it('exposes the page once it resolves', async () => {
    vi.mocked(listPracticeSessions).mockResolvedValue(buildPracticeSessionListPage());

    const { result } = renderHookWithProviders(() => usePracticeSessionsQuery(PARAMS));

    await waitFor(() => {
      expect(result.current.page?.items).toHaveLength(1);
    });
    expect(result.current.error).toBeNull();
  });

  it('surfaces a failure as an AppError', async () => {
    vi.mocked(listPracticeSessions).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.Forbidden }),
    );

    const { result } = renderHookWithProviders(() => usePracticeSessionsQuery(PARAMS));

    await waitFor(() => {
      expect(result.current.error?.code).toBe(APP_ERROR_CODE.Forbidden);
    });
  });

  it('refetches on demand', async () => {
    vi.mocked(listPracticeSessions).mockResolvedValue(buildPracticeSessionListPage());

    const { result } = renderHookWithProviders(() => usePracticeSessionsQuery(PARAMS));
    await waitFor(() => {
      expect(result.current.page).toBeDefined();
    });

    result.current.refetch();

    await waitFor(() => {
      expect(listPracticeSessions).toHaveBeenCalledTimes(2);
    });
  });
});
