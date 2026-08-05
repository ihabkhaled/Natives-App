import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDrillsCatalogueScreenView } from '../../../../../tests/factories/drills-catalogue-view.factory';
import { fireIonChange, fireIonInput } from '../../../../../tests/setup/ionic-events.helper';
import { DrillsCatalogueView } from './drills-catalogue-view.component';

describe('DrillsCatalogueView', () => {
  it('lists one card per drill when the screen is ready', () => {
    render(<DrillsCatalogueView {...buildDrillsCatalogueScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.drillsList)).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.drillCard)).toHaveLength(2);
    expect(screen.getByText('Showing 2 of 2')).toBeInTheDocument();
  });

  it('renders both an active and an archived drill card, distinguishably', () => {
    render(<DrillsCatalogueView {...buildDrillsCatalogueScreenView()} />);

    expect(screen.getByText('Give-and-go break')).toBeInTheDocument();
    expect(screen.getByText('Zone breakdown')).toBeInTheDocument();
  });

  it('shows a loading state instead of the list', () => {
    render(<DrillsCatalogueView {...buildDrillsCatalogueScreenView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.drillsLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.drillsList)).not.toBeInTheDocument();
  });

  it('shows the designed empty state for a catalogue with nothing in it', () => {
    render(
      <DrillsCatalogueView {...buildDrillsCatalogueScreenView({ status: 'empty', items: [] })} />,
    );

    expect(screen.getByTestId(TEST_IDS.drillsEmpty)).toBeInTheDocument();
  });

  it('shows the no-matches state distinctly from empty when a filter excludes everything', () => {
    render(
      <DrillsCatalogueView {...buildDrillsCatalogueScreenView({ hasMatches: false, items: [] })} />,
    );

    expect(screen.getByText('No drills match')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.drillsEmpty)).not.toBeInTheDocument();
  });

  it('offers a retry from the designed error state', () => {
    const view = buildDrillsCatalogueScreenView({ status: 'error' });
    render(<DrillsCatalogueView {...view} />);

    fireEvent.click(screen.getByText('Retry'));

    expect(view.onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the forbidden state for a principal without the grant', () => {
    render(<DrillsCatalogueView {...buildDrillsCatalogueScreenView({ status: 'forbidden' })} />);

    expect(screen.getByTestId(TEST_IDS.drillsForbidden)).toBeInTheDocument();
  });

  it('emits a search change', () => {
    const onSearchChange = vi.fn();
    render(<DrillsCatalogueView {...buildDrillsCatalogueScreenView({ onSearchChange })} />);

    fireIonInput(screen.getByTestId(TEST_IDS.drillsSearch), 'zone');

    expect(onSearchChange).toHaveBeenCalledWith('zone');
  });

  it('emits category and status filter changes', () => {
    const onCategoryFilterChange = vi.fn();
    const onStatusFilterChange = vi.fn();
    render(
      <DrillsCatalogueView
        {...buildDrillsCatalogueScreenView({ onCategoryFilterChange, onStatusFilterChange })}
      />,
    );

    fireIonChange(screen.getByTestId(TEST_IDS.drillsCategoryFilter), 'throwing');
    fireIonChange(screen.getByTestId(TEST_IDS.drillsStatusFilter), 'archived');

    expect(onCategoryFilterChange).toHaveBeenCalledWith('throwing');
    expect(onStatusFilterChange).toHaveBeenCalledWith('archived');
  });

  it('opens the new-drill flow', () => {
    const onNewDrill = vi.fn();
    render(<DrillsCatalogueView {...buildDrillsCatalogueScreenView({ onNewDrill })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.drillsNewButton));

    expect(onNewDrill).toHaveBeenCalledTimes(1);
  });

  it('opens a drill from its card', () => {
    const onOpen = vi.fn();
    render(<DrillsCatalogueView {...buildDrillsCatalogueScreenView({ onOpen })} />);

    fireEvent.click(screen.getByRole('button', { name: 'Give-and-go break' }));

    expect(onOpen).toHaveBeenCalledWith('d1');
  });
});
