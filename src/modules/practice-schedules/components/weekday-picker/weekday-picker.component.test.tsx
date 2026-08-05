import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WeekdayPicker } from './weekday-picker.component';

const OPTIONS = [
  { value: 0, label: 'Sun', selected: false },
  { value: 1, label: 'Mon', selected: true },
];

describe('WeekdayPicker', () => {
  it('renders the label and every day option', () => {
    render(<WeekdayPicker label="Days" options={OPTIONS} onToggle={vi.fn()} />);

    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
  });

  it('marks the selected day with aria-pressed', () => {
    render(<WeekdayPicker label="Days" options={OPTIONS} onToggle={vi.fn()} />);

    expect(screen.getByText('Sun')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Mon')).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles the day that was pressed', () => {
    const onToggle = vi.fn();
    render(<WeekdayPicker label="Days" options={OPTIONS} onToggle={onToggle} />);

    fireEvent.click(screen.getByText('Sun'));

    expect(onToggle).toHaveBeenCalledWith(0);
  });
});
