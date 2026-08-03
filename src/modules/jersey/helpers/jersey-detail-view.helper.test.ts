import { describe, expect, it } from 'vitest';

import { MOCK_JERSEY_EXPORT_LINES, MOCK_JERSEY_ORDERS } from '@/tests/msw/jersey.fixture';

import { buildJerseyOrderRowView } from '../../../../tests/factories/jersey-view.factory';
import { buildJerseyOrderDetailView } from './jersey-detail-view.helper';

const BASE = {
  locale: 'en',
  loadingLabel: 'Loading…',
  order: undefined,
  lines: [],
  isLoading: true,
} as const;

describe('buildJerseyOrderDetailView', () => {
  it('produces nothing while no order is open', () => {
    expect(buildJerseyOrderDetailView({ ...BASE, row: null })).toBeNull();
  });

  it('stands in with the row’s own values until the fresh record lands', () => {
    // The panel needs a real heading to be labelled by from the first frame.
    const view = buildJerseyOrderDetailView({
      ...BASE,
      row: buildJerseyOrderRowView({ reference: 'UN-2026-HOME', statusLabel: 'ordered' }),
    });

    expect(view).toMatchObject({
      reference: 'UN-2026-HOME',
      statusLabel: 'ordered',
      statusTone: 'warning',
      isLoading: true,
    });
  });

  it('lets the freshly re-read record overrule the list snapshot', () => {
    const view = buildJerseyOrderDetailView({
      ...BASE,
      isLoading: false,
      row: buildJerseyOrderRowView({ statusLabel: 'ordered' }),
      order: { ...MOCK_JERSEY_ORDERS[1]!, status: 'completed', reference: 'UN-2026-HOME-V2' },
    });

    expect(view?.statusLabel).toBe('completed');
    expect(view?.statusTone).toBe('success');
    expect(view?.reference).toBe('UN-2026-HOME-V2');
  });

  it('renders the packing list once it arrives', () => {
    const view = buildJerseyOrderDetailView({
      ...BASE,
      isLoading: false,
      row: buildJerseyOrderRowView(),
      lines: MOCK_JERSEY_EXPORT_LINES,
    });

    expect(view?.lines).toHaveLength(MOCK_JERSEY_EXPORT_LINES.length);
    expect(view?.lines[0]?.personalization).toBe('#7 · ADEL');
  });

  it('keeps the panel tied to the row that was opened', () => {
    const view = buildJerseyOrderDetailView({
      ...BASE,
      row: buildJerseyOrderRowView({ id: 'order-9' }),
    });

    expect(view?.orderId).toBe('order-9');
    expect(view?.loadingLabel).toBe('Loading…');
  });
});
