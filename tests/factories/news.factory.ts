import type { NewsArticle, NewsItemDto } from '@/modules/news';

/** The story every newsroom test starts from: published, with a cover. */
export function buildNewsArticle(overrides: Partial<NewsArticle> = {}): NewsArticle {
  return {
    id: 'news-1',
    slug: 'first-league-win',
    title: 'First league win',
    body: '## A statement win\n\nThe Natives took the opener **15-12**.',
    coverImageUrl: 'https://cdn.example.com/first-win.jpg',
    publishedAt: '2026-05-02T18:00:00.000Z',
    author: 'Dalia Elgharib',
    status: 'published',
    competitionId: null,
    matchId: null,
    ...overrides,
  };
}

/** The same story on the wire, in the shape contract 1.8.0 specifies. */
export function buildNewsItemDto(overrides: Partial<NewsItemDto> = {}): NewsItemDto {
  return {
    id: 'news-1',
    slug: 'first-league-win',
    title: 'First league win',
    body: 'The Natives took the opener.',
    coverImageUrl: null,
    publishedAt: '2026-05-02T18:00:00.000Z',
    author: 'Dalia Elgharib',
    status: 'published',
    ...overrides,
  };
}
