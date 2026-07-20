import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAssessmentSummaryView } from '../../../../../tests/factories/assessments-view.factory';
import { AssessmentSummaryList } from './assessment-summary-list.component';

describe('AssessmentSummaryList', () => {
  it('renders one row per assessment with its status chip', () => {
    render(
      <AssessmentSummaryList
        items={[
          buildAssessmentSummaryView(),
          buildAssessmentSummaryView({ id: 'asmt-2', periodLabel: 'Spring 2026' }),
        ]}
        heightPx={400}
        emptyTitle="No assessments match"
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.assessmentSummaryCard)).toHaveLength(2);
    expect(screen.getAllByTestId(TEST_IDS.assessmentStatusChip)[0]).toHaveTextContent('Draft');
  });

  it('opens the tapped assessment', async () => {
    const onOpen = vi.fn();
    render(
      <AssessmentSummaryList
        items={[buildAssessmentSummaryView()]}
        heightPx={400}
        emptyTitle="No assessments match"
        onOpen={onOpen}
      />,
    );

    await userEvent.click(screen.getByText('Open'));

    expect(onOpen).toHaveBeenCalledExactlyOnceWith('asmt-draft-1');
  });

  it('falls back to the empty state with no rows', () => {
    render(
      <AssessmentSummaryList
        items={[]}
        heightPx={400}
        emptyTitle="No assessments match"
        onOpen={vi.fn()}
      />,
    );

    expect(screen.getByText('No assessments match')).toBeInTheDocument();
  });
});
