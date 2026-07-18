import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDashboardView } from '../../../../tests/factories/dashboard-view.factory';
import { useDashboard } from '../hooks/use-dashboard.hook';
import { DashboardContainer } from './dashboard.container';

vi.mock('../hooks/use-dashboard.hook', () => ({ useDashboard: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('DashboardContainer', () => {
  it('renders the dashboard view from the prepared view model', () => {
    vi.mocked(useDashboard).mockReturnValue(
      buildDashboardView({ title: 'Administrator dashboard' }),
    );

    render(<DashboardContainer />);

    expect(screen.getByTestId(TEST_IDS.dashboardView)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Administrator dashboard' })).toBeInTheDocument();
  });
});
