import type { MemberDirectoryItem, MembersFilterState } from '../types/members.types';

/** Case/diacritic-insensitive haystack for one directory row. */
function matchesSearch(item: MemberDirectoryItem, needle: string): boolean {
  if (needle === '') {
    return true;
  }
  const jersey = item.jerseyNumber === null ? '' : String(item.jerseyNumber);
  const haystack = [item.displayName, item.nickname ?? '', jersey, ...item.positions]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle.trim().toLowerCase());
}

function matchesStatus(item: MemberDirectoryItem, filter: MembersFilterState): boolean {
  return filter.status === null || item.status === filter.status;
}

function matchesPosition(item: MemberDirectoryItem, filter: MembersFilterState): boolean {
  return filter.position === null || item.positions.includes(filter.position);
}

/** Pure client-side filter over one bounded directory page. */
export function filterDirectoryItems(
  items: readonly MemberDirectoryItem[],
  filter: MembersFilterState,
): readonly MemberDirectoryItem[] {
  return items.filter(
    (item) =>
      matchesSearch(item, filter.search) &&
      matchesStatus(item, filter) &&
      matchesPosition(item, filter),
  );
}

/** Distinct, sorted position keys present in the page — the filter's options. */
export function collectPositionOptions(items: readonly MemberDirectoryItem[]): readonly string[] {
  const positions = new Set<string>();
  for (const item of items) {
    for (const position of item.positions) {
      positions.add(position);
    }
  }
  return [...positions].sort((first, second) => first.localeCompare(second));
}
