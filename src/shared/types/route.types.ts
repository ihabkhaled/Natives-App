import type { ComponentType } from 'react';

import type { AppIconName } from '@/packages/icons';
import type { FeatureFlag } from '@/shared/config';
import type { I18nKey } from '@/shared/i18n';
import type { Permission } from '@/shared/security';

export const ROUTE_ACCESS = {
  Public: 'public',
  PublicOnly: 'public-only',
  Protected: 'protected',
} as const;

export type RouteAccess = (typeof ROUTE_ACCESS)[keyof typeof ROUTE_ACCESS];

/** Presence in the primary navigation, with its stable ordering and icon. */
export interface NavMeta {
  readonly order: number;
  readonly iconName: AppIconName;
  readonly labelKey: I18nKey;
}

/**
 * Typed route metadata. Convenience navigation and page chrome read this;
 * the backend remains the authority for every protected operation.
 */
export interface RouteMeta {
  /** Stable screen identifier, also used for analytics and test selectors. */
  readonly key: string;
  /** Document and page title key. */
  readonly titleKey: I18nKey;
  /** Permissions the effective session must hold (AND semantics). */
  readonly permissions: readonly Permission[];
  /** Whether the screen only makes sense inside an explicit team/season scope. */
  readonly requiresTeamContext: boolean;
  /** Whether the screen supports offline-aware reads. */
  readonly offline: boolean;
  /** Whether the shell should eagerly warm this route. */
  readonly preload: boolean;
  /** Feature flag gating the whole route, or null when always available. */
  readonly featureFlag: FeatureFlag | null;
  /** Primary-navigation placement, or null when the route is not a destination. */
  readonly nav: NavMeta | null;
}

export interface AppRouteDefinition {
  readonly path: string;
  readonly exact: boolean;
  readonly access: RouteAccess;
  readonly component: ComponentType;
  readonly meta?: RouteMeta;
}
