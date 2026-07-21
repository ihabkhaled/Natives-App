import { describe, expect, it } from 'vitest';

import type { InviteFormView, InviteSentView } from '../../types/members-view.types';
import { resolveInvitePanel } from './member-invite-form.helper';

const SENT = { acceptUrl: 'https://app.example.com/accept' } as InviteSentView;

function view(isOpen: boolean, sent: InviteSentView | null): InviteFormView {
  return { isOpen, sent } as InviteFormView;
}

describe('resolveInvitePanel', () => {
  it('shows nothing while the block is closed', () => {
    expect(resolveInvitePanel(view(false, null))).toBe('closed');
  });

  it('shows the form while open with nothing sent yet', () => {
    expect(resolveInvitePanel(view(true, null))).toBe('form');
  });

  it('shows the receipt once the invitation exists', () => {
    expect(resolveInvitePanel(view(true, SENT))).toBe('sent');
  });

  it('never leaves a stale receipt behind after the block is dismissed', () => {
    expect(resolveInvitePanel(view(false, SENT))).toBe('closed');
  });
});
