import type { NEWS_SOURCE_STATUS, NEWS_STATUS } from '../news.constants';

/** Publication state of a story. */
export type NewsStatus = (typeof NEWS_STATUS)[keyof typeof NEWS_STATUS];

/** One story, in app-owned domain terms. */
export interface NewsArticle {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  /** Markdown source; parsed into typed blocks, never injected as HTML. */
  readonly body: string;
  readonly coverImageUrl: string | null;
  readonly publishedAt: string | null;
  readonly author: string;
  readonly status: NewsStatus;
  readonly competitionId: string | null;
  readonly matchId: string | null;
}

/** One bounded page of stories. */
export interface NewsPage {
  readonly items: readonly NewsArticle[];
  readonly total: number;
}

/** Whether a source answered with data or reported itself not connected yet. */
type NewsSourceStatus = (typeof NEWS_SOURCE_STATUS)[keyof typeof NEWS_SOURCE_STATUS];

/**
 * What every newsroom source returns: the seam status plus whatever data the
 * source had. Pre-1.8.0 that is always `unavailable` with an empty page, which
 * the screens present as an honest notice instead of a fabricated result.
 */
export interface NewsPageResult {
  readonly status: NewsSourceStatus;
  readonly page: NewsPage;
}

export interface NewsArticleResult {
  readonly status: NewsSourceStatus;
  readonly article: NewsArticle | null;
}

/** The editable fields of a story; the server owns slug, author and dates. */
export interface NewsDraftInput {
  readonly title: string;
  readonly body: string;
  readonly coverImageUrl: string;
  readonly competitionId: string;
  readonly matchId: string;
}

/** A write request: the draft plus the story it revises, if any. */
export interface NewsWriteCommand {
  readonly articleId: string | null;
  readonly draft: NewsDraftInput;
}

/** What a write reported back; `article` is null while the seam is a stub. */
export interface NewsWriteResult {
  readonly status: NewsSourceStatus;
  readonly article: NewsArticle | null;
}
