import { describe, expect, it, vi } from 'vitest';

import { buildHeroSection } from './landing-hero.helper';

const t = (key: string): string => `t:${key}`;

describe('buildHeroSection', () => {
  it('translates every hero field and wires the two CTAs through', () => {
    const onPrimaryCta = vi.fn();
    const onSecondaryCta = vi.fn();

    const hero = buildHeroSection(t, onPrimaryCta, onSecondaryCta);

    expect(hero).toMatchObject({
      eyebrow: 't:landing.heroEyebrow',
      title: 't:landing.heroTitle',
      tagline: 't:landing.heroTagline',
      founded: 't:landing.heroFounded',
      primaryCtaLabel: 't:landing.heroPrimaryCta',
      secondaryCtaLabel: 't:landing.heroSecondaryCta',
    });
    hero.onPrimaryCta();
    hero.onSecondaryCta();
    expect(onPrimaryCta).toHaveBeenCalledOnce();
    expect(onSecondaryCta).toHaveBeenCalledOnce();
  });
});
