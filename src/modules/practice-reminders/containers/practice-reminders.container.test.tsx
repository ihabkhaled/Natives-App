import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRouteParam } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';

import { buildPracticeRemindersScreenView } from '../../../../tests/factories/practice-reminders-view.factory';
import { usePracticeRemindersScreen } from '../hooks/use-practice-reminders-screen.hook';
import { PracticeRemindersContainer } from './practice-reminders.container';

vi.mock('@/packages/router', () => ({ useRouteParam: vi.fn() }));
vi.mock('../hooks/use-practice-reminders-screen.hook', () => ({
  usePracticeRemindersScreen: vi.fn(),
}));

describe('PracticeRemindersContainer', () => {
  it('hands the routed session id to the screen hook', () => {
    vi.mocked(useRouteParam).mockReturnValue('session-7');
    vi.mocked(usePracticeRemindersScreen).mockReturnValue(buildPracticeRemindersScreenView());

    render(<PracticeRemindersContainer />);

    expect(usePracticeRemindersScreen).toHaveBeenCalledWith('session-7');
    expect(screen.getByTestId(TEST_IDS.practiceRemindersPage)).toBeInTheDocument();
  });

  /**
   * A route that failed to match must not become a read at
   * `/practice-sessions//reminders`; the empty id is what the query guards on.
   */
  it('falls back to an empty id when the route did not match', () => {
    vi.mocked(useRouteParam).mockReturnValue(null);
    vi.mocked(usePracticeRemindersScreen).mockReturnValue(buildPracticeRemindersScreenView());

    render(<PracticeRemindersContainer />);

    expect(usePracticeRemindersScreen).toHaveBeenCalledWith('');
  });
});
