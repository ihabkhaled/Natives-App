import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAboutScreenView } from '../../../../../tests/factories/about-screen-view.factory';
import { getLinkHref } from '../../../../../tests/setup/head-meta.helper';

import type { AboutViewProps } from './about-view.types';
import { AboutView } from './about-view.component';

function view(overrides: Partial<AboutViewProps> = {}): AboutViewProps {
  return buildAboutScreenView(overrides);
}

describe('AboutView', () => {
  it('renders the about page shell', () => {
    render(<AboutView {...view()} />);

    expect(screen.getByTestId(TEST_IDS.aboutPage)).toBeInTheDocument();
  });

  it('shows the hero title as the page heading', () => {
    render(<AboutView {...view({ heroTitle: 'About Ultimate Natives' })} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About Ultimate Natives');
  });

  it('shows the verbatim founding story', () => {
    render(<AboutView {...view()} />);

    expect(screen.getByText(view().foundingQuote)).toBeInTheDocument();
  });

  it('lists every quick fact', () => {
    render(<AboutView {...view()} />);

    const facts = screen.getByTestId(TEST_IDS.aboutFactList);
    expect(facts).toHaveTextContent('Ultimate Frisbee');
    expect(facts).toHaveTextContent('October 2021');
    expect(facts).toHaveTextContent('El Sheikh Zayed, Giza, Egypt');
    expect(facts).toHaveTextContent('25 players');
  });

  it('renders every spirit-of-the-game value with its title and body', () => {
    render(<AboutView {...view()} />);

    for (const value of view().spiritValues) {
      const card = screen.getByTestId(`${TEST_IDS.aboutSpiritValue}-${value.key}`);
      expect(card).toHaveTextContent(value.title);
      expect(card).toHaveTextContent(value.body);
    }
  });

  it('publishes per-route SEO metadata', () => {
    render(<AboutView {...view({ seoTitle: 'About Us — Ultimate Natives', path: '/about' })} />);

    expect(document.title).toBe('About Us — Ultimate Natives');
    expect(getLinkHref('link[rel="canonical"]')).toBe(
      'https://natives-frontend-app.vercel.app/about',
    );
  });
});
