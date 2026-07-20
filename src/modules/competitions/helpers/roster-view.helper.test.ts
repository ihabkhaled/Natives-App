import { describe, expect, it } from 'vitest';

import {
  buildAvailability,
  buildCandidate,
  buildSelection,
} from '../../../../tests/factories/competitions.factory';
import {
  buildAvailabilityRows,
  buildRosterColumns,
  buildRosterPanel,
  buildRosterRows,
  buildSelectionRoleMap,
} from './roster-view.helper';

const t = (key: string): string => key;

describe('buildSelectionRoleMap', () => {
  it('keeps only selections that are still live', () => {
    const map = buildSelectionRoleMap([
      buildSelection(),
      buildSelection({ selectionId: 'sel-2', membershipId: 'm-2', status: 'removed' }),
    ]);

    expect(map.has('m-1')).toBe(true);
    expect(map.has('m-2')).toBe(false);
  });
});

describe('buildRosterRows', () => {
  it('includes every selected player, even one with nothing recorded', () => {
    const rows = buildRosterRows(
      t,
      [
        buildCandidate({ selected: true }),
        buildCandidate({
          membershipId: 'm-2',
          fullName: 'Nour Kamal',
          selected: true,
          attendancePct: null,
          jerseyNumber: null,
          availability: null,
        }),
        buildCandidate({ membershipId: 'm-3', fullName: 'Bench Player' }),
      ],
      [buildSelection({ selectionRole: 'captain' })],
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]?.roleLabel).toBe('squads.roleCaptain');
    expect(rows[1]).toMatchObject({
      fullName: 'Nour Kamal',
      jerseyLabel: 'squads.jerseyNone',
      attendanceLabel: 'squads.notEnoughData',
      availabilityLabel: 'squads.availabilityUnknown',
      roleLabel: 'squads.rolePlayer',
    });
  });

  it('includes a player the selection list knows about even if the report lags', () => {
    const rows = buildRosterRows(
      t,
      [buildCandidate({ selected: false })],
      [buildSelection({ membershipId: 'm-1' })],
    );

    expect(rows).toHaveLength(1);
  });
});

describe('buildRosterColumns and buildRosterPanel', () => {
  it('expands every abbreviation in the column headers', () => {
    expect(buildRosterColumns(t)).toEqual([
      'squads.rosterNameColumn',
      'squads.rosterJerseyColumn',
      'squads.rosterRoleColumn',
      'squads.rosterAvailabilityColumn',
      'squads.rosterAttendanceColumn',
    ]);
  });

  it('always carries the pointer to the live roster screens', () => {
    const panel = buildRosterPanel(t, [], []);

    expect(panel.pendingNotice).toBe('squads.rosterPendingNotice');
    expect(panel.exportNote).toBe('squads.rosterExportNote');
    expect(panel.rows).toEqual([]);
  });
});

describe('buildAvailabilityRows', () => {
  it('names who declared each entry and keeps the reason', () => {
    const rows = buildAvailabilityRows(t, [
      buildAvailability(),
      buildAvailability({
        availabilityId: 'av-2',
        membershipId: 'm-2',
        availability: 'unavailable',
        source: 'coach',
        reason: 'Travelling',
      }),
    ]);

    expect(rows[0]?.sourceLabel).toBe('squads.availabilitySourceSelf');
    expect(rows[0]?.reason).toBeNull();
    expect(rows[1]).toMatchObject({
      availabilityLabel: 'squads.availabilityUnavailable',
      sourceLabel: 'squads.availabilitySourceCoach',
      reason: 'Travelling',
    });
  });
});
