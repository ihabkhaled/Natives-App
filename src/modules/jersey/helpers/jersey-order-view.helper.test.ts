import { describe, expect, it } from 'vitest';

import { MOCK_JERSEY_ORDERS } from '@/tests/msw/jersey.fixture';

import type { JerseyOrder } from '../types/jersey.types';
import {
  buildJerseyOrderRowViews,
  resolveJerseyOrderStatusTone,
  resolveJerseyOrdersPage,
} from './jersey-order-view.helper';

const OPEN_TO_ALL = { canOpen: true, openOrderId: '' };

function order(overrides: Partial<JerseyOrder> = {}): JerseyOrder {
  return { ...MOCK_JERSEY_ORDERS[0], ...overrides } as JerseyOrder;
}

describe('buildJerseyOrderRowViews', () => {
  it('orders the list newest first, as the screen promises', () => {
    const rows = buildJerseyOrderRowViews('en', MOCK_JERSEY_ORDERS, OPEN_TO_ALL);

    expect(rows.map((row) => row.id)).toEqual(['order-1', 'order-2', 'order-3']);
  });

  it('breaks a same-instant tie on the id so rows never swap between renders', () => {
    const rows = buildJerseyOrderRowViews(
      'en',
      [
        order({ orderId: 'b', createdAt: '2026-08-01T09:00:00.000Z' }),
        order({ orderId: 'a', createdAt: '2026-08-01T09:00:00.000Z' }),
      ],
      OPEN_TO_ALL,
    );

    expect(rows.map((row) => row.id)).toEqual(['a', 'b']);
  });

  it('carries the reference and supplier the server authored, verbatim', () => {
    const [row] = buildJerseyOrderRowViews(
      'en',
      [order({ reference: 'UN-2026-HOME', supplier: 'Kitmaker Cairo' })],
      OPEN_TO_ALL,
    );

    expect(row?.reference).toBe('UN-2026-HOME');
    expect(row?.supplier).toBe('Kitmaker Cairo');
  });

  it('leaves the supplier absent rather than blank when there is none', () => {
    const [row] = buildJerseyOrderRowViews('en', [order({ supplier: null })], OPEN_TO_ALL);

    expect(row?.supplier).toBeNull();
  });

  it('refuses to open any row without the manage grant', () => {
    // Opening an order reveals members' printed names, so a read-only holder
    // gets an inert row rather than a control that will be refused.
    const rows = buildJerseyOrderRowViews('en', MOCK_JERSEY_ORDERS, {
      canOpen: false,
      openOrderId: 'order-1',
    });

    expect(rows.every((row) => !row.canOpen)).toBe(true);
    expect(rows.every((row) => !row.isOpen)).toBe(true);
  });

  it('marks only the row an operator opened', () => {
    const rows = buildJerseyOrderRowViews('en', MOCK_JERSEY_ORDERS, {
      canOpen: true,
      openOrderId: 'order-2',
    });

    expect(rows.filter((row) => row.isOpen).map((row) => row.id)).toEqual(['order-2']);
  });

  it('renders the date it was raised in the reader’s locale', () => {
    const [row] = buildJerseyOrderRowViews(
      'en',
      [order({ createdAt: '2026-08-01T09:00:00.000Z' })],
      OPEN_TO_ALL,
    );

    expect(row?.placedLabel).toContain('2026');
  });
});

describe('resolveJerseyOrderStatusTone', () => {
  it.each([
    ['draft', 'medium'],
    ['submitted', 'warning'],
    ['approved', 'warning'],
    ['ordered', 'warning'],
    ['received', 'primary'],
    ['issued', 'primary'],
    ['completed', 'success'],
    ['cancelled', 'danger'],
  ] as const)('tones %s as %s', (status, tone) => {
    expect(resolveJerseyOrderStatusTone(status)).toBe(tone);
  });
});

describe('resolveJerseyOrdersPage', () => {
  it('defaults to an empty list before the query resolves', () => {
    expect(resolveJerseyOrdersPage(undefined)).toEqual({ items: [], total: 0 });
  });

  it('reports the server total rather than the length of this page', () => {
    const page = resolveJerseyOrdersPage({
      items: [...MOCK_JERSEY_ORDERS],
      total: 9,
      limit: 20,
      offset: 0,
    });

    expect(page.total).toBe(9);
    expect(page.items).toHaveLength(MOCK_JERSEY_ORDERS.length);
  });
});
