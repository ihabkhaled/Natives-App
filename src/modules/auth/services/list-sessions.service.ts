import { isHttpError } from '@/packages/http';
import { toAppError } from '@/shared/errors/app-error.helper';
import { mapHttpErrorToAppError } from '@/shared/mappers';

import { requestSessionList } from '../gateways/auth.gateway';
import { mapSessionListResponse } from '../mappers/session.mapper';
import type { DeviceSession } from '../types/auth.types';

/** Use case: load the account's active device sessions, deterministically ordered. */
export async function listSessions(): Promise<readonly DeviceSession[]> {
  try {
    const response = await requestSessionList();
    return mapSessionListResponse(response);
  } catch (error) {
    throw isHttpError(error) ? mapHttpErrorToAppError(error) : toAppError(error);
  }
}
