import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { FormFieldBinding } from '@/packages/forms';

import { fireIonBlur, fireIonInput } from '../../../../../tests/setup/ionic-events.helper';
import { WorkbenchForm } from './workbench-form.component';
import { WORKBENCH_FORM_TEST_IDS } from './workbench-form.constants';
import type { WorkbenchFormProps } from './workbench-form.types';

function buildBinding(overrides: Partial<FormFieldBinding> = {}): FormFieldBinding {
  return {
    name: 'name',
    value: '',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    errorMessage: undefined,
    ...overrides,
  };
}

function buildProps(overrides: Partial<WorkbenchFormProps> = {}): WorkbenchFormProps {
  return {
    heading: 'Form',
    nameLabel: 'Name',
    emailLabel: 'Email',
    submitLabel: 'Submit',
    name: buildBinding(),
    email: buildBinding({ name: 'email' }),
    successMessage: undefined,
    onSubmit: vi.fn(),
    ...overrides,
  };
}

function renderForm(props: WorkbenchFormProps = buildProps()): void {
  render(<WorkbenchForm {...props} />);
}

function queryForm(): Element | null {
  return document.body.querySelector('form');
}

describe('WorkbenchForm', () => {
  it('renders the section heading under its test id', () => {
    renderForm();

    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.section)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Form');
  });

  it('labels both fields and types the email input', () => {
    renderForm();

    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.name)).toHaveAttribute('label', 'Name');
    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.email)).toHaveAttribute('label', 'Email');
    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.email)).toHaveAttribute('type', 'email');
  });

  it('renders each field at its bound value', () => {
    renderForm(
      buildProps({
        name: buildBinding({ value: 'Ranger' }),
        email: buildBinding({ name: 'email', value: 'ranger@example.com' }),
      }),
    );

    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.name)).toHaveProperty('value', 'Ranger');
    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.email)).toHaveProperty(
      'value',
      'ranger@example.com',
    );
  });

  it('forwards name edits to the binding', () => {
    const props = buildProps();
    renderForm(props);

    fireIonInput(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.name), 'Ranger');

    expect(props.name.onChange).toHaveBeenCalledExactlyOnceWith('Ranger');
  });

  it('forwards email edits to the binding', () => {
    const props = buildProps();
    renderForm(props);

    fireIonInput(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.email), 'ranger@example.com');

    expect(props.email.onChange).toHaveBeenCalledExactlyOnceWith('ranger@example.com');
  });

  it('forwards blur to the binding so validation can run on touch', () => {
    const props = buildProps();
    renderForm(props);

    fireIonBlur(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.name));

    expect(props.name.onBlur).toHaveBeenCalledOnce();
  });

  it('surfaces the field error text supplied by the binding', () => {
    renderForm(buildProps({ name: buildBinding({ errorMessage: 'Name is required.' }) }));

    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.name)).toHaveAttribute(
      'error-text',
      'Name is required.',
    );
  });

  it('shows no success note before a successful submission', () => {
    renderForm();

    expect(screen.queryByTestId(WORKBENCH_FORM_TEST_IDS.result)).not.toBeInTheDocument();
  });

  it('announces the success message when one is provided', () => {
    renderForm(buildProps({ successMessage: 'Submitted as Ranger' }));

    const result = screen.getByTestId(WORKBENCH_FORM_TEST_IDS.result);
    expect(result).toHaveTextContent('Submitted as Ranger');
    expect(result).toHaveAttribute('role', 'status');
  });

  it('submits through the injected handler', async () => {
    const props = buildProps();
    renderForm(props);

    await userEvent.click(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.submit));

    expect(props.onSubmit).toHaveBeenCalledOnce();
  });

  it('leaves validation to the schema rather than the browser', () => {
    renderForm();

    expect(screen.getByTestId(WORKBENCH_FORM_TEST_IDS.submit)).toHaveAttribute('type', 'submit');
    expect(queryForm()).toHaveAttribute('novalidate');
  });
});
