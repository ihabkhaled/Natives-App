import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WeightsEditorContext } from '@/modules/admin/components/setting-editors/setting-editors.types';
import type { AttendanceWeightsValue } from '@/modules/admin/types/setting-values.types';

import { buildTestEditorContext } from '../../../../../../tests/factories/setting-editors.factory';
import {
  fireIonInput,
  fireIonInputCleared,
} from '../../../../../../tests/setup/ionic-events.helper';
import { AttendanceWeightsEditor } from './attendance-weights-editor.component';

const VALUE: AttendanceWeightsValue = { weights: { present_on_time: 1 } };

const ROWS = [
  { code: 'present_on_time', label: 'On time' },
  { code: 'absent', label: 'Absent' },
];

function mountEditor(
  onChange = vi.fn(),
  weights: WeightsEditorContext = { rows: ROWS, blockedNotice: null, loadingNotice: null },
) {
  render(
    <AttendanceWeightsEditor
      value={VALUE}
      onChange={onChange}
      context={buildTestEditorContext({ weights })}
    />,
  );
  return onChange;
}

describe('AttendanceWeightsEditor', () => {
  it('derives one row per counting status, with no add or remove controls', () => {
    mountEditor();

    expect(screen.getAllByTestId('admin-editor-row')).toHaveLength(2);
    expect(screen.getByTestId('admin-editor-row-weight-absent')).toHaveValue('');
    expect(screen.queryByTestId('admin-editor-add')).not.toBeInTheDocument();
  });

  it('sets a weight for a derived row', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('admin-editor-row-weight-absent'), '0.25');

    expect(onChange).toHaveBeenCalledWith({ weights: { present_on_time: 1, absent: 0.25 } });
  });

  it('clears a weight back to "no weight" rather than zero', () => {
    const onChange = mountEditor();

    fireIonInputCleared(screen.getByTestId('admin-editor-row-weight-present_on_time'));

    expect(onChange).toHaveBeenCalledWith({ weights: {} });
  });

  it('blocks with the configure-statuses-first notice when rows cannot derive', () => {
    mountEditor(vi.fn(), {
      rows: [],
      blockedNotice: 'settingEditors.weightsBlocked',
      loadingNotice: null,
    });

    expect(screen.getByTestId('admin-weights-blocked')).toHaveTextContent(
      'settingEditors.weightsBlocked',
    );
  });

  it('reports while the as-of statuses are being resolved', () => {
    mountEditor(vi.fn(), {
      rows: [],
      blockedNotice: null,
      loadingNotice: 'settingEditors.weightsLoading',
    });

    expect(screen.getByText('settingEditors.weightsLoading')).toBeInTheDocument();
  });
});
