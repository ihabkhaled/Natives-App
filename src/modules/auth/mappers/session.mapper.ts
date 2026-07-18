import type { SchemaOutput } from '@/packages/schema';

import type { sessionDtoSchema, sessionListResponseSchema } from '../schemas/auth.schema';
import type { DeviceSession } from '../types/auth.types';

/** Pure DTO → domain mapping for a single device session. */
export function mapSessionDto(dto: SchemaOutput<typeof sessionDtoSchema>): DeviceSession {
  return {
    id: dto.id,
    device: dto.device,
    approxLocation: dto.approxLocation,
    lastActiveAtIso: dto.lastActiveAt,
    isCurrent: dto.current,
  };
}

/** Deterministic ordering: the current device first, then most recent activity. */
function compareSessions(first: DeviceSession, second: DeviceSession): number {
  if (first.isCurrent !== second.isCurrent) {
    return first.isCurrent ? -1 : 1;
  }
  return second.lastActiveAtIso.localeCompare(first.lastActiveAtIso);
}

export function mapSessionListResponse(
  dto: SchemaOutput<typeof sessionListResponseSchema>,
): readonly DeviceSession[] {
  return dto.sessions.map(mapSessionDto).sort(compareSessions);
}
