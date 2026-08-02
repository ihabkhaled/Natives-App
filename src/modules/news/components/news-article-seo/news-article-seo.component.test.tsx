import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getLinkHref, getMetaContent } from '../../../../../tests/setup/head-meta.helper';
import { NewsArticleSeo } from './news-article-seo.component';

const PROPS = {
  title: 'First league win — Ultimate Natives',
  description: 'The Natives took the opener 15-12.',
  path: '/news/first-league-win',
  imageUrl: 'https://cdn.example.com/first-win.jpg',
  publishedTime: '2026-05-02T18:00:00.000Z',
  author: 'Dalia Elgharib',
};

describe('NewsArticleSeo', () => {
  it('declares the page an article, not a website', async () => {
    render(<NewsArticleSeo {...PROPS} />);

    await waitFor(() => {
      expect(getMetaContent('meta[property="og:type"]')).toBe('article');
    });
  });

  it('carries the story cover as the share image and the story canonical URL', async () => {
    render(<NewsArticleSeo {...PROPS} />);

    await waitFor(() => {
      expect(getMetaContent('meta[property="og:image"]')).toBe(
        'https://cdn.example.com/first-win.jpg',
      );
    });
    expect(getLinkHref('link[rel="canonical"]')).toContain('/news/first-league-win');
  });

  it('publishes the article author and publication instant', async () => {
    render(<NewsArticleSeo {...PROPS} />);

    await waitFor(() => {
      expect(getMetaContent('meta[property="article:author"]')).toBe('Dalia Elgharib');
    });
    expect(getMetaContent('meta[property="article:published_time"]')).toBe(
      '2026-05-02T18:00:00.000Z',
    );
  });

  it('falls back to the club logo and omits the date for an unresolved story', async () => {
    render(<NewsArticleSeo {...PROPS} imageUrl={null} publishedTime={null} />);

    await waitFor(() => {
      expect(getMetaContent('meta[property="og:image"]')).toContain('/brand-logo.png');
    });
    expect(getMetaContent('meta[property="article:published_time"]')).toBeNull();
  });
});
