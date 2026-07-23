import { describe, expect, it, vi } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import { buildSuperAdminRows } from './platform-admins-view.helper';

const t = (key: string, params?: Record<string, string | number>): string =>
  params === undefined ? key : `${key}:${Object.values(params).join(',')}`;
const formatInstant = (iso: string): string => `at(${iso})`;

const ADMIN = {
  assignmentId: 'assignment-1',
  userId: 'user-1',
  email: 'root@example.com',
  displayName: 'Ranger One',
  effectiveFromIso: '2026-01-05T09:00:00.000Z',
  grantedBy: null,
};

describe('buildSuperAdminRows', () => {
  it('names each administrator with when and by whom the grant was made', () => {
    const rows = buildSuperAdminRows(t, formatInstant, [ADMIN], {
      canRevoke: true,
      onRevoke: vi.fn(),
    });

    expect(rows[0]?.name).toBe('Ranger One');
    expect(rows[0]?.email).toBe('root@example.com');
    expect(rows[0]?.sinceLabel).toBe(
      `${I18N_KEYS.adminPlatform.sinceLabel}:at(2026-01-05T09:00:00.000Z)`,
    );
    expect(rows[0]?.grantedByLabel).toBe(I18N_KEYS.adminPlatform.grantedBySystem);
    expect(rows[0]?.canRevoke).toBe(true);
  });

  it('falls back to the email when no display name exists and names the grantor', () => {
    const rows = buildSuperAdminRows(
      t,
      formatInstant,
      [{ ...ADMIN, displayName: null, grantedBy: 'user-0' }],
      { canRevoke: false, onRevoke: vi.fn() },
    );

    expect(rows[0]?.name).toBe('root@example.com');
    expect(rows[0]?.grantedByLabel).toBe(`${I18N_KEYS.adminPlatform.grantedByLabel}:user-0`);
    expect(rows[0]?.canRevoke).toBe(false);
  });

  it('wires the revoke with the row identity, not the whole record', () => {
    const onRevoke = vi.fn();
    const rows = buildSuperAdminRows(t, formatInstant, [ADMIN], { canRevoke: true, onRevoke });

    rows[0]?.onRevoke();

    expect(onRevoke).toHaveBeenCalledExactlyOnceWith('user-1', 'root@example.com');
  });
});
