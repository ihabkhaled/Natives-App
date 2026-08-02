import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { LocationSectionView } from '../../helpers/landing-static-sections.helper';
import { LandingLocation } from './landing-location.component';

function view(): LocationSectionView {
  return {
    heading: 'Where we play',
    intro: 'Home turf.',
    address: 'El Sheikh Zayed, Giza, Egypt',
    ctaLabel: 'Open in Maps',
    mapAlt: 'Map marker for El Sheikh Zayed, Giza, Egypt',
    mapsHref: 'https://www.google.com/maps/search/?api=1&query=El+Sheikh+Zayed%2C+Giza%2C+Egypt',
  };
}

describe('LandingLocation', () => {
  it('renders the address', () => {
    render(<LandingLocation view={view()} />);

    expect(screen.getByText('El Sheikh Zayed, Giza, Egypt')).toBeInTheDocument();
  });

  it('links out to Maps in a new tab, safely', () => {
    render(<LandingLocation view={view()} />);

    const link = screen.getByTestId('landing-location-cta');
    expect(link).toHaveAttribute('href', view().mapsHref);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });
});
