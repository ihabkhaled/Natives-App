import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildScheduleFormFieldsView } from '../../../../../tests/factories/practice-schedules-view.factory';
import { ScheduleForm } from './schedule-form.component';

describe('ScheduleForm', () => {
  it('renders every field with its loaded value', () => {
    render(<ScheduleForm {...buildScheduleFormFieldsView()} />);

    expect(screen.getByTestId(TEST_IDS.practiceScheduleNameInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceScheduleWeekdayToggle)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceScheduleForm)).toBeInTheDocument();
  });

  it('shows the save button loading while the write is in flight', () => {
    render(<ScheduleForm {...buildScheduleFormFieldsView({ isSaving: true, saveLabel: 'Saving…' })} />);

    expect(screen.getByTestId(TEST_IDS.practiceScheduleSave)).toHaveTextContent('Saving…');
  });

  it('submits the form through its own submit handler', () => {
    const onSubmit = vi.fn((event: React.SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
    });
    render(<ScheduleForm {...buildScheduleFormFieldsView({ onSubmit })} />);

    fireEvent.submit(screen.getByTestId(TEST_IDS.practiceScheduleForm));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
