import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { NotificationPreferencesContainer } from '@/modules/notifications/containers/notification-preferences.container';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  apiUrl,
  retryFromErrorState,
  registerIntegrationSession,
} from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import {
  fireIonCheckboxChange,
  fireIonInput,
  fireIonInputCleared,
} from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

async function openPreferences(): Promise<void> {
  await signInAs(MOCK_PERSONA_EMAILS.admin);
  renderRoute(
    APP_PATHS.notificationPreferences,
    APP_PATHS.notificationPreferences,
    <NotificationPreferencesContainer />,
  );
  await screen.findByTestId(TEST_IDS.notificationPrefsMatrix, {}, WAIT);
}

/** The switch grid row for one category, found by its heading. */
function rowFor(category: string): HTMLElement {
  const rows = screen.getAllByTestId(TEST_IDS.notificationPrefsRow);
  const match = rows.find((row) => row.textContent.startsWith(category));
  expect(match).toBeDefined();
  return match!;
}

registerIntegrationSession();

describe('mandatory categories cannot be muted, and the UI says so', () => {
  it('locks every channel of the security and system category', async () => {
    await openPreferences();

    const toggles = within(rowFor('Security and system')).getAllByTestId(
      TEST_IDS.notificationPrefsToggle,
    );

    expect(toggles).toHaveLength(3);
    for (const toggle of toggles) {
      expect(toggle).toHaveProperty('disabled', true);
      expect(toggle).toBeChecked();
    }
  });

  it('badges the mandatory category as always on', async () => {
    await openPreferences();

    expect(
      within(rowFor('Security and system')).getByTestId(TEST_IDS.notificationPrefsMandatory),
    ).toHaveTextContent('Always on');
  });

  it('states plainly why the switch is locked rather than silently ignoring it', async () => {
    await openPreferences();

    expect(screen.getByTestId(TEST_IDS.notificationPrefsMatrix)).toHaveTextContent(
      'this switch is locked, not merely ignored',
    );
  });

  it('locks the in-app channel on an optional category too', async () => {
    await openPreferences();

    const inApp = within(rowFor('Practice')).getAllByTestId(TEST_IDS.notificationPrefsToggle)[0];

    expect(inApp).toHaveProperty('disabled', true);
    expect(inApp).toBeChecked();
  });

  it('never sends a command for a locked switch', async () => {
    let attempted = 0;
    mockApiServer.use(
      http.put(apiUrl('/notifications/preferences'), () => {
        attempted += 1;
        return HttpResponse.json({ items: [] });
      }),
    );
    await openPreferences();

    for (const toggle of within(rowFor('Security and system')).getAllByTestId(
      TEST_IDS.notificationPrefsToggle,
    )) {
      fireIonCheckboxChange(toggle, false);
    }

    await waitFor(() => {
      expect(attempted).toBe(0);
    }, WAIT);
  });
});

describe('optional preferences round-trip', () => {
  it('turns an optional channel off and keeps it off', async () => {
    await openPreferences();
    const email = within(rowFor('Practice')).getAllByTestId(TEST_IDS.notificationPrefsToggle)[1]!;
    expect(email).toBeChecked();

    fireIonCheckboxChange(email, false);

    await waitFor(() => {
      expect(
        within(rowFor('Practice')).getAllByTestId(TEST_IDS.notificationPrefsToggle)[1],
      ).not.toBeChecked();
    }, WAIT);
  });

  it('shows a channel the server never persisted as explicitly off', async () => {
    await openPreferences();

    const push = within(rowFor('Membership')).getAllByTestId(TEST_IDS.notificationPrefsToggle)[2];

    expect(push).not.toBeChecked();
    expect(push).toHaveProperty('disabled', false);
  });
});

