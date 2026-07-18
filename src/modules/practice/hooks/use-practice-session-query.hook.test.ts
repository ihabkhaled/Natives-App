import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { buildPracticeSessionDetail } from '../../../../tests/factories/practice.factory';
import { getPracticeSession } from '../services/get-practice-session.service';
import { usePracticeSessionQuery } from './use-practice-session-query.hook';

vi.mock('../services/get-practice-session.service', () => ({ getPracticeSession: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('usePracticeSessionQuery', () => {
  it('exposes the detail once it resolves', async () => {
    vi.mocked(getPracticeSession).mockResolvedValue(buildPracticeSessionDetail());

    const { result } = renderHookWithProviders(() => usePracticeSessionQuery('team-1', 'sess-1'));

    await waitFor(() => {
      expect(result.current.session?.id).toBe('sess-1');
    });
  });

  it('surfaces a not-found failure as an AppError', async () => {
    vi.mocked(getPracticeSession).mockRejectedValue(
      new AppError({ code: APP_ERROR_CODE.NotFound }),
    );

    const { result } = renderHookWithProviders(() => usePracticeSessionQuery('team-1', 'missing'));

    await waitFor(() => {
      expect(result.current.error?.code).toBe(APP_ERROR_CODE.NotFound);
    });
    result.current.refetch();
  });

  it('stays idle for an empty id', () => {
    const { result } = renderHookWithProviders(() => usePracticeSessionQuery('team-1', ''));

    expect(result.current.session).toBeUndefined();
    expect(getPracticeSession).not.toHaveBeenCalled();
  });
});
