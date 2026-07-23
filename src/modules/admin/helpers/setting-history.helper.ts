import { I18N_KEYS } from '@/shared/i18n';

import type { SettingVersion } from '../types/admin.types';
import type {
  SettingDiffRowView,
  SettingHistoryEntryView,
  SettingHistoryLegacyView,
  SettingHistoryView,
} from '../types/admin-view.types';
import { summarizeSettingValue } from './setting-summary.helper';
import {
  diffSettingValues,
  type SettingDiffEntry,
  type SettingDiffKind,
} from './settings-diff.helper';

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface SettingHistoryContext {
  readonly t: Translate;
  readonly formatInstant: (iso: string) => string;
  readonly nowIso: string;
  readonly canManage: boolean;
  readonly cancellingId: string | null;
  readonly onCancel: (version: SettingVersion) => void;
  readonly onReplace: () => void;
}

const DIFF_KIND_LABEL_KEYS: Record<SettingDiffKind, string> = {
  added: I18N_KEYS.settingHistory.diffAdded,
  removed: I18N_KEYS.settingHistory.diffRemoved,
  changed: I18N_KEYS.settingHistory.diffChanged,
  reordered: I18N_KEYS.settingHistory.diffReordered,
};

const DIFF_KIND_TONES: Record<SettingDiffKind, string> = {
  added: 'success',
  removed: 'danger',
  changed: 'warning',
  reordered: 'medium',
};

function toDiffRow(t: Translate, entry: SettingDiffEntry, index: number): SettingDiffRowView {
  return {
    key: `${entry.kind}-${entry.label}-${index}`,
    kindLabel: t(DIFF_KIND_LABEL_KEYS[entry.kind]),
    tone: DIFF_KIND_TONES[entry.kind],
    label: entry.label,
    beforeLabel: entry.before,
    afterLabel: entry.after,
  };
}

interface EntryDiff {
  readonly diffRows: readonly SettingDiffRowView[];
  readonly diffEmptyLabel: string | null;
  readonly notComparableLabel: string | null;
}

function buildEntryDiff(
  t: Translate,
  version: SettingVersion,
  previous: SettingVersion | undefined,
): EntryDiff {
  if (previous === undefined || version.value.state === 'legacy') {
    return { diffRows: [], diffEmptyLabel: null, notComparableLabel: null };
  }
  if (previous.value.state === 'legacy') {
    return {
      diffRows: [],
      diffEmptyLabel: null,
      notComparableLabel: t(I18N_KEYS.settingHistory.diffNotComparable),
    };
  }
  const entries = diffSettingValues(version.settingKey, previous.value.value, version.value.value);
  return {
    diffRows: entries.map((entry, index) => toDiffRow(t, entry, index)),
    diffEmptyLabel: entries.length === 0 ? t(I18N_KEYS.settingHistory.diffNone) : null,
    notComparableLabel: null,
  };
}

interface EntryState {
  readonly label: string;
  readonly tone: string;
}

function entryState(
  t: Translate,
  version: SettingVersion,
  context: SettingHistoryContext,
  inEffectId: string | null,
): EntryState {
  if (version.value.state === 'legacy') {
    return { label: t(I18N_KEYS.settingHistory.stateLegacy), tone: 'warning' };
  }
  if (version.effectiveFrom > context.nowIso) {
    return { label: t(I18N_KEYS.settingHistory.stateScheduled), tone: 'tertiary' };
  }
  if (version.id === inEffectId) {
    return { label: t(I18N_KEYS.settingHistory.stateCurrent), tone: 'success' };
  }
  return { label: t(I18N_KEYS.settingHistory.statePast), tone: 'medium' };
}

function buildLegacyView(
  t: Translate,
  version: SettingVersion,
  context: SettingHistoryContext,
): SettingHistoryLegacyView | null {
  if (version.value.state !== 'legacy') {
    return null;
  }
  return {
    notice: t(I18N_KEYS.settingHistory.legacyNotice),
    disclosureLabel: t(I18N_KEYS.settingHistory.legacyDisclosure),
    rawJson: JSON.stringify(version.value.raw, null, 2),
    replaceLabel: context.canManage ? t(I18N_KEYS.settingHistory.legacyReplace) : null,
    onReplace: context.canManage ? context.onReplace : null,
  };
}

function buildEntry(
  context: SettingHistoryContext,
  version: SettingVersion,
  previous: SettingVersion | undefined,
  inEffectId: string | null,
): SettingHistoryEntryView {
  const t = context.t;
  const state = entryState(t, version, context, inEffectId);
  const scheduled = version.effectiveFrom > context.nowIso;
  const offerCancel = scheduled && context.canManage;
  return {
    id: version.id,
    effectiveLabel: context.formatInstant(version.effectiveFrom),
    stateLabel: state.label,
    stateTone: state.tone,
    actorLabel:
      version.createdBy === null
        ? t(I18N_KEYS.settingHistory.actorUnknown)
        : t(I18N_KEYS.settingHistory.actor, { actor: version.createdBy }),
    noteLabel:
      version.note === null
        ? t(I18N_KEYS.adminSettings.versionNoNote)
        : `${t(I18N_KEYS.adminSettings.versionNoteLabel)}: ${version.note}`,
    summary:
      version.value.state === 'valid'
        ? summarizeSettingValue(t, version.settingKey, version.value.value)
        : null,
    ...buildEntryDiff(t, version, previous),
    legacy: buildLegacyView(t, version, context),
    cancelLabel: offerCancel ? t(I18N_KEYS.settingHistory.cancel) : null,
    onCancel: offerCancel
      ? () => {
          context.onCancel(version);
        }
      : null,
    isCancelling: context.cancellingId === version.id,
  };
}

/**
 * The readable, diffed history of one key: newest first, each entry compared
 * by stable identity against its chronological predecessor, scheduled rows
 * cancellable, and legacy rows shown honestly with the guided replace flow.
 */
/**
 * The optimistic-guard head: the newest version the client saw for the key,
 * or null when no versions exist yet.
 */
export function resolveHeadVersionId(versions: readonly SettingVersion[]): string | null {
  const newest = [...versions].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  return newest?.id ?? null;
}

export function buildSettingHistory(
  context: SettingHistoryContext,
  versions: readonly SettingVersion[],
): SettingHistoryView {
  const ordered = [...versions].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  const inEffectId = ordered.find((version) => version.effectiveFrom <= context.nowIso)?.id ?? null;
  return {
    entries: ordered.map((version, index) =>
      buildEntry(context, version, ordered[index + 1], inEffectId),
    ),
    emptyLabel: context.t(I18N_KEYS.settingHistory.empty),
  };
}
