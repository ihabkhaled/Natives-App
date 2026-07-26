import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { fireIonChange } from '../../../../../tests/setup/ionic-events.helper';
import { DimensionPicker } from './dimension-picker.component';

describe('DimensionPicker', () => {
  it('renders the grouped options and reports a change', () => {
    const onDimensionChange = vi.fn();
    render(
      <DimensionPicker
        controls={{
          dimensionLabel: 'Dimension',
          dimensionValue: 'attendance',
          dimensionGroups: [
            {
              key: 'teamHealth',
              label: 'Team health',
              options: [{ value: 'attendance', label: 'Attendance' }],
            },
          ],
          onDimensionChange,
          periodLabel: 'Period',
          periodValue: 'monthly',
          periodOptions: [{ value: 'monthly', label: 'Monthly' }],
          onPeriodChange: vi.fn(),
        }}
      />,
    );
    fireIonChange(screen.getByTestId(TEST_IDS.analyticsDimensionSelect), 'consistency');
    expect(onDimensionChange).toHaveBeenCalledWith('consistency');
  });
});
