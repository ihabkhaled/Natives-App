import { act } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { VALID_BADGE_TIERS } from '@/tests/msw/setting-values.fixture';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { buildEditorContextBase } from '../helpers/setting-editor-labels.helper';
import type { BadgeTiersValue } from '../types/setting-values.types';
import { useEffectiveInstant } from './use-effective-instant.hook';
import { useSettingVersionForm } from './use-setting-version-form.hook';

const CONTEXT_BASE = buildEditorContextBase((key: string) => key, []);
const EMPTY_WEIGHTS = { rows: [], blockedNotice: null, loadingNotice: null } as const;
const FUTURE_WALL_TIME = '2027-01-01T12:00';

interface TiersBinding {
  readonly value: BadgeTiersValue;
  readonly onChange: (next: BadgeTiersValue) => void;
}

function tiersBinding(editor: { readonly settingKey: string }): TiersBinding {
  if (editor.settingKey !== 'badge_tiers') {
    throw new Error('unexpected editor binding');
  }
  return editor as unknown as TiersBinding;
}

function renderForm(canUseRawJson = false) {
  return renderHookWithProviders(() => {
    const instant = useEffectiveInstant();
    return useSettingVersionForm('team-1', {
      settingKey: 'badge_tiers',
      effective: undefined,
      headVersionId: null,
      canUseRawJson,
      instant,
      weights: EMPTY_WEIGHTS,
      contextBase: CONTEXT_BASE,
    });
  });
}

beforeAll(async () => {
  await initTestI18n();
});

describe('useSettingVersionForm', () => {
  it('opens with a typed starting draft, blocked until instant and reason exist', () => {
    const { result } = renderForm();

    expect(tiersBinding(result.current.editor).value.tiers[0]?.key).toBe('bronze');
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.validationMessage).toBe('Give a reason of at least 5 characters.');
  });

  it('unblocks once the reason and a future Cairo instant are both present', () => {
    const { result } = renderForm();

    act(() => {
      result.current.onNoteChange('Seasonal tier rework');
    });
    act(() => {
      result.current.effectiveFrom.onChange(FUTURE_WALL_TIME);
    });

    expect(result.current.validationIssues).toEqual([]);
    expect(result.current.validationMessage).toBeNull();
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.effectiveFrom.hint).toContain('Z');
  });

  it('refuses an instant that is not in the future', () => {
    const { result } = renderForm();

    act(() => {
      result.current.onNoteChange('Seasonal tier rework');
    });
    act(() => {
      result.current.effectiveFrom.onChange('2020-01-01T12:00');
    });

    expect(result.current.canSubmit).toBe(false);
    expect(result.current.effectiveFrom.errorMessage).toBe('Pick a moment in the future.');
  });

  it('surfaces typed rule violations as translated blockers', () => {
    const { result } = renderForm();

    act(() => {
      tiersBinding(result.current.editor).onChange({
        tiers: [
          { key: 'bronze', labelEn: 'Bronze', labelAr: 'برونزي', threshold: 100, color: 'accent2' },
          { key: 'silver', labelEn: 'Silver', labelAr: 'فضي', threshold: 50, color: 'neutral' },
        ],
      });
    });

    expect(result.current.validationIssues).toContain('Thresholds must rise from tier to tier.');
    expect(result.current.canSubmit).toBe(false);
  });

  it('hides the raw JSON disclosure without the platform scope', () => {
    const { result } = renderForm();

    expect(result.current.rawJson).toBeNull();
  });

  it('lets a platform administrator apply schema-valid JSON to the editor', () => {
    const { result } = renderForm(true);

    act(() => {
      result.current.rawJson?.onTextChange(JSON.stringify(VALID_BADGE_TIERS));
    });
    act(() => {
      result.current.rawJson?.onApply();
    });

    expect(tiersBinding(result.current.editor).value.tiers).toHaveLength(3);
    expect(result.current.rawJson?.errorMessage).toBeNull();
  });

  it('refuses schema-invalid JSON in the privileged disclosure', () => {
    const { result } = renderForm(true);

    act(() => {
      result.current.rawJson?.onTextChange('{"totally":"unrelated","nonsense":123}');
    });
    act(() => {
      result.current.rawJson?.onApply();
    });

    expect(result.current.rawJson?.errorMessage).toBe(
      'This document does not match the setting contract.',
    );
  });

  it('resets to a blank valid configuration for the legacy replace flow', () => {
    const { result } = renderForm();

    act(() => {
      tiersBinding(result.current.editor).onChange({ tiers: [] });
    });
    act(() => {
      result.current.onPrepareReplacement();
    });

    expect(tiersBinding(result.current.editor).value.tiers).toHaveLength(1);
  });

  it('refuses to submit a blocked draft even when invoked directly', () => {
    const { result } = renderForm();

    act(() => {
      result.current.onSubmit();
    });

    expect(result.current.isSaving).toBe(false);
  });
});
