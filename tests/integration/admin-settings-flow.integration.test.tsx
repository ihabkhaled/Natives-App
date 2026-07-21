import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AdminContainer } from '@/modules/admin/containers/admin.container';
import { AdminSettingsContainer } from '@/modules/admin/containers/admin-settings.container';
import { getEnvironment } from '@/packages/environment';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange, fireIonInput } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

async function openSettings(email: string = MOCK_PERSONA_EMAILS.admin): Promise<void> {
  await signInAs(email);
  renderRoute(APP_PATHS.adminSettings, APP_PATHS.adminSettings, <AdminSettingsContainer />);
  await screen.findByTestId(TEST_IDS.adminEffectivePanel, {}, WAIT);
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('the admin hub only advertises what the guard would allow', () => {
  it('shows every surface to a fully granted administrator', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute(APP_PATHS.admin, APP_PATHS.admin, <AdminContainer />);

    const cards = await screen.findAllByTestId(TEST_IDS.adminHubCard, {}, WAIT);
    expect(cards).toHaveLength(4);
    expect(cards[0]).toHaveTextContent('Team settings');
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

    fireIonInput(screen.getByTestId(TEST_IDS.adminVersionValue), '{"max":30}');
    fireIonInput(screen.getByTestId(TEST_IDS.adminVersionNote), 'Squad expansion');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminVersionSubmit)).toBeEnabled();
    }, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.adminVersionSubmit));

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
