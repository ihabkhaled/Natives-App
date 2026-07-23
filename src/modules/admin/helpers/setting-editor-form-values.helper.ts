import { replaceArrayItem } from '@/shared/ui';

import {
  LEAD_HOURS_EVENT,
  NOTIFICATION_EVENTS,
  type NotificationChannel,
  type NotificationEvent,
} from '../constants/setting-values.constants';
import type {
  AssessmentScaleValue,
  NotificationRule,
  NotificationRulesValue,
  PositionLimit,
  ReportBrandingValue,
  RosterLimitsValue,
  ScaleBand,
} from '../types/setting-values.types';
import { parseIntegerInput } from './numeric-input.helper';

/** Patch one scale scalar; an unparsable entry keeps the previous number. */
export function scaleFieldPatch(
  value: AssessmentScaleValue,
  field: 'min' | 'max' | 'step',
  raw: string,
): AssessmentScaleValue {
  const parsed = parseIntegerInput(raw);
  return parsed === undefined ? value : { ...value, [field]: parsed };
}

export function withBands(
  value: AssessmentScaleValue,
  bands: readonly ScaleBand[],
): AssessmentScaleValue {
  return { ...value, bands };
}

const DEFAULT_ROSTER_MAX = 27;

/**
 * Patch a roster bound field. `min` is optional (empty clears it); clearing a
 * `max` removes the whole optional match-squad group, while the roster group
 * always keeps a maximum.
 */
export function patchRosterLimits(
  value: RosterLimitsValue,
  group: 'roster' | 'matchSquad',
  field: 'min' | 'max',
  raw: string,
): RosterLimitsValue {
  const parsed = parseIntegerInput(raw);
  const bound = value[group] ?? { max: DEFAULT_ROSTER_MAX };
  if (field === 'min') {
    const { min: _min, ...rest } = bound;
    return { ...value, [group]: parsed === undefined ? rest : { ...rest, min: parsed } };
  }
  if (parsed === undefined) {
    return group === 'matchSquad' ? withoutMatchSquad(value) : value;
  }
  return { ...value, [group]: { ...bound, max: parsed } };
}

function withoutMatchSquad(value: RosterLimitsValue): RosterLimitsValue {
  const { matchSquad: _squad, ...rest } = value;
  return rest;
}

export function positionRows(value: RosterLimitsValue): readonly PositionLimit[] {
  return value.perPosition ?? [];
}

export function withPositions(
  value: RosterLimitsValue,
  positions: readonly PositionLimit[],
): RosterLimitsValue {
  return { ...value, perPosition: positions };
}

export function addPositionLimit(value: RosterLimitsValue, positionKey: string): RosterLimitsValue {
  return withPositions(value, [...positionRows(value), { positionKey, max: 1 }]);
}

export function patchPositionLimit(
  value: RosterLimitsValue,
  index: number,
  patch: Partial<PositionLimit>,
): RosterLimitsValue {
  const rows = positionRows(value);
  const row = rows[index];
  if (row === undefined) {
    return value;
  }
  return withPositions(value, replaceArrayItem(rows, index, { ...row, ...patch }));
}

const DEFAULT_LEAD_HOURS = 24;

function defaultRule(event: NotificationEvent): NotificationRule {
  return {
    event,
    enabled: false,
    channels: [],
    recipients: 'members',
    ...(event === LEAD_HOURS_EVENT ? { leadHours: DEFAULT_LEAD_HOURS } : {}),
  };
}

/** One rule per canonical event, defaults filled for the missing ones. */
export function normalizedRules(value: NotificationRulesValue): readonly NotificationRule[] {
  return NOTIFICATION_EVENTS.map(
    (event) => value.rules.find((rule) => rule.event === event) ?? defaultRule(event),
  );
}

export function patchRuleByEvent(
  value: NotificationRulesValue,
  event: NotificationEvent,
  patch: Partial<NotificationRule>,
): NotificationRulesValue {
  return {
    ...value,
    rules: normalizedRules(value).map((rule) =>
      rule.event === event ? { ...rule, ...patch } : rule,
    ),
  };
}

/** Toggle one channel on a rule, keeping the push→email order stable. */
export function channelPatch(
  rule: NotificationRule,
  channel: NotificationChannel,
  present: boolean,
): Partial<NotificationRule> {
  const without = rule.channels.filter((existing) => existing !== channel);
  return { channels: present ? [...without, channel] : without };
}

const DEFAULT_QUIET_HOURS = { start: '22:00', end: '07:00' } as const;

export function setQuietHoursEnabled(
  value: NotificationRulesValue,
  enabled: boolean,
): NotificationRulesValue {
  if (!enabled) {
    const { quietHours: _quiet, ...rest } = value;
    return rest;
  }
  return { ...value, quietHours: value.quietHours ?? DEFAULT_QUIET_HOURS };
}

export function patchQuietHours(
  value: NotificationRulesValue,
  field: 'start' | 'end',
  raw: string,
): NotificationRulesValue {
  const quietHours = value.quietHours ?? DEFAULT_QUIET_HOURS;
  return { ...value, quietHours: { ...quietHours, [field]: raw } };
}

type BrandingField = 'displayName' | 'logoMediaKey' | 'accentColor' | 'footerText' | 'contactEmail';

/**
 * Patch one branding field. Optional fields treat an emptied input as
 * "not provided" rather than an empty string the contract would reject.
 */
export function brandingFieldPatch(
  value: ReportBrandingValue,
  field: BrandingField,
  raw: string,
): ReportBrandingValue {
  if (field === 'displayName') {
    return { ...value, displayName: raw };
  }
  // Rebuild without the cleared key; the entries all come from the value, so
  // the narrowed cast is sound by construction.
  const cleared = Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== field),
  ) as unknown as ReportBrandingValue;
  return raw === '' ? cleared : { ...cleared, [field]: raw };
}
