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

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(params)}`;

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
    // The pitch itself, not the district — a district pin lands a visitor in
    // the right suburb and they still cannot find the game.
    expect(section.mapsHref).toBe('https://maps.app.goo.gl/77HEdLvay1qBQtHL6');
    expect(section.mapEmbedHref).toContain('google.com/maps/embed');
  });
});

describe('buildGallerySection', () => {
  it('shows a real photograph per person, named in the alt text', () => {
    const section = buildGallerySection(t);

    expect(section.tiles).toHaveLength(9);
    expect(section.tiles.every((tile) => tile.src.startsWith('/staff/'))).toBe(true);
  });

  it('names the person in each alt text rather than its position in the grid', () => {
    const [first] = buildGallerySection(t).tiles;

    // A screen-reader user hears who is in the picture, not "image 1".
    expect(first?.alt).toBe('t:landing.galleryPhotoAlt:{"name":"Sherif Ashraf"}');
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
