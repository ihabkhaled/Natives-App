import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { AdminContainer } from '@/modules/admin/containers/admin.container';
import { AdminSettingsContainer } from '@/modules/admin/containers/admin-settings.container';
import { Route } from '@/packages/router';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { nestErrorResponse } from '@/tests/msw/nest-error.helper';

import {
  apiUrl,
  retryFromErrorState,
  registerIntegrationSession,
} from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { fireIonChange, fireIonInput } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute, renderWithProviders } from '../setup/render-with-providers.helper';

// Ionic presents confirmations in an overlay jsdom cannot drive. Only the
// confirmation is stubbed; the hooks, services, gateway, and the MSW policy
// mirror — including the future-only cancel — all run for real.
vi.mock('@/shared/ui', async (importOriginal) =>
  (await import('../setup/confirm-alert-stub.helper')).withConfirmStub(
    await importOriginal<Record<string, unknown>>(),
  ),
);

const WAIT = { timeout: 5000 };
const FUTURE_WALL_TIME = '2026-09-01T12:00';

async function openSettings(email: string = MOCK_PERSONA_EMAILS.admin): Promise<void> {
  await signInAs(email);
  renderRoute(APP_PATHS.adminSettings, APP_PATHS.adminSettings, <AdminSettingsContainer />);
  await screen.findByTestId(TEST_IDS.adminEffectivePanel, {}, WAIT);
}

function pickSettingKey(settingKey: string): void {
  fireIonChange(screen.getByTestId(TEST_IDS.adminSettingKeySelect), settingKey);
}

/** Choose the future Cairo instant and give the audited reason. */
function fillScheduleEssentials(): void {
  fireIonChange(screen.getByTestId(TEST_IDS.adminVersionEffectiveInput), FUTURE_WALL_TIME);
  fireIonInput(screen.getByTestId(TEST_IDS.adminVersionNote), 'Seasonal tier rework');
}

/** Raise gold to 750, schedule it, and wait for the Scheduled history entry. */
async function scheduleTierChange(): Promise<HTMLElement> {
  pickSettingKey('badge_tiers');
  await screen.findByTestId('admin-editor-row-threshold-2', {}, WAIT);
  fireIonInput(screen.getByTestId('admin-editor-row-threshold-2'), '750');
  fillScheduleEssentials();
  await waitFor(() => {
    expect(screen.getByTestId(TEST_IDS.adminVersionSubmit)).toBeEnabled();
  }, WAIT);
  fireEvent.click(screen.getByTestId(TEST_IDS.adminVersionSubmit));
  await screen.findByText('Scheduled', {}, WAIT);
  return screen.getByTestId(TEST_IDS.adminVersionsPanel);
}

registerIntegrationSession();

describe('the admin hub only advertises what the guard would allow', () => {
  it('shows every surface to a fully granted administrator', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute(APP_PATHS.admin, APP_PATHS.admin, <AdminContainer />);

    const cards = await screen.findAllByTestId(TEST_IDS.adminHubCard, {}, WAIT);
    expect(cards).toHaveLength(5);
    expect(cards[0]).toHaveTextContent('Team settings');
  });

  it('routes to the settings screen from its card', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderWithProviders(
      <>
        <Route path={APP_PATHS.admin} exact>
          <AdminContainer />
        </Route>
        <Route path={APP_PATHS.adminSettings} exact>
          <p data-testid={TEST_IDS.adminSettingsPage}>settings</p>
        </Route>
      </>,
      { initialPath: APP_PATHS.admin },
    );
    const cards = await screen.findAllByTestId(TEST_IDS.adminHubCard, {}, WAIT);

    fireEvent.click(within(cards[0]!).getByText('Open'));

    expect(await screen.findByTestId(TEST_IDS.adminSettingsPage, {}, WAIT)).toBeInTheDocument();
  });
});

describe('the effective panel reads as configuration, never as JSON', () => {
  it('summarizes every key in human copy', async () => {
    await openSettings();

    const panel = screen.getByTestId(TEST_IDS.adminEffectivePanel);
    expect(panel).toHaveTextContent('3 tiers up to 500 pts');
    expect(panel).toHaveTextContent('5 statuses (5 active)');
    expect(panel).not.toHaveTextContent('{');
  });

  it('flags the legacy branding row and the weights coverage issue', async () => {
    await openSettings();

    const panel = screen.getByTestId(TEST_IDS.adminEffectivePanel);
    expect(panel).toHaveTextContent('Legacy value — replace it with a valid configuration');
    expect(panel).toHaveTextContent('No weight for injured.');
  });
});

