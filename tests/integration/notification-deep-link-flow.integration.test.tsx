import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { NotificationLinkContainer } from '@/modules/notifications/containers/notification-link.container';
import { Route } from '@/packages/router';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_NOTIFICATIONS } from '@/tests/msw/notifications.fixture';

import { apiUrl, registerIntegrationSession } from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute, renderWithProviders } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function openLink(notificationId: string): void {
  renderRoute(
    `/notifications/open/${notificationId}`,
    APP_PATHS.notificationLink,
    <NotificationLinkContainer />,
  );
}

registerIntegrationSession();

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

describe('read state on arrival is idempotent', () => {
  it('marks the notification read exactly once, even across re-renders', async () => {
    let reads = 0;
    mockApiServer.use(
      http.post(apiUrl('/notifications/:notificationId/read'), ({ params }) => {
        reads += 1;
        return HttpResponse.json({
          id: String(params['notificationId']),
          teamId: 'team-1',
          category: 'practice',
          eventType: 'practice.session.published',
          titleKey: 'notifications.eventPracticePublished',
          bodyKey: 'notifications.bodyGeneric',
          params: { sessionId: MOCK_NOTIFICATIONS.sessionId },
          readAt: '2026-07-20T10:00:00.000Z',
          createdAt: '2026-07-20T09:00:00.000Z',
        });
      }),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    openLink(MOCK_NOTIFICATIONS.unreadPracticeId);

    await waitFor(() => {
      expect(reads).toBe(1);
    }, WAIT);
    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    expect(reads).toBe(1);
  });

  it('does not mark anything read when the arrival is refused', async () => {
    let reads = 0;
    mockApiServer.use(
      http.post(apiUrl('/notifications/:notificationId/read'), () => {
        reads += 1;
        return HttpResponse.json({ bad: true }, { status: 500 });
      }),
    );

    await signInAs(MOCK_PERSONA_EMAILS.member);
    openLink(MOCK_NOTIFICATIONS.forbiddenAttendanceId);
    await screen.findByTestId(TEST_IDS.notificationLinkForbidden, {}, WAIT);

    expect(reads).toBe(0);
  });

  it('shows the stale state when the arrival carries no notification id at all', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute('/notifications/open', '/notifications/open', <NotificationLinkContainer />);

    expect(await screen.findByTestId(TEST_IDS.notificationLinkEmpty, {}, WAIT)).toBeInTheDocument();
  });
});

describe('the arrival screen stays usable when a command fails', () => {
  it('still routes onward when the read-state command is refused', async () => {
    mockApiServer.use(
      http.post(apiUrl('/notifications/:notificationId/read'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    openLink(MOCK_NOTIFICATIONS.unreadPracticeId);

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.notificationLinkView)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('returns to the inbox from the forbidden state', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderWithProviders(
      <>
        <Route path={APP_PATHS.notificationLink} exact>
          <NotificationLinkContainer />
        </Route>
        <Route path={APP_PATHS.notifications} exact>
          <p data-testid={TEST_IDS.notificationsPage}>inbox</p>
        </Route>
      </>,
      { initialPath: `/notifications/open/${MOCK_NOTIFICATIONS.forbiddenAttendanceId}` },
    );

    fireEvent.click(await screen.findByTestId(TEST_IDS.notificationLinkBack, {}, WAIT));

    expect(await screen.findByTestId(TEST_IDS.notificationsPage, {}, WAIT)).toBeInTheDocument();
  });
});
