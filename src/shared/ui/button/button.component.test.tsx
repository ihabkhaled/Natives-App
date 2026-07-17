import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AppButton } from './button.component';

describe('AppButton', () => {
  it('renders the label and forwards clicks', async () => {
    const onClick = vi.fn();
    render(<AppButton label="Save" onClick={onClick} testId="save-button" />);

    await userEvent.click(screen.getByTestId('save-button'));

    expect(screen.getByTestId('save-button')).toHaveTextContent('Save');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows a spinner and disables interaction while loading', () => {
    render(<AppButton label="Save" loading testId="save-button" />);

    const button = screen.getByTestId('save-button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveProperty('disabled', true);
  });

  it('maps tones to Ionic colors and supports block expansion', () => {
    render(<AppButton label="Delete" tone="danger" expand testId="delete-button" />);

    const button = screen.getByTestId('delete-button');
    expect(button).toHaveAttribute('color', 'danger');
    expect(button).toHaveAttribute('expand', 'block');
  });

  it('stays disabled when explicitly disabled', () => {
    render(<AppButton label="Save" disabled testId="save-button" />);
    expect(screen.getByTestId('save-button')).toHaveProperty('disabled', true);
  });
});
