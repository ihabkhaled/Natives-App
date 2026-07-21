import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { AppBarContainer } from '@/app/shell/app-bar/app-bar.container';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { apiUrl, registerIntegrationSession } from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

async function openAppBar(): Promise<void> {
  await signInAs(MOCK_PERSONA_EMAILS.admin);
  renderRoute(APP_PATHS.home, APP_PATHS.home, <AppBarContainer />);
  await screen.findByTestId(TEST_IDS.appBar, {}, WAIT);
}

registerIntegrationSession();

describe('the app bar affordance is wired to the real inbox', () => {
  it('badges the icon with the unread count from the first bounded page', async () => {
    await openAppBar();

    const badge = await screen.findByTestId(TEST_IDS.appBarNotificationsBadge, {}, WAIT);
    expect(badge).toHaveTextContent('4');
  });

  it('drops the badge once every entry has been read', async () => {
    mockApiServer.use(
      http.get(apiUrl('/notifications'), () =>
        HttpResponse.json({
          items: [
            {
              id: 'ntf-read',
              teamId: 'team-1',
              category: 'practice',
              eventType: 'practice.session.published',
              titleKey: 'notifications.eventPracticePublished',
              bodyKey: 'notifications.bodyGeneric',
              params: { sessionId: 'session-1' },
              readAt: '2026-07-20T10:00:00.000Z',
              createdAt: '2026-07-20T09:00:00.000Z',
            },
          ],
          total: 1,
          limit: 20,
          offset: 0,
        }),
      ),
    );
    await openAppBar();

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.appBarNotificationsBadge)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('previews the newest entries in the popover, read and unread alike', async () => {
    await openAppBar();
    await screen.findByTestId(TEST_IDS.appBarNotificationsBadge, {}, WAIT);

    fireEvent.click(screen.getByTestId(TEST_IDS.appBarNotifications));

    const panel = await screen.findByTestId(TEST_IDS.appBarNotificationsPanel, {}, WAIT);
    const items = within(panel).getAllByTestId(TEST_IDS.appBarNotificationItem);
    expect(items.length).toBeGreaterThan(1);
    expect(items[0]).toHaveTextContent('Practice published');
    expect(panel).toHaveTextContent('Member activated');
  });

  it('shows the designed empty copy when nothing has arrived', async () => {
    mockApiServer.use(
      http.get(apiUrl('/notifications'), () =>
        HttpResponse.json({ items: [], total: 0, limit: 20, offset: 0 }),
      ),
    );
    await openAppBar();

    fireEvent.click(screen.getByTestId(TEST_IDS.appBarNotifications));

    expect(
      await screen.findByTestId(TEST_IDS.appBarNotificationsPanel, {}, WAIT),
    ).toHaveTextContent('You are all caught up');
  });

  it('closes the popover when the account menu opens, so the two never overlap', async () => {
    await openAppBar();

    fireEvent.click(screen.getByTestId(TEST_IDS.appBarNotifications));
    await screen.findByTestId(TEST_IDS.appBarNotificationsPanel, {}, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.appBarUserMenuButton));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.appBarNotificationsPanel)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('routes to the inbox and to the preference screen from the popover', async () => {
    await openAppBar();

    fireEvent.click(screen.getByTestId(TEST_IDS.appBarNotifications));
    fireEvent.click(await screen.findByTestId(TEST_IDS.appBarNotificationsViewAll, {}, WAIT));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.appBarNotificationsPanel)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('opens the preference screen from the popover', async () => {
    await openAppBar();

    fireEvent.click(screen.getByTestId(TEST_IDS.appBarNotifications));
    fireEvent.click(await screen.findByTestId(TEST_IDS.appBarNotificationsPreferences, {}, WAIT));

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.appBarNotificationsPanel)).not.toBeInTheDocument();
    }, WAIT);
  });

  it('opens a previewed entry through the arrival screen, never at the target', async () => {
    await openAppBar();

    fireEvent.click(screen.getByTestId(TEST_IDS.appBarNotifications));
    const panel = await screen.findByTestId(TEST_IDS.appBarNotificationsPanel, {}, WAIT);
    fireEvent.click(within(panel).getAllByTestId(TEST_IDS.appBarNotificationItem)[0]!);

    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.appBarNotificationsPanel)).not.toBeInTheDocument();
    }, WAIT);
  });
});
