import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import { dashboardSummaryResponseSchema } from './dashboard-summary.schema';

const VALID = {
  persona: 'member',
  generatedAt: '2026-07-18T09:00:00.000Z',
  widgets: [
    {
      kind: 'member-standing',
      presentation: 'metric',
      status: 'ready',
      asOf: '2026-07-18T08:00:00.000Z',
      metric: { value: null, displayValue: null, unit: 'rank', tone: 'neutral' },
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
      kind: 'member-schedule',
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
      ],
    },
  ],
};

describe('dashboardSummaryResponseSchema', () => {
  it('accepts a persona-shaped summary with all three presentations', () => {
    const parsed = safeParseWithSchema(dashboardSummaryResponseSchema, VALID);

    expect(parsed.success).toBe(true);
  });

  it('accepts a null metric value as "not evaluated"', () => {
    const parsed = safeParseWithSchema(dashboardSummaryResponseSchema, VALID);

    expect(parsed.success).toBe(true);
  });

  it('rejects an unknown presentation discriminator', () => {
    const parsed = safeParseWithSchema(dashboardSummaryResponseSchema, {
      ...VALID,
      widgets: [{ kind: 'x', presentation: 'chart', status: 'ready', asOf: null }],
    });

    expect(parsed.success).toBe(false);
  });

  it('rejects an invalid tone enum', () => {
    const parsed = safeParseWithSchema(dashboardSummaryResponseSchema, {
      ...VALID,
      widgets: [
        {
          kind: 'member-standing',
          presentation: 'metric',
          status: 'ready',
          asOf: null,
          metric: { value: 1, displayValue: '1', unit: 'rank', tone: 'brilliant' },
        },
      ],
    });

    expect(parsed.success).toBe(false);
  });

  it('rejects a non-ISO generatedAt instant', () => {
    const parsed = safeParseWithSchema(dashboardSummaryResponseSchema, {
      ...VALID,
      generatedAt: 'yesterday',
    });

    expect(parsed.success).toBe(false);
  });
});
