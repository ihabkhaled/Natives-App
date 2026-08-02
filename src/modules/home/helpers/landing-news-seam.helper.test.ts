import { describe, expect, it } from 'vitest';

import { buildNewsSection } from './landing-news-seam.helper';

const t = (key: string): string => `t:${key}`;

describe('buildNewsSection', () => {
  it('presents the honest empty state — the news module ships with contract 1.8.0', () => {
    const section = buildNewsSection(t);

    expect(section.chrome.status).toBe('empty');
    expect(section.heading).toBe('t:landing.newsHeading');
  });
});
