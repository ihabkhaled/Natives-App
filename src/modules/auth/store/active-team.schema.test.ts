import { describe, expect, it } from 'vitest';

import { safeParseWithSchema } from '@/packages/schema';

import { persistedActiveTeamSchema } from './active-team.schema';

function parse(value: unknown): ReturnType<typeof safeParseWithSchema> {
  return safeParseWithSchema(persistedActiveTeamSchema, value);
}

describe('persistedActiveTeamSchema', () => {
  it('accepts a stored selection', () => {
    expect(parse({ selectedTeamId: 'team-1' })).toEqual({
      success: true,
      data: { selectedTeamId: 'team-1' },
    });
  });

  it('accepts an explicit "no selection yet"', () => {
    expect(parse({ selectedTeamId: null })).toEqual({
      success: true,
      data: { selectedTeamId: null },
    });
  });

  it('rejects an empty id, which would key every team-scoped query on nothing', () => {
    expect(parse({ selectedTeamId: '' }).success).toBe(false);
  });

  it('rejects a payload that is not the persisted shape at all', () => {
    expect(parse({ selectedTeamId: 7 }).success).toBe(false);
    expect(parse(null).success).toBe(false);
    expect(parse('team-1').success).toBe(false);
  });
});