describe('readable history with diffs', () => {
  it('shows the selected key entries and follows a change of key', async () => {
    await openSettings();
    pickSettingKey('attendance_weights');

    await waitFor(() => {
      expect(
        within(screen.getByTestId(TEST_IDS.adminVersionsPanel)).getByTestId(
          TEST_IDS.adminHistoryEntry,
        ),
      ).toHaveTextContent('No note recorded');
    }, WAIT);
  });

  it('discloses a legacy document read-only and resets the editor on replace', async () => {
    await openSettings();
    pickSettingKey('report_branding');

    const entry = await screen.findByTestId(TEST_IDS.adminHistoryEntry, {}, WAIT);
    expect(entry).toHaveTextContent('Stored before validation existed — never applied.');
    expect(within(entry).getByTestId(TEST_IDS.adminHistoryLegacyRaw)).toHaveTextContent('"logo"');

    fireIonInput(screen.getByTestId('admin-setting-editor-displayName'), 'Old brand');
    fireEvent.click(within(entry).getByTestId(TEST_IDS.adminHistoryReplace));

    await waitFor(() => {
      expect(screen.getByTestId('admin-setting-editor-displayName')).toHaveValue('');
    }, WAIT);
  });
});

describe('scheduling a typed change end to end', () => {
  it('blocks a rule-violating draft with translated issues before the wire', async () => {
    await openSettings();
    pickSettingKey('badge_tiers');
    await screen.findByTestId('admin-editor-row-threshold-1', {}, WAIT);

    fireIonInput(screen.getByTestId('admin-editor-row-threshold-1'), '50');

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionIssue)).toHaveTextContent(
        'Thresholds must rise from tier to tier.',
      );
    }, WAIT);
    expect(screen.getByTestId(TEST_IDS.adminVersionSubmit)).toBeDisabled();
  });

  it(
    'schedules with a Cairo instant, shows the Scheduled diff, then cancels it',
    { timeout: 15_000 },
    async () => {
      await openSettings();
      const panel = await scheduleTierChange();

      expect(panel).toHaveTextContent('gold · threshold');
      expect(panel).toHaveTextContent('750');
      expect(panel).toHaveTextContent('September 1, 2026');

      fireEvent.click(within(panel).getByTestId(TEST_IDS.adminHistoryCancel));

      await waitFor(() => {
        expect(screen.queryByText('Scheduled')).not.toBeInTheDocument();
      }, WAIT);
    },
  );

  it(
    'keeps a version the backend calls in effect, with its refusal copy',
    { timeout: 15_000 },
    async () => {
      await openSettings();
      const panel = await scheduleTierChange();
      mockApiServer.use(
        http.delete(apiUrl('/teams/:teamId/settings/versions/:versionId'), () =>
          nestErrorResponse({
            statusCode: 409,
            code: 'CONFLICT',
            message: 'errors.teams.settingVersionNotCancellable',
            messageKey: 'errors.teams.settingVersionNotCancellable',
            path: '/settings/versions',
          }),
        ),
      );

      fireEvent.click(within(panel).getByTestId(TEST_IDS.adminHistoryCancel));

      await waitFor(() => {
        expect(within(panel).getByTestId(TEST_IDS.adminHistoryCancel)).not.toHaveAttribute(
          'aria-busy',
        );
      }, WAIT);
      expect(screen.getByText('Scheduled')).toBeInTheDocument();
    },
  );

  it('recovers from a stale head 409 by refreshing the history for re-confirmation', async () => {
    let versionReads = 0;
    mockApiServer.use(
      http.get(apiUrl('/teams/:teamId/settings/versions'), () => {
        versionReads += 1;
        return undefined;
      }),
      http.post(apiUrl('/teams/:teamId/settings/versions'), () =>
        nestErrorResponse({
          statusCode: 409,
          code: 'CONFLICT',
          message: 'errors.teams.settingVersionStale',
          messageKey: 'errors.teams.settingVersionStale',
          path: '/settings/versions',
        }),
      ),
    );
    await openSettings();
    pickSettingKey('badge_tiers');
    await screen.findByTestId('admin-editor-row-threshold-2', {}, WAIT);
    const readsBeforeSubmit = versionReads;

    fillScheduleEssentials();
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionSubmit)).toBeEnabled();
    }, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.adminVersionSubmit));

    await waitFor(() => {
      expect(versionReads).toBeGreaterThan(readsBeforeSubmit);
    }, WAIT);
    expect(screen.getByTestId(TEST_IDS.adminVersionForm)).toBeInTheDocument();
  });

  it('derives the weights rows from the statuses and requires full coverage', async () => {
    await openSettings();
    pickSettingKey('attendance_weights');

    await screen.findByTestId('admin-editor-row-weight-injured', {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.adminWeightsBlocked)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.adminVersionIssue)).toHaveTextContent(
      'No weight for injured.',
    );
    expect(screen.getByTestId(TEST_IDS.adminVersionSubmit)).toBeDisabled();

    // Choosing an instant re-derives the rows from the snapshot AT that
    // instant — the same statuses here, so the same structural rows.
    fireIonChange(screen.getByTestId(TEST_IDS.adminVersionEffectiveInput), FUTURE_WALL_TIME);
    await waitFor(() => {
      expect(screen.getByTestId('admin-editor-row-weight-absent')).toBeInTheDocument();
    }, WAIT);
    expect(screen.getByTestId('admin-editor-row-weight-injured')).toBeInTheDocument();
  });

  it('opens the Cairo picker from its trigger and shows the stored UTC hint', async () => {
    await openSettings();

    fireEvent.click(screen.getByTestId(`${TEST_IDS.adminVersionEffectiveFrom}-trigger`));
    fireIonChange(screen.getByTestId(TEST_IDS.adminVersionEffectiveInput), FUTURE_WALL_TIME);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionForm)).toHaveTextContent(
        '2026-09-01T09:00:00.000Z',
      );
    }, WAIT);
  });

  it('hides the form and states the read-only stance for a coach without the write grant', async () => {
    await openSettings(MOCK_PERSONA_EMAILS.coach);

    expect(screen.queryByTestId(TEST_IDS.adminVersionForm)).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.adminSettingsView)).toHaveTextContent(
      'read this configuration but not change it',
    );
  });
});

