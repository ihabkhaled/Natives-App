import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeRemindersScreenView } from '../../../../../tests/factories/practice-reminders-view.factory';
import { PracticeRemindersView } from './practice-reminders-view.component';

describe('PracticeRemindersView', () => {
  it('renders the counts, window, and due kinds when ready', () => {
    render(<PracticeRemindersView {...buildPracticeRemindersScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.practiceRemindersNoResponse)).toHaveTextContent(
      '4 have not replied',
    );
    expect(screen.getByTestId(TEST_IDS.practiceRemindersWindow)).toHaveTextContent(
      'The reminder window is open.',
    );
    expect(screen.getByTestId(TEST_IDS.practiceRemindersKinds)).toBeInTheDocument();
  });

  it('shows the permission state and no actions when forbidden', () => {
    render(
      <PracticeRemindersView
        {...buildPracticeRemindersScreenView({ isForbidden: true, isLoading: true })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceRemindersForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceRemindersLoading)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceRemindersDispatch)).not.toBeInTheDocument();
  });

  it('shows the loader while the status is still arriving', () => {
    render(<PracticeRemindersView {...buildPracticeRemindersScreenView({ isLoading: true })} />);

    expect(screen.getByTestId(TEST_IDS.practiceRemindersLoading)).toBeInTheDocument();
  });

  it('shows the error state once the read has failed', () => {
    render(<PracticeRemindersView {...buildPracticeRemindersScreenView({ hasError: true })} />);

    expect(screen.getByTestId(TEST_IDS.practiceRemindersError)).toBeInTheDocument();
  });

  it('explains rather than lists when nothing is due', () => {
    render(<PracticeRemindersView {...buildPracticeRemindersScreenView({ kindLabels: [] })} />);

    expect(screen.queryByTestId(TEST_IDS.practiceRemindersKinds)).not.toBeInTheDocument();
    expect(screen.getByText('Nothing is due for this session right now.')).toBeInTheDocument();
  });

  it('runs each action from its own button', () => {
    const onDispatch = vi.fn();
    const onTest = vi.fn();
    render(<PracticeRemindersView {...buildPracticeRemindersScreenView({ onDispatch, onTest })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRemindersDispatch));
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRemindersTest));

    expect(onDispatch).toHaveBeenCalledTimes(1);
    expect(onTest).toHaveBeenCalledTimes(1);
  });

  /**
   * Announced, not merely rendered: a coach who presses send is usually
   * looking at the roster rather than the button when the answer arrives.
   */
  it('announces the outcome in a live region', () => {
    render(
      <PracticeRemindersView
        {...buildPracticeRemindersScreenView({
          messages: [{ id: 'm1', text: 'Queued 1 of 4.' }],
        })}
      />,
    );

    const messages = screen.getByTestId(TEST_IDS.practiceRemindersMessages);
    expect(messages).toHaveAttribute('role', 'status');
    expect(messages).toHaveTextContent('Queued 1 of 4.');
  });
});
