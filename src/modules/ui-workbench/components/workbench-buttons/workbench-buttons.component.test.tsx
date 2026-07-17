import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WorkbenchButtons } from './workbench-buttons.component';
import { WORKBENCH_BUTTONS_TEST_ID } from './workbench-buttons.constants';

const PROPS = {
  heading: 'Buttons',
  primaryLabel: 'Primary action',
  secondaryLabel: 'Secondary action',
  dangerLabel: 'Destructive action',
};

function renderButtons(): void {
  render(<WorkbenchButtons {...PROPS} />);
}

function buttonsOf(): readonly Element[] {
  return [...screen.getByTestId(WORKBENCH_BUTTONS_TEST_ID).querySelectorAll('ion-button')];
}

describe('WorkbenchButtons', () => {
  it('renders the section heading', () => {
    renderButtons();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Buttons');
  });

  it('renders the section under its test id', () => {
    renderButtons();

    expect(screen.getByTestId(WORKBENCH_BUTTONS_TEST_ID)).toBeInTheDocument();
  });

  it('renders every provided label', () => {
    renderButtons();

    expect(screen.getByText('Primary action')).toBeInTheDocument();
    expect(screen.getByText('Secondary action')).toBeInTheDocument();
    expect(screen.getByText('Destructive action')).toBeInTheDocument();
  });

  it('demonstrates one button per tone', () => {
    renderButtons();

    expect(buttonsOf().map((button) => button.getAttribute('color'))).toEqual([
      'primary',
      'medium',
      'danger',
    ]);
  });
});
