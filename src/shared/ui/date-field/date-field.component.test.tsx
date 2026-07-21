import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { fireIonChange } from '../../../../tests/setup/ionic-events.helper';
import { AppDateField } from './date-field.component';

function renderField(props: Partial<React.ComponentProps<typeof AppDateField>> = {}): void {
  render(
    <AppDateField
      label="Date performed"
      datetimeId="performed-on"
      value=""
      displayValue=""
      placeholder="Select a date"
      openLabel="Open the date picker"
      dialogTitle="Choose a date"
      closeLabel="Done"
      isOpen={false}
      onOpen={vi.fn()}
      onDismiss={vi.fn()}
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

  it('asks for a date instead of showing one when the form holds none', () => {
    renderField();

    const trigger = screen.getByTestId('performed-on-trigger');
    expect(trigger).toHaveTextContent('Select a date');
    expect(trigger).not.toHaveTextContent(/\d{4}/u);
  });

  it('offers the picker as a pressable dialog trigger, not a printed value', async () => {
    const onOpen = vi.fn();
    renderField({ onOpen });

    const trigger = screen.getByTestId('performed-on-trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('title', 'Open the date picker');
    expect(trigger).toHaveAttribute('aria-labelledby', 'performed-on-label performed-on-value');
    expect(trigger).toHaveAttribute('aria-controls', 'performed-on-panel');
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('hidden');

    await userEvent.click(trigger);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('shows the chosen day once one is selected and reveals the calendar', () => {
    renderField({ value: '2026-07-11', displayValue: '11 July 2026', isOpen: true });

    const trigger = screen.getByTestId('performed-on-trigger');
    expect(trigger).toHaveTextContent('11 July 2026');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog')).not.toHaveAttribute('hidden');
    expect(screen.getByTestId('date-input')).toHaveProperty('value', '2026-07-11');
  });

  it('collapses the calendar when the open trigger is pressed again', async () => {
    const onDismiss = vi.fn();
    const onOpen = vi.fn();
    renderField({ isOpen: true, onDismiss, onOpen });

    await userEvent.click(screen.getByTestId('performed-on-trigger'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('caps selectable dates at the provided maximum to block future days', () => {
    renderField({ max: '2026-07-21' });

    expect(screen.getByTestId('date-input')).toHaveAttribute('max', '2026-07-21');
  });

  it('forwards a date-only change from the calendar', () => {
    const onValueChange = vi.fn();
    renderField({ value: '2026-07-11', onValueChange });

    fireIonChange(screen.getByTestId('date-input'), '2026-07-05T00:00:00');
    expect(onValueChange).toHaveBeenCalledWith('2026-07-05');
  });

  it('surfaces an error with an alert role the trigger describes itself with', () => {
    renderField({ errorMessage: 'That date is in the future' });

    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent('That date is in the future');
    expect(error).toHaveAttribute('id', 'performed-on-error');
    expect(screen.getByTestId('performed-on-trigger')).toHaveAttribute(
      'aria-describedby',
      'performed-on-error',
    );
    expect(screen.getByTestId('date-field')).toHaveClass('app-date-field--invalid');
  });

  it('describes the trigger with both the hint and the error, in that order', () => {
    renderField({ hint: 'Pick the day you trained', errorMessage: 'Too far back' });

    expect(screen.getByTestId('performed-on-trigger')).toHaveAttribute(
      'aria-describedby',
      'performed-on-hint performed-on-error',
    );
  });

  it('applies the min, locale, and hint when provided', () => {
    renderField({ min: '2020-01-01', locale: 'ar', hint: 'Pick the day you trained' });

    const calendar = screen.getByTestId('date-input');
    expect(calendar).toHaveAttribute('min', '2020-01-01');
    expect(calendar).toHaveAttribute('locale', 'ar');
    expect(screen.getByText('Pick the day you trained')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('performed-on-trigger')).toHaveAttribute(
      'aria-describedby',
      'performed-on-hint',
    );
  });

  it('leaves the trigger undescribed when there is neither hint nor error', () => {
    renderField();

    expect(screen.getByTestId('performed-on-trigger')).not.toHaveAttribute('aria-describedby');
  });

  it('dismisses the dialog from its own close control', async () => {
    const onDismiss = vi.fn();
    renderField({ isOpen: true, onDismiss });

    await userEvent.click(screen.getByTestId('performed-on-close'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
