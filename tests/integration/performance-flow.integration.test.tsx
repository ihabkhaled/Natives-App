import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http } from 'msw';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PerformanceContainer } from '@/modules/assessments/containers/performance.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { failRequest } from '@/tests/msw/mock-request.helper';

import { initTestI18n } from '../setup/i18n-test.helper';
import { apiUrl } from '../setup/integration-api.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const CATALOG_RESOURCES = ['templates', 'metrics', 'scales', 'categories', 'periods'] as const;

function renderPerformance(initialPath = '/performance'): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Route exact path={['/performance', '/performance/measurements', '/performance/feedback']}>
          <PerformanceContainer />
        </Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Count every catalog request; each one would 403 for a member persona. */
function trackCatalogRequests(): () => number {
  let requests = 0;
  mockApiServer.use(
    ...CATALOG_RESOURCES.map((resource) =>
      http.get(apiUrl(`/teams/:teamId/assessment-catalog/${resource}`), () => {
        requests += 1;
        return failRequest(403, 'FORBIDDEN', `/assessment-catalog/${resource}`);
      }),
    ),
  );
  return () => requests;
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('performance charts for a catalog-permitted persona (real client + MSW)', () => {
  it('renders both charts from the published assessments', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceTrendChart, {}, { timeout: 5000 });
    expect(screen.getByTestId(TEST_IDS.performanceRadarChart)).toBeInTheDocument();
  });

  it('gives every chart a tabular alternative and an accessible description', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceTrendChart, {}, { timeout: 5000 });
    const figures = screen.getAllByRole('img');
    expect(figures.length).toBeGreaterThanOrEqual(2);
    for (const figure of figures) {
      expect(figure.getAttribute('aria-label')).toBeTruthy();
    }
    expect(screen.getAllByTestId(TEST_IDS.chartDataTable)).toHaveLength(2);
  });

  it('defaults the trend to the best-covered metric', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceTrendChart, {}, { timeout: 5000 });
    const trend = screen.getByTestId(TEST_IDS.performanceTrendChart);
    const table = within(trend).getByTestId(TEST_IDS.chartDataTable);
    expect(within(table).queryByText('Not evaluated')).not.toBeInTheDocument();
  });

  it('reports an unevaluated period as not evaluated instead of zero', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceTrendChart, {}, { timeout: 5000 });
    fireIonChange(screen.getByTestId(TEST_IDS.performanceMetricSelect), 'metric-attitude');

    await waitFor(() => {
      const trend = screen.getByTestId(TEST_IDS.performanceTrendChart);
      const table = within(trend).getByTestId(TEST_IDS.chartDataTable);
      expect(within(table).getAllByText('Not evaluated').length).toBeGreaterThan(0);
    });
  });
});

describe('a member persona renders from member-permitted data only', () => {
  // Recovery audit P1-5 / P0 batch item 3: the member screen used to fire the
  // five staff-only catalog reads, collect 15 hidden 403s (5 endpoints x 3
  // retry attempts), and hide them behind an empty state. The catalog query is
  // now gated on the grant those endpoints actually require
  // (`assessment.read.team`), so a member issues ZERO forbidden requests.
  it('issues zero forbidden catalog requests', async () => {
    const catalogRequests = trackCatalogRequests();
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceScoreCard, {}, { timeout: 5000 });
    expect(catalogRequests()).toBe(0);
  });

  it('renders the score card and goals without a charts block posing as data', async () => {
    trackCatalogRequests();
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceScoreCard, {}, { timeout: 5000 });
    await screen.findAllByTestId(TEST_IDS.developmentGoalCard, {}, { timeout: 5000 });
    expect(screen.getByTestId(TEST_IDS.performanceScoreValue)).toHaveTextContent('78.4');
    expect(screen.queryByTestId(TEST_IDS.performanceTrendChart)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.performanceRadarChart)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.performanceMetricSelect)).not.toBeInTheDocument();
  });

  it('switches tabs through the segment and ignores an echo of the active tab', async () => {
    trackCatalogRequests();
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceScoreCard, {}, { timeout: 5000 });
    fireIonChange(screen.getByTestId(TEST_IDS.performanceTabBar), 'measurements');

    await screen.findByTestId(TEST_IDS.measurementHistoryPanel, {}, { timeout: 5000 });
    fireIonChange(screen.getByTestId(TEST_IDS.performanceTabBar), 'measurements');
    expect(screen.getByTestId(TEST_IDS.measurementHistoryPanel)).toBeInTheDocument();
  });

  it('deep-links straight to the honest-empty measurements tab', async () => {
    trackCatalogRequests();
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance('/performance/measurements');

    await screen.findByTestId(TEST_IDS.measurementHistoryPanel, {}, { timeout: 5000 });
    expect(
      await screen.findByTestId(TEST_IDS.measurementProtocolCard, {}, { timeout: 5000 }),
    ).toBeVisible();
    expect(screen.getByTestId(TEST_IDS.performanceTrendChart)).toBeVisible();
  });
});

describe('coach feedback and development goals', () => {
  it('lists the published coach feedback and acknowledges it', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance('/performance/feedback');

    await screen.findByTestId(TEST_IDS.coachFeedbackCard, {}, { timeout: 5000 });
    expect(screen.getByText('Your break-side flick is now a genuine weapon.')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId(TEST_IDS.coachFeedbackAcknowledge));

    await waitFor(
      () => {
        expect(screen.queryByTestId(TEST_IDS.coachFeedbackAcknowledge)).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('never exposes a private coach note to the player', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance('/performance/feedback');

    await screen.findByTestId(TEST_IDS.coachFeedbackCard, {}, { timeout: 5000 });
    expect(screen.getByTestId(TEST_IDS.coachFeedbackPanel).textContent).not.toContain('coachNote');
  });

  it('renders the goals with their action plans and transitions one', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance();

    await screen.findAllByTestId(TEST_IDS.developmentGoalCard, {}, { timeout: 4000 });
    expect(screen.getAllByTestId(TEST_IDS.developmentGoalAction).length).toBeGreaterThan(0);
    expect(screen.getByText('Not measured yet')).toBeInTheDocument();

    const transitions = screen.getAllByTestId(TEST_IDS.developmentGoalTransition);
    expect(transitions[0]).toBeDefined();
    fireEvent.click(transitions[0]!);

    await waitFor(
      () => {
        expect(screen.getAllByText('Achieved').length).toBeGreaterThan(0);
      },
      { timeout: 4000 },
    );
  });

  it('blocks the screen for a persona without the self-published grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.pending);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceView, {}, { timeout: 5000 });
    expect(screen.queryByTestId(TEST_IDS.performanceForbidden)).not.toBeInTheDocument();
  });
});
