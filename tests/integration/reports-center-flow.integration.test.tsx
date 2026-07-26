import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ReportsContainer } from '@/modules/reports/containers/reports.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 6000 };

function renderReports(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/reports']}>
        <Route path="/reports">
          <ReportsContainer />
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

describe('reports center flow (real client + MSW)', () => {
  it('lists jobs with a request panel for a report.generate holder', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.analyst);
    renderReports();

    await screen.findByTestId(TEST_IDS.reportJobList, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.reportRequestPanel)).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.reportJobRow).length).toBeGreaterThan(0);
  });

  it('advances a requested job through the state machine to a downloadable state', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.analyst);
    renderReports();

    await screen.findByTestId(TEST_IDS.reportRequestSubmit, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.reportRequestSubmit));

    // The fixture advances queued → running → completed across successive list
    // reads; the poll (or a refresh) drives it to a completed, downloadable row.
    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.reportDownloadButton).length).toBeGreaterThan(0);
    }, WAIT);
  });

  it('offers retry with the remaining attempts on a failed job', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.analyst);
    renderReports();

    const retry = await screen.findByTestId(TEST_IDS.reportRetryButton, {}, WAIT);
    expect(retry).toHaveTextContent('Retry');
  });

  it('shows the designed forbidden state to a member without report.read', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderReports();

    await screen.findByTestId(TEST_IDS.reportsForbidden, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.reportJobList)).not.toBeInTheDocument();
  });
});
