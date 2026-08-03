import type * as TeamDirectoryModule from '@/modules/team-directory';
import { resetTeamDirectoryDouble } from '../../../../tests/setup/team-directory-double.helper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildPublicCompetitionQueryOptions,
  buildPublicCompetitionsQueryOptions,
} from './public-competitions.query';

// jscpd:ignore-start
// vitest hoists a vi.mock factory to the top of the file that declares it, so
// this cannot move into a shared helper — only the reset it pairs with can.
vi.mock('@/modules/team-directory', async (importOriginal) => {
  const actual = await importOriginal<typeof TeamDirectoryModule>();
  return { ...actual, requestPublicTeamDirectory: vi.fn() };
});
// jscpd:ignore-end

beforeEach(resetTeamDirectoryDouble);

describe('buildPublicCompetitionsQueryOptions', () => {
  it('reads the list through the seam service', async () => {
    const options = buildPublicCompetitionsQueryOptions();

    expect(options.queryKey).toEqual(['public-competitions', 'list']);
    await expect(options.queryFn()).resolves.toHaveLength(2);
  });
});

describe('buildPublicCompetitionQueryOptions', () => {
  it('keys the read by slug and resolves that competition', async () => {
    const options = buildPublicCompetitionQueryOptions('eunc-2026');

    expect(options.queryKey).toEqual(['public-competitions', 'detail', 'eunc-2026']);
    expect(options.enabled).toBe(true);
    await expect(options.queryFn()).resolves.toMatchObject({
      competition: { slug: 'eunc-2026' },
    });
  });

  it('stays disabled until the route has produced a slug', () => {
    expect(buildPublicCompetitionQueryOptions('').enabled).toBe(false);
  });
});
