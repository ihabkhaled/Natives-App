import type { AsyncViewStatus } from '@/shared/ui';

import type { NotificationItem } from '../types/notifications.types';
import { isTargetAuthorized, resolveNotificationTarget } from './notification-target.helper';

/** What the arrival check concluded about a notification's destination. */
export type LinkOutcome = 'resolving' | 'authorized' | 'forbidden' | 'stale';

export interface LinkResolutionInput {
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly item: NotificationItem | undefined;
  readonly grantedPermissions: readonly string[];
}

export interface LinkResolution {
  readonly outcome: LinkOutcome;
  readonly path: string | null;
}

/**
 * The arrival decision, made before anything from the target is requested.
 *
 * A revoked permission is deliberately indistinguishable from a missing one:
 * both produce `forbidden` with no path, so a link can never confirm that the
 * target exists, let alone leak its contents. A notification whose target no
 * longer resolves is `stale` — also without a path.
 */
export function resolveLink(input: LinkResolutionInput): LinkResolution {
  if (input.isLoading) {
    return { outcome: 'resolving', path: null };
  }
  if (input.hasError || input.item === undefined) {
    return { outcome: 'stale', path: null };
  }
  const target = resolveNotificationTarget(input.item);
  if (target === null) {
    return { outcome: 'stale', path: null };
  }
  return isTargetAuthorized(target, input.grantedPermissions)
    ? { outcome: 'authorized', path: target.path }
    : { outcome: 'forbidden', path: null };
}

/** The single designed state the arrival screen presents for an outcome. */
export function linkStatusFor(outcome: LinkOutcome, isOffline: boolean): AsyncViewStatus {
  if (outcome === 'forbidden') {
    return 'forbidden';
  }
  if (outcome === 'stale') {
    return isOffline ? 'offline' : 'empty';
  }
  return 'loading';
}
