import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildCandidateDetailPanelView,
  buildCandidateDisclosureView,
  buildCandidateRowView,
  buildCandidateWithdrawalView,
} from '../../../../tests/factories/tryout-candidates-view.factory';
import { CandidateDetailPanel } from './candidate-detail-panel';
import { CandidateDisclosureBlock } from './candidate-disclosure-block';
import { CandidateRow } from './candidate-row';
import { CandidateWithdrawalPanel } from './candidate-withdrawal-panel';

describe('CandidateRow', () => {
  it('names the candidate, their state, and when they turned up', () => {
    render(<CandidateRow view={buildCandidateRowView()} onSelect={vi.fn()} />);

    expect(screen.getByText('Nour El-Sayed')).toBeInTheDocument();
    expect(screen.getByText('Checked in at 18 July 2026 5:00 PM')).toBeInTheDocument();
  });

  it('shows no check-in line for a candidate who has not arrived', () => {
    render(
      <CandidateRow view={buildCandidateRowView({ checkedInLabel: null })} onSelect={vi.fn()} />,
    );

    expect(screen.queryByText(/Checked in/u)).not.toBeInTheDocument();
  });

  it('opens the record it belongs to', () => {
    const onSelect = vi.fn();
    render(<CandidateRow view={buildCandidateRowView()} onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId(`${TEST_IDS.tryoutCandidatesRow}-candidate-1`));

    expect(onSelect).toHaveBeenCalledWith('candidate-1');
  });

  it('announces which record is currently open', () => {
    render(<CandidateRow view={buildCandidateRowView({ isSelected: true })} onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
  });
});

describe('CandidateDisclosureBlock', () => {
  it('renders the disclosed facts with their audit notice', () => {
    render(<CandidateDisclosureBlock view={buildCandidateDisclosureView()} testId="block" />);

    expect(screen.getByText('nour@example.test')).toBeInTheDocument();
    expect(screen.getByText('Each read of these fields is audited.')).toBeInTheDocument();
  });

  it('renders the restricted state instead of the fields when withheld', () => {
    render(
      <CandidateDisclosureBlock
        view={buildCandidateDisclosureView({ isDisclosed: false, facts: [] })}
        testId="block"
      />,
    );

    expect(screen.getByText('Contact details are restricted')).toBeInTheDocument();
  });

  it('keeps a withheld value out of the DOM entirely, not merely hidden', () => {
    // A CSS-hidden field is still readable by anyone with dev tools; an absent
    // one is not.
    render(
      <CandidateDisclosureBlock
        view={buildCandidateDisclosureView({ isDisclosed: false, facts: [] })}
        testId="block"
      />,
    );

    expect(screen.queryByText('nour@example.test')).not.toBeInTheDocument();
  });
});

describe('CandidateDetailPanel', () => {
  it('shows the facts and both restricted blocks', () => {
    render(<CandidateDetailPanel view={buildCandidateDetailPanelView()} />);

    expect(screen.getByText('1 July 2027 9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Contact details')).toBeInTheDocument();
    expect(screen.getByText('Readiness notes are restricted')).toBeInTheDocument();
  });

  it('offers withdrawal on the record and reports it to its caller', () => {
    const onWithdraw = vi.fn();
    render(<CandidateDetailPanel view={buildCandidateDetailPanelView({ onWithdraw })} />);

    fireEvent.click(screen.getByTestId(`${TEST_IDS.tryoutCandidatesAction}-withdraw`));

    expect(onWithdraw).toHaveBeenCalledOnce();
  });

  it('omits the withdrawal affordance once the candidate has left the funnel', () => {
    render(<CandidateDetailPanel view={buildCandidateDetailPanelView({ canWithdraw: false })} />);

    expect(
      screen.queryByTestId(`${TEST_IDS.tryoutCandidatesAction}-withdraw`),
    ).not.toBeInTheDocument();
  });
});

describe('CandidateWithdrawalPanel', () => {
  it('announces what withdrawal does before the button is reachable', () => {
    render(<CandidateWithdrawalPanel view={buildCandidateWithdrawalView()} />);

    expect(screen.getByRole('alert')).toHaveTextContent('This cannot be undone once applied.');
    expect(screen.getByText('Nour El-Sayed')).toBeInTheDocument();
  });

  it('blocks the withdrawal until a reason has been written', () => {
    render(
      <CandidateWithdrawalPanel
        view={buildCandidateWithdrawalView({
          canSubmit: false,
          validationMessage: 'A reason of at least 5 characters is required.',
        })}
      />,
    );

    expect(screen.getByText('A reason of at least 5 characters is required.')).toBeInTheDocument();
  });

  it('sends and cancels through its caller', () => {
    const view = buildCandidateWithdrawalView({ onSubmit: vi.fn(), onCancel: vi.fn() });
    render(<CandidateWithdrawalPanel view={view} />);

    fireEvent.click(screen.getByTestId(`${TEST_IDS.tryoutCandidatesAction}-confirm`));
    fireEvent.click(screen.getByTestId(`${TEST_IDS.tryoutCandidatesAction}-cancel`));

    expect(view.onSubmit).toHaveBeenCalledOnce();
    expect(view.onCancel).toHaveBeenCalledOnce();
  });
});
