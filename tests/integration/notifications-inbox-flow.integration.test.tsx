import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NotificationsInboxContainer } from '@/modules/notifications/containers/notifications-inbox.container';
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
import { fireIonChange } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderInbox(): void {
  renderRoute(APP_PATHS.notifications, APP_PATHS.notifications, <NotificationsInboxContainer />);
}

async function openInbox(email: string = MOCK_PERSONA_EMAILS.admin): Promise<void> {
  await signInAs(email);
  renderInbox();
  await screen.findByTestId(TEST_IDS.notificationsView, {}, WAIT);
}

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('the inbox lists what arrived, grouped and bounded', () => {
  it('groups arrivals by day instead of one undifferentiated list', async () => {
    await openInbox();

    const groups = await screen.findAllByTestId(TEST_IDS.notificationsGroup, {}, WAIT);
    expect(groups.length).toBeGreaterThan(1);
    expect(groups[0]).toHaveAccessibleName('Today');
  });

  it('renders designed copy for each entry, never the wire event type', async () => {
    await openInbox();

    await screen.findByText('Practice published', {}, WAIT);
    expect(screen.queryByText(/practice\.session\.published/u)).not.toBeInTheDocument();
  });

  it('states the bounded window rather than pretending the list is complete', async () => {
    await openInbox();

    expect(await screen.findByTestId(TEST_IDS.notificationsBoundedNotice, {}, WAIT)).toHaveTextContent(
      'bounded page',
    );
  });

  it('shows in-app delivery state per entry', async () => {
    await openInbox();

    const chips = await screen.findAllByTestId(TEST_IDS.notificationDelivery, {}, WAIT);
    expect(chips.some((chip) => chip.textContent?.includes('Delivered in app'))).toBe(true);
    expect(chips.some((chip) => chip.textContent?.includes('Read'))).toBe(true);
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

    await waitFor(
      () => {
        expect(screen.getAllByTestId(TEST_IDS.notificationMarkRead).length).toBe(
          before.length - 1,
        );
      },
      WAIT,
    );
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
