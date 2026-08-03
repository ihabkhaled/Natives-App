import { formatNumber } from '@/packages/number';

import type { SupplierExportLine } from '../types/jersey.types';
import type { JerseyOrderLineView } from '../types/jersey-view.types';

/**
 * The name and number that will be printed on the garment, or null when the
 * line is plain stock.
 *
 * Returning null rather than a placeholder is the point: a reader can tell at
 * a glance which lines carry a person's identity out to the supplier and which
 * are anonymous inventory.
 */
function personalizationOf(line: SupplierExportLine, locale: string): string | null {
  const parts: string[] = [];
  if (line.number !== null) {
    parts.push(`#${formatNumber(line.number, locale)}`);
  }
  if (line.printedName !== null) {
    parts.push(line.printedName);
  }
  return parts.length === 0 ? null : parts.join(' · ');
}

/**
 * The supplier packing list as rows, in the server's order.
 *
 * Deliberately unsorted: this is the document the supplier receives, and a
 * screen that reorders it would disagree with the sheet someone is reading off
 * in a warehouse.
 */
export function buildJerseyOrderLineViews(
  locale: string,
  lines: readonly SupplierExportLine[],
): readonly JerseyOrderLineView[] {
  return lines.map((line, index) => ({
    id: String(index),
    productName: line.productName,
    kitLabel: line.kitType,
    sizeLabel: line.size.toUpperCase(),
    sleevesLabel: line.sleeves,
    quantityLabel: `×${formatNumber(line.quantity, locale)}`,
    personalization: personalizationOf(line, locale),
  }));
}
