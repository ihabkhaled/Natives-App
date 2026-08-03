import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeAgendaScreenView } from '../../../../tests/factories/practice-agenda-view.factory';
import { usePracticeAgendaRouteScreen } from '../hooks/use-practice-agenda-route-screen.hook';
import { PracticeAgendaContainer } from './practice-agenda.container';

vi.mock('../hooks/use-practice-agenda-route-screen.hook', () => ({
  usePracticeAgendaRouteScreen: vi.fn(),
}));

describe('PracticeAgendaContainer', () => {
  it('hands the routed view model straight to the screen', () => {
    vi.mocked(usePracticeAgendaRouteScreen).mockReturnValue(buildPracticeAgendaScreenView());

    render(<PracticeAgendaContainer />);

    expect(screen.getByTestId(TEST_IDS.practiceAgendaPage)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Blocks' })).toBeInTheDocument();
  });
});
