import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { NewsDraftInput } from '../types/news.types';
import { useNewsArticleForm } from './use-news-article-form.hook';

const EMPTY: NewsDraftInput = {
  title: '',
  body: '',
  coverImageUrl: '',
  competitionId: '',
  matchId: '',
};

const LOADED: NewsDraftInput = {
  title: 'First league win',
  body: 'The Natives took the opener 15-12 in front of a full sideline.',
  coverImageUrl: 'https://cdn.example.com/a.jpg',
  competitionId: 'comp-1',
  matchId: '',
};

const translate = (message: string): string => `t:${message}`;

function renderForm(values: NewsDraftInput, onValidSubmit = vi.fn()) {
  return renderHook(
    (props: { readonly values: NewsDraftInput }) =>
      useNewsArticleForm({ translate, values: props.values, onValidSubmit }),
    { initialProps: { values } },
  );
}

function submit(form: ReturnType<typeof useNewsArticleForm>): void {
  form.onSubmit({ preventDefault: () => undefined } as React.SyntheticEvent<HTMLFormElement>);
}

describe('useNewsArticleForm', () => {
  it('binds one field per editable column', () => {
    const { result } = renderForm(EMPTY);

    expect([
      result.current.titleField.name,
      result.current.bodyField.name,
      result.current.coverField.name,
      result.current.competitionField.name,
      result.current.matchField.name,
    ]).toEqual(['title', 'body', 'coverImageUrl', 'competitionId', 'matchId']);
  });

  it('loads a story into the fields', async () => {
    const { result } = renderForm(LOADED);

    await waitFor(() => {
      expect(result.current.titleField.value).toBe('First league win');
    });
    expect(result.current.competitionField.value).toBe('comp-1');
  });

  it('reloads the fields when the edited story changes', async () => {
    const { result, rerender } = renderForm(EMPTY);
    rerender({ values: LOADED });

    await waitFor(() => {
      expect(result.current.titleField.value).toBe('First league win');
    });
  });

  it('translates a schema failure key before the view ever sees it', async () => {
    const onValidSubmit = vi.fn();
    const { result } = renderForm(EMPTY, onValidSubmit);
    act(() => {
      submit(result.current);
    });

    await waitFor(() => {
      expect(result.current.titleField.errorMessage).toBe('t:newsEditor.validationTitleTooShort');
    });
    expect(onValidSubmit).not.toHaveBeenCalled();
  });

  it('hands a valid story to the caller', async () => {
    const onValidSubmit = vi.fn();
    const { result } = renderForm(LOADED, onValidSubmit);
    await waitFor(() => {
      expect(result.current.titleField.value).toBe('First league win');
    });
    act(() => {
      submit(result.current);
    });

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'First league win' }),
      );
    });
  });

  it('discards edits back to the loaded story on cancel', async () => {
    const { result } = renderForm(LOADED);
    await waitFor(() => {
      expect(result.current.titleField.value).toBe('First league win');
    });
    act(() => {
      result.current.titleField.onChange('Scrapped headline');
    });
    await waitFor(() => {
      expect(result.current.titleField.value).toBe('Scrapped headline');
    });
    act(() => {
      result.current.onReset();
    });

    await waitFor(() => {
      expect(result.current.titleField.value).toBe('First league win');
    });
  });
});
