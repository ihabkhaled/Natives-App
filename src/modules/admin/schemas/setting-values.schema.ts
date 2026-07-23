import {
  safeParseWithSchema,
  schemaBuilder,
  type AppSchema,
  type SchemaParseResult,
} from '@/packages/schema';

import type { SettingKey } from '../constants/admin.constants';
import {
  ACCENT_COLOR_PATTERN,
  CONTACT_EMAIL_PATTERN,
  LEAD_HOURS_EVENT,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_EVENTS,
  NOTIFICATION_RECIPIENTS,
  QUIET_HOURS_PATTERN,
  SETTING_VALUE_BOUNDS,
} from '../constants/setting-values.constants';
import type {
  NotificationRule,
  SettingValueByKey,
  TypedSettingValue,
} from '../types/setting-values.types';
import {
  assessmentScaleValueSchema,
  attendanceStatusesValueSchema,
  badgeTiersValueSchema,
  reportDuplicates,
  sessionTypesValueSchema,
  settingCodeField,
  type SettingRefinementCtx,
} from './setting-values-collections.schema';

/**
 * The form-shaped halves of the per-key value schemas (P2) plus the registry
 * the editors, the raw-JSON fallback, and the MSW mirror all parse through.
 * Collection keys live in `setting-values-collections.schema.ts`.
 */
const z = schemaBuilder;

function hasTooManyDecimals(weight: number): boolean {
  const scaled = weight * SETTING_VALUE_BOUNDS.weightScale;
  return Math.abs(scaled - Math.round(scaled)) > SETTING_VALUE_BOUNDS.weightEpsilon;
}

function validateWeights(
  value: { weights: Record<string, number> },
  ctx: SettingRefinementCtx,
): void {
  for (const [code, weight] of Object.entries(value.weights)) {
    if (hasTooManyDecimals(weight)) {
      ctx.addIssue({ code: 'custom', message: 'too_many_decimals', path: ['weights', code] });
    }
  }
}

const attendanceWeightsValueSchema = z
  .strictObject({
    weights: z.record(settingCodeField, z.number().min(0, 'out_of_range').max(1, 'out_of_range')),
  })
  .superRefine(validateWeights);

const rosterBoundSchema = z.strictObject({
  min: z.number().int('invalid_type').min(1, 'out_of_range').optional(),
  max: z
    .number()
    .int('invalid_type')
    .min(1, 'out_of_range')
    .max(SETTING_VALUE_BOUNDS.rosterMax, 'out_of_range'),
});

const positionLimitSchema = z.strictObject({
  positionKey: settingCodeField,
  max: z.number().int('invalid_type').min(1, 'out_of_range'),
});

function validateBoundOrder(
  bound: { min?: number | undefined; max: number },
  path: string,
  ctx: SettingRefinementCtx,
): void {
  if (bound.min !== undefined && bound.min > bound.max) {
    ctx.addIssue({ code: 'custom', message: 'out_of_range', path: [path] });
  }
}

function validateSquad(value: SettingValueByKey['roster_limits'], ctx: SettingRefinementCtx): void {
  const squad = value.matchSquad;
  if (squad === undefined) {
    return;
  }
  if (squad.max < SETTING_VALUE_BOUNDS.matchSquadFloor) {
    ctx.addIssue({ code: 'custom', message: 'squad_below_line', path: ['matchSquad'] });
  }
  if (squad.max > value.roster.max) {
    ctx.addIssue({ code: 'custom', message: 'squad_exceeds_roster', path: ['matchSquad'] });
  }
  const positions = value.perPosition;
  if (squad.min !== undefined && positions !== undefined && positions.length > 0) {
    const capacity = positions.reduce((total, entry) => total + entry.max, 0);
    if (capacity < squad.min) {
      ctx.addIssue({
        code: 'custom',
        message: 'position_cap_below_squad_min',
        path: ['perPosition'],
      });
    }
  }
}

function validateRoster(
  value: SettingValueByKey['roster_limits'],
  ctx: SettingRefinementCtx,
): void {
  validateBoundOrder(value.roster, 'roster', ctx);
  if (value.matchSquad !== undefined) {
    validateBoundOrder(value.matchSquad, 'matchSquad', ctx);
  }
  reportDuplicates(
    ctx,
    (value.perPosition ?? []).map((entry) => entry.positionKey),
    'perPosition',
    'duplicate_code',
  );
  validateSquad(value, ctx);
}

