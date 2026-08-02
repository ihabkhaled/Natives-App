import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
    expect(result.current.data?.staff).toHaveLength(9);
  });

  it('exposes a refetch the error state can retry with', async () => {
    const { result } = renderQuery();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data?.players).toHaveLength(9);
    });
  });
});
