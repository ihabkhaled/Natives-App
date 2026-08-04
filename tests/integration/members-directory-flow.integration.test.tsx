import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MembersDirectoryContainer } from '@/modules/members/containers/members-directory.container';
import { TEST_IDS } from '@/shared/config';
import { readInviteLinkage } from '@/tests/msw/members.fixture';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { fireIonInput } from '../setup/ionic-events.helper';
import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

function renderDirectory(): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/members']}>
        <Route path="/members">
          <MembersDirectoryContainer />
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

describe('members directory flow (real client + MSW)', () => {
  it('loads the roster and filters it by search', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderDirectory();

    await screen.findByTestId(TEST_IDS.membersList, {}, { timeout: 5000 });
    expect(screen.getByText(/8 of 8 members/i)).toBeInTheDocument();

    fireIonInput(screen.getByTestId(TEST_IDS.membersSearch), 'omar');
    await waitFor(() => {
      expect(screen.getByText(/1 of 8 members/i)).toBeInTheDocument();
    });
  });

  it('invites a real person: account invitation, roster record, and the link', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderDirectory();

    await screen.findByTestId(TEST_IDS.membersInviteButton, {}, { timeout: 5000 });
    fireEvent.click(screen.getByTestId(TEST_IDS.membersInviteButton));

    fireIonInput(screen.getByTestId(TEST_IDS.memberInviteEmail), 'recruit@example.com');
    fireIonInput(screen.getByTestId(TEST_IDS.memberInviteFullName), 'New Recruit');
    fireEvent.click(screen.getByTestId(TEST_IDS.memberInviteSubmit));

    // The form gives way to the receipt: the account invitation AND the roster
    // record both exist, and the one-time accept link is the manual fallback.
    await waitFor(
      () => {
        expect(screen.queryByTestId(TEST_IDS.memberInviteForm)).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByTestId(TEST_IDS.memberInviteSent)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberInviteLink)).toHaveTextContent(
      'accept-invitation?token=mock-invitation-token-0123456789',
    );
    // Invite → receipt: the team and the granted role are stated back.
    expect(screen.getByTestId(TEST_IDS.memberInviteSentTeam)).toHaveTextContent('Cairo Natives');
    expect(screen.getByTestId(TEST_IDS.memberInviteSentRole)).toHaveTextContent('Member');
    expect(await screen.findByText(/of 9 members/i)).toBeInTheDocument();
  });

  /**
   * The P0 integration guard. Inviting writes two records through two
   * requests, and acceptance links them by matching the invitation's email
   * against the membership profile's. If the roster request omits the address
   * — or sends a differently-cased one — acceptance claims nothing: the
   * invitee ends up with an active account, an orphaned `invited` membership,
   * no team context, no role assignment, and navigation collapsed to the
   * permission-free destinations.
   */
  it('sends the same team and email to the invitation AND the roster record', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderDirectory();

    await screen.findByTestId(TEST_IDS.membersInviteButton, {}, { timeout: 5000 });
    fireEvent.click(screen.getByTestId(TEST_IDS.membersInviteButton));
    fireIonInput(screen.getByTestId(TEST_IDS.memberInviteEmail), '  Recruit@Example.COM  ');
    fireIonInput(screen.getByTestId(TEST_IDS.memberInviteFullName), 'New Recruit');
    fireEvent.click(screen.getByTestId(TEST_IDS.memberInviteSubmit));

    await waitFor(
      () => {
        expect(readInviteLinkage().membership).not.toBeNull();
      },
      { timeout: 5000 },
    );
    const linkage = readInviteLinkage();
    expect(linkage.membership?.email).toBe(linkage.invitation?.email);
    expect(linkage.membership?.teamId).toBe(linkage.invitation?.teamId);
    // Normalized once, by the invite service, so padding and casing typed into
    // the form cannot split the pair.
    expect(linkage.membership?.email).toBe('recruit@example.com');
  });

  it('feeds the role select from the server catalog and enables it once loaded', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderDirectory();

    await screen.findByTestId(TEST_IDS.membersInviteButton, {}, { timeout: 5000 });
    fireEvent.click(screen.getByTestId(TEST_IDS.membersInviteButton));

    // While the assignable-roles query is in flight the select is disabled
    // with an inline note; once the catalog lands the select opens up.
    await waitFor(
      () => {
        expect(screen.queryByTestId(TEST_IDS.memberInviteRoleNotice)).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByTestId(TEST_IDS.memberInviteRole)).toHaveProperty('disabled', false);
  });

  it('hides the invite affordance for a member persona', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderDirectory();

    await screen.findByTestId(TEST_IDS.membersList, {}, { timeout: 5000 });
    expect(screen.queryByTestId(TEST_IDS.membersInviteButton)).not.toBeInTheDocument();
  });
});
