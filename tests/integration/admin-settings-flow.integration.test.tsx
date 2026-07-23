import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { AdminContainer } from '@/modules/admin/containers/admin.container';
import { AdminSettingsContainer } from '@/modules/admin/containers/admin-settings.container';
import { Route } from '@/packages/router';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  apiUrl,
  retryFromErrorState,
  registerIntegrationSession,
} from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { fireIonChange, fireIonInput, fireIonInputCleared } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute, renderWithProviders } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

async function openSettings(email: string = MOCK_PERSONA_EMAILS.admin): Promise<void> {
  await signInAs(email);
  renderRoute(APP_PATHS.adminSettings, APP_PATHS.adminSettings, <AdminSettingsContainer />);
  await screen.findByTestId(TEST_IDS.adminEffectivePanel, {}, WAIT);
}

/** Fill a valid effective-dated change and submit it. */
async function submitVersionChange(): Promise<void> {
  fireIonInput(screen.getByTestId(TEST_IDS.adminVersionValue), '{"max":30}');
  fireIonInput(screen.getByTestId(TEST_IDS.adminVersionNote), 'Squad expansion');
  await waitFor(() => {
    expect(screen.getByTestId(TEST_IDS.adminVersionSubmit)).toBeEnabled();
  }, WAIT);
  fireEvent.click(screen.getByTestId(TEST_IDS.adminVersionSubmit));
}

registerIntegrationSession();

describe('the admin hub only advertises what the guard would allow', () => {
  it('shows every surface to a fully granted administrator', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute(APP_PATHS.admin, APP_PATHS.admin, <AdminContainer />);

    const cards = await screen.findAllByTestId(TEST_IDS.adminHubCard, {}, WAIT);
    expect(cards).toHaveLength(5);
    expect(cards[0]).toHaveTextContent('Team settings');
    expect(cards[4]).toHaveTextContent('Platform administrators');
  });

  it('shows a member no admin surface at all', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRoute(APP_PATHS.admin, APP_PATHS.admin, <AdminContainer />);

    await screen.findByTestId(TEST_IDS.adminHubView, {}, WAIT);
    await waitFor(() => {
      expect(screen.queryAllByTestId(TEST_IDS.adminHubCard)).toHaveLength(0);
    }, WAIT);
  });
});

describe('effective configuration and its history', () => {
  it('shows what the application reads today, with the moment each value took effect', async () => {
    await openSettings();

    const panel = await screen.findByTestId(TEST_IDS.adminEffectivePanel, {}, WAIT);
    expect(within(panel).getAllByTestId(TEST_IDS.adminEffectiveRow).length).toBeGreaterThan(0);
    expect(panel).toHaveTextContent('As of');
  });

  it('renders an opaque setting value as text without interpreting it', async () => {
    await openSettings();

    expect(await screen.findByTestId(TEST_IDS.adminEffectivePanel, {}, WAIT)).toHaveTextContent(
      '["present","late","excused","absent"]',
    );
  });

  it('shows the version history for the selected key and follows a change of key', async () => {
    await openSettings();

    const panel = await screen.findByTestId(TEST_IDS.adminVersionsPanel, {}, WAIT);
    expect(within(panel).getAllByTestId(TEST_IDS.adminVersionRow)).toHaveLength(1);

    fireIonChange(screen.getByTestId(TEST_IDS.adminSettingKeySelect), 'attendance_weights');

    await waitFor(() => {
      expect(
        within(screen.getByTestId(TEST_IDS.adminVersionsPanel)).getByTestId(
          TEST_IDS.adminVersionRow,
        ),
      ).toHaveTextContent('No note recorded');
    }, WAIT);
  });
});

