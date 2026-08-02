import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildLandingScreenView } from '../../../../tests/factories/landing-screen-view.factory';

import { useLandingScreen } from '../hooks/use-landing-screen.hook';
import { LandingContainer } from './landing.container';

vi.mock('../hooks/use-landing-screen.hook', () => ({ useLandingScreen: vi.fn() }));

beforeEach(() => {
  vi.mocked(useLandingScreen).mockReturnValue(buildLandingScreenView());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LandingContainer', () => {
  it('renders the landing page shell', () => {
    render(<LandingContainer />);

    expect(screen.getByTestId(TEST_IDS.landingPage)).toBeInTheDocument();
  });

  it('feeds the view model into the landing view', () => {
    render(<LandingContainer />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ultimate Natives');
  });
});
