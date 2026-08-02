import { act, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SharedUiModule from '@/shared/ui';

import { buildNewsArticle } from '../../../../tests/factories/news.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useNewsEditor } from './use-news-editor.hook';

const doubles = vi.hoisted(() => ({
  canManage: true,
  showToast: vi.fn(),
  save: vi.fn(() => Promise.resolve({ status: 'unavailable', article: null })),
  publish: vi.fn(() => Promise.resolve({ status: 'unavailable', article: null })),
  items: [] as unknown[],
}));

vi.mock('./use-news-context.hook', () => ({
  useNewsContext: () => ({ isOffline: false, isLoading: false, canManage: doubles.canManage }),
}));
vi.mock('../services/list-managed-news.service', () => ({
  listManagedNews: () =>
    Promise.resolve({ status: 'ready', page: { items: doubles.items, total: doubles.items.length } }),
}));
vi.mock('../services/save-news-article.service', () => ({ saveNewsArticle: doubles.save }));
vi.mock('../services/publish-news-article.service', () => ({
  publishNewsArticle: doubles.publish,
}));
vi.mock('@/shared/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof SharedUiModule>()),
  useAppToast: () => ({ showToast: doubles.showToast }),
}));

async function renderEditor() {
  const rendered = renderHookWithProviders(() => useNewsEditor(), { initialPath: '/news/manage' });
  await act(async () => {
    await Promise.resolve();
  });
  return rendered;
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  doubles.canManage = true;
  doubles.items = [buildNewsArticle(), buildNewsArticle({ id: 'news-2', status: 'draft', publishedAt: null, title: 'Tryouts open' })];
  doubles.showToast.mockClear();
  doubles.save.mockClear();
  doubles.publish.mockClear();
});

describe('useNewsEditor', () => {
  it('forbids the screen for a session without the grant, before any read', async () => {
    doubles.canManage = false;
    const { result } = await renderEditor();

    expect(result.current.status).toBe('forbidden');
    expect(result.current.canManage).toBe(false);
  });

  it('lists drafts alongside published stories', async () => {
    const { result } = await renderEditor();

    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });
    expect(result.current.rows.map((row) => row.isPublished)).toEqual([true, false]);
  });

  it('warns that writes go nowhere while the 1.8.0 seam is a stub', async () => {
    const { result } = await renderEditor();

    expect(result.current.notice).toContain('nothing you type is sent anywhere');
  });

  it('starts a new draft with an empty form and no revision warning', async () => {
    const { result } = await renderEditor();
    act(() => {
      result.current.onNewDraft();
    });

    expect(result.current.form.heading).toBe('New draft');
    expect(result.current.form.revisionNotice).toBeNull();
  });

  it('states the revision consequence when a published story is opened', async () => {
    const { result } = await renderEditor();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });
    act(() => {
      result.current.onEdit('news-1');
    });

    await waitFor(() => {
      expect(result.current.form.heading).toBe('New revision');
    });
    expect(result.current.form.revisionNotice).toContain('creates a new revision');
    expect(result.current.form.titleField.value).toBe('First league win');
  });

  it('calls the story an edit, not a revision, while it is still a draft', async () => {
    const { result } = await renderEditor();
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(2);
    });
    act(() => {
      result.current.onEdit('news-2');
    });

    await waitFor(() => {
      expect(result.current.form.heading).toBe('Edit draft');
    });
    expect(result.current.form.revisionNotice).toBeNull();
  });

  it('publishes a draft through the seam and reports that nothing was sent', async () => {
    const { result } = await renderEditor();
    act(() => {
      result.current.onPublish('news-2');
    });

    await waitFor(() => {
      // mutate() forwards a React Query options object as a second argument;
      // only the story id this call actually chose is under test here.
      expect(doubles.publish.mock.calls[0]?.[0]).toBe('news-2');
    });
    await waitFor(() => {
      expect(doubles.showToast).toHaveBeenCalledWith({
        message: 'Publishing is not connected yet, so nothing was sent.',
      });
    });
  });

  it('surfaces a refusal as sanitized copy rather than a raw error', async () => {
    doubles.publish.mockRejectedValueOnce(new Error('boom'));
    const { result } = await renderEditor();
    act(() => {
      result.current.onPublish('news-2');
    });

    await waitFor(() => {
      expect(doubles.showToast).toHaveBeenCalledWith({
        message: 'We could not save that. Nothing was changed.',
      });
    });
  });
});
