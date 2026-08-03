import { describe, expect, it } from 'vitest';

import { MOCK_JERSEY_EXPORT_LINES } from '@/tests/msw/jersey.fixture';

import type { SupplierExportLine } from '../types/jersey.types';
import { buildJerseyOrderLineViews } from './jersey-export-view.helper';

function line(overrides: Partial<SupplierExportLine> = {}): SupplierExportLine {
  return { ...MOCK_JERSEY_EXPORT_LINES[0], ...overrides } as SupplierExportLine;
}

describe('buildJerseyOrderLineViews', () => {
  it('keeps the server’s order, because it is the sheet the supplier reads', () => {
    const views = buildJerseyOrderLineViews('en', MOCK_JERSEY_EXPORT_LINES);

    expect(views.map((view) => view.sizeLabel)).toEqual(['M', 'L', 'XL']);
  });

  it('names the garment and its quantity without a unit word', () => {
    const [view] = buildJerseyOrderLineViews('en', [
      line({ productName: 'Home jersey 2026', quantity: 4 }),
    ]);

    expect(view?.productName).toBe('Home jersey 2026');
    expect(view?.quantityLabel).toBe('×4');
  });

  it('joins the number and the printed name into one personalization', () => {
    const [view] = buildJerseyOrderLineViews('en', [line({ number: 7, printedName: 'ADEL' })]);

    expect(view?.personalization).toBe('#7 · ADEL');
  });

  it.each([
    [{ number: 7, printedName: null }, '#7'],
    [{ number: null, printedName: 'ADEL' }, 'ADEL'],
  ])('reports whichever half of the personalization exists', (overrides, expected) => {
    const [view] = buildJerseyOrderLineViews('en', [line(overrides)]);

    expect(view?.personalization).toBe(expected);
  });

  it('reports no personalization at all for a plain stock line', () => {
    // Null rather than a placeholder: a reader can then tell at a glance which
    // lines carry a person's identity out to the supplier.
    const [view] = buildJerseyOrderLineViews('en', [line({ number: null, printedName: null })]);

    expect(view?.personalization).toBeNull();
  });

  it('carries the kit and sleeve the supplier must make', () => {
    const [view] = buildJerseyOrderLineViews('en', [line({ kitType: 'away', sleeves: 'long' })]);

    expect(view?.kitLabel).toBe('away');
    expect(view?.sleevesLabel).toBe('long');
  });

  it('gives every line a distinct key even when two lines are identical', () => {
    const views = buildJerseyOrderLineViews('en', [line(), line()]);

    expect(views.map((view) => view.id)).toEqual(['0', '1']);
  });
});
