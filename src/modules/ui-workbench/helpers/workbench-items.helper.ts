export interface WorkbenchItem {
  readonly id: string;
  readonly index: number;
  readonly label: string;
}

/** Deterministic demo dataset for the virtualized list. */
export function buildWorkbenchItems(
  count: number,
  buildLabel: (index: number) => string,
): readonly WorkbenchItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `workbench-item-${String(index)}`,
    index,
    label: buildLabel(index),
  }));
}
