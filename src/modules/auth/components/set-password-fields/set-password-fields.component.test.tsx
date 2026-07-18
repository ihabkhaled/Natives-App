import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildSetPasswordFieldsLabelsFixture,
  buildSetPasswordFormView,
} from '../../../../../tests/factories/auth-view.factory';
import { SetPasswordFields } from './set-password-fields.component';

const LABELS = buildSetPasswordFieldsLabelsFixture();

function renderFields(props: Partial<Parameters<typeof SetPasswordFields>[0]> = {}) {
  const form = props.form ?? buildSetPasswordFormView();
  render(
    <SetPasswordFields
      labels={LABELS}
      form={form}
      isSubmitting={props.isSubmitting ?? false}
      submitErrorMessage={props.submitErrorMessage}
    />,
  );
  return form;
}

describe('SetPasswordFields', () => {
  it('renders both password fields and the submit label', () => {
    renderFields();

    expect(screen.getByTestId(TEST_IDS.setPasswordInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.setPasswordConfirmInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.setPasswordSubmitButton)).toHaveTextContent(
      'Update password',
    );
  });

  it('shows the submitting label while a request is in flight', () => {
    renderFields({ isSubmitting: true });

    expect(screen.getByTestId(TEST_IDS.setPasswordSubmitButton)).toHaveTextContent('Updating…');
  });

  it('renders an accessible validation summary when errors are present', () => {
    renderFields({
      form: buildSetPasswordFormView({
        summaryMessages: ['Too weak', 'Passwords do not match.'],
      }),
    });

    const summary = screen.getByTestId(TEST_IDS.setPasswordSummary);
    expect(summary).toHaveAttribute('role', 'alert');
    expect(summary).toHaveTextContent('Passwords do not match.');
  });

  it('warns about Caps Lock only when it is on', () => {
    renderFields({ form: buildSetPasswordFormView({ capsLockOn: true }) });

    expect(screen.getByTestId(TEST_IDS.setPasswordCapsLock)).toHaveTextContent('Caps Lock is on.');
  });

  it('surfaces the submit error message', () => {
    renderFields({ submitErrorMessage: 'This link is invalid or has expired. Request a new one.' });

    expect(screen.getByTestId(TEST_IDS.setPasswordError)).toHaveTextContent(
      'invalid or has expired',
    );
  });

  it('submits the form through the view model', () => {
    const view = renderFields();

    fireEvent.submit(screen.getByTestId(TEST_IDS.setPasswordSubmitButton));

    expect(view.onSubmit).toHaveBeenCalledTimes(1);
  });
});
