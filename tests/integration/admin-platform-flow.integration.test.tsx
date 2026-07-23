import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AdminPlatformContainer } from '@/modules/admin/containers/admin-platform.container';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { registerIntegrationSession } from '../setup/integration-api.helper';
import { fireIonInput } from '../setup/ionic-events.helper';
import { signInAs } from '../setup/integration-session.helper';
import { renderRoute } from '../setup/render-with-providers.helper';

/**
 * Ionic presents confirmations in an overlay jsdom cannot drive. Only the
 * confirmation is stubbed; the hook, services, gateway, and MSW handlers —
 * including the last-admin 409 — all run for real.
 */
vi.mock('@/shared/ui', async (importOriginal) => {
  const { withConfirmStub } = await import('../setup/confirm-alert-stub.helper');
  const sharedUi = await importOriginal<Record<string, unknown>>();
  return withConfirmStub(sharedUi);
});

const WAIT = { timeout: 5000 };

async function openPlatformPanel(email: string): Promise<void> {
  await signInAs(email);
  renderRoute(APP_PATHS.adminPlatform, APP_PATHS.adminPlatform, <AdminPlatformContainer />);
}

registerIntegrationSession();

describe('platform super-admin management (real client + MSW)', () => {
  it('lists the current super administrators for a platform administrator', async () => {
    await openPlatformPanel(MOCK_PERSONA_EMAILS.admin);

    await screen.findByTestId(TEST_IDS.adminPlatformRoster, {}, WAIT);
    const rows = screen.getAllByTestId(TEST_IDS.adminPlatformRow);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('Ranger One');
    expect(rows[0]).toHaveTextContent('Seeded at platform setup');
  });

  it('shows the designed forbidden state to a TEAM administrator', async () => {
    // platform.admin is only ever a global grant; a team admin holds every
    // team power and still cannot see, let alone change, this roster.
    await openPlatformPanel(MOCK_PERSONA_EMAILS.teamAdmin);

    await screen.findByTestId(TEST_IDS.adminPlatformForbidden, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.adminPlatformRoster)).not.toBeInTheDocument();
  });

  it('promotes a user with a mandatory audited reason and updates the list', async () => {
    await openPlatformPanel(MOCK_PERSONA_EMAILS.admin);
    await screen.findByTestId(TEST_IDS.adminPlatformPromotePanel, {}, WAIT);

    fireIonInput(screen.getByTestId(TEST_IDS.adminPlatformUserId), 'user-team-admin');
    fireIonInput(screen.getByTestId(TEST_IDS.adminPlatformReason), 'Succession planning cover');
    fireEvent.click(screen.getByTestId(TEST_IDS.adminPlatformPromote));

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.adminPlatformRow)).toHaveLength(2);
    }, WAIT);
    expect(screen.getByText('Team Admin Tarek')).toBeInTheDocument();
  });

  it('refuses to remove the LAST super administrator (backend 409 safeguard)', async () => {
    await openPlatformPanel(MOCK_PERSONA_EMAILS.admin);
    await screen.findByTestId(TEST_IDS.adminPlatformRoster, {}, WAIT);

    const row = screen.getByTestId(TEST_IDS.adminPlatformRow);
    fireEvent.click(within(row).getByTestId(TEST_IDS.adminPlatformRevoke));

    // The refusal leaves the roster intact: the platform can never end up
    // without a super administrator through this screen.
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminPlatformRevoke)).toHaveProperty('disabled', false);
    }, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.adminPlatformRow)).toHaveLength(1);
    expect(screen.getByText('Ranger One')).toBeInTheDocument();
  });

  it('revokes a non-last administrator after promotion', async () => {
    await openPlatformPanel(MOCK_PERSONA_EMAILS.admin);
    await screen.findByTestId(TEST_IDS.adminPlatformPromotePanel, {}, WAIT);

    fireIonInput(screen.getByTestId(TEST_IDS.adminPlatformUserId), 'user-coach');
    fireIonInput(screen.getByTestId(TEST_IDS.adminPlatformReason), 'Temporary platform cover');
    fireEvent.click(screen.getByTestId(TEST_IDS.adminPlatformPromote));
    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.adminPlatformRow)).toHaveLength(2);
    }, WAIT);

    const coachRow = screen
      .getAllByTestId(TEST_IDS.adminPlatformRow)
      .find((row) => row.textContent.includes('Coach Nadia'));
    expect(coachRow).toBeDefined();
    fireEvent.click(within(coachRow!).getByTestId(TEST_IDS.adminPlatformRevoke));

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.adminPlatformRow)).toHaveLength(1);
    }, WAIT);
  });
});
