import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MemberAvatar } from './member-avatar.component';
import type { MemberAvatarView } from '../../types/members-view.types';

function buildAvatar(overrides: Partial<MemberAvatarView>): MemberAvatarView {
  return {
    label: 'Avatar',
    imageAlt: 'Photo of Omar',
    name: 'Omar',
    url: null,
    canUpload: false,
    uploadLabel: 'Change photo',
    uploadingLabel: 'Uploading',
    isUploading: false,
    onUpload: vi.fn(),
    ...overrides,
  };
}

describe('MemberAvatar', () => {
  it('shows the initials fallback and no upload when not permitted', () => {
    render(<MemberAvatar avatar={buildAvatar({})} />);
    expect(screen.getByTestId(TEST_IDS.memberAvatar)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.memberAvatarUpload)).not.toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.memberAvatarImage)).not.toBeInTheDocument();
  });

  it('renders a signed image that hides on error and offers upload', () => {
    const onUpload = vi.fn();
    render(
      <MemberAvatar avatar={buildAvatar({ url: 'https://x/y.png', canUpload: true, onUpload })} />,
    );
    const image = screen.getByTestId(TEST_IDS.memberAvatarImage);
    expect(image).toHaveAttribute('alt', 'Photo of Omar');
    fireEvent.error(image);
    expect(image).toHaveStyle({ display: 'none' });
    fireEvent.click(screen.getByTestId(TEST_IDS.memberAvatarUpload));
    expect(onUpload).toHaveBeenCalled();
  });

  it('shows the uploading label while a change is in flight', () => {
    render(<MemberAvatar avatar={buildAvatar({ canUpload: true, isUploading: true })} />);
    expect(screen.getByText('Uploading')).toBeInTheDocument();
  });
});
