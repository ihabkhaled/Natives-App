import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useGalleryScreen } from '../hooks/use-gallery-screen.hook';
import { GalleryContainer } from './gallery.container';

vi.mock('../hooks/use-gallery-screen.hook', () => ({ useGalleryScreen: vi.fn() }));

const VIEW = {
  page: {
    path: '/gallery',
    eyebrow: 'On the field',
    title: 'Gallery',
    seoTitle: 'Gallery — Ultimate Natives',
    seoDescription: 'Moments from the season.',
  },
  gallery: {
    heading: 'Gallery',
    intro: 'Moments from the season.',
    tiles: [
      { key: 'tile-1', alt: 'Match-day photo coming soon' },
      { key: 'tile-2', alt: 'Match-day photo coming soon' },
    ],
  },
};

beforeEach(() => {
  vi.mocked(useGalleryScreen).mockReturnValue(VIEW);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('GalleryContainer', () => {
  it('renders the page shell', () => {
    render(<GalleryContainer />);

    expect(screen.getByTestId(TEST_IDS.galleryPage)).toBeInTheDocument();
  });

  it('renders one tile per gallery entry', () => {
    render(<GalleryContainer />);

    expect(screen.getAllByTestId(new RegExp(`^${TEST_IDS.landingGalleryTile}-`))).toHaveLength(
      VIEW.gallery.tiles.length,
    );
  });
});
