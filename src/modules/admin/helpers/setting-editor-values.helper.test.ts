import { describe, expect, it, vi } from 'vitest';

import type {
  AttendanceStatusesValue,
  BadgeTiersValue,
  SessionTypesValue,
} from '../types/setting-values.types';
import {
  addBadgeTier,
  addScaleBand,
  addSessionType,
  addStatusEntry,
  buildRowControls,
  firstOptionValue,
  isCollectionBinding,
  patchBadgeTier,
  patchScaleBand,
  patchSessionType,
  patchStatusEntry,
  setWeight,
  statusCodePatch,
  statusOptionsFor,
  unusedStatusCodes,
} from './setting-editor-values.helper';

const STATUSES: AttendanceStatusesValue = {
  statuses: [
    {
      code: 'present_on_time',
      labelEn: 'On time',
      labelAr: 'في الموعد',
      color: 'success',
      countsTowardMetrics: true,
      allowSelfCheckIn: true,
      active: true,
    },
  ],
};

const TYPES: SessionTypesValue = {
  types: [
    { code: 'practice', labelEn: 'Practice', labelAr: 'تدريب', color: 'primary', active: true },
  ],
};

const TIERS: BadgeTiersValue = {
  tiers: [
    { key: 'bronze', labelEn: 'Bronze', labelAr: 'برونزي', threshold: 100, color: 'accent2' },
  ],
};

describe('status entries', () => {
  it('lists unused canonical codes in canonical order', () => {
    expect(unusedStatusCodes(STATUSES)[0]).toBe('present_late');
    expect(unusedStatusCodes(STATUSES)).not.toContain('present_on_time');
  });

  it('adds the first unused canonical code, active and blank-labelled', () => {
    const next = addStatusEntry(STATUSES);
    expect(next.statuses).toHaveLength(2);
    expect(next.statuses[1]?.code).toBe('present_late');
  });

  it('refuses to add a status when all seven codes are used', () => {
    let full = STATUSES;
    for (let step = 0; step < 6; step += 1) {
      full = addStatusEntry(full);
    }
    expect(full.statuses).toHaveLength(7);
    expect(addStatusEntry(full)).toBe(full);
  });

  it('patches one entry and ignores an out-of-range index', () => {
    expect(patchStatusEntry(STATUSES, 0, { active: false }).statuses[0]?.active).toBe(false);
    expect(patchStatusEntry(STATUSES, 9, { active: false })).toBe(STATUSES);
  });

  it('accepts only canonical codes from the select', () => {
    expect(statusCodePatch('absent')).toEqual({ code: 'absent' });
    expect(statusCodePatch('vibes')).toEqual({});
  });

  it('offers a row its own code plus the unused ones', () => {
    const options = statusOptionsFor(
      [
        { value: 'present_on_time', label: 'On time' },
        { value: 'absent', label: 'Absent' },
      ],
      { statuses: [...STATUSES.statuses, { ...STATUSES.statuses[0]!, code: 'absent' }] },
      'present_on_time',
    );
    expect(options.map((option) => option.value)).toEqual(['present_on_time']);
  });
});

describe('session types', () => {
  it('adds a uniquely coded blank type and patches by index', () => {
    const next = addSessionType(TYPES);
    expect(next.types[1]?.code).toBe('session_2');
    expect(addSessionType(next).types[2]?.code).toBe('session_3');
    expect(patchSessionType(TYPES, 0, { code: 'gym' }).types[0]?.code).toBe('gym');
    expect(patchSessionType(TYPES, 9, { code: 'gym' })).toBe(TYPES);
  });

  it('skips an occupied placeholder code', () => {
    const occupied = patchSessionType(addSessionType(TYPES), 1, { code: 'session_3' });
    const next = addSessionType(occupied);
    expect(next.types[2]?.code).toBe('session_4');
  });
});

describe('weights', () => {
  it('sets and clears one status weight', () => {
    const set = setWeight({ weights: {} }, 'absent', 0.25);
    expect(set.weights['absent']).toBe(0.25);
    expect(setWeight(set, 'absent', null).weights).toEqual({});
  });
});

describe('scale bands', () => {
  it('appends after the last band, clamped to the ceiling', () => {
    expect(addScaleBand([], 5)[0]).toMatchObject({ from: 0, to: 0 });
    const bands = addScaleBand(
      [{ key: 'solid', labelEn: 'Solid', labelAr: 'ثابت', from: 1, to: 5 }],
      5,
    );
    expect(bands[1]).toMatchObject({ from: 5, to: 5 });
  });

  it('patches one band and ignores an out-of-range index', () => {
    const bands = [{ key: 'solid', labelEn: 'Solid', labelAr: 'ثابت', from: 1, to: 2 }];
    expect(patchScaleBand(bands, 0, { to: 3 })[0]?.to).toBe(3);
    expect(patchScaleBand(bands, 5, { to: 3 })).toBe(bands);
  });
});

describe('badge tiers', () => {
  it('appends one point above the previous top and patches by index', () => {
    expect(addBadgeTier(TIERS).tiers[1]?.threshold).toBe(101);
    expect(addBadgeTier({ tiers: [] }).tiers[0]?.threshold).toBe(0);
    expect(patchBadgeTier(TIERS, 0, { threshold: 250 }).tiers[0]?.threshold).toBe(250);
    expect(patchBadgeTier(TIERS, 9, { threshold: 250 })).toBe(TIERS);
  });
});

describe('buildRowControls', () => {
  const labels = { moveUp: 'up', moveDown: 'down', remove: 'remove' };

  it('bounds movement to the list and wires the callbacks', () => {
    const onMove = vi.fn();
    const onRemove = vi.fn();
    const controls = buildRowControls({ index: 0, count: 2, labels, onMove, onRemove });

    expect(controls.canMoveUp).toBe(false);
    expect(controls.canMoveDown).toBe(true);
    expect(controls.removeLabel).toBe('remove');
    controls.onMoveUp();
    controls.onMoveDown();
    controls.onRemove?.();
    expect(onMove).toHaveBeenCalledWith(0, -1);
    expect(onMove).toHaveBeenCalledWith(0, 1);
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('hides removal for archive-not-delete editors', () => {
    const controls = buildRowControls({
      index: 1,
      count: 2,
      labels,
      onMove: vi.fn(),
      onRemove: null,
    });
    expect(controls.removeLabel).toBeNull();
    expect(controls.onRemove).toBeNull();
    expect(controls.canMoveDown).toBe(false);
  });
});

describe('firstOptionValue', () => {
  it('returns the head option value, or empty for no options', () => {
    expect(firstOptionValue([{ value: 'handler', label: 'Handler' }])).toBe('handler');
    expect(firstOptionValue([])).toBe('');
  });
});

describe('isCollectionBinding', () => {
  it('splits the editor union between collections and forms', () => {
    expect(
      isCollectionBinding({ settingKey: 'badge_tiers', value: TIERS, onChange: () => undefined }),
    ).toBe(true);
    expect(
      isCollectionBinding({
        settingKey: 'attendance_weights',
        value: { weights: {} },
        onChange: () => undefined,
      }),
    ).toBe(false);
  });
});
