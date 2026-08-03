import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildAnomalyCardView,
  buildRepairPreviewView,
} from '../../../../tests/factories/data-quality-view.factory';
import { AnomalyCard } from './anomaly-card';
import { RepairPreviewPanel } from './repair-preview-panel';

describe('AnomalyCard', () => {
  it('names the rule, the affected resource and how often it recurred', () => {
    render(
      <AnomalyCard
        view={buildAnomalyCardView()}
        previewLabel="Preview"
        onPreview={vi.fn()}
        onTransition={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'roster.duplicate_jersey' })).toBeInTheDocument();
    expect(screen.getByText('Affects: roster · roster-1')).toBeInTheDocument();
    expect(screen.getByText('Seen 4 times')).toBeInTheDocument();
  });

  it('hides the repair affordance once an operator closed the finding', () => {
    render(
      <AnomalyCard
        view={buildAnomalyCardView({
          canRepair: false,
          transitions: [{ key: 'reopen', label: 'Reopen' }],
        })}
        previewLabel="Preview"
        onPreview={vi.fn()}
        onTransition={vi.fn()}
      />,
    );

    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(screen.getByText('Reopen')).toBeInTheDocument();
  });

  it('reports the anomaly and the chosen move to its caller', () => {
    const onPreview = vi.fn();
    const onTransition = vi.fn();
    render(
      <AnomalyCard
        view={buildAnomalyCardView()}
        previewLabel="Preview"
        onPreview={onPreview}
        onTransition={onTransition}
      />,
    );

    fireEvent.click(screen.getByTestId(`${TEST_IDS.dataQualityPreviewButton}-a1`));
    fireEvent.click(screen.getByTestId(`${TEST_IDS.dataQualityTransition}-a1-acknowledge`));

    expect(onPreview).toHaveBeenCalledWith('a1');
    expect(onTransition).toHaveBeenCalledWith('a1', 'acknowledge');
  });
});

describe('RepairPreviewPanel', () => {
  it('states the impact and whether the change can be undone', () => {
    render(<RepairPreviewPanel view={buildRepairPreviewView()} />);

    expect(screen.getByText('4 records affected')).toBeInTheDocument();
    expect(screen.getByText('This can be undone after it is applied.')).toBeInTheDocument();
  });

  it('says plainly when a repair cannot be undone', () => {
    render(
      <RepairPreviewPanel
        view={buildRepairPreviewView({ reversibilityLabel: 'This cannot be undone once applied.' })}
      />,
    );

    expect(screen.getByText('This cannot be undone once applied.')).toBeInTheDocument();
  });

  it('applies and cancels through its caller', () => {
    const view = buildRepairPreviewView({ onApply: vi.fn(), onCancel: vi.fn() });
    render(<RepairPreviewPanel view={view} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.dataQualityApplyButton));
    fireEvent.click(screen.getByTestId(TEST_IDS.dataQualityCancelButton));

    expect(view.onApply).toHaveBeenCalledOnce();
    expect(view.onCancel).toHaveBeenCalledOnce();
  });
});
