import { TEST_IDS } from '@/shared/config';

export const SESSION_LIST_TEST_IDS = {
  list: TEST_IDS.sessionsList,
  item: TEST_IDS.sessionItem,
  revoke: TEST_IDS.sessionRevokeButton,
  revokeOthers: TEST_IDS.sessionsRevokeOthersButton,
  currentBadge: TEST_IDS.sessionsCurrentBadge,
} as const;
