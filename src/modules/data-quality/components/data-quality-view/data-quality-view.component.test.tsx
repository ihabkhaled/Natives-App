import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAnomalyCardView,
  buildRepairPreviewView,
} from '../../../../../tests/factories/data-quality-view.factory';
import type { DataQualityViewProps } from './data-quality-view.types';
import { DataQualityView } from './data-quality-view.component';

function props(overrides: Partial<DataQualityViewProps> = {}): DataQualityViewProps {
  return {
    path: '/data-quality',
    pageTitle: 'Data quality',
    status: 'ready',
    queueHeading: 'Open anomalies',
    queueIntro: 'Ordered by severity.',
    countLabel: '3 anomalies',
    scanLabel: 'Run a scan',
    isScanning: false,
    onScan: vi.fn(),
    notice: null,
    previewLabel: 'Preview repair',
    onPreview: vi.fn(),
    onTransition: vi.fn(),
    preview: null,
    cards: [buildAnomalyCardView()],
    loadingLabel: 'Loading…',
    errorTitle: 'Error',
    errorMessage: 'Error',
    retryLabel: 'Retry',
    onRetry: vi.fn(),
    offlineTitle: 'Offline',
    offlineMessage: 'Offline',
    forbiddenTitle: 'Forbidden',
    forbiddenMessage: 'Forbidden',
    emptyTitle: 'Nothing to review',
    emptyMessage: 'No anomaly is open.',
    offlineNoticeLabel: 'Offline',
    isOffline: false,
    ...overrides,
  };
}

describe('DataQualityView', () => {
  it('lists the queue with its count once ready', () => {
    render(<DataQualityView {...props()} />);

    expect(screen.getByText('3 anomalies')).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.dataQualityAnomalyCard}-a1`)).toBeInTheDocument();
  });

  it('renders no queue while the screen is not ready', () => {
    render(<DataQualityView {...props({ status: 'empty' })} />);

    expect(screen.queryByText('3 anomalies')).not.toBeInTheDocument();
    expect(screen.getByText('Nothing to review')).toBeInTheDocument();
  });

  it('runs a scan on request and blocks a second one while it runs', () => {
    const view = props();
    const { rerender } = render(<DataQualityView {...view} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.dataQualityScanButton));
    expect(view.onScan).toHaveBeenCalledOnce();

    rerender(<DataQualityView {...props({ isScanning: true, scanLabel: 'Scanning…' })} />);
    expect(screen.getByText('Scanning…')).toBeInTheDocument();
  });

  it('announces a failure notice as a status message', () => {
    render(<DataQualityView {...props({ notice: 'That action did not complete.' })} />);

    expect(screen.getByRole('status')).toHaveTextContent('That action did not complete.');
  });

  it('shows the repair preview only when one is open', () => {
    const { rerender } = render(<DataQualityView {...props()} />);
    expect(screen.queryByTestId(TEST_IDS.dataQualityPreviewPanel)).not.toBeInTheDocument();

    rerender(
      <DataQualityView
        {...props({
          preview: buildRepairPreviewView(),
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.dataQualityPreviewPanel)).toBeInTheDocument();
  });
});
