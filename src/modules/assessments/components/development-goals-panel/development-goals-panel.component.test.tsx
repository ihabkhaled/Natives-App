import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildGoalCardView } from '../../../../../tests/factories/assessments-view.factory';
import { DevelopmentGoalsPanel } from './development-goals-panel.component';
import type { DevelopmentGoalsPanelProps } from './development-goals-panel.types';

function buildProps(
  overrides: Partial<DevelopmentGoalsPanelProps> = {},
): DevelopmentGoalsPanelProps {
  return {
    title: 'Development goals',
    emptyTitle: 'No goals yet',
    emptyMessage: 'Goals appear here.',
    goals: [buildGoalCardView()],
    isTransitioning: false,
    onTransition: vi.fn(),
    ...overrides,
  };
}

describe('DevelopmentGoalsPanel', () => {
  it('renders the goal with its target, progress, and action plan', () => {
    render(<DevelopmentGoalsPanel {...buildProps()} />);

    expect(screen.getByText('Raise reset completion')).toBeInTheDocument();
    expect(screen.getByText('90% reset completion')).toBeInTheDocument();
    expect(screen.getByText('50% of the target')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.developmentGoalAction)).toHaveTextContent(
      'Marked reset drills',
    );
  });

  it('exposes progress as an accessible meter', () => {
    render(<DevelopmentGoalsPanel {...buildProps()} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('omits the meter when progress was never measured', () => {
    render(
      <DevelopmentGoalsPanel
        {...buildProps({
          goals: [buildGoalCardView({ progressPercent: null, progressLabel: 'Not measured yet' })],
        })}
      />,
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Not measured yet')).toBeInTheDocument();
  });

  it('forwards a lifecycle transition', async () => {
    const props = buildProps();
    render(<DevelopmentGoalsPanel {...props} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.developmentGoalTransition));

    expect(props.onTransition).toHaveBeenCalledExactlyOnceWith('goal-2');
  });

  it('hides the transition action for a closed goal', () => {
    render(
      <DevelopmentGoalsPanel
        {...buildProps({ goals: [buildGoalCardView({ transition: null })] })}
      />,
    );

    expect(screen.queryByTestId(TEST_IDS.developmentGoalTransition)).not.toBeInTheDocument();
  });

  it('reports an action without a due date and one with it', () => {
    render(
      <DevelopmentGoalsPanel
        {...buildProps({
          goals: [
            buildGoalCardView({
              actions: [
                {
                  key: 'a',
                  description: 'Film review',
                  stateLabel: 'Open',
                  done: false,
                  dueLabel: 'Due: 2026-08-15',
                },
              ],
            }),
          ],
        })}
      />,
    );

    expect(screen.getByText('Due: 2026-08-15')).toBeInTheDocument();
  });

  it('shows the designed empty state with no goals', () => {
    render(<DevelopmentGoalsPanel {...buildProps({ goals: [] })} />);

    expect(screen.getByText('No goals yet')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.developmentGoalCard)).not.toBeInTheDocument();
  });

  it('omits the description line when the goal has none', () => {
    render(
      <DevelopmentGoalsPanel
        {...buildProps({
          goals: [buildGoalCardView({ description: null, targetLabel: null, baselineLabel: null })],
        })}
      />,
    );

    expect(screen.queryByText('Complete 90% of resets.')).not.toBeInTheDocument();
  });
});
