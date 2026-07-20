import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

/**
 * Convenience grant checks for the tryout screens. Contact details and
 * readiness notes are the two that matter most: the client hides them without
 * the grant, and the backend omits them from the payload regardless.
 */
export function canManageTryouts(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.tryoutManage]);
}

export function canReadTryoutContacts(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.tryoutContactsRead]);
}

export function canReadTryoutReadiness(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.tryoutReadinessRead]);
}

export function canEvaluateTryouts(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.tryoutEvaluate]);
}

export function canDecideTryouts(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.tryoutDecide]);
}

export function canConvertTryouts(granted: readonly string[]): boolean {
  return hasAllPermissions(granted, [PERMISSIONS.tryoutConvert]);
}
