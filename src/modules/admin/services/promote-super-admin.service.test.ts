import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestPromoteSuperAdmin } from '../gateways/platform-admins.gateway';
import { promoteSuperAdmin } from './promote-super-admin.service';

vi.mock('../gateways/platform-admins.gateway', () => ({ requestPromoteSuperAdmin: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('promoteSuperAdmin', () => {
  it('passes the target and the audited reason through and maps the grant', async () => {
    vi.mocked(requestPromoteSuperAdmin).mockResolvedValue({
      assignmentId: 'assignment-2',
      userId: 'user-2',
      email: 'tarek@example.com',
      displayName: null,
      effectiveFrom: '2026-07-20T10:00:00.000Z',
      grantedBy: 'user-1',
    });

    const granted = await promoteSuperAdmin('user-2', 'Succession planning');

    expect(requestPromoteSuperAdmin).toHaveBeenCalledExactlyOnceWith(
      'user-2',
      'Succession planning',
    );
    expect(granted.assignmentId).toBe('assignment-2');
    expect(granted.effectiveFromIso).toBe('2026-07-20T10:00:00.000Z');
  });

  it('normalizes a refusal into an AppError', async () => {
    vi.mocked(requestPromoteSuperAdmin).mockRejectedValue(new Error('boom'));

    await expect(promoteSuperAdmin('user-2', 'reason text')).rejects.toMatchObject({
      name: 'AppError',
    });
  });
});
