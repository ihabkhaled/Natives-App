import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildTeamDirectoryScreenView } from '../../../../../tests/factories/team-directory-view.factory';
import type { TeamHeroView } from '../../types/team-directory-view.types';
import { TeamProfileHero } from './team-profile-hero.component';

function heroWith(overrides: Partial<TeamHeroView> = {}): TeamHeroView {
  return { ...buildTeamDirectoryScreenView().hero, ...overrides };
}

describe('TeamProfileHero', () => {
  it('renders the page heading, eyebrow and tagline', () => {
    render(<TeamProfileHero hero={heroWith()} />);

    expect(screen.getByTestId(TEST_IDS.teamDirectoryHero)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'The people behind Ultimate Natives',
    );
    expect(screen.getByText('Season board 26/27')).toBeInTheDocument();
  });

  it('renders each published fact as a labelled pair', () => {
    render(<TeamProfileHero hero={heroWith()} />);

    expect(screen.getByText('Based in')).toBeInTheDocument();
    expect(screen.getByText('El Sheikh Zayed, Giza, Egypt')).toBeInTheDocument();
  });

  it('marks the founding date up as machine-readable time', () => {
    render(<TeamProfileHero hero={heroWith()} />);

    expect(screen.getByText('October 2021')).toHaveAttribute('datetime', '2021-10');
  });

  it('links the team social profiles in a new, opener-safe tab', () => {
    render(<TeamProfileHero hero={heroWith()} />);

    const link = screen.getByRole('link', { name: 'Facebook' });

    expect(link).toHaveAttribute('href', 'https://www.facebook.com/ultimatenatives');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('omits the social nav entirely when nothing is published', () => {
    render(<TeamProfileHero hero={heroWith({ socialLinks: [] })} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
