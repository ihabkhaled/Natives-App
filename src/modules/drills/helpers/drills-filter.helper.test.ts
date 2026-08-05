import { describe, expect, it, vi } from 'vitest';

import { DRILLS_ALL_FILTER } from '../constants/drills.constants';
import type { Drill } from '../types/drills.types';
import {
  buildDrillFilterOptions,
  buildDrillVocabularyOptions,
  filterDrillItems,
} from './drills-filter.helper';

const t = vi.fn((key: string) => key);

function drill(overrides: Partial<Drill> & { id: string }): Drill {
  return {
    seasonId: null,
    name: 'Give-and-go break',
    category: 'throwing',
    objective: 'Build first-throw decision speed.',
    instructions: 'Pairs exchange give-and-go passes.',
    equipment: [],
    intensity: 'moderate',
    defaultDurationMinutes: 15,
    skillTags: ['throwing'],
    safetyNotes: null,
    mediaUrl: null,
    status: 'active',
    version: 1,
    ...overrides,
  };
}

describe('buildDrillVocabularyOptions', () => {
  it('builds one option per value, translated through its key map', () => {
    expect(
      buildDrillVocabularyOptions(t, ['low', 'high'], { low: 'k.low', high: 'k.high' }),
    ).toEqual([
      { value: 'low', label: 'k.low' },
      { value: 'high', label: 'k.high' },
    ]);
  });

  it('falls back to the raw value for a vocabulary member with no key mapped', () => {
    expect(buildDrillVocabularyOptions(t, ['unmapped'], {})).toEqual([
      { value: 'unmapped', label: 'unmapped' },
    ]);
  });
});

describe('buildDrillFilterOptions', () => {
  it('prepends an "all" option ahead of the vocabulary', () => {
    const options = buildDrillFilterOptions(
      t,
      ['low', 'high'],
      { low: 'k.low', high: 'k.high' },
      'k.all',
    );

    expect(options[0]).toEqual({ value: DRILLS_ALL_FILTER, label: 'k.all' });
    expect(options).toHaveLength(3);
  });
});

describe('filterDrillItems', () => {
  const items: readonly Drill[] = [
    drill({ id: 'd1', name: 'Give-and-go break', category: 'throwing', status: 'active' }),
    drill({
      id: 'd2',
      name: 'Zone breakdown',
      category: 'defense',
      status: 'archived',
      objective: 'Teach the zone shape.',
      skillTags: ['defense'],
    }),
  ];

  it('returns every item when every filter is "all" and search is blank', () => {
    expect(
      filterDrillItems(items, {
        search: '',
        category: DRILLS_ALL_FILTER,
        status: DRILLS_ALL_FILTER,
      }),
    ).toEqual(items);
  });

  it('narrows by category', () => {
    const result = filterDrillItems(items, {
      search: '',
      category: 'defense',
      status: DRILLS_ALL_FILTER,
    });
    expect(result.map((item) => item.id)).toEqual(['d2']);
  });

  it('narrows by status, so an archived drill can be isolated rather than hidden', () => {
    const result = filterDrillItems(items, {
      search: '',
      category: DRILLS_ALL_FILTER,
      status: 'archived',
    });
    expect(result.map((item) => item.id)).toEqual(['d2']);
  });

  it('matches search against the name', () => {
    const result = filterDrillItems(items, {
      search: 'zone',
      category: DRILLS_ALL_FILTER,
      status: DRILLS_ALL_FILTER,
    });
    expect(result.map((item) => item.id)).toEqual(['d2']);
  });

  it('matches search against the objective', () => {
    const result = filterDrillItems(items, {
      search: 'shape',
      category: DRILLS_ALL_FILTER,
      status: DRILLS_ALL_FILTER,
    });
    expect(result.map((item) => item.id)).toEqual(['d2']);
  });

  it('matches search against skill tags, case-insensitively', () => {
    const result = filterDrillItems(items, {
      search: 'DEFENSE',
      category: DRILLS_ALL_FILTER,
      status: DRILLS_ALL_FILTER,
    });
    expect(result.map((item) => item.id)).toEqual(['d2']);
  });

  it('matches search against the name even when the drill has no objective', () => {
    const noObjective = [drill({ id: 'd3', name: 'Cone weave', objective: null })];

    expect(
      filterDrillItems(noObjective, {
        search: 'cone',
        category: DRILLS_ALL_FILTER,
        status: DRILLS_ALL_FILTER,
      }),
    ).toHaveLength(1);
  });

  it('combines search and dropdown filters', () => {
    const result = filterDrillItems(items, {
      search: 'zone',
      category: 'throwing',
      status: DRILLS_ALL_FILTER,
    });
    expect(result).toEqual([]);
  });
});
