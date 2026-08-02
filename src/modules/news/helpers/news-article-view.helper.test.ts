import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildNewsArticle } from '../../../../tests/factories/news.factory';
import { buildNewsArticleFacts } from './news-article-view.helper';

const translate = (key: string, params?: Record<string, string>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join('|')}`;

const formatDay = (isoDate: string): string => `day(${isoDate})`;

describe('buildNewsArticleFacts', () => {
  it('prepares a published story for the screen', () => {
    const facts = buildNewsArticleFacts(translate, formatDay, buildNewsArticle());

    expect(facts.heading).toBe('First league win');
    expect(facts.bylineLabel).toBe('news.byline:Dalia Elgharib');
    expect(facts.dateLabel).toBe('news.publishedOn:day(2026-05-02T18:00:00.000Z)');
    expect(facts.coverAlt).toBe('news.coverAlt:First league win');
    expect(facts.excerpt).toBe('The Natives took the opener 15-12.');
    expect(facts.publishedAt).toBe('2026-05-02T18:00:00.000Z');
  });

  it('leaves the date empty rather than dating an unpublished story', () => {
    const facts = buildNewsArticleFacts(
      translate,
      formatDay,
      buildNewsArticle({ publishedAt: null }),
    );

    expect(facts.dateLabel).toBe('');
    expect(facts.publishedAt).toBeNull();
  });

  it('names each domain record the story is attached to', () => {
    expect(
      buildNewsArticleFacts(
        translate,
        formatDay,
        buildNewsArticle({ competitionId: 'c1', matchId: 'm1' }),
      ).linkLabels,
    ).toEqual([I18N_KEYS.news.linkedCompetition, I18N_KEYS.news.linkedMatch]);
  });

  it('names only the link that exists', () => {
    expect(
      buildNewsArticleFacts(translate, formatDay, buildNewsArticle({ matchId: 'm1' })).linkLabels,
    ).toEqual([I18N_KEYS.news.linkedMatch]);
  });

  it('falls back to neutral facts before the story resolves', () => {
    const facts = buildNewsArticleFacts(translate, formatDay, null);

    expect(facts.heading).toBe(I18N_KEYS.news.articleTitle);
    expect(facts.author).toBe('');
    expect(facts.coverImageUrl).toBeNull();
    expect(facts.linkLabels).toEqual([]);
    expect(facts.excerpt).toBe('');
  });
});
