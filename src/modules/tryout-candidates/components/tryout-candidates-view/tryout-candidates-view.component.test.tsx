import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildCandidateDetailPanelView,
  buildCandidateWithdrawalView,
  buildTryoutCandidatesScreenView,
} from '../../../../../tests/factories/tryout-candidates-view.factory';
import { TryoutCandidatesView } from './tryout-candidates-view.component';

describe('TryoutCandidatesView', () => {
  it('lists the queue with its count and its privacy promise once ready', () => {
    render(<TryoutCandidatesView {...buildTryoutCandidatesScreenView()} />);

    expect(screen.getByText('4 candidates')).toBeInTheDocument();
    expect(
      screen.getByText('Contact details and readiness notes never appear in this list.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.tryoutCandidatesRow}-candidate-1`)).toBeInTheDocument();
  });

  it('renders no queue while the screen is not ready', () => {
    render(<TryoutCandidatesView {...buildTryoutCandidatesScreenView({ status: 'empty' })} />);

    expect(screen.queryByText('4 candidates')).not.toBeInTheDocument();
    expect(screen.getByText('No candidates yet')).toBeInTheDocument();
  });

  it('prompts for a selection instead of showing an empty record', () => {
    render(<TryoutCandidatesView {...buildTryoutCandidatesScreenView()} />);

    expect(screen.getByText('Pick a candidate to review their tryout.')).toBeInTheDocument();
  });

  it('opens a candidate through its caller', () => {
    const view = buildTryoutCandidatesScreenView({ onSelect: vi.fn() });
    render(<TryoutCandidatesView {...view} />);

    fireEvent.click(screen.getByTestId(`${TEST_IDS.tryoutCandidatesRow}-candidate-1`));

    expect(view.onSelect).toHaveBeenCalledWith('candidate-1');
  });

  it('shows the selected record beside the list', () => {
    render(
      <TryoutCandidatesView
        {...buildTryoutCandidatesScreenView({ detail: buildCandidateDetailPanelView() })}
      />,
    );

    expect(screen.queryByText('Pick a candidate to review their tryout.')).not.toBeInTheDocument();
    expect(screen.getByText('Readiness notes are restricted')).toBeInTheDocument();
  });

  it('shows the withdrawal step only when one is open', () => {
    const { rerender } = render(<TryoutCandidatesView {...buildTryoutCandidatesScreenView()} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(
      <TryoutCandidatesView
        {...buildTryoutCandidatesScreenView({
          detail: buildCandidateDetailPanelView(),
          withdrawal: buildCandidateWithdrawalView(),
        })}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('This cannot be undone once applied.');
  });

  it('announces a failed action as a status message', () => {
    render(
      <TryoutCandidatesView
        {...buildTryoutCandidatesScreenView({ notice: 'That action did not complete.' })}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('That action did not complete.');
  });
});
