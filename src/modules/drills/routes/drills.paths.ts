import { APP_PATHS } from '@/shared/config';

export const DRILL_ID_PARAM = 'drillId';

/** The team's drill catalogue list route. */
export function drillsPath(): string {
  return APP_PATHS.drills;
}

/** The parameterised detail/edit route pattern registered with the router. */
export function drillDetailPattern(): string {
  return APP_PATHS.drillDetail;
}

/** A concrete detail path for one drill id. */
export function drillDetailPath(drillId: string): string {
  return APP_PATHS.drillDetail.replace(`:${DRILL_ID_PARAM}`, encodeURIComponent(drillId));
}
