import { act, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildNewsArticle } from '../../../../tests/factories/news.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useNewsList } from './use-news-list.hook';

const doubles = vi.hoisted(() => ({
  canManage: false,
  push: vi.fn(),
  result: { status: 'unavailable', page: { items: [] as unknown[], total: 0 } },
}));

vi.mock('./use-news-context.hook', () => ({
  useNewsContext: () => ({ isOffline: false, isLoading: false, canManage: doubles.canManage }),
}));
vi.mock('../services/list-published-news.service', () => ({
  listPublishedNews: () => Promise.resolve(doubles.result),
}));
vi.mock('@/packages/router', () => ({ useAppNavigation: () => ({ push: doubles.push }) }));

async function renderList() {
  const view = renderHookWithProviders(() => useNewsList(), { initialPath: '/news' });
  await waitFor(() => {
    expect(view.result.current.status).not.toBe('loading');
  });
  return view;
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  doubles.canManage = false;
  doubles.result = { status: 'unavailable', page: { items: [], total: 0 } };
  doubles.push.mockClear();
});

describe('useNewsList', () => {
  it('carries per-route SEO metadata for the public list', async () => {
    const { result } = await renderList();

    expect(result.current.path).toBe('/news');
    expect(result.current.seoTitle).toBe('News — Ultimate Natives');
    expect(result.current.seoDescription.length).toBeGreaterThan(0);
  });

  it('says the newsroom is coming soon rather than "no stories yet"', async () => {
    const { result } = await renderList();

    expect(result.current.status).toBe('empty');
    expect(result.current.emptyTitle).toBe('The newsroom is almost ready');
  });

  it('offers NO newsroom affordance to a reader without the grant', async () => {
    const { result } = await renderList();

    expect(result.current.manageLabel).toBeNull();
  });

  it('offers the newsroom to a session holding news.manage', async () => {
    doubles.canManage = true;
    const { result } = await renderList();

    expect(result.current.manageLabel).toBe('Newsroom');
    act(() => {
      result.current.onManage();
    });
    expect(doubles.push).toHaveBeenCalledWith('/news/manage');
  });

  it('prepares one card per story and counts them honestly', async () => {
    doubles.result = {
      status: 'ready',
      page: {
        items: [buildNewsArticle(), buildNewsArticle({ id: 'news-2', slug: 'b' })],
        total: 7,
      },
    };
    const { result } = await renderList();

    expect(result.current.status).toBe('ready');
    expect(result.current.items).toHaveLength(2);
    expect(result.current.countLabel).toBe('Showing 2 of 7 stories');
  });

  it('navigates to the story by slug', async () => {
    doubles.result = { status: 'ready', page: { items: [buildNewsArticle()], total: 1 } };
    const { result } = await renderList();
    act(() => {
      result.current.onOpen('first-league-win');
    });

    expect(doubles.push).toHaveBeenCalledWith('/news/first-league-win');
  });
});
