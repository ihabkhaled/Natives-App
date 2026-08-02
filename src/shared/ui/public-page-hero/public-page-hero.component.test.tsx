import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PublicPageHero } from './public-page-hero.component';

describe('PublicPageHero', () => {
  it('renders the eyebrow, the page heading and the lede', () => {
    render(<PublicPageHero eyebrow="Get in touch" title="Contact Us" intro="Send us a message." />);

    expect(screen.getByText('Get in touch')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Contact Us' })).toBeInTheDocument();
    expect(screen.getByText('Send us a message.')).toBeInTheDocument();
  });

  it('omits the lede entirely when a page has none', () => {
    render(<PublicPageHero eyebrow="New to the sport?" title="What is Ultimate Frisbee?" />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // One eyebrow paragraph only — no empty lede left behind.
    expect(screen.getAllByText(/./u, { selector: 'p' })).toHaveLength(1);
  });

  it('keeps a page-specific skin when one is given, and defaults otherwise', () => {
    const { container, rerender } = render(<PublicPageHero eyebrow="e" title="t" />);
    expect(container.querySelector('header')).toHaveClass('app-about-hero');

    rerender(<PublicPageHero eyebrow="e" title="t" className="app-showcase-hero" />);
    expect(container.querySelector('header')).toHaveClass('app-showcase-hero');
  });
});