const rosterLimitsValueSchema = z
  .strictObject({
    roster: rosterBoundSchema,
    matchSquad: rosterBoundSchema.optional(),
    perPosition: z.array(positionLimitSchema).optional(),
  })
  .superRefine(validateRoster);

const notificationRuleSchema = z.strictObject({
  event: z.enum(NOTIFICATION_EVENTS),
  enabled: z.boolean(),
  channels: z.array(z.enum(NOTIFICATION_CHANNELS)),
  leadHours: z
    .number()
    .int('invalid_type')
    .min(SETTING_VALUE_BOUNDS.leadHoursMin, 'out_of_range')
    .max(SETTING_VALUE_BOUNDS.leadHoursMax, 'out_of_range')
    .optional(),
  recipients: z.enum(NOTIFICATION_RECIPIENTS),
});

function validateNotificationRule(
  rule: NotificationRule,
  index: number,
  ctx: SettingRefinementCtx,
): void {
  if (rule.enabled && rule.channels.length === 0) {
    ctx.addIssue({ code: 'custom', message: 'no_channel', path: ['rules', index] });
  }
  reportDuplicates(ctx, rule.channels, `rules.${index}.channels`, 'duplicate_channel');
  if (rule.event === LEAD_HOURS_EVENT && rule.leadHours === undefined) {
    ctx.addIssue({ code: 'custom', message: 'lead_hours_required', path: ['rules', index] });
  }
  if (rule.event !== LEAD_HOURS_EVENT && rule.leadHours !== undefined) {
    ctx.addIssue({ code: 'custom', message: 'lead_hours_forbidden', path: ['rules', index] });
  }
}

function validateNotificationRules(
  value: SettingValueByKey['notification_rules'],
  ctx: SettingRefinementCtx,
): void {
  reportDuplicates(
    ctx,
    value.rules.map((rule) => rule.event),
    'rules',
    'duplicate_event',
  );
  value.rules.forEach((rule, index) => {
    validateNotificationRule(rule, index, ctx);
  });
  if (value.quietHours !== undefined && value.quietHours.start === value.quietHours.end) {
    ctx.addIssue({ code: 'custom', message: 'quiet_hours_equal', path: ['quietHours'] });
  }
}

const notificationRulesValueSchema = z
  .strictObject({
    rules: z.array(notificationRuleSchema),
    quietHours: z
      .strictObject({
        start: z.string().regex(QUIET_HOURS_PATTERN, 'invalid_time'),
        end: z.string().regex(QUIET_HOURS_PATTERN, 'invalid_time'),
      })
      .optional(),
  })
  .superRefine(validateNotificationRules);

const reportBrandingValueSchema = z.strictObject({
  displayName: z
    .string()
    .min(1, 'blank_text')
    .max(SETTING_VALUE_BOUNDS.displayNameMaxLength, 'out_of_range')
    .refine((name) => name.trim().length > 0, 'blank_text'),
  logoMediaKey: z
    .string()
    .min(1, 'blank_text')
    .max(SETTING_VALUE_BOUNDS.logoKeyMaxLength, 'out_of_range')
    .optional(),
  accentColor: z.string().regex(ACCENT_COLOR_PATTERN, 'invalid_accent_color').optional(),
  footerText: z.string().max(SETTING_VALUE_BOUNDS.footerMaxLength, 'out_of_range').optional(),
  contactEmail: z
    .string()
    .max(SETTING_VALUE_BOUNDS.emailMaxLength, 'out_of_range')
    .regex(CONTACT_EMAIL_PATTERN, 'invalid_email')
    .optional(),
});

/** One runtime schema per key; the mapped type proves domain agreement. */
export const settingValueSchemas: {
  readonly [K in SettingKey]: AppSchema<SettingValueByKey[K], unknown>;
} = {
  attendance_statuses: attendanceStatusesValueSchema,
  session_types: sessionTypesValueSchema,
  attendance_weights: attendanceWeightsValueSchema,
  assessment_scale: assessmentScaleValueSchema,
  badge_tiers: badgeTiersValueSchema,
  roster_limits: rosterLimitsValueSchema,
  notification_rules: notificationRulesValueSchema,
  report_branding: reportBrandingValueSchema,
};

/** Discriminated client-side parse of one setting document. */
export function parseTypedSettingValue(
  key: SettingKey,
  value: unknown,
): SchemaParseResult<TypedSettingValue> {
  const schema = settingValueSchemas[key] as AppSchema<TypedSettingValue, unknown>;
  return safeParseWithSchema(schema, value);
}
