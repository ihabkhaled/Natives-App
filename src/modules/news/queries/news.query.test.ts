import { describe, expect, it } from 'vitest';

import {
  buildManagedNewsQueryOptions,
  buildNewsArticleQueryOptions,
  buildPublishedNewsQueryOptions,
} from './news.query';

describe('buildPublishedNewsQueryOptions', () => {
  it('keys the read by its page and resolves through the seam', async () => {
    const options = buildPublishedNewsQueryOptions(1);

    expect(options.queryKey).toEqual(['news', 'published', 1]);
    await expect(options.queryFn()).resolves.toMatchObject({ status: 'unavailable' });
  });
});

describe('buildNewsArticleQueryOptions', () => {
  it('reads a story once a slug is matched', async () => {
    const options = buildNewsArticleQueryOptions('first-league-win');

    expect(options.enabled).toBe(true);
    expect(options.queryKey).toEqual(['news', 'article', 'first-league-win']);
    await expect(options.queryFn()).resolves.toMatchObject({ article: null });
  });

  it('stays disabled before the route supplies a slug', () => {
    expect(buildNewsArticleQueryOptions('').enabled).toBe(false);
  });
});

describe('buildManagedNewsQueryOptions', () => {
  it('is enabled only for a session holding the grant', () => {
    expect(buildManagedNewsQueryOptions(1, true).enabled).toBe(true);
    expect(buildManagedNewsQueryOptions(1, false).enabled).toBe(false);
  });

  it('keys the authoring read apart from the public one', async () => {
    const options = buildManagedNewsQueryOptions(1, true);

    expect(options.queryKey).toEqual(['news', 'managed', 1]);
    await expect(options.queryFn()).resolves.toMatchObject({ status: 'unavailable' });
  });
});
