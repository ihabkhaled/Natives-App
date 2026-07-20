import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AssessmentEntryContainer } from '@/modules/assessments/containers/assessment-entry.container';
import { AssessmentsContainer } from '@/modules/assessments/containers/assessments.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_ASSESSMENT_IDS } from '@/tests/msw/assessments-data.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

function renderWorkspace(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/assessments']}>
        <Route path="/assessments">
          <AssessmentsContainer />
        </Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderEntry(assessmentId: string = MOCK_ASSESSMENT_IDS.draft): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[`/assessments/${assessmentId}`]}>
        <Route path="/assessments/:assessmentId">
          <AssessmentEntryContainer />
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

describe('assessment entry flow (real client + MSW)', () => {
  it('lists the team assessments for a coach', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.assessmentsList, {}, { timeout: 5000 });
    expect(screen.getAllByTestId(TEST_IDS.assessmentSummaryCard).length).toBeGreaterThan(0);
  });

  it('blocks the workspace for a persona without the team grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.assessmentsForbidden, {}, { timeout: 5000 });
    expect(screen.queryByTestId(TEST_IDS.assessmentsList)).not.toBeInTheDocument();
  });

  it('renders the template grid and never shows an unevaluated metric as zero', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderEntry();

    await screen.findByTestId(TEST_IDS.assessmentMetricGrid, {}, { timeout: 5000 });
    const fields = screen.getAllByTestId(TEST_IDS.assessmentMetricField);
    const unevaluated = fields.filter((field) => field.getAttribute('data-evaluated') === 'false');
    expect(unevaluated.length).toBeGreaterThan(0);
    for (const field of unevaluated) {
      expect(within(field).getByTestId(TEST_IDS.assessmentMetricValueReadout)).toHaveTextContent(
        'Not evaluated',
      );
    }
  });

  it('counts a scored zero as evaluated in the completeness meter', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderEntry();

    await screen.findByTestId(TEST_IDS.assessmentCompleteness, {}, { timeout: 5000 });
    expect(screen.getByTestId(TEST_IDS.assessmentCompleteness)).toHaveTextContent(
      '3 of 6 metrics evaluated',
    );
  });

  it('clears a score back to not evaluated without writing a zero', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderEntry();

    await screen.findByTestId(TEST_IDS.assessmentMetricGrid, {}, { timeout: 5000 });
    const speed = screen.getAllByTestId(TEST_IDS.assessmentMetricField)[0];
    expect(speed).toBeDefined();
    fireEvent.click(within(speed!).getByTestId(TEST_IDS.assessmentMetricNotEvaluated));

    await waitFor(() => {
      expect(speed).toHaveAttribute('data-evaluated', 'false');
    });
    expect(within(speed!).getByTestId(TEST_IDS.assessmentMetricValueReadout)).toHaveTextContent(
      'Not evaluated',
    );
    expect(screen.getByTestId(TEST_IDS.assessmentCompleteness)).toHaveTextContent(
      '2 of 6 metrics evaluated',
    );
  });

  it('saves the draft and advances the workflow to submitted', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderEntry();

    await screen.findByTestId(TEST_IDS.assessmentSaveDraft, {}, { timeout: 5000 });
    fireEvent.click(screen.getByTestId(TEST_IDS.assessmentSaveDraft));

    await waitFor(
      () => {
        expect(screen.getByTestId(TEST_IDS.assessmentSubmit)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByTestId(TEST_IDS.assessmentSubmit));

    await waitFor(
      () => {
        expect(screen.getByTestId(TEST_IDS.assessmentStartReview)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.queryByTestId(TEST_IDS.assessmentSaveDraft)).not.toBeInTheDocument();
  });

  it('presents a not-found assessment as a designed empty state', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderEntry('asmt-missing');

    await waitFor(
      () => {
        expect(screen.getByText('Assessment not found')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
