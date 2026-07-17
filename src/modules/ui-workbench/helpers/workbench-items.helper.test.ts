import { describe, expect, it, vi } from 'vitest';

import { buildWorkbenchItems } from './workbench-items.helper';

function label(index: number): string {
  return `Item ${String(index)}`;
}

describe('buildWorkbenchItems', () => {
  it('builds exactly the requested number of items', () => {
    expect(buildWorkbenchItems(3, label)).toHaveLength(3);
    expect(buildWorkbenchItems(500, label)).toHaveLength(500);
  });

  it('returns an empty dataset for a count of zero', () => {
    expect(buildWorkbenchItems(0, label)).toEqual([]);
  });

  it('numbers items from zero upwards', () => {
    expect(buildWorkbenchItems(3, label).map((item) => item.index)).toEqual([0, 1, 2]);
  });

  it('derives a stable, unique id per index', () => {
    const items = buildWorkbenchItems(3, label);

    expect(items.map((item) => item.id)).toEqual([
      'workbench-item-0',
      'workbench-item-1',
      'workbench-item-2',
    ]);
  });

  it('keeps ids unique across a large dataset', () => {
    const ids = buildWorkbenchItems(500, label).map((item) => item.id);

    expect(new Set(ids).size).toBe(500);
  });

  it('is deterministic: the same count yields the same dataset', () => {
    expect(buildWorkbenchItems(4, label)).toEqual(buildWorkbenchItems(4, label));
  });

  it('labels every item through the injected builder', () => {
    const items = buildWorkbenchItems(2, label);

    expect(items[0]!.label).toBe('Item 0');
    expect(items[1]!.label).toBe('Item 1');
  });

  it('calls the label builder once per item with the zero-based index', () => {
    const buildLabel = vi.fn(label);

    buildWorkbenchItems(3, buildLabel);

    expect(buildLabel).toHaveBeenCalledTimes(3);
    expect(buildLabel.mock.calls).toEqual([[0], [1], [2]]);
  });

  it('leaves label wording entirely to the caller, so copy stays translatable', () => {
    const items = buildWorkbenchItems(1, (index) => `عنصر ${String(index)}`);

    expect(items[0]).toEqual({ id: 'workbench-item-0', index: 0, label: 'عنصر 0' });
  });
});
