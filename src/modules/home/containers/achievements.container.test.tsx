import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useAchievementsScreen } from '../hooks/use-achievements-screen.hook';
import { AchievementsContainer } from './achievements.container';

vi.mock('../hooks/use-achievements-screen.hook', () => ({ useAchievementsScreen: vi.fn() }));

const VIEW = {
  page: {
    path: '/at-a-glance',
    eyebrow: 'By the numbers',
    title: 'Ultimate Natives at a glance',
    seoTitle: 'Our record — Ultimate Natives',
    seoDescription: 'Founded October 2021, 25 players.',
  },
  achievements: {
    heading: 'Ultimate Natives at a glance',
    items: [
      { key: 'founded', label: 'Founded', value: 'October 2021' },
      { key: 'roster', label: 'Roster', value: '25 players' },
    ],
  },
};

beforeEach(() => {
  vi.mocked(useAchievementsScreen).mockReturnValue(VIEW);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AchievementsContainer', () => {
  it('renders the page shell', () => {
    render(<AchievementsContainer />);

    expect(screen.getByTestId(TEST_IDS.publicAchievementsPage)).toBeInTheDocument();
  });

  it('lists every fact with its value', () => {
    render(<AchievementsContainer />);

    for (const item of VIEW.achievements.items) {
      expect(screen.getByText(item.value)).toBeInTheDocument();
    }
  });
});
