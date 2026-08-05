import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDrillDetailScreenView } from '../../../../tests/factories/drill-detail-view.factory';
import { useDrillDetailScreen } from '../hooks/use-drill-detail-screen.hook';
import { DrillDetailContainer } from './drill-detail.container';

vi.mock('../hooks/use-drill-detail-screen.hook', () => ({
  useDrillDetailScreen: vi.fn(),
}));

describe('DrillDetailContainer', () => {
  it('renders the screen the hook produces', () => {
    vi.mocked(useDrillDetailScreen).mockReturnValue(buildDrillDetailScreenView());

    render(<DrillDetailContainer />);

    expect(screen.getByTestId(TEST_IDS.drillDetailPage)).toBeInTheDocument();
  });
});
