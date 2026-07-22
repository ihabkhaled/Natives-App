import { describe, expect, it } from 'vitest';

import { buildCandidate } from '../../../../tests/factories/competitions.factory';
import {
  buildCandidateRow,
  buildRatioFacts,
  buildSignalChips,
  formatAttendance,
  formatAvailability,
  formatJersey,
  isOverrideReasonValid,
  needsOverride,
} from './eligibility-view.helper';

const LOCALE = 'en';

const t = (key: string): string => key;
const OPEN = { canSelect: true, canOverride: true, isLocked: false };

describe('formatAttendance', () => {
  it('says "not enough data" instead of printing a zero for a null percentage', () => {
    expect(formatAttendance(t, null, LOCALE)).toBe('squads.notEnoughData');
  });

  it('renders a real zero percentage as 0%, which is a measurement, not a gap', () => {
    expect(formatAttendance(t, 0, LOCALE)).toBe('0%');
  });

  it('rounds a fractional percentage', () => {
    expect(formatAttendance(t, 74.4, LOCALE)).toBe('74%');
  });
});

describe('formatAvailability and formatJersey', () => {
  it('reports an undeclared availability rather than guessing one', () => {
    expect(formatAvailability(t, null)).toBe('squads.availabilityUnknown');
  });

  it('maps a declared availability to its label key', () => {
    expect(formatAvailability(t, 'tentative')).toBe('squads.availabilityTentative');
  });

  it('reports an unassigned jersey instead of number zero', () => {
    expect(formatJersey(t, null, LOCALE)).toBe('squads.jerseyNone');
    expect(formatJersey(t, 12, LOCALE)).toBe('12');
  });
});

describe('buildSignalChips', () => {
  it('carries one chip per signal with its status label and tone', () => {
    const chips = buildSignalChips(t, buildCandidate());

    expect(chips).toEqual([
      {
        key: 'attendance',
        label: 'squads.signalAttendance',
        statusLabel: 'squads.signalPassed',
        tone: 'success',
      },
      {
        key: 'jersey',
        label: 'squads.signalJersey',
        statusLabel: 'squads.signalUnknown',
        tone: 'medium',
      },
    ]);
  });
});

describe('needsOverride', () => {
  it('is true only for an unselected candidate the policy failed', () => {
    expect(needsOverride(buildCandidate({ overall: 'failed' }))).toBe(true);
  });

  it('never treats missing data as a failure', () => {
    expect(needsOverride(buildCandidate({ overall: 'unknown' }))).toBe(false);
  });

  it('never asks for an override to remove someone already selected', () => {
    expect(needsOverride(buildCandidate({ overall: 'failed', selected: true }))).toBe(false);
  });
});

describe('buildCandidateRow', () => {
  it('offers selection for a passing candidate', () => {
    const row = buildCandidateRow(t, LOCALE, buildCandidate(), OPEN);

    expect(row.actionLabel).toBe('squads.selectLabel');
    expect(row.isActionDisabled).toBe(false);
    expect(row.overrideHint).toBeNull();
    expect(row.needsOverride).toBe(false);
  });

  it('still offers selection for a failed candidate, with the override hint', () => {
    const row = buildCandidateRow(t, LOCALE, buildCandidate({ overall: 'failed' }), OPEN);

    expect(row.isActionDisabled).toBe(false);
    expect(row.needsOverride).toBe(true);
    expect(row.overrideHint).toBe('squads.overrideNeeded');
  });

  it('explains rather than hides when the coach lacks the override grant', () => {
    const row = buildCandidateRow(t, LOCALE, buildCandidate({ overall: 'failed' }), {
      ...OPEN,
      canOverride: false,
    });

    expect(row.isActionDisabled).toBe(true);
    expect(row.overrideHint).toBe('squads.overrideBlocked');
  });

  it('disables every action while the squad is locked', () => {
    const row = buildCandidateRow(t, LOCALE, buildCandidate(), { ...OPEN, isLocked: true });

    expect(row.isActionDisabled).toBe(true);
  });

  it('disables selection without the manage grant', () => {
    const row = buildCandidateRow(t, LOCALE, buildCandidate(), { ...OPEN, canSelect: false });

    expect(row.isActionDisabled).toBe(true);
  });

  it('switches the action to remove once a player is in the squad', () => {
    const row = buildCandidateRow(t, LOCALE, buildCandidate({ selected: true }), OPEN);

    expect(row.actionLabel).toBe('squads.removeLabel');
    expect(row.isSelected).toBe(true);
  });

  it('never prints a zero for a candidate with no recorded data', () => {
    const row = buildCandidateRow(
      t,
      LOCALE,
      buildCandidate({ attendancePct: null, jerseyNumber: null, availability: null }),
      OPEN,
    );

    expect(row.attendanceLabel).toBe('squads.notEnoughData');
    expect(row.jerseyLabel).toBe('squads.jerseyNone');
    expect(row.availabilityLabel).toBe('squads.availabilityUnknown');
  });
});

describe('buildRatioFacts', () => {
  it('reports every division bucket, including the unknown one', () => {
    const facts = buildRatioFacts(t, LOCALE, {
      men: 5,
      women: 4,
      mixed: 1,
      unknown: 2,
      total: 12,
      balanced: false,
    });

    expect(facts.map((fact) => fact.value)).toEqual(['5', '4', '1', '2']);
  });
});

describe('isOverrideReasonValid', () => {
  it('rejects a reason shorter than the server minimum, whitespace included', () => {
    expect(isOverrideReasonValid('    ')).toBe(false);
    expect(isOverrideReasonValid('four')).toBe(false);
  });

  it('accepts a reason at or above the minimum', () => {
    expect(isOverrideReasonValid('needed for depth')).toBe(true);
  });
});
