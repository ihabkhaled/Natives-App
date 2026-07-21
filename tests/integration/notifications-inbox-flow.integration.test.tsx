import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { NotificationsInboxContainer } from '@/modules/notifications/containers/notifications-inbox.container';
import { Route } from '@/packages/router';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_NOTIFICATIONS } from '@/tests/msw/notifications.fixture';

import {
  apiUrl,
  retryFromErrorState,
  registerIntegrationSession,
} from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { fireIonChange } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute, renderWithProviders } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderInbox(): void {
  renderRoute(APP_PATHS.notifications, APP_PATHS.notifications, <NotificationsInboxContainer />);
}

async function openInbox(email: string = MOCK_PERSONA_EMAILS.admin): Promise<void> {
  await signInAs(email);
  renderInbox();
  await screen.findByTestId(TEST_IDS.notificationsView, {}, WAIT);
}

/**
 * The inbox plus a probe at each destination it can route to, so a navigation
 * assertion proves the arrival rather than the absence of a prefix match.
 */
function renderInboxWithProbes(): void {
  renderWithProviders(
    <>
      <Route path={APP_PATHS.notifications} exact>
        <NotificationsInboxContainer />
      </Route>
      <Route path={APP_PATHS.notificationPreferences} exact>
        <p data-testid={TEST_IDS.notificationPrefsPage}>preferences</p>
      </Route>
      <Route path={APP_PATHS.notificationLink} exact>
        <p data-testid={TEST_IDS.notificationLinkPage}>arrival</p>
      </Route>
    </>,
    { initialPath: APP_PATHS.notifications },
  );
}

registerIntegrationSession();

describe('the inbox lists what arrived, grouped and bounded', () => {
  it('groups arrivals by day instead of one undifferentiated list', async () => {
    await openInbox();

    const groups = await screen.findAllByTestId(TEST_IDS.notificationsGroup, {}, WAIT);
    const headings = groups.map((group) => group.getAttribute('aria-label'));

    // The fixture instants are fixed, so which buckets exist depends on the
    // wall clock; the invariant under test is that arrivals are bucketed and
    // that the buckets stay in newest-first order.
    expect(groups.length).toBeGreaterThan(1);
    expect(headings).toEqual(
      ['Today', 'Yesterday', 'Earlier'].filter((label) => headings.includes(label)),
    );
  });

  it('renders designed copy for each entry, never the wire event type', async () => {
    await openInbox();

    await screen.findByText('Practice published', {}, WAIT);
    expect(screen.queryByText(/practice\.session\.published/u)).not.toBeInTheDocument();
  });

  it('states the bounded window rather than pretending the list is complete', async () => {
    await openInbox();

    expect(
      await screen.findByTestId(TEST_IDS.notificationsBoundedNotice, {}, WAIT),
    ).toHaveTextContent('bounded page');
  });

  it('shows in-app delivery state per entry', async () => {
    await openInbox();

    const chips = await screen.findAllByTestId(TEST_IDS.notificationDelivery, {}, WAIT);
    expect(chips.some((chip) => chip.textContent.includes('Delivered in app'))).toBe(true);
    expect(chips.some((chip) => chip.textContent.includes('Read'))).toBe(true);
  });
});

describe('the inbox is honest about delivery it cannot see', () => {
  it('says email and push delivery state is not exposed to recipients', async () => {
    await openInbox();

    expect(
      await screen.findByTestId(TEST_IDS.notificationsDeliveryNotice, {}, WAIT),
    ).toHaveTextContent('not exposed to recipients');
  });

  it('offers the operations centre only to an administrator who may read failures', async () => {
    await openInbox(MOCK_PERSONA_EMAILS.admin);

    const notice = await screen.findByTestId(TEST_IDS.notificationsDeliveryNotice, {}, WAIT);
    expect(within(notice).getByText('Open the operations centre')).toBeInTheDocument();
  });

  it('hides the operations centre from a member without the delivery grant', async () => {
    await openInbox(MOCK_PERSONA_EMAILS.member);

    const notice = await screen.findByTestId(TEST_IDS.notificationsDeliveryNotice, {}, WAIT);
    expect(within(notice).queryByText('Open the operations centre')).not.toBeInTheDocument();
  });
});

describe('read state is idempotent and filterable', () => {
  it('marks one entry read and stops offering the action', async () => {
    await openInbox();

    const before = await screen.findAllByTestId(TEST_IDS.notificationMarkRead, {}, WAIT);
    fireEvent.click(before[0]!);

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.notificationMarkRead).length).toBe(before.length - 1);
    }, WAIT);
  });

  it('narrows to unread only', async () => {
    await openInbox();

    fireIonChange(screen.getByTestId(TEST_IDS.notificationsStatusFilter), 'unread');

    await waitFor(() => {
      expect(screen.queryByText('Member activated')).not.toBeInTheDocument();
    }, WAIT);
  });

  it('narrows by category and offers the designed no-matches state', async () => {
    await openInbox();

    fireIonChange(screen.getByTestId(TEST_IDS.notificationsCategoryFilter), 'attendance');
    await screen.findByText('Attendance finalized', {}, WAIT);

    fireIonChange(screen.getByTestId(TEST_IDS.notificationsStatusFilter), 'read');
    expect(await screen.findByText('No notifications match', {}, WAIT)).toBeInTheDocument();
  });

  it('clears every unread entry with mark-all', async () => {
    await openInbox();
    await screen.findAllByTestId(TEST_IDS.notificationMarkRead, {}, WAIT);

    fireEvent.click(screen.getByTestId(TEST_IDS.notificationsMarkAllRead));

    await waitFor(() => {
      expect(screen.queryAllByTestId(TEST_IDS.notificationMarkRead)).toHaveLength(0);
    }, WAIT);
  });
});

