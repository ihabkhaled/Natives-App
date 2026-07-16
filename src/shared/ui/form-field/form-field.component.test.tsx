import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FormField } from './form-field.component';

describe('FormField', () => {
  it('associates the label with the control it wraps and renders its children', () => {
    render(
      <FormField label="Email" htmlFor="email-control" testId="form-field">
        <input id="email-control" data-testid="form-field-control" />
      </FormField>,
    );

    expect(screen.getByTestId('form-field')).toBeInTheDocument();
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email-control');
    expect(screen.getByLabelText('Email')).toBe(screen.getByTestId('form-field-control'));
  });

  it('renders the hint when one is provided', () => {
    render(
      <FormField label="Email" htmlFor="email-control" hint="We never share it">
        <input id="email-control" />
      </FormField>,
    );

    expect(screen.getByText('We never share it')).toBeInTheDocument();
  });

  it('omits the hint when none is provided', () => {
    render(
      <FormField label="Email" htmlFor="email-control">
        <input id="email-control" />
      </FormField>,
    );

    expect(screen.queryByText('We never share it')).not.toBeInTheDocument();
  });

  it('announces the error message through an alert region when one is provided', () => {
    render(
      <FormField label="Email" htmlFor="email-control" errorMessage="Email is required">
        <input id="email-control" />
      </FormField>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
    expect(screen.getByRole('alert')).toHaveAttribute('color', 'danger');
  });

  it('omits the alert region when no error message is provided', () => {
    render(
      <FormField label="Email" htmlFor="email-control" hint="We never share it">
        <input id="email-control" />
      </FormField>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
