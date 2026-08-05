import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDrillsCatalogueScreenView } from '../../../../tests/factories/drills-catalogue-view.factory';
import { useDrillsCatalogueScreen } from '../hooks/use-drills-catalogue-screen.hook';
import { DrillsCatalogueContainer } from './drills-catalogue.container';

vi.mock('../hooks/use-drills-catalogue-screen.hook', () => ({
  useDrillsCatalogueScreen: vi.fn(),
}));

describe('DrillsCatalogueContainer', () => {
  it('renders the screen the hook produces', () => {
    vi.mocked(useDrillsCatalogueScreen).mockReturnValue(buildDrillsCatalogueScreenView());

    render(<DrillsCatalogueContainer />);

    expect(screen.getByTestId(TEST_IDS.drillsPage)).toBeInTheDocument();
  });
});
