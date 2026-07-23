import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AttendanceStatusesValue } from '@/modules/admin/types/setting-values.types';

import { buildTestEditorContext } from '../../../../../../tests/factories/setting-editors.factory';
import {
  fireIonChange,
  fireIonCheckboxChangeFromLabel,
  fireIonInput,
} from '../../../../../../tests/setup/ionic-events.helper';
import { AttendanceStatusesEditor } from './attendance-statuses-editor.component';

const VALUE: AttendanceStatusesValue = {
  statuses: [
    {
      code: 'present_on_time',
      labelEn: 'On time',
      labelAr: 'في الموعد',
      color: 'success',
      countsTowardMetrics: true,
      allowSelfCheckIn: true,
      active: true,
    },
    {
      code: 'absent',
      labelEn: 'Absent',
      labelAr: 'غائب',
      color: 'danger',
      countsTowardMetrics: true,
      allowSelfCheckIn: false,
      active: true,
    },
  ],
};

function mountEditor(onChange = vi.fn()) {
  render(
    <AttendanceStatusesEditor
      value={VALUE}
      onChange={onChange}
      context={buildTestEditorContext()}
    />,
  );
  return onChange;
}

describe('AttendanceStatusesEditor', () => {
  it('renders one reorderable row per status with its bilingual labels', () => {
    mountEditor();

    expect(screen.getAllByTestId('admin-editor-row')).toHaveLength(2);
    expect(screen.getByTestId('status-0-label-en')).toHaveValue('On time');
    expect(screen.getByTestId('status-1-label-ar')).toHaveValue('غائب');
  });

  it('emits a typed value when a label is edited', () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('status-0-label-en'), 'Prompt');

    expect(onChange).toHaveBeenCalledWith({
      statuses: [{ ...VALUE.statuses[0], labelEn: 'Prompt' }, VALUE.statuses[1]],
    });
  });

  it('moves a status down while keeping its stable code', async () => {
    const onChange = mountEditor();

    await userEvent.click(screen.getAllByLabelText('settingEditors.moveDown')[0]!);

    const next = onChange.mock.calls[0]?.[0] as AttendanceStatusesValue;
    expect(next.statuses.map((entry) => entry.code)).toEqual(['absent', 'present_on_time']);
  });

  it('archives by toggle and never offers a delete control', () => {
    const onChange = mountEditor();

    fireIonCheckboxChangeFromLabel(screen.getAllByText('settingEditors.active')[0]!, false);

    const next = onChange.mock.calls[0]?.[0] as AttendanceStatusesValue;
    expect(next.statuses[0]?.active).toBe(false);
    expect(screen.queryByLabelText('settingEditors.remove')).not.toBeInTheDocument();
  });

  it('adds the first unused canonical code from the add control', async () => {
    const onChange = mountEditor();

    await userEvent.click(screen.getByTestId('admin-editor-add'));

    const next = onChange.mock.calls[0]?.[0] as AttendanceStatusesValue;
    expect(next.statuses[2]?.code).toBe('present_late');
  });

  it('re-codes a row through the constrained select', () => {
    const onChange = mountEditor();

    fireIonChange(screen.getByTestId('admin-editor-row-code-1'), 'excused');

    const next = onChange.mock.calls[0]?.[0] as AttendanceStatusesValue;
    expect(next.statuses[1]?.code).toBe('excused');
  });

  it('recolours a row through the token select', () => {
    const onChange = mountEditor();

    fireIonChange(screen.getByTestId('status-0-color'), 'accent1');

    const next = onChange.mock.calls[0]?.[0] as AttendanceStatusesValue;
    expect(next.statuses[0]?.color).toBe('accent1');
  });

  it('edits the Arabic label and moves a status up', async () => {
    const onChange = mountEditor();

    fireIonInput(screen.getByTestId('status-1-label-ar'), 'متغيب');
    await userEvent.click(screen.getAllByLabelText('settingEditors.moveUp')[1]!);

    expect((onChange.mock.calls[0]?.[0] as AttendanceStatusesValue).statuses[1]?.labelAr).toBe(
      'متغيب',
    );
    const moved = onChange.mock.calls[1]?.[0] as AttendanceStatusesValue;
    expect(moved.statuses.map((entry) => entry.code)).toEqual(['absent', 'present_on_time']);
  });

  it('toggles metric counting and self check-in independently', () => {
    const onChange = mountEditor();

    fireIonCheckboxChangeFromLabel(
      screen.getAllByText('settingEditors.countsTowardMetrics')[1]!,
      false,
    );
    fireIonCheckboxChangeFromLabel(
      screen.getAllByText('settingEditors.allowSelfCheckIn')[0]!,
      false,
    );

    expect(
      (onChange.mock.calls[0]?.[0] as AttendanceStatusesValue).statuses[1]?.countsTowardMetrics,
    ).toBe(false);
    expect(
      (onChange.mock.calls[1]?.[0] as AttendanceStatusesValue).statuses[0]?.allowSelfCheckIn,
    ).toBe(false);
  });
});
