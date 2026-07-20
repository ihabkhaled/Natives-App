import { describe, expect, it, vi } from 'vitest';

import { buildCandidate } from '../../../../tests/factories/competitions.factory';
import { buildOverrideDialog } from './override-dialog.helper';

const t = (key: string): string => key;

function dialog(reason: string, isSaving = false) {
  return buildOverrideDialog(t, {
    candidate: buildCandidate({ fullName: 'Youssef Adel', overall: 'failed' }),
    reason,
    isSaving,
    onReasonChange: vi.fn(),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  });
}

describe('buildOverrideDialog', () => {
  it('refuses to confirm until a reason of the server minimum is typed', () => {
    const view = dialog('bad');

    expect(view.canConfirm).toBe(false);
    expect(view.validationMessage).toBe('squads.overrideReasonRequired');
  });

  it('unlocks once the reason is long enough', () => {
    const view = dialog('Needed for handler depth');

    expect(view.canConfirm).toBe(true);
    expect(view.validationMessage).toBeNull();
  });

  it('stays locked while the previous override is still saving', () => {
    expect(dialog('Needed for handler depth', true).canConfirm).toBe(false);
  });

  it('names the candidate the override is about', () => {
    expect(dialog('Needed for handler depth').candidateName).toBe('Youssef Adel');
  });
});
