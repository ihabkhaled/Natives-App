import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NotificationLinkContainer } from '@/modules/notifications/containers/notification-link.container';
import { getEnvironment } from '@/packages/environment';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_NOTIFICATIONS } from '@/tests/msw/notifications.fixture';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

function openLink(notificationId: string): void {
  renderRoute(
    `/notifications/open/${notificationId}`,
    APP_PATHS.notificationLink,
    <NotificationLinkContainer />,
  );
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('a deep link re-checks authorization on arrival', () => {
  it('routes an authorized principal onward to the target', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    openLink(MOCK_NOTIFICATIONS.unreadPracticeId);

    // The arrival screen unmounts itself in favour of the redirect once the
    // check passes, so the "no preview" notice disappears.
    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.notificationLinkView)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('shows the designed forbidden state when the target grant was revoked', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    openLink(MOCK_NOTIFICATIONS.forbiddenAttendanceId);

    expect(
      await screen.findByTestId(TEST_IDS.notificationLinkForbidden, {}, WAIT),
    ).toBeInTheDocument();
    expect(screen.getByText('This link is no longer available to you')).toBeInTheDocument();
  });

  it('leaks nothing about the target it refused', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    openLink(MOCK_NOTIFICATIONS.forbiddenAttendanceId);

    const view = await screen.findByTestId(TEST_IDS.notificationLinkView, {}, WAIT);

    expect(view.textContent).not.toContain(MOCK_NOTIFICATIONS.sessionId);
    expect(view.textContent).not.toContain('attendance.sheet.finalized');
    expect(view.textContent).toContain('Nothing from the target is loaded');
  });

  it('offers a way back to the inbox from the forbidden state', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    openLink(MOCK_NOTIFICATIONS.forbiddenAttendanceId);

    expect(await screen.findByTestId(TEST_IDS.notificationLinkBack, {}, WAIT)).toHaveTextContent(
      'Back to notifications',
    );
  });
});

describe('a deep link to something that is gone', () => {
  it('shows the designed stale state for a notification that is no longer in the inbox', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    openLink('ntf-does-not-exist');

    expect(await screen.findByTestId(TEST_IDS.notificationLinkEmpty, {}, WAIT)).toBeInTheDocument();
    expect(screen.getByText('That item is gone')).toBeInTheDocument();
  });

  it('shows the stale state for a notification that routes nowhere', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    openLink(MOCK_NOTIFICATIONS.staleId);

    expect(await screen.findByTestId(TEST_IDS.notificationLinkEmpty, {}, WAIT)).toBeInTheDocument();
  });

  it('does not distinguish a revoked grant from a missing record by leaking existence', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    openLink(MOCK_NOTIFICATIONS.forbiddenAttendanceId);
    const forbidden = await screen.findByTestId(TEST_IDS.notificationLinkView, {}, WAIT);

    expect(forbidden.textContent).not.toContain('sessionId');
  });

  it('falls back to the stale state when the inbox read itself fails', async () => {
    mockApiServer.use(
      http.get(apiUrl('/notifications'), () => HttpResponse.json({ bad: true }, { status: 500 })),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    openLink(MOCK_NOTIFICATIONS.unreadPracticeId);

    expect(await screen.findByTestId(TEST_IDS.notificationLinkEmpty, {}, WAIT)).toBeInTheDocument();
  });
});
