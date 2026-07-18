import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AvatarFallback } from './avatar-fallback.component';
import { AVATAR_FALLBACK_DEFAULT_TEST_ID } from './avatar-fallback.constants';

function getFallbackIcon(): Element | null {
  return document.body.querySelector('ion-icon');
}

describe('AvatarFallback', () => {
  it('shows derived initials with an accessible label and default test id', () => {
    render(<AvatarFallback label="Mohamed Refaat" name="Mohamed Refaat" />);

    const avatar = screen.getByRole('img', { name: 'Mohamed Refaat' });
    expect(avatar).toHaveTextContent('MR');
    expect(screen.getByTestId(AVATAR_FALLBACK_DEFAULT_TEST_ID)).toBe(avatar);
  });

  it('falls back to a person icon when no name is provided', () => {
    render(<AvatarFallback label="Member avatar" testId="empty-avatar" />);

    const avatar = screen.getByTestId('empty-avatar');
    expect(avatar).toHaveAccessibleName('Member avatar');
    expect(getFallbackIcon()).not.toBeNull();
    expect(avatar.textContent).toBe('');
  });

  it('applies the requested size variant', () => {
    render(<AvatarFallback label="a" name="a" size="lg" testId="big-avatar" />);

    expect(screen.getByTestId('big-avatar').className).toContain('size-16');
  });
});
