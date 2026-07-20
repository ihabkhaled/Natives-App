import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_ERROR_CODE } from '@/shared/errors';
import { AppError } from '@/shared/errors/app.errors';

import { getMember } from '../services/get-member.service';
import { useMemberProfileQuery } from './use-member-profile-query.hook';
import { buildMemberProfile } from '../../../../tests/factories/members.factory';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';

vi.mock('../services/get-member.service', () => ({ getMember: vi.fn() }));

beforeEach(() => {
  vi.mocked(getMember).mockResolvedValue(buildMemberProfile());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useMemberProfileQuery', () => {
  it('loads a profile and refetches on demand', async () => {
    const { result } = renderHookWithProviders(() => useMemberProfileQuery('t', 'm'));
    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });
    act(() => {
      result.current.refetch();
    });
    await waitFor(() => {
      expect(getMember).toHaveBeenCalledTimes(2);
    });
  });

  it('normalizes a load failure into an AppError', async () => {
    vi.mocked(getMember).mockRejectedValue(new AppError({ code: APP_ERROR_CODE.NotFound }));
    const { result } = renderHookWithProviders(() => useMemberProfileQuery('t', 'missing'));
    await waitFor(() => {
      expect(result.current.error?.code).toBe(APP_ERROR_CODE.NotFound);
    });
  });
});
