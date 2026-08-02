import { describe, expect, it } from 'vitest';

import { buildNewsArticle } from '../../../../tests/factories/news.factory';
import { buildNewsCard, buildNewsExcerpt, toNewsInitial } from './news-card.helper';

const translate = (key: string, params?: Record<string, string>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join('|')}`;

const formatDay = (isoDate: string): string => `day(${isoDate})`;

describe('buildNewsExcerpt', () => {
  it('skips headings, bullets, quotes and fences to reach the first prose line', () => {
    expect(
      buildNewsExcerpt('## Head\n> quoted\n- item\n```\ncode\n```\nThe real teaser.', 80),
    ).toBe('The real teaser.');
  });

  it('strips inline marks from the teaser', () => {
    expect(buildNewsExcerpt('A **big** win with `flair`.', 80)).toBe('A big win with flair.');
  });

  it('ellipsizes at the bound instead of overflowing the card', () => {
    const excerpt = buildNewsExcerpt('word '.repeat(80), 20);

    expect(excerpt.endsWith('…')).toBe(true);
    expect(excerpt.length).toBeLessThanOrEqual(21);
  });

  it('returns nothing for a body with no prose at all', () => {
    expect(buildNewsExcerpt('## Only a heading', 80)).toBe('');
    expect(buildNewsExcerpt('', 80)).toBe('');
  });
});

describe('toNewsInitial', () => {
  it('takes the first letter, upper-cased', () => {
    expect(toNewsInitial('  first win')).toBe('F');
  });

  it('falls back to a placeholder for a blank headline', () => {
    expect(toNewsInitial('   ')).toBe('?');
  });
});

describe('buildNewsCard', () => {
  it('prepares a published story as a fully translated card', () => {
    const card = buildNewsCard(translate, formatDay, buildNewsArticle());

    expect(card.slug).toBe('first-league-win');
    expect(card.excerpt).toBe('The Natives took the opener 15-12.');
    expect(card.dateLabel).toBe('news.publishedOn:day(2026-05-02T18:00:00.000Z)');
    expect(card.bylineLabel).toBe('news.byline:Dalia Elgharib');
    expect(card.initial).toBe('F');
  });

  it('labels an unpublished story as a draft instead of dating it', () => {
    const card = buildNewsCard(translate, formatDay, buildNewsArticle({ publishedAt: null }));

    expect(card.dateLabel).toBe('news.statusDraft');
  });

  it('passes a missing cover through as null so the view can brand the fallback', () => {
    expect(
      buildNewsCard(translate, formatDay, buildNewsArticle({ coverImageUrl: null })).coverImageUrl,
    ).toBeNull();
  });
});
