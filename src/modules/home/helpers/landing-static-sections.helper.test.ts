import { describe, expect, it, vi } from 'vitest';

import {
  buildAboutPreviewSection,
  buildAchievementsSection,
  buildExplainerSection,
  buildFinalCtaSection,
  buildGallerySection,
  buildLocationSection,
  buildSpiritValuesSection,
} from './landing-static-sections.helper';

const t = (key: string): string => `t:${key}`;

describe('buildExplainerSection', () => {
  it('translates the "what is Ultimate Frisbee" copy', () => {
    expect(buildExplainerSection(t)).toEqual({
      eyebrow: 't:landing.explainerEyebrow',
      heading: 't:landing.explainerHeading',
      body: 't:landing.explainerBody',
    });
  });
});

describe('buildAboutPreviewSection', () => {
  it('wires the About CTA through', () => {
    const onCtaClick = vi.fn();
    const section = buildAboutPreviewSection(t, onCtaClick);

    section.onCtaClick();

    expect(section.heading).toBe('t:landing.aboutPreviewHeading');
    expect(onCtaClick).toHaveBeenCalledOnce();
  });
});

describe('buildLocationSection', () => {
  it('carries the real Maps link alongside the translated copy', () => {
    const section = buildLocationSection(t);

    expect(section.address).toBe('t:landing.locationAddress');
    expect(section.mapsHref).toBe(
      'https://www.google.com/maps/search/?api=1&query=El+Sheikh+Zayed%2C+Giza%2C+Egypt',
    );
  });
});

describe('buildGallerySection', () => {
  it('builds six placeholder tiles, each with the same accessible alt text', () => {
    const section = buildGallerySection(t);

    expect(section.tiles).toHaveLength(6);
    expect(section.tiles.every((tile) => tile.alt === 't:landing.galleryPlaceholderAlt')).toBe(
      true,
    );
    expect(new Set(section.tiles.map((tile) => tile.key)).size).toBe(6);
  });
});

describe('buildAchievementsSection', () => {
  it('lists founded, roster, location, and competitions facts', () => {
    const section = buildAchievementsSection(t);

    expect(section.items.map((item) => item.key)).toEqual([
      'founded',
      'roster',
      'location',
      'competitions',
    ]);
  });
});

describe('buildFinalCtaSection', () => {
  it('wires the primary and secondary CTAs through', () => {
    const onPrimaryClick = vi.fn();
    const onSecondaryClick = vi.fn();
    const section = buildFinalCtaSection(t, onPrimaryClick, onSecondaryClick);

    section.onPrimaryClick();
    section.onSecondaryClick();

    expect(onPrimaryClick).toHaveBeenCalledOnce();
    expect(onSecondaryClick).toHaveBeenCalledOnce();
  });
});

describe('buildSpiritValuesSection', () => {
  it('reuses the About page spirit-of-the-game keys verbatim', () => {
    const section = buildSpiritValuesSection(t);

    expect(section.heading).toBe('t:about.spiritHeading');
    expect(section.values).toEqual([
      { key: 'fairness', title: 't:about.spiritValue1Title', body: 't:about.spiritValue1Body' },
      { key: 'respect', title: 't:about.spiritValue2Title', body: 't:about.spiritValue2Body' },
      { key: 'joy', title: 't:about.spiritValue3Title', body: 't:about.spiritValue3Body' },
      { key: 'effort', title: 't:about.spiritValue4Title', body: 't:about.spiritValue4Body' },
    ]);
  });
});
