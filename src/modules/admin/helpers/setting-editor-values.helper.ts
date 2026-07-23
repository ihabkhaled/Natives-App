import { replaceArrayItem, type ReorderableRowView, type SelectFieldOption } from '@/shared/ui';

import type {
  CollectionEditorBinding,
  SettingEditorBinding,
} from '../components/setting-editors/setting-editors.types';
import type { SettingKey } from '../constants/admin.constants';
import {
  ATTENDANCE_STATUS_CODES,
  SETTING_VALUE_BOUNDS,
  type AttendanceStatusCode,
} from '../constants/setting-values.constants';
import type {
  AttendanceStatusEntry,
  AttendanceStatusesValue,
  AttendanceWeightsValue,
  BadgeTier,
  BadgeTiersValue,
  ScaleBand,
  SessionTypeEntry,
  SessionTypesValue,
} from '../types/setting-values.types';

const COLLECTION_EDITOR_KEYS: readonly SettingKey[] = [
  'attendance_statuses',
  'session_types',
  'badge_tiers',
  'assessment_scale',
];

/** Splits the 8-way editor union so each switch stays within budget. */
export function isCollectionBinding(
  binding: SettingEditorBinding,
): binding is CollectionEditorBinding {
  return COLLECTION_EDITOR_KEYS.includes(binding.settingKey);
}

interface RowControlLabels {
  readonly moveUp: string;
  readonly moveDown: string;
  readonly remove: string;
}

interface RowControlsInput {
  readonly index: number;
  readonly count: number;
  readonly labels: RowControlLabels;
  readonly onMove: (index: number, offset: -1 | 1) => void;
  readonly onRemove: ((index: number) => void) | null;
}

/** The move/remove control surface of one reorderable editor row. */
export function buildRowControls(
  input: RowControlsInput,
): Omit<ReorderableRowView, 'key' | 'content'> {
  const remove = input.onRemove;
  return {
    moveUpLabel: input.labels.moveUp,
    moveDownLabel: input.labels.moveDown,
    removeLabel: remove === null ? null : input.labels.remove,
    canMoveUp: input.index > 0,
    canMoveDown: input.index < input.count - 1,
    onMoveUp: () => {
      input.onMove(input.index, -1);
    },
    onMoveDown: () => {
      input.onMove(input.index, 1);
    },
    onRemove:
      remove === null
        ? null
        : () => {
            remove(input.index);
          },
  };
}

/** The first option's value, or '' when the option list is empty. */
export function firstOptionValue(options: readonly SelectFieldOption[]): string {
  return options[0]?.value ?? '';
}

/** A code-select patch, ignoring anything outside the canonical seven. */
export function statusCodePatch(raw: string): Partial<AttendanceStatusEntry> {
  const code = ATTENDANCE_STATUS_CODES.find((candidate) => candidate === raw);
  return code === undefined ? {} : { code };
}

/** The options one status row offers: its own code plus the unused ones. */
export function statusOptionsFor(
  allOptions: readonly SelectFieldOption[],
  value: AttendanceStatusesValue,
  own: AttendanceStatusCode,
): readonly SelectFieldOption[] {
  const open = new Set<string>([own, ...unusedStatusCodes(value)]);
  return allOptions.filter((option) => open.has(option.value));
}

/** Canonical codes not yet present in the statuses list, in canonical order. */
export function unusedStatusCodes(value: AttendanceStatusesValue): readonly AttendanceStatusCode[] {
  const used = new Set(value.statuses.map((entry) => entry.code));
  return ATTENDANCE_STATUS_CODES.filter((code) => !used.has(code));
}

/** Append the first unused canonical status, blank-labelled and active. */
export function addStatusEntry(value: AttendanceStatusesValue): AttendanceStatusesValue {
  const code = unusedStatusCodes(value)[0];
  if (code === undefined) {
    return value;
  }
  const entry: AttendanceStatusEntry = {
    code,
    labelEn: '',
    labelAr: '',
    color: 'neutral',
    countsTowardMetrics: false,
    allowSelfCheckIn: false,
    active: true,
  };
  return { statuses: [...value.statuses, entry] };
}

export function patchStatusEntry(
  value: AttendanceStatusesValue,
  index: number,
  patch: Partial<AttendanceStatusEntry>,
): AttendanceStatusesValue {
  const entry = value.statuses[index];
  if (entry === undefined) {
    return value;
  }
  return { statuses: replaceArrayItem(value.statuses, index, { ...entry, ...patch }) };
}

/** Append a blank session type with a unique placeholder code. */
export function addSessionType(value: SessionTypesValue): SessionTypesValue {
  const used = new Set(value.types.map((entry) => entry.code));
  let suffix = value.types.length + 1;
  while (used.has(`session_${suffix}`)) {
    suffix += 1;
  }
  const entry: SessionTypeEntry = {
    code: `session_${suffix}`,
    labelEn: '',
    labelAr: '',
    color: 'primary',
    active: true,
  };
  return { types: [...value.types, entry] };
}

export function patchSessionType(
  value: SessionTypesValue,
  index: number,
  patch: Partial<SessionTypeEntry>,
): SessionTypesValue {
  const entry = value.types[index];
  if (entry === undefined) {
    return value;
  }
  return { types: replaceArrayItem(value.types, index, { ...entry, ...patch }) };
}

/** Set (or clear with null) one status weight; keys stay the derived rows. */
export function setWeight(
  value: AttendanceWeightsValue,
  code: string,
  weight: number | null,
): AttendanceWeightsValue {
  const next = { ...value.weights };
  if (weight === null) {
    const { [code]: _removed, ...rest } = next;
    return { weights: rest };
  }
  next[code] = weight;
  return { weights: next };
}

/** Append a band starting after the last one, clamped to the scale ceiling. */
export function addScaleBand(bands: readonly ScaleBand[], max: number): readonly ScaleBand[] {
  const last = bands.at(-1);
  const from = Math.min(last === undefined ? 0 : last.to + 1, max);
  return [...bands, { key: `band_${bands.length + 1}`, labelEn: '', labelAr: '', from, to: from }];
}

export function patchScaleBand(
  bands: readonly ScaleBand[],
  index: number,
  patch: Partial<ScaleBand>,
): readonly ScaleBand[] {
  const band = bands[index];
  return band === undefined ? bands : replaceArrayItem(bands, index, { ...band, ...patch });
}

/** Append a tier one point above the previous top, within the bound. */
export function addBadgeTier(value: BadgeTiersValue): BadgeTiersValue {
  const last = value.tiers.at(-1);
  const threshold = Math.min(
    last === undefined ? 0 : last.threshold + 1,
    SETTING_VALUE_BOUNDS.thresholdMax,
  );
  const tier: BadgeTier = {
    key: `tier_${value.tiers.length + 1}`,
    labelEn: '',
    labelAr: '',
    threshold,
    color: 'neutral',
  };
  return { tiers: [...value.tiers, tier] };
}

export function patchBadgeTier(
  value: BadgeTiersValue,
  index: number,
  patch: Partial<BadgeTier>,
): BadgeTiersValue {
  const tier = value.tiers[index];
  if (tier === undefined) {
    return value;
  }
  return { tiers: replaceArrayItem(value.tiers, index, { ...tier, ...patch }) };
}
