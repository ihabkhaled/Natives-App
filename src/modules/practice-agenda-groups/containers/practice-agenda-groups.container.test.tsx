import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRouteParam } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';

import { buildPracticeAgendaGroupsScreenView } from '../../../../tests/factories/practice-agenda-groups-view.factory';
import { usePracticeAgendaGroupsScreen } from '../hooks/use-practice-agenda-groups-screen.hook';
import { PracticeAgendaGroupsContainer } from './practice-agenda-groups.container';

vi.mock('@/packages/router', () => ({ useRouteParam: vi.fn() }));
vi.mock('../hooks/use-practice-agenda-groups-screen.hook', () => ({
  usePracticeAgendaGroupsScreen: vi.fn(),
}));

describe('PracticeAgendaGroupsContainer', () => {
  it('hands the routed session id to the screen hook', () => {
    vi.mocked(useRouteParam).mockReturnValue('session-7');
    vi.mocked(usePracticeAgendaGroupsScreen).mockReturnValue(buildPracticeAgendaGroupsScreenView());

    render(<PracticeAgendaGroupsContainer />);

    expect(usePracticeAgendaGroupsScreen).toHaveBeenCalledWith('session-7');
    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsPage)).toBeInTheDocument();
  });

  /**
   * A route that failed to match must not become a read at
   * `/practice-sessions//agenda/plan`; the empty id is what the query guards on.
   */
  it('falls back to an empty id when the route did not match', () => {
    vi.mocked(useRouteParam).mockReturnValue(null);
    vi.mocked(usePracticeAgendaGroupsScreen).mockReturnValue(buildPracticeAgendaGroupsScreenView());

    render(<PracticeAgendaGroupsContainer />);

    expect(usePracticeAgendaGroupsScreen).toHaveBeenCalledWith('');
  });
});
