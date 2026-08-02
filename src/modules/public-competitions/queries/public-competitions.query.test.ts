import { describe, expect, it } from 'vitest';

import {
  buildPublicCompetitionQueryOptions,
  buildPublicCompetitionsQueryOptions,
} from './public-competitions.query';

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
