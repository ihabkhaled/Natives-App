import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fireIonBlur, fireIonInput } from '../../../../tests/setup/ionic-events.helper';
import { AppInput } from './input.component';
import { extractIonInputValue, toInputStateClass } from './input.helper';

describe('toInputStateClass', () => {
  it('returns the Ionic invalid state classes when the field has an error', () => {
    expect(toInputStateClass(true)).toBe('ion-invalid ion-touched');
  });

  it('returns an empty class string when the field has no error', () => {
    expect(toInputStateClass(false)).toBe('');
  });
});

describe('extractIonInputValue', () => {
  it('maps null to an empty string', () => {
    expect(extractIonInputValue(null)).toBe('');
  });

  it('maps undefined to an empty string', () => {
    expect(extractIonInputValue(undefined)).toBe('');
  });

  it('stringifies numbers', () => {
    expect(extractIonInputValue(42)).toBe('42');
    expect(extractIonInputValue(0)).toBe('0');
  });

  it('passes strings through', () => {
    expect(extractIonInputValue('hello')).toBe('hello');
    expect(extractIonInputValue('')).toBe('');
  });
});

describe('AppInput', () => {
  it('renders a stacked outline text input with its label and value', () => {
    render(
      <AppInput
        label="Email"
        name="email"
        value="user@test.dev"
        onValueChange={vi.fn()}
        testId="email-input"
      />,
    );

    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('label', 'Email');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('label-placement', 'stacked');
    expect(input).toHaveAttribute('fill', 'outline');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveProperty('value', 'user@test.dev');
  });

  it('honours an explicit type', () => {
    render(
      <AppInput
        label="Password"
        name="password"
        value=""
        type="password"
        onValueChange={vi.fn()}
        testId="pw-input"
      />,
    );

    expect(screen.getByTestId('pw-input')).toHaveAttribute('type', 'password');
  });

  it('reports extracted values through onValueChange', () => {
    const onValueChange = vi.fn();
    render(
      <AppInput
        label="Email"
        name="email"
        value=""
        onValueChange={onValueChange}
        testId="email-input"
      />,
    );

    fireIonInput(screen.getByTestId('email-input'), 'typed@test.dev');

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('typed@test.dev');
  });

  it('calls onBlur when the field emits ionBlur', () => {
    const onBlur = vi.fn();
    render(
      <AppInput
        label="Email"
        name="email"
        value=""
        onValueChange={vi.fn()}
        onBlur={onBlur}
        testId="email-input"
      />,
    );

    fireIonBlur(screen.getByTestId('email-input'));

    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('stays inert on ionBlur when no onBlur handler is provided', () => {
    const onValueChange = vi.fn();
    render(
      <AppInput
        label="Email"
        name="email"
        value=""
        onValueChange={onValueChange}
        testId="email-input"
      />,
    );

    fireIonBlur(screen.getByTestId('email-input'));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('applies the placeholder and autocomplete when they are provided', () => {
    render(
      <AppInput
        label="Email"
        name="email"
        value=""
        placeholder="you@example.com"
        autocomplete="email"
        onValueChange={vi.fn()}
        testId="email-input"
      />,
    );

    const input = screen.getByTestId('email-input');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('omits the placeholder and autocomplete when they are not provided', () => {
    render(
      <AppInput label="Email" name="email" value="" onValueChange={vi.fn()} testId="email-input" />,
    );

    const input = screen.getByTestId('email-input');
    expect(input).not.toHaveAttribute('placeholder');
    expect(input).not.toHaveAttribute('autocomplete');
  });

  it('surfaces the error message and marks the field invalid', () => {
    render(
      <AppInput
        label="Email"
        name="email"
        value=""
        errorMessage="Email is required"
        onValueChange={vi.fn()}
        testId="email-input"
      />,
    );

    const input = screen.getByTestId('email-input');
    expect(input).toHaveProperty('errorText', 'Email is required');
    expect(input).toHaveClass('ion-invalid', 'ion-touched');
  });

  it('leaves the field valid and free of error text when no error message is provided', () => {
    render(
      <AppInput label="Email" name="email" value="" onValueChange={vi.fn()} testId="email-input" />,
    );

    const input = screen.getByTestId('email-input');
    expect(input).not.toHaveProperty('errorText', 'Email is required');
    expect(input).not.toHaveClass('ion-invalid');
  });
});
