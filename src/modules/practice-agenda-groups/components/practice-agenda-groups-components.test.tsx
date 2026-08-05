import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildGroupMemberRowView,
  buildGroupRowView,
  buildPracticeAgendaGroupsScreenView,
} from '../../../../tests/factories/practice-agenda-groups-view.factory';
import { AgendaGroupList } from './agenda-group-list';
import { AgendaGroupRow } from './agenda-group-row';
import { AgendaPlanBlocks } from './agenda-plan-blocks';
import { CopyAgendaForm } from './copy-agenda-form';
import { CreateGroupForm } from './create-group-form';

const view = buildPracticeAgendaGroupsScreenView();

describe('AgendaPlanBlocks', () => {
  it('names each block with its duration', () => {
    render(
      <AgendaPlanBlocks heading="Resolved plan" emptyLabel="Nothing yet" blocks={view.blocks} />,
    );

    expect(screen.getByRole('heading', { name: 'Resolved plan' })).toBeInTheDocument();
    expect(screen.getByText('Warm-up')).toBeInTheDocument();
    expect(screen.getAllByText('15 min')).toHaveLength(2);
  });

  it('shows no duration chip for an untimed block', () => {
    render(
      <AgendaPlanBlocks
        heading="Resolved plan"
        emptyLabel="Nothing yet"
        blocks={[{ ...view.blocks[0]!, durationLabel: null }]}
      />,
    );

    expect(screen.queryByText('15 min')).not.toBeInTheDocument();
  });

  it('names the group each station resolves to', () => {
    render(
      <AgendaPlanBlocks heading="Resolved plan" emptyLabel="Nothing yet" blocks={view.blocks} />,
    );

    expect(screen.getByText('Deep cuts')).toBeInTheDocument();
    // The shared chip prints the label twice: once for assistive tech, once visually.
    expect(screen.getAllByText('Handlers')).toHaveLength(2);
  });

  it('explains rather than lists when there is no agenda yet', () => {
    render(<AgendaPlanBlocks heading="Resolved plan" emptyLabel="Nothing yet" blocks={[]} />);

    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsPlanEmpty)).toHaveTextContent(
      'Nothing yet',
    );
  });
});

describe('AgendaGroupRow', () => {
  it('shows a colour swatch for a group that has one', () => {
    render(<AgendaGroupRow {...buildGroupRowView({ color: '#3b82f6' })} />);

    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsGroupSwatch)).toHaveStyle({
      backgroundColor: '#3b82f6',
    });
  });

  it('shows no swatch for a group with no colour', () => {
    render(<AgendaGroupRow {...buildGroupRowView({ color: null })} />);

    expect(screen.queryByTestId(TEST_IDS.practiceAgendaGroupsGroupSwatch)).not.toBeInTheDocument();
  });

  it('shows the empty-members copy for a group with nobody in it yet', () => {
    render(<AgendaGroupRow {...buildGroupRowView({ members: [] })} />);

    expect(screen.queryByTestId(TEST_IDS.practiceAgendaGroupsGroupMembers)).not.toBeInTheDocument();
    expect(screen.getByText('No members yet.')).toBeInTheDocument();
  });

  it('removes one member by its own membership id', () => {
    const onRemove = vi.fn();
    render(
      <AgendaGroupRow
        {...buildGroupRowView({ members: [buildGroupMemberRowView({ onRemove })] })}
      />,
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceAgendaGroupsMemberRemove));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('removes the group from its own button', () => {
    const onRemoveGroup = vi.fn();
    render(<AgendaGroupRow {...buildGroupRowView({ onRemoveGroup })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceAgendaGroupsGroupRemove));

    expect(onRemoveGroup).toHaveBeenCalledTimes(1);
  });

  it('disables the add-member submit until something is typed', async () => {
    render(<AgendaGroupRow {...buildGroupRowView({ canAddMember: false })} />);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsAddMemberSubmit)).toBeDisabled();
    });
  });

  it('runs the add-member command from its own button once enabled', () => {
    const onAddMember = vi.fn();
    render(<AgendaGroupRow {...buildGroupRowView({ canAddMember: true, onAddMember })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceAgendaGroupsAddMemberSubmit));

    expect(onAddMember).toHaveBeenCalledTimes(1);
  });
});

describe('AgendaGroupList', () => {
  it('draws one row per group', () => {
    render(
      <AgendaGroupList
        heading="Groups"
        emptyLabel="No groups"
        groups={[buildGroupRowView({ id: 'g1' }), buildGroupRowView({ id: 'g2' })]}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.practiceAgendaGroupsGroupRow)).toHaveLength(2);
  });

  it('explains rather than lists when there are no groups yet', () => {
    render(<AgendaGroupList heading="Groups" emptyLabel="No groups yet." groups={[]} />);

    expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsGroupsEmpty)).toHaveTextContent(
      'No groups yet.',
    );
  });
});

describe('CreateGroupForm', () => {
  it('disables the submit until a name is typed', async () => {
    render(<CreateGroupForm {...view.createForm} canSubmit={false} />);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCreateSubmit)).toBeDisabled();
    });
  });

  it('runs the create command once a name is typed', () => {
    const onSubmit = vi.fn();
    render(<CreateGroupForm {...view.createForm} canSubmit onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCreateSubmit));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('CopyAgendaForm', () => {
  it('disables the submit until a source session id is typed', async () => {
    render(<CopyAgendaForm {...view.copyForm} canSubmit={false} />);

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCopySubmit)).toBeDisabled();
    });
  });

  it('runs the copy command once a source session id is typed', () => {
    const onSubmit = vi.fn();
    render(<CopyAgendaForm {...view.copyForm} canSubmit onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceAgendaGroupsCopySubmit));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
