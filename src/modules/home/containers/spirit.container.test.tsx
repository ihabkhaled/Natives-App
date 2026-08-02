import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useSpiritScreen } from '../hooks/use-spirit-screen.hook';
import { SpiritContainer } from './spirit.container';

vi.mock('../hooks/use-spirit-screen.hook', () => ({ useSpiritScreen: vi.fn() }));

const VIEW = {
  page: {
    path: '/spirit',
    eyebrow: 'How we play',
    title: 'Spirit of the Game',
    seoTitle: 'Spirit of the Game — Ultimate Natives',
    seoDescription: 'The values that keep our games fair.',
  },
  spiritValues: {
    heading: 'Spirit of the Game',
    intro: 'The values every Native plays by.',
    values: [
      { key: 'fairness', title: 'Fairness', body: 'Play by the rules, always.' },
      { key: 'respect', title: 'Respect', body: 'Every opponent, every call.' },
    ],
  },
};

beforeEach(() => {
  vi.mocked(useSpiritScreen).mockReturnValue(VIEW);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SpiritContainer', () => {
  it('renders the page shell', () => {
    render(<SpiritContainer />);

    expect(screen.getByTestId(TEST_IDS.spiritPage)).toBeInTheDocument();
  });

  it('renders every spirit value card', () => {
    render(<SpiritContainer />);

    for (const value of VIEW.spiritValues.values) {
      expect(screen.getByText(value.title)).toBeInTheDocument();
    }
  });
});
