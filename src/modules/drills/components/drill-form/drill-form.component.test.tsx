import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildDrillDetailScreenView } from '../../../../../tests/factories/drill-detail-view.factory';
import { fireIonChange, fireIonInput } from '../../../../../tests/setup/ionic-events.helper';
import { DrillForm } from './drill-form.component';

describe('DrillForm', () => {
  it('renders every one of the ten fields', () => {
    render(<DrillForm form={buildDrillDetailScreenView().form} />);

    expect(screen.getByTestId(TEST_IDS.drillNameInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillCategorySelect)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillIntensitySelect)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillObjectiveInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillInstructionsInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillEquipmentInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillSkillTagsInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillDurationInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillSafetyNotesInput)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.drillMediaUrlInput)).toBeInTheDocument();
  });

  it('emits a name change', () => {
    const view = buildDrillDetailScreenView();
    render(<DrillForm form={view.form} />);

    fireIonInput(screen.getByTestId(TEST_IDS.drillNameInput), 'New name');

    expect(view.form.nameField.onChange).toHaveBeenCalledWith('New name');
  });

  it('emits a category change', () => {
    const view = buildDrillDetailScreenView();
    render(<DrillForm form={view.form} />);

    fireIonChange(screen.getByTestId(TEST_IDS.drillCategorySelect), 'defense');

    expect(view.form.categoryField.onChange).toHaveBeenCalledWith('defense');
  });

  it('submits the form through its own handler', () => {
    const view = buildDrillDetailScreenView();
    render(<DrillForm form={view.form} />);

    fireEvent.submit(screen.getByTestId(TEST_IDS.drillForm));

    expect(view.form.onSubmit).toHaveBeenCalled();
  });

  it('cancels back out of the form', () => {
    const view = buildDrillDetailScreenView();
    render(<DrillForm form={view.form} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.drillCancelButton));

    expect(view.form.onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders a field validation error', () => {
    const view = buildDrillDetailScreenView();
    const form = {
      ...view.form,
      nameField: { ...view.form.nameField, errorMessage: 'Name the drill.' },
    };
    render(<DrillForm form={form} />);

    expect(screen.getByTestId(TEST_IDS.drillNameInput)).toHaveAttribute(
      'error-text',
      'Name the drill.',
    );
  });
});
