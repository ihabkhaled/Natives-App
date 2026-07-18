import { TEST_IDS } from '@/shared/config';

export const SET_PASSWORD_FIELDS_TEST_IDS = {
  password: TEST_IDS.setPasswordInput,
  confirm: TEST_IDS.setPasswordConfirmInput,
  submit: TEST_IDS.setPasswordSubmitButton,
  error: TEST_IDS.setPasswordError,
  summary: TEST_IDS.setPasswordSummary,
  capsLock: TEST_IDS.setPasswordCapsLock,
} as const;
