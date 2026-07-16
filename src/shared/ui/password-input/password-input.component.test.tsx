import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { fireIonBlur, fireIonInput } from '../../../../tests/setup/ionic-events.helper';
import { AppPasswordInput } from './password-input.component';
import { PASSWORD_HIDE_ICON, PASSWORD_REVEAL_ICON } from './password-input.constants';

function getToggleIcon(): Element {
  return document.body.querySelector('ion-icon')!;
}

describe('AppPasswordInput', () => {
  it('masks the value and offers the reveal affordance when not revealed', () => {
    render(
      <AppPasswordInput
        label="Password"
        name="password"
        value="secret"
        revealed={false}
        onValueChange={vi.fn()}
        onToggleReveal={vi.fn()}
        revealLabel="Show password"
        hideLabel="Hide password"
        testId="password-input"
      />,
    );

    const input = screen.getByTestId('password-input');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    expect(input).toHaveAttribute('label', 'Password');
    expect(screen.getByLabelText('Show password')).toBeInTheDocument();
    expect(getToggleIcon()).toHaveAttribute('icon', PASSWORD_REVEAL_ICON);
  });

  it('shows the value and offers the hide affordance when revealed', () => {
    render(
      <AppPasswordInput
        label="Password"
        name="password"
        value="secret"
        revealed
        onValueChange={vi.fn()}
        onToggleReveal={vi.fn()}
        revealLabel="Show password"
        hideLabel="Hide password"
        testId="password-input"
      />,
    );

    expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
    expect(screen.queryByLabelText('Show password')).not.toBeInTheDocument();
    expect(getToggleIcon()).toHaveAttribute('icon', PASSWORD_HIDE_ICON);
  });

  it('calls onToggleReveal when the reveal button is clicked', async () => {
    const onToggleReveal = vi.fn();
    render(
      <AppPasswordInput
        label="Password"
        name="password"
        value="secret"
        revealed={false}
        onValueChange={vi.fn()}
        onToggleReveal={onToggleReveal}
        revealLabel="Show password"
        hideLabel="Hide password"
        testId="password-input"
      />,
    );

    await userEvent.click(screen.getByLabelText('Show password'));

    expect(onToggleReveal).toHaveBeenCalledTimes(1);
  });

  it('reports extracted values through onValueChange and blurs through onBlur', () => {
    const onValueChange = vi.fn();
    const onBlur = vi.fn();
    render(
      <AppPasswordInput
        label="Password"
        name="password"
        value=""
        revealed={false}
        onValueChange={onValueChange}
        onBlur={onBlur}
        onToggleReveal={vi.fn()}
        revealLabel="Show password"
        hideLabel="Hide password"
        testId="password-input"
      />,
    );

    fireIonInput(screen.getByTestId('password-input'), 'hunter2');
    fireIonBlur(screen.getByTestId('password-input'));

    expect(onValueChange).toHaveBeenCalledWith('hunter2');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('stays inert on ionBlur when no onBlur handler is provided', () => {
    const onValueChange = vi.fn();
    render(
      <AppPasswordInput
        label="Password"
        name="password"
        value=""
        revealed={false}
        onValueChange={onValueChange}
        onToggleReveal={vi.fn()}
        revealLabel="Show password"
        hideLabel="Hide password"
        testId="password-input"
      />,
    );

    fireIonBlur(screen.getByTestId('password-input'));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('applies the placeholder when one is provided', () => {
    render(
      <AppPasswordInput
        label="Password"
        name="password"
        value=""
        placeholder="Your password"
        revealed={false}
        onValueChange={vi.fn()}
        onToggleReveal={vi.fn()}
        revealLabel="Show password"
        hideLabel="Hide password"
        testId="password-input"
      />,
    );

    expect(screen.getByTestId('password-input')).toHaveAttribute('placeholder', 'Your password');
  });

  it('omits the placeholder when none is provided', () => {
    render(
      <AppPasswordInput
        label="Password"
        name="password"
        value=""
        revealed={false}
        onValueChange={vi.fn()}
        onToggleReveal={vi.fn()}
        revealLabel="Show password"
        hideLabel="Hide password"
        testId="password-input"
      />,
    );

    expect(screen.getByTestId('password-input')).not.toHaveAttribute('placeholder');
  });

  it('surfaces the error message and marks the field invalid', () => {
    render(
      <AppPasswordInput
        label="Password"
        name="password"
        value=""
        errorMessage="Password is required"
        revealed={false}
        onValueChange={vi.fn()}
        onToggleReveal={vi.fn()}
        revealLabel="Show password"
        hideLabel="Hide password"
        testId="password-input"
      />,
    );

    const input = screen.getByTestId('password-input');
    expect(input).toHaveProperty('errorText', 'Password is required');
    expect(input).toHaveClass('ion-invalid', 'ion-touched');
  });

  it('leaves the field valid when no error message is provided', () => {
    render(
      <AppPasswordInput
        label="Password"
        name="password"
        value=""
        revealed={false}
        onValueChange={vi.fn()}
        onToggleReveal={vi.fn()}
        revealLabel="Show password"
        hideLabel="Hide password"
        testId="password-input"
      />,
    );

    expect(screen.getByTestId('password-input')).not.toHaveClass('ion-invalid');
  });
});
