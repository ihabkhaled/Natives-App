import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useSpiritScreen } from './use-spirit-screen.hook';

function renderSpirit(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useSpiritScreen>>
> {
  return renderHookWithProviders(() => useSpiritScreen(), { initialPath: '/spirit' });
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useSpiritScreen', () => {
  it('resolves the canonical path for SEO metadata', () => {
    expect(renderSpirit().result.current.page.path).toBe('/spirit');
  });

  it('titles the page and gives it a non-empty SEO description', () => {
    const { page } = renderSpirit().result.current;

    expect(page.title.length).toBeGreaterThan(0);
    expect(page.seoDescription.length).toBeGreaterThan(0);
  });

  it('lists four spirit-of-the-game values, each with a title and body', () => {
    const { spiritValues } = renderSpirit().result.current;

    expect(spiritValues.values).toHaveLength(4);
    for (const value of spiritValues.values) {
      expect(value.title.length).toBeGreaterThan(0);
      expect(value.body.length).toBeGreaterThan(0);
    }
  });

  it('reuses the About page copy verbatim, so the two can never drift apart', () => {
    expect(renderSpirit().result.current.spiritValues.heading).toBe('Spirit of the Game');
  });
});
