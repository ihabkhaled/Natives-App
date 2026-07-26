import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TeamAnalyticsContainer } from '@/modules/analytics/containers/team-analytics.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import { fireIonChange } from '../setup/ionic-events.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 6000 };

function renderAnalytics(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/analytics']}>
        <Route path="/analytics">
          <TeamAnalyticsContainer />
        </Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('team analytics flow (real client + MSW)', () => {
  it('renders the governed series chart with its accessible data table', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderAnalytics();

    const chart = await screen.findByTestId(TEST_IDS.analyticsSeriesChart, {}, WAIT);
    expect(within(chart).getByRole('img')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.chartDataTable)).toBeInTheDocument();
  });

  it('breaks the line on a null period and says so', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderAnalytics();

    await screen.findByTestId(TEST_IDS.analyticsSeriesChart, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.analyticsGapNotice)).toBeInTheDocument();
  });

  it('suppresses the cohort comparison below the privacy threshold', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.analyst);
    renderAnalytics();

    await screen.findByTestId(TEST_IDS.analyticsCohortPanel, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.analyticsCohortPeriodSelect), '2026-02');

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.analyticsCohortSuppressed)).toBeInTheDocument();
    }, WAIT);
    expect(screen.queryByTestId(TEST_IDS.analyticsCohortTiles)).not.toBeInTheDocument();
  });

  it('offers the rebuild button to a data-quality holder only', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.teamAdmin);
    renderAnalytics();

    await screen.findByTestId(TEST_IDS.analyticsFreshnessCard, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.analyticsRebuildOpen)).toBeInTheDocument();
  });

  it('hides the rebuild button from a coach without data-quality manage', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderAnalytics();

    await screen.findByTestId(TEST_IDS.analyticsFreshnessCard, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.analyticsRebuildOpen)).not.toBeInTheDocument();
  });
});
