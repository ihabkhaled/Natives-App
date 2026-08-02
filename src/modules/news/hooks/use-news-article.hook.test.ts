import { act } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildNewsArticle } from '../../../../tests/factories/news.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useNewsArticle } from './use-news-article.hook';

const doubles = vi.hoisted(() => ({
  slug: 'first-league-win' as string | null,
  push: vi.fn(),
  result: { status: 'unavailable', article: null as unknown },
}));

vi.mock('./use-news-context.hook', () => ({
  useNewsContext: () => ({ isOffline: false, isLoading: false, canManage: false }),
}));
vi.mock('../services/get-published-news-article.service', () => ({
  getPublishedNewsArticle: () => Promise.resolve(doubles.result),
}));
vi.mock('@/packages/router', () => ({
  useAppNavigation: () => ({ push: doubles.push }),
  useRouteParam: () => doubles.slug,
}));

async function renderArticle() {
  const rendered = renderHookWithProviders(() => useNewsArticle(), {
    initialPath: '/news/first-league-win',
  });
  await act(async () => {
    await Promise.resolve();
  });
  return rendered;
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  doubles.slug = 'first-league-win';
  doubles.result = { status: 'unavailable', article: null };
  doubles.push.mockClear();
});

describe('useNewsArticle', () => {
  it('says the story could not be found rather than "no stories"', async () => {
    const { result } = await renderArticle();

    expect(result.current.status).toBe('empty');
    expect(result.current.emptyTitle).toBe('We could not find that story');
  });

  it('falls back to the site description when there is no story to summarize', async () => {
    const { result } = await renderArticle();

    expect(result.current.seoDescription).toContain('Ultimate Natives');
    expect(result.current.seoImageUrl).toBeNull();
    expect(result.current.seoPublishedTime).toBeNull();
  });

  it('builds article SEO facts from a resolved story', async () => {
    doubles.result = { status: 'ready', article: buildNewsArticle() };
    const { result } = await renderArticle();

    expect(result.current.status).toBe('ready');
    expect(result.current.seoTitle).toBe('First league win — Ultimate Natives');
    expect(result.current.seoDescription).toBe('The Natives took the opener 15-12.');
    expect(result.current.seoImageUrl).toBe('https://cdn.example.com/first-win.jpg');
    expect(result.current.seoPublishedTime).toBe('2026-05-02T18:00:00.000Z');
    expect(result.current.path).toBe('/news/first-league-win');
  });

  it('parses the body into typed blocks instead of handing the view markup', async () => {
    doubles.result = { status: 'ready', article: buildNewsArticle() };
    const { result } = await renderArticle();

    expect(result.current.blocks.map((block) => block.kind)).toEqual(['heading', 'paragraph']);
  });

  it('parses nothing when there is no story yet', async () => {
    const { result } = await renderArticle();

    expect(result.current.blocks).toEqual([]);
  });

  it('names the domain records the story is attached to', async () => {
    doubles.result = { status: 'ready', article: buildNewsArticle({ matchId: 'm1' }) };
    const { result } = await renderArticle();

    expect(result.current.linkLabels).toEqual(['Linked to a match']);
  });

  it('returns to the list', async () => {
    const { result } = await renderArticle();
    act(() => {
      result.current.onBack();
    });

    expect(doubles.push).toHaveBeenCalledWith('/news');
  });

  it('tolerates a route with no slug at all', async () => {
    doubles.slug = null;
    const { result } = await renderArticle();

    expect(result.current.path).toBe('/news/');
  });
});
