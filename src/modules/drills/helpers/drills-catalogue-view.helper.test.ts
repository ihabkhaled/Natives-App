import { describe, expect, it, vi } from 'vitest';

import type { RemoteQueryView } from '@/shared/view';

import { DRILLS_ALL_FILTER } from '../constants/drills.constants';
import type { Drill, DrillsPage } from '../types/drills.types';
import { buildDrillsCatalogueView } from './drills-catalogue-view.helper';

const t = vi.fn((key: string, params?: Record<string, unknown>) =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`,
);

function drill(overrides: Partial<Drill> & { id: string }): Drill {
  return {
    seasonId: null,
    name: 'Give-and-go break',
    category: 'throwing',
    objective: null,
    instructions: null,
    equipment: [],
    intensity: 'moderate',
    defaultDurationMinutes: null,
    skillTags: [],
    safetyNotes: null,
    mediaUrl: null,
    status: 'active',
    version: 1,
    ...overrides,
  };
}

function page(items: readonly Drill[]): DrillsPage {
  return { items: [...items], total: items.length, limit: 50, offset: 0 };
}

function queryView(
  overrides: Partial<RemoteQueryView<DrillsPage>> = {},
): RemoteQueryView<DrillsPage> {
  return { data: undefined, isLoading: false, error: null, refetch: vi.fn(), ...overrides };
}

const BASE_INPUT = {
  scope: { isOffline: false, isLoading: false },
  permitted: true,
  filter: { search: '', category: DRILLS_ALL_FILTER, status: DRILLS_ALL_FILTER },
  onSearchChange: vi.fn(),
  onCategoryFilterChange: vi.fn(),
  onStatusFilterChange: vi.fn(),
  onNewDrill: vi.fn(),
  onOpen: vi.fn(),
};

describe('buildDrillsCatalogueView', () => {
  it('reports the ready state once the page has items', () => {
    const items = [drill({ id: 'd1' }), drill({ id: 'd2', name: 'Zone breakdown' })];
    const view = buildDrillsCatalogueView(t, {
      ...BASE_INPUT,
      page: page(items),
      query: queryView({ data: page(items) }),
    });

    expect(view.status).toBe('ready');
    expect(view.items).toHaveLength(2);
    expect(view.hasMatches).toBe(true);
    expect(view.countLabel).toBe('drills.countSummary:{"shown":2,"total":2}');
  });

  it('narrows the visible cards by the active filter', () => {
    const items = [
      drill({ id: 'd1', name: 'Give-and-go break', category: 'throwing' }),
      drill({ id: 'd2', name: 'Zone breakdown', category: 'defense' }),
    ];
    const view = buildDrillsCatalogueView(t, {
      ...BASE_INPUT,
      page: page(items),
      query: queryView({ data: page(items) }),
      filter: { search: '', category: 'defense', status: DRILLS_ALL_FILTER },
    });

    expect(view.items.map((item) => item.id)).toEqual(['d2']);
    expect(view.hasMatches).toBe(true);
  });

  it('reports no matches when the filter excludes every item, without being "empty"', () => {
    const items = [drill({ id: 'd1' })];
    const view = buildDrillsCatalogueView(t, {
      ...BASE_INPUT,
      page: page(items),
      query: queryView({ data: page(items) }),
      filter: {
        search: 'nothing matches this',
        category: DRILLS_ALL_FILTER,
        status: DRILLS_ALL_FILTER,
      },
    });

    expect(view.hasMatches).toBe(false);
    expect(view.items).toEqual([]);
    // The page genuinely has data, so the shared status is "ready" — the
    // no-matches copy is what the list screen renders instead of its children.
    expect(view.status).toBe('ready');
  });

  it('reports empty when the catalogue itself has nothing yet', () => {
    const view = buildDrillsCatalogueView(t, {
      ...BASE_INPUT,
      page: page([]),
      query: queryView({ data: page([]) }),
    });

    expect(view.status).toBe('empty');
  });

  it('withholds the screen from a principal without the grant', () => {
    const view = buildDrillsCatalogueView(t, {
      ...BASE_INPUT,
      page: undefined,
      query: queryView(),
      permitted: false,
    });

    expect(view.status).toBe('forbidden');
  });

  it('reports loading while the scope or the query is still resolving', () => {
    const view = buildDrillsCatalogueView(t, {
      ...BASE_INPUT,
      page: undefined,
      query: queryView({ isLoading: true }),
    });

    expect(view.status).toBe('loading');
  });

  it('reports the error state and forwards retry', () => {
    const onRetry = vi.fn();
    const view = buildDrillsCatalogueView(t, {
      ...BASE_INPUT,
      page: undefined,
      query: queryView({
        error: { code: 'SERVER_ERROR', message: 'x' } as never,
        refetch: onRetry,
      }),
    });

    expect(view.status).toBe('error');
    view.onRetry();
    expect(onRetry).toHaveBeenCalled();
  });

  it('builds the category and status filter options with an "all" entry', () => {
    const view = buildDrillsCatalogueView(t, {
      ...BASE_INPUT,
      page: page([]),
      query: queryView({ data: page([]) }),
    });

    expect(view.categoryOptions[0]).toEqual({
      value: DRILLS_ALL_FILTER,
      label: 'drills.filterAll',
    });
    expect(view.statusOptions[0]).toEqual({ value: DRILLS_ALL_FILTER, label: 'drills.filterAll' });
  });

  it('wires the new-drill and open callbacks straight through', () => {
    const view = buildDrillsCatalogueView(t, {
      ...BASE_INPUT,
      page: page([]),
      query: queryView({ data: page([]) }),
    });

    view.onNewDrill();
    view.onOpen('d1');

    expect(BASE_INPUT.onNewDrill).toHaveBeenCalled();
    expect(BASE_INPUT.onOpen).toHaveBeenCalledWith('d1');
  });
});
