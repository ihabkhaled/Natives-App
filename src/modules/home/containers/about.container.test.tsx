import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAboutScreenView } from '../../../../tests/factories/about-screen-view.factory';

import { useAboutScreen } from '../hooks/use-about-screen.hook';
import { AboutContainer } from './about.container';

vi.mock('../hooks/use-about-screen.hook', () => ({ useAboutScreen: vi.fn() }));

beforeEach(() => {
  vi.mocked(useAboutScreen).mockReturnValue(buildAboutScreenView());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AboutContainer', () => {
  it('renders the about page shell', () => {
    render(<AboutContainer />);

    expect(screen.getByTestId(TEST_IDS.aboutPage)).toBeInTheDocument();
  });

  it('feeds the view model into the about view', () => {
    render(<AboutContainer />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About Ultimate Natives');
  });
});
