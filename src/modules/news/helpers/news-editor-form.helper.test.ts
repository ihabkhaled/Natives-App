import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildNewsArticle } from '../../../../tests/factories/news.factory';
import { buildNewsEditorFormView } from './news-editor-form.helper';

const translate = (key: string): string => key;

function field(name: string) {
  return { name, value: '', onChange: vi.fn(), onBlur: vi.fn(), errorMessage: undefined };
}

const fields = {
  titleField: field('title'),
  bodyField: field('body'),
  coverField: field('coverImageUrl'),
  competitionField: field('competitionId'),
  matchField: field('matchId'),
  onSubmit: vi.fn(),
};

describe('buildNewsEditorFormView', () => {
  it('labels a brand-new draft and shows no revision warning', () => {
    const view = buildNewsEditorFormView(translate, {
      fields,
      editing: null,
      isSubmitting: false,
      onCancel: vi.fn(),
    });

    expect(view.heading).toBe(I18N_KEYS.newsEditor.formHeadingCreate);
    expect(view.revisionNotice).toBeNull();
    expect(view.submitLabel).toBe(I18N_KEYS.newsEditor.save);
  });

  it('states the revision consequence when the target is published', () => {
    const view = buildNewsEditorFormView(translate, {
      fields,
      editing: buildNewsArticle(),
      isSubmitting: false,
      onCancel: vi.fn(),
    });

    expect(view.heading).toBe(I18N_KEYS.newsEditor.formHeadingRevision);
    expect(view.revisionNotice).toBe(I18N_KEYS.newsEditor.revisionNotice);
  });

  it('swaps the submit label while a write is in flight', () => {
    const view = buildNewsEditorFormView(translate, {
      fields,
      editing: null,
      isSubmitting: true,
      onCancel: vi.fn(),
    });

    expect(view.submitLabel).toBe(I18N_KEYS.newsEditor.saving);
    expect(view.isSubmitting).toBe(true);
  });

  it('passes the field bindings through untouched', () => {
    const onCancel = vi.fn();
    const view = buildNewsEditorFormView(translate, {
      fields,
      editing: null,
      isSubmitting: false,
      onCancel,
    });

    expect(view.titleField).toBe(fields.titleField);
    expect(view.matchField).toBe(fields.matchField);
    expect(view.onSubmit).toBe(fields.onSubmit);
    expect(view.onCancel).toBe(onCancel);
  });
});
