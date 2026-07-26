import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AchievementsContainer } from '@/modules/standings/containers/achievements.container';
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

function renderWorkspace(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/achievements']}>
        <Route path="/achievements">
          <AchievementsContainer />
        </Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function openStatus(status: string): Promise<void> {
  await screen.findByTestId(TEST_IDS.achievementsStatusFilter, {}, WAIT);
  fireIonChange(screen.getByTestId(TEST_IDS.achievementsStatusFilter), status);
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('achievements approval flow (real client + MSW)', () => {
  it('lists claims with their status chips for a coach', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.achievementsList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.achievementCard).length).toBeGreaterThan(0);
  });

  it('approves a submitted claim through the confirm dialog', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderWorkspace();

    await openStatus('submitted');
    const card = await screen.findByTestId(TEST_IDS.achievementCard, {}, WAIT);
    fireEvent.click(card);

    const approve = await screen.findByTestId(
      `${TEST_IDS.achievementTransitionAction}-approve`,
      {},
      WAIT,
    );
    fireEvent.click(approve);
    fireEvent.click(await screen.findByTestId(TEST_IDS.achievementTransitionConfirm, {}, WAIT));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.achievementTransitionConfirm)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('records the rejection reason on the terminal reject transition', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.coach);
    renderWorkspace();

    await openStatus('submitted');
    fireEvent.click(await screen.findByTestId(TEST_IDS.achievementCard, {}, WAIT));
    fireEvent.click(
      await screen.findByTestId(`${TEST_IDS.achievementTransitionAction}-reject`, {}, WAIT),
    );

    // The reject confirm collects the optional reason field.
    expect(
      await screen.findByTestId(TEST_IDS.achievementTransitionReason, {}, WAIT),
    ).toBeInTheDocument();
  });

  it('shows the designed forbidden state to a member (no competition.manage)', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWorkspace();

    await screen.findByTestId(TEST_IDS.achievementsForbidden, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.achievementsList)).not.toBeInTheDocument();
  });
});
