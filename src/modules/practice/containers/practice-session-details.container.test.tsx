import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useRouteParam } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';

import { buildPracticeSessionScreenView } from '../../../../tests/factories/practice-view.factory';
import { usePracticeSessionDetails } from '../hooks/use-practice-session-details.hook';
import { PracticeSessionDetailsContainer } from './practice-session-details.container';

vi.mock('@/packages/router', () => ({ useRouteParam: vi.fn() }));
vi.mock('../hooks/use-practice-session-details.hook', () => ({
  usePracticeSessionDetails: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('PracticeSessionDetailsContainer', () => {
  it('reads the session id from the route and renders the detail page', () => {
    vi.mocked(useRouteParam).mockReturnValue('sess-1');
    vi.mocked(usePracticeSessionDetails).mockReturnValue(buildPracticeSessionScreenView());

    render(<PracticeSessionDetailsContainer />);

    expect(usePracticeSessionDetails).toHaveBeenCalledWith('sess-1');
    expect(screen.getByTestId(TEST_IDS.practiceSessionPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceSessionDetails)).toBeInTheDocument();
  });

  it('defaults to an empty id when the route has no parameter', () => {
    vi.mocked(useRouteParam).mockReturnValue(null);
    vi.mocked(usePracticeSessionDetails).mockReturnValue(buildPracticeSessionScreenView());

    render(<PracticeSessionDetailsContainer />);

    expect(usePracticeSessionDetails).toHaveBeenCalledWith('');
  });
});
