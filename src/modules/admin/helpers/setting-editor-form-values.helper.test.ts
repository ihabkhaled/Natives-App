import { describe, expect, it } from 'vitest';

import type {
  AssessmentScaleValue,
  NotificationRulesValue,
  ReportBrandingValue,
  RosterLimitsValue,
} from '../types/setting-values.types';
import {
  addPositionLimit,
  brandingFieldPatch,
  channelPatch,
  normalizedRules,
  patchPositionLimit,
  patchQuietHours,
  patchRosterLimits,
  patchRuleByEvent,
  positionRows,
  scaleFieldPatch,
  setQuietHoursEnabled,
  withBands,
  withPositions,
} from './setting-editor-form-values.helper';

const SCALE: AssessmentScaleValue = { min: 1, max: 5, step: 1 };
const ROSTER: RosterLimitsValue = { roster: { min: 10, max: 27 }, matchSquad: { min: 7, max: 15 } };
const RULES: NotificationRulesValue = {
  rules: [
    {
      event: 'practice_reminder',
      enabled: true,
      channels: ['push'],
      leadHours: 24,
      recipients: 'members',
    },
  ],
};
const BRANDING: ReportBrandingValue = { displayName: 'Natives', accentColor: '#112233' };

describe('scaleFieldPatch and withBands', () => {
  it('patches a parsable scalar and keeps the previous number otherwise', () => {
    expect(scaleFieldPatch(SCALE, 'max', '10').max).toBe(10);
    expect(scaleFieldPatch(SCALE, 'max', 'nope')).toBe(SCALE);
  });

  it('replaces the band list', () => {
    const bands = [{ key: 'solid', labelEn: 'Solid', labelAr: 'ثابت', from: 1, to: 2 }];
    expect(withBands(SCALE, bands).bands).toBe(bands);
  });
});

describe('patchRosterLimits', () => {
  it('sets and clears the optional minimum', () => {
    expect(patchRosterLimits(ROSTER, 'roster', 'min', '12').roster.min).toBe(12);
    expect(patchRosterLimits(ROSTER, 'roster', 'min', '').roster.min).toBeUndefined();
  });

  it('updates a maximum and keeps it when the entry is unparsable', () => {
    expect(patchRosterLimits(ROSTER, 'roster', 'max', '30').roster.max).toBe(30);
    expect(patchRosterLimits(ROSTER, 'roster', 'max', 'nope').roster.max).toBe(27);
  });

  it('removes the whole match-squad group when its maximum is cleared', () => {
    expect(patchRosterLimits(ROSTER, 'matchSquad', 'max', '').matchSquad).toBeUndefined();
  });

  it('starts a match-squad group from the default when none exists', () => {
    const bare: RosterLimitsValue = { roster: { max: 27 } };
    expect(patchRosterLimits(bare, 'matchSquad', 'min', '7').matchSquad?.min).toBe(7);
  });
});

describe('position caps', () => {
  it('adds, patches, and lists position rows', () => {
    const withOne = addPositionLimit({ roster: { max: 27 } }, 'handler');
    expect(positionRows(withOne)).toEqual([{ positionKey: 'handler', max: 1 }]);
    expect(patchPositionLimit(withOne, 0, { max: 8 }).perPosition?.[0]?.max).toBe(8);
    expect(patchPositionLimit(withOne, 9, { max: 8 })).toBe(withOne);
    expect(withPositions(withOne, []).perPosition).toEqual([]);
  });
});

describe('notification rules', () => {
  it('normalizes to one rule per canonical event, defaults filled', () => {
    const rules = normalizedRules(RULES);
    expect(rules).toHaveLength(4);
    expect(rules[0]?.enabled).toBe(true);
    expect(rules[1]?.enabled).toBe(false);
    expect(rules[1]?.leadHours).toBeUndefined();
  });

  it('defaults a missing practice reminder with its mandatory lead time', () => {
    const rules = normalizedRules({ rules: [] });
    expect(rules[0]).toEqual({
      event: 'practice_reminder',
      enabled: false,
      channels: [],
      recipients: 'members',
      leadHours: 24,
    });
  });

  it('patches one rule by event', () => {
    const next = patchRuleByEvent(RULES, 'badge_awarded', { enabled: true });
    expect(next.rules.find((rule) => rule.event === 'badge_awarded')?.enabled).toBe(true);
  });

  it('toggles channels while keeping the push→email order stable', () => {
    const rule = RULES.rules[0]!;
    expect(channelPatch(rule, 'email', true).channels).toEqual(['push', 'email']);
    expect(channelPatch(rule, 'push', false).channels).toEqual([]);
  });

  it('enables quiet hours with an overnight default and clears them again', () => {
    const on = setQuietHoursEnabled(RULES, true);
    expect(on.quietHours).toEqual({ start: '22:00', end: '07:00' });
    expect(setQuietHoursEnabled(on, false).quietHours).toBeUndefined();
    expect(setQuietHoursEnabled(on, true).quietHours).toEqual({ start: '22:00', end: '07:00' });
  });

  it('patches one quiet-hours field, starting from the default when absent', () => {
    expect(patchQuietHours(RULES, 'start', '23:15').quietHours?.start).toBe('23:15');
    const withQuiet = setQuietHoursEnabled(RULES, true);
    expect(patchQuietHours(withQuiet, 'end', '06:30').quietHours?.end).toBe('06:30');
  });
});

describe('brandingFieldPatch', () => {
  it('keeps the display name verbatim, even blank (the schema flags it)', () => {
    expect(brandingFieldPatch(BRANDING, 'displayName', '').displayName).toBe('');
  });

  it('treats an emptied optional field as not provided', () => {
    expect(brandingFieldPatch(BRANDING, 'accentColor', '').accentColor).toBeUndefined();
  });

  it('sets an optional field', () => {
    expect(brandingFieldPatch(BRANDING, 'contactEmail', 'team@natives.example').contactEmail).toBe(
      'team@natives.example',
    );
  });
});
