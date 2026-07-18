import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PracticeSessionDetailsContainer } from '@/modules/practice/containers/practice-session-details.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

function renderDetail(sessionId: string): ReactElement {
  const element = (
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[`/practices/${sessionId}`]}>
        <Route path="/practices/:sessionId">
          <PracticeSessionDetailsContainer />
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  );
  render(element);
  return element;
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('practice RSVP flow (real client + MSW)', () => {
  it('optimistically records a Going response from a deep link', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);

    renderDetail('sess-evening');

    const control = await screen.findByTestId(TEST_IDS.rsvpControl, {}, { timeout: 5000 });
    expect(control).toHaveTextContent('No response yet');

    fireEvent.click(screen.getByTestId(TEST_IDS.rsvpGoingButton));

    await waitFor(
      () => {
        expect(screen.queryByText('No response yet')).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('rolls back and surfaces a conflict notice on a version clash', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);

    renderDetail('sess-conflict');

    const control = await screen.findByTestId(TEST_IDS.rsvpControl, {}, { timeout: 5000 });
    fireEvent.click(screen.getByTestId(TEST_IDS.rsvpGoingButton));

    await waitFor(
      () => {
        expect(screen.getByTestId(TEST_IDS.rsvpConflictNote)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(control).toHaveTextContent('No response yet');
  });

  it('shows the RSVP as closed after the deadline has passed', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);

    renderDetail('sess-throwing');

    await screen.findByTestId(TEST_IDS.rsvpControl, {}, { timeout: 5000 });
    expect(screen.getByTestId(TEST_IDS.rsvpDeadlineNote)).toHaveTextContent('deadline has passed');
    expect(screen.queryByTestId(TEST_IDS.rsvpReasonSelect)).not.toBeInTheDocument();
  });
});
