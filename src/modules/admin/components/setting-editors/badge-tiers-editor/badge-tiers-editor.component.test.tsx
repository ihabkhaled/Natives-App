import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { BadgeTiersValue } from '@/modules/admin/types/setting-values.types';

import { buildTestEditorContext } from '../../../../../../tests/factories/setting-editors.factory';
import { fireIonChange, fireIonInput } from '../../../../../../tests/setup/ionic-events.helper';
import { BadgeTiersEditor } from './badge-tiers-editor.component';

const VALUE: BadgeTiersValue = {
  tiers: [
    { key: 'bronze', labelEn: 'Bronze', labelAr: 'برونزي', threshold: 100, color: 'accent2' },
    { key: 'silver', labelEn: 'Silver', labelAr: 'فضي', threshold: 250, color: 'neutral' },
  ],
};

function mountEditor(onChange = vi.fn()) {
  render(<BadgeTiersEditor value={VALUE} onChange={onChange} context={buildTestEditorContext()} />);
  return onChange;
}

describe('BadgeTiersEditor', () => {
  it('renders ranked tier rows with their thresholds', () => {
    mountEditor();

    expect(screen.getByTestId('admin-editor-row-key-0')).toHaveValue('bronze');
    expect(screen.getByTestId('admin-editor-row-threshold-1')).toHaveValue('250');
  });

  it('re-thresholds a tier as an integer patch', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-editor-row-threshold-1'), '300');

    const next = onChange.mock.calls[0]?.[0] as BadgeTiersValue;
    expect(next.tiers[1]?.threshold).toBe(300);
  });

  it('reorders ranks with the accessible move controls', async () => {
    const onChange = mountEditor();

    await userEvent.click(screen.getAllByLabelText('settingEditors.moveUp')[1]!);

    const next = onChange.mock.calls[0]?.[0] as BadgeTiersValue;
    expect(next.tiers.map((tier) => tier.key)).toEqual(['silver', 'bronze']);
  });

  it('appends a tier one point above the previous top', async () => {
    const onChange = mountEditor();

    await userEvent.click(screen.getByTestId('admin-editor-add'));

    const next = onChange.mock.calls[0]?.[0] as BadgeTiersValue;
    expect(next.tiers[2]?.threshold).toBe(251);
  });

  it('renames a tier key without touching its neighbours', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-editor-row-key-0'), 'copper');

    const next = onChange.mock.calls[0]?.[0] as BadgeTiersValue;
    expect(next.tiers[0]?.key).toBe('copper');
    expect(next.tiers[1]).toEqual(VALUE.tiers[1]);
  });

  it('relabels, recolours, removes, and moves tiers through their controls', async () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('tier-0-label-ar'), 'نحاسي');
    fireIonChange(screen.getByTestId('tier-1-color'), 'accent3');
    await userEvent.click(screen.getAllByLabelText('settingEditors.moveDown')[0]!);
    await userEvent.click(screen.getAllByLabelText('settingEditors.remove')[1]!);

    expect((onChange.mock.calls[0]?.[0] as BadgeTiersValue).tiers[0]?.labelAr).toBe('نحاسي');
    expect((onChange.mock.calls[1]?.[0] as BadgeTiersValue).tiers[1]?.color).toBe('accent3');
    expect((onChange.mock.calls[2]?.[0] as BadgeTiersValue).tiers[0]?.key).toBe('silver');
    expect((onChange.mock.calls[3]?.[0] as BadgeTiersValue).tiers).toHaveLength(1);
  });
});
