import { act } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { useSettingVersionForm } from './use-setting-version-form.hook';

function renderForm() {
  return renderHookWithProviders(() => useSettingVersionForm('team-1', 'roster_limits'));
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useSettingVersionForm', () => {
  it('starts with an empty object and no reason, so it cannot be submitted', () => {
    const { result } = renderForm();

    expect(result.current.valueValue).toBe('{}');
    expect(result.current.canSubmit).toBe(false);
  });

  it('reports a malformed value ahead of a missing reason', () => {
    const { result } = renderForm();

    act(() => {
      result.current.onValueChange('{not json');
    });

    expect(result.current.validationMessage).toBe('Enter valid JSON.');
  });

  it('reports the missing reason once the value parses', () => {
    const { result } = renderForm();

    act(() => {
      result.current.onValueChange('{"max":30}');
    });

    expect(result.current.validationMessage).toBe('Give a reason of at least 5 characters.');
  });

  it('clears the validation once the value and the reason are both present', () => {
    const { result } = renderForm();

    act(() => {
      result.current.onValueChange('{"max":30}');
    });
    act(() => {
      result.current.onNoteChange('Squad expansion');
    });

    expect(result.current.validationMessage).toBeNull();
    expect(result.current.canSubmit).toBe(true);
  });

  it('refuses to submit an invalid draft even when the command is invoked directly', () => {
    const { result } = renderForm();

    act(() => {
      result.current.onSubmit();
    });

    expect(result.current.isSaving).toBe(false);
  });

  it('keeps the chosen effective instant', () => {
    const { result } = renderForm();

    act(() => {
      result.current.onEffectiveFromChange('2026-09-01T00:00:00.000Z');
    });

    expect(result.current.effectiveFromValue).toBe('2026-09-01T00:00:00.000Z');
  });
});
