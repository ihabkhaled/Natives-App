import { waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_TEAM_DIRECTORY } from '@/tests/msw/team-directory.fixture';

import { requestPublicTeamDirectory } from '../gateways/team-directory.gateway';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { TEAM_DIRECTORY_SLUG } from '../team-directory.constants';
import { useTeamDirectoryQuery } from './use-team-directory-query.hook';

function renderQuery(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useTeamDirectoryQuery>>
> {
  return renderHookWithProviders(() => useTeamDirectoryQuery(TEAM_DIRECTORY_SLUG), {
    initialPath: '/team',
  });
}

vi.mock('../gateways/team-directory.gateway', () => ({
  requestPublicTeamDirectory: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(requestPublicTeamDirectory).mockResolvedValue(MOCK_TEAM_DIRECTORY);
});

describe('useTeamDirectoryQuery', () => {
  it('starts in the loading state so the screen can render its skeleton', () => {
    const { result } = renderQuery();

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('resolves the mapped directory and reports no error', async () => {
    const { result } = renderQuery();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.data?.team.slug).toBe(TEAM_DIRECTORY_SLUG);
    expect(result.current.data?.staff).toHaveLength(5);
  });

  it('exposes a refetch the error state can retry with', async () => {
    const { result } = renderQuery();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data?.players).toHaveLength(4);
    });
  });
});
