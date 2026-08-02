import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildNewsArticle } from '../../../../tests/factories/news.factory';
import {
  buildNewsEditorRow,
  buildNewsFormHeading,
  buildRevisionNotice,
  EMPTY_NEWS_DRAFT,
  toNewsDraftInput,
} from './news-editor.helper';

const translate = (key: string, params?: Record<string, string>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join('|')}`;

const formatDay = (isoDate: string): string => `day(${isoDate})`;

describe('buildNewsEditorRow', () => {
  it('marks a published story and drops its publish affordance', () => {
    const row = buildNewsEditorRow(translate, formatDay, buildNewsArticle());

    expect(row.isPublished).toBe(true);
    expect(row.statusLabel).toBe(I18N_KEYS.news.statusPublished);
    expect(row.statusTone).toBe('success');
    expect(row.dateLabel).toBe('news.publishedOn:day(2026-05-02T18:00:00.000Z)');
  });

  it('marks a draft and leaves it publishable, with no date to claim', () => {
    const row = buildNewsEditorRow(
      translate,
      formatDay,
      buildNewsArticle({ status: 'draft', publishedAt: null }),
    );

    expect(row.isPublished).toBe(false);
    expect(row.statusLabel).toBe(I18N_KEYS.news.statusDraft);
    expect(row.statusTone).toBe('medium');
    expect(row.dateLabel).toBe('');
  });
});

describe('toNewsDraftInput', () => {
  it('loads a story back into the editable fields', () => {
    expect(
      toNewsDraftInput(buildNewsArticle({ competitionId: 'c1', matchId: 'm1' })),
    ).toEqual({
      title: 'First league win',
      body: '## A statement win\n\nThe Natives took the opener **15-12**.',
      coverImageUrl: 'https://cdn.example.com/first-win.jpg',
      competitionId: 'c1',
      matchId: 'm1',
    });
  });

  it('turns every absent optional into an empty field, never "null"', () => {
    expect(
      toNewsDraftInput(buildNewsArticle({ coverImageUrl: null })),
    ).toMatchObject({ coverImageUrl: '', competitionId: '', matchId: '' });
  });

  it('starts a brand-new draft from empty fields', () => {
    expect(Object.values(EMPTY_NEWS_DRAFT).every((value) => value === '')).toBe(true);
  });
});

describe('buildNewsFormHeading', () => {
  it('says "new draft" when nothing is being edited', () => {
    expect(buildNewsFormHeading(translate, null)).toBe(I18N_KEYS.newsEditor.formHeadingCreate);
  });

  it('says "edit draft" for an unpublished story', () => {
    expect(buildNewsFormHeading(translate, buildNewsArticle({ status: 'draft' }))).toBe(
      I18N_KEYS.newsEditor.formHeadingEdit,
    );
  });

  it('says "new revision" for a published story, because that is what saving does', () => {
    expect(buildNewsFormHeading(translate, buildNewsArticle())).toBe(
      I18N_KEYS.newsEditor.formHeadingRevision,
    );
  });
});

describe('buildRevisionNotice', () => {
  it('warns before the author types that a published story forks a revision', () => {
    expect(buildRevisionNotice(translate, buildNewsArticle())).toBe(
      I18N_KEYS.newsEditor.revisionNotice,
    );
  });

  it('stays silent for a draft and for a brand-new story', () => {
    expect(buildRevisionNotice(translate, buildNewsArticle({ status: 'draft' }))).toBeNull();
    expect(buildRevisionNotice(translate, null)).toBeNull();
  });
});
