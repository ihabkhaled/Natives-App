import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';

import { buildInvitationAcceptUrl } from './invitation-link.helper';

describe('buildInvitationAcceptUrl', () => {
  it('builds an absolute link from this build own origin', () => {
    expect(buildInvitationAcceptUrl('https://app.example.com', 'abc')).toBe(
      `https://app.example.com${APP_PATHS.acceptInvitation}?token=abc`,
    );
  });

  it('encodes the opaque token rather than trusting its alphabet', () => {
    expect(buildInvitationAcceptUrl('https://app.example.com', 'a+b/c=d')).toContain(
      'token=a%2Bb%2Fc%3Dd',
    );
  });

  it('works against a localhost origin with a port', () => {
    expect(buildInvitationAcceptUrl('http://localhost:5173', 'tok')).toBe(
      'http://localhost:5173/accept-invitation?token=tok',
    );
  });
});
