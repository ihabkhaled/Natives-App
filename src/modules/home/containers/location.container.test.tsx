import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useLocationScreen } from '../hooks/use-location-screen.hook';
import { LocationContainer } from './location.container';

vi.mock('../hooks/use-location-screen.hook', () => ({ useLocationScreen: vi.fn() }));

const VIEW = {
  page: {
    path: '/location',
    eyebrow: 'Find us',
    title: 'Home turf',
    seoTitle: 'Where we play — Ultimate Natives, El Sheikh Zayed',
    seoDescription: 'Directions to our home turf.',
  },
  location: {
    heading: 'Home turf',
    intro: 'Where we train and play.',
    address: 'El Sheikh Zayed, Giza, Egypt',
    ctaLabel: 'Get directions',
    mapAlt: 'Illustrative map of El Sheikh Zayed',
    mapsHref: 'https://maps.google.com/?q=El+Sheikh+Zayed',
  },
};

beforeEach(() => {
  vi.mocked(useLocationScreen).mockReturnValue(VIEW);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LocationContainer', () => {
  it('renders the page shell', () => {
    render(<LocationContainer />);

    expect(screen.getByTestId(TEST_IDS.locationPage)).toBeInTheDocument();
  });

  it('shows the real home-turf address', () => {
    render(<LocationContainer />);

    expect(screen.getByText(VIEW.location.address)).toBeInTheDocument();
  });
});
