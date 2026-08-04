import { apiUrl } from './mock-request.helper';
import { type Actor } from './members.fixture';

/**
 * Resolve the acting persona from the bearer token the way the real guards
 * resolve it from a verified JWT. Shared by the invitation and directory
 * handlers so both answer to one definition of who is calling.
 */
export function resolveActor(request: Request): Actor | null {
  const auth = request.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ') || auth.length <= 'Bearer '.length) {
    return null;
  }
  if (auth.includes('user-member')) {
    return { tier: 'member', userId: 'user-member' };
  }
  if (auth.includes('user-coach')) {
    return { tier: 'coach', userId: 'user-coach' };
  }
  return { tier: 'admin', userId: 'user-1' };
}

export function teamUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId${suffix}`);
}

export function membersUrl(suffix: string): string {
  return teamUrl(`/members${suffix}`);
}
