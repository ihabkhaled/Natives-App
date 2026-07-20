import { APP_PATHS } from '@/shared/config';

/** The path-parameter name for a membership id (without the leading colon). */
export const MEMBER_MEMBERSHIP_ID_PARAM = 'membershipId';

/** The member directory list route. */
export function membersPath(): string {
  return APP_PATHS.members;
}

/** The parameterised profile route pattern registered with the router. */
export function memberProfilePattern(): string {
  return APP_PATHS.memberProfile;
}

/** A concrete profile path for one membership id. */
export function memberProfilePath(membershipId: string): string {
  return APP_PATHS.memberProfile.replace(
    `:${MEMBER_MEMBERSHIP_ID_PARAM}`,
    encodeURIComponent(membershipId),
  );
}
