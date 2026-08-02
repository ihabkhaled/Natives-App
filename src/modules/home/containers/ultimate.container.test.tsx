import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useUltimateScreen } from '../hooks/use-ultimate-screen.hook';
import { UltimateContainer } from './ultimate.container';

vi.mock('../hooks/use-ultimate-screen.hook', () => ({ useUltimateScreen: vi.fn() }));

const VIEW = {
  page: {
    path: '/ultimate',
    eyebrow: 'New to the sport?',
    title: 'What is Ultimate Frisbee?',
    seoTitle: 'What is Ultimate Frisbee? — Ultimate Natives',
    seoDescription: 'A short explainer.',
  },
  explainer: {
    eyebrow: 'New to the sport?',
    heading: 'What is Ultimate Frisbee?',
    body: 'Ultimate is a fast-paced, non-contact team sport.',
  },
};

beforeEach(() => {
  vi.mocked(useUltimateScreen).mockReturnValue(VIEW);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('UltimateContainer', () => {
  it('renders the page shell', () => {
    render(<UltimateContainer />);

    expect(screen.getByTestId(TEST_IDS.ultimatePage)).toBeInTheDocument();
  });

  it('feeds the view model into the explainer section', () => {
    render(<UltimateContainer />);

    expect(screen.getByText(VIEW.explainer.body)).toBeInTheDocument();
  });
});
