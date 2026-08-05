import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { buildScheduleRowView } from '../../../../../tests/factories/practice-schedules-view.factory';
import { ScheduleRow } from './schedule-row.component';

describe('ScheduleRow', () => {
  it('renders the name and the summary', () => {
    render(<ScheduleRow item={buildScheduleRowView()} onOpen={vi.fn()} />);

    expect(screen.getByText('Tuesday & Thursday practice')).toBeInTheDocument();
    expect(screen.getByText('Weekly · Tue, Thu · 18:00')).toBeInTheDocument();
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });

  it('shows a status chip for an archived schedule', () => {
    render(
      <ScheduleRow
        item={buildScheduleRowView({ isArchived: true, statusLabel: 'Archived' })}
        onOpen={vi.fn()}
      />,
    );

    // StatusChip renders the label twice (a screen-reader span plus a
    // visible aria-hidden span), so both matches confirm the chip rendered.
    expect(screen.getAllByText('Archived')).toHaveLength(2);
  });

  it('opens the schedule when its name is pressed', () => {
    const onOpen = vi.fn();
    render(<ScheduleRow item={buildScheduleRowView({ id: 's9', name: 'Open me' })} onOpen={onOpen} />);

    fireEvent.click(screen.getByText('Open me'));

    expect(onOpen).toHaveBeenCalledWith('s9');
  });
});
