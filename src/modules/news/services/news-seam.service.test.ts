import { describe, expect, it, vi } from 'vitest';

import { getPublishedNewsArticle } from './get-published-news-article.service';
import { listManagedNews } from './list-managed-news.service';
import { listPublishedNews } from './list-published-news.service';
import { publishNewsArticle } from './publish-news-article.service';
import { saveNewsArticle } from './save-news-article.service';

/**
 * The 1.8.0 seam. These assertions are the contract the wire-up must keep:
 * every source reports `unavailable`, and — critically — NONE of them touches
 * the network, so a visitor never sees a 404 from a route that does not exist.
 */
describe('the newsroom TODO seam', () => {
  it('never issues a request while the endpoints are stubbed', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await Promise.all([
      listPublishedNews(1),
      getPublishedNewsArticle('first-league-win'),
      listManagedNews(1),
      saveNewsArticle({
        articleId: null,
        draft: { title: '', body: '', coverImageUrl: '', competitionId: '', matchId: '' },
      }),
      publishNewsArticle('news-1'),
    ]);

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('reports the public list as unavailable with an empty, mapped page', async () => {
    await expect(listPublishedNews(1)).resolves.toEqual({
      status: 'unavailable',
      page: { items: [], total: 0 },
    });
  });

  it('reports the drafts-included list as unavailable rather than as "nothing written"', async () => {
    await expect(listManagedNews(2)).resolves.toEqual({
      status: 'unavailable',
      page: { items: [], total: 0 },
    });
  });

  it('reports one story as unavailable rather than as not found', async () => {
    await expect(getPublishedNewsArticle('any-slug')).resolves.toEqual({
      status: 'unavailable',
      article: null,
    });
  });

  it('reports a save as unavailable, never as a success it cannot back up', async () => {
    await expect(
      saveNewsArticle({
        articleId: 'news-1',
        draft: {
          title: 'Revised headline',
          body: 'A new revision of a published story.',
          coverImageUrl: '',
          competitionId: '',
          matchId: '',
        },
      }),
    ).resolves.toEqual({ status: 'unavailable', article: null });
  });

  it('reports a publish as unavailable', async () => {
    await expect(publishNewsArticle('news-1')).resolves.toEqual({
      status: 'unavailable',
      article: null,
    });
  });
});
