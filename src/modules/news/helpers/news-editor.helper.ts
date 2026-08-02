import { I18N_KEYS } from '@/shared/i18n';

import { NEWS_STATUS } from '../news.constants';
import type { NewsEditorRowView } from '../types/news-view.types';
import type { NewsArticle, NewsDraftInput } from '../types/news.types';

type Translate = (key: string, params?: Record<string, string>) => string;

const PUBLISHED_TONE = 'success';
const DRAFT_TONE = 'medium';

export const EMPTY_NEWS_DRAFT: NewsDraftInput = {
  title: '',
  body: '',
  coverImageUrl: '',
  competitionId: '',
  matchId: '',
};

/** One newsroom row: a story with its publication state made explicit. */
export function buildNewsEditorRow(
  t: Translate,
  formatDay: (isoDate: string) => string,
  article: NewsArticle,
): NewsEditorRowView {
  const isPublished = article.status === NEWS_STATUS.Published;
  return {
    id: article.id,
    title: article.title,
    statusLabel: t(isPublished ? I18N_KEYS.news.statusPublished : I18N_KEYS.news.statusDraft),
    statusTone: isPublished ? PUBLISHED_TONE : DRAFT_TONE,
    dateLabel:
      article.publishedAt === null
        ? ''
        : t(I18N_KEYS.news.publishedOn, { date: formatDay(article.publishedAt) }),
    isPublished,
    editLabel: t(I18N_KEYS.newsEditor.edit),
    publishLabel: t(I18N_KEYS.newsEditor.publish),
  };
}

/** A story loaded back into the form; the server owns everything else. */
export function toNewsDraftInput(article: NewsArticle): NewsDraftInput {
  return {
    title: article.title,
    body: article.body,
    coverImageUrl: article.coverImageUrl ?? '',
    competitionId: article.competitionId ?? '',
    matchId: article.matchId ?? '',
  };
}

/**
 * The form heading, which is also the only place the revision rule is stated
 * as a consequence rather than a footnote: editing a PUBLISHED story does not
 * change what readers see, it opens a new revision.
 */
export function buildNewsFormHeading(t: Translate, editing: NewsArticle | null): string {
  if (editing === null) {
    return t(I18N_KEYS.newsEditor.formHeadingCreate);
  }
  return t(
    editing.status === NEWS_STATUS.Published
      ? I18N_KEYS.newsEditor.formHeadingRevision
      : I18N_KEYS.newsEditor.formHeadingEdit,
  );
}

/**
 * The standing warning shown above a published story's form. Published items
 * are immutable per domain rules, so saving forks a revision — the author is
 * told that before they type, never after they save.
 */
export function buildRevisionNotice(t: Translate, editing: NewsArticle | null): string | null {
  return editing !== null && editing.status === NEWS_STATUS.Published
    ? t(I18N_KEYS.newsEditor.revisionNotice)
    : null;
}
