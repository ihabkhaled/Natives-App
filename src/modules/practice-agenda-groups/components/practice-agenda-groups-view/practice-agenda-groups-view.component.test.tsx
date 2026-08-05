import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPracticeAgendaGroupsScreenView } from '../../../../../tests/factories/practice-agenda-groups-view.factory';
import { PracticeAgendaGroupsView } from './practice-agenda-groups-view.component';

describe('PracticeAgendaGroupsView', () => {
  it('renders the resolved plan and groups when ready', () => {
    render(<PracticeAgendaGroupsView {...buildPracticeAgendaGroupsScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsPage)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsPlan)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsGroups)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCreateForm)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCopyForm)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsStatus)).toBeInTheDocument();
  });

  /**
   * Before the plan has loaded far enough to know its status, the chip is
   * left out entirely rather than rendering a blank line.
   */
  it('shows no status line before the plan carries one', () => {
    render(
      <PracticeAgendaGroupsView {...buildPracticeAgendaGroupsScreenView({ statusLabel: '' })} />,
    );

    expect(screen.queryByTestId(TEST_IDS.practiceAgendaGroupsStatus)).not.toBeInTheDocument();
  });

  it('shows the permission state and no forms when forbidden', () => {
    render(
      <PracticeAgendaGroupsView
        {...buildPracticeAgendaGroupsScreenView({ isForbidden: true, isLoading: true })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceAgendaGroupsLoading)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceAgendaGroupsCreateForm)).not.toBeInTheDocument();
  });

  it('shows the loader while the plan is still arriving', () => {
    render(
      <PracticeAgendaGroupsView {...buildPracticeAgendaGroupsScreenView({ isLoading: true })} />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsLoading)).toBeInTheDocument();
  });

  it('shows the error state once the read has failed', () => {
    render(
      <PracticeAgendaGroupsView {...buildPracticeAgendaGroupsScreenView({ hasError: true })} />,
    );

    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsError)).toBeInTheDocument();
  });

  it('announces the last command outcome in a live region', () => {
    render(
      <PracticeAgendaGroupsView
        {...buildPracticeAgendaGroupsScreenView({ notice: 'Group created.' })}
      />,
    );

    const notice = screen.getByTestId(TEST_IDS.practiceAgendaGroupsNotice);
    expect(notice).toHaveAttribute('role', 'status');
    expect(notice).toHaveTextContent('Group created.');
  });

  it('renders no notice before any command has run', () => {
    render(<PracticeAgendaGroupsView {...buildPracticeAgendaGroupsScreenView({ notice: null })} />);

    expect(screen.queryByTestId(TEST_IDS.practiceAgendaGroupsNotice)).not.toBeInTheDocument();
  });

  it('creates a group from its own form', () => {
    const onSubmit = vi.fn();
    render(
      <PracticeAgendaGroupsView
        {...buildPracticeAgendaGroupsScreenView({
          createForm: {
            ...buildPracticeAgendaGroupsScreenView().createForm,
            canSubmit: true,
            onSubmit,
          },
        })}
      />,
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCreateSubmit));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
