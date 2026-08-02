import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useLocationScreen } from './use-location-screen.hook';

function renderLocation(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useLocationScreen>>
> {
  return renderHookWithProviders(() => useLocationScreen(), { initialPath: '/location' });
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useLocationScreen', () => {
  it('resolves the canonical path for SEO metadata', () => {
    expect(renderLocation().result.current.page.path).toBe('/location');
  });

  it('titles the page and gives it a non-empty SEO description', () => {
    const { page } = renderLocation().result.current;

    expect(page.title.length).toBeGreaterThan(0);
    expect(page.seoDescription.length).toBeGreaterThan(0);
  });

  it('carries the real home-turf address', () => {
    expect(renderLocation().result.current.location.address).toBe('El Sheikh Zayed, Giza, Egypt');
  });
});
