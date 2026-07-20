import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MemberProfileContainer } from '@/modules/members/containers/member-profile.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { fireIonInput } from '../setup/ionic-events.helper';
import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

function renderProfile(membershipId: string): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[`/members/${membershipId}`]}>
        <Route path="/members/:membershipId">
          <MemberProfileContainer />
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

describe('member profile flow (real client + MSW)', () => {
  it('shows an admin the full profile and lets them manage aliases and roles', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderProfile('mem-omar');

    await screen.findByTestId(TEST_IDS.memberProfileView, {}, { timeout: 5000 });
    expect(await screen.findByText('omar@example.com')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberLifecyclePanel)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberHistoryPanel)).toBeInTheDocument();

    fireIonInput(screen.getByTestId(TEST_IDS.memberAliasInput), 'Speedy');
    fireEvent.click(screen.getByTestId(TEST_IDS.memberAliasAdd));
    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.memberAliasItem).length).toBeGreaterThan(1);
    });
    fireEvent.click(screen.getAllByTestId(TEST_IDS.memberAliasRemove)[0]!);
    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.memberAliasItem)).toHaveLength(1);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Coach' }));
    fireEvent.click(screen.getByText('Save roles'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Coach' })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('lets a self viewer edit their profile and upload an avatar', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderProfile('mem-admin');

    await screen.findByTestId(TEST_IDS.memberSelfEditOpen, {}, { timeout: 5000 });
    fireEvent.click(screen.getByTestId(TEST_IDS.memberAvatarUpload));
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.memberAvatarImage)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(TEST_IDS.memberSelfEditOpen));
    fireIonInput(screen.getByTestId(TEST_IDS.memberSelfEditFullName), 'Ranger Prime');
    fireEvent.click(screen.getByTestId(TEST_IDS.memberSelfEditSubmit));
    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.memberSelfEditForm)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId(TEST_IDS.memberProfileBack));
  });

  it('lets a member self viewer edit their own profile', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderProfile('mem-omar');

    await screen.findByTestId(TEST_IDS.memberSelfEditOpen, {}, { timeout: 5000 });
    expect(screen.queryByTestId(TEST_IDS.memberLifecyclePanel)).not.toBeInTheDocument();
  });

  it('tiers a teammate view and hides admin panels for a member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderProfile('mem-nadia');

    await screen.findByTestId(TEST_IDS.memberProfileView, {}, { timeout: 5000 });
    expect(screen.queryByTestId(TEST_IDS.memberLifecyclePanel)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.memberRolesPanel)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.memberSelfEditOpen)).not.toBeInTheDocument();
  });
});
