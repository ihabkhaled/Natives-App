import { describe, expect, it } from 'vitest';

import { buildNewsItemDto } from '../../../../tests/factories/news.factory';
import { mapNewsArticle, mapNewsPage } from './news.mapper';

describe('mapNewsArticle', () => {
  it('carries every wire field into the domain shape', () => {
    const article = mapNewsArticle(
      buildNewsItemDto({ coverImageUrl: 'https://cdn.test/a.jpg', competitionId: 'c1' }),
    );

    expect(article).toEqual({
      id: 'news-1',
      slug: 'first-league-win',
      title: 'First league win',
      body: 'The Natives took the opener.',
      coverImageUrl: 'https://cdn.test/a.jpg',
      publishedAt: '2026-05-02T18:00:00.000Z',
      author: 'Dalia Elgharib',
      status: 'published',
      competitionId: 'c1',
      matchId: null,
    });
  });

  it('collapses an explicitly null optional link to null', () => {
    const article = mapNewsArticle(buildNewsItemDto({ competitionId: null }));

    expect(article.competitionId).toBeNull();
  });

  it('collapses an OMITTED optional link to null rather than leaving it undefined', () => {
    // The 1.8.0 spec marks both links optional, so the wire may simply not
    // carry them; no screen should have to tell "absent" from "empty".
    const { competitionId, matchId, ...withoutLinks } = {
      ...buildNewsItemDto(),
      competitionId: 'c1',
      matchId: 'm1',
    };
    void competitionId;
    void matchId;
    const article = mapNewsArticle(withoutLinks);

    expect(article.competitionId).toBeNull();
    expect(article.matchId).toBeNull();
  });

  it('reads an unpublished story as a draft', () => {
    expect(mapNewsArticle(buildNewsItemDto({ status: 'draft' })).status).toBe('draft');
  });

  it('degrades an unrecognized status to draft rather than to published', () => {
    // A story the client cannot classify must never be presented as public.
    const dto = { ...buildNewsItemDto(), status: 'archived' as unknown as 'draft' };

    expect(mapNewsArticle(dto).status).toBe('draft');
  });
});

describe('mapNewsPage', () => {
  it('maps every item and keeps the reported total', () => {
    const page = mapNewsPage({
      items: [buildNewsItemDto(), buildNewsItemDto({ id: 'n2' })],
      total: 9,
    });

    expect(page.items.map((item) => item.id)).toEqual(['news-1', 'n2']);
    expect(page.total).toBe(9);
  });

  it('maps an empty envelope without inventing items', () => {
    expect(mapNewsPage({ items: [], total: 0 })).toEqual({ items: [], total: 0 });
  });
});
