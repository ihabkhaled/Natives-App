import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { fireIonChange } from '../../../../../tests/setup/ionic-events.helper';

import { buildAssessmentsView } from '../../../../../tests/factories/assessments-view.factory';
import { AssessmentsView } from './assessments-view.component';

describe('AssessmentsView', () => {
  it('renders the list and the count once ready', () => {
    render(<AssessmentsView {...buildAssessmentsView()} />);

    expect(screen.getByTestId(TEST_IDS.assessmentsView)).toBeInTheDocument();
    expect(screen.getByText('1 of 1 assessments')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.assessmentSummaryCard)).toHaveTextContent('Summer 2026');
  });

  it('shows the skeleton while loading', () => {
    render(<AssessmentsView {...buildAssessmentsView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.assessmentsLoading)).toBeInTheDocument();
  });

  it('shows the designed error state with a retry', () => {
    render(<AssessmentsView {...buildAssessmentsView({ status: 'error' })} />);

    expect(screen.getByTestId(TEST_IDS.assessmentsError)).toBeInTheDocument();
  });

  it('shows the offline state', () => {
    render(<AssessmentsView {...buildAssessmentsView({ status: 'offline' })} />);

    expect(screen.getByTestId(TEST_IDS.assessmentsOffline)).toBeInTheDocument();
  });

  it('shows the permission state for a persona without the grant', () => {
    render(<AssessmentsView {...buildAssessmentsView({ status: 'forbidden' })} />);

    expect(screen.getByTestId(TEST_IDS.assessmentsForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.assessmentSummaryCard)).not.toBeInTheDocument();
  });

  it('shows the empty state when the team has no assessments', () => {
    render(<AssessmentsView {...buildAssessmentsView({ status: 'empty' })} />);

    expect(screen.getByTestId(TEST_IDS.assessmentsEmpty)).toBeInTheDocument();
  });

  it('shows a no-matches state when a filter hides everything', () => {
    render(<AssessmentsView {...buildAssessmentsView({ hasMatches: false, items: [] })} />);

    expect(screen.getByText('No assessments match')).toBeInTheDocument();
  });

  it('renders the status filter and forwards a change', () => {
    const view = buildAssessmentsView();
    render(<AssessmentsView {...view} />);

    fireIonChange(screen.getByTestId(TEST_IDS.assessmentsStatusFilter), 'draft');

    expect(view.onStatusFilterChange).toHaveBeenCalledExactlyOnceWith('draft');
  });

  it('opens the tapped assessment from the list', async () => {
    const view = buildAssessmentsView();
    render(<AssessmentsView {...view} />);

    await userEvent.click(screen.getByText('Open'));

    expect(view.onOpen).toHaveBeenCalledExactlyOnceWith('asmt-draft-1');
  });
});
