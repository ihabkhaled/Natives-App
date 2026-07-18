import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeSessionScreenView } from '../../../../tests/factories/practice-view.factory';
import { usePracticeSessionScreen } from '../hooks/use-practice-session-screen.hook';
import { PracticeSessionDetailsContainer } from './practice-session-details.container';

vi.mock('../hooks/use-practice-session-screen.hook', () => ({ usePracticeSessionScreen: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('PracticeSessionDetailsContainer', () => {
  it('renders the prepared detail page', () => {
    vi.mocked(usePracticeSessionScreen).mockReturnValue(buildPracticeSessionScreenView());

    render(<PracticeSessionDetailsContainer />);

    expect(screen.getByTestId(TEST_IDS.practiceSessionPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceSessionDetails)).toBeInTheDocument();
  });

  it('reads the detail view model once', () => {
    vi.mocked(usePracticeSessionScreen).mockReturnValue(buildPracticeSessionScreenView());

    render(<PracticeSessionDetailsContainer />);

    expect(usePracticeSessionScreen).toHaveBeenCalledOnce();
  });
});
