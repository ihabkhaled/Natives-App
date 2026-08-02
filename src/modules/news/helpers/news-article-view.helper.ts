import { I18N_KEYS } from '@/shared/i18n';

import { NEWS_EXCERPT_MAX_LENGTH } from '../news.constants';
import type { NewsArticle } from '../types/news.types';
import { buildNewsExcerpt } from './news-card.helper';

type Translate = (key: string, params?: Record<string, string>) => string;

/** Everything the story screen shows about the story itself. */
export interface NewsArticleFacts {
  readonly heading: string;
  readonly bylineLabel: string;
  readonly dateLabel: string;
  readonly author: string;
  readonly coverImageUrl: string | null;
  readonly coverAlt: string;
  readonly excerpt: string;
  readonly publishedAt: string | null;
  readonly linkLabels: readonly string[];
}

/** The chips naming the domain records a story is attached to. */
function buildLinkLabels(t: Translate, article: NewsArticle): readonly string[] {
  const competition = article.competitionId === null ? [] : [t(I18N_KEYS.news.linkedCompetition)];
  const match = article.matchId === null ? [] : [t(I18N_KEYS.news.linkedMatch)];
  return [...competition, ...match];
}

/**
 * The facts a story screen renders while the read has not resolved. Kept
 * explicit so the screen never has to spell `?? ''` at a dozen call sites.
 */
function missingArticleFacts(t: Translate): NewsArticleFacts {
  return {
    heading: t(I18N_KEYS.news.articleTitle),
    bylineLabel: '',
    dateLabel: '',
    author: '',
    coverImageUrl: null,
    coverAlt: '',
    excerpt: '',
    publishedAt: null,
    linkLabels: [],
  };
}

/** One story (or its absence) as the prepared, translated screen facts. */
export function buildNewsArticleFacts(
  t: Translate,
  formatDay: (isoDate: string) => string,
  article: NewsArticle | null,
): NewsArticleFacts {
  if (article === null) {
    return missingArticleFacts(t);
  }
  return {
    heading: article.title,
    bylineLabel: t(I18N_KEYS.news.byline, { author: article.author }),
    dateLabel:
      article.publishedAt === null
        ? ''
        : t(I18N_KEYS.news.publishedOn, { date: formatDay(article.publishedAt) }),
    author: article.author,
    coverImageUrl: article.coverImageUrl,
    coverAlt: t(I18N_KEYS.news.coverAlt, { title: article.title }),
    excerpt: buildNewsExcerpt(article.body, NEWS_EXCERPT_MAX_LENGTH),
    publishedAt: article.publishedAt,
    linkLabels: buildLinkLabels(t, article),
  };
}
