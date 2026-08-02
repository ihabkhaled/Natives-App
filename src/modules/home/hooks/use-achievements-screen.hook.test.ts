import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useAchievementsScreen } from './use-achievements-screen.hook';

function renderAchievements(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useAchievementsScreen>>
> {
  return renderHookWithProviders(() => useAchievementsScreen(), { initialPath: '/at-a-glance' });
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useAchievementsScreen', () => {
  it('resolves the canonical path for SEO metadata', () => {
    expect(renderAchievements().result.current.page.path).toBe('/at-a-glance');
  });

  it('titles the page and gives it a non-empty SEO description', () => {
    const { page } = renderAchievements().result.current;

    expect(page.title.length).toBeGreaterThan(0);
    expect(page.seoDescription.length).toBeGreaterThan(0);
  });

  it('lists the founded, roster, location and competitions facts, none invented', () => {
    const { achievements } = renderAchievements().result.current;

    expect(achievements.items.map((item) => item.key)).toEqual([
      'founded',
      'roster',
      'location',
      'competitions',
    ]);
    expect(achievements.items.find((item) => item.key === 'location')?.value).toBe(
      'El Sheikh Zayed, Giza, Egypt',
    );
  });
});
