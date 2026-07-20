import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';
import { fireIonInput } from '../../../../../tests/setup/ionic-events.helper';

import { LIFECYCLE_ACTION } from '../../constants/members.constants';
import { MemberLifecyclePanel } from './member-lifecycle-panel.component';
import type { MemberLifecyclePanelProps } from './member-lifecycle-panel.types';

function build(overrides: Partial<MemberLifecyclePanelProps>): MemberLifecyclePanelProps {
  return {
    heading: 'Membership',
    canManage: true,
    noActionsLabel: 'No actions',
    actions: [{ action: LIFECYCLE_ACTION.suspend, label: 'Suspend', tone: 'danger' }],
    isSubmitting: false,
    reasonLabel: 'Reason',
    reasonPlaceholder: 'why',
    reason: '',
    onReasonChange: vi.fn(),
    onAction: vi.fn(),
    ...overrides,
  };
}

describe('MemberLifecyclePanel', () => {
  it('hides for non-managers', () => {
    const { container } = render(<MemberLifecyclePanel {...build({ canManage: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('runs an action and edits the reason', () => {
    const onAction = vi.fn();
    const onReasonChange = vi.fn();
    render(<MemberLifecyclePanel {...build({ onAction, onReasonChange })} />);
    fireIonInput(screen.getByTestId(TEST_IDS.memberLifecycleReason), 'left team');
    expect(onReasonChange).toHaveBeenCalledWith('left team');
    fireEvent.click(screen.getByTestId(TEST_IDS.memberLifecycleAction));
    expect(onAction).toHaveBeenCalledWith(LIFECYCLE_ACTION.suspend);
  });

  it('shows a no-actions notice when empty', () => {
    render(<MemberLifecyclePanel {...build({ actions: [] })} />);
    expect(screen.getByText('No actions')).toBeInTheDocument();
  });
});
