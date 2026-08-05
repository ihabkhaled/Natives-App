import { describe, expect, it } from 'vitest';

import { describeGeneration } from './generate-outcome.helper';

const KEYS = {
  created: 'created',
  createdWithSkipped: 'createdWithSkipped',
  nothingNew: 'nothingNew',
  nothingToGenerate: 'nothingToGenerate',
} as const;

describe('describeGeneration', () => {
  /**
   * A window with no occurrences at all is a different story from a window
   * that was already fully generated — conflating them would tell a coach who
   * just extended the window that nothing happened.
   */
  it('reports a genuinely empty window as nothing to generate', () => {
    expect(describeGeneration({ created: 0, skipped: 0 }, KEYS)).toEqual({
      key: 'nothingToGenerate',
      params: {},
    });
  });

  it('reports an idempotent re-run as nothing new, naming what was skipped', () => {
    expect(describeGeneration({ created: 0, skipped: 3 }, KEYS)).toEqual({
      key: 'nothingNew',
      params: { skipped: 3 },
    });
  });

  it('names both counts when a run both created and skipped occurrences', () => {
    expect(describeGeneration({ created: 2, skipped: 1 }, KEYS)).toEqual({
      key: 'createdWithSkipped',
      params: { created: 2, skipped: 1 },
    });
  });

  it('reports a clean run with only the created count', () => {
    expect(describeGeneration({ created: 3, skipped: 0 }, KEYS)).toEqual({
      key: 'created',
      params: { created: 3 },
    });
  });
});
