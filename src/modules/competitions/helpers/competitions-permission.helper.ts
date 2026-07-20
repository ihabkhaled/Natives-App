import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

/**
 * Convenience grant checks for the competitions screens. The backend remains
 * the sole authority: it re-authorizes every read, every selection, and every
 * override regardless of what these return.
 */
export function canReadCompetitions(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.competitionRead]);
}

export function canManageCompetitions(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.competitionManage]);
}

export function canReadSquads(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.squadRead]);
}

export function canManageSquads(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.squadManage]);
}

/** Selecting a candidate the policy flags requires this grant plus a reason. */
export function canOverrideEligibility(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.squadOverrideEligibility]);
}

export function canReadRoster(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.rosterRead]);
}

export function canManageRoster(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.rosterManage]);
}

/** Locking a roster is its own grant, above plain management. */
export function canLockRoster(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.rosterLock]);
}
