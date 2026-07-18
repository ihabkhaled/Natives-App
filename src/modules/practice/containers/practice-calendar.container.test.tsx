import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeCalendarView } from '../../../../tests/factories/practice-view.factory';
import { usePracticeCalendar } from '../hooks/use-practice-calendar.hook';
import { PracticeCalendarContainer } from './practice-calendar.container';

vi.mock('../hooks/use-practice-calendar.hook', () => ({ usePracticeCalendar: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('PracticeCalendarContainer', () => {
  it('renders the calendar page shell titled from the hook', () => {
    vi.mocked(usePracticeCalendar).mockReturnValue(buildPracticeCalendarView());

    render(<PracticeCalendarContainer />);

    expect(screen.getByTestId(TEST_IDS.practiceCalendarPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceCalendarView)).toBeInTheDocument();
    expect(screen.getByText('Practice calendar')).toBeInTheDocument();
  });
});
