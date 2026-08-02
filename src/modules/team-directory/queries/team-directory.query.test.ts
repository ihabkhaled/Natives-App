import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_TEAM_DIRECTORY } from '@/tests/msw/team-directory.fixture';

import { requestPublicTeamDirectory } from '../gateways/team-directory.gateway';

import { TEAM_DIRECTORY_SLUG } from '../team-directory.constants';
import { teamDirectoryQueryKeys } from './team-directory.keys';
import { buildTeamDirectoryQueryOptions } from './team-directory.query';

vi.mock('../gateways/team-directory.gateway', () => ({
  requestPublicTeamDirectory: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(requestPublicTeamDirectory).mockResolvedValue(MOCK_TEAM_DIRECTORY);
});

describe('buildTeamDirectoryQueryOptions', () => {
  it('keys the read by team slug through the module key builder', () => {
    expect(buildTeamDirectoryQueryOptions(TEAM_DIRECTORY_SLUG).queryKey).toEqual(
      teamDirectoryQueryKeys.bySlug(TEAM_DIRECTORY_SLUG),
    );
  });

  it('resolves the directory through the seam use case', async () => {
    const options = buildTeamDirectoryQueryOptions(TEAM_DIRECTORY_SLUG);

    await expect(options.queryFn()).resolves.toMatchObject({
      team: { slug: TEAM_DIRECTORY_SLUG },
    });
  });
});
