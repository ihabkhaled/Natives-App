import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRouteParam } from '@/packages/router';
import { TEST_IDS } from '@/shared/config';

import { buildRsvpDetailScreenView } from '../../../../tests/factories/practice-rsvp-detail-view.factory';
import { useRsvpDetailScreen } from '../hooks/use-rsvp-detail-screen.hook';
import { PracticeRsvpDetailContainer } from './practice-rsvp-detail.container';

vi.mock('@/packages/router', () => ({ useRouteParam: vi.fn() }));
vi.mock('../hooks/use-rsvp-detail-screen.hook', () => ({ useRsvpDetailScreen: vi.fn() }));

describe('PracticeRsvpDetailContainer', () => {
  it('hands the routed session id to the screen hook', () => {
    vi.mocked(useRouteParam).mockReturnValue('session-7');
    vi.mocked(useRsvpDetailScreen).mockReturnValue(buildRsvpDetailScreenView());

    render(<PracticeRsvpDetailContainer />);

    expect(useRsvpDetailScreen).toHaveBeenCalledWith('session-7');
    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailPage)).toBeInTheDocument();
  });

  /**
   * A route that failed to match must not become a read at
   * `/practice-sessions//rsvps`; the empty id is what the query guards on.
   */
  it('falls back to an empty id when the route did not match', () => {
    vi.mocked(useRouteParam).mockReturnValue(null);
    vi.mocked(useRsvpDetailScreen).mockReturnValue(buildRsvpDetailScreenView());

    render(<PracticeRsvpDetailContainer />);

    expect(useRsvpDetailScreen).toHaveBeenCalledWith('');
  });
});
