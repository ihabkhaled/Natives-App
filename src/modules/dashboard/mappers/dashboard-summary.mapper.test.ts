import { assert, describe, expect, it } from 'vitest';

import { mapDashboardSummary } from './dashboard-summary.mapper';

type SummaryDto = Parameters<typeof mapDashboardSummary>[0];

const DTO: SummaryDto = {
  persona: 'coach',
  generatedAt: '2026-07-18T09:00:00.000Z',
  widgets: [
    {
      kind: 'member-standing',
      presentation: 'metric',
      status: 'ready',
      asOf: '2026-07-18T08:00:00.000Z',
      metric: { value: 3, displayValue: '#3', unit: 'rank', tone: 'positive' },
    },
    {
      kind: 'member-attendance',
      presentation: 'breakdown',
      status: 'ready',
      asOf: null,
      rows: [
        { key: 'present', labelKey: 'dashboard.attendancePresent', value: 8, displayValue: '8' },
      ],
    },
    {
      kind: 'coach-roster',
      presentation: 'tasks',
      status: 'partial',
      asOf: null,
      tasks: [
        {
          id: 't1',
          labelKey: 'dashboard.taskRsvpMatch',
          count: 2,
          tone: 'attention',
          occurredAt: '2026-07-20T17:00:00.000Z',
        },
        {
          id: 't2',
          labelKey: 'dashboard.taskUpdateRoster',
          count: null,
          tone: 'neutral',
          occurredAt: null,
        },
      ],
    },
  ],
};

describe('mapDashboardSummary', () => {
  it('renames the summary instant to the ISO convention', () => {
    const result = mapDashboardSummary(DTO);

    expect(result.persona).toBe('coach');
    expect(result.generatedAtIso).toBe('2026-07-18T09:00:00.000Z');
    expect(result.widgets).toHaveLength(3);
  });

  it('passes a metric widget through and renames its as-of instant', () => {
    const widget = mapDashboardSummary(DTO).widgets[0];
    assert(widget?.presentation === 'metric');

    expect(widget.asOfIso).toBe('2026-07-18T08:00:00.000Z');
    expect(widget.metric.value).toBe(3);
  });

  it('keeps breakdown rows intact', () => {
    const widget = mapDashboardSummary(DTO).widgets[1];
    assert(widget?.presentation === 'breakdown');

    expect(widget.rows[0]?.labelKey).toBe('dashboard.attendancePresent');
  });

  it('maps task occurredAt to occurredAtIso and preserves nulls', () => {
    const widget = mapDashboardSummary(DTO).widgets[2];
    assert(widget?.presentation === 'tasks');

    expect(widget.tasks[0]?.occurredAtIso).toBe('2026-07-20T17:00:00.000Z');
    expect(widget.tasks[1]?.occurredAtIso).toBeNull();
    expect(widget.tasks[1]?.count).toBeNull();
  });
});
