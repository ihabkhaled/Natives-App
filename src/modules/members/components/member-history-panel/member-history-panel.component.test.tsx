import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MemberHistoryPanel } from './member-history-panel.component';
import type { MemberHistoryPanelProps } from './member-history-panel.types';

function build(overrides: Partial<MemberHistoryPanelProps>): MemberHistoryPanelProps {
  return {
    heading: 'History',
    canView: true,
    emptyLabel: 'No changes',
    items: [
      {
        id: '1',
        transitionLabel: 'invited → active',
        reasonLabel: 'Reason: joined',
        actorLabel: 'System',
        timeLabel: 'Jul 19',
      },
    ],
    ...overrides,
  };
}

describe('MemberHistoryPanel', () => {
  it('hides when the viewer cannot see history', () => {
    const { container } = render(<MemberHistoryPanel {...build({ canView: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders timeline items with reasons', () => {
    render(<MemberHistoryPanel {...build({})} />);
    expect(screen.getByTestId(TEST_IDS.memberHistoryItem)).toBeInTheDocument();
    expect(screen.getByText('invited → active')).toBeInTheDocument();
    expect(screen.getByText('Reason: joined')).toBeInTheDocument();
  });

  it('shows an empty label with no history', () => {
    render(<MemberHistoryPanel {...build({ items: [] })} />);
    expect(screen.getByText('No changes')).toBeInTheDocument();
  });
});
