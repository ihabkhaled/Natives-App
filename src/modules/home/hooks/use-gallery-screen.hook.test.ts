import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useGalleryScreen } from './use-gallery-screen.hook';

function renderGallery(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useGalleryScreen>>
> {
  return renderHookWithProviders(() => useGalleryScreen(), { initialPath: '/gallery' });
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useGalleryScreen', () => {
  it('resolves the canonical path for SEO metadata', () => {
    expect(renderGallery().result.current.page.path).toBe('/gallery');
  });

  it('titles the page and gives it a non-empty SEO description', () => {
    const { page } = renderGallery().result.current;

    expect(page.title.length).toBeGreaterThan(0);
    expect(page.seoDescription.length).toBeGreaterThan(0);
  });

  it('lists placeholder tiles until real match-day photos are DB-managed', () => {
    const { gallery } = renderGallery().result.current;

    expect(gallery.tiles.length).toBeGreaterThan(0);
    expect(new Set(gallery.tiles.map((tile) => tile.key)).size).toBe(gallery.tiles.length);
  });
});
