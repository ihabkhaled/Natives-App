import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAssessmentEntryView } from '../../../../../tests/factories/assessments-view.factory';
import { AssessmentEntryView } from './assessment-entry-view.component';

describe('AssessmentEntryView', () => {
  it('renders the header, grid, and workflow bar once ready', () => {
    render(<AssessmentEntryView {...buildAssessmentEntryView()} />);

    expect(screen.getByTestId(TEST_IDS.assessmentEntryView)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.assessmentMetricGrid)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.assessmentWorkflowBar)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.assessmentCompleteness)).toHaveTextContent(
      '1 of 3 metrics evaluated',
    );
  });

  it('states that "not evaluated" is not a zero', () => {
    render(<AssessmentEntryView {...buildAssessmentEntryView()} />);

    expect(screen.getByText('Not evaluated is not a zero.')).toBeInTheDocument();
  });

  it('offers only the permitted workflow steps', () => {
    render(<AssessmentEntryView {...buildAssessmentEntryView()} />);

    expect(screen.getByTestId(TEST_IDS.assessmentSubmit)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.assessmentPublish)).not.toBeInTheDocument();
  });

  it('forwards a workflow step', async () => {
    const view = buildAssessmentEntryView();
    render(<AssessmentEntryView {...view} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.assessmentSubmit));

    expect(view.onWorkflowStep).toHaveBeenCalledExactlyOnceWith('submit');
  });

  it('forwards a draft save', async () => {
    const view = buildAssessmentEntryView();
    render(<AssessmentEntryView {...view} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.assessmentSaveDraft));

    expect(view.onSave).toHaveBeenCalledOnce();
  });

  it('hides the save action and states the read-only reason once published', () => {
    render(
      <AssessmentEntryView
        {...buildAssessmentEntryView({
          isEditable: false,
          readOnlyLabel: 'This revision is read-only.',
          workflowActions: [],
        })}
      />,
    );

    expect(screen.queryByTestId(TEST_IDS.assessmentSaveDraft)).not.toBeInTheDocument();
    expect(screen.getByText('This revision is read-only.')).toBeInTheDocument();
  });

  it('shows the skeleton while loading', () => {
    render(<AssessmentEntryView {...buildAssessmentEntryView({ status: 'loading' })} />);

    expect(screen.getByTestId(TEST_IDS.assessmentEntryLoading)).toBeInTheDocument();
  });

  it('shows the designed error state', () => {
    render(<AssessmentEntryView {...buildAssessmentEntryView({ status: 'error' })} />);

    expect(screen.getByTestId(TEST_IDS.assessmentEntryError)).toBeInTheDocument();
  });

  it('shows the permission state without leaking any values', () => {
    render(<AssessmentEntryView {...buildAssessmentEntryView({ status: 'forbidden' })} />);

    expect(screen.getByTestId(TEST_IDS.assessmentEntryForbidden)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.assessmentMetricGrid)).not.toBeInTheDocument();
  });

  it('shows the offline and not-found states', () => {
    const { unmount } = render(
      <AssessmentEntryView {...buildAssessmentEntryView({ status: 'offline' })} />,
    );
    expect(screen.getByText('You are offline')).toBeInTheDocument();
    unmount();

    render(<AssessmentEntryView {...buildAssessmentEntryView({ status: 'empty' })} />);
    expect(screen.getByText('Assessment not found')).toBeInTheDocument();
  });

  it('states when there are no earlier revisions', () => {
    render(<AssessmentEntryView {...buildAssessmentEntryView()} />);

    expect(screen.getByText('No earlier revisions.')).toBeInTheDocument();
  });

  it('lists earlier revisions when the family has any', () => {
    render(
      <AssessmentEntryView
        {...buildAssessmentEntryView({
          revisions: [
            { id: 'asmt-0', label: 'Revision 1', statusLabel: 'Published', statusTone: 'success' },
          ],
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.assessmentRevisionList)).toHaveTextContent('Revision 1');
  });

  it('returns to the workspace from the back action', async () => {
    const view = buildAssessmentEntryView();
    render(<AssessmentEntryView {...view} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.assessmentEntryBack));

    expect(view.onBack).toHaveBeenCalledOnce();
  });
});
