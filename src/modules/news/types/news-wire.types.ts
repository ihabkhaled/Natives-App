import type { NEWS_STATUS } from '../news.constants';

/**
 * The newsroom wire contract as specified for backend release 1.8.0, pinned
 * here ahead of the generated types so the seam in `services/` is typed
 * against the real payloads rather than `unknown`.
 *
 * TODO(news-endpoints, contract 1.8.0): once `contracts/openapi.json` carries
 * the newsroom schemas, delete this file and re-derive these shapes from
 * `@/packages/api-contract`; the domain types in `news.types.ts` and every
 * consumer above the mapper stay unchanged.
 */
type NewsStatusDto = (typeof NEWS_STATUS)[keyof typeof NEWS_STATUS];

export interface NewsItemDto {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  /** Markdown source. Never rendered as HTML — see `parsers/`. */
  readonly body: string;
  readonly coverImageUrl: string | null;
  readonly publishedAt: string | null;
  readonly author: string;
  readonly status: NewsStatusDto;
  readonly competitionId?: string | null;
  readonly matchId?: string | null;
}

/** Bounded, paginated public read envelope. */
export interface NewsListResponseDto {
  readonly items: readonly NewsItemDto[];
  readonly total: number;
}
