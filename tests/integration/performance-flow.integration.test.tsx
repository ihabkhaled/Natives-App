import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PerformanceContainer } from '@/modules/assessments/containers/performance.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange } from '../setup/ionic-events.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

function renderPerformance(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/performance']}>
        <Route path="/performance">
          <PerformanceContainer />
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

describe('player performance flow (real client + MSW)', () => {
  it('renders both charts from the published assessments', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceTrendChart, {}, { timeout: 5000 });
    expect(screen.getByTestId(TEST_IDS.performanceRadarChart)).toBeInTheDocument();
  });

  it('gives every chart a tabular alternative and an accessible description', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
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
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceTrendChart, {}, { timeout: 5000 });
    const trend = screen.getByTestId(TEST_IDS.performanceTrendChart);
    const table = within(trend).getByTestId(TEST_IDS.chartDataTable);
    expect(within(table).queryByText('Not evaluated')).not.toBeInTheDocument();
  });

  it('reports an unevaluated period as not evaluated instead of zero', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance();

    await screen.findByTestId(TEST_IDS.performanceTrendChart, {}, { timeout: 5000 });
    fireIonChange(screen.getByTestId(TEST_IDS.performanceMetricSelect), 'metric-attitude');

    await waitFor(() => {
      const trend = screen.getByTestId(TEST_IDS.performanceTrendChart);
      const table = within(trend).getByTestId(TEST_IDS.chartDataTable);
      expect(within(table).getAllByText('Not evaluated').length).toBeGreaterThan(0);
    });
  });

  it('lists the published coach feedback and acknowledges it', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderPerformance();

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
    renderPerformance();

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
