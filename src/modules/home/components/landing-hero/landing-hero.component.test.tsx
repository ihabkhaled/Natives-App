import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { HeroSectionView } from '../../helpers/landing-hero.helper';
import { LandingHero } from './landing-hero.component';

function view(overrides: Partial<HeroSectionView> = {}): HeroSectionView {
  return {
    eyebrow: 'Ultimate Frisbee in El Sheikh Zayed, Egypt',
    title: 'Ultimate Natives',
    tagline:
      'We run natively as our programming systems and we play natively as our pharaonic ancestors.',
    founded: 'Founded October 2021',
    primaryCtaLabel: 'Join tryouts',
    secondaryCtaLabel: 'About us',
    onPrimaryCta: vi.fn(),
    onSecondaryCta: vi.fn(),
    ...overrides,
  };
}

describe('LandingHero', () => {
  it('renders the team name as the page heading', () => {
    render(<LandingHero view={view()} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ultimate Natives');
  });

  it('renders the tagline and founding notice', () => {
    render(<LandingHero view={view()} />);

    expect(screen.getByText(view().tagline)).toBeInTheDocument();
    expect(screen.getByText('Founded October 2021')).toBeInTheDocument();
  });

  it('fires the primary and secondary CTAs', () => {
    const onPrimaryCta = vi.fn();
    const onSecondaryCta = vi.fn();
    render(<LandingHero view={view({ onPrimaryCta, onSecondaryCta })} />);

    fireEvent.click(screen.getByTestId('landing-hero-primary-cta'));
    fireEvent.click(screen.getByTestId('landing-hero-secondary-cta'));

    expect(onPrimaryCta).toHaveBeenCalledTimes(1);
    expect(onSecondaryCta).toHaveBeenCalledTimes(1);
  });
});
