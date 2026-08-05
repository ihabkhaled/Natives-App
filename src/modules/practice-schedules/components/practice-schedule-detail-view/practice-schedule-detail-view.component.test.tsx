import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeScheduleDetailScreenView } from '../../../../../tests/factories/practice-schedules-view.factory';
import { PracticeScheduleDetailView } from './practice-schedule-detail-view.component';

describe('PracticeScheduleDetailView', () => {
  it('renders the form and the schedule status when ready', () => {
    render(<PracticeScheduleDetailView {...buildPracticeScheduleDetailScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.practiceScheduleForm)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceScheduleStatus)).toHaveTextContent('Active');
  });

  it('hides the status chip, delete, and generate in create mode', () => {
    render(
      <PracticeScheduleDetailView
        {...buildPracticeScheduleDetailScreenView({ isCreateMode: true })}
      />,
    );

    expect(screen.queryByTestId(TEST_IDS.practiceScheduleStatus)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceScheduleDelete)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceScheduleGenerate)).not.toBeInTheDocument();
  });

  it('shows the permission state and no form when forbidden', () => {
    render(
      <PracticeScheduleDetailView
        {...buildPracticeScheduleDetailScreenView({ isForbidden: true, isLoading: true })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceScheduleDetailForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceScheduleForm)).not.toBeInTheDocument();
  });

  it('shows the loader while the record is still arriving', () => {
    render(
      <PracticeScheduleDetailView
        {...buildPracticeScheduleDetailScreenView({ isLoading: true })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceScheduleDetailLoading)).toBeInTheDocument();
  });

  it('shows the error state once the read has failed', () => {
    render(
      <PracticeScheduleDetailView {...buildPracticeScheduleDetailScreenView({ hasError: true })} />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceScheduleDetailError)).toBeInTheDocument();
  });

  it('runs back, delete, and generate from their own controls', () => {
    const onBack = vi.fn();
    const onDelete = vi.fn();
    const onGenerate = vi.fn();
    render(
      <PracticeScheduleDetailView
        {...buildPracticeScheduleDetailScreenView({ onBack, onDelete, onGenerate })}
      />,
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleBack));
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleDelete));
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceScheduleGenerate));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('toggles a weekday from its own toggle button', () => {
    const onWeekdayToggle = vi.fn();
    render(
      <PracticeScheduleDetailView
        {...buildPracticeScheduleDetailScreenView({
          form: {
            ...buildPracticeScheduleDetailScreenView().form,
            onWeekdayToggle,
          },
        })}
      />,
    );

    fireEvent.click(screen.getByText('Sun'));

    expect(onWeekdayToggle).toHaveBeenCalledWith(0);
  });

  /**
   * Announced, not merely rendered: a coach who presses generate is usually
   * looking at the calendar next, not the button, when the answer arrives.
   */
  it('announces the outcome in a live region', () => {
    render(
      <PracticeScheduleDetailView
        {...buildPracticeScheduleDetailScreenView({
          messages: [{ id: 'm1', text: 'Created 3 new sessions.' }],
        })}
      />,
    );

    const messages = screen.getByTestId(TEST_IDS.practiceScheduleMessages);
    expect(messages).toHaveAttribute('role', 'status');
    expect(messages).toHaveTextContent('Created 3 new sessions.');
  });
});
