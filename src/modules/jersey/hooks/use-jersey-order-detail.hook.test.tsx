import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_JERSEY_EXPORT_LINES, MOCK_JERSEY_ORDERS } from '@/tests/msw/jersey.fixture';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { exportJerseyOrder } from '../services/export-jersey-order.service';
import { getJerseyOrder } from '../services/get-jersey-order.service';
import { useJerseyOrderDetail } from './use-jersey-order-detail.hook';

vi.mock('../services/export-jersey-order.service', () => ({ exportJerseyOrder: vi.fn() }));
vi.mock('../services/get-jersey-order.service', () => ({ getJerseyOrder: vi.fn() }));

function render(
  canManage = true,
): ReturnType<typeof renderHookWithProviders<ReturnType<typeof useJerseyOrderDetail>>> {
  return renderHookWithProviders(() => useJerseyOrderDetail({ teamId: 't1', canManage }));
}

/** Opens one order and waits for both of its reads to settle. */
async function openOrder(): Promise<ReturnType<typeof render>> {
  const view = render();

  act(() => {
    view.result.current.toggle('order-1');
  });
  await waitFor(() => {
    expect(view.result.current.isLoading).toBe(false);
  });

  return view;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getJerseyOrder).mockResolvedValue(MOCK_JERSEY_ORDERS[1]!);
  vi.mocked(exportJerseyOrder).mockResolvedValue({
    orderId: 'order-1',
    reference: 'UN-2026-HOME',
    lines: [...MOCK_JERSEY_EXPORT_LINES],
  });
});

describe('useJerseyOrderDetail', () => {
  it('asks for nothing until an operator opens an order', () => {
    const { result } = render();

    // The packing list carries members' printed names; fetching it for orders
    // nobody asked about would pull that across the wire needlessly.
    expect(result.current.openOrderId).toBe('');
    expect(getJerseyOrder).not.toHaveBeenCalled();
    expect(exportJerseyOrder).not.toHaveBeenCalled();
  });

  it('re-reads the record and the packing list for the order that was opened', async () => {
    const { result } = await openOrder();

    expect(getJerseyOrder).toHaveBeenCalledWith({ teamId: 't1', orderId: 'order-1' });
    expect(exportJerseyOrder).toHaveBeenCalledWith({ teamId: 't1', orderId: 'order-1' });
    expect(result.current.lines).toHaveLength(MOCK_JERSEY_EXPORT_LINES.length);
  });

  it('reads nothing at all without the manage grant', async () => {
    const { result } = render(false);

    act(() => {
      result.current.toggle('order-1');
    });

    await waitFor(() => {
      expect(result.current.openOrderId).toBe('');
    });
    expect(exportJerseyOrder).not.toHaveBeenCalled();
  });

  it('closes the order when the same row is chosen again', async () => {
    const { result } = await openOrder();

    act(() => {
      result.current.toggle('order-1');
    });

    await waitFor(() => {
      expect(result.current.openOrderId).toBe('');
    });
  });

  it('moves to another order when a different row is chosen', async () => {
    const { result } = await openOrder();

    act(() => {
      result.current.toggle('order-2');
    });

    await waitFor(() => {
      expect(result.current.openOrderId).toBe('order-2');
    });
  });

  it('reports a failure when either of the two reads fails', async () => {
    vi.mocked(exportJerseyOrder).mockRejectedValue(new Error('boom'));
    const { result } = render();

    act(() => {
      result.current.toggle('order-1');
    });

    await waitFor(() => {
      expect(result.current.hasError).toBe(true);
    });
    expect(result.current.lines).toEqual([]);
  });

  it('stays loading until both reads have landed', async () => {
    vi.mocked(exportJerseyOrder).mockImplementation(() => new Promise(() => undefined));
    const { result } = render();

    act(() => {
      result.current.toggle('order-1');
    });

    await waitFor(() => {
      expect(result.current.order).toBeDefined();
    });
    expect(result.current.isLoading).toBe(true);
  });
});
