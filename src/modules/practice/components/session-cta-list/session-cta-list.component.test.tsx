import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { SessionCtaList } from './session-cta-list.component';

function cta(label: string): { heading: string; label: string; onOpen: () => void } {
  return { heading: label, label, onOpen: vi.fn() };
}

describe('SessionCtaList', () => {
  it('renders nothing when the viewer holds neither grant', () => {
    const { container } = render(<SessionCtaList attendanceCta={null} remindersCta={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders only the attendance entry point when only that grant is held', () => {
    render(<SessionCtaList attendanceCta={cta('Record attendance')} remindersCta={null} />);

    expect(screen.getByTestId(TEST_IDS.practiceSessionAttendanceCta)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceSessionRemindersCta)).not.toBeInTheDocument();
  });

  it('renders only the reminders entry point when only that grant is held', () => {
    render(<SessionCtaList attendanceCta={null} remindersCta={cta('Send due reminders')} />);

    expect(screen.getByTestId(TEST_IDS.practiceSessionRemindersCta)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceSessionAttendanceCta)).not.toBeInTheDocument();
  });

  it('opens each entry point from its own button', () => {
    const attendance = cta('Record attendance');
    const reminders = cta('Send due reminders');
    render(<SessionCtaList attendanceCta={attendance} remindersCta={reminders} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceSessionAttendanceCta));
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceSessionRemindersCta));

    expect(attendance.onOpen).toHaveBeenCalledTimes(1);
    expect(reminders.onOpen).toHaveBeenCalledTimes(1);
  });
});
