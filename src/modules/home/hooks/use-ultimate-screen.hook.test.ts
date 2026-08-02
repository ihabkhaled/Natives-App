import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useUltimateScreen } from './use-ultimate-screen.hook';

function renderUltimate(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useUltimateScreen>>
> {
  return renderHookWithProviders(() => useUltimateScreen(), { initialPath: '/ultimate' });
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useUltimateScreen', () => {
  it('resolves the canonical path for SEO metadata', () => {
    expect(renderUltimate().result.current.page.path).toBe('/ultimate');
  });

  it('titles the page and gives it a non-empty SEO description', () => {
    const { page } = renderUltimate().result.current;

    expect(page.title.length).toBeGreaterThan(0);
    expect(page.seoTitle.length).toBeGreaterThan(0);
    expect(page.seoDescription.length).toBeGreaterThan(0);
  });

  it('explains the sport, reusing the landing explainer copy', () => {
    expect(renderUltimate().result.current.explainer.body).toContain('Ultimate');
  });
});
