import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { NEWS_FIELD_LIMITS } from '../news.constants';
import { newsArticleFormSchema } from './news-article-form.schema';

const valid = {
  title: 'First league win',
  body: 'The Natives took the opener 15-12 in front of a full sideline.',
  coverImageUrl: '',
  competitionId: '',
  matchId: '',
};

function firstIssue(input: Record<string, string>): string {
  const result = newsArticleFormSchema.safeParse(input);
  return result.success ? '' : (result.error.issues[0]?.message ?? '');
}

describe('newsArticleFormSchema', () => {
  it('accepts a minimal valid story with no optional links', () => {
    expect(newsArticleFormSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an https cover and both optional identifiers', () => {
    expect(
      newsArticleFormSchema.safeParse({
        ...valid,
        coverImageUrl: 'https://cdn.example.com/a.jpg',
        competitionId: 'comp-1',
        matchId: 'match-1',
      }).success,
    ).toBe(true);
  });

  it('rejects a headline below the backend minimum', () => {
    expect(firstIssue({ ...valid, title: 'ab' })).toBe(
      I18N_KEYS.newsEditor.validationTitleTooShort,
    );
  });

  it('rejects a headline above the backend maximum', () => {
    expect(firstIssue({ ...valid, title: 'a'.repeat(NEWS_FIELD_LIMITS.titleMax + 1) })).toBe(
      I18N_KEYS.newsEditor.validationTitleTooLong,
    );
  });

  it('rejects a body below and above its bounds', () => {
    expect(firstIssue({ ...valid, body: 'too short' })).toBe(
      I18N_KEYS.newsEditor.validationBodyTooShort,
    );
    expect(firstIssue({ ...valid, body: 'a'.repeat(NEWS_FIELD_LIMITS.bodyMax + 1) })).toBe(
      I18N_KEYS.newsEditor.validationBodyTooLong,
    );
  });

  it('rejects a cover image that is not https, because it becomes a public img src', () => {
    expect(firstIssue({ ...valid, coverImageUrl: 'http://cdn.example.com/a.jpg' })).toBe(
      I18N_KEYS.newsEditor.validationCoverImageInvalid,
    );
    expect(firstIssue({ ...valid, coverImageUrl: 'javascript:alert(1)' })).toBe(
      I18N_KEYS.newsEditor.validationCoverImageInvalid,
    );
  });

  it('rejects an overlong cover link', () => {
    expect(
      firstIssue({
        ...valid,
        coverImageUrl: `https://cdn.example.com/${'a'.repeat(NEWS_FIELD_LIMITS.coverImageMax)}`,
      }),
    ).toBe(I18N_KEYS.newsEditor.validationCoverImageTooLong);
  });

  it('rejects an overlong optional identifier', () => {
    expect(firstIssue({ ...valid, matchId: 'm'.repeat(NEWS_FIELD_LIMITS.linkIdMax + 1) })).toBe(
      I18N_KEYS.newsEditor.validationLinkTooLong,
    );
  });
});
