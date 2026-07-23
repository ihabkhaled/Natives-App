import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { bindSettingEditor, emptySettingValue } from '@/modules/admin/helpers/setting-draft.helper';

import { buildTestEditorContext } from '../../../../../tests/factories/setting-editors.factory';
import { fireIonInput, fireIonInputCleared } from '../../../../../tests/setup/ionic-events.helper';
import type { RawJsonFormView, SettingVersionFormView } from '../../types/admin-view.types';
import { SettingVersionForm } from './setting-version-form.component';

function makeRawJson(overrides: Partial<RawJsonFormView>): RawJsonFormView {
  return {
    toggleLabel: 'Advanced: edit as JSON',
    intro: 'Platform administrators only.',
    isOpen: false,
    onToggle: vi.fn(),
    textLabel: 'Value (JSON)',
    textValue: '',
    onTextChange: vi.fn(),
    applyLabel: 'Apply JSON to the editor',
    onApply: vi.fn(),
    errorMessage: null,
    ...overrides,
  };
}

function makeForm(overrides: Partial<SettingVersionFormView>): SettingVersionFormView {
  return {
    heading: 'Schedule a change',
    intro: 'A new version never edits history.',
    editor: bindSettingEditor('badge_tiers', emptySettingValue('badge_tiers'), vi.fn()),
    editorContext: buildTestEditorContext(),
    effectiveFrom: {
      label: 'Effective from',
      value: '',
      displayValue: '',
      placeholder: 'Select a date and time',
      openLabel: 'Open the effective-from picker',
      dialogTitle: 'Choose when the change takes effect',
      closeLabel: 'Done',
      isOpen: false,
      minWallTime: '2026-07-23T12:00',
      hint: 'Times are Africa/Cairo',
      errorMessage: null,
      onOpen: vi.fn(),
      onDismiss: vi.fn(),
      onChange: vi.fn(),
    },
    noteLabel: 'Reason for the change',
    noteValue: '',
    onNoteChange: vi.fn(),
    issuesHeading: 'Fix before scheduling',
    validationIssues: [],
    validationMessage: null,
    rawJson: null,
    submitLabel: 'Schedule change',
    isSaving: false,
    canSubmit: false,
    onSubmit: vi.fn(),
    onPrepareReplacement: vi.fn(),
    ...overrides,
  };
}

describe('SettingVersionForm', () => {
  it('renders the typed editor and the Cairo datetime field — no JSON textarea', () => {
    render(<SettingVersionForm form={makeForm({})} />);

    expect(screen.getByTestId('admin-setting-editor')).toBeInTheDocument();
    expect(screen.getByTestId('admin-version-effective-from-trigger')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-version-value')).not.toBeInTheDocument();
  });

  it('lists the blocking issues as one alert', () => {
    render(
      <SettingVersionForm
        form={makeForm({ validationIssues: ['Thresholds must rise from tier to tier.'] })}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Fix before scheduling');
    expect(screen.getByTestId('admin-version-issue')).toHaveTextContent('Thresholds must rise');
  });

  it('keeps the raw disclosure closed until toggled', async () => {
    const onToggle = vi.fn();
    render(<SettingVersionForm form={makeForm({ rawJson: makeRawJson({ onToggle }) })} />);

    expect(screen.queryByTestId('admin-version-value')).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId('admin-version-raw-toggle'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('keeps the open disclosure quiet while the document is still valid', () => {
    render(<SettingVersionForm form={makeForm({ rawJson: makeRawJson({ isOpen: true }) })} />);

    expect(screen.getByTestId('admin-version-value')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-version-raw-error')).not.toBeInTheDocument();
  });

  it('lets the privileged disclosure edit, fail honestly, and apply', () => {
    const onTextChange = vi.fn();
    render(
      <SettingVersionForm
        form={makeForm({
          rawJson: makeRawJson({
            isOpen: true,
            errorMessage: 'This document does not match the setting contract.',
            onTextChange,
          }),
        })}
      />,
    );

    fireIonInput(screen.getByTestId('admin-version-value'), '{"tiers":[]}');
    expect(onTextChange).toHaveBeenCalledWith('{"tiers":[]}');
    fireIonInputCleared(screen.getByTestId('admin-version-value'));
    expect(onTextChange).toHaveBeenLastCalledWith('');
    expect(screen.getByTestId('admin-version-raw-error')).toHaveTextContent('does not match');
    expect(screen.getByTestId('admin-version-raw-apply')).toBeInTheDocument();
  });

  it('submits through the guarded primary action', async () => {
    const onSubmit = vi.fn();
    render(<SettingVersionForm form={makeForm({ canSubmit: true, onSubmit })} />);

    await userEvent.click(screen.getByTestId('admin-version-submit'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('records the reason through the audit field', () => {
    const onNoteChange = vi.fn();
    render(<SettingVersionForm form={makeForm({ onNoteChange })} />);

    fireIonInput(screen.getByTestId('admin-version-note'), 'Seasonal tier rework');
    expect(onNoteChange).toHaveBeenCalledWith('Seasonal tier rework');
  });

  it('announces a past-instant refusal on the datetime field itself', () => {
    const base = makeForm({ validationMessage: 'Pick a moment in the future.' });
    render(
      <SettingVersionForm
        form={{
          ...base,
          effectiveFrom: { ...base.effectiveFrom, errorMessage: 'Pick a moment in the future.' },
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Pick a moment in the future.');
  });
});
