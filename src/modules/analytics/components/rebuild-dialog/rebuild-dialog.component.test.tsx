import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { RebuildDialog } from './rebuild-dialog.component';

describe('RebuildDialog', () => {
  it('renders the confirm dialog with its period options', () => {
    render(
      <RebuildDialog
        view={{
          heading: 'Rebuild',
          intro: 'idempotent',
          periodLabel: 'Period',
          periodValue: 'monthly',
          periodOptions: [{ value: 'monthly', label: 'Monthly' }],
          onPeriodChange: vi.fn(),
          confirmLabel: 'Rebuild',
          cancelLabel: 'Cancel',
          canConfirm: true,
          isRunning: false,
          onConfirm: vi.fn(),
          onCancel: vi.fn(),
        }}
      />,
    );
    expect(screen.getByTestId(TEST_IDS.analyticsRebuildDialog)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.analyticsRebuildConfirm)).toBeInTheDocument();
  });
});
