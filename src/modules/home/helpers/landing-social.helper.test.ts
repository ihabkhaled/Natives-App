import { describe, expect, it } from 'vitest';

import { buildSocialSection } from './landing-social.helper';

const t = (key: string): string => `t:${key}`;

describe('buildSocialSection', () => {
  it('lists the three real social profiles with translated labels', () => {
    const section = buildSocialSection(t);

    expect(section.heading).toBe('t:landing.socialHeading');
    expect(section.links).toEqual([
      { key: 'facebook', href: 'https://www.facebook.com/ultimatenatives', label: 't:publicFooter.facebookLabel' },
      { key: 'instagram', href: 'https://www.instagram.com/ultimatenatives', label: 't:publicFooter.instagramLabel' },
      { key: 'tiktok', href: 'https://www.tiktok.com/@ultimate.natives', label: 't:publicFooter.tiktokLabel' },
    ]);
  });
});
