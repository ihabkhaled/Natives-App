import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { GallerySectionView } from '../../helpers/landing-static-sections.helper';
import { LandingGallery } from './landing-gallery.component';

function view(): GallerySectionView {
  return {
    heading: 'Gallery',
    intro: 'Moments from the season.',
    tiles: [
      { key: 'tile-1', alt: 'Ultimate Natives gallery placeholder', src: '/staff/tile-1.jpg' },
      { key: 'tile-2', alt: 'Ultimate Natives gallery placeholder', src: '/staff/tile-2.jpg' },
    ],
  };
}

describe('LandingGallery', () => {
  it('renders one tile per gallery placeholder', () => {
    render(<LandingGallery view={view()} />);

    expect(screen.getByTestId('landing-gallery-tile-tile-1')).toBeInTheDocument();
    expect(screen.getByTestId('landing-gallery-tile-tile-2')).toBeInTheDocument();
  });
});
