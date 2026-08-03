import { describe, expect, it } from 'vitest';

import { MOCK_ANOMALIES } from '@/tests/msw/data-quality.fixture';

import type { Anomaly } from '../types/data-quality.types';
import { buildAnomalyCardViews, resolveAnomaliesPage } from './anomaly-view.helper';

const t = (key: string, params?: Record<string, unknown>): string =>
  params === undefined ? `t:${key}` : `t:${key}:${JSON.stringify(params)}`;

function anomaly(overrides: Partial<Anomaly> = {}): Anomaly {
  return { ...MOCK_ANOMALIES[0], ...overrides } as Anomaly;
}

describe('buildAnomalyCardViews', () => {
  it('orders the queue worst first', () => {
    const cards = buildAnomalyCardViews(t, MOCK_ANOMALIES);

    expect(cards.map((card) => card.severity)).toEqual(['critical', 'medium', 'low']);
  });

  it('breaks a severity tie on the most recently seen, so a recurring problem rises', () => {
    const cards = buildAnomalyCardViews(t, [
      anomaly({ anomalyId: 'older', lastSeenAt: '2026-01-01T00:00:00.000Z' }),
      anomaly({ anomalyId: 'newer', lastSeenAt: '2026-08-01T00:00:00.000Z' }),
    ]);

    expect(cards.map((card) => card.id)).toEqual(['newer', 'older']);
  });

  it('offers the open lifecycle moves and a repair while an anomaly is open', () => {
    const [card] = buildAnomalyCardViews(t, [anomaly({ status: 'open' })]);

    expect(card?.canRepair).toBe(true);
    expect(card?.transitions.map((entry) => entry.key)).toEqual([
      'acknowledge',
      'resolve',
      'suppress',
    ]);
  });

  it.each(['resolved', 'suppressed'] as const)(
    'offers only reopen and no repair once an operator closed it as %s',
    (status) => {
      const [card] = buildAnomalyCardViews(t, [anomaly({ status })]);

      expect(card?.canRepair).toBe(false);
      expect(card?.transitions.map((entry) => entry.key)).toEqual(['reopen']);
    },
  );

  it('translates the severity and status through the shared catalog', () => {
    const [card] = buildAnomalyCardViews(t, [anomaly({ severity: 'high', status: 'open' })]);

    expect(card?.severityLabel).toBe('t:dataQuality.severityHigh');
    expect(card?.statusLabel).toBe('t:dataQuality.statusOpen');
  });

  it('names the affected resource by type and reference together', () => {
    const [card] = buildAnomalyCardViews(t, [
      anomaly({ resourceType: 'roster', resourceRef: 'roster-9' }),
    ]);

    expect(card?.resourceRef).toBe('roster · roster-9');
  });
});

describe('resolveAnomaliesPage', () => {
  it('reports no data before the query resolves, rather than an empty queue', () => {
    expect(resolveAnomaliesPage(undefined)).toEqual({ items: [], total: 0, hasData: false });
  });

  it('carries the items and the server total once it resolves', () => {
    const page = resolveAnomaliesPage({
      items: [...MOCK_ANOMALIES],
      total: 12,
      limit: 25,
      offset: 0,
    });

    expect(page).toMatchObject({ total: 12, hasData: true });
    expect(page.items).toHaveLength(MOCK_ANOMALIES.length);
  });
});
