import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MemberAliasesPanel } from './member-aliases-panel.component';
import type { MemberAliasesPanelProps } from './member-aliases-panel.types';

function build(overrides: Partial<MemberAliasesPanelProps>): MemberAliasesPanelProps {
  return {
    heading: 'Aliases',
    canManage: true,
    emptyLabel: 'No aliases',
    items: [{ id: 'a1', alias: 'O-Train', removeLabel: 'Remove O-Train' }],
    addLabel: 'Add alias',
    addPlaceholder: 'name',
    draft: '',
    onDraftChange: vi.fn(),
    addButtonLabel: 'Add',
    isBusy: false,
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  };
}

describe('MemberAliasesPanel', () => {
  it('hides for non-managers', () => {
    const { container } = render(<MemberAliasesPanel {...build({ canManage: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('adds and removes aliases', () => {
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    render(<MemberAliasesPanel {...build({ onAdd, onRemove })} />);
    fireEvent.click(screen.getByTestId(TEST_IDS.memberAliasAdd));
    expect(onAdd).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId(TEST_IDS.memberAliasRemove));
    expect(onRemove).toHaveBeenCalledWith('a1');
  });

  it('shows an empty label with no aliases', () => {
    render(<MemberAliasesPanel {...build({ items: [] })} />);
    expect(screen.getByText('No aliases')).toBeInTheDocument();
  });
});
