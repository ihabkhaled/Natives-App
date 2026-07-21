import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import type { RoleMatrix } from '../types/teams.types';
import {
  ALL_AREAS,
  buildAreaOptions,
  buildMatrixColumns,
  buildMatrixRows,
} from './permissions-matrix.helper';

const t = (key: string): string => key;

const MATRIX: RoleMatrix = {
  policyVersion: 5,
  permissions: [
    { key: 'practice.read', area: 'practices', description: 'View practices' },
    { key: 'member.list', area: 'members', description: 'List members' },
    { key: 'member.roles.manage', area: 'members', description: 'Manage roles' },
  ],
  roles: [
    {
      key: 'MEMBER',
      displayName: 'Member',
      description: 'Player access',
      isSystem: true,
      permissions: ['practice.read'],
    },
    {
      key: 'TEAM_ADMIN',
      displayName: 'Team administrator',
      description: 'Runs one team',
      isSystem: false,
      permissions: ['practice.read', 'member.list', 'member.roles.manage'],
    },
  ],
};

describe('buildAreaOptions', () => {
  it('offers "all areas" first, then each distinct area alphabetically', () => {
    expect(buildAreaOptions(t, MATRIX)).toEqual([
      { value: ALL_AREAS, label: I18N_KEYS.permissionsMatrix.allAreas },
      { value: 'members', label: 'members' },
      { value: 'practices', label: 'practices' },
    ]);
  });

  it('still offers the "all" sentinel before the matrix has loaded', () => {
    expect(buildAreaOptions(t, undefined)).toEqual([
      { value: ALL_AREAS, label: I18N_KEYS.permissionsMatrix.allAreas },
    ]);
  });
});

describe('buildMatrixColumns', () => {
  it('renders one column per role bundle, carrying the system flag', () => {
    expect(buildMatrixColumns(MATRIX)).toEqual([
      { key: 'MEMBER', label: 'Member', isSystem: true },
      { key: 'TEAM_ADMIN', label: 'Team administrator', isSystem: false },
    ]);
  });

  it('has no columns before the matrix loads', () => {
    expect(buildMatrixColumns(undefined)).toEqual([]);
  });
});

describe('buildMatrixRows', () => {
  it('reads each cell from the bundle own permission list', () => {
    const rows = buildMatrixRows(t, MATRIX, ALL_AREAS);
    const memberList = rows.find((row) => row.permission === 'member.list');

    expect(memberList?.cells).toEqual([
      { roleKey: 'MEMBER', isGranted: false, label: I18N_KEYS.permissionsMatrix.notGrantedLabel },
      { roleKey: 'TEAM_ADMIN', isGranted: true, label: I18N_KEYS.permissionsMatrix.grantedLabel },
    ]);
  });

  it('narrows to one area when asked', () => {
    const rows = buildMatrixRows(t, MATRIX, 'members');

    expect(rows.map((row) => row.permission)).toEqual(['member.list', 'member.roles.manage']);
  });

  it('keeps every permission when the filter is the sentinel', () => {
    expect(buildMatrixRows(t, MATRIX, ALL_AREAS)).toHaveLength(3);
  });

  it('carries each permission own description for the row heading', () => {
    expect(buildMatrixRows(t, MATRIX, 'practices')[0]).toMatchObject({
      area: 'practices',
      description: 'View practices',
    });
  });

  it('produces no rows before the matrix loads', () => {
    expect(buildMatrixRows(t, undefined, ALL_AREAS)).toEqual([]);
  });
});