describe('scheduling a configuration change', () => {
  it('refuses a malformed value instead of sending it', async () => {
    await openSettings();

    fireIonInput(screen.getByTestId(TEST_IDS.adminVersionValue), '{not json');

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionSubmit)).toBeDisabled();
    }, WAIT);
    expect(screen.getByTestId(TEST_IDS.adminVersionForm)).toHaveTextContent('valid JSON');
  });

  it('requires a reason, because the change lands in the audit log', async () => {
    await openSettings();

    fireIonInput(screen.getByTestId(TEST_IDS.adminVersionValue), '{"max":30}');

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionForm)).toHaveTextContent('reason');
    }, WAIT);
    expect(screen.getByTestId(TEST_IDS.adminVersionSubmit)).toBeDisabled();
  });

  it('schedules the change once the value and the reason are both valid', async () => {
    let submitted: unknown = null;
    mockApiServer.use(
      http.post(apiUrl('/teams/:teamId/settings/versions'), async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json(
          {
            id: 'sv-new',
            teamId: 'team-1',
            settingKey: 'attendance_statuses',
            effectiveFrom: '2026-08-01T00:00:00.000Z',
            value: { max: 30 },
            note: 'Squad expansion',
            createdBy: null,
            createdAt: '2026-07-20T09:00:00.000Z',
          },
          { status: 201 },
        );
      }),
    );
    await openSettings();

    await submitVersionChange();

    await waitFor(() => {
      expect(submitted).toMatchObject({ note: 'Squad expansion', value: { max: 30 } });
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

describe('reference data', () => {
  it('lists seasons with their window and status', async () => {
    await openSettings();

    const panel = await screen.findByTestId(TEST_IDS.adminSeasonsPanel, {}, WAIT);
    expect(within(panel).getAllByTestId(TEST_IDS.adminSeasonRow)).toHaveLength(2);
    expect(panel).toHaveTextContent('Season 2026');
  });

  it('states when a venue has no address rather than leaving a blank', async () => {
    await openSettings();

    expect(await screen.findByTestId(TEST_IDS.adminVenuesPanel, {}, WAIT)).toHaveTextContent(
      'No address recorded',
    );
  });

  it('switches the reference catalog on demand', async () => {
    await openSettings();
    await screen.findByTestId(TEST_IDS.adminCatalogPanel, {}, WAIT);

    fireIonChange(screen.getByTestId(TEST_IDS.adminCatalogSelect), 'position');

    await waitFor(() => {
      expect(
        within(screen.getByTestId(TEST_IDS.adminCatalogPanel)).getAllByTestId(
          TEST_IDS.adminCatalogRow,
        ).length,
      ).toBeGreaterThan(0);
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

describe('the hub opens what it advertises', () => {
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

describe('scheduling reports its outcome', () => {
  it('keeps the form usable when the change is rejected', async () => {
    mockApiServer.use(
      http.post(apiUrl('/teams/:teamId/settings/versions'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );
    await openSettings();

    await submitVersionChange();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionForm)).toBeInTheDocument();
    }, WAIT);
  });

  it('lets the effective instant be chosen', async () => {
    await openSettings();

    fireIonInput(
      screen.getByTestId(TEST_IDS.adminVersionEffectiveFrom),
      '2026-09-01T00:00:00.000Z',
    );

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionEffectiveFrom)).toHaveAttribute(
        'value',
        '2026-09-01T00:00:00.000Z',
      );
    }, WAIT);
  });
});

describe('clearing a scheduling field', () => {
  it('treats a cleared value as empty and refuses to submit', async () => {
    await openSettings();

    fireIonInputCleared(screen.getByTestId(TEST_IDS.adminVersionValue));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionSubmit)).toBeDisabled();
    }, WAIT);
  });

  it('treats a cleared reason as empty and refuses to submit', async () => {
    await openSettings();

    fireIonInput(screen.getByTestId(TEST_IDS.adminVersionValue), '{"max":30}');
    fireIonInputCleared(screen.getByTestId(TEST_IDS.adminVersionNote));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionForm)).toHaveTextContent('reason');
    }, WAIT);
  });

  it('treats a cleared effective instant as empty', async () => {
    await openSettings();

    fireIonInputCleared(screen.getByTestId(TEST_IDS.adminVersionEffectiveFrom));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionEffectiveFrom)).toHaveAttribute('value', '');
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
