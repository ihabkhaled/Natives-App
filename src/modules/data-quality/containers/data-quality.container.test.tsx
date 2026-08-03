import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { useDataQualityScreen } from '../hooks/use-data-quality-screen.hook';
import { DataQualityContainer } from './data-quality.container';

vi.mock('../hooks/use-data-quality-screen.hook', () => ({ useDataQualityScreen: vi.fn() }));

describe('DataQualityContainer', () => {
  it('composes the screen hook with the presentational view', () => {
    vi.mocked(useDataQualityScreen).mockReturnValue({
      path: '/data-quality',
      pageTitle: 'Data quality',
      status: 'empty',
      queueHeading: 'Open anomalies',
      queueIntro: 'Ordered by severity.',
      countLabel: '0 anomalies',
      scanLabel: 'Run a scan',
      isScanning: false,
      onScan: vi.fn(),
      notice: null,
      cards: [],
      previewLabel: 'Preview repair',
      onPreview: vi.fn(),
      onTransition: vi.fn(),
      preview: null,
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
    });

    render(<DataQualityContainer />);

    expect(screen.getByTestId(TEST_IDS.dataQualityView)).toBeInTheDocument();
    expect(screen.getByText('Nothing to review')).toBeInTheDocument();
  });
});
