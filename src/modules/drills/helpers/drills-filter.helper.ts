import type { TranslateParams } from '@/packages/i18n';

import { DRILLS_ALL_FILTER } from '../constants/drills.constants';
import type { Drill } from '../types/drills.types';
import type { DrillOptionView } from '../types/drills-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The three filter inputs the coach controls on the list screen. */
export interface DrillsFilterState {
  readonly search: string;
  readonly category: string;
  readonly status: string;
}

/** One option per vocabulary value, translated through its key map. */
export function buildDrillVocabularyOptions(
  t: Translate,
  values: readonly string[],
  labelKeys: Readonly<Record<string, string>>,
): readonly DrillOptionView[] {
  return values.map((value) => ({ value, label: t(labelKeys[value] ?? value) }));
}

/** "All" plus one option per vocabulary value — the list screen's filters. */
export function buildDrillFilterOptions(
  t: Translate,
  values: readonly string[],
  labelKeys: Readonly<Record<string, string>>,
  allLabelKey: string,
): readonly DrillOptionView[] {
  return [
    { value: DRILLS_ALL_FILTER, label: t(allLabelKey) },
    ...buildDrillVocabularyOptions(t, values, labelKeys),
  ];
}

function matchesDropdown(value: string, filter: string): boolean {
  return filter === DRILLS_ALL_FILTER || value === filter;
}

/**
 * Case-insensitive haystack across the fields a coach would actually search
 * by: the drill's own name, its objective, and its skill tags. The backend
 * list endpoint has no free-text search parameter, so this narrows the one
 * bounded page already on screen rather than issuing a second request.
 */
function matchesSearch(drill: Drill, needle: string): boolean {
  if (needle.trim() === '') {
    return true;
  }
  const haystack = [drill.name, drill.objective ?? '', ...drill.skillTags].join(' ').toLowerCase();
  return haystack.includes(needle.trim().toLowerCase());
}

/** Pure client-side narrowing over one bounded catalogue page. */
export function filterDrillItems(
  items: readonly Drill[],
  filter: DrillsFilterState,
): readonly Drill[] {
  return items.filter(
    (item) =>
      matchesSearch(item, filter.search) &&
      matchesDropdown(item.category, filter.category) &&
      matchesDropdown(item.status, filter.status),
  );
}
