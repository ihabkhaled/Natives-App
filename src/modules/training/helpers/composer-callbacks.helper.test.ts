import { describe, expect, it, vi } from 'vitest';

import { EMPTY_COMPOSER_STATE } from '../constants/training-form.constants';
import { buildComposerCallbacks, type ComposerCallbackDeps } from './composer-callbacks.helper';

function setup(overrides: Partial<ComposerCallbackDeps> = {}) {
  const deps: ComposerCallbackDeps = {
    form: {
      ...EMPTY_COMPOSER_STATE,
      activityTypeId: 'type-gym',
      performedOn: '2026-07-12',
      duration: '45',
    },
    validationKey: null,
    datePicker: {
      open: vi.fn(),
      dismiss: vi.fn(),
      choose: vi.fn((value: string, commit: (value: string) => void) => {
        commit(value);
      }),
    },
    patch: vi.fn(),
    reset: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };
  return { deps, callbacks: buildComposerCallbacks(deps) };
}

describe('buildComposerCallbacks', () => {
  it('patches each plain field with the value it was given', () => {
    const { deps, callbacks } = setup();

    callbacks.onTypeChange('type-run');
    callbacks.onDurationChange('60');
    callbacks.onQuantityChange('30');
    callbacks.onNotesChange('Tempo run.');

    expect(deps.patch).toHaveBeenNthCalledWith(1, { activityTypeId: 'type-run' });
    expect(deps.patch).toHaveBeenNthCalledWith(2, { duration: '60' });
    expect(deps.patch).toHaveBeenNthCalledWith(3, { quantity: '30' });
    expect(deps.patch).toHaveBeenNthCalledWith(4, { notes: 'Tempo run.' });
  });

  it('commits a chosen day through the picker so it closes in the same gesture', () => {
    const { deps, callbacks } = setup();

    callbacks.onDateChange('2026-07-05');

    expect(deps.datePicker.choose).toHaveBeenCalledWith('2026-07-05', expect.any(Function));
    expect(deps.patch).toHaveBeenCalledWith({ performedOn: '2026-07-05' });
  });

  it('delegates opening and dismissing straight to the picker', () => {
    const { deps, callbacks } = setup();

    expect(callbacks.onDateOpen).toBe(deps.datePicker.open);
    expect(callbacks.onDateDismiss).toBe(deps.datePicker.dismiss);
  });

  it('submits the mapped draft and clears the form when the form is valid', () => {
    const { deps, callbacks } = setup();

    callbacks.onSave();

    expect(deps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ activityTypeId: 'type-gym', performedOn: '2026-07-12' }),
    );
    expect(deps.reset).toHaveBeenCalledTimes(1);
  });

  it('refuses to submit while the form is invalid', () => {
    const { deps, callbacks } = setup({ validationKey: 'training.validationDurationRequired' });

    callbacks.onSave();

    expect(deps.onSave).not.toHaveBeenCalled();
    expect(deps.reset).not.toHaveBeenCalled();
  });
});
