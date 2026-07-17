import { TEST_IDS } from '@/shared/config';

export const LOGIN_FORM_TEST_IDS = {
  email: TEST_IDS.loginEmailInput,
  password: TEST_IDS.loginPasswordInput,
  submit: TEST_IDS.loginSubmitButton,
  error: TEST_IDS.loginErrorMessage,
} as const;
