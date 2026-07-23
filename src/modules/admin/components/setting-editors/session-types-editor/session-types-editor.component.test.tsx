import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { SessionTypesValue } from '@/modules/admin/types/setting-values.types';

import { buildTestEditorContext } from '../../../../../../tests/factories/setting-editors.factory';
import {
  fireIonCheckboxChangeFromLabel,
  fireIonInput,
  fireIonInputCleared,
} from '../../../../../../tests/setup/ionic-events.helper';
import { SessionTypesEditor } from './session-types-editor.component';

const VALUE: SessionTypesValue = {
  types: [
    {
      code: 'practice',
      labelEn: 'Practice',
      labelAr: 'تدريب',
      color: 'primary',
      defaultDurationMinutes: 120,
      active: true,
    },
    {
      code: 'scrimmage',
      labelEn: 'Scrimmage',
      labelAr: 'مباراة ودية',
      color: 'accent1',
      active: true,
    },
  ],
};

function mountEditor(onChange = vi.fn()) {
  render(
    <SessionTypesEditor value={VALUE} onChange={onChange} context={buildTestEditorContext()} />,
  );
  return onChange;
}

describe('SessionTypesEditor', () => {
  it('renders free-coded rows with an optional duration', () => {
    mountEditor();

    expect(screen.getByTestId('admin-editor-row-code-0')).toHaveValue('practice');
    expect(screen.getByTestId('admin-editor-row-duration-0')).toHaveValue('120');
    expect(screen.getByTestId('admin-editor-row-duration-1')).toHaveValue('');
  });

  it('re-codes a type through its pattern-checked input', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-editor-row-code-1'), 'gym');

    const next = onChange.mock.calls[0]?.[0] as SessionTypesValue;
    expect(next.types[1]?.code).toBe('gym');
  });

  it('clears a duration back to "not provided"', () => {
    const onChange = mountEditor();

    fireIonInputCleared(screen.getByTestId('admin-editor-row-duration-0'));

    const next = onChange.mock.calls[0]?.[0] as SessionTypesValue;
    expect(next.types[0]?.defaultDurationMinutes).toBeUndefined();
  });

  it('offers removal, unlike the canonical status list', async () => {
    const onChange = mountEditor();

    await userEvent.click(screen.getAllByLabelText('settingEditors.remove')[1]!);

    const next = onChange.mock.calls[0]?.[0] as SessionTypesValue;
    expect(next.types.map((entry) => entry.code)).toEqual(['practice']);
  });

  it('appends a uniquely coded blank type', async () => {
    const onChange = mountEditor();

    await userEvent.click(screen.getByTestId('admin-editor-add'));

    const next = onChange.mock.calls[0]?.[0] as SessionTypesValue;
    expect(next.types).toHaveLength(3);
    expect(next.types[2]?.code).toBe('session_3');
  });

  it('archives a type by toggle and reorders through the move controls', async () => {
    const onChange = mountEditor();

    fireIonCheckboxChangeFromLabel(screen.getAllByText('settingEditors.active')[0]!, false);
    await userEvent.click(screen.getAllByLabelText('settingEditors.moveDown')[0]!);

    expect((onChange.mock.calls[0]?.[0] as SessionTypesValue).types[0]?.active).toBe(false);
    const moved = onChange.mock.calls[1]?.[0] as SessionTypesValue;
    expect(moved.types.map((entry) => entry.code)).toEqual(['scrimmage', 'practice']);
  });

  it('relabels a type bilingually through the shared label fields', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('type-0-label-en'), 'Training');
    fireIonInput(screen.getByTestId('type-1-label-ar'), 'ودية');

    expect((onChange.mock.calls[0]?.[0] as SessionTypesValue).types[0]?.labelEn).toBe('Training');
    expect((onChange.mock.calls[1]?.[0] as SessionTypesValue).types[1]?.labelAr).toBe('ودية');
  });
});
