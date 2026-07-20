import { APP_ERROR_CODE, type AppErrorCode } from '@/shared/errors';

import type { MemberProfileStatus, MembersDirectoryStatus } from '../types/members-view.types';

interface DirectoryStatusInput {
  readonly hasData: boolean;
  readonly hasItems: boolean;
  readonly hasVisibleItems: boolean;
  readonly isLoading: boolean;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly isOffline: boolean;
}

/** Pure state machine deciding which single directory state to present. */
export function resolveDirectoryStatus(input: DirectoryStatusInput): MembersDirectoryStatus {
  if (input.isForbidden) {
    return 'forbidden';
  }
  if (input.hasData) {
    if (!input.hasItems) {
      return 'empty';
    }
    return input.hasVisibleItems ? 'ready' : 'noMatches';
  }
  if (input.isOffline) {
    return 'offline';
  }
  if (input.isLoading) {
    return 'loading';
  }
  return input.hasError ? 'error' : 'empty';
}

interface ProfileStatusInput {
  readonly hasData: boolean;
  readonly isLoading: boolean;
  readonly errorCode: AppErrorCode | null;
  readonly isOffline: boolean;
}

/** Pure state machine deciding which single profile state to present. */
export function resolveProfileStatus(input: ProfileStatusInput): MemberProfileStatus {
  if (input.errorCode === APP_ERROR_CODE.Forbidden) {
    return 'forbidden';
  }
  if (input.errorCode === APP_ERROR_CODE.NotFound) {
    return 'notFound';
  }
  if (input.hasData) {
    return 'ready';
  }
  if (input.isOffline) {
    return 'offline';
  }
  if (input.isLoading) {
    return 'loading';
  }
  return input.errorCode === null ? 'loading' : 'error';
}
