import { describe, expect, it } from 'vitest';

import {
  makeAttendanceSheet,
  makeQueuedOperation,
  makeRosterEntry,
} from '@/tests/msw/attendance-domain.fixture';
import { buildAttendanceEditorStub } from '@/tests/msw/attendance-editor.fixture';

import { ATTENDANCE_SHEET_STATE } from '../constants/attendance.constants';
import { buildAttendanceRows } from './attendance-row-view.helper';

const t = (key: string): string => key;

describe('buildAttendanceRows', () => {
  it('returns no rows when the sheet has not loaded', () => {
    const rows = buildAttendanceRows({
      t,
      locale: 'en',
      sheet: undefined,
      editor: buildAttendanceEditorStub(),
      queue: [],
    });

    expect(rows).toEqual([]);
  });

  it('shows lateness for a late row and excuse for an excused row', () => {
    const rows = buildAttendanceRows({
      t,
      locale: 'en',
      sheet: makeAttendanceSheet({
        items: [
          makeRosterEntry({ membershipId: 'm-late', status: 'present_late', latenessMinutes: 8 }),
          makeRosterEntry({
            membershipId: 'm-excused',
            status: 'excused',
            excuseCategory: 'travel',
          }),
        ],
      }),
      editor: buildAttendanceEditorStub(),
      queue: [],
    });

    const late = rows.find((row) => row.membershipId === 'm-late');
    const excused = rows.find((row) => row.membershipId === 'm-excused');
    expect(late?.showLateness).toBe(true);
    expect(late?.latenessMinutes).toBe('8');
    expect(excused?.showExcuse).toBe(true);
  });

  it('marks a rosterless historical entry and unlocks open sheets', () => {
    const [row] = buildAttendanceRows({
      t,
      locale: 'en',
      sheet: makeAttendanceSheet({
        items: [makeRosterEntry({ membershipId: 'm-hist', userId: null, status: 'excused' })],
      }),
      editor: buildAttendanceEditorStub(),
      queue: [],
    });

    expect(row?.isHistorical).toBe(true);
    expect(row?.isLocked).toBe(false);
  });

  it('surfaces a conflict message and selection/correction state from the editor', () => {
    const rows = buildAttendanceRows({
      t,
      locale: 'en',
      sheet: makeAttendanceSheet({ items: [makeRosterEntry({ membershipId: 'm-1' })] }),
      editor: buildAttendanceEditorStub({
        selectedIds: ['m-1'],
        drafts: {
          'm-1': {
            status: 'present_on_time',
            latenessMinutes: null,
            excuseCategory: null,
            expectedVersion: 1,
            correctionReason: 'fix scan',
          },
        },
      }),
      queue: [makeQueuedOperation({ membershipId: 'm-1', state: 'conflict', retryCount: 1 })],
    });

    expect(rows[0]?.conflictMessage).toBe('attendance.conflictMessage');
    expect(rows[0]?.queueState).toBe('conflict');
    expect(rows[0]?.isSelected).toBe(true);
    expect(rows[0]?.canSaveCorrection).toBe(true);
  });

  it('locks rows once the sheet is finalized', () => {
    const [row] = buildAttendanceRows({
      t,
      locale: 'en',
      sheet: makeAttendanceSheet({ state: ATTENDANCE_SHEET_STATE.finalized }),
      editor: buildAttendanceEditorStub(),
      queue: [],
    });

    expect(row?.isLocked).toBe(true);
  });

  it('filters rows by search text and status', () => {
    const loaded = makeAttendanceSheet({
      items: [
        makeRosterEntry({ membershipId: 'm-present', status: 'present_on_time' }),
        makeRosterEntry({ membershipId: 'm-absent', status: 'absent' }),
      ],
    });

    expect(
      buildAttendanceRows({
        t,
        locale: 'en',
        sheet: loaded,
        editor: buildAttendanceEditorStub({ searchValue: 'zzzz' }),
        queue: [],
      }),
    ).toEqual([]);

    const filtered = buildAttendanceRows({
      t,
      locale: 'en',
      sheet: loaded,
      editor: buildAttendanceEditorStub({ filterValue: 'absent' }),
      queue: [],
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.membershipId).toBe('m-absent');
  });
});
