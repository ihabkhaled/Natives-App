import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fireIonChange } from '../../../../tests/setup/ionic-events.helper';
import { AppDateField } from './date-field.component';

function renderField(props: Partial<React.ComponentProps<typeof AppDateField>> = {}): void {
  render(
    <AppDateField
      label="Date performed"
      datetimeId="performed-on"
      value=""
      onValueChange={vi.fn()}
      testId="date-field"
      inputTestId="date-input"
      {...props}
    />,
  );
}

describe('AppDateField', () => {
  it('renders a date-presentation calendar labelled by its visible label', () => {
    renderField();

    const label = screen.getByText('Date performed');
    expect(label).toHaveAttribute('id', 'performed-on-label');
    const calendar = screen.getByTestId('date-input');
    expect(calendar).toHaveAttribute('presentation', 'date');
    expect(calendar).toHaveAttribute('aria-labelledby', 'performed-on-label');
  });

  it('pairs the trigger button with the calendar id so the picker opens', () => {
    renderField();

    expect(screen.getByTestId('performed-on-trigger')).toHaveAttribute('datetime', 'performed-on');
  });

  it('caps selectable dates at the provided maximum to block future days', () => {
    renderField({ max: '2026-07-21' });

    expect(screen.getByTestId('date-input')).toHaveAttribute('max', '2026-07-21');
  });

  it('reflects the selected value and forwards a date-only change', () => {
    const onValueChange = vi.fn();
    renderField({ value: '2026-07-11', onValueChange });

    expect(screen.getByTestId('date-input')).toHaveProperty('value', '2026-07-11');
    fireIonChange(screen.getByTestId('date-input'), '2026-07-05T00:00:00');
    expect(onValueChange).toHaveBeenCalledWith('2026-07-05');
  });

  it('surfaces an error with an alert role tied to the calendar', () => {
    renderField({ errorMessage: 'That date is in the future' });

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('That date is in the future');
    expect(error).toHaveAttribute('id', 'performed-on-error');
    expect(screen.getByTestId('date-input')).toHaveAttribute(
      'aria-describedby',
      'performed-on-error',
    );
  });

  it('applies the min, locale, and hint when provided', () => {
    renderField({ min: '2020-01-01', locale: 'ar', hint: 'Pick the day you trained' });

    const calendar = screen.getByTestId('date-input');
    expect(calendar).toHaveAttribute('min', '2020-01-01');
    expect(calendar).toHaveAttribute('locale', 'ar');
    expect(screen.getByText('Pick the day you trained')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(calendar).not.toHaveAttribute('aria-describedby');
  });
});
