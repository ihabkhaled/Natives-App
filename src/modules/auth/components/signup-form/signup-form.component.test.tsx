import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  SIGNUP_TEST_COPY,
  buildSignupFormView,
} from '../../../../../tests/factories/signup-screen-view.factory';
import { fireIonInput } from '../../../../../tests/setup/ionic-events.helper';
import { SignupForm } from './signup-form.component';
import type { SignupFormProps } from './signup-form.types';

function mount(overrides: Partial<SignupFormProps> = {}): SignupFormProps {
  const props: SignupFormProps = {
    copy: SIGNUP_TEST_COPY.form,
    form: buildSignupFormView(),
    isSubmitting: false,
    submitErrorMessage: undefined,
    ...overrides,
  };
  render(<SignupForm {...props} />);
  return props;
}

describe('SignupForm', () => {
  it('renders the three contract fields and the password hint', () => {
    mount();

    expect(screen.getByTestId(TEST_IDS.signupNameInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.signupEmailInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.signupPasswordInput)).toBeInTheDocument();
    expect(screen.getByText('Use at least 12 characters.')).toBeInTheDocument();
  });

  it('reports typed identity values through their bindings', () => {
    const props = mount();

    fireIonInput(screen.getByTestId(TEST_IDS.signupNameInput), 'Nadia Newcomer');
    fireIonInput(screen.getByTestId(TEST_IDS.signupEmailInput), 'nadia@example.com');

    expect(props.form.displayName.onChange).toHaveBeenCalledWith('Nadia Newcomer');
    expect(props.form.email.onChange).toHaveBeenCalledWith('nadia@example.com');
  });

  it('hides the error summary while the form is clean', () => {
    mount();

    expect(screen.queryByTestId(TEST_IDS.signupSummary)).not.toBeInTheDocument();
  });

  it('lists every validation message in an assertive summary', () => {
    mount({
      form: buildSignupFormView({ summaryMessages: ['Name required.', 'Email invalid.'] }),
    });

    const summary = screen.getByTestId(TEST_IDS.signupSummary);
    expect(summary).toHaveAttribute('role', 'alert');
    expect(summary).toHaveTextContent('Name required.');
    expect(summary).toHaveTextContent('Email invalid.');
  });

  it('warns about Caps Lock only while the modifier is on', () => {
    mount({ form: buildSignupFormView({ capsLockOn: true }) });

    expect(screen.getByText('Caps Lock is on.')).toBeInTheDocument();
  });

  it('swaps the submit label and announces progress politely while in flight', () => {
    mount({ isSubmitting: true });

    expect(screen.getByTestId(TEST_IDS.signupSubmitButton)).toHaveTextContent('Sending request…');
    const status = screen.getByTestId(TEST_IDS.signupStatus);
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Sending your request…');
  });

  it('keeps the live region empty while idle', () => {
    mount();

    expect(screen.getByTestId(TEST_IDS.signupStatus)).toHaveTextContent('');
  });

  it('surfaces a submit failure as an alert', () => {
    mount({ submitErrorMessage: 'That email is already registered.' });

    expect(screen.getByTestId(TEST_IDS.signupError)).toHaveTextContent('already registered');
  });

  it('submits through the prepared handler', () => {
    const props = mount();

    fireEvent.submit(screen.getByTestId(TEST_IDS.signupSubmitButton));

    expect(props.form.onSubmit).toHaveBeenCalledTimes(1);
  });
});
