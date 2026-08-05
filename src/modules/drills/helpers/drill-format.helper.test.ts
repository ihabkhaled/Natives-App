import { describe, expect, it, vi } from 'vitest';

import { formatDrillDuration, formatTagsSummary } from './drill-format.helper';

const t = vi.fn((key: string, params?: Record<string, unknown>) =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`,
);

describe('formatDrillDuration', () => {
  it('reports the honest "no default duration" when unset', () => {
    expect(formatDrillDuration(t, null)).toBe('drills.noDurationLabel');
  });

  it('interpolates the minutes when set', () => {
    expect(formatDrillDuration(t, 15)).toBe('drills.durationLabel:{"minutes":15}');
  });
});

describe('formatTagsSummary', () => {
  it('reports the honest "no tags yet" placeholder for an untagged drill', () => {
    expect(formatTagsSummary(t, [])).toBe('drills.noTagsLabel');
  });

  it('joins the tags when present', () => {
    expect(formatTagsSummary(t, ['throwing', 'footwork'])).toBe('throwing, footwork');
  });
});