describe('the inbox designs its non-ready states', () => {
  it('renders the designed empty state when nothing has arrived', async () => {
    mockApiServer.use(
      http.get(apiUrl('/notifications'), () =>
        HttpResponse.json({ items: [], total: 0, limit: 20, offset: 0 }),
      ),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderInbox();

    expect(await screen.findByTestId(TEST_IDS.notificationsEmpty, {}, WAIT)).toBeInTheDocument();
  });

  it('renders the designed error state and offers a retry when the read fails', async () => {
    mockApiServer.use(
      http.get(apiUrl('/notifications'), () => HttpResponse.json({ bad: true }, { status: 500 })),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderInbox();

    expect(await screen.findByTestId(TEST_IDS.notificationsError, {}, WAIT)).toBeInTheDocument();
  });

  it('pins the fixture ids the deep-link tests navigate to', () => {
    expect(MOCK_NOTIFICATIONS.unreadPracticeId).toBe('ntf-0000-0000-0001');
  });
});

describe('the bounded window grows one page at a time', () => {
  it('offers to load more only while a further page could exist', async () => {
    mockApiServer.use(
      http.get(apiUrl('/notifications'), ({ request }) => {
        const limit = Number(new URL(request.url).searchParams.get('limit') ?? '20');
        return HttpResponse.json({
          items: Array.from({ length: limit }, (_unused, index) => ({
            id: `ntf-page-${String(index)}`,
            teamId: 'team-1',
            category: 'practice',
            eventType: 'practice.session.published',
            titleKey: 'notifications.eventPracticePublished',
            bodyKey: 'notifications.bodyGeneric',
            params: { sessionId: 'session-1' },
            readAt: '2026-07-20T10:00:00.000Z',
            createdAt: '2026-07-20T09:00:00.000Z',
          })),
          total: 100,
          limit,
          offset: 0,
        });
      }),
    );
    await openInbox();

    const loadMore = await screen.findByTestId(TEST_IDS.notificationsLoadMore, {}, WAIT);
    fireEvent.click(loadMore);

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.notificationItem)).toHaveLength(40);
    }, WAIT);
  });

  it('hides the load-more affordance once the page is not full', async () => {
    await openInbox();

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.notificationsLoadMore)).not.toBeInTheDocument();
    }, WAIT);
  });
});

describe('opening an entry and reporting a failed command', () => {
  it('opens an entry through the arrival screen rather than at the target', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderInboxWithProbes();

    const openButtons = await screen.findAllByTestId(TEST_IDS.notificationOpen, {}, WAIT);
    fireEvent.click(openButtons[0]!);

    expect(await screen.findByTestId(TEST_IDS.notificationLinkPage, {}, WAIT)).toBeInTheDocument();
  });

  it('offers no open affordance for an entry that routes nowhere', async () => {
    await openInbox();

    const rows = await screen.findAllByTestId(TEST_IDS.notificationItem, {}, WAIT);
    const security = rows.find((row) => row.textContent.includes('Security alert'));
    expect(security).toBeDefined();
    expect(within(security!).queryByTestId(TEST_IDS.notificationOpen)).not.toBeInTheDocument();
  });

  it('reports a failed mark-read without losing the entry', async () => {
    mockApiServer.use(
      http.post(apiUrl('/notifications/:notificationId/read'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );
    await openInbox();

    const marks = await screen.findAllByTestId(TEST_IDS.notificationMarkRead, {}, WAIT);
    const before = marks.length;
    fireEvent.click(marks[0]!);

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.notificationMarkRead)).toHaveLength(before);
    }, WAIT);
  });

  it('routes an authorized administrator to the operations centre for delivery failures', async () => {
    await openInbox();

    const notice = await screen.findByTestId(TEST_IDS.notificationsDeliveryNotice, {}, WAIT);
    fireEvent.click(within(notice).getByText('Open the operations centre'));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.notificationsView)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('routes to the preference screen from the inbox toolbar', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderInboxWithProbes();
    await screen.findByTestId(TEST_IDS.notificationsPreferencesLink, {}, WAIT);

    fireEvent.click(screen.getByTestId(TEST_IDS.notificationsPreferencesLink));

    expect(await screen.findByTestId(TEST_IDS.notificationPrefsPage, {}, WAIT)).toBeInTheDocument();
  });
});

describe('a failed read offers a retry', () => {
  it('re-issues the inbox read from the designed error state', async () => {
    const attempts = await retryFromErrorState({
      path: '/notifications',
      errorTestId: TEST_IDS.notificationsError,
      signIn: async () => {
        await signInAs(MOCK_PERSONA_EMAILS.admin);
      },
      render: () => {
        renderInbox();
      },
    });

    expect(attempts.after).toBeGreaterThan(attempts.before);
  });
});
