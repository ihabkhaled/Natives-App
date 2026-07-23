import type {
  SettingEditorContext,
  WeightsEditorContext,
} from '@/modules/admin/components/setting-editors/setting-editors.types';
import { buildEditorContextBase } from '@/modules/admin/helpers/setting-editor-labels.helper';

/** Key-echoing translator: assertions read as i18n keys, not English copy. */
const echoT = (key: string): string => key;

const EMPTY_WEIGHTS_CONTEXT: WeightsEditorContext = {
  rows: [],
  blockedNotice: null,
  loadingNotice: null,
};

/**
 * A deterministic editor context: echo-translated labels, a two-entry
 * position catalog (one archived, so the active filter is exercised), and
 * quiet weights/scale extras unless a test overrides them.
 */
export function buildTestEditorContext(
  overrides: Partial<SettingEditorContext> = {},
): SettingEditorContext {
  return {
    ...buildEditorContextBase(echoT, [
      {
        id: 'cat-position-1',
        catalog: 'position',
        key: 'handler',
        label: 'Handler',
        referenceCount: 0,
        status: 'active',
      },
      {
        id: 'cat-position-2',
        catalog: 'position',
        key: 'cutter',
        label: 'Cutter',
        referenceCount: 0,
        status: 'archived',
      },
    ]),
    weights: EMPTY_WEIGHTS_CONTEXT,
    scalePreview: null,
    ...overrides,
  };
}
