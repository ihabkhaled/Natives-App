/**
 * Pure list operations for ordered editors. Array order is display order and
 * often rank, so moves swap adjacent entries and never lose one.
 */
export function moveArrayItem<T>(items: readonly T[], index: number, offset: -1 | 1): readonly T[] {
  const target = index + offset;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
    return items;
  }
  const next = [...items];
  const moved = next[index] as T;
  next[index] = next[target] as T;
  next[target] = moved;
  return next;
}

export function removeArrayItem<T>(items: readonly T[], index: number): readonly T[] {
  return items.filter((_, position) => position !== index);
}

export function replaceArrayItem<T>(items: readonly T[], index: number, item: T): readonly T[] {
  return items.map((existing, position) => (position === index ? item : existing));
}
