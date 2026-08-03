import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_ASSIGNABLE_ROLES } from '@/tests/msw/role-assignments.fixture';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { listAssignableRoles } from '../services/list-assignable-roles.service';
import { useGrantPanel } from './use-grant-panel.hook';

vi.mock('../services/list-assignable-roles.service', () => ({ listAssignableRoles: vi.fn() }));

const t = (key: string): string => `t:${key}`;

function renderPanel(
  targetUserId = 'user-1',
  canManage = true,
  onGrant: (input: { userId: string; roleKey: string }) => void = () => undefined,
): ReturnType<typeof renderHookWithProviders<ReturnType<typeof useGrantPanel>>> {
  return renderHookWithProviders(() =>
    useGrantPanel(t, 'team-1', canManage, { targetUserId, isGranting: false, onGrant }),
  );
}

/** Wait for the server catalog to land, then pick one of its roles. */
async function chooseRole(
  result: { readonly current: ReturnType<typeof useGrantPanel> },
  slug: string,
): Promise<void> {
  await waitFor(() => {
    expect(result.current?.options).toHaveLength(3);
  });
  act(() => {
    result.current?.onRoleChange(slug);
  });
}

beforeEach(() => {
  vi.mocked(listAssignableRoles).mockResolvedValue(MOCK_ASSIGNABLE_ROLES);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useGrantPanel', () => {
  it('is absent until a target user is named', () => {
    expect(renderPanel('').result.current).toBeNull();
  });

  it('is absent — not disabled — for a principal who may not grant', () => {
    // A greyed-out escalation control invites someone to find the way to
    // enable it; an absent one says nothing at all.
    expect(renderPanel('user-1', false).result.current).toBeNull();
    expect(listAssignableRoles).not.toHaveBeenCalled();
  });

  it('offers exactly the roles the server said the actor may grant', async () => {
    const { result } = renderPanel();

    await waitFor(() => {
      expect(result.current?.options).toHaveLength(3);
    });
    // SUPER_ADMIN is absent because the endpoint never returned it — not
    // because the client filtered it out.
    expect(result.current?.options.map((option) => option.value)).toEqual([
      'member',
      'coach',
      'scorekeeper',
    ]);
  });

  it('cannot submit before a role has been chosen', async () => {
    const { result } = renderPanel();

    await waitFor(() => {
      expect(result.current?.options).toHaveLength(3);
    });
    expect(result.current?.canSubmit).toBe(false);
  });

  it('submits the chosen role in the wire’s own casing', async () => {
    const onGrant = vi.fn();
    const { result } = renderPanel('user-1', true, onGrant);

    await chooseRole(result, 'coach');
    await waitFor(() => {
      expect(result.current?.canSubmit).toBe(true);
    });
    act(() => {
      result.current?.onSubmit();
    });

    expect(onGrant).toHaveBeenCalledWith({ userId: 'user-1', roleKey: 'COACH' });
  });

  it('sends nothing when the catalog does not offer the selected role', async () => {
    // The actor's own access can be reduced while this form sits open, so the
    // selection is re-checked at submit rather than trusted from render time.
    vi.mocked(listAssignableRoles).mockResolvedValue([]);
    const onGrant = vi.fn();
    const { result } = renderPanel('user-1', true, onGrant);

    await waitFor(() => {
      expect(result.current?.emptyCatalogMessage).not.toBeNull();
    });
    act(() => {
      result.current?.onRoleChange('coach');
    });
    act(() => {
      result.current?.onSubmit();
    });

    expect(onGrant).not.toHaveBeenCalled();
  });

  it('does nothing when submitted before a role is chosen', async () => {
    const onGrant = vi.fn();
    const { result } = renderPanel('user-1', true, onGrant);

    await waitFor(() => {
      expect(result.current?.options).toHaveLength(3);
    });
    act(() => {
      result.current?.onSubmit();
    });

    expect(onGrant).not.toHaveBeenCalled();
  });

  it('holds the submit still while a grant is already in flight', async () => {
    const { result } = renderHookWithProviders(() =>
      useGrantPanel(t, 'team-1', true, {
        targetUserId: 'user-1',
        isGranting: true,
        onGrant: vi.fn(),
      }),
    );

    await chooseRole(result, 'coach');

    expect(result.current?.isGranting).toBe(true);
    expect(result.current?.canSubmit).toBe(false);
  });

  it('says plainly when the actor holds nothing they may pass on', async () => {
    vi.mocked(listAssignableRoles).mockResolvedValue([]);
    const { result } = renderPanel();

    await waitFor(() => {
      expect(result.current?.emptyCatalogMessage).toBe('t:adminRoles.noAssignable');
    });
    expect(result.current?.canSubmit).toBe(false);
  });

  it('carries the ceiling notice as a standing advisory, not an after-the-fact error', () => {
    const { result } = renderPanel();

    expect(result.current?.ceilingNotice).toBe('t:adminRoles.ceilingNotice');
    expect(result.current?.heading).toBe('t:adminRoles.assignableHeading');
  });
});