describe('quiet hours', () => {
  it('shows the stored window, timezone, and urgent override', async () => {
    await openPreferences();

    expect(screen.getByTestId(TEST_IDS.quietHoursTimezone)).toHaveTextContent('Africa/Cairo');
    expect(screen.getByTestId(TEST_IDS.quietHoursUrgent)).toBeChecked();
  });

  it('blocks the save on a malformed wall-clock time instead of sending it', async () => {
    await openPreferences();

    fireIonInput(screen.getByTestId(TEST_IDS.quietHoursStart), '25:00');

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursSave)).toBeDisabled();
    }, WAIT);
    expect(screen.getByTestId(TEST_IDS.quietHoursPanel)).toHaveTextContent('24-hour time');
  });

  it('saves a valid window and clears the local draft', async () => {
    await openPreferences();

    fireIonInput(screen.getByTestId(TEST_IDS.quietHoursStart), '21:30');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursSave)).toBeEnabled();
    }, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.quietHoursSave));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursStart)).toHaveAttribute('value', '21:30');
    }, WAIT);
  });

  it('lets the urgent override be turned off', async () => {
    await openPreferences();

    fireIonCheckboxChange(screen.getByTestId(TEST_IDS.quietHoursUrgent), false);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursUrgent)).not.toBeChecked();
    }, WAIT);
  });
});

describe('scope and designed states', () => {
  it('names the team the preferences apply to', async () => {
    await openPreferences();

    expect(screen.getByTestId(TEST_IDS.notificationPrefsScope)).toHaveTextContent('Cairo Natives');
  });

  it('renders the designed error state when the matrix cannot be read', async () => {
    mockApiServer.use(
      http.get(apiUrl('/notifications/preferences'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute(
      APP_PATHS.notificationPreferences,
      APP_PATHS.notificationPreferences,
      <NotificationPreferencesContainer />,
    );

    expect(
      await screen.findByTestId(TEST_IDS.notificationPrefsError, {}, WAIT),
    ).toBeInTheDocument();
  });
});

describe('failed commands are reported, not swallowed', () => {
  it('keeps the switch as the server has it when the update fails', async () => {
    mockApiServer.use(
      http.put(apiUrl('/notifications/preferences'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );
    await openPreferences();

    const email = within(rowFor('Practice')).getAllByTestId(TEST_IDS.notificationPrefsToggle)[1]!;
    fireIonCheckboxChange(email, false);

    await waitFor(() => {
      expect(
        within(rowFor('Practice')).getAllByTestId(TEST_IDS.notificationPrefsToggle)[1],
      ).toBeChecked();
    }, WAIT);
  });

  it('keeps the quiet-hours window when the save fails', async () => {
    mockApiServer.use(
      http.put(apiUrl('/notifications/quiet-hours'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );
    await openPreferences();

    fireIonInput(screen.getByTestId(TEST_IDS.quietHoursEnd), '06:30');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursSave)).toBeEnabled();
    }, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.quietHoursSave));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursEnd)).toHaveAttribute('value', '06:30');
    }, WAIT);
  });

  it('offers a way back to the inbox', async () => {
    await openPreferences();

    fireEvent.click(screen.getByText('Back to notifications'));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.notificationPrefsMatrix)).not.toBeInTheDocument();
    }, WAIT);
  });
});

describe('clearing a quiet-hours field', () => {
  it('treats a cleared start time as empty and blocks the save', async () => {
    await openPreferences();

    fireIonInputCleared(screen.getByTestId(TEST_IDS.quietHoursStart));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursSave)).toBeDisabled();
    }, WAIT);
  });

  it('treats a cleared end time as empty and blocks the save', async () => {
    await openPreferences();

    fireIonInputCleared(screen.getByTestId(TEST_IDS.quietHoursEnd));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursSave)).toBeDisabled();
    }, WAIT);
  });

  it('refuses to save while the window is invalid, even if the button is forced', async () => {
    await openPreferences();

    fireIonInputCleared(screen.getByTestId(TEST_IDS.quietHoursStart));
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursSave)).toBeDisabled();
    }, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.quietHoursSave));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.quietHoursPanel)).toHaveTextContent('24-hour time');
    }, WAIT);
  });
});

describe('a failed read offers a retry', () => {
  it('re-issues the preference read from the designed error state', async () => {
    const attempts = await retryFromErrorState({
      path: '/notifications/preferences',
      errorTestId: TEST_IDS.notificationPrefsError,
      signIn: async () => {
        await signInAs(MOCK_PERSONA_EMAILS.admin);
      },
      render: () => {
        renderRoute(
          APP_PATHS.notificationPreferences,
          APP_PATHS.notificationPreferences,
          <NotificationPreferencesContainer />,
        );
      },
    });

    expect(attempts.after).toBeGreaterThan(attempts.before);
  });
});
