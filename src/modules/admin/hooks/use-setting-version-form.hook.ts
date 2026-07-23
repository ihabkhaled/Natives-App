import { useState } from 'react';

import { nowCairoWallTime, nowIso } from '@/packages/date';
import { useAppTranslation } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';
import { useAppToast } from '@/shared/ui';

import type {
  SettingEditorContext,
  WeightsEditorContext,
} from '../components/setting-editors/setting-editors.types';
import { ADMIN_LIMITS, type SettingKey } from '../constants/admin.constants';
import { bindSettingEditor, emptySettingValue } from '../helpers/setting-draft.helper';
import {
  collectDraftIssues,
  describeScalePreview,
  resolveEffectiveFrom,
} from '../helpers/setting-form.helper';
import {
  buildEffectiveFromView,
  buildSettingVersionFormView,
  isScheduleBlocked,
  resolveDraft,
} from '../helpers/setting-form-view.helper';
import type { EffectiveSetting } from '../types/admin.types';
import type { SettingVersionFormView } from '../types/admin-view.types';
import type { TypedSettingValue } from '../types/setting-values.types';
import { useCreateSettingVersion } from './use-create-setting-version.hook';
import type { EffectiveInstantState } from './use-effective-instant.hook';
import { useRawSettingJson } from './use-raw-setting-json.hook';

export interface SettingVersionFormDependencies {
  readonly settingKey: SettingKey;
  readonly effective: EffectiveSetting | undefined;
  /** Newest version id the client saw for this key (optimistic guard). */
  readonly headVersionId: string | null;
  /** Platform-admin-only raw JSON disclosure (D10). */
  readonly canUseRawJson: boolean;
  readonly instant: EffectiveInstantState;
  readonly weights: WeightsEditorContext;
  readonly contextBase: Omit<SettingEditorContext, 'weights' | 'scalePreview'>;
}

/**
 * The effective-dated change form, typed end to end: a per-key draft edited
 * by the registry editor, a Cairo wall-time instant converted to strict UTC
 * at the edge, a mandatory audit reason, and the optimistic head guard whose
 * stale-409 refresh asks the admin to re-confirm rather than overwrite.
 */
export function useSettingVersionForm(
  teamId: string,
  deps: SettingVersionFormDependencies,
): SettingVersionFormView {
  const { t, locale } = useAppTranslation();
  const toast = useAppToast();
  const [drafts, setDrafts] = useState<Partial<Record<SettingKey, TypedSettingValue>>>({});
  const [note, setNote] = useState('');
  const key = deps.settingKey;
  const weightRows = key === 'attendance_weights' ? deps.weights.rows : null;
  const draft = resolveDraft(key, drafts, deps.effective, weightRows);
  const setDraft = (next: TypedSettingValue): void => {
    setDrafts((current) => ({ ...current, [key]: next }));
  };
  const mutation = useCreateSettingVersion(teamId, () => {
    setNote('');
  });
  const rawJson = useRawSettingJson(key, deps.canUseRawJson, setDraft);
  const resolution = resolveEffectiveFrom(t, locale, deps.instant.wallTime, nowIso());
  const issues = collectDraftIssues(t, key, draft, weightRows);
  const reasonOk = note.trim().length >= ADMIN_LIMITS.minimumReasonLength;
  const validationMessage = reasonOk
    ? resolution.errorMessage
    : t(I18N_KEYS.adminSettings.addVersionInvalidReason);
  const blocked = isScheduleBlocked(key, issues, validationMessage, deps.weights);
  return buildSettingVersionFormView({
    t,
    key,
    editor: bindSettingEditor(key, draft, setDraft),
    contextBase: deps.contextBase,
    weights: deps.weights,
    scalePreview: describeScalePreview(t, key, draft),
    effectiveFrom: buildEffectiveFromView({
      t,
      wallTime: deps.instant.wallTime,
      minWallTime: nowCairoWallTime(),
      resolution,
      isOpen: deps.instant.isOpen,
      onOpen: deps.instant.onOpen,
      onDismiss: deps.instant.onDismiss,
      onChange: deps.instant.onChange,
    }),
    noteValue: note,
    onNoteChange: setNote,
    validationIssues: issues,
    validationMessage,
    rawJson,
    isSaving: mutation.isRunning,
    canSubmit: !blocked && !mutation.isRunning,
    onSubmit: () => {
      if (!blocked && resolution.utcIso !== null) {
        mutation.run({
          settingKey: key,
          effectiveFrom: resolution.utcIso,
          value: draft,
          note: note.trim(),
          expectedHeadVersionId: deps.headVersionId,
        });
      }
    },
    onPrepareReplacement: () => {
      setDraft(emptySettingValue(key));
      void toast.showToast({
        message: t(I18N_KEYS.settingHistory.legacyPrepared),
        tone: 'success',
      });
    },
  });
}
