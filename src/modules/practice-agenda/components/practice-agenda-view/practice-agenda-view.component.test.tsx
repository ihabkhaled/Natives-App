import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAgendaBlockRowView,
  buildPracticeAgendaScreenView,
} from '../../../../../tests/factories/practice-agenda-view.factory';
import { PracticeAgendaView } from './practice-agenda-view.component';

describe('PracticeAgendaView', () => {
  it('introduces the plan and counts what it is showing', () => {
    render(
      <PracticeAgendaView
        {...buildPracticeAgendaScreenView({
          blocks: [
            buildAgendaBlockRowView({ id: 'b1', title: 'Warm-up' }),
            buildAgendaBlockRowView({ id: 'b2', title: 'Drill' }),
          ],
          countLabel: '2 blocks',
        })}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Blocks' })).toBeInTheDocument();
    expect(screen.getByText('In the order the session runs them.')).toBeInTheDocument();
    expect(screen.getByText('2 blocks')).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.practiceAgendaRow)).toHaveLength(2);
  });

  it('announces a refused action rather than only showing it', () => {
    render(
      <PracticeAgendaView
        {...buildPracticeAgendaScreenView({ notice: 'That action did not complete. Try again.' })}
      />,
    );

    // A coach adjusting a running session is rarely watching the screen.
    expect(screen.getByRole('status')).toHaveTextContent('That action did not complete.');
  });

  it('says nothing when nothing has failed', () => {
    render(<PracticeAgendaView {...buildPracticeAgendaScreenView()} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('withholds the plan behind every designed non-ready state', () => {
    const { rerender } = render(
      <PracticeAgendaView {...buildPracticeAgendaScreenView({ status: 'loading' })} />,
    );
    expect(screen.getByTestId(TEST_IDS.practiceAgendaLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceAgendaRow)).not.toBeInTheDocument();

    rerender(<PracticeAgendaView {...buildPracticeAgendaScreenView({ status: 'forbidden' })} />);
    expect(screen.getByTestId(TEST_IDS.practiceAgendaForbidden)).toBeInTheDocument();

    rerender(<PracticeAgendaView {...buildPracticeAgendaScreenView({ status: 'offline' })} />);
    expect(screen.getByTestId(TEST_IDS.practiceAgendaOffline)).toBeInTheDocument();

    rerender(<PracticeAgendaView {...buildPracticeAgendaScreenView({ status: 'error' })} />);
    expect(screen.getByTestId(TEST_IDS.practiceAgendaError)).toBeInTheDocument();

    rerender(
      <PracticeAgendaView {...buildPracticeAgendaScreenView({ status: 'empty', blocks: [] })} />,
    );
    expect(screen.getByTestId(TEST_IDS.practiceAgendaEmpty)).toBeInTheDocument();
  });
});
