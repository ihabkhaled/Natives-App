import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useAboutScreen } from './use-about-screen.hook';

function renderAbout(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useAboutScreen>>
> {
  return renderHookWithProviders(() => useAboutScreen(), { initialPath: '/about' });
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useAboutScreen', () => {
  it('resolves the canonical about path for SEO metadata', () => {
    expect(renderAbout().result.current.path).toBe('/about');
  });

  it('titles the document with the page and product name', () => {
    expect(renderAbout().result.current.seoTitle).toBe('About Us — Ultimate Natives');
  });

  it('carries the verbatim founding story', () => {
    expect(renderAbout().result.current.foundingQuote).toBe(
      'Founded in October 2021 by Captain Dalia Elgharib and Coach Youssef Aboutaleb. ' +
        'Ultimate Natives are a team of 25 committed and highly spirited players. We run ' +
        'natively as our programming systems and we play natively as our pharaonic ancestors.',
    );
  });

  it('lists the quick facts with translated labels and values', () => {
    const { facts } = renderAbout().result.current;

    expect(facts.map((fact) => fact.key)).toEqual(['sport', 'founded', 'location', 'roster']);
    expect(facts.find((fact) => fact.key === 'location')?.value).toBe(
      'El Sheikh Zayed, Giza, Egypt',
    );
    expect(facts.find((fact) => fact.key === 'founded')?.value).toBe('October 2021');
    expect(facts.find((fact) => fact.key === 'roster')?.value).toBe('25 players');
  });

  it('lists four spirit-of-the-game values, each with a title and body', () => {
    const { spiritValues } = renderAbout().result.current;

    expect(spiritValues).toHaveLength(4);
    for (const value of spiritValues) {
      expect(value.title.length).toBeGreaterThan(0);
      expect(value.body.length).toBeGreaterThan(0);
    }
  });

  it('explains the sport', () => {
    expect(renderAbout().result.current.explainerBody).toContain('Ultimate');
  });
});
