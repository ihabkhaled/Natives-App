import { describe, expect, it } from 'vitest';

import { newsQueryKeys } from './news.keys';

describe('newsQueryKeys', () => {
  it('roots every key under one invalidatable branch', () => {
    expect(newsQueryKeys.all).toEqual(['news']);
    expect(newsQueryKeys.published(1)[0]).toBe('news');
    expect(newsQueryKeys.article('x')[0]).toBe('news');
    expect(newsQueryKeys.managed(1)[0]).toBe('news');
  });

  it('separates the public reads from the drafts-included one', () => {
    expect(newsQueryKeys.published(1)).not.toEqual(newsQueryKeys.managed(1));
  });

  it('keys a page and a slug by their own identity', () => {
    expect(newsQueryKeys.published(2)).toEqual(['news', 'published', 2]);
    expect(newsQueryKeys.article('first-league-win')).toEqual([
      'news',
      'article',
      'first-league-win',
    ]);
    expect(newsQueryKeys.managed(3)).toEqual(['news', 'managed', 3]);
  });
});
