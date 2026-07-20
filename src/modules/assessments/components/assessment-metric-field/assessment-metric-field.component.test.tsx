import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { fireIonInput } from '../../../../../tests/setup/ionic-events.helper';

import { buildMetricFieldView } from '../../../../../tests/factories/assessments-view.factory';
import { AssessmentMetricField } from './assessment-metric-field.component';
import type { AssessmentMetricFieldProps } from './assessment-metric-field.types';

function buildProps(
  overrides: Partial<AssessmentMetricFieldProps> = {},
): AssessmentMetricFieldProps {
  return {
    field: buildMetricFieldView(),
    isDisabled: false,
    noteLabel: 'Evidence note',
    notePlaceholder: 'What did you observe?',
    notEvaluatedLabel: 'Not evaluated',
    clearLabel: 'Clear',
    onScoreChange: vi.fn(),
    onNumericChange: vi.fn(),
    onTextChange: vi.fn(),
    onNoteChange: vi.fn(),
    onClearValue: vi.fn(),
    ...overrides,
  };
}

describe('AssessmentMetricField', () => {
  it('labels the metric with its direction, source, and requirement', () => {
    render(<AssessmentMetricField {...buildProps()} />);

    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Higher is better')).toBeInTheDocument();
    expect(screen.getByText('Measured')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('marks the selected score and reports the value', () => {
    render(<AssessmentMetricField {...buildProps()} />);

    expect(screen.getByRole('button', { name: '4' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId(TEST_IDS.assessmentMetricValueReadout)).toHaveTextContent('4');
  });

  it('shows "not evaluated" instead of a zero when nothing was recorded', () => {
    render(
      <AssessmentMetricField
        {...buildProps({
          field: buildMetricFieldView({
            numericValue: null,
            isEvaluated: false,
            valueReadout: 'Not evaluated',
          }),
        })}
      />,
    );

    const readout = screen.getByTestId(TEST_IDS.assessmentMetricValueReadout);
    expect(readout).toHaveTextContent('Not evaluated');
    expect(readout).not.toHaveTextContent('0');
    expect(screen.getByRole('button', { name: '0' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps a scored zero distinct from not evaluated', () => {
    render(
      <AssessmentMetricField
        {...buildProps({
          field: buildMetricFieldView({ numericValue: 0, isEvaluated: true, valueReadout: '0' }),
        })}
      />,
    );

    expect(screen.getByRole('button', { name: '0' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId(TEST_IDS.assessmentMetricValueReadout)).toHaveTextContent('0');
  });

  it('forwards a score selection', async () => {
    const props = buildProps();
    render(<AssessmentMetricField {...props} />);

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    expect(props.onScoreChange).toHaveBeenCalledExactlyOnceWith('metric-speed', 2);
  });

  it('forwards a clear back to "not evaluated"', async () => {
    const props = buildProps();
    render(<AssessmentMetricField {...props} />);

    await userEvent.click(screen.getByTestId(TEST_IDS.assessmentMetricNotEvaluated));

    expect(props.onClearValue).toHaveBeenCalledExactlyOnceWith('metric-speed');
  });

  it('forwards an evidence note edit', () => {
    const props = buildProps();
    render(<AssessmentMetricField {...props} />);

    fireIonInput(screen.getByTestId(TEST_IDS.assessmentMetricNote), 'observed twice');

    expect(props.onNoteChange).toHaveBeenCalledExactlyOnceWith('metric-speed', 'observed twice');
  });

  it('renders a numeric input for a measured scale', () => {
    render(
      <AssessmentMetricField
        {...buildProps({
          field: buildMetricFieldView({ isScoreScale: false, unitLabel: 'Unit: s' }),
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.assessmentMetricNumber)).toBeInTheDocument();
    expect(screen.getByText('Unit: s')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.assessmentMetricScore)).not.toBeInTheDocument();
  });

  it('forwards a measured value edit', () => {
    const props = buildProps({ field: buildMetricFieldView({ isScoreScale: false }) });
    render(<AssessmentMetricField {...props} />);

    fireIonInput(screen.getByTestId(TEST_IDS.assessmentMetricNumber), '12.5');

    expect(props.onNumericChange).toHaveBeenCalledExactlyOnceWith('metric-speed', '12.5');
  });

  it('forwards a free-text edit', () => {
    const props = buildProps({
      field: buildMetricFieldView({ isScoreScale: false, isTextScale: true }),
    });
    render(<AssessmentMetricField {...props} />);

    fireIonInput(screen.getByTestId(TEST_IDS.assessmentMetricText), 'steady');

    expect(props.onTextChange).toHaveBeenCalledExactlyOnceWith('metric-speed', 'steady');
  });

  it('renders a text input for a descriptive scale', () => {
    render(
      <AssessmentMetricField
        {...buildProps({
          field: buildMetricFieldView({ isScoreScale: false, isTextScale: true }),
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.assessmentMetricText)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.assessmentMetricNumber)).not.toBeInTheDocument();
  });

  it('hides the clear action and disables the scores when read-only', () => {
    render(<AssessmentMetricField {...buildProps({ isDisabled: true })} />);

    expect(screen.queryByTestId(TEST_IDS.assessmentMetricNotEvaluated)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeDisabled();
  });

  it('marks an optional metric as optional', () => {
    render(
      <AssessmentMetricField
        {...buildProps({
          field: buildMetricFieldView({ isRequired: false, requiredLabel: 'Optional' }),
        })}
      />,
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });
});
