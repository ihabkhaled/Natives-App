import { NEWS_STATUS } from '../news.constants';
import type { NewsItemDto, NewsListResponseDto } from '../types/news-wire.types';
import type { NewsArticle, NewsPage } from '../types/news.types';

/**
 * Wire → domain. Optional wire fields (`competitionId`, `matchId`) collapse to
 * an explicit `null` so no screen has to distinguish "absent" from "empty",
 * and an unknown `status` degrades to `draft` — the safe reading, because a
 * story the client cannot classify must never be presented as published.
 */
export function mapNewsArticle(dto: NewsItemDto): NewsArticle {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    body: dto.body,
    coverImageUrl: dto.coverImageUrl,
    publishedAt: dto.publishedAt,
    author: dto.author,
    status: dto.status === NEWS_STATUS.Published ? NEWS_STATUS.Published : NEWS_STATUS.Draft,
    competitionId: dto.competitionId ?? null,
    matchId: dto.matchId ?? null,
  };
}

export function mapNewsPage(dto: NewsListResponseDto): NewsPage {
  return { items: dto.items.map(mapNewsArticle), total: dto.total };
}
