import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getLinkHref, getMetaContent } from '../../../../tests/setup/head-meta.helper';

import { PageSeo } from './page-seo.component';

describe('PageSeo', () => {
  it('sets the document title', () => {
    render(<PageSeo title="About — Ultimate Natives" description="Who we are." path="/about" />);

    expect(document.title).toBe('About — Ultimate Natives');
  });

  it('publishes the canonical link at the confirmed site origin', () => {
    render(<PageSeo title="About" description="Who we are." path="/about" />);

    expect(getLinkHref('link[rel="canonical"]')).toBe(
      'https://natives-frontend-app.vercel.app/about',
    );
  });

  it('publishes matching Open Graph and Twitter Card tags', () => {
    render(<PageSeo title="Contact" description="Reach the team." path="/contact" />);

    expect(getMetaContent('meta[property="og:title"]')).toBe('Contact');
    expect(getMetaContent('meta[property="og:description"]')).toBe('Reach the team.');
    expect(getMetaContent('meta[property="og:url"]')).toBe(
      'https://natives-frontend-app.vercel.app/contact',
    );
    expect(getMetaContent('meta[property="og:image"]')).toBe(
      'https://natives-frontend-app.vercel.app/brand-logo.png',
    );
    expect(getMetaContent('meta[name="twitter:card"]')).toBe('summary_large_image');
  });

  it('publishes the meta description', () => {
    render(<PageSeo title="About" description="Who we are." path="/about" />);

    expect(getMetaContent('meta[name="description"]')).toBe('Who we are.');
  });
});
