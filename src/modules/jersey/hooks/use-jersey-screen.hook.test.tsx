import { act, waitFor } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { PERMISSIONS } from '@/shared/security';
import { useNetworkStatus } from '@/platform';
import { MOCK_JERSEY_EXPORT_LINES, MOCK_JERSEY_ORDERS } from '@/tests/msw/jersey.fixture';

import {
  buildJerseyGrants,
  buildJerseyTeamScope,
} from '../../../../tests/factories/jersey-view.factory';
import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { exportJerseyOrder } from '../services/export-jersey-order.service';
import { getJerseyOrder } from '../services/get-jersey-order.service';
import { listJerseyOrders } from '../services/list-jersey-orders.service';
import { useJerseyScreen } from './use-jersey-screen.hook';

vi.mock('../services/list-jersey-orders.service', () => ({ listJerseyOrders: vi.fn() }));
vi.mock('../services/get-jersey-order.service', () => ({ getJerseyOrder: vi.fn() }));
vi.mock('../services/export-jersey-order.service', () => ({ exportJerseyOrder: vi.fn() }));

vi.mock('@/platform', () => createPlatformMock());
vi.mock('@/modules/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthModule>();
  return { ...actual, useActiveTeamScope: vi.fn(), useEffectivePermissions: vi.fn() };
});

const MANAGER = [PERMISSIONS.jerseyRead, PERMISSIONS.jerseyManage];

function mockGrants(permissions: readonly string[] = MANAGER, isLoading = false): void {
  vi.mocked(useActiveTeamScope).mockReturnValue(buildJerseyTeamScope({ isLoading }));
  vi.mocked(useEffectivePermissions).mockReturnValue(buildJerseyGrants(permissions));
}

function renderScreen(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useJerseyScreen>>
> {
  return renderHookWithProviders(() => useJerseyScreen(), { initialPath: '/jersey-orders' });
}

/** Renders the screen and waits for the orders list to land. */
async function renderReadyScreen(): Promise<ReturnType<typeof renderScreen>> {
  const view = renderScreen();
  await waitFor(() => {
    expect(view.result.current.status).toBe('ready');
  });
  return view;
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  mockGrants();
  vi.mocked(listJerseyOrders).mockResolvedValue({
    items: [...MOCK_JERSEY_ORDERS],
    total: 3,
    limit: 20,
    offset: 0,
  });
  vi.mocked(getJerseyOrder).mockResolvedValue(MOCK_JERSEY_ORDERS[1]!);
  vi.mocked(exportJerseyOrder).mockResolvedValue({
    orderId: 'order-1',
    reference: 'UN-2026-HOME',
    lines: [...MOCK_JERSEY_EXPORT_LINES],
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useJerseyScreen', () => {
  it('starts loading so the screen can render its skeleton', () => {
    const { result } = renderScreen();

    expect(result.current.status).toBe('loading');
  });

  it('becomes ready with the orders newest first', async () => {
    const { result } = await renderReadyScreen();

    expect(result.current.rows.map((row) => row.id)).toEqual(['order-1', 'order-2', 'order-3']);
  });

  it('reports the server total rather than the page length', async () => {
    const { result } = await renderReadyScreen();

    expect(result.current.countLabel).toContain('3');
  });

  it('opens nothing until an operator asks, and reads no names before then', async () => {
    const { result } = await renderReadyScreen();

    expect(result.current.detail).toBeNull();
    expect(exportJerseyOrder).not.toHaveBeenCalled();
  });

  it('shows the opened order’s packing list, personalization included', async () => {
    const { result } = await renderReadyScreen();

    act(() => {
      result.current.onToggleOrder('order-1');
    });

    await waitFor(() => {
      expect(result.current.detail?.isLoading).toBe(false);
    });
    expect(result.current.detail?.lines[0]?.personalization).toBe('#7 · ADEL');
  });

  it('lets the freshly re-read record overrule the row it was opened from', async () => {
    vi.mocked(getJerseyOrder).mockResolvedValue({ ...MOCK_JERSEY_ORDERS[1]!, status: 'completed' });
    const { result } = await renderReadyScreen();

    act(() => {
      result.current.onToggleOrder('order-1');
    });

    // The list is a snapshot; an order someone deliberately opened is judged
    // on what the server says right now.
    await waitFor(() => {
      expect(result.current.detail?.statusLabel).toBe('completed');
    });
  });

  it('offers no way to open an order without the manage grant', async () => {
    mockGrants([PERMISSIONS.jerseyRead]);
    const { result } = await renderReadyScreen();

    expect(result.current.rows.every((row) => !row.canOpen)).toBe(true);

    act(() => {
      result.current.onToggleOrder('order-1');
    });

    await waitFor(() => {
      expect(result.current.detail).toBeNull();
    });
    expect(exportJerseyOrder).not.toHaveBeenCalled();
  });

  it('says the order did not open rather than surfacing the raw failure', async () => {
    vi.mocked(exportJerseyOrder).mockRejectedValue(new Error('database exploded'));
    const { result } = await renderReadyScreen();

    act(() => {
      result.current.onToggleOrder('order-1');
    });

    await waitFor(() => {
      expect(result.current.notice).toBe('That action did not complete. Try again.');
    });
  });

  it('carries no notice while nothing has failed', async () => {
    const { result } = await renderReadyScreen();

    expect(result.current.notice).toBeNull();
  });

  it('waits rather than refusing while the grants are still resolving', () => {
    mockGrants([], true);
    const { result } = renderScreen();

    // Forbidden is a verdict, not a default: showing it before the grants
    // land would accuse a permitted operator of having no access.
    expect(result.current.status).toBe('loading');
  });

  it('refuses the screen without the jersey read grant', () => {
    mockGrants([]);
    const { result } = renderScreen();

    expect(result.current.status).toBe('forbidden');
  });

  it('carries the copy written for this screen’s empty state', () => {
    const { result } = renderScreen();

    expect(result.current.emptyTitle).toBe('No jersey orders yet');
    expect(result.current.subtitle).toBe(
      'Stock, products and the supplier orders that restock them.',
    );
  });

  it('reports an empty list rather than a missing one', async () => {
    vi.mocked(listJerseyOrders).mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
  });

  it('keeps showing a resolved list through an offline blip', async () => {
    const { result } = await renderReadyScreen();
    const rowsBefore = result.current.rows.length;

    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });

    // Cached data survives losing the connection: an operator mid-review is
    // not thrown back to an offline screen.
    await waitFor(() => {
      expect(result.current.rows).toHaveLength(rowsBefore);
    });
    expect(result.current.status).toBe('ready');
  });

  it('blames the connection, not the server, when the read fails offline', async () => {
    vi.mocked(listJerseyOrders).mockRejectedValue(new Error('offline'));
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });

    const { result } = renderScreen();

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });
    expect(result.current.offlineTitle).toBe('You are offline');
  });
});
