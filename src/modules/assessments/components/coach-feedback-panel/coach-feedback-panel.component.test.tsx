import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildFeedbackCardView } from '../../../../../tests/factories/assessments-view.factory';
import { CoachFeedbackPanel } from './coach-feedback-panel.component';
import type { CoachFeedbackPanelProps } from './coach-feedback-panel.types';

function buildProps(overrides: Partial<CoachFeedbackPanelProps> = {}): CoachFeedbackPanelProps {
  return {
    title: 'Coach feedback',
    emptyTitle: 'No published feedback yet',
    emptyMessage: 'It appears here once published.',
    cards: [buildFeedbackCardView()],
    isAcknowledging: false,
    onAcknowledge: vi.fn(),
    ...overrides,
  };
}

describe('CoachFeedbackPanel', () => {
  it('renders only the sections the server shared', () => {
    render(<CoachFeedbackPanel {...buildProps()} />);

    expect(screen.getByText('Frisbee strengths')).toBeInTheDocument();
    expect(screen.getByText('Break-side flick is a weapon.')).toBeInTheDocument();
    expect(screen.queryByText('Mental strengths')).not.toBeInTheDocument();
  });

  it('shows the designed empty state when nothing is published', () => {
    render(<CoachFeedbackPanel {...buildProps({ cards: [] })} />);

    expect(screen.getByText('No published feedback yet')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.coachFeedbackCard)).not.toBeInTheDocument();
  });

  it('forwards an acknowledgement without a clarification request', async () => {
    const props = buildProps();
    render(<CoachFeedbackPanel {...props} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.coachFeedbackAcknowledge));

    expect(props.onAcknowledge).toHaveBeenCalledExactlyOnceWith('feedback-1', false);
  });

  it('forwards a clarification request', async () => {
    const props = buildProps();
    render(<CoachFeedbackPanel {...props} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.coachFeedbackClarify));

    expect(props.onAcknowledge).toHaveBeenCalledExactlyOnceWith('feedback-1', true);
  });

  it('replaces the acknowledge action once acknowledged', () => {
    render(
      <CoachFeedbackPanel
        {...buildProps({
          cards: [
            buildFeedbackCardView({
              isAcknowledged: true,
              acknowledgedLabel: 'Acknowledged on July 13, 2026',
            }),
          ],
        })}
      />,
    );

    expect(screen.getByText('Acknowledged on July 13, 2026')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.coachFeedbackAcknowledge)).not.toBeInTheDocument();
  });

  it('replaces the clarify action once clarification was asked for', () => {
    render(
      <CoachFeedbackPanel
        {...buildProps({
          cards: [buildFeedbackCardView({ clarificationLabel: 'Clarification requested.' })],
        })}
      />,
    );

    expect(screen.getByText('Clarification requested.')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.coachFeedbackClarify)).not.toBeInTheDocument();
  });
});