describe('the privileged raw-JSON disclosure', () => {
  it('stays schema-validated: nonsense cannot reach the editor', async () => {
    await openSettings();
    pickSettingKey('badge_tiers');

    fireEvent.click(await screen.findByTestId(TEST_IDS.adminVersionRawToggle, {}, WAIT));
    fireIonInput(
      await screen.findByTestId(TEST_IDS.adminVersionValue, {}, WAIT),
      '{"totally":"unrelated","nonsense":123}',
    );
    fireEvent.click(screen.getByTestId(TEST_IDS.adminVersionRawApply));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionRawError)).toHaveTextContent(
        'does not match the setting contract',
      );
    }, WAIT);
  });
});

describe('designed states', () => {
  it('renders the designed error state when the snapshot cannot be read', async () => {
    mockApiServer.use(
      http.get(apiUrl('/teams/:teamId/settings/snapshot'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute(APP_PATHS.adminSettings, APP_PATHS.adminSettings, <AdminSettingsContainer />);

    expect(await screen.findByTestId(TEST_IDS.adminSettingsError, {}, WAIT)).toBeInTheDocument();
  });

  it('renders the designed forbidden state for a principal without a settings grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRoute(APP_PATHS.adminSettings, APP_PATHS.adminSettings, <AdminSettingsContainer />);

    expect(
      await screen.findByTestId(TEST_IDS.adminSettingsForbidden, {}, WAIT),
    ).toBeInTheDocument();
  });
});

describe('reference data', () => {
  it('lists seasons, addressless venues, and the switchable catalog', async () => {
    await openSettings();

    const seasons = await screen.findByTestId(TEST_IDS.adminSeasonsPanel, {}, WAIT);
    expect(within(seasons).getAllByTestId(TEST_IDS.adminSeasonRow)).toHaveLength(2);
    expect(screen.getByTestId(TEST_IDS.adminVenuesPanel)).toHaveTextContent('No address recorded');

    fireIonChange(screen.getByTestId(TEST_IDS.adminCatalogSelect), 'position');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminCatalogPanel)).toHaveTextContent('Handler');
    }, WAIT);
  });
});

describe('a failed read offers a retry', () => {
  it('re-issues the settings snapshot from the designed error state', async () => {
    const attempts = await retryFromErrorState({
      path: '/teams/:teamId/settings/snapshot',
      errorTestId: TEST_IDS.adminSettingsError,
      signIn: async () => {
        await signInAs(MOCK_PERSONA_EMAILS.admin);
      },
      render: () => {
        renderRoute(APP_PATHS.adminSettings, APP_PATHS.adminSettings, <AdminSettingsContainer />);
      },
    });

    expect(attempts.after).toBeGreaterThan(attempts.before);
  });
});
