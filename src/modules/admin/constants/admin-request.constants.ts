import { ADMIN_LIMITS } from './admin.constants';

/** The bounded window every rule listing asks for. */
export const RULE_PAGE_PARAMS = { limit: ADMIN_LIMITS.rules, offset: 0 } as const;
