import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDrillDetailScreenView } from '../../../../../tests/factories/drill-detail-view.factory';
import { DrillDetailView } from './drill-detail-view.component';

describe('DrillDetailView', () => {
  it('renders the status chip and the form once ready', () => {
    render(<DrillDetailView {...buildDrillDetailScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.drillStatusChip)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillForm)).toBeInTheDocument();
  });

  it('offers the archive action for an active drill', () => {
    const onArchive = vi.fn();
    render(
      <DrillDetailView
        {...buildDrillDetailScreenView({
          lifecycle: {
            visible: true,
            notice: null,
            actionLabel: 'Archive drill',
            isBusy: false,
            onArchive,
          },
        })}
      />,
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.drillArchiveButton));

    expect(onArchive).toHaveBeenCalledTimes(1);
  });

  it('replaces the archive action with a plain notice for an archived drill', () => {
    render(
      <DrillDetailView
        {...buildDrillDetailScreenView({
          statusLabel: 'Archived',
          statusTone: 'medium',
          lifecycle: {
            visible: false,
            notice:
              'This drill is archived. It stays here because past agendas still reference it.',
            actionLabel: 'Archive drill',
            isBusy: false,
            onArchive: vi.fn(),
          },
        })}
      />,
    );

    expect(screen.queryByTestId(TEST_IDS.drillArchiveButton)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillArchivedNotice)).toHaveTextContent('archived');
  });

  it('falls back to a medium tone if a status label ever arrives without one', () => {
    render(<DrillDetailView {...buildDrillDetailScreenView({ statusTone: null })} />);

    expect(screen.getByTestId(TEST_IDS.drillStatusChip)).toBeInTheDocument();
  });

  it('renders no status chip and no lifecycle in create mode', () => {
    render(
      <DrillDetailView
        {...buildDrillDetailScreenView({
          statusLabel: null,
          statusTone: null,
          lifecycle: {
            visible: false,
            notice: null,
            actionLabel: '',
            isBusy: false,
            onArchive: vi.fn(),
          },
        })}
      />,
    );

    expect(screen.queryByTestId(TEST_IDS.drillStatusChip)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.drillArchiveButton)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.drillArchivedNotice)).not.toBeInTheDocument();
  });

  it('navigates back', () => {
    const onBack = vi.fn();
    render(<DrillDetailView {...buildDrillDetailScreenView({ onBack })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.drillDetailBack));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state instead of the form', () => {
    render(<DrillDetailView {...buildDrillDetailScreenView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.drillDetailLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.drillForm)).not.toBeInTheDocument();
  });

  it('shows the forbidden state for a principal without the grant', () => {
    render(<DrillDetailView {...buildDrillDetailScreenView({ status: 'forbidden' })} />);

    expect(screen.getByTestId(TEST_IDS.drillDetailForbidden)).toBeInTheDocument();
  });

  it('offers a retry from the designed error state', () => {
    const view = buildDrillDetailScreenView({ status: 'error' });
    render(<DrillDetailView {...view} />);

    fireEvent.click(screen.getByText('Retry'));

    expect(view.onRetry).toHaveBeenCalledTimes(1);
  });
});
