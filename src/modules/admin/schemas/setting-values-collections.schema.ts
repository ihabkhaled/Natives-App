import { schemaBuilder } from '@/packages/schema';

import {
  ATTENDANCE_STATUS_CODES,
  REQUIRED_STATUS_POLES,
  SETTING_CODE_PATTERN,
  SETTING_COLOR_TOKENS,
  SETTING_VALUE_BOUNDS,
} from '../constants/setting-values.constants';
import type { ScaleBand } from '../types/setting-values.types';

/**
 * The ordered-collection halves of the per-key value schemas (P2): statuses,
 * session types, badge tiers, and the assessment scale with its bands. Every
 * constraint message is the backend's machine-readable constraint code, so
 * client copy and server 400s translate through one vocabulary. Objects are
 * strict: the audited nonsense-payload hole is closed on both sides.
 */
const z = schemaBuilder;

/** Structural view of zod's refinement context (what the validators need). */
export interface SettingRefinementCtx {
  addIssue: (issue: { code: 'custom'; message: string; path?: (string | number)[] }) => void;
}

export const settingCodeField = z.string().regex(SETTING_CODE_PATTERN, 'invalid_code');
const labelField = z
  .string()
  .min(1, 'invalid_label')
  .max(SETTING_VALUE_BOUNDS.labelMaxLength, 'invalid_label');
const colorField = z.enum(SETTING_COLOR_TOKENS);

export function reportDuplicates(
  ctx: SettingRefinementCtx,
  keys: readonly string[],
  path: string,
  message: string,
): void {
  keys.forEach((key, index) => {
    if (keys.indexOf(key) !== index) {
      ctx.addIssue({ code: 'custom', message, path: [path, index] });
    }
  });
}

const attendanceStatusEntrySchema = z.strictObject({
  code: z.enum(ATTENDANCE_STATUS_CODES),
  labelEn: labelField,
  labelAr: labelField,
  color: colorField,
  countsTowardMetrics: z.boolean(),
  allowSelfCheckIn: z.boolean(),
  active: z.boolean(),
});

function validateStatuses(
  value: { statuses: readonly { code: string; active: boolean; countsTowardMetrics: boolean }[] },
  ctx: SettingRefinementCtx,
): void {
  reportDuplicates(
    ctx,
    value.statuses.map((entry) => entry.code),
    'statuses',
    'duplicate_code',
  );
  for (const pole of REQUIRED_STATUS_POLES) {
    const entry = value.statuses.find((candidate) => candidate.code === pole);
    if (entry?.active !== true) {
      ctx.addIssue({ code: 'custom', message: 'missing_pole', path: ['statuses'] });
    }
  }
  if (!value.statuses.some((entry) => entry.active && entry.countsTowardMetrics)) {
    ctx.addIssue({ code: 'custom', message: 'no_metric_status', path: ['statuses'] });
  }
}

export const attendanceStatusesValueSchema = z
  .strictObject({
    statuses: z
      .array(attendanceStatusEntrySchema)
      .min(1, 'too_few_entries')
      .max(SETTING_VALUE_BOUNDS.statusEntriesMax, 'too_many_entries'),
  })
  .superRefine(validateStatuses);

const sessionTypeEntrySchema = z.strictObject({
  code: settingCodeField,
  labelEn: labelField,
  labelAr: labelField,
  color: colorField,
  defaultDurationMinutes: z
    .number()
    .int('invalid_type')
    .min(SETTING_VALUE_BOUNDS.durationMinMinutes, 'out_of_range')
    .max(SETTING_VALUE_BOUNDS.durationMaxMinutes, 'out_of_range')
    .optional(),
  active: z.boolean(),
});

function validateSessionTypes(
  value: { types: readonly { code: string; active: boolean }[] },
  ctx: SettingRefinementCtx,
): void {
  reportDuplicates(
    ctx,
    value.types.map((entry) => entry.code),
    'types',
    'duplicate_code',
  );
  if (!value.types.some((entry) => entry.active)) {
    ctx.addIssue({ code: 'custom', message: 'no_active_entry', path: ['types'] });
  }
}

export const sessionTypesValueSchema = z
  .strictObject({
    types: z
      .array(sessionTypeEntrySchema)
      .min(1, 'too_few_entries')
      .max(SETTING_VALUE_BOUNDS.sessionTypesMax, 'too_many_entries'),
  })
  .superRefine(validateSessionTypes);

const scaleBandSchema = z.strictObject({
  key: settingCodeField,
  labelEn: labelField,
  labelAr: labelField,
  from: z.number().int('invalid_type'),
  to: z.number().int('invalid_type'),
});

function validateBands(
  bands: readonly ScaleBand[],
  min: number,
  max: number,
  ctx: SettingRefinementCtx,
): void {
  reportDuplicates(
    ctx,
    bands.map((band) => band.key),
    'bands',
    'duplicate_code',
  );
  bands.forEach((band, index) => {
    if (band.from > band.to || band.from < min || band.to > max) {
      ctx.addIssue({ code: 'custom', message: 'band_outside_scale', path: ['bands', index] });
    }
    const previous = bands[index - 1];
    if (previous !== undefined && band.from <= previous.to) {
      ctx.addIssue({ code: 'custom', message: 'band_overlap', path: ['bands', index] });
    }
  });
}

function validateScale(
  value: { min: number; max: number; step: number; bands?: readonly ScaleBand[] | undefined },
  ctx: SettingRefinementCtx,
): void {
  if (value.min >= value.max) {
    ctx.addIssue({ code: 'custom', message: 'min_not_below_max', path: ['min'] });
    return;
  }
  if ((value.max - value.min) % value.step !== 0) {
    ctx.addIssue({ code: 'custom', message: 'step_not_divisor', path: ['step'] });
  }
  validateBands(value.bands ?? [], value.min, value.max, ctx);
}

const scaleBoundField = z
  .number()
  .int('invalid_type')
  .min(SETTING_VALUE_BOUNDS.scaleFloor, 'out_of_range')
  .max(SETTING_VALUE_BOUNDS.scaleCeiling, 'out_of_range');

export const assessmentScaleValueSchema = z
  .strictObject({
    min: scaleBoundField,
    max: scaleBoundField,
    step: z.number().int('invalid_type').min(1, 'out_of_range'),
    bands: z
      .array(scaleBandSchema)
      .max(SETTING_VALUE_BOUNDS.bandsMax, 'too_many_entries')
      .optional(),
  })
  .superRefine(validateScale);

const badgeTierSchema = z.strictObject({
  key: settingCodeField,
  labelEn: labelField,
  labelAr: labelField,
  threshold: z
    .number()
    .int('invalid_type')
    .min(0, 'out_of_range')
    .max(SETTING_VALUE_BOUNDS.thresholdMax, 'out_of_range'),
  color: colorField,
});

function validateTiers(
  value: { tiers: readonly { key: string; threshold: number }[] },
  ctx: SettingRefinementCtx,
): void {
  reportDuplicates(
    ctx,
    value.tiers.map((tier) => tier.key),
    'tiers',
    'duplicate_code',
  );
  value.tiers.forEach((tier, index) => {
    const previous = value.tiers[index - 1];
    if (previous !== undefined && tier.threshold <= previous.threshold) {
      ctx.addIssue({ code: 'custom', message: 'threshold_not_ascending', path: ['tiers', index] });
    }
  });
}

export const badgeTiersValueSchema = z
  .strictObject({
    tiers: z
      .array(badgeTierSchema)
      .min(1, 'too_few_entries')
      .max(SETTING_VALUE_BOUNDS.tiersMax, 'too_many_entries'),
  })
  .superRefine(validateTiers);
