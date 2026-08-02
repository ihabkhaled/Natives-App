import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildLandingScreenView } from '../../../../../tests/factories/landing-screen-view.factory';
import { getLinkHref } from '../../../../../tests/setup/head-meta.helper';

import type { LandingViewProps } from './landing-view.types';
import { LandingView } from './landing-view.component';

function view(overrides: Partial<LandingViewProps> = {}): LandingViewProps {
  return buildLandingScreenView(overrides);
}

describe('LandingView', () => {
  it('renders the landing page shell', () => {
    render(<LandingView {...view()} />);

    expect(screen.getByTestId(TEST_IDS.landingPage)).toBeInTheDocument();
  });

  it('shows the team name as the page heading', () => {
    render(<LandingView {...view()} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ultimate Natives');
  });

  it('renders every real (non-seam) section', () => {
    render(<LandingView {...view()} />);

    expect(screen.getByTestId(TEST_IDS.landingExplainer)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingAboutPreview)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingSpiritValues)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingLocation)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingGallery)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingSocial)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingFinalCta)).toBeInTheDocument();
  });

  it('renders every seam section with its real or empty state', () => {
    render(<LandingView {...view()} />);

    expect(screen.getByTestId(TEST_IDS.landingStaff)).toBeInTheDocument();
    expect(screen.getByTestId('landing-staff-card-sherif-ashraf')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingPlayersEmpty)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingCompetitions)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingMatchesEmpty)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingLeaderboardEmpty)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.landingNewsEmpty)).toBeInTheDocument();
  });

  it('lists the achievement facts', () => {
    render(<LandingView {...view()} />);

    const facts = screen.getByTestId(TEST_IDS.landingAchievements);
    expect(facts).toHaveTextContent('October 2021');
    expect(facts).toHaveTextContent('25 players');
  });

  it('links every social profile out safely', () => {
    render(<LandingView {...view()} />);

    const link = screen.getByTestId(`${TEST_IDS.landingSocialLink}-facebook`);
    expect(link).toHaveAttribute('href', 'https://www.facebook.com/ultimatenatives');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('publishes per-route SEO metadata', () => {
    render(<LandingView {...view({ seoTitle: 'Landing — Ultimate Natives', path: '/' })} />);

    expect(document.title).toBe('Landing — Ultimate Natives');
    expect(getLinkHref('link[rel="canonical"]')).toBe('https://natives-frontend-app.vercel.app/');
  });
});
