import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FormFieldBinding } from '@/packages/forms';
import { TEST_IDS } from '@/shared/config';

import { fireIonInput } from '../../../../../tests/setup/ionic-events.helper';
import { ForgotPasswordForm } from './forgot-password-form.component';
import type { ForgotPasswordFormProps } from './forgot-password-form.types';

function buildEmail(overrides: Partial<FormFieldBinding> = {}): FormFieldBinding {
  return {
    name: 'email',
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    errorMessage: undefined,
    ...overrides,
  };
}

function renderForm(overrides: Partial<ForgotPasswordFormProps> = {}): ForgotPasswordFormProps {
  const props: ForgotPasswordFormProps = {
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    submitLabel: 'Send reset link',
    submittingLabel: 'Sending…',
    email: buildEmail(),
    onSubmit: vi.fn(),
    isSubmitting: false,
    submitErrorMessage: undefined,
    ...overrides,
  };
  render(<ForgotPasswordForm {...props} />);
  return props;
}

describe('ForgotPasswordForm', () => {
  it('renders the email field and submit label', () => {
    renderForm();

    expect(screen.getByTestId(TEST_IDS.forgotPasswordEmailInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.forgotPasswordSubmitButton)).toHaveTextContent(
      'Send reset link',
    );
  });

  it('reports typed input through the field binding', () => {
    const view = renderForm();

    fireIonInput(screen.getByTestId(TEST_IDS.forgotPasswordEmailInput), 'user@example.com');

    expect(view.email.onChange).toHaveBeenCalledWith('user@example.com');
  });

  it('shows the submitting label while in flight', () => {
    renderForm({ isSubmitting: true });

    expect(screen.getByTestId(TEST_IDS.forgotPasswordSubmitButton)).toHaveTextContent('Sending…');
  });

  it('surfaces a submit error message', () => {
    renderForm({ submitErrorMessage: 'You appear to be offline.' });

    expect(screen.getByTestId(TEST_IDS.forgotPasswordError)).toHaveTextContent('offline');
  });

  it('submits through the handler', () => {
    const view = renderForm();

    fireEvent.submit(screen.getByTestId(TEST_IDS.forgotPasswordSubmitButton));

    expect(view.onSubmit).toHaveBeenCalledTimes(1);
  });
});
