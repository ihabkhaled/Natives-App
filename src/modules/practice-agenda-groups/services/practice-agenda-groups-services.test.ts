import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as gateway from '../gateways/practice-agenda-groups.gateway';
import { assignGroupMembers } from './assign-group-members.service';
import { copyAgenda } from './copy-agenda.service';
import { createGroup } from './create-group.service';
import { getAgendaGroupsPlan } from './get-agenda-groups-plan.service';
import { removeGroup } from './remove-group.service';
import { removeGroupMember } from './remove-group-member.service';

vi.mock('../gateways/practice-agenda-groups.gateway', () => ({
  requestAgendaGroupsPlan: vi.fn().mockResolvedValue({ blocks: [], groups: [] }),
  requestAgendaCopy: vi.fn().mockResolvedValue({}),
  requestCreateGroup: vi.fn().mockResolvedValue({}),
  requestRemoveGroup: vi.fn().mockResolvedValue(undefined),
  requestAssignGroupMembers: vi.fn().mockResolvedValue({}),
  requestRemoveGroupMember: vi.fn().mockResolvedValue(undefined),
}));

const PARAMS = { teamId: 't1', sessionId: 's1' };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('practice-agenda-groups services', () => {
  it('getAgendaGroupsPlan hands the params straight to the gateway', async () => {
    await getAgendaGroupsPlan(PARAMS);

    expect(gateway.requestAgendaGroupsPlan).toHaveBeenCalledWith(PARAMS);
  });

  it('copyAgenda carries the source session id through unchanged', async () => {
    const command = { ...PARAMS, sourceSessionId: 's2' };

    await copyAgenda(command);

    expect(gateway.requestAgendaCopy).toHaveBeenCalledWith(command);
  });

  it('createGroup carries every field of the command through unchanged', async () => {
    const command = { ...PARAMS, name: 'Reds', color: null, coachMembershipId: null, notes: null };

    await createGroup(command);

    expect(gateway.requestCreateGroup).toHaveBeenCalledWith(command);
  });

  it('removeGroup asks the gateway to drop one group', async () => {
    await removeGroup({ ...PARAMS, groupId: 'group-1' });

    expect(gateway.requestRemoveGroup).toHaveBeenCalledOnce();
  });

  it('assignGroupMembers carries the membership ids through unchanged', async () => {
    const command = { ...PARAMS, groupId: 'group-1', membershipIds: ['membership-1'] };

    await assignGroupMembers(command);

    expect(gateway.requestAssignGroupMembers).toHaveBeenCalledWith(command);
  });

  it('removeGroupMember asks the gateway to drop one membership', async () => {
    await removeGroupMember({ ...PARAMS, groupId: 'group-1', membershipId: 'membership-1' });

    expect(gateway.requestRemoveGroupMember).toHaveBeenCalledOnce();
  });
});
