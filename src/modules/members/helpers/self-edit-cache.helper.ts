import type { MemberProfile } from '../types/members.types';

export interface ProfilePatch {
  readonly fullName: string;
  readonly nickname: string | null;
  readonly jerseyNumber: number | null;
}

/**
 * Optimistically patch the cached profile with the edited identity fields so the
 * header and fields update instantly. Returns `undefined` when there is nothing
 * cached yet, matching TanStack Query's updater contract.
 */
export function patchProfileOptimistically(
  current: MemberProfile | undefined,
  patch: ProfilePatch,
): MemberProfile | undefined {
  if (current === undefined) {
    return undefined;
  }
  return {
    ...current,
    displayName: patch.fullName,
    fullName: patch.fullName,
    nickname: patch.nickname,
    jerseyNumber: patch.jerseyNumber,
  };
}
