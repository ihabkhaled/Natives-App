import type { ComponentType } from 'react';

export const ROUTE_ACCESS = {
  Public: 'public',
  PublicOnly: 'public-only',
  Protected: 'protected',
} as const;

export type RouteAccess = (typeof ROUTE_ACCESS)[keyof typeof ROUTE_ACCESS];

export interface AppRouteDefinition {
  readonly path: string;
  readonly exact: boolean;
  readonly access: RouteAccess;
  readonly component: ComponentType;
}
