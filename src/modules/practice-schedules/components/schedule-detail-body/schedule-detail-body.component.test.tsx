import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeScheduleDetailScreenView } from '../../../../../tests/factories/practice-schedules-view.factory';
import { ScheduleDetailBody } from './schedule-detail-body.component';

describe('ScheduleDetailBody', () => {
  it('shows the status chip and the actions for an existing record', () => {
    render(<ScheduleDetailBody {...buildPracticeScheduleDetailScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.practiceScheduleStatus)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceScheduleDelete)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceScheduleGenerate)).toBeInTheDocument();
  });

  it('hides the status chip and the actions in create mode', () => {
    render(
      <ScheduleDetailBody {...buildPracticeScheduleDetailScreenView({ isCreateMode: true })} />,
    );

    expect(screen.queryByTestId(TEST_IDS.practiceScheduleStatus)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceScheduleDelete)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceScheduleGenerate)).not.toBeInTheDocument();
  });

  it('runs delete and generate from their own buttons', () => {
    const onDelete = vi.fn();
    const onGenerate = vi.fn();
    render(
      <ScheduleDetailBody
        {...buildPracticeScheduleDetailScreenView({ onDelete, onGenerate })}
      />,
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleDelete));
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleGenerate));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('renders no message region until an action has finished', () => {
    render(<ScheduleDetailBody {...buildPracticeScheduleDetailScreenView({ messages: [] })} />);

    expect(screen.queryByTestId(TEST_IDS.practiceScheduleMessages)).not.toBeInTheDocument();
  });

  it('announces a finished action in a live region', () => {
    render(
      <ScheduleDetailBody
        {...buildPracticeScheduleDetailScreenView({
          messages: [{ id: 'm1', text: 'Schedule saved.' }],
        })}
      />,
    );

    const messages = screen.getByTestId(TEST_IDS.practiceScheduleMessages);
    expect(messages).toHaveAttribute('role', 'status');
    expect(messages).toHaveTextContent('Schedule saved.');
  });
});
