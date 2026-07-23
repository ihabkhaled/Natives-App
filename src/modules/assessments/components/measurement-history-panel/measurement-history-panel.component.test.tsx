import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';
import { buildMyMeasurementsResponse } from '@/tests/msw/assessments-insights.fixture';

import { buildMeasurementsPanelView } from '../../../../../tests/factories/assessments-view.factory';
import { buildMeasurementsPanel } from '../../helpers/self-insights-view.helper';
import { mapMeasurementHistory } from '../../mappers/measurements.mapper';
import { measurementHistoryResponseSchema } from '../../schemas/measurements.schema';
import { MeasurementHistoryPanel } from './measurement-history-panel.component';

const t = (key: string, params?: object): string =>
  params === undefined ? key : `${key}|${JSON.stringify(params)}`;

describe('MeasurementHistoryPanel', () => {
  it('renders one protocol card with its chart and tabular twin', () => {
    const view = buildMeasurementsPanel({
      t,
      locale: 'en',
      history: mapMeasurementHistory(
        measurementHistoryResponseSchema.parse(buildMyMeasurementsResponse()),
      ),
      isLoading: false,
      error: null,
    });
    render(<MeasurementHistoryPanel view={view} />);

    expect(screen.getByTestId(TEST_IDS.measurementProtocolCard)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.performanceTrendChart)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.chartDataTable)).toBeInTheDocument();
  });

  it('omits the range line when a protocol has a single dated attempt', () => {
    const view = buildMeasurementsPanel({
      t,
      locale: 'en',
      history: mapMeasurementHistory(
        measurementHistoryResponseSchema.parse(buildMyMeasurementsResponse()),
      ),
      isLoading: false,
      error: null,
    });
    const stripped = {
      ...view,
      protocols: view.protocols.map((protocol) => ({ ...protocol, rangeLabel: null })),
    };
    render(<MeasurementHistoryPanel view={stripped} />);

    expect(screen.getByTestId(TEST_IDS.measurementProtocolCard)).toBeInTheDocument();
  });

  it('states the honest empty truth until staff capture ships', () => {
    render(<MeasurementHistoryPanel view={buildMeasurementsPanelView()} />);

    expect(screen.getByText('No measurements recorded yet')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.measurementProtocolCard)).not.toBeInTheDocument();
  });

  it('shows a skeleton while loading and a calm failure line on error', () => {
    const { unmount } = render(
      <MeasurementHistoryPanel view={buildMeasurementsPanelView({ isLoading: true })} />,
    );
    expect(screen.queryByText('No measurements recorded yet')).not.toBeInTheDocument();
    unmount();

    render(
      <MeasurementHistoryPanel
        view={buildMeasurementsPanelView({ unavailableMessage: 'Could not load.' })}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Could not load.');
  });
});
