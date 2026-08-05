import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeSchedulesScreenView } from '../../../../tests/factories/practice-schedules-view.factory';
import { usePracticeSchedulesListScreen } from '../hooks/use-practice-schedules-list-screen.hook';
import { PracticeSchedulesListContainer } from './practice-schedules-list.container';

vi.mock('../hooks/use-practice-schedules-list-screen.hook', () => ({
  usePracticeSchedulesListScreen: vi.fn(),
}));

describe('PracticeSchedulesListContainer', () => {
  it('renders the list screen from the hook view', () => {
    vi.mocked(usePracticeSchedulesListScreen).mockReturnValue(buildPracticeSchedulesScreenView());

    render(<PracticeSchedulesListContainer />);

    expect(screen.getByTestId(TEST_IDS.practiceSchedulesPage)).toBeInTheDocument();
  });
});
