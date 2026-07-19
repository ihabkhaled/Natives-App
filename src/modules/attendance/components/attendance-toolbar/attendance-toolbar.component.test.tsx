import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAttendanceScreenView } from '../../../../../tests/factories/attendance-view.factory';
import { fireIonChange, fireIonInput } from '../../../../../tests/setup/ionic-events.helper';
import { AttendanceToolbar } from './attendance-toolbar.component';

describe('AttendanceToolbar', () => {
  it('drives search, select-all and every bulk mark action', () => {
    const view = buildAttendanceScreenView({ canUndo: true });
    render(<AttendanceToolbar {...view} />);

    fireIonInput(screen.getByTestId(TEST_IDS.attendanceSearch), 'alex');
    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceSelectAll));
    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceMarkAllPresent));
    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceMarkSelectedPresent));
    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceMarkSelectedAbsent));
    fireEvent.click(screen.getByTestId(TEST_IDS.attendanceUndo));

    expect(view.onSearchChange).toHaveBeenCalledWith('alex');
    expect(view.onSelectAllVisible).toHaveBeenCalledOnce();
    expect(view.onMarkAllPresent).toHaveBeenCalledOnce();
    expect(view.onMarkSelectedPresent).toHaveBeenCalledOnce();
    expect(view.onMarkSelectedAbsent).toHaveBeenCalledOnce();
    expect(view.onUndo).toHaveBeenCalledOnce();
  });

  it('maps the filter select between the all sentinel and a concrete status', () => {
    const view = buildAttendanceScreenView({ filterValue: 'present_late' });
    render(<AttendanceToolbar {...view} />);

    fireIonChange(screen.getByTestId(TEST_IDS.attendanceFilter), 'absent');
    expect(view.onFilterChange).toHaveBeenLastCalledWith('absent');

    fireIonChange(screen.getByTestId(TEST_IDS.attendanceFilter), 'all');
    expect(view.onFilterChange).toHaveBeenLastCalledWith(null);
  });
});
