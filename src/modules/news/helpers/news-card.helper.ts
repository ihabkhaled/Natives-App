import { I18N_KEYS } from '@/shared/i18n';

import { NEWS_EXCERPT_MAX_LENGTH } from '../news.constants';
import { spansToPlainText } from '../parsers/news-inline.parser';
import { NEWS_BLOCK_KIND } from '../parsers/news-markdown.constants';
import { parseNewsMarkdown } from '../parsers/news-markdown.parser';
import type { NewsCardView } from '../types/news-view.types';
import type { NewsArticle } from '../types/news.types';

type Translate = (key: string, params?: Record<string, string>) => string;

const ELLIPSIS = '…';

/**
 * A card teaser, taken from the story's first PROSE block with its Markdown
 * markers stripped. Derived from the same parse the article page renders, so
 * a teaser can never open with `##` or quote a line out of a code fence.
 */
export function buildNewsExcerpt(body: string, maxLength: number): string {
  const paragraph = parseNewsMarkdown(body).find(
    (block) => block.kind === NEWS_BLOCK_KIND.Paragraph,
  );
  const text = (paragraph?.lines ?? []).map((line) => spansToPlainText(line.spans)).join(' ');
  return text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}${ELLIPSIS}`;
}

/** The branded fallback glyph a card shows when a story has no cover image. */
export function toNewsInitial(title: string): string {
  return (title.trim()[0] ?? '?').toUpperCase();
}

/** One story as its prepared, translated card view model. */
export function buildNewsCard(
  t: Translate,
  formatDay: (isoDate: string) => string,
  article: NewsArticle,
): NewsCardView {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: buildNewsExcerpt(article.body, NEWS_EXCERPT_MAX_LENGTH),
    dateLabel:
      article.publishedAt === null
        ? t(I18N_KEYS.news.statusDraft)
        : t(I18N_KEYS.news.publishedOn, { date: formatDay(article.publishedAt) }),
    bylineLabel: t(I18N_KEYS.news.byline, { author: article.author }),
    coverImageUrl: article.coverImageUrl,
    coverAlt: t(I18N_KEYS.news.coverAlt, { title: article.title }),
    initial: toNewsInitial(article.title),
  };
}
