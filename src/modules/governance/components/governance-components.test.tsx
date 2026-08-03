import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildMeetingCardView,
  buildTaskCardView,
} from '../../../../tests/factories/governance-view.factory';
import { MeetingCard } from './meeting-card';
import { TaskCard } from './task-card';

describe('MeetingCard', () => {
  it('names the meeting, when it sits, and who may read it', () => {
    render(<MeetingCard view={buildMeetingCardView()} />);

    expect(screen.getByRole('heading', { name: 'Season 26/27 kickoff' })).toBeInTheDocument();
    // StatusChip renders a visible label plus an sr-only twin.
    expect(screen.getAllByText('Board only').length).toBeGreaterThan(0);
  });

  it('lists the decisions a meeting recorded', () => {
    render(
      <MeetingCard
        view={buildMeetingCardView({ decisions: ['Approve the kit order', 'Open tryouts'] })}
      />,
    );

    expect(screen.getByText('Approve the kit order')).toBeInTheDocument();
    expect(screen.getByText('Open tryouts')).toBeInTheDocument();
  });

  it('renders no decision list at all when none were recorded', () => {
    render(
      <MeetingCard
        view={buildMeetingCardView({ decisions: [], decisionsLabel: 'No decisions recorded.' })}
      />,
    );

    expect(screen.getByText('No decisions recorded.')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('tones the visibility chip down while the minutes are unsettled', () => {
    render(
      <MeetingCard
        view={buildMeetingCardView({
          isMinutesApproved: false,
          minutesLabel: 'Minutes not approved yet',
        })}
      />,
    );

    expect(screen.getByText('Minutes not approved yet')).toBeInTheDocument();
  });

  it('says whether the minutes are settled', () => {
    render(<MeetingCard view={buildMeetingCardView({ minutesLabel: 'Minutes approved' })} />);

    expect(screen.getByText('Minutes approved')).toBeInTheDocument();
  });
});

describe('TaskCard', () => {
  it('names the task with its priority and status', () => {
    render(<TaskCard view={buildTaskCardView()} />);

    expect(screen.getByRole('heading', { name: 'Place the kit order' })).toBeInTheDocument();
    expect(screen.getAllByText('Urgent').length).toBeGreaterThan(0);
  });

  it('says there is no due date rather than printing an empty one', () => {
    render(<TaskCard view={buildTaskCardView({ dueDate: null, dueLabel: 'No due date' })} />);

    expect(screen.getByText('No due date')).toBeInTheDocument();
  });

  it('omits the description when a task has none', () => {
    render(<TaskCard view={buildTaskCardView({ description: null })} />);

    expect(screen.queryByText('Confirm sizes before ordering.')).not.toBeInTheDocument();
  });

  it('says what a blocked task is waiting on', () => {
    render(<TaskCard view={buildTaskCardView({ blockedNotice: 'Waiting on another task' })} />);

    expect(screen.getByText('Waiting on another task')).toBeInTheDocument();
  });

  it('shows no blocked notice for work that can proceed', () => {
    render(<TaskCard view={buildTaskCardView({ blockedNotice: null })} />);

    expect(screen.queryByText('Waiting on another task')).not.toBeInTheDocument();
  });

  it('shows a closed task without the urgent tone', () => {
    render(<TaskCard view={buildTaskCardView({ isClosed: true, statusLabel: 'Completed' })} />);

    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
  });

  it('renders a due date as a machine-readable time', () => {
    render(<TaskCard view={buildTaskCardView({ dueDate: '2026-09-15', dueLabel: 'Due' })} />);

    expect(screen.getByTestId(`${TEST_IDS.governanceTaskCard}-task-1`)).toBeInTheDocument();
    expect(screen.getByText(': 2026-09-15')).toBeInTheDocument();
  });
});
