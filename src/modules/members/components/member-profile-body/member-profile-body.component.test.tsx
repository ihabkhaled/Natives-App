import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';
import { buildMemberProfileView } from '../../../../../tests/factories/members-view.factory';

import { MemberProfileBody } from './member-profile-body.component';

describe('MemberProfileBody', () => {
  it('renders the identity header, fields, and manager panels', () => {
    render(
      <MemberProfileBody
        {...buildMemberProfileView({
          lifecycle: { ...buildMemberProfileView().lifecycle, canManage: true },
          roles: { ...buildMemberProfileView().roles, canManage: true },
          aliases: { ...buildMemberProfileView().aliases, canManage: true },
          history: { ...buildMemberProfileView().history, canView: true },
          selfEdit: { ...buildMemberProfileView().selfEdit, canEdit: true },
        })}
      />,
    );
    expect(screen.getByText('Omo')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberProfileFields)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberLifecyclePanel)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberRolesPanel)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberAliasesPanel)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberHistoryPanel)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberSelfEditOpen)).toBeInTheDocument();
  });

  it('omits the header when none is provided', () => {
    render(<MemberProfileBody {...buildMemberProfileView({ header: null })} />);
    expect(screen.queryByText('Omo')).not.toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.memberProfileFields)).toBeInTheDocument();
  });
});
