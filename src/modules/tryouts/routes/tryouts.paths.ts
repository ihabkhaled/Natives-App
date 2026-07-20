import { APP_PATHS } from '@/shared/config';

export const TRYOUT_ID_PARAM = 'tryoutId';

/** Route pattern and navigation target for the public registration screen. */
export function tryoutRegistrationPath(): string {
  return APP_PATHS.tryoutRegistration;
}

/** Route pattern and navigation target for the staff tryout list. */
export function tryoutsPath(): string {
  return APP_PATHS.tryouts;
}

/** Route pattern for one tryout workspace. */
export function tryoutDetailPattern(): string {
  return APP_PATHS.tryoutDetail;
}

/** Navigation target for one tryout workspace. */
export function tryoutDetailPath(tryoutId: string): string {
  return APP_PATHS.tryoutDetail.replace(`:${TRYOUT_ID_PARAM}`, encodeURIComponent(tryoutId));
}
