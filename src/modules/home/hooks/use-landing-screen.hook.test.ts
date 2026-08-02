import { act } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { useAppNavigation, type AppNavigation } from '@/packages/router';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useLandingScreen, type LandingScreenView } from './use-landing-screen.hook';

interface LandingProbe {
  readonly screen: LandingScreenView;
  readonly navigation: AppNavigation;
}

function renderLanding(): ReturnType<typeof renderHookWithProviders<LandingProbe>> {
  return renderHookWithProviders<LandingProbe>(
    () => ({ screen: useLandingScreen(), navigation: useAppNavigation() }),
    { initialPath: '/' },
  );
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useLandingScreen', () => {
  it('resolves the canonical root path for SEO metadata', () => {
    expect(renderLanding().result.current.screen.path).toBe('/');
  });

  it('titles the document with the tagline and product name', () => {
    expect(renderLanding().result.current.screen.seoTitle).toBe(
      'Ultimate Frisbee in El Sheikh Zayed, Egypt — Ultimate Natives',
    );
  });

  it('carries the real hero copy', () => {
    const { hero } = renderLanding().result.current.screen;

    expect(hero.title).toBe('Ultimate Natives');
    expect(hero.tagline).toBe(
      'We run natively as our programming systems and we play natively as our pharaonic ancestors.',
    );
    expect(hero.founded).toBe('Founded October 2021');
  });

  it('routes the hero primary CTA to tryout registration', () => {
    const { result } = renderLanding();

    act(() => {
      result.current.screen.hero.onPrimaryCta();
    });

    expect(result.current.navigation.currentPath).toBe('/tryout-registration');
  });

  it('routes the hero secondary CTA to the About page', () => {
    const { result } = renderLanding();

    act(() => {
      result.current.screen.hero.onSecondaryCta();
    });

    expect(result.current.navigation.currentPath).toBe('/about');
  });

  it('routes the about-preview CTA to the About page', () => {
    const { result } = renderLanding();

    act(() => {
      result.current.screen.aboutPreview.onCtaClick();
    });

    expect(result.current.navigation.currentPath).toBe('/about');
  });

  it('routes the final CTA to tryouts and contact', () => {
    const { result } = renderLanding();

    act(() => {
      result.current.screen.finalCta.onPrimaryClick();
    });
    expect(result.current.navigation.currentPath).toBe('/tryout-registration');

    act(() => {
      result.current.screen.finalCta.onSecondaryClick();
    });
    expect(result.current.navigation.currentPath).toBe('/contact');
  });

  it('seeds the leadership & staff seam with all nine Season-Board members', () => {
    const { staffDirectory } = renderLanding().result.current.screen;

    expect(staffDirectory.chrome.status).toBe('ready');
    expect(staffDirectory.members).toHaveLength(9);
    const ihab = staffDirectory.members.find((member) => member.id === 'ihab-khaled');
    expect(ihab?.titles).toEqual(['Analysis', 'Technical', 'Co-Coach']);
  });

  it('presents the news seam as honestly empty', () => {
    const { news } = renderLanding().result.current.screen;

    expect(news.chrome.status).toBe('empty');
  });

  it('links every teaser through to the page that owns that subject', () => {
    const screen = renderLanding().result.current.screen;

    for (const link of [
      screen.explainerLink,
      screen.staffLink,
      screen.competitionsLink,
      screen.newsLink,
    ]) {
      expect(link.label).not.toBe('');
      expect(typeof link.onClick).toBe('function');
    }
  });

  it('seeds the competitions seam with the two entered competitions and a pending rank', () => {
    const { competitions } = renderLanding().result.current.screen;

    expect(competitions.chrome.status).toBe('ready');
    expect(competitions.competitions.map((entry) => `${entry.name} ${entry.season}`)).toEqual([
      'EUNC 2026',
      'EUDL 2026',
    ]);
    expect(competitions.competitions.every((entry) => entry.rankStatus === 'Rank pending')).toBe(
      true,
    );
  });

  it('lists the social links', () => {
    const { social } = renderLanding().result.current.screen;

    expect(social.links.map((link) => link.key)).toEqual(['facebook', 'instagram', 'tiktok']);
  });
});
