import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { fireIonChange } from '../../../../tests/setup/ionic-events.helper';
import { AppDateTimeField } from './datetime-field.component';

function renderField(props: Partial<React.ComponentProps<typeof AppDateTimeField>> = {}): void {
  render(
    <AppDateTimeField
      label="Effective from"
      datetimeId="effective-from"
      value=""
      displayValue=""
      placeholder="Select a date and time"
      openLabel="Open the date and time picker"
      dialogTitle="Choose a date and time"
      closeLabel="Done"
      isOpen={false}
      onOpen={vi.fn()}
      onDismiss={vi.fn()}
      onValueChange={vi.fn()}
      testId="datetime-field"
      inputTestId="datetime-input"
      {...props}
    />,
  );
}

describe('AppDateTimeField', () => {
  it('renders a date-time presentation labelled by its visible label', () => {
    renderField();

    expect(screen.getByText('Effective from')).toHaveAttribute('id', 'effective-from-label');
    const calendar = screen.getByTestId('datetime-input');
    expect(calendar).toHaveAttribute('presentation', 'date-time');
    expect(calendar).toHaveAttribute('aria-labelledby', 'effective-from-label');
  });

  it('asks for a moment instead of claiming one while the form holds none', () => {
    renderField();

    const trigger = screen.getByTestId('effective-from-trigger');
    expect(trigger).toHaveTextContent('Select a date and time');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the chosen wall time and reveals the calendar when open', () => {
    renderField({
      value: '2026-08-01T18:30',
      displayValue: '1 August 2026 6:30 PM',
      isOpen: true,
    });

    expect(screen.getByTestId('effective-from-trigger')).toHaveTextContent('1 August 2026 6:30 PM');
    expect(screen.getByRole('dialog')).not.toHaveAttribute('hidden');
    expect(screen.getByTestId('datetime-input')).toHaveProperty('value', '2026-08-01T18:30');
  });

  it('keeps the time part when the calendar reports a change', () => {
    const onValueChange = vi.fn();
    renderField({ onValueChange });

    fireIonChange(screen.getByTestId('datetime-input'), '2026-08-01T18:30:00');
    expect(onValueChange).toHaveBeenCalledWith('2026-08-01T18:30');
  });

  it('refuses instants before the provided minimum', () => {
    renderField({ min: '2026-07-23T12:00' });

    expect(screen.getByTestId('datetime-input')).toHaveAttribute('min', '2026-07-23T12:00');
  });

  it('surfaces the hint and error notes through the shared shell', async () => {
    const onOpen = vi.fn();
    renderField({ hint: 'Times are Africa/Cairo', errorMessage: 'Pick a future moment', onOpen });

    expect(screen.getByRole('alert')).toHaveTextContent('Pick a future moment');
    expect(screen.getByTestId('effective-from-trigger')).toHaveAttribute(
      'aria-describedby',
      'effective-from-hint effective-from-error',
    );
    await userEvent.click(screen.getByTestId('effective-from-trigger'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
